/* PACE · s198 · ESTADISTICAS «HOY», RONDA 1 (tras v0.133.1)
 * ==========================================================
 * D3 de `por-donde-seguir-s198.html`: la Fase 4 se aparco en s192 porque «Hoy»
 * tenia que enseñar el menu, y el menu ya existe. Pero con el menu llego tambien
 * LA LINEA DEL DIA en la home, con hecho y saltado: una pestaña «Hoy» corre el
 * riesgo que ya mato la V1 de s191 (cuatro cifras que repetian la barra lateral).
 * Esta ronda pinta tres respuestas, cada una con lo que aporta que la linea no da:
 *  · H1 · la hoja del dia, en Estadisticas (hoy solo existe en el movil);
 *  · H2 · el dia A ESCALA: bloques y pausas en su sitio del reloj, y lo mas largo
 *         que estuviste sentado sin parar (la pregunta para la que existe la app);
 *  · H3 · sin pestaña: la linea ES «Hoy»; la hoja se abre tambien en escritorio.
 * Mismo dia sembrado en las tres (lunes 5, 15:30, cuatro bloques: hecha, hecha,
 * saltada, hecha). Fotos de la app real con el DOM inyectado (H1 calca la hoja
 * real; H2 se dibuja con los tokens y el plan del MOTOR, no a mano).
 *
 * Uso: node scripts/audit/stats-hoy-s198.js   (levanta su servidor en 8794)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const PUERTO = 8794;
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'stats-hoy-s198.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const EXTRA = ' .lado { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; align-items: start; margin-top: 10px; } .medida { font-size: 12px; color: var(--ink-3); margin-top: 6px; } .foto-sola img, .par img { width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; display: block; margin: 0; } .par { display: grid; grid-template-columns: minmax(0,3fr) minmax(0,1fr); gap: 8px; align-items: start; margin-top: 10px; } table.casos { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; } table.casos th, table.casos td { text-align: left; vertical-align: top; padding: 7px 8px; border-bottom: 1px solid var(--line); } table.casos th { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; } ';
const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const FECHA = '2026-10-05';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, estados: { 1: 'hecha', 2: 'hecha', 3: 'saltada', 4: 'hecha' } };
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', soundOn: false, cycle: 4,
  lastActiveDay: new Date(FECHA + 'T12:00:00+02:00').toDateString(), _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  water: { goal: 8, today: 4, lastReset: null },
  weeklyStats: { focusMinutes: [200, 0, 0, 0, 0, 0, 0], breathMinutes: [6, 0, 0, 0, 0, 0, 0], moveMinutes: [9, 0, 0, 0, 0, 0, 0], waterGlasses: [4, 0, 0, 0, 0, 0, 0] },
  achievements: { 'first.focus': 1759300000000 }, ritmo: { dia: JORNADA } };

async function foto(b, o) {
  const ctx = await b.newContext({ viewport: o.viewport, deviceScaleFactor: o.dsf || 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block', isMobile: !!o.movil, hasTouch: !!o.movil });
  await ctx.addInitScript((s) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); }, SEMILLA);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(FECHA + 'T15:30:00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  let datos = null;
  if (o.antes) datos = await o.antes(page);
  await page.waitForTimeout(700);
  const rec = o.recorte ? await page.evaluate(o.recorte) : null;
  const png = await page.screenshot({ type: 'png' });
  await ctx.close();
  const k = o.dsf || 1;
  const cortada = rec ? await sharp(png).extract({ left: Math.max(0, Math.round(rec.left * k)), top: Math.max(0, Math.round(rec.top * k)), width: Math.round(rec.width * k), height: Math.round(rec.height * k) }).png().toBuffer() : null;
  return { entera: uri(png), recorte: cortada ? uri(cortada) : null, datos };
}

const PANEL = () => { const e = Array.from(document.querySelectorAll('[data-pace-ritmo-panel]')).find((x) => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); return { left: r.left - 10, top: r.top - 40, width: r.width + 20, height: r.height + 50 }; };
const MODAL = () => { const e = Array.from(document.querySelectorAll('[data-pace-modal-card]')).pop(); const r = e.getBoundingClientRect(); return { left: r.left - 6, top: r.top - 6, width: r.width + 12, height: r.height + 12 }; };

/* Abre la hoja (movil) y devuelve su HTML para calcarla en escritorio. */
const HOJA = async (page) => {
  await page.getByText('Ver la jornada entera').filter({ visible: true }).first().click();
  await page.waitForTimeout(700);
  return page.evaluate(() => { const l = document.querySelector('[data-pace-ritmo-lista]'); return l ? l.outerHTML : ''; });
};

