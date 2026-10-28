// La página para que Ez elija lo que se ve del punto 12, con las fotos de la app real.
// Uso: node pagina.js <carpeta-de-fotos> <salida.html>, tras fotos.js.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const sharp = require(R + '/node_modules/sharp');
const F = require('path').resolve(process.argv[2]) + '/';
const SALIDA = process.argv[3];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function webp(archivo, ancho) {
  const b = await sharp(F + archivo + '.png').resize({ width: ancho, withoutEnlargement: true }).webp({ quality: ancho > 600 ? 74 : 72 }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
}
async function foto(base, w, alt) {
  const src = await webp(base + '_' + w, w === 360 ? 460 : 1100);
  const meta = await sharp(F + base + '_' + w + '.png').metadata();
  const ancho = w === 360 ? 460 : 1100;
  const alto = Math.round(meta.height * ancho / meta.width);
  return '<img src="' + src + '" alt="' + esc(alt + (w === 360 ? ', en el móvil' : ', en el ordenador')) + '" loading="lazy" width="' + ancho + '" height="' + alto + '">';
}
async function par(base, pie, alt) {
  return '<figure class="par"><div class="m">' + await foto(base, 360, alt) + '</div><div class="d">' + await foto(base, 1280, alt) +
    '</div><figcaption>' + pie + '</figcaption></figure>';
}
const opcion = (letra, titulo, texto, reco) => '<li class="opcion' + (reco ? ' reco' : '') + '"><span class="letra">' + letra +
  '</span><div><p class="otit">' + titulo + (reco ? ' <span class="pill">La que recomiendo</span>' : '') + '</p><p>' + texto + '</p></div></li>';

(async () => {
  const P = {};
  P.v1a = await par('v1-hoja', '<b>1A</b> y <b>1C</b> · la hoja, la primera vez que abres PACE el día de v1', 'La hoja del día de v1: siete días de PACE completo y las rutinas que se quedan');
  P.v1b = await par('v1-linea', '<b>1B</b> · solo un aviso abajo, sin hoja', 'Un aviso abajo: siete días para probarlo entero');
  P.v1c = await par('v1-final', '<b>1C</b> · y otra hoja dos días antes del final', 'La segunda hoja: tu semana acaba el jueves');
  P.v1aj = await par('v1-ajustes', 'Con las tres · Ajustes › Tus datos, mientras dura la semana', 'La fila de PACE completo en Ajustes: prueba hasta el 3 de diciembre');
  P.v1de = await par('v1-despues', 'Con las tres · al acabar la semana, en Respira: «Respiración en rondas» sigue abierta; «Rondas profundas» y «Tolerancia CO2», con candado', 'La biblioteca de Respira después de la semana de prueba');
  P.rv = await par('rec-vacio', '<b>2A</b> y <b>2B</b> · pacegrass.app/recuperar', 'La página para recuperar el código, con el correo y el número del recibo');
  P.rl = await par('rec-listo', '<b>2A</b> y <b>2B</b> · al encontrar la compra: lo mismo que la página de gracias', 'El código recuperado, con Abrir PACE, Copiar, Descargar y Mandármelo');
  P.rn = await par('rec-no', '<b>2A</b> y <b>2B</b> · si no la encuentra', 'La página cuando no encuentra la compra');
  P.ca = await par('codigo-a', '<b>2A</b> · en PACE, debajo de «Tengo un código»: «¿Lo has perdido?» abre la página', 'El campo del código con el enlace para recuperarlo');
  P.cc = await par('codigo-c', '<b>2C</b> · dentro de PACE, sin página', 'Recuperar el código dentro de la app');
  P.pa = await par('compra-a', '<b>3A</b> · como la última pantalla de la bienvenida', 'La invitación con Probar 7 días gratis y Ahora no, iguales');
  P.pb = await par('compra-b', '<b>3B</b> · dos planes para elegir', 'La invitación con dos planes: al mes y para siempre');

  const html = `<title>Vender PACE completo</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · lo que falta para vender (punto 12 del ROADMAP): la página para que Ez elija (28 oct. 2026).
     Las fotos son de la app real (index.html de v0.184.0) con la propuesta metida por dentro antes de montarse,
     y del borrador de /recuperar; los datos son de ejemplo. Guiones en docs/traspaso/archivos/vender-punto-12/. -->
<style>
  /* Página de decisión: una columna de lectura; cada decisión, sus fotos (móvil y ordenador lado a lado) y sus opciones. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --focus: #3E5A3A; --premium: #9A6B2F; --reco-bg: #E3E6D8;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --premium: #D2A86A; --reco-bg: #2a3025; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --focus: #A3BC96; --premium: #D2A86A; --reco-bg: #2a3025; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .banda { background: var(--focus); color: var(--paper); font: 500 12px/1.5 var(--ui); letter-spacing: .04em; text-align: center;
    padding-block: 10px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .marco { max-width: 1040px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(40px, 8vw, 58px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(29px, 6vw, 36px); line-height: 1.1; margin-bottom: 12px; }
  h3 { font-size: 22px; line-height: 1.2; margin: 26px 0 8px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  .lede { font-size: 17.5px; }
  b { color: var(--ink); font-weight: 600; }
  code { font: 500 13px/1.4 ui-monospace, 'Cascadia Mono', Consolas, monospace; color: var(--ink); background: var(--paper-2); border-radius: 4px; padding: 1px 4px; overflow-wrap: anywhere; }
  .respuesta { margin: 26px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 18px 18px 8px; max-width: 44em; }
  .respuesta ol { list-style: none; padding: 0; margin: 0 0 10px; display: grid; gap: 6px; }
  .respuesta li { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; gap: 10px; align-items: baseline; padding: 6px 0; border-bottom: 1px dashed var(--line); }
  .respuesta li:last-child { border-bottom: 0; }
  .respuesta .n { font: italic 500 22px/1 var(--display); color: var(--cta); }
  .respuesta .rl { font: 600 13px/1 var(--ui); color: var(--cta); white-space: nowrap; }
  .linea { font: italic 500 22px/1.3 var(--display); color: var(--ink); }
  section.decision { margin-top: 44px; padding-top: 34px; border-top: 1px solid var(--line); }
  .num-dec { font: italic 500 17px/1 var(--display); color: var(--cta); display: block; margin-bottom: 6px; }
  figure { margin: 18px 0 14px; min-width: 0; }
  .par { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2.6fr); gap: 14px; align-items: start; }
  .par .m, .par .d { min-width: 0; }
  .par img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--paper-2); }
  .par figcaption { grid-column: 1 / -1; font: 500 12px/1.4 var(--ui); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); margin-top: -4px; }
  figcaption b { color: var(--cta); }
  .opciones { list-style: none; padding: 0; margin: 18px 0 6px; display: grid; gap: 10px; max-width: 46em; }
  .opcion { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 12px; align-items: start; padding: 14px 16px 6px; border: 1px solid var(--line); border-radius: 12px; }
  .opcion.reco { border-color: var(--cta); background: var(--reco-bg); }
  .letra { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--cta); display: grid; place-items: center; font: italic 500 21px/1 var(--display); color: var(--cta); }
  .opcion.reco .letra { background: var(--cta); color: var(--paper); }
  .otit { font: italic 500 21px/1.35 var(--display); color: var(--ink); margin: 2px 0 6px; }
  .pill { font: 600 10.5px/1 var(--ui); letter-spacing: .08em; text-transform: uppercase; color: var(--cta); border: 1px solid var(--cta); border-radius: 999px; padding: 3px 8px; vertical-align: 3px; white-space: nowrap; }
  ul.lista { padding-left: 1.1em; margin: 0 0 12px; max-width: 44em; color: var(--ink-2); }
  ul.lista li { margin: 0 0 6px; }
  .nota { font-size: 14px; color: var(--ink-3); }
  @media (max-width: 640px) {
    .par { grid-template-columns: minmax(0, 1fr); }
    .par .m { max-width: 300px; }
  }
</style>
<div class="banda">Maqueta · nada de esto está montado todavía · fotos de la app real (v0.184.0) con la propuesta dentro</div>
<main class="marco">
  <p class="kicker">PACE · lo que falta para vender</p>
  <h1>Vender PACE completo</h1>
  <p class="lede">Son las cuatro piezas que decidiste el 15 de octubre y aún no estaban hechas. Tres se ven y necesitan tu ojo; la cuarta es un sí o un no. Mientras eliges, monto lo que no se ve: la valoración de Google Play, la cuenta de qué rutinas se quedan, y la función que busca la compra en Stripe.</p>

  <div class="respuesta">
    <p class="kicker" style="margin-bottom:6px">Tu respuesta, en una línea</p>
    <ol>
      <li><span class="n">1</span><span>El aviso del día de v1: la semana de prueba y las rutinas que se quedan</span><span class="rl">A · B · C</span></li>
      <li><span class="n">2</span><span>Recuperar el código de una compra con el correo y el recibo</span><span class="rl">A · B · C</span></li>
      <li><span class="n">3</span><span>La invitación a PACE completo con los botones de compra</span><span class="rl">A · B</span></li>
      <li><span class="n">4</span><span>La ventana para valorar PACE, también en el iPhone</span><span class="rl">A · B</span></li>
    </ol>
    <p>La que recomiendo: <span class="linea">1A 2A 3A 4A</span></p>
  </div>

  <section class="decision">
    <span class="num-dec">Decisión 1</span>
    <h2>El aviso del día de v1</h2>
    <p>Quien ya usaba PACE antes de v1 recibe siete días de PACE completo, sin tarjeta, y las rutinas de pago que hizo alguna vez se le quedan para siempre. La lista sale de lo que hay guardado en su móvil o su navegador y se fija una sola vez, la primera vez que abre PACE ese día. Las demás de pago se cierran al acabar la semana, y lo gratis sigue igual. Quien tiene un código (los testers) no ve nada de esto, porque ya lo tiene todo.</p>
    <p>Lo que hay que elegir es cómo se le cuenta. En las fotos, el día de v1 es el jueves 26 de noviembre y esta persona hizo tres rutinas de pago: una de Respira, una de Mueve y una de Estira.</p>
    ${P.v1a}
    ${P.v1b}
    ${P.v1c}
    ${P.v1aj}
    ${P.v1de}
    <ol class="opciones">
      ${opcion('A', 'Una hoja al abrir PACE ese día', 'Sale una vez, sin una sesión delante: los siete días con su fecha, las rutinas que se quedan con su nombre y «Lo gratis sigue gratis». Un solo botón, «Entendido», sin nada que comprar. Después, la fecha queda en Ajustes.', true)}
      ${opcion('B', 'Solo un aviso abajo', 'Unos segundos en la caja de los avisos de PACE, sin hoja. Es lo más discreto, pero no dice qué rutinas se quedan y se pierde si no lo miras.')}
      ${opcion('C', 'La hoja y otra dos días antes del final', 'La de la A y, el martes, otra que dice que la semana acaba el jueves y qué se queda, con «Ver PACE completo». Es la única que vende algo, y por eso no la recomiendo: hasta hoy nada se abre solo para vender.')}
    </ol>
    <p class="nota">Con las tres: «Prueba hasta el…» en Ajustes mientras dura, y las que se quedan se ven como hoy, con su «Premium» y sin candado. En Android y en el iPhone, igual.</p>
  </section>

  <section class="decision">
    <span class="num-dec">Decisión 2</span>
    <h2>Recuperar el código de una compra</h2>
    <p>Para quien pagó en la web y perdió su código: cerró la pestaña antes de la página de gracias, borró los datos del navegador o cambió de ordenador. Escribe el correo con el que pagó y el número del recibo que le mandó Stripe; la web busca la compra en Stripe en ese momento y le vuelve a dar su código. No se guarda ni el correo ni el recibo. Si la mensual ya terminó o la compra se devolvió, lo dice.</p>
    ${P.rv}
    ${P.rl}
    ${P.rn}
    ${P.ca}
    ${P.cc}
    <ol class="opciones">
      ${opcion('A', 'La página, y en PACE «¿Lo has perdido?»', 'pacegrass.app/recuperar con la letra de la página de gracias. Se llega desde gracias («Si lo pierdes»), desde las preguntas de /premium y desde PACE, debajo de «Tengo un código». En Android no sale, porque allí no hay códigos.', true)}
      ${opcion('B', 'Solo la página', 'La misma página, pero PACE no la nombra: se llega desde gracias y /premium. Quien pierde el código y abre PACE no sabe que existe.')}
      ${opcion('C', 'Dentro de PACE, sin página', 'Los dos campos en la hoja del código, y PACE canjea lo que encuentre. Cambia una promesa: hoy PACE solo se conecta para renovar la mensual, y esto añadiría otra conexión desde la app. Quien no tiene PACE abierto (en otro ordenador) tampoco lo encontraría.')}
    </ol>
  </section>

  <section class="decision">
    <span class="num-dec">Decisión 3</span>
    <h2>La invitación con los botones de compra</h2>
    <p>Es la hoja que sale al tocar algo de pago. Hoy dice «Llega con la versión 1». En cuanto la tienda está lista (en la web, cuando pongas los dos enlaces de pago de Stripe; en Android, con Play Billing), lleva los precios que da la tienda y los botones. Las fotos son en la web, con precios de ejemplo de la tienda.</p>
    ${P.pa}
    ${P.pb}
    <ol class="opciones">
      ${opcion('A', 'Como la bienvenida', 'Lo mismo que elegiste el 16 de octubre para la última pantalla de la bienvenida: los dos precios en una frase, «Probar 7 días gratis» y «Ahora no» del mismo tamaño, el aviso de que te avisamos antes de cobrar, y «Prefiero pagarlo una vez» debajo. Quien ya vio la bienvenida reconoce la hoja.', true)}
      ${opcion('B', 'Dos planes para elegir', 'Dos cajas, al mes y para siempre, cada una con su precio; tocar una es comprarla. Se ve más el precio de por vida, pero ocupa más alto y se aparta de la bienvenida.')}
    </ol>
  </section>

  <section class="decision">
    <span class="num-dec">Decisión 4</span>
    <h2>La ventana para valorar PACE, también en el iPhone</h2>
    <p>En Android ya está decidido: la ventana de Google para valorar la app sale una sola vez, al cerrar la pantalla final de la quinta pausa entera (Respira, Mueve o Estira, sin terminar antes ni saltar ejercicios). Nunca en la bienvenida ni en la web. Google no dice si valoraste o la cerraste, así que no vuelve a salir. La ventana la pinta Google, no PACE, por eso no hay foto.</p>
    <ol class="opciones">
      ${opcion('A', 'También en el iPhone', 'La ventana de Apple, con las mismas reglas: una vez, tras la quinta pausa entera. Apple decide si la enseña (como mucho tres veces al año a cada persona) y tampoco dice qué pasó. Las valoraciones del primer mes son las que más pesan en las dos tiendas.', true)}
      ${opcion('B', 'Solo en Android', 'Como se decidió el 15 de octubre, cuando el iPhone aún no entraba en v1. En la App Store, las valoraciones llegarían solo de quien vaya a buscarla.')}
    </ol>
    <p class="nota">La pieza del iPhone se compila en GitHub, como el resto de la app del iPhone; no se sube a TestFlight sin tu sí.</p>
  </section>

  <section class="decision">
    <span class="num-dec">Mientras eliges</span>
    <h2>Lo que monto sin preguntarte</h2>
    <ul class="lista">
      <li><b>La valoración en Android</b>: la pieza nativa que abre la ventana de Google, la cuenta de pausas enteras y que no salga dos veces.</li>
      <li><b>El paso a v1 por dentro</b>: la lista de rutinas que se quedan, la semana de prueba y que todo siga igual mientras PACE completo esté abierto para todos. Se prueba fingiendo que ya es v1.</li>
      <li><b>La búsqueda en Stripe</b>: la función que busca la compra con el correo y el recibo, vuelve a firmar el código y no guarda nada. Sale apagada hasta que conectes tu cuenta de Stripe, como las demás.</li>
    </ul>
    <p class="nota">Lo que no puedo probar sin tu cuenta de Stripe: cómo se llama de verdad el número en el recibo de Stripe en su modo «vende por ti». La función acepta el número del recibo y el de la factura; se mira con el modo de pruebas de Stripe antes de cobrar a nadie, como ya estaba previsto.</p>
  </section>
</main>`;
  fs.writeFileSync(SALIDA, html);
  console.log(SALIDA, (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
