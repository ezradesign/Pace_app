/* Caza de la semana (7 nov. 2026): la página de Ez. Lee la plantilla de al lado
   (`pagina-ez.plantilla.html`), cambia cada {{foto:nombre}} por la foto de <FOTOS>/nombre.png pasada a
   webp (con `sharp`, a 1280 o 360 de ancho) y escribe docs/audits/caza-semana-7nov/pagina-ez.html,
   un solo archivo que se abre igual en el PC, en el móvil y publicado.
   Uso: RECORRIDO_FOTOS=<carpeta de fotos-ez.js> node pagina-ez.js */
'use strict';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RAIZ = path.resolve(__dirname, '../../../..');
const FOTOS = process.env.RECORRIDO_FOTOS;
if (!FOTOS) throw new Error('Falta RECORRIDO_FOTOS');
const SALE = path.join(RAIZ, 'docs/audits/caza-semana-7nov/pagina-ez.html');

/* `nombre@aro`: solo el aro. La A de la comida se pinta cambiando en la página lo que dura el bloque
   (fotos-ez.js), pero la línea de abajo no está hecha para la A y diría otra cosa. */
const RECORTES = { aro: { escritorio: { left: 300, top: 60, width: 960, height: 500 }, movil: { left: 0, top: 150, width: 360, height: 340 } } };

(async () => {
  let html = fs.readFileSync(path.join(__dirname, 'pagina-ez.plantilla.html'), 'utf8');
  const nombres = [...new Set([...html.matchAll(/\{\{foto:([\w@-]+)\}\}/g)].map((m) => m[1]))];
  for (const n of nombres) {
    const [base, recorte] = n.split('@');
    const movil = /-movil-/.test(base);
    let img = sharp(path.join(FOTOS, base + '.png'));
    if (recorte) img = img.extract(RECORTES[recorte][movil ? 'movil' : 'escritorio']);
    const buf = await img.resize({ width: movil ? 360 : recorte ? 960 : 1280 }).webp({ quality: movil ? 72 : 62 }).toBuffer();
    html = html.split('{{foto:' + n + '}}').join('data:image/webp;base64,' + buf.toString('base64'));
    console.log(n.padEnd(34), Math.round(buf.length / 1024) + ' KB');
  }
  fs.mkdirSync(path.dirname(SALE), { recursive: true });
  fs.writeFileSync(SALE, html);
  console.log('→', path.relative(RAIZ, SALE), Math.round(Buffer.byteLength(html) / 1024) + ' KB');
})();
