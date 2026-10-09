/* PACE · caza de bugs, respuestas de Ez: fotos de antes y después (8 oct. 2026)
   Uso, con el index.html construido en cada carpeta:
     node docs/traspaso/archivos/caza-final-8oct/fotos.js <carpeta-de-la-app> <puerto> <antes|despues> [tomas]
   Levanta su servidor en ese puerto y deja los JPEG junto a este archivo. «antes» se saca
   de una copia de origin/main y «despues» de la rama. Lo que no existe en una de las dos
   (el diálogo nuevo) sale como lo que pasa en ella. */
'use strict';

const path = require('path');
const { spawn } = require('child_process');
const AQUI = __dirname;
const RAIZ = path.resolve(process.argv[2] || path.resolve(AQUI, '../../../..'));
const PUERTO = Number(process.argv[3] || 8787);
const CUAL = process.argv[4] || 'despues';
const { chromium } = require(path.resolve(AQUI, '../../../../node_modules/@playwright/test'));

const BASE = 'http://localhost:' + PUERTO + '/index.html';
const VP = [[360, 640], [1280, 800]];

async function abrir(b, w, h, estado, reloj) {
  const movil = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: movil, hasTouch: movil, locale: 'es-ES', deviceScaleFactor: movil ? 2 : 1 });
  await ctx.addInitScript((e) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); },
    Object.assign({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true } }, estado));
  const p = await ctx.newPage();
  if (reloj) await p.clock.install();
  await p.goto(BASE);
  await p.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  return { ctx, p };
}
const foto = (p, nombre) => p.screenshot({ path: path.join(AQUI, CUAL + '-' + nombre + '.jpg'), type: 'jpeg', quality: 82 });
const centrar = (p, sel) => p.locator(sel).first().evaluate((e) => e.scrollIntoView({ block: 'center' }));

