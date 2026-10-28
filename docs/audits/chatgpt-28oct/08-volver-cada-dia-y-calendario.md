# Revisión 8 de ChatGPT (28 oct. 2026): Que vuelvan cada día, y el calendario

> Texto tal cual lo pegó Ez. ChatGPT leyó `main` en `0d8b963`, sin ejecutar la app. Lo que comprobó la
> coordinadora contra el código de la 0.185.0 (CAL-1 a CAL-6 y las ideas de producto) está en `LEEME.md` de esta
> carpeta.

---

**Sí. Y creo que ambos temas están muy relacionados: para alguien que teletrabaja, el calendario puede ser el motivo por el que PACE deja de ser «otra app que tengo que acordarme de abrir» y pasa a formar parte de su jornada.**

Pero hay una condición: **tiene que quitar trabajo y acertar con el momento.** Si obliga a mantener dos agendas, interrumpe reuniones o requiere reconectar continuamente, puede producir el efecto contrario.

He revisado el código de `main`, commit `0d8b963`, y documentación oficial de Google y Microsoft. Es una auditoría de código y de producto, **no una prueba con cuentas reales ni una medición de retención**. [Fuente](https://api.github.com/repos/ezradesign/Pace_app/commits/main)

# 1. Qué haría que volviera a PACE cada día

## La promesa que intentaría cumplir

Como persona que trabaja desde casa, no volvería principalmente para descubrir otro ejercicio.

Volvería porque:

> **«PACE me encuentra un momento para parar, me dice algo que puedo hacer y no me complica el trabajo».**

Esto es mi hipótesis principal de producto. Hay evidencia que respalda investigar las señales ligadas al contexto, la repetición y el feedback útil, pero no permite garantizar que una función concreta vaya a mejorar vuestra retención. Una revisión de 41 estudios encontró esas estrategias con frecuencia y señaló, precisamente, la falta de evaluación a largo plazo y los problemas de exigir demasiada iniciativa al usuario. [Fuente](https://pmc.ncbi.nlm.nih.gov/articles/PMC11161714/)

## A. El recorrido diario que buscaría

| Momento | Lo que piensa la persona | Respuesta que debería dar PACE |
|---|---|---|
| Abro el ordenador | «¿Cómo viene el día?» | Mi horario habitual y las reuniones consideradas, sin volver a configurarlo todo. |
| Empiezo a trabajar | «No quiero organizar otra cosa». | Una acción principal clara: empezar foco **o activar acompañamiento de pausas**. |
| Termina una reunión | «Tengo un momento». | Una pausa que quepa de verdad antes de la siguiente. |
| El día se desordena | «Ahora no puedo». | Posponer o saltar sin castigo, sin acumular deuda. |
| Acabo una pausa | «Bien, sigo». | Cierre breve y vuelta al trabajo, no otra tarea dentro de PACE. |
| Regreso después de varios días | «Lo había dejado». | Empezar desde hoy, sin reproches ni recuperación de pendientes. |

**El objetivo no debería ser que abra mucho PACE. Debería ser que le resulte fácil hacer pausas útiles en sus días de trabajo.**

Una app que consigue que te muevas y cierres la pantalla puede estar funcionando mejor que otra con sesiones largas de uso.

---

## B. La oportunidad más importante: no exigir que adopte también el Pomodoro

### La persona que podemos estar perdiendo

> «Ya sé organizar mi trabajo. Uso Outlook, Teams y mi lista de tareas. Solo quiero que alguien me ayude a levantarme entre reuniones».

Actualmente, el progreso de «A tu ritmo» depende de los bloques de foco completados: `ritmoPlan()` calcula lo hecho a partir de `state.cycle`. La integración con el calendario también se construye alrededor de esos bloques y sus pausas. **Hay un acoplamiento real entre acompañamiento corporal y temporizador de trabajo.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/state-ritmo.jsx)

### Mi recomendación: dos formas de usar el mismo producto

| Forma | Para quién | Qué hace |
|---|---|---|
| **Foco y pausas** | Quiere trabajar con el temporizador de PACE. | Mantener el recorrido actual, bien pulido. |
| **Solo pausas** | Ya organiza su trabajo con otras herramientas. | Buscar oportunidades según horario y calendario, sin exigir iniciar y completar focos. |

No lo convertiría en dos aplicaciones ni duplicaría bibliotecas.

Sería una preferencia sencilla:

> **¿Cómo quieres que te acompañe?**  
> ○ Con bloques de foco y pausas.  
> ○ Solo con pausas durante mi jornada.

**Para mí, esta es la hipótesis con mayor potencial para ampliar el uso recurrente entre teletrabajadores.** Antes de construirla entera, probaría una maqueta con personas que usan mucho calendario.

---

## C. Familiaridad primero; variedad después

PACE ya tiene rotación diaria en `libraryParaAhora()`. En las bibliotecas, esa elección depende de la fecha y del catálogo, no del historial personal; el propio código lo establece así. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ui/library-rules.js)

