# La auditoría externa del 10 nov., comprobada punto a punto

Contra `main` (v0.196.0) y las ramas `origin/claude/chatgpt-jornada-9nov`, `guardar-atomico-166e3f`, `landing-c-9nov` y
`caza-rendimiento-9nov`, el 10 nov. de 2026. El texto entero, en `externa-10nov.md`. Los códigos (X, T, K, D, I) siguen sus
apartados: X la venta, T su tabla de fallos, K el calendario, D el día y los ejercicios, I la interfaz.

**Cuenta:** 40 puntos. **18 ciertos y nuevos**, 4 ya hechos en una rama que espera el «júntalo», 8 ya en la lista de Ez,
10 ya decididos por Ez y **ninguno falso** (dos, ciertos solo en parte: T2 y T8).

## La venta (§1)

- **X1** «Avísame» cerrado en /premium · **ya en la lista de Ez**: el KV `pace-avisame` y el nombre que firma (`STATE.md:100`, `docs/launch/avisame.md`).
- **X2a** La raíz es la app y no una landing · **ya hecho, espera el «júntalo»**: la landing larga en la raíz, en `claude/landing-c-9nov` (1c32a604; `STATE.md:66`).
- **X2b** `robots.txt` y `sitemap.xml` devuelven la app con un 200 · **cierto y nuevo**: comprobado en vivo (`text/html` en los dos); `scripts/web-dist.js:27-28` no publica ninguno y Cloudflare sirve la app en cualquier ruta que no existe. Tampoco la rama de la landing los trae.
- **X2c** El título lleva la versión («— v0.196.0») · **cierto y nuevo**: `index.html:6`, y `app/state-core.palette.jsx:127` la conserva al cambiar de idioma.
- **X3** La compra de la web no vale en el móvil · **ya decidido**: `DECISIONES_PRODUCTO.md`, «Cómo se cobra» (15 oct.), punto 6; /premium lo dice antes de pagar («Dónde funciona tu compra», `premium/index.html:108`).
- **X4** El precio y el mensual · **ya decidido**: «Cómo se cobra» (15 oct.), punto 3, y «Vender antes de v1» (5 nov.). Va a las decisiones de la cola (D-1).
- **X5** La prueba de 7 días acaba antes de ver el valor · **cierto y ya en la lista de Ez**: la carta pide tres días de «A tu ritmo» en la semana (`MOTOR_DIAS_CARTA = 3`, `app/ritmo/ritmo.motor.js:31`); U4 (la carta dentro de la prueba) está puesta después de v1 (`docs/audits/chatgpt-28oct/LEEME.md:14`).
- **X6** No se mide nada · **ya decidido**: sin rastreo en la app (15 oct., «Cómo se vende», punto 9); la analítica sin cookies solo en /premium está en la lista (`STATE.md:100-101`).
- **X7** El repositorio público enseña fallos y dónde están las llaves · **en parte decidido, en parte nuevo**: el repo sigue público por decisión de Ez (`DECISIONES_PRODUCTO.md:386`, 18 oct.); el `guardar()` atómico, **ya hecho en `claude/guardar-atomico-166e3f`** (286a60d7); la copia fuera de casa, en la lista (`STATE.md:99`). **Nuevo**: `STATE.md:97-99` dice en qué disco y carpeta viven las llaves y que no tienen copia fuera. Va a las decisiones (D-4).
- **X8** Lo legal en borrador, `/desistir` cerrada y el contacto en Gmail · **ya en la lista de Ez** (`STATE.md:72-75`); el Gmail es cierto (`privacy.html` y `premium/index.html`), y el contacto es uno de los datos que Ez da al registrar la primera venta.
- **X9** Los 12 testers no han empezado · **ya en la lista de Ez** (`STATE.md:84`).

## Su tabla de fallos (§2)

