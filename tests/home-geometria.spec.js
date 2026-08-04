/* PACE · E2E · GEOMETRIA DE LA HOME (s156)
 * =========================================
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
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');

/* Camino en curso, con la forma EXACTA que escribe `startPath()`
   (state-paths.jsx:16-22). No se borra ningun nodo del DOM: el estado es real
   y la tarjeta desaparece porque `SuggestedPathCard` retorna null (:218). */
const CAMINO_ACTIVO = {
  paths: {
    current: { id: 'path.breath', stepIndex: 0, startedAt: 1, skippedSteps: [], doneCount: 0 },
    lastViewed: 'path.breath',
    completed: {},
    favorite: null,
  },
};

/* Sonda unica. Devuelve lo medido en la pagina, sin interpretar nada aqui.
   GUARD DE CERO: si no hay ni un aro, `dial` viene a null y todo aserto que
   lo use falla con mensaje propio en vez de pasar por vacio. */
function sonda(page) {
  return page.evaluate(() => {
    const q = s => document.querySelector(s);
    const caja = el => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { w: +b.width.toFixed(1), h: +b.height.toFixed(1), top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1) };
    };
    const dial = q('[data-pace-dial-fit]');
    const spc = q('[data-pace-spc]');
    const act = q('[data-pace-activitybar]');
    const body = q('[data-pace-home-body]');
    const raiz = getComputedStyle(document.documentElement);

    /* El recorte real, en px, leido del clip-path computado. */
    let recorte = null;
    if (dial) {
      const m = /inset\(([^)]*)\)/.exec(getComputedStyle(dial).clipPath || '');
      if (m) {
        const partes = m[1].trim().split(/\s+/).map(parseFloat);
        // inset(0px) => todos iguales; inset(a b c d) => c es el inferior
        recorte = partes.length >= 3 ? partes[2] : partes[0];
      }
    }
    /* El bloque que hace de HORIZONTE se elige por POSICION, no por selector:
       es el primero que aparece debajo del aro. En movil es la tarjeta; en
       Desktop el `order` de _responsive.js pone Actividades ahi y manda la
       tarjeta al fondo. Elegir `spc || act` a secas mide contra el bloque
       equivocado en Desktop — comprobado. */
    const horizonte = [spc, act]
      .filter(Boolean)
      .map(el => [el, el.getBoundingClientRect().top])
      .filter(([, t]) => dial && t > dial.getBoundingClientRect().top)
      .sort((a, b) => a[1] - b[1])
      .map(([el]) => el)[0] || null;

    return {
      hayDial: !!dial,
      haySpc: !!spc,
      hayAct: !!act,
      D: raiz.getPropertyValue('--pace-timer-d').trim(),
      solape: raiz.getPropertyValue('--pace-activities-overlap').trim(),
      recorte,
      // Solape REAL: cuanto del aro queda por debajo del borde superior del horizonte.
      solapeReal: (dial && horizonte) ? +(caja(dial).bottom - caja(horizonte).top).toFixed(1) : null,
      dial: caja(dial), spc: caja(spc), act: caja(act),
      desbordeV: body ? body.scrollHeight - body.clientHeight : null,
      desbordeH: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ordenVisual: [
        dial ? ['dial', caja(dial).top] : null,
        spc ? ['spc', caja(spc).top] : null,
        act ? ['act', caja(act).top] : null,
      ].filter(Boolean).sort((a, b) => a[1] - b[1]).map(x => x[0]).join(' > '),
    };
  });
}

const px = v => (v === '' || v == null) ? null : parseFloat(v);

/* TRAMPA MEDIDA (s156). `[data-pace-main-content]` entra con la animacion
   `pace-module-in`, que lo desplaza 10 px durante 640 ms (tokens.css). Medir
   rectangulos antes de que termine da diferencias de hasta 10 px EXACTOS entre
   el aro y el bloque de abajo, y lleva a reportar una desincronizacion que no
   existe. Se espera a que las animaciones acaben —no un timeout al azar— y a
   dos frames, que es lo que tarda el motor en reaccionar a cualquier cambio. */
