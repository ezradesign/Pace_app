/* PACE · la voz y la vibración de Mueve y Estira (Ez, 1A-7A del 15 nov. 2026)
 * ===========================================================================
 * La voz dice lo que ya dice la pantalla en el momento en que suena un cuenco o una madera: la cuenta
 * atrás, «Colócate», «Ya», cada repetición al acabarla, «Descansa», «Último paso», los lados y «Cambia de
 * lado». Aquí se mira QUÉ PALABRA pide el runner en cada momento (se sustituye la que suena por una que
 * apunta), con el reloj acelerado; que la palabra suene de verdad depende de los audios y se oye en la app.
 * La vibración: de fábrica vibra con el sonido apagado y calla con él encendido; la fila «Vibrar» solo
 * sale donde se puede vibrar.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

async function abrirRutina(page, biblioteca, id) {
  await page.getByRole('button', { name: new RegExp('^' + biblioteca) }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
async function hasta(page, cond, maxSeg) {
  for (let i = 0; i < (maxSeg || 120); i++) { if (await cond()) return true; await page.clock.runFor(1000); }
  return cond();
}
/* Lo que pide el runner, en orden: la voz de verdad se cambia por una que apunta la palabra y dice que suena. */
const apuntar = (page) => page.evaluate(() => {
  window.__palabras = [];
  window.paceVozCuerpoIntenta = (p) => { window.__palabras.push(p); return true; };
});
const palabras = (page) => page.evaluate(() => window.__palabras.slice());

test('voz-1 · «Levántate y sube»: cuenta, «Colócate», «Ya», cada repetición, «Descansa» y la otra serie con «Ya»', async ({ page, context }) => {
  await sembrar(context, { soundOn: true, voiceOn: true, voice: 'sulafat' });
  await page.clock.install({ time: new Date('2026-11-16T10:00:00+01:00') });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await apuntar(page);
  await abrirRutina(page, 'Mueve', 'extra.chair.squats');
  expect(await hasta(page, async () => (await fase(page)) === 'rest', 120)).toBe(true);
  await page.clock.runFor(31000);
  const p = await palabras(page);
  const esperado = ['c3', 'c2', 'c1', 'colocate', 'c3', 'c2', 'c1', 'ya', 'n1', 'n2', 'n3', 'n4', 'n5', 'descansa', 'c3', 'c2', 'c1', 'ya'];
  expect(p.slice(0, esperado.length)).toEqual(esperado);
  expect(errores).toEqual([]);
});

test('voz-2 · «Cuello suave», su último paso por lados: «Último paso», «Izquierda», «Cambia de lado» y «Derecha»', async ({ page, context }) => {
  await sembrar(context, { soundOn: true, voiceOn: true, voice: 'sulafat' });
  await page.clock.install({ time: new Date('2026-11-16T10:00:00+01:00') });
  await irAlArtefacto(page);
  await apuntar(page);
  await abrirRutina(page, 'Estira', 'move.neck.3');
  expect(await hasta(page, async () => ['place', 'work'].includes(await fase(page)), 20)).toBe(true);
  for (let i = 0; i < 2; i++) { await page.click('[data-pace-v1-btn="next"]'); await page.clock.runFor(700); }
  expect(await hasta(page, async () => (await fase(page)) === 'change', 120)).toBe(true);
  expect(await hasta(page, async () => (await fase(page)) === 'work', 20)).toBe(true);
  await page.clock.runFor(1500);
  const p = await palabras(page);
  const desde = p.lastIndexOf('ultimo');
  expect(desde, 'el último paso no dice «Último paso»: ' + p.join(' ')).toBeGreaterThan(-1);
  const resto = p.slice(desde).filter((w) => !/^c\d$/.test(w));
  expect(resto).toEqual(['ultimo', 'izquierda', 'cambia', 'derecha']);
});

