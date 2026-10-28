/* PACE · LAS CAPTURAS DE PACE COMPLETO, PARA /premium
 * ==================================================
 * Uso: node scripts/play/capturas-premium.js [puerto] [--sin-marco=carpeta]
 *      (después de `node build-standalone.js`)
 *
 * Lo mismo que capturas.js (el móvil de 360 × 640 a 3×, el estado sembrado, la hora fija y el
 * título encima), pero con lo de pago: una rutina propia en el constructor, la carta del lunes,
 * tu mes, tu año y una rutina profunda de Respira. Deja premium/<nombre>-<idioma>.webp a 540 × 960,
 * como la tira de /beta. Con `--sin-marco=carpeta`, guarda también ahí la pantalla tal cual, en PNG.
 * Con nombres de escena (`carta mes`), solo esas.
 *
 * Nada de Mueve ni de Estira por su nombre (se rehacen; Ez, 23 oct. 2026): la rutina propia
 * lleva ejercicios cuyo nombre y dibujo se quedan, la carta habla de Respira y de una pausa
 * por su hora, y la rutina profunda es de Respira. Por lo mismo, «Tus rutinas» no se fotografía
 * dentro de la biblioteca de Mueve, cuyos filtros y cifras cambian.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('@playwright/test');
const sharp = require('sharp');
const { ROOT, PUERTO, BASE, CLAVE, clic, sesion, marco, guardar, esperarServidor } = require('./capturas');

const SALIDA = path.join(ROOT, 'premium');
const SIN_MARCO = (process.argv.find((a) => a.startsWith('--sin-marco=')) || '').slice('--sin-marco='.length);

/* La fecha de cada escena: la carta sale el lunes; el mes y el año, casi a final de mes. */
const LUNES = new Date('2026-10-26T08:40:00+01:00');
const VIERNES = new Date('2026-10-30T18:10:00+01:00');
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

function base(lang, extra) {
  return Object.assign({ firstSeen: 1, lang, langAuto: false, palette: 'crema', ritmo: { libre: true }, premiumUnlocked: true }, extra || {});
}

/* Una rutina propia hecha con ejercicios que se quedan como están. */
const MEDIA_MANANA = {
  es: 'Media mañana', en: 'Mid-morning',
  pasos: [['Barbilla atrás', 30], ['Juntar omóplatos', 30], ['Elevación de talones', 30], ['Sentadilla a silla', 40], ['Flexiones inclinadas', 30]],
};
const ANTES_DE_COMER = {
  es: 'Antes de comer', en: 'Before lunch',
  pasos: [['Sentadilla a silla', 40], ['Elevación de talones', 30], ['Barbilla atrás', 30]],
};
function rutina(r, lang, id) {
  const steps = r.pasos.map(([name, dur]) => ({ name, dur, cue: '' }));
  const min = Math.max(1, Math.ceil(steps.reduce((a, s) => a + s.dur, 0) / 60));
  return { id, name: r[lang], steps, min, createdAt: 1761030000000, updatedAt: 1761030000000 };
}
function conRutinas(lang) {
  return { customRoutines: [rutina(MEDIA_MANANA, lang, 'custom.1761030000000'), rutina(ANTES_DE_COMER, lang, 'custom.1761116400000')] };
}

/* La carta de esta semana, puesta a mano: lo que te ayudó (dos de Respira), las pausas hechas
   y dos cambios que no nombran ningún ejercicio. */
function conCarta() {
  const barras = [[1, 7, 7], [2, 6, 7], [3, 7, 7], [4, 5, 7], [5, 4, 6], [6, 0, 0], [7, 0, 0]].map(([d, hechas, total]) => ({ d, hechas, total }));
  const res = { semana: { lunes: '2026-10-26', desde: '2026-10-19', hasta: '2026-10-25' }, dias: 5, carta: true,
    ayudo: ['breathe.physiological', 'breathe.coherent.55'], hechas: 29, total: 34, barras,
    cambios: [{ tipo: 'corta', clase: 'forma', hora: 945, modulo: 'estira', veces: 3, semanas: 1, paradas: 3 },
              { tipo: 'menos', clase: 'forma', modulo: 'mueve', veces: 4, de: 6, semanas: 1, paradas: 4 }] };
  return { ritmo: { horario: HORARIO, libre: true, carta: { lunes: '2026-10-26', res, vista: null, respuesta: null, hora: null } } };
}

/* Ocho meses de práctica, del 2 de marzo al 29 de octubre: casi todos los días de diario, pocos
   fines de semana y algo más cada mes. El azar va con semilla: cada vez sale igual. */
