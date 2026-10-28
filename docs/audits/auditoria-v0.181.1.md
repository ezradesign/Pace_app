# Auditoría de PACE · v0.181.1 · 28 de octubre de 2026

> La hizo la coordinadora (cuenta de 5iWBf…) entre la noche del 27 y la mañana del 28 de octubre, sobre `main`
> en cee0095 (0.181.1) y las dos ramas terminadas. Se miraron el código, las pruebas, el CI, la web publicada,
> la seguridad y las ramas. Sobre todo, se cruzó lo que Ez ha decidido para v1 con lo que hay en el código. Lo
> que cambia el orden de trabajo ya está en `ROADMAP.md`, «Camino a v1.0»; la página de Ez es su hoja de pasos.

## En una frase

El código de v1 está casi entero y sano. La fecha ya no depende del código, sino de dos cosas: los 12 testers
de Android con sus 14 días, que aún no han empezado a contar, y el alta para cobrar, que piden las tres tiendas.

## Cómo está el código

| Qué | Dato (28 oct.) | Lectura |
|---|---|---|
| La web | pacegrass.app sirve la 0.181.1 (`sw.js`: `pace-v0.181.1`): 549 KB comprimida (1,9 MB sin comprimir), sin ningún script de fuera y con CSP. `/STATE.md` ya no se sirve | Bien |
| `npm run verify` | Pasa en `main` (30-38 s) con 524 archivos medidos; ninguno pasa de 500 líneas | Bien |
| La regla de 500 líneas | Hay 28 archivos con 450 líneas o más, y tres con 500 justas: `TimerDial.jsx`, `_responsive.js` y `_responsive.atmosfera.js` | El próximo cambio en esos tres obliga a trocearlos antes, y el encargo debe decirlo |
| Pruebas | 955 en 166 archivos en `main` (con la 0.174.0, hace ocho días, eran 733); 966 en «Qué te ayuda» y 974 en Android a fondo | Crecen con cada pieza |
| El CI de `main` | 14 caídas entre el 18 y el 27 oct. Cuatro eran la trampa de medianoche (abajo) y una, una espera que no esperaba (arreglada el 27). Las otras nueve, del 18 al 23 oct. (el aro, bloques cortos, Safari), no han vuelto | Desde el 24 oct., cada rojo tiene su causa encontrada |
| La duración del CI | El e2e va en dos trozos: uno tarda 10 min y el otro 14, de un tope de 25. Safari, 14 de 45 | Hay holgura, aunque los dos trozos van desequilibrados |
| Seguridad | `npm audit` no avisa de nada. No hay secretos en git: la llave de depuración de Android está a propósito, y las de Play, las licencias y Apple viven fuera. `licencia.llaves.js` solo trae llaves públicas | Bien. La CSP lleva `'unsafe-inline'` porque la app va en un solo archivo; después de v1 se puede pasar a hashes |
| Ramas | Esperan a Ez: «Qué te ayuda» (0.183.0), Android a fondo (0.182.0) y, desde hoy, `claude/pruebas-medianoche`. Siguen sin borrar 16 ramas locales y 16 en GitHub ya juntadas, y 7 worktrees de ramas juntadas. `calendario-reescrita` y `play-rutina-subidas` se guardan a propósito | Limpiar con el sí de Ez y con copia en un bundle, como el 27 oct. |

## La trampa de medianoche (arreglada en `claude/pruebas-medianoche`)

El CI del último commit de documentos (cee0095, el 27 oct. a las 23:07) cayó en `caza-sesiones`, en «con la página
oculta una hora, Estira no suma esa hora»: esperaba 1 y recibió 0. No era la app. Seis archivos de pruebas
instalaban el reloj de la página a la hora de verdad y leían o sembraban «hoy» con el reloj de Node. Lo que
adelantan (una hora, media hora, 20 o 25 minutos) cruza la medianoche si corren de noche. Entonces la app apunta
la sesión al día siguiente, como debe, y la prueba mira el de antes. Lo mismo tiró las tres caídas del 21 oct. por
la noche (a las 23:01, las 23:29 y las 23:39, la última con `ingles-11`).

- Lo provoqué aquí a las 23:19: salió en rojo, igual que en GitHub. Con el arreglo y a la misma hora, en verde.
- El arreglo pone el reloj a `MEDIODIA` (`tests/helpers.js`) en `caza-sesiones`, `logros-sesion-entera`,
  `tus-rutinas-auditoria`, `caza-ingles`, `pausa-propone` y `retencion`: 60 pruebas en verde.
- `scripts/verify.pruebas.js` falla si la trampa vuelve (probado con la versión vieja), y la regla va en la fila de
  arriba de `DECISIONES_TECNICAS_VIGENTES.md`.
- No lleva versión, porque solo toca pruebas. Espera el «júntalo» de Ez.

## Lo que Ez decidió y aún no está en el código

Cruzado con `DECISIONES_PRODUCTO.md`. Ninguno es un fallo de lo hecho: son piezas de v1 que el orden de trabajo
aún no tenía apuntadas.

