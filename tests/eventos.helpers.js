/* PACE · utilidades compartidas de las pruebas de pace.events.v1 (s155)
 * ====================================================================
 * Extraidas SIN TOCAR NI UNA LINEA de su cuerpo en s156, solo para que ningun
 * archivo rebase el limite de 500 lineas de CLAUDE.md. Mismas pruebas, misma
 * cobertura: aqui no hay comportamiento nuevo.
 */
'use strict';

const CLAVE_EVENTOS = 'pace.events.v1';


/* Lee el contenedor crudo desde el navegador. */
function leerContenedor(page) {
  return page.evaluate(clave => {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : null;
  }, CLAVE_EVENTOS);
}

/* Espera a que la inicializacion del arranque haya terminado. La fachada
   memoiza su promesa, asi que volver a pedirla no relanza nada. */
function esperarInit(page) {
  return page.evaluate(() => window.paceEventsInitialize());
}

/* Siembra N eventos por el CONTRATO (no escribiendo el JSON a mano): asi la
   prueba ejercita el mismo camino que usara la Fase 2. */
function sembrarEventos(page, n) {
  return page.evaluate(async cuantos => {
    for (let i = 0; i < cuantos; i++) {
      const e = window.makeEvent({
        type: 'session.completed', runId: 'run-' + i,
        payload: {
          module: 'focus', routineId: 'focus.25', completionReason: 'natural',
          elapsedSeconds: 1500, activeSeconds: 1500,
          plannedSeconds: 1500, plannedSecondsSource: 'preset',
        },
      });
      await window.eventsWebAppend(e);
    }
    return JSON.parse(localStorage.getItem('pace.events.v1')).events.length;
  }, n);
}


module.exports = { CLAVE_EVENTOS, leerContenedor, esperarInit, sembrarEventos };
