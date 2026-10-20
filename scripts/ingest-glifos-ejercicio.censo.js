/* PACE · scripts/ingest-glifos-ejercicio.censo.js (sesión 173)
   QUE IDENTIDADES VISUALES PIDE LA APP, y como se normaliza un nombre a slug.
   Sale de la ingesta al rebasar ésta las 500 líneas (regla §1 de CLAUDE.md) —
   tercer hermano de `.geometria.js` (el encuadre) y `.mapa.js` (la escritura).

   Se eligió ESTA costura y no otra porque aquí no hay ni un píxel: es el CENSO,
   y es la mitad del script que más se ha equivocado. s164 dio 61 identidades,
   s172 descubrió que eran 62 —el patrón pedía `mode:` detrás del nombre y los
   pasos legacy declaran `dur:`— y el número parecía bueno porque coincidía con
   otro censo que arrastraba el mismo punto ciego. Vive aparte para que se pueda
   leer y corregir sin tocar el emparejamiento ni la escritura del mapa.

   Es CASI puro: lee el árbol (los dos catálogos y el registro) y devuelve una
   lista de nombres. No escribe nada.
*/
'use strict';

const fs = require('fs');
const path = require('path');

/* `ROOT` venia del ambito del script que alojaba estas dos funciones. Al salir
   a su propio archivo deja de existir y hay que redeclararlo: es el mismo modo
   de fallo que el crash de s144 —un identificador que resolvia por el ambito de
   alrededor y dentro de otro no liga—, solo que aqui el `verify` no mira, porque
   su analisis de ambito es del artefacto compilado y esto es `scripts/`. */
const ROOT = path.resolve(__dirname, '..');

