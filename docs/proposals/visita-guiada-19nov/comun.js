/* Lo común de los guiones de esta maqueta: abrir PACE como alguien que llega por primera vez
   (sin estado, sin service worker, a las 10:00 de un jueves) y pasar la bienvenida como la pasaría. */
'use strict';
const BASE = 'http://localhost:' + (process.env.PUERTO || 8955);

async function abrirNueva(browser, w, h, lang, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: lang === 'es' ? 'es-ES' : 'en-GB',
    timezoneId: 'Europe/Madrid', serviceWorkers: 'block', colorScheme: 'light', deviceScaleFactor: opts.dpr || 1,
    hasTouch: w < 700, isMobile: false,
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] } });
  if (opts.inyecta) await ctx.addInitScript(opts.inyecta);
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date('2026-11-19T10:00:00+01:00') });
  await p.goto(BASE + '/index.html');
  await p.waitForTimeout(1500);
  if (lang === 'en') { await p.locator('button[title*="English"]').first().click().catch(() => {}); await p.waitForTimeout(400); }
  return { ctx, p };
}

/* Comenzar → la semana tal cual → PACE completo → la visita se abre. Con `saltar`, la salta. */
async function pasarBienvenida(p, { saltar = true } = {}) {
  await p.locator('[data-pace-cta]:visible').last().click(); await p.waitForTimeout(600);
  for (let i = 0; i < 6 && !(await p.locator('[data-pace-onb-comenzar]').isVisible().catch(() => false)); i++) {
    await p.locator('[role="dialog"] [data-pace-cta]:visible').last().click(); await p.waitForTimeout(600);
  }
  await p.locator('[data-pace-onb-comenzar]').click();
  await p.locator('[data-pace-visita]').waitFor({ timeout: 4000 });
  await p.waitForTimeout(500);
  if (saltar) { await p.locator('[data-pace-visita-saltar]').click(); await p.waitForTimeout(500); }
}

const vis = (p, sel) => p.locator(sel).filter({ visible: true }).first();
module.exports = { BASE, abrirNueva, pasarBienvenida, vis };
