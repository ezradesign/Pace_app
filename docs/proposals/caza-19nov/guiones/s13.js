const { chromium, abrir, BASE } = require('./lib');
(async () => { const b = await chromium.launch(); const { ctx, page } = await abrir(b, { mobile: true, hora: new Date(2026,10,16,11,0) });
await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
const chk = async (t) => console.log(t, JSON.stringify(await page.evaluate(() => { const e = [...document.querySelectorAll('button')].find(x => x.getAttribute('aria-label') === 'Empezar foco' || x.textContent.trim() === 'Empezar foco'); const oc = e && e.closest('[inert],[aria-hidden=true]'); const dl = [...document.querySelectorAll('[role=dialog]')].map(d => d.getAttribute('aria-modal') + '/' + (d.getAttribute('aria-label') || d.getAttribute('aria-labelledby'))); return { tapado: !!oc, dialogos: dl }; })));
await page.getByRole('button', { name: /^Respira/ }).first().click(); await page.waitForTimeout(800); await chk('biblioteca');
await page.getByRole('button', { name: 'Box 4·4·4·4', exact: true }).first().click(); await page.waitForTimeout(800); await chk('sesion');
const snap = await page.accessibility ? null : null;
const tree = await page.locator('body').ariaSnapshot(); console.log(tree.split('\n').slice(0, 40).join('\n'));
await b.close(); })();
