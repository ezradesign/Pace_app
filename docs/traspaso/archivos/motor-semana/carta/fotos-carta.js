/* PACE · fotos de la carta del lunes, ya programada (17 oct. 2026)
   ===============================================================
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/motor-semana/carta/fotos-carta.js [puerto]

   Levanta su servidor (8798 por defecto), abre la app real el lunes 19 de octubre de 2026
   a las 8:30 en Madrid, le pone una carta de ejemplo en el estado y fotografía la ventana
   a 360×718 (el móvil de Ez), 360×640 y 1280×800, con las dos opciones de cada cosa que
   falta por decidir. Deja las fotos en ./fotos y las medidas en ./medidas.json.
   Las opciones salían de `PACE_CARTA_MAQUETA`, que se quitó cuando Ez eligió la B en las
   dos (17 oct.): hoy todas las fotos de una misma cosa salen iguales, con la B. */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules', '@playwright', 'test'));

const PUERTO = Number(process.argv[2] || 8798);
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');
const LUNES = new Date('2026-10-19T08:30:00+02:00');
const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];

const barras = (xs) => [1, 2, 3, 4, 5, 6, 7].map((d, i) => ({ d, hechas: (xs[i] || [0, 0])[0], total: (xs[i] || [0, 0])[1] }));
const semana = { lunes: '2026-10-19', desde: '2026-10-12', hasta: '2026-10-18' };
const GEMELOS = { tipo: 'descansa', clase: 'rutinas', id: 'extra.calves', modulo: 'mueve', veces: 4, semanas: 1, paradas: 4 };
const CORTA = { tipo: 'corta', clase: 'forma', hora: 945, modulo: 'estira', min: 2, veces: 3, semanas: 1, paradas: 5 };
const LUNES_940 = { tipo: 'hora', clase: 'forma', pregunta: true, campo: 'inicio', dia: 1, hora: 580, veces: 2, paradas: 0 };
const MENOS = { tipo: 'menos', clase: 'rutinas', modulo: 'mueve', mas: 'estira', veces: 10, de: 15, paradas: 10 };
const CARTAS = {
  cambios: { semana, dias: 5, carta: true, ayudo: ['move.neck.3', 'breathe.exhale.46'], hechas: 26, total: 35, barras: barras([[6, 7], [7, 7], [3, 7], [6, 7], [4, 7]]), cambios: [GEMELOS, CORTA] },
  igual: { semana, dias: 5, carta: true, ayudo: ['move.wrists'], hechas: 31, total: 35, barras: barras([[7, 7], [6, 7], [6, 7], [7, 7], [5, 7]]), cambios: [] },
  pregunta: { semana, dias: 5, carta: true, ayudo: ['move.shoulder.circles'], hechas: 22, total: 35, barras: barras([[3, 7], [5, 7], [5, 7], [4, 7], [5, 7]]), cambios: [GEMELOS, LUNES_940] },
  soloPregunta: { semana, dias: 4, carta: true, ayudo: ['move.shoulder.circles'], hechas: 22, total: 28, barras: barras([[3, 7], [6, 7], [6, 7], [7, 7]]), cambios: [LUNES_940] },
  sinAyuda: { semana, dias: 5, carta: true, ayudo: [], hechas: 22, total: 35, barras: barras([[4, 7], [5, 7], [4, 7], [5, 7], [4, 7]]), cambios: [MENOS] },
};
const APRENDIDO = {
  descansa: { 'extra.calves': '2026-11-16' }, cortas: [{ hora: 945, hasta: '2026-11-16' }],
  ayuda: { ids: ['move.neck.3', 'breathe.exhale.46'], hasta: '2026-11-16' }, rechazado: {},
};

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

async function abrir(browser, ancho, alto, estado) {
  const movil = ancho < 768;
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
  await page.waitForTimeout(3200);   /* deja pasar la revisión del motor (2,5 s) */
  return { context, page };
}

/* Pone una carta en el estado con la opción de la maqueta y espera a la ventana. */
async function carta(page, res, maqueta, extra) {
  await page.evaluate(([res, maqueta, extra]) => {
    if (window.PACE_CARTA_MAQUETA) Object.assign(window.PACE_CARTA_MAQUETA, maqueta);
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, {
      carta: Object.assign({ lunes: '2026-10-19', res: res, vista: null, respuesta: null, hora: null }, extra || {}) }) }));
  }, [res, maqueta || {}, extra || null]);
  await page.waitForSelector('[data-pace-carta]', { state: 'visible' });
  await page.waitForTimeout(500);
}

