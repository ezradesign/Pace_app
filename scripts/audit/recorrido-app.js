/* PACE · RECORRIDO DE LA APP REAL (auditoría del 16 oct. 2026)
 * =============================================================
 * Uso:
 *   PORT=8794 node .claude/static-server.js   (en otra terminal)
 *   node scripts/audit/recorrido-app.js [puerto] > recorrido.json
 *
 * Abre el `index.html` compilado en cuatro tamaños, en castellano y en inglés,
 * en claro y en oscuro, llega a cada pantalla como lo haría alguien y en cada
 * una mira lo que una persona notaría y la suite no pregunta:
 *   - errores de la página, de la consola y peticiones que fallan;
 *   - botones tapados o cortados: se pincha una rejilla de puntos dentro de cada
 *     caja con elementFromPoint (lo que se VE, no solo que exista);
 *   - scroll de lado, y scroll en la home del móvil;
 *   - texto cortado (más ancho que su caja con overflow escondido);
 *   - castellano que se cuela en inglés (letras y palabras que el inglés no usa);
 *   - botones sin nombre para el lector de pantalla y zonas de toque de menos
 *     de 24 px (WCAG 2.5.8);
 *   - contraste del texto contra el primer fondo opaco (aproximado: con fondos
 *     de imagen o degradado da falsos avisos, se revisan a mano);
 *   - emojis en la interfaz.
 * No pulsa nada que guarde fuera del navegador. Es una herramienta de auditoría,
 * no una prueba: no falla, apunta. Lo que haya que vigilar siempre va a la suite.
 */
'use strict';
const { chromium } = require('@playwright/test');

const PUERTO = Number(process.argv[2] || process.env.PACE_E2E_PORT || 8794);
const URL = 'http://localhost:' + PUERTO + '/index.html';
const CLAVE = 'pace.state.v2';
const JUEVES_9 = new Date('2026-09-17T09:00:00+02:00');
const JUEVES_18 = new Date('2026-09-17T18:00:00+02:00');
const JORNADA = { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };

/* `RAPIDO=1` mira una sola combinación, para probar el propio script. */
const RAPIDO = !!process.env.RAPIDO;
const TODOS = [[360, 640], [360, 800], [1280, 800], [1536, 710]];
/* `TAM=0..3` mira un solo tamaño: así se corren cuatro a la vez. */
const TAMANOS = RAPIDO ? [[360, 640]] : (process.env.TAM ? [TODOS[+process.env.TAM]] : TODOS);
const IDIOMAS = RAPIDO ? ['en'] : ['es', 'en'];
const PALETAS = RAPIDO ? ['oscuro'] : ['crema', 'oscuro'];

const re = (es, en) => new RegExp('^(' + es + '|' + en + ')');
const B = {
  ajustes: re('Abrir ajustes', 'Open settings'),
  stats: re('Ver estadísticas', 'View stats'),
  logros: re('Ver logros', 'View achievements'),
  foco: re('Empezar foco', 'Start focus'),
  respira: re('Respira', 'Breathe'),
  mueve: re('Mueve', 'Move'),
  estira: re('Estira', 'Stretch'),
  hidrata: re('Hidrátate', 'Hydrate'),
  panel: re('Abrir panel', 'Open panel'),
  crear: /Crear rutina|Create routine/,
  sesion: /^(Empezar sesión|Start session|Empezar|Start|Comenzar|Begin)$/,
  terminar: /Terminar antes|Finish early|Terminar|Finish|End/,
};

function base(lang, palette, extra) {
  return Object.assign({ firstSeen: 1, lang, langAuto: false, palette, ritmo: { libre: true } }, extra || {});
}

/* Cada escena: semilla, hora y cómo se llega. `pasos` recibe la página y
   devuelve una lista de [nombre, raíz a mirar] para medir en orden. */
