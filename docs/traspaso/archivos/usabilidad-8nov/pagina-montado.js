/* La página «Montado» de Ez (usabilidad del 8 nov. y la caza de la semana): las fotos de
   fotos-montado.js, antes y después, pasadas a webp y metidas en la página con el estilo de la de las
   letras. Ez abre páginas de menos de 512 KB.
   Uso: node pagina-montado.js <carpeta de las fotos>  →  docs/audits/usabilidad-8nov/montado-ez.html */
'use strict';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const RAIZ = path.resolve(__dirname, '../../../..');
const FOTOS = process.argv[2];
const SALIDA = path.join(RAIZ, 'docs/audits/usabilidad-8nov/montado-ez.html');

async function img(nombre, alt) {
  const f = path.join(FOTOS, nombre + '.png');
  const m = await sharp(f).metadata();
  const movil = m.width < 700;
  const ancho = movil ? 280 : 880;
  const buf = await sharp(f).resize(ancho).webp({ quality: movil ? 60 : 55 }).toBuffer();
  const alto = Math.round(m.height * ancho / m.width);
  return '<img src="data:image/webp;base64,' + buf.toString('base64') + '" alt="' + alt + '" width="' + ancho + '" height="' + alto + '" loading="lazy">';
}
/* Una fila: la foto del ordenador y la del móvil, con su línea llana debajo. */
async function fila(etiqueta, escena, cuando, alt, linea, sinMovil) {
  const esc = await img('m-' + escena + '-escritorio-' + cuando, alt);
  const mov = sinMovil ? '' : await img('m-' + escena + '-movil-' + cuando, 'El móvil: ' + alt);
  return '<figure class="' + cuando + '"><span class="marca">' + etiqueta + '</span><div class="' + (sinMovil ? 'sola' : 'par') + '">' + esc + mov + '</div><figcaption>' + linea + '</figcaption></figure>';
}
async function caso(id, n, ceja, titulo, escena, alt, antes, ahora, sinMovil) {
  return '<section class="caso" id="' + id + '" aria-labelledby="' + id + '-t"><div class="cab"><span class="ceja">' + n + ' · ' + ceja + '</span>' +
    '<h2 id="' + id + '-t">' + titulo + '</h2></div>' +
    await fila('Antes', escena, 'antes', alt[0], antes, sinMovil) + await fila('Ahora', escena, 'despues', alt[1], ahora, sinMovil) + '</section>';
}

