/* PACE - TimerDial (sesion 76 / v0.30.0)
   Anillo circular compartido entre FocusTimer (Pomodoro home) y
   PathFocusStep (Pomodoro dentro de un Camino). Extraido de
   FocusTimer.TimerAro para eliminar la divergencia visual entre
   ambos sitios (auditoria s75, captura 3).

   Puramente presentacional. El padre controla running/setRunning y
   provee los controles via el slot `inner` (FocusTimer los inyecta
   dentro del aro; PathFocusStep los deja fuera y pasa inner=null).

   Pixel-equivalente al TimerAro previo:
     viewBox 100 / radio 47.5 / strokeWidth base 0.35 / arco 0.7
     strokeOpacity 0.7 / strokeLinecap round
*/

/* interpolateRingColor - gradiente terracota -> ocre -> oliva en modo
   foco. Estable en pausas (breathe) y larga (focus). Extraido de
   FocusTimer en s76. */
function interpolateRingColor(progress, mode) {
  if (mode === 'pausa') return 'var(--breathe)';
  if (mode === 'larga') return 'var(--focus)';
  const styles = getComputedStyle(document.documentElement);
  const read = (name, fb) => (styles.getPropertyValue(name).trim() || fb);
  const c1 = read('--breathe', '#C97A5D');
  const c2 = read('--move',    '#9A7B4F');
  const c3 = read('--focus',   '#6e7a4e');
  const hexToRgb = (h) => {
    const m = h.replace('#', '');
    return [parseInt(m.slice(0,2),16), parseInt(m.slice(2,4),16), parseInt(m.slice(4,6),16)];
  };
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const blend = (r1, r2, t) => [lerp(r1[0],r2[0],t), lerp(r1[1],r2[1],t), lerp(r1[2],r2[2],t)];
  const r1 = hexToRgb(c1), r2 = hexToRgb(c2), r3 = hexToRgb(c3);
  const t = Math.max(0, Math.min(1, progress));
  const rgb = t < 0.5 ? blend(r1, r2, t * 2) : blend(r2, r3, (t - 0.5) * 2);
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/* TimerTicks - aro de marcas de minuto (s99, variante "ticks" del timer,
   peticion del usuario). 60 marcas radiales tipo reloj; cada 5 es mayor.
   Las que ya pasaron (i < progress*60) se pintan en el color del arco; las
   que faltan quedan tenues -> textura de reloj + progreso legible. El svg
   NO se rota (las marcas ya nacen arriba via -PI/2). */
function TimerTicks({ progress, color }) {
  const N = 60;
  const passed = progress * N;
  const marks = [];
  for (let i = 0; i < N; i++) {
    const major = i % 5 === 0;
    const a = (i / N) * 2 * Math.PI - Math.PI / 2;
    const rOut = 48.5;
    const rIn = major ? 42.5 : 45;
    const isPast = i < passed;
    marks.push(
      <line key={i}
        x1={(50 + rIn * Math.cos(a)).toFixed(2)} y1={(50 + rIn * Math.sin(a)).toFixed(2)}
        x2={(50 + rOut * Math.cos(a)).toFixed(2)} y2={(50 + rOut * Math.sin(a)).toFixed(2)}
        stroke={isPast ? color : 'var(--line)'}
        strokeWidth={major ? 0.9 : 0.5}
        strokeOpacity={isPast ? 0.95 : 0.4}
        strokeLinecap="round"
        style={{ transition: 'stroke 0.5s linear, stroke-opacity 0.5s linear' }} />
    );
  }
  return <React.Fragment>{marks}</React.Fragment>;
}

function TimerDial({ mins, secs, progress, mode, modeLabel, subtitle, inner, running, ticks, fitHeight }) {
  const R = 47.5;
  const C = 2 * Math.PI * R;
  // Color del arco/marcas una sola vez (lo comparten arco, punto guia y ticks).
  const ringColor = interpolateRingColor(progress, mode);

  /* fitHeight (s123, SOLO home): el aro se dimensiona por la ALTURA ÚTIL de su
     contenedor (no por 56vh del viewport), encogiéndose en pantallas bajas hasta
     un mínimo legible, para no desbordar main-content y recortar bolas/CICLO. La
     geometría del anillo (viewBox/R/C/SVG) NO cambia: solo cambia el tamaño del
     marco, que el SVG ya escala a 100%. El clamp real (con fallback vh→dvh) vive
     en _responsive.js sobre [data-pace-dial-fit]. Caminos NO pasa la prop → usa
     el marco clásico min(56vh,86vw,520px), byte-idéntico. */

  return (
    /* data-pace-dial-running: gancho para el halo "respirando" del aro
       cuando el Pomodoro corre (CSS en tokens.css, pack de pulido A).
       Solo presente cuando running -> el selector [data-...] no matchea
       en reposo. Puramente presentacional; el padre decide `running`.
       `ticks`: variante aro de marcas de minuto (Caminos Foco); sin ticks
       es el aro clasico con arco + punto guia (FocusTimer home). */
    <div data-pace-dial-running={running ? '' : undefined}
         data-pace-dial-fit={fitHeight ? '' : undefined}
         style={fitHeight ? timerDialStyles.frameFit : timerDialStyles.frame}>
      {ticks ? (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <TimerTicks progress={progress} color={ringColor} />
        </svg>
      ) : (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {/* Track suave */}
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--line)" strokeWidth="0.7" strokeOpacity="0.85" />
          {/* Arco de progreso: mas presente (s99) con cap redondo */}
          <circle cx="50" cy="50" r={R} fill="none"
            stroke={ringColor} strokeWidth="1.3"
            strokeOpacity="0.92"
            strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s linear' }} />
          {/* Punto guia en la punta del progreso (halo + nucleo).
              s138 — el gate era `progress > 0.001` y hacia que el punto
              montara MAS TARDE que el primer avance del arco. Medido con
              MutationObserver sobre el SVG: el umbral se traduce en segundos
              distintos segun la duracion (0.001 x 1500 s = 1,5 s -> el punto
              espera al segundo 2; 0.001 x 2700 s = 2,7 s -> al segundo 3),
              mientras el arco avanza SIEMPRE en el segundo 1. Desfase real
              1003 ms a 25 min y 1999 ms a 45 min (0 s a 15, 2 s a 35).
              `progress` es `1 - remaining/totalSec` (FocusTimer.jsx:93):
              aritmetica exacta que vale 0 clavado en reposo, asi que el
              umbral no protegia de ruido de coma flotante. Comparar contra 0
              monta el punto en el MISMO tick en que el arco arranca, con
              cualquier duracion (incluida la de "Otro"). */}
          {progress > 0 && (
            <g transform={`rotate(${progress * 360} 50 50)`}
               style={{ transition: 'transform 1s linear' }}>
              <circle cx={50 + R} cy="50" r="1.7" fill={ringColor} opacity="0.22" />
              <circle cx={50 + R} cy="50" r="0.85" fill={ringColor}
                style={{ transition: 'fill 1s linear' }} />
            </g>
          )}
        </svg>
      )}

      <div style={timerDialStyles.inner}>
        {/* data-pace-dial-* (s126): hooks PRESENTACIONALES para el escalado
            proporcional del interior en Desktop (app/main/_responsive.js los
            usa SOLO bajo min-width:769px). No cambian estructura ni lógica y
            son inertes en mobile/tablet y en Caminos (marco clásico). */}
        {modeLabel ? <div data-pace-dial-label style={timerDialStyles.modeLabel}>{modeLabel}</div> : null}
        <div data-pace-dial-number style={ticks ? timerDialStyles.numberHugeTicks : timerDialStyles.numberHuge}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
        {/* aria-live: anuncia el cambio del subtítulo (descriptor por duración
            y, en el home, «Ciclo completado») de forma cortés. El número del
            contador vive en otro div sin live → no se lee cada segundo. En
            Caminos subtitle=null, así que este nodo ni existe. */}
        {subtitle ? <div data-pace-dial-subtitle style={timerDialStyles.subtitleItalic} aria-live="polite">{subtitle}</div> : null}
        {inner ? <div data-pace-dial-divider style={timerDialStyles.innerDivider} /> : null}
        {inner}
      </div>
    </div>
  );
}

