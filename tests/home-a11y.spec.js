/* PACE · E2E · EL ORDEN DE LECTURA DE LA HOME (s160)
 * ==================================================
 * Defiende WCAG 2.4.3 (Focus Order): el foco de teclado tiene que recorrer la
 * home en el mismo orden en que se ve.
 *
 * POR QUE EXISTE. Hasta v0.90.0 el reorden de escritorio lo hacia el CSS con
 * `order: 1 / 2` sobre un DOM que se quedaba en el orden de movil, asi que las
 * dos lecturas no coincidian. Medido en s160 recorriendo con Tab de verdad:
 * despues de «Empezar foco» (top 387) el foco bajaba a «Iniciar camino» (622) y
 * «Ver caminos» (698), y SUBIA 200 px a los cuatro chips de Actividades (496).
 * En movil no pasaba: alli los tres `order` valen 0 y el DOM ya es el orden
 * visual. s156 documento la deuda y decidio NO asertarla —consagrar el orden
 * roto lo habria vuelto intocable—; esto la aserta ya arreglada.
 *
 * EL ASERTO ES RELACIONAL y por eso no caduca: no dice en que orden van los
 * bloques ni cuantos controles hay, solo que el foco NUNCA RETROCEDE en
 * pantalla. Si manana se anade un bloque, o se cambia el orden visual de una
 * piel, esta prueba sigue diciendo lo que tiene que decir.
 *
 * NO SE ASERTA EL ORDEN DEL DOM a proposito, aunque sea lo que se ha cambiado:
 * el DOM es el MECANISMO y el orden de foco es el CONTRATO. Consagrar el
 * mecanismo impediria arreglarlo manana de otra forma. El orden VISUAL ya lo
 * defiende `home-geometria.spec.js`.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

/**
 * Recorre la home con Tab y devuelve, en orden, la posicion vertical de cada
 * control que cae DENTRO del stack de la home.
 *
 * Dos cuidados que costaron una lectura falsa cada uno:
 *  · se filtra al stack — el sidebar y la TopBar tienen su propio orden y
 *    mezclarlos daria saltos que no son de este contrato;
 *  · se corta al repetirse la primera firma: el foco da la vuelta y sin esto la
 *    secuencia «retrocede» al empezar la segunda pasada, que es correcto.
 */
async function recorridoConTab(page, maxTabs = 40) {
  const parada = () => page.evaluate(() => {
    const a = document.activeElement;
    const stack = document.querySelector('[data-pace-home-stack]');
    if (!a || a === document.body || !stack || !stack.contains(a)) return null;
    const r = a.getBoundingClientRect();
    return {
      top: Math.round(r.top),
      texto: (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().slice(0, 30),
    };
  });
  const visto = new Set();
  const paradas = [];
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab');
    const p = await parada();
    if (!p) continue;
    const firma = p.texto + '@' + p.top;
    if (visto.has(firma)) break;
    visto.add(firma);
    paradas.push(p);
  }
  return paradas;
}

function asertarMonotono(paradas, piel) {
  expect(paradas.length, 'GUARD: el recorrido no encontro controles dentro de la home ' + piel)
    .toBeGreaterThan(4);
  const retrocesos = [];
  for (let i = 1; i < paradas.length; i++) {
    if (paradas[i].top < paradas[i - 1].top) {
      retrocesos.push('«' + paradas[i - 1].texto + '» (' + paradas[i - 1].top + ') -> «'
        + paradas[i].texto + '» (' + paradas[i].top + ')');
    }
  }
  expect(retrocesos, 'el foco SUBE en la pantalla al tabular en ' + piel
    + ': orden de lectura distinto del visual (WCAG 2.4.3). Recorrido: '
    + paradas.map(p => p.texto + '@' + p.top).join(' -> ')).toEqual([]);
}

test.describe('orden de lectura de la home', () => {
  test('escritorio: el foco no retrocede al tabular', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context);
    await irAlArtefacto(page);
    await asentarGeometria(page);

    /* GUARD: sin la piel de escritorio esta prueba mediria la de movil, que
       nunca tuvo el defecto — y pasaria sin demostrar nada. */
    const piel = await page.evaluate(() => getComputedStyle(document.documentElement)
      .getPropertyValue('--pace-skin').trim());
    expect(piel, 'GUARD: la home no esta en la piel de escritorio').toBe('escritorio');

    asertarMonotono(await recorridoConTab(page), 'escritorio');
    expect(errores).toEqual([]);
  });

  test.describe('movil', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('el foco tampoco retrocede', async ({ page, context }) => {
      const errores = capturarErrores(page);
      await sembrar(context);
      await irAlArtefacto(page);
      await asentarGeometria(page);

      const piel = await page.evaluate(() => getComputedStyle(document.documentElement)
        .getPropertyValue('--pace-skin').trim());
      expect(piel, 'GUARD: la home no esta en la piel de movil').toBe('movil');

      asertarMonotono(await recorridoConTab(page), 'movil');
      expect(errores).toEqual([]);
    });
  });
});
