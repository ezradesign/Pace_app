# Caza de bugs del 7 de octubre: hallazgos SIN VERIFICAR

Una búsqueda en paralelo por las áreas que nadie había revisado: el modo oscuro, la app en inglés y
Respira con Hidrátate. Los tres buscadores terminaron y dejaron 37 hallazgos con sus pasos. **Los
verificadores no llegaron a correr** (la cuenta se quedó sin cuota), y Foco y el estado guardado no
se llegaron a buscar. Así que esto es una lista de sospechas con pruebas, no de bugs confirmados.

Cómo usarla desde otra cuenta:

1. Antes de arreglar uno, reprodúcelo con sus pasos en el `index.html` actual (`git pull` primero:
   puede que otro hilo ya lo haya tocado).
2. Si no se reproduce, táchalo aquí con una línea que diga por qué.
3. Si se reproduce, arréglalo con su prueba (regla de `CLAUDE.md`) y táchalo con la versión.
4. Los de la app en inglés de severidad baja son de copy: enséñaselos a Ez en bloque antes de tocarlos.

**Estado el 8 de octubre.** Se han reproducido todos los que no llevaban otras sesiones (respira-1, 2 y 3,
oscuro-1 y 4): ninguno se tacha por no reproducirse. Los que no cambian lo que se ve están tachados aquí
abajo, arreglados en `claude/caza-7oct-arreglos`. Los que sí lo cambian (oscuro-2, 3, 5 y 6; ingles-1, 3,
4, 5, 7, 8, 10, 11, 12, 14, 15 y 16; respira-5, 6, 9, 10 y 14) están montados en
`claude/caza-bugs-propuestas` y esperan el sí de Ez a una página de antes y después. Quedan como
preguntas a Ez, sin montar: ingles-2 (la voz en castellano), ingles-6 (pestaña y PWA), ingles-13 (atajos),
ingles-17 (horas y meses), respira-12 (los aros de «Pulso» y «Ondas») y respira-13 (minutos de las rondas).

Por gravedad: **alta** es que algo no funciona o es inseguro; **media**, que se ve mal o confunde;
**baja**, pulido.

## La app en inglés
**Qué se recorrió:** Recorrí con lang 'en', langAuto false, en el index.html servido en :8765, a 360x718 y a 1280x720. Algunas medidas sueltas, también a 375, 390 y 412.

**Pantallas que sí miré:**
- Home, con y sin «A tu ritmo» sembrado (Start the day, aro «Block 1 of 9», «Until 17:00»). Foco: Other con el mínimo de 5, modos Pause y Long, en marcha y en pausa.
- Menú de pausa: el normal y el de A tu ritmo, con «Go on to block 2».
- Hidrátate de 0 a 9 vasos.
- Estadísticas Week, Month y Year, vacías y con datos reales (1 vaso y 2 min de Respira), con tooltips y aria-labels.
- Logros: la colección entera y el aviso de logro.
- Ajustes: secciones, sonido encendido y el confirm de borrar.
- Sidebar en móvil y en escritorio.
- Bienvenida.
- Las tres bibliotecas con sus filtros y avisos de grupo vacío. Previews de Desk Push-ups, Neck y Wall Sit.
- Modales de seguridad de las 5 técnicas con apnea.
- Sesiones completas: Physiological Sigh hasta el cierre y Express Rounds hasta la retención. Desk Push-ups y Neck (lados) hasta el cierre, solo el texto. Medí las etiquetas de fase largas de Respira.
- Modal de apoyo, Your routines, My routines, enlaces ?go= y document.lang/title.

**Comprobaciones estáticas:**
- Las 750 claves es/en cuadran.
- Ningún nombre, paso ni instrucción de rutina sin clave EN.
- Todas las fases de Respira tienen PHASE_KEYS.

**Lo que no miré:**
- Modo oscuro en inglés.
- Android/APK y los avisos del sistema reales (solo leí las cadenas notify.*).
- Calendario y el panel de A tu ritmo por dentro (fuera de alcance).
- Caminos (ocultos).
- Importar una copia.
- El layout del runner (fuera de alcance).

**Avisos:**
- Mientras trabajaba, otro hilo recompiló index.html (12:01 y 12:06) con cambios del runner. Volví a comprobar en el build final los hallazgos 1, 4 y 6.
- En localhost la consola se llena de avisos solo de desarrollo («[i18n] missing key: …instruction.setup» por cada render de pasos sin setup). No los cuento como defecto porque en producción no salen.
- Dejo fuera, por no ser de idioma, tres cosas que vi:
  - El aviso de logro tapa «Skip this break».
  - Escape no cierra la sidebar del móvil.
  - El atajo de la PWA «Mueve» se describe como «biblioteca de movilidad».

Scripts, volcados y capturas en /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/.

### [media] ingles-1 · El modal de seguridad de Respira pone el nombre de la rutina en castellano
- **Dónde:** 360x718 y 1280x720
- **Pasos:** lang 'en'. Home > Breathe > pulsar «Express Rounds» (o «Full Round Breathing», «Deep Rounds»).
- **Debería:** El modal «Before you start» se titula «Express Rounds», como la tarjeta de la biblioteca y la cabecera de la sesión.
- **Pasa:** El título del modal es «Rondas express». Con «Full Round Breathing» sale «Respiración en rondas» y con «Deep Rounds», «Rondas profundas». El resto del modal está en inglés. Lo he vuelto a comprobar en el build de las 12:06.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/br-safety-360.png; recheck2.js (en la misma carpeta) → «Express Rounds => Rondas express», «Full Round Breathing => Respiración en rondas», «Deep Rounds => Rondas profundas»
- **Código sospechoso:** app/breathe/BreatheLibrary.jsx:133 pinta `{routine.name}` en bruto, sin el `tR(routine.id + '.name', …)` que usan RoutineCard y BreatheSession.jsx:19

### [media] ingles-2 · Con la app en inglés, la voz de Respira dice «inhala / mantén / exhala» en castellano
- **Dónde:** 1280x720 (no depende del viewport)
- **Pasos:** Semilla con lang 'en' y soundOn true (voiceOn viene a true por defecto y en Ajustes sale marcado «Clear voice»). Breathe > Box 4·4·4·4 > Start now. Escuchar las fases.
- **Debería:** En inglés: o hay locuciones en inglés, o se usa el tono, o la opción de voz avisa de que solo existe en castellano.
- **Pasa:** Se cargan y se reproducen sulafat-inhala.mp3, sulafat-manten.mp3 y sulafat-exhala.mp3, así que la persona oye palabras en castellano con toda la interfaz en inglés. Ajustes ofrece «Tone · Clear voice · Deep voice» sin decir que la voz es en castellano.
- **Prueba:** voz.js (misma carpeta): state {lang:'en', soundOn:true, voiceOn:true, voice:'sulafat'}; plays ['sulafat-manten.mp3','sulafat-exhala.mp3','sulafat-manten.mp3']; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/settings-360-full.png («Clear voice» marcado por defecto)
- **Código sospechoso:** app/ui/Sound.voz.jsx:103-114 (PACE_VOZ_CLIPS, solo en castellano) y paceVozCabe, línea 187: no mira state.lang. app/breathe/voz/ solo tiene archivos *-inhala/manten/exhala.mp3

