/* PACE · La miniventana: el Foco en una tira encima de todas las ventanas
   ======================================================================
   Ez, 19 nov. 2026: «tener una miniventana por encima de todas las aplicaciones con el pomodoro
   podría ser interesante». Eligió la tira (2B, 300 × 84) mirando la propuesta
   (docs/proposals/aviso-foco-pc-19nov/). Es Document Picture-in-Picture: Chrome y Edge de
   escritorio, y Firefox desde la 151. Safari y los móviles no la tienen: allí no hay nada que abrir.

   Una sola por pestaña, y la pinta un React propio dentro de la ventana con lo último que le pasó
   el aro (`_paceMini.props`). Se repinta con el reloj DE LA MINIVENTANA (`win.setInterval`): la
   pestaña de PACE está detrás y Chrome frena sus temporizadores a uno por minuto, pero la
   miniventana se ve y los suyos no se frenan. Lo que dice sale de `endsAt`, como el aro.
   «Pausar» y «Continuar» llaman a lo mismo que el botón del aro, así que mandan sobre el Foco de
   la pestaña (y sobre las demás pestañas, por el mismo camino). Al acabar un Foco se pone en
   terracota. El navegador solo deja abrirla con un toque: `paceMiniAbrir()` va siempre en un clic.

   Se cierra sola si se cierra o recarga la pestaña. Si el aro se desmonta, se cierra con él.

   SE ABRE SOLA AL PULSAR «EMPEZAR» (Ez, «A: recuerda el cierre», 20 nov. 2026): `paceMiniAlEmpezar` va
   dentro del toque que empieza un bloque de Foco (no al reanudar), y solo si el toque es de verdad
   (`navigator.userActivation`): el Foco que vuelve al recargar, el de otra pestaña o el que arranca
   solo no la abren. Si la persona la cierra con el Foco en marcha, PACE lo apunta (`miniSolaNo`) y deja
   de abrirla sola; abrirla a mano con «Miniventana» lo deshace. Que la cierre PACE (el aro se va) o
   que se vaya con la pestaña no cuenta (`cerrandoYo`).

   EN LA JORNADA DE «A TU RITMO» (Ez, 2A del 21 nov. 2026; auditoría de la 0.212.0, hallazgo 3): habla
   como el aro («Foco · Bloque 1 de 8», `ciclo` es la etiqueta del aro). Al acabar el bloque sin mirar
   PACE, el aro pasa solo a contar la pausa, pero la tira dice «Foco terminado» con «Volver» mientras la
   pestaña diga «terminado» (`paceTabFinEs`, FocusTimer.titulo.jsx), hasta que vuelves. Y en la pausa
   de la jornada (`ritmo`) enseña la cuenta sin botón: su «Pausar» no pausaba, porque el aro la vuelve
   a poner en marcha desde su hora guardada. */

const { useEffect: useEffectMini, useState: useStateMini } = React;

const PACE_MINI_TAM = { width: 300, height: 84 };
let _paceMini = { win: null, root: null, props: null, cerrandoYo: false };

function paceMiniPuede() {
  try { return 'documentPictureInPicture' in window && window.top === window; } catch (e) { return false; }
}
function paceMiniAbierta() { return !!_paceMini.win; }
function paceMiniAvisar() { try { window.dispatchEvent(new CustomEvent('pace:mini')); } catch (e) {} }
function paceMiniPintar() {
  if (!_paceMini.root || !_paceMini.props) return;
  try { _paceMini.root.render(<MiniTira {..._paceMini.props} />); } catch (e) {}
}
function paceMiniCerrar() {
  const w = _paceMini.win;
  if (w) { _paceMini.cerrandoYo = true; try { w.close(); } catch (e) {} }
}
/* Si se va la pestaña, la miniventana se va con ella: tampoco la cerró la persona. */
window.addEventListener('pagehide', () => { _paceMini.cerrandoYo = true; });
function paceMiniApuntar(patch) {
  try { if (typeof setState === 'function') setState(patch); } catch (e) {}
}
/* Al empezar un bloque de Foco, dentro del toque. */
function paceMiniAlEmpezar(estado) {
  try {
    if (!estado || estado.miniSolaNo || !paceMiniPuede() || _paceMini.win) return;
    const ua = navigator.userActivation;
    if (ua && !ua.isActive) return;
    paceMiniAbrir({ sola: true });
  } catch (e) {}
}

