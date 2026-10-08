/* PACE · fotos y medidas para la propuesta de la barra lateral (8 oct. 2026)
   ========================================================================
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/sidebar-8oct/fotos.js [puerto]

   Levanta su propio servidor (puerto 8781 por defecto) y se para si ese puerto lo
   sirve otra carpeta. Con SOLO=1280x800 hace una sola pantalla; con --pagina no hace
   fotos y solo vuelve a poner medidas.json dentro de sidebar.html. Deja aquí:
     · medidas.json: escala de la barra, hueco vacío al pie, scroll de la página y de
       la barra, y el alto de cada sección, en cada pantalla, paleta y día. La escala y
       el hueco van también dentro de sidebar.html.
     · fotos/antes-*: la app de hoy (pantalla entera en .jpg y la barra en .png).
     · fotos/despues-*: las opciones (opciones.js), pintadas DENTRO de la app real: se
       esconde lo que pinta React en la barra y se añade el HTML de la opción con los
       tokens de la app, sobre el mismo estado sembrado. Pantalla entera solo a
       1280×800 y 1536×704.

   Los dos días son el jueves 8 de octubre de 2026, en Madrid:
     · «vacio» a las 9:10: la semana tipo ya contesta el día, todavía no has pulsado
       «Comienza» y no has hecho nada esta semana.
     · «activo» a las 12:20: el día de «A tu ritmo» empezado a las 9:00, tres bloques
       y dos pausas hechas, cuatro vasos, cuatro días seguidos y sesiones reales en
       `pace.events.v1`, creadas con la fábrica de la app. */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules', '@playwright', 'test'));
const OPCIONES = require('./opciones.js');
/* Las variantes del Cuaderno con la siguiente pausa y las tres semanas (semanas.js). */
OPCIONES.lista.push(...require('./semanas.js').lista);
/* OPS=A,Cp-hierba repite solo esas opciones; las medidas de las demás se conservan. */
const SOLO_OPS = process.env.OPS ? process.env.OPS.split(',') : null;

const PUERTO = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) || process.env.PUERTO || 8781);
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');
const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
/* `lastActiveDay` en el formato que escribe la app (`toDateString`), a mano para no
   depender del huso de quien lance el guion. */
const HOY_TEXTO = 'Thu Oct 08 2026';
const HORA = { vacio: '2026-10-08T09:10:00+02:00', activo: '2026-10-08T12:20:00+02:00' };

const PANTALLAS = [[1280, 800], [1536, 704], [1920, 960]].filter((p) => !process.env.SOLO || process.env.SOLO === p.join('x'));
const PALETAS = ['crema', 'oscuro'];

/* Sin `lastActiveDay` ni las guardas de migración, `loadState` archiva la semana o la
   recalcula a ceros (lo cuenta `tests/sidebar-redesign.spec.js`). */
function base(paleta) {
  return {
    firstSeen: 1, lang: 'es', langAuto: false, palette: paleta, sidebarCollapsed: false,
    lastActiveDay: HOY_TEXTO, _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true,
    _historyRecalculated_v0_28_8: true,
  };
}