### [media] ingles-3 · En inglés hay dos botones «Pause»: el de la barra de arriba descarta el bloque de Foco en marcha
- **Dónde:** 1280x720 (la pastilla Focus/Pause/Long solo sale en escritorio)
- **Pasos:** lang 'en'. Start focus y dejar correr 5 min. Arriba hay «FOCUS · PAUSE · LONG» y en el aro el botón «Pause». Pulsar el «PAUSE» de arriba creyendo que pausa.
- **Debería:** Etiquetas que no se confundan. En castellano son «Pausa» (modo) y «Pausar» (acción). El inglés debería usar «Break» / «Long break» para los modos, como ya hace el aro («Short break», «Start break»).
- **Pasa:** Los dos se llaman «Pause». El de arriba cambia al modo pausa sin confirmar: el aro pasa de 20:00 restantes a 05:00 «Short break» y el bloque que iba por la mitad se pierde.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/focus-running-1280.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/pausemode-after-1280.png; pausemode.js: «buttons named Pause: 2» · before 20:00 → after {num:'05:00', label:'Short break'}
- **Código sospechoso:** app/i18n/strings/ui.js:266 'topbar.mode.pause': 'Pause' frente a app/i18n/strings/sessions.js:242 'focus.pause': 'Pause'; pestaña en app/main/TopBar.jsx:33

### [media] ingles-4 · La cabecera de varias sesiones de Estira muestra etiquetas internas (SIT, HIP, SHLD, ATG, ANC)
- **Dónde:** 360x718 y 1280x720
- **Pasos:** lang 'en'. Stretch > Neck > Start. Mirar el antetítulo de la cabecera, encima de «Neck». Probar también Hips y Shoulders.
- **Debería:** Una categoría legible, como en castellano («CUELLO», «CADERAS», «HOMBROS») y como en el resto de rutinas inglesas («Hamstrings», «Calves», «Energy»).
- **Pasa:** «SIT | Neck», «HIP | Hips», «SHLD | Shoulders». Pasa en 7 rutinas: Chair Antidote, Neck y Desk Express (SIT), Hips (HIP), Shoulders (SHLD), ATG (ATG) y Ancestral (ANC). La misma etiqueta sin explicar sale en el logro «The full antidote: 50 SIT sessions», aunque ese también está así en castellano.
- **Prueba:** es-neck.js: es Cuello => «CUELLO | Cuello» · en Neck => «SIT | Neck» · en Hips => «HIP | Hips» · en Shoulders => «SHLD | Shoulders»; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/hdr-en-Neck.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/hdr-es-Cuello.png
- **Código sospechoso:** app/i18n/content/extra.js: 'move.chair.antidote.code' (l.21), 'move.hips.5.code' (l.69), 'move.shoulders.5.code' (l.91), 'move.atg.knees.code' (l.113), 'move.ancestral.code' (l.127), 'move.neck.3.code' (l.141) y 'move.desk.quick.code' (l.161) llevan el `tag` en vez de traducir el `code` castellano. Se pinta en SessionHeader (app/ui/SessionShell.jsx:283)

### [media] ingles-5 · Estadísticas › Año: «1 days with rhythm · max streak: 1 days»
- **Dónde:** 1280x720 (igual en 360)
- **Pasos:** lang 'en'. Hacer cualquier actividad hoy (un vaso de agua y un Physiological Sigh) > icono de estadísticas > Year.
- **Debería:** «1 day with rhythm · max streak: 1 day».
- **Pasa:** El pie dice «1 days with rhythm · max streak: 1 days». Es lo primero que ve cualquiera el primer día con datos. En castellano pasa lo mismo («1 días»).
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/stats1-Year-1280.png
- **Código sospechoso:** app/stats/YearView.jsx:327 y :329 usan t('stats.year.activeDays' / 'stats.year.maxStreak').replace('{n}', …) sin variante para 1 (cadenas en app/i18n/strings/stats.js)

### [media] ingles-6 · El html sigue con lang="es" y la pestaña, el manifiesto y los atajos de la PWA siguen en castellano con la app en inglés
- **En parte, en v0.148.2:** `<html lang>` sigue al idioma al arrancar y al cambiarlo (`tests/idioma-documento.spec.js`). El título de la pestaña y el manifiesto de la PWA cambian lo que se ve y esperan a Ez.
- **Dónde:** todos
- **Pasos:** lang 'en' (o cambiar a English en Ajustes). Leer document.documentElement.lang y document.title. Instalar la PWA o mirar manifest.webmanifest.
- **Debería:** <html lang="en"> mientras la interfaz va en inglés, para que el lector de pantalla pronuncie en inglés y Chrome no ofrezca «traducir del español». Título de pestaña neutro o traducido.
- **Pasa:** lang sigue en 'es' al arrancar en inglés y también después de cambiar de idioma en vivo. La pestaña dice «PACE · Foco · Cuerpo — v0.143.4». Al instalar la PWA, el nombre «PACE · Foco · Cuerpo» y los atajos «Foco / Respira / Mueve / Hidrátate» salen en castellano.
- **Prueba:** htmllang.js: home {lang:'es', title:'PACE · Foco · Cuerpo — v0.143.4'} · after-switch-en {lang:'es', …}; index.html:2 <html lang="es"> · index.html:6 <title>; manifest.webmanifest:3-6 y 24-43
- **Código sospechoso:** Nadie escribe en document.documentElement.lang ni en document.title (grep vacío en app/); el lang solo vive en el estado (app/state-core.jsx:277-285)

### [baja] ingles-7 · «1 glasses» en Estadísticas: semana, total del mes y tooltip del día
- **Dónde:** 1280x720 y 360x718
- **Pasos:** lang 'en'. Hydrate > One more glass (1 vaso). Estadísticas: tarjeta Hydrate de Week, línea de totales de Month y tooltip del día 7 en Month.
- **Debería:** «1 glass».
- **Pasa:** La semana dice «1 / glasses», la línea del mes «… · 1 glasses» y el tooltip «Wed, 7 Oct · 2 min breathe, 1 glasses».
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/stats1-week-1280.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/month-tooltip-1280.png; walk8.js: tooltip month ['Wed, 7 Oct · 2 min breathe, 1 glasses']
- **Código sospechoso:** app/stats/StatsPanel.jsx:33 (unit fijo t('stats.unit.glasses')), :277 y :292 (tooltip) y :375 (total del mes)

### [baja] ingles-8 · Tooltip en castellano en «I donated →» del modal de apoyo
- **Dónde:** 1280x720 (hover en escritorio)
- **Pasos:** lang 'en'. Sidebar > Feed the cow > pasar el ratón por «I donated →».
- **Debería:** Tooltip en inglés.
- **Pasa:** title="Marca un sello privado — confía en ti".
- **Prueba:** walk12.js, volcado support-1280: @title "Marca un sello privado — confía en ti"; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/support-1280.png
- **Código sospechoso:** app/support/SupportModule.jsx:266, title escrito a mano sin t()

