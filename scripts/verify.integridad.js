/**
 * verify.integridad.js - PACE · red de seguridad LOCAL, SEGUNDA TANDA (s152)
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como su tanda [4/4], asi
 * que corre en cada `npm run verify`. Vive aparte solo por tamaño (verify.js
 * estaba en 411 lineas y el limite de CLAUDE.md son 500).
 *
 * QUE CUBRE - exactamente lo que D5 de s149 aparco del verify v1:
 * integridad de **i18n**, **precache**, **glifos** y **catalogos**.
 *
 * DOS CLASES DE COMPROBACION, y conviene no confundirlas:
 *
 *   RELACIONALES - no llevan numero y no caducan nunca: toda mascara tiene su
 *   fichero, todo id de detector existe en el catalogo, ES y EN declaran las
 *   mismas claves. Si una falla, hay algo roto SIEMPRE.
 *
 *   CENSO - los numeros esperados, todos juntos en la constante `CENSO`. Cazan
 *   la desaparicion silenciosa (una rutina que se cae de un grupo, un glifo que
 *   se pierde en un troceo). Al añadir contenido A PROPOSITO hay que subir el
 *   numero aqui: es un acto deliberado de una linea, no un fallo del script.
 *
 * COMO SE SACAN LOS DATOS: del arbol, nunca leyendo a ojo. Cada archivo se
 * compila con el Babel del build y se evalua **dentro de su propia IIFE**, que
 * es como viaja en el artefacto. Eso importa: `GLYPH_SVG` esta declarado como
 * `const` en DOS archivos (achievement-glyphs.jsx y catalog.js) y cargarlos en
 * un ambito compartido revienta con «has already been declared». Lo que cruza
 * de un archivo a otro es lo que se publica en `window`, igual que en produccion.
 */

'use strict';

var fs   = require('fs');
var path = require('path');
var vm   = require('vm');
var eventos = require('./verify.eventos.js');   // tanda de pace.events.v1 (s155)

/* --------------------------------------------------------------------------
   CENSO. Cada numero esta MEDIDO del arbol, no estimado, y tiene su sesion.
   Si una de estas cifras cambia porque el contenido crecio a proposito, se
   actualiza AQUI y se anota en el cierre.
   -------------------------------------------------------------------------- */
var CENSO = {
  /* i18n: claves que declaran `app/i18n/strings/*` en CADA idioma (s152; el
     split de s148 midio 195 sobre su propio alcance, no sobre el total). */
  i18nClaves: 515,   // +1 en s155b: tweaks.msg.import.storage.err
                     // +1 en s161: tweaks.palette.auto (tercera pill de paleta)
                     // +1 en s166: focus.startPause (el CTA en Pausa/Larga)
                     // +3 en s166: stats.hold.label/min/sec (el tiempo de retencion)

  /* glifos */
  glifosEjercicio: 47,          // exercise-glyphs.jsx + .extra.jsx (s148)
  mascarasLogro: 77,            // achievement-masks.js (s146/s147; +19 en s167)
  mascarasVisiblesDeSalida: 69, // las que un usuario nuevo ve pintadas (+17 en s167,
                                //   -1 al pasar explore.tweaks a secreto)
  mascarasDeSecreto: 8,         // + estas, solo al desbloquear su secreto (+2 en s167:
                                //   secret.dark.mode y secret.lunch)

  /* catalogo de logros */
  logros: 96,                   // ACHIEVEMENT_CATALOG (s146)
  logrosConDetector: 88,        // IMPLEMENTED_ACHIEVEMENTS
  logrosDisponibles: 88,        // §15.4 denominador unico: el «0/88» de la UI
  logrosSecretos: 13,           // +1 en s167: explore.tweaks («Curiosidad»)
  categorias: 7,                // CAT_META

  /* catalogos de contenido */
  respira: 20, mueve: 14, estira: 14, caminos: 7,

  /* service worker */
  precache: 105,                // filas de PRECACHE (s149; +19 mascaras en s167)
};

/* ==========================================================================
   Sandbox: `window` de mentira + una IIFE por archivo (como el artefacto)
   ========================================================================== */
