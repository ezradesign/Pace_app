/* PACE · E2E · LA CARTA DEL LUNES (el motor de la semana; Ez, 8, 16 y 17 oct. 2026)
 * ==============================================================================
 * La carta en una ventana, la primera vez que PACE se abre en la semana, también sin
 * cambios (la página del motor, opción B). Ez eligió el 17 oct. con las fotos de la app real
 * (docs/traspaso/archivos/motor-semana/carta/): la pregunta de tus horas DESPUÉS del cambio
 * (B) y lo aprendido en «Tu semana» en una línea que abre la lista (B).
 *
 * LO QUE DEFIENDE:
 *  · la semana sale del registro (pace.events.v1): los resúmenes de cada día y los «¿Te
 *    ayudó?»; la carta los cuenta con su porqué, «Vale» los aplica y no vuelve a salir;
 *  · «Dejarla como estaba» no cambia nada y no lo vuelve a proponer;
 *  · espera a que no haya nada abierto encima de la home;
 *  · la pregunta va después del cambio, y «Sí» cambia la entrada de ese día de la semana
 *    sin tocar tu horario de siempre (lo que se edita en «Tu semana» sigue siendo 9:00);
 *  · «Tu semana» dice cuántas cosas ha aprendido, las enseña al tocar y cada una se olvida;
 *  · cabe sin scroll a 360 × 640, en castellano y en inglés.
 * Contra main cae entera: ni el motor ni la carta existían.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const LUNES = new Date(2026, 9, 19, 8, 30);   /* repasa del 12 al 18 de octubre */
const SEMANA = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'];
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

function dia(fecha, i) {
  const p = (hora, tipo, modulo, id) => ({ hora, tipo, estado: 'hecha', reunion: 0, platos: [{ modulo, id, otras: 0, antes: [] }] });
  const d = { fecha, opcion: 'jornada', habitual: 'jornada', inicio: 540, salida: 1020, paradas: [
    p(585, 'pausa', 'mueve', 'extra.legs.standing'), p(745, 'pausa', 'estira', 'move.neck.3'),
    p(795, 'pausa', 'mueve', 'extra.glutes.stealth'), p(945, 'pausa', 'estira', 'move.shoulder.circles'),
    p(1015, 'cierre', 'respira', 'breathe.physiological') ] };
  if (i < 4) { d.paradas[2].platos[0].otras = 1; d.paradas[2].platos[0].antes = ['extra.calves']; }
  if (i < 3) d.paradas[3].estado = 'saltada';
  return d;
}

async function abrir(page, context, extra, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await sembrar(context, Object.assign({ ritmo: { horario: HORARIO, libre: true } }, extra || {}));
  await page.clock.install({ time: LUNES });
  await irAlArtefacto(page);
}

/* La semana pasada en el registro, por el emisor de verdad, y el motor que la revisa. */
async function semanaEnElRegistro(page) {
  await page.waitForFunction(() => window.paceEventsCanWrite && window.paceEventsCanWrite());
  await page.evaluate(async (dias) => {
    for (const d of dias) await new Promise((ok) => emitRitmoDia(d, ok, ok));
    for (const f of ['2026-10-13', '2026-10-15']) {
      const e = makeEvent({ type: 'feedback.answered', context: 'standalone', runId: newEventId(), occurredAt: new Date(f + 'T10:00:00').toISOString(),
        payload: { routineId: 'move.neck.3', module: 'stretch', response: 'yes' } });
      await paceEventsAppend(e);
    }
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { carta: null }) }));
    ritmoMotorRevisar();
  }, SEMANA.map(dia));
}

/* Una carta puesta a mano en el estado (la de la pregunta). */
function ponerCarta(page, cambios) {
  return page.evaluate((cambios) => {
    const barras = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ d, hechas: d < 6 ? 5 : 0, total: d < 6 ? 7 : 0 }));
    const res = { semana: { lunes: '2026-10-19', desde: '2026-10-12', hasta: '2026-10-18' }, dias: 5, carta: true,
                  ayudo: ['move.shoulder.circles'], hechas: 25, total: 35, barras, cambios };
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, {
      carta: { lunes: '2026-10-19', res, vista: null, respuesta: null, hora: null } }) }));
  }, cambios);
}
const GEMELOS = { tipo: 'descansa', clase: 'rutinas', id: 'extra.calves', modulo: 'mueve', veces: 4, semanas: 1, paradas: 4 };
const LUNES_940 = { tipo: 'hora', clase: 'forma', pregunta: true, campo: 'inicio', dia: 1, hora: 580, veces: 2, paradas: 0 };
const ritmo = (page) => page.evaluate(() => getState().ritmo);

