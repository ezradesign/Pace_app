# Usabilidad del 8 nov. 2026 · scripts

El informe: `docs/audits/usabilidad-8nov.md`. La página para Ez: https://claude.ai/artifact/BMLmjb9FjynGY8zz6FN4av
(`docs/audits/usabilidad-8nov/pagina-ez.html`).

- `lib.js`, `siembra.js`, `01-…` a `05-…`, `resumen.js` y `hoja.js`: los del recorrido del 6 nov.
  (`../recorrido-6nov/LEEME.md`), con el puerto en el 8886.
- `fotos-ez.js`: las fotos de la página, hoy y con cada opción pintada encima de la app
  (`PACE_E2E_PORT=8887 RECORRIDO_FOTOS=<carpeta> [SOLO=cierre,barra,libre,hasta,voz] node fotos-ez.js`).
  Usa `../caza-semana-7nov/personas.js`.
- `pagina.js <carpeta>`: hace la página con esas fotos en webp (unos 240 KB).
