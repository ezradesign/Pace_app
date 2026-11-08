/* El martes con reuniones (10:00-11:00 y 15:00-15:30), de cerca: empieza a las 8:52, hace la pausa
   y vuelve a las 9:45. ¿Qué bloque sirve antes de la reunión, cuánto dura y qué dice la ventana al
   acabar? Uso: PACE_E2E_PORT=8892 node _reunion.js [es|en] [movil|escritorio] */
'use strict';
const L = require('../recorrido-6nov/lib');
const [lang = 'es', tam = 'escritorio'] = process.argv.slice(2);
const D = (h, mi) => new Date(2026, 10, 10, h, mi || 0);
const vis = (p, s) => p.locator(s).filter({ visible: true });
const leer = (p) => p.evaluate(() => {
  const v = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | ');
  const s = getState(), pl = ritmoPlan(s), h = new Date(Date.now());
  let t = null; try { t = JSON.parse(localStorage.getItem('pace.timer.v1')); } catch (e) {}
  return { hora: h.getHours() + ':' + String(h.getMinutes()).padStart(2, '0'), label: v('[data-pace-dial-label]'), num: v('[data-pace-dial-number]'), cta: v('[data-pace-cta]').slice(0, 50),
    ventana: v('[data-pace-modal-card]').slice(0, 220), focusMinutes: s.focusMinutes, timer: t && { min: t.minutes, fin: t.endsAt && new Date(t.endsAt).toTimeString().slice(0, 5) },
    plan: pl && pl.m.items.map((it) => it.tipo[0] + ritmoHora(it.desde) + '+' + it.dur).join(' '), hechos: pl && pl.hechos, pausa: s.ritmo.dia && s.ritmo.dia.pausa };
});
(async () => {
  await L.lanzar();
  const estado = { ritmo: { semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'],
    horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
    ocupado: { fecha: '2026-11-10', tramos: [[600, 60], [900, 30]], fuente: 'google' } }, lastActiveDay: D(8).toDateString() };
  const { ctx, page: p, errores } = await L.abrir({ tam, lang, estado, reloj: D(8, 52), espera: 1200 });
  const comienza = vis(p, '[data-pace-ritmo-comienza]');
  if (await comienza.count()) { await comienza.first().click(); await p.waitForTimeout(400); }
  await vis(p, '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"]').first().click();
  await p.waitForTimeout(500);
  console.log('preparado', JSON.stringify(await leer(p)));
  await vis(p, '[data-pace-cta]').first().click();
  await p.waitForTimeout(400);
  const fin = async () => {
    const f = await p.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
    await p.clock.fastForward(f - await p.evaluate(() => Date.now()) + 1000);
    await p.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(500);
  };
  await fin();
  console.log('fin 1', JSON.stringify(await leer(p)));
  await vis(p, '[data-pace-break-shortcut] button').first().click();
  await p.clock.fastForward(D(9, 45) - await p.evaluate(() => Date.now()));
  await p.waitForTimeout(500);
  console.log('9:45', JSON.stringify(await leer(p)));
  await L.foto(p, 'reunion-' + lang + '-' + tam + '-0945');
  const ya = vis(p, 'button').filter({ hasText: lang === 'en' ? /^Start block/ : /^Empezar ya el bloque/ });
  if (await ya.count()) await ya.first().click(); else await vis(p, '[data-pace-cta]').first().click();
  await p.waitForTimeout(500);
  console.log('empieza 2', JSON.stringify(await leer(p)));
  await fin();
  console.log('fin 2', JSON.stringify(await leer(p)));
  await L.foto(p, 'reunion-' + lang + '-' + tam + '-fin2');
  await vis(p, '[data-pace-break-shortcut] button').first().click();
  await p.waitForTimeout(400);
  console.log('tras ahora no', JSON.stringify(await leer(p)));
  await L.foto(p, 'reunion-' + lang + '-' + tam + '-tras');
  await p.clock.fastForward(D(11, 0) - await p.evaluate(() => Date.now()));
  await p.waitForTimeout(500);
  console.log('11:00', JSON.stringify(await leer(p)));
  console.log('errores', errores);
  await ctx.close();
  await L.cerrar();
})();
