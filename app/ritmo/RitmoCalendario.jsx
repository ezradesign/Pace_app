/* PACE · A tu ritmo · TU DÍA EN EL CALENDARIO
   ==========================================
   El enlace «Al calendario» (junto a «Cambiar» en escritorio y en el pie del
   móvil: opción A de la maqueta, elegida por Ez) y la hoja que abre, con un
   destino por fila. En Android, el calendario del móvil y el archivo; en la web,
   Google y Outlook (si PACE está dado de alta en ellos) y el archivo. Lo que hace
   cada botón vive en ritmo.calendario.destinos.js.

   EL ENLACE NO SABE DE LA HOJA: avisa con un evento de ventana y la hoja la
   monta RitmoCalendarioRaiz, una sola vez, en RitmoHome. Así el enlace puede ir
   en las dos copias del panel (escritorio y móvil) sin duplicar la hoja, y la
   hoja va por portal al body, fuera del contexto de apilado del horizonte. */

const { useState: useStateRC, useEffect: useEffectRC } = React;

function ritmoCalendarioAbrir() {
  window.dispatchEvent(new CustomEvent('pace:ritmo-calendario'));
}

function RitmoAlCalendario() {
  const { t } = useT();
  return (
    <button type="button" className="pace-rt-enlace pace-rt-fuerte" data-pace-ritmo-calendario onClick={ritmoCalendarioAbrir}>
      {t('cal.enlace')}
    </button>
  );
}

function RitmoCalendarioRaiz({ plan }) {
  const [abierta, setAbierta] = useStateRC(false);
  useEffectRC(() => {
    const abrir = () => setAbierta(true);
    window.addEventListener('pace:ritmo-calendario', abrir);
    return () => window.removeEventListener('pace:ritmo-calendario', abrir);
  }, []);
  if (!abierta || !plan) return null;
  return ReactDOM.createPortal(<RitmoCalendarioHoja plan={plan} onClose={() => setAbierta(false)} />, document.body);
}

var CAL_ERRORES = ['permiso', 'bloqueada', 'cerrada', 'denegado', 'pase', 'red', 'sin-dia'];

function ritmoCalendarioHecho(destino, r, t, tn) {
  let texto = destino === 'archivo' ? t('cal.hecho.archivo') : r.n === 1 ? t('cal.hecho.uno') : tn('cal.hecho', { n: r.n });
  if (r.reuniones != null) {
    texto += ' ' + (r.reuniones === 0 ? t('cal.hecho.reuniones.ninguna')
      : r.reuniones === 1 ? t('cal.hecho.reuniones.una') : tn('cal.hecho.reuniones', { r: r.reuniones }));
  }
  return texto;
}

