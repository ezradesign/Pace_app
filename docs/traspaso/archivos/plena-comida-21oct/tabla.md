# Empezar «Jornada entera» en plena comida (caso 2 de la auditoría del 21 oct.)

Sesión del planificador y el calendario (v0.174.2). **No está montado**: es para que Ez elija.

## ¿Ya estaba decidido?

No. Lo decidido es otra cosa:
- s197: la comida es solo de la «Jornada entera» (las opciones cortas no la sirven).
- s195b (fila 171 de DECISIONES_TECNICAS): la FRASE nombra la comida solo si el día la sirve.
- Ninguna dice qué pasa si eliges la jornada cuando tu hora de comer ya ha empezado.

## Lo que pasa hoy (v0.174.0), con horas reales

Horario de 9:00 a 17:00 y comida a las 14:00 durante 1 h. Eliges «Jornada entera» a la hora de la izquierda.

| Empiezas a las… | Qué te sirve PACE hoy | Foco |
|---|---|---|
| 13:20 (la comida va después) | foco 13:20–14:00 · **comida 14:00–15:00** · tres bloques · cierre 16:55 | 145 min |
| 14:00 en punto | **sin comida**: foco 14:00–14:45 · … · cierre 16:55 | 150 min |
| 14:20 (la comida ya empezó) | **sin comida**: foco 14:20–15:05 · pausa · foco 15:10–15:55 · pausa · foco 16:00–16:55 · cierre | 145 min |
| 15:30 (la comida ya pasó) | sin comida: foco 15:30–16:15 · pausa · foco 16:20–16:55 · cierre | 80 min |

Dos cosas raras de hoy:
- A las 13:55 te pone la comida a las 14:00; a las 14:00 en punto, ya no hay comida en todo el día.
- Una reunión a las 14:30 desaparecía del plan si empezabas a las 14:20 (PACE la tapaba con foco).
  **Arreglado en v0.174.2**: si el día no sirve la comida, la reunión sale como «ocupado».

## Las opciones (solo cambian la fila de las 14:00 y la de las 14:20)

**A · Como hoy.** Si la comida ya ha empezado, PACE la da por hecha y empiezas a trabajar ya.
- 14:20 → foco 14:20–15:05 · pausa · foco 15:10–15:55 · pausa · foco 16:00–16:55 · cierre (145 min).

**B · Lo que queda de comida (la recomendada).** La comida es tu hora, como una reunión: si llegas a
mitad, PACE te sirve lo que queda y el foco empieza al acabar.
- 14:00 → comida 14:00–15:00 · foco 15:00–15:45 · pausa · foco 15:50–16:20 · pausa · foco 16:25–16:55 · cierre (105 min).
- 14:20 → **comida 14:20–15:00** · foco 15:00–15:45 · pausa · foco 15:50–16:20 · pausa · foco 16:25–16:55 · cierre (105 min).
- Por qué la recomiendo: es lo que PACE ya hace con una reunión que está en marcha (la pinta hasta que
  acaba), y respeta «la comida empieza a tu hora y dura lo que digas». Quien ya ha comido apaga
  «comes» en la frase y le sale lo de A.

**C · La comida entera desde ahora.** La comida se mueve: dura la hora entera desde que empiezas.
- 14:20 → **comida 14:20–15:20** · foco 15:20–16:05 · pausa · foco 16:10–16:55 · cierre (90 min).

La fila de las 13:20 y la de las 15:30 no cambian con ninguna opción.
