// Fotos de las opciones de la maqueta: la app real (index.html de la rama) con cada opción metida en el DOM.
'use strict';
const { R, TAMANOS, tag, abrir, foto, guardar } = require('./comun');
const { test } = require(R + '/node_modules/@playwright/test');

const CASOS = [
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.m),
  Object.assign({ pal: 'oscuro', lang: 'en' }, TAMANOS.m),
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.d),
  Object.assign({ pal: 'oscuro', lang: 'en' }, TAMANOS.d),
];

/* Lo que se mete en la página: un objeto de estilo de React pasado a CSS en línea. */
const AYUDA = `
  window.__css = (o) => Object.entries(o).map(([k, v]) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ':' +
    (typeof v === 'number' && !/lineHeight|fontWeight|opacity|zIndex|flex/.test(k) ? v + 'px' : v)).join(';');
  window.__icono = (re) => { const c = [...document.querySelectorAll('[data-pace-activitybar-chip]')].find((b) => re.test((b.innerText || '').trim()));
    const i = c && (c.querySelector('svg') || c.firstElementChild); return i ? i.outerHTML : ''; };
`;

async function hastaLaSemana(page) {
  await page.addScriptTag({ content: AYUDA });
  await page.locator('[role=dialog] [data-pace-cta]').click();
  await page.locator('[data-pace-semana-editor]').waitFor();
  await page.waitForTimeout(700);
}
async function hastaLaHome(page) {
  await hastaLaSemana(page);
  await page.locator('[data-pace-semana-guardar]').click();
  await page.locator('[role=dialog][data-pace-scene-card]').waitFor({ state: 'detached' });
  await page.waitForTimeout(900);
  await page.addScriptTag({ content: AYUDA });
}
const QUIETO = '[data-pace-reveal] > * { animation: none !important; opacity: 1 !important; transform: none !important; }';
const sobraBienvenida = (page) => page.evaluate(() => { const s = document.querySelector('[role=dialog][data-pace-scene-card] > div:nth-of-type(2)'); return s ? s.scrollHeight - s.clientHeight : null; });

/* ---------- 1A · «Así funciona PACE», una pantalla al final de la bienvenida ---------- */
async function q1A(page, o) {
  await hastaLaSemana(page);
  await page.evaluate((en) => {
    const S = window.onboardingStyles, css = window.__css;
    const ico = { resp: window.__icono(/^(Respira|Breathe)/), mueve: window.__icono(/^(Mueve|Move)/), estira: window.__icono(/^(Estira|Stretch)/) };
    const aro = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--focus)" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9" stroke-width="2.2" stroke-linecap="round"/></svg>';
    const dia = '<svg viewBox="0 0 30 14" width="30" height="14"><rect x="1" y="3" width="8" height="8" rx="4" fill="none" stroke="#6E7FA0" stroke-width="1.6"/><rect x="11" y="3" width="8" height="8" rx="4" fill="none" stroke="#9A7A45" stroke-width="1.6"/><rect x="21" y="3" width="8" height="8" rx="4" fill="none" stroke="#C97A5D" stroke-width="1.6"/></svg>';
    const T = en ? {
      kicker: 'PACE', tit: 'How PACE works', a: ['Focus', 'Tap the ring: 25 minutes of work.'], b: ['The break', 'When it ends, PACE suggests moving, stretching or breathing.'],
      c: ['At your pace', 'Each morning, your day with its breaks, from your week.'], cta: 'Start my first Focus', no: 'Not now',
    } : {
      kicker: 'PACE', tit: 'Así funciona PACE', a: ['Foco', 'Toca el aro: 25 minutos de trabajo.'], b: ['La pausa', 'Al acabar, PACE te propone moverte, estirar o respirar.'],
      c: ['A tu ritmo', 'Cada mañana, tu día con sus pausas, según tu semana.'], cta: 'Empezar mi primer Foco', no: 'Ahora no',
    };
    const fila = (icono, [n, d], ultima) => `<div style="display:flex;align-items:center;gap:14px;padding:11px 0;${ultima ? '' : 'border-bottom:1px dashed var(--line);'}text-align:left">
      <span style="flex:0 0 64px;display:flex;justify-content:center;gap:0;align-items:center;color:var(--ink-2)">${icono}</span>
      <span style="flex:1"><span style="display:block;font-family:var(--font-display);font-style:italic;font-size:19px;font-weight:500;color:var(--ink);line-height:1.15">${n}</span>
      <span style="display:block;font-size:12.5px;color:var(--ink-3);margin-top:2px;line-height:1.35">${d}</span></span></div>`;
    const pausa = `<span style="display:inline-flex;gap:0;zoom:.72">${ico.mueve}${ico.estira}${ico.resp}</span>`;
    const col = document.querySelector('[data-pace-reveal]');
    col.innerHTML = `<h2 style="${css(S.title)}">${T.tit}</h2>
      <div style="width:100%;box-sizing:border-box;padding:2px 16px;background:rgba(242,237,224,0.82);border:1px solid rgba(184,173,142,0.5);border-radius:var(--r-md);backdrop-filter:blur(3px)">
        ${fila(aro, T.a)}${fila(pausa, T.b)}${fila(dia, T.c, true)}</div>
      <button data-pace-cta style="${css(S.cta)}">${T.cta}</button>
      <button style="${css(S.ghostBtn)}">${T.no}</button>`;
    const cab = document.querySelector('[role=dialog][data-pace-scene-card] .pace-meta');
    if (cab) cab.textContent = T.kicker;
  }, o.lang === 'en');
  await page.addStyleTag({ content: QUIETO });
  await page.waitForTimeout(300);
  await foto(page, 'q1A-' + tag(o));
  return { sobra: await sobraBienvenida(page) };
}

