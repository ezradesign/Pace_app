/* PACE · fotos y medidas para la página de la pausa más elegante (8 oct. 2026)
   ===========================================================================
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/pausa-8oct/fotos.js [antes|despues|todo] [puerto]

   Levanta su propio servidor (8785 por defecto, nunca el 8765 ni el 8775) y se para si
   ese puerto lo sirve otra carpeta. Abre la pausa de verdad: siembra el día, pulsa el
   botón del aro y avanza el reloj de minuto en minuto hasta que acaba el bloque (uno
   grande no la abre). Deja en esta carpeta:
     · fotos/antes-*.webp: la pausa de hoy, con «A tu ritmo» (corta, larga y comida) y sin
       él, a 360×640, 360×718, 1280×800 y 1920×1080, en crema y en oscuro, y en inglés.
     · fotos/<opción>-*.webp: las opciones, pintadas encima de la ventana real (opciones.js).
     · fotos/*-recorte.webp: en escritorio, la ventana sola con un poco de aire, para comparar.
     · medidas.json: el alto de la ventana en cada foto y si tiene que desplazarse por dentro.
   Con «webp» como primer argumento solo convierte los PNG que haya en fotos/ y los borra.
   El día de las fotos es el jueves 8 de octubre de 2026, en Madrid. */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
/* En una copia de trabajo sin node_modules se usa el de la carpeta principal del repo. */
function paquete(nombre) {
  const sitios = [path.join(RAIZ, 'node_modules', nombre), path.resolve(RAIZ, '../../../node_modules', nombre)];
  for (const s of sitios) { if (fs.existsSync(s)) return require(s); }
  throw new Error('No encuentro ' + nombre + ': npm ci');
}
const { chromium } = paquete('@playwright/test');
const sharp = paquete('sharp');
const { OPCIONES, pintar } = require('./opciones.js');

const QUE = process.argv[2] || 'todo';
const PUERTO = Number(process.argv[3] || 8785);
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');
const MEDIDAS = path.join(__dirname, 'medidas.json');

const PERFIL = { need: 'body', time: 'block', environment: 'home', completedAt: 1 };
const dia = () => ({ fecha: '2026-10-08', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} });
/* Con la jornada de fábrica empezada a las 9:00 el día es: bloque 1 → 9:45 Estira «Cuello»;
   bloque 3 → 11:25 la pausa larga (Respira «Coherente 6·6» y Estira); bloque 6 → 14:00 la
   comida. Sin «A tu ritmo», un bloque de 45 minutos propone Estira («Llevas 45 minutos sentado»). */
const CASOS = {
  corta: { hora: '09:00', estado: { ritmo: { dia: dia() } }, boton: { es: 'Empezar jornada', en: 'Start the day' } },
  larga: { hora: '10:40', estado: { cycle: 2, ritmo: { dia: dia() } }, boton: { es: 'Empezar bloque 3', en: 'Start block 3' } },
  comida: { hora: '13:20', estado: { cycle: 5, ritmo: { dia: dia() } }, boton: { es: 'Empezar bloque 6', en: 'Start block 6' } },
  libre: { hora: '11:00', estado: { focusMinutes: 45, ritmo: { libre: true } }, boton: { es: 'Empezar foco', en: 'Start focus' } },
};
const MOVIL = [[360, 640], [360, 718]];
const ESCRITORIO = [[1280, 800], [1920, 1080]];

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

