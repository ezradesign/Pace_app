/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   RedDeError.jsx — SI UNA PARTE FALLA, SE CIERRA SOLO ESA PARTE (s198 · v0.132.0)
   ============================================================
   MEDIDO EN v0.131.0: la app no tenia ni un limite de error de React. Con un
   dato de la semana roto en caliente (como lo dejaria un fallo de codigo; el
   saneado de s198 solo actua al CARGAR) y abrir Estadisticas, React desmontaba
   la app ENTERA —0 nodos en la raiz, el papel en blanco, sin un boton—, y con
   ella el bloque que estuviera corriendo.

   DECISION DEL USUARIO (A2, mirando `docs/proposals/saneamiento-s198.html`):
   una red por superficie, y la pantalla global solo como ultimo recurso.

   `<PaceRed modo="parte|global|silencio" nombre abierto onCerrar>`:
   · `parte`   — cada dialogo y cada sesion. Si falla, pinta SU PROPIO dialogo,
                 del ancho de un aviso (560): dentro de la caja de 1240 de
                 Estadisticas un aviso se pierde. «Cerrar» llama a `onCerrar`
                 (o solo reinicia la red, si la superficie se gestiona sola) y
                 «Recargar» recarga.
   · `global`  — alrededor de toda la app. «Algo se ha torcido»: volver a
                 empezar (recargar: el saneado repara lo guardado) o descargar
                 una copia de los datos, que sale de `localStorage` y no del
                 arbol de React, que es justo lo que se ha caido.
   · `silencio`— lo que no se ve (avisos, el vigilante de secretos): si falla,
                 desaparece y la app sigue.

   LA RED SE REINICIA cuando `abierto` cambia: cerrar el aviso cierra la
   superficie, y la siguiente vez que se abra se vuelve a intentar.

   Es una CLASE porque React solo da limites de error con
   `getDerivedStateFromError`/`componentDidCatch`; no hay hook equivalente.
   ============================================================ */

class PaceRed extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reiniciar = this.reiniciar.bind(this);
    this.cerrar = this.cerrar.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error: error || new Error('error') };
  }

  componentDidCatch(error, info) {
    try {
      console.error('[PACE] una parte no ha podido dibujarse (' + (this.props.nombre || this.props.modo || 'red') + '):',
        error, info && info.componentStack ? info.componentStack.split('\n').slice(0, 4).join('\n') : '');
    } catch (e) {}
    window.paceUltimoFallo = { cuando: Date.now(), donde: this.props.nombre || this.props.modo || null,
      mensaje: String((error && error.message) || error).slice(0, 200) };
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.abierto !== this.props.abierto) this.setState({ error: null });
  }

  reiniciar() { this.setState({ error: null }); }

  cerrar() {
    if (typeof this.props.onCerrar === 'function') {
      /* Primero se cierra la superficie (su `abierto` cambia y reinicia la red);
         si no cambiara —un componente que se monta y desmonta con la vista—, el
         reinicio de abajo no hace daño: ya no se pinta nada. */
      try { this.props.onCerrar(); } catch (e) {}
    }
    this.reiniciar();
  }

  render() {
    if (!this.state.error) return this.props.children || null;
    const modo = this.props.modo || 'parte';
    if (modo === 'silencio') return null;
    /* Una superficie CERRADA que falla (Hidratate lee `state.water` aunque no se
       vea: medido) no levanta un aviso que nadie ha pedido: calla, y al abrirla
       `abierto` cambia, la red se reinicia y se vuelve a intentar. */
    if (this.props.abierto === false) return null;
    if (modo === 'global') return <PaceRedGlobal />;
    return <PaceRedParte nombre={this.props.nombre} onCerrar={this.cerrar} />;
  }
}

function PaceRedParte({ nombre, onCerrar }) {
  const { t } = useT();
  return (
    <Modal open={true} onClose={onCerrar} maxWidth={560} tagLabel={nombre || undefined} ariaLabel={t('red.parte.titulo')}>
      <div data-pace-red="parte" style={paceRedStyles.parte}>
        <h2 style={paceRedStyles.parteTitulo}>{t('red.parte.titulo')}</h2>
        <p style={paceRedStyles.texto}>{t('red.parte.texto')}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          <button type="button" onClick={onCerrar} style={paceRedStyles.lleno}>{t('red.cerrar')}</button>
          <button type="button" onClick={() => location.reload()} style={paceRedStyles.hueco}>{t('red.recargar')}</button>
        </div>
      </div>
    </Modal>
  );
}

function PaceRedGlobal() {
  const { t } = useT();
  const logo = document.getElementById('pace-logo-src');
  const movil = typeof paceEsMovil === 'function' ? paceEsMovil() : false;
  return (
    <div data-pace-red="global" role="alert" style={paceRedStyles.global}>
      <div style={paceRedStyles.columna}>
        {logo && logo.src ? <img src={logo.src} alt="PACE" style={{ width: movil ? 150 : 180, height: 'auto', marginBottom: 6 }} /> : null}
        <h1 style={{ ...paceRedStyles.globalTitulo, fontSize: movil ? 30 : 36 }}>{t('red.global.titulo')}</h1>
        <p style={{ ...paceRedStyles.texto, textAlign: 'center', maxWidth: 360 }}>{t('red.global.texto')}</p>
        <button type="button" onClick={() => location.reload()} style={paceRedStyles.cta}>{t('red.global.empezar')}</button>
        <button type="button" onClick={() => { if (typeof paceDescargarCopia === 'function') paceDescargarCopia(); }} style={paceRedStyles.enlace}>
          {t('red.global.copia')}
        </button>
        <p style={paceRedStyles.pie}>{t('red.global.pie')}</p>
      </div>
    </div>
  );
}

/* Calco de la maqueta aprobada (saneamiento-s198.html, A2 y A1). */
const paceRedStyles = {
  parte: { padding: '0 4px 6px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 },
  parteTitulo: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 30, lineHeight: 1.1, margin: 0, color: 'var(--ink)' },
  texto: { margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' },
  lleno: { padding: '10px 26px', borderRadius: 'var(--r-pill)', background: 'var(--ink)', color: 'var(--paper)', border: '1px solid var(--ink)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', cursor: 'pointer' },
  hueco: { padding: '10px 26px', borderRadius: 'var(--r-pill)', background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--line-2)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', cursor: 'pointer' },
  global: { position: 'fixed', inset: 0, zIndex: 999, background: 'var(--paper)', color: 'var(--ink)', display: 'grid', placeItems: 'center', padding: 24, overflowY: 'auto' },
  columna: { maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' },
  globalTitulo: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.1, margin: 0 },
  cta: { marginTop: 6, padding: '13px 40px', borderRadius: 'var(--r-pill)', background: 'var(--focus-cta)', border: '1px solid var(--focus-cta)', color: 'var(--paper)', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', cursor: 'pointer' },
  enlace: { background: 'transparent', border: 'none', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--ink-2)', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' },
  pie: { margin: '6px 0 0', fontSize: 11.5, color: 'var(--ink-3)', maxWidth: 320 },
};

Object.assign(window, { PaceRed, PaceRedParte, PaceRedGlobal, paceRedStyles });
