/* PACE · tests/sidebar-altura.spec.js (sesión 181)
   ================================================
   QUE LA SIDEBAR SE VEA SIEMPRE IGUAL Y ENTERA, a cualquier alto de escritorio.

   DE DÓNDE SALE ESTO. La columna medía 835,9 px y ninguna pantalla de portátil
   los tiene: a 1536x714 desbordaba. Pero el síntoma visible NO era una barra de
   scroll -- era que la TARJETA se quedaba en 33 px, con su rótulo y nada más,
   sin nombre de rutina y sin meta. El mecanismo: `sidebarStyles.accion` lleva
   `overflow: hidden`, y eso APAGA el tamaño mínimo automático del flex, que
   sólo se aplica con `overflow: visible`. Los otros hijos están protegidos por
   su `min-height: auto`; la tarjeta no, así que era la única pieza comprimible
   y absorbía el déficit entero recortándose por dentro.

   LA SOLUCIÓN LA ELIGIÓ EL USUARIO, y no es apretar el aire. Se probó eso
   -- bajaba la columna a 700,3 px-- y lo rechazó mirándolo: cambiaba las
   PROPORCIONES (las reglas pasaban de 12 a 5 px de margen mientras el texto
   seguía igual). Sus palabras: «si hay que hacer a la vez pequeños a TODOS los
   elementos de la sidebar, perfecto». Así que la columna se escala ENTERA.

   LO QUE SE VIGILA AQUÍ, y por qué cada cosa:
     · Que quepa: el pie tiene que terminar DENTRO de la caja, no debajo.
     · Que la composición no cambie: las alturas de LAYOUT son las mismas en
       todo monitor; lo único que cambia es el factor.
     · Que la escala no AGRANDE: por encima del tamaño natural se queda quieta y
       el sobrante se va al espaciador, que es la geometría fija de v0.112.0.
     · Que encoger no hunda los objetivos táctiles por debajo de WCAG 2.2 AA.
       Esto es el precio de la decisión y por eso lleva su propio aserto: a
       1280x720 el bloque de la semana pasa de 45 px a 37,1.

   NO CUBRE: móvil, y desde s182 eso ya no quiere decir «nadie lo mira». La
   escala se encendió también en el cajón (v0.114.0, decisión del usuario), y
   allí las condiciones son OTRAS -- hay un suelo, por debajo de él se desplaza
   a propósito, y el alto disponible se pregunta en otro sitio-- así que sus
   asertos viven aparte, en `tests/sidebar-movil.spec.js`. Estos de aquí siguen
   siendo de escritorio: aplicados a un cajón no significarían nada.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const ABIERTA = {
  sidebarCollapsed: false,
  lastActiveDay: new Date().toDateString(),
  _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true,
  _historyRecalculated_v0_28_8: true,
};

/* De holgado a apretado. 1000 está por encima del tamaño natural (ahí la escala
   tiene que ser exactamente 1); 620 es el suelo que se declara soportado, y
   sale de un portátil de 1366x768 con barra de navegador y barra de tareas. */
const ALTURAS = [1000, 836, 800, 714, 660, 620];

/* CAMBIAR EL VIEWPORT Y ESPERAR A QUE LA SIDEBAR SE ENTERE. Las dos mitades
   costaron un rojo cada una.

   1) LAS FUENTES. El alto natural depende de sus metricas: midiendo antes de
      que asienten sale otra escala, y a 1000 px -- donde no deberia haber
      ninguna-- daba 0,97. `document.fonts.ready` es la promesa y es fiable;
      `document.fonts.check()` NO, que devuelve false con las fuentes ya
      cargadas (trampa de s180).

   2) EL DISPARO, QUE AQUI HAY QUE DARLO A MANO. `page.setViewportSize()` de
      Playwright cambia `innerHeight` pero **no emite el evento `resize`**:
      medido, cero eventos con el alto ya cambiado, y la escala se quedaba
      clavada en el valor del arranque (0,8291 a los seis altos, mientras el
      ratio real iba de 1,17 a 0,71). Un rojo de cada tres o cuatro salia por
      esto y NO por el producto: en un navegador de verdad el evento llega
      -- comprobado en el navegador del panel, 1000 -> escala 1 y 640 -> 0,7357.
      Asi que el test emite el evento que el navegador emitiria.

   LO QUE ESTO NO CUBRE, y se dice: el camino del `ResizeObserver`. Se queda sin
   ejercitar porque bajo este headless tampoco se dispara sobre la lente (cero
   avisos con su `clientHeight` cambiando), aunque un RO sobre un div de prueba
   si reacciona al viewport. Lo que estos tests prueban es el CALCULO y su
   aplicacion; que el disparo llegue en un navegador real esta comprobado a
   mano, no aqui. */
async function asentar(page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'));
    return document.fonts.ready;
  });
  await page.waitForTimeout(150);
}