### ~~[baja] ingles-9 · Las flechas de Estadísticas › Mes y › Año se anuncian en castellano~~
- **Arreglado en v0.148.2.** Las cuatro flechas leen su etiqueta de `stats.month.prev/next` y `stats.year.prev/next` (`tests/idioma-documento.spec.js`).
- **Dónde:** todos (lector de pantalla)
- **Pasos:** lang 'en'. Estadísticas > Month / Year. Leer el aria-label de ‹ y ›.
- **Debería:** «Previous month / Next month», «Previous year / Next year».
- **Pasa:** aria-label «Mes anterior», «Mes siguiente», «Año anterior» y «Año siguiente».
- **Prueba:** walk1.js 1280: ES? "Mes anterior" BUTTON@aria-label, "Año anterior" BUTTON@aria-label; walk8.js: month aria ['Close','Mes anterior','Mes siguiente','Wed, 7 Oct']
- **Código sospechoso:** app/stats/StatsPanel.jsx:321 y :327; app/stats/YearView.jsx:189 y :194

### [baja] ingles-10 · El titular de la bienvenida en inglés parte «At your / own pace.» en dos líneas
- **Dónde:** 360x718, 375x667, 390x844, 412x915 y 1280x720
- **Pasos:** Semilla sin firstSeen y con lang 'en'. Mirar el h1 de la bienvenida.
- **Debería:** «At your own pace.» entera en su línea, como el castellano, que a 360 cabe en una sola («Antídoto a la silla. A tu ritmo.»).
- **Pasa:** Línea 1: «Antidote to the chair. At your». Línea 2: «own pace.». A 412 queda «pace.» sola. Pasa también a 1280, con 460 px de ancho de columna.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/welcome-en-1280.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/welcome1-360.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/welcome-es-360.png; welcome-es.js: rects de líneas por viewport
- **Código sospechoso:** app/onboarding/Onboarding.jsx:155-158: el span de 'welcome.tagline.sub' no lleva white-space:nowrap ni salto propio (cadena en app/i18n/strings/ui.js:169)

### [baja] ingles-11 · La propuesta de la pausa dice «You have not breathed today»
- **Dónde:** todos
- **Pasos:** lang 'en'. Terminar un Foco cuando ya hay estiramiento y movimiento hoy pero ninguna sesión de Respira. La tarjeta propuesta lleva el motivo de la clave break.prop.pending.breathe.
- **Debería:** Algo como «No breathing session yet today».
- **Pasa:** «You have not breathed today», que en inglés se lee literal («hoy no has respirado»). Es el mismo patrón que «You have not stretched today», que sí vi en pantalla.
- **Prueba:** app/i18n/strings/breakmenu.js:64; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/break-360.png (variante «You have not stretched today» del mismo bloque)
- **Código sospechoso:** app/i18n/strings/breakmenu.js:64

### [baja] ingles-12 · Pausa de «A tu ritmo»: «9:45 · what the menu had for now.» es una traducción literal
- **Dónde:** 360x718 y 1280x720
- **Pasos:** lang 'en', día de A tu ritmo sembrado (como en ritmo-pausa.spec). Start the day y dejar acabar el bloque 1.
- **Debería:** Inglés natural, por ejemplo «9:45 · what's on the menu now».
- **Pasa:** «9:45 · what the menu had for now.»
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/ritmo-break-1280.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/ritmo-break-360.png
- **Código sospechoso:** app/i18n/strings/breakmenu.js:72 'break.ritmo.sub'

### [baja] ingles-13 · Los atajos de teclado anunciados en inglés usan las iniciales castellanas
- **Dónde:** 1280x720
- **Pasos:** lang 'en'. Terminar un Foco: la pausa dice «Shortcut: B · E · M · H · Esc». Pasar el ratón por los iconos de arriba: «Achievements (L)», «Settings (T)».
- **Debería:** Letras que se entiendan en inglés, o la letra junto a cada tarjeta.
- **Pasa:** E abre Stretch (de «Estira»), L abre Achievements (de «Logros») y T abre Settings. Las tarjetas no dicen qué letra es de cada una, así que en inglés la E y la L no se pueden adivinar.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/break-1280.png; app/breakmenu/BreakMenu.jsx:81-84 (b→breathe, e→extra/Stretch, m→move, h→water)
- **Código sospechoso:** app/i18n/strings/breakmenu.js:68; app/i18n/strings/ui.js:270 y :272

### [baja] ingles-14 · Cuatro nombres en inglés para lo mismo: achievements, badge, seal y stamps
- **Dónde:** todos
- **Pasos:** lang 'en'. Sidebar: «Latest badge». Al ganar uno, aviso «New seal». Colección: título «Achievements», subtítulo «Field notebook stamps…», logros «Forty-five seals». Apoyo: «✦ thanks · badge saved».
- **Debería:** Una sola palabra para el objeto, como el castellano, que usa «sello» y «logro».
- **Pasa:** En la misma sesión conviven badge, seal, stamp y achievement.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/break-360.png (toast «New seal»); /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/home-1280.png («Latest badge»); /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/ach-1280.png («stamps»)
- **Código sospechoso:** app/i18n/strings/ui.js:252 y :200; app/i18n/strings/achievements.js:31 y :44

### [baja] ingles-15 · El cierre de sesión pregunta «Did this pause help?» y el resto del inglés llama «break» a la pausa
- **Dónde:** 360x718
- **Pasos:** lang 'en'. Terminar cualquier sesión (Physiological Sigh, Desk Push-ups, Neck) y mirar la pregunta de feedback.
- **Debería:** «Did this break help?», en línea con «Well-earned break», «Skip this break» y «Short break».
- **Pasa:** «Did this pause help?»
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/br-PhysiologicalSigh-end-360.png
- **Código sospechoso:** app/i18n/strings/sessions.js:303

### [baja] ingles-16 · El aviso de grupo vacío en la biblioteca dice «All 2 in flows need the floor.»
- **Dónde:** 360x718
- **Pasos:** lang 'en'. Stretch > filtro «Right here» (o «≤ 4 min»): el grupo Flows queda vacío. Move > «No gear»: Push & Pull y Legs.
- **Debería:** Inglés natural, por ejemplo «Both routines in Flows need the floor.» o «All 4 Push & Pull routines…».
- **Pasa:** «All 2 in flows need the floor. clear the filter», «All 4 in push & pull fall outside this filter.» y «All 3 in energy fall outside this filter.» «All 2» no se dice en inglés, y el nombre del grupo pasado a minúsculas suena raro.
- **Prueba:** filt.js (misma carpeta): textos de cada filtro; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/filt-Move-No_gear.png
- **Código sospechoso:** app/i18n/strings/sessions.body.js:223-227; app/ui/LibraryShell.jsx:166-167 (g: label.toLowerCase())

