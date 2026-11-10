# Las pasadas 2, 3 y 4 de la auditoría externa, comprobadas punto a punto

Contra `origin/main` (v0.197.0, 6a78f010) el 10 nov. de 2026, leyendo código; /premium, /gracias, /beta y la raíz,
además, en vivo (`curl` con cabeceras de navegador). El texto entero, en `externa-10nov-pasadas-2-3-4.md`. Ninguna rama
sin juntar arregla nada de esto: `caza-rendimiento-9nov` solo quita fuentes del precache y `chatgpt-jornada-9nov` no toca
los avisos ni los sonidos. Códigos: **2.**, **3.** y **4.** por pasada; T su tabla de fallos, O «que encaje en la
oficina», V «que vuelvan», E «experiencia», B lo que el auditor da por bien hecho.

**Cuenta:** 38 afirmaciones, más una pregunta que deja abierta y 9 elogios. **31 ciertas, 4 a medias, 3 falsas.** De
las 35 que no son falsas: **23 nuevas** (varias amplían una fila que ya estaba), **7 ya en la cola**, **5 ya decididas
por Ez** y ninguna ya hecha. Los 9 elogios coinciden con lo leído (uno sin comprobar).

Las tres falsas: la analítica que dice ver en /premium y /gracias no está (2.0 y 2.4), y el permiso de alarmas exactas
que dice que falta sí se declara (4.F1).

## Pasada 2: la venta, la tabla de fallos y lo bien hecho

- **2.0** «/premium y /gracias ya llevan el script de analítica de Cloudflare» · **falso**: en vivo, ni la raíz, ni
  /premium, ni /gracias, ni /beta lo llevan (sin `cloudflareinsights` ni `beacon` en el HTML servido). En el repo solo
  está el hueco que espera el token de Ez (`premium/index.html:193`).
- **2.1** El iPhone llega a v1 con candados y sin forma de pagar · **a medias, ya decidido**: Ez metió el iPhone en v1
  **con la compra de Apple** (22 oct., `DECISIONES_PRODUCTO.md:200-219`; `ROADMAP.md:87`, punto 15). Lo que leyó el
  auditor es el comentario viejo de `app/state-compra.js:43` («EN EL IPHONE NO HAY TIENDA hasta después de v1»), que el
  propio `ROADMAP.md:264` da por anterior al 22 oct. Los códigos de Apple para los testers (/beta, `beta/index.html:246`):
  el plan son los «códigos de oferta» (`DECISIONES_PRODUCTO.md:216`); si Apple los da para una compra de por vida **no se
  puede saber leyendo**: hay que mirarlo en App Store Connect con la cuenta de Ez.
- **2.2** La petición de valoración se gasta durante la beta · **cierto y nuevo**: `app/ui/valoracion.js:52-58` cuenta
  las pausas enteras en Android y en el iPhone sin mirar si PACE sigue abierto hasta v1, y `pedida` se apunta para siempre
  (`:28-29`). Los 12 testers aún no han empezado (`STATE.md`), así que su quinta pausa entera gastará la única petición.
  Que en TestFlight y en la prueba cerrada de Play esa ventana no publique nada **no se puede saber leyendo** (el repo no
  lo documenta); cambiarlo es barato y no depende de eso.
- **2.3** El aviso «dos días antes de cobrar» solo sale si abren PACE · **cierto y nuevo**: es una hoja «al abrir PACE»
  (`app/ui/PremiumInvitacion.jsx:31-35`; Ez, 2A del 26 oct.). Quien no abra PACE esos dos días no la ve, y /premium lo
  promete (`premium/index.html:305`). Solo cuenta cuando exista la mensual (hasta v1 se vende solo la de por vida,
  `state-compra.js:14-18`). Cómo se porta el correo de recordatorio de Stripe con una prueba de 7 días **no se puede saber
  leyendo**: se mira en el panel de Stripe.
- **2.4** La CSP bloquearía la analítica y la app la llevaría · **falso**: no hay analítica en ninguna página (2.0), y
  `_headers:12-13` ya dice que, si /premium la enciende, sus dos dominios entran en la CSP antes (lo vigila
  `tests/cabeceras.spec.js`). Sin analítica en la app es decisión de Ez (15 oct., «Cómo se vende», punto 9).
