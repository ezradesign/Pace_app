/**
 * verify.js - PACE · red de seguridad LOCAL (v1, s150)
 * Uso: npm run verify
 *
 * QUE HACE, en cuatro tandas y con CODIGO DE SALIDA (0 = pasa, 1 = falla):
 *
 *   [1/4] SINTAXIS  - `node --check` real sobre cada .js del arbol (incluidos
 *                     los que el build NO mira: sw.js, scripts/, el propio
 *                     build) + parser JSX sobre cada .jsx de app/.
 *   [2/4] BUILD     - corre `node build-standalone.js` y exige salida 0.
 *                     Restaura los DOS artefactos byte a byte (el standalone
 *                     no se regenera, decision s134) y compara el index.html
 *                     recien construido con el del disco.
 *   [3/4] ARTEFACTO - analisis de AMBITO del compilado: cada modulo viaja
 *                     dentro de su IIFE, asi que un identificador que en dev
 *                     resolvia por el ambito global compartido de Babel
 *                     standalone aqui queda SIN LIGAR. Ese es exactamente el
 *                     crash de s144 (`useState` pelado en main.jsx: PACE.html
 *                     seguia funcionando, index.html no, y estuvo DOS
 *                     versiones publicado). Mas coherencia de version y
 *                     recuento de modulos.
 *   [4/4] INTEGRIDAD- segunda tanda (s152), en `verify.integridad.js`: i18n,
 *                     precache, glifos y catalogos. Vive en un archivo hermano
 *                     por tamaño (limite de 500 lineas de CLAUDE.md), pero NO
 *                     es un script suelto: corre en cada `npm run verify`.
 *
 * QUE **NO** HACE (leelo antes de fiarte del verde -- ver tambien el bloque
 * NO_CUBRE al final del archivo, que se imprime en cada pasada):
 *   nada de runtime real (no abre navegador), nada de CSS, y ninguna
 *   comprobacion de comportamiento.
 */

'use strict';

var fs     = require('fs');
var path   = require('path');
var cp     = require('child_process');
var crypto = require('crypto');

var ROOT  = path.resolve(__dirname, '..');
var babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));
var integridad = require('./verify.integridad.js');

/* --------------------------------------------------------------------------
   Identificadores de PLATAFORMA. Un nombre sin ligar que este aqui es del
   navegador o del lenguaje; cualquier otro es de la app y, dentro de una
   IIFE, es un `undefined` esperando a ejecutarse.

   Los 38 primeros NO son una lista a ojo: son los que devuelve el analisis
   sobre el artefacto sano de v0.82.0. El resto son globales estandar que
   todavia no usa nadie pero que serian igual de legitimos manana. Ningun
   identificador de PACE puede colisionar con esta lista.
   -------------------------------------------------------------------------- */
var PLATAFORMA = new Set([
  /* medidos sobre el artefacto sano (v0.82.0) */
  'window', 'Object', 'React', 'ReactDOM', 'Math', 'document', 'Date', 'undefined',
  'String', 'Array', 'setTimeout', 'Set', 'Number', 'localStorage', 'parseInt',
  'clearTimeout', 'CustomEvent', 'location', 'JSON', 'arguments', 'setInterval',
  'clearInterval', 'requestAnimationFrame', 'navigator', 'console',
  'cancelAnimationFrame', 'getComputedStyle', 'Notification', 'confirm', 'CSS',
  'Error', 'Blob', 'URL', 'FileReader', 'parseFloat', 'Boolean', 'URLSearchParams',
  'ResizeObserver',
  /* estandar, aun sin uso en el arbol */
  'Promise', 'Map', 'WeakMap', 'WeakSet', 'Symbol', 'RegExp', 'Function', 'Proxy',
  'Reflect', 'BigInt', 'Intl', 'isNaN', 'isFinite', 'encodeURIComponent',
  'decodeURIComponent', 'encodeURI', 'decodeURI', 'atob', 'btoa', 'globalThis',
  'TypeError', 'RangeError', 'SyntaxError', 'ReferenceError', 'Infinity', 'NaN',
  'fetch', 'alert', 'performance', 'matchMedia', 'history', 'screen', 'self',
  'AudioContext', 'webkitAudioContext', 'Audio', 'Image', 'IntersectionObserver',
  'MutationObserver', 'TextEncoder', 'TextDecoder', 'structuredClone', 'queueMicrotask',
  'AbortController', 'Headers', 'Request', 'Response', 'FormData', 'DOMParser',
  'Element', 'HTMLElement', 'Node', 'Event', 'KeyboardEvent', 'MouseEvent',
  'SVGElement', 'Worker', 'caches', 'indexedDB', 'sessionStorage', 'crypto',
]);

