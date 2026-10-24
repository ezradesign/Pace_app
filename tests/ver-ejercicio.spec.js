/* PACE · E2E · «VER EJERCICIO»: LA HOJA Y LA PANTALLA DE EJERCICIO (Ez, 22 oct. 2026: 5a A · 5b B)
 * ===========================================================================================
 * La invitación de los bloques cortos («Un momento para moverte») lleva «Ver ejercicio» (Ez:
 * «Hacerla» sonaba raro en el botón). Abre una hoja abajo, como «Tu pausa», con UN ejercicio de
 * los 31 de docs/proposals/hacerla-reparto.md: el dibujo de su módulo, su nombre y lo que dura.
 * La hoja no cuenta: «Empezar» lleva a la pantalla de ejercicio de siempre con ese ejercicio
 * solo («Paso 1 de 1»), y al acabar o al salir se vuelve al aro con el bloque siguiente.
 * Lo que Ez aprobó con las fotos: sin «¿Te ayudó esta pausa?» y solo suman los minutos, sin
 * logros ni contar como rutina hecha (si no, la pausa que viene cambia).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const visible = (page, sel) => page.locator(sel).filter({ visible: true });

/* Los 31, en el orden en que salen: uno de Mueve y dos de Estira, sin dos de la misma rutina
   seguidos. Cada uno es la primera serie de su rutina. */
const REPARTO = [
  'Elevación de talones', 'Barbilla atrás', 'Encogimiento de hombros',
  'Abrir y cerrar el puño', 'Palmas en la mesa', 'Círculos de brazos',
  'Apretar glúteos', 'Rodar hacia abajo', 'Sentadilla profunda',
  'Elevación de puntas', 'Isquio a una pierna', 'Rotación externa',
  'Juntar omóplatos', 'Inclinación de cuello', 'Círculos de muñeca',
  'Extensión torácica', 'Rezo invertido', 'Apertura de pecho',
  'Flexiones inclinadas', 'Rotación torácica de pie', 'Sentadilla lateral',
  'Extensión de dedos', 'Rotación lenta', 'Giro sentado',
  'Sentadilla de cuádriceps', 'Zancada profunda', 'Escalenos',
  'Apertura de pecho sentado', 'Círculos de tobillo', 'Pliegue adelante',
  'Estiramiento de muñeca',
];

async function abrir(page, context, extra) {
  await sembrar(context, Object.assign({ ritmo: { horario: HORARIO }, focusMinutes: 10 }, extra || {}));
  await page.clock.install({ time: new Date('2026-10-22T09:00:00+02:00') });
  await irAlArtefacto(page);
  await page.evaluate(() => ritmoElegir('jornada'));
  await page.evaluate(() => setState({ focusMinutes: 10 }));
}

/* Dos bloques de 10: al acabar el 2 (20 min seguidos) el aro invita. */
async function hastaLaInvitacion(page) {
  for (let i = 0; i < 2; i++) {
    await visible(page, '[data-pace-cta]').first().click();
    await page.clock.fastForward(10 * 60 * 1000 + 2000);
    await expect(visible(page, '[data-pace-cta]').first()).not.toHaveText('Pausar');
    await page.waitForTimeout(300);
  }
  await expect(visible(page, '[data-pace-invita]')).toHaveCount(1);
}

/* La pantalla de ejercicio va por segundos (cuerpo-tiempo-activo.spec.js): un salto grande no la mueve. */
async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); }
}

/* Lo que no tiene que cambiar al hacer el ejercicio, y los minutos de hoy. */
const HUELLA = () => {
  const s = getState();
  const p = ritmoPlan(s);
  const pausa = p.m.items.find((it, i) => it.tipo === 'pausa' && i > p.m.items.indexOf(p.m.focos[p.hechos - 1]));
  const snap = window.paceEventsSnapshot && window.paceEventsSnapshot();
  return {
    min: s.weeklyStats.moveMinutes[getDayIndexMondayFirst(new Date())],
    total: s.moveSessionsTotal || 0,
    logros: Object.keys(s.achievements || {}).sort().join(','),
    hechas: JSON.stringify((s.ritmo && s.ritmo.hechas) || null),
    plan: !!(s.plan && (s.plan.muevete || s.plan.extra)),
    sesiones: ((snap && snap.events) || []).filter((e) => e.type === 'session.completed' && e.payload.module !== 'focus').length,
    pausa: (pausa.platos || []).map((pl) => pl.id).join('+'),
  };
};

