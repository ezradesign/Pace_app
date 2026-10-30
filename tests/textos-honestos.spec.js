/* PACE · E2E · LOS TEXTOS QUE NO INVENTAN (Ez, 30 oct. 2026)
 * ==========================================================
 * Tres revisiones de ChatGPT del 28 oct. (docs/audits/chatgpt-28oct/, P1-P3, Q1, Q3, Q6, Q7, CAL-2,
 * CAL-4 y CAL-6) encontraron frases que dicen más de lo que PACE sabe: que llevas 45 minutos
 * sentado, que no has bebido, cómo te sientes al terminar, que el calendario se cuida solo. Ez eligió
 * en docs/proposals/textos-honestos-30oct.html: 1A 2A 3B 4A, 5A con «Has terminado un Foco de
 * 45 minutos», 6 como estaba, 7A 8A 9A 10A 11A 12A, 13A «por el momento» y 14A.
 *
 * Aquí va un caso por texto que no tenía ya su prueba; los que sí la tenían (la pausa, el cierre,
 * Estadísticas, Ajustes y el calendario que se mantiene solo) cambian en su archivo. Contra
 * v0.187.0 caen todos.
 *
 * NO CUBRE: que quepan a mano a 360 y a 1280 px; eso lo miran las fotos para Ez.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, abrirTusDatos, RUTA_ARTEFACTO } = require('./helpers');

const BIENVENIDA = '[data-pace-scene-card][role="dialog"]';
const HOY = '2026-10-14';
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const PERFIL = { profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } };
const NUEVE = new Date(HOY + 'T09:00:00+02:00');
const ms = (hhmm) => Date.parse(HOY + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const cadenas = (page, lang, claves) => page.evaluate(([l, c]) => c.map((k) => window.PACE_STRINGS[l][k]), [lang, claves]);

/* ------------------------------------------------------------------ 1 · la bienvenida */
test('1 · la bienvenida deja probar primero; en Ajustes el botón sigue diciendo «Cada semana es distinta»', async ({ page }) => {
  await page.goto(RUTA_ARTEFACTO);
  await page.locator(BIENVENIDA).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await page.locator('[data-pace-semana-editor]').waitFor({ state: 'visible' });
  await expect(page.locator(BIENVENIDA + ' [data-pace-semana-saltar]')).toHaveText('Ahora no, quiero probar primero');
  await expect(page.locator(BIENVENIDA + ' [data-pace-semana-nota]')).toHaveText('Puedes prepararla después en Ajustes.');
  expect(await cadenas(page, 'en', ['ritmo.st.ahoraNo', 'ritmo.st.ahoraNo.nota']))
    .toEqual(['Not now, I want to try it first', 'You can set it up later in Settings.']);

  /* En Ajustes el mismo botón quita la semana guardada: ahí «Ahora no» diría otra cosa. */
  await page.locator('[data-pace-semana-saltar]').click();
  await page.locator('[data-pace-onb-comenzar]').click();
  await page.locator('[data-pace-visita-saltar]').click();
  await page.evaluate(() => ritmoSemanaAbrir());
  await expect(vis(page, '[data-pace-semana-saltar]')).toHaveText('Cada semana es distinta');
  await expect(page.locator('[data-pace-semana-nota]')).toHaveCount(0);
});

/* ------------------------------------------------------------------ 2 · «¿Cuánto trabajas hoy?» */
test('2 · bajo «¿Cuánto trabajas hoy?» dice que el tiempo incluye las pausas', async ({ page, context }) => {
  await sembrar(context, { ritmo: {} });
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
  await expect(vis(page, '[data-pace-ritmo-tarjeta] .pace-rt-tarjeta-s')).toHaveText('El tiempo incluye las pausas. Te digo cuándo parar y qué hacer.');
  expect(await cadenas(page, 'en', ['ritmo.sub'])).toEqual(["Breaks are part of the time. I'll tell you when to pause and what to do."]);
});

