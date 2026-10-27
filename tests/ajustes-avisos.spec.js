/* PACE · E2E · los Ajustes de la 3A (Ez, 27 oct. 2026)
 * ==========================================
 * Lo que Ez eligió sobre la maqueta (https://claude.ai/artifact/6p1BHbVqSrgtwnJgrXWLka):
 *  1. En las pantallas bajas del ordenador, «Tus datos» se pliega en su línea, como en el
 *     móvil: el panel pedía 83 px de scroll en la ventana de Ez (1536 × 710), 123 en inglés,
 *     y 33 en inglés a 1280 × 800, donde ajustes.spec.js solo miraba el español.
 *  2. La entrada se llama «Copias, borrar y PACE completo»: ahí dentro está PACE completo.
 *  3. El interruptor, 40 × 24, la altura de las píldoras de al lado.
 *  4. Palabras de persona: «copia», «Ajustes», ni JSON ni backup ni Tweaks.
 *  5. Borrar todo e importar preguntan con un aviso de PACE, no con la ventana del navegador.
 * Calibradas en rojo contra la 0.179.0: caen todas menos la de 1440 × 900, que es el CONTROL
 * (en una pantalla alta la sección va entera, sin scroll).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, abrirTusDatos, CLAVE_ESTADO } = require('./helpers');

const PANEL = '[data-pace-tweaks-panel]';
const AVISO = '[data-pace-aj-aviso]';

/* Chromium headless dice siempre «bloqueadas» y pinta una nota de 35 px que una instalación
   nueva no tiene (ajustes.spec.js, s188). */
async function comoNavegadorReal(context) {
  await context.addInitScript(() => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
  });
}

const medir = (page) => page.locator(PANEL).evaluate((p) => ({ sobra: p.scrollHeight - p.clientHeight }));
const ABRIR = { es: 'Abrir ajustes', en: 'Open settings' };
const DATOS = { es: 'Copias, borrar y PACE completo', en: 'Copies, delete and PACE Complete' };
const EXPORTAR = { es: 'Exportar una copia', en: 'Export a copy' };

for (const v of [{ width: 1536, height: 710 }, { width: 1366, height: 768 }, { width: 1280, height: 800 }]) {
  for (const lang of ['es', 'en']) {
    test('1 · a ' + v.width + ' × ' + v.height + ' en ' + lang + ', Ajustes cabe sin scroll y «Tus datos» abre su vista, que tampoco scrollea', async ({ page, context }) => {
      await sembrar(context, { lang });
      await comoNavegadorReal(context);
      await page.setViewportSize(v);
      await irAlArtefacto(page);
      await page.getByRole('button', { name: ABRIR[lang] }).click();
      await page.locator(PANEL).waitFor();
      expect((await medir(page)).sobra, 'el panel pide scroll').toBeLessThanOrEqual(0);
      await expect(page.locator(PANEL).getByRole('button', { name: EXPORTAR[lang] }), '«Tus datos» no se plegó').toBeHidden();

      await page.locator(PANEL).getByRole('button', { name: new RegExp(DATOS[lang]) }).click();
      await expect(page.locator(PANEL).getByRole('button', { name: EXPORTAR[lang] })).toBeVisible();
      expect((await medir(page)).sobra, 'la vista de «Tus datos» pide scroll').toBeLessThanOrEqual(0);
    });
  }
}

test('CONTROL · en una pantalla alta (1440 × 900, en inglés) la sección va entera y sin scroll', async ({ page, context }) => {
  await sembrar(context, { lang: 'en' });
  await comoNavegadorReal(context);
  await page.setViewportSize({ width: 1440, height: 900 });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: ABRIR.en }).click();
  await expect(page.locator(PANEL).getByRole('button', { name: EXPORTAR.en })).toBeVisible();
  await expect(page.locator(PANEL).getByRole('button', { name: new RegExp(DATOS.en) })).toBeHidden();
  expect((await medir(page)).sobra).toBeLessThanOrEqual(0);
});

test('2 y 3 · en el móvil, la entrada dice que dentro está PACE completo, y el interruptor mide 40 × 24', async ({ page, context }) => {
  await sembrar(context);
  await page.setViewportSize({ width: 360, height: 740 });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: ABRIR.es }).click();
  await page.locator(PANEL).getByRole('button', { name: /Copias, borrar y PACE completo/ }).click();
  await expect(page.locator(PANEL)).toContainText('PACE completo');
  await page.locator(PANEL + ' [data-pace-aj-volver]').click();
  const sw = await page.locator(PANEL + ' [data-pace-aj-fila="sound"] .pace-aj-sw').boundingBox();
  expect([Math.round(sw.width), Math.round(sw.height)]).toEqual([40, 24]);
  /* La misma altura que las píldoras de la fila de debajo. */
  const pild = await page.locator(PANEL + ' [data-pace-aj-fila="signal"] .pace-aj-pild').first().boundingBox();
  expect(Math.abs(sw.height - pild.height)).toBeLessThanOrEqual(1);
});