function nuevoSandbox() {
  /* React de mentira: solo hace falta para que los modulos con JSX evaluen. De
     ellos se quieren los DATOS, no el arbol de componentes. */
  var React = new Proxy({
    createElement: function (t, p) { return { __el: t, props: p }; },
    Fragment: 'Fragment', memo: function (f) { return f; },
    useState: function (v) { return [v, function () {}]; },
    useEffect: function () {}, useRef: function () { return { current: null }; },
    useMemo: function (f) { return f(); }, useCallback: function (f) { return f; },
  }, { get: function (t, k) { return (k in t) ? t[k] : function () {}; } });

  var sb = {
    React: React, console: console, JSON: JSON, Math: Math, Date: Date,
    Object: Object, Array: Array, String: String, Number: Number,
    Boolean: Boolean, RegExp: RegExp, Set: Set, Map: Map, Error: Error,
    parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN,
    setTimeout: setTimeout, clearTimeout: clearTimeout,
  };
  sb.window = sb;
  sb.globalThis = sb;
  sb.document = {
    createElement: function () { return { style: {}, setAttribute: function () {}, appendChild: function () {} }; },
    head: { appendChild: function () {} },
    getElementById: function () { return null; },
    querySelector: function () { return null; },
  };
  sb.localStorage = { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} };
  sb.navigator = { language: 'es' };
  vm.createContext(sb);
  return sb;
}

/* Carga un archivo en el sandbox dentro de su IIFE. `exporta` saca a proposito
   valores LEXICOS que el archivo no publica (`const EXTRA_ROUTINES`, etc.):
   dentro de la IIFE no cruzarian, exactamente igual que en el artefacto. */
