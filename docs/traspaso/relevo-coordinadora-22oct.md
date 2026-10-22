# Relevo de la coordinadora · 22 oct. 2026

La conversación coordinadora del 20-22 oct. se llenó. Esto es lo que necesita la siguiente para seguir.

## Quién soy y qué hago

Coordino desde la carpeta principal (`main`). Las sesiones trabajan cada una en su rama y su worktree,
**nunca suben a main**. Cuando una acaba: reviso su rama, se lo enseño a Ez en palabras llanas y, con
su sí, la junto (`git merge --no-commit`, choques de versión a la más alta con `npm run bump`), build,
`verify`, la suite entera con todo junto y push. Como mucho dos sesiones a la vez, con archivos y puertos
(`PACE_E2E_PORT`) repartidos. Commits sin `Co-Authored-By` (`verify` lo rechaza).

## Sesiones en marcha

| Sesión | id | Rama | Puerto | Lleva |
|---|---|---|---|---|
| Datos a prueba de copias rotas | `local_749f6904-7af8-4155-b901-dcd6edec2945` | `claude/elastic-hofstadter-20ccb0` | 8799 | 13 casos de la auditoría externa (saneador, importar y borrar, sin conexión, pestañas, la copia de iPhone y Android, el total de vasos, rutinas dañadas, «¿Te ayudó?», resumen doble) |
| «A tu ritmo» y el calendario | `local_79c9f06a-5eba-43f9-9fb6-a66a7794913d` | `claude/happy-allen-d915c3` | 8797 | «Una hora» con reunión larga, comida en curso (Ez eligió **B**: lo que queda de comida), casilla de reuniones, medianoche, la pausa que se vuelve Foco con la misma duración, «por libre» en plena pausa |

Las dos me escribían a mí (la conversación vieja). **Lo primero:** mandarles un mensaje para que avisen
a la sesión nueva.

## En cola (en `STATE.md`, «Deuda conocida»)

1. «Tus rutinas» y Estadísticas · 2. Avisos de Android (después de que Ez pruebe en su móvil) ·
3. La bienvenida y los Ajustes · 4. Seguridad antes de cobrar · 5. La hora y la medianoche (antes de
marzo). Los casos de Caminos, para cuando vuelvan (`SHOW_CAMINOS = false`).

## Play Console

App creada, ficha y cuestionarios hechos. **Prueba cerrada e interna enviadas a revisión** con 0.174.0.
Pendiente de Ez: los correos de los testers (a la lista «Testers PACE») e instalar desde el enlace de la
interna y probar en su móvil. Detalle en la memoria `play_console_21oct`.

## Cómo trabajar con Ez

- A «¿qué toca?», una sola cosa. Sin jerga. Las decisiones, con AskUserQuestion y la recomendada primero.
- Su página de pasos (`docs/traspaso/hoja-de-ruta-20oct.html`, https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT)
  se republica en cada paso. Desde otra cuenta no se puede editar ese artifact: publicar uno nuevo desde
  el archivo y apuntar el enlace en `STATE.md`.
- Ez pasa auditorías de ChatGPT: comprobar cada punto en el código antes de creerlo, decir qué es cierto,
  qué ya se sabía y qué no urge, y repartirlo entre sesiones sin que se pisen.
- Uso de la cuenta: `get_usage`; desde el 85 %, «wip» y push de todo.

Limpieza pendiente, con el sí de Ez: archivar las sesiones «Libre…» y «Los días diseñados…» (sus ramas ya
están en main) y borrar sus carpetas en `.claude/worktrees/`.
