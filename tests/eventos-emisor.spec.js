/* PACE · E2E · EL EMISOR DE pace.events.v1 (s172 · Fase 3, PASO 2)
 * ================================================================
 * Hasta aqui el esquema estaba entero y el almacen probado, pero NADIE emitia:
 * el contenedor se quedaba vacio por diseño. Estos asertos defienden lo que el
 * emisor promete, y ninguno mira un numero de pixeles ni un texto de UI.
 *
 * POR QUE EN UN NAVEGADOR Y NO EN EL VERIFY. El checker estatico ve que hay una
 * llamada a `paceEventsAppend` fuera de `app/events/` —eso ya lo vigila desde
 * s169— pero no ve si el evento LLEGA, ni con que payload, ni si el `runId` que
 * comparten sesion y feedback es de verdad el mismo. Eso solo se sabe abriendo
 * el contenedor despues de una sesion real.
 *
 * LO QUE MAS CARO HABRIA SALIDO, y por eso tiene test propio: el mapeo de
 * `kind:'body'`. El plan heredado decia «prefijo `move.` → move, `extra.` →
 * stretch» y ESO ESTA AL REVES en los cinco pasos de cuerpo que existen en el
 * catalogo de Caminos — los ids son historicos (s15 movio rutinas de modulo y
 * los conservo). Con la regla del prefijo, los eventos habrian salido con el
 * modulo cambiado SIN romper nada: ni un error en consola, ni un test rojo, y
 * el dato envenenado para siempre. El aserto de abajo compara contra el
 * catalogo, que es quien lo sabe.
 *
 * TRAMPAS HEREDADAS QUE SE RESPETAN AQUI:
 *  · `clock.install()` va ANTES de `goto` (s164).
 *  · Se avanza de 1 s en 1 s: un `fastForward` grande no adelanta la sesion.
 *  · `getByRole({name})` casa por SUBCADENA (s154) -> nombres acotados.
 *  · La home sigue montada debajo del overlay -> `overlaySuperior`.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');
const { leerContenedor, esperarInit } = require('./eventos.helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

/* Igual que en cuerpo-tiempo-activo.spec.js: el `waitForTimeout` es real y solo
   le da a React el turno para procesar el tick. */
async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); }
}

/* Los eventos de un tipo, ya ordenados como los guarda el almacen. */
function deTipo(contenedor, tipo) {
  return ((contenedor && contenedor.events) || []).filter(e => e.type === tipo);
}

