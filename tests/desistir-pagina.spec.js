/* PACE · E2E · PACEGRASS.APP/DESISTIR, LA PÁGINA (punto 16 del ROADMAP)
 * ====================================================================
 * Ez, 1A del 30 oct. 2026: «Desistir del contrato aquí» lleva a esta página (desistir/index.html), que
 * pide el nombre, la compra y el correo para el acuse, y se confirma con «Confirmar desistimiento»
 * (art. 11 bis de la Directiva 2011/83). Pregunta a /api/desistir, que aquí hace `page.route` (la
 * función la prueba desistir-funcion.spec.js, en Node).
 *
 * QUE DEFIENDE: cerrada (sin llave de correo) manda desistir por correo y no enseña el formulario;
 * abierta no manda nada sin nombre y correo; confirmada enseña el acuse con lo dicho, la fecha, la
 * hora y la referencia, dice si salió el correo y deja descargarlo; si no llegó a Ez, lo dice; el
 * inglés; y que el borrador del desistimiento lleva aquí. Contra 5cd9ae62 caen todas: no hay página.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

test.use({ serviceWorkers: 'block' });

const ACUSE = { ok: true, referencia: 'D-1A2B3C4D', fecha: '2026-10-30T16:42:00.000Z', fechaTexto: '30 de octubre de 2026 a las 17:42 (hora de Madrid)', acuse: true };

/* La función falsa: `abierta` para el GET y lo que contesta al POST; apunta lo que se le manda. */
async function conFuncion(page, abierta, post) {
  const mandados = [];
  await page.route('**/api/desistir', (r) => {
    if (r.request().method() === 'GET') {
      return r.fulfill({ status: abierta ? 200 : 503, contentType: 'application/json', body: JSON.stringify({ abierta: !!abierta }) });
    }
    mandados.push(r.request().postDataJSON());
    const p = post || { status: 200, body: ACUSE };
    return r.fulfill({ status: p.status, contentType: 'application/json', body: JSON.stringify(p.body) });
  });
  return mandados;
}

async function rellenar(page) {
  await page.fill('[data-desistir-nombre]', 'Lucía Pérez');
  await page.fill('[data-desistir-correo]', 'lucia@correo.es');
  await page.fill('[data-desistir-recibo]', '1653-2453');
  await page.check('#dst-mes');
  await page.click('[data-desistir-boton]');
}

test('cerrada: sin la llave del correo, manda desistir por correo y no enseña el formulario', async ({ page }) => {
  await conFuncion(page, false);
  await page.goto('/desistir/');
  await expect(page.locator('h1:visible')).toHaveText('Desistir del contrato');
  await expect(page.locator('[data-desistir-cerrada]')).toBeVisible();
  await expect(page.locator('[data-desistir-form]')).toBeHidden();
  await expect(page.locator('.caja a[href="mailto:hola.ezradesign@gmail.com"]')).toBeVisible();
  await expect(page.locator('.caja a[href="/legal/desistimiento/"]')).toHaveText('desistimiento y devolución');
});

test('abierta: el formulario, «Confirmar desistimiento», y nada sale sin nombre y correo', async ({ page }) => {
  const mandados = await conFuncion(page, true);
  await page.goto('/desistir/');
  await expect(page.locator('[data-desistir-form]')).toBeVisible();
  await expect(page.locator('[data-desistir-cerrada]')).toBeHidden();
  await expect(page.locator('label[for="dst-nombre"]')).toHaveText('Tu nombre');
  await expect(page.locator('label[for="dst-correo"]')).toHaveText('El correo con el que pagaste');
  await expect(page.locator('[data-desistir-boton]')).toHaveText('Confirmar desistimiento');
  await page.click('[data-desistir-boton]');
  await expect(page.locator('[data-desistir-fallo]')).toHaveText('Escribe tu nombre y el correo con el que pagaste.');
  await page.fill('[data-desistir-nombre]', 'Lucía Pérez');
  await page.fill('[data-desistir-correo]', 'lucia');
  await page.click('[data-desistir-boton]');
  await expect(page.locator('[data-desistir-fallo]')).toHaveAttribute('data-motivo', 'formato');
  expect(mandados).toHaveLength(0);
});

