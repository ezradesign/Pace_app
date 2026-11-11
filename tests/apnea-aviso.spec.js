/* PACE · E2E · EL AVISO DE SEGURIDAD DE LA APNEA SE ACEPTA CADA VEZ (Ez, O5 A de la octava, 11 nov. 2026)
 * ======================================================================================================
 * La prueba 1 de la octava. Hasta hoy las pruebas aceptaban el aviso «si salía» (caza-sesiones), y
 * ninguna fallaba si dejaba de salir. Aquí:
 *  · toda rutina de Respira con retención larga o rondas de hiperventilación lleva `safety` (en el dato);
 *  · cada una, al abrirla desde la biblioteca, enseña el aviso con «Empezar sesión» apagado;
 *  · ni Escape ni Intro arrancan la sesión sin marcar la casilla;
 *  · aceptado una vez, vuelve a salir la siguiente (no se recuerda).
 * Las otras puertas, leídas en el código: la barra y «Continúa» pasan por la misma función que la
 * biblioteca (app/main.jsx, handleStartBreathe), los Caminos por PathBreatheSafetyGate, y la pausa y
 * «A tu ritmo» no proponen rutinas con aviso (pausa-propone.spec.js).
 * Mutante: con `if (false && routine.safety)` en handleStartBreathe (app/main.jsx) caen las dos de la app.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const MARCAS = { _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true };
const sesion = (page) => page.locator('[data-pace-session-root]');

/* Las rutinas de Respira, leídas de la fuente: nombre, patrón, ciclo y si llevan aviso. */
function rutinasRespira() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'app', 'breathe', 'BreatheLibrary.jsx'), 'utf8');
  return src.split('\n').filter((l) => /\{ id: 'breathe\./.test(l)).map((l) => ({
    id: /id: '([^']+)'/.exec(l)[1],
    nombre: /name: '([^']+)'/.exec(l)[1],
    patron: /pattern: '([^']+)'/.exec(l)[1],
    ciclo: (/cycle: \[([\d,\s]+)\]/.exec(l) || [, ''])[1].split(',').filter(Boolean).map(Number),
    aviso: /safety: true/.test(l),
  }));
}

test('toda rutina con retención larga o rondas de hiperventilación lleva el aviso', () => {
  const todas = rutinasRespira();
  expect(todas.length).toBeGreaterThan(15);
  /* Retención larga: sostener 8 s o más (Box 6 sostiene 6, el 4-7-8 siete: respiración pausada, sin aviso). */
  const piden = todas.filter((r) => ['rounds', 'co2', 'bhastrika', 'kapalabhati'].includes(r.patron) || r.ciclo[1] >= 8 || r.ciclo[3] >= 8);
  expect(piden.length).toBeGreaterThanOrEqual(7);
  expect(piden.filter((r) => !r.aviso).map((r) => r.id), 'rutinas con retención sin aviso de seguridad').toEqual([]);
});

test('cada rutina con aviso lo enseña al abrirla, y sin la casilla ni Escape ni Intro la empiezan', async ({ page, context }) => {
  test.setTimeout(120_000);
  await sembrar(context, MARCAS);
  await irAlArtefacto(page);
  const conAviso = rutinasRespira().filter((r) => r.aviso);
  expect(conAviso.length).toBe(7);
  for (const r of conAviso) {
    await page.getByRole('button', { name: /^Respira/ }).click();
    await page.getByRole('heading', { name: r.nombre, exact: true }).click();
    const modal = overlaySuperior(page);
    const empezar = modal.getByRole('button', { name: 'Empezar sesión' });
    await expect(empezar, r.nombre + ': no salió el aviso de seguridad').toBeVisible();
    await expect(empezar, r.nombre + ': «Empezar sesión» no está apagado sin la casilla').toBeDisabled();
    await empezar.focus().catch(() => {});
    await page.keyboard.press('Enter');
    await expect(sesion(page), r.nombre + ': Intro empezó la sesión sin la casilla').toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(empezar, r.nombre + ': Escape no cerró el aviso').toHaveCount(0);
    await expect(sesion(page), r.nombre + ': Escape empezó la sesión').toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pace-modal-backdrop]')).toHaveCount(0);
  }
});

test('aceptado una vez, el aviso vuelve a salir la siguiente', async ({ page, context }) => {
  await sembrar(context, MARCAS);
  await irAlArtefacto(page);
  for (let vez = 1; vez <= 2; vez++) {
    await page.getByRole('button', { name: /^Respira/ }).click();
    await page.getByRole('heading', { name: 'Rondas express', exact: true }).click();
    const modal = overlaySuperior(page);
    await expect(modal.getByRole('button', { name: 'Empezar sesión' }), 'vez ' + vez + ': no salió el aviso').toBeDisabled();
    await modal.getByText('Lo he leído y asumo mi responsabilidad').click();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
    await expect(sesion(page)).toHaveCount(1);
    await page.reload();
    await expect(sesion(page)).toHaveCount(0);
  }
});
