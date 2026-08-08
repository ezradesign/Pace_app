/* PACE · E2E · LA PALETA AUTOMATICA (s161)
 * =========================================
 * Defiende el modo «Auto» de paleta: seguir al sistema EN CALIENTE, suspender
 * mientras corre un bloque, y el cruce de 640 ms.
 *
 * QUE REVISA. Hasta v0.91.0 la decision de s89 era que el sistema solo manda en
 * el PRIMER arranque de la vida («no re-sigue cambios del SO en caliente»,
 * state-core.support.jsx:43-46). Esa fila no se borra: sigue siendo cierta para
 * quien elige a mano. Lo que cambia es que ahora se puede elegir «que mande el
 * sistema», y entonces manda.
 *
 * LOS ASERTOS SON RELACIONALES: ninguno dice de que color es la paleta ni
 * cuantos tokens cruzan. Dicen que Auto SIGUE, que a mano NO sigue, que durante
 * un bloque NO entra y al terminarlo SI, y que nadie persigue al token. Si
 * manana cambia un color o se anade uno, esto sigue diciendo lo que debe.
 *
 * TRAMPA MEDIDA (s161): en el panel de Ajustes hay DOS botones «Automatico»
 * —el de idioma (s139) y el de paleta— y `getByRole` sin acotar revienta por
 * strict mode. La fila se acota por el hermano que solo ella tiene.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const CLAVE_DIAS_OSCUROS = 'pace.darkDays.v1';

/* La paleta que la app tiene puesta AHORA mismo, leida del DOM. */
function paletaVisible(page) {
  return page.evaluate(() => document.documentElement.getAttribute('data-palette'));
}

/* La fila de pills de PALETA, acotada por «Crema dia», que solo esta ahi. */
function filaPaleta(page) {
  return page.locator('[data-pace-tweaks-panel] div')
    .filter({ has: page.getByRole('button', { name: 'Crema día', exact: true }) })
    .last();
}

async function abrirAjustes(page) {
  await page.getByRole('button', { name: 'Abrir tweaks' }).click();
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
}

test.describe('paleta automatica · seguir al sistema', () => {
  test('en Auto la paleta sigue al sistema en caliente; a mano NO lo sigue', async ({ page, context }) => {
    /* Las dos mitades en la MISMA prueba a proposito: por separado, «no
       cambia» podria significar que el gesto no llego a producirse. Aqui la
       primera mitad demuestra que el gesto SI mueve la paleta. */
    await sembrar(context, { palette: 'crema', paletteAuto: true });
    const errores = capturarErrores(page);
    await irAlArtefacto(page);

    await expect.poll(() => paletaVisible(page)).toBe('crema');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect.poll(() => paletaVisible(page), { timeout: 5000 }).toBe('oscuro');

    /* salir de Auto eligiendo a mano, y repetir el gesto: ya no debe seguir */
    await abrirAjustes(page);
    await filaPaleta(page).getByRole('button', { name: 'Crema día', exact: true }).click();
    await expect.poll(() => paletaVisible(page)).toBe('crema');
    await expect.poll(() => page.evaluate(() => getState().paletteAuto)).toBe(false);

    await page.emulateMedia({ colorScheme: 'light' });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(1200);
    expect(await paletaVisible(page)).toBe('crema');

    expect(errores).toEqual([]);
  });

  test('elegir una pill a mano apaga Auto, y volver a Auto resuelve al momento', async ({ page, context }) => {
    await sembrar(context, { palette: 'crema', paletteAuto: true });
    await irAlArtefacto(page);
    await abrirAjustes(page);
    const fila = filaPaleta(page);
    await expect(fila.getByRole('button', { name: 'Automático', exact: true })).toBeVisible();

    await fila.getByRole('button', { name: 'Oscuro noche', exact: true }).click();
    await expect.poll(() => page.evaluate(() => getState().paletteAuto)).toBe(false);
    await expect.poll(() => paletaVisible(page)).toBe('oscuro');

    /* con el sistema en claro, volver a Auto tiene que devolver el papel claro
       SIN recargar — es lo que hace que la pill se sienta viva (s139). */
    await page.emulateMedia({ colorScheme: 'light' });
    await fila.getByRole('button', { name: 'Automático', exact: true }).click();
    await expect.poll(() => page.evaluate(() => getState().paletteAuto)).toBe(true);
    await expect.poll(() => paletaVisible(page)).toBe('crema');
  });
});

test.describe('paleta automatica · el bloque manda', () => {
  test('con un bloque vivo el cambio se SUSPENDE, y al terminarlo entra solo', async ({ page, context }) => {
    await sembrar(context, { palette: 'crema', paletteAuto: true });
    const errores = capturarErrores(page);
    await irAlArtefacto(page);

    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible();
    /* el aro vivo es la condicion que lee el producto: si esto fallara, la
       prueba estaria midiendo una home sin bloque y pasaria por vacio */
    await expect(page.locator('[data-pace-dial-running], [data-pace-dial-paused]')).toHaveCount(1);

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(1200);
    expect(await paletaVisible(page)).toBe('crema');

    /* pausado TAMBIEN es bloque vivo (haySesion = running || paused) */
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Continuar', exact: true })).toBeVisible();
    await page.waitForTimeout(600);
    expect(await paletaVisible(page)).toBe('crema');

    /* terminar el bloque: «Reiniciar bloque» solo existe con status paused */
    await page.getByRole('button', { name: 'Reiniciar bloque', exact: true }).click();
    await expect(page.locator('[data-pace-dial-running], [data-pace-dial-paused]')).toHaveCount(0);
    await expect.poll(() => paletaVisible(page), { timeout: 5000 }).toBe('oscuro');

    expect(errores).toEqual([]);
  });
});

