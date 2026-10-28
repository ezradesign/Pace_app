// La página para que Ez mire lo que eligió (1A 2A 3A 4A) ya montado, con las fotos de fotos-montado.js.
// Uso: node pagina-montado.js <carpeta-de-fotos> <salida.html>. Misma letra y colores que la maqueta.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const sharp = require(R + '/node_modules/sharp');
const F = require('path').resolve(process.argv[2]) + '/';
const SALIDA = process.argv[3];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function foto(base, w, alt) {
  const ancho = w === 360 ? 460 : 1100;
  const b = await sharp(F + base + '_' + w + '.png').resize({ width: ancho, withoutEnlargement: true }).webp({ quality: ancho > 600 ? 74 : 72 }).toBuffer();
  const meta = await sharp(F + base + '_' + w + '.png').metadata();
  const alto = Math.round(meta.height * ancho / meta.width);
  return '<img src="data:image/webp;base64,' + b.toString('base64') + '" alt="' + esc(alt + (w === 360 ? ', en el móvil' : ', en el ordenador')) +
    '" loading="lazy" width="' + ancho + '" height="' + alto + '">';
}
/* Una foto: móvil y ordenador lado a lado, y debajo una línea en palabras llanas. */
async function par(base, linea, alt) {
  return '<figure class="par"><div class="m">' + await foto(base, 360, alt) + '</div><div class="d">' + await foto(base, 1280, alt) +
    '</div><figcaption>' + linea + '</figcaption></figure>';
}

