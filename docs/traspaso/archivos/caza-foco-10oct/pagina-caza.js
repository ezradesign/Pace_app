/* Página autocontenida: la maqueta que eligió Ez junto a la app real de la rama.
   Uso: node pagina-caza.js <carpeta-maqueta> <carpeta-fotos-hoy> <salida.html> */
'use strict';
const fs = require('fs');
const path = require('path');
const [MAQ, HOY, SALIDA] = process.argv.slice(2);
const medidas = JSON.parse(fs.readFileSync(path.join(HOY, 'medidas.json'), 'utf8'));

const img = (dir, f, alt) => '<img src="data:image/jpeg;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64') + '" alt="' + alt + '">';
const par = (clase, maqueta, hoy, alt, nota) =>
  '<div class="fotos ' + clase + '">' +
  '<figure><figcaption>Maqueta que elegiste</figcaption>' + img(MAQ, maqueta, alt + ' (maqueta)') + '</figure>' +
  '<figure><figcaption><b>App de hoy</b>' + (nota ? ' · ' + nota : '') + '</figcaption>' + img(HOY, hoy, alt + ' (app de hoy)') + '</figure>' +
  '</div>';
const sinScroll = (clave) => medidas[clave] != null && medidas[clave] <= 1 ? 'sin scroll' : (medidas[clave] != null ? medidas[clave] + ' px de scroll' : '');

const SECCIONES = [
  { cod: 'foco-1', h: 'Tocar otros minutos con un bloque empezado pregunta antes',
    p: 'Con el bloque por el minuto 20, tocar «35» pregunta «¿Cambiar a un bloque de 35 min?» con el texto y los botones de la barra de arriba. «Seguir con el Foco» no toca nada.',
    fotos: [['movil', 'foco1-A-360.jpg', 'foco1-hoy-360.jpg', 'La pregunta antes de cambiar los minutos, a 360', '360'],
            ['ancho', 'foco1-A-1280.jpg', 'foco1-hoy-1280.jpg', 'La misma pregunta a 1280', '1280']] },
  { cod: 'foco-2', h: 'El bloque en pausa vuelve en pausa al recargar',
    p: 'Pausado en el minuto 12 y recargado: el aro sigue en pausa en el mismo punto, con «Continuar» y «Reiniciar bloque». Solo el mismo día.',
    fotos: [['movil', 'foco2-A-360.jpg', 'foco2-hoy-360.jpg', 'El aro en pausa tras recargar, a 360', '360 · ' + sinScroll('foco2-hoy-360')],
            ['ancho', 'foco2-A-1280.jpg', 'foco2-hoy-1280.jpg', 'El aro en pausa tras recargar, a 1280', '1280']] },
  { cod: 'foco-3', h: 'Un bloque que terminó con PACE cerrado cuenta al volver',
    p: 'Empezado, cerrado a los 5 minutos y vuelto a los 30: al volver se abre la pausa, y al cerrarla el aro dice «Empezar otro ciclo» y «Hoy» suma los 25 minutos.',
    fotos: [['movil', 'foco3-A-360.jpg', 'foco3-hoy-360.jpg', 'Al volver se abre la pausa, a 360', '360 · al volver'],
            ['movil', 'foco3-A-cerrada-360.jpg', 'foco3-hoy-cerrada-360.jpg', 'Tras cerrar la pausa, a 360', '360 · tras cerrar la pausa · ' + sinScroll('foco3-hoy-cerrada-360')],
            ['ancho', 'foco3-A-1280.jpg', 'foco3-hoy-1280.jpg', 'Al volver se abre la pausa, a 1280', '1280 · al volver'],
            ['ancho', 'foco3-A-cerrada-1280.jpg', 'foco3-hoy-cerrada-1280.jpg', 'Tras cerrar la pausa, a 1280', '1280 · tras cerrar la pausa']] },
  { cod: 'estado-5', h: 'Si el navegador no deja guardar, una barra abajo lo dice',
    p: 'Con el almacenamiento lleno, al sumar dos vasos sale abajo la barra con «Exportar una copia» y «Entendido», una vez por visita.',
    fotos: [['movil', 'estado5-A-360.jpg', 'estado5-hoy-360.jpg', 'La barra de aviso abajo, a 360', '360'],
            ['ancho', 'estado5-A-1280.jpg', 'estado5-hoy-1280.jpg', 'La barra de aviso abajo, a 1280', '1280']] },
];

const cuerpo = SECCIONES.map(s =>
  '<section><div class="cab"><h2>' + s.h + '</h2><span class="cod">' + s.cod + '</span></div>' +
  '<p class="texto">' + s.p + '</p>' +
  s.fotos.map(f => par(f[0], f[1], f[2], f[3], f[4])).join('') + '</section>').join('\n');

const extra = fs.existsSync(path.join(HOY, 'extra.html')) ? fs.readFileSync(path.join(HOY, 'extra.html'), 'utf8') : '';

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>La caza, en la app</title>
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
h1, h2 { font-family: var(--display); font-style: italic; font-weight: 500; margin: 0; text-wrap: balance; line-height: 1.12; }
h1 { font-size: clamp(32px, 6vw, 44px); }
h2 { font-size: clamp(23px, 4vw, 29px); }
p { margin: 0; max-width: 68ch; }
.meta { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); }
.lede { color: var(--ink-2); font-size: 17px; }
.intro { display: grid; gap: 14px; padding-bottom: 20px; }
.nota { display: grid; gap: 8px; padding: 14px 18px; border-left: 3px solid var(--focus); background: var(--paper-2); border-radius: 0 10px 10px 0; color: var(--ink-2); }
.nota b { color: var(--ink); }
section { display: grid; gap: 14px; padding-block: 30px 6px; border-top: 1px solid var(--line); }
.cab { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 14px; }
.cod { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); }
.texto { color: var(--ink-2); }
.fotos { display: grid; gap: 14px; align-items: start; }
.fotos.movil { grid-template-columns: repeat(2, minmax(0, 260px)); }
.fotos.ancho { grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); }
figure { margin: 0; display: grid; gap: 6px; min-width: 0; }
figcaption { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); }
figcaption b { color: var(--focus); font-weight: 600; }
img { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--paper-2); }
</style>
</head>
<body>
<main>
  <div class="intro">
    <span class="meta">PACE · caza del Foco y lo guardado · 12 de octubre de 2026</span>
    <h1>Las cuatro, en la app de verdad</h1>
    <p class="lede">El 12 de octubre elegiste la A en las cuatro mirando la maqueta. Estas fotos son de la app construida desde la rama de la caza, ya junta con la v0.156.0 de hoy. En cada pareja, a la izquierda la maqueta que elegiste y a la derecha la app de hoy, en el mismo momento y a 360 y a 1280 px.</p>
    ${extra}
  </div>
${cuerpo}
</main>
</body>
</html>
`;
fs.writeFileSync(SALIDA, html);
console.log('escrita', SALIDA, Math.round(html.length / 1024) + ' KB');