- **2.5** La carta del lunes solo la ven quienes pagan · **cierto, ya en la cola**: decisión D-3 y filas 18 y 19.
- **2.6** El paso a v1 conserva toda rutina de pago abierta, «terminada o no» · **cierto; la regla, decidida; el detalle,
  nuevo**: `app/state-paso-v1.js:22-23` cuenta cualquier sesión del registro, terminada o no. Ez decidió el 15 oct. que se
  quedan «las rutinas premium que ya hizo alguna vez» (`DECISIONES_PRODUCTO.md:484`); que basten unos segundos dentro no
  lo decidió nadie. Va a las decisiones (D-5).
- **2.T1** /beta dice «sellos de cuaderno de campo, sin rachas» y hay logros de racha · **cierto y nuevo**: el texto
  alternativo de `beta/index.html:194` frente a «3 días seguidos» … «365 días seguidos» (`app/achievements/catalog.js:37-48`).
  Se arregla con la fila 20 de la cola o cambiando la frase.
- **2.T2** El service worker pide la página a la red sin tope de tiempo · **cierto y nuevo**: `sw.js:384-394`, `fetch`
  sin plazo y la copia solo en el `catch`. El efecto con una wifi mala **está por probar** (habría que medir con la red
  lenta del navegador).
- **2.T3** El precache baja dos versiones de cada dibujo, y las láminas de Caminos · **cierto; lo de Caminos ya en la
  cola (fila 31), los dibujos grandes nuevos**: 136 entradas en `app/glyphs/assets/ejercicios` (68 dibujos × `.min.webp` y
  `.webp`): 439 KB las pequeñas y **2.114 KB las grandes**; las 7 láminas de Caminos, 1.068 KB.
- **2.T4** En Android 14 las alarmas exactas vienen apagadas y solo se ofrecen desde Ajustes · **cierto, ya decidido**:
  `DECISIONES_TECNICAS_VIGENTES.md:229` (6 oct.): pedirla dentro del aviso abría la pantalla del sistema al salir de la app;
  por eso se ofrece en Ajustes, y no se usa `USE_EXACT_ALARM` porque Play lo reserva a despertadores y calendarios. Lo
  nuevo, menor: ofrecerla además en contexto (por ejemplo, al empezar el primer Foco en Android). Va con la fila de los
  avisos del móvil.
- **2.T5** «Rutina propia» en inglés y el manifiesto solo en castellano · **cierto y nuevo, menor**:
  `app/state-custom.jsx:77` guarda «Rutina propia» a pelo (la clave `custom.code` existe en `sessions.js:186`) y
  `manifest.webmanifest:6` es `"lang": "es"`. De paso: su atajo de Mueve dice «Abrir la biblioteca de movilidad», y Mueve
  es calistenia y fuerza; Estira no tiene atajo.
- **2.T6** La copia de datos es solo manual · **cierto y nuevo**: no hay ningún recordatorio de copia en `app/`. Amplía la
  fila 15 de la cola (pedir que no se borre en Safari).
- **2.B1** Las sesiones de Mueve y Estira acreditan minutos reales y se reanudan · **elogio, coincide**
  (`app/move/MoveSessionV1.jsx:14-20`; `MoveSessionV1.reanudar.jsx`).
- **2.B2** Importar una copia conserva el código comprado · **elogio, coincide** (`app/state-licencia.js:172-201`).
- **2.B3** La página de gracias aguanta pagos tardíos · **elogio, sin comprobar**.

## Pasada 3: los ejercicios, la oficina y la vuelta

- **3.1** Voz en Mueve y Estira · **cierto, ya en la cola** (fila 28, después de v1).
- **3.2** Los cambios dentro de un paso no se avisan · **cierto y nuevo**: «Círculos de brazos» de «Brazos libres» (16
  repeticiones, «cuatro adelante y cuatro atrás. Luego, el otro», `app/extra/extra.data.js:59-62`), «Rotación lenta»
  («Tres a cada lado», `:38-42`), «Círculos de tobillo» (16, `:146`), «Giro sentado» («Luego, al otro lado», `:201-203`) y
  «Desliza el talón» (`app/move/move.data.js:135`). El runner sí avisa el cambio de lado, pero solo en los pasos `perSide`
  (dos cuencos y 10 s, `MoveSessionV1.jsx:20`), y estos son `reps` o `timed`.
- **3.3** Más descanso que trabajo · **cierto en las cifras; el descanso de 30 s, decidido; quitarlo en las suaves,
  nuevo**: «Levántate y sube» suma 88 s de trabajo y 90 de descanso (`move.data.js:29-45`); «Piernas sin pasos», 94 y 90
  (`:85-100`). Las dos son «gentle» y gratis, y «Piernas sin pasos» puede ser la primera pausa del día sin pagar (3.O1). Los
  30 s salen del ajuste 20/30/45 (`DECISIONES_PRODUCTO.md:934`; `MoveSessionV1.support.jsx:63-69`); la base de los
  ejercicios da 10-30 s en actividad suave (`docs/product/BASE_MUEVE_ESTIRA.md:169`).
