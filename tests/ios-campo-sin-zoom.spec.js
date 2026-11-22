/* PACE · tests/ios-campo-sin-zoom.spec.js
   ======================================
   EN EL IPHONE, TOCAR UN CAMPO NO AMPLÍA LA PANTALLA (caza del móvil, 22 nov. 2026).
   Safari, y el WebView del iPhone, amplían la página al enfocar un campo con la letra por debajo
   de 16 px y no la devuelven al salir. Los campos de PACE van a 13-15 px: «Otro» en los minutos
   (13), el código de PACE completo (14), lo que buscas en la bienvenida (14) y el nombre de una
   rutina propia (15). Las páginas sueltas de la web (/recuperar, /desistir, /premium) ya van a 16.

   No se puede ver el zoom fuera de un iPhone: Playwright no lo imita. Se mide su condición, la que
   documenta Apple: hay zoom si el campo enfocado tiene menos de 16 px y la página no fija
   `maximum-scale=1`. Con un iPhone se pide que no lo haya; en Android el mismo valor quitaría el
   zoom con dos dedos, así que allí la página sigue como estaba (y Android no amplía al enfocar).

   Contra la 0.214.0 cae: 13 px y 14 px sin `maximum-scale`.
*/
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';

/* Lo que decide el zoom al enfocar: la letra del campo con el foco y el `content` del viewport. */
function zoomAlEnfocar(page) {
  return page.evaluate(() => {
    const campo = document.activeElement;
    const letra = campo && /^(INPUT|TEXTAREA|SELECT)$/.test(campo.tagName) ? parseFloat(getComputedStyle(campo).fontSize) : null;
    const vp = (document.querySelector('meta[name="viewport"]') || {}).content || '';
    return { letra, vp, amplia: letra != null && letra < 16 && !/maximum-scale\s*=\s*1(\.0)?\b/.test(vp) };
  });
}

test.describe('iPhone', () => {
  test.use({ userAgent: IPHONE, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('«Otro» en los minutos no amplía la home al tocarlo', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /^Otro$/i }).filter({ visible: true }).first().click();
    await expect(page.locator('[data-pace-minutos] input')).toBeFocused();
    const z = await zoomAlEnfocar(page);
    expect(z.letra, 'el campo de los minutos').not.toBeNull();
    expect(z.amplia, `el campo tiene ${z.letra} px y el viewport dice «${z.vp}»`).toBe(false);
  });

  test('el código de PACE completo no amplía la hoja al tocarlo', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await page.locator('button[aria-label="Abrir ajustes"]').filter({ visible: true }).first().click();
    await page.getByRole('button', { name: /Copias, borrar/ }).click();
    await page.getByRole('button', { name: /PACE completo/ }).click();
    await expect(page.locator('[data-pace-premium-codigo]')).toBeFocused();
    const z = await zoomAlEnfocar(page);
    expect(z.amplia, `el campo tiene ${z.letra} px y el viewport dice «${z.vp}»`).toBe(false);
  });
});

test.describe('Android', () => {
  test.use({ userAgent: ANDROID, viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true });

  test('CONTROL · en Android la página se sigue pudiendo ampliar con dos dedos', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    const vp = await page.evaluate(() => document.querySelector('meta[name="viewport"]').content);
    expect(vp).not.toMatch(/maximum-scale|user-scalable/);
  });
});
