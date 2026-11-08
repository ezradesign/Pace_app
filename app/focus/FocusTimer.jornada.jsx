/* PACE · El aro como paso actual de la jornada (Ez, 5 nov. 2026: 1A)
   =================================================================
   Sobre docs/proposals/jornada-paso-actual.html. Con «A tu ritmo», el aro dice qué
   toca y qué viene, con un solo botón principal:

     · EN LA PAUSA, «Hacer la pausa» es el botón verde y «Empezar ya el bloque 2» baja
       a enlace. Antes, quien cerraba la ventana de la pausa con «Ahora no» se
       encontraba el bloque siguiente como lo más a mano, y saltarse la pausa era lo
       fácil. Con los platos ya hechos no hay nada que proponer y el aro vuelve a lo
       de siempre: el reloj sigue y el botón empieza el bloque.
     · «HACER LA PAUSA» ENTRA POR LA PUERTA DE LA PARADA de la línea del día
       (`pace:sidebar-action`), con el aviso de la apnea y la vista previa de siempre.
     · «DESPUÉS: MUEVE · 2 MIN», solo en el escritorio: en el móvil lo dice la fila
       «Luego», justo debajo, y repetirlo a un dedo sería ruido.
     · «PAUSAR FOCO» Y «REANUDAR FOCO», para que «pausa» sea solo el descanso. Por
       libre siguen «Pausar» y «Continuar»: allí no hay otra pausa con la que confundirse.

   Las dos líneas de debajo del botón van en la fila del ciclo, que con plan ya estaba
   oculta sin soltar su sitio: no añaden alto y la home no pide scroll. La etiqueta del
   ciclo se queda oculta dentro porque home-geometry.js la busca por el texto. */

/* El plato sin hacer de la pausa abierta, o null. No es `ritmoPlatoQueToca`, que con
   todos hechos devuelve el primero para poder repetirlo: aquí eso propondría otra vez
   lo que ya se hizo. */
function aroPlatoPendiente(s) {
  const a = typeof ritmoPausaAbierta === 'function' ? ritmoPausaAbierta(s) : null;
  if (!a) return null;
  return a.platos.find((p) => a.hechos.indexOf(p.id) === -1) || null;
}

/* ¿Acabó el tiempo de la pausa? La parada sigue abierta hasta que empiece el bloque, pero
   eso también vale para la comida, que no cuenta tiempo, y para quien pasó a mano a Foco
   con la pausa aún corriendo: en esos dos casos no ha terminado nada. */
function aroPausaTerminada(s) {
  if (typeof ritmoPausaCuenta !== 'function' || ritmoPausaCuenta(s)) return false;
  const a = ritmoPausaAbierta(s);
  return !!a && a.it.tipo === 'pausa';
}

/* «Mueve · 2 min», «Respira y Estira · 15 min», «Comida · 1 h» o «Bloque 3»: lo que viene
   detrás del bloque que toca. null si detrás no hay nada que nombrar. */
function aroDespues(s, t, tn) {
  const p = typeof ritmoPlan === 'function' ? ritmoPlan(s) : null;
  const it = p && p.actual ? ritmoDetras(p.m, p.actual) : null;
  if (!it) return null;
  if (it.tipo === 'comida') return t('ritmo.comida') + ' · ' + ritmoDuracion(it.dur);
  if (it.tipo === 'foco') return tn('ritmo.aro.despues.bloque', { n: p.hechos + 2 });
  const platos = it.platos || [];
  if (platos.length > 1) {
    return tn('ritmo.y', { a: ritmoModulo(platos[0].modulo, t), b: ritmoModulo(platos[1].modulo, t) }) + ' · ' + it.dur + ' min';
  }
  if (!platos.length) return null;
  const r = platos[0].rutina;
  return ritmoModulo(platos[0].modulo, t) + ' · ' + ((r && r.min) || it.dur) + ' min';
}

/* PASADA LA SALIDA (Ez, 1A del 7 nov. 2026; state-ritmo.recolocar.jsx): el rótulo dice «Tu jornada
   ya terminó» y la línea de la hora, lo hecho («45 min de foco»). El reloj y el botón son los de por
   libre, así que quien quiera sigue; con un Foco libre en marcha, el aro es el de siempre.
   HECHOS TODOS LOS BLOQUES, el último cierra el día también en el aro (Ez, V2 A del 7 nov. 2026),
   antes o después de la salida: «Jornada cerrada», lo hecho, «Lo que queda del día es tuyo» y
   «Seguir por libre» (`sub` y `cta`), donde decía «Foco manual · Ciclo completado» y «Empezar
   otro ciclo», como si no hubiera jornada. */
