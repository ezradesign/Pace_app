# Revisión 3 de ChatGPT (28 oct. 2026): El valor de PACE: uso, oferta de pago, precios y cómo validarlo

> Texto tal cual lo pegó Ez. ChatGPT leyó `main` en `c702a11`, sin ejecutar la app. Lo que comprobó la
> coordinadora contra el código de la 0.185.0, con sus códigos (U1-U5 y «De producto»), está en `LEEME.md` de esta
> carpeta y en el relevo (`docs/traspaso/relevo-coordinadora-22oct.md`, bloque «28 oct., ~20:10»).

---

**Sí: PACE tiene suficiente valor para empezar a cobrar. Pero ahora mismo explica peor lo que vende de lo que realmente ofrece.** No añadiría otras veinte rutinas para solucionar eso.

Mi diagnóstico es:

> **Gratis:** PACE te ayuda a hacer pausas.  
> **PACE completo:** te ahorra decidir, adapta las propuestas a tu semana y te deja hacerlas tuyas.

Esa segunda frase es una **propuesta de posicionamiento**, no una conclusión sobre disposición a pagar: eso hay que validarlo con compras reales.

He vuelto a comprobar `main`: sigue en **`c702a11`**. Esta revisión combina lectura del código, página comercial e investigación de alternativas; **no he ejecutado pruebas de interacción en Android ni una prueba de usabilidad con personas**. No repito los cuatro problemas del temporizador de ejercicios de la pasada anterior. [Source](https://api.github.com/repos/ezradesign/Pace_app/commits/main)

---

# 1. Auditoría: qué impide que la experiencia se sienta realmente pulida

## U1. Puedes perder una rutina mientras la estás construyendo

**Prioridad: alta. Deducido del código.**

**Dónde:** `app/custom/CustomBuilder.jsx`, estados `name` y `steps`, y los `Modal` de editor y selector.

**Recorrido:**
1. Escribes el nombre de tu rutina.
2. Añades varios ejercicios y ajustas sus tiempos.
3. Abres el selector para añadir otro.
4. Pulsas Escape, la × o fuera de la ventana.

**Resultado:** el selector llama a `onClose`, no a «volver al editor». El borrador vive únicamente en el estado del componente; no hay comprobación de cambios pendientes ni persistencia del borrador. Una salida accidental puede descartar el trabajo. Es especialmente mala experiencia en una función por la que acabas de pagar. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/custom/CustomBuilder.jsx)

**Qué cambiaría:**
- En el selector, Atrás/Escape debe volver al editor.
- Al cerrar un editor modificado: **«¿Guardar el borrador o descartarlo?»**
- Mejor aún: borrador local recuperable, separado de las rutinas guardadas.
- Si falla el guardado, explicar el motivo; no dejar el botón aparentemente sin respuesta.

**Prueba de aceptación:** crear, editar y cerrar por cada vía; al volver, o se conserva el borrador o hubo una decisión explícita de descartarlo.

---

## U2. Con teclado puedes editar una rutina propia, pero no iniciarla desde su tarjeta

**Prioridad: alta para accesibilidad. Deducido del código.**

**Dónde:** `app/custom/CustomRoutines.jsx`, `CustomRoutineCard`; `app/ui/Primitives.jsx`, `Card`.

La tarjeta inicia la rutina mediante el `onClick` de `Card`. Pero `Card` genera un `<div>` sin comportamiento de teclado ni entrada en el orden de tabulación. El lápiz sí es un botón.

**Qué experimenta la persona:** llega al lápiz de editar, pero no tiene un control equivalente para hacer la rutina. Tener un elemento clicable no lo convierte en un botón accesible. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ui/Primitives.jsx)

**Qué cambiaría:** una acción explícita **«Empezar [nombre]»**, con el botón de editar separado. Evitar envolver ambos en otro botón.

**Prueba de aceptación:** crear una rutina y completarla usando solo Tab, Mayús+Tab, Enter y Espacio. Las tarjetas actuales delegan la acción principal en ese `Card` clicable. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/custom/CustomRoutines.jsx)

