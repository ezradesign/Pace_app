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
   3. SALIDA 768 px y no 224: estos se pintan hasta ~200 px CSS en el runner,
      contra los 56 px del sello de logro. s170: eran 384 «porque cubren DPR 2»,
      y al subir el glifo un 30 % eso dejo de ser cierto — medido, el runner
      pide hasta 501 px de DISPOSITIVO a DPR 3, o sea que la mascara se estaba
      AMPLIANDO. De ahi el trazo difuso que reporto el usuario. 768 cubre el
      caso peor con margen y sigue sobrando en la miniatura de 30 px.

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
const { calcularCaja } = require('./ingest-glifos-ejercicio.geometria.js');

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
const LADO = 768;

/* s170 · las tres palancas del arte ANATOMICO, todas apagables desde la linea
   de comandos para poder comparar sin editar el script:
     --recorte <n>  umbral de luminancia del recorte de margen (0 = no recortar).
                    238 NO vale: bajo ese umbral hay un velo casi blanco que
                    cubre el lienzo entero y el bbox sale del 100 % (medido).
     --gamma <n>    1 = comportamiento lineal de s166. >1 levanta los medios.
     --con-rojo     conserva la mancha roja como tinta (por defecto se blanquea).
   Los tres son INERTES sobre un dibujo de linea negra sin color y con el cuerpo
   ya encuadrado, que es lo que el encargo pide: no cambian el set de s167. */
const numArg = (nombre, porDefecto) => {
  const i = args.indexOf(nombre);
  const v = i !== -1 ? Number(args[i + 1]) : NaN;
  return isFinite(v) ? v : porDefecto;
};
const RECORTE = numArg('--recorte', 220);
const GAMMA = numArg('--gamma', 3.0);
const SIN_ROJO = !args.includes('--con-rojo');
/* SUELO DE LUMINANCIA DEL ROJO (s170, y nace de un defecto que el usuario vio
   antes que yo). El detector original era solo de TONO —`r - max(g,b) > 18`— y
   la tinta de estos grabados es SEPIA, o sea calida: medido, entre el 39 % y el
   43 % de lo que marcaba como «rojo» eran pixeles de lum<120, es decir TRAZO.
   Al blanquearlos se borraba el contorno justo donde pasaba por la mancha, que
   es lo que se reporto como «la linea del abdomen desaparece» en Plancha y
   Hueco abdominal, y como «contorno difuso» en las manos —que son las piezas
   mas teñidas: «Extension de dedos» tenia 135.000 pixeles marcados—.
   La mancha es un TINTE claro sobre blanco; el trazo es oscuro y solo un poco
   calido. Con un suelo de luminancia se separan sin tocar el dibujo. */
const ROJO_LUM = numArg('--rojo-lum', 150);
/* LA MINIATURA TIENE SU PROPIO ARCHIVO (s170). A 30 px la mascara grande no
   funciona y no es cuestion de ajustes: una linea de un pixel promediada 25
   veces se vuelve gris, y el encargo ya lo avisaba («tiene que leerse a 30:
   pocos trazos, gruesos, separados»). Subir el contraste del asset GRANDE para
   arreglar el pequeño estropearia el grande, asi que se genera un SEGUNDO
   archivo, `.min.webp`, con el trazo ENGORDADO y el contraste al limite. Lo usa
   `ExerciseGlyph` solo por debajo de `MASK_MIN_HASTA` px; el resto no se entera.
     --min-lado    resolucion del asset pequeño (0 lo desactiva)
     --min-gamma   contraste propio, mucho mas duro que el del grande
     --min-grosor  radio en px del engorde (dilatacion) ANTES de reducir */
