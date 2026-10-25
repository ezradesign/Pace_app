// Fotos de la maqueta N5-N8: la app real (index.html de la rama) con cada opción metida en el DOM.
'use strict';
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c';
const { test } = require(R + '/node_modules/@playwright/test');
const { sembrar, irAlArtefacto } = require(R + '/tests/helpers');
const { asentarGeometria } = require(R + '/tests/home.helpers');
const fs = require('fs');
const OUT = 'C:/Users/ezrav/AppData/Local/Temp/claude/C--Users-ezrav-Desktop-Proyectos-Desarrollo-de-aplicaciones-Pace-app--claude-worktrees-beautiful-perlman-2b642c/b51ebda3-702e-4c12-9bc5-90c05d26c986/scratchpad/fm/';
fs.mkdirSync(OUT, { recursive: true });
const FECHA = '2026-10-08';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const MEDIDAS = OUT + 'medidas.json';

async function abrir(browser, o) {
  const movil = o.w < 700;
  const context = await browser.newContext({ viewport: { width: o.w, height: o.h }, deviceScaleFactor: o.dsf || (movil ? 2 : 1),
    isMobile: movil, hasTouch: movil, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await sembrar(context, Object.assign({ lang: o.lang, palette: o.pal, paletteAuto: false, sidebarCollapsed: movil }, o.extra || {}));
  const page = await context.newPage();
  await page.clock.install({ time: new Date(FECHA + 'T' + (o.hora || '10:00') + ':00+02:00') });
  await irAlArtefacto(page);
  await page.mouse.move(1, 1);
  return { context, page };
}
const foto = (page, nombre, clip) => page.screenshot({ path: OUT + nombre + '.png', clip });

/* ---------- el runner (N5, N6) ---------- */
async function alRunner(page, lang) {
  await page.getByRole('button', { name: lang === 'en' ? 'Move' : 'Mueve', exact: true }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(600);
  await page.locator('[data-pace-lib-card="extra.desk.pushups"] .pace-lib-hit').locator('visible=true').first().click();
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter(e => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0).find(x => /Empezar|Start/i.test(x.textContent || '')).click();
  });
  const fase = () => page.evaluate(() => { const r = document.querySelector('[data-pace-v1-raiz]'); return r ? r.getAttribute('data-pace-v1-fase') : null; });
  for (let i = 0; i < 40 && (await fase()) !== 'work'; i++) await page.clock.runFor(1000);
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(ahora + 200));
}
const numero = (page) => page.evaluate(() => { const e = [...document.querySelectorAll('[data-pace-v1-num]')].find(n => n.getBoundingClientRect().width > 0); return e ? +e.textContent.trim() : NaN; });
async function aRep(page, n) {
  for (let i = 0; i < 80 && (await numero(page)) < n; i++) await page.clock.runFor(500);
  await page.addStyleTag({ content: '[data-pace-v1-timer]{animation:none !important;transform:none !important}' });
  await page.waitForTimeout(80);
}
const CSS_N5 = `
  .mq-auto { display:inline-flex; align-items:center; gap:7px; height:24px; padding:0 9px 0 5px; border-radius:999px;
    border:1px solid var(--line); background:transparent; color:var(--ink-2); font:600 10px/1 var(--font-ui); letter-spacing:.14em;
    text-transform:uppercase; white-space:nowrap; cursor:pointer; vertical-align:middle; }
  .mq-auto .mq-pista { position:relative; width:24px; height:14px; border-radius:999px; background:var(--line); transition:none; flex:none; }
  .mq-auto .mq-pista::after { content:''; position:absolute; top:2px; left:2px; width:10px; height:10px; border-radius:50%; background:var(--paper); }
  .mq-auto[aria-pressed="true"] { border-color: color-mix(in oklab, var(--move) 55%, var(--line)); color:var(--ink); }
  .mq-auto[aria-pressed="true"] .mq-pista { background:var(--move); }
  .mq-auto[aria-pressed="true"] .mq-pista::after { left:12px; }
  .mq-aro { position:absolute; inset:-5px; pointer-events:none; }
  .mq-aro circle { fill:none; stroke-width:2; }
  .mq-mano [data-pace-v1-btn="next"] { border-color: var(--move) !important; color: var(--move) !important; background: color-mix(in oklab, var(--move) 14%, transparent) !important; }
`;
async function n5(page, { donde, auto, lang }) {
  await page.addStyleTag({ content: CSS_N5 });
  await page.evaluate(({ donde, auto, lang }) => {
    const sw = () => { const b = document.createElement('button'); b.className = 'mq-auto'; b.setAttribute('aria-pressed', String(auto)); b.innerHTML = '<span class="mq-pista"></span>Auto'; return b; };
    const next = document.querySelector('[data-pace-v1-btn="next"]');
    if (auto) {
      next.style.position = 'relative';
      const r = 29, c = 2 * Math.PI * r;
      next.insertAdjacentHTML('beforeend', `<svg class="mq-aro" viewBox="0 0 58 58" aria-hidden="true"><circle cx="29" cy="29" r="${r - 2}" stroke="var(--line)"/><circle cx="29" cy="29" r="${r - 2}" stroke="var(--move)" stroke-linecap="round" stroke-dasharray="${(c * 0.22).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 29 29)"/></svg>`);
    } else {
      document.querySelector('[data-pace-session-root]').classList.add('mq-mano');
      const num = [...document.querySelectorAll('[data-pace-v1-num]')].find(n => n.getBoundingClientRect().width > 0);
      num.textContent = '12';
      const lab = [...document.querySelectorAll('[data-pace-v1-numlabel]')].find(n => n.getBoundingClientRect().width > 0);
      lab.textContent = lang === 'en' ? 'reps · at your pace' : 'reps · a tu ritmo';
    }
    const sig = document.querySelector('.pace-v1-siguiente');
    if (!auto) sig.textContent = lang === 'en' ? 'Tap › when you are done' : 'Pulsa › al acabar';
    if (donde === 'siguiente') {
      sig.style.display = 'flex'; sig.style.justifyContent = 'center'; sig.style.alignItems = 'center'; sig.style.gap = '12px'; sig.style.height = 'auto';
      const t = document.createElement('span'); t.textContent = sig.textContent; sig.textContent = ''; sig.appendChild(t); sig.appendChild(sw());
    } else if (donde === 'cabecera') {
      const meta = [...document.querySelectorAll('[data-pace-session-root] .pace-meta')].find(n => n.getBoundingClientRect().width > 0);
      const caja = meta.parentElement;
      if (window.innerWidth < 700) {
        const s = sw(); s.style.position = 'absolute'; s.style.right = '20px'; s.style.top = (caja.getBoundingClientRect().bottom + 6) + 'px'; s.style.zIndex = 5;
        document.querySelector('[data-pace-session-root]').appendChild(s);
      } else { const s = sw(); s.style.marginRight = '18px'; caja.insertBefore(s, meta); }
    }
  }, { donde, auto, lang });
  await page.waitForTimeout(60);
}

