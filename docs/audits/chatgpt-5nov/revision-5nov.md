# Revisión de ChatGPT del 5 nov. 2026, sobre `main` en 9fe51aee (v0.189.1)

Ez la trajo «por si aporta algo». Lo comprobado va primero; debajo, la revisión entera. Se valora con Ez antes de montar nada.

## Lo comprobado por la coordinadora

| Punto | Veredicto | Qué se hace |
|---|---|---|
| Un punto del cobro mensual | **Cierto.** El detalle se ha quitado de esta copia pública (Ez, D-4 C del 10 nov.) | No bloquea vender solo el de por vida. Va antes de encender la mensual (la cola) |
| `paceTiendaWebLista()` exige los dos enlaces (`app/state-compra.js`) | **Cierto** (`every`). Además `planes()` filtra por precio, no por enlace | Se arregla si Ez elige un solo plan |
| Play Billing vacío, iOS sin tienda, `PACE_TIENDA_WEB` sin enlaces | Cierto y conocido | Esperan las altas y encender la venta |
| Testers en 0.174.0 y 0.175.0 frente a 0.189.1 | Cierto (`STATE.md`) | Espera a «Palmas en la mesa» |
| El calendario sin altas, sin renovación desatendida y con el calendario principal | Cierto en lo que dice `STATE.md`: espera las altas de Ez | Sin cambios |
| El reparto gratis y de pago del calendario, «decisión por cerrar» | **Sin comprobar** contra lo decidido el 29 oct. | A la cola |
| Las mejoras de su apartado 1 | No se ha repasado una a una; casan con `CHANGELOG.md` | Nada |

Su recomendación final (candidata a los testers, cerrar lo que bloquea la compra y observar el uso antes de otra capa de funciones)
casa con el orden de `STATE.md`.

## La revisión, entera

**Sí, está mejorando de forma concreta y en la dirección adecuada.** He encontrado cambios que responden a problemas que habíamos señalado: menos dudas antes de empezar, menos trabajo perdido y explicaciones más honestas sobre el calendario.

Pero también hay una distinción importante: **la experiencia de uso está más madura; la venta y el calendario Premium todavía no están completamente preparados.**

He revisado `main` en **`9fe51ae`**, del **5 de noviembre**, con versión declarada **0.189.1**. Solo lectura: no he ejecutado la app, realizado compras ni probado dispositivos. Las conclusiones se limitan a los archivos comprobados. [Fuente](https://api.github.com/repos/ezradesign/Pace_app/commits/main)

# 1. Mejoras que sí he comprobado en el código

## ✅ Puedes aprender el ejercicio antes de que empiece el reloj

En `app/ui/RoutinePreview.jsx`, cada ejercicio con instrucciones se puede abrir desde la vista previa. Enseña:

- Dibujo grande.
- Cómo colocarte.
- Qué hacer.
- Qué cuidado tener.

Puedes volver a la lista y el código devuelve el foco al ejercicio consultado. **Mirar no inicia ni acredita una sesión.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/ui/RoutinePreview.jsx)

**Como usuario, esto me aporta mucha confianza:** ya no tengo que entrar en una sesión para averiguar si sé hacerla.

Es una de las mejores mejoras de esta ronda, especialmente para principiantes.

## ✅ Crear una rutina ya no implica arriesgar lo que llevas hecho

En `app/custom/CustomBuilder.jsx` hay guardado de borrador:

- Tras los cambios, con una espera de 400 ms.
- Al ocultarse la página.
- Al abandonar o desmontar el constructor.
- También cuando no puede guardar por determinados conflictos.

Además, explica si has llegado al límite de rutinas o si la que editabas fue borrada desde otra pestaña. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/custom/CustomBuilder.jsx)

**Valor real:** puedo atender una llamada y volver sin reconstruir mi rutina.

Esto mejora precisamente una función por la que esperas cobrar. No es un retoque cosmético.

## ✅ La carta del lunes se puede dejar para después

`app/ritmo/RitmoCarta.jsx` permite cerrar la carta, dejarla pendiente y abrirla posteriormente desde el sobre. También permite consultar la carta contestada sin volver a presentar decisiones. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/ritmo/RitmoCarta.jsx)

**Como usuario:** puedo entrar a hacer una pausa sin tener que resolver antes una revisión semanal.

Es una mejora importante para que PACE acompañe, en lugar de convertirse en otra obligación.

## ✅ «A tu ritmo» explica mejor qué estás eligiendo

He comprobado estos textos nuevos:

- **«El tiempo incluye las pausas».**
- **«Sin material, a veces pared o mesa».**
- **«Ahora no, quiero probar primero».**
- **«Puedes prepararla después en Ajustes».**
- En móvil, la indicación de empezar en el aro.

Están también sus equivalentes en inglés. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/i18n/strings/ritmo.js)

**Mi valoración:** estáis resolviendo dudas de verdad, no simplemente añadiendo explicaciones largas.

El siguiente paso es comprobar que esas frases se descubren y se entienden en pantalla; leerlas en el archivo no verifica eso.

## ✅ Las sesiones de ejercicio distinguen mejor hacer de esperar

En `app/move/MoveSessionV1.jsx`:

- Esperar a «Siguiente» con Auto apagado ya se excluye de los relojes.
- Los avances automáticos comprueban que la sesión no esté pausada.
- La flecha tiene etiquetas contextuales.
- Existe «Con una basta» para omitir determinadas series restantes.
- Hay tratamiento específico de pausa y cuenta de regreso. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/move/MoveSessionV1.jsx)

