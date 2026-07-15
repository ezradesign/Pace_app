/* PACE · Caminos · PathIllustration (sesión 104 / v0.49.0)
   Escena editorial FULL-BLEED del Camino (arte D-4). Sustituye al
   SenderoBar SOLO en el runner; los caminos sin lámina en el índice
   siguen con el SenderoBar clásico (el fallback lo deciden los padres
   con getPathIllustration).

   Lenguaje de marcadores (iteración s104c con el usuario):
     Las bolas pintadas del arte quedan SIEMPRE cubiertas por un
     casquete neutro ("socket"): todas GRISES hasta rellenarse.
       pending — casquete gris (var(--line), borde --line-2).
       current — casquete gris + latido que emana desde debajo en el
                 COLOR DE LA ACTIVIDAD del paso (anticipa lo que toca).
       done    — la bola se RELLENA con el color exacto de su actividad
                 (--breathe/--focus/--move/--hydrate, mapa de siempre).
     El "viaje" entre módulos (el orbe se retiró, s104c): al entrar la
     StepIntro, la bola del paso recién terminado hace un POP de color
     (scene-fill-in) mientras la cámara viaja al siguiente hito (pan
     2s). Completion: encuadre en el FINAL del camino (ill.finish) y
     todas las bolas se rellenan escalonadas.

   Alineación img+SVG: wrapper dimensionado al cover exacto contiene
   ambos (SVG viewBox = espacio de imagen) -> los casquetes caen
   SIEMPRE sobre las bolas pintadas (centros medidos por escaneo).

   A11y: decorativa (aria-hidden); el título de la card anuncia el
   Camino. Reduced-motion: kill global congela pulso/pop/pan (CSS). */

const { useState: useStatePI, useEffect: useEffectPI, useRef: useRefPI } = React;

/* Color de actividad por kind — mismo mapa que CS_KIND_COLOR /
   PT_KIND_ACCENT. En oscuro, dentro de data-pace-scene-card estos
   tokens se re-mapean a sus valores de DÍA (tokens.css). */
const PI_KIND_COLOR = {
  breathe: 'var(--breathe)',
  focus: 'var(--focus)',
  body: 'var(--move)',
  hydrate: 'var(--hydrate)',
};

