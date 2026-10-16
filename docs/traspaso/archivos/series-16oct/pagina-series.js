/* PACE · la página para Ez: las series montadas (16 oct. 2026)
   Uso, después de fotos-series.js:
     node docs/traspaso/archivos/series-16oct/pagina-series.js
   Escribe series.html con las fotos dentro, para publicarla como Artifact (el visor de Ez
   no abre HTML de más de 512 KB). */
'use strict';
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, 'fotos');
const img = (n) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(F, n + '.jpg')).toString('base64');
const css = fs.readFileSync(path.join(__dirname, 'aro-corto.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/)[0];

const html = `<title>Las series, montadas</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Inter+Tight:wght@400;500;600&display=swap">
${css}
<main class="hoja">
  <header style="display:flex;flex-direction:column;gap:12px">
    <div class="eyebrow">PACE · «A tu ritmo» · 16 oct. 2026</div>
    <h1>Las pausas con lógica, ya en la app</h1>
    <p>Lo que elegiste el 15 de octubre está montado: <b>las series con lógica</b>, <b>la frase de lo de hoy</b>
      encima del nombre, <b>Piernas de pie</b>, <b>Espalda de pie</b> y <b>la mesa</b> en el catálogo (sin el
      paseo), y la primera capa de «PACE que aprende», gratis. Son fotos de la app real del miércoles 14.</p>
  </header>

  <section>
    <h2>La pausa dice por qué te toca</h2>
    <p>«Dos horas» desde las 9:00. El martes la primera pausa fue Piernas de pie, así que el miércoles
      toca otra cosa de pie: <b>Flexiones de escritorio</b>, con <b>«Hombros: sin mover hoy»</b> encima del nombre.</p>
    <div class="par">
      <figure class="mov"><img src="${img('mov-pausa-es')}" alt="La pausa de las 9:35 en el móvil: Hombros, sin mover hoy, encima de Flexiones de escritorio"><figcaption>Móvil, 360 px</figcaption></figure>
      <figure><img src="${img('esc-pausa-es')}" alt="La misma pausa en el escritorio"><figcaption>Escritorio, 1280 px</figcaption></figure>
    </div>
  </section>

  <section>
    <h2>En inglés, en una línea</h2>
    <p>Las dos frases que se partían a 360 px van más cortas: «Shoulders: unmoved today» y «Two hours:
      off the chair». Una prueba mide todas las frases en los dos idiomas.</p>
    <figure class="mov"><img src="${img('mov-pausa-en')}" alt="La pausa en inglés: Shoulders, unmoved today"><figcaption>Móvil, en inglés</figcaption></figure>
  </section>

  <section>
    <h2>La jornada entera</h2>
    <p>Cada parada dice lo suyo: la zona que hoy no has movido, «Llevas 95 min sentado» cuando la de
      antes fue sentada, «Después de comer, de pie» y «Para cerrar, despacio». El cierre rota entre los
      Respira lentos.</p>
    <div class="par">
      <figure class="mov"><img src="${img('mov-dia')}" alt="La hoja Ver todo de la jornada con la frase de cada parada"><figcaption>Móvil, «Ver todo»</figcaption></figure>
      <figure><img src="${img('esc-dia')}" alt="La línea de la jornada en el escritorio"><figcaption>Escritorio, la línea del día</figcaption></figure>
    </div>
  </section>

  <section>
    <h2>Cómo queda, medido</h2>
    <p>Treinta días laborables desde el 12 de octubre, de 9:00 a 17:00, sin PACE completo:</p>
    <table class="tabla">
      <tr><td></td><td><b>Antes</b></td><td><b>Ahora</b></td></tr>
      <tr><td>Pausas de pie, «Dos horas»</td><td>12 %</td><td>50 %</td></tr>
      <tr><td>Pausas de pie, jornada</td><td>16 %</td><td>58 %</td></tr>
      <tr><td>Dos sentadas seguidas</td><td>hasta 7</td><td>nunca</td></tr>
      <tr><td>La misma primera pausa que ayer</td><td>17 de 29 días</td><td>nunca</td></tr>
      <tr><td>Rutinas distintas por semana</td><td>5 a 7 · 13 a 15</td><td>9 · 18</td></tr>
    </table>
    <p>«Dos horas» queda en la mitad y no en el 60 % de la página: desde v0.169.0 sirve dos pausas y solo
      la primera tiene que ser de pie. Ya te lo dijeron el 15.</p>
  </section>

  <section>
    <h2>Lo que he decidido yo, para que lo sepas</h2>
    <p><b>«Dos horas: sal de la silla»</b> solo sale si de verdad llevas 1 h 45 o más; el miércoles la larga
      llega antes y dice la zona.</p>
    <p><b>La mesa</b> deja entrar Flexiones de escritorio, pero no «Empuje · progresión», que pide la pica
      y es de nivel intermedio.</p>
    <p><b>El jueves</b>, la pausa de antes del Respira de antes de comer es de pie, para no tener dos sentadas.</p>
    <p><b>Espalda de pie</b> lleva un paso sin dibujo propio: el de la rotación es sentado. Lo he puesto
      en la lista de dibujos que faltan.</p>
    <p><b>Con el aro a 10 o 15</b> la jornada tiene once pausas y por la tarde ya no quedan rutinas de pie
      sin repetir: salen hasta cuatro sentadas seguidas. Es lo que decía la tabla de «cuando no hay
      bastantes rutinas»: antes que repetir en el día, la que no repite zona.</p>
  </section>
</main>
`;
const out = path.join(__dirname, 'series.html');
fs.writeFileSync(out, html);
console.log('series.html', Math.round(fs.statSync(out).size / 1024) + ' KB');
