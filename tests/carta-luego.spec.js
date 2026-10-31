/* PACE · E2E · LA CARTA DEL LUNES, PARA LUEGO, Y EL SOBRE (Ez, 30 oct. 2026: 1A)
 * ==============================================================================
 * U3 de las revisiones de ChatGPT del 28 oct. (docs/audits/chatgpt-28oct/): la carta se abría sola
 * y no se podía cerrar sin contestar. Ez eligió la 1A mirando la app real con la propuesta dentro:
 * la carta sale sola el lunes como antes, ahora con la × de todas las ventanas (también Escape o
 * tocar fuera), y cerrarla no dice ni sí ni no. Queda en un SOBRE arriba, junto a Estadísticas:
 * cerrado (con su lacre) mientras está sin contestar, abierto cuando ya se contestó. Tocarlo la
 * abre otra vez, igual; contestada, se lee sin botones. La semana que acaba sin contestar no
 * cambia nada ni cuenta como un «no».
 *
 * Contra la 0.187.0 cae entera: la carta no tenía × ni había sobre.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const LUNES = new Date(2026, 9, 19, 8, 30);   /* repasa del 12 al 18 de octubre */
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const GEMELOS = { tipo: 'descansa', clase: 'rutinas', id: 'extra.calves', modulo: 'mueve', veces: 4, semanas: 1, paradas: 4 };
const CORTA = { tipo: 'corta', clase: 'forma', hora: 945, modulo: 'estira', min: 2, veces: 3, semanas: 1, paradas: 5 };

const visible = (page, sel) => page.locator(sel).filter({ visible: true });
const ritmo = (page) => page.evaluate(() => getState().ritmo);

async function abrir(page, context, extra, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await sembrar(context, Object.assign({ ritmo: { horario: HORARIO, libre: true } }, extra || {}));
  await page.clock.install({ time: LUNES });
  await irAlArtefacto(page);
}

function ponerCarta(page, cambios, lunes, extra) {
  return page.evaluate(([cambios, lunes, extra]) => {
    const barras = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ d, hechas: d < 6 ? 5 : 0, total: d < 6 ? 7 : 0 }));
    const res = { semana: { lunes: lunes, desde: '2026-10-12', hasta: '2026-10-18' }, dias: 5, carta: true,
                  ayudo: ['move.shoulder.circles'], hechas: 25, total: 35, barras, cambios };
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, {
      carta: Object.assign({ lunes: lunes, res, vista: null, respuesta: null, hora: null }, extra || {}) }) }));
  }, [cambios, lunes || '2026-10-19', extra || null]);
}

test('la × la deja para luego: no aplica ni rechaza nada, y espera en el sobre cerrado hasta contestarla', async ({ page, context }) => {
  await abrir(page, context);
  await ponerCarta(page, [GEMELOS, CORTA]);
  const carta = page.locator('[data-pace-carta]');
  await expect(carta).toBeVisible();
  await carta.locator('xpath=ancestor::*[@data-pace-modal-card]').locator('[data-pace-modal-close]').click();
  await expect(carta).toHaveCount(0);
  let r = await ritmo(page);
  expect([r.carta.respuesta, r.carta.vista, r.carta.luego]).toEqual([null, null, '2026-10-19']);
  expect(r.aprendido || null, 'cerrarla no toca lo aprendido').toBeNull();

  const sobre = visible(page, '[data-pace-sobre]');
  await expect(sobre).toHaveAttribute('data-pace-sobre', 'cerrado');
  await expect(sobre).toHaveAccessibleName('La carta de tu semana, sin leer');

  /* Con la carta sin contestar se empieza un Foco, y no vuelve a salir sola. */
  await visible(page, '[data-pace-cta]').first().click();
  await expect(visible(page, '[data-pace-cta]').first()).toHaveText('Pausar');
  await page.clock.runFor(2000);
  await expect(carta).toHaveCount(0);

  /* El sobre la abre igual, con los mismos cambios; «Vale» los aplica y el sobre se abre. */
  await sobre.click();
  await expect(carta).toBeVisible();
  await expect(page.locator('[data-pace-carta-cambio="descansa"]')).toHaveText('Gemelos subrepticios, que cambiaste cuatro veces, descansa un mes.');
  await expect(page.locator('[data-pace-carta-cambio="corta"]')).toHaveText('La pausa de las 15:45, que saltaste tres días, pasa a ser de 2 minutos.');
  await page.locator('[data-pace-carta-si]').click();
  await expect(carta).toHaveCount(0);
  r = await ritmo(page);
  expect([r.carta.respuesta, r.carta.vista]).toEqual(['vale', '2026-10-19']);
  expect(r.aprendido.descansa).toEqual({ 'extra.calves': '2026-11-16' });
  await expect(sobre).toHaveAttribute('data-pace-sobre', 'abierto');
  await expect(sobre).toHaveAccessibleName('La carta de tu semana');
});

test('dejada para luego, al volver a PACE no sale sola: espera en el sobre', async ({ page, context }) => {
  await abrir(page, context);
  await ponerCarta(page, [GEMELOS]);
  await expect(page.locator('[data-pace-carta]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pace-carta]')).toHaveCount(0);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.clock.runFor(4000);
  await expect(page.locator('[data-pace-carta]'), 'no vuelve sola').toHaveCount(0);
  await expect(visible(page, '[data-pace-sobre]')).toHaveAttribute('data-pace-sobre', 'cerrado');
});

