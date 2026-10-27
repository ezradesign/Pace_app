/* PACE · tests/ajustes-movil.spec.js
   ==================================
   LOS AJUSTES DEL MÓVIL, SIN SCROLL (Ez, 2A del 22 oct. 2026, sobre
   docs/proposals/maqueta-inicio-22oct.html). A 72 dvh pedían 218 px de scroll en la web y
   287 en Android a 360×730: ni a pantalla entera cabían. «Tus datos» pasa a su propia hoja
   («Copias, borrar y PACE completo ›»), las filas se juntan y la hoja puede subir hasta dejar
   56 px de la home arriba (a 360×730 en Android ocupa el 79 %). En el ordenador, desde la 3A del
   27 oct., se pliega igual por debajo de 860 px de alto (ajustes-avisos.spec.js).

   QUÉ DEFIENDE: cero scroll a 360×730 y 360×640, en la web y en Android (con la fila de
   «Alarmas y recordatorios», que es la más alta), en español y en inglés; que se vea un
   trozo de la home arriba; que la hoja de «Tus datos» lo tenga todo y se vuelva con «‹»;
   y que en un ordenador alto la sección siga entera. Contra v0.174.4 cae: había scroll y no
   había hoja.
*/
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const PANEL = '[data-pace-tweaks-panel]';
const TX = {
  es: { abrir: 'Abrir ajustes', datos: 'Copias, borrar y PACE completo', seccion: 'Tus datos', exportar: /Exportar/ },
  en: { abrir: 'Open settings', datos: 'Copies, delete and PACE Complete', seccion: 'Your data', exportar: /Export/ },
};

/* Lo que añade Android cuando falta «Alarmas y recordatorios»: una fila con su línea pequeña. */
async function comoAndroid(page) {
  await page.evaluate(() => {
    window.paceNativoAvisos = () => true; window.pacePlataformaNativa = () => 'android';
    window.paceNativoAvisoPermiso = () => 'granted'; window.paceEsNativo = () => true;
    window.paceAndroidAvisoExacto = () => 'denied'; window.paceAndroidAvisoExactoMirar = () => Promise.resolve('denied');
  });
}

async function abrir(page, lang) {
  await page.locator('button[aria-label="' + TX[lang].abrir + '"]').filter({ visible: true }).first().click();
  await expect(page.locator(PANEL)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(450);   // la entrada de la hoja (pace-slide-up, 280 ms)
}

function medir(page) {
  return page.evaluate((sel) => {
    const p = document.querySelector(sel);
    const r = p.getBoundingClientRect();
    return { scroll: p.scrollHeight - p.clientHeight, arriba: Math.round(r.top), alto: Math.round(r.height), pantalla: innerHeight };
  }, PANEL);
}

for (const lang of ['es', 'en']) for (const alto of [730, 640]) for (const android of [false, true]) {
  test(`móvil ${lang} 360×${alto}${android ? ' Android' : ''}: los Ajustes caben sin scroll y dejan ver la home arriba`, async ({ page, context }) => {
    await page.setViewportSize({ width: 360, height: alto });
    await sembrar(context, { lang, notifyFocusEnd: true });
    await irAlArtefacto(page);
    if (android) await comoAndroid(page);
    await abrir(page, lang);
    if (android) {
      /* GUARD: la fila más alta está, con su nota como línea pequeña de la fila */
      await expect(page.locator(PANEL + ' .pace-aj-sub-accion')).toBeVisible();
      await expect(page.locator(PANEL + ' .pace-aj-nota')).toHaveCount(0);
    }
    const m = await medir(page);
    expect(m.scroll, `los Ajustes piden ${m.scroll} px de scroll`).toBeLessThanOrEqual(0);
    expect(m.arriba, 'la hoja tiene que dejar ver la home arriba').toBeGreaterThanOrEqual(56);
    if (android && alto === 730) expect(Math.round(100 * m.alto / m.pantalla), 'en el móvil de Ez, el 79 %').toBeLessThanOrEqual(79);
    /* «Tus datos» se queda en su línea: el enlace se ve y las acciones no */
    await expect(page.locator(PANEL).getByRole('button', { name: TX[lang].datos })).toBeVisible();
    await expect(page.locator(PANEL).getByRole('button', { name: TX[lang].exportar })).toBeHidden();
  });
}

test('móvil: «Copias, borrar y PACE completo» abre la hoja de Tus datos, «‹» vuelve y cerrar la deja como estaba', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 730 });
  await sembrar(context);
  await irAlArtefacto(page);
  await abrir(page, 'es');
  await page.locator(PANEL).getByRole('button', { name: TX.es.datos }).click();
  await expect(page.locator(PANEL + ' #pace-aj-titulo')).toHaveText('Tus datos');
  await expect(page.locator(PANEL).getByRole('button', { name: /Exportar/ })).toBeVisible();
  await expect(page.locator(PANEL).getByRole('button', { name: /Importar/ })).toBeVisible();
  await expect(page.locator(PANEL).getByRole('button', { name: /Borrar/ })).toBeVisible();
  await expect(page.locator(PANEL + ' .pace-aj-pie a').first()).toBeVisible();
  /* la hoja de Tus datos tampoco pide scroll */
  expect((await medir(page)).scroll).toBeLessThanOrEqual(0);
  /* y lo demás no está en ella */
  await expect(page.locator(PANEL + ' [data-pace-aj-fila="lang"]')).toHaveCount(0);

  await page.locator(PANEL).getByRole('button', { name: 'Volver a Ajustes' }).click();
  await expect(page.locator(PANEL + ' #pace-aj-titulo')).toHaveText('Ajustes');
  await expect(page.locator(PANEL + ' [data-pace-aj-fila="lang"]')).toBeVisible();

  /* cerrar con la hoja de datos abierta y volver a abrir: se abre en Ajustes */
  await page.locator(PANEL).getByRole('button', { name: TX.es.datos }).click();
  await page.locator(PANEL).getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator(PANEL)).toHaveCount(0);
  await abrir(page, 'es');
  await expect(page.locator(PANEL + ' #pace-aj-titulo')).toHaveText('Ajustes');
});

/* En el ordenador se pliega igual por debajo de 860 px de alto (Ez, 3A del 27 oct.;
   ajustes-avisos.spec.js); en una pantalla alta, la sección va entera. */
test('ordenador alto: Tus datos va entera y sin enlace', async ({ page, context }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await sembrar(context);
  await irAlArtefacto(page);
  await abrir(page, 'es');
  await expect(page.locator(PANEL).getByRole('button', { name: /Exportar/ })).toBeVisible();
  await expect(page.locator(PANEL).getByRole('button', { name: TX.es.datos })).toBeHidden();
  await expect(page.locator(PANEL + ' [data-pace-aj-fila="lang"]')).toBeVisible();
});