test('4 · Ajustes no habla de programador: ni JSON, ni backup, ni Tweaks, en ninguno de los dos idiomas', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const dichos = await page.evaluate(() => {
    const malos = [];
    for (const lang of ['es', 'en']) {
      const S = window.PACE_STRINGS[lang];
      Object.keys(S).filter((k) => k.indexOf('settings.') === 0 || k.indexOf('ach.item.explore.tweaks') === 0)
        .forEach((k) => { if (/json|backup|tweaks/i.test(S[k])) malos.push(lang + ' ' + k + ': ' + S[k]); });
    }
    const curiosidad = window.ACHIEVEMENT_CATALOG.find((a) => a.id === 'explore.tweaks');
    if (/tweaks/i.test(curiosidad.desc)) malos.push('catálogo explore.tweaks: ' + curiosidad.desc);
    return malos;
  });
  expect(dichos).toEqual([]);
});

test('5 · borrar todo pregunta con un aviso de PACE: «Cancelar» no borra y «Borrar todo» sí', async ({ page, context }) => {
  /* Semilla de una vez: tras borrar falta la clave y `sembrar` la volvería a escribir. */
  await context.addInitScript(([clave]) => {
    if (localStorage.getItem('__sembrado')) return;
    localStorage.setItem('__sembrado', '1');
    localStorage.setItem(clave, JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, totalFocusMin: 500 }));
  }, [CLAVE_ESTADO]);
  const errores = capturarErrores(page);
  const delNavegador = [];
  page.on('dialog', (d) => { delNavegador.push(d.message()); d.dismiss().catch(() => {}); });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: ABRIR.es }).click();
  await abrirTusDatos(page);
  await page.getByRole('button', { name: 'Borrar todos mis datos' }).click();

  const aviso = page.locator(AVISO);
  await expect(page.getByRole('dialog', { name: '¿Borrar todos tus datos?' })).toBeVisible();
  await expect(aviso).toContainText('No se puede deshacer. Si quieres, exporta antes una copia.');
  await aviso.getByRole('button', { name: 'Cancelar' }).click();
  await expect(aviso).toHaveCount(0);
  expect(await page.evaluate(() => window.getState().totalFocusMin), '«Cancelar» borró').toBe(500);

  await page.getByRole('button', { name: 'Borrar todos mis datos' }).click();
  const recarga = page.waitForEvent('load');
  await page.locator(AVISO).getByRole('button', { name: 'Borrar todo' }).click();
  await recarga;
  /* Borrado de verdad: la app vuelve a la primera vez de la vida. */
  await expect(page.locator('[role=dialog][data-pace-scene-card]')).toBeVisible();
  expect(delNavegador, 'preguntó con la ventana del navegador').toEqual([]);
  expect(errores).toEqual([]);
});

test('5 · importar pregunta con un aviso de PACE que dice lo que trae la copia; «Cancelar» no toca nada', async ({ page, context }) => {
  await sembrar(context, { totalFocusMin: 500 });
  const delNavegador = [];
  page.on('dialog', (d) => { delNavegador.push(d.message()); d.dismiss().catch(() => {}); });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: ABRIR.es }).click();
  const entregar = () => page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: 'pace-backup-20261027.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'PACE', state: { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
      ritmo: { libre: true }, totalFocusMin: 42, achievements: { 'first.focus': 1, 'explore.tweaks': 1 } } })),
  });

  await entregar();
  const aviso = page.locator(AVISO);
  await expect(page.getByRole('dialog', { name: '¿Cambiar tus datos por los de la copia?' })).toBeVisible();
  await expect(aviso).toContainText('La copia trae 2 logros y 42 min de foco.');
  await aviso.getByRole('button', { name: 'Cancelar' }).click();
  await expect(aviso).toHaveCount(0);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.getState().totalFocusMin), '«Cancelar» importó').toBe(500);

  await entregar();
  const recarga = page.waitForEvent('load');
  await page.locator(AVISO).getByRole('button', { name: 'Importar' }).click();
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  expect(await page.evaluate(() => window.getState().totalFocusMin)).toBe(42);
  expect(delNavegador, 'preguntó con la ventana del navegador').toEqual([]);
});
