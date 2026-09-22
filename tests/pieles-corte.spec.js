/* PACE · E2E · EL CORTE ENTRE LAS DOS PIELES (s197 · v0.130.0)
 * =============================================================
 * Decisión del usuario viendo cinco pantallas verticales reales con la piel de móvil
 * forzada en la foto (s196): «820×1100 escritorio queda raro el aro del pomodoro tan
 * pequeño / 768×1100 piel de móvil, una columna, barra abajo: así se ve perfecto», y
 * el ancho, «vertical hasta 1024».
 *
 * QUE DEFIENDE:
 *  · el corte POR LOS CUATRO LADOS (768/769 de ancho · 1024/1025 en vertical ·
 *    vertical/apaisado), no por uno solo: un umbral se mide por los dos lados (s179);
 *  · que las dos condiciones sean COMPLEMENTARIAS Y EXHAUSTIVAS —ni las dos pieles a la
 *    vez ni ninguna— en una rejilla de tamaños, que es lo que hace segura la lista con
 *    coma en vez de un `not` de nivel 4;
 *  · que el JS (`paceEsMovil`, la barra lateral, la detección de entorno) diga SIEMPRE
 *    lo mismo que el CSS: el corte tiene un solo origen (`_responsive.corte.js`);
 *  · que en tableta vertical la home sea la de móvil DE VERDAD (sin barra lateral, sin
 *    scroll) y que la pill de modos siga estando, en su fila, sin pisar los iconos —el
 *    defecto que estrenó este corte: entre 820 y 1024 no había pill ni fila de teléfono;
 *  · que el TELÉFONO no cambie: su pill sigue en la fila propia de 102 px.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const MOVIL = '(max-width: 768px), (orientation: portrait) and (max-width: 1024px)';
const ESC = '(min-width: 1025px), (min-width: 769px) and (orientation: landscape)';

async function abrir(page, context) {
  await sembrar(context, { ritmo: { libre: true } });
  await irAlArtefacto(page);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

test('el corte, por los cuatro lados y sin huecos ni solapes', async ({ page, context }) => {
  await abrir(page, context);
  const CASOS = [
    ['teléfono', 390, 844, true],
    /* un teléfono APAISADO mide 844 de ancho: piel de escritorio, y ya lo era antes de
       v0.130.0 (el corte de siempre era `max-width: 768px`). Este corte solo AÑADE las
       verticales de hasta 1024; no toca lo apaisado. Se deja medido para que se vea. */
    ['teléfono apaisado', 844, 390, false],
    ['iPad vertical', 768, 1024, true], ['iPad Air', 820, 1180, true], ['iPad Pro 11', 834, 1194, true],
    ['iPad Pro 12,9', 1024, 1366, true], ['ventana estrecha y alta', 900, 1200, true],
    ['justo en el borde de ancho', 1024, 1025, true], ['un píxel más ancha', 1025, 1366, false],
    /* CUADRADA = vertical: `orientation: portrait` casa cuando el alto es MAYOR O IGUAL
       que el ancho (así lo define el estándar), y 1000 ≤ 1024. Se deja medido porque no
       se ve leyendo la regla. */
    ['cuadrada', 1000, 1000, true],
    ['tableta apaisada', 1180, 820, false],
    ['portátil', 1366, 768, false], ['monitor', 1920, 1080, false], ['769 apaisado', 769, 700, false],
  ];
  const r = [];
  for (const [nombre, w, h, esMovil] of CASOS) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(120);
    r.push([nombre, esMovil, await page.evaluate(([mq, esc]) => ({
      css: window.matchMedia(mq).matches, cssEsc: window.matchMedia(esc).matches,
      js: paceEsMovil(), origen: PACE_CORTE_MOVIL === mq && PACE_CORTE_ESC === esc,
    }), [MOVIL, ESC])]);
  }
  for (const [nombre, esperado, m] of r) {
    expect(m.origen, nombre + ': el corte que mide el test es el que declara la app').toBe(true);
    expect(m.css, nombre + ' (' + (esperado ? 'móvil' : 'escritorio') + ')').toBe(esperado);
    expect(m.cssEsc, nombre + ': las dos condiciones son complementarias').toBe(!esperado);
    expect(m.js, nombre + ': el JS dice lo mismo que el CSS').toBe(esperado);
  }
  /* GUARD: la rejilla tiene casos de los dos lados, o esto no mediría un corte */
  expect(r.filter((x) => x[1]).length).toBeGreaterThan(3);
  expect(r.filter((x) => !x[1]).length).toBeGreaterThan(3);
});

