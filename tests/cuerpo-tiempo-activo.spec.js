/* PACE · E2E · EL TIEMPO ACTIVO DE MUEVE / ESTIRA (s170)
 * ======================================================
 * Hasta s170 estas dos familias solo sabian su tiempo de PARED
 * (`Date.now() - sessionStart`), o sea con las pausas y los descansos dentro.
 * Respira tiene contabilidad de pausa desde s98; ellas no la tenian, y sin ella
 * el `activeSeconds` que exige `session.completed` no se puede emitir sin
 * inventarlo — que es exactamente lo que envenenaria al recomendador de la
 * Fase 3.5, porque despues no hay forma de saber cuales eran inventados.
 *
 * QUE DEFIENDEN ESTOS ASERTOS: la POLITICA de §6.4 del esquema de eventos, que
 * no es «todo lo que no sea pausa». Quedan fuera la preparacion, la colocacion,
 * la transicion de lado, los descansos entre series y las pausas; queda dentro
 * el trabajo de los dos lados.
 *
 * POR QUE EN UN NAVEGADOR Y NO EN EL VERIFY: el reloj es timestamp-based
 * (decision s96) y se segmenta en un efecto de React. Un checker estatico ve
 * que la funcion existe; no ve que el ultimo segmento —el del trabajo que
 * acaba de terminar la sesion— siga abierto al leer el total, que es justo lo
 * que se pierde si alguien «arregla» el reloj cerrandolo a mano (s166).
 *
 * LA RUTINA ELEGIDA NO ES CASUAL. «Flexiones de escritorio» son 3 series
 * guiadas con DOS descansos entre medias, y sus numeros estan declarados en el
 * catalogo, no medidos aqui:
 *     trabajo   12+10+8 reps x 4 s de tempo = 48 + 40 + 32 =  120 s
 *     descansos 2 x 30 s (preset por defecto)            =   60 s
 *     prep 5 s + colocacion auto del 1er set 5 s         =   10 s
 *     pausa que mete este test                           =   30 s
 *     -------------------------------------------------------------
 *     pared ~220 s   ·   ACTIVO 120 s
 * Los tres modos de fallo caen en sitios distintos y por eso el margen muerde:
 * contar todo daria ~220, contar los descansos ~180, contar la pausa ~150.
 *
 * TRAMPAS QUE VIVEN AQUI:
 *  · `clock.install()` va ANTES de `goto`.
 *  · Se avanza de 1 s en 1 s: un `fastForward` grande NO adelanta la sesion,
 *    porque el ticker se resuscribe por fase (medido en s164).
 *  · El boton de pausa se llama «❚❚ Pausar», con glifos delante: un `name`
 *    exacto de 'Pausar' no casa. Y `getByRole({name})` casa por SUBCADENA
 *    (s154), asi que los nombres van acotados a la sesion.
 *  · La home sigue montada DEBAJO del overlay con sus propios botones.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

/* Avanza `n` segundos VIRTUALES, uno a uno. El `waitForTimeout` es real y solo
   le da a React el turno para procesar el tick; no mueve el reloj de la pagina. */
async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); }
}

