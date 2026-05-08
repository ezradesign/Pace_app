/**
 * build-standalone.js - PACE
 * Genera PACE_standalone.html inlineando todos los assets locales en PACE.html.
 * Uso: node build-standalone.js
 *
 * Sesion 48: blindado contra null bytes y BOM (UTF-8/UTF-16).
 * Sesion 48c: elimina <link rel="manifest"> del bundle (en file:// causa
 *             errores CORS en consola que parecen un crash).
 * readFileClean() elimina BOM y null bytes antes de concatenar.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INPUT  = path.join(ROOT, 'PACE.html');
const OUTPUT = path.join(ROOT, 'PACE_standalone.html');

/* Lee un archivo de texto, elimina BOM UTF-8/UTF-16 y null bytes de relleno. */
function readFileClean(filePath) {
  var buf = fs.readFileSync(filePath);

  // BOM UTF-16 LE (FF FE) -> convertir a UTF-8
  if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
    return buf.slice(2).toString('utf16le').replace(/\x00/g, '');
  }

  // BOM UTF-8 (EF BB BF) -> eliminar BOM
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    buf = buf.slice(3);
  }

  // Eliminar null bytes de relleno (rastro de escrituras truncadas)
  var s = buf.toString('utf-8');
  if (s.indexOf('\x00') !== -1) {
    var original = s.length;
    s = s.replace(/\x00/g, '');
    console.warn('  [WARN] Null bytes eliminados en: ' + filePath + ' (' + (original - s.length) + ' bytes)');
  }

  return s;
}

var html = readFileClean(INPUT);

// 0. Quitar el <link rel="manifest"> del standalone.
//    En file:// (uso típico del bundle offline) el manifest dispara
//    CORS y mete dos errores rojos en consola que parecen un crash.
//    En el standalone no hay PWA instalable de todas formas, así que
//    el link no aporta nada. PACE.html (dev/PWA) lo conserva.
html = html.replace(/\s*<link rel="manifest"[^>]*>\s*/, '\n  ');

// 1. Inline tokens.css
var tokensCss = readFileClean(path.join(ROOT, 'app/tokens.css'));
html = html.replace(
  /<link rel="stylesheet" href="app\/tokens\.css"\s*\/>/,
  '<style>\n' + tokensCss + '\n  </style>'
);

// 2. Inline cada <script type="text/babel" src="..."></script>
html = html.replace(
  /<script type="text\/babel" src="([^"]+)"><\/script>/g,
  function(match, src) {
    var full = path.join(ROOT, src);
    if (!fs.existsSync(full)) {
      console.warn('  [WARN] No encontrado: ' + src);
      return '';
    }
    var content = readFileClean(full);
    return '<script type="text/babel">\n' + content + '\n</script>';
  }
);

// 3. Logo PNG -> data URI
var logoPng = fs.readFileSync(path.join(ROOT, 'app/ui/pace-logo.png'));
var logoB64 = logoPng.toString('base64');
html = html.replace(
  /src="app\/ui\/pace-logo\.png"/,
  'src="data:image/png;base64,' + logoB64 + '"'
);

// 4. Verificar que el output no contiene null bytes
if (html.indexOf('\x00') !== -1) {
  console.error('  [ERROR] El bundle final contiene null bytes. Abortando.');
  process.exit(1);
}

fs.writeFileSync(OUTPUT, html, 'utf8');
var kb = (fs.statSync(OUTPUT).size / 1024).toFixed(0);
console.log('PACE_standalone.html generado -- ' + kb + ' KB');
