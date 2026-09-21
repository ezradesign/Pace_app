/* PACE · ARRANQUE de s197: las tres letras que faltan, en una página
 * ==================================================================
 * Lunes 21. A «¿por dónde seguimos?» el usuario pidió html a las cuatro
 * preguntas (incluida «¿has usado la app?»). Una sola página con:
 *  · A · «Ajustar el horario» con la media jornada: V1 dos frases · V2 una frase
 *    (mismos calcos que ajustar-horario-s196.js, por si no llegó a verse).
 *  · B · Qué dicen el chip y la loseta de «Media jornada»: el tramo («De 9:00 a
 *    13:00», y la completa «De 9:00 a 17:00») o «Hasta las 13:00» como los demás.
 *  · C · El paquete: qué lleva cada versión, con la foto de cada pieza (la hoja
 *    con hecha/saltada, la frase, la media jornada, la tableta con piel de móvil).
 *  · D · Uso real: qué mirar esta semana.
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/arranque-s197.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'arranque-s197.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const EXTRA = '  .una { display: grid; grid-template-columns: minmax(0,1fr); gap: 16px; margin-top: 10px; } .lado { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; } .medida { font-size: 12px; color: var(--ink-3); margin-top: 6px; } .piezas { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; margin-top: 10px; } .piezas img { width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; display: block; } .piezas .n { font-size: 11px; color: var(--ink-3); margin-top: 4px; text-align: center; } .v { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); margin: 10px 0 2px; } ';

const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } };
const ESTADOS = { 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada', 5: 'hecha' };
const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');

/* El corte de pieles movido a `hasta` (para la tableta): matchMedia antes, CSSOM después. */
const MM = (hasta) => { const mm = window.matchMedia.bind(window); window.matchMedia = (q) => mm(String(q).replace(/max-width:\s*768px/g, 'max-width: ' + hasta + 'px').replace(/min-width:\s*769px/g, 'min-width: ' + (hasta + 1) + 'px')); };
const CSSOM = (hasta) => { const fix = (rules) => { for (const r of rules) { if (r.media && /76[89]px/.test(r.media.mediaText)) r.media.mediaText = r.media.mediaText.replace(/max-width:\s*768px/g, 'max-width: ' + hasta + 'px').replace(/min-width:\s*769px/g, 'min-width: ' + (hasta + 1) + 'px'); if (r.cssRules) fix(r.cssRules); } }; for (const ss of document.styleSheets) { try { fix(ss.cssRules); } catch (e) {} } window.dispatchEvent(new Event('resize')); };

async function foto(b, { fecha, hora, viewport, ritmo, tarde, movil, dsf, forzar, antes, medir, recorte }) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: dsf || 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block', isMobile: !!movil, hasTouch: !!movil });
  const semilla = Object.assign({}, SEMILLA, tarde ? { cycle: 6, lastActiveDay: new Date(fecha + 'T12:00:00+02:00').toDateString(), _historyMigrated: true } : {}, { ritmo });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla);
  if (forzar) await ctx.addInitScript(MM, forzar);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(fecha + 'T' + hora + ':00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  if (forzar) { await page.evaluate(CSSOM, forzar); await page.waitForTimeout(900); }
  await page.waitForTimeout(1800);
  if (antes) await antes(page);
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => { const q = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0); const p = q('[data-pace-ritmo-estado]'); const r = p ? p.getBoundingClientRect() : null; return r ? { panel: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width) } : {}; });
  if (medir) recorte = await page.evaluate(medir);
  const png = await page.screenshot({ type: 'png' });
  await ctx.close();
  const k = dsf || 1;
  const rec = recorte ? await sharp(png).extract({ left: Math.round(recorte.left * k), top: Math.round(recorte.top * k), width: Math.round(recorte.width * k), height: Math.round(recorte.height * k) }).png().toBuffer() : null;
  return { entera: uri(png), recorte: rec ? uri(rec) : null, m };
}