const MIN_LADO = numArg('--min-lado', 192);
const MIN_GAMMA = numArg('--min-gamma', 5);
const MIN_GROSOR = numArg('--min-grosor', 3);
/* CENTRADO, Y VA POR EJES SEPARADOS porque el ojo no pide lo mismo en cada uno
   (s170, corregido mirando con el usuario):
     X -> centro de MASA. En una postura asimetrica la masa manda: es lo que
          hace que la figura no parezca escorada, y ademas ACERCA los extremos
          al centro, o sea que deja subir el tamano sin salirse del circulo
          (medido: radio 84 px por masa contra 107 por caja).
     Y -> centro de CAJA. Aqui la masa MIENTE: en una figura arrodillada el peso
          esta en el torso y los extremos cuelgan, asi que centrar la masa deja
          el hueco debajo. Medido en el flexor: 12 px de aire arriba contra 62
          abajo, que es exactamente lo que el usuario vio como «esta alto».
          La caja iguala el aire por definicion.
   `--centro-x` / `--centro-y` aceptan `masa` o `bbox` para poder comparar. */
const centroArg = (nombre, pd) => { const i = args.indexOf(nombre); return i !== -1 ? args[i + 1] : pd; };
const CENTRO_X = centroArg('--centro-x', 'circulo');
const CENTRO_Y = centroArg('--centro-y', 'circulo');
/* `circulo` (s170, tercera iteracion y la buena): el centro de la CIRCUNFERENCIA
   MINIMA que envuelve la tinta. Ni masa ni caja — las dos dejaban aire de sobra
   en un lado, y el usuario lo reporto en SEIS piezas seguidas con la misma
   frase: «le sobra mas aire por la derecha que por la izquierda». No eran seis
   retoques: era el criterio.
   Con la normalizacion circular ya puesta, el tamano de cada pieza lo fija su
   radio maximo desde el centro elegido, asi que MINIMIZAR ese radio es
   exactamente lo mismo que MAXIMIZAR el dibujo dentro del disco. Y el centro que
   lo minimiza reparte el aire por definicion: no hay un lado con mas holgura,
   porque si lo hubiera el circulo podria encogerse. Un solo criterio resuelve
   las dos quejas —«esta descentrado» y «es pequeño»— y no hay que ajustar
   piezas a mano nunca mas. */
/* Nitidez tras el remuestreo. Un dibujo de trazo FINO pierde definicion al bajar
   de 1254 a LADO, y la gamma que levanta los medios engorda ademas el halo de
   antialias de cada linea: las dos cosas juntas es lo que se lee como «difuso».
   0 lo desactiva. Se aplica sobre el ALFA ya montado, no sobre el gris.
   s170: subida de 1 a 1,6 junto con la gamma (1,9 -> 3,0) al reportar el usuario
   que «las miniaturas de 30 px fallan de contorno». Comprobado a los TRES
   tamaños antes de adoptarlo: a 30 y 56 px la definicion mejora claramente, y a
   174 px —donde el dibujo de verdad vive— las tres gammas salen practicamente
   identicas, o sea que la subida no cuesta nada donde podria costar. */
const NITIDEZ = numArg('--nitidez', 1.6);
/* NORMALIZACION CIRCULAR (s170) — el arreglo de fondo, y nace de un error mio.
   El glifo se pinta DENTRO DE UN CIRCULO, pero la mascara se estaba encajando
   en un CUADRADO: `mask-size:contain` ajusta el lienzo, asi que un dibujo con
   extremos en diagonal (una zancada) se sale del disco mientras uno tumbado
   nada en el. Medido: el flexor daba radio 102,6 px en un disco de 94,5.
   Aqui cada pieza se escala para que el pixel de tinta MAS LEJANO AL CENTRO
   quede a `RADIO` del medio lienzo. Consecuencias:
     · todas las piezas caben en el circulo por construccion, sin factor magico;
     · y todas ocupan el MISMO tamano optico, que es literalmente lo que el
       encargo exige («si en una el cuerpo ocupa el 80 % y en otra el 40 %, en
       la app se nota como un salto») y que un encaje cuadrado no puede dar.
   1.0 = la tinta toca el circulo inscrito. Se deja un pelo de margen. */
