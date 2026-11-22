const X = require('./explora');
const JORNADA = { fecha: '2026-11-23', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const ANDROID = () => {
  window.__min = 0;
  const nada = () => Promise.resolve(null);
  window.Capacitor = { getPlatform: () => 'android', isNativePlatform: () => true,
    Plugins: { App: { addListener: () => ({ remove() {} }), minimizeApp: () => { window.__min++; return Promise.resolve(); } }, KeepAwake: { keepAwake: nada, allowSleep: nada } } };
};
const vis = (p, s) => p.locator(s).filter({ visible: true }).first();
const hacerla = (id) => async (p) => { await p.evaluate((x) => { const r = window.resolveBodyRoutine(x); window.dispatchEvent(new CustomEvent('pace:hacerla', { detail: { routine: r.routine, kind: r.source } })); }, id); await p.waitForTimeout(1200); };
const CASOS = [
  { n: 'cajón', abre: async (p) => vis(p, 'button[aria-label="Abrir panel"]').click() },
  { n: 'stats', abre: async (p) => vis(p, 'button[aria-label="Ver estadísticas"]').click() },
  { n: 'ajustes', abre: async (p) => vis(p, 'button[aria-label="Abrir ajustes"]').click() },
  { n: 'ajustes › tus datos', abre: async (p) => { await vis(p, 'button[aria-label="Abrir ajustes"]').click(); await p.waitForTimeout(500); await p.getByRole('button', { name: /Copias, borrar/ }).click(); } },
  { n: 'biblioteca Estira', abre: async (p) => vis(p, 'button:has-text("Estira")').click() },
  { n: 'runner Estira (prep)', abre: hacerla('move.neck.3') },
  { n: 'runner Estira (en marcha)', abre: async (p) => { await hacerla('move.neck.3')(p); await p.clock.runFor(8000); } },
  { n: 'runner Mueve (en marcha)', abre: async (p) => { await hacerla('extra.desk.pushups')(p); await p.clock.runFor(8000); } },
  { n: 'hoja del día (Ver todo)', semilla: { ritmo: { dia: JORNADA } }, hora: '2026-11-23T09:00:00+01:00', abre: async (p) => vis(p, '[data-pace-ritmo-ver]').click() },
  { n: 'Hidrátate', abre: async (p) => vis(p, 'button:has-text("Hidrátate")').click() },
];
(async () => {
  for (const c of CASOS) {
    const { context, page, errores } = await X.abrir({ w: 360, h: 640, lang: 'es', semilla: c.semilla || {}, hora: c.hora, init: ANDROID });
    try {
      await c.abre(page); await page.waitForTimeout(800);
      const antes = await page.evaluate(() => ({ dialogs: document.querySelectorAll('[role=dialog]').length, sesion: !!document.querySelector('[data-pace-session-root]'), aside: (() => { const a = document.querySelector('aside[data-pace-sidebar]'); if (!a) return null; const r = a.getBoundingClientRect(); return r.right > 10 && r.width > 50; })() }));
      const r = await page.evaluate(() => window.paceAndroidAtras ? window.paceAndroidAtras() : 'sin función');
      await page.waitForTimeout(700);
      const despues = await page.evaluate(() => ({ dialogs: document.querySelectorAll('[role=dialog]').length, sesion: !!document.querySelector('[data-pace-session-root]'), min: window.__min, aside: (() => { const a = document.querySelector('aside[data-pace-sidebar]'); if (!a) return null; const r = a.getBoundingClientRect(); return r.right > 10 && r.width > 50; })() }));
      console.log(c.n.padEnd(28), 'antes', JSON.stringify(antes), '→', r, JSON.stringify(despues), errores.length ? errores.join(' | ') : '');
      await X.foto(page, 'atras-' + c.n.replace(/[^a-z]+/gi, '_'));
    } catch (e) { console.log('!!', c.n, e.message.split('\n')[0]); }
    await context.close();
  }
  await X.cerrar();
})();
