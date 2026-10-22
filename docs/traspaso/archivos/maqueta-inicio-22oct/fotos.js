// Fotos de la app REAL (index.html, servido en 8803) para la página de M7 y M6, con el scroll medido.
// Lo que todavía no existe se pinta encima del DOM real (inyectando CSS o texto), nunca se redibuja.
// Uso: node fotos.js <worktree> [solo-medir]
'use strict';
const path = require('path');
const fs = require('fs');
const WT = process.argv[2];
const SOLO_MEDIR = process.argv[3] === 'solo-medir';
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
const sharp = require(path.join(WT, 'node_modules', 'sharp'));
const { asentarGeometria } = require(path.join(WT, 'tests', 'home.helpers.js'));
const OUT = path.join(__dirname, 'fotos');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8803/index.html';
const FECHA = '2026-10-22';   // jueves
const SEMANA = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];

const ESTADOS = {
  'hoy-pregunta': { ritmo: {} },
  'hoy-semana': { ritmo: { semanaTipo: SEMANA } },
  'A': { ritmo: { libre: true } },
  'A-semana': { ritmo: { libre: true }, pinta: 'semana' },
};

async function abrir(b, { vp, lang, semilla, movil, hora }) {
  const ctx = await b.newContext({ viewport: vp, isMobile: !!movil, hasTouch: !!movil, deviceScaleFactor: movil ? 2 : 1,
    locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await ctx.addInitScript(([st]) => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(st));
  }, [Object.assign({ firstSeen: 1, langAuto: false, palette: 'crema', sidebarCollapsed: !!movil }, { lang }, semilla)]);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(FECHA + 'T' + (hora || '10:00') + ':00+02:00') });
  await page.goto(BASE);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page };
}

const SCROLL = () => {
  const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  return body ? body.scrollHeight - body.clientHeight : null;
};

/* A con tu semana guardada: la tarjeta corta dice tu día de siempre; «Comienza» abre ese día. */
async function pintaSemana(page, lang) {
  await page.evaluate((lang) => {
    const v = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    const t = v('.pace-rt-tm-t'), n = v('.pace-rt-tm-nota');
    if (t) t.textContent = lang === 'en' ? 'Today, like every Thursday' : 'Hoy, como cada jueves';
    if (n) n.textContent = lang === 'en' ? 'Full day, 9:00–17:00' : 'Jornada entera, 9:00–17:00';
    const ti = v('.pace-rt-tarjeta-t'); if (ti) ti.textContent = lang === 'en' ? 'Today, like every Thursday' : 'Hoy, como cada jueves';
  }, lang);
}

async function foto(page, nombre, opts) {
  const png = await page.screenshot(opts || {});
  await sharp(png).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, nombre + '.jpg'));
}

/* ---------------- M7 · la home ---------------- */
async function home(b, medidas) {
  const vps = SOLO_MEDIR ? [{ width: 360, height: 640 }, { width: 375, height: 667 }, { width: 360, height: 718 }, { width: 360, height: 730 }, { width: 412, height: 844 }]
    : [{ width: 360, height: 730 }, { width: 360, height: 640 }];
  for (const lang of ['es', 'en']) for (const vp of vps) for (const [clave, e] of Object.entries(ESTADOS)) {
    const { ctx, page } = await abrir(b, { vp, lang, semilla: e, movil: true });
    await page.mouse.move(1, 1);
    if (e.pinta === 'semana') await pintaSemana(page, lang);
    await asentarGeometria(page);
    const s = await page.evaluate(SCROLL);
    await page.addStyleTag({ content: '[data-pace-home-body] * { letter-spacing: 0.3px !important }' });
    await asentarGeometria(page);
    const s2 = await page.evaluate(SCROLL);
    await page.addStyleTag({ content: '[data-pace-home-body] * { letter-spacing: normal !important }' });
    await asentarGeometria(page);
    medidas.push({ que: 'home', clave, lang, vp: vp.width + '×' + vp.height, scroll: s, scrollLetraAncha: s2 });
    if (!SOLO_MEDIR && lang === 'es') await foto(page, 'home-' + clave + '-' + vp.height);
    if (!SOLO_MEDIR && lang === 'en' && vp.height === 640) await foto(page, 'home-' + clave + '-640-en');
    await ctx.close();
  }
  if (SOLO_MEDIR) return;
  for (const clave of ['hoy-pregunta', 'A']) {
    const { ctx, page } = await abrir(b, { vp: { width: 1280, height: 879 }, lang: 'es', semilla: ESTADOS[clave], movil: false });
    await page.mouse.move(1, 1);
    await asentarGeometria(page);
    medidas.push({ que: 'home-escritorio', clave, vp: '1280×879', scroll: await page.evaluate(SCROLL) });
    await foto(page, 'esc-' + clave);
    await ctx.close();
  }
}