function medir(page) {
  return page.evaluate(() => {
    const aside = document.querySelector('[data-pace-sidebar]');
    const caja = document.querySelector('[data-pace-sidebar-escala]');
    if (!aside || !caja) return null;
    const hijos = [...caja.children];
    const pie = hijos.find(e => (e.textContent || '').includes('Mis rutinas'));
    const tarjeta = hijos.find(e => e.hasAttribute('data-pace-sidebar-accion'));
    const semana = aside.querySelector('[data-pace-semana]');

    /* `offsetHeight` es LAYOUT y la transformación no lo toca; el rect SÍ viene
       ya transformado. Los dos hacen falta y miden cosas distintas. */
    const layout = hijos
      .filter(e => !e.hasAttribute('data-pace-sidebar-spacer'))
      .map(e => e.offsetHeight)
      .join('/');

    return {
      escala: parseFloat(caja.style.getPropertyValue('--sb-escala')) || 1,
      marca: aside.getAttribute('data-escalado'),
      layout: layout,
      hayTarjeta: !!tarjeta,
      /* Lo que de verdad importa: que el pie no se salga por abajo. */
      sobraDebajo: pie
        ? +(aside.getBoundingClientRect().bottom - pie.getBoundingClientRect().bottom).toFixed(1)
        : null,
      /* Recorte interno de la tarjeta: esto es lo que el `overflow: hidden`
         escondía cuando la tarjeta era el amortiguador de la columna. */
      tarjetaRecortada: tarjeta ? tarjeta.scrollHeight - tarjeta.clientHeight : null,
      semanaAlto: semana ? +semana.getBoundingClientRect().height.toFixed(1) : null,
    };
  });
}

test('la sidebar cabe entera a cualquier alto de escritorio, y nada se recorta', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await page.locator('[data-pace-sidebar-escala]').waitFor({ state: 'visible' });
  await asentar(page);

  for (const alto of ALTURAS) {
    await page.setViewportSize({ width: 1536, height: alto });
    await asentar(page);
    const m = await medir(page);
    expect(m, 'no se pintó la sidebar a ' + alto).not.toBeNull();

    /* GUARD DE CERO: sin tarjeta esto no prueba lo que dice que prueba. */
    expect(m.hayTarjeta, 'sin tarjeta a ' + alto + ' px el test no mide nada').toBe(true);

    expect(m.sobraDebajo, 'el pie se sale por debajo a ' + alto + ' px de alto')
      .toBeGreaterThanOrEqual(0);
    expect(m.tarjetaRecortada, 'la tarjeta pierde contenido por dentro a ' + alto + ' px')
      .toBeLessThanOrEqual(0);
  }
});

test('la composición es la MISMA en todo monitor: sólo cambia el factor', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await page.locator('[data-pace-sidebar-escala]').waitFor({ state: 'visible' });
  await asentar(page);

  const tomas = [];
  for (const alto of ALTURAS) {
    await page.setViewportSize({ width: 1536, height: alto });
    await asentar(page);
    tomas.push(Object.assign({ alto: alto }, await medir(page)));
  }

  /* Las alturas de LAYOUT no pueden cambiar: si cambian es que algo se está
     recolocando en vez de escalar, que es justo lo que el usuario rechazó. */
  const firmas = new Set(tomas.map(t => t.layout));
  expect(firmas.size, 'la composición cambia con la pantalla:\n' + tomas.map(t => t.alto + ' -> ' + t.layout).join('\n'))
    .toBe(1);

  /* Por encima del tamaño natural NO agranda: se queda en 1 y el sobrante va al
     espaciador (geometría fija, decisión del usuario en v0.112.0). */
  expect(tomas[0].escala, 'a 1000 px de alto no debería hacer falta escala').toBe(1);
  expect(tomas[0].marca, 'sin escala, la marca tiene que estar a 0').toBe('0');

  /* Y apretando SÍ encoge, o este test no estaría probando nada. */
  const apretada = tomas[tomas.length - 1];
  expect(apretada.escala, 'a 620 px la sidebar tendría que estar encogida').toBeLessThan(1);
  expect(apretada.marca, 'con escala, la marca tiene que estar a 1').toBe('1');
});

test('encoger no hunde los objetivos táctiles por debajo de WCAG 2.2 AA', async ({ page, context }) => {
  /* EL PRECIO DE LA DECISION, MEDIDO. Al escalar la columna entera, los
     objetivos escalan con ella: el bloque de la semana mide 45 px a escala 1 y
     37,1 a 1280x720. Sigue muy por encima del minimo AA (24x24, criterio
     2.5.8), pero por debajo de los 44 que s180 busco a proposito, y eso hay que
     saberlo -- no descubrirlo. Si algun dia el suelo de altura baja mas, este
     aserto es el que avisa de que ya no se puede pulsar comodamente. */
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await page.locator('[data-pace-sidebar-escala]').waitFor({ state: 'visible' });
  await asentar(page);

  await page.setViewportSize({ width: 1536, height: 620 });
  await asentar(page);
  const m = await medir(page);

  expect(m.escala, 'a 620 px tiene que haber escala, o esto no prueba nada').toBeLessThan(1);
  expect(m.semanaAlto, 'el objetivo de la semana baja del mínimo de WCAG 2.2 AA')
    .toBeGreaterThanOrEqual(24);
});
