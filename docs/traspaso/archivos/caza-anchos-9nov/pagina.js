/* La página para Ez de la caza de los seis anchos. Uso: node pagina.js <carpeta de fotos> <salida.html> */
'use strict';
const fs = require('fs');
const path = require('path');
const [dir, salida] = process.argv.slice(2);
const img = (f, alt) => '<img src="data:image/jpeg;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64') + '" alt="' + alt + '">';
const html = `<title>Caza de los anchos</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Inter+Tight:wght@400;500&display=swap">
<style>
/* Una hoja de cuaderno de PACE: título en cursiva, fichas por arreglo y por pregunta, fotos de la app. */
:root { --papel: #F2EDE0; --papel-2: #E8E1CF; --tinta: #1F1C17; --tinta-2: #5E574A; --oliva: #3E5A3A; --linea: #D6CDB8;
  --display: 'Cormorant Garamond', Georgia, serif; --ui: 'Inter Tight', system-ui, sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --papel: #1d1a14; --papel-2: #29251c; --tinta: #EDE6D4; --tinta-2: #B3AA96; --oliva: #9DBB8F; --linea: #3d372b; color-scheme: dark; } }
:root[data-theme="dark"] { --papel: #1d1a14; --papel-2: #29251c; --tinta: #EDE6D4; --tinta-2: #B3AA96; --oliva: #9DBB8F; --linea: #3d372b; color-scheme: dark; }
body { background: var(--papel); color: var(--tinta); font: 16px/1.55 var(--ui); }
main { max-width: 760px; margin: 0 auto; padding-block: 32px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 28px; }
h1, h2, h3 { font-family: var(--display); font-style: italic; font-weight: 500; margin: 0; text-wrap: balance; }
h1 { font-size: 38px; line-height: 1.1; } h2 { font-size: 27px; } h3 { font-size: 21px; }
p { margin: 0; max-width: 65ch; }
.meta { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--tinta-2); }
section { display: grid; gap: 14px; }
.ficha { border-top: 1px solid var(--linea); padding-top: 16px; display: grid; gap: 10px; }
.par { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
figure { margin: 0; display: grid; gap: 6px; min-width: 0; }
figure img { width: 100%; height: auto; border: 1px solid var(--linea); border-radius: 6px; display: block; }
figcaption { font-size: 13px; color: var(--tinta-2); }
.letra { font-family: var(--ui); font-weight: 500; font-style: normal; color: var(--oliva); margin-right: 6px; }
.recom { display: inline-block; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; border: 1px solid var(--oliva); color: var(--oliva); border-radius: 999px; padding: 1px 8px; margin-left: 6px; vertical-align: 2px; }
code { font-size: 14px; background: var(--papel-2); padding: 0 4px; border-radius: 3px; }
ul { margin: 0; padding-left: 20px; display: grid; gap: 4px; }
</style>
<main>
  <header style="display:grid;gap:8px">
    <p class="meta">Para Ez · 9 de noviembre · lo que lleva la 0.195.0</p>
    <h1>Caza de los anchos</h1>
    <p>He mirado todas las pantallas de PACE en siete tamaños (de un móvil de 320 px a tu ventana de 1536), en castellano y en inglés, en claro y en oscuro: 140 recorridos, medidos con la página y no solo a ojo. Ya incluye lo de la jornada y lo de «Tus rutinas» que eligiste el 8.</p>
  </header>

  <section>
    <h2>Lo arreglado</h2>
    <div class="ficha">
      <h3>«Crear rutina» se quedaba cortado en el ordenador</h3>
      <p>En Mueve y Estira, con rutinas tuyas, la columna de la izquierda es más alta que tu ventana. Se quedaba quieta al bajar, así que «+ Crear rutina» y las últimas rutinas no se veían hasta el final del catálogo, ni llegando con el teclado. Ahora, si no cabe, la columna baja con el catálogo hasta enseñar su final y ahí se queda. Si cabe, todo sigue igual.</p>
      <div class="par">
        <figure>${img('lateral-antes.jpg', 'Antes: la columna no deja ver Crear rutina')}<figcaption>Antes, tras bajar un poco: «Crear rutina» sigue debajo del borde.</figcaption></figure>
        <figure>${img('lateral-ahora.jpg', 'Ahora: Crear rutina a la vista')}<figcaption>Ahora, en el mismo sitio: se ve entero, y debajo «Para ahora».</figcaption></figure>
      </div>
    </div>
    <div class="ficha">
      <h3>El día libre, en inglés, repetía su nombre</h3>
      <p>En la bienvenida en inglés decía <code>No plan, no plan: PACE leaves you be</code>. Ahora dice <code>No plan: PACE leaves you be</code>. En castellano no cambia nada.</p>
    </div>
    <p class="meta">Los dos llevan su prueba, y la prueba falla si se quita el arreglo.</p>
  </section>

  <section>
    <h2>Lo que espera a tu letra</h2>
    <div class="ficha">
      <h3><span class="letra">1</span>«1 h» se queda sola en una línea</h3>
      <p>En el móvil, a 360 px y en castellano, la frase del día parte justo antes de la hora de comer y deja «1 h» sola debajo. En inglés cabe en una línea.</p>
      <div class="par">
        <figure>${img('op-1A-equilibrada-es.jpg', 'Opción 1A')}<figcaption><span class="letra">1A</span>Repartir la frase en dos líneas parecidas.<span class="recom">recomendada</span></figcaption></figure>
        <figure>${img('op-1-hoy-es.jpg', 'Opción 1B, como hoy')}<figcaption><span class="letra">1B</span>Como hoy.</figcaption></figure>
      </div>
      <p>Recomiendo la 1A: la frase se lee de un tirón y la tarjeta no crece.</p>
    </div>
    <div class="ficha">
      <h3><span class="letra">2</span>Los móviles muy pequeños (320 px)</h3>
      <p>A 320 px ya aceptaste que la home pida un poco de scroll. Pasa lo mismo en otros tres sitios:</p>
      <ul>
        <li>los Ajustes piden de 58 a 101 px de scroll (a 360 px no piden nada);</li>
        <li>la fila «Ahora» corta su línea pequeña con «…» («2 min · Hombros: sin mo…»);</li>
        <li>los filtros de Mueve y Estira se deslizan de lado.</li>
      </ul>
      <p><span class="letra">2A</span>Dejarlo así, como la home a 320 px.<span class="recom">recomendada</span> <span class="letra" style="margin-left:10px">2B</span>Apretar esas tres cosas también a 320 px (te lo pintaría antes).</p>
    </div>
  </section>

  <section>
    <h2>Lo que estaba bien</h2>
    <p>Desde 360 px, en los dos idiomas y los dos temas: la home y los Ajustes del móvil sin scroll, nada que se corte, se pise o se salga de lado, y el teclado sin perderse en la bienvenida, la jornada a las 8:50, 12:10, 17:40 y 19:30, la ventana de la pausa, la barra que pregunta, el runner, la carta del lunes, el calendario, Respira con la apnea, Mueve, Estira, Hidrátate, Estadísticas, Logros, «Tus rutinas», Ajustes, /premium y /beta.</p>
  </section>
</main>`;
fs.writeFileSync(salida, html);
console.log(salida, Math.round(html.length / 1024) + ' KB');
