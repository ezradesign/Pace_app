/* PACE · E2E · LA COPIA RECORDADA, SOLO EN LA WEB SIN INSTALAR (Ez, «A+B», 16 nov. 2026)
 * =====================================================================================
 * Auditoría externa del 10 nov., 2.T6: sin cuentas, la copia es lo único que salva la historia y el
 * código, y Safari borra lo guardado de una web sin visitas en siete días (salvo instalada).
 *  A · Bajo «Exportar una copia», en la línea pequeña de la fila, cuándo fue la última copia y el
 *      aviso de Safari. Sin copia nunca hecha lo dice así, sin fecha. «Tus datos» sigue sin scroll a
 *      360 × 640 y 360 × 740, en castellano y en inglés, también con la letra al 115 % (emulada como
 *      en home-sin-scroll: cada letra del panel ×1,15).
 *  B · En el sobre, «Guarda una copia» como mucho una vez al mes: a los 30 días de la última copia (o
 *      de empezar, sin ninguna) y del último aviso. Leída, sigue en la hoja ese día y luego se va. No
 *      tapa nada: es el icono del sobre en la barra, y no pisa a sus vecinos.
 * Ni A ni B en las apps ni con PACE instalada.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, MEDIODIA } = require('./helpers');

const PANEL = '[data-pace-tweaks-panel]';
const DIA = 86400000;
const TX = {
  es: { abrir: 'Abrir ajustes', datos: 'Copias, borrar y PACE completo', nunca: 'Aún no has guardado ninguna copia.', safari: 'Sin instalar, Safari' },
  en: { abrir: 'Open settings', datos: 'Copies, data deletion and PACE Complete', nunca: 'You haven’t saved a copy yet.', safari: 'If PACE isn’t installed, Safari' },
};

/* PACE instalada: el navegador ya no dice `display-mode: browser`. */
async function comoInstalada(context) {
  await context.addInitScript(() => {
    const orig = window.matchMedia.bind(window);
    window.matchMedia = (q) => (/display-mode:\s*browser/.test(q) ? Object.assign(orig(q), { matches: false }) : orig(q));
  });
}

async function abrirDatos(page, lang) {
  await page.locator('button[aria-label="' + TX[lang].abrir + '"]').filter({ visible: true }).first().click();
  await expect(page.locator(PANEL)).toBeVisible();
  const enlace = page.locator(PANEL).getByRole('button', { name: TX[lang].datos });
  if (await enlace.isVisible()) await enlace.click();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(450);
}

const linea = (page) => page.locator(PANEL + ' [data-pace-aj-copia]');

test('copia-1 · sin copia lo dice sin fecha; al exportar, «hoy»; con una de hace 40 días, «hace 40 días»', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await sembrar(context, { soundOn: false });
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await abrirDatos(page, 'es');
  await expect(linea(page)).toHaveText(TX.es.nunca + ' Sin instalar, Safari puede borrar lo guardado si pasas una semana sin abrir PACE.');
  const bajada = page.waitForEvent('download');
  await page.locator(PANEL).getByRole('button', { name: /Exportar/ }).click();
  const archivo = await bajada;
  await expect(linea(page)).toContainText('Última copia: hoy.');
  const guardada = await page.evaluate(() => getState().ultimaCopia);
  expect(Math.abs(guardada - MEDIODIA.getTime()), 'la fecha de la copia no es la de ahora').toBeLessThan(60000);
  /* La copia lleva su propia fecha: quien la importe en otro móvil sabe de cuándo es su última copia. */
  const fs = require('fs');
  const dentro = JSON.parse(fs.readFileSync(await archivo.path(), 'utf8'));
  expect(dentro.state.ultimaCopia).toBe(guardada);

  await page.evaluate((ms) => setState({ ultimaCopia: ms }), MEDIODIA.getTime() - 40 * DIA);
  await expect(linea(page)).toContainText('Última copia: hace 40 días.');
});

