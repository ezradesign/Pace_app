/* PACE · la 1 valorada (16 nov. 2026, tras la pregunta de Ez: «la 1A mueve todas las letras, ¿la C cambia
   la duración?»). Para cada paso que cambia a mitad, en el runner de verdad y a tres tamaños, mide:
     · hoy: alto del texto, líneas y tamaño del dibujo;
     · A: con las palabras cortas de cada tramo reservadas en la pila del texto (como haría el runner),
       el alto del texto, las líneas, cuánto encoge el dibujo y cuánto corre la primera línea;
     · B: el rótulo de arriba con el tramo más largo: si cabe en una línea y si algo baja;
     · C: lo que dura cada rutina con los cambios de lado partidos en dos mitades (pantalla de cambio de
       10 s), lo que enseña su ficha, y qué cambios se quedan sin aviso.
   Nada de esto toca `app/`: los textos se ponen en el DOM y la C cambia la rutina en memoria. */
'use strict';

const P = require('./genera.piezas');

const PASOS = [
  { id: 'move.shoulder.circles', paso: 'Círculos de brazos', a: ['Atrás', 'Otro brazo', 'Atrás'], b: ['Brazo 1 · adelante', 'Brazo 1 · atrás', 'Brazo 2 · adelante', 'Brazo 2 · atrás'], c: 'lado' },
  { id: 'move.hamstrings.standing', paso: 'Círculos de tobillo', a: ['Al revés', 'Otro pie', 'Al revés'], b: ['Pie 1', 'Pie 1 · al revés', 'Pie 2', 'Pie 2 · al revés'], c: 'lado' },
  { id: 'move.wrists', paso: 'Círculos de muñeca', a: ['Al revés'], b: ['Un sentido', 'Al revés'], c: null },
  { id: 'move.desk.quick', paso: 'Giro sentado', a: ['Al otro lado'], b: ['Un lado', 'Al otro lado'], c: 'lado' },
  { id: 'move.desk.quick', paso: 'Círculos de tobillo', a: ['Otro pie'], b: ['Pie 1', 'Pie 2'], c: 'lado' },
  { id: 'extra.pausa.suelo', paso: 'Gateo con rodillas', a: ['Atrás'], b: ['Adelante', 'Atrás'], c: null },
  { id: 'extra.pausa.suelo', paso: 'Desliza el talón', a: ['Otra pierna'], b: ['Pierna 1', 'Pierna 2'], c: 'lado' },
];

async function letraGrande(page, f) {
  await page.evaluate((k) => {
    const raiz = document.querySelector('[data-pace-session-root]');
    const els = Array.from(raiz.querySelectorAll('*'));
    const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
    els.forEach((e, i) => e.style.setProperty('font-size', (tam[i] * k) + 'px', 'important'));
    window.dispatchEvent(new Event('resize'));
  }, f);
  await page.waitForTimeout(400);
}

/* Lo que se ve del paso: alto de la pila del texto, líneas del texto vivo, dibujo y dónde está el nombre. */
const leer = (page) => page.evaluate(() => {
  const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
  const cue = q('[data-pace-v1-cue]'); const lh = parseFloat(getComputedStyle(cue).lineHeight);
  const k = [...document.querySelectorAll('[data-pace-v1-kicker]')].find((e) => e.parentElement.getBoundingClientRect().width > 0);
  const raiz = q('[data-pace-session-root]');
  return { pila: Math.round(q('[data-pace-v1-pila="cue"]').getBoundingClientRect().height), lineas: Math.round(cue.getBoundingClientRect().height / lh),
    dibujo: Math.round(q('[data-pace-v1-glyph]').getBoundingClientRect().height), nombreY: Math.round(q('[data-pace-v1-name]').getBoundingClientRect().top),
    rotulo: Math.round(k.getBoundingClientRect().height), scroll: raiz.scrollHeight - raiz.clientHeight };
});

async function hastaElPaso(page, nombre) {
  for (let i = 0; i < 400; i++) {
    const r = await page.evaluate(() => {
      const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
      const raiz = q('[data-pace-v1-raiz]'); const n = q('[data-pace-v1-name]');
      return { fase: raiz && raiz.getAttribute('data-pace-v1-fase'), nombre: n && n.textContent };
    });
    if (r.nombre === nombre && r.fase === 'work') { await page.waitForTimeout(300); return; }
    await page.clock.runFor(1000);
    await page.waitForTimeout(25);
  }
  throw new Error('GUARD: no llegó a ' + nombre);
}

/* A: las palabras de cada tramo, reservadas en la pila (así el runner no salta al cambiar), y la más
   larga, viva. Devuelve cuánto corre la primera letra del texto. */
