/* PACE · junta las medidas de tests/textos-al-limite.mide.js en una lista (20 nov. 2026)
 *
 *   node docs/proposals/textos-al-limite-20nov/junta.js <carpeta con los JSON> <plataforma>
 *
 * Escribe `medidas-<plataforma>.json` aquí al lado: un texto por fila, con cada sitio donde
 * va justo (pantalla, momento, idioma, letra) y lo que pasa si pasa de línea. Imprime la tabla. */
'use strict';

const fs = require('fs');
const path = require('path');

const [, , carpeta, plataforma] = process.argv;
if (!carpeta || !plataforma) { console.error('uso: junta.js <carpeta> <plataforma>'); process.exit(1); }

const UMBRAL = 3;
const filas = new Map();
let medidos = 0;
for (const f of fs.readdirSync(carpeta).filter((n) => n.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(path.join(carpeta, f), 'utf8'));
  const vp = d.vp ? d.vp.w + '×' + d.vp.h : null;
  for (const fila of d.filas) {
    if (fila.error) { console.warn('ERROR', f, fila.momento, fila.error); continue; }
    medidos += fila.medidos;
    for (const t of fila.justos) {
      const equiv = t.lineas === 1 ? t.margen : +(t.porLetra * t.letras / t.lineas).toFixed(2);
      const clave = d.pantalla.split(' ')[0] + '|' + d.lang + '|' + t.texto;
      if (!filas.has(clave)) filas.set(clave, { pantalla: d.pantalla.split(' ')[0], lang: d.lang, texto: t.texto, donde: t.donde, sitios: [] });
      const ef = t.efecto && t.efecto.despues ? cambios(t.efecto.antes, t.efecto.despues) : null;
      filas.get(clave).sitios.push({ momento: fila.momento, vp: vp || (fila.momento.match(/^\d+×\d+/) || ['360×640'])[0], letra: d.letra,
        lineas: t.lineas, margen: t.margen, porLetra: t.porLetra, equiv, natural: t.natural, ancho: t.ancho, motivo: t.motivo || t.motivoLetra,
        reserva: t.reserva, efecto: ef });
    }
  }
}

/* Lo que cambió en la pantalla al dejar el texto pasado de su sitio. */
function cambios(a, b) {
  const out = [];
  for (const k of Object.keys(b.scroll || {})) if ((b.scroll[k] || 0) > (a.scroll[k] || 0) + 0.5) out.push('scroll en ' + k + ': +' + (b.scroll[k] - (a.scroll[k] || 0)) + ' px');
  if (b.luegoEscondido && !a.luegoEscondido) out.push('la tarjeta esconde «Luego»');
  if (b.actividadesEnFila && !a.actividadesEnFila) out.push('las actividades se quedan en dibujo');
  if (b.runnerJusto && !a.runnerJusto) out.push('el runner pasa a «justo»');
  if (a.dibujo && b.dibujo && b.dibujo < a.dibujo) out.push('el dibujo encoge ' + (a.dibujo - b.dibujo) + ' px');
  if (a.aro && b.aro && b.aro < a.aro) out.push('el aro encoge ' + (a.aro - b.aro) + ' px');
  if (a.pieDeLaPausa && b.pieDeLaPausa > a.pieDeLaPausa) out.push('«Ahora no» baja ' + (b.pieDeLaPausa - a.pieDeLaPausa) + ' px' + (b.pieDeLaPausa > b.pantalla ? ' y se sale' : ''));
  return out;
}

const lista = [...filas.values()].map((f) => {
  f.minimo = Math.min(...f.sitios.map((s) => s.equiv));
  return f;
}).sort((a, b) => a.minimo - b.minimo);

fs.writeFileSync(path.join(__dirname, 'medidas-' + plataforma + '.json'), JSON.stringify({ plataforma, medidos, umbral: UMBRAL, textos: lista }, null, 1));
console.log(medidos + ' medidas; ' + lista.length + ' textos con menos de ' + UMBRAL + ' px en algún sitio\n');
for (const f of lista) {
  console.log(f.minimo.toFixed(2).padStart(5) + ' px  [' + f.pantalla + ' ' + f.lang + '] ' + f.texto.slice(0, 70));
  for (const s of f.sitios.sort((a, b) => a.equiv - b.equiv).slice(0, 4)) {
    console.log('         ' + s.equiv.toFixed(2) + ' ' + s.vp + ' letra ' + s.letra + ' · ' + s.momento + ' · ' + s.lineas + ' lín. · ' + s.motivo
      + (s.efecto && s.efecto.length ? ' → ' + s.efecto.join(', ') : ''));
  }
}
