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
| «A tu ritmo» y el calendario | `local_675119b8-dd92-49e9-9918-98b244ae1433` (antes `local_79c9f06a…`) | `.claude/worktrees/happy-allen-d915c3`, `claude/happy-allen-d915c3` | 8797 | v0.174.3 | C1-C3 del calendario que se mantiene solo (`STATE.md`, «Deuda conocida»). Los textos nuevos de C2 los enseña a Ez antes de montarlos |
| «Tus rutinas» y Estadísticas | `local_dc765250-de13-4fbd-86f5-b06a7730c4ff` (antes `local_cda57a98…`) | `.claude/worktrees/beautiful-perlman-2b642c`, `claude/beautiful-perlman-2b642c` | 8799 | v0.174.4 | R1-R6 (material, solo descanso, por lados, reanudar tras editar, terminar antes, series del cierre), Y1 y E1-E4. Lo que se ve, antes en maqueta para Ez |

**Retomadas el 22 oct. por la tarde** por la coordinadora de la otra cuenta, en las mismas carpetas,
ramas y puertos (ids de arriba). Ez eligió en la maqueta de «Tus rutinas» **1A 2A 3A 4A 5A**, las
cinco recomendadas: la sesión monta la 2A y cierra. La del calendario guarda la C2 que quedó sin
commitear y cierra. La página de pasos de esta cuenta: https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6.

**Al relevo (95 % de uso, 22 oct. por la tarde):**
- Calendario: C1 y C3 hechos (0b3d437); C2 con la A de Ez, montándose cuando se cortó la cuenta. Mira
  su carpeta por si quedó algo sin commitear y el bloque de arriba de LEEME de su rama.
- «Tus rutinas»: todo subido en 9aedae1 («wip», v0.174.4). Hechos R1-R6, Y1, E2, E3 y E4, cada uno
  con su prueba; montadas ya las recomendadas 1A, 3A, 4A y 5A de su maqueta para Ez
  (https://claude.ai/artifact/XdRVMjxUYbQR4iNoLH84DW, cinco elecciones A/B). **Lo primero: preguntar a
  Ez esas cinco elecciones** (la sesión recomienda las cinco A; la 2A, E1, pide un campo nuevo en el
  evento de sesión y sube su `v`, y solo se monta si Ez la elige). Le falta la suite entera (paró en
  125 de 786 sin fallos), un commit sin «wip» y el aviso. Su punto, en LEEME de su rama.

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
- C2: «A · Cuatro casos» (al día / poniendo al día… / no se pudo con «Reintentar» y la hora del
  próximo intento / falta permiso), sobre `docs/traspaso/archivos/calendario-estado-22oct/tabla.md` de
  la rama del calendario. C1 y C3 ya están en esa rama (0b3d437, v0.174.3); C2 se monta ahí.
- Para la cola, de la sesión del calendario: en Android el puente del calendario se traga los
  errores, PACE ve un calendario vacío y puede volver a crear lo que ya estaba.
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
