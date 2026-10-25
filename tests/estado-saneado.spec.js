/* PACE · E2E · UN CAMPO ROTO NO SE LLEVA TODO LO DEMAS (s198 · v0.131.0)
 * =====================================================================
 * Lo que la auditoria de s198 MIDIO sobre v0.130.0, en el artefacto publicado:
 *
 *  1. `loadState` envolvia parseo, migraciones y rollover en un solo `try`, y su
 *     `catch` devolvia el estado de fabrica. Con `weeklyStats: null` (un import
 *     lo aceptaba tal cual) el rollover reventaba, la app arrancaba VACIA —con el
 *     onboarding— y la primera escritura persistia ese vacio encima del bueno:
 *     4321 min de foco, los logros y la historia, a cero, sin copia.
 *  2. El import de «Tus datos» escribia el backup sin mirarlo.
 *  3. «Borrar todos mis datos» dejaba vivas `pace.timer.v1`, `pace.breathe.v1` y
 *     `pace.darkDays.v1`, y `privacy.html` promete que lo borrado «desaparece de
 *     tu dispositivo».
 *
 * Calibrado en ROJO contra el `index.html` de HEAD (v0.130.0): los cuatro caen.
 * Lo que NO cubre: la pantalla de «algo se ha torcido», que es una decision
 * visual sin maqueta todavia — el rescate existe pero no se ofrece en la UI.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, CLAVE_ESTADO } = require('./helpers');

/* El estado de alguien con historia, y UN campo roto. */
const CON_HISTORIA = {
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true },
  totalFocusMin: 4321,
  achievements: { 'first.focus': 1700000000000 },
  history: {
    days: { '2026-09-01': { focusMinutes: 50, breathMinutes: 0, moveMinutes: 0, waterGlasses: 2 } },
    months: {}, years: {},
  },
  lastActiveDay: 'Tue Sep 01 2026',
  _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
};

function leerGuardado(page) {
  return page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || '{}'), CLAVE_ESTADO);
}

test('un weeklyStats roto se repara SOLO, y la historia, los minutos y los logros siguen ahi', async ({ context, page }) => {
  await sembrar(context, Object.assign({}, CON_HISTORIA, { weeklyStats: null }));
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  const enMemoria = await page.evaluate(() => {
    const s = window.getState();
    return { firstSeen: s.firstSeen, foco: s.totalFocusMin, logros: Object.keys(s.achievements).length,
      serie: Array.isArray(s.weeklyStats && s.weeklyStats.focusMinutes), reparados: window.paceReparadosAlCargar };
  });
  expect(enMemoria.firstSeen, 'la app arranco como nueva: el onboarding volvio y el estado era el de fabrica').toBe(1);
  expect(enMemoria.foco).toBe(4321);
  expect(enMemoria.logros).toBeGreaterThanOrEqual(1);
  expect(enMemoria.serie, 'la semana se repone a ceros, no se queda en null').toBe(true);
  expect(enMemoria.reparados).toContain('weeklyStats');

  /* Un gesto que ESCRIBE: es la escritura la que pisaba lo bueno. */
  await page.getByRole('button', { name: '15', exact: true }).click();
  await page.waitForTimeout(200);
  const g = await leerGuardado(page);
  expect(g.totalFocusMin, 'la primera escritura piso el estado bueno con el de fabrica').toBe(4321);
  expect(Object.keys((g.history && g.history.days) || {})).toContain('2026-09-01');
  expect(errores).toEqual([]);
});