for (const lang of ['es', 'en']) for (const alto of [640, 740]) for (const letra of [1, 1.15]) {
  test(`copia-2 · «Tus datos» con la línea cabe sin scroll · ${lang} 360×${alto}${letra > 1 ? ' con la letra al 115 %' : ''}`, async ({ page, context }) => {
    await page.setViewportSize({ width: 360, height: alto });
    await sembrar(context, { lang });
    await irAlArtefacto(page);
    await abrirDatos(page, lang);
    await expect(linea(page)).toContainText(TX[lang].nunca);
    await expect(linea(page)).toContainText(TX[lang].safari);
    if (letra > 1) {
      await page.evaluate(([sel, f]) => {
        const els = Array.from(document.querySelectorAll(sel + ' *'));
        const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
        els.forEach((e, i) => e.style.setProperty('font-size', (tam[i] * f) + 'px', 'important'));
      }, [PANEL, letra]);
      await page.waitForTimeout(150);
    }
    const m = await page.evaluate((sel) => {
      const p = document.querySelector(sel);
      const l = p.querySelector('[data-pace-aj-copia]').getBoundingClientRect();
      const r = p.getBoundingClientRect();
      /* Lo que aún cabe: la hoja crece hasta su `max-height` y solo entonces pide scroll. */
      const tope = parseFloat(getComputedStyle(p).maxHeight);
      return { scroll: p.scrollHeight - p.clientHeight, dentro: l.top >= r.top && l.bottom <= r.bottom,
        holgura: isFinite(tope) ? Math.round(tope - p.scrollHeight) : null };
    }, PANEL);
    test.info().annotations.push({ type: 'medida', description: `caben aún ${m.holgura} px` });
    expect(m.scroll, `«Tus datos» pide ${m.scroll} px de scroll con la línea de la copia`).toBeLessThanOrEqual(0);
    expect(m.dentro, 'la línea de la copia no se ve entera').toBe(true);
  });
}

test('copia-3 · instalada no sale ni la línea ni el aviso del sobre', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await sembrar(context, { copiaAvisoVisto: null, firstSeen: MEDIODIA.getTime() - 60 * DIA });
  await comoInstalada(context);
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await expect(page.locator('[data-pace-sobre-de="copia"]')).toHaveCount(0);
  await abrirDatos(page, 'es');
  await expect(page.locator(PANEL).getByRole('button', { name: /Exportar/ })).toBeVisible();
  await expect(linea(page)).toHaveCount(0);
});

/* El sobre, a mediodía de hoy: `firstSeen` y la última copia, en días antes. */
async function conSobre(page, context, extra) {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, Object.assign({ copiaAvisoVisto: null }, extra));
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
}
const avisoCopia = (page) => page.locator('[data-pace-sobre-de="copia"]');

test('copia-4 · sin copia en un mes, el sobre la pide; leída, sigue ese día y no vuelve hasta el mes siguiente', async ({ page, context }) => {
  await conSobre(page, context, { firstSeen: MEDIODIA.getTime() - 40 * DIA });
  const sobre = avisoCopia(page);
  await expect(sobre, 'el sobre no pidió la copia').toHaveAttribute('data-pace-sobre', 'cerrado');
  /* No pisa a sus vecinos de la barra. */
  const pisa = await page.evaluate(() => {
    const s = document.querySelector('[data-pace-sobre-de="copia"]').getBoundingClientRect();
    return Array.from(document.querySelectorAll('[data-pace-topbar-icon]')).filter((b) => !b.hasAttribute('data-pace-sobre')).some((b) => {
      const r = b.getBoundingClientRect();
      return r.width && r.left < s.right - 1 && s.left < r.right - 1 && r.top < s.bottom - 1 && s.top < r.bottom - 1;
    });
  });
  expect(pisa, 'el sobre se pone encima de otro icono de la barra').toBe(false);
  await sobre.click();
  const item = page.locator('[data-pace-sobre-item="copia"]');
  await expect(item).toContainText('Guarda una copia');
  await expect(item).toContainText('Aún no has guardado ninguna copia.');
  await expect(item).toContainText('Instalada, PACE no se borra.');
  await expect.poll(() => page.evaluate(() => getState().copiaAvisoVisto)).toBe(await page.evaluate(() => todayISO()));
  await page.keyboard.press('Escape');
  /* El mismo día sigue, leída: el sobre abierto. */
  await expect(avisoCopia(page)).toHaveAttribute('data-pace-sobre', 'abierto');
  /* Diez días después ya no está; a los treinta y uno vuelve. */
  await page.clock.fastForward(10 * DIA);
  await page.evaluate(() => setState({}));
  await expect(avisoCopia(page)).toHaveCount(0);
  await page.clock.fastForward(21 * DIA);
  await page.evaluate(() => setState({}));
  await expect(avisoCopia(page)).toHaveAttribute('data-pace-sobre', 'cerrado');
});

test('copia-5 · con una copia de hace menos de un mes, o empezando hace menos de un mes, el sobre no la pide', async ({ page, context }) => {
  await conSobre(page, context, { firstSeen: MEDIODIA.getTime() - 90 * DIA, ultimaCopia: MEDIODIA.getTime() - 12 * DIA });
  await expect(avisoCopia(page)).toHaveCount(0);
  await page.evaluate((ms) => setState({ ultimaCopia: ms }), MEDIODIA.getTime() - 45 * DIA);
  await expect(avisoCopia(page), 'CONTROL: con la copia de hace 45 días, el sobre la pide').toHaveCount(1);
  await page.evaluate((ms) => setState({ ultimaCopia: null, firstSeen: ms }), MEDIODIA.getTime() - 10 * DIA);
  await expect(avisoCopia(page), 'a los diez días de empezar ya pedía la copia').toHaveCount(0);
});
