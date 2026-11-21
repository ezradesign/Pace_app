/* PACE · AUDITORÍA DE LA 0.212.0 (20 nov. 2026) · LAS PRUEBAS QUE CAEN EN MAIN
 * ============================================================================
 * Cada prueba dice lo que DEBERÍA pasar y cae hoy en main: es la prueba de que el hallazgo es real.
 * No viven en tests/ porque romperían el CI hasta que Ez elija cómo se cierra cada uno (la página
 * index.html de esta carpeta). Para correrlas:
 *   copia este archivo a tests/ y
 *   PACE_E2E_PORT=8931 npx playwright test tests/caen-en-main.spec.js --project=chromium --workers=1
 * Al montar el cierre de un hallazgo, su prueba pasa a tests/ con el nombre del módulo.
 * (El hallazgo 1, Haptics fuera del iPhone, no está aquí: lo vigila verify.ios.js, y en main cae.)
 * Con las letras de Ez del 21 nov. (3A 4A 5A 6A), los hallazgos 2, 4, 5 y 6 ya están montados con su prueba
 * en tests/: compra-apps.spec.js (3A y 4A), feedback-frecuencia.spec.js (5A) y voz-cuerpo.spec.js (voz-5 y
 * voz-6, 6A). Aquí queda el 3, la miniventana en la jornada (2A de Ez), que monta la sesión del aviso del PC.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina } = require('./helpers');

const JORNADA = { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const cta = (p) => p.locator('[data-pace-cta]');

/* La miniventana de verdad no se abre sin una persona que toque: la de un iframe, como tests/aviso-pc.spec.js. */
async function miniventanaFalsa(context) {
  await context.addInitScript(() => {
    if (window.top !== window) return;
    Object.defineProperty(window, 'documentPictureInPicture', { configurable: true, value: {
      requestWindow: () => new Promise((ok) => {
        const f = document.createElement('iframe');
        f.setAttribute('data-pip-falso', '');
        f.style.cssText = 'position:fixed;left:0;bottom:0;width:300px;height:84px;border:0;z-index:2147483647';
        document.body.appendChild(f);
        ok(f.contentWindow);
      }),
    } });
  });
}
const tira = (page) => page.frameLocator('[data-pip-falso]').locator('[data-pace-mini]');

/* Hallazgo 3. Con «A tu ritmo», el bloque acaba y el aro pasa solo a la pausa: la tira nunca se pone en
   terracota, y su «Pausar» no pausa (el aro la vuelve a poner en marcha al instante). */
test('hallazgo 3 · con «A tu ritmo», el «Pausar» de la tira en la pausa pausa de verdad', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: false, ritmo: { dia: JORNADA } });
  await miniventanaFalsa(context);
  await context.clock.install({ time: new Date('2026-09-17T09:00:00+02:00') });
  await irAlArtefacto(page);
  await cta(page).click();
  await page.evaluate(() => paceMiniAbrir());
  await expect(tira(page)).toContainText('Foco');
  for (let i = 0; i < 30; i++) {
    if (await page.evaluate(() => !!(getState().ritmo.dia || {}).pausaHasta)) break;
    await context.clock.fastForward(5 * 60000);
    await context.clock.runFor(1500);
  }
  await esperarEnPagina(page, () => !!(getState().ritmo.dia || {}).pausaHasta);
  await context.clock.runFor(2000);
  await expect(tira(page)).toContainText('Pausa corta');
  const boton = tira(page).getByRole('button', { name: 'Pausar' });
  if (await boton.count()) {
    const antes = await tira(page).locator('span').first().innerText();
    await boton.click();
    await context.clock.runFor(3000);
    expect(await tira(page).locator('span').first().innerText(), 'la tira ofrece «Pausar» y la pausa sigue corriendo').toBe(antes);
  }
});
