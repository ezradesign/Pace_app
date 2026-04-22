/* PACE · Cow logos — 3 interpretations
   Uso: <CowLogo variant="lineal" size={28} color="currentColor" />
*/
const { useId } = React;

function CowLogoLineal({ size = 28, color = 'currentColor', strokeWidth = 1.4 }) {
  // Vaca de perfil paciendo, un solo trazo continuo-ish, elegante
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 80 60" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* cuerpo */}
      <path d="M10 32 C 10 22, 20 18, 30 18 L 55 18 C 62 18, 68 22, 68 30 L 68 40 C 68 43, 66 44, 64 44 L 60 44 L 58 50 M 60 44 L 58 44 L 56 40" />
      {/* patas traseras + vientre */}
      <path d="M 56 40 L 30 40 L 28 50 M 30 40 L 32 44 L 34 44 L 32 50" />
      {/* cabeza inclinada paciendo */}
      <path d="M 10 32 C 6 32, 4 36, 6 40 C 8 44, 14 44, 16 42 L 18 42 L 20 38" />
      {/* oreja */}
      <path d="M 12 30 L 14 26 L 17 28" />
      {/* hierba */}
      <path d="M 2 48 L 2 52 M 5 50 L 5 54 M 8 49 L 8 53" strokeWidth={strokeWidth * 0.8} opacity="0.6" />
      {/* mancha */}
      <ellipse cx="45" cy="28" rx="6" ry="4" opacity="0.2" fill={color} stroke="none" />
    </svg>
  );
}

