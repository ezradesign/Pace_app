/* PACE · E2E · GEOMETRIA DE LA HOME (s156, troceado en s159)
 * ==========================================================
 * Defiende el motor de geometria (`app/main/home-geometry.js`) y el contrato
 * que el CSS deriva de el (`app/main/_responsive.js`).
 *
 * POR QUE EXISTE. Hasta s156 el motor tenia un retorno silencioso que exigia
 * la tarjeta de Camino: `if (!body || !dial || !spc || !act) return;`. Como
 * `getSuggestedPath()` NUNCA devuelve null con catalogo no vacio
 * (state-paths.jsx:169-174), el UNICO estado real que desmonta la tarjeta es
 * un Camino en curso — y ahi el motor se apagaba, no volvia a encenderse al
 * salir (el ResizeObserver seguia mirando un nodo desconectado) y la home
 * quedaba gobernada por fallbacks DISTINTOS en cada piel. Medido en s156:
 * Desktop caia a 360px en vez de 406 y el aro se pintaba ENTERO, sin
 * horizonte. Estos asertos son ese fallo convertido en red.
 *
 * TODO ES RELACIONAL (regla de s152). Ni un diametro escrito a mano: se
 * comprueba que el motor gobierna, que recorte y solapamiento salen de la
 * MISMA fuente y que el orden visual es el canonico. Los unicos numeros son
 * los limites que el propio modulo declara.
 *
 * s159: la ATMOSFERA se va a `home-luz.spec.js` y las utilidades compartidas a
 * `home.helpers.js` — el archivo habia llegado a 631 lineas.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');
const { CAMINO_ACTIVO, sonda, px, asentar, asentarGeometria } = require('./home.helpers');

test.describe('geometria de la home · el motor gobierna', () => {
  test('con la tarjeta presente publica diametro y solapamiento', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context);
    await irAlArtefacto(page);

    const m = await sonda(page);
    expect(m.hayDial, 'GUARD: no hay ningun aro en la home').toBe(true);
    expect(m.haySpc, 'la tarjeta de Camino deberia estar en este estado').toBe(true);
    expect(px(m.D), '--pace-timer-d sin publicar con la tarjeta presente').toBeGreaterThan(0);
    expect(px(m.solape), '--pace-activities-overlap sin publicar').toBeGreaterThan(0);
    // El aro mide lo que el motor manda: el CSS no esta ganando por otro lado.
    expect(Math.abs(m.dial.h - px(m.D)), 'el aro no mide --pace-timer-d').toBeLessThanOrEqual(1);
    expect(errores).toEqual([]);
  });

  test('con un Camino activo y la tarjeta AUSENTE sigue publicando', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context, CAMINO_ACTIVO);
    await page.goto('/index.html');
    await page.waitForSelector('[data-pace-home-body]');

    const m = await sonda(page);
    expect(m.hayDial, 'GUARD: no hay ningun aro en la home').toBe(true);
    expect(m.haySpc, 'con un Camino en curso la tarjeta NO debe existir').toBe(false);
    expect(m.hayAct, 'la ActivityBar deberia seguir montada').toBe(true);
    // El fallo de s156: un nodo OPCIONAL apagaba el motor entero.
    expect(px(m.D), 'el motor se apago porque falta [data-pace-spc]').toBeGreaterThan(0);
    expect(px(m.solape), 'el motor se apago porque falta [data-pace-spc]').toBeGreaterThan(0);
    expect(errores).toEqual([]);
  });

  test('al salir del Camino gobierna sin resize ni evento manual', async ({ page, context }) => {
    await sembrar(context, CAMINO_ACTIVO);
    await page.goto('/index.html');
    await page.waitForSelector('[data-pace-home-body]');
    const antes = await sonda(page);
    expect(antes.haySpc).toBe(false);

    // Se sale del Camino con la API real de la app. NO se emite resize, NO se
    // emite pace:home-relayout: la home tiene que recuperarse sola.
    await page.evaluate(() => window.abandonPath());
    await page.waitForSelector('[data-pace-spc]');

    await expect
      .poll(async () => px((await sonda(page)).D), {
        message: 'tras salir del Camino el motor no despierta sin ayuda externa',
        timeout: 5000,
      })
      .toBeGreaterThan(0);

    const m = await sonda(page);
    expect(px(m.solape), 'solapamiento sin publicar tras volver a la home').toBeGreaterThan(0);
    expect(Math.abs(m.dial.h - px(m.D)), 'el aro no mide --pace-timer-d').toBeLessThanOrEqual(1);
  });
});

test.describe('geometria de la home · recorte y solapamiento', () => {
  /* La cabecera de _responsive.js afirma que salen de UNA fuente y «no pueden
     desincronizarse nunca». Hasta s156 era falso: los consumidores tenian
     fallbacks DISTINTOS (la tarjeta caia a la estimacion CSS, el clip-path a
     0px), asi que con el motor apagado la tarjeta subia 41,7 px sobre un aro
     SIN recortar. Esto lo aserta en los dos estados.

     s158: el aro ya no se CORTA en el horizonte, se DESVANECE ahi (el arco de
     recorrido completa los 360 grados). El invariante no cambia ni un apice
     —los dos siguen saliendo de --pace-horizon—, solo cambia de donde se lee:
     antes del inset del clip-path, ahora de la parada central de la mascara. */
  for (const [nombre, extra] of [['con tarjeta', null], ['con Camino activo', CAMINO_ACTIVO]]) {
    test('van juntos ' + nombre, async ({ page, context }) => {
      await sembrar(context, extra);
      await page.goto('/index.html');
      await page.waitForSelector('[data-pace-home-body]');
      await asentar(page);
      const m = await sonda(page);

      expect(m.hayDial, 'GUARD: no hay ningun aro en la home').toBe(true);
      const solape = px(m.solape);
      expect(solape, 'sin solapamiento publicado no hay nada que comparar').toBeGreaterThan(0);
      expect(m.recorte, 'el aro no lleva horizonte: no hay mascara con tres paradas').not.toBeNull();
      /* GUARD de la lectura: si la rampa dejara de ser simetrica, la parada del
         medio ya no seria el horizonte y el aserto de abajo compararia contra
         un numero cualquiera de los tres. */
      expect(m.rampaSimetrica, 'la rampa del horizonte no es simetrica: la lectura del medio no vale').toBe(true);
      expect(Math.abs(m.recorte - solape), 'el horizonte del aro no vale el solapamiento publicado').toBeLessThanOrEqual(1);
      expect(Math.abs(m.solapeReal - solape), 'el bloque que hace de horizonte no sube el solapamiento publicado').toBeLessThanOrEqual(1);
    });
  }
});

