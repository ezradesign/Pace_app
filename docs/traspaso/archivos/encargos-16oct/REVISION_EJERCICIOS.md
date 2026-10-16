# Encargo: revisar todos los ejercicios con la evidencia de hoy

16 oct. 2026. Lo pidió Ez: «repasar todos los ejercicios e investigar por internet para realizar los
programas de la manera física más recomendable, saludable y útil». Alcance elegido: **Mueve, Estira y
Respira** (las 53 rutinas). Va antes que el motor de la semana y que los días diseñados, que se
diseñan con lo que salga de aquí (`DECISIONES_PRODUCTO.md`, «Lo que hace bueno a PACE antes de
cobrar»).

## Para la sesión que lo haga

Eres la sesión `revision-ejercicios` de PACE. Trabajas en tu propio worktree y tu rama. No toques git
en la carpeta principal ni en otras de `.claude/worktrees/`.

Lee antes: `CLAUDE.md` (la tabla de los ids cruzados de Mueve y Estira), `STATE.md`, `CONTENT.md`,
`docs/product/BASE_MUEVE_ESTIRA.md` (el manual que gobierna Mueve y Estira), las memorias
`base_mueve_estira`, `feedback_realismo_ejercicios` y `breathe_content_sources`, y en
`docs/product/DECISIONES_TECNICAS_VIGENTES.md` las filas del runner guiado, de las duraciones y de
«LO QUE PROMETE EL TEXTO DE UN PASO LO DAN SUS DATOS». Los datos: Mueve en `app/move/move.data.js`
(ids `extra.*`), Estira en `app/extra/extra.data*.js` (ids `move.*`), Respira en
`app/breathe/BreatheLibrary.jsx` y sus fases en `app/breathe/BreatheVisual.jsx`; los textos en inglés
en `app/i18n/content/`.

1. **Investigar** con fuentes fiables y de hoy: OMS (actividad física y sedentarismo, 2020), NHS,
   ACSM, CDC, revisiones Cochrane y estudios sobre pausas activas y trabajo sentado (microdescansos,
   romper el tiempo sentado, dolor de cuello y espalda, muñecas), y para Respira las guías y estudios
   sobre respiración lenta, suspiro fisiológico, coherencia, hiperventilación y apnea (riesgos y
   contraindicaciones). Cita cada fuente con su enlace. Nada de copiar texto: se resume.
2. **Revisar cada rutina y cada paso**: técnica, repeticiones, segundos, ritmo, lados, descansos,
   orden, avisos de seguridad, si sirve de verdad a quien trabaja sentado y si cabe en una pausa de
   oficina (de pie o sentado, con o sin mesa, sin sudar). Para cada uno, un veredicto: mantener,
   ajustar (qué y por qué), cambiar o quitar. Usa `node scripts/audit/censo-promesas.js` y
   `tests/duraciones.spec.js` como punto de partida.
3. **Lo que falta**: qué ejercicios o rutinas recomendaría la evidencia y no están (por ejemplo,
   rutinas de pie para la tarde, el paseo corto que quedó fuera de las series).
4. **Una página para Ez** (Artifact; su visor no abre HTML de más de 512 KB): las fuentes, la tabla
   de veredictos y las propuestas agrupadas, con opciones y una recomendación. Pregúntale con
   AskUserQuestion. Lo de Respira con riesgo va con su aviso, como la apnea (CLAUDE.md: ningún consejo
   de salud sin aviso).
5. **Aplicar lo que elija Ez**, con explicaciones de 95 letras como mucho, en castellano e inglés, y
   pruebas: las duraciones y lo que promete cada paso siguen siendo verdad.
6. Cierre: `npm run verify`, `node build-standalone.js` y luego `git checkout -- PACE_standalone.html`,
   y la suite entera con tu puerto y `--workers=2`; lo que caiga, repítelo solo con `--workers=1`.
   Termina con «LISTO PARA MAIN: rama <rama>, commit <sha>», con CHANGELOG:, STATE: y DECISIONES: en
   el mensaje del commit. No subas a main ni hagas bump.

Reglas: mira `get_usage`; desde el 85 % del límite de 5 horas, commit «wip», push y
`.claude/relevo/RELEVO.md`; nada pasa del 95 %. Commits firmados por ezradesign, sin Co-Authored-By.
Habla con Ez en español sencillo y hazle las preguntas con opciones y una recomendación.
