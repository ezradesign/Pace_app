/* PACE · scripts/ingest-glifos-ejercicio.js (sesión 166)
   Ingesta de los 62 dibujos de EJERCICIO del rediseño: convierte los PNG del
   usuario en MÁSCARAS CSS dentro de `app/glyphs/assets/ejercicios/`, reescribe
   el mapa de `app/glyphs/exercise-masks.js` y las filas de precache de `sw.js`.

   Uso:  node scripts/ingest-glifos-ejercicio.js [--origen <carpeta>] [--seco]
         --origen  carpeta con los PNG (por defecto ../Glifos_ejercicios)
         --seco    no escribe nada: solo informa del emparejamiento

   HERMANO DE `ingest-glifos-logro.js` (s146) Y CON SUS MISMAS RAZONES
   -------------------------------------------------------------------
   Máscara y no imagen: la forma la pone el dibujo y el color lo pone el token
   del módulo, así que un trazo pálido llega al mismo peso que uno oscuro y se
   conserva el tintado por token. Con una imagen a color eso se pierde.

   La NORMALIZACIÓN POR EL PÍXEL MÁS OSCURO de cada dibujo —`(SUELO - L) /
   (SUELO - Lmin)`— no es un ajuste fino: sin ella una línea de L 187 sale al
   21 % de opacidad, o sea MÁS tenue que el original. Es la trampa que costó
   una pasada en falso en s146 y la misma que resolvió la ingesta del loto.

   LO QUE CAMBIA RESPECTO A LOS LOGROS, y por qué
   -----------------------------------------------
   1. LA CLAVE ES LA IDENTIDAD VISUAL, no el ejercicio. Varios ejercicios
      comparten dibujo vía `VISUAL_ALIAS` (s110), así que el mapa se indexa por
      `resolveVisualId()`. Mapear por nombre de ejercicio dejaría alias
      apuntando a nada — s141 ya se comió que «un alias TAPA el glifo propio» y
      que así murieron 5 dibujos.
   2. EL EMPAREJAMIENTO ES POR SLUG DEL NOMBRE, que es lo que el encargo pidió
      al generador («el nombre del ejercicio en minúsculas y sin acentos»). Es
      una CLAVE ESTABLE, no una posición: la lección de s146 sigue en pie —
      indexar por posición en la carpeta reasignó los 50 glifos en silencio al
      subir 8 dibujos más.
   3. SALIDA 384 px y no 224: estos se pintan hasta ~200 px CSS en el runner,
      contra los 56 px del sello de logro. 384 cubre DPR 2 en el runner y sobra
      en la miniatura de 30 px.

   NADA SE EMPAREJA A CIEGAS: los PNG que no casen con ninguna identidad visual
   se listan y NO se ingestan, y las identidades que se queden sin dibujo se
   listan también. El script sale con 1 si hay huérfanos por cualquiera de los
   dos lados, porque un emparejamiento parcial silencioso es exactamente el
   fallo que la regla D-4 quiere evitar.

   Regla D-4: el arte se mide UNA vez. Si el usuario aporta dibujos nuevos se
   RE-CORRE este script; nunca se retoca un .webp a mano.
*/
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const SECO = args.includes('--seco');
const iOrigen = args.indexOf('--origen');
const ORIGEN = iOrigen !== -1 && args[iOrigen + 1]
  ? path.resolve(args[iOrigen + 1])
  : path.resolve(ROOT, '..', 'Glifos_ejercicios');
const DESTINO = path.join(ROOT, 'app', 'glyphs', 'assets', 'ejercicios');
const MAPA = path.join(ROOT, 'app', 'glyphs', 'exercise-masks.js');
const SW = path.join(ROOT, 'sw.js');

/* El fondo de estos PNG no es blanco puro (medido en s146 sobre el arte de
   logro: 21 valores distintos entre 240 y 255 en una esquina de 200x200). Sin
   suelo, la máscara deja un velo sobre todo el dibujo. */
const SUELO = 238;
const LADO = 384;

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
  const PASOS = /name: '([^']+)', mode:/g;
  for (const rel of ['app/move/move.data.js', 'app/extra/ExtraModule.jsx']) {
    const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    let m;
    while ((m = PASOS.exec(txt))) meter(m[1]);
  }
  return [...nombres].sort();
}