### [baja] ingles-17 · Horas y fechas con formatos mezclados en inglés: «7am / 9pm / 11pm» frente a 24 h, y «Sept» frente a «Sep»
- **Dónde:** todos
- **Pasos:** lang 'en'. Logros > The day: «Five days with a session before 7am», «after 9pm», «30 days with no use after 11pm». En el resto de la app: «Until 17:00», «From 10:00 to 13:00», «9:45». Con fecha de septiembre: sidebar «Fri 18 Sept» y cabecera del año en Stats «Sep».
- **Debería:** Un solo formato de hora (24 h, como el resto) y una sola abreviatura de mes.
- **Pasa:** Conviven el formato de 12 h y el de 24 h, y «Sept» con «Sep».
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/ingles/ach-360.json; walk13.js 1280: «Fri 18 Sept»; stats1-Year-1280: «Sep»
- **Código sospechoso:** app/i18n/content/achievements.js:156-164; app/shell/Sidebar.jsx:326-328 (toLocaleDateString en-GB, month:'short' → «Sept») frente a 'stats.year.months.short' en app/i18n/strings/stats.js

## Modo oscuro
**Qué se recorrió:** Lo he recorrido en paleta 'oscuro' a 360x718 y a 1280x720, con capturas (Read) y con un escáner de contraste que compone el alfa y la opacidad de los ancestros. Para separar lo propio del oscuro, cada pantalla la he medido también en crema y he comparado una con otra. Lo recorrido: home por libre y con «¿Cuánto trabajas hoy?» abierto; panel lateral de escritorio y de móvil; Foco en marcha, en pausa y al acabar un bloque, con el menú de pausa y el aviso «Nuevo sello»; Hidrátate vacío y con 3 vasos; Estadísticas en Semana, Mes y Año, con la leyenda del mapa anual medida en píxeles; Logros sin nada y con los 95 desbloqueados, glifo a glifo; Ajustes de arriba abajo, con las filas atenuadas sin sonido y el diálogo «Borrar todos mis datos»; la bienvenida sin firstSeen y en oscuro, que es crema a propósito por la regla de las ilustraciones; las tres bibliotecas con sus filtros, la vista previa de Mueve y de Estira y el aviso de apnea; una sesión de Respira entera (Box 4·4·4·4: preparación, fases, pausa y fin con «¿Te ayudó esta pausa?»); la preparación y el primer paso de Mueve y Estira, solo por color; «Da de pastar a la vaca», «Mis rutinas» (constructor) y «Para ahora»; los estados hover y foco recorridos con Tab; el cambio en caliente de crema a oscuro comparado con una carga directa, sin piezas que se queden atrás; y los <select> nativos, abiertos de verdad con Chromium con ventana bajo Xvfb. No hay errores de consola en ninguno de los recorridos. En general el oscuro sale mejor que el crema (--ink-3 en crema da 3,23:1), así que he descartado lo que falla igual o peor en crema; lo único así que he dejado es oscuro-5, avisado. Lo que no he mirado: no existe un «detalle de logro» aparte, el sello solo lleva un title nativo y no se puede estilar; tampoco he mirado el inglés, ni los viewports 375x667 y 1530x702 (los defectos hallados no dependen del ancho), ni el selector nativo de Android ni la barra de estado real del móvil (oscuro-3 está medido en el DOM, no fotografiado), ni el aviso de actualización ni la red de error, que no he sabido provocar. Fuera de alcance, y no lo he reportado: la maqueta del runner, el panel de A tu ritmo por dentro, los glifos y el zoom. Visto de pasada y no reportado, porque no es de oscuro: a 360 el aviso «Nuevo sello» tapa unos segundos «Saltar esta pausa» del menú de pausa; en el mapa anual el nivel 1 no se distingue de un día vacío en ninguna paleta; y «Mis rutinas» de la barra lateral abre el constructor aunque STATE.md lo da por cerrado. Scripts, capturas y medidas en /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/.

### ~~[alta] oscuro-1 · El desplegable de horas de «¿Cuánto trabajas hoy?» sale blanco con el texto crema: no se leen las horas~~
**Arreglado en v0.147.0.** Reproducido en la pregunta y en el día servido, a 360 y a 1280. Con solo `color-scheme: dark` seguía blanca. Ez eligió que la lista la dibuje PACE en las dos paletas (`appearance: base-select` en `.pace-rt-sel`); donde el navegador no lo admite, las horas llevan papel y tinta. Lo vigila `tests/oscuro-controles.spec.js`.

- **Dónde:** 1280x720 en Chromium de escritorio (también a 360 de ancho en un navegador de escritorio; no he podido probar el selector nativo de Android)
- **Pasos:** 1) Paleta 'oscuro', sembrando ritmo:{libre:true}. 2) A 1280 pulsa «Ajustar el horario» en la tarjeta «¿Cuánto trabajas hoy?»; a 360 pulsa «Comienza». 3) Pulsa la hora de «Empiezas a las 9:00» o cualquier otro <select> de la frase.
- **Debería:** La lista de horas se lee sobre el papel oscuro, o por lo menos con texto oscuro sobre blanco.
- **Pasa:** La lista emergente nativa sale con fondo blanco #FFFFFF y las opciones en #EDE5D3 (--ink oscuro), con un contraste de 1,25:1. Solo se lee la opción resaltada en azul. En crema la misma lista va en tinta sobre blanco y se lee bien. Lo he medido con Chromium con ventana bajo Xvfb, porque la lista es un widget aparte que no sale en las capturas sin ventana. En el DOM: select y option con color rgb(237,229,211), fondo transparente y color-scheme 'normal'. Si se inyecta `.pace-rt-sel option{background-color:var(--paper);color:var(--ink)}` la lista se lee. Con solo `color-scheme: dark` en [data-palette=oscuro] seguía blanca en este Chromium.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/select-popup-oscuro.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/select-popup-oscuro-zoom.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/select-popup-crema-zoom.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/select-popup-oscuro-fix2-zoom.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/select-donde-360.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/select.js
- **Código sospechoso:** app/ritmo/ritmo.css.jsx:111-114 (`.pace-rt-sel { color: var(--ink); background: transparent ... }` sin reglas para `option`). La misma clase la usa el <select> de calendario en app/ritmo/RitmoCalendario.jsx:105. Además ninguna hoja declara `color-scheme` para la paleta oscura.

