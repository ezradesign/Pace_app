const { chromium } = require('/home/user/Pace_app/node_modules/@playwright/test');
const fs = require('fs');
const [,, cssFile, vp] = process.argv;
const CSS = cssFile !== '-' ? fs.readFileSync(cssFile, 'utf8') : '';
const [w, h] = vp.split('x').map(Number);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, locale: 'es-ES' });
  await ctx.addInitScript(([css]) => { localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } }));
    if (css) document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }); }, [CSS]);
  const page = await ctx.newPage();
  await page.goto('http://localhost:8951/index.html'); await page.locator('[data-pace-dial-number]').waitFor();
  await page.getByRole('button', { name: /^Estira/ }).first().click();
  await page.getByRole('heading', { name: 'Antídoto silla', exact: true }).click();
  await page.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: 'Empezar', exact: true }).click();
  await page.waitForTimeout(200);
  const s = page.getByRole('button', { name: 'Empezar ahora' }); if (await s.isVisible().catch(() => 0)) await s.click();
  await page.locator('[data-pace-v1-glyph]').waitFor(); await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate(() => {
    const pila = document.querySelector('[data-pace-v1-pila="cue"]');
    const vivo = pila.querySelector('[data-pace-v1-cue]');
    const lh = parseFloat(getComputedStyle(vivo).lineHeight);
    const out = [];
    for (const [mod, c] of [['Mueve', window.MOVE_ROUTINES], ['Estira', window.EXTRA_ROUTINES]])
      for (const g of Object.values(c)) for (const it of g.items) for (const st of it.steps) {
        const ins = st.instruction || {};
        for (const [k, t] of [['setup', ins.setup], ['action', ins.action || st.cue]]) {
          if (!t) continue;
          const p = vivo.cloneNode(false); p.removeAttribute('data-pace-v1-cue'); p.className = 'pace-v1-reserva'; p.textContent = t; pila.appendChild(p);
          out.push({ mod, rut: it.id, paso: st.name, k, len: t.length, lin: Math.round(p.getBoundingClientRect().height / lh), t }); p.remove();
        }
      }
    return { lh, fs: getComputedStyle(vivo).fontSize, ancho: vivo.getBoundingClientRect().width, out };
  });
  console.log(JSON.stringify(r));
  await b.close();
})();
