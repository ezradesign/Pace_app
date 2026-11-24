/* PACE · la voz de Mueve y Estira dice lo que se ve, cuando se ve
 * ===============================================================
 * Ez oyó dos fallos (19 nov. 2026): la voz decía el número de la repetición más tarde de lo que tocaba, y
 * la cuenta atrás a veces se oía a medias. Medido en un Chromium con el reloj de verdad:
 *   - en las repeticiones, la pantalla pasaba a «2» y la voz decía «uno» en ese mismo instante: contaba la
 *     repetición que acababa y la pantalla, la que empieza. Iba una repetición entera por detrás;
 *   - el contexto de audio nacía con la primera madera de la cuenta de entrada (el «tres»): mientras
 *     arranca, su reloj está parado, así que el «tres» sonaba ~0,5 s tarde y el «dos» lo encontraba aún
 *     sonando y caía a madera: «tres, (madera), uno»;
 *   - la serie se decidía palabra a palabra: si el «tres» no podía sonar y el «dos» sí, cuenta a medias.
 *
 * Aquí el contexto de audio es uno de mentira con el reloj de la página, como en voz-cuerpo-fila.spec.js:
 * cada palabra programada se apunta con su inicio, y la pantalla se apunta con un MutationObserver.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

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
}

/* La voz descodificada y un contexto de mentira. `arranque`: segundos que tarda en correr desde que se
   crea (el de verdad, al abrir el dispositivo de audio); nace al primer `paceAudioCtx()` tras esto, como
   el de la app. Mientras arranca, su reloj está parado en 0. La pantalla (el número del runner y el de
   la preparación) se apunta con su hora en el reloj de la página. */