test.describe('paleta automatica · el cruce', () => {
  test('el primer papel entra SECO: el arranque no cruza', async ({ page, context }) => {
    /* Medido en s161: sin el guard, `PACE.html` arrancaba con 15 transiciones
       de token vivas (la primera a 1377 ms sobre --ink-3), porque Babel aplica
       el tema mucho despues de que `:root` se haya computado en claro. */
    /* `paletteAuto: false` A PROPOSITO, y es una trampa medida: con Auto y
       `emulateMedia`, el cambio de media CORRE CONTRA la navegacion. Bajo carga
       (ocho workers) la app llegaba a arrancar en claro, resolvia `crema`, y el
       modo Auto la pasaba a oscuro despues — un cruce REAL a los 613 ms, con
       los TRECE tokens compartiendo `startTime`, que esta sonda contaba como
       «flash de arranque». Era la funcion trabajando, no un defecto. Con la
       paleta guardada y sin Auto, arrancar en oscuro es DETERMINISTA. */
    await sembrar(context, { palette: 'oscuro', paletteAuto: false });
    /* La sonda va por `setTimeout`, no por `requestAnimationFrame`: hasta que
       React monta NO HAY FRAMES, y una sonda por rAF no daba su primera muestra
       hasta t≈1322 ms — o sea que estaba calibrada pero no estaba MIRANDO
       durante el arranque, que es justo lo que se quiere medir.

       Y CUENTA SOLO LOS TOKENS DE PALETA. Filtrar por `--` a secas contaba
       ademas `--pace-luz` y `--pace-nucleo`, que tambien estan registrados con
       @property (s159) y transicionan con la luz del Pomodoro: en la suite
       completa, con ocho workers, ese ruido daba 1599 «cruces» mientras
       aislado daba 0. No era el arranque, era el instrumento. */
    await page.addInitScript(() => {
      window.__crucesArranque = new Set();
      const ES_PALETA = /^--(paper|ink|line|focus|breathe)/;
      const mira = () => {
        try {
          for (const a of document.getAnimations()) {
            const p = a.transitionProperty;
            if (p && ES_PALETA.test(p)) window.__crucesArranque.add(p + '@' + a.startTime);
          }
        } catch (e) { /* aun sin documento */ }
        if (performance.now() < 5000) setTimeout(mira, 0);
      };
      setTimeout(mira, 0);
    });
    await page.emulateMedia({ colorScheme: 'dark' });
    await irAlArtefacto(page);
    await page.waitForTimeout(1500);

    /* GUARD DEL INSTRUMENTO: si la sonda no llego a mirar, su cero no vale. */
    expect(await paletaVisible(page)).toBe('oscuro');
    expect(await page.evaluate(() => document.documentElement.hasAttribute('data-pace-palette-ready'))).toBe(true);
    expect(await page.evaluate(() => [...window.__crucesArranque])).toEqual([]);
  });

  test('durante el cruce nadie persigue al token', async ({ page, context }) => {
    /* El defecto de s159 en otra superficie: un nodo con transicion propia
       sobre color persigue a una variable que se mueve, y una transicion cuyo
       destino cambia cada frame se REINICIA cada frame. Medido antes del
       arreglo: 112 persiguiendo en el pico y 237 de desviacion. */
    await sembrar(context, { palette: 'crema', paletteAuto: false });
    await irAlArtefacto(page);
    await page.waitForTimeout(800);

    const r = await page.evaluate(async () => {
      const raiz = document.documentElement;
      const valoresDelToken = new Set();
      let picoPersiguiendo = 0, framesConCruceVivo = 0;
      await new Promise(res => {
        const t0 = performance.now(); let primero = true;
        const paso = t => {
          if (primero) { primero = false; setPalette('oscuro'); }
          let lider = 0, seguidores = 0;
          for (const a of document.getAnimations()) {
            if (a.playState !== 'running' || !a.transitionProperty) continue;
            const esToken = a.transitionProperty.indexOf('--') === 0;
            const destino = a.effect && a.effect.target;
            if (esToken && destino === raiz) { lider++; continue; }
            if (/color/.test(a.transitionProperty)) seguidores++;
          }
          valoresDelToken.add(getComputedStyle(raiz).getPropertyValue('--paper').trim());
          if (lider > 0) { framesConCruceVivo++; picoPersiguiendo = Math.max(picoPersiguiendo, seguidores); }
          /* 1500 ms y no 900: el fundido dura 640 y con ocho workers los frames
             escasean — la ventana tiene que cubrirlo aunque el reloj vaya justo. */
          if (t - t0 < 1500) requestAnimationFrame(paso); else res();
        };
        requestAnimationFrame(paso);
      });
      return { picoPersiguiendo, framesConCruceVivo, pasosDelToken: valoresDelToken.size };
    });

    /* GUARD DE CERO, en DOS ejes, porque uno solo no basta: contar frames mide
       cuanto se miro, y contar valores distintos mide que lo mirado se MOVIA.
       El umbral de frames baja de 10 a 4 con motivo medido: bajo ocho workers
       una ventana de 900 ms dio 8 frames con el cruce vivo y el guard mordio
       —correctamente, la muestra era fina—; lo que faltaba era ventana, no
       tolerancia, y el segundo guard es el que impide que aflojarlo cuele. */
    expect(r.framesConCruceVivo).toBeGreaterThan(4);
    expect(r.pasosDelToken, 'el token no se movio: no hubo cruce que observar')
      .toBeGreaterThan(3);
    /* Los subarboles `data-pace-essential` quedan fuera de la supresion a
       proposito (WCAG 2.3.3), asi que el listinho no es cero: era 112. */
    expect(r.picoPersiguiendo).toBeLessThan(40);
  });
});