test('una sesion de cuerpo emite session.completed, y el feedback comparte su runId', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install();
  await irAlArtefacto(page);
  await esperarInit(page);

  /* «Flexiones de escritorio» es la misma rutina que mide s170: 3 series
     guiadas con dos descansos, numeros declarados en el catalogo. Y ademas es
     el caso que desmonta el prefijo — su id empieza por `extra.` y vive en
     MOVE_ROUTINES, o sea que el modulo del evento tiene que ser `move`. */
  await page.getByRole('button', { name: /^Mueve/ }).click();
  await page.getByRole('heading', { name: 'Flexiones de escritorio' }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();

  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);

  const done = sesion.locator('[data-pace-session-done]');
  let termino = false;
  for (let s = 0; s < 320 && !termino; s++) {
    termino = await done.count() > 0;
    if (!termino) await segundos(page, 1);
  }
  expect(termino, 'GUARD: la sesion no llego al cierre, no hay evento que mirar').toBe(true);

  /* El append es asincrono (§10): se espera al evento, no a un timeout. */
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('pace.events.v1');
    return !!raw && (JSON.parse(raw).events || []).length > 0;
  }, null, { timeout: 5000 });

  const sesiones = deTipo(await leerContenedor(page), 'session.completed');
  expect(sesiones.length, 'una sesion terminada tiene que dejar UN evento, ni cero ni dos').toBe(1);

  const s0 = sesiones[0];
  const p = s0.payload;
  expect(p.module, 'el modulo sale del catalogo, no del prefijo del id').toBe('move');
  expect(p.routineId).toBe('extra.desk.pushups');
  expect(p.variant, 'esta rutina corre en el runner v1').toBe('v1');
  expect(p.completionReason, 'la sesion se agoto sola: es natural (§6.3)').toBe('natural');
  expect(p.plannedSecondsSource, 'el plan del v1 se DERIVA de estimateDuration (§6.4)').toBe('derived');
  expect(p.plannedSeconds, 'plan y origen viajan juntos o los dos a null').toBeGreaterThan(0);
  expect(s0.context).toBe('standalone');
  expect(s0.pathRunId, 'fuera de un Camino no hay pathRunId').toBeNull();
  expect(typeof s0.runId === 'string' && s0.runId.length > 0,
    'session.completed exige runId (§7.1)').toBe(true);

  /* LO RELACIONAL, que es lo que de verdad se defiende: el activo cae DENTRO
     del de pared y no coincide con el, porque esta rutina tiene 60 s de
     descansos. Igualar los dos es la tentacion que §6.4 prohibe. */
  expect(p.activeSeconds, 'el activo salio 0: el reloj no llego a abrir segmento').toBeGreaterThan(0);
  expect(p.activeSeconds).toBeLessThanOrEqual(p.elapsedSeconds);
  expect(p.elapsedSeconds - p.activeSeconds,
    'pared y activo casi coinciden: los descansos se estan contando como trabajo')
    .toBeGreaterThanOrEqual(40);

  /* EL FEEDBACK COMPARTE runId (§7.1). Se contesta en la misma pantalla, que es
     justo la razon por la que el id no necesita persistirse (§7.2). */
  const chips = sesion.locator('[data-pace-fb-chip]');
  expect(await chips.count(), 'GUARD: el cierre no ofrecio feedback, no hay nada que correlacionar')
    .toBeGreaterThan(0);
  await chips.first().click();
  await page.waitForFunction(() => {
    const raw = localStorage.getItem('pace.events.v1');
    return !!raw && (JSON.parse(raw).events || []).some(e => e.type === 'feedback.answered');
  }, null, { timeout: 5000 });

  const fb = deTipo(await leerContenedor(page), 'feedback.answered');
  expect(fb.length).toBe(1);
  expect(fb[0].runId, 'el feedback tiene que referenciar la sesion que lo produjo').toBe(s0.runId);
  expect(fb[0].payload.routineId).toBe('extra.desk.pushups');
  expect(fb[0].payload.module, 'el modulo del feedback lo hereda de su sesion').toBe('move');
  expect(fb[0].payload.response).toBe('yes');

  expect(errores).toEqual([]);
});

test('salir por «Salir» no emite nada (§6.3)', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install();
  await irAlArtefacto(page);
  await esperarInit(page);

  await page.getByRole('button', { name: /^Mueve/ }).click();
  await page.getByRole('heading', { name: 'Flexiones de escritorio' }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);
  await segundos(page, 20);

  /* CONTROL POSITIVO del propio test: si la sesion no hubiera arrancado, «cero
     eventos» saldria verde por la razon equivocada. Se exige haber estado
     dentro, con el reloj corriendo. */
  const dentro = await sesion.locator('[data-pace-v1-body]').count();
  expect(dentro, 'GUARD: la sesion nunca monto el runner, el cero de abajo no valdria').toBe(1);

  await sesion.getByRole('button', { name: /Salir/ }).click();
  await page.waitForTimeout(300);

  const c = await leerContenedor(page);
  expect(deTipo(c, 'session.completed').length,
    'salir a mitad NO completa una sesion, y por tanto no emite').toBe(0);
  expect(errores).toEqual([]);
});

