/* PACE · fotos de la app real para la página de las series y «PACE que aprende» (14 oct. 2026)
   ========================================================================================
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/series-15oct/fotos.js [puerto]

   Levanta su propio servidor (8795 por defecto) y comprueba con X-Pace-Raiz que sirve
   ESTA carpeta. El caso es el de Ez: miércoles 14 de octubre, «Dos horas» desde las 9:00,
   la primera pausa (9:35). Fotos a 360 × 718 (su móvil) y 1280 × 800:
     · hoy: la pausa tal cual (Escritorio express, «Antídoto a la silla»);
     · a, b, c: la misma pausa con lo que serviría la regla nueva (Caderas de pie, que la
       app pinta de verdad pidiendo «Otra») y el motivo escrito de tres maneras. El motivo
       va inyectado en el DOM: no hay código nuevo en la app. */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
/* Un worktree no trae node_modules: se usan los de la carpeta principal. */
const MODS = [path.join(RAIZ, 'node_modules'), path.resolve(RAIZ, '../../../node_modules')].find((p) => fs.existsSync(path.join(p, '@playwright')));
const { chromium } = require(path.join(MODS, '@playwright', 'test'));

const PUERTO = Number(process.argv[2] || 8795);
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');
const HOY = '2026-10-14';
const NUEVE = new Date(HOY + 'T09:00:00+02:00');
const ESTADO = {
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
  ritmo: { dia: { fecha: HOY, opcion: '2h', desde: 540, cicloBase: 0, cambios: {} } },
};
const VISTAS = [{ n: 'mov', w: 360, h: 718, dpr: 2, movil: true }, { n: 'esc', w: 1280, h: 800, dpr: 1, movil: false }];
/* Las tres maneras de decir el motivo (y, en la C, mirar lejos en el subtítulo). */
const VARIANTES = [
  { id: 'a', motivo: 'Para empezar, de pie' },
  { id: 'b', motivo: 'Caderas: sin mover hoy' },
  { id: 'c', motivo: 'Caderas: sin mover hoy', sub: '9:35 · Antes, mira lejos 20 segundos.' },
];
/* Todas las frases de la tabla de casos, para medir en la app cuántas líneas ocupan en el
   plato a 360 px (el motivo va en versalitas espaciadas y una segunda línea empuja la
   ventana 28 px). Se miden en los dos idiomas. */
const FRASES = {
  es: ['Para empezar, de pie', 'Después de comer, de pie', 'Dos horas: sal de la silla', 'Para cerrar, despacio',
    'Caderas: sin mover hoy', 'Espalda: sin mover hoy', 'Muñecas: sin mover hoy', 'Hombros: sin mover hoy',
    'Piernas: sin mover hoy', 'Cuello: sin mover hoy', 'Llevas 70 min sentado', 'Hoy aún no has respirado',
    'Tras comer, de pie', 'Toca levantarse', 'Antídoto a la silla', 'Para cerrar la jornada'],
  en: ['To start, on your feet', 'After lunch, on your feet', 'Two hours: leave the chair', 'To close, slowly',
    'Hips: not moved today', 'Back: not moved today', 'Wrists: not moved today', 'Shoulders: not moved today',
    'Legs: not moved today', 'Neck: not moved today', '70 min sitting so far', 'No breathing yet today',
    'After lunch, stand up', 'Time to stand up'],
};

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

async function terminarBloque(page) {
  for (let i = 0; i < 60; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(50);
    if (await page.locator('[data-pace-break-shortcut]').count()) return;
  }
  throw new Error('el bloque no terminó');
}

