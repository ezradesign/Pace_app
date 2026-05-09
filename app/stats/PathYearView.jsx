/* PACE · PathYearView -- heatmap anual de Caminos -- sesion 54
   Fuente: array de strings ISO (paths.history). Clon ligero de YearView.
*/
const { useState, useRef, useEffect } = React;

function buildPathDayMap(history) {
  const map = {};
  for (const iso of (history || [])) { if (iso) map[iso] = (map[iso] || 0) + 1; }
  return map;
}
function pathCountLevel(n) {
  if (!n || n <= 0) return 0;
  if (n === 1) return 1; if (n === 2) return 2; if (n === 3) return 3; return 4;
}
const pyvStyles = [
  { bg: 'var(--paper-3)', op: 1 },
  { bg: 'var(--move)',    op: 0.22 },
  { bg: 'var(--move)',    op: 0.48 },
  { bg: 'var(--breathe)', op: 0.72 },
  { bg: 'var(--focus)',   op: 1 },
];
function getPyvData(dayMap, year) {
  const today    = new Date();
  const pad      = n => String(n).padStart(2,'0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  const isLeap   = (year%4===0 && year%100!==0) || year%400===0;
  const total    = isLeap ? 366 : 365;
  const jan1Dow  = (new Date(year,0,1).getDay()+6)%7;
  const result   = [];
  for (let n = 0; n < total; n++) {
    const d       = new Date(year, 0, n+1);
    const dateStr = `${year}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const isFuture = dateStr > todayStr;
    const count   = isFuture ? 0 : (dayMap[dateStr] || 0);
    const level   = isFuture ? -1 : pathCountLevel(count);
    const dow     = (d.getDay()+6)%7;
    const col     = Math.floor((n+jan1Dow)/7);
    result.push({ dateStr, count, level, isFuture, dow, col, d });
  }
  return result;
}
function getPyvMonthCols(year, jan1Dow) {
  const r = {};
  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1);
    const doy = Math.floor((d - new Date(year,0,0)) / 86400000) - 1;
    r[Math.floor((doy+jan1Dow)/7)] = m;
  }
  return r;
}

function PathYearView({ history, lang }) {
  const { t } = useT();
  const now = new Date(); const currentYear = now.getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);
  const [tooltip, setTooltip] = useState(null);
  const tooltipRef = useRef(null);

  const availableYears = (() => {
    const s = new Set([currentYear]);
    for (const iso of (history || [])) { if (iso) s.add(parseInt(iso.slice(0,4),10)); }
    return Array.from(s).sort((a,b)=>a-b);
  })();
  const yi = availableYears.indexOf(viewYear);
  const canPrev = yi > 0, canNext = yi < availableYears.length - 1;

  const dayMap    = buildPathDayMap(history);
  const yearData  = getPyvData(dayMap, viewYear);
  const jan1Dow   = (new Date(viewYear,0,1).getDay()+6)%7;
  const totalCols = Math.ceil((yearData.length+jan1Dow)/7);
  const monthCols = getPyvMonthCols(viewYear, jan1Dow);
  const hasAny    = yearData.some(c => c.count > 0);
  const yearTotal = yearData.reduce((s,c) => s + c.count, 0);
  const monthNames   = t('stats.year.months.short').split(',');
  const dayRowLabels = t('stats.year.days.label').split(',');
  const cellMap = {};
  for (const c of yearData) cellMap[`${c.col}-${c.dow}`] = c;

  function fmtDate(d) {
    return d.toLocaleDateString(lang==='en'?'en-GB':'es-ES',{day:'numeric',month:'long'});
  }
  function unitWord(n) {
    return lang==='en' ? (n===1?'path':'paths') : (n===1?'camino':'caminos');
  }
  function showTip(e, cell, mobile) {
    if (cell.count <= 0) return;
    const txt = `${fmtDate(cell.d)} · ${cell.count} ${unitWord(cell.count)}`;
    if (mobile) { setTooltip({ text:txt, key:cell.dateStr, mobile:true }); }
    else {
      const r = e.currentTarget.getBoundingClientRect();
      setTooltip({ text:txt, x:r.left+r.width/2, y:r.top, key:cell.dateStr });
    }
  }

  useEffect(() => {
    if (!tooltip || !tooltip.mobile) return;
    function out(e) { if (tooltipRef.current && !tooltipRef.current.contains(e.target)) setTooltip(null); }
    document.addEventListener('touchstart', out);
    return () => document.removeEventListener('touchstart', out);
  }, [tooltip]);

  const btnStyle = (active) => ({
    background:'none',border:'none',cursor:active?'pointer':'default',
    color:active?'var(--ink-2)':'var(--ink-3)',fontSize:18,padding:'4px 10px',borderRadius:'var(--r-sm)',
  });

  return (
    <div data-pace-path-year-view>
      <style>{`@media(max-width:640px){[data-pace-path-year-view] [data-pyv-wrap]{scroll-snap-type:x mandatory!important}[data-pace-path-year-view] [data-pyv-cell]{width:11px!important;height:11px!important}[data-pace-path-year-view] [data-pyv-ml]{font-size:8px!important}[data-pace-path-year-view] [data-pyv-dl]{font-size:8px!important;width:12px!important}}`}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <button onClick={()=>{if(canPrev)setViewYear(availableYears[yi-1]);}} disabled={!canPrev} style={btnStyle(canPrev)}>&#8249;</button>
        <span style={{fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:20,color:'var(--ink)'}}>{viewYear}</span>
        <button onClick={()=>{if(canNext)setViewYear(availableYears[yi+1]);}} disabled={!canNext} style={btnStyle(canNext)}>&#8250;</button>
      </div>

      <div data-pyv-wrap style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
        <div style={{display:'inline-block',minWidth:'max-content'}}>
          <div style={{display:'flex',marginLeft:20,marginBottom:4}}>
            {Array.from({length:totalCols},(_,col)=>(
              <div key={col} data-pyv-ml style={{width:16,marginRight:2,flexShrink:0,fontSize:9,color:'var(--ink-3)',overflow:'visible',whiteSpace:'nowrap'}}>
                {monthCols[col]!==undefined?monthNames[monthCols[col]]:''}
              </div>
            ))}
          </div>
          <div style={{display:'flex'}}>
            <div style={{display:'flex',flexDirection:'column',gap:2,marginRight:4}}>
              {[0,1,2,3,4,5,6].map(row=>(
                <div key={row} data-pyv-dl style={{width:16,height:14,fontSize:9,color:'var(--ink-3)',display:'flex',alignItems:'center'}}>
                  {row===0?dayRowLabels[0]:row===2?dayRowLabels[1]:row===4?dayRowLabels[2]:''}
                </div>
              ))}
            </div>
            {Array.from({length:totalCols},(_,col)=>(
              <div key={col} style={{display:'flex',flexDirection:'column',gap:2,marginRight:2}}>
                {[0,1,2,3,4,5,6].map(row=>{
                  const cell=cellMap[`${col}-${row}`];
                  if(!cell||cell.isFuture) return <div key={row} data-pyv-cell style={{width:14,height:14,borderRadius:2}}/>;
                  const lvl=cell.level; const ls=pyvStyles[lvl]||pyvStyles[0]; const hd=cell.count>0;
                  return(
                    <div key={row} data-pyv-cell
                      onMouseEnter={hd?(e)=>showTip(e,cell,false):undefined}
                      onMouseLeave={hd?()=>setTooltip(null):undefined}
                      onTouchEnd={hd?(e)=>{e.preventDefault();if(tooltip&&tooltip.key===cell.dateStr){setTooltip(null);}else{showTip(e,cell,true);}}:undefined}
                      style={{width:14,height:14,borderRadius:2,position:'relative',background:lvl===0?'var(--paper-3)':'transparent',border:lvl===0?'1px solid var(--line)':'none',cursor:hd?'pointer':'default'}}
                    >
                      {lvl>0&&<div style={{position:'absolute',inset:0,borderRadius:'inherit',background:ls.bg,opacity:ls.op}}/>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:5,marginTop:10,justifyContent:'flex-end'}}>
        <span style={{fontSize:10,color:'var(--ink-3)'}}>{t('stats.year.legend.less')}</span>
        {[0,1,2,3,4].map(lvl=>{const ls=pyvStyles[lvl];return(
          <div key={lvl} style={{width:12,height:12,borderRadius:2,position:'relative',background:lvl===0?'var(--paper-3)':'transparent',border:lvl===0?'1px solid var(--line)':'none'}}>
            {lvl>0&&<div style={{position:'absolute',inset:0,borderRadius:'inherit',background:ls.bg,opacity:ls.op}}/>}
          </div>
        );})}
        <span style={{fontSize:10,color:'var(--ink-3)'}}>{t('stats.year.legend.more')}</span>
      </div>

      {!hasAny&&<div style={{textAlign:'center',padding:'16px 0 8px',color:'var(--ink-3)',fontFamily:'var(--font-display)',fontStyle:'italic',fontSize:15}}>{t('stats.year.empty').replace('{year}',viewYear)}</div>}
      {hasAny&&<div style={{marginTop:12,padding:'10px 14px',background:'var(--paper-2)',borderRadius:'var(--r-sm)',fontSize:12,color:'var(--ink-2)'}}>{yearTotal} {unitWord(yearTotal)} {lang==='en'?'this year':'este año'}</div>}

      {tooltip&&!tooltip.mobile&&<div style={{position:'fixed',left:tooltip.x,top:tooltip.y-8,transform:'translate(-50%,-100%)',background:'var(--ink)',color:'var(--paper)',padding:'6px 10px',borderRadius:'var(--r-sm)',fontSize:11,pointerEvents:'none',whiteSpace:'nowrap',zIndex:9999,boxShadow:'0 2px 8px rgba(0,0,0,0.18)'}}>{tooltip.text}</div>}
      {tooltip&&tooltip.mobile&&<div ref={tooltipRef} style={{position:'fixed',bottom:88,left:'50%',transform:'translateX(-50%)',background:'var(--ink)',color:'var(--paper)',padding:'10px 16px',borderRadius:'var(--r-md)',fontSize:12,zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,0.22)',maxWidth:'90vw',textAlign:'center',lineHeight:1.5}}>{tooltip.text}</div>}
    </div>
  );
}

Object.assign(window, { PathYearView });