Mi recomendación no es añadir todavía más rotación.

Como usuario principiante, también quiero:

> «Ponme aquella que ya sé hacer».

Ofrecería dos accesos complementarios:

- **Repetir la última pausa.**
- **Probar otra.**

Y después, si las pruebas lo justifican, favoritos.

**La variedad evita monotonía, pero la familiaridad reduce esfuerzo.** No intentaría que cada día fuera necesariamente distinto: una pausa conocida puede ser justo lo que hace que alguien la realice en lugar de descartarla.

---

## D. Tener una alternativa para los días difíciles

El hábito no se prueba el martes tranquilo, sino el jueves con entregas y reuniones.

Probaría esta salida contextual:

> **¿Hoy no te encaja una rutina?**  
> Muévete dos minutos sin mirar la pantalla.

No la presentaría como una versión inferior ni como una rutina fallida.

Reglas de producto que recomendaría:

- No acumular pausas pendientes.
- No proponer recuperar tres pausas al final.
- No prolongar la jornada para completar un plan.
- No aumentar automáticamente la dosis por llevar varios días usando PACE.
- Permitir desactivar las sugerencias durante el resto del día.

La promesa sería: **«También te sirvo cuando tienes poco margen».**

---

## E. Hacer visible el valor sin pedir más trabajo

El cierre diario debería responder:

> «¿PACE me ha ayudado a hacer algo que, si no, habría olvidado?».

Probaría un resumen pequeño, basado en acciones acreditadas:

> **Hoy has hecho tres pausas, ocho minutos en total.**

No:

- «Has estado ocho minutos menos sentado», si no lo sabemos.
- «Has mejorado tu postura».
- «Has sido más productivo».
- «Has completado el 40 %», como mensaje principal de un día complicado.

Para la vuelta diaria, me interesa más **reconocer lo realizado** que subrayar lo que faltó.

Tampoco preguntaría cada día por energía, ánimo, molestias, productividad y satisfacción. Eso convertiría una ayuda en un diario obligatorio.

---

# 2. Calendario: qué tiene PACE y qué falta para que resulte fiable

Primero, una distinción de lenguaje: para la persona puede ser «mi calendario de Gmail», pero en la interfaz usaría **Google Calendar**. No hace falta pedir acceso al correo para esta función.

## Lo que ya está bien encaminado

El código ya contempla:

- Leer reuniones y conservar sus franjas horarias.
- Reorganizar el plan alrededor de ellas.
- Modificar y borrar los eventos reconocidos como propios de PACE.
- Escribir eventos como **libres y privados**.
- Evitar determinados avisos duplicados cuando corre un Foco. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.destinos.js) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.web.js) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.solo.js)

**No empezáis de cero.** Lo que falta es definir con precisión qué significa «sincronizado» para el usuario.

## Hallazgos importantes

### CAL-1 · Los conectores web no están habilitados en el código revisado

`CALENDARIO_IDS` contiene identificadores vacíos para Google y Microsoft. `calendarioWebDisponible()` oculta cada proveedor si falta su identificador. La guía del repositorio también indica que deben completarse las altas y pegar esos valores. **En este commit, la conexión web no se ofrece por esta vía tal como está escrita.** No he comprobado una posible configuración diferente en el artefacto desplegado. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.web.js) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/docs/CALENDARIO_ALTAS.md)

**Prioridad:** bloqueante antes de prometer la integración web como disponible.

