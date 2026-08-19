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
   en UNA sola fuente. `setup:{mode:'ready',estimatedSeconds}` declarado (espera
   al usuario, NUNCA cuenta) — floor/pared/material. El resto se DERIVA como en
   s111/s114:
     auto — pasos con reloj (timed/perSide) e idx>0, o el 1er set de fuerza
            (reps con instruction.setup y NO tras un rest) → gate auto de 5 s.
     none — resto. `setup:número` (s112) sigue siendo un gate auto explícito.
   `ready` aporta estimatedSeconds>0 SÓLO para la duración; jamás es countdown. */
function v1StepSetup(routine, idx) {
  const st = routine.steps[idx];
  if (!st) return { mode: 'none', estimatedSeconds: 0 };
  if (st.setup && st.setup.mode === 'ready') {
    return { mode: 'ready', estimatedSeconds: st.setup.estimatedSeconds || V1_PLACE_SECONDS };
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
const V1_GLYPH_WEB = 1.3;
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
const _paceMoveV1Css = document.getElementById('pace-move-v1-css');
if (!_paceMoveV1Css) {
  const s = document.createElement('style');
  s.id = 'pace-move-v1-css';
  s.textContent = `
    @keyframes pace-rep-pulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(0.86); }
      100% { transform: scale(1); }
    }
    /* s125 · BARRA DE SCROLL OCULTA — LA REGLA SE MUDÓ, NO SE BORRÓ (s139).
       El diagnóstico de s125 sigue siendo válido y vale la pena conservarlo: en
       el régimen ANCHO (≥641px) el centro NO desborda (las reservas cue/care de
       s119 absorben las 2 líneas); en MÓVIL (≤640px, sin reservas) un paso de
       NOMBRE largo —«World's greatest stretch», <h1> clamp a 2 líneas a 360px—
       rebasa el centro por pocos px a alturas ≤~624px (medido: 360×620 = 3 px).
       El scroll es LEGÍTIMO; la barra clásica de 17 px para 3 px de recorrido
       es lo que sobra.
       En s139 el usuario elevó esto a REGLA DE PRODUCTO —ninguna actividad en
       curso enseña barra— así que las dos declaraciones que vivían aquí,
       confinadas con :has([data-pace-v1-progress]), pasaron a
       app/ui/SessionShell.responsive.js aplicadas a todo
       [data-pace-session-center]. Aquí quedarían como subconjunto exacto y
       redundante, y una regla duplicada acaba divergiendo. NO reintroducirlas:
       si alguna vez hay que devolver la barra a alguna superficie, la excepción
       se declara allí, en un solo sitio.
       OJO: este comentario vive DENTRO de un template literal — nada de
       backticks aquí, cierran la cadena y rompen el runner (pasó en s139). */
    /* s119 · ALTURAS RESERVADAS (anclaje del glifo, sin saltos tipográficos).
       El bloque de contenido mantiene alto CONSTANTE entre pasos de TRABAJO: el
       cue reserva 2 líneas (la acción más larga medida) y «Cuídate» reserva 2
       líneas SIEMPRE, aunque el paso no la tenga. Así un paso con cue/care corto
       (o sin care) no sube el glifo respecto a sus vecinos — el footer ya estaba
       pinneado; lo que se movía era el glifo por el centrado del bloque de alto
       variable. em → escala con el tamaño de cada tier (2 líneas exactas). El
       min-height es SUELO: la colocación (setup de 3 líneas) sigue creciendo.
       SOLO ≥641 px: en móvil (≤640) el slack de centrado es pequeño (~12 px de
       salto potencial, ya presente pre-s119) y el coste de las reservas —con el
       nombre a 2 líneas y fuentes grandes— desbordaba el retrato; ahí se
       renuncia a la reserva y se conserva el ajuste móvil previo (que cabía). */
    /* s171 · LAS RESERVAS PASAN A SER DE LAS DOS PIELES. El usuario midió en su
       teléfono lo que s119 había aceptado como coste: el círculo se mueve entre
       pasos. Medido aquí antes de tocar nada: top 98 → 108 → 151 px en móvil,
       43 px de deriva con el círculo del MISMO tamaño. La renuncia de s119 era
       a las reservas «con el nombre a 2 líneas y fuentes grandes», y desde
       entonces el nombre móvil ya es un clamp; el desborde se vuelve a medir en
       360×640, 375×812 y 390×844 abajo, que es donde aquella decisión dolía. */
    [data-pace-v1-cue]  { min-height: 3.1em; }   /* 2 líneas × 1.55 */
    [data-pace-v1-care] { min-height: 3em; }     /* 2 líneas × 1.5 */

    /* s171b · EL BLOQUE ENTERO DECLARA ALTO MINIMO, y es lo unico que hace falta.
       El circulo y el nombre se movian hasta 65 y 94 px entre pantallas de la
       misma rutina, por TRES causas distintas: un cue de 3 lineas, un nombre de
       2, y el gate de tipo «ready» —el que espera al usuario porque el paso pide
       suelo, cojin o pared— que NO PINTA CONTADOR y dejaba el bloque 130 px mas
       corto que el de trabajo. NO era la linea «Empiezas por», que fue la
       primera sospecha: es la AUSENCIA del contador.
       PRIMERO INTENTE RESERVAR CADA TEXTO y fue un error que la medida corrigio
       dos veces. Uno: las reservas son ADITIVAS y el peor caso real no tenia a
       la vez nombre de 2 lineas y cue de 3, asi que el bloque crecio de 460 a
       529 y desbordo donde antes cabia. Dos: al comprobarlo compare el bloque
       contra el alto del CENTRO, y dentro del centro tambien vive la barra de
       progreso — 61 px que no estaba contando. El desborde real era de 51 px.
       CON EL BLOQUE ANCLADO NO HACE FALTA RESERVAR NINGUN TEXTO: por encima del
       nombre solo hay glifo y rotulo, los dos de alto fijo, asi que el circulo y
       el nombre quedan clavados aunque el cue crezca. Lo que varie lo hace por
       DEBAJO, y la holgura cae detras de «Cuidate», donde no se lee como hueco.
       EN VH Y NO EN PX porque no hay un px que valga: el bloque crece con la
       altura del viewport (el glifo es 0,22 x alto) y su techo tambien, y los
       intervalos validos de 780 y de 844 NO SE SOLAPAN — medido.
       LOS SUELOS SON EL TECHO MEDIDO, no una estimacion: el bloque mas alto que
       cabe es 70,1vh a 375x780 · 71,2 a 812 · 72,4 a 844 · 76,0 a 1280x900.
       LO QUE ESTO NO ARREGLA, dicho: por debajo de 780 (movil) y 880 (escritorio)
       el circulo sigue moviendose. Ahi el centro no da para anclarlo sin robarle
       altura a las instrucciones, y esa jerarquia la fijo s119. */
    /* El rotulo de fase se pinta SIEMPRE —vacio cuando no hay— para que el
       NOMBRE no suba y baje 29 px en cada cambio de fase. Pero VACIO NO CUESTA
       NADA fuera de los suelos: a 360x640 esos 11 px eran justo los que
       faltaban, y alli se prefiere que el nombre salte a que aparezca barra. */
    [data-pace-v1-kicker]:empty { display: none; }
    @media (max-width: 640px) and (min-height: 780px) {
      [data-pace-v1-body] { min-height: 70vh; }
      [data-pace-v1-kicker]:empty { display: block; min-height: 1.2em; }
    }
    @media (min-width: 641px) and (min-height: 880px) {
      [data-pace-v1-body] { min-height: 72vh; }
      [data-pace-v1-kicker]:empty { display: block; min-height: 1.2em; }
    }

    /* s171 · EL AIRE ALREDEDOR DEL CONTADOR, en la piel ancha y SOLO donde no
       hay compactación (min-height 769: por debajo mandan los tiers de abajo,
       que ya aprietan estos mismos márgenes). El usuario pidió el círculo un
       30 % mayor «quitando el aire de la segunda frase de la descripción y el
       contador de segundos»: el aumento cabe sin desbordar (medido: 0 px a
       1440×900), así que esto no lo financia — recorta lo que él señaló.
       La línea vacía bajo el cue NO se toca y es deliberado: ES el anclaje del
       círculo. Quitarla devuelve la deriva que la mitad de este cambio arregla;
       moverla al final del bloque (después de «Cuídate», donde no se leería
       como hueco) exige que el bloque entero declare alto mínimo, y eso es un
       cambio de mecanismo con cinco tiers medidos detrás. Queda propuesto. */
    @media (min-width: 641px) and (min-height: 769px) {
      [data-pace-v1-cue] { margin-bottom: 10px !important; }
      [data-pace-v1-timer] + div { margin-top: 8px !important; }
      [data-pace-v1-care] { margin-top: 10px !important; }
    }

    /* s119 · banda de portátil 701–768 px: con el glifo ya continuo (v1GlyphSize
       sin salto en 720) pero SIN compactar, el bloque con reservas rebasa el
       centro por pocos px → barra fantasma (1366×768). Se recupera altura
       apretando el número y los espacios; NUNCA instrucciones. min-height:701
       para no pisar el tier ≤700 (más agresivo, gobierna por debajo). */
    @media (min-width: 641px) and (min-height: 701px) and (max-height: 768px) {
      [data-pace-v1-timer] { font-size: 104px !important; }   /* v1 only, no legacy */
      [data-pace-v1-glyph] > div { margin-bottom: 10px !important; }
      [data-pace-v1-name] { margin-bottom: 10px !important; }
      [data-pace-v1-cue] { margin-bottom: 10px !important; }
      [data-pace-v1-care] { margin-top: 10px !important; }
      [data-pace-v1-progress] { margin-top: 16px !important; }
    }
    @media (min-width: 641px) and (max-height: 700px) {
      /* s114: la capa «Cuídate» suma una línea — se recupera altura apretando
         espacios (nunca instrucciones) para mantener el delta 0 de s113.
         s119: con las reservas (cue+care a 2 líneas) el bloque de trabajo
         rebasaba ~21 px a 1280×600 — se recupera apretando MÁRGENES y el NÚMERO
         (nunca instrucciones ni las reservas). */
      [data-pace-v1-timer] { font-size: 82px !important; }   /* v1 only, no legacy */
      [data-pace-v1-glyph] > div { margin-bottom: 4px !important; }
      [data-pace-v1-name] { margin-bottom: 4px !important; }
      [data-pace-v1-cue] { margin-bottom: 4px !important; }
      [data-pace-v1-care] { margin-top: 4px !important; }
      [data-pace-v1-progress] { margin-top: 10px !important; }
    }
    @media (min-width: 641px) and (max-height: 560px) {
      /* s119: con las reservas (cue+care a 2 líneas) el bloque de trabajo
         rebasaba ~35 px a 1024×512 — se recupera apretando MÁRGENES, NÚMERO y
         bajando un punto las fuentes ya reducidas (nunca instrucciones ni las
         propias reservas). Es un viewport muy corto: la compactación es fuerte
         a propósito. */
      [data-pace-v1-timer] { font-size: 58px !important; }   /* v1 only, no legacy */
      [data-pace-v1-glyph] > div { margin-bottom: 4px !important; }
      [data-pace-v1-kicker] { margin-bottom: 6px !important; }
      [data-pace-v1-name] { font-size: 24px !important; margin-bottom: 4px !important; }
      [data-pace-v1-cue] { font-size: 13px !important; margin-bottom: 4px !important; }
      [data-pace-v1-support-strong] { font-size: 18px !important; margin-top: 8px !important; }
      [data-pace-v1-support] { font-size: 12px !important; }
      /* s114: en poca altura se oculta el RÓTULO «Cuídate», nunca el contenido
         (decisión A) — la adaptación sigue visible como línea secundaria. */
      [data-pace-v1-care] { font-size: 11px !important; margin-top: 4px !important; }
      [data-pace-v1-care-label] { display: none !important; }
      [data-pace-v1-progress] { margin-top: 8px !important; }
    }
    @media (min-width: 641px) and (max-height: 430px) {
      [data-pace-v1-glyph] { display: none !important; }
      [data-pace-v1-name] { font-size: 22px !important; margin-bottom: 6px !important; }
      [data-pace-v1-cue] { font-size: 13px !important; margin-bottom: 8px !important; }
      [data-pace-v1-care] { font-size: 11.5px !important; margin-top: 8px !important; }
    }
    /* Retrato estrecho con poca altura (360×640: el paso de reps desbordaba
       18 px): SOLO espacios — la tipografía ya la gobierna el bloque móvil
       por anchura de SessionShell/MoveModule (s27). */
    @media (max-width: 640px) and (max-height: 700px) {
      [data-pace-v1-glyph] > div { margin-bottom: 12px !important; }
      /* s171b · de 8 a 3: el rotulo pasa a pintarse SIEMPRE (reserva del nombre)
         y eso cuesta ~11 px en todo viewport. Aqui no sobraban: 360x640 quedaba
         desbordando 3 px. Se recupera del margen del propio rotulo, que es lo
         que lo causo, y no de las instrucciones — la jerarquia de s119. */
      [data-pace-v1-kicker] { margin-bottom: 3px !important; }
      [data-pace-v1-name] { margin-bottom: 8px !important; }
      [data-pace-v1-cue] { margin-bottom: 10px !important; }
      [data-pace-v1-support-strong] { margin-top: 10px !important; }
      [data-pace-v1-care] { margin-top: 8px !important; }
      [data-pace-v1-progress] { margin-top: 12px !important; }
    }
  `;
  document.head.appendChild(s);
}

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

Object.assign(window, {
  V1_PLACE_SECONDS, V1_REP_SECONDS, V1_CHANGE_SECONDS, V1_PREP_SECONDS,
  v1RepSeconds, v1RepTarget, v1TempoSeconds, v1TransitionSeconds, v1CompletionMode,
  v1RestSeconds, v1StepDur, v1StepSetup, v1StepProgress, v1StepWeight, v1GlyphSize,
  V1_GLYPH_WEB, v1EsEscritorio,
  estimateDuration, v1DevCheckDuration, v1DoneStats, v1TrabajoActivo, useV1ActiveClock,
});
