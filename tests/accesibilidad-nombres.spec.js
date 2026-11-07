/* PACE · lo que el lector de pantalla dice de cada control (auditoría del 7 nov. 2026)
 * ==================================================================================
 * La auditoría de accesibilidad de la 0.192.0 (docs/audits/accesibilidad-7nov.md) midió con
 * axe-core y el árbol de accesibilidad de Chromium lo que oye quien no ve la pantalla:
 *
 *  · Los minutos del Foco se oían «15, botón», «25, botón», sin la unidad y sin decir cuál
 *    estaba puesto; Foco, Pausa y Larga tampoco decían cuál estaba elegido.
 *  · Las bibliotecas, el aviso de seguridad de la apnea y «Da de pastar a la vaca» eran
 *    «diálogo» a secas, sin nombre.
 *  · El ⚠ de las técnicas con aviso se leía «⚠»: su nombre estaba en una <i> sin rol, que el
 *    lector no anuncia.
 *  · Los filtros de las bibliotecas se oían «Sin retención8»: la cifra va pegada al nombre.
 *  · Las pestañas de Estadísticas no decían cuál estaba abierta.
 *  · Salir de una sesión se leía «por Salir» (la × iba en el texto) y el idioma de la
 *    bienvenida, «E S punto E N».
 *  · El último logro de la barra lateral empezaba por «·».
 *  · Los vasos de Hidrátate se oían «1», «2», «3», sin decir si estaban llenos.
 *  · El aro del Foco eran dos «imagen» sueltas, sin nombre, fuera de todo botón.
 *
 * Nada de esto cambia un píxel: son nombres, estados y adornos ocultos al lector. Cada prueba
 * cae con su arreglo quitado (comprobado con un mutante por arreglo).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');

test.describe('nombres y estados en la home', () => {
  test('los minutos del Foco llevan su unidad y dicen cuál está puesto', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context);
    await irAlArtefacto(page);
    const grupo = page.getByRole('group', { name: 'Minutos del bloque de foco' });
    await expect(grupo).toBeVisible();
    await expect(grupo.getByRole('button', { name: '25 minutos', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(grupo.getByRole('button', { name: '15 minutos', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await grupo.getByRole('button', { name: '15 minutos', exact: true }).click();
    await expect(grupo.getByRole('button', { name: '15 minutos', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(grupo.getByRole('button', { name: '25 minutos', exact: true })).toHaveAttribute('aria-pressed', 'false');
    /* Ninguno se llama solo con la cifra. */
    for (const n of ['15', '25', '35', '45']) await expect(page.getByRole('button', { name: n, exact: true })).toHaveCount(0);
    /* El campo de «Otro» tiene nombre: antes era un número sin etiqueta. */
    await grupo.getByRole('button', { name: 'Otro', exact: true }).click();
    await expect(grupo.getByRole('spinbutton', { name: 'Minutos personalizados (5–180)' })).toBeFocused();
    expect(errores).toEqual([]);
  });

  test('en inglés también', async ({ page, context }) => {
    await sembrar(context, { lang: 'en' });
    await irAlArtefacto(page);
    const grupo = page.getByRole('group', { name: 'Focus block minutes' });
    await expect(grupo.getByRole('button', { name: '25 minutes', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Focus', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('Foco, Pausa y Larga dicen cuál está elegido', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    const modo = (n) => page.locator('[data-pace-tabs]').getByRole('button', { name: n, exact: true });
    await expect(modo('Foco')).toHaveAttribute('aria-pressed', 'true');
    await expect(modo('Pausa')).toHaveAttribute('aria-pressed', 'false');
    await modo('Pausa').click();
    await expect(modo('Pausa')).toHaveAttribute('aria-pressed', 'true');
    await expect(modo('Foco')).toHaveAttribute('aria-pressed', 'false');
    await expect(modo('Larga')).toHaveAttribute('aria-pressed', 'false');
  });

  test('el último logro de la barra lateral no empieza por un punto', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    const boton = page.locator('[data-pace-sidebar-ultimo]').filter({ visible: true });
    await expect(boton).toHaveCount(1);
    await expect(boton).toHaveAccessibleName(/^Aún no hay ninguno/);
  });

  test('el aro del Foco no son imágenes sin nombre: el tiempo lo dice el número', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await expect(page.locator('[data-pace-dial-ring] svg').first(), 'GUARD: el aro no se pintó').toBeVisible();
    await expect(page.locator('[data-pace-dial-ring]').getByRole('img')).toHaveCount(0);
    await expect(page.locator('[data-pace-dial-number]')).toHaveText('25:00');
  });
});

