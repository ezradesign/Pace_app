# Prompt para la sesión coordinadora en la cuenta nueva (8 oct. 2026, noche)

Pégalo entero en una sesión nueva de Claude Code abierta en la carpeta del repo. Solo UNA sesión
hace de coordinadora.

---

Retoma el proyecto PACE (repo ezradesign/Pace_app, en esta carpeta) como **sesión coordinadora**.
Vengo de otra cuenta de Claude que se quedó sin sesión a mitad de trabajo. Háblame en español, en
frases completas y sin jerga.

1. **Contexto.** Lee CLAUDE.md, STATE.md y docs/traspaso/LEEME.md, sobre todo «Relevo de la noche
   del 8 oct.» y «Al cerrar la nube». Las reglas de trabajo en paralelo están en docs/WORKFLOW.md §9.
   Antes de tocar un subsistema, busca su fila en docs/product/DECISIONES_TECNICAS_VIGENTES.md.
2. **Comprueba main.** Va por v0.150.1 («Cuídate» en serif itálica). Se subió con `verify` y sus
   pruebas en verde, pero la suite local entera no llegó a terminar. Mira la CI
   (`gh run list --branch main`). Si algo sale rojo, arréglalo antes que nada y dime qué era. Para
   la suite local usa siempre `PACE_E2E_PORT=8775` (u otro libre): la suite se para sola si el
   puerto lo sirve otra carpeta.
3. **Las ramas en paralelo.** Cada una deja en su último commit un bloque `TRASPASO:` con lo hecho,
   lo que falta y el siguiente paso (`git fetch` y `git log -1 origin/<rama>`):
   - `claude/caza-bugs-final`: monta las nueve respuestas que di sobre la caza de bugs (resumidas en
     LEEME, línea de `claude/caza-bugs-propuestas`), con una prueba por arreglo, y me enseña en
     fotos lo nuevo antes de subir.
   - `claude/pausa-elegante`: página con opciones para una pausa más elegante (en la pausa solo se
     enseñan Intro y Esc, sin letras de atajo).
   - `claude/sidebar-propuesta`: la barra lateral. La segunda vuelta ya está en main. Me falta
     elegir; ya dije: barras de minutos mucho más elegantes, el pie en texto y la racha de vuelta.
   - `claude/respira-drones-por-tecnica` (encima de `claude/respira-musica-drones`): drones por
     técnica, terminados. Te diré qué elijo cuando los escuche.
   Para lo que quedó a medias, **prepárame una sesión en paralelo por rama** (un encargo con
   `spawn_task`, o el texto para pegarlo), cada una en su rama y con su puerto. Solo tú subes a
   main: cuando una diga «LISTO PARA MAIN», la juntas, pones la versión, construyes, pasas la suite
   entera y vigilas la CI.
4. **Cómo guiarme.** Hazme las preguntas con opciones y una recomendación (AskUserQuestion). No me
   repitas lo que ya estoy contestando en una sesión en paralelo. Nada visible se implementa sin
   que lo vea antes en fotos de la app real. Nada de scroll en la home. Commits sin
   «Co-Authored-By», directos a main y con el porqué en el mensaje.
5. **Lo que espera mi respuesta, sin sesión propia:** los ids de Google y Microsoft del calendario,
   la llave y la lista de testers para los códigos, y la propuesta de textos de logros, si la
   conservo.
6. **Ojo:** las páginas publicadas como artefactos (drones, barra lateral, motor de la semana) son
   de la cuenta anterior. Desde aquí no puedes leer lo que marque en ellas: te lo diré yo con
   palabras.

Empieza diciéndome en pocas líneas dónde estamos, qué espera mi respuesta y qué harías ahora.
