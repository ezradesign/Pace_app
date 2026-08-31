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

/* ── s177 · EL CALENDARIO DEL AÑO USA EL ANCHO ──────────────────────────────
   Lo reportó el usuario en escritorio: «la vista de calendario podía ajustarse
   más al tamaño de la ventana para que no quede todo tan reducido».

   MEDIDO ANTES DE TOCAR NADA a 1536x714: el modal usaba 820 px de 1536 y la
   rejilla llevaba celdas de 11x11 px escritas a mano en el JSX, así que la
   pestaña «Año» dejaba 163,7 px MUERTOS de sus 385 -- el 42 % de su caja--
   mientras las otras tres dejaban 0.

   POR QUÉ MERECE UN ASERTO: el tamaño de celda vive en estilos EN LÍNEA del
   JSX y lo que lo agranda es una regla con `!important` en otra hoja. Nada
   avisa si alguien toca uno de los dos lados; el calendario simplemente vuelve
   a encogerse y sigue funcionando. Y el ancho del modal es un número suelto en
   `StatsPanel.jsx` que cualquiera puede devolver a 820 sin enterarse.

   NO CUBRE: si el calendario se LEE mejor. Eso se decidió mirándolo. */
test('el calendario del año aprovecha el ancho del modal', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirStats(page);
  await medirPestana(page, 'Año');

  const m = await page.evaluate(() => {
    const vis = (s) => [...document.querySelectorAll(s)]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })[0] || null;
    const celda = vis('[data-pace-year-cell]');
    const vista = vis('[data-pace-stats-vistas]');
    const modal = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0).pop();
    if (!celda || !vista || !modal) return null;
    /* HUECO MUERTO: lo que sobra dentro de la vista por debajo de su último
       hijo con caja. Es lo que se veía como «todo tan reducido». */
    const rv = vista.getBoundingClientRect();
    let masBajo = rv.top;
    for (const e of vista.querySelectorAll('*')) {
      const r = e.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.bottom > masBajo) masBajo = r.bottom;
    }
    return {
      celda: Math.round(celda.getBoundingClientRect().width * 10) / 10,
      modal: Math.round(modal.getBoundingClientRect().width * 10) / 10,
      muerto: Math.round((rv.bottom - masBajo) * 10) / 10,
    };
  });
  expect(m, 'no encuentro la rejilla del año').not.toBeNull();

  /* Los tres números del arreglo, con margen para el redondeo. Antes: celda
     11,0 · modal 820,0 · muerto 163,7. Ahora: 19,0 · 1240,0 · 52,4. */
  expect(m.celda, 'la celda del año volvió a encogerse: ' + m.celda + ' px')
    .toBeGreaterThanOrEqual(16);
  expect(m.modal, 'el modal de Stats volvió a ser el estrecho: ' + m.modal + ' px')
    .toBeGreaterThanOrEqual(1200);
  expect(m.muerto, 'el año vuelve a dejar hueco muerto: ' + m.muerto + ' px')
    .toBeLessThanOrEqual(80);
});
