/* glifos-v2.js — quitar el marco y ganar definicion. Tercer intento del
   detector, y los dos anteriores enseñaron por que fallaban:

     1º  pico de densidad por radio -> en los dibujos con motivo grande el pico
         ES el motivo. Detectaba 3 de 10.
     2º  cobertura angular a radio fijo -> 0 de 50. Medido el perfil del #11:
         a r=0.80 el trazo aparece en el 41 % de los angulos, no en el 95 %.
         **El marco no esta centrado y no es un circulo perfecto.** Y bajar el
         umbral para compensar detecta la textura del papel (con L<254 la
         "cobertura" es del 97 % a CUALQUIER radio: eso es papel, no tinta).

   Lo que si funciona: no asumir circulo. Para cada angulo se busca el trazo mas
   EXTERIOR, y si casi todos los angulos tienen uno, eso es el marco — sea
   redondo, ovalado o este descentrado. Se borra ese contorno por angulo.

   uso: node scripts/audit/glifos-v2.js [carpeta] [salida.png]
*/
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = process.argv[2] || path.resolve(__dirname, '..', '..', '..', 'Glifos_logros');
const OUT = process.argv[3] || path.resolve(__dirname, '..', '..', '..', 'glifos-v2.png');

const SELLO = 56, DPR = 2, ZOOM = 6, LADO = SELLO * DPR;
const PAPEL = { r: 0xF2, g: 0xED, b: 0xE0 };
const ACENTO = { r: 0xB8, g: 0x93, b: 0x4A };
const SUELO = 238;
const TINTA_CLARA = 205;   // por debajo de esto es trazo, no textura de papel
const ANGULOS = 720;

/* Radio del trazo mas exterior en cada angulo (o -1). */
function contornoExterior(data, w, h) {
  const cx = (w - 1) / 2, cy = (h - 1) / 2, R = Math.min(w, h) / 2;
  const radios = new Float64Array(ANGULOS).fill(-1);
  let conTrazo = 0;
  for (let a = 0; a < ANGULOS; a++) {
    const th = (a / ANGULOS) * Math.PI * 2, co = Math.cos(th), si = Math.sin(th);
    for (let rr = 0.995; rr >= 0.45; rr -= 0.0025) {
      const x = Math.round(cx + rr * R * co), y = Math.round(cy + rr * R * si);
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      if (data[y * w + x] < TINTA_CLARA) { radios[a] = rr; conTrazo++; break; }
    }
  }
  return { radios, cobertura: conTrazo / ANGULOS, R, cx, cy };
}

/* ¿ese contorno es un MARCO o es el borde del motivo? Un marco rodea el dibujo
   entero: aparece en casi todos los angulos y a un radio estable. */
function esMarco(c) {
  if (c.cobertura < 0.93) return false;
  const rs = Array.from(c.radios).filter(r => r > 0).sort((a, b) => a - b);
  const p10 = rs[(rs.length * 0.10) | 0], p90 = rs[(rs.length * 0.90) | 0];
  return (p90 - p10) < 0.13;          // banda estrecha => contorno cerrado
}

/* Borra el contorno exterior (y todo lo que quede por fuera). */
function borrarMarco(data, w, h, c) {
  const margen = 0.018;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - c.cx, dy = y - c.cy;
      const d = Math.hypot(dx, dy) / c.R;
      let a = Math.round(((Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * ANGULOS) % ANGULOS;
      const rr = c.radios[a];
      if (rr > 0 && d >= rr - margen) data[y * w + x] = 255;
    }
  }
}

