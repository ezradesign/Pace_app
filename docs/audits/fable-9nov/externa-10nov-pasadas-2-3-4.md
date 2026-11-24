# La auditoría externa del 10 nov.: pasadas 2 a 5, enteras

Texto que Ez trajo de claude.ai (Fable, leyendo el repositorio público sin ejecutar la app), tal cual, sin resumir. Ez pegó las tres primeras en el orden 3, 2, 4; aquí van en el suyo. La quinta llegó después y va al final. La comprobación punto por punto, en `externa-10nov-pasadas-2-3-4-comprobado.md`.

---

## Pasada 2

Auditoría de PACE, segunda pasada

Sí, he seguido: esta vez he leído las sesiones de Mueve, Estira y Respira, Hidrátate, Estadísticas, la copia de datos, el service worker, los avisos nativos y las páginas de compra. Sigo sin poder ejecutar la app, así que lo marcado "por comprobar" es lectura de código, no un fallo reproducido.

**Una corrección:** dije que no medías nada. No es exacto: `/premium` y `/gracias` ya llevan el script de analítica de Cloudflare, aunque probablemente no esté midiendo (punto 4).

## Lo que más pesa para vender

1. **El iPhone llega a v1 con candados y sin forma de pagar.** La tienda del iPhone es "ninguna" hasta después de v1, así que al cerrar lo de pago la hoja solo dirá "Pronto podrás tenerlo aquí". Contenido bloqueado sin compra es, por lo que sé, un motivo habitual de rechazo en la revisión de Apple. Además `/beta` promete a los testers PACE completo de por vida también en iPhone, y allí no se aceptan códigos propios. O entra la compra de Apple en v1, o el iPhone sigue abierto y sin candados hasta que exista. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-compra.js)

2. **La petición de valoración se gasta durante la beta.** Se lanza una sola vez, en la quinta pausa entera, y queda apuntada para siempre. En TestFlight esa ventana no hace nada, y en la prueba cerrada de Play las reseñas, por lo que sé, no son públicas. Tus testers, los usuarios con más ganas de valorar bien, no recibirán nunca la petición el día de v1. Arreglo: no contar mientras todo está abierto, o reiniciar el contador ese día. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/valoracion.js) [Source](https://github.com/KjellConnelly/react-native-rate/issues/52)

3. **El aviso "dos días antes de cobrar" solo sale si abren PACE.** La hoja se muestra al abrir la app dentro de esa ventana; quien no entre esos dos días será cobrado sin el aviso prometido en `/premium`. Activa el correo de recordatorio de Stripe, que por defecto se manda 7 días antes del fin de la prueba; comprueba cómo se comporta con una de 7 días. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/PremiumInvitacion.jsx) [Source](https://docs.stripe.com/billing/subscriptions/trials)

4. **La analítica está puesta, pero la CSP del repo la bloquea.** El `_headers` solo permite scripts propios, así que el script de Cloudflare no cargaría y no tendrías datos. Además aparece en `/gracias`, cuyo comentario dice "no cuenta visitas" y cuya dirección lleva el id de compra que da acceso al código. Parece inyección automática en todo el dominio; no pude leer el final del HTML de la app para confirmarlo. Si también está ahí, contradice el "sin analítica en la app" de la política de privacidad. Yo la dejaría solo en la landing y `/premium`, con sus dominios en la CSP. [Source](https://pacegrass.app/gracias/) [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/_headers)

5. **La carta del lunes es tu mejor momento de venta y los gratuitos no la verán.** Solo existe con PACE completo. Enseñaría la cabecera gratis (qué te ayudó, pausas hechas) y dejaría cerrados los ajustes: "PACE ha encontrado 2 cambios para tu semana". Es personal, ganado y nada invasivo. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/RitmoCarta.jsx)

6. **El paso a v1 regala mucho a tus primeros usuarios.** Se quedan para siempre las rutinas de pago con alguna sesión "terminada o no". Quien abra las 18 antes de v1 las conserva todas, y el repositorio público lo explica. Es una decisión defendible, pero deja poco que comprar a tus usuarios más fieles; yo exigiría sesión terminada. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-paso-v1.js)