(async () => {
  const P = {
    v1: await par('v1-hoja', 'La primera vez que abres PACE el día de v1, si ya lo usabas: tu semana con su fecha, las rutinas de pago que hiciste (con su módulo), «Lo gratis sigue gratis» y solo «Entendido». Sale una vez y nunca con una sesión delante.', 'La hoja del día de v1'),
    v1en: await par('v1-hoja-en', 'La misma hoja en inglés.', 'La hoja del día de v1 en inglés'),
    aj: await par('v1-ajustes', 'Ajustes › Tus datos durante esa semana: «PACE completo · Prueba hasta el 3 de diciembre». Al acabar la semana vuelve a ser la fila de siempre.', 'La fila de PACE completo en Ajustes durante la semana de prueba'),
    rv: await par('rec-vacio', 'pacegrass.app/recuperar: el correo con el que pagaste y el número del recibo de Stripe. Debajo, que no se guarda nada y el enlace a Privacidad.', 'La página para recuperar el código'),
    rl: await par('rec-listo', 'Si encuentra la compra: tu código con lo mismo que la página de gracias (Abrir PACE, Copiar, Descargar y Mandármelo).', 'El código recuperado'),
    rn: await par('rec-no', 'Si no la encuentra, lo dice y te deja probar otra vez; abajo sigue el correo para escribirnos.', 'La página cuando no encuentra la compra'),
    co: await par('codigo', 'En PACE, debajo de «Tengo un código»: «¿Lo has perdido? Recupéralo con tu correo» abre esa página en otra pestaña. En Android no sale, porque allí no hay códigos.', 'El campo del código con el enlace para recuperarlo'),
    pa: await par('compra', 'Al tocar algo de pago con la tienda ya lista: los dos precios en una frase, «Probar 7 días gratis» y «Ahora no» del mismo tamaño, el aviso de antes de cobrar y «Prefiero pagarlo una vez». Los precios son de ejemplo de la tienda.', 'La invitación con los botones de compra'),
  };

  const html = `<title>Vender PACE completo, montado</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · lo que faltaba para vender (punto 12 del ROADMAP), YA MONTADO en la rama claude/clever-gagarin-6701aa
     (28 oct. 2026). Fotos del index.html de la rama tal cual, con datos de ejemplo. Guiones en
     docs/traspaso/archivos/vender-punto-12/ (fotos-montado.js y pagina-montado.js). -->
<style>
  /* Página para mirar y decir «júntalo»: una columna de lectura; cada pieza, sus fotos (móvil y ordenador) con una línea. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --focus: #3E5A3A; --ok-bg: #E3E6D8;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --ok-bg: #2a3025; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --ok-bg: #2a3025; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .banda { background: var(--focus); color: var(--paper); font: 500 12px/1.5 var(--ui); letter-spacing: .04em; text-align: center;
    padding-block: 10px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .marco { max-width: 1040px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(40px, 8vw, 58px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(29px, 6vw, 36px); line-height: 1.1; margin-bottom: 12px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  .lede { font-size: 17.5px; }
  b { color: var(--ink); font-weight: 600; }
  code { font: 500 13px/1.4 ui-monospace, 'Cascadia Mono', Consolas, monospace; color: var(--ink); background: var(--paper-2); border-radius: 4px; padding: 1px 4px; overflow-wrap: anywhere; }
  .estado { margin: 22px 0 6px; border: 1px solid var(--cta); border-radius: 14px; padding: 16px 18px 6px; max-width: 44em; background: var(--ok-bg); }
  .estado ul { list-style: none; padding: 0; margin: 0 0 10px; display: grid; gap: 6px; }
  .estado li { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; align-items: baseline; color: var(--ink-2); }
  .estado .n { font: italic 500 20px/1 var(--display); color: var(--cta); }
  section.pieza { margin-top: 44px; padding-top: 34px; border-top: 1px solid var(--line); }
  .num { font: italic 500 17px/1 var(--display); color: var(--cta); display: block; margin-bottom: 6px; }
  figure { margin: 18px 0 22px; min-width: 0; }
  .par { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2.6fr); gap: 14px; align-items: start; }
  .par .m, .par .d { min-width: 0; }
  .par img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--paper-2); }
  .par figcaption { grid-column: 1 / -1; font-size: 15px; line-height: 1.5; color: var(--ink-2); max-width: 46em; margin-top: -2px; }
  ul.lista { padding-left: 1.1em; margin: 0 0 12px; max-width: 44em; color: var(--ink-2); }
  ul.lista li { margin: 0 0 6px; }
  .nota { font-size: 14px; color: var(--ink-3); }
  .respuesta { margin-top: 44px; padding: 20px 18px 10px; border: 1px solid var(--cta); border-radius: 14px; max-width: 44em; }
  .linea { font: italic 500 26px/1.25 var(--display); color: var(--ink); margin-bottom: 8px; }
  @media (max-width: 640px) {
    .par { grid-template-columns: minmax(0, 1fr); }
    .par .m { max-width: 300px; }
  }
</style>
<div class="banda">Montado en una rama · aún no está en pacegrass.app ni en las apps · fotos de la app de verdad con datos de ejemplo</div>
<main class="marco">
  <p class="kicker">PACE · lo que faltaba para vender</p>
  <h1>Vender PACE completo, montado</h1>
  <p class="lede">Elegiste <b>1A 2A 3A 4A</b>. Ya está montado tal cual se veía en la maqueta, en español y en inglés. Las fotos son de la app de verdad, sin nada metido a mano: solo se finge que hoy es el día de v1 (el jueves 26 de noviembre de ejemplo) o que la tienda ya tiene sus enlaces de pago.</p>

  <div class="estado">
    <p class="kicker" style="margin-bottom:8px">Cómo ha salido</p>
    <ul>
      <li><span class="n">1</span><span>La hoja del día de v1 y la fila de Ajustes, montadas.</span></li>
      <li><span class="n">2</span><span>La página /recuperar, con los enlaces desde gracias, desde las preguntas de /premium, desde PACE y una frase en Privacidad.</span></li>
      <li><span class="n">3</span><span>Los botones de compra en la invitación. Salen solos cuando la tienda esté lista; hasta entonces la hoja sigue como hoy.</span></li>
      <li><span class="n">4</span><span>La ventana de Apple para valorar PACE, con las mismas reglas que la de Android.</span></li>
    </ul>
    <p>Todas las pruebas nuevas y las de la invitación, la bienvenida, /premium, /gracias y Ajustes pasan.</p>
  </div>

  <section class="pieza">
    <span class="num">1A</span>
    <h2>El día de v1</h2>
    ${P.v1}
    ${P.v1en}
    ${P.aj}
    <p class="nota">Un detalle que no salía en la maqueta: si alguien hizo más de seis rutinas de pago, la hoja enseña cinco y debajo «Y 2 más, también tuyas», para que quepa en el móvil sin scroll.</p>
  </section>

  <section class="pieza">
    <span class="num">2A</span>
    <h2>Recuperar el código</h2>
    ${P.rv}
    ${P.rl}
    ${P.rn}
    ${P.co}
    <p class="nota">En la página de gracias, «Si lo pierdes» ahora lleva a pacegrass.app/recuperar, y la pregunta «¿Y si cambio de ordenador o de navegador?» de /premium también. En Privacidad hay una frase nueva: el correo y el recibo solo van a Stripe para buscar la compra y no se guardan.</p>
  </section>

  <section class="pieza">
    <span class="num">3A</span>
    <h2>La invitación con los botones de compra</h2>
    ${P.pa}
    <p class="nota">En el móvil los dos botones van uno encima del otro, igual de anchos. Si la compra no se puede abrir, la hoja lo dice y no se cierra.</p>
    <p class="nota">Como pediste, «Las rutinas más hondas» ahora dice «Las rutinas más profundas», en la app, en /premium (también su imagen) y en el README; en inglés no cambia. En el móvil, en esta hoja, esa fila ocupa ahora dos líneas, como se ve en la foto, y sigue cabiendo sin scroll. En la última pantalla de la bienvenida cabe en una.</p>
  </section>

  <section class="pieza">
    <span class="num">4A</span>
    <h2>La ventana para valorar PACE, también en el iPhone</h2>
    <p>No hay foto porque la ventana la pinta Apple, no PACE. Sale una vez, al cerrar la pantalla final de la quinta pausa entera, como en Android. Apple decide si la enseña y no dice qué pasó, así que no se vuelve a pedir.</p>
    <p class="nota">La pieza del iPhone se compila en GitHub cuando la rama llegue a <code>main</code>. No se ha subido nada a TestFlight.</p>
  </section>

  <div class="respuesta">
    <p class="kicker" style="margin-bottom:6px">Tu respuesta</p>
    <p class="linea">«Júntalo»</p>
    <p>Si te gusta, la coordinadora lo junta en <code>main</code>. Si algo no te convence, dime qué foto y qué cambiarías.</p>
  </div>
</main>
`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, Math.round(html.length / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
