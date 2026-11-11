/* PACE · E2E · una pestaña que despierta no cuenta otra vez un bloque ya contado (ChatGPT, 9 nov., punto 5)
 * ======================================================================================================
 * A y B llevan el mismo bloque X. A se duerme; B termina X, empieza Y y lo termina; pasan los diez
 * minutos del candado de X y A despierta. Al despertar le llegan a la vez dos cosas: su reloj, que
 * ve X acabado y quiere contarlo, y lo que B dejó dicho mientras dormía (el estado guardado y el
 * aviso de que empezó Y). El navegador no promete en qué orden.
 *
 * · Si llegan antes los avisos, A sabe que su bloque es Y, y Y ya está contado: no pasa nada.
 * · Si llega antes el reloj, A cuenta X: `focoContado` ya dice Y (solo recuerda el último) y el
 *   candado de X se soltó a los diez minutos. Medido contra la 0.195.0: 3 bloques en vez de 2.
 *   Por eso se guardan los últimos veinte (`focoContados`), y se miran también en lo guardado: si
 *   los avisos llegan tarde, lo guardado es lo único que sabe esa pestaña.
 *
 * POR QUÉ SE EMULA EL SUEÑO. CDP `Page.setWebLifecycleState` a `frozen` no congela una página
 * visible en el Chromium sin ventana (medido: no salta `freeze`, y el reloj falso de Playwright
 * corre igual dentro de cada `evaluate`). Así que dormir es, a mano, lo que hace congelar: el
 * reloj de A se para y lo que le llega por `storage` y por el canal se guarda sin entregar.
 * Despertar entrega las dos cosas en el orden que se pide.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { leerContenedor } = require('./eventos.helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const MIN = 60 * 1000;
const cta = (p) => p.locator('[data-pace-cta]');

async function focosContados(page) {
  const c = await leerContenedor(page);
  return ((c && c.events) || []).filter(e => e.type === 'session.completed' && e.payload && e.payload.module === 'focus').length;
}

/* Cada canal que abre la página queda a mano, para poder retener lo que le llega. */
async function canalesAMano(context) {
  await context.addInitScript(() => {
    const Nativo = window.BroadcastChannel;
    if (typeof Nativo !== 'function') return;
    window.__canales = [];
    const Envuelto = function (nombre) { const c = new Nativo(nombre); window.__canales.push(c); return c; };
    Envuelto.prototype = Nativo.prototype;
    window.BroadcastChannel = Envuelto;
  });
}

function dormir(page) {
  return page.evaluate(() => {
    const z = window.__sueno = { reloj: 0, storage: 0, canal: [] };
    const ctl = window.__pwClock.controller;
    z.ff = ctl.fastForward; z.rf = ctl.runFor;
    ctl.fastForward = async (t) => { z.reloj += t; };
    ctl.runFor = async (t) => { z.reloj += t; };
    window.removeEventListener('storage', window.paceOtraPestanaGuardo);
    z.oir = () => { z.storage++; };
    window.addEventListener('storage', z.oir);
    z.canales = window.__canales.filter(c => c.name === 'pace.foco.v1' && typeof c.onmessage === 'function');
    z.canales.forEach(c => { c.__oir = c.onmessage; c.onmessage = (e) => z.canal.push({ c, data: e.data }); });
  });
}

/* `orden`: 'reloj' (su reloj y en seguida los avisos), 'avisos' (al revés) o 'tarde' (su reloj, y los
   avisos cuando ya pidió el candado: lo que sabe esa pestaña es solo lo que hay guardado). */
async function despertar(page, orden) {
  await page.evaluate(async (o) => {
    const z = window.__sueno, ctl = window.__pwClock.controller;
    ctl.fastForward = z.ff; ctl.runFor = z.rf;
    window.removeEventListener('storage', z.oir);
    window.addEventListener('storage', window.paceOtraPestanaGuardo);
    z.canales.forEach(c => { c.onmessage = c.__oir; });
    z.entregar = () => {
      if (z.storage) window.paceOtraPestanaGuardo({ key: 'pace.state.v2', storageArea: localStorage });
      z.canal.forEach(x => x.c.onmessage({ data: x.data }));
    };
    if (o === 'avisos') z.entregar();
    await ctl.fastForward(z.reloj);
    if (o === 'reloj') z.entregar();
  }, orden);
  if (orden !== 'tarde') return;
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__sueno.entregar());
}

const ORDENES = { reloj: 'llega antes su reloj', avisos: 'llegan antes los avisos', tarde: 'los avisos llegan cuando ya pidió el candado' };
for (const orden of Object.keys(ORDENES)) {
  test('5 · la pestaña que despierta tras dos bloques no cuenta otra vez el primero · ' + ORDENES[orden], async ({ context }) => {
    await canalesAMano(context);
    await sembrar(context, { soundOn: false });
    await context.clock.install({ time: ARRANQUE });
    const a = await context.newPage();
    await irAlArtefacto(a);
    await context.clock.pauseAt(new Date(ARRANQUE.getTime() + 3000));
    await a.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await context.clock.runFor(2000);
    const b = await context.newPage();
    await irAlArtefacto(b);
    await expect(cta(b)).toHaveText('Pausar');

    await dormir(a);
    /* B termina X… */
    await context.clock.fastForward(25 * MIN);
    await context.clock.runFor(3000);
    await expect.poll(() => b.evaluate(() => getState().cycle)).toBe(1);
    /* …empieza Y y lo termina. */
    await b.keyboard.press('Escape');
    await expect(cta(b)).toHaveText('Empezar otro ciclo');
    await cta(b).click();
    await expect(cta(b)).toHaveText('Pausar');
    await context.clock.fastForward(25 * MIN);
    await context.clock.runFor(3000);
    await expect.poll(() => b.evaluate(() => getState().cycle)).toBe(2);
    /* Pasan los diez minutos del candado de Y (los de X pasaron hace rato). */
    await context.clock.fastForward(11 * MIN);
    await context.clock.runFor(1000);

    await despertar(a, orden);
    await context.clock.runFor(3000);
    await a.waitForTimeout(500);
    await context.clock.runFor(2000);

    for (const p of [a, b]) {
      expect(await p.evaluate(() => getState().cycle), 'un bloque contó dos veces').toBe(2);
      expect(await p.evaluate(() => getState().totalFocusMin), 'sus minutos contaron dos veces').toBe(50);
    }
    await expect.poll(() => focosContados(b)).toBe(2);
  });
}