/* La ventana lleva las hojas de estilo y los atributos del documento (paleta, letra, idioma): así
   la tira usa los mismos tokens que la app, en crema o en oscuro. */
function paceMiniVestir(w) {
  const d = w.document;
  const base = d.createElement('base');
  base.href = document.baseURI;
  d.head.appendChild(base);
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((nodo) => {
    try { d.head.appendChild(nodo.cloneNode(true)); } catch (e) {}
  });
  Array.prototype.forEach.call(document.documentElement.attributes, (atr) => {
    try { d.documentElement.setAttribute(atr.name, atr.value); } catch (e) {}
  });
  d.title = 'PACE';
  d.documentElement.style.height = '100%';
  d.body.style.cssText = 'margin:0;height:100%;overflow:hidden;background:var(--paper);';
}

function paceMiniAbrir(op) {
  if (!paceMiniPuede()) return Promise.resolve(null);
  /* A mano («Miniventana», que pasa su evento): vuelve a abrirse sola en adelante. */
  const sola = !!(op && op.sola === true);
  if (!sola && getState().miniSolaNo) paceMiniApuntar({ miniSolaNo: false });
  if (_paceMini.win) { try { _paceMini.win.focus(); } catch (e) {} return Promise.resolve(_paceMini.win); }
  return Promise.resolve(window.documentPictureInPicture.requestWindow(PACE_MINI_TAM)).then((w) => {
    paceMiniVestir(w);
    const cont = w.document.createElement('div');
    cont.style.height = '100%';
    w.document.body.appendChild(cont);
    _paceMini.win = w;
    _paceMini.root = ReactDOM.createRoot(cont);
    const tic = w.setInterval(paceMiniPintar, 1000);
    w.addEventListener('pagehide', () => {
      const p = _paceMini.props;
      if (!_paceMini.cerrandoYo && p && p.modo === 'foco' && (p.status === 'running' || p.status === 'paused')) paceMiniApuntar({ miniSolaNo: true });
      try { w.clearInterval(tic); } catch (e) {}
      try { _paceMini.root && _paceMini.root.unmount(); } catch (e) {}
      _paceMini = { win: null, root: null, props: _paceMini.props, cerrandoYo: false };
      paceMiniAvisar();
    });
    paceMiniPintar();
    paceMiniAvisar();
    return w;
  }).catch(() => null);
}

/* Lo que queda, en segundos, como lo cuenta el aro. */
function paceMiniQueda(p) {
  if (p.status === 'running' && p.endsAt) return Math.max(0, Math.ceil((p.endsAt - Date.now()) / 1000));
  if (p.status === 'paused' && p.restanteMs != null) return Math.ceil(p.restanteMs / 1000);
  if (p.status === 'completed') return 0;
  return p.total;
}

const miniTiraStyles = {
  caja: { position: 'relative', height: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12,
    padding: '0 14px', fontFamily: 'var(--font-ui)', color: 'var(--ink)', background: 'var(--paper)', overflow: 'hidden' },
  cajaFin: { background: 'var(--breathe-soft)' },
  txt: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 },
  hora: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 30, lineHeight: 1,
    fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' },
  horaFin: { fontSize: 22, color: 'var(--breathe-deep)' },
  sub: { fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  boton: { flexShrink: 0, border: '1px solid var(--line)', background: 'var(--paper-2)', color: 'var(--ink-2)',
    borderRadius: 999, padding: '5px 12px', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'pointer' },
  botonFin: { background: 'var(--breathe-deep)', borderColor: 'var(--breathe-deep)', color: 'var(--paper)' },
  linea: { position: 'absolute', left: 0, bottom: 0, height: 3, background: 'var(--focus)' },
};