/* ------------------------------------------------------------------ 3 · el día servido */
test('3 · la etiqueta del material avisa de que a veces hace falta pared o mesa, y cabe a 360 px', async ({ page, context }) => {
  await sembrar(context, Object.assign({ ritmo: { dia: JORNADA } }, PERFIL));
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
  await expect(vis(page, '.pace-rt-ctx span').nth(1)).toHaveText('Sin material, a veces pared o mesa');
  expect(await cadenas(page, 'en', ['ritmo.ctx.material'])).toEqual(['No equipment, sometimes a wall or desk']);

  await page.setViewportSize({ width: 360, height: 730 });
  await vis(page, '[data-pace-ritmo-ver]').click();
  await vis(page, '[data-pace-ritmo-lista]').waitFor();
  const chip = vis(page, '.pace-rt-ctx span').nth(1);
  await expect(chip).toHaveText('Sin material, a veces pared o mesa');
  const caja = await chip.boundingBox();
  expect(caja.x + caja.width, 'la etiqueta se sale de la pantalla').toBeLessThanOrEqual(360 - 16);
});

/* ------------------------------------------------------------------ 5 · los motivos de la pausa por libre */
test('5 · los motivos de la pausa por libre dicen lo que PACE sabe', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const claves = ['break.prop.sitting', 'break.prop.water', 'break.prop.pending.extra', 'break.prop.pending.move', 'break.prop.pending.breathe'];
  expect(await cadenas(page, 'es', claves)).toEqual([
    'Has terminado un Foco de {n} minutos', 'Hoy no has apuntado ningún vaso',
    'Hoy aún no hay sesión de Estira', 'Hoy aún no hay sesión de Mueve', 'Hoy aún no hay sesión de Respira',
  ]);
  expect(await cadenas(page, 'en', claves)).toEqual([
    'You finished a {n}-minute Focus', 'No glasses logged today',
    'No Stretch session yet today', 'No Move session yet today', 'No Breathe session yet today',
  ]);
});

/* ------------------------------------------------------------------ 9 · importar una copia */
test('9 · al importar una copia dice que se sustituye sin juntarse', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  await expect(page.locator('.pace-aj-pie')).toContainText('Todo vive en este navegador y no se sincroniza con otros.');
  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: 'pace-backup.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'PACE', version: 'v0.187.0', state: { firstSeen: 1, lang: 'es', totalFocusMin: 340 } })),
  });
  await expect(page.getByText('Lo que hay ahora en PACE se sustituye por la copia, sin juntarse, y no se puede deshacer.')).toBeVisible();
  expect((await cadenas(page, 'en', ['settings.import.cuerpo']))[0]).toContain('replaced by the copy, not merged');
});

/* ------------------------------------------------------------------ 10, 11 y 12 · el calendario */
/* Un calendario del móvil espía (como en ritmo-calendario-solo.spec.js), con una lectura que puede fallar. */
async function comoAndroid(context, eventos) {
  await context.addInitScript((iniciales) => {
    const nativo = window.__nativo = { eventos: iniciales.slice(), siguiente: 100, falla: false };
    const ok = (f) => function (op) { return Promise.resolve(f(op)); };
    window.Capacitor = {
      getPlatform: () => 'android', isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
        LocalNotifications: { checkPermissions: () => Promise.resolve({ display: 'granted' }) },
        CapacitorCalendar: {
          requestFullCalendarAccess: ok(() => ({ result: 'granted' })),
          checkAllPermissions: ok(() => ({ result: { readCalendar: 'granted', writeCalendar: 'granted' } })),
          listCalendars: ok(() => ({ result: [{ id: '1', title: 'Personal', accountName: 'e@gmail.com', allowsContentModifications: true, visible: true }] })),
          getDefaultCalendar: ok(() => ({ result: { id: '1' } })),
          listEventsInRange: (op) => (nativo.falla ? Promise.reject(new Error('red'))
            : Promise.resolve({ result: nativo.eventos.filter((e) => e.startDate < op.to && e.endDate > op.from) })),
          createEvent: ok((op) => { const id = String(nativo.siguiente++); nativo.eventos.push(Object.assign({ id, isAllDay: false, status: 'confirmed' }, op)); return { id }; }),
          modifyEvent: ok((op) => { const e = nativo.eventos.find((x) => x.id === op.id); if (e) Object.assign(e, op); }),
          deleteEvent: ok((op) => { nativo.eventos = nativo.eventos.filter((e) => e.id !== op.id); }),
        },
      },
    };
  }, eventos || []);
}
const REUNION = { id: 'r1', title: 'Equipo', startDate: ms('12:00'), endDate: ms('12:30'), isAllDay: false, availability: 0, status: 'confirmed', description: '' };

