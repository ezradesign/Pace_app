/* PACE · «Por dónde seguir» después de v0.128.1 (s196)
 * =====================================================
 * Misma regla que en s194 y s195: el usuario decide con una PÁGINA —dónde
 * estamos, una ficha por ruta, fotos de la app real donde la ruta toca algo
 * que se ve, y una lista de decisiones con letras al final—. Lo existente se
 * CALCA de la app (fotos del artefacto committeado), no se dibuja a mano.
 *
 * Fotos: 1536×704 (el viewport del usuario), servicio worker bloqueado (un SW
 * caducado mide otra versión, s195). Semana 38 (caderas) y 39 (manos) a las
 * 9:00 de lunes; una tarde de martes con pausas hechas y saltadas; y la
 * tableta vertical de 820×1100 con la piel de escritorio.
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/por-donde-seguir-s196.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', '@playwright', 'test'));
const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s196.html');
const ESTILO = fs.readFileSync(path.join(ROOT, 'docs', 'proposals', 'por-donde-seguir-s195.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];

const BASE_SEMILLA = {
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
};
const UNA = '  .una { display: grid; grid-template-columns: minmax(0,1fr); gap: 16px; margin-top: 10px; } ';
const uri = (buf) => 'data:image/png;base64,' + buf.toString('base64');

/* Una foto del artefacto real: semilla, reloj y viewport; devuelve la entera y un recorte. */
/* `cycle` pide `lastActiveDay` en el formato del rollover, o el relevo del día lo pone a cero (ritmo.spec.js). */
async function foto(b, { fecha, hora, viewport, dia, recorte, cycle }) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  const semilla = Object.assign({}, BASE_SEMILLA, cycle ? { cycle, lastActiveDay: new Date(fecha + 'T12:00:00+02:00').toDateString(), _historyMigrated: true } : {}, { ritmo: { dia: Object.assign({ fecha, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} }, dia || {}) } });
  await ctx.addInitScript((s) => localStorage.setItem('pace.state.v2', JSON.stringify(s)), semilla);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(fecha + 'T' + hora + ':00+02:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1800);   /* las etiquetas se recolocan al llegar las fuentes (v0.125.2) */
  const png = await page.screenshot({ type: 'png' });
  const m = await page.evaluate(() => {
    const q = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    const panel = q('[data-pace-ritmo-estado="menu"]');
    const paradas = Array.from(document.querySelectorAll('[data-pace-ritmo-linea] [data-pace-ritmo-parada]')).filter((e) => e.getBoundingClientRect().width > 0);
    const nombres = Array.from(document.querySelectorAll('[data-pace-ritmo-linea] [data-pace-ritmo-etiq]')).filter((e) => e.getBoundingClientRect().width > 0).map((e) => (e.querySelector('.pace-rt-n') || e).textContent.trim().replace(/\s*\+\s*/g, ' + '));
    const estados = paradas.map((p) => p.getAttribute('data-pace-ritmo-estado-parada') || '');
    const acc = q('[data-pace-sidebar-accion]');
    return { panelTop: panel ? Math.round(panel.getBoundingClientRect().top) : null, paradas: paradas.length, nombres, estados, accion: acc ? acc.textContent.replace(/\s+/g, ' ').trim() : null };
  });
  await ctx.close();
  const rec = recorte ? await sharp(png).extract(recorte).png().toBuffer() : null;
  return { entera: uri(png), recorte: rec ? uri(rec) : null, m };
}

const fichaRuta = (sello, titulo, que, ahora, coste, riesgo, rec) => `
    <div class="tarjeta${rec ? ' rec' : ''}">
      <span class="sello${rec ? '' : ' gris'}">${sello}</span>
      <span class="t">${titulo}</span>
      <dl class="ficha">
        <dt>Qué verías</dt><dd>${que}</dd>
        <dt>Por qué ahora</dt><dd>${ahora}</dd>
        <dt>Coste</dt><dd>${coste}</dd>
        <dt>Riesgo</dt><dd>${riesgo}</dd>
      </dl>
    </div>`;
