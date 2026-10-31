/* PACE · LAS CAPTURAS DE GOOGLE PLAY
 * ==================================
 * Uso: node scripts/play/capturas.js [puerto]      (después de `node build-standalone.js`)
 *
 * Abre el `index.html` compilado como un móvil de 360 × 640 a 3× (1080 × 1920, lo que pide
 * Play), en castellano y en inglés, llega a cada pantalla como lo haría alguien y saca:
 *   - docs/launch/google-play/capturas-sin-marco/<idioma>/N-nombre.png, la pantalla tal cual;
 *   - docs/launch/google-play/capturas/<idioma>/N-nombre.png, la misma con su título encima
 *     (la serif recta de los títulos, sin cursiva: Ez, 20 oct. 2026).
 * Las pantallas se preparan como en scripts/audit/recorrido-app.js: estado sembrado en
 * localStorage y la hora fija. No pulsa nada que guarde fuera del navegador.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const { chromium } = require('@playwright/test');

const ROOT = path.join(__dirname, '..', '..');
const PUERTO = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) || 8793);
/* `--ordenador`: las de Chromebook, la app de escritorio a 1280 × 720 por 1,5 (1920 × 1080, lo
   que Play acepta en apaisado), sin título, en capturas-ordenador/<idioma>/. */
const ORDENADOR = process.argv.includes('--ordenador');
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(ROOT, 'docs', 'launch', 'google-play');
const CLAVE = 'pace.state.v2';
const JUEVES_9 = new Date('2026-09-17T09:00:00+02:00');
const JORNADA = { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const LOGROS = ['first.step', 'first.breath', 'first.stretch', 'first.sip', 'first.extra', 'first.cycle', 'first.ritual',
  'first.day', 'first.plan', 'explore.box', 'explore.coherent', 'explore.physiological', 'explore.neck', 'explore.desk',
  'explore.hips', 'explore.shoulders'];

const re = (es, en) => new RegExp('^(' + es + '|' + en + ')');
const B = {
  foco: re('Empezar foco', 'Start focus'),
  respira: re('Respira', 'Breathe'),
  estira: re('Estira', 'Stretch'),
  logros: re('Ver logros', 'View achievements'),
  sesion: /^(Empezar sesión|Start session|Empezar|Start|Comenzar|Begin)$/,
};

function base(lang, palette, extra) {
  return Object.assign({ firstSeen: 1, lang, langAuto: false, palette, ritmo: { libre: true } }, extra || {});
}

/* Cada captura: semilla, cómo se llega, y su título y subtítulo en los dos idiomas. */
const ESCENAS = [
  { n: 1, id: 'jornada', semilla: (l) => base(l, 'crema', { ritmo: { dia: JORNADA } }),
    titulo: { es: 'Tu jornada, a tu ritmo', en: 'Your workday, at your pace' },
    sub: { es: 'Dime cuánto trabajas hoy y te reparto foco y pausas.', en: 'Tell PACE how long you work today: focus and breaks, planned.' } },
  /* La pausa de verdad: se empieza la jornada y se deja acabar el primer bloque. */
  { n: 2, id: 'pausa', semilla: (l) => base(l, 'crema', { ritmo: { dia: JORNADA } }),
    llegar: async (page) => {
      await clic(page, /^(Empezar jornada|Start the day)/);
      await page.clock.fastForward(45 * 60 * 1000 + 5000);
      await page.waitForTimeout(1500);
    },
    espera: 5500,
    titulo: { es: 'La pausa que toca', en: 'The break that fits' },
    sub: { es: 'Cada día, el cuerpo entero: cuello, espalda, piernas…', en: 'Every day, your whole body: neck, back, legs…' } },
  { n: 3, id: 'respira', semilla: (l) => base(l, 'crema'),
    llegar: (page) => sesion(page, B.respira, ['coherent', 'coherente']),
    titulo: { es: 'Respira', en: 'Breathe' },
    sub: { es: 'Veinte técnicas guiadas, con voz.', en: 'Twenty guided techniques, with a voice.' } },
  { n: 4, id: 'estira', semilla: (l) => base(l, 'crema'),
    llegar: (page) => sesion(page, B.estira, ['neck', 'cuello']),
    titulo: { es: 'Estira sin dejar tu mesa', en: 'Stretch without leaving your desk' },
    sub: { es: 'Cada paso, con su dibujo.', en: 'Every step, with its drawing.' } },
  { n: 5, id: 'foco-oscuro', semilla: (l) => base(l, 'oscuro'),
    llegar: async (page) => { await clic(page, B.foco); await page.clock.fastForward(7 * 60 * 1000); await page.waitForTimeout(600); },
    titulo: { es: 'Foco tranquilo', en: 'Calm focus' },
    sub: { es: 'Un Pomodoro sin prisas, también de noche.', en: 'A gentle pomodoro, day or night.' } },
  { n: 6, id: 'logros',
    semilla: (l) => base(l, 'crema', { achievements: Object.fromEntries(LOGROS.map((id, i) => [id, { unlockedAt: JUEVES_9.getTime() - (LOGROS.length - i) * 86400000 }])) }),
    llegar: (page) => clic(page, B.logros),
    titulo: { es: 'Logros para explorar', en: 'Achievements to explore' },
    sub: { es: 'Sellos de libreta de campo, sin rachas.', en: 'Field-notebook stamps, no streaks.' } },
];

async function clic(page, nombre) {
  const b = page.getByRole('button', { name: nombre }).filter({ visible: true }).first();
  if (!(await b.count())) throw new Error('no encuentro el botón ' + nombre);
  await b.click({ timeout: 4000 });
  await page.waitForTimeout(700);
}

/* Abre la biblioteca, elige la primera tarjeta cuyo id lleva alguna de las pistas (o la
   primera), empieza la sesión y la deja unos segundos en marcha. */
async function sesion(page, modulo, pistas) {
  await clic(page, modulo);
  const tarjetas = page.locator('[data-pace-lib-card]').filter({ visible: true });
  let tarjeta = tarjetas.first();
  for (const t of await tarjetas.all()) {
    const id = (await t.getAttribute('data-pace-lib-card')) || '';
    if (pistas.some((p) => id.toLowerCase().includes(p))) { tarjeta = t; break; }
  }
  await tarjeta.getByRole('button').first().click();
  await page.waitForTimeout(600);
  /* «Empezar» dentro de la ficha que está encima: el de la home, debajo, también se llama así. */
  for (let i = 0; i < 2; i++) {
    if (await page.locator('[data-pace-session-root]').count()) break;
    const encima = page.locator('[data-pace-modal-card], [role="dialog"]').filter({ visible: true }).last();
    const empezar = encima.getByRole('button', { name: B.sesion }).filter({ visible: true }).last();
    if (!(await empezar.count())) break;
    await empezar.click().catch(() => {});
    await page.waitForTimeout(1200);
  }
  /* La cuenta de «Prepárate» no se ve como la rutina: se salta, como haría quien ya está listo. */
  const ahora = page.getByRole('button', { name: /^(Empezar ahora|Start now)$/ }).filter({ visible: true }).first();
  if (await ahora.count()) { await ahora.click().catch(() => {}); await page.waitForTimeout(800); }
  await page.clock.fastForward(9000);
  await page.waitForTimeout(800);
}

/* El título encima de la pantalla: «PACE», el título en la serif recta y una línea. */
function marco(lang, esc, img) {
  return `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: 'Cormorant Garamond'; font-weight: 500; src: url('${BASE}/fonts/cormorantgaramond-500-normal.woff2') format('woff2'); }
@font-face { font-family: 'Inter Tight'; font-weight: 400; src: url('${BASE}/fonts/intertight-400-normal.woff2') format('woff2'); }
@font-face { font-family: 'Inter Tight'; font-weight: 500; src: url('${BASE}/fonts/intertight-500-normal.woff2') format('woff2'); }
html, body { margin: 0; }
.lienzo { width: 1080px; height: 1920px; background: #F2EDE0; position: relative; overflow: hidden; font-family: 'Inter Tight', sans-serif; color: #1F1C17; }
/* «PACE» arriba; el título y su línea, centrados en el hueco entre «PACE» y el borde de la
   pantalla (Ez, 21 oct.), así no quedan pegados arriba con un vacío debajo. */
.cab { position: absolute; left: 70px; right: 70px; top: 64px; height: 308px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.texto { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 14px; }
.eyebrow { font-size: 26px; letter-spacing: 0.32em; color: #6F695B; font-weight: 500; }
h1 { margin: 0; font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: 84px; line-height: 1.02; letter-spacing: -0.005em; text-wrap: balance; }
p { margin: 0; font-size: 34px; line-height: 1.3; color: #4A453C; max-width: 900px; }
.pantalla { position: absolute; left: 50%; top: 372px; transform: translateX(-50%); width: 840px; height: 1493px; border-radius: 46px;
  overflow: hidden; border: 3px solid #D6CDB6; box-shadow: 0 24px 60px rgba(31, 28, 23, 0.14); background: #F2EDE0; }
.pantalla img { width: 100%; height: 100%; display: block; }
</style><div class="lienzo"><div class="cab"><div class="eyebrow">PACE</div><div class="texto"><h1>${esc.titulo[lang]}</h1><p>${esc.sub[lang]}</p></div></div>
<div class="pantalla"><img src="${img}"></div></div>`;
}

/* En Windows, la vista previa del Explorador (o una subida a Play a medias) tiene la imagen
   abierta y la escritura falla: se reintenta un rato en vez de parar. */
async function guardar(ruta, png) {
  for (let i = 0; ; i++) {
    try { fs.writeFileSync(ruta, png); return; } catch (e) {
      if (i >= 40) throw e;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

function esperarServidor(intentos) {
  return new Promise((resolve, reject) => {
    const probar = (n) => http.get(BASE + '/index.html', (r) => { r.resume(); resolve(); })
      .on('error', () => (n > 0 ? setTimeout(() => probar(n - 1), 250) : reject(new Error('el servidor no arranca'))));
    probar(intentos);
  });
}

async function main() {
  const servidor = spawn(process.execPath, [path.join(ROOT, '.claude', 'static-server.js')],
    { cwd: ROOT, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  try {
    await esperarServidor(40);
    const navegador = await chromium.launch();
    for (const lang of ['es', 'en']) {
      const dirs = ORDENADOR ? ['capturas-ordenador'] : ['capturas', 'capturas-sin-marco'];
      for (const dir of dirs) fs.mkdirSync(path.join(SALIDA, dir, lang), { recursive: true });
      for (const esc of ESCENAS) {
        const semilla = esc.semilla(lang);
        const ctx = await navegador.newContext({
          viewport: ORDENADOR ? { width: 1280, height: 720 } : { width: 360, height: 640 }, deviceScaleFactor: ORDENADOR ? 1.5 : 3,
          locale: lang === 'en' ? 'en-US' : 'es-ES', timezoneId: 'Europe/Madrid',
          colorScheme: semilla.palette === 'oscuro' ? 'dark' : 'light', serviceWorkers: 'block' });
        await ctx.addInitScript(([k, v]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(v)); }, [CLAVE, semilla]);
        const page = await ctx.newPage();
        page.setDefaultTimeout(8000);
        const errores = [];
        page.on('pageerror', (e) => errores.push(e.message));
        await page.clock.install({ time: JUEVES_9 });
        await page.goto(BASE + '/index.html');
        await page.waitForTimeout(1500);
        if (esc.llegar) await esc.llegar(page);
        /* Se fotografía lo asentado: con 700 ms el aro y el botón salían a medio aparecer, y al acabar el
           primer Foco el aviso de «Nuevo sello» (3 s, y se va) se cruzaba con el texto de la hoja. */
        await page.waitForTimeout(esc.espera || 2500);
        await page.evaluate(() => document.fonts.ready);
        const nombre = esc.n + '-' + esc.id + '.png';
        const cruda = path.join(SALIDA, dirs[dirs.length - 1], lang, nombre);
        await guardar(cruda, await page.screenshot());
        await ctx.close();
        if (ORDENADOR) { console.log(lang, nombre, errores.length ? 'ERRORES: ' + errores.join(' | ') : 'ok'); continue; }

        const lienzo = await navegador.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
        /* Desde una página del mismo servidor: las fuentes de otro origen sin CORS no cargan
           y el título salía en una serif cualquiera. */
        await lienzo.goto(BASE + '/safety.html');
        await lienzo.setContent(marco(lang, esc, BASE + '/docs/launch/google-play/capturas-sin-marco/' + lang + '/' + nombre));
        await lienzo.evaluate(() => document.fonts.ready);
        await lienzo.waitForLoadState('networkidle');
        await guardar(path.join(SALIDA, 'capturas', lang, nombre), await lienzo.locator('.lienzo').screenshot());
        await lienzo.close();
        console.log(lang, nombre, errores.length ? 'ERRORES: ' + errores.join(' | ') : 'ok');
      }
    }
    await navegador.close();
  } finally {
    servidor.kill();
  }
}

/* Las de /premium (capturas-premium.js) se hacen con estas mismas piezas. */
module.exports = { ROOT, PUERTO, BASE, CLAVE, clic, sesion, marco, guardar, esperarServidor };
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
