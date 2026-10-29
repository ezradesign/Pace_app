// La página «Cinco dibujos nuevos» para Ez: cada dibujo junto al que sale hoy, en el runner a 360 y a
// 1280 px y en la tarjeta de la biblioteca, y el sombreado y el tamaño contra el resto del set.
// Uso: node pagina.js <carpeta-de-fotos> <salida.html>, tras sacar con fotos.js las de antes (sin
// ingesta) en <carpeta>/antes y las de ahora en <carpeta>/igualado. Las dos tiras de máscaras
// (<carpeta>/tiras/sombreado.png y tamano.png) son las máscaras pintadas sobre su círculo.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const sharp = require(R + '/node_modules/sharp');
const F = require('path').resolve(process.argv[2]) + '/';
const SALIDA = process.argv[3];
const AHORA = 'igualado/';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function img(archivo, ancho, alt, recorte) {
  let p = sharp(F + archivo + '.png');
  if (recorte) p = p.extract(recorte);
  const b = await p.resize({ width: ancho, withoutEnlargement: true }).webp({ quality: ancho > 600 ? 70 : 72 }).toBuffer();
  const meta = await sharp(b).metadata();
  return '<img src="data:image/webp;base64,' + b.toString('base64') + '" alt="' + esc(alt) + '" loading="lazy" width="' +
    meta.width + '" height="' + meta.height + '">';
}

const CASOS = [
  {
    s: 'bisagra-de-cadera', nombre: 'Bisagra de cadera', donde: 'Mueve · Piernas · a una · paso 1 de 7',
    hoy: 'la pesa de Mueve', tarjeta: 'Es el primer paso, así que en la tarjeta sale grande, a la izquierda.',
    texto: 'Cadera atrás, espalda larga y rodillas un poco dobladas, con las manos en la cadera. La flecha de puntos lleva la cadera hacia atrás.',
    vecino: ['zancada-profunda', 'Zancada profunda', 'el paso 5 de su misma rutina'],
  },
  {
    s: 'gemelo-en-pared', nombre: 'Gemelo en pared', donde: 'Estira · Cadena posterior · paso 3 de 3',
    hoy: 'el dibujo de Estira', tarjeta: 'En la tarjeta sale en la tira pequeña de abajo, el último.',
    texto: 'Las dos manos en la pared, la rodilla de delante doblada y la pierna de atrás estirada, con el talón en el suelo.',
    vecino: ['cuadriceps-en-pared', 'Cuádriceps en pared', 'otro de pared de Estira'],
  },
  {
    s: 'piernas-elevadas-sentado', nombre: 'Piernas elevadas sentado', donde: 'Mueve · Core silencioso · pasos 1, 3 y 5',
    hoy: 'el dibujo que marcaste el 23 de octubre porque no casaba', tarjeta: 'Es el primer paso, así que en la tarjeta sale grande, a la izquierda.',
    texto: 'Sentado al fondo de la silla, la espalda en el respaldo y las manos en el asiento, con las rodillas dobladas y los pies en el aire.',
    vecino: ['fondos-en-silla', 'Fondos en silla', 'otro con silla de Mueve'],
  },
  {
    s: 'desliza-el-talon', nombre: 'Desliza el talón', donde: 'Mueve · Fuerza en suelo · paso 4 de 5',
    hoy: 'la pesa de Mueve', tarjeta: 'En la tarjeta sale en la tira pequeña de abajo.',
    texto: 'Boca arriba, una rodilla doblada con el pie en el suelo y la otra pierna deslizada por el suelo. En el dibujo la pierna llega del todo estirada, aunque el paso dice que no hace falta estirarla del todo.',
    vecino: ['hueco-abdominal', 'Hueco abdominal', 'otro tumbado de Mueve, en «Core»'],
  },
  {
    s: 'remo-con-banda', nombre: 'Remo con banda', donde: 'Mueve · Espalda con banda · paso 3 de 5',
    hoy: 'la pesa de Mueve', tarjeta: 'En la tarjeta sale en la tira pequeña de abajo.',
    texto: 'Es el que pasaste por el chat. La banda pasa bajo los dos pies y sube a las manos, los codos van hacia atrás y la flecha de puntos apunta atrás, lejos de la cara.',
    vecino: ['apertura-con-banda', 'Apertura con banda', 'el paso 1 de su misma rutina'],
  },
];

