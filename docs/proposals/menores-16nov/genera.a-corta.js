/* PACE · la 1A con la condición de Ez (16 nov. 2026): «que nada modifique las líneas o se superponga o
   cambie el formato que ya tenemos». Para cada paso que cambia a mitad, en el runner de verdad (con la voz
   ya en main), a 360 × 640, 360 × 740 y con la letra al 115 %, en castellano y en inglés, prueba sus
   palabras de la preferida a la más corta y dice, para cada juego:
     · las líneas del texto del paso hoy y con cada palabra delante (ninguna puede tener más);
     · el alto del hueco del texto con todas las palabras reservadas (como haría el runner) y el tamaño
       del dibujo después de volver a medirse: los dos, iguales que hoy;
     · que nada se pisa (el texto acaba antes que el número) y que la pantalla no pide scroll.
   El primer juego que cumple en los seis tamaños es el que se monta. Nada de esto toca `app/`. */
'use strict';

const P = require('./genera.piezas');

const PASOS = [
  { id: 'move.shoulder.circles', i: 0, nombre: 'Círculos de brazos · Brazos libres',
    es: [['Atrás', 'Otro brazo'], ['Atrás', 'Cambia']], en: [['Back', 'Other arm'], ['Back', 'Switch']] },
  { id: 'move.hamstrings.standing', i: 2, nombre: 'Círculos de tobillo · Piernas en pausa',
    es: [['Al revés', 'Otro pie'], ['Al revés', 'Cambia']], en: [['Reverse', 'Other foot'], ['Reverse', 'Switch']] },
  { id: 'move.wrists', i: 1, nombre: 'Círculos de muñeca · Manos y muñecas', es: [['Al revés']], en: [['Reverse']] },
  { id: 'move.desk.quick', i: 1, nombre: 'Círculos de muñeca · Escritorio express', es: [['Al revés']], en: [['Reverse']] },
  { id: 'move.desk.quick', i: 2, nombre: 'Giro sentado · Escritorio express',
    es: [['Al otro lado'], ['Otro lado'], ['Cambia']], en: [['Other side'], ['Switch']] },
  { id: 'move.desk.quick', i: 3, nombre: 'Círculos de tobillo · Escritorio express',
    es: [['Otro pie'], ['Cambia']], en: [['Other foot'], ['Switch']] },
  { id: 'extra.pausa.suelo', i: 4, nombre: 'Gateo con rodillas · Fuerza en suelo', es: [['Atrás']], en: [['Back']] },
  { id: 'extra.pausa.suelo', i: 3, nombre: 'Desliza el talón · Fuerza en suelo',
    es: [['Otra pierna'], ['Cambia']], en: [['Other leg'], ['Switch']] },
];
const TALLAS = [
  { nombre: '640', alto: 640 }, { nombre: '740', alto: 740 }, { nombre: '640 · letra 115 %', alto: 640, letra: 1.15 },
];

async function letraGrande(page, f) {
  await page.evaluate((k) => {
    const raiz = document.querySelector('[data-pace-session-root]');
    const els = Array.from(raiz.querySelectorAll('*'));
    const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
    els.forEach((e, i) => e.style.setProperty('font-size', (tam[i] * k) + 'px', 'important'));
    window.dispatchEvent(new Event('resize'));
  }, f);
  await page.waitForTimeout(500);
}

/* Hasta el paso `i` trabajando: el número del paso sale de «Paso N de M» / «Step N of M». */
async function hastaElPaso(page, i) {
  for (let k = 0; k < 600; k++) {
    const r = await page.evaluate(() => {
      const raiz = [...document.querySelectorAll('[data-pace-v1-raiz]')].find((e) => e.getBoundingClientRect().width > 0);
      const meta = [...document.querySelectorAll('[data-pace-session-root] *')].find((e) => e.children.length === 0 && /^(Paso|Step) \d+ (de|of) \d+$/.test(e.textContent.trim()));
      return { fase: raiz && raiz.getAttribute('data-pace-v1-fase'), n: meta ? +meta.textContent.match(/\d+/)[0] - 1 : -1 };
    });
    if (r.n === i && r.fase === 'work') { await page.waitForTimeout(400); return; }
    await page.clock.runFor(1000);
    await page.waitForTimeout(20);
  }
  throw new Error('GUARD: no llegó al paso ' + i);
}