---

## U3. La «carta del lunes» obliga a tomar decisiones justo cuando quieres empezar a trabajar

**Prioridad: media-alta. Comportamiento confirmado; valoración de experiencia.**

**Dónde:** `app/ritmo/RitmoCarta.jsx`, `RitmoCartaVentana`.

La carta se abre automáticamente cuando la pantalla principal queda libre. Se monta sin `onClose`: no tiene la salida habitual por ×, fondo o Escape. Para continuar hay que responder; **«Dejarla como estaba» rechaza los cambios**, no equivale a «lo miro luego». [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ritmo/RitmoCarta.jsx)

**El problema de producto:** una ventaja Premium se puede sentir como una tarea administrativa del lunes.

**Qué cambiaría:**
- Mostrar una tarjeta discreta: **«Tu resumen semanal está listo»**.
- Permitir abrirlo cuando quieras.
- Dentro: **«Aplicar cambios»**, **«Mantener mi semana»** y **«Ahora no»**.
- Posponer no debe registrar rechazo ni aplicar nada.

No quitaría la carta: **quitaría su obligatoriedad**.

**Prueba de aceptación:** poder empezar un Foco con una carta pendiente sin responderla; recuperarla después con las mismas propuestas.

---

## U4. La prueba de siete días puede acabar sin enseñar uno de los motivos principales para pagar

**Prioridad: alta para conversión. Riesgo deducido de las reglas, no fallo universal.**

**Dónde:** `app/ritmo/ritmo.motor.js`, `MOTOR_DIAS_CARTA` y `ritmoMotor`.

La carta requiere al menos **tres días de «A tu ritmo» en la semana anterior**, tomando semanas de lunes a domingo. No es una revisión tras siete días personales de uso. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ritmo/ritmo.motor.js)

**Caso concreto:**
- Una persona nueva empieza la prueba un viernes.
- Usa PACE ese viernes y después de lunes a viernes.
- El primer lunes solo tiene un día de la semana anterior: no hay carta.
- La prueba termina el viernes siguiente.
- La primera carta podría llegar el lunes posterior, **después del primer cobro**, si están disponibles los registros necesarios.

**Qué ve:** «una semana a tu medida» es parte de lo que compra, pero puede no haberlo experimentado al decidir.

**Qué haría antes de cambiar la duración de la prueba:**
1. Explicar cuándo aparece el primer resumen y qué necesita.
2. Ofrecer un **ejemplo claramente etiquetado**, nunca una adaptación ficticia presentada como personal.
3. Hacer que variedad, constructor y calendario aporten valor desde el primer día.
4. Después, probar si una duración mayor mejora compras retenidas, no solo altas de prueba.

**Prueba:** simular altas cada día de la semana y comprobar qué ventajas reales ha recibido cada persona antes del primer cobro.

---

## U5. En móvil se elimina precisamente la explicación que conecta el plan con el temporizador

**Prioridad: media. Mejora de comprensión; requiere prueba con personas.**

**Dónde:** `app/ritmo/RitmoPanel.jsx`, `RitmoComo`, `RitmoEscritorio` y `RitmoMovil`.

En escritorio aparece, antes de terminar el primer bloque, la explicación de que los bloques se hacen en el aro y al terminar llega la pausa. En móvil no se incluye: el código documenta que se retiró para ahorrar altura. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ritmo/RitmoPanel.jsx)

**Riesgo:** alguien elige «Dos horas» y no sabe si ya ha empezado, si debe tocar el aro o si el plan se ejecuta solo.

**Propuesta:** no volver a poner un párrafo permanente. Mostrar una indicación contextual, una vez:

> **Tu día está preparado. Pulsa «Empezar foco» para comenzar.**

Después del primer Foco, explicar únicamente lo siguiente que toca.

**Prueba:** dar un móvil a una persona nueva y pedirle «organiza dos horas y empieza». Observar sin ayudar. Que la pantalla quepa sin desplazarse no demuestra que se entienda.

---

# 2. ¿Es suficiente lo que ofrecemos Premium?

