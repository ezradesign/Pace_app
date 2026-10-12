/* PACE · fotos y medidas para la página del motor de la semana (8 oct. 2026)
   ========================================================================
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/motor-semana/fotos.js [puerto]

   Levanta su propio servidor (puerto 8796 por defecto) para no medir el de otra
   sesión, y deja en esta carpeta:
     · medidas.json: lo que «A tu ritmo» sirve una semana de lunes a viernes con el
       horario de fábrica (cuántas pausas, qué platos, a qué horas) y el tamaño de los
       pozos. Es el techo de lo que el motor puede aprender en una semana.
     · fotos/*.png: Ajustes con «Tu semana ›», el lunes de hoy y el lunes con la carta
       puesta encima de la tarjeta (inyectada en la app real, no programada aún).
   El lunes de las fotos es el 12 de octubre de 2026 a las 8:30, en Madrid. */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules', '@playwright', 'test'));

const PUERTO = Number(process.argv[2] || 8796);
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');
const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const LUNES = new Date('2026-10-12T08:30:00+02:00');

function semilla(extra) {
  return Object.assign({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { semanaTipo: LV } }, extra || {});
}

async function servidor() {
  const p = spawn(process.execPath, ['.claude/static-server.js'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(BASE + '/index.html', { method: 'HEAD' });
      const marca = decodeURIComponent(r.headers.get('x-pace-raiz') || '');
      if (path.resolve(marca).toLowerCase() !== RAIZ.toLowerCase()) throw new Error('El puerto ' + PUERTO + ' lo sirve otra carpeta: ' + marca);
      return p;
    } catch (e) {
      if (/otra carpeta/.test(e.message)) { p.kill(); throw e; }
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  p.kill();
  throw new Error('El servidor no arrancó en ' + BASE);
}

async function abrir(browser, ancho, alto, movil, estado) {
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: ancho, height: alto }, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', deviceScaleFactor: 2 });
  await context.addInitScript((e) => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (x) {}
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, estado);
  const page = await context.newPage();
  await page.clock.install({ time: LUNES });
  await page.goto('/index.html');
  await page.waitForSelector('[data-pace-ritmo-estado]', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  return { context, page };
}

/* Lo que la regla sirve cada día de la semana con el horario de fábrica. */
async function medir(page) {
  return page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('pace.state.v2'));
    const R = ritmoDe(s);
    const dias = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'];
    const P = ritmoPozos(s, dias[0]);
    const out = { horario: R.horario, pozos: {}, dias: [] };
    Object.keys(P).forEach((k) => { out.pozos[k] = P[k].map((r) => r.id + ' · ' + r.name + ' · ' + r.min + "'"); });
    dias.forEach((iso) => {
      const h = Object.assign({}, R.horario, { ahora: R.horario.inicio, ocupado: [] });
      const m = semanaComponer('jornada', h, ritmoPozos(s, iso), {}, 8, semanaDe(iso));
      const paradas = m.items.filter((i) => i.tipo === 'pausa' || i.tipo === 'cierre');
      out.dias.push({
        iso, tema: semanaDe(iso).tema.nombre, focos: m.focos.length, focoMin: m.focoMin,
        pausas: m.items.filter((i) => i.tipo === 'pausa').length,
        largas: m.items.filter((i) => i.tipo === 'pausa' && i.larga).length,
        paradas: paradas.map((p) => ({ hora: ritmoHora(p.desde), tipo: p.larga ? 'larga' : p.tipo, platos: (p.platos || []).map((x) => x.modulo + ' · ' + x.name + ' · ' + x.min + "'") })),
      });
    });
    return out;
  });
}

/* Cuánto le sobra a la home: si hay scroll, cuánto; y como la home del móvil recorta en
   vez de hacer scroll, también cuánto de la tarjeta cae fuera de la pantalla y qué
   diámetro le queda al aro. */
