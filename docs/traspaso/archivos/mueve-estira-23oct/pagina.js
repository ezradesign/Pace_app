// Página para Ez: Mueve y Estira tal como están, y el texto para ChatGPT.
// Uso: node pagina.js <inventario.json> <salida.html> <salida-prompt.md>
'use strict';
const fs = require('fs');
const [, , ENTRADA, HTML, PROMPT] = process.argv;
const d = JSON.parse(fs.readFileSync(ENTRADA, 'utf8'));
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Lo que Ez vio en su móvil el 23 oct.: dibujos que no casan con su ejercicio. */
const NO_CASA = {
  'Hueco en silla': 'El dibujo de «Core silencioso» no casa.',
  'Sentadilla de cuádriceps': 'Parece un estiramiento de cuádriceps en el suelo. El dibujo vale para un estiramiento nuevo.',
  'Rodar hacia abajo': 'No casa. Tienes uno que sí: pásamelo.',
  'Gato-camello': 'Puede mejorar mucho.',
  'Puente torácico': 'Sale a dos niveles, no en el suelo.',
  '90/90': 'Se ve raro y se confunde con «Paloma».',
  'Sentarse y levantarse del suelo': 'No enseña eso. El dibujo vale para otro ejercicio.',
};
const MATERIAL_EJ = /banda|Suspensi[oó]n/i;
const MATERIAL = { stableDesk: 'mesa', stableChair: 'silla', wall: 'pared', wallOptional: 'pared, si quieres', deskOptional: 'mesa, si quieres',
  cushionOptional: 'cojín, si quieres', bar: 'barra', barOptional: 'barra, si quieres' };
const modulosDe = (nombre) => new Set((d.usos[nombre] || []).map((u) => u.split(' · ')[0]));

function dosis(e) {
  const una = e.modo === 'reps' ? (e.reps || '?') + ' rep.' : (e.dur || '?') + ' s' + (e.modo === 'perSide' ? ' por lado' : '');
  return e.series > 1 ? e.series + ' series · ' + una : una;
}

function rutinaHtml(r) {
  const otro = r.modulo === 'Mueve' ? 'Estira' : 'Mueve';
  const mat = r.material.map((m) => MATERIAL[m] || m);
  if (r.suelo) mat.push('suelo');
  const ejercicios = r.ejercicios.map((e) => {
    const marcas = [];
    if (NO_CASA[e.nombre]) marcas.push('<span class="marca nocasa" title="' + esc(NO_CASA[e.nombre]) + '">dibujo que no casa</span>');
    if (e.dibujo.tipo !== 'dibujo') marcas.push('<span class="marca sin">sin dibujo propio</span>');
    if (modulosDe(e.nombre).has(otro)) marcas.push('<span class="marca otro">también en ' + otro + '</span>');
    if (MATERIAL_EJ.test(e.nombre)) marcas.push('<span class="marca mat">con material</span>');
    const veces = (d.usos[e.nombre] || []).length;
    if (veces >= 3) marcas.push('<span class="marca rep">en ' + veces + ' rutinas</span>');
    const nota = NO_CASA[e.nombre] ? '<span class="nota-ej">' + esc(NO_CASA[e.nombre]) + '</span>' : '';
    return '<li><span class="ej">' + esc(e.nombre) + '</span> <span class="dosis">' + esc(dosis(e)) + '</span>' +
      (marcas.length ? ' <span class="marcas">' + marcas.join('') + '</span>' : '') + nota + '</li>';
  }).join('');
  return '<article class="rutina"><header><h4>' + esc(r.titulo) + '</h4><span class="acceso ' + (r.acceso === 'premium' ? 'pago' : 'gratis') + '">' +
    (r.acceso === 'premium' ? 'PACE completo' : 'Gratis') + '</span></header>' +
    '<p class="meta">' + esc(r.min) + ' min' + (mat.length ? ' · ' + esc(mat.join(', ')) : '') + '</p>' +
    (r.desc ? '<p class="desc">' + esc(r.desc) + '</p>' : '') + '<ul class="ejs">' + ejercicios + '</ul></article>';
}

function moduloHtml(modulo, sub) {
  const rs = d.rutinas.filter((r) => r.modulo === modulo);
  const cats = [...new Set(rs.map((r) => r.categoria))];
  return '<section><h2>' + modulo + '</h2><p class="nota">' + sub + '</p>' + cats.map((c) =>
    '<div class="cat"><h3>' + esc(c) + '</h3><div class="rutinas">' + rs.filter((r) => r.categoria === c).map(rutinaHtml).join('') + '</div></div>').join('') + '</section>';
}

