'use strict';
// La pausa «por libre» repite el módulo de la propuesta en las cuatro puertas. Fotos de hoy y de tres arreglos.
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/@playwright/test');
const { spawn } = require('child_process');
const PORT = 8778, BASE = 'http://localhost:' + PORT;
const CASOS = [
  { n: 'agua', min: 25, hora: '2026-10-09T13:00:00+02:00', etiqueta: 'Hidrátate' },
  { n: 'estira', min: 35, hora: '2026-10-09T10:00:00+02:00', etiqueta: 'Estira' },
];
const VPS = [{ n: '360', w: 360, h: 640 }, { n: '1280', w: 1280, h: 800 }];

async function variante(page, v, etiqueta) {
  await page.evaluate(([v, etiqueta]) => {
    const prop = document.querySelector('[data-pace-break-prop]');
    const rejilla = prop && prop.parentElement && prop.parentElement.nextElementSibling;
    if (!rejilla) throw new Error('sin rejilla');
    const puertas = Array.from(rejilla.querySelectorAll(':scope > button'));
    const repetida = puertas.find((b) => b.textContent.trim().startsWith(etiqueta));
    if (v === 'hoy') return;
    if (v === 'A' || v === 'C') { repetida.style.display = 'none'; }
    if (v === 'A') rejilla.style.gridTemplateColumns = 'repeat(3, 1fr)';
    if (v === 'C') { /* C: la puerta repetida se va y las tres quedan en 2+1 como hoy */ }
    if (v === 'B') {
      repetida.style.display = 'none';
      rejilla.style.display = 'flex'; rejilla.style.flexWrap = 'wrap'; rejilla.style.gap = '4px 16px'; rejilla.style.flexWrap = 'nowrap'; rejilla.style.justifyContent = 'center';
      for (const b of puertas) {
        if (b === repetida) continue;
        Object.assign(b.style, { flexDirection: 'row', alignItems: 'center', gap: '6px', padding: '8px 2px', background: 'transparent', border: 'none' });
        const glifo = b.children[b.children.length - 2]; if (glifo) { glifo.style.fontSize = '16px'; }
        const t = b.lastElementChild && b.lastElementChild.firstElementChild; if (t) { t.style.fontSize = '17px'; t.style.marginBottom = '0'; }
        b.onmouseenter = null;
      }
    }
  }, [v, etiqueta]);
  await page.waitForTimeout(200);
}

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: R, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const browser = await chromium.launch();
  const medidas = [];
  try {
    for (const caso of CASOS) for (const vp of VPS) {
      for (const v of ['B']) {
        if (caso.n === 'estira' && vp.n === '1280') continue;
        const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 2, locale: 'es-ES', timezoneId: 'Europe/Madrid', isMobile: vp.w < 700, hasTouch: vp.w < 700 });
        await ctx.addInitScript(([min]) => {
          if (localStorage.getItem('pace.state.v2')) return;
          localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', lastActiveDay: 'Fri Oct 09 2026',
            ritmo: { libre: true }, focusMinutes: min, water: { today: 0, goal: 8 } }));
        }, [caso.min]);
        const page = await ctx.newPage();
        await page.clock.install({ time: new Date(caso.hora) });
        await page.goto(BASE + '/index.html');
        await page.locator('[data-pace-dial-number]').waitFor();
        await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
        await page.waitForTimeout(250);
        for (let i = 0; i < caso.min + 4; i++) { await page.clock.fastForward(60000); await page.waitForTimeout(50); if (await page.locator('[data-pace-break-shortcut]').count()) break; }
        await page.waitForTimeout(900);
        await variante(page, v, caso.etiqueta);
        const alto = await page.evaluate(() => { const m = document.querySelector('[data-pace-break-shortcut]').closest('[role="dialog"]') || document.querySelector('[data-pace-break-shortcut]').parentElement; return Math.round(m.getBoundingClientRect().height); });
        medidas.push(caso.n + ' ' + vp.n + ' ' + v + ': ' + alto + ' px');
        await page.screenshot({ path: __dirname + '/' + caso.n + '-' + vp.n + '-' + v + '.png' });
        await ctx.close();
      }
    }
  } finally { await browser.close(); srv.kill(); }
  console.log(medidas.join('\n'));
})().catch(e => { console.error(e); process.exit(1); });
