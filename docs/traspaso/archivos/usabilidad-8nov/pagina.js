/* La página de Ez (usabilidad del 8 nov.): las fotos de fotos-ez.js, pasadas a webp y metidas en la
   página, con el estilo de la de la caza de la semana. Ez abre páginas de menos de 512 KB.
   Uso: node pagina.js <carpeta de las fotos>  →  docs/audits/usabilidad-8nov/pagina-ez.html */
'use strict';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const RAIZ = path.resolve(__dirname, '../../../..');
const FOTOS = process.argv[2];
const SALIDA = path.join(RAIZ, 'docs/audits/usabilidad-8nov/pagina-ez.html');

async function img(nombre, alt) {
  const f = path.join(FOTOS, nombre + '.png');
  const m = await sharp(f).metadata();
  const movil = m.width < 700;
  const ancho = movil ? 300 : 960;
  const buf = await sharp(f).resize(ancho).webp({ quality: movil ? 62 : 58 }).toBuffer();
  const alto = Math.round(m.height * ancho / m.width);
  return '<img src="data:image/webp;base64,' + buf.toString('base64') + '" alt="' + alt + '" width="' + ancho + '" height="' + alto + '" loading="lazy">';
}
const par = async (esc, mov, alt, cap) => '<figure><div class="par">' + await img(esc, alt) + await img(mov, 'El móvil: ' + alt) + '</div><figcaption>' + cap + '</figcaption></figure>';
const una = async (n, alt, cap) => '<figure>' + await img(n, alt) + (cap ? '<figcaption>' + cap + '</figcaption>' : '') + '</figure>';
const dos = async (a, b, altA, altB, cap) => '<figure><div class="dos">' + await img(a, altA) + await img(b, altB) + '</div><figcaption>' + cap + '</figcaption></figure>';

function op(caso, letra, titulo, texto, foto, reco) {
  return '<label class="op"><input type="radio" name="' + caso + '" value="' + letra + '" id="' + caso + '-' + letra.toLowerCase() + '"' + (reco ? ' checked' : '') + '>' +
    '<span class="letra" aria-hidden="true">' + letra + '</span><span class="op-cuerpo"><span class="op-titulo"><strong>' + titulo + '</strong>' +
    (reco ? '<span class="reco">La que recomiendo</span>' : '') + '</span><p>' + texto + '</p>' + (foto || '') + '</span></label>';
}
function caso(id, n, ceja, titulo, que, fotos, opciones) {
  return '<section class="caso" id="' + id + '" aria-labelledby="' + id + '-t"><div class="cab"><span class="ceja">' + n + ' · ' + ceja + '</span>' +
    '<h2 id="' + id + '-t">' + titulo + '</h2></div><div class="que">' + que.map((p) => '<p>' + p + '</p>').join('') + '</div>' + fotos +
    '<fieldset class="opciones"><legend>Qué hacemos</legend>' + opciones.join('') + '</fieldset></section>';
}

