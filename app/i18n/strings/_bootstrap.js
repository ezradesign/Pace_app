/* PACE - strings bootstrap (sesion 81 / v0.33.1)

   Inicializa el catalogo i18n vacio.

   Los archivos siguientes (ui.js, sessions.js, paths.js, stats.js,
   achievements.js) inyectan keys via Object.assign sobre
   window.PACE_STRINGS.{es,en}.

   El inglés del contenido (rutinas de Respira, Mueve y Estira, y los
   logros) vive en app/i18n/content/, que carga al final de la cadena i18n.
   Cada clave, en un solo sitio (verify.claves.js), y ninguna sin una
   pantalla que la pida (verify.sinpantalla.js).

   Carga ANTES de cualquier otro archivo i18n del split.
*/
window.PACE_STRINGS = { es: {}, en: {} };
