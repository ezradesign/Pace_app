/* PACE · DECIDIR VIENDO, ronda 3 de s196
 * ======================================
 * A las cuatro preguntas (la frase de la barra lateral, el corte de la tableta,
 * el orden de las versiones, la media jornada) el usuario volvió a contestar
 * «dame html para decidir y ver». Cada una, pintada:
 *
 *  · C · la tarjeta «Siguiente pausa» con la frase y sin ella, al lado de la línea
 *    que ya dice lo mismo nodo a nodo (por eso C3 era redundante).
 *  · D · CINCO pantallas verticales reales (iPad 768×1024 · iPad Air 820×1180 ·
 *    iPad Pro 11" 834×1194 · iPad Pro 12,9" 1024×1366 · una ventana de escritorio
 *    de 900×1200), cada una tal cual y CON LA PIEL DE MÓVIL. La piel de móvil no
 *    existe por encima de 768, así que se fuerza en la foto como lo haría el
 *    breakpoint: `matchMedia` reescrito antes de cargar y las media queries del
 *    CSSOM reescritas después (todo el corte vive en `(max-width: 768px)` /
 *    `(min-width: 769px)`, medido con grep: 18 archivos, ningún innerWidth).
 *  · Orden · tres paquetes, con las piezas que lleva cada uno.
 *  · Media jornada · la loseta y la cabecera, hoy y con horas.
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/decidir-s196.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'decidir-s196.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const EXTRA = '  .una { display: grid; grid-template-columns: minmax(0,1fr); gap: 16px; margin-top: 10px; } .lado { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; } .disp { text-align: center; } .disp img { width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; display: block; } .disp .d { font-size: 12px; margin: 6px 0 2px; } .disp .h { font-size: 11px; color: var(--ink-3); } .regla { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 4px; } .regla span { font-size: 11px; padding: 3px 9px; border-radius: 999px; border: 1px solid var(--line); color: var(--ink-3); } .regla span.m { background: var(--focus-cta); color: var(--paper); border-color: var(--focus-cta); } .decidido { opacity: .75; } ';

const BASE_SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } };
const ESTADOS = { 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada', 5: 'hecha' };
const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');

/* El corte de pieles, movido a `hasta` px: antes de cargar (matchMedia) y después (CSSOM). */
const MM = (hasta) => {
  const mm = window.matchMedia.bind(window);
  window.matchMedia = (q) => mm(String(q).replace(/max-width:\s*768px/g, 'max-width: ' + hasta + 'px').replace(/min-width:\s*769px/g, 'min-width: ' + (hasta + 1) + 'px'));
};
const CSSOM = (hasta) => {
  const fix = (rules) => { for (const r of rules) { if (r.media && /76[89]px/.test(r.media.mediaText)) r.media.mediaText = r.media.mediaText.replace(/max-width:\s*768px/g, 'max-width: ' + hasta + 'px').replace(/min-width:\s*769px/g, 'min-width: ' + (hasta + 1) + 'px'); if (r.cssRules) fix(r.cssRules); } };
  for (const ss of document.styleSheets) { try { fix(ss.cssRules); } catch (e) {} }
  window.dispatchEvent(new Event('resize'));
};

async function foto(b, { fecha, hora, viewport, opcion, tarde, libre, movil, recorte, antes, dsf, forzar }) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: dsf || 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block', isMobile: !!movil, hasTouch: !!movil });
  const dia = { fecha, opcion: opcion || 'jornada', desde: 540, cicloBase: 0, cambios: {} };
  if (tarde) dia.estados = ESTADOS;
  const semilla = Object.assign({}, BASE_SEMILLA, tarde ? { cycle: 6, lastActiveDay: new Date(fecha + 'T12:00:00+02:00').toDateString(), _historyMigrated: true } : {}, { ritmo: libre ? { libre: true } : { dia } });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla);
  if (forzar) await ctx.addInitScript(MM, forzar);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(fecha + 'T' + hora + ':00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  if (forzar) { await page.evaluate(CSSOM, forzar); await page.waitForTimeout(900); }
  await page.waitForTimeout(1800);
  if (antes) await antes(page);
  await page.waitForTimeout(500);
  const png = await page.screenshot({ type: 'png' });
  const m = await page.evaluate(() => { const q = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0); const aro = q('[data-pace-dial-number]'); const sb = q('[data-pace-sidebar-accion]'); return { aro: aro ? Math.round(aro.closest('svg, [data-pace-dial]') ? aro.closest('svg, [data-pace-dial]').getBoundingClientRect().width : 0) : 0, sidebar: !!sb && sb.getBoundingClientRect().left < 300 && sb.getBoundingClientRect().width > 0 }; });
  await ctx.close();
  const k = dsf || 1;
  const rec = recorte ? { left: recorte.left * k, top: recorte.top * k, width: recorte.width * k, height: recorte.height * k } : null;
  return { entera: uri(png), recorte: rec ? uri(await sharp(png).extract(rec).png().toBuffer()) : null, m };
}

