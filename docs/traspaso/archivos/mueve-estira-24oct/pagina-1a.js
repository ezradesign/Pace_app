// Página para Ez: los textos de Mueve y Estira (1A), antes y después, con fotos de la app real.
// Uso: node pagina-1a.js <carpeta-de-fotos> <salida.html>. Las fotos las hace fotos-1a.js.
'use strict';
const fs = require('fs');
const path = require('path');
const [, , FOTOS, SALIDA] = process.argv;
const foto = (n) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(FOTOS, n + '.jpg')).toString('base64');
const fig = (n, pie, alt) => `<figure><img src="${foto(n)}" alt="${alt}" loading="lazy"><figcaption>${pie}</figcaption></figure>`;
const cuatro = (clave, alt) => `<div class="fotos">
  ${fig('antes-es-' + clave, 'Antes · español', alt + ', antes, en español')}
  ${fig('despues-es-' + clave, '<b>Después</b> · español', alt + ', después, en español')}
  ${fig('antes-en-' + clave, 'Antes · inglés', alt + ', antes, en inglés')}
  ${fig('despues-en-' + clave, '<b>Después</b> · inglés', alt + ', después, en inglés')}
</div>`;

const AVISOS = [
  ['Apertura de pecho', 'Sin «mira al techo»: manos tras la nuca sin tirar de la cabeza, cuello cómodo.'],
  ['Apertura con banda', 'Dice dónde va la banda (delante del pecho, brazos casi estirados) y que sin banda no es el mismo trabajo.'],
  ['Abrir y cerrar el puño', 'Sin apretar al máximo y abriendo despacio, 12 veces en vez de 20 a buen ritmo.'],
  ['Apretar glúteos', 'De forma moderada, sin contener el aire. Fuera «nadie tiene que notarlo».'],
  ['Elevación de talones', '«Hasta donde controles» en vez de «lo más alto que puedas».'],
  ['Elevación de puntas', 'Cómo apoyarte en la pared o en la mesa, y sin balancearte hacia atrás.'],
  ['Flexiones inclinadas · Pica', 'Mesa fija, ni con ruedas ni plegable; sin «llega a 12».'],
  ['Fondos en silla', 'Silla contra la pared; bajar hasta donde el hombro vaya cómodo, nunca más del ángulo recto.'],
  ['Silla en la pared', 'Empieza alto, sin buscar 90°, y cómo salir empujando con los pies.'],
  ['Cuello y trapecios · Inclinación de cuello', 'Inclinar con control, sin tirar con la mano ni subir el hombro.'],
  ['Escalenos', 'Ya no pide sentarse sobre la mano ni mirar arriba: si va cómodo.'],
  ['Encogimiento de hombros', 'Bájalos despacio, en vez de «déjalos caer».'],
  ['Círculos de tobillo', 'Del tamaño que puedas sin mover toda la pierna.'],
  ['Estiramiento de muñeca', 'Brazo al frente, codo sin bloquear, palma abajo y luego arriba.'],
  ['Extensión de dedos', 'Sin empujarlos hacia atrás con la otra mano.'],
  ['Palmas en la mesa · Rezo invertido', 'Cómo se apoya y cómo se mueve; fuera «cara interna».'],
  ['Extensión torácica', 'La cabeza no va atrás; si el respaldo cae en el cuello o la cintura, sin apoyarte.'],
  ['Apertura de pecho sentado', 'Sin agarrarte al respaldo ni arquear la cintura.'],
  ['Deslizamientos en pared', 'Si mantener los brazos pegados fuerza la postura, sepáralos un poco.'],
  ['Rotación externa', 'Sin resistencia: es para mover el hombro, no fuerza.'],
  ['Giro sentado', 'La mano acompaña en el respaldo, no tira.'],
  ['Rotación torácica de pie', 'Que no gire todo el cuerpo, sin bloquear la cadera a la fuerza.'],
  ['Gato-camello · Rodar hacia abajo', 'Sin «vértebra a vértebra»; en Rodar, puedes parar a medio camino.'],
  ['Onda espinal', 'Pequeña y lenta, el cuello sin latigazos.'],
  ['Flexor de cadera', 'Avanza la pelvis unos centímetros sin arquear; si la rodilla molesta, salta el paso.'],
  ['Cuádriceps en pared', 'Rodilla de atrás en el suelo y empeine en la pared, sin la silla como alternativa.'],
  ['Zancada con apertura', 'Qué mano apoya y qué brazo abre; mesa estable en vez de un libro; puedes mirar al frente.'],
  ['Paloma', 'Si notas la rodilla, sales de la postura; el cojín, si lo necesitas.'],
  ['90/90', 'Rodillas dobladas sin buscar el ángulo exacto, sin obligarlas a tocar el suelo.'],
  ['Puente con marcha', 'Si la pelvis se cae o la lumbar molesta, apoyas los dos pies o terminas.'],
  ['Isquio a una pierna', 'Talón en el suelo, con la rodilla estirada o un poco doblada.'],
  ['Pliegue adelante', 'Pies al ancho de las caderas, manos en los muslos o la mesa: no hace falta tocar el suelo.'],
  ['Sentadilla profunda · sostenida', 'Hasta donde vaya cómodo, sin empujar las rodillas con los codos; si los talones se levantan, baja menos.'],
  ['Sentadilla lateral', 'Qué rodilla se dobla y hacia dónde.'],
  ['Sentadilla a silla', 'Siéntate con control; rozar la silla queda para la segunda serie.'],
  ['Sentadilla búlgara · Zancada profunda', 'Dónde va el pie de delante; la rodilla puede pasar el pie, sin buscarlo.'],
  ['Sentarse y levantarse del suelo', 'Por una rodilla y de lado, con las manos y una silla si hace falta.'],
  ['Gateo', 'Rodillas en el suelo; si las muñecas molestan, para (sin pasar a los puños).'],
  ['Plancha · Plancha lateral', 'Cómo es la versión con rodillas, y codo bajo el hombro.'],
  ['Suspensión pasiva y activa', 'Entrar y salir apoyando los pies, sin soltar el agarre ni forzar los hombros atrás.'],
  ['Piernas elevadas sentado', 'Silla sin ruedas (no basta frenada) y, si la lumbar se despega, apoyar los pies.'],
];
const NO = [
  ['Barbilla atrás', 'ChatGPT pedía mantener 1-2 s. Se queda en 3-5 s, que es lo que dice nuestra base (control postural).'],
  ['Marcha del elefante, Onda espinal, Puente torácico y Sentadilla de cuádriceps', 'No se sabe bien qué son: salen de sus rutinas en la parte 2 (2A), hasta tener texto y dibujo claros.'],
  ['Juntar fichas repetidas y separar variantes', 'Es cambio de estructura, no de texto: va con las capas (2A).'],
];