## Sí para lanzar; todavía no para afirmar que convertirá bien

La página vende rutinas adicionales, constructor, semana adaptada y estadísticas ampliadas. El código también reserva para Premium **la variación de rutinas entre días y mantener el calendario actualizado automáticamente**. Hasta v1 varias de estas funciones están abiertas temporalmente; esa apertura no equivale a tener una compra Premium. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/state-entitlement.jsx)

**Mi valoración comercial, como hipótesis:**

| Ventaja | Fuerza como motivo de compra | Qué falta para que se perciba |
|---|---|---|
| Adaptación de la semana | **Alta**, si cambia cosas útiles y explicables | Enseñar un antes/después concreto |
| Calendario actualizado | **Alta para quien trabaja con agenda** | Visibilidad y límites de funcionamiento claros |
| Rutinas propias | **Alta para usuarios recurrentes** | Demostración sencilla y editor impecable |
| Variedad entre días | **Media-alta** | Hacer visible la diferencia sin degradar gratis |
| Más rutinas | **Media** | Explicar para qué situaciones sirven |
| Mes, Año y «Qué te ayuda» | **Complementaria al principio** | Historial suficiente y conclusiones comprensibles |

**El problema no es que el gratis sea demasiado bueno.** Es que varias ventajas de pago tardan en aparecer, están poco explicadas o exigen que la persona imagine su utilidad.

### Lo que no haría

- Limitar el número de pausas gratuitas.
- Cobrar por instrucciones esenciales, alternativas accesibles o controles de seguridad.
- Hacer menos fiable el temporizador gratuito.
- Añadir anuncios para luego vender su eliminación.
- Convertir «de pago» en sinónimo de «más difícil».
- Bloquear datos personales para forzar una renovación.

**Pagar debería comprar comodidad, elección y continuidad; no aliviar molestias creadas deliberadamente.**

---

# 3. La oferta comercial deja fuera dos argumentos importantes

En la página `/premium`, los cuatro bloques de ventajas no explican expresamente **la variedad diaria** ni **el calendario que se mantiene al día**. Además, «rutinas más profundas» puede resultar sugerente, pero no aclara qué gana alguien que solo quiere moverse junto a la mesa. La página sí explica los precios y que las compras web y de las aplicaciones son separadas. [Source](https://pacegrass.app/premium)

Yo reorganizaría la presentación así:

### PACE completo
**Tus pausas, cada vez más tuyas.**

1. **Una semana que se ajusta contigo**  
   Revisa cómo fue la anterior y te propone cambios que tú decides.

2. **Más variedad sin tener que elegir cada pausa**  
   Propuestas que cambian entre días.

3. **Tus propias rutinas**  
   Combina ejercicios, ordénalos y ajusta los tiempos.

4. **Tu plan en el calendario**  
   Mantén los eventos actualizados, explicando las condiciones y los permisos necesarios.

5. **Tu recorrido a largo plazo**  
   Consulta el mes, el año y las respuestas sobre qué pausas te ayudaron.

La frase principal no debería ser «tenemos más cosas», sino:

> **Sigue trabajando; PACE te ayuda a decidir cuándo parar y qué hacer. Con PACE completo, las propuestas se ajustan más a ti.**

**Importante:** no vendería «funciona automáticamente siempre, aunque cierres todo» sin verificarlo por plataforma. La propia interfaz del calendario contempla estados de permisos, fallos, reintentos y actualización pendiente. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ritmo/RitmoCalendario.jsx)

---

# 4. Qué he encontrado investigando alternativas