test('el saneador, en puro: repara la FORMA campo a campo y no toca lo que esta bien ni lo que no conoce', async ({ context, page }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const s = (o) => window.paceSanearEstado(o, window.defaultState);
    let lanza = false;
    try { s([]); } catch (e) { lanza = true; }
    return {
      lanza,
      serie: s({ weeklyStats: { focusMinutes: [1, 2, 3], breathMinutes: [0, 1, 0, 0, 0, 0, 0] } }),
      agua: s({ water: { goal: 10, today: 'tres', lastReset: null } }),
      racha: s({ streak: { current: '4', longest: 9, lastActiveDate: 'Tue Sep 01 2026' } }),
      caminos: s({ paths: { current: 'x', completed: [], history: {}, favorite: null } }),
      dias: s({ history: { days: { '2026-09-01': { focusMinutes: 5 }, '2026-09-02': 7 }, months: {}, years: {} }, _historyRecalculated_v0_28_8: true }),
      numero: s({ totalFocusMin: '120', cycle: 'x' }),
      ajena: s({ ritmo: 'roto', desconocida: { a: 1 } }),
      intacto: s({ totalFocusMin: 5, achievements: { 'first.focus': 1 }, lang: 'en', firstSeen: 3 }),
    };
  });
  const cero = [0, 0, 0, 0, 0, 0, 0];
  expect(r.lanza, 'un estado que no es un objeto tiene que LANZAR (lo recoge el rescate)').toBe(true);
  expect(r.serie.estado.weeklyStats.focusMinutes, 'una serie de 3 no es una semana').toEqual(cero);
  expect(r.serie.estado.weeklyStats.breathMinutes, 'la serie buena se queda como estaba').toEqual([0, 1, 0, 0, 0, 0, 0]);
  expect(r.agua.estado.water).toEqual({ goal: 10, today: 0, lastReset: null });
  expect(r.racha.estado.streak).toEqual({ current: 0, longest: 9, lastActiveDate: 'Tue Sep 01 2026' });
  expect(r.caminos.estado.paths).toEqual({ current: null, completed: {}, history: [], favorite: null });
  expect(Object.keys(r.dias.estado.history.days)).toEqual(['2026-09-01']);
  expect(r.dias.estado._historyRecalculated_v0_28_8, 'si se cae un dia, meses y años se re-agregan').toBe(false);
  expect(r.numero.estado.totalFocusMin, 'un numero escrito como texto se lee, no se tira').toBe(120);
  expect(r.numero.estado.cycle).toBe(0);
  expect('ritmo' in r.ajena.estado, 'un `ritmo` que no es objeto se quita: su dueño lo crea de nuevo').toBe(false);
  expect(r.ajena.estado.desconocida, 'una clave que no conoce puede ser de una version MAS NUEVA: no se toca').toEqual({ a: 1 });
  expect(r.intacto.reparados, 'un estado sano sale sin reparaciones').toEqual([]);
});

test('si aun asi no se puede leer, la cadena cruda queda en el rescate y viaja en el backup', async ({ context, page }) => {
  const CRUDO = '{"totalFocusMin": 99, "firstSeen": 1, "achievements": {"first.focus": 1';   // cortado
  await context.addInitScript(([clave, crudo]) => {
    if (!sessionStorage.getItem('pace.test.sembrado')) {
      localStorage.setItem(clave, crudo);
      sessionStorage.setItem('pace.test.sembrado', '1');
    }
  }, [CLAVE_ESTADO, CRUDO]);
  await page.goto('/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'attached' });

  const rescate = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2.rescate') || 'null'));
  expect(rescate, 'no queda copia de lo que no se pudo leer').not.toBeNull();
  expect(rescate.raw).toBe(CRUDO);

  /* Y el export de «Tus datos» lo lleva: es la unica salida que tiene hoy.
     Fuera el onboarding RECARGANDO: su `open` se fija al montar y un setState
     no lo cierra. La siembra no se repite (marca en sessionStorage). */
  await page.evaluate(() => window.setState({ firstSeen: 1 }));
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar una copia', exact: true }).click(),
  ]);
  const backup = JSON.parse(require('fs').readFileSync(await descarga.path(), 'utf8'));
  expect(backup.rescate && backup.rescate.raw).toBe(CRUDO);
});

test('un backup con campos rotos se importa SANEADO: tras recargar, la persona sigue siendo ella', async ({ context, page }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  page.on('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  const recarga = page.waitForEvent('load');
  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: 'pace-backup-20260901.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      app: 'PACE', version: 'v0.120.0',
      state: Object.assign({}, CON_HISTORIA, { weeklyStats: null, water: 'muchos', streak: 7 }),
    })),
  });
  /* LO QUE SE GUARDA ya tiene que estar limpio, antes de recargar. El arranque
     tambien sanea, asi que mirar solo el resultado tras la recarga no distingue
     un import que sanea de uno que escribe el backup tal cual (el banco de s198
     lo dejo vivo con el aserto de abajo solo). La recarga espera 900 ms al aviso. */
  await expect(page.locator('.pace-aj-msg')).toHaveText('Importado — recargando…');
  const escrito = await leerGuardado(page);
  expect(escrito.weeklyStats, 'el import escribio el backup sin sanear').not.toBeNull();
  expect(typeof escrito.water, 'el import escribio el agua rota').toBe('object');
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  const s = await page.evaluate(() => {
    const st = window.getState();
    return { firstSeen: st.firstSeen, foco: st.totalFocusMin, meta: st.water && st.water.goal, racha: typeof (st.streak && st.streak.current) };
  });
  expect(s.firstSeen, 'el backup roto dejo la app en el estado de fabrica al recargar').toBe(1);
  expect(s.foco).toBe(4321);
  expect(typeof s.meta).toBe('number');
  expect(s.racha).toBe('number');
});

