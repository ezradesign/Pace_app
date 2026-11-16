/* PACE · E2E · LA ACTUALIZACIÓN ARRANCA CON LO QUE DEJÓ LA VERSIÓN VIEJA
 * =====================================================================
 * Las testers tienen la 0.191.1 (iPhone y la prueba cerrada de Play) y la 0.174.0. Lo que llega
 * ahora son actualizaciones, y una actualización solo es buena si abre con SU estado: historia,
 * logros, semana, rutinas, el código y el registro de eventos. El saneador ya tiene sus pruebas
 * (estado-saneado.spec.js) con campos rotos a mano; esto va con un estado ENTERO y de verdad de
 * cada versión: tests/fixtures/estado-viejo/v0.191.1.json y v0.174.0.json los sacó
 * captura.gen.js usando el `index.html` de esa versión dos días (dos Focos, vasos, un «Sí», una
 * rutina propia y tres días de jornada en el registro).
 *
 * La tester vuelve el lunes 16 de nov.: el día cambia solo (el miércoles pasa a la historia), la
 * carta del lunes sale con lo que la versión vieja apuntó, y tras la primera escritura y una
 * recarga sigue todo (un `catch` que devuelve el estado de fábrica falla justo ahí).
 * El código de PACE completo es el campo `licencia` de siempre; la firma se hace en cada pasada
 * con la llave de prueba (licencia.helpers.js), porque la de verdad no está en el repo.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores } = require('./helpers');
const { firmar, conLlaveDePrueba } = require('./licencia.helpers');

test.use({ serviceWorkers: 'block' });

const LUNES = new Date(2026, 10, 16, 9, 30);

/* Escribe la siembra en una página vacía del mismo origen y luego abre la app: así IndexedDB ya
   tiene el registro viejo cuando PACE arranca, como en el móvil de la tester. */
async function abrirConLoDeAntes(page, context, version, codigo) {
  const viejo = require('./fixtures/estado-viejo/' + version + '.json');
  const estado = JSON.parse(viejo.localStorage['pace.state.v2']);
  estado.licencia = codigo;
  await conLlaveDePrueba(context);
  await context.route('**/siembra.html', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8',
    body: '<!doctype html><meta charset="utf-8"><title>siembra</title>' }));
  await page.clock.install({ time: LUNES });
  await page.goto('/siembra.html');
  await page.evaluate(async ([ls, eventos]) => {
    Object.keys(ls).forEach((k) => localStorage.setItem(k, ls[k]));
    await new Promise((ok, mal) => {
      const req = indexedDB.open('pace.events', eventos.version);
      req.onupgradeneeded = () => req.result.createObjectStore('contenedor');
      req.onerror = () => mal(req.error);
      req.onsuccess = () => {
        const tx = req.result.transaction('contenedor', 'readwrite');
        tx.objectStore('contenedor').put(eventos.valor, 'pace.events.v1');
        tx.oncomplete = () => { req.result.close(); ok(); };
        tx.onerror = () => mal(tx.error);
      };
    });
  }, [Object.assign({}, viejo.localStorage, { 'pace.state.v2': JSON.stringify(estado) }), viejo.eventos]);
  const errores = capturarErrores(page);
  await page.goto('/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  return { viejo, antes: estado, errores, idsViejos: JSON.parse(viejo.eventos.valor).events.map((e) => e.id) };
}

function loQueQueda(page) {
  return page.evaluate(() => {
    window.PREMIUM_ABIERTO_HASTA_V1 = false;
    const s = window.getState();
    const snap = window.paceEventsSnapshot();
    return {
      firstSeen: s.firstSeen, lang: s.lang, palette: s.palette,
      foco: s.totalFocusMin, logros: Object.keys(s.achievements || {}).sort(),
      martes: (s.history.days['2026-11-10'] || {}).focusMinutes, miercoles: (s.history.days['2026-11-11'] || {}).focusMinutes,
      rachaMejor: s.streak && s.streak.longest,
      horario: s.ritmo && s.ritmo.horario, semanaTipo: s.ritmo && s.ritmo.semanaTipo,
      rutinas: (s.customRoutines || []).map((r) => r.name), feedback: s.routineFeedback,
      licencia: s.licencia, completo: window.hasPremiumEntitlement(),
      reparados: window.paceReparadosAlCargar || [],
      ids: (snap.events || []).map((e) => e.id), puedeEscribir: !!(window.paceEventsCanWrite && window.paceEventsCanWrite()),
    };
  });
}