/* N6: el número fijo, con su color según lo que falta. */
const N6 = {
  A: (p) => `color-mix(in oklab, var(--focus) ${p}%, var(--breathe))`,
  B: (p, pal) => pal === 'oscuro' ? `color-mix(in oklab, #8CC77A ${p}%, #F07A5C)` : `color-mix(in oklab, #3F8A3A ${p}%, #C8462E)`,
  C: (p, pal, n, N) => (n > N - 3 ? 'var(--focus)' : 'var(--ink)'),
};
async function n6(page, op, n, N, pal) {
  const p = Math.round((n - 1) / (N - 1) * 100);
  await page.evaluate((c) => {
    const e = [...document.querySelectorAll('[data-pace-v1-num]')].find(x => x.getBoundingClientRect().width > 0);
    e.style.setProperty('color', c, 'important');
  }, N6[op](p, pal, n, N));
  await page.waitForTimeout(40);
}
async function cajaNumero(page, ancho) {
  return page.evaluate((ancho) => {
    const e = [...document.querySelectorAll('[data-pace-v1-num]')].find(x => x.getBoundingClientRect().width > 0);
    const l = [...document.querySelectorAll('[data-pace-v1-numlabel]')].find(x => x.getBoundingClientRect().width > 0);
    const a = e.getBoundingClientRect(), b = l.getBoundingClientRect();
    const cx = a.x + a.width / 2;
    return { x: Math.round(cx - ancho / 2), y: Math.round(a.y - 14), width: ancho, height: Math.round(b.bottom - a.y + 26) };
  }, ancho);
}

