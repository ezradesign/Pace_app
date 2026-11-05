# Los cuatro arreglos de capas y sesiones (rama `claude/vigilant-jackson-bb58ac`, sobre la 0.190.0)

Hechos, cada uno reproducido con una prueba roja antes de arreglar, y con `npm run verify` en verde:

1. Escape y Atrás solo los atiende la capa de arriba, también en las sesiones: `df1ff767` (`tests/capa-de-arriba.spec.js`).
2. Encender «Auto» a mitad de una serie empieza la guía desde cero: `0893469a` (`tests/runner-auto-a-mitad.spec.js`).
3. La pausa del fin de Foco espera a que acabe la sesión en marcha: `5e8272da` (`tests/pausa-con-sesion.spec.js`). Medido: el menú (capa 100) sí tapaba la sesión (90).
4. Mantener Espacio cuenta una sola vez: código en `59017dc9` (guardado como «WIP» por la coordinadora), porqué en `322d4cfb` (`tests/espacio-mantenido.spec.js`).

Sin hacer: la suite entera; versión, `STATE.md` y `CHANGELOG.md` (las líneas propuestas van al final de cada mensaje de commit).
Sin comprobar: el «¿Salir del Camino?» no está en la pila de diálogos, así que una sesión dentro de un Camino podría seguir saliendo con Escape; y con un aviso encima y el foco en su contenedor, Espacio aún puede pausar la sesión de debajo.
A decidir con Ez: si tras una sesión hecha durante el bloque la pausa debe ofrecer otra cosa, o ninguna.
`app/focus/FocusTimer.pestanas.jsx` (solo `usePausaALaVista`) cambia: puede chocar con la jornada.
