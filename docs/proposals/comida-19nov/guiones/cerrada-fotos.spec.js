'use strict';
const { test } = require('@playwright/test');
const path = require('path');
const { sembrar, irAlArtefacto } = require('./helpers');
const FASE = process.env.FASE || 'antes';
const a = (hhmm) => new Date('2026-10-14T' + hhmm + ':00+02:00');
for (const [w, h, lang] of [[1280, 720, 'es'], [360, 740, 'en']]) {
  test('foto ' + w + lang, async ({ page, context }) => {
    await page.setViewportSize({ width: w, height: h });
    await sembrar(context, { lang, ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 }, dia: { fecha: '2026-10-14', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
    await page.clock.install({ time: a('17:40') });
    await irAlArtefacto(page);
    await page.waitForTimeout(300);
    await page.locator('[data-pace-cta]').filter({ visible: true }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(__dirname, '..', 'docs', 'proposals', 'comida-19nov', 'fotos', '6-libre-' + w + '-' + lang + '-' + FASE + '.png') });
  });
}
