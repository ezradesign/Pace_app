// La página «Catorce dibujos nuevos» para Ez: el set entero en una tira, los que se salen, el sombreado antes y
// ahora, y cada dibujo nuevo junto a un vecino en el runner, a 360 y a 1280 px.
// Uso: node pagina.js <carpeta-de-fotos> <salida.html> [--ligera]. Antes: fotos.js <carpeta>/blanqueado y
// fotos.js <carpeta>/vecinos vecinos; y tira.js para <carpeta>/tiras/set.png, sombreado-29.png y se-salen.png.
// La ligera lleva solo el círculo del móvil de cada dibujo, para el visor de Ez, que no abre más de 512 KB.
'use strict';
const fs = require('fs');
const path = require('path');
const W = path.resolve(__dirname, '..', '..', '..', '..');
const sharp = require(W + '/node_modules/sharp');
const { referencia, medirArchivo, DESTINO } = require(W + '/scripts/glifos/medir-trazo.js');
const F = path.resolve(process.argv[2]) + '/';
const SALIDA = process.argv[3];
const LIGERA = process.argv.includes('--ligera');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function img(archivo, ancho, alt, recorte, clase) {
  let p = sharp(F + archivo + '.png');
  if (recorte) p = p.extract(recorte);
  const b = await p.resize({ width: ancho, withoutEnlargement: true }).webp({ quality: ancho > 600 ? 68 : 72 }).toBuffer();
  const meta = await sharp(b).metadata();
  return '<img' + (clase ? ' class="' + clase + '"' : '') + ' src="data:image/webp;base64,' + b.toString('base64') + '" alt="' + esc(alt) +
    '" loading="lazy" width="' + meta.width + '" height="' + meta.height + '">';
}
/* El círculo del runner en la foto del móvil (720 × 1480 a DPR 2). */
const CIRCULO_360 = { left: 130, top: 130, width: 460, height: 460 };

