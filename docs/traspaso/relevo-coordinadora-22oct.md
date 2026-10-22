# Relevo de la coordinadora · 22 oct. 2026 (tarde)

La coordinadora del 22 oct. (`local_7f8a7a6d-68cd-45e8-9548-a7425f60ae05`, «Coordinadora PACE relevo»)
relevó por la mañana a la del 20-22 oct. Este archivo es lo que necesita la siguiente para seguir,
también desde la otra cuenta de Claude de Ez.

## Quién soy y qué hago

Coordino desde la carpeta principal (`main`). Las sesiones trabajan cada una en su rama y su worktree,
**nunca suben a main**. Cuando una acaba: reviso su rama, se lo enseño a Ez en palabras llanas y, con
su sí, la junto (`git merge --no-commit`, choques de versión a la más alta), build, `verify`, la suite
entera con todo junto y push. Como mucho dos sesiones a la vez, con archivos y puertos
(`PACE_E2E_PORT`) repartidos. Commits sin `Co-Authored-By` (`verify` lo rechaza).

## Dónde está main

v0.174.2 en `main` y en pacegrass.app desde el 22 oct.: los trece casos de datos (v0.174.1) y los
seis de «A tu ritmo», el calendario y el aro (v0.174.2), juntados con el sí de Ez. Suite entera con
todo junto: 767 en verde, 2 saltadas y una caída por carga (`ritmo-pausa.spec.js:114`, que repetida a
solas pasa 6 de 6). CI en verde.

## Sesiones en marcha

| Sesión | id | Carpeta y rama | Puerto | Versión | Lleva |
|---|---|---|---|---|---|
| «A tu ritmo» y el calendario | `local_79c9f06a-5eba-43f9-9fb6-a66a7794913d` | `.claude/worktrees/happy-allen-d915c3`, `claude/happy-allen-d915c3` | 8797 | v0.174.3 | C1-C3 del calendario que se mantiene solo (`STATE.md`, «Deuda conocida»). Los textos nuevos de C2 los enseña a Ez antes de montarlos |
| «Tus rutinas» y Estadísticas | `local_cda57a98-31b6-47eb-b82b-1d91c4ee748f` | `.claude/worktrees/beautiful-perlman-2b642c`, `claude/beautiful-perlman-2b642c` | 8799 | v0.174.4 | R1-R6 (material, solo descanso, por lados, reanudar tras editar, terminar antes, series del cierre), Y1 y E1-E4. Lo que se ve, antes en maqueta para Ez |

Las dos saben que al 85 % hacen «wip» y push, y que al 90 % dejan su punto en el bloque de arriba de
`docs/traspaso/LEEME.md` de su rama. Para retomarlas desde la otra cuenta: `docs/WORKFLOW.md` §10
(sesión nueva en la MISMA carpeta, con la misma rama y el mismo puerto; `start_session` con `cwd`).

## En cola (en `STATE.md`, «Deuda conocida»)

1. La bienvenida y los Ajustes (A1-A5, A7, y del 22 oct. A8 Intro en el menú de pausa y A9 Respira
   reanudada en dos pestañas) · 2. Avisos de Android, después de que Ez pruebe en su móvil ·
3. Seguridad antes de cobrar · 4. La hora y la medianoche, antes de marzo. Los casos de Caminos,
para cuando vuelvan (`SHOW_CAMINOS = false`). La barra que no pregunta antes de dejar una pausa
empezada, apuntada en «A tu ritmo».

## Decisiones de Ez de hoy

- La comida: «B · lo que queda de comida» (`DECISIONES_PRODUCTO.md`), montada en v0.174.2.
- Dos pestañas a la vez (caso 8 de datos): «A · aceptarlo» (`DECISIONES_PRODUCTO.md`).
- C3: «Desconectar» deja de leer las reuniones también en Android, como la web (no puso pegas).
- **Uso de la cuenta:** «cuando quede un 90 % de esta sesión migramos hacia otra cuenta de Claude sin
  perder absolutamente nada». Leído como 90 % usado.

## Play Console

App creada, ficha y cuestionarios hechos. Prueba cerrada e interna enviadas a revisión con 0.174.0.
Pendiente de Ez: los correos de los testers (a la lista «Testers PACE») e instalar desde el enlace de la
interna y probar en su móvil. Detalle en la memoria `play_console_21oct`.

## Cómo trabajar con Ez

- A «¿qué toca?», una sola cosa. Sin jerga. Las decisiones, con AskUserQuestion y la recomendada primero.
- Su página de pasos (`docs/traspaso/hoja-de-ruta-20oct.html`, https://claude.ai/artifact/EcLj6io4wM9pGjtQ5wd1CT)
  se republica en cada paso. Desde la otra cuenta no se puede editar ese artifact: publicar uno nuevo
  desde el archivo, darle el enlace a Ez y apuntarlo en `STATE.md`.
- Ez pasa auditorías de ChatGPT: comprobar cada punto en el código antes de creerlo, decir qué es cierto,
  qué ya está arreglado y qué no urge, y repartirlo entre sesiones sin que se pisen archivos.
- Una sesión solo se puede abrir en un turno que empezó Ez con un mensaje suyo; desde un aviso
  automático, se deja como tarjeta para que Ez la arranque.
- Un mensaje a una sesión dice «queued», no «leído»: comprobar en su rama que una decisión llegó.
