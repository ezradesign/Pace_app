# Bienvenida y Ajustes: la maqueta del 26 oct.

Página para Ez: https://claude.ai/artifact/6p1BHbVqSrgtwnJgrXWLka (recomendado 1A 2A 3A).

- **1** Enseñar PACE a quien llega: A «Así funciona PACE», una pantalla al final con «Empezar mi primer Foco»; B una
  pista en la home, una vez; C una visita guiada de cuatro paradas.
- **2** PACE completo al final de la bienvenida. La pantalla ya existe (`OnboardingCompleto.jsx`, la A del 16 oct.)
  pero solo sale con `paceTiendaAbierta()`, hoy nunca. A: ya, con «abierto hasta v1», un solo botón, y la de comprar
  cuando se pueda; B: solo cuando se pueda comprar (hoy).
- **3** Ajustes. Medido con el permiso de avisos de una instalación nueva (en headless Chromium dice «bloqueadas» y
  suma 35 px, la trampa de `ajustes.spec.js`): en el ordenador el panel pide scroll a 1536×710 (83 px en español,
  123 en inglés), a 1366×768 (25 y 65) y a 1280×800 en inglés (33; dos filas envuelven). A: «Tus datos» plegado en
  pantallas bajas del ordenador (`min-width: 641px` y `max-height: 860px`), «Copias, borrar y PACE completo»,
  interruptor 40×24, «copia» y «Ajustes» en vez de backup, JSON y Tweaks, y borrar e importar con un aviso de PACE
  (hoy `confirm()`); B: lo mismo con el interruptor de 32×18.

Guiones: `hoy.spec.js` (cómo está hoy y las medidas) y `maqueta.spec.js` (cada opción metida en el DOM), con
`probe.config.js` y `comun.js`; `pagina.js` hace la página desde las fotos (`fm/` → `pagina/`). Las rutas son de la
carpeta temporal de esa sesión: cámbialas. Correr con `PACE_E2E_PORT=8806 npx playwright test --config probe.config.js`.