test('el mapeo de kind:body sale del CATALOGO, no del prefijo del routineId', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  /* CENSO RELACIONAL sobre el catalogo entero: para cada paso de cuerpo de cada
     Camino, lo que el emisor pone en `stepKind` tiene que ser lo mismo que dice
     `resolveBodyRoutine` — que es el resolutor que ya usa `PathBodyStep` para
     elegir runner. Si los dos se separan, el evento dira que un estiramiento
     fue movilidad. */
  const censo = await page.evaluate(() => {
    const filas = [];
    (window.PATH_CATALOG || []).forEach(cam => (cam.steps || []).forEach(st => {
      if (st.kind !== 'body') return;
      const r = window.resolveBodyRoutine(st.routineId);
      filas.push({
        id: st.routineId,
        emisor: window.paceStepKindEvento(st),
        catalogo: r ? (r.source === 'extra' ? 'stretch' : 'move') : null,
        prefijo: st.routineId.indexOf('extra.') === 0 ? 'stretch' : 'move',
      });
    }));
    return filas;
  });

  /* GUARD DE CERO: sin filas, todo lo de abajo pasa en vacio. */
  expect(censo.length, 'el catalogo no devolvio ni un paso de cuerpo: esto no esta midiendo nada')
    .toBeGreaterThan(0);
  for (const f of censo) {
    expect(f.emisor, `«${f.id}»: el emisor no dice lo mismo que el catalogo`).toBe(f.catalogo);
  }

  /* Y LA PRUEBA NEGATIVA, que es la que da valor a la de arriba: tiene que
     haber al menos un id cuyo PREFIJO contradiga al catalogo. Si algun dia
     dejara de haberlo, este aserto cae y avisa de que el censo de arriba se ha
     vuelto una tautologia — pasaria igual con la regla equivocada. */
  const enganosos = censo.filter(f => f.prefijo !== f.catalogo);
  expect(enganosos.length,
    'ya no hay ids que contradigan su prefijo: el aserto de arriba ya no distingue las dos reglas')
    .toBeGreaterThan(0);

  /* Los kinds que no son de cuerpo pasan tal cual, y lo que no esta en el enum
     no se emite (mejor perder un evento que etiquetarlo mal). */
  const sueltos = await page.evaluate(() => ({
    foco: window.paceStepKindEvento({ kind: 'focus' }),
    agua: window.paceStepKindEvento({ kind: 'hydrate' }),
    inventado: window.paceStepKindEvento({ kind: 'siesta' }),
    cuerpoRoto: window.paceStepKindEvento({ kind: 'body', routineId: 'no.existe' }),
    vacio: window.paceStepKindEvento(null),
  }));
  expect(sueltos).toEqual({
    foco: 'focus', agua: 'hydrate', inventado: null, cuerpoRoto: null, vacio: null,
  });

  expect(errores).toEqual([]);
});

