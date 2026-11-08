## Términos que conviene unificar

- **«A tu ritmo»**: aparece como **“At your pace”**, **“At your own pace”** y **“Your pace”**. Mantendría **“At your pace”** cuando sea el nombre de la función.
- **Empezar**: **“Begin” / “Start”**. Usaría **“Start”** para iniciar sesiones y ejercicios.
- **Pausa**: **“Pause” / “Break”**. Usaría **“break”** para el descanso y **“pause”** para detener temporalmente una sesión.
- **Por libre**: **“Freestyle” / “For now” / “Right now”** en contextos relacionados. Usaría **“Unplanned”** para actividad sin plan y **“For right now”** para recomendaciones inmediatas.
- **De por vida**: **“Lifetime” / “For life” / “For good” / “Forever”**. Usaría **“Lifetime”** como etiqueta del acceso comprado.
- **Copias de datos**: **“Copy” / “Backup” / “Rescue copy”**. Usaría **“backup”** para exportar, importar y recuperar datos.
- **Poner el calendario al día**: **“Bring up to date” / “Update”**. Usaría **“Update calendar”** como acción y **“Up to date”** como estado.
- **Variante del inglés**: conviven **“catalog” / “catalogue”**, **“center” / “centre”**, **“energizing” / “energising”**. Propongo **inglés británico** de forma consistente.

## Bienvenida, navegación y mensajes generales

En las tablas, `strings/` significa `app/i18n/strings/` y `content/`, `app/i18n/content/`. Los textos de la columna «actual» son los del código; las propuestas son cambios editoriales.

### `strings/ui.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/ui.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/ui.js` | `welcome.cta` | Begin | Start | Unificar la acción principal. |
| ↳ | `welcome.tagline` | Antidote to the chair. | A break from sitting. | El original suena traducido y presenta la silla como un problema que hay que curar. |
| ↳ | `welcome.tagline.sub` | At your own pace. | At your pace. | Respetar el nombre elegido. |
| ↳ | `welcome.value.local.label`, `support.value.local.label` | Fully local | Stored locally | Más comprensible para una persona no técnica. |
| ↳ | `welcome.value.free.sub` | the essentials, always | the essentials included | Quitar el absoluto. Conviene ajustar también el español. |
| ↳ | `welcome.intention.label` | What do you want to cultivate today? | What would you like to focus on today? | “Cultivate” resulta literario para esta pregunta práctica. |
| ↳ | `support.title.sub` | And it always will be. | Your support helps keep it that way. | Evitar una promesa absoluta. Cambia el compromiso editorial: ajustar también el español si se adopta. |
| ↳ | `support.value.forever.label` | Forever | Free core | Evitar otro absoluto en la propuesta gratuita. No afecta al acceso de por vida comprado. |
| ↳ | `support.value.forever.sub` | the core, no strings | no purchase needed | Más explícito y menos coloquial. |
| ↳ | `support.cta` | If it takes care of you, help us keep it going. | If PACE helps you, help keep it going. | Cercano sin atribuir a la app una función de cuidado. |
| ↳ | `support.donated.title` | Marks a private stamp — on trust | Add a private stamp. No verification needed. | “On trust” parece una traducción literal. |
| ↳ | `sidebar.logo.title` | Tickling it? | Give the cow a tickle? | La pregunta actual parece preguntar si ya estás haciendo la acción. |
| ↳ | `sidebar.agua.ninguno` | None of {m} glasses | 0 of {m} glasses | Más directo como contador. |
| ↳ | `sidebar.action.resume.meta` | You left it unfinished | Ready to pick up where you left off | Menos recriminatorio. |
| ↳ | `sidebar.action.now.meta` | Fits where you are | Works in your space | “Fits where you are” no explica con claridad que se adapta al espacio disponible. |
| ↳ | `sidebar.pausa.larga` | Long break of {x} | Long break · {x} | Evita una construcción poco natural y funciona con la duración ya formada. |
| ↳ | `topbar.cambio.body` | You have a Focus block under way. If you switch now, it is lost and does not count. | A Focus block is in progress. Switching now ends it without counting it. | Más breve y menos mecánico. |
| ↳ | `activity.move.sub` | active body | get moving | “Active body” suena a etiqueta traducida, no a invitación. |
| ↳ | `activity.hydrate.sub` | water now | time for water | Más natural con el mismo tono tranquilo. |
| ↳ | `notify.focus.body` | Cycle closed. Choose your micro-break. | Focus complete. Choose your break. | “Cycle closed” no es habitual en una app de este tipo. |
| ↳ | `red.parte.titulo` | This part could not open | This section couldn’t load | Vocabulario normal de una interfaz. |
| ↳ | `red.global.texto` | This screen could not be drawn. What you have done is still saved on this device. | This screen couldn’t load. Your activity is still saved on this device. | “Drawn” expone un detalle técnico innecesario. |
| ↳ | `red.global.pie` | If it happens again, keep the copy: it can be recovered from it. | If this happens again, keep the backup. It may help recover your data. | El original tiene dos “it” ambiguos y suena traducido. |

### `strings/onboarding.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/onboarding.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/onboarding.js` | `onboarding.welcome.cta` | Begin | Start | Unificar. |
| ↳ | `onboarding.need.title` | What do you want to cultivate? | What would you like to focus on? | Más natural para elegir una intención. |
| ↳ | `onboarding.need.focus.sub` | truly concentrate | stay focused | “Truly concentrate” suena traducido. |
| ↳ | `onboarding.need.body.sub` | move, undo the chair | move more, take a break from sitting | “Undo the chair” no se entiende en inglés. |
| ↳ | `onboarding.time.pause` | A pause | A break | Aquí se habla de tiempo disponible para descansar, no de pausar un temporizador. |
| ↳ | `visita.act.texto` | Breathe, Stretch and Move, with short routines, and Hydrate, for your glasses of water. Whenever you like. | Try short routines in Breathe, Stretch and Move. Log your water in Hydrate. Whenever you like. | La frase actual arrastra la estructura española. |
| ↳ | `visita.dia.texto` | Each morning, “At your pace” plans your day from your week: when to stop and what to do in each break. | Each morning, “At your pace” uses your weekly schedule to plan when to take a break and what to do. | “From your week” no explica qué información usa. |
| ↳ | `visita.ajustes.texto` | Language, palette, sound and your data. You can replay this tour from here. | Language, colour theme, sound and your data. You can take this tour again here. | “Replay” parece referido a un vídeo; “palette” es más técnico. |

## Sesiones, ejercicios y pausas

