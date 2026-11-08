# Caza del día de v1 y de la compra (7 nov. 2026)

Rama `claude/caza-v1-compra-79e3e4`, sobre `main` en 62875b4d (v0.192.0). Sin subir versión.
La página para Ez, con fotos y letras: `docs/audits/caza-v1-compra-7nov/pagina-ez.html`, publicada en https://claude.ai/artifact/1AzBCEn8XpnhWVKbMJRSdg (cuenta EcLj6).

## Qué se probó

El día de v1 se simuló con `PREMIUM_ABIERTO_HASTA_V1` en false por `addInitScript` (nunca en el código),
Stripe con `page.route` y la llave de las pruebas (`tests/licencia.helpers.js`). Cada persona en es y en, a
360 y a 1280 px, mirando errores de consola, scroll y lo que dice cada pantalla. El guion de exploración
no se sube (vive en el scratchpad de la sesión); lo que se rompió quedó en `tests/caza-v1-compra.spec.js`.

| Persona | Resultado |
|---|---|
| 1. Tester con k1 que usaba PACE gratis | Bien. No ve la hoja del día de v1, todo abierto, Ajustes «Para siempre» y su número. Sin errores. |
| 2. Compra el de por vida: /premium → Stripe → /gracias → PACE → otro navegador → /recuperar | Bien. El botón dice «Comprar» y sigue diciéndolo tras cambiar dos veces de idioma; /gracias espera y da el código; el enlace lo canjea; /recuperar en otro navegador lo devuelve y abre PACE completo. La invitación de la app con solo el de por vida cabe a 360 sin scroll. |
| 3. Gratis desde hace semanas, sin código, el día de v1 | Bien. La hoja sale una vez con su fecha y las dos de pago que hizo; Ajustes «Prueba hasta el …»; pasada la semana conserva historial, logros, sus rutinas propias (guardadas, cerradas) y las dos de pago; lo demás de pago, con candado. |
| 4. Exporta, borra e importa; y una copia vieja de antes de v1 | **Fallo 1** (arreglado). Exportar → borrar → importar devuelve código, semana y lista. |
| 5. Vuelve tras meses; la prueba del mensual cuando llega el aviso | Bien: la semana empieza el día que vuelve. El aviso de la prueba sale una vez con día y precio, pero **sin forma de cancelar** si falta el portal (ver «Vigilado»). |

## Fallos

### 1. Una copia de antes de v1 vuelve a dar la semana entera (arreglado)

Pasos: alguien que usaba PACE, con su semana del día de v1 ya acabada, importa una copia que hizo en octubre.
Al recargar sale otra vez «Siete días de PACE completo» y todo se abre siete días más. Se repite cada vez que
importa esa copia: PACE completo gratis para siempre con un gesto de Ajustes. Y al revés: una copia de otro
equipo donde PACE se instaló ya en v1 le quitaba las rutinas de pago que se le quedaban.

Por qué: `pasoV1` va dentro del estado y la copia lo pisa entero; la de antes de v1 no lo trae y el arranque
siguiente lo calcula de nuevo. Lo del código ya tenía su regla (`paceLicenciaConservar`), esto no.

Arreglo: `paceConservarAlImportar` (`app/state-entitlement.jsx`) junta la regla del código con
`pacePasoV1Conservar` (`app/state-paso-v1.js`): con el paso de quien ya usaba PACE se quedan sus fechas y su
aviso, y a su lista se suman las de pago que trae la copia. Sin paso de ahora o con el de quien instaló en v1
(también tras «Borrar todo»), entra la copia como venga. `TweaksData.jsx` llama a la nueva.

Prueba: `tests/caza-v1-compra.spec.js`. Contra 62875b4d caen las dos primeras («la copia vieja volvió a
empezar la semana», «la copia de otro equipo le quitó su semana y su lista»); el control (borrar e importar la
copia de después de v1) pasa con y sin el arreglo. Con el arreglo, en verde también `paso-v1` e
`importar-licencia` (23 de 23) y `npm run verify`.

Riesgo que queda: «Borrar todo» y luego importar una copia de antes de v1 da una semana nueva (se pierde todo lo
de después de esa copia, así que es caro). Es del riesgo ya aceptado («lo guardado en el equipo se puede tocar»).

## Vigilado sin cambiar nada

- **El mensual sin dónde cancelarlo.** Con `enlaces.mes` puesto y `gestionar` en null, el aviso de los dos días
  solo dice «Seguir con la prueba» y Ajustes no tiene «Gestionar la suscripción», aunque /premium y /gracias
  prometen cancelarlo desde Ajustes. Hoy el mensual no tiene enlace. La prueba «el mensual no se vende sin dónde
  cancelarlo» cae el día que alguien encienda el mensual sin el portal.

## Lo que eligió Ez (7 nov.: 1B 2A 3B 4A), montado el 8 nov. (abajo, «Montado»)

1. **«Borrar todo» quita PACE completo comprado sin decirlo.** El aviso dice «tus días, tus rutinas y tus
   logros». Recomendada A: una frase más cuando hay código. Pide una clave nueva de i18n.
2. **Sus rutinas propias se cierran al acabar la semana y la hoja del día de v1 no lo dice.** Recomendada A: una
   línea en la hoja.
3. **En las apps, el día de v1, sin compra de la tienda todavía** (visto en el navegador con el canal de Android simulado, foto `p6-android-sin-tienda-es-360.png`; no en un móvil): la
   hoja de PACE completo dice «Llega con la versión 1» y allí no hay ni compra ni código. Recomendada A: en una app
   cuya tienda no está lista, PACE completo sigue abierto como hasta v1.