**Esto importa mucho:** el producto está siendo más respetuoso con el ritmo de quien lo usa y más preciso al contar su actividad.

No doy por verificada la experiencia visual ni todos sus casos límite, pero los mecanismos están implementados.

## ✅ La media jornada ya contempla el problema real que encontró un tester

`ritmoTramoCon()`, en `app/state-ritmo.support.jsx`, corrige el cruce entre inicio y final: si mover una hora dejaría el tramo invertido, mueve la otra conservando la duración dentro de sus límites. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/state-ritmo.support.jsx)

Por ejemplo, trasladar el inicio de una media jornada de **9:00–13:00 a las 15:00** permite obtener **15:00–19:00**, en lugar de dejar **15:00–13:00**.

**Buena señal de proceso:** hay arreglos originados en el uso real, no solo en auditorías.

# 2. El calendario: mejora la transparencia, pero no ha dado todavía el gran salto

## Lo que sí ha mejorado

Ahora se registra por separado:

- Cuándo se leyeron las reuniones.
- Cuándo falló una lectura.

La interfaz utiliza esa información para decir que sigue trabajando con las reuniones anteriores, en vez de interpretar un fallo como ausencia de reuniones. **He comprobado tanto la recogida del estado como su uso en la hoja del calendario.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/ritmo/ritmo.calendario.destinos.js) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/ritmo/RitmoCalendario.jsx)

También se explica que:

> «Se pone al día mientras PACE está abierto».

Y que mover una pausa en el calendario no cambia el plan de PACE: hay que modificarla desde la app. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/i18n/strings/calendario.js)

**Esto mejora la confianza. No equivale todavía a mejorar la automatización.**

## Lo que sigue pendiente

En `ritmo.calendario.web.js` continúan:

- Los identificadores de Google y Microsoft vacíos.
- Los permisos guardados en `sessionStorage`.
- Google sin renovación desatendida implementada.
- Las consultas centradas en el calendario principal o predeterminado. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/ritmo/ritmo.calendario.web.js)

Además, el reparto actual sigue diciendo: **llevar el día y esquivar reuniones gratis; mantenerlo actualizado, Premium**. No está aplicado el planteamiento posterior de convertir toda la integración en un beneficio de pago. Eso no es un bug, pero sí una decisión comercial que conviene cerrar. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/i18n/strings/calendario.js)

**Mi lectura:** PACE es ahora más honesta sobre lo que hace el calendario. Todavía no vendería la experiencia como «conéctalo y olvídate».**

# 3. Antes de cobrar, hay dos puntos de código que devolvería a Claude

## 🔴 Un punto del cobro mensual

El detalle de este punto se ha quitado de la copia pública del repositorio (Ez, D-4 C del 10 nov.): va antes de encender la
mensual y su arreglo espera revisión en su rama.

## 🟠 Si quieres vender solo “de por vida”, la tienda interna aún exige los dos planes

En `app/state-compra.js`, `paceTiendaWebLista()` exige enlaces para **vida y mes**. Si configuras únicamente el de por vida, devuelve `false`. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/state-compra.js)

Esto afecta a abrir la compra desde la app; no demuestra que una página externa con enlace directo no pueda vender.

**Qué pediría:** que la tienda pueda ofrecer los planes realmente habilitados, sin exigir que ambos estén activos.

# 4. Publicar, probar y vender siguen siendo estados diferentes

En el código revisado:

- Google Play Billing sigue siendo un adaptador vacío.
- iOS se dirige al canal sin tienda.
- Los enlaces de compra web siguen sin configurar en `PACE_TIENDA_WEB`. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/state-compra.js)

La documentación declara avances de Stripe en real y deja pendientes elementos legales y operativos. **Eso informa del estado del proyecto, pero no me permite verificar la configuración privada de Cloudflare o Stripe.** [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/STATE.md)

También hay una distancia importante entre repositorio y testers: `STATE.md` indica **0.174.0 en la prueba cerrada de Android y 0.175.0 en TestFlight**, frente a **0.189.1 en el proyecto**. No he accedido a las consolas para confirmarlo. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/STATE.md)

**Si sigue siendo así, el siguiente avance más valioso es hacer llegar estas mejoras a los testers.** Sus opiniones sobre versiones anteriores no validan todavía la experiencia actual.

He podido comprobar un flujo **iOS terminado con éxito para este commit**; no he verificado toda la batería ni lo interpreto como prueba funcional completa. [Fuente](https://api.github.com/repos/ezradesign/Pace_app/actions/runs?branch=main&per_page=5)

# Mi valoración actual

| Área | Valoración tras esta revisión |
|---|---|
| Aprender y seguir una pausa | **Mejora clara.** |
| Conservar el trabajo del usuario | **Mejora clara en el constructor.** |
| No convertir PACE en una obligación | **Mejora clara con la carta aplazable.** |
| Claridad del calendario | **Mejora comprobada.** |
| Automatización avanzada del calendario | **Todavía pendiente.** |
| Venta en las tres plataformas | **Todavía incompleta.** |
| Retención y disposición a pagar | **No demostrables leyendo el código.** |

**Mi conclusión: sí, va mejorando, y no solo por tener más cosas. Está eliminando fricciones que podían hacer que alguien abandonara.**

Ahora priorizaría **publicar una candidata reciente para los testers, cerrar los bloqueantes de compra y observar el uso**. No añadiría otra gran capa de funciones antes de que las personas prueben lo que ya habéis mejorado.