test.describe('geometria de la home · composicion', () => {
  test('orden visual de escritorio: aro, Actividades, Camino', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await asentar(page);
    const m = await sonda(page);
    expect(m.hayDial, 'GUARD: no hay ningun aro en la home').toBe(true);
    expect(m.ordenVisual).toBe('dial > act > spc');
  });

  test.describe('movil', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('orden visual movil: aro, Camino, Actividades', async ({ page, context }) => {
      await sembrar(context);
      await irAlArtefacto(page);
      await asentar(page);
      const m = await sonda(page);
      expect(m.hayDial, 'GUARD: no hay ningun aro en la home').toBe(true);
      expect(m.ordenVisual).toBe('dial > spc > act');
    });

    /* El aro dentro de los limites que el propio modulo declara: por encima del
       suelo movil y por debajo del techo por ancho. Sin numeros propios — se
       derivan del viewport, que es de donde salen las constantes. */
    test('el diametro se queda dentro de los limites del modulo', async ({ page, context }) => {
      await sembrar(context);
      await irAlArtefacto(page);
      await asentar(page);
      const m = await sonda(page);
      const D = px(m.D);
      expect(D, 'sin diametro publicado').toBeGreaterThan(0);
      expect(D, 'el aro baja del suelo legible de movil').toBeGreaterThanOrEqual(240);
      expect(D, 'el aro se sale del ancho usable').toBeLessThanOrEqual(390 * 0.92 + 1);
      expect(m.dial.w, 'el aro no cabe en el viewport').toBeLessThanOrEqual(390);
    });
  });

  test.describe('320 px', () => {
    test.use({ viewport: { width: 320, height: 568 } });

    test('sin desborde horizontal ni contenido fuera del viewport', async ({ page, context }) => {
      const errores = capturarErrores(page);
      await sembrar(context);
      await irAlArtefacto(page);
      await asentar(page);
      const m = await sonda(page);
      expect(m.hayDial, 'GUARD: no hay ningun aro en la home').toBe(true);
      expect(m.desbordeH, 'la home desborda a lo ancho a 320 px').toBeLessThanOrEqual(0);
      expect(m.dial.w, 'el aro es mas ancho que el viewport').toBeLessThanOrEqual(320);
      expect(errores).toEqual([]);
    });
  });
});