function RitmoCalendarioHoja({ plan, onClose }) {
  const { t, tn, lang } = useT();
  const [state] = usePace();
  const c = ritmoDe(state).calendario || {};
  const destinos = calendarioDestinos();
  const android = destinos.indexOf('android') !== -1;
  const [reuniones, setReuniones] = useStateRC(c.reuniones !== false);
  const [calendarios, setCalendarios] = useStateRC(null);
  const [calId, setCalId] = useStateRC(c.calendarioId || '');
  const [trabajo, setTrabajo] = useStateRC(null);
  const [aviso, setAviso] = useStateRC(null);

  /* Con el permiso ya dado, la lista de calendarios del móvil sale sin preguntar. */
  useEffectRC(() => {
    if (!android) return undefined;
    let vivo = true;
    paceAndroidCalendarioTienePermiso()
      .then((ok) => (ok ? paceAndroidCalendarios() : null))
      .then((l) => { if (vivo && l) setCalendarios(l); });
    return () => { vivo = false; };
  }, [android]);

  const evs = calendarioEventos(plan.m, ritmoAhoraExacto(), t, tn, lang);
  const resumen = !evs.length ? t('cal.resumen.nada')
    : tn(evs.length === 1 ? 'cal.resumen.uno' : 'cal.resumen', { n: evs.length, a: ritmoHora(evs[0].desde), b: ritmoHora(evs[evs.length - 1].hasta) });

  /* SIN NADA DELANTE del primer paso: la ventana del permiso se abre dentro de este clic. */
  const llevar = (destino) => {
    setAviso(null);
    setTrabajo(destino);
    calendarioLlevar(destino, { reuniones: calendarioConectado(destino) && reuniones, calendarioId: calId || null, t, tn, lang })
      .then((r) => {
        setTrabajo(null);
        setAviso({ tipo: 'ok', texto: ritmoCalendarioHecho(destino, r, t, tn) });
        if (destino === 'android' && !calendarios) paceAndroidCalendarios().then((l) => { if (l) setCalendarios(l); });
      })
      .catch((e) => {
        setTrabajo(null);
        const motivo = e && CAL_ERRORES.indexOf(e.message) !== -1 ? e.message : 'red';
        setAviso({ tipo: 'error', texto: t('cal.error.' + motivo) });
      });
  };

  const boton = (destino) => {
    if (destino === 'archivo') return t(android ? 'cal.btn.compartir' : 'cal.btn.descargar');
    if (destino === 'android') return t('cal.btn.anadir');
    return t(calendarioPaseGuardado(destino) ? 'cal.btn.anadir' : 'cal.btn.conectar');
  };
  const sub = (destino) => {
    if (destino === 'archivo') return t(android ? 'cal.dest.archivo.sub.android' : 'cal.dest.archivo.sub');
    if (destino === 'android' && calendarios && calendarios.length > 1) {
      return (
        <React.Fragment>
          {t('cal.dest.android.en')}{' '}
          <select className="pace-rt-sel" id="pace-cal-calendario" data-pace-cal-calendario value={calId || calendarios[0].id}
            onChange={(e) => setCalId(e.target.value)}>
            {calendarios.map((k) => <option key={k.id} value={k.id}>{k.cuenta && k.cuenta !== k.titulo ? k.titulo + ' · ' + k.cuenta : k.titulo}</option>)}
          </select>
        </React.Fragment>
      );
    }
    return t('cal.dest.' + destino + '.sub');
  };

  const fila = (destino) => (
    <div key={destino} className="pace-rt-cal-dest" data-pace-cal-destino={destino}>
      <div style={{ minWidth: 0 }}>
        <div className="pace-rt-cal-n">{t('cal.dest.' + destino)}</div>
        <div className="pace-rt-cal-s">{sub(destino)}</div>
      </div>
      <button type="button" className={'pace-rt-cal-btn' + (destino !== 'archivo' ? ' pace-rt-lleno' : '')}
        disabled={!!trabajo || !evs.length} onClick={() => llevar(destino)}>
        {trabajo === destino ? t('cal.trabajando') : boton(destino)}
      </button>
    </div>
  );

  const conectados = destinos.filter(calendarioConectado);
  return (
    <Modal open onClose={onClose} tagLabel={t('ritmo.nombre')} title={t('cal.hoja.titulo')} maxWidth={520}>
      <div data-pace-ritmo data-pace-cal style={{ textAlign: 'left' }}>
        <div className="pace-rt-cal-resumen" data-pace-cal-resumen>{resumen}</div>
        {conectados.map(fila)}
        {conectados.length ? (
          <label className="pace-rt-cal-chk">
            <input type="checkbox" id="pace-cal-reuniones" data-pace-cal-reuniones checked={reuniones} onChange={(e) => setReuniones(e.target.checked)} />
            <span>{t('cal.reuniones')}<small>{t('cal.reuniones.sub')}</small></span>
          </label>
        ) : null}
        {fila('archivo')}
        {aviso ? <div className={'pace-rt-cal-aviso' + (aviso.tipo === 'error' ? ' pace-rt-error' : '')} role="status" data-pace-cal-aviso={aviso.tipo}>{aviso.texto}</div> : null}
        <div className="pace-rt-pie" style={{ justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={onClose}>{t('ritmo.listo')}</Button>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { RitmoAlCalendario, RitmoCalendarioRaiz, RitmoCalendarioHoja, ritmoCalendarioAbrir });
