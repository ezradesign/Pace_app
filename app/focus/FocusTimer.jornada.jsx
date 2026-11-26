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
  if (!a || (a.p.estados || {})[a.n] === 'cuenta') return null;   /* hecha a tu manera (4A del 8 nov.) */
  return a.platos.find((p) => a.hechos.indexOf(p.id) === -1) || null;
}

/* ¿Acabó el tiempo de la pausa? La parada sigue abierta hasta que empiece el bloque, pero
   eso también vale para la comida, que no cuenta tiempo, y para quien pasó a mano a Foco
   con la pausa aún corriendo: en esos dos casos no ha terminado nada.
   Y SOLO UN RATO (Ez, 4A del 18 nov. 2026, sobre su V1 A del 7 nov.): quien cerró PACE a media mañana y
   volvió a las 16:10 leía «Pausa terminada» cuatro horas y media después. Pasados 15 min, lo de siempre. */
const ARO_PAUSA_TERMINADA_MIN = 15;
function aroPausaTerminada(s) {
  if (typeof ritmoPausaCuenta !== 'function' || ritmoPausaCuenta(s)) return false;
  const a = ritmoPausaAbierta(s);
  if (!a || a.it.tipo !== 'pausa') return false;
  return ritmoAhoraExacto() - (a.it.desde + a.it.dur) <= ARO_PAUSA_TERMINADA_MIN;
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
   otro ciclo», como si no hubiera jornada.
   CERRADO POR LA HORA CON BLOQUES SIN HACER, el mismo cierre y los mismos textos (caza de la
   semana, 8 nov. 2026): solo cambiaba el rótulo, y debajo quedaba «Ciclo completado · Empezar
   otro ciclo» (el último bloque acabó con el portátil cerrado) o «Atención sostenida · Empezar
   foco». La tarjeta ya decía «Jornada cerrada». */
function aroCerrado(s, t, tn) {
  const p = typeof ritmoPlan === 'function' ? ritmoPlan(s) : null;
  const todo = !!p && p.total > 0 && p.hechos >= p.total;
  if (!p || !(p.cerrado || todo)) return null;
  const f = ritmoFocoHecho(p);
  const hecho = f > 0 ? tn('ritmo.aro.hecho', { f: ritmoDuracion(f) }) : null;
  return { label: t('ritmo.hecho'), hecho, sub: t('ritmo.aro.tuyo'), cta: t('ritmo.aro.libre') };
}

/* EN PLENA COMIDA DE LA JORNADA (Ez, 1A del 22 nov. 2026, sobre docs/audits/caza-completa-22nov/web/comida/):
   elegida la jornada a las 14:20 (o de vuelta a PACE con la comida empezada), la comida va hasta las 15:00
   (su B del 22 oct.), pero el aro decía «Bloque 1 de 3 · 45:00 · Empezar jornada» y, al pulsar, el bloque se
   comía la comida. Ahora, con el aro parado, el aro es la comida: «Comida · Hasta las 15:00», la cuenta de lo
   que queda y «Lejos de la pantalla»; sin botón verde, «Empezar ya el bloque 1» como enlace por si ya has
   comido, y debajo «Después: bloque 1 · 45 min». «No comes», en la frase, la quita del día como siempre.
   Devuelve `{ hasta, queda }` (minutos del día, segundos), o null. Se repinta cada segundo mientras dura. */
const { useState: useStateAroC, useEffect: useEffectAroC } = React;
function aroComida(state, aro, status) {
  if (!aro || status === 'running' || status === 'paused' || typeof ritmoComidaEnCurso !== 'function') return null;
  const c = ritmoComidaEnCurso(ritmoPlan(state));
  if (!c) return null;
  const fin = new Date(); fin.setHours(Math.floor((c.desde + c.dur) / 60), (c.desde + c.dur) % 60, 0, 0);
  return { hasta: c.desde + c.dur, queda: Math.max(0, Math.round((fin.getTime() - Date.now()) / 1000)) };
}
function useAroComida(state, aro, status) {
  const c = aroComida(state, aro, status);
  const [, repinta] = useStateAroC(0);
  useEffectAroC(() => {
    if (!c) return undefined;
    const id = setInterval(() => repinta((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [!!c]);
  return c;
}
/* El botón del aro en la comida, como el enlace «Empezar ya el bloque N» de la pausa, con el alto del botón. */
const aroEnlaceEstilo = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '8px 6px',
  whiteSpace: 'nowrap', background: 'none', border: 0, boxShadow: 'none', cursor: 'pointer', color: 'var(--ink-2)',
  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, fontWeight: 400, textDecoration: 'underline', textUnderlineOffset: 3 };

/* Lo que la jornada le cambia al aro según el momento. `cta`, si manda en el botón;
   `lleno`, si ese botón va relleno aunque el reloj corra; `fila`, la línea de debajo. */
function aroJornada({ state, t, tn, aro, enPausaRitmo, pausaRitmo, status, empezarYa, porLibre, comida }) {
  if (comida && aro) {
    const p = ritmoPlan(state);
    const q = tn('ritmo.aro.despues.bloque', { n: aro.n }) + (p && p.actual ? ' · ' + ritmoDuracion(ritmoMinutosElegidos(state, p) || p.actual.dur) : '');
    return {
      enlace: true,
      cta: { label: tn('ritmo.pausa.ya', { n: aro.n }) },
      fila: <span className="pace-aro-despues" data-pace-aro-despues>{tn('ritmo.aro.despues', { q })}</span>,
    };
  }
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
          {pausaRitmo.cierre ? t('ritmo.pausa.cerrar') : tn('ritmo.pausa.ya', { n: pausaRitmo.n })}
        </button>
      ),
    };
  }
  if (!aro) {
    /* La jornada cerrada con todos sus bloques: el botón sigue por libre (aroCerrado). «Seguir por
       libre» es «Hoy voy por libre» (Ez, A del 19 nov. 2026: «home, sin arrancar»): retira el día y
       deja el aro parado en Foco manual. Antes arrancaba un Foco y la tarjeta seguía «Jornada cerrada». */
    const c = state.focusMode === 'foco' && status !== 'running' && status !== 'paused' ? aroCerrado(state, t, tn) : null;
    return c && c.cta ? { cta: { label: c.cta, action: porLibre } } : {};
  }
  const despues = aroDespues(state, t, tn);
  return {
    cta: status === 'running' ? { label: t('ritmo.aro.pausar') }
      : status === 'paused' ? { label: t('ritmo.aro.reanudar') }
      : null,
    fila: despues ? <span className="pace-aro-despues" data-pace-aro-despues>{tn('ritmo.aro.despues', { q: despues })}</span> : null,
  };
}

/* EL DÍA PREPARADO VA AL ARO (Ez, A del 26 nov. 2026, auditoría de la primera impresión,
   docs: https://claude.ai/artifact/HJjYh8srNKNGGp7UBa3S3J). Con tu semana guardada, cada mañana tu
   día llega contestado (`ritmoHabitual`), pero el aro seguía en «Foco manual · Empezar foco» y la
   jornada esperaba abajo tras «Preparar jornada»: dos botones, y ganaba el de arriba, al revés de lo
   que dice la visita. Ahora, mientras ese día no está elegido y el aro está parado, el aro ya es la
   jornada: «Tu jornada, hasta las 17:00» arriba (una línea sola: con dos, en 1280×800 el botón caía
   sobre «Actividades»), los minutos del primer bloque si
   empezaras ahora y «Empezar jornada», que elige el día (`ritmoComenzarHabitual`, lo mismo que
   «Preparar jornada») y arranca el bloque en el mismo toque. Debajo, «o un foco suelto de 25 min»,
   el Foco de siempre con tus minutos, sin tocar el día. ES UNA VISTA PREVIA: no escribe nada hasta
   que se toca, como la línea de la tarjeta (RitmoManana.jsx). El plan se calcula sobre una copia del
   estado con el día puesto como lo pondría `ritmoElegir`. Devuelve null si no toca. */
function aroPrevia(state, t, tn) {
  if (state.focusMode !== 'foco' || typeof ritmoHabitual !== 'function' || typeof ritmoPlan !== 'function') return null;
  const H = ritmoHabitual(state);
  if (!H) return null;
  const R = ritmoDe(state);
  if (R.dia || R.libre || !R.horario) return null;
  const dia = { fecha: ritmoHoy(), opcion: H.opcion, desde: Math.max(R.horario.inicio, ritmoAhora()),
                cicloBase: Number(state.cycle) || 0, cambios: {}, pausa: null };
  let p = null;
  try { p = ritmoPlan(Object.assign({}, state, { ritmo: Object.assign({}, state.ritmo || {}, { dia, libre: null }) })); } catch (e) { return null; }
  if (!p || !p.actual || p.cerrado) return null;
  const dur = typeof ritmoDurSiEmpiezas === 'function' ? ritmoDurSiEmpiezas(p, ritmoAhoraExacto()) : null;
  const min = Math.max(1, Math.round(dur || p.actual.dur || 0));
  return {
    hasta: tn('ritmo.aro.hasta', { h: ritmoHora(p.m.hasta) }),
    empezar: t('ritmo.aro.empezar'),
    min,
  };
}

/* «Empezar jornada» desde la vista previa elige el día y, en cuanto el aro ya es la jornada (con los
   minutos de su bloque puestos por `ritmoSincronizar`), arranca, como «Empezar ya el bloque N». Y la
   línea bajo el reloj (el hueco del subtítulo; en la fila de abajo no cabía en móvil):
   «o un foco suelto de 25 min», el Foco de siempre, que no toca el día. */
const { useRef: useRefAroP, useEffect: useEffectAroP } = React;
function useAroPrevia({ previa, aro, state, status, empezar, tn }) {
  const pedido = useRefAroP(false);
  useEffectAroP(() => {
    if (!pedido.current) return;
    if (!aro || state.focusMode !== 'foco' || status !== 'idle') { if (!previa) pedido.current = false; return; }
    pedido.current = false;
    empezar();
  });
  return {
    empezar: () => { pedido.current = true; ritmoComenzarHabitual(); },
    suelto: previa ? (
      <button type="button" className="pace-aro-seguir" data-pace-aro-suelto onClick={empezar}>
        {tn('ritmo.aro.suelto', { n: state.focusMinutes })}
      </button>
    ) : null,
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
      <span data-pace-ciclo style={{ ...callado, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginLeft: 10 }}>{cycleLabel}</span>
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

Object.assign(window, { aroPrevia, useAroPrevia, aroJornada, aroComida, useAroComida, aroEnlaceEstilo, aroPausaTerminada, aroPlatoPendiente, aroDespues, aroCerrado, AroFila });
