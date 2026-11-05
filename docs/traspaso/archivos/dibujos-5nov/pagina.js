// La página «Rana y Palmas en la mesa» para Ez: los dos últimos dibujos de ejercicio al tamaño real de la app, en claro y
// en oscuro, cada uno junto a un vecino, lo medido y el texto de Palmas antes y después.
// Uso: node pagina.js <carpeta-de-fotos> <salida.html>. Antes: fotos.js <carpeta> (8856).
'use strict';
const fs = require('fs');
const path = require('path');
const W = path.resolve(__dirname, '..', '..', '..', '..');
const sharp = require(path.resolve(W, '..', '..', '..') + '/node_modules/sharp');
const { referencia, medirArchivo, DESTINO, PRIMER_PLANO } = require(W + '/scripts/glifos/medir-trazo.js');
const F = path.resolve(process.argv[2]) + '/';
const SALIDA = process.argv[3];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Una foto de la app a su tamaño real: el móvil se hizo a DPR 2, así que se enseña a la mitad de sus píxeles. */
async function foto(s, tono, w, que, alt) {
  const ruta = F + s + '_' + tono + '_' + w + '_' + que + '.png';
  if (!fs.existsSync(ruta)) return '<span class="falta">sin foto: ' + esc(path.basename(ruta)) + '</span>';
  const b = await sharp(ruta).webp({ quality: 80 }).toBuffer();
  const m = await sharp(b).metadata();
  const dpr = w < 700 ? 2 : 1;
  return '<img src="data:image/webp;base64,' + b.toString('base64') + '" alt="' + esc(alt) + '" width="' + Math.round(m.width / dpr) +
    '" height="' + Math.round(m.height / dpr) + '" loading="lazy">';
}

const CASOS = [
  { s: 'rana', nombre: 'Rana', donde: 'Estira · Caderas · suelo · paso 1 de 5',
    texto: 'A cuatro apoyos y de perfil, con la cadera atrás y una flecha hacia atrás que marca el balanceo. Es la que aprobaste del chat; hasta hoy la tarjeta de «Caderas · suelo» salía con el glifo por defecto.',
    vecino: ['gato-camello', 'Gato-camello', 'otro a cuatro apoyos'] },
  { s: 'palmas-en-la-mesa', nombre: 'Palmas en la mesa', donde: 'Estira · Manos y antebrazos · paso 4 de 5',
    texto: 'Las dos palmas apoyadas en la mesa y los dedos hacia delante. Sustituye al dibujo de las manos juntas que se confundía con «Rezo invertido».',
    vecino: ['estiramiento-de-muneca', 'Estiramiento de muñeca', 'el paso anterior de su rutina'] },
];

