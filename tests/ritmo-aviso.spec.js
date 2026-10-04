/* PACE · E2E · LA PAUSA TE LLAMA POR SU NOMBRE (s198 · v0.133.0)
 * ===============================================================
 * Decision del usuario (D2, texto V1, mirando por-donde-seguir-s198.html): con
 * «A tu ritmo», el aviso del sistema al acabar un bloque dice que pausa toca y
 * cuando vuelves. Hasta v0.132.0 decia siempre «Foco completado».
 *
 * El aviso del SISTEMA se sustituye por uno falso que guarda lo que la app le
 * pide mostrar, y la pestaña se declara OCULTA (con ella visible la app no
 * avisa: la campana y la pausa ya estan delante, decision de s102). El registro
 * del service worker se anula para que la app caiga a `new Notification`.
 *
 * Los nombres y las horas se piden al MOTOR del dia, no se escriben aqui: lo que
 * se defiende es que el aviso diga lo mismo que la app, en el formato elegido.
 * Calibrado en ROJO contra el `index.html` de v0.132.0.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const NUEVE = new Date('2026-09-17T09:00:00+02:00');   /* jueves, 9:00 en Madrid */
const FECHA = '2026-09-17';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };

async function preparar(context, page, extra) {
  await sembrar(context, Object.assign({ ritmo: { dia: JORNADA }, soundOn: false }, extra || {}));
  await context.addInitScript(() => {
    window.__avisos = [];
    class AvisoFalso {
      constructor(title, opts) { window.__avisos.push({ title: title, body: (opts && opts.body) || '' }); }
      static get permission() { return 'granted'; }
      static requestPermission() { return Promise.resolve('granted'); }
    }
    Object.defineProperty(window, 'Notification', { value: AvisoFalso, configurable: true, writable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => (window.__oculta ? 'hidden' : 'visible'), configurable: true });
    if (navigator.serviceWorker) navigator.serviceWorker.getRegistration = () => Promise.resolve(undefined);
  });
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
}

