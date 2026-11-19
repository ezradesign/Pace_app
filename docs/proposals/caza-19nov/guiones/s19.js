const { chromium, abrir, BASE } = require('./lib');
(async () => { const b = await chromium.launch(); const { ctx, page } = await abrir(b, { mobile: true, hora: new Date(2026,10,19,10,0) });
await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
const ver = async (t) => console.log(t, JSON.stringify(await page.evaluate(() => ({ lang: document.documentElement.lang, title: document.title, manifest: document.querySelector('link[rel=manifest]')?.getAttribute('href'), desc: document.querySelector('meta[name=description]')?.content?.slice(0,60) }))));
await ver('es');
await page.getByRole('button', { name: 'Abrir ajustes' }).click(); await page.waitForTimeout(500);
await page.getByRole('button', { name: 'English' }).click(); await page.waitForTimeout(800); await ver('tras English');
await page.keyboard.press('Escape'); await page.waitForTimeout(400);
// el cajón tras cambiar
await page.getByRole('button', { name: 'Open panel' }).click().catch(e => console.log(e.message.split('\n')[0])); await page.waitForTimeout(600);
console.log(await page.evaluate(() => document.querySelector('[data-pace-sidebar]').innerText.replace(/\n+/g,' · ').slice(0,400)));
await b.close(); })();