test('un Camino agrupa sus pasos y su cierre bajo un mismo pathRunId', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await esperarInit(page);

  /* Se conduce por la CAPA DE ESTADO y no por la UI a proposito: recorrer
     `path.dawn` entero por pantalla son 5 min de respiracion + 25 de foco, y lo
     que se defiende aqui —la correlacion y el orden— no vive en la UI. Los
     emisores que se ejercitan son los de verdad, con el registro de verdad. */
  const salida = await page.evaluate(async () => {
    window.startPath('path.dawn');
    const runId = window.getState().paths.current.pathRunId;
    const pasos = window.getPath('path.dawn').steps.length;
    for (let i = 0; i < pasos; i++) window.advancePathStep('done');
    await new Promise(r => setTimeout(r, 300));
    return { runId: runId, pasos: pasos };
  });

  expect(typeof salida.runId === 'string' && salida.runId.length > 0,
    'startPath tiene que nacer con un pathRunId (§7.1)').toBe(true);

  const c = await leerContenedor(page);
  const pasos = deTipo(c, 'path.step.completed');
  const cierres = deTipo(c, 'path.completed');

  expect(pasos.length, 'cada paso hecho emite el suyo').toBe(salida.pasos);
  expect(cierres.length, 'un Camino terminado emite UN cierre').toBe(1);

  /* LA CORRELACION, que es el motivo de que `pathRunId` exista: los pasos y el
     cierre son la MISMA ejecucion. Y el cierre es el caso que se pierde si
     alguien lee el id despues del avance, porque para entonces `paths.current`
     ya es null. */
  for (const e of pasos) expect(e.pathRunId).toBe(salida.runId);
  expect(cierres[0].pathRunId, 'el cierre se emite cuando current ya es null: el id va por parametro')
    .toBe(salida.runId);
  expect(cierres[0].runId, 'path.completed no lleva runId (§7.1)').toBeNull();
  expect(cierres[0].payload.stepsCount).toBe(salida.pasos);

  /* Los kinds del Camino de la mañana, con el de cuerpo resuelto por catalogo:
     `move.neck.3` vive en EXTRA_ROUTINES, asi que es `stretch` aunque su id
     empiece por `move.`. Con la regla del prefijo esta linea seria 'move'.
     SE ORDENA POR `stepIndex`, y no es cosmetica: el almacen guarda en el orden
     canonico de §11 —instante, y a igual instante desempata por `id`, que es
     aleatorio— y este test dispara los tres pasos en el MISMO milisegundo. La
     primera version comparaba el orden de llegada y salio roja por eso: media
     el desempate del almacen, no lo que emite el emisor. En uso real los pasos
     van separados por minutos. */
  const porIndice = pasos.slice().sort((a, b) => a.payload.stepIndex - b.payload.stepIndex);
  expect(porIndice.map(e => e.payload.stepKind)).toEqual(['breathe', 'focus', 'stretch']);
  expect(porIndice.map(e => e.payload.stepIndex)).toEqual([0, 1, 2]);
  for (const e of pasos) expect(e.context).toBe('path');

  expect(errores).toEqual([]);
});

test('el feedback de otra rutina NO se cuelga de la ultima sesion', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await esperarInit(page);

  /* §7.1: el `runId` de un `feedback.answered` referencia una sesion que
     EXISTE. Sin sesion previa, o con otra rutina, no se inventa: no se emite.
     CONTROL POSITIVO al final — la misma llamada con la rutina correcta SI
     emite, asi que el cero de arriba no puede ser «el emisor no funciona». */
  const salida = await page.evaluate(async () => {
    const cuenta = () => (JSON.parse(localStorage.getItem('pace.events.v1') || '{}').events || [])
      .filter(e => e.type === 'feedback.answered').length;
    window.paceOlvidarUltimaSesion();
    window.recordRoutineFeedback('move.neck.3', 'yes');
    await new Promise(r => setTimeout(r, 150));
    const sinSesion = cuenta();

    window.emitSessionCompleted('breathe', 'breathe.478', {
      elapsedSeconds: 300, activeSeconds: 280, plannedSeconds: 300,
      plannedSecondsSource: 'declared',
    });
    await new Promise(r => setTimeout(r, 150));
    window.recordRoutineFeedback('otra.rutina', 'yes');
    await new Promise(r => setTimeout(r, 150));
    const otraRutina = cuenta();

    window.recordRoutineFeedback('breathe.478', 'later');
    await new Promise(r => setTimeout(r, 150));
    const ahoraNo = cuenta();

    window.recordRoutineFeedback('breathe.478', 'some');
    await new Promise(r => setTimeout(r, 250));
    return { sinSesion, otraRutina, ahoraNo, correcto: cuenta() };
  });

  expect(salida.sinSesion, 'sin sesion previa no hay runId al que colgarse').toBe(0);
  expect(salida.otraRutina, 'el feedback de otra rutina no puede heredar este runId').toBe(0);
  expect(salida.ahoraNo, '«Ahora no» no emite (§15.2)').toBe(0);
  expect(salida.correcto, 'CONTROL POSITIVO: con su propia rutina SI emite').toBe(1);
  expect(errores).toEqual([]);
});

