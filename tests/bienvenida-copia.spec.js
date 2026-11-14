/* PACE · E2E · TRAER UNA COPIA DESDE LA BIENVENIDA (Ez, N3 A, 8 nov. 2026)
 * ========================================================================
 * La caza de lo nuevo (8 nov.): quien estrena móvil o borró sus datos pasaba la bienvenida, «¿Cómo
 * es tu semana?», PACE completo y la visita, y DESPUÉS iba a Ajustes › Tus datos › Importar; lo
 * traído sustituía lo contestado. Ez eligió la A: «¿Tienes una copia? Tráela» bajo «Comenzar»,
 * que abre el aviso de importar de siempre y deja la app como si se hubiera importado desde Ajustes.
 *
 *   1. La bienvenida sigue sin scroll con el enlace, a 360 y a 1280 px, en es y en.
 *   2. Traerla desde la bienvenida: el aviso de siempre, por ENCIMA de la bienvenida, y la app
 *      queda igual que con la misma copia traída desde Ajustes, sin bienvenida ni visita.
 *   3. Un archivo que no es una copia se dice en la bienvenida, que sigue donde estaba.
 *
 * Contra la 0.194.0 caen las tres: no hay enlace.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, CLAVE_ESTADO, abrirTusDatos } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const TXT = {
  es: { enlace: '¿Tienes una copia? Tráela', titulo: '¿Cambiar tus datos por los de la copia?', si: 'Importar', noEs: 'Ese archivo no es una copia de PACE.', ajustes: 'Abrir ajustes' },
  en: { enlace: 'Have a copy? Bring it in', titulo: 'Replace your data with the copy?', si: 'Import', noEs: 'This file isn’t a PACE copy.', ajustes: 'Open settings' },
};

/* Una copia como las que salen de Ajustes, de alguien con su semana, sus logros y una rutina. */
const COPIA = {
  app: 'PACE', version: '0.194.0', exportedAt: '2026-11-06T10:00:00.000Z',
  state: {
    firstSeen: 1761900000000, lang: 'es', langAuto: false, palette: 'crema',
    totalFocusMin: 135, ritmo: { libre: true },
    achievements: { 'first.focus': { unlockedAt: 1761900100000 }, 'secret.backup': { unlockedAt: 1761900200000 } },
    customRoutines: [{ id: 'custom.1761900300000', name: 'La de la tarde',
      steps: [{ name: 'Encogimiento de hombros', dur: 20, cue: '' }, { name: 'Giro sentado', dur: 20, cue: '' }],
      createdAt: 1761900300000, updatedAt: 1761900300000 }],
    novedadesVistas: '*',
  },
};

/* PACE recién estrenado: la bienvenida, en el idioma de la prueba. */
async function aLaBienvenida(page, context, lang) {
  await sembrar(context, { firstSeen: null, lang, langAuto: false });
  await page.goto('/index.html');
  await expect(page.locator('[data-pace-onb-copia]')).toBeVisible();
}

const guardado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || 'null'), CLAVE_ESTADO);