function CowLogoSello({ size = 56, color = 'currentColor' }) {
  const id = useId();
  // Sello circular con texto alrededor
  const radius = 42;
  const textRadius = 33;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <path id={`circle-${id}`} d={`M 50,50 m -${textRadius},0 a ${textRadius},${textRadius} 0 1,1 ${textRadius*2},0 a ${textRadius},${textRadius} 0 1,1 -${textRadius*2},0`} />
      </defs>
      <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="1.2" />
      <circle cx="50" cy="50" r={radius - 4} fill="none" stroke={color} strokeWidth="0.6" opacity="0.5" />
      <text fontSize="7" letterSpacing="2" fill={color} fontFamily="EB Garamond, serif" fontWeight="500">
        <textPath href={`#circle-${id}`} startOffset="0%">PACE · FOCO · CUERPO · EST 2025 · </textPath>
      </text>
      {/* mini vaca en el centro */}
      <g transform="translate(32, 42) scale(0.45)">
        <path d="M10 32 C 10 22, 20 18, 30 18 L 55 18 C 62 18, 68 22, 68 30 L 68 40 C 68 43, 66 44, 64 44 L 60 44 L 58 50 M 60 44 L 58 44 L 56 40 M 56 40 L 30 40 L 32 44 L 34 44 L 32 50 M 30 40 L 28 50 M 10 32 C 6 32, 4 36, 6 40 C 8 44, 14 44, 16 42 L 18 42 L 20 38 M 12 30 L 14 26 L 17 28"
              fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function CowLogoIlustrado({ size = 48, color = 'currentColor' }) {
  // Versión ilustrada con manchas y campo
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 80 60" aria-hidden="true">
      {/* campo detrás */}
      <path d="M 0 50 Q 20 46, 40 48 T 80 50 L 80 60 L 0 60 Z" fill={color} opacity="0.08" />
      {/* cuerpo */}
      <path d="M 12 32 C 12 22, 22 19, 30 19 L 55 19 C 62 19, 66 23, 66 30 L 66 40 C 66 42, 64 43, 62 43 L 58 43 L 57 50 L 59 50 L 60 52 L 56 52 L 55 43 L 32 43 L 31 50 L 33 50 L 34 52 L 30 52 L 29 43"
            fill={color} fillOpacity="0.08" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      {/* manchas */}
      <ellipse cx="44" cy="28" rx="7" ry="4.5" fill={color} opacity="0.55" />
      <ellipse cx="54" cy="36" rx="4" ry="2.5" fill={color} opacity="0.45" />
      <ellipse cx="34" cy="34" rx="3" ry="2" fill={color} opacity="0.35" />
      {/* cabeza */}
      <path d="M 12 32 C 7 32, 4 36, 6 40 C 8 44, 14 44, 17 42 L 19 42 L 21 38 Z"
            fill={color} fillOpacity="0.1" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
      {/* oreja */}
      <path d="M 11 30 L 13 25 L 17 27 Z" fill={color} opacity="0.5" stroke={color} strokeWidth="1.2" />
      {/* ojo */}
      <circle cx="10" cy="38" r="0.9" fill={color} />
      {/* hierba en la boca */}
      <path d="M 5 42 L 3 46 M 6 42 L 7 47 M 4 42 L 5 48" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function CowLogo({ variant = 'lineal', size = 28, color = 'currentColor' }) {
  if (variant === 'sello') return <CowLogoSello size={size * 1.6} color={color} />;
  if (variant === 'ilustrado') return <CowLogoIlustrado size={size * 1.2} color={color} />;
  return <CowLogoLineal size={size} color={color} />;
}

/* ============================================================
   PaceLockup · wordmark "Pace." con la vaca integrada en la P
   La P sirve de cuerpo del animal: el trazo superior de la P hace
   de cuello + cabeza inclinada, y la hierba sale del pie de la letra.
   Subtítulo "FOCO · CUERPO" (o el que pase el usuario).
   ============================================================ */
function PaceLockup({ size = 44, subtitle = 'FOCO · CUERPO', showDot = true }) {
  // Las proporciones se basan en un canvas 640×260 y luego escalamos por size
  const w = size * 14.5;        // ancho total aprox
  const h = size * 4;
  const green = 'var(--focus, #3E5A3A)';
  const terra = 'var(--breathe, #C97A5D)';
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 640 180"
      fill="none"
      aria-label="Pace"
      style={{ display: 'block' }}
    >
      {/* ========= GRUPO 1: la "P" + vaca ========= */}
      {/* Vástago vertical de la P — grueso y elegante */}
      <path
        d="M78 30 C 78 30, 74 60, 74 95 C 74 130, 70 160, 64 170"
        stroke={green}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bucle superior de la P — se curva como lomo de vaca y desciende al morro */}
      <path
        d="M78 32 C 130 18, 180 30, 196 62 C 208 88, 196 108, 170 112 C 150 115, 120 112, 100 108"
        stroke={green}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cabeza de la vaca en terracota — cuelga del bucle de la P, paciendo */}
      {/* Morro + perfil inclinado */}
      <path
        d="M138 104 C 138 120, 130 135, 118 142 C 108 148, 96 150, 88 146 C 82 143, 82 138, 86 134 C 90 130, 98 128, 104 126 L 110 118 L 116 108"
        stroke={terra}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Cuernito curvo hacia arriba */}
      <path
        d="M118 108 C 122 100, 128 98, 134 102"
        stroke={terra}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Oreja */}
      <path
        d="M128 110 C 132 104, 138 104, 142 110"
        stroke={terra}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Ojo — punto */}
      <circle cx="108" cy="126" r="1.6" fill={green} />

      {/* Hierba al pie de la P */}
      <path d="M 40 168 L 40 178 M 50 166 L 50 178 M 60 169 L 60 178 M 70 167 L 70 178 M 80 170 L 80 178 M 92 168 L 92 178 M 102 171 L 102 178 M 114 169 L 114 178"
            stroke={green} strokeWidth="2.4" strokeLinecap="round" />

      {/* ========= GRUPO 2: "ace." en cursiva ========= */}
      <text
        x="210"
        y="148"
        fontSize="142"
        fontFamily="Cormorant Garamond, EB Garamond, Georgia, serif"
        fontStyle="italic"
        fontWeight="500"
        fill={green}
        letterSpacing="-2"
      >ace</text>

      {/* Punto final — terracota */}
      {showDot && (
        <circle cx="540" cy="148" r="12" fill={terra} />
      )}

      {/* ========= SUBTÍTULO ========= */}
      {subtitle && (
        <text
          x="210"
          y="176"
          fontSize="18"
          fontFamily="Cormorant Garamond, EB Garamond, Georgia, serif"
          letterSpacing="6"
          fill={green}
          opacity="0.75"
          fontWeight="500"
        >{subtitle}</text>
      )}
    </svg>
  );
}

