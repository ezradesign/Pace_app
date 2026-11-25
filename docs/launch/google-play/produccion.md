# PACE en Google Play · de la prueba cerrada a producción

Ez, L2A del 25 nov. 2026 («PACE, listo para las tiendas»). Los 14 días de los testers marcan la fecha de v1,
y al acabarlos Google no da producción sin más: hay que pedirla con un cuestionario sobre la prueba. Si las
respuestas son vagas, Google lo rechaza y pide otros 14 días. Este archivo es lo que hace falta para que eso no
pase: cuántos testers, qué preguntarles, dónde apuntar lo que digan y el borrador de las respuestas.

Lo de apuntarlos y subir la versión sigue en [testers.md](testers.md) y el mensaje de entrada, en
[mensaje-testers-whatsapp.md](mensaje-testers-whatsapp.md).

## 1 · Cuántos: 15 o 16

Google pide **12 apuntados sin interrupción durante 14 días**. El día que alguien se sale, el panel lo
cuenta, y si vuelve sus 14 días empiezan de cero. Con 15 o 16 se puede perder a tres o cuatro y llegar.
En **Panel › Pruebas cerradas** se ve cuántos van; mirarlo los lunes.

## 2 · Lo que se les pregunta (con el mensaje de entrada, o el día 2)

Tres preguntas, para contestar en una línea por WhatsApp o por correo:

```
🐄 Tres preguntas cortas sobre PACE, cuando la hayas usado un par de días (una línea vale):

1️⃣ ¿Hubo algo que no entendiste o que no sabías dónde tocar?
2️⃣ ¿Algo falló, se cortó o sonó raro? (si te acuerdas, en qué pantalla)
3️⃣ ¿Qué echaste de menos, o qué te gustaría que hiciera?

Si algo se tuerce del todo, en la pantalla de error hay un «Cuéntanoslo» que me manda la versión y el error. ¡Gracias! 🙏
```

## 3 · El recordatorio del día 7

```
🌿 ¡Llevamos una semana! Gracias por seguir en la prueba de PACE.

Quedan 7 días: solo te pido que no te salgas (si sales y vuelves, Google empieza de cero). Si ya contestaste las tres preguntas, mil gracias; si no, cuando puedas 😊

Esta semana me ayuda mucho que pruebes *A tu ritmo* un día entero de trabajo y me digas si las pausas llegaron a buena hora.
```

## 4 · Dónde se apunta lo que dicen

Una fila por comentario, aquí mismo o en una hoja. Con esto se contesta el cuestionario.

| Fecha | Quién (inicial) | Qué dijo | Qué cambió en PACE (versión) |
|---|---|---|---|
| | | | |

Lo que cambie por un comentario va en las notas de la versión siguiente (`SUBIDAS.md`): Google mira que la
prueba sirvió para algo.

## 5 · El cuestionario para pedir producción

Sale en **Panel › Solicitar acceso a producción** cuando se cumplen los 14 días. Son tres partes. Abajo, el
borrador en inglés (Google lo lee así; también acepta español) con huecos `[…]` para lo que aún no se sabe.
Que sea concreto: números, pantallas y versiones.

### Sobre la prueba cerrada

**How easy was it to recruit testers for your app?** → *Neither easy nor difficult* (o lo que haya sido).

**Describe the engagement you received from testers during your closed test.**

```
[N] testers used PACE during the 14 days: friends, colleagues and people who sit at a desk all day, recruited through a public sign-up page (pacegrass.app/beta) and a Google Group. I asked everyone three questions (what was confusing, what failed, what was missing) and sent a reminder on day 7. They tried the focus timer, guided breathing, desk stretches and the "At your pace" day planner, and I received [N] comments by WhatsApp and email.
```

**Provide a summary of the feedback that you received from testers. Include how you collected the feedback.**

```
Feedback came by WhatsApp and email, plus an in-app "Tell us" link on the error screen that opens an email with the app version. Main points: [1. …], [2. …], [3. …]. Positive: [lo que gustó].
```

### Sobre la app

**Who is the intended audience of your app?** → `Adults who work sitting at a desk, at the office or from home, and want short active breaks during the day.`

**Describe how your app provides value to users.**

```
PACE pairs a calm Pomodoro timer with short guided breaks (breathing, desk stretches, light movement and water), planned around the user's working hours and meetings. It works offline, needs no account, shows no ads and keeps all data on the device.
```

**How many installs do you expect in your first year?** → `1K - 10K` (o la que Ez crea).

### Sobre la preparación para producción

**What changes did you make to your app based on what you learned during closed testing?**

```
[Versión X.Y.Z]: [cambio por el comentario 1]. [Versión X.Y.Z]: [cambio por el comentario 2]. We also [arreglos de fallos vistos].
```

**How did you decide that your app is ready for production?**

```
All testers' reported issues are fixed in version [X.Y.Z], the last [N] days had no new crash reports in Android vitals or through the in-app "Tell us" link, and the app passes our automated test suite (over 1,700 end-to-end tests) on every change. Testers confirmed that notifications arrive on time with the phone locked.
```

## 6 · Si lo rechazan

Google dice el motivo en el correo. Lo normal es «no hay suficiente participación»: se sigue con la misma
prueba, se piden comentarios otra vez y se vuelve a pedir a los 14 días. No hace falta empezar con otros
testers.