function scrollDeLaHome(page) {
  return page.evaluate(() => {
    const el = document.scrollingElement;
    const panel = [...document.querySelectorAll('[data-pace-ritmo-estado]')].find((x) => x.getClientRects().length);
    const aro = document.querySelector('[data-pace-dial-ring]') || document.querySelector('[data-pace-dial]');
    const r = panel ? panel.getBoundingClientRect() : null;
    return {
      scroll: el.scrollHeight - el.clientHeight,
      tarjeta: r ? Math.round(r.height) : null,
      fuera: r ? Math.max(0, Math.round(r.bottom - window.innerHeight)) : null,
      aro: aro ? Math.round(aro.getBoundingClientRect().width) : null,
    };
  });
}

/* LA CARTA, inyectada en la tarjeta del día con las clases y los colores de la app. Los
   números son los de una semana de ejemplo; el texto, el de la propuesta. */
function cartaHTML(d) {
  const barras = d.barras.map((v, i) => '<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;flex:1">' +
    '<b style="display:block;width:14px;height:' + Math.round(6 + v * 38) + 'px;border-radius:4px 4px 2px 2px;background:var(--focus);opacity:' + (0.35 + v * 0.45).toFixed(2) + '"></b>' +
    '<span style="font-size:9px;letter-spacing:.12em;color:var(--ink-3)">' + 'LMXJV'[i] + '</span></div>').join('');
  const cambios = d.cambios.map((c) => '<div style="display:grid;grid-template-columns:10px minmax(0,1fr);gap:9px;align-items:baseline;font-size:13px;line-height:1.4;color:var(--ink-2)">' +
    '<i style="width:8px;height:8px;border-radius:50%;border:1.5px solid ' + c.color + ';display:block;transform:translateY(-1px)"></i><span>' + c.texto + '</span></div>').join('');
  return '<div data-carta style="display:flex;flex-direction:column;gap:10px">' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)">Lunes · tu semana</span>' +
    '<span style="font-size:12px;color:var(--ink-3)">' + d.fechas + '</span></div>' +
    '<div style="display:grid;grid-template-columns:minmax(0,1fr) 104px;gap:12px;align-items:end"><div>' +
    '<div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:3px">Te ayudó</div>' +
    '<div style="font-family:var(--font-display, \'Cormorant Garamond\'),serif;font-style:italic;font-weight:500;font-size:21px;line-height:1.12;color:var(--ink)">' + d.ayudo + '</div>' +
    '<div style="font-size:12px;color:var(--ink-3);margin-top:3px">' + d.hechas + '</div></div>' +
    '<div style="display:flex;align-items:flex-end;gap:4px;height:58px">' + barras + '</div></div>' +
    '<div style="border-top:1px solid var(--line);padding-top:10px;display:flex;flex-direction:column;gap:6px">' +
    '<div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)">Esta semana</div>' + cambios + '</div>' +
    '<div class="pace-rt-tm-pie" style="display:flex;justify-content:space-between;align-items:center">' +
    '<button class="pace-rt-enlace">Dejarla como estaba</button>' +
    '<button class="pace-rt-tm-comienza"><span class="pace-rt-tm-pildora">Vale <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5h13"/><path d="M10.5 1.5L14 5l-3.5 3.5"/></svg></span></button></div></div>';
}

/* La A del móvil: la misma carta en el sitio de la tarjeta, más corta. Las barras suben a la
   cabecera, «Te ayudó» y las pausas hechas van en una línea, y cada cambio es una frase con
   su porqué al final. */