/* Empieza el bloque que marque el aro y lo lleva al final con el reloj. */
async function terminarBloque(page, boton, oculta) {
  await page.getByRole('button', { name: boton, exact: true }).click();
  await page.waitForTimeout(250);
  await page.evaluate((o) => { window.__oculta = o; }, oculta !== false);
  for (let i = 0; i < 80; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(50);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await expect(page.locator('[data-pace-break-shortcut]'), 'GUARD: el bloque no termino').not.toHaveCount(0);
  await page.waitForTimeout(200);
  return page.evaluate(() => window.__avisos.slice());
}

/* Lo que el motor dice que viene detras del bloque n (1..), y la hora del siguiente. */
function motor(page, n) {
  return page.evaluate((k) => {
    const p = ritmoPlan(getState());
    const it = ritmoDetras(p.m, p.m.focos[k - 1]);
    const sig = p.m.focos[k];
    const es = (window.PACE_STRINGS && window.PACE_STRINGS.en) || {};
    return { tipo: it.tipo, larga: !!it.larga, dur: it.dur, total: p.m.focos.length,
      platos: (it.platos || []).map((x) => ({ es: x.name, en: es[(x.rutina || x).id + '.name'] || x.name, min: x.min })),
      siguiente: sig ? ritmoHora(sig.desde) : null, desde: p.m.focos.map((f) => f.desde),
      comidaTras: p.m.focos.findIndex((f) => { const d = ritmoDetras(p.m, f); return d && d.tipo === 'comida'; }) + 1 };
  }, n);
}

test('con el dia servido, el aviso nombra la pausa y dice cuando vuelves', async ({ context, page }) => {
  await preparar(context, page);
  const avisos = await terminarBloque(page, 'Empezar jornada');
  const m = await motor(page, 1);
  expect(avisos, 'la app no aviso al acabar el bloque con la pestaña oculta').toHaveLength(1);
  expect(m.platos.length, 'GUARD: la pausa del bloque 1 trae plato').toBeGreaterThan(0);
  expect(avisos[0].title, 'el aviso no nombra la pausa servida').toBe('Tu pausa: ' + m.platos[0].es + ' · ' + m.platos[0].min + ' min');
  expect(avisos[0].body).toBe('Bloque 1 de ' + m.total + ' hecho. El siguiente, a las ' + m.siguiente + '.');
});

test('por libre, y con la pestaña delante, nada cambia', async ({ context, page }) => {
  await preparar(context, page, { ritmo: { libre: true } });
  const avisos = await terminarBloque(page, 'Empezar foco');
  expect(avisos).toEqual([{ title: 'Foco completado', body: 'Ciclo cerrado. Elige tu micro-pausa.' }]);

  /* Control: con la pestaña VISIBLE no hay aviso del sistema (s102). */
  await page.keyboard.press('Escape');
  await page.evaluate(() => { window.__avisos = []; });
  const visibles = await terminarBloque(page, 'Empezar otro ciclo', false);
  expect(visibles, 'con la app delante no debe avisar el sistema').toEqual([]);
});

test('la larga con todos sus platos, antes de comer hasta cuando, y el ultimo bloque cierra el dia', async ({ context, page }) => {
  await preparar(context, page);
  const plan = await motor(page, 1);
  const k = plan.comidaTras;
  expect(k, 'GUARD: la jornada tiene comida detras de algun bloque').toBeGreaterThan(0);

  /* El bloque k, a su hora exacta (sin recolocar): `cycle` = k-1. */
  const aLaHora = async (n) => {
    const min = plan.desde[n - 1];
    await page.clock.setSystemTime(new Date(FECHA + 'T' + String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0') + ':00+02:00'));
    await page.evaluate((c) => { window.setState({ cycle: c }); window.__avisos = []; }, n - 1);
    await page.waitForTimeout(300);
  };
  /* La larga: su duracion es la de la PARADA y nombra todos sus platos. */
  const kl = await page.evaluate(() => { const p = ritmoPlan(getState()); return p.m.focos.findIndex((f) => { const d = ritmoDetras(p.m, f); return d && d.larga; }) + 1; });
  expect(kl, 'GUARD: la jornada tiene pausa larga').toBeGreaterThan(1);
  await aLaHora(kl);
  let avisos = await terminarBloque(page, 'Empezar bloque ' + kl);
  const larga = await motor(page, kl);
  expect(avisos[0].title).toBe('Tu pausa larga: ' + larga.platos.map((x) => x.es).join(' + ') + ' · ' + larga.dur + ' min');
  await page.keyboard.press('Escape');

  await aLaHora(k);
  avisos = await terminarBloque(page, 'Empezar bloque ' + k);
  const tras = await motor(page, k);
  expect(avisos[0].title).toBe('Hora de comer');
  expect(avisos[0].body).toBe('Hasta las ' + tras.siguiente + '. Luego, el bloque ' + (k + 1) + '.');

  await page.keyboard.press('Escape');
  const n = plan.total;
  await aLaHora(n);
  avisos = await terminarBloque(page, 'Empezar bloque ' + n);
  const ult = await motor(page, n);
  expect(ult.siguiente, 'GUARD: no hay bloque despues del ultimo').toBeNull();
  expect(avisos[0].title).toBe('Para cerrar: ' + ult.platos.map((x) => x.es).join(' + ') + ' · ' + ult.platos[0].min + ' min');
  expect(avisos[0].body).toBe('Bloque ' + n + ' de ' + n + ' hecho. Con esto cierras el día.');
});

test('en ingles, con el nombre de la rutina en ingles', async ({ context, page }) => {
  await preparar(context, page, { lang: 'en' });
  const avisos = await terminarBloque(page, 'Start the day');
  const m = await motor(page, 1);
  expect(avisos[0].title).toBe('Your break: ' + m.platos[0].en + ' · ' + m.platos[0].min + ' min');
  expect(avisos[0].body).toBe('Block 1 of ' + m.total + ' done. The next one at ' + m.siguiente + '.');
});