test('el lunes, la semana del registro llega a la carta; «Vale» la aplica y no vuelve a salir', async ({ page, context }) => {
  await abrir(page, context);
  await semanaEnElRegistro(page);
  const carta = page.locator('[data-pace-carta]');
  await expect(carta).toBeVisible();
  await expect(page.locator('[data-pace-carta-ayudo]')).toHaveText('Cuello');
  await expect(carta).toContainText('17 de 20 pausas hechas');
  await expect(carta).toContainText('del 12 al 16 oct');
  await expect(page.locator('[data-pace-carta-cambio="descansa"]')).toHaveText('Gemelos subrepticios, que cambiaste cuatro veces, descansa un mes.');
  await expect(page.locator('[data-pace-carta-cambio="corta"]')).toHaveText('La pausa de las 15:45, que saltaste tres días, pasa a ser de 2 minutos.');
  await page.locator('[data-pace-carta-si]').click();
  await expect(carta).toHaveCount(0);
  const r = await ritmo(page);
  expect(r.aprendido.descansa).toEqual({ 'extra.calves': '2026-11-16' });
  expect(r.aprendido.cortas).toEqual([{ hora: 945, hasta: '2026-11-16' }]);
  expect(r.aprendido.ayuda).toEqual({ ids: ['move.neck.3'], hasta: '2026-11-16' });
  expect([r.carta.respuesta, r.carta.vista]).toEqual(['vale', '2026-10-19']);
  /* Una vez por semana: el motor ya revisó esta y no la vuelve a calcular. */
  await page.evaluate(() => ritmoMotorRevisar());
  await page.waitForTimeout(900);
  await expect(carta).toHaveCount(0);
});

test('«Dejarla como estaba» no cambia nada y no lo vuelve a proponer', async ({ page, context }) => {
  await abrir(page, context);
  await semanaEnElRegistro(page);
  await page.locator('[data-pace-carta-no]').click();
  await expect(page.locator('[data-pace-carta]')).toHaveCount(0);
  const r = await page.evaluate(() => {
    const a = getState().ritmo.aprendido;
    const otra = ritmoMotor(Object.assign(ritmoMotorEntrada(getState(), '2026-10-19'), { hoy: '2026-10-19' }));
    return { descansa: a.descansa, cortas: a.cortas, rechazado: Object.keys(a.rechazado).sort(), otra: otra.cambios };
  });
  expect(r.descansa).toEqual({});
  expect(r.cortas).toEqual([]);
  expect(r.rechazado).toEqual(['corta:945', 'descansa:extra.calves']);
  expect(r.otra, 'la misma semana otra vez: nada que proponer').toEqual([]);
});

test('espera a que no haya nada abierto encima de la home', async ({ page, context }) => {
  await abrir(page, context);
  await page.getByRole('button', { name: 'Abrir ajustes' }).first().click();
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
  await ponerCarta(page, [GEMELOS]);
  await page.waitForTimeout(1200);
  await expect(page.locator('[data-pace-carta]'), 'con Ajustes abierto, espera').toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pace-carta]')).toBeVisible();
});

