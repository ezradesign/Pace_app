/* PACE · E2E · LA PAUSA QUE PROPONE (s187)
 * ========================================
 * Al terminar un Pomodoro la app sabia cuanto llevabas sentado y no lo usaba:
 * ofrecia cuatro modulos y te dejaba elegir entre 17 rutinas. Ahora propone UNA,
 * con nombre y con el porque.
 *
 * EL ASERTO QUE MANDA ES EL DE LA ALTURA. Antes de implementar se midio que el
 * modal ocupa 616 px FIJOS en los cuatro telefonos y que a 360x640 solo le
 * sobran 24, asi que la propuesta no podia sumar alto: entra en el sitio que
 * dejan el tag «Para ti» y las descripciones de las cuatro tarjetas. Si alguien
 * devuelve esas descripciones, el modal crece y el test se pone rojo.
 *
 * LA REGLA SE PRUEBA APARTE Y EN PURO (`breakPropuesta`), con estados
 * sintetizados: es una funcion sin DOM y probar su orden de prioridades pulsando
 * botones seria lento y ciego.
 *
 * TRAMPAS QUE VIVEN AQUI:
 *  · El menu NO es `[role="dialog"]`: se localiza por `[data-pace-break-shortcut]`.
 *  · Un `fastForward` grande NO lo abre -- el tick que cruza el cero no llega a
 *    dispararse. De minuto en minuto (medido en s187).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { irAlArtefacto } = require('./helpers');

/* Siembra un estado ANTES de cargar: el menu lee `focusMinutes`, `cycle`, el
   plan y el agua, y todos vienen de `pace.state.v2`. */
