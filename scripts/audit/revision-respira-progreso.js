/* HOJA DE REVISION s165 · «cuanto queda» en Respira
 * =================================================
 * Genera `_revision-respira-progreso.html` (ignorado por git) con el censo de
 * ritmos, los hallazgos y las 18 capturas del banco de variantes. Mismo patron
 * que `revision-glifos.js` (s147): la decision se toma MIRANDO, y lo que se
 * mira son capturas de la app real, no maquetas.
 *
 * Uso:  node revision-respira-progreso.js <repo> <dir-capturas>
 */
'use strict';

const fs = require('fs');
const path = require('path');
const REPO = process.argv[2] || process.cwd();
const CAPS = process.argv[3];
const sharp = require(require.resolve('sharp', { paths: [REPO] }));

/* Censo medido por censo-respira-ritmos.js sobre la app (no copiado del codigo). */
const CENSO = [
  ['Rondas express', 'rounds', 4, 4, '2 rondas x 25', 2, 2, 'NUNCA'],
  ['Respiracion en rondas', 'rounds', 12, 4, '3 rondas x 30', 2, 2, 'NUNCA'],
  ['Rondas profundas', 'rounds', 20, 4, '5 rondas x 35', 2, 2, 'NUNCA'],
  ['Box 4·4·4·4', 'box', 5, 16, '18,8', 4, 4, 'siempre'],
  ['Box 6·6·6·6', 'box', 7, 24, '17,5', 6, 6, 'siempre'],
  ['Diafragmatica', 'diaphragm', 5, 8, '37,5', 4, 4, 'siempre'],
  ['Tolerancia CO₂', 'co2', 6, 20, '18', 4, 10, 'siempre'],
  ['Coherente 5·5', 'coherent', 5, 10, '30', 5, 5, 'siempre'],
  ['Coherente 6·6', 'coherent', 10, 12, '50', 6, 6, 'siempre'],
  ['Coherente 432', 'coherent', 10, 12, '50', 6, 6, 'siempre'],
  ['4·7·8', 'pattern', 3, 19, '9,5', 4, 8, 'siempre'],
  ['Suspiro fisiologico', 'physiological', 2, 8, '15', 1, 5, 'a veces'],
  ['Exhalacion 4·6', 'coherent', 6, 10, '36', 4, 6, 'siempre'],
  ['Ritmica yin', 'yin', 8, 10, '48', 2, 5, 'a veces'],
  ['Ujjayi', 'ujjayi', 6, 10, '36', 5, 5, 'siempre'],
  ['Bhramari · Abeja', 'bhramari', 5, 12, '25', 4, 8, 'siempre'],
  ['Bhastrika · Fuelle', 'bhastrika', 3, 2, '90', 1, 1, 'NUNCA'],
  ['Nadi Shodhana', 'nadi', 8, 20, '24', 2, 4, 'a veces'],
  ['Kapalabhati · Kriya', 'kapalabhati', 3, 2, '90', 1, 1, 'NUNCA'],
  ['Kumbhaka 1:4:2', 'pattern', 6, 28, '12,9', 4, 16, 'siempre'],
];

const OPCIONES_TIEMPO = [
  ['T0', 'Hoy · 19 segmentos', 'Un segmento por ciclo, con tope de 24.',
   'Los trazos miden 11 px y se leen como una linea de puntos. En 10 de las 17 el tope agrupa varios ciclos, asi que el segmento ya no es «un ciclo».'],
  ['T1', 'Barra continua', 'Tiempo activo sobre el objetivo. Empieza en 0 y llega a 1 cuando la sesion acaba.',
   'Es un widget de progreso: si lo miras, mides. Es la forma mas legible y tambien la mas «interfaz».'],
  ['T4', 'Barra fina, sin carril', 'Lo mismo, 2 px y sin el fondo gris: solo se ve lo andado.',
   'Al perder el carril se pierde la referencia de cuanto falta; dice «llevas esto», no «queda esto».'],
  ['T2', 'Hairline a sangre', 'Una linea de 2 px pegada al borde inferior, de lado a lado.',
   'Maxima perifericidad: orienta de reojo y no pide ser mirada. En movil roza el area del gesto de sistema.'],
  ['T3', 'Sin indicador', 'La sesion no dice cuanto queda. Solo la fase y su cuenta atras.',
   'Es lo mas fiel al criterio de s139, y deja sin respuesta la unica pregunta legitima: «¿cuanto falta?».'],
  ['T5', 'Aro de sesion', 'El progreso sobre el hairline exterior del loto.',
   'Es exactamente lo que descartaste en s139 por «medir». Ademas compite con el visual, que ya se mueve con la respiracion.'],
];

