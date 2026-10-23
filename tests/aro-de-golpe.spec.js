/* PACE · E2E · AL VOLVER A LA APP, EL ARO LLEGA DE GOLPE (M1, el móvil de Ez, 22 oct. 2026)
 * =======================================================================================
 * Con un Foco en marcha, al volver de segundo plano el reloj salta todo lo que pasó fuera, y el
 * aro (`TimerDial.jsx`) animaba ese salto con la transición de 1 s del segundo que pasa: llegaba
 * a su sitio a trompicones. Ahora un salto de más de 2 s se pinta sin transición, y el segundo
 * siguiente vuelve a animar. Contra v0.174.4 cae.
 *
 * «Fuera» se hace con `clock.setSystemTime` y la página oculta: la hora avanza sin que corra
 * ningún temporizador, como una app en segundo plano; al volver, `visibilitychange` la corrige.
 *
 * La transición del salto se lee en el mismo cambio que mueve el arco, con un MutationObserver,
 * y no después: `deGolpe` vale solo para el render del salto, y cualquier render siguiente con el
 * mismo restante devuelve el 1 s. En el CI llegaba uno antes de la lectura y la prueba caía sin
 * que el aro hubiera animado nada.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.runFor(1000); await page.waitForTimeout(8); }
}
function visibilidad(page, estado) {
  return page.evaluate((v) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, estado);
}
/* Lo que dura la transición del arco y la del punto, ahora mismo. Los selectores valen también
   para la versión de antes (el único trazo con desfase es el arco; el giro, el grupo de dentro).
   Vive en la página para que el observador del salto la lea en su mismo cambio. */
function instalarLectura(page) {
  return page.evaluate(() => {
    const dura = (sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).transitionDuration.split(',')[0].trim() : null;
    };
    window.__aroTransiciones = () => ({ arco: dura('circle[stroke-dashoffset]'), punto: dura('[data-pace-dial-punto] svg > g > g') });
  });
}
const transiciones = (page) => page.evaluate(() => window.__aroTransiciones());
/* Guarda las transiciones del render en que la cifra del reloj SALTA más de 2 s: arco y cifra
   cambian en el mismo render. No basta con vigilar el arco, que también se mueve al volver a
   medirse (fuentes que llegan tarde, otro tamaño) y entonces puede ser otro nodo (CI de
   v0.175.0). Y no basta con «la cifra cambió»: el reloj instalado de Playwright corre solo con
   el tiempo real, y en el CI a veces pasaba un segundo normal antes del salto (CI de v0.175.0,
   otra vez). El segundo que pasa se apunta y se sigue esperando. */
function vigilarSalto(page) {
  return page.evaluate(() => {
    const cifra = () => {
      const n = document.querySelector('[data-pace-dial-number]');
      const m = n && /(\d+):(\d{2})/.exec(n.textContent);
      return m ? Number(m[1]) * 60 + Number(m[2]) : null;
    };
    let previo = cifra();
    window.__aroSalto = null;
    const obs = new MutationObserver(() => {
      const ahora = cifra();
      if (ahora === null || ahora === previo) return;
      const salto = Math.abs(ahora - previo) > 2;
      previo = ahora;
      if (!salto) return;
      window.__aroSalto = window.__aroTransiciones();
      obs.disconnect();
    });
    obs.observe(document.body, { attributes: true, characterData: true, childList: true, subtree: true });
  });
}
const numero = (page) => page.locator('[data-pace-dial-number]').innerText();

test('al volver a la app con un Foco en marcha, el aro llega de golpe; segundo a segundo, anima', async ({ page }) => {
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await segundos(page, 3);
  await instalarLectura(page);
  expect(await transiciones(page), 'el segundo que pasa no anima').toEqual({ arco: '1s', punto: '1s' });

  const antes = await numero(page);
  await vigilarSalto(page);
  await visibilidad(page, 'hidden');
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.setSystemTime(ahora + 90 * 1000);
  await visibilidad(page, 'visible');
  await expect.poll(() => numero(page), 'GUARD: el reloj no saltó al volver').not.toBe(antes);
  await expect.poll(() => page.evaluate(() => window.__aroSalto), 'GUARD: el arco no se movió al volver').not.toBeNull();
  expect(await page.evaluate(() => window.__aroSalto), 'el aro anima el salto de 90 s al volver').toEqual({ arco: '0s', punto: '0s' });

  await segundos(page, 1);
  expect(await transiciones(page), 'tras llegar, el segundo que pasa ya no anima').toEqual({ arco: '1s', punto: '1s' });
});
