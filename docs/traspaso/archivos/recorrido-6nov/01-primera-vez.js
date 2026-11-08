/* La primera vez: bienvenida, «¿Cómo es tu semana?», PACE completo y la visita guiada, con el
   teclado dentro de cada diálogo, a 360, 1280 y 1536×710, en es y en, claro y oscuro. */
'use strict';
const L = require('./lib');

(async () => {
  await L.lanzar();
  const informe = [];
  const combos = [];
  for (const tam of ['movil', 'escritorio', 'ez']) for (const lang of ['es', 'en']) for (const oscuro of [false, true]) combos.push({ tam, lang, oscuro });
  for (const c of (process.argv[2] ? combos.filter((x) => x.tam === process.argv[2]) : combos)) {
    const tag = '01-' + c.tam + '-' + c.lang + (c.oscuro ? '-osc' : '');
    const { ctx, page, errores } = await L.abrir(Object.assign({}, c, { estado: null }));
    const pasos = [];
    try {
      await page.locator('[role=dialog] [data-pace-cta]').waitFor({ timeout: 10000 });
      pasos.push(await L.medir(page, tag + '-a-bienvenida', c));
      pasos.push({ tab: await L.tabEncerrado(page, '[role=dialog]', 12) });
      await page.locator('[role=dialog] [data-pace-cta]').click();
      await page.locator('[data-pace-semana-guardar]').waitFor();
      await page.waitForTimeout(400);
      pasos.push(await L.medir(page, tag + '-b-semana', c));
      pasos.push({ tab: await L.tabEncerrado(page, '[role=dialog]', 30) });
      await page.locator('[data-pace-semana-guardar]').click();
      await page.locator('[data-pace-onb-comenzar]').waitFor();
      await page.waitForTimeout(400);
      pasos.push(await L.medir(page, tag + '-c-completo', c));
      await page.locator('[data-pace-onb-comenzar]').click();
      await page.locator('[data-pace-visita]').waitFor();
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(700);
        pasos.push(await L.medir(page, tag + '-d-visita' + i, c));
        const sig = page.locator('[data-pace-visita-siguiente]');
        if (!(await sig.count())) break;
        await sig.click();
        if (!(await page.locator('[data-pace-visita]').count())) break;
      }
      await page.waitForTimeout(700);
      pasos.push(await L.medir(page, tag + '-e-home', c));
    } catch (e) {
      pasos.push({ error: e.message.split('\n')[0] });
      await L.foto(page, tag + '-ERROR');
    }
    informe.push({ tag, errores: errores.slice(0, 10), pasos });
    await ctx.close();
  }
  console.log(JSON.stringify(informe, null, 1));
  await L.cerrar();
})();