test('los vasos de Hidrátate dicen cuál es cada uno y si está lleno', async ({ page, context }) => {
  await sembrar(context, { soundOn: false });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Hidrátate/ }).first().click();
  const vasos = page.getByRole('dialog', { name: /Hidrátate/ });
  await expect(vasos.getByRole('button', { name: 'Vaso 1 de 8, vacío', exact: true })).toBeVisible();
  await vasos.getByRole('button', { name: 'Un vaso más', exact: true }).click();
  await expect(vasos.getByRole('button', { name: 'Vaso 1 de 8, lleno', exact: true })).toBeVisible();
  await expect(vasos.getByRole('button', { name: 'Vaso 2 de 8, vacío', exact: true })).toBeVisible();
  for (const n of ['1', '2', '8']) await expect(vasos.getByRole('button', { name: n, exact: true })).toHaveCount(0);
});

test.describe('los diálogos tienen nombre', () => {
  test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

  test('la biblioteca de Respira se llama como su título, y sus filtros separan la cifra', async ({ page }) => {
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /^Respira/ }).click();
    const biblioteca = page.getByRole('dialog', { name: 'Respiración', exact: true });
    await expect(biblioteca).toBeVisible();
    const chip = biblioteca.locator('.pace-lib-chip').filter({ visible: true }).filter({ hasText: 'Sin retención' });
    await expect(chip).toHaveAccessibleName(/^Sin retención \(\d+\)$/);
  });

  test('el aviso de la apnea se llama «Antes de empezar» con la técnica, y el ⚠ de la tarjeta se anuncia', async ({ page }) => {
    await irAlArtefacto(page);
    await page.getByRole('button', { name: /^Respira/ }).click();
    const tarjeta = page.locator('.pace-lib [data-pace-lib-card="breathe.co2"]').filter({ visible: true });
    await expect(tarjeta.getByRole('img', { name: 'Requiere lectura de seguridad' })).toHaveCount(1);
    await tarjeta.getByRole('button', { name: 'Tolerancia CO₂' }).click();
    const aviso = page.getByRole('dialog', { name: 'Antes de empezar · Tolerancia CO₂', exact: true });
    await expect(aviso).toBeVisible();
    await expect(aviso.getByRole('checkbox', { name: 'Lo he leído y asumo mi responsabilidad' })).toBeVisible();
  });

  test('las pestañas de Estadísticas dicen cuál está abierta', async ({ page }) => {
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Ver estadísticas' }).click();
    const pestana = (k) => page.locator('[data-pace-stats-tab="' + k + '"]');
    await expect(pestana('today')).toHaveAttribute('aria-pressed', 'true');
    await expect(pestana('week')).toHaveAttribute('aria-pressed', 'false');
    await pestana('week').click();
    await expect(pestana('week')).toHaveAttribute('aria-pressed', 'true');
    await expect(pestana('today')).toHaveAttribute('aria-pressed', 'false');
  });

  test('«Da de pastar a la vaca» se llama como su título', async ({ page }) => {
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Da de pastar a la vaca' }).click();
    await expect(page.getByRole('dialog', { name: 'El núcleo de PACE es gratis.', exact: true })).toBeVisible();
  });
});

test('en inglés, la biblioteca y el aviso de la apnea se llaman en inglés', async ({ page, context }) => {
  await sembrar(context, { lang: 'en', soundOn: false });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Breathe/ }).click();
  await expect(page.getByRole('dialog', { name: 'Breathing', exact: true })).toBeVisible();
  await page.locator('.pace-lib [data-pace-lib-card="breathe.co2"] h4 button').filter({ visible: true }).click();
  await expect(page.getByRole('dialog', { name: /^Before you start · CO₂/ })).toBeVisible();
});

test('salir de una sesión se llama «Salir», sin la ×, y la × se sigue viendo', async ({ page, context }) => {
  await sembrar(context, { soundOn: false });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.locator('.pace-lib [data-pace-lib-card="breathe.coherent.55"] h4 button').filter({ visible: true }).first().click();
  const sesion = page.locator('[data-pace-session-root]');
  const salir = sesion.getByRole('button', { name: 'Salir', exact: true });
  await expect(salir).toBeVisible();
  await expect(salir).toHaveText('× Salir');
});

test('el idioma de la bienvenida dice lo que hace', async ({ page }) => {
  await page.goto('/index.html');   // sin sembrar: la bienvenida
  const boton = page.getByRole('dialog').getByRole('button', { name: 'Cambiar a English', exact: true });
  await expect(boton).toBeVisible();
  await boton.click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Switch to Spanish', exact: true })).toBeVisible();
});

/* Las páginas sueltas no tenían región principal: el lector no podía saltar al contenido y axe
   contaba cada bloque como texto fuera de toda región. Ahora la caja que ya las envolvía es <main>. */
for (const ruta of ['/premium/', '/beta/', '/gracias/', '/recuperar/', '/desistir/']) {
  test('la página ' + ruta + ' tiene una región principal con su título dentro', async ({ page }) => {
    await page.goto(ruta);
    await expect(page.getByRole('main')).toHaveCount(1);
    const fuera = await page.evaluate(() => [...document.querySelectorAll('h1, h2, p, a, button')]
      .filter((e) => e.getClientRects().length && !e.closest('main')).map((e) => e.outerHTML.slice(0, 80)));
    expect(fuera, 'hay contenido visible fuera de <main>').toEqual([]);
  });
}
