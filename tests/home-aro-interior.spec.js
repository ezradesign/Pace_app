/* PACE · E2E · LO DE DENTRO DEL ARO CABE EN EL ARO (piel de movil)
 * ================================================================
 * En movil el interior del aro no escala con D: rotulo, numero, boton y fila
 * del ciclo tienen tamaño fijo. El motor podia encoger el aro hasta su suelo de
 * 240 px, que ya no los contiene, y entonces «FOCO MANUAL» y el ciclo se
 * pintaban encima del trazo. Lo vio Ez en su movil, por libre.
 *
 * Cada caso es la vista mas baja medida en la que su estado todavia no cabe, asi
 * que el aro tiene que bajar hasta su suelo: por libre a 360x600 (desde v0.146.0,
 * sin «A TU RITMO» en la tarjeta corta, a 360x640 ya cabe) y con la pregunta del
 * dia a 375x600 (con el
 * horario dibujado como linea del dia, a 375x667 y a 375x640 ya cabe). Si un
 * cambio hace que quepa, el GUARD lo dice: el caso ya no probaria el suelo.
 *
 * Se mide lo mismo que mide el motor: la esquina mas lejana de cada hoja del
 * interior contra el centro del aro, en fraccion de D. El trazo esta en 0,475 D,
 * el halo de la bola guia empieza en 0,458 D y el motor deja el interior en
 * 0,44 D; el margen hasta 0,45 cubre el redondeo a px. Antes del arreglo, los
 * dos casos daban 0,545 y 0,524.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

function medirInterior(page) {
  return page.evaluate(() => {
    const dial = document.querySelector('[data-pace-dial-fit]');
    const numero = dial && dial.querySelector('[data-pace-dial-number]');
    if (!numero) return null;
    const f = dial.getBoundingClientRect();
    const cx = f.left + f.width / 2;
    const cy = f.top + f.height / 2;
    let peor = 0;
    let quien = '';
    numero.parentElement.querySelectorAll('*').forEach(el => {
      if (el.children.length) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') return;
      const dx = Math.max(Math.abs(r.left - cx), Math.abs(r.right - cx));
      const dy = Math.max(Math.abs(r.top - cy), Math.abs(r.bottom - cy));
      const d = Math.hypot(dx, dy);
      if (d > peor) { peor = d; quien = (el.textContent || el.tagName).trim(); }
    });
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find(e => e.getBoundingClientRect().width > 0);
    return { D: f.height, radio: peor / f.height, quien, sobra: body ? body.scrollHeight - body.clientHeight : 0 };
  });
}

const CASOS = [
  { nombre: 'por libre a 360x600', viewport: { width: 360, height: 600 }, extra: { ritmo: { libre: true } } },
  { nombre: 'con la pregunta del dia a 375x600', viewport: { width: 375, height: 600 }, extra: { ritmo: {} } },
];

for (const caso of CASOS) {
  test.describe('el interior cabe en el aro · ' + caso.nombre, () => {
    test.use({ viewport: caso.viewport, isMobile: true, hasTouch: true });

    test('ninguna hoja del interior llega al trazo', async ({ page, context }) => {
      await sembrar(context, caso.extra);
      await irAlArtefacto(page);
      await asentarGeometria(page);
      const m = await medirInterior(page);
      expect(m, 'GUARD: no hay aro con numero en la home').not.toBeNull();
      expect(m.sobra, 'GUARD: aqui la home ya cabe y el aro no llega a su suelo; busca una vista mas baja').toBeGreaterThan(0);
      expect(m.radio, '«' + m.quien + '» se sale hacia el aro (D = ' + m.D + ')').toBeLessThanOrEqual(0.45);
    });
  });
}