/* Abre la app con el caso sembrado y acaba el bloque: devuelve la página con la pausa abierta. */
async function abrirPausa(browser, caso, paleta, lang, movil) {
  const c = CASOS[caso];
  const [ancho, alto] = (movil ? MOVIL : ESCRITORIO)[0];
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: ancho, height: alto }, isMobile: movil, hasTouch: movil,
    locale: lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: paleta === 'oscuro' ? 'dark' : 'light', deviceScaleFactor: movil ? 2 : 1 });
  const estado = Object.assign({ firstSeen: 1, lang, langAuto: false, palette: paleta, profile: PERFIL, lastActiveDay: 'Thu Oct 08 2026' }, c.estado);
  await context.addInitScript((e) => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (x) {}
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, estado);
  const page = await context.newPage();
  await page.clock.install({ time: new Date('2026-10-08T' + c.hora + ':00+02:00') });
  await page.goto('/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: c.boton[lang], exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(250);
  for (let i = 0; i < 70; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(40);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await page.waitForTimeout(700);
  if (!(await page.locator('[data-pace-break-shortcut]').count())) throw new Error('No se abrió la pausa: ' + caso);
  return { context, page };
}

/* El alto de la ventana y si se desplaza por dentro (su tope es el 85 % del alto). */
function medir(page) {
  return page.evaluate(() => {
    const card = document.querySelector('[data-pace-modal-card]');
    const r = card.getBoundingClientRect();
    return { alto: Math.round(r.height), arriba: Math.round(r.top), abajo: Math.round(r.bottom), pantalla: window.innerHeight,
      sobra: card.scrollHeight - card.clientHeight, ancho: Math.round(r.width), izquierda: Math.round(r.left) };
  });
}

/* WebP en vez de PNG (la carpeta pasa de 21 MB a unos pocos) y, en escritorio, el recorte de
   la ventana con 48 px de aire: a ese tamaño las opciones se comparan de cerca. */
async function guardar(png, nombre, m) {
  await sharp(png).webp({ quality: 84 }).toFile(path.join(SALIDA, nombre + '.webp'));
  const [ancho, alto] = nombre.match(/(\d+)x(\d+)/).slice(1).map(Number);
  if (ancho < 1000 || !m) return;
  const izq = m.izquierda != null ? m.izquierda : Math.round((ancho - m.ancho) / 2);
  const x = Math.max(0, izq - 48), y = Math.max(0, m.arriba - 48);
  await sharp(png).extract({ left: x, top: y, width: Math.min(ancho - x, m.ancho + 96), height: Math.min(alto - y, m.alto + 96) })
    .webp({ quality: 88 }).toFile(path.join(SALIDA, nombre + '-recorte.webp'));
}

async function aWebp(medidas) {
  for (const f of fs.readdirSync(SALIDA).filter((x) => x.endsWith('.png'))) {
    const nombre = f.slice(0, -4);
    await guardar(fs.readFileSync(path.join(SALIDA, f)), nombre, medidas[nombre]);
    fs.unlinkSync(path.join(SALIDA, f));
  }
}

/* El aviso de «Nuevo sello» del primer Pomodoro tapa el pie de la ventana en el móvil (hay
   una foto aparte, hallazgo-sello-*.png); para las demás se esconde. */
async function fotografiar(page, nombre, medidas) {
  await page.waitForTimeout(500);
  await page.evaluate(() => [...document.querySelectorAll('body div')].forEach((d) => {
    if (d.style.position === 'fixed' && d.style.zIndex === '200') d.style.visibility = 'hidden';
  }));
  const png = await page.screenshot();
  medidas[nombre] = await medir(page);
  await guardar(png, nombre, medidas[nombre]);
  console.log(nombre, JSON.stringify(medidas[nombre]));
}

/* Una sesión por caso, paleta y piel: se abre la pausa una vez y se cambia el tamaño. */
async function sesion(browser, medidas, caso, paleta, lang, movil, opciones) {
  const { context, page } = await abrirPausa(browser, caso, paleta, lang, movil);
  const tam = movil ? MOVIL : ESCRITORIO;
  const sufijo = (lang === 'en' ? '-en' : '') + (paleta === 'oscuro' ? '-oscuro' : '');
  for (const [ancho, alto] of tam) {
    await page.setViewportSize({ width: ancho, height: alto });
    for (const op of opciones) {
      if (op !== 'antes') await pintar(page, op, caso, lang);
      await fotografiar(page, op + '-' + caso + '-' + ancho + 'x' + alto + sufijo, medidas);
      if (op !== 'antes') await page.evaluate(() => window.__paceRestaurar && window.__paceRestaurar());
    }
  }
  await context.close();
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const medidas = fs.existsSync(MEDIDAS) ? JSON.parse(fs.readFileSync(MEDIDAS, 'utf8')) : {};
  if (QUE === 'webp') return aWebp(medidas);
  const srv = await servidor();
  const browser = await chromium.launch();
  try {
    const ops = QUE === 'antes' ? ['antes'] : QUE === 'despues' ? Object.keys(OPCIONES) : ['antes'].concat(Object.keys(OPCIONES));
    /* FOTOS_CASOS=corta,libre y FOTOS_PALETAS=crema repiten solo una parte. */
    const casos = (process.env.FOTOS_CASOS || Object.keys(CASOS).join(',')).split(',');
    const paletas = (process.env.FOTOS_PALETAS || 'crema,oscuro').split(',');
    for (const caso of casos) {
      for (const paleta of paletas) {
        for (const movil of [true, false]) await sesion(browser, medidas, caso, paleta, 'es', movil, ops);
      }
    }
    if (!process.env.FOTOS_CASOS) for (const movil of [true, false]) await sesion(browser, medidas, 'corta', 'crema', 'en', movil, ops);
  } finally {
    await browser.close();
    srv.kill();
    fs.writeFileSync(MEDIDAS, JSON.stringify(medidas, null, 1) + '\n');
  }
})().catch((e) => { console.error(e); process.exit(1); });
