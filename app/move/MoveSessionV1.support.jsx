/* PACE · Runner v1 — soporte sin UI (s113 · runner guiado)
   =========================================================
   Extraído de MoveSessionV1.jsx (patrón FocusTimer.support, regla <500 ln)
   al crecer el runner con el motor guiado: constantes del método, helpers de
   cadencia/progreso/tamaño y el CSS del pulso + compactación por ALTURA.
   Carga ANTES de MoveSessionV1.jsx (su consumidor).

   Principio rector del motor guiado (s113): «el usuario toca para empezar,
   pausar o adaptar; NO para empujar la rutina hacia delante». */

/* Constantes del método:
     V1_PLACE_SECONDS   gate auto de colocación (s111/s112).
     V1_REP_SECONDS     cadencia por defecto de reps de FUERZA (~4 s/rep:
                        2 bajar + 2 subir, ref. ACE 2-8 s). Un paso puede
                        declarar `repSeconds` propio (control postural con
                        retención, p. ej. chin tucks 8 s); B2.2b-1 lo
                        formaliza como `tempo`.
     V1_CHANGE_SECONDS  transición AUTO de lado (enmienda R3, s113): señal
                        suave → pantalla con el lado siguiente → empieza solo.
                        Override por paso llega con los metadatos B2.2b-1. */
const V1_PLACE_SECONDS = 5;
const V1_REP_SECONDS = 4;
const V1_CHANGE_SECONDS = 10;
const V1_PREP_SECONDS = 5;   // cuenta 5·4·3·2·1 antes del paso 0 (s113)
/* Opción A del runner guiado (Ez): ningún paso espera a que pulses. La colocación que antes
   esperaba a «Estoy listo» (suelo, pared, material) cuenta sola, con al menos 20 s, y «+15 s»
   suma tiempo a la colocación y al cambio de lado. */
const V1_READY_SECONDS = 20;
const V1_MAS_TIEMPO = 15;

/* isDev: localhost / 127.0.0.1 / file:// (mismo criterio que useT.jsx). Sólo
   activa el dev-check de duración declarada vs calculada — invisible en prod. */