/* Encuadre del motivo. Dos correcciones sobre la primera version, las dos
   reportadas por el usuario mirando el resultado:

   1. «se sale del circulo» (el brote, la cartografa). Se recortaba un CUADRADO
      ceñido a la caja del motivo, pero el sello es un CIRCULO inscrito en ese
      cuadrado: lo que llega a las esquinas queda fuera. Ahora la medida no es
      la caja sino el RADIO — la distancia mas larga del centro a un pixel con
      tinta — y el lado se calcula para que ese radio quepa dentro del circulo
      con aire. Da igual la forma del dibujo: nada puede sobresalir.

   2. «descentrada a la izquierda y sobresale por abajo» (las tres plumas).
      Cuando el motivo caia cerca de un borde, el recorte se topaba con el
      limite de la imagen y se DESPLAZABA en vez de centrarse. Ahora el lienzo
      se AMPLIA con papel para que el cuadro siempre quede centrado en el
      motivo. */
const OCUPACION = 0.86;   // del radio del sello; el resto es aire

const P_BORDE = 0.005;    // se descarta el 0.5 % de tinta mas extrema por lado
/* Para ENCUADRAR se cuenta solo la tinta que se VE. El umbral del alfa es 238
   (todo lo que no es papel), pero encuadrar con ese umbral hace que una mancha
   tenue de un lado arrastre el recorte sin que el ojo la perciba: medido, el
   reloj de 100 h quedaba con la caja en 106/45 px respecto al centro. El
   encuadre tiene que seguir al dibujo VISIBLE, no a su sombra. */
const TINTA_VISIBLE = 225;

function encuadre(data, w, h) {
  const xs = [], ys = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[y * w + x] >= TINTA_VISIBLE) continue;
    xs.push(x); ys.push(y);
  }
  if (!xs.length) return null;
  xs.sort((a, b) => a - b); ys.sort((a, b) => a - b);
  const pc = (arr, q) => arr[Math.min(arr.length - 1, Math.floor(arr.length * q))];

  /* CAJA ROBUSTA, no minimo y maximo absolutos. `borrarMarco` deja de vez en
     cuando un fragmento de aro, y un solo resto estira la caja y arrastra el
     centro: medido, las tres plumas tenian tinta hasta x=836 cuando el motivo
     acaba en 684 — 72 px de desvio que empujaban el dibujo a la IZQUIERDA, y el
     reloj de 50 h un resto en x=9 que lo empujaba a la DERECHA. Los dos casos
     que reporto el usuario. Descartando el 0.5 % extremo por lado, el resto
     deja de mandar. */
  const minX = pc(xs, P_BORDE), maxX = pc(xs, 1 - P_BORDE);
  const minY = pc(ys, P_BORDE), maxY = pc(ys, 1 - P_BORDE);
  const cxm = (minX + maxX) / 2, cym = (minY + maxY) / 2;

  /* CENTRAR y DIMENSIONAR son decisiones distintas y quieren umbrales distintos:

       - el CENTRO sigue a la tinta VISIBLE (arriba), porque una sombra tenue a
         un lado desplazaba el dibujo sin que el ojo la viera;
       - el RADIO tiene que cubrir TODA la tinta (aqui), porque lo que no entre
         en el circulo asomara por fuera. Medirlo tambien con el umbral visible
         fue un error propio: dejo 20 de 50 con tinta fuera del sello, que es
         justo lo que el usuario habia reportado.

     Y el radio es el MAXIMO, no un percentil: con el percentil 99.5 el 0.5 %
     mas extremo se queda fuera del cuadro y es EXACTAMENTE el que asoma —
     quedaban 17 de 50 con tinta fuera del sello. Con el maximo la garantia es
     por construccion: si toda la tinta esta dentro de rMax y rMax se mapea a
     0.86 del radio del sello, nada puede salirse. El riesgo de que una mota
     encoja el dibujo ya lo cubre `borrarMarco`, que quita el aro (que era la
     mota grande) antes de llegar aqui. */
  let rMax = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[y * w + x] >= SUELO) continue;
    const d = Math.hypot(x - cxm, y - cym);
    if (d > rMax) rMax = d;
  }
  const lado = Math.max(8, Math.round((2 * rMax) / OCUPACION));
  const left = Math.round(cxm - lado / 2), top = Math.round(cym - lado / 2);
  return {
    left, top, width: lado, height: lado,
    padL: Math.max(0, -left), padT: Math.max(0, -top),
    padR: Math.max(0, left + lado - w), padB: Math.max(0, top + lado - h),
  };
}

