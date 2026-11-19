/* La visita guiada más completa, de tres maneras, pintada sobre la app de verdad. No toca app/:
   sirve el index.html compilado con la visita cambiada al vuelo (sus paradas, sus textos y un hueco
   que puede abarcar dos piezas) y, para B y C, mete en la página lo que aún no existe.
   Uso: PUERTO=8955 node docs/proposals/visita-guiada-19nov/pinta.js  → fotos/*.webp y medidas.json
   · hoy: las cuatro paradas de la 0.211.0.
   · A: la misma visita con seis paradas (Estadísticas y logros, el menú y la copia en Ajustes).
   · B: la visita de hoy y, la primera vez que entras en cada sitio, una línea en el hueco de su frase.
   · C: la visita de hoy y, en Ajustes › Visita guiada, tres visitas cortas más, por temas. */
'use strict';
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { BASE, abrirNueva, pasarBienvenida, vis } = require('./comun.js');

const RAIZ = path.resolve(__dirname, '../../..');
const FOTOS = path.join(__dirname, 'fotos');
const TAM = [[360, 640], [1280, 800]];
const IDIOMAS = (process.env.IDIOMAS || 'es,en').split(',');

const STATS = '[data-pace-topbar-icon][title$="(S)"]';
const LOGROS = '[data-pace-topbar-icon][title$="(L)"]';
const PARADAS = {
  A: `[
    { id: 'aro', sel: '[data-pace-dial-ring]', redonda: true },
    { id: 'act', sel: '[data-pace-activitybar-grid]' },
    { id: 'dia', sel: '[data-pace-ritmo-tarjeta], [data-pace-ritmo-panel]' },
    { id: 'arriba', sel: '${STATS}', y: '${LOGROS}' },
    { id: 'cajon', sel: '[data-pace-sidebar-open]', redonda: true },
    { id: 'columna', sel: '[data-pace-sidebar]', solo: 700 },
    { id: 'ajustes', sel: '[data-pace-topbar-ajustes]', redonda: true }]`,
  /* La visita corta «Tu día» de la C, con el día sin preparar. */
  Cdia: `[
    { id: 'cdia', sel: '[data-pace-ritmo-comienza], [data-pace-ritmo-loseta]', y: '[data-pace-ritmo-loseta]', ultimo: true },
    { id: 'ccal', sel: '[data-pace-ritmo-tarjeta-calendario], [data-pace-ritmo-panel] [data-pace-cal-estado]' }]`,
};
const TEXTOS = {
  es: {
    A: {
      'visita.aro.pausa': 'Al acabar te propone una pausa corta y, la primera vez, te pide permiso para avisarte aunque estés en otra app.',
      'visita.dia.texto': 'Cada mañana, «A tu ritmo» te prepara el día según tu semana: cuándo parar y qué hacer en cada pausa. «Al calendario» lo lleva a tu calendario.',
      'visita.arriba.titulo': 'Estadísticas y logros',
      'visita.arriba.texto': 'Lo que has hecho hoy, esta semana y este mes, sin compararte con nadie. Y los sellos, que llegan solos al usar PACE.',
      'visita.cajon.titulo': 'El menú',
      'visita.cajon.texto': 'Tu semana de un vistazo, el agua de hoy, las bibliotecas de Respira, Estira y Mueve, y tus rutinas.',
      'visita.columna.titulo': 'A la izquierda',
      'visita.columna.texto': 'Tu semana de un vistazo, el agua de hoy, las bibliotecas de Respira, Estira y Mueve, y tus rutinas.',
      'visita.ajustes.texto': 'El idioma, el sonido, los avisos y tu semana. PACE lo guarda todo en este aparato: en «Tus datos» haces una copia. Aquí repites la visita.',
    },
    C: {
      'visita.ajustes.texto': 'El idioma, la paleta, el sonido y tus datos. Desde aquí repites esta visita y tienes tres más, cortas: tu día, lo que llevas y tus datos.',
      'visita.cdia.titulo': 'Tu día',
      'visita.cdia.texto': 'Di cuánto trabajas hoy y PACE reparte tus pausas por el día, cada una a su hora y con qué hacer. Mañana te lo propone según tu semana.',
      'visita.ccal.titulo': 'En tu calendario',
      'visita.ccal.texto': 'Lleva las pausas de hoy a tu calendario, para verlas junto a tus citas.',
    },
  },
  en: {
    A: {
      'visita.aro.pausa': 'When it ends, it suggests a short break and, the first time, asks permission to let you know even if you’re in another app.',
      'visita.dia.texto': 'Each morning, “At your pace” plans your day from your week: when to stop and what to do in each break. “Add to calendar” puts it in your calendar.',
      'visita.arriba.titulo': 'Stats and achievements',
      'visita.arriba.texto': 'What you’ve done today, this week and this month, without comparing you to anyone. And the stamps, which come on their own as you use PACE.',
      'visita.cajon.titulo': 'The menu',
      'visita.cajon.texto': 'Your week at a glance, today’s water, the Breathe, Stretch and Move libraries, and your routines.',
      'visita.columna.titulo': 'On the left',
      'visita.columna.texto': 'Your week at a glance, today’s water, the Breathe, Stretch and Move libraries, and your routines.',
      'visita.ajustes.texto': 'Language, sound, reminders and your week. PACE keeps everything on this device: make a copy in “Your data”. Take the tour again here.',
    },
    C: {
      'visita.ajustes.texto': 'Language, color theme, sound and your data. Take this tour again here, plus three short ones: your day, your progress and your data.',
      'visita.cdia.titulo': 'Your day',
      'visita.cdia.texto': 'Say how long you work today and PACE spreads your breaks across the day, each at its time and with what to do. Tomorrow it suggests one from your week.',
      'visita.ccal.titulo': 'In your calendar',
      'visita.ccal.texto': 'Put today’s breaks in your calendar, to see them next to your appointments.',
    },
  },
};

