/* PACE · RONDA 4 de s196: la frase, y la media jornada explicada
 * ================================================================
 * El usuario: «C1 pero mejor redactada y más elegante» · «D: vertical hasta 1024»
 * · «sigo sin entender qué propones en media jornada». Dos cosas:
 *
 *  · La frase de la barra lateral en CUATRO redacciones, calcadas sobre la
 *    tarjeta «Siguiente pausa» real (martes 15:30, 4 hechas, 1 saltada), con
 *    cuatro tipografías de la app: el cuerpo del meta, la itálica de la loseta,
 *    solo lo hecho, y las versalitas de la cejilla.
 *  · La media jornada: HOY es una duración (3 h de foco desde que pulsas), no un
 *    horario. Se enseña la loseta tal cual y dos propuestas calcadas: A, un
 *    horario como la jornada entera («de 9:00 a 13:00», editable, con o sin
 *    comida, y por tanto una tarde también); B, una duración editable (3/4/5 h).
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/ronda4-s196.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'ronda4-s196.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const EXTRA = '  .una { display: grid; grid-template-columns: minmax(0,1fr); gap: 16px; margin-top: 10px; } .lado { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; } table.cmp { width: 100%; border-collapse: collapse; font-size: 14px; margin: 10px 0 4px; } table.cmp th, table.cmp td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; } table.cmp th { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; } ';

const BASE_SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } };
const ESTADOS = { 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada', 5: 'hecha' };
const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');

async function foto(b, { fecha, hora, viewport, opcion, tarde, libre, recorte, antes, dsf, medir }) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: dsf || 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  const dia = { fecha, opcion: opcion || 'jornada', desde: 540, cicloBase: 0, cambios: {} };
  if (tarde) dia.estados = ESTADOS;
  const semilla = Object.assign({}, BASE_SEMILLA, tarde ? { cycle: 6, lastActiveDay: new Date(fecha + 'T12:00:00+02:00').toDateString(), _historyMigrated: true } : {}, { ritmo: libre ? { libre: true } : { dia } });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(fecha + 'T' + hora + ':00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1800);
  if (antes) await antes(page);
  await page.waitForTimeout(500);
  if (medir) recorte = await page.evaluate(medir);
  const png = await page.screenshot({ type: 'png' });
  await ctx.close();
  const k = dsf || 1;
  const rec = recorte ? { left: Math.round(recorte.left * k), top: Math.round(recorte.top * k), width: Math.round(recorte.width * k), height: Math.round(recorte.height * k) } : null;
  return { entera: uri(png), recorte: rec ? uri(await sharp(png).extract(rec).png().toBuffer()) : null };
}

/* ---- la frase: cuatro redacciones, cuatro tipografías de la app ---- */
const FRASE = ({ texto, estilo }) => {
  const a = Array.from(document.querySelectorAll('[data-pace-sidebar-accion]')).find((e) => e.getBoundingClientRect().width > 0);
  const meta = a.querySelector('p'); const d = document.createElement('p');
  d.textContent = texto;
  d.style.cssText = 'margin:9px 0 0;padding-top:8px;border-top:1px solid var(--line);line-height:1.5;' + estilo;
  meta.insertAdjacentElement('afterend', d);
};
const REDACCIONES = [
  { id: 'A', n: 'El cuerpo del meta', texto: 'Cuatro pausas hechas · una saltada', estilo: 'font-size:11px;color:var(--ink-3)', por: 'Como el «2 min · Estira»: mismo cuerpo, punto medio en vez de coma. Lo más discreto.' },
  { id: 'B', n: 'La itálica de la loseta', texto: 'Cuatro hechas, una saltada', estilo: 'font-family:var(--font-display);font-style:italic;font-size:13px;color:var(--ink-2)', por: 'La serif itálica de «Hasta las 12:30» en las losetas. Sin la palabra «pausas»: la tarjeta ya lo es. La más elegante, y la que más pesa.' },
  { id: 'C', n: 'Solo lo hecho', texto: 'Llevas cuatro pausas', estilo: 'font-family:var(--font-display);font-style:italic;font-size:13px;color:var(--ink-2)', por: 'No nombra la saltada: la línea ya la enseña en gris, y nombrarla es un reproche pequeño. Cuenta lo que sumas, como el agua.' },
  { id: 'D', n: 'Las versalitas de la cejilla', texto: 'Cuatro hechas · una saltada', estilo: 'font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;color:var(--ink-3)', por: 'El mismo trazo que «SIGUIENTE PAUSA · 15:45». Cierra la tarjeta con lo que la abre. Discreta, pero lee como rótulo, no como frase.' },
];

