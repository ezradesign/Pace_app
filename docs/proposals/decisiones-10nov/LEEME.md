# Las decisiones del 10 nov., en una página

**Versión 2 (10 nov., noche):** con lo que Ez ya contestó arriba en «Ya decidido» (propuestas 1A 2A 3A 4A, D-1 A, D-2 A,
D-4 C, D-5 B, D-7 A) y sus secciones plegadas al final. Abierto: dónde va la línea de los lunes en el móvil (tres sitios,
`lunes` en `pinta.js`; recomendada el sobre), D-6 con la opción D (Ocaso y Búho con su dibujo, premiando otra cosa;
`d6d`), 4, 6, 7, el aro, V1 y V2. Las piezas nuevas de la página, en `guion/partes-10nov-noche.html`.

Página para Ez con todo lo que espera su letra: D-1 a D-7 (auditoría de Fable), las propuestas 1, 2 y 4 de esa
misma auditoría (la 3 es D-3 B), las letras 4, 6 y 7 de ChatGPT, el aro, V1 y V2 de la caza de rendimiento, S3 sin
opciones, los «júntalos» y lo que solo puede hacer Ez. Publicada en la cuenta EcLj6:
**https://claude.ai/artifact/H5UgBuqz5VeGnETpixxi96**. En la otra cuenta da 404: se republica desde `index.html` con
las fotos de `fotos/` como archivos aparte (`files`, la misma ruta `fotos/…`).

## Las fotos

- **Nuevas** (`d2-*`, `d3-*`, `d6-*`, `d7-*`): `guion/pinta.js`, sobre la app de verdad, sin tocar `app/`. Con la app
  servida en un puerto libre:
  ```
  PORT=8940 node .claude/static-server.js          # desde la raíz del worktree, en segundo plano
  cd docs/proposals/decisiones-10nov/guion && PUERTO=8940 node pinta.js            # todas
  PUERTO=8940 node pinta.js d3,d7                   # solo esas
  ```
  Móvil 360×740 a 2× y ordenador 1536×710, español, tema claro, reloj puesto. «Desde v1» es
  `PREMIUM_ABIERTO_HASTA_V1` en false y un `pasoV1` con la semana de prueba ya acabada (`SIN` en `pinta.js`). La B de
  D-2 cambia `paceBienvenidaCompleto` por `() => null` antes de pulsar «Comenzar», y la app sola quita la pantalla.
  Las medidas (cuánto baja lo de debajo, dónde acaba el último botón) salen por consola y están en la página.
- **Reutilizadas**: `fable-*` de `origin/claude/auditoria-fable-9nov-8401fc:docs/audits/fable-9nov/fotos/`;
  `gpt-*` sacadas del base64 de `origin/claude/chatgpt-jornada-9nov:docs/audits/chatgpt-8nov/pagina-4-6-7.html`,
  con el nombre del hueco de su plantilla (`@@4A-m@@` → `gpt-4A-m.jpg`). El aro es el de la página de la caza
  (4Fohyqi7Cth9iKGxE2FSSD), copiado con su script.
- Las `*-1536` de «hoy» que no salen en la página se quedan por si Ez pide verlas.
