# Textos en inglés · lo que se hace con cada propuesta de ChatGPT

Generado desde `revision.md` (la respuesta entera de ChatGPT, 7 nov. 2026). «Hoy» es el texto del código en `main` 0.192.0, comprobado clave a clave: las 257 claves que cita tienen hoy exactamente ese texto. «Queda» es lo que se pone si Ez dice sí. Estados: **pongo** (tal cual), **retoco** (con otro texto, y el porqué), **no** (se queda como está, o con mi texto), **Ez Pn** (espera su letra).

| n | Archivo | Clave | Hoy | Queda | Estado | Nota |
|---|---|---|---|---|---|---|
| 0 | `strings/ui.js` | `welcome.cta` | Begin | Start | pongo |  |
| 1 | `strings/ui.js` | `welcome.tagline` | Antidote to the chair. | (según la letra de Ez) | Ez P2 |  |
| 2 | `strings/ui.js` | `welcome.tagline.sub` | At your own pace. | At your pace. | pongo |  |
| 3 | `strings/ui.js` | `welcome.value.local.label`, `support.value.local.label` | Fully local | Stored locally | pongo |  |
| 4 | `strings/ui.js` | `welcome.value.free.sub` | the essentials, always | (según la letra de Ez) | Ez P5 |  |
| 5 | `strings/ui.js` | `welcome.intention.label` | What do you want to cultivate today? | (como está) | no | «cultivate» es el tono de PACE, y «focus on» se confunde con el módulo Foco |
| 6 | `strings/ui.js` | `support.title.sub` | And it always will be. | (según la letra de Ez) | Ez P5 |  |
| 7 | `strings/ui.js` | `support.value.forever.label` | Forever | (según la letra de Ez) | Ez P5 |  |
| 8 | `strings/ui.js` | `support.value.forever.sub` | the core, no strings | (según la letra de Ez) | Ez P5 |  |
| 9 | `strings/ui.js` | `support.cta` | If it takes care of you, help us keep it going. | If PACE looks after you, help us look after it. | retoco | guarda el juego de «Si te cuida, ayúdanos a cuidarlo» |
| 10 | `strings/ui.js` | `support.donated.title` | Marks a private stamp — on trust | Add a private stamp. No verification needed. | pongo |  |
| 11 | `strings/ui.js` | `sidebar.logo.title` | Tickling it? | Give the cow a tickle? | pongo |  |
| 12 | `strings/ui.js` | `sidebar.agua.ninguno` | None of {m} glasses | 0 of {m} glasses | pongo |  |
| 13 | `strings/ui.js` | `sidebar.action.resume.meta` | You left it unfinished | Pick up where you left off | retoco | más corto: es la línea pequeña de la barra lateral |
| 14 | `strings/ui.js` | `sidebar.action.now.meta` | Fits where you are | Fits your space | retoco | más corto y dice lo mismo |
| 15 | `strings/ui.js` | `sidebar.pausa.larga` | Long break of {x} | Long break · {x} | pongo |  |
| 16 | `strings/ui.js` | `topbar.cambio.body` | You have a Focus block under way. If you switch now, it is lost and does not count. | A Focus block is in progress. Switching now ends it without counting it. | pongo |  |
| 17 | `strings/ui.js` | `activity.move.sub` | active body | get moving | pongo |  |
| 18 | `strings/ui.js` | `activity.hydrate.sub` | water now | time for water | pongo |  |
| 19 | `strings/ui.js` | `notify.focus.body` | Cycle closed. Choose your micro-break. | Focus complete. Choose your break. | pongo |  |
| 20 | `strings/ui.js` | `red.parte.titulo` | This part could not open | This section couldn’t load | pongo |  |
| 21 | `strings/ui.js` | `red.global.texto` | This screen could not be drawn. What you have done is still saved on this device. | This screen couldn’t load. Your activity is still saved on this device. | pongo |  |
| 22 | `strings/ui.js` | `red.global.pie` | If it happens again, keep the copy: it can be recovered from it. | If this happens again, keep the backup. It may help recover your data. | pongo |  |
| 23 | `strings/onboarding.js` | `onboarding.welcome.cta` | Begin | Start | pongo |  |
| 24 | `strings/onboarding.js` | `onboarding.need.title` | What do you want to cultivate? | (como está) | no | igual que la anterior |
| 25 | `strings/onboarding.js` | `onboarding.need.focus.sub` | truly concentrate | stay focused | pongo |  |
| 26 | `strings/onboarding.js` | `onboarding.need.body.sub` | move, undo the chair | move more, take a break from sitting | pongo |  |
| 27 | `strings/onboarding.js` | `onboarding.time.pause` | A pause | A break | pongo |  |
| 28 | `strings/onboarding.js` | `visita.act.texto` | Breathe, Stretch and Move, with short routines, and Hydrate, for your glasses of water. Whenever you like. | Try short routines in Breathe, Stretch and Move. Log your water in Hydrate. Whenever you like. | pongo |  |
| 29 | `strings/onboarding.js` | `visita.dia.texto` | Each morning, “At your pace” plans your day from your week: when to stop and what to do in each break. | Each morning, “At your pace” uses your weekly schedule to plan when to take a break and what to do. | pongo |  |
| 30 | `strings/onboarding.js` | `visita.ajustes.texto` | Language, palette, sound and your data. You can replay this tour from here. | Language, colour theme, sound and your data. You can take this tour again here. | pongo | ortografía según P1 |
| 31 | `strings/sessions.js` | `session.backToHome` | Back to home | Back to Home | pongo |  |
| 32 | `strings/sessions.js` | `session.notCountedCopy` | Under half a minute doesn’t count. Come back whenever you like. | Sessions under 30 seconds aren’t counted. Come back whenever you like. | pongo |  |
| 33 | `strings/sessions.js` | `session.notCountedCopy.sinTrabajo` | With no exercise done, it doesn’t count. Come back whenever you like. | This session wasn’t counted because no exercises were completed. Come back whenever you like. | pongo |  |
| 34 | `strings/sessions.js` | `session.hint` | Space pause · Esc exit | Space to pause · Esc to exit | pongo |  |
| 35 | `strings/sessions.js` | `focus.minutes.custom.title` | Custom minutes (5–180) | Custom duration (5–180 min) | pongo |  |
| 36 | `strings/sessions.js` | `focus.restartBlock` | Restart focus | Restart block | pongo |  |
| 37 | `strings/sessions.js` | `focus.start` | Start focus | Start Focus | pongo |  |
| 38 | `strings/sessions.js` | `focus.manual.label` | Manual focus | Manual Focus | pongo |  |
| 39 | `strings/sessions.js` | `focus.subtitle.pause` | Disconnect for 5 min | Step away for 5 min | pongo |  |
| 40 | `strings/sessions.js` | `breathe.phase.respira.suave` | Breathe easy | Breathe gently | pongo |  |
| 41 | `strings/sessions.js` | `breathe.phase.inhala.vientre` | Inhale into the belly | Breathe into your belly | pongo |  |
| 42 | `strings/sessions.js` | `breathe.phase.sosten.vacio` | Hold empty | Hold after exhaling | pongo |  |
| 43 | `strings/sessions.js` | `custom.locked.copy` | Combine exercises from the catalog and save your own routines. Part of PACE Complete. | Combine exercises from the catalogue and save your own routines. Part of PACE Complete. | pongo | ortografía según P1 |
| 44 | `strings/sessions.js` | `custom.empty.copy` | Combine exercises from the catalog and save your own routine. | Combine exercises from the catalogue and save your own routine. | pongo | ortografía según P1 |
| 45 | `strings/sessions.js` | `custom.save.comoNueva` | Save it as new | Save as new routine | pongo |  |
| 46 | `strings/sessions.js` | `breathe.safety.body.rule1.pre` | Practice it | Practise this technique | pongo | ortografía según P1 |
| 47 | `strings/sessions.js` | `breathe.safety.body.rule1.post` | , never standing | , never standing | no | en un aviso de seguridad el «never» es lo que toca; el español dice «nunca de pie» |
| 48 | `strings/sessions.js` | `breathe.safety.body.rule2` | Never in water, while driving or at height | Never practice it in water, while driving or at height | retoco | frase entera, sin perder el «never» del aviso; ortografía según P1 |
| 49 | `strings/sessions.js` | `breathe.safety.body.rule3` | Do not practice if you have epilepsy, hypertension, heart disease or a hernia, or if pregnant | Do not practise if you have epilepsy, high blood pressure, heart disease or a hernia, or if you are pregnant | pongo | ortografía según P1 |
| 50 | `strings/sessions.body.js` | `lib.move.subtitle` | Calisthenics and strength. Short, discreet, no equipment. | (según la letra de Ez) | Ez P4 | el español también dice «sin equipo» |
| 51 | `strings/sessions.body.js` | `lib.move.meta` | Active body | Get moving | pongo |  |
| 52 | `strings/sessions.body.js` | `lib.extra.subtitle` | Mobility and stretching. Antidote to the chair. | (según la letra de Ez) | Ez P2 |  |
| 53 | `strings/sessions.body.js` | `lib.intensity.strong` | Strong | Intense | pongo |  |
| 54 | `strings/sessions.body.js` | `lib.now` | For now | For right now | pongo |  |
| 55 | `strings/sessions.body.js` | `lib.rhythm.co2` | hold on empty | hold after exhaling | pongo |  |
| 56 | `strings/sessions.body.js` | `preview.need.none` | Nothing. Just you and wherever you are. | Nothing. Just you, wherever you are. | retoco | natural y sin perder el tono |
| 57 | `strings/sessions.body.js` | `preview.need.unknown` | We don’t know what every step needs: check before you start. | Some step requirements are missing. Check the steps before you start. | pongo |  |
| 58 | `strings/sessions.body.js` | `preview.eq.wall` | A clear wall | Clear wall space | pongo |  |
| 59 | `strings/sessions.body.js` | `preview.eq.band` | An elastic band, if you have one | A resistance band, if you have one | pongo |  |
| 60 | `strings/sessions.body.js` | `session.beginStep` | Begin | Start | pongo |  |
| 61 | `strings/sessions.body.js` | `session.beginNow` | Begin now | Start now | pongo |  |
| 62 | `strings/sessions.body.js` | `session.placeCountdown` | to begin | to start | pongo |  |
| 63 | `strings/sessions.body.js` | `move.placeHintMano` | Get set, no rush · press Begin now | Get ready, no rush · press “Start now” | retoco | «tap» solo vale en el móvil |
| 64 | `strings/sessions.body.js` | `move.auto.title` | Move on by itself | Advance automatically | pongo |  |
| 65 | `strings/sessions.body.js` | `move.sideAutoHint` | The next side starts on its own | The other side starts automatically | pongo |  |
| 66 | `strings/sessions.body.js` | `move.auto.off` | Go at your own pace and tap › to go on. | Go at your pace and tap › to continue. | pongo |  |
| 67 | `strings/sessions.body.js` | `move.auto.prep` | Your pace · you decide when to go on. | At your pace · you decide when to continue. | pongo |  |
| 68 | `strings/sessions.body.js` | `move.unaBasta` | One is enough | One set is enough | pongo |  |
| 69 | `strings/sessions.body.js` | `move.pausa.texto` | You pick up from here. When you resume: 3, 2, 1 and the count goes on. | Resume from this point after a 3, 2, 1 countdown. | pongo |  |
| 70 | `strings/sessions.body.js` | `move.hint` | ← → navigate · Space pause · Esc exit | ← → to navigate · Space to pause · Esc to exit | pongo |  |
| 71 | `strings/breakmenu.js` | `break.subtitle` | You've closed a block. Pick your break. | You’ve finished a Focus block. Choose your break. | pongo |  |
| 72 | `strings/breakmenu.js` | `break.breathe.desc` | 2 min to return to center | 2 min to pause and breathe | pongo |  |
| 73 | `strings/breakmenu.js` | `break.stretch.desc` | Loosen the tension | Ease the tension | retoco | lo natural en inglés, y dice lo mismo que el español |
| 74 | `strings/breakmenu.js` | `break.move.desc` | Quick antidote to the chair | (según la letra de Ez) | Ez P2 |  |
| 75 | `strings/breakmenu.js` | `break.prop.sitting` | You finished a {n}-minute Focus | You finished a {n}-minute Focus block | pongo |  |
| 76 | `strings/breakmenu.js` | `break.ritmo.seguir` | Go on to block {n} | Continue to block {n} | pongo |  |
| 77 | `strings/breakmenu.js` | `break.ritmo.comer` | Go and eat | Take a lunch break | pongo |  |
| 78 | `strings/ritmo.js` | `ritmo.pregunta` | How many hours today? | How long are you working today? | pongo |  |
| 79 | `strings/ritmo.js` | `ritmo.sub` | Breaks are part of the time. I'll tell you when to pause and what to do. | Breaks are included. I’ll suggest when to stop and what to do. | pongo |  |
| 80 | `strings/ritmo.js` | `ritmo.frase.movil.empieza` | start it on the ring above | start with the timer above | pongo |  |
| 81 | `strings/ritmo.js` | `ritmo.libre` | I'll go freestyle today | I’ll go without a plan today | pongo |  |
| 82 | `strings/ritmo.js` | `ritmo.ctx.material` | No equipment, sometimes a wall or desk | Sometimes a wall or desk; no other equipment | pongo |  |
| 83 | `strings/ritmo.js` | `ritmo.sigue.cta` | Go on to {modulo} | Continue with {modulo} | pongo |  |
| 84 | `strings/ritmo.js` | `notify.ritmo.cierre` | To close the day: {plato} · {min} min | Wind down: {plato} · {min} min | pongo |  |
| 85 | `strings/ritmo.js` | `notify.ritmo.ultimo` | Block {n} of {total} done. That is your day. | Block {n} of {total} done. Your plan is complete. | pongo |  |
| 86 | `strings/ritmo.js` | `notify.fijo.cierre` | Then, to close the day: {plato} · {min} min | Then wind down: {plato} · {min} min | pongo |  |
| 87 | `strings/ritmo.js` | `notify.fijo.ultimo` | This one closes your day. | Your final Focus block today. | pongo |  |
| 88 | `strings/ritmo.js` | `ritmo.motivo.estira`, `break.prop.ritmo.estira` | Antidote to the chair | (según la letra de Ez) | Ez P2 |  |
| 89 | `strings/ritmo.js` | `ritmo.motivo.mueve`, `break.prop.ritmo.mueve` | Active body | Get moving | pongo |  |
| 90 | `strings/ritmo.js` | `ritmo.motivo.cierre`, `break.prop.ritmo.cierre` | To close the day | To wind down | pongo |  |
| 91 | `strings/ritmo.js` | `ritmo.frase.zona` | {zona}: unmoved today | {zona}: not moved yet today | retoco | «not yet today» suelto no se entiende |
| 92 | `strings/ritmo.js` | `ritmo.frase.larga` | Two hours: off the chair | Two hours: time to stand | pongo |  |
| 93 | `strings/ritmo.js` | `ritmo.frase.cierre` | To close, slowly | A gentle finish | pongo |  |
| 94 | `strings/ritmo.js` | `ritmo.aro.pausar` | Pause focus | Pause Focus | pongo |  |
| 95 | `strings/ritmo.js` | `ritmo.aro.reanudar` | Resume focus | Resume Focus | pongo |  |
| 96 | `strings/ritmo.js` | `ritmo.hora.tuya` | The one you have | Current time | pongo |  |
| 97 | `strings/ritmo.js` | `ritmo.hora.tenias` | You had {h} | Previously {h} | pongo |  |
| 98 | `strings/ritmo.js` | `ritmo.st.sub` | So each morning your day arrives ready. If a day is different, you change it that day. | Your daily plan will be ready each morning. You can adjust it whenever your schedule changes. | pongo |  |
| 99 | `strings/ritmo.js` | `ritmo.st.tipo.libre` | Free | No plan | pongo |  |
| 100 | `strings/ritmo.js` | `ritmo.st.ahoraNo` | Not now, I want to try it first | Not now, I’ll try it first | retoco | no pierde el «Ahora no» del español |
| 101 | `strings/calendario.js` | `cal.enlace` | To my calendar | Add to calendar | pongo |  |
| 102 | `strings/calendario.js` | `cal.resumen` | Adds what is left of today: {n} focus blocks with their breaks, from {a} to {b}. | Add the rest of today’s plan: {n} Focus blocks and their breaks, from {a} to {b}. | pongo |  |
| 103 | `strings/calendario.js` | `cal.resumen.uno` | Adds what is left of today: 1 focus block with its break, from {a} to {b}. | Add the rest of today’s plan: 1 Focus block and its break, from {a} to {b}. | pongo |  |
| 104 | `strings/calendario.js` | `cal.resumen.nada` | There is nothing left of today to add. | No more events to add today. | pongo |  |
| 105 | `strings/calendario.js` | `cal.dest.microsoft.sub` | Your work one too, if your company allows it | Your work calendar too, if your company allows access | pongo |  |
| 106 | `strings/calendario.js` | `cal.dest.archivo.sub` | Apple, Thunderbird… A file it can open | A calendar file for Apple Calendar, Thunderbird and other apps | pongo |  |
| 107 | `strings/calendario.js` | `cal.hecho.reuniones` | You have {r} meetings today and the day works around them. | Your plan works around your {r} meetings today. | pongo |  |
| 108 | `strings/calendario.js` | `cal.hecho.reuniones.una` | You have 1 meeting today and the day works around it. | Your plan works around today’s meeting. | retoco | «your 1 meeting» suena raro |
| 109 | `strings/calendario.js` | `cal.error.bloqueada` | The browser did not open the permission window. Let PACE open windows and tap again. | Your browser blocked the permission window. Allow pop-ups for PACE and try again. | pongo |  |
| 110 | `strings/calendario.js` | `cal.mantener.sub` | While PACE is open, if your day changes, it changes there too. Each break reminds you. | While PACE is open, changes to your plan also update your calendar. You’ll get a reminder for each break. | pongo |  |
| 111 | `strings/calendario.js` | `cal.mantener.sub.web` | In testing. While PACE is open and the permission lasts, if your day changes, it changes there too. Each break reminds you. | In testing. While PACE is open and calendar access is active, changes to your plan also update your calendar. You’ll get a reminder for each break. | pongo |  |
| 112 | `strings/calendario.js` | `cal.solo.resumen.pendiente` | Your day has changed since {h} and your calendar does not know yet. | Your plan has changed since {h}. Your calendar hasn’t updated yet. | pongo |  |
| 113 | `strings/calendario.js` | `cal.solo.resumen.pendiente.sin` | Your day has changed and your calendar does not know yet. | Your plan has changed. Your calendar hasn’t updated yet. | pongo |  |
| 114 | `strings/calendario.js` | `cal.btn.poner`, `cal.enlace.poner` | Bring up to date | Update calendar | pongo |  |
| 115 | `strings/calendario.js` | `cal.solo.nota.google` | Google lets PACE write for an hour at a time. «Bring up to date» opens its window, which closes by itself if you are still signed in. | Google grants PACE calendar access for one hour at a time. “Update calendar” opens a Google window. It closes automatically if you’re still signed in. | pongo |  |
| 116 | `strings/calendario.js` | `cal.solo.nota.microsoft` | Microsoft lets PACE write for a day at a time. «Bring up to date» opens its window, which closes by itself if you are still signed in. | Microsoft grants PACE calendar access for one day at a time. “Update calendar” opens a Microsoft window. It closes automatically if you’re still signed in. | pongo |  |
| 117 | `strings/calendario.js` | `cal.solo.nota.android` | PACE no longer has permission for the phone calendar. «Bring up to date» asks again. | PACE no longer has access to your phone calendar. “Update calendar” asks for permission again. | pongo |  |
| 118 | `strings/calendario.js` | `cal.desc.pregunta` | PACE will stop touching your calendar. What about the rest of today? | PACE will stop updating your calendar. Keep or remove the remaining PACE events today? | pongo |  |
| 119 | `strings/calendario.js` | `cal.desc.quitar` | Remove it | Remove events | pongo |  |
| 120 | `strings/calendario.js` | `cal.desc.dejar` | Leave it | Keep events | pongo |  |
| 121 | `strings/carta.js` | `ritmo.carta.ayudo` | Helped you | What helped | pongo |  |
| 122 | `strings/carta.js` | `ritmo.carta.corta` | The {hora} break, which you skipped on {n} days, becomes a 2-minute one. | You skipped the {hora} break on {n} days, so it’s now 2 minutes long. | pongo |  |
| 123 | `strings/carta.js` | `ritmo.carta.corta.dos` | The {hora} break, which you skipped on {n} days in two weeks, becomes a 2-minute one. | You skipped the {hora} break on {n} days over two weeks, so it’s now 2 minutes long. | pongo |  |
| 124 | `strings/carta.js` | `ritmo.carta.inicio` | You start at {hora}. Shall I set your start to {hora}? | You start at {hora}. Set your start time to {hora}? | pongo |  |
| 125 | `strings/carta.js` | `ritmo.carta.inicio.dia` | On {dias} you start at {hora}. Shall I make {hora} your start on {dias}? | You start at {hora} on {dias}. Set your start time to {hora} on {dias}? | pongo |  |
| 126 | `strings/carta.js` | `ritmo.carta.salida` | You finish at {hora}. Shall I set your finish to {hora}? | You finish at {hora}. Set your finish time to {hora}? | pongo |  |
| 127 | `strings/carta.js` | `ritmo.carta.salida.dia` | On {dias} you finish at {hora}. Shall I make {hora} your finish on {dias}? | You finish at {hora} on {dias}. Set your finish time to {hora} on {dias}? | pongo |  |
| 128 | `strings/carta.js` | `ritmo.aprendido.descansa` | {rutina} rests until {fecha} | {rutina} is on hold until {fecha} | pongo |  |
| 129 | `strings/stats.js` | `stats.subtitle` | Soft metrics. No anxiety, no comparison. | A gentle look at your activity. No comparisons. | pongo |  |
| 130 | `strings/stats.js` | `stats.label.body`, `stats.month.total.move` | Body | Movement | pongo |  |
| 131 | `strings/stats.js` | `stats.hoy.libre` | Freestyle | Unplanned | pongo |  |
| 132 | `strings/stats.js` | `stats.ayuda.resto` | The rest will show up once there is enough to say it. | More insights will appear when there’s enough activity to spot a pattern. | pongo |  |
| 133 | `strings/stats.js` | `stats.ayuda.pronto.texto` | What repeats in your breaks and your Focus will show up here, once there is enough to say it. It fills in on its own: nothing more to do. | Patterns in your breaks and Focus sessions will appear here as you use PACE. There’s nothing extra to fill in. | pongo |  |
| 134 | `strings/stats.js` | `stats.ayuda.bien.ritmo` | At your pace already brings them sooner. | At your pace already schedules these breaks earlier. | pongo |  |
| 135 | `strings/stats.js` | `stats.ayuda.hora.todos` | All {n} of them {m} minutes long. | All {n} were {m} minutes long. | pongo |  |
| 136 | `strings/stats.js` | `stats.ayuda.hora.casi` | Nearly all of them {m} minutes long. | Nearly all were {m} minutes long. | pongo |  |
| 137 | `strings/stats.js` | `stats.ayuda.tras.frase` | After {a} of your {b} Focus blocks, a break. | You took a break after {a} of your {b} Focus blocks. | pongo |  |
| 138 | `strings/stats.js` | `stats.month.tooltip.focus` | min focus | min of Focus | pongo |  |
| 139 | `strings/stats.js` | `stats.month.tooltip.breathe` | min breathe | min in Breathe | pongo |  |
| 140 | `strings/stats.js` | `stats.month.tooltip.move` | min body | min of movement | pongo |  |
| 141 | `strings/stats.js` | `stats.year.activeDays` | {n} days with rhythm | {n} active days | pongo |  |
| 142 | `strings/stats.js` | `stats.year.activeDays.1` | 1 day with rhythm | 1 active day | pongo |  |
| 143 | `strings/stats.js` | `stats.year.maxStreak` | max streak: {n} days | longest streak: {n} days | pongo |  |
| 144 | `strings/stats.js` | `stats.year.maxStreak.1` | max streak: 1 day | longest streak: 1 day | pongo |  |
| 145 | `strings/settings.js` | `settings.sec.ver` | Look | Appearance | pongo |  |
| 146 | `strings/settings.js` | `settings.sec.oir` | Listen | Sound | retoco | la app dice «sound» en el resto |
| 147 | `strings/settings.js` | `settings.datos.abrir` | Copies, delete and PACE Complete | Backups, data deletion and PACE Complete | pongo |  |
| 148 | `strings/settings.js` | `settings.palette` | Palette | Colour theme | pongo | ortografía según P1 |
| 149 | `strings/settings.js` | `settings.timer.analogico` | Analog | Analogue | pongo | ortografía según P1 |
| 150 | `strings/settings.js` | `settings.signal` | Marks the phase | Phase cue | pongo |  |
| 151 | `strings/settings.js` | `settings.bg` | In the background | Background audio | pongo |  |
| 152 | `strings/settings.js` | `settings.notify.fallo.android` | Android did not let PACE set the last end-of-focus alert. | PACE couldn’t schedule the latest Focus reminder on Android. | pongo |  |
| 153 | `strings/settings.js` | `settings.notify.fallo.ios` | iPhone did not let PACE set the last end-of-focus alert. | PACE couldn’t schedule the latest Focus reminder on iPhone. | pongo |  |
| 154 | `strings/settings.js` | `settings.data.export` | Export a copy | Export backup | pongo |  |
| 155 | `strings/settings.js` | `settings.data.import` | Import a copy | Import backup | pongo |  |
| 156 | `strings/settings.js` | `settings.data.rescate` | Download the rescue copy | Download recovery backup | pongo |  |
| 157 | `strings/settings.js` | `settings.license` | License | Licence | pongo | ortografía según P1 |
| 158 | `strings/settings.js` | `settings.msg.exported` | Copy downloaded. | Backup downloaded. | pongo |  |
| 159 | `strings/settings.js` | `settings.msg.exported.app` | Copy ready: choose where to save it. | Backup ready. Choose where to save it. | pongo |  |
| 160 | `strings/settings.js` | `settings.msg.export.cancel` | Copy cancelled. | Export cancelled. | pongo |  |
| 161 | `strings/settings.js` | `settings.msg.import.invalid` | That file is not a PACE copy. | This file isn’t a PACE backup. | pongo |  |
| 162 | `strings/settings.js` | `settings.import.cuerpo` | The copy has {logros} achievements and {foco} min of focus. What PACE has now is replaced by the copy, not merged, and it cannot be undone. | This backup contains {logros} achievements and {foco} min of Focus. It will replace your current PACE data, not merge with it. This can’t be undone. | pongo |  |
| 163 | `strings/sobre.js` | `sobre.nuevas` | The envelope, with unread things | The envelope, with unread messages | pongo |  |
| 164 | `strings/premium.js` | `premium.inc.routines` | The deeper routines | More in-depth routines | pongo |  |
| 165 | `strings/premium.js` | `premium.inc.letter` | A week shaped to you | A week tailored to you | pongo |  |
| 166 | `strings/premium.js` | `premium.v1` | Arrives with version 1. | Coming with version 1. | pongo |  |
| 167 | `strings/premium.js` | `premium.ok.title` | PACE Complete is yours, for good. | PACE Complete is yours, for life. | retoco | preciso y sin perder el calor; «Lifetime» queda para la etiqueta |
| 168 | `strings/premium.js` | `premium.settings.forever` | For good | Lifetime access | pongo |  |
| 169 | `strings/premium.js` | `premium.settings.desistir` | Withdraw from contract here | Withdraw from the contract here | pongo |  |
| 170 | `strings/premium.js` | `premium.settings.sinred` | No connection to renew | Connect to renew access | pongo |  |
| 171 | `strings/premium.js` | `premium.trial.body` | On {fecha} the first month is charged: {precio}. To keep going, do nothing. | You’ll be charged {precio} for your first month on {fecha}. No action is needed to continue. | pongo |  |
| 172 | `strings/premium.js` | `premium.trial.cancel` | If not, cancel it now, in two taps. PACE Complete stays open until {dia}. | If not, you can cancel now in two taps. You keep PACE Complete until {dia}. | no | ChatGPT se inventa «cancel in Settings»: el botón para cancelar está en la misma hoja, debajo |
| 173 | `strings/premium.js` | `premium.trial.keep` | Keep the trial | Continue trial | pongo |  |
| 174 | `strings/premium.js` | `premium.onb.vida` | I would rather pay once, {vida} | I’d rather pay once: {vida} | retoco | las opciones de la app hablan en primera persona |
| 175 | `strings/premium.js` | `premium.onb.vida.sola` | One payment of {vida}, for good. | One payment of {vida} for lifetime access. | pongo |  |
| 176 | `strings/premium.js` | `premium.onb.comprar` | Buy, {vida} | Buy for {vida} | pongo |  |
| 177 | `strings/premium.js` | `premium.compra.error` | The purchase couldn't open. Try again. | Checkout couldn’t open. Try again. | pongo |  |
| 178 | `strings/premium.js` | `premium.pasov1.cuerpo` | From today, PACE Complete is paid. Since you were already using PACE, you have all of it until {fecha}, with no card and nothing to pay. | PACE Complete now requires a purchase. As an existing PACE user, you can keep using all its features until {fecha}. No card or payment needed. | pongo |  |
| 179 | `content/breathe.js` | `breathe.cat.energia.aside` | Wakes up the system | (según la letra de Ez) | Ez P3 |  |
| 180 | `content/breathe.js` | `breathe.cat.equilibrio.label` y códigos con valor `Equilibrium` | Equilibrium | Balance | pongo | solo la etiqueta en inglés: el `code` interno no se toca |
| 181 | `content/breathe.js` | `breathe.cat.equilibrio.aside` | Regulates the nervous system | (según la letra de Ez) | Ez P3 |  |
| 182 | `content/breathe.js` | `breathe.cat.relajacion.aside` | Quiets the mind | (según la letra de Ez) | Ez P3 |  |
| 183 | `content/breathe.js` | `breathe.box.4.desc` | Perfect square. Mental calm and sustained focus. | (según la letra de Ez) | Ez P3 |  |
| 184 | `content/breathe.js` | `breathe.box.6.desc` | Deeper version | Six seconds for each phase. | pongo |  |
| 185 | `content/breathe.js` | `breathe.coherent.55.desc` | A steady five-and-five rhythm. Meant to find an even cadence. | Breathe in for five seconds and out for five. | pongo |  |
| 186 | `content/breathe.js` | `breathe.coherent.66.desc` | Deeper version. 5 cycles per minute. | Six seconds in, six seconds out. 5 cycles per minute. | pongo |  |
| 187 | `content/breathe.js` | `breathe.diaphragm.name` | Diaphragmatic | Diaphragmatic Breathing | pongo |  |
| 188 | `content/breathe.js` | `breathe.diaphragm.desc` | Breathe into the belly. The base of everything else. | (según la letra de Ez) | Ez P3 |  |
| 189 | `content/breathe.js` | `breathe.co2.desc` | Exhale and hold empty. Train calm with less air. | (según la letra de Ez) | Ez P3 |  |
| 190 | `content/breathe.js` | `breathe.yin.desc` | Soft rhythm with rest after the exhale. Stillness settles in. | (según la letra de Ez) | Ez P3 |  |
| 191 | `content/breathe.js` | `breathe.bhramari.desc` | Exhale with a low hum. The mind grows quiet. | (según la letra de Ez) | Ez P3 |  |
| 192 | `content/move.js` | `mueve.cat.empezar.aside` | Two or three minutes, low doses | Two or three minutes, a gentle start | pongo |  |
| 193 | `content/move.js` | `mueve.cat.sigilo.label` | Stealth | Discreet | pongo |  |
| 194 | `content/move.js` | `mueve.cat.sigilo.aside` | No one notices | (según la letra de Ez) | Ez P4 | ES «Nadie se entera» |
| 195 | `content/move.js` | `mueve.cat.mas.aside` | When the above feels short | When you feel ready for more | pongo |  |
| 196 | `content/move.js` | `extra.wall.sit.desc` | Quadriceps isometric against a wall. | Hold a seated position against a wall. | pongo |  |
| 197 | `content/move.js` | `extra.calves.desc` | Under the desk, no one notices. | (según la letra de Ez) | Ez P4 | ES «Bajo la mesa, nadie se entera» |
| 198 | `content/move.js` | `extra.calves.s0.instruction.action` | Raise your heels as high as you control. Lower with control. | Raise your heels only as high as you can control. Lower slowly. | pongo |  |
| 199 | `content/move.js` | `extra.push.ladder.desc` | From the desk to the pike. Complete pushing. | Incline push-ups, desk pikes and slow lowering. | pongo |  |
| 200 | `content/move.js` | `extra.glutes.stealth.name` | Invisible Glutes | (según la letra de Ez) | Ez P4 | ES «Glúteos invisibles» |
| 201 | `content/move.js` | `extra.glutes.stealth.desc` | Activate them seated. Fully invisible. | (según la letra de Ez) | Ez P4 | ES «Actívalos sentado…» |
| 202 | `content/move.js` | `extra.chair.squats.name` | Stand and Rise | Sit and Stand | pongo |  |
| 203 | `content/move.js` | `extra.legs.standing.desc` | Toes up, then sit on air against the wall. | Toe raises followed by a wall sit. | pongo |  |
| 204 | `content/move.js` | `extra.legs.single.name` | Legs · Single | Legs · Single-leg Strength | pongo |  |
| 205 | `content/move.js` | `extra.core.plank.s6.instruction.action` | Last one. Back to the plank, body in a line. Breathe inside the tension. | Last one. Return to the plank with your body in a straight line. Keep breathing. | pongo |  |
| 206 | `content/move.js` | `extra.grip.squeeze.s2.instruction.care` | Light pressure. Never into pain. | Use light pressure. Stop if it hurts. | pongo |  |
| 207 | `content/extra.js` | `extra.cat.empezar.aside` | Two or three minutes, no forcing | Two or three minutes, without straining | pongo |  |
| 208 | `content/extra.js` | `extra.cat.oficina.aside` | Antidote to the desk | (según la letra de Ez) | Ez P2 |  |
| 209 | `content/extra.js` | `extra.cat.hombros.aside` | Antidote to the keyboard | (según la letra de Ez) | Ez P2 |  |
| 210 | `content/extra.js` | `extra.cat.caderas.aside` | Unlock the lower half | Movement for your hips and legs | pongo |  |
| 211 | `content/extra.js` | `move.hips.5.desc` | 4 steps to unlock deep hips. Mostly on the floor. | 4 hip movements, mostly on the floor. | pongo |  |
| 212 | `content/extra.js` | `move.neck.3.desc` | Back, a turn and to the sides, without pulling your head. | Chin tucks, gentle turns and side tilts. No pulling on your head. | pongo |  |
| 213 | `content/extra.js` | `move.hips.5.s3.instruction.care`, `move.couch.stretch.s3.instruction.care` | A cushion under the hip in the air, if you need it. If you feel your knee, come out of the pose. | Place a cushion under the raised hip if needed. Stop if you feel discomfort in your knee. | pongo |  |
| 214 | `content/extra.js` | `move.couch.stretch.desc` | Deep hip flexors against the wall, knee on the floor. The couch stretch. | A deeper hip-flexor stretch using a wall, with one knee on the floor. | pongo |  |
| 215 | `content/extra.js` | `move.hamstrings.standing.s0.name`, `move.hamstrings.standing.s1.name`, `move.hamstrings.s1.name` | Single-leg hamstring | Single-leg hamstring stretch | pongo |  |
| 216 | `content/extra.js` | `move.chair.antidote.s6.instruction.action` | 3 deep inhales to close. | Take 3 deep breaths to finish. | pongo |  |
| 217 | `content/extra.js` | `move.wrists.s2.instruction.care` | Light pressure. Never into pain. | Use light pressure. Stop if it hurts. | pongo |  |
| 218 | `content/extra.js` | `move.back.standing.s3.instruction.action` | Draw your shoulder blades toward the center and hold a moment. Release. | Gently draw your shoulder blades together. Hold briefly, then release. | pongo |  |
| 219 | `content/custom.js` | `custom.cat.suelo.label` | Ground & Posterior Chain | Floor & Back of Body | pongo |  |
| 220 | `content/custom.js` | `custom.cat.manos.label` | Wrists, Ankles & Pauses | Wrists, Ankles & Rest | pongo |  |
| 221 | `content/custom.js` | `custom.ex.Sentadilla búlgara.name` | Bulgarian squat | Bulgarian split squat | pongo |  |
| 222 | `content/custom.js` | `custom.ex.Puente con marcha.name` | Bridge with march | Marching bridge | pongo |  |
| 223 | `content/custom.js` | `custom.ex.Desliza el talón.cue` | On your back: slide one heel and back, waist still. | Lie on your back. Slide one heel away and back, keeping your pelvis still. | pongo |  |
| 224 | `content/custom.js` | `custom.ex.Cuello y trapecios.cue` | Ear to shoulder, gentle. | Gently tilt your ear towards your shoulder. | pongo | ortografía según P1 |
| 225 | `content/custom.js` | `custom.ex.Giro sentado.cue`, `custom.ex.Seated twist.cue` | Rotate toward the backrest, gentle. | Gently turn towards the backrest. | pongo | ortografía según P1 |
| 226 | `content/custom.js` | `custom.ex.Pliegue adelante.cue` | Feet hip-width apart, hang the trunk. Soft knees. | Feet hip-width apart. Let your upper body hang down, with knees slightly bent. | pongo |  |
| 227 | `content/custom.js` | `custom.ex.Isquio a una pierna.name` | Single-leg hamstring | Single-leg hamstring stretch | pongo |  |
| 228 | `content/custom.js` | `custom.ex.Reset respiración.cue` | Deep inhales to close. | Take deep breaths to finish. | pongo |  |
| 229 | `strings/achievements.js` | `ach.subtitle` | Field notebook stamps. Growing collection. Explore, don't compete. | A growing collection of field-notebook stamps. Explore, don’t compete. | pongo |  |
| 230 | `content/achievements.js` | `ach.item.first.extra.title` | First calisthenics | First Move | pongo |  |
| 231 | `content/achievements.js` | `ach.item.first.return.title` | You return | Welcome back | pongo |  |
| 232 | `content/achievements.js` | `ach.item.stats.month.first.desc` | Twenty days with pace in a single month | Twenty active days with PACE in a single month | pongo |  |
| 233 | `content/achievements.js` | `ach.item.stats.year.first.desc` | Twelve months with pace, without missing one | Activity with PACE in all twelve months | pongo |  |
| 234 | `content/achievements.js` | `ach.item.explore.478.desc` | Three sessions of the calming one | Three 4·7·8 sessions | pongo |  |
| 235 | `content/achievements.js` | `ach.item.explore.bhastrika.desc` | Three sessions of the energising pranayama | Three Bhastrika sessions | pongo |  |
| 236 | `content/achievements.js` | `ach.item.master.midnight.never.title` | Never at midnight | Before midnight | pongo |  |
| 237 | `content/achievements.js` | `ach.item.secret.dark.mode.desc` | 7 days in dark | 7 days in dark mode | pongo |  |
| 238 | `premium/index.html` | Portada · `h1[data-en]` | Active breaks for people who work sitting down. | Active breaks for people who work at a desk. | pongo |  |
| 239 | `premium/index.html` | Portada · `.lede[data-en]` | Focus, breathing, mobility and water, at your own pace. No account, no ads, no tracking: what is yours stays on your device. | Focus, breathing, mobility and water. At your pace. No account, ads or tracking. Your data stays on your device. | pongo |  |
| 240 | `premium/index.html` | Lista gratuita | The whole Focus | All Focus features | pongo |  |
| 241 | `premium/index.html` | Lista gratuita | Pomodoro, breaks and alert | Pomodoro, breaks and reminders | pongo |  |
| 242 | `premium/index.html` | Lista gratuita · Hydrate | your glasses of the day | your daily water log | pongo |  |
| 243 | `premium/index.html` | Lista gratuita | Achievements, today and the week | Achievements, daily and weekly stats | pongo |  |
| 244 | `premium/index.html` | Lista de pago | The deeper routines | More in-depth routines | pongo |  |
| 245 | `premium/index.html` | Lista de pago | A week shaped to you | A week tailored to you | pongo |  |
| 246 | `premium/index.html` | `#precio h2` | Two ways to have it | Two ways to get PACE Complete | pongo |  |
| 247 | `premium/index.html` | Plan de por vida · `.sub` | one payment, for good | one payment, lifetime access | pongo |  |
| 248 | `premium/index.html` | Plan mensual · `.pronto` | Arrives with version 1 | Coming with version 1 | pongo |  |
| 249 | `premium/index.html` | `.donde` · párrafo sobre datos | Your data stays on each device and is not synced; you carry it from one to another with a copy. If you lose your code, you get it back with your email: you recover access, not your history. | Your data stays on each device and doesn’t sync. Move it between devices using a backup. If you lose your code, recover it with your email and receipt number. This restores access, not your history. | pongo | también en español: /recuperar pide correo y número de recibo |
| 250 | `premium/index.html` | `data-premium-recuperar` | Open your code's link in the new one, or carry it inside the «Your data» copy. If you lose it, you get it back with your email and the receipt number. | Open your activation link in the new browser, or import a backup from “Your data”. If you lose your code, recover it with your email and receipt number. | pongo |  |
| 251 | `premium/index.html` | FAQ · datos | It stays on your device. Neither the purchase nor the code send your practice anywhere. | Your data stays on your device. Buying PACE Complete or activating a code doesn’t upload your activity history. | pongo |  |
| 252 | `premium/index.html` | FAQ · devolución | Yes, within 14 days, no questions asked. Write to us and we refund it. | Yes. Contact us within 14 days of purchase for a refund. No reason needed. | pongo |  |
| 253 | `premium/index.html` | Enlace de desistimiento | Withdraw from contract here | Withdraw from the contract here | pongo |  |
| 254 | `beta/index.html` | `.kicker` | PACE · Android and iPhone test | PACE · Android and iPhone beta | pongo |  |
| 255 | `beta/index.html` | Portada · `h1` | Try PACE on Android or iPhone before anyone else. | Try PACE on Android or iPhone before launch. | pongo |  |
| 256 | `beta/index.html` | Portada · `.lede` | Active breaks for people who work sitting down: focus, breathing, mobility and water, at your own pace. | Active breaks for desk work. Focus, breathing, mobility and water. At your pace. | pongo |  |
| 257 | `beta/index.html` | Android · paso 2 | With the same account: accept the test and install PACE from Play. It can take a few minutes to show up. | Use the same Google account to join the test and install PACE from Google Play. The app may take a few minutes to appear. | pongo |  |
| 258 | `beta/index.html` | Android · paso 3 | Keep it for 14 days | Keep PACE installed for 14 days | pongo |  |
| 259 | `beta/index.html` | iPhone · paso 3 | Use it and tell us | Try it and share your feedback | pongo |  |
| 260 | `beta/index.html` | FAQ · durante la prueba | All of PACE is open, the paid part too, until version 1. | All PACE features, including PACE Complete, are available until version 1. | pongo |  |
| 261 | `beta/index.html` | Captura de respiración · `data-en-alt` | Breathe: a guided technique, with voice | Breathe: a guided technique with voice cues | pongo |  |
| 262 | Ambos | Párrafo de activación | Open it here and PACE Complete stays on in this browser. | Use your code to activate PACE Complete in this browser. | pongo |  |
| 263 | Ambos | Botón `mailto` | Send it to me | Email myself | pongo |  |
| 264 | Ambos | Nota bajo el código | Keep it: it opens PACE Complete in another browser or on another computer. «Send it to me» opens your own email with the code inside; it does not go through us. | Save your code to activate PACE Complete in another browser or on another computer. “Email myself” opens a draft in your email app. You send it yourself; we don’t send the email. | pongo |  |
| 265 | `gracias/index.html` | Confirmación del pago | With a card it takes a few seconds; with a SEPA direct debit and similar methods, a few days. Stripe confirms it, not us. | Card payments usually take a few seconds to confirm. SEPA direct debit and similar methods can take a few days. Confirmation comes from Stripe. | pongo |  |
| 266 | `gracias/index.html` | Enlace de desistimiento | Withdraw from contract here | Withdraw from the contract here | pongo |  |
| 267 | `recuperar/index.html` | Formulario · `.lede` | With the email you paid with and your receipt number. We find the purchase in Stripe and give you your code again. | Enter the email used for your purchase and your receipt number. We’ll look up your purchase in Stripe and recover your code. | pongo |  |
| 268 | `desistir/index.html` | Introducción · `.lede` | You have 14 days from buying, or from starting the subscription, to withdraw without giving a reason. We refund everything you paid. | You can withdraw within 14 days of your purchase or the start of your subscription. No reason is needed. We’ll refund the full amount paid. | pongo |  |
| 269 | `desistir/index.html` | `data-desistir-cerrada` | This form is not open yet. You can withdraw by email: it is just below. | This form isn’t available yet. You can withdraw by email using the address below. | pongo |  |
| 270 | `desistir/index.html` | Nota de privacidad | Your name, your email and the number go to whoever sells PACE, to refund you and send you the acknowledgement. PACE does not keep them. | Your name, email and receipt number go to the seller of PACE, to refund you and send your acknowledgement. PACE does not keep them. | retoco | «not stored in the app» dice menos que el español |
| 271 | `desistir/index.html` | Botón de descarga | Download the acknowledgement | Download confirmation | pongo |  |
| 272 | `desistir/index.html` | `dt` del acuse | Purchase email | Email used for purchase | pongo |  |
| 273 | `strings/sessions.js` | `session.hold` | Hold your breath | Hold after exhaling | pongo | el español dice «Retén sin aire» |
| 274 | `strings/sessions.body.js` | `lib.empty.floor.n` | Every routine in {g} needs the floor. | All {n} routines in {g} need floor space. | pongo | falta {n} |
| 275 | `strings/sessions.body.js` | `lib.empty.any.n` | Every routine in {g} falls outside this filter. | None of the {n} routines in {g} match this filter. | pongo | falta {n} |
| 276 | `content/breathe.js` | `breathe.phase.inhala.mas` | Inhale again | Inhale more | retoco | basta con quitar el «again» de content/breathe.js, que pisa al «Inhale more» de sessions.js (la deuda D-1) |
| 277 | `content/custom.js` | `custom.ex.Encogimiento de hombros.name`, `custom.ex.Shrug + round.name` | Shrug + round | Shoulder shrugs | pongo | cambia el texto; la clave «Shrug + round» se queda, es el alias de las rutinas guardadas |
| 278 | `content/custom.js` | `custom.cat.manos.label` | Wrists, Ankles & Pauses | Wrists, Ankles & Rest | pongo |  |
| 279 | `premium/index.html` | Párrafo de recuperación dentro de `.donde` | If you lose your code, you get it back with your email | If you lose your code, recover it with your email and receipt number | pongo | la misma de arriba; en los dos idiomas |
| 280 | `strings/achievements.js` / `strings/ui.js` | `ach.title` / `sidebar.latest` | Achievements / Latest stamp | Achievements / Latest achievement | pongo |  |