for (const v of [
  { w: 360, h: 730, pal: 'crema', lang: 'es' }, { w: 360, h: 730, pal: 'oscuro', lang: 'en' },
  { w: 1280, h: 879, pal: 'crema', lang: 'es' }, { w: 1280, h: 879, pal: 'oscuro', lang: 'en' },
]) {
  const tag = `${v.w}-${v.pal}-${v.lang}`;
  test(`runner ${tag}`, async ({ browser }) => {
    test.setTimeout(240000);
    const { context, page } = await abrir(browser, v);
    await alRunner(page, v.lang);
    await aRep(page, 3);
    await foto(page, `n5-hoy-${tag}`);
    /* N5: las tres opciones (la C es el aro solo; el interruptor vive en Ajustes) */
    await n5(page, { donde: 'siguiente', auto: true, lang: v.lang }); await foto(page, `n5-A-${tag}`);
    await context.close();
    for (const [op, donde, auto] of [['B', 'cabecera', true], ['C', 'ninguno', true], ['Amano', 'siguiente', false]]) {
      const s = await abrir(browser, v);
      await alRunner(s.page, v.lang); await aRep(s.page, 3);
      await n5(s.page, { donde, auto, lang: v.lang }); await foto(s.page, `n5-${op}-${tag}`);
      await s.context.close();
    }
    /* N6: el número en las reps 1, 4, 8 y 12, con cada opción */
    const s = await abrir(browser, v);
    await alRunner(s.page, v.lang);
    const N = 12;
    for (const n of [1, 4, 8, 12]) {
      await aRep(s.page, n);
      const caja = await cajaNumero(s.page, v.w < 700 ? 200 : 240);
      for (const op of ['A', 'B', 'C']) { await n6(s.page, op, n, N, v.pal); await foto(s.page, `n6-${op}-${n}-${tag}`, caja); }
      if (n === 8) { await n6(s.page, 'A', n, N, v.pal); await foto(s.page, `n6-A-entera-${tag}`); await n6(s.page, 'B', n, N, v.pal); await foto(s.page, `n6-B-entera-${tag}`); }
    }
    await s.context.close();
  });
}

/* La tira entera de la A: las doce reps, en las dos paletas (360). */
for (const pal of ['crema', 'oscuro']) {
  test(`tira n6 ${pal}`, async ({ browser }) => {
    test.setTimeout(240000);
    const v = { w: 360, h: 730, pal, lang: 'es' };
    const { context, page } = await abrir(browser, v);
    await alRunner(page, 'es');
    for (let n = 1; n <= 12; n++) {
      await aRep(page, n);
      const caja = await page.evaluate(() => { const e = [...document.querySelectorAll('[data-pace-v1-num]')].find(x => x.getBoundingClientRect().width > 0); const a = e.getBoundingClientRect(); return { x: Math.round(a.x + a.width / 2 - 28), y: Math.round(a.y - 6), width: 56, height: Math.round(a.height + 12) }; });
      await n6(page, 'A', n, 12, pal); await foto(page, `n6-tira-${pal}-${String(n).padStart(2, '0')}`, caja);
    }
    await context.close();
  });
}

/* ---------- Ajustes (N5 C) ---------- */
for (const v of [{ w: 360, h: 730, pal: 'crema', lang: 'es' }, { w: 1280, h: 879, pal: 'oscuro', lang: 'en' }]) {
  test(`ajustes ${v.w}`, async ({ browser }) => {
    const { context, page } = await abrir(browser, v);
    await page.getByRole('button', { name: /Abrir ajustes|Open settings/ }).first().click();
    await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
    await page.waitForTimeout(700);
    const hay = await page.evaluate((lang) => {
      const fila = document.querySelector('[data-pace-aj-fila="rest"]');
      if (!fila) return false;
      const nueva = fila.cloneNode(true);
      nueva.setAttribute('data-pace-aj-fila', 'mq-auto');
      const nom = nueva.querySelector('.pace-aj-nombre');
      const sub = nom.querySelector('.pace-aj-sub');
      nom.firstChild.textContent = lang === 'en' ? 'Moves on by itself' : 'Avanzar solo';
      sub.lastChild.textContent = lang === 'en' ? 'Move and Stretch' : 'Mueve y Estira';
      const ps = nueva.querySelectorAll('.pace-aj-pild');
      ps[0].textContent = lang === 'en' ? 'Yes' : 'Sí'; ps[0].setAttribute('aria-pressed', 'true');
      ps[1].textContent = lang === 'en' ? 'Manual' : 'A mano'; ps[1].setAttribute('aria-pressed', 'false');
      if (ps[2]) ps[2].remove();
      nueva.style.outline = '2px solid var(--breathe)'; nueva.style.outlineOffset = '4px'; nueva.style.borderRadius = '6px';
      fila.after(nueva);
      nueva.scrollIntoView({ block: 'center' });
      return true;
    }, v.lang);
    await page.waitForTimeout(300);
    await foto(page, `n5-C-ajustes-${v.w}-${v.pal}-${v.lang}`);
    console.log('ajustes', v.w, hay);
    await context.close();
  });
}

