/**
 * verify.mascaras.js - PACE · el mapa de máscaras de EJERCICIO no pierde filas (s173)
 *
 * No es un script suelto: lo invoca `verify.integridad.js` dentro de la tanda
 * [4/4] de `npm run verify`. Vive aparte solo por tamaño (regla §1 de
 * CLAUDE.md: `verify.integridad.js` ya iba por 461 de 500, y la regla dice
 * TROCEAR, no recortar comentarios hasta caber).
 *
 * POR QUE EXISTE, y por que justo ahora. Hasta s173 el arte de EJERCICIO no
 * tenia ni una comprobacion relacional: el precache cruzaba sus filas con el
 * mapa de LOGROS y nada mas. Los 57 dibujos de ejercicio entraban al mapa, al
 * disco y al precache por tres caminos que nadie contrastaba entre si.
 *
 * Eso importaba poco mientras la ingesta fuera todo-o-nada — reescribia el
 * mapa entero desde la carpeta de origen, asi que las tres cosas salian de la
 * misma pasada. s173 le añade `--fusionar` (las identidades que no vienen en
 * la carpeta conservan su fila) y con eso aparece un modo de fallo nuevo y
 * MUDO: una fila que se conserva apuntando a un archivo que ya no esta, o un
 * .webp que se queda en disco sin fila. Ninguna de las dos cosas rompe nada en
 * pantalla — el glifo cae a su SVG viejo y el usuario ve *otro ejercicio*.
 *
 * LAS CINCO SON RELACIONALES. Ningun numero vive aqui dentro: se cruzan mapa,
 * disco y precache entre si. Si el arte crece, esto no caduca; se pone rojo
 * solo cuando dos de las tres fuentes dejan de decir lo mismo. (El CENSO de
 * cuantas filas de precache hay sigue donde estaba, en `verify.integridad.js`:
 * censo y relacional no se mezclan.)
 *
 * LAS DOS DIRECCIONES, que es lo que hace que esto sirva (leccion de s169):
 *   - lo que SOBRA (un .webp sin fila) se ve listando la carpeta.
 *   - lo que FALTA (una fila sin archivo, una identidad sin miniatura) NO se ve
 *     leyendo, y es el fallo por omision. Una comprobacion por SENTIDO.
 *
 * Y EL GUARD DE CERO no es decorado: si el mapa se vaciara entero —que es
 * exactamente lo que hacia la ingesta sin `--fusionar` con una carpeta de 4
 * archivos— las cinco comprobaciones cruzarian conjuntos vacios y saldrian
 * VERDES. Cero elementos reconocidos es FALLO explicito.
 */

'use strict';

var fs   = require('fs');
var path = require('path');

var sandbox = require('./verify.sandbox.js');
var MAPA    = 'app/glyphs/exercise-masks.js';
var CARPETA = 'app/glyphs/assets/ejercicios';
var PREFIJO = '/app/glyphs/assets/ejercicios/';

/* `filasPre` son las filas de PRECACHE ya parseadas por `chequeaPrecache`: se
   le pasan en vez de volver a leer sw.js, porque dos parseos del mismo array
   pueden divergir y entonces el rojo no diria nada. */
