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
   · en Android: «PACE completo · pronto». Allí no se canjean códigos propios
     (state-licencia.js); llegará la compra de Google Play.
   Y desde v1, mientras dura la semana de quien ya usaba PACE, «Prueba hasta el …». */

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
function PremiumSection() {
  const { t, tn, lang } = useT();
  usePace(); // al canjear o renovar el código, la fila cambia sin cerrar Ajustes
  const est = window.paceLicenciaEstado ? window.paceLicenciaEstado() : { estado: 'ninguno', motivo: null, datos: null };
  const permitida = !!(window.paceLicenciaPermitida && window.paceLicenciaPermitida());
  const mensual = !!(est.datos && window.paceLicenciaEsMensual && window.paceLicenciaEsMensual(est.datos));
  const canal = window.paceTiendaCanal ? window.paceTiendaCanal() : 'web';
  const gestionar = mensual && window.paceTiendaPuedeGestionar && window.paceTiendaPuedeGestionar() ? (
    <AjustesAccion suave onClick={() => window.paceGestionarCompra()} derecha={t('premium.settings.manage.' + (canal === 'play' ? 'play' : 'web')) + ' ›'}>
      {t('premium.settings.manage')}
    </AjustesAccion>
  ) : null;

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
    return (
      <AjustesAccion onClick={permitida ? () => paceAbrirPremium({ modo: 'codigo' }) : undefined}
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
  if (permitida) {
    return (
      <AjustesAccion suave onClick={() => paceAbrirPremium({ modo: 'codigo' })} derecha={t('premium.settings.enter')}>
        {t('premium.name')}
      </AjustesAccion>
    );
  }
  return (
    <AjustesAccion suave derecha={t('settings.license.soon')}>
      {t('premium.name')}
    </AjustesAccion>
  );
}

Object.assign(window, { PremiumSection });