async function foto(page, v, nombre) {
  await page.waitForTimeout(400);
  const archivo = path.join(SALIDA, v.n + '-' + nombre + '.jpg');
  /* En escritorio, solo la ventana de la pausa con un margen: la home de detrás no decide nada. */
  let clip;
  if (!v.movil) {
    const caja = await page.evaluate(() => {
      /* La ventana es el hijo del fondo del modal que contiene el plato. */
      let el = document.querySelector('[data-pace-break-ritmo]');
      while (el.parentElement && !el.parentElement.hasAttribute('data-pace-modal-backdrop')) el = el.parentElement;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    clip = { x: Math.max(0, caja.x - 40), y: Math.max(0, caja.y - 40), width: Math.min(v.w, caja.w + 80), height: Math.min(v.h, caja.h + 80) };
  }
  await page.screenshot({ path: archivo, type: 'jpeg', quality: 78, clip });
  console.log('foto', path.basename(archivo), Math.round(fs.statSync(archivo).size / 1024) + ' KB');
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await servidor();
  const browser = await chromium.launch();
  try {
    /* Cada foto en una página nueva y con el plato ya servido desde el principio: cambiar
       el plato con la ventana abierta corría el aro de detrás hacia un lado en el móvil
       (el fallo de «la home que se corre de lado»), y la foto despistaba. */
    async function pausaAbierta(v, cambios) {
      const context = await browser.newContext({ baseURL: BASE, viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr,
        isMobile: v.movil, hasTouch: v.movil, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
      const estado = JSON.parse(JSON.stringify(ESTADO));
      estado.ritmo.dia.cambios = cambios || {};
      await context.addInitScript((e) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, estado);
      const page = await context.newPage();
      await page.clock.install({ time: NUEVE });
      await page.goto('/index.html');
      await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
      await page.waitForTimeout(250);
      await terminarBloque(page);
      return { context, page };
    }
    for (const v of VISTAS) {
      const { context, page } = await pausaAbierta(v, {});
      await foto(page, v, 'hoy');
      /* Lo que serviría la regla nueva en esta parada: Caderas de pie, la que sale con
         «Otra» k veces. Se busca k sin tocar el estado. */
      const k = await page.evaluate(() => {
        const s = getState();
        for (let k = 0; k < 12; k++) {
          const dia = Object.assign({}, s.ritmo.dia, { cambios: { p1: k } });
          const p = ritmoPropuesta(Object.assign({}, s, { ritmo: Object.assign({}, s.ritmo, { dia }) }));
          if (p && p.rutina && p.rutina.id === 'move.hips.standing') return k;
        }
        return null;
      });
      await context.close();
      if (k == null) throw new Error('Caderas de pie no sale en la primera pausa');
      for (const x of VARIANTES) {
        const ab = await pausaAbierta(v, { p1: k });
        await ab.page.evaluate((x) => {
          const c = document.querySelector('[data-pace-break-ritmo]');
          c.querySelector('.pace-break-motivo').textContent = x.motivo;
          if (!x.sub) return;
          const modal = c.closest('[data-pace-modal-backdrop]') || document;
          const w = document.createTreeWalker(modal, NodeFilter.SHOW_TEXT);
          let n;
          while ((n = w.nextNode())) if (/· Lo que toca ahora.$/.test(n.nodeValue.trim())) n.nodeValue = x.sub;
        }, x);
        await foto(ab.page, v, x.id);
        if (v.movil && x.id === 'a') {
          const lineas = await ab.page.evaluate((F) => {
            const el = document.querySelector('[data-pace-break-ritmo] .pace-break-motivo');
            const alto = parseFloat(getComputedStyle(el).lineHeight);
            const out = {};
            Object.keys(F).forEach((l) => { out[l] = F[l].map((f) => { el.textContent = f; return [f, Math.round(el.getBoundingClientRect().height / alto)]; }); });
            return out;
          }, FRASES);
          fs.writeFileSync(path.join(__dirname, 'frases-360.json'), JSON.stringify(lineas, null, 1));
          Object.keys(lineas).forEach((l) => console.log(l, lineas[l].filter((y) => y[1] > 1).map((y) => y[0]).join(' | ') || 'todas en una línea'));
        }
        await ab.context.close();
      }
    }
  } finally {
    await browser.close();
    srv.kill();
  }
})().catch((e) => { console.error(e); process.exit(1); });