/* ---------- la home (N7) ---------- */
async function n7(page, op) {
  await page.evaluate((op) => {
    const hasta = document.querySelector('[data-pace-ritmo-hasta]');
    const texto = hasta.textContent.trim();
    hasta.style.visibility = 'hidden';
    const lab = document.querySelector('[data-pace-dial-label]');
    const num = document.querySelector('[data-pace-dial-number]');
    if (op === 'B') { lab.textContent = lab.textContent.trim() + ' · ' + texto; return; }
    const d = document.createElement('div');
    d.setAttribute('data-mq-hasta', '');
    d.textContent = texto;
    if (op === 'A') Object.assign(d.style, { font: '500 10px/1.4 var(--font-ui)', letterSpacing: '1.8px', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '-6px 0 14px', textAlign: 'center' });
    else Object.assign(d.style, { font: 'italic 400 16px/1.25 var(--font-display)', color: 'var(--ink-2)', margin: '-4px 0 14px', textAlign: 'center' });
    lab.after(d);
    num.style.marginTop = '-4px';
  }, op);
  await asentarGeometria(page);
}
const sobra = (page) => page.evaluate(() => {
  const b = [...document.querySelectorAll('[data-pace-home-body]')].find((e) => e.getBoundingClientRect().width > 0);
  return b.scrollHeight - b.clientHeight;
});
const choca = (page) => page.evaluate(() => {
  /* ¿la línea nueva se sale del aro? distancia del borde de su texto al centro del aro, contra el radio */
  const d = document.querySelector('[data-mq-hasta]') || document.querySelector('[data-pace-dial-label]');
  const ring = document.querySelector('[data-pace-dial-ring]').getBoundingClientRect();
  const r = ring.width / 2, cx = ring.x + r, cy = ring.y + r;
  const rng = document.createRange(); rng.selectNodeContents(d); const t = rng.getBoundingClientRect();
  const esq = [[t.left, t.top], [t.right, t.top], [t.left, t.bottom], [t.right, t.bottom]];
  return Math.round(Math.min(...esq.map(([x, y]) => r - Math.hypot(x - cx, y - cy))));
});

const medidas = [];
for (const lang of ['es', 'en']) for (const vp of [[360, 640], [360, 730], [1280, 879]]) {
  test(`n7 medir ${lang} ${vp[0]}x${vp[1]}`, async ({ browser }) => {
    test.setTimeout(120000);
    const fila = { lang, vp: vp.join('×') };
    for (const op of ['hoy', 'A', 'B', 'C']) {
      const { context, page } = await abrir(browser, { w: vp[0], h: vp[1], pal: 'crema', lang, dsf: 1, hora: '09:00', extra: { ritmo: { dia: JORNADA } } });
      await asentarGeometria(page);
      if (op !== 'hoy') await n7(page, op);
      fila[op] = { sobra: await sobra(page), margen: await choca(page) };
      await page.addStyleTag({ content: '[data-pace-home-body] * { letter-spacing: 0.3px !important }' });
      await asentarGeometria(page);
      fila[op].sobraAncha = await sobra(page);
      await context.close();
    }
    fs.writeFileSync(OUT + `medida-${lang}-${vp.join('x')}.json`, JSON.stringify(fila));
  });
}
for (const v of [
  { w: 360, h: 730, pal: 'crema', lang: 'es' }, { w: 360, h: 730, pal: 'oscuro', lang: 'en' },
  { w: 1280, h: 879, pal: 'crema', lang: 'es' }, { w: 1280, h: 879, pal: 'oscuro', lang: 'en' },
  { w: 360, h: 640, pal: 'crema', lang: 'en' },
]) {
  const tag = `${v.w}x${v.h}-${v.pal}-${v.lang}`;
  test(`n7 fotos ${tag}`, async ({ browser }) => {
    test.setTimeout(120000);
    for (const op of ['hoy', 'A', 'B', 'C']) {
      if (v.h === 640 && op !== 'A' && op !== 'hoy') continue;
      const { context, page } = await abrir(browser, Object.assign({ hora: '09:00', extra: { ritmo: { dia: JORNADA } } }, v));
      await asentarGeometria(page);
      if (op !== 'hoy') await n7(page, op);
      await foto(page, `n7-${op}-${tag}`);
      await context.close();
    }
  });
}