/* Las cifras del dia, del estado (lo que pondria cualquier «Hoy»). */
const CIFRAS = () => {
  const s = getState(); const p = ritmoPlan(s);
  const hechas = Object.keys(p.estados || {}).filter((k) => p.estados[k] === 'hecha').length;
  return { bloques: p.hechos, total: p.total, pausas: hechas, foco: (s.weeklyStats.focusMinutes[0] || 0), agua: s.water.today, meta: s.water.goal };
};

/* La pestaña «Hoy» delante y la vista vaciada: el sitio donde ira cada opcion. */
const PESTANA_HOY = () => { window.__pestanaHoy = () => {
  const card = Array.from(document.querySelectorAll('[data-pace-modal-card]')).pop();
  const vistas = card.querySelector('[data-pace-stats-vistas]');
  const barra = vistas.previousElementSibling;
  const botones = Array.from(barra.querySelectorAll('button'));
  const activo = botones[0], inactivo = botones[1];
  const hoy = activo.cloneNode(true); hoy.textContent = 'Hoy';
  activo.setAttribute('style', inactivo.getAttribute('style'));
  barra.insertBefore(hoy, botones[0]);
  vistas.innerHTML = '';
  return vistas;
}; };

const H1 = ({ html, c }) => {
  const vistas = window.__pestanaHoy();
  const fila = document.createElement('div');
  fila.style.cssText = 'display:flex;gap:28px;align-items:baseline;margin:2px 2px 10px;font-family:var(--font-display);font-style:italic;font-size:15px;color:var(--ink-2)';
  fila.innerHTML = '<span><b style="font-size:26px;font-weight:500;color:var(--ink)">' + c.bloques + '</b> de ' + c.total + ' bloques</span><span><b style="font-size:26px;font-weight:500;color:var(--ink)">' + c.pausas + '</b> pausas hechas</span><span><b style="font-size:26px;font-weight:500;color:var(--ink)">' + Math.floor(c.foco / 60) + ' h ' + (c.foco % 60) + '</b> de foco</span><span><b style="font-size:26px;font-weight:500;color:var(--ink)">' + c.agua + '</b> de ' + c.meta + ' vasos</span>';
  const envoltorio = document.createElement('div');
  vistas.appendChild(envoltorio);
  envoltorio.appendChild(fila);
  const caja = document.createElement('div');
  caja.style.cssText = 'max-height:300px;overflow:auto;border-top:1px solid var(--line);padding-top:6px';
  caja.innerHTML = html;
  envoltorio.appendChild(caja);
};