test.describe('el calendario, en Android', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  async function abrir(page, context) {
    await comoAndroid(context, [REUNION]);
    await sembrar(context, Object.assign({ sidebarCollapsed: true, ritmo: { dia: JORNADA } }, PERFIL));
    await page.clock.install({ time: NUEVE });
    await irAlArtefacto(page);
  }
  async function hoja(page) {
    await vis(page, '[data-pace-ritmo-ver]').click();
    await vis(page, '[data-pace-ritmo-lista]').waitFor();
    await vis(page, '[data-pace-ritmo-calendario]').click();
    return page.locator('[data-pace-cal]');
  }
  const subReuniones = (h) => h.locator('label:has([data-pace-cal-reuniones]) small');

  test('10 y 12 · se pone al día mientras PACE está abierto, y las pausas se cambian desde PACE', async ({ page, context }) => {
    await abrir(page, context);
    const h = await hoja(page);
    await expect(h.locator('label:has([data-pace-cal-mantener]) small'))
      .toHaveText('Mientras PACE está abierto, si el día cambia, cambia también allí. Cada pausa te avisa.');
    await expect(h.locator('[data-pace-cal-cambiar]')).toHaveCount(0);
    await h.locator('[data-pace-cal-destino="android"] button').click();
    await expect(h.locator('[data-pace-cal-aviso="ok"]')).toContainText('Hecho: mientras PACE esté abierto, tu calendario se pone al día solo.');
    await expect(h.locator('[data-pace-cal-resumen]'))
      .toHaveText('Lo que queda de hoy, de 9:00 a 17:00, con aviso en cada pausa. Se pone al día mientras PACE está abierto.');
    await expect(h.locator('[data-pace-cal-cambiar]'))
      .toHaveText('Cambia tus pausas desde PACE: si mueves una en el calendario, PACE la devuelve a su sitio.');

    /* En el calendario, cada pausa lo dice; un bloque de foco suelto no es una pausa. */
    const evs = await page.evaluate(() => window.__nativo.eventos.filter((e) => (e.description || '').includes('pacegrass.app')));
    const pausas = evs.filter((e) => !/^Foco \d+ de \d+$/.test(e.title));
    const focos = evs.filter((e) => /^Foco \d+ de \d+$/.test(e.title));
    expect(pausas.length, 'GUARD: no se escribieron pausas').toBeGreaterThan(5);
    expect(focos.length, 'GUARD: no hay bloques de foco sueltos').toBeGreaterThan(0);
    pausas.forEach((e) => expect(e.description, e.title).toContain('Cambia esta pausa desde PACE.'));
    focos.forEach((e) => expect(e.description, e.title).not.toContain('Cambia esta pausa'));
    expect(await cadenas(page, 'en', ['cal.solo.cambiar', 'cal.p.texto.cambiar']))
      .toEqual(['Change your breaks in PACE: if you move one in your calendar, PACE puts it back.', 'Change this break in PACE.']);
  });

  test('11 · dice cuándo comprobó las reuniones, aparte de cuándo envió el plan, y cuándo no pudo leerlas', async ({ page, context }) => {
    await abrir(page, context);
    let h = await hoja(page);
    await h.locator('[data-pace-cal-destino="android"] button').click();
    await expect(h.locator('[data-pace-cal-aviso="ok"]')).toContainText('Hoy tienes 1 reunión');
    await expect(subReuniones(h)).toHaveText('Comprobadas a las 9:00. PACE solo guarda a qué horas estás ocupado.');
    await expect(h.locator('[data-pace-cal-solo="si"] .pace-rt-cal-s')).toHaveText('Plan enviado a las 9:00');

    /* A las 9:20 la lectura falla: lo dice, y sigue con la de las 9:00. */
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    await page.evaluate(() => { window.__nativo.falla = true; });
    await page.clock.fastForward(20 * 60 * 1000);
    await page.evaluate(() => calendarioRefrescarReuniones(true));
    h = await hoja(page);
    await expect(subReuniones(h)).toHaveText('No se pudieron leer a las 9:20. PACE sigue con las de las 9:00.');

    /* Y vuelve en cuanto se leen bien. */
    await page.evaluate(() => { window.__nativo.falla = false; return calendarioRefrescarReuniones(true); });
    await expect(subReuniones(h)).toHaveText('Comprobadas a las 9:20. PACE solo guarda a qué horas estás ocupado.');
  });

  test('11 · si hoy no se han podido leer nunca, dice que el día no las tiene en cuenta', async ({ page, context }) => {
    await abrir(page, context);
    await page.evaluate(() => { window.__nativo.falla = true; });
    const h = await hoja(page);
    await h.locator('[data-pace-cal-destino="android"] button').click();
    await expect(h.locator('[data-pace-cal-aviso="error"]')).toBeVisible();
    await expect(subReuniones(h)).toHaveText('No se pudieron leer. El día de hoy no las tiene en cuenta.');
    expect(await cadenas(page, 'en', ['cal.reuniones.leidas', 'cal.reuniones.fallo', 'cal.reuniones.fallo.nunca'])).toEqual([
      'Checked at {h}. PACE only keeps the times you are busy.',
      'Could not read them at {h}. PACE is using the ones from {antes}.',
      "Could not read them. Today's plan doesn't include them.",
    ]);
  });
});