const leer = (page) => page.evaluate(() => {
  const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
  const cue = q('[data-pace-v1-cue]'); const lh = parseFloat(getComputedStyle(cue).lineHeight);
  const raiz = q('[data-pace-session-root]');
  return { lineas: Math.round(cue.getBoundingClientRect().height / lh), pila: Math.round(q('[data-pace-v1-pila="cue"]').getBoundingClientRect().height),
    dibujo: Math.round(q('[data-pace-v1-glyph]').getBoundingClientRect().height), scroll: raiz.scrollHeight - raiz.clientHeight,
    pisa: Math.round(q('[data-pace-v1-pila="cue"]').getBoundingClientRect().bottom - q('.pace-v1-numgrupo').getBoundingClientRect().top), texto: cue.textContent };
});

/* Un juego de palabras: todas reservadas en la pila, y cada una viva por turno para contar sus líneas. */
async function probar(page, palabras) {
  const lineas = [];
  for (const w of palabras) {
    await page.evaluate(([ws, viva]) => {
      const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
      const cue = q('[data-pace-v1-cue]'); const pila = q('[data-pace-v1-pila="cue"]');
      document.querySelectorAll('[data-maqueta]').forEach((e) => e.remove());
      const acento = getComputedStyle(q('[data-pace-v1-raiz]')).getPropertyValue('--v1-acento').trim();
      const color = acento.replace(/^var\(--(\w+)\)$/, 'var(--$1-deep)');
      const marca = (p, x) => { const b = document.createElement('strong'); b.setAttribute('data-maqueta', ''); b.style.color = color; b.style.fontWeight = '600'; b.textContent = x + '. '; p.insertBefore(b, p.firstChild); };
      ws.forEach((x) => { const c = cue.cloneNode(true); c.removeAttribute('data-pace-v1-cue'); c.className = 'pace-v1-reserva'; c.setAttribute('aria-hidden', 'true'); c.setAttribute('data-maqueta', ''); marca(c, x); pila.insertBefore(c, cue); });
      marca(cue, viva);
      window.dispatchEvent(new Event('resize'));
    }, [palabras, w]);
    await page.waitForTimeout(450);
    lineas.push((await leer(page)).lineas);
  }
  const m = await leer(page);
  await page.evaluate(() => { document.querySelectorAll('[data-maqueta]').forEach((e) => e.remove()); window.dispatchEvent(new Event('resize')); });
  await page.waitForTimeout(400);
  return { palabras, lineas, pila: m.pila, dibujo: m.dibujo, scroll: m.scroll, pisa: m.pisa };
}

async function medir(abrir, browser) {
  const res = [];
  for (const p of PASOS) {
    for (const lang of ['es', 'en']) {
      for (const t of TALLAS) {
        const { context, page } = await abrir(browser, { alto: t.alto, estado: { lang } });
        await P.lanzarRutina(page, p.id);
        await hastaElPaso(page, p.i);
        if (t.letra) await letraGrande(page, t.letra);
        const hoy = await leer(page);
        const juegos = [];
        for (const ws of p[lang]) {
          const j = await probar(page, ws);
          j.cumple = Math.max(...j.lineas) <= hoy.lineas && j.pila === hoy.pila && j.dibujo === hoy.dibujo && j.scroll <= 0 && j.pisa <= 0;
          juegos.push(j);
        }
        res.push({ paso: p.nombre, id: p.id, i: p.i, lang, talla: t.nombre, hoy: { lineas: hoy.lineas, pila: hoy.pila, dibujo: hoy.dibujo, texto: hoy.texto }, juegos });
        console.log('   ', p.nombre, lang, t.nombre, 'hoy', hoy.lineas + 'l', hoy.dibujo + 'px', juegos.map((j) => j.palabras.join('/') + ' ' + j.lineas.join(',') + 'l ' + j.dibujo + 'px ' + (j.cumple ? 'CUMPLE' : 'no')).join(' | '));
        await context.close();
      }
    }
  }
  return res;
}

