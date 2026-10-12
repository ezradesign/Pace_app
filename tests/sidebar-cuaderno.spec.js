/* PACE · tests/sidebar-cuaderno.spec.js (9 oct. 2026)
   ==================================================
   LO QUE DICE LA BARRA LATERAL, tal y como lo eligió Ez mirando las fotos de
   `docs/traspaso/archivos/sidebar-8oct/`:

   · Hoy con palabras: «Dos horas y media de foco», «Cinco minutos respirando»; lo
     que vale cero no se escribe, y un día sin nada lo dice con una frase.
   · El agua frente a la meta de Ajustes: «Cuatro vasos de ocho», «Los seis vasos
     del día», «Once vasos de diez». La línea entera suma un vaso.
   · La semana en cápsulas: cada día lleno con sus minutos, contra el mejor día.
   · La racha con palabras, y «mejor» solo si lo hay.
   · La siguiente pausa con su rótulo: «Siguiente pausa» · «A las 12:25, …».
   · Las tres puertas, también la de Estira, que no tenía ninguna.
   · La home dice los vasos del plan frente a la meta, «6 de 8 vasos», sin partir
     el título del día (con «6 de tus 8» se partía: medido en nueve pantallas).

   NO CUBRE: cómo se ve. Eso lo decidió Ez en las fotos; aquí, lo que dice.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const ABIERTA = {
  sidebarCollapsed: false,
  lastActiveDay: new Date().toDateString(),
  _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true,
  _historyRecalculated_v0_28_8: true,
};

/* El jueves 8 de octubre de 2026 a las 12:20, con el día de «A tu ritmo» empezado a
   las 9:00, tres bloques y dos pausas hechas: la siembra de las fotos que vio Ez. */
const DIA = '2026-10-08';
const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
function diaServido(extra) {
  return Object.assign({}, ABIERTA, {
    lastActiveDay: 'Thu Oct 08 2026', cycle: 3,
    ritmo: { semanaTipo: LV, dia: { fecha: DIA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: null,
                                    estados: { 1: 'hecha', 2: 'hecha' } } },
    weeklyStats: {
      focusMinutes:  [150, 100, 200, 150, 0, 0, 0],
      breathMinutes: [6, 0, 10, 5, 0, 0, 0],
      moveMinutes:   [8, 12, 0, 7, 0, 0, 0],
      waterGlasses:  [6, 5, 7, 4, 0, 0, 0],
    },
    water: { goal: 8, today: 4, lastReset: null },
    streak: { current: 4, longest: 9, lastDay: 'Thu Oct 08 2026' },
  }, extra || {});
}
async function abrirDiaServido(page, context, extra) {
  await sembrar(context, diaServido(extra));
  await page.clock.install({ time: new Date(DIA + 'T12:20:00+02:00') });
  await irAlArtefacto(page);
  await page.locator('[data-pace-sidebar-accion]').waitFor({ state: 'visible' });
}

const sb = (page) => page.locator('[data-pace-sidebar]');
const linea = (page, modulo) => sb(page).locator('[data-pace-hoy-celda][data-modulo="' + modulo + '"]');

/* ==========================================================================
   LAS PALABRAS
   ========================================================================== */

test('los minutos y los vasos con palabras, en castellano y en inglés', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const m = (n, l) => window.sidebarMinutosEnPalabras(n, l);
    const a = (n, meta, l) => window.sidebarAguaEnPalabras(n, meta, l);
    return {
      es: [m(1, 'es'), m(7, 'es'), m(13, 'es'), m(60, 'es'), m(75, 'es'), m(90, 'es'), m(100, 'es'), m(125, 'es'), m(150, 'es'), m(407, 'es')],
      en: [m(1, 'en'), m(7, 'en'), m(60, 'en'), m(90, 'en'), m(100, 'en'), m(150, 'en')],
      agua: [a(0, 8, 'es'), a(1, 8, 'es'), a(4, 8, 'es'), a(8, 8, 'es'), a(11, 10, 'es'), a(4, 8, 'en')],
    };
  });
  expect(r.es).toEqual(['un minuto', 'siete minutos', '13 minutos', 'una hora', 'una hora y cuarto', 'una hora y media',
    'una hora y 40 minutos', 'dos horas y cinco minutos', 'dos horas y media', 'seis horas y 47 minutos']);
  expect(r.en).toEqual(['one minute', 'seven minutes', 'one hour', 'an hour and a half', 'one hour and 40 minutes', 'two and a half hours']);
  expect(r.agua).toEqual([
    { clave: 'sidebar.agua.ninguno', x: '', m: 'ocho' },
    { clave: 'sidebar.agua.de', x: 'Un vaso', m: 'ocho' },
    { clave: 'sidebar.agua.de', x: 'Cuatro vasos', m: 'ocho' },
    { clave: 'sidebar.agua.meta', xClave: 'sidebar.agua.meta.x', x: '', m: 'ocho' },
    { clave: 'sidebar.agua.de', x: 'Once vasos', m: 'diez' },
    { clave: 'sidebar.agua.de', x: 'Four glasses', m: 'eight' },
  ]);
});

