/* PACE · s198 · POR DONDE SEGUIR, en una pagina (tras v0.132.0)
 * ==============================================================
 * A «¿por donde seguimos?» el usuario pidio «dame un html para poder
 * visualizarlo». Cuatro frentes, de mas pequeño a mas grande, cada uno con fotos
 * de la app real (v0.132.0) y, donde hace falta, el DOM retocado:
 *  · D2 · la pausa te llama por su nombre (el aviso del sistema con el texto que
 *         la app daria HOY con un dia servido, sacado del motor, no inventado) y el
 *         dia al calendario (.ics).
 *  · D3 · Estadisticas «Hoy»: lo que hay hoy en Estadisticas y la hoja del dia.
 *  · D4 · Android: la piel de movil tal cual, que es lo que iria dentro.
 *  · D5 · lo pendiente sin fecha, medido.
 * El aviso del sistema es un DIBUJO (es del sistema operativo, no de la app); su
 * texto, no.
 *
 * Uso: node scripts/audit/por-donde-seguir-s198.js   (levanta su servidor en 8795)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const PUERTO = 8795;
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s198.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const EXTRA = ' .lado { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; align-items: start; margin-top: 10px; } .medida { font-size: 12px; color: var(--ink-3); margin-top: 6px; } .par { display: grid; grid-template-columns: minmax(0,3fr) minmax(0,1fr); gap: 8px; align-items: start; margin-top: 10px; } .par img, .foto-sola img { width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; display: block; margin: 0; } .telefono { max-width: 250px; margin: 10px auto 0; border: 9px solid #2b2924; border-radius: 30px; overflow: hidden; } .telefono img { width: 100%; display: block; border: 0; border-radius: 0; margin: 0; } '
  /* el aviso del sistema, dibujado (Windows 11 y Android) */
  + ' .so { font-family: "Segoe UI", system-ui, sans-serif; } .win { background: #f3f3f3; color: #1b1b1b; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.18); padding: 12px 14px; max-width: 360px; font-size: 13px; line-height: 1.35; } .win .app { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #444; margin-bottom: 8px; } .win .ico { width: 16px; height: 16px; border-radius: 4px; background: #4f5f4b; } .win b { display: block; font-weight: 600; margin-bottom: 2px; } .and { background: #fdfaf4; color: #1d1b16; border-radius: 18px; box-shadow: 0 2px 10px rgba(0,0,0,.14); padding: 12px 16px; max-width: 360px; font-family: Roboto, system-ui, sans-serif; font-size: 13px; line-height: 1.4; } .and .app { font-size: 11px; color: #555; margin-bottom: 4px; } .and b { display: block; font-weight: 500; font-size: 14px; } .avisos { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-top: 10px; } .avisos .pie-aviso { font-size: 11px; color: var(--ink-3); margin-top: 6px; } ';
const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', soundOn: false,
  achievements: { 'first.focus': 1759300000000, 'first.breath': 1759310000000 } };
const FECHA = '2026-10-05';                       // lunes
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const ESTADOS = { 1: 'hecha', 2: 'hecha', 3: 'saltada', 4: 'hecha' };

async function foto(b, o) {
  const ctx = await b.newContext({ viewport: o.viewport, deviceScaleFactor: o.dsf || 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block', isMobile: !!o.movil, hasTouch: !!o.movil });
  const semilla = Object.assign({}, SEMILLA, o.extra || {}, { ritmo: o.ritmo || { libre: true } });
  await ctx.addInitScript((s) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); }, semilla);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(FECHA + 'T' + (o.hora || '09:00') + ':00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  let datos = null;
  if (o.antes) datos = await o.antes(page);
  await page.waitForTimeout(600);
  const rec = o.recorte ? await page.evaluate(o.recorte) : null;
  const png = await page.screenshot({ type: 'png' });
  await ctx.close();
  const k = o.dsf || 1;
  const cortada = rec ? await sharp(png).extract({ left: Math.max(0, Math.round(rec.left * k)), top: Math.max(0, Math.round(rec.top * k)), width: Math.round(rec.width * k), height: Math.round(rec.height * k) }).png().toBuffer() : null;
  return { entera: uri(png), recorte: cortada ? uri(cortada) : null, datos };
}

/* Terminar el bloque 1 de verdad (como la suite): empezar y adelantar el reloj. */
async function terminarBloque(page) {
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  for (let i = 0; i < 70; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(50);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const p = ritmoPlan(getState());
    const it = ritmoDetras(p.m, p.m.focos[p.hechos - 1]);
    const plato = it && it.platos && it.platos[0];
    const sig = p.m.focos[p.hechos];
    const hh = (m) => Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
    const prop = document.querySelector('[data-pace-break-prop]');
    return { plato: plato ? plato.name : null, min: plato ? plato.min : null, tipo: it && it.tipo,
      motivo: prop ? (prop.querySelector('[data-pace-break-prop-porque]') || prop).textContent.trim().split('\n')[0] : '',
      hechos: p.hechos, total: p.m.focos.length, siguiente: sig ? hh(sig.desde) : null,
      textoProp: prop ? prop.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : '' };
  });
}