function estado(dia, paleta) {
  if (dia === 'vacio') {
    return Object.assign(base(paleta), { ritmo: { semanaTipo: LV } });
  }
  const t = (d, h) => new Date('2026-10-0' + d + 'T' + h + ':00+02:00').getTime();
  return Object.assign(base(paleta), {
    cycle: 3,
    ritmo: {
      semanaTipo: LV,
      dia: { fecha: '2026-10-08', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: null,
             estados: { 1: 'hecha', 2: 'hecha' } },
    },
    weeklyStats: {
      focusMinutes:  [150, 100, 200, 150, 0, 0, 0],
      breathMinutes: [6, 0, 10, 5, 0, 0, 0],
      moveMinutes:   [8, 12, 0, 7, 0, 0, 0],
      waterGlasses:  [6, 5, 7, 4, 0, 0, 0],
    },
    water: { goal: 8, today: 4, lastReset: null },
    streak: { current: 4, longest: 9, lastDay: HOY_TEXTO },
    achievements: {
      'first.step': { unlockedAt: t(1, '09:50') },
      'first.breath': { unlockedAt: t(1, '10:40') },
      'first.sip': { unlockedAt: t(1, '09:20') },
      'first.cycle': { unlockedAt: t(1, '10:45') },
      'first.day': { unlockedAt: t(1, '12:00') },
      'first.return': { unlockedAt: t(2, '09:00') },
      'streak.3': { unlockedAt: t(7, '09:00') },
    },
  });
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

/* Sesiones de hoy, con la fábrica de la app: un evento hecho a mano se descarta. */
async function sembrarSesiones(page) {
  await page.evaluate(async () => {
    const respira = (window.BREATHE_ROUTINES.equilibrio || {}).items[0].id;
    const cuerpo = (Object.values(window.EXTRA_ROUTINES)[0] || {}).items[0].id;
    const lista = [['focus', 'focus', 3000], ['focus', 'focus', 3000], ['breathe', respira, 300],
                   ['focus', 'focus', 3000], ['stretch', cuerpo, 420]];
    for (const [mod, rid, seg] of lista) {
      window.paceEventsAppend(window.makeEvent({
        type: 'session.completed', context: 'standalone', runId: window.newEventId(),
        payload: { module: mod, routineId: rid, completionReason: 'natural', elapsedSeconds: seg,
                   activeSeconds: seg, plannedSeconds: seg, plannedSecondsSource: 'declared', variant: null },
      }));
    }
  });
  await page.waitForFunction(async () =>
    (JSON.parse((await window.eventsWebReadRaw()) || '{}').events || []).length >= 5, null, { timeout: 8000 });
}

async function abrir(browser, ancho, alto, dia, paleta, extra) {
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: ancho, height: alto },
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: paleta === 'oscuro' ? 'dark' : 'light', deviceScaleFactor: 2 });
  await context.addInitScript((e) => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (x) {}
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, Object.assign(estado(dia, paleta), extra || {}));
  const page = await context.newPage();
  await page.clock.install({ time: new Date(HORA[dia]) });
  await page.goto('/index.html');
  await page.waitForSelector('[data-pace-sidebar-escala]');
  if (dia === 'activo') await sembrarSesiones(page);
  await page.evaluate(() => document.fonts.ready);
  /* Los avisos de logro tapan la barra: fuera de la foto. */
  await page.addStyleTag({ content: '[data-pace-toast], .pace-toast { display: none !important; }' });
  await page.waitForTimeout(900);
  return { context, page };
}

/* Lo que se mide: la escala que el motor aplica, el hueco vacío entre la última
   sección y el pie, si algo pide scroll y el alto de cada pieza (ya escalado). */
function medir(page) {
  return page.evaluate(() => {
    const sb = document.querySelector('[data-pace-sidebar]');
    const env = document.querySelector('[data-pace-sidebar-escala]');
    const esp = document.querySelector('[data-pace-sidebar-spacer]');
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { y: Math.round(b.top), alto: Math.round(b.height) }; };
    const escala = parseFloat(getComputedStyle(env).getPropertyValue('--sb-escala')) || 1;
    const piezas = [...env.children].map((e) => ({
      pieza: e.matches('[data-pace-sidebar-accion]') ? 'tarjeta'
        : e.hasAttribute('data-pace-sidebar-logobar') ? 'logo'
        : e.hasAttribute('data-pace-sidebar-spacer') ? 'hueco'
        : e.getBoundingClientRect().height <= 2 ? 'regla'
        : e.querySelector('[data-pace-hoy]') ? 'hoy'
        : e.querySelector('[data-pace-semana]') ? 'semana'
        : e.querySelector('[data-pace-sidebar-ultimo]') ? 'logro'
        : e.tagName === 'P' ? 'vacio' : 'pie',
      ...r(e),
    })).filter((p) => p.pieza !== 'regla');
    const doc = document.scrollingElement;
    return {
      ventana: [innerWidth, innerHeight],
      lienzo: getComputedStyle(document.documentElement).zoom || '1',
      anchoBarra: Math.round(sb.getBoundingClientRect().width),
      escala: Math.round(escala * 1000) / 1000,
      huecoAlPie: esp ? Math.round(esp.getBoundingClientRect().height) : null,
      scrollPagina: doc.scrollHeight - doc.clientHeight,
      scrollBarra: sb.scrollHeight - sb.clientHeight,
      piezas,
    };
  });
}