/* LOS TRES QUE NO CABEN CON LA LETRA AL 115 %: el texto sin la frase que la palabra ya dice. La condición
   es la misma, contada contra el texto de hoy: el nuevo, sin palabra y con cada una, no puede tener más
   líneas que el de hoy, ni cambiar el alto del hueco ni el dibujo (si el de hoy era el más largo de la
   rutina, acortarlo también movería el dibujo). */
const ALTERNATIVAS = [
  { id: 'move.shoulder.circles', i: 0, nombre: 'Círculos de brazos · Brazos libres',
    es: { texto: 'De pie, brazo estirado: ocho círculos lentos, cuatro adelante y cuatro atrás.', palabras: ['Atrás', 'Otro brazo'] },
    en: { texto: 'Standing, arm straight: eight slow circles, four forward and four back.', palabras: ['Back', 'Other arm'] } },
  { id: 'extra.pausa.suelo', i: 4, nombre: 'Gateo con rodillas · Fuerza en suelo',
    es: { texto: 'Cuatro pasos cortos adelante y cuatro atrás, despacio, mano y rodilla contrarias.', palabras: ['Atrás'] },
    en: { texto: 'Crawl four short steps forward, slowly, moving opposite hand and knee. Then four back.', palabras: ['Back'] } },
  { id: 'extra.pausa.suelo', i: 3, nombre: 'Desliza el talón · Fuerza en suelo',
    es: { texto: 'Desliza un talón por el suelo sin mover la pelvis, y vuelve.', palabras: ['Otra pierna'] },
    en: { texto: 'Slide one heel along the floor without moving your pelvis, then back.', palabras: ['Other leg'] } },
];

async function medirAlternativas(abrir, browser) {
  const res = [];
  for (const p of ALTERNATIVAS) {
    for (const lang of ['es', 'en']) {
      for (const t of TALLAS) {
        const { context, page } = await abrir(browser, { alto: t.alto, estado: { lang } });
        await P.lanzarRutina(page, p.id);
        await hastaElPaso(page, p.i);
        if (t.letra) await letraGrande(page, t.letra);
        const hoy = await leer(page);
        /* El texto nuevo, en el vivo y en su reserva de la pila. */
        await page.evaluate(([viejo, nuevo]) => {
          const q = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
          const pila = q('[data-pace-v1-pila="cue"]');
          [...pila.children].forEach((c) => { if (c.textContent.trim() === viejo.trim()) c.textContent = nuevo; });
          window.dispatchEvent(new Event('resize'));
        }, [hoy.texto, p[lang].texto]);
        await page.waitForTimeout(450);
        const sin = await leer(page);
        const j = await probar(page, p[lang].palabras);
        const lineas = [sin.lineas].concat(j.lineas);
        const cumple = Math.max(...lineas) <= hoy.lineas && sin.pila === hoy.pila && j.pila === hoy.pila && sin.dibujo === hoy.dibujo && j.dibujo === hoy.dibujo && j.scroll <= 0 && j.pisa <= 0;
        res.push({ paso: p.nombre, lang, talla: t.nombre, texto: p[lang].texto, hoy: { lineas: hoy.lineas, pila: hoy.pila, dibujo: hoy.dibujo },
          sinPalabra: { lineas: sin.lineas, pila: sin.pila, dibujo: sin.dibujo }, conPalabra: j, cumple });
        console.log('   ', p.nombre, lang, t.nombre, 'hoy', hoy.lineas + 'l', hoy.pila + '/' + hoy.dibujo, '· texto nuevo', sin.lineas + 'l', sin.pila + '/' + sin.dibujo, '· con palabra', j.lineas.join(',') + 'l', j.pila + '/' + j.dibujo, cumple ? 'CUMPLE' : 'no');
        await context.close();
      }
    }
  }
  return res;
}

module.exports = { medir, medirAlternativas, PASOS, ALTERNATIVAS };