test('Hoy se escribe con palabras y lo que vale cero no se escribe', async ({ page, context }) => {
  await sembrar(context, Object.assign({}, ABIERTA, {
    weeklyStats: {
      focusMinutes:  [150, 150, 150, 150, 150, 150, 150],
      breathMinutes: [0, 0, 0, 0, 0, 0, 0],
      moveMinutes:   [7, 7, 7, 7, 7, 7, 7],
      waterGlasses:  [0, 0, 0, 0, 0, 0, 0],
    },
    water: { goal: 8, today: 0, lastReset: null },
  }));
  await irAlArtefacto(page);
  await expect(linea(page, 'focus')).toHaveText('Dos horas y media de foco');
  await expect(linea(page, 'breathe'), 'cero minutos de Respira no se escriben').toHaveCount(0);
  await expect(linea(page, 'body')).toHaveText('Siete minutos moviéndote');
  await expect(linea(page, 'water')).toContainText('Ningún vaso de ocho');
  await expect(linea(page, 'water')).toHaveAttribute('data-cero', '1');
  await expect(sb(page).locator('[data-pace-hoy-vacio]')).toHaveCount(0);
  /* La cantidad va en tinta: es lo que se lee de un vistazo. */
  await expect(linea(page, 'focus').locator('b')).toHaveText('Dos horas y media');
});

test('un día sin nada hecho lo dice con una frase', async ({ page, context }) => {
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  await expect(sb(page).locator('[data-pace-hoy-vacio]')).toHaveText('Tu día empieza en blanco. Lo que hagas se queda aquí.');
  await expect(sb(page).locator('[data-pace-hoy-celda]')).toHaveCount(1);   // solo el agua
});

/* ==========================================================================
   EL AGUA
   ========================================================================== */

test('la línea del agua suma un vaso y habla con la meta de Ajustes', async ({ page, context }) => {
  await sembrar(context, Object.assign({}, ABIERTA, { water: { goal: 8, today: 3, lastReset: null } }));
  await irAlArtefacto(page);
  const agua = linea(page, 'water');
  await expect(agua).toContainText('Tres vasos de ocho');
  await expect(agua).toContainText('+ vaso');
  /* La fila entera es el botón, y su nombre dice lo que hace. */
  await expect(sb(page).getByRole('button', { name: /Añadir un vaso/ })).toHaveCount(1);
  await agua.click();
  await expect.poll(() => page.evaluate(() => getState().water.today)).toBe(4);
  await expect(agua).toContainText('Cuatro vasos de ocho');
  await expect(page.locator('[data-pace-modal-backdrop]'), 'sumar no es navegar').toHaveCount(0);

  for (const [goal, today, frase] of [[10, 11, 'Once vasos de diez'], [6, 6, 'Los seis vasos del día'], [12, 1, 'Un vaso de doce']]) {
    await page.evaluate(([g, t]) => setState({ water: Object.assign({}, getState().water, { goal: g, today: t }) }), [goal, today]);
    await expect(agua, 'meta ' + goal + ', ' + today + ' vasos').toContainText(frase);
  }
});

/* ==========================================================================
   LA SEMANA
   ========================================================================== */

test('cada cápsula se llena con los minutos de su día, contra el mejor de la semana', async ({ page, context }) => {
  await abrirDiaServido(page, context);
  const r = await page.evaluate(() => {
    const s = window.selectSidebarWeek(getState());
    const dias = [...document.querySelectorAll('[data-pace-semana-dia]')].map((d) => {
      const relleno = d.querySelector('[data-pace-capsula-relleno]');
      return { alto: relleno ? relleno.offsetHeight : 0, hoy: d.getAttribute('data-hoy'), futuro: d.getAttribute('data-futuro') };
    });
    return { escala: s.escala, minutos: s.days.map((d) => d.minutes), dias };
  });
  /* El miércoles (210 min) es el mejor: su cápsula va llena (40 de 40). */
  expect(r.escala).toBe(210);
  expect(r.minutos).toEqual([164, 112, 210, 162, 0, 0, 0]);
  expect(r.dias.map((d) => d.alto)).toEqual([31, 21, 40, 31, 0, 0, 0]);
  expect(r.dias.map((d) => d.hoy)).toEqual(['0', '0', '0', '1', '0', '0', '0']);
  expect(r.dias.map((d) => d.futuro)).toEqual(['0', '0', '0', '0', '1', '1', '1']);
});

test('la racha con palabras, y «mejor» solo si hay un mejor', async ({ page, context }) => {
  await abrirDiaServido(page, context);
  const semana = sb(page).locator('[data-pace-semana]');
  await expect(semana).toContainText('4 días en ritmo · mejor 9');
  await page.evaluate(() => setState({ streak: Object.assign({}, getState().streak, { current: 3, longest: 3 }) }));
  await expect(semana).toContainText('3 días en ritmo');
  await expect(semana).not.toContainText('mejor');
  await page.evaluate(() => setState({ streak: Object.assign({}, getState().streak, { current: 1, longest: 5 }) }));
  await expect(semana).toContainText('1 día en ritmo · mejor 5');
});

