/* La propuesta sobre la app de verdad, sin tocar la rama: copias parcheadas por cadenas y encendidas por window.__MAQ.camino ('A' | 'B'). */
'use strict';
const C = require('./comun');
const leer = (r) => C.fs.readFileSync(C.path.join(C.RAIZ, r), 'utf8').replace(/\r\n/g, '\n');
function cambia(txt, viejo, nuevo) {
  if (!txt.includes(viejo)) throw new Error('no casa: ' + viejo.slice(0, 60));
  return txt.replace(viejo, () => nuevo);
}
function rutas() {
  let f = leer('app/focus/FocusTimer.jsx');
  f = cambia(f, "  const aro = state.focusMode === 'foco' && typeof ritmoAro", "  const MAQ = window.__MAQ || {};\n  const maqEn = lang === 'en';\n  const aro = state.focusMode === 'foco' && typeof ritmoAro");
  f = cambia(f, "  const modeLabel = aro ? aro.label", "  const modeLabel = MAQ.camino === 'B' && enPausaRitmo ? (maqEn ? 'Time for a break' : 'Toca una pausa') : aro ? aro.label");
  f = cambia(f, "    : isFocoMode\n    ? (isCompleted ?", "    : (MAQ.camino && aro && status === 'idle' && typeof ritmoPlan === 'function' && (ritmoPlan(state) || {}).pausa) ? (maqEn ? 'Break over' : 'Pausa terminada')\n    : isFocoMode\n    ? (isCompleted ?");
  f = cambia(f, "  /* Dots de ciclo (4 puntitos", `  /* MAQUETA: el botón y la línea de debajo. */
  const maqPlan = MAQ.camino && typeof ritmoPlan === 'function' ? ritmoPlan(state) : null;
  let maqFila = null;
  if (MAQ.camino && enPausaRitmo) {
    const n = pausaRitmo.n;
    ctaLabel = maqEn ? 'Take the break' : 'Hacer la pausa';
    ctaAction = () => {};
    maqFila = <button className="pace-maq-enlace" onClick={empezarYa}>{tn('ritmo.pausa.ya', { n })}</button>;
  } else if (MAQ.camino && aro) {
    if (status === 'running') ctaLabel = maqEn ? 'Pause focus' : 'Pausar foco';
    if (status === 'paused') ctaLabel = maqEn ? 'Resume focus' : 'Reanudar foco';
    const it = maqPlan && maqPlan.actual ? ritmoDetras(maqPlan.m, maqPlan.actual) : null;
    let q = '';
    if (it && it.tipo === 'comida') q = t('ritmo.comida') + ' · ' + ritmoDuracion(it.dur);
    else if (it && it.platos && it.platos.length > 1) q = it.platos.map((x) => ritmoModulo(x.modulo, t)).join(maqEn ? ' and ' : ' y ') + ' · ' + it.dur + ' min';
    else if (it && it.platos && it.platos[0]) q = ritmoModulo(it.platos[0].modulo, t) + ' · ' + ((it.platos[0].rutina && it.platos[0].rutina.min) || it.dur) + ' min';
    if (q) maqFila = <span className="pace-maq-despues" data-maq-solo-esc>{(maqEn ? 'Next: ' : 'Después: ') + q}</span>;
  }
  const maqPausaPrincipal = MAQ.camino && enPausaRitmo;
  const maqAroSegundo = MAQ.camino === 'B' && !aro && !enPausaRitmo && isFocoMode && status === 'idle' && !ritmoDe(state).libre;
  /* Dots de ciclo (4 puntitos`);
  f = cambia(f, "    <div style={aro || enPausaRitmo ? { ...focusStyles.cycleDots, visibility: 'hidden' } : focusStyles.cycleDots}>", `    <div style={maqFila ? { ...focusStyles.cycleDots, position: 'relative' } : aro || enPausaRitmo ? { ...focusStyles.cycleDots, visibility: 'hidden' } : focusStyles.cycleDots}>
      {maqFila ? <span className="pace-maq-fila">{maqFila}</span> : null}`);
  f = cambia(f, "        <span key={i} style={{\n          width: 4, height: 4,", "        <span key={i} style={{ visibility: maqFila ? 'hidden' : undefined,\n          width: 4, height: 4,");
  f = cambia(f, "<span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginLeft: 10 }}>{cycleLabel}</span>", "<span style={{ visibility: maqFila ? 'hidden' : undefined, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginLeft: 10 }}>{cycleLabel}</span>");
  f = cambia(f, "style={running ? focusStyles.startBtnSecondary : focusStyles.startBtnPrimary}", "style={(running && !maqPausaPrincipal) || maqAroSegundo ? focusStyles.startBtnSecondary : focusStyles.startBtnPrimary}");
  f = cambia(f, "      {state.focusMode === 'foco' ? (\n        <MinutesPicker value={state.focusMinutes} onChange={elegirMinutos} />", `      {MAQ.camino === 'B' && aro ? (
        <div className="pace-maq-minutos">{(maqEn ? state.focusMinutes + '-min blocks' : 'Bloques de ' + state.focusMinutes + ' min') + ' · '}<u>{maqEn ? 'Change' : 'Cambiar'}</u></div>
      ) : state.focusMode === 'foco' ? (
        <MinutesPicker value={state.focusMinutes} onChange={elegirMinutos} />`);
  f = cambia(f, "          hasta={aro ? aro.hasta : null}", "          hasta={MAQ.camino === 'B' && enPausaRitmo && typeof ritmoPlan === 'function' ? (() => { const a = ritmoPlan(state); const z = a && a.pausa; const u = z && z.platos && z.platos[0]; return z ? (z.platos && z.platos.length > 1 ? z.platos.map((x) => ritmoModulo(x.modulo, t)).join(maqEn ? ' and ' : ' y ') + ' · ' + z.dur + ' min' : u ? ritmoModulo(u.modulo, t) + ' · ' + ((u.rutina && u.rutina.min) || z.dur) + ' min' : '') : null; })() : aro ? aro.hasta : null}");

  let tb = leer('app/main/TopBar.jsx');
  tb = cambia(tb, "        {modes.map(m => (", `        {(window.__MAQ || {}).camino === 'B' && typeof ritmoPlan === 'function' && !(ritmoDe(state).libre) && ritmoPlan(state) ? (
          <div style={{ padding: '6px 18px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--ink-2)' }} data-maq-estado>{window.__maqEstado ? window.__maqEstado(state) : ''}</div>
        ) : modes.map(m => (`);

  let rp = leer('app/ritmo/RitmoPanel.jsx');
  rp = cambia(rp, `<div className="pace-rt-titulo">{t('ritmo.opcion.' + plan.m.opcion)}</div>
          <div className="pace-rt-sub pace-rt-frase"><RitmoFraseMenu plan={plan} horario={R.horario} plantilla="ritmo.frase.movil" /></div>`,
    `<div className="pace-rt-titulo">{t('ritmo.opcion.' + plan.m.opcion)}{(window.__MAQ || {}).camino === 'B' && window.__maqEstado ? <span className="pace-maq-estado-mov">{' · ' + window.__maqEstado(state).toLowerCase().replace(/^jornada /, '').replace(/^day /, '')}</span> : null}</div>
          <div className="pace-rt-sub pace-rt-frase"><RitmoFraseMenu plan={plan} horario={R.horario} plantilla="ritmo.frase.movil" /></div>`);

  let st = leer('app/i18n/strings/ritmo.js');
  st = cambia(st, "'ritmo.tarjeta.comienza':        'Comienza',", "'ritmo.tarjeta.comienza':        ((window.__MAQ || {}).camino ? 'Preparar jornada' : 'Comienza'),");
  st = cambia(st, "'ritmo.tarjeta.comienza':        'Start',", "'ritmo.tarjeta.comienza':        ((window.__MAQ || {}).camino ? 'Plan my day' : 'Start'),");

  let m = leer('app/main.jsx');
  m = cambia(m, "usePausaALaVista(state.focoPausa && state.focoPausa.id, () => setOpenBreakMenu(true));", "usePausaALaVista(state.focoPausa && state.focoPausa.id, () => { if ((window.__MAQ || {}).camino !== 'B') setOpenBreakMenu(true); });");

  return { 'app/focus/FocusTimer.jsx': f, 'app/main/TopBar.jsx': tb, 'app/ritmo/RitmoPanel.jsx': rp, 'app/i18n/strings/ritmo.js': st, 'app/main.jsx': m };
}
const CSS = `
.pace-maq-fila { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); white-space:nowrap; letter-spacing:0; text-transform:none; }
.pace-maq-despues { font-family: var(--font-display); font-style: italic; font-size: 14px; color: var(--ink-2); }
.pace-maq-enlace { font-family: var(--font-display); font-style: italic; font-size: 14px; color: var(--ink-2); text-decoration: underline; text-underline-offset: 3px; background: none; border: 0; padding: 2px 0; cursor: pointer; }
.pace-maq-minutos { height: 26px; display: flex; align-items: center; gap: 6px; font-family: var(--font-display); font-style: italic; font-size: 14px; color: var(--ink-3); }
.pace-maq-minutos u { text-underline-offset: 3px; }
.pace-maq-estado-mov { font-style: italic; font-size: .72em; color: var(--ink-3); }
@media (max-width: 768px) { [data-maq-solo-esc] { display: none; } }
html[data-maq="B"] .pace-rt-tm-pildora { background: var(--focus-cta, var(--focus)); color: var(--paper); border-color: transparent; }
`;
/* Lo que dice el estado de la jornada en B. */
const ESTADO = `window.__maqEstado = function (s) {
  var en = (document.documentElement.lang || '').indexOf('en') === 0;
  var p = ritmoPlan(s);
  if (typeof ritmoPausaCuenta === 'function' && ritmoPausaCuenta(s)) return en ? 'Break' : 'Pausa';
  if (p && p.pausa) return en ? 'Day under way' : 'Jornada en marcha';
  var empezado = (typeof paceFocoEmpezado === 'function' && paceFocoEmpezado());
  if (p && p.hechos === 0 && !empezado) return en ? 'Day ready' : 'Jornada preparada';
  return en ? 'Day under way' : 'Jornada en marcha';
};`;
module.exports = { rutas, CSS, ESTADO };
