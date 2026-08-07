/* PACE · checklist de cierre · item 1 — FOCO (s154)
 * =================================================
 * «Pomodoro cuenta y termina -> abre BreakMenu».
 *
 * Terminar un Pomodoro de verdad son 25 minutos, asi que el tiempo se controla
 * con el reloj virtual de Playwright. Encaja porque el motor de cuenta atras es
 * TIMESTAMP-BASED (`useCountdown.jsx`): no acumula ticks, calcula contra el
 * reloj, de modo que adelantarlo da el mismo resultado que esperar.
 *
 * `clock.install` va ANTES de `goto`: el estado inicial del contador se fija al
 * evaluar la app, no al montar.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, RUTA_ARTEFACTO } = require('./helpers');

const ARRANQUE = new Date('2026-08-04T10:00:00');

test('el Pomodoro cuenta, se pausa, se reanuda y al terminar abre el BreakMenu', async ({ page, context }) => {
  await sembrar(context);
  const errores = capturarErrores(page);

  await page.clock.install({ time: ARRANQUE });
  await page.goto(RUTA_ARTEFACTO);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  /* Congelar: a partir de aqui el tiempo solo avanza cuando yo lo digo. */
  await page.clock.pauseAt(new Date(ARRANQUE.getTime() + 5000));

  const numero = page.locator('[data-pace-dial-number]');
  await expect(numero).toHaveText('25:00');
  await expect(page.getByRole('button', { name: 'Empezar foco', exact: true })).toBeVisible();

  /* CUENTA. Dos segundos exactos: 25:00 -> 24:58. */
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await page.clock.runFor(2000);
  await expect(numero).toHaveText('24:58');
  await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible();

  /* PAUSA y REANUDACION: la etiqueta se deriva de `status`, no de `remaining`
     (s124), asi que estos tres nombres son el contrato de estado del CTA.
     `exact: true` NO es decoracion: por defecto el nombre casa por SUBCADENA,
     asi que renombrar la etiqueta a «PausarX» seguia pasando el test. Se
     descubrio poniendolo rojo a proposito, que es justo para lo que sirve. */
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Continuar', exact: true })).toBeVisible();
  /* En pausa el reloj corre y el numero NO se mueve: eso prueba que la pausa
     es de verdad y no un cambio de etiqueta. */
  await page.clock.runFor(5000);
  await expect(numero).toHaveText('24:58');

  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.clock.runFor(1000);
  await expect(numero).toHaveText('24:57');

  /* TERMINA — CON UN SALTO, NO CON 1500 TICS (s160).
     `runFor` ejecuta TODOS los callbacks intermedios: 1500 disparos del
     intervalo con su re-render cada uno, y eso es trabajo de tiempo REAL aunque
     el reloj sea virtual. Con la suite en 58 tests y 8 workers no cabia en el
     plazo y este test se caia — medido que no era la app: la MISMA suite contra
     el `index.html` de HEAD falla igual, y aislado pasa en 23,7 s.
     `fastForward` salta el reloj y dispara los timers vencidos UNA vez, que es
     todo lo que hace falta... y de paso prueba algo que antes no se probaba:
     que el contador es TIMESTAMP-BASED (s96). Si dependiera de contar tics, con
     un salto no terminaria — es exactamente lo que le pasa a la pestaña en
     segundo plano, donde el navegador throttlea el intervalo a ~1/min. */
  await page.clock.fastForward(25 * 60 * 1000);

  /* Y ABRE EL BREAKMENU, con sus cuatro salidas y su escape. */
  const menu = page.locator('[data-pace-modal-backdrop]').last();
  await expect(menu.getByText('Pausa bien hecha', { exact: true })).toBeVisible();
  await expect(menu.getByRole('button', { name: /Hidrátate/ })).toBeVisible();
  await expect(menu.getByRole('button', { name: /Respira/ })).toBeVisible();
  await expect(menu.getByRole('button', { name: /Estira/ })).toBeVisible();
  await expect(menu.getByRole('button', { name: /Muévete/ })).toBeVisible();
  await expect(menu.getByRole('button', { name: 'Saltar esta pausa', exact: true })).toBeVisible();

  /* El ciclo queda cerrado: el CTA de la home ya ofrece el siguiente. */
  await expect(page.getByRole('button', { name: 'Empezar otro ciclo', exact: true })).toBeVisible();

  expect(errores).toEqual([]);
});
