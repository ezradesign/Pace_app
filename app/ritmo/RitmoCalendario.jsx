/* PACE · A tu ritmo · TU DÍA EN EL CALENDARIO
   ==========================================
   El enlace «Al calendario» (junto a «Cambiar» en escritorio; en el móvil, en el
   pie de la hoja de «Ver todo»: el día servido ya no tiene pie para que la home
   no pida scroll) y la hoja que abre, con un
   destino por fila. En Android, el calendario del móvil y el archivo; en la web,
   Google y Outlook (si PACE está dado de alta en ellos) y el archivo. Lo que hace
   cada botón vive en ritmo.calendario.destinos.js.

   EL ENLACE NO SABE DE LA HOJA: avisa con un evento de ventana y la hoja la
   monta RitmoCalendarioRaiz, una sola vez, en RitmoHome. Así el enlace puede ir
   en las dos copias del panel (escritorio y móvil) sin duplicar la hoja, y la
   hoja va por portal al body, fuera del contexto de apilado del horizonte.

   EL CALENDARIO QUE SE MANTIENE SOLO (Ez, 14 oct. 2026, mirando las fotos de la
   propuesta): la casilla «Mantenerlo al día solo», marcada de entrada, bajo la
   de las reuniones (con el candado de PACE completo si no hay derecho). Ya
   conectado, la hoja enseña solo ese destino, con cómo va y «Desconectar»; los
   otros dos se esconden para no escribir el día en dos calendarios y avisar dos
   veces. Sin permiso vivo y con el día cambiado, «Poner al día». El enlace dice
   «Calendario al día» o «Poner al día». El motor (ritmo.calendario.motor.js)
   avisa con `pace:calendario-solo` cuando algo de eso cambia. */

const { useState: useStateRC, useEffect: useEffectRC } = React;

function ritmoCalendarioAbrir() {
  window.dispatchEvent(new CustomEvent('pace:ritmo-calendario'));
}

/* El estado del calendario que se mantiene solo, repintado cuando el motor avisa. */
function useCalendarioSolo() {
  const [, setVuelta] = useStateRC(0);
  useEffectRC(() => {
    const otra = () => setVuelta((n) => n + 1);
    window.addEventListener('pace:calendario-solo', otra);
    return () => window.removeEventListener('pace:calendario-solo', otra);
  }, []);
  return typeof calendarioSoloEstado === 'function' ? calendarioSoloEstado() : null;
}

function calendarioSoloPorDetras(solo) {
  return !!(solo && solo.pendiente && !solo.conAcceso);
}