const CASOS = [
  { s: 'piernas-elevadas-sentado', nombre: 'Piernas elevadas sentado', donde: 'Mueve · Core silencioso · pasos 1, 3 y 5',
    texto: 'Es la versión que rehiciste, con el rayado más claro, y con el rojo blanqueado que elegiste.', vecino: ['fondos-en-silla', 'Fondos en silla', 'otro con silla de Mueve'] },
  { s: 'bisagra-de-cadera', nombre: 'Bisagra de cadera', donde: 'Mueve · Piernas · a una · paso 1 de 7',
    texto: 'Cadera atrás, espalda larga y rodillas un poco dobladas, con la flecha hacia atrás.', vecino: ['zancada-profunda', 'Zancada profunda', 'de su misma rutina'] },
  { s: 'gemelo-en-pared', nombre: 'Gemelo en pared', donde: 'Estira · Cadena posterior · paso 3 de 3',
    texto: 'El más recogido que pediste: los pies más juntos y el cuerpo menos inclinado. Ya sale a la escala de sus vecinos, no a dos tercios.', vecino: ['cuadriceps-en-pared', 'Cuádriceps en pared', 'otro de pared de Estira'] },
  { s: 'desliza-el-talon', nombre: 'Desliza el talón', donde: 'Mueve · Fuerza en suelo · paso 4 de 5',
    texto: 'Boca arriba, una rodilla doblada y la otra pierna deslizada por el suelo.', vecino: ['hueco-abdominal', 'Hueco abdominal', 'otro tumbado de Mueve'] },
  { s: 'remo-con-banda', nombre: 'Remo con banda', donde: 'Mueve · Espalda con banda · paso 3 de 5',
    texto: 'La banda bajo los dos pies, los codos atrás y la flecha lejos de la cara.', vecino: ['apertura-con-banda', 'Apertura con banda', 'de su misma rutina'] },
  { s: '90-90', nombre: '90/90', donde: 'Estira · Caderas, Estiramiento del sofá y Caderas · suelo',
    texto: 'Sustituye al que se veía raro y se confundía con «Paloma»: de frente, el tronco erguido y las dos piernas en ángulo.', vecino: ['paloma', 'Paloma', 'el paso siguiente de «Caderas»'] },
  { s: 'rotacion-toracica-de-pie', nombre: 'Rotación torácica de pie', donde: 'Estira · Espalda de pie · paso 2 de 5',
    texto: 'De frente, las manos cruzadas sobre el pecho y el arco de la rotación. Hasta hoy salía el glifo por defecto.', vecino: ['juntar-omoplatos', 'Juntar omóplatos', 'de su misma rutina'] },
  { s: 'inclinacion-de-tronco', nombre: 'Inclinación de tronco', donde: 'Estira · Columna · ondas · paso 3 de 4',
    texto: 'De frente, el tronco hacia un lado y la mano bajando por el muslo. Hasta hoy llevaba el glifo de Estira.', vecino: ['rotacion-toracica', 'Rotación torácica', 'el paso anterior de su rutina'] },
  { s: 'gato-camello', nombre: 'Gato-camello', donde: 'Estira · Columna · ondas · paso 1 de 4, y Movilidad en suelo',
    texto: 'Sustituye al que marcaste porque podía mejorar mucho: a cuatro apoyos, la espalda redonda hacia arriba y la cabeza suelta.', vecino: ['rotacion-toracica', 'Rotación torácica', 'el paso siguiente de su rutina'] },
  { s: 'remo-con-tu-mano', nombre: 'Remo con tu mano', donde: 'Mueve · Espalda con banda · paso 5 de 5',
    texto: 'Una mano sujeta la muñeca de la otra y el codo va hacia atrás. Es el que pegaste en el chat: aunque llegó comprimido, su sombreado mide como el de Bisagra de cadera, así que no hace falta el original. Hasta hoy llevaba el glifo de Mueve.', vecino: ['apertura-con-banda', 'Apertura con banda', 'de su misma rutina'] },
  { s: 'pica-en-escritorio', nombre: 'Pica en escritorio', donde: 'Mueve · Empuje · progresión · paso 3 de 5',
    texto: 'Las manos en el borde de la mesa y la cadera alta. Hasta hoy salía el glifo por defecto.', vecino: ['flexiones-inclinadas', 'Flexiones inclinadas', 'de su misma rutina'] },
  { s: 'rodar-hacia-abajo', nombre: 'Rodar hacia abajo', donde: 'Estira · Espalda de pie · paso 1 de 5, y Columna · ondas',
    texto: 'De perfil, la espalda redondeándose hacia abajo y los brazos colgando. Sustituye al que no casaba.', vecino: ['juntar-omoplatos', 'Juntar omóplatos', 'de su misma rutina'] },
  { s: 'sentarse-y-levantarse-del-suelo', nombre: 'Sentarse y levantarse del suelo', donde: 'Estira · Caderas · suelo · paso 4 de 5',
    texto: 'A medio camino: una rodilla en el suelo y una mano bajando hacia el suelo. Sustituye al que no enseñaba el ejercicio, que además salía más grande que el resto.', vecino: ['sentadilla-lateral', 'Sentadilla lateral', 'el paso anterior de su rutina'] },
  { s: 'apretar-gluteos', nombre: 'Apretar glúteos', donde: 'Mueve · Glúteos invisibles · pasos 1 y 3',
    texto: 'Sentado, como pide el paso: el de antes estaba de pie.', vecino: ['elevacion-de-talones', 'Elevación de talones', 'de su misma rutina'] },
];

