# Para ChatGPT: la jornada entera y la experiencia diaria (8 nov. 2026, v0.194.0)

Ez lo pega en ChatGPT cuando la 0.194.0 esté en `main`. La respuesta entera se guarda aquí al lado (`respuesta.md`) y
se comprueba en el código antes de montar nada, como las de `docs/audits/chatgpt-28oct/`.

```
Revisa en el repositorio público ezradesign/Pace_app, rama main (versión 0.194.0), «A tu ritmo»: la jornada entera de PACE y lo que aprende de una semana a otra. Solo lectura. No repitas lo que ya está bien: quiero lo que puede salir mal y lo que mejoraría la experiencia de quien lo usa cada día.

Contexto:
- PACE es una app de pausas activas para quien trabaja sentado (web/PWA, Android e iPhone). «A tu ritmo» compone el día en bloques de Foco y pausas según tu horario, la comida y tus reuniones; lo pinta en la línea del día y en el aro; se recoloca cuando haces algo; pasada tu hora de salida se cierra; y cada lunes una carta te propone cambios con lo que hiciste.
- Acabo de juntar (8 nov.): volver tras horas fuera (el día elegido y sin empezar se lee desde ahora; la ventana de una pausa que ya pasó entera no sale; el día cerrado dice «Jornada cerrada») y siete arreglos de una semana simulada (el bloque antes de una reunión, «Otra» en lo que se aprende, el primer bloque que se perdía sin contarse, el Foco que acaba con el portátil cerrado).
- Ya lo sé y está en mi lista: con el día ya empezado, al volver tras horas fuera la línea sigue en las horas de la mañana; y falta decidir si un Foco por libre después de cerrar la jornada cuenta para la hora de salida que propone la carta.
- Las reglas que ya rigen están en docs/product/DECISIONES_TECNICAS_VIGENTES.md y docs/product/DECISIONES_PRODUCTO.md. Si el código las contradice, dímelo; si una regla te parece mala, dilo aparte.

Lee: app/state-ritmo*.jsx, app/ritmo/ (sobre todo ritmo.motor.js, ritmo.regla.js, ritmo.semana.js, RitmoHome.jsx, RitmoLinea.jsx y RitmoCarta.jsx), app/focus/FocusTimer*.jsx, app/state-timer.jsx, app/state-core.dia.js, app/state-events.jsx, y las pruebas tests/ritmo-*.spec.js, aro-jornada, cambio-de-dia, abierta-horas, jornada-cerrada-hora y foco-hora-de-acabar.

Busca casos concretos, paso a paso, en:
1. El día: empezar tarde, saltarse la comida o una pausa, «Otra» y «Ahora no», reuniones que se mueven o se solapan, salir antes o después de tu hora, «Hoy es distinto», la media jornada, y un bloque o una pausa que se quedan a medias.
2. El tiempo: la pestaña de fondo, el portátil cerrado, PACE cerrado y vuelto a abrir, dos pestañas, la medianoche, el cambio de hora y el móvil bloqueado.
3. Lo que se cuenta: que cada bloque y cada pausa cuenten una sola vez, con lo que duraron y en su día; lo que lee Estadísticas y lo que aprende la carta.
4. La carta del lunes: que lo que propone salga de lo que de verdad hiciste y que no proponga algo que ya es así.
5. La experiencia: lo que una persona no entendería, lo que le cuesta un paso de más y lo que le dice algo que no es verdad (una hora que ya pasó, un bloque que no existe). Y qué mejoras o funciones nuevas darían más valor antes de v1 y cuáles pueden esperar, con lo que costarían.

Para cada hallazgo: archivo y línea, el caso paso a paso, qué ve y qué pierde quien lo usa, y si es grave, molesta o es una mejora. Separa lo que has comprobado en el código de lo que deduces. No propongas nada que suba la exigencia física ni consejos de salud.
```
