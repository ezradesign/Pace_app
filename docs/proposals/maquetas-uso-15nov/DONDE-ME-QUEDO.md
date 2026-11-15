# Dónde me quedo (15 nov. 2026, uso de 5 h al 100 %)

Encargo de la coordinadora tras las letras de Ez («1A + 2A + 3A + 4B con la metodología de la 4A + 5A»).

## Hecho y subido
- **Paso 1, la 4 otra vuelta**: tres variantes pintadas y medidas (recomendada la A: «Gracias. Si no me dices por qué, no te la propondré durante una semana. Deshacer» + «¿Por qué? Aquí no podía · Difícil · Me molestó»). Página republicada con lo elegido marcado: https://claude.ai/artifact/U8L5AgXmWcbBrT8Tp7Zrx2 (commit df4a5530). **Espera la letra de Ez.**
- **5A, «la de antes»**: montada (`breakLaDeAntes` en `app/breakmenu/BreakMenu.support.jsx`, `BreakAntes` en `BreakMenu.ritmo.jsx`, fila en las dos ventanas, `break.antes` en es/en, censo i18n a 1193). `tests/pausa-la-de-antes.spec.js`: 4 en verde en el 8825; los dos mutantes (sin veto, función a null) caen. `verify` pasa. `index.html` compilado con la 5A.
- Las vecinas de la pausa se lanzaron con `--workers=1` en el 8825 (salida en el scratchpad de la sesión, `vecinas5.txt`): **el resultado no se llegó a leer**. Repetirlas.

## Escrito, SIN compilar ni probar
- **1A + 2A, el aviso a la hora de entrada**: `app/ui/nativo.entrada.js` (nuevo, cargado en `PACE.html` tras `nativo.js`), interruptor en `RitmoSemanaHoja` (`RitmoSemanaTipo.jsx`, solo nativo, guarda `ritmo.avisoEntrada`), textos `notify.entrada.*`, `notify.canal.entrada*`, `ritmo.st.aviso.*` (8 claves nuevas por idioma: **subir el censo a 1201**). Prueba: `tests/aviso-entrada.spec.js`.
- **3A, cada cuánto pregunta**: `feedbackToca` en `app/state-feedback.jsx`. Prueba: `tests/feedback-frecuencia.spec.js`.

## Lo que falta
1. `node build-standalone.js` (y `git checkout -- PACE_standalone.html`), `npm run verify` (subir el censo), las dos pruebas nuevas y sus mutantes (en sus cabeceras), y las vecinas con `--workers=1 PACE_E2E_PORT=8825`: pausa-*, ritmo-pausa*, feedback-una-semana, cierre-sin-pisar, eventos-emisor, logros-ocaso-buho, android-avisos, ios-avisos, ajustes-movil, bienvenida-*.
2. Filas arriba del todo en `docs/product/DECISIONES_TECNICAS_VIGENTES.md` para las tres reglas (la de antes, el aviso desde mañana, la frecuencia).
3. Sección «Montado» en la página con fotos de lo montado, y republicar.
4. Pasos para un Android y un iPhone de verdad (el aviso del sistema no se puede probar aquí): encender en «Tu semana», aceptar el permiso, cerrar PACE y ver que llega a la hora de entrada del día siguiente; abrir PACE antes de la hora y ver que ese día no llega; un día libre, nada.
5. La 4, cuando Ez dé su letra.