function cargar(ctx, sb, f, exporta) {
  var abs = path.join(ctx.ROOT, f);
  if (!fs.existsSync(abs)) return f + ': no existe';
  var code;
  try {
    code = ctx.babel.transformSync(fs.readFileSync(abs, 'utf8'), {
      presets: [[path.join(ctx.ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
      filename: abs, configFile: false, babelrc: false, sourceType: 'script',
    }).code;
  } catch (e) { return f + ' (compilando): ' + e.message.split('\n')[0]; }

  var extra = '';
  if (exporta) {
    Object.keys(exporta).forEach(function (k) {
      extra += ';try{window[' + JSON.stringify(k) + ']=' + exporta[k] + ';}catch(e){}';
    });
  }
  try {
    vm.runInContext(';(function () {\n' + code + '\n' + extra + '\n})();', sb, { filename: abs });
    return null;
  } catch (e) { return f + ': ' + e.message.split('\n')[0]; }
}

function cuentaItems(grupos) {
  return Object.keys(grupos || {}).reduce(function (n, k) {
    return n + (((grupos[k] || {}).items || []).length);
  }, 0);
}

/* Compara un numero contra su censo. Un solo sitio para el mensaje, que dice
   siempre las dos salidas posibles: o falta algo, o el censo esta viejo. */
function censo(ctx, etiqueta, real, esperado) {
  if (real === esperado) { ctx.ok(etiqueta + ': ' + real); return true; }
  ctx.falla(etiqueta + ': ' + real + ', se esperaban ' + esperado +
            ' -- o se ha perdido algo por el camino, o el contenido crecio a ' +
            'proposito y toca subir el numero en CENSO (scripts/verify.integridad.js)');
  return false;
}

function listaCorta(arr, n) {
  var m = n || 6;
  return arr.slice(0, m).join(', ') + (arr.length > m ? ' … (+' + (arr.length - m) + ')' : '');
}

/* ==========================================================================
   i18n -- paridad de claves ES/EN
   ========================================================================== */
function chequeaI18n(ctx, declarados) {
  var strings = declarados.filter(function (f) { return f.indexOf('app/i18n/strings/') === 0; });
  var content = declarados.filter(function (f) { return f.indexOf('app/i18n/content/') === 0; });

  if (!strings.length) {
    ctx.falla('i18n: PACE.html no declara ni un archivo de app/i18n/strings/ -- el analisis no ha mirado nada');
    return;
  }

  /* ORDEN: `content/*` parchea EN por encima de `strings/*` (override D-1), asi
     que tiene que cargar DESPUES del ultimo strings. Si se adelanta, sus
     traducciones de contenido las pisa el catalogo base y nadie se entera. */
  var ultimoStrings = declarados.lastIndexOf(strings[strings.length - 1]);
  var primerContent = content.length ? declarados.indexOf(content[0]) : Infinity;
  if (primerContent < ultimoStrings) {
    ctx.falla('i18n: `' + content[0] + '` carga ANTES de `' + strings[strings.length - 1] +
              '` -- los patches EN de content/* tienen que ir al final (override D-1)');
  } else {
    ctx.ok('orden i18n correcto: ' + strings.length + ' de strings/* y luego ' + content.length + ' de content/*');
  }

  var sb = nuevoSandbox();
  var errores = [];
  strings.forEach(function (f) { var e = cargar(ctx, sb, f); if (e) errores.push(e); });

  var S = sb.PACE_STRINGS || {};
  var esS = Object.keys(S.es || {});
  var enS = Object.keys(S.en || {});
  var setEs = new Set(esS), setEn = new Set(enS);

  content.forEach(function (f) { var e = cargar(ctx, sb, f); if (e) errores.push(e); });
  errores.forEach(function (e) { ctx.falla('i18n: no se pudo evaluar ' + e); });

  var esFinal = Object.keys(S.es || {});
  var enFinal = Object.keys(S.en || {});

  /* RELACIONAL: la biyeccion. Es lo que de verdad no puede fallar nunca. */
  var sinEN = esS.filter(function (k) { return !setEn.has(k); });
  var sinES = enS.filter(function (k) { return !setEs.has(k); });
  if (sinEN.length) ctx.falla('i18n: ' + sinEN.length + ' clave(s) en ES sin su EN: ' + listaCorta(sinEN));
  if (sinES.length) ctx.falla('i18n: ' + sinES.length + ' clave(s) en EN sin su ES: ' + listaCorta(sinES));
  if (!sinEN.length && !sinES.length) {
    ctx.ok('paridad ES/EN en strings/*: ' + esS.length + ' = ' + enS.length + ', biyectiva');
  }
  censo(ctx, 'claves i18n por idioma', esS.length, CENSO.i18nClaves);

  /* RELACIONAL: `content/*` es un patch de INGLES. Si un dia añade una clave ES
     deja de ser un patch y el desequilibrio global se vuelve inexplicable. */
  var contentTocaES = esFinal.filter(function (k) { return !setEs.has(k); });
  if (contentTocaES.length) {
    ctx.falla('i18n: content/* añade ' + contentTocaES.length + ' clave(s) al ESPAÑOL (' +
              listaCorta(contentTocaES) + ') -- content/* solo parchea EN');
  }

  /* El desequilibrio global (509 ES contra 1274 EN) es NORMAL y esta explicado:
     la diferencia son exactamente las claves que aporta content/*. Asertar
     `esFinal === enFinal` seria un rojo permanente por leer mal el diseño. */
  var aportaContent = enFinal.length - enS.length;
  if (enFinal.length - esFinal.length !== aportaContent) {
    ctx.falla('i18n: el desequilibrio global (' + esFinal.length + ' ES contra ' + enFinal.length +
              ' EN) ya no lo explican los patches de content/*');
  } else {
    ctx.ok('desequilibrio global explicado: ' + esFinal.length + ' ES / ' + enFinal.length +
           ' EN = ' + aportaContent + ' claves de contenido solo en EN');
  }
}

/* ==========================================================================
   Precache del service worker
   ========================================================================== */
function chequeaPrecache(ctx, mascaras) {
  var sw = fs.readFileSync(path.join(ctx.ROOT, 'sw.js'), 'utf8');
  var m = sw.match(/const PRECACHE = \[([\s\S]*?)\n\];/);
  if (!m) {
    ctx.falla('precache: no se reconoce el array PRECACHE en sw.js -- el analisis no ha mirado nada');
    return;
  }
  var cuerpo = m[1];

  /* Trampa de s146/s149: `ingest-glifos-logro.js` y compañia leen sw.js POR
     LINEAS, asi que una ruta escrita literal y entrecomillada DENTRO de un
     comentario les cuenta como fila. Por eso las rutas no van en la prosa. */
  var enProsa = [];
  var reCom = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, c;
  while ((c = reCom.exec(cuerpo))) {
    var r = /['"][^'"\n]*\/[^'"\n]*['"]/g, y;
    while ((y = r.exec(c[0]))) enProsa.push(y[0]);
  }
  if (enProsa.length) {
    ctx.falla('precache: ' + enProsa.length + ' ruta(s) escritas literales y entrecomilladas en los ' +
              'COMENTARIOS de PRECACHE (' + listaCorta(enProsa) + ') -- hay scripts que leen sw.js por ' +
              'lineas y las cuentan como fila (regla s146)');
  }

  var filas = [];
  var limpio = cuerpo.replace(reCom, '');
  var re = /'([^']+)'/g, x;
  while ((x = re.exec(limpio))) filas.push(x[1]);

  censo(ctx, 'filas de PRECACHE', filas.length, CENSO.precache);

  var dups = filas.filter(function (v, i) { return filas.indexOf(v) !== i; });
  if (dups.length) ctx.falla('precache: fila(s) duplicadas: ' + listaCorta([...new Set(dups)]));

  /* EL aserto que importa: `addAll` es ATOMICO. Una sola 404 tira el install
     entero y deja al usuario sin offline -- sin ruido en consola de la app. */
  var faltan = filas.filter(function (p) {
    var r = (p === '/') ? 'index.html' : p.replace(/^\//, '');
    return !fs.existsSync(path.join(ctx.ROOT, r));
  });
  if (faltan.length) {
    ctx.falla('precache: ' + faltan.length + ' fila(s) SIN archivo en disco (' + listaCorta(faltan) +
              ') -- `addAll` es atomico: una sola 404 tira el install entero y el usuario se queda sin offline');
  } else {
    ctx.ok(filas.length + ' filas de PRECACHE con archivo real en disco');
  }

  /* RELACIONAL: el mapa de mascaras y el precache tienen que decir lo mismo.
     Arte que entra al mapa y no al precache = sello en blanco offline. */
  if (mascaras) {
    var enPre = new Set(filas.filter(function (p) { return p.indexOf('/app/glyphs/assets/logros/') === 0; }));
    var deMapa = Object.keys(mascaras).map(function (id) { return '/' + mascaras[id]; });
    var sinPre = deMapa.filter(function (p) { return !enPre.has(p); });
    var sobran = [...enPre].filter(function (p) { return deMapa.indexOf(p) < 0; });
    if (sinPre.length) ctx.falla('precache: ' + sinPre.length + ' mascara(s) del mapa que NO estan precacheadas: ' + listaCorta(sinPre));
    if (sobran.length) ctx.falla('precache: ' + sobran.length + ' fila(s) de logros que ya no estan en el mapa: ' + listaCorta(sobran));
    if (!sinPre.length && !sobran.length) ctx.ok(deMapa.length + ' mascaras de logro: mapa y precache coinciden');
  }
}

/* ==========================================================================
   Glifos de ejercicio
   ========================================================================== */
function chequeaGlifosEjercicio(ctx, declarados) {
  var base  = 'app/glyphs/exercise-glyphs.jsx';
  var extra = 'app/glyphs/exercise-glyphs.extra.jsx';

  /* `.extra.jsx` MUTA el mapa del hermano en vez de crear otro (s148). Lleva un
     guard que lanza si se invierte el orden, pero comprobarlo aqui es gratis. */
  var iBase = declarados.indexOf(base), iExtra = declarados.indexOf(extra);
  if (iBase < 0 || iExtra < 0) {
    ctx.falla('glifos: PACE.html no declara ' + (iBase < 0 ? base : extra));
  } else if (iExtra < iBase) {
    ctx.falla('glifos: `' + extra + '` carga ANTES que `' + base + '` -- muta su mapa, no crea uno propio');
  }

  var sb = nuevoSandbox();
  ['app/custom/exercise-aliases.js', base, extra].forEach(function (f) {
    var e = cargar(ctx, sb, f);
    if (e) ctx.falla('glifos: no se pudo evaluar ' + e);
  });
  censo(ctx, 'glifos de ejercicio', Object.keys(sb.EXERCISE_GLYPHS || {}).length, CENSO.glifosEjercicio);
}

/* ==========================================================================
   Logros: catalogo + mascaras. Devuelve el mapa de mascaras para el precache.
   ========================================================================== */
function chequeaLogros(ctx) {
  var sb = nuevoSandbox();
  ['app/glyphs/achievement-glyphs.jsx', 'app/glyphs/achievement-masks.js',
   'app/achievements/catalog.js'].forEach(function (f) {
    var e = cargar(ctx, sb, f);
    if (e) ctx.falla('logros: no se pudo evaluar ' + e);
  });

  var CAT  = sb.ACHIEVEMENT_CATALOG || [];
  var IMP  = [].concat([...(sb.IMPLEMENTED_ACHIEVEMENTS || [])]);
  var META = sb.CAT_META || {};
  var MASK = sb.ACHIEVEMENT_MASKS || {};

  if (!CAT.length) { ctx.falla('logros: el catalogo sale VACIO -- el analisis no ha mirado nada'); return null; }

  var ids = CAT.map(function (a) { return a.id; });
  var setIds = new Set(ids);
  var secretos = new Set(CAT.filter(function (a) { return a.secret; }).map(function (a) { return a.id; }));

  censo(ctx, 'logros en el catalogo', CAT.length, CENSO.logros);
  censo(ctx, 'logros con detector', IMP.length, CENSO.logrosConDetector);
  censo(ctx, 'logros secretos', secretos.size, CENSO.logrosSecretos);
  censo(ctx, 'categorias de logro', Object.keys(META).length, CENSO.categorias);
  /* §15.4: el denominador unico. Es el «N/88» que ve el usuario en la UI, y el
     bug que arreglo s146b fue justo que sidebar y modal dividian por numeros
     distintos. Si esto se descuadra, la promesa de la UI vuelve a mentir. */
  censo(ctx, 'logros disponibles (§15.4, el denominador de la UI)',
        sb.ACHIEVEMENTS_AVAILABLE, CENSO.logrosDisponibles);

  var dup = [...new Set(ids.filter(function (v, i) { return ids.indexOf(v) !== i; }))];
  if (dup.length) ctx.falla('logros: id(s) duplicados en el catalogo: ' + listaCorta(dup));

  var impFuera = IMP.filter(function (id) { return !setIds.has(id); });
  if (impFuera.length) {
    ctx.falla('logros: ' + impFuera.length + ' detector(es) para un id que NO esta en el catalogo (' +
              listaCorta(impFuera) + ') -- nadie puede verlos');
  }

  var catsFuera = [...new Set(CAT.map(function (a) { return a.cat; }))].filter(function (c) { return !META[c]; });
  if (catsFuera.length) ctx.falla('logros: categoria(s) usadas sin entrada en CAT_META: ' + listaCorta(catsFuera));

  /* Un secreto cuenta como DISPONIBLE aunque no tenga detector (§15.4: «su
     mecanica es intriga, no pronto»), asi que entra en el denominador de la UI
     sin que nadie pueda ganarlo. Salio midiendo: quitarle el detector a un
     secreto no movia el denominador, y ese es exactamente el bug que arreglo
     s146b entrando por la puerta de atras. Hoy los 12 secretos tienen detector. */
  var secretosSinDetector = [...secretos].filter(function (id) { return IMP.indexOf(id) < 0; });
  if (secretosSinDetector.length) {
    ctx.falla('logros: ' + secretosSinDetector.length + ' secreto(s) SIN detector (' +
              listaCorta(secretosSinDetector) + ') -- un secreto cuenta como disponible en el ' +
              'denominador de §15.4 aunque nadie pueda ganarlo');
  } else {
    ctx.ok('los ' + secretos.size + ' secretos tienen detector (si no, entrarian en el denominador sin ser ganables)');
  }

  /* --- mascaras --- */
  var maskIds = Object.keys(MASK);
  censo(ctx, 'mascaras de logro en el mapa', maskIds.length, CENSO.mascarasLogro);

  var maskFuera = maskIds.filter(function (id) { return !setIds.has(id); });
  if (maskFuera.length) {
    ctx.falla('mascaras: ' + maskFuera.length + ' mascara(s) para un id que NO esta en el catalogo (' +
              listaCorta(maskFuera) + ') -- ese dibujo no lo ve nadie');
  }

  var sinFichero = maskIds.filter(function (id) { return !fs.existsSync(path.join(ctx.ROOT, MASK[id])); });
  if (sinFichero.length) {
    ctx.falla('mascaras: ' + sinFichero.length + ' entrada(s) del mapa sin su .webp en disco: ' + listaCorta(sinFichero));
  }

  var dirLogros = path.join(ctx.ROOT, 'app', 'glyphs', 'assets', 'logros');
  var enDisco = fs.existsSync(dirLogros)
    ? fs.readdirSync(dirLogros).filter(function (f) { return /\.webp$/.test(f); }) : [];
  var usados = new Set(maskIds.map(function (id) { return path.basename(MASK[id]); }));
  var huerfanos = enDisco.filter(function (f) { return !usados.has(f); });
  if (huerfanos.length) {
    ctx.falla('mascaras: ' + huerfanos.length + ' .webp en disco que el mapa no referencia: ' + listaCorta(huerfanos));
  }
  if (!maskFuera.length && !sinFichero.length && !huerfanos.length) {
    ctx.ok(maskIds.length + ' mascaras: id en el catalogo, .webp en disco y sin huerfanos');
  }

  /* LA CUENTA QUE CONFUNDIO A DOS SESIONES (s150 conto 53 sellos, s151 conto
     54, y el mapa tiene 58). No es un bug de nadie: `Achievements.jsx`
     (`isSecret = a.secret && !unlocked`) pinta una `?` en vez del glifo mientras
     el secreto siga bloqueado, asi que las mascaras de secreto NO se ven hasta
     desbloquear su logro. s151 vio 54 en vez de 53 porque midio el onboarding en
     ingles y eso desbloquea `secret.bilingual`. Se aserta la descomposicion
     entera para que el numero de la pantalla deje de sorprender.
     s167: 77 = 70 visibles + 7 de secreto (entraron secret.dark.mode y
     secret.lunch). Los numeros de arriba eran 58 = 53 + 5. */
  var maskSecretas = maskIds.filter(function (id) { return secretos.has(id); });
  censo(ctx, 'mascaras que solo aparecen al desbloquear su secreto', maskSecretas.length, CENSO.mascarasDeSecreto);
  censo(ctx, 'mascaras que un usuario nuevo ve pintadas', maskIds.length - maskSecretas.length,
        CENSO.mascarasVisiblesDeSalida);

  return MASK;
}

/* ==========================================================================
   Catalogos de contenido
   ========================================================================== */
function chequeaContenido(ctx) {
  var sb = nuevoSandbox();
  /* `MOVE_ROUTINES` es `var` y los otros tres son `const`: dentro de la IIFE
     ninguno cruza, asi que se piden por EXPRESION al cargar cada archivo. */
  [['app/breathe/BreatheLibrary.jsx', { __B: 'BREATHE_ROUTINES' }],
   ['app/move/move.data.js',          { __M: 'MOVE_ROUTINES' }],
   ['app/extra/ExtraModule.jsx',      { __E: 'EXTRA_ROUTINES' }],
   ['app/paths/registry.js',          { __P: 'PATH_CATALOG' }]].forEach(function (par) {
    var e = cargar(ctx, sb, par[0], par[1]);
    if (e) ctx.falla('catalogos: no se pudo evaluar ' + e);
  });

  censo(ctx, 'rutinas de Respira', cuentaItems(sb.__B), CENSO.respira);
  censo(ctx, 'rutinas de Mueve',   cuentaItems(sb.__M), CENSO.mueve);
  censo(ctx, 'rutinas de Estira',  cuentaItems(sb.__E), CENSO.estira);
  censo(ctx, 'Caminos', (sb.__P || []).length, CENSO.caminos);
}

/* ========================================================================== */
function tandaIntegridad(ctx, declarados) {
  console.log('\n[4/4] Integridad de catalogos, i18n, precache y glifos ...');
  chequeaI18n(ctx, declarados);
  chequeaGlifosEjercicio(ctx, declarados);
  var mascaras = chequeaLogros(ctx);
  chequeaPrecache(ctx, mascaras);
  chequeaContenido(ctx);
  eventos.chequeaEventos(ctx, declarados, listaCorta);
}

/* Lo que ESTA tanda sigue sin cubrir. Se suma al bloque que verify.js imprime
   en cada pasada, tambien en verde: lo que se añade, se declara. */
var NO_CUBRE = [
  'i18n: que la clave EXISTA en los dos idiomas, no que el texto este traducido, ' +
    'sea correcto ni QUEPA (s151: 85 px por columna en la placa del onboarding)',
  'catalogos: se cuentan entradas, no se valida su contenido (dosis, cues, pasos, acceso)',
  /* s154: la segunda mitad de este hueco ya la cubre «npm run test:e2e», que
     compara las rutas DECLARADAS aqui con las que el navegador tiene de verdad
     en su cache. Lo que sigue sin cubrir este script es el disco contra el
     servidor. */
  'precache: que el archivo exista en DISCO, no que el navegador lo cachee ' +
    '-- el contraste con la cache real lo hace «npm run test:e2e» (s154)',
  'glifos: se cuentan mapa y ficheros -- ni un pixel del dibujo se mira',
  'los numeros del CENSO son un censo: si el contenido crece a proposito, hay que subirlos a mano',
];

module.exports = { tandaIntegridad: tandaIntegridad,
                   NO_CUBRE: NO_CUBRE.concat(eventos.NO_CUBRE_EVENTOS), CENSO: CENSO };