/* H2: el dia a escala, con el plan del motor y los estados por ordinal. */
const H2 = () => {
  const vistas = window.__pestanaHoy();
  const s = getState(); const p = ritmoPlan(s); const m = p.m;
  const items = m.items.filter((x) => x.tipo !== 'libre');
  const ini = items[0].desde, fin = items[items.length - 1].desde + (items[items.length - 1].dur || 0);
  const X = (min) => ((min - ini) / (fin - ini) * 100).toFixed(2) + '%';
  const ahora = 15 * 60 + 30;
  const color = window.RITMO_COLOR || {};
  let focoN = 0, seguido = 0, maxSeguido = 0;
  const partes = [];
  items.forEach((it) => {
    if (it.tipo === 'foco') {
      focoN++;
      const hecho = focoN <= p.hechos;
      partes.push('<div style="position:absolute;top:34px;height:18px;left:' + X(it.desde) + ';width:calc(' + X(it.desde + it.dur) + ' - ' + X(it.desde) + ' - 2px);background:var(--focus);opacity:' + (hecho ? 1 : 0.18) + ';border-radius:3px"></div>');
      if (hecho) { seguido += it.dur; maxSeguido = Math.max(maxSeguido, seguido); }
    } else {
      const ord = typeof ritmoOrdinal === 'function' ? ritmoOrdinal(m, it) : null;
      const est = ord ? p.estados[ord] : null;
      if (est === 'hecha' || it.tipo === 'comida') seguido = 0;
      else if (est === 'saltada') seguido += it.dur || 0;
      const mod = it.tipo === 'comida' ? 'comida' : ((it.platos && it.platos[0] && it.platos[0].modulo) || 'estira');
      const c = color[mod] || 'var(--ink-3)';
      const pasado = it.desde < ahora;
      const relleno = est === 'hecha' ? 'background:color-mix(in srgb,' + c + ' 55%, var(--paper))' : 'background:var(--paper)';
      const borde = est === 'saltada' ? '1.5px dashed ' + c : '1.5px solid ' + c;
      partes.push('<div title="' + (it.tipo) + '" style="position:absolute;top:36px;left:calc(' + X(it.desde) + ' - 7px);width:14px;height:14px;border-radius:50%;border:' + borde + ';' + relleno + ';opacity:' + (pasado ? (est === 'saltada' ? 0.5 : 1) : 0.45) + '"></div>');
    }
  });
  const horas = [];
  for (let h = Math.ceil(ini / 60); h * 60 <= fin; h++) horas.push('<div style="position:absolute;top:62px;left:' + X(h * 60) + ';transform:translateX(-50%);font-size:11px;color:var(--ink-3);letter-spacing:.04em">' + h + 'h</div><div style="position:absolute;top:28px;height:30px;left:' + X(h * 60) + ';border-left:1px solid var(--line)"></div>');
  const hm = (min) => (Math.floor(min / 60) ? Math.floor(min / 60) + ' h ' : '') + (min % 60 ? (min % 60) + ' min' : '');
  vistas.innerHTML = '<div><p style="font-family:var(--font-display);font-style:italic;font-size:20px;margin:6px 2px 18px;color:var(--ink)">Cuatro bloques hechos, tres con pausa detrás. Lo más largo sin levantarte: <b style="font-weight:500">' + hm(maxSeguido) + '</b>.</p>'
    + '<div style="position:relative;height:90px;margin:0 14px">' + horas.join('') + partes.join('')
    + '<div style="position:absolute;top:18px;height:44px;left:' + X(ahora) + ';border-left:1.5px solid var(--ink)"></div><div style="position:absolute;top:2px;left:' + X(ahora) + ';transform:translateX(-50%);font-size:10px;letter-spacing:.14em;color:var(--focus)">AHORA</div></div>'
    + '<div style="display:flex;gap:22px;margin:14px 2px 0;font-size:12px;color:var(--ink-3)"><span><i style="display:inline-block;width:18px;height:8px;background:var(--focus);border-radius:2px;vertical-align:middle"></i> bloque hecho</span><span><i style="display:inline-block;width:18px;height:8px;background:var(--focus);opacity:.18;border-radius:2px;vertical-align:middle"></i> por hacer</span><span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;border:1.5px solid var(--ink-3);background:color-mix(in srgb,var(--ink-3) 55%,var(--paper));vertical-align:middle"></i> pausa hecha</span><span><i style="display:inline-block;width:10px;height:10px;border-radius:50%;border:1.5px dashed var(--ink-3);vertical-align:middle"></i> saltada</span></div></div>';
  return { maxSeguido };
};

