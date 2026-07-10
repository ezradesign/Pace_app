/* PACE - Caminos - SenderoBar (sesion 75 / v0.29.0)
   Visualizacion del progreso interno de un Camino como sendero horizontal:
   curva organica + hitos con halo. Puramente declarativo, sin estado.
   currentColor hereda del tema (claro / oscuro Candil).
*/

const { useId: useIdSB } = React;

/* Parametros Bezier por segmento. Asimetria organica intencional para
   evitar simetria perfecta. Ratios r1/r2 son fracciones de la longitud
   del segmento (escalan automaticamente con N). y1/y2 son absolutos.
   NOTA s99: se probo mover los hitos a crestas/valles (Sesion B) y el
   usuario prefirio la curva fluida original con los hitos en la linea
   central -> revertido. Se conserva solo el anillo pulsante del hito
   actual como unico anadido. */
const SB_SEG_PARAMS = [
  { y1: 22, y2: 24, r1: 0.24, r2: 0.760 }, // 0: arriba, ligero peso derecha
  { y1: 78, y2: 82, r1: 0.24, r2: 0.755 }, // 1: abajo
  { y1: 22, y2: 18, r1: 0.24, r2: 0.789 }, // 2: arriba, opuesto
  { y1: 78, y2: 76, r1: 0.24, r2: 0.770 }, // 3: abajo, suave
  { y1: 22, y2: 26, r1: 0.24, r2: 0.740 }, // 4: arriba
];

const SB_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function sbToRoman(n) {
  return SB_ROMAN[n - 1] || String(n);
}

/* Posicion X de cada hito, equidistantes entre 60 y 580.
   N=1 -> hito unico en x=320. */
function sbHitoX(i, total) {
  if (total <= 1) return 320;
  return 60 + i * (520 / (total - 1));
}

/* Genera el path "C cp1x cp1y, cp2x cp2y, x1 50" de un segmento. */
function sbSegmentPath(x0, x1, segIdx) {
  const span = x1 - x0;
  const p = SB_SEG_PARAMS[segIdx % SB_SEG_PARAMS.length];
  const cp1x = x0 + p.r1 * span;
  const cp2x = x0 + p.r2 * span;
  return `C ${cp1x.toFixed(2)} ${p.y1}, ${cp2x.toFixed(2)} ${p.y2}, ${x1} 50`;
}

/* drawIn (s100 · CompletionScreen): el trazo done se dibuja de izquierda a
   derecha (pathLength=1 normaliza el compound path para stroke-dasharray) y
   los hitos + labels aparecen escalonados detras. CSS puro en tokens.css ->
   reduced-motion lo salta a estado final. pathLength SOLO se pone con drawIn
   para no tocar el dasharray del pending en TransitionCards. */
