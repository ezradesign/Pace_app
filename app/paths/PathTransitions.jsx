/* PACE - Caminos - PathTransitions (sesion 77 / v0.31.0)
   Cards de transicion entre pantallas del Camino:

     - IntroCard:  al abrir el Camino (SenderoBar 0/N + nombre del Camino).
     - StepIntro:  entre cada par de pasos (SenderoBar parcial + orbe + kind).
     - OutroCard:  antes de CompletionScreen (SenderoBar N/N + nombre).

   Las tres comparten layout vertical: SenderoBar grande arriba, titulo
   centrado en vertical, hint "toca para continuar" en la base. La card
   entera es tappable. Auto-advance por timer (tokens CSS configurables).

   Cero audio (decision 15 del prompt s77). Cero persistencia: si
   recargas, no ves transicion -- aterrizas en el paso destino.

   API expuesta a window: IntroCard, StepIntro, OutroCard.
*/

const { useState: useStatePT, useEffect: useEffectPT, useRef: useRefPT } = React;

/* s99: atmosfera (tinte de fondo) + numeral editorial de las cards de paso.
   PT_KIND_SOFT ata cada tipo de paso a su acento de modulo. */
const PT_KIND_SOFT = {
  breathe: 'var(--breathe-soft)',
  focus:   'var(--focus-soft)',
  body:    'var(--move-soft)',
  hydrate: 'var(--hydrate-soft)',
};
const PT_KIND_ACCENT = {
  breathe: 'var(--breathe)',
  focus:   'var(--focus)',
  body:    'var(--move)',
  hydrate: 'var(--hydrate)',
};
const PT_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/* Lee var CSS como ms. Soporta "300ms" y "0.3s". */
function pathTransitionReadMs(name, fallback) {
  try {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!v) return fallback;
    if (v.endsWith('ms')) return parseFloat(v);
    if (v.endsWith('s'))  return parseFloat(v) * 1000;
    var n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  } catch (e) { return fallback; }
}

/* TransitionCardBase - logica comun de entrada/salida + auto-advance.
   El padre (PathRunner) controla cuando se monta/desmonta cada variante. */
function TransitionCardBase({
  blocks,         // array para SenderoBar
  currentIndex,   // hito activo (intro=0, transition=next, outro=total)
  title,          // texto grande centrado en vertical
  orbVisible,     // true solo en StepIntro
  durationVar,    // 'intro' | 'step' | 'outro'
  fadeMsFallback, // ms para entrada/salida (--path-card-fade-ms)
  totalMsFallback,// ms total de hold antes del auto-continue
  onContinue,     // callback al final del hold o al tap
  atmosphere,     // s99: token *-soft para el wash de fondo (o undefined)
  kicker,         // s99: eyebrow editorial sobre el titulo (numeral romano)
  accent,         // s99: color del hito actual del SenderoBar (o undefined)
}) {
  const { t } = useT();
  /* Arranca invisible (decision 5: fade + scale 0.96 -> 1.0). */
  const [visible, setVisible] = useStatePT(false);
  const [exiting, setExiting] = useStatePT(false);
  const exitedRef = useRefPT(false);
  const enterRafRef = useRefPT(null);
  const holdTimerRef = useRefPT(null);
  const exitTimerRef = useRefPT(null);

  useEffectPT(function () {
    var fadeMs  = pathTransitionReadMs('--path-card-fade-ms', fadeMsFallback);
    var holdMs  = pathTransitionReadMs(
      durationVar === 'intro' ? '--path-intro-ms' :
      durationVar === 'outro' ? '--path-outro-ms' :
                                '--path-step-ms',
      totalMsFallback
    );
    /* Doble rAF para asegurar pintado del estado opacity=0 antes del fade-in. */
    enterRafRef.current = requestAnimationFrame(function () {
      enterRafRef.current = requestAnimationFrame(function () { setVisible(true); });
    });
    /* Hold "completo" termina cuando expiran (holdMs - fadeMs) tras el fade-in.
       Asi el conjunto entrada + hold visible + salida cuadra con holdMs total. */
    var holdAfterEnter = Math.max(0, holdMs - fadeMs);
    holdTimerRef.current = setTimeout(function () {
      doExit();
    }, fadeMs + holdAfterEnter);

    return function () {
      if (enterRafRef.current) cancelAnimationFrame(enterRafRef.current);
      clearTimeout(holdTimerRef.current);
      clearTimeout(exitTimerRef.current);
    };
  }, []);

  function doExit() {
    if (exitedRef.current) return;
    exitedRef.current = true;
    clearTimeout(holdTimerRef.current);
    var fadeMs = pathTransitionReadMs('--path-card-fade-ms', fadeMsFallback);
    setExiting(true);
    setVisible(false);
    exitTimerRef.current = setTimeout(function () {
      if (typeof onContinue === 'function') onContinue();
    }, fadeMs);
  }

  /* Tap acelera la salida (decision 7). */
  function handleTap() { doExit(); }
  function handleKey(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      doExit();
    }
  }

  /* Opacity y scale derivados del estado:
       inicial:  opacity 0, scale --path-card-scale-from (0.96)
       visible:  opacity 1, scale 1
       exiting:  opacity 0, scale 0.96
     La transicion CSS (definida inline) se encarga del tween. */
  var scaleFrom = (function () {
    try {
      var v = getComputedStyle(document.documentElement)
        .getPropertyValue('--path-card-scale-from').trim();
      var n = parseFloat(v);
      return Number.isFinite(n) ? n : 0.96;
    } catch (e) { return 0.96; }
  })();
  var opacity, scale;
  if (exiting)      { opacity = 0; scale = scaleFrom; }
  else if (visible) { opacity = 1; scale = 1; }
  else              { opacity = 0; scale = scaleFrom; }

  return (
    <div
      onClick={handleTap}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={title}
      data-pace-reveal
      style={Object.assign({}, pathTransitionStyles.card, {
        background: (atmosphere && window.sessionAtmosphere)
          ? window.sessionAtmosphere(atmosphere)
          : pathTransitionStyles.card.background,
        opacity: opacity,
        transform: 'scale(' + scale + ')',
      })}
    >
      <div style={pathTransitionStyles.senderoSlot}>
        <SenderoBar
          blocks={blocks}
          currentIndex={currentIndex}
          size="lg"
          orbVisible={orbVisible}
          accent={accent}
        />
      </div>

      <div style={pathTransitionStyles.titleWrap}>
        <div>
          {kicker ? <div style={pathTransitionStyles.kicker}>{kicker}</div> : null}
          <h2 style={pathTransitionStyles.title}>{title}</h2>
        </div>
      </div>

      <div style={pathTransitionStyles.hint}>
        {t('path.runner.transition.continue')}
      </div>
    </div>
  );
}

