/* PACE · Ajustes — la fila de PACE completo (antes «Licencia · pronto»)
   Creada en sesión 88 (F3b, v0.34.4) dentro de TweaksPanel; extraída a
   archivo propio en sesión 89 (v0.34.5) para devolver el panel a <500 ln.

   s188: DE 221 PX A UNA LINEA. Vive en «Tus datos», donde MONETIZATION.md dice
   que va la entrada de la licencia («discreta, sin upsell»).

   HOY (Ez, 8 oct. 2026), según haya código o no:
   · con un código que vale: «PACE completo · Para siempre» (o «Hasta el …» si
     el código caduca) y, si es de un tester, su número debajo;
   · sin código, en la web: «PACE completo · Introducir código», que abre la
     invitación con el campo ya puesto;
   · en las apps, sin la tienda encendida: «PACE completo · pronto». Allí no se canjean
     códigos propios (state-licencia.js). Con la tienda de Google Play o de Apple encendida
     (state-compra.apps.js), lo que se compró («Para siempre», «Mensual · se renueva el …»,
     «Prueba gratis · hasta el …»), «Gestionar la suscripción», «Restaurar compras» y
     «Tengo un código», que abre el canje de la tienda (Ez, 3A del 18 nov. 2026).
   Y desde v1, mientras dura la semana de quien ya usaba PACE, «Prueba hasta el …».
   Con la tienda abierta, sin código: «Tenerlo para siempre · <precio>» y «Tengo un código». */

/* La fecha del código: el de los testers lleva el día («YYYY-MM-DD»); el de la mensual, milisegundos. */
function premiumFechaTexto(datos, lang) {
  const fin = typeof datos.expiresAt === 'number' ? new Date(datos.expiresAt)
    : (typeof datos.expiresAt === 'string' && typeof parseLocalDateKey === 'function') ? parseLocalDateKey(datos.expiresAt) : null;
  return fin ? fin.toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
}

/* LA MENSUAL (Ez, 3A del 26 oct. 2026): «Gestionar la suscripción» va en su propia fila,
   debajo de «PACE completo · Hasta el …», y solo si la tienda tiene dónde (en la web, el
   portal de Stripe; en Android, las suscripciones de Google Play). Si el código caducó,
   la fila lo dice con su motivo: sin conexión para renovar, o la suscripción terminó. */
/* UNA FILA PARA COMPRAR (Ez, 1A del 10 nov. 2026; auditoría fable-9nov, propuesta 1): con la
   tienda abierta y sin código, «Tenerlo para siempre · 19,99 €» abre la invitación de siempre con
   su botón de compra, y debajo «Tengo un código». No salta sola ni tapa nada: es una fila más de
   «Tus datos», y por eso TweaksPanel pliega la sección 34 px antes en el ordenador cuando está
   (sin eso, de 860 a 893 px de alto el panel pedía scroll). El precio lo da la tienda, nunca las
   traducciones. Con la tienda cerrada, como antes. Devuelve el plan de por vida, o null. */
function premiumPlanEnAjustes(lang) {
  if (window.pacePruebaV1Hasta && window.pacePruebaV1Hasta()) return null;
  return premiumPlanVida(lang);
}

/* El plan de por vida si se puede comprar desde aquí, haya o no semana de prueba: en la web con
   su tienda, y en las apps con la de Google Play o la de Apple. */
function premiumPlanVida(lang) {
  const nativo = !!(window.paceTiendaCanal && window.paceTiendaCanal() !== 'web');
  if (!nativo && !(window.paceLicenciaPermitida && window.paceLicenciaPermitida())) return null;
  const est = window.paceLicenciaEstado ? window.paceLicenciaEstado() : { estado: 'ninguno' };
  if (est.estado === 'vigente' || est.estado === 'caducado') return null;
  if (!(window.paceTiendaAbierta && window.paceTiendaAbierta())) return null;
  return (window.paceTiendaPlanes(lang) || []).find((p) => p.plan === 'vida') || null;
}

/* «TENERLO PARA SIEMPRE» DURANTE LA SEMANA DE PRUEBA (Ez, 3B del 16 nov. 2026; S2 A del 11 nov.:
   «enseñarlo con maqueta antes»). La fila de la prueba sigue diciendo hasta cuándo, y bajo
   «PACE completo», en su línea pequeña, «Tenerlo para siempre · 19,99 € ›». Tocarla abre la
   invitación, con la compra y «Tengo un código». Solo con la tienda abierta; si no, como antes.
   La línea mide unos 25 px y TweaksPanel la cuenta al plegar la sección. */