### [media] oscuro-2 · El número de un filtro activo de las bibliotecas desaparece en oscuro (crema sobre crema)
- **Dónde:** 360x718 y 1280x720
- **Pasos:** 1) Paleta 'oscuro'. 2) Abre Respira, Mueve o Estira. 3) Pulsa un filtro: «≤ 5 min», «Aquí mismo» o «Sin material».
- **Debería:** El filtro activo sigue mostrando cuántas rutinas quedan, como en crema («≤ 5 min 9»).
- **Pasa:** El filtro activo se pinta con fondo var(--ink), que en oscuro es claro (#EDE5D3), pero el número lleva un crema fijo rgba(242,237,224,.7). Queda #f1ebdc sobre #ede5d3, un contraste de 1,05:1, y el 9, el 11 o el 8 dejan de verse. Medido en las tres bibliotecas y en los dos tamaños. En crema el fondo es tinta oscura y el número se lee.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/chip-Mueve-360.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/chip-Respira-1280.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/chip-full-Estira-360.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/chip.js
- **Código sospechoso:** app/ui/library.css.jsx:91 `.pace-lib-chip[aria-pressed="true"] b { color: rgba(242, 237, 224, .7); }`: el color está escrito a mano y debería salir de var(--paper), por ejemplo con color-mix al 70 %.

### [media] oscuro-3 · La barra del navegador o de la PWA sigue en crema con la paleta oscura (theme-color fijo)
- **Dónde:** 360x718 (móvil web o PWA instalada)
- **Pasos:** 1) Paleta 'oscuro' elegida a mano, o 'Auto' con el sistema en oscuro (lo he emulado con colorScheme 'dark' y paletteAuto:true). 2) Carga index.html y mira meta[name=theme-color].
- **Debería:** El color de la barra del navegador o de la PWA sigue al papel de la paleta activa, #1d1a14 en oscuro. En Android nativo ya lo hace values-night.
- **Pasa:** Sale un único `<meta name="theme-color" content="#F2EDE0">`, sin variante por media, y ningún código lo cambia: ni grep encuentra theme-color en app/ ni el DOM cambia con la paleta. El manifiesto también fija theme_color y background_color a #F2EDE0. En Chrome Android y en la PWA instalada eso deja una franja crema encima de una app #1d1a14. Medido en el DOM: palette=oscuro, --paper rgb(29,26,20) y meta '#F2EDE0'. La barra del navegador no se puede fotografiar desde Playwright.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/meta.js
- **Código sospechoso:** index.html:11 (meta theme-color fijo, viene de PACE.html), manifest.webmanifest (theme_color y background_color a #F2EDE0) y applyTheme en app/state-core.palette.jsx, que no actualiza el meta. La nota de android/app/src/main/res/values-night/pace_colores.xml solo cubre Android nativo.

### ~~[baja] oscuro-4 · La casilla del aviso de apnea es un cuadrado blanco nativo y se vuelve azul de Chrome al marcarla~~
**Arreglado en v0.147.0** (Ez, en la misma tanda que oscuro-1): en oscuro las casillas van con `color-scheme: dark` (`tokens.css`) y la del aviso lleva `accent-color: var(--focus-cta)`. Lo vigila `tests/oscuro-controles.spec.js`.

- **Dónde:** 360x718 y 1280x720
- **Pasos:** 1) Paleta 'oscuro'. 2) Respira → «Rondas express», o cualquier rutina con ⚠. 3) Mira la casilla «Lo he leído y asumo mi responsabilidad» antes y después de marcarla.
- **Debería:** Una casilla en la paleta: borde y relleno de tokens o accent-color, como la de «Tener en cuenta mis reuniones», que ya usa accent-color: var(--focus-cta).
- **Pasa:** Desmarcada es un cuadrado blanco puro sobre la tarjeta #26211a, la única pieza blanca de la pantalla. Marcada lleva el azul por defecto de Chromium, fuera de la paleta tierra. En el DOM: accent-color 'auto' y color-scheme 'normal'.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/apnea-check-oscuro-off.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/apnea-check-oscuro-on.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/s-respiraApnea-360.png
- **Código sospechoso:** app/breathe/BreatheLibrary.jsx:157 (`<input type="checkbox">` sin accent-color). Comparar con app/ritmo/ritmo.css.jsx:328.

### [baja] oscuro-5 · --premium no tiene valor para oscuro: el sello «Premium» y los «Premium», «Tus rutinas» y «Pronto» bronce quedan por debajo de 4,5:1
- **Dónde:** 1280x720 (sello de la barra lateral) y 360x718 / 1280x720 (bibliotecas)
- **Pasos:** 1) Paleta 'oscuro'. 2) Mira el sello PREMIUM de «Mis rutinas» en la barra lateral a 1280 o en el panel a 360. 3) Abre Respira o Mueve y mira el «· Premium» de las tarjetas y el «Tus rutinas» o «Pronto» de Mueve y Estira.
- **Debería:** Un bronce subido para el papel oscuro, como se hizo con --focus y --breathe, con al menos 4,5:1 en un texto de 10 a 15 px.
- **Pasa:** El sello PREMIUM (10 px, mayúsculas) da #9c6b2e sobre #41321f, 2,69:1. El «Premium» de las tarjetas (15 px en cursiva) da 3,47:1 sobre #26211a, y «Tus rutinas» / «Pronto» dan 3,77:1. El bloque [data-palette="oscuro"] de tokens.css no redefine --premium y se queda el #9C6B2E de la paleta clara. Aviso: en crema también fallan (2,83, 3,63 y 3,94), así que no es exclusivo de oscuro, pero aquí es la única tinta de acento que no se recalibró.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/home-1280.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/s-respiraLib-1280.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/s-mueveLib-1280.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/dbg3.js
- **Código sospechoso:** app/tokens.css:251-307 (bloque oscuro sin --premium ni --premium-soft) y app/ui/Primitives.jsx:259-273 (PremiumSeal en color var(--premium)).

### [baja] oscuro-6 · El título del mes en Estadísticas › Mes dice «Octubre De 2026» (la «De» en mayúscula)
- **Dónde:** 360x718 y 1280x720 (en las dos paletas)
- **Pasos:** 1) Abre Estadísticas desde el icono de la barra superior. 2) Pestaña «Mes».
- **Debería:** «Octubre de 2026».
- **Pasa:** El textContent es «octubre de 2026», pero `textTransform: 'capitalize'` pone en mayúscula cada palabra y se pinta «Octubre De 2026». No es exclusivo de oscuro. De paso: los aria-label «Mes anterior» y «Mes siguiente» de esas flechas están escritos a mano en castellano.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/oscuro/stats-Mes-360.png
- **Código sospechoso:** app/stats/StatsPanel.jsx:324 (`textTransform:'capitalize'` sobre monthLabel(), líneas 214-215). Bastaría con poner en mayúscula solo la primera letra en JS. Los aria-label están en las líneas 321 y 327.

## Respira e Hidrátate
**Qué se recorrió:** Todo se probó en el index.html compilado (v0.143.4), con Chromium y Playwright, reloj falso, es-ES, Europe/Madrid y paleta crema.

RESPIRA, recorrido completo:
- Las 20 técnicas de principio a fin (modal de seguridad si lo pide, «Prepárate», sesión activa muestreada segundo a segundo, retenciones soltadas a los 12 s y cierre) a 360x718 y a 1530x702.
- Sin errores de consola en ninguna. Fases y duraciones coinciden con getSequence.
- Ningún salto vertical de la palabra de fase. Sin solapes del loto con el texto, la barra o el pie en ninguna de las dos medidas.
- Cierres en tiempo: 2:00 a 10:00 en las técnicas por tiempo; 3:45, 6:39 y 12:43 en las de rondas.
- Modal de seguridad en las 6 que llevan `safety`; el botón nace desactivado.
- Pausar y reanudar (el progreso no avanza en pausa); «Terminar» antes de tiempo; salir con «× Salir» y con Escape; la tarjeta «Continúa» de la barra lateral y la reanudación de Box (acredita 5 min, no 6).
- Espacio en la preparación y en la retención.
- Preparación, retención y cierre a 375x667, 360x640 y 1280x720.
- Los cuatro dibujos del círculo a escala máxima con el reloj parado.
- Una pasada con sonido, ambiente y voz: sin errores ni recursos 404.
- Los filtros «≤ 5 min» y «Sin retención».

