/* PACE · YearView — heatmap anual — sesión 44 */

const { useState, useRef, useEffect } = React;


/* =====================================================================
   YEAR VIEW — sesión 44
   ===================================================================== */

/* PRESENCIA E INTENSIDAD, SEPARADAS (auditoría del 21 oct.). Que un día tenga color lo decide
   la presencia: algo de foco, Respira, cuerpo o agua. Cuánto color, la intensidad. Antes la
   presencia salía de la intensidad, que cuenta el foco en bloques de 25 min redondeados: un día
   con 1-12 min de foco quedaba vacío, y un año así decía «Aún no hay actividad». */
function yearPresente(entry) {
  return isActiveDay(entry) || ((entry && entry.waterGlasses) || 0) > 0;
}

/* Intensidad: focusBlocks (25min=1, cap 3) + breathSessions + moveSessions + waterFrac. Por
   debajo de medio bloque, el foco cuenta su fracción y no cero. */
function computeDayScore(entry) {
  if (!entry) return 0;
  const { focusMinutes: fm, breathMinutes: bm, moveMinutes: mm, waterGlasses: wg } = entry;
  const bloques = Math.min(Math.round((fm||0)/25),3) || (fm||0)/25;
  return bloques + ((bm||0)>0?1:0) + ((mm||0)>0?1:0) + Math.min((wg||0)/8,1);
}

/* Nivel 0-4 según umbrales acordados. */
function computeLevel(score) {
  if (score <= 0)   return 0;
  if (score <= 1.5) return 1;
  if (score <= 3)   return 2;
  if (score <= 4.5) return 3;
  return 4;
}

/* Color + opacidad por nivel. Niveles 1-2: ocre; 3: terracota; 4: oliva (cambio de familia). */
const yearLevelStyles = [
  { bg: 'var(--paper-3)', op: 1    },
  { bg: 'var(--move)',    op: 0.22 },
  { bg: 'var(--move)',    op: 0.48 },
  { bg: 'var(--breathe)', op: 0.72 },
  { bg: 'var(--focus)',   op: 1    },
];

