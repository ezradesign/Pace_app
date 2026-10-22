/* PACE · E2E · LAS REUNIONES EN LOS BORDES DEL DÍA (auditoría del 21 oct. 2026)
 * ===========================================================================
 * Cuatro casos de una auditoría externa, comprobados en el código. Contra v0.174.0
 * falla cada uno:
 *
 *  1. «UNA HORA» QUE ACABA HORAS DESPUÉS. Empezando a las 9:00 con una reunión de
 *     9:00 a 12:30, «Una hora» acababa a las 12:35: la reunión entera entraba en el
 *     día y el cierre iba detrás. Igual «Dos horas», la media jornada y la entera.
 *     Ahora la reunión se corta donde acaba el día de la opción, y el cierre no pasa.
 *     Lo único que puede pasar del final sigue siendo el bloque que ya corre en el aro,
 *     y su cierre (ritmo-reloj.spec.js).
 *  2. EMPEZAR EN PLENA COMIDA. Eligiendo la jornada a las 14:00 en punto o a las 14:20,
 *     con la comida de 14:00 a 15:00, no había comida en todo el día (a las 13:55, sí).
 *     Ez eligió el 22 oct. «lo que queda de comida» (la B de
 *     docs/traspaso/archivos/plena-comida-21oct/tabla.md): a las 14:20, comida hasta las
 *     15:00 y el foco desde entonces, como con una reunión empezada; quien ya comió apaga
 *     «comes».
 *  3. «TENER EN CUENTA MIS REUNIONES DE HOY» DESMARCADA. Las horas leídas antes seguían
 *     contando: la línea y lo que se escribía en el calendario las esquivaban.
 *  4. LAS REUNIONES DE AYER, GUARDADAS COMO DE HOY. Una lectura pedida a las 23:59 que
 *     contesta pasada la medianoche se guardaba con la fecha nueva.
 *
 * El reloj va a un jueves en Madrid, como en ritmo-calendario.spec.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const NUEVE = new Date('2026-09-17T09:00:00+02:00');
const FECHA = '2026-09-17';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020, media: { inicio: 540, salida: 780 } };

/* ------------------------------------------------------------------ 1 · el final */
test('el día acaba donde acaba su opción aunque una reunión siga: la tabla y un barrido', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, libre: true } });
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
  const r = await page.evaluate((H) => {
    const pozos = ritmoPozos(getState(), '2026-09-17');
    const dia = (op, ahora, ocupado, prev) => ritmoComponer(op, Object.assign({}, H, { ahora, ocupado }), pozos, {}, 8, prev || null);
    const fin = (m) => ritmoHora(m.hasta);
    const tabla = {
      /* el caso de la auditoría */
      '1h 9:00, reunión 9:00-12:30': fin(dia('1h', 540, [[540, 210]])),
      '1h 9:00, reunión 9:20-12:30': fin(dia('1h', 540, [[560, 190]])),
      '2h 9:00, reunión 9:00-12:30': fin(dia('2h', 540, [[540, 210]])),
      /* la media jornada (9:00 a 13:00) y la entera (hasta las 17:00) */
      'media 12:00, reunión 11:30-14:00': fin(dia('media', 720, [[690, 150]])),
      'jornada 16:35, reunión 16:30-18:00': fin(dia('jornada', 995, [[990, 90]])),
      /* recolocando a mitad de día (el bloque de antes ya hecho), igual */
      'jornada recolocada 16:35, reunión 16:30-18:00': fin(dia('jornada', 995, [[990, 90]],
        { bloques: 7, pausas: 6, foco: 300, comidaHecha: true, usados: [], vasos: 5, claves: 6 })),
    };
    /* lo ocupado que se pinta tampoco pasa del final: el tramo de la reunión llega al cierre */
    const tramos = dia('1h', 540, [[540, 210]]).items.map((it) => it.tipo + '@' + ritmoHora(it.desde) + '+' + it.dur).join(' ');
    /* EL BARRIDO: las cuatro opciones, de 8:00 a 18:00, con una reunión de 10 min a 4 h en
       cualquier hora; ninguna pasa de su final (o de su arranque, si no queda día) */
    const fuera = [];
    ['1h', '2h', 'media', 'jornada'].forEach((op) => {
      for (let ahora = 480; ahora <= 1080; ahora += 10) for (let a = 480; a <= 1080; a += 20) [10, 30, 60, 120, 240].forEach((d) => {
        const m = dia(op, ahora, [[a, d]]);
        const sal = op === 'media' ? H.media.salida : H.salida;
        const arranque = Math.max(op === 'media' ? H.media.inicio : H.inicio, ahora);
        const reloj = op === '1h' ? 60 : op === '2h' ? 120 : 0;
        const tope = reloj ? Math.min(arranque >= sal - 20 ? 1440 : sal, arranque + reloj) : sal;
        if (m.hasta > Math.max(tope, arranque + 5)) fuera.push(op + ' ' + ritmoHora(ahora) + ' reunión ' + ritmoHora(a) + '+' + d + ' acaba ' + ritmoHora(m.hasta));
      });
    });
    /* y recolocando con el bloque en marcha: solo él y su cierre pueden pasar */
    [5, 25, 45].forEach((aro) => ['media', 'jornada'].forEach((op) => [600, 720, 900, 990].forEach((ahora) => [[ahora, 240], [ahora + 10, 240]].forEach((reu) => {
      const prev = { bloques: 1, pausas: 1, foco: 30, usados: [], vasos: 0, claves: 1, primerBloque: aro, bloque: aro };
      const m = dia(op, ahora, [reu], prev);
      const sal = op === 'media' ? H.media.salida : H.salida;
      if (m.hasta > Math.max(sal, ahora + aro + 5)) fuera.push(op + ' recolocada ' + ritmoHora(ahora) + ' aro ' + aro + ' acaba ' + ritmoHora(m.hasta));
    }))));
    return { tabla, tramos, fuera: fuera.length, ejemplos: fuera.slice(0, 5) };
  }, HORARIO);
  expect(r.tabla).toEqual({
    '1h 9:00, reunión 9:00-12:30': '10:00',
    '1h 9:00, reunión 9:20-12:30': '9:20',
    '2h 9:00, reunión 9:00-12:30': '11:00',
    'media 12:00, reunión 11:30-14:00': '13:00',
    'jornada 16:35, reunión 16:30-18:00': '17:00',
    'jornada recolocada 16:35, reunión 16:30-18:00': '17:00',
  });
  expect(r.tramos).toBe('ocupado@9:00+55 cierre@9:55+5');
  expect(r.ejemplos).toEqual([]);
  expect(r.fuera).toBe(0);
});

