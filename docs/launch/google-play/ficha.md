# PACE en Google Play · la ficha

Todo lo que pide Play Console en **Crecer > Presencia en la tienda > Ficha principal de la tienda**,
listo para copiar y pegar. Los límites de caracteres ya están comprobados.

Las direcciones web van con el dominio propio, `pacegrass.app`. La dirección vieja, `paceweb.pages.dev`,
sigue abierta para los beta testers, pero la ficha ya no la usa.

---

## Datos de la app

| Campo | Qué poner |
|---|---|
| Idioma predeterminado | **Inglés (Estados Unidos) – en-US** (Ez, 20 oct.: quien no tiene ficha en su idioma ve la principal); el español va como traducción: es-ES y es-419 |
| Nombre de la app (máx. 30) | `PACE: pausas activas, Pomodoro` (es-ES y es-419; Ez, 20 oct., sobre `nombre-en-play.html`) |
| Tipo | Aplicación |
| Gratis o de pago | Gratis (la compra de v1 irá dentro de la app; una app gratis no puede pasar a ser de pago, al revés sí) |
| Categoría | Salud y bienestar |
| Etiquetas (hasta 5) | Bienestar · Meditación · Fitness · Productividad · Salud |
| Correo de contacto | `hola.ezradesign@gmail.com` (es obligatorio y es público; es el mismo de la política de privacidad) |
| Sitio web | `https://pacegrass.app/` |
| Política de privacidad | `https://pacegrass.app/privacy` (cubre la web, la app y el calendario, y lleva el correo de contacto) |

> Si Play no deja elegir alguna etiqueta exacta, coge la más parecida de su lista.

---

## Descripción breve (máx. 80)

```
Pausas activas en el trabajo, a tu ritmo: respira, estira y muévete en tu mesa.
```

La elegida el 20 oct. (79 letras): «pausas activas» es lo que se busca y casi nadie ocupa, y «en el trabajo»
la separa de lo que se busca para niños en el aula. Las de abajo quedan como otras opciones.

```
Pomodoro con pausas guiadas: respira, estira y muévete sin dejar tu mesa.
```

Otra, por si prefieres algo más tranquilo:

```
Foco y pausas activas para quien trabaja sentado. A tu ritmo.
```

---

## Descripción completa (máx. 4000)

```
PACE es un recordatorio de pausas activas con temporizador Pomodoro, para quien trabaja sentado. Te ayuda a concentrarte y a parar a tiempo para una pausa corta y guiada: estirar en el escritorio, respirar, beber agua. Pausas que caben entre dos tareas.

A TU RITMO
Dile a PACE cuánto trabajas hoy y reparte la jornada en bloques de foco y pausas con nombre, según tu horario y tu hora de comer. Al acabar cada bloque te sirve la pausa que toca, y a lo largo del día las pausas mueven el cuerpo entero: piernas, caderas, espalda, hombros, cuello y manos. Si tienes reuniones, PACE las lee de tu calendario y las esquiva, y también puede llevar el día entero a tu calendario.

FOCO
Un Pomodoro tranquilo de 15, 25, 35 o 45 minutos, o el que elijas. Un aviso al terminar, aunque la app esté en segundo plano.

PAUSAS ACTIVAS EN EL TRABAJO
Más de treinta rutinas cortas de movilidad y fuerza discreta para cuello, hombros, caderas, espalda y piernas. Muchas se hacen sentado y sin material: ejercicios en el escritorio y estiramientos para la oficina, en casa o en el teletrabajo. Cada paso con su dibujo y su explicación. Para quien pasa muchas horas en la silla y quiere cuidar su postura.

RESPIRA
Veinte técnicas de respiración guiadas: coherencia cardíaca, respiración cuadrada, 4·7·8, suspiro fisiológico, pranayamas y respiración en rondas. Las técnicas intensas llevan siempre su aviso de seguridad.

HIDRÁTATE
Un toque por vaso. Sin metas que agobien.

LOGROS
Más de ochenta sellos de libreta de campo. Para explorar, no para competir.

CALMA POR DISEÑO
Colores tierra, tipografía cuidada y modo oscuro. Sin anuncios, sin rachas que castigan, sin notificaciones insistentes.

TUS DATOS SON TUYOS
Sin cuenta y sin registro. Lo que haces en PACE se queda en tu móvil, sin rastreo, y puedes exportar una copia cuando quieras.

PACE no es un producto sanitario ni sustituye el consejo de un profesional. Si tienes alguna condición médica, consulta antes de hacer los ejercicios de respiración intensa.
```

Unos 2.000 caracteres de 4.000. Rehecha el 20 oct. con las palabras que se buscan (`nombre-en-play.html`): pausas activas en el trabajo, recordatorio, estiramientos para la oficina, ejercicios en el escritorio, temporizador Pomodoro, teletrabajo, postura, calendario. Cada una una vez: Google castiga repetir. Y el cuerpo entero cada día (v0.174.0).

Del arte de PACE no se dice «dibujado a mano»: los dibujos salen de GPT Image (Ez, 15 oct. 2026,
`DECISIONES_PRODUCTO.md`). De la app sí se puede decir que la hace una persona.

**Para v1 (cuando haya compra):** añadir antes de «Calma por diseño» este párrafo, con los importes
que fije Play en cada país. Cuenta los dos planes que eligió Ez el 15 oct. 2026 (2,99 € al mes con
7 días gratis y 19,99 € de por vida):