/* ===================================================================
   EL CENTRO (s159) · aro, arco, numero y luz comparten centro, y ese
   centro es el de la columna de la home.

   NACIO ROJO contra el producto — y tambien contra HEAD v0.89.0, servido
   en paralelo: +11,80 px a 320, +11,89 a 360, +12,00 a 375 y +12,09 a
   390. O sea que el defecto es PREVIO y estaba publicado; la atmosfera
   de s158 solo lo hizo VISIBLE, porque el halo esta anclado al aro y
   arrastra ese error a un campo de luz de 790 px de ancho.

   LA CAUSA, medida y no deducida: el motor publica `--pace-dial-d` =
   0,92 · W del VIEWPORT, y la raiz de FocusTimer suma ademas un padding
   lateral de `clamp(0px, 4vw, 40px)` que ese techo no descuenta. Su
   max-content (D + 2·4vw = 390,19 px a 390) no cabe en el ancho util de
   [data-pace-main-content] (366 px), que es un grid de UNA sola pista
   `auto`: la pista crece hasta 390,19, DESBORDA el contenedor y — por
   defecto — se coloca desde el START en vez de centrarse. La mitad de
   ese desborde es la desviacion.

   SE MIDE CONTRA LA COLUMNA, nunca contra el viewport: en escritorio la
   home empieza despues del sidebar y su centro no es 50vw. Asi el mismo
   aserto vale en las dos pieles sin un solo numero propio.
   =================================================================== */
const centros = (page) => page.evaluate(() => {
  const cx = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return +(r.left + r.width / 2).toFixed(2);
  };
  const home = document.querySelector('[data-pace-home-body]').getBoundingClientRect();
  return {
    columna: +(home.left + home.width / 2).toFixed(2),
    dial: cx('[data-pace-dial-fit]'),
    arco: cx('[data-pace-dial-fit] svg'),
    numero: cx('[data-pace-dial-number]'),
    sol: cx('[data-pace-sun]'),
    desbordeH: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
});

function asertarCentros(m, tolerancia) {
  expect(m.dial, 'GUARD: no hay aro que medir').not.toBeNull();
  expect(m.arco, 'GUARD: no hay arco que medir').not.toBeNull();
  expect(m.numero, 'GUARD: no hay numero que medir').not.toBeNull();
  expect(m.sol, 'GUARD: no existe el nodo de la luz').not.toBeNull();
  /* Primero: las cuatro piezas van juntas. Si esto falla, el problema es
     de anclaje y no de centrado, y el mensaje debe decirlo. */
  expect(Math.abs(m.arco - m.dial), 'el arco no comparte centro con el aro').toBeLessThanOrEqual(tolerancia);
  expect(Math.abs(m.numero - m.dial), 'el numero no comparte centro con el aro').toBeLessThanOrEqual(tolerancia);
  expect(Math.abs(m.sol - m.dial), 'la luz no esta anclada al aro').toBeLessThanOrEqual(tolerancia);
  // Y despues: ese centro comun es el de la columna.
  expect(Math.abs(m.dial - m.columna),
    'el bloque del Pomodoro no esta centrado en la columna (desviacion ' + (m.dial - m.columna).toFixed(2) + ' px)')
    .toBeLessThanOrEqual(tolerancia);
  expect(m.desbordeH, 'el documento desborda a lo ancho').toBeLessThanOrEqual(0);
}

