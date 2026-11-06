/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   LAS NOVEDADES EN EL SOBRE (Ez, 5 nov. 2026: 3A)
   ===============================================
   Una fuente del sobre (shell/Sobre.jsx) con lo más destacado de la última versión, escrito a mano en
   shell/novedades.data.js, en español y en inglés. Se lee en la hoja del sobre, sin ventana propia.

   Cuándo hay: la última versión con novedades, hasta que sale la siguiente, y solo para quien ya usaba PACE
   cuando salió (`firstSeen` anterior a su día): quien llega después no ve novedades de algo que nunca vio,
   y sin `firstSeen` (la bienvenida sin cerrar) tampoco. `novedadesVistas` guarda el id leído; '*' (lo
   siembra la suite) las apaga. Leerlas no pide nada ni cambia nada más. */

function paceNovedadActual() {
  const lista = window.PACE_NOVEDADES || [];
  return lista.length ? lista[0] : null;
}

paceSobreApuntar({ clave: 'novedades', de: (s, t, tn, lang) => {
  const n = paceNovedadActual();
  if (!n || s.novedadesVistas === '*' || s.firstSeen == null) return null;
  const sinLeer = s.novedadesVistas !== n.id;
  const dia = typeof parseLocalDateKey === 'function' ? parseLocalDateKey(n.desde) : null;
  if (sinLeer && dia && !(s.firstSeen < dia.getTime())) return null;
  const lineas = (lang === 'en' ? n.en : n.es) || n.es;
  return {
    sinLeer: sinLeer,
    titulo: t(sinLeer ? 'sobre.novedades.nueva' : 'sobre.novedades'),
    fecha: n.desde,
    tipo: t('sobre.novedades.tipo'),
    cuando: paceFechaCorta(n.desde, lang, { day: 'numeric', month: 'short' }),
    tituloHoja: t('sobre.novedades.titulo'),
    lineas: lineas,
    leer: () => { if (getState().novedadesVistas !== n.id) setState({ novedadesVistas: n.id }); },
  };
} });

Object.assign(window, { paceNovedadActual });
