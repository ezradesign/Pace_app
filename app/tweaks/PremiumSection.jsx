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
     (state-licencia.js); llegará la compra de Google Play. */

function PremiumSection() {
  const { t, tn, lang } = useT();
  usePace(); // al canjear el código, la fila cambia sin cerrar Ajustes
  const datos = window.paceLicenciaVigente ? window.paceLicenciaVigente() : null;
  const permitida = !!(window.paceLicenciaPermitida && window.paceLicenciaPermitida());

  if (datos) {
    let estado = t('premium.settings.forever');
    if (typeof datos.expiresAt === 'string' && typeof parseLocalDateKey === 'function') {
      const f = parseLocalDateKey(datos.expiresAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      estado = tn('premium.settings.until', { fecha: f });
    }
    return (
      <React.Fragment>
        <AjustesAccion derecha={<span data-pace-licencia-estado style={{ color: 'var(--focus)' }}>{estado}</span>}>
          {t('premium.name')}
        </AjustesAccion>
        {datos.tester != null && (
          <AjustesAccion suave derecha={tn('premium.settings.tester', { n: datos.tester })}>
            {t('premium.settings.code')}
          </AjustesAccion>
        )}
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