/* --- slug: la misma normalización en las dos direcciones, o no casa nada --- */
function slug(s) {
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // fuera acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* --- las identidades visuales que la app necesita --------------------------
   Se leen del ARBOL, no de una lista escrita a mano: el censo de s164 ya
   demostro que la lista y el codigo divergen en cuanto alguien añade un paso. */
function identidadesVisuales() {
  const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));
  const win = {};
  const cargar = rel => {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const code = babel.transformSync(src, {
      configFile: false, babelrc: false, sourceType: 'script', filename: rel,
      presets: [[path.join(ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
    }).code;
    new Function('window', 'React', '"use strict";(function(){' + code + '})();')(
      win, { createElement: () => null, Fragment: 'F' });
  };
  cargar('app/custom/exercise-registry.js');
  cargar('app/custom/exercise-aliases.js');
  cargar('app/glyphs/exercise-glyphs.jsx');
  cargar('app/glyphs/exercise-glyphs.extra.jsx');
  /* LOS DOS CATALOGOS, EVALUADOS. Hasta s182 los pasos se sacaban del FUENTE
     con una expresion regular, y en s178 eso se quedo ciego: aquella sesion
     troceo el dato de Estira a `extra.data.js` + `extra.data.piernas.js` y
     dejo `ExtraModule.jsx` -- el archivo que este censo leia-- con CERO pasos.
     El censo siguio dando un numero creible (61 en vez de 62) porque el
     registro tapaba 24 de las 25 identidades de Estira; la que se perdia,
     `Puente isquio a una pierna`, resulta que SI tiene arte, asi que
     regenerar el encargo hoy habria escrito una identidad de menos y una fila
     de arte aparentemente huerfana. Es el mismo modo de fallo que el propio
     archivo documenta de s164 y s172, por tercera vez y por tercera causa.
     Se evaluan y punto: un troceo mas no puede volver a cegar esto, porque el
     orden de carga ya es contrato (s178) y el objeto final es el que la app
     consume. `extra.data.piernas.js` AÑADE grupos con `Object.assign` y aborta
     si el primero no esta, asi que el orden de estas dos lineas importa. */
  cargar('app/move/move.data.js');
  cargar('app/extra/extra.data.js');
  cargar('app/extra/extra.data.piernas.js');

  /* EL REGISTRO NO BASTA, y la primera version de este script lo daba por
     bueno: leyendo solo `EXERCISE_REGISTRY` + `EXERCISE_GLYPHS` salian 51
     identidades, cuando el censo de s164 dice 61. Faltaban los nombres que
     solo viven en los PASOS de las rutinas. Y esos no se pueden leer de
     `window`: `EXTRA_ROUTINES` NO se publica (ExtraModule.jsx solo exporta
     `ExtraLibrary`) y `MOVE_ROUTINES` es un objeto de grupos. Se sacan del
     FUENTE con el mismo patron que usa `scripts/audit/censo-glifos-ejercicio.js`,
     que ya pago este descubrimiento.
     `Descanso` se excluye igual que alli: no es un ejercicio. */
  const registro = win.EXERCISE_REGISTRY || {};
  const resolver = win.resolveVisualId || (n => n);
  const nombres = new Set();
  const meter = n => { if (n && n !== 'Descanso') nombres.add(resolver(n)); };
  Object.keys(registro).forEach(k => (registro[k].items || []).forEach(e => meter(e.name)));
  /* NO se meten las claves de EXERCISE_GLYPHS: son lo DIBUJADO, no lo
     NECESARIO, y hay 6 dibujos que no los usa nadie (censo de s164). Con esa
     linea la lista daba 62 contra los 61 del censo, asi que la ingesta habria
     exigido para siempre un PNG de mas -- y justo de una pieza que el encargo
     dice EXPRESAMENTE que no hay que rehacer. La lista es lo que la app PIDE. */
  /* HISTORIA, y se conserva porque explica dos de los tres numeros erroneos que
     ha dado este censo. El PATRON al que se refiere ya no existe desde s182.

     s172 · EL PATRON VEIA SOLO LA MITAD. Pedia `mode:` detras del nombre, y eso
     es el contrato del runner v1: los pasos LEGACY declaran `dur:`. Se colaba
     por el hueco `Puente isquio a una pierna` (un paso de `move.atg.knees`),
     asi que el censo decia 61 identidades donde hay 62 y «4 pendientes» donde
     hay 5. Y no saltaba nada: el numero salia redondo porque coincidia con el
     censo de s164, que arrastraba el mismo punto ciego.
     El encargo ademas la daba por «dibujo que no usa nadie», y de los cinco de
     esa lista es la UNICA sin alias que la tape — o sea, la unica que si se ve.
     Dos errores independientes que se cancelaban en un numero creible. */
  /* s182 · SE RECORREN LOS OBJETOS, no el fuente. La expresion regular que
     vivia aqui («name: '...' seguido de mode: o dur:») ya no hace falta: leer
     el catalogo evaluado no depende de en que archivo este escrito ni de con
     que sintaxis, que eran las dos cosas que lo rompieron en s172 y s178. */
  const catalogos = [
    ['Mueve', win.MOVE_ROUTINES],
    ['Estira', win.EXTRA_ROUTINES],
  ];
  for (const [modulo, cat] of catalogos) {
    let pasos = 0;
    Object.keys(cat || {}).forEach(g => ((cat[g] || {}).items || []).forEach(r => {
      (r.steps || []).forEach(p => { pasos++; meter(p.name); });
    }));
    /* GUARD DE CERO, y no es adorno: es EXACTAMENTE el fallo que hubo. Un
       catalogo vacio no da error -- da un censo mas corto, creible y en
       silencio. Cero pasos en un modulo nunca puede parecerse a un censo
       limpio (la regla que el `verify` aplica desde s150). */
    if (pasos === 0) {
      throw new Error('censo de identidades: ' + modulo + ' no aporta NI UN paso. '
        + 'O el catalogo cambio de nombre, o se troceo a un archivo que este script '
        + 'no carga. Un censo mas corto y silencioso es peor que este fallo.');
    }
  }
  return [...nombres].sort();
}


module.exports = { slug, identidadesVisuales };
