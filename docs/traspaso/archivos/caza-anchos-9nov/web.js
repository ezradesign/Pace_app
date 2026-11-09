/* Caza de los seis anchos · /premium/ y /beta/ en una combinación. Uso: node web.js <tam> <es|en> [osc|claro] */
'use strict';
const L = require('./lib');

(async () => {
  await L.lanzar();
  const [tam = 'e1280', lang = 'es', osc] = process.argv.slice(2);
  const c = { tam, lang, oscuro: osc === 'osc' };
  const tag = tam + '-' + lang + (c.oscuro ? '-osc' : '');
  const pasos = [];
  for (const ruta of ['/premium/', '/beta/']) {
    const { ctx, page, errores } = await L.abrir(Object.assign({}, c, { estado: null, ruta: ruta + (lang === 'en' ? '?lang=en' : ''), espera: 900 }));
    const nombre = 'web' + ruta.replace(/\//g, '-').replace(/-$/, '');
    try {
      pasos.push(await L.medir(page, tag + '-' + nombre, c));
      /* Lo de más abajo: se baja la página a trozos y se mide cada trozo. */
      const alto = await page.evaluate(() => document.scrollingElement.scrollHeight - innerHeight);
      for (let y = 600, k = 2; y < alto + 600 && k < 8; y += 600, k++) {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        await page.waitForTimeout(250);
        pasos.push(await L.medir(page, tag + '-' + nombre + '-' + k, c));
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      pasos.push({ tab: nombre, teclado: await L.teclado(page, null, 20) });
    } catch (e) { pasos.push({ error: nombre + ': ' + e.message.split('\n')[0] }); }
    pasos.push({ errores: errores.filter((e) => !/Service Worker/.test(e)).slice(0, 10) });
    await ctx.close();
  }
  console.log(JSON.stringify({ tag, pasos }));
  await L.cerrar();
})();