test.describe('en tableta vertical, la home es la de móvil', () => {
  test.use({ viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true });

  test('sin barra lateral, sin scroll, y con la pill de modos en su sitio', async ({ page, context }) => {
    await abrir(page, context);
    /* la barra lateral se desacopla: en la piel de móvil es un cajón, no una columna */
    const m = await page.evaluate(() => {
      const visible = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none';
      const q = (s) => Array.from(document.querySelectorAll(s)).find(visible);
      const acc = q('[data-pace-sidebar-accion]');
      const body = q('[data-pace-home-body]');
      const pill = document.querySelector('[data-pace-tabs]');
      const icono = q('[data-pace-topbar-icon]');
      const p = visible(pill) ? pill.getBoundingClientRect() : null;
      const i = icono ? icono.getBoundingClientRect() : null;
      return {
        columna: !!(acc && acc.getBoundingClientRect().left < 300),
        scroll: body ? body.scrollHeight - body.clientHeight : null,
        pillVisible: !!p, aire: p && i ? Math.round(i.left - p.right) : null,
        topbar: Math.round(document.querySelector('[data-pace-topbar]').getBoundingClientRect().height),
        skin: getComputedStyle(document.documentElement).getPropertyValue('--pace-skin').trim(),
      };
    });
    expect(m.skin, 'la piel que declara la hoja').toBe('movil');
    expect(m.columna, 'la barra lateral no ocupa una columna: es cajón').toBe(false);
    expect(m.scroll, 'y la home cabe').toBe(0);
    expect(m.pillVisible, 'los tres modos siguen estando (el defecto que estrenó este corte)').toBe(true);
    expect(m.aire, 'la pill no pisa los iconos: a este ancho cabe en la misma fila').toBeGreaterThan(40);
    expect(m.topbar, 'y sin la fila extra de 42 px que necesita el teléfono').toBeLessThan(80);
  });

  /* No basta con que la barra lateral «no sea columna»: el JS tiene que saberlo también
     (`esCajon()`), y eso solo se ve en el COMPORTAMIENTO del cajón. De las tres cosas que
     decide —colapsar al pulsar una acción, poner la acción primero, y medir el alto
     disponible como bloque y no como hijo flexible (`Sidebar.escala.jsx` avisa de que
     preguntarle al otro sale «verde, silencioso y falso»)— la primera es la que se puede
     asertar sin ambigüedad. Sin ella, el mutante que devuelve el corte viejo a `esCajon`
     sobrevivía al resto del archivo (banco s197). */
  test('el cajón se abre, trae la acción y se cierra al pulsarla', async ({ page, context }) => {
    await sembrar(context, { ritmo: { dia: { fecha: new Date().toISOString().slice(0, 10), opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
    await irAlArtefacto(page);
    await vis(page, '[data-pace-sidebar-toggle], [aria-label="Abrir panel"]').first().click();
    await page.waitForTimeout(500);
    await expect(vis(page, '[data-pace-sidebar-accion]')).toHaveCount(1);
    expect(await page.evaluate(() => getState().sidebarCollapsed), 'GUARD: el cajón está abierto antes de pulsar').toBeFalsy();
    await page.locator('[data-pace-sidebar-accion] button').first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => getState().sidebarCollapsed), 'pulsar una acción cierra el cajón: el JS sabe que es cajón').toBe(true);
  });
});

/* Este bloque PASA TAMBIÉN CONTRA HEAD, y es a propósito: defiende que el corte nuevo
   NO tocó el teléfono. Documenta, no protege el cambio (s189); los otros tres tests de
   este archivo son los que caen con el código anterior. */
test.describe('el teléfono no cambia', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('la pill sigue en su propia fila de 102 px', async ({ page, context }) => {
    await abrir(page, context);
    const m = await page.evaluate(() => {
      const pill = document.querySelector('[data-pace-tabs]');
      const tb = document.querySelector('[data-pace-topbar]');
      return { visible: getComputedStyle(pill).display !== 'none', topbar: Math.round(tb.getBoundingClientRect().height),
               pillTop: Math.round(pill.getBoundingClientRect().top), iconoTop: Math.round(document.querySelector('[data-pace-topbar-icon]').getBoundingClientRect().top) };
    });
    expect(m.visible).toBe(true);
    expect(m.topbar, 'la fila propia de s169').toBeGreaterThan(90);
    expect(m.iconoTop - m.pillTop, 'la pill ARRIBA y los iconos debajo, no en la misma línea').toBeGreaterThan(20);
  });
});
