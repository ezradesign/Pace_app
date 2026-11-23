/* PACE · E2E · LA APP TIENE UN ENCABEZADO PARA EL LECTOR DE PANTALLA (caza web del 22 nov. 2026)
 * ==============================================================================================
 * Con un lector de pantalla se salta de encabezado en encabezado (la tecla H en NVDA, el rotor en
 * VoiceOver). La app no tenía ninguno: los de la landing están en el DOM pero ocultos, y en la home
 * no quedaba nada a lo que saltar. Ahora hay un `h1` con el nombre de la app, que no se ve.
 * Contra main cae: no hay ningún encabezado visible para el lector.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

for (const [lang, nombre] of [['es', 'PACE · Foco · Cuerpo'], ['en', 'PACE · Focus · Body']]) {
  test(lang + ' · la home tiene un h1 para el lector de pantalla, y no se ve', async ({ page, context }) => {
    await sembrar(context, { lang });
    await irAlArtefacto(page);
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1, 'la app no tiene un h1 en el árbol de accesibilidad').toHaveCount(1);
    await expect(h1).toHaveText(nombre);
    const caja = await h1.boundingBox();
    expect(caja.width <= 1 && caja.height <= 1, 'el encabezado se ve: ' + JSON.stringify(caja)).toBe(true);
  });
}