test('la copia de rescate que descarga PACE se puede importar (caza del 10 oct., estado-4)', async ({ context, page }) => {
  /* Lo que guarda `paceDescargarRescate`: el estado viaja como la cadena que un arranque no pudo
     leer. Si una version nueva ya la lee, importarla tiene que devolverla. En v0.154.0 daba
     «Archivo no reconocido.». */
  await sembrar(context);
  await irAlArtefacto(page);
  page.on('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  const recarga = page.waitForEvent('load');
  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: 'pace-rescate-20261010.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'PACE', kind: 'rescate', version: 'v0.154.0', exportedAt: '2026-10-10T10:00:00Z',
      rescate: { v: 1, savedAt: 1791000000000, motivo: 'x', raw: JSON.stringify(CON_HISTORIA) } })),
  });
  await expect(page.locator('.pace-aj-msg')).toHaveText('Importado — recargando…');
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  expect(await page.evaluate(() => window.getState().totalFocusMin)).toBe(4321);
});

test('«Borrar todos mis datos» borra TODAS las claves de PACE, no solo el estado', async ({ context, page }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => {
    localStorage.setItem('pace.timer.v1', '{}');
    localStorage.setItem('pace.breathe.v1', '{"v":1}');
    localStorage.setItem('pace.darkDays.v1', '["2026-09-01"]');
    localStorage.setItem('pace.state.v2.rescate', '{"v":1,"raw":"x"}');
  });
  page.on('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  const recarga = page.waitForEvent('load');
  await page.getByRole('button', { name: 'Borrar todos mis datos' }).click();
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'attached' });

  const claves = await page.evaluate(() => Object.keys(localStorage));
  ['pace.timer.v1', 'pace.breathe.v1', 'pace.darkDays.v1', 'pace.state.v2.rescate'].forEach((k) =>
    expect(claves, k + ' sobrevivio al borrado total').not.toContain(k));
  /* GUARD: el borrado paso de verdad (si no, lo de arriba no prueba nada). */
  expect(claves.filter(k => k.indexOf('pace.') === 0 && k.indexOf('pace.events.') !== 0 && k !== CLAVE_ESTADO)).toEqual([]);
});

/* AUDITORÍA DEL 21 OCT. (ChatGPT, comprobada por la coordinadora) · 1 y 5.
 * 1 · LA SEMANA INCOMPLETA. El saneador solo reparaba las series de la semana que EXISTÍAN, y
 *     `loadState` mezcla por arriba: un `weeklyStats: {}` sustituía al de fábrica entero y el
 *     primer vaso de la semana reventaba en `[...s.weeklyStats.waterGlasses]`. Con la semana en
 *     curso (`lastActiveDay` de hoy), porque al cambiar de semana el relevo la rehace entera. La
 *     barra lateral se traga el error, así que lo que se veía es un vaso que no cuenta.
 * 5 · SUMAS QUE CONCATENAN. Las métricas de cada día no se miraban: con un `'30'` de una copia
 *     editada a mano, el mes se re-agregaba como `0 + '30' + '20' = '03020'`.
 * Calibradas en rojo contra el `index.html` de v0.174.0: las tres caen. */
const unVasoSaneado = (page) => page.locator('[data-pace-sidebar]').getByRole('button', { name: /Añadir un vaso/ }).click();

