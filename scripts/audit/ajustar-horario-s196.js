/* PACE · «Ajustar el horario» con la media jornada (s196, ronda 5)
 * ================================================================
 * Última pieza pendiente de VER del handoff de s196: el usuario dijo «entiendo
 * que en ajustar horario pero muéstramelo en un html». La pregunta de hoy
 * (`RitmoPregunta`, estado `pregunta` del panel) lleva UNA frase con los cuatro
 * selectores de la jornada completa y los cuatro chips. Se calcan dos formas de
 * meter las horas de la media jornada, en escritorio (1536×704) y en móvil
 * (390×844), y se MIDE cuánto crece el panel (cada línea se la come el aro).
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/ajustar-horario-s196.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'ajustar-horario-s196.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const EXTRA = '  .una { display: grid; grid-template-columns: minmax(0,1fr); gap: 16px; margin-top: 10px; } .lado { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; } .foto img.tel { max-width: 300px; margin: 10px auto 0; } .medida { font-size: 12px; color: var(--ink-3); margin-top: 6px; } ';

const BASE_SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 }, ritmo: {} };
const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');

async function foto(b, { viewport, movil, antes, dsf, recortar }) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: dsf || 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block', isMobile: !!movil, hasTouch: !!movil });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), BASE_SEMILLA);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-09-15T09:00:00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1800);
  if (antes) await page.evaluate(antes);
  await page.waitForTimeout(700);
  const m = await page.evaluate(() => {
    const q = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    const p = q('[data-pace-ritmo-estado="pregunta"]'); const aro = q('[data-pace-dial-number]');
    const r = p.getBoundingClientRect();
    return { panel: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), D: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pace-home-D')) || null, aroPx: aro ? Math.round(aro.getBoundingClientRect().width) : null };
  });
  const png = await page.screenshot({ type: 'png' });
  await ctx.close();
  const k = dsf || 1;
  let recorte = null;
  if (recortar) { const rc = recortar(m); recorte = uri(await sharp(png).extract({ left: Math.round(rc.left * k), top: Math.round(rc.top * k), width: Math.round(rc.width * k), height: Math.round(rc.height * k) }).png().toBuffer()); }
  return { entera: uri(png), recorte, m };
}

/* ---- los calcos, con las clases de la app ---- */
/* `sel` y `chipMedia` van DENTRO de cada calco: page.evaluate serializa la función, no su ámbito. */
const V1 = () => {
  const sel = (v) => '<select class="pace-rt-sel" aria-label="' + v + '"><option>' + v + '</option></select>';
  const chipMedia = () => { const c = document.querySelector('[data-pace-ritmo-opcion="media"] span, [data-pace-ritmo-loseta="media"] span'); if (c) c.textContent = 'De 9:00 a 13:00'; };
  const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="pregunta"]')).find((e) => e.getBoundingClientRect().width > 0);
  const f = p.querySelector('.pace-rt-frase');
  const d = document.createElement('div'); d.className = 'pace-rt-sub pace-rt-frase';
  d.innerHTML = 'Media jornada: de ' + sel('9:00') + ' a ' + sel('13:00') + '.';
  f.insertAdjacentElement('afterend', d);
  chipMedia();
};
const V2 = () => {
  const sel = (v) => '<select class="pace-rt-sel" aria-label="' + v + '"><option>' + v + '</option></select>';
  const chipMedia = () => { const c = document.querySelector('[data-pace-ritmo-opcion="media"] span, [data-pace-ritmo-loseta="media"] span'); if (c) c.textContent = 'De 9:00 a 13:00'; };
  const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="pregunta"]')).find((e) => e.getBoundingClientRect().width > 0);
  const f = p.querySelector('.pace-rt-frase');
  const ultimo = Array.from(f.childNodes).reverse().find((n) => n.nodeType === 3 && n.textContent.trim() === '.');
  if (ultimo) ultimo.textContent = '; ';
  f.insertAdjacentHTML('beforeend', 'y la media jornada, de ' + sel('9:00') + ' a ' + sel('13:00') + '.');
  chipMedia();
};

