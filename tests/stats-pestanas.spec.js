/* PACE · tests/stats-pestanas.spec.js (sesión 176)
   =================================================
   LAS CUATRO PESTAÑAS DE STATS, DEL MISMO TAMAÑO Y SIN SCROLL EN ESCRITORIO.
   Lo pidió el usuario mirando la app: «los paneles de estadísticas deberían ser
   todos del mismo tamaño y sin scroll, ya que cambiar entre pestañas y que
   varíe el tamaño se queda un poco raro».

   MEDIDO ANTES DE TOCAR NADA, a 1536x714:
     Semana   606,9   scroll SÍ (13 px)
     Mes      606,9   scroll SÍ (37 px)
     Año      443,7   sin scroll
     Caminos  600,2   sin scroll
   O sea, 163,2 px de salto al cambiar de pestaña y dos de las cuatro cortadas.

   POR QUÉ MERECE UN ASERTO: lo que iguala las cajas es un `min-height` que
   depende de cuánto ocupa el CONTENIDO más alto. Cualquier fila nueva en el
   calendario o en la semana lo rompe sin que nadie lo note -- que es
   exactamente cómo el «cabe sin scroll» de s62 dejó de ser cierto.

   NO CUBRE móvil: allí la altura útil cambia con cada teléfono y el suelo no
   se aplica a propósito.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');

const PESTANAS = ['Semana', 'Mes', 'Año', 'Caminos'];

async function abrirStats(page) {
  await page.evaluate(() => {
    const bs = [...document.querySelectorAll('button')]
      .filter(x => x.getBoundingClientRect().width > 0);
    const b = bs.find(x => /stat|estad|ritmo/i.test(
      (x.getAttribute('aria-label') || '') + ' ' + (x.title || '')));
    if (!b) throw new Error('no encuentro el botón de estadísticas');
    b.click();
  });
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
}

async function medirPestana(page, nombre) {
  await page.evaluate((n) => {
    const m = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0).pop();
    const b = [...m.querySelectorAll('button')]
      .filter(x => x.getBoundingClientRect().width > 0)
      .find(x => x.textContent.trim() === n);
    if (!b) throw new Error('no encuentro la pestaña ' + n);
    b.click();
  }, nombre);
  await page.waitForTimeout(350);
  return page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0).pop();
    return {
      alto: Math.round(el.getBoundingClientRect().height * 10) / 10,
      corta: Math.max(0, el.scrollHeight - el.clientHeight),
    };
  });
}

test('las cuatro pestañas de Stats miden lo mismo y ninguna se corta', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirStats(page);

  const medidas = {};
  for (const nom of PESTANAS) medidas[nom] = await medirPestana(page, nom);

  /* GUARD DE CERO: si alguna pestaña no se hubiera podido medir, las
     comparaciones de abajo cruzarían un solo valor consigo mismo. */
  expect(Object.keys(medidas).length).toBe(4);
  for (const nom of PESTANAS) {
    expect(medidas[nom].alto, nom + ' no midió nada').toBeGreaterThan(100);
  }

  const altos = PESTANAS.map(n => medidas[n].alto);
  const salto = Math.max.apply(null, altos) - Math.min.apply(null, altos);
  /* 2 px de tolerancia por el redondeo del layout. El defecto medía 163,2, así
     que no hay riesgo de que se cuele por el margen. */
  expect(salto, 'el modal cambia de tamaño al cambiar de pestaña: ' +
    PESTANAS.map(n => n + ' ' + medidas[n].alto).join(' · ')).toBeLessThanOrEqual(2);

  /* Y NINGUNA SE CORTA. Es la otra mitad de lo que se pidió, y la que se podría
     perder sin tocar el `min-height`: basta con que el contenido crezca. */
  for (const nom of PESTANAS) {
    expect(medidas[nom].corta, 'la pestaña ' + nom + ' necesita scroll').toBeLessThanOrEqual(2);
  }
});