## Fallos e incoherencias

| Qué | Estado | Arreglo |
|---|---|---|
| `/beta` dice "sellos de cuaderno de campo, sin rachas", pero la app tiene logros de racha de 3 a 365 días. | Confirmado | Decidir: quitar las rachas o dejar de negarlas. |
| El service worker pide la página a la red sin límite de tiempo; con wifi mala, la app instalada puede quedarse en blanco hasta que la petición falle. | Confirmado en código, efecto por probar | Tope de unos 3 s y caer a la copia guardada. |
| El precache baja dos versiones de cada dibujo de ejercicio, más las láminas de Caminos (ocultos). | Confirmado | Precargar solo la pequeña; la grande, al usarla. |
| En Android 14 las alarmas exactas vienen apagadas y solo se ofrecen desde Ajustes: el aviso de pausa puede llegar minutos tarde. | Confirmado | Ofrecerlo en contexto. Existe un permiso sin pregunta para apps de temporizador y calendario; mira si Play te lo admite. |
| Una rutina propia sin nombre se guarda como "Rutina propia" también en inglés; el manifiesto y sus atajos solo están en castellano. | Confirmado (menor) | Traducir. |
| La copia de datos es solo manual; en la web el historial y el código viven en un almacenamiento que el navegador puede borrar. | Confirmado | Recordatorio suave de copia, por ejemplo mensual. |

Fuentes de la tabla: [beta](https://pacegrass.app/beta/), [sw.js](https://raw.githubusercontent.com/ezradesign/Pace_app/main/sw.js), [android.avisos.js](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/android.avisos.js), [state-custom.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-custom.jsx), [manifiesto](https://pacegrass.app/manifest.webmanifest).

## Lo que está bien hecho

- **Sesiones de Mueve y Estira:** acreditan minutos reales sin pausas, guían con sonidos distintos y se reanudan por el paso.
- **Importar una copia:** pasa por el mismo saneado que el arranque y conserva el código comprado.
- **Página de gracias:** aguanta pagos que se confirman tarde y da tres formas de guardar el código.

No encontré fallos de lógica en esas tres partes.

## Lo que queda sin mirar

Los textos y la seguridad de cada ejercicio, el panel de Ajustes, el código nativo de Android e iPhone, las pruebas, y cualquier cosa visual, que requiere usar la app. Si sigo, propongo el catálogo de ejercicios, que es lo que el usuario toca cada día.

---

## Pasada 3

Auditoría de PACE, tercera pasada: ejercicios, uso y regreso
Los ejercicios están escritos con cuidado: dosis bajas, una versión más suave en casi todos y avisos sensatos. Lo que falla no es el contenido sino cuatro cosas alrededor: seguirlos sin mirar la pantalla, que encajen en una oficina real, que progresen, y que el usuario vea que le sirven.
He leído el catálogo entero de Mueve, Estira y Respira, la sesión guiada, los sonidos y la pregunta «¿Te ayudó?». No he visto los dibujos ni ejecutado nada.
Ejercicios: lo que cambiaría

1. Voz en Mueve y Estira. Hoy la sesión se sigue con cuencos y toques de madera: sabes que algo cambia, pero no qué viene. Con el cuello girado o a cuatro patas no puedes leer. Una voz que diga el nombre, el lado y «última» es la mejora con más efecto. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/Sound.jsx)
2. Los cambios dentro de un paso no se avisan. «Brazos libres» cuenta 16 círculos, y el usuario debe cambiar de sentido en el 4, de brazo en el 8 y otra vez en el 12, sin ninguna señal. Pasa igual en «Rotación lenta», «Círculos de tobillo», «Desliza el talón» y «Giro sentado» («luego, al otro lado»). Hace falta una señal y un texto en cada cambio. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/extra/extra.data.js)
3. Hay más descanso que trabajo. «Levántate y sube» son 88 segundos de ejercicio y 90 de descanso para series de 5 sentadillas; «Piernas sin pasos», 94 y 90. En una pausa de tres minutos se siente lenta. Alternar ejercicios (sentadilla, talones, sentadilla) eliminaría los descansos, o bájalos a 15 segundos en las rutinas suaves. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/move/move.data.js)
4. Cinco segundos para colocarse la primera vez es poco. Hay que leer colocación, acción y cuidado. La primera vez que alguien hace un ejercicio, esperaría a su toque; después, los 5 segundos de ahora. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/move/MoveSessionV1.support.jsx)
5. Con el sonido apagado no hay ritmo. En una oficina abierta irá en silencio, y el número de repeticiones ya no late. Añadiría un pulso visual en el aro y vibración en el móvil, que además sirve con el teléfono en el bolsillo.
6. «Fondos en silla» está mal etiquetada. Es gratis, marcada «accesible», y pide 12, 10 y 8 repeticiones. Para un oficinista medio es mucho, y es la rutina que tu propio documento deja pendiente de fisioterapeuta. Yo la marcaría como intermedia y bajaría la dosis.
7. Falta contenido. No hay nada para los ojos (mirar lejos 20 segundos), que es una queja típica de pantalla y la pausa más discreta posible. Tampoco hay una pausa de caminar: «ve a por agua» uniría movimiento e Hidrátate en un gesto.

