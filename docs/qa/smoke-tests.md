# PACE · Smoke Tests manuales

> Version de referencia: v0.27.2+
> Ejecutar en Chrome/Firefox con DevTools Console abierta.
> Todos los tests asumen estado limpio salvo que se indique precondicion especifica.

---

## ST-01 · Sesion Pomodoro estandar (sin Caminos)

**Precondicion:** App cargada, ningun camino activo, modo Foco visible.

**Pasos:**
1. Seleccionar duracion 25 min.
2. Pulsar "Comenzar".
3. Verificar que el timer inicia la cuenta atras desde 25:00.
4. Pulsar "Pausar" — verificar que el timer se detiene.
5. Pulsar "Continuar" — verificar que el timer reanuda.
6. Abrir DevTools > Application > Local Storage > `pace.state.v2`. Verificar que `cycle` > 0.
7. Simular fin de ciclo: en consola ejecutar `window.dispatchEvent(new CustomEvent('pace:pomodoro-done'))` — si no existe este evento, avanzar el timer hasta 0:00 cambiando `Date.now` no es viable; usar el timer de 1 min para test rapido.
8. Verificar que aparece el BreakMenu con opciones Respira / Muevete / Hidratate.

**Resultado esperado:** Timer funcional, pausa/reanuda, BreakMenu aparece al completar.

**Criterios de fallo:**
- Timer no avanza o no se detiene al pausar.
- BreakMenu no aparece tras el ciclo.
- Consola muestra errores JS durante cualquier paso.

---

## ST-02 · Completar path.dawn entero (3 pasos)

**Precondicion:** App cargada. `path.dawn` no completado hoy (o resetear localStorage).

**Pasos:**
1. Verificar que SuggestedPathCard muestra "Amanecer" (ES) o "Dawn" (EN).
2. Pulsar "Comenzar" en la tarjeta.
3. Verificar que PathRunner overlay cubre la pantalla completa (z-index correcto).
4. Verificar que la barra superior muestra el nombre del camino y 3 puntos indicadores.
5. Completar el paso 1 (breathe, focus o body segun el catalogo).
6. Verificar que el punto 1 pasa a "done" y el punto 2 se activa.
7. Completar paso 2 y paso 3 del mismo modo.
8. Verificar que aparece CompletionScreen con el nombre del camino y boton "Volver".
9. Pulsar "Volver" — verificar que se regresa a la vista principal.
10. Verificar en localStorage que `paths.completed.path.dawn.count` es 1 y `lastDoneAt` es la fecha de hoy.
11. Verificar que SuggestedPathCard muestra la etiqueta "Hecho hoy".

**Resultado esperado:** Camino completo de principio a fin, estado persistido correctamente.

**Criterios de fallo:**
- PathRunner no aparece o se cierra solo.
- Los dots no progresan.
- CompletionScreen no aparece.
- `paths.completed` no se actualiza en localStorage.

---

## ST-03 · Iniciar path.weekend y abandonar a mitad via modal

**Precondicion:** App cargada.

**Pasos:**
1. Abrir PathsLibrary (boton "Ver todos" en SuggestedPathCard o desde ActivityBar si aplica).
2. Localizar "Fin de semana" / "Weekend" en la lista.
3. Pulsar "Comenzar".
4. Completar el paso 1 (avanzar al paso 2).
5. Con el paso 2 activo, pulsar el boton ✕ en la barra superior.
6. Si el paso es obligatorio (no optional), verificar que aparece ExitConfirmModal con titulo "Salir del camino?" / "Exit path?".
7. Pulsar "Seguir" / "Stay" — verificar que el modal se cierra y el camino continua.
8. Pulsar ✕ de nuevo — en ExitConfirmModal pulsar "Si, salir" / "Yes, exit".
9. Verificar que PathRunner se cierra y se regresa a la vista principal.
10. Verificar que `paths.completed.path.weekend` NO tiene entrada (o count no incremento).

**Resultado esperado:** Flujo de abandon correcto, progreso no guardado al salir a mitad.

**Criterios de fallo:**
- ExitConfirmModal no aparece (sale directo sin confirmar en paso obligatorio).
- "Seguir" no cierra el modal.
- El camino queda como completado pese a salir a mitad.

---

## ST-04 · Favorito dual en SuggestedPathCard

**Precondicion:** App cargada. Aun no hay favorito marcado.