(async () => {
  const vieja = fs.readFileSync(path.join(RAIZ, 'docs/audits/usabilidad-8nov/pagina-ez.html'), 'utf8');
  let cabeza = vieja.slice(0, vieja.indexOf('</style>'));
  cabeza = cabeza.replace(/<title>[^<]*<\/title>/, '<title>PACE · Montado</title>')
    .replace(/\/\* Una columna[\s\S]*?\*\//, '/* Una columna de lectura, como una hoja de PACE: cada cambio con la foto de antes y la de ahora,\n   en el ordenador y en el móvil, y una línea llana debajo. Paleta y letras de la app. */');
  cabeza += '.sola img { width: 100%; height: auto; }\n.marca { display: inline-block; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; font-weight: 600; margin-bottom: .4rem; color: var(--ink-3); }\n' +
    'figure.despues .marca { color: var(--focus, #6b7a3a); }\nfigure + figure { margin-top: .75rem; }\n.sin-foto { font-size: .94rem; color: var(--ink-2); }\n</style>\n';

  const casos = [
    await caso('cierre', 1, 'al acabar la jornada · 1A y S3', 'El aro de cierre, limpio y con tus minutos', 'cierre',
      ['Jornada cerrada con la fila Siguiente · Ciclo 4 / 4 y los minutos del último bloque', 'Jornada cerrada sin la fila del ciclo y con 25:00'],
      'Debajo de «Seguir por libre» quedaba «Siguiente · Ciclo 4 / 4», con el punto del aro encima, y el Foco por libre empezaba con los minutos del último bloque.',
      'Sin la fila del ciclo, y «Seguir por libre» empieza con tus minutos de antes del día: 25 si nunca los cambiaste.'),
    await caso('barra', 2, 'la barra de arriba, en el ordenador · 2A', 'Con una pausa empezada, «Foco» pregunta antes', 'barra',
      ['Un clic en Foco y la pausa desaparece', 'La ventana ¿Dejar la pausa?'],
      'Con 2 minutos de pausa hechos, un clic en «Foco» la cortaba sin preguntar.',
      'Sale la misma ventana que con un Foco, con sus palabras: lo que llevas, «Seguir con la pausa» o «Volver al Foco». En el móvil la barra no está.', true),
    await caso('libre', 3, 'la carta del lunes · 3A', 'Lo que haces por libre al acabar ya no mueve tu salida', 'libre',
      ['La carta pregunta si pone tu salida a las 17:35', 'La carta sin esa pregunta'],
      'Tres días con un Foco por libre de 17:05 a 17:30, y la carta preguntaba «Terminas a las 17:35. ¿Pongo tu salida a las 17:35?».',
      'Un Foco que empieza después de tu salida es tuyo: la carta ya no lo cuenta. Si acabas tarde dentro de la jornada, lo sigue preguntando.'),
    await caso('pausa', 4, 'la ventana de la pausa · 4A', '«Ya la hice por mi cuenta», junto a «Ahora no»', 'pausa',
      ['La ventana de la pausa con Ahora no', 'La ventana con Ya la hice por mi cuenta a la izquierda de Ahora no'],
      'Si hacías la pausa a tu manera solo quedaba «Ahora no», y la pausa contaba como saltada.',
      'Un enlace con el mismo estilo: la pausa queda «por tu cuenta», sin minutos en Estadísticas, y la carta ya no la lee como saltada.'),
    await caso('hasta', 5, 'el aro durante la jornada · 5A', 'Dice de qué es la hora', 'hasta',
      ['Bloque 1 de 9, Hasta las 17:00', 'Bloque 1 de 9, Tu jornada, hasta las 17:00'],
      '«Hasta las 17:00» encima de la cuenta del bloque se leía como el final del bloque.',
      '«Tu jornada, hasta las 17:00», en el mismo sitio y con la misma letra. Cabe sin scroll a 360 y a 1280.'),
    await caso('comida', 6, 'antes de comer · S7', 'El bloque empezado antes de comer acaba a la hora de comer', 'comida',
      ['El bloque de 45 minutos, hasta las 14:31', 'El bloque de 14 minutos, hasta las 14:00, y la comida detrás'],
      '«Ahora no» en la pausa de las 13:45 y «Empezar ya el bloque 2» a las 13:46: el bloque duraba 45 min, hasta las 14:31, y la comida quedaba atrás.',
      'Acaba a las 14:00, como antes de una reunión, y la comida sigue a su hora.'),
    await caso('tras', 7, 'al volver tras la pausa · S11', 'El día se lee desde ahora en cuanto la pausa acabó', 'tras',
      ['A las 12:10 la tarjeta sigue en la pausa de las 8:45', 'A las 12:10 la tarjeta dice el bloque 2 desde ahora'],
      'Con PACE de fondo de 8:46 a 12:10, la tarjeta y la línea seguían en la pausa de las 8:45, con todo el día en horas pasadas.',
      'Se lee desde ahora, lo mismo que sale al pulsar «Empezar bloque 2». No se escribe nada hasta que empiezas.'),
  ];
  const cuerpo = '<main class="hoja"><header class="cabecera"><span class="ceja">PACE · Montado · 8 nov. 2026</span>' +
    '<h1>Lo que elegiste, ya en la app</h1>' +
    '<p class="intro">Las nueve letras del 8 nov.: las cinco de quien abre PACE cada día que tocan esta rama (1A, 2A, 3A, 4A y 5A) y las cuatro de la caza de la semana (S3, S6, S7 y S11). Cada cambio que se ve, como estaba y como queda, en el ordenador y en el móvil. Van juntas a la 0.195.0, que sube la coordinadora.</p>' +
    '<div class="hecho"><span class="ceja">Sin foto</span><ul>' +
    '<li>S6: la carta ya no propone «pasa a ser de 2 minutos» a una pausa que ya era de 2.</li>' +
    '<li>La 6 (oír la voz en Ajustes) la monta otra sesión, con lo que vio alguien nuevo.</li>' +
    '</ul></div></header>' + casos.join('\n') +
    '<footer class="pie"><span>Antes: la 0.194.0. Ahora: la rama <code>claude/usabilidad-8nov-587b48</code>. Un ordenador de 1280 × 800 y un móvil de 360 × 800, con el reloj adelantado. Cada cambio tiene su prueba, que sale en rojo sin él.</span></footer></main>\n';
  fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
  const html = cabeza + cuerpo;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, Math.round(Buffer.byteLength(html) / 1024) + ' KB');
})();
