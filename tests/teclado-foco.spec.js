/* PACE · E2E · EL TECLADO NO MIENTE Y EL FOCO NO SE PIERDE (s198 · v0.131.0)
 * =========================================================================
 * Lo que la auditoria de s198 MIDIO sobre v0.130.0, en el artefacto publicado:
 *
 *  · Con el preview ENCIMA de la biblioteca, un Escape cerraba la biblioteca de
 *    DETRAS y dejaba el preview (cada Modal escuchaba Escape por su cuenta).
 *  · Los modales no eran dialogos: sin rol, el foco en <body> al abrir y 25 de
 *    30 Tab saliendo al fondo. El onboarding, sin trampa de foco (Fase 8.5).
 *  · Ctrl+S abria Estadisticas; una «s» en mitad de una sesion tambien.
 *  · Empezar una sesion desde «Continua» (barra lateral) dejaba el foco en ese
 *    boton, DETRAS de la sesion: la barra espaciadora lo pulsaba en vez de
 *    pausar, con «ESPACIO PAUSAR» escrito en pantalla.
 *  · Ninguna sesion pedia mantener la pantalla encendida.
 *  · Ajustes no se cerraba con Escape.
 *
 * Calibrado en ROJO contra el `index.html` de HEAD (v0.130.0). Lo que NO cubre:
 * un lector de pantalla de verdad (se asertan rol, nombre y foco, que es lo que
 * el lector lee), y si el navegador CONCEDE la pantalla encendida: la API se
 * sustituye por una falsa que cuenta peticiones, porque headless no la concede.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');

const focoDentroDe = (page, sel) => page.evaluate((s) => {
  const c = [...document.querySelectorAll(s)].pop();
  return !!(c && c.contains(document.activeElement));
}, sel);

async function abrirBiblioteca(page, nombre) {
  await page.getByRole('button', { name: nombre }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
}

async function empezarCoherente(page) {
  await abrirBiblioteca(page, 'Respira');
  await page.locator('.pace-lib h4 button', { hasText: 'Coherente 5·5' }).filter({ visible: true }).first().click();
  await page.locator('[data-pace-session-root]').waitFor({ state: 'visible' });
}

test.describe('con la home sembrada', () => {
  test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

  test('Escape cierra el dialogo de ARRIBA: con el preview encima, vuelves a la biblioteca', async ({ page }) => {
    await irAlArtefacto(page);
    await abrirBiblioteca(page, 'Mueve');
    await page.locator('.pace-lib h4 button').filter({ visible: true }).first().click();
    await expect(page.locator('[data-pace-modal-card]')).toHaveCount(2);

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pace-modal-card]'), 'un Escape cerro DOS dialogos o el de abajo').toHaveCount(1);
    await expect(page.locator('.pace-lib'), 'el que queda tiene que ser la biblioteca').toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pace-modal-card]')).toHaveCount(0);
  });

  test('un modal es un dialogo con nombre, el foco entra, Tab no se escapa y al cerrar vuelve a quien lo abrio', async ({ page }) => {
    const errores = capturarErrores(page);
    await irAlArtefacto(page);
    const abridor = page.getByRole('button', { name: 'Ver logros' });
    await abridor.click();
    const dialogo = page.getByRole('dialog', { name: 'Logros', exact: true });
    await expect(dialogo).toBeVisible();
    await expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(await focoDentroDe(page, '[data-pace-modal-card]'), 'el foco se quedo fuera del dialogo al abrirlo').toBe(true);

    for (let i = 0; i < 30; i++) {
      await page.keyboard.press(i % 7 === 6 ? 'Shift+Tab' : 'Tab');
      expect(await focoDentroDe(page, '[data-pace-modal-card]'), 'Tab numero ' + (i + 1) + ' salio al fondo').toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialogo).toHaveCount(0);
    await expect(abridor, 'el foco no volvio al boton que abrio el dialogo').toBeFocused();
    expect(errores).toEqual([]);
  });

  test('Ctrl+S no abre Estadisticas; la S a secas si (control), y no en mitad de una sesion', async ({ page }) => {
    await irAlArtefacto(page);
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(250);
    await expect(page.locator('[data-pace-modal-card]'), 'Ctrl+S abrio Estadisticas').toHaveCount(0);

    await page.keyboard.press('s');
    await expect(page.locator('[data-pace-modal-card]'), 'CONTROL: la S a secas tiene que seguir abriendo Estadisticas').toHaveCount(1);
    await page.keyboard.press('Escape');

    await empezarCoherente(page);
    await page.keyboard.press('s');
    await page.waitForTimeout(250);
    await expect(page.locator('[data-pace-modal-card]'), 'una «s» en mitad de una sesion abrio Estadisticas').toHaveCount(0);
  });

  test('empezar desde «Continua» deja el foco en la sesion, y Espacio PAUSA', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-05T10:00:00') });
    await irAlArtefacto(page);
    await empezarCoherente(page);
    await page.clock.runFor(9000);
    await page.keyboard.press('Escape');
    await page.locator('[data-pace-session-root]').waitFor({ state: 'detached' });

    const accion = page.locator('[data-pace-sidebar-accion][data-kind="resume"] button');
    await expect(accion, 'GUARD: la barra lateral ofrece retomar la que dejaste').toBeVisible();
    await accion.click();
    await page.locator('[data-pace-session-root]').waitFor({ state: 'visible' });
    expect(await focoDentroDe(page, '[data-pace-session-root]'), 'el foco se quedo en la barra lateral, detras de la sesion').toBe(true);
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await focoDentroDe(page, '[data-pace-session-root]'), 'Tab numero ' + (i + 1) + ' salio de la sesion al fondo').toBe(true);
    }
    await page.locator('[data-pace-session-root]').focus();

    await page.clock.runFor(6000);
    await expect(page.getByRole('button', { name: /Pausar/ })).toBeVisible();
    await page.keyboard.press(' ');
    await page.clock.runFor(500);
    await expect(page.getByRole('button', { name: /Reanudar/ }), 'Espacio no pauso: pulso el boton escondido').toBeVisible();
  });

  test('Escape cierra Ajustes', async ({ page }) => {
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pace-tweaks-panel]')).toHaveCount(0);
  });
});

test.describe('la pantalla encendida', () => {
  test.beforeEach(async ({ context }) => {
    await sembrar(context, { soundOn: false });
    /* Headless no concede la pantalla: se cuenta lo que la app PIDE. */
    await context.addInitScript(() => {
      window.__luz = { pedidas: 0, soltadas: 0 };
      const falsa = {
        request: () => {
          window.__luz.pedidas++;
          const c = new EventTarget();
          c.released = false;
          c.release = () => {
            if (!c.released) { c.released = true; window.__luz.soltadas++; c.dispatchEvent(new Event('release')); }
            return Promise.resolve();
          };
          return Promise.resolve(c);
        },
      };
      Object.defineProperty(navigator, 'wakeLock', { value: falsa, configurable: true });
    });
  });

  test('una sesion guiada la pide UNA vez (aunque cambie de pantalla) y la suelta al salir; el Foco no', async ({ page }) => {
    await irAlArtefacto(page);
    await empezarCoherente(page);
    await page.waitForTimeout(4500);   // de la preparacion al ejercicio: otra pantalla, la misma peticion
    const durante = await page.evaluate(() => window.__luz);
    expect(durante.pedidas, 'la sesion no pidio mantener la pantalla encendida').toBe(1);
    expect(durante.soltadas).toBe(0);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(1900);
    expect((await page.evaluate(() => window.__luz)).soltadas, 'salir no solto la pantalla').toBe(1);

    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await page.waitForTimeout(600);
    expect((await page.evaluate(() => window.__luz)).pedidas, 'el Foco pidio la pantalla: un bloque largo no la pide').toBe(1);
  });
});

test('el onboarding atrapa el foco y los atajos no lo atraviesan', async ({ page }) => {
  await page.goto('/index.html');   // sin sembrar: primera vez de la vida
  const raiz = page.locator('[data-pace-scene-card][role="dialog"]');
  await raiz.waitFor({ state: 'visible' });
  expect(await focoDentroDe(page, '[data-pace-scene-card][role="dialog"]'), 'el foco no entro en el onboarding').toBe(true);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await focoDentroDe(page, '[data-pace-scene-card][role="dialog"]'), 'Tab numero ' + (i + 1) + ' salio del onboarding').toBe(true);
  }
  await page.locator('body').press('s');
  await page.waitForTimeout(250);
  await expect(page.locator('[data-pace-modal-card]'), 'la S abrio Estadisticas debajo del onboarding').toHaveCount(0);
});
