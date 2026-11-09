/* Caza de los seis anchos · todas las pantallas de la app en una combinación de tamaño, idioma y tema.
 * Uso: node pantallas.js <m320|m360|m360b|m390|t768|e1280|e1536> <es|en> [osc|claro] [parte]
 * Partes: primera (bienvenida, con «¿Tienes una copia?»), jornada (la home a las 8:50, el bloque, su
 * ventana, la pausa y «Antes de empezar», la barra que pregunta, y la home al acabar), carta (la del
 * lunes y el calendario) y modulos (Respira con la apnea, Mueve, Estira y su runner, Hidrátate, Logros,
 * Estadísticas, «Tus rutinas» y Ajustes con todos sus temas). Escribe un JSON en la salida. */
'use strict';
const L = require('./lib');
const S = require('./siembra');

const [tam = 'e1280', lang = 'es', osc, parte] = process.argv.slice(2);
const en = lang === 'en';
const c = { tam, lang, oscuro: osc === 'osc' };
const tag = tam + '-' + lang + (c.oscuro ? '-osc' : '');
const movil = L.TAMANOS[tam][0] <= 768;
const ARRIBA = '[data-pace-session-root], [data-pace-modal-backdrop], [role=dialog], [data-pace-tweaks-panel]';
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

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
const capas = (page) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).length, ARRIBA);
async function tarjeta(page, id) {
  await page.evaluate((i) => {
    const v = (x) => x.getBoundingClientRect().width > 0;
    const e = [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')].find(v)
      || [...document.querySelectorAll('[data-pace-lib-card="' + i + '"]')].find(v);
    if (!e) throw new Error('sin tarjeta ' + i);
    e.click();
  }, id);
  await page.waitForTimeout(900);
}
async function terminarBloque(page) {
  const fin = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) throw new Error('no hay bloque en marcha');
  await page.clock.fastForward(Math.max(0, fin - await page.evaluate(() => Date.now())) + 1000);
  await page.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 });
  await page.waitForTimeout(700);
}
/* Lleva el reloj a una hora del mismo día de la página. */
async function aLas(page, d) { await page.clock.fastForward(Math.max(0, d.getTime() - await page.evaluate(() => Date.now()))); await page.waitForTimeout(1200); }