(async () => {
  const ref = await referencia(sharp, ['rana', 'palmas-en-la-mesa']);
  const pc = (k, v) => 'p' + ref.pct(k, v);
  const rana = await medirArchivo(sharp, path.join(DESTINO, 'rana.webp'));
  const palmas = await medirArchivo(sharp, path.join(DESTINO, 'palmas-en-la-mesa.webp'));
  const cerca = [];
  for (const s of PRIMER_PLANO) if (s !== 'palmas-en-la-mesa') cerca.push(await medirArchivo(sharp, path.join(DESTINO, s + '.webp')));
  const rango = (k) => { const v = cerca.map((r) => r[k]).sort((a, b) => a - b); return v[0].toFixed(1) + ' a ' + v[v.length - 1].toFixed(1) + ' (mediana ' + v[Math.floor(v.length / 2)].toFixed(1) + ')'; };

  let casos = '';
  for (const c of CASOS) {
    const [vs, vn] = c.vecino;
    const fila = async (w, titulo) => {
      const celdas = [];
      for (const [s, nom, rol] of [[c.s, c.nombre, 'nuevo'], [vs, vn, 'vecino']]) {
        for (const tono of ['claro', 'oscuro']) {
          celdas.push('<figure class="' + rol + '">' + await foto(s, tono, w, 'circulo', nom + ' en el runner, ' + tono + ', a ' + w + ' px') +
            '<figcaption>' + (rol === 'nuevo' ? '<b>' + esc(nom) + '</b>' : esc(nom)) + ' · ' + tono + '</figcaption></figure>');
        }
      }
      return '<div class="vista"><p class="etq">' + titulo + '</p><div class="cuatro">' + celdas.join('') + '</div></div>';
    };
    let tarjetas = '';
    for (const tono of ['claro', 'oscuro']) {
      tarjetas += '<figure>' + await foto(c.s, tono, 360, 'tarjeta', 'Tarjeta de ' + c.nombre + ' en la biblioteca, ' + tono) +
        '<figcaption>' + tono + '</figcaption></figure>';
    }
    casos += `
  <section class="bloque" id="${c.s}">
    <span class="num-caso">${esc(c.donde)}</span>
    <h2>${esc(c.nombre)}</h2>
    <p>${esc(c.texto)}</p>
    ${await fila(360, 'En el móvil, a 360 px · el nuevo y, a la derecha, ' + esc(c.vecino[2]) + ' (' + esc(vn) + ')')}
    ${await fila(1280, 'En el ordenador, a 1280 px')}
    <div class="vista"><p class="etq">La tarjeta de la biblioteca, en el móvil</p><div class="dos tarjetas">${tarjetas}</div></div>
  </section>`;
  }

  const html = `<title>Rana y Palmas en la mesa</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&family=Inter+Tight:wght@400;500;600&display=swap">
<!-- PACE · los dos últimos dibujos de ejercicio (5 nov. 2026) en la app de la rama claude/rana-y-palmas-88359b.
     Guiones en docs/traspaso/archivos/dibujos-5nov/. -->
<style>
  /* Una columna de lectura; cada dibujo, en el runner del móvil y del ordenador, en claro y en oscuro, con su vecino al lado. */
  :root {
    --paper: #F2EDE0; --paper-2: #EAE4D4; --ink: #1F1C17; --ink-2: #4A453C; --ink-3: #6F6858;
    --line: #C9C0A8; --cta: #50624D; --terracota: #A65A35; --cambio: #E9D8C2;
    --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, -apple-system, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
      --line: #4d4536; --cta: #8E9D88; --terracota: #D08A63; --cambio: #4a3a2a; color-scheme: dark; }
  }
  :root[data-theme="dark"] { --paper: #1d1a14; --paper-2: #26211a; --ink: #EDE5D3; --ink-2: #c0b49e; --ink-3: #B2A995;
    --line: #4d4536; --cta: #8E9D88; --terracota: #D08A63; --cambio: #4a3a2a; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.6 var(--ui); }
  .marco { max-width: 1040px; margin: 0 auto; padding-block: 28px 56px;
    padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
  .kicker { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 10px; }
  h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; text-wrap: balance; margin: 0; }
  h1 { font-size: clamp(38px, 8vw, 54px); line-height: 1.05; margin-bottom: 14px; }
  h2 { font-size: clamp(28px, 6vw, 34px); line-height: 1.1; margin-bottom: 12px; }
  p { margin: 0 0 12px; color: var(--ink-2); max-width: 42em; }
  b { color: var(--ink); font-weight: 600; }
  figure { margin: 0; min-width: 0; }
  img { display: block; max-width: 100%; height: auto; border: 1px solid var(--line); background: var(--paper-2); }
  figcaption { font-size: 13px; color: var(--ink-3); margin-top: 6px; }
  .falta { color: var(--terracota); font-size: 13px; }
  .pide { margin: 22px 0 8px; border: 1px solid var(--cta); border-radius: 14px; padding: 16px 18px 6px; max-width: 46em; }
  section.bloque { margin-top: 44px; padding-top: 32px; border-top: 1px solid var(--line); }
  .num-caso { font: italic 500 17px/1.3 var(--display); color: var(--cta); display: block; margin-bottom: 4px; }
  .vista { margin-top: 20px; }
  .etq { font: 500 11px/1.4 var(--ui); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin: 0 0 8px; max-width: none; }
  .cuatro { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), max-content)); gap: 16px 18px; align-items: start; }
  .cuatro figure.vecino { opacity: .92; }
  .dos { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), max-content)); gap: 14px; align-items: start; }
  table.texto { border-collapse: collapse; width: 100%; max-width: 62em; margin-top: 10px; font-size: 15px; }
  table.texto th, table.texto td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid var(--line); color: var(--ink-2); }
  table.texto thead th { font: 600 11px/1.4 var(--ui); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); }
  table.texto tbody th { font: 500 11px/1.4 var(--ui); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); width: 90px; }
  mark { background: var(--cambio); color: var(--ink); padding: 0 2px; border-radius: 3px; }
  .tabla-ancha { overflow-x: auto; }
  table.medidas { border-collapse: collapse; font-size: 14px; color: var(--ink-2); min-width: 420px; margin-top: 10px; }
  table.medidas th, table.medidas td { text-align: left; padding: 6px 10px; border-bottom: 1px solid var(--line); font-variant-numeric: tabular-nums; }
  table.medidas th { font-weight: 500; color: var(--ink); }
  table.medidas thead th { font-weight: 600; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); }
  details { margin-top: 14px; max-width: 62em; }
  summary { cursor: pointer; color: var(--ink-2); font-weight: 500; }
  ul.hecho { margin: 10px 0 0; padding-left: 20px; color: var(--ink-2); max-width: 46em; display: grid; gap: 6px; }
</style>
<div class="marco">
  <p class="kicker">Dibujos de ejercicio · 5 nov. 2026 · antes de juntar</p>
  <h1>Rana y Palmas en la mesa</h1>
  <div class="pide">
    <p class="kicker" style="margin-top:2px">Lo que necesito de ti</p>
    <p>Aprobaste los dos dibujos y el cambio de texto de <b>Palmas en la mesa</b>. Ya están en la app de la rama, con la misma ingesta que los catorce del 29 oct. Mira cómo salen abajo, al tamaño real, en claro y en oscuro, junto a un vecino.</p>
    <p>Si te valen, la rama queda lista para que la coordinadora la junte con tu «júntalo». Con ellos ya no falta ningún dibujo de ejercicio para subir la versión de prueba definitiva.</p>
  </div>
  ${casos}

  <section class="bloque" id="texto">
    <span class="num-caso">El texto, cambiado al dibujo</span>
    <h2>Palmas en la mesa, antes y después</h2>
    <p>El dibujo manda sobre el texto del paso. Con los dedos hacia delante el estirón es el mismo de la misma zona, más suave; cambia cómo se apoya la mano y hacia dónde se lleva el cuerpo.</p>
    <div class="tabla-ancha"><table class="texto">
      <thead><tr><th></th><th>Antes</th><th>Ahora</th></tr></thead>
      <tbody>
        <tr><th>Colocación</th><td>De pie frente a la mesa, palmas apoyadas y dedos <mark>hacia ti</mark>. Codos estirados, sin bloquear.</td><td>De pie frente a la mesa, palmas apoyadas y dedos <mark>hacia delante</mark>. Codos estirados, sin bloquear.</td></tr>
        <tr><th>Cómo</th><td>Lleva <mark>la cadera un poco atrás</mark>, despacio, hasta notar un estirón suave en el antebrazo.</td><td>Lleva <mark>el cuerpo un poco hacia delante</mark>, despacio, hasta notar un estirón suave en el antebrazo.</td></tr>
        <tr><th>Cuidado</th><td>Casi sin peso sobre las manos. Si molesta, <mark>sepárate un poco de la mesa</mark>.</td><td>Casi sin peso sobre las manos. Si molesta, <mark>vuelve un poco atrás</mark>.</td></tr>
        <tr><th>En «Tus rutinas»</th><td>Palmas sobre la mesa, dedos <mark>hacia ti</mark>.</td><td>Palmas sobre la mesa, dedos <mark>hacia delante</mark>.</td></tr>
      </tbody>
    </table></div>
    <details><summary>En inglés</summary>
      <div class="tabla-ancha"><table class="texto">
        <thead><tr><th></th><th>Antes</th><th>Ahora</th></tr></thead>
        <tbody>
          <tr><th>Setup</th><td>Stand facing the desk, palms flat, fingers pointing <mark>toward you</mark>. Elbows straight but not locked.</td><td>Stand facing the desk, palms flat, fingers pointing <mark>forward</mark>. Elbows straight but not locked.</td></tr>
          <tr><th>Action</th><td><mark>Move your hips back slightly</mark>, slowly, until you feel a gentle stretch in your forearm.</td><td><mark>Lean your body slightly forward</mark>, slowly, until you feel a gentle stretch in your forearm.</td></tr>
          <tr><th>Care</th><td>Hardly any weight on your hands. If it bothers you, <mark>step a little away from the desk</mark>.</td><td>Hardly any weight on your hands. If it bothers you, <mark>ease back a little</mark>.</td></tr>
          <tr><th>Custom</th><td>Palms on the desk, fingers <mark>toward you</mark>.</td><td>Palms on the desk, fingers <mark>pointing forward</mark>.</td></tr>
        </tbody>
      </table></div>
    </details>
    <p style="margin-top:12px">«Estiramiento de muñeca» sigue diciendo «llevando los dedos hacia ti con la otra mano»: es otro ejercicio y no cambia.</p>
  </section>

  <section class="bloque" id="medido">
    <span class="num-caso">Lo medido</span>
    <h2>Homogéneos con el set</h2>
    <p>Rana se mide contra los ${ref.filas.length} muñecos enteros del set, con la misma regla que los catorce del 29 oct.: el sombreado y el grosor del contorno quedan en la parte media del set, y la línea algo por encima de la mediana, como el resto de los de Genspark. Que tenga menos tinta en total es la postura: un cuerpo que va a cuatro apoyos, sin brazos en alto.</p>
    <p>Palmas son manos de cerca y no se comparan con los cuerpos enteros: se miden contra los otros ${cerca.length} primeros planos del set (manos, cuello, tobillos), y caen dentro de su rango.</p>
    <div class="tabla-ancha"><table class="medidas">
      <thead><tr><th>Dibujo</th><th>Tinta</th><th>Sombreado</th><th>Línea</th><th>Grosor</th></tr></thead>
      <tbody>
        <tr><th>Rana · percentil entre cuerpos enteros</th><td>${pc('tinta', rana.tinta)}</td><td>${pc('rayado', rana.rayado)}</td><td>${pc('linea', rana.linea)}</td><td>${pc('grosor', rana.grosor)}</td></tr>
        <tr><th>Palmas en la mesa · valor</th><td>${palmas.tinta.toFixed(1)}</td><td>${palmas.rayado.toFixed(1)}</td><td>${palmas.linea.toFixed(1)}</td><td>${palmas.grosor.toFixed(2)}</td></tr>
        <tr><th>Primeros planos · rango</th><td>${rango('tinta')}</td><td>${rango('rayado')}</td><td>${rango('linea')}</td><td>${rango('grosor')}</td></tr>
      </tbody>
    </table></div>
    <details><summary>Lo que se ha hecho en la rama</summary>
      <ul class="hecho">
        <li>Los dos dibujos, pasados a .png y por la ingesta de siempre (la que lee solo .png), sin retocar a mano. El de Palmas sustituye a <code>palmas-al-suelo</code>, que se ha borrado con su miniatura.</li>
        <li>El texto de Palmas, en español e inglés, y su frase corta del constructor, en los dos nombres que tiene (Palmas en la mesa y el antiguo Palmas al suelo).</li>
        <li><code>npm run verify</code> en verde y las pruebas de dibujos y de Mueve y Estira. No se ha lanzado la suite entera.</li>
        <li>Sin subir la versión: el número y los cambios de STATE y CHANGELOG los pone quien junte la rama.</li>
      </ul>
    </details>
  </section>
</div>`;
  fs.writeFileSync(SALIDA, html);
  console.log('página escrita:', SALIDA, Math.round(html.length / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exit(1); });