| Referencia | Qué ofrece o destaca | Qué aprovecharía para PACE |
|---|---|---|
| **Stretchly** | Recordatorios de pausas, multiplataforma y código abierto | Un recordatorio por sí solo no es una diferenciación suficiente. [Source](https://hovancik.net/stretchly/) |
| **Time Out** | Núcleo gratuito; personalización, reglas, calendario y reconocimiento del tiempo fuera del ordenador. Publica una opción vitalicia de **59,99 USD** en su edición directa | Vende que las pausas encajen en el trabajo, no solo más contenido. No implica que PACE deba copiar su precio. [Source](https://www.dejal.com/timeout/) |
| **Moova** | Pausas de tres minutos, ejercicios guiados, adaptación a disponibilidad y planes con recordatorios | Explica situaciones de uso y elimina la necesidad de decidir. Su web anuncia más de 200 ejercicios: competir por cantidad no sería mi prioridad. [Source](https://getmoova.app/) |

### Qué dicen los datos de monetización —y qué no dicen

RevenueCat distingue conversión de instalación a pago, inicio de prueba y conversión de prueba a pago. Sus datos agregados muestran diferencias importantes entre modelos, pero proceden de aplicaciones que utilizan su plataforma y cumplen sus criterios de inclusión: **no son una predicción para PACE ni un experimento que demuestre que cerrar más funciones aumentará tus ingresos**. [Source](https://www.revenuecat.com/state-of-subscription-apps/)

Su guía de freemium resulta más útil para esta decisión: definir qué éxito consigue el usuario gratis, qué trabajo adicional resuelve el pago y qué promesas no se van a recortar. Mi recomendación para PACE encaja con una separación por necesidades: **pausas útiles gratis; personalización y automatización ampliadas de pago**. [Source](https://www.revenuecat.com/blog/growth/freemium-tier-design)

---

# 5. Cómo conseguir que quiera pagar, sin insistirle constantemente

## A. Enseñar el beneficio correspondiente a lo que acaba de pedir

La invitación actual cambia el título según lo que se ha tocado, pero después muestra la misma lista de cuatro ventajas. Es una buena base técnica, aunque comercialmente poco específica. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ui/PremiumInvitacion.jsx)

Probaría estas variantes:

| La persona intenta… | Mensaje principal |
|---|---|
| Crear una rutina | **«Haz una pausa a tu manera»**. Ejemplo de tres ejercicios, orden y duración |
| Activar actualización del calendario | **«No vuelvas a añadir el día a mano»**. Explicar qué actualiza y cuándo |
| Consultar Mes | **«Mira cómo has ido haciendo hueco a tus pausas»**. Vista previa identificada como ejemplo |
| Explorar más rutinas | **«Más opciones para cambiar de pausa»**. Enseñar ejemplos adecuados al contexto |

Debajo, el resto de ventajas. **No empezar siempre por una lista genérica.**

## B. Mantener la explicación inicial, pero no confiar toda la venta al onboarding

La bienvenida ya incluye un paso sobre PACE completo, con opción de continuar sin comprar. Lo conservaría como información clara sobre gratis y pago. Pero la demostración relevante debe llegar también cuando alguien entiende para qué quiere una función. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/onboarding/OnboardingCompleto.jsx)

Mi recorrido propuesto:

1. Primera pausa sencilla, sin exigir configurar todo.
2. Primer día organizado y comprensible.
3. Invitación contextual cuando la persona pide una ventaja Premium.
4. Durante la prueba, ayuda para **usar** las ventajas, no más publicidad.
5. Antes de cobrar, recordatorio claro y salida fácil.
6. Tras pagar, confirmar qué se ha abierto y permitir continuar donde estaba.

## C. No estrenar una función Premium con una pantalla vacía

El constructor debería ofrecer, además de «Crear»:

- **Crear desde una rutina existente.**
- Una plantilla editable de ejemplo.
- «Empieza con estos tres ejercicios».
- Vista previa antes de guardar.

**Son propuestas nuevas**, no funciones que haya verificado como presentes.

Empezar desde cero demuestra flexibilidad, pero también impone trabajo. Empezar desde algo reconocible demuestra valor antes.

## D. Mostrar que una respuesta sirve para algo

PACE ya pregunta «¿Te ayudó esta pausa?» y permite salir sin responder. El motor utiliza respuestas y comportamientos para proponer cambios semanales. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ui/SessionFeedback.jsx)

Añadiría ocasionalmente, solo cuando sea verdad:

> «La semana pasada dijiste que esta pausa te ayudó. La hemos priorizado.»

No hace falta anunciar cada decisión. Basta con que la persona pueda entender **por qué el pago cambia su experiencia**.

---

# 6. Los precios: el vitalicio compite muy fuerte con el mensual

Con tus precios:

- Seis mensualidades: **17,94 €**.
- Siete mensualidades: **20,93 €**.
- Vitalicio: **19,99 €**.

Por tanto, **el vitalicio cuesta aproximadamente 6,7 mensualidades**. Es atractivo para el comprador, pero limita el ingreso futuro de quienes más tiempo quieran usar PACE.

### Mi recomendación para v1

**Mantendría los precios anunciados para validar**, sin añadir ahora un tercer plan ni fingir urgencia.

Pero aclararía:

- El mensual sirve para quien prefiere pagar poco de entrada.
- El vitalicio es un pago único, **no una suscripción anual**.
- Qué incluye exactamente «de por vida».
- En qué plataforma vale.
- Qué ocurre con las rutinas y datos si termina una suscripción.
- Qué necesita conexión y qué puede seguir usándose sin ella.

No intentaría esconder el vitalicio para empujar al mensual. Si necesitas ingresos recurrentes, **la solución no es que el comprador entienda peor la comparación**.

Y distinguiría dos objetivos:

> **Muchas primeras compras no equivale a un negocio sostenible.**

Por ejemplo, 100 compras vitalicias son **1.999 € brutos una vez**, antes de impuestos, comisiones, devoluciones y costes. No son 1.999 € mensuales. Con este precio, priorizaría captación orgánica y recomendación antes de invertir fuerte en anuncios.

---

# 7. Cómo validar si Premium es suficiente de verdad

No usaría «¿pagarías?» como prueba principal. Observaría comportamiento y después compras.

## Primera ronda: 6–8 personas nuevas

Es una propuesta de investigación cualitativa, **no una muestra para calcular porcentajes comerciales**.

Sin explicarles la interfaz, pedir:

1. «Haz una pausa sin ir al suelo».
2. «Organiza dos horas de trabajo».
3. «Crea una pausa con tres ejercicios».
4. «Dime qué seguiría siendo gratis».
5. «Dime qué comprarías y dónde funcionaría».
6. «Encuentra cómo cancelar o restaurar».

Anotar dónde dudan, qué esperan y qué interpretan mal. No ayudar hasta observar el bloqueo.

## Después: medir el recorrido comercial

| Medida | Qué responde |
|---|---|
| Primera pausa completada | ¿Llegan al valor básico? |
| Uso en varios días distintos | ¿PACE encaja en su trabajo? |
| Invitación vista, por función de origen | ¿Qué ventaja despierta interés? |
| Prueba iniciada y ventajas utilizadas | ¿Están probando realmente Premium? |
| Primera compra y primera renovación | ¿El interés se convierte en valor sostenido? |
| Devoluciones y motivos de cancelación | ¿Se prometió algo que no se percibió? |

**No hace falta incorporar seguimiento invasivo.** Puedes comenzar con pruebas moderadas y datos de las tiendas. Si añades medición remota, debe ser mínima, transparente y coherente con la promesa de privacidad; el registro local por sí solo no te proporciona un embudo agregado de todos los usuarios.

---

## Qué haría ahora, por orden

1. **Corregir pérdida de borradores y acceso por teclado.**
2. **Pulir el comienzo de «A tu ritmo» en móvil.**
3. **Hacer posponible la carta semanal.**
4. **Reescribir la oferta destacando adaptación, variedad, constructor y calendario.**
5. **Crear tres invitaciones contextuales, sin aumentar la presión.**
6. **Verificar qué experimenta cada alta durante sus siete días de prueba.**
7. **Vender con la oferta actual y estudiar qué usan quienes compran.**

**Mi respuesta final: sí, hay suficiente para cobrar 2,99 €/mes o 19,99 € de por vida como primera validación. Lo que falta no es principalmente más contenido: es que el usuario entienda el valor, lo experimente antes de pagar y no encuentre pequeñas decepciones después.**
