/* PACE · E2E · DE NOCHE EN AMÉRICA Y EN ASIA, TODO CAE EN TU DÍA (la octava, prueba 9, 12 nov. 2026)
 * ==========================================================================
 * La suite va en Madrid y casi siempre a mediodía, y ahí un día calculado en UTC en vez de en hora
 * local solo se nota entre las 00:00 y las 02:00. En Los Ángeles se nota cada tarde desde las 16:00
 * (UTC ya es mañana) y en Calcuta cada madrugada hasta las 05:30 (UTC aún es ayer). La ficha de
 * Play va también en español de Latinoamérica. Aquí, a esas horas: un vaso, un Foco entero y una
 * Respira, y todo tiene que caer en el día de quien la usa: la semana (`weeklyStats`), el historial
 * con hoy (`getHistoryWithToday`), el registro de sesiones (`localDay`) y «hoy» de la app.
 * Mutante: con `toISODate` leyendo la fecha en UTC (`toISOString().slice(0, 10)`), la clave del
 * historial cae en el día de al lado y la prueba lo dice.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, terminarBloque } = require('./helpers');

test.use({ serviceWorkers: 'block' });

/* El miércoles 18 de noviembre de 2026 a las 21:00 en Los Ángeles (en UTC, ya jueves) y el jueves 19 a
   la 01:30 en Calcuta (en UTC, aún miércoles). */
const CASOS = [
  { huso: 'America/Los_Angeles', hora: '2026-11-18T21:00:00-08:00', dia: '2026-11-18', indice: 2 },
  { huso: 'Asia/Kolkata', hora: '2026-11-19T01:30:00+05:30', dia: '2026-11-19', indice: 3 },
];

for (const c of CASOS) {
  test(c.huso + ', de noche: el vaso, el Foco y la Respira caen en el día local', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: test.info().project.use.baseURL, timezoneId: c.huso, locale: 'es-ES' });
    await sembrar(context);
    const page = await context.newPage();
    await page.clock.install({ time: new Date(c.hora) });
    await irAlArtefacto(page);
    expect(await page.evaluate(() => todayISO()), 'el «hoy» de la app').toBe(c.dia);

    await page.locator('[data-pace-sidebar]').getByRole('button', { name: /Añadir un vaso/ }).click();
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await terminarBloque(page);
    await expect(async () => {
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(0, { timeout: 1000 });
    }).toPass();
    await page.evaluate(() => completeBreathSession('breathe.box', 3, 0, null, true));

    const r = await page.evaluate(async () => {
      const s = getState();
      const h = getHistoryWithToday(s).days;
      const ev = JSON.parse((await window.eventsWebReadRaw()) || '{"events":[]}').events;
      return {
        semana: { agua: s.weeklyStats.waterGlasses, foco: s.weeklyStats.focusMinutes, respira: s.weeklyStats.breathMinutes },
        dias: Object.keys(h).filter((k) => h[k] && (h[k].focusMinutes || h[k].waterGlasses || h[k].breathMinutes)),
        hoy: h[todayISO()],
        sesiones: ev.filter((e) => e.type === 'session.completed').map((e) => e.localDay),
      };
    });
    const solo = (n) => [0, 0, 0, 0, 0, 0, 0].map((v, i) => (i === c.indice ? n : 0));
    expect(r.semana, 'la semana, en el día de la semana local').toEqual({ agua: solo(1), foco: solo(25), respira: solo(3) });
    expect(r.dias, 'el historial, solo en el día local').toEqual([c.dia]);
    expect(r.hoy, 'lo de hoy en el historial').toMatchObject({ focusMinutes: 25, waterGlasses: 1, breathMinutes: 3 });
    expect(r.sesiones, 'el registro, en el día local').toEqual([c.dia]);
    await context.close();
  });
}
