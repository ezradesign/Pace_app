// Compara, antes y después, qué propone la app en 60 días: pozos de «A tu ritmo»,
// «Para ahora» de Respira y la técnica de Respira del menú de pausa.
'use strict';
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/respira-bugs-graves-31faf7';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } };

async function medir(browser, pagina) {
  const ctx = await browser.newContext({ locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript((s) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); }, SEMILLA);
  const page = await ctx.newPage();
  await page.goto('http://localhost:8791/' + pagina);
  await page.locator('[data-pace-dial-number]').waitFor();
  const out = await page.evaluate(() => {
    const dias = [];
    const base = new Date(2026, 9, 1);
    const cat = [];
    Object.keys(window.BREATHE_ROUTINES).forEach(g => window.BREATHE_ROUTINES[g].items.forEach(r => cat.push(r)));
    for (let i = 0; i < 60; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const p = window.ritmoPozos({}, iso);
      const ahora = window.libraryParaAhora(cat, iso, 1, (r) => !r.safety);
      const pausa = window.breakElige(window.BREATHE_ROUTINES, iso);
      dias.push({
        iso,
        ritmo: Object.keys(p).map(k => k + ':' + p[k].map(r => r.id).join(',')).join(' | '),
        ahora: ahora && ahora[0] && ahora[0].id,
        pausa: pausa && pausa.id,
      });
    }
    return dias;
  });
  await ctx.close();
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const a = await medir(browser, '_antes.html');
  const d = await medir(browser, 'index.html');
  await browser.close();
  let ritmoDistinto = 0, ahoraBh = 0, pausaBh = 0, ahoraCambia = 0, pausaCambia = 0;
  const ejemplos = [];
  a.forEach((x, i) => {
    const y = d[i];
    if (x.ritmo !== y.ritmo) ritmoDistinto++;
    if (x.ahora === 'breathe.bellows') ahoraBh++;
    if (x.pausa === 'breathe.bellows') pausaBh++;
    if (x.ahora !== y.ahora) ahoraCambia++;
    if (x.pausa !== y.pausa) { pausaCambia++; if (ejemplos.length < 4) ejemplos.push(x.iso + ' pausa ' + x.pausa + ' -> ' + y.pausa); }
    if (y.ahora === 'breathe.bellows' || y.pausa === 'breathe.bellows' || /bellows/.test(y.ritmo)) console.log('¡DESPUÉS sigue saliendo Bhastrika!', y.iso);
  });
  console.log(JSON.stringify({ dias: a.length, ritmoDistinto, bhastrikaEnParaAhoraAntes: ahoraBh, bhastrikaEnPausaAntes: pausaBh, paraAhoraCambia: ahoraCambia, pausaCambia, ejemplos, ritmoContieneBellowsAntes: a.some(x => /bellows/.test(x.ritmo)) }, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
