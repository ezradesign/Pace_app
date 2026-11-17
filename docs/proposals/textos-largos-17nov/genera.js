/* PACE · las medidas y las fotos de la página «Textos largos» (17 nov. 2026)
 * ========================================================================
 * Uso (con el servidor de las pruebas en otro puerto que el 8765):
 *   PORT=8905 node .claude/static-server.js
 *   node docs/proposals/textos-largos-17nov/genera.js [puerto]
 * Recorre las mismas pantallas que tests/textos-largos.spec.js, con los textos largos, en inglés y en
 * castellano, a 360×640, 360×740 y 1280×800, y deja `medidas.json` con todo lo medido. Después saca
 * las fotos de `fotos/`: lo hallado, el arreglo montado y las dos opciones de lo que pide letra
 * (las opciones se pintan con CSS o tocando el DOM en la foto: no están en la app).
 */
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..', '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules/@playwright/test'));
const { instalarTextosLargos } = require(path.join(ROOT, 'tests/textos-largos.pseudo.js'));
const { medirTextos } = require(path.join(ROOT, 'tests/textos-largos.medir.js'));
const { ESCENAS, hora } = require(path.join(ROOT, 'tests/textos-largos.escenas.js'));
const { SEMILLA } = require(path.join(ROOT, 'tests/helpers.js'));

const PUERTO = Number(process.argv[2] || 8905);
const ORIGEN = 'http://localhost:' + PUERTO;
const FOTOS = path.join(__dirname, 'fotos');
const TAMANOS = [[360, 640], [360, 740], [1280, 800]];

/* `legible`: el castellano alargado con palabras de verdad, para las fotos que Ez tiene que leer (las letras
   inventadas de `largos` le impedían juzgar, 17 nov.). Las medidas de `medidas.json` siguen con `largos`. */
async function abrir(b, modo, w, h, e) {
  const lang = modo === 'es' || modo === 'legible' ? 'es' : 'en';
  const movil = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid',
    isMobile: movil, hasTouch: movil, serviceWorkers: 'block', deviceScaleFactor: 2,
    storageState: { cookies: [], origins: [{ origin: ORIGEN, localStorage: [{ name: 'pace-cara', value: 'app' }] }] } });
  if (modo === 'largos') await instalarTextosLargos(ctx);
  if (modo === 'legible') await instalarTextosLargos(ctx, { legible: true });
  await ctx.addInitScript((s) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({}, SEMILLA, { lang, sidebarCollapsed: true }, e.semilla));
  if (e.antes) await e.antes(ctx);
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  await page.clock.install({ time: hora(e.hora) });
  await page.goto(ORIGEN + '/index.html');
  if (!e.sinHome) await page.locator('[data-pace-dial-number]').waitFor();
  await page.waitForTimeout(1200);
  return { ctx, page };
}

/* Una foto de un momento de una escena. `o.antes` pone la opción (CSS o DOM, solo en la foto),
   `o.recorte` devuelve la zona que importa (en px de la página) y `o.marcas` dibuja encima qué mirar,
   con `window.__marca` (rayas y guías, sin texto: lo explica el pie de cada foto). Lo que se mide en ese momento, con la opción puesta, queda en `fotos.json`. */
