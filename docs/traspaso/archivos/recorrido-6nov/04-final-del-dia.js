/* El final del día de quien sigue la jornada: empieza a las 9:00 y, al acabar cada bloque, hace la
   pausa a medias (la cierra con «Ahora no») o se la salta, come a su hora y llega a la salida. Se
   mira el aro, la línea y la barra lateral en cada final de bloque y después de la salida, y la
   mañana siguiente (el resumen de ayer). Uso: node 04-final-del-dia.js [movil|escritorio|ez] [es|en] */
'use strict';
const L = require('./lib');
const S = require('./siembra');

const JUEVES = new Date(2026, 10, 5, 8, 58);
const leer = (p) => p.evaluate(() => {
  const v = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | ');
  const h = new Date(Date.now());
  return { hora: h.getHours() + ':' + String(h.getMinutes()).padStart(2, '0'), label: v('[data-pace-dial-label]'), sub: v('[data-pace-dial-subtitle]'), cta: v('[data-pace-cta]'), seguir: v('[data-pace-aro-seguir]'), num: v('[data-pace-dial-number]'), side: v('[data-pace-sidebar-accion]').slice(0, 70), cab: v('[data-pace-ritmo-resumen]').slice(0, 90), ventana: v('[data-pace-modal-card]').slice(0, 120) };
});

(async () => {
  await L.lanzar();
  const [tam = 'escritorio', lang = 'es'] = process.argv.slice(2);
  const c = { tam, lang };
  const tag = '04-' + tam + '-' + lang;
  const { estado } = S.veterana(JUEVES, { lang });
  const { ctx, page: p, errores } = await L.abrir(Object.assign({}, c, { estado, reloj: JUEVES, espera: 1200 }));
  const log = [];
  try {
    const comienza = p.locator('[data-pace-ritmo-comienza]').filter({ visible: true });
    if (await comienza.count()) { await comienza.first().click(); await p.waitForTimeout(500); }
    await p.locator('[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"], button[data-pace-ritmo-opcion="jornada"]').filter({ visible: true }).first().click();
    await p.waitForTimeout(600);
    log.push(['preparado', await leer(p)]);
    await p.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    for (let vuelta = 0; vuelta < 14; vuelta++) {
      const fin = await p.evaluate(() => { try { const t = JSON.parse(localStorage.getItem('pace.timer.v1')); return t && t.endsAt; } catch (e) { return null; } });
      if (!fin) { log.push(['sin bloque', await leer(p)]); break; }
      await p.clock.fastForward(Math.max(0, fin - await p.evaluate(() => Date.now())) + 1000);
      await p.waitForTimeout(900);
      const r = await leer(p);
      log.push(['fin bloque ' + (vuelta + 1), r]);
      await L.foto(p, tag + '-fin-' + String(vuelta + 1).padStart(2, '0'));
      /* La ventana: comida → «Ir a comer»; si no, «Ahora no». */
      const comer = p.getByRole('button', { name: lang === 'en' ? /Go eat|lunch/i : /Ir a comer/ });
      if (await comer.count()) { await comer.first().click(); await p.waitForTimeout(500); }
      else { await p.keyboard.press('Escape'); await p.waitForTimeout(500); }
      /* Cinco minutos de pausa (o la hora de comer) y el bloque siguiente. */
      const tras = await leer(p);
      log.push(['tras la ventana', tras]);
      const seguir = p.locator('[data-pace-aro-seguir]').filter({ visible: true });
      await p.clock.fastForward(4 * 60 * 1000);
      await p.waitForTimeout(500);
      const ahora = await leer(p);
      if (await seguir.count()) await seguir.first().click();
      else {
        const cta = p.locator('[data-pace-cta]').filter({ visible: true }).first();
        if (!/Empezar|Start/.test(ahora.cta)) { log.push(['no hay bloque que empezar', ahora]); break; }
        await cta.click();
      }
      await p.waitForTimeout(500);
      const ya = await leer(p);
      log.push(['empieza', ya]);
      if (!/Bloque|Block/.test(ya.label)) { log.push(['ya no es un bloque', ya]); break; }
    }
    await L.foto(p, tag + '-final');
    log.push(['final', await leer(p)]);
    await p.clock.fastForward(new Date(2026, 10, 5, 19, 0).getTime() - await p.evaluate(() => Date.now()));
    await p.waitForTimeout(800);
    log.push(['19:00', await leer(p)]);
    await L.foto(p, tag + '-1900');
    await p.clock.fastForward(new Date(2026, 10, 6, 8, 40).getTime() - await p.evaluate(() => Date.now()));
    await p.waitForTimeout(1200);
    log.push(['viernes 8:40', await leer(p)]);
    await L.foto(p, tag + '-viernes');
    log.push(['resumen de ayer', await p.evaluate(() => JSON.stringify((getState().ritmo || {}).ayer || null).slice(0, 300))]);
  } catch (e) {
    log.push(['ERROR', e.message.split('\n')[0]]);
    await L.foto(p, tag + '-ERROR');
  }
  for (const [k, v] of log) console.log(k.padEnd(18), typeof v === 'string' ? v : JSON.stringify(v));
  console.log('errores', errores.filter((e) => !/Service Worker/.test(e)));
  await ctx.close();
  await L.cerrar();
})();
