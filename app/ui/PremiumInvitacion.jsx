/* PACE · PremiumInvitacion.jsx — LA INVITACIÓN A PACE COMPLETO
   ============================================================
   Elegida por Ez mirando la maqueta (8 oct. 2026): al tocar algo cerrado se abre
   una hoja que dice qué es, qué trae PACE completo y cómo se abre, con una salida
   igual de visible. Nada salta solo: solo se abre con un gesto. Sin cuenta atrás
   ni «oferta» (MONETIZATION.md, «Qué NO hacemos»).

   SE ABRE con `paceAbrirPremium({ nombre, modo })`, que lanza `pace:open-premium`:
   `nombre` es lo que se tocó (una rutina, «Tus rutinas») y `modo: 'codigo'` la
   abre ya con el campo del código (lo usa la fila de Ajustes).

   LA COMPRA (Ez, 3A del 28 oct. 2026): con la tienda del canal lista
   (`paceTiendaAbierta`: en la web, los dos enlaces de pago de Stripe; en Android,
   Play Billing), la hoja acaba como la última pantalla de la bienvenida: los dos
   precios de la tienda en una frase (nunca escritos en las traducciones),
   «Probar 7 días gratis» y «Ahora no» del mismo tamaño, el aviso de antes de
   cobrar y «Prefiero pagarlo una vez». Hasta entonces dice «Llega con la versión 1».

   EN ANDROID NO HAY «Tengo un código»: Google Play no deja desbloquear con
   códigos propios (state-licencia.js). Allí la hoja solo informa. Donde hay
   código, debajo del campo va «¿Lo has perdido?», que abre pacegrass.app/recuperar
   (Ez, 2A del 28 oct.): la app no se conecta para buscarlo.

   El candado de las tarjetas (`PaceCandado`) vive aquí porque es la misma
   promesa: lo que lo lleva, al tocarlo, abre esta hoja.

   EL AVISO DEL FIN DE LA PRUEBA (Ez, 2A del 26 oct. 2026) es la única vez que esta
   hoja se abre sola, porque lo prometido en /premium es avisar antes de cobrar: dos
   días antes de `trialEnd` (el código del alta de la mensual), una vez por
   suscripción (`premiumAvisoPrueba`), al abrir PACE y nunca con una sesión delante.
   Sin lista de ventajas: no intenta retener. «Gestionar la suscripción» sale solo
   si la tienda tiene dónde (en la web, el portal de Stripe).

   LA HOJA DEL DÍA DE v1 (Ez, 1A del 28 oct. 2026) es la otra que se abre sola: a
   quien ya usaba PACE, una vez, al abrir PACE ese día y sin nada delante
   (`pacePasoV1PorAvisar`, state-paso-v1.js). Cuenta sus siete días con la fecha,
   las rutinas de pago que se le quedan con su módulo y que lo gratis sigue
   gratis, con un solo «Entendido»: no vende nada. */
const PREMIUM_AVISO_ANTES = 2 * 24 * 3600 * 1000;
/* Las que se le quedan, en la hoja: hasta seis; con más, cinco y «Y n más». */
const PREMIUM_PASOV1_LISTA = 6;

function premiumPruebaPorAvisar() {
  const d = window.paceLicenciaVigente ? window.paceLicenciaVigente() : null;
  if (!d || d.type !== 'monthly' || typeof d.trialEnd !== 'number' || typeof d.order !== 'string') return null;
  const ahora = Date.now();
  if (ahora < d.trialEnd - PREMIUM_AVISO_ANTES || ahora >= d.trialEnd) return null;
  const s = typeof getState === 'function' ? getState() : null;
  if (!s || s.premiumAvisoPrueba === d.order) return null;
  if (document.querySelector('[data-pace-session-root]')) return null;
  return d;
}

const { useState: useStatePI, useEffect: useEffectPI, useRef: useRefPI } = React;