async function asentar(page) {
  await page.evaluate(async () => {
    const mc = document.querySelector('[data-pace-main-content]');
    if (mc && mc.getAnimations) {
      await Promise.all(mc.getAnimations().map(a => a.finished.catch(() => {})));
    }
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

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
     SIN recortar. Esto lo aserta en los dos estados. */
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
      expect(m.recorte, 'el aro no lleva recorte').not.toBeNull();
      expect(Math.abs(m.recorte - solape), 'el recorte del aro no vale el solapamiento publicado').toBeLessThanOrEqual(1);
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

test.describe('geometria de la home · atmosfera de amanecer', () => {
  /* Los estados se comprueban por ATRIBUTO, no por color: el aserto sigue
     valiendo aunque manana se cambie el tono del amanecer. */
  test('reposo, activo y pausado se distinguen por atributo estable', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    const dial = page.locator('[data-pace-dial-fit]');

    /* TRAMPA MEDIDA (s156): la opacidad del halo se TRANSICIONA (640 ms), asi
       que leerla justo tras el click devuelve un valor a medio camino — 0.78
       entre 1 y 0.42, comprobado. Se leen las variables declarativas, que no se
       animan, y aparte se comprueba UNA vez que el halo las consume de verdad
       en reposo, donde no hay ninguna transicion en vuelo. */
    const leerEstado = () => page.evaluate(() => {
      const d = document.querySelector('[data-pace-dial-fit]');
      const mc = document.querySelector('[data-pace-main-content]');
      return {
        running: d.hasAttribute('data-pace-dial-running'),
        paused: d.hasAttribute('data-pace-dial-paused'),
        halo: getComputedStyle(d).getPropertyValue('--pace-dawn').trim(),
        alba: getComputedStyle(mc).getPropertyValue('--pace-alba').trim(),
        haloPintado: getComputedStyle(d, '::before').opacity,
      };
    });

    const reposo = await leerEstado();
    expect(reposo.running, 'en reposo no debe haber marca de «corriendo»').toBe(false);
    expect(reposo.paused, 'en reposo no debe haber marca de «pausado»').toBe(false);
    expect(Number(reposo.haloPintado), 'el halo no consume --pace-dawn').toBeCloseTo(Number(reposo.halo), 2);

    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(dial).toHaveAttribute('data-pace-dial-running', '');
    const activo = await leerEstado();
    expect(activo.paused, 'corriendo no es pausado').toBe(false);

    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await expect(dial).toHaveAttribute('data-pace-dial-paused', '');
    const pausado = await leerEstado();
    expect(pausado.running, 'pausado no es corriendo').toBe(false);

    /* Los tres se ven distintos, y de forma ORDENADA: activo mas luz que
       reposo, y pausado menos que reposo. Sin fijar los valores. */
    expect(Number(activo.halo)).toBeGreaterThan(Number(reposo.halo));
    expect(Number(pausado.halo)).toBeLessThan(Number(reposo.halo));
    expect(Number(activo.alba)).toBeGreaterThan(Number(pausado.alba));
  });

  test('la linea de alba se ancla al mismo horizonte que el recorte', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await asentar(page);
    const m = await sonda(page);
    expect(m.hayDial, 'GUARD: no hay ningun aro en la home').toBe(true);
    const alba = await page.evaluate(() =>
      getComputedStyle(document.querySelector('[data-pace-main-content]'), '::after').bottom);
    expect(parseFloat(alba), 'el alba no esta en la linea del horizonte').toBeCloseTo(px(m.solape), 0);
  });

  test.describe('reduced-motion', () => {
    test('las transiciones decorativas quedan neutralizadas', async ({ page, context }) => {
      /* `test.use({ reducedMotion })` NO llego a aplicarse aqui (comprobado con
         el guard de abajo: el media query salia false), asi que se emula de
         forma explicita sobre la pagina. */
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await sembrar(context);
      await irAlArtefacto(page);
      const dur = await page.evaluate(() => ({
        mq: matchMedia('(prefers-reduced-motion: reduce)').matches,
        halo: getComputedStyle(document.querySelector('[data-pace-dial-fit]'), '::before').transitionDuration,
        alba: getComputedStyle(document.querySelector('[data-pace-main-content]'), '::after').transitionDuration,
      }));
      // GUARD: sin el media query activo esta prueba no demuestra nada.
      expect(dur.mq, 'el contexto no esta en prefers-reduced-motion: reduce').toBe(true);
      // El kill global de tokens.css deja 0.01ms; lo que importa es que no sea perceptible.
      expect(parseFloat(dur.halo), 'la transicion del halo sigue viva con reduced-motion').toBeLessThan(0.05);
      expect(parseFloat(dur.alba), 'la transicion del alba sigue viva con reduced-motion').toBeLessThan(0.05);
    });
  });
});

test.describe('geometria de la home · controles', () => {
  /* NO se aserta el orden del DOM. Escritorio lo reordena con `order` y el
     foco de teclado no sigue al ojo: es DEUDA de accesibilidad conocida
     (s156), y consagrarla en un aserto la volveria intocable. Lo que si tiene
     que ser cierto pase lo que pase es que los controles existan una sola vez
     y se puedan alcanzar con el teclado. */
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