/* ---------- 1B · una pista en la home, una sola vez ---------- */
async function q1B(page, o) {
  await hastaLaHome(page);
  await page.evaluate((en) => {
    const b = [...document.querySelectorAll('button')].find((x) => /^(Empezar foco|Start focus)$/i.test((x.innerText || '').trim()) && x.getBoundingClientRect().width > 0);
    const r = b.getBoundingClientRect();
    const ancho = Math.min(300, innerWidth - 32);
    const izq = Math.max(16, r.left + r.width / 2 - ancho / 2);
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;z-index:70;left:${izq}px;top:${r.bottom + 14}px;width:${ancho}px;box-sizing:border-box;padding:12px 14px 10px;background:var(--paper);border:1px solid var(--line-2);border-radius:var(--r-md);box-shadow:var(--sh-card);text-align:left`;
    d.innerHTML = `<span style="position:absolute;top:-7px;left:${r.left + r.width / 2 - izq - 6}px;width:12px;height:12px;background:var(--paper);border-left:1px solid var(--line-2);border-top:1px solid var(--line-2);transform:rotate(45deg)"></span>
      <div style="font-family:var(--font-display);font-style:italic;font-size:17px;font-weight:500;color:var(--ink);line-height:1.2">${en ? 'Your first Focus' : 'Tu primer Foco'}</div>
      <div style="font-size:12.5px;color:var(--ink-2);line-height:1.4;margin-top:3px">${en ? '25 minutes of work. When it ends, PACE suggests a short break: moving, stretching or breathing.' : '25 minutos de trabajo. Al acabar, PACE te propone una pausa corta: moverte, estirar o respirar.'}</div>
      <div style="text-align:right;margin-top:4px"><button style="font-family:var(--font-display);font-style:italic;font-size:14px;color:var(--focus);background:none;border:0;padding:6px 2px">${en ? 'Got it' : 'Entendido'}</button></div>`;
    document.body.appendChild(d);
  }, o.lang === 'en');
  await page.waitForTimeout(200);
  await foto(page, 'q1B-' + tag(o));
}

/* ---------- 1C · visita guiada por la home: 1 de 4, el aro ---------- */
async function q1C(page, o) {
  await hastaLaHome(page);
  await page.evaluate((en) => {
    const ring = [...document.querySelectorAll('[data-pace-dial-ring]')].find((x) => x.getBoundingClientRect().width > 0);
    const r = ring.getBoundingClientRect();
    const hueco = document.createElement('div');
    hueco.style.cssText = `position:fixed;z-index:70;left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;border-radius:50%;box-shadow:0 0 0 9999px ' + (document.documentElement.getAttribute('data-palette') === 'oscuro' ? 'rgba(0,0,0,.66)' : 'rgba(31,28,23,.58)') + ';pointer-events:none`;
    document.body.appendChild(hueco);
    const ancho = Math.min(320, innerWidth - 32);
    const movil = innerWidth < 700;
    const top = movil || !(r.right + 28 + ancho < innerWidth - 16) ? Math.min(r.bottom + 18, innerHeight - 190) : r.top + r.height / 2 - 70;
    const cabeDerecha = r.right + 28 + ancho < innerWidth - 16;
    const izq = movil || !cabeDerecha ? Math.max(16, r.left + r.width / 2 - ancho / 2) : r.right + 28;
    const c = document.createElement('div');
    c.style.cssText = `position:fixed;z-index:71;left:${izq}px;top:${top}px;width:${ancho}px;box-sizing:border-box;padding:14px 16px 10px;background:var(--paper);border:1px solid var(--line-2);border-radius:var(--r-md);box-shadow:var(--sh-modal);text-align:left`;
    c.innerHTML = `<div class="pace-meta">${en ? '1 of 4' : '1 de 4'}</div>
      <div style="font-family:var(--font-display);font-style:italic;font-size:20px;font-weight:500;color:var(--ink);margin-top:4px">${en ? 'The ring' : 'El aro'}</div>
      <div style="font-size:12.5px;color:var(--ink-2);line-height:1.4;margin-top:3px">${en ? 'Choose the minutes above and tap to start. The ring fills as you work.' : 'Elige los minutos arriba y toca para empezar. El aro se llena mientras trabajas.'}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
        <button style="font-family:var(--font-display);font-style:italic;font-size:13px;color:var(--ink-3);background:none;border:0;padding:6px 0">${en ? 'Skip the tour' : 'Saltar la visita'}</button>
        <button style="font-family:var(--font-ui);font-size:12px;letter-spacing:.12em;color:var(--paper);background:var(--focus-cta);border:0;border-radius:999px;padding:8px 18px">${en ? 'Next' : 'Siguiente'}</button></div>`;
    document.body.appendChild(c);
  }, o.lang === 'en');
  await page.waitForTimeout(200);
  await foto(page, 'q1C-' + tag(o));
}

/* ---------- 2 · PACE completo al final de la bienvenida ---------- */
async function alCompleto(page) {
  await page.addScriptTag({ content: AYUDA });
  await page.evaluate(() => { window.PACE_TIENDA_WEB.enlaces = { vida: '/index.html#v', mes: '/index.html#m' }; });
  await page.locator('[role=dialog] [data-pace-cta]').click();
  await page.locator('[data-pace-semana-editor]').waitFor();
  await page.locator('[data-pace-semana-guardar]').click();
  await page.locator('[data-pace-onb-precios]').waitFor();
  await page.waitForTimeout(700);
}
async function q2B(page, o) {
  await alCompleto(page);
  await foto(page, 'q2B-' + tag(o));
  return { sobra: await sobraBienvenida(page) };
}
async function q2A(page, o) {
  await alCompleto(page);
  await page.evaluate((en) => {
    const S = window.onboardingStyles, css = window.__css;
    const lede = document.querySelector('[data-pace-reveal] > p');
    lede.textContent = en ? 'And until v1, PACE Complete is open to everyone too:' : 'Y hasta v1, PACE completo también está abierto para todos:';
    const precios = document.querySelector('[data-pace-onb-precios]');
    precios.textContent = en ? 'Then, €2.99 a month with 7 days free, or €19.99 once.' : 'Después, 2,99 € al mes con 7 días gratis, o 19,99 € una vez.';
    const par = document.querySelector('[data-pace-onb-probar]').parentElement;
    par.outerHTML = `<button data-pace-cta style="${css(S.cta)}">${en ? 'Begin' : 'Comenzar'}</button>`;
    const pie = document.querySelector('[data-pace-onb-vida]').parentElement;
    pie.innerHTML = `<p style="font-size:11.5px;color:var(--ink-3);margin:0;line-height:1.45;max-width:340px">${en ? 'When v1 arrives you get your trial week, and the routines you have already done stay yours.' : 'Al llegar v1 tendrás tu semana de prueba, y las rutinas que ya hayas hecho se te quedan.'}</p>`;
  }, o.lang === 'en');
  await page.addStyleTag({ content: QUIETO });
  await page.waitForTimeout(300);
  await foto(page, 'q2A-' + tag(o));
  return { sobra: await sobraBienvenida(page) };
}

for (const o of CASOS) {
  test('pregunta 1 ' + tag(o), async ({ browser }) => {
    const medidas = {};
    for (const [n, fn] of [['A', q1A], ['B', q1B], ['C', q1C]]) {
      const { context, page } = await abrir(browser, Object.assign({ fresco: true }, o));
      medidas[n] = await fn(page, o);
      await context.close();
    }
    guardar('q1-' + tag(o), medidas);
  });
  test('pregunta 2 ' + tag(o), async ({ browser }) => {
    const medidas = {};
    for (const [n, fn] of [['A', q2A], ['B', q2B]]) {
      const { context, page } = await abrir(browser, Object.assign({ fresco: true }, o));
      medidas[n] = await fn(page, o);
      await context.close();
    }
    guardar('q2-' + tag(o), medidas);
  });
}
/* La medida que importa de la 2: que quepa sin scroll en el móvil pequeño. */
for (const o of [Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.m640), Object.assign({ pal: 'crema', lang: 'en' }, TAMANOS.m640)]) {
  test('pregunta 1 y 2 a 360x640 ' + o.lang, async ({ browser }) => {
    const medidas = {};
    for (const [n, fn] of [['1A', q1A], ['2A', q2A], ['2B', q2B]]) {
      const { context, page } = await abrir(browser, Object.assign({ fresco: true }, o));
      medidas[n] = await fn(page, Object.assign({}, o, { w: '360x640' }));
      await context.close();
    }
    guardar('q12-640-' + o.lang, medidas);
  });
}

/* ---------- 3 · Ajustes ---------- */
const CSS_SW = `.pace-aj-sw{width:40px !important;height:24px !important}
  .pace-aj-sw::after{top:3px !important;left:3px !important;width:18px !important;height:18px !important}
  .pace-aj-sw[aria-checked="true"]::after{left:19px !important}`;
const CSS_PLIEGUE = `@media (min-width: 641px) and (max-height: 860px) {
  [data-pace-tweaks-panel] [data-pace-aj-plegada] > :not(.pace-aj-sec-titulo){display:none !important}
  [data-pace-tweaks-panel] [data-pace-aj-plegada] .pace-aj-sec-titulo{margin-bottom:0}
  [data-pace-tweaks-panel] .pace-aj-solo-movil{display:inline-block !important} }`;
async function q3(page, o, conSw) {
  await page.addStyleTag({ content: CSS_PLIEGUE + (conSw ? CSS_SW : '') });
  await page.getByRole('button', { name: o.lang === 'en' ? 'Open settings' : 'Abrir ajustes' }).click();
  const panel = page.locator('[data-pace-tweaks-panel]');
  await panel.waitFor();
  await page.evaluate((en) => {
    const a = document.querySelector('[data-pace-aj-plegada] .pace-aj-sec-accion');
    if (a) a.firstChild.textContent = en ? 'Copies, delete and PACE Complete' : 'Copias, borrar y PACE completo';
  }, o.lang === 'en');
  await page.waitForTimeout(400);
  const m = await panel.evaluate((p) => ({ alto: p.clientHeight, contenido: p.scrollHeight, sobra: p.scrollHeight - p.clientHeight }));
  const n = 'q3' + (conSw ? 'A' : 'B') + '-' + tag(o) + 'x' + o.h;
  await foto(page, n);
  {
    /* De cerca, el interruptor junto a las píldoras. */
    const fila = page.locator('[data-pace-aj-fila="sound"]');
    const c = await fila.boundingBox();
    const c2 = await page.locator('[data-pace-aj-fila="signal"]').boundingBox();
    await foto(page, n + '-cerca', { clip: { x: c.x - 6, y: c.y - 4, width: c.width + 12, height: c2.y + c2.height - c.y + 8 } });
  }
  return m;
}
async function q3Dialogo(page, o) {
  await page.getByRole('button', { name: o.lang === 'en' ? 'Open settings' : 'Abrir ajustes' }).click();
  await page.locator('[data-pace-tweaks-panel]').waitFor();
  if (o.w < 700) await page.locator('[data-pace-aj-plegada] .pace-aj-sec-accion').click();
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:ritmo-semana')));
  const card = page.locator('[data-pace-modal-card]').last();
  await card.waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((en) => {
    const c = [...document.querySelectorAll('[data-pace-modal-card]')].pop();
    const titulo = c.querySelector('h2, h1');
    if (titulo) titulo.textContent = en ? 'Delete all your data?' : '¿Borrar todos tus datos?';
    const cuerpo = c.querySelector('[data-pace-semana-hoja]');
    const sub = titulo && titulo.nextElementSibling; if (sub && sub !== cuerpo && !sub.contains(cuerpo)) sub.remove();
    const tagEl = [...c.querySelectorAll('*')].find((e) => e.children.length === 0 && /^(a tu ritmo|at your pace)$/i.test((e.textContent || '').trim())); if (tagEl) tagEl.textContent = en ? 'Your data' : 'Tus datos';
    cuerpo.innerHTML = `<p style="margin:0;font-size:14px;line-height:1.5;color:var(--ink-2)">${en ? 'Everything PACE keeps in this browser is deleted: your days, your routines and your achievements. It cannot be undone. If you want, export a copy first.' : 'Se borra todo lo que PACE guarda en este navegador: tus días, tus rutinas y tus logros. No se puede deshacer. Si quieres, exporta antes una copia.'}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
        <button style="font-family:var(--font-ui);font-size:13px;letter-spacing:.08em;padding:11px 20px;border-radius:999px;border:1px solid var(--line-2);background:transparent;color:var(--ink-2)">${en ? 'Cancel' : 'Cancelar'}</button>
        <button style="font-family:var(--font-ui);font-size:13px;letter-spacing:.08em;padding:11px 20px;border-radius:999px;border:1px solid var(--breathe);background:var(--breathe);color:var(--paper)">${en ? 'Delete everything' : 'Borrar todo'}</button></div>`;
  }, o.lang === 'en');
  await page.waitForTimeout(300);
  await foto(page, 'q3dlg-' + tag(o) + 'x' + o.h);
}
const AJ = [
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.m),
  Object.assign({ pal: 'oscuro', lang: 'en' }, TAMANOS.m),
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.ez),
  Object.assign({ pal: 'oscuro', lang: 'en' }, TAMANOS.ez),
  Object.assign({ pal: 'crema', lang: 'en' }, TAMANOS.d),
  Object.assign({ pal: 'oscuro', lang: 'es' }, TAMANOS.d768),
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.d),
  Object.assign({ pal: 'crema', lang: 'en' }, TAMANOS.d768),
];
for (const o of AJ) {
  test('pregunta 3 ' + tag(o) + 'x' + o.h, async ({ browser }) => {
    const medidas = {};
    for (const conSw of [true, false]) {
      const { context, page } = await abrir(browser, o);
      medidas[conSw ? 'A' : 'B'] = await q3(page, o, conSw);
      await context.close();
    }
    if (o === AJ[0] || o === AJ[1] || o === AJ[3]) {
      const { context, page } = await abrir(browser, o);
      await q3Dialogo(page, o);
      await context.close();
    }
    guardar('q3-' + tag(o) + 'x' + o.h, medidas);
  });
}