/* ==========================================================================
   LA SIGUIENTE PAUSA, CON SU RÓTULO
   ========================================================================== */

test('la siguiente pausa lleva su rótulo, la hora, la rutina y cuánto dura', async ({ page, context }) => {
  await abrirDiaServido(page, context);
  const esperado = await page.evaluate(() => {
    const s = ritmoSiguiente(getState());
    const t = (k) => window.PACE_STRINGS.es[k];
    return { antes: 'A las ' + ritmoHora(s.hora) + ', ', modulo: t({ estira: 'activity.stretch.label', mueve: 'activity.move.label' }[s.modulo] || 'activity.breathe.label'), larga: s.larga };
  });
  const accion = sb(page).locator('[data-pace-sidebar-accion]');
  await expect(accion).toHaveAttribute('data-kind', 'suggest');
  await expect(accion).toContainText('Siguiente pausa');
  await expect(accion.locator('[data-pace-sidebar-accion-boton]')).toContainText(esperado.antes);
  if (!esperado.larga) await expect(accion).toContainText(' de ' + esperado.modulo);
  /* La línea «Llevas tres bloques y dos pausas» se fue con la tarjeta. */
  await expect(sb(page).locator('[data-pace-sidebar-llevas]')).toHaveCount(0);
});

test('la fila entera de la pausa es el botón, no solo su título', async ({ page, context }) => {
  await abrirDiaServido(page, context);
  const r = await page.evaluate(() => {
    const b = document.querySelector('[data-pace-sidebar-accion-boton]').getBoundingClientRect();
    return [[b.left + 4, b.top + 4], [b.right - 4, b.top + 4], [b.left + b.width / 2, b.top + b.height / 2],
            [b.left + 4, b.bottom - 3], [b.right - 4, b.bottom - 3]].map(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return !!(el && el.closest('[data-pace-sidebar-accion-boton]'));
    });
  });
  expect(r).toEqual([true, true, true, true, true]);
});

test('con «A tu ritmo» preguntando por el día, la barra no propone otra cosa', async ({ page, context }) => {
  /* A las 9:10 el día de la semana tipo ya está contestado y la home ofrece
     «Comienza»: un «Para ahora» al lado eran dos voces para la misma decisión. */
  await sembrar(context, Object.assign({}, ABIERTA, { lastActiveDay: 'Thu Oct 08 2026', ritmo: { semanaTipo: LV } }));
  await page.clock.install({ time: new Date(DIA + 'T09:10:00+02:00') });
  await irAlArtefacto(page);
  await expect(sb(page).locator('[data-pace-hoy]')).toBeVisible();
  await expect(sb(page).locator('[data-pace-sidebar-accion]')).toHaveCount(0);
});

/* ==========================================================================
   LAS PUERTAS
   ========================================================================== */

test('las tres puertas abren su biblioteca, también la de Estira', async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await sembrar(context, ABIERTA);
  await irAlArtefacto(page);
  for (const [destino, titulo, etiqueta] of [['breathe', 'Respiración', 'Abrir Respira'], ['stretch', 'Estira', 'Abrir Estira'], ['move', 'Mueve', 'Abrir Mueve']]) {
    const puerta = sb(page).getByRole('button', { name: etiqueta });
    await expect(puerta).toHaveAttribute('data-pace-biblioteca', destino);
    await puerta.click();
    /* Las bibliotecas son su propia pantalla (LibraryShell), no un modal con título. */
    await expect(page.locator('.pace-lib-hd h2').filter({ visible: true })).toHaveText(titulo);
    await page.keyboard.press('Escape');
    await expect(page.locator('.pace-lib').filter({ visible: true })).toHaveCount(0);
  }
  /* Y no se llaman igual que los chips de la home (s180: 15 tests en rojo). */
  await expect(page.getByRole('button', { name: /^Respira/ })).not.toHaveCount(2);
});

/* ==========================================================================
   LA HOME, CON LA META DE VASOS
   ========================================================================== */

test('la home dice los vasos del plan frente a la meta, sin partir el título del día', async ({ page, context }) => {
  await page.setViewportSize({ width: 1536, height: 864 });
  await abrirDiaServido(page, context, { water: { goal: 12, today: 4, lastReset: null } });
  const vis = (s) => page.locator(s).filter({ visible: true }).first();
  await expect(vis('[data-pace-ritmo-resumen] .pace-rt-meta')).toHaveText(/ · \d+ de 12 vasos$/);
  /* Con las fuentes ya puestas: con la de reserva, más ancha, el título se parte siempre. */
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const lineas = await vis('.pace-rt-esc .pace-rt-titulo').evaluate((e) =>
    Math.round(e.getBoundingClientRect().height / (parseFloat(getComputedStyle(e).lineHeight) || 30)));
  expect(lineas, 'el título del día cabe en una línea, como antes de nombrar la meta').toBe(1);
  await page.evaluate(() => setState({ water: Object.assign({}, getState().water, { goal: 6 }) }));
  await expect(vis('[data-pace-ritmo-resumen] .pace-rt-meta'), 'y cambia al cambiar la meta en Ajustes').toHaveText(/ de 6 vasos$/);
});
