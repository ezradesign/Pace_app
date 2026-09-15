/* PACE · Ajustes — la fila de la licencia (antes «superficie premium»)
   Creada en sesión 88 (F3b, v0.34.4) dentro de TweaksPanel; extraída a
   archivo propio en sesión 89 (v0.34.5) para devolver el panel a <500 ln.

   s188: DE 221 PX A UNA LINEA. Hasta aqui era sello + titulo + tres lineas de
   copy + un `<input disabled>` + un boton «Pronto» + una nota: **el segundo
   bloque mas alto del panel (221 px de 1412) y no hacia nada** -- medido en
   la auditoria de s188. Queda una fila («Licencia · pronto») en Tus datos,
   que es donde MONETIZATION.md dice que vivira la entrada de licencia
   («discreta, sin upsell»). Cuando llegue la validacion offline de la clave
   firmada (FASE 10 del ROADMAP), ESTE archivo crece y el panel no se toca:
   la fila pasa a abrir la entrada de la clave.

   No desbloquea nada: `premiumUnlocked` sigue false. */

function PremiumSection() {
  const { t } = useT();
  return (
    <AjustesAccion suave derecha={t('settings.license.soon')}>
      {t('settings.license')}
    </AjustesAccion>
  );
}

Object.assign(window, { PremiumSection });
