/* PACE · PremiumInvitacion.tienda.jsx — LO QUE LA HOJA DE PACE COMPLETO DICE EN LAS APPS
   ============================================================
   Con la tienda de Google Play o de Apple (state-compra.apps.js), la hoja de compra y la
   bienvenida dicen lo que la tienda da y nada más (auditoría externa, sexta nº 9 a 12):
   · la prueba de 7 días solo si la tienda dice que a esta persona le toca;
   · bajo la mensual, lo que cuesta después, que se renueva y dónde se cancela;
   · al pie, las condiciones (en el iPhone, las estándar de Apple: Ez, 4A del 18 nov.; en
     Android, las de Google Play), la privacidad y «Restaurar compras» (Apple, norma 3.1.1);
   · mientras la tienda contesta, «Cargando los precios…», y si no contesta, «Reintentar»;
   · tras comprar, lo que pasó de verdad: para siempre, la prueba con su fecha o la mensual.
   En las apps no se promete el aviso de dos días antes (Ez, D-11 A del 11 nov.): la tienda
   sabe cuándo acaba la prueba, y Ajustes la cuenta. La web sigue como estaba. */

const { useState: useStatePT, useEffect: useEffectPT } = React;

const PACE_CONDICIONES_TIENDA = {
  apple: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  play: 'https://play.google.com/about/play-terms/',
};

function premiumTiendaCanal() {
  return window.paceTiendaCanal ? window.paceTiendaCanal() : 'web';
}

/* Que la hoja y Ajustes se pinten otra vez cuando la tienda contesta. */
function usePaceTienda() {
  const [, setVuelta] = useStatePT(0);
  useEffectPT(() => {
    const otra = () => setVuelta((n) => n + 1);
    window.addEventListener('pace:tienda', otra);
    return () => window.removeEventListener('pace:tienda', otra);
  }, []);
}

/* Bajo los botones de la mensual: lo que cuesta después y dónde se cancela (nº 11). */
function PremiumTiendaRenueva({ mes }) {
  const { t, tn } = useT();
  const canal = premiumTiendaCanal();
  if (!mes || canal === 'web') return null;
  const clave = mes.pruebaDias ? 'premium.tienda.renueva' : 'premium.tienda.renueva.sin';
  return (
    <p data-pace-premium-renueva style={premiumTiendaStyles.renueva}>
      {tn(clave, { mes: mes.precio, donde: t('premium.donde.' + canal) })}
    </p>
  );
}

/* El pie: condiciones, privacidad y «Restaurar compras». `alRestaurar(r)` con lo encontrado. */
function PremiumTiendaPie({ alRestaurar }) {
  const { t, tn, lang } = useT();
  const [aviso, setAviso] = useStatePT(null);
  const [buscando, setBuscando] = useStatePT(false);
  const canal = premiumTiendaCanal();
  if (canal === 'web') return null;
  const tienda = t('premium.tienda.' + canal);
  const privacidad = typeof paceEnlaceLegal === 'function' ? paceEnlaceLegal('/privacy', lang) : '/privacy';
  const restaurar = () => {
    if (buscando) return;
    setBuscando(true); setAviso(null);
    window.paceRestaurarCompras().then((r) => {
      setBuscando(false);
      if (r && r.ok && r.plan) alRestaurar(r);
      else setAviso(r && r.ok ? 'no' : 'error');
    });
  };
  return (
    <React.Fragment>
      <p data-pace-premium-pie style={premiumTiendaStyles.pie}>
        <a href={PACE_CONDICIONES_TIENDA[canal]} target="_blank" rel="noopener" data-pace-premium-condiciones style={premiumTiendaStyles.enlace}>
          {t('premium.tienda.condiciones')}
        </a>
        <span aria-hidden="true"> · </span>
        <a href={privacidad} target="_blank" rel="noopener" data-pace-premium-privacidad style={premiumTiendaStyles.enlace}>
          {t('premium.tienda.privacidad')}
        </a>
        <span aria-hidden="true"> · </span>
        <button type="button" data-pace-premium-restaurar disabled={buscando} onClick={restaurar} style={premiumTiendaStyles.boton}>
          {t('premium.tienda.restaurar')}
        </button>
      </p>
      {aviso && <p role="status" data-pace-premium-restaurado={aviso} style={premiumTiendaStyles.estado}>{tn('premium.restaurar.' + aviso, { tienda })}</p>}
    </React.Fragment>
  );
}