/* Alfa: punto negro por percentil (un lacre muy oscuro hundia el rango y dejaba
   el resto translucido) + gamma que levanta los medios. */
function aAlfa(data, n) {
  const tinta = [];
  for (let i = 0; i < n; i++) if (data[i] < SUELO) tinta.push(data[i]);
  tinta.sort((a, b) => a - b);
  const negro = tinta.length ? tinta[(tinta.length * 0.02) | 0] : 0;
  const rango = Math.max(1, SUELO - negro);
  const out = Buffer.alloc(n);
  for (let i = 0; i < n; i++) {
    const a = data[i] >= SUELO ? 0 : Math.min(1, (SUELO - data[i]) / rango);
    out[i] = Math.round(Math.pow(a, 0.72) * 255);
  }
  return out;
}

async function procesar(src, v2, lado) {
  const LADO = lado || module.exports.LADO;
  if (!v2) {
    const r = await sharp(src).greyscale().resize(LADO, LADO, { fit: 'inside' })
      .raw().toBuffer({ resolveWithObject: true });
    const d = r.data; let negro = 255; for (const v of d) if (v < negro) negro = v;
    const rango = Math.max(1, SUELO - negro);
    const alfa = Buffer.alloc(d.length);
    for (let i = 0; i < d.length; i++) alfa[i] = d[i] >= SUELO ? 0 : Math.round(Math.min(1, (SUELO - d[i]) / rango) * 255);
    return { alfa, w: r.info.width, h: r.info.height, marco: null };
  }
  /* EL DITHER DEL PAPEL SE QUITA A RESOLUCION NATIVA (s147), y con un filtro
     ESPACIAL, no con un umbral. Lo reporto el usuario mirando «Primer aliento» y
     el «Buho»: un campo de puntos alrededor del motivo que NO esta en su dibujo.

     Medido el recorrido de un PNG: el fondo no es plano, viene DITHERADO entre
     ~240 y ~254 (modas 241 y 254, 25 % de los pixeles cada una). A resolucion
     nativa solo el 2,0 % cae bajo SUELO. Pero al reducir a 224 el promediado del
     dither hunde parches enteros por debajo del suelo (5,7 %) y el `sharpen`
     posterior los amplifica hasta el 12,4 %, con minimos de L 78 — o sea que la
     textura del papel entraba como TINTA, y la gamma de igualacion la levantaba
     todavia mas.

     POR QUE NO UN UMBRAL, que fue el primer intento y hubo que revertirlo:
     aplanar a 255 todo lo que ya estaba sobre SUELO parece la respuesta obvia
     —el suelo se estaba aplicando DESPUES del remuestreo que se lo lleva por
     delante—, pero la banda del dither SE SOLAPA con el tono del trazo mas
     palido, que es casi todo en estos dibujos a lapiz. Medido: la mediana de
     tinta del conjunto se hundio de 2,35 % a 1,1 % y `esMarco` dejo de detectar
     el aro en los 58 (al subir el fondo local a blanco, la linea fina promedia
     mas clara y se sale de TINTA_CLARA). Borraba dibujo, no solo papel.

     Tampoco lo arregla un filtro espacial, que fue el segundo intento: el
     moteado NO es ruido aleatorio sino un TRAMADO DE SEMITONO regular del propio
     PNG. Con `median(3)` a resolucion nativa el tramado sobrevive entero, y
     ademas `esMarco` empieza a fallar (perdio el aro de «Primer ritual», que
     salio con el circulo pintado dentro del sello). `blur()` es peor todavia:
     reparte el tramado en vez de quitarlo.

     Lo que si funciona es el umbral — el problema era DONDE se aplicaba, no el
     umbral. La deteccion del marco necesita el original (la linea del aro es
     fina y palida, y aplanar el fondo a blanco la hace promediar aun mas clara,
     que es lo que la sacaba de TINTA_CLARA). Asi que van por separado: el MARCO
     se busca sobre el original, y todo lo demas sobre la copia aplanada. Cada
     paso con el buffer que necesita. */
  const g = await sharp(src).greyscale().resize(1024, 1024, { fit: 'inside' })
    .raw().toBuffer({ resolveWithObject: true });
  const w = g.info.width, h = g.info.height;

  /* el marco, sobre el ORIGINAL */
  const c = contornoExterior(g.data, w, h);
  const marco = esMarco(c);

  /* y el resto sobre la copia SIN tramado: se aplana a resolucion nativa, que es
     donde el papel todavia esta por encima del suelo (2,0 % bajo suelo, contra
     el 5,7 % que hay ya despues de reducir). */
  const nat = await sharp(src).greyscale().raw().toBuffer({ resolveWithObject: true });
  const plano = Buffer.from(nat.data);
  for (let i = 0; i < plano.length; i++) if (plano[i] >= SUELO) plano[i] = 255;
  /* `.toColourspace('b-w')` NO es decorativo: sharp promueve el buffer raw de 1
     canal a 3 al remuestrearlo, igual que hace `.sharpen()` mas abajo. Sin esto,
     leer el resultado como gris desplaza cada fila y los 58 sellos salieron
     IDENTICOS —un fragmento del aro ampliado— con el dibujo entero perdido. */
  const p = await sharp(plano, { raw: { width: nat.info.width, height: nat.info.height, channels: 1 } })
    .resize(1024, 1024, { fit: 'inside' })
    .toColourspace('b-w')
    .raw().toBuffer({ resolveWithObject: true });
  if (p.info.channels !== 1) throw new Error('el aplanado esperaba 1 canal y son ' + p.info.channels);
  const data = Buffer.from(p.data);
  if (marco) borrarMarco(data, w, h, c);
  const bb = encuadre(data, w, h);

  /* El recorte se hace SOBRE EL BUFFER, no encadenando `.extend().extract()` en
     sharp: sharp tiene un orden de operaciones FIJO y aplica el extract ANTES
     del extend aunque se llamen al reves, asi que recortaba sobre la imagen sin
     ampliar y respondia «bad extract area» en cuanto el motivo tocaba un borde
     (las tres plumas: extract en x 80..1072 sobre 1024 de ancho). Rellenar a
     mano no tiene ese matiz y ademas es una copia menos. */
  let cuadro = data, cw = w, ch = h;
  if (bb) {
    cuadro = Buffer.alloc(bb.width * bb.height, 255);   // 255 = papel
    for (let y = 0; y < bb.height; y++) {
      const sy = bb.top + y;
      if (sy < 0 || sy >= h) continue;
      for (let x = 0; x < bb.width; x++) {
        const sx = bb.left + x;
        if (sx < 0 || sx >= w) continue;
        cuadro[y * bb.width + x] = data[sy * w + sx];
      }
    }
    cw = bb.width; ch = bb.height;
  }
  const img = sharp(cuadro, { raw: { width: cw, height: ch, channels: 1 } });
  /* `.sharpen()` DEVUELVE 3 CANALES aunque la entrada sea de 1 — comprobado:
     1.048.576 bytes entran, 3.145.728 salen. Leer eso como gris desplaza cada
     fila y el resultado son tiras horizontales. `toColourspace('b-w')` lo
     devuelve a un canal DESPUES de afilar. */
  const r = await img.resize(LADO, LADO, { fit: 'inside', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.5 }).toColourspace('b-w')
    .raw().toBuffer({ resolveWithObject: true });
  if (r.info.channels !== 1) throw new Error('esperaba 1 canal y son ' + r.info.channels);
  return { alfa: aAlfa(r.data, r.info.width * r.info.height), w: r.info.width, h: r.info.height, marco, cob: c.cobertura };
}

