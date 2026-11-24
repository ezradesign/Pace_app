# La sexta pasada externa (nativo, compra en el móvil y Ajustes), comprobada punto a punto

Contra `main` (v0.197.0, e140a6ff) y la rama `origin/claude/montar-auditoria-10nov-3ef28c` (c70dd11d, la fila de compra
1A), el 10 nov. de 2026, leyendo código. El complemento de avisos, en la versión instalada
(`node_modules/@capacitor/local-notifications`, 8.3.1, la de `package.json`). El texto entero, en `externa-sexta-10nov.md`.
Los números son los suyos (no hay nº 17). Lo que la pasada cita de memoria sobre normas de Apple y Google **no se ha
comprobado**: va marcado «sin comprobar, para cuando se monten las tiendas».

**Cuenta:** 24 hallazgos. **15 ciertos** (2 ya sabidos: nº 7 y nº 16), **4 a medias** (nº 8, 14, 19 y 21), **2 falsos**
(nº 3 y nº 15), **1 ya decidido** (nº 18) y **2 que solo se saben en un móvil** (nº 2 y nº 6). Ciertos o a medias y
nuevos: **17**; de ellos, dos no piden nada (nº 23 y 24).

**Lo más grave, por orden:**
1. **nº 1, cierto:** en el iPhone el fin de un Foco con PACE en el fondo no suena nada, ni el aviso ni la campana al volver.
2. **nº 4, cierto en el código; el efecto, por probar:** en un Android nuevo restaurado de la copia de Google, PACE podría
   borrar hoy una reunión de verdad del calendario de la persona.
3. **nº 8 a 13, ciertos y latentes:** la hoja de compra y la fila de Ajustes de las apps se escribieron para la web; el día
   que se enchufe Play o Apple dirían cosas falsas («para siempre» tras pagar la mensual, «7 días gratis» sin prueba,
   «pronto» habiendo comprado). Hoy no se ven: las apps no venden.

## Android

- **nº 4** La copia de Google lleva la lista de eventos propios a otro móvil · **cierto en el código y nuevo; el efecto, por
  probar (prueba 1)**: `android/app/src/main/AndroidManifest.xml:5` `allowBackup="true"`, sin `fullBackupContent` ni
  `dataExtractionRules` (en `res/xml/` solo hay `config.xml` y `file_paths.xml`). La lista vive en el `localStorage` del
  WebView, clave `pace.calendario.android` (`app/ritmo/ritmo.calendario.destinos.js:64-88`), justo fuera de
  `pace.state.v2` para que la copia de «Tus datos» no la llevara a otro móvil (lo dice el comentario de `:55-63`); la copia
  de Google se salta esa precaución porque copia el almacén entero. **Qué borraría en un móvil restaurado:** los ids son
  los números de fila del calendario de ESE móvil. En el nuevo, los eventos de Google se bajan con números nuevos, y uno
  puede coincidir con un id de la lista (que guarda cada id 14 días después de su evento, `:65`). Al pulsar «Al
  calendario» o en «Mantenerlo al día solo», `calendarioEscribirAndroid` (`:189-193`) borra los eventos de hoy, de ahora en
  adelante, cuyo id esté en la lista: borraría ese evento ajeno, y si es de Google, también en Google. Además, ese evento
  dejaría de contar como reunión (`:182`). Poco probable, pero lo que rompe es una reunión de verdad. Que el almacén del
  WebView entre en la copia de Google **no se puede saber leyendo**: es lo que mira la prueba 1. Nada de esto está en
  `DECISIONES_TECNICAS_VIGENTES.md` ni en la cola. Pide la decisión P1.
- **nº 23** `privado` acepta cualquier id · **cierto, menor**: hoy solo se llama tras crear o cambiar uno de PACE
  (`destinos.js:109-124`). No pide nada.
- **nº 24** La llave de pruebas en el repo · **cierto, sin riesgo**: firma «PACE prueba», que es otra app. No pide nada.
- **Lo demás de Android** (aviso fijo, Android 14, reinicio, objetivo 36, ficha de seguridad de datos y declaración de
  salud): **sin comprobar, para cuando se monten las tiendas**. Que el objetivo sea 36 sí es cierto
  (`android/variables.gradle`).

## iPhone

- **nº 1** El aviso de fin de Foco no suena y la campana de PACE calla · **cierto y nuevo, lo más grave**: `app/ui/ios.js:197-200`
  programa sin `sound`; el complemento instalado solo pone sonido si se le pasa uno que no esté vacío
  (`LocalNotificationsPlugin.swift:472-474`; si no viene, `LocalNotificationsHandler.swift:107` lo deja en `""`), y un aviso
  sin sonido en iOS no suena. Y `paceIosCampana` (`ios.js:223-228`) no toca la campana de PACE si iOS tenía el aviso de
  ese bloque. Resultado: con PACE en el fondo, el fin del Foco solo se ve si se mira la pantalla, y al volver tampoco suena.
  La regla de `DECISIONES_TECNICAS_VIGENTES.md:86` («su campana es suya») parte de que iOS sonaba. Cómo arreglarlo: el
  complemento busca el archivo que se le nombre en `public/` (`:493-511`), así que basta con poner el sonido en la web y
  pasar `sound`. Pide la decisión P4. Que iOS acepte un .mp3 como sonido de aviso o pida .caf/.wav/.aiff: **sin
  comprobar**.