/* ------------------------------------------------------------------ 13 · /premium */
test('13 · /premium cuenta la variedad y, en una pregunta, el calendario con sus límites', async ({ page }) => {
  await page.goto('/premium/');
  const completo = page.locator('section.dos').first().locator('div').nth(1);
  const variedad = completo.locator('li', { hasText: 'Pausas que cambian de un día a otro' });
  await expect(variedad).toHaveCount(1);
  await expect(variedad.locator('.serif')).toHaveAttribute('data-en', 'Breaks that change from day to day');
  await expect(variedad.locator('.d')).toHaveText('sin tener que elegirlas');
  /* El calendario no va en la lista: /premium vende la compra de la web, donde está en pruebas. */
  await expect(completo.locator('li', { hasText: /calendario/i })).toHaveCount(0);

  const pregunta = page.locator('details', { has: page.locator('summary', { hasText: '¿Y el calendario?' }) });
  await expect(pregunta).toHaveCount(1);
  await expect(pregunta.locator('summary')).toHaveAttribute('data-en', 'And the calendar?');
  await pregunta.locator('summary').click();
  await expect(pregunta.locator('p')).toHaveText('En Android, PACE completo mantiene tu día al día en el calendario del móvil mientras PACE está abierto; llevar el día y esquivar tus reuniones es gratis. En la web, el calendario está en pruebas y no entra en lo que compras.');
  await expect(pregunta.locator('p')).toHaveAttribute('data-en', /On the web, the calendar is in testing and is not part of what you buy\.$/);
});

/* ------------------------------------------------------------------ 14 · la ficha de Google Play */
test('14 · la ficha de Play dice de dónde lee las reuniones y lo que añade PACE completo', async () => {
  const ficha = fs.readFileSync(path.join(__dirname, '..', 'docs', 'launch', 'google-play', 'ficha.md'), 'utf8');
  for (const frase of [
    'Si tienes reuniones, PACE las lee del calendario del móvil y las esquiva',
    'If you have meetings, PACE reads them from your phone calendar and works around them',
    'PACE completo añade pausas que cambian de un día a otro, las rutinas más profundas, tus propias rutinas, una semana a tu medida con la carta del lunes, tu mes y tu año, y tu calendario al día mientras PACE está abierto.',
    'PACE Complete adds breaks that change from day to day, the deeper routines, your own routines, a week shaped to you with the Monday letter, your month and year, and your calendar kept up to date while PACE is open.',
  ]) expect(ficha, frase).toContain(frase);
  expect(ficha).not.toContain('PACE las lee de tu calendario');
  /* Las dos descripciones largas siguen por debajo de los 4000 caracteres que pide Play. */
  const largas = ficha.split(/#+ Descripción completa \(máx\. 4000\)/).slice(1).map((t) => (t.match(/```\n([\s\S]*?)```/) || [])[1] || '');
  expect(largas, 'GUARD: no se encuentran las dos descripciones largas').toHaveLength(2);
  largas.forEach((t) => expect(t.length).toBeLessThanOrEqual(4000));
});
