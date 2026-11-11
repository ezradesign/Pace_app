/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   LA LÍNEA DE LOS LUNES (Ez: 3A de la auditoría del 10 nov.; el móvil, el 11 nov.: «Linea 2 en el
   sobre + 3 en la side bar»)
   ============================================================
   Los lunes, que es cuando llegaría la carta, quien no tiene PACE completo ve dónde estaría:
   «Los lunes, PACE completo te escribe tu semana ›», y tocarla abre la invitación. Solo los lunes:
   todos los días sería pedir la compra cada vez que se abre la app.

   DÓNDE: en el ordenador, en la fila del resumen del día (`RitmoSobre`, RitmoPanel.jsx). En el
   móvil la home no tiene sitio (se pasaba 2 px a 360×740), y va en DOS sitios a la vez: en el
   sobre de arriba, donde llegaría la carta (cerrado hasta que se abre ese lunes), y en una fila
   del cajón bajo «Tus rutinas» (`SidebarFooter`). El sobre y la fila no salen en el ordenador.

   QUIÉN: desde v1, sin PACE completo y sin la semana de prueba (`puedeAprender()`, la misma
   puerta que la carta), y con la bienvenida acabada. Antes de v1 todo está abierto y no sale.
   ============================================================ */

/* ¿Toca hoy la línea? */
function paceLunesToca(s) {
  try {
    if (window.PREMIUM_ABIERTO_HASTA_V1 === true) return false;
    if (typeof puedeAprender !== 'function' || puedeAprender()) return false;
    if (!s || s.firstSeen == null) return false;
    return new Date().getDay() === 1;
  } catch (e) {
    return false;
  }
}

function paceLunesAbrir(t) {
  try { paceAbrirPremium({ nombre: t('lunes.titulo') }); } catch (e) {}
}

/* En el sobre, solo en el móvil. Leída al abrir la hoja; el lunes siguiente vuelve cerrada. */
if (typeof paceSobreApuntar === 'function') {
  paceSobreApuntar({ clave: 'lunes', de: (s, t, tn, lang) => {
    if (!paceLunesToca(s) || !(typeof paceEsMovil === 'function' && paceEsMovil())) return null;
    const hoy = typeof todayISO === 'function' ? todayISO() : '';
    return {
      sinLeer: s.lunesVisto !== hoy, titulo: t('lunes.titulo'), fecha: hoy, tipo: t('premium.name'),
      cuando: paceFechaCorta(hoy, lang, { weekday: 'long', day: 'numeric', month: 'short' }),
      tituloHoja: t('lunes.titulo'), lineas: [t('lunes.sobre')],
      leer: () => { if (getState().lunesVisto !== hoy) setState({ lunesVisto: hoy }); },
      abrir: () => paceLunesAbrir(t), enlace: t('lunes.ver'),
    };
  } });
}

/* La línea del ordenador, en la fila del resumen. */
function RitmoLunes() {
  const { t } = useT();
  const [st] = usePace();
  if (!paceLunesToca(st)) return null;
  return (
    <button type="button" className="pace-rt-lunes" data-pace-lunes-linea onClick={() => paceLunesAbrir(t)}>
      {t('lunes.linea')} <span aria-hidden="true">›</span>
    </button>
  );
}

Object.assign(window, { paceLunesToca, paceLunesAbrir, RitmoLunes });
