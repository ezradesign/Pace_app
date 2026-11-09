# Dónde me quedo · auditoría con Fable 5.2 · 9 nov. 2026, 23:40

Paré al 83 % de las 5 h (el tope del encargo era 85 % para el WIP y 90 % para parar), con «Weekly · Fable» al
21 %. Al empezar ya estaba al 60 %: había otras dos sesiones corriendo. La ventana se renueva el 10 nov. a las
04:20.

## Hecho

- Leídos: `STATE.md`, «Camino a v1.0» del ROADMAP, las decisiones de venta y cobro de `DECISIONES_PRODUCTO.md`
  (5 nov., 28 oct., 16 oct. y 15 oct.), `docs/audits/chatgpt-28oct/LEEME.md`, `auditoria-v0.181.1.md`,
  `state-entitlement.jsx`, `state-compra.js`, `BreakMenu.jsx` y los manejadores de la pausa en `main.jsx`.
- Vivida en la app: la bienvenida entera y la home a 360 × 740, como alguien nuevo.
- `auditoria.md` con lo comprobado: M1-M4, F1, F2.

## Sin hacer, por orden

1. **Monetización**: apagar `PREMIUM_ABIERTO_HASTA_V1` en la página (`window.PREMIUM_ABIERTO_HASTA_V1 = false`
   con `addInitScript`, como hacen las pruebas) y vivir lo que ve quien no paga: la hoja del día de v1, una
   rutina cerrada, la invitación, Estadísticas, «A tu ritmo» sin aprender ni variar (confirma o desmiente M1).
   Leer `dist/premium` o la página de /premium y `docs/launch/`. La carta del lunes, los logros y la valoración.
2. **El Foco con los ejercicios**, vivido: un bloque por libre y su pausa (con y sin propuesta), la vuelta a la
   home, y lo mismo con jornada («Preparar jornada»), pausa corta y larga, «Ver ejercicio», volver al Foco.
3. Las personas 2 (teletrabajo a 1280) y 3 (solo estirar), los flujos de Mueve, Estira, Respira e Hidrátate, y la
   interfaz en oscuro.
4. Sin leer: `DESIGN_SYSTEM.md`, `CONTENT.md`, `usabilidad-8nov.md`, `chatgpt-8nov/`, las revisiones 1 a 9 enteras.
5. **La página para Ez**: sin empezar. Cargar antes la skill `artifact-design`.

## Para seguir sin perder tiempo

- El arnés está en `guion/`: `lib.js` abre la web con el reloj puesto (`abrir`), saca fotos, adelanta el reloj
  (`finBloque` lleva al final del bloque en marcha) y `capa.js` da el texto y los botones de la capa de arriba.
  `p1.js` recorre la bienvenida. Las rutas del arnés apuntan a este worktree y a su carpeta `fotos/`: cámbialas.
- La web se sirve con `PORT=8920 node .claude/static-server.js .` desde el worktree; el `index.html` de `main` ya
  es el de la 0.196.0, no hace falta construir.
- En la bienvenida, el primer «Comenzar» se toca por su nombre; el de la pantalla de PACE completo es
  `[data-pace-onb-comenzar]`, y la visita, `[data-pace-visita-siguiente]`.
- La pantalla de PACE completo entra con una animación escalonada: la foto sale a medio pintar si no se espera.
- `node_modules` es un enlace a la carpeta principal del repo: quitarlo con `rmdir` antes de borrar el worktree.
  `mklink /J` desde Git Bash lo creó mal (`C:\C:\…`); con `New-Item -ItemType Junction` de PowerShell, bien.