const porFoto = {};
function marcaEnLaPagina() {
  window.__marca = (r, o) => {
    const d = document.createElement('div');
    const c = o.color === 'olivo' ? '#3E5A3A' : o.color === 'tinta' ? '#77705F' : '#A85E43';
    const tinte = o.color === 'olivo' ? 'rgba(62,90,58,.16)' : 'rgba(168,94,67,.16)';
    d.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;box-sizing:border-box;' +
      'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;' +
      (o.linea ? 'border-left:1.5px dashed ' + c + ';'
        /* Una línea de letra pequeña se sombrea, con una barra a la izquierda: un borde la tacharía. */
        : o.relleno ? 'background:' + tinte + ';border-left:3px solid ' + c + ';border-radius:2px;'
        : 'border:2px ' + (o.discontinua ? 'dashed ' : 'solid ') + c + ';border-radius:6px;');
    document.body.appendChild(d);
  };
}
async function foto(b, nombre, modo, w, h, id, momento, o) {
  o = o || {};
  const e = ESCENAS.find((x) => x.id === id);
  const { ctx, page } = await abrir(b, modo, w, h, e);
  let hecha = false;
  await e.llegar(page, async (m, raiz, sinScroll) => {
    if (hecha || m !== momento) return;
    if (o.antes) { await page.evaluate(o.antes); await page.waitForTimeout(500); }
    porFoto[nombre] = await page.evaluate(medirTextos, { raiz, sinScroll, pseudo: modo === 'largos' });
    await page.evaluate(marcaEnLaPagina);
    if (o.marcas) await page.evaluate(o.marcas);
    const clip = o.recorte ? await page.evaluate(o.recorte) : null;
    await page.screenshot({ path: path.join(FOTOS, nombre + '.png'), clip: clip || undefined });
    hecha = true;
  });
  await ctx.close();
  if (!hecha) throw new Error('sin foto: ' + nombre);
  process.stderr.write('foto ' + nombre + '\n');
}

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  const b = await chromium.launch();
  const todo = [];
  /* `FOTOS_SOLO=1`: solo las fotos, sin volver a medir todo (unos 10 min). */
  for (const modo of process.env.FOTOS_SOLO ? [] : ['largos', 'en', 'es']) {
    for (const [w, h] of TAMANOS) {
      for (const e of ESCENAS) {
        const { ctx, page } = await abrir(b, modo, w, h, e);
        try {
          await e.llegar(page, async (momento, raiz, sinScroll) => {
            const f = await page.evaluate(medirTextos, { raiz, sinScroll, pseudo: modo === 'largos' });
            todo.push({ modo, tam: w + '×' + h, escena: e.id, nombre: e.nombre, momento, fallos: f });
          });
        } catch (x) { todo.push({ modo, tam: w + '×' + h, escena: e.id, nombre: e.nombre, momento: 'no se llegó', fallos: [{ tipo: 'no se llegó', texto: x.message.split('\n')[0], px: 0 }] }); }
        await ctx.close();
      }
      process.stderr.write(modo + ' ' + w + '×' + h + '\n');
    }
  }
  if (!process.env.FOTOS_SOLO) fs.writeFileSync(path.join(__dirname, 'medidas.json'), JSON.stringify(todo, null, 1));

  /* Cómo se ven los textos largos: la pantalla entera. */
  await foto(b, 'largos-home-360', 'legible', 360, 740, 'home-jornada', 'la home');

  /* Pregunta 3 · la cabecera de Estadísticas con los textos largos: antes (las pestañas sin poder encoger),
     lo montado (todas con «…») y las dos opciones, pintadas solo en la foto. Hasta la fila de las pestañas:
     las tarjetas de debajo, cortadas, despistaban. */
  const cabecera = () => {
    const c = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getClientRects().length).pop().getBoundingClientRect();
    const t = document.querySelector('[data-pace-stats-tabs]').getBoundingClientRect();
    const y = Math.max(0, c.top - 8);
    return { x: 0, y, width: innerWidth, height: t.bottom + 14 - y };
  };
  const recuadro = (color) => new Function('const t = document.querySelector(\'[data-pace-stats-tabs]\').getBoundingClientRect();' +
    'window.__marca({ left: t.left - 3, top: t.top - 3, width: t.width + 6, height: t.height + 6 }, { color: \'' + color + '\', discontinua: true });');
  const conCss = (css) => new Function('const s = document.createElement(\'style\'); s.textContent = ' + JSON.stringify(css) + '; document.head.appendChild(s);');
  await foto(b, 'stats-largos-antes', 'legible', 360, 640, 'estadisticas', 'pestaña today', {
    antes: conCss('[data-pace-stats-tabs],[data-pace-stats-tab]{min-width:auto!important}'), recorte: cabecera, marcas: recuadro('terra'),
  });
  await foto(b, 'stats-largos-despues', 'legible', 360, 640, 'estadisticas', 'pestaña today', { recorte: cabecera, marcas: recuadro('terra') });
  /* A: la pestaña elegida no encoge nunca; las demás, con «…». */
  await foto(b, 'stats-largos-a', 'legible', 360, 640, 'estadisticas', 'pestaña today', {
    antes: conCss('[data-pace-stats-tab][aria-pressed="true"]{flex-shrink:0!important}'), recorte: cabecera, marcas: recuadro('olivo'),
  });
  /* B: ninguna encoge; la fila se desliza de lado, sin barra, como los filtros de la biblioteca. */
  await foto(b, 'stats-largos-b', 'legible', 360, 640, 'estadisticas', 'pestaña today', {
    antes: conCss('[data-pace-stats-tabs]{overflow-x:auto!important;scrollbar-width:none}[data-pace-stats-tab]{flex-shrink:0!important}'),
    recorte: cabecera, marcas: recuadro('olivo'),
  });

  /* Pregunta 1 · Ajustes a 360×640 con «Vibrar» y las notificaciones bloqueadas: desde «Sesiones» hasta el
     borde de la pantalla, que es donde se ve lo que no cabe. */
  const sesiones = () => {
    const t = [...document.querySelectorAll('[data-pace-tweaks-panel] .pace-aj-sec-titulo')][2].getBoundingClientRect();
    return { x: 0, y: t.top - 14, width: innerWidth, height: innerHeight - (t.top - 14) };
  };
  await foto(b, 'ajustes-hoy', 'es', 360, 640, 'ajustes', 'ajustes', {
    recorte: sesiones,
    marcas: () => {
      const n = [...document.querySelectorAll('[data-pace-tweaks-panel] .pace-aj-nota')].find((e) => /bloqueadas/.test(e.textContent)).getBoundingClientRect();
      window.__marca({ left: n.left - 4, top: n.top - 2, width: n.width + 10, height: n.height + 4 }, { color: 'terra', relleno: true });
      window.__marca({ left: 0, top: innerHeight - 3, width: innerWidth, height: 3 }, { color: 'terra' });
    },
  });
  await foto(b, 'ajustes-a', 'es', 360, 640, 'ajustes', 'ajustes', {
    antes: () => {
      const fila = document.querySelector('[data-pace-aj-fila="notify"]');
      const nota = [...document.querySelectorAll('[data-pace-tweaks-panel] .pace-aj-nota')].find((e) => /bloqueadas/.test(e.textContent));
      const sub = fila && [...fila.querySelectorAll('*')].reverse().find((e) => /pestaña está detrás/.test(e.textContent));
      if (nota) nota.style.display = 'none';
      if (sub) sub.innerHTML = '<span data-opcion-a style="color:#A85E43">Bloqueado en el navegador</span>';
    },
    recorte: sesiones,
    marcas: () => {
      const n = document.querySelector('[data-opcion-a]').getBoundingClientRect();
      window.__marca({ left: n.left - 4, top: n.top - 2, width: n.width + 10, height: n.height + 4 }, { color: 'olivo', relleno: true });
      window.__marca({ left: 0, top: innerHeight - 3, width: innerWidth, height: 3 }, { color: 'olivo' });
    },
  });
  await foto(b, 'ajustes-b', 'es', 360, 640, 'ajustes', 'ajustes', {
    antes: () => {
      const s = document.createElement('style');
      s.textContent = '@media (max-height: 660px){[data-pace-tweaks-panel] .pace-aj-fila{min-height:31px!important;padding:1px 0!important}}';
      document.head.appendChild(s);
    },
    recorte: sesiones,
    marcas: () => {
      window.__marca({ left: 0, top: innerHeight - 3, width: innerWidth, height: 3 }, { color: 'olivo' });
    },
  });

  /* Pregunta 2 · las otras tres puertas de la pausa, en castellano a 360: la parte de abajo de la ventana,
     con dos guías donde acaba la caja de la fila. */
  const pie = () => {
    const c = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getClientRects().length).pop().getBoundingClientRect();
    const f = document.querySelector('[data-pace-break-otras]').getBoundingClientRect();
    return { x: 0, y: f.top - 14, width: innerWidth, height: c.bottom + 10 - (f.top - 14) };
  };
  const guias = (bien) => {
    const f = document.querySelector('[data-pace-break-otras]');
    const r = f.getBoundingClientRect();
    window.__marca({ left: r.left, top: r.top - 14, width: 2, height: r.height + 28 }, { color: 'tinta', linea: true });
    window.__marca({ left: r.right - 1, top: r.top - 14, width: 2, height: r.height + 28 }, { color: 'tinta', linea: true });
    const ultimo = [...f.children].pop().getBoundingClientRect();
    const fuera = ultimo.right - r.right;
    if (!bien && fuera > 1) window.__marca({ left: r.right, top: ultimo.top + 6, width: fuera, height: ultimo.height - 12 }, { color: 'terra' });
  };
  await foto(b, 'pausa-hoy', 'es', 360, 640, 'pausa', 'por libre', {
    recorte: pie, marcas: new Function('(' + guias + ')(false)'),
  });
  await foto(b, 'pausa-a', 'es', 360, 640, 'pausa', 'por libre', {
    antes: () => { const s = document.createElement('style'); s.textContent = '@media (max-width: 400px){.pace-break-otras{column-gap:10px!important}}'; document.head.appendChild(s); },
    recorte: pie, marcas: new Function('(' + guias + ')(true)'),
  });
  await foto(b, 'pausa-b', 'es', 360, 640, 'pausa', 'por libre', {
    antes: () => { const s = document.createElement('style'); s.textContent = '.pace-break-otras{flex-wrap:wrap!important}'; document.head.appendChild(s); },
    recorte: pie, marcas: new Function('(' + guias + ')(true)'),
  });
  await foto(b, 'pausa-largos', 'legible', 360, 640, 'pausa', 'por libre', {
    recorte: pie, marcas: new Function('(' + guias + ')(false)'),
  });

  /* Lo que solo pasa con los textos largos. */
  await foto(b, 'ajustes-largos', 'legible', 360, 640, 'ajustes', 'ajustes', {
    marcas: () => window.__marca({ left: 0, top: innerHeight - 3, width: innerWidth, height: 3 }, { color: 'terra' }),
  });
  fs.writeFileSync(path.join(__dirname, 'fotos.json'), JSON.stringify(porFoto, null, 1));
  await b.close();
})();
