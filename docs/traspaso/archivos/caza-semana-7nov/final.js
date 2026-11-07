/* El lunes 16 (la carta, que contesta `persona.carta`) y el martes 17: el día que sirve, lo
   aprendido, Estadísticas (Semana y «Qué te ayuda») y Logros. */
'use strict';
const { planHoy } = require('./calendario');

const platos = (p) => p.evaluate(() => {
  const pl = ritmoPlan(getState());
  if (!pl) return null;
  return pl.m.items.filter((it) => it.tipo === 'pausa' || it.tipo === 'cierre')
    .map((it) => ritmoHora(it.desde) + ' ' + it.tipo + (it.larga ? '·larga' : '') + ' ' + it.dur + 'm ' + (it.platos || []).map((x) => x.id + '(' + x.min + ')').join('+'));
});

async function stats(p, o, dia) {
  /* El icono de arriba a la derecha: sin texto, se busca por su `aria-label`. */
  const abre = o.vis(p, '[aria-label="' + (o.EN ? 'View stats' : 'Ver estadísticas') + '"]');
  if (!(await abre.count())) { o.apunta(dia + ' stats', 'sin botón'); return; }
  await abre.first().click();
  await p.waitForTimeout(700);
  for (const pest of o.EN ? ['Week', 'What helps'] : ['Semana', 'Qué te ayuda']) {
    const b = o.vis(p, '[role="tab"], button').filter({ hasText: new RegExp('^' + pest) });
    if (await b.count()) { await b.first().click(); await p.waitForTimeout(600); }
    const txt = (await o.vis(p, '[data-pace-modal-card]').first().textContent().catch(() => '')).replace(/\s+/g, ' ');
    o.apunta(dia + ' stats ' + pest, txt.slice(0, 700));
    o.apunta(dia + ' stats ' + pest + ' medida', await o.L.medir(p, o.tag(dia + '-stats-' + pest.replace(/\s/g, '')), { lang: o.lang }).then((m) => ({ scroll: m.scroll.doc, cajas: m.scroll.cajas.length, cortados: m.cortados.slice(0, 5), solapes: m.solapes.slice(0, 5), sinTraducir: (m.sinTraducir || []).slice(0, 8) })));
  }
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
}

async function logros(p, o, dia) {
  const abre = o.vis(p, '[aria-label="' + (o.EN ? 'View achievements' : 'Ver logros') + '"]');
  if (!(await abre.count())) { o.apunta(dia + ' logros', 'sin botón'); return; }
  await abre.first().click();
  await p.waitForTimeout(700);
  o.apunta(dia + ' logros', (await o.vis(p, '[data-pace-modal-card]').first().textContent().catch(() => '')).replace(/\s+/g, ' ').slice(0, 500));
  await o.L.foto(p, o.tag(dia + '-logros'));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
}

function lunesYMartes() {
  return async (o) => {
    let p = o.getPage();
    if (!p) p = await o.abrirPagina(o.D(16, 8, 50));
    else await o.irA(p, o.D(16, 8, 50));
    await p.clock.fastForward(16000);
    await p.waitForTimeout(800);
    const antes = await o.estadoEntero(p);
    o.apunta('lun16 semana pasada', { dias: antes.dias, cola: antes.cola, sesPorDia: antes.sesPorDia, fb: antes.fb });
    o.apunta('lun16 carta', antes.carta);
    o.apunta('lun16 logros', antes.logros);
    o.apunta('lun16 racha', { streak: antes.streak, historia: antes.historia, semana: antes.semana });
    await o.L.foto(p, o.tag('lun16-llega'));
    const P = require('./personas')[process.argv[2] || 'oficina'];
    const carta = p.locator('[data-pace-carta]').filter({ visible: true });
    if (await carta.count()) {
      o.apunta('lun16 carta texto', (await carta.first().textContent()).replace(/\s+/g, ' ').slice(0, 600));
      o.apunta('lun16 carta medida', await o.L.medir(p, o.tag('lun16-carta'), { lang: o.lang }).then((m) => ({ scroll: m.scroll.doc, cajas: m.scroll.cajas, cortados: m.cortados.slice(0, 5), solapes: m.solapes.slice(0, 5), sinTraducir: (m.sinTraducir || []).slice(0, 8) })));
      await P.carta(p, 'lun16', o.apunta, o.L, o.tag);
    } else o.apunta('lun16 carta', 'no sale');
    const tras = await o.estadoEntero(p);
    o.apunta('lun16 tras la carta', { carta: tras.carta && { resp: tras.carta.resp, hora: tras.carta.hora, vista: tras.carta.vista }, aprendido: tras.aprendido, horario: tras.horario });
    await stats(p, o, 'lun16');
    await logros(p, o, 'lun16');
    /* El lunes, el día de siempre, dos bloques, y a casa. */
    await o.prepararDia(p, P.dias[0].prepara || 'jornada');
    o.apunta('lun16 platos', await platos(p));
    o.apunta('lun16 plan', await planHoy(p));
    await o.L.foto(p, o.tag('lun16-preparado'));
    await o.cerrarPagina();

    p = await o.abrirPagina(o.D(17, 8, 55));
    o.apunta('mar17 llega', await o.leer(p));
    await o.prepararDia(p, P.dias[0].prepara || 'jornada');
    o.apunta('mar17 platos', await platos(p));
    o.apunta('mar17 plan', await planHoy(p));
    o.apunta('mar17 memoria', await p.evaluate(() => { const s = getState(); return ritmoMemoria(s, ritmoHoy(), ritmoDe(s).dia, null).aprendido; }));
    await o.L.foto(p, o.tag('mar17-preparado'));
    o.apunta('mar17 medida', await o.L.medir(p, o.tag('mar17-home'), { lang: o.lang }).then((m) => ({ scroll: m.scroll.doc, cajas: m.scroll.cajas, cortados: m.cortados.slice(0, 5), solapes: m.solapes.slice(0, 5), sinTraducir: (m.sinTraducir || []).slice(0, 8) })));
  };
}

module.exports = { lunesYMartes, platos, stats, logros };
