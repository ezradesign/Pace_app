# PACE · Estado

**Versión:** v0.135.0 · 5 de octubre de 2026 · CI de `main` en verde.

## Dónde estamos

La Fase 1 de «Camino a v1.0» (`ROADMAP.md`), el saneamiento corto, está terminada: eventos en IndexedDB
(v0.134.0), Mueve y Estira con el reloj de verdad (v0.135.0) y un método de trabajo más ligero.

## Lo siguiente

1. **Fase 2:** Capacitor para Android y la prueba cerrada de Play Console cuanto antes, con la app tal
   como esté. Hay que confirmar en Play Console si piden unos 12 testers durante 14 días.
2. **Fase 3**, mientras corre la prueba: «A tu ritmo» a lo largo de la semana, que es lo que se paga.

## Espera a Ez

- Mueve y Estira al salir de la pantalla: hoy la sesión se pausa (`SESION_AL_OCULTAR = 'pausa'`, en
  `app/move/MoveSessionV1.support.jsx`). La alternativa es que siga contando, como el Pomodoro.
- Quitar los Caminos de la home: necesita maqueta antes.

## Deuda conocida, sin fecha

- Las cinco escenas con scroll anteriores a v0.130.0 (la tarjeta por libre arrastra 72 px a 375×667 y
  32 a 360×730).
- En «A tu ritmo»: el miércoles sale con tres largas (2.ª, 5.ª y 8.ª), el modo oscuro del panel, el
  cierre que nunca es «Ahora» y la lectura C, que espera a que `origin` tenga semanas de datos.
- Tests del estado más allá del saneador · i18n con plurales y pseudolocalización · las deudas de
  claves D-1, D-2 y D-3.
- Los 22 dibujos pendientes (3 de ejercicio y 19 de logro) entran si llegan.

El `STATE.md` anterior, con el mapa de archivos, el índice de decisiones y el backlog antiguo, está en
`docs/archive/STATE_HASTA_S200.md`.
