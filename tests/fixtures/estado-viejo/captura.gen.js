/* PACE · GENERADOR de las siembras de una versión vieja (no es una prueba de la suite)
 * =================================================================================
 * Las testers tienen la 0.191.1 (iPhone y la prueba cerrada de Play) y la 0.174.0 (la primera
 * prueba cerrada). Para probar que una actualización arranca con SU estado, el estado tiene que
 * ser de verdad de esa versión, no uno escrito a mano con la forma de hoy. Esto sirve el
 * `index.html` de cada versión, sacado de git, en una ruta del mismo origen, lo usa como una
 * tester durante dos días (dos Focos de verdad con el reloj, vasos, un «¿Te ayudó?», una
 * rutina propia y los resúmenes del día que lee la carta del lunes) y vuelca lo que dejó:
 * las claves `pace.*` de localStorage y el contenedor de `pace.events.v1` de IndexedDB.
 *
 *   npx playwright test -c tests/fixtures/estado-viejo/captura.config.js
 *
 * Escribe `v0.191.1.json` y `v0.174.0.json` aquí al lado. Las lee tests/estado-actualiza.spec.js. */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { test, expect } = require('@playwright/test');

const VERSIONES = [
  { version: 'v0.205.0', commit: '45a85c7c' },
  { version: 'v0.191.1', commit: 'be9fd861' },
  { version: 'v0.174.0', commit: '570ab80a' },
];
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const SEMANA = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const MARTES = new Date(2026, 10, 10, 10, 0);   // la tester usa PACE el martes 10 y el miércoles 11 de nov.

test.use({ serviceWorkers: 'block' });

/* Un día de jornada como lo resume `emitRitmoDia` (la forma de ritmo-carta.spec.js). */
function resumen(fecha) {
  const p = (hora, tipo, modulo, id, estado) => ({ hora, tipo, estado, reunion: 0, platos: [{ modulo, id, otras: 0, antes: [] }] });
  return { fecha, opcion: 'jornada', habitual: 'jornada', inicio: 540, salida: 1020, paradas: [
    p(585, 'pausa', 'mueve', 'extra.legs.standing', 'hecha'), p(745, 'pausa', 'estira', 'move.neck.3', 'hecha'),
    p(795, 'pausa', 'mueve', 'extra.glutes.stealth', 'saltada'), p(945, 'pausa', 'estira', 'move.hamstrings.standing', 'hecha'),
    p(1015, 'cierre', 'respira', 'breathe.physiological', 'hecha') ] };
}

async function unFoco(page) {
  await page.locator('[data-pace-cta]').first().click();
  const antes = await page.evaluate(() => window.getState().cycle || 0);
  await page.clock.fastForward(25 * 60 * 1000 + 2000);
  await expect.poll(() => page.evaluate(() => window.getState().cycle || 0)).toBe(antes + 1);
  await page.keyboard.press('Escape');   // la ventana de la pausa, si sale
}

for (const v of VERSIONES) {
  test('captura ' + v.version, async ({ page, context }) => {
    test.setTimeout(180000);
    const html = execSync('git show ' + v.commit + ':index.html', { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
    await context.route('**/viejo.html', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }));
    /* Sin sembrar nada: la versión vieja crea su estado de una instalación nueva (con sus marcas
       de migración puestas), y la bienvenida se da por hecha con su propio setState. Una siembra
       a mano sin esas marcas le hace correr migraciones de la v0.28.8 que una tester no corrió. */
    await page.clock.install({ time: MARTES });
    await page.goto('/viejo.html');
    await page.waitForFunction(() => typeof window.setState === 'function' && typeof window.getState === 'function');
    await page.evaluate(([horario, semana]) => {
      window.setState({ firstSeen: new Date(2026, 9, 25, 9, 0).getTime(), lang: 'es', langAuto: false,
        palette: 'crema', paletteAuto: false, ritmo: { horario: horario, semanaTipo: semana, libre: '2026-11-10' } });
    }, [HORARIO, SEMANA]);
    await page.waitForTimeout(600);
    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    expect(await page.evaluate(() => window.PACE_VERSION), 'no es la versión que se quería capturar').toBe(v.version);

    /* El martes: un Foco, tres vasos, un «Sí» y una rutina propia; y tres días de jornada en el registro
       (lo que la carta del lunes siguiente necesita para salir). */
    await unFoco(page);
    await page.evaluate(() => { addWaterGlass(1); addWaterGlass(1); addWaterGlass(1); });
    await page.evaluate(() => { recordRoutineFeedback('move.neck.3', 'yes'); });
    await page.evaluate(() => addCustomRoutine({ name: 'Mi pausa de la tarde',
      steps: [{ name: 'Chest opener', dur: 40 }, { name: 'Deep breaths', dur: 60 }] }));
    await page.waitForFunction(() => window.paceEventsCanWrite && window.paceEventsCanWrite());
    await page.evaluate(async (dias) => {
      for (const d of dias) await new Promise((ok) => emitRitmoDia(d, ok, ok));
    }, [resumen('2026-11-09'), resumen('2026-11-10'), resumen('2026-11-11')]);

    /* El miércoles: vuelve, el día cambia solo y hace otro Foco por libre. */
    await page.clock.fastForward(24 * 60 * 60 * 1000);
    await page.evaluate(() => {
      const s = window.getState();
      window.setState({ ritmo: Object.assign({}, s.ritmo, { libre: '2026-11-11' }) });
    });
    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await unFoco(page);
    await page.waitForTimeout(800);

    const volcado = await page.evaluate(async () => {
      const ls = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (/^pace\./.test(k)) ls[k] = localStorage.getItem(k);
      }
      const contenedor = await new Promise((ok, mal) => {
        const req = indexedDB.open('pace.events');
        req.onerror = () => mal(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const g = db.transaction('contenedor', 'readonly').objectStore('contenedor').get('pace.events.v1');
          g.onsuccess = () => { ok({ version: db.version, valor: g.result }); db.close(); };
          g.onerror = () => mal(g.error);
        };
      });
      return { localStorage: ls, eventos: contenedor };
    });
    const estado = JSON.parse(volcado.localStorage['pace.state.v2']);
    expect(estado.totalFocusMin, 'los dos Focos no se guardaron').toBe(50);
    expect(typeof volcado.eventos.valor, 'el registro no está en IndexedDB').toBe('string');
    const salida = { version: v.version, commit: v.commit, usadoHasta: '2026-11-11', generador: 'tests/fixtures/estado-viejo/captura.gen.js',
      localStorage: volcado.localStorage, eventos: volcado.eventos };
    fs.writeFileSync(path.join(__dirname, v.version + '.json'), JSON.stringify(salida, null, 1) + '\n');
  });
}
