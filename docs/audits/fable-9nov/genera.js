// Genera pagina.html desde pagina.src.html: las fotos van como archivos del artifact (fotos/…), no dentro de la página,
// para que la página pese poco y el visor de Ez la abra (no abre más de 512 KB).
const fs = require('fs');
const path = require('path');
let s = fs.readFileSync(path.join(__dirname, 'pagina.src.html'), 'utf8');
const usadas = [];
s = s.replace(/data-f="([^"]+)"/g, (m, f) => { usadas.push(f); return 'src="fotos/' + f + '" loading="lazy"'; });
fs.writeFileSync(path.join(__dirname, 'pagina.html'), s);
console.log('pagina.html · ' + Math.round(s.length / 1024) + ' KB · fotos: ' + usadas.join(' '));