- **3.4** Cinco segundos para colocarse es poco · **a medias, ya decidido**: 5 s en la colocación automática
  (`MoveSessionV1.support.jsx:21`), pero la que pide suelo, pared o material cuenta al menos 20 s y «+15 s» suma más
  (`:25-29`). Esperar al toque es lo que Ez quitó: «Opción A del runner guiado: ningún paso espera a que pulses» (`:25`).
- **3.5** Con el sonido apagado no hay ritmo · **a medias; la vibración, nueva**: el runner declara un pulso visual por
  repetición con el contador «n de N» (`MoveSessionV1.jsx:17`); si se sigue sin sonido **está por probar**. No hay
  vibración: ni `vibrate` ni Haptics en `app/`.
- **3.6** «Fondos en silla» está mal etiquetada · **cierto, ya en la cola** (fila 11, la revisión del fisioterapeuta):
  `level: 'accessible'` con 12, 10 y 8 (`move.data.js:326-335`). Matiz: vive en «Para ir a más» (`CONTENT.md:205`) y «A tu
  ritmo» no la sirve nunca (no está en `RITMO_SERIES_META`, `app/ritmo/ritmo.series.js:50-80`).
- **3.7** Falta algo para los ojos y una pausa de caminar · **cierto y nuevo**: nada de ojos en los datos de Mueve,
  Estira ni Respira.
- **3.O1** La primera pausa del día, sin pagar, sale de flexiones en la mesa o sentadilla en la pared · **cierto, ya
  decidido**: «la primera pausa del día: Mueve, de pie» (Ez, 20 oct., `ritmo.series.js:9`) y lo gratis de pie son
  `extra.desk.pushups`, `extra.legs.standing` y `extra.chair.squats` (`:55-61`; la tercera no entra en los pozos, `:67-68`). Las
  discretas («Gemelos», «Glúteos en la silla») son de pago (`:70-72`). Lo que queda está en la fila 23 (la primera pausa
  del primer día, suave).
- **3.O2** Preguntar dónde trabajas (casa, despacho, oficina compartida) · **cierto y nuevo**: amplía la fila 25 (una
  pregunta en la bienvenida). Los datos de postura existen (`position`, `pie` en `RITMO_SERIES_META`).
- **3.O3** Una zona prioritaria · **cierto, ya en la cola** (fila 25, «¿qué te molesta más?»). El reparto puntúa por
  zonas (+3 / −3, `ritmo.series.js:25-29`), sin preferencia de la persona.
- **3.V1** Enseñar si la persona está mejor: una pregunta semanal · **cierto y nuevo**. Ojo con el tono: Ez fijó «nunca
  porcentajes, notas ni rachas» y «No es un consejo médico» en «Qué te ayuda» (`DECISIONES_PRODUCTO.md:130-134`).
- **3.V2** No hay progresión · **cierto y nuevo**: las dosis son fijas en los datos y «A tu ritmo» no sirve «Para ir a
  más» (`ritmo.series.js:70`, «sin «Con material» ni «Para ir a más»»).
- **3.V3** «¿Te ayudó?» se pregunta demasiado · **cierto y nuevo**: una vez por rutina y día (`app/state-feedback.jsx:19`,
  decidido en s116, `DECISIONES_PRODUCTO.md:979`); una jornada con 7 rutinas distintas lo pregunta 7 veces.
- **3.V4** El «No» no dice por qué · **cierto y nuevo**: cuatro botones, Sí, Un poco, No y Ahora no
  (`app/ui/SessionFeedback.jsx:117-130`). Pesa más de lo que dice: un «No» aparta la rutina de la propuesta una semana (Ez, 2A del
  5 nov.; `app/breakmenu/BreakMenu.support.jsx:48-55`), también si el motivo era «aquí no podía».
- **3.V5** Falta el aviso de inicio de jornada · **cierto, ya en la cola** (filas 4 y 17).

## Pasada 4: los avisos, la racha, los logros y la barra