const FRASE = () => {
  const a = Array.from(document.querySelectorAll('[data-pace-sidebar-accion]')).find((e) => e.getBoundingClientRect().width > 0);
  const meta = a.querySelector('p'); const d = meta.cloneNode(false);
  d.textContent = 'Cuatro pausas hechas, una saltada'; d.style.marginTop = '9px'; d.style.paddingTop = '8px'; d.style.borderTop = '1px solid var(--line)';
  meta.insertAdjacentElement('afterend', d);
};
const MEDIA = () => {
  const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="menu"]')).find((e) => e.getBoundingClientRect().width > 0);
  const sel = (v, opts) => '<select class="pace-rt-sel">' + opts.map((o) => '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>';
  p.querySelector('.pace-rt-titulo').innerHTML = 'Media jornada <span class="pace-rt-sub" style="display:inline">· de ' + sel('9:00', ['8:00', '9:00', '10:00']) + ' a ' + sel('12:30', ['12:00', '12:30', '13:00']) + ' · ' + sel('sin comida', ['sin comida', 'comida a las 13:00']) + '</span>';
};

const DISPOSITIVOS = [
  { id: 'ipad', n: 'iPad', w: 768, h: 1024, tactil: true },
  { id: 'air', n: 'iPad Air', w: 820, h: 1180, tactil: true },
  { id: 'pro11', n: 'iPad Pro 11"', w: 834, h: 1194, tactil: true },
  { id: 'pro13', n: 'iPad Pro 12,9"', w: 1024, h: 1366, tactil: true },
  { id: 'ventana', n: 'Ventana de escritorio', w: 900, h: 1200, tactil: false },
];
const REGLAS = [
  { id: 'r1024', n: 'Vertical hasta 1024', rec: true, va: (d) => d.w <= 1024, txt: 'Toda pantalla más alta que ancha de hasta 1024 px lleva la piel de móvil: los cuatro iPad y la ventana estrecha. Apaisada, escritorio. Una regla de dos condiciones: <code>(orientation: portrait) and (max-width: 1024px)</code>.' },
  { id: 'r900', n: 'Vertical hasta 900', va: (d) => d.w <= 900, txt: 'Los iPad normales y la ventana estrecha con la de móvil; el iPad Pro grande (1024) se queda en escritorio, con su barra lateral y su aro pequeño.' },
  { id: 'tactil', n: 'Solo si es táctil', va: (d) => d.tactil, txt: 'Los cuatro iPad con la de móvil; una ventana de escritorio estrecha y alta se queda como hoy. Añade una tercera condición (<code>pointer: coarse</code>) y un caso que no se ve venir: un portátil táctil.' },
];

