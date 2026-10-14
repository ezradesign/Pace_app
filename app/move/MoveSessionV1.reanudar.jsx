/* PACE · MUEVE Y ESTIRA A MEDIAS (Ez, 14 oct. 2026: sesiones-9, opción A)
   =====================================================================
   Recargar, tocar «Hay una versión nueva» o «Salir» a mitad de una rutina de
   Mueve o Estira la perdía entera: no contaba nada y la barra lateral ofrecía la
   misma rutina desde el principio. Respira se puede seguir desde s186, y Ez
   eligió lo mismo aquí, con «Continúa · Cuello · Paso 2 de 4».

   Es la regla de Respira con lo que cambia del cuerpo:
   · SE GUARDA EL PASO, no el segundo dentro de él. Al volver se entra por
     «Prepárate» y el paso empieza desde su principio, colocación incluida:
     nadie se reengancha a mitad de un estiramiento que no estaba haciendo
     (Respira guarda la ronda y no la fase, por lo mismo).
   · LO HECHO SIGUE: el tiempo de la sesión (lo que va a la semana), el de
     trabajo, las repeticiones guiadas y la hora de arranque. Nada se acredita
     hasta terminar, y el rato fuera no suma porque los relojes no corren.
   · Caduca a las 2 h y con el día, como Respira. Se conserva al salir y se
     borra al terminar. Dentro de un Camino no se guarda: lo que se sigue ahí
     es el Camino, que tiene su propio «Continúa».
   · Clave propia, `pace.cuerpo.v1`, fuera de `pace.state.v2` (el reparto de
     `pace.breathe.v1` y `pace.timer.v1`), y su latido entre pestañas en
     `pace.cuerpo.viva` (`useSesionViva`, SessionClock.jsx).
   · EL REGISTRO TIENE UNA SOLA DUEÑA: el efecto de `useCuerpoPersistencia`
     escribe mientras la sesión corre y borra al llegar a 'done'.

   CARGA ANTES QUE `MoveSessionV1.jsx`, que lo llama en su cuerpo. */

const CUERPO_KEY = 'pace.cuerpo.v1';
const CUERPO_VIVA_KEY = 'pace.cuerpo.viva';
const CUERPO_VENTANA_MS = 2 * 60 * 60 * 1000;   // 2 h · el mismo juicio que Respira

/* La rutina de cuerpo de un id, también las propias de «Tus rutinas», que no
   están en ningún catálogo y se acreditan como Mueve entren por donde entren. */
function cuerpoRutina(id) {
  const c = window.resolveBodyRoutine && window.resolveBodyRoutine(id);
  if (c && c.routine) return c;
  const propia = window.getCustomRoutine && window.getCustomRoutine(id);
  return propia ? { routine: propia, source: 'move' } : null;
}

/* leerCuerpoGuardada() -> el registro si sigue siendo ofrecible, o null. Total
   y silenciosa, como `leerRespiraGuardada`: cualquier cosa rara -> null. */
function leerCuerpoGuardada(ahora) {
  try {
    const g = JSON.parse(localStorage.getItem(CUERPO_KEY) || 'null');
    const t = Number.isFinite(ahora) ? ahora : Date.now();
    if (!g || g.v !== 1 || typeof g.routineId !== 'string') return null;
    if (!Number.isFinite(g.savedAt) || t < g.savedAt || t - g.savedAt > CUERPO_VENTANA_MS) return null;
    if (toISODate(g.savedAt) !== toISODate(t)) return null;
    const c = cuerpoRutina(g.routineId);
    const pasos = c && Array.isArray(c.routine.steps) ? c.routine.steps.length : 0;
    if (!Number.isInteger(g.step) || g.step < 0 || g.step >= pasos) return null;
    if (window.canAccessRoutine && !window.canAccessRoutine(g.routineId)) return null;
    if (sesionVivaFuera(CUERPO_VIVA_KEY, t)) return null;   // sigue viva en otra pestaña
    /* Blindaje, como en Respira: más de tres veces lo que dura la rutina es un
       registro corrupto, no una sesión. */
    const planS = Math.max(60, (c.routine.min || 0) * 60,
      estimateDuration(moveRutinaGuiada(c.routine), v1RestSeconds()).maxSec || 0);
    if (!Number.isFinite(g.sesionMs) || g.sesionMs < 0 || g.sesionMs > planS * 3000) return null;
    return Object.assign({}, g, {
      kind: g.kind === 'extra' ? 'extra' : 'move', paso: g.step + 1, pasos: pasos,
      startedAt: Number.isFinite(g.startedAt) ? g.startedAt : g.savedAt,
    });
  } catch (e) { return null; }
}

