/* PACE · Onboarding · piezas presentacionales (sesión 106 / v0.51.0)
   Componentes puros del flujo de primera vez: escena de fondo, chip de
   opción, puntos de progreso, logo y la definición de las 3 preguntas.
   El orquestador (máquina de pasos + handlers) vive en Onboarding.jsx.

   Arte: cada pantalla monta una lámina de Caminos como fondo cover
   (getPathIllustration(id).src — la MISMA fuente que el runner, así el
   build la sirve como archivo en web y data URI en el standalone sin
   cableado nuevo). Sin casquetes ni cámara: aquí la lámina es paisaje,
   no progreso. Regla s104 intacta: "sobre el arte siempre es de día" —
   el orquestador pone data-pace-scene-card en la raíz y el velo usa
   crema FIJA en rgba (como csPlateStyle). */

const { useState: useStateONBS } = React;

/* Definición de las 3 preguntas del perfil. `field` = key en profile;
   `sceneId` = lámina de fondo; los acentos de NECESIDAD llevan el color
   de su módulo (identidad); tiempo/entorno usan el verde CTA neutro. */
const ONBOARDING_QUESTIONS = [
  {
    field: 'need',
    kickerKey: 'onboarding.need.kicker',
    titleKey: 'onboarding.need.title',
    sceneId: 'path.breath',
    free: true,
    options: [
      { value: 'calm',   labelKey: 'onboarding.need.calm',   subKey: 'onboarding.need.calm.sub',   accent: 'var(--breathe)' },
      { value: 'focus',  labelKey: 'onboarding.need.focus',  subKey: 'onboarding.need.focus.sub',  accent: 'var(--focus)' },
      { value: 'body',   labelKey: 'onboarding.need.body',   subKey: 'onboarding.need.body.sub',   accent: 'var(--move)' },
      { value: 'energy', labelKey: 'onboarding.need.energy', subKey: 'onboarding.need.energy.sub', accent: 'var(--achievement)' },
    ],
  },
  {
    field: 'time',
    kickerKey: 'onboarding.time.kicker',
    titleKey: 'onboarding.time.title',
    sceneId: 'path.tea',
    options: [
      { value: 'short', labelKey: 'onboarding.time.short', subKey: 'onboarding.time.short.sub', accent: 'var(--focus-cta)' },
      { value: 'pause', labelKey: 'onboarding.time.pause', subKey: 'onboarding.time.pause.sub', accent: 'var(--focus-cta)' },
      { value: 'block', labelKey: 'onboarding.time.block', subKey: 'onboarding.time.block.sub', accent: 'var(--focus-cta)' },
    ],
  },
  {
    field: 'environment',
    kickerKey: 'onboarding.env.kicker',
    titleKey: 'onboarding.env.title',
    sceneId: 'path.midday',
    options: [
      { value: 'office', labelKey: 'onboarding.env.office', subKey: 'onboarding.env.office.sub', accent: 'var(--focus-cta)' },
      { value: 'home',   labelKey: 'onboarding.env.home',   subKey: 'onboarding.env.home.sub',   accent: 'var(--focus-cta)' },
      { value: 'mixed',  labelKey: 'onboarding.env.mixed',  subKey: 'onboarding.env.mixed.sub',  accent: 'var(--focus-cta)' },
    ],
  },
];

/* Escena de fondo: lámina cover + velo radial de crema (más denso tras la
   columna de contenido, se abre hacia los bordes para que el arte respire).
   Sin lámina (id fuera del índice) cae a papel liso — nunca rompe. */
function OnbScene({ pathId }) {
  const ill = (typeof getPathIllustration === 'function')
    ? getPathIllustration(pathId)
    : null;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden' }}>
      {ill && (
        <img
          src={ill.src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: '50% ' + Math.round(((typeof ill.focusY === 'number' ? ill.focusY : 0.6)) * 100) + '%',
            display: 'block',
          }}
        />
      )}
      {/* Velo de legibilidad — crema fija (el arte no se tematiza). */}
      <div style={{
        position: 'absolute', inset: 0,
        background: ill
          ? 'radial-gradient(ellipse 150% 120% at 50% 46%, rgba(242,237,224,0.92) 0%, rgba(242,237,224,0.72) 46%, rgba(242,237,224,0.34) 78%, rgba(242,237,224,0.16) 100%)'
          : 'var(--paper)',
      }} />
    </div>
  );
}