const _v1IsDev = (typeof location !== 'undefined') &&
  (['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:');

/* tempo (s115/B2.2b-1): generaliza el rep-seconds. Objeto {down,hold,up} → suma;
   número → valor; `repSeconds` legacy y V1_REP_SECONDS como respaldo. ÚNICA
   fuente de la cadencia de una rep guiada. */
function v1TempoSeconds(step) {
  const tm = step && step.tempo;
  if (tm && typeof tm === 'object') return (tm.down || 0) + (tm.hold || 0) + (tm.up || 0);
  if (typeof tm === 'number') return tm;
  if (step && typeof step.repSeconds === 'number') return step.repSeconds;
  return V1_REP_SECONDS;
}
function v1RepSeconds(step) { return v1TempoSeconds(step); }
function v1RepTarget(step) {
  return (typeof step.reps === 'object' ? step.reps.target : step.reps) || 8;
}
/* transición de lado (perSide): segundos declarados o el default s113 (10 s). */
function v1TransitionSeconds(step) {
  return (step && step.transition && typeof step.transition.seconds === 'number')
    ? step.transition.seconds : V1_CHANGE_SECONDS;
}
/* completion: 'guided' (avance auto) por defecto en reps; 'manual' reservado
   (sin piloto). El runner respeta el modo; la duración de guided es fija. */
function v1CompletionMode(step) {
  if (step && step.completion && step.completion.mode) return step.completion.mode;
  return step && step.mode === 'reps' ? 'guided' : 'timed';
}

/* Descanso entre series (s114): los rests con restKind:'betweenSets' toman su
   duración del ajuste de Ajustes (state.restBetweenSets, presets 20/30/45); el
   resto de pasos (incl. los cierres respiratorios sin restKind) usan su `dur`
   declarado. Lee el store global (patrón de Sound.jsx) — el runner re-renderiza
   cada segundo, así que un cambio del preset se refleja en ≤1 s. */
function v1RestSeconds() {
  var s = (typeof getState === 'function') ? getState() : null;
  return (s && typeof s.restBetweenSets === 'number') ? s.restBetweenSets : 30;
}
function v1StepDur(step) {
  if (!step) return 0;
  if (step.mode === 'rest' && step.restKind === 'betweenSets') return v1RestSeconds();
  return step.dur || 0;
}

/* Gate de colocación (s115): comportamiento del runner + estimación de duración
   en UNA sola fuente. Toda colocación CUENTA SOLA (opción A del runner guiado):
     ready — declarada en el paso (suelo, pared, material): cuenta al menos
             V1_READY_SECONDS; antes esperaba a «Estoy listo».
     auto  — pasos con reloj (timed/perSide) e idx>0, o el 1er set de fuerza
             (reps con instruction.setup y NO tras un rest) → 5 s.
     none  — resto. `setup:número` (s112) sigue siendo una cuenta explícita.
   Las dos primeras devuelven mode 'auto': el runner no distingue. */
function v1StepSetup(routine, idx) {
  const st = routine.steps[idx];
  if (!st) return { mode: 'none', estimatedSeconds: 0 };
  if (st.setup && st.setup.mode === 'ready') {
    return { mode: 'auto', estimatedSeconds: Math.max(V1_READY_SECONDS, st.setup.estimatedSeconds || 0) };
  }
  if (typeof st.setup === 'number') return { mode: 'auto', estimatedSeconds: st.setup };
  const clocked = st.mode === 'timed' || st.mode === 'perSide';
  const prev = idx > 0 ? routine.steps[idx - 1] : null;
  const afterRest = !!(prev && prev.mode === 'rest');
  if (clocked && idx > 0) return { mode: 'auto', estimatedSeconds: V1_PLACE_SECONDS };
  if (st.mode === 'reps' && st.instruction && st.instruction.setup && !afterRest) {
    return { mode: 'auto', estimatedSeconds: V1_PLACE_SECONDS };
  }
  return { mode: 'none', estimatedSeconds: 0 };
}

/* Progreso 0..1 del step activo (barra segmentada). Reps guiadas (s113):
   el progreso es tiempo guiado / tiempo objetivo — cadencia, no cuota. */
function v1StepProgress(step, side, elapsed) {
  if (step.mode === 'reps') {
    const total = v1RepTarget(step) * v1RepSeconds(step);
    return total ? Math.min(1, elapsed / total) : 0;
  }
  if (step.mode === 'perSide') return (side * step.dur + elapsed) / (2 * step.dur);
  const d = v1StepDur(step);   // rest betweenSets = preset de Ajustes (s114)
  return d ? elapsed / d : 0;
}
/* Peso del step para la barra segmentada (estimación honesta por tipo).
   s115: la rama timed/rest usa v1StepDur — MISMA fuente efectiva que el
   progreso, el aviso de 5 s y el remaining (antes leía step.dur crudo → con el
   preset 20/45 el peso divergía del llenado; deuda del criterio de aceptación). */
function v1StepWeight(step) {
  if (step.mode === 'reps') return v1RepTarget(step) * v1RepSeconds(step);
  if (step.mode === 'perSide') return (step.dur || 20) * 2;
  return v1StepDur(step) || 20;
}

/* Tamaño del visual instructivo por ALTURA de viewport (s112/s113). s119: curva
   CONTINUA de una sola pendiente (0.22) con techo 210. El pre-s119 tenía dos
   ramas con un SALTO en vpH=720 (0.22→0.25 → glifo 158→180, +22 px de golpe):
   como los tiers de compactación de altura empiezan en ≤700, quedaba una banda
   701–~760 px sin compactar y con el glifo ya grande → el bloque rebasaba el
   centro scrollable por pocos px y salía la barra fantasma (medido: 7 px de
   desborde → scrollbar de 15 px; típico en portátiles 1366×768). Una sola
   pendiente elimina la discontinuidad; el suelo 72 conserva el comportamiento
   de poca altura (el glifo cede antes que instrucciones/controles). */
/* s171 · EL CIRCULO CRECE UN 30 % EN ESCRITORIO, y la curva movil NO se toca:
   la referencia que fijo el usuario es «Antidoto silla» en movil, que es esta
   misma curva (179 px a 812 de alto). El factor se aplica DESPUES del clamp, o
   sea que escala la curva entera —suelo 94, techo 273— en vez de mover solo la
   pendiente y dejar el techo donde estaba, que aplanaria el aumento justo en
   las pantallas grandes, que son las que lo piden.
   La piel se lee del CONTRATO `--pace-skin` (`_responsive.pieles.js`), no de un
   `matchMedia` con el 769 copiado: si el corte de pieles se mueve, esto lo
   sigue solo. Se lee del root en cada render (una lectura, no un bucle). */
/* s177 · 1.3 -> 1.118, que es exactamente 1.3 x 0.86.
   EL GLIFO PAGA PARTE DE LOS PIXELES QUE HACEN FALTA PARA CONGELAR EL RUNNER.
   El usuario pidio que al pasar de «colocate» a «ejercicio» no se mueva ni
   cambie de tamanio nada. Congelarlo cuesta: reservar el rotulo de fase son
   26,4 px, reservar la descripcion a 3 lineas otros 24,8, y a 1536x714 ya
   faltaban 15 -- el «Cuidate» se metia DENTRO de la barra. De 204 px el
   circulo pasa a 181.

   Y SE CAMBIA AQUI, EN LA FUENTE UNICA, NO CON CSS EN EL RUNNER. Este numero
   lo consumen TRES sitios (el runner v1, el legacy de MoveModule y la cuenta
   atras de s174) y el comentario de `v1GlyphSizeAhora` dice por que: si uno se
   desvia, «el circulo de la sesion no relevaria al de la preparacion sino que
   saltaria». Encogerlo por CSS solo en el runner habria arreglado un salto
   creando otro, justo el que el usuario esta pidiendo que desaparezca.

   Y ES UN FACTOR CONSTANTE, NO UN TRAMO. La regla de s119 prohibe reintroducir
   un salto por tramos en `v1GlyphSize`: el pre-s119 saltaba de 0.22 a 0.25 en
   vpH=720 y dejaba una banda muerta de 701 a 760 que desbordaba 7 px y sacaba
   scrollbar en portatiles de 1366x768. La curva sigue siendo continua. */
const V1_GLYPH_WEB = 1.118;
function v1EsEscritorio() {
  try {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--pace-skin').trim() === 'escritorio';
  } catch (e) { return false; }
}
function v1GlyphSize(vpH, escritorio) {
  const web = escritorio == null ? v1EsEscritorio() : escritorio;
  return Math.round(Math.max(72, Math.min(210, Math.round(vpH * 0.22))) * (web ? V1_GLYPH_WEB : 1));
}

/* El mismo tamaño, leyendo el viewport de AHORA. La expresión estaba escrita
   tres veces —el círculo del runner v1, el del legacy y, desde s174, el arte de
   la cuenta atrás—, y son tres sitios que TIENEN que dar el mismo número: si
   uno se desviara, el círculo de la sesión no relevaría al de la preparación
   sino que saltaría. Una fuente, y se acabó la coincidencia por costumbre. */
function v1GlyphSizeAhora() {
  return v1GlyphSize((typeof window !== 'undefined' && paceLienzoAlto()) || 800);
}

/* Duración DERIVADA de los pasos (s115/B2.2b-1). Helper PURO: dado el preset de
   descanso, devuelve {minSec,maxSec,breakdown} sin tocar el runner ni el reloj.
     reps guiadas → target × tempo (FIJO; 'manual' añadiría banda, sin piloto).
     perSide      → dur POR LADO × 2 + UNA transición (evita el cuádruple conteo).
     rest         → betweenSets: preset; cierre: su dur.
     timed        → dur.
   + prep global v1 + setup por paso (estimatedSeconds; ready FIJO, nunca cuenta).
   NO se guarda como dato canónico: se recalcula al vuelo (tarjeta, dev-check).
   DURACIÓN PLANIFICADA (no real): «terminar antes» reduce el reloj real, no la
   promesa. La banda del rango nace SÓLO de tiempos variables del contrato
   (completion manual); en los 5 pilotos actuales min===max (guided/timed). */
function estimateDuration(routine, restBetweenSets) {
  const rbs = (typeof restBetweenSets === 'number') ? restBetweenSets : 30;
  const steps = (routine && routine.steps) || [];
  const breakdown = [{ label: 'prep', sec: V1_PREP_SECONDS }];
  let minSec = V1_PREP_SECONDS, maxSec = V1_PREP_SECONDS;
  steps.forEach((st, idx) => {
    const setupSec = v1StepSetup(routine, idx).estimatedSeconds || 0;
    let lo = 0, hi = 0;
    if (st.mode === 'reps') {
      const active = v1RepTarget(st) * v1RepSeconds(st);
      lo = active; hi = v1CompletionMode(st) === 'manual' ? Math.round(active * 1.5) : active;
    } else if (st.mode === 'perSide') {
      lo = hi = (st.dur || 0) * 2 + v1TransitionSeconds(st);
    } else if (st.mode === 'rest') {
      lo = hi = (st.restKind === 'betweenSets') ? rbs : (st.dur || 0);
    } else {
      lo = hi = st.dur || 0;   // timed
    }
    breakdown.push({ i: idx, name: st.name, mode: st.mode, setup: setupSec, active: lo, activeMax: hi });
    minSec += setupSec + lo; maxSec += setupSec + hi;
  });
  return { minSec, maxSec, breakdown };
}

/* Dev-check (s115): compara routine.min DECLARADO con el rango CALCULADO. La
   comparación es a NIVEL de MINUTOS mostrados [floor(min),ceil(max)] — no en
   segundos: una rutina determinista casi nunca cae en un múltiplo exacto de 60,
   así que un umbral en segundos avisaría siempre (ruido). Avisa SÓLO si los
   minutos declarados quedan fuera del rango que ve el usuario (umbral
   verificable, sin ruido para valores dentro). Prod muestra UNA sola promesa
   (la tarjeta usa el derivado); esto es diagnóstico y sólo corre en dev.
   routine.min queda como baseline de auditoría. */
function v1DevCheckDuration(routine, restBetweenSets) {
  if (!_v1IsDev || !routine) return;
  const est = estimateDuration(routine, restBetweenSets);
  const lo = Math.floor(est.minSec / 60), hi = Math.ceil(est.maxSec / 60);
  const outside = routine.min < lo || routine.min > hi;
  const head = `[dur] ${routine.id}: declarado ${routine.min}min vs calculado ${est.minSec}–${est.maxSec}s (rango ${lo}–${hi}min)`;
  if (outside) console.warn(head + ' — DECLARADO fuera del rango mostrado', est.breakdown);
  else console.log(head + ' — dentro', est.breakdown);
}

/* CSS del runner v1 (s113):
   - pace-rep-pulse: pulso de cadencia de las reps guiadas (mitad «bajar» +
     mitad «subir», ease-in-out; la duración real la fija el runner inline
     con repSeconds). NO cuelga de data-pace-essential a propósito: el kill
     global de prefers-reduced-motion (tokens.css) lo congela y queda el
     contador sin animación — el fallback que pide el corte.
   - Compactación por ALTURA, solo ≥641 px de ancho (el responsive móvil por
     anchura de s27/SessionShell sigue gobernando el retrato estrecho, ya
     verificado en 360×640). Orden de reducción: espacios → glifo →
     decorativo; NUNCA instrucciones ni controles. El scroll del centro
     (s112) queda solo como red de seguridad. Tiers: 768 (banda portátil
     701–768, solo aprieta número/espacios) · 700 (portátil bajo, 1280×600) ·
     560 (1024×512) · 430 (landscape móvil, 844×390 — el glifo se oculta:
     espacios y glifo se agotan antes de tocar instrucciones). */
/* Stats de la pantalla final (s114, extraído aquí en s170 por la regla §1).
   El criterio NO cambió: tiempo siempre; en rutinas de fuerza, series (nº de
   sets de reps) + reps GUIADAS reales (jamás el objetivo); en mixtas, pasos
   (ejercicios sin descansos) + reps; en movilidad, pasos. Sin calorías,
   récords ni comparaciones. `tiempo` llega ya formateado y `t` es el traductor
   del llamador — así el helper se queda puro. */
function v1DoneStats(routine, guided, tiempo, t) {
  const ejercicios = routine.steps.filter(s => s.mode !== 'rest').length;
  const conReps = routine.steps.filter(s => s.mode === 'reps').length;
  const stats = [{ label: t('common.time'), value: tiempo }];
  if (conReps > 0 && conReps === ejercicios) {
    stats.push({ label: t('move.series'), value: String(conReps) });
    stats.push({ label: t('move.repsCount'), value: String(guided) });
  } else if (conReps > 0) {
    stats.push({ label: t('move.steps'), value: String(ejercicios) });
    stats.push({ label: t('move.repsCount'), value: String(guided) });
  } else {
    stats.push({ label: t('move.steps'), value: String(ejercicios) });
  }
  return stats;
}

/* ¿ESTE INSTANTE CUENTA COMO TIEMPO ACTIVO? (s170) — helper PURO, y la razón
   de que sea puro es que ES la decisión: el reloj de `useActiveClock` solo sabe
   segmentar, y todo lo que puede salir mal vive en esta condición.

   La política la fija §6.4 del esquema de eventos, y conviene leerla por lo que
   DEJA FUERA:
     · 'prep' y la colocación ('place') — preparaciones, no trabajo. Y la
       colocación `ready` ni siquiera tiene reloj: espera al usuario sin límite,
       así que contarla sería volver a meter tiempo de pared dentro.
     · la transición de lado ('change') — el aviso de cambio no es trabajo,
       aunque el trabajo de LOS DOS lados sí cuenta.
     · los descansos entre series (`mode:'rest'`) — están en la rutina, pero
       descansar no es moverse.
     · las pausas explícitas.
   Todo eso sigue vivo en el reloj de pared de `sessionStart`, que es el que
   alimenta los minutos acreditados: esto NO cambia lo que se acredita, saca un
   número que hasta ahora no existía. */
function v1TrabajoActivo(stage, phase, step, paused) {
  return stage === 'run' && phase === 'work' && !!step && step.mode !== 'rest' && !paused;
}

/* El reloj de tiempo activo del runner v1, ya cableado a su política. Sale del
   componente por la regla §1 (el runner estaba en 496 de 500) siguiendo el
   camino de `useHoldClock` en s166.
   Las deps NO llevan `side` a propósito: cambiar de lado no interrumpe el
   trabajo, y `marcar` es idempotente. Sí llevan `step`, porque de él depende
   `step.mode` — sin él, entrar en un descanso no cerraría el segmento. */
function useV1ActiveClock(stage, phase, step, paused) {
  const reloj = useActiveClock();
  React.useEffect(() => {
    reloj.marcar(v1TrabajoActivo(stage, phase, step, paused));
  }, [stage, phase, step, paused]);
  return reloj;
}

/* s172 · EL LADO QUE PINTA EL GLIFO en un paso por lados. Politica pura, aqui
   y no en el runner, por la misma razon que `v1TrabajoActivo`: es una decision
   y asi puede probarse sola.
   En la TRANSICION se adelanta al lado que ENTRA. La pantalla ya lo anuncia
   («Ahora: Derecha») y el dibujo no puede estar diciendo lo contrario; `side`
   todavia vale 0 durante esos 10 s porque cambia al empezar el segundo lado.
   Fuera de un paso `perSide` vale 0, o sea el dibujo tal cual: espejar algo que
   no se ejecuta por lados seria voltear un gesto que solo tiene una version. */
function v1LadoGlifo(step, phase, side) {
  if (!step || step.mode !== 'perSide') return 0;
  return phase === 'change' ? 1 : side;
}

/* s172 · i18n de `instruction` — sale del runner por la regla §1: el archivo
   estaba clavado en 500 lineas y la contabilidad del evento necesitaba dos.
   Recibe el traductor con fallback (`tR`) en vez de cerrarse sobre el, porque
   quien conoce el idioma es el componente. */
/* La clave de traducción de un campo del paso. Las rutinas propias no tienen claves por
   posición: su inglés sale del nombre canónico del ejercicio (content/custom.js). */
function v1Clave(routine, idx, campo) {
  return routine.id.indexOf('custom.') === 0
    ? `custom.ex.${routine.steps[idx].name}.${campo}`
    : `${routine.id}.s${idx}.${campo}`;
}

function v1Instr(tR, routine, idx, key) {
  const st = routine.steps[idx];
  /* Los pasos que venían del runner antiguo (y los de las rutinas propias) no traen
     `instruction`: su frase es `cue`, y en inglés se traduce con la clave `.cue` de siempre. */
  if (!st.instruction && key === 'action' && st.cue) return tR(v1Clave(routine, idx, 'cue'), st.cue);
  return tR(`${routine.id}.s${idx}.instruction.${key}`, st.instruction ? st.instruction[key] : undefined);
}

/* s172 · LOS DATOS DE `session.completed` DEL RUNNER V1 (§6.4). Vive aqui y no
   en el runner por la misma regla, y de paso queda al lado de
   `estimateDuration`, que es de donde sale el plan.
   `plannedSeconds` es el CALCULADO y no `routine.min`: el declarado se desvia
   del calculado —para eso existe `v1DevCheckDuration`— asi que publicar el
   declarado como plan seria publicar un numero que la propia app no se cree.
   Y se calcula con el descanso VIGENTE (`v1RestSeconds()`), que es el que el
   usuario tiene puesto en Ajustes: con el default fijo, el plan mentiria en
   media rutina de fuerza para quien lo haya cambiado. */
function v1EventoSesion(routine, inicioMs, activoSec, early, inPath) {
  return {
    inPath: !!inPath,
    elapsedSeconds: Math.max(0, Math.round((Date.now() - inicioMs) / 1000)),
    activeSeconds: Math.max(0, Math.round(activoSec || 0)),
    plannedSeconds: estimateDuration(routine, v1RestSeconds()).minSec,
    plannedSecondsSource: 'derived',
    variant: 'v1',
    completionReason: early ? 'early' : 'natural',
  };
}

/* s200 · EL RELOJ DE MUEVE Y ESTIRA, POR MARCAS DE TIEMPO (patron de
   `useCountdown`). Hasta v0.134.0 cada contador sumaba 1 por cada disparo de
   `setInterval`, y con la pestana en segundo plano el navegador los espacia
   hasta uno por minuto: la sesion se quedaba atras. Ahora la verdad es una
   MARCA (`Date.now()`); el intervalo solo comprueba cuantos segundos ENTEROS han
   pasado desde ella, la adelanta esos segundos y se los entrega a `avanzar(n)`
   de una vez. `visibilitychange` corrige al volver sin esperar al intervalo.
   Mientras `activo` es falso (pausa, otra fase) no hay marca: al reanudar nace
   una nueva, asi que lo que pasa en pausa no cuenta.
   LOS SONIDOS NO SE PONEN AL DIA: un salto de N segundos llega como UNA
   actualizacion, y los efectos que suenan comparan con `===` o con `%`, asi que
   un salto se los salta en vez de soltar una rafaga de ticks perdidos. Los
   AVANCES comparan con `>=` y no se pierden.
   Lo usan los dos runners: el v1 (colocacion, trabajo y cambio de lado) y el
   legacy de `MoveModule.jsx`. */
function useRelojSesion(activo, avanzar, deps) {
  const marcaRef = React.useRef(0);
  const avanzarRef = React.useRef(avanzar);
  avanzarRef.current = avanzar;
  React.useEffect(() => {
    if (!activo) return;
    marcaRef.current = Date.now();
    const comprobar = () => {
      const n = Math.floor((Date.now() - marcaRef.current) / 1000);
      if (n <= 0) return;
      marcaRef.current += n * 1000;
      avanzarRef.current(n);
    };
    const id = setInterval(comprobar, 1000);
    const alVolver = () => { if (document.visibilityState === 'visible') comprobar(); };
    document.addEventListener('visibilitychange', alVolver);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', alVolver); };
  }, [activo].concat(deps || []));
}

/* s200 · QUE PASA SI SALES DE LA PANTALLA EN MITAD DE UNA SESION. Politica en
   UN sitio, para poder cambiarla en una linea:
     'pausa'  (vigente, la recomendada) -- al pasar la pagina a `hidden` la
              sesion se PAUSA como si se pulsara Pausa, y al volver sigue en
              pausa con el «Continuar» de siempre. El tiempo activo no cuenta lo
              que paso fuera (el reloj activo cierra su segmento con la pausa).
     'sigue'  -- no se pausa: al volver, `useRelojSesion` se pone al dia con el
              reloj real. OJO: hoy el salto se queda DENTRO de la fase en curso
              (el sobrante no atraviesa pasos como hace el Pomodoro); si se
              elige esta, falta ese reparto.
   Solo actua durante la sesion (`activo`): la preparacion de 5 s no tiene
   boton de Continuar y no se pausa. Las fases que no se pausan (colocacion
   automatica, descanso) siguen por reloj y terminan solas; el `paused` que dejan
   puesto lo hereda el trabajo siguiente, que si tiene «Continuar». */
const SESION_AL_OCULTAR = 'pausa';

function useSesionAlOcultar(activo, pausar) {
  const pausarRef = React.useRef(pausar);
  pausarRef.current = pausar;
  React.useEffect(() => {
    if (!activo || SESION_AL_OCULTAR !== 'pausa') return;
    const alOcultar = () => { if (document.visibilityState === 'hidden') pausarRef.current(); };
    document.addEventListener('visibilitychange', alOcultar);
    return () => document.removeEventListener('visibilitychange', alOcultar);
  }, [activo]);
}

Object.assign(window, {
  useRelojSesion, useSesionAlOcultar, SESION_AL_OCULTAR,
  v1Instr, v1Clave, v1EventoSesion, v1LadoGlifo,
  V1_PLACE_SECONDS, V1_REP_SECONDS, V1_CHANGE_SECONDS, V1_PREP_SECONDS, V1_READY_SECONDS, V1_MAS_TIEMPO,
  v1RepSeconds, v1RepTarget, v1TempoSeconds, v1TransitionSeconds, v1CompletionMode,
  v1RestSeconds, v1StepDur, v1StepSetup, v1StepProgress, v1StepWeight, v1GlyphSize, v1GlyphSizeAhora,
  V1_GLYPH_WEB, v1EsEscritorio,
  estimateDuration, v1DevCheckDuration, v1DoneStats, v1TrabajoActivo, useV1ActiveClock,
});
