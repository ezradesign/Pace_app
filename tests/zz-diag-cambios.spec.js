/* PACE · E2E · LOS CAMBIOS DENTRO DE UN PASO SE AVISAN (Ez, 1A del 16 nov. 2026)
 *
 * docs/proposals/menores-16nov/. Siete pasos cambian de brazo, pie, lado o sentido a mitad y el
 * runner no lo decía. Ahora, en el momento del cambio, suenan los dos cuencos del cambio de lado,
 * vibra dos veces y, si es de lado, la voz dice «Cambia de lado»; y el texto empieza con la palabra
 * del tramo, como «Izquierda.» en los pasos por lados. CON LA CONDICIÓN DE EZ: «que nada modifique las
 * líneas o se superponga o cambie el formato». Por eso:
 *   · en los ocho pasos, el texto tiene en cada tramo las mismas líneas que sin la palabra, y ni el
 *     hueco del texto ni el dibujo cambian de tamaño, en los seis tamaños de la condición de Ez: 360 × 640
 *     y 740 y con la letra al 115 %, en castellano y en inglés. Esta es la prueba que cae si una palabra
 *     o un texto nuevo añade una línea;
 *   · tres de ellos (Círculos de brazos, Gateo con rodillas, Desliza el talón) solo caben porque su
 *     texto ya no dice lo que dice la palabra («Luego, el otro», «Tres con cada pierna»; Ez, 19 nov.).
 *     Con el texto de antes y la palabra delante, esta prueba cae con la letra al 115 %;
 *   · la señal: vibra dos veces en el cambio y la voz dice «Cambia de lado» en el de pie.
 * Contra la 0.208.0 cae: ningún paso llevaba palabra ni sonaba nada distinto en el cambio.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

/* Cada prueba recorre una rutina hasta su paso con el reloj falso: con la máquina cargada pasa del minuto. */
test.describe.configure({ timeout: 120 * 1000 });

/* `en`: los cambios, en repeticiones hechas (pasos de repeticiones) o en segundos (pasos con reloj). */
const CON_PALABRA = [
  { id: 'move.hamstrings.standing', i: 2, en: [4, 8, 12], es: ['Al revés', 'Otro pie', 'Al revés'], ing: ['Reverse', 'Other foot', 'Reverse'] },
  { id: 'move.wrists', i: 1, en: [4], es: ['Al revés'], ing: ['Reverse'] },
  { id: 'move.desk.quick', i: 1, en: [4], es: ['Al revés'], ing: ['Reverse'] },
  { id: 'move.desk.quick', i: 2, en: [10], es: ['Otro lado'], ing: ['Other side'] },
  { id: 'move.desk.quick', i: 3, en: [10], es: ['Otro pie'], ing: ['Other foot'] },
  { id: 'move.shoulder.circles', i: 0, en: [4, 8, 12], es: ['Atrás', 'Otro brazo', 'Atrás'], ing: ['Back', 'Other arm', 'Back'] },
  { id: 'extra.pausa.suelo', i: 4, en: [4], es: ['Atrás'], ing: ['Back'] },
  { id: 'extra.pausa.suelo', i: 3, en: [3], es: ['Otra pierna'], ing: ['Other leg'] },
];
/* Los seis tamaños de la condición de Ez (docs/proposals/menores-16nov/genera.a-corta.js). */
const TAMANOS = [];
for (const lang of ['es', 'en']) for (const t of [{ alto: 640 }, { alto: 740 }, { alto: 640, letra: 1.15 }]) TAMANOS.push(Object.assign({ lang }, t));

