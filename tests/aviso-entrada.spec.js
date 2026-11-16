/* PACE · E2E · EL AVISO A TU HORA DE ENTRADA (Ez, 1A y 2A del 15 nov. 2026)
 * ======================================================================
 * Un aviso por la mañana, a tu hora de entrada, para quien lo encienda en «Tu semana», en
 * Android y en el iPhone (ui/nativo.entrada.js). Apagado de fábrica; solo los días de jornada
 * o media de la semana guardada; con las palabras de la tarjeta de la mañana («Hoy, como cada
 * jueves» · «Jornada de 9:00 a 17:00. Tu día ya está preparado.»). Se ponen siempre los de los
 * siete días siguientes, desde mañana: si hoy abriste PACE antes de tu hora, el de hoy no sale.
 * Maqueta elegida: docs/proposals/maquetas-uso-15nov/.
 *
 * Aquí se mira lo que PACE le pide al complemento de avisos (un Android de mentira, como en
 * android-avisos.spec.js); que suene en un móvil de verdad, no: pasos en la página.
 * Mutantes: con el bucle empezando en hoy, cae «abierto antes de la hora»; sin mirar el tipo del
 * día, cae la primera (avisaría en sábado y domingo); sin mirar `avisoEntrada`, cae «apagado».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, aceptarAvisosPace, abrirTusDatos, CLAVE_ESTADO } = require('./helpers');

const SEMANA = ['jornada', 'jornada', 'jornada', 'jornada', 'media', 'libre', 'libre'];
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

async function comoAndroid(context) {
  await context.addInitScript(() => {
    /* `oyentes`: para mandar PACE al fondo como lo haría Android (`alFondo`). `cancelFalla`: cuántos
       `cancel` del aviso de entrada fallan (lo siembra `window.__cancelFalla`, que va antes). */
    const nativo = window.__nativo = { llamadas: [], oyentes: {}, cancelFalla: window.__cancelFalla || 0 };
    const apunta = (metodo, opts) => {
      nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
      /* Lo del aviso de entrada también a la prueba, que lo oye a través de las recargas (`oirEntrada`). */
      const ids = ((opts && opts.notifications) || []).map((n) => n.id).filter((id) => id >= 10);
      if (typeof window.__apuntaNodo === 'function' && ids.length) window.__apuntaNodo(metodo + ' ' + ids.join(','));
    };
    window.Capacitor = {
      getPlatform: () => 'android',
      isNativePlatform: () => true,
      Plugins: {
        App: {
          addListener: (ev, cb) => { (nativo.oyentes[ev] = nativo.oyentes[ev] || []).push(cb); return { remove() {} }; },
          minimizeApp: () => Promise.resolve(),
        },
        LocalNotifications: {
          checkPermissions: () => Promise.resolve({ display: 'granted' }),
          requestPermissions: (op) => { apunta('requestPermissions', op); return Promise.resolve({ display: 'granted' }); },
          checkExactNotificationSetting: () => Promise.resolve({ exact_alarm: 'granted' }),
          changeExactNotificationSetting: () => Promise.resolve({ exact_alarm: 'granted' }),
          createChannel: (op) => { apunta('createChannel', op); return Promise.resolve(); },
          schedule: (op) => { apunta('schedule', op); return Promise.resolve({ notifications: op.notifications.map((n) => ({ id: n.id })) }); },
          cancel: (op) => {
            apunta('cancel', op);
            if (nativo.cancelFalla > 0 && op.notifications.some((n) => n.id >= 10)) { nativo.cancelFalla--; return Promise.reject(new Error('cancel')); }
            return Promise.resolve();
          },
        },
        PaceAvisoFijo: { poner: () => Promise.resolve(), quitar: () => Promise.resolve() },
      },
    };
  });
}

/* Los avisos que no son de fin de Foco, del aviso fijo ni de fin de pausa (ids 1, 2 y 3) que PACE
   pidió la última vez, o [] si no pidió ninguno. Se miran todos y no solo del 10 al 16: un aviso de
   más con otro id también tiene que verse. */