(async () => {
  const vieja = fs.readFileSync(path.join(RAIZ, 'docs/audits/caza-semana-7nov/pagina-ez.html'), 'utf8');
  let cabeza = vieja.slice(0, vieja.indexOf('</style>'));
  cabeza = cabeza.replace(/<title>[^<]*<\/title>/, '<title>PACE cada día</title>')
    .replace(/\/\* Una columna[\s\S]*?\*\//, '/* Una columna de lectura, como una hoja de PACE: cada mejora con la foto de hoy y sus opciones pintadas\n   sobre la app; abajo, la respuesta de Ez lista para copiar. Paleta y letras de la app. */');
  cabeza += '.dos { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }\n@media (max-width: 640px) { .dos { grid-template-columns: 1fr; } }\n' +
    '.op figure img { max-width: 260px; }\n.op figure.ancha img { max-width: 100%; }\n</style>\n';

  const casos = [];
  casos.push(caso('cierre', 1, 'al acabar la jornada', 'Al cerrar el día, el punto del aro tapa «Ciclo 4 / 4»', [
    'Acabas el último bloque y el aro dice «Jornada cerrada», lo que hiciste y «Seguir por libre». Debajo se queda la fila del ciclo, «Siguiente · Ciclo 4 / 4», y el punto del final del aro cae encima de las letras.',
    'Con el día cerrado esa fila ya no dice nada: durante la jornada no se ve, porque allí manda «Bloque 2 de 9».',
  ], await par('u-cierre-escritorio-hoy', 'u-cierre-movil-hoy', 'Jornada cerrada, 00:00, Seguir por libre, y debajo Siguiente · Ciclo 4 / 4 con el punto del aro encima',
    '<b>Así está hoy.</b> Jueves, 17:30, con la jornada de dos horas acabada.'), [
    op('cierre', 'A', 'Sin la fila del ciclo', 'Con el día cerrado, la fila del ciclo se va, como durante la jornada. El punto se queda al final del aro, sin nada debajo.',
      await una('u-cierre-movil-A', 'El aro cerrado sin la fila del ciclo', 'La misma tarde con la A.'), true),
    op('cierre', 'B', 'Se queda como está', 'La fila del ciclo sigue debajo del botón, con el punto encima.'),
  ]));

  casos.push(caso('barra', 2, 'la barra de arriba, en el ordenador', 'Con una pausa en marcha, «Foco» la corta sin preguntar', [
    'Arriba están Foco, Pausa y Larga. Si llevas un Foco empezado y pulsas «Pausa», PACE pregunta antes, porque el bloque se perdería. Con una pausa empezada no pregunta: pulsas «Foco» y la pausa desaparece con lo que llevabas.',
    'En el móvil esa barra no está, así que esto solo pasa en el ordenador.',
  ], await dos('u-barra-hoy-antes', 'u-barra-hoy-despues', 'Pausa corta en marcha, 02:50, con el ratón sobre Foco', 'Un clic después: Foco manual, 25:00, sin pregunta',
    '<b>Así está hoy.</b> A la izquierda, una pausa corta con 2 minutos hechos; a la derecha, un clic en «Foco» después.'), [
    op('barra', 'A', 'Pregunta también con la pausa', 'La misma ventana que ya sale con el Foco, con sus palabras: «¿Dejar la pausa?», «Seguir con la pausa» o «Volver al Foco».',
      '<figure class="ancha">' + await img('u-barra-A', 'La ventana ¿Dejar la pausa? sobre la pausa en marcha') + '</figure>', true),
    op('barra', 'B', 'Se queda como está', 'Una pausa no suma minutos a nada, así que cortarla no pierde nada que se apunte.'),
  ]));

  casos.push(caso('libre', 3, 'después de la jornada', 'Un Foco por libre al acabar el día, ¿cuenta para tu hora de salida?', [
    'Si tres días sigues con un Foco por libre después de cerrar la jornada, la carta del lunes lo lee como que terminas más tarde y te pregunta si mueve tu salida: «Terminas a las 17:35. ¿Pongo tu salida a las 17:35?».',
    'Nunca la cambia sola, pero la pregunta empuja a alargar el día, y la jornada la cerraste a su hora.',
  ], await par('u-libre-escritorio-hoy', 'u-libre-movil-hoy', 'La carta del lunes: Terminas a las 17:35. ¿Pongo tu salida a las 17:35?',
    '<b>Así está hoy.</b> Lunes 16, tras tres días con la jornada de 9:00 a 17:00 y un Foco por libre de 17:05 a 17:30.'), [
    op('libre', 'A', 'No cuenta', 'Lo que haces por libre después de cerrar la jornada es tuyo. La carta solo mira los bloques de la jornada: si acabas tarde dentro de ella, lo sigue preguntando.', '', true),
    op('libre', 'B', 'Cuenta, como hoy', 'Si sigues por libre tres días, la carta pregunta si mueve tu salida.'),
  ]));

  casos.push(caso('pausa', 4, 'la pausa entre bloques', 'Si haces la pausa a tu manera, PACE la da por saltada', [
    'Acaba un bloque y sale tu pausa. Si te levantas a por agua o das una vuelta sin abrir la rutina, al volver solo puedes pulsar «Seguir con el bloque 2» o «Ahora no», y PACE la apunta como saltada.',
    'Si pasa tres días a la misma hora, la carta del lunes te propone acortarla, aunque sí la hiciste. ChatGPT lo vio el 28 oct. (Q5).',
  ], await par('u-pausa-hoy-escritorio', 'u-pausa-hoy-movil', 'La ventana Tu pausa: Hacer la pausa, Seguir con el bloque 2 y Ahora no',
    '<b>Así está hoy.</b> Jueves, 9:35, al acabar el bloque 1.'), [
    op('pausa', 'A', '«Ya la hice por mi cuenta», junto a «Ahora no»', 'Un enlace discreto al lado de «Ahora no». Da la pausa por hecha sin inventar minutos ni ejercicios: en Estadísticas no suma tiempo, y la carta ya no la lee como saltada.',
      await una('u-pausa-A-movil', 'Ya la hice por mi cuenta, a la izquierda de Ahora no'), true),
    op('pausa', 'B', 'Un botón más, debajo de «Seguir con el bloque 2»', 'Lo mismo, más a la vista; la ventana crece una fila.',
      await una('u-pausa-B-movil', 'Un tercer botón: Ya la hice por mi cuenta')),
    op('pausa', 'C', 'Se queda como está', ''),
  ]));

  casos.push(caso('hasta', 5, 'el aro durante la jornada', '«Hasta las 17:00» en el bloque 1 se lee como el final del bloque', [
    'Durante la jornada, bajo «Bloque 1 de 9», pone «Hasta las 17:00». Es tu hora de salida, pero está encima de la cuenta del bloque, que acaba a las 9:35, y el aviso del móvil dice «Hasta las 9:35» para lo mismo.',
    'Es fácil leer que el bloque dura hasta las cinco.',
  ], await par('u-hasta-hoy-escritorio', 'u-hasta-hoy-movil', 'Bloque 1 de 9, Hasta las 17:00, 40:00',
    '<b>Así está hoy.</b> Jueves, 8:55, cinco minutos dentro del bloque 1.'), [
    op('hasta', 'A', '«Tu jornada, hasta las 17:00»', 'Dice de qué es la hora. Mismo sitio y misma letra.',
      await una('u-hasta-A-movil', 'Bloque 1 de 9, Tu jornada, hasta las 17:00'), true),
    op('hasta', 'B', '«Este bloque, hasta las 9:35»', 'La hora a la que acaba el bloque, como en el aviso del móvil. La salida sigue en la tarjeta de abajo.',
      await una('u-hasta-B-movil', 'Bloque 1 de 9, Este bloque, hasta las 9:35')),
    op('hasta', 'C', 'Se queda como está', ''),
  ]));

  casos.push(caso('voz', 6, 'Ajustes, el sonido', 'Eliges una voz sin poder oírla, y la música solo suena en Respira', [
    'En Ajustes, «Marca la fase» tiene Tono, Voz clara y Voz grave, pero para oír cada una hay que empezar una sesión de Respira.',
    'Y en «Suena detrás», la Música solo suena en Respira (el Ambiente, también en el Foco), y no lo dice. ChatGPT lo vio el 28 oct. (R5).',
  ], await una('u-voz-movil-hoy', 'Ajustes en el móvil: Marca la fase y Suena detrás', '<b>Así está hoy</b>, en el móvil. En el ordenador es el mismo panel.'), [
    op('voz', 'A', '«Escuchar» y una línea bajo «Suena detrás»', 'Un «Escuchar» que suena la voz elegida unos segundos, y «La música suena solo en Respira».',
      await una('u-voz-movil-A', 'Escuchar bajo la voz y La música suena solo en Respira'), true),
    op('voz', 'B', 'Solo la línea de la música', 'Sin «Escuchar».', await una('u-voz-movil-B', 'Solo la línea La música suena solo en Respira')),
    op('voz', 'C', 'Se queda como está', ''),
  ]));

  const ids = ['cierre', 'barra', 'libre', 'pausa', 'hasta', 'voz'];
  const cuerpo = '<main class="hoja"><header class="cabecera"><span class="ceja">PACE cada día · 8 nov. 2026</span>' +
    '<h1>Seis cosas para quien abre PACE cada día</h1>' +
    '<p class="intro">Recorrí PACE entera como alguien que la usa a diario: la jornada, una pausa, las bibliotecas, el ejercicio, Estadísticas, Logros, Ajustes, la bienvenida y /premium, en el móvil y en el ordenador, en claro y en oscuro, en castellano y en inglés. Estas son las seis mejoras que más le ayudarían. Cada una, como está hoy y sus opciones; la primera es la que recomiendo. Nada de esto está montado.</p>' +
    '<div class="hecho"><span class="ceja">Ya mirado, sin nada que elegir</span><ul>' +
    '<li>Ningún error de la app, ningún texto cortado ni sin traducir y ningún scroll de más en las pantallas que recorrí.</li>' +
    '<li>No he cambiado nada: todo lo que encontré cambia lo que se ve, así que espera a tus letras.</li>' +
    '<li>Para después de v1: «baja · sube» en las repeticiones (P7), el modo «Solo pausas» sin Pomodoro (V1) y reescribir la oferta de /premium.</li>' +
    '</ul></div></header>' + casos.join('\n') +
    '<aside class="respuesta" aria-label="Tu respuesta"><div class="caja"><span class="ceja">Tu respuesta</span><div class="linea">' +
    '<span id="texto-respuesta">1A 2A 3A 4A 5A 6A</span><button type="button" id="copiar">Copiar</button></div>' +
    '<span id="aviso-copia" role="status"></span></div></aside>' +
    '<footer class="pie"><span>Fotos de la 0.194.0 en un ordenador de 1280 × 800 y un móvil de 360 × 800, con el reloj adelantado; las opciones, pintadas encima de la app de verdad. El informe, en la rama <code>claude/usabilidad-8nov-587b48</code>: <code>docs/audits/usabilidad-8nov.md</code>.</span></footer></main>\n';
  const guion = '<script>\n(function () {\n  var casos = ' + JSON.stringify(ids) + ';\n' +
    "  var texto = document.getElementById('texto-respuesta');\n  var aviso = document.getElementById('aviso-copia');\n  var CLAVE = 'usabilidad-8nov-respuesta';\n  var antes = {};\n" +
    "  try { antes = JSON.parse(localStorage.getItem(CLAVE) || '{}'); } catch (e) {}\n" +
    "  casos.forEach(function (c) { if (antes[c]) { var r = document.getElementById(c + '-' + String(antes[c]).toLowerCase()); if (r) r.checked = true; } });\n" +
    "  function leer() { var o = {}; casos.forEach(function (c) { var r = document.querySelector('input[name=\"' + c + '\"]:checked'); o[c] = r ? r.value : '?'; }); return o; }\n" +
    "  function pintar() { var o = leer(); texto.textContent = casos.map(function (c, i) { return (i + 1) + o[c]; }).join(' '); aviso.textContent = '';\n" +
    "    try { localStorage.setItem(CLAVE, JSON.stringify(o)); } catch (e) {} }\n" +
    "  document.addEventListener('change', function (e) { if (e.target && e.target.type === 'radio') pintar(); });\n" +
    "  document.getElementById('copiar').addEventListener('click', function () {\n    var t = texto.textContent;\n" +
    "    function aMano() { var sel = window.getSelection(), rango = document.createRange(); rango.selectNodeContents(texto); sel.removeAllRanges(); sel.addRange(rango); aviso.textContent = 'Seleccionada: cópiala con Ctrl+C.'; }\n" +
    "    try { navigator.clipboard.writeText(t).then(function () { aviso.textContent = 'Copiada: pégala en el chat.'; }, aMano); } catch (e) { aMano(); }\n  });\n  pintar();\n})();\n</script>\n";
  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  const html = cabeza + cuerpo + guion;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, Math.round(Buffer.byteLength(html) / 1024) + ' KB');
})();
