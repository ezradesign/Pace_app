/* PACE · tests/sidebar-movil.spec.js (sesión 182)
   ================================================
   EL CAJÓN DE MÓVIL TAMBIÉN ESCALA, Y POR DEBAJO DEL SUELO SE DESPLAZA SIN BARRA.

   DE DÓNDE SALE ESTO. `tests/sidebar-altura.spec.js` cubre la escala de
   ESCRITORIO y declara por escrito, en su cabecera, que «NO CUBRE: móvil». Eso
   era correcto mientras la escala estuviera apagada por debajo de 768 px -- lo
   estaba a propósito desde s181-- pero el usuario la encendió en s182 tras ver
   la revisión, con estas palabras: «escalarla en todas las resoluciones que
   quede bien y en las más pequeñas aceptamos un pequeño scroll sin barra».

   LO QUE SE VIGILA, y por qué cada cosa:
     · Que CABE donde el suelo permite que quepa (de 667 para arriba).
     · Que por debajo se DESPLAZA y no se RECORTA. Es la diferencia entre el
       comportamiento pedido y un fallo mudo: la lente lleva `overflow: hidden`,
       así que un alto mal calculado dejaría el pie inalcanzable y la pantalla
       parecería correcta. Por eso el aserto no mira el alto -- hace scroll y
       comprueba que el pie SE VE.
     · Que el suelo es el suelo: a 360x560 la escala vale exactamente
       `SUELO_CAJON` y ni un décimo menos.
     · Que no AGRANDA: a 375x844 la escala es 1 y `data-escalado` vale 0.
     · Que la barra no sale, pero el scroll sí sigue vivo. `overflow: hidden`
       habría hecho lo primero matando lo segundo.
     · Que el recorte del aire de la tarjeta es SÓLO de móvil: en escritorio ese
       aire se afinó mirándolo en s180 y no se toca.

   POR QUÉ CADA VIEWPORT ES SU PROPIO `describe` CON `test.use`, y no un
   `setViewportSize` como en el spec de escritorio: `page.setViewportSize()` NO
   emite `resize` y el `ResizeObserver` tampoco dispara bajo este headless
   (medido en s181), así que allí hay que emitir el evento a mano. Con
   `test.use` la página nace ya en su tamaño y el cálculo del montaje es el
   bueno -- se prueba el camino que de verdad recorre un teléfono al abrir.

   NO CUBRE: que el número sea BONITO. Que 0,80 se lea bien en un teléfono de
   verdad lo decidió el usuario mirando las capturas de
   `scripts/audit/banco-sidebar-movil-s182.js`, y eso no es un aserto.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* El suelo NO se copia aquí: se le pregunta a la app, que lo publica en
   `window.SUELO_CAJON`. Copiar el número deja el aserto verde el día que
   alguien mueva la constante, que es exactamente el fallo por omisión. */

const ABIERTA = {
  sidebarCollapsed: false,
  lastActiveDay: new Date().toDateString(),
  _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true,
  _historyRecalculated_v0_28_8: true,
};

async function abrir(page, context) {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await page.waitForSelector('[data-pace-sidebar]');
  /* El alto natural depende de las métricas de la fuente: medir antes de que
     asienten da otra escala (rojo intermitente de s181, y era del PRODUCTO). */
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
}