const OTROS = [1, 2, 3];
async function avisosPuestos(page) {
  await page.waitForTimeout(400);
  const llamadas = await page.evaluate(() => window.__nativo.llamadas);
  const puestos = llamadas.filter((l) => l.metodo === 'schedule')
    .map((l) => l.opts.notifications.filter((n) => OTROS.indexOf(n.id) === -1))
    .filter((lista) => lista.length);
  return puestos.length ? puestos[puestos.length - 1] : [];
}

/* Lo que PACE pidió para los ids del aviso de entrada (del 10 al 16), en orden: «schedule 10,11» o
   «cancel 12,13». */
const ENTRADA = (id) => id >= 10 && id <= 16;
async function llamadasEntrada(page) {
  await page.waitForTimeout(400);
  const llamadas = await page.evaluate(() => window.__nativo.llamadas);
  return llamadas.filter((l) => (l.metodo === 'schedule' || l.metodo === 'cancel') && l.opts.notifications.some((n) => ENTRADA(n.id)))
    .map((l) => l.metodo + ' ' + l.opts.notifications.map((n) => n.id).join(','));
}

/* PACE se va al fondo, como cuando Android lo avisa (`appStateChange`). */
const alFondo = (page) => page.evaluate(() => (window.__nativo.oyentes.appStateChange || []).forEach((cb) => cb({ isActive: false })));
const olvidarLlamadas = (page) => page.evaluate(() => { window.__nativo.llamadas = []; });

async function abrir(page, context, ritmo, cuando) {
  await sembrar(context, { soundOn: false, ritmo });
  await comoAndroid(context);
  await page.clock.install({ time: cuando });
  await irAlArtefacto(page);
}

const local = (iso) => { const d = new Date(iso); return [d.getDate(), d.getHours(), d.getMinutes()]; };

test('encendido: los días de jornada y media de la semana que sigue, desde mañana, con las palabras de la mañana', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO, avisoEntrada: true }, new Date('2026-11-18T20:00:00+01:00'));
  const avisos = await avisosPuestos(page);
  /* Del jueves 19 al miércoles 25: jueves, viernes (media), lunes, martes y miércoles. */
  expect(avisos.map((a) => local(a.schedule.at)), 'no son los días y la hora de entrada').toEqual([
    [19, 9, 0], [20, 9, 0], [23, 9, 0], [24, 9, 0], [25, 9, 0],
  ]);
  expect(avisos[0].title).toBe('Hoy, como cada jueves');
  expect(avisos[0].body).toBe('Jornada de 9:00 a 17:00. Tu día ya está preparado.');
  expect(avisos[1].title).toBe('Hoy, como cada viernes');
  expect(avisos[1].body).toMatch(/^Media jornada de 9:00 a \d+:\d\d\. Tu día ya está preparado\.$/);
  expect(avisos.map((a) => a.id)).toEqual([10, 11, 14, 15, 16]);
  expect(avisos[0].channelId).toBe('pace_entrada');
  expect(avisos[0].schedule.allowWhileIdle).toBe(true);
  for (const a of avisos) expect(a.body + a.title, 'el aviso no puede reprochar nada').not.toMatch(/echamos|racha|seguidos/i);
});

test('abierto antes de la hora, el de hoy no sale', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO, avisoEntrada: true }, new Date('2026-11-19T08:30:00+01:00'));
  const avisos = await avisosPuestos(page);
  expect(avisos.length, 'GUARD: no puso ninguno').toBeGreaterThan(0);
  expect(local(avisos[0].schedule.at), 'el primero tiene que ser el del viernes').toEqual([20, 9, 0]);
});

/* Novena pasada externa, nº 3 y 12: se quitaban los siete y se ponían tres pasos después, también
   al irse al fondo; si Android congelaba PACE en medio, la mañana se quedaba sin aviso. */
test('nº 3 · primero programa la lista y después quita solo los ids que sobran', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO, avisoEntrada: true }, new Date('2026-11-18T20:00:00+01:00'));
  /* Del jueves 19 al miércoles 25: el sábado y el domingo (12 y 13) sobran. */
  expect(await llamadasEntrada(page)).toEqual(['schedule 10,11,14,15,16', 'cancel 12,13']);
});

