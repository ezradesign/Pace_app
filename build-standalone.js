/**
 * build-standalone.js - PACE
 * Genera PACE_standalone.html inlineando todos los assets locales en PACE.html.
 * Uso: node build-standalone.js (o: npm run build)
 *
 * Sesion 48:    blindado contra null bytes y BOM (UTF-8/UTF-16).
 * Sesion 48c:   elimina <link rel="manifest"> del bundle (CORS en file://).
 * Sesion 51:    regex ampliado para capturar scripts con data-presets.
 * Sesion 52:    validateFileEnd (heuristico, reemplazado en s56).
 * Sesion 54b:   check clave-sin-valor y new Function .js (reemplazados en s56).
 * Sesion 55b:   validateInlineScripts heuristico (reemplazado en s56).
 * Sesion 56:    PARSER REAL: TypeScript parser via tsserver lib, reemplaza
 *               todos los checks heuristicos anteriores. Aborta con
 *               archivo, linea:columna y snippet de contexto exactos.
 */

'use strict';

var fs   = require('fs');
var path = require('path');
var ts   = (function() {
  var paths = [
    '/usr/local/lib/node_modules_global/lib/node_modules/typescript',
    path.join(__dirname, 'node_modules/typescript'),
  ];
  for (var i = 0; i < paths.length; i++) {
    try { return require(paths[i]); } catch (e) {}
  }
  throw new Error('TypeScript not found. Run: npm install typescript --no-save');
})();

var ROOT   = __dirname;
var INPUT  = path.join(ROOT, 'PACE.html');
var OUTPUT = path.join(ROOT, 'PACE_standalone.html');

/* ---------------------------------------------------------------------------
   readFileClean: lee un archivo, elimina BOM UTF-8/UTF-16 y null bytes.
   Pre-filtro necesario antes de parsear.
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
    console.warn('  [WARN] Null bytes eliminados en: ' + filePath +
                 ' (' + (original - s.length) + ' bytes)');
  }

  return s;
}

/* ---------------------------------------------------------------------------
   validateSyntax: parsea content con el TypeScript parser (ScriptKind.JSX
   para .jsx, ScriptKind.JS para .js). Devuelve { ok: true } o
   { ok: false, message: string } con archivo, linea:columna y snippet.
   Solo detecta errores de SINTAXIS -- no errores semanticos ni de tipos.
   --------------------------------------------------------------------------- */
function validateSyntax(content, sourceLabel, isJSX) {
  var kind = isJSX ? ts.ScriptKind.JSX : ts.ScriptKind.JS;
  var sf   = ts.createSourceFile(sourceLabel, content,
                                  ts.ScriptTarget.Latest, true, kind);
  var diags = sf.parseDiagnostics || [];
  if (diags.length === 0) return { ok: true };

  var d    = diags[0];
  var pos  = sf.getLineAndCharacterOfPosition(d.start);
  var line = pos.line + 1;
  var col  = pos.character;
  var msg  = typeof d.messageText === 'string'
    ? d.messageText
    : d.messageText.messageText;

  var lines = content.split('\n');
  var start = Math.max(0, line - 3);
  var end   = Math.min(lines.length, line + 2);
  var snippet = lines.slice(start, end).map(function(l, i) {
    var num    = start + i + 1;
    var marker = num === line ? '>' : ' ';
    return marker + ' ' + num.toString().padStart(4) + ' | ' + l;
  }).join('\n');

  return {
    ok: false,
    message: 'Syntax error in ' + sourceLabel + ' at ' + line + ':' + col +
             '\n' + msg + '\n\n' + snippet
  };
}

/* ---------------------------------------------------------------------------
   validateAppFiles: valida todos los .js y .jsx bajo app/.
   Aborta inmediatamente al primer error.
   --------------------------------------------------------------------------- */
function validateAppFiles() {
  var appDir = path.join(ROOT, 'app');
  var files  = [];

  (function walk(dir) {
    fs.readdirSync(dir).forEach(function(entry) {
      var full = path.join(dir, entry);
      var stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (/\.(js|jsx)$/.test(entry)) {
        files.push(full);
      }
    });
  })(appDir);

  files.sort();
  var jsCount = 0, jsxCount = 0;

  files.forEach(function(filePath) {
    var ext     = path.extname(filePath);
    var isJSX   = ext === '.jsx';
    var rel     = path.relative(ROOT, filePath).replace(/\\/g, '/');
    var content = readFileClean(filePath);
    var result  = validateSyntax(content, rel, isJSX);
    if (!result.ok) {
      console.error('\n  [ERROR] ' + result.message);
      console.error('\n  [ERROR] Abortando build. Reparar el archivo antes de continuar.');
      process.exit(1);
    }
    if (isJSX) jsxCount++; else jsCount++;
  });

  console.log('  [OK] ' + files.length + ' archivos validados (' +
              jsCount + ' .js, ' + jsxCount + ' .jsx).');
  return files;
}

