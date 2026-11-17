/* PACE · LAS PANTALLAS QUE RECORRE LA PRUEBA DE LOS TEXTOS LARGOS (17 nov. 2026)
 * =============================================================================
 * Cada escena dice con qué estado se abre PACE, a qué hora, y cómo se llega a sus pantallas; en cada
 * momento llama a `medir(nombre, raíz, sinScroll)`. Se llega SIN leer ningún texto (con los textos
 * largos «Empezar» ya no se llama así): con los atajos del teclado (t, s, l), las actividades de la
 * home por su orden y los atributos `data-pace-*`.
 * La usan tests/textos-largos.spec.js y docs/proposals/textos-largos-17nov/genera.js.
 */
'use strict';

const FECHA = '2026-10-08';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+02:00');
const HOME = '[data-pace-home-body]';
const MODAL = '[data-pace-modal-card]';
const PANEL = '[data-pace-tweaks-panel]';
const SESION = '[data-pace-session-root]';
const BIENVENIDA = '[data-pace-scene-card][role="dialog"]';

const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const quieto = (page, ms) => page.waitForTimeout(ms || 600);

/* Las actividades de la home van en este orden (ActivityBar.jsx): Respira, Estira, Mueve, Hidrátate. */
const CHIP = { respira: 0, estira: 1, mueve: 2 };

async function abrirBiblioteca(page, cual) {
  await page.locator('[data-pace-activitybar-chip]').nth(CHIP[cual]).click();
  await vis(page, '.pace-lib').first().waitFor();
  await quieto(page, 700);
}

async function empezarRutina(page, cual, id) {
  await abrirBiblioteca(page, cual);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  /* Mueve y Estira enseñan antes la ficha con «Empezar»; una respiración sin aviso empieza ya. */
  const cta = vis(page, MODAL + ' [data-pace-cta]').last();
  await cta.or(page.locator(SESION)).first().waitFor({ timeout: 20000 });
  if (!(await page.locator(SESION).count())) await cta.click();
  await page.locator(SESION).first().waitFor({ timeout: 20000 });
  await quieto(page, 900);
}

/* Un bloque de 25 que terminó con PACE cerrado: al abrir lo cuenta y abre la pausa (foco-3). */
const terminoA = (hhmm) => (context) => context.addInitScript((fin) => {
  if (!localStorage.getItem('pace.timer.v1')) localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: fin, mode: 'foco', minutes: 25, id: 'vuelta' }));
}, hora(hhmm).getTime());

async function runner(page, medir, cual, id) {
  await empezarRutina(page, cual, id);
  await medir('colócate', SESION, null);
  await page.locator('[data-pace-v1-btn="next"]').click();
  await quieto(page);
  await medir('el ejercicio', SESION, null);
}