async function fotoBarra(page, nombre) {
  await page.locator('[data-pace-sidebar]').screenshot({ path: path.join(SALIDA, nombre + '.png') });
}

/* Una opción, inyectada. Lo que pinta React se ESCONDE (no se quita, para que un
   repintado no tropiece con nodos que ya no están), el logo se queda tal cual y la
   opción se añade detrás con los tokens de la app. Después se pide al motor de la
   escala que vuelva a medir, como haría con contenido real: cuenta los hijos con su
   alto, y los escondidos miden cero. */
async function ponerOpcion(page, html, css) {
  await page.evaluate(([html, css]) => {
    const env = document.querySelector('[data-pace-sidebar-escala]');
    const logo = env.querySelector('[data-pace-sidebar-logobar]');
    let st = document.getElementById('sb-propuesta-css');
    if (!st) { st = document.createElement('style'); st.id = 'sb-propuesta-css'; document.head.appendChild(st); }
    st.textContent = css;
    env.querySelectorAll(':scope > [data-sb-op]').forEach((c) => c.remove());
    [...env.children].forEach((c) => { if (c !== logo) c.setAttribute('data-sb-oculto', ''); });
    const antes = env.children.length;
    env.insertAdjacentHTML('beforeend', html);
    [...env.children].slice(antes).forEach((c) => { c.setAttribute('data-sb-op', ''); c.removeAttribute('data-sb-oculto'); });
    window.dispatchEvent(new Event('resize'));
  }, [html, css]);
  await page.waitForTimeout(500);
}

/* Las opciones, medidas igual que la barra de hoy pero sobre su propio DOM. */
function medirOpcion(page) {
  return page.evaluate(() => {
    const sb = document.querySelector('[data-pace-sidebar]');
    const env = document.querySelector('[data-pace-sidebar-escala]');
    const hueco = env.querySelector('[data-sb-hueco]');
    const doc = document.scrollingElement;
    const piezas = [...env.querySelectorAll('[data-sb-pieza]')].map((e) => {
      const b = e.getBoundingClientRect();
      return { pieza: e.getAttribute('data-sb-pieza'), y: Math.round(b.top), alto: Math.round(b.height) };
    });
    const ultimo = env.lastElementChild ? env.lastElementChild.getBoundingClientRect().bottom : 0;
    return {
      escala: Math.round((parseFloat(getComputedStyle(env).getPropertyValue('--sb-escala')) || 1) * 1000) / 1000,
      huecoAlPie: hueco ? Math.round(hueco.getBoundingClientRect().height) : null,
      sobraAbajo: Math.round(sb.getBoundingClientRect().bottom - ultimo),
      scrollPagina: doc.scrollHeight - doc.clientHeight,
      scrollBarra: sb.scrollHeight - sb.clientHeight,
      piezas,
    };
  });
}