async function teñir(v) {
  const rgb = Buffer.alloc(v.w * v.h * 3);
  for (let i = 0; i < v.w * v.h; i++) {
    const a = v.alfa[i] / 255;
    rgb[i * 3] = Math.round(PAPEL.r + (ACENTO.r - PAPEL.r) * a);
    rgb[i * 3 + 1] = Math.round(PAPEL.g + (ACENTO.g - PAPEL.g) * a);
    rgb[i * 3 + 2] = Math.round(PAPEL.b + (ACENTO.b - PAPEL.b) * a);
  }
  return sharp(rgb, { raw: { width: v.w, height: v.h, channels: 3 } })
    .resize(SELLO * ZOOM, SELLO * ZOOM, { kernel: 'nearest' }).png().toBuffer();
}

function dibujosUnicos() {
  const files = fs.readdirSync(DIR).filter(f => /\.png$/i.test(f)).sort();
  const vistos = new Map();
  for (const f of files) {
    const k = (f.match(/^asset_([a-z0-9]+)_/i) || [, f])[1];
    if (!vistos.has(k)) vistos.set(k, f);
  }
  return [...vistos.values()];
}

/* Prueba objetiva de «no se sale del circulo»: cuanta tinta cae FUERA del
   circulo inscrito, que es la forma real del sello. Debe ser 0. */
