const L = require('./lib');
(async () => {
  await L.lanzar();
  for (const ruta of ['/premium/', '/desistir/']) {
    const { ctx, page } = await L.abrir({ tam: 'escritorio', lang: 'es', estado: null, ir: false });
    const malas = [];
    page.on('response', (r) => { if (r.status() >= 400) malas.push(r.status() + ' ' + r.url()); });
    await page.goto(L.BASE + ruta); await page.waitForTimeout(1200);
    console.log(ruta, malas);
    await ctx.close();
  }
  await L.cerrar();
})();