/* El index.html con las paradas cambiadas, el hueco que abarca dos piezas (`y`, la primera o la última que se
   vea) y una parada que solo sale desde un ancho (`solo`). */
function variante(base, paradas, textos) {
  let n = 0;
  let h = base;
  if (paradas) h = h.replace(/const PACE_VISITA_PARADAS = \[[\s\S]*?\];/, () => { n++; return 'const PACE_VISITA_PARADAS = ' + paradas + ';'; });
  h = h.replace('const el = parada && paceVisitaElemento(parada.sel);\n  if (!el) return null;\n  const r = paceCaja(el);', () => { n++; return `const el = parada && paceVisitaElemento(parada.sel);
  if (!el) return null;
  let r = paceCaja(el);
  if (parada.y) {
    const todos = [...document.querySelectorAll(parada.y)].filter((x) => paceCaja(x).width > 0);
    const e2 = parada.ultimo ? todos[todos.length - 1] : todos[0];
    if (e2 && e2 !== el) { const q = paceCaja(e2); const L = Math.min(r.left, q.left), T = Math.min(r.top, q.top);
      r = { left: L, top: T, width: Math.max(r.left + r.width, q.left + q.width) - L, height: Math.max(r.top + r.height, q.top + q.height) - T }; }
  }`; });
  h = h.replace('const visibles = PACE_VISITA_PARADAS.filter((p) => paceVisitaElemento(p.sel));',
    () => { n++; return 'const visibles = PACE_VISITA_PARADAS.filter((p) => paceVisitaElemento(p.sel) && (!p.solo || paceLienzoAncho() >= p.solo));'; });
  if (n !== (paradas ? 3 : 2)) throw new Error('no casan las piezas de la visita en index.html (' + n + ')');
  const i = h.lastIndexOf('</body>');
  const js = textos ? '<script>(function(){var T=' + JSON.stringify(textos) + ';Object.keys(T).forEach(function(l){Object.assign(window.PACE_STRINGS[l],T[l]);});})();</script>' : '';
  return h.slice(0, i) + js + h.slice(i);
}