async function entregar(page, boton, copia) {
  const [elige] = await Promise.all([page.waitForEvent('filechooser'), boton.click()]);
  await elige.setFiles({ name: 'pace-copia.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(copia)) });
}

for (const lang of ['es', 'en']) {
  for (const vp of [{ w: 360, h: 800 }, { w: 1280, h: 800 }]) {
    test(`1 · ${lang} a ${vp.w} px · el enlace, bajo «Comenzar» y sin scroll`, async ({ page, context }) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await aLaBienvenida(page, context, lang);
      const enlace = page.locator('[data-pace-onb-copia]');
      await expect(enlace).toHaveText(TXT[lang].enlace);
      await page.waitForTimeout(700); // el reveal escalonado de la columna, entero
      const m = await page.evaluate(() => {
        const col = document.querySelector('[data-pace-reveal]');
        const caja = col.parentElement;
        const r = (el) => el.getBoundingClientRect();
        const cta = r(col.querySelector('[data-pace-cta]'));
        const link = r(document.querySelector('[data-pace-onb-copia]'));
        return { sobra: caja.scrollHeight - caja.clientHeight, ancho: document.documentElement.scrollWidth - innerWidth,
          debajo: link.top - cta.bottom, fuera: link.bottom > innerHeight || link.left < 0 || link.right > innerWidth, alto: link.height };
      });
      expect(m.sobra, 'la bienvenida pide scroll con el enlace').toBeLessThanOrEqual(1);
      expect(m.ancho, 'la bienvenida pide scroll de lado').toBeLessThanOrEqual(0);
      expect(m.fuera, 'el enlace se sale de la pantalla').toBe(false);
      expect(m.debajo, 'el enlace no va bajo «Comenzar» o lo pisa').toBeGreaterThanOrEqual(0);
      expect(m.alto, 'el enlace parte en dos líneas').toBeLessThan(30);
    });
  }
}

for (const [lang, vp] of [['es', { w: 360, h: 800 }], ['en', { w: 1280, h: 800 }]]) {
  test(`2 · ${lang} a ${vp.w} px · traída desde la bienvenida, la app queda como traída desde Ajustes`, async ({ page, context, browser }) => {
    const errores = capturarErrores(page);
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await aLaBienvenida(page, context, lang);
    await entregar(page, page.locator('[data-pace-onb-copia]'), COPIA);

    /* El aviso de siempre, por encima de la bienvenida: su «Importar» es lo que hay en ese punto. */
    const aviso = page.locator('[data-pace-aj-aviso]');
    await expect(page.getByRole('heading', { name: TXT[lang].titulo })).toBeVisible();
    const si = aviso.getByRole('button', { name: TXT[lang].si, exact: true });
    expect(await si.evaluate((b) => { const r = b.getBoundingClientRect(); return b.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); }),
      'el aviso de importar queda debajo de la bienvenida').toBe(true);
    const recarga = page.waitForEvent('load');
    await si.click();
    await recarga;
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await expect(page.locator('[data-pace-scene-card][role=dialog]'), 'tras traer la copia vuelve la bienvenida').toHaveCount(0);
    await expect(page.locator('[data-pace-visita]'), 'tras traer la copia sale la visita').toHaveCount(0);
    const desdeBienvenida = await guardado(page);
    expect(desdeBienvenida.totalFocusMin).toBe(135);
    expect(desdeBienvenida.customRoutines.map((r) => r.name)).toEqual(['La de la tarde']);

    /* La misma copia, desde Ajustes › Tus datos, en otro PACE ya pasado por la bienvenida. */
    const otro = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, serviceWorkers: 'block' });
    const p2 = await otro.newPage();
    await sembrar(otro, { lang });
    await p2.goto('/index.html');
    await p2.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await p2.getByRole('button', { name: TXT[lang].ajustes }).filter({ visible: true }).first().click();
    await abrirTusDatos(p2);
    await p2.locator('input[type="file"][data-pace-traer-copia]').setInputFiles({
      name: 'pace-copia.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(COPIA)) });
    const recarga2 = p2.waitForEvent('load');
    await p2.locator('[data-pace-aj-aviso]').getByRole('button', { name: TXT[lang].si, exact: true }).click();
    await recarga2;
    await p2.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await p2.waitForTimeout(600);
    const desdeAjustes = await guardado(p2);
    await otro.close();

    /* Igual, salvo lo que la app escribe con el reloj al arrancar. */
    const sinReloj = (s) => { const c = Object.assign({}, s); delete c.lastActiveDay; delete c.lastOpenAt; delete c.sessionStartedAt; return c; };
    expect(sinReloj(desdeBienvenida), 'la copia traída desde la bienvenida no deja la app igual que desde Ajustes').toEqual(sinReloj(desdeAjustes));
    expect(errores, 'consola con errores').toEqual([]);
  });
}

test('3 · un archivo que no es una copia se dice en la bienvenida, que sigue donde estaba', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await aLaBienvenida(page, context, 'es');
  await entregar(page, page.locator('[data-pace-onb-copia]'), { hola: 'mundo' });
  await expect(page.locator('[data-pace-onb-copia-aviso]')).toHaveText(TXT.es.noEs);
  await expect(page.locator('[data-pace-aj-aviso]')).toHaveCount(0);
  await expect(page.locator('[data-pace-cta]').first(), 'la bienvenida se fue').toBeVisible();
  expect((await guardado(page)).firstSeen, 'un archivo que no es copia cambió algo').toBeNull();
});