(async () => {
  const b = await chromium.launch();
  const V = { width: 1536, height: 704 }, TEL = { width: 390, height: 844 };
  const recEsc = (m) => ({ left: m.left - 16, top: m.top - 36, width: 880, height: m.panel + 52 });
  const hoy = await foto(b, { viewport: V, dsf: 2, recortar: recEsc });
  const v1 = await foto(b, { viewport: V, dsf: 2, antes: V1, recortar: recEsc });
  const v2 = await foto(b, { viewport: V, dsf: 2, antes: V2, recortar: recEsc });
  const hoyTel = await foto(b, { viewport: TEL, movil: true });
  const v1Tel = await foto(b, { viewport: TEL, movil: true, antes: V1 });
  await b.close();
  console.log(JSON.stringify({ hoy: hoy.m, v1: v1.m, v2: v2.m, hoyTel: hoyTel.m, v1Tel: v1Tel.m }));

  const card = (sello, titulo, texto, img, medida, rec, tel) => `
    <div class="tarjeta foto${rec ? ' rec' : ''}"><span class="sello${rec ? '' : ' gris'}">${sello}</span><span class="t">${titulo}</span><p>${texto}</p><img src="${img}" alt="${titulo}"${tel ? ' class="tel"' : ''}>${medida ? `<div class="medida">${medida}</div>` : ''}</div>`;
  const dif = (a, h) => (a.panel - h.panel >= 0 ? '+' : '') + (a.panel - h.panel) + ' px de panel · aro ' + (a.aroPx || '?') + ' px (hoy ' + (h.aroPx || '?') + ')';

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PACE · Ajustar el horario · con la media jornada</title>
${ESTILO.replace('</style>', EXTRA + '</style>')}
</head>
<body>
<main>
  <div class="ceja">PACE · s196 · ronda 5 · lo último pendiente de ver</div>
  <h1>«Ajustar el horario», con la media jornada</h1>
  <p>La pregunta de hoy lleva una frase con los cuatro selectores de la jornada completa (entrada, comer sí/no, hora y duración de
  la comida, salida) y los cuatro chips. La media jornada, ahora que es un horario propio (de · a, sin comida, recordado), tiene
  que poder ponerse aquí la primera vez y retocarse después. Dos formas, calcadas sobre la app real a 1536×704 (recorte de la mitad izquierda del panel, a doble
  resolución), y en el teléfono. Cada línea de más se la come el aro: la medida va debajo de cada foto.</p>

  <h2>Escritorio · 1536×704</h2>
  <div class="una">
    ${card('Hoy', 'Una frase: la jornada completa', 'Los chips dicen «hasta las…»; «Media jornada · Hasta las 12:30» porque hoy es una duración.', hoy.recorte, 'Panel ' + hoy.m.panel + ' px · aro ' + (hoy.m.aroPx || '?') + ' px')}
    ${card('V1 · dos frases · recomendada', 'Debajo, «Media jornada: de 9:00 a 13:00.»', 'Una segunda frase corta con sus dos selectores, en el mismo cuerpo. Se lee de un vistazo cuál es cuál; y el chip pasa a decir el tramo, «De 9:00 a 13:00», como la loseta por libre.', v1.recorte, dif(v1.m, hoy.m), true)}
    ${card('V2 · una frase con las dos', '«…y terminas a las 17:00; y la media jornada, de 9:00 a 13:00.»', 'Todo en una línea si cabe. Ahorra altura en escritorio, pero la frase ya lleva cuatro selectores y un interruptor: con seis, deja de leerse como una frase.', v2.recorte, dif(v2.m, hoy.m))}
  </div>

  <h2>Teléfono · 390×844</h2>
  <div class="lado">
    ${card('Hoy', 'La pregunta en la copia móvil', 'La misma frase, partida en varias líneas.', hoyTel.entera, 'Panel ' + hoyTel.m.panel + ' px', false, true)}
    ${card('V1 · dos frases', 'La segunda frase, debajo', 'En móvil V2 no cabe en una línea de todos modos: V1 es la única que se lee.', v1Tel.entera, dif(v1Tel.m, hoyTel.m), true, true)}
  </div>

  <h2>Para contestar en una línea</h2>
  <ol class="decide">
    <li><b>Ajustar el horario:</b> V1 dos frases · V2 una frase · otra cosa.</li>
    <li><b>El chip / la loseta de media jornada:</b> «De 9:00 a 13:00» (el tramo) · «Hasta las 13:00» (como los demás).</li>
  </ol>
  <p class="pie">Generada por <code>scripts/audit/ajustar-horario-s196.js</code> sobre el artefacto de v0.128.1. Fotos de la app real con el DOM retocado; nada dibujado a mano.</p>
</main>
</body>
</html>`;
  fs.writeFileSync(SALIDA, html);
  console.log('→ ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
