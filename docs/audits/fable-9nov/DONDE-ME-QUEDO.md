# Dónde me quedo · 10 nov. 2026, tarde

La auditoría externa que trajo Ez (`externa-10nov.md`) está comprobada punto a punto en `externa-10nov-comprobado.md` (40 puntos: 18 nuevos, 4 hechos en ramas, 8 en la lista de Ez, 10 decididos, ninguno falso), y las dos están juntas en una sola cola, `cola.md`. La página se rehízo en la misma dirección (versión 2), con las fotos como archivos del artifact para que pese 20 KB: se genera con `node genera.js` y se publica pasando cada foto en `files` como `fotos/<nombre>.jpg`. Lo que falta por mirar sigue igual (abajo); de la externa, por probar, la altura de los enlaces de la bienvenida.

---

# Dónde me quedo · auditoría con Fable 5.2 · 10 nov. 2026, 9:20

Segunda tanda: paré al 84 % de las 5 h (la ventana se renueva a las 13:50), con «Weekly · Fable» al 44 %. **Hechas las miradas
1 y 2 y publicada la página** (https://claude.ai/artifact/2QnMBypqSRVJCmPeNJazZA, cuenta de 5iWBf). **Sin mirar: 3 (flujos de ejercicios y rutinas nuevas), 4 (interfaz en
oscuro y a 1280 módulo a módulo) y 5**; tampoco /premium y la landing, la pausa larga, la comida, el móvil bloqueado, los logros
ni la valoración.

Para seguir: `guion/run.js` (pasos por la línea de órdenes: `t:` toca, `fin` acaba el bloque, `corre:` deja correr el reloj,
`f:` foto; entorno `V1=1`, `TIENDA=1`, `MOVIL=0 ANCHO=1280 ALTO=720`, `HORA`, `ALMACEN`) y `guion/pinta.js`. Los dos esperan
`p1-estado.json` y `v1-estado.json` a su lado: el primero lo deja `p1.js`; el segundo, abrir con `V1=1`, tocar «Entendido» y
el paso `guarda:v1-estado.json`. Las rutas del arnés apuntan a este worktree. Dentro de una ventana abierta hay botones con el
mismo nombre detrás: `run.js` toca el último del DOM. Para republicar la página: editar `pagina.src.html`, `node genera.js` y
publicar `pagina.html` con su dirección.

---

## La nota de la primera tanda (9 nov.)

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
