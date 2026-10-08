/* PACE · la app en inglés, tras la caza de bugs del 7 de octubre
 * ==============================================================
 * Una prueba por cada arreglo de la parte en inglés (ingles-N en
 * `docs/traspaso/CAZA_BUGS_7OCT.md`), cada una con el defecto que vio la caza:
 * todas salen rojas contra la app de antes y verdes con el arreglo. Las que se
 * leen en pantalla se leen en pantalla; las que dependen de un escenario largo
 * (la pausa de «A tu ritmo», el cierre de una sesión) lo recorren con el reloj
 * de Playwright, como las pruebas de las que copian el escenario.
 *
 * Decisiones de Ez del 8 de octubre que se defienden aquí: en inglés suena el
 * tono y no la voz castellana (ingles-2); cambiar de modo arriba con un Foco
 * empezado pregunta antes (ingles-3); la pestaña sigue al idioma y la PWA se
 * llama «PACE» (ingles-6); «stamp» para el sello (ingles-14).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

const EN = { lang: 'en' };

async function abrirBiblioteca(page, nombre) {
  await page.getByRole('button', { name: new RegExp('^' + nombre) }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(300);
}

/* ingles-1 */
test('ingles-1 · el aviso de seguridad se titula como la tarjeta', async ({ page, context }) => {
  await sembrar(context, EN);
  await irAlArtefacto(page);
  await abrirBiblioteca(page, 'Breathe');
  await page.getByRole('heading', { name: 'Express Rounds', exact: true }).first().click();
  await expect(overlaySuperior(page).locator('h3')).toHaveText('Express Rounds');
});

/* ingles-2 */
test('ingles-2 · en inglés suena el tono, y Ajustes dice que la voz habla castellano', async ({ page, context }) => {
  await sembrar(context, Object.assign({ soundOn: true, voiceOn: true, voice: 'sulafat' }, EN));
  await irAlArtefacto(page);
  const voz = () => page.evaluate(() => ({
    encendida: paceVozEncendida(),
    cabe: ['breathe.inhale', 'breathe.hold', 'breathe.exhale'].map((s) => paceVozCabe(s, 6)),
  }));
  expect(await voz(), 'con la app en inglés suena la voz castellana').toEqual({ encendida: false, cabe: [false, false, false] });
  /* La elección se guarda: al volver al castellano la voz vuelve sola. */
  expect((await page.evaluate(() => getState())).voiceOn).toBe(true);
  await page.evaluate(() => setState({ lang: 'es' }));
  expect((await voz()).encendida, 'en castellano la voz tiene que volver').toBe(true);
  await page.evaluate(() => setState({ lang: 'en' }));
  await page.keyboard.press('t');
  const fila = page.locator('[data-pace-aj-fila="signal"]');
  await expect(fila.locator('.pace-aj-sub')).toHaveText('The voice only speaks Spanish: in English you hear the tone');
});

/* ingles-3 */
test('ingles-3 · arriba dice Break y Long break, y con un Foco empezado pregunta antes de cambiar', async ({ page, context }) => {
  await sembrar(context, EN);
  await page.clock.install();
  await irAlArtefacto(page);
  const tabs = page.locator('[data-pace-tabs] button');
  await expect(tabs).toHaveText(['Focus', 'Break', 'Long break']);
  const modo = () => page.evaluate(() => getState().focusMode);
  /* Sin bloque empezado, cambia sin preguntar. */
  await tabs.nth(1).click();
  expect(await modo()).toBe('pausa');
  await tabs.nth(0).click();
  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  await page.clock.fastForward(5 * 60 * 1000);
  await tabs.nth(1).click();
  const dialogo = page.getByRole('dialog', { name: 'Switch to a short break?' });
  await expect(dialogo, 'el bloque se perdía sin preguntar').toBeVisible();
  await expect(dialogo).toContainText('it is lost and does not count');
  expect(await modo()).toBe('foco');
  /* «Keep focusing» deja el bloque como estaba. */
  await dialogo.getByRole('button', { name: 'Keep focusing', exact: true }).click();
  await expect(dialogo).toHaveCount(0);
  expect(await modo()).toBe('foco');
  await expect(page.locator('[data-pace-dial-fit]')).toHaveAttribute('data-pace-dial-running', '');
  /* En pausa también pregunta; «Switch» cambia. (Con Espacio no: al cerrar el
     diálogo el foco vuelve a la pestaña «Break» y Espacio la pulsaría.) */
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await tabs.nth(2).click();
  const larga = page.getByRole('dialog', { name: 'Switch to a long break?' });
  await larga.getByRole('button', { name: 'Switch', exact: true }).click();
  expect(await modo()).toBe('larga');
});