### `strings/sessions.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/sessions.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/sessions.js` | `session.backToHome` | Back to home | Back to Home | “Home” como destino de navegación. |
| ↳ | `session.notCountedCopy` | Under half a minute doesn’t count. Come back whenever you like. | Sessions under 30 seconds aren’t counted. Come back whenever you like. | Aclara qué no cuenta y evita un tono de juicio. |
| ↳ | `session.notCountedCopy.sinTrabajo` | With no exercise done, it doesn’t count. Come back whenever you like. | This session wasn’t counted because no exercises were completed. Come back whenever you like. | La construcción actual suena traducida. |
| ↳ | `session.hint` | Space pause · Esc exit | Space to pause · Esc to exit | Faltan las preposiciones propias del inglés. |
| ↳ | `focus.minutes.custom.title` | Custom minutes (5–180) | Custom duration (5–180 min) | Se elige una duración, no unos “minutos personalizados”. |
| ↳ | `focus.restartBlock` | Restart focus | Restart block | Más consistente con el objeto que se reinicia. |
| ↳ | `focus.start` | Start focus | Start Focus | Mantener el nombre de la función. |
| ↳ | `focus.manual.label` | Manual focus | Manual Focus | Mantener el nombre de la función. |
| ↳ | `focus.subtitle.pause` | Disconnect for 5 min | Step away for 5 min | “Disconnect” puede interpretarse como desconectar una conexión o dispositivo. |
| ↳ | `breathe.phase.respira.suave` | Breathe easy | Breathe gently | Una instrucción física más clara; “breathe easy” también significa dejar de preocuparse. |
| ↳ | `breathe.phase.inhala.vientre` | Inhale into the belly | Breathe into your belly | Más natural y coherente con el tuteo. |
| ↳ | `breathe.phase.sosten.vacio` | Hold empty | Hold after exhaling | Evita la expresión poco natural “empty”. |
| ↳ | `custom.locked.copy` | Combine exercises from the catalog and save your own routines. Part of PACE Complete. | Combine exercises from the catalogue and save your own routines. Part of PACE Complete. | Unificar inglés británico. |
| ↳ | `custom.empty.copy` | Combine exercises from the catalog and save your own routine. | Combine exercises from the catalogue and save your own routine. | Unificar sin cambiar el singular. |
| ↳ | `custom.save.comoNueva` | Save it as new | Save as new routine | Explica mejor el resultado del botón. |
| ↳ | `breathe.safety.body.rule1.pre` | Practice it | Practise this technique | Inglés británico y referente más claro. Conservar el espacio final del fragmento. |
| ↳ | `breathe.safety.body.rule1.post` | , never standing | , not standing | Quitar “never” sin suavizar la prohibición de seguridad. |
| ↳ | `breathe.safety.body.rule2` | Never in water, while driving or at height | Do not practise in water, while driving or at height | Frase completa y sin “never”; mantiene la advertencia. |
| ↳ | `breathe.safety.body.rule3` | Do not practice if you have epilepsy, hypertension, heart disease or a hernia, or if pregnant | Do not practise if you have epilepsy, high blood pressure, heart disease or a hernia, or if you are pregnant | Inglés británico y lenguaje más llano. |

### `strings/sessions.body.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/sessions.body.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/sessions.body.js` | `lib.move.subtitle` | Calisthenics and strength. Short, discreet, no equipment. | Short strength routines. Check each routine for equipment. | La etiqueta general “no equipment” no casa con las rutinas que piden banda o barra. |
| ↳ | `lib.move.meta` | Active body | Get moving | Más natural. |
| ↳ | `lib.extra.subtitle` | Mobility and stretching. Antidote to the chair. | Mobility and stretching. A break from sitting. | Evitar el calco y la idea de antídoto. |
| ↳ | `lib.intensity.strong` | Strong | Intense | “Strong” describe fuerza, no intensidad. |
| ↳ | `lib.now` | For now | For right now | “For now” suele significar “por el momento”, no “recomendado para hacer ahora”. |
| ↳ | `lib.rhythm.co2` | hold on empty | hold after exhaling | Instrucción más comprensible. |
| ↳ | `preview.need.none` | Nothing. Just you and wherever you are. | No equipment needed. | Más breve y menos traducido. |
| ↳ | `preview.need.unknown` | We don’t know what every step needs: check before you start. | Some step requirements are missing. Check the steps before you start. | Aclara qué información falta. |
| ↳ | `preview.eq.wall` | A clear wall | Clear wall space | No se necesita una “pared clara”, sino espacio libre en ella. |
| ↳ | `preview.eq.band` | An elastic band, if you have one | A resistance band, if you have one | “Elastic band” puede entenderse como una goma pequeña de oficina. |
| ↳ | `session.beginStep` | Begin | Start | Unificar. |
| ↳ | `session.beginNow` | Begin now | Start now | Unificar también la referencia al botón. |
| ↳ | `session.placeCountdown` | to begin | to start | Coherencia con la acción. |
| ↳ | `move.placeHintMano` | Get set, no rush · press Begin now | Take your time getting ready · tap “Start now” | Más natural y coincide con el botón propuesto. |
| ↳ | `move.auto.title` | Move on by itself | Advance automatically | La etiqueta actual no tiene un sujeto claro. |
| ↳ | `move.sideAutoHint` | The next side starts on its own | The other side starts automatically | “Other side” es más natural para un ejercicio bilateral. |
| ↳ | `move.auto.off` | Go at your own pace and tap › to go on. | Go at your pace and tap › to continue. | Más limpio y coherente con el vocabulario de la app. |
| ↳ | `move.auto.prep` | Your pace · you decide when to go on. | At your pace · you decide when to continue. | Unificar la expresión. |
| ↳ | `move.unaBasta` | One is enough | One set is enough | “One” aislado no deja claro qué se termina. |
| ↳ | `move.pausa.texto` | You pick up from here. When you resume: 3, 2, 1 and the count goes on. | Resume from this point after a 3, 2, 1 countdown. | La actual suena traducida y confunde cuenta atrás con contador de repeticiones. |
| ↳ | `move.hint` | ← → navigate · Space pause · Esc exit | ← → to navigate · Space to pause · Esc to exit | Corregir la estructura. |

