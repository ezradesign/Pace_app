/* Hidrátate: «Un vaso más» y tocar un vaso, mirando el número y el estado. */
const L = require('./lib');
(async () => {
  await L.lanzar();
  const { ctx, page, errores } = await L.abrir({ tam: 'movil', lang: 'es', estado: { ritmo: { libre: true } } });
  await page.getByRole('button', { name: /^Hidrátate/ }).first().click();
  await page.waitForTimeout(700);
  const leer = () => page.evaluate(() => ({ hoy: getState().water.today, num: [...document.querySelectorAll('[data-pace-modal-card]')].pop().textContent.match(/(\d+)\s*\/\s*(\d+)/)?.[0] }));
  const botones = await page.evaluate(() => [...[...document.querySelectorAll('[data-pace-modal-card]')].pop().querySelectorAll('button')].map((b) => (b.getAttribute('aria-label') || '') + '|' + b.textContent.trim()));
  console.log(botones.join(' ; '));
  console.log('inicio', JSON.stringify(await leer()));
  await page.getByRole('button', { name: /Un vaso más/ }).click(); await page.waitForTimeout(400);
  console.log('tras +1', JSON.stringify(await leer()));
  await page.getByRole('button', { name: /Un vaso más/ }).click(); await page.waitForTimeout(400);
  console.log('tras +2', JSON.stringify(await leer()));
  await page.getByRole('button', { name: /Un vaso menos/ }).click(); await page.waitForTimeout(400);
  console.log('tras -1', JSON.stringify(await leer()));
  console.log(errores);
  await ctx.close(); await L.cerrar();
})();