/* ---------------- M6 · los Ajustes del móvil ---------------- */
const AJ = {
  hoy: '',
  /* A · Tus datos en su propia hoja: la sección queda en una fila y la hoja crece hasta dejar
     ver la barra de arriba de la home. */
  A: `[data-pace-tweaks-panel]{max-height:calc(100dvh - 64px) !important}
      [data-pace-aj-seccion="Tus datos"] > :not(.pace-aj-sec-titulo), [data-pace-aj-seccion="Your data"] > :not(.pace-aj-sec-titulo){display:none !important}
      [data-pace-aj-seccion="Tus datos"] .pace-aj-sec-titulo, [data-pace-aj-seccion="Your data"] .pace-aj-sec-titulo{margin-bottom:0}
      [data-pace-tweaks-panel] .pace-aj-fila{min-height:34px; padding:2px 0}
      [data-pace-tweaks-panel] .pace-aj-div{margin:8px 0}`,
  /* B · Todo junto, más apretado, hasta casi arriba. */
  B: `[data-pace-tweaks-panel]{max-height:calc(100dvh - 56px) !important; padding:12px 18px 14px !important}
      [data-pace-tweaks-panel] .pace-aj-cab{margin-bottom:6px}
      [data-pace-tweaks-panel] .pace-aj-fila{min-height:32px; padding:1px 0}
      [data-pace-tweaks-panel] .pace-aj-div{margin:6px 0}
      [data-pace-tweaks-panel] .pace-aj-sec-titulo{margin:0 0 2px}
      [data-pace-tweaks-panel] .pace-aj-sub{margin-top:1px}
      [data-pace-tweaks-panel] .pace-aj-accion{min-height:30px}
      [data-pace-tweaks-panel] .pace-aj-pie{margin-top:6px}`,
  /* C · Por temas: cuatro pestañas y una sola sección a la vista. */
  C: `[data-pace-tweaks-panel] .pace-aj-div{display:none}
      [data-pace-tweaks-panel] .pace-aj-sec:not([data-tema-visible]){display:none}
      [data-pace-tweaks-panel] .pace-aj-sec .pace-aj-sec-titulo{display:none}
      [data-pace-tweaks-panel] .pace-aj-pie{display:none}`,
};

async function ajustesAbrir(page, lang) {
  await page.locator('button[aria-label="' + (lang === 'es' ? 'Abrir ajustes' : 'Open settings') + '"]').first().click();
  await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(450);
}