/* ------------------------------------------------------------------ 2 · la comida */
test('en plena comida, la jornada sirve lo que queda de ella y el foco empieza al acabar (Ez, 22 oct.)', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: HORARIO, libre: true } });
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
  const r = await page.evaluate((H) => {
    const pozos = ritmoPozos(getState(), '2026-09-17');
    const tipos = (ahora, extra, prev) => ritmoComponer('jornada', Object.assign({}, H, { ahora }, extra || {}), pozos, {}, 8, prev || null)
      .items.slice(0, 3).map((it) => it.tipo + '@' + ritmoHora(it.desde) + '+' + it.dur).join(' ');
    const P = (x) => Object.assign({ bloques: 5, pausas: 4, foco: 225, usados: [], vasos: 3, claves: 4 }, x);
    return {
      /* la tabla de Ez: comida de 14:00 a 15:00 */
      '13:55': tipos(835), '14:00': tipos(840), '14:20': tipos(860), '15:30': tipos(930),
      /* quien ya comió apaga «comes»: el foco empieza ya */
      '14:20 no comes': tipos(860, { sinComida: true }),
      /* una reunión dentro de la hora de comer la tapa la comida, como siempre; detrás, sale */
      '14:20 reuniones 14:30 y 15:10': tipos(860, { ocupado: [[870, 20], [910, 20]] }),
      /* sin comida, una reunión a esa hora es una reunión y el foco no la pisa */
      '14:20 no comes, reunión 14:30': tipos(860, { sinComida: true, ocupado: [[870, 20]] }),
      /* recolocando: la pausa que toca a las 14:30 es lo que queda de comida; un bloque de
         25 empezado a las 14:10 la deja para cuando acabe; uno de 45 a las 14:20 se la come
         entera, y detrás va su pausa */
      'recolocado, pausa a las 14:30': tipos(870, null, P({ pausaPendiente: true })),
      'recolocado, bloque de 25 a las 14:10': tipos(850, null, P({ primerBloque: 25, bloque: 25 })),
      'recolocado, bloque de 45 a las 14:20': tipos(860, null, P({ primerBloque: 45 })),
      /* y el bloque que cruza la hora de comer sigue comiendo entero al acabar (s194) */
      'recolocado, bloque de 45 a las 13:40': tipos(820, null, P({ primerBloque: 45 })),
    };
  }, HORARIO);
  expect(r).toEqual({
    '13:55': 'libre@13:55+5 comida@14:00+60 foco@15:00+45',
    '14:00': 'comida@14:00+60 foco@15:00+45 pausa@15:45+5',
    '14:20': 'comida@14:20+40 foco@15:00+45 pausa@15:45+5',
    '15:30': 'foco@15:30+45 pausa@16:15+5 foco@16:20+35',
    '14:20 no comes': 'foco@14:20+45 pausa@15:05+5 foco@15:10+45',
    '14:20 reuniones 14:30 y 15:10': 'comida@14:20+40 libre@15:00+10 ocupado@15:10+20',
    '14:20 no comes, reunión 14:30': 'libre@14:20+10 ocupado@14:30+20 foco@14:50+45',
    'recolocado, pausa a las 14:30': 'comida@14:30+30 foco@15:00+45 pausa@15:45+5',
    'recolocado, bloque de 25 a las 14:10': 'foco@14:10+25 comida@14:35+25 foco@15:00+25',
    'recolocado, bloque de 45 a las 14:20': 'foco@14:20+45 pausa@15:05+5 foco@15:10+45',
    'recolocado, bloque de 45 a las 13:40': 'foco@13:40+45 comida@14:25+60 foco@15:25+45',
  });
});

