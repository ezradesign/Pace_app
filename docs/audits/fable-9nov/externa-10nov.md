# Auditoría externa de Fable (10 nov. 2026), tal como la trajo Ez

> Hecha fuera de Claude Code, en claude.ai, con el mismo modelo y el texto de la hoja de pasos. Leyó `main` (v0.196.0), la
> documentación y las páginas publicadas; no ejecutó la app ni pudo abrir `docs/audits/fable-9nov` (vive en esta rama, no en
> `main`). Se guarda entera y sin tocar. Lo comprobado de cada punto va en `externa-10nov-comprobado.md`.

# Auditoría de PACE (v0.196.0)

**Veredicto:** el producto está muy por encima de la media en oficio (regla del día, cobro firmado, 1449 pruebas), pero hoy no está listo para vender. Lo que falta no es código, sino distribución, altas y medición.

Alcance: he leído el código de `main`, la documentación y las páginas publicadas. No he ejecutado la app ni visto píxeles, y la carpeta `docs/audits/fable-9nov` no se dejó abrir. Lo marcado como "por probar" es una sospecha razonada, no un fallo reproducido.

## 1. Para vender: qué lo impide hoy

- **No hay forma de captar a nadie.** En `/premium` los dos botones llevan a "Avísame" y la lista me salió cerrada ("The list opens very soon"). Cada visita se pierde; conectar el KV es lo más rentable que puedes hacer esta semana. [Source](https://pacegrass.app/premium)
- **La raíz es la app, no una landing.** `robots.txt` y `sitemap.xml` devuelven la app con un 200, y el título lleva la versión ("PACE · Foco · Cuerpo — v0.196.0"). Publica la landing que tienes en rama y saca la versión del título. [Source](https://pacegrass.app/sitemap.xml)
- **La compra web no vale en el móvil.** La página lo dice con honestidad, pero es la mayor objeción a un "de por vida": quien trabaja con portátil y móvil paga dos veces. Apple prohíbe desbloquear con claves de licencia propias, así que sin cuentas no tiene arreglo limpio. Yo vendería la compra web explícitamente como "PACE para el ordenador". [Source](https://developer.apple.com/news/?id=xk8d7p8c)
- **El precio deja dinero en la mesa.** Wakeout cobra 69,99 $/año o 12,99 $/mes; Moova ronda 9,99 $/mes y 79,99 $ de por vida. A 19,99 € el de por vida equivale a menos de siete mensualidades, así que el mensual casi nadie lo elegirá. Y arrastra la mayor parte de la complejidad del cobro (renovación, bajas, avisos de prueba). Saldría solo con el pago único, a 19,99 € como precio de lanzamiento y más alto después; tu promesa de precio lo permite. [Source](https://wakeout.app/pricing) [Source](https://deskletics.app/compare/wakeout-vs-stretchminder/)
- **La prueba de 7 días acaba antes de que se vea el valor.** La carta del lunes exige tres días de uso y pruebas repetidas, y las estadísticas de mes y año necesitan semanas. Lo único de pago que se nota en la primera semana es la variedad de pausas, y no se anuncia. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/ritmo.motor.js)
- **No mides nada.** Sin analítica no sabrás si la gente vuelve, que es tu objetivo. Como mínimo, activa la analítica sin cookies en la landing y usa las métricas de las consolas de las tiendas.
- **El repositorio público expone tus puntos débiles.** `STATE.md` y `docs/audits` listan fallos de cobro aún abiertos (el `guardar()` no atómico), dónde guardas las llaves y que no tienen copia fuera de casa. Antes de encender Stripe real, hazlo privado o saca esos documentos, y haz la copia de la llave k2. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/STATE.md)
- **Falta lo legal y un correo propio.** Los textos siguen en borrador, `/desistir` está cerrada y el contacto es un Gmail. No soy abogado; que lo revise uno antes de cobrar.
- **Los 12 testers no han empezado.** Google exige 12 testers durante 14 días seguidos, y de eso depende la fecha de v1. [Source](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)

## 2. Bugs y riesgos

| # | Qué pasa | Estado | Arreglo |
|---|---|---|---|
| 1 | Tras pausar, reanudar y recargar, la hora de inicio del bloque se deriva del final y se desplaza; igual entre pestañas. Ensucia lo que aprende el motor. | Confirmado en `FocusTimer.jsx` | Guardar `inicio` también con el bloque en marcha y mandarlo en el aviso `corre`. |
| 2 | Los otros hallazgos de la revisión del 9 nov. siguen pendientes: pausa contada como foco (45 frente a 65), cadencia que rehace lo hecho, "Cambiar" con un Foco en marcha, "Hoy" que esconde lo hecho por libre. | Según tu propio documento; no los he reproducido | Antes de v1: descuadran las cifras que el usuario ve. |
| 3 | El doble cómputo entre pestañas solo se frena con el último id contado y un candado de 10 minutos. | Mecanismo confirmado, fallo por probar | Lista corta de ids contados. |
| 4 | El aviso de fin usa una etiqueta fija, `silent: true` y sin `renotify`: si no cerraste el aviso anterior, el siguiente puede sustituirlo sin llamar la atención. | Por probar | `renotify: true` o una etiqueta por bloque. |
| 5 | El permiso de notificaciones se pide en el primer "Empezar", sin contexto. Si lo deniegan, el aviso queda apagado. | Confirmado | Pedirlo al acabar el primer bloque, con una frase que explique para qué. |
| 6 | El acceso abierto se lee de `window.PREMIUM_ABIERTO_HASTA_V1` en cada llamada: tras v1, una línea en la consola lo abriría todo. | Confirmado en `state-entitlement.jsx` | Quitar esa vía del build de producción el día de v1. |
| 7 | Un código es al portador y se valida sin red: uno compartido o devuelto sigue valiendo hasta que publiques una lista de anulados. | Confirmado, riesgo asumible | Saberlo y vigilar las devoluciones. |
| 8 | La racha parece contar días naturales: quien trabaja de lunes a viernes la rompería cada fin de semana. | Por probar | Racha por días laborables o por semanas con tres días o más. |
| 9 | El texto de 9 a 12 px va a 4,2:1 y 3,9:1 de contraste, por debajo del 4,5:1 de WCAG AA. Los enlaces fantasma de la bienvenida miden unos 25 px de alto. | Confirmado | Subir contraste o tamaño; zona táctil de 44 px. |
| 10 | En Safari, el almacenamiento de una web sin visitar puede borrarse a los 7 días; ahí viven el historial y el código. | Por probar; no vi `storage.persist()` | Pedir almacenamiento persistente y recomendar instalar la app. |

Fuentes de la tabla: [FocusTimer.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/focus/FocusTimer.jsx), [FocusTimer.support.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/focus/FocusTimer.support.jsx), [FocusTimer.pestanas.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/focus/FocusTimer.pestanas.jsx), [revisión del 9 nov.](https://raw.githubusercontent.com/ezradesign/Pace_app/main/docs/audits/chatgpt-8nov/respuesta-2-dia-tiempo-cuenta.md), [state-entitlement.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-entitlement.jsx), [state-achievements.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-achievements.jsx), [Onboarding.jsx](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/onboarding/Onboarding.jsx).

Dos menores: el service worker precarga unos 250 archivos de una vez, incluidas las láminas de Caminos (ocultos), y un solo 404 tumba la instalación entera. Y el manifiesto no trae `screenshots`, así que Chrome no enseña la instalación enriquecida. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/sw.js)

## 3. Calendario

El diseño es bueno:

- Un evento por bloque con su pausa dentro, marcado libre y privado.
- Lo propio se reconoce por propiedad privada o por id, nunca por texto, y no toca eventos ajenos.
- De las reuniones solo guarda las horas.
- El modo "Mantenerlo al día solo" agrupa cambios, reintenta, usa candado entre pestañas y corta las escrituras pendientes al desconectar.

Los límites son de producto:

- **En la web hoy solo existe el archivo .ics.** Los identificadores de Google y Microsoft están vacíos. La verificación de Google para un permiso sensible puede tardar hasta 10 días, así que el alta es camino crítico. [Source](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification)
- **Sin servidor, el permiso caduca.** El de Google dura una hora y el de Microsoft un día, así que "al día solo" pedirá "Poner al día" a menudo. Hacéis bien en no venderlo en la web. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/ritmo.calendario.web.js)
- **Google solo lee el calendario `primary`.** Las reuniones en calendarios secundarios o compartidos no se ven y el plan chocará con ellas. Android ya deja elegir calendario; la web debería.
- **El iPhone solo tiene el archivo.** La función que más diferencia a PACE para un oficinista no existe en esa plataforma.
- **Hay dos formas de evento.** "Añadir" y el modo solo escriben eventos distintos (con y sin aviso); unifícalas. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/ritmo.calendario.solo.js)

