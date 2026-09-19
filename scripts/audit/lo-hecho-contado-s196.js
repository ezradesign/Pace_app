/* PACE · «Lo hecho, contado» y las otras rutas, VISTAS (s196)
 * ============================================================
 * A las cuatro preguntas de por-donde-seguir-s196.html el usuario contestó lo
 * mismo: «dame un html para ver qué propones». Así que cada propuesta se CALCA
 * sobre la app real (fotos del artefacto de v0.128.1 con el DOM retocado con las
 * clases de la app, como «dónde se dice» en s195), no se dibuja a mano.
 *
 *  · B/C · la barra lateral, martes a las 15:30 con 4 hechas y 1 saltada: tal cual
 *    · una frase · «4 de 7» en la cejilla · los puntos de la línea en miniatura.
 *  · B · la hoja del día en el teléfono: tal cual (todo lo pasado atenuado) · con
 *    hecha/saltada (hecha con tinta y relleno; saltada atenuada y punteada).
 *  · Ruta 3 · media jornada con horas: la cabecera de «Media jornada» con los
 *    mismos selectores que la jornada entera. Y dos fotos tal cual: el miércoles
 *    con tres largas, y el panel en modo oscuro.
 *  · Ruta 4 · la tableta: 820×1100 con la piel de escritorio (tal cual) al lado
 *    de 768×1100, el ancho máximo en que hoy existe la piel de móvil.
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/lo-hecho-contado-s196.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'lo-hecho-contado-s196.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const EXTRA = '  .una { display: grid; grid-template-columns: minmax(0,1fr); gap: 16px; margin-top: 10px; } .cuatro { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin-top: 10px; } @media (max-width: 820px) { .cuatro { grid-template-columns: repeat(2, minmax(0,1fr)); } } .foto img.tel { max-width: 330px; margin: 10px auto 0; } .lado { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; } ';

const BASE_SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } };
const ESTADOS = { 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada', 5: 'hecha' };
const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');

/* Abre la app con semilla, reloj y viewport; `antes(page)` retoca el DOM; devuelve la foto (y un recorte). */
async function foto(b, { fecha, hora, viewport, opcion, tarde, movil, oscuro, recorte, antes, dsf }) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: dsf || 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: oscuro ? 'dark' : 'light', serviceWorkers: 'block', isMobile: !!movil, hasTouch: !!movil });
  const dia = { fecha, opcion: opcion || 'jornada', desde: 540, cicloBase: 0, cambios: {} };
  if (tarde) dia.estados = ESTADOS;
  const semilla = Object.assign({}, BASE_SEMILLA, tarde ? { cycle: 6, lastActiveDay: new Date(fecha + 'T12:00:00+02:00').toDateString(), _historyMigrated: true } : {}, oscuro ? { palette: 'oscuro' } : {}, { ritmo: { dia } });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(fecha + 'T' + hora + ':00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1800);
  if (antes) await antes(page);
  await page.waitForTimeout(500);
  const png = await page.screenshot({ type: 'png' });
  const titulo = await page.evaluate(() => { const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="menu"] .pace-rt-titulo')).find((e) => e.getBoundingClientRect().width > 0); return p ? p.textContent.replace(/\s+/g, ' ').trim() : ''; });
  await ctx.close();
  const k = dsf || 1;
  const rec = recorte ? { left: recorte.left * k, top: recorte.top * k, width: recorte.width * k, height: recorte.height * k } : null;
  return { entera: uri(png), recorte: rec ? uri(await sharp(png).extract(rec).png().toBuffer()) : null, titulo };
}

/* ---- los retoques (corren en la página, con las clases de la app) ---- */
const SIDEBAR = {
  frase: () => {
    const a = Array.from(document.querySelectorAll('[data-pace-sidebar-accion]')).find((e) => e.getBoundingClientRect().width > 0);
    const meta = a.querySelector('p'); const d = meta.cloneNode(false);
    d.textContent = 'Cuatro pausas hechas, una saltada'; d.style.marginTop = '9px'; d.style.paddingTop = '8px'; d.style.borderTop = '1px solid var(--line)';
    meta.insertAdjacentElement('afterend', d);
  },
  cifra: () => {
    const a = Array.from(document.querySelectorAll('[data-pace-sidebar-accion]')).find((e) => e.getBoundingClientRect().width > 0);
    const ceja = a.firstElementChild; ceja.style.display = 'flex'; ceja.style.justifyContent = 'space-between';
    const s = document.createElement('span'); s.textContent = '4 de 7'; s.style.letterSpacing = '0.06em'; s.style.textTransform = 'none'; s.style.fontVariantNumeric = 'tabular-nums';
    ceja.appendChild(s);
  },
  puntos: () => {
    const a = Array.from(document.querySelectorAll('[data-pace-sidebar-accion]')).find((e) => e.getBoundingClientRect().width > 0);
    const meta = a.querySelector('p');
    const fila = document.createElement('div'); fila.className = 'pace-rt-mini'; fila.style.cssText = 'display:flex;align-items:center;gap:0;margin-top:10px;padding-top:9px;border-top:1px solid var(--line)';
    const est = ['hecha', 'hecha', 'hecha larga', 'saltada', 'hecha', '', '', 'cierre'];
    const col = ['var(--extra)', 'var(--move)', 'var(--breathe)', 'var(--extra)', 'var(--move)', 'var(--extra)', 'var(--move)', 'var(--breathe)'];
    est.forEach((e, i) => {
      const p = document.createElement('span'); p.className = 'pace-rt-punto' + (e.includes('larga') ? ' pace-rt-larga' : '') + (e.includes('hecha') ? ' pace-rt-hecha' : '') + (e.includes('saltada') ? ' pace-rt-saltada' : '');
      p.style.setProperty('--c', col[i]); fila.appendChild(p);
      if (i < est.length - 1) { const l = document.createElement('i'); l.style.cssText = 'flex:1 1 0;height:1px;background:var(--line);min-width:6px'; fila.appendChild(l); }
    });
    const txt = document.createElement('span'); txt.textContent = '4 hechas · 1 saltada'; txt.style.cssText = 'font-size:10px;color:var(--ink-3);margin-left:8px;white-space:nowrap';
    fila.appendChild(txt);
    meta.insertAdjacentElement('afterend', fila);
  },
};
const HOJA = {
  abrir: async (page) => { await page.getByText('Ver la jornada entera').filter({ visible: true }).first().click(); await page.waitForTimeout(700); },
  estados: (ESTADOS) => {
    const filas = Array.from(document.querySelectorAll('[data-pace-ritmo-lista] .pace-rt-li.pace-rt-plato'));
    filas.forEach((f, i) => {
      const e = ESTADOS[i + 1]; if (!e) return;
      const g = f.querySelector('.pace-rt-eje i'); const m = f.querySelector('.pace-rt-plato-m'); const dur = (m.textContent.match(/(\d+) min/) || [])[1];
      if (e === 'hecha') { f.classList.remove('pace-rt-pasado'); g.style.border = '1.5px solid var(--c)'; g.style.background = 'color-mix(in srgb, var(--c) 22%, var(--paper))'; m.textContent = 'hecha · ' + (dur || '') + ' min'; }
      else { g.style.borderStyle = 'dashed'; m.textContent = 'saltada'; f.style.opacity = '0.4'; }
    });
  },
};
const MEDIA = () => {
  const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="menu"]')).find((e) => e.getBoundingClientRect().width > 0);
  const tit = p.querySelector('.pace-rt-titulo');
  const sel = (v, opts) => '<select class="pace-rt-sel">' + opts.map((o) => '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>';
  tit.innerHTML = 'Media jornada <span class="pace-rt-sub" style="display:inline">· de ' + sel('9:00', ['8:00', '8:30', '9:00', '9:30', '10:00']) + ' a ' + sel('12:30', ['12:00', '12:30', '13:00', '13:30', '14:00']) + ' · ' + sel('sin comida', ['sin comida', 'comida a las 13:00']) + '</span>';
};

(async () => {
  const b = await chromium.launch();
  const V = { width: 1536, height: 704 }, TEL = { width: 390, height: 844 };
  const T = { fecha: '2026-09-15', hora: '15:30', viewport: V, tarde: true, dsf: 2, recorte: { left: 0, top: 300, width: 300, height: 200 } };
  const tal = await foto(b, T);
  const frase = await foto(b, Object.assign({}, T, { antes: (p) => p.evaluate(SIDEBAR.frase) }));
  const cifra = await foto(b, Object.assign({}, T, { antes: (p) => p.evaluate(SIDEBAR.cifra) }));
  const puntos = await foto(b, Object.assign({}, T, { antes: (p) => p.evaluate(SIDEBAR.puntos) }));
  const H = { fecha: '2026-09-15', hora: '15:30', viewport: TEL, tarde: true, movil: true, recorte: { left: 0, top: 0, width: 390, height: 844 } };
  const hojaTal = await foto(b, Object.assign({}, H, { antes: (p) => HOJA.abrir(p) }));
  const hojaCon = await foto(b, Object.assign({}, H, { antes: async (p) => { await HOJA.abrir(p); await p.evaluate(HOJA.estados, ESTADOS); } }));
  const REC_PANEL = { left: 300, top: 425, width: 1236, height: 279 };
  const media = await foto(b, { fecha: '2026-09-15', hora: '09:00', viewport: V, opcion: 'media', recorte: REC_PANEL, antes: (p) => p.evaluate(MEDIA) });
  const mediaTal = await foto(b, { fecha: '2026-09-15', hora: '09:00', viewport: V, opcion: 'media', recorte: REC_PANEL });
  const miercoles = await foto(b, { fecha: '2026-09-16', hora: '09:00', viewport: V, recorte: REC_PANEL });
  const oscuro = await foto(b, { fecha: '2026-09-15', hora: '15:30', viewport: V, tarde: true, oscuro: true });
  const tabEsc = await foto(b, { fecha: '2026-09-14', hora: '09:00', viewport: { width: 820, height: 1100 } });
  const tabMov = await foto(b, { fecha: '2026-09-14', hora: '09:00', viewport: { width: 768, height: 1100 }, movil: true });
  await b.close();

  const tarjeta = (sello, titulo, texto, img, extra) => `
    <div class="tarjeta foto${extra || ''}"><span class="sello gris">${sello}</span><span class="t">${titulo}</span><p>${texto}</p><img src="${img}" alt="${titulo}"></div>`;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PACE · Lo hecho, contado · y las otras rutas, vistas</title>
${ESTILO.replace('</style>', EXTRA + '</style>')}
</head>
<body>
<main>
  <div class="ceja">PACE · s196 · las propuestas, calcadas sobre la app</div>
  <h1>Lo hecho, contado — y las otras rutas, vistas</h1>
  <p>A las cuatro preguntas contestaste lo mismo: «dame un html para ver qué propones». Aquí está cada propuesta
  <b>pintada sobre la app real</b> (fotos de v0.128.1 con el DOM retocado con las clases de la app): la barra lateral de un
  martes a las 15:30 con cuatro pausas hechas y una saltada, la hoja del día en el teléfono, la cabecera de «Media
  jornada» con horas, el miércoles, el modo oscuro y la tableta. Al final, las mismas cuatro letras.</p>

  <h2>B y C · La barra lateral: cómo se lee lo hecho</h2>
  <p>La tarjeta «Siguiente pausa» hoy solo mira hacia delante. Tres formas de que además recuerde, y la tarjeta tal cual para comparar.
  Recortes de 300×200 a 1536×704.</p>
  <div class="dos">
    ${tarjeta('Tal cual', 'Nada', 'Lo que hay: la siguiente pausa y nada más. Lo hecho se ve solo en la línea del panel.', tal.recorte)}
    ${tarjeta('C1 · recomendada', 'Una frase', '«Cuatro pausas hechas, una saltada», con el mismo cuerpo que el «2 min · Estira» y un hilo encima. Sin cifra suelta: se lee, no se mide.', frase.recorte, ' rec')}
    ${tarjeta('C2', '«4 de 7» en la cejilla', 'La cifra pequeña a la derecha de «SIGUIENTE PAUSA · 15:45». Discreta, pero es un marcador: cuenta las saltadas como no hechas y no las distingue.', cifra.recorte)}
    ${tarjeta('C3', 'Los puntos de la línea', 'La línea en miniatura (los mismos puntos de la copia compacta: relleno = hecha, punteado = saltada, la larga alargada) y «4 hechas · 1 saltada» al lado. Dice lo mismo que la frase, y además dónde.', puntos.recorte)}
  </div>

  <h2>B · La hoja del día (teléfono)</h2>
  <p>En el teléfono la línea es una tira de puntos y el detalle está en «Ver la jornada entera». Hoy la hoja atenúa <b>todo</b> lo pasado,
  hecho o no («lo atenuado lee como no hecho», s193). A la derecha, con hecha/saltada: lo hecho con tinta y el glifo relleno; lo
  saltado atenuado y punteado, como en la línea.</p>
  <div class="lado">
    ${tarjeta('Tal cual · 390×844', 'Todo lo pasado igual', 'Cinco pausas pasadas, cuatro hechas y una saltada: la hoja no lo distingue.', hojaTal.recorte)}
    ${tarjeta('Con hecha / saltada · recomendada', 'Cada parada con su estado', '«hecha · 4 min» y el glifo relleno al 22 % con borde de 1,5 (la regla de la línea); «saltada» al 40 % y punteado.', hojaCon.recorte, ' rec')}
  </div>

  <h2>Ruta 3 · La jornada a medida y los huecos, vistos</h2>
  <div class="una">
    ${tarjeta('Media jornada · tal cual', 'Hoy: «' + mediaTal.titulo.replace('Media jornada · ', '') + '», fijo', 'La media jornada son 3 h de foco desde que empiezas (con sus pausas, hasta las 12:30). Solo la jornada entera edita sus horas.', mediaTal.recorte)}
    ${tarjeta('Media jornada · con horas', 'Los mismos selectores que la jornada entera', '«De 9:00 a 12:30» con sus dos selectores, y un tercero «sin comida / comida a las 13:00»: la media jornada deja de ser «3 h de foco desde ahora» y pasa a ser un tramo con sus horas, como la entera. Lo que pediste el sábado («4/8 h pero ajustables»).', media.recorte)}
    ${tarjeta('Miércoles · tal cual', 'Tres largas: 2.ª, 5.ª y 8.ª', 'El acento «la mitad» adelanta la larga y la cadencia de cada tres sigue: salen tres largas en vez de dos. Se dejó «como sale»; si molesta, la segunda cadencia vuelve a la de siempre.', miercoles.recorte)}
    ${tarjeta('Modo oscuro · tal cual', 'El panel a las 15:30, en oscuro', 'No está pensado: lo que se vea aquí es lo que hay. Entra en la ruta 3 con la auditoría de viewports en oscuro.', oscuro.entera)}
  </div>

  <h2>Ruta 4 · La tableta vertical, las dos pieles</h2>
  <p>Izquierda: 820×1100 con la piel de escritorio, tal cual. Derecha: 768×1100, el ancho máximo en que hoy existe la piel de móvil
  (el corte es 768/769); a 820 sería esto mismo con 52 px más de ancho.</p>
  <div class="lado">
    ${tarjeta('820×1100 · escritorio · tal cual', 'Barra lateral de 280 y aro flotando', 'Funciona; sobra aire y el aro de 227 queda pequeño en 1100 de alto.', tabEsc.entera)}
    ${tarjeta('768×1100 · piel de móvil', 'Una columna, barra abajo', 'La home de móvil estirada a lo alto: el aro crece con la altura útil (modelo «atardecer») y el panel va debajo, en su copia compacta.', tabMov.entera)}
  </div>

  <h2>Para contestar en una línea</h2>
  <ol class="decide">
    <li><b>A · La ruta:</b> 2 con 1 en paralelo (recomendada) · 3 · 4 · otra.</li>
    <li><b>B · Dónde se lee lo hecho:</b> barra lateral + hoja (recomendado) · solo barra lateral · solo hoja.</li>
    <li><b>C · Cómo, en la barra lateral:</b> C1 frase (recomendada) · C2 «4 de 7» · C3 puntos · nada.</li>
    <li><b>D · La tableta:</b> se queda (izquierda) · piel de móvil (derecha) · no la uso.</li>
  </ol>
  <p class="pie">Generada por <code>scripts/audit/lo-hecho-contado-s196.js</code> sobre el artefacto de v0.128.1. Todo son fotos de la app real con el DOM retocado; nada dibujado a mano.</p>
</main>
</body>
</html>`;
  fs.writeFileSync(SALIDA, html);
  console.log('→ ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