test.describe('paleta automatica · el arco sobrevive al registro', () => {
  test('el color del arco es valido con los tokens registrados, en las dos paletas', async ({ page, context }) => {
    /* EL DEFECTO QUE ESTO CONSAGRA (s161): registrar `--breathe` con
       `@property` hace que su valor computado pase de «#C97A5D» a
       «rgb(201, 122, 93)», y el `hexToRgb` que tenia `interpolateRingColor`
       devolvia NaN ⇒ `--pace-arco` invalido ⇒ el degradado del bloom del sol
       caia ENTERO a `background-image: none`. Lo cazo la suite, pero **por
       rebote**, en una prueba de la luz. Esto lo aserta de frente.

       RELACIONAL: no dice de que color es el arco, dice que es un COLOR. */
    await sembrar(context, { palette: 'crema', paletteAuto: false });
    const errores = capturarErrores(page);
    await irAlArtefacto(page);

    const r = await page.evaluate(() => {
      const salida = {};
      for (const paleta of ['crema', 'oscuro']) {
        document.documentElement.setAttribute('data-palette', paleta);
        const colores = [0, 0.25, 0.5, 0.75, 1].map(p => interpolateRingColor(p, 'foco'));
        salida[paleta] = {
          colores,
          /* GUARD: los tokens que el arco lee tienen que estar REGISTRADOS, o
             esta prueba pasaria sin tocar el caso que la motiva. */
          breathe: getComputedStyle(document.documentElement).getPropertyValue('--breathe').trim(),
        };
      }
      return salida;
    });

    for (const paleta of ['crema', 'oscuro']) {
      /* El guard del registro: un token registrado computa en forma canonica. */
      expect(r[paleta].breathe, 'el token no esta registrado: la prueba no tocaria el caso real')
        .toMatch(/^rgba?\(/);
      for (const c of r[paleta].colores) {
        expect(c, 'el arco no es un color en ' + paleta).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
        expect(c, 'el arco tiene NaN en ' + paleta).not.toContain('NaN');
      }
    }

    /* Y el consumidor real: con la luz encendida, el bloom tiene degradado. */
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await page.getByRole('button', { name: 'Pausar', exact: true }).waitFor();
    await expect.poll(() => page.evaluate(() => {
      const s = document.querySelector('[data-pace-sun]');
      return s ? getComputedStyle(s, '::after').backgroundImage : null;
    })).not.toBe('none');

    expect(errores).toEqual([]);
  });
});

test.describe('paleta automatica · lo que no se regala', () => {
  test('en Auto, un dia en oscuro NO cuenta para el logro secreto', async ({ page, context }) => {
    /* Gemelo del guard de `secret.bilingual` (s139): el logro premia haber
       ELEGIDO el oscuro. Con la paleta siguiendo al sistema, sin guard bastaria
       con tener el SO en oscuro para que PACE fuera apuntando dias. */
    await sembrar(context, { palette: 'oscuro', paletteAuto: true });
    await page.emulateMedia({ colorScheme: 'dark' });
    await irAlArtefacto(page);
    await page.waitForTimeout(800);
    const enAuto = await page.evaluate(c => localStorage.getItem(c), CLAVE_DIAS_OSCUROS);
    expect(enAuto).toBeNull();

    /* CONTROL POSITIVO en la misma prueba: elegir oscuro A MANO si cuenta. Sin
       esto, el null de arriba podria ser «el detector no corre nunca». */
    await abrirAjustes(page);
    await filaPaleta(page).getByRole('button', { name: 'Oscuro noche', exact: true }).click();
    await expect.poll(() => page.evaluate(() => getState().paletteAuto)).toBe(false);
    await expect.poll(() => page.evaluate(c => localStorage.getItem(c), CLAVE_DIAS_OSCUROS))
      .not.toBeNull();
  });
});
