/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Dialogo.jsx — UN DIALOGO SE COMPORTA COMO UN DIALOGO (s198)
   ============================================================
   LO QUE MIDIO LA AUDITORIA DE s198 sobre v0.130.0, en el artefacto publicado:
   · El `Modal` compartido (doce superficies: bibliotecas, Stats, Logros, la
     pausa, el agua, la hoja del dia, el preview…) no tenia rol de dialogo, el
     foco se quedaba en `<body>` al abrirlo y **25 de 30 Tab salian al fondo**.
   · Cada `Modal` escuchaba Escape en `document` por su cuenta. Con el preview
     ENCIMA de la biblioteca, **un Escape cerraba la biblioteca de detras** y
     dejaba el preview — lo contrario de lo que main.jsx promete («cerrar el
     preview te devuelve a ella»).
   · El onboarding si era `role=dialog`, pero sin trampa de foco: la deuda que
     la Fase 8.5 llevaba anotada desde s183.

   LO QUE HACE `usePaceDialogo(ref, abierto, opciones)`:
   1. PILA. Cada dialogo abierto se apila; Escape y Tab solo los atiende el de
      ARRIBA. La comprobacion se hace en el momento del evento y se marca el
      evento como atendido, asi que el orden en que `document` reparte los
      listeners da igual.
   2. FOCO DENTRO al abrir: al contenedor (`tabIndex=-1`), no al primer boton.
      Al primer boton seria peor: en la pausa, Enter ya tiene dueño (acepta la
      propuesta, BreakMenu.jsx) y el primer boton es la ×.
   3. TRAMPA DE TAB: el foco da la vuelta dentro del dialogo.
   4. DEVOLVER EL FOCO al cerrar, a quien lo tenia al abrir — SALVO que ya lo
      tenga otro (el dialogo de debajo, o una SESION que acaba de montarse: el
      foco en un boton de la home detras de una sesion es justo el defecto de
      «Espacio no pausa», ver SessionShell.jsx).

   LO QUE NO HACE: no decide que se ve. Ni un pixel cambia — el contenedor lleva
   `outline: none` porque el foco programatico no es una seleccion del usuario.

   Los nombres van con alias (`useEffectDlg`…): en PACE.html los scripts
   comparten el ambito global de Babel standalone y un `useEffect` pelado
   chocaria con el de otro archivo.
   ============================================================ */

const { useEffect: useEffectDlg, useRef: useRefDlg } = React;

const _paceDialogos = [];

function paceDialogoArriba(yo) {
  return _paceDialogos.length > 0 && _paceDialogos[_paceDialogos.length - 1] === yo;
}

/* ¿Hay algun dialogo abierto? Lo consultan los atajos globales de main.jsx. */
function paceHayDialogo() {
  return _paceDialogos.length > 0;
}

const PACE_ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), '
  + 'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

function paceEnfocables(cont) {
  if (!cont) return [];
  return Array.prototype.filter.call(cont.querySelectorAll(PACE_ENFOCABLES), (el) => {
    if (el.getClientRects().length === 0) return false;
    const cs = window.getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  });
}

/* ¿Se puede devolver el foco a `el`? Conectado, visible y sin una sesion
   montada encima (la sesion toma el foco ella misma). */
function paceFocoDevolvible(el) {
  if (!el || typeof el.focus !== 'function' || el === document.body) return false;
  if (!document.contains(el) || el.getClientRects().length === 0) return false;
  if (document.querySelector('[data-pace-session-root]')) {
    const sesion = document.querySelector('[data-pace-session-root]');
    if (!sesion.contains(el)) return false;
  }
  return true;
}

function usePaceDialogo(ref, abierto, opciones) {
  const op = opciones || {};
  const onEscapeRef = useRefDlg(op.onEscape);
  onEscapeRef.current = op.onEscape;

  useEffectDlg(() => {
    if (!abierto) return undefined;
    const yo = {};
    _paceDialogos.push(yo);
    const previo = document.activeElement;
    const cont = ref.current;
    if (cont && !cont.contains(document.activeElement)) {
      try { cont.focus({ preventScroll: true }); } catch (e) {}
    }

    const onKey = (e) => {
      if (e.__paceDialogoAtendido || !paceDialogoArriba(yo)) return;
      if (e.key === 'Escape') {
        if (typeof onEscapeRef.current !== 'function') return;
        e.__paceDialogoAtendido = true;
        onEscapeRef.current(e);
        return;
      }
      if (e.key !== 'Tab' || !cont) return;
      const activo = document.activeElement;
      /* Otro dialogo que no pasa por esta pila (el «¿Salir del Camino?» de
         PathRunner.parts, que gestiona su foco a mano) tiene el foco: su Tab no
         es nuestro, o lo sacariamos de un dialogo que esta ENCIMA. */
      if (activo && activo !== document.body && !cont.contains(activo)
          && activo.closest && activo.closest('[role="dialog"]')) return;
      e.__paceDialogoAtendido = true;
      const lista = paceEnfocables(cont);
      if (lista.length === 0) { e.preventDefault(); try { cont.focus({ preventScroll: true }); } catch (er) {} return; }
      const primero = lista[0], ultimo = lista[lista.length - 1];
      const dentro = cont.contains(activo) && activo !== cont;
      if (e.shiftKey) {
        if (!dentro || activo === primero) { e.preventDefault(); ultimo.focus(); }
      } else if (!dentro || activo === ultimo) {
        e.preventDefault(); primero.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      const i = _paceDialogos.indexOf(yo);
      if (i !== -1) _paceDialogos.splice(i, 1);
      /* Devolver el foco solo si nadie lo ha cogido: si sigue en <body> (el
         dialogo ya no esta en el DOM) o dentro de lo que se cierra. */
      const ahora = document.activeElement;
      const libre = !ahora || ahora === document.body || (cont && cont.contains(ahora));
      if (libre && paceFocoDevolvible(previo)) {
        try { previo.focus({ preventScroll: true }); } catch (e) {}
      }
    };
  }, [abierto]);
}

Object.assign(window, { usePaceDialogo, paceDialogoArriba, paceHayDialogo, paceEnfocables });
