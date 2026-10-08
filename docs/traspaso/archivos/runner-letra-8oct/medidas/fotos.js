const { chromium } = require('/home/user/Pace_app/node_modules/@playwright/test');
const fs = require('fs');
const OPC = { antes: '', A: fs.readFileSync('optA.css', 'utf8'), B: fs.readFileSync('optB.css', 'utf8'), C: fs.readFileSync('optC.css', 'utf8'), At: fs.readFileSync('optA.css', 'utf8') };
const CORTO = 'Manos al borde de la mesa, algo más abiertas que los hombros. Pasos atrás, cuerpo recto.';
const VPS = [[360, 640], [375, 667], [412, 844], [1280, 720], [1530, 702]];
const RUT = [['Mueve', 'Flexiones de escritorio', 'mueve'], ['Estira', 'Cadena posterior', 'estira']];
(async () => {
  const b = await chromium.launch();
  const med = [];
  for (const [w, h] of VPS) for (const [op, css] of Object.entries(OPC)) {
    const movil = w <= 640;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: movil ? 1.5 : 1, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
    await ctx.addInitScript(([css]) => { localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } }));
      if (css) document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }); }, [css]);
    const page = await ctx.newPage();
    for (const [mod, nombre, slug] of RUT) {
      await page.goto('http://localhost:8951/index.html'); await page.locator('[data-pace-dial-number]').waitFor();
      if (op === 'At') await page.evaluate((t) => { window.MOVE_ROUTINES.empuje.items[0].steps.forEach(s => { if (s.instruction && s.instruction.setup) s.instruction.setup = t; }); }, CORTO);
      await page.getByRole('button', { name: new RegExp('^' + mod) }).first().click();
      await page.getByRole('heading', { name: nombre, exact: true }).click();
      await page.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: 'Empezar', exact: true }).click();
      await page.waitForTimeout(200);
      const s = page.getByRole('button', { name: 'Empezar ahora' }); if (await s.isVisible().catch(() => 0)) await s.click();
      await page.locator('[data-pace-v1-glyph]').waitFor(); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(500);
      const aro = await page.evaluate(() => Math.round(document.querySelector('[data-pace-v1-glyph]').getBoundingClientRect().width));
      const clip = movil ? undefined : { x: Math.round(w / 2 - 380), y: 0, width: 760, height: h };
      const f = `fotos/${op}_${slug}_${w}x${h}.jpg`;
      await page.screenshot({ path: f, type: 'jpeg', quality: 72, clip });
      med.push({ op, slug, vp: w + 'x' + h, aro });
      process.stderr.write(f + ' ' + aro + '\n');
    }
    await ctx.close();
  }
  fs.writeFileSync('fotos/medidas.json', JSON.stringify(med));
  await b.close();
})();