HIDRÁTATE, recorrido completo:
- Sumar y quitar con los botones y pulsando vasos; bajar a 0 y de ahí otro «menos»; pasarse de la meta (9 / 8).
- Meta 12 y meta 4 desde Ajustes, con su efecto en la rejilla.
- Estadísticas: semana y mes cuentan bien los vasos del día y de la semana.
- Cambio de día con la app abierta; avisos de logro; hover del botón.

LO QUE NO MIRÉ, o miré poco:
- Inglés y modo oscuro: tienen sus propios hilos.
- Android y táctil real, y si el ⚠ del modal sale como emoji en Android: no se puede verificar aquí.
- Respira dentro de Caminos (ocultos hasta v1).
- La propuesta desde el menú de pausa y desde «A tu ritmo»: solo leí el código, que excluye las técnicas con `safety`.
- Pestaña oculta o en segundo plano durante una sesión.
- Pestaña Año de Estadísticas.

UN AVISO SOBRE LAS MEDIDAS: con page.clock.install() el reloj virtual sigue corriendo también en tiempo real. Por eso alguna cuenta atrás salta un número en las ejecuciones aceleradas. Lo comprobé en tiempo real (real.js) y la app no salta números: no lo he reportado. Las medidas de geometría a escala máxima se tomaron con el reloj parado (pauseAt).

Todos los scripts, capturas y JSON están en /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/.

### [alta] respira-1 · «Bhastrika · Fuelle» empieza sin el modal de seguridad, aunque es hiperventilación al doble de ritmo que «Rondas express»
- **Dónde:** 360x718 y 1530x702 (no depende del tamaño)
- **Pasos:** Home → Respira → pulsar el encabezado «Bhastrika · Fuelle» (grupo Pranayama, gratis).
- **Debería:** Que aparezca el modal «Antes de empezar» con la casilla «Lo he leído y asumo mi responsabilidad», igual que en «Kapalabhati · Kriya» y en las rondas. Son 3 minutos seguidos de inhalar 1 s y exhalar 1 s (30 respiraciones por minuto), que es hiperventilación. CONTENT.md:156 dice que toda técnica con hiperventilación abre el modal «sin excepción».
- **Pasa:** Va directa a «Prepárate» y a la sesión. De las 20 técnicas, las únicas que piden el modal son las 3 de rondas, Tolerancia CO₂, Kapalabhati y Kumbhaka. Kapalabhati tiene exactamente la misma secuencia de 1 s y 1 s en getSequence (patrón 'bhastrika' || 'kapalabhati') y sí lo pide. «Rondas express» va a 15 respiraciones por minuto y también lo pide. Como Bhastrika no lleva `safety`, además entra en las listas que solo excluyen `safety`: «Para ahora» de la biblioteca, el menú de pausa (BreakMenu.support.jsx:117) y «A tu ritmo» (state-ritmo.jsx:127). Así que la app la puede sugerir.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/run-360x718-rondas_express.json (Bhastrika: safety=false, 87 ciclos de Inhala 1 s y Exhala 1 s; Kapalabhati: safety=true, misma secuencia); /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/out-360.txt; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/out-1530.txt
- **Código sospechoso:** app/breathe/BreatheLibrary.jsx:57 (breathe.bellows sin `safety: true`) frente a :59 (breathe.kapalabhati con `safety: true`); la fila de CONTENT.md:142 copia la misma omisión.

### [alta] respira-2 · Al pulsar «Terminar» en una técnica de rondas, el cierre dice que hiciste todas las rondas y respiraciones
- **Dónde:** 360x718 (igual en todos)
- **Pasos:** Respira → «Respiración en rondas» → aceptar el modal de seguridad → dejar correr unos 24 s (lleva «Respiración 7 de 30», ronda 1) → pulsar «▶| Terminar».
- **Debería:** Que el cierre diga lo que se hizo (ronda 1, unas 6 respiraciones) o que no dé esas cifras.
- **Pasa:** El cierre dice «0:24 TIEMPO · 3 RONDAS · 90 RESPIRACIONES». Pasa igual en Rondas express (2 · 50) y en Rondas profundas (5 · 175), sea cual sea el momento en que se termina, y también al terminar una sesión reanudada.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/terminar-rondas-360.png; salida de terminar-rondas.js: antes de Terminar {breath:'Respiración 7 de 30', round:'1'} -> cierre ['0:24 TIEMPO','3 RONDAS','90 RESPIRACIONES']
- **Código sospechoso:** app/breathe/BreatheSession.jsx:266-267: el cierre pinta siempre `routine.rounds` y `routine.breaths * routine.rounds` en vez de `round` y `breathCount`.

### ~~[alta] respira-3 · Pasada la medianoche sin recargar, Hidrátate y «Hoy» siguen mostrando los vasos de ayer, y el primer «+» salta de 5/8 a 1/8~~
- **Arreglado en v0.146.1:** el cambio de día corre al volver la página al frente y cada minuto con la página a la vista, y parte de lo guardado para no pisar otra pestaña (`app/state-core.dia.js`, `tests/cambio-de-dia.spec.js`).
- **Dónde:** 1530x702 (y cualquiera: la pestaña o la PWA abiertas toda la noche, o el portátil cerrado y abierto por la mañana)
- **Pasos:** Con el reloj el 7 oct a las 23:50, abrir Hidrátate y sumar 5 vasos. Cerrar. Dejar pasar la noche sin recargar (page.clock.fastForward a las 08:20 del 8 oct). Mirar la barra lateral y abrir Hidrátate.
- **Debería:** «HOY JUE 8 OCT · AGUA 0 de 8» y el contador a «0 / 8» con los vasos vacíos.
- **Pasa:** La barra lateral dice «HOY JUE 8 OCT», con Foco y Respira a 0 y «AGUA 5 de 8». El contador dice «5 / 8 VASOS HOY» con cinco vasos llenos. Al pulsar «Un vaso más» salta a «1 / 8», porque es entonces cuando corre el cambio de día. Hasta que se suma algo, todo lo que se ve del agua es del día anterior.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/medianoche-tracker-1530.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/medianoche-sidebar.png; salida de medianoche.js: 08:20 {today:5,last:'Wed Oct 07 2026'} · tracker '5 / 8' · tras «Un vaso más» '1 / 8'
- **Código sospechoso:** `ensureDayFresh()` (app/state-core.jsx:447) solo lo llaman las acciones que acreditan (addWaterGlass, completeBreathSession, timer). Ni HydrateTracker (app/hydrate/HydrateModule.jsx:6, lee `state.water.today`) ni Sidebar.selectors.js:47 hacen el cambio de día al pintar, y no hay nada que lo dispare con visibilitychange ni con un temporizador.