(async () => {
  if (!fs.existsSync(ORIGEN)) {
    console.error('\n  No existe la carpeta de origen:\n    ' + ORIGEN +
      '\n\n  Pasa la carpeta con --origen <ruta>, o crea esa. El encargo y el\n' +
      '  formato de los PNG estan en docs/product/GLIFOS_EJERCICIOS_REDISENO.md\n');
    process.exit(1);
  }
  const sharp = require(path.join(ROOT, 'node_modules', 'sharp'));

  const pngs = fs.readdirSync(ORIGEN).filter(f => /\.png$/i.test(f));
  const ids = identidadesVisuales();
  const porSlug = new Map(ids.map(id => [slug(id), id]));

  const parejas = [];
  const huerfanosPng = [];
  for (const f of pngs) {
    const s = slug(f.replace(/\.png$/i, ''));
    const id = porSlug.get(s);
    if (id) parejas.push({ archivo: f, id, s });
    else huerfanosPng.push(f);
  }
  const conDibujo = new Set(parejas.map(p => p.id));
  const sinDibujo = ids.filter(id => !conDibujo.has(id));

  console.log('\n  identidades visuales que la app necesita: ' + ids.length);
  console.log('  PNG en origen: ' + pngs.length);
  console.log('  emparejados: ' + parejas.length);
  console.log('  PNG sin identidad que los reclame: ' + huerfanosPng.length +
    (huerfanosPng.length ? '\n    ' + huerfanosPng.join('\n    ') : ''));
  console.log('  identidades sin dibujo: ' + sinDibujo.length +
    (sinDibujo.length ? '\n    ' + sinDibujo.join('\n    ') : ''));

  if (SECO) { console.log('\n  --seco: no se ha escrito nada.\n'); process.exit(0); }
  if (!parejas.length) { console.error('\n  Nada que ingestar.\n'); process.exit(1); }

  fs.mkdirSync(DESTINO, { recursive: true });
  const filas = [];
  for (const p of parejas) {
    const buf = await sharp(path.join(ORIGEN, p.archivo))
      .resize(LADO, LADO, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .greyscale().raw().toBuffer();

    /* Lmin del dibujo: sin normalizar por el pixel MAS OSCURO, un trazo palido
       sale mas tenue que el original. Trampa medida en s146. */
    let lmin = 255;
    for (let i = 0; i < buf.length; i++) if (buf[i] < lmin) lmin = buf[i];
    const rango = Math.max(1, SUELO - lmin);

    const alfa = Buffer.alloc(LADO * LADO);
    for (let i = 0; i < alfa.length; i++) {
      const L = buf[i];
      alfa[i] = L >= SUELO ? 0 : Math.min(255, Math.round(((SUELO - L) / rango) * 255));
    }
    /* El dibujo ENTERO viaja en el ALFA: el color es irrelevante (lo pone el
       token) y por eso el RGB va a negro plano. alphaQuality 100 porque con
       perdida las lineas finas se motean -- leccion del loto (s138). */
    const rgba = Buffer.alloc(LADO * LADO * 4);
    for (let i = 0; i < alfa.length; i++) rgba[i * 4 + 3] = alfa[i];

    const salida = path.join(DESTINO, p.s + '.webp');
    await sharp(rgba, { raw: { width: LADO, height: LADO, channels: 4 } })
      .webp({ alphaQuality: 100, quality: 90 })
      .toFile(salida);
    filas.push({ id: p.id, ruta: 'app/glyphs/assets/ejercicios/' + p.s + '.webp' });
    console.log('  · ' + p.archivo.padEnd(38) + '-> ' + p.id);
  }

  /* --- reescribe SOLO el objeto del mapa, nunca el archivo entero ---------- */
  const mapaSrc = fs.readFileSync(MAPA, 'utf8');
  const ini = mapaSrc.indexOf('const EXERCISE_MASKS = {');
  const fin = mapaSrc.indexOf('};', ini);
  if (ini === -1 || fin === -1) {
    console.error('\n  No encuentro el objeto EXERCISE_MASKS: no se toca nada.\n');
    process.exit(1);
  }
  const cuerpo = filas
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(f => "  '" + f.id.replace(/'/g, "\\'") + "': '" + f.ruta + "',")
    .join('\n');
  fs.writeFileSync(MAPA,
    mapaSrc.slice(0, ini) + 'const EXERCISE_MASKS = {\n' + cuerpo + '\n' + mapaSrc.slice(fin));

  /* --- precache: las filas de esta carpeta se regeneran enteras ------------ */
  const swSrc = fs.readFileSync(SW, 'utf8');
  const prefijo = 'app/glyphs/assets/ejercicios/';
  const lineas = swSrc.split('\n').filter(l => l.indexOf(prefijo) === -1);
  const iPre = lineas.findIndex(l => l.indexOf('const PRECACHE = [') !== -1);
  if (iPre === -1) { console.error('\n  No encuentro PRECACHE en sw.js.\n'); process.exit(1); }
  lineas.splice(iPre + 1, 0, ...filas.map(f => "  './" + f.ruta + "',"));
  fs.writeFileSync(SW, lineas.join('\n'));

  console.log('\n  mapa reescrito: ' + filas.length + ' filas');
  console.log('  precache reescrito: ' + filas.length + ' filas');
  console.log('\n  SIGUIENTE: node build-standalone.js  ·  npm run verify  ·  npm run test:e2e\n');

  /* Emparejamiento parcial = salida 1. Un ingest a medias que pasa por bueno es
     justo lo que la regla D-4 quiere evitar. */
  process.exit(huerfanosPng.length || sinDibujo.length ? 1 : 0);
})().catch(e => { console.error('INGESTA ROTA:', e.message); process.exit(1); });
