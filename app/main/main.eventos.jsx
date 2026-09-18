/* PACE · main · LO QUE EL ROOT ESCUCHA — sacado de main.jsx en s193
   ===================================================================
   Los CustomEvent con los que la shell (Sidebar, TopBar, el logo, las
   bibliotecas) le piden cosas a PaceApp sin acoplarse a sus props. PaceApp sigue
   siendo el DUEÑO del estado de los modales: aquí cada evento se traduce a la
   acción que el root le pasa en `acciones`, y nada más. Salió de main.jsx al
   tocar las 500 líneas de §1, listener por listener y sin cambiar ninguno.

   `acciones` se captura en el PRIMER render (dependencias `[]`), exactamente
   como hacía cada listener en main.jsx: todo lo que llama son setters de
   useState —estables— o handlers que sólo cierran sobre setters.

     abrirConstructor(id)   pace:open-custom-builder  (detail.id, o null = crear)
     abrirLogros()          pace:open-achievements
     abrirApoyo()           pace:open-support         (sesión 16 / v0.11.11)
     abrirStats() · abrirBiblioteca(kind) · abrirAgua() · empezarRespira(r, g)
       · previsualizar({ routine, kind })        pace:sidebar-action (s180)
   s194: resume/repeat/suggest anotan la PUERTA de la sesión (paceOrigenSesion,
   state-events.jsx): 'sidebar', o 'parada' si el detalle trae `parada: true`.

   El logro secreto de la vaca (pace:cow-click, diez clics en el logo) vive aquí
   entero: su contador no lo lee nadie más. */

const { useState: useStateEv, useEffect: useEffectEv } = React;

function usePaceEventos(acciones) {
  const [cowClicks, setCowClicks] = useStateEv(0);
  useEffectEv(() => {
    if (cowClicks >= 10) unlockAchievement('secret.cow.click');
  }, [cowClicks]);

  useEffectEv(() => {
    const a = acciones;
    /* Navegación desde la sidebar (s180). UN solo evento con `detail.kind` en vez
       de un `pace:open-*` por destino: la sidebar no toca el estado interno de
       los modales, solo dice qué quiere, y PaceApp decide con qué superficie se
       cumple. `repeat` reutiliza las MISMAS puertas que la biblioteca:
       `empezarRespira` con su gate de seguridad, o el Preview de §18.3 para
       cuerpo. Así una rutina con `safety: true` no se salta su modal por entrar
       desde la sidebar. */
    const sidebar = (ev) => {
      const d = (ev && ev.detail) || {};
      if (d.kind === 'stats') { a.abrirStats(); return; }
      if (d.kind === 'module') {
        /* 'focus' no abre nada a propósito: el timer ES la home, así que ya
           estás encima de él (en móvil, con el drawer cerrándose detrás). */
        if (d.target === 'breathe') a.abrirBiblioteca('breathe');
        else if (d.target === 'body') a.abrirBiblioteca('move');
        else if (d.target === 'water') a.abrirAgua();
        return;
      }
      if (d.kind === 'custom') {
        /* MIS RUTINAS. Con rutinas propias abre la biblioteca de Mueve, que es
           donde vive su seccion (s93); sin ninguna, abre el CONSTRUCTOR, porque
           llevar a una lista vacia seria peor que no llevar. */
        const propias = (getState().customRoutines || []).length;
        if (propias) a.abrirBiblioteca('move');
        else a.abrirConstructor(null);
        return;
      }
      /* s194 · la puerta: la tarjeta de la barra lateral, o la parada de la línea del
         día (que dispara este mismo evento con `parada: true`). `ritmo` dice si la
         tarjeta era la pausa que sirvió el menú. */
      if ((d.kind === 'resume' || d.kind === 'repeat' || d.kind === 'suggest') && d.targetId && typeof paceOrigenSesion === 'function') {
        paceOrigenSesion(d.parada ? 'parada' : 'sidebar', d.parada ? true : !!d.ritmo);
      }
      if (d.kind === 'resume' && d.targetId) {
        /* Reanudar entra por `empezarRespira` y no por un camino propio:
           asi la rutina con apnea vuelve a pasar por su modal de seguridad y
           el guard de acceso sigue siendo el mismo. */
        const g = window.leerRespiraGuardada && window.leerRespiraGuardada();
        const r = g && window.getBreatheRoutine && window.getBreatheRoutine(g.routineId);
        if (r) a.empezarRespira(r, g);
        return;
      }
      if ((d.kind === 'repeat' || d.kind === 'suggest') && d.targetId) {
        /* El módulo se le pregunta al CATÁLOGO, nunca al prefijo del id (s172). */
        const b = window.getBreatheRoutine && window.getBreatheRoutine(d.targetId);
        if (b) { a.empezarRespira(b); return; }
        const body = window.resolveBodyRoutine && window.resolveBodyRoutine(d.targetId);
        if (body && body.routine) a.previsualizar({ routine: body.routine, kind: body.source });
      }
    };
    const escuchas = {
      'pace:cow-click': () => setCowClicks((c) => c + 1),
      'pace:open-custom-builder': (e) => a.abrirConstructor((e.detail && e.detail.id) || null),
      'pace:open-achievements': () => a.abrirLogros(),
      'pace:open-support': () => a.abrirApoyo(),
      'pace:sidebar-action': sidebar,
    };
    Object.keys(escuchas).forEach((k) => window.addEventListener(k, escuchas[k]));
    return () => Object.keys(escuchas).forEach((k) => window.removeEventListener(k, escuchas[k]));
  }, []);
}

Object.assign(window, { usePaceEventos });