/* Chip de opción — placa de papel translúcida (misma familia visual que
   las placas del runner s104) con indicador de radio a la derecha. */
function OnbChoice({ label, sub, accent, selected, onSelect }) {
  const [hover, setHover] = useStateONBS(false);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', textAlign: 'left',
        padding: '11px 16px',
        background: selected ? 'rgba(242,237,224,0.96)' : 'rgba(242,237,224,0.82)',
        border: '1px solid ' + (selected ? accent : (hover ? 'var(--line-2)' : 'rgba(184,173,142,0.5)')),
        borderRadius: 'var(--r-md)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        cursor: 'pointer',
        transform: hover && !selected ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: selected ? 'var(--sh-soft)' : 'none',
        transition: 'all 180ms var(--ease)',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 20, fontWeight: 500, lineHeight: 1.15,
          color: selected ? accent : 'var(--ink)',
          transition: 'color 180ms',
        }}>{label}</span>
        <span style={{
          display: 'block', fontSize: 12.5, color: 'var(--ink-3)',
          marginTop: 2, lineHeight: 1.35,
        }}>{sub}</span>
      </span>
      {/* Indicador radio: aro fino → punto relleno del acento. */}
      <span aria-hidden="true" style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        border: '1.5px solid ' + (selected ? accent : 'var(--line-2)'),
        display: 'grid', placeItems: 'center',
        transition: 'border-color 180ms',
      }}>
        <span style={{
          width: 9, height: 9, borderRadius: '50%',
          background: selected ? accent : 'transparent',
          transition: 'background 180ms',
        }} />
      </span>
    </button>
  );
}

/* Progreso de las 3 preguntas: puntos finos, el activo en tinta. */
function OnbDots({ total, active }) {
  const dots = [];
  for (let i = 0; i < total; i++) {
    dots.push(
      <span key={i} style={{
        width: i === active ? 18 : 6, height: 6,
        borderRadius: 'var(--r-pill)',
        background: i === active ? 'var(--ink-2)' : (i < active ? 'var(--ink-3)' : 'var(--line-2)'),
        transition: 'all 320ms var(--ease)',
      }} />
    );
  }
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {dots}
    </div>
  );
}

/* Logo para la bienvenida. El PNG oficial lleva SIEMPRE el tratamiento de
   día (multiply, sin invert): el arte de fondo es papel claro fijo, así
   que el invert+screen de la paleta oscura (CowLogo) aquí quedaría mal
   sobre crema. Mismo contrato de src que CowLogo (img#pace-logo-src
   pre-cargado en el HTML → data URI en el standalone). Fallback
   tipográfico si el PNG no carga (idéntico en espíritu al splash). */
function OnbLogo() {
  const [failed, setFailed] = useStateONBS(false);
  const el = (typeof document !== 'undefined') && document.getElementById('pace-logo-src');
  const src = (el && el.getAttribute('src')) || null;
  if (!src || failed) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 64, fontWeight: 500, lineHeight: 1, color: 'var(--ink)',
        }}>Pace</div>
        <div style={{
          fontSize: 12, letterSpacing: '0.32em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginTop: 8,
        }}>Foco · Cuerpo</div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt="Pace"
      onError={() => setFailed(true)}
      draggable={false}
      style={{
        display: 'block', width: '100%', maxWidth: 300, height: 'auto',
        margin: '0 auto', objectFit: 'contain', mixBlendMode: 'multiply',
      }}
    />
  );
}

Object.assign(window, {
  ONBOARDING_QUESTIONS, OnbScene, OnbChoice, OnbDots, OnbLogo,
});