const ESCENAS = [
  { id: 'bienvenida', semilla: (l, p) => ({ lang: l, langAuto: false, palette: p }), hora: JUEVES_9,
    pasos: async (page) => {
      const out = [['paso 1', 'body']];
      for (let i = 2; i <= 7; i++) {
        const sig = page.getByRole('button', { name: /^(Continuar|Siguiente|Empezar|Comenzar|Continue|Next|Start|Begin)/ }).filter({ visible: true }).first();
        if (!(await sig.count())) break;
        await sig.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(500);
        out.push(['paso ' + i, 'body']);
      }
      return out;
    } },
  { id: 'home libre', semilla: (l, p) => base(l, p), hora: JUEVES_9, pasos: async () => [['home', 'body']] },
  { id: 'home tarde', semilla: (l, p) => base(l, p), hora: JUEVES_18, pasos: async () => [['home', 'body']] },
  { id: 'home a tu ritmo', semilla: (l, p) => base(l, p, { ritmo: { dia: JORNADA } }), hora: JUEVES_9,
    pasos: async () => [['home', 'body']] },
  { id: 'home pausa abierta', hora: JUEVES_9,
    semilla: (l, p) => base(l, p, { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1,
                                     lastActiveDay: 'Thu Sep 17 2026', _historyMigrated: true }),
    pasos: async () => [['pausa', 'body']] },
  { id: 'foco en marcha', semilla: (l, p) => base(l, p), hora: JUEVES_9,
    pasos: async (page) => { await clic(page, B.foco); await page.waitForTimeout(800); return [['foco', 'body']]; } },
  { id: 'ajustes', semilla: (l, p) => base(l, p), hora: JUEVES_9,
    pasos: async (page) => { await clic(page, B.ajustes); return [['ajustes', '[data-pace-modal-card], [data-pace-tweaks-panel]', true]]; } },
  { id: 'estadísticas', semilla: (l, p) => base(l, p), hora: JUEVES_9,
    pasos: async (page) => {
      await clic(page, B.stats);
      const out = [['hoy', '[data-pace-modal-card]', true]];
      for (const [es, en] of [['Semana', 'Week'], ['Mes', 'Month'], ['Año', 'Year']]) {
        const tab = page.getByRole('tab', { name: new RegExp('^(' + es + '|' + en + ')') }).or(
          page.getByRole('button', { name: new RegExp('^(' + es + '|' + en + ')$') })).filter({ visible: true }).first();
        if (await tab.count()) { await tab.click().catch(() => {}); await page.waitForTimeout(400); out.push([es.toLowerCase(), '[data-pace-modal-card]', true]); }
      }
      return out;
    } },
  { id: 'logros', semilla: (l, p) => base(l, p), hora: JUEVES_9,
    pasos: async (page) => { await clic(page, B.logros); return [['logros', '[data-pace-modal-card]', true]]; } },
  { id: 'hidrátate', semilla: (l, p) => base(l, p), hora: JUEVES_9,
    pasos: async (page) => { await clic(page, B.hidrata); return [['hidrátate', 'body']]; } },
  ...['respira', 'mueve', 'estira'].map(m => ({
    id: 'biblioteca y sesión de ' + m, semilla: (l, p) => base(l, p), hora: JUEVES_9,
    pasos: async (page) => {
      await clic(page, B[m]);
      const out = [['biblioteca', '[data-pace-modal-card], body', true]];
      const tarjeta = page.locator('[data-pace-lib-card]').filter({ visible: true }).first();
      if (!(await tarjeta.count())) return out;
      await tarjeta.click().catch(() => {});
      await page.waitForTimeout(500);
      out.push(['ficha', 'body']);
      const empezar = page.getByRole('button', { name: B.sesion }).filter({ visible: true }).first();
      if (await empezar.count()) {
        await empezar.click().catch(() => {});
        await page.waitForTimeout(1500);
        const seguro = page.getByRole('button', { name: B.sesion }).filter({ visible: true }).first();
        if (await seguro.count()) { await seguro.click().catch(() => {}); await page.waitForTimeout(1500); }
        out.push(['sesión', '[data-pace-session-root]']);
        await page.clock.fastForward(20000).catch(() => {});
        await page.waitForTimeout(400);
        out.push(['sesión a los 20 s', '[data-pace-session-root]']);
        const fin = page.getByRole('button', { name: B.terminar }).filter({ visible: true }).first();
        if (await fin.count()) {
          await fin.click().catch(() => {});
          await page.waitForTimeout(800);
          const conf = page.getByRole('button', { name: B.terminar }).filter({ visible: true }).first();
          if (await conf.count() && !(await page.locator('[data-pace-session-done]').count())) { await conf.click().catch(() => {}); await page.waitForTimeout(800); }
          out.push(['cierre', '[data-pace-session-root]']);
        }
      }
      return out;
    } })),
  { id: 'tus rutinas', semilla: (l, p) => base(l, p), hora: JUEVES_9,
    pasos: async (page) => {
      await clic(page, B.mueve);
      const crear = page.getByRole('button', { name: B.crear }).filter({ visible: true }).first();
      if (!(await crear.count())) return [['sin «Crear rutina»', 'body']];
      await crear.click().catch(() => {});
      await page.waitForTimeout(600);
      return [['constructor', '[data-pace-modal-card], body', true]];
    } },
  { id: 'cajón del móvil', soloMovil: true, semilla: (l, p) => base(l, p), hora: JUEVES_9,
    pasos: async (page) => { await clic(page, B.panel); await page.waitForTimeout(500); return [['cajón', '[data-pace-sidebar]']]; } },
];