const OPCIONES_RONDAS = [
  ['R0', 'Hoy · barra de 2 segmentos + cabecera + texto', 'Un segmento por ronda, y el activo se rellena con las respiraciones.',
   'Los mismos dos numeros dichos tres veces. Y el relleno va una respiracion por delante: en «25 de 25» ya marca 100 % con la retencion aun por delante.'],
  ['R2', 'Puntos junto al texto, con cabecera', 'Puntos = rondas · texto = respiraciones. La cabecera repite la ronda.',
   'Dos sitios dicen la ronda. En la retencion, donde el centro no lleva texto, la repeticion se nota mas.'],
  ['R1', 'Puntos junto al texto, sin cabecera', 'Un solo sitio para todo: acento = ronda alcanzada, tamaño = ronda en curso.',
   'La cabecera se queda con el nombre de la rutina. Contar cinco puntos es inmediato; contar mas, no.'],
  ['R3', 'Segmentos estilo Mueve', 'La forma de barra que ya conoces, con el bloque en curso mas alto y sin relleno por respiraciones.',
   'Conserva la barra donde el usuario la espera y separa los trabajos. Con 2 rondas la barra ocupa 260 px para decir «una de dos».'],
  ['R4', 'Sin indicador de sesion', 'Solo la cabecera y el contador de respiraciones.',
   'Las dos cifras siguen dichas una vez cada una. No hay dibujo del avance entre rondas.'],
  ['R5', 'Aro de sesion', 'El avance de la sesion sobre el hairline del loto.',
   'Choca con s139 igual que en la familia por tiempo, y aqui ademas mezcla rondas y respiraciones en un solo trazo continuo.'],
];

async function img(nombre) {
  const p = path.join(CAPS, nombre + '.png');
  if (!fs.existsSync(p)) return null;
  const buf = await sharp(p).resize({ width: 1000 }).webp({ quality: 82 }).toBuffer();
  return 'data:image/webp;base64,' + buf.toString('base64');
}

async function tarjetas(prefijo, opciones, pie) {
  let h = '';
  for (const [id, titulo, dice, ojo] of opciones) {
    const src = await img(prefijo + '-' + id);
    h += '<figure class="op">'
      + (src ? '<img src="' + src + '" alt="' + titulo + '">' : '<div class="falta">sin captura</div>')
      + '<figcaption><b>' + id + ' · ' + titulo + '</b>'
      + '<span class="dice">' + dice + '</span>'
      + '<span class="ojo">' + ojo + '</span></figcaption></figure>';
  }
  return '<div class="grid">' + h + '</div>' + (pie ? '<p class="pie">' + pie + '</p>' : '');
}

