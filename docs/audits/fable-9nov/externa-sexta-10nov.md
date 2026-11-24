# Sexta pasada de PACE (v0.197.0): nativo, compra en el móvil y Ajustes

**Aviso sobre la regla 1.** La herramienta me da los archivos sin numerar. En los cortos he contado la línea a mano (L5, L14…). En los largos no la invento: doy la función y la cita exacta, que se encuentra con el buscador. Nada de esto está probado en un móvil.

## 1. Lo más grave de cada parte

- **A · Android:** la copia automática de Google se lleva PACE entero a otro móvil, incluida la lista de «eventos míos» del calendario, que allí puede señalar eventos ajenos.
- **B · iPhone:** el aviso de fin de Foco se programa sin sonido y, al volver, PACE calla porque da por hecho que el sistema ya sonó.
- **C · Compra:** no hay nada con qué comprar en ninguna de las dos apps, y la hoja y Ajustes tienen textos que serían falsos al enchufar una tienda.
- **D · Ajustes:** importar no mira la versión de la copia, y hoy la web (0.197.0) y la beta (0.191.1) no van a la par.

## 2. Hallazgos (numerados por prioridad global)

### Parte A · Android

| nº | Qué pasa | Archivo, línea y cita | Estado | Frena v1 | Arreglo |
|---|---|---|---|---|---|
| 4 | Google copia PACE y lo restaura en un móvil nuevo. Con él viaja la lista de ids de eventos propios, y PACE borra los eventos de hoy que estén en esa lista. | [AndroidManifest.xml](https://raw.githubusercontent.com/ezradesign/Pace_app/main/android/app/src/main/AndroidManifest.xml) L5: `android:allowBackup="true"`, sin reglas. [ritmo.calendario.destinos.js](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/app/ritmo/ritmo.calendario.destinos.js), `calendarioEscribirAndroid`: `var viejos = lista.filter(function (e) { return calendarioAndroidEsDePace(e) && e.fin > ahoraMs; });` | Configuración: confirmado. Restauración: por probar (prueba 1) | algo | Guardar la lista fuera de la copia, o atarla a una marca de instalación en una carpeta sin copia. Ver pregunta P1. |
| 23 | La pieza que marca «privado» acepta cualquier id; hoy solo recibe los de PACE. | [PaceCalendario.java](https://raw.githubusercontent.com/ezradesign/Pace_app/main/android/app/src/main/java/com/ezradesign/pace/PaceCalendario.java), `privado`: `int cambiados = getContext().getContentResolver().update(uri, valores, null, null);` | confirmado | nada | Opcional: comprobar antes que el id es de PACE. |
| 24 | La clave de pruebas en el repo no es un riesgo para Play: firma otra app y la versión de Play usa otra llave. | [build.gradle](https://raw.githubusercontent.com/ezradesign/Pace_app/main/android/app/build.gradle) L30 `storeFile file('pace-debug.keystore')`, L55 `applicationIdSuffix ".prueba"`, L59 `if (System.getenv('PACE_UPLOAD_KEYSTORE')) signingConfig signingConfigs.release` | confirmado | nada | Nada. Solo afecta a quien instale un APK de «PACE prueba» de origen dudoso. |

El propio código describe el riesgo del nº 4: los ids «en la copia de «Tus datos» llegarían a otro móvil y nombrarían eventos de otra persona». La copia de Google hace justo eso. Que los datos del WebView entren en esa copia lo digo de memoria; por eso va a prueba. La copia incluye por defecto los archivos internos de la app. [Source](https://developer.android.com/identity/data/autobackup)

**Lo demás que pedías mirar en Android:**
- **Aviso fijo:** no usa servicio en primer plano; es un aviso normal con cuenta atrás del sistema. No pide permisos ni declaración de servicio en Play.
- **Android 14 o más:** la persona puede descartar el aviso fijo deslizando. [Source](https://developer.android.com/about/versions/14/behavior-changes-all)
- **Si el sistema mata la app o se reinicia el móvil:** de memoria, el aviso fijo sobrevive a lo primero y se pierde con lo segundo. El de fin lo repone el complemento al arrancar (declara un receptor de `BOOT_COMPLETED`).
- **Versiones:** mínima 24 y objetivo 36 (`variables.gradle` L2 y L4). Play exige objetivo 36 para apps nuevas y actualizaciones desde el 31 de agosto de 2026. [Source](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en)
- **Ofuscación:** `minifyEnabled false` (L60) está bien; la lógica es JavaScript a la vista de todos modos.
- **Ficha de seguridad de datos (no se puede saber leyendo):** con todo en el móvil, creo que se declara «no se recogen datos» y se explica el calendario en la política. Play pide además la declaración de apps de salud. Las dos cosas de memoria: confírmalas en Play Console.

### Parte B · iPhone

| nº | Qué pasa | Archivo y cita | Estado | Frena v1 | Arreglo |
|---|---|---|---|---|---|
| 1 | El aviso de fin de Foco se programa sin sonido, y al volver la campana de PACE tampoco suena. | [ios.js](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/ios.js), `paceIosAvisoAjustar`: `schedule: { at: new Date(quiere.endsAt) },` (sin `sound`). `paceIosCampana`: `if (fin && _paceIos.puesto === fin) return;` | Confirmado en el código; el efecto, por probar (prueba 2) | mucho | Pasar `sound` con un archivo corto en el paquete. Ver P4. |
| 2 | Tonos y voces pueden no obedecer igual al interruptor de silencio, y la voz podría cortar la música de otra app. | [AppDelegate.swift](https://raw.githubusercontent.com/ezradesign/Pace_app/main/ios/App/App/AppDelegate.swift) L14: `try? AVAudioSession.sharedInstance().setCategory(.ambient)`. [TweaksAudio.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/tweaks/TweaksAudio.jsx): «el clip no estaria listo (`canplaythrough`)» | por probar (prueba 3) | algo | Si falla, fijar también el tipo de sesión desde la web (`navigator.audioSession`; creo que desde iOS 17, sin confirmar). |
| 3 | Un comentario dice que en el iPhone el registro de sesiones no escribe; de él podría depender «Qué te ayuda», que es de pago. | [state-paso-v1.js](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-paso-v1.js), cabecera: «En el iPhone el registro no escribe, y la lista sale de lo demás.» | por probar (prueba 4); puede ser comentario viejo | algo | Si es cierto, arreglarlo o no anunciar en la App Store lo que dependa de él. |
| 15 | En el iPhone «Al calendario» podría ofrecer Google y Outlook dentro del WebView, que el propio código prohíbe. | destinos.js, `calendarioDestinos`: `return !android && typeof calendarioWebDisponible === 'function' && calendarioWebDisponible(d);` | por probar (prueba 5) | algo | Si salen, ocultarlos en la app y dejar solo el archivo. |
| 16 | Todo lo de la persona vive solo en el almacén del WebView, que el sistema puede vaciar con poco espacio. | [TweaksData.importar.jsx](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/app/tweaks/TweaksData.importar.jsx), `writeLegacy`: `localStorage.setItem('pace.state.v2', JSON.stringify(incoming));` | no se puede saber leyendo | algo | Copia espejo en un archivo nativo al guardar, y recuperarla si el almacén arranca vacío. |

Fuentes del nº 1: el complemento solo pone sonido si se le pasa (`if let sound = notification["sound"] as? String, !sound.isEmpty {`). [Source](https://raw.githubusercontent.com/ionic-team/capacitor-local-notifications/main/ios/Sources/LocalNotificationsPlugin/LocalNotificationsPlugin.swift) Su documentación lo confirma: sin `sound`, en iOS no suena. [Source](https://capacitorjs.com/docs/apis/local-notifications) Leí la rama principal del complemento, no la 8.3.1 instalada. El comentario de `ios.js` «Un aviso cuya hora ya paso no se quita: ya sono» parte de una suposición equivocada.

Fuente del nº 2: hay un fallo antiguo de WebKit por el que el WebView ignora la categoría de audio de la app. [Source](https://bugs.webkit.org/show_bug.cgi?id=167788)

Fuente del nº 16: la guía de Capacitor avisa de que el sistema puede reclamar ese almacén. [Source](https://capacitorjs.com/docs/guides/storage)

**Lo demás que pedías mirar en el iPhone:**
- **Límite de avisos pendientes:** iOS admite 64 por app (de memoria). PACE programa uno solo (`PACE_IOS_AVISO_FOCO_ID = 1`), así que una jornada de nueve bloques no lo roza.
- **Textos de permiso:** no falta ninguno. El calendario no se incluye en iOS (`capacitor.config.json` L10-16).
- **`PrivacyInfo.xcprivacy`:** casa con lo que usa el código.
- **Defensa ante «es solo una web»:** avisos del sistema, hoja de compartir, ventana de valoración, pantalla encendida, franjas con la paleta y contenido dentro del paquete.
- **Lo que falta frente a Android:** el calendario del teléfono y el aviso fijo.
- **Fechas de Apple:** desde abril de 2027 las subidas piden el SDK de iOS 27. [Source](https://developer.apple.com/news/?id=k1mtkt1k)

### Parte C · La compra en el móvil

| nº | Qué pasa | Archivo y cita | Estado | Frena v1 | Arreglo |
|---|---|---|---|---|---|
| 7 | No hay complemento de compras; la tienda de Android está vacía y el iPhone no tiene canal. | [package.json](https://raw.githubusercontent.com/ezradesign/Pace_app/main/package.json) L24-33 (ninguno de compras). [state-compra.js](https://cdn.jsdelivr.net/gh/ezradesign/Pace_app@main/app/state-compra.js): `listo: function () { return false; },` y `if (p) return 'ninguno';` | confirmado | mucho | Ver «camino corto» abajo. |
| 8 | En las apps la fila de Ajustes dice siempre «pronto» y no se toca, aunque ya se haya comprado. No hay «Restaurar compras» ni «Gestionar». | [PremiumSection.jsx](https://cdn.jsdelivr.net/gh/ezradesign/Pace_app@main/app/tweaks/PremiumSection.jsx), final: `<AjustesAccion suave derecha={t('settings.license.soon')}>`; `const mensual = !!(est.datos && …)` | confirmado | mucho | Añadir a la fila que ya está en cola los estados «comprado» y «mensual», restaurar y gestionar. |
| 11 | La hoja de compra no enlaza las condiciones ni la privacidad, y no dice que se renueva sola ni cómo cancelar. | [premium.js](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/premium.js): `'premium.onb.precios': '{vida} una vez, o {mes} al mes con {dias} días gratis.'` | confirmado | mucho | Dos enlaces y una línea de renovación bajo los botones. |
| 9 | Dice «7 días gratis» aunque la tienda no dé prueba, y promete un aviso que en las apps no existe. | [PremiumInvitacion.jsx](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/app/ui/PremiumInvitacion.jsx): `const dias = (mes && mes.pruebaDias) \|\| 7;` y `{mes && <p style={premiumInvitacionStyles.aviso}>{t('premium.onb.aviso')}</p>}` | confirmado | mucho | La prueba, solo si la tienda dice que esta persona la tiene. Ver P5. |
| 12 | Si la tienda no carga los precios, la hoja dice «Pronto podrás tenerlo aquí». | PremiumInvitacion.jsx: `<p data-pace-premium-v1 …>{t(paceTextoV1('premium.v1'))}</p>` | confirmado | mucho | Estado propio: «No se pudieron cargar los precios · Reintentar». |
| 10 | Tras comprar la mensual en una tienda saldría «PACE completo es tuyo, para siempre». | PremiumInvitacion.jsx: `else if (r && r.ok) hecho(r.datos);` (la tienda no devuelve `datos`) | confirmado | algo | Que la tienda devuelva el tipo de plan. |
| 13 | La app pregunta «¿lo tienes?» y espera respuesta inmediata; las tiendas tardan y sin red no contestan. | [state-entitlement.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-entitlement.jsx), `tieneCompraVigente`: `return !!(tienda && tienda.vigente && tienda.vigente());` | confirmado | algo | Guardar lo último que dijo la tienda, con su fecha, y refrescar al abrir y al volver. |
| 14 | «Privacidad» abre pacegrass.app, desde donde se llega a /premium con precios de la web. | [TweaksData.jsx](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/app/tweaks/TweaksData.jsx): `<a href={paceEnlaceLegal('/privacy')} target="_blank" rel="noopener">` | no se puede saber leyendo | algo | Que la app enlace una versión de esas páginas sin navegación a la compra. |

Sobre el nº 7: el comentario «EN EL IPHONE NO HAY TIENDA hasta después de v1» es comentario viejo; mandan las decisiones del 22 de octubre. Sobre el nº 8: `STATE.md` ya lleva en cola «una fila para comprar en Ajustes». Sobre el nº 11: lo exige la norma 3.1.2 de Apple, que cito de memoria porque la página se me cortó antes. Sobre el nº 12: Apple pide que las compras estén completas y visibles para quien revisa (2.1). [Source](https://developer.apple.com/app-store/review/guidelines/)

**(1) Qué hay y qué falta.** Están montados el guardián único, la hoja con botones, el precio escrito por la tienda (`if (plan.texto) return plan.texto;`) y el paso a v1. Faltan el complemento, las dos tiendas, restaurar, gestionar y los arreglos 8 a 13.

**(2) El camino más corto.**
- **Complemento:** uno que hable directo con las dos tiendas, sin servicio de terceros, como `@capgo/native-purchases`. [Source](https://github.com/Cap-go/capacitor-native-purchases) No he comprobado que vaya con Capacitor 8.
- **Biblioteca de Google:** Play exige la versión 8 de su biblioteca de cobro desde el 31 de agosto de 2026. [Source](https://developer.android.com/google/play/billing/deprecation-faq) No he comprobado cuál trae el complemento.
- **Play Console:** un producto de pago único (19,99 €) y una suscripción mensual (2,99 €) con oferta de 7 días para quien nunca la tuvo.
- **App Store Connect:** una compra no consumible y una suscripción mensual con oferta de introducción de una semana.
- **Restaurar:** en Android la compra va con la cuenta de Google y aparece sola al consultar. En el iPhone también, pero Apple pide un botón visible de restaurar (3.1.1).
- **Recibo sin servidor:** basta lo que firma cada tienda y se comprueba en el móvil. Las devoluciones desaparecen de esa consulta. Es el mismo riesgo que Ez ya aceptó en la web.

**(3) La compra de la web.**
- **Apple:** prohíbe abrir contenido con mecanismos propios «such as license keys», así que el código PACE1 no puede valer en el iPhone. Fuera de Estados Unidos tampoco deja enlazar a otra forma de pago sin permiso especial. La guía se revisó el 16 de octubre de 2026. [Source](https://developer.apple.com/app-store/review/guidelines/)
- **Unión Europea:** hay condiciones nuevas desde el 1 de octubre de 2026, con comisión también sobre lo vendido por enlace. [Source](https://developer.apple.com/news/?id=gmws0jgp)
- **Google:** en Estados Unidos hay un programa de enlaces externos que desde el 1 de octubre de 2026 obliga a declarar ventas y pagar comisión. [Source](https://support.google.com/googleplay/android-developer/answer/16470497?hl=en) En el resto, de memoria, no se puede llevar a pagar fuera.
- **Conclusión:** en v1, ni códigos ni enlaces a la web desde las apps, como ya está.

**(4) Doce testers de por vida.**
- **Play:** códigos promocionales del producto de pago único, hasta 500 por trimestre, canjeables con un enlace. [Source](https://developer.android.com/google/play/billing/promo) Que funcionen en la prueba cerrada no lo sé.
- **Apple:** los códigos promocionales antiguos de compras se retiran en marzo de 2026. [Source](https://www.bgr.com/2011787/apple-retire-in-app-purchase-promo-codes/) Los sustituyen los códigos de oferta, que piden iOS 16.3. [Source](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-offer-codes-for-in-app-purchases/) Que admitan precio cero para una compra no consumible hay que verlo en App Store Connect.
- **Ojo:** lo comprado en TestFlight es de mentira y no pasa a la versión publicada.

**(5) Textos con riesgo.** Los números 9, 10, 11 y 12, más el «pronto» de Ajustes. «Hasta v1» y «Llega con la versión 1» son jerga para testers, pero desaparecen con el interruptor; no veo rechazo ahí. No soy abogado: lo legal, con vuestro profesional.

### Parte D · Ajustes

| nº | Qué pasa | Archivo y cita | Estado | Frena v1 | Arreglo |
|---|---|---|---|---|---|
| 5 | Importar no mira de qué versión es la copia, aunque exportar sí la escribe. | TweaksData.importar.jsx, `importJSON`: `const bruto = (payload.state && typeof payload.state === 'object') ? payload.state : payload;` (no lee `payload.version`) | Confirmado; el efecto, por probar (prueba 6) | algo | Si la copia es más nueva que la app, avisar antes de importar. |
| 6 | El selector solo pide JSON; un archivo que venga de Drive o WhatsApp podría salir en gris. | TweaksData.importar.jsx: `accept="application/json,.json"` | por probar (prueba 7) | algo | Si falla, aceptar cualquier archivo y validar después, que ya se hace. |
| 18 | «Aviso al terminar» sale encendido aunque el permiso no se haya pedido nunca. | [TweaksPanel.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/tweaks/TweaksPanel.jsx): `const avisoOn = !!state.notifyFocusEnd && permisoAviso() !== 'denied';` | confirmado | algo | Encendido solo con permiso dado; sin pedir, tocar la fila lo pide. |
| 21 | En el panel no hay cómo escribiros ni el número de versión, que un tester necesita para avisar de un fallo. | TweaksData.jsx, pie: solo `settings.foot` y los enlaces `settings.legal.safety` y `settings.legal.privacy` | confirmado (en los archivos del panel) | algo | Una línea «Escríbenos · v0.197.0» en «Tus datos». |
| 19 | El lector de pantalla no lee el estado de la fila de PACE completo. Los botones − y + de los vasos miden 26 px. | [TweaksPanel.parts.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/tweaks/TweaksPanel.parts.jsx), `AjustesAccion`: `{texto}<span aria-hidden="true">{derecha}</span>`. [TweaksPanel.support.jsx](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/app/tweaks/TweaksPanel.support.jsx): `.pace-aj-paso button { width: 26px; height: 26px;` | Lector: confirmado. Tamaño: por probar (no vi si `toques.css.jsx` los agranda) | nada | No esconder `derecha` cuando es texto. |
| 20 | En inglés la sección y su primera fila se llaman igual. «Marca la fase» no dice de qué módulo es. | [settings.js](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/i18n/strings/settings.js): `'settings.sec.oir': 'Sound'` y `'settings.sound': 'Sound'` | confirmado | nada | Sección «Audio»; añadir «Respira» bajo «Marca la fase». |
| 25 | La pregunta de importar no dice de qué día es la copia. | TweaksData.importar.jsx: `setPidiendoImportar({ incoming, eventsSection: payload.events, logros: …, foco: … })` | confirmado | nada | Añadir la fecha de `exportedAt`. |
| 22 | Comentario viejo: dice que el interruptor mide 32×18; la hoja lo pinta a 40×24. | TweaksPanel.parts.jsx: «El interruptor solo mide 32x18»; support: `.pace-aj-sw { width: 40px; height: 24px;` | confirmado (comentario viejo) | nada | Corregir el comentario. |

Sobre el nº 5: `STATE.md` dice que la web va por la 0.197.0 y la prueba por la 0.191.1. No pude leer qué hace el saneador con los campos que no conoce.

**Lo demás que pedías mirar en Ajustes:**
- No encontré ajustes muertos fuera de los que están tras bandera a propósito.
- No encontré ajustes que se pisen: fondo y música se excluyen en un solo sitio (`ponerFondo`).
- Los textos de web y de móvil están bien separados.

### Pruebas en un móvil

1. **Copia de Google (nº 4).**
   - Usa «Al calendario» un día.
   - Ejecuta `adb shell bmgr backupnow com.ezradesign.pace`.
   - Desinstala y reinstala.
   - Mira si vuelven tus días.
   - Pulsa «Al calendario» y comprueba que no desaparece ningún evento ajeno.
2. **Sonido del aviso (nº 1).** iPhone con sonido. Empieza un Foco de 5 minutos y bloquea. Al acabar, ¿suena o solo se enciende? Abre PACE: ¿suena la campana?
3. **Audio (nº 2).** Pon música de otra app y empieza una Respira con «Voz clara»: ¿se corta la música? Repite con el interruptor de silencio puesto: ¿se oye la voz y no el tono, o al revés?
4. **Registro (nº 3).** En el iPhone, haz tres Respira enteras contestando «¿Te ayudó?» y termina cinco Focos. Mira Estadísticas › «Qué te ayuda» y compáralo con lo mismo en Android.
5. **Calendario (nº 15).** En el iPhone abre «Al calendario»: ¿salen Google u Outlook? Si salen, púlsalos.
6. **Versiones (nº 5).** Exporta en la web y, en la beta de Android, importa esa copia. Mira si falta algo.
7. **Selector (nº 6).** Exporta a Drive desde un móvil. En otro, pulsa «Importar una copia» y elige el archivo desde Drive, desde Archivos y desde WhatsApp.

## 3. Preguntas para Ez

**P1 · La copia automática del sistema.**
- A: mantenerla, proteger los ids del calendario y cambiar «no se sincroniza con otros».
- B: apagarla en Android.
- C: dejarlo como está.
- Recomiendo A: sin cuentas, que el historial sobreviva al cambio de móvil es lo que hace que la gente vuelva.

**P2 · El complemento de compras.**
- A: directo con las tiendas, sin terceros.
- B: un servicio como RevenueCat.
- Recomiendo A: mantiene «sin cuenta, sin rastreo» y no cambia las fichas de privacidad.

**P3 · El calendario en el iPhone en v1.**
- A: solo el archivo, y decirlo en la ficha.
- B: montar el calendario del teléfono antes de v1.
- Recomiendo A: menos permisos que revisar, y lo «privado» que promete la política no tiene equivalente claro allí.

**P4 · El sonido del aviso de fin en el iPhone.**
- A: el sonido del sistema.
- B: la campana de PACE, como archivo en la app.
- C: sin sonido, y que suene PACE al volver.
- Recomiendo B: se reconoce como PACE y deja preparada una campana distinta para la pausa.

**P5 · «Te avisamos dos días antes» en las apps.**
- A: quitar la frase en las apps.
- B: programar un aviso del sistema el día 5, al comprar.
- Recomiendo B: cumple la promesa con la app cerrada. No sé si las tiendas ya avisan antes de cobrar tras una prueba de una semana.

## 4. Lo que está bien hecho

- El aviso de fin va en fila y solo se da por puesto cuando el sistema lo confirma, en los dos móviles.
- El calendario reconoce lo suyo por id y nunca por texto, y de las reuniones solo guarda las horas.
- El permiso del calendario se pide al pulsar, no al arrancar.
- Los códigos propios no se leen en las apps, y toda compra pasa por un único guardián.
- El paso a v1 está cuidado: una semana, las rutinas que se quedan, y sin semanas repetidas al importar.
- Importar conserva el código de compra, y exportar no da la copia por hecha hasta que sale.

## 5. Lo que no he podido leer o abrir

- `LocalNotificationManager.java` del complemento de avisos (Android). No pude confirmar qué hace con `isExactNotification` ni con el sonido.
- `app/ritmo/ritmo.calendario.web.js` (de ahí que el nº 15 vaya a prueba).
- `app/ui/pantalla.js` (pantalla encendida), `app/ui/Sound.jsx` y `app/ui/Sound.voz.jsx`.
- `app/state-core.sanea.js` y la lista completa de `app/ui/toques.css.jsx`.
- `ios/App/App.xcodeproj/project.pbxproj`, `Main.storyboard` y los permisos de firma (no sé si se ofrece para iPad).
- `docs/proposals/avisos-iphone-28oct.html`.
- El final de `premium/index.html` y la segunda mitad de `docs/product/DECISIONES_PRODUCTO.md` (cortados).
- `CLAUDE.md`, la lista de «nunca» de `ROADMAP.md` y `docs/product/DECISIONES_TECNICAS_VIGENTES.md` no los he reabierto en esta pasada. Si algo de arriba ya está decidido ahí, mandan ellos.
