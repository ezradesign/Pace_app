const { chromium } = require('./lib');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 360, height: 640 }, serviceWorkers: 'block' })).newPage();
await p.goto('http://localhost:8946/'); await p.waitForTimeout(1000);
console.log(await p.evaluate(() => [...document.querySelectorAll('button,[role=button],a')].filter(el => el.getBoundingClientRect().width && !(el.getAttribute('aria-label') || el.textContent || el.title || '').trim()).map(e => e.outerHTML.slice(0, 300))));
console.log(await p.evaluate(() => [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).map(i => i.src).slice(0,5)));
await b.close(); })();