(async () => {
  const filas = CENSO.map(f => '<tr><td>' + f[0] + '</td><td class="m">' + f[1] + '</td><td class="n">' + f[2]
    + '</td><td class="n">' + f[3] + '</td><td class="n">' + f[4] + '</td><td class="n">' + f[5]
    + '</td><td class="n">' + f[6] + '</td><td class="' + (f[7] === 'NUNCA' ? 'mal' : 'm') + '">' + f[7] + '</td></tr>').join('');

  const html = '<!doctype html><html lang="es"><head><meta charset="utf-8">'
    + '<title>Respira · cuanto queda</title><style>'
    + 'body{margin:0;padding:48px 40px 80px;background:#F2EDE0;color:#2A2620;'
    + 'font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:1180px;margin:0 auto}'
    + 'h1{font:italic 500 40px/1.1 Georgia,serif;margin:0 0 6px}'
    + 'h2{font:italic 500 27px/1.2 Georgia,serif;margin:56px 0 6px;border-top:1px solid #D8CFBC;padding-top:26px}'
    + 'h3{font:600 11px/1.4 sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#8A7F6B;margin:34px 0 10px}'
    + '.sub{color:#6B6355;margin:0 0 8px}'
    + 'table{border-collapse:collapse;width:100%;font-size:13px;margin:10px 0 4px}'
    + 'th{text-align:left;font:600 10px/1.4 sans-serif;letter-spacing:.14em;text-transform:uppercase;'
    + 'color:#8A7F6B;border-bottom:1px solid #D8CFBC;padding:6px 8px}'
    + 'td{padding:5px 8px;border-bottom:1px solid #E6DFCF}'
    + 'td.n{text-align:right;font-variant-numeric:tabular-nums}td.m{color:#6B6355}'
    + 'td.mal{color:#C0572F;font-weight:600}'
    + '.grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:14px}'
    + '.op{margin:0;background:#FBF8F0;border:1px solid #E6DFCF;border-radius:8px;overflow:hidden}'
    + '.op img{width:100%;display:block}'
    + 'figcaption{padding:12px 14px 16px;display:block}'
    + 'figcaption b{display:block;font-size:14px;margin-bottom:5px}'
    + 'figcaption .dice{display:block;font-size:13px;color:#4A443A}'
    + 'figcaption .ojo{display:block;font-size:12.5px;color:#8A6A4A;margin-top:6px;'
    + 'border-left:2px solid #D8C4A8;padding-left:9px}'
    + '.pie{font-size:13px;color:#6B6355;margin-top:14px}'
    + 'blockquote{margin:14px 0;padding:12px 18px;border-left:3px solid #C0572F;background:#FBF8F0;'
    + 'font-size:14px;color:#4A443A}'
    + 'ul{margin:8px 0 0;padding-left:20px}li{margin-bottom:9px}'
    + 'code{background:#E9E2D2;padding:1px 5px;border-radius:3px;font-size:12.5px}'
    + '.rec{background:#FBF8F0;border:1px solid #D8CFBC;border-radius:8px;padding:20px 24px;margin-top:16px}'
    + '@media(max-width:900px){.grid{grid-template-columns:1fr}}'
    + '</style></head><body>'

    + '<h1>Respira · cómo se dice «cuánto queda»</h1>'
    + '<p class="sub">s165 · las <b>20 rutinas medidas</b> y <b>18 capturas sobre la app real</b>, no maquetas: '
    + 'la sesión se conduce de verdad y solo se sustituye el indicador. Todo lo demás —papel, atmósfera, loto, '
    + 'tipografía, tokens— es el de la app.</p>'

    + '<h2>1 · Qué hay que dibujar</h2>'
    + '<p class="sub">Medido preguntando a <code>getSequence()</code>, la misma función que usa la sesión.</p>'
    + '<table><thead><tr><th>rutina</th><th>patrón</th><th>min</th><th>ciclo (s)</th><th>ciclos</th>'
    + '<th>fase −</th><th>fase +</th><th>cuenta atrás</th></tr></thead><tbody>' + filas + '</tbody></table>'
    + '<h3>Y salen tres familias de ritmo, no dos</h3><ul>'
    + '<li><b>Por bloques · 3 rutinas.</b> Rondas. Terminan cuando se acaban las rondas, y su duración es '
    + '<b>indeterminada</b>: la retención no tiene duración fijada (B1). Sus 4 / 12 / 20 min son <b>nominales</b>.</li>'
    + '<li><b>Por tiempo · 15 rutinas.</b> Ciclos de 8 a 28 s. Terminan por reloj.</li>'
    + '<li><b>Bombeo · 2 rutinas.</b> Bhastrika y Kapalabhati: fases de <b>1 s</b>, 90 ciclos en 3 min. '
    + 'La respiración individual no es un hito de nada.</li></ul>'

    + '<h2>2 · Tres cosas que el censo corrige</h2><ul>'
    + '<li><b>El hueco muerto de la cuenta atrás es de 5 rutinas, no de 3.</b> El diagnóstico de s164 contó las '
    + 'de rondas; Bhastrika y Kapalabhati tienen fases de 1 s, así que tampoco la enseñan nunca y también '
    + 'reservan 32 px para nada.</li>'
    + '<li><b>Una barra de TIEMPO mentiría en las rondas.</b> No terminan por reloj. Poner ahí la misma barra que '
    + 'en Box significa dibujar una duración que la app no conoce.</li>'
    + '<li><b>«Un segmento por ciclo» no era exacto en ninguna de las cinco</b> donde los ciclos no caen redondos '
    + '(18,8 · 17,5 · 37,5 · 9,5 · 12,9), y en <b>10 de las 17</b> el tope de 24 agrupa varios ciclos por segmento.</li>'
    + '</ul>'

    + '<h2>3 · El listón no es informar: es no distraer</h2>'
    + '<p class="sub">Esto no es criterio mío, es tuyo, y está escrito. s139 · A4:</p>'
    + '<blockquote>«Descartó marcas y enso, y con un criterio que conviene anotar: los dos <b>miden</b> —las marcas '
    + 'son una escala graduada, el enso tiene principio y fin y lee como arco de progreso— y en una guía de '
    + 'respiración eso invita a mirar la medida en vez de a respirar. Es el mismo criterio por el que s107 sacó '
    + 'el cronómetro de la retención.»</blockquote>'
    + '<p>Con ese listón, la pregunta deja de ser «cuál informa mejor» y pasa a ser <b>cuál es el más periférico '
    + 'que todavía orienta</b>. Por eso abajo van también las dos opciones que hasta ahora no estábamos mirando: '
    + '<b>ningún indicador</b> y <b>la línea a sangre</b>. Y va el <b>aro</b>, que choca de frente con esa '
    + 'decisión, para que lo veas en su sitio y decidas si el caso la cambia.</p>'

    + '<h2>4 · Familia por tiempo · 15 + 2 rutinas</h2>'
    + '<p class="sub">Espécimen: <b>Box 4·4·4·4</b>, a los 90 s de 300 (30 % de la sesión).</p>'
    + await tarjetas('tiempo', OPCIONES_TIEMPO,
        'Las dos de bombeo (Bhastrika, Kapalabhati) viven en esta familia y son su caso extremo: 90 ciclos en 3 min.')

    + '<h2>5 · Familia por bloques · 2 rondas</h2>'
    + '<p class="sub">Espécimen: <b>Rondas express</b>, en la <b>ronda 2 de 2</b> — hay una ronda hecha, una en curso '
    + 'y la respiración 9 de 25. En la ronda 1 no hay nada completado y la mitad de las opciones se vería vacía.</p>'
    + await tarjetas('rondas2', OPCIONES_RONDAS)

    + '<h2>6 · Familia por bloques · 5 rondas</h2>'
    + '<p class="sub">Espécimen: <b>Rondas profundas</b>, ronda 2 de 5. Es donde se ve si cada forma <b>escala</b>.</p>'
    + await tarjetas('rondas5', OPCIONES_RONDAS)

    + '<h2>7 · Lo que recomiendo, y por qué</h2>'
    + '<div class="rec"><ul>'
    + '<li><b>Por tiempo: T1, la barra continua.</b> Es la que ya elegiste y el censo la respalda: 15 rutinas que '
    + 'terminan por reloj, con los ciclos sin caer redondos en cinco de ellas. Si quieres bajar el peso de '
    + '«interfaz» sin perder la referencia, <b>T2</b> (a sangre) es la única que orienta sin pedir ser mirada — '
    + 'y es la que mejor cumple el criterio de s139.</li>'
    + '<li><b>Por bloques: R1 o R3</b>, y la diferencia es de gusto, no de honestidad: las dos separan «rondas» de '
    + '«respiraciones». <b>R1</b> (puntos) es más callada y escala mejor a 5; <b>R3</b> conserva la forma de barra '
    + 'que te gusta en Box. <b>R0 no la recomiendo</b>: no es cuestión de estilo, es que su relleno va una '
    + 'respiración por delante y en la última ronda dice «terminado» antes de la retención.</li>'
    + '<li><b>El aro (T5 / R5) lo desaconsejo</b>, pero está aquí porque me pediste verlo: es el enso que '
    + 'descartaste, ahora encima de un visual que ya se mueve con la respiración.</li>'
    + '<li><b>La retención se queda como está</b> (decidido hoy) y su tiempo se medirá en la sesión siguiente: '
    + 'total acumulado, invisible durante la práctica, sin récord ni logro.</li>'
    + '</ul></div>'

    + '</body></html>';

  const destino = path.join(REPO, '_revision-respira-progreso.html');
  fs.writeFileSync(destino, html);
  console.log('hoja: ' + destino + '  (' + Math.round(html.length / 1024) + ' KB)');
})().catch(e => { console.error('HOJA ROTA:', e.message); process.exit(1); });