**Prueba:** una cuenta Google externa al equipo, una Outlook personal y una Microsoft 365 de empresa, en la versión publicada.

### CAL-2 · «Mantenerlo al día solo» no significa funcionar con PACE cerrado

El motor se ejecuta dentro de la app: observa cambios, usa temporizadores y revisa al volver. Con PACE cerrado no actualiza el calendario; los eventos y sus avisos ya escritos permanecen. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.motor.js)

**Caso real:**

1. A las 9:00 preparo el día.
2. Cierro PACE.
3. A las 10:00 me añaden una reunión para las 10:30.
4. La pausa que PACE había escrito para esa hora no se recoloca mientras la app permanece cerrada.

**Qué pensaría:** «Le he dado acceso al calendario; ¿por qué no lo ha visto?».

**Arreglo inmediato:** explicar **«Se actualiza mientras PACE está abierto y conectado»**.

**Decisión posterior:** si queréis ofrecer adaptación aun con todo cerrado, hace falta diseñar ejecución fuera de la página, autorización persistente y las correspondientes garantías de privacidad. No se resuelve cambiando el texto de un botón.

### CAL-3 · Reconectar Google durante la jornada puede romper el valor Premium

El flujo actual guarda los permisos en `sessionStorage`; Google no tiene renovación implementada y Microsoft sí tiene una renovación limitada. Por tanto, **la continuidad depende de esta sesión de navegador y de la vigencia de sus permisos**. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.web.js)

Para un producto de uso diario, esta frase sería muy mala señal:

> «Pago para no ocuparme, pero tengo que vigilar si sigue conectado».

**Recomendación:** no vender la automatización como completamente desatendida hasta comprobar una jornada completa y la vuelta al día siguiente.

Y una corrección importante: **«Google solo permite una hora» no es una limitación universal de Google Calendar**. Es una consecuencia del flujo elegido. Google documenta acceso sin presencia del usuario y renovación mediante su flujo de servidor, con sus requisitos y límites. [Fuente](https://developers.google.com/identity/protocols/oauth2/web-server)

### CAL-4 · «Calendario al día» no garantiza que las reuniones estén recién comprobadas

`calendarioPendiente()` compara el plan con la última escritura guardada en el dispositivo, no con una consulta actual al proveedor. Por otra parte, `calendarioRefrescarReuniones()` captura los errores de lectura y devuelve `false`. **Puede mantenerse la apariencia de plan exportado correctamente sin comunicar que no se han podido volver a comprobar las reuniones.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.solo.js) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.destinos.js)

Separaría dos estados:

- **Reuniones comprobadas hace 2 min.**
- **Plan de PACE enviado al calendario.**

Si falla:

> «No hemos podido comprobar cambios recientes. Seguimos usando las reuniones de las 10:05».

**Prioridad:** alta. La confianza depende de distinguir «no hay reuniones» de «no hemos podido leerlas».

### CAL-5 · La web solo consulta el calendario principal o predeterminado

Google usa `calendars/primary/events`; Microsoft, `me/calendarView`. No hay en estas llamadas selección de varios calendarios de lectura. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.web.js)

**Persona afectada:** autónomo con calendario personal, calendario de cliente y otro compartido.

**Qué necesita:**

> «Ten en cuenta Trabajo y Cliente. No leas Cumpleaños».

Separaría:

1. **Calendarios que PACE consulta para saber cuándo no interrumpir.**
2. **Calendario donde PACE escribe sus propuestas.**

No tienen por qué ser el mismo.

### CAL-6 · Arrastrar una pausa en Outlook no equivale a cambiarla en PACE

La comparación local no detecta por sí sola una edición externa. Cuando vuelve a ejecutarse una sincronización, `calendarioCambios()` trata el plan de PACE como lo deseado y puede corregir el evento para devolverlo a ese plan. **No es una sincronización bidireccional de decisiones.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.solo.js)

**Recomendación para v1:** no intentar resolver toda la edición bidireccional. Explicar:

> «Cambia tus pausas desde PACE. Los eventos del calendario reflejan tu plan».

Más adelante podéis admitir mover o descartar una pausa desde el calendario, pero requiere reglas explícitas para evitar que ambos sistemas se corrijan mutuamente.

