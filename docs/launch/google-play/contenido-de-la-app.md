# PACE en Google Play · «Contenido de la app»

Antes de la primera prueba, Play Console pide rellenar unos cuestionarios en
**Supervisar y mejorar > Política y programas > Contenido de la app**. Aquí va qué contestar en cada
uno y por qué. Está pensado para la app tal como es hoy: sin compras, sin anuncios y sin cuenta.

---

## 1. Política de privacidad

`https://pacegrass.app/privacy`

Ya cubre la app y el calendario (PACE lo lee y escribe en el móvil) y lleva el correo de contacto,
`hola.ezradesign@gmail.com`.

## 2. Anuncios

**No, mi aplicación no contiene anuncios.**

## 3. Acceso a la aplicación

**Todas las funciones están disponibles sin restricciones de acceso especiales.** PACE no tiene inicio
de sesión.

## 4. Clasificación de contenido

1. Correo: el tuyo.
2. Categoría: **Todas las demás aplicaciones** (no es un juego ni una red social).
3. Contesta **No** a todo: violencia, miedo, sexo, lenguaje, drogas, apuestas, interacción entre
   usuarios, compartir ubicación, compras digitales y navegador web.
4. Sale una clasificación para todos los públicos (PEGI 3 en Europa).

> En v1, cuando haya compra dentro de la app, se vuelve a este cuestionario y «compras digitales»
> pasa a **Sí**.

## 5. Público objetivo y contenido

1. Edades: marca **solo «18 años o más»**.
2. ¿Atrae a niños sin querer? **No**.

Por qué solo adultos: PACE está hecho para quien trabaja sentado, y la respiración con retención lleva
aviso de seguridad. Si marcas edades de menores, Google aplica las normas de apps familiares, que son
mucho más estrictas.

## 6. Seguridad de los datos

1. ¿Tu app recoge o comparte alguno de los tipos de datos de usuario obligatorios? **No**.
2. Con eso, la ficha dirá **«No se recogen datos»** y **«No se comparten datos con terceros»**.

Por qué es verdad:

- Todo se guarda en el móvil. PACE no tiene servidores ni analítica.
- El calendario: PACE lee las horas de tus reuniones de hoy y escribe tus bloques de foco, pero todo
  pasa dentro del móvil y no sale de él. Google no cuenta como «recogida» lo que se procesa solo en el
  dispositivo y nunca se envía fuera.
- La copia de «Tus datos» sale por el menú de compartir solo cuando tú la pides, y va adonde tú
  elijas. Eso tampoco cuenta como compartir.

> Si algún día la app de Android se conecta a Google o Microsoft Calendar por internet (en la web ya
> lo hace), este cuestionario hay que rehacerlo.

## 7. Apps de salud

Es obligatorio para todas las apps, también en prueba cerrada.

1. Marca, dentro de «Salud y bienestar»:
   - **Actividad y forma física** (Mueve y Estira)
   - **Gestión del estrés, relajación y agudeza mental** (Respira y el foco)
2. No marques nada de «Medicina» ni «Dispositivos médicos».
3. Si pregunta por Health Connect: PACE **no** lo usa.

## 8. El resto

| Pregunta | Respuesta |
|---|---|
| App de noticias | No |
| App de gobierno | No |
| Funciones financieras | Mi app no ofrece funciones financieras |
| Rastreo de contactos / COVID-19 | No |
| ID de publicidad | No usa el ID de publicidad |

---

## Permisos que verá Google

| Permiso | Para qué | ¿Pide formulario aparte? |
|---|---|---|
| Calendario (leer y escribir) | «Al calendario» en «A tu ritmo»: llevar el día al calendario y esquivar reuniones. Se pide al pulsar el botón, nunca al abrir la app | No |
| Notificaciones | El aviso de fin de bloque | No |
| Internet | Lo trae Capacitor por defecto; la app de Android no se conecta a nada | No |
| Alarmas exactas (`SCHEDULE_EXACT_ALARM`) | Que el aviso de fin de bloque llegue a su hora. Ya lo declara el complemento de notificaciones; en Android 14 o más lo concede la persona en ajustes | No |
| Arranque y mantener activo | Lo usa el complemento de notificaciones para reprogramar avisos tras reiniciar el móvil | No |

Solo el otro permiso de alarmas, `USE_EXACT_ALARM`, pide justificarlo en Play Console. Si el hilo de
Android acabara usándolo, la respuesta es: *«Es un temporizador Pomodoro: el aviso de fin de bloque
tiene que llegar a su hora aunque la app esté en segundo plano»*.