test('una sesion de Respira emite su plan DECLARADO (§6.4)', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install();
  await irAlArtefacto(page);
  await esperarInit(page);

  /* «Suspiro fisiologico» son 2 min declarados y sin modal de seguridad, que es
     lo que la hace conducible en un test. Se abre por su HEADING —un boton por
     /Empezar/ caza el «Empezar foco» de la home que hay detras (s154)— y su
     arranque es «Empezar ahora» DENTRO de la sesion: Respira no pasa por el
     preview con «Empezar» que si tiene Mueve. */
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).click();

  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  const done = sesion.locator('[data-pace-session-done]');
  let termino = false;
  for (let s = 0; s < 200 && !termino; s++) {
    termino = await done.count() > 0;
    if (!termino) await segundos(page, 1);
  }
  expect(termino, 'GUARD: la sesion de Respira no llego al cierre').toBe(true);

  await page.waitForFunction(() => {
    const raw = localStorage.getItem('pace.events.v1');
    return !!raw && (JSON.parse(raw).events || []).length > 0;
  }, null, { timeout: 5000 });

  const ses = deTipo(await leerContenedor(page), 'session.completed');
  expect(ses.length).toBe(1);
  const p = ses[0].payload;
  expect(p.module).toBe('breathe');
  expect(p.routineId).toBe('breathe.physiological');
  expect(p.variant, 'Respira no tiene dos runners: su variante es null').toBeNull();
  expect(p.completionReason, 'el plan se agoto solo').toBe('natural');
  /* EL PLAN de una rutina sin rondas son sus minutos DECLARADOS, y no es una
     estimacion: el motor termina cuando el tiempo ACTIVO alcanza ese numero. */
  expect(p.plannedSeconds, '2 min declarados en el catalogo').toBe(120);
  expect(p.plannedSecondsSource).toBe('declared');
  expect(p.activeSeconds, 'el activo tiene que rondar el plan, no ser cualquier cosa')
    .toBeGreaterThanOrEqual(110);

  /* La politica de plan, caso a caso y sin montar nada: es la fila de §6.4 que
     esta implementacion tuvo que interpretar, asi que se deja escrita de forma
     ejecutable. GUARD: el primer caso exige un numero, asi que si la funcion no
     existiera el evaluate reventaria en vez de pasar en vacio. */
  const planes = await page.evaluate(() => ({
    sinRondas: window.respiraPlanSec({ min: 5, pattern: 'coherent' }),
    conRondas: window.respiraPlanSec({ min: 4, pattern: 'rounds', rounds: 2, breaths: 25 }),
    sinDatos:  window.respiraPlanSec({ pattern: 'coherent' }),
    nada:      window.respiraPlanSec(null),
  }));
  expect(planes).toEqual({ sinRondas: 300, conRondas: 200, sinDatos: null, nada: null });

  expect(errores).toEqual([]);
});

test('«Finalizar» a mitad es el `early` de §6.3, y agotar el plan es `natural`', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install();
  await irAlArtefacto(page);
  await esperarInit(page);

  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);
  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();

  /* 30 s de los 120 declarados y se corta a mano. OJO al nombre: el boton lleva
     glifos delante —«▶| Terminar»— asi que un `name` exacto no casa; se busca
     por subcadena, acotado a la sesion (s154). */
  await segundos(page, 30);
  const finalizar = sesion.getByRole('button', { name: /Terminar/ });
  expect(await finalizar.count(), 'GUARD: no hay control de finalizar, no se puede provocar el early')
    .toBeGreaterThan(0);
  await finalizar.click();

  await page.waitForFunction(() => {
    const raw = localStorage.getItem('pace.events.v1');
    return !!raw && (JSON.parse(raw).events || []).length > 0;
  }, null, { timeout: 5000 });

  const ses = deTipo(await leerContenedor(page), 'session.completed');
  expect(ses.length).toBe(1);
  expect(ses[0].payload.completionReason,
    'cortar con «Finalizar» es control explicito de finalizacion anticipada (§6.3)').toBe('early');
  /* Y el numero que lo respalda: se practico MENOS de lo planificado. Sin esto,
     un `early` constante —o uno puesto a mano— pasaria igual. */
  expect(ses[0].payload.activeSeconds).toBeLessThan(ses[0].payload.plannedSeconds);

  expect(errores).toEqual([]);
});