function conHistoria() {
  let x = 20261030;
  const azar = () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
  const p2 = (n) => String(n).padStart(2, '0');
  const days = {}, months = {}, years = {};
  const suma = (dest, k, d) => { const e = dest[k] || (dest[k] = { focusMinutes: 0, breathMinutes: 0, moveMinutes: 0, waterGlasses: 0, holdSeconds: 0 });
    for (const c in d) e[c] += d[c]; };
  for (let f = new Date(2026, 2, 2); f < new Date(2026, 9, 30); f.setDate(f.getDate() + 1)) {
    const finde = f.getDay() === 0 || f.getDay() === 6;
    const ganas = 0.55 + 0.05 * (f.getMonth() - 2);
    if (azar() > (finde ? 0.22 : ganas + 0.18)) continue;
    const d = {
      focusMinutes: finde ? 25 : 25 * (2 + Math.floor(azar() * 5)),
      breathMinutes: azar() < 0.7 ? 3 + Math.floor(azar() * 4) * 3 : 0,
      moveMinutes: azar() < 0.75 ? 4 + Math.floor(azar() * 4) * 3 : 0,
      waterGlasses: 3 + Math.floor(azar() * 6),
      holdSeconds: 0,
    };
    const iso = f.getFullYear() + '-' + p2(f.getMonth() + 1) + '-' + p2(f.getDate());
    days[iso] = d;
    suma(months, iso.slice(0, 7), d);
    suma(years, iso.slice(0, 4), d);
  }
  return {
    firstSeen: new Date(2026, 2, 2, 9).getTime(), lastActiveDay: 'Fri Oct 30 2026',
    _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
    history: { days, months, years },
    weeklyStats: {
      focusMinutes: [100, 125, 75, 150, 50, 0, 0], breathMinutes: [6, 9, 3, 12, 6, 0, 0],
      moveMinutes: [10, 7, 13, 10, 4, 0, 0], waterGlasses: [6, 7, 5, 8, 4, 0, 0], holdSeconds: [0, 0, 0, 0, 0, 0, 0],
    },
  };
}

async function abrirStats(page, pestana) {
  await clic(page, /^(Ver estadísticas|View stats)$/);
  await page.locator('[data-pace-stats-tab="' + pestana + '"]').filter({ visible: true }).first().click();
  await page.waitForTimeout(900);
}

const ESCENAS = [
  { id: 'rutina-propia', reloj: VIERNES, semilla: (l) => base(l, conRutinas(l)),
    llegar: async (page) => {
      await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-custom-builder', { detail: { id: 'custom.1761030000000' } })));
      await page.waitForTimeout(900);
    },
    titulo: { es: 'Tus propias rutinas', en: 'Your own routines' },
    sub: { es: 'Eliges los ejercicios, el orden y el tiempo.', en: 'You choose the exercises, the order and the time.' } },
  { id: 'carta', reloj: LUNES, semilla: (l) => base(l, conCarta()),
    llegar: async (page) => { await page.locator('[data-pace-carta]').waitFor({ state: 'visible' }); await page.waitForTimeout(700); },
    titulo: { es: 'La carta del lunes', en: 'The Monday letter' },
    sub: { es: 'Tu semana, y lo que cambia en la siguiente.', en: 'Your week, and what changes in the next.' } },
  { id: 'mes', reloj: VIERNES, semilla: (l) => base(l, conHistoria()),
    llegar: (page) => abrirStats(page, 'month'),
    titulo: { es: 'Tu mes', en: 'Your month' },
    sub: { es: 'Cada día, lo que hiciste.', en: 'Every day, what you did.' } },
  { id: 'ano', reloj: VIERNES, semilla: (l) => base(l, conHistoria()),
    llegar: (page) => abrirStats(page, 'year'),
    titulo: { es: 'Tu año', en: 'Your year' },
    sub: { es: 'Mes a mes, cómo vas.', en: 'Month by month, how it is going.' } },
  { id: 'respira-honda', reloj: VIERNES, semilla: (l) => base(l),
    llegar: (page) => sesion(page, /^(Respira|Breathe)/, ['nadi']),
    titulo: { es: 'Las rutinas más profundas', en: 'The deeper routines' },
    sub: { es: 'Nadi Shodhana, respiración alterna.', en: 'Nadi Shodhana, alternate breathing.' } },
];

async function main() {
  const solo = process.argv.slice(2).filter((a) => /^[a-z][a-z0-9-]+$/.test(a));
  const servidor = spawn(process.execPath, [path.join(ROOT, '.claude', 'static-server.js')],
    { cwd: ROOT, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  try {
    await esperarServidor(40);
    const navegador = await chromium.launch();
    for (const lang of ['es', 'en']) {
      if (SIN_MARCO) fs.mkdirSync(path.join(SIN_MARCO, lang), { recursive: true });
      for (const esc of ESCENAS) {
        if (solo.length && !solo.includes(esc.id)) continue;
        const ctx = await navegador.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3,
          locale: lang === 'en' ? 'en-US' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
        await ctx.addInitScript(([k, v]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(v)); }, [CLAVE, esc.semilla(lang)]);
        const page = await ctx.newPage();
        page.setDefaultTimeout(8000);
        const errores = [];
        page.on('pageerror', (e) => errores.push(e.message));
        await page.clock.install({ time: esc.reloj });
        await page.goto(BASE + '/index.html');
        await page.waitForTimeout(1500);
        await esc.llegar(page);
        await page.evaluate(() => document.fonts.ready);
        const cruda = await page.screenshot();
        await ctx.close();
        if (SIN_MARCO) await guardar(path.join(SIN_MARCO, lang, esc.id + '.png'), cruda);

        const lienzo = await navegador.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
        /* Desde una página del mismo servidor, para que carguen sus fuentes (capturas.js). */
        await lienzo.goto(BASE + '/safety.html');
        await lienzo.setContent(marco(lang, esc, 'data:image/png;base64,' + cruda.toString('base64')));
        await lienzo.evaluate(() => document.fonts.ready);
        await lienzo.waitForLoadState('networkidle');
        const png = await lienzo.locator('.lienzo').screenshot();
        await lienzo.close();
        const webp = await sharp(png).resize(540, 960).webp({ quality: 82 }).toBuffer();
        await guardar(path.join(SALIDA, esc.id + '-' + lang + '.webp'), webp);
        console.log(lang, esc.id, Math.round(webp.length / 1024) + ' KB', errores.length ? 'ERRORES: ' + errores.join(' | ') : 'ok');
      }
    }
    await navegador.close();
  } finally {
    servidor.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
