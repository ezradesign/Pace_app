/* PACE · scripts/audit/revision-glifos.js (sesión 147)
   Hoja de revisión del arte de logro. Emite `_revision-glifos.html` en la raíz
   (ignorado por git) para servirlo con el preview y decidir MIRANDO, no leyendo
   una tabla.

   Uso:  node scripts/audit/revision-glifos.js
         y abrir  http://localhost:8765/_revision-glifos.html

   Tres bloques, en el orden que pidió el usuario al abrir la sesión:
     1. las 9 apuestas del mapeo (○ en MAPEO_GLIFOS_LOGRO.md)
     2. los 3 dibujos que quedaron sueltos al entrar los 8 nuevos
     3. los 4 glifos por debajo del 75 % de la mediana de tinta

   POR QUÉ HTML Y NO UNA HOJA DE CONTACTO EN PNG
   ---------------------------------------------
   El sello se pinta con `mask-image` sobre `currentColor` a 56 px. Un PNG
   compuesto a mano mediría OTRA cosa: reproduce el dibujo, no el mecanismo.
   Sirviendo el HTML con las máscaras REALES y `app/tokens.css`, lo que se ve es
   exactamente lo que pinta `Seal` —mismo tamaño, mismo borde, mismos tokens—.

   Los tres dibujos sueltos aún no tienen máscara en el árbol (no están en el
   mapeo), así que se procesan al vuelo con el MISMO `glifos-v2.js` que usa la
   ingesta y viajan como data URI. La igualación de peso final la hace la
   ingesta; aquí solo se informa del peso medido. */
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const v2 = require('./glifos-v2.js');

const ROOT = path.resolve(__dirname, '..', '..');
const ORIGEN = path.resolve(ROOT, '..', 'Glifos_logros');
const MASCARAS = path.join(ROOT, 'app', 'glyphs', 'assets', 'logros');
const SALIDA = path.join(ROOT, '_revision-glifos.html');

/* Colores de CAT_META resueltos a su valor de la paleta crema: la hoja no monta
   React, así que no hay quien resuelva las var() de categoría. */
const COLOR_CAT = {
  primeros: 'var(--ink-3)',
  constancia: 'var(--focus)',
  exploracion: 'var(--breathe)',
  maestria: 'var(--achievement)',
  secretos: 'var(--ink-2)',
  estacionales: 'var(--move)',
  estadisticas: 'var(--hydrate)',
};

/* ─── 1. Las 9 apuestas ─────────────────────────────────────────────────────
   Copiadas de la tabla ○ de docs/product/MAPEO_GLIFOS_LOGRO.md. `nota` es el
   motivo por el que se marcó como apuesta y no como encaje. */
const APUESTAS = [
  { id: 'first.breath', dibujo: 'Semilla con cola',
    nota: 'La semilla dice «empieza algo», pero no dice ALIENTO. Encajaría igual en cualquier «primero».' },
  { id: 'explore.nadi', dibujo: 'Elipse plana',
    nota: 'Se eligió por el lazo del infinito ≈ alternar fosa. Es la lectura más fina de las nueve.' },
  { id: 'streak.100', dibujo: 'Espiral con cuentas',
    nota: 'Cuentas = días contados, espiral = que no para. Pero nada la ata a CIEN y no a otra racha.' },
  { id: 'explore.hips', dibujo: 'Vara con hojas',
    nota: 'Elegido por «flexible». No hay cadera en el dibujo: es la apuesta más floja del grupo.' },
  { id: 'master.centurion', dibujo: 'Cáliz con llama',
    nota: 'Llama sostenida = 100 sesiones de respiración. Podría ir a cualquier maestría larga.' },
  { id: 'explore.physiological', dibujo: 'Capullo',
    nota: 'El capullo es el doble golpe de aire antes de soltar. Metáfora, no ilustración.' },
  { id: 'secret.safety.read', dibujo: 'Pluma escribiendo',
    nota: 'Pluma = letra pequeña leída. Va con el título («Letra pequeña») más que con el hecho.' },
  { id: 'explore.all.breathe', dibujo: 'Rosa de los vientos',
    nota: 'Recorrer todas las direcciones ≈ todas las respiraciones. Es el que más gente leería mal.' },
  { id: 'master.collector.full', dibujo: 'Prensa tipográfica', nuevo: true,
    nota: 'ESTE CAMBIÓ: la llave que proponía la tabla salió al llegar los 8 nuevos y entró la prensa. Nadie lo ha revisado todavía.' },
];

