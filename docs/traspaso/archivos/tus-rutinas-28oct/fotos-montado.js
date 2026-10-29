// Fotos de «Tus rutinas, montado» (U1 B y C6 A, como los eligió Ez el 29 oct.): el index.html de la rama
// claude/tus-rutinas-c0cf03 tal cual, sin nada pintado encima. Cada escena se hace con la app, como lo haría
// una persona (el borrador se escribe y se cierra; la «otra pestaña» es una segunda página de verdad), a 1280
// y a 360 px. Uso, desde la raíz del worktree y tras `node build-standalone.js`:
//   node docs/traspaso/archivos/tus-rutinas-28oct/fotos-montado.js <carpeta-de-fotos>
// Levanta su servidor en el 8810 (el 8809 es de la suite) y lo apaga al acabar.
'use strict';
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules/playwright'));
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'fotos'));
fs.mkdirSync(OUT, { recursive: true });
const PUERTO = 8810;
const BASE = 'http://localhost:' + PUERTO;
const AHORA = new Date('2026-10-29T10:42:00+01:00');

const propia = (n, nombre, pasos) => ({ id: 'custom.17600000000' + n, name: nombre,
  steps: pasos.map(([name, dur]) => ({ name, dur })), min: 3, createdAt: 1760000000000 + n, updatedAt: 1760000000000 + n });
const NUEVE = [
  ['Cuello de tarde', [['Barbilla atrás', 30], ['Cuello y trapecios', 40]]],
  ['Piernas al café', [['Sentadilla a silla', 40], ['Elevación de talones', 30]]],
  ['Espalda alta', [['Juntar omóplatos', 30], ['Extensión torácica', 40]]],
  ['Muñecas', [['Círculos de muñeca', 20], ['Palmas en la mesa', 40]]],
  ['Caderas', [['Flexor de cadera', 45], ['90/90', 60]]],
  ['Core rápido', [['Plancha', 40], ['Hueco abdominal', 30]]],
  ['Antes de comer', [['Rodar hacia abajo', 45], ['Pliegue adelante', 50]]],
  ['Brazos', [['Fondos en silla', 40], ['Flexiones inclinadas', 40]]],
  ['Cerrar el día', [['Respiraciones profundas', 20], ['Gato-camello', 45]]],
];
const SEMILLA = {
  firstSeen: 1, langAuto: false, paletteAuto: false, ritmo: { libre: true }, lang: 'es', palette: 'crema',
  _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
  profile: { need: 'focus', time: 'pause', environment: 'home', completedAt: 1 },
};

async function pagina(ctx) {
  const page = await ctx.newPage();
  await page.clock.install({ time: AHORA });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  return page;
}
async function abrir(browser, w, rutinas) {
  const movil = w < 700;
  const ctx = await browser.newContext({ viewport: { width: w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1,
    isMobile: movil, hasTouch: movil, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  /* Solo si falta, como `sembrar` en la suite: la segunda pestaña no pisa lo que hizo la primera. */
  await ctx.addInitScript((s) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({}, SEMILLA, { sidebarCollapsed: movil, customRoutines: rutinas }));
  return { ctx, page: await pagina(ctx), movil };
}
const arriba = (page) => page.locator('[data-pace-modal-backdrop]').last();
async function tusRutinas(page) {
  await page.getByRole('button', { name: /^Mueve/ }).filter({ visible: true }).first().click();
  const b = page.locator('.pace-lib').filter({ visible: true }).first();
  await b.getByText(/^Tus rutinas/).filter({ visible: true }).first().click();
  return b;
}
async function borrador(page, b) {
  await b.getByRole('button', { name: /Crear rutina/ }).click();
  for (const ej of ['Barbilla atrás', 'Juntar omóplatos', 'Rotación torácica']) {
    await arriba(page).getByRole('button', { name: /Añadir ejercicio/ }).click();
    await arriba(page).getByRole('button').filter({ hasText: ej }).first().click();
    await arriba(page).getByRole('button', { name: /Volver/ }).click();
  }
  await arriba(page).getByPlaceholder('Mi rutina').fill('Media mañana');
}
const editar = (b, nombre) => b.locator('h4:visible', { hasText: nombre }).first().locator('xpath=..').getByRole('button', { name: 'Editar' }).click();
async function cambiarCuello(page, b) {
  await editar(b, 'Cuello de tarde');
  await arriba(page).getByPlaceholder('Mi rutina').fill('Cuello de noche');
  await arriba(page).getByRole('button', { name: 'Quitar' }).first().click();
}
async function guardar(page, movil) {
  await arriba(page).getByRole('button', { name: 'Guardar', exact: true }).click();
  await arriba(page).locator('[data-pace-custom-aviso]').waitFor();
  if (movil) await arriba(page).getByRole('button', { name: 'Guardar', exact: true }).scrollIntoViewIfNeeded();
}
async function foto(page, nombre) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, nombre + '.jpg'), type: 'jpeg', quality: 72 });
  console.log('  ' + nombre);
}

