/* PACE · fotos de la pausa YA MONTADA (opción A, 9 oct. 2026)
   ===========================================================
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/pausa-9oct/fotos.js [puerto]
   Igual que ../pausa-8oct/fotos.js, pero sin pintar nada encima: es la app tal cual. Levanta
   su servidor (8785 por defecto, nunca el 8765 ni el 8775) y se para si ese puerto lo sirve
   otra carpeta. Deja en fotos/ la pausa corta, la larga, la comida, sin «A tu ritmo» (45 min:
   Estira) y el agua sin «A tu ritmo» (las 16:00 sin haber bebido), a 360×640 y 1280×800, en
   crema y en oscuro, y la corta en inglés; el primer Pomodoro con la pausa abierta (el sello
   espera) y en la home al saltarla (sale); y medidas.json con el alto de la ventana. */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules', '@playwright/test'));
const sharp = require(path.join(RAIZ, 'node_modules', 'sharp'));

const PUERTO = Number(process.argv[2] || 8785);
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');
const MEDIDAS = path.join(__dirname, 'medidas.json');

const PERFIL = { need: 'body', time: 'block', environment: 'home', completedAt: 1 };
const dia = () => ({ fecha: '2026-10-08', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} });
/* El mismo día que las fotos del 8 oct.: bloque 1 → 9:45 Estira; bloque 3 → 11:25 la larga;
   bloque 6 → 14:00 la comida. `achievements` lleva ya «Primer paso» para que su aviso no salga. */
const YA = { achievements: { 'first.step': 1 } };
const CASOS = {
  corta: { hora: '09:00', estado: { ritmo: { dia: dia() } }, boton: { es: 'Empezar jornada', en: 'Start the day' } },
  larga: { hora: '10:40', estado: { cycle: 2, ritmo: { dia: dia() } }, boton: { es: 'Empezar bloque 3', en: 'Start block 3' } },
  comida: { hora: '13:20', estado: { cycle: 5, ritmo: { dia: dia() } }, boton: { es: 'Empezar bloque 6', en: 'Start block 6' } },
  libre: { hora: '11:00', estado: { focusMinutes: 45, ritmo: { libre: true } }, boton: { es: 'Empezar foco', en: 'Start focus' } },
  agua: { hora: '15:40', estado: { focusMinutes: 25, ritmo: { libre: true } }, boton: { es: 'Empezar foco', en: 'Start focus' } },
  /* El primer Pomodoro de alguien nuevo: gana «Primer paso». Foto con la pausa abierta (el
     aviso espera) y otra al saltarla (sale en la home). */
  sello: { hora: '10:00', estado: { focusMinutes: 15, achievements: {}, ritmo: { libre: true } }, boton: { es: 'Empezar foco', en: 'Start focus' } },
};
const TAMANOS = [[360, 640, true], [1280, 800, false]];

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

async function abrirPausa(browser, caso, paleta, lang, [ancho, alto, movil]) {
  const c = CASOS[caso];
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: ancho, height: alto }, isMobile: movil, hasTouch: movil,
    locale: lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: paleta === 'oscuro' ? 'dark' : 'light', deviceScaleFactor: movil ? 2 : 1 });
  const estado = Object.assign({ firstSeen: 1, lang, langAuto: false, palette: paleta, profile: PERFIL, lastActiveDay: 'Thu Oct 08 2026' }, YA, c.estado);
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
  await page.waitForTimeout(caso === 'sello' ? 1500 : 900);
  if (!(await page.locator('[data-pace-break-shortcut]').count())) throw new Error('No se abrió la pausa: ' + caso);
  return { context, page };
}

function medir(page) {
  return page.evaluate(() => {
    const card = document.querySelector('[data-pace-modal-card]');
    const r = card.getBoundingClientRect();
    return { alto: Math.round(r.height), arriba: Math.round(r.top), ancho: Math.round(r.width), izquierda: Math.round(r.left),
      sobra: card.scrollHeight - card.clientHeight };
  });
}

async function guardar(png, nombre, m, ancho, alto) {
  await sharp(png).webp({ quality: 84 }).toFile(path.join(SALIDA, nombre + '.webp'));
  if (ancho < 1000) return;
  const x = Math.max(0, m.izquierda - 48), y = Math.max(0, m.arriba - 48);
  await sharp(png).extract({ left: x, top: y, width: Math.min(ancho - x, m.ancho + 96), height: Math.min(alto - y, m.alto + 96) })
    .webp({ quality: 88 }).toFile(path.join(SALIDA, nombre + '-recorte.webp'));
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const medidas = {};
  const srv = await servidor();
  const browser = await chromium.launch();
  try {
    const tandas = [];
    for (const caso of Object.keys(CASOS)) for (const paleta of ['crema', 'oscuro']) tandas.push([caso, paleta, 'es']);
    tandas.push(['corta', 'crema', 'en']);
    for (const [caso, paleta, lang] of tandas) {
      for (const tam of TAMANOS) {
        const { context, page } = await abrirPausa(browser, caso, paleta, lang, tam);
        const nombre = caso + '-' + tam[0] + 'x' + tam[1] + (lang === 'en' ? '-en' : '') + (paleta === 'oscuro' ? '-oscuro' : '');
        const png = await page.screenshot();
        medidas[nombre] = await medir(page);
        await guardar(png, nombre, medidas[nombre], tam[0], tam[1]);
        console.log(nombre, JSON.stringify(medidas[nombre]));
        if (caso === 'sello') {
          await page.getByRole('button', { name: 'Saltar esta pausa', exact: true }).click();
          await page.locator('div[aria-live="polite"] > div').first().waitFor({ state: 'visible' });
          await page.waitForTimeout(500);
          await sharp(await page.screenshot()).webp({ quality: 84 }).toFile(path.join(SALIDA, nombre.replace('sello', 'sello-home') + '.webp'));
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    srv.kill();
    fs.writeFileSync(MEDIDAS, JSON.stringify(medidas, null, 1) + '\n');
  }
})().catch((e) => { console.error(e); process.exit(1); });