(async () => {
  let vistazo = '';
  let secciones = '';
  for (const c of CASOS) {
    vistazo += '<figure>' + await img(AHORA + c.s + '_runner_360', 220, c.nombre + ', el dibujo nuevo en el círculo del runner',
      { left: 130, top: 130, width: 460, height: 460 }) + '<figcaption>' + c.nombre + '</figcaption></figure>';
    const par = async (vista, ancho, que) => '<div class="vista"><p class="etq">' + que + '</p><div class="dos ' + vista + '">' +
      '<figure>' + await img('antes/' + c.s + '_' + vista, ancho, c.nombre + ', hoy, ' + que.toLowerCase()) + '<figcaption>Hoy</figcaption></figure>' +
      '<figure>' + await img(AHORA + c.s + '_' + vista, ancho, c.nombre + ', con el dibujo nuevo, ' + que.toLowerCase()) + '<figcaption>Con el dibujo nuevo</figcaption></figure>' +
      '</div></div>';
    secciones += '<section class="caso" id="' + c.s + '">' +
      '<span class="num-caso">' + c.donde + '</span><h2>' + c.nombre + '</h2>' +
      '<p>' + c.texto + ' Hoy sale ' + c.hoy + '. ' + c.tarjeta + '</p>' +
      (c.duda ? '<div class="duda"><p class="otit">' + c.duda[0] + '</p><p>' + c.duda[1] + '</p></div>' : '') +
      await par('runner_360', 400, 'En el móvil') +
      await par('runner_1280', 820, 'En el ordenador') +
      await par('tarjeta_360', 420, 'En la biblioteca') +
      '</section>';
  }
  const tiraSombreado = await img('tiras/sombreado', 1000, 'Los cinco dibujos en tres filas: como estaban, con el sombreado igualado y, debajo, la pieza vecina que ya está en la app');
  const tiraTamano = await img('tiras/tamano', 900, 'Gemelo en pared tal como queda, con la pared recortada, y al lado Cuádriceps en pared y Zancada profunda');
  /* Cada nuevo al lado de una pieza que ya está, en la app: lo que pidió la coordinadora para que Ez juzgue
     sombreado, contorno y tamaño en su sitio y no solo en la tira. */
  let juntos = '';
  for (const c of CASOS) {
    const [vs, vn, por] = c.vecino;
    const par = async (vista, ancho, que) => '<div class="vista"><p class="etq">' + que + '</p><div class="dos ' + vista + '">' +
      '<figure>' + await img(AHORA + c.s + '_' + vista, ancho, c.nombre + ', ' + que.toLowerCase()) + '<figcaption>' + c.nombre + ' (nuevo)</figcaption></figure>' +
      '<figure>' + await img('vecinos/' + vs + '_' + vista, ancho, vn + ', ' + que.toLowerCase()) + '<figcaption>' + vn + '</figcaption></figure>' +
      '</div></div>';
    juntos += '<div class="junto"><h3>' + c.nombre + ' y ' + vn + '</h3><p class="nota">' + vn + ' es ' + por + '.</p>' +
      await par('runner_360', 400, 'En el móvil') + await par('runner_1280', 760, 'En el ordenador') + '</div>';
  }

  const html = `<title>Cinco dibujos nuevos</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · los cinco dibujos de ejercicio que la coordinadora revisó el 29 oct. 2026, en la app de la rama
     claude/elegant-pascal-d54e40, junto a lo que sale hoy. Guiones en docs/traspaso/archivos/dibujos-29oct/. -->
<style>
  /* Una columna de lectura; en cada ejercicio, tres vistas con «Hoy» a la izquierda y el dibujo nuevo a la derecha. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --duda-bg: #EFE6D6;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --duda-bg: #2c261c; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --duda-bg: #2c261c; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .marco { max-width: 1040px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 8vw, 54px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(28px, 6vw, 34px); line-height: 1.1; margin-bottom: 12px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  b { color: var(--ink); font-weight: 600; }
  figure { margin: 0; min-width: 0; }
  img { display: block; max-width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { font-size: 14px; color: var(--ink-3); margin-top: 6px; }
  .vistazo { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 14px; margin: 24px 0 8px; }
  .vistazo img { border-radius: 50%; width: 100%; max-width: 190px; }
  .resumen { margin: 26px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 16px 18px 6px; max-width: 46em; }
  section.caso { margin-top: 44px; padding-top: 32px; border-top: 1px solid var(--line); }
  .num-caso { font: italic 500 17px/1.3 var(--display); color: var(--cta); display: block; margin-bottom: 6px; }
  .vista { margin-top: 22px; }
  .etq { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 8px; }
  .dos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: start; }
  .dos.runner_360 { max-width: 480px; }
  .dos.tarjeta_360 { max-width: 660px; }
  .duda { margin: 18px 0 6px; padding: 14px 16px 4px; border-radius: 12px; background: var(--duda-bg); max-width: 46em; }
  .duda p { margin: 0 0 10px; }
  .otit { color: var(--ink) !important; font-weight: 600; }
  .nota { font-size: 14px; color: var(--ink-3); }
  .junto { margin-top: 30px; }
  h3 { font: italic 500 24px/1.2 var(--display); margin: 0 0 4px; text-wrap: balance; }
  .tira { margin: 18px 0 6px; }
  .tira img { border: 0; background: none; border-radius: 0; width: 100%; }
  .filas { list-style: none; padding: 0; margin: 10px 0 0; display: grid; gap: 4px; font-size: 14px; color: var(--ink-3); }
  .opciones { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 10px; max-width: 46em; }
  .opciones li { border: 1px solid var(--line); border-radius: 12px; padding: 12px 16px; }
  .opciones li.reco { border-color: var(--cta); }
  .opciones .que { display: block; font: italic 500 20px/1.3 var(--display); color: var(--ink); margin-bottom: 4px; }
  .opciones .reco .que::after { content: " · recomendada"; font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--cta); }
  .opciones p { margin: 0; }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; font: 13px/1.5 ui-monospace, Menlo, Consolas, monospace; color: var(--ink-2);
    background: var(--paper-2); border-radius: 10px; padding: 12px 14px; margin: 10px 0 0; max-width: 46em; }
</style>
<div class="marco">
  <p class="kicker">Dibujos de ejercicio · 29 oct. 2026 · antes de juntar</p>
  <h1>Cinco dibujos nuevos</h1>
  <p>Los cinco que revisó la coordinadora contra el paso de cada ejercicio, ya metidos en la app de mi rama y con el sombreado igualado al del resto. Las fotos de cada ejercicio son de la app de verdad, sin nada pintado encima: en el móvil (360 px), en el ordenador (1280 px) y en la tarjeta de la biblioteca. A la izquierda, lo que sale hoy.</p>
  <div class="vistazo">${vistazo}</div>
  <div class="resumen">
    <p class="kicker" style="margin-top:2px">Lo que necesito de ti</p>
    <p><b>1.</b> Un sí a los cinco con el sombreado igualado (lo de abajo). Con él pruebo la app entera y subo la rama, sin juntar. La coordinadora la junta cuando digas «júntalo», después del runner y de «Tus rutinas».</p>
    <p><b>2.</b> Qué hacemos con el tamaño de «Gemelo en pared»: recomiendo meter este y pedir otro más recogido.</p>
    <p class="nota">Si alguno no te convence, dime cuál y se queda fuera de esta tanda.</p>
  </div>

  <section class="caso" id="sombreado">
    <span class="num-caso">Lo que pediste · ya en la app</span>
    <h2>El sombreado, como el del resto</h2>
    <p>Los dibujos de antes llevan una zona rayada en el músculo que trabaja: el muslo en «Cuádriceps en pared», el glúteo en «Sentadilla a silla». En los nuevos ese rayado es más claro, y al pasarlos a la app se borraba con la mancha roja: perdían entre el 7 % y el 20 % de su tinta y salían más lavados. Ahora se queda, solo en estos cinco. El contorno ya pesaba como el de los demás y no lo he tocado.</p>
    <div class="tira">${tiraSombreado}</div>
    <ul class="filas"><li>Arriba, como estaban en la versión anterior de esta página.</li><li>En medio, como quedan ahora.</li><li>Abajo, la pieza vecina que ya está en la app: Zancada profunda, Cuádriceps en pared, Fondos en silla, Hueco abdominal y Apertura con banda.</li></ul>
  </section>

  <section class="caso" id="tamano">
    <span class="num-caso">Lo que pediste · necesita otro dibujo</span>
    <h2>El tamaño de «Gemelo en pared»</h2>
    <p>Tienes razón: el muñeco sale pequeño. Su cabeza mide dos tercios de la de «Cuádriceps en pared» o «Zancada profunda». La app hace que cada dibujo llene el círculo hasta su punto más lejano, y en este el cuerpo va en diagonal, del talón de atrás a las manos en la pared: para que quepa entero, se encoge. Lo más que se saca sin cambiar el dibujo es un 4 %, recortando la pared por encima de las manos (segundo círculo), y no se nota.</p>
    <div class="tira">${tiraTamano}</div>
    <ul class="filas"><li>De izquierda a derecha: como queda, con la pared recortada, Cuádriceps en pared y Zancada profunda.</li></ul>
    <ul class="opciones">
      <li class="reco"><span class="que">Meter este y pedir otro más recogido</span><p>Entra este, con el sombreado igualado, y en Genspark se pide otro con los pies más juntos, el cuerpo menos inclinado y la pared solo hasta las manos. Cuando llegue, se cambia sin tocar nada más.</p></li>
      <li><span class="que">Dejar este</span><p>Se queda tal cual. Es tan pequeño como «Plancha» o «Flexiones inclinadas», que también van en diagonal.</p></li>
    </ul>
    <p class="nota" style="margin-top:14px">El prompt para el nuevo, detrás del preámbulo de siempre:</p>
    <pre>A wall calf stretch, in profile facing right, close to a wall drawn as one thin vertical line that rises from the floor only to just above the hands. Compact pose that fits a tall narrow frame, never a long diagonal: short stance, the back foot about one shin-length behind the front foot, the back leg straight with the back heel flat on the floor, the front knee bent over the front foot, the trunk only slightly inclined toward the wall, both hands on the wall at shoulder height with the elbows slightly bent. The figure fills most of the height of the frame.</pre>
    <p class="nota" style="margin-top:14px">Los otros cuatro van a la escala de sus vecinos. «Desliza el talón», tumbado de punta a punta, sale como «Hueco abdominal» o «Plancha».</p>
  </section>

  <section class="caso" id="juntos">
    <span class="num-caso">En la app</span>
    <h2>Junto a los que ya hay</h2>
    <p>Cada uno de los cinco al lado de una pieza que ya está en la app, de su misma rutina o de su módulo, en el mismo momento del paso. Así se ven el sombreado, el contorno y el tamaño en su sitio.</p>
    ${juntos}
  </section>
  ${secciones}
  <section class="caso">
    <span class="num-caso">Lo que no entra</span>
    <h2>Tres que se repiten</h2>
    <p><b>Remo con banda</b> (el primero que llegó): la banda parece un palo que acaba en el talón. <b>Rana</b>: las rodillas más abiertas de lo que pide el paso, y sin flecha. <b>Pica en escritorio</b>: la mesa queda a la altura de un escalón, no de la cadera. Con estos cinco quedan 11 dibujos de ejercicio por hacer.</p>
  </section>
</div>
`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, Math.round(html.length / 1024) + ' KB');
})();