/* El texto para ChatGPT lleva el catálogo entero en líneas cortas. */
function lineaCatalogo(r) {
  const mat = r.material.map((m) => MATERIAL[m] || m);
  if (r.suelo) mat.push('suelo');
  return '- ' + r.modulo + ' · ' + r.categoria + ' · «' + r.titulo + '» (' + (r.acceso === 'premium' ? 'de pago' : 'gratis') + ', ' + r.min + ' min' +
    (mat.length ? ', ' + mat.join(', ') : '') + '): ' + r.ejercicios.map((e) => e.nombre + ' [' + dosis(e) + ']').join('; ');
}
const nombres = [...new Set(d.rutinas.flatMap((r) => r.ejercicios.map((e) => e.nombre)))].sort((a, b) => a.localeCompare(b, 'es'));
const minutos = d.rutinas.map((r) => r.min);
const prompt = `Eres especialista en ejercicio para gente que trabaja sentada (fisioterapia, fuerza y movilidad). Te paso el catálogo actual de PACE, una app de pausas activas para quien teletrabaja: entre bloques de trabajo propone pausas de ${Math.min(...minutos)} a ${Math.max(...minutos)} minutos. Tiene dos módulos de ejercicio:

- MUEVE: fuerza en una habitación o junto a la mesa, estilo calistenia sencilla y sin tecnicismos (sentadillas, flexiones, abdominales, zancadas, puentes...). Sin objetos.
- ESTIRA: estiramientos y movilidad, casi como yoga o pilates.

Material: todo el mundo tiene una silla estable, una mesa y una pared, y eso vale en cualquier rutina. Banda elástica, barra u otros objetos son un extra: van en rutinas aparte («con material»), y cada ejercicio con material necesita una alternativa sin él, para poder saltarlo sin perder la rutina.

Problemas que vemos en el catálogo actual (abajo):
1. Mueve tiene estiramientos que ya están en Estira (apertura de pecho, juntar omóplatos, muñecas...).
2. Muchas rutinas con títulos distintos repiten casi los mismos ejercicios.
3. A Mueve le falta fuerza de verdad.
4. Hay ejercicios con barra o banda mezclados con los de escritorio.

Lo que te pido:
A. Una revisión del catálogo actual: qué ejercicio está en el módulo equivocado, qué rutinas sobran o se solapan, y cualquier problema de técnica o de seguridad que veas.
B. Un catálogo nuevo para cada módulo, de un tamaño parecido al de ahora (Mueve ${d.rutinas.filter((r) => r.modulo === 'Mueve').length} rutinas, Estira ${d.rutinas.filter((r) => r.modulo === 'Estira').length}; puedes proponer otra cifra si lo justificas), donde cada rutina tenga un propósito propio y distinto. Para cada rutina: título corto (tres palabras como mucho), para qué sirve en una frase, minutos (de ${Math.min(...minutos)} a ${Math.max(...minutos)}), postura (sentado, de pie o suelo), material (ninguno, silla, mesa o pared; o «con material») y de 2 a 5 ejercicios. Para cada ejercicio: nombre, modo (repeticiones, tiempo o por lado), dosis (series y repeticiones o segundos), cómo colocarse, cómo hacerlo y un cuidado. Más o menos la mitad de las rutinas, gratis, con lo más básico en gratis; marca las de pago.
C. Reutiliza los ejercicios que ya existen (lista al final) siempre que tenga sentido, y marca como NUEVO los que no estén: cada ejercicio nuevo necesita un dibujo. Para cada NUEVO, una línea para quien lo dibuja: la postura clave, si se ve mejor de frente o de lado y qué parte del cuerpo se mueve.
D. Que un ejercicio salga en dos rutinas está bien de vez en cuando; dime cuántas veces se repite cada uno en tu propuesta.

Reglas: nada de consejos médicos; lenguaje llano, en español de España y tuteando; dosis prudentes para alguien que no entrena; sin saltos ni nada que haga ruido o pida mucho espacio; en Estira, nada de posturas de yoga avanzadas.

Formato: primero la revisión (A); después una tabla por módulo (B); después la lista de ejercicios NUEVOS (C); y al final el recuento de repeticiones (D).

CATÁLOGO ACTUAL (módulo · categoría · «rutina» (acceso, minutos, material): ejercicios [dosis])
${d.rutinas.map(lineaCatalogo).join('\n')}

EJERCICIOS QUE YA EXISTEN (${nombres.length})
${nombres.join(' · ')}
`;
fs.writeFileSync(PROMPT, '# Mueve y Estira: el texto para ChatGPT (23 oct. 2026)\n\nLo genera el inventario de `mueve-estira-inventario-23oct.html`. Ez lo pega en ChatGPT y trae la respuesta entera; cada ejercicio que proponga se comprueba antes de creerlo.\n\n```text\n' + prompt + '```\n');