### ~~[media] respira-4 · La barra espaciadora pausa a escondidas en la preparación y en la retención, y la sesión sigue congelada~~
- **Arreglado en v0.148.2.** Espacio solo pausa en la sesión activa, y «Empezar ahora» y «Respirar de nuevo» arrancan sin pausa (`tests/respira-espacio.spec.js`).
- **Dónde:** 1530x702 (escritorio, con teclado)
- **Pasos:** A) Respira → «Box 4·4·4·4» → en «Prepárate 3» pulsar Espacio → esperar 6 s → pulsar «Empezar ahora». B) Respira → «Rondas express» → aceptar el modal → llegar a «Retén sin aire» → pulsar Espacio → pulsar «Respirar de nuevo».
- **Debería:** Que Espacio no haga nada donde no hay pausa visible, o que la pantalla diga que está en pausa. Que «Empezar ahora» y «Respirar de nuevo» arranquen respirando.
- **Pasa:** A) La cuenta atrás se queda en 3 sin ningún aviso. Al pulsar «Empezar ahora», la sesión entra ya pausada: «Inhala 4» quieto y «▶ Reanudar» en el pie, mientras suena el aviso de inhalar. B) En la retención no cambia nada en pantalla, pero el reloj de retención deja de contar. Al pulsar «Respirar de nuevo», la ronda 2 queda quieta en «Inhala · Respiración 1 de 25» con «▶ Reanudar». Es fácil que pase: en la sesión activa la pista dice «ESPACIO PAUSAR».
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/espacio-prep-1530.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/espacio-prep-luego-1530.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/espacio-hold-luego-1530.png; salida de espacio.js: A tras Espacio + 6 s prepNum '3'; tras Empezar ahora + 6 s footer '▶ Reanudar ▶| Terminar'; B tras Respirar de nuevo + 8 s 'Respiración 1 de 25', footer '▶ Reanudar'
- **Código sospechoso:** app/breathe/BreatheSession.jsx:166: el atajo de Espacio cambia `paused` en cualquier stage. :74: la preparación se para si `paused`. :250 (`onSkip`) y :206 (`releaseHold`) no ponen `paused` a false, y ni la preparación ni la retención pintan el estado de pausa.

### [media] respira-5 · El aviso de logro tapa «Volver al inicio» y «Ahora no» en el cierre de la sesión
- **Dónde:** 360x718 y 1530x702
- **Pasos:** Estado nuevo → Respira → «Suspiro fisiológico» (o cualquier técnica) → dejarla terminar.
- **Debería:** Que el aviso «Nuevo sello · Primer aliento» no tape la acción principal de la pantalla de cierre.
- **Pasa:** El aviso aparece abajo y centrado, encima del botón, durante unos 3,3 s. A 360: el botón está en y 652–694 y el aviso en y≈620–697, así que el botón no se ve. A 1530×702: el botón está en y 620–662 y el aviso en y≈604–682, y tapa también «Ahora no». Los clics pasan a través (pointer-events: none), pero la acción no se ve. Sale en casi todas las primeras sesiones, porque el cierre es justo cuando se vacía la cola de avisos.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/toast-360-1200.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/toast-1530-1200.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/1530x702-rondas_express-4done.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/toast-360-tras8s.png (después: el botón vuelve a verse)
- **Código sospechoso:** app/ui/Toast.jsx:48 (`bottom: 20`, centrado, z 200) frente al pie de SessionDone (app/ui/SessionShell.jsx, footer). La regla de DECISIONES_TECNICAS_VIGENTES.md:174 («cualquier UI full-screen que no deba ser interrumpida por toasts reutiliza setCaminoUiActive») no se aplica a las sesiones sueltas.

### [media] respira-6 · En Hidrátate cada vaso saca un aviso de logro, y se apilan encima de «Un vaso menos / Un vaso más»
- **Dónde:** 360x718 (también a 1530x702)
- **Pasos:** Estado nuevo → abrir Ajustes y cerrarlo (desbloquea «Curiosidad», que queda en cola) → Hidrátate → pulsar «Un vaso más» dos veces seguidas.
- **Debería:** Un solo aviso que no tape los botones del contador (la regla es un aviso por sesión, §16.2).
- **Pasa:** Salen dos tarjetas, «Primer sorbo» y «Curiosidad», una encima de otra en y 534–698. A 360 tapan por completo los dos botones (y 560–602) y la línea de la barra. A 1530 tapan la mitad inferior de «Un vaso más». Cada vez que se suma un vaso se llama a flushAchievementToast('hydrate'), así que con varios logros en cola cada vaso saca uno más.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/agua-toast-360.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/agua-toast-1530.png; salida de agua-toast.js: botones [44,560,183,602],[193,560,316,602]; tarjetas [40,534,320,698]
- **Código sospechoso:** app/state-hydrate.jsx:70 (`flushAchievementToast('hydrate')` en cada vaso) y app/ui/Toast.jsx:48 (pila abajo y centrada).

