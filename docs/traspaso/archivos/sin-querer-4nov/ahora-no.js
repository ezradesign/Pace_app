/* Las dos lecturas del «Ahora no», con la misma app:
   - abajo: como está montado, en su línea, debajo de Sí · Un poco · No.
   - fila:  como estaba hasta la 0.189.1, al final de la misma fila. Sale de parchear el index.html compilado por `page.route`.
   Uso: node ahora-no.js [abajo,fila] [m,e,ez,...]   →   %TEMP%/pace-sin-querer-4nov/fotos-ahora-no/*.jpg y medidas.json */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const SALIDA = path.join(C.FOTOS, 'fotos-ahora-no');
const QUE = (process.argv[2] || 'abajo,fila').split(',');
const SOLO = process.argv[3] ? process.argv[3].split(',') : null;
const MARTES = new Date('2026-11-03T10:20:00+01:00');

function indexEnFila() {
  const t = fs.readFileSync(path.join(C.RAIZ, 'index.html'), 'utf8');
  const fila = /(t\('session\.feedback\.no'\)\s*\)\s*)\)(\s*,\s*)(React\.createElement\("button", \{ type: "button", "data-pace-fb-ghost": true[\s\S]*?t\('session\.feedback\.later'\)\s*\))(\s*\))/;
  if (!fila.test(t)) throw new Error('el botón compilado ya no tiene esta forma');
  const margen = "padding: '4px 10px', marginTop: 8,";
  const css = '[data-pace-fb-ghost] { margin-top: 4px !important; padding: 2px 10px !important; }';
  if (!t.includes(margen) || !t.includes(css)) throw new Error('los estilos compilados ya no tienen esta forma');
  return t.replace(fila, (m, a, b, c, d) => a + b + c + ')' + d)
    .replace(margen, "padding: '4px 10px',")
    .replace(css, '[data-pace-fb-ghost] { padding: 2px 10px !important; }');
}

const VENTANAS = [
  { n: 'm', ancho: 360, alto: 730, dsf: 2 },
  { n: 'm', ancho: 360, alto: 730, dsf: 2, oscuro: true },
  { n: 'e', ancho: 1280, alto: 879, dsf: 1.5 },
  { n: 'e', ancho: 1280, alto: 879, dsf: 1.5, oscuro: true },
  { n: 'ez', ancho: 1536, alto: 708, dsf: 1.25 },
  { n: 'bajo', ancho: 1280, alto: 600, dsf: 1.5 },
  { n: 'estrecho', ancho: 320, alto: 640, dsf: 2 },
  { n: 'm-en', ancho: 360, alto: 730, dsf: 2, lang: 'en' },
  /* El cierre que Ez vio tapado el 15 oct.: Estira lleva el dibujo grande y su ventana es baja. */
  { n: 'ez-estira', ancho: 1536, alto: 708, dsf: 1.25, rutina: 'move.desk.quick' },
];

async function hastaElCierre(page, rutina) {
  await page.evaluate((id) => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: id } })), rutina || 'breathe.physiological');
  await page.waitForTimeout(500);
  for (let i = 0; i < 120; i++) {
    if (await page.locator('[data-pace-session-feedback]').count()) break;
    const empezar = page.getByRole('button', { name: /^(Empezar|Empezar ahora|Empezar ya)$/ }).filter({ visible: true });
    if (await empezar.count()) await empezar.first().click();
    await page.clock.fastForward(10000);
    await page.waitForTimeout(60);
  }
  await page.waitForSelector('[data-pace-fb-question]', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(600);
}

const medir = (page) => page.evaluate(() => {
  const caja = (e) => e.getBoundingClientRect();
  const fantasma = document.querySelector('[data-pace-fb-ghost]');
  const chips = [...document.querySelectorAll('[data-pace-fb-chip]')];
  const pie = document.querySelector('[data-pace-session-footer] button');
  const g = caja(fantasma), ult = caja(chips[chips.length - 1]);
  let dentro = 0;
  for (let i = 1; i <= 9; i++) for (let j = 1; j <= 3; j++) {
    const e = document.elementFromPoint(g.left + g.width * i / 10, g.top + g.height * j / 4);
    if (e && (e === fantasma || fantasma.contains(e))) dentro++;
  }
  const hondo = [...document.querySelectorAll('[data-pace-session-root] *')].filter((e) => e.scrollHeight - e.clientHeight > 1 && /auto|scroll/.test(getComputedStyle(e).overflowY));
  return {
    misma_fila: Math.abs((g.top + g.bottom) / 2 - (ult.top + ult.bottom) / 2) < 4,
    filas_de_respuestas: new Set(chips.map((c) => Math.round(caja(c).top))).size,
    alto_del_bloque: Math.round(caja(document.querySelector('[data-pace-session-feedback]')).height),
    al_pie: pie ? Math.round(caja(pie).top - g.bottom) : null,
    visto: Math.round(100 * dentro / 27),
    alto_del_enlace: Math.round(g.height),
    scroll: hondo.map((e) => e.scrollHeight - e.clientHeight),
    dibujo: Math.round((caja(document.querySelector('[data-pace-session-done] svg, [data-pace-session-done] [data-pace-done-glifo]') || document.body)).height),
  };
});

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await C.servidor();
  const browser = await C.chromium.launch();
  const MEDIDAS = path.join(SALIDA, 'medidas.json');
  const medidas = fs.existsSync(MEDIDAS) ? JSON.parse(fs.readFileSync(MEDIDAS, 'utf8')) : {};
  try {
    for (const v of QUE) for (const w of VENTANAS.filter((x) => !SOLO || SOLO.includes(x.n))) {
      const rutas = v === 'fila' ? { 'index.html': indexEnFila() } : null;
      const { context, page } = await C.abrir(browser, Object.assign({}, w, { hora: MARTES, rutas, estado: { ritmo: { libre: true } } }));
      await hastaElCierre(page, w.rutina);
      const n = v + '-' + w.n + (w.oscuro ? '-osc' : '');
      await page.screenshot({ path: path.join(SALIDA, n + '.jpg'), type: 'jpeg', quality: 84 });
      medidas[n] = await medir(page);
      console.log(n, JSON.stringify(medidas[n]));
      await context.close();
    }
  } finally {
    await browser.close();
    if (srv) srv.kill();
    fs.writeFileSync(MEDIDAS, JSON.stringify(medidas, null, 1));
  }
})().catch((e) => { console.error(e); process.exit(1); });
