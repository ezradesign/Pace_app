/* Los módulos, como los usa alguien con seis semanas de datos un jueves a las 10:00, por libre:
   Respira (con el aviso de la apnea), Mueve y Estira con el runner y «Auto», Hidrátate, Logros,
   Estadísticas (Hoy, Semana, Mes, Año y «Qué te ayuda»), «Tus rutinas» y Ajustes. En cada pantalla
   se mide y se prueba el teclado: Tab no se escapa del diálogo de arriba y Escape cierra solo la
   capa de arriba. Uso: node 03-modulos.js [movil|escritorio|ez] [es|en] [osc] [parte] */
'use strict';
const L = require('./lib');
const S = require('./siembra');

const JUEVES = new Date(2026, 10, 5, 10, 0);
const ARRIBA = '[data-pace-session-root], [data-pace-modal-backdrop], [role=dialog]';

/* El botón visible de la capa de arriba cuyo texto casa con `rx`. */
async function pulsar(page, rx, dentro) {
  const ok = await page.evaluate(([src, fl, sel]) => {
    const r = new RegExp(src, fl);
    const capas = sel ? [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0) : [];
    const raiz = capas.length ? capas[capas.length - 1] : document;
    const b = [...raiz.querySelectorAll('button, a, [role=button], [role=tab]')].filter((x) => x.getBoundingClientRect().width > 0)
      .find((x) => r.test((x.getAttribute('aria-label') || '') + ' ' + x.textContent.trim()));
    if (!b) return false;
    b.click();
    return true;
  }, [rx.source, rx.flags, dentro || null]);
  if (!ok) throw new Error('no encuentro ' + rx);
  await page.waitForTimeout(700);
}

async function capas(page) {
  return page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).length, ARRIBA);
}