test('la pregunta va después del cambio; «Sí» cambia la entrada de los lunes y no tu horario de siempre', async ({ page, context }) => {
  await abrir(page, context);
  await ponerCarta(page, [GEMELOS, LUNES_940]);
  await expect(page.locator('[data-pace-carta-cambios]')).toBeVisible();
  await expect(page.locator('[data-pace-carta-pregunta]'), 'primero el cambio, solo').toHaveCount(0);
  await page.locator('[data-pace-carta-si]').click();
  await expect(page.locator('[data-pace-carta-pregunta]')).toContainText('Los lunes empiezas a las 9:40. ¿Pongo tu entrada de los lunes a las 9:40?');
  await expect(page.locator('[data-pace-carta-cambios]')).toHaveCount(0);
  await page.locator('[data-pace-carta-si]').click();
  await expect(page.locator('[data-pace-carta]')).toHaveCount(0);
  const r = await page.evaluate(() => {
    const s = getState();
    ritmoElegir('jornada');
    const p = ritmoPlan(getState());
    return { horario: s.ritmo.horario, carta: s.ritmo.carta, empieza: p.m.focos[0].desde, base: ritmoDe(getState()).horario.inicio };
  });
  expect(r.horario.inicio, 'tu entrada de siempre no cambia').toBe(540);
  expect(r.horario.dias).toEqual({ 1: { inicio: 580 } });
  expect([r.carta.respuesta, r.carta.hora, r.carta.vista]).toEqual(['vale', 'si', '2026-10-19']);
  expect(r.empieza, 'hoy, lunes, el día empieza a las 9:40').toBe(580);
  expect(r.base).toBe(540);
});

test('«Tu semana» dice lo aprendido en una línea, lo enseña al tocarla y cada cosa se olvida', async ({ page, context }) => {
  await abrir(page, context, { ritmo: { horario: Object.assign({ dias: { 1: { inicio: 580 } } }, HORARIO), libre: true,
    aprendido: { descansa: { 'extra.calves': '2026-11-16' }, cortas: [], rechazado: {} } } });
  await page.evaluate(() => ritmoSemanaAbrir());
  const hoja = page.locator('[data-pace-semana-hoja]');
  await expect(hoja).toBeVisible();
  await expect(hoja.locator('[data-pace-ritmo-horario="inicio"]').first(), 'en la hoja, tu entrada de siempre').toHaveValue('540');
  await expect(page.locator('[data-pace-aprendido]'), 'cerrada hasta tocarla').toHaveCount(0);
  await expect(page.locator('[data-pace-aprendidos-abrir]')).toHaveText(/PACE ha aprendido 2 cosas/);
  await page.locator('[data-pace-aprendidos-abrir]').click();
  await expect(page.locator('[data-pace-aprendido="descansa:extra.calves"]')).toContainText('Gemelos subrepticios descansa hasta el 16 nov');
  await expect(page.locator('[data-pace-aprendido="dia:1:inicio"]')).toContainText('Los lunes empiezas a las 9:40');
  await page.locator('[data-pace-aprendido="dia:1:inicio"] button').click();
  await expect(page.locator('[data-pace-aprendido="dia:1:inicio"]')).toHaveCount(0);
  await page.locator('[data-pace-aprendido="descansa:extra.calves"] button').click();
  await expect(page.locator('[data-pace-aprendidos]'), 'sin nada aprendido, no se pinta').toHaveCount(0);
  const r = await ritmo(page);
  expect(r.horario.dias).toEqual({});
  expect(r.aprendido.descansa).toEqual({});
});

for (const lang of ['es', 'en']) {
  test('cabe sin scroll a 360 × 640 (' + lang + ')', async ({ page, context }) => {
    await abrir(page, context, { lang, langAuto: false }, { width: 360, height: 640 });
    const medir = () => page.evaluate(() => {
      const c = document.querySelector('[data-pace-modal-card]');
      const r = c.getBoundingClientRect();
      return { scroll: c.scrollHeight - c.clientHeight, fuera: Math.max(0, Math.round(r.bottom - window.innerHeight), Math.round(-r.top)) };
    });
    await ponerCarta(page, [GEMELOS, { tipo: 'corta', clase: 'forma', hora: 945, modulo: 'estira', min: 2, veces: 3, semanas: 2, paradas: 5 }]);
    await expect(page.locator('[data-pace-carta]')).toBeVisible();
    expect(await medir()).toEqual({ scroll: 0, fuera: 0 });
    await page.evaluate(() => setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { carta: null }) })));
    await ponerCarta(page, [LUNES_940]);
    await expect(page.locator('[data-pace-carta-pregunta]')).toBeVisible();
    expect(await medir()).toEqual({ scroll: 0, fuera: 0 });
  });
}
