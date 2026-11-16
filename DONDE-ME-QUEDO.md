# Dónde me quedo · avisos de la novena (16 nov. 2026, segunda parada)

Rama `claude/avisos-novena-16nov-cdf66e`, subida. Parada con el uso de 5 h al 98 % (vuelve a cero a las
00:40 del 17 nov., hora de Madrid). `verify` en verde en cada commit; mínimo de pruebas en 1638.

## Hecho (un commit por punto, cada uno con su prueba vista caer con mutantes)

| Commit | Punto | Pruebas (todas en `tests/aviso-entrada.spec.js`) |
|---|---|---|
| 3307969e | 1 · nº 3 y 12: programa primero, quita solo lo que sobra, firma en `pace.entrada.puesto` | 3 · 3 mutantes |
| 7fe474cf | 2 · nº 4: «Borrar todo» e importar quitan los ids 10-16 (`paceEntradaQuitar`) | 3 · 3 mutantes |
| 13033ba3 | 3 · nº 5: exacta con «Alarmas y recordatorios» | 2 · 2 mutantes |
| 484c1494 | 4 · nº 6 y 7: dos campanadas, `pace_entrada_campanas` / `pace_entrada_mudo`, `pace_entrada` borrado; iPhone `pausa-aviso.wav` | 5 · 4 mutantes + guardas en verify.android/ios |
| 481020c5 | 5 · nº 8: nota de Ajustes en «Tu semana»; el permiso se pide al encender | 2 · 3 mutantes |

Vecinas (android-nativo, android-avisos, pausa-aviso, aviso-no-pisa: 64) en verde tras el punto 1; importar-borrar,
copia-ida-vuelta e importar-licencia (18) tras el 2. **Falta repasar las vecinas al final** (las de arriba, más
`ios-nativo.safari.spec.js` y las de la barra de arriba), puerto 8875, `--workers=1`.

## Falta

6. Nº 9 y Nº 1: `MY_PACKAGE_REPLACED` en `LocalNotificationRestoreReceiver` con `tools:node="merge"` desde
   `android/app/src/main/AndroidManifest.xml`; `scripts/verify.android.js` lo vigila y exige
   `SCHEDULE_EXACT_ALARM`, `POST_NOTIFICATIONS` y `RECEIVE_BOOT_COMPLETED` en
   `node_modules/@capacitor/local-notifications/android/src/main/AndroidManifest.xml`.
7. Nº 10: `paceEntradaAvisos`, de 0:00 a 4:00 contar también hoy si la entrada no ha llegado (ids: 10 + índice
   en la ventana de 7).
8. Atajo «Foco» del icono (`app/main.jsx:96`, `?go=focus`): preguntar con el aviso de la barra de arriba
   (`topbar.pausa.*`) al dejar una pausa empezada.
9. Fila arriba en `DECISIONES_TECNICAS_VIGENTES.md` (y marcar lo que cambia de la fila del 15 nov. del aviso de
   entrada: ya no «quita los siete y pone», y el permiso se pide al encender). Página «Montado» en
   `docs/proposals/avisos-novena-16nov/` con los pasos de Fable para un móvil (Android 14 del 1 al 9, iPhone del
   1 al 5) **que no están en el repo**: pedírselos a la coordinadora. Publicarla e informe corto.

Herramienta de mutantes (en el scratchpad de esta sesión): aplica un cambio, compila, corre la prueba en el 8875
y lo deshace. El `node_modules` del worktree es un enlace: quitarlo con `rmdir` sin `/s`.
