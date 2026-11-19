/* PACE · la fila de la voz de Mueve y Estira (app/ui/Sound.voz.cuerpo.js), con el reloj de audio
 * ============================================================================================
 * Ez oyó dos fallos (16 nov. 2026): «Descansa» se montaba sobre el número anterior y los números se movían
 * de su repetición. Aquí el contexto de audio es uno de mentira, con el reloj de la página: cada palabra que
 * se programa se apunta con su inicio, y lo que dura sale de la tabla (de `a` a `b`, que es lo que suena).
 *
 * Lo que defiende:
 *   - cada número empieza a menos de 0,1 s de su repetición;
 *   - entre lo que acaba de sonar una palabra (su `b`) y la siguiente hay al menos 0,15 s, como en Respira, y
 *     tras la última repetición, al menos 0,3 s;
 *   - un número o la cuenta atrás no esperan en la fila: si la anterior aún suena, madera;
 *   - la serie entera se dice o entera va a madera, y la cuenta atrás igual;
 *   - una palabra no entra encima de un cuenco;
 *   - pausar, saltar o salir callan lo que suena y vacían la fila;
 *   - una palabra que no puede esperar no se tira en silencio: suena el tono;
 *   - con el contexto suspendido (al volver del fondo), la palabra se programa igual.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const HUECO = 0.15;
const TRAS_SERIE = 0.3;

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

/* La app con la voz ya descodificada y, desde ahí, un contexto de audio de mentira: su reloj es el de la
   página (o uno a mano, `__reloj`), y cada fuente que se programa queda en `__fuentes` con su palabra. */
async function prepararVoz(page, context, op) {
  await sembrar(context, Object.assign({ soundOn: true, voiceOn: true, voice: 'sulafat', lang: 'es' }, op || {}));
  await page.clock.install({ time: new Date('2026-11-17T10:00:00+01:00') });
  await irAlArtefacto(page);
  await page.mouse.click(2, 700);
  await expect.poll(() => page.evaluate(() => window.paceVozCuerpoIntenta('c3', 1)), { timeout: 15000 }).toBe(true);
  await page.evaluate(() => {
    const fuentes = []; const llamadas = [];
    const param = () => ({ value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {}, exponentialRampToValueAtTime() {} });
    const nodo = () => ({ connect() {}, disconnect() {} });
    const ctx = {
      state: 'running', destination: nodo(),
      get currentTime() { return window.__reloj != null ? window.__reloj : performance.now() / 1000; },
      resume() { setTimeout(() => { ctx.state = 'running'; }, 30); return Promise.resolve(); },
      createGain() { return Object.assign(nodo(), { gain: param() }); },
      createBufferSource() {
        const f = Object.assign(nodo(), { buffer: null, paradas: [],
          start(t, off) { f.t = t; f.off = off; }, stop(t) { f.paradas.push(t); } });
        fuentes.push(f); return f;
      },
    };
    window.__ctx = ctx; window.__fuentes = fuentes; window.__llamadas = llamadas;
    window.paceAudioCtx = () => ctx;
    const orig = window.paceVozCuerpoIntenta;
    window.paceVozCuerpoIntenta = function (p) {
      const n = fuentes.length;
      const r = orig.apply(this, arguments);
      llamadas.push({ p, t: ctx.currentTime, r, f: fuentes.length > n ? n : -1 });
      return r;
    };
  });
}

/* Lo que sonó: cada palabra programada con su inicio y su final (el `b` de la tabla, o antes si se calló). */
const sonado = (page) => page.evaluate(() => {
  const s = window.getState(); const tabla = window.PACE_VOZ_CUERPO[s.lang === 'en' ? 'en' : 'es'][s.voice];
  return window.__llamadas.filter((l) => l.f >= 0).map((l) => {
    const f = window.__fuentes[l.f]; const e = tabla[l.p];
    return { p: l.p, pedida: l.t, ini: f.t, fin: Math.min(f.t + (e.b - e.a), ...f.paradas.slice(1)) };
  });
});
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');