test.describe('geometria de la home · el centro', () => {
  test('escritorio: el aro se centra en su columna, no en el viewport', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await asentar(page);
    asertarCentros(await centros(page), 1);
  });

  /* Los cuatro anchos de telefono reales. La desviacion medida crecia con
     el ancho (11,80 -> 12,09) porque es la mitad del padding sobrante, y
     ese padding es 4vw: proporcional. Un solo ancho no lo habria contado. */
  for (const ancho of [320, 360, 375, 390]) {
    test.describe(ancho + ' px', () => {
      test.use({ viewport: { width: ancho, height: 844 } });

      test('el aro, su arco, su numero y su luz comparten centro', async ({ page, context }) => {
        await sembrar(context);
        await irAlArtefacto(page);
        await asentar(page);
        asertarCentros(await centros(page), 1);
      });
    });
  }

  test.describe('con la sesion viva', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    /* Con luz encendida, que es donde se ve: si el halo se descolgara del
       aro solo al iluminarse, el aserto de arriba pasaria y el usuario
       seguiria viendo el sol torcido. */
    test('encender la luz no descoloca ni el aro ni el halo', async ({ page, context }) => {
      await sembrar(context);
      await irAlArtefacto(page);
      await asentar(page);
      const apagada = await centros(page);
      await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
      await expect(page.locator('[data-pace-dial-fit]')).toHaveAttribute('data-pace-dial-running', '');
      await asentar(page);
      const encendida = await centros(page);
      asertarCentros(encendida, 1);
      expect(encendida.dial, 'encender la luz mueve el aro').toBeCloseTo(apagada.dial, 1);
    });
  });
});

test.describe('geometria de la home · reduced-motion', () => {
  /* PEDIR MENOS MOVIMIENTO NO PUEDE CAMBIAR LA GEOMETRIA (s160).
     Era deuda desde s156: a 1280x720 con `prefers-reduced-motion: reduce` el
     aro salia a 420 px en vez de 406 y la home se quedaba con 11 px de scroll.
     La microcausa, medida en s160: el kill de tokens.css pone
     transition-duration en 0,01 ms sobre TODO y el valor inicial de
     transition-property es «all», asi que cada cambio de geometria pasaba a ser
     una transicion — y el valor de una transicion aterriza en otro frame,
     mientras `applyD()` mide en la MISMA tarea. El motor media el tamaño
     anterior, encogia a ciegas y salia por su propio guard con el techo por
     ancho.

     EL ASERTO ES RELACIONAL: no dice 406 ni 65. Dice que la geometria con
     reduced-motion es la MISMA que sin el, que es lo unico que tiene que ser
     cierto pase lo que pase con el diseño. */
  test('la geometria es identica con y sin el', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    /* `asentarGeometria` y no `asentar`: el motor converge en varias pasadas y
       con la suite entera en paralelo no le caben en dos frames. Medido: leido a
       destiempo el aro daba 420 px, el valor de PARTIDA del bucle, y esta misma
       prueba se ponia roja con el producto correcto. */
    await asentarGeometria(page);
    const normal = await sonda(page);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await asentarGeometria(page);
    const menos = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    /* GUARD de s156: sin el media query activo esto compararia dos veces lo
       mismo y pasaria siempre. `test.use({ reducedMotion })` no llego a
       aplicarse alli, asi que se emula explicitamente y se comprueba. */
    expect(menos, 'GUARD: el contexto no esta en prefers-reduced-motion: reduce').toBe(true);
    const reducido = await sonda(page);

    expect(Math.abs(reducido.dial.h - normal.dial.h),
      'el aro mide distinto con reduced-motion (' + reducido.dial.h + ' vs ' + normal.dial.h + ')')
      .toBeLessThanOrEqual(1);
    expect(Math.abs(px(reducido.solape) - px(normal.solape)),
      'el solapamiento cambia con reduced-motion (' + reducido.solape + ' vs ' + normal.solape + ')')
      .toBeLessThanOrEqual(1);
    expect(reducido.desbordeV - normal.desbordeV,
      'con reduced-motion la home gana scroll vertical (' + reducido.desbordeV + ' vs ' + normal.desbordeV + ')')
      .toBeLessThanOrEqual(1);
  });
});