- **T1** Al pausar, reanudar y recargar, la hora de empezar se mueve · **ya hecho, espera el «júntalo»**: punto 2 de ChatGPT, en `claude/chatgpt-jornada-9nov` (dfc6ee9b, `tests/foco-inicio-recarga.spec.js`).
- **T2** Los otros puntos de la revisión del 9 nov. · **en parte hecho, en parte esperando tu letra**: la pausa contada como foco (punto 1, 9a398542) y la cadencia que rehace lo hecho (punto 3, 1c7e6fbd), hechos en la misma rama; «Cambiar» con un Foco en marcha y «Hoy» que esconde lo hecho por libre (puntos 4, 6 y 7) están pintados y esperan tus letras (página KZFDp3zNhk4JAFHr13ysxq, recomendadas 4B 6A 7A).
- **T3** El doble cómputo entre pestañas · **ya hecho, espera el «júntalo»**: punto 5, un bloque se cuenta una vez por su id (d6683620, `tests/pestanas-dormida.spec.js`).
- **T4** El aviso de fin con etiqueta fija, `silent: true` y sin `renotify` · **cierto y nuevo**: `app/focus/FocusTimer.support.jsx:94-95`. Que sea silencioso se decidió en s108 (`DECISIONES_TECNICAS_VIGENTES.md:385`); que el aviso del bloque siguiente sustituya sin asomar al anterior que no cerraste, no. Arreglo: una etiqueta por bloque, o `renotify: true`.
- **T5** El permiso de avisos se pide en el primer «Empezar» · **ya decidido**: s108 (`DECISIONES_TECNICAS_VIGENTES.md:366`; `FocusTimer.jsx:269`). Cierto que si se deniega, el aviso se apaga (`FocusTimer.support.jsx:79`). Pedirlo al acabar el primer bloque es una idea que cambia esa decisión.
- **T6** `window.PREMIUM_ABIERTO_HASTA_V1` se lee en cada llamada · **cierto y nuevo, riesgo bajo**: `app/state-entitlement.jsx:75,82,190`. Desde la consola se abriría todo; pero en una app sin servidor quien abre la consola puede cambiar cualquier función, así que cerrarlo el día de v1 es higiene, no seguridad.
- **T7** Un código vale para quien lo tenga y se comprueba sin red · **ya decidido**: «Cómo se cobra» (15 oct.), punto 2: cada código de venta lleva su pedido para anularlo solo a él. S3 (el código que se pasa a otra persona) sigue en tu lista (`STATE.md:102`).
- **T8** La racha cuenta días naturales · **cierto en parte y nuevo**: la barra lateral no dice «racha» sino «ritmo», con palabras (`app/shell/Sidebar.parts.jsx:212`); pero los logros de constancia sí cuentan días naturales seguidos (`app/state-achievements.jsx:273-293`: «3 días seguidos», 7, 14 y 30). Quien solo usa PACE de lunes a viernes no llega nunca a «Cuarto creciente».
- **T9** El gris pequeño a 4,2 y 3,9 de contraste · **ya decidido**: el gris de los rótulos lo eligió Ez el 16 oct. y se queda (`docs/audits/accesibilidad-7nov.md:121-124`); lo demás del contraste se cerró con 1B 2B 3B el 7 nov. Los enlaces de la bienvenida de 25 px de alto: **por probar** (no medido).
- **T10** En Safari, lo guardado puede borrarse a los 7 días sin visitas · **cierto y nuevo**: `storage.persist()` solo se pide en el móvil (`app/events/events-store.js:412-418`, a propósito: Firefox lo pregunta con un aviso). En Safari, que no lo pregunta, no se pide.
- **T11** El service worker precarga 276 archivos con las láminas de Caminos, y un 404 tumba la instalación · **cierto y nuevo, menor**: `sw.js:11` y `:162-168` (siete láminas de Caminos, ocultos), `cache.addAll` en `sw.js:323`. `scripts/verify.integridad.js:199` vigila la lista, así que el 404 lo caza `verify` antes de publicar.
- **T12** El manifiesto no trae `screenshots` · **cierto y nuevo**: `manifest.webmanifest` no los tiene.

## El calendario (§3)

- **K1** En la web solo existe el archivo · **ya en la lista de Ez** (CAL-1; las altas, `STATE.md:94`).
- **K2** Sin servidor el permiso caduca · **ya en la lista de Ez** (CAL-3, con el llavero, punto 13 del ROADMAP).
- **K3** Google solo lee `primary` · **ya en la lista de Ez** (CAL-5; `app/ritmo/ritmo.calendario.web.js:253`).
- **K4** El iPhone solo tiene el archivo · **ya decidido**: el calendario en v1 es Android y la web (29 oct., `DECISIONES_PRODUCTO.md:62-74`); cierto en el código (`ritmo.calendario.destinos.js:35`).
- **K5** «Añadir» y «Mantenerlo al día solo» escriben eventos distintos · **cierto y nuevo, menor**: a propósito en el código (`ritmo.calendario.solo.js:11-16`: el modo solo parte el día para que suene el aviso de cada pausa), sin decisión de Ez escrita.
- **K6** No se puede marcar a mano «reunión de 11 a 12» · **cierto y nuevo**: las reuniones solo llegan del calendario conectado (`app/i18n/strings/calendario.js:40-51`).

## El día y los ejercicios (§4)

- **D1** Una jornada entera pide nueve paradas · **cierto y nuevo como idea**: vivido el 10 nov., 9 bloques y 7 pausas; ofrecer una intensidad está cerca de V1 «Solo pausas» y V3, que esperan a Ez sin fecha.
- **D2** Sin pagar, las pausas se repetirán · **ya decidido**: 20 oct., punto 6, sabiendo que «sin pagar se repetirá más que hoy».
- **D3** La semana que cambia no se anuncia · **ya decidido**: 20 oct., punto 4, «Nada nuevo en pantalla». Las dos auditorías lo discuten: va a las decisiones (D-3).
- **D4** Mueve y Estira no tienen voz · **cierto y nuevo** (idea, después de v1).
- **D5** Queda la revisión de un fisioterapeuta · **cierto y nuevo**: `CONTENT.md:83-85` la pide «antes de v1.0» para Nordics, Sissy squat, Fondos en silla y Couch stretch; «Fondos en silla» es una rutina gratis de Mueve (`move.data.js:326`). No está en la lista de Ez. `CONTENT.md` da las cifras de la v0.176.0 (`CONTENT.md:13`).

## La interfaz (§5)

- **I1** Nada invita a volver; un aviso opcional a la hora de entrada · **cierto y nuevo**: el único aviso es el fin de un Foco. En la web, sin servidor, solo podría sonar con PACE abierto; en Android y el iPhone, con avisos programados.
- **I2** La bienvenida tarda en dar valor · **ya decidido**: «Cómo se cobra» (15 oct.), punto 5, y la pantalla de «abierto hasta v1» (27 oct., 2A). Va a las decisiones (D-2).
- **I3** Se perdieron las preguntas de perfil · **cierto y nuevo**: solo salen con Caminos (`app/onboarding/Onboarding.jsx:231`).
- **I4** «Foco manual» y «Ciclo N / 4» son restos de Caminos · **cierto y nuevo**: `app/i18n/strings/sessions.js:60,78`; «Foco manual» se decidió en s122 frente al Camino guiado (`DECISIONES_PRODUCTO.md:600`), hoy oculto.
- **I5** El selector Foco/Pausa/Larga convive con la pausa del día · **cierto y nuevo**: visto a 1280 con la jornada en marcha.
- **I6** Sin sincronización, el historial se parte · **ya en la lista de Ez** (S3, `STATE.md:102`); hoy existe exportar e importar una copia.