test('nº 3 · al irse al fondo sin nada que cambiar, no toca los avisos; con la semana cambiada, programa antes de quitar', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO, avisoEntrada: true }, new Date('2026-11-18T20:00:00+01:00'));
  expect((await llamadasEntrada(page)).length, 'GUARD: al abrir no puso nada').toBeGreaterThan(0);
  await olvidarLlamadas(page);
  await alFondo(page);
  expect(await llamadasEntrada(page), 'al irse al fondo volvió a tocar unos avisos que no cambiaron').toEqual([]);
  /* El viernes pasa a libre: se pone la lista nueva y se quita el viernes (11), en ese orden. */
  await page.evaluate(() => setState((s) => Object.assign({}, s, { ritmo: Object.assign({}, s.ritmo,
    { semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre', 'libre'] }) })));
  await alFondo(page);
  expect(await llamadasEntrada(page)).toEqual(['schedule 10,14,15,16', 'cancel 11,12,13']);
});

test('nº 12 · si quitar falla, se vuelve a intentar la vez siguiente', async ({ page, context }) => {
  await context.addInitScript(() => { window.__cancelFalla = 1; });
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO, avisoEntrada: true }, new Date('2026-11-18T20:00:00+01:00'));
  expect(await llamadasEntrada(page), 'GUARD').toEqual(['schedule 10,11,14,15,16', 'cancel 12,13']);
  await olvidarLlamadas(page);
  await alFondo(page);
  expect(await llamadasEntrada(page), 'el sábado y el domingo pueden seguir puestos y no se reintentó').toEqual(['schedule 10,11,14,15,16', 'cancel 12,13']);
});

/* Novena pasada externa, nº 4: tras «Borrar todo» o importar una copia sin `avisoEntrada`, PACE
   no tocaba nada al recargar y los avisos ya puestos seguían saliendo una semana. */
const TODOS = 'cancel 10,11,12,13,14,15,16';
async function oirEntrada(page) {
  const oido = [];
  await page.exposeFunction('__apuntaNodo', (linea) => { oido.push(linea); });
  return oido;
}
/* Una sola vez: tras «Borrar todo» falta la clave y `sembrar` la volvería a escribir. */
async function sembrarUnaVez(context, ritmo) {
  await context.addInitScript(([clave, estado]) => {
    if (localStorage.getItem('__sembrado')) return;
    localStorage.setItem('__sembrado', '1');
    localStorage.setItem(clave, JSON.stringify(estado));
  }, [CLAVE_ESTADO, { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', soundOn: false, ritmo }]);
}
const despuesDe = (oido, i) => oido.slice(i);

test('nº 4 · «Borrar todo» quita los siete avisos de entrada antes de recargar', async ({ page, context }) => {
  const oido = await oirEntrada(page);
  await sembrarUnaVez(context, { semanaTipo: SEMANA, horario: HORARIO, avisoEntrada: true });
  await comoAndroid(context);
  await page.clock.install({ time: new Date('2026-11-18T20:00:00+01:00') });
  await irAlArtefacto(page);
  await expect.poll(() => oido.join(' | '), { message: 'GUARD: al abrir no puso los avisos' }).toContain('schedule 10,11,14,15,16');
  const desde = oido.length;
  await aceptarAvisosPace(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  const recarga = page.waitForEvent('load');
  await page.getByRole('button', { name: 'Borrar todos mis datos' }).click();
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'attached' });
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => (getState().ritmo || {}).avisoEntrada), 'GUARD: no se borró').toBeUndefined();
  expect(despuesDe(oido, desde), 'los avisos de entrada siguen puestos tras borrar').toContain(TODOS);
  expect(despuesDe(oido, desde).filter((l) => l.indexOf('schedule') === 0), 'tras borrar volvió a poner avisos').toEqual([]);
});

test('nº 4 · importar una copia sin el aviso quita los siete', async ({ page, context }) => {
  const oido = await oirEntrada(page);
  await sembrarUnaVez(context, { semanaTipo: SEMANA, horario: HORARIO, avisoEntrada: true });
  await comoAndroid(context);
  await page.clock.install({ time: new Date('2026-11-18T20:00:00+01:00') });
  await irAlArtefacto(page);
  await expect.poll(() => oido.join(' | '), { message: 'GUARD: al abrir no puso los avisos' }).toContain('schedule 10,11,14,15,16');
  const desde = oido.length;
  await aceptarAvisosPace(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  const recarga = page.waitForEvent('load');
  await page.locator('input[type="file"][data-pace-traer-copia]').setInputFiles({
    name: 'pace-backup-20261116.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'PACE', state: { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, totalFocusMin: 42 } })),
  });
  await recarga;
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => getState().totalFocusMin), 'GUARD: la copia no entró').toBe(42);
  expect(despuesDe(oido, desde), 'los avisos de entrada siguen puestos tras importar').toContain(TODOS);
  expect(despuesDe(oido, desde).filter((l) => l.indexOf('schedule') === 0), 'tras importar volvió a poner avisos').toEqual([]);
});

test('nº 4 · sin `avisoEntrada` pero con avisos puestos según lo guardado, los quita al abrir', async ({ page, context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('pace.entrada.puesto', JSON.stringify({ firma: '[{"id":10}]', ids: [10, 11] }));
  });
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO }, new Date('2026-11-18T20:00:00+01:00'));
  expect(await llamadasEntrada(page)).toEqual([TODOS]);
});