function aroCerrado(s, t, tn) {
  const p = typeof ritmoPlan === 'function' ? ritmoPlan(s) : null;
  const todo = !!p && p.total > 0 && p.hechos >= p.total;
  if (!p || !(p.cerrado || todo)) return null;
  const f = ritmoFocoHecho(p);
  const hecho = f > 0 ? tn('ritmo.aro.hecho', { f: ritmoDuracion(f) }) : null;
  if (todo) return { label: t('ritmo.hecho'), hecho, sub: t('ritmo.aro.tuyo'), cta: t('ritmo.aro.libre') };
  return { label: t('ritmo.fuera'), hecho };
}

/* Lo que la jornada le cambia al aro según el momento. `cta`, si manda en el botón;
   `lleno`, si ese botón va relleno aunque el reloj corra; `fila`, la línea de debajo. */
function aroJornada({ state, t, tn, aro, enPausaRitmo, pausaRitmo, status, empezarYa }) {
  if (enPausaRitmo) {
    const plato = aroPlatoPendiente(state);
    if (!plato) return {};
    return {
      lleno: true,
      cta: {
        label: t('ritmo.aro.hacerPausa'),
        action: () => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: plato.id, parada: true } })),
      },
      fila: (
        <button type="button" className="pace-aro-seguir" data-pace-aro-seguir onClick={empezarYa}>
          {tn('ritmo.pausa.ya', { n: pausaRitmo.n })}
        </button>
      ),
    };
  }
  if (!aro) {
    /* La jornada cerrada con todos sus bloques: el botón sigue por libre (aroCerrado). */
    const c = state.focusMode === 'foco' && status !== 'running' && status !== 'paused' ? aroCerrado(state, t, tn) : null;
    return c && c.cta ? { cta: { label: c.cta } } : {};
  }
  const despues = aroDespues(state, t, tn);
  return {
    cta: status === 'running' ? { label: t('ritmo.aro.pausar') }
      : status === 'paused' ? { label: t('ritmo.aro.reanudar') }
      : null,
    fila: despues ? <span className="pace-aro-despues" data-pace-aro-despues>{tn('ritmo.aro.despues', { q: despues })}</span> : null,
  };
}

/* La fila de debajo del botón: el ciclo por libre y, con plan, su sitio guardado, ocupado
   o no por la línea de la jornada. */
function AroFila({ cycle, cycleLabel, oculta, fila }) {
  const fuera = oculta || !!fila;
  const callado = fuera ? { visibility: 'hidden' } : null;
  return (
    <div style={fila ? { ...focusStyles.cycleDots, position: 'relative' } : oculta ? { ...focusStyles.cycleDots, visibility: 'hidden' } : focusStyles.cycleDots}>
      {fila ? <span className="pace-aro-fila" data-pace-aro-fila>{fila}</span> : null}
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{
          ...callado,
          width: 4, height: 4, borderRadius: '50%',
          background: (cycle % 4) > i ? 'var(--focus)' : 'var(--line-2)',
        }} />
      ))}
      <span style={{ ...callado, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginLeft: 10 }}>{cycleLabel}</span>
    </div>
  );
}

(function paceAroJornadaCss() {
  if (document.getElementById('pace-aro-jornada-css')) return;
  const s = document.createElement('style');
  s.id = 'pace-aro-jornada-css';
  s.textContent = `
.pace-aro-fila { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); white-space: nowrap; }
.pace-aro-despues, .pace-aro-seguir { font-family: var(--font-display); font-style: italic; font-size: 14px; color: var(--ink-2); }
.pace-aro-seguir { background: none; border: 0; padding: 2px 0; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.pace-aro-seguir:hover { color: var(--ink); }
.pace-aro-seguir:focus-visible { outline: 2px solid var(--focus-cta); outline-offset: 2px; }
@media ${PACE_CORTE_MOVIL} { .pace-aro-despues { display: none; } }
`;
  document.head.appendChild(s);
})();

Object.assign(window, { aroJornada, aroPausaTerminada, aroPlatoPendiente, aroDespues, aroCerrado, AroFila });
