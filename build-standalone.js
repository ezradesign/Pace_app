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
 * Sesion 103:   BUILD ETAPA A: precompila todos los <script type="text/babel">
 *               con @babel/core (preset-env targets modernos + preset-react,
 *               sourceType script, retainLines) e inlinea React production
 *               UMD desde vendor/. El output ya NO carga @babel/standalone ni
 *               unpkg: standalone e index.html quedan autocontenidos.
 *               PACE.html (dev) sigue igual: CDN dev + Babel en el navegador.
 */

'use strict';

var fs    = require('fs');
var path  = require('path');
var babel = require('@babel/core');
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
   compileBabel: compila un bloque text/babel a JS plano (s103 / Etapa A).
   - sourceType 'script': NO inyecta "use strict" -> misma semantica sloppy
     que los <script> del navegador de siempre.
   - targets evergreen: mantiene ?. ?? arrow/class/async nativos (cero
     helpers inyectados); es lo que los navegadores soportados ya ejecutan.
   - retainLines: los numeros de linea del output coinciden con el .jsx
     fuente -> stack traces de produccion apuntan a la linea real.
   --------------------------------------------------------------------------- */
var BABEL_OPTS = {
  presets: [
    ['@babel/preset-env', {
      targets: { chrome: '90', edge: '90', firefox: '90', safari: '14.1' },
      modules: false
    }],
    ['@babel/preset-react', { development: false }]
  ],
  sourceType: 'script',
  retainLines: true,
  compact: false,
  comments: true,
  configFile: false,
  babelrc: false
};

/* ---------------------------------------------------------------------------
   collectGlobalNames (s103): nombres top-level `function` y `var` de un
   archivo COMPILADO. Babel standalone ejecuta cada text/babel via eval
   indirecto: esos nombres se vuelven propiedades de window automaticamente
   (asi comparten RoutineCard y otros helpers SIN Object.assign), mientras
   que const/let quedan privados por archivo. La IIFE del build reproduce lo
   privado; esta lista reproduce lo global (se re-expone al final de la IIFE).
   --------------------------------------------------------------------------- */
function collectPatternNames(id, out) {
  if (!id) return;
  if (id.type === 'Identifier') out.push(id.name);
  else if (id.type === 'ObjectPattern') id.properties.forEach(function(p) { collectPatternNames(p.value || p.argument, out); });
  else if (id.type === 'ArrayPattern') id.elements.forEach(function(el) { collectPatternNames(el, out); });
  else if (id.type === 'AssignmentPattern') collectPatternNames(id.left, out);
  else if (id.type === 'RestElement') collectPatternNames(id.argument, out);
}

function collectGlobalNames(code, sourceLabel) {
  var ast;
  try {
    ast = babel.parseSync(code, { sourceType: 'script', configFile: false, babelrc: false });
  } catch (e) {
    console.error('\n  [ERROR] No se pudo re-parsear el compilado de ' + sourceLabel + ': ' + e.message);
    process.exit(1);
  }
  var names = [];
  ast.program.body.forEach(function(node) {
    if (node.type === 'FunctionDeclaration' && node.id) {
      names.push(node.id.name);
    } else if (node.type === 'VariableDeclaration' && node.kind === 'var') {
      node.declarations.forEach(function(d) { collectPatternNames(d.id, names); });
    }
  });
  return names;
}

/* Aplica un replace SOLO fuera de comentarios HTML. Necesario porque hay
   comentarios de documentacion que contienen etiquetas <script ...> literales
   (p.ej. el bloque "Monta la app") -- mismo motivo por el que
   validateInlineScripts strippea comentarios antes de validar (s56). */
function replaceOutsideComments(html, regex, cb) {
  return html.split(/(<!--[\s\S]*?-->)/).map(function(seg) {
    if (seg.indexOf('<!--') === 0) return seg;
    return seg.replace(regex, cb);
  }).join('');
}