async function main() {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await servidor();
  const browser = await chromium.launch();
  const ARCHIVO = path.join(__dirname, 'medidas.json');
  const medidas = (SOLO_OPS || process.env.SOLO) && fs.existsSync(ARCHIVO)
    ? JSON.parse(fs.readFileSync(ARCHIVO, 'utf8')) : { antes: {}, despues: {} };
  try {
    for (const [ancho, alto] of PANTALLAS) {
      for (const paleta of PALETAS) {
        for (const dia of ['vacio', 'activo']) {
          const clave = ancho + 'x' + alto + '-' + paleta + '-' + dia;
          const { context, page } = await abrir(browser, ancho, alto, dia, paleta);
          medidas.antes[clave] = await medir(page);
          await page.screenshot({ path: path.join(SALIDA, 'antes-' + clave + '.jpg'), type: 'jpeg', quality: 82 });
          await fotoBarra(page, 'antes-barra-' + clave);
          const datos = await page.evaluate(OPCIONES.datos);
          for (const op of OPCIONES.lista.filter((o) => !SOLO_OPS || SOLO_OPS.includes(o.id))) {
            const { html, css } = op.pintar(datos);
            await ponerOpcion(page, html, css);
            const k = op.id + '-' + clave;
            medidas.despues[k] = await medirOpcion(page);
            await fotoBarra(page, 'despues-barra-' + k);
            if (ancho === 1280 || ancho === 1536) {
              await page.screenshot({ path: path.join(SALIDA, 'despues-' + k + '.jpg'), type: 'jpeg', quality: 82 });
            }
          }
          await context.close();
          process.stdout.write('.');
        }
      }
    }
    if (!SOLO_OPS || SOLO_OPS.includes('Cq-rotulo')) await fotosAgua(browser);
  } finally {
    await browser.close();
    srv.kill();
  }
  fs.writeFileSync(path.join(__dirname, 'medidas.json'), JSON.stringify(medidas, null, 2));
  ponerMedidasEnLaPagina(medidas);
  console.log('\nHecho: ' + Object.keys(medidas.antes).length + ' pantallas de hoy y ' + Object.keys(medidas.despues).length + ' de las opciones.');
}

/* LA FRASE DEL AGUA CON OTRAS METAS. La meta es `water.goal`, la que se elige en Ajustes
   (de 4 a 12): se siembra en el estado, como la escribiría Ajustes, y se fotografía solo
   el bloque de Hoy de la tercera vuelta. fotos/agua-m<meta>-v<vasos>.png */
async function fotosAgua(browser) {
  /* El caso más largo de cada frase con la palabra más larga (cuatro): si cabe, caben todas. */
  const CASOS = [[6, 4], [8, 0], [4, 4], [10, 11], [9, 4]];
  for (const [meta, vasos] of CASOS) {
    const { context, page } = await abrir(browser, 1280, 800, 'activo', 'crema',
      { water: { goal: meta, today: vasos, lastReset: null } });
    const datos = await page.evaluate(OPCIONES.datos);
    const op = OPCIONES.lista.find((o) => o.id === 'Cq-rotulo');
    const { html, css } = op.pintar(datos);
    await ponerOpcion(page, html, css);
    await page.locator('[data-sb-op][data-sb-pieza="hoy"]').screenshot({ path: path.join(SALIDA, 'agua-m' + meta + '-v' + vasos + '.png') });
    await context.close();
  }
}

/* La página lleva dentro lo que necesita de las medidas (la escala y el hueco al pie)
   para abrirse también desde el disco, donde no puede leer medidas.json. */
function ponerMedidasEnLaPagina(medidas) {
  const corto = {};
  ['antes', 'despues'].forEach((g) => {
    corto[g] = {};
    Object.keys(medidas[g]).forEach((k) => { corto[g][k] = { escala: medidas[g][k].escala, huecoAlPie: medidas[g][k].huecoAlPie }; });
  });
  const pagina = path.join(__dirname, 'sidebar.html');
  const html = fs.readFileSync(pagina, 'utf8');
  const nuevo = html.replace(/\/\*MEDIDAS\*\/.*;\n/, () => '/*MEDIDAS*/' + JSON.stringify(corto) + ';\n');
  if (nuevo === html && !html.includes('/*MEDIDAS*/' + JSON.stringify(corto))) throw new Error('No encuentro /*MEDIDAS*/ en sidebar.html');
  fs.writeFileSync(pagina, nuevo);
}

/* `cuarta.js` reutiliza el servidor, la siembra y las medidas sin volver a hacer las fotos. */
if (require.main !== module) {
  module.exports = { RAIZ, PUERTO, estado, servidor, abrir, sembrarSesiones, medir, medirOpcion, ponerOpcion, HORA, HOY_TEXTO };
} else if (process.argv.includes('--pagina')) {
  ponerMedidasEnLaPagina(JSON.parse(fs.readFileSync(path.join(__dirname, 'medidas.json'), 'utf8')));
  console.log('Medidas puestas en sidebar.html.');
} else {
  main().catch((e) => { console.error(e); process.exit(1); });
}