const H3 = () => {
  const res = Array.from(document.querySelectorAll('[data-pace-ritmo-resumen]')).find((x) => x.getBoundingClientRect().width > 0);
  if (!res) return;
  const b = Array.from(res.querySelectorAll('button')).pop();
  const n = b.cloneNode(true);
  n.textContent = 'Ver la jornada entera';
  n.style.outline = '2px solid color-mix(in srgb, var(--focus) 45%, transparent)';
  n.style.outlineOffset = '2px';
  b.insertAdjacentText('afterend', ' · ');
  b.parentNode.insertBefore(n, b.nextSibling.nextSibling);
};

(async () => {
  const srv = spawn(process.execPath, [path.join(ROOT, '.claude', 'static-server.js')], { cwd: ROOT, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await esperar(900);
  const b = await chromium.launch();
  const D = { width: 1280, height: 800 }, TEL = { width: 390, height: 844 };
  try {
    const linea = await foto(b, { viewport: D, dsf: 2, recorte: PANEL });
    const statsHoy = await foto(b, { viewport: D, antes: (p) => p.keyboard.press('s'), recorte: MODAL });
    const hojaMovil = await foto(b, { viewport: TEL, movil: true, antes: HOJA });
    const cifras = (await foto(b, { viewport: D, antes: (p) => p.evaluate(CIFRAS) })).datos;
    const h1 = await foto(b, { viewport: D, antes: async (p) => { await p.keyboard.press('s'); await p.waitForTimeout(500); await p.evaluate(PESTANA_HOY); await p.evaluate(H1, { html: hojaMovil.datos, c: cifras }); }, recorte: MODAL });
    const h2 = await foto(b, { viewport: D, antes: async (p) => { await p.keyboard.press('s'); await p.waitForTimeout(500); await p.evaluate(PESTANA_HOY); return p.evaluate(H2); }, recorte: MODAL });
    const h3 = await foto(b, { viewport: D, dsf: 2, antes: (p) => p.evaluate(H3), recorte: PANEL });

    const card = (sello, titulo, texto, extra, rec) => `
      <div class="tarjeta${rec ? ' rec' : ''}"><span class="sello${rec ? '' : ' gris'}">${sello}</span><span class="t">${titulo}</span><p>${texto}</p>${extra || ''}</div>`;
    const img = (src, alt) => `<div class="foto-sola" style="margin-top:10px"><img src="${src}" alt="${alt}"></div>`;
    const sentado = h2.datos && h2.datos.maxSeguido;

    const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PACE · s198 · Estadísticas «Hoy», ronda 1</title>
${ESTILO.replace('</style>', EXTRA + '</style>')}
</head>
<body>
<main>
  <div class="ceja">PACE · s198 · tras v0.133.1 · D3, ronda 1</div>
  <h1>«Hoy» en Estadísticas: tres respuestas a una pregunta</h1>
  <p>La Fase 4 se aparcó en s192 porque «Hoy» tenía que enseñar el menú, y el menú ya existe. Pero con él llegó <b>la línea del día en
  la home</b>, con lo hecho y lo saltado. Una pestaña «Hoy» corre el riesgo que ya descartó la V1 de s191 (cuatro cifras que repetían la
  barra lateral): <b>decir lo que ya dice la home</b>. Por eso cada opción viene con lo que aporta que la línea no da. Mismo día en todas:
  lunes 5, 15:30, cuatro bloques (hecha, hecha, saltada, hecha), 4 de 8 vasos.</p>

  <h2>Dónde vive hoy cada cosa</h2>
  <div class="lado">
    ${card('La home', 'La línea del día', 'Lo que toca, lo hecho y lo saltado, en orden. No va a escala: cada parada ocupa lo mismo.', img(linea.recorte, 'la línea'))}
    ${card('Estadísticas', 'Abre en «Semana»', 'Minutos por módulo y por día. No sabe nada del menú ni de las pausas.', img(statsHoy.recorte, 'Estadísticas hoy'))}
  </div>
  <div class="lado">
    ${card('El móvil', 'La hoja del día', 'Cada parada con su hora y su estado. <b>Solo existe en el móvil</b>: en escritorio no hay forma de verla.', `<div style="max-width:240px;margin:10px auto 0" class="foto-sola"><img src="${hojaMovil.entera}" alt="la hoja"></div>`)}
  </div>

  <h2>Las tres respuestas</h2>
  <div class="lado" style="grid-template-columns:minmax(0,1fr)">
    ${card('H1 · la hoja, en Estadísticas', '«Hoy» = la lista del día y cuatro cifras', 'La hoja del móvil, calcada, en la pestaña nueva, con las cifras arriba. <b>Aporta:</b> la hoja en escritorio y las cifras juntas. <b>Repite:</b> la línea (en lista) y la barra lateral (las cifras). La lista tiene ' + 'scroll dentro de la caja de Estadísticas.', img(h1.recorte, 'H1'))}
    ${card('H2 · el día a escala · recomendada', '«Hoy» = el día en el reloj', 'Bloques y pausas en su sitio del reloj, y una frase con <b>lo más largo que estuviste sentado sin parar</b>' + (sentado ? ' (aquí, ' + (Math.floor(sentado / 60) ? Math.floor(sentado / 60) + ' h ' : '') + (sentado % 60 ? (sentado % 60) + ' min' : '') + ', porque saltaste la tercera pausa)' : '') + '. <b>Aporta:</b> la forma del día y la pregunta para la que existe PACE, que la línea no puede contestar. <b>Repite:</b> poco.', img(h2.recorte, 'H2'), true)}
    ${card('H3 · sin pestaña', '«Hoy» es la línea', 'Estadísticas se queda como está; la hoja del día se abre <b>también en escritorio</b> desde la línea (el enlace verde es de la maqueta). <b>Aporta:</b> lo mínimo y barato. <b>Deja sin hacer:</b> la vista de entrada que pedía el audit (§37.4).', img(h3.recorte, 'H3'))}
  </div>

  <h2>Y sin menú (por libre)</h2>
  <table class="casos">
    <tr><th></th><th>H1 · la hoja</th><th>H2 · a escala</th><th>H3 · sin pestaña</th></tr>
    <tr><td>Con «A tu ritmo»</td><td>La lista de paradas con su estado</td><td>El plan en el reloj, lo hecho encima</td><td>La línea de la home (ya está)</td></tr>
    <tr><td>Por libre</td><td>Lo que hiciste, con su hora (sale del registro de eventos)</td><td>Tus sesiones en el reloj, y lo más largo sin parar entre ellas</td><td>Nada: la home por libre no tiene línea</td></tr>
    <tr><td>Coste</td><td>Pequeño: la hoja ya existe</td><td>Medio: una vista nueva, y el «sin parar» se calcula</td><td>Mínimo: un enlace</td></tr>
  </table>
  <p class="medida">H2 está dibujada con los tokens y el plan del motor (las horas, los estados y el «sin parar» salen del día sembrado);
  su forma final se decide en la ronda 2. H1 y H3 calcan piezas que ya existen.</p>

  <h2>Para contestar en una línea</h2>
  <ol class="decide">
    <li><b>«Hoy»:</b> H1 la hoja · H2 a escala · H3 sin pestaña.</li>
    <li><b>Si H1 o H2, al abrir Estadísticas:</b> empieza en «Hoy» · sigue en «Semana».</li>
  </ol>
  <p class="pie">Generada por <code>scripts/audit/stats-hoy-s198.js</code> sobre el artefacto de v0.133.1. Fotos de la app real; la pestaña
  «Hoy», su contenido y el enlace de H3 son DOM inyectado.</p>
</main>
</body>
</html>`;
    fs.writeFileSync(SALIDA, html);
    console.log('-> ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
    console.log('cifras: ' + JSON.stringify(cifras) + ' · sentado: ' + sentado + ' · hoja: ' + (hojaMovil.datos ? hojaMovil.datos.length : 0) + ' chars');
  } finally {
    await b.close();
    srv.kill();
  }
})();