test('voz-3 · vibrar: de fábrica con el sonido apagado sí, con el sonido puesto no; la fila sale con su línea', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 1280, height: 720 }, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await sembrar(context, { soundOn: false });
  await context.addInitScript(() => { window.__vib = []; navigator.vibrate = (p) => { window.__vib.push(JSON.stringify(p)); return true; }; });
  const page = await context.newPage();
  await page.clock.install({ time: new Date('2026-11-16T10:00:00+01:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, 'Mueve', 'extra.chair.squats');
  expect(await hasta(page, async () => (await fase(page)) === 'work', 40)).toBe(true);
  await page.clock.runFor(4500);
  const v = await page.evaluate(() => window.__vib.slice());
  expect(v).toContain('[30]');   // el 3, 2, 1 y la repetición
  expect(v).toContain('[70]');   // «Ya»
  /* Con el sonido puesto, de fábrica no vibra. */
  await page.evaluate(() => { window.__vib = []; window.setState({ soundOn: true }); });
  await page.clock.runFor(5000);
  expect(await page.evaluate(() => window.__vib.length)).toBe(0);
  await context.close();
});

test('voz-4 · Ajustes: «La voz que cuenta las fases» bajo «Marca la fase», y «Vibrar» solo donde se puede', async ({ browser }) => {
  for (const tactil of [true, false]) {
    const context = await browser.newContext({ hasTouch: tactil, viewport: { width: 1280, height: 720 }, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
    await sembrar(context);
    const page = await context.newPage();
    await irAlArtefacto(page);
    await page.keyboard.press('t');
    await expect(page.locator('[data-pace-aj-fila="signal"]')).toContainText('La voz que cuenta las fases');
    const fila = page.locator('[data-pace-aj-fila="vibrar"]');
    if (tactil) {
      await expect(fila.getByRole('button', { name: 'Sin sonido' })).toHaveAttribute('aria-pressed', 'true');
      await fila.getByRole('button', { name: 'Siempre' }).click();
      expect(await page.evaluate(() => window.getState().vibrar)).toBe('siempre');
    } else {
      await expect(fila).toHaveCount(0);
    }
    await context.close();
  }
});

/* Las tomas que grabó Ez, tal como las dejó scripts/voz-cuerpo-tomas.js: cada voz e idioma de la tabla trae
   sus 36 palabras, cada una con su archivo, dentro de su trozo y sin pasar de su tope; y en la app, cada voz
   e idioma se descodifica y suena (`paceVozCuerpoIntenta` solo dice que sí con la toma ya descodificada
   y el audio en marcha). */
test('voz-5 · las tomas grabadas: las 36 palabras con su archivo y su tope, y en la app suenan', async ({ page, context }) => {
  const fs = require('fs'); const path = require('path'); const vm = require('vm');
  const { TOMAS, TOPE } = require('../scripts/voz-cuerpo-tomas.js');
  const raiz = path.join(__dirname, '..');
  const caja = { window: {} }; vm.createContext(caja);
  vm.runInContext(fs.readFileSync(path.join(raiz, 'app/ui/Sound.voz.cuerpo.datos.js'), 'utf8') + ';this.D=PACE_VOZ_CUERPO;', caja);
  const claves = Object.values(TOMAS).flat().map((f) => f[0]).sort();
  const voces = [];
  for (const [idioma, juego] of Object.entries(caja.D)) for (const [voz, pal] of Object.entries(juego)) {
    voces.push([idioma, voz]);
    expect(Object.keys(pal).sort(), idioma + '/' + voz).toEqual(claves);
    for (const [k, e] of Object.entries(pal)) {
      const quien = idioma + '/' + voz + ' «' + k + '»';
      expect(fs.existsSync(path.join(raiz, 'app/move/voz', e.archivo)), quien + ' sin ' + e.archivo).toBe(true);
      expect(e.a < e.ini && e.ini < e.fin && e.fin < e.b, quien + ' fuera de su trozo').toBe(true);
      expect(e.fin - e.ini, quien).toBeLessThanOrEqual(TOPE[k] || TOPE.defecto);
    }
  }
  expect(voces.length).toBeGreaterThan(0);
  /* Y cada toma, en el precache de sw.js: sin eso, sin conexión la voz no habla. */
  const sw = fs.readFileSync(path.join(raiz, 'sw.js'), 'utf8');
  for (const pal of Object.values(caja.D).flatMap((j) => Object.values(j))) {
    for (const e of Object.values(pal)) expect(sw, e.archivo + ' sin precache').toContain("'/app/move/voz/" + e.archivo + "'");
  }
  await sembrar(context, { soundOn: true, voiceOn: true, voice: 'sulafat', lang: 'es' });
  await irAlArtefacto(page);
  await page.mouse.click(2, 700);
  for (const [idioma, voz] of voces) {
    await page.evaluate((v) => window.setState({ lang: v[0], voice: v[1] }), [idioma, voz]);
    await expect.poll(() => page.evaluate(() => window.paceVozCuerpoIntenta('c3', 1)), { timeout: 15000, message: idioma + '/' + voz }).toBe(true);
  }
});
