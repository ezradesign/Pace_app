/* PACE · YearView — heatmap anual — sesión 44 */

const { useState, useRef, useEffect } = React;


/* =====================================================================
   YEAR VIEW — sesión 44
   ===================================================================== */

/* Score compuesto: focusBlocks (25min=1, cap 3) + breathSessions + moveSessions + waterFrac. */
function computeDayScore(entry) {
  if (!entry) return 0;
  const { focusMinutes: fm, breathMinutes: bm, moveMinutes: mm, waterGlasses: wg } = entry;
  return Math.min(Math.round((fm||0)/25),3) + ((bm||0)>0?1:0) + ((mm||0)>0?1:0) + Math.min((wg||0)/8,1);
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
    const level    = isFuture ? -1 : (isPreUse ? -2 : computeLevel(score));
    const dow      = (d.getDay()+6)%7;
    const col      = Math.floor((n+jan1Dow)/7);
    result.push({ dateStr, score, level, entry, isPreUse, isFuture, dow, col, d });
  }
  return result;
}

/* Totales del año iterando yearData una sola vez. */
function computeYearStats(yearData) {
  let totalActions=0, activeDays=0, maxStreak=0, curStreak=0;
  for (const cell of yearData) {
    if (cell.isFuture) break;
    if (cell.score > 0) {
      totalActions += Math.round(cell.score);
      activeDays++;
      curStreak++;
      if (curStreak > maxStreak) maxStreak = curStreak;
    } else if (!cell.isPreUse) {
      curStreak = 0;
    }
  }
  return { totalActions, activeDays, maxStreak };
}