function IntroCard({ pathName, blocks, onContinue }) {
  return (
    <TransitionCardBase
      blocks={blocks}
      currentIndex={0}
      title={pathName}
      orbVisible={false}
      durationVar="intro"
      fadeMsFallback={200}
      totalMsFallback={2500}
      onContinue={onContinue}
    />
  );
}

function StepIntro({ kindName, kind, blocks, currentIndex, onContinue }) {
  return (
    <TransitionCardBase
      blocks={blocks}
      currentIndex={currentIndex}
      title={kindName}
      kicker={PT_ROMAN[currentIndex] || String(currentIndex + 1)}
      atmosphere={PT_KIND_SOFT[kind]}
      accent={PT_KIND_ACCENT[kind]}
      orbVisible={true}
      durationVar="step"
      fadeMsFallback={200}
      totalMsFallback={2000}
      onContinue={onContinue}
    />
  );
}

function OutroCard({ pathName, blocks, onContinue }) {
  var total = (blocks && blocks.length) || 0;
  return (
    <TransitionCardBase
      blocks={blocks}
      currentIndex={total /* todos done */}
      title={pathName}
      orbVisible={false}
      durationVar="outro"
      fadeMsFallback={200}
      totalMsFallback={1500}
      onContinue={onContinue}
    />
  );
}

const pathTransitionStyles = {
  card: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10vh 32px 6vh',
    background: 'var(--paper)',
    cursor: 'pointer',
    userSelect: 'none',
    zIndex: 10,
    transformOrigin: '50% 50%',
    transition:
      'opacity var(--path-card-fade-ms, 200ms) ease-out, ' +
      'transform var(--path-card-fade-ms, 200ms) ease-out',
    outline: 'none',
  },
  senderoSlot: {
    width: '100%',
    maxWidth: 720,
    flex: '0 0 auto',
  },
  titleWrap: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '0 12px',
    minHeight: 0,
  },
  /* Eyebrow editorial (numeral romano del paso) sobre el titulo. */
  kicker: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 22,
    letterSpacing: '0.14em',
    color: 'var(--ink-3)',
    marginBottom: 8,
    opacity: 0.75,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 'clamp(36px, 6vw, 64px)',
    fontWeight: 500,
    color: 'var(--ink)',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.15,
    letterSpacing: '0.005em',
  },
  hint: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 13,
    color: 'var(--ink-3)',
    letterSpacing: '0.04em',
    flex: '0 0 auto',
    opacity: 0.85,
  },
};

Object.assign(window, { IntroCard, StepIntro, OutroCard });
