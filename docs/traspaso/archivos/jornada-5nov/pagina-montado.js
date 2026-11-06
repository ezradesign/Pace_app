/* La página con lo montado: los cinco momentos a 360 y 1280, en español y en inglés. */
'use strict';
const C = require('./comun');
const sharp = require('C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/node_modules/sharp');
const med = JSON.parse(C.fs.readFileSync(C.path.join(C.FOTOS, 'montado/medidas.json'), 'utf8'));
const MOM = [['1', 'Sin jornada preparada'], ['2', 'Jornada preparada, antes de empezar'], ['3', 'Primer foco en marcha'],
  ['4', 'Pausa pendiente, tras cerrar la ventana'], ['5', 'Pausa terminada, siguiente foco listo']];
const img = async (n, w) => 'data:image/webp;base64,' + (await sharp(C.path.join(C.FOTOS, 'montado', n + '.png')).resize({ width: w }).webp({ quality: 72 }).toBuffer()).toString('base64');
(async () => {
  let cuerpo = '';
  for (const [n, t] of MOM) {
    cuerpo += `<section><h2>${t}</h2><div class="fila">
      <figure class="m"><img src="${await img(n + '-m', 400)}" alt="${t}, móvil, español"><figcaption>360 px · español</figcaption></figure>
      <figure class="m"><img src="${await img(n + '-m-en', 400)}" alt="${t}, móvil, inglés"><figcaption>360 px · inglés</figcaption></figure>
      <figure class="e"><img src="${await img(n + '-e', 1000)}" alt="${t}, escritorio"><figcaption>1280 px · español</figcaption></figure>
    </div></section>`;
  }
  const scroll = Math.max(...Object.values(med).map((v) => v.scroll));
  const html = `<title>La jornada montada</title>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Inter+Tight:wght@400;600&display=swap">
<style>
/* Fotos de la app compilada, con la paleta clara de PACE. */
:root { --paper:#F2EDE0; --ink:#1F1C17; --ink3:#77705F; --line:#C9C0A8; --serif:"Cormorant Garamond",Georgia,serif; --sans:"Inter Tight","Segoe UI",system-ui,sans-serif; }
* { box-sizing:border-box; }
body { background:var(--paper); color:var(--ink); font-family:var(--sans); font-size:15px; line-height:1.5; margin:0; padding-block:24px 48px; padding-left:max(16px,env(safe-area-inset-left,0px)); padding-right:max(16px,env(safe-area-inset-right,0px)); }
main { max-width:1280px; margin:0 auto; display:grid; gap:34px; }
h1,h2 { font-family:var(--serif); font-style:italic; font-weight:500; line-height:1.1; margin:0 0 10px; }
h1 { font-size:38px; } h2 { font-size:26px; }
p { margin:0; max-width:64ch; }
.fila { display:grid; grid-template-columns:minmax(0,.62fr) minmax(0,.62fr) minmax(0,2fr); gap:12px; align-items:start; }
figure { margin:0; min-width:0; display:grid; gap:4px; }
img { display:block; width:100%; height:auto; border:1px solid var(--line); border-radius:10px; }
figcaption { font-size:12px; color:var(--ink3); }
@media (max-width:760px) { .fila { grid-template-columns:repeat(2,minmax(0,1fr)); } .e { grid-column:1 / -1; } }
</style>
<main>
<header><h1>La jornada montada</h1><p>Fotos de la app compilada de la rama, con 1A, 2B y sin la frase de ayuda. Scroll máximo en ${Object.keys(med).length} medidas, en los cinco momentos, en los dos idiomas y en diez tamaños: ${scroll} px.</p></header>
${cuerpo}
</main>`;
  C.fs.writeFileSync(C.path.join(C.RAIZ, 'docs/proposals/jornada-montada.html'), html);
  console.log('KB', Math.round(html.length / 1024), 'scroll', scroll);
})().catch((e) => { console.error(e); process.exit(1); });
