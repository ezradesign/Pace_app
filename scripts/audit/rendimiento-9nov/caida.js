'use strict';
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/caza-rendimiento-9nov';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const { SEMILLA, CLAVE_ESTADO } = require(WT + '/tests/helpers.js');
const PUERTO = Number(process.argv[2] || 8910), MODO = process.argv[3] || 'salto';
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: 'es-ES', timezoneId: 'Europe/Madrid', serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  page.on('crash', () => console.log('CRASH'));
  await page.clock.install({ time: new Date('2026-11-10T13:50:00+01:00') });
  await context.addInitScript(([k, s]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(s)); }, [CLAVE_ESTADO, SEMILLA]);
  await page.goto('http://localhost:' + PUERTO + '/');
  await page.locator('[data-pace-dial-number]').waitFor();
  const cdp = await context.newCDPSession(page);
  const heap = async () => { const h = await cdp.send('Runtime.getHeapUsage'); return +(h.usedSize / 1048576).toFixed(1); };
  await page.clock.runFor(10 * 60 * 1000); // 14:00
  console.log('14:00 heap', await heap());
  const vis = (v) => page.evaluate((v) => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (v ? 'hidden' : 'visible') }); Object.defineProperty(document, 'hidden', { configurable: true, get: () => v }); document.dispatchEvent(new Event('visibilitychange')); }, v);
  if (MODO === 'salto') { await page.clock.fastForward('01:00:00'); await page.clock.runFor(1000); }
  else if (MODO === 'saltooculta') { await vis(true); await page.clock.fastForward('01:00:00'); await vis(false); await page.clock.runFor(1000); }
  else if (MODO === 'sinsalto') { await page.clock.runFor(60 * 60 * 1000); }
  console.log('15:00 heap', await heap(), 'texto aro:', await page.locator('[data-pace-dial-number]').textContent());
  const b = page.getByRole('button', { name: 'Empezar foco', exact: true });
  console.log('empezar visible:', await b.count() ? await b.first().isVisible() : false);
  if (process.argv[4] === 'foco' && await b.count()) await b.first().click();
  for (let s = 0; s < 60; s++) {
    const t0 = Date.now();
    try { await page.clock.runFor(30 * 1000); } catch (e) { console.log('cae en el paso', s, e.message.slice(0, 80)); break; }
    if (s % 4 === 0 || Date.now() - t0 > 3000) console.log('paso', s, 'heap', await heap(), 'real ms', Date.now() - t0, await page.evaluate(() => new Date().toTimeString().slice(0, 8)));
  }
  await browser.close();
})().catch((e) => { console.error('ERR', e.message.slice(0, 300)); process.exit(1); });
