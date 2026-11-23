/* PACE · desde v1, «Repetir» y «Continúa» no abren lo que es de PACE completo
 * =========================================================================
 * Caza del 23 nov. 2026. Con `PREMIUM_ABIERTO_HASTA_V1` en false y la semana de prueba acabada, la
 * tarjeta de la barra lateral ofrecía repetir la última rutina aunque fuera de pago (una hecha durante
 * la semana de prueba) y la abría: Mueve y Estira, directa a la ficha y a la sesión; Respira, a su aviso
 * de seguridad. La sugerencia ya pasaba por el guard; repetir, no. Y una sesión de Respira de pago a
 * medias se ofrecía para seguir, cuando la de Mueve y Estira ya no.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 86400000;

async function enV1SinPrueba(context) {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
  });
  const ahora = Date.now();
  await sembrar(context, {
    sidebarCollapsed: false, lastActiveDay: new Date().toDateString(), _historyMigrated: true,
    _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
    pasoV1: { at: ahora - 10 * DIA, hasta: ahora - 3 * DIA, previo: true, rutinas: [], avisado: true, finVisto: true },
  });
}

async function ultimaSesion(page, rid, mod) {
  await irAlArtefacto(page);
  await page.evaluate(([r, m]) => {
    window.paceEventsAppend(window.makeEvent({
      type: 'session.completed', context: 'standalone', runId: window.newEventId(),
      payload: { module: m, routineId: r, completionReason: 'natural', elapsedSeconds: 300, activeSeconds: 300,
        plannedSeconds: 300, plannedSecondsSource: 'declared', variant: null },
    }));
  }, [rid, mod]);
  await esperarEnPagina(page, async () => (JSON.parse((await window.eventsWebReadRaw()) || '{}').events || []).length > 0, null, { timeout: 5000 });
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.waitForFunction(() => (((window.paceEventsSnapshot && window.paceEventsSnapshot()) || {}).events || []).length > 0, null, { timeout: 30000 });
}

for (const [rid, mod] of [['extra.core.stealth', 'move'], ['breathe.co2', 'breathe']]) {
  test('v1-repetir · la última, de pago (' + rid + '): ni se ofrece ni se abre', async ({ page, context }) => {
    await enV1SinPrueba(context);
    await ultimaSesion(page, rid, mod);
    expect(await page.evaluate((r) => window.canAccessRoutine(r), rid)).toBe(false);
    const accion = page.locator('[data-pace-sidebar-accion]');
    await expect(accion).toBeVisible();
    await expect(accion).not.toHaveAttribute('data-kind', 'repeat');
    // Y la puerta, aunque alguien la llame con ese id.
    await page.evaluate((r) => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'repeat', targetId: r } })), rid);
    await page.waitForTimeout(800);
    await expect(page.locator('[data-pace-modal-card]').filter({ visible: true })).toHaveCount(0);
    await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
  });
}

test('v1-repetir · una abierta sigue ofreciéndose para repetir', async ({ page, context }) => {
  await enV1SinPrueba(context);
  await ultimaSesion(page, 'breathe.box.4', 'breathe');
  await expect(page.locator('[data-pace-sidebar-accion]')).toHaveAttribute('data-kind', 'repeat');
});

test('v1-repetir · Respira de pago a medias no se ofrece para seguir', async ({ page, context }) => {
  await enV1SinPrueba(context);
  const ahora = Date.now();
  await context.addInitScript((t) => {
    localStorage.setItem('pace.breathe.v1', JSON.stringify({ v: 1, routineId: 'breathe.co2', savedAt: t - 60000, startedAt: t - 120000,
      activeMs: 60000, round: 1, breaths: 3, holdSec: 0 }));
  }, ahora);
  await irAlArtefacto(page);
  expect(await page.evaluate(() => window.leerRespiraGuardada())).toBeNull();
  await expect(page.locator('[data-pace-sidebar-accion][data-kind="resume"]')).toHaveCount(0);
});