---

# 3. Cómo diseñaría una integración realmente útil

## Primero leer; escribir solo si la persona quiere

Ahora, `calendarioLlevar()` une acceso, lectura opcional de reuniones y escritura del plan. Para quien solo quiere que PACE no le interrumpa, eso supone aceptar también llevar eventos a su agenda. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ritmo/ritmo.calendario.destinos.js)

Yo separaría estas opciones:

### Nivel 1 · «Respeta mis reuniones»

- Consulta disponibilidad.
- Propone pausas en PACE.
- No añade nada al calendario.
- No modifica citas.

**Esta sería mi opción recomendada para empezar.**

### Nivel 2 · «Muéstrame las pausas en mi calendario»

- Escribe en un calendario elegido, preferiblemente separado.
- Permite ocultarlo fácilmente.
- Mantiene los eventos libres por defecto.
- Explica que las propuestas no son actividades completadas.

### Nivel 3 · «Reserva este rato»

Acción expresa sobre una pausa concreta para marcarla como ocupada.

No bloquearía automáticamente toda la jornada: **ver una propuesta no es lo mismo que comprometer disponibilidad**.

## La regla central: hueco libre no significa tiempo disponible

Un intervalo de diez minutos puede incluir ir al baño, preparar la siguiente llamada o terminar una nota.

Probaría estas reglas iniciales de producto, **no como recomendaciones clínicas**:

| Situación | Comportamiento propuesto |
|---|---|
| Reunión de 10:00 a 10:30; siguiente a las 10:35 | No ofrecer una rutina de cinco minutos que consuma todo el margen. |
| Reunión hasta las 10:30; siguiente a las 10:45 | Ofrecer una pausa breve, dejando margen antes de la siguiente. |
| Tres reuniones seguidas | No acumular avisos; buscar el siguiente hueco adecuado. |
| Reunión cancelada | Ofrecer una oportunidad, no llenar automáticamente todo el hueco. |
| Reunión que probablemente ha terminado | Decir «Tu reunión estaba prevista hasta ahora», no afirmar que ha acabado. |
| Vacaciones o ausencia marcada como ocupado | No preparar una jornada normal sin confirmación. |
| Día con poco margen | Reducir propuestas; no trasladarlas a después de la hora de salida. |

**Nunca inferiría que alguien está sentado, cansado o necesita un ejercicio concreto por el título de una reunión.**

## Configuración comprensible

La primera conexión debería dejar claras cuatro cosas:

> **PACE usará tus horarios ocupados para buscar momentos para parar.**  
> No necesita leer tu correo.  
> No moverá ni borrará tus reuniones.  
> Añadir pausas a tu calendario es opcional.

En Google, `freeBusy` permite obtener intervalos ocupados sin traer el contenido de los eventos. Es una opción a evaluar para el modo de solo lectura, no un sustituto automático de todas las llamadas actuales. [Fuente](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query)

En Microsoft no copiaría esa solución sin distinguir cuentas: `getSchedule` no admite cuentas personales delegadas; `calendarView` sí admite cuentas personales y profesionales y permite seleccionar propiedades. También hay que recordar que permisos «básicos» no significan necesariamente «solo horas»: minimizaría lo solicitado y lo conservado. [Fuente](https://learn.microsoft.com/en-us/graph/api/calendar-getschedule?view=graph-rest-1.0) [Fuente](https://learn.microsoft.com/en-us/graph/api/calendar-list-calendarview?view=graph-rest-1.0)

## Android debe explicarse por separado

PACE usa el calendario del sistema Android, no una conexión directa equivalente a la web. Lee los eventos que expone ese sistema y escribe en sus calendarios disponibles. **Hay que comprobar que la cuenta de trabajo y sus eventos aparecen realmente ahí; no basta con que la persona tenga instalada una app llamada Outlook.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/0d8b963751f6edf4965c5f4ef1a830271006ec55/app/ui/android.calendario.js)

La comprobación de éxito debería ser:

> «Podemos ver dos periodos ocupados hoy. ¿Coinciden con tu calendario?».

Y si no coinciden, ofrecer horario manual, no un falso «conectado correctamente».

---

# 4. ¿Hace falta un servidor para todo esto?