/* ---------- la barra lateral (N8) ---------- */
const SEMANA = { focusMinutes: [50, 25, 75, 25, 0, 0, 0], breathMinutes: [10, 5, 20, 10, 0, 0, 0], moveMinutes: [15, 0, 25, 15, 0, 0, 0] };
async function n8(page, op) {
  await page.evaluate((s) => setState({ weeklyStats: Object.assign({}, getState().weeklyStats, s) }), SEMANA);
  await page.waitForTimeout(200);
  if (op === 'donde') {
    await page.addStyleTag({ content: '[data-pace-semana]{ outline: 2px solid var(--breathe); outline-offset: 6px; border-radius: 10px; }' });
  } else if (op === 'A') {
    await page.addStyleTag({ content: `
      [data-pace-sidebar] [data-pace-capsula-relleno] { opacity:1 !important; background: linear-gradient(to top, color-mix(in oklab, var(--breathe) 62%, var(--paper-2)), color-mix(in oklab, var(--focus) 62%, var(--paper-2))) bottom / 100% 40px no-repeat !important; }
      [data-pace-sidebar] [data-hoy="1"] [data-pace-capsula-relleno] { background: linear-gradient(to top, var(--breathe), var(--focus)) bottom / 100% 40px no-repeat !important; }` });
  } else if (op === 'B') {
    await page.evaluate(() => {
      document.querySelectorAll('[data-pace-sidebar] [data-pace-capsula-relleno]').forEach((e) => {
        const p = Math.round(e.getBoundingClientRect().height / 40 * 100);
        const c = `color-mix(in oklab, var(--focus) ${p}%, var(--breathe))`;
        const hoy = e.closest('[data-hoy="1"]');
        e.style.setProperty('background', hoy ? c : `color-mix(in oklab, ${c} 62%, var(--paper-2))`, 'important');
        e.style.setProperty('opacity', '1', 'important');
      });
    });
  } else if (op === 'C') {
    await page.addStyleTag({ content: `[data-pace-sidebar] [data-hoy="1"] [data-pace-capsula-relleno] { background: linear-gradient(to top, var(--breathe), var(--focus)) bottom / 100% 40px no-repeat !important; }` });
  }
  await page.waitForTimeout(100);
}
for (const v of [
  { w: 1280, h: 879, pal: 'crema', lang: 'es' }, { w: 1280, h: 879, pal: 'oscuro', lang: 'en' },
  { w: 360, h: 730, pal: 'crema', lang: 'es' }, { w: 360, h: 730, pal: 'oscuro', lang: 'en' },
]) {
  const tag = `${v.w}-${v.pal}-${v.lang}`;
  test(`n8 ${tag}`, async ({ browser }) => {
    test.setTimeout(120000);
    for (const op of ['donde', 'hoy', 'A', 'B', 'C']) {
      const { context, page } = await abrir(browser, Object.assign({ hora: '11:00', dsf: 2 }, v, { extra: { sidebarCollapsed: false } }));
      await page.waitForTimeout(500);
      await n8(page, op);
      const caja = await page.evaluate(() => { const s = [...document.querySelectorAll('[data-pace-semana]')].find(e => e.getBoundingClientRect().width > 0); const r = s.getBoundingClientRect(); return { x: Math.max(0, Math.round(r.x - 16)), y: Math.max(0, Math.round(r.y - 14)), width: Math.round(r.width + 32), height: Math.round(r.height + 28) }; });
      await foto(page, `n8-${op}-cerca-${tag}`, caja);
      if (op !== 'hoy') await foto(page, `n8-${op}-${tag}`, v.w > 700 ? { x: 0, y: 0, width: 300, height: v.h } : undefined);
      await context.close();
    }
  });
}