/* Las dos reglas de tiempo sobre lo que sonó en una rutina entera. */
function mirarTiempos(s) {
  const nums = s.filter((w) => /^n\d+$/.test(w.p));
  expect(nums.length, 'la rutina no dijo ningún número').toBeGreaterThan(5);
  for (const w of nums) expect(w.ini - w.pedida, '«' + w.p + '» empieza tarde').toBeLessThan(0.1);
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1], b = s[i];
    const hueco = b.ini - a.fin;
    expect(hueco, '«' + b.p + '» entra a ' + hueco.toFixed(3) + ' s de «' + a.p + '»').toBeGreaterThanOrEqual(HUECO - 1e-6);
    if (/^n\d+$/.test(a.p) && !/^[nc]\d+$/.test(b.p) && b.pedida - a.pedida < 0.05) {
      expect(hueco, '«' + b.p + '» tras la última repetición, a ' + hueco.toFixed(3) + ' s').toBeGreaterThanOrEqual(TRAS_SERIE - 1e-6);
    }
  }
}

async function correrRutina(page, maxSeg) {
  for (let i = 0; i < maxSeg; i++) {
    await page.clock.runFor(1000);
    if ((await page.locator('[data-pace-v1-raiz]').count()) === 0) break;
  }
}

test('fila-1 · «Gemelos bajo la mesa»: 25 repeticiones de 2 s (la cadencia más corta) y 12 de 5 s; cada número en su repetición, 0,15 s entre palabras y 0,3 tras la serie', async ({ page, context }) => {
  test.setTimeout(120000);
  const errores = capturarErrores(page);
  await prepararVoz(page, context);
  await abrirRutina(page, 'Mueve', 'extra.calves');
  await correrRutina(page, 240);
  mirarTiempos(await sonado(page));
  expect(errores).toEqual([]);
});

test('fila-2 · «Fondos en silla», 12 repeticiones de 4 s y «Descansa» detrás (lo que oyó Ez): lo mismo', async ({ page, context }) => {
  test.setTimeout(150000);
  await prepararVoz(page, context);
  await abrirRutina(page, 'Mueve', 'extra.chair.dips');
  await correrRutina(page, 360);
  mirarTiempos(await sonado(page));
});

test('fila-3 · un número no espera en la fila: si la palabra de antes aún suena, madera', async ({ page, context }) => {
  await prepararVoz(page, context);
  const r = await page.evaluate(() => {
    window.__reloj = 1000;
    window.paceVozCuerpoIntenta('cambia');
    window.__reloj = 1000.3;
    const op = window.v1VozRep(3, 4, 12);
    const dijo = window.paceVozCuerpoIntenta(op.voz, op.max, op);
    const l = window.__llamadas[window.__llamadas.length - 1];
    return { dijo, ini: l.f >= 0 ? window.__fuentes[l.f].t : null };
  });
  if (r.dijo) expect(r.ini - 1000.3, 'el número sonó tarde, detrás de «Cambia de lado»').toBeLessThan(0.1);
  expect(r.dijo, 'con «Cambia de lado» sonando, el número va a madera').toBe(false);
});

test('fila-4 · la serie se decide entera: o todos los números con voz o todos a madera', async ({ page, context }) => {
  await prepararVoz(page, context);
  const r = await page.evaluate(() => {
    const una = (repSec) => {
      const dichos = [];
      for (let n = 2; n <= 12; n++) {
        window.__reloj = 2000 + n * 10 + repSec * 100;
        const op = window.v1VozRep(n, repSec, 12);
        dichos.push(window.paceVozCuerpoIntenta(op.voz, op.max, op));
      }
      return dichos;
    };
    /* A 0,9 s por repetición caben unos números de sulafat y otros no: ocupan de 0,61 a 0,83 s, y con su
       hueco de 0,15, del «tres» y el «ocho» (0,76) al «seis» (0,98). Ninguna rutina va tan rápida (la que
       más, 2 s); aquí es para ver la regla. */
    return { corta: una(0.9), larga: una(4), cuenta: [3, 2, 1].map((n) => { window.__reloj = 3000 + (4 - n); const op = window.v1VozCuenta(n); return window.paceVozCuerpoIntenta(op.voz, op.max, op); }) };
  });
  expect(new Set(r.corta).size, 'a 0,9 s, unos números con voz y otros a madera: ' + r.corta.join(' ')).toBe(1);
  expect(r.corta[0]).toBe(false);
  expect(r.larga.every(Boolean)).toBe(true);
  expect(r.cuenta.every(Boolean)).toBe(true);
});