const TOMAS = {
  /* ingles-2: la fila «Marks the phase» de Ajustes, en inglés */
  async voz(b, w, h) {
    const { ctx, p } = await abrir(b, w, h, { lang: 'en', soundOn: true });
    await p.keyboard.press('t');
    await p.locator('[data-pace-aj-fila="signal"]').waitFor();
    await p.waitForTimeout(400);
    await centrar(p, '[data-pace-aj-fila="signal"]');
    await p.waitForTimeout(300);
    await foto(p, 'voz-' + w);
    await ctx.close();
  },
  /* ingles-3: la pill en inglés, y qué pasa al pulsar «Pausa» con un Foco en marcha */
  async modo(b, w, h, lang) {
    const { ctx, p } = await abrir(b, w, h, { lang }, true);
    if (lang === 'en') await foto(p, 'pill-en-' + w);
    await p.getByRole('button', { name: lang === 'en' ? 'Start focus' : 'Empezar foco', exact: true }).click();
    await p.clock.fastForward(5 * 60 * 1000);
    await p.waitForTimeout(300);
    await p.locator('[data-pace-tabs] button').nth(1).click();
    await p.waitForTimeout(600);
    await foto(p, 'modo-' + lang + '-' + w);
    await ctx.close();
  },
  /* ingles-14: el aviso de logro en inglés */
  async sello(b, w, h) {
    const { ctx, p } = await abrir(b, w, h, { lang: 'en' });
    await p.evaluate(() => addWaterGlass(1));
    await p.waitForTimeout(700);
    await foto(p, 'sello-' + w);
    await ctx.close();
  },
  /* respira-12: Pulso y Ondas en «Inhala más», sin transición para ver la escala de la fase */
  async aros(b, w, h, estilo) {
    const { ctx, p } = await abrir(b, w, h, { breathStyle: estilo }, true);
    await p.addStyleTag({ content: '[data-pace-essential] * { transition: none !important; }' });
    await p.getByRole('button', { name: /^Respira/ }).first().click();
    await p.getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).first().click();
    await p.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
    const fase = p.locator('[data-pace-breathe-phase]');
    for (let i = 0; i < 12 && (await fase.getAttribute('data-pace-breathe-phase').catch(() => '')) !== 'Inhala más'; i++) {
      await p.clock.fastForward(1000); await p.waitForTimeout(20);
    }
    await p.waitForTimeout(300);
    await foto(p, 'aros-' + estilo + '-' + w);
    await ctx.close();
  },
  /* respira-13: los minutos de las rondas en la biblioteca */
  async rondas(b, w, h) {
    const { ctx, p } = await abrir(b, w, h, {});
    await p.getByRole('button', { name: /^Respira/ }).first().click();
    await p.locator('.pace-lib').first().waitFor({ state: 'visible' });
    await p.waitForTimeout(500);
    await p.getByRole('heading', { name: 'Respiración en rondas', exact: true }).first().evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(400);
    await foto(p, 'rondas-' + w);
    await ctx.close();
  },
  /* «Un vaso más» con el ratón encima, en crema y en oscuro (solo escritorio: el móvil no tiene ratón) */
  async vaso(b, w, h, paleta) {
    const { ctx, p } = await abrir(b, w, h, { palette: paleta });
    await p.getByRole('button', { name: /Hidrátate/ }).first().click();
    const mas = p.getByRole('button', { name: /Un vaso más/ });
    await mas.waitFor({ state: 'visible' });
    await p.waitForTimeout(500);
    await mas.hover();
    await p.waitForTimeout(500);
    await foto(p, 'vaso-' + paleta + '-' + w);
    await ctx.close();
  },
  /* Lo mismo de cerca, al doble de resolución: el botón quieto y con el ratón encima. */
  async vasoCerca(b, paleta) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'es-ES', deviceScaleFactor: 2 });
    await ctx.addInitScript((e) => localStorage.setItem('pace.state.v2', JSON.stringify(e)),
      { firstSeen: 1, lang: 'es', langAuto: false, palette: paleta, ritmo: { libre: true } });
    const p = await ctx.newPage();
    await p.goto(BASE);
    await p.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await p.getByRole('button', { name: /Hidrátate/ }).first().click();
    const mas = p.getByRole('button', { name: /Un vaso más/ });
    await mas.waitFor({ state: 'visible' });
    await p.waitForTimeout(600);
    const caja = await mas.evaluate((e) => { const r = e.parentElement.getBoundingClientRect(); return { x: r.left - 24, y: r.top - 18, width: r.width + 48, height: r.height + 36 }; });
    await p.mouse.move(5, 5);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(AQUI, CUAL + '-vaso-' + paleta + '-quieto-cerca.jpg'), type: 'jpeg', quality: 88, clip: caja });
    await mas.hover();
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(AQUI, CUAL + '-vaso-' + paleta + '-encima-cerca.jpg'), type: 'jpeg', quality: 88, clip: caja });
    await ctx.close();
  },
  /* El sello de «Mis rutinas» en oscuro, de cerca. */
  async premiumCerca(b) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'es-ES', deviceScaleFactor: 3 });
    await ctx.addInitScript((e) => localStorage.setItem('pace.state.v2', JSON.stringify(e)),
      { firstSeen: 1, lang: 'es', langAuto: false, palette: 'oscuro', ritmo: { libre: true } });
    const p = await ctx.newPage();
    await p.goto(BASE);
    await p.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await p.waitForTimeout(600);
    const caja = await p.evaluate(() => { const s = [...document.querySelectorAll('span')].find((e) => e.textContent === 'Premium' && e.getBoundingClientRect().width > 0);
      const r = s.parentElement.getBoundingClientRect(); return { x: r.left - 10, y: r.top - 10, width: r.width + 20, height: r.height + 20 }; });
    await p.screenshot({ path: path.join(AQUI, CUAL + '-premium-cerca.jpg'), type: 'jpeg', quality: 90, clip: caja });
    await ctx.close();
  },
  /* oscuro-5: el sello «Premium» en oscuro (barra lateral en escritorio, tarjeta en el móvil) */
  async premium(b, w, h) {
    const { ctx, p } = await abrir(b, w, h, { palette: 'oscuro' });
    if (w < 768) {
      await p.getByRole('button', { name: /^Respira/ }).first().click();
      await p.locator('.pace-lib').first().waitFor({ state: 'visible' });
      await p.waitForTimeout(500);
      await p.getByRole('heading', { name: 'Respiración en rondas', exact: true }).first().evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await p.waitForTimeout(400);
    }
    await foto(p, 'premium-' + w);
    await ctx.close();
  },
  /* ingles-7: la semana en Estadísticas con un vaso */
  async semana(b, w, h) {
    const { ctx, p } = await abrir(b, w, h, { lang: 'en' });
    await p.evaluate(() => addWaterGlass(1));
    await p.waitForTimeout(3800);   // que se vaya el aviso del primer vaso
    await p.keyboard.press('s');
    await p.waitForTimeout(600);
    await foto(p, 'semana-' + w);
    await ctx.close();
  },
};

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 900));
  const b = await chromium.launch();
  const fallos = [];
  const SOLO = process.argv[5] ? process.argv[5].split(',') : null;   // p. ej. «vasoCerca,premiumCerca»
  const tomar = async (n, f) => { if (SOLO && !SOLO.includes(n.split(' ')[0])) return; try { await f(); } catch (e) { fallos.push(n + ': ' + String(e.message).split('\n')[0]); } };
  try {
    for (const [w, h] of VP) {
      await tomar('voz ' + w, () => TOMAS.voz(b, w, h));
      await tomar('sello ' + w, () => TOMAS.sello(b, w, h));
      await tomar('aros pulso ' + w, () => TOMAS.aros(b, w, h, 'pulso'));
      await tomar('aros ondas ' + w, () => TOMAS.aros(b, w, h, 'ondas'));
      await tomar('rondas ' + w, () => TOMAS.rondas(b, w, h));
      await tomar('premium ' + w, () => TOMAS.premium(b, w, h));
      await tomar('semana ' + w, () => TOMAS.semana(b, w, h));
    }
    /* La pill y el cambio de modo: en escritorio, y a 390×844, el móvil más estrecho con pill. */
    for (const [w, h] of [[1280, 800], [390, 844]]) {
      await tomar('modo es ' + w, () => TOMAS.modo(b, w, h, 'es'));
      await tomar('modo en ' + w, () => TOMAS.modo(b, w, h, 'en'));
    }
    await tomar('vaso crema', () => TOMAS.vaso(b, 1280, 800, 'crema'));
    await tomar('vaso oscuro', () => TOMAS.vaso(b, 1280, 800, 'oscuro'));
    await tomar('vasoCerca crema', () => TOMAS.vasoCerca(b, 'crema'));
    await tomar('vasoCerca oscuro', () => TOMAS.vasoCerca(b, 'oscuro'));
    await tomar('premiumCerca', () => TOMAS.premiumCerca(b));
  } finally { await b.close(); srv.kill(); }
  console.log(fallos.length ? 'FALLOS:\n' + fallos.join('\n') : 'todas las fotos hechas');
})().catch((e) => { console.error(e); process.exit(1); });