/* Array de 365/366 entradas con metadatos de posición en el grid. */
function getYearData(history, year, firstSeenTimestamp) {
  const today    = new Date();
  const pad      = n => String(n).padStart(2,'0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  const _fsd     = firstSeenTimestamp ? new Date(firstSeenTimestamp) : null;
  const firstSeenStr = _fsd ? `${_fsd.getFullYear()}-${pad(_fsd.getMonth()+1)}-${pad(_fsd.getDate())}` : null;

  const isLeap    = (year%4===0 && year%100!==0) || year%400===0;
  const totalDays = isLeap ? 366 : 365;
  const jan1Dow   = (new Date(year,0,1).getDay()+6)%7;
  const result    = [];

  for (let n = 0; n < totalDays; n++) {
    const d        = new Date(year, 0, n+1);
    const dateStr  = `${year}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const isFuture = dateStr > todayStr;
    const isPreUse = firstSeenStr ? dateStr < firstSeenStr : false;
    const entry    = !isFuture && history.days && history.days[dateStr] ? history.days[dateStr] : null;
    const score    = entry ? computeDayScore(entry) : 0;
    const level    = isFuture ? -1 : (isPreUse ? -2 : (yearPresente(entry) ? Math.max(1, computeLevel(score)) : 0));
    const dow      = (d.getDay()+6)%7;
    const col      = Math.floor((n+jan1Dow)/7);
    result.push({ dateStr, score, level, entry, isPreUse, isFuture, dow, col, d });
  }
  return result;
}

/* Definicion de "dia activo" para streaks (sesion 69): focus|breath|move > 0.
   Agua sola NO cuenta, alineado con updateStreak() en state-achievements.jsx.
   El "score" puede incluir agua para el color, pero la racha SOLO mira sesiones. */
function isActiveDay(entry) {
  if (!entry) return false;
  return (entry.focusMinutes  || 0) > 0
      || (entry.breathMinutes || 0) > 0
      || (entry.moveMinutes   || 0) > 0;
}

/* Totales del año iterando yearData una sola vez.
   B1: fuera totalActions — era el score sintético (bloques de foco + presencias
   + fracción de agua) redondeado y presentado como "acciones". La cifra del
   año es activeDays: días con ritmo REALES (criterio isActiveDay s69). */
function computeYearStats(yearData) {
  let activeDays=0, maxStreak=0, curStreak=0;
  for (const cell of yearData) {
    if (cell.isFuture) break;
    const active = isActiveDay(cell.entry);
    if (active) {
      activeDays++;
      curStreak++;
      if (curStreak > maxStreak) maxStreak = curStreak;
    } else if (!cell.isPreUse) {
      curStreak = 0;
    }
  }
  return { activeDays, maxStreak };
}

/* Columna del grid donde empieza cada mes (para etiquetas). */
function getMonthColumns(year, jan1Dow) {
  const result = {};
  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1);
    /* s198 · REDONDEAR, no truncar: entre el cambio de hora de primavera y el de
       otoño la resta es una hora más corta y `floor` daba un día menos, así que la
       etiqueta caía una columna antes que su día 1 (medido: «jun» en 2026, «sep» en
       2025). Mismo índice `n` que usan las celdas en getYearData. */
    const dayOfYear = Math.round((d - new Date(year,0,1)) / 86400000);
    result[Math.floor((dayOfYear+jan1Dow)/7)] = m;
  }
  return result;
}

function formatDateLiteral(d, lang) {
  return d.toLocaleDateString(lang==='en'?'en-GB':'es-ES', { day:'numeric', month:'long' });
}

function YearView({ history, lang, firstSeen, onNavigateToMonth }) {
  const { t } = useT();
  const now         = new Date();
  const currentYear = now.getFullYear();

  const availableYears = (() => {
    const set = new Set([...(history.years ? Object.keys(history.years).map(Number) : []), currentYear]);
    return Array.from(set).sort((a,b)=>a-b);
  })();

  const [viewYear, setViewYear] = useState(currentYear);
  const [tooltip, setTooltip]   = useState(null);
  const tooltipRef              = useRef(null);

  const yearIdx = availableYears.indexOf(viewYear);
  const canPrev = yearIdx > 0;
  const canNext = yearIdx < availableYears.length - 1;
  function prevYear() { if (canPrev) setViewYear(availableYears[yearIdx-1]); }
  function nextYear() { if (canNext) setViewYear(availableYears[yearIdx+1]); }

  const yearData  = getYearData(history, viewYear, firstSeen);
  const { activeDays, maxStreak } = computeYearStats(yearData);
  const jan1Dow   = (new Date(viewYear,0,1).getDay()+6)%7;
  const totalCols = Math.ceil((yearData.length+jan1Dow)/7);
  const monthCols = getMonthColumns(viewYear, jan1Dow);
  /* El año en DOS MITADES: enero-junio y julio-diciembre. En el móvil van una debajo de
     otra (ya no hay que deslizar de lado); en el escritorio, una al lado de otra, y se
     leen como la fila única de siempre. Corta en la columna del 1 de julio. */
  const corte = Math.floor((Math.round((new Date(viewYear,6,1) - new Date(viewYear,0,1)) / 86400000) + jan1Dow) / 7);
  const columnas = (desde, hasta) => Array.from({ length: hasta - desde }, (_, i) => desde + i);
  const hasAnyData = yearData.some(c => c.level > 0);
  const monthNames = t('stats.year.months.short').split(',');
  const dayRowLabels = t('stats.year.days.label').split(',');

  // Índice rápido por col-dow
  const cellMap = {};
  for (const cell of yearData) cellMap[`${cell.col}-${cell.dow}`] = cell;

  /* La intensidad con un decimal y la coma de cada idioma; un día con algo nunca dice 0. */
  const intensidad = (cell) => t('stats.year.tooltip.score').replace('{n}', statsNumero(Math.max(0.1, cell.score), lang, 1));
  function handleEnter(e, cell) {
    if (cell.level <= 0) return;
    const rect = paceCaja(e.currentTarget);
    const text = `${formatDateLiteral(cell.d,lang)} · ${intensidad(cell)}`;
    setTooltip({ text, x: rect.left+rect.width/2, y: rect.top, key: cell.dateStr });
  }
  function handleLeave() { setTooltip(null); }
  function handleTap(e, cell) {
    if (cell.level <= 0) return;
    e.preventDefault();
    if (tooltip && tooltip.key === cell.dateStr) { setTooltip(null); return; }
    const text = `${formatDateLiteral(cell.d,lang)} · ${intensidad(cell)}`;
    setTooltip({ text, key: cell.dateStr, mobile: true });
  }
  function handleClick(cell) {
    if (cell.isFuture || !onNavigateToMonth) return;
    onNavigateToMonth(cell.d.getFullYear(), cell.d.getMonth());
  }

  useEffect(() => {
    if (!tooltip || !tooltip.mobile) return;
    function onOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setTooltip(null);
    }
    document.addEventListener('touchstart', onOutside);
    return () => document.removeEventListener('touchstart', onOutside);
  }, [tooltip]);

  const leyenda = (
    <div data-pace-year-leyenda style={{ display:'flex',alignItems:'center',gap:5,marginLeft:'auto' }}>
      <span style={{ fontSize:10,color:'var(--ink-3)' }}>{t('stats.year.legend.less')}</span>
      {[0,1,2,3,4].map(lvl => {
        const ls = yearLevelStyles[lvl];
        return (
          <div key={lvl} style={{
            width:12,height:12,borderRadius:2,position:'relative',
            background: lvl===0 ? 'var(--paper-3)' : 'transparent',
          }}>
            {lvl>0 && <div style={{ position:'absolute',inset:0,borderRadius:'inherit',background:ls.bg,opacity:ls.op }} />}
          </div>
        );
      })}
      <span style={{ fontSize:10,color:'var(--ink-3)' }}>{t('stats.year.legend.more')}</span>
    </div>
  );

  return (
    <div data-pace-year-view>
      {/* El tamaño de las celdas va en StatsPanel.css.jsx: en el móvil se ajusta al ancho
          para que medio año quepa en una fila; en el escritorio, 19 px. */}

      {/* Los totales del año: en el móvil, las mismas cuatro tarjetas que la semana y el mes. */}
      <StatsTotales items={statsTotalesDe(history.years && history.years[viewYear], t)} />

      {/* Navegación de año */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
        <button onClick={prevYear} disabled={!canPrev} aria-label={t('stats.year.prev')} style={{
          background:'none',border:'none',cursor:canPrev?'pointer':'default',
          color:canPrev?'var(--ink-2)':'var(--ink-3)',fontSize:18,padding:'4px 10px',borderRadius:'var(--r-sm)',
        }}>&#8249;</button>
        <span style={{ fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:20,color:'var(--ink)' }}>{viewYear}</span>
        <button onClick={nextYear} disabled={!canNext} aria-label={t('stats.year.next')} style={{
          background:'none',border:'none',cursor:canNext?'pointer':'default',
          color:canNext?'var(--ink-2)':'var(--ink-3)',fontSize:18,padding:'4px 10px',borderRadius:'var(--r-sm)',
        }}>&#8250;</button>
      </div>

      {/* Rejilla: dos mitades (ver `corte`). El scroll lateral queda solo como red, si un
          teléfono muy estrecho no llegara a medio año. */}
      <div data-pace-year-grid-wrap style={{ overflowX:'auto',overflowY:'hidden',WebkitOverflowScrolling:'touch' }}>
        <div data-pace-year-mitades style={{ display:'inline-flex',flexDirection:'column',gap:10,minWidth:'max-content' }}>
          {[[0, corte], [corte, totalCols]].map(([desde, hasta], mitad) => (
            <div key={mitad} data-pace-year-mitad={mitad}>
              {/* Etiquetas de meses -- ancho alineado con el paso de columna */}
              <div data-pace-year-meses style={{ display:'flex',marginLeft:18,marginBottom:4 }}>
                {columnas(desde, hasta).map(col => (
                  <div key={col} data-pace-year-month-lbl style={{
                    width:11,marginRight:2,flexShrink:0,fontSize:9,color:'var(--ink-3)',
                    letterSpacing:0.2,overflow:'visible',whiteSpace:'nowrap',
                  }}>
                    {monthCols[col] !== undefined ? monthNames[monthCols[col]] : ''}
                  </div>
                ))}
              </div>

              <div style={{ display:'flex' }}>
                {/* Etiquetas de dia (L M X J V S D) */}
                <div data-pace-year-day-col style={{ display:'flex',flexDirection:'column',gap:2,marginRight:4 }}>
                  {[0,1,2,3,4,5,6].map(row => (
                    <div key={row} data-pace-year-day-lbl style={{
                      width:14,height:11,fontSize:9,color:'var(--ink-3)',display:'flex',alignItems:'center',
                    }}>
                      {dayRowLabels[row] || ''}
                    </div>
                  ))}
                </div>

                {/* Columnas de semanas */}
                {columnas(desde, hasta).map(col => (
                  <div key={col} style={{ display:'flex',flexDirection:'column',gap:2,marginRight:2 }}>
                    {[0,1,2,3,4,5,6].map(row => {
                      const cell = cellMap[`${col}-${row}`];

                      // Celda fuera del año (offset inicio/fin) -> hueco invisible.
                      if (!cell) {
                        return <div key={row} data-pace-year-cell style={{ width:11,height:11,borderRadius:2 }} />;
                      }

                      // Dia futuro: solo borde tenue sin relleno (s63) para
                      // distinguirlos de los dias pasados sin actividad (lvl=0).
                      if (cell.isFuture) {
                        return (
                          <div key={row} data-pace-year-cell style={{
                            width:11,height:11,borderRadius:2,
                            background:'transparent',border:'1px solid var(--line)',opacity:0.3,
                          }} />
                        );
                      }

                      // Pre-uso: crema con borde muy tenue
                      if (cell.isPreUse) {
                        return (
                          <div key={row} data-pace-year-cell style={{
                            width:11,height:11,borderRadius:2,
                            background:'var(--paper-2)',border:'1px solid var(--line)',opacity:0.35,
                          }} />
                        );
                      }

                      const lvl     = cell.level;
                      const ls      = yearLevelStyles[lvl] || yearLevelStyles[0];
                      const hasData = lvl > 0;

                      return (
                        <div key={row} data-pace-year-cell
                          onClick={hasData ? ()=>handleClick(cell) : undefined}
                          onMouseEnter={hasData ? (e)=>handleEnter(e,cell) : undefined}
                          onMouseLeave={hasData ? handleLeave : undefined}
                          onTouchEnd={hasData ? (e)=>handleTap(e,cell) : undefined}
                          style={{
                            width:11,height:11,borderRadius:2,position:'relative',
                            /* Un día sin nada es un punto tenue sin borde: con borde, los meses
                               vacíos se leían como un muro de cuadritos. */
                            background: lvl===0 ? 'var(--paper-3)' : 'transparent',
                            cursor: hasData ? 'pointer' : 'default',
                          }}
                        >
                          {lvl > 0 && (
                            <div style={{
                              position:'absolute',inset:0,borderRadius:'inherit',
                              background:ls.bg,opacity:ls.op,
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sin datos, la leyenda va sola a la derecha; con datos, dentro de la línea de
          «días con ritmo» (en el móvil baja a su propia línea dentro de la misma caja). */}
      {!hasAnyData && <div style={{ display:'flex',marginTop:10 }}>{leyenda}</div>}

      {/* Año vacío */}
      {!hasAnyData && (
        <div style={{
          textAlign:'center',padding:'16px 0 8px',
          color:'var(--ink-3)',fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:15,
        }}>
          {t('stats.year.empty').replace('{year}', viewYear)}
        </div>
      )}

      {/* Footer de totales */}
      {hasAnyData && (
        <div style={{
          marginTop:12,padding:'10px 14px',background:'var(--paper-2)',borderRadius:'var(--r-sm)',
          fontSize:12,color:'var(--ink-2)',display:'flex',flexWrap:'wrap',gap:8,rowGap:6,alignItems:'center',
        }}>
          <span>{activeDays === 1 ? t('stats.year.activeDays.1') : t('stats.year.activeDays').replace('{n}', activeDays)}</span>
          <span style={{ color:'var(--ink-3)' }}>·</span>
          <span>{maxStreak === 1 ? t('stats.year.maxStreak.1') : t('stats.year.maxStreak').replace('{n}', maxStreak)}</span>
          {leyenda}
        </div>
      )}

      {/* Tooltip desktop */}
      {tooltip && !tooltip.mobile && (
        <div style={{
          position:'fixed',left:tooltip.x,top:tooltip.y-8,transform:'translate(-50%,-100%)',
          background:'var(--ink)',color:'var(--paper)',padding:'6px 10px',borderRadius:'var(--r-sm)',
          fontSize:11,pointerEvents:'none',whiteSpace:'nowrap',zIndex:9999,boxShadow:'0 2px 8px rgba(0,0,0,0.18)',
        }}>{tooltip.text}</div>
      )}
      {/* Tooltip móvil */}
      {tooltip && tooltip.mobile && (
        <div ref={tooltipRef} style={{
          position:'fixed',bottom:88,left:'50%',transform:'translateX(-50%)',
          background:'var(--ink)',color:'var(--paper)',padding:'10px 16px',borderRadius:'var(--r-md)',
          fontSize:12,zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,0.22)',maxWidth:'90vw',textAlign:'center',lineHeight:1.5,
        }}>{tooltip.text}</div>
      )}
    </div>
  );
}

Object.assign(window, { YearView });