test('confirmado: el acuse con lo dicho, la fecha, la hora y la referencia, y se puede descargar', async ({ page }) => {
  const mandados = await conFuncion(page, true);
  await page.goto('/desistir/');
  await rellenar(page);
  await expect(page.locator('h1:visible')).toHaveText('Hemos recibido tu desistimiento.');
  expect(mandados).toEqual([{ nombre: 'Lucía Pérez', correo: 'lucia@correo.es', recibo: '1653-2453', plan: 'mes', idioma: 'es', web: '' }]);
  await expect(page.locator('[data-desistir-correo-estado]')).toHaveText('Te hemos mandado este acuse a lucia@correo.es. Guárdalo.');
  await expect(page.locator('[data-acuse-nombre]')).toHaveText('Lucía Pérez');
  await expect(page.locator('[data-acuse-recibo]')).toHaveText('1653-2453');
  await expect(page.locator('[data-acuse-plan]')).toHaveText('Al mes');
  await expect(page.locator('[data-acuse-fecha]')).toHaveText(ACUSE.fechaTexto);
  await expect(page.locator('[data-acuse-referencia]')).toHaveText('D-1A2B3C4D');
  await expect(page.locator('[data-desistir-form]')).toBeHidden();
  const [bajada] = await Promise.all([page.waitForEvent('download'), page.click('[data-desistir-bajar]')]);
  expect(bajada.suggestedFilename()).toBe('PACE-desistimiento-D-1A2B3C4D.txt');
  const texto = fs.readFileSync(await bajada.path(), 'utf8');
  expect(texto).toContain('Fecha y hora: ' + ACUSE.fechaTexto);
  expect(texto).toContain('Referencia: D-1A2B3C4D');
});

test('si el acuse no salió por correo, lo dice y lo enseña para guardarlo', async ({ page }) => {
  await conFuncion(page, true, { status: 200, body: Object.assign({}, ACUSE, { acuse: false }) });
  await page.goto('/desistir/');
  await rellenar(page);
  const estado = page.locator('[data-desistir-correo-estado]');
  await expect(estado).toContainText('no hemos podido mandarte el correo');
  await expect(estado).toHaveClass(/mal/);
  await expect(page.locator('[data-acuse-referencia]')).toHaveText('D-1A2B3C4D');
});

test('si no llegó a Ez, dice que aún no ha llegado y manda escribir', async ({ page }) => {
  await conFuncion(page, true, { status: 502, body: { ok: false, motivo: 'envio' } });
  await page.goto('/desistir/');
  await rellenar(page);
  await expect(page.locator('[data-desistir-fallo]')).toContainText('aún no nos ha llegado');
  await expect(page.locator('[data-desistir-listo]')).toBeHidden();
});

test('en inglés', async ({ page }) => {
  await conFuncion(page, true, { status: 200, body: Object.assign({}, ACUSE, { fechaTexto: '30 October 2026 at 17:42 (Madrid time)' }) });
  await page.goto('/desistir/?lang=en');
  await expect(page.locator('h1:visible')).toHaveText('Withdraw from the contract');
  await expect(page.locator('[data-desistir-boton]')).toHaveText('Confirm withdrawal');
  await rellenar(page);
  await expect(page.locator('h1:visible')).toHaveText('We have received your withdrawal.');
  await expect(page.locator('[data-desistir-correo-estado]')).toHaveText('We have sent this acknowledgement to lucia@correo.es. Keep it.');
  await expect(page.locator('[data-acuse-plan]')).toHaveText('Monthly');
});

test('el borrador del desistimiento lleva a esta página, en los dos idiomas', async () => {
  const borrador = fs.readFileSync(path.join(__dirname, '..', 'legal', 'desistimiento', 'index.html'), 'utf8');
  expect(borrador.match(/href="\/desistir\/"/g) || []).toHaveLength(2);
  expect(borrador).toContain('«Desistir del contrato aquí»');
  expect(borrador).toContain('«Confirmar desistimiento»');
});