function medir(page) {
  return page.evaluate(() => {
    const c = document.querySelector('[data-pace-modal-card]');
    const r = c.getBoundingClientRect();
    return { alto: Math.round(r.height), scroll: c.scrollHeight - c.clientHeight, fuera: Math.max(0, Math.round(r.bottom - window.innerHeight), Math.round(-r.top)) };
  });
}

async function foto(page, nombre, notas) {
  notas[nombre] = await medir(page);
  await page.screenshot({ path: path.join(SALIDA, nombre + '.jpg'), type: 'jpeg', quality: 82 });
}

async function main() {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await servidor();
  const browser = await chromium.launch();
  const notas = {};
  try {
    for (const [ancho, alto, sufijo] of [[360, 718, 'movil'], [360, 640, 'movil-640'], [1280, 800, 'escritorio']]) {
      const { context, page } = await abrir(browser, ancho, alto, semilla({ sidebarCollapsed: ancho < 768 }));
      await carta(page, CARTAS.cambios);
      await foto(page, 'cambios-' + sufijo, notas);
      await carta(page, CARTAS.igual);
      await foto(page, 'igual-' + sufijo, notas);
      await carta(page, CARTAS.sinAyuda);
      await foto(page, 'sin-ayuda-' + sufijo, notas);
      /* La pregunta de tus horas junto a un cambio: A, en la misma ventana; B, después. */
      await carta(page, CARTAS.pregunta, { pregunta: 'junta' });
      await foto(page, 'pregunta-A-junta-' + sufijo, notas);
      await carta(page, CARTAS.pregunta, { pregunta: 'despues' });
      await foto(page, 'pregunta-B-1-' + sufijo, notas);
      await carta(page, CARTAS.pregunta, { pregunta: 'despues' }, { respuesta: 'vale' });
      await foto(page, 'pregunta-B-2-' + sufijo, notas);
      await carta(page, CARTAS.soloPregunta);
      await foto(page, 'solo-pregunta-' + sufijo, notas);
      /* Lo aprendido en «Tu semana»: A, la lista; B, una línea que la abre. */
      await page.evaluate(() => setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { carta: null }) })));
      await page.waitForSelector('[data-pace-carta]', { state: 'detached' });
      for (const v of ['lista', 'linea']) {
        await page.evaluate(([v, a]) => {
          if (window.PACE_CARTA_MAQUETA) window.PACE_CARTA_MAQUETA.aprendido = v;
          setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { aprendido: a,
            horario: Object.assign({ inicio: 540, comida: 840, comidaDur: 60, salida: 1020 }, prev.ritmo.horario || {}, { dias: { 1: { inicio: 580 } } }) }) }));
          ritmoSemanaAbrir();
        }, [v, APRENDIDO]);
        await page.waitForSelector('[data-pace-aprendidos]', { state: 'visible' });
        await page.waitForTimeout(500);
        const hoja = await page.evaluate(() => {
          const c = document.querySelector('[data-pace-modal-card]');
          return { alto: Math.round(c.getBoundingClientRect().height), scroll: c.scrollHeight - c.clientHeight };
        });
        notas['aprendido-' + v + '-' + sufijo] = hoja;
        await page.evaluate(() => { const c = document.querySelector('[data-pace-modal-card]'); c.scrollTop = c.scrollHeight; });
        await page.waitForTimeout(200);
        await page.screenshot({ path: path.join(SALIDA, 'aprendido-' + (v === 'lista' ? 'A' : 'B') + '-' + sufijo + '.jpg'), type: 'jpeg', quality: 82 });
        await page.keyboard.press('Escape');
        await page.waitForSelector('[data-pace-aprendidos]', { state: 'detached' });
      }
      /* En inglés, la ventana más llena (la A de la pregunta) en el móvil más bajo. */
      if (sufijo === 'movil-640') {
        await page.evaluate(() => setState({ lang: 'en' }));
        await carta(page, CARTAS.pregunta, { pregunta: 'junta' });
        await foto(page, 'pregunta-A-junta-en-' + sufijo, notas);
      }
      await context.close();
    }
  } finally {
    await browser.close();
    srv.kill();
  }
  fs.writeFileSync(path.join(__dirname, 'medidas.json'), JSON.stringify(notas, null, 2));
  console.log(JSON.stringify(notas, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