/* ------------------------------------------------------------------ Android, para 3 y 4 */
/* Un CapacitorCalendar espía con un calendario dentro. Con `retener`, la lectura de
   reuniones no contesta hasta `window.__soltar()`, para que pase la medianoche en medio. */
async function comoAndroid(context, eventos, retener) {
  await context.addInitScript(([eventos, retener]) => {
    const nativo = window.__nativo = { llamadas: [], eventos: eventos.slice(), siguiente: 100 };
    const apunta = (metodo, contesta) => function (opts) {
      nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
      return Promise.resolve(contesta(opts));
    };
    const lista = (op) => ({ result: nativo.eventos.filter((e) => e.startDate < op.to && e.endDate > op.from) });
    window.Capacitor = {
      getPlatform: () => 'android', isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
        LocalNotifications: { checkPermissions: () => Promise.resolve({ display: 'granted' }) },
        CapacitorCalendar: {
          requestFullCalendarAccess: apunta('requestFullCalendarAccess', () => ({ result: 'granted' })),
          checkAllPermissions: apunta('checkAllPermissions', () => ({ result: { readCalendar: 'granted', writeCalendar: 'granted' } })),
          listCalendars: apunta('listCalendars', () => ({ result: [{ id: '1', title: 'Personal', accountName: 'e@gmail.com', allowsContentModifications: true, visible: true }] })),
          getDefaultCalendar: apunta('getDefaultCalendar', () => ({ result: { id: '1' } })),
          listEventsInRange: retener
            ? (op) => { nativo.llamadas.push({ metodo: 'listEventsInRange', opts: op }); return new Promise((ok) => { window.__soltar = () => ok(lista(op)); }); }
            : apunta('listEventsInRange', lista),
          createEvent: apunta('createEvent', (op) => { const id = String(nativo.siguiente++); nativo.eventos.push(Object.assign({ id, isAllDay: false, status: 'confirmed' }, op)); return { id }; }),
          deleteEvent: apunta('deleteEvent', (op) => { nativo.eventos = nativo.eventos.filter((e) => e.id !== op.id); }),
        },
      },
    };
  }, [eventos, !!retener]);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const ms = (fecha, hhmm) => Date.parse(fecha + 'T' + hhmm + ':00+02:00');
const reunion = (fecha) => ({ id: 'r1', title: 'Equipo', startDate: ms(fecha, '12:00'), endDate: ms(fecha, '12:30'), isAllDay: false, availability: 0, status: 'confirmed', description: '' });
const ocupados = (page) => page.evaluate(() => ritmoPlan(getState()).m.items.filter((it) => it.tipo === 'ocupado').map((it) => ritmoHora(it.desde) + '+' + it.dur));

