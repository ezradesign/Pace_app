/* PACE · scripts/ingest-glifos-ejercicio.mapa.js (sesión 173)
   LA ESCRITURA del mapa de máscaras y de las filas de precache, sacada de la
   ingesta al rebasar ésta las 500 líneas (regla §1 de CLAUDE.md) — hermano de
   `.geometria.js`, y por la misma razón: aquí vive UNA decisión, y es la que
   s173 tuvo que cambiar.

   POR QUÉ NACE ESTE ARCHIVO, o sea qué es `--fusionar`
   ----------------------------------------------------
   Hasta s172 la ingesta reescribía el objeto `EXERCISE_MASKS` ENTERO desde los
   PNG que encontraba en la carpeta de origen. Eso convertía cada tanda nueva en
   una operación de todo-o-nada: para meter 4 dibujos había que tener delante
   los 57 que ya estaban, con su nombre-slug, o desaparecían del mapa y del
   precache. Y los originales del usuario llegan con nombres opacos
   (`asset_8z7zeo4s1_...png`), así que «tenerlos delante» significaba
   reconstruir el set emparejando por CONTENIDO — el script que s171 escribió,
   dejó en un scratchpad y se perdió.

   La trampa no era teórica: está escrita en el handoff de s173 como la primera
   de la ingesta. `--fusionar` la mata. En modo fusión las identidades que NO
   vienen en la carpeta de origen CONSERVAN su fila, así que una tanda nueva es
   «suelta los archivos nuevos y corre».

   LO QUE **NO** SE RELAJA, y es lo que hace que fusionar siga siendo seguro:

     · una fila conservada tiene que apuntar a un archivo QUE EXISTA en disco.
       Si no existe, es un fallo explícito y no se escribe nada: conservar una
       fila rota es exactamente el «verde que no mira nada» que la regla D-4
       quiere evitar.
     · si al leer el mapa existente no se reconoce NI UNA fila, es FALLO, no
       «no había nada que conservar». Cero elementos reconocidos nunca puede
       parecerse a un censo limpio (la regla que el `verify` aplica desde s150).
     · los PNG huérfanos siguen siendo salida 1. Fusionar arregla el lado de las
       identidades, no el de los dibujos que nadie reclama.

   Es CASI puro: recibe filas y rutas, lee y escribe los dos archivos que le
   dicen, y no sabe nada de píxeles ni de emparejamiento.
*/
'use strict';

const fs = require('fs');

const PREFIJO = 'app/glyphs/assets/ejercicios/';

/* Una fila del mapa tal y como la escribe este mismo módulo:
     `  'Gato camello': 'app/glyphs/assets/ejercicios/gato-camello.webp',`
   El id puede llevar comilla simple escapada, porque así la escribimos. */