test('fila-5 · una palabra no entra encima de un cuenco', async ({ page, context }) => {
  await prepararVoz(page, context);
  const r = await page.evaluate(() => {
    window.__reloj = 4000;
    window.playSound('move.rest');
    window.paceVozCuerpoIntenta('siguiente');
    const l = window.__llamadas[window.__llamadas.length - 1];
    return { dijo: l.r, ini: l.f >= 0 ? window.__fuentes[l.f].t : null };
  });
  expect(r.dijo, '«Siguiente» no suena').toBe(true);
  expect(r.ini - 4000, '«Siguiente» entra encima del cuenco').toBeGreaterThanOrEqual(0.5);
});

test('fila-6 · pausar y saltar callan lo que suena y vacían la fila', async ({ page, context }) => {
  test.setTimeout(90000);
  await prepararVoz(page, context);
  await abrirRutina(page, 'Mueve', 'extra.calves');
  for (let i = 0; i < 120; i++) {
    await page.clock.runFor(1000);
    if ((await fase(page)) === 'work' && (await page.evaluate(() => window.__llamadas.some((l) => /^n\d+$/.test(l.p) && l.f >= 0)))) break;
  }
  /* Una palabra larga suena (como si acabara de entrar) y, a la mitad, se pausa o se salta. */
  const callada = async (accion, vacia) => {
    const antes = await page.evaluate(() => { window.paceVozCuerpoIntenta('cambia'); return window.__fuentes.length - 1; });
    await page.clock.runFor(200);
    await accion();
    const r = await page.evaluate((k) => ({ ahora: window.__ctx.currentTime, paradas: window.__fuentes[k].paradas }), antes);
    expect(Math.min(...r.paradas.slice(1), Infinity) - r.ahora, 'sigue sonando').toBeLessThan(0.06);
    if (!vacia) return;
    /* En la pausa, la fila queda vacía: la siguiente palabra entra ya. (Al saltar entra la del paso nuevo.) */
    const ini = await page.evaluate(() => { window.paceVozCuerpoIntenta('siguiente'); const f = window.__fuentes[window.__fuentes.length - 1]; return f.t - window.__ctx.currentTime; });
    expect(ini, 'la fila no se vació').toBeLessThan(0.1);
  };
  await callada(() => page.click('[data-pace-v1-btn="pausa"]'), true);
  await callada(() => page.click('[data-pace-v1-btn="next"]'), false);
});

test('fila-7 · una palabra que no puede esperar no se tira en silencio: dice que no y suena el tono', async ({ page, context }) => {
  await prepararVoz(page, context);
  const r = await page.evaluate(() => {
    window.__reloj = 5000;
    return ['cambia', 'ultimo', 'descansa', 'siguiente'].map((p) => {
      const n = window.__fuentes.length; const dijo = window.paceVozCuerpoIntenta(p);
      return { p, dijo, suena: window.__fuentes.length > n };
    });
  });
  for (const x of r) expect(x.dijo && !x.suena, '«' + x.p + '» dice que suena y no suena').toBe(false);
});

test('fila-8 · con el contexto suspendido (al volver del fondo), la palabra se programa igual', async ({ page, context }) => {
  await prepararVoz(page, context);
  const r = await page.evaluate(() => {
    window.__reloj = 6000;
    window.__ctx.state = 'suspended';
    const op = window.v1VozCuenta(3);
    const n = window.__fuentes.length;
    const dijo = window.paceVozCuerpoIntenta(op.voz, op.max, op);
    return { dijo, ini: window.__fuentes.length > n ? window.__fuentes[n].t : null };
  });
  expect(r.dijo, 'al volver del fondo, la primera palabra se tira').toBe(true);
  expect(r.ini - 6000).toBeLessThan(0.1);
});
