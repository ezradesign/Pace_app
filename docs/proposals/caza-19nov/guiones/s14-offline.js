const { chromium, foto, BASE, SEMILLA } = require('./lib');
(async () => { const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, locale: 'es-ES', timezoneId: 'Europe/Madrid', storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }, { name: 'pace.state.v2', value: JSON.stringify(SEMILLA) }] }] } });
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0,200)); });
await page.goto(BASE + '/index.html'); await page.waitForTimeout(4000);
console.log('sw', await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return r ? (r.active ? 'activo ' + r.active.scriptURL : 'sin activo') : 'ninguno'; }));
await page.reload(); await page.waitForTimeout(2500);
await ctx.setOffline(true);
await page.reload().catch(e => console.log('reload', e.message)); await page.waitForTimeout(3000);
await foto(page, 'offline-1');
console.log('dial', await page.locator('[data-pace-dial-number]').count());
await page.getByRole('button', { name: /^Respira/ }).first().click().catch(e => console.log('respira', e.message.split('\n')[0])); await page.waitForTimeout(800);
await page.getByRole('button', { name: 'Box 4·4·4·4', exact: true }).first().click().catch(e => console.log('box', e.message.split('\n')[0])); await page.waitForTimeout(800);
await page.getByRole('button', { name: 'Empezar ahora' }).click().catch(e => console.log('emp', e.message.split('\n')[0])); await page.waitForTimeout(3000);
await foto(page, 'offline-2');
// abrir /premium sin red
await page.goto(BASE + '/premium/').catch(e => console.log('premium', e.message.split('\n')[0])); await page.waitForTimeout(1500); await foto(page, 'offline-3-premium');
console.log('ERR', errs.join(' | ').slice(0, 1500));
await b.close(); })();