/* Columna del grid donde empieza cada mes (para etiquetas). */
function getMonthColumns(year, jan1Dow) {
  const result = {};
  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1);
    const dayOfYear = Math.floor((d - new Date(year,0,0)) / 86400000) - 1;
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
  const { totalActions, activeDays, maxStreak } = computeYearStats(yearData);
  const jan1Dow   = (new Date(viewYear,0,1).getDay()+6)%7;
  const totalCols = Math.ceil((yearData.length+jan1Dow)/7);
  const monthCols = getMonthColumns(viewYear, jan1Dow);
  const hasAnyData = yearData.some(c => c.score > 0);
  const monthNames = t('stats.year.months.short').split(',');
  const dayRowLabels = t('stats.year.days.label').split(',');

  // Índice rápido por col-dow
  const cellMap = {};
  for (const cell of yearData) cellMap[`${cell.col}-${cell.dow}`] = cell;

  function handleEnter(e, cell) {
    if (cell.score <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const text = `${formatDateLiteral(cell.d,lang)} · ${t('stats.year.tooltip.score').replace('{n}', Math.round(cell.score*10)/10)}`;
    setTooltip({ text, x: rect.left+rect.width/2, y: rect.top, key: cell.dateStr });
  }
  function handleLeave() { setTooltip(null); }
  function handleTap(e, cell) {
    if (cell.score <= 0) return;
    e.preventDefault();
    if (tooltip && tooltip.key === cell.dateStr) { setTooltip(null); return; }
    const text = `${formatDateLiteral(cell.d,lang)} · ${t('stats.year.tooltip.score').replace('{n}', Math.round(cell.score*10)/10)}`;
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

  return (
    <div data-pace-year-view>
      <style>{`
        @media (max-width:640px) {
          [data-pace-year-view] [data-pace-year-grid-wrap] { scroll-snap-type:x mandatory !important; }
          [data-pace-year-view] [data-pace-year-cell] { width:11px !important;height:11px !important; }
          [data-pace-year-view] [data-pace-year-month-lbl] { font-size:8px !important; }
          [data-pace-year-view] [data-pace-year-day-lbl] { font-size:8px !important;width:12px !important; }
        }
      `}</style>

      {/* Navegación de año */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
        <button onClick={prevYear} disabled={!canPrev} aria-label="Año anterior" style={{
          background:'none',border:'none',cursor:canPrev?'pointer':'default',
          color:canPrev?'var(--ink-2)':'var(--ink-3)',fontSize:18,padding:'4px 10px',borderRadius:'var(--r-sm)',
        }}>&#8249;</button>
        <span style={{ fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:20,color:'var(--ink)' }}>{viewYear}</span>
        <button onClick={nextYear} disabled={!canNext} aria-label="Año siguiente" style={{
          background:'none',border:'none',cursor:canNext?'pointer':'default',
          color:canNext?'var(--ink-2)':'var(--ink-3)',fontSize:18,padding:'4px 10px',borderRadius:'var(--r-sm)',
        }}>&#8250;</button>
      </div>

      {/* Grid con scroll horizontal en móvil */}
      <div data-pace-year-grid-wrap style={{ overflowX:'auto',WebkitOverflowScrolling:'touch' }}>
        <div style={{ display:'inline-block',minWidth:'max-content' }}>

          {/* Etiquetas de meses */}
          <div style={{ display:'flex',marginLeft:20,marginBottom:4 }}>
            {Array.from({ length: totalCols }, (_,col) => (
              <div key={col} data-pace-year-month-lbl style={{
                width:16,marginRight:2,flexShrink:0,fontSize:9,color:'var(--ink-3)',
                letterSpacing:0.2,overflow:'visible',whiteSpace:'nowrap',
              }}>
                {monthCols[col] !== undefined ? monthNames[monthCols[col]] : ''}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div style={{ display:'flex' }}>
            {/* Etiquetas de día (L/X/V en filas 0,2,4) */}
            <div style={{ display:'flex',flexDirection:'column',gap:2,marginRight:4 }}>
              {[0,1,2,3,4,5,6].map(row => (
                <div key={row} data-pace-year-day-lbl style={{
                  width:16,height:14,fontSize:9,color:'var(--ink-3)',display:'flex',alignItems:'center',
                }}>
                  {row===0 ? dayRowLabels[0] : row===2 ? dayRowLabels[1] : row===4 ? dayRowLabels[2] : ''}
                </div>
              ))}
            </div>

            {/* Columnas de semanas */}
            {Array.from({ length: totalCols }, (_,col) => (
              <div key={col} style={{ display:'flex',flexDirection:'column',gap:2,marginRight:2 }}>
                {[0,1,2,3,4,5,6].map(row => {
                  const cell = cellMap[`${col}-${row}`];

                  // Celda sin día (offset inicio/fin de año) o día futuro → hueco invisible
                  if (!cell || cell.isFuture) {
                    return <div key={row} data-pace-year-cell style={{ width:14,height:14,borderRadius:2 }} />;
                  }

                  // Pre-uso: crema con borde muy tenue
                  if (cell.isPreUse) {
                    return (
                      <div key={row} data-pace-year-cell style={{
                        width:14,height:14,borderRadius:2,
                        background:'var(--paper-2)',border:'1px solid var(--line)',opacity:0.35,
                      }} />
                    );
                  }

                  const lvl     = cell.level;
                  const ls      = yearLevelStyles[lvl] || yearLevelStyles[0];
                  const hasData = cell.score > 0;

                  return (
                    <div key={row} data-pace-year-cell
                      onClick={hasData ? ()=>handleClick(cell) : undefined}
                      onMouseEnter={hasData ? (e)=>handleEnter(e,cell) : undefined}
                      onMouseLeave={hasData ? handleLeave : undefined}
                      onTouchEnd={hasData ? (e)=>handleTap(e,cell) : undefined}
                      style={{
                        width:14,height:14,borderRadius:2,position:'relative',
                        background: lvl===0 ? 'var(--paper-3)' : 'transparent',
                        border: lvl===0 ? '1px solid var(--line)' : 'none',
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
      </div>

      {/* Leyenda */}
      <div style={{ display:'flex',alignItems:'center',gap:5,marginTop:10,justifyContent:'flex-end' }}>
        <span style={{ fontSize:10,color:'var(--ink-3)' }}>{t('stats.year.legend.less')}</span>
        {[0,1,2,3,4].map(lvl => {
          const ls = yearLevelStyles[lvl];
          return (
            <div key={lvl} style={{
              width:12,height:12,borderRadius:2,position:'relative',
              background: lvl===0 ? 'var(--paper-3)' : 'transparent',
              border: lvl===0 ? '1px solid var(--line)' : 'none',
            }}>
              {lvl>0 && <div style={{ position:'absolute',inset:0,borderRadius:'inherit',background:ls.bg,opacity:ls.op }} />}
            </div>
          );
        })}
        <span style={{ fontSize:10,color:'var(--ink-3)' }}>{t('stats.year.legend.more')}</span>
      </div>

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
          fontSize:12,color:'var(--ink-2)',display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',
        }}>
          <span>{t('stats.year.totalActions').replace('{n}', totalActions)}</span>
          <span style={{ color:'var(--ink-3)' }}>·</span>
          <span>{t('stats.year.activeDays').replace('{n}', activeDays)}</span>
          <span style={{ color:'var(--ink-3)' }}>·</span>
          <span>{t('stats.year.maxStreak').replace('{n}', maxStreak)}</span>
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