Que encaje en la oficina

* La primera pausa del día, sin pagar, sale de dos rutinas: flexiones contra la mesa o sentadilla en la pared. Delante de compañeros, mucha gente la saltará. Las rutinas discretas («Gemelos subrepticios», «Glúteos en la silla») existen, pero el plan gratuito no las propone. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/ritmo.series.js)
* Falta preguntar dónde trabajas. Una sola elección (casa, despacho, oficina compartida) filtraría a sentado y discreto. Los datos de postura ya están en cada rutina.
* Falta una zona prioritaria. El plan reparte seis zonas por igual, pero quien tiene el cuello cargado quiere más cuello. El reparto ya usa pesos por zona, así que es barato de añadir.

Que vuelvan

1. Enseña el resultado, no solo la actividad. PACE cuenta minutos y pausas, pero no si el usuario está mejor. Una pregunta semanal («¿cómo está tu cuello esta semana?») con su línea en el tiempo daría el motivo para seguir y para pagar. La carta del lunes es su sitio natural.
2. No hay progresión. Las dosis son las mismas en la semana 1 y en la 12, y «Para ir a más» nunca se propone sola. Tras varias veces con «Sí», ofrecería subir («¿pasamos a 2 × 8?»). Es también un buen argumento de pago: «PACE crece contigo».
3. «¿Te ayudó?» se pregunta demasiado. Sale una vez por rutina y día, así que una jornada completa puede preguntarlo siete u ocho veces. La gente pulsará «Ahora no» y la señal se pierde. Lo preguntaría las tres primeras veces de cada rutina y después de vez en cuando. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-feedback.jsx)
4. El «No» no dice por qué. «No pude hacerla aquí», «demasiado difícil» y «me molestó» piden respuestas distintas: cambiar el contexto, bajar la dosis o apartarla y remitir a la página de seguridad. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/SessionFeedback.jsx)
5. Sigue faltando el aviso de inicio de jornada, que ya comenté: sin él, nada trae al usuario de vuelta por la mañana.

Por dónde empezaría
Voz y señales de cambio (1 y 2), el modo discreto y la pregunta semanal de cómo estás. Las dos primeras hacen que la pausa se pueda seguir; las otras dos, que se haga y que se note.
Puedo redactar los textos de voz y de cambio para las rutinas gratuitas, o diseñar la progresión de dosis ejercicio por ejercicio.

---

## Pasada 4

Cuarta pasada: he leído la racha, los logros, el motor del reloj, la barra lateral y la parte de avisos de Android. Sigo sin poder ejecutar la app, así que todo sale de leer código. Lo más importante: **en el móvil, el aviso de fin de Foco puede llegar tarde y el fin de la pausa no avisa nunca.**

