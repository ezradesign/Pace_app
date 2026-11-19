/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   EL SOBRE: LA NOTA DEL FIN DE LA SEMANA DE PRUEBA (Ez, 2A del 16 nov. 2026)
   ==========================================================================
   Una fuente más del sobre (Sobre.jsx), en el móvil y en el ordenador. Cerrada mientras la nota no
   se ha visto en ningún sitio (`pasoV1.finVisto`, state-paso-v1.js); leída, se queda una semana y
   se va. Abrir la hoja del sobre la da por vista, y entonces ni la hoja de PACE ni la línea de la
   biblioteca vuelven a salir. El resto de la nota, en ui/PremiumFinPrueba.jsx. */

if (typeof paceSobreApuntar === 'function') {
  paceSobreApuntar({ clave: 'finPrueba', de: (s, t, tn, lang) => {
    const r = window.pacePasoV1Acabada ? window.pacePasoV1Acabada() : null;
    if (!r) return null;
    const visto = typeof r.finVisto === 'number' ? r.finVisto : null;
    if (visto !== null && Date.now() - visto > window.PACE_FIN_PRUEBA_EN_SOBRE) return null;
    const fecha = toISODate(new Date(r.hasta));
    const nombres = window.premiumFinRutinas ? window.premiumFinRutinas(r).map((x) => window.premiumFinNombre(x, t, lang)) : [];
    const lineas = [t('premium.fin.sobre.gratis')];
    if (nombres.length) {
      lineas.push(tn(nombres.length === 1 ? 'premium.fin.sobre.una' : 'premium.fin.sobre.varias',
        { lista: window.premiumFinLista(nombres, t, tn, lang) }));
    }
    return {
      sinLeer: visto === null, titulo: t('premium.fin.titulo'), fecha: fecha, tipo: t('premium.name'),
      cuando: paceFechaCorta(fecha, lang, { weekday: 'long', day: 'numeric', month: 'short' }),
      tituloHoja: t('premium.fin.titulo'), lineas: lineas,
      leer: () => { if (window.pacePasoV1FinVisto) window.pacePasoV1FinVisto(); },
      abrir: () => paceAbrirPremium({}), enlace: t('premium.fin.ver'),
    };
  } });
}