1. **La valoración de Google Play**, que se pide una sola vez, al acabar la quinta pausa entera (reseñas, punto 6).
   No hay nada hecho.
2. **El paso a v1 sin quitar nada** (reseñas, punto 1): quien ya usaba PACE recibe su semana de prueba con aviso y
   conserva para siempre las rutinas de pago que ya hizo. Hoy solo existe el interruptor `PREMIUM_ABIERTO_HASTA_V1`.
3. **`/recuperar`** (cobro, punto 2), para recuperar el código con el correo y el número del recibo. No existe. Sí
   existen la página de gracias y `/api/codigo`.
4. **Cobrar en Android**: `paceTiendaPlay` sigue vacía y el AAB no lleva Play Billing.
5. **Cobrar en el iPhone**: no hay StoreKit, y `app/state-compra.js` aún dice que en el iPhone no hay tienda
   hasta después de v1, que era lo decidido antes del 22 oct.
6. **Lo legal de /premium**: las condiciones, las devoluciones, el aviso legal (con nombre, NIF y contacto de Ez) y
   la función de desistimiento en línea, obligatoria en la UE desde el 19 jun. 2026 (`docs/audits/cobro-chatgpt-22oct.md`).
   Falta también la invitación con los botones de compra.
7. **El llavero del calendario** espera las altas de Ez. Hoy el calendario automático de la web no funciona para
   nadie, porque los dos ids están vacíos (`CALENDARIO_IDS`, `ritmo.calendario.web.js`). Para abrir Google Calendar a
   todo el mundo, Google tiene que verificar la app, y tarda «unas semanas» (`docs/CALENDARIO_ALTAS.md`). Hasta
   entonces, solo pueden usarlo 100 testers.

## Lo que fija la fecha de v1

1. **Juntar las dos ramas**: espera a que Ez mire las fotos de «Qué te ayuda» y pruebe Android a fondo en su móvil.
2. **Subir esa versión a la prueba cerrada de Play.** Hoy tiene la 0.174.0, sin Mueve y Estira nuevos, sin la
   bienvenida, sin la privacidad y sin el arreglo de la hora. No conviene invitar a nadie a esa versión.
3. **12 testers con la app 14 días seguidos.** Ez tiene 5 o 6. `/beta` y el grupo están listos: falta difundirlos.
4. **Pedir el acceso a producción.** Google lo revisa, y suele tardar unos días.
5. **A la vez, el alta para cobrar**, con el gestor. Sin ella no hay perfil de pagos en Play, ni acuerdo de apps de
   pago en Apple, ni pagos de verdad en Stripe. Las compras de Play y de Apple no se pueden probar sin esas dos cosas.

Un ejemplo: si los 12 testers están dentro el 4 de noviembre, los 14 días acaban el 18 y v1 podría salir a finales
de noviembre. Cada día que tarden los testers retrasa v1 otro día. El código que falta (los puntos 1 a 6 de arriba,
Play Billing y StoreKit incluidos) cabe dentro de esos 14 días.

## Riesgos

- **Stripe «vende por ti» en España**: hay que confirmar, al abrir la cuenta, que lo ofrece. Si no, Paddle, como se
  decidió el 15 oct.
- **La revisión beta de Apple**, enviada el 23 oct.: si llegó el correo de aprobación, el enlace público va a
  /beta. TestFlight tiene la 0.175.0, así que hay que subir la nueva al juntar las dos ramas.
- **El camino crítico depende casi entero de Ez**: los testers, el gestor y las cuentas. Ez se pierde con mucho
  abierto, así que la hoja le da una sola cosa en «Ahora».
- **STATE.md ya no cabe en una pantalla**: tiene 148 líneas, contra lo que pide `CLAUDE.md`. Conviene rehacerlo corto
  al juntar las dos ramas, con el detalle en el relevo y en DECISIONES.
- **Lo que dejó para después Android a fondo**: el iPhone tiene los mismos cuatro fallos de los avisos
  (`app/ui/ios.js`), y el aviso de fin no nombra la pausa de «A tu ritmo». Van antes de que los testers de iPhone
  prueben en serio.
- `node scripts/glifos/generar-pendientes.js` sigue cayendo al arrancar (`ERR_INVALID_ARG_TYPE`), así que el encargo
  de dibujos es de antes de los seis ejercicios nuevos.

## Lo que se hizo con esta auditoría

- La hoja de Ez, republicada en esta cuenta (https://claude.ai/artifact/5iWBfHE7kD3dUVocdskmb6).
- El arreglo de la trampa de medianoche, en `claude/pruebas-medianoche` (bef9a7d), con su CI en GitHub.
- `ROADMAP.md` («Camino a v1.0»), `STATE.md` («Lo siguiente» y «Espera a Ez») y el relevo, al día. En el ROADMAP,
  además, el iPhone deja de figurar «fuera de v1», y las fases 2, 3 y 6 dicen su estado de hoy.