**Para una v1 útil, no necesariamente. Para prometer actualización con PACE cerrado, sí hace falta una arquitectura que continúe trabajando fuera de la página.**

| Opción | Ventaja | Límite |
|---|---|---|
| **Local, mientras PACE está abierto** | Menos infraestructura y datos fuera de PACE. | No adapta el plan con la app cerrada; depende de permisos y ejecución. |
| **Servicio opcional de sincronización** | Puede recibir cambios y actualizar sin la página abierta. | Credenciales protegidas, ejecución, costes, desconexión, borrado y privacidad más complejos. |

Google ofrece notificaciones de cambios mediante un receptor HTTPS, pero los canales caducan y requieren renovación; además, la notificación no contiene el detalle del cambio, que debe consultarse. Microsoft también ofrece suscripciones a cambios y exige gestionar su ciclo de vida. **Un webhook no resuelve por sí solo la sincronización ni la planificación.** [Fuente](https://developers.google.com/workspace/calendar/api/guides/push) [Fuente](https://learn.microsoft.com/en-us/graph/outlook-change-notifications-overview)

**Mi elección ahora:** validar primero el acompañamiento local con una promesa honesta. Construir sincronización desatendida solo si las pruebas muestran que es una razón real de uso y compra.

---

# 5. Qué mantendría gratis y qué podría justificar pagar

Esta sería mi recomendación, pendiente de validar:

| Gratis | PACE completo |
|---|---|
| Pausas básicas útiles. | Más variedad y rutinas propias. |
| Respetar reuniones mediante una conexión de lectura sencilla. | Adaptación y mantenimiento del plan más automatizados, cuando sean fiables. |
| Posponer, saltar y silenciar. | Preferencias y planificación más personalizadas. |
| Saber si el calendario está actualizado o falla. | Resúmenes personales útiles, con suficientes datos. |

**No cobraría por dejar de interrumpir una reunión ni por poder silenciar avisos.** Eso es calidad básica.

Sí veo una propuesta de pago comprensible:

> **«Tus pausas preparadas y adaptadas a tu jornada, sin reorganizarlas a mano».**

Pero el valor está en **cumplir esa comodidad**, no en poner «sincronización inteligente» en la lista de beneficios.

---

# 6. Cómo comprobaría si realmente hace que vuelvan

Haría un piloto de dos semanas con teletrabajadores que tengan jornadas distintas. Con una muestra pequeña no intentaría demostrar porcentajes universales: buscaría patrones y motivos de abandono.

### Mediría

- Días de trabajo con al menos una pausa acreditada.
- Vuelta en los siguientes días laborables, no necesariamente sábado y domingo.
- Tiempo desde abrir PACE hasta empezar algo útil.
- Avisos descartados, inoportunos y duplicados.
- Reconexiones necesarias.
- Pausas realizadas después de una oportunidad sugerida.
- Uso con y sin temporizador.
- Qué eligen repetir por iniciativa propia.

**Conectar el calendario o abrir una notificación no cuenta como hacer una pausa.** Y cualquier medición remota nueva debe diseñarse respetando vuestra promesa de privacidad; el piloto puede empezar con registros locales y entrevistas.

### Preguntas que haría

1. «¿En qué momento te acordaste de PACE sin que nadie te lo pidiera?».
2. «¿Cuándo te molestó?».
3. «¿Qué pasó el primer día que no pudiste seguirlo?».
4. «¿Te serviría si no usaras el temporizador?».
5. «Si mañana desapareciera, ¿qué echarías de menos?».

## Mi orden de trabajo

1. **Validar “Solo pausas” con una maqueta.**
2. **Separar lectura de reuniones y escritura de eventos.**
3. **Resolver disponibilidad real, permisos y estados de frescura.**
4. **Probar una jornada completa y la vuelta del día siguiente.**
5. **Dar acceso rápido a repetir una pausa conocida.**
6. **Medir utilidad recurrente antes de construir más automatización.**

**La idea más importante: no intentaría que el usuario tenga ganas de “entrar en una app” cada día. Intentaría que piense: «Cuando trabajo con PACE, me resulta más fácil acordarme de parar».** Esa es la costumbre que merece la pena construir.