(async () => {
  /* Lo medido: cada nuevo contra los muñecos enteros que se quedan. */
  const ref = await referencia(sharp, CASOS.map((c) => c.s));
  const pc = (k, v) => 'p' + ref.pct(k, v);
  let medidas = '';
  for (const c of CASOS) {
    const m = await medirArchivo(sharp, path.join(DESTINO, c.s + '.webp'));
    medidas += '<tr><th>' + c.nombre + '</th><td>' + pc('tinta', m.tinta) + '</td><td>' + pc('rayado', m.rayado) + '</td><td>' +
      pc('linea', m.linea) + '</td><td>' + pc('grosor', m.grosor) + '</td></tr>';
  }

  let vistazo = '';
  let juntos = '';
  for (const c of CASOS) {
    const [vs, vn, por] = c.vecino;
    vistazo += '<figure>' + await img('blanqueado/' + c.s + '_runner_360', 200, c.nombre + ', el dibujo nuevo en el círculo del runner', CIRCULO_360, 'redondo') +
      '<figcaption>' + c.nombre + '</figcaption></figure>';
    const par = async (vista, ancho, que, recorte) => '<div class="vista"><p class="etq">' + que + '</p><div class="dos ' + vista + (recorte ? ' circ' : '') + '">' +
      '<figure>' + await img('blanqueado/' + c.s + '_' + vista, ancho, c.nombre + ', ' + que.toLowerCase(), recorte, recorte ? 'redondo' : '') + '<figcaption>' + c.nombre + ' (nuevo)</figcaption></figure>' +
      '<figure>' + await img('vecinos/' + vs + '_' + vista, ancho, vn + ', ' + que.toLowerCase(), recorte, recorte ? 'redondo' : '') + '<figcaption>' + vn + '</figcaption></figure>' +
      '</div></div>';
    juntos += '<section class="caso" id="' + c.s + '"><span class="num-caso">' + c.donde + '</span><h3>' + c.nombre + '</h3>' +
      '<p>' + c.texto + ' Al lado, ' + vn + ', ' + por + ', fotografiado en el mismo momento de su paso.</p>' +
      (LIGERA
        ? await par('runner_360', 240, 'En el móvil', CIRCULO_360)
        : await par('runner_360', 400, 'En el móvil') + await par('runner_1280', 760, 'En el ordenador')) +
      '</section>';
  }
  const total = fs.readdirSync(DESTINO).filter((x) => /.webp$/.test(x) && !/.min.webp$/.test(x)).length;
  const tiraSet = await img('tiras/set', LIGERA ? 1400 : 2000, 'Los ' + total + ' dibujos de ejercicio en tres filas, al mismo tamaño y por orden alfabético; los catorce nuevos llevan un aro terracota');
  const tiraSombreado = await img('tiras/sombreado-29', 900, 'Los cinco primeros en dos filas: arriba con la mancha conservada, como los viste; abajo con el rojo blanqueado');
  const tiraSalen = await img('tiras/se-salen', 900, 'Paloma, Flexor de cadera y Sentadilla a silla, y al lado Zancada profunda y Cuádriceps en pared');

  const html = `<title>Catorce dibujos nuevos</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · los catorce dibujos de ejercicio del 29 oct. 2026 en la app de la rama claude/elegant-pascal-d54e40,
     con el rojo blanqueado que eligió Ez. Guiones en docs/traspaso/archivos/dibujos-29oct/. -->
<style>
  /* Una columna de lectura; la tira del set ocupa todo el ancho y cada dibujo va con su vecino al lado. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --terracota: #A65A35;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --terracota: #D08A63; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --terracota: #D08A63; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .marco { max-width: 1040px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 8vw, 54px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(28px, 6vw, 34px); line-height: 1.1; margin-bottom: 12px; }
  h3 { font-size: 26px; line-height: 1.2; margin-bottom: 6px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  b { color: var(--ink); font-weight: 600; }
  figure { margin: 0; min-width: 0; }
  img { display: block; max-width: 100%; height: auto; border-radius: 10px; border: 1px solid var(--line); background: var(--paper-2); }
  img.redondo { border-radius: 50%; }
  figcaption { font-size: 14px; color: var(--ink-3); margin-top: 6px; }
  .pide { margin: 22px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 16px 18px 6px; max-width: 46em; }
  .tira { margin: 18px 0 8px; }
  .tira img { border: 0; background: none; border-radius: 0; width: 100%; }
  .anclada { margin: 0; color: var(--ink-3); font-size: 14px; }
  .aro { color: var(--terracota); font-weight: 600; }
  .vistazo { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 130px), 1fr)); gap: 14px; margin: 18px 0 8px; }
  .vistazo img { width: 100%; max-width: 170px; }
  section.bloque { margin-top: 44px; padding-top: 32px; border-top: 1px solid var(--line); }
  section.caso { margin-top: 34px; }
  .num-caso { font: italic 500 17px/1.3 var(--display); color: var(--cta); display: block; margin-bottom: 4px; }
  .vista { margin-top: 18px; }
  .etq { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 8px; }
  .dos { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: start; }
  .dos.runner_360 { max-width: 480px; }
  .dos.circ { max-width: 420px; }
  .reco { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 10px; max-width: 46em; }
  .reco li { border: 1px solid var(--line); border-radius: 12px; padding: 12px 16px; }
  .reco .que { display: block; font: italic 500 20px/1.3 var(--display); color: var(--ink); margin-bottom: 4px; }
  .reco p { margin: 0; }
  details { margin-top: 18px; max-width: 46em; }
  summary { cursor: pointer; color: var(--ink-2); font-weight: 500; }
  .medidas { overflow-x: auto; margin-top: 10px; }
  table { border-collapse: collapse; font-size: 14px; color: var(--ink-2); min-width: 420px; }
  th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid var(--line); font-variant-numeric: tabular-nums; }
  th { font-weight: 500; color: var(--ink); }
  thead th { font-weight: 600; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); }
</style>
<div class="marco">
  <p class="kicker">Dibujos de ejercicio · 29 oct. 2026 · antes de juntar${LIGERA ? ' · versión ligera' : ''}</p>
  <h1>Catorce dibujos nuevos</h1>
  <div class="pide">
    <p class="kicker" style="margin-top:2px">Lo que necesito de ti</p>
    <p><b>1.</b> Un sí a los catorce tal como se ven aquí, con el rojo blanqueado que elegiste en Piernas elevadas. Con él, la rama queda lista para que la coordinadora la junte cuando digas «júntalo», después del runner y de «Tus rutinas».</p>
    <p><b>2.</b> Si aclaro <b>Paloma</b>, <b>Flexor de cadera</b> y <b>Sentadilla a silla</b>, que ya estaban y se ven más sombreados que el resto (abajo). Recomiendo que sí.</p>
  </div>
  <div class="vistazo">${vistazo}</div>

  <section class="bloque" id="set">
    <span class="num-caso">Lo que pediste · todos juntos</span>
    <h2>El set entero</h2>
    <p>Los ${total} dibujos de ejercicio al mismo tamaño, por orden alfabético. Los catorce nuevos llevan un <span class="aro">aro terracota</span>.</p>
    <div class="tira">${tiraSet}</div>
    <p class="anclada">Medido contra los ${ref.filas.length} muñecos enteros que ya estaban y se quedan (sin manos ni cabezas de cerca), el sombreado de los nuevos queda en la mediana o por debajo, salvo Desliza el talón, un poco por encima. Llevan menos tinta en total que la media, que es lo más claro que elegiste, y sus líneas, algo más oscuras: es el trazo de Genspark.</p>
    <details><summary>Lo medido, en percentiles del set (p50 = la mediana)</summary>
      <div class="medidas"><table><thead><tr><th>Dibujo</th><th>Tinta</th><th>Sombreado</th><th>Línea</th><th>Grosor</th></tr></thead><tbody>${medidas}</tbody></table></div>
    </details>
  </section>

  <section class="bloque" id="se-salen">
    <span class="num-caso">De los que ya estaban · no los he tocado</span>
    <h2>Los que se salen</h2>
    <div class="tira">${tiraSalen}</div>
    <p class="anclada">De izquierda a derecha: Paloma, Flexor de cadera, Sentadilla a silla y, como referencia, Zancada profunda y Cuádriceps en pared.</p>
    <ul class="reco">
      <li><span class="que">Paloma, Flexor de cadera y Sentadilla a silla, más sombreados</span><p>Llevan una mancha oscura en el músculo, como la que viste en Piernas elevadas, y su sombreado está entre los más altos del set. Recomiendo aclararlos con la curva de la ingesta hasta la mediana, como se hizo con Hueco abdominal el 14 de octubre. No hace falta pedir dibujos nuevos: se rehacen desde sus originales, que están entre los de «Glifos de ejercicios - Estira» con otro nombre y hay que localizar.</p></li>
    </ul>
    <p class="anclada" style="margin-top:12px">Los que se ven más pequeños, como Superman o las suspensiones, lo son por la postura: van de punta a punta del círculo, igual que Plancha. No hace falta cambiarlos.</p>
  </section>

  <section class="bloque" id="sombreado">
    <span class="num-caso">Lo que pediste · ya en la app</span>
    <h2>El sombreado, antes y ahora</h2>
    <p>Arriba, los cinco primeros como los viste, con la mancha roja conservada. Abajo, como quedan con el rojo blanqueado, igual que el resto del set. Piernas elevadas es ya la versión que rehiciste, y Gemelo en pared, el dibujo más recogido.</p>
    <div class="tira">${tiraSombreado}</div>
  </section>

  <section class="bloque" id="juntos">
    <span class="num-caso">En la app</span>
    <h2>Cada uno junto a su vecino</h2>
    <p>${LIGERA ? 'El círculo del runner en el móvil, a 360 px: cada dibujo nuevo a la izquierda y, a la derecha, uno que ya está en su rutina o en su módulo. La versión completa lleva también la pantalla entera y el ordenador a 1280 px.' : 'Fotos de la app de verdad, sin nada pintado encima, en el móvil (360 px) y en el ordenador (1280 px): cada dibujo nuevo a la izquierda y, a la derecha, uno que ya está en su rutina o en su módulo.'}</p>
    ${juntos}
  </section>

  <section class="bloque">
    <span class="num-caso">Lo que no entra</span>
    <h2>Dos que esperan</h2>
    <p><b>Rana</b>, que se repite, y <b>Palmas en la mesa</b>, porque las versiones revisadas hoy tienen los dedos hacia fuera. Son los dos únicos dibujos de ejercicio que quedan por hacer.</p>
  </section>
</div>
`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, Math.round(Buffer.byteLength(html) / 1024) + ' KB');
})();