/* Qué pisa la tarjeta: si se sale de la pantalla o tapa el hueco que enseña. */
const medirParada = (p) => p.evaluate(() => {
  const tj = document.querySelector('[data-pace-visita-tarjeta]'); const hu = document.querySelector('[data-pace-visita-hueco]');
  const a = tj.getBoundingClientRect(); const b = hu ? hu.getBoundingClientRect() : null;
  const pisa = b ? Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) : 0;
  return { id: document.querySelector('[data-pace-visita]').getAttribute('data-pace-visita'),
    dentro: a.left >= 0 && a.top >= 0 && a.right <= innerWidth && a.bottom <= innerHeight, tarjetaAlto: Math.round(a.height),
    pisaHueco: Math.round(pisa), scrollHome: document.scrollingElement.scrollHeight - innerHeight };
});

/* B · la primera vez en cada sitio: la frase que ya hay (bajo el título) se cambia por una línea que dice
   qué hay allí, con «Entendido» al final. Nada flota: ocupa el hueco de esa frase. Devuelve si cabe sin
   empujar nada fuera de la pantalla. */
function pintarLineaB([sitio, lang]) {
  const es = lang === 'es';
  const L = {
    stats: es ? 'Primera vez aquí: «Hoy», «Semana», «Mes» y «Año» cuentan lo que haces en PACE; «Qué te ayuda» aprende de tus respuestas.'
      : 'First time here: “Today”, “Week”, “Month” and “Year” count what you do in PACE; “What helps” learns from your answers.',
    logros: es ? 'Primera vez aquí: los sellos llegan solos al usar PACE; los grises son los que aún no tienes.'
      : 'First time here: stamps come on their own as you use PACE; the grey ones are those you don’t have yet.',
    ajustes: es ? 'Primera vez aquí: PACE lo guarda todo en este aparato. Haz una copia en «Tus datos» de vez en cuando.'
      : 'First time here: PACE keeps everything on this device. Make a copy in “Your data” now and then.',
    dia: es ? 'Primera vez: cada punto de la línea es una pausa; PACE te la propone a su hora.'
      : 'First time: each dot on the line is a break; PACE suggests it at its time.',
  }[sitio];
  const vis1 = (s) => [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0);
  const hoja = (raiz, re) => [...raiz.querySelectorAll('p, div, span, h2, h3')].find((x) => x.children.length === 0 && re.test(x.textContent.trim()) && x.getBoundingClientRect().width > 0);
  let destino = null;
  if (sitio === 'stats') destino = hoja(document, /^(Métricas suaves|Gentle|Soft)/);
  if (sitio === 'logros') destino = hoja(document, /^(Sellos de libreta|Field|Stamps)/i);
  if (sitio === 'ajustes') { const pan = vis1('[data-pace-tweaks-panel]'); destino = pan && hoja(pan, /^(Ajustes|Settings)$/); }
  if (sitio === 'dia') { const pan = vis1('[data-pace-ritmo-panel]') || vis1('[data-pace-ritmo-tarjeta]'); destino = pan && hoja(pan, /^(·\s*)?(como cada|like every|Hoy, como cada|Today, like every)/i); }
  if (!destino) return { cabe: false, falta: sitio };
  const linea = document.createElement('div');
  linea.setAttribute('data-maqueta-primera', sitio);
  linea.style.cssText = 'font-family:var(--font-display);font-style:italic;font-size:14px;line-height:1.4;color:var(--ink-2);margin:4px 0 2px;';
  linea.innerHTML = L + ' <button type="button" style="font:inherit;font-style:italic;color:var(--ink);background:none;border:0;padding:0 0 0 2px;text-decoration:underline;text-underline-offset:3px;cursor:pointer;">' + (es ? 'Entendido' : 'Got it') + '</button>';
  if (sitio === 'ajustes') {
    let fila = destino.parentElement;
    while (fila.parentElement && getComputedStyle(fila.parentElement).display === 'flex' && getComputedStyle(fila.parentElement).flexDirection === 'row') fila = fila.parentElement;
    fila.insertAdjacentElement('afterend', linea); linea.style.margin = '2px 0 10px';
  }
  else if (sitio === 'dia') { linea.style.margin = '2px 0 4px'; linea.style.fontSize = '12.5px'; destino.parentElement.insertAdjacentElement('afterend', linea); }
  else { destino.style.display = 'none'; destino.insertAdjacentElement('afterend', linea); }
  const r = linea.getBoundingClientRect();
  return { cabe: r.bottom <= innerHeight && r.right <= innerWidth, scrollHome: document.scrollingElement.scrollHeight - innerHeight };
}