/* ---- calcos (corren en la página; sin ámbito exterior) ---- */
const PANEL = () => Array.from(document.querySelectorAll('[data-pace-ritmo-estado]')).find((e) => e.getBoundingClientRect().width > 0);
const AJUSTAR_V1 = () => {
  const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="pregunta"]')).find((e) => e.getBoundingClientRect().width > 0);
  const sel = (v) => '<select class="pace-rt-sel"><option>' + v + '</option></select>';
  const d = document.createElement('div'); d.className = 'pace-rt-sub pace-rt-frase'; d.innerHTML = 'Media jornada: de ' + sel('9:00') + ' a ' + sel('13:00') + '.';
  p.querySelector('.pace-rt-frase').insertAdjacentElement('afterend', d);
  const c = p.querySelector('[data-pace-ritmo-opcion="media"] span'); if (c) c.textContent = 'De 9:00 a 13:00';
};
const AJUSTAR_V2 = () => {
  const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="pregunta"]')).find((e) => e.getBoundingClientRect().width > 0);
  const sel = (v) => '<select class="pace-rt-sel"><option>' + v + '</option></select>';
  const f = p.querySelector('.pace-rt-frase');
  const ultimo = Array.from(f.childNodes).reverse().find((n) => n.nodeType === 3 && n.textContent.trim() === '.'); if (ultimo) ultimo.textContent = '; ';
  f.insertAdjacentHTML('beforeend', 'y la media jornada, de ' + sel('9:00') + ' a ' + sel('13:00') + '.');
  const c = p.querySelector('[data-pace-ritmo-opcion="media"] span'); if (c) c.textContent = 'De 9:00 a 13:00';
};
const CHIPS = (modo) => {
  const fija = (sel, txt) => document.querySelectorAll(sel).forEach((e) => { const s = e.querySelector('span'); if (s) s.textContent = txt; });
  if (modo === 'tramo') { fija('[data-pace-ritmo-opcion="media"], [data-pace-ritmo-loseta="media"]', 'De 9:00 a 13:00'); fija('[data-pace-ritmo-opcion="jornada"], [data-pace-ritmo-loseta="jornada"]', 'De 9:00 a 17:00'); }
  else { fija('[data-pace-ritmo-opcion="media"], [data-pace-ritmo-loseta="media"]', 'Hasta las 13:00'); }
};
/* Solo los dos chips de la derecha (media y completa): a lo ancho de la fila no se leen. */
const REC_CHIPS = () => { const m = document.querySelector('[data-pace-ritmo-opcion="media"], [data-pace-ritmo-loseta="media"]').getBoundingClientRect(); const j = document.querySelector('[data-pace-ritmo-opcion="jornada"], [data-pace-ritmo-loseta="jornada"]').getBoundingClientRect(); return { left: m.left - 12, top: m.top - 12, width: j.right - m.left + 24, height: m.height + 24 }; };
const REC_PREGUNTA = () => { const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="pregunta"]')).find((e) => e.getBoundingClientRect().width > 0).getBoundingClientRect(); return { left: p.left - 16, top: p.top - 36, width: 880, height: p.height + 52 }; };
const FRASE = () => {
  const a = Array.from(document.querySelectorAll('[data-pace-sidebar-accion]')).find((e) => e.getBoundingClientRect().width > 0);
  const d = document.createElement('p'); d.textContent = 'Llevas seis bloques y cuatro pausas';
  d.style.cssText = 'margin:9px 0 0;padding-top:8px;border-top:1px solid var(--line);line-height:1.5;font-family:var(--font-display);font-style:italic;font-size:13px;color:var(--ink-2)';
  a.querySelector('p').insertAdjacentElement('afterend', d);
};
const HOJA = async (page) => {
  await page.getByText('Ver la jornada entera').filter({ visible: true }).first().click(); await page.waitForTimeout(700);
  await page.evaluate((E) => { Array.from(document.querySelectorAll('[data-pace-ritmo-lista] .pace-rt-li.pace-rt-plato')).forEach((f, i) => { const e = E[i + 1]; if (!e) return; const g = f.querySelector('.pace-rt-eje i'); const m = f.querySelector('.pace-rt-plato-m'); const dur = (m.textContent.match(/(\d+) min/) || [])[1]; if (e === 'hecha') { f.classList.remove('pace-rt-pasado'); g.style.border = '1.5px solid var(--c)'; g.style.background = 'color-mix(in srgb, var(--c) 22%, var(--paper))'; m.textContent = 'hecha · ' + (dur || '') + ' min'; } else { g.style.borderStyle = 'dashed'; m.textContent = 'saltada'; f.style.opacity = '0.4'; } }); }, ESTADOS);
};
const CAB_MEDIA = () => {
  const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="menu"]')).find((e) => e.getBoundingClientRect().width > 0);
  const sel = (v) => '<select class="pace-rt-sel"><option>' + v + '</option></select>';
  p.querySelector('.pace-rt-titulo').innerHTML = 'Media jornada <span class="pace-rt-sub" style="display:inline">· de ' + sel('9:00') + ' a ' + sel('13:00') + '</span>';
};
const REC_TITULO = () => { const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="menu"]')).find((e) => e.getBoundingClientRect().width > 0); const r = p.querySelector('.pace-rt-titulo').getBoundingClientRect(); return { left: r.left - 16, top: r.top - 14, width: r.width + 32, height: r.height + 28 }; };