- **nº 2** Tonos, voz y el interruptor de silencio · **solo se sabe en un móvil (prueba 3)**: la categoría «ambient» la
  decidió Ez el 14 oct. («con el interruptor de silencio no suena, como en Safari»; `DECISIONES_TECNICAS_VIGENTES.md:170`).
  Lo que hay que mirar es si el WebView la obedece. `navigator.audioSession`: sin comprobar.
- **nº 3** «En el iPhone el registro no escribe» · **falso: comentario viejo**. Desde el 14 oct. el iPhone usa el mismo
  registro que la web y Android (`app/events/events-store.js:90-100`, `selectEventsAdapter` da `'web'` para
  `capacitor-ios`, justo para que «A tu ritmo» y las estadísticas aprendan). «Qué te ayuda» se alimenta de ese registro, así
  que en el iPhone funciona. Quedan tres comentarios que dicen lo contrario: `app/state-paso-v1.js:26-27`,
  `events-store.js:226-227` y `events-adapter-null.js:12`. La prueba 4 de la pasada no hace falta.
- **nº 15** Google y Outlook en el iPhone · **falso**: `calendarioWebDisponible` devuelve `false` en las apps
  (`app/ritmo/ritmo.calendario.web.js:91`, `paceEsNativo()`), y el comentario de `:83-86` lo explica justo por el iPhone
  (allí `location.hostname` también es `localhost`). En el iPhone «Al calendario» solo ofrece el archivo, como decidió Ez el
  29 oct. La prueba 5 no hace falta.
- **nº 16** El WebView puede vaciar lo guardado · **cierto, ya sabido**: lo dice `events-store.js:93-96`, y en las apps ya
  se pide `storage.persist()` (`:412-418`); la copia de «Tus datos» existe, y recordarla está en la cola (fila 21). La copia
  espejo en un archivo nativo es idea nueva, para después de v1.
- **Lo demás del iPhone** (64 avisos, textos de permiso, `PrivacyInfo.xcprivacy`, «es solo una web», SDK de iOS 27 desde
  abril de 2027): **sin comprobar, para cuando se monten las tiendas**.

## La compra en el móvil

- **nº 7** No hay complemento de compras ni tienda · **cierto, ya sabido**: puntos 14 y 15 del camino a v1
  (`ROADMAP.md:86-87`), que esperan las altas de Ez. El comentario «EN EL IPHONE NO HAY TIENDA» de `state-compra.js` ya
  estaba en la cola de la pasada 2 (2.1).
- **nº 8** La fila de Ajustes en las apps · **a medias; lo de las apps, nuevo**: en `main` la fila ya dice «Para siempre»,
  «Hasta el …», «Gestionar» y «caducada», pero solo con un código, y los códigos no se leen en las apps
  (`state-licencia.js:123-125`); una compra de Play o Apple (`tieneCompraVigente`) no la cambiaría: seguiría «pronto». La
  rama 1A (c70dd11d) añade «Tenerlo para siempre · 19,99 €» y «Tengo un código», **solo en la web** (`premiumPlanEnAjustes`
  sale con `paceLicenciaPermitida()` en falso). Falta, en las apps: «comprado» y «mensual» leídos de la tienda, «Restaurar
  compras» y «Gestionar» en el iPhone. Va al paquete de las tiendas.
- **nº 9** «7 días gratis» y el aviso de dos días · **cierto, latente**: `PremiumInvitacion.jsx:178` (`|| 7`) y `:255`. El
  aviso de dos días es la hoja al abrir PACE, que lee la fecha de un código de Stripe: con una compra de tienda no saldría.
  Pide la decisión P5.
- **nº 10** «Para siempre» tras la mensual · **cierto, latente**: `PremiumInvitacion.jsx:141-145` decide el título con
  `datos`, y una tienda no los da. Al paquete de las tiendas.
- **nº 11** Sin enlaces a condiciones y privacidad ni línea de renovación · **cierto**: `premium.js:60`. Que Apple lo exija
  (3.1.2): sin comprobar. Al paquete de las tiendas.
- **nº 12** «Pronto podrás tenerlo aquí» si la tienda no carga · **cierto, latente**: `PremiumInvitacion.jsx:265` con
  `premium.v1.despues` (`premium.js:82`). Al paquete de las tiendas.