function cartaCortaHTML(d) {
  const barras = d.barras.map((v) => '<b style="display:block;width:7px;height:' + Math.round(4 + v * 14) + 'px;border-radius:2px 2px 1px 1px;background:var(--focus);opacity:' + (0.35 + v * 0.45).toFixed(2) + '"></b>').join('');
  const cambios = d.cortos.map((c) => '<div style="display:grid;grid-template-columns:10px minmax(0,1fr);gap:9px;align-items:baseline;font-size:13px;line-height:1.38;color:var(--ink-2)">' +
    '<i style="width:8px;height:8px;border-radius:50%;border:1.5px solid ' + c.color + ';display:block;transform:translateY(-1px)"></i><span>' + c.texto + '</span></div>').join('');
  return '<div data-carta style="display:flex;flex-direction:column;gap:5px">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-end"><span style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)">Lunes · tu semana</span>' +
    '<span style="display:flex;align-items:flex-end;gap:3px;height:18px" aria-label="Pausas hechas de lunes a viernes">' + barras + '</span></div>' +
    '<div><div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)">Te ayudó · ' + d.hechasCorto + '</div>' +
    '<div style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-weight:500;font-size:20px;line-height:1.15;color:var(--ink)">' + d.ayudo + '</div></div>' +
    '<div style="border-top:1px solid var(--line);padding-top:6px;display:flex;flex-direction:column;gap:3px">' + cambios + '</div>' +
    '<div class="pace-rt-tm-pie" style="display:flex;justify-content:space-between;align-items:center">' +
    '<button class="pace-rt-enlace">Dejarla como estaba</button>' +
    '<button class="pace-rt-tm-comienza"><span class="pace-rt-tm-pildora">Vale <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5h13"/><path d="M10.5 1.5L14 5l-3.5 3.5"/></svg></span></button></div></div>';
}

/* modo: 'tarjeta' (la carta entera en el sitio de la tarjeta), 'corta' (la A del móvil) o
   'ventana' (la B: la carta entera en el marco de las ventanas de la app, sobre la home de hoy). */
async function ponerCarta(page, d, modo) {
  await page.evaluate(([html, modo]) => {
    if (modo === 'ventana') {
      const velo = document.createElement('div');
      velo.setAttribute('data-carta-ventana', '');
      velo.style.cssText = 'position:fixed;inset:0;background:rgba(31,28,23,0.28);backdrop-filter:blur(3px);z-index:100;display:grid;place-items:center;padding:16px';
      velo.innerHTML = '<div style="background:var(--paper);border-radius:var(--r-lg);box-shadow:var(--sh-modal);padding:20px 18px 14px;width:100%;max-width:420px;border:1px solid var(--line)">' + html + '</div>';
      document.body.appendChild(velo);
      return;
    }
    const panel = [...document.querySelectorAll('[data-pace-ritmo-estado]')].find((x) => x.getClientRects().length);
    panel.innerHTML = html;
    /* La home mide el aro con lo que ocupa la tarjeta; se le pide que vuelva a medir,
       como haría si la carta fuera de verdad. */
    window.dispatchEvent(new Event('pace:home-relayout'));
  }, [modo === 'corta' ? cartaCortaHTML(d) : cartaHTML(d), modo]);
  await page.waitForTimeout(700);
}

/* Lo que cae fuera de la pantalla en la ventana de la B. */
function fueraVentana(page) {
  return page.evaluate(() => {
    const c = document.querySelector('[data-carta-ventana] > div');
    const r = c.getBoundingClientRect();
    return { alto: Math.round(r.height), fuera: Math.max(0, Math.round(r.bottom - window.innerHeight), Math.round(-r.top)) };
  });
}