### `strings/breakmenu.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/breakmenu.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/breakmenu.js` | `break.subtitle` | You've closed a block. Pick your break. | You’ve finished a Focus block. Choose your break. | “Closed a block” es un calco. |
| ↳ | `break.breathe.desc` | 2 min to return to center | 2 min to pause and breathe | Evita una expresión abstracta y la mezcla “center/centre”. |
| ↳ | `break.stretch.desc` | Loosen the tension | Take a moment to stretch | “Loosen tension” no es la combinación habitual. |
| ↳ | `break.move.desc` | Quick antidote to the chair | A quick break from sitting | Más natural y sin lenguaje de remedio. |
| ↳ | `break.prop.sitting` | You finished a {n}-minute Focus | You finished a {n}-minute Focus block | Falta el sustantivo que designa la sesión. |
| ↳ | `break.ritmo.seguir` | Go on to block {n} | Continue to block {n} | Más limpio como botón. |
| ↳ | `break.ritmo.comer` | Go and eat | Take a lunch break | La actual resulta brusca. |

## «At your pace», calendario y carta semanal

### `strings/ritmo.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/ritmo.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/ritmo.js` | `ritmo.pregunta` | How many hours today? | How long are you working today? | Explica qué duración se está preguntando. |
| ↳ | `ritmo.sub` | Breaks are part of the time. I'll tell you when to pause and what to do. | Breaks are included. I’ll suggest when to stop and what to do. | La primera frase suena traducida; “suggest” encaja mejor con el tono. |
| ↳ | `ritmo.frase.movil.empieza` | start it on the ring above | start with the timer above | “On the ring” no explica bien la acción. |
| ↳ | `ritmo.libre` | I'll go freestyle today | I’ll go without a plan today | “Freestyle” sugiere una modalidad deportiva o creativa. |
| ↳ | `ritmo.ctx.material` | No equipment, sometimes a wall or desk | Sometimes a wall or desk; no other equipment | El original empieza negando lo que después necesita. |
| ↳ | `ritmo.sigue.cta` | Go on to {modulo} | Continue with {modulo} | Más natural para continuar una pausa compuesta. |
| ↳ | `notify.ritmo.cierre` | To close the day: {plato} · {min} min | Wind down: {plato} · {min} min | “Close the day” suena traducido. |
| ↳ | `notify.ritmo.ultimo` | Block {n} of {total} done. That is your day. | Block {n} of {total} done. Your plan is complete. | “That is your day” no comunica claramente que has terminado. |
| ↳ | `notify.fijo.cierre` | Then, to close the day: {plato} · {min} min | Then wind down: {plato} · {min} min | Mismo criterio. |
| ↳ | `notify.fijo.ultimo` | This one closes your day. | Your final Focus block today. | La actual es un calco. |
| ↳ | `ritmo.motivo.estira`, `break.prop.ritmo.estira` | Antidote to the chair | A break from sitting | Naturalidad y coherencia. |
| ↳ | `ritmo.motivo.mueve`, `break.prop.ritmo.mueve` | Active body | Get moving | Naturalidad. |
| ↳ | `ritmo.motivo.cierre`, `break.prop.ritmo.cierre` | To close the day | To wind down | Naturalidad. |
| ↳ | `ritmo.frase.zona` | {zona}: unmoved today | {zona}: not yet today | “Unmoved” también significa impasible. La propuesta es más corta; necesita el contexto de la tarjeta. |
| ↳ | `ritmo.frase.larga` | Two hours: off the chair | Two hours: time to stand | La actual parece una orden telegráfica traducida. |
| ↳ | `ritmo.frase.cierre` | To close, slowly | A gentle finish | Más natural y breve. |
| ↳ | `ritmo.aro.pausar` | Pause focus | Pause Focus | Mantener el nombre. |
| ↳ | `ritmo.aro.reanudar` | Resume focus | Resume Focus | Mantener el nombre. |
| ↳ | `ritmo.hora.tuya` | The one you have | Current time | Evitar un referente ambiguo. |
| ↳ | `ritmo.hora.tenias` | You had {h} | Previously {h} | La actual suena traducida. |
| ↳ | `ritmo.st.sub` | So each morning your day arrives ready. If a day is different, you change it that day. | Your daily plan will be ready each morning. You can adjust it whenever your schedule changes. | La estructura actual es española. |
| ↳ | `ritmo.st.tipo.libre` | Free | No plan | “Free” puede entenderse como gratuito. |
| ↳ | `ritmo.st.ahoraNo` | Not now, I want to try it first | Try PACE first | Más corto para un botón y sin cambiar la intención. |

### `strings/calendario.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/calendario.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/calendario.js` | `cal.enlace` | To my calendar | Add to calendar | Acción reconocible. |
| ↳ | `cal.resumen` | Adds what is left of today: {n} focus blocks with their breaks, from {a} to {b}. | Add the rest of today’s plan: {n} Focus blocks and their breaks, from {a} to {b}. | Más natural y con el nombre Focus. |
| ↳ | `cal.resumen.uno` | Adds what is left of today: 1 focus block with its break, from {a} to {b}. | Add the rest of today’s plan: 1 Focus block and its break, from {a} to {b}. | Misma corrección, conservando el singular. |
| ↳ | `cal.resumen.nada` | There is nothing left of today to add. | No more events to add today. | La actual suena traducida. |
| ↳ | `cal.dest.microsoft.sub` | Your work one too, if your company allows it | Your work calendar too, if your company allows access | Evitar “your work one”. |
| ↳ | `cal.dest.archivo.sub` | Apple, Thunderbird… A file it can open | A calendar file for Apple Calendar, Thunderbird and other apps | Aclara qué se descarga. |
| ↳ | `cal.hecho.reuniones` | You have {r} meetings today and the day works around them. | Your plan works around your {r} meetings today. | Es el plan, no el día, lo que se adapta. |
| ↳ | `cal.hecho.reuniones.una` | You have 1 meeting today and the day works around it. | Your plan works around your 1 meeting today. | Conservar el singular y la misma estructura. |
| ↳ | `cal.error.bloqueada` | The browser did not open the permission window. Let PACE open windows and tap again. | Your browser blocked the permission window. Allow pop-ups for PACE and try again. | “Allow pop-ups” es la acción que la persona encontrará en el navegador. |
| ↳ | `cal.mantener.sub` | While PACE is open, if your day changes, it changes there too. Each break reminds you. | While PACE is open, changes to your plan also update your calendar. You’ll get a reminder for each break. | Evitar dos “it” sin referente claro. |
| ↳ | `cal.mantener.sub.web` | In testing. While PACE is open and the permission lasts, if your day changes, it changes there too. Each break reminds you. | In testing. While PACE is open and calendar access is active, changes to your plan also update your calendar. You’ll get a reminder for each break. | Conserva los límites, con lenguaje más natural. |
| ↳ | `cal.solo.resumen.pendiente` | Your day has changed since {h} and your calendar does not know yet. | Your plan has changed since {h}. Your calendar hasn’t updated yet. | La personificación resulta confusa en un estado de sincronización. |
| ↳ | `cal.solo.resumen.pendiente.sin` | Your day has changed and your calendar does not know yet. | Your plan has changed. Your calendar hasn’t updated yet. | Mismo criterio. |
| ↳ | `cal.btn.poner`, `cal.enlace.poner` | Bring up to date | Update calendar | Más corto y explícito. |
| ↳ | `cal.solo.nota.google` | Google lets PACE write for an hour at a time. «Bring up to date» opens its window, which closes by itself if you are still signed in. | Google grants PACE calendar access for one hour at a time. “Update calendar” opens a Google window. It closes automatically if you’re still signed in. | “Write” es jerga técnica; actualizar también el nombre del botón. |
| ↳ | `cal.solo.nota.microsoft` | Microsoft lets PACE write for a day at a time. «Bring up to date» opens its window, which closes by itself if you are still signed in. | Microsoft grants PACE calendar access for one day at a time. “Update calendar” opens a Microsoft window. It closes automatically if you’re still signed in. | Mismo criterio. |
| ↳ | `cal.solo.nota.android` | PACE no longer has permission for the phone calendar. «Bring up to date» asks again. | PACE no longer has access to your phone calendar. “Update calendar” asks for permission again. | Más natural y coherente con el botón. |
| ↳ | `cal.desc.pregunta` | PACE will stop touching your calendar. What about the rest of today? | PACE will stop updating your calendar. Keep or remove the remaining PACE events today? | “Touching” suena extraño; aclara qué se elimina. |
| ↳ | `cal.desc.quitar` | Remove it | Remove events | Evitar el “it” ambiguo. |
| ↳ | `cal.desc.dejar` | Leave it | Keep events | Acción más clara. |