No he visto una forma de marcar a mano "reunión de 11 a 12". Si no existe, es la mejora más barata para quien no conecta calendario.

## 4. Plan diario, semana y ejercicios

- **El día pide mucho.** La regla está bien pensada (llegar tarde, comida a su hora, reuniones como obstáculos), pero una jornada entera son unas nueve paradas con ejercicio. La primera semana eso puede leerse como nueve ocasiones de fallar. Ofrecería una intensidad al empezar (ligera, de unas tres pausas activas, o completa). [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/ritmo.regla.js)
- **El plan gratis se repetirá.** Sin pagar salen 5 rutinas de Estira y 2 de Mueve, y la jornada pide 4 y 3. Como palanca de pago funciona, pero el usuario gratuito puede aburrirse antes de convertirse.
- **La variación semanal no se ve.** Seis temas por semana y acentos por día, y nada se anuncia. Aquí discrepo de la decisión "nada": una personalización invisible no se percibe ni se paga. Las frases de motivo ("Caderas: sin mover hoy", "Llevas 70 min sentado") son lo mejor de la app; lleva esa idea a la semana con una línea el lunes. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ritmo/ritmo.semana.js)
- **Mueve y Estira no tienen voz.** Solo Respira la tiene. En un estiramiento de cuello no miras la pantalla; una voz que diga el ejercicio y el cambio de lado sería la mejora con más sensación de producto de pago.
- **Queda una revisión de fisioterapeuta.** `CONTENT.md` la deja pendiente "antes de v1.0" para Fondos en silla y otros; esa rutina está publicada y gratis. Ciérrala antes de cobrar. El mismo documento está desfasado (cifras de la v0.176.0). [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/CONTENT.md)