async function pintarA(page, palabras) {
  return page.evaluate((ws) => {
    const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
    const cue = q('[data-pace-v1-cue]'); const pila = q('[data-pace-v1-pila="cue"]');
    const izq = (nodo) => { const r = document.createRange(); r.setStart(nodo, 0); r.setEnd(nodo, 1); return r.getBoundingClientRect().left; };
    const t0 = [...cue.childNodes].find((n) => n.nodeType === 3);
    const antes = izq(t0);
    const acento = getComputedStyle(q('[data-pace-v1-raiz]')).getPropertyValue('--v1-acento').trim();
    const color = acento.replace(/^var\(--(\w+)\)$/, 'var(--$1-deep)');
    const marca = (p, w) => { const b = document.createElement('strong'); b.style.color = color; b.style.fontWeight = '600'; b.textContent = w + '. '; p.insertBefore(b, p.firstChild); return b; };
    ws.forEach((w) => { const c = cue.cloneNode(true); c.removeAttribute('data-pace-v1-cue'); c.className = 'pace-v1-reserva'; c.setAttribute('aria-hidden', 'true'); marca(c, w); pila.insertBefore(c, cue); });
    const larga = ws.slice().sort((x, y) => y.length - x.length)[0];
    marca(cue, larga);
    window.dispatchEvent(new Event('resize'));
    return { corre: Math.round(izq(t0) - antes), palabra: larga };
  }, palabras);
}

async function pintarB(page, rotulos) {
  await page.evaluate((rs) => {
    const k = [...document.querySelectorAll('[data-pace-v1-kicker]')].find((e) => e.parentElement.getBoundingClientRect().width > 0);
    k.textContent = rs.slice().sort((x, y) => y.length - x.length)[0];
    window.dispatchEvent(new Event('resize'));
  }, rotulos);
}

/* La C sobre los datos: cada paso que cambia de lado pasa a dos mitades con su cambio (10 s, el de siempre). */
async function duraciones(page) {
  return page.evaluate((pasos) => {
    const ids = [...new Set(pasos.map((p) => p.id))];
    const out = {};
    ids.forEach((id) => {
      const r = window.resolveBodyRoutine(id).routine;
      const partir = new Set(pasos.filter((p) => p.id === id && p.c === 'lado').map((p) => p.paso));
      const est0 = estimateDuration(moveRutinaGuiada(r), 30);
      const steps = r.steps.map((s, i) => {
        if (!partir.has(s.name)) return s;
        const activo = est0.breakdown[i + 1].active;
        const n = Object.assign({}, s, { mode: 'perSide', dur: Math.round(activo / 2) });
        delete n.reps; delete n.tempo; delete n.completion; delete n.transition;
        return n;
      });
      const rc = Object.assign({}, r, { steps });
      const est1 = estimateDuration(moveRutinaGuiada(rc), 30);
      out[id] = { nombre: r.name, declarado: r.min, fichaHoy: routineCifraMin(r, 30), fichaC: routineCifraMin(rc, 30),
        segHoy: [est0.minSec, est0.maxSec], segC: [est1.minSec, est1.maxSec], partidos: [...partir] };
    });
    return out;
  }, PASOS);
}

async function medir(abrir, browser, foto) {
  const res = { pasos: [] };
  const tallas = [{ nombre: '360×640', alto: 640 }, { nombre: '360×740', alto: 740 }, { nombre: '360×640, letra al 115 %', alto: 640, letra: 1.15 }];
  for (const p of PASOS) {
    const fila = { rutina: p.id, paso: p.paso, a: p.a, b: p.b, tallas: {} };
    for (const t of tallas) {
      /* Una sola apertura por paso y tamaño: hoy, luego B (solo el rótulo) y, con el rótulo vacío
         otra vez, A. El reloj está quieto, así que las tres son el mismo segundo. */
      const m = {};
      const { context, page } = await abrir(browser, { alto: t.alto });
      await P.lanzarRutina(page, p.id);
      await hastaElPaso(page, p.paso);
      if (t.letra) await letraGrande(page, t.letra);
      m.hoy = await leer(page);
      await pintarB(page, p.b);
      await page.waitForTimeout(400);
      m.B = await leer(page);
      await pintarB(page, ['']);
      await page.waitForTimeout(300);
      m.corre = (await pintarA(page, p.a)).corre;
      await page.waitForTimeout(500);
      m.A = await leer(page);
      await context.close();
      fila.tallas[t.nombre] = m;
      console.log('   ', p.paso, '·', t.nombre, JSON.stringify({ hoy: [m.hoy.lineas, m.hoy.dibujo], A: [m.A.lineas, m.A.dibujo, m.corre, m.A.scroll], B: [m.B.rotulo, m.B.nombreY - m.hoy.nombreY, m.B.dibujo] }));
    }
    res.pasos.push(fila);
  }
  const { context, page } = await abrir(browser, {});
  res.duraciones = await duraciones(page);
  await context.close();
  /* El mismo momento de la C que las fotos de A y B: el brazo 1 a los 17 s de trabajo. */
  const c = await abrir(browser, {});
  await P.lanzarRutina(c.page, 'move.shoulder.circles', { porLados: 32 });
  await P.hastaTrabajo(c.page);
  await P.avanzar(c.page, 17);
  await foto(c.page, '1-c-trabajo');
  await c.context.close();
  return res;
}

module.exports = { medir };