async function main() {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await servidor();
  const browser = await chromium.launch();
  const notas = {};
  try {
    /* 1 · el techo de una semana, y la foto del lunes de hoy en escritorio */
    let { context, page } = await abrir(browser, 1280, 800, false, semilla({ sidebarCollapsed: false }));
    notas.semana = await medir(page);
    await page.screenshot({ path: path.join(SALIDA, 'lunes-hoy-escritorio.png') });
    /* 2 · Ajustes en escritorio, con «Tu semana ›» en la línea de «Sesiones» */
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
    await page.waitForTimeout(400);
    await page.locator('[data-pace-tweaks-panel]').screenshot({ path: path.join(SALIDA, 'ajustes-escritorio.png') });
    const sec = page.locator('[data-pace-aj-seccion]').filter({ has: page.locator('.pace-aj-sec-accion') }).first();
    await sec.screenshot({ path: path.join(SALIDA, 'ajustes-sesiones-escritorio.png') });
    await context.close();

    /* 3 · el lunes en el móvil de Ez (360×718) y en el más bajo que se mide (360×640) */
    for (const [alto, nombre] of [[718, 'movil'], [640, 'movil-640']]) {
      ({ context, page } = await abrir(browser, 360, alto, true, semilla({ sidebarCollapsed: true })));
      notas['antes-' + nombre] = await scrollDeLaHome(page);
      await page.screenshot({ path: path.join(SALIDA, 'lunes-hoy-' + nombre + '.png') });
      await ponerCarta(page, EJEMPLO, 'ventana');
      notas['B-ventana-' + nombre] = await fueraVentana(page);
      await page.screenshot({ path: path.join(SALIDA, 'lunes-B-ventana-' + nombre + '.png') });
      await page.evaluate(() => document.querySelector('[data-carta-ventana]').remove());
      await ponerCarta(page, EJEMPLO, 'tarjeta');
      notas['entera-' + nombre] = await scrollDeLaHome(page);
      await page.screenshot({ path: path.join(SALIDA, 'lunes-entera-' + nombre + '.png') });
      await page.reload();
      await page.waitForSelector('[data-pace-ritmo-estado]', { state: 'attached' });
      await page.waitForTimeout(600);
      await ponerCarta(page, EJEMPLO, 'corta');
      notas['A-corta-' + nombre] = await scrollDeLaHome(page);
      await page.screenshot({ path: path.join(SALIDA, 'lunes-A-corta-' + nombre + '.png') });
      if (alto === 718) {
        await page.reload();
        await page.waitForSelector('[data-pace-ritmo-estado]', { state: 'attached' });
        await page.waitForTimeout(500);
        const abrirAj = page.getByRole('button', { name: 'Abrir ajustes' });
        if (await abrirAj.count()) {
          await abrirAj.first().click();
          await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
          await page.waitForTimeout(400);
          await page.screenshot({ path: path.join(SALIDA, 'ajustes-movil.png') });
        }
      }
      await context.close();
    }

    /* 4 · la carta en escritorio */
    ({ context, page } = await abrir(browser, 1280, 800, false, semilla({ sidebarCollapsed: false })));
    await ponerCarta(page, EJEMPLO, 'ventana');
    notas['B-ventana-escritorio'] = await fueraVentana(page);
    await page.screenshot({ path: path.join(SALIDA, 'lunes-B-ventana-escritorio.png') });
    await page.evaluate(() => document.querySelector('[data-carta-ventana]').remove());
    await ponerCarta(page, EJEMPLO, 'tarjeta');
    notas['carta-escritorio'] = await scrollDeLaHome(page);
    await page.screenshot({ path: path.join(SALIDA, 'lunes-carta-escritorio.png') });
    await context.close();
  } finally {
    await browser.close();
    srv.kill();
  }
  fs.writeFileSync(path.join(__dirname, 'medidas.json'), JSON.stringify(notas, null, 2));
  console.log(JSON.stringify(notas, null, 2));
}

/* La semana de ejemplo de la carta (la misma que en la página). */
const EJEMPLO = {
  fechas: 'del 5 al 9 oct',
  ayudo: 'Cuello y Exhalación 4·6',
  hechas: '26 de 35 pausas hechas',
  hechasCorto: '26 de 35 pausas',
  cortos: [
    { color: 'var(--move)', texto: '<span style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:15px;color:var(--ink)">Gemelos subrepticios</span> descansa un mes: lo cambiaste cuatro veces.' },
    { color: 'var(--extra)', texto: 'La pausa de las 15:45 pasa a 2 minutos: la saltaste tres días.' },
  ],
  barras: [0.85, 1, 0.45, 0.8, 0.3],
  cambios: [
    { color: 'var(--move)', texto: '<span style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:15px;color:var(--ink)">Gemelos subrepticios</span>, que cambiaste cuatro veces, descansa un mes.' },
    { color: 'var(--extra)', texto: 'La pausa de las 15:45, que saltaste tres días, pasa a ser de 2 minutos.' },
  ],
};

main().catch((e) => { console.error(e); process.exit(1); });
