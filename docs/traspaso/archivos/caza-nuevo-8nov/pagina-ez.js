/* La página de Ez de la caza de lo nuevo: las fotos del banco (`semana.js`, en RECORRIDO_FOTOS) pasan
   a webp dentro del HTML, para que sea un solo archivo. Uso, desde la raíz:
     RECORRIDO_FOTOS=<carpeta> node docs/traspaso/archivos/caza-nuevo-8nov/pagina-ez.js */
'use strict';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RAIZ = path.resolve(__dirname, '../../../..');
const FOTOS = process.env.RECORRIDO_FOTOS;
const SALE = path.join(RAIZ, 'docs/audits/caza-nuevo-8nov/pagina-ez.html');

async function foto(nombre) {
  const b = await sharp(path.join(FOTOS, nombre + '.png')).webp({ quality: 72 }).toBuffer();
  return 'data:image/webp;base64,' + b.toString('base64');
}

(async () => {
  const f = {};
  for (const n of ['nuevo-movil-es-3f-editor', 'nuevo-movil-es-3g-guardada', 'nuevo-movil-es-3g2-tus-rutinas-otra-vez', 'nuevo-movil-es-3g3-vista-rutinas', 'nuevo-movil-es-5d-tras-borrar']) f[n] = await foto(n);
  const fig = (n, pie) => `<figure><img src="${f[n]}" alt="${pie}" width="360" height="800"><figcaption>${pie}</figcaption></figure>`;
  const html = fs.readFileSync(path.join(__dirname, 'pagina-ez.plantilla.html'), 'utf8')
    .replace('{{R1}}', fig('nuevo-movil-es-3f-editor', '1 · Creas «Mi pausa de la tarde» desde «Tus rutinas»')
      + fig('nuevo-movil-es-3g-guardada', '2 · Pulsas «Guardar»: vuelves al inicio, sin ver dónde quedó')
      + fig('nuevo-movil-es-3g2-tus-rutinas-otra-vez', '3 · Vuelves a «Tus rutinas»: se abre Mueve y tu rutina no está a la vista')
      + fig('nuevo-movil-es-3g3-vista-rutinas', '4 · Solo con otro toque en «Tus rutinas ›» aparece'))
    .replace('{{R2}}', fig('nuevo-movil-es-5d-tras-borrar', 'La primera pantalla: solo «Comenzar»'));
  fs.mkdirSync(path.dirname(SALE), { recursive: true });
  fs.writeFileSync(SALE, html);
  console.log(SALE, Math.round(html.length / 1024) + ' KB');
})();
