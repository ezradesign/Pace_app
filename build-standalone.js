/**
 * build-standalone.js - PACE
 * Genera PACE_standalone.html inlineando todos los assets locales en PACE.html.
 * Uso: node build-standalone.js
 *
 * Sesion 48:    blindado contra null bytes y BOM (UTF-8/UTF-16).
 * Sesion 48c:   elimina <link rel="manifest"> del bundle (CORS en file://).
 * Sesion 51:    regex ampliado para capturar scripts con data-presets.
 * Sesion 52:    validateFileEnd (deteccion de truncamiento), fix de
 *               validateNoUnclosedStrings (backticks en comentarios).
 */

var fs   = require('fs');
var path = require('path');

var ROOT   = __dirname;
var INPUT  = path.join(ROOT, 'PACE.html');
var OUTPUT = path.join(ROOT, 'PACE_standalone.html');

/* ---------------------------------------------------------------------------
   readFileClean: lee un archivo, elimina BOM UTF-8/UTF-16 y null bytes.
   --------------------------------------------------------------------------- */
function readFileClean(filePath) {
  var buf = fs.readFileSync(filePath);

  // BOM UTF-16 LE (FF FE)
  if (buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE) {
    return buf.slice(2).toString('utf16le').replace(/\x00/g, '');
  }

  // BOM UTF-8 (EF BB BF)
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    buf = buf.slice(3);
  }

  var s = buf.toString('utf-8');
  if (s.indexOf('\x00') !== -1) {
    var original = s.length;
    s = s.replace(/\x00/g, '');
    console.warn('  [WARN] Null bytes eliminados en: ' + filePath + ' (' + (original - s.length) + ' bytes)');
  }

  return s;
}

/* ---------------------------------------------------------------------------
   validateFileEnd (T3 sesion 52): aborta el build si un archivo parece
   truncado. Comprueba:
     a) Ultimo caracter util no es null ni solo espacios.
     b) Para .jsx/.js: las ultimas 300 chars contienen al menos uno de los
        cierres canonicos esperados.
     c) Numero de comentarios abiertos /* == numero de cierres - balanceados.
   Si la validacion falla, lanza un Error (el llamador aborta con process.exit).
   --------------------------------------------------------------------------- */
function validateFileEnd(filePath, content) {
  var ext = path.extname(filePath);
  var trimmed = content.trimEnd();

  // a) Archivo vacio o solo espacios
  if (trimmed.length === 0) {
    throw new Error('Archivo vacio o solo espacios en blanco.');
  }

  // b) Para JS/JSX: el cierre final debe ser reconocible
  if (ext === '.js' || ext === '.jsx') {
    var tail = trimmed.slice(-300);
    var validEndings = [
      'Object.assign(window',
      'window.',
      '});',
      '});',
      '});',
      'root.render(',
      '};',
      ')',
    ];
    var hasValidEnd = validEndings.some(function(e) { return tail.indexOf(e) !== -1; });
    if (!hasValidEnd) {
      throw new Error('Cierre no reconocido en las ultimas 300 chars: ' + JSON.stringify(tail.slice(-80)));
    }
  }

  // c) Comentarios de bloque balanceados
  var openCount  = (content.match(/\/\*/g)  || []).length;
  var closeCount = (content.match(/\*\//g)  || []).length;
  if (openCount !== closeCount) {
    throw new Error('Comentarios de bloque desbalanceados: ' + openCount + ' /* vs ' + closeCount + ' */');
  }
}

/* ---------------------------------------------------------------------------
   validateNoUnclosedStrings (sesion 48d.1, fix sesion 52):
   Detecta strings sin cerrar al final del archivo. Ahora tiene en cuenta
   que los comentarios de bloque pueden contener backticks - se eliminan
   ANTES de contar, pero usando un enfoque de dos pasadas que no confunde
   backticks dentro de comentarios con toggles de template literal.
   Usa allowlist para archivos con template literals conocidos que el
   analizador simplificado no puede seguir correctamente.

   Allowlist (falsos positivos conocidos):
     - app/support/SupportModule.jsx  : BMC_URL usa template literal con ${}
     - app/achievements/Achievements.jsx : SVG_PFX es template literal multilinea
   --------------------------------------------------------------------------- */
var WARN_ALLOWLIST = {
  'app/support/SupportModule.jsx':    'BMC_URL template literal - falso positivo conocido s52',
  'app/achievements/Achievements.jsx':'SVG_PFX template literal - falso positivo conocido s52',
};

function validateNoUnclosedStrings(fileContent, filePath) {
  // Normalizar separador de ruta para la allowlist (Windows usa \)
  var normalizedPath = filePath.replace(/\\/g, '/');
  if (WARN_ALLOWLIST[normalizedPath]) {
    return; // Falso positivo documentado - silenciado
  }

  try {
    // Eliminar comentarios de bloque sustituyendo por espacios (preserva lineas)
    // para no desbalancear los contadores de backtick.
    var stripped = fileContent.replace(/\/\*[\s\S]*?\*\//g, function(m) {
      return m.replace(/[^\n]/g, ' ');
    });
    // Eliminar comentarios de linea
    stripped = stripped.replace(/\/\/[^\n]*/g, '');

    var lines = stripped.split('\n');
    var inTemplate = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var bt = (line.match(/`/g) || []).length;
      if (bt % 2 === 1) inTemplate = !inTemplate;
      if (inTemplate) continue;
      var sq = (line.match(/(?<!\\)'/g) || []).length;
      var dq = (line.match(/(?<!\\)"/g) || []).length;
      if ((sq % 2 === 1 || dq % 2 === 1) && i === lines.length - 1) {
        console.warn('  [WARN] ' + filePath + ': posible string sin cerrar en ultima linea: ' + line.slice(0, 80));
      }
    }
    if (inTemplate) {
      console.warn('  [WARN] ' + filePath + ': template literal sin cerrar al final del archivo.');
    }
  } catch(e) {
    console.warn('  [WARN] validateNoUnclosedStrings error en ' + filePath + ': ' + e.message);
  }
}

/* ---------------------------------------------------------------------------
   MAIN
   --------------------------------------------------------------------------- */
var html = readFileClean(INPUT);

// 0. Quitar <link rel="manifest"> (CORS en file://)
html = html.replace(/\s*<link rel="manifest"[^>]*>\s*/, '\n  ');

// 1. Inline tokens.css
var tokensCss = readFileClean(path.join(ROOT, 'app/tokens.css'));
html = html.replace(
  /<link rel="stylesheet" href="app\/tokens\.css"\s*\/>/,
  '<style>\n' + tokensCss + '\n  </style>'
);

// 2. Inline cada <script type="text/babel" src="..."></script>
//    El regex captura scripts con o sin atributos extra (data-presets, etc.)
html = html.replace(
  /<script type="text\/babel"[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g,
  function(match, src) {
    var full = path.join(ROOT, src);
    if (!fs.existsSync(full)) {
      console.warn('  [WARN] No encontrado: ' + src);
      return '';
    }
    var content = readFileClean(full);

    // T3: validar cierre del archivo antes de inlinear
    try {
      validateFileEnd(src, content);
    } catch(e) {
      console.error('  [ERROR] Archivo truncado o malformado: ' + src);
      console.error('  [ERROR] Motivo: ' + e.message);
      console.error('  [ERROR] Abortando build. Reparar el archivo antes de continuar.');
      process.exit(1);
    }

    validateNoUnclosedStrings(content, src);
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