/* ---------------------------------------------------------------------------
   validateInlineScripts: extrae y valida con el parser real cada bloque
   <script> sin atributo src del HTML de entrada.
   Nota: se eliminan comentarios HTML (<!-- ... -->) antes de aplicar el
   regex para evitar falsos positivos con etiquetas de script dentro de
   comentarios (como en el bloque de documentacion del mount loop).
   Los scripts type="text/babel" se parsean como JSX.
   Los demas se parsean como JS puro.
   --------------------------------------------------------------------------- */
function validateInlineScripts(htmlContent, htmlPath) {
  // Strip HTML comments para que fragmentos como <!-- <script src> ... -->
  // no sean capturados como etiquetas de script reales.
  var htmlNoComments = htmlContent.replace(/<!--[\s\S]*?-->/g, '');
  var re = /<script(\s[^>]*)?>(\s*)([\s\S]*?)<\/script>/g;
  var m;
  var idx = 0;
  var inlineCount = 0;

  while ((m = re.exec(htmlNoComments)) !== null) {
    var attrs   = m[1] || '';
    var body    = m[3] || '';
    // Script externo: src="..." en sus atributos de apertura
    var hasSrc  = /\bsrc\s*=\s*["'][^"']+["']/.test(attrs);
    if (hasSrc) { idx++; continue; }

    var trimmed = body.trim();
    if (!trimmed) { idx++; continue; }

    var isBabel = /type\s*=\s*["']text\/babel["']/.test(attrs);
    var label   = htmlPath + ' inline script #' + idx;
    var result  = validateSyntax(trimmed, label, isBabel);

    if (!result.ok) {
      console.error('\n  [ERROR] ' + result.message);
      console.error('\n  [ERROR] Abortando build. Reparar PACE.html antes de continuar.');
      process.exit(1);
    }

    inlineCount++;
    idx++;
  }

  console.log('  [OK] validateInlineScripts: ' + inlineCount + ' scripts inline validados.');
}

/* ---------------------------------------------------------------------------
   MAIN
   --------------------------------------------------------------------------- */
function main() {
  console.log('=== PACE build-standalone.js (s56 / parser TS real) ===');

  // 1. Validar todos los archivos app/*.js y app/*.jsx
  console.log('\n[1/5] Validando archivos app/ ...');
  validateAppFiles();

  // 2. Cargar PACE.html y validar scripts inline
  console.log('\n[2/5] Cargando y validando PACE.html ...');
  var html = readFileClean(INPUT);
  validateInlineScripts(html, INPUT);

  // 3. Quitar <link rel="manifest"> (CORS en file://)
  console.log('\n[3/5] Inlineando assets ...');
  html = html.replace(/\s*<link rel="manifest"[^>]*>\s*/, '\n  ');

  // 4. Inline tokens.css
  var tokensCss = readFileClean(path.join(ROOT, 'app/tokens.css'));
  html = html.replace(
    /<link rel="stylesheet" href="app\/tokens\.css"\s*\/>/,
    '<style>\n' + tokensCss + '\n  </style>'
  );

  // 5. Inline cada <script type="text/babel" src="..."></script>
  html = html.replace(
    /<script type="text\/babel"[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g,
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

  // 6. Logo PNG -> data URI
  var logoPng = fs.readFileSync(path.join(ROOT, 'app/ui/pace-logo.png'));
  var logoB64 = logoPng.toString('base64');
  html = html.replace(
    /src="app\/ui\/pace-logo\.png"/,
    'src="data:image/png;base64,' + logoB64 + '"'
  );

  // 7. Verificar que el output no contiene null bytes
  console.log('\n[4/5] Verificando bundle final ...');
  if (html.indexOf('\x00') !== -1) {
    console.error('  [ERROR] El bundle final contiene null bytes. Abortando.');
    process.exit(1);
  }

  // 8. Escribir
  console.log('\n[5/5] Escribiendo PACE_standalone.html ...');
  fs.writeFileSync(OUTPUT, html, 'utf8');
  var kb = (fs.statSync(OUTPUT).size / 1024).toFixed(0);
  console.log('\n=== Build completado: PACE_standalone.html -- ' + kb + ' KB ===');

  // 9. Copiar a index.html (root para Cloudflare Pages).
  //    s102: la copia DESPLEGADA recupera el <link rel="manifest"> que el
  //    paso 3 quita del standalone (CORS en file://). Sin él, Chrome no
  //    ofrecía instalar la PWA: index.html se servía sin manifest desde s48c.
  var indexPath = path.join(ROOT, 'index.html');
  var indexHtml = html.replace(
    /<link rel="icon"/,
    '<link rel="manifest" href="/manifest.webmanifest">\n  <link rel="icon"'
  );
  if (indexHtml.indexOf('rel="manifest"') === -1) {
    console.warn('  [WARN] index.html sin <link rel="manifest"> (ancla <link rel="icon"> no encontrada)');
  }
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log('✓ index.html generado (standalone + <link rel="manifest">)');
}

main();