function compileBabel(content, sourceLabel) {
  var result;
  try {
    result = babel.transformSync(content, Object.assign({ filename: sourceLabel }, BABEL_OPTS));
  } catch (e) {
    console.error('\n  [ERROR] Babel fallo compilando ' + sourceLabel + ':\n  ' + e.message);
    console.error('\n  [ERROR] Abortando build.');
    process.exit(1);
  }
  var code = result.code;
  // "</script>" dentro del JS compilado rompería el HTML al inlinearlo.
  if (/<\/script/i.test(code)) {
    console.error('\n  [ERROR] ' + sourceLabel + ' compilado contiene "</script>" -- rompería el inline HTML. Abortando.');
    process.exit(1);
  }
  return code;
}

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
  console.log('=== PACE build-standalone.js (s103 / Etapa A: precompilado Babel + React production) ===');

  // 1. Validar todos los archivos app/*.js y app/*.jsx
  console.log('\n[1/7] Validando archivos app/ ...');
  validateAppFiles();

  // 2. Cargar PACE.html y validar scripts inline
  console.log('\n[2/7] Cargando y validando PACE.html ...');
  var html = readFileClean(INPUT);
  validateInlineScripts(html, INPUT);

  // 3. Quitar <link rel="manifest"> (CORS en file://)
  console.log('\n[3/7] Inlineando assets ...');
  html = html.replace(/\s*<link rel="manifest"[^>]*>\s*/, '\n  ');

  // 4. Inline tokens.css
  var tokensCss = readFileClean(path.join(ROOT, 'app/tokens.css'));
  html = html.replace(
    /<link rel="stylesheet" href="app\/tokens\.css"\s*\/>/,
    '<style>\n' + tokensCss + '\n  </style>'
  );

  // 5. Cada <script type="text/babel" src="..."> -> COMPILADO e inlineado
  //    como <script> plano (s103). Los scripts planos se ejecutan sincronos
  //    y en orden de documento: el ORDEN DE CARGA de PACE.html pasa de
  //    "intencion" (Babel evalua async) a garantia real.
  var compiledCount = 0;
  html = replaceOutsideComments(
    html,
    /<script type="text\/babel"[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g,
    function(match, src) {
      var full = path.join(ROOT, src);
      if (!fs.existsSync(full)) {
        console.warn('  [WARN] No encontrado: ' + src);
        return '';
      }
      var content = readFileClean(full);
      compiledCount++;
      // IIFE por archivo + re-exposicion de function/var top-level =
      // semantica EXACTA del eval indirecto de Babel standalone:
      //  - const/let privados por archivo (sin IIFE, los repetidos entre
      //    archivos -- `const { useState } = React`, GLYPH_SVG -- lanzan
      //    "Identifier already declared" y el archivo entero no evalua)
      //  - function/var visibles en window (asi viajan RoutineCard y otros
      //    helpers que nunca pasaron por Object.assign)
      var code  = compileBabel(content, src);
      var names = collectGlobalNames(code, src);
      var expose = names.length
        ? '\n;Object.assign(window, { ' + names.join(', ') + ' });'
        : '';
      return '<script>\n;(function () {\n' + code + expose + '\n})();\n</script>';
    }
  );

  // 5b. Scripts text/babel INLINE (el mount loop): mismo tratamiento.
  html = replaceOutsideComments(
    html,
    /<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/g,
    function(match, body) {
      if (!body.trim()) return '';
      compiledCount++;
      var code  = compileBabel(body, 'PACE.html inline');
      var names = collectGlobalNames(code, 'PACE.html inline');
      var expose = names.length
        ? '\n;Object.assign(window, { ' + names.join(', ') + ' });'
        : '';
      return '<script>\n;(function () {\n' + code + expose + '\n})();\n</script>';
    }
  );
  console.log('  [OK] ' + compiledCount + ' scripts text/babel compilados a JS plano.');

  // 5c. React production UMD inlineado desde vendor/ + fuera Babel standalone.
  //     El output ya no toca unpkg: primer arranque sin CDN ni compile.
  var reactJs    = readFileClean(path.join(ROOT, 'vendor/react.production.min.js'));
  var reactDomJs = readFileClean(path.join(ROOT, 'vendor/react-dom.production.min.js'));
  // OJO: replacement como FUNCION -- el JS minificado esta lleno de '$' y
  // como string de reemplazo activaria los patrones $&/$' de String.replace.
  html = html.replace(
    /<script src="https:\/\/unpkg\.com\/react@[^"]*"[^>]*><\/script>/,
    function() { return '<script>\n' + reactJs + '\n</script>'; }
  );
  html = html.replace(
    /<script src="https:\/\/unpkg\.com\/react-dom@[^"]*"[^>]*><\/script>/,
    function() { return '<script>\n' + reactDomJs + '\n</script>'; }
  );
  html = html.replace(/\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]*"[^>]*><\/script>/, '');
  html = html.replace(
    /<!-- React \+ Babel \(pinned, no tocar\) -->/,
    '<!-- React 18.3.1 production UMD inlineado desde vendor/ (build Etapa A, s103).\n       En dev (PACE.html) siguen los CDN development + Babel standalone. -->'
  );
  console.log('  [OK] React production inlineado; @babel/standalone retirado del output.');

  // 6. Logo PNG -> data URI
  var logoPng = fs.readFileSync(path.join(ROOT, 'app/ui/pace-logo.png'));
  var logoB64 = logoPng.toString('base64');
  html = html.replace(
    /src="app\/ui\/pace-logo\.png"/,
    'src="data:image/png;base64,' + logoB64 + '"'
  );

  // 6b. Laminas de Caminos (s104, arte D-4) -> data URI SOLO en el standalone.
  //     Decision s104: la web (index.html) las sirve como ARCHIVOS (+ PRECACHE
  //     en sw.js) para no engordar el HTML con base64 (~1.5 MB con las 7);
  //     el standalone file:// las inlinea para seguir 100% autocontenido.
  //     Se aplica en el paso 8 sobre la copia del standalone, NUNCA sobre el
  //     html base del que sale index.html.
  var ILLUST_DIR = path.join(ROOT, 'app/paths/illustrations/assets');
  var ILLUST_REF_PREFIX = 'app/paths/illustrations/assets/';
  function inlineIllustrations(src) {
    if (!fs.existsSync(ILLUST_DIR)) return src;
    var out = src;
    var count = 0;
    fs.readdirSync(ILLUST_DIR)
      .filter(function (f) { return /\.webp$/i.test(f); })
      .forEach(function (f) {
        var ref = ILLUST_REF_PREFIX + f;
        if (out.indexOf(ref) === -1) return; // asset presente sin referencia: ok (aun sin entrada en paths.index.js)
        var b64 = fs.readFileSync(path.join(ILLUST_DIR, f)).toString('base64');
        // split/join: sin regex ni replacement strings (regla s103 de los '$')
        out = out.split(ref).join('data:image/webp;base64,' + b64);
        count++;
      });
    if (out.indexOf(ILLUST_REF_PREFIX) !== -1) {
      console.error('  [ERROR] El standalone referencia una lamina que no existe en ' + ILLUST_REF_PREFIX + '. Abortando.');
      process.exit(1);
    }
    console.log('  [OK] ' + count + ' lamina(s) de Caminos inlineada(s) como data URI (solo standalone).');
    return out;
  }

  // 7. Invariantes del bundle (s103): sin null bytes, sin text/babel
  //    residual, sin referencias a CDN.
  console.log('\n[4/7] Verificando bundle final ...');
  if (html.indexOf('\x00') !== -1) {
    console.error('  [ERROR] El bundle final contiene null bytes. Abortando.');
    process.exit(1);
  }
  // (sobre el HTML sin comentarios: la documentacion inline menciona
  //  text/babel de forma legitima)
  var htmlSinComentarios = html.replace(/<!--[\s\S]*?-->/g, '');
  // Solo TAGS reales: se colapsan los cuerpos de los <script> porque los
  // comentarios JS compilados pueden citar "<script type=text/babel>" (el
  // mount loop lo hace) sin que eso sea un tag sin compilar.
  var soloTags = htmlSinComentarios.replace(/(<script[^>]*>)[\s\S]*?(<\/script>)/g, '$1$2');
  var babelResidual = soloTags.match(/<script[^>]*type="text\/babel"/);
  if (babelResidual) {
    console.error('  [ERROR] El bundle final aun contiene scripts text/babel sin compilar. Abortando.');
    console.error('  Contexto: ...' +
      soloTags.slice(Math.max(0, babelResidual.index - 150), babelResidual.index + 150) + '...');
    process.exit(1);
  }
  if (htmlSinComentarios.indexOf('unpkg.com') !== -1) {
    console.error('  [ERROR] El bundle final aun referencia unpkg.com. Abortando.');
    process.exit(1);
  }

  // 8. Escribir (standalone = html base + laminas como data URI, s104)
  console.log('\n[5/7] Escribiendo PACE_standalone.html ...');
  var standaloneHtml = inlineIllustrations(html);
  fs.writeFileSync(OUTPUT, standaloneHtml, 'utf8');
  var kb = (fs.statSync(OUTPUT).size / 1024).toFixed(0);
  console.log('=== Build completado: PACE_standalone.html -- ' + kb + ' KB ===');

  // 9. Copiar a index.html (root para Cloudflare Pages).
  console.log('\n[6/7] Generando index.html ...');
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

  // 10. Sanity final sobre lo ESCRITO (s103): ambos artefactos re-leidos del
  //     disco deben declarar React y montar sin Babel.
  console.log('\n[7/7] Sanity de artefactos escritos ...');
  [OUTPUT, indexPath].forEach(function(p) {
    var out = fs.readFileSync(p, 'utf8');
    var name = path.basename(p);
    if (out.indexOf('react.production.min.js') === -1 ||
        out.indexOf('react-dom.production.min.js') === -1) {
      console.error('  [ERROR] ' + name + ' no contiene React production inlineado. Abortando.');
      process.exit(1);
    }
    if (out.indexOf('ReactDOM.createRoot') === -1) {
      console.error('  [ERROR] ' + name + ' no contiene el mount (ReactDOM.createRoot). Abortando.');
      process.exit(1);
    }
  });
  console.log('  [OK] standalone + index.html: React production presente, mount presente.');
}

main();