```
PACE COMPLETO
Casi todo PACE es gratis, y lo seguirá siendo. PACE completo añade las rutinas más hondas, tus propias rutinas, una semana a tu medida con la carta del lunes y tu mes y tu año. Pruébalo 7 días gratis y sigue por 2,99 € al mes, o págalo una vez, 19,99 €, y es tuyo para siempre.
```

---

## Gráficos

Todos en esta carpeta y con las medidas que pide Play:

| Campo de Play | Archivo |
|---|---|
| Icono de la app (512 × 512) | [icono-512.png](icono-512.png) |
| Gráfico de funciones (1024 × 500) | [grafico-destacado-1024x500.png](grafico-destacado-1024x500.png), el logo de Ez («Touch grass, even from your desk»), igual en todos los idiomas |
| Capturas de pantalla del teléfono (1080 × 1920, de 2 a 8) | ficha en inglés: las seis de [capturas/en/](capturas/en/); fichas en español: [capturas/es/](capturas/es/), del 1 al 6 |

En [capturas-sin-marco/](capturas-sin-marco/) (`es/` y `en/`) están las mismas pantallas sin el título encima.

Hechas el 20 oct. con v0.174.0 por `node scripts/play/capturas.js` (después del build): la app real en un
móvil de 360 × 640 a 3×, con su título en la serif recta, sin cursiva (Ez). El gráfico destacado es el logo
de Ez sobre papel (`grafico/logo-ez.jpg`, montado por `grafico/final.html` y `grafico/hacer.js`). Las tablets
y el vídeo son opcionales: se pueden dejar vacíos.

**Con la ficha publicada** (Ez, 15 oct. 2026): el orden de las capturas se prueba con un experimento
de ficha (**Crecer > Experimentos de la ficha de Play Store**), la primera de hoy, la jornada con el
horizonte, contra otra primera (por ejemplo, la pausa). Y cada reseña se contesta desde Play Console.

---

## «Novedades» de la primera versión de prueba (máx. 500)

```
Primera versión de prueba de PACE en Android. Gracias por probarla: cuéntame lo que falle y lo que echarías de menos.
```

---

## La ficha en inglés (en-US)

**Desde el 20 oct. el inglés es el idioma PRINCIPAL** (se elige al crear la app) y el español va como
traducción (es-ES y es-419, con los textos de arriba); lo de abajo era el plan anterior.
Ez decidió publicar en todo el mundo (8 de octubre de 2026), y la app ya va en inglés. En Play
Console: **Ficha principal de la tienda → Gestionar traducciones → Añadir tus propias traducciones →
Inglés (Estados Unidos) – en-US**, y se pegan estos textos. Sin traducción, fuera de España la gente
vería la ficha en español. Las capturas pueden quedarse las mismas: Play usa las del idioma
predeterminado si no hay otras (unas en inglés serían mejor, cuando se hagan).

| Campo | Qué poner |
|---|---|
| Nombre de la app (máx. 30) | `PACE: Pomodoro, Break Reminder` (Ez, 20 oct.: «break reminder» se busca mucho y con poca competencia; «desk break» y «active breaks» casi no) |

### Descripción breve (máx. 80)

```
Desk stretches and breathing breaks at your own pace. Focus, then move a little.
```

### Descripción completa (máx. 4000)

```
PACE is a break and stretch reminder with a pomodoro timer, for people who work sitting down. It helps you focus, then stop in time for a short guided break: stretch at your desk, breathe, drink some water. Breaks small enough to fit between two tasks.

AT YOUR PACE
Tell PACE how long you're working today and it lays out your day in focus blocks and named breaks, around your hours and your lunch. At the end of each block it serves the break that fits, and across the day the breaks move your whole body: legs, hips, back, shoulders, neck and hands. If you have meetings, PACE reads them from your calendar and works around them, and it can put your whole day in your calendar too.

FOCUS TIMER
A calm pomodoro of 15, 25, 35 or 45 minutes, or whatever length you choose. A reminder when it ends, even with the app in the background.

DESK STRETCHES AND MOVEMENT
More than thirty short routines of mobility and quiet strength for neck, shoulders, hips, back and legs. Many can be done seated and with no equipment, right at your desk or at home. Every step has its drawing and a clear explanation. For anyone who sits too long, works from home or wants to look after their posture.

BREATHING EXERCISES
Twenty guided techniques: coherent breathing, box breathing, 4·7·8, the physiological sigh, pranayamas and breathing in rounds. Intense techniques always come with a safety notice.

HYDRATE
One tap per glass. No targets that weigh on you.

ACHIEVEMENTS
More than eighty field-notebook stamps. For exploring, not for competing.

CALM BY DESIGN
Earthy colours, careful typography and dark mode. No ads, no streaks that punish you, no nagging notifications.

YOUR DATA STAYS YOURS
No account and no sign-up. What you do in PACE stays on your phone, with no tracking, and you can export a copy whenever you want.

PACE is not a medical device and does not replace professional advice. If you have a medical condition, check with a professional before doing the intense breathing exercises.
```

**For v1**, the same paragraph in English, before «Calm by design»:

```
PACE COMPLETE
Almost all of PACE is free, and it will stay that way. PACE Complete adds the deeper routines, your own routines, a week shaped to you with the Monday letter, and your month and year. Try it free for 7 days and continue for €2.99 a month, or pay once, €19.99, and it's yours for good.
```

### Países

**Probar y publicar → Producción → Países / regiones → Añadir países / regiones → todos.** En la
prueba cerrada también conviene abrirla a todos: así un tester de fuera no se queda sin poder
instalarla.
