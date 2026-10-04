/* PACE · s198 · LO ARREGLADO, LO QUE FALTA DECIDIR Y POR DONDE SEGUIR, en una pagina
 * ===================================================================================
 * El usuario pidio «revisa la repo, audita, plantea novedades e implementaciones».
 * La auditoria midio siete defectos sobre v0.130.0 y v0.131.0 los arregla sin
 * cambiar un pixel. Lo que SI es visual se decide mirando (regla de s173/s174):
 *  · A · que ve la persona si una parte de la app falla (hoy: la pantalla en blanco,
 *        fotografiada provocando un fallo de render de verdad).
 *  · B · que se le dice cuando el arranque repara algo o guarda un rescate.
 *  · C · la pantalla encendida en las sesiones: con o sin interruptor.
 *  · D · el frente siguiente.
 * Fotos de la app real con el DOM retocado; nada dibujado a mano.
 *
 * Uso: node scripts/audit/saneamiento-s198.js   (levanta su propio servidor en 8796)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const PUERTO = 8796;
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'saneamiento-s198.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];
const EXTRA = ' .una { display: grid; grid-template-columns: minmax(0,1fr); gap: 16px; margin-top: 10px; } .lado { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; align-items: start; } .medida { font-size: 12px; color: var(--ink-3); margin-top: 6px; } table.arreglos { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; } table.arreglos th, table.arreglos td { text-align: left; vertical-align: top; padding: 7px 8px; border-bottom: 1px solid var(--line); } table.arreglos th { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; } .par { display: grid; grid-template-columns: minmax(0,3fr) minmax(0,1fr); gap: 8px; align-items: start; margin-top: 10px; } .par img { width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; display: block; margin: 0; } details { margin-top: 8px; } details img { max-width: none; width: auto; } details > div { overflow-x: auto; } ';
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, soundOn: false,
  totalFocusMin: 1240, achievements: { 'first.focus': 1758000000000, 'first.breath': 1758100000000 } };
const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function foto(b, { viewport, movil, antes, recorte, dsf }) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: dsf || 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block', isMobile: !!movil, hasTouch: !!movil });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), SEMILLA);
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e.message || e)));
  await page.clock.install({ time: new Date('2026-10-05T11:20:00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  if (antes) await antes(page);
  await page.waitForTimeout(700);
  const rec = recorte ? await page.evaluate(recorte) : null;
  const raiz = await page.evaluate(() => { const r = document.getElementById('pace-root') || document.getElementById('root'); return r ? r.children.length : -1; });
  const png = await page.screenshot({ type: 'png' });
  await ctx.close();
  const k = dsf || 1;
  const cortada = rec ? await sharp(png).extract({ left: Math.max(0, Math.round(rec.left * k)), top: Math.max(0, Math.round(rec.top * k)), width: Math.round(rec.width * k), height: Math.round(rec.height * k) }).png().toBuffer() : null;
  return { entera: uri(png), recorte: cortada ? uri(cortada) : null, errores, raiz };
}

/* ---- calcos: corren en la pagina, sin ambito exterior ---- */
const PANTALLA_ERROR = (movil) => {
  const logo = document.getElementById('pace-logo-src');
  const d = document.createElement('div');
  d.setAttribute('data-maqueta', 'error-global');
  d.style.cssText = 'position:fixed;inset:0;z-index:999;background:var(--paper);display:grid;place-items:center;padding:24px;color:var(--ink)';
  d.innerHTML = '<div style="max-width:420px;width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">'
    + (logo ? '<img src="' + logo.src + '" alt="PACE" style="width:' + (movil ? 150 : 180) + 'px;height:auto;margin-bottom:6px">' : '')
    + '<h1 style="font-family:var(--font-display);font-style:italic;font-weight:500;font-size:' + (movil ? 30 : 36) + 'px;line-height:1.1;margin:0">Algo se ha torcido</h1>'
    + '<p style="margin:0;font-size:14px;line-height:1.55;color:var(--ink-2);max-width:360px">Esta pantalla no ha podido dibujarse. Lo que llevas hecho sigue guardado en este dispositivo.</p>'
    + '<button style="margin-top:6px;padding:13px 40px;border-radius:var(--r-pill);background:var(--focus-cta);border:1px solid var(--focus-cta);color:var(--paper);font-size:13px;letter-spacing:.12em;font-family:var(--font-ui)">VOLVER A EMPEZAR</button>'
    + '<button style="background:transparent;border:none;font-family:var(--font-display);font-style:italic;font-size:13.5px;color:var(--ink-2);text-decoration:underline;text-underline-offset:3px">Descargar una copia de tus datos</button>'
    + '<p style="margin:6px 0 0;font-size:11.5px;color:var(--ink-3);max-width:320px">Si se repite, guarda la copia: con ella se recupera todo.</p>'
    + '</div>';
  document.body.appendChild(d);
};
const PARTE_ERROR = () => {
  const card = Array.from(document.querySelectorAll('[data-pace-modal-card]')).pop();
  if (!card) return;
  const cerrar = card.querySelector('[data-pace-modal-close]');
  /* La red envuelve la superficie ENTERA y pinta su propio dialogo, del ancho de
     un aviso: dentro de la caja de 1240 px de Estadisticas un aviso se pierde. */
  card.style.maxWidth = '560px';
  card.innerHTML = '';
  if (cerrar) card.appendChild(cerrar);
  const d = document.createElement('div');
  d.style.cssText = 'padding:20px 4px 6px;display:flex;flex-direction:column;align-items:flex-start;gap:12px';
  d.innerHTML = '<div class="pace-meta">Estadísticas</div>'
    + '<h2 style="font-family:var(--font-display);font-style:italic;font-weight:500;font-size:30px;line-height:1.1;margin:0">Esta parte no ha podido abrirse</h2>'
    + '<p style="margin:0;font-size:14px;line-height:1.55;color:var(--ink-2)">El resto de PACE sigue funcionando y tus datos están a salvo. Puedes cerrarla y seguir, o recargar para volver a intentarlo.</p>'
    + '<div style="display:flex;gap:10px;margin-top:6px">'
    + '<button style="padding:10px 26px;border-radius:var(--r-pill);background:var(--ink);color:var(--paper);border:1px solid var(--ink);font-size:12px;letter-spacing:.1em;font-family:var(--font-ui)">CERRAR</button>'
    + '<button style="padding:10px 26px;border-radius:var(--r-pill);background:transparent;color:var(--ink-2);border:1px solid var(--line-2);font-size:12px;letter-spacing:.1em;font-family:var(--font-ui)">RECARGAR</button>'
    + '</div>';
  card.appendChild(d);
};
const AJUSTES_ABAJO = () => {
  const p = document.querySelector('[data-pace-tweaks-panel]');
  if (p) p.scrollTop = p.scrollHeight;
};
const AJUSTES_RECORTE = () => {
  const p = document.querySelector('[data-pace-tweaks-panel]');
  const r = p.getBoundingClientRect();
  return { left: r.left - 6, top: Math.max(0, r.bottom - 330), width: r.width + 12, height: Math.min(330, r.height) + 6 };
};
const FILA_RESCATE = () => {
  const filas = Array.from(document.querySelectorAll('[data-pace-tweaks-panel] .pace-aj-accion'));
  const exportar = filas.find((f) => /Exportar/.test(f.textContent));
  const borrar = filas.find((f) => /Borrar/.test(f.textContent));
  if (!exportar || !borrar) return;
  const nueva = exportar.cloneNode(true);
  nueva.querySelector('span').innerHTML = 'Descargar la copia de rescate <span style="color:var(--ink-3);font-size:.92em">· 4 oct.</span>';
  nueva.style.outline = '2px solid color-mix(in srgb, var(--focus) 45%, transparent)';
  nueva.style.outlineOffset = '-2px';
  borrar.parentNode.insertBefore(nueva, borrar);
};
const AVISO = () => {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:200;display:flex;align-items:center;gap:14px;padding:12px 20px;background:var(--paper);border:1px solid var(--line-2);border-radius:var(--r-md);box-shadow:var(--sh-card);min-width:300px';
  d.innerHTML = '<div style="width:40px;height:40px;border-radius:50%;border:1px solid var(--line-2);display:grid;place-items:center;font-family:var(--font-display);font-style:italic;font-size:18px;color:var(--ink-2)">i</div>'
    + '<div><div style="font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-3)">Un aviso</div>'
    + '<div style="font-family:var(--font-display);font-style:italic;font-size:18px;font-weight:500;line-height:1.2">Hemos arreglado un dato estropeado</div>'
    + '<div style="font-size:11px;color:var(--ink-3)">Tu semana empezaba en blanco; lo demás está intacto.</div></div>';
  document.body.appendChild(d);
};