const fotoBloque = (sello, titulo, texto, f, entera) => `
    <div class="tarjeta foto">
      <span class="sello gris">${sello}</span>
      <span class="t">${titulo}</span>
      <p>${texto}</p>
      <img src="${f.recorte || f.entera}" alt="${titulo}">
      ${f.recorte && entera ? `<details><summary>La pantalla entera, 1536×704</summary><img src="${f.entera}" alt="${titulo}, entera"></details>` : ''}
    </div>`;

(async () => {
  const b = await chromium.launch();
  const V = { width: 1536, height: 704 };
  const REC = { left: 300, top: 400, width: 1236, height: 304 };
  const REC_TARDE = { left: 0, top: 330, width: 1536, height: 374 };
  const L38 = await foto(b, { fecha: '2026-09-14', hora: '09:00', viewport: V, recorte: REC });
  const L39 = await foto(b, { fecha: '2026-09-21', hora: '09:00', viewport: V, recorte: REC });
  const TARDE = await foto(b, { fecha: '2026-09-15', hora: '15:30', viewport: V, recorte: REC_TARDE, cycle: 6, dia: { estados: { 1: 'hecha', 2: 'hecha', 3: 'hecha', 4: 'saltada', 5: 'hecha' } } });
  const TAB = await foto(b, { fecha: '2026-09-14', hora: '09:00', viewport: { width: 820, height: 1100 } });
  await b.close();
  const medidas = { L38: L38.m, L39: L39.m, TARDE: TARDE.m, TAB: TAB.m };
  console.log(JSON.stringify(medidas, null, 1));
  const hechas = TARDE.m.estados.filter((e) => e === 'hecha').length, saltadas = TARDE.m.estados.filter((e) => e === 'saltada').length;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PACE · Por dónde seguir · después de v0.128.1</title>
${ESTILO.replace('</style>', UNA + '</style>')}
</head>
<body>
<main>
  <div class="ceja">PACE · por dónde seguir · después de v0.128.1</div>
  <h1>Lo que hay, lo que falta y en qué orden</h1>
  <p>s195 cerró en cinco versiones lo que pediste con la página de ideas delante: la pausa con memoria, el agua por tiempo,
  recolocar también al terminar, hecha/saltada en la línea, la tarjeta por libre, la comida como interruptor, la pausa solo
  con Hidrátate y <b>la semana sin decirlo</b>. Esta página pone las cinco rutas que quedan una al lado de otra, con fotos
  de la app real donde la ruta toca algo que se ve. Al final, la lista con letras para contestar en una línea.</p>

  <h2>Dónde estamos</h2>
  <div class="tres">
    <div class="tarjeta hecha"><span class="sello gris">Hecho · v0.126.0</span><span class="t">La pausa con memoria</span>
      <p>Al acabar el bloque, la pausa propone su plato con el glifo del ejercicio: «Hacer la pausa» o «Seguir con el bloque N+1».
      El agua va por tiempo (≥ 50 min, la comida cuenta). Si cambias la duración del aro, el resto del día se recompone. Y la línea
      recuerda: hecha con relleno, saltada en gris punteado.</p></div>
    <div class="tarjeta hecha"><span class="sello gris">Hecho · v0.127.0 – v0.128.1</span><span class="t">La ronda 2 y la semana</span>
      <p>Por libre, la tarjeta «¿Cuánto trabajas hoy?» en el sitio del Camino; la comida se apaga con un mini interruptor; la pausa
      deja solo Hidrátate. Y la semana: seis temas en ciclo × un acento por día × la regla de siempre, <b>sin una palabra en
      pantalla</b> («2, nada»). v0.128.1 arregló lo que salió al re-medir: un Respira de 10' en una pausa de 5'.</p></div>
    <div class="tarjeta"><span class="sello">Pendiente de ti</span><span class="t">Usarla una semana</span>
      <p>Todo lo de s195 salió de tus capturas de un sábado. La semana solo se juzga usándola: si sin copy se nota la variedad, si
      «Seguir con el bloque» te deja saltar sin culpa, si el vaso de agua llega cuando toca.</p></div>
  </div>

  <h2>La semana, como se ve hoy</h2>
  <p>Dos lunes a las 9:00, en la app real a 1536×704. Semana 38 (caderas: ${L38.m.nombres.slice(0, 3).join(' · ')}…) y semana 39
  (manos: ${L39.m.nombres.slice(0, 3).join(' · ')}…). Ninguna palabra lo dice; la diferencia está en la línea. <b>Esto es lo que
  decidiste, y es lo primero que hay que mirar una semana entera.</b></p>
  <div class="una">
    ${fotoBloque('Lunes 14 · semana 38 · caderas', 'Arranca con Mueve, la cadera lidera', L38.m.nombres.join(' · '), L38, true)}
    ${fotoBloque('Lunes 21 · semana 39 · manos', 'Arranca con Mueve, las manos lideran', L39.m.nombres.join(' · '), L39, true)}
  </div>

  <h2>Las cinco rutas</h2>
  <p>La primera es la única que nadie puede hacer por ti y cabe en paralelo con cualquiera de las otras.</p>
  <div class="dos">
    ${fichaRuta('Ruta 1 · en paralelo, solo tú', 'Usarla una semana entera',
      'Nada nuevo. Tú usas «A tu ritmo» de lunes a viernes con la línea moviéndose, y apuntas lo que chirría: una captura por cosa, como el sábado.',
      'Diez minutos de uso real encontraron dos cosas que 260 tests no veían (s194); un sábado, seis (s195). Una semana es la unidad de la pieza nueva.',
      'Tuyo. Yo, mientras, la ruta 2 o la 3.',
      'Ninguno. Lo que encuentres entra en la versión siguiente.')}
    ${fichaRuta('Ruta 2 · recomendada', 'Lo hecho, contado: la barra lateral y la hoja',
      'La línea ya distingue hecha de saltada, pero <b>la barra lateral y la hoja no lo dicen</b>: la tarjeta «Siguiente pausa» sigue igual hagas lo que hagas. Una frase corta bajo la tarjeta («cuatro pausas hechas, una saltada») y en la hoja del día, cada parada con su estado. Foto abajo.',
      'Es la mitad que falta de «la pausa con memoria»: la app recuerda, pero solo lo enseña en la línea. Y es lo que mirarás cuando la uses una semana.',
      'Una versión corta: <code>Sidebar.parts.jsx</code> (la tarjeta), <code>Sidebar.hoja.jsx</code> (la hoja), dos tests calibrados en rojo.',
      'El tono: sin contador ni porcentaje. Una frase, no un marcador. Si se cuenta, se cuenta como se cuenta el agua.', true)}
    ${fichaRuta('Ruta 3', 'La jornada a medida y los huecos del menú',
      'Media jornada con horas ajustables (hoy «jornada = hasta la salida»); el miércoles con tres largas (2.ª, 5.ª y 8.ª: hoy «como sale»); el cierre nunca es «Ahora»; la pausa larga con un plato de dos; el modo oscuro del panel y del hueco punteado.',
      'Son cinco cosas pequeñas que llevan dos sesiones declaradas. Ninguna urge sola; juntas son una versión de pulido.',
      'Una versión. Cada hueco con su test; el modo oscuro con la auditoría de viewports (<code>auditoria-viewports-s195.js</code>, que ya mide la luz).',
      'Tocar la regla (media jornada, el miércoles) sin banco nuevo: el de recolocar y el de la semana cubren parte, no todo.')}
    ${fichaRuta('Ruta 4', 'La tableta vertical: ¿piel de móvil?',
      'A 820×1100 con la piel de escritorio, el aro de 227 flota en 1100 de alto y el panel va en su copia compacta. Foto abajo. La pregunta de s195 sigue sin respuesta: ¿una tableta vertical lleva la piel de móvil (barra abajo, todo a una columna) o se queda así?',
      'Solo si usas tableta. Si no, se queda como está: no rompe nada, solo sobra aire.',
      'Un breakpoint nuevo en <code>_responsive.pieles.js</code> (498 líneas: habría que trocear) y 16 viewports que re-medir.',
      'Un tercer modo de la home que nadie usa. Por eso va detrás de tu respuesta, no delante.')}
  </div>
  <div class="una">
    ${fichaRuta('Ruta 5 · de oficio', 'Limpieza: STATE y dos archivos al límite',
      'Nada en pantalla. <code>STATE.md</code> lleva cinco bloques de «lo que queda» y tres están caducados (se añadió en vez de reescribir). <code>MoveSessionV1.jsx</code> en 500, <code>ritmo.spec.js</code> en 465. La lectura C del norte (Stats «Semana») espera a que <code>origin</code> tenga semanas de datos: no toca.',
      'Un STATE que acumula historia es lo que CLAUDE.md prohíbe, y el arranque de cada sesión lo lee entero.',
      'Media hora dentro de la versión que toque. No merece versión propia.',
      'Ninguno.')}
  </div>

  <h2>Ruta 2, vista</h2>
  <div class="una">
    <div class="tarjeta foto">
      <span class="sello gris">Ruta 2 · foto · 1536×704</span>
      <span class="t">Martes 15 a las 15:30: ${hechas} hechas, ${saltadas} saltada</span>
      <p>La línea lo enseña (relleno y gris punteado). La barra lateral solo mira hacia delante: <i>«${(TARDE.m.accion || '').replace(/(\d)([A-Za-zÁ-ú])/, '$1 · $2').replace('→', ' → ')}»</i>. De lo hecho, nada. Ahí va la frase; y en la hoja del día, cada parada con su estado.</p>
      <img src="${TARDE.recorte}" alt="La tarde con pausas hechas y saltadas">
      <details><summary>La pantalla entera, 1536×704</summary><img src="${TARDE.entera}" alt="La tarde, entera"></details>
    </div>
  </div>

  <div class="recom">
    <p><b>Recomendación:</b> <b>2 con 1 en paralelo</b>, y la 5 dentro de esa misma versión. Tú usas la app de lunes a viernes;
    yo cierro la mitad que falta de la memoria (que lo hecho se lea también en la barra lateral y en la hoja) y dejo STATE
    limpio. Lo que encuentres en la semana decide si la 3 va después o si hay otra cosa antes. La 4 solo con tu respuesta.</p>
  </div>

  <h2>Ruta 4, vista</h2>
  <div class="dos">
    <div class="tarjeta foto">
      <span class="sello gris">820×1100 · piel de escritorio</span>
      <span class="t">La tableta vertical hoy</span>
      <p>Panel en copia compacta (la de móvil), barra lateral de 280, aro flotando. Funciona; sobra aire. La alternativa
      es la piel de móvil (barra abajo, una columna), que está hecha para 360–430 de ancho.</p>
      <img src="${TAB.entera}" alt="Tableta vertical" style="max-width:410px">
    </div>
    <div class="tarjeta">
      <span class="sello gris">Lo que decide</span>
      <span class="t">Si no usas tableta, no hay decisión</span>
      <p>La auditoría de s195 midió 16 viewports y la tableta vertical fue el único donde el arreglo (la copia compacta) no era la
      respuesta a la pregunta de fondo. Es un breakpoint, no un bug. Si en tu semana no aparece una tableta, esta ruta se archiva.</p>
    </div>
  </div>

  <h2>Para contestar en una línea</h2>
  <ol class="decide">
    <li><b>A · La ruta:</b> 2 con 1 en paralelo (recomendada) · 3 · 4 · otra.</li>
    <li><b>B · Si la 2, dónde se lee lo hecho:</b> en la tarjeta de la barra lateral · en la hoja del día · en las dos (recomendado).</li>
    <li><b>C · Si la 2, cómo se cuenta:</b> una frase («cuatro pausas hechas, una saltada») · «4 de 7» pequeño junto a la hora · nada de números, solo los puntos de la hoja.</li>
    <li><b>D · La tableta vertical:</b> se queda · piel de móvil · no la uso (se archiva).</li>
  </ol>
  <p class="pie">Generada por <code>scripts/audit/por-donde-seguir-s196.js</code> sobre el artefacto de v0.128.1. Las fotos son de la app real; nada dibujado a mano.</p>
</main>
</body>
</html>`;
  fs.writeFileSync(SALIDA, html);
  console.log('→ ' + path.relative(ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