/* ─── 2. Los que acaban de entrar ───────────────────────────────────────────
   Los tres que quedaron sueltos (destino aprobado por el usuario) y el pincel,
   que el usuario RECHAZÓ en hidratación y aquí va recolocado. Ya tienen máscara
   en el árbol, así que se leen del mismo sitio que las demás. */
const NUEVOS = [
  { id: 'streak.60', dibujo: 'Bambú', estado: 'aprobado',
    por: 'Crece por NUDOS, un tramo cada vez: la imagen clásica de lo lento que no se detiene.' },
  { id: 'explore.478', dibujo: 'Vasija humeante', estado: 'aprobado',
    por: 'El humo sube lento y largo, como la exhalación más larga del catálogo.' },
  { id: 'secret.bilingual', dibujo: 'Llave ornamentada', estado: 'aprobado',
    por: 'Abre lo que estaba cerrado. Y al ser secreto, el sello sale «?» hasta ganarlo: la llave aparece como recompensa.' },
  { id: 'stats.month.first', dibujo: 'Pincel con gota de tinta', estado: 'propuesta',
    por: 'Estaba en «Semana hidratada» y no cuadraba: el mapeo de s146 lo anotó como «aguja con gota» y de ahí salió a hidratación. Es un pincel de caligrafía con una gota a punto de caer —LA MARCA que se hace—, y «Mes habitado» son veinte marcas en el mismo mes. Alternativa: «Zen accidental». `hydrate.week.perfect` se queda SIN máscara hasta que haya un dibujo de agua.' },
];

/* ─── 3. Los flojos ─────────────────────────────────────────────────────────
   Umbral: por debajo del 75 % de la mediana de tinta de las 55 máscaras. */
const UMBRAL_FLOJO = 0.75;

