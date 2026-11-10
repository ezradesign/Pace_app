// Genera pagina.html desde pagina.src.html metiendo dentro las fotos de fotos/ (la página se publica sola, sin archivos al lado).
const fs = require('fs');
const path = require('path');
let s = fs.readFileSync(path.join(__dirname, 'pagina.src.html'), 'utf8');
s = s.replace(/data-f="([^"]+)"/g, (m, f) => 'src="data:image/jpeg;base64,' + fs.readFileSync(path.join(__dirname, 'fotos', f)).toString('base64') + '"');
fs.writeFileSync(path.join(__dirname, 'pagina.html'), s);
console.log('pagina.html · ' + Math.round(s.length / 1024) + ' KB');