4. **Textos que dirán «hasta v1» el día de v1**: la nota de /premium («Hasta la versión 1, PACE completo está
   abierto…»), el plato mensual («Llega con la versión 1»), `premium.v1` en la app y la bienvenida
   (`premium.onb.abierto.*`). No mienten hoy; el día de v1 hay que cambiarlos a la vez que el interruptor.

## Montado (8 nov.)

Sobre `main` en la 0.193.0 (juntada en la rama sin choques). Sin subir versión. Prueba: `tests/dia-v1-letras.spec.js`.

- **1B · «Borrar todo» no quita el código.** `wipeLocalState` (state-core.jsx) borra como siempre y, si había código,
  deja una instalación nueva (la de `loadState` sin nada guardado) con el código y `premiumAvisoPrueba`
  (`paceLicenciaQuedaAlBorrar`, state-licencia.js). El aviso no cambia («tus días, tus rutinas y tus logros»).
  privacy.html lo dice en los dos idiomas (y su fecha pasa al 8 nov.).
- **2A · La hoja del día de v1 cuenta las rutinas propias.** Con alguna en `customRoutines`, una línea antes de
  «Lo gratis sigue gratis»: «Tus rutinas propias se quedan guardadas; desde el (fecha) se abren con PACE completo.»
  / «Your own routines stay saved; from (date), they open with PACE Complete.» (`premium.pasov1.propias`).
- **3B · Sin tienda, desde v1: «Pronto podrás tenerlo aquí.»** / «You’ll be able to get it here soon.»
  (`premium.v1.despues`). Hasta v1 sigue «Llega con la versión 1.». Lo de pago se cierra igual.
- **4A · Una lista para el día de v1.** En la app, `PACE_TEXTOS_V1` (state-entitlement.jsx, junto al interruptor)
  con `paceTextoV1(clave)`: la hoja de PACE completo y los tres textos de la bienvenida. En /premium (el plato del
  mensual, las dos notas del IVA, «Dónde funciona tu compra» y la pregunta de Android) y en /beta (la nota de los
  testers y «¿Y mientras dura la prueba?», que se esconde) cada texto lleva en `data-v1` lo que dirá, con
  `var DIA_V1 = false;` en cada página. `scripts/verify.dia-v1.js` falla si un texto que nombra v1 queda fuera, si
  se pinta sin `paceTextoV1` o si las páginas y el interruptor no van a la par: el día de v1 se cambian a la vez
  `PREMIUM_ABIERTO_HASTA_V1` y los dos `DIA_V1`, o `verify` no deja subir.

Pruebas viejas que esperaban «Llega con la versión 1» con el interruptor apagado (premium-codigo, premium-compra y
la de Android y el iPhone de compra-solo-vida) dicen ahora «Pronto podrás tenerlo aquí»: es la letra 3B.

Mutantes (cada uno cae y, restaurado, vuelve a verde):

| Letra | Lo que se quita | Cae |
|---|---|---|
| 1B | `if (queda)` en el index.html compilado | «el código se quedó» (el control pasa igual) |
| 2A | la línea de las propias en el index.html | las dos de 2A, es y en (el control pasa) |
| 3B y 4A app | `paceTextoV1` devolviendo la clave en el index.html | 3B y «en la app» de 4A |
| 4A web | el bloque de `DIA_V1` en premium/index.html y en beta/index.html | la de cada página |
| 4A verify | siete: sin `data-v1` en /premium y /beta, un `DIA_V1` cambiado solo, el interruptor cambiado solo, un texto nuevo con «hasta v1», la hoja sin `paceTextoV1`, una entrada que apunta a una clave que no existe | `verify.dia-v1` en los siete |

Lo que no cubre: las fichas de las tiendas y los correos que nombren v1 (a mano), y frases que dependen de v1 sin
nombrarlo: «Cuando llegue el plan al mes» de /premium va con el enlace del mensual, no con el interruptor.

## Otras cosas vistas, sin fallo

- Quien abre PACE por primera vez desde /gracias ve antes la bienvenida; el aviso «PACE completo es tuyo» espera
  a que se cierre (los avisos no pisan diálogos, a propósito). No se miró que salga al final.
- Si la hoja del día de v1 sale tarde (abrió PACE con una sesión delante y volvió días después), el título sigue
  diciendo «Siete días» aunque la fecha de dentro es la buena.
- Errores de consola: ninguno de la app en las cinco personas (solo los 404/503 de las rutas simuladas).

## Dónde me quedo

Montadas las cuatro letras de Ez (1B 2A 3B 4A), con `tests/dia-v1-letras.spec.js` (9 de 9) y sus mutantes, que caen
todos (cinco de Playwright y siete de `verify`). `npm run verify` pasa. Mi zona con un worker en el puerto 8891, tras el
build: 268 de 268 en verde (caza, compra, cobro, hoja y código de PACE completo, borrar e importar, bienvenida, el sobre,
/premium, /beta, /recuperar, /desistir, privacidad, cabeceras, la barrera de eventos y las pestañas). La suite entera la
corre la coordinadora al juntar. La página de Ez lleva la sección «Montado» con fotos de antes y después a 360 px en es y
en (`docs/audits/caza-v1-compra-7nov/fotos/montado-*.jpg`), republicada en el mismo enlace.

Para el día de v1 (a juntar con el punto 17 del ROADMAP): apagar `PREMIUM_ABIERTO_HASTA_V1` y poner `var DIA_V1 = true;`
en premium/index.html y beta/index.html en el mismo commit; `verify` falla si falta uno.

Espera a Ez: nada nuevo. Dos cosas para que las sepa: privacy.html cambia (dice que «Borrar todo» no quita el código,
con fecha del 8 nov.), y el aviso de «Borrar todo» dice «Se borra todo lo que PACE guarda en este navegador», que con la
1B deja fuera el código; como pidió la coordinadora, el aviso no se ha tocado.