const ESCENAS = {
  /* U1: se cierra con Escape, sin pregunta, y «Tus rutinas» ofrece el borrador. */
  async lista(page) {
    const b = await tusRutinas(page);
    await borrador(page, b);
    await page.keyboard.press('Escape');
    const seguir = b.locator('[data-pace-custom-borrador]').filter({ visible: true });
    await seguir.waitFor();
    await seguir.scrollIntoViewIfNeeded();
    return 'u1-lista';
  },
  /* U1: «Seguir con tu borrador» abre el constructor donde lo dejaste. */
  async sigue(page) {
    const b = await tusRutinas(page);
    await borrador(page, b);
    await page.keyboard.press('Escape');
    await b.locator('[data-pace-custom-borrador]').filter({ visible: true }).click();
    await arriba(page).locator('[data-pace-custom-aviso="borrador"]').waitFor();
    return 'u1-sigue';
  },
  /* U1: los cambios a una rutina que existe esperan aparte; su tarjeta sigue igual. */
  async edicionLista(page) {
    const b = await tusRutinas(page);
    await cambiarCuello(page, b);
    await page.keyboard.press('Escape');
    const seguir = b.locator('[data-pace-custom-borrador]').filter({ visible: true });
    await seguir.waitFor();
    await seguir.scrollIntoViewIfNeeded();
    return 'u1-edicion-lista';
  },
  async edicion(page) {
    const b = await tusRutinas(page);
    await cambiarCuello(page, b);
    await page.keyboard.press('Escape');
    await editar(b, 'Cuello de tarde');
    await arriba(page).locator('[data-pace-custom-aviso="borrador"]').waitFor();
    return 'u1-edicion';
  },
  /* C6: la décima se hace en otra pestaña mientras escribes. */
  async tope(page, movil, ctx) {
    const b = await tusRutinas(page);
    await borrador(page, b);
    const otra = await pagina(ctx);
    await otra.evaluate(() => addCustomRoutine({ name: 'La décima', steps: [{ name: 'Plancha', dur: 30 }] }));
    await otra.close();
    await page.waitForFunction(() => getCustomRoutines().length === 10);
    await guardar(page, movil);
    return 'c6-tope';
  },
  /* C6: la rutina se borra en otra pestaña mientras la cambias. */
  async borrada(page, movil, ctx) {
    const b = await tusRutinas(page);
    await cambiarCuello(page, b);
    const otra = await pagina(ctx);
    await otra.evaluate(() => deleteCustomRoutine('custom.176000000000'));
    await otra.close();
    await page.waitForFunction(() => !getCustomRoutine('custom.176000000000'));
    await guardar(page, movil);
    return 'c6-borrada';
  },
};

(async () => {
  const server = spawn(process.execPath, [path.join(RAIZ, '.claude/static-server.js')], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }) });
  await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch();
  try {
    for (const [clave, escena] of Object.entries(ESCENAS)) {
      for (const w of [1280, 360]) {
        /* En la edición, solo «Cuello de tarde»: su tarjeta, igual, y el borrador caben juntos. */
        const rutinas = NUEVE.map(([n, p], i) => propia(i, n, p)).slice(0, clave === 'tope' ? 9 : clave.indexOf('edicion') === 0 ? 1 : 4);
        const { ctx, page, movil } = await abrir(browser, w, rutinas);
        try { await foto(page, (await escena(page, movil, ctx)) + '-' + w); }
        catch (e) { console.log('  FALLA ' + clave + ' ' + w + ': ' + e.message.split('\n')[0]); }
        await ctx.close();
      }
    }
  } finally { await browser.close(); server.kill(); }
})();
