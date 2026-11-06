/**
 * verify.promesas.js - PACE · lo que la web y los README cuentan de las rutinas y los sellos es verdad
 *
 * No es un script suelto: lo invoca `verify.integridad.js` dentro de la tanda [4/4],
 * con los catálogos ya cargados. Vive aparte por la regla de las 500 líneas.
 *
 * POR QUÉ EXISTE. /premium prometía «34 rutinas» gratis y los README, «las 19 rutinas
 * más profundas», contadas el 18 oct. 2026. Las capas de Mueve y Estira (Ez, 23 oct.,
 * 2A) movieron rutinas de un módulo a otro y lo dejaron en 35 y 18, y nada se puso
 * rojo: el censo cuenta las rutinas de cada módulo, no lo que se promete de ellas.
 *
 * QUÉ MIRA. Cuenta las rutinas gratis y las de pago de Respira, Mueve y Estira, y pide
 * que cada frase de `frases()` diga esos números. Una frase que ya no se encuentra es
 * roja: si el texto se reescribe, su frase se reescribe aquí.
 *
 * LOS SELLOS (6 nov. 2026). Los README decían «96 sellos» cuando el panel de Logros ya solo
 * enseñaba los que se pueden ganar (Ez, 5 nov.: sin «Pronto»). Se cuentan cargando
 * `app/achievements/catalog.js` en un sandbox, y los README dicen el catálogo y los que tienen
 * detector. No se vigila una cifra «a la vista»: el panel quita en marcha los que hoy no se
 * pueden ganar (Cartógrafa, ATG y Ancestral) y varía con la plataforma, y el sandbox no lo
 * ve. Los dibujos de logro tampoco entran: esa cuenta vive en `docs/product/GLIFOS_A_DIBUJAR.md`
 * y cambia con cada tanda.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');
var ROOT = path.resolve(__dirname, '..');

/* Los sellos de logro: el catálogo entero y los que tienen detector. */
function cuentaSellos() {
  var sb = { window: {} };
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'app', 'achievements', 'catalog.js'), 'utf8')
    + '\n;this.__sellos = { total: ACHIEVEMENT_CATALOG.length, detector: IMPLEMENTED_ACHIEVEMENTS.size };', sb);
  return sb.__sellos;
}

/* Una rutina sin `access` es gratis: así la lee la app (`app/state-entitlement.jsx`). */
function cuenta(grupos) {
  var n = { total: 0, gratis: 0 };
  Object.keys(grupos || {}).forEach(function (k) {
    ((grupos[k] || {}).items || []).forEach(function (r) {
      n.total++;
      if (r.access !== 'premium') n.gratis++;
    });
  });
  return n;
}

/* Cada frase: el archivo, la expresión con sus números entre paréntesis y lo que valen. */
function frases(c, gratis, pago, s) {
  return [
    ['premium/index.html', /data-en="(\d+) routines">(\d+) rutinas</, [gratis, gratis]],
    ['README.md', /, (\d+) rutinas, Hidrátate/, [gratis]],
    ['README.md', /añade las (\d+) rutinas más profundas/, [pago]],
    ['README.md', /\*\*Respira\*\* \| (\d+) técnicas[^|\n]*, (\d+) gratis \|/, [c.respira.total, c.respira.gratis]],
    ['README.md', /\*\*Mueve\*\* \| (\d+) rutinas[^|\n]*, (\d+) gratis \|/, [c.mueve.total, c.mueve.gratis]],
    ['README.md', /\*\*Estira\*\* \| (\d+) rutinas[^|\n]*, (\d+) gratis \|/, [c.estira.total, c.estira.gratis]],
    ['README_EN.md', /, (\d+) routines, Hydrate/, [gratis]],
    ['README_EN.md', /adds the (\d+) deeper routines/, [pago]],
    ['README_EN.md', /\*\*Respira\*\* \(Breathe\) \| (\d+) breathwork[^|\n]*, (\d+) free \|/, [c.respira.total, c.respira.gratis]],
    ['README_EN.md', /\*\*Mueve\*\* \(Move\) \| (\d+) [^|\n]*, (\d+) free \|/, [c.mueve.total, c.mueve.gratis]],
    ['README_EN.md', /\*\*Estira\*\* \(Stretch\) \| (\d+) [^|\n]*, (\d+) free \|/, [c.estira.total, c.estira.gratis]],
    ['README.md', /\| Logros \| (\d+) en catálogo · (\d+) con detector activo/, [s.total, s.detector]],
    ['README_EN.md', /\| Achievements \| (\d+) in catalog · (\d+) with an active detector/, [s.total, s.detector]],
  ];
}

function chequeaPromesas(ctx, catalogos) {
  var c = { respira: cuenta(catalogos.respira), mueve: cuenta(catalogos.mueve), estira: cuenta(catalogos.estira) };
  var gratis = c.respira.gratis + c.mueve.gratis + c.estira.gratis;
  var pago = c.respira.total + c.mueve.total + c.estira.total - gratis;
  var sellos = cuentaSellos();
  var fallos = 0;
  frases(c, gratis, pago, sellos).forEach(function (f) {
    var m = fs.readFileSync(path.join(ROOT, f[0]), 'utf8').match(f[1]);
    if (!m) {
      fallos++;
      ctx.falla('promesas: ' + f[0] + ' ya no dice ' + f[1] + ' -- si se reescribió, reescribe su frase en scripts/verify.promesas.js');
      return;
    }
    var dice = m.slice(1).map(Number);
    if (dice.join() !== f[2].join()) {
      fallos++;
      ctx.falla('promesas: ' + f[0] + ' dice «' + m[0] + '» y lo que cuenta la app es ' + f[2].join(' y '));
    }
  });
  if (!fallos) ctx.ok('promesas: ' + gratis + ' rutinas gratis y ' + pago + ' de pago, y ' + sellos.total + ' sellos (' + sellos.detector + ' con detector), igual en /premium y en los dos README');
}

module.exports = { chequeaPromesas: chequeaPromesas };