## Fallos y riesgos nuevos

| # | Qué pasa | Estado | Arreglo |
|---|---|---|---|
| 1 | El manifiesto de Android solo declara `INTERNET` y los dos permisos de calendario; falta `SCHEDULE_EXACT_ALARM`. Sin él, PACE no aparece en «Alarmas y recordatorios», el botón de Ajustes no sirve y el aviso de fin de Foco puede retrasarse minutos. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/android/app/src/main/AndroidManifest.xml) | Por comprobar: creo que el complemento de avisos no lo añade solo. Mira los permisos del AAB final. | Declararlo y probar con el móvil bloqueado 25 min. |
| 2 | El fin de la pausa no avisa con la app en segundo plano. El aviso del sistema solo se programa en modo Foco, y al acabar Pausa o Larga solo suena la campana. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/focus/FocusTimer.jsx) | Confirmado en código. | Programar también el aviso «vuelve al bloque N». |
| 3 | Fin de Foco y fin de pausa suenan igual (`pomodoro.end`). Sin mirar la pantalla no sabes si toca parar o volver. | Confirmado en código. | Dos sonidos distintos. |
| 4 | La racha cuenta días naturales seguidos y se pone a cero al abrir la app si faltó un día. Quien trabaja de lunes a viernes la ve a cero cada lunes. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-core.support.jsx) | Confirmado (antes era sospecha). | Contar días laborables o semanas con 3 días o más. |
| 5 | Los logros de racha de 7, 14, 30, 60, 100 y 365 días y «7 días de agua seguidos» exigen usar la app en fin de semana. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-achievements.jsx) | Confirmado. | Mismo cambio que el 4. |
| 6 | Conviven dos «planes del día». Los logros «ritual» y «plan» piden Mueve, Respira, Estira y agua el mismo día, pero «A tu ritmo» sirve otra cosa. Puedes hacer todas tus pausas y no ganar el logro. | Confirmado en logros; no he vuelto a cruzarlo con las series. | Que «plan completo» sea terminar las pausas servidas. |
| 7 | Las pausas manuales duran 5 y 15 minutos fijos; solo el Foco se puede ajustar. | Confirmado. | Dos ajustes más, o heredar los de «A tu ritmo». |

## Experiencia y recurrencia

- **Las bibliotecas quedan escondidas en móvil.** Con «A tu ritmo» en la pantalla principal no hay botones de actividades; el propio código dice que la barra lateral es la única puerta a las tres bibliotecas. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/shell/Sidebar.jsx) En móvil esa barra es un cajón cerrado. Quien solo quiere «un estiramiento de cuello ahora» no lo encuentra. Pondría un botón fijo «Pausa ahora» en la pantalla principal.
- **Algunos logros premian lo contrario de lo que vendes.** Hay sellos por sesiones entre las 2 y las 4 de la madrugada, después de las 21 h y por 120 minutos en un día. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-achievements.support.jsx) En una app de pausas saludables yo premiaría cerrar la jornada a su hora.
- **La barra lateral no sugiere nada con «A tu ritmo» sin pausa pendiente.** Es decisión tuya del 8 de octubre y tiene sentido, pero al cerrar la jornada queda vacía. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/shell/Sidebar.selectors.js) Ahí cabría «mañana a las 9:00, bloque 1».

## Lo que está bien

- **El reloj:** se calcula por hora real, no se desvía en segundo plano y no cuenta dos veces un bloque. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/focus/useCountdown.jsx)
- **La campana en Android:** suena una sola vez y los avisos van en cola con confirmación. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/android.avisos.js)
- **Los logros:** un aviso por sesión, del módulo que acabas de hacer, y «explorar» pide tres sesiones.

## Orden que seguiría

1. Filas 1 y 2 antes de repartir la prueba a los 12 testers: un temporizador que avisa tarde es lo primero que hace desinstalar.
2. Filas 4 y 5 juntas: es un solo cambio.
3. El botón «Pausa ahora» en móvil.