async function tarjeta(page, id) {
  await page.evaluate((i) => {
    const vis = (x) => x.getBoundingClientRect().width > 0;
    const e = [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')].find(vis)
      || [...document.querySelectorAll('[data-pace-lib-card="' + i + '"]')].find(vis);
    if (!e) throw new Error('sin tarjeta ' + i);
    e.click();
  }, id);
  await page.waitForTimeout(900);
}

/* Escape una vez y cuántas capas quedan (y cuántas había). */
async function escape(page) {
  const antes = await capas(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  return { antes, despues: await capas(page) };
}

(async () => {
  await L.lanzar();
  const [tam = 'escritorio', lang = 'es', osc, parte] = process.argv.slice(2);
  const en = lang === 'en';
  const c = { tam, lang, oscuro: osc === 'osc' };
  const tag = '03-' + tam + '-' + lang + (c.oscuro ? '-osc' : '');
  const { estado, eventos } = S.veterana(JUEVES, { lang, palette: c.oscuro ? 'oscuro' : 'crema' });
  const { ctx, page, errores } = await L.abrir(Object.assign({}, c, { estado, reloj: JUEVES, espera: 1200 }));
  const pasos = [];
  const nota = (x) => pasos.push({ nota: x });
  const medir = async (n) => { pasos.push(await L.medir(page, tag + '-' + n, c)); };
  const tab = async (nom, n) => { pasos.push({ tab: (await L.tabEncerrado(page, ARRIBA, n || 20)).map((x) => nom + ':' + x) }); };
  const quiere = (p) => !parte || parte === p;
  const volverHome = async () => { for (let i = 0; i < 4 && await capas(page); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(500); } };
  const tramo = async (nombre, fn) => {
    if (!quiere(nombre)) return;
    try { await fn(); } catch (e) { pasos.push({ error: nombre + ': ' + e.message.split('\n')[0] }); await L.foto(page, tag + '-ERROR-' + nombre); }
    await volverHome();
  };
  try {
    await S.sembrarEventos(page, eventos);
    await page.reload();
    await page.waitForTimeout(1200);

    await tramo('respira', async () => {
      await pulsar(page, en ? /^\s*Breathe/ : /^\s*Respira/);
      await medir('respira-a-biblioteca'); await tab('t1');
      await tarjeta(page, 'breathe.rounds.express');
      await medir('respira-b-aviso-apnea'); await tab('t2');
      nota({ escapeAviso: await escape(page) });
      await tarjeta(page, 'breathe.coherent.55');
      await medir('respira-c-prep');
      await pulsar(page, en ? /Start now/ : /Empezar ahora/, '[data-pace-session-root]');
      await page.clock.fastForward(12000); await page.waitForTimeout(400);
      await medir('respira-d-sesion'); await tab('t3');
      nota({ escapeSesion: await escape(page) });
      await medir('respira-e-tras-escape');
      nota({ escapeSesion2: await escape(page) });
      await pulsar(page, en ? /^\s*Breathe/ : /^\s*Respira/);
      await tarjeta(page, 'breathe.physiological');
      await pulsar(page, en ? /Start now/ : /Empezar ahora/, '[data-pace-session-root]');
      for (let i = 0; i < 300 && !(await page.locator('[data-pace-session-stats]').count()); i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); }
      await page.waitForTimeout(500);
      await medir('respira-f-hecho'); await tab('t4');
    });

    for (const [mod, rx, id] of [['mueve', en ? /^\s*Move/ : /^\s*Mueve/, 'extra.chair.squats'], ['estira', en ? /^\s*Stretch/ : /^\s*Estira/, 'move.neck.3']]) {
      await tramo(mod, async () => {
        await pulsar(page, rx);
        await page.waitForTimeout(400);
        await medir(mod + '-a-biblioteca'); await tab('t5');
        await tarjeta(page, id);
        await medir(mod + '-b-preview'); await tab('t6');
        await pulsar(page, en ? /^\s*Start/ : /^\s*Empezar/, '[data-pace-modal-card], [data-pace-session-root]');
        await page.waitForTimeout(800);
        await medir(mod + '-c-prepárate'); await tab('t7');
        const auto = page.locator('[data-pace-v1-auto]').filter({ visible: true }).first();
        if (await auto.count()) { await auto.click(); await page.waitForTimeout(500); await medir(mod + '-d-auto-tocado'); nota({ auto: await auto.getAttribute('aria-pressed') }); }
        for (let i = 0; i < 25; i++) { await page.clock.runFor(1000); }
        await page.waitForTimeout(300);
        await medir(mod + '-e-a-los-25s');
        nota({ fase: await page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase').catch(() => null) });
        nota({ escapeRunner: await escape(page) });
        await medir(mod + '-f-tras-escape');
      });
    }

    await tramo('agua', async () => {
      await pulsar(page, en ? /^\s*Hydrate/ : /^\s*Hidrátate/);
      await medir('agua-a'); await tab('t8');
      await pulsar(page, en ? /One more glass|glass/i : /Un vaso más|vaso/i, '[data-pace-modal-card]');
      await medir('agua-b-un-vaso');
    });

    await tramo('logros', async () => {
      await pulsar(page, en ? /Achievements/i : /Logros/i);
      await page.waitForTimeout(500);
      await medir('logros-a'); await tab('t9');
    });

    await tramo('stats', async () => {
      await pulsar(page, en ? /statistics|stats/i : /estadísticas/i);
      await page.waitForTimeout(600);
      for (const t of ['today', 'week', 'month', 'year', 'ayuda']) {
        const b = page.locator('[data-pace-stats-tab="' + t + '"]');
        if (await b.count()) { await b.first().click(); await page.waitForTimeout(700); await medir('stats-' + t); }
        else nota({ sinPestana: t, hay: await page.evaluate(() => [...document.querySelectorAll('[data-pace-stats-tab]')].map((e) => e.getAttribute('data-pace-stats-tab'))) });
      }
      await tab('t10');
    });

    await tramo('rutinas', async () => {
      await pulsar(page, en ? /Your routines/i : /Tus rutinas/i);
      await medir('rutinas-a'); await tab('t11');
      await pulsar(page, en ? /Create|New/i : /Crear|Nueva/i, ARRIBA).catch((e) => nota({ crear: e.message }));
      await medir('rutinas-b-crear'); await tab('t12');
    });

    await tramo('ajustes', async () => {
      await page.locator('[data-pace-topbar-ajustes]').filter({ visible: true }).first().click();
      await page.waitForTimeout(700);
      await medir('ajustes-a'); await tab('t13', 40);
      const plegada = page.locator('[data-pace-aj-plegada] .pace-aj-sec-accion');
      if (await plegada.isVisible().catch(() => false)) { await plegada.click(); await page.waitForTimeout(600); }
      await medir('ajustes-b-datos'); await tab('t14', 30);
    });
  } catch (e) {
    pasos.push({ error: e.message.split('\n')[0] });
    await L.foto(page, tag + '-ERROR');
  }
  console.log(JSON.stringify([{ tag, errores, pasos }], null, 1));
  await ctx.close();
  await L.cerrar();
})();