function premiumPlanEnPrueba(lang) {
  return window.pacePruebaV1Hasta && window.pacePruebaV1Hasta() ? premiumPlanVida(lang) : null;
}

/* Lo que dice la fila con una compra de la tienda de las apps (sexta nº 8). */
function premiumCompraTexto(compra, t, tn, lang) {
  if (compra.plan === 'vida') return t('premium.settings.forever');
  if (typeof compra.hasta !== 'number') return t('premium.settings.mes');
  const fecha = new Date(compra.hasta).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long' });
  if (compra.prueba) return tn('premium.settings.mes.prueba', { fecha });
  return tn(compra.renueva === false ? 'premium.settings.mes.cancelada' : 'premium.settings.mes.renueva', { fecha });
}

/* «Restaurar compras» en las apps, con la tienda encendida (Apple lo pide, norma 3.1.1). Si
   encuentra la compra, la fila de arriba cambia sola; si no, lo dice debajo. */
function PremiumRestaurarFila() {
  const { t, tn } = useT();
  const [aviso, setAviso] = React.useState(null);
  const [buscando, setBuscando] = React.useState(false);
  const tienda = t('premium.tienda.' + (window.paceTiendaCanal ? window.paceTiendaCanal() : 'play'));
  const restaurar = () => {
    if (buscando) return;
    setBuscando(true); setAviso(null);
    window.paceRestaurarCompras().then((r) => {
      setBuscando(false);
      setAviso(r && r.ok ? (r.plan ? null : 'no') : 'error');
    });
  };
  return (
    <AjustesAccion suave onClick={restaurar} derecha="›"
      sub={aviso ? <span data-pace-aj-restaurado={aviso}>{tn('premium.restaurar.' + aviso, { tienda })}</span> : null}>
      <span data-pace-aj-restaurar>{t('premium.tienda.restaurar')}</span>
    </AjustesAccion>
  );
}