(async () => {
  await L.lanzar();
  const pasos = [];
  let ctx, page, errores;
  const medir = async (n) => { pasos.push(await L.medir(page, tag + '-' + n, c)); };
  const tab = async (n, k) => { pasos.push({ tab: n, teclado: await L.teclado(page, null, k || 18) }); };
  const volverHome = async () => { for (let i = 0; i < 5 && await capas(page); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(450); } };
  const tramo = async (nombre, fn) => {
    try { await fn(); } catch (e) { pasos.push({ error: nombre + ': ' + e.message.split('\n')[0] }); await L.foto(page, tag + '-ERROR-' + nombre); }
    await volverHome();
  };

  if (!parte || parte === 'primera') {
    ({ ctx, page, errores } = await L.abrir(Object.assign({}, c, { estado: null })));
    await tramo('primera', async () => {
      await page.locator('[role=dialog] [data-pace-cta]').waitFor({ timeout: 10000 });
      await medir('primera-a-bienvenida'); await tab('primera-a', 12);
      await page.locator('[role=dialog] [data-pace-cta]').click();
      await page.locator('[data-pace-semana-guardar]').waitFor();
      await page.waitForTimeout(400);
      await medir('primera-b-semana'); await tab('primera-b', 30);
      await page.locator('[data-pace-semana-guardar]').click();
      await page.locator('[data-pace-onb-comenzar]').waitFor();
      await page.waitForTimeout(400);
      await medir('primera-c-completo'); await tab('primera-c', 12);
      await page.locator('[data-pace-onb-comenzar]').click();
      await page.locator('[data-pace-visita]').waitFor();
      for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(700);
        await medir('primera-d-visita' + i);
        const sig = page.locator('[data-pace-visita-siguiente]');
        if (!(await sig.count())) break;
        await sig.click();
        if (!(await page.locator('[data-pace-visita]').count())) break;
      }
    });
    pasos.push({ errores: errores.slice(0, 12) });
    await ctx.close();
  }

  if (!parte || parte === 'jornada') {
    const JUEVES = new Date(2026, 10, 5, 8, 50);
    const { estado, eventos } = S.veterana(JUEVES, { lang, palette: c.oscuro ? 'oscuro' : 'crema' });
    ({ ctx, page, errores } = await L.abrir(Object.assign({}, c, { estado, reloj: JUEVES, espera: 1200 })));
    await tramo('jornada', async () => {
      await S.sembrarEventos(page, eventos);
      await page.reload(); await page.waitForTimeout(1300);
      await medir('jornada-a-home-0850'); await tab('jornada-a', 14);
      await volverHome();
      const comienza = vis(page, '[data-pace-ritmo-comienza]');
      if (await comienza.count()) { await comienza.first().click(); await page.waitForTimeout(700); await medir('jornada-a1-pregunta'); }
      await vis(page, '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"], button[data-pace-ritmo-opcion="jornada"]').first().click();
      await page.waitForTimeout(900);
      await medir('jornada-a2-dia-preparado');
      await vis(page, '[data-pace-cta]').first().click();
      await page.waitForTimeout(600);
      await page.clock.fastForward(11 * 60 * 1000); await page.waitForTimeout(500);
      await medir('jornada-b-foco-en-marcha');
      await terminarBloque(page);
      await medir('jornada-c-ventana-pausa'); await tab('jornada-c', 14);
      const ahoraNo = page.locator('[data-pace-break-shortcut] button:not([data-pace-break-cuenta])').filter({ hasText: en ? /^Not now$/ : /^Ahora no$/ });
      if (await ahoraNo.count()) await ahoraNo.first().click(); else await page.keyboard.press('Escape');
      await page.waitForTimeout(600);
      await medir('jornada-d-pausa-corriendo');
      /* La barra de arriba con la pausa empezada: un modo distinto pregunta antes de cortarla. */
      const modo = page.locator('[data-pace-tabs] button').filter({ visible: true });
      if (await modo.count() > 1) {
        await modo.nth(0).click().catch(() => {}); await page.waitForTimeout(600);
        if (await capas(page)) { await medir('jornada-d2-barra-pregunta'); await tab('jornada-d2', 8); await volverHome(); }
      }
      await vis(page, '[data-pace-cta]').first().click();
      await page.waitForTimeout(900);
      await medir('jornada-e-antes-de-empezar'); await tab('jornada-e', 14);
      const emp = page.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: en ? /^Start/ : /^Empezar/ });
      if (await emp.count()) {
        await emp.first().click(); await page.waitForTimeout(1500);
        await medir('jornada-f-runner');
        await page.clock.fastForward(20 * 1000); await page.waitForTimeout(500);
        await medir('jornada-f2-runner-20s'); await tab('jornada-f2', 14);
      }
      await volverHome();
      await aLas(page, new Date(2026, 10, 5, 12, 10));
      await medir('jornada-g-1210-plena');
      if (movil) {
        const ver = vis(page, '[data-pace-ritmo-ver]');
        if (await ver.count()) { await ver.first().click(); await page.waitForTimeout(700); await medir('jornada-g2-ver-todo'); await volverHome(); }
      }
      await aLas(page, new Date(2026, 10, 5, 17, 40));
      await medir('jornada-h-1740-al-acabar'); await tab('jornada-h', 10);
      await volverHome();
      await aLas(page, new Date(2026, 10, 5, 19, 30));
      await medir('jornada-i-1930-noche');
    });
    pasos.push({ errores: errores.slice(0, 12) });
    await ctx.close();
  }

  if (!parte || parte === 'carta') {
    const LUNES = new Date(2026, 10, 9, 8, 30);
    const { estado, eventos } = S.veterana(LUNES, { lang, palette: c.oscuro ? 'oscuro' : 'crema' });
    estado.ritmo = Object.assign({}, estado.ritmo, { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 } });
    ({ ctx, page, errores } = await L.abrir(Object.assign({}, c, { estado, reloj: LUNES, espera: 1200 })));
    await tramo('carta', async () => {
      await S.sembrarEventos(page, eventos);
      /* La semana pasada como la guarda el emisor del día (tests/ritmo-carta.spec.js), y el motor. */
      await page.waitForFunction(() => window.paceEventsCanWrite && window.paceEventsCanWrite());
      await page.evaluate(async () => {
        const p = (hora, tipo, modulo, id) => ({ hora, tipo, estado: 'hecha', reunion: 0, platos: [{ modulo, id, otras: 0, antes: [] }] });
        const fechas = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'];
        for (let i = 0; i < fechas.length; i++) {
          const d = { fecha: fechas[i], opcion: 'jornada', habitual: 'jornada', inicio: 540, salida: 1020, paradas: [
            p(585, 'pausa', 'mueve', 'extra.legs.standing'), p(745, 'pausa', 'estira', 'move.neck.3'),
            p(795, 'pausa', 'mueve', 'extra.glutes.stealth'), p(945, 'pausa', 'estira', 'move.shoulder.circles'),
            p(1015, 'cierre', 'respira', 'breathe.physiological')] };
          if (i < 4) { d.paradas[2].platos[0].otras = 1; d.paradas[2].platos[0].antes = ['extra.calves']; }
          if (i < 3) d.paradas[3].estado = 'saltada';
          await new Promise((ok) => emitRitmoDia(d, ok, ok));
        }
        setState((x) => Object.assign({}, x, { ritmo: Object.assign({}, x.ritmo, { carta: null }) }));
        ritmoMotorRevisar();
      });
      await page.waitForTimeout(1500);
      const hay = await page.locator('[data-pace-carta]').filter({ visible: true }).count();
      pasos.push({ nota: { carta: hay, capa: await page.evaluate(() => window.__caza.capa()) } });
      await medir('carta-a'); await tab('carta-a', 14);
      const sig = page.locator('[role=dialog] button, [data-pace-modal-card] button').filter({ visible: true }).filter({ hasText: en ? /^(Next|Continue|OK|Got it|Yes)/ : /^(Siguiente|Seguir|Vale|Sí)/ });
      if (await sig.count()) { await sig.first().click(); await page.waitForTimeout(700); if (await capas(page)) { await medir('carta-b'); } }
    });
    /* El calendario: con el día de hoy servido. */
    await tramo('calendario', async () => {
      await volverHome();
      const comienza = vis(page, '[data-pace-ritmo-comienza]');
      if (await comienza.count()) { await comienza.first().click(); await page.waitForTimeout(600); }
      await vis(page, '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"], button[data-pace-ritmo-opcion="jornada"]').first().click();
      await page.waitForTimeout(800);
      if (movil) { await vis(page, '[data-pace-ritmo-ver]').first().click(); await page.waitForTimeout(600); }
      await vis(page, '[data-pace-ritmo-calendario]').first().click();
      await page.waitForTimeout(800);
      await medir('calendario-a'); await tab('calendario-a', 16);
    });
    pasos.push({ errores: errores.slice(0, 12) });
    await ctx.close();
  }

  if (!parte || parte === 'modulos') {
    const JUEVES = new Date(2026, 10, 5, 10, 0);
    const rutina = (i, nombre) => ({ id: 'custom.176000000000' + i, name: nombre, steps: [{ name: 'Encogimiento de hombros', dur: 20, cue: '' }, { name: 'Giro sentado', dur: 20, cue: '' }], createdAt: 1760000000000 + i, updatedAt: 1760000000000 + i });
    const { estado, eventos } = S.veterana(JUEVES, { lang, palette: c.oscuro ? 'oscuro' : 'crema', ritmo: { libre: true, semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'media', 'libre'] },
      customRoutines: [rutina(1, en ? 'Shoulders after a long call' : 'Hombros después de una llamada larga'), rutina(2, en ? 'Morning' : 'Mañana')] });
    ({ ctx, page, errores } = await L.abrir(Object.assign({}, c, { estado, reloj: JUEVES, espera: 1200 })));
    await S.sembrarEventos(page, eventos).catch(() => {});
    await page.reload(); await page.waitForTimeout(1300);
    await tramo('home-libre', async () => { await medir('home-libre-1000'); });
    await tramo('respira', async () => {
      await pulsar(page, en ? /^\s*Breathe/ : /^\s*Respira/);
      await medir('respira-a-biblioteca'); await tab('respira-a');
      await tarjeta(page, 'breathe.rounds.express');
      await medir('respira-b-aviso-apnea'); await tab('respira-b');
      await page.keyboard.press('Escape'); await page.waitForTimeout(500);
      await tarjeta(page, 'breathe.coherent.55');
      await medir('respira-c-prep');
      await pulsar(page, en ? /Start now/ : /Empezar ahora/, '[data-pace-session-root]');
      await page.clock.fastForward(12000); await page.waitForTimeout(400);
      await medir('respira-d-sesion'); await tab('respira-d', 10);
    });
    for (const [mod, rx, id] of [['mueve', en ? /^\s*Move/ : /^\s*Mueve/, 'extra.chair.squats'], ['estira', en ? /^\s*Stretch/ : /^\s*Estira/, 'move.neck.3']]) {
      await tramo(mod, async () => {
        await pulsar(page, rx); await page.waitForTimeout(400);
        await medir(mod + '-a-biblioteca'); await tab(mod + '-a');
        await tarjeta(page, id);
        await medir(mod + '-b-preview'); await tab(mod + '-b');
        await pulsar(page, en ? /^\s*Start/ : /^\s*Empezar/, '[data-pace-modal-card], [data-pace-session-root]');
        await page.waitForTimeout(800);
        await medir(mod + '-c-preparate'); await tab(mod + '-c', 12);
        for (let i = 0; i < 25; i++) await page.clock.runFor(1000);
        await page.waitForTimeout(300);
        await medir(mod + '-d-runner-25s');
      });
    }
    await tramo('agua', async () => {
      await pulsar(page, en ? /^\s*Hydrate/ : /^\s*Hidrátate/);
      await medir('agua-a'); await tab('agua-a', 12);
    });
    await tramo('logros', async () => {
      await pulsar(page, en ? /achievements/i : /logros/i); await page.waitForTimeout(500);
      await medir('logros-a'); await tab('logros-a');
    });
    await tramo('stats', async () => {
      await pulsar(page, en ? /statistics|stats/i : /estadísticas/i); await page.waitForTimeout(600);
      const hay = await page.evaluate(() => [...document.querySelectorAll('[data-pace-stats-tab]')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getAttribute('data-pace-stats-tab')));
      for (const t of hay) { await page.locator('[data-pace-stats-tab="' + t + '"]').filter({ visible: true }).first().click(); await page.waitForTimeout(700); await medir('stats-' + t); }
      await tab('stats', 16);
    });
    await tramo('rutinas', async () => {
      if (movil) { const panel = page.getByRole('button', { name: en ? /^Open panel/ : /^Abrir panel/ }).filter({ visible: true }); if (await panel.count()) { await panel.first().click(); await page.waitForTimeout(600); } }
      await pulsar(page, en ? /Your routines/i : /Tus rutinas/i);
      await medir('rutinas-a'); await tab('rutinas-a', 12);
      await pulsar(page, en ? /Create|New/i : /Crear|Nueva/i, ARRIBA);
      await medir('rutinas-b-constructor'); await tab('rutinas-b', 16);
    });
    await tramo('ajustes', async () => {
      await page.locator('[data-pace-topbar-ajustes]').filter({ visible: true }).first().click();
      await page.waitForTimeout(700);
      await medir('ajustes-a'); await tab('ajustes-a', 40);
      await page.evaluate(() => { const p = document.querySelector('[data-pace-tweaks-panel]'); if (p) p.scrollTop = p.scrollHeight; });
      await page.waitForTimeout(300);
      await medir('ajustes-a2-abajo');
      const plegada = page.locator('[data-pace-aj-plegada] .pace-aj-sec-accion');
      if (await plegada.isVisible().catch(() => false)) { await plegada.click(); await page.waitForTimeout(600); await medir('ajustes-b-datos'); await tab('ajustes-b', 24); }
    });
    if (movil) await tramo('ajustes-android', async () => {
      await page.evaluate(() => {
        window.paceNativoAvisos = () => true; window.pacePlataformaNativa = () => 'android';
        window.paceNativoAvisoPermiso = () => 'granted'; window.paceEsNativo = () => true;
        window.paceAndroidAvisoExacto = () => 'denied'; window.paceAndroidAvisoExactoMirar = () => Promise.resolve('denied');
        setState((p) => Object.assign({}, p, { notifyFocusEnd: true }));
      });
      await page.locator('[data-pace-topbar-ajustes]').filter({ visible: true }).first().click();
      await page.waitForTimeout(800);
      await medir('ajustes-c-android');
    });
    pasos.push({ errores: errores.slice(0, 12) });
    await ctx.close();
  }
  console.log(JSON.stringify({ tag, pasos }));
  await L.cerrar();
})();