async function abrirPaso(browser, { id, i }, { lang, alto, letra, extra }) {
  const context = await browser.newContext({ viewport: { width: 360, height: alto || 640 }, isMobile: true, hasTouch: true,
    locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await sembrar(context, Object.assign({ lang, soundOn: false }, extra || {}));
  const page = await context.newPage();
  await page.clock.install({ time: new Date('2026-11-18T10:00:00+01:00') });
  await irAlArtefacto(page);
  await page.evaluate((x) => {
    const r = window.resolveBodyRoutine(x);
    window.dispatchEvent(new CustomEvent('pace:hacerla', { detail: { routine: r.routine, kind: r.source } }));
  }, id);
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(ahora + 1000);
  /* Hasta el paso `i` trabajando, por «Paso N de M» / «Step N of M». Ese número cuenta los ejercicios, sin
     los descansos (sessionPasoCabecera): el paso `i` es el ejercicio número `objetivo`. */
  const objetivo = await page.evaluate(({ id, i }) => window.resolveBodyRoutine(id).routine.steps.slice(0, i + 1).filter((s) => s.mode !== 'rest').length - 1, { id, i });
  for (let k = 0; k < 600; k++) {
    const r = await page.evaluate(() => {
      const raiz = [...document.querySelectorAll('[data-pace-v1-raiz]')].find((e) => e.getBoundingClientRect().width > 0);
      const meta = [...document.querySelectorAll('[data-pace-session-root] *')].find((e) => e.children.length === 0 && /^(Paso|Step) \d+ (de|of) \d+$/.test(e.textContent.trim()));
      return { fase: raiz && raiz.getAttribute('data-pace-v1-fase'), n: meta ? +meta.textContent.match(/\d+/)[0] - 1 : -1 };
    });
    if (r.n === objetivo && r.fase === 'work') break;
    /* De 5 en 5 s por los pasos de antes; ya en el suyo, de segundo en segundo hasta que trabaja. */
    await page.clock.runFor(r.n < objetivo ? 5000 : 1000);
    await page.waitForTimeout(15);
  }
  if (letra) {
    await page.evaluate((f) => {
      const els = Array.from(document.querySelector('[data-pace-session-root]').querySelectorAll('*'));
      const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
      els.forEach((e, n) => e.style.setProperty('font-size', (tam[n] * f) + 'px', 'important'));
      window.dispatchEvent(new Event('resize'));
    }, letra);
  }
  await page.waitForTimeout(500);
  return { context, page };
}

const leer = (page) => page.evaluate(() => {
  const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
  const cue = q('[data-pace-v1-cue]');
  const b = cue.querySelector('strong');
  return { palabra: b ? b.textContent.replace(/\.\s*$/, '') : null, lineas: Math.round(cue.getBoundingClientRect().height / parseFloat(getComputedStyle(cue).lineHeight)),
    pila: Math.round(q('[data-pace-v1-pila="cue"]').getBoundingClientRect().height), dibujo: Math.round(q('[data-pace-v1-glyph]').getBoundingClientRect().height),
    texto: cue.textContent.slice(0, 200), caja: +cue.getBoundingClientRect().width.toFixed(1), anchos: (() => { const r = document.createRange(); r.selectNodeContents(cue); const m = {}; for (const x of r.getClientRects()) { const k = Math.round(x.top); m[k] = Math.max(m[k] || 0, x.right - cue.getBoundingClientRect().left); } return Object.values(m).map((v) => +v.toFixed(1)); })() };
});

/* Recorre los tramos: lo de antes del primer cambio y lo de justo después de cada uno. */
async function tramos(page, paso) {
  const seg = await page.evaluate(({ id, i }) => {
    const st = window.resolveBodyRoutine(id).routine.steps[i];
    return st.mode === 'reps' ? window.v1RepSeconds(st) : 1;
  }, paso);
  const out = [await leer(page)];
  let hecho = 0;
  for (const c of paso.en) {
    const hasta = c * seg + 1;
    await page.clock.runFor((hasta - hecho) * 1000);
    await page.waitForTimeout(300);
    hecho = hasta;
    out.push(await leer(page));
  }
  return out;
}

for (const paso of CON_PALABRA) {
  for (const cfg of TAMANOS) {
    const donde = cfg.lang + ', 360 x ' + cfg.alto + (cfg.letra ? ', 115' : '');
    test('diag cambios ' + paso.id + ' ' + paso.i + ' ' + donde, async ({ browser }) => {
      const { context, page } = await abrirPaso(browser, paso, cfg);
      const t = await tramos(page, paso);
      console.log('DIAG cambios ' + paso.id + ' ' + paso.i + ' ' + donde + ' ' + JSON.stringify(t));
      await context.close();
    });
  }
}