### ~~[media] respira-7 · «Un vaso más» se queda verde de Foco después de pasar el ratón por encima~~
- **Arreglado en v0.148.2.** `Button` vuelve al fondo que recibió por `style` al apartar el ratón. El verde de Foco al pasar por encima sigue: es de diseño y va en la página para Ez (`tests/hidratate-botones.spec.js`).
- **Dónde:** 1530x702 (escritorio, con ratón)
- **Pasos:** Hidrátate → pasar el ratón sobre «Un vaso más» → apartarlo.
- **Debería:** Que vuelva al azul de Hidrátate (#5F8A9B).
- **Pasa:** Al pasar el ratón se pone verde oscuro (--focus-2), y al apartarlo se queda en el verde de Foco, rgb(62,90,58), con el borde todavía azul. No vuelve a azul hasta que se reabre el modal. Pasa en cualquier Button primario al que se le cambie el fondo por `style`.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/hover-vaso-mas.png; salida de hover.js: antes bg rgb(95,138,155) · hover rgb(42,62,39) · tras salir el ratón rgb(62,90,58) con inline 'var(--focus)'; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/agua-360-3.png
- **Código sospechoso:** app/ui/Primitives.jsx:226: onMouseLeave escribe `var(--focus)` sin tener en cuenta el `style.background` recibido. Lo usa app/hydrate/HydrateModule.jsx:70.

### ~~[media] respira-8 · El filtro «Sin retención» muestra Rítmica yin y Nadi Shodhana, que tienen fases de «Sostén»~~
- **Arreglado en v0.148.2.** «Sin retención» quita también Rítmica yin y Nadi Shodhana: el chip pasa de 11 a 9 (`tests/respira-biblioteca.spec.js` lo cruza con `getSequence`).
- **Dónde:** 360x718
- **Pasos:** Respira → activar el chip «Sin retención» (11) → abrir «Rítmica yin» o «Nadi Shodhana».
- **Debería:** Que no salgan técnicas en las que la respiración se para. Según su propia definición, «con retención» es que la respiración se para llena o vacía.
- **Pasa:** Las dos salen en la lista filtrada. En la sesión, Rítmica yin pinta «Sostén» (2 s, con el pulmón vacío) en cada ciclo, y Nadi Shodhana pinta «Sostén» dos veces por ciclo (48 fases de Sostén en la sesión). Ninguna de las dos declara `cycle`, y en ese caso el filtro mira solo `safety`.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/filtro-sinreten-yin.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/filtro-yin-sosten.png; salida de filtro.js: «Sin retención» incluye 'Rítmica yin' y 'Nadi Shodhana'; fases de yin: Inhala, Exhala, Sostén
- **Código sospechoso:** app/ui/library-rules.js:46-50 (`libraryConRetencion`). Sin `cycle` devuelve `!!r.safety`, pero getSequence (app/breathe/BreatheVisual.jsx) da 'Sostén' a los patrones 'yin' y 'nadi'.

### [baja] respira-9 · Con la meta en 12 vasos, a 360 px los vasos miden 17×21 y la línea del agua tacha los números
- **Dónde:** 360x718
- **Pasos:** Ajustes → «Vasos al día» → subir a 12 → Hidrátate → sumar varios vasos.
- **Debería:** Vasos legibles y pulsables. La meta en Ajustes llega a 12 y el comentario dice que la rejilla «rinde bien hasta 12 columnas».
- **Pasa:** Cada vaso mide 17×21 px, muy por debajo de un objetivo táctil razonable. En los vasos llenos, la línea del nivel (top 40 %) cruza por en medio los números 1–11, y «10», «11» y «12» rozan el borde del vaso.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/agua2-360-meta12.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/agua2-360-meta12-zoom.png; salida de agua2.js: '1:17x21* … 12:17x21'
- **Código sospechoso:** app/hydrate/HydrateModule.jsx:25 (`repeat(goal, 1fr)` sin tope de ancho en móvil) y :46 (relleno con `top: '40%'`, número abajo con 8 px de padding).

### [baja] respira-10 · En Hidrátate, la cola del 3, el 5, el 7 y el 9 baja hasta la línea de «VASOS HOY»
- **Dónde:** 360x718 (el numeral mide 96 px en todos los tamaños)
- **Pasos:** Hidrátate → sumar vasos hasta 3, 5, 7 o 9.
- **Debería:** Aire entre la cifra y el rótulo, como el que se le dio al numeral de «Prepárate» para este mismo problema de Cormorant (paddingBottom 0.12em en SessionPrep.jsx).
- **Pasa:** Medido en la captura recortada: la tinta de la cifra llega a la fila 103 y el rótulo «VASOS HOY» empieza en la 95–97. La cola del 3, 5, 7 y 9 queda a la altura del rótulo, pegada a su «V». El 2, el 4, el 6 y el 8 no tienen el problema.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/num-360-tira.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/agua-360-3-zoom.png
- **Código sospechoso:** app/hydrate/HydrateModule.jsx:16 (fontSize 96, lineHeight 1) y :21 (rótulo con marginTop 8).

### ~~[baja] respira-11 · «Cancelar» en el modal de seguridad cierra también la biblioteca de Respira~~
- **Arreglado en v0.148.2.** «Cancelar» deja la biblioteca abierta detrás; aceptar la cierra (`tests/respira-biblioteca.spec.js`).
- **Dónde:** 360x718 (igual en escritorio)
- **Pasos:** Respira → bajar hasta «Kumbhaka 1:4:2» → pulsar su encabezado → en el modal de seguridad pulsar «Cancelar» (o la ×).
- **Debería:** Volver a la biblioteca donde estabas, como al cerrar el preview de Mueve y Estira, que la deja abierta detrás.
- **Pasa:** Te deja en la home con la biblioteca cerrada. Hay que volver a abrir Respira y buscar otra vez la técnica.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/safety-cancelar.png; salida de filtro.js: 'tras Cancelar, biblioteca abierta? false'
- **Código sospechoso:** app/main.jsx:122-125: `handleStartBreathe` hace `setOpenLibrary(null)` antes de enseñar el modal, en vez de solo al aceptar.

### [baja] respira-12 · Con los círculos «Pulso» y «Ondas», a escala máxima los aros pisan la palabra de la fase
- **Dónde:** 360x718, 375x667, 1280x720 y 1530x702
- **Pasos:** Ajustes → Círculo → «Pulso» (o «Ondas») → Respira → «Suspiro fisiológico» → fase «Inhala más» (escala 1,35).
- **Debería:** Que ningún aro cruce «Inhala más», como pasa con el loto.
- **Pasa:** Pulso: el aro decorativo fijo de 380 px llega 28 px por debajo del borde superior de la palabra a 360 (pinta en y 87–467 y la palabra empieza en 439), cruza las astas de «Inhala más» y se corta por los lados (x −10…370 en una pantalla de 360). Ondas: el aro exterior llega 13–14 px dentro de la caja de la palabra (a 360 y a 1530) y roza las astas de la «I» y la «h». El loto («flor», por defecto) no tiene el problema.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/est2-pulso-zoom.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/est2-360x718-pulso-Suspir.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/est2-1530x702-ondas-Suspir.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/est2-ondas1530-zoom.png
- **Código sospechoso:** app/breathe/BreatheVisual.jsx: el wrap fijo de 260×260 para pulso/ondas/petalo (`breathVisualStyles.wrap`), con los aros de pulso en `inset: -60` y las ondas escaladas hasta 1,35. El arreglo de s138 y s139 solo cubrió el loto.

### [baja] respira-13 · Las duraciones de las tres técnicas de rondas suponen retenciones muy distintas, y dos se alejan mucho de lo que dura la sesión
- **Dónde:** todos
- **Pasos:** Hacer cada técnica de rondas soltando cada retención a los 12 s y comparar el «Tiempo» del cierre con los minutos de la tarjeta.
- **Debería:** Un tiempo cercano a lo que anuncia la tarjeta, o duraciones calculadas con el mismo criterio.
- **Pasa:** Rondas express: tarjeta 4 min, cierre 3:45. Respiración en rondas: tarjeta 12 min, cierre 6:39. Rondas profundas: tarjeta 20 min, cierre 12:43. La parte respirada son 200, 360 y 700 s. Para llegar a la tarjeta harían falta retenciones de 20 s, 120 s y 100 s respectivamente, así que las tres cifras no siguen el mismo criterio. El filtro «≤ 5 min» se calcula con esos minutos.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/out-360.txt; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/out-1530.txt
- **Código sospechoso:** app/breathe/BreatheLibrary.jsx:16-18 (`min: 4/12/20`). El propio BreatheSession.jsx los llama «NOMINALES», pero no dice qué retención suponen.

### [baja] respira-14 · El modal de seguridad dice «hiperventilación controlada y apnea» también en técnicas que no tienen una de las dos
- **Dónde:** todos
- **Pasos:** Respira → «Kumbhaka 1:4:2» (o «Kapalabhati · Kriya», o «Tolerancia CO₂») → leer el modal.
- **Debería:** Un texto que describa la técnica: Kumbhaka es respiración lenta con retenciones (4·16·8) y no hiperventila; Kapalabhati en la app es 1 s y 1 s sin retención.
- **Pasa:** Las seis técnicas con aviso enseñan el mismo «Esta técnica implica hiperventilación controlada y apnea», aunque Kumbhaka y Tolerancia CO₂ no tienen hiperventilación y Kapalabhati no tiene apnea.
- **Prueba:** /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/360x718-kumbhaka_1_4_2-0safety.png; /tmp/claude-0/-home-user-Pace-app/63e26906-7c7e-5b17-9cf1-8297eb950c27/scratchpad/hunt/respira/360x718-rondas_express-0safety.png
- **Código sospechoso:** app/i18n/strings/sessions.js:156 (y :327 en inglés): un solo texto para todas, en BreatheSafety (app/breathe/BreatheLibrary.jsx:137).