/* ---- la media jornada: la loseta y la cabecera, hoy y en dos propuestas ---- */
const LOSETA = (sub) => { const l = document.querySelector('[data-pace-ritmo-loseta="media"]'); if (sub) l.querySelector('span').textContent = sub; };
const RECORTE_LOSETAS = () => { const r = document.querySelector('[data-pace-ritmo-loseta="media"]').getBoundingClientRect(); return { left: r.left - 14, top: r.top - 14, width: r.width + 28, height: r.height + 28 }; };
const CABECERA = ({ de, a, comida }) => {
  const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="menu"]')).find((e) => e.getBoundingClientRect().width > 0);
  const sel = (v, opts) => '<select class="pace-rt-sel">' + opts.map((o) => '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>';
  p.querySelector('.pace-rt-titulo').innerHTML = 'Media jornada <span class="pace-rt-sub" style="display:inline">· de ' + sel(de, [de]) + ' a ' + sel(a, [a]) + ' · ' + sel(comida, [comida]) + '</span>';
};
const RECORTE_CAB = () => { const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="menu"]')).find((e) => e.getBoundingClientRect().width > 0); const r = p.querySelector('.pace-rt-titulo').getBoundingClientRect(); return { left: r.left - 16, top: r.top - 14, width: r.width + 32, height: r.height + 28 }; };