/* La segunda pregunta: el texto real de cada ejercicio, tal como lo lee la persona en la app, para que
   ChatGPT haga la ficha de cada uno sobre lo que hay y no sobre el nombre. La primera vez de cada
   ejercicio en el catálogo trae su colocación; si no, se busca en otra rutina. */
const fichas = new Map();
for (const r of d.rutinas) for (const e of r.ejercicios) {
  const f = fichas.get(e.nombre) || { nombre: e.nombre, modulos: new Set(), rutinas: [], dosis: [], colocacion: '', como: '', cuidado: '' };
  f.modulos.add(r.modulo); f.rutinas.push('«' + r.titulo + '»'); f.dosis.push(dosis(e));
  for (const k of ['colocacion', 'como', 'cuidado']) if (!f[k] && e[k]) f[k] = e[k];
  fichas.set(e.nombre, f);
}
const lineaFicha = (f) => '- ' + f.nombre + ' (hoy en ' + [...f.modulos].join(' y ') + '; rutinas: ' + f.rutinas.join(', ') + ') · dosis: ' +
  [...new Set(f.dosis)].join(' / ') + (f.colocacion ? ' · Colocación: ' + f.colocacion : '') + (f.como ? ' · Cómo: ' + f.como : '') +
  (f.cuidado ? ' · Cuidado: ' + f.cuidado : '');
