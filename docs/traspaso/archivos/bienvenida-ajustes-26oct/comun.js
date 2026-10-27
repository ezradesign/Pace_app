// Lo compartido por los guiones de fotos de la maqueta de la bienvenida y los Ajustes.
'use strict';
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/mueve-estira-capas-e9ab74';
const { sembrar, irAlArtefacto, RUTA_ARTEFACTO } = require(R + '/tests/helpers');
const fs = require('fs');
const OUT = __dirname.replace(/\\/g, '/') + '/../fm/';
fs.mkdirSync(OUT, { recursive: true });
const FECHA = '2026-10-27';

const TAMANOS = {
  m: { w: 360, h: 740 },
  m640: { w: 360, h: 640 },
  d: { w: 1280, h: 800 },
  ez: { w: 1536, h: 710 },
  d768: { w: 1366, h: 768 },
};
const tag = (o) => `${o.w}-${o.pal}-${o.lang}`;

/* Un contexto como un móvil o un ordenador. `fresco`: sin sembrar (primera vez de la vida), con
   el idioma y la paleta del sistema; si no, sembrado como en la suite. */
async function abrir(browser, o) {
  const movil = o.w < 700;
  const context = await browser.newContext({
    viewport: { width: o.w, height: o.h }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: o.lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: o.pal === 'oscuro' ? 'dark' : 'light',
  });
  /* Chromium headless dice siempre «bloqueadas» (ajustes.spec.js): se pone lo de una instalación nueva. */
  await context.addInitScript(() => { try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {} });
  if (!o.fresco) await sembrar(context, Object.assign({ lang: o.lang, palette: o.pal, paletteAuto: false, sidebarCollapsed: movil }, o.extra || {}));
  const page = await context.newPage();
  await page.clock.install({ time: new Date(FECHA + 'T' + (o.hora || '10:00') + ':00+01:00') });
  if (o.fresco) {
    await page.goto(RUTA_ARTEFACTO);
    await page.locator('[role=dialog][data-pace-scene-card]').waitFor({ state: 'visible' });
  } else {
    await irAlArtefacto(page);
  }
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);
  return { context, page };
}
const foto = (page, nombre, opts) => page.screenshot(Object.assign({ path: OUT + nombre + '.png' }, opts || {}));
const guardar = (nombre, datos) => fs.writeFileSync(OUT + nombre + '.json', JSON.stringify(datos, null, 1));

module.exports = { R, OUT, FECHA, TAMANOS, tag, abrir, foto, guardar };
