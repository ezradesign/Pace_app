/* PACE · cruza las medidas de Windows y de Linux por texto (20 nov. 2026)
 *
 *   node docs/proposals/textos-al-limite-20nov/compara.js <carpeta Windows> <carpeta Linux>
 *
 * Cada texto que va con menos de 3 px en alguno de los dos, con lo que le sobra en cada uno (el
 * peor caso entre pantallas, idiomas y tamaños de letra). Escribe `comparadas.json` aquí al lado. */
'use strict';

const fs = require('fs');
const path = require('path');

const UMBRAL = 3;
const [, , dirW, dirL] = process.argv;
const equiv = (t) => (t.lineas === 1 ? t.margen : t.porLetra * t.letras / t.lineas);

function carga(dir) {
  const justos = [], todos = [];
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const pantalla = d.pantalla.split(' ')[0];
    for (const fila of d.filas) {
      if (fila.error) continue;
      const vp = d.vp ? d.vp.w + '×' + d.vp.h : (fila.momento.match(/^\d+×\d+/) || ['360×640'])[0];
      const cond = { pantalla, lang: d.lang, letra: d.letra, vp, momento: fila.momento };
      for (const t of fila.justos) justos.push(Object.assign({}, cond, t, { equiv: equiv(t) }));
      for (const [texto, lineas, margen, porLetra] of fila.todos) todos.push(Object.assign({}, cond, { texto, lineas, margen, porLetra }));
    }
  }
  return { justos, todos };
}
const W = carga(dirW), L = carga(dirL);

/* Lo que le sobra a un texto en una plataforma, en su peor sitio. */
function peor(P, ref) {
  const mios = P.justos.filter((t) => t.pantalla === ref.pantalla && t.lang === ref.lang && t.texto === ref.texto);
  if (mios.length) return mios.reduce((a, b) => (b.equiv < a.equiv ? b : a));
  const corto = ref.texto.slice(0, 60);
  /* En la misma condición que el peor caso de la otra; si allí lleva más líneas, ya va partido. */
  const igual = P.todos.filter((t) => t.pantalla === ref.pantalla && t.lang === ref.lang && t.texto === corto && t.vp === ref.vp && t.letra === ref.letra && t.momento === ref.momento);
  const partido = igual.find((t) => t.lineas > ref.lineas);
  if (partido) return Object.assign({}, partido, { equiv: -1, yaPartido: true });
  let min = null;
  for (const t of (igual.length ? igual : P.todos)) {
    if (t.pantalla !== ref.pantalla || t.lang !== ref.lang || t.texto !== corto) continue;
    const e = t.lineas === 1 ? (t.margen == null ? 12 : t.margen) : (t.porLetra == null ? 0.15 : t.porLetra) * ref.letras / t.lineas;
    if (min == null || e < min.equiv) min = Object.assign({}, t, { equiv: e, mas: t.lineas === 1 ? t.margen == null : t.porLetra == null });
  }
  return min;
}

const vistos = new Map();
for (const t of W.justos.concat(L.justos)) {
  const k = t.pantalla + '|' + t.lang + '|' + t.texto;
  if (vistos.has(k)) continue;
  const w = peor(W, t), l = peor(L, t);
  const dato = (p) => p && { px: +p.equiv.toFixed(2), mas: !!p.mas, yaPartido: !!p.yaPartido, vp: p.vp, letra: p.letra, momento: p.momento, lineas: p.lineas,
    motivo: p.motivo || p.motivoLetra || null, efecto: p.efecto || null };
  vistos.set(k, { pantalla: t.pantalla, lang: t.lang, texto: t.texto, donde: t.donde, letras: t.letras, windows: dato(w), linux: dato(l) });
}
const lista = [...vistos.values()].sort((a, b) => Math.min(a.windows ? a.windows.px : 99, a.linux ? a.linux.px : 99) - Math.min(b.windows ? b.windows.px : 99, b.linux ? b.linux.px : 99));
fs.writeFileSync(path.join(__dirname, 'comparadas.json'), JSON.stringify({ umbral: UMBRAL, textos: lista }, null, 1));
for (const t of lista) {
  const f = (p) => (p ? (p.yaPartido ? 'PARTIDO' : (p.mas ? '>' : '') + p.px.toFixed(2)) : '  ?  ').padStart(7);
  console.log(f(t.windows) + ' W ' + f(t.linux) + ' L  [' + t.pantalla + ' ' + t.lang + '] ' + t.texto.slice(0, 64));
}