/* rgba del papel del arte (para la placa de la etiqueta). */
function pathIllustrationPaperRgba(hex, a) {
  const h = (hex || '#F2EDE0').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

function pathIllustrationCover(w, h, iw, ih, fx, fy) {
  const scale = Math.max(w / iw, h / ih);
  const sw = iw * scale, sh = ih * scale;
  const ox = Math.min(0, Math.max(w - sw, w / 2 - fx * sw));
  const oy = Math.min(0, Math.max(h - sh, h / 2 - fy * sh));
  return { sw, sh, ox, oy };
}

function PathIllustration({ pathId, currentIndex, orbVisible, accent, drawIn, fixed, label, labelKicker }) {
  const ill = (typeof getPathIllustration === 'function')
    ? getPathIllustration(pathId)
    : null;

  const wrapRef = useRefPI(null);
  const [dim, setDim] = useStatePI(null);

  const dots = (ill && ill.dots) || [];
  const total = dots.length;
  const cur = Math.max(0, Math.min(currentIndex, total - 1));

  /* Cámara: durante StepIntro arranca encuadrada en el hito ANTERIOR y
     viaja al actual (pan 2s = el "viaje" entre módulos). En Intro queda
     fija en el hito actual; en Completion, en el final del camino. */
  const camStart = (orbVisible && currentIndex > 0) ? cur - 1 : cur;
  const [camIdx, setCamIdx] = useStatePI(camStart);

  useEffectPI(function () {
    if (!ill) return;
    function measure() {
      const el = wrapRef.current;
      if (!el) return;
      setDim({ w: el.clientWidth, h: el.clientHeight });
    }
    measure();
    window.addEventListener('resize', measure);
    return function () { window.removeEventListener('resize', measure); };
  }, [!!ill]);

  useEffectPI(function () {
    if (camIdx === cur) return;
    /* Doble rAF (patrón TransitionCardBase): asegura un frame pintado en
       el encuadre de salida antes de arrancar el pan. */
    const r1 = requestAnimationFrame(function () {
      const r2 = requestAnimationFrame(function () { setCamIdx(cur); });
      return function () { cancelAnimationFrame(r2); };
    });
    return function () { cancelAnimationFrame(r1); };
  }, [cur]);

  if (!ill || total === 0) return null;

  /* Kinds de los pasos -> color de actividad por bola. */
  const pathDef = (typeof getPath === 'function') ? getPath(pathId) : null;
  const stepKinds = (pathDef && pathDef.steps)
    ? pathDef.steps.map(function (s) { return s.kind; })
    : [];
  function fillColor(i) {
    return PI_KIND_COLOR[stepKinds[i]] || accent || 'var(--focus)';
  }

  const iw = ill.w, ih = ill.h;
  const cam = dots[Math.max(0, Math.min(camIdx, total - 1))];
  const focalX = (drawIn && ill.finish) ? ill.finish.x : cam.x;
  const fx = focalX / iw;
  const fy = (typeof ill.focusY === 'number') ? ill.focusY : cam.y / ih;
  const box = dim ? pathIllustrationCover(dim.w, dim.h, iw, ih, fx, fy) : null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      data-pace-path-scene=""
      className={drawIn ? 'draw-in' : undefined}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: -1,
      }}
    >
      {box && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: box.sw,
          height: box.sh,
          transform: 'translate(' + box.ox + 'px, ' + box.oy + 'px)',
          transition: 'transform 2000ms var(--ease)',
        }}>
          <img
            src={ill.src}
            alt=""
            draggable={false}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', display: 'block',
            }}
          />
          <svg
            viewBox={'0 0 ' + iw + ' ' + ih}
            preserveAspectRatio="none"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              overflow: 'visible',
            }}
          >
            {dots.map(function (dt, i) {
              const rr = dt.r + 2; /* cubre la bola pintada por completo */
              const isDone = drawIn || i < currentIndex;
              const isCurrent = !drawIn && i === currentIndex;
              /* Pop de color: la bola recién terminada al entrar la
                 StepIntro; en Completion, todas escalonadas. */
              const justFilled = !drawIn && !!orbVisible && i === currentIndex - 1;
              const popDelay = drawIn
                ? (250 + i * 180) + 'ms'
                : (justFilled ? '250ms' : null);
              return (
                <g key={i}>
                  <circle
                    cx={dt.x} cy={dt.y} r={rr}
                    fill="var(--line)"
                    stroke="var(--line-2)"
                    strokeWidth="1"
                  />
                  {isDone && (
                    <circle
                      className={popDelay ? 'scene-fill-in' : undefined}
                      style={popDelay ? { animationDelay: popDelay } : undefined}
                      cx={dt.x} cy={dt.y} r={rr}
                      fill={fillColor(i)}
                    />
                  )}
                  {/* Eco de latido tras el pop: celebra el módulo recién
                      terminado (una sola onda, sale después del relleno). */}
                  {justFilled && (
                    <g style={{ color: fillColor(i) }}>
                      <circle
                        className="scene-echo-ring"
                        cx={dt.x} cy={dt.y} r={rr}
                        style={{ animationDelay: '900ms' }}
                      />
                    </g>
                  )}
                  {isCurrent && (
                    <g style={{ color: fillColor(i) }}>
                      <circle className="scene-pulse-ring" cx={dt.x} cy={dt.y} r={rr} />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* s104d: etiqueta del paso ANCLADA bajo la bola actual (decisión
              del usuario con mockup): nombre grande + numeral debajo. Viaja
              con la cámara (vive en el wrapper transformado); posición en %
              del espacio de imagen = misma precisión que los casquetes. */}
          {label && !drawIn && (
            <div style={{
              position: 'absolute',
              left: (dots[cur].x / iw * 100) + '%',
              top: ((dots[cur].y + dots[cur].r + 14) / ih * 100) + '%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
              {/* Placa mini de papel (s104d bis): misma familia que la placa
                  de la Completion — papel DEL ARTE + hairline + blur. Tinta
                  rebajada a --ink-2/--ink-3: el negro puro no casa con la
                  tinta oliva del dibujo. */}
              <div style={{
                display: 'inline-block',
                background: pathIllustrationPaperRgba(ill.paper, 0.86),
                border: '1px solid rgba(184, 173, 142, 0.55)',
                borderRadius: 'var(--r-md)',
                padding: '7px 20px 6px',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 'clamp(24px, 3.5vw, 36px)',
                  lineHeight: 1.15,
                  color: 'var(--ink-2)',
                }}>{label}</div>
                {labelKicker ? (
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 14,
                    letterSpacing: '0.14em',
                    color: 'var(--ink-3)',
                    marginTop: 2,
                  }}>{labelKicker}</div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PathIllustration });