test('la invitación dice «Ver ejercicio» y abre la hoja: el dibujo del módulo, el ejercicio, lo que dura, «Empezar» y «Seguir con el bloque 3»', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context);
  await hastaLaInvitacion(page);
  await expect(visible(page, '[data-pace-cta]').first()).toHaveText('Ver ejercicio');
  await visible(page, '[data-pace-cta]').first().click();

  const hoja = page.locator('[data-pace-hacerla]');
  await expect(hoja).toHaveCount(1);
  await expect(page.locator('[data-pace-modal-title]')).toHaveText('Un momento para moverte');
  await expect(hoja.locator('.pace-break-nombre')).toHaveText('Elevación de talones');
  await expect(hoja.locator('.pace-break-motivo')).toHaveText('Llevas 20 minutos sentado');
  await expect(hoja.locator('.pace-lib-ctx')).toHaveText('50sMuévete');
  /* el dibujo es el del módulo, no el del ejercicio */
  await expect(hoja.locator('[data-pace-break-glifo].pace-break-glifo-mod')).toHaveCount(1);
  await expect(page.locator('[data-pace-hacerla-empezar]')).toHaveText('Empezar');
  await expect(page.locator('[data-pace-hacerla-seguir]')).toHaveText('Seguir con el bloque 3');

  /* la × la cierra, el aro sigue invitando y la misma invitación enseña el mismo ejercicio */
  await page.keyboard.press('Escape');
  await expect(hoja).toHaveCount(0);
  await expect(visible(page, '[data-pace-invita]')).toHaveCount(1);
  await visible(page, '[data-pace-cta]').first().click();
  await expect(page.locator('[data-pace-hacerla] .pace-break-nombre')).toHaveText('Elevación de talones');

  /* «Seguir con el bloque 3» la salta: empieza el bloque */
  await page.locator('[data-pace-hacerla-seguir]').click();
  await expect(hoja).toHaveCount(0);
  await expect(visible(page, '[data-pace-cta]').first()).toHaveText('Pausar');
  expect(errores).toEqual([]);
});

test('el reparto: los 31 revisados, en su orden, uno de Mueve y dos de Estira, y nunca el mismo que la vez anterior', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate(() => {
    const out = [];
    for (let i = 0; i < 64; i++) {
      const e = hacerlaSiguiente();
      const rut = hacerlaRutina(e);
      out.push({ nombre: e.step.name, modulo: e.modulo, pasos: rut.steps.length, modo: rut.steps[0].mode,
        suelo: !!rut.requiresFloor, aviso: !!rut.safety, libre: rut.access !== 'premium' });
    }
    return out;
  });
  expect(r.slice(0, 31).map((x) => x.nombre)).toEqual(REPARTO);
  expect(r.slice(31, 62).map((x) => x.nombre)).toEqual(REPARTO);
  r.forEach((x, i) => { if (i) expect(x.nombre, 'puesto ' + i).not.toBe(r[i - 1].nombre); });
  expect(r.slice(0, 31).filter((x) => x.modulo === 'move').length).toBe(11);
  expect(r.slice(0, 31).filter((x) => x.modulo === 'extra').length).toBe(20);
  r.forEach((x) => expect(x, x.nombre).toMatchObject({ pasos: 1, suelo: false, aviso: false, libre: true }));
  /* la cuenta se guarda: tras recargar, sigue donde iba */
  expect(await page.evaluate(() => getState().hacerlaVez)).toBe(64 % 31);
});