async function importarCopia(page, estado) {
  page.on('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  const recarga = page.waitForEvent('load');
  await page.locator('input[type="file"][accept="application/json,.json"]').setInputFiles({
    name: 'pace-backup-20261021.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'PACE', version: 'v0.174.0', state: estado })),
  });
  await expect(page.locator('.pace-aj-msg')).toHaveText('Importado — recargando…');
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
}

for (const via of ['al importar', 'al arrancar']) {
  test(`1 · una semana sin sus series (\`weeklyStats: {}\`) se completa ${via}, y el vaso siguiente cuenta`, async ({ context, page }) => {
    const estado = Object.assign({}, CON_HISTORIA, { lastActiveDay: new Date().toDateString(), weeklyStats: {} });
    await sembrar(context, via === 'al arrancar' ? estado : undefined);
    const errores = capturarErrores(page);
    await irAlArtefacto(page);
    if (via === 'al importar') await importarCopia(page, estado);

    /* La barra lateral se traga el error del vaso (`try/catch`): lo que se ve es que no cuenta. */
    await unVasoSaneado(page);
    await page.waitForTimeout(300);
    const g = await leerGuardado(page);
    expect(g.water && g.water.today, 'el vaso no se apuntó: la semana se quedó sin su serie de agua').toBe(1);
    expect(errores).toEqual([]);
    ['focusMinutes', 'breathMinutes', 'moveMinutes', 'waterGlasses', 'holdSeconds'].forEach((serie) =>
      expect(g.weeklyStats[serie], 'falta la serie ' + serie).toHaveLength(7));
    expect(g.totalFocusMin, 'la historia sigue ahí').toBe(4321);
  });
}

test('5 · las métricas de cada día se leen como números al arrancar y al importar: el mes suma, no concatena', async ({ context, page }) => {
  /* Días con texto, y un mes que ya llegó concatenado de antes: el mes se rehace desde los días. */
  const estado = Object.assign({}, CON_HISTORIA, {
    history: {
      days: {
        '2026-10-01': { focusMinutes: '30', breathMinutes: 0, moveMinutes: '5', waterGlasses: 2, holdSeconds: 0 },
        '2026-10-02': { focusMinutes: '20', breathMinutes: 'nada', moveMinutes: 0, waterGlasses: '3' },
      },
      months: { '2026-10': { focusMinutes: '03020', breathMinutes: 0, moveMinutes: '05', waterGlasses: 5, holdSeconds: 0 } },
      years: { '2026': { focusMinutes: '03020', breathMinutes: 0, moveMinutes: '05', waterGlasses: 5, holdSeconds: 0 } },
    },
  });
  await sembrar(context, estado);
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  const leerMes = () => page.evaluate(() => {
    const h = window.getState().history;
    return { dia: h.days['2026-10-02'], mes: h.months['2026-10'], anio: h.years['2026'] };
  });
  const comprobar = (r, via) => {
    expect(r.dia, via + ': el día guarda texto').toEqual({ focusMinutes: 20, breathMinutes: 0, moveMinutes: 0, waterGlasses: 3 });
    expect(r.mes.focusMinutes, via + ': el mes concatena en vez de sumar').toBe(50);
    expect(r.mes.moveMinutes).toBe(5);
    expect(r.mes.waterGlasses).toBe(5);
    expect(r.anio.focusMinutes, via + ': el año concatena en vez de sumar').toBe(50);
  };
  comprobar(await leerMes(), 'al arrancar');

  /* La misma copia, importada: lo que se GUARDA ya va en números, antes de recargar. */
  await importarCopia(page, estado);
  comprobar(await leerMes(), 'al importar');
  expect(errores).toEqual([]);
});

/* AUDITORÍA DEL 21 OCT. · 11 · UNA RUTINA PROPIA DAÑADA. `customRoutines` solo se miraba como
 * lista, y la tarjeta lee `routine.steps.length` (y la lista, `r.id`): una entrada `null` o sin
 * pasos tumbaba «Tus rutinas» entera. Ahora el saneador aparta lo que no se puede usar, sin
 * borrarlo (`customRoutinesApartadas`, que viaja en la copia), y la tarjeta no puede caerse.
 * Cae contra v0.174.0. */
test('11 · una rutina propia dañada no tumba «Tus rutinas»: se aparta sin borrarse, y la buena se ve y arranca', async ({ context, page }) => {
  const paso = { name: 'Hombros', dur: 30, cue: '' };
  const buena = { id: 'custom.1', name: 'Mi pausa buena', steps: [paso], min: 1, createdAt: 1, updatedAt: 1 };
  const sinPasos = { id: 'custom.2', name: 'Sin pasos', min: 1 };
  const conPasoRoto = { id: 'custom.3', name: 'Con un paso roto', steps: [null, paso], min: 1 };
  await sembrar(context, { customRoutines: [buena, null, sinPasos, conPasoRoto] });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  const s = await page.evaluate(() => ({ lista: getState().customRoutines, apartadas: getState().customRoutinesApartadas }));
  expect((s.lista || []).map(r => r && r.id), 'lo que no se puede usar sigue en la lista').toEqual(['custom.1', 'custom.3']);
  expect(s.lista[1].steps, 'el paso roto sigue en la rutina').toEqual([paso]);
  expect(s.apartadas, 'lo apartado se guarda tal cual, no se borra').toEqual([null, sinPasos, conPasoRoto]);

  await page.getByRole('button', { name: /^Mueve/ }).filter({ visible: true }).first().click();
  const biblio = page.locator('[data-pace-modal-backdrop]').last();
  await expect(biblio.getByText('Mi pausa buena'), '«Tus rutinas» se cayó').toBeVisible();
  /* La tarjeta abre «Antes de empezar», y de ahí la sesión arranca. */
  await biblio.getByText('Mi pausa buena').click();
  await page.getByRole('button', { name: 'Empezar', exact: true }).filter({ visible: true }).first().click();
  await page.locator('[data-pace-session-root]').first().waitFor({ state: 'visible' });
  expect(errores).toEqual([]);
});