async function ajustesPinta(page, cual, lang, tema) {
  if (AJ[cual]) await page.addStyleTag({ content: AJ[cual] });
  if (cual === 'A') {
    await page.evaluate((lang) => {
      const sec = document.querySelector('[data-pace-tweaks-panel] [data-pace-aj-seccion="' + (lang === 'es' ? 'Tus datos' : 'Your data') + '"]');
      /* «Tus datos» en la línea de su título, como «Tu semana ›» en Sesiones */
      const b = document.createElement('button');
      b.className = 'pace-aj-sec-accion'; b.setAttribute('data-pinta', '');
      b.innerHTML = (lang === 'es' ? 'Copias, borrar y código' : 'Copies, delete and code') + '<span aria-hidden="true"> ›</span>';
      sec.querySelector('.pace-aj-sec-titulo').appendChild(b);
    }, lang);
  }
  if (cual === 'A') {
    /* En Android, sin «Alarmas y recordatorios»: la nota pasa a ser la línea pequeña de su fila. */
    await page.evaluate((lang) => {
      const pn = document.querySelector('[data-pace-tweaks-panel]');
      const nota = Array.from(pn.querySelectorAll('.pace-aj-nota')).find((n) => /Android/.test(n.textContent));
      if (!nota) return;
      const acc = nota.previousElementSibling;
      nota.style.display = 'none';
      const sub = document.createElement('div');
      sub.className = 'pace-aj-sub'; sub.style.fontFamily = 'var(--font-display)'; sub.style.fontStyle = 'italic';
      sub.textContent = lang === 'es' ? 'Android puede retrasarlo unos minutos' : 'Android may delay it a few minutes';
      acc.firstElementChild.appendChild(sub);
      acc.style.minHeight = '40px';
    }, lang);
  }
  if (cual === 'C') {
    await page.evaluate(([lang, tema]) => {
      const pn = document.querySelector('[data-pace-tweaks-panel]');
      const secs = Array.from(pn.querySelectorAll('.pace-aj-sec'));
      /* la hoja mide lo que el tema más alto, para que no salte al cambiar de pestaña */
      let alto = 0;
      secs.forEach((s) => { s.setAttribute('data-tema-visible', ''); });
      secs.forEach((s) => { alto = Math.max(alto, s.getBoundingClientRect().height); });
      secs.forEach((s, i) => { if (i !== tema) s.removeAttribute('data-tema-visible'); });
      const barra = document.createElement('div');
      barra.className = 'pace-aj-pista'; barra.setAttribute('data-pinta', '');
      barra.style.cssText = 'display:flex; width:100%; margin:0 0 12px';
      secs.forEach((s, i) => {
        const b = document.createElement('button');
        b.className = 'pace-aj-pild'; b.setAttribute('aria-pressed', String(i === tema));
        b.style.cssText = 'flex:1; justify-content:center; min-height:30px';
        b.textContent = s.dataset.paceAjSeccion; barra.appendChild(b);
      });
      pn.querySelector('.pace-aj-cab').after(barra);
      const caja = document.createElement('div'); caja.style.minHeight = Math.ceil(alto) + 'px';
      caja.setAttribute('data-pinta', '');
      barra.after(caja); secs.forEach((s) => caja.appendChild(s));
    }, [lang, tema]);
  }
  await page.waitForTimeout(200);
}

function ajustesMide() {
  const pn = document.querySelector('[data-pace-tweaks-panel]');
  const r = pn.getBoundingClientRect();
  return { contenido: pn.scrollHeight, hueco: pn.clientHeight, scroll: pn.scrollHeight - pn.clientHeight,
    arriba: Math.round(r.top), alto: Math.round(r.height), pct: Math.round(100 * r.height / innerHeight) };
}

/* Lo que añade Android cuando falta «Alarmas y recordatorios»: una fila y su nota. */
async function comoAndroid(page) {
  await page.evaluate(() => {
    window.paceNativoAvisos = () => true; window.pacePlataformaNativa = () => 'android';
    window.paceNativoAvisoPermiso = () => 'granted'; window.paceEsNativo = () => true;
    window.paceAndroidAvisoExacto = () => 'denied'; window.paceAndroidAvisoExactoMirar = () => Promise.resolve('denied');
  });
}

