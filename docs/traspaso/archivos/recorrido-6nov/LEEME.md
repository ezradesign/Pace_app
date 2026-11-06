# Recorrido del 6 nov. 2026 · scripts

El informe: `docs/audits/recorrido-6nov.md`. La página para Ez: https://claude.ai/artifact/Pd8CZq71NjTMimaydP3caM
(`pagina-ez.html`, con las fotos de `fotos/`).

Se corren desde la raíz del repo contra `index.html` servido en el 8876 (`lib.js` lo arranca si no
lo está), con `RECORRIDO_FOTOS=<carpeta>` para las capturas:

- `01-primera-vez.js [movil|escritorio|ez]`: bienvenida, semana, PACE completo y visita, en es/en y claro/oscuro.
- `02-jornada.js <tam> <es|en> [osc]`: la jornada de alguien con seis semanas de datos (`siembra.js`).
- `03-modulos.js <tam> <es|en> [osc] [parte]`: Respira, Mueve, Estira, Hidrátate, Logros, Estadísticas, «Tus rutinas» y Ajustes.
- `04-final-del-dia.js <tam> <es|en>`: la jornada bloque a bloque hasta la salida y la mañana siguiente.
- `05-web.js`: /premium, /beta, /gracias, /recuperar, /desistir y la app sin red.
- `resumen.js salida.json` resume lo que salta; `hoja.js` hace hojas de contactos.
- Los `_*.js` reproducen cada fallo apuntado (`_silla`, `_sello`, `_tarde`, `_tarde2`, `_tras-la-jornada`, `_noche`)
  o lo que se descartó (`_tab-constructor`, `_agua`, `_404`).