function SenderoBarBase({ blocks, currentIndex, size, orbVisible, accent, drawIn }) {
  const reactId = useIdSB();
  const haloDoneId = `sb-halo-done-${reactId}`;
  const haloCurrentId = `sb-halo-current-${reactId}`;

  const total = (blocks && blocks.length) || 0;
  if (total === 0) return null;

  const isLarge = size === 'lg';

  const xs = [];
  for (let i = 0; i < total; i++) xs.push(sbHitoX(i, total));

  // Partir segmentos en dos paths: completados (solidos) y pendientes (punteados).
  // El segmento "actual" (entre currentIndex-1 y currentIndex) ya se considera completado.
  // Los segmentos pendientes son los que parten del hito currentIndex hacia adelante.
  const doneSegs = [];
  const pendingSegs = [];
  for (let i = 0; i < total - 1; i++) {
    const seg = sbSegmentPath(xs[i], xs[i + 1], i);
    const startMove = `M ${xs[i]} 50 ${seg}`;
    if (i < currentIndex) doneSegs.push(startMove);
    else pendingSegs.push(startMove);
  }
  const donePath = doneSegs.join(' ');
  const pendingPath = pendingSegs.join(' ');

  /* Orbe viajero (s77): SOLO durante StepIntro. Recorre el ultimo segmento
     completado (del hito currentIndex-1 al currentIndex) en --path-step-ms.
     Decision 10 del prompt s77: CSS puro via animateMotion. */
  const showOrb = !!orbVisible && currentIndex > 0 && currentIndex <= total - 1;
  let orbPath = null;
  if (showOrb) {
    const prev = currentIndex - 1;
    const segIdx = prev;
    const segD = sbSegmentPath(xs[prev], xs[currentIndex], segIdx);
    orbPath = `M ${xs[prev]} 50 ${segD}`;
  }

  const className = 'sendero-bar' + (isLarge ? ' lg' : '') + (drawIn ? ' draw-in' : '');

  return (
    <div className={className}>
      <div className="sendero-wrap">
        <svg className="sendero-svg" viewBox="0 0 640 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id={haloDoneId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.21" />
              <stop offset="55%" stopColor="currentColor" stopOpacity="0.055" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={haloCurrentId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.70" />
              <stop offset="55%" stopColor="currentColor" stopOpacity="0.16" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>

          {donePath && <path className="path-line" d={donePath} pathLength={drawIn ? 1 : undefined} />}
          {pendingPath && <path className="path-line pending" d={pendingPath} />}

          {xs.map(function(cx, i) {
            const label = (blocks[i] && blocks[i].name) || '';
            if (i < currentIndex) {
              return (
                <g key={i}>
                  {label && <title>{label}</title>}
                  <circle cx={cx} cy="50" r="10" fill={`url(#${haloDoneId})`} />
                  <circle cx={cx} cy="50" r="4" className="dot-fill" />
                </g>
              );
            }
            if (i === currentIndex) {
              /* accent (s99): tinta SOLO el hito actual (halo + anillo + punto)
                 en el color del paso -- currentColor de estos elementos resuelve
                 al color del <g>. El resto del sendero se queda en ink. */
              return (
                <g key={i} style={accent ? { color: accent } : undefined}>
                  {label && <title>{label}</title>}
                  <circle cx={cx} cy="50" r="19" fill={`url(#${haloCurrentId})`} />
                  {/* Anillo pulsante (CSS, respeta reduced-motion) sobre el hito activo */}
                  <circle className="sendero-pulse-ring" cx={cx} cy="50" r="9" />
                  <circle cx={cx} cy="50" r="4.5" className="dot-fill" />
                </g>
              );
            }
            return (
              <g key={i}>
                {label && <title>{label}</title>}
                <circle cx={cx} cy="50" r="3.2" className="dot-fill" opacity="0.32" />
              </g>
            );
          })}

          {showOrb && (
            <g className="sendero-orb">
              {/* Glow primero (debajo) */}
              <circle r="7" fill="var(--focus)" opacity="0.30">
                <animateMotion dur="2s" fill="freeze" path={orbPath} />
              </circle>
              {/* Punto solido encima */}
              <circle r="3" fill="var(--focus)">
                <animateMotion dur="2s" fill="freeze" path={orbPath} />
              </circle>
            </g>
          )}
        </svg>
      </div>

      {/* hito-labels (s77b): SOLO los hitos done (i < currentIndex).
          - En .lg (TransitionCards): el current ya aparece como titulo
            grande Garamond, asi que no se duplica; los pending quedan
            sin spoiler.
          - En no-lg (CompletionScreen): currentIndex === totalSteps,
            asi que muestra TODOS (todos son done). Comportamiento
            funcionalmente identico al de s76 en CompletionScreen. */}
      {currentIndex > 0 && (
        <div className="hito-labels">
          {blocks.map(function(b, i) {
            if (i >= currentIndex) return null;
            const leftPct = total <= 1 ? 50 : ((xs[i] / 640) * 100);
            return (
              <span
                key={b.id + '-' + i}
                className="hito-label done"
                style={{ left: leftPct + '%' }}
              >
                {b.name}
                <span className="hito-roman">{sbToRoman(i + 1)}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* memo: PathFocusStep tickea cada segundo. Sin memo, SenderoBar
   re-renderiza por tick aunque blocks/currentIndex sean estables.
   En movil 60 ticks/min es coste real. */
const SenderoBar = React.memo(SenderoBarBase);

Object.assign(window, { SenderoBar });