test.describe('geometria de la home · controles', () => {
  /* El ORDEN DE FOCO vive en `home-a11y.spec.js` desde s160, que es cuando dejo
     de ser deuda: hasta entonces escritorio reordenaba con `order` y el foco no
     seguia al ojo. Aqui se queda lo que tiene que ser cierto pase lo que pase:
     que los controles existan una sola vez y se puedan alcanzar con el teclado. */
  test('sin duplicados y alcanzables con el teclado', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);

    for (const nombre of ['Empezar foco', 'Iniciar camino', 'Respira', 'Hidrátate']) {
      await expect(
        page.locator('[data-pace-home-body]').getByRole('button', { name: nombre, exact: false }),
        'el control «' + nombre + '» no aparece exactamente una vez'
      ).toHaveCount(1);
    }

    const alcanzables = await page.evaluate(() => {
      const raiz = document.querySelector('[data-pace-home-body]');
      const focos = Array.from(raiz.querySelectorAll('button, [href], input, select, textarea, [tabindex]'))
        .filter(el => el.getBoundingClientRect().width > 0 && !el.hasAttribute('disabled')
          && el.getAttribute('tabindex') !== '-1');
      let ok = 0;
      for (const el of focos) { el.focus(); if (document.activeElement === el) ok++; }
      return { total: focos.length, ok };
    });
    expect(alcanzables.total, 'GUARD: no se ha encontrado ningun control en la home').toBeGreaterThan(0);
    expect(alcanzables.ok, 'hay controles de la home que no aceptan el foco').toBe(alcanzables.total);
  });
});

test.describe('geometria de la home · el motor no recalcula sin motivo', () => {
  /* El Pomodoro repinta el numero cada segundo. Si el observador de montaje
     mirase el `subtree` (o `characterData`), eso dispararia un recalculo por
     segundo. Se prueba SIN instrumentar el codigo: se instala un observador
     con la MISMA configuracion sobre la MISMA raiz y se cuenta si dispara.
     Si el mio no dispara, el del motor tampoco puede. */
  test('el contador del Pomodoro no dispara el observador de montaje', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    /* SE ESPERA A QUE EL MOTOR CALLE ANTES DE ESPIAR (s160). Sin esto, la
       ventana de conteo empieza mientras el motor todavia converge y una
       publicacion legitima del ARRANQUE cae dentro: la prueba se ponia roja
       bajo carga diciendo «la geometria se reescribe mientras corre el
       Pomodoro», que no es lo que quiere demostrar. Va ANTES de instalar el
       reloj virtual: con el reloj puesto, requestAnimationFrame solo corre
       cuando el reloj avanza. */
    await asentarGeometria(page);
    await page.clock.install();
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();

    await page.evaluate(() => {
      const stack = document.querySelector('[data-pace-home-stack]');
      window.__disparos = 0;
      window.__estilos = 0;
      window.__espia = new MutationObserver(() => { window.__disparos++; });
      window.__espia.observe(stack, { childList: true });
      // Y ademas: ¿reescribe alguien las variables de :root?
      window.__espiaRaiz = new MutationObserver(() => { window.__estilos++; });
      window.__espiaRaiz.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    });

    await page.clock.runFor('00:10');
    const numero = await page.locator('[data-pace-dial-number]').textContent();
    const conteo = await page.evaluate(() => ({ disparos: window.__disparos, estilos: window.__estilos }));

    expect(numero, 'GUARD: el contador no ha avanzado, la prueba no demuestra nada').not.toBe('25:00');
    expect(conteo.disparos, 'el contador del Pomodoro esta despertando al observador de montaje').toBe(0);
    expect(conteo.estilos, 'la geometria se esta reescribiendo mientras corre el Pomodoro').toBe(0);
  });
});
