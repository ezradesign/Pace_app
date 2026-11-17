/* PACE · E2E · LOS CAMBIOS DENTRO DE UN PASO SE AVISAN (Ez, 1A del 16 nov. 2026)
 *
 * docs/proposals/menores-16nov/. Siete pasos cambian de brazo, pie, lado o sentido a mitad y el
 * runner no lo decía. Ahora, en el momento del cambio, suenan los dos cuencos del cambio de lado,
 * vibra dos veces y, si es de lado, la voz dice «Cambia de lado»; y el texto empieza con la palabra
 * del tramo, como «Izquierda.» en los pasos por lados. CON LA CONDICIÓN DE EZ: «que nada modifique las
 * líneas o se superponga o cambie el formato». Por eso:
 *   · en los cinco pasos con palabra, el texto tiene en cada tramo las mismas líneas que sin ella, y ni
 *     el hueco del texto ni el dibujo cambian de tamaño (360 × 640, en castellano y en inglés, y con la
 *     letra al 115 % en castellano). Esta es la prueba que cae si una palabra o un texto nuevo añade
 *     una línea;
 *   · los tres que no caben con la letra al 115 % (Círculos de brazos, Gateo con rodillas, Desliza el
 *     talón) no llevan palabra: solo la señal (docs/proposals/menores-16nov/, alternativa para Ez);
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
];
const SIN_PALABRA = [
  { id: 'move.shoulder.circles', i: 0, en: [4, 8, 12] },
  { id: 'extra.pausa.suelo', i: 4, en: [4] },
  { id: 'extra.pausa.suelo', i: 3, en: [3] },
];

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
  /* Hasta el paso `i` trabajando, por «Paso N de M» / «Step N of M». */
  for (let k = 0; k < 600; k++) {
    const r = await page.evaluate(() => {
      const raiz = [...document.querySelectorAll('[data-pace-v1-raiz]')].find((e) => e.getBoundingClientRect().width > 0);
      const meta = [...document.querySelectorAll('[data-pace-session-root] *')].find((e) => e.children.length === 0 && /^(Paso|Step) \d+ (de|of) \d+$/.test(e.textContent.trim()));
      return { fase: raiz && raiz.getAttribute('data-pace-v1-fase'), n: meta ? +meta.textContent.match(/\d+/)[0] - 1 : -1 };
    });
    if (r.n === i && r.fase === 'work') break;
    /* De 5 en 5 s por los pasos de antes; ya en el suyo, de segundo en segundo hasta que trabaja. */
    await page.clock.runFor(r.n < i ? 5000 : 1000);
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
    pila: Math.round(q('[data-pace-v1-pila="cue"]').getBoundingClientRect().height), dibujo: Math.round(q('[data-pace-v1-glyph]').getBoundingClientRect().height) };
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

/* Una prueba por paso y configuración: las tres seguidas no cabían en el minuto con la máquina cargada. */
for (const paso of CON_PALABRA) {
  for (const cfg of [{ lang: 'es' }, { lang: 'en' }, { lang: 'es', letra: 1.15 }]) {
    const donde = cfg.lang + (cfg.letra ? ', letra al 115 %' : '');
    test('con palabra · ' + paso.id + ' paso ' + (paso.i + 1) + ' (' + donde + '): la palabra de cada tramo, sin una línea más ni un píxel de dibujo menos', async ({ browser }) => {
      const { context, page } = await abrirPaso(browser, paso, cfg);
      const errores = capturarErrores(page);
      const t = await tramos(page, paso);
      expect(t.map((x) => x.palabra), donde).toEqual([null].concat(cfg.lang === 'es' ? paso.es : paso.ing));
      t.forEach((x, k) => {
        expect(x.lineas, donde + ', tramo ' + k + ': el texto cambió de líneas').toBe(t[0].lineas);
        expect(x.pila, donde + ', tramo ' + k + ': el hueco del texto cambió').toBe(t[0].pila);
        expect(x.dibujo, donde + ', tramo ' + k + ': el dibujo cambió de tamaño').toBe(t[0].dibujo);
      });
      expect(errores).toEqual([]);
      await context.close();
    });
  }
}

for (const paso of SIN_PALABRA) {
  test('sin palabra · ' + paso.id + ' paso ' + (paso.i + 1) + ', de los que no caben con la letra al 115 %: ni palabra ni una línea distinta', async ({ browser }) => {
    const { context, page } = await abrirPaso(browser, paso, { lang: 'es' });
    const t = await tramos(page, paso);
    expect(t.every((x) => x.palabra === null), paso.id + ': lleva palabra').toBe(true);
    expect(new Set(t.map((x) => x.lineas + '/' + x.dibujo)).size, paso.id + ': algo cambió de tamaño').toBe(1);
    await context.close();
  });
}

test('la señal del cambio de sentido: dos vibraciones, las del cambio de lado', async ({ browser }) => {
  /* Brazos libres, repetición 5 (el primer cambio, de sentido): el sonido apagado, así que vibra (vibra.js). */
  const a = await abrirPaso(browser, SIN_PALABRA[0], { lang: 'es' });
  await a.page.evaluate(() => { window.__vib = []; navigator.vibrate = (p) => { window.__vib.push(JSON.stringify(p)); return true; }; });
  const seg = await a.page.evaluate(() => window.v1RepSeconds(window.resolveBodyRoutine('move.shoulder.circles').routine.steps[0]));
  await a.page.clock.runFor((4 * seg + 1) * 1000);
  await a.page.waitForTimeout(300);
  expect(await a.page.evaluate(() => window.__vib), 'en el cambio, el doble del cambio de lado').toContain('[60,120,60]');
  await a.context.close();
});

test('la señal del cambio de pie: con la voz, «Cambia de lado» en lugar del número', async ({ browser }) => {
  /* Piernas en pausa, repetición 9 (el cambio de pie): con la voz, «cambia» en lugar del número. */
  const b = await abrirPaso(browser, CON_PALABRA[0], { lang: 'es', extra: { soundOn: true, voiceOn: true, voice: 'sulafat' } });
  await b.page.evaluate(() => { window.__palabras = []; window.paceVozCuerpoIntenta = (p) => { window.__palabras.push(p); return true; }; });
  const s2 = await b.page.evaluate(() => window.v1RepSeconds(window.resolveBodyRoutine('move.hamstrings.standing').routine.steps[2]));
  await b.page.clock.runFor((8 * s2 + 1) * 1000);
  await b.page.waitForTimeout(300);
  const p = await b.page.evaluate(() => window.__palabras);
  expect(p, 'la voz: ' + p.join(' ')).toContain('cambia');
  expect(p, 'el número del cambio no se dice').not.toContain('n8');
  await b.context.close();
});