const PANEL = () => { const e = Array.from(document.querySelectorAll('[data-pace-ritmo-panel]')).find((x) => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); return { left: r.left - 10, top: r.top - 40, width: r.width + 20, height: r.height + 50 }; };
const CALENDARIO = () => {
  const res = Array.from(document.querySelectorAll('[data-pace-ritmo-resumen]')).find((x) => x.getBoundingClientRect().width > 0);
  if (!res) return;
  const b = Array.from(res.querySelectorAll('button')).pop();
  if (!b) return;
  const n = b.cloneNode(true);
  n.textContent = 'Al calendario';
  n.style.outline = '2px solid color-mix(in srgb, var(--focus) 45%, transparent)';
  n.style.outlineOffset = '2px';
  b.insertAdjacentText('afterend', ' · ');
  b.parentNode.insertBefore(n, b.nextSibling.nextSibling);
};
const HOJA = async (page) => {
  await page.getByText('Ver la jornada entera').filter({ visible: true }).first().click();
  await page.waitForTimeout(700);
};

(async () => {
  const srv = spawn(process.execPath, [path.join(ROOT, '.claude', 'static-server.js')], { cwd: ROOT, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await esperar(900);
  const b = await chromium.launch();
  const D = { width: 1280, height: 800 }, TEL = { width: 390, height: 844 };
  const TARDE = { cycle: 4, lastActiveDay: new Date(FECHA + 'T12:00:00+02:00').toDateString(), _historyMigrated: true,
    weeklyStats: { focusMinutes: [200, 0, 0, 0, 0, 0, 0], breathMinutes: [6, 0, 0, 0, 0, 0, 0], moveMinutes: [9, 0, 0, 0, 0, 0, 0], waterGlasses: [4, 0, 0, 0, 0, 0, 0] } };
  try {
    const pausa = await foto(b, { viewport: D, ritmo: { dia: JORNADA }, antes: terminarBloque });
    const d = pausa.datos || {};
    const calendario = await foto(b, { viewport: D, dsf: 2, hora: '09:00', ritmo: { dia: JORNADA }, recorte: PANEL, antes: (p) => p.evaluate(CALENDARIO) });
    const stats = await foto(b, { viewport: D, hora: '15:30', extra: TARDE, ritmo: { dia: Object.assign({}, JORNADA, { estados: ESTADOS }) }, antes: (p) => p.keyboard.press('s') });
    const hoja = await foto(b, { viewport: TEL, movil: true, hora: '15:30', extra: TARDE, ritmo: { dia: Object.assign({}, JORNADA, { estados: ESTADOS }) }, antes: HOJA });
    const movil = await foto(b, { viewport: { width: 412, height: 844 }, movil: true, hora: '10:10', extra: { cycle: 1, lastActiveDay: new Date(FECHA + 'T12:00:00+02:00').toDateString(), _historyMigrated: true }, ritmo: { dia: Object.assign({}, JORNADA, { estados: { 1: 'hecha' } }) } });
    const libre = await foto(b, { viewport: { width: 375, height: 667 }, movil: true, ritmo: { libre: true }, antes: (p) => p.evaluate(() => { const h = document.querySelector('[data-pace-home-body]'); return { sobra: h ? h.scrollHeight - h.clientHeight : null }; }) });
    const oscuro = await foto(b, { viewport: D, dsf: 2, hora: '10:10', extra: { palette: 'oscuro', cycle: 1, lastActiveDay: new Date(FECHA + 'T12:00:00+02:00').toDateString(), _historyMigrated: true }, ritmo: { dia: Object.assign({}, JORNADA, { estados: { 1: 'hecha' } }) }, recorte: PANEL });

    const plato = d.plato || 'Hombros ligeros', min = d.min || 4, sig = d.siguiente || '10:00';
    const aviso = (cls, titulo, cuerpo) => cls === 'win'
      ? `<div class="so win"><div class="app"><span class="ico"></span>PACE</div><b>${titulo}</b>${cuerpo}</div>`
      : `<div class="so and"><div class="app">PACE · ahora</div><b>${titulo}</b>${cuerpo}</div>`;
    const card = (sello, titulo, texto, extra, rec) => `
      <div class="tarjeta${rec ? ' rec' : ''}"><span class="sello${rec ? '' : ' gris'}">${sello}</span><span class="t">${titulo}</span><p>${texto}</p>${extra || ''}</div>`;

    const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PACE · s198 · por dónde seguir</title>
${ESTILO.replace('</style>', EXTRA + '</style>')}
</head>
<body>
<main>
  <div class="ceja">PACE · s198 · domingo 4 de octubre · tras v0.132.0 · por dónde seguir</div>
  <h1>Cuatro frentes, de más pequeño a más grande</h1>
  <p>v0.131.0 y v0.132.0 ya están en GitHub. Nada de lo decidido queda pendiente. Abajo, cada frente con fotos de la app real
  (v0.132.0) y lo que costaría. <b>Uno por sesión.</b> Recomendado: <b>D2</b>.</p>

  <h2>D2 · La pausa te llama por su nombre <span style="font-size:14px;color:var(--ink-3)">· una sesión · recomendada</span></h2>
  <p>En la oficina, PACE suele estar en una pestaña de fondo mientras trabajas en otra ventana. Cuando el bloque acaba, lo primero que
  ves <b>no es la app sino el aviso del sistema</b>; al pulsarlo, vuelves a la pestaña con la pausa ya abierta (esta foto: el bloque 1
  de un lunes terminado de verdad, con el reloj adelantado). Hoy el aviso no sabe nada del día servido.</p>
  <div class="lado">
    ${card('Lo que ves al pulsar el aviso', 'La pausa, ya abierta', 'Propone <b>' + plato + '</b> (' + min + ' min). El aviso podría decir lo mismo.', `<div class="foto-sola" style="margin-top:10px"><img src="${pausa.entera}" alt="la pausa al acabar el bloque"></div>`)}
  </div>
  <div class="avisos">
    <div>${aviso('win', 'Foco completado', 'Ciclo cerrado. Elige tu micro-pausa.')}<div class="pie-aviso"><b>Hoy</b> · igual con o sin «A tu ritmo».</div></div>
    <div>${aviso('win', 'Tu pausa: ' + plato + ' · ' + min + ' min', 'Bloque ' + (d.hechos || 1) + ' de ' + (d.total || 9) + ' hecho. El siguiente, a las ' + sig + '.')}<div class="pie-aviso"><b>V1 · qué toca y cuándo vuelves</b> · el nombre arriba; abajo, dónde vas en el día.</div></div>
    <div>${aviso('win', 'Hora de parar · ' + plato, min + ' min, sin salir de tu sitio. A las ' + sig + ', el bloque ' + ((d.hechos || 1) + 1) + '.')}<div class="pie-aviso"><b>V2 · una invitación</b> · más cerca del tono de la app; más largo.</div></div>
  </div>
  <div class="avisos">
    <div>${aviso('and', 'Tu pausa: ' + plato + ' · ' + min + ' min', 'Bloque ' + (d.hechos || 1) + ' de ' + (d.total || 9) + ' hecho. El siguiente, a las ' + sig + '.')}<div class="pie-aviso">V1 en Android (cuando llegue D4).</div></div>
    <div>${aviso('win', 'Hora de comer', 'Hasta las 14:00. Luego, el bloque 5.')}<div class="pie-aviso">La parada de la comida, con V1.</div></div>
    <div>${aviso('win', 'Foco completado', 'Ciclo cerrado. Elige tu micro-pausa.')}<div class="pie-aviso">Por libre (sin menú): como hoy.</div></div>
  </div>
  <p class="medida">El nombre y la duración salen del motor (<code>ritmoDetras</code> sobre el día sembrado), no están escritos a mano. El aviso del sistema está
  dibujado: su aspecto lo pone Windows o Android, no PACE.</p>
  <div class="lado">
    ${card('D2b · y además', 'Llevar el día a tu calendario', 'Un enlace junto a «Cambiar» que baja un <code>.ics</code> con los bloques y las pausas de hoy (sin permisos ni cuentas). Así el calendario del trabajo sabe cuándo paras. El marco verde es de la maqueta.', `<div class="foto-sola" style="margin-top:10px"><img src="${calendario.recorte}" alt="el enlace al calendario"></div>`)}
  </div>

  <h2>D3 · Estadísticas «Hoy» <span style="font-size:14px;color:var(--ink-3)">· varias rondas de maqueta</span></h2>
  <p>Se aparcó en s192 porque «Hoy» tenía que enseñar el menú, y el menú ya existe. Hoy, Estadísticas cuenta minutos; lo que pasó en el día
  (qué pausas hiciste y cuáles saltaste) vive en la hoja del día, que solo existe en el móvil. «Hoy» juntaría las dos cosas en las dos pieles.</p>
  <div class="par">
    <img src="${stats.entera}" alt="Estadísticas hoy">
    <img src="${hoja.entera}" alt="la hoja del día">
  </div>
  <p class="medida">Izquierda: Estadísticas a las 15:30 de un lunes con cuatro bloques. Derecha: la hoja del mismo día (hecha, hecha, saltada, hecha). Las maquetas de s191 (<code>stats-hoy-r1.html</code>) son el punto de partida.</p>

  <h2>D4 · Android <span style="font-size:14px;color:var(--ink-3)">· varias sesiones · camino a v1.0</span></h2>
  <div class="lado">
    <div class="tarjeta"><span class="sello gris">Lo que iría dentro</span><span class="t">La app tal cual, en su piel de móvil</span>
      <div class="telefono"><img src="${movil.entera}" alt="la piel de móvil"></div></div>
    <div class="tarjeta"><span class="sello gris">Lo que hay que hacer</span><span class="t">Las piezas, de barata a cara</span>
      <p><b>El envoltorio</b> (Capacitor): la app ya es estática y sin servidor, es la parte barata.<br>
      <b>Notificaciones nativas</b> (y aquí D2 se ve mejor que en ningún sitio).<br>
      <b>La pantalla encendida nativa</b> (la de v0.131.0 es la del navegador).<br>
      <b>Los eventos en SQLite</b>, con los adaptadores que ya prevé la arquitectura.<br>
      <b>La facturación de Play</b>: obliga a un segundo camino de licencia junto a la web. Es lo caro.</p></div>
  </div>

  <h2>D5 · Lo pendiente sin fecha <span style="font-size:14px;color:var(--ink-3)">· una sesión de pulido</span></h2>
  <div class="lado">
    ${card('Medido', 'La tarjeta por libre hace scroll en un móvil pequeño', 'A 375×667 la home sobra <b>' + ((libre.datos && libre.datos.sobra) || '?') + ' px</b>: la última fila de losetas queda debajo del borde. Viene de antes de v0.130.0.', `<div class="telefono" style="max-width:200px"><img src="${libre.entera}" alt="por libre a 375x667"></div>`)}
    ${card('Para mirar', '«A tu ritmo» en oscuro', 'Nunca se revisó a propósito. Así se ve hoy.', `<div class="foto-sola" style="margin-top:10px"><img src="${oscuro.recorte}" alt="panel en oscuro"></div>`)}
    ${card('Invisible', 'El temporizador de Mueve y Estira', 'Cuenta segundos sueltos en vez de mirar el reloj: con la pestaña en segundo plano se retrasa. Hace falta antes de Android. Y el número de versión, que hoy se cambia a mano en siete sitios.')}
  </div>

  <h2>Para contestar en una línea</h2>
  <ol class="decide">
    <li><b>Frente:</b> D2 · D3 · D4 · D5.</li>
    <li><b>Si D2, el texto del aviso:</b> V1 qué toca y cuándo vuelves · V2 una invitación.</li>
    <li><b>Si D2, el calendario:</b> con <code>.ics</code> · sin él (otra vez).</li>
  </ol>
  <p class="pie">Generada por <code>scripts/audit/por-donde-seguir-s198.js</code> sobre el artefacto de v0.132.0. Fotos de la app real; el enlace «Al calendario»
  es DOM inyectado; los avisos del sistema están dibujados con el texto que daría la app.</p>
</main>
</body>
</html>`;
    fs.writeFileSync(SALIDA, html);
    console.log('-> ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
    console.log('pausa: ' + JSON.stringify(d));
    console.log('por libre sobra: ' + JSON.stringify(libre.datos));
  } finally {
    await b.close();
    srv.kill();
  }
})();