/* `abierto`: el arco no baja a la derecha. Lo usa el aviso de un código que vale. */
function PaceCandado({ size = 11, abierto = false }) {
  return (
    <svg width={size} height={Math.round(size * 13 / 11)} viewBox="0 0 11 13" aria-hidden="true" focusable="false"
      data-pace-candado style={{ verticalAlign: '-1px', marginRight: 4, flex: 'none' }}>
      <rect x="1" y="5.5" width="9" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d={abierto ? 'M3 5.5V4a2.5 2.5 0 0 1 5 0' : 'M3 5.5V4a2.5 2.5 0 0 1 5 0v1.5'} fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function paceAbrirPremium(detalle) {
  try { window.dispatchEvent(new CustomEvent('pace:open-premium', { detail: detalle || {} })); } catch (e) {}
}

const PREMIUM_INCLUYE = ['routines', 'custom', 'letter', 'stats'];

function PremiumInvitacion() {
  const { t, tn, lang } = useT();
  const [abierta, setAbierta] = useStatePI(null); // null | { nombre, modo }
  const [modo, setModo] = useStatePI('invita');   // invita · codigo · ok · prueba · pasov1
  const [texto, setTexto] = useStatePI('');
  const [error, setError] = useStatePI(null);
  const [comprobando, setComprobando] = useStatePI(false);
  const [tester, setTester] = useStatePI(false);
  const [mensual, setMensual] = useStatePI(false);
  const campoRef = useRefPI(null);
  const abiertaRef = useRefPI(null);
  abiertaRef.current = abierta;

  /* Al abrir PACE (tras comprobar la firma del código), cada minuto y cuando acaba el paso a
     v1 (que espera al registro y puede tardar): ¿toca uno de los dos avisos? */
  useEffectPI(() => {
    let vivo = true, empezado = false;
    const mirar = () => {
      if (!vivo || abiertaRef.current) return;
      const d = premiumPruebaPorAvisar();
      if (d) {
        setState({ premiumAvisoPrueba: d.order });
        setAbierta({ nombre: null, prueba: d });
        setModo('prueba');
        return;
      }
      /* Sin otro diálogo delante: si lo hay, se mira otra vez al minuto. */
      const v1 = window.pacePasoV1PorAvisar ? window.pacePasoV1PorAvisar() : null;
      if (!v1 || document.querySelector('[role="dialog"]')) return;
      window.pacePasoV1Avisado();
      setAbierta({ nombre: null, pasoV1: v1 });
      setModo('pasov1');
    };
    const primero = setTimeout(() => { empezado = true; mirar(); }, 1500);
    const cada = setInterval(mirar, 60 * 1000);
    if (window.pacePasoV1) Promise.resolve(window.pacePasoV1()).then(() => { if (empezado) mirar(); }, () => {});
    return () => { vivo = false; clearTimeout(primero); clearInterval(cada); };
  }, []);

  useEffectPI(() => {
    const abrir = (e) => {
      const d = (e && e.detail) || {};
      const conCodigo = d.modo === 'codigo' && window.paceLicenciaPermitida && window.paceLicenciaPermitida();
      setAbierta({ nombre: d.nombre || null });
      setModo(conCodigo ? 'codigo' : 'invita');
      setTexto(''); setError(null); setComprobando(false);
    };
    window.addEventListener('pace:open-premium', abrir);
    return () => window.removeEventListener('pace:open-premium', abrir);
  }, []);

  useEffectPI(() => {
    if (modo === 'codigo' && campoRef.current) campoRef.current.focus();
  }, [modo]);

  /* Lo que no está abierto no lee nada más (CLAUDE.md, trampas conocidas). */
  if (!abierta) return null;

  const cerrar = () => setAbierta(null);
  const permitida = !!(window.paceLicenciaPermitida && window.paceLicenciaPermitida());

  const hecho = (datos) => {
    setTester(!!(datos && datos.tester != null));
    setMensual(!!(datos && window.paceLicenciaEsMensual && window.paceLicenciaEsMensual(datos)));
    setModo('ok');
  };

  const canjear = () => {
    if (comprobando || !texto.trim() || !window.paceLicenciaCanjear) return;
    setComprobando(true); setError(null);
    window.paceLicenciaCanjear(texto).then((r) => {
      setComprobando(false);
      if (r.ok) hecho(r.datos);
      else setError(r.motivo || 'formato');
    });
  };

  /* La compra de la web sigue en la página de Stripe y el código vuelve por la de gracias: la
     hoja se cierra. La que da un código aquí mismo (Play) acaba como un canje. */
  const comprar = (plan) => {
    if (comprobando || typeof paceComprar !== 'function') return;
    setComprobando(true); setError(null);
    paceComprar(plan).then((r) => {
      setComprobando(false);
      if (r && r.ok && r.fuera) cerrar();
      else if (r && r.ok) hecho(r.datos);
      else if (r && r.motivo === 'error') setError('compra');
    });
  };

  if (modo === 'prueba') return <PremiumAvisoPrueba datos={abierta.prueba} cerrar={cerrar} />;
  if (modo === 'pasov1') return <PremiumPasoV1 datos={abierta.pasoV1} cerrar={cerrar} />;

  const titulo = modo === 'ok' ? t(mensual ? 'premium.ok.title.monthly' : 'premium.ok.title') : (abierta.nombre || t('premium.name'));
  const tienda = modo === 'invita' && !!(window.paceTiendaAbierta && window.paceTiendaAbierta());
  const planes = tienda ? paceTiendaPlanes(lang) : [];
  const mes = planes.find((p) => p.plan === 'mes') || null;
  const vida = planes.find((p) => p.plan === 'vida') || null;
  const dias = (mes && mes.pruebaDias) || 7;
  const tengo = permitida && (
    <button type="button" data-pace-premium-tengo onClick={() => setModo('codigo')}
      style={{ ...premiumInvitacionStyles.enlace, ...(tienda ? { marginTop: 6 } : null) }}>
      {t('premium.code.have')}
    </button>
  );

  return (
    <Modal open onClose={cerrar} maxWidth={440} ariaLabel={titulo}>
      <div data-pace-premium-hoja={modo}>
        {modo !== 'ok' && <PremiumSeal />}
        <h2 style={premiumInvitacionStyles.titulo}>{titulo}</h2>

        {modo === 'ok' ? (
          <React.Fragment>
            <p style={premiumInvitacionStyles.sub}>{t(tester ? 'premium.ok.tester' : 'premium.ok.other')}</p>
            <Button onClick={cerrar} style={premiumInvitacionStyles.ancho}>{t('premium.ok.continue')}</Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p style={premiumInvitacionStyles.sub}>{t('premium.part')}</p>
            <ul style={premiumInvitacionStyles.lista}>
              {PREMIUM_INCLUYE.map((k) => (
                <li key={k} style={premiumInvitacionStyles.item}>
                  <span>{t('premium.inc.' + k)}</span>
                  <span style={premiumInvitacionStyles.detalle}>{t('premium.inc.' + k + '.d')}</span>
                </li>
              ))}
            </ul>

            {modo === 'codigo' ? (
              <form onSubmit={(e) => { e.preventDefault(); canjear(); }}>
                <label htmlFor="pace-premium-codigo" style={premiumInvitacionStyles.etiqueta}>{t('premium.code.label')}</label>
                <input
                  id="pace-premium-codigo" ref={campoRef} data-pace-premium-codigo
                  value={texto} onChange={(e) => { setTexto(e.target.value); setError(null); }}
                  placeholder={t('premium.code.placeholder')}
                  autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                  style={premiumInvitacionStyles.campo}
                />
                {error && (
                  <p role="alert" data-pace-premium-error={error} style={premiumInvitacionStyles.error}>
                    {t('premium.err.' + error) === 'premium.err.' + error ? t('premium.err.title') : t('premium.err.' + error)}
                  </p>
                )}
                <Button type="submit" disabled={comprobando || !texto.trim()} style={premiumInvitacionStyles.ancho}>
                  {t(comprobando ? 'premium.code.checking' : 'premium.code.redeem')}
                </Button>
                <Button variant="secondary" onClick={cerrar} style={{ ...premiumInvitacionStyles.ancho, marginTop: 8 }}>{t('premium.later')}</Button>
                <a href={premiumEnlaceRecuperar()} target="_blank" rel="noopener" data-pace-premium-recuperar style={premiumInvitacionStyles.enlaceA}>
                  {t('premium.code.lost')}
                </a>
              </form>
            ) : tienda && (mes || vida) ? (
              <React.Fragment>
                {mes && vida && (
                  <p data-pace-premium-precios style={premiumInvitacionStyles.v1}>{tn('premium.onb.precios', { vida: vida.precio, mes: mes.precio, dias })}</p>
                )}
                {error === 'compra' && <p role="alert" data-pace-premium-error="compra" style={premiumInvitacionStyles.error}>{t('premium.compra.error')}</p>}
                <div style={premiumInvitacionStyles.par}>
                  {mes && (
                    <Button disabled={comprobando} onClick={() => comprar('mes')} style={premiumInvitacionStyles.mitad}>
                      {tn('premium.onb.probar', { dias })}
                    </Button>
                  )}
                  <Button variant="secondary" onClick={cerrar} style={premiumInvitacionStyles.mitad}>{t('premium.later')}</Button>
                </div>
                {mes && <p style={premiumInvitacionStyles.aviso}>{t('premium.onb.aviso')}</p>}
                {vida && (
                  <button type="button" data-pace-premium-vida disabled={comprobando} onClick={() => comprar('vida')} style={premiumInvitacionStyles.fantasma}>
                    {tn('premium.onb.vida', { vida: vida.precio })}
                  </button>
                )}
                {tengo}
              </React.Fragment>
            ) : (
              <React.Fragment>
                <p style={premiumInvitacionStyles.v1}>{t('premium.v1')}</p>
                <Button variant="secondary" onClick={cerrar} style={premiumInvitacionStyles.ancho}>{t('premium.later')}</Button>
                {tengo}
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </div>
    </Modal>
  );
}

const premiumInvitacionStyles = {
  sub: { ...displayItalic, fontSize: 17, color: 'var(--ink-2)', margin: '0 0 14px' },
  lista: { listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: 14, color: 'var(--ink-2)' },
  item: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px dashed var(--line)' },
  detalle: { color: 'var(--ink-3)', fontSize: 13, textAlign: 'right' },
  v1: { ...displayItalic, fontSize: 18, color: 'var(--ink)', margin: '0 0 14px' },
  ancho: { width: '100%', justifyContent: 'center', borderRadius: 'var(--r-pill)' },
  enlace: { display: 'block', margin: '14px auto 0', background: 'none', border: 0, cursor: 'pointer',
    ...displayItalic, fontSize: 16, color: 'var(--premium)' },
  etiqueta: { display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 },
  campo: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', marginBottom: 10, fontSize: 14,
    fontFamily: 'var(--font-mono)', color: 'var(--ink)', background: 'var(--paper-2)',
    border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)' },
  error: { fontSize: 13, color: 'var(--breathe-2)', margin: '0 0 10px', lineHeight: 1.45 },
  titulo: { ...displayItalic, fontSize: 28, fontWeight: 500, lineHeight: 1.15, margin: '12px 36px 2px 0' },
  /* La compra: los dos botones iguales, lado a lado si caben y uno sobre otro si no. */
  par: { display: 'flex', flexWrap: 'wrap', gap: 10, width: '100%' },
  mitad: { flex: '1 1 160px', justifyContent: 'center', borderRadius: 'var(--r-pill)' },
  aviso: { fontSize: 12, color: 'var(--ink-3)', margin: '10px 0 2px', textAlign: 'center' },
  fantasma: { display: 'block', margin: '2px auto 0', background: 'none', border: 0, cursor: 'pointer', padding: '6px 10px',
    ...displayItalic, fontSize: 15, color: 'var(--ink-2)' },
  /* Un enlace con la letra de los botones-enlace de la hoja. */
  enlaceA: { display: 'block', width: 'fit-content', margin: '14px auto 0', textAlign: 'center', textDecoration: 'none',
    ...displayItalic, fontSize: 16, color: 'var(--premium)' },
  tuyas: { fontSize: 13, color: 'var(--ink-2)', margin: '0 0 6px' },
  mas: { fontSize: 13, color: 'var(--ink-3)', margin: '-8px 0 16px' },
};

/* pacegrass.app/recuperar: en la web, la página de al lado; en el archivo suelto, la publicada. */
function premiumEnlaceRecuperar() {
  const fuera = location.protocol === 'file:' && typeof PACE_WEB_PUBLICA === 'string';
  return (fuera ? PACE_WEB_PUBLICA : '') + '/recuperar/';
}

/* El módulo de una rutina de pago, para la lista de la hoja del día de v1. Los ids de Mueve
   empiezan por `extra.` y los de Estira por `move.`: el módulo lo dice el catálogo, no el id. */
function premiumPasoV1Rutina(id) {
  const b = window.getBreatheRoutine ? window.getBreatheRoutine(id) : null;
  if (b) return { id, routine: b, mod: 'breathe' };
  const c = window.resolveBodyRoutine ? window.resolveBodyRoutine(id) : null;
  return c ? { id, routine: c.routine, mod: c.source } : null;
}

/* La hoja del día de v1: los siete días, lo que se queda y lo que sigue gratis. */
function PremiumPasoV1({ datos, cerrar }) {
  const { t, tn, lang } = useT();
  const loc = lang === 'en' ? 'en-GB' : 'es-ES';
  const fecha = new Date(datos.hasta).toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' });
  const orden = ['breathe', 'move', 'extra'];
  const todas = (Array.isArray(datos.rutinas) ? datos.rutinas : []).map(premiumPasoV1Rutina).filter(Boolean)
    .sort((a, b) => orden.indexOf(a.mod) - orden.indexOf(b.mod));
  const vistas = todas.length > PREMIUM_PASOV1_LISTA ? todas.slice(0, PREMIUM_PASOV1_LISTA - 1) : todas;
  const nombre = (r) => {
    if (lang !== 'en') return r.routine.name;
    const v = t(r.id + '.name');
    return v === r.id + '.name' ? r.routine.name : v;
  };
  const titulo = t('premium.pasov1.titulo');
  return (
    <Modal open onClose={cerrar} maxWidth={440} ariaLabel={titulo}>
      <div data-pace-premium-hoja="pasov1">
        <PremiumSeal />
        <h2 style={premiumInvitacionStyles.titulo}>{titulo}</h2>
        <p style={premiumInvitacionStyles.sub}>{tn('premium.pasov1.cuerpo', { fecha })}</p>
        {vistas.length > 0 && (
          <React.Fragment>
            <p style={premiumInvitacionStyles.tuyas}>{t('premium.pasov1.tuyas')}</p>
            <ul data-pace-pasov1-tuyas style={premiumInvitacionStyles.lista}>
              {vistas.map((r) => (
                <li key={r.id} data-pace-pasov1-rutina={r.id} style={premiumInvitacionStyles.item}>
                  <span>{nombre(r)}</span>
                  <span style={premiumInvitacionStyles.detalle}>{t('premium.pasov1.mod.' + r.mod)}</span>
                </li>
              ))}
            </ul>
            {todas.length > vistas.length && (
              <p data-pace-pasov1-mas style={premiumInvitacionStyles.mas}>{tn('premium.pasov1.mas', { n: todas.length - vistas.length })}</p>
            )}
          </React.Fragment>
        )}
        <p style={premiumInvitacionStyles.v1}>{t('premium.pasov1.gratis')}</p>
        <Button onClick={cerrar} style={premiumInvitacionStyles.ancho}>{t('premium.pasov1.vale')}</Button>
      </div>
    </Modal>
  );
}

/* La hoja del aviso: el día, lo que se cobra y cómo cancelar. */
function PremiumAvisoPrueba({ datos, cerrar }) {
  const { t, tn, lang } = useT();
  const loc = lang === 'en' ? 'en-GB' : 'es-ES';
  const fin = new Date(datos.trialEnd);
  const dia = fin.toLocaleDateString(loc, { weekday: 'long' });
  const fecha = fin.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' });
  const mes = window.PACE_TIENDA_WEB && window.PACE_TIENDA_WEB.precios && window.PACE_TIENDA_WEB.precios.mes;
  const precio = mes && window.paceTiendaPrecioTexto ? window.paceTiendaPrecioTexto(mes, lang) : '';
  const puede = !!(window.paceTiendaPuedeGestionar && window.paceTiendaPuedeGestionar());
  const titulo = tn('premium.trial.title', { dia });
  return (
    <Modal open onClose={cerrar} maxWidth={440} ariaLabel={titulo}>
      <div data-pace-premium-hoja="prueba">
        <PremiumSeal />
        <h2 style={premiumInvitacionStyles.titulo}>{titulo}</h2>
        <p style={premiumInvitacionStyles.sub}>{tn('premium.trial.body', { fecha, precio })}</p>
        {puede && <p style={premiumInvitacionStyles.v1}>{tn('premium.trial.cancel', { dia })}</p>}
        {puede && (
          <Button variant="secondary" onClick={() => { window.paceGestionarCompra(); cerrar(); }} style={premiumInvitacionStyles.ancho}>
            {t('premium.settings.manage')}
          </Button>
        )}
        <button type="button" data-pace-premium-seguir onClick={cerrar} style={premiumInvitacionStyles.enlace}>{t('premium.trial.keep')}</button>
      </div>
    </Modal>
  );
}

Object.assign(window, { PremiumInvitacion, PremiumAvisoPrueba, PremiumPasoV1, PaceCandado, paceAbrirPremium, PREMIUM_INCLUYE });