test('apagado de fábrica: no pone ninguno', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO }, new Date('2026-11-18T20:00:00+01:00'));
  expect(await avisosPuestos(page)).toEqual([]);
});

test('sin semana guardada, nada aunque esté encendido', async ({ page, context }) => {
  await abrir(page, context, { horario: HORARIO, avisoEntrada: true }, new Date('2026-11-18T20:00:00+01:00'));
  expect(await avisosPuestos(page)).toEqual([]);
});

test('en Android, «Tu semana» trae el interruptor, cabe a 360 × 640 y al guardarlo encendido pone los avisos', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO }, new Date('2026-11-18T20:00:00+01:00'));
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:ritmo-semana')));
  const hoja = page.locator('[data-pace-semana-hoja]');
  await expect(hoja).toBeVisible();
  const sw = hoja.locator('[data-pace-semana-aviso] [role="switch"]');
  await expect(sw, 'apagado de fábrica').toHaveAttribute('aria-checked', 'false');
  await expect(hoja.locator('[data-pace-semana-aviso]')).toContainText('Avísame a mi hora de entrada');
  await page.waitForTimeout(400);
  const cabe = await page.evaluate(() => {
    const m = document.querySelector('[data-pace-semana-hoja]').closest('[role="dialog"]');
    const r = m.getBoundingClientRect();
    return { scroll: m.scrollHeight - m.clientHeight, fuera: r.top < 0 || r.bottom > innerHeight };
  });
  expect(cabe.scroll, '«Tu semana» pide scroll con el interruptor').toBeLessThanOrEqual(0);
  expect(cabe.fuera, '«Tu semana» se sale de la pantalla').toBe(false);
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await hoja.locator('[data-pace-semana-guardar]').click();
  await expect(hoja).toHaveCount(0);
  expect(await page.evaluate(() => getState().ritmo.avisoEntrada)).toBe(true);
  const avisos = await avisosPuestos(page);
  expect(avisos.length, 'al encenderlo no puso los avisos').toBe(5);
});

test('en la web no hay interruptor: sin servidor no puede avisar con PACE cerrado', async ({ page, context }) => {
  await sembrar(context, { ritmo: { semanaTipo: SEMANA, horario: HORARIO } });
  await irAlArtefacto(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:ritmo-semana')));
  await expect(page.locator('[data-pace-semana-hoja]')).toBeVisible();
  await expect(page.locator('[data-pace-semana-aviso]')).toHaveCount(0);
});