(async () => {
  const b = await chromium.launch();
  const V = { width: 1536, height: 704 };
  const SB = { left: 0, top: 300, width: 300, height: 200 };
  const frases = {};
  for (const r of REDACCIONES) frases[r.id] = await foto(b, { fecha: '2026-09-15', hora: '15:30', viewport: V, tarde: true, dsf: 2, recorte: SB, antes: (p) => p.evaluate(FRASE, r) });
  const L = { fecha: '2026-09-15', hora: '09:00', viewport: V, libre: true, dsf: 2, medir: RECORTE_LOSETAS };
  const losetaHoy = await foto(b, L);
  const losetaA = await foto(b, Object.assign({}, L, { antes: (p) => p.evaluate(LOSETA, 'De 9:00 a 13:00') }));
  const losetaB = await foto(b, Object.assign({}, L, { antes: (p) => p.evaluate(LOSETA, '4 h · hasta las 13:00') }));
  const C = { fecha: '2026-09-15', hora: '09:00', viewport: V, opcion: 'media', dsf: 2, medir: RECORTE_CAB };
  const cabHoy = await foto(b, C);
  const cabA = await foto(b, Object.assign({}, C, { antes: (p) => p.evaluate(CABECERA, { de: '9:00', a: '13:00', comida: 'sin comida' }) }));
  const cabTarde = await foto(b, Object.assign({}, C, { antes: (p) => p.evaluate(CABECERA, { de: '15:00', a: '19:00', comida: 'sin comida' }) }));
  await b.close();

  const card = (sello, titulo, texto, img, rec) => `
    <div class="tarjeta foto${rec ? ' rec' : ''}"><span class="sello${rec ? '' : ' gris'}">${sello}</span><span class="t">${titulo}</span><p>${texto}</p>${img ? `<img src="${img}" alt="${titulo}">` : ''}</div>`;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PACE · Ronda 4 · la frase y la media jornada</title>
${ESTILO.replace('</style>', EXTRA + '</style>')}
</head>
<body>
<main>
  <div class="ceja">PACE · s196 · ronda 4</div>
  <h1>La frase, en cuatro; y la media jornada, explicada</h1>
  <p>Decidido: <b>B</b> la hoja con hecha/saltada · <b>C1</b> una frase en la barra lateral · <b>D</b> la piel de móvil en vertical hasta
  1024 · el orden, <b>dos versiones</b> (lo hecho y luego la tableta) salvo que digas otra cosa. Quedan dos: <b>cómo se redacta la frase</b>
  y <b>qué es lo de la media jornada</b>, que no expliqué.</p>

  <h2>C1 · La frase, cuatro redacciones sobre la tarjeta real</h2>
  <p>Martes a las 15:30, cuatro pausas hechas y una saltada. Cada una con una tipografía que ya existe en la app; lo que cambia es
  el peso y si se nombra la saltada.</p>
  <div class="lado">
    ${REDACCIONES.map((r) => card(r.id + ' · ' + r.n + (r.id === 'B' ? ' · recomendada' : ''), '«' + r.texto + '»', r.por, frases[r.id].recorte, r.id === 'B')).join('')}
  </div>

  <h2>Media jornada · qué es hoy y qué propongo</h2>
  <p>Hoy, en la tarjeta «¿Cuánto trabajas hoy?», las tres primeras losetas son <b>duraciones desde que pulsas</b> (una hora, dos horas,
  media jornada = 3 h de foco) y solo la cuarta, «Jornada entera», es un <b>horario</b> (de 9:00 a 17:00 con comida a las 14:00, y se
  edita en su cabecera). La media jornada, por tanto, hoy no sabe de horas:</p>
  <table class="cmp">
    <tr><th>Situación</th><th>Hoy (duración: 3 h de foco desde ahora)</th><th>Propuesta A (horario, como la entera)</th></tr>
    <tr><td>La eliges a las 9:00</td><td>Acaba a las 12:30</td><td>Acaba a las 13:00 (la salida que tengas puesta)</td></tr>
    <tr><td>Empiezas tarde, a las 10:00</td><td>Acaba a las 13:30: se corre entera</td><td>Sigue acabando a las 13:00: el día se acorta, como en la jornada entera</td></tr>
    <tr><td>Trabajas por la tarde, de 15:00 a 19:00</td><td>No se puede decir; sería «media jornada desde las 15:00» y acabaría a las 18:30</td><td>Pones «de 15:00 a 19:00» en la cabecera, como pones «de 9:00 a 17:00» en la entera</td></tr>
    <tr><td>Comer</td><td>Nunca</td><td>«Sin comida» por defecto; se enciende si tu media jornada la cruza</td></tr>
    <tr><td>Lo que pediste el sábado</td><td colspan="2">«Media jornada y jornada completa de 4/8 horas pero también poder ajustarse»: la entera ya se ajusta; la media, hoy, no.</td></tr>
  </table>
  <p>Y hay una <b>propuesta B</b> más pequeña: dejarla como duración, pero que sean 4 h (como dijiste) y que la cifra se pueda cambiar
  (3 · 4 · 5 h) igual que se cambia «durante 1 h» de la comida. Sigue empezando cuando pulsas y sigue sin saber de tardes.</p>

  <h3>La loseta, en la tarjeta por libre</h3>
  <div class="tres">
    ${card('Hoy', 'Media jornada · Hasta las 12:30', 'Una duración: 3 h de foco desde que pulsas, con sus pausas.', losetaHoy.recorte)}
    ${card('Propuesta A · horario · recomendada', 'Media jornada · De 9:00 a 13:00', 'Un tramo con sus horas, como la jornada entera. La loseta dice el tramo, no un «hasta».', losetaA.recorte, true)}
    ${card('Propuesta B · duración editable', 'Media jornada · 4 h · hasta las 13:00', 'Sigue siendo «desde ahora», pero 4 h y ajustable.', losetaB.recorte)}
  </div>

  <h3>La cabecera, una vez elegida</h3>
  <div class="tres">
    ${card('Hoy', '«de 9:00 a 12:30», fijo', 'No se toca nada: la cabecera solo informa.', cabHoy.recorte)}
    ${card('Propuesta A · una mañana', '«de 9:00 a 13:00 · sin comida», tres selectores', 'Los mismos tres selectores que la jornada entera.', cabA.recorte)}
    ${card('Propuesta A · una tarde', '«de 15:00 a 19:00 · sin comida»', 'Lo que hoy no existe: una media jornada de tarde.', cabTarde.recorte)}
  </div>

  <h2>Para contestar en una línea</h2>
  <ol class="decide">
    <li><b>C1 · la frase:</b> A · B · C · D (o dime la tuya).</li>
    <li><b>Media jornada:</b> A horario · B duración editable · se queda como hoy.</li>
    <li><b>Y cuándo:</b> con lo hecho (v0.129.0) · después de la tableta · después de usarla una semana.</li>
  </ol>
  <p class="pie">Generada por <code>scripts/audit/ronda4-s196.js</code> sobre el artefacto de v0.128.1. Fotos de la app real con el DOM retocado; nada dibujado a mano.</p>
</main>
</body>
</html>`;
  fs.writeFileSync(SALIDA, html);
  console.log('→ ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