function sonda(page) {
  return page.evaluate(() => {
    const aside = document.querySelector('[data-pace-sidebar]');
    const caja = document.querySelector('[data-pace-sidebar-escala]');
    const lente = caja.parentElement;
    const tarjeta = aside.querySelector('[data-pace-sidebar-accion]');
    return {
      escala: parseFloat(getComputedStyle(caja).getPropertyValue('--sb-escala')),
      suelo: window.SUELO_CAJON,
      escalado: aside.getAttribute('data-escalado'),
      /* `offsetHeight` es LAYOUT y la transformación no lo toca; el rect sí
         viene ya transformado (trampa de s177). Los dos hacen falta. */
      cajaLayout: caja.offsetHeight,
      cajaVista: Math.round(caja.getBoundingClientRect().height * 10) / 10,
      lenteVista: Math.round(lente.getBoundingClientRect().height * 10) / 10,
      desborde: aside.scrollHeight - aside.clientHeight,
      barra: getComputedStyle(aside).scrollbarWidth,
      padTarjeta: getComputedStyle(tarjeta).paddingBottom,
      /* El objetivo tactil que s180 afino a 45 px, tal y como SE VE ya
         escalado: aqui el rect es lo correcto, no el offsetHeight. */
      semanaVista: (function () {
        const s = aside.querySelector('[data-pace-semana]');
        return s ? Math.round(s.getBoundingClientRect().height * 10) / 10 : null;
      })(),
    };
  });
}

/* Baja del todo y devuelve si el pie SE VE. No pregunta por alturas a
   propósito: lo que falla cuando la lente recorta mal es la VISIBILIDAD. */
function pieVisibleTrasBajar(page) {
  return page.evaluate(() => {
    const aside = document.querySelector('[data-pace-sidebar]');
    aside.scrollTop = aside.scrollHeight;
    const caja = document.querySelector('[data-pace-sidebar-escala]');
    const pie = [].slice.call(caja.children)
      .find(e => (e.textContent || '').indexOf('Mis rutinas') > -1);
    if (!pie) return { hayPie: false };
    const r = pie.getBoundingClientRect();
    return {
      hayPie: true,
      dentro: r.top >= 0 && r.bottom <= window.innerHeight + 0.5,
      sobra: Math.round((window.innerHeight - r.bottom) * 10) / 10,
    };
  });
}

/* ------------------------------------------------------------------ */
/* De 667 para arriba TIENE que caber entero: es lo que compra el suelo. */
for (const vp of [{ width: 375, height: 667 }, { width: 390, height: 736 },
                  { width: 428, height: 800 }]) {
  test.describe(vp.width + 'x' + vp.height + ' · el cajón cabe entero', () => {
    test.use({ viewport: vp });

    test('no desborda y el pie termina dentro de la pantalla', async ({ page, context }) => {
      await abrir(page, context);
      const s = await sonda(page);
      expect(s.desborde).toBe(0);
      /* Escala de verdad, no un 1 disfrazado: si el motor no corriera, esto
         valdría 1 y el `desborde: 0` de arriba sería falso por otra razón. */
      expect(s.escala).toBeLessThan(1);
      expect(s.escala).toBeGreaterThanOrEqual(s.suelo);
      expect(s.escalado).toBe('1');

      const pie = await pieVisibleTrasBajar(page);
      expect(pie.hayPie).toBe(true);
      expect(pie.dentro).toBe(true);
    });
  });
}