const lista = [...fichas.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
const prompt2 = `Gracias. Seguimos con tu propuesta corregida: tres capas (pausas recomendadas, catálogo libre y rutinas de progresión), dificultad y acceso como etiquetas separadas, y no se retira ningún ejercicio que supere la revisión. Ahora te paso el texto real de cada uno de nuestros ${lista.length} ejercicios, tal como lo lee la persona en la app (colocación, cómo hacerlo y cuidado). Te pido tres cosas:

1. LA FICHA DE CADA EJERCICIO, en una tabla con una fila por ejercicio: módulo (Mueve o Estira), capa (pausa recomendada, catálogo libre o progresión), dificultad (1 suave, 2 media, 3 exigente), qué exige (fuerza, movilidad, equilibrio o apoyo en manos), posición (sentado, de pie o suelo), material (ninguno, silla, mesa, pared, banda o barra), por dónde empezar (una versión más fácil o un ejercicio previo, mejor si es de esta misma lista), cómo graduarlo, y si nuestro texto tiene un error de técnica o de seguridad, o es ambiguo, la corrección en una frase. Si el texto describe un movimiento distinto del que sugiere el nombre, dilo (sospechamos de «Hueco en silla», «Puente torácico» y «Sentadilla de cuádriceps»).
2. LAS PAUSAS RECOMENDADAS, rehechas usando sobre todo estos ejercicios: cuántas, con qué ejercicios y con qué dosis de entrada.
3. LOS HUECOS DE VERDAD: de los 22 ejercicios nuevos que propusiste, cuáles siguen haciendo falta después de esto y por qué, ordenados de más a menos necesario, con el hueco que cubre cada uno.

Mismas reglas que antes: nada de consejos médicos; lenguaje llano, en español de España y tuteando; dosis prudentes para alguien que no entrena.

NUESTROS EJERCICIOS, CON SU TEXTO DE HOY
${lista.map(lineaFicha).join('\n')}
`;
fs.writeFileSync(PROMPT.replace(/chatgpt-23oct\.md$/, 'chatgpt-2-23oct.md'), '# Mueve y Estira: la segunda pregunta para ChatGPT (23 oct. 2026)\n\nTras su segunda respuesta (tres capas, no se retira nada que pase la revisión). Lleva el texto real de cada ejercicio para que haga su ficha, rehaga las pausas recomendadas con lo que hay y diga cuáles de sus 22 nuevos hacen falta de verdad.\n\n```text\n' + prompt2 + '```\n');

const total = (m) => d.rutinas.filter((r) => r.modulo === m).length;
const enLosDos = Object.entries(d.usos).filter(([n]) => modulosDe(n).size > 1).length;
const parejas = d.parejas.map((p) => '<li><b>' + esc(p.a) + '</b> y <b>' + esc(p.b) + '</b> <span class="dosis">comparten ' + p.parte + ' %: ' + esc(p.comunes.join(', ')) + '</span></li>').join('');

const html = `<title>Mueve y Estira, inventario</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<style>
/* Una columna de lectura, como la hoja de pasos de Ez: arriba lo que tiene que hacer, debajo cada rutina con
   sus marcas, y al final el texto para ChatGPT. Colores y letras, los de la app (DESIGN_SYSTEM.md). */
:root {
  --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F695B;
  --line: #D6CDB6; --focus: #3E5A3A; --breathe: #9E4F33; --move: #7D6240; --extra: #56657A;
  --ahora: rgba(158, 79, 51, 0.09);
  --serif: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --sans: 'Inter Tight', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
  --line: #4d4536; --focus: #98B58B; --breathe: #E8A98F; --move: #C9A877; --extra: #9DAFC6;
  --ahora: rgba(232, 169, 143, 0.12); color-scheme: dark; } }
:root[data-theme="dark"] {
  --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
  --line: #4d4536; --focus: #98B58B; --breathe: #E8A98F; --move: #C9A877; --extra: #9DAFC6;
  --ahora: rgba(232, 169, 143, 0.12); color-scheme: dark; }
* { box-sizing: border-box; }
body { background: var(--paper); color: var(--ink); font-family: var(--sans); font-size: 16px; line-height: 1.55; }
.hoja { max-width: 860px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 36px 64px; display: flex; flex-direction: column; gap: 44px; }
h1, h2, h4 { font-family: var(--serif); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
h1 { font-size: clamp(38px, 8vw, 54px); line-height: 1.02; }
h2 { font-size: 34px; line-height: 1.1; }
h3 { margin: 0; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); font-weight: 500; }
h4 { font-size: 22px; line-height: 1.15; }
p { margin: 0; max-width: 66ch; color: var(--ink-2); }
b { color: var(--ink); font-weight: 600; }
.eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-3); }
header, section { display: flex; flex-direction: column; gap: 14px; }
.nota { font-size: 14px; color: var(--ink-3); }
.paso { background: var(--ahora); border: 1px solid var(--breathe); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
.paso ol { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; color: var(--ink-2); }
.cifras { display: flex; flex-wrap: wrap; gap: 8px 22px; font-size: 15px; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.cifras b { font-family: var(--serif); font-style: italic; font-size: 24px; font-weight: 500; }
.leyenda { display: flex; flex-wrap: wrap; gap: 6px; }
.cat { display: flex; flex-direction: column; gap: 10px; padding-top: 14px; border-top: 1px solid var(--line); }
.rutinas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (max-width: 680px) { .rutinas { grid-template-columns: minmax(0, 1fr); } }
.rutina { background: var(--paper-2); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.rutina header { flex-direction: row; justify-content: space-between; align-items: baseline; gap: 10px; }
.acceso { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; white-space: nowrap; }
.acceso.gratis { color: var(--focus); } .acceso.pago { color: var(--ink-3); }
.meta { font-size: 13px; color: var(--ink-3); } .desc { font-size: 14px; }
.ejs { margin: 4px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; font-size: 15px; }
.ej { color: var(--ink); font-weight: 500; }
.dosis { color: var(--ink-3); font-size: 13px; font-variant-numeric: tabular-nums; }
.marcas { display: inline-flex; flex-wrap: wrap; gap: 4px; vertical-align: middle; }
.marca { font-size: 11px; line-height: 1.5; padding: 0 7px; border-radius: 999px; border: 1px solid currentColor; white-space: nowrap; }
.marca.nocasa { color: var(--breathe); } .marca.otro { color: var(--extra); } .marca.mat { color: var(--move); }
.marca.sin, .marca.rep { color: var(--ink-3); }
.nota-ej { display: block; font-size: 13px; color: var(--breathe); }
ul.lista { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; color: var(--ink-2); }
.copiar { align-self: flex-start; font: 500 italic 19px var(--serif); color: var(--paper); background: var(--focus); border: 0; border-radius: 999px; padding: 8px 22px; cursor: pointer; }
.copiar:focus-visible { outline: 2px solid var(--breathe); outline-offset: 3px; }
.texto { margin: 0; max-height: 420px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font: 13px/1.5 ui-monospace, 'Cascadia Mono', Consolas, monospace; background: var(--paper-2); border: 1px solid var(--line); border-radius: 10px; padding: 14px; color: var(--ink-2); }
.copiado { font-size: 14px; color: var(--focus); }
</style>
<main class="hoja">
  <header>
    <div class="eyebrow">PACE · Mueve y Estira · 23 de octubre</div>
    <h1>Mueve y Estira, tal como están</h1>
    <p>Todas las rutinas de los dos módulos, con sus ejercicios. Lo marcado es lo que viste en tu móvil o lo que se repite.
      Estira debería ser solo estiramientos, casi yoga o pilates; Mueve, fuerza en un cuarto y sin objetos.</p>
  </header>

  <div class="paso">
    <h3>Tu paso, ahora</h3>
    <ol>
      <li>En la misma conversación de ChatGPT, copia y pega <b>la segunda pregunta</b> (abajo del todo, con su botón).</li>
      <li>Pásame su respuesta entera. Con ella te preparo la página para elegir el Mueve y el Estira nuevos.</li>
    </ol>
    <p class="nota">La primera pregunta ya está contestada: está guardada, junto con la corrección que le pediste.</p>
    <p class="nota">Y cuando puedas, déjame el dibujo de «Rodar hacia abajo» que dices que sí casa en <code>Pace_app\\dibujos-22oct</code>.</p>
  </div>

  <section>
    <h2>De un vistazo</h2>
    <div class="cifras">
      <span><b>${total('Mueve')}</b> rutinas en Mueve</span>
      <span><b>${total('Estira')}</b> en Estira</span>
      <span><b>${nombres.length}</b> ejercicios distintos</span>
      <span><b>${enLosDos}</b> ejercicios en los dos módulos</span>
      <span><b>${d.parejas.length}</b> parejas de rutinas que comparten la mitad o más</span>
    </div>
    <div class="leyenda" aria-label="Qué quiere decir cada marca">
      <span class="marca nocasa">dibujo que no casa</span><span class="marca otro">también en el otro módulo</span>
      <span class="marca mat">con material</span><span class="marca rep">en 3 rutinas o más</span><span class="marca sin">sin dibujo propio</span>
    </div>
  </section>

  ${moduloHtml('Mueve', 'Fuerza en un cuarto, sin objetos. Hoy tiene pocas rutinas de fuerza de verdad y varias de estiramiento.')}
  ${moduloHtml('Estira', 'Estiramientos y movilidad. Dos rutinas piden barra.')}

  <section>
    <h2>Rutinas casi iguales</h2>
    <p class="nota">Parejas que comparten la mitad o más de sus ejercicios (contando sobre la rutina más corta).</p>
    <ul class="lista">${parejas}</ul>
  </section>

  <section>
    <h2>La segunda pregunta para ChatGPT</h2>
    <p>Para pegar en la misma conversación. Lleva el texto de hoy de cada uno de los ${lista.length} ejercicios y le pide su ficha,
      las pausas sencillas hechas con lo que ya hay y cuáles de sus 22 ejercicios nuevos hacen falta de verdad.</p>
    <button class="copiar" type="button" data-copiar="texto2">Copiar la segunda pregunta</button>
    <span class="copiado" role="status" aria-live="polite"></span>
    <pre class="texto" id="texto2">${esc(prompt2)}</pre>
  </section>

  <section>
    <h2>La primera pregunta, ya contestada</h2>
    <p class="nota">Lleva lo que buscas en cada módulo, lo que viste, el catálogo entero y lo que le pedimos que devuelva.</p>
    <button class="copiar" type="button" data-copiar="texto">Copiar la primera pregunta</button>
    <span class="copiado" role="status" aria-live="polite"></span>
    <pre class="texto" id="texto">${esc(prompt)}</pre>
  </section>
</main>
<script>
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-copiar]'), function (boton) {
    var texto = document.getElementById(boton.getAttribute('data-copiar'));
    var aviso = boton.nextElementSibling;
    function seleccionar() {
      var r = document.createRange(); r.selectNodeContents(texto);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      aviso.textContent = 'Seleccionado: cópialo con el menú o con Ctrl+C.';
    }
    boton.addEventListener('click', function () {
      try {
        navigator.clipboard.writeText(texto.textContent).then(function () { aviso.textContent = 'Copiado. Pégalo en ChatGPT.'; }, seleccionar);
      } catch (e) { seleccionar(); }
    });
  });
})();
</script>
`;
fs.writeFileSync(HTML, html);
console.log('página', Buffer.byteLength(html), 'bytes · texto para ChatGPT', prompt.length, 'caracteres');