const sembrarEstado = (context, extra) => context.addInitScript((e) => {
  /* `lastActiveDay` ES OBLIGATORIO, y costo dos pasadas: sin el, el relevo de
     dia de `loadState` da el estado por viejo y pone el plan y el agua a cero
     -- justo los dos campos que esta regla lee. Y va en el formato de
     `toDateString()` («Mon Sep 07 2026»), NO en ISO: la comparacion del relevo
     es una igualdad de cadenas, asi que un ISO no coincide nunca y el estado
     sembrado se resetea igual. Se descubrio leyendo el estado ya cargado. */
  const hoy = new Date().toDateString();
  /* Y ESCRIBE SOLO SI FALTA, como `sembrar` en los helpers: este guion corre en
     CADA navegacion, asi que sobrescribiendo siempre pisaria el estado que un
     test prepara a mano antes de recargar -- que es justo lo que hace el aserto
     de la altura para conseguir un menu SIN propuesta. */
  if (localStorage.getItem('pace.state.v2')) return;
  localStorage.setItem('pace.state.v2', JSON.stringify(Object.assign(
    { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', lastActiveDay: hoy }, e)));
}, extra);

/* `cta` (s189) existe por el aserto en INGLES: el boton de la home se llama
   «Start focus» con la app en ingles, asi que un nombre fijo en castellano no
   lo encuentra y el test moria antes de llegar a la pausa. */
async function hastaLaPausa(page, minutos, cta) {
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: cta || 'Empezar foco', exact: true }).click();
  await page.waitForTimeout(250);
  for (let i = 0; i < (minutos || 25) + 4; i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
    if (await page.locator('[data-pace-break-shortcut]').count()) break;
  }
  await page.waitForTimeout(700);
  await expect(page.locator('[data-pace-break-shortcut]'), 'no se abrio el menu de pausa').toHaveCount(1);
}

/* Alto del modal: se sube desde el pie hasta el primer ancestro con cuerpo. */
const altoDelModal = (page) => page.evaluate(() => {
  const pie = document.querySelector('[data-pace-break-shortcut]');
  if (!pie) return null;
  let caja = pie.parentElement;
  while (caja && caja.getBoundingClientRect().height < 220) caja = caja.parentElement;
  return caja ? Math.round(caja.getBoundingClientRect().height) : null;
});

/* ------------------------------------------------------------------ 1 */
test('tras un bloque largo propone una rutina, con nombre y con el porque', async ({ page, context }) => {
  await sembrarEstado(context, { focusMinutes: 45 });
  await hastaLaPausa(page, 45);

  const prop = page.locator('[data-pace-break-prop]');
  await expect(prop, 'no hay propuesta tras 45 minutos sentado').toHaveCount(1);
  await expect(prop, 'no dice el porque').toContainText('Llevas 45 minutos sentado');
  await expect(prop, 'no dice de que modulo es').toContainText('Estira');
  await expect(prop.getByRole('button', { name: 'Empezar' })).toBeVisible();

  /* Y NOMBRA una rutina: sin nombre esto seria la tarjeta de siempre con otra
     letra. El nombre sale del catalogo, asi que no se compara con una cadena
     fija -- se exige que haya algo mas que el porque y la meta. */
  const texto = (await prop.innerText()).trim().split('\n').filter(Boolean);
  expect(texto.length, 'la propuesta no nombra ninguna rutina').toBeGreaterThanOrEqual(4);
});

/* ------------------------------------------------------------------ 2 */
test('la propuesta NO hace crecer el modal · 360x640', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrarEstado(context, { focusMinutes: 45 });
  await hastaLaPausa(page, 45);
  const conProp = await altoDelModal(page);
  expect(await page.locator('[data-pace-break-prop]').count(), 'GUARD: no hay propuesta que medir').toBe(1);

  /* El mismo menu SIN propuesta: todo el plan hecho, agua llena y bloque corto.
     Es el estado en el que la regla devuelve `null` a proposito. */
  const page2 = await page.context().newPage();
  await page2.clock.install();
  await irAlArtefacto(page2);
  await page2.setViewportSize({ width: 360, height: 640 });
  await page2.evaluate(() => {
    const hoy = new Date().toDateString();
    const s = JSON.parse(localStorage.getItem('pace.state.v2') || '{}');
    s.focusMinutes = 15;
    s.lastActiveDay = hoy;
    s.plan = { muevete: true, respira: true, extra: true, hidratate: true };
    s.water = { goal: 8, today: 8, lastReset: hoy };
    localStorage.setItem('pace.state.v2', JSON.stringify(s));
  });
  await page2.reload();
  await page2.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page2.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await page2.waitForTimeout(250);
  for (let i = 0; i < 20; i++) {
    await page2.clock.fastForward(60 * 1000); await page2.waitForTimeout(60);
    if (await page2.locator('[data-pace-break-shortcut]').count()) break;
  }
  await page2.waitForTimeout(700);
  const sinProp = await altoDelModal(page2);

  expect(sinProp, 'GUARD: no se pudo medir el menu sin propuesta').toBeGreaterThan(300);
  expect(conProp, 'la propuesta hace crecer el modal: en un telefono de 640 no cabe')
    .toBeLessThanOrEqual(sinProp);
});

/* ------------------------------------------------------------------ 3 */
test('con propuesta no hay ademas un «Para ti»', async ({ page, context }) => {
  await sembrarEstado(context, { focusMinutes: 45 });
  await hastaLaPausa(page, 45);
  await expect(page.locator('[data-pace-break-prop]')).toHaveCount(1);
  /* Dos recomendaciones a la vez en el mismo modal se contradicen, y ademas ese
     hueco reservado (s139) es parte del sitio que la propuesta ocupa. */
  await expect(page.getByText('Para ti', { exact: true }),
    'la propuesta y el sello «Para ti» conviven: son dos recomendaciones').toHaveCount(0);
});

/* ------------------------------------------------------------------ 4 */
test('«Empezar» entra en ESA rutina, no en su biblioteca', async ({ page, context }) => {
  await sembrarEstado(context, { focusMinutes: 45 });
  await hastaLaPausa(page, 45);

  const prop = page.locator('[data-pace-break-prop]');
  const lineas = (await prop.innerText()).trim().split('\n').filter(Boolean);
  const nombre = lineas[1];
  await prop.getByRole('button', { name: 'Empezar' }).click();
  await page.waitForTimeout(700);

  /* Se entra por la puerta de siempre -- el preview de §18.3-, asi que lo que
     tiene que aparecer es esa rutina y no la rejilla de la biblioteca. */
  await expect(page.getByText(nombre).first(), 'no se abrio la rutina propuesta').toBeVisible();
  expect(await page.locator('.pace-lib-rejilla').count(),
    'se abrio la BIBLIOTECA en vez de la rutina: la propuesta vuelve a preguntar').toBe(0);
});

/* ------------------------------------------------------------------ 5 */
test('sin motivo no hay propuesta, y eso es correcto', async ({ page, context }) => {
  await sembrarEstado(context, {
    focusMinutes: 15,
    plan: { muevete: true, respira: true, extra: true, hidratate: true },
    water: { goal: 8, today: 8, lastReset: new Date().toDateString() },
  });
  await hastaLaPausa(page, 15);
  expect(await page.locator('[data-pace-break-prop]').count(),
    'propone algo sin ninguna condicion que lo justifique').toBe(0);
  /* Y el menu vuelve a ser el de siempre: sus tarjetas conservan la linea que
     la version compacta quita. Ojo -- NO se puede asertar «Para ti» aqui: con
     todo el plan hecho todos los scores valen 0, asi que tampoco hay sello.
     Ese fue el primer aserto que escribi y era falso. */
  await expect(page.getByText('Ya hecho hoy', { exact: false }).first(),
    'las tarjetas han perdido su linea sin haber propuesta que lo justifique').toBeVisible();
});

/* ------------------------------------------------------------------ 6 */
test('la regla es pura: el orden manda y la apnea nunca se propone', async ({ page, context }) => {
  await sembrarEstado(context, {});
  await irAlArtefacto(page);

  const r = await page.evaluate(() => {
    const base = { water: { today: 0, goal: 8 }, plan: {}, cycle: 1, focusMinutes: 25 };
    const p = (extra, ctx) => {
      const out = window.breakPropuesta(Object.assign({}, base, extra), ctx || { iso: '2026-09-07', hora: 15 });
      return out ? { modulo: out.modulo, porque: out.porque, id: out.rutina && out.rutina.id, safety: !!(out.rutina && out.rutina.safety) } : null;
    };
    return {
      sentado: p({ focusMinutes: 45 }),
      agua: p({ focusMinutes: 25 }),
      aguaTemprano: p({ focusMinutes: 25 }, { iso: '2026-09-07', hora: 9 }),
      tercero: p({ focusMinutes: 25, cycle: 3, water: { today: 3, goal: 8 } }),
      pendiente: p({ focusMinutes: 25, cycle: 1, water: { today: 3, goal: 8 }, plan: { extra: true } }),
      nada: p({ focusMinutes: 15, cycle: 1, water: { today: 3, goal: 8 },
                plan: { extra: true, muevete: true, respira: true } }),
    };
  });

  /* 1 · lo que acaba de pasar gana a todo lo demas, incluso con cero vasos. */
  expect(r.sentado && r.sentado.porque).toBe('sitting');
  expect(r.sentado.modulo, 'un bloque largo no propone Estira').toBe('extra');
  /* 2 · el agua, pero solo a partir del mediodia. */
  expect(r.agua && r.agua.porque).toBe('water');
  expect(r.aguaTemprano && r.aguaTemprano.porque,
    'a las nueve de la manana «aun no has bebido» no es un motivo').not.toBe('water');
  /* 3 y 4 · el tercer bloque, y luego el plan pendiente. */
  expect(r.tercero && r.tercero.porque).toBe('third');
  expect(r.pendiente && r.pendiente.porque).toBe('pending.move');
  /* 5 · sin motivo, nada. */
  expect(r.nada, 'propone algo sin motivo').toBeNull();
  /* Y NUNCA una rutina con aviso: una apnea no se propone sola al salir de un
     bloque de trabajo.

     SE COMPRUEBA EN 30 DIAS, no en uno, y eso es lo que convierte el aserto en
     una prueba: `libraryParaAhora` ROTA por dia, asi que mirando una sola fecha
     el filtro de seguridad puede pasar por casualidad -- lo destapo el banco de
     mutaciones, donde quitar el filtro NO ponia rojo nada. Las rutinas con aviso
     estan en Respira, asi que el caso que las puede sacar es el del tercer
     bloque. */
  const apneas = await page.evaluate(() => {
    const base = { water: { today: 3, goal: 8 }, plan: {}, cycle: 3, focusMinutes: 25 };
    const malas = [];
    for (let d = 1; d <= 30; d++) {
      const iso = '2026-09-' + String(d).padStart(2, '0');
      const out = window.breakPropuesta(base, { iso: iso, hora: 15 });
      if (out && out.rutina && out.rutina.safety) malas.push(iso + ' · ' + out.rutina.id);
    }
    return malas;
  });
  expect(apneas, 'propone rutinas con aviso de seguridad en algun dia del mes').toEqual([]);
});

/* ------------------------------------------------------------------ 7
 * s189 · EL FEEDBACK QUE NADIE LEIA
 * =================================
 * Se prueba en PURO y con los catalogos del artefacto: la regla es una funcion
 * y su entrada es un slice de `routineFeedback` sintetizado. Recorrer 12 dias
 * de pausas pulsando botones seria lento y no mediria nada mas.
 *
 * EL ASERTO NO ESCRIBE NINGUN ID A MANO. Se pregunta a la regla que propone,
 * se le contesta «No» a ESA rutina y se vuelve a preguntar: la comparacion es
 * entre dos respuestas del producto, no contra una cadena que envejece al
 * primer cambio de catalogo. */
test('un «No» saca esa rutina de la propuesta, y un «Si» la protege', async ({ page, context }) => {
  await sembrarEstado(context, {});
  await irAlArtefacto(page);

  const r = await page.evaluate(() => {
    const base = { focusMinutes: 45, cycle: 1, water: { today: 3, goal: 8 }, plan: {} };
    const ctx = { iso: '2026-09-16', hora: 10 };
    const prop = (fb) => {
      const out = window.breakPropuesta(Object.assign({}, base, { routineFeedback: fb || {} }), ctx);
      return out && out.rutina ? out.rutina.id : null;
    };
    const primera = prop({});
    const tras1No = prop({ [primera]: { yes: 0, some: 0, no: 1 } });
    const traNoYSi = prop({ [primera]: { yes: 1, some: 0, no: 1 } });
    const traNoYPoco = prop({ [primera]: { yes: 0, some: 1, no: 1 } });
    /* Y el veto es de la PROPUESTA, no del catalogo: la rutina vetada sigue
       estando disponible para elegirla a mano. */
    const sigueEnElPozo = window.breakPozo(window.EXTRA_ROUTINES).some(x => x.id === primera);
    return { primera, tras1No, traNoYSi, traNoYPoco, sigueEnElPozo,
             veta: window.breakVetadas({ a: { no: 2 }, b: { no: 2, some: 1 }, c: { yes: 1 } }) };
  });

  expect(r.primera, 'GUARD: la rama de los 45 minutos no propone nada').toBeTruthy();
  expect(r.tras1No, 'se sigue proponiendo la rutina que se acaba de rechazar').not.toBe(r.primera);
  expect(r.traNoYSi, 'un «No» posterior tumba una rutina que YA habia ayudado').toBe(r.primera);
  expect(r.traNoYPoco, '«Un poco» no cuenta como ayuda y deberia').toBe(r.primera);
  expect(r.sigueEnElPozo, 'el veto ha borrado la rutina del catalogo, no solo de la propuesta').toBe(true);
  expect(r.veta, 'breakVetadas veta lo que ayudo, o perdona lo que no').toEqual({ a: true });
});

/* ------------------------------------------------------------------ 8 */
test('con TODO rechazado la pausa sigue proponiendo (amnistia)', async ({ page, context }) => {
  await sembrarEstado(context, {});
  await irAlArtefacto(page);

  /* Medido en el banco de s189: sin amnistia, quien contesta «No» a todo deja
     Estira sin pozo en 12 dias y entonces un bloque de 45 minutos sentado
     acaba proponiendo beber agua. El aserto fija la consecuencia, no el
     mecanismo: la rama sigue siendo `extra`/`sitting`. */
  const r = await page.evaluate(() => {
    const fb = {};
    window.breakPozo(window.EXTRA_ROUTINES).forEach(x => {
      fb[x.id] = { yes: 0, some: 0, no: 3 };
    });
    const out = window.breakPropuesta(
      { focusMinutes: 45, cycle: 1, water: { today: 0, goal: 8 }, plan: {}, routineFeedback: fb },
      { iso: '2026-09-16', hora: 15 });
    return { cuantas: Object.keys(fb).length,
             modulo: out && out.modulo, porque: out && out.porque, id: out && out.rutina && out.rutina.id };
  });

  expect(r.cuantas, 'GUARD: no se pudo vetar ninguna rutina de Estira').toBeGreaterThan(5);
  expect(r.modulo, 'la rama enmudecio y la pausa se fue a otra cosa').toBe('extra');
  expect(r.porque).toBe('sitting');
  expect(r.id, 'no propone ninguna rutina: la rama se quedo muda').toBeTruthy();
});

/* ------------------------------------------------------------------ 9 */
test('dos pausas del mismo dia no proponen la misma rutina', async ({ page, context }) => {
  await sembrarEstado(context, {});
  await irAlArtefacto(page);

  /* LA ROTACION ERA POR DIA, asi que dos dias seguidos ya no coincidian -- pero
     dos pausas del MISMO dia comparten el ISO y proponian la misma rutina,
     incluso con el plan ya cumplido. Lo destapo el banco de s189. */
  const r = await page.evaluate(() => {
    const ctx = { iso: '2026-09-16', hora: 10 };
    const p = (cycle, plan) => {
      const out = window.breakPropuesta(
        { focusMinutes: 45, cycle: cycle, water: { today: 3, goal: 8 }, plan: plan || {} }, ctx);
      return out && out.rutina ? out.rutina.id : null;
    };
    const seis = [1, 2, 3, 4, 5, 6].map(n => p(n));
    return { bloque1: p(1), bloque2: p(2), yaEstirado: p(2, { extra: true }), seis: seis };
  });

  expect(r.bloque1, 'GUARD: la primera pausa no propone nada').toBeTruthy();
  expect(r.bloque2, 'la segunda pausa del dia repite la rutina de la primera').not.toBe(r.bloque1);
  expect(r.yaEstirado, 'con Estira ya hecho hoy repite la misma rutina').not.toBe(r.bloque1);
  /* Seis pausas en un dia son seis rutinas distintas: si el salto se ignora,
     esto colapsa a una sola. */
  expect(new Set(r.seis).size, 'las pausas del dia no avanzan en la rotacion').toBe(6);
});

/* ------------------------------------------------------------------ 10
 * EL PRIMER ASERTO DE LA PAUSA EN INGLES. Era un hueco declarado en s187: la
 * regla se probaba solo en español. El porque y el boton salen de
 * `break.prop.*`, y la cadena esperada se LEE de `PACE_STRINGS.en` -- no se
 * copia aqui, que envejeceria al primer cambio de copy. */
test('la propuesta habla en ingles', async ({ page, context }) => {
  await sembrarEstado(context, { focusMinutes: 45, lang: 'en', langAuto: false });
  await hastaLaPausa(page, 45, 'Start focus');

  const prop = page.locator('[data-pace-break-prop]');
  await expect(prop, 'no hay propuesta con la app en ingles').toHaveCount(1);

  const esperado = await page.evaluate(() =>
    String((window.PACE_STRINGS.en || {})['break.prop.sitting'] || '').replace('{n}', '45'));
  expect(esperado, 'GUARD: no se pudo leer el copy EN del artefacto').toContain('45');
  await expect(prop, 'el porque sigue en castellano con la app en ingles').toContainText(esperado);
  await expect(prop.getByRole('button', { name: 'Start', exact: true }),
    'el boton de la propuesta sigue en castellano').toBeVisible();
});