function tintaFuera(v) {
  const cx = (v.w - 1) / 2, cy = (v.h - 1) / 2, R = Math.min(v.w, v.h) / 2;
  let fuera = 0, dentro = 0;
  for (let y = 0; y < v.h; y++) for (let x = 0; x < v.w; x++) {
    if (v.alfa[y * v.w + x] <= 20) continue;
    if (Math.hypot(x - cx, y - cy) > R) fuera++; else dentro++;
  }
  return dentro + fuera ? fuera / (dentro + fuera) : 0;
}

/* Y de «esta centrada»: desplazamiento del centro de masa de la tinta respecto
   al centro del sello, en % del radio. */
function descentrado(v) {
  const cx = (v.w - 1) / 2, cy = (v.h - 1) / 2, R = Math.min(v.w, v.h) / 2;
  let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < v.h; y++) for (let x = 0; x < v.w; x++) {
    const a = v.alfa[y * v.w + x];
    if (a <= 20) continue;
    sx += x; sy += y; n++;
  }
  if (!n) return 0;
  return Math.hypot(sx / n - cx, sy / n - cy) / R;
}

async function main() {
  const unicos = dibujosUnicos();
  /* los tres que reporto el usuario primero: brote (#11), cartografa (#5) y
     tres plumas (#45), mas otros para no optimizar solo sobre esos */
  const idx = [10, 4, 44, 0, 12, 20, 21, 30, 34, 37];
  console.log('=== v1 vs v2 · encuadre corregido ===\n');
  console.log('#     marco?      tinta FUERA del circulo   descentrado');
  const filas = [[], []];
  for (const i of idx) {
    const src = path.join(DIR, unicos[i]);
    const v1 = await procesar(src, false);
    const v2 = await procesar(src, true);
    console.log(
      String(i + 1).padEnd(6) +
      (v2.marco ? 'si, fuera' : 'no').padEnd(12) +
      ((tintaFuera(v1) * 100).toFixed(1) + '% -> ' + (tintaFuera(v2) * 100).toFixed(1) + '%').padEnd(26) +
      ((descentrado(v1) * 100).toFixed(0) + '% -> ' + (descentrado(v2) * 100).toFixed(0) + '%')
    );
    filas[0].push(await teñir(v1));
    filas[1].push(await teñir(v2));
  }
  const C = SELLO * ZOOM, capas = [];
  filas.forEach((f, r) => f.forEach((b, i) => capas.push({ input: b, left: i * C, top: r * C })));
  await sharp({ create: { width: C * idx.length, height: C * 2, channels: 3, background: '#F2EDE0' } })
    .composite(capas).png().toFile(OUT);
  console.log('\nhoja: ' + OUT + '\n  ARRIBA v1 · ABAJO v2');
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { procesar, dibujosUnicos, contornoExterior, esMarco, borrarMarco, encuadre, aAlfa, tintaFuera, descentrado, SUELO, LADO };