/* ingles-4 */
test('ingles-4 · la cabecera de Estira dice la categoría y no la etiqueta interna', async ({ page, context }) => {
  await sembrar(context, EN);
  await irAlArtefacto(page);
  await abrirBiblioteca(page, 'Stretch');
  await page.evaluate(() => { const t = [...document.querySelectorAll('[data-pace-lib-card="move.neck.3"]')].find((e) => e.getBoundingClientRect().width > 0); (t.querySelector('.pace-lib-hit') || t).click(); });
  await overlaySuperior(page).getByRole('button', { name: 'Start', exact: true }).click();
  const cabecera = page.locator('[data-pace-session-header]').first();
  await expect(cabecera).toBeVisible();
  const antetitulo = (await cabecera.locator('div').first().locator('> *').first().textContent()).trim();
  expect(antetitulo, 'sale la etiqueta interna').not.toMatch(/^(SIT|HIP|SHLD|ATG|ANC)$/);
  expect(antetitulo).toBe('Neck');
});

/* ingles-5 */
test('ingles-5 · Estadísticas › Year dice «1 day» en singular', async ({ page, context }) => {
  await sembrar(context, EN);
  await irAlArtefacto(page);
  /* Un día con ritmo es un día con minutos de sesión: el agua sola no cuenta. */
  await page.evaluate(() => completeBreathSession('breathe.box', 2, 0));
  await page.keyboard.press('s');
  await page.getByRole('button', { name: 'Year', exact: true }).click();
  const pie = page.getByText(/with rhythm/);
  await expect(pie).toHaveText('1 day with rhythm');
  await expect(page.getByText(/max streak/)).toHaveText('max streak: 1 day');
});

/* ingles-6 */
test('ingles-6 · la pestaña sigue al idioma y la PWA se llama PACE', async ({ page, context }) => {
  await sembrar(context, EN);
  await irAlArtefacto(page);
  await expect(page).toHaveTitle(/^PACE · Focus · Body — v\d+\.\d+\.\d+$/);
  await page.evaluate(() => setState({ lang: 'es' }));
  await expect(page).toHaveTitle(/^PACE · Foco · Cuerpo — v\d+\.\d+\.\d+$/);
  const manifest = await page.evaluate(() => fetch('/manifest.webmanifest').then((r) => r.json()));
  expect(manifest.name).toBe('PACE');
});

/* ingles-7 */
test('ingles-7 · «1 glass» en la semana, en el total del mes y en el día', async ({ page, context }) => {
  await sembrar(context, EN);
  await irAlArtefacto(page);
  await page.evaluate(() => addWaterGlass(1));
  await page.keyboard.press('s');
  const tarjeta = page.locator('[data-pace-week-cards] > div').nth(3);
  await expect(tarjeta.locator('> div').last(), 'la tarjeta decía «1 / glasses»').toHaveText('glass');
  await page.getByRole('button', { name: 'Month', exact: true }).click();
  const totales = page.locator('.pace-heatmap-totals');
  await expect(totales.locator('> span').last(), 'el total del mes decía «1 glasses»').toHaveText('1 glass');
  await page.locator('.pace-heatmap-cell.has-data').first().hover();
  const globo = page.getByText(/ · 1 glass/).first();
  await expect(globo, 'el día decía «1 glasses»').toBeVisible();
  await expect(globo).not.toContainText('glasses');
});