### `strings/carta.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/carta.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/carta.js` | `ritmo.carta.ayudo` | Helped you | What helped | Más natural como encabezado. |
| ↳ | `ritmo.carta.corta` | The {hora} break, which you skipped on {n} days, becomes a 2-minute one. | You skipped the {hora} break on {n} days, so it’s now 2 minutes long. | Evitar “becomes a 2-minute one”. |
| ↳ | `ritmo.carta.corta.dos` | The {hora} break, which you skipped on {n} days in two weeks, becomes a 2-minute one. | You skipped the {hora} break on {n} days over two weeks, so it’s now 2 minutes long. | Mismo criterio y mismo periodo. |
| ↳ | `ritmo.carta.inicio` | You start at {hora}. Shall I set your start to {hora}? | You start at {hora}. Set your start time to {hora}? | “Your start” es poco natural. Conserva ambas apariciones del marcador. |
| ↳ | `ritmo.carta.inicio.dia` | On {dias} you start at {hora}. Shall I make {hora} your start on {dias}? | You start at {hora} on {dias}. Set your start time to {hora} on {dias}? | Más claro sin perder los marcadores repetidos. |
| ↳ | `ritmo.carta.salida` | You finish at {hora}. Shall I set your finish to {hora}? | You finish at {hora}. Set your finish time to {hora}? | Mismo criterio. |
| ↳ | `ritmo.carta.salida.dia` | On {dias} you finish at {hora}. Shall I make {hora} your finish on {dias}? | You finish at {hora} on {dias}. Set your finish time to {hora} on {dias}? | Mismo criterio. |
| ↳ | `ritmo.aprendido.descansa` | {rutina} rests until {fecha} | {rutina} is on hold until {fecha} | “Rests” aplicado a una rutina suena traducido. |

## Estadísticas y ajustes

### `strings/stats.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/stats.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/stats.js` | `stats.subtitle` | Soft metrics. No anxiety, no comparison. | A gentle look at your activity. No comparisons. | “Soft metrics” es jerga y “no anxiety” promete una reacción emocional. |
| ↳ | `stats.label.body`, `stats.month.total.move` | Body | Movement | “Body” aislado no describe una magnitud de actividad. |
| ↳ | `stats.hoy.libre` | Freestyle | Unplanned | Explica que son sesiones fuera del plan. |
| ↳ | `stats.ayuda.resto` | The rest will show up once there is enough to say it. | More insights will appear when there’s enough activity to spot a pattern. | La actual es un calco poco comprensible. |
| ↳ | `stats.ayuda.pronto.texto` | What repeats in your breaks and your Focus will show up here, once there is enough to say it. It fills in on its own: nothing more to do. | Patterns in your breaks and Focus sessions will appear here as you use PACE. There’s nothing extra to fill in. | Más natural y explica qué debe esperar la persona. |
| ↳ | `stats.ayuda.bien.ritmo` | At your pace already brings them sooner. | At your pace already schedules these breaks earlier. | “Brings them sooner” deja sin explicar qué cambia. |
| ↳ | `stats.ayuda.hora.todos` | All {n} of them {m} minutes long. | All {n} were {m} minutes long. | Falta el verbo. |
| ↳ | `stats.ayuda.hora.casi` | Nearly all of them {m} minutes long. | Nearly all were {m} minutes long. | Falta el verbo. |
| ↳ | `stats.ayuda.tras.frase` | After {a} of your {b} Focus blocks, a break. | You took a break after {a} of your {b} Focus blocks. | Frase completa y comprensible. |
| ↳ | `stats.month.tooltip.focus` | min focus | min of Focus | Orden y preposición. |
| ↳ | `stats.month.tooltip.breathe` | min breathe | min in Breathe | “Breathe” es un nombre de módulo, no una unidad. |
| ↳ | `stats.month.tooltip.move` | min body | min of movement | La actual no es una expresión inglesa natural. |
| ↳ | `stats.year.activeDays` | {n} days with rhythm | {n} active days | “Days with rhythm” suena traducido. |
| ↳ | `stats.year.activeDays.1` | 1 day with rhythm | 1 active day | Misma corrección en singular. |
| ↳ | `stats.year.maxStreak` | max streak: {n} days | longest streak: {n} days | Más natural. |
| ↳ | `stats.year.maxStreak.1` | max streak: 1 day | longest streak: 1 day | Misma corrección en singular. |

