/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   FocusTimer.pestanas — un bloque de Foco, aunque PACE esté abierto en dos pestañas.

   Una pestaña que se abre con un bloque en marcha lo recoge de `pace.timer.v1` y lo enseña (s102).
   Hasta aquí cada una seguía después por su cuenta: pausar en una no pausaba la otra, que terminaba
   el bloque y lo contaba mientras la primera decía «Continuar»; y si las dos llegaban al final, el
   bloque contaba dos veces (dos eventos de Foco; y con el estado compartido de
   state-core.pestanas.js, también dos bloques y 50 minutos en «Hoy»). Caza del 10 oct., foco-5 y -6.

   DOS PIEZAS, y cada una con la herramienta que le toca:

   · LO QUE SE VE va por `BroadcastChannel`: empezar o continuar, pausar y reiniciar en una pestaña
     se repite en las demás con el mismo bloque (`id`) y el mismo final. Si un aviso llega antes que
     los minutos nuevos del estado, espera a que casen. Un aviso perdido solo deja una pestaña con
     otra cara; contar lo decide lo de abajo.
   · CONTAR UNA VEZ es exclusión entre pestañas, y eso solo lo da Web Locks: la primera que llega al
     final coge el candado del bloque SIN esperar y cuenta (campana, minutos, la pausa); la que llega
     a la vez no lo consigue y se calla. Quien cuenta guarda el candado diez minutos, y además deja
     el `id` en el estado (`focoContado`), que ya viaja a las demás: una pestaña dormida que despierte
     más tarde ve que está contado. Sin Web Locks (Safari anterior a 15.4) se cuenta como siempre.

   Los modos Pausa y Larga no cuentan nada y siguen siendo de cada pestaña. */

const { useEffect: useEffectFTP, useRef: useRefFTP } = React;

var PACE_FOCO_CANAL = 'pace.foco.v1';
var PACE_FOCO_CANDADO_MS = 10 * 60 * 1000;

function paceFocoNuevoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* El id del bloque guardado en `pace.timer.v1`. Uno guardado antes de que hubiera ids lo identifica
   igual su final, que es el mismo para todas las pestañas. */
function paceFocoIdGuardado(endsAt) {
  try {
    var v = JSON.parse(localStorage.getItem('pace.timer.v1') || 'null');
    if (v && v.endsAt === endsAt && typeof v.id === 'string' && v.id) return v.id;
  } catch (e) {}
  return 'e' + endsAt;
}

function paceFocoContar(id, contar) {
  var ya = function () { var s = getState(); return !!(s && s.focoContado === id); };
  if (ya()) return;
  var locks = typeof navigator !== 'undefined' ? navigator.locks : null;
  if (!locks || typeof locks.request !== 'function') { contar(); return; }
  locks.request('pace.foco.bloque.' + id, { ifAvailable: true }, function (candado) {
    if (!candado || ya()) return;
    contar();
    return new Promise(function (r) { setTimeout(r, PACE_FOCO_CANDADO_MS); });
  }).catch(function () {});
}

/* El canal. Devuelve `avisar(mensaje)`, que las acciones de ESTA pestaña llaman; lo que llega de
   otra se aplica con `seguir`, `congelar` y `reset` del motor sin volver a avisar (no hay eco). */
function useFocoPestanas(o) {
  const vivo = useRefFTP(o);
  vivo.current = o;
  const canalRef = useRefFTP(null);
  const pendienteRef = useRefFTP(null);

  const aplicar = (m) => {
    const u = vivo.current;
    if (!u.activo) return;
    if (m.tipo === 'corre') {
      if (m.minutos !== u.minutos) { pendienteRef.current = m; return; }
      pendienteRef.current = null;
      u.bloqueRef.current = m.id;
      u.inicioRef.current = m.endsAt - u.minutos * 60 * 1000;
      u.seguir(m.endsAt);
    } else if (m.id && m.id === u.bloqueRef.current) {
      if (m.tipo === 'pausa') u.congelar(m.restanteMs);
      else if (m.tipo === 'reinicia') u.reset();
    }
  };

  useEffectFTP(() => {
    if (typeof BroadcastChannel !== 'function') return undefined;
    let canal;
    try { canal = new BroadcastChannel(PACE_FOCO_CANAL); } catch (e) { return undefined; }
    canalRef.current = canal;
    canal.onmessage = (ev) => { try { aplicar(ev.data || {}); } catch (e) {} };
    return () => { canalRef.current = null; try { canal.close(); } catch (e) {} };
  }, []);

  /* El aviso que llegó antes que los minutos: se aplica cuando casan, si su bloque sigue vivo. */
  useEffectFTP(() => {
    const m = pendienteRef.current;
    if (m && o.activo && m.minutos === o.minutos && m.endsAt > Date.now()) aplicar(m);
  }, [o.minutos, o.activo]);

  return (m) => {
    try { if (canalRef.current) canalRef.current.postMessage(Object.assign({ minutos: vivo.current.minutos }, m)); } catch (e) {}
  };
}

Object.assign(window, { PACE_FOCO_CANAL, PACE_FOCO_CANDADO_MS, paceFocoNuevoId, paceFocoIdGuardado, paceFocoContar, useFocoPestanas });
