/* PACE · MAQUETA del «menú del día» (s192)
 * ========================================
 * Ronda 1 → `docs/proposals/menu-del-dia-r1.html`: la home real calcada en los
 * viewports del usuario, con las dos jerarquías posibles montadas encima
 * (A · el menú manda · B · discreto) y la regla que compone la jornada.
 * Ronda 2 (`--r2`) → `menu-del-dia-r2.html`: solo A (la elegida), con el NOMBRE y
 * los GLIFOS como mandos.
 * Ronda 3 (`--r3`) → `a-tu-ritmo-r3.html`: nombre «ritmo», HORARIO y glifo de COMIDA.
 * Ronda 4 (`--r4`) → `a-tu-ritmo-r4.html`: salida, duración de la comida y llegar tarde.
 * SOLO LA ÚLTIMA RONDA SE REGENERA TAL CUAL: el componente evoluciona con cada una, y
 * las anteriores quedan en docs/proposals como archivo de lo que se vio.
 *
 * Piezas: menu-s192-calco.js (la app congelada) · menu-s192-jornada.js (la regla,
 * pura) · menu-s192-nombres.js (textos y glifos propios) · menu-s192-piezas.js (lo
 * que se pinta) · menu-s192-componente(.css).js (el montaje y la medida) ·
 * menu-s192-pagina(-rN).js.
 *
 * Uso: node .claude/static-server.js   (aparte, puerto 8765)
 *      node scripts/audit/menu-s192.js [--r2 | --r3 | --r4]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const C = require('./menu-s192-calco');
const { menuJornada, menuHora } = require('./menu-s192-jornada');
const { pmRecursos } = require('./menu-s192-nombres');
const { pmMontar } = require('./menu-s192-componente');
const { pmPiezas } = require('./menu-s192-piezas');
const { CSS_MENU } = require('./menu-s192-componente.css');

const RONDA = [4, 3, 2].find((n) => process.argv.includes('--r' + n)) || 1;
const { pagina } = require(['./menu-s192-pagina', './menu-s192-pagina-r2', './menu-s192-pagina-r3', './menu-s192-pagina-r4'][RONDA - 1]);
const BASE = process.env.PACE_BASE || 'http://localhost:8765';
const SALIDA = path.join(C.ROOT, 'docs', 'proposals', ['menu-del-dia-r1.html', 'menu-del-dia-r2.html', 'a-tu-ritmo-r3.html', 'a-tu-ritmo-r4.html'][RONDA - 1]);
const VIEWPORTS = [
  { id: 'e1280', w: 1280, h: 879, nota: 'el tuyo' },
  { id: 'e1536', w: 1536, h: 714, nota: 'el más bajo que medimos' },
  { id: 'm412', w: 412, h: 844, nota: 'el tuyo' },
  { id: 'm360', w: 360, h: 730, nota: 'el tuyo' },
];
const FOTOS = RONDA === 1 ? ['e1280', 'm360'] : [];

(async () => {
  const b = await C.chromium.launch();
  const calcos = {}, fotos = [];
  let css = null;
  for (const vp of VIEWPORTS) {
    const c = await C.calcar(b, vp, BASE, css === null);
    if (css === null) css = c.css;
    vp.movil = c.movil;
    calcos[vp.id] = { html: c.html, htmlAttrs: c.htmlAttrs, bodyAttrs: c.bodyAttrs };
    if (FOTOS.includes(vp.id)) {
      fotos.push({ w: vp.w, h: vp.h, movil: c.movil, rects: c.rects, png: 'data:image/png;base64,' + c.png.toString('base64') });
    }
    console.log(vp.id.padEnd(6) + ' calco ' + Math.round(c.html.length / 1024) + ' KB · recomendadores visibles: '
      + Object.keys(c.rects).filter((k) => c.rects[k]).join(', '));
  }
  await b.close();

  const codigo = [menuJornada, menuHora, pmRecursos, pmPiezas, pmMontar].map((f) => f.toString()).join('\n');
  const html = pagina({
    css, cssMenu: CSS_MENU, calcos, vps: VIEWPORTS, fotos, codigo, recursos: pmRecursos(),
    hora: menuHora,
  });
  fs.writeFileSync(SALIDA, html);
  console.log('maqueta: ' + path.relative(C.ROOT, SALIDA) + ' · ' + Math.round(fs.statSync(SALIDA).size / 1024) + ' KB');
})();
