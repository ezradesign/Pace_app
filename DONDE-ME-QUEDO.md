# Dónde me quedo · avisos de la novena (16 nov. 2026)

Rama `claude/avisos-novena-16nov-cdf66e`, sobre `main` en la 0.207.0 (147cff8c). Parada al empezar porque el uso
de 5 h estaba al 94 % (vuelve a cero a las 19:40, hora de Madrid). **No hay código tocado**: solo este archivo.

## Lo hecho

- Leídos `CLAUDE.md`, `STATE.md`, `docs/audits/fable-15nov/externa-novena-16nov-comprobado.md` (la tabla),
  `encargo-avisos.md` y las filas de avisos de `DECISIONES_TECNICAS_VIGENTES.md` (líneas 29, 34, 39, 40, 41 y 51).
- Leídos enteros `app/ui/nativo.entrada.js` (142 líneas) y `tests/aviso-entrada.spec.js` (6 pruebas, Android de
  mentira con `window.__nativo.llamadas`).
- `node_modules` del worktree: enlace (junction) al del proyecto, creado con `mklink /J`. Al quitar el worktree,
  primero `cmd /c rmdir node_modules` sin `/s`.

## Falta (el encargo entero, uno por commit, cada uno con su mutante)

1. Nº 3 y 12: en `paceEntradaPonerYa` (`nativo.entrada.js:83`), hoy es `cancel` de los siete → permiso → canal →
   `schedule`. Cambiar a: `schedule` primero (mismo id sustituye) y después `cancel` solo de los ids del 10 al 16
   que no están en la lista; firma de lo deseado (ids + hora + texto + canal + sonido) guardada, y si no cambió, no
   llamar al complemento. Ojo: la regla de la fila 34 dice que sin `avisoEntrada` booleano no se llama ni para quitar
   (android-nativo cuenta los `cancel`).
2. Nº 4: «Borrar todo» e importar quitan los ids 10-16 aunque el estado nuevo no traiga `avisoEntrada`
   (`app/tweaks/TweaksData.importar.jsx`, `usePaceTraerCopia`, y el borrado de Ajustes › Tus datos).
3. Nº 5: exacta como el Foco (`paceAndroidAvisoExacto` en `app/ui/android.avisos.js`).
4. Nº 6 y 7: dos campanadas (`pausa_aviso` en Android, `pausa-aviso.wav` en iOS) y canal mudo. `pace_entrada` ya
   existe SIN sonido en quien tiene la 0.206.0/0.207.0: hace falta un id nuevo para el sonoro (p. ej.
   `pace_entrada_campana`) y `pace_entrada_mudo` con importancia baja, como `pace_pausa_mudo`.
5. Nº 8: `app/ritmo/RitmoSemanaTipo.jsx` no mira lo que devuelve `paceEntradaEncender()`; copiar el patrón y los
   textos de la fila de avisos de `app/tweaks/TweaksPanel.jsx`.
6. Nº 9 y Nº 1: `MY_PACKAGE_REPLACED` en `LocalNotificationRestoreReceiver` con `tools:node="merge"` desde
   `android/app/src/main/AndroidManifest.xml`, y `scripts/verify.android.js` que lo vigile y que exija
   `SCHEDULE_EXACT_ALARM`, `POST_NOTIFICATIONS` y `RECEIVE_BOOT_COMPLETED` en el manifiesto del complemento.
7. Nº 10: de 0:00 a 4:00, contar también hoy si la hora de entrada aún no ha llegado (`paceEntradaAvisos`, el bucle
   empieza en `d = 1`).
8. Atajo «Foco» del icono (`app/main.jsx:96`): preguntar con el aviso de la barra de arriba al dejar una pausa.
9. Página «Montado» en `docs/proposals/avisos-novena-16nov/` y fila en las decisiones.

## Pendiente de la coordinadora

Los pasos «Solo se sabe en un móvil» de Fable (Android 14 del 1 al 9, iPhone del 1 al 5) **no están en el repo**:
solo en la conversación de la coordinadora (`local_ff76d287`). Hay que pedírselos o que los guarde en
`docs/audits/fable-15nov/externa-novena-16nov.md` antes de la página «Montado».