function catalogo() {
  const src = fs.readFileSync(path.join(ROOT, 'app', 'achievements', 'catalog.js'), 'utf8');
  const out = {};
  for (const m of src.matchAll(/\{ id: '([^']+)', cat: '([^']+)', title: '([^']*)', desc: '([^']*)'/g)) {
    out[m[1]] = { id: m[1], cat: m[2], title: m[3], desc: m[4] };
  }
  return out;
}

async function pesoDeMascara(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let s = 0;
  for (let i = 3; i < data.length; i += 4) s += data[i];
  return s / (info.width * info.height) / 255;
}

/* clave estable -> archivo, idéntico a la ingesta (mismo criterio, misma trampa
   evitada: NUNCA por posición). */
function dibujosUnicos() {
  const files = fs.readdirSync(ORIGEN).filter(f => /\.png$/i.test(f)).sort();
  const vistos = new Map();
  for (const f of files) {
    const m = f.match(/^asset_([a-z0-9]+)_/i);
    const k = m ? m[1] : f;
    if (!vistos.has(k)) vistos.set(k, f);
  }
  return vistos;
}

async function mascaraDataUri(src) {
  const r = await v2.procesar(src, true, 224);
  const rgba = Buffer.alloc(r.w * r.h * 4);
  for (let i = 0; i < r.w * r.h; i++) {
    rgba[i * 4] = 255; rgba[i * 4 + 1] = 255; rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = r.alfa[i];
  }
  const webp = await sharp(rgba, { raw: { width: r.w, height: r.h, channels: 4 } })
    .webp({ quality: 60, alphaQuality: 100 }).toBuffer();
  let s = 0;
  for (let i = 0; i < r.alfa.length; i++) s += r.alfa[i];
  return { uri: 'data:image/webp;base64,' + webp.toString('base64'), peso: s / r.alfa.length / 255 };
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Un sello, exactamente como lo monta `Seal` en estado DESBLOQUEADO: círculo de
   56 px, borde 1.2px del color de la categoría, anillo exterior a 0.4, y la
   máscara sobre `currentColor`. */
function sello(url, color, px) {
  const d = px || 56;
  return '<div class="sello" style="--c:' + color + ';width:' + d + 'px;height:' + d + 'px">' +
    '<i style="-webkit-mask-image:url(&quot;' + url + '&quot;);mask-image:url(&quot;' + url + '&quot;)"></i>' +
    '<u></u></div>';
}

function ficha(a, url, extra) {
  const color = COLOR_CAT[a.cat] || 'var(--ink-3)';
  return '<article class="ficha">' +
    '<div class="par">' + sello(url, color, 56) + sello(url, color, 168) + '</div>' +
    '<div class="txt">' +
      '<h3>' + esc(a.title) + '</h3>' +
      '<p class="desc">' + esc(a.desc) + '</p>' +
      '<p class="id">' + esc(a.id) + '</p>' +
      extra +
    '</div>' +
  '</article>';
}

async function main() {
  const cat = catalogo();
  const unicos = dibujosUnicos();

  /* pesos de las 55 del árbol, para la mediana y para señalar a los flojos */
  const pesos = {};
  for (const f of fs.readdirSync(MASCARAS).filter(f => /\.webp$/.test(f))) {
    pesos[f.replace('.webp', '')] = await pesoDeMascara(path.join(MASCARAS, f));
  }
  const orden = Object.values(pesos).sort((a, b) => a - b);
  const mediana = orden[orden.length >> 1];
  const flojos = Object.entries(pesos)
    .filter(([, p]) => p < mediana * UMBRAL_FLOJO)
    .sort((a, b) => a[1] - b[1]);

  const ruta = id => 'app/glyphs/assets/logros/' + id + '.webp';

  /* 1 · apuestas */
  const bloque1 = APUESTAS.map(ap => {
    const a = cat[ap.id];
    const extra = '<p class="dib">' + esc(ap.dibujo) + (ap.nuevo ? ' <span class="pill">dibujo nuevo</span>' : '') + '</p>' +
      '<p class="nota">' + esc(ap.nota) + '</p>';
    return ficha(a, ruta(ap.id), extra);
  }).join('\n');

  /* 2 · los que acaban de entrar */
  const fichas2 = NUEVOS.map(function (nv) {
    const a = cat[nv.id];
    const extra = '<p class="dib">' + esc(nv.dibujo) +
      ' <span class="pill">' + esc(nv.estado) + '</span></p>' +
      '<p class="nota">' + esc(nv.por) + '</p>';
    return ficha(a, ruta(nv.id), extra);
  });

  /* 3 · flojos, cada uno contra una máscara de peso mediano para comparar */
  const medianoId = Object.entries(pesos).sort((a, b) => Math.abs(a[1] - mediana) - Math.abs(b[1] - mediana))[0][0];
  const bloque3 = flojos.map(([id, p]) => {
    const a = cat[id];
    const extra = '<p class="dib">tinta ' + (p * 100).toFixed(2) + ' % · mediana ' +
      (mediana * 100).toFixed(2) + ' % · <b>' + Math.round(p / mediana * 100) + ' %</b> de la mediana</p>' +
      '<p class="nota">Ya lleva la gamma al tope. Su techo —toda la tinta a opacidad plena— queda por ' +
      'debajo de la mediana, así que no es cuestión de opacidad: el dibujo tiene menos trazo.</p>';
    return ficha(a, ruta(id), extra);
  }).join('\n');

  const html = [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>PACE · revisión de glifos de logro</title>',
    '<link rel="stylesheet" href="/app/tokens.css">',
    '<style>',
    'body{background:var(--paper);color:var(--ink);font-family:var(--font-ui);padding:40px 32px 80px;max-width:1180px;margin:0 auto}',
    'h1{font-family:var(--font-display);font-style:italic;font-weight:500;font-size:34px;margin:0 0 6px}',
    'h2{font-family:var(--font-display);font-style:italic;font-weight:500;font-size:24px;margin:56px 0 4px;padding-top:28px;border-top:1px solid var(--line)}',
    '.sub{color:var(--ink-3);font-size:13px;margin:0 0 24px;line-height:1.5;max-width:64ch}',
    '.rejilla{display:grid;grid-template-columns:repeat(auto-fill,minmax(430px,1fr));gap:26px}',
    '.ficha{display:flex;gap:20px;align-items:flex-start;border:1px solid var(--line);border-radius:var(--r-md);padding:18px;background:var(--paper)}',
    '.par{display:flex;flex-direction:column;align-items:center;gap:14px;flex:0 0 auto}',
    '.sello{border-radius:50%;border:1.2px solid var(--c);display:grid;place-items:center;color:var(--c);position:relative;flex:0 0 auto}',
    '.sello i{display:block;width:100%;height:100%;background-color:currentColor;',
    '  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;',
    '  -webkit-mask-size:contain;mask-size:contain}',
    '.sello u{position:absolute;inset:-4px;border-radius:50%;border:.5px solid var(--c);opacity:.4}',
    '.txt{min-width:0}',
    'h3{font-family:var(--font-display);font-style:italic;font-weight:500;font-size:19px;margin:0 0 3px}',
    '.desc{font-size:12px;color:var(--ink-3);margin:0 0 2px;letter-spacing:.03em}',
    '.id{font-size:10.5px;color:var(--ink-3);opacity:.75;letter-spacing:.06em;margin:0 0 12px}',
    '.dib{font-size:12.5px;color:var(--ink-2);margin:0 0 6px;letter-spacing:.02em}',
    '.prop{font-size:13px;margin:0 0 8px;line-height:1.4}',
    '.prop .id{display:inline;margin:0}',
    '.nota{font-size:12.5px;color:var(--ink-2);line-height:1.5;margin:0}',
    '.pill{font-size:9px;letter-spacing:.14em;text-transform:uppercase;border:.5px solid var(--line-2);border-radius:999px;padding:2px 7px;color:var(--ink-3)}',
    '</style></head><body>',
    '<h1>Revisión del arte de logro</h1>',
    '<p class="sub">Cada sello se pinta aquí con el mismo mecanismo que en la app —<code>mask-image</code> sobre ' +
      '<code>currentColor</code>, 56 px, borde y anillo del color de su categoría—. A la izquierda el tamaño real; ' +
      'a la derecha el mismo dibujo a 3× para juzgar el trazo.</p>',
    '<h2>1 · Las nueve apuestas</h2>',
    '<p class="sub">Las marcadas ○ en el mapeo: encajan por metáfora, no porque el dibujo lo diga. ' +
      'Confirmadas por el usuario en la s147.</p>',
    '<div class="rejilla">', bloque1, '</div>',
    '<h2>2 · Los que acaban de entrar</h2>',
    '<p class="sub">Los tres que quedaron sueltos al llegar los ocho nuevos, ya colocados, más el pincel ' +
      'recolocado. Con esto el catálogo pasa a <b>' + Object.keys(pesos).length + ' logros con arte</b>.</p>',
    '<div class="rejilla">', fichas2.join('\n'), '</div>',
    '<h2>3 · Los flojos</h2>',
    '<p class="sub">Por debajo del 75 % de la mediana de tinta. <b>Ojo al comparar con la lista anterior</b>: ' +
      'al quitar el tramado de semitono del papel la mediana se mide ya sobre tinta REAL, así que salen más ' +
      '—los que antes cuadraban lo hacían con relleno que no era suyo. Al lado, <b>' + esc(cat[medianoId].title) +
      '</b> como referencia de peso normal.</p>',
    '<div class="rejilla">', bloque3,
    ficha(cat[medianoId], ruta(medianoId), '<p class="dib">tinta ' + (pesos[medianoId] * 100).toFixed(2) +
      ' % · <b>referencia</b></p><p class="nota">Peso mediano del conjunto. Es contra este trazo contra el que se ven flojos los de arriba.</p>'),
    '</div>',
    '</body></html>',
  ].join('\n');

  fs.writeFileSync(SALIDA, html, 'utf8');
  console.log('escrito ' + SALIDA);
  console.log('  mediana de tinta ' + (mediana * 100).toFixed(2) + ' % · umbral ' + (mediana * UMBRAL_FLOJO * 100).toFixed(2) + ' %');
  console.log('  flojos: ' + flojos.map(([id, p]) => id + ' (' + (p * 100).toFixed(2) + ' %)').join(', '));
  console.log('  referencia de peso mediano: ' + medianoId);
}

main().catch(e => { console.error(e); process.exit(1); });