const timerDialStyles = {
  frame: {
    position: 'relative',
    height: 'min(56vh, 86vw, 520px)',
    width: 'min(56vh, 86vw, 520px)',
    aspectRatio: '1 / 1',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  /* Variante fitHeight (s123, home). height/width los fija _responsive.js con
     [data-pace-dial-fit] (clamp por altura útil + fallback vh→dvh); aquí solo el
     resto del marco. aspect-ratio 1/1 + height del CSS → width cuadrado; el
     maxWidth:100% blinda contra desbordes horizontales en ancho+corto. */
  frameFit: {
    position: 'relative',
    aspectRatio: '1 / 1',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    maxWidth: '100%',
  },
  inner: {
    position: 'relative',
    textAlign: 'center',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '70%',
  },
  modeLabel: {
    fontSize: 11,
    letterSpacing: '0.26em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: 10,
    fontWeight: 500,
  },
  numberHuge: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 0.9,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.03em',
    color: 'var(--ink)',
    fontSize: 'clamp(64px, 7vw, 104px)',
  },
  /* Variante ticks (Caminos Foco): numero PROTAGONISTA, mayor que el clasico
     (el usuario lo queria mas grande). nowrap para que no parta el MM:SS. */
  numberHugeTicks: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 0.9,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.03em',
    color: 'var(--ink)',
    fontSize: 'clamp(78px, 9vw, 128px)',
    whiteSpace: 'nowrap',
  },
  subtitleItalic: {
    fontStyle: 'italic',
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    color: 'var(--ink-3)',
    marginTop: 30,
    letterSpacing: 0.2,
  },
  innerDivider: {
    width: 110,
    height: 1,
    background: 'var(--line-2)',
    opacity: 0.55,
    margin: '12px 0 10px',
  },
};

Object.assign(window, { TimerDial, interpolateRingColor });