const RADIO = numArg('--radio', 0.98);
/* UN SOLO UMBRAL DE TINTA (s170). El recorte medía con `RECORTE` y la máscara
   se construía con `SUELO`, así que el material tenue que hay entre los dos
   quedaba FUERA del encuadre y DENTRO del dibujo — y la gamma lo hacía visible.
   Efecto medido: «Superman» salía con radio 95 donde las otras doce daban 85, y
   el ajuste correctivo lo dejaba en 75,9, o sea un 11 % más pequeño que sus
   compañeras. Con un único piso los dos pasos miden lo MISMO y el correctivo
   deja de tener trabajo (sigue puesto como red, no como muleta). */
const PISO = RECORTE > 0 ? RECORTE : SUELO;

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
  /* s172 · EL PATRON VEIA SOLO LA MITAD. Pedia `mode:` detras del nombre, y eso
     es el contrato del runner v1: los pasos LEGACY declaran `dur:`. Se colaba
     por el hueco `Puente isquio a una pierna` (un paso de `move.atg.knees`),
     asi que el censo decia 61 identidades donde hay 62 y «4 pendientes» donde
     hay 5. Y no saltaba nada: el numero salia redondo porque coincidia con el
     censo de s164, que arrastraba el mismo punto ciego.
     El encargo ademas la daba por «dibujo que no usa nadie», y de los cinco de
     esa lista es la UNICA sin alias que la tape — o sea, la unica que si se ve.
     Dos errores independientes que se cancelaban en un numero creible. */
  const PASOS = /name: '([^']+)',\s*(?:mode|dur):/g;
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
    /* s170 · TRES PASADAS SOBRE EL ORIGINAL A COLOR, y el color hace falta:
       el arte anatomico del usuario marca el musculo en ROJO, y como la
       mascara solo lleva alfa ese rojo se convertia en un BORRON oscuro. Se
       trabaja en RGB y se decide pixel a pixel; el gris de siempre sigue
       saliendo igual porque para un dibujo sin color las tres son inertes.
       `flatten` es explicito: estos PNG traen fondo TRANSPARENTE, y darlo por
       hecho es como se cuelan los fondos negros. */
    const src = sharp(path.join(ORIGEN, p.archivo)).flatten({ background: '#ffffff' });
    const rec = await src.raw().toBuffer({ resolveWithObject: true });
    const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const esRojo = (d, i) => d[i] - Math.max(d[i + 1], d[i + 2]) > 18 && d[i] > 60 && lum(d, i) >= ROJO_LUM;

    /* El encuadre vive en `.geometria.js` desde s170 (regla §1): es la decision
       que mas veces se corrigio en la sesion y merece poder cambiarse sin tocar
       ni el emparejamiento ni la escritura del mapa. */
    const caja = calcularCaja({
      data: rec.data, W: rec.info.width, H: rec.info.height, C: rec.info.channels,
      RECORTE, RADIO, CENTRO_X, CENTRO_Y,
    });

    let etapa = await sharp(path.join(ORIGEN, p.archivo))
      .flatten({ background: '#ffffff' })
      .extract({ left: caja.left, top: caja.top, width: caja.width, height: caja.height })
      .toBuffer();
    if (caja.pad && (caja.pad.top || caja.pad.bottom || caja.pad.left || caja.pad.right)) {
      etapa = await sharp(etapa)
        .extend({ ...caja.pad, background: { r: 255, g: 255, b: 255 } })
        .toBuffer();
    }
    const pipe = sharp(etapa);
    /* LOS CANALES SE LEEN, NO SE SUPONEN. `extend` —que solo corre cuando el
       recorte centrado se sale del lienzo— promueve la imagen a 4 canales, y un
       bucle que avanza de 3 en 3 sobre un buffer de 4 desplaza cada fila un
       pixel mas que la anterior: la figura sale convertida en RAYAS DIAGONALES.
       Medido en s170 con «Hueco abdominal», que era el unico de los dos que
       necesitaba relleno — por eso el otro salia bien y parecia que el codigo
       estaba sano. Misma familia que la trampa de canales de s147. */
    const { data: rgb, info: infoRgb } = await pipe
      .resize(LADO, LADO, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .raw().toBuffer({ resolveWithObject: true });
    const CH = infoRgb.channels;
    if (rgb.length !== LADO * LADO * CH) {
      console.error('\n  Buffer inesperado en ' + p.archivo + ': ' + rgb.length +
        ' bytes para ' + LADO + 'x' + LADO + 'x' + CH + '. No se escribe nada.\n');
      process.exit(1);
    }

    /* (2) EL ROJO NO ES TINTA. Se blanquea antes de medir nada. Dos motivos, y
       el segundo solo se ve midiendo: (a) sin color, la mancha roja lee como
       sombra sucia en el muslo; (b) en «Hueco abdominal» el rojo era el pixel
       MAS OSCURO del archivo (46 contra 85 del trazo), o sea que ANCLABA la
       normalizacion y hundia el dibujo entero a un 60 % de su contraste. */
    const gris = Buffer.alloc(LADO * LADO);
    for (let i = 0, j = 0; j < gris.length; i += CH, j++) {
      gris[j] = SIN_ROJO && esRojo(rgb, i) ? 255 : Math.round(lum(rgb, i));
    }

    /* Lmin del dibujo: sin normalizar por el pixel MAS OSCURO, un trazo palido
       sale mas tenue que el original. Trampa medida en s146. */
    let lmin = 255;
    for (let i = 0; i < gris.length; i++) if (gris[i] < lmin) lmin = gris[i];
    const rango = Math.max(1, PISO - lmin);

    /* (3) CURVA. El grabado del usuario es de trazo FINO y medios tonos: medido,
       CERO pixeles a tinta plena, contra el 0,3-0,6 % de los sellos de logro ya
       aprobados. Lineal, eso pinta una filigrana que en la paleta oscura casi
       desaparece. La gamma levanta los medios sin tocar ni el 0 ni el 255, asi
       que no inventa tinta donde no hay: redistribuye la que hay. GAMMA=1 la
       desactiva y deja el comportamiento de s166 intacto. */
    const alfa = Buffer.alloc(LADO * LADO);
    for (let i = 0; i < alfa.length; i++) {
      const L = gris[i];
      const base = L >= PISO ? 0 : Math.min(1, (PISO - L) / rango);
      alfa[i] = Math.round(Math.pow(base, 1 / GAMMA) * 255);
    }
    /* AJUSTE FINO SOBRE EL ALFA YA MONTADO (s170). El recorte de arriba mide la
       tinta con `RECORTE`, pero la mascara incluye todo lo que este por debajo
       de `SUELO` — y entre los dos umbrales hay material tenue que la gamma
       vuelve visible. Resultado: la normalizacion circular se quedaba corta
       justo en las piezas con extremos desvaidos. Medido: «Superman» salia con
       radio 95,0 px en un disco de 94,5 mientras las otras doce daban 85.
       Aqui se mide el radio de lo que DE VERDAD se va a pintar y, si se pasa,
       se encoge el dibujo dentro del mismo lienzo. Es autocorrector: da igual
       como de raro venga el PNG, el invariante se cumple. */
    const radioAlfa = (buf) => {
      const c = (LADO - 1) / 2; let r = 0;
      for (let y = 0; y < LADO; y++) for (let x = 0; x < LADO; x++) {
        if (buf[y * LADO + x] > 16) { const d = Math.hypot(x - c, y - c); if (d > r) r = d; }
      }
      return r;
    };
    const objetivo = RADIO * (LADO / 2);
    const rAlfa = radioAlfa(alfa);
    let alfaFinal = alfa;
    if (rAlfa > objetivo + 0.5) {
      const escala = objetivo / rAlfa;
      const nuevo = Math.max(8, Math.round(LADO * escala));
      const off = Math.round((LADO - nuevo) / 2);
      /* LOS CANALES SE LEEN, POR TERCERA VEZ EN ESTA SESION. `sharp` promueve
         un raw de 1 canal al redimensionar, asi que pegar la fila `y` como
         `subarray(y*nuevo,(y+1)*nuevo)` lee un TERCIO de fila y el dibujo se
         deshace. Aqui se indexa con el `channels` que devuelve el propio sharp
         y el guard de abajo comprueba el resultado en vez de confiar. */
      const chico = await sharp(alfa, { raw: { width: LADO, height: LADO, channels: 1 } })
        .resize(nuevo, nuevo, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
      const ch = chico.info.channels;
      alfaFinal = Buffer.alloc(LADO * LADO);
      for (let y = 0; y < nuevo; y++) for (let x = 0; x < nuevo; x++) {
        alfaFinal[(y + off) * LADO + (x + off)] = chico.data[(y * nuevo + x) * ch];
      }
      console.log('    · ' + p.s + ': encogido a ' + (escala * 100).toFixed(1) + ' % para caber en el circulo');
    }
    /* GUARD: el invariante se COMPRUEBA, no se supone. Sin esto, la version
       anterior de este mismo bloque dejo SEIS piezas fuera del circulo y una
       reducida al 17 % de su tamano, y todo paso silencioso hasta que lo mire
       pieza a pieza. Si vuelve a fallar, la ingesta se para y lo dice. */
    const rFinal = radioAlfa(alfaFinal);
    if (rFinal > objetivo + 1.5) {
      console.error('  ' + p.s + ': tras el ajuste el radio sigue en ' + rFinal.toFixed(1) +
        ' (maximo ' + objetivo.toFixed(1) + '). No se escribe nada.');
      process.exit(1);
    }

    /* El dibujo ENTERO viaja en el ALFA: el color es irrelevante (lo pone el
       token) y por eso el RGB va a negro plano. alphaQuality 100 porque con
       perdida las lineas finas se motean -- leccion del loto (s138). */
    const rgba = Buffer.alloc(LADO * LADO * 4);
    for (let i = 0; i < alfaFinal.length; i++) rgba[i * 4 + 3] = alfaFinal[i];

    /* --- la miniatura, desde el MISMO alfa ya encuadrado ------------------
       Engordar antes de reducir es la clave: si se reduce primero, la linea ya
       se ha perdido y no hay contraste que la devuelva. La dilatacion se hace
       con un maximo local separable (primero filas, luego columnas), que sobre
       un alfa es exactamente «engorda el trazo `MIN_GROSOR` pixeles». */
    if (MIN_LADO > 0) {
      const gordo = Buffer.from(alfaFinal);
      const tmp = Buffer.alloc(LADO * LADO);
      const r = Math.max(1, Math.round(MIN_GROSOR));
      for (let y = 0; y < LADO; y++) for (let x = 0; x < LADO; x++) {
        let m = 0;
        for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < LADO) { const v = gordo[y * LADO + xx]; if (v > m) m = v; } }
        tmp[y * LADO + x] = m;
      }
      for (let x = 0; x < LADO; x++) for (let y = 0; y < LADO; y++) {
        let m = 0;
        for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < LADO) { const v = tmp[yy * LADO + x]; if (v > m) m = v; } }
        gordo[y * LADO + x] = Math.min(255, Math.round(Math.pow(m / 255, 1 / MIN_GAMMA) * 255));
      }
      const rgbaMin = Buffer.alloc(LADO * LADO * 4);
      for (let i = 0; i < gordo.length; i++) rgbaMin[i * 4 + 3] = gordo[i];
      await sharp(rgbaMin, { raw: { width: LADO, height: LADO, channels: 4 } })
        .resize(MIN_LADO, MIN_LADO)
        .webp({ alphaQuality: 100, quality: 92 })
        .toFile(path.join(DESTINO, p.s + '.min.webp'));
    }

    const salida = path.join(DESTINO, p.s + '.webp');
    let escritor = sharp(rgba, { raw: { width: LADO, height: LADO, channels: 4 } });
    /* `sharpen` sobre 4 canales toca el RGB, que aqui es negro plano e
       irrelevante, y el ALFA, que es el dibujo entero — que es justo lo que
       queremos afilar. (s147 se comio la version de 3 canales de esta trampa.) */
    if (NITIDEZ > 0) escritor = escritor.sharpen({ sigma: NITIDEZ });
    await escritor
      .webp({ alphaQuality: 100, quality: 90 })
      .toFile(salida);
    filas.push({ id: p.id, ruta: 'app/glyphs/assets/ejercicios/' + p.s + '.webp',
                 rutaMin: MIN_LADO > 0 ? 'app/glyphs/assets/ejercicios/' + p.s + '.min.webp' : null });
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
  let mapaNuevo = mapaSrc.slice(0, ini) + 'const EXERCISE_MASKS = {\n' + cuerpo + '\n' + mapaSrc.slice(fin);
  /* El mapa de MINIATURAS se escribe con RUTAS LITERALES igual que el grande: el
     inliner del build sustituye referencias TEXTUALES, asi que una ruta armada
     por concatenacion no se inlinearia y el standalone se quedaria sin arte
     (trampa documentada en la cabecera de `exercise-masks.js`). */
  const iniMin = mapaNuevo.indexOf('const EXERCISE_MASKS_MIN = {');
  const finMin = iniMin === -1 ? -1 : mapaNuevo.indexOf('};', iniMin);
  if (iniMin === -1 || finMin === -1) {
    console.error('  No encuentro EXERCISE_MASKS_MIN: no se escribe el mapa de miniaturas.');
    process.exit(1);
  }
  const cuerpoMin = filas.filter(f => f.rutaMin)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(f => "  '" + f.id.replace(/'/g, "\\'") + "': '" + f.rutaMin + "',")
    .join('\n');
  mapaNuevo = mapaNuevo.slice(0, iniMin) + 'const EXERCISE_MASKS_MIN = {\n' + cuerpoMin + '\n' + mapaNuevo.slice(finMin);
  fs.writeFileSync(MAPA, mapaNuevo);

  /* --- precache: las filas de esta carpeta se regeneran enteras ------------ */
  const swSrc = fs.readFileSync(SW, 'utf8');
  const prefijo = 'app/glyphs/assets/ejercicios/';
  const lineas = swSrc.split('\n').filter(l => l.indexOf(prefijo) === -1);
  const iPre = lineas.findIndex(l => l.indexOf('const PRECACHE = [') !== -1);
  if (iPre === -1) { console.error('\n  No encuentro PRECACHE en sw.js.\n'); process.exit(1); }
  const rutas = [];
  filas.forEach(f => { rutas.push(f.ruta); if (f.rutaMin) rutas.push(f.rutaMin); });
  lineas.splice(iPre + 1, 0, ...rutas.sort().map(r => "  '/" + r + "',"));
  fs.writeFileSync(SW, lineas.join('\n'));

  console.log('\n  mapa reescrito: ' + filas.length + ' filas');
  console.log('  precache reescrito: ' + filas.length + ' filas');
  console.log('\n  SIGUIENTE: node build-standalone.js  ·  npm run verify  ·  npm run test:e2e\n');

  /* Emparejamiento parcial = salida 1. Un ingest a medias que pasa por bueno es
     justo lo que la regla D-4 quiere evitar. */
  process.exit(huerfanosPng.length || sinDibujo.length ? 1 : 0);
})().catch(e => { console.error('INGESTA ROTA:', e.message); process.exit(1); });