### `strings/settings.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/settings.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/settings.js` | `settings.sec.ver` | Look | Appearance | Término habitual para ajustes visuales. |
| ↳ | `settings.sec.oir` | Listen | Audio | “Listen” parece una instrucción, no una sección de ajustes. |
| ↳ | `settings.datos.abrir` | Copies, delete and PACE Complete | Backups, data deletion and PACE Complete | La mezcla de sustantivo y verbo suena traducida. |
| ↳ | `settings.palette` | Palette | Colour theme | Más claro fuera del vocabulario de diseño. |
| ↳ | `settings.timer.analogico` | Analog | Analogue | Unificar inglés británico. |
| ↳ | `settings.signal` | Marks the phase | Phase cue | Más natural como nombre de un ajuste. |
| ↳ | `settings.bg` | In the background | Background audio | Identifica el ajuste sin depender de la sección. |
| ↳ | `settings.notify.fallo.android` | Android did not let PACE set the last end-of-focus alert. | PACE couldn’t schedule the latest Focus reminder on Android. | La actual suena traducida y “last” puede significar final. |
| ↳ | `settings.notify.fallo.ios` | iPhone did not let PACE set the last end-of-focus alert. | PACE couldn’t schedule the latest Focus reminder on iPhone. | Mismo criterio. |
| ↳ | `settings.data.export` | Export a copy | Export backup | Unificar el concepto. |
| ↳ | `settings.data.import` | Import a copy | Import backup | Unificar el concepto. |
| ↳ | `settings.data.rescate` | Download the rescue copy | Download recovery backup | “Rescue copy” suena traducido. |
| ↳ | `settings.license` | License | Licence | Sustantivo en inglés británico. |
| ↳ | `settings.msg.exported` | Copy downloaded. | Backup downloaded. | Coherencia terminológica. |
| ↳ | `settings.msg.exported.app` | Copy ready: choose where to save it. | Backup ready. Choose where to save it. | Coherencia y frases cortas. |
| ↳ | `settings.msg.export.cancel` | Copy cancelled. | Export cancelled. | Se cancela la operación, no la copia. |
| ↳ | `settings.msg.import.invalid` | That file is not a PACE copy. | This file isn’t a PACE backup. | Terminología habitual. |
| ↳ | `settings.import.cuerpo` | The copy has {logros} achievements and {foco} min of focus. What PACE has now is replaced by the copy, not merged, and it cannot be undone. | This backup contains {logros} achievements and {foco} min of Focus. It will replace your current PACE data, not merge with it. This can’t be undone. | Más natural y mantiene la advertencia completa. |

### `strings/sobre.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/sobre.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/sobre.js` | `sobre.nuevas` | The envelope, with unread things | The envelope, with unread messages | “Things” resulta impreciso y traducido en una etiqueta accesible. |

## PACE Complete y compra

### `strings/premium.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/premium.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/premium.js` | `premium.inc.routines` | The deeper routines | More in-depth routines | Más natural sin convertir “profundas” en “más exigentes”. |
| ↳ | `premium.inc.letter` | A week shaped to you | A week tailored to you | “Tailored to you” es la expresión habitual. |
| ↳ | `premium.v1` | Arrives with version 1. | Coming with version 1. | Más propio de una interfaz. |
| ↳ | `premium.ok.title` | PACE Complete is yours, for good. | Your lifetime access to PACE Complete is ready. | “For good” es coloquial y menos preciso para una compra. |
| ↳ | `premium.settings.forever` | For good | Lifetime access | Etiqueta inequívoca. |
| ↳ | `premium.settings.desistir` | Withdraw from contract here | Withdraw from the contract here | Falta el artículo. Aplicar también en los enlaces de las páginas de compra. |
| ↳ | `premium.settings.sinred` | No connection to renew | Connect to renew access | La actual puede entenderse como que no existe conexión con la renovación. |
| ↳ | `premium.trial.body` | On {fecha} the first month is charged: {precio}. To keep going, do nothing. | You’ll be charged {precio} for your first month on {fecha}. No action is needed to continue. | Inglés natural y cobro más visible. |
| ↳ | `premium.trial.cancel` | If not, cancel it now, in two taps. PACE Complete stays open until {dia}. | To avoid the charge, cancel in Settings before your trial ends. You can keep using PACE Complete until {dia}. | “If not” es ambiguo; “two taps” no aporta claridad sobre el plazo. |
| ↳ | `premium.trial.keep` | Keep the trial | Continue trial | Más natural para un botón. |
| ↳ | `premium.onb.vida` | I would rather pay once, {vida} | Pay once · {vida} | Demasiado largo para una opción de compra. |
| ↳ | `premium.onb.vida.sola` | One payment of {vida}, for good. | One payment of {vida} for lifetime access. | Más preciso. |
| ↳ | `premium.onb.comprar` | Buy, {vida} | Buy for {vida} | La coma no resulta natural aquí. |
| ↳ | `premium.compra.error` | The purchase couldn't open. Try again. | Checkout couldn’t open. Try again. | Lo que se abre es el proceso de pago. |
| ↳ | `premium.pasov1.cuerpo` | From today, PACE Complete is paid. Since you were already using PACE, you have all of it until {fecha}, with no card and nothing to pay. | PACE Complete now requires a purchase. As an existing PACE user, you can keep using all its features until {fecha}. No card or payment needed. | “Is paid” y “you have all of it” suenan traducidos. |

## Contenido de respiración y movimiento

### `content/breathe.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/content/breathe.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `content/breathe.js` | `breathe.cat.energia.aside` | Wakes up the system | A more active breathing pace | “The system” es impreciso y sugiere un efecto fisiológico. |
| ↳ | `breathe.cat.equilibrio.label` y códigos con valor `Equilibrium` | Equilibrium | Balance | “Equilibrium” es innecesariamente técnico. No cambiar los identificadores internos. |
| ↳ | `breathe.cat.equilibrio.aside` | Regulates the nervous system | Guided breathing patterns | Quitar la promesa fisiológica. |
| ↳ | `breathe.cat.relajacion.aside` | Quiets the mind | A slower breathing pace | Describir la práctica, no garantizar un resultado. |
| ↳ | `breathe.box.4.desc` | Perfect square. Mental calm and sustained focus. | Breathe in, hold, breathe out, hold. Four seconds each. | Explica el patrón en lugar de prometer calma y concentración. |
| ↳ | `breathe.box.6.desc` | Deeper version | Six seconds for each phase. | “Deeper” no explica la diferencia. |
| ↳ | `breathe.coherent.55.desc` | A steady five-and-five rhythm. Meant to find an even cadence. | Breathe in for five seconds and out for five. | Más claro y breve. |
| ↳ | `breathe.coherent.66.desc` | Deeper version. 5 cycles per minute. | Six seconds in, six seconds out. 5 cycles per minute. | Explica la diferencia sin usar “profundidad”. |
| ↳ | `breathe.diaphragm.name` | Diaphragmatic | Diaphragmatic Breathing | El adjetivo aislado parece incompleto. |
| ↳ | `breathe.diaphragm.desc` | Breathe into the belly. The base of everything else. | Let your belly expand gently as you breathe in. | Quitar el absoluto y dar una indicación concreta. |
| ↳ | `breathe.co2.desc` | Exhale and hold empty. Train calm with less air. | Exhale, then hold your breath. Resume breathing when you need to. | “Train calm with less air” suena traducido y presenta un beneficio. |
| ↳ | `breathe.yin.desc` | Soft rhythm with rest after the exhale. Stillness settles in. | A gentle rhythm with a pause after each exhale. | Describir sin garantizar una sensación. |
| ↳ | `breathe.bhramari.desc` | Exhale with a low hum. The mind grows quiet. | Exhale with a low, gentle hum. | Quitar la promesa de resultado. |

