/* PACE · scripts/ingest-glifos-logro.js (sesión 146)
   Ingesta de los glifos de logro del usuario: convierte los PNG de
   `Glifos_logros/` (2880x2880, ~2,4 MB) en MÁSCARAS CSS dentro de
   `app/glyphs/assets/logros/`.

   Uso:  node scripts/ingest-glifos-logro.js [--todos]
         (sin --todos ingesta solo el subconjunto de prueba de abajo)

   POR QUÉ MÁSCARA Y NO IMAGEN
   ---------------------------
   Medido sobre los 50 dibujos: el píxel más oscuro de varios se queda en
   L 171-187, y el papel de PACE es #F2EDE0 (L≈237). Puestos tal cual son un
   susurro — 50 niveles de contraste. Como máscara, la forma la pone el dibujo
   y el color lo pone el token: **87 niveles para todos**, exactamente el mismo
   contraste que los 34 glifos SVG que ya existen, porque comparten token. Y de
   propina se conserva el tintado por estado (bloqueado `--ink-3` / conseguido
   el color de su categoría), que con una imagen a color se perdería.

   LA TRAMPA, y costó una pasada en falso
   --------------------------------------
   La primera versión calculó el alfa como `(SUELO - L) / SUELO`. Con eso una
   línea pálida de L 187 sale al **21 % de opacidad**, o sea MÁS tenue que el
   original, y la máscara parecía mala idea. Hay que **normalizar por el píxel
   más oscuro de cada dibujo** — `(SUELO - L) / (SUELO - Lmin)` — que es lo que
   hacía la ingesta del loto en s138. Entonces la tinta más oscura de cada pieza
   llega a opacidad plena y el arte pálido se levanta al peso del oscuro.

   Parámetros medidos, no a ojo:
     - SUELO 238: el fondo de estos PNG **no es blanco puro**, vive entre 240 y
       255 (21 valores distintos en una esquina de 200x200). Sin este suelo la
       máscara deja un velo sobre todo el sello.
     - salida 224 px: el sello son 56 px CSS, así que 224 cubre DPR 4 de sobra.
     - alphaQuality 100 — el dibujo ENTERO viaja en el alfa. Con pérdida se
       motea en las líneas finas; es la lección del loto, no un lujo.

   Regla D-4: el arte se mide UNA vez. Si el usuario aporta dibujos nuevos se
   RE-CORRE este script; nunca se retoca el .webp a mano.
*/
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const ORIGEN = path.resolve(ROOT, '..', 'Glifos_logros');
const DESTINO = path.join(ROOT, 'app', 'glyphs', 'assets', 'logros');

const SUELO = 238;
const LADO = 224;

/* Mapeo logro -> DIBUJO, por CLAVE ESTABLE, no por posicion (s146).

   La primera version indexaba por posicion en la carpeta ordenada. Al subir el
   usuario 8 dibujos mas, sus nombres empiezan por mayuscula y ordenan ANTES que
   los del lote original: medido, **0 de las 50 posiciones seguian coincidiendo**,
   o sea que los 50 glifos se habrian reasignado a logros equivocados sin dar un
   solo error. La clave es el id del asset (o el nombre completo del archivo si
   no lo lleva), que no depende de cuantos archivos haya ni de como ordenen.

   El razonamiento de cada fila y su grado de certeza viven en
   docs/product/MAPEO_GLIFOS_LOGRO.md */