test('«Empezar» lleva a la pantalla de ejercicio con ese ejercicio solo («Paso 1 de 1», «1 paso») y, al acabar, sin «¿Te ayudó?» y solo suman los minutos', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context);
  await hastaLaInvitacion(page);
  const antes = await page.evaluate(HUELLA);
  /* una rutina a medias de antes no se toca */
  await page.evaluate(() => localStorage.setItem('pace.cuerpo.v1', 'otra rutina a medias'));

  await visible(page, '[data-pace-cta]').first().click();
  await page.locator('[data-pace-hacerla-empezar]').click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);
  await expect(page.locator('[data-pace-hacerla]')).toHaveCount(0);
  /* su rutina vale sentado o de pie: la frase general, en singular (antes, «1 pasos») */
  await expect(sesion.locator('[data-pace-session-prep-copy]')).toHaveText('Sin prisa. 1 paso.');
  await expect(sesion.locator('[data-pace-session-title]')).toHaveText('Elevación de talones');

  await segundos(page, 12);
  await expect(sesion.getByText('Paso 1 de 1')).toHaveCount(1);
  await segundos(page, 60);
  await expect(sesion.locator('[data-pace-session-done]')).toHaveCount(1);
  await expect(sesion.locator('[data-pace-session-done-title]')).toHaveText('Elevación de talones');
  await expect(sesion.getByText('Movimiento completado')).toHaveCount(1);
  await expect(page.locator('[data-pace-session-feedback]')).toHaveCount(0);

  const despues = await page.evaluate(HUELLA);
  expect(despues.min).toBe(antes.min + 1);
  expect(Object.assign({}, despues, { min: 0 })).toEqual(Object.assign({}, antes, { min: 0 }));
  expect(await page.evaluate(() => localStorage.getItem('pace.cuerpo.v1'))).toBe('otra rutina a medias');

  /* «Volver al inicio»: el aro, con el bloque 3 y sin la invitación */
  await page.keyboard.press('Enter');
  await expect(sesion).toHaveCount(0);
  await expect(visible(page, '[data-pace-cta]').first()).toHaveText('Empezar bloque 3');
  await expect(visible(page, '[data-pace-invita]')).toHaveCount(0);
  expect(errores).toEqual([]);
});

test('«Salir» a mitad vuelve al aro con el bloque 3, sin sumar nada y sin dejar «Continúa»', async ({ page, context }) => {
  await abrir(page, context);
  await hastaLaInvitacion(page);
  const antes = await page.evaluate(HUELLA);
  await visible(page, '[data-pace-cta]').first().click();
  await page.locator('[data-pace-hacerla-empezar]').click();
  await segundos(page, 15);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
  await expect(visible(page, '[data-pace-cta]').first()).toHaveText('Empezar bloque 3');
  await expect(visible(page, '[data-pace-invita]')).toHaveCount(0);
  expect(await page.evaluate(HUELLA)).toEqual(antes);
  expect(await page.evaluate(() => localStorage.getItem('pace.cuerpo.v1'))).toBeNull();
});

test('en inglés: «See exercise», y la hoja y la pantalla de ejercicio con el nombre inglés del ejercicio', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context, { lang: 'en', langAuto: false });
  await hastaLaInvitacion(page);
  await expect(visible(page, '[data-pace-cta]').first()).toHaveText('See exercise');
  await visible(page, '[data-pace-cta]').first().click();
  const nombre = await page.evaluate(() => window.PACE_STRINGS.en['extra.calves.s0.name']);
  expect(nombre).toBeTruthy();
  await expect(page.locator('[data-pace-hacerla] .pace-break-nombre')).toHaveText(nombre);
  await expect(page.locator('[data-pace-hacerla-seguir]')).toHaveText('Go on to block 3');
  await page.locator('[data-pace-hacerla-empezar]').click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion.locator('[data-pace-session-title]')).toHaveText(nombre);
  await expect(sesion.locator('[data-pace-session-prep-copy]')).toHaveText('No rush. 1 step.');
  expect(errores).toEqual([]);
});

test('la hoja cabe sin scroll propio en el móvil (360×640 y 360×730, en español y en inglés)', async ({ browser }) => {
  for (const lang of ['es', 'en']) for (const height of [640, 730]) {
    const context = await browser.newContext({ viewport: { width: 360, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await abrir(page, context, { lang, langAuto: false, sidebarCollapsed: true });
    await hastaLaInvitacion(page);
    await asentarGeometria(page);
    await visible(page, '[data-pace-cta]').first().click();
    await expect(page.locator('[data-pace-hacerla]')).toHaveCount(1);
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const d = document.querySelector('[data-pace-hacerla]').closest('[role=dialog]');
      const r = d.getBoundingClientRect();
      return { scroll: d.scrollHeight - d.clientHeight, dentro: r.top >= 0 && r.bottom <= window.innerHeight + 1 };
    });
    expect(m, lang + ' ' + height).toEqual({ scroll: 0, dentro: true });
    await context.close();
  }
});