/* ------------------------------------------------------------------ */
test.describe('360x560 · por debajo del suelo: se desplaza, no se recorta', () => {
  test.use({ viewport: { width: 360, height: 560 } });

  test('la escala se queda EXACTAMENTE en el suelo', async ({ page, context }) => {
    await abrir(page, context);
    const s = await sonda(page);
    expect(s.escala).toBeCloseTo(s.suelo, 4);
  });

  test('desborda, la barra no sale y el scroll sigue vivo', async ({ page, context }) => {
    await abrir(page, context);
    const s = await sonda(page);
    /* Las dos mitades del encargo, y hacen falta las dos: `overflow: hidden`
       quitaría la barra matando el scroll, y eso NO es lo que se pidió. */
    expect(s.desborde).toBeGreaterThan(0);
    expect(s.barra).toBe('none');
  });

  test('bajando del todo, el pie SE VE: nada queda inalcanzable', async ({ page, context }) => {
    await abrir(page, context);
    const pie = await pieVisibleTrasBajar(page);
    expect(pie.hayPie).toBe(true);
    expect(pie.dentro).toBe(true);
  });

  /* EL PRECIO DEL SUELO TIENE TOPE, y este es el único aserto que lo pone. El
     de «la escala se queda en el suelo» le PREGUNTA el número a la app a
     propósito —copiarlo dejaría el test verde el día que alguien lo mueva— y
     por eso mismo no puede cazar un suelo temerario. Éste sí: en la pantalla
     más pequeña que soportamos, el objetivo táctil de la semana no baja del
     mínimo de WCAG 2.2 AA (2.5.8, 24x24 CSS px). s180 lo dejó en 45 y a 0,80
     se ve a 36; un suelo de 0,5 lo hundiría a 22,5 y esto se pondría rojo. */
  test('en la pantalla más pequeña, la semana sigue sobre el mínimo de WCAG', async ({ page, context }) => {
    await abrir(page, context);
    const s = await sonda(page);
    expect(s.semanaVista).toBeGreaterThanOrEqual(24);
  });

  test('la lente mide lo que la columna escalada ocupa, ni un pixel menos', async ({ page, context }) => {
    await abrir(page, context);
    const s = await sonda(page);
    /* Es el invariante que impide el recorte mudo: la lente recorta, así que
       si midiera menos que su contenido escalado, la diferencia desaparecería
       sin barra que lo dijera. */
    expect(s.lenteVista).toBeGreaterThanOrEqual(s.cajaVista - 0.5);
  });
});

/* ------------------------------------------------------------------ */
test.describe('375x844 · donde ya cabía, no se toca', () => {
  test.use({ viewport: { width: 375, height: 844 } });

  test('la escala vale 1 y no agranda', async ({ page, context }) => {
    await abrir(page, context);
    const s = await sonda(page);
    expect(s.escala).toBe(1);
    expect(s.escalado).toBe('0');
    expect(s.cajaVista).toBeCloseTo(s.cajaLayout, 0);
    expect(s.desborde).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/* La COMPOSICION no cambia con la pantalla: lo unico que cambia es el factor.
   Se compara el alto de LAYOUT, que la transformacion no toca. */
test.describe('la composición es la misma en todo móvil', () => {
  test('el alto de layout del cajón no depende del viewport', async ({ browser }) => {
    const altos = [];
    for (const vp of [{ width: 360, height: 560 }, { width: 375, height: 667 },
                      { width: 428, height: 800 }, { width: 375, height: 844 }]) {
      const ctx = await browser.newContext({ viewport: vp });
      await sembrar(ctx, ABIERTA);
      const page = await ctx.newPage();
      await irAlArtefacto(page);
      await page.waitForSelector('[data-pace-sidebar]');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      altos.push((await sonda(page)).cajaLayout);
      await ctx.close();
    }
    expect(new Set(altos).size).toBe(1);
  });
});

/* ------------------------------------------------------------------ */
/* EL AIRE DE LA TARJETA ES DE MOVIL Y SOLO DE MOVIL. `sidebarStyles.accion` lo
   comparten las dos pieles, asi que tocarlo alli habria cambiado tambien el
   escritorio, donde ese aire se afino mirandolo en s180. Un aserto por LADO:
   que en movil este recortado no prueba que en escritorio siga entero. */
test.describe('el aire de la tarjeta «Para ahora»', () => {
  test.describe('en el cajón', () => {
    test.use({ viewport: { width: 390, height: 736 } });
    test('el padding de abajo es 8px', async ({ page, context }) => {
      await abrir(page, context);
      expect((await sonda(page)).padTarjeta).toBe('8px');
    });
  });

  test.describe('en escritorio', () => {
    test.use({ viewport: { width: 1280, height: 720 } });
    test('el padding de abajo sigue siendo 16px', async ({ page, context }) => {
      await abrir(page, context);
      expect((await sonda(page)).padTarjeta).toBe('16px');
    });
  });
});