const html = `<title>Mueve y Estira: los textos</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<style>
  /* Una columna de lectura con pares de fotos (antes · después) en rejilla de cuatro; la paleta de PACE. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --focus: #3E5A3A; --extra: #6B7A8F;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --extra: #95A4BA; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --extra: #95A4BA; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .banda { background: var(--focus); color: var(--paper); font: 500 12px/1.5 var(--ui); letter-spacing: .04em; text-align: center;
    padding-block: 10px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .marco { max-width: 980px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 8vw, 54px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(27px, 6vw, 34px); line-height: 1.1; margin-bottom: 10px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 40em; }
  .lede { font-size: 17.5px; }
  b { color: var(--ink); font-weight: 600; }
  section { margin-top: 40px; padding-top: 30px; border-top: 1px solid var(--line); }
  .fotos { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 16px 0 6px; }
  figure { margin: 0; min-width: 0; }
  figure img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { font: 500 11.5px/1.4 var(--ui); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); margin-top: 8px; }
  figcaption b { color: var(--cta); }
  .tarjetas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 16px 0 6px; max-width: 640px; }
  .tabla { overflow-x: auto; margin: 10px 0 14px; max-width: 100%; }
  table { border-collapse: collapse; font-size: 14.5px; min-width: 520px; width: 100%; }
  th { text-align: left; font: 600 11px/1.3 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); padding: 8px 10px 6px 0; border-bottom: 1px solid var(--line); }
  td { padding: 8px 10px 8px 0; border-bottom: 1px dashed var(--line); vertical-align: top; color: var(--ink-2); }
  td.nuevo { color: var(--ink); font-weight: 500; }
  td.ej { color: var(--ink); white-space: nowrap; }
  details { margin: 10px 0; border-top: 1px dashed var(--line); padding-top: 10px; }
  summary { cursor: pointer; font: italic 500 20px/1.3 var(--display); color: var(--ink); list-style: none; display: flex; gap: 12px; align-items: baseline; }
  summary::-webkit-details-marker { display: none; }
  summary::before { content: '+'; flex: 0 0 14px; font: 400 20px/1 var(--ui); color: var(--cta); }
  details[open] > summary::before { content: '–'; }
  summary:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; border-radius: 4px; }
  .nota { font-size: 14px; color: var(--ink-3); }
  @media (max-width: 640px) {
    .fotos { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    figcaption { font-size: 10.5px; }
  }
</style>

<div class="banda">Fotos de la app de verdad, a 360 px: v0.175.1 (antes) y v0.175.2 (después). Está en su rama; aún no en PACE.</div>
<main class="marco">
  <p class="kicker">PACE · Mueve y Estira · 1A</p>
  <h1>Los textos de Mueve y Estira</h1>
  <p class="lede">Lo que elegiste en la decisión 1: seis nombres que dicen lo que enseñan, cuatro ejercicios que van por veces y no por reloj, y los avisos de la revisión de las 63 fichas, en español y en inglés. No cambia qué rutinas hay ni ningún dibujo.</p>
  <p>Lo que tengas guardado en «Tus rutinas» con un nombre de antes sigue funcionando: se ve con el nombre de hoy, con su dibujo y su inglés.</p>

  <section>
    <h2>Círculos de brazos, 8 veces</h2>
    <p>«Círculos de hombro» eran círculos con el brazo estirado. Ahora se llaman así y van por vueltas: cuatro hacia delante y cuatro hacia atrás, en vez de 60 segundos.</p>
    ${cuatro('runner-circulos', 'Pantalla de ejercicio de Hombros · círculos')}
  </section>

  <section>
    <h2>Rotación lenta, 3 por lado</h2>
    <p>Es girar y volver, con dos segundos mirando al lado, en vez de 25 segundos quieto en cada lado. Igual pasa con la Rana (un balanceo de 8 veces, no 70 segundos quieta) y con los Círculos de muñeca (4 por sentido, despacio).</p>
    ${cuatro('runner-rotacion', 'Pantalla de ejercicio de Cuello, paso Rotación lenta')}
  </section>

  <section>
    <h2>Palmas en la mesa</h2>
    <p>Se hace de pie con las manos en la mesa, no en el suelo. En la misma rutina cambian también los textos de los círculos, el estiramiento de muñeca y el rezo invertido.</p>
    ${cuatro('hoja-munecas', 'Hoja de Muñecas y manos')}
  </section>

  <section>
    <h2>Piernas elevadas sentado</h2>
    <p>«Hueco en silla» era levantar las piernas sentado, no un hueco abdominal. Cambia el nombre en la rutina y la línea de la tarjeta de la biblioteca.</p>
    <div class="tarjetas">
      ${fig('antes-es-tarjeta-core', 'Antes · tarjeta', 'Tarjeta de Core silencioso, antes')}
      ${fig('despues-es-tarjeta-core', '<b>Después</b> · tarjeta', 'Tarjeta de Core silencioso, después')}
    </div>
    ${cuatro('hoja-core', 'Hoja de Core silencioso')}
  </section>

  <section>
    <h2>Los seis nombres</h2>
    <div class="tabla"><table>
      <thead><tr><th>Antes</th><th>Ahora</th><th>En inglés</th></tr></thead>
      <tbody>
        <tr><td>Círculos de hombro</td><td class="nuevo">Círculos de brazos</td><td>Arm circles</td></tr>
        <tr><td>Inclinación lateral</td><td class="nuevo">Inclinación de cuello</td><td>Neck tilt</td></tr>
        <tr><td>Hueco en silla</td><td class="nuevo">Piernas elevadas sentado</td><td>Seated leg raises</td></tr>
        <tr><td>Puente isquio a una pierna</td><td class="nuevo">Puente a una pierna</td><td>Single-leg bridge</td></tr>
        <tr><td>Palmas al suelo</td><td class="nuevo">Palmas en la mesa</td><td>Palms on the desk</td></tr>
        <tr><td>Apertura de costillas + respiración</td><td class="nuevo">Respirar a cuatro apoyos</td><td>Breathing on all fours</td></tr>
      </tbody>
    </table></div>

    <details><summary>Los avisos, uno por ejercicio (${AVISOS.length})</summary>
      <div class="tabla"><table><thead><tr><th>Ejercicio</th><th>Qué dice ahora</th></tr></thead><tbody>
        ${AVISOS.map(([e, t]) => `<tr><td class="ej">${e}</td><td>${t}</td></tr>`).join('\n        ')}
      </tbody></table></div>
      <p class="nota">Cada explicación cabe en 95 letras, como pide la pantalla de ejercicio, en los dos idiomas.</p>
    </details>

    <details><summary>Lo que no he puesto, y por qué (${NO.length})</summary>
      <div class="tabla"><table><thead><tr><th>Qué</th><th>Por qué</th></tr></thead><tbody>
        ${NO.map(([e, t]) => `<tr><td class="ej">${e}</td><td>${t}</td></tr>`).join('\n        ')}
      </tbody></table></div>
    </details>
  </section>

  <section>
    <h2>Lo que sigue</h2>
    <p>Las tres capas, los seis ejercicios nuevos y lo gratis (2A, 3A y 4A), en la misma rama, como v0.176.0. Te enseño sus fotos antes de juntar nada.</p>
  </section>
</main>
`;
fs.writeFileSync(SALIDA, html);
console.log(SALIDA, Math.round(html.length / 1024) + ' KB');