for (const version of ['v0.191.1', 'v0.174.0']) {
  test('desde la ' + version + ': arranca sin bienvenida y con su historia, logros, semana, rutinas, código y registro', async ({ page, context }) => {
    const codigo = firmar({ tester: 3 });
    const { antes, errores, idsViejos } = await abrirConLoDeAntes(page, context, version, codigo);
    await expect(page.locator('[role=dialog][data-pace-scene-card]'), 'la actualización abrió la bienvenida: el estado se leyó como nuevo').toHaveCount(0);
    await page.waitForFunction(() => window.paceEventsCanWrite && window.paceEventsCanWrite());

    const esperado = (q) => {
      expect(q.firstSeen).toBe(antes.firstSeen);
      expect([q.lang, q.palette]).toEqual(['es', 'crema']);
      expect(q.foco, 'los minutos de foco').toBe(50);
      expect(q.logros, 'los logros').toEqual(Object.keys(antes.achievements).sort());
      expect(q.martes, 'el martes en la historia').toBe(25);
      expect(q.miercoles, 'el miércoles, que la versión vieja dejó en la semana, pasa a la historia al cambiar el día').toBe(25);
      expect(q.rachaMejor).toBe(2);
      expect(q.horario).toEqual(antes.ritmo.horario);
      expect(q.semanaTipo, 'la semana').toEqual(antes.ritmo.semanaTipo);
      expect(q.rutinas, 'las rutinas propias').toEqual(['Mi pausa de la tarde']);
      expect(q.feedback['move.neck.3'].yes).toBe(1);
      expect(q.licencia, 'el código').toBe(codigo);
      expect(q.completo, 'el código abre PACE completo').toBe(true);
      expect(q.reparados, 'el saneador tuvo que reparar campos de un estado sano').toEqual([]);
      for (const id of idsViejos) expect(q.ids, 'falta un evento de la versión vieja').toContain(id);
      expect(q.puedeEscribir).toBe(true);
    };
    esperado(await loQueQueda(page));

    /* La carta del lunes sale con los tres días que apuntó la versión vieja. «Vale» es la primera
       escritura; con ella, un evento nuevo en el registro. */
    const carta = page.locator('[data-pace-carta]');
    await expect(carta, 'la carta del lunes no leyó el registro de la versión vieja').toBeVisible();
    await expect(carta).toContainText('pausas hechas');
    await carta.locator('[data-pace-carta-si]').click();
    await expect(carta).toHaveCount(0);
    const nuevo = await page.evaluate(async () => {
      const e = makeEvent({ type: 'feedback.answered', context: 'standalone', runId: newEventId(), occurredAt: new Date().toISOString(),
        payload: { routineId: 'move.neck.3', module: 'stretch', response: 'yes' } });
      await paceEventsAppend(e);
      return e.id;
    });
    await expect.poll(() => page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('pace.state.v2'));
      return !!(s.ritmo && s.ritmo.carta && s.ritmo.carta.respuesta);
    }), 'la respuesta a la carta no se guardó').toBe(true);

    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await page.waitForFunction(() => window.paceEventsCanWrite && window.paceEventsCanWrite());
    const tras = await loQueQueda(page);
    esperado(tras);
    expect(tras.ids, 'el evento nuevo no quedó en el registro').toContain(nuevo);
    await expect(page.locator('[data-pace-carta]'), 'la carta contestada volvió a salir').toHaveCount(0);
    expect(errores).toEqual([]);
  });
}
