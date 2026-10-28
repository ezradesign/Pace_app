# Las siete revisiones de ChatGPT del 28 oct. 2026

Ez las pegó en la sesión de la coordinadora (cuenta de 5iWBf…) entre las 20:10 y las 21:30. Aquí están **tal cual**
(`01-…` a `07-…`), para que no se pierdan al cambiar de cuenta. Cada caso se comprobó contra el código de la 0.185.0 (el
`main` de este PC), no contra el commit que leyó ChatGPT. **Ez, 28 oct.: «luego lo que se necesite se valora juntos los
dos y vamos implementando lo que sea útil en esta o en la otra cuenta».** Nada de esto está decidido salvo lo que se
diga abajo; lo que cambie en pantalla se enseña antes en una maqueta.

## Qué es cierto y adónde va

| Revisión | Códigos | Veredicto | Adónde va |
|---|---|---|---|
| 1 · El cobro | A1-A6, y A7 (de la coordinadora) | Ciertos los seis: avisos de Stripe repetidos o desordenados que pisan códigos, la prueba que empieza al llegar el aviso, «terminada» sin baja, la renovación que pisa la de por vida, la importación que se tapa y cualquier pago de la cuenta que da código. A7: el modo de prueba firma con la k2 real | La sesión del cobro, que Ez arrancó el 28 oct. a las ~20:50 (`local_3bee2030-…`, rama propia, puerto 8807). Antes de cobrar de verdad |
| 2 · Rutinas sin «Auto» | B1-B4 | Ciertos los cuatro: el tiempo que corre esperando a «›», «Auto» que avanza en pausa, las reps con banda que no cuentan y las seis colocaciones que no se ven | Una sesión de Mueve, Estira y «Tus rutinas», con el sí de Ez. Antes de la versión de prueba |
| 3 · El valor de PACE | U1-U5 y «De producto» | Ciertos en el código: el borrador que se pierde, la tarjeta sin teclado, la carta del lunes obligatoria, la prueba de 7 días que puede acabar sin carta y la frase del móvil que falta. Lo demás (la oferta de /premium, invitaciones según lo tocado, plantillas, precios, validar con personas) es consejo para Ez | U1 y U2, en la sesión de Mueve y Estira; U3-U5 y la oferta, en una maqueta de producto para Ez |
| 4 · «Tus rutinas» | C1-C6 | Ciertos los seis: el constructor tapado desde Estira, dos duraciones distintas, material que no se dice, instrucciones que se pierden al personalizar, «Zancada con apertura» sin inglés y guardar sin respuesta | La sesión de Mueve, Estira y «Tus rutinas» |
| 5 · Quien empieza | P1-P8 | Ciertos en el código: la salida de «Tu semana», el tiempo que incluye las pausas, «sin material» con pared, la vista previa sin «cómo se hace», la flecha que no dice qué hace, «una serie basta» con dos series (y una sola deja la rutina sin logros), la cuenta sin «baja, sube» y la pausa que no se ve | Maqueta para Ez; P1-P3 son textos |
| 6 · El día que se tuerce | Q1-Q7 | Ciertos en el código: «Saltar esta pausa» que solo la aplaza, tocar una pausa futura la cambia, motivos que afirman lo que PACE no sabe, un «No» que veta para siempre (regla de s189), las pausas por tu cuenta, los cierres que dicen cómo te sientes y los dispositivos que no se juntan | Maqueta para Ez; Q1, Q3, Q6 y Q7 son textos |
| 7 · Entender y repetir | R1-R6 | Ciertos los seis (abajo) | Lo que es dato o texto, con la página de textos; R1 y R5, con la maqueta |

## Revisión 7, comprobada (R1-R6)

- **R1** Respira abre con «Energía», cuya entrada gratis («Rondas express») lleva aviso de seguridad, y tiene «Equilibrio»
  y «Balance» como grupos distintos (`app/breathe/BreatheLibrary.jsx`): falta un «¿Es tu primera vez? Empieza aquí» y
  decir las diferencias por lo que se hace («sin aguantar el aire»). Decide Ez, con maqueta.
- **R2** «Gemelos subrepticios» vale sentado o de pie (`position: ['seated', 'standing']`), pero `RoutineCard.jsx` solo
  dice «Sentado» si es la única posición: la tarjeta dice «De pie». Arreglo de dato a pantalla: «Sentado o de pie».
- **R3** `librarySeries` (`app/ui/library-rules.js`) cuenta como series las reps de ejercicios distintos: «Levántate y sube»
  sale «4 series · 5·6». Mejor «2 ejercicios», y el detalle en la vista previa.
- **R4** «Glúteos invisibles» (`extra.glutes.stealth`, paso 2): 30 s para «aguanta unos diez segundos y suelta. Tres veces»,
  que no cabe con los respiros. Texto o tiempo (en español y en inglés).
- **R5** en Ajustes, elegir una voz no deja oírla (`ponerSenal`, `app/tweaks/TweaksAudio.jsx`), y «Música» solo suena en
  Respira aunque está en el sonido general. Un «Escuchar muestra» y decir «en Respira». Decide Ez.
- **R6** «4·7·8» dice 1 min y cuatro ciclos de 19 s: acaba a los 76 s (`handleCycleComplete`, `BreatheSession.jsx`) y la
  barra está llena desde los 60. El progreso, por ciclos, o «4 ciclos · 1 min 20 s».

## Cómo seguir

1. **Ya en marcha**: la sesión del cobro (A1-A7).
2. **Con el sí de Ez**: una sesión para B1-B4, C1-C6, U1, U2, R2, R3, R4 y R6 (los que no piden decidir nada, más los que
   cambian poco), con maqueta para lo que se vea. Tocan `app/move/`, `app/custom/`, `app/extra/`, `app/breathe/`,
   `app/ui/` y `app/main.jsx`.
3. **Para Ez, en una página**: los textos de antes y después (P1-P3, Q1, Q3, Q6, Q7), que pueden ir en la versión de prueba.
4. **Para Ez, en una maqueta**: lo de producto (U3-U5, la oferta de /premium, P4-P8, Q2, Q4, Q5, R1 y R5). Recomendado en
   una actualización durante los 14 días de los testers, para no retrasar la versión de prueba ni v1.