const MAPEO = {
  "breathe.sessions.10":      "Premium_editorial_zen_seal_a_long_continuous_sinu-1785706786272.png",
  "explore.all.breathe":      "yjl0jwbpd",
  "explore.bhastrika":        "pk3ofac34",
  "explore.coherent":         "gxf37kpls",
  "explore.hips":             "fxvn0y84v",
  "explore.nadi":             "6d9zlp3rx",
  "explore.physiological":    "lfud9o2mf",
  "explore.tweaks":           "tycxqv3vu",
  "explore.ujjayi":           "Premium_editorial_zen_seal_three_rhythmic_hairlin-1785709298327.png",
  "first.breath":             "35bsw04l3",
  "first.cycle":              "9j3y5oet7",
  "first.day":                "4ge0ksckf",
  "first.extra":              "uxj5jdlym",
  "first.plan":               "os48f5hru",
  "first.return":             "y0xmmncb2",
  "first.ritual":             "omig7agjk",
  "first.sip":                "i90fy649u",
  "first.step":               "bdowo37js",
  "first.stretch":            "0z4j7yu1d",
  "focus.hours.10":           "n55fliod2",
  "focus.hours.100":          "52sg9sikn",
  "focus.hours.50":           "gf29cfrnv",
  "hydrate.week.perfect":     "y41fjy57b",
  "master.antidote":          "dqqv7gxom",
  "master.centurion":         "l8pyi6cg6",
  "master.coherent.15":       "ysv9o9wsr",
  "master.collector.full":    "Premium_editorial_zen_seal_a_typographic_printing-1785709447846.png",
  "master.collector.half":    "q84hdp398",
  "master.dawn":              "eu5f6q0xh",
  "master.dusk":              "jygu4pt8d",
  "master.focus.day":         "jius5jkiw",
  "master.gardener":          "Premium_editorial_zen_seal_a_vertical_branch_with-1785709395354.png",
  "master.marathon":          "evx57hiwv",
  "master.path.all7":         "4jbqjcsiy",
  "master.pomodoro.12":       "w11c1m7gr",
  "master.retreat":           "e09moxn28",
  "master.silent.day":        "e9mbhmqvg",
  "morning.5":                "u94subsdz",
  "move.sessions.25":         "bhx1h1gvi",
  "season.cycle":             "vz6tgc28s",
  "season.equinox.spring":    "u1rbeljzr",
  "season.four":              "Premium_editorial_zen_seal_a_precise_circular_whe-1785709550699.png",
  "season.solstice.summer":   "Premium_editorial_zen_seal_a_radiant_sun_at_the_c-1785709408863.png",
  "season.solstice.winter":   "Premium_editorial_zen_seal_a_hexagonal_dendrite_s-1785709579776.png",
  "season.spring":            "gu806iwct",
  "season.winter":            "taaeioi3e",
  "secret.backup":            "ns6eokage",
  "secret.night.owl":         "j2tkqas66",
  "secret.safety.read":       "p627xvvdx",
  "secret.supporter":         "knqug1tzj",
  "stats.year.first":         "4zz3a6hlr",
  "streak.100":               "799gphldi",
  "streak.3":                 "x1l37xssb",
  "streak.30":                "Premium_editorial_zen_seal_full_moon_disk_encircl-1785709239515.png",
  "streak.365":               "y4hlfp12j",
};

/* Guardarrail: un id que no exista en el catálogo produciría una máscara que no
   pinta nadie, y en silencio. Se lee el catálogo real del árbol. */
function validarContraCatalogo(mapa) {
  const src = fs.readFileSync(path.join(ROOT, 'app', 'achievements', 'catalog.js'), 'utf8');
  const ids = new Set([...src.matchAll(/\{ id: '([^']+)'/g)].map(m => m[1]));
  const malos = Object.keys(mapa).filter(id => !ids.has(id));
  const repetidos = Object.values(mapa).filter((n, i, a) => a.indexOf(n) !== i);
  if (malos.length) { console.error('ABORTADO — ids que no existen en el catálogo: ' + malos.join(', ')); process.exit(1); }
  if (repetidos.length) { console.error('ABORTADO — dibujos asignados dos veces: ' + [...new Set(repetidos)].join(', ')); process.exit(1); }
}

/* clave estable de un archivo: su id de asset, o el nombre entero si no lo lleva
   (los dibujos que el usuario subió después vienen con nombre descriptivo). */
function claveDe(f) {
  const m = f.match(/^asset_([a-z0-9]+)_/i);
  return m ? m[1] : f;
}

/* clave -> archivo. Devuelve un MAPA, no una lista: indexar por posición fue el
   error que estuvo a punto de reasignar los 50 glifos. */
function dibujosUnicos() {
  const files = fs.readdirSync(ORIGEN).filter(f => /\.png$/i.test(f)).sort();
  const vistos = new Map();
  for (const f of files) {
    const k = claveDe(f);
    if (!vistos.has(k)) vistos.set(k, f);
  }
  return vistos;
}

/* El procesado vive en `scripts/audit/glifos-v2.js` y se comparte con el banco
   que lo valida: si el algoritmo cambia, la hoja de comparación mide LO MISMO
   que se ingesta. Dos copias del mismo algoritmo sutil es como divergen. */
const v2 = require('./audit/glifos-v2.js');

/* Peso de tinta de una máscara: alfa medio sobre el cuadro. Es lo que el ojo
   lee como «cuánto dibujo hay», mejor que contar píxeles: un trazo al 30 % de
   opacidad pesa la mitad que el mismo trazo opaco. */
function peso(alfa) {
  let s = 0;
  for (let i = 0; i < alfa.length; i++) s += alfa[i];
  return s / alfa.length / 255;
}

/* Sube el peso de una máscara floja aplicando MÁS gamma, hasta alcanzar el
   objetivo o topar. Se puede hacer sobre el alfa ya calculado: como
   `alfa = 255 · a^0.72`, elevar `alfa/255` a `k` equivale a gamma `0.72·k`, así
   que no hace falta reprocesar la imagen. El tope evita que un dibujo de cuatro
   líneas se convierta en una mancha. */
const GAMMA_BASE = 0.72;
/* Tope bajado a 0.30 (gamma efectiva 0.22) tras medir: con 0.45 se quedaba
   corto `first.ritual`, cuyo TECHO —toda su tinta a opacidad plena— es 4.1 %,
   o sea que sí podía llegar a la mediana y solo lo frenaba el límite.
   Los que no llegan ni con esto no es por opacidad: su techo ya está POR DEBAJO
   de la mediana (`hydrate.week.perfect` 1.2 %, `first.cycle` 1.4 %), es decir,
   el dibujo tiene menos trazo. Eso no lo arregla una curva, solo engordar la
   línea — y eso sería retocar el arte, que la regla D-4 prohíbe. */
const K_MIN = 0.30;

function igualarPeso(alfa, objetivo) {
  if (peso(alfa) >= objetivo) return { alfa, gamma: GAMMA_BASE };
  let lo = K_MIN, hi = 1, k = 1;
  for (let it = 0; it < 18; it++) {
    k = (lo + hi) / 2;
    const prueba = Buffer.alloc(alfa.length);
    for (let i = 0; i < alfa.length; i++) prueba[i] = Math.round(Math.pow(alfa[i] / 255, k) * 255);
    if (peso(prueba) < objetivo) hi = k; else lo = k;
  }
  const out = Buffer.alloc(alfa.length);
  for (let i = 0; i < alfa.length; i++) out[i] = Math.round(Math.pow(alfa[i] / 255, k) * 255);
  return { alfa: out, gamma: GAMMA_BASE * k };
}

async function procesarGlifo(src) {
  /* v2 (s146, tras el feedback del usuario: «el círculo central les sobra y
     pueden tener mejor definición»):
       1. se localiza el MARCO buscando, para cada ángulo, el trazo más exterior
          — no se asume círculo, porque medido NO lo es: está descentrado y a un
          radio fijo solo aparece en el 41 % de los ángulos;
       2. se borra ese contorno y se recorta al motivo, encajándolo en el
          CÍRCULO inscrito (por radio, no por caja) y con la caja medida por
          PERCENTILES, para que un resto de aro no arrastre el centro;
       3. punto negro por percentil 2 en vez de por mínimo, gamma para levantar
          los medios y afilado después de reducir. */
  return v2.procesar(src, true, LADO);
}

async function escribirMascara(alfa, w, h, destino) {
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = 255; rgba[i * 4 + 1] = 255; rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = alfa[i];
  }
  const webp = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 60, alphaQuality: 100 })
    .toBuffer();
  fs.writeFileSync(destino, webp);
  return webp.length;
}

