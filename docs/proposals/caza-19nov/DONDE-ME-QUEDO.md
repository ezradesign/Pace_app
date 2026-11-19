# Caza del 19 nov. · dónde me quedo

Rama `claude/caza-19nov-c2077c`. Solo propone: no hay nada montado en el código.

## Qué hay

- `hallazgos.md`: los once hallazgos comprobados sobre la 0.211.0 (cinco fallos y seis detalles).
- `fotos/`: una foto por hallazgo (las once que usa la página).
- `guiones/`: los recorridos de Playwright que las sacaron (necesitan `lib.js` y un servidor en el puerto 8945).
- `index.html`: **la página para Ez**, con once preguntas. Fallos 1, 2, 3 y el detalle 7 son «sí/no»; 4, 5, 6, 8, 9, 10 y 11 llevan A/B con la A recomendada.
  Respuesta recomendada: `1 sí · 2 sí · 3 sí · 4A · 5A · 6A · 7 sí · 8A · 9A · 10A · 11A`.

## Publicada

- Cuenta **5iWBf**: https://claude.ai/artifact/NmCXPrtbSuCt69NUnKUdPK (privada; las fotos van en `files`).
- Cuenta **EcLj6**: **falta su par**. Para hacerlo, publicar `docs/proposals/caza-19nov/index.html` con las once fotos de `fotos/` en `files` (las rutas publicadas son `fotos/<nombre>.png`).

## Lo que no se hizo

- Las opciones de texto (4A, 6A/6B, 8A, 10A/10B, 11A/11B) van como maquetas de texto en la propia página, con borde de puntos; no están pintadas sobre la app. Se miden en el móvil al montar, en los dos idiomas.
- No se corrió la suite (había otra corriendo) ni hizo falta: no se tocó código.

## Siguiente paso

Esperar la respuesta de Ez («1 sí 2 sí…»). Con ella, la coordinadora encarga el montaje en una rama aparte.