(async () => {
  const b = await chromium.launch();
  const V = { width: 1536, height: 704 };
  const T = { fecha: '2026-09-15', hora: '15:30', viewport: V, tarde: true };
  const SB = { left: 0, top: 300, width: 300, height: 200 };
  const nada = await foto(b, Object.assign({}, T, { dsf: 2, recorte: SB }));
  const frase = await foto(b, Object.assign({}, T, { dsf: 2, recorte: SB, antes: (p) => p.evaluate(FRASE) }));
  const linea = await foto(b, Object.assign({}, T, { recorte: { left: 300, top: 425, width: 1236, height: 279 } }));
  const disp = {};
  for (const d of DISPOSITIVOS) {
    const hoy = await foto(b, { fecha: '2026-09-14', hora: '09:00', viewport: { width: d.w, height: d.h }, movil: d.tactil });
    const mov = d.w <= 768 ? hoy : await foto(b, { fecha: '2026-09-14', hora: '09:00', viewport: { width: d.w, height: d.h }, movil: d.tactil, forzar: 1100 });
    disp[d.id] = { hoy, mov };
    console.log(d.n, d.w + '×' + d.h, 'hoy: sidebar', hoy.m.sidebar, '· móvil: sidebar', mov.m.sidebar);
  }
  const REC_PANEL = { left: 300, top: 425, width: 1236, height: 279 };
  const mediaTal = await foto(b, { fecha: '2026-09-15', hora: '09:00', viewport: V, opcion: 'media', recorte: REC_PANEL });
  const mediaCon = await foto(b, { fecha: '2026-09-15', hora: '09:00', viewport: V, opcion: 'media', recorte: REC_PANEL, antes: (p) => p.evaluate(MEDIA) });
  const tarjeta = await foto(b, { fecha: '2026-09-15', hora: '09:00', viewport: V, libre: true, recorte: { left: 300, top: 380, width: 1236, height: 324 } });
  await b.close();

  const card = (sello, titulo, texto, img, extra) => `
    <div class="tarjeta foto${extra || ''}"><span class="sello${extra && extra.includes('rec') ? '' : ' gris'}">${sello}</span><span class="t">${titulo}</span><p>${texto}</p>${img ? `<img src="${img}" alt="${titulo}">` : ''}</div>`;
  const fila = (clave, rot) => '<div class="cinco">' + DISPOSITIVOS.map((d) => `<div class="disp"><img src="${disp[d.id][clave].entera}" alt="${d.n} ${rot}"><div class="d">${d.n}</div><div class="h">${d.w}×${d.h}${d.w <= 768 && clave === 'mov' ? ' · ya es móvil' : ''}</div></div>`).join('') + '</div>';
  const reglaCard = (r) => `
    <div class="tarjeta${r.rec ? ' rec' : ''}"><span class="sello${r.rec ? '' : ' gris'}">D · ${r.n}${r.rec ? ' · recomendada' : ''}</span>
      <div class="regla">${DISPOSITIVOS.map((d) => `<span class="${r.va(d) ? 'm' : ''}">${d.n} · ${r.va(d) ? 'móvil' : 'escritorio'}</span>`).join('')}</div>
      <p>${r.txt}</p></div>`;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PACE · Decidir viendo · s196, ronda 3</title>
${ESTILO.replace('</style>', EXTRA + '</style>')}
</head>
<body>
<main>
  <div class="ceja">PACE · s196 · ronda 3 · decidir viendo</div>
  <h1>Las cuatro cosas que faltan, pintadas</h1>
  <p>Decidido ya: <b>B</b>, la hoja del día con hecha/saltada; y la tableta vertical <b>con la piel de móvil</b> («así se ve
  perfecto»). Quedan cuatro: qué lleva la tarjeta de la barra lateral, <b>hasta qué ancho</b> una pantalla vertical es «tableta»,
  en cuántas versiones va, y si la media jornada con horas entra ahora. Cada una con su foto de la app real.</p>

  <h2>C · La barra lateral: la frase o nada</h2>
  <p>La línea del panel ya dice, nodo a nodo, qué se hizo y qué se saltó (abajo, la de ese martes a las 15:30). Por eso los puntos
  en miniatura (C3) sobraban: la repetían a 300 px. Lo único que la línea no dice con palabras es el recuento. Dos opciones.</p>
  <div class="una">${card('La línea, tal cual', 'Lo que ya cuenta el panel', 'Relleno = hecha (4), gris punteado = saltada (1). Esto no cambia.', linea.recorte)}</div>
  <div class="lado">
    ${card('C1 · una frase · recomendada', 'El recuento, en palabras', '«Cuatro pausas hechas, una saltada» bajo el «2 min · Estira», con un hilo encima. Es lo único que la línea no dice; y en el teléfono, donde la línea es una tira de puntos, es lo que se lee de un vistazo en el cajón.', frase.recorte, ' rec')}
    ${card('Nada', 'La tarjeta sigue mirando hacia delante', 'Lo hecho se lee en la línea (escritorio) y en la hoja (teléfono). Menos es más; a cambio, el recuento no está en ningún sitio con palabras.', nada.recorte)}
  </div>

  <h2>D · Hasta qué ancho una pantalla vertical lleva la piel de móvil</h2>
  <p>Cinco pantallas verticales reales, a su tamaño (escaladas para caber). Arriba, <b>hoy</b>: solo el iPad de 768 lleva la piel
  de móvil; el resto, escritorio con la barra lateral y el aro pequeño que te chirrió. Abajo, <b>con la piel de móvil forzada</b>
  a esos anchos, que es lo que haría el breakpoint (medido: el corte vive entero en <code>max-width: 768px</code> /
  <code>min-width: 769px</code>, 18 archivos; aquí se reescribe en la foto).</p>
  <h3>Hoy</h3>
  ${fila('hoy', 'hoy')}
  <h3>Con la piel de móvil</h3>
  ${fila('mov', 'piel de móvil')}
  <p>La regla decide cuáles de las cinco cambian. Marca una:</p>
  <div class="tres">${REGLAS.map(reglaCard).join('')}</div>

  <h2>Orden · En cuántas versiones</h2>
  <div class="tres">
    <div class="tarjeta rec"><span class="sello">Dos versiones · recomendada</span><span class="t">Lo hecho, y luego la tableta</span>
      <dl class="ficha"><dt>v0.129.0</dt><dd>La hoja con hecha/saltada · la frase de la barra lateral (si C1) · <code>STATE.md</code> limpio. Pequeña: dos archivos y dos tests en rojo contra HEAD.</dd>
      <dt>v0.130.0</dt><dd>El breakpoint de la tableta vertical, y la auditoría de 16 viewports re-medida (los 5 de aquí entran en ella).</dd>
      <dt>Por qué</dt><dd>Cada cierre prueba una cosa. Si la tableta se tuerce, lo hecho ya está publicado.</dd></dl></div>
    <div class="tarjeta"><span class="sello gris">Una versión</span><span class="t">Todo junto en v0.129.0</span>
      <dl class="ficha"><dt>Lleva</dt><dd>Las dos cosas y STATE.</dd><dt>Por qué</dt><dd>Un cierre, un commit, una suite (~7 min) en vez de dos.</dd><dt>Coste</dt><dd>Más que revisar de golpe, y un breakpoint mezclado con un cambio de contenido en el mismo diff.</dd></dl></div>
    <div class="tarjeta"><span class="sello gris">La tableta primero</span><span class="t">v0.129.0 el breakpoint, v0.130.0 lo hecho</span>
      <dl class="ficha"><dt>Cuándo</dt><dd>Si vas a usar la tableta esta misma semana.</dd><dt>Por qué</dt><dd>Lo hecho se lee ya en la línea; la tableta hoy no se puede usar a gusto.</dd></dl></div>
  </div>

  <h2>Media jornada · ¿con horas, y cuándo?</h2>
  <p>Por libre, la loseta «Media jornada» dice hasta qué hora llega (3 h de foco desde que empiezas, con sus pausas: 12:30). Al elegirla,
  su cabecera es fija; la jornada entera, en cambio, edita inicio, salida y comida.</p>
  <div class="una">
    ${card('La tarjeta por libre · tal cual', 'Las cuatro losetas, con su hora de fin', 'Una hora · Dos horas · Media jornada · Jornada entera. La media jornada llega hasta las 12:30 si empiezas a las 9:00.', tarjeta.recorte)}
  </div>
  <div class="lado">
    ${card('Cabecera · tal cual', '«de 9:00 a 12:30», fijo', 'Lo que hay.', mediaTal.recorte)}
    ${card('Cabecera · con horas', 'Los mismos selectores que la entera', 'Inicio, salida y «sin comida / comida a las 13:00». La media jornada pasa a ser un tramo con sus horas.', mediaCon.recorte)}
  </div>
  <div class="tres">
    <div class="tarjeta rec"><span class="sello">Después · recomendada</span><p>Se queda declarada. Primero lo hecho y la tableta; tu semana de uso dice si la echas de menos.</p></div>
    <div class="tarjeta"><span class="sello gris">Ahora, con lo hecho</span><p>Entra en v0.129.0. Toca la regla (<code>ritmo.regla.js</code>) y la pregunta; pide banco nuevo.</p></div>
    <div class="tarjeta"><span class="sello gris">No hace falta</span><p>La media jornada sigue siendo «3 h de foco desde que empiezas». Se archiva.</p></div>
  </div>

  <h2>Para contestar en una línea</h2>
  <ol class="decide">
    <li><b>C:</b> C1 frase · nada.</li>
    <li><b>D:</b> vertical hasta 1024 · hasta 900 · solo táctil.</li>
    <li><b>Orden:</b> dos versiones · una · la tableta primero.</li>
    <li><b>Media jornada:</b> después · ahora · no.</li>
  </ol>
  <p class="pie">Generada por <code>scripts/audit/decidir-s196.js</code> sobre el artefacto de v0.128.1. Las fotos «con la piel de móvil» por encima de 768 px fuerzan el corte en la página; todo lo demás es la app tal cual.</p>
</main>
</body>
</html>`;
  fs.writeFileSync(SALIDA, html);
  console.log('→ ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