async function prepararVoz(page, context, op) {
  op = op || {};
  await sembrar(context, { soundOn: true, voiceOn: true, voice: 'sulafat', lang: 'es' });
  await page.clock.install({ time: new Date('2026-11-19T10:00:00+01:00') });
  await irAlArtefacto(page);
  await page.mouse.click(2, 700);
  /* Una palabra de cada una de las cuatro tomas (cuenta, números, avisos y lados): se descodifican cada una
     a su ritmo, y con solo la de la cuenta lista los números aún iban a madera si «numeros.mp3» bajaba
     despacio (fila-4 cayó así en el CI el 24 nov.; se reproduce retrasando esa toma 4 s). Después se calla y
     se vacía la fila: la prueba empieza sin lo que sonó aquí. */
  for (const palabra of ['c3', 'n2', 'colocate', 'izquierda']) {
    await expect.poll(() => page.evaluate((w) => window.paceVozCuerpoIntenta(w, 5), palabra), { timeout: 15000 }).toBe(true);
  }
  await page.evaluate(() => window.paceVozCuerpoCalla());
  await page.evaluate((arranque) => {
    const reloj = () => performance.now() / 1000;
    const fuentes = []; const llamadas = []; const pantalla = [];
    const param = () => ({ value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {}, exponentialRampToValueAtTime() {} });
    const nodo = () => ({ connect() {}, disconnect() {} });
    let ctx = null;
    const crear = () => {
      const nace = reloj();
      const corre = () => reloj() - nace >= arranque;
      ctx = {
        nace, arranque, destination: nodo(),
        get state() { return corre() ? 'running' : 'suspended'; },
        get currentTime() { return corre() ? reloj() - nace - arranque : 0; },
        resume() { return Promise.resolve(); },
        createGain() { return Object.assign(nodo(), { gain: param() }); },
        createBufferSource() {
          const f = Object.assign(nodo(), { buffer: null, paradas: [], start(t, off) { f.t = t; f.off = off; }, stop(t) { f.paradas.push(t); } });
          fuentes.push(f); return f;
        },
      };
      return ctx;
    };
    window.__ctx = () => ctx;
    window.__fuentes = fuentes; window.__llamadas = llamadas; window.__pantalla = pantalla;
    window.paceAudioCtx = () => ctx || crear();
    /* Una palabra programada en `t` (reloj del contexto) suena, en el reloj de la página, en
       nace + arranque + t: lo que tarda en arrancar el contexto la retrasa. */
    const orig = window.paceVozCuerpoIntenta;
    window.paceVozCuerpoIntenta = function (p) {
      const n = fuentes.length;
      const r = orig.apply(this, arguments);
      const f = fuentes.length > n ? fuentes[n] : null;
      llamadas.push({ p, pedida: reloj(), r, suena: f ? ctx.nace + ctx.arranque + f.t : null });
      return r;
    };
    let ult = '';
    new MutationObserver(() => {
      const e = document.querySelector('[data-pace-v1-num]') || document.querySelector('[data-pace-session-prep-num]');
      const raiz = document.querySelector('[data-pace-v1-raiz]');
      const v = e ? e.textContent.trim() : '';
      const k = (raiz ? raiz.getAttribute('data-pace-v1-fase') : 'prep') + ':' + v;
      if (k !== ult) { ult = k; pantalla.push({ v, fase: raiz ? raiz.getAttribute('data-pace-v1-fase') : 'prep', t: reloj() }); }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-pace-v1-fase'] });
  }, op.arranque || 0);
}

/* Lo que se ve en `t`: el último cambio de la pantalla hasta `t` + 0,05 s. */
const enPantalla = (pantalla, t) => {
  let u = null;
  for (const x of pantalla) if (x.t <= t + 0.05) u = x;
  return u;
};

async function correr(page, maxSeg, hasta) {
  for (let i = 0; i < maxSeg; i++) {
    await page.clock.runFor(1000);
    if (hasta && (await page.evaluate(hasta))) break;
    if ((await page.locator('[data-pace-v1-raiz]').count()) === 0 && i > 10) break;
  }
}

/* Cada número dicho es el que la pantalla acaba de poner, a menos de 0,1 s. */
async function mirarRepeticiones(page) {
  const r = await page.evaluate(() => ({ llamadas: window.__llamadas, pantalla: window.__pantalla }));
  const nums = r.llamadas.filter((l) => /^n\d+$/.test(l.p) && l.r);
  expect(nums.length, 'la rutina no dijo ningún número').toBeGreaterThan(3);
  for (const w of nums) {
    const visto = enPantalla(r.pantalla, w.suena);
    const dice = w.p.slice(1);
    expect(visto && visto.v, '«' + dice + '» suena con un ' + (visto && visto.v) + ' en pantalla').toBe(dice);
    expect(w.suena - visto.t, '«' + dice + '» suena ' + (w.suena - visto.t).toFixed(2) + ' s después de verse').toBeLessThan(0.1);
  }
}

test('sincro-1 · repeticiones: la voz dice el número que la pantalla acaba de poner (Mueve, es, sulafat; 2 × 5 y 2 × 6 de 4 s)', async ({ page, context }) => {
  test.setTimeout(150000);
  await prepararVoz(page, context);
  await abrirRutina(page, 'Mueve', 'extra.chair.squats');
  await correr(page, 200);
  await mirarRepeticiones(page);
});

test('sincro-1b · lo mismo en inglés con bradford (Estira, «Cuello suave», reps de 5 y 6 s)', async ({ page, context }) => {
  test.setTimeout(120000);
  await prepararVoz(page, context);
  await abrirRutina(page, 'Estira', 'move.neck.3');
  await page.evaluate(() => window.setState({ lang: 'en', voice: 'bradford' }));
  await correr(page, 90, () => window.__llamadas.filter((l) => /^n\d+$/.test(l.p) && l.r).length >= 9);
  await mirarRepeticiones(page);
  const ingles = await page.evaluate(() => window.paceVozIdioma());
  expect(ingles).toBe('en');
});

/* La entrada cuenta desde 5 y va sin voz, a madera (1A del 19 nov.): la primera palabra es «Colócate». */
test('sincro-2 · la entrada con el audio aún arrancando: sin voz en la cuenta, y «Colócate» entero cuando se ve', async ({ page, context }) => {
  test.setTimeout(90000);
  await prepararVoz(page, context, { arranque: 0.5 });
  await abrirRutina(page, 'Mueve', 'extra.chair.squats');
  await correr(page, 8, () => window.__llamadas.some((l) => l.p === 'colocate'));
  const r = await page.evaluate(() => ({ llamadas: window.__llamadas, pantalla: window.__pantalla }));
  expect(r.llamadas.map((l) => l.p)[0], 'la entrada pidió voz').toBe('colocate');
  const w = r.llamadas[0];
  expect(w.r, '«Colócate» no sonó').toBe(true);
  const visto = enPantalla(r.pantalla, w.suena);
  expect(visto && visto.fase).toBe('place');
  expect(w.suena - visto.t, '«Colócate» suena ' + (w.suena - visto.t).toFixed(2) + ' s después de verse').toBeLessThan(0.1);
});

test('sincro-3 · una cuenta no sale a medias: si su primera palabra va a madera, todas; y un tic algo tarde no tira la siguiente', async ({ page, context }) => {
  await prepararVoz(page, context);
  await page.evaluate(() => {
    window.paceAudioCtx();
    const t0 = () => window.__ctx().currentTime;
    const dice = (n) => { const op = window.v1VozCuenta(n); return window.paceVozCuerpoIntenta(op.voz, op.max, op); };
    const espera = (s) => new Promise((ok) => setTimeout(ok, s * 1000));
    window.__hecho = (async () => {
      /* Con «Cambia de lado» aún sonando, el «tres» no cabe: madera. El «dos» y el «uno» llegan con la fila
         libre, pero la cuenta ya se decidió. */
      window.paceVozCuerpoIntenta('cambia');
      const tapada = [];
      await espera(0.3); tapada.push(dice(3));
      await espera(1); tapada.push(dice(2));
      await espera(1); tapada.push(dice(1));
      window.paceVozCuerpoCalla();
      /* El tic del «tres» llega 80 ms tarde y el del «dos», a su hora: entre los dos, 0,92 s. El «tres»
         ya acabó de sonar (su trozo dura 0,80), así que el «dos» suena. */
      await espera(3);
      const tarde = [];
      tarde.push(dice(3)); const a = t0();
      await espera(0.92); tarde.push(dice(2));
      await espera(1); tarde.push(dice(1));
      return { tapada, tarde, a };
    })();
  });
  await page.clock.runFor(10000);
  const v = await page.evaluate(() => window.__llamadas.slice(-6).map((l) => l.r));
  expect(v.slice(0, 3), '«tres» a madera y «dos, uno» con voz: cuenta a medias').toEqual([false, false, false]);
  expect(v.slice(3), 'un tic 80 ms tarde dejó la cuenta a medias').toEqual([true, true, true]);
});