/* ------------------------------------------------------------------ 3 · la casilla */
test.describe('en Android', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  test('con «Tener en cuenta mis reuniones de hoy» desmarcada, el día y el calendario no las esquivan', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await comoAndroid(context, [reunion(FECHA)]);
    /* las horas leídas antes, con la casilla marcada */
    await sembrar(context, { sidebarCollapsed: true, ritmo: { dia: JORNADA,
      ocupado: { fecha: FECHA, tramos: [[720, 30]], fuente: 'android' }, calendario: { destino: 'android', reuniones: true } } });
    await page.clock.install({ time: NUEVE });
    await irAlArtefacto(page);
    expect(await ocupados(page)).toEqual(['12:00+30']);

    await vis(page, '[data-pace-ritmo-ver]').click();
    await vis(page, '[data-pace-ritmo-lista]').waitFor();
    await vis(page, '[data-pace-ritmo-calendario]').click();
    const hoja = page.locator('[data-pace-cal]');
    await hoja.locator('[data-pace-cal-mantener]').uncheck();
    await hoja.locator('[data-pace-cal-reuniones]').uncheck();
    /* las lecturas del día entero (desde medianoche); borrar lo de PACE lista desde ahora */
    const lecturas = () => page.evaluate((desde) => window.__nativo.llamadas.filter((l) => l.metodo === 'listEventsInRange' && l.opts.from === desde).length, ms(FECHA, '00:00'));
    const leidas = await lecturas();
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('bloques en tu calendario');
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).not.toContainText('reuni');
    /* no se leen y no cuentan: lo escrito ocupa también la hora de la reunión */
    expect(await lecturas()).toBe(leidas);
    const creados = await page.evaluate(() => window.__nativo.llamadas.filter((l) => l.metodo === 'createEvent').map((l) => l.opts));
    expect(creados.some((c) => c.startDate < ms(FECHA, '12:30') && c.endDate > ms(FECHA, '12:00')), 'un bloque a la hora de la reunión').toBe(true);
    expect(await ocupados(page)).toEqual([]);
    /* las horas no se borran: con la casilla otra vez marcada, cuentan */
    const estado = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo);
    expect(estado.calendario).toMatchObject({ destino: 'android', reuniones: false });
    expect(estado.ocupado).toEqual({ fecha: FECHA, tramos: [[720, 30]], fuente: 'android' });
    await page.evaluate(() => calendarioGuardarAjustes({ reuniones: true }));
    expect(await ocupados(page)).toEqual(['12:00+30']);
    expect(errores).toEqual([]);
  });

  /* ------------------------------------------------------------------ 4 · la medianoche */
  test('una lectura pedida antes de medianoche que contesta después no se guarda como de hoy', async ({ page, context }) => {
    const errores = capturarErrores(page);
    const AYER = '2026-09-16';
    await comoAndroid(context, [reunion(AYER)], true);
    await sembrar(context, { sidebarCollapsed: true, ritmo: { dia: Object.assign({}, JORNADA, { fecha: AYER }),
      calendario: { destino: 'android', reuniones: true } } });
    await page.clock.install({ time: new Date(AYER + 'T23:59:00+02:00') });
    await irAlArtefacto(page);
    /* al abrir, PACE vuelve a leer las reuniones (ritmo.calendario.destinos.js): la del día 16 */
    await page.clock.runFor(2000);
    await expect.poll(() => page.evaluate(() => typeof window.__soltar)).toBe('function');
    const pedido = await page.evaluate(() => window.__nativo.llamadas.find((l) => l.metodo === 'listEventsInRange').opts);
    expect(pedido.from).toBe(ms(AYER, '00:00'));
    /* pasa la medianoche y la respuesta llega el 17 */
    await page.clock.runFor(90 * 1000);
    expect(await page.evaluate(() => ritmoHoy())).toBe(FECHA);
    await page.evaluate(() => window.__soltar());
    await page.clock.runFor(1000);
    const ocupado = await page.evaluate(() => (JSON.parse(localStorage.getItem('pace.state.v2')).ritmo || {}).ocupado || null);
    expect(ocupado, 'la reunión de ayer a las 12:00 no cuenta hoy').toBeNull();
    /* y una lectura del mismo día sí se guarda */
    expect(await page.evaluate(() => calendarioGuardarOcupado([[720, 30]], 'android', '2026-09-16'))).toBe(false);
    expect(await page.evaluate(() => calendarioGuardarOcupado([[720, 30]], 'android', ritmoHoy()))).toBe(true);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo.ocupado)).toEqual({ fecha: FECHA, tramos: [[720, 30]], fuente: 'android' });
    expect(errores).toEqual([]);
  });
});