## 5. Interfaz y uso recurrente

- **Nada invita a volver.** La única notificación es el fin de un Foco. Ya conoces el horario y la semana tipo de cada persona: un aviso opcional a la hora de entrada ("Hoy, como cada jueves, 9:00–17:00") sería la mayor palanca de retención. Lo mismo para la carta del lunes. [Source](https://pacegrass.app/privacy)
- **La bienvenida tarda en dar valor.** Con Caminos ocultos son bienvenida, semana, precios y visita guiada antes de hacer nada. Dejaría bienvenida y semana, y acabaría arrancando el primer bloque o una respiración de un minuto. Los precios, tras la primera pausa hecha.
- **Se perdieron las preguntas de perfil.** Solo salían con Caminos. Una sola ("¿qué te molesta más: cuello, espalda, cadera?") alimentaría las zonas que ya usa el motor y haría sentir el plan como propio.
- **Sobran restos de Caminos.** El aro dice "Foco manual", que solo tenía sentido frente al Camino guiado. "Ciclo N / 4" tampoco explica nada.
- **Hay dos sistemas de pausa.** El selector Foco/Pausa/Larga convive con la pausa que cuenta el plan. Con un día en marcha, escondería el selector manual.
- **Sin sincronización, el historial se parte.** Como mínimo, un traspaso por enlace o QR entre dispositivos, que ya tienes anotado como decisión pendiente.

## 6. Orden que yo seguiría

1. **Esta semana:** abrir "Avísame", publicar la landing, subir la 0.191.1 y reunir los 12 testers, hacer la copia de las llaves y cerrar el repositorio.
2. **Antes de cobrar:** los hallazgos del 9 nov., `guardar()` atómico, las filas 4 a 6 de la tabla, lo legal y la revisión de fisioterapeuta.
3. **Para v1:** aviso de inicio de jornada, bienvenida corta con una pregunta, racha laborable, la semana visible y el alta de Google.
4. **Después:** voz en Mueve y Estira, traspaso entre dispositivos y revisar precio con datos.

Puedo profundizar en una parte concreta: reproducir los fallos "por probar" con casos de prueba, reescribir la bienvenida o replantear los precios.