/* Rutas que no se validan: dependencias, React vendorizado y los backups
   historicos del standalone (son artefactos congelados, no fuente viva). */
var EXCLUIDAS = /(^|[\\/])(node_modules|vendor|backups|\.git)([\\/]|$)/;

var fallos = [];
var avisos = [];
function falla(msg)  { fallos.push(msg); console.log('  [FALLA] ' + msg); }
function ok(msg)     { console.log('  [OK] ' + msg); }
function info(msg)   { avisos.push(msg); console.log('  [INFO] ' + msg); }

function sha(buf) { return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16).toUpperCase(); }

function listar(dir, ext, out) {
  fs.readdirSync(dir).forEach(function (entry) {
    var full = path.join(dir, entry);
    if (EXCLUIDAS.test(full)) return;
    var st;
    try { st = fs.statSync(full); } catch (e) { return; }
    if (st.isDirectory()) listar(full, ext, out);
    else if (ext.test(entry)) out.push(full);
  });
  return out;
}

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

/* ==========================================================================
   [1/3] SINTAXIS
   ========================================================================== */
function tandaSintaxis() {
  console.log('\n[1/4] Sintaxis ...');

  var js  = listar(ROOT, /\.js$/, []);
  var jsx = listar(ROOT, /\.jsx$/, []);

  /* `node --check` de verdad, un proceso por archivo. Cubre lo que el build
     NUNCA mira: sw.js, build-standalone.js, scripts/ y .claude/. */
  var malos = 0;
  js.forEach(function (f) {
    var r = cp.spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    if (r.status !== 0) {
      malos++;
      falla('node --check falla en ' + rel(f) + '\n          ' +
            String(r.stderr || '').split('\n').slice(0, 4).join('\n          ').trim());
    }
  });

  /* .jsx: `node --check` no entiende JSX. Mismo parser del build (Babel) con
     el preset de React, que es el que decide si el archivo compila. */
  jsx.forEach(function (f) {
    try {
      babel.parseSync(fs.readFileSync(f, 'utf8'), {
        configFile: false, babelrc: false, sourceType: 'script', filename: f,
        presets: [[path.join(ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
      });
    } catch (e) {
      malos++;
      falla('JSX no parsea en ' + rel(f) + ': ' + e.message.split('\n')[0]);
    }
  });

  if (!malos) ok(js.length + ' .js con `node --check` · ' + jsx.length + ' .jsx con el parser de Babel');
  return { js: js.length, jsx: jsx.length };
}

/* ==========================================================================
   [2/3] BUILD  (y restauracion de los dos artefactos)
   ========================================================================== */
var INDEX      = path.join(ROOT, 'index.html');
var STANDALONE = path.join(ROOT, 'PACE_standalone.html');

function tandaBuild() {
  console.log('\n[2/4] Build ...');

  var previoIndex = fs.existsSync(INDEX) ? fs.readFileSync(INDEX) : null;
  var previoStand = fs.existsSync(STANDALONE) ? fs.readFileSync(STANDALONE) : null;
  var restaurado  = false;

  function restaurar() {
    if (restaurado) return;
    restaurado = true;
    /* El standalone NO se regenera (s134): vuelve a su estado exacto. */
    if (previoStand) fs.writeFileSync(STANDALONE, previoStand);
    if (previoIndex) fs.writeFileSync(INDEX, previoIndex);
  }
  process.on('SIGINT', function () { restaurar(); process.exit(130); });

  var nuevoIndex = null;
  try {
    var r = cp.spawnSync(process.execPath, [path.join(ROOT, 'build-standalone.js')], {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    });
    if (r.status !== 0) {
      falla('`node build-standalone.js` termina en ' + r.status + '\n' +
            String(r.stdout || '').split('\n').slice(-12).map(function (l) { return '          ' + l; }).join('\n') +
            String(r.stderr || '').split('\n').slice(0, 12).map(function (l) { return '          ' + l; }).join('\n'));
    } else {
      ok('`node build-standalone.js` termina en 0');
    }

    nuevoIndex = fs.existsSync(INDEX) ? fs.readFileSync(INDEX) : null;

    /* s134: el export offline no se regenera. Se comprueba que vuelve intacto. */
    var trasBuild = previoStand && fs.existsSync(STANDALONE) ? fs.readFileSync(STANDALONE) : null;
    if (previoStand && trasBuild && !trasBuild.equals(previoStand)) {
      info('el build reescribio PACE_standalone.html; se restaura (export bajo demanda, s134)');
    }
  } finally {
    restaurar();
  }

  if (previoStand) {
    var ahora = fs.readFileSync(STANDALONE);
    if (ahora.equals(previoStand)) ok('PACE_standalone.html restaurado byte a byte (' + sha(ahora) + ') -- s134');
    else falla('PACE_standalone.html NO quedo como estaba tras el verify');
  }

  /* Deriva: el index.html del disco frente al que sale de las fuentes de HOY.
     NO es un fallo -- en el cierre de sesion se llama a verify ANTES de
     regenerar, asi que aqui la deriva es lo normal y lo util es verla. */
  if (nuevoIndex && previoIndex) {
    if (nuevoIndex.equals(previoIndex)) ok('index.html del disco = build de las fuentes (' + sha(nuevoIndex) + ')');
    else info('index.html del disco DIFIERE del build de las fuentes -> falta regenerarlo (paso 3 del cierre)');
  }

  return nuevoIndex ? nuevoIndex.toString('utf8') : null;
}

/* ==========================================================================
   [3/3] ARTEFACTO
   ========================================================================== */

/* Los modulos que PACE.html declara, EN ORDEN y con el mismo criterio que el
   build: fuera de comentarios HTML, y saltando los src inexistentes (el build
   los descarta con un WARN, que es justo como un modulo desaparece en
   silencio del artefacto). */
function modulosDeclarados() {
  var pace = fs.readFileSync(path.join(ROOT, 'PACE.html'), 'utf8');
  var fuera = pace.split(/(<!--[\s\S]*?-->)/).filter(function (s) { return s.indexOf('<!--') !== 0; });
  var fuentes = [];
  fuera.forEach(function (seg) {
    var re = /<script type="text\/babel"([^>]*)>([\s\S]*?)<\/script>/g;
    var m;
    while ((m = re.exec(seg))) {
      var src = ((m[1] || '').match(/\bsrc="([^"]+)"/) || [])[1];
      if (src) {
        if (!fs.existsSync(path.join(ROOT, src))) {
          falla('PACE.html declara un modulo que NO existe: ' + src + ' (el build lo descarta y el artefacto sale sin el)');
          continue;
        }
        fuentes.push(src);
      } else if ((m[2] || '').trim()) {
        fuentes.push('PACE.html (script inline)');
      }
    }
  });
  return fuentes;
}

/* Biyeccion app/ <-> PACE.html. Hoy son 97 y 97, sin una sola excepcion.
   Es la trampa de s148: al trocear un archivo, el modulo nuevo existe en disco
   pero nadie lo declara -- y no carga nunca. El analisis de ambito lo pilla
   solo si alguien usa lo que ese archivo publicaba; esto lo pilla siempre. */
function tandaBiyeccion(declarados) {
  var enDisco = listar(path.join(ROOT, 'app'), /\.jsx?$/, []).map(rel);
  var set = new Set(declarados);
  var huerfanos = enDisco.filter(function (f) { return !set.has(f); });
  if (huerfanos.length) {
    huerfanos.forEach(function (f) {
      falla('archivo de app/ que PACE.html NO declara: ' + f + ' -- existe en disco y no carga nunca');
    });
  } else {
    ok(enDisco.length + ' archivos de app/ declarados en PACE.html, sin huerfanos');
  }
}

/* Bloques del artefacto: el build emite cada modulo como
   `<script>\n;(function () {\n<compilado>\n})();\n</script>`.
   El salto de linea tras `{` va DENTRO del patron, no del grupo: si se cuela
   en la captura, el compilado empieza en la linea 2 y todas las lineas que
   reporte este script salen corridas en +1 (medido). */
function bloquesDelArtefacto(html) {
  var re = /<script>\s*;\(function \(\) \{\n([\s\S]*?)\n\}\)\(\);\s*<\/script>/g;
  var out = [], m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

/* Todo lo que el artefacto publica en `window` -- lo que un modulo SI puede
   referenciar sin declararlo: la re-exposicion automatica del build
   (`Object.assign(window, {...})`) y los `window.X =` escritos a mano. */
function publicadosEnWindow(html) {
  var set = new Set(), m;
  var reAssign = /Object\.assign\(\s*window\s*,\s*\{([^}]*)\}/g;
  while ((m = reAssign.exec(html))) {
    m[1].split(',').forEach(function (s) {
      var t = s.split(':')[0].trim();
      if (/^[A-Za-z_$][\w$]*$/.test(t)) set.add(t);
    });
  }
  var reDot = /\bwindow\.([A-Za-z_$][\w$]*)\s*=(?!=)/g;
  while ((m = reDot.exec(html))) set.add(m[1]);
  var reIdx = /\bwindow\[\s*['"]([A-Za-z_$][\w$]*)['"]\s*\]\s*=(?!=)/g;
  while ((m = reIdx.exec(html))) set.add(m[1]);
  return set;
}

/* Identificadores referenciados y NO ligados en ningun ambito del bloque.
   `scope.globals` del Program es exactamente eso, con su nodo (y su linea:
   el build compila con retainLines, asi que la linea del compilado ES la del
   archivo fuente). */
function sinLigar(code) {
  var encontrados = {};
  babel.transformSync(code, {
    configFile: false, babelrc: false, sourceType: 'script', code: false, ast: false,
    plugins: [{ visitor: { Program: { exit: function (p) { encontrados = p.scope.globals; } } } }],
  });
  return encontrados;
}

function tandaArtefacto(html, fuentes) {
  console.log('\n[3/4] Artefacto ...');
  if (!html) { falla('no hay artefacto que analizar (el build no produjo index.html)'); return; }

  var bloques = bloquesDelArtefacto(html);

  if (fuentes.length !== bloques.length) {
    falla('PACE.html declara ' + fuentes.length + ' modulos y el artefacto trae ' + bloques.length +
          ' bloques -- alguno se perdio por el camino');
  } else {
    ok(fuentes.length + ' modulos declarados = ' + bloques.length + ' bloques compilados');
  }
  tandaBiyeccion(fuentes);
  if (!bloques.length) {
    falla('cero bloques reconocidos en el artefacto: el analisis de ambito no ha mirado NADA ' +
          '(si el build cambio la forma de la IIFE, hay que actualizar el patron de este script)');
    return;
  }

  var publicados = publicadosEnWindow(html);
  var huerfanos = [];

  bloques.forEach(function (code, i) {
    var globals;
    try { globals = sinLigar(code); }
    catch (e) { falla('no se pudo analizar el bloque ' + i + ': ' + e.message.split('\n')[0]); return; }

    Object.keys(globals).forEach(function (nombre) {
      if (PLATAFORMA.has(nombre) || publicados.has(nombre)) return;
      var nodo  = globals[nombre];
      var linea = nodo && nodo.node && nodo.node.loc ? nodo.node.loc.start.line
                : nodo && nodo.loc ? nodo.loc.start.line : null;
      huerfanos.push({ nombre: nombre, fuente: fuentes[i] || '(bloque #' + i + ')', linea: linea, bloque: i });
    });
  });

  if (!huerfanos.length) {
    ok('ningun identificador queda sin ligar dentro de su IIFE (' +
       publicados.size + ' nombres publicados en window, ' + PLATAFORMA.size + ' de plataforma)');
    return;
  }

  huerfanos.forEach(function (h) {
    /* La atribucion se comprueba sola: si el archivo al que apunta el orden no
       contiene el identificador, se dice en vez de afirmarlo. */
    var donde = h.fuente + (h.linea ? ':' + h.linea : '');
    var confirma = '';
    var abs = path.join(ROOT, h.fuente);
    if (/\.jsx?$/.test(h.fuente) && fs.existsSync(abs)) {
      var src = fs.readFileSync(abs, 'utf8');
      confirma = new RegExp('\\b' + h.nombre.replace(/\$/g, '\\$') + '\\b').test(src)
        ? '' : '  (OJO: el identificador no aparece en ese archivo -- la atribucion por orden puede estar corrida)';
    }
    falla('identificador SIN LIGAR en el artefacto: `' + h.nombre + '` en ' + donde + confirma +
          '\n          En PACE.html resuelve por el ambito global de Babel standalone; dentro de la IIFE del build, NO. Es el crash de s144.');
  });
}

/* ==========================================================================
   Coherencia de version (tres sitios que se tocan a mano cada sesion)
   ========================================================================== */
function tandaVersion() {
  console.log('\n[+] Version ...');
  var puntos = [
    { archivo: 'app/state-core.jsx', re: /const PACE_VERSION = '(v[\d.]+)'/ },
    { archivo: 'sw.js',              re: /const CACHE_NAME = 'pace-(v[\d.]+)'/ },
    { archivo: 'PACE.html',          re: /<title>[^<]*—\s*(v[\d.]+)\s*<\/title>/ },
  ];
  var leidos = puntos.map(function (p) {
    var m = fs.readFileSync(path.join(ROOT, p.archivo), 'utf8').match(p.re);
    if (!m) falla('no se encuentra la version en ' + p.archivo);
    return { archivo: p.archivo, v: m ? m[1] : null };
  });
  var vals = leidos.filter(function (l) { return l.v; });
  var distintas = new Set(vals.map(function (l) { return l.v; }));
  if (distintas.size > 1) {
    falla('la version no coincide entre archivos: ' +
          vals.map(function (l) { return l.archivo + '=' + l.v; }).join(' · '));
  } else if (vals.length === puntos.length) {
    ok('version ' + vals[0].v + ' coherente en los ' + puntos.length + ' sitios');
  }
}

/* ==========================================================================
   Lo que este verify NO cubre. Se imprime SIEMPRE, tambien en verde: un
   checker que no declara sus huecos invita a confiar de mas.
   ========================================================================== */
var NO_CUBRE = [
  /* s154: este hueco SIGUE siendo del verify —aqui no se abre ningun
     navegador—, pero ya no es del proyecto: lo cubre «npm run test:e2e»
     (Playwright, el checklist de cierre de CLAUDE.md ejecutado). Es OTRA red y
     se corre APARTE: el verify tiene que seguir costando ~5 s y no depender de
     que haya navegadores instalados. */
  'comportamiento: no abre navegador, no monta la app, no pulsa nada ' +
    '-- lo cubre «npm run test:e2e» (s154), que se corre aparte',
  'orden de carga: un modulo que use algo publicado DESPUES sigue pasando',
  'CSS, tokens y layout: no se mira una sola regla',
  'el standalone: se restaura, no se analiza (index.html es el canonico, s134)',
].concat(integridad.NO_CUBRE);

function main() {
  console.log('=== PACE verify v2 (s150 + s152) — build + artefacto + node --check + integridad ===');
  var t0 = Date.now();

  tandaSintaxis();
  var html = tandaBuild();
  /* Una sola lectura de PACE.html para las dos tandas que la necesitan: si
     declara un modulo inexistente, se reporta una vez y no dos. */
  var declarados = modulosDeclarados();
  tandaArtefacto(html, declarados);
  integridad.tandaIntegridad({ ROOT: ROOT, babel: babel, falla: falla, ok: ok, info: info }, declarados);
  tandaVersion();

  console.log('\n--- lo que este verify NO cubre ---');
  NO_CUBRE.forEach(function (l) { console.log('  · ' + l); });

  var seg = ((Date.now() - t0) / 1000).toFixed(1);
  if (fallos.length) {
    console.log('\n=== VERIFY: FALLA — ' + fallos.length + ' problema(s) en ' + seg + 's ===');
    process.exit(1);
  }
  console.log('\n=== VERIFY: PASA — 0 problemas en ' + seg + 's' +
              (avisos.length ? ' (' + avisos.length + ' aviso(s))' : '') + ' ===');
}

main();