**Pasos:**
1. Abrir PathsLibrary.
2. Localizar "Tarde" / "Afternoon".
3. Pulsar el boton de favorito (estrella / "Fav").
4. Verificar que el boton cambia a "Quitar" / "Remove favorite" y el badge "Favorito" aparece.
5. Cerrar PathsLibrary (Escape o boton ✕).
6. Verificar en SuggestedPathCard que aparecen DOS tarjetas: una con label "Tu favorito" (Tarde) y otra con label "Sugerido ahora" (el camino sugerido por hora).
7. Verificar que si "Tarde" es tambien el sugerido (misma hora), solo aparece una tarjeta (no duplicado).
8. Volver a PathsLibrary, quitar el favorito de "Tarde".
9. Verificar que SuggestedPathCard vuelve a mostrar solo una tarjeta (solo sugerido).

**Resultado esperado:** Layout dual funciona cuando sugerido != favorito; no hay duplicacion cuando coinciden.

**Criterios de fallo:**
- Dos tarjetas identicas cuando sugerido == favorito.
- Tarjeta favorito no aparece tras marcar.
- Estado favorito no persiste tras recargar.

---

## ST-05 · Completar un camino desde PathsLibrary

**Precondicion:** App cargada.

**Pasos:**
1. Abrir PathsLibrary.
2. Localizar "Mediodia" / "Midday" (o cualquier camino no completado hoy).
3. Pulsar "Comenzar" desde la lista.
4. Verificar que PathsLibrary se cierra y PathRunner se abre.
5. Completar todos los pasos del camino.
6. Verificar que aparece CompletionScreen.
7. Pulsar "Volver".
8. Abrir PathsLibrary de nuevo.
9. Verificar que el camino completado muestra la etiqueta "Hecho hoy" y el boton "Comenzar" desaparece.

**Resultado esperado:** Flujo libreria -> runner -> completado -> libreria refleja estado correcto.

**Criterios de fallo:**
- PathsLibrary no se cierra al pulsar Comenzar.
- PathRunner no abre.
- La etiqueta "Hecho hoy" no aparece en la libreria tras completar.

---

## ST-06 · Stats > tab Caminos

**Precondicion:** Al menos 1 camino completado (puede ser del mismo run de tests).

**Pasos:**
1. Abrir el panel Stats (icono S en TopBar o atajo S).
2. Navegar a la tab "Caminos" / "Paths".
3. Verificar que el contador "Total completados" muestra un numero >= 1.
4. Verificar que "Racha actual" muestra "1 d" (si se completo hoy por primera vez).
5. Verificar que la tabla por camino lista el camino completado con count y fecha.
6. Verificar que el heatmap (PathYearView) muestra al menos una celda activa en la fecha de hoy.
7. Si hay 0 caminos completados, verificar que aparece el mensaje "Aun no has completado ningun camino".

**Resultado esperado:** Tab Caminos muestra metricas correctas y heatmap funcional.

**Criterios de fallo:**
- Tab Caminos no aparece o causa crash.
- Contador en 0 tras haber completado caminos.
- Tabla vacia cuando deberia tener entradas.
- Heatmap completamente vacio el dia de hoy.

---

## ST-07 · Verificacion i18n en modo EN

**Precondicion:** App cargada en ES.

**Pasos:**
1. Abrir Tweaks (icono T en TopBar).
2. Cambiar idioma a "English".
3. Verificar que la UI principal cambia a ingles (sidebar, topbar, actividades).
4. Abrir SuggestedPathCard — verificar que muestra "Dawn" / "Midday" etc., no la clave i18n `paths.path.dawn.name`.
5. Abrir PathsLibrary — verificar titulo "All paths", botones "Start" / "Favorite" / "Done today".
6. Iniciar un camino — verificar PathRunner en ingles (dots, boton Exit, etc.).
7. Abrir ExitConfirmModal — verificar "Exit path?" y "Yes, exit" / "Stay".
8. Cerrar. Abrir Stats > Caminos — verificar "Total completed", "Current streak", "Best streak".
9. Buscar en la pagina entera (Ctrl+F) el patron `paths.` o `stats.paths.` — no deberia aparecer ninguna clave literal sin traducir.
10. Volver a Tweaks, restaurar idioma a "Espanol".

**Resultado esperado:** 0 claves i18n literales visibles en modo EN. Todo el texto traducido.

**Criterios de fallo:**
- Cualquier clave del tipo `paths.path.dawn.name`, `stats.paths.total`, etc. visible en la UI.
- Mezcla de idiomas (algun texto en ES dentro de componentes Caminos en modo EN).
- Crash al cambiar de idioma.