/* `antes`: lo que se hace antes de abrir la hoja (la de «Ver todo» se cierra, para no apilar dos). */
function RitmoAlCalendario({ antes }) {
  const { t } = useT();
  const solo = useCalendarioSolo();
  const texto = !solo ? t('cal.enlace') : calendarioSoloPorDetras(solo) ? t('cal.enlace.poner') : t('cal.enlace.aldia');
  return (
    <button type="button" className="pace-rt-enlace pace-rt-fuerte" data-pace-ritmo-calendario
      data-pace-cal-estado={!solo ? 'no' : calendarioSoloPorDetras(solo) ? 'poner' : 'aldia'}
      onClick={() => { if (antes) antes(); ritmoCalendarioAbrir(); }}>
      {texto}
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
  let texto = destino === 'archivo' ? t('cal.hecho.archivo') : r.solo ? t('cal.hecho.solo') : r.n === 1 ? t('cal.hecho.uno') : tn('cal.hecho', { n: r.n });
  if (r.reuniones != null) {
    texto += ' ' + (r.reuniones === 0 ? t('cal.hecho.reuniones.ninguna')
      : r.reuniones === 1 ? t('cal.hecho.reuniones.una') : tn('cal.hecho.reuniones', { r: r.reuniones }));
  }
  return texto;
}

/* La hora (y si es mañana) de un instante en ms. */
function ritmoCalendarioHoraMs(ms) {
  const d = new Date(ms);
  return ritmoHora(d.getHours() * 60 + d.getMinutes());
}

/* Cómo va el destino que se mantiene solo, bajo su nombre. */
function ritmoCalendarioSoloSub(solo, t, tn) {
  if (solo.trabajando) return t('cal.solo.trabajando');
  if (calendarioSoloPorDetras(solo)) return solo.alDia ? tn('cal.solo.atrasado', { h: ritmoCalendarioHoraMs(solo.alDia) }) : t('cal.solo.atrasado.sin');
  if (solo.destino === 'android' || !solo.hasta) return solo.alDia ? tn('cal.solo.ultimo', { h: ritmoCalendarioHoraMs(solo.alDia) }) : t('cal.solo.trabajando');
  const manana = new Date(solo.hasta).toDateString() !== new Date().toDateString();
  return tn(manana ? 'cal.solo.hasta.manana' : 'cal.solo.hasta', { h: ritmoCalendarioHoraMs(solo.hasta) });
}

function RitmoCalendarioHoja({ plan, onClose }) {
  const { t, tn, lang } = useT();
  const [state] = usePace();
  const c = ritmoDe(state).calendario || {};
  const solo = useCalendarioSolo();
  const destinos = calendarioDestinos();
  const android = destinos.indexOf('android') !== -1;
  /* En las apps el archivo no se descarga: sale por el menú de compartir. */
  const compartir = typeof paceEsNativo === 'function' && paceEsNativo();
  const puede = typeof puedeMantenerCalendario !== 'function' || puedeMantenerCalendario();
  const [reuniones, setReuniones] = useStateRC(c.reuniones !== false);
  const [mantener, setMantener] = useStateRC(c.mantener !== false);
  const [calendarios, setCalendarios] = useStateRC(null);
  const [calId, setCalId] = useStateRC(c.calendarioId || '');
  const [trabajo, setTrabajo] = useStateRC(null);
  const [aviso, setAviso] = useStateRC(null);
  const [preguntar, setPreguntar] = useStateRC(false);

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
  let resumen = !evs.length ? t('cal.resumen.nada')
    : tn(evs.length === 1 ? 'cal.resumen.uno' : 'cal.resumen', { n: evs.length, a: ritmoHora(evs[0].desde), b: ritmoHora(evs[evs.length - 1].hasta) });
  if (solo) {
    const q = solo.quedan;
    resumen = calendarioSoloPorDetras(solo)
      ? (solo.alDia ? tn('cal.solo.resumen.pendiente', { h: ritmoCalendarioHoraMs(solo.alDia) }) : t('cal.solo.resumen.pendiente.sin'))
      : q.length ? tn('cal.solo.resumen', { a: ritmoHora(q[0].desde), b: ritmoHora(q[q.length - 1].hasta) }) : t('cal.solo.resumen.nada');
  }

  const fallo = (e) => {
    setTrabajo(null);
    const motivo = e && CAL_ERRORES.indexOf(e.message) !== -1 ? e.message : 'red';
    setAviso({ tipo: 'error', texto: t('cal.error.' + motivo) });
  };

  /* SIN NADA DELANTE del primer paso: la ventana del permiso se abre dentro de este clic. */
  const llevar = (destino) => {
    setAviso(null);
    setTrabajo(destino);
    const conectado = calendarioConectado(destino);
    calendarioLlevar(destino, { reuniones: conectado && reuniones, mantener: conectado && puede && mantener, calendarioId: calId || null, t, tn, lang })
      .then((r) => {
        setTrabajo(null);
        setAviso({ tipo: 'ok', texto: ritmoCalendarioHecho(destino, r, t, tn) });
        if (destino === 'android' && !calendarios) paceAndroidCalendarios().then((l) => { if (l) setCalendarios(l); });
      })
      .catch(fallo);
  };

  const ponerAlDia = () => {
    setAviso(null);
    setTrabajo('poner');
    calendarioSoloPonerAlDia()
      .then(() => { setTrabajo(null); setAviso({ tipo: 'ok', texto: t('cal.puesto') }); })
      .catch(fallo);
  };

  const desconectar = (quitar) => {
    setAviso(null);
    setTrabajo('desconectar');
    calendarioSoloDesconectar(quitar)
      .then(() => { setTrabajo(null); setPreguntar(false); setAviso({ tipo: 'ok', texto: t(quitar ? 'cal.desc.quitado' : 'cal.desc.dejado') }); })
      .catch((e) => { setPreguntar(false); fallo(e); });
  };

  /* En el calendario que se mantiene solo, las reuniones se guardan al momento:
     no hay otro «Añadir» que las lleve. */
  const cambiarReuniones = (si) => {
    setReuniones(si);
    if (solo && typeof calendarioGuardarAjustes === 'function') calendarioGuardarAjustes({ reuniones: si });
  };

  const boton = (destino) => {
    if (destino === 'archivo') return t(compartir ? 'cal.btn.compartir' : 'cal.btn.descargar');
    if (destino === 'android') return t('cal.btn.anadir');
    return t(calendarioPaseGuardado(destino) ? 'cal.btn.anadir' : 'cal.btn.conectar');
  };
  const sub = (destino) => {
    if (solo && destino === solo.destino) return ritmoCalendarioSoloSub(solo, t, tn);
    if (destino === 'archivo') return t(compartir ? 'cal.dest.archivo.sub.app' : 'cal.dest.archivo.sub');
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

  const accion = (destino) => {
    if (solo && destino === solo.destino) {
      return calendarioSoloPorDetras(solo)
        ? <button type="button" className="pace-rt-cal-btn pace-rt-lleno" data-pace-cal-poner disabled={!!trabajo} onClick={ponerAlDia}>
            {trabajo === 'poner' ? t('cal.trabajando') : t('cal.btn.poner')}
          </button>
        : <button type="button" className="pace-rt-cal-btn" data-pace-cal-desconectar disabled={!!trabajo || preguntar}
            onClick={() => { setAviso(null); setPreguntar(true); }}>{t('cal.btn.desconectar')}</button>;
    }
    return (
      <button type="button" className={'pace-rt-cal-btn' + (destino !== 'archivo' ? ' pace-rt-lleno' : '')}
        disabled={!!trabajo || !evs.length} onClick={() => llevar(destino)}>
        {trabajo === destino ? t('cal.trabajando') : boton(destino)}
      </button>
    );
  };

  const fila = (destino) => (
    <div key={destino} className="pace-rt-cal-dest" data-pace-cal-destino={destino} data-pace-cal-solo={solo && destino === solo.destino ? 'si' : undefined}>
      <div style={{ minWidth: 0 }}>
        <div className="pace-rt-cal-n">{t('cal.dest.' + destino)}</div>
        <div className="pace-rt-cal-s">{sub(destino)}</div>
      </div>
      {accion(destino)}
    </div>
  );

  const conectados = destinos.filter(calendarioConectado).filter((d) => !solo || d === solo.destino);
  const casillaMantener = !conectados.length || solo ? null : puede ? (
    <label className="pace-rt-cal-chk">
      <input type="checkbox" id="pace-cal-mantener" data-pace-cal-mantener checked={mantener} onChange={(e) => setMantener(e.target.checked)} />
      <span>{t('cal.mantener')}<small>{t('cal.mantener.sub')}</small></span>
    </label>
  ) : (
    /* Cerrada: un botón que abre la invitación, con la casilla dibujada vacía. */
    <button type="button" className="pace-rt-cal-chk pace-rt-cerrado" data-pace-cal-mantener-cerrado
      onClick={() => paceAbrirPremium({ nombre: t('cal.mantener') })}>
      <span className="pace-rt-cal-caja" aria-hidden="true" />
      <span><PaceCandado size={11} />{t('cal.mantener')}<small>{t('cal.mantener.cerrado')}</small></span>
    </button>
  );

  let nota = null;
  if (preguntar && solo) {
    nota = (
      <div className="pace-rt-cal-aviso" role="status" data-pace-cal-aviso="pregunta">
        {t('cal.desc.pregunta')}
        <div className="pace-rt-cal-dos">
          <button type="button" className="pace-rt-cal-btn pace-rt-lleno" data-pace-cal-quitar disabled={!!trabajo} onClick={() => desconectar(true)}>{t('cal.desc.quitar')}</button>
          <button type="button" className="pace-rt-cal-btn" data-pace-cal-dejar disabled={!!trabajo} onClick={() => desconectar(false)}>{t('cal.desc.dejar')}</button>
        </div>
      </div>
    );
  } else if (aviso) {
    nota = <div className={'pace-rt-cal-aviso' + (aviso.tipo === 'error' ? ' pace-rt-error' : '')} role="status" data-pace-cal-aviso={aviso.tipo}>{aviso.texto}</div>;
  } else if (calendarioSoloPorDetras(solo)) {
    nota = (
      <div className="pace-rt-cal-aviso" role="status" data-pace-cal-aviso="nota">
        {t('cal.solo.nota.' + solo.destino)}
        <button type="button" className="pace-rt-enlace" data-pace-cal-desconectar onClick={() => setPreguntar(true)}>{t('cal.btn.desconectar')}</button>
      </div>
    );
  }

  return (
    <Modal open onClose={onClose} tagLabel={t('ritmo.nombre')} title={t('cal.hoja.titulo')} maxWidth={520}>
      <div data-pace-ritmo data-pace-cal style={{ textAlign: 'left' }}>
        <div className="pace-rt-cal-resumen" data-pace-cal-resumen>{resumen}</div>
        {conectados.map(fila)}
        {conectados.length ? (
          <label className="pace-rt-cal-chk">
            <input type="checkbox" id="pace-cal-reuniones" data-pace-cal-reuniones checked={reuniones} onChange={(e) => cambiarReuniones(e.target.checked)} />
            <span>{t('cal.reuniones')}<small>{t('cal.reuniones.sub')}</small></span>
          </label>
        ) : null}
        {casillaMantener}
        {fila('archivo')}
        {nota}
        <div className="pace-rt-pie" style={{ justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={onClose}>{t('ritmo.listo')}</Button>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { RitmoAlCalendario, RitmoCalendarioRaiz, RitmoCalendarioHoja, ritmoCalendarioAbrir });