function olvidarCuerpoGuardada() {
  try { localStorage.removeItem(CUERPO_KEY); } catch (e) {}
}

/* cuerpoReanudacion(routine, guardado) -> con qué arranca la sesión. PURA. Sin
   registro de ESTA rutina, el comienzo de siempre: el runner no necesita ramas. */
function cuerpoReanudacion(routine, guardado) {
  const ahora = Date.now();
  const cero = { step: 0, sesionMs: 0, activoMs: 0, reps: 0, startedAt: ahora, reanudada: false };
  if (!routine || !guardado || guardado.routineId !== routine.id) return cero;
  const n = (x) => (Number.isFinite(x) && x > 0 ? x : 0);
  return {
    step: Math.min(Math.max(0, guardado.step | 0), routine.steps.length - 1),
    sesionMs: n(guardado.sesionMs), activoMs: n(guardado.activoMs), reps: n(guardado.reps),
    startedAt: Number.isFinite(guardado.startedAt) && guardado.startedAt <= ahora ? guardado.startedAt : ahora,
    reanudada: true,
  };
}

/* La sesión a medias que ofrece la barra: solo hay una tarjeta, así que va la
   más reciente de Respira y de Mueve/Estira. */
function sesionAMedias() {
  const r = (window.leerRespiraGuardada && window.leerRespiraGuardada()) || null;
  const c = leerCuerpoGuardada();
  if (r && c) return c.savedAt > r.savedAt ? c : r;
  return r || c;
}

/* Escribe al cambiar de paso o de pausa, al ocultarse la página y al salir
   (desmontar); borra al terminar. `d` trae los relojes y dos lectores
   (`reps`, `startedAt`) porque sus valores viven en refs del runner.
   UN SOLO ESCRITOR AL IRSE: ocultarse llega antes que todo lo demás al recargar,
   cerrar la pestaña o mandar la app al fondo. Con `pagehide` también, el banco
   de mutantes lo destapó: quitar cualquiera de los dos dejaba las pruebas en
   verde, así que no había forma de saber si alguno funcionaba. */
function useCuerpoPersistencia(d) {
  const ref = React.useRef(d);
  ref.current = d;
  const escribir = () => {
    const c = ref.current;
    if (!c || !c.routine || c.inPath || c.stage !== 'run') return;
    try {
      localStorage.setItem(CUERPO_KEY, JSON.stringify({
        v: 1, routineId: c.routine.id, kind: c.kind, step: c.stepIdx,
        sesionMs: Math.round(c.relojSesion.segundos() * 1000),
        activoMs: Math.round(c.relojActivo.segundos() * 1000),
        reps: c.reps(), startedAt: c.startedAt(), savedAt: Date.now(),
      }));
    } catch (e) {}
  };
  React.useEffect(() => {
    if (d.stage === 'done') { olvidarCuerpoGuardada(); return; }
    escribir();
  }, [d.stage, d.stepIdx, d.paused]);
  React.useEffect(() => {
    const alEsconder = () => { if (document.visibilityState === 'hidden') escribir(); };
    document.addEventListener('visibilitychange', alEsconder);
    return () => {
      document.removeEventListener('visibilitychange', alEsconder);
      escribir();   // salir ES la interrupción que se quiere recuperar
    };
  }, []);
  useSesionViva(CUERPO_VIVA_KEY, d.inPath ? null : d.routine && d.routine.id, d.stage !== 'done');
}

Object.assign(window, {
  cuerpoRutina, leerCuerpoGuardada, olvidarCuerpoGuardada, cuerpoReanudacion, sesionAMedias, useCuerpoPersistencia,
});