/* Reescribe el mapa de `app/glyphs/achievement-masks.js` entre sus marcas, para
   que el archivo del árbol y la ingesta no puedan divergir. RUTAS COMPLETAS: el
   inliner del build sustituye cadenas literales (ver la cabecera de ese
   archivo). */
function reescribirMapa(logros) {
  const P = path.join(ROOT, 'app', 'glyphs', 'achievement-masks.js');
  const src = fs.readFileSync(P, 'utf8');
  const ini = 'const ACHIEVEMENT_MASKS = {';
  const fin = '};';
  const a = src.indexOf(ini);
  const b = src.indexOf(fin, a);
  if (a === -1 || b === -1) { console.error('ABORTADO — no encuentro el mapa en achievement-masks.js'); process.exit(1); }
  const ancho = Math.max(...logros.map(id => id.length)) + 3;
  const filas = logros.slice().sort()
    .map(id => "  '" + id + "':" + ' '.repeat(ancho - id.length) + "'app/glyphs/assets/logros/" + id + ".webp',")
    .join('\n');
  fs.writeFileSync(P, src.slice(0, a) + ini + '\n' + filas + '\n' + src.slice(b), 'utf8');
}

/* Y el precache del service worker, por el mismo motivo: una máscara sin
   precachear deja el sello vacío en la web offline. */
function reescribirPrecache(logros) {
  const P = path.join(ROOT, 'sw.js');
  const marca = '  /* s146: glifos de logro del usuario, MASCARAS CSS.';
  const esFilaDeGlifo = l => /^\s*'\/app\/glyphs\/assets\/logros\/[^']+',\s*$/.test(l);

  /* Por LINEAS, no por índices. La primera versión caminaba el texto buscando
     dónde acababa el bloque anterior y se dejó dos filas de la pasada de prueba
     (52 entradas para 50 máscaras). Filtrar todas las filas de glifo existentes
     y volver a insertar el bloque entero no puede duplicar ni dejar restos. */
  const lineas = fs.readFileSync(P, 'utf8').split('\n');
  let i = lineas.findIndex(l => l.startsWith(marca));
  const limpias = lineas.filter((l, n) => !esFilaDeGlifo(l) && !(n >= i && n <= i + 2 && i !== -1 && l.trim().startsWith('/*') === false && n > i && l.includes('ingest-glifos-logro')));
  i = limpias.findIndex(l => l.startsWith(marca));
  if (i === -1) { console.error('ABORTADO — no encuentro el bloque de glifos en sw.js'); process.exit(1); }

  /* la cabecera del bloque son sus líneas de comentario, hasta el cierre */
  let fin = i;
  while (fin < limpias.length && !limpias[fin].includes('*/')) fin++;

  const filas = logros.slice().sort().map(id => "  '/app/glyphs/assets/logros/" + id + ".webp',");
  limpias.splice(fin + 1, 0, ...filas);
  fs.writeFileSync(P, limpias.join('\n'), 'utf8');

  const puestas = limpias.filter(esFilaDeGlifo).length;
  if (puestas !== logros.length) {
    console.error('ABORTADO — el precache quedó con ' + puestas + ' filas para ' + logros.length + ' máscaras');
    process.exit(1);
  }
}

