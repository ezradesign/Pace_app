'use strict';
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/caza-rendimiento-9nov';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const sharp = require(WT + '/node_modules/sharp');
const fs = require('fs');
const familias = [['EB Garamond', ['normal', 'italic'], [300, 400, 500, 600, 700]], ['Cormorant Garamond', ['normal', 'italic'], [300, 400, 500, 600, 700]], ['Inter Tight', ['normal', 'italic'], [200, 300, 400, 500, 600, 700, 800]]];
let cuerpo = '';
for (const [f, estilos, pesos] of familias) for (const e of estilos) for (const w of pesos)
  cuerpo += `<p style="font-family:'${f}';font-style:${e};font-weight:${w}">${f} ${e} ${w} · Respira, mueve, estira 0123456789 ÁÉÍÓÚñ «¿Qué?» — 25:00</p>`;
(async () => {
  const browser = await chromium.launch();
  const res = {};
  for (const v of ['antes', 'despues']) {
    const css = fs.readFileSync('fuentes-' + v + '.css', 'utf8');
    for (const dpr of [1, 2]) {
      const ctx = await browser.newContext({ viewport: { width: 900, height: 600 }, deviceScaleFactor: dpr });
      const p = await ctx.newPage();
      const pedidas = [];
      p.on('request', (r) => { if (/woff2/.test(r.url())) pedidas.push(r.url().split('/').pop()); });
      await p.route('**/__fuentes.html', (r) => r.fulfill({ contentType: 'text/html', body: `<!doctype html><style>${css} body{margin:8px;font-size:17px;line-height:1.25} p{margin:0;white-space:nowrap}</style>${cuerpo}` }));
      await p.goto('http://localhost:8910/__fuentes.html');
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(300);
      const anchos = await p.evaluate(() => [...document.querySelectorAll('p')].map((e) => { const r = document.createRange(); r.selectNodeContents(e); return +r.getBoundingClientRect().width.toFixed(2); }));
      const png = await p.screenshot({ fullPage: true });
      fs.writeFileSync(`salida/fuentes-${v}-${dpr}.png`, png);
      res[v + dpr] = { anchos, pedidas: [...new Set(pedidas)] };
      await ctx.close();
    }
  }
  for (const dpr of [1, 2]) {
    const a = await sharp(`salida/fuentes-antes-${dpr}.png`).raw().toBuffer({ resolveWithObject: true });
    const d = await sharp(`salida/fuentes-despues-${dpr}.png`).raw().toBuffer({ resolveWithObject: true });
    let n = 0; if (a.data.length === d.data.length) for (let i = 0; i < a.data.length; i++) if (a.data[i] !== d.data[i]) n++;
    const difA = res['antes' + dpr].anchos.map((x, i) => +(x - res['despues' + dpr].anchos[i]).toFixed(2)).filter((x) => x !== 0);
    console.log('dpr', dpr, a.info.width + 'x' + a.info.height, 'vs', d.info.width + 'x' + d.info.height, 'canales distintos', n, '| anchos distintos', difA.length);
  }
  console.log('antes pide', res.antes1.pedidas.length, res.antes1.pedidas.join(' '));
  console.log('despues pide', res.despues1.pedidas.length, res.despues1.pedidas.join(' '));
  const w = res.antes1.anchos; console.log('anchos Inter normal 200..800 (antes):', w.slice(20, 27).join(' '));
  await browser.close();
})();
