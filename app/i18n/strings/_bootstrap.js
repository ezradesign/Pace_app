/* PACE - strings bootstrap (sesion 81 / v0.33.1)

   Inicializa el catalogo i18n vacio.

   Los archivos siguientes (ui.js, sessions.js, paths.js, stats.js,
   achievements.js) inyectan keys via Object.assign sobre
   window.PACE_STRINGS.{es,en}.

   strings-content.js sigue siendo el patch final EN de contenido
   (rutinas Move/Breathe/Extra), cargado al final de la cadena i18n.

   Carga ANTES de cualquier otro archivo i18n del split.
*/
window.PACE_STRINGS = { es: {}, en: {} };