const FILA = /^\s*'((?:[^'\\]|\\.)*)'\s*:\s*'([^']+)'\s*,?\s*$/;

/* Extrae el cuerpo de un objeto `const <nombre> = {` … `};` del fuente.
   Devuelve null si no está: quien llama decide si eso es fallo. */
function cuerpoDe(src, nombre) {
  const ini = src.indexOf('const ' + nombre + ' = {');
  if (ini === -1) return null;
  const fin = src.indexOf('};', ini);
  if (fin === -1) return null;
  return { ini, fin, texto: src.slice(src.indexOf('{', ini) + 1, fin) };
}

/* Lee el mapa que YA está escrito. Devuelve `{ id: ruta }` por cada objeto. */
function leerMapaExistente(mapaSrc) {
  const salida = {};
  for (const nombre of ['EXERCISE_MASKS', 'EXERCISE_MASKS_MIN']) {
    const bloque = cuerpoDe(mapaSrc, nombre);
    const filas = {};
    if (bloque) {
      for (const linea of bloque.texto.split('\n')) {
        const m = FILA.exec(linea);
        if (m) filas[m[1].replace(/\\'/g, "'")] = m[2];
      }
    }
    salida[nombre] = filas;
  }
  return salida;
}

/* FUSIÓN. `filas` son las identidades reciÉn ingestadas (mandan siempre: un
   dibujo nuevo SUSTITUYE al viejo de la misma identidad). A ellas se les suman
   las que el mapa ya tenía y que esta tanda no toca.

   Devuelve `{ filas, conservadas, errores }`. Nunca lanza: quien llama decide
   qué hacer con `errores`, y así el mensaje sale por el mismo sitio que los
   demás de la ingesta. */
function fusionarConMapa(filas, mapaSrc, raiz) {
  const path = require('path');
  const previo = leerMapaExistente(mapaSrc);
  const grandes = previo.EXERCISE_MASKS;
  const minis = previo.EXERCISE_MASKS_MIN;
  const errores = [];

  const ids = Object.keys(grandes);
  if (!ids.length) {
    errores.push('el mapa existente no tiene NI UNA fila reconocible en ' +
                 'EXERCISE_MASKS: fusionar aquí conservaría cero identidades, ' +
                 'que es lo mismo que reescribir el mapa entero sin decirlo');
    return { filas: filas, conservadas: 0, errores: errores };
  }

  const yaIngestadas = new Set(filas.map(f => f.id));
  const conservadas = [];
  for (const id of ids) {
    if (yaIngestadas.has(id)) continue;          // la tanda nueva manda
    const ruta = grandes[id];
    const rutaMin = minis[id] || null;
    /* Una fila conservada apunta a un .webp que tiene que seguir en disco. */
    for (const r of [ruta, rutaMin]) {
      if (r && !fs.existsSync(path.join(raiz, r))) {
        errores.push("fila conservada de '" + id + "' apunta a un archivo que " +
                     'no existe: ' + r);
      }
    }
    conservadas.push({ id: id, ruta: ruta, rutaMin: rutaMin });
  }

  return { filas: filas.concat(conservadas), conservadas: conservadas.length, errores: errores };
}

/* Reescribe SOLO los dos objetos del mapa, nunca el archivo entero.

   El mapa de MINIATURAS se escribe con RUTAS LITERALES igual que el grande: el
   inliner del build sustituye referencias TEXTUALES, así que una ruta armada
   por concatenación no se inlinearía y el standalone se quedaría sin arte
   (trampa documentada en la cabecera de `exercise-masks.js`). */
function escribirMapa(filas, MAPA) {
  const mapaSrc = fs.readFileSync(MAPA, 'utf8');
  const ini = mapaSrc.indexOf('const EXERCISE_MASKS = {');
  const fin = mapaSrc.indexOf('};', ini);
  if (ini === -1 || fin === -1) {
    return 'No encuentro el objeto EXERCISE_MASKS: no se toca nada.';
  }
  const linea = (id, ruta) => "  '" + id.replace(/'/g, "\\'") + "': '" + ruta + "',";
  const orden = (a, b) => a.id.localeCompare(b.id);

  const cuerpo = filas.slice().sort(orden).map(f => linea(f.id, f.ruta)).join('\n');
  let mapaNuevo = mapaSrc.slice(0, ini) + 'const EXERCISE_MASKS = {\n' + cuerpo + '\n' + mapaSrc.slice(fin);

  const iniMin = mapaNuevo.indexOf('const EXERCISE_MASKS_MIN = {');
  const finMin = iniMin === -1 ? -1 : mapaNuevo.indexOf('};', iniMin);
  if (iniMin === -1 || finMin === -1) {
    return 'No encuentro EXERCISE_MASKS_MIN: no se escribe el mapa de miniaturas.';
  }
  const cuerpoMin = filas.filter(f => f.rutaMin).sort(orden)
    .map(f => linea(f.id, f.rutaMin)).join('\n');
  mapaNuevo = mapaNuevo.slice(0, iniMin) + 'const EXERCISE_MASKS_MIN = {\n' + cuerpoMin + '\n' + mapaNuevo.slice(finMin);

  fs.writeFileSync(MAPA, mapaNuevo);
  return null;
}

/* Las filas de ESTA carpeta se regeneran enteras dentro de PRECACHE. Con
   `--fusionar`, «enteras» sigue siendo cierto porque `filas` ya viene fusionada:
   el precache y el mapa se escriben de la MISMA lista, que es justo lo que hace
   que no puedan desincronizarse. */
function escribirPrecache(filas, SW) {
  const swSrc = fs.readFileSync(SW, 'utf8');
  const lineas = swSrc.split('\n').filter(l => l.indexOf(PREFIJO) === -1);
  const iPre = lineas.findIndex(l => l.indexOf('const PRECACHE = [') !== -1);
  if (iPre === -1) return 'No encuentro PRECACHE en sw.js.';
  const rutas = [];
  filas.forEach(f => { rutas.push(f.ruta); if (f.rutaMin) rutas.push(f.rutaMin); });
  lineas.splice(iPre + 1, 0, ...rutas.sort().map(r => "  '/" + r + "',"));
  fs.writeFileSync(SW, lineas.join('\n'));
  return null;
}

module.exports = { leerMapaExistente, fusionarConMapa, escribirMapa, escribirPrecache };
