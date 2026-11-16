/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   LA COPIA DE «TUS DATOS», RECORDADA (Ez, «A+B», 16 nov. 2026; auditoría externa del 10 nov., 2.T6)
   ===================================================================================
   Sin cuentas, la copia es lo único que salva tu historia y tu código si cambias de móvil, y Safari
   borra lo guardado de una web que no se visita en siete días (salvo instalada). Por eso, SOLO EN LA
   WEB SIN INSTALAR:
     A · bajo «Exportar una copia», una línea con cuándo fue la última y el aviso de Safari
         (TweaksData.jsx: una línea pequeña pegada a la fila, fuera del botón; no tapa nada);
     B · en el sobre de arriba, «Guarda una copia», como mucho una vez al mes: cuando hace 30 días o
         más de la última copia (o, sin ninguna, desde que empezaste) y del último aviso. Leída al abrir
         la hoja, sigue en ella, leída, el resto del día (como la línea de los lunes) y luego se va.
   Sin copia nunca hecha se dice así, sin inventar una fecha. `ultimaCopia` (ms) la pone exportar;
   `copiaAvisoVisto` es el día (YYYY-MM-DD) en que se leyó el aviso, y '*' lo apaga (lo siembra la suite,
   como `novedadesVistas`). Carga después de shell/Sobre.jsx y antes de TweaksData.jsx. */

const PACE_COPIA_CADA_DIAS = 30;

/* La web en una pestaña del navegador: ni las apps (que no tienen ese borrado) ni instalada. Ante la
   duda, no: es un aviso, y sobra antes que molestar. */
function paceWebSinInstalar() {
  try {
    if (window.Capacitor || (typeof paceEsNativo === 'function' && paceEsNativo())) return false;
    if (navigator.standalone === true) return false;
    return !!(window.matchMedia && window.matchMedia('(display-mode: browser)').matches);
  } catch (e) { return false; }
}

/* Días de calendario desde `ms` hasta hoy, o null si no hay fecha. */
function paceCopiaDias(ms) {
  if (typeof ms !== 'number' || !isFinite(ms)) return null;
  const a = new Date(ms); a.setHours(0, 0, 0, 0);
  const h = new Date(); h.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((h.getTime() - a.getTime()) / 86400000));
}

/* «Última copia: hace 40 días.», «… hoy.», «… ayer.» o «Aún no has guardado ninguna copia.» */
function paceCopiaFecha(s, t, tn) {
  const d = paceCopiaDias(s && s.ultimaCopia);
  if (d === null) return t('settings.copia.nunca');
  if (d === 0) return t('settings.copia.hoy');
  if (d === 1) return t('settings.copia.ayer');
  return tn('settings.copia.hace', { n: d });
}

/* ¿Sale hoy «Guarda una copia» en el sobre? */
function paceCopiaAvisoToca(s) {
  try {
    if (!s || s.firstSeen == null || s.copiaAvisoVisto === '*' || !paceWebSinInstalar()) return false;
    const hoy = todayISO();
    if (s.copiaAvisoVisto === hoy) return true;
    const desde = paceCopiaDias(typeof s.ultimaCopia === 'number' ? s.ultimaCopia : s.firstSeen);
    if (desde === null || desde < PACE_COPIA_CADA_DIAS) return false;
    if (typeof s.copiaAvisoVisto === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.copiaAvisoVisto)) {
      const visto = paceCopiaDias(parseLocalDateKey(s.copiaAvisoVisto).getTime());
      if (visto !== null && visto < PACE_COPIA_CADA_DIAS) return false;
    }
    return true;
  } catch (e) { return false; }
}

if (typeof paceSobreApuntar === 'function') {
  paceSobreApuntar({ clave: 'copia', de: (s, t, tn, lang) => {
    if (!paceCopiaAvisoToca(s)) return null;
    const hoy = todayISO();
    const sinLeer = s.copiaAvisoVisto !== hoy;
    return {
      sinLeer: sinLeer, titulo: t(sinLeer ? 'sobre.copia.nueva' : 'sobre.copia'), fecha: hoy, tipo: t('sobre.copia.tipo'),
      cuando: paceFechaCorta(hoy, lang, { day: 'numeric', month: 'short' }),
      tituloHoja: t('sobre.copia.titulo'), lineas: [paceCopiaFecha(s, t, tn), t('sobre.copia.donde')],
      leer: () => { if (getState().copiaAvisoVisto !== hoy) setState({ copiaAvisoVisto: hoy }); },
    };
  } });
}

Object.assign(window, { paceWebSinInstalar, paceCopiaDias, paceCopiaFecha, paceCopiaAvisoToca, PACE_COPIA_CADA_DIAS });