/* ============================================================
   PaceLogoImage · logo oficial (PNG adjunto) que el usuario nos pasa.
   Sustituye pictograma vaca + wordmark "pace" por la imagen cerrada
   con el subtítulo "Touch grass, even from your desk".
   Se escala responsive al ancho disponible.
   ============================================================ */
// Logo oficial — vaca integrada en "P" de Pace.
// Ruta relativa al entry point modular (PACE.html). En el standalone inline
// el PNG no viaja con el archivo, así que si falla la carga se hace fallback
// automático al PaceLockup SVG (que es visualmente equivalente).
const PACE_LOGO_URL = "app/ui/pace-logo.png";
function PaceLogoImage({ maxWidth = 600 }) {
  /* NOTA v0.11.7 · sesión 12 — aumentado maxWidth 240 → 600 (≈2.5×) para
     dar al logo el peso visual que tenía en el mockup de referencia. En la
     práctica el ancho real lo limita el contenedor del sidebar (width 100%),
     pero subir este tope permite que el logo se escale sin tope en sidebars
     más anchos o layouts futuros. */
  const { useState: useStateLG } = React;
  const [failed, setFailed] = useStateLG(false);
  if (failed) {
    // Fallback: PaceLockup SVG con subtítulo equivalente al del PNG.
    return (
      <div style={{ maxWidth, width: '100%' }}>
        <PaceLockup size={14} subtitle="TOUCH GRASS · EVEN FROM YOUR DESK" />
      </div>
    );
  }
  return (
    <img
      src={PACE_LOGO_URL}
      alt="Pace — Touch grass, even from your desk"
      onError={() => setFailed(true)}
      style={{
        display: 'block',
        width: '100%',
        maxWidth,
        height: 'auto',
        objectFit: 'contain',
        /* El PNG original viene con fondo crema; lo fundimos visualmente
           con el paper del sidebar usando blend mode. */
        mixBlendMode: 'multiply',
      }}
      draggable={false}
    />
  );
}

/* Wordmark completo · entrega el logo según `variant`:
   - 'pace' (default)  → PNG oficial (lockup vaca-en-P + tagline)
   - 'lockup'          → PaceLockup SVG (misma idea, sin subir imagen)
   - 'lineal'/'sello'/'ilustrado' → pictograma + wordmark "P a.c.e."
   Los TweaksPanel y los logros secret.seal / secret.illustrated dependen
   de que cada variante realmente se renderice distinta. */
function PaceWordmark({ variant = 'pace', color = 'currentColor' }) {
  if (variant === 'pace') {
    return <PaceLogoImage maxWidth={600} />;
  }
  if (variant === 'lockup') {
    return <PaceLockup size={14} subtitle="FOCO · CUERPO" />;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <CowLogo variant={variant} size={26} color={color} />
      <div style={{ lineHeight: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: '0.04em',
          color,
        }}>P<span style={{letterSpacing: '-0.01em'}}>a.c.e.</span></span>
        <span style={{
          fontSize: 9,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color,
          opacity: 0.6,
          fontWeight: 500,
        }}>Foco · Cuerpo</span>
      </div>
    </div>
  );
}

Object.assign(window, { CowLogo, CowLogoLineal, CowLogoSello, CowLogoIlustrado, PaceWordmark, PaceLockup, PaceLogoImage });
