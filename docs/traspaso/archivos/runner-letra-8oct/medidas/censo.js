// Uso: node censo.js <salida.json> [css-extra-file] [vps]
const { chromium } = require('/home/user/Pace_app/node_modules/@playwright/test');
const fs = require('fs');
const [,, salida, cssFile, vpsArg, soloArg] = process.argv;
const CSS = cssFile && cssFile !== '-' ? fs.readFileSync(cssFile, 'utf8') : '';
const VPS = (vpsArg || '360x640,375x667,412x844,1280x720,1530x702').split(',').map(s => s.split('x').map(Number));
const BASE = 'http://localhost:' + (process.env.PACE_E2E_PORT || 8951) + '/index.html';
const SEM = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } };
(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const [w, h] of VPS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
    await ctx.addInitScript(([e, css]) => {
      if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
      if (css) document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); });
    }, [SEM, CSS]);
    const page = await ctx.newPage();
    await page.goto(BASE); await page.locator('[data-pace-dial-number]').waitFor();
    const cat = await page.evaluate(() => {
      const r = [];
      for (const [mod, c] of [['Mueve', window.MOVE_ROUTINES], ['Estira', window.EXTRA_ROUTINES]])
        for (const g of Object.values(c || {})) for (const it of (g.items || [])) r.push({ mod, id: it.id, title: it.title || it.name });
      return r;
    });
    for (const rt of cat) {
      if (soloArg && !soloArg.split('|').includes(rt.id)) continue;
      try {
        await page.goto(BASE); await page.locator('[data-pace-dial-number]').waitFor();
        await page.getByRole('button', { name: new RegExp('^' + rt.mod) }).first().click();
        const bds = page.locator('[data-pace-modal-backdrop]');
        const ids = await page.evaluate((id) => { const el = document.querySelector('[data-pace-routine-id="' + id + '"]'); return !!el; }, rt.id);
        const titulo = await page.evaluate((rid) => (window.paceT ? null : null), rt.id);
        // abrir por título traducido
        const name = await page.evaluate((rid) => {
          const all = [window.MOVE_ROUTINES, window.EXTRA_ROUTINES];
          return null;
        }, rt.id);
        await page.getByRole('heading', { name: rt.t || rt.title, exact: true }).first().click({ timeout: 4000 });
        await bds.last().getByRole('button', { name: 'Empezar', exact: true }).click();
        const saltar = page.getByRole('button', { name: 'Empezar ahora' });
        await page.waitForTimeout(150);
        if (await saltar.isVisible().catch(() => false)) await saltar.click();
        await page.locator('[data-pace-v1-glyph]').waitFor({ timeout: 5000 });
        await page.waitForTimeout(400);
        const m = await page.evaluate(() => {
          const g = document.querySelector('[data-pace-v1-glyph]').getBoundingClientRect();
          const pila = document.querySelector('[data-pace-v1-pila="cue"]');
          const lh = parseFloat(getComputedStyle(pila.lastElementChild).lineHeight);
          let max = { h: 0, t: '' };
          for (const c of pila.children) { const hh = c.getBoundingClientRect().height; if (hh > max.h) max = { h: hh, t: c.textContent }; }
          const nom = document.querySelector('[data-pace-v1-pila="nombre"]').getBoundingClientRect().height;
          const cola = document.querySelector('[data-pace-v1-pila="cola"]').getBoundingClientRect().height;
          const c = document.querySelector('[data-pace-session-center]');
          return { aro: Math.round(g.width), cueH: Math.round(pila.getBoundingClientRect().height), lineas: Math.round(max.h / lh), larga: max.t, largaLen: max.t.length,
            nomH: Math.round(nom), colaH: Math.round(cola), justo: !!document.querySelector('[data-pace-v1-justo]'),
            desborde: c ? c.scrollHeight - Math.round(c.getBoundingClientRect().height) : null,
            scrollDoc: document.documentElement.scrollHeight - innerHeight };
        });
        out.push({ vp: w + 'x' + h, ...rt, ...m });
        process.stderr.write(`${w}x${h} ${rt.mod} ${rt.id} aro=${m.aro} lineas=${m.lineas}\n`);
      } catch (e) { out.push({ vp: w + 'x' + h, ...rt, error: String(e).slice(0, 200) }); process.stderr.write(`ERR ${rt.id} ${String(e).slice(0,120)}\n`); }
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(salida, JSON.stringify(out, null, 1));
})();