(async () => {
  const b = await chromium.launch();
  const V = { width: 1536, height: 704 }, TEL = { width: 390, height: 844 };
  const P = { fecha: '2026-09-21', hora: '09:00', viewport: V, ritmo: {}, dsf: 2 };
  const ajHoy = await foto(b, Object.assign({}, P, { medir: REC_PREGUNTA }));
  const ajV1 = await foto(b, Object.assign({}, P, { medir: REC_PREGUNTA, antes: (p) => p.evaluate(AJUSTAR_V1) }));
  const ajV2 = await foto(b, Object.assign({}, P, { medir: REC_PREGUNTA, antes: (p) => p.evaluate(AJUSTAR_V2) }));
  const chipsTramo = await foto(b, Object.assign({}, P, { medir: REC_CHIPS, antes: (p) => p.evaluate(CHIPS, 'tramo') }));
  const chipsHasta = await foto(b, Object.assign({}, P, { medir: REC_CHIPS, antes: (p) => p.evaluate(CHIPS, 'hasta') }));
  const L = { fecha: '2026-09-21', hora: '09:00', viewport: V, ritmo: { libre: true }, dsf: 2, medir: REC_CHIPS };
  const losTramo = await foto(b, Object.assign({}, L, { antes: (p) => p.evaluate(CHIPS, 'tramo') }));
  const losHasta = await foto(b, Object.assign({}, L, { antes: (p) => p.evaluate(CHIPS, 'hasta') }));
  const T = { fecha: '2026-09-22', hora: '15:30', viewport: V, tarde: true, ritmo: { dia: { fecha: '2026-09-22', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, estados: ESTADOS } }, dsf: 2 };
  const frase = await foto(b, Object.assign({}, T, { recorte: { left: 0, top: 300, width: 300, height: 200 }, antes: (p) => p.evaluate(FRASE) }));
  const hoja = await foto(b, Object.assign({}, T, { viewport: TEL, movil: true, dsf: 1, antes: HOJA }));
  const media = await foto(b, { fecha: '2026-09-21', hora: '09:00', viewport: V, ritmo: { dia: { fecha: '2026-09-21', opcion: 'media', desde: 540, cicloBase: 0, cambios: {} } }, dsf: 2, medir: REC_TITULO, antes: (p) => p.evaluate(CAB_MEDIA) });
  const tab = await foto(b, { fecha: '2026-09-21', hora: '09:00', viewport: { width: 820, height: 1180 }, ritmo: { dia: { fecha: '2026-09-21', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } }, movil: true, forzar: 1100 });
  await b.close();
  console.log(JSON.stringify({ hoy: ajHoy.m, v1: ajV1.m, v2: ajV2.m }));

  const card = (sello, titulo, texto, img, extra, rec) => `
    <div class="tarjeta foto${rec ? ' rec' : ''}"><span class="sello${rec ? '' : ' gris'}">${sello}</span><span class="t">${titulo}</span><p>${texto}</p>${img ? `<img src="${img}" alt="${titulo}">` : ''}${extra || ''}</div>`;
  const pieza = (img, n) => `<div><img src="${img}" alt="${n}"><div class="n">${n}</div></div>`;
  const PZ = { hoja: pieza(hoja.entera, 'La hoja con hecha/saltada'), frase: pieza(frase.recorte, 'La frase en la barra lateral'), media: pieza(media.recorte, 'Media jornada con horas'), tab: pieza(tab.entera, 'La tableta con piel de móvil') };
  const dif = (a) => '+' + (a.m.panel - ajHoy.m.panel) + ' px de panel respecto a hoy (' + ajHoy.m.panel + ')';

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PACE · Arranque de s197 · lo que falta por decidir</title>
${ESTILO.replace('</style>', EXTRA + '</style>')}
</head>
<body>
<main>
  <div class="ceja">PACE · s197 · lunes 21 · lo que falta por decidir, pintado</div>
  <h1>Tres letras y una pregunta, y arrancamos</h1>
  <p>Todo lo grande está decidido y escrito en el handoff (la hoja con hecha/saltada, la frase «Llevas seis bloques y cuatro
  pausas», la tableta con la piel de móvil hasta 1024, la media jornada como horario propio sin comida, la comida solo en la
  jornada completa). Quedan tres cosas pequeñas que se deciden mirando, y el paquete. Fotos de la app real (v0.128.1) con el
  DOM retocado.</p>

  <h2>A · «Ajustar el horario» con las horas de la media jornada</h2>
  <p>La pregunta de hoy lleva una frase con los cuatro selectores de la completa. La media jornada tiene que poder ponerse aquí
  la primera vez y retocarse después. Recorte de la mitad izquierda del panel, a doble resolución; la medida, debajo.</p>
  <div class="una">
    ${card('Hoy', 'Una frase: solo la jornada completa', 'Los chips dicen «hasta las…».', ajHoy.recorte, '<div class="medida">Panel ' + ajHoy.m.panel + ' px</div>')}
    ${card('A1 · dos frases · recomendada', 'Debajo, «Media jornada: de 9:00 a 13:00.»', 'Una segunda frase corta con sus dos selectores. Se lee cuál es cuál.', ajV1.recorte, '<div class="medida">' + dif(ajV1) + ' · en móvil, +21</div>', true)}
    ${card('A2 · una frase', '«…y terminas a las 17:00; y la media jornada, de 9:00 a 13:00.»', 'Sin coste de altura en escritorio; seis selectores y un interruptor en una línea, y en móvil se parte igual.', ajV2.recorte, '<div class="medida">' + dif(ajV2) + '</div>')}
  </div>

  <h2>B · Qué dicen el chip y la loseta de «Media jornada»</h2>
  <p>Arriba, los dos chips de la derecha en la pregunta; abajo, las dos losetas de la derecha en la tarjeta por libre (Una hora y Dos
  horas no cambian). Izquierda: el tramo (y la completa también lo dice). Derecha: «Hasta las…» como los demás.</p>
  <div class="lado">
    ${card('B1 · el tramo · recomendada', '«De 9:00 a 13:00» y «De 9:00 a 17:00»', 'Las dos jornadas son horarios y lo dicen; Una hora y Dos horas siguen con «Hasta las…» porque son un rato desde ahora.', chipsTramo.recorte, `<img src="${losTramo.recorte}" alt="losetas, tramo" style="margin-top:8px">`, true)}
    ${card('B2 · «Hasta las…»', '«Hasta las 13:00», como los otros tres', 'Uniforme; no dice que empieza a una hora fija.', chipsHasta.recorte, `<img src="${losHasta.recorte}" alt="losetas, hasta" style="margin-top:8px">`)}
  </div>

  <h2>C · El paquete: qué lleva cada versión</h2>
  <div class="tres">
    <div class="tarjeta rec"><span class="sello">C1 · recomendada</span><span class="t">Dos versiones</span>
      <div class="v">v0.129.0 · lo hecho y la media jornada</div><div class="piezas">${PZ.hoja}${PZ.frase}${PZ.media}</div>
      <div class="v">v0.130.0 · la tableta</div><div class="piezas">${PZ.tab}</div>
      <p>Un cierre por cosa. Si el breakpoint se tuerce, lo demás ya está publicado.</p></div>
    <div class="tarjeta"><span class="sello gris">C2</span><span class="t">La tableta primero</span>
      <div class="v">v0.129.0</div><div class="piezas">${PZ.tab}</div>
      <div class="v">v0.130.0</div><div class="piezas">${PZ.hoja}${PZ.frase}${PZ.media}</div>
      <p>Si vas a usar la tableta esta semana.</p></div>
    <div class="tarjeta"><span class="sello gris">C3</span><span class="t">Solo lo hecho</span>
      <div class="v">v0.129.0</div><div class="piezas">${PZ.hoja}${PZ.frase}</div>
      <div class="v">después</div><div class="piezas">${PZ.media}${PZ.tab}</div>
      <p>La media jornada espera a que uses la app una semana.</p></div>
  </div>

  <h2>D · Uso real</h2>
  <div class="una">
    <div class="tarjeta"><span class="sello gris">Esta semana, si la usas</span><span class="t">Qué mirar</span>
      <p>Tres cosas que solo tú puedes ver: si <b>la semana</b> se nota sin copy (hoy lunes 21 es semana de manos: Grip y Muñecas primero);
      si <b>«Seguir con el bloque»</b> te deja saltar la pausa sin culpa y la línea lo recuerda bien; y si <b>el vaso de agua</b> llega cuando
      toca (≥ 50 min, la comida cuenta). Una captura por cosa, como el sábado, y entran en la versión siguiente.</p></div>
  </div>

  <h2>Para contestar en una línea</h2>
  <ol class="decide">
    <li><b>A:</b> A1 dos frases · A2 una frase.</li>
    <li><b>B:</b> B1 el tramo · B2 «Hasta las…».</li>
    <li><b>C:</b> C1 dos versiones · C2 la tableta primero · C3 solo lo hecho.</li>
    <li><b>D:</b> no la he usado · sin novedades · tengo cosas (y me las cuentas).</li>
  </ol>
  <p class="pie">Generada por <code>scripts/audit/arranque-s197.js</code> sobre el artefacto de v0.128.1. Fotos de la app real con el DOM retocado; la tableta con el corte forzado en la foto; nada dibujado a mano.</p>
</main>
</body>
</html>`;
  fs.writeFileSync(SALIDA, html);
  console.log('→ ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
