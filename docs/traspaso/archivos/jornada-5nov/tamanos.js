/* Fotos del aro para decidir X o Y: la 0.190.0 (commit d334afec) frente a la rama, y la página corta. */
'use strict';
const C = require('./comun');
const { execFileSync } = require('child_process');
const sharp = require('C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/node_modules/sharp');
const SAL = C.path.join(C.FOTOS, 'tamanos');
const TAM = [[1917, 857], [1536, 710]];
const hoyIndex = execFileSync('git', ['-C', C.RAIZ, 'show', 'd334afec:index.html'], { encoding: 'utf8', maxBuffer: 1 << 28 });
const SIN_FRASE = '[data-pace-ritmo-como]{display:none!important}';

async function pagina(b, viejo, w, h) {
  const context = await b.newContext({ viewport: { width: w, height: h }, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  await context.addInitScript(() => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 } } })); });
  const page = await context.newPage();
  if (viejo) await page.route('**/index.html*', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: hoyIndex }));
  await page.clock.install({ time: new Date('2026-11-03T09:05:00+01:00') });
  await page.goto(C.BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'attached', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  return { context, page };
}
(async () => {
  C.fs.mkdirSync(SAL, { recursive: true });
  const srv = await C.servidor();
  const b = await C.chromium.launch();
  const med = {};
  const foto = async (page, n) => {
    await page.waitForTimeout(600);
    const x = await C.medir(page);
    med[n] = { aro: x.dial, scroll: x.scroll };
    await page.screenshot({ path: C.path.join(SAL, n + '.png') });
  };
  try {
    for (const [w, h] of TAM) {
      const t = w + 'x' + h;
      let s = await pagina(b, true, w, h);
      await foto(s.page, 'sin-hoy-' + t);
      await s.context.close();
      s = await pagina(b, false, w, h);
      await foto(s.page, 'sin-2b-' + t);
      await s.page.evaluate(() => ritmoElegir('jornada'));
      await foto(s.page, 'prep-y-' + t);
      await s.page.addStyleTag({ content: SIN_FRASE });
      await foto(s.page, 'prep-x-' + t);
      await s.context.close();
    }
  } finally { await b.close(); if (srv) srv.kill(); }
  console.log(JSON.stringify(med));
  const img = async (n) => 'data:image/webp;base64,' + (await sharp(C.path.join(SAL, n + '.png')).resize({ width: 1100 }).webp({ quality: 74 }).toBuffer()).toString('base64');
  const fig = async (n, tit, sub) => `<figure><img src="${await img(n)}" alt="${tit}"><figcaption><b>${med[n].aro} px</b><span>${tit}</span>${sub ? `<small>${sub}</small>` : ''}</figcaption></figure>`;
  let cuerpo = '';
  for (const [w, h] of TAM) {
    const t = w + 'x' + h;
    cuerpo += `<section><h2>${w}×${h}${w === 1536 ? ', tu portátil' : ''}</h2>
<h3>Antes de elegir el día</h3><div class="par">${await fig('sin-hoy-' + t, 'Hoy')}${await fig('sin-2b-' + t, 'Con 2B', 'Ya montado en la rama')}</div>
<h3>Con la jornada entera preparada</h3><div class="par">${await fig('prep-y-' + t, 'Y · con la frase', 'Como hoy')}${await fig('prep-x-' + t, 'X · sin la frase', '«Cada bloque es un pomodoro…» se va')}</div></section>`;
  }
  const html = `<title>Tamaño del aro</title>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Inter+Tight:wght@400;600&display=swap">
<style>
/* Una hoja para mirar: la paleta clara de PACE y las fotos a todo el ancho posible. */
:root { --paper:#F2EDE0; --ink:#1F1C17; --ink2:#4A453C; --ink3:#77705F; --line:#C9C0A8; --serif:"Cormorant Garamond",Georgia,serif; --sans:"Inter Tight","Segoe UI",system-ui,sans-serif; }
* { box-sizing:border-box; }
body { background:var(--paper); color:var(--ink); font-family:var(--sans); font-size:15px; line-height:1.5; margin:0; padding-block:24px 48px; padding-left:max(16px,env(safe-area-inset-left,0px)); padding-right:max(16px,env(safe-area-inset-right,0px)); }
main { max-width:1280px; margin:0 auto; display:grid; gap:36px; }
h1,h2 { font-family:var(--serif); font-style:italic; font-weight:500; line-height:1.1; margin:0; }
h1 { font-size:38px; } h2 { font-size:28px; }
h3 { font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink3); font-weight:600; margin:18px 0 8px; }
p { margin:6px 0 0; max-width:62ch; color:var(--ink2); }
.par { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
figure { margin:0; min-width:0; display:grid; gap:6px; }
img { display:block; width:100%; height:auto; border:1px solid var(--line); border-radius:10px; }
figcaption { display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 10px; }
figcaption b { font-size:22px; font-weight:600; font-variant-numeric:tabular-nums; }
figcaption small { font-size:13px; color:var(--ink3); }
@media (max-width:640px) { .par { grid-template-columns:minmax(0,1fr); } }
</style>
<main>
<header><h1>El tamaño del aro</h1><p>Fotos reales, con la barra lateral abierta. El número es lo que mide el aro en esa ventana. Ninguna pide scroll salvo donde se indique.</p></header>
${cuerpo}
</main>`;
  C.fs.writeFileSync(C.path.join(C.RAIZ, 'docs/proposals/jornada-aro-tamanos.html'), html);
  console.log('KB', Math.round(html.length / 1024));
})().catch((e) => { console.error(e); process.exit(1); });