(async () => {
  const srv = spawn(process.execPath, [path.join(ROOT, '.claude', 'static-server.js')], { cwd: ROOT, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await esperar(900);
  const b = await chromium.launch();
  const D = { width: 1280, height: 800 };
  const M = { width: 412, height: 844 };
  try {
    /* HOY: un fallo de render de verdad. La semana a null en caliente (como la
       dejaria un bug: el saneado de s198 solo actua AL CARGAR) y abrir Estadisticas.
       Medido en sonda: Logros lo tolera, Estadisticas no — y sin limite de error
       React desmonta la app ENTERA (0 nodos en la raiz), no solo Estadisticas. */
    const ROMPER = async (p) => {
      await p.evaluate(() => window.setState({ weeklyStats: null }));
      await p.keyboard.press('s');
      await p.waitForTimeout(400);
    };
    const blanco = await foto(b, { viewport: D, antes: ROMPER });
    const blancoMovil = await foto(b, { viewport: M, movil: true, dsf: 2, antes: ROMPER });
    const raizVacia = blanco.raiz === 0;
    const global = await foto(b, { viewport: D, antes: (p) => p.evaluate(PANTALLA_ERROR, false) });
    const globalMovil = await foto(b, { viewport: M, movil: true, dsf: 2, antes: (p) => p.evaluate(PANTALLA_ERROR, true) });
    const parte = await foto(b, { viewport: D, antes: async (p) => { await p.getByRole('button', { name: 'Ver estadísticas' }).click(); await p.waitForTimeout(500); await p.evaluate(PARTE_ERROR); } });
    const ajHoy = await foto(b, { viewport: D, dsf: 2, antes: async (p) => { await p.getByRole('button', { name: 'Abrir ajustes' }).click(); await p.waitForTimeout(400); await p.evaluate(AJUSTES_ABAJO); }, recorte: AJUSTES_RECORTE });
    const ajFila = await foto(b, { viewport: D, dsf: 2, antes: async (p) => { await p.getByRole('button', { name: 'Abrir ajustes' }).click(); await p.waitForTimeout(400); await p.evaluate(FILA_RESCATE); await p.evaluate(AJUSTES_ABAJO); }, recorte: AJUSTES_RECORTE });
    const aviso = await foto(b, { viewport: D, antes: (p) => p.evaluate(AVISO) });

    const card = (sello, titulo, texto, img, extra, rec) => `
      <div class="tarjeta foto${rec ? ' rec' : ''}"><span class="sello${rec ? '' : ' gris'}">${sello}</span><span class="t">${titulo}</span><p>${texto}</p>${img ? `<img src="${img}" alt="${titulo}">` : ''}${extra || ''}</div>`;
    const par = (esc, mov, alt) => `<div class="par"><img src="${esc}" alt="${alt}, escritorio"><img src="${mov}" alt="${alt}, móvil"></div>`;

    const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PACE · s198 · saneamiento y por dónde seguir</title>
${ESTILO.replace('</style>', EXTRA + '</style>')}
</head>
<body>
<main>
  <div class="ceja">PACE · s198 · domingo 4 de octubre · auditoría, arreglos y lo que falta decidir</div>
  <h1>Siete cosas que no se veían, arregladas; tres que se deciden mirando</h1>
  <p>Pediste revisar la repo entera. Lo que sigue está <b>medido en la app publicada</b> (v0.130.0) con una sonda en un navegador de
  verdad, no deducido leyendo. v0.131.0 arregla los siete defectos <b>sin cambiar un píxel</b>. Lo que sí cambiaría la pantalla
  está abajo, pintado sobre la app real, para que lo elijas viéndolo.</p>

  <h2>Lo arreglado en v0.131.0</h2>
  <table class="arreglos">
    <tr><th>Qué pasaba</th><th>Medido en v0.130.0</th><th>Ahora</th></tr>
    <tr><td><b>Un dato roto borraba todo.</b> Si un campo guardado tenía otra forma (un import lo aceptaba), la app arrancaba vacía y la primera escritura pisaba la historia.</td><td>4321 min de foco, logros y días → <b>0</b>; volvía el onboarding</td><td>Se repara solo ese campo; si aun así no se puede leer, el texto crudo queda en una copia de rescate que viaja en «Exportar»</td></tr>
    <tr><td><b>El import no miraba lo que entraba.</b></td><td>Un backup con <code>weeklyStats: null</code> dejaba la app de fábrica al recargar</td><td>Pasa por el mismo saneado que el arranque</td></tr>
    <tr><td><b>«Borrar todos mis datos» no borraba todo.</b> <code>privacy.html</code> promete que lo borrado desaparece.</td><td>Quedaban el bloque en marcha, la respiración a medias y los días en oscuro</td><td>Se borra toda clave de PACE</td></tr>
    <tr><td><b>Espacio no pausaba</b> si la sesión venía de «Continúa» en la barra lateral (pulsaba el botón escondido detrás).</td><td>El contador seguía con «ESPACIO PAUSAR» en pantalla</td><td>La sesión toma el foco y no lo suelta con Tab</td></tr>
    <tr><td><b>Escape cerraba el de abajo.</b> Con «Antes de empezar» encima de la biblioteca.</td><td>Se cerraba la biblioteca y quedaba la vista previa</td><td>Escape es del diálogo de arriba</td></tr>
    <tr><td><b>Los diálogos no eran diálogos</b> (lector de pantalla y teclado).</td><td>Foco en el fondo; 25 de 30 Tab salían detrás</td><td>Rol, nombre, foco dentro, Tab que da la vuelta y foco devuelto al cerrar; el onboarding también</td></tr>
    <tr><td><b>Atajos fuera de sitio.</b> Ctrl+S abría Estadísticas; una «s» en mitad de una respiración, también.</td><td>Sí, los dos</td><td>Sin modificadores y nunca con una sesión delante; Escape cierra Ajustes</td></tr>
    <tr><td><b>La pantalla se apagaba</b> a mitad de una sesión guiada en el móvil.</td><td>Ninguna sesión la pedía</td><td>Respira, Mueve, Estira y los pasos de un Camino la mantienen encendida; el Foco no</td></tr>
  </table>
  <p class="medida">Red: 12 pruebas nuevas; las 11 que pueden correr contra v0.130.0, en rojo por la razón que dicen sus mensajes (la duodécima prueba en puro una función que allí no existe); banco de mutantes en
  <code>scripts/audit/banco-saneamiento-s198.js</code>.</p>

  <h2>A · Si una parte de la app falla, ¿qué ves?</h2>
  <p>Hoy no hay red: si algo falla al dibujarse, React desmonta la app <b>entera</b>, no solo la parte que falló. Aquí abajo, provocado
  de verdad: la semana rota en caliente (como la dejaría un fallo de código; el saneado de hoy solo actúa al cargar) y abrir Estadísticas.
  Falla Estadísticas y se va todo — la barra lateral, el aro y un bloque si estaba corriendo. Ningún arreglo de hoy lo cambia, porque lo
  que se ve <b>es diseño</b>.</p>
  <div class="lado">
    ${card('Hoy', 'La pantalla en blanco', 'Escritorio y móvil, tras pulsar S. La raíz de la app queda con ' + blanco.raiz + ' nodos. No hay forma de salir salvo recargar a mano.', null, par(blanco.entera, blancoMovil.entera, 'hoy'))}
    ${card('A1 · una pantalla para todo', '«Algo se ha torcido»', 'Una sola red alrededor de la app. Si falla cualquier cosa, esta página: volver a empezar o descargar tus datos. Sencilla, pero un fallo en Estadísticas te saca de un bloque en marcha.', null, par(global.entera, globalMovil.entera, 'A1'))}
    ${card('A2 · se cierra solo esa parte · recomendada', '«Esta parte no ha podido abrirse»', 'Una red por superficie (cada diálogo y cada sesión) más la de A1 como último recurso. Si falla Estadísticas, solo Estadísticas: el bloque sigue corriendo detrás.', parte.entera, '', true)}
  </div>

  <h2>B · Cuando el arranque repara un dato o guarda un rescate</h2>
  <p>Desde hoy pasa en silencio (queda en la consola). La pregunta es si se dice y dónde. Recortes del panel de Ajustes a doble resolución.</p>
  <div class="lado">
    ${card('B1 · silencio', 'Como hoy', 'La reparación es invisible; el rescate existe pero solo lo encuentra quien sabe dónde mirar.', ajHoy.recorte)}
    ${card('B2 · una fila en «Tus datos» · recomendada', '«Descargar la copia de rescate · 4 oct.»', 'Solo aparece si hay rescate (el marco verde es de la maqueta, para que la veas). No interrumpe; está donde ya buscas tus datos.', ajFila.recorte, '', true)}
    ${card('B3 · un aviso al arrancar', '«Hemos arreglado un dato estropeado»', 'Una vez, con el lenguaje del aviso de logro pero en tinta. Se entera todo el mundo, también quien no podía hacer nada con ello.', aviso.entera)}
  </div>

  <h2>C · La pantalla encendida en las sesiones</h2>
  <div class="lado">
    <div class="tarjeta rec"><span class="sello">C1 · sin interruptor · recomendada</span><span class="t">Como queda en v0.131.0</span>
      <p>Mientras hay una sesión guiada abierta, la pantalla no se apaga; al salir, se suelta. Es lo que hacen las apps de respiración y
      ejercicio, y el Foco no la pide (un bloque de 45 min con la pantalla encendida es batería).</p></div>
    <div class="tarjeta"><span class="sello gris">C2 · con interruptor</span><span class="t">«Mantener la pantalla encendida en las sesiones»</span>
      <p>Una fila más en Ajustes › Sonido y sesiones, encendida por defecto. Para quien prefiere que el sistema mande; cuesta una
      fila en un panel que hoy cabe en una pantalla.</p></div>
  </div>

  <h2>D · Por dónde seguir</h2>
  <p>Todo lo decidido hasta s197 está hecho. Cuatro frentes posibles, de más pequeño a más grande; uno por sesión.</p>
  <div class="lado">
    <div class="tarjeta rec"><span class="sello">D1 · recomendada</span><span class="t">La red de A y B</span>
      <p>Lo que elijas arriba. Pequeño, y cierra el saneamiento: con él, nada de lo que falle puede dejarte sin salida ni sin tus datos.
      Una sesión.</p></div>
    <div class="tarjeta"><span class="sello gris">D2</span><span class="t">La pausa te llama por su nombre</span>
      <p>Hoy, con la pestaña en segundo plano, el aviso de fin de bloque dice «Foco completado · Ciclo cerrado. Elige tu micro-pausa.». Con «A tu ritmo» podría decir
      «Tu pausa: Hombros ligeros · 4 min». Y exportar el día a tu calendario (.ics, sin permisos). Uso diario, sin pantallas nuevas.</p></div>
    <div class="tarjeta"><span class="sello gris">D3</span><span class="t">Estadísticas «Hoy» con el día servido</span>
      <p>Reabre la Fase 4, aparcada en s192 porque «Hoy» tenía que enseñar el menú. El menú ya existe; las maquetas de s191 son el
      punto de partida. Varias rondas de maqueta.</p></div>
    <div class="tarjeta"><span class="sello gris">D4</span><span class="t">Android</span>
      <p>Fase 9: el envoltorio (Capacitor), notificaciones nativas, la pantalla encendida nativa y la facturación de Play. Lo caro es la
      facturación. Varias sesiones.</p></div>
  </div>

  <h2>Para contestar en una línea</h2>
  <ol class="decide">
    <li><b>A:</b> A1 una pantalla para todo · A2 se cierra solo esa parte.</li>
    <li><b>B:</b> B1 silencio · B2 una fila en «Tus datos» · B3 un aviso al arrancar.</li>
    <li><b>C:</b> C1 sin interruptor · C2 con interruptor.</li>
    <li><b>D:</b> D1 · D2 · D3 · D4.</li>
  </ol>
  <p class="pie">Generada por <code>scripts/audit/saneamiento-s198.js</code> sobre el artefacto de v0.131.0. «Hoy» es un fallo provocado de verdad;
  A, B3 y la fila de B2 son DOM inyectado en la app real. Nada dibujado a mano.</p>
</main>
</body>
</html>`;
    fs.writeFileSync(SALIDA, html);
    console.log('-> ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
    console.log('hoy: raiz con ' + blanco.raiz + ' nodos · errores: ' + JSON.stringify(blanco.errores.slice(0, 2)));
    if (!raizVacia) console.log('AVISO: el fallo provocado NO vacio la raiz; el texto de «hoy» no seria cierto');
  } finally {
    await b.close();
    srv.kill();
  }
})();