test('el tiempo activo deja fuera descansos y pausas; el de pared los lleva dentro', async ({ page }) => {
  const errores = capturarErrores(page);
  await page.clock.install();
  await irAlArtefacto(page);

  await page.getByRole('button', { name: /^Mueve/ }).click();
  await page.getByRole('heading', { name: 'Flexiones de escritorio' }).click();
  const preview = overlaySuperior(page);
  await preview.getByRole('button', { name: 'Empezar', exact: true }).click();

  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion).toHaveCount(1);

  /* Hasta que empieza el TRABAJO de la primera serie. Se reconoce por su
     control propio —«Terminar antes» solo existe en reps guiadas— y no por un
     numero de segundos, que es lo que haria caducar el aserto si cambiara la
     preparacion. GUARD: si no se llega, lo de abajo mediria una sesion que
     nunca arranco. */
  let trabajando = false;
  for (let s = 0; s < 40 && !trabajando; s++) {
    trabajando = await sesion.getByRole('button', { name: /Terminar antes/ }).count() > 0;
    if (!trabajando) await segundos(page, 1);
  }
  expect(trabajando, 'GUARD: la sesion nunca entro en el trabajo de la 1a serie').toBe(true);

  /* 20 s de trabajo, una PAUSA de 30 s, y seguir. La pausa es el unico tramo
     que este test provoca a mano: los descansos los pone la rutina sola. */
  await segundos(page, 20);
  await sesion.getByRole('button', { name: /Pausar/ }).click();
  await page.waitForTimeout(50);
  await segundos(page, 30);
  await sesion.getByRole('button', { name: /Reanudar/ }).click();
  await page.waitForTimeout(50);

  /* Hasta el final. El techo de 300 s es holgura sobre los ~220 previstos. */
  const done = sesion.locator('[data-pace-session-done]');
  let termino = false;
  for (let s = 0; s < 300 && !termino; s++) {
    termino = await done.count() > 0;
    if (!termino) await segundos(page, 1);
  }
  expect(termino, 'GUARD: la sesion no llego al cierre, asi que no hay nada que medir').toBe(true);

  const activo = Number(await done.getAttribute('data-pace-active-sec'));
  /* El tiempo de PARED se lee de la pantalla, que es donde el usuario lo ve:
     el stat «Tiempo» en mm:ss. Leerlo de ahi y no de otro ref es lo que hace
     que el aserto compare los DOS numeros que la app dice, no dos formas de
     calcular el mismo. */
  const reloj = await sesion.getByText(/^\d+:\d\d$/).first().innerText();
  const [mm, ss] = reloj.split(':').map(Number);
  const pared = mm * 60 + ss;

  /* GUARD de cero: un `data-pace-active-sec` ausente da NaN y un 0 pasaria
     algunos de los asertos de abajo por el lado equivocado. */
  expect(Number.isFinite(activo), 'el cierre no publica data-pace-active-sec').toBe(true);
  expect(activo, 'el tiempo activo salio 0: el reloj no llego a abrir un segmento').toBeGreaterThan(0);

  /* EL NUMERO. 120 s declarados en el catalogo; el margen de +-12 cubre que el
     segmento abre y cierra en el tick siguiente al cambio de fase. Contar la
     pausa daria ~150 y contar tambien los descansos ~210: los dos caen fuera. */
  expect(activo, 'el tiempo activo no son los 120 s de trabajo del catalogo').toBeGreaterThanOrEqual(108);
  expect(activo, 'se acredito como activo tiempo que no era trabajo').toBeLessThanOrEqual(132);

  /* Y LO RELACIONAL, que es lo que de verdad se estaba arreglando: el reloj de
     pared sigue llevando dentro lo que el activo deja fuera. Si alguien
     igualara los dos —`activeSeconds = elapsedSeconds`, la tentacion que el
     handoff prohibe— esta linea es la que lo dice. */
  expect(pared - activo,
    'pared y activo casi coinciden: los descansos y la pausa se estan contando como trabajo')
    .toBeGreaterThanOrEqual(75);

  expect(errores).toEqual([]);
});

test('la politica del tiempo activo, caso a caso', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  /* `v1TrabajoActivo` es PURA y vive en el support justamente para poder
     preguntarle esto sin montar una sesion. Es un censo de la decision de §6.4
     escrito de forma ejecutable: cada linea de la tabla del esquema tiene aqui
     su caso. No puede pasar en vacio — el primer caso exige `true`, asi que si
     la funcion no existiera el evaluate reventaria. */
  const casos = await page.evaluate(() => {
    const f = window.v1TrabajoActivo;
    const paso = (mode) => ({ mode: mode });
    return {
      trabajo:       f('run', 'work', paso('reps'), false),
      trabajoTimed:  f('run', 'work', paso('timed'), false),
      segundoLado:   f('run', 'work', paso('perSide'), false),
      pausado:       f('run', 'work', paso('reps'), true),
      descanso:      f('run', 'work', paso('rest'), false),
      colocacion:    f('run', 'place', paso('timed'), false),
      cambioDeLado:  f('run', 'change', paso('perSide'), false),
      preparacion:   f('prep', 'work', paso('timed'), false),
      terminada:     f('done', 'work', paso('timed'), false),
      sinPaso:       f('run', 'work', null, false),
    };
  });

  expect(casos).toEqual({
    trabajo: true, trabajoTimed: true, segundoLado: true,
    pausado: false, descanso: false, colocacion: false, cambioDeLado: false,
    preparacion: false, terminada: false, sinPaso: false,
  });

  expect(errores).toEqual([]);
});