async function clic(page, nombre) {
  const b = page.getByRole('button', { name: nombre }).filter({ visible: true }).first();
  if (!(await b.count())) throw new Error('no encuentro el botón ' + nombre);
  await b.click({ timeout: 4000 });
  await page.waitForTimeout(700);
}

/* Lo que se mide dentro de la página. Devuelve una lista de hallazgos. */
function medir({ raiz, lang, home }) {
  const out = [];
  const vw = innerWidth, vh = innerHeight;
  const roots = Array.from(document.querySelectorAll(raiz)).filter(r => r.getClientRects().length);
  let root = roots[roots.length - 1] || document.body;
  /* Con una ventana abierta, lo de debajo no cuenta como tapado: se mira la capa
     de arriba (el antepasado fijo de lo que hay en el centro de la pantalla). */
  if (root === document.body) {
    for (let e = document.elementFromPoint(vw / 2, vh / 2); e && e !== document.body; e = e.parentElement) {
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      if (s.position === 'fixed' && r.width * r.height > vw * vh * 0.5) { root = e; }
    }
  }
  const titulo = ((root.querySelector('[data-pace-modal-title], h1, h2, h3') || {}).innerText || '').trim().slice(0, 60);
  const etiqueta = (el) => {
    const t = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ');
    const d = Array.from(el.attributes).filter(a => a.name.startsWith('data-pace')).map(a => a.name + (a.value ? '=' + a.value : '')).slice(0, 2).join(' ');
    return (t.slice(0, 50) || '(sin texto)') + (d ? ' [' + d + ']' : '');
  };
  const visible = (el) => { const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  // 1. botones tapados o cortados
  const interact = Array.from(root.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [role="tab"]'))
    .filter(el => visible(el));
  for (const el of interact) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue;
    /* Lo que queda fuera de un contenedor con scroll no está tapado: está más
       abajo. Lo que corta un overflow:hidden sin scroll sí cuenta como cortado. */
    let cx0 = 0, cy0 = 0, cx1 = vw, cy1 = vh;
    for (let a = el.parentElement; a; a = a.parentElement) {
      const sa = getComputedStyle(a);
      if (/(auto|scroll)/.test(sa.overflowY + sa.overflowX)) {
        const ra = a.getBoundingClientRect();
        cx0 = Math.max(cx0, ra.left); cy0 = Math.max(cy0, ra.top); cx1 = Math.min(cx1, ra.right); cy1 = Math.min(cy1, ra.bottom);
      }
    }
    let tot = 0, ok = 0, tapa = null;
    for (let i = 1; i <= 4; i++) for (let j = 1; j <= 4; j++) {
      const x = r.left + r.width * i / 5, y = r.top + r.height * j / 5;
      if (x < cx0 || y < cy0 || x >= cx1 || y >= cy1) continue;
      tot++;
      const e = document.elementFromPoint(x, y);
      if (e && (e === el || el.contains(e) || e.contains(el) && e.tagName === 'LABEL')) ok++;
      else if (e && !tapa) tapa = e;
    }
    if (tot < 4) continue;
    const frac = ok / tot;
    if (frac < 0.75) out.push({ tipo: 'tapado o cortado', grav: frac < 0.4 ? 'alta' : 'media', que: etiqueta(el),
      dato: Math.round(frac * 100) + ' % visible' + (tapa ? ', encima: ' + etiqueta(tapa) : ', se sale de la ventana') });
    // zona de toque
    if ((r.width < 24 || r.height < 24) && vw < 768) out.push({ tipo: 'toque pequeño', grav: 'baja', que: etiqueta(el), dato: Math.round(r.width) + '×' + Math.round(r.height) + ' px' });
    // sin nombre
    const nombre = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.innerText || el.getAttribute('title') || el.getAttribute('alt') || el.value || '').trim();
    if (!nombre && el.tagName !== 'INPUT') out.push({ tipo: 'sin nombre para el lector', grav: 'media', que: etiqueta(el), dato: el.outerHTML.slice(0, 90) });
  }
  // 2. scroll de lado y scroll en la home del móvil
  const se = document.scrollingElement;
  if (se.scrollWidth > vw + 1) out.push({ tipo: 'scroll de lado', grav: 'alta', que: 'página', dato: se.scrollWidth + ' > ' + vw });
  if (home && vw < 768) {
    const altos = Array.from(document.querySelectorAll('*')).filter(e => { const s = getComputedStyle(e); return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 1 && e.clientHeight > 100; });
    if (se.scrollHeight > vh + 1) out.push({ tipo: 'la home pide scroll', grav: 'alta', que: 'página', dato: (se.scrollHeight - vh) + ' px' });
    for (const a of altos) out.push({ tipo: 'la home pide scroll', grav: 'alta', que: etiqueta(a), dato: (a.scrollHeight - a.clientHeight) + ' px dentro' });
  }
  // 3. texto cortado, castellano en inglés, emojis, contraste
  const hojas = Array.from(root.querySelectorAll('*')).filter(el => visible(el) && el.children.length === 0 && (el.innerText || '').trim().length > 1);
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const srgb = /^color\(srgb/.test(c); const [r, g, b] = m.slice(0, 3).map(v => { v = srgb ? +v : v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return { L: 0.2126 * r + 0.7152 * g + 0.0722 * b, a: m[3] === undefined ? 1 : +m[3] }; };
  const fondo = (el) => { for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage !== 'none') return null; const l = lum(s.backgroundColor); if (l && l.a > 0.9) return l; } return lum('rgb(255,255,255)'); };
  const vistos = new Set();
  for (const el of hojas) {
    const r = el.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= vh || r.width < 1) continue;
    const s = getComputedStyle(el), txt = el.innerText.trim().replace(/\s+/g, ' ');
    if ((s.overflow === 'hidden' || s.textOverflow === 'ellipsis' || s.overflowX === 'hidden') && el.scrollWidth > el.clientWidth + 1)
      out.push({ tipo: 'texto cortado', grav: 'media', que: txt.slice(0, 60), dato: el.scrollWidth + ' > ' + el.clientWidth + ' px' });
    if (lang === 'en' && !vistos.has(txt) && (/[ñ¿¡áéíóú]/i.test(txt) || /\b(de|la|el|los|las|para|con|hoy|pausa|ahora|sin|una|tu|tus)\b/.test(txt))) {
      vistos.add(txt); out.push({ tipo: 'castellano en inglés', grav: 'media', que: txt.slice(0, 70), dato: '' });
    }
    if (/\p{Extended_Pictographic}/u.test(txt)) out.push({ tipo: 'emoji en la interfaz', grav: 'media', que: txt.slice(0, 50), dato: '' });
    const f = fondo(el), c = lum(s.color);
    if (f && c && c.a > 0.9 && +s.opacity > 0.9) {
      const ratio = (Math.max(f.L, c.L) + 0.05) / (Math.min(f.L, c.L) + 0.05);
      const grande = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
      if (ratio < (grande ? 3 : 4.5)) out.push({ tipo: 'contraste bajo', grav: ratio < 3 ? 'media' : 'baja', que: txt.slice(0, 50), dato: ratio.toFixed(2) + ':1, ' + s.fontSize });
    }
  }
  return { titulo, out };
}