async function ajustes(b, medidas) {
  for (const lang of ['es', 'en']) for (const vp of [{ width: 360, height: 730 }, { width: 360, height: 640 }]) {
    for (const cual of ['hoy', 'A', 'B', 'C']) for (const android of [false, true]) {
      const { ctx, page } = await abrir(b, { vp, lang, semilla: { ritmo: { libre: true }, notifyFocusEnd: true }, movil: true });
      if (android) await comoAndroid(page);
      await ajustesAbrir(page, lang);
      await ajustesPinta(page, cual, lang, 1);
      const m = await page.evaluate(ajustesMide);
      medidas.push(Object.assign({ que: 'ajustes', cual, lang, vp: vp.width + '×' + vp.height, android }, m));
      if (!SOLO_MEDIR && lang === 'es' && android) await foto(page, 'aj-' + cual + '-' + vp.height);
      if (!SOLO_MEDIR && lang === 'es' && android && cual === 'C' && vp.height === 730) {
        for (const tema of [0, 2, 3]) {
          await page.evaluate((tema) => {
            const pn = document.querySelector('[data-pace-tweaks-panel]');
            pn.querySelectorAll('.pace-aj-sec').forEach((s, i) => { if (i === tema) s.setAttribute('data-tema-visible', ''); else s.removeAttribute('data-tema-visible'); });
            pn.querySelectorAll('[data-pinta] > .pace-aj-pild').forEach((x, i) => x.setAttribute('aria-pressed', String(i === tema)));
          }, tema);
          await page.waitForTimeout(150);
          await foto(page, 'aj-C-730-tema' + tema);
        }
      }
      await ctx.close();
    }
  }
  if (SOLO_MEDIR) return;
  /* La hoja de «Tus datos» que abre la fila de A (se pinta sobre el panel real). */
  const { ctx, page } = await abrir(b, { vp: { width: 360, height: 730 }, lang: 'es', semilla: { ritmo: { libre: true }, notifyFocusEnd: true }, movil: true });
  await comoAndroid(page);
  await ajustesAbrir(page, 'es');
  await page.addStyleTag({ content: `[data-pace-tweaks-panel] .pace-aj-sec:not([data-pace-aj-seccion="Tus datos"]), [data-pace-tweaks-panel] .pace-aj-div{display:none}
    [data-pace-aj-seccion="Tus datos"] .pace-aj-sec-titulo{display:none}` });
  await page.evaluate(() => {
    const t = document.querySelector('#pace-aj-titulo');
    t.innerHTML = '<span style="font-family:var(--font-ui);font-style:normal;font-size:18px;color:var(--ink-3);margin-right:10px">‹</span>Tus datos';
  });
  await page.waitForTimeout(200);
  medidas.push(Object.assign({ que: 'ajustes', cual: 'A-datos', lang: 'es', vp: '360×730' }, await page.evaluate(ajustesMide)));
  await foto(page, 'aj-A-datos-730');
  await ctx.close();
  /* En el ordenador no cambia nada: el panel flotante de siempre. */
  const e = await abrir(b, { vp: { width: 1280, height: 879 }, lang: 'es', semilla: { ritmo: { libre: true }, notifyFocusEnd: true }, movil: false });
  await ajustesAbrir(e.page, 'es');
  medidas.push(Object.assign({ que: 'ajustes', cual: 'escritorio', lang: 'es', vp: '1280×879' }, await e.page.evaluate(ajustesMide)));
  await foto(e.page, 'aj-escritorio');
  await e.ctx.close();
}

(async () => {
  const b = await chromium.launch();
  const medidas = [];
  try {
    if (process.argv[4] !== 'sin-home') await home(b, medidas);
    await ajustes(b, medidas);
  } finally {
    fs.writeFileSync(path.join(OUT, SOLO_MEDIR ? 'medidas-todas.json' : 'medidas.json'), JSON.stringify(medidas, null, 1));
    for (const m of medidas) console.log(JSON.stringify(m));
    await b.close();
  }
})();