async function main() {
  fs.mkdirSync(DESTINO, { recursive: true });
  const unicos = dibujosUnicos();
  console.log('origen: ' + ORIGEN + '  (' + unicos.size + ' dibujos distintos)');
  validarContraCatalogo(MAPEO);

  /* limpiar máscaras de una pasada anterior: si un logro sale del mapeo, su
     archivo tiene que irse con él o queda referenciado sin estarlo */
  for (const f of fs.readdirSync(DESTINO)) if (/\.webp$/i.test(f)) fs.unlinkSync(path.join(DESTINO, f));

  /* DOS PASADAS, porque igualar el peso exige conocer el conjunto entero.
     1ª: procesar los 50 y medir el peso de tinta de cada uno.
     2ª: subir la gamma SOLO a los que quedan por debajo de la mediana, hasta
         alcanzarla. Los que ya pesan lo normal no se tocan: el objetivo es que
         ninguno se vea desvaído al lado de los demás, no aplanarlos todos. */
  const procesados = [];
  const sinMarco = [];
  for (const [logro, clave] of Object.entries(MAPEO)) {
    const archivo = unicos.get(clave);
    if (!archivo) { console.error('ABORTADO - no existe el dibujo ' + clave + ' (logro ' + logro + ')'); process.exit(1); }
    const r = await procesarGlifo(path.join(ORIGEN, archivo));
    if (!r.marco) sinMarco.push(logro);
    procesados.push({ logro, r, peso: peso(r.alfa) });
  }

  const pesos = procesados.map(p => p.peso).sort((a, b) => a - b);
  const mediana = pesos[(pesos.length / 2) | 0];
  const antes = { min: pesos[0], max: pesos[pesos.length - 1] };

  let total = 0;
  const levantados = [];
  for (const p of procesados) {
    const ig = igualarPeso(p.r.alfa, mediana);
    if (ig.gamma !== GAMMA_BASE) levantados.push(p.logro + ' (' + (p.peso * 100).toFixed(1) +
      '% -> ' + (peso(ig.alfa) * 100).toFixed(1) + '%, gamma ' + ig.gamma.toFixed(2) + ')');
    total += await escribirMascara(ig.alfa, p.r.w, p.r.h, path.join(DESTINO, p.logro + '.webp'));
    p.pesoFinal = peso(ig.alfa);
  }

  const logros = Object.keys(MAPEO);
  reescribirMapa(logros);
  reescribirPrecache(logros);

  const fin = procesados.map(p => p.pesoFinal).sort((a, b) => a - b);
  console.log('  ' + logros.length + ' máscaras · ' + (total / 1024).toFixed(0) + ' KB · media ' +
    (total / 1024 / logros.length).toFixed(1) + ' KB');
  console.log('  peso de tinta — mediana objetivo ' + (mediana * 100).toFixed(1) + '%');
  console.log('    antes:   ' + (antes.min * 100).toFixed(1) + '% .. ' + (antes.max * 100).toFixed(1) + '%');
  console.log('    después: ' + (fin[0] * 100).toFixed(1) + '% .. ' + (fin[fin.length - 1] * 100).toFixed(1) + '%');
  console.log('  levantados: ' + levantados.length + ' de ' + logros.length);
  if (sinMarco.length) console.log('  [aviso] sin marco detectado: ' + sinMarco.join(', '));
  const quedanFlojos = procesados.filter(p => p.pesoFinal < mediana * 0.75)
    .map(p => p.logro + ' (' + (p.pesoFinal * 100).toFixed(1) + '%)');
  if (quedanFlojos.length) {
    console.log('  [aviso] ' + quedanFlojos.length + ' siguen por debajo del 75 % de la mediana pese al tope de gamma:');
    console.log('          ' + quedanFlojos.join(', '));
  }
  console.log('  mapa y precache reescritos. destino: ' + DESTINO);
}

main().catch(e => { console.error(e.message); process.exit(1); });