(async () => {
  const navegador = await chromium.launch();
  const informe = [];
  for (const [w, h] of TAMANOS) for (const lang of IDIOMAS) for (const pal of PALETAS) for (const esc of ESCENAS) {
    if (esc.soloMovil && w >= 768) continue;
    const ctx = await navegador.newContext({ viewport: { width: w, height: h }, locale: lang === 'en' ? 'en-GB' : 'es-ES',
      timezoneId: 'Europe/Madrid', colorScheme: pal === 'oscuro' ? 'dark' : 'light' });
    await ctx.addInitScript(([k, v]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(v)); }, [CLAVE, esc.semilla(lang, pal)]);
    const page = await ctx.newPage();
    /* Un clic sobre algo tapado esperaría para siempre: 8 s y se apunta. */
    page.setDefaultTimeout(8000);
    const errores = [];
    page.on('pageerror', e => errores.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errores.push(m.type() + ': ' + m.text().slice(0, 160)); });
    page.on('requestfailed', r => errores.push('requestfailed: ' + r.url().slice(0, 120) + ' (' + ((r.failure() || {}).errorText || '') + ')'));
    const donde = w + '×' + h + ' · ' + lang + ' · ' + pal + ' · ' + esc.id;
    try {
      await page.clock.install({ time: esc.hora });
      await page.goto(URL);
      await page.waitForTimeout(1500);
      const pasos = await esc.pasos(page);
      for (const [nombre, raiz, desplazar] of pasos) {
        const m0 = await page.evaluate(medir, { raiz, lang, home: esc.id.startsWith('home') });
        const hall = m0.out, titulo = m0.titulo;
        if (desplazar) {
          for (let k = 0; k < 6; k++) {
            const movio = await page.evaluate((sel) => {
              const r = Array.from(document.querySelectorAll(sel)).filter(e => e.getClientRects().length).pop() || document.body;
              const c = [r, ...r.querySelectorAll('*')].find(e => { const s = getComputedStyle(e); return /(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 4; });
              if (!c || c.scrollTop + c.clientHeight >= c.scrollHeight - 2) return false;
              c.scrollTop += c.clientHeight * 0.8; return true;
            }, raiz);
            if (!movio) break;
            await page.waitForTimeout(250);
            hall.push(...(await page.evaluate(medir, { raiz, lang, home: false })).out);
          }
        }
        informe.push({ donde, paso: nombre, titulo, hallazgos: hall });
      }
    } catch (e) {
      informe.push({ donde, paso: 'no se llegó', hallazgos: [{ tipo: 'no se llegó', grav: 'media', que: esc.id, dato: String(e.message).slice(0, 140) }] });
    }
    if (errores.length) informe.push({ donde, paso: 'consola', hallazgos: errores.map(x => ({ tipo: 'consola', grav: /pageerror|error/.test(x) ? 'alta' : 'baja', que: x, dato: '' })) });
    await ctx.close();
    process.stderr.write('.');
  }
  await navegador.close();
  process.stdout.write(JSON.stringify(informe, null, 1));
})();
