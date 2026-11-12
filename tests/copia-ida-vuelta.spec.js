/* PACE · E2E · UNA CUENTA RICA SALE EN LA COPIA, SE BORRA Y VUELVE IGUAL (la octava, prueba 4, 12 nov. 2026)
 * ==========================================================================
 * `privacy.html` promete exportar todo e importarlo en otro dispositivo. Cada pieza tenía su prueba
 * (eventos-backup, importar-borrar, bienvenida-copia), pero ninguna hacía el viaje entero con una
 * cuenta de verdad: logros, una rutina tuya, tu semana, un Foco hecho, vasos y su registro de
 * sesiones. Aquí: se usa PACE, se exporta (A), se borra todo, se trae la copia desde la bienvenida
 * (la puerta de quien estrena móvil) y se exporta otra vez (B). A y B dicen lo mismo, campo a
 * campo, salvo lo que se anota abajo con su motivo, y el registro es el mismo evento a evento.
 * La cuenta se siembra como muchas pruebas, sin `weeklyStats`: así la destapó. Una semana que no
 * estaba guardada dejaba sin marcar la migración de la v0.28.8, la copia la llevaba sin marcar y al
 * traerla se corría un día (el Foco del jueves salía el miércoles). Contra la 0.201.0 cae por eso;
 * el arreglo, en loadState (state-core.jsx): sin semana que re-indexar, se marca igual.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores, aceptarAvisosPace, abrirTusDatos, terminarBloque, CLAVE_ESTADO } = require('./helpers');
const { leerContenedor, esperarInit, sembrarEventos } = require('./eventos.helpers');

test.use({ serviceWorkers: 'block' });

const AHORA = new Date('2026-10-08T10:00:00+02:00');

/* Lo que ya traía la cuenta antes de esta visita: su semana, logros, una rutina suya. */
const CUENTA = {
  firstSeen: 1761900000000, lang: 'es', langAuto: false, palette: 'crema', novedadesVistas: '*',
  totalFocusMin: 135,
  ritmo: { semanaTipo: ['jornada', 'media', 'jornada', '2h', 'jornada', 'libre', 'libre'] },
  achievements: { 'first.focus': { unlockedAt: 1761900100000 }, 'secret.backup': { unlockedAt: 1761900200000 } },
  customRoutines: [{ id: 'custom.1761900300000', name: 'La de la tarde',
    steps: [{ name: 'Encogimiento de hombros', dur: 20, cue: '' }, { name: 'Giro sentado', dur: 20, cue: '' }],
    createdAt: 1761900300000, updatedAt: 1761900300000 }],
};

async function exportar(page) {
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exportar una copia', exact: true }).click(),
  ]);
  return JSON.parse(require('fs').readFileSync(await descarga.path(), 'utf8'));
}

/* Las diferencias entre dos objetos, como «ruta: a → b», para que el rojo diga qué se perdió. */
function diferencias(a, b, ruta, out) {
  out = out || [];
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    new Set(Object.keys(a).concat(Object.keys(b))).forEach((k) => diferencias(a[k], b[k], (ruta ? ruta + '.' : '') + k, out));
  } else out.push(ruta + ': ' + JSON.stringify(a) + ' → ' + JSON.stringify(b));
  return out;
}

test('exportar, borrar todo y traer la copia deja la cuenta igual: estado y registro', async ({ page, context }) => {
  /* Semilla de una vez: tras borrar falta la clave y una semilla normal la volvería a escribir. */
  await context.addInitScript(([clave, estado]) => {
    if (localStorage.getItem('__sembrado')) return;
    localStorage.setItem('__sembrado', '1');
    localStorage.setItem(clave, JSON.stringify(estado));
  }, [CLAVE_ESTADO, CUENTA]);
  const errores = capturarErrores(page);
  await aceptarAvisosPace(page);
  await page.clock.install({ time: AHORA });
  await page.goto('/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);

  /* La visita de hoy: un Foco entero, dos vasos y tres sesiones más en el registro. */
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await terminarBloque(page);
  await expect(async () => {
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(0, { timeout: 1000 });
  }).toPass();
  for (let i = 0; i < 2; i++) await page.locator('[data-pace-sidebar]').getByRole('button', { name: /Añadir un vaso/ }).click();
  await sembrarEventos(page, 3);
  await expect.poll(() => page.evaluate(() => getState().water.today)).toBe(2);

  const A = await exportar(page);
  expect(A.state.totalFocusMin, 'el Foco de hoy está en la copia').toBe(160);
  expect(A.events.events.length, 'el registro lleva el Foco y las tres sembradas').toBeGreaterThanOrEqual(4);

  /* Borrar todo: recarga y PACE está como recién instalado. */
  const recargaBorrar = page.waitForEvent('load');
  await page.getByRole('button', { name: 'Borrar todos mis datos' }).click();
  await recargaBorrar;
  await expect(page.locator('[data-pace-onb-copia]')).toBeVisible();
  expect(await page.evaluate(() => getState().totalFocusMin), 'borrado').toBe(0);
  await esperarInit(page);
  expect((await leerContenedor(page)).events.length, 'registro borrado').toBe(0);

  /* La copia, desde la bienvenida. */
  const recargaTraer = page.waitForEvent('load');
  const [elige] = await Promise.all([page.waitForEvent('filechooser'), page.locator('[data-pace-onb-copia]').click()]);
  await elige.setFiles({ name: 'pace-copia.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(A)) });
  await recargaTraer;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await esperarInit(page);

  const B = await exportar(page);
  /* Lo que cambia con razón: cuándo se hizo cada copia. */
  const sinMomento = (c) => Object.assign({}, c, { exportedAt: null, events: Object.assign({}, c.events, { exportedAt: null }) });
  expect(diferencias(sinMomento(A).state, sinMomento(B).state), 'el estado cambió en el viaje').toEqual([]);
  expect(diferencias(sinMomento(A).events, sinMomento(B).events), 'el registro cambió en el viaje').toEqual([]);
  expect(errores, 'errores en el viaje').toEqual([]);
});