### `content/move.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/content/move.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `content/move.js` | `mueve.cat.empezar.aside` | Two or three minutes, low doses | Two or three minutes, a gentle start | “Low doses” suena clínico. |
| ↳ | `mueve.cat.sigilo.label` | Stealth | Discreet | “Stealth” tiene un tono más táctico que calmado. |
| ↳ | `mueve.cat.sigilo.aside` | No one notices | Small movements at your desk | Quitar el absoluto. |
| ↳ | `mueve.cat.mas.aside` | When the above feels short | When you feel ready for more | “The above” depende de la posición y suena traducido. |
| ↳ | `extra.wall.sit.desc` | Quadriceps isometric against a wall. | Hold a seated position against a wall. | La actual es jerga y está gramaticalmente incompleta. |
| ↳ | `extra.calves.desc` | Under the desk, no one notices. | Small heel raises at your desk. | Quitar el absoluto y describir el movimiento. |
| ↳ | `extra.calves.s0.instruction.action` | Raise your heels as high as you control. Lower with control. | Raise your heels only as high as you can control. Lower slowly. | Falta “can”; evitar repetir “control”. |
| ↳ | `extra.push.ladder.desc` | From the desk to the pike. Complete pushing. | Incline push-ups, desk pikes and slow lowering. | “Complete pushing” no se entiende como descripción de una rutina. |
| ↳ | `extra.glutes.stealth.name` | Invisible Glutes | Seated Glute Squeezes | El nombre actual suena cómico y no explica la práctica. |
| ↳ | `extra.glutes.stealth.desc` | Activate them seated. Fully invisible. | Gentle glute squeezes while seated. | Quitar el absoluto y el referente “them”. |
| ↳ | `extra.chair.squats.name` | Stand and Rise | Sit and Stand | “Stand” y “rise” describen prácticamente la misma acción. |
| ↳ | `extra.legs.standing.desc` | Toes up, then sit on air against the wall. | Toe raises followed by a wall sit. | “Sit on air” es un calco. |
| ↳ | `extra.legs.single.name` | Legs · Single | Legs · Single-leg Strength | “Single” aislado parece una etiqueta incompleta. |
| ↳ | `extra.core.plank.s6.instruction.action` | Last one. Back to the plank, body in a line. Breathe inside the tension. | Last one. Return to the plank with your body in a straight line. Keep breathing. | “Breathe inside the tension” no es una instrucción clara en inglés. |
| ↳ | `extra.grip.squeeze.s2.instruction.care` | Light pressure. Never into pain. | Use light pressure. Stop if it hurts. | Frase natural sin “never”, manteniendo la advertencia. |

### `content/extra.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/content/extra.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `content/extra.js` | `extra.cat.empezar.aside` | Two or three minutes, no forcing | Two or three minutes, without straining | “No forcing” suena traducido. |
| ↳ | `extra.cat.oficina.aside` | Antidote to the desk | A break from desk work | Evitar el calco. |
| ↳ | `extra.cat.hombros.aside` | Antidote to the keyboard | A break from typing | Mismo criterio. |
| ↳ | `extra.cat.caderas.aside` | Unlock the lower half | Movement for your hips and legs | “Unlock” sugiere un resultado físico; “lower half” es impreciso. |
| ↳ | `move.hips.5.desc` | 4 steps to unlock deep hips. Mostly on the floor. | 4 hip movements, mostly on the floor. | “Deep hips” no es una expresión natural. |
| ↳ | `move.neck.3.desc` | Back, a turn and to the sides, without pulling your head. | Chin tucks, gentle turns and side tilts. No pulling on your head. | La enumeración actual no permite imaginar las acciones. |
| ↳ | `move.hips.5.s3.instruction.care`, `move.couch.stretch.s3.instruction.care` | A cushion under the hip in the air, if you need it. If you feel your knee, come out of the pose. | Place a cushion under the raised hip if needed. Stop if you feel discomfort in your knee. | “Hip in the air” y “feel your knee” son calcos. |
| ↳ | `move.couch.stretch.desc` | Deep hip flexors against the wall, knee on the floor. The couch stretch. | A deeper hip-flexor stretch using a wall, with one knee on the floor. | La frase actual parece describir unos músculos “profundos”. |
| ↳ | `move.hamstrings.standing.s0.name`, `move.hamstrings.standing.s1.name`, `move.hamstrings.s1.name` | Single-leg hamstring | Single-leg hamstring stretch | El nombre actual designa un músculo, no un ejercicio. |
| ↳ | `move.chair.antidote.s6.instruction.action` | 3 deep inhales to close. | Take 3 deep breaths to finish. | “To close” no es natural para terminar una rutina. |
| ↳ | `move.wrists.s2.instruction.care` | Light pressure. Never into pain. | Use light pressure. Stop if it hurts. | Unificar con la misma instrucción de Mueve. |
| ↳ | `move.back.standing.s3.instruction.action` | Draw your shoulder blades toward the center and hold a moment. Release. | Gently draw your shoulder blades together. Hold briefly, then release. | Más natural y elimina la mezcla “center/centre”. Aplicar al mismo texto repetido en Mueve. |