function PremiumSection() {
  const { t, tn, lang } = useT();
  usePace(); // al canjear o renovar el código, la fila cambia sin cerrar Ajustes
  usePaceTienda(); // y cuando contesta la tienda de las apps
  const est = window.paceLicenciaEstado ? window.paceLicenciaEstado() : { estado: 'ninguno', motivo: null, datos: null };
  const permitida = !!(window.paceLicenciaPermitida && window.paceLicenciaPermitida());
  const compra = window.paceCompraEstado ? window.paceCompraEstado() : null;
  const mensual = !!(est.datos && window.paceLicenciaEsMensual && window.paceLicenciaEsMensual(est.datos)) || !!(compra && compra.plan === 'mes');
  const canal = window.paceTiendaCanal ? window.paceTiendaCanal() : 'web';
  const gestionar = mensual && window.paceTiendaPuedeGestionar && window.paceTiendaPuedeGestionar() ? (
    <AjustesAccion suave onClick={() => window.paceGestionarCompra()} derecha={t('premium.settings.manage.' + (canal === 'web' ? 'web' : canal)) + ' ›'}>
      {t('premium.settings.manage')}
    </AjustesAccion>
  ) : null;
  const restaurar = canal !== 'web' && window.paceTiendaPuedeRestaurar && window.paceTiendaPuedeRestaurar() ? <PremiumRestaurarFila /> : null;
  /* EL DESISTIMIENTO (Ez, 1A del 30 oct. 2026): quien compró en la web (su código lleva el número
     del pedido; el de un tester, no) tiene a mano «Desistir del contrato aquí», que abre
     pacegrass.app/desistir. Solo en la web: en Android y en el iPhone se compra y se devuelve en
     su tienda. La app no pregunta nada a nadie: solo abre la página. */
  const venta = canal === 'web' && !!(est.datos && typeof est.datos.order === 'string');
  const desistir = venta ? (
    <AjustesAccion suave onClick={() => { try { window.open('/desistir/', '_blank', 'noopener'); } catch (e) {} }} derecha="›">
      {t('premium.settings.desistir')}
    </AjustesAccion>
  ) : null;

  if (compra) {
    return (
      <React.Fragment>
        <AjustesAccion derecha={<span data-pace-licencia-estado data-pace-compra-estado={compra.plan} style={{ color: 'var(--focus)' }}>{premiumCompraTexto(compra, t, tn, lang)}</span>}>
          {t('premium.name')}
        </AjustesAccion>
        {gestionar}
        {restaurar}
      </React.Fragment>
    );
  }
  if (est.estado === 'vigente') {
    const datos = est.datos;
    const f = premiumFechaTexto(datos, lang);
    const estado = f ? tn('premium.settings.until', { fecha: f }) : t('premium.settings.forever');
    return (
      <React.Fragment>
        <AjustesAccion derecha={<span data-pace-licencia-estado style={{ color: 'var(--focus)' }}>{estado}</span>}>
          {t('premium.name')}
        </AjustesAccion>
        {gestionar}
        {desistir}
        {datos.tester != null && (
          <AjustesAccion suave derecha={tn('premium.settings.tester', { n: datos.tester })}>
            {t('premium.settings.code')}
          </AjustesAccion>
        )}
      </React.Fragment>
    );
  }
  /* LA SEMANA DEL PASO A v1 (Ez, 1A del 28 oct. 2026): mientras dura, la fila dice hasta
     cuándo. En la web se sigue pudiendo poner un código desde aquí. */
  const prueba = window.pacePruebaV1Hasta ? window.pacePruebaV1Hasta() : null;
  if (prueba) {
    const f = new Date(prueba).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long' });
    const vidaYa = premiumPlanEnPrueba(lang);
    const sub = vidaYa ? (
      <span data-pace-aj-comprar-prueba={vidaYa.plan}>{t('premium.settings.vida')} · {vidaYa.precio} <span aria-hidden="true">›</span></span>
    ) : null;
    const abrir = vidaYa ? () => paceAbrirPremium({}) : permitida ? () => paceAbrirPremium({ modo: 'codigo' }) : undefined;
    return (
      <AjustesAccion onClick={abrir} sub={sub}
        derecha={<span data-pace-licencia-estado data-pace-licencia-prueba style={{ color: 'var(--focus)' }}>{tn('premium.settings.prueba', { fecha: f })}</span>}>
        {t('premium.name')}
      </AjustesAccion>
    );
  }
  if (est.estado === 'caducado' && permitida) {
    const f = premiumFechaTexto(est.datos, lang) || '';
    const texto = est.motivo === 'sin-red' ? t('premium.settings.sinred')
      : est.motivo === 'terminada' ? tn('premium.settings.terminada', { fecha: f }) : tn('premium.settings.caducada', { fecha: f });
    return (
      <React.Fragment>
        <AjustesAccion suave onClick={() => paceAbrirPremium({ modo: 'codigo' })}
          derecha={<span data-pace-licencia-estado data-pace-licencia-caducada={est.motivo || 'fecha'}>{texto}</span>}>
          {t('premium.name')}
        </AjustesAccion>
        {gestionar}
      </React.Fragment>
    );
  }
  const vida = premiumPlanEnAjustes(lang);
  if (vida) {
    return (
      <React.Fragment>
        <AjustesAccion suave onClick={() => paceAbrirPremium({})}
          derecha={<span data-pace-aj-comprar={vida.plan}>{vida.precio}</span>}>
          {t('premium.settings.vida')}
        </AjustesAccion>
        <AjustesAccion suave onClick={() => (canal === 'web' ? paceAbrirPremium({ modo: 'codigo' }) : window.paceTiendaCanjear())}
          derecha={canal === 'web' ? t('premium.settings.enter') : '›'}>
          <span data-pace-aj-codigo>{t('premium.code.have')}</span>
        </AjustesAccion>
        {restaurar}
      </React.Fragment>
    );
  }
  if (permitida) {
    return (
      <AjustesAccion suave onClick={() => paceAbrirPremium({ modo: 'codigo' })} derecha={t('premium.settings.enter')}>
        {t('premium.name')}
      </AjustesAccion>
    );
  }
  return (
    <React.Fragment>
      <AjustesAccion suave derecha={t('settings.license.soon')}>
        {t('premium.name')}
      </AjustesAccion>
      {restaurar}
    </React.Fragment>
  );
}

Object.assign(window, { PremiumSection, premiumPlanEnAjustes, premiumPlanVida, premiumPlanEnPrueba, premiumCompraTexto, PremiumRestaurarFila });