const ESCENAS = [
  { id: 'home-libre', nombre: 'La home por libre', semilla: { ritmo: { libre: true } }, hora: '10:00',
    llegar: (page, medir) => medir('la home', 'body', HOME) },
  { id: 'home-jornada', nombre: 'La home con la jornada', semilla: { ritmo: { dia: JORNADA } }, hora: '09:00',
    llegar: (page, medir) => medir('la home', 'body', HOME) },
  { id: 'tarjeta-dia', nombre: 'La tarjeta del día', semilla: { ritmo: { libre: true } }, hora: '10:00',
    llegar: async (page, medir) => {
      await vis(page, '[data-pace-ritmo-comienza], [data-pace-ritmo-ajustar]').first().click();
      await quieto(page);
      await medir('la pregunta del día', 'body', HOME);
    } },
  { id: 'pausa', nombre: 'La ventana de la pausa', semilla: { ritmo: { libre: true } }, hora: '10:40', antes: terminoA('10:35'),
    llegar: async (page, medir) => {
      await page.locator('[data-pace-break-shortcut]').first().waitFor();
      await quieto(page, 900);
      await medir('por libre', MODAL, null);
    } },
  { id: 'pausa-jornada', nombre: 'La ventana de la pausa, con la jornada', semilla: { ritmo: { dia: JORNADA } }, hora: '09:27', antes: terminoA('09:25'),
    llegar: async (page, medir) => {
      await page.locator('[data-pace-break-shortcut]').first().waitFor();
      await quieto(page, 900);
      await medir('con la jornada', MODAL, null);
    } },
  { id: 'runner-mueve', nombre: 'El runner de Mueve', semilla: { cuerpoAuto: false }, hora: '10:00',
    llegar: (page, medir) => runner(page, medir, 'mueve', 'extra.desk.pushups') },
  { id: 'runner-estira', nombre: 'El runner de Estira', semilla: { cuerpoAuto: false }, hora: '10:00',
    llegar: (page, medir) => runner(page, medir, 'estira', 'move.neck.3') },
  { id: 'respira', nombre: 'Respira', semilla: {}, hora: '10:00',
    llegar: async (page, medir) => {
      await empezarRutina(page, 'respira', 'breathe.coherent.55');
      await quieto(page, 2500);
      await medir('la sesión', SESION, null);
    } },
  { id: 'ajustes', nombre: 'Ajustes y «Tus datos»', semilla: {}, hora: '10:00',
    llegar: async (page, medir) => {
      await page.keyboard.press('t');
      await page.locator(PANEL).waitFor();
      await quieto(page);
      await medir('ajustes', PANEL, PANEL);
      const plegada = page.locator(PANEL + ' [data-pace-aj-plegada] .pace-aj-sec-accion');
      if (await plegada.isVisible()) {
        await plegada.click();
        await page.locator(PANEL + '[data-pace-aj-vista="datos"]').waitFor();
        await quieto(page);
        await medir('«Tus datos» abierta', PANEL, PANEL);
      }
    } },
  { id: 'sobre', nombre: 'El sobre', semilla: { novedadesVistas: null }, hora: '10:00',
    llegar: async (page, medir) => {
      await vis(page, '[data-pace-sobre]').first().click();
      await page.locator('[data-pace-sobre-hoja]').waitFor();
      await quieto(page);
      await medir('la hoja del sobre', MODAL, null);
    } },
  ...['mueve', 'estira', 'respira'].map((cual) => ({
    id: 'biblioteca-' + cual, nombre: 'La biblioteca de ' + cual[0].toUpperCase() + cual.slice(1), semilla: {}, hora: '10:00',
    llegar: async (page, medir) => { await abrirBiblioteca(page, cual); await medir('la biblioteca', MODAL, null); },
  })),
  { id: 'logros', nombre: 'Logros', semilla: {}, hora: '10:00',
    llegar: async (page, medir) => {
      await page.keyboard.press('l');
      await vis(page, MODAL).first().waitFor();
      await quieto(page, 900);
      await medir('los logros', MODAL, null);
    } },
  { id: 'estadisticas', nombre: 'Estadísticas', semilla: {}, hora: '10:00',
    llegar: async (page, medir) => {
      await page.keyboard.press('s');
      await vis(page, MODAL).first().waitFor();
      await quieto(page, 900);
      const pestanas = vis(page, '[data-pace-stats-tab]');
      const n = await pestanas.count();
      for (let i = 0; i < n; i++) {
        await pestanas.nth(i).click();
        await quieto(page, 500);
        await medir('pestaña ' + (await pestanas.nth(i).getAttribute('data-pace-stats-tab')), MODAL, null);
      }
    } },
  { id: 'compra', nombre: 'La hoja de compra', semilla: {}, hora: '10:00',
    llegar: async (page, medir) => {
      await page.evaluate(() => {
        window.PREMIUM_ABIERTO_HASTA_V1 = false;
        Object.assign(window.PACE_TIENDA_WEB, { enlaces: { vida: '/index.html#tienda-vida', mes: '/index.html#tienda-mes' }, gestionar: 'https://billing.stripe.com/p/login/prueba' });
        /* Con el nombre que le pasa la app, que viene de i18n (CustomRoutines.jsx). */
        const l = document.documentElement.lang === 'es' ? 'es' : 'en';
        window.paceAbrirPremium({ nombre: window.PACE_STRINGS[l]['custom.section.title'] });
      });
      await page.locator('[data-pace-premium-hoja]').waitFor();
      await quieto(page, 900);
      await medir('la invitación con la tienda', MODAL, null);
    } },
  { id: 'bienvenida', nombre: 'La bienvenida', semilla: { firstSeen: null }, hora: '10:00', sinHome: true,
    llegar: async (page, medir) => {
      await page.locator(BIENVENIDA).waitFor();
      await quieto(page, 1200);
      await medir('hola', BIENVENIDA, null);
      await vis(page, BIENVENIDA + ' [data-pace-cta]').first().click();
      await page.locator('[data-pace-semana-editor]').waitFor();
      await quieto(page, 1200);
      await medir('tu semana', BIENVENIDA, null);
    } },
];

module.exports = { ESCENAS, hora, FECHA };