/* Mientras la tienda contesta, o si no contesta (nº 12): nunca «Pronto podrás tenerlo aquí». */
function PremiumTiendaCarga({ estado }) {
  const { t } = useT();
  const [otra, setOtra] = useStatePT(false);
  if (estado === 'cargando' || otra) {
    return <p data-pace-premium-tienda="cargando" style={premiumTiendaStyles.estado}>{t('premium.tienda.cargando')}</p>;
  }
  return (
    <div data-pace-premium-tienda="error" style={premiumTiendaStyles.error}>
      <p style={{ margin: 0 }}>{t('premium.tienda.error')}</p>
      <button type="button" data-pace-premium-reintentar style={premiumTiendaStyles.boton}
        onClick={() => { setOtra(true); window.paceTiendaReintentar().then(() => setOtra(false)); }}>
        {t('premium.tienda.reintentar')}
      </button>
    </div>
  );
}

/* Lo que dice la hoja tras comprar o restaurar en la tienda (nº 10). */
function premiumResultadoTexto(r, t, tn, lang) {
  if (r.restaurada) return t(r.plan === 'mes' ? 'premium.restaurar.mes' : 'premium.restaurar.vida');
  if (r.prueba && typeof r.prueba.hasta === 'number') {
    const fecha = new Date(r.prueba.hasta).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long' });
    return tn('premium.ok.prueba', { fecha });
  }
  return t(r.plan === 'mes' ? 'premium.ok.mes' : 'premium.ok.other');
}

/* El pago que la tienda aún no ha confirmado (Google deja pagar en efectivo en algunos países). */
function PremiumPendiente({ cerrar }) {
  const { t, tn } = useT();
  const titulo = t('premium.compra.pendiente.titulo');
  return (
    <Modal open onClose={cerrar} maxWidth={440} ariaLabel={titulo}>
      <div data-pace-premium-hoja="pendiente">
        <PremiumSeal />
        <h2 style={premiumInvitacionStyles.titulo}>{titulo}</h2>
        <p style={premiumInvitacionStyles.sub}>{tn('premium.compra.pendiente', { tienda: t('premium.tienda.' + premiumTiendaCanal()) })}</p>
        <Button onClick={cerrar} style={premiumInvitacionStyles.ancho}>{t('premium.ok.continue')}</Button>
      </div>
    </Modal>
  );
}

const premiumTiendaStyles = {
  renueva: { fontSize: 12, color: 'var(--ink-3)', margin: '10px 0 2px', textAlign: 'center', lineHeight: 1.45 },
  pie: { fontSize: 12, color: 'var(--ink-3)', margin: '12px 0 0', textAlign: 'center', lineHeight: 2 },
  enlace: { color: 'var(--ink-2)', textDecoration: 'underline', textUnderlineOffset: 2 },
  boton: { background: 'none', border: 0, padding: '4px 2px', cursor: 'pointer', font: 'inherit', fontSize: 12,
    color: 'var(--ink-2)', textDecoration: 'underline', textUnderlineOffset: 2 },
  estado: { fontSize: 13, color: 'var(--ink-2)', margin: '8px 0 12px', textAlign: 'center' },
  error: { fontSize: 13, color: 'var(--ink-2)', margin: '0 0 14px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
};

Object.assign(window, { PACE_CONDICIONES_TIENDA, usePaceTienda, PremiumTiendaRenueva, PremiumTiendaPie, PremiumTiendaCarga,
  premiumResultadoTexto, PremiumPendiente, premiumTiendaStyles });