test('Escape y tocar fuera también la dejan para luego', async ({ page, context }) => {
  await abrir(page, context);
  await ponerCarta(page, [GEMELOS]);
  const carta = page.locator('[data-pace-carta]');
  await expect(carta).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(carta).toHaveCount(0);
  await visible(page, '[data-pace-sobre]').click();
  await expect(carta).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(carta).toHaveCount(0);
  const r = await ritmo(page);
  expect([r.carta.respuesta, r.carta.vista, r.carta.luego]).toEqual([null, null, '2026-10-19']);
});

test('el sobre abierto enseña la carta ya contestada, sin botones que la cambien', async ({ page, context }) => {
  await abrir(page, context);
  await ponerCarta(page, [GEMELOS]);
  await page.locator('[data-pace-carta-no]').click();
  await expect(page.locator('[data-pace-carta]')).toHaveCount(0);
  const sobre = visible(page, '[data-pace-sobre]');
  await expect(sobre).toHaveAttribute('data-pace-sobre', 'abierto');
  await sobre.click();
  const carta = page.locator('[data-pace-carta]');
  await expect(carta).toBeVisible();
  await expect(carta).toHaveAttribute('data-pace-carta', 'leida');
  await expect(carta).toContainText('La dejaste como estaba.');
  await expect(page.locator('[data-pace-carta-si], [data-pace-carta-no]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(carta).toHaveCount(0);
  const r = await ritmo(page);
  expect([r.carta.respuesta, r.carta.vista]).toEqual(['dejar', '2026-10-19']);

  /* Con «Vale», la carta leída repite los cambios que ya están en tu semana. */
  await page.evaluate(() => setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { carta: null, aprendido: null }) })));
  await ponerCarta(page, [GEMELOS]);
  await page.locator('[data-pace-carta-si]').click();
  await expect(carta).toHaveCount(0);
  await sobre.click();
  await expect(carta).toHaveAttribute('data-pace-carta', 'leida');
  await expect(page.locator('[data-pace-carta-cambio="descansa"]')).toBeVisible();
  await expect(page.locator('[data-pace-carta-si], [data-pace-carta-no]')).toHaveCount(0);
});

test('sin carta esta semana o sin PACE completo no hay sobre; la de la semana pasada se va sin cambiar nada', async ({ page, context }) => {
  await abrir(page, context);
  await page.clock.runFor(3500);
  await expect(page.locator('[data-pace-sobre]'), 'sin carta').toHaveCount(0);

  await ponerCarta(page, [GEMELOS], '2026-10-12', { luego: '2026-10-13' });
  await page.clock.runFor(1500);
  await expect(page.locator('[data-pace-carta]'), 'la de la semana pasada no sale').toHaveCount(0);
  await expect(page.locator('[data-pace-sobre]'), 'ni deja sobre').toHaveCount(0);
  expect((await ritmo(page)).aprendido || null).toBeNull();

  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
  await ponerCarta(page, [GEMELOS], '2026-10-19', { luego: '2026-10-19' });
  await page.clock.runFor(1500);
  await expect(page.locator('[data-pace-sobre]'), 'sin PACE completo').toHaveCount(0);
});

test('en inglés el sobre dice lo mismo', async ({ page, context }) => {
  await abrir(page, context, { lang: 'en', langAuto: false });
  await ponerCarta(page, [GEMELOS], '2026-10-19', { luego: '2026-10-19' });
  await expect(visible(page, '[data-pace-sobre]')).toHaveAccessibleName('Your week’s letter, unread');
});

/* Un icono más arriba: no pisa la pill de Foco · Pausa · Larga donde se ve (la tableta en vertical
   y el escritorio estrecho), ni el menú del móvil. */
for (const vp of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 720 }]) {
  test('el sobre no pisa nada a ' + vp.width + '×' + vp.height, async ({ page, context }) => {
    await abrir(page, context, null, vp);
    await ponerCarta(page, [GEMELOS], '2026-10-19', { luego: '2026-10-19' });
    await expect(visible(page, '[data-pace-sobre]')).toBeVisible();
    const cruces = await page.evaluate(() => {
      const sobre = Array.from(document.querySelectorAll('[data-pace-sobre]')).find((e) => e.getBoundingClientRect().width > 0);
      const rs = sobre.getBoundingClientRect();
      return Array.from(document.querySelectorAll('button, a, [role="button"], [data-pace-tabs]'))
        .filter((el) => el !== sobre && !sobre.contains(el) && el.getBoundingClientRect().width > 0)
        .map((el) => {
          const r = el.getBoundingClientRect();
          const x = Math.min(r.right, rs.right) - Math.max(r.left, rs.left);
          const y = Math.min(r.bottom, rs.bottom) - Math.max(r.top, rs.top);
          return x > 0.5 && y > 0.5 ? (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30) : null;
        }).filter(Boolean);
    });
    expect(cruces).toEqual([]);
  });
}
