/* Las páginas de la web (/premium, /beta, /gracias, /recuperar, /desistir) a 360, 1280 y 1536×710
   en es y en, y la app sin red: se carga una vez con el service worker, se corta la red y se
   recarga. Uso: node 05-web.js */
'use strict';
const L = require('./lib');

(async () => {
  await L.lanzar();
  const informe = [];
  for (const ruta of ['/premium/', '/beta/', '/gracias/', '/recuperar/', '/desistir/']) {
    for (const tam of ['movil', 'escritorio', 'ez']) for (const lang of ['es', 'en']) {
      const tag = '05' + ruta.replace(/\//g, '-') + tam + '-' + lang;
      const { ctx, page, errores } = await L.abrir({ tam, lang, estado: null, ruta: ruta + (lang === 'en' ? '?lang=en' : ''), espera: 900 });
      const r = await L.medir(page, tag, { lang });
      r.titulo = await page.title();
      r.idioma = await page.evaluate(() => document.documentElement.lang);
      informe.push({ tag, errores: errores.filter((e) => !/Service Worker/.test(e)), pasos: [r] });
      await ctx.close();
    }
  }
  /* Sin red: primera visita con SW, y recarga sin red. */
  for (const tam of ['movil', 'escritorio']) {
    const tag = '05-sinred-' + tam;
    const { ctx, page, errores } = await L.abrir({ tam, lang: 'es', estado: { ritmo: { libre: true } }, sw: true, espera: 2500 });
    await page.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready).catch(() => {});
    await page.reload(); await page.waitForTimeout(1500);
    await ctx.setOffline(true);
    let pasos = [];
    try {
      await page.reload({ timeout: 15000 });
      await page.waitForTimeout(2000);
      pasos.push(await L.medir(page, tag + '-recarga', { lang: 'es' }));
      pasos.push({ nota: { aro: await page.locator('[data-pace-dial-number]').count(), texto: (await page.evaluate(() => document.body.innerText)).slice(0, 120) } });
      await page.getByRole('button', { name: /^Respira/ }).first().click();
      await page.waitForTimeout(800);
      pasos.push(await L.medir(page, tag + '-respira', { lang: 'es' }));
    } catch (e) { pasos.push({ error: e.message.split('\n')[0] }); }
    informe.push({ tag, errores: errores.filter((e) => !/Service Worker registration blocked/.test(e)), pasos });
    await ctx.close();
  }
  console.log(JSON.stringify(informe, null, 1));
  await L.cerrar();
})();
