/* El aro con el horario abierto («¿Cuánto trabajas hoy?»), arreglado de tres maneras y pintado sobre
   la app de verdad. No toca app/: sirve el index.html con el motor del aro (home-geometry.js) cambiado
   al vuelo, y solo cuando el horario está abierto en escritorio.
   Uso: PUERTO=8970 node docs/proposals/aro-horario-10nov/pintar.js
   · hoy: la 0.197.0 tal cual.
   · A: el aro se queda del tamaño que tenía con las actividades, y la tarjeta lo corta a la misma
        altura que las actividades (deja ver el 90 % del aro, como en los otros dos estados).
   · B: el aro del tamaño de la rutina elegida; para que quepa con ese mismo corte, la tarjeta del
        horario pasa de cuatro líneas a dos (la pregunta con su frase al lado, y las dos frases del
        horario en una línea). Mismo texto.
   · C: el aro el mayor que cabe con ese mismo corte, sin tocar la tarjeta.
   Escribe fotos/ (WebP ligeras) y opciones.json. */
'use strict';
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { abrir, aEstado, medir, medirTodo } = require('./medir.js');

const RAIZ = path.resolve(__dirname, '../../..');
const DIR = __dirname;
const FOTOS = path.join(DIR, 'fotos');

/* La tarjeta corta el aro donde lo cortan las actividades: su canto, a 0,925 del diámetro desde
   arriba (medido: 0,926 con actividades y 0,920 con la rutina elegida). El motor lo dice como
   solape = 7,5 % de D más la banda de padding que hay encima del canto. */
function variante(html) {
  let n = 0;
  const out = html
    .replace('var overlap = Math.min(Math.round(D * OVERLAP_TARGET), maxOverlap);', (m) => { n++; return m +
      "\n    if (window.__maqPreg && window.__maqPreg()) { var __ch = document.querySelector('[data-pace-ritmo-panel]'), __ba = document.querySelector('[data-pace-activitybar]');" +
      " overlap = Math.min(maxOverlap, Math.round(D * 0.075) + (__ch && __ba ? Math.max(0, Math.round(paceCaja(__ch).top - paceCaja(__ba).top)) : 0)); }"; })
    .replace('var D = Math.min(widthCap * w, D_MAX);', () => { n++; return 'var D = Math.min(widthCap * w, (window.__maqPreg && window.__maqPreg() && window.__maqD) || D_MAX);'; });
  if (n !== 2) throw new Error('no encuentro las dos líneas del motor en index.html (' + n + ')');
  return out;
}
/* El horario abierto, en escritorio: el panel de la pregunta de la piel de escritorio, visible. */
const PREG = "window.__maqPreg = function () { var p = document.querySelector('.pace-rt-esc[data-pace-ritmo-estado=\"pregunta\"]'); return !!(p && p.getClientRects().length); };";
/* B: las cuatro líneas de la cabecera en dos, con el mismo texto. */
const CSS_B = `.pace-rt-esc[data-pace-ritmo-estado="pregunta"] > .pace-rt-cab > div:first-child { display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 16px; }
.pace-rt-esc[data-pace-ritmo-estado="pregunta"] > .pace-rt-cab > div:first-child::after { content: ""; flex-basis: 100%; order: 2; }
.pace-rt-esc[data-pace-ritmo-estado="pregunta"] > .pace-rt-cab > div:first-child > .pace-rt-frase { order: 3; }`;

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  const base = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const browser = await chromium.launch();
  /* Para pasar las capturas a WebP: una página en blanco con un lienzo. */
  const conv = await (await browser.newContext()).newPage();
  const webp = async (png, archivo, ancho) => {
    const b64 = await conv.evaluate(async ([src, ancho]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
      const c = document.createElement('canvas'); c.width = ancho; c.height = Math.round(img.height * ancho / img.width);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.78).split(',')[1];
    }, [png.toString('base64'), ancho]);
    fs.writeFileSync(path.join(FOTOS, archivo), Buffer.from(b64, 'base64'));
  };
  /* Fotos: el estado 1 de cada opción a los dos tamaños y, de «hoy», también los estados 2 y 3. */
  const foto = (op) => async (page, w, h, lang, e) => {
    if (lang !== 'es' || e === '2b') return;
    if (op !== 'hoy' && e !== '1') return;
    if (w !== 1920 && !(e === '1')) return;
    await webp(await page.screenshot({ type: 'png' }), `${op}-${e}-${w}x${h}.webp`, w === 1920 ? 1440 : 1152);
  };

  /* SOLO_MOVIL=1 reaprovecha lo de escritorio ya medido en opciones.json. */
  const res = process.env.SOLO_MOVIL ? JSON.parse(fs.readFileSync(path.join(DIR, 'opciones.json'), 'utf8')) : {};
  if (!process.env.SOLO_MOVIL) res.hoy = await medirTodo(browser, { foto: foto('hoy') });
  /* En el móvil la variante no corre (el horario abierto de escritorio no se ve): vale cualquier tamaño. */
  const aroCss = (est, w, lang) => (res.hoy.find((f) => f.estado === est && f.w === w && f.lang === lang) || res.hoy.find((f) => f.estado === est)).aroCss;
  const html = variante(base);
  const ops = {
    A: { inyecta: (w, h, lang) => PREG + 'window.__maqD = ' + aroCss('3', w, lang) + ';' },
    B: { inyecta: (w, h, lang) => PREG + 'window.__maqD = ' + aroCss('2', w, lang) + ';' +
      'document.addEventListener("DOMContentLoaded", function () { var s = document.createElement("style"); s.textContent = ' + JSON.stringify(CSS_B) + '; document.head.appendChild(s); });' },
    C: { inyecta: () => PREG },
  };
  for (const [op, o] of Object.entries(ops)) {
    if (process.env.SOLO_MOVIL) break;
    res[op] = await medirTodo(browser, { html, inyecta: o.inyecta, foto: foto(op) });
    console.error(op, 'hecho');
    fs.writeFileSync(path.join(DIR, 'opciones.json'), JSON.stringify(res, null, 1));
  }
  /* El móvil no puede cambiar: con actividades y con la pregunta abierta, en las cuatro. */
  res.movil = {};
  for (const op of ['hoy', 'A', 'B', 'C']) {
    res.movil[op] = await medirTodo(browser, Object.assign({ ventanas: [[360, 740]], estados: ['3', '1'], sinSalto: true },
      op === 'hoy' ? {} : { html, inyecta: ops[op].inyecta }));
  }
  await browser.close();
  fs.writeFileSync(path.join(DIR, 'opciones.json'), JSON.stringify(res, null, 1));
  for (const [op, filas] of Object.entries(res)) if (op !== 'movil') for (const f of filas) console.log(op, JSON.stringify(f));
  for (const [op, filas] of Object.entries(res.movil)) for (const f of filas) console.log('movil', op, f.lang, f.estado, f.aro, f.scroll);
})().catch((e) => { console.error(e); process.exit(1); });