function chequeaMascarasEjercicio(ctx, filasPre, listaCorta) {
  var sb = sandbox.nuevoSandbox();
  var e = sandbox.cargar(ctx, sb, MAPA);
  if (e) { ctx.falla('mascaras de ejercicio: no se pudo evaluar ' + e); return; }

  var grandes = sb.EXERCISE_MASKS || {};
  var minis   = sb.EXERCISE_MASKS_MIN || {};
  var ids     = Object.keys(grandes);

  /* --- GUARD DE CERO ----------------------------------------------------- */
  if (!ids.length) {
    ctx.falla('mascaras de ejercicio: EXERCISE_MASKS esta VACIO -- las cuatro ' +
              'comprobaciones de abajo cruzarian conjuntos vacios y saldrian ' +
              'verdes. Un mapa sin filas es el resultado de una ingesta sin ' +
              '`--fusionar` sobre una carpeta parcial (s173)');
    return;
  }

  /* --- 1 · MAPA -> DISCO -------------------------------------------------- */
  var sinArchivo = [];
  ids.forEach(function (id) {
    if (!fs.existsSync(path.join(ctx.ROOT, grandes[id]))) sinArchivo.push(id);
  });
  Object.keys(minis).forEach(function (id) {
    if (!fs.existsSync(path.join(ctx.ROOT, minis[id]))) sinArchivo.push(id + ' (min)');
  });
  if (sinArchivo.length) {
    ctx.falla('mascaras de ejercicio: ' + sinArchivo.length + ' fila(s) del mapa SIN archivo en disco (' +
              listaCorta(sinArchivo) + ') -- el glifo cae a su SVG viejo y el usuario ve OTRO ejercicio, ' +
              'sin un solo error en consola');
  } else {
    ctx.ok(ids.length + ' mascaras de ejercicio: toda fila del mapa tiene su archivo');
  }

  /* --- 2 · DISCO -> MAPA -------------------------------------------------- */
  var enDisco = [];
  try {
    enDisco = fs.readdirSync(path.join(ctx.ROOT, CARPETA)).filter(function (f) {
      return /\.webp$/i.test(f);
    });
  } catch (err) {
    ctx.falla('mascaras de ejercicio: no se puede listar ' + CARPETA + ' -- ' + err.message);
    return;
  }
  var referenciados = {};
  ids.forEach(function (id) { referenciados[path.basename(grandes[id])] = true; });
  Object.keys(minis).forEach(function (id) { referenciados[path.basename(minis[id])] = true; });
  var huerfanos = enDisco.filter(function (f) { return !referenciados[f]; });
  if (huerfanos.length) {
    ctx.falla('mascaras de ejercicio: ' + huerfanos.length + ' .webp en disco que NINGUNA fila reclama (' +
              listaCorta(huerfanos) + ') -- o sobra el archivo, o la fila se perdio al reescribir el mapa');
  } else {
    ctx.ok(enDisco.length + ' .webp de ejercicio en disco, todos reclamados por el mapa');
  }

  /* --- 3 · GRANDE <-> MINIATURA ------------------------------------------ */
  var sinMini = ids.filter(function (id) { return !minis[id]; });
  var miniSuelta = Object.keys(minis).filter(function (id) { return !grandes[id]; });
  if (sinMini.length) {
    ctx.falla('mascaras de ejercicio: ' + sinMini.length + ' identidad(es) con mascara grande y SIN miniatura (' +
              listaCorta(sinMini) + ') -- `exerciseMaskUrl` cae a la grande a 30 px y la linea fina se pierde (s170)');
  }
  if (miniSuelta.length) {
    ctx.falla('mascaras de ejercicio: ' + miniSuelta.length + ' miniatura(s) sin su mascara grande (' +
              listaCorta(miniSuelta) + ')');
  }
  if (!sinMini.length && !miniSuelta.length) {
    ctx.ok(ids.length + ' identidades de ejercicio con mascara grande Y miniatura');
  }

  /* --- 4 y 5 · MAPA <-> PRECACHE, en los dos sentidos --------------------- */
  if (!filasPre) return;
  var enPre = new Set(filasPre.filter(function (p) { return p.indexOf(PREFIJO) === 0; }));
  var delMapa = [];
  ids.forEach(function (id) { delMapa.push('/' + grandes[id]); });
  Object.keys(minis).forEach(function (id) { delMapa.push('/' + minis[id]); });

  var sinPre = delMapa.filter(function (p) { return !enPre.has(p); });
  var sobran = [].concat(Array.from(enPre)).filter(function (p) { return delMapa.indexOf(p) < 0; });
  if (sinPre.length) {
    ctx.falla('precache: ' + sinPre.length + ' mascara(s) de EJERCICIO del mapa que NO estan precacheadas (' +
              listaCorta(sinPre) + ') -- glifo en blanco offline');
  }
  if (sobran.length) {
    ctx.falla('precache: ' + sobran.length + ' fila(s) de ejercicio que ya no estan en el mapa (' +
              listaCorta(sobran) + ')');
  }
  if (!sinPre.length && !sobran.length) {
    ctx.ok(delMapa.length + ' rutas de mascara de ejercicio: mapa y precache coinciden');
  }
}

var NO_CUBRE_MASCARAS = [
  'mascaras de ejercicio: se cruzan mapa, disco y precache -- de si el DIBUJO es el ' +
    'ejercicio correcto no se mira un pixel, y ese fallo ya ha existido (s172: «Fondos ' +
    'en silla» sin silla parecia otro ejercicio durante dos versiones)',
  'mascaras de ejercicio: no se comprueba que TODA identidad que la app pide tenga fila ' +
    '-- faltar arte es legitimo (el glifo cae a su SVG), y quien lleva esa cuenta es ' +
    '`docs/product/GLIFOS_A_DIBUJAR.md` con su generador',
];

module.exports = { chequeaMascarasEjercicio: chequeaMascarasEjercicio,
                   NO_CUBRE_MASCARAS: NO_CUBRE_MASCARAS };