### `content/custom.js` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/content/custom.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `content/custom.js` | `custom.cat.suelo.label` | Ground & Posterior Chain | Floor & Back of Body | “Posterior chain” es jerga; “floor” encaja mejor en interiores. |
| ↳ | `custom.cat.manos.label` | Wrists, Ankles & Pauses | Wrists, Ankles & Rest | “Pauses” no es el nombre natural de los descansos del catálogo. |
| ↳ | `custom.ex.Sentadilla búlgara.name` | Bulgarian squat | Bulgarian split squat | Nombre inglés más preciso. Aplicarlo también al paso homónimo de Mueve. |
| ↳ | `custom.ex.Puente con marcha.name` | Bridge with march | Marching bridge | Nombre más natural. Aplicarlo también al paso homónimo de Mueve. |
| ↳ | `custom.ex.Desliza el talón.cue` | On your back: slide one heel and back, waist still. | Lie on your back. Slide one heel away and back, keeping your pelvis still. | “Slide one heel and back” está incompleto; “waist still” es poco claro. |
| ↳ | `custom.ex.Cuello y trapecios.cue` | Ear to shoulder, gentle. | Gently tilt your ear towards your shoulder. | Frase completa y natural. |
| ↳ | `custom.ex.Giro sentado.cue`, `custom.ex.Seated twist.cue` | Rotate toward the backrest, gentle. | Gently turn towards the backrest. | “Gentle” debería ser “gently”. |
| ↳ | `custom.ex.Pliegue adelante.cue` | Feet hip-width apart, hang the trunk. Soft knees. | Feet hip-width apart. Let your upper body hang down, with knees slightly bent. | “Hang the trunk” suena traducido. |
| ↳ | `custom.ex.Isquio a una pierna.name` | Single-leg hamstring | Single-leg hamstring stretch | Mantener el mismo nombre en constructor y catálogo. |
| ↳ | `custom.ex.Reset respiración.cue` | Deep inhales to close. | Take deep breaths to finish. | Más natural. |

### `strings/achievements.js` y `content/achievements.js` — [Fuentes: interfaz](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/achievements.js) · [contenido](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/content/achievements.js)

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/achievements.js` | `ach.subtitle` | Field notebook stamps. Growing collection. Explore, don't compete. | A growing collection of field-notebook stamps. Explore, don’t compete. | La primera parte parece una concatenación de etiquetas. |
| `content/achievements.js` | `ach.item.first.extra.title` | First calisthenics | First Move | “First calisthenics” no es natural como nombre de un primer logro. |
| ↳ | `ach.item.first.return.title` | You return | Welcome back | Más natural y cercano. |
| ↳ | `ach.item.stats.month.first.desc` | Twenty days with pace in a single month | Twenty active days with PACE in a single month | “With pace” suena traducido y puede leerse como “con velocidad”. |
| ↳ | `ach.item.stats.year.first.desc` | Twelve months with pace, without missing one | Activity with PACE in all twelve months | Mismo problema y frase más breve. |
| ↳ | `ach.item.explore.478.desc` | Three sessions of the calming one | Three 4·7·8 sessions | “The calming one” no identifica bien la rutina y promete un efecto. |
| ↳ | `ach.item.explore.bhastrika.desc` | Three sessions of the energising pranayama | Three Bhastrika sessions | Identifica la técnica sin prometer un resultado. |
| ↳ | `ach.item.master.midnight.never.title` | Never at midnight | Before midnight | Quitar el absoluto del título. No cambiar el identificador. |
| ↳ | `ach.item.secret.dark.mode.desc` | 7 days in dark | 7 days in dark mode | Falta “mode”. |

## Páginas web

### `premium/index.html` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/premium/index.html)

En HTML sin clave de traducción uso el selector o la ubicación como identificador. En los atributos `data-en-html`, las propuestas se refieren al texto: conservar los enlaces y sus destinos.

| Archivo | Clave / ubicación | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `premium/index.html` | Portada · `h1[data-en]` | Active breaks for people who work sitting down. | Active breaks for people who work at a desk. | Más idiomático para el público de PACE. |
| ↳ | Portada · `.lede[data-en]` | Focus, breathing, mobility and water, at your own pace. No account, no ads, no tracking: what is yours stays on your device. | Focus, breathing, mobility and water. At your pace. No account, ads or tracking. Your data stays on your device. | Quitar “what is yours” y respetar la expresión elegida. |
| ↳ | Lista gratuita | The whole Focus | All Focus features | “The whole Focus” no suena natural. |
| ↳ | Lista gratuita | Pomodoro, breaks and alert | Pomodoro, breaks and reminders | “Alert” aislado resulta extraño. |
| ↳ | Lista gratuita · Hydrate | your glasses of the day | your daily water log | Evitar el calco. |
| ↳ | Lista gratuita | Achievements, today and the week | Achievements, daily and weekly stats | Explica qué son “today and the week”. |
| ↳ | Lista de pago | The deeper routines | More in-depth routines | Unificar con la app. |
| ↳ | Lista de pago | A week shaped to you | A week tailored to you | Unificar con la app. |
| ↳ | `#precio h2` | Two ways to have it | Two ways to get PACE Complete | “Have it” es poco preciso para comprar. |
| ↳ | Plan de por vida · `.sub` | one payment, for good | one payment, lifetime access | Unificar la compra de por vida. |
| ↳ | Plan mensual · `.pronto` | Arrives with version 1 | Coming with version 1 | Más natural. |
| ↳ | `.donde` · párrafo sobre datos | Your data stays on each device and is not synced; you carry it from one to another with a copy. If you lose your code, you get it back with your email: you recover access, not your history. | Your data stays on each device and doesn’t sync. Move it between devices using a backup. If you lose your code, recover it with your email and receipt number. This restores access, not your history. | Más natural y coherente con los datos que pide Recuperar. |
| ↳ | `data-premium-recuperar` | Open your code's link in the new one, or carry it inside the «Your data» copy. If you lose it, you get it back with your email and the receipt number. | Open your activation link in the new browser, or import a backup from “Your data”. If you lose your code, recover it with your email and receipt number. | “Carry it inside the copy” es un calco. |
| ↳ | FAQ · datos | It stays on your device. Neither the purchase nor the code send your practice anywhere. | Your data stays on your device. Buying PACE Complete or activating a code doesn’t upload your activity history. | Evitar “your practice” y la construcción “neither… nor… send”. |
| ↳ | FAQ · devolución | Yes, within 14 days, no questions asked. Write to us and we refund it. | Yes. Contact us within 14 days of purchase for a refund. No reason needed. | Inglés natural y plazo de solicitud más claro. |
| ↳ | Enlace de desistimiento | Withdraw from contract here | Withdraw from the contract here | Falta el artículo. |

### `beta/index.html` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/beta/index.html)

