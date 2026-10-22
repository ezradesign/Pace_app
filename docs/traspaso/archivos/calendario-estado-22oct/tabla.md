# Lo que dice el calendario que se mantiene solo (C2 de la auditoría del 22 oct.)

**Decidido: Ez eligió la A el 22 oct., montada en v0.174.3** (`DECISIONES_PRODUCTO.md`). Lo de
abajo es la tabla tal como se le enseñó.

## Qué pasa hoy

Con «Mantenerlo al día solo», PACE escribe en tu calendario un minuto después de que el día
cambie. Hoy la hoja y el enlace solo distinguen dos cosas: «al día» y «falta permiso». Por eso
dicen **«Calendario al día»** en dos casos en los que no lo está:

- **Durante ese minuto**: el día ya cambió (por ejemplo, una reunión nueva a las 12:00) y tu
  calendario todavía no lo sabe.
- **Cuando falla** algo que no es el permiso (no hay red, o Google no contesta). PACE lo vuelve
  a intentar cada 5 minutos, pero la hoja sigue diciendo «al día».

## Los cuatro casos, con lo que diría cada uno (opción A)

Un ejemplo: conectado a Google a las 10:00 (Google deja escribir una hora: hasta las 11:00); a las
10:30 una reunión nueva mueve la tarde.

| Caso | Cuándo | Enlace | Bajo «Google Calendar» | Botón | Nota debajo |
|---|---|---|---|---|---|
| **Al día** (como hoy) | no hay nada por escribir | Calendario al día · *Calendar up to date* | Al día · conectado hasta las 11:00 · *Up to date · connected until 11:00* | Desconectar | — |
| **Poniéndose al día** (nuevo) | 10:30, el minuto antes de escribir, o escribiendo | Poniendo al día… · *Updating…* | Poniéndolo al día… · *Bringing it up to date…* (ya existe) | Desconectar | — |
| **No se pudo** (nuevo) | a las 10:31 falló y lo reintenta a las 10:36 | No se pudo poner al día · *Calendar not updated* | No se pudo · lo intenta otra vez a las 10:36 · *Could not update · trying again at 10:36* | **Reintentar** · *Try again* | No se pudo hablar con tu calendario. PACE lo vuelve a intentar cada 5 minutos. · *Could not reach your calendar. PACE tries again every 5 minutes.* |
| **Falta permiso** (como hoy) | se acabó la hora de Google, o en Android se quitó el permiso | Poner al día · *Bring up to date* | Al día hasta las 10:30 · *Up to date until 10:30* | Poner al día | la de hoy: «Google deja escribir a PACE una hora cada vez…» |

«Reintentar» hace lo mismo que «Poner al día»: escribe ahora. Con permiso no abre ninguna
ventana.

## Las opciones

- **A · Cuatro casos, como en la tabla (la recomendada).** Lo que dice la hoja es siempre
  verdad, y el fallo se ve con su remedio al lado.
- **B · Tres casos.** Igual que A, pero el minuto de espera sigue diciendo «al día»: es corto y
  el enlace no cambia cada vez que mueves algo. El fallo sí se ve.
- **C · Como A, sin la hora del reintento.** «No se pudo · lo intenta otra vez en unos
  minutos». Es más corto.

Antes de montarlo hay que medir el enlace a 360 y a 1280 px: «No se pudo poner al día» es más
largo que «Calendario al día» y va junto a «Cambiar».

## Lo que esto no arregla

En Android, el puente del calendario se traga los errores: si el móvil no contesta, PACE ve un
calendario vacío. Así, en Android no se llega nunca a «No se pudo», y una lista que falla puede
hacer que PACE vuelva a crear lo que ya estaba. Va aparte.