/* ingles-8 */
test('ingles-8 · el «I donated →» se explica en inglés', async ({ page, context }) => {
  await sembrar(context, EN);
  await irAlArtefacto(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-support')));
  const boton = page.getByRole('button', { name: /I donated/ });
  await expect(boton).toHaveAttribute('title', 'Marks a private stamp — on trust');
});

/* ingles-10 */
for (const [w, h] of [[360, 718], [1280, 720]]) {
  test(`ingles-10 · «At your own pace.» va entera en su línea · ${w}`, async ({ page, context }) => {
    await page.setViewportSize({ width: w, height: h });
    await sembrar(context, Object.assign({ firstSeen: null }, EN));
    await page.goto('/index.html');
    const sub = page.getByText('At your own pace.', { exact: true });
    await sub.waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    const lineas = await sub.evaluate((el) => {
      const r = document.createRange(); r.selectNodeContents(el);
      return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
    });
    expect(lineas, '«At your / own pace.» partida en dos líneas').toBe(1);
  });
}

/* El escenario de la pausa, como en pausa-propone.spec.js: estado sembrado antes de cargar
   (con `lastActiveDay`, o el relevo de día pone el plan y el agua a cero) y el bloque
   terminado minuto a minuto. */
async function hastaLaPausa(page, context, estado) {
  await context.addInitScript((e) => {
    if (localStorage.getItem('pace.state.v2')) return;
    localStorage.setItem('pace.state.v2', JSON.stringify(Object.assign(
      { firstSeen: 1, lang: 'en', langAuto: false, palette: 'crema', lastActiveDay: new Date().toDateString() }, e)));
  }, estado);
  /* Sin hora fija: el guion de arriba corre antes que el reloj falso y fecha
     `lastActiveDay` con el día de verdad. */
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  await page.waitForTimeout(250);
  for (let i = 0; i < 30; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await expect(page.locator('[data-pace-break-shortcut]'), 'no se abrió la pausa').toHaveCount(1);
}

/* ingles-11 */
test('ingles-11 · la pausa no dice «You have not breathed today»', async ({ page, context }) => {
  await hastaLaPausa(page, context, { focusMinutes: 25, water: { today: 3, goal: 8 }, plan: { extra: true, muevete: true } });
  const prop = page.locator('[data-pace-break-prop]');
  await expect(prop).toContainText('No breathing session yet today');
  await expect(prop).not.toContainText('have not');
});

/* ingles-12 */
test('ingles-12 · la pausa de «A tu ritmo» habla inglés natural', async ({ page, context }) => {
  await sembrar(context, Object.assign({
    profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
    ritmo: { dia: { fecha: '2026-09-18', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } },
  }, EN));
  await page.clock.install({ time: new Date('2026-09-18T09:00:00+02:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Start the day', exact: true }).click();
  await page.waitForTimeout(250);
  for (let i = 0; i < 60; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  const modal = page.locator('[data-pace-modal-backdrop]');
  await expect(modal).toContainText("9:45 · what's on the menu now.");
});

/* ingles-14 */
test('ingles-14 · el sello se llama «stamp» en todas partes', async ({ page, context }) => {
  await sembrar(context, EN);
  await irAlArtefacto(page);
  await expect(page.getByText('Latest stamp', { exact: true }).first()).toBeVisible();
  const raros = await page.evaluate(() => Object.entries(window.PACE_STRINGS.en)
    .filter(([, v]) => /\b(seals?|badges?)\b/i.test(String(v))).map(([k, v]) => k + ' = ' + v));
  expect(raros, 'quedan textos en inglés con «seal» o «badge»').toEqual([]);
  expect(await page.evaluate(() => window.PACE_STRINGS.en['ach.toast.new'])).toBe('New stamp');
});

/* ingles-15 */
test('ingles-15 · el cierre pregunta «Did this break help?»', async ({ page, context }) => {
  await sembrar(context, EN);
  await page.clock.install();
  await irAlArtefacto(page);
  await abrirBiblioteca(page, 'Breathe');
  await page.getByRole('heading', { name: 'Physiological Sigh', exact: true }).first().click();
  const sesion = page.locator('[data-pace-session-root]');
  await sesion.getByRole('button', { name: 'Start now', exact: true }).click();
  await expect(page.locator('[data-pace-breathe-phase]')).toBeVisible();
  for (let i = 0; i < 4; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(12); }
  await sesion.getByRole('button', { name: /Finish/ }).click();
  await expect(sesion).toContainText('Did this break help?');
});

/* ingles-16 */
test('ingles-16 · el aviso de grupo vacío no dice «All 2 in flows»', async ({ page, context }) => {
  await sembrar(context, EN);
  await irAlArtefacto(page);
  await abrirBiblioteca(page, 'Stretch');
  await page.getByRole('button', { name: /^Right here/ }).first().click();
  const lib = page.locator('.pace-lib').first();
  await expect(lib).toContainText('Every routine in');
  await expect(lib).not.toContainText(/All \d+ in/);
});