/* C · Ajustes › Visita guiada abre una lista corta, en la misma hoja de Ajustes (como «Tus datos»). */
function pintarListaC(lang) {
  const es = lang === 'es';
  const pan = [...document.querySelectorAll('[data-pace-tweaks-panel]')].find((x) => x.getBoundingClientRect().width > 0);
  if (!pan) return;
  const filas = es ? [
    ['Lo básico', 'el aro, las actividades, tu día y Ajustes', '4 paradas'],
    ['Tu día', 'preparar la jornada, las pausas y el calendario', '3 paradas'],
    ['Lo que llevas', 'Estadísticas, los logros y el menú', '3 paradas'],
    ['Tus datos y avisos', 'la copia y los avisos del móvil', '2 paradas'],
  ] : [
    ['The basics', 'the ring, activities, your day and Settings', '4 stops'],
    ['Your day', 'planning the day, the breaks and the calendar', '3 stops'],
    ['Your progress', 'Stats, achievements and the menu', '3 stops'],
    ['Your data and reminders', 'the copy and phone reminders', '2 stops'],
  ];
  const keep = pan.firstElementChild;
  [...pan.children].forEach((c) => { if (c !== keep) c.style.display = 'none'; });
  const cont = document.createElement('div');
  cont.style.cssText = 'padding:4px 0 8px;';
  cont.innerHTML = '<div style="font-family:var(--font-ui);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin:10px 0 4px">' + (es ? '‹ Visita guiada' : '‹ Guided tour') + '</div>' +
    '<p style="font-size:13px;color:var(--ink-2);margin:0 0 6px;line-height:1.45">' + (es ? 'Cada una enseña unas pocas cosas de la app. Se salta cuando quieras.' : 'Each one shows a few things in the app. Skip it whenever you like.') + '</p>' +
    filas.map((f) => '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 0;border-top:1px solid var(--line)"><div><div style="font-family:var(--font-display);font-style:italic;font-size:19px;color:var(--ink)">' + f[0] + '</div><div style="font-size:12.5px;color:var(--ink-3);margin-top:1px">' + f[1] + '</div></div><div style="font-family:var(--font-display);font-style:italic;font-size:13.5px;color:var(--ink-3);white-space:nowrap">' + f[2] + ' ›</div></div>').join('');
  keep.insertAdjacentElement('afterend', cont);
}

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
  const medidas = [];
  const abrir = async (w, h, lang, html) => {
    const { ctx, p } = await abrirNueva(browser, w, h, lang, { dpr: w < 700 ? 2 : 1 });
    if (html) {
      await ctx.route('**/index.html', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }));
      await p.goto(BASE + '/index.html'); await p.waitForTimeout(1500);
      if (lang === 'en') { await p.locator('button[title*="English"]').first().click().catch(() => {}); await p.waitForTimeout(400); }
    }
    return { ctx, p };
  };
  const foto = async (p, nombre, w) => webp(await p.screenshot(), nombre + '.webp', w < 700 ? 540 : 1280);
  /* Recorre la visita abierta y hace una foto por parada. */
  const recorrer = async (p, op, w, lang) => {
    await p.locator('[data-pace-visita]').waitFor(); await p.waitForTimeout(500);
    for (let k = 1; k < 10 && await p.locator('[data-pace-visita]').count(); k++) {
      const m = await medirParada(p); medidas.push({ op, w, lang, k, ...m });
      await foto(p, `${op}-${w}-${lang}-${k}`, w);
      await p.locator('[data-pace-visita-siguiente]').click(); await p.waitForTimeout(650);
    }
  };
  const solo = (process.env.SOLO || 'hoy,A,B,C').split(',');

  for (const lang of IDIOMAS) for (const [w, h] of TAM) {
    let ctx, p;
    if (solo.includes('hoy')) {
      ({ ctx, p } = await abrir(w, h, lang));
      await pasarBienvenida(p, { saltar: false }); await recorrer(p, 'hoy', w, lang); await ctx.close();
    }
    if (solo.includes('A')) {
      ({ ctx, p } = await abrir(w, h, lang, variante(base, PARADAS.A, { [lang]: TEXTOS[lang].A })));
      await pasarBienvenida(p, { saltar: false }); await recorrer(p, 'A', w, lang); await ctx.close();
    }
    if (solo.includes('C')) {
      // La última parada de la primera visita, la lista en Ajustes y la visita corta «Tu día».
      ({ ctx, p } = await abrir(w, h, lang, variante(base, null, { [lang]: TEXTOS[lang].C })));
      await pasarBienvenida(p, { saltar: false });
      for (let k = 0; k < 3; k++) { await p.locator('[data-pace-visita-siguiente]').click(); await p.waitForTimeout(650); }
      medidas.push({ op: 'C', w, lang, k: 1, ...(await medirParada(p)) });
      await foto(p, `C-${w}-${lang}-1`, w);
      await p.locator('[data-pace-visita-siguiente]').click(); await p.waitForTimeout(500);
      await vis(p, '[data-pace-topbar-ajustes]').click(); await p.waitForTimeout(700);
      await p.evaluate(pintarListaC, lang); await p.waitForTimeout(300);
      await foto(p, `C-${w}-${lang}-2`, w);
      await ctx.close();
      ({ ctx, p } = await abrir(w, h, lang, variante(base, PARADAS.Cdia, { [lang]: TEXTOS[lang].C })));
      await pasarBienvenida(p, { saltar: true });
      await p.evaluate(() => window.dispatchEvent(new Event('pace:open-visita')));
      await recorrer(p, 'Cdia', w, lang); await ctx.close();
    }
    if (solo.includes('B')) {
      ({ ctx, p } = await abrir(w, h, lang));
      await pasarBienvenida(p, { saltar: true });
      let kb = 0;
      for (const sitio of ['stats', 'logros', 'ajustes', 'dia']) {
        if (sitio === 'stats') await vis(p, STATS).click();
        if (sitio === 'logros') await vis(p, LOGROS).click();
        if (sitio === 'ajustes') await vis(p, '[data-pace-topbar-ajustes]').click();
        if (sitio === 'dia') await vis(p, '[data-pace-ritmo-comienza], [data-pace-ritmo-ajustar]').click();
        await p.waitForTimeout(700);
        const ok = await p.evaluate(pintarLineaB, [sitio, lang]);
        medidas.push({ op: 'B', w, lang, k: ++kb, id: sitio, ...ok });
        await p.waitForTimeout(250);
        await foto(p, `B-${w}-${lang}-${kb}`, w);
        await p.goto(BASE + '/index.html'); await p.waitForTimeout(1500);
      }
      await ctx.close();
    }
    console.log('hecho', lang, w);
  }
  const archivo = path.join(__dirname, 'medidas.json');
  const antes = fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf8')) : [];
  const clave = (m) => [m.op, m.w, m.lang, m.k].join('|');
  const nuevas = new Set(medidas.map(clave));
  fs.writeFileSync(archivo, JSON.stringify([...antes.filter((m) => !nuevas.has(clave(m))), ...medidas], null, 1));
  for (const m of medidas) console.log(m.dentro === false || m.pisaHueco > 0 || m.scrollHome > 0 || m.cabe === false ? 'OJO' : 'ok ', JSON.stringify(m));
  await browser.close();
})();