function MiniTira(p) {
  const { t } = p;
  const fin = (p.status === 'completed' && p.modo === 'foco') || (typeof paceTabFinEs === 'function' && paceTabFinEs());
  const queda = paceMiniQueda(p);
  const hecho = fin ? 1 : p.total > 0 ? Math.min(1, Math.max(0, 1 - queda / p.total)) : 0;
  const dos = (n) => (n < 10 ? '0' : '') + n;
  const color = fin ? 'var(--breathe)' : 'var(--focus)';
  const r = 18.5, vuelta = 2 * Math.PI * r;
  const etiqueta = p.modo === 'foco' ? t('focus.mode.focus') : p.modo === 'pausa' ? t('focus.mode.pause') : t('focus.mode.long');
  /* ENTRE DOS BLOQUES DE LA JORNADA (Ez, 3A del 22 nov. 2026): acabada la pausa, la tira se quedaba en «45:00 ·
     Foco · Bloque 2 de 9», quieta y sin botón, como un Foco en pausa. Ahora dice «Pausa terminada · Vuelve a PACE
     para el bloque 2» con «Volver», como «Foco terminado» por libre. Pasado el rato de «Pausa terminada»
     (`aroPausaTerminada`), el rótulo es el del aro: «Bloque 2 de 9». */
  const espera = !fin && p.espera ? p.espera : null;
  let boton = null;
  if (fin || espera) boton =<button type="button" style={{ ...miniTiraStyles.boton, ...miniTiraStyles.botonFin }} onClick={() => { try { window.focus(); } catch (e) {} }}>{t('mini.volver')}</button>;
  else if (p.ritmo) boton = null;
  else if (p.status === 'running') boton = <button type="button" style={miniTiraStyles.boton} onClick={p.onPausar}>{t('focus.pause')}</button>;
  else if (p.status === 'paused') boton = <button type="button" style={miniTiraStyles.boton} onClick={p.onSeguir}>{t('focus.continue')}</button>;
  return (
    <div data-pace-mini data-fin={fin ? '' : undefined} style={fin ? { ...miniTiraStyles.caja, ...miniTiraStyles.cajaFin } : miniTiraStyles.caja}>
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r={r} fill="none" stroke="var(--line)" strokeWidth="1.5" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={(vuelta * hecho).toFixed(1) + ' ' + vuelta.toFixed(1)} transform="rotate(-90 20 20)" />
      </svg>
      <div style={miniTiraStyles.txt}>
        <span style={fin || espera ? { ...miniTiraStyles.hora, ...miniTiraStyles.horaFin } : miniTiraStyles.hora}>
          {fin ? t('mini.fin') : espera ? espera.titulo : dos(Math.floor(queda / 60)) + ':' + dos(queda % 60)}
        </span>
        <span style={miniTiraStyles.sub}>{fin ? t('mini.fin.sub') : espera ? t('mini.espera.sub').replace('{n}', espera.n) : etiqueta + (p.modo === 'foco' && p.ciclo ? ' · ' + p.ciclo : '')}</span>
      </div>
      {boton}
      <span style={{ ...miniTiraStyles.linea, width: (hecho * 100).toFixed(1) + '%', background: color }} />
    </div>
  );
}

/* El aro le pasa a la miniventana lo que ve, en cada pintado, y la cierra al desmontarse. */
function useMiniventana(props) {
  const [abierta, setAbierta] = useStateMini(paceMiniAbierta);
  _paceMini.props = props;
  useEffectMini(() => { paceMiniPintar(); });
  useEffectMini(() => {
    const oye = () => setAbierta(paceMiniAbierta());
    window.addEventListener('pace:mini', oye);
    window.addEventListener('pace:pestana-fin', paceMiniPintar);   // «terminado» se enciende o se apaga
    return () => { window.removeEventListener('pace:mini', oye); window.removeEventListener('pace:pestana-fin', paceMiniPintar); paceMiniCerrar(); };
  }, []);
  return { puede: paceMiniPuede(), abierta };
}

Object.assign(window, { useMiniventana, paceMiniAbrir, paceMiniAlEmpezar, paceMiniPuede, MiniTira });
