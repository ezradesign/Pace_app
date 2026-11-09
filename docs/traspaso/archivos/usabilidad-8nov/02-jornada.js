/* La jornada entera de alguien con seis semanas de datos, un jueves: la home a las 8:50 con el día
   preparado, «Empezar jornada», el final del bloque y su ventana (teclado dentro), «Ahora no»,
   «Hacer la pausa» hasta el runner, cerrar la pestaña con un bloque en marcha y volver, el final
   del día y la medianoche. Uso: node 02-jornada.js [movil|escritorio|ez] [es|en] [osc] */
'use strict';
const L = require('./lib');
const S = require('./siembra');

const JUEVES = new Date(2026, 10, 5, 8, 50);
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function texto(page, sel) {
  return page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0)
    .map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | '), sel);
}

async function terminarBloque(page) {
  const fin = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) throw new Error('no hay bloque en marcha');
  await page.clock.fastForward(Math.max(0, fin - await page.evaluate(() => Date.now())) + 1000);
  await page.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 });
  await page.waitForTimeout(600);
}

(async () => {
  await L.lanzar();
  const [tam = 'escritorio', lang = 'es', osc] = process.argv.slice(2);
  const c = { tam, lang, oscuro: osc === 'osc' };
  const tag = '02-' + tam + '-' + lang + (c.oscuro ? '-osc' : '');
  const { estado, eventos } = S.veterana(JUEVES, { lang, palette: c.oscuro ? 'oscuro' : 'crema' });
  const { ctx, page, errores } = await L.abrir(Object.assign({}, c, { estado, reloj: JUEVES, espera: 1200 }));
  const pasos = [];
  const nota = (x) => pasos.push({ nota: x });
  try {
    nota({ sembrados: await S.sembrarEventos(page, eventos) });
    await page.reload();
    await page.waitForTimeout(1200);
    pasos.push(await L.medir(page, tag + '-a-home-0850', c));
    nota({ cta: await texto(page, '[data-pace-cta]'), label: await texto(page, '[data-pace-dial-label]'), sub: await texto(page, '[data-pace-dial-subtitle]') });
    /* Preparar el día: en el móvil «Preparar jornada»; en el escritorio, la opción «Jornada entera». */
    const comienza = vis(page, '[data-pace-ritmo-comienza]');
    if (await comienza.count()) {
      await comienza.first().click();
      await page.waitForTimeout(700);
      pasos.push(await L.medir(page, tag + '-a1-pregunta', c));
    }
    await vis(page, '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"], button[data-pace-ritmo-opcion="jornada"]').first().click();
    await page.waitForTimeout(900);
    pasos.push(await L.medir(page, tag + '-a2-dia-preparado', c));
    nota({ preparado: { cta: await texto(page, '[data-pace-cta]'), label: await texto(page, '[data-pace-dial-label]'), sub: await texto(page, '[data-pace-dial-subtitle]'), despues: await texto(page, '[data-pace-aro-despues]') } });
    const empezar = vis(page, '[data-pace-cta]').first();
    await empezar.click();
    await page.waitForTimeout(600);
    pasos.push(await L.medir(page, tag + '-b-bloque1', c));
    nota({ cta: await texto(page, '[data-pace-cta]'), label: await texto(page, '[data-pace-dial-label]'), despues: await texto(page, '[data-pace-aro-despues]') });

    /* Cerrar la pestaña a los 10 minutos y volver a los 14. */
    await page.clock.fastForward(10 * 60 * 1000);
    const pagina2 = await ctx.newPage();
    pagina2.on('pageerror', (e) => errores.push('p2 pageerror: ' + e.message));
    await page.close();
    await pagina2.clock.install({ time: new Date(JUEVES.getTime() + 14 * 60 * 1000 + 60 * 1000) });
    await pagina2.goto(L.BASE + '/index.html');
    await pagina2.waitForTimeout(1500);
    pasos.push(await L.medir(pagina2, tag + '-c-volver-a-los-14', c));
    nota({ trasVolver: await texto(pagina2, '[data-pace-dial-number]'), label: await texto(pagina2, '[data-pace-dial-label]'), cta: await texto(pagina2, '[data-pace-cta]') });
    const p = pagina2;

    await terminarBloque(p);
    pasos.push(await L.medir(p, tag + '-d-ventana-pausa', c));
    nota({ ventana: await texto(p, '[data-pace-modal-card], [role=dialog]') });
    pasos.push({ tab: await L.tabEncerrado(p, '[role=dialog], [data-pace-modal-card]', 15) });
    await p.keyboard.press('Escape');
    await p.waitForTimeout(500);
    nota({ trasEscape: await texto(p, '[data-pace-dial-label]'), dialogo: await p.locator('[role=dialog]').count() });
    await L.foto(p, tag + '-e-tras-escape');
    const ahoraNo = p.getByRole('button', { name: lang === 'en' ? 'Not now' : 'Ahora no', exact: true });
    if (await ahoraNo.count()) { await ahoraNo.last().click(); await p.waitForTimeout(500); }
    pasos.push(await L.medir(p, tag + '-f-pausa-corriendo', c));
    nota({ cta: await texto(p, '[data-pace-cta]'), seguir: await texto(p, '[data-pace-aro-seguir]'), label: await texto(p, '[data-pace-dial-label]') });

    await vis(p, '[data-pace-cta]').first().click();
    await p.waitForTimeout(900);
    pasos.push(await L.medir(p, tag + '-g-antes-de-empezar', c));
    pasos.push({ tab: await L.tabEncerrado(p, '[data-pace-modal-backdrop]', 15) });
    const emp = p.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: lang === 'en' ? /^Start/ : /^Empezar/ });
    nota({ botonesPreview: await texto(p, '[data-pace-modal-backdrop] button') });
    if (await emp.count()) {
      await emp.first().click();
      await p.waitForTimeout(1500);
      pasos.push(await L.medir(p, tag + '-h-runner', c));
      await p.clock.fastForward(20 * 1000);
      await p.waitForTimeout(500);
      pasos.push(await L.medir(p, tag + '-h2-runner-20s', c));
      pasos.push({ tab: await L.tabEncerrado(p, '[data-pace-session-root], [data-pace-modal-backdrop]', 15) });
      await p.keyboard.press('Escape');
      await p.waitForTimeout(600);
      pasos.push(await L.medir(p, tag + '-i-runner-escape', c));
    }
    /* El final del día: las 17:40, con lo que haya. */
    const ahora = await p.evaluate(() => Date.now());
    await p.clock.fastForward(new Date(2026, 10, 5, 17, 40).getTime() - ahora);
    await p.waitForTimeout(1500);
    pasos.push(await L.medir(p, tag + '-j-1740', c));
    nota({ a1740: await texto(p, '[data-pace-dial-label]'), cta: await texto(p, '[data-pace-cta]'), ritmo: (await texto(p, '[data-pace-ritmo-tarjeta], [data-pace-ritmo-panel]')).slice(0, 300) });
    /* La medianoche. */
    await p.clock.fastForward(new Date(2026, 10, 6, 0, 5).getTime() - await p.evaluate(() => Date.now()));
    await p.waitForTimeout(1500);
    pasos.push(await L.medir(p, tag + '-k-0005', c));
    nota({ a0005: await texto(p, '[data-pace-dial-label]'), ritmo: (await texto(p, '[data-pace-ritmo-tarjeta], [data-pace-ritmo-panel]')).slice(0, 300) });
    await p.clock.fastForward(new Date(2026, 10, 6, 8, 30).getTime() - await p.evaluate(() => Date.now()));
    await p.waitForTimeout(1500);
    pasos.push(await L.medir(p, tag + '-l-viernes-0830', c));
    nota({ a0830: await texto(p, '[data-pace-dial-label]'), cta: await texto(p, '[data-pace-cta]'), ritmo: (await texto(p, '[data-pace-ritmo-tarjeta], [data-pace-ritmo-panel]')).slice(0, 300) });
  } catch (e) {
    pasos.push({ error: e.message.split('\n')[0] });
    for (const pg of ctx.pages()) await L.foto(pg, tag + '-ERROR').catch(() => {});
  }
  console.log(JSON.stringify([{ tag, errores, pasos }], null, 1));
  await ctx.close();
  await L.cerrar();
})();
