/* La A montada: recorre la visita de verdad (sin cambiar nada al vuelo) y hace una foto por parada,
   a 360 × 640 y 1280 × 800, en es y en → fotos/M-<ancho>-<idioma>-<k>.webp y medidas-montada.json.
   Con la otra manera de dar peso a tu día (la última parada, con su botón para prepararla), pintada
   al vuelo para comparar → fotos/U-<ancho>-<idioma>.webp.
   Uso: PUERTO=8955 node docs/proposals/visita-guiada-19nov/monta.js (con el index.html de esta rama servido). */
'use strict';
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { BASE, abrirNueva, pasarBienvenida } = require('./comun.js');

const RAIZ = path.resolve(__dirname, '../../..');
const FOTOS = path.join(__dirname, 'fotos');
const TAM = [[360, 640], [1280, 800]];
const IDIOMAS = (process.env.IDIOMAS || 'es,en').split(',');

/* La otra manera: tu día al final, y el botón de la última parada dice «Preparar jornada». */
const ULTIMA = {
  es: { 'visita.dia.titulo': 'Y ahora, tu día', 'visita.fin': 'Preparar jornada' },
  en: { 'visita.dia.titulo': 'And now, your day', 'visita.fin': 'Plan my day' },
};
function variante(base, lang) {
  /* El build quita la sangría y pega `];` a la última: se reordena por líneas, una parada en cada una. */
  const h = base.replace(/const PACE_VISITA_PARADAS = \[\n([\s\S]*?)\];/, (m, cuerpo) => {
    const filas = cuerpo.trim().split('\n').map((f) => f.trim().replace(/,$/, ''));
    const dia = filas.findIndex((f) => f.includes("id: 'dia'"));
    filas.push(filas.splice(dia, 1)[0]);
    return 'const PACE_VISITA_PARADAS = [\n' + filas.join(',\n') + '];';
  });
  if (h === base) throw new Error('no casan las paradas en index.html');
  const i = h.lastIndexOf('</body>');
  return h.slice(0, i) + '<script>Object.assign(window.PACE_STRINGS.' + lang + ',' + JSON.stringify(ULTIMA[lang]) + ');</script>' + h.slice(i);
}

const medirParada = (p) => p.evaluate(() => {
  const tj = document.querySelector('[data-pace-visita-tarjeta]').getBoundingClientRect();
  const hu = document.querySelector('[data-pace-visita-hueco]');
  const b = hu ? hu.getBoundingClientRect() : null;
  const pisa = b ? Math.max(0, Math.min(tj.right, b.right) - Math.max(tj.left, b.left)) * Math.max(0, Math.min(tj.bottom, b.bottom) - Math.max(tj.top, b.top)) : 0;
  return { id: document.querySelector('[data-pace-visita]').getAttribute('data-pace-visita'),
    meta: document.querySelector('[data-pace-visita] .pace-meta').textContent,
    dentro: tj.left >= 0 && tj.top >= 0 && tj.right <= innerWidth && tj.bottom <= innerHeight,
    tarjetaAlto: Math.round(tj.height), pisaHueco: Math.round(pisa) };
});
const quieta = (p) => p.waitForFunction(() => ['[data-pace-visita-tarjeta]', '[data-pace-visita-hueco]'].every((s) => {
  const el = document.querySelector(s); return !el || el.getAnimations().every((a) => a.playState === 'finished');
}), null, { polling: 60 });

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  const base = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const browser = await chromium.launch();
  const conv = await (await browser.newContext()).newPage();
  const webp = async (png, archivo, ancho) => {
    const b64 = await conv.evaluate(async ([src, an]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + src; await img.decode();
      const c = document.createElement('canvas'); c.width = an; c.height = Math.round(img.height * an / img.width);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.8).split(',')[1];
    }, [png.toString('base64'), ancho]);
    fs.writeFileSync(path.join(FOTOS, archivo), Buffer.from(b64, 'base64'));
  };
  const foto = async (p, nombre, w) => webp(await p.screenshot(), nombre + '.webp', w < 700 ? 540 : 1280);
  const medidas = [];
  for (const lang of IDIOMAS) for (const [w, h] of TAM) {
    let { ctx, p } = await abrirNueva(browser, w, h, lang, { dpr: w < 700 ? 2 : 1 });
    await pasarBienvenida(p, { saltar: false });
    for (let k = 1; k < 10 && await p.locator('[data-pace-visita]').count(); k++) {
      await quieta(p);
      medidas.push({ w, lang, k, ...(await medirParada(p)) });
      await foto(p, `M-${w}-${lang}-${k}`, w);
      await p.locator('[data-pace-visita-siguiente]').click(); await p.waitForTimeout(150);
    }
    await ctx.close();
    /* La otra manera: hasta la última parada y una foto. */
    ({ ctx, p } = await abrirNueva(browser, w, h, lang, { dpr: w < 700 ? 2 : 1 }));
    await ctx.route('**/index.html', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: variante(base, lang) }));
    await p.goto(BASE + '/index.html'); await p.waitForTimeout(1500);
    if (lang === 'en') { await p.locator('button[title*="English"]').first().click().catch(() => {}); await p.waitForTimeout(400); }
    await pasarBienvenida(p, { saltar: false });
    while ((await p.locator('[data-pace-visita]').getAttribute('data-pace-visita')) !== 'dia') {
      await p.locator('[data-pace-visita-siguiente]').click(); await p.waitForTimeout(150); await quieta(p);
    }
    await quieta(p);
    medidas.push({ w, lang, otra: 'ultima', ...(await medirParada(p)) });
    await foto(p, `U-${w}-${lang}`, w);
    await ctx.close();
    console.log('hecho', lang, w);
  }
  fs.writeFileSync(path.join(__dirname, 'medidas-montada.json'), JSON.stringify(medidas, null, 1));
  for (const m of medidas) console.log(!m.dentro || m.pisaHueco > 0 ? 'OJO' : 'ok ', JSON.stringify(m));
  await browser.close();
})();