- **4.F1** Al manifiesto de Android le falta `SCHEDULE_EXACT_ALARM` · **falso**: lo declara el complemento
  (`node_modules/@capacitor/local-notifications/android/src/main/AndroidManifest.xml:29`, versión 8.3.1, la de
  `package.json`) y entra al juntar los manifiestos; está escrito en `DECISIONES_TECNICAS_VIGENTES.md:229` («no se añade a
  mano») y en `docs/launch/google-play/contenido-de-la-app.md:111`.
- **4.F2** El fin de la pausa no avisa con la app en segundo plano · **cierto y nuevo**: el aviso nativo solo se programa
  con `focusMode === 'foco'` (`app/focus/FocusTimer.jsx:160`). Con «A tu ritmo» el aviso de fin de bloque ya dice a qué hora
  vuelves (Ez, 28 oct., A), pero al acabar la pausa no suena nada fuera de la app.
- **4.F3** Fin de Foco y fin de pausa suenan igual · **cierto y nuevo**: `playSound('pomodoro.end')` en los dos
  (`FocusTimer.jsx:39` y `:65`).
- **4.F4** La racha se pone a cero al abrir si faltó un día · **cierto, ya en la cola** (fila 20):
  `app/state-core.support.jsx:145-157`.
- **4.F5** Los logros de 7 a 365 días seguidos piden el fin de semana · **cierto, ya en la cola** (fila 20):
  `app/state-achievements.jsx:288-299`; «Semana hidratada» pide 8 vasos 7 días (`catalog.js:55`).
- **4.F6** Dos «planes del día» · **cierto y nuevo**: «Con un plan» («Completa el plan del día tres veces», `catalog.js:31`)
  y «Primer ritual» piden Mueve, Respira, Estira y agua el mismo día (`state-achievements.jsx:32`), no las pausas que sirve
  «A tu ritmo».
- **4.F7** Las pausas manuales duran 5 y 15 min fijos · **cierto y nuevo, menor**: `FocusTimer.jsx:19-21`. Va con la fila
  21 (esconder Foco/Pausa/Larga con la jornada en marcha).
- **4.E1** Las bibliotecas quedan escondidas en el móvil · **cierto y nuevo**: «esta es la única puerta que abre las
  tres» (`app/shell/Sidebar.jsx:192-193`), y en el móvil la barra es un cajón (`Sidebar.escala.jsx:63`). Un botón más en la
  home choca con la home sin scroll (s201): pide maqueta.
- **4.E2** Logros que premian trasnochar · **a medias, nuevo**: «Búho» (de 2 a 4 h, secreto, `catalog.js:126`) y «Ocaso»
  (cinco días con sesión después de las 21 h, `:117`) son ciertos; «120 minutos en un día» es «Retiro», 120 min de Respira y
  Mueve, no de trabajo (`state-achievements.jsx:195-201`); y ya existe «Nunca a medianoche» (`catalog.js:118`). Va a las
  decisiones (D-6).
- **4.E3** La barra lateral queda vacía al cerrar la jornada · **cierto, ya decidido**: 8 oct.
  (`app/shell/Sidebar.selectors.js:203-207`); el auditor lo sabe. «Mañana a las 9:00, bloque 1» sería una excepción a esa
  regla: no entra sin que Ez la pida.
- **4.P** «No he comprobado si terminar un bloque de Foco mantiene la racha» · **sí la mantiene**: `app/state-timer.jsx:54`
  llama a `updateStreak()` al acabar un bloque.
- **4.B1** El reloj va por hora real · **elogio, coincide** (`FocusTimer.jsx:14-18`, `useCountdown.jsx`).
- **4.B2** La campana de Android suena una vez y los avisos van en cola · **elogio, coincide** (`app/ui/android.avisos.js:22`).
- **4.B3** Un aviso de logro por sesión · **elogio, coincide** (`flushAchievementToast('focus')`, `state-timer.jsx:55`);
  «explorar pide tres sesiones», sin comprobar.

## Qué aportan, en una frase por pasada

- **La 2** trae lo más útil para cobrar: la valoración que se gastaría con los testers (2.2) y el aviso de prueba que
  depende de abrir PACE (2.3). Falla en la analítica (no existe) y en el iPhone (lee un comentario viejo).
- **La 3** es la mejor sobre el ejercicio en sí: los cambios sin aviso dentro de un paso (3.2), los descansos de las suaves
  (3.3) y «¿Te ayudó?» (3.V3 y 3.V4) son ciertos y nadie los tenía. Choca con una decisión (esperar al toque).
- **La 4** acierta en el fin de la pausa sin aviso (4.F2) y el sonido igual (4.F3), y se equivoca en el permiso de Android,
  que era lo que más alarmaba.