| Archivo | Clave / ubicación | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `beta/index.html` | `.kicker` | PACE · Android and iPhone test | PACE · Android and iPhone beta | “Beta” es el término habitual para esta página. |
| ↳ | Portada · `h1` | Try PACE on Android or iPhone before anyone else. | Try PACE on Android or iPhone before launch. | “Before anyone else” es un absoluto innecesario. |
| ↳ | Portada · `.lede` | Active breaks for people who work sitting down: focus, breathing, mobility and water, at your own pace. | Active breaks for desk work. Focus, breathing, mobility and water. At your pace. | Más natural, corto y coherente con la portada de Premium. |
| ↳ | Android · paso 2 | With the same account: accept the test and install PACE from Play. It can take a few minutes to show up. | Use the same Google account to join the test and install PACE from Google Play. The app may take a few minutes to appear. | “Accept the test” suena traducido. |
| ↳ | Android · paso 3 | Keep it for 14 days | Keep PACE installed for 14 days | Explica qué significa “tenerla”. |
| ↳ | iPhone · paso 3 | Use it and tell us | Try it and share your feedback | La actual parece incompleta. |
| ↳ | FAQ · durante la prueba | All of PACE is open, the paid part too, until version 1. | All PACE features, including PACE Complete, are available until version 1. | “The paid part” es impreciso y “open” suena traducido. |
| ↳ | Captura de respiración · `data-en-alt` | Breathe: a guided technique, with voice | Breathe: a guided technique with voice cues | “With voice” resulta incompleto. |

### `gracias/index.html` y `recuperar/index.html` — [Fuentes: Gracias](https://raw.githubusercontent.com/ezradesign/Pace_app/refs/heads/main/gracias/index.html) · [Recuperar](https://raw.githubusercontent.com/ezradesign/Pace_app/refs/heads/main/recuperar/index.html)

| Archivo | Clave / ubicación | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| Ambos | Párrafo de activación | Open it here and PACE Complete stays on in this browser. | Use your code to activate PACE Complete in this browser. | “Stays on” parece indicar que la app permanece encendida. |
| Ambos | Botón `mailto` | Send it to me | Email myself | Más corto y aclara que la persona envía el correo. |
| Ambos | Nota bajo el código | Keep it: it opens PACE Complete in another browser or on another computer. «Send it to me» opens your own email with the code inside; it does not go through us. | Save your code to activate PACE Complete in another browser or on another computer. “Email myself” opens a draft in your email app. You send it yourself; we don’t send the email. | Explica la acción real y elimina “with the code inside”. |
| `gracias/index.html` | Confirmación del pago | With a card it takes a few seconds; with a SEPA direct debit and similar methods, a few days. Stripe confirms it, not us. | Card payments usually take a few seconds to confirm. SEPA direct debit and similar methods can take a few days. Confirmation comes from Stripe. | Evitar tiempos presentados como garantías y un cierre que suena defensivo. |
| ↳ | Enlace de desistimiento | Withdraw from contract here | Withdraw from the contract here | Falta el artículo. |
| `recuperar/index.html` | Formulario · `.lede` | With the email you paid with and your receipt number. We find the purchase in Stripe and give you your code again. | Enter the email used for your purchase and your receipt number. We’ll look up your purchase in Stripe and recover your code. | La primera frase actual es un fragmento traducido. |

### `desistir/index.html` — [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/refs/heads/main/desistir/index.html)

| Archivo | Clave / ubicación | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `desistir/index.html` | Introducción · `.lede` | You have 14 days from buying, or from starting the subscription, to withdraw without giving a reason. We refund everything you paid. | You can withdraw within 14 days of your purchase or the start of your subscription. No reason is needed. We’ll refund the full amount paid. | Más natural sin cambiar el contenido del texto. |
| ↳ | `data-desistir-cerrada` | This form is not open yet. You can withdraw by email: it is just below. | This form isn’t available yet. You can withdraw by email using the address below. | “It is just below” no deja claro qué hay debajo. |
| ↳ | Nota de privacidad | Your name, your email and the number go to whoever sells PACE, to refund you and send you the acknowledgement. PACE does not keep them. | Your name, email and receipt number are sent to the seller of PACE to process your refund and acknowledge your withdrawal. They are not stored in the app. | “Whoever sells PACE” inspira desconfianza y “the number” es ambiguo. Revisar también la precisión del español. |
| ↳ | Botón de descarga | Download the acknowledgement | Download confirmation | Más corto para un botón y menos burocrático. |
| ↳ | `dt` del acuse | Purchase email | Email used for purchase | La actual puede entenderse como el correo de confirmación de compra. |

## Aparte: el inglés no dice lo mismo que el español

| Archivo | Clave | Texto actual | Propuesta | Por qué |
|---|---|---|---|---|
| `strings/sessions.js` | `session.hold` | Hold your breath | Hold after exhaling | El español dice **«Retén sin aire»**. El inglés pierde la indicación de que la retención viene después de exhalar. |
| `strings/sessions.body.js` | `lib.empty.floor.n` | Every routine in {g} needs the floor. | All {n} routines in {g} need floor space. | El español incluye **`{n}`**; el inglés lo ha eliminado. Hay que recuperarlo, no modificar el marcador. |
| ↳ | `lib.empty.any.n` | Every routine in {g} falls outside this filter. | None of the {n} routines in {g} match this filter. | Mismo marcador perdido y redacción poco natural. |
| `content/breathe.js` | `breathe.phase.inhala.mas` | Inhale again | Inhale a little more | En `strings/sessions.js` figura “Inhale more”, pero este archivo lo sobrescribe con “again”. **«Inhala más»** no indica empezar otra inhalación independiente. |
| `content/custom.js` | `custom.ex.Encogimiento de hombros.name`, `custom.ex.Shrug + round.name` | Shrug + round | Shoulder shrugs | El español actual describe **subir los hombros y relajarlos**, no añadir una rotación. El mismo nombre aparece en `content/extra.js`, `move.desk.quick.s0.name`. |
| `content/custom.js` | `custom.cat.manos.label` | Wrists, Ankles & Pauses | Wrists, Ankles & Rest | En este contexto, **«pausas»** se refiere a descansos de la rutina, no a la acción de pausar la reproducción. |
| `premium/index.html` | Párrafo de recuperación dentro de `.donde` | If you lose your code, you get it back with your email | If you lose your code, recover it with your email and receipt number | No es una divergencia exclusiva de la traducción: **ambos idiomas simplifican demasiado** frente al formulario, que pide correo y recibo. Corregir los dos. |
| `strings/achievements.js` / `strings/ui.js` | `ach.title` / `sidebar.latest` | Achievements / Latest stamp | Achievements / Latest achievement | El español usa **«Logros» / «Último logro»**. El inglés cambia a “stamp” solo en la barra lateral. Mantendría “stamp” para el objeto coleccionable y “achievement” para el logro. |
