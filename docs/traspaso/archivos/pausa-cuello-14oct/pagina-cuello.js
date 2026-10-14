/* La página para que Ez elija (pausa larga: el cuello y los 15 minutos). Una sola
   pieza, con las fotos dentro en WebP: el visor de Ez no abre HTML de más de 512 KB. */
'use strict';
const path = require('path');
const fs = require('fs');
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/pausa-cuello-b4792a';
const sharp = require(path.join(WT, 'node_modules/sharp'));
const F = path.join(__dirname, 'fotos');
const DEST = path.join(WT, 'docs/traspaso/archivos/pausa-cuello-14oct/la-pausa-larga.html');

async function img(nombre, recorte, ancho, q) {
  let s = sharp(path.join(F, nombre + '.png'));
  if (recorte) s = s.extract(recorte);
  if (ancho) s = s.resize({ width: ancho });
  const b = await s.webp({ quality: q || 62 }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
}
const MODAL = { left: 281, top: 222, width: 718, height: 435 };
const CIERRE = { left: 360, top: 170, width: 560, height: 690 };

(async () => {
  const I = {
    a1: await img('esc-a1-ventana', MODAL, 640),
    p1: await img('esc-p1-ventana', MODAL, 640),
    a2: await img('esc-a2-cierre', CIERRE, 420),
    p2: await img('esc-p2-cierre', CIERRE, 420),
    a3: await img('esc-a3-home', null, 960, 58),
    pb: await img('esc-pb-home', { left: 0, top: 220, width: 640, height: 659 }, 480, 60),
    p5: await img('esc-p5-aro-ritmo', null, 960, 58),
    ma3: await img('mov-a3-home', null, 300, 62),
    mp2: await img('mov-p2-cierre', null, 300, 62),
    mp3: await img('mov-p3-cuello', null, 300, 62),
    mp5: await img('mov-p5-aro-ritmo', null, 300, 62),
  };
  const fig = (src, pie) => `<figure><img src="${src}" alt="${pie.replace(/<[^>]+>/g, '')}"><figcaption>${pie}</figcaption></figure>`;
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>La pausa larga</title>
<style>
:root {
  --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F685A;
  --line: #C9C0A8; --focus: #3E5A3A; --breathe: #A9583B;
  --display: 'EB Garamond', 'Cormorant Garamond', Georgia, serif;
  --ui: 'Inter Tight', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
  --line: #4d4536; --focus: #9DB98F; --breathe: #E2A588; color-scheme: dark; } }
:root[data-theme="dark"] {
  --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
  --line: #4d4536; --focus: #9DB98F; --breathe: #E2A588; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
main { max-width: 1040px; margin: 0 auto; padding: 36px 16px 96px; display: grid; gap: 8px; }
h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; margin: 0; text-wrap: balance; line-height: 1.12; }
h1 { font-size: clamp(32px, 6vw, 44px); }
h2 { font-size: clamp(23px, 4vw, 29px); }
h3 { font-size: 21px; }
p, li { max-width: 68ch; }
p { margin: 0; }
ul { margin: 0; padding-left: 20px; display: grid; gap: 4px; color: var(--ink-2); }
.meta { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); }
.lede { color: var(--ink-2); font-size: 17px; }
.intro { display: grid; gap: 14px; padding-bottom: 20px; }
.nota { display: grid; gap: 8px; padding: 14px 18px; border-left: 3px solid var(--focus); background: var(--paper-2); border-radius: 0 10px 10px 0; color: var(--ink-2); }
.nota b { color: var(--ink); }
section { display: grid; gap: 14px; padding-block: 30px 6px; border-top: 1px solid var(--line); }
.op { display: grid; gap: 12px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 12px; }
.op.rec { border-color: var(--focus); }
.op .et { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); }
.op.rec .et b { color: var(--focus); }
.texto { color: var(--ink-2); }
.fotos { display: grid; gap: 14px; align-items: start; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }
.fotos.mov { grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 260px)); }
figure { margin: 0; display: grid; gap: 6px; min-width: 0; }
figcaption { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); }
img { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--paper-2); }
.decide { display: grid; gap: 10px; padding: 18px 20px; background: var(--paper-2); border-radius: 12px; }
.decide ol { margin: 0; padding-left: 22px; display: grid; gap: 8px; }
</style>
</head>
<body>
<main>
  <div class="intro">
    <span class="meta">PACE · la pausa larga · 14 de octubre de 2026</span>
    <h1>La pausa larga: el cuello y los 15 minutos</h1>
    <p class="lede">Lo que te pasó a las 16:02 se repite siempre, en el escritorio y en el móvil: la pausa larga
    trae dos ejercicios, pero la ventana «Tu pausa», la parada de la línea y la barra lateral solo abren el
    primero. Al acabar Respira vuelves a la home, la parada ya cuenta como hecha y volver a tocarla abre
    Respira otra vez: al cuello no se llega nunca. Y con «A tu ritmo» el reloj no cuenta la pausa: al
    acabar el bloque el aro se queda esperando el siguiente.</p>
    <p class="lede">Las fotos son de la app de verdad, con tu mismo día (miércoles, «Exhalación 4·6 + Cuello»).
    Las de las propuestas llevan cambiado solo lo que se propone.</p>
  </div>

  <section>
    <h2>Lo que pasa hoy</h2>
    <div class="fotos">
      ${fig(I.a1, '1 · La ventana nombra solo Exhalación 4·6 (6 min)')}
      ${fig(I.a2, '2 · Al acabar Respira, «Volver al inicio»')}
    </div>
    ${fig(I.a3, '3 · En la home la barra y la parada siguen ofreciendo Exhalación 4·6, y el aro ya espera el bloque 3')}
    <div class="fotos mov">${fig(I.ma3, 'En el móvil, igual')}</div>
  </section>

  <section>
    <h2>1 · El cuello</h2>
    <p class="texto">En las dos opciones la ventana «Tu pausa» nombra ya los dos ejercicios y los 15 minutos:</p>
    <div class="fotos">${fig(I.p1, 'Las dos: Exhalación 4·6 + Cuello · 15 min · Respira y Estira')}</div>
    <div class="op rec">
      <span class="et"><b>A · Seguidos</b> · la recomiendo</span>
      <p class="texto">Al acabar Respira, el cierre dice «Pausa larga · 1 de 2» y su botón es «Seguir con Estira»,
      que entra directo al cuello (sin la ficha de antes de empezar: ya lo has elegido). Si sales con la X,
      vuelves a la home y la pausa te ofrece el cuello. Es lo que esperabas: una pausa, de principio a fin.</p>
      <div class="fotos">${fig(I.p2, 'El cierre de Respira, en el escritorio')}</div>
      <div class="fotos mov">
        ${fig(I.mp2, 'En el móvil')}
        ${fig(I.mp3, 'Y entra el cuello')}
      </div>
    </div>
    <div class="op">
      <span class="et"><b>B · Uno a uno</b></span>
      <p class="texto">Al acabar Respira vuelves a la home, como hoy, pero la barra lateral y la parada te ofrecen
      ya el cuello. Es un toque más por pausa, y si no miras la barra se te puede pasar como hoy.</p>
      <div class="fotos">${fig(I.pb, 'La barra: «Ahora, Cuello»')}</div>
    </div>
  </section>

  <section>
    <h2>2 · Los 15 minutos</h2>
    <p class="texto">El aro pasa a contar la pausa, con la misma pantalla que el modo «Larga» de arriba, pero hablando
    del día: debajo de la cuenta dice qué viene luego, el «Ciclo 3/4» se va (el día ya cuenta los bloques) y el botón
    es «Empezar ya el bloque 3», por si quieres volver antes. Al llegar a cero suena el cuenco y el aro vuelve a
    «Bloque 3 de 9» con «Empezar bloque 3»: no arranca solo.</p>
    ${fig(I.p5, 'La pausa larga contando, con 9 minutos hechos')}
    <div class="fotos mov">${fig(I.mp5, 'En el móvil')}</div>
    <div class="op rec">
      <span class="et"><b>2A · Empieza a contar al acabar el bloque</b> · la recomiendo</span>
      <p class="texto">La pausa empieza cuando acaba el bloque, hagas ejercicios o no: si cierras la ventana y vas a por
      un café, también es pausa. «Seguir con el bloque 3» la corta.</p>
    </div>
    <div class="op">
      <span class="et"><b>2B · Empieza a contar al pulsar «Hacer la pausa»</b></span>
      <p class="texto">Solo cuenta si haces los ejercicios; si cierras la ventana, el aro sigue esperando el bloque como hoy.</p>
    </div>
    <div class="op rec">
      <span class="et"><b>3A · Cuenta todas las pausas, las de 5 y la de 15</b> · la recomiendo</span>
      <p class="texto">Una pausa es una pausa: la corta también te avisa de que toca volver.</p>
    </div>
    <div class="op">
      <span class="et"><b>3B · Solo la larga</b></span>
      <p class="texto">Las de 5 minutos siguen como hoy: duran lo que dura su ejercicio.</p>
    </div>
  </section>

  <section>
    <h2>Lo que no cambia</h2>
    <ul>
      <li>La parada cuenta como hecha en cuanto haces uno de los dos ejercicios: hiciste una pausa.</li>
      <li>La hora de comer no se cuenta: es tuya, y el aro te espera como hoy.</li>
      <li>Sin «A tu ritmo» (por libre) el Pomodoro sigue como hoy.</li>
    </ul>
  </section>

  <div class="decide">
    <h3>Lo que hay que decidir</h3>
    <ol>
      <li><b>El cuello:</b> A, seguidos, o B, uno a uno.</li>
      <li><b>Cuándo empieza a contar la pausa:</b> 2A, al acabar el bloque, o 2B, al pulsar «Hacer la pausa».</li>
      <li><b>Qué pausas cuenta:</b> 3A, todas, o 3B, solo la larga.</li>
    </ol>
    <p class="texto">Mi recomendación: A · 2A · 3A.</p>
  </div>
</main>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(DEST), { recursive: true });
  fs.writeFileSync(DEST, html);
  console.log('página', Math.round(Buffer.byteLength(html) / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