- **nº 13** «¿Lo tienes?» espera respuesta inmediata · **cierto, latente**: `state-entitlement.jsx:118`. Al paquete.
- **nº 14** «Privacidad» lleva a la web con precios · **a medias**: `privacy.html` no enlaza a /premium (solo lo nombra en
  texto, `:189`), pero su pie lleva «Volver a la app» a `/` (`:471`), que con la landing juntada enseñará la compra. Si a
  Apple le importa: sin comprobar. Al paquete.
- **Camino corto, la compra de la web en el móvil y los códigos de los testers** (complemento, Billing 8, App Store
  Connect, códigos de oferta, TestFlight, UE, Google en EE. UU.): **sin comprobar, para cuando se monten las tiendas**. La
  conclusión «en v1, ni códigos ni enlaces a la web desde las apps» es lo que ya hay (`DECISIONES_TECNICAS_VIGENTES.md:60`).

## Ajustes

- **nº 5** Importar no mira la versión de la copia · **cierto y nuevo; hoy el efecto es pequeño**: `TweaksData.importar.jsx:53-61`
  no lee `payload.version` (exportar sí la escribe, `TweaksData.jsx:81`). Con una copia más nueva que la app, el saneador
  **conserva lo que no conoce** (`state-core.sanea.js:31-34`, a propósito, para no perder datos al volver atrás) y solo
  devuelve a fábrica un campo cuyo tipo no casa. El registro va en la versión 1 en las dos (`events-model.js:31`), y uno
  más nuevo se quedaría en solo lectura (`events-adapter-web.js:243-245`). Entre la web 0.197.0 y la beta 0.191.1 lo
  probable es que no falte nada; la prueba 6 lo dice. Avisar cuando la copia es más nueva es barato.
- **nº 6** El selector solo pide JSON · **solo se sabe en un móvil (prueba 7)**: `TweaksData.importar.jsx:148`. Aceptar
  cualquier archivo es barato y seguro: lo que entra ya se valida (`:46-51`).
- **nº 18** «Aviso al terminar» encendido sin permiso · **ya decidido**: s108, encendido de fábrica y el permiso en el
  primer «Empezar» (`DECISIONES_TECNICAS_VIGENTES.md:386`).
- **nº 21** Sin contacto ni versión · **a medias**: la versión sale en el pie de la barra lateral («Pace 0.197.0»,
  `Sidebar.parts.jsx:323`). El contacto falta, y espera al que Ez dé al registrar la primera venta (X8, ya en la lista).
- **nº 19** El lector de pantalla y los botones de 26 px · **lo del lector, cierto a medias; lo del tamaño, falso**: la
  fila «pronto» no es un botón y se lee entera (`TweaksPanel.parts.jsx:135-136`); lo que se esconde es la derecha de las
  filas que son botón (`:140`): el precio de la fila 1A, «caducada» y «Introducir». Los botones de los vasos: en el móvil
  `toques.css.jsx:40` les da 34 × 40 de toque.
- **nº 20** «Sound» dos veces en inglés · **cierto, menor**: `settings.js:131` y `:156`.
- **nº 22** Comentario del interruptor · **cierto**: `TweaksPanel.parts.jsx:66` dice 32x18; la hoja, 40 × 24
  (`TweaksPanel.support.jsx:127`).
- **nº 25** La pregunta de importar no dice el día · **cierto, menor**: `exportedAt` va en la copia y no se usa.

## Las preguntas de la pasada

- **P1 · La copia de Google.** De acuerdo con su **A** (mantenerla), con un arreglo concreto: guardar con la lista la hora
  de instalación que da Android (`firstInstallTime`, sin permisos, una línea en `PaceCalendario.java`) y tirar la lista si
  no casa. Restaurada en otro móvil, o reinstalada, la lista se olvida. Y el pie «no se sincroniza con otros» sigue siendo
  verdad: una copia del sistema no es sincronizar.
- **P2 · El complemento de compras.** De acuerdo: **A**, directo con las tiendas. Que `@capgo/native-purchases` vaya con
  Capacitor 8 y traiga Billing 8: sin comprobar.
- **P3 · El calendario en el iPhone.** **Ya decidido** (29 oct., `DECISIONES_PRODUCTO.md:62-74`): en v1, el archivo. Solo
  queda decirlo en la ficha, que va al paquete de las tiendas. No se le pregunta a Ez.
- **P4 · El sonido del aviso en el iPhone.** De acuerdo: **B**, la campana de PACE. Es lo que se oye en la web y en
  Android con la app abierta.
- **P5 · «Te avisamos dos días antes» en las apps.** **Difiero: A**, quitar la frase en las apps. Con B, el aviso depende
  del permiso de avisos (que se puede negar), y la tienda sabe cuándo acaba la prueba; la app, sin servidor, lo calcula.
  Hasta v1 no se vende la mensual, así que no corre prisa.

## Lo bien hecho

Coincide con lo leído: el aviso en fila (`ios.js:180-184`), el calendario que se reconoce por id (`destinos.js:54-58`), los
códigos fuera de las apps (`state-licencia.js:123`) y el import que conserva el código (`TweaksData.importar.jsx:104-108`).