No he comprobado si terminar un bloque de Foco, sin hacer ninguna pausa, mantiene la racha.

---

## Pasada 5

Quinta pasada, centrada en qué construiría para que pagar merezca la pena. Lo que hoy se cobra (variedad entre días, carta del lunes, mes y año, constructor) es fácil de no echar de menos, así que yo añadiría cosas que se noten cada día. Sale de leer código y documentos; no he probado nada con usuarios y me he mantenido dentro de tu lista de «nunca» (sin cuentas, sin wearables, sin IA visible).
Lo que implementaría, por orden

1. Modo «Solo pausas», sin Pomodoro. Es lo que más mercado abre: mucha gente quiere que le avisen de moverse y no quiere temporizador de foco. Ya lo tienes apuntado como V1, sin fecha. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/ROADMAP.md) Moova, el competidor directo, se vende justo como recordatorios adaptados a tu horario. [Source](https://apps.apple.com/us/app/moova-stand-up-reminder/id1518522560) Lo pondría lo primero después de v1.
2. Que la prueba de 7 días enseñe lo que se paga. La carta del lunes pide tres días de uso y llega cuando la prueba ya casi acaba; lo dejaste para después de v1 (U4). [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/docs/product/DECISIONES_PRODUCTO.md) Yo lo adelantaría: una carta corta al tercer día con «esto he aprendido de ti y esto cambio mañana».
3. El calendario como argumento de venta. Las apps de pausas de pago para Mac presumen de leer el calendario para no interrumpir reuniones y de detectar cámara o micrófono en uso. [Source](https://standlock.app/alternatives) Tú ya esquivas reuniones, pero en la web no funciona para nadie porque los dos identificadores están vacíos. Cerrar el llavero (punto 13) es terminar una función vendible, más que una tarea técnica.
4. PACE fuera de la app. Hoy hay que abrirla para todo. Tres piezas:
   * Botones en el aviso fijo de Android: «Pausar» y «Hacer la pausa». La pieza nativa ya está preparada para ellos. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/docs/product/DECISIONES_PRODUCTO.md)
   * Un widget con el bloque actual y la próxima pausa.
   * Una ventanita flotante con el aro en el ordenador. No he comprobado si la pestaña ya muestra la cuenta atrás en el título.
5. Programas con principio y fin. «Cuatro semanas para el cuello» o «Espalda de oficina en 20 días», reutilizando los Caminos que tienes ocultos. Dan un motivo para seguir pagando el mensual y algo que enseñar en `/premium`.
6. Un constructor más capaz. El editor que he leído solo añade ejercicios sueltos del registro, con duración en pasos de 5 segundos y flechas para ordenar. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/custom/CustomBuilder.jsx) Añadiría tres cosas:
   * Partir de una rutina de PACE y modificarla, o duplicar una propia. No he visto esa opción en el editor, aunque podría estar en la tarjeta de la biblioteca.
   * Fijar una rutina propia a una hora del día («mi rutina de las 11»).
   * Botones más grandes: miden 24 px, pequeños para el dedo.
7. Pasar los datos al móvil sin cuenta. Quien compra en la web y usa también el teléfono tiene dos historiales separados y solo copia manual. Un traspaso por código QR o por archivo en su propia nube encaja con «sin cuentas» y refuerza el de por vida.
8. Resumen del año para compartir. Una imagen generada en el dispositivo con tus horas de foco y pausas. Es publicidad gratis y lo tienes en «fuera de v1».

Una decisión que es tuya
Tu regla dice que nada propone algo cerrado. Eso es elegante, pero implica que la invitación a pagar solo aparece cuando alguien toca un candado. El mejor momento para ofrecerlo suele ser justo después de un «Sí» a «¿Te ayudó?» o al cerrar una jornada completa. Yo probaría una línea discreta ahí, pero rompe la regla tal como está escrita.
Si solo hicieras tres, serían el 2, el 3 y el 1, en ese orden: los dos primeros hacen que lo ya construido se pueda vender, y el tercero es el que más gente nueva trae.
