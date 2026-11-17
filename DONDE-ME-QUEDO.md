# Dónde me quedo · avisos de la novena (16 nov. 2026): hecho, falta el «júntalo»

Rama `claude/avisos-novena-16nov-cdf66e`, subida. Parada con el uso de 5 h al 98 % (vuelve a cero a las
00:40 del 17 nov., hora de Madrid). `verify` en verde en cada commit; mínimo de pruebas en 1641.

## Hecho (un commit por punto, cada uno con su prueba vista caer con mutantes)

| Commit | Punto | Pruebas (todas en `tests/aviso-entrada.spec.js`) |
|---|---|---|
| 3307969e | 1 · nº 3 y 12: programa primero, quita solo lo que sobra, firma en `pace.entrada.puesto` | 3 · 3 mutantes |
| 7fe474cf | 2 · nº 4: «Borrar todo» e importar quitan los ids 10-16 (`paceEntradaQuitar`) | 3 · 3 mutantes |
| 13033ba3 | 3 · nº 5: exacta con «Alarmas y recordatorios» | 2 · 2 mutantes |
| 484c1494 | 4 · nº 6 y 7: dos campanadas, `pace_entrada_campanas` / `pace_entrada_mudo`, `pace_entrada` borrado; iPhone `pausa-aviso.wav` | 5 · 4 mutantes + guardas en verify.android/ios |
| 481020c5 | 5 · nº 8: nota de Ajustes en «Tu semana»; el permiso se pide al encender | 2 · 3 mutantes |
| 9356a66e | 6 · nº 9 y 1: MY_PACKAGE_REPLACED fundido en el receptor; verify.android exige los permisos del complemento | 6 mutantes de faltanEnComplemento/faltanEnPace |
| 27f48424 | 7 · nº 10: de 0:00 a 4:00 cuenta también hoy | 3 · 1 mutante |
| 420db758 | 8 · atajo «Foco» (`paceAtajoFoco`, TopBar.jsx): pregunta en la pausa del día | 3 en aro-modo-identidad · 2 mutantes |
| fce17918 | 9a · dos filas nuevas arriba en las decisiones; la del 15 nov. marcada | — |

Vecinas (android-nativo, android-avisos, pausa-aviso, aviso-no-pisa: 64) en verde tras el punto 1; importar-borrar,
copia-ida-vuelta e importar-licencia (18) tras el 2. **Falta repasar las vecinas al final** (las de arriba, más
`ios-nativo.safari.spec.js` y las de la barra de arriba), puerto 8875, `--workers=1`.

## Falta

Nada de lo encargado. Página «Montado» publicada: https://claude.ai/artifact/F1thKAvbpuoeykFZao125K
(`docs/proposals/avisos-novena-16nov/index.html`), con los pasos de Fable para un móvil puestos al día también en
`pasos-movil.md`. Queda el «júntalo» de Ez (la coordinadora) y probarlo en un móvil. Al juntar: `MINIMO_PRUEBAS`
1644 e `i18nClaves` 1219 en esta rama, a sumar con lo que traigan las otras.

Herramienta de mutantes (en el scratchpad de esta sesión): aplica un cambio, compila, corre la prueba en el 8875
y lo deshace. El `node_modules` del worktree es un enlace: quitarlo con `rmdir` sin `/s`.
