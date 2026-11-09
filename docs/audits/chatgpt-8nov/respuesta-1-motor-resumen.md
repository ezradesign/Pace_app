# ChatGPT, 8 nov. 2026 · primera respuesta a la revisión de la jornada: el motor y el resumen del día

Ez la trajo el 8 nov., ~20:30, con la consigna: «comprueba en qué acierta, y antes de implementar los cambios espera que yo los
vea y los acepte». ChatGPT leyó `main` en ea41c91a (la 0.194.0). Abajo, lo comprobado; la respuesta entera, al final.

## Lo comprobado (coordinadora, 5iWBf)

### 1 · Una corta ya adaptada o rechazada tapa a las demás · ACIERTA

`motorCortas` (`app/ritmo/ritmo.motor.js`) recorre los grupos de cortas saltadas, se queda con el que tiene más días (`mejor`) y
solo DESPUÉS mira si esa hora ya está en `a.cortas` (adaptada) o en `a.rechazado` (`corta:<hora>`): si lo está, `return []`, sin
mirar el grupo siguiente. Con la 10:35 adaptada o rechazada y la 15:45 saltada tres días, no se propone nada. Lo adaptado dura cuatro
semanas, igual que lo rechazado (`ritmo-motor.spec.js`, «lo rechazado no vuelve en cuatro semanas»), así que el aprendizaje de las
cortas se para ese mes. `a.cortas` es una lista: tener varias adaptadas a la vez está previsto, no es una regla de «una sola».
Ninguna prueba junta una hora excluida con otra válida.

En la rama `claude/usabilidad-8nov-587b48` (37f4603d), **S6 A ya se montó del modo bueno**: el grupo que ya era de 2 minutos se
descarta DENTRO del recorrido, antes de elegir. Las dos exclusiones de arriba siguen después, como en `main`, así que el fallo sigue
también en la rama. El arreglo: pasar esas dos comprobaciones al mismo sitio que la de S6. Prueba: la de ChatGPT (A adaptada, B
rechazada, y el control con las dos horas excluidas).

### 2 · Si falla el resumen del día, el día se marca resumido igual · ACIERTA EN EL CÓDIGO, CON UN MATIZ

`ritmoResumenAntesDePisar` (`app/state-ritmo.resumen.jsx`): `try { resumen = ritmoResumenDe(s, dia) } catch { resumen = null }`, y
devuelve `resumido: dia.fecha` haya resumen o no. El día no entra en la cola y no se vuelve a intentar.
- **Con un error** (una excepción dentro de `ritmoMenuDe`/`semanaComponer`): el día se pierde para la carta (lo hecho, lo saltado y
  los «Otra»), aunque su causa desaparezca. Va contra la regla de DECISIONES «el día de "A tu ritmo" que ya pasó… nunca se pisa
  sin resumirlo». Las sesiones de Estadísticas (`session.completed`) no se pierden: son otro registro. La carta cuenta los días con
  resumen (`f1`, `MOTOR_DIAS_CARTA = 3`), así que perder uno puede dejar la semana sin carta.
- **Con `null` sin error**: es a propósito. `ritmoResumenDe` da `null` si el día no tiene `opcion` o su forma no existe
  (`RITMO_FORMAS[opcion]`, `ritmoComponer`). No hay nada que resumir, y marcarlo evita intentarlo cada minuto. Aquí ChatGPT acierta
  en la mecánica pero no es un fallo.
- **No basta con no marcarlo**, como dice ChatGPT: `ritmoGuardar` lo llama antes de pisar `ritmo.dia`, así que al elegir el día de
  hoy el de ayer desaparece igual. El arreglo es guardar una copia del día pendiente (con tope, como la cola de 14) y reintentarlo
  en `ritmoResumirAhora`; un error que se repite no rompe nada, porque va dentro de `try`.
- **No se ha visto un desencadenante normal**, y ChatGPT tampoco lo afirma: es una red de seguridad, no un fallo que se vea hoy.
  Prueba: la de ChatGPT (forzar un fallo una vez, comprobar que no se marca, quitar el fallo y ver un solo resumen con los
  descartes originales), más elegir el día de hoy entre medias.

### Dónde se montarían

Los dos archivos los toca ya la sesión `letras-jornada` en su rama (S6 en `motorCortas` y la 4A en `ritmoResumenDe`): montarlos allí
evita choques al juntar y van en la 0.195.0. **Espera el sí de Ez.**

## La respuesta de ChatGPT, entera

Sí, con la repo pública basta; no hacía falta pedirte un ZIP. He retomado la lectura sobre el commit `ea41c91aa12ac914ca43feaea8bb98d086e2dc65`, correspondiente a la revisión que estábamos haciendo.
Esta pasada se centra en lo que aprende PACE y cómo conserva la semana. He encontrado dos problemas concretos. Son conclusiones de lectura del código: no he ejecutado la app ni las pruebas. Te doy la función exacta como localizador, sin inventar números de línea.

1. Una pausa ya adaptada o rechazada puede impedir que PACE adapte otra distinta
Prioridad: molesta. Afecta al valor del aprendizaje semanal.
Dónde: `app/ritmo/ritmo.motor.js`, función `motorCortas`.
La función busca primero el grupo de pausas saltadas con más pruebas y lo guarda en `mejor`. Después comprueba si esa hora ya tiene una adaptación vigente o si la rechazaste. Si ocurre cualquiera de esas dos cosas, devuelve `[]`: no busca el siguiente grupo que sí podría proponer.
Recorrido concreto
1. La semana pasada saltaste una pausa corta a las 10:35 durante cinco días, sin reuniones alrededor.
2. También saltaste otra a las 15:45 durante tres días, sin reuniones alrededor.
3. La de las 10:35 ya tiene una adaptación vigente a dos minutos —o rechazaste esa propuesta anteriormente—.
4. El motor elige las 10:35 por tener cinco días de pruebas.
5. Al detectar que ya está adaptada o rechazada, termina sin proponer la de las 15:45, aunque esta también supera el umbral. Ese resultado se deduce del orden de selección y filtrado de `motorCortas`.
Qué ve y qué pierde la persona: puede seguir saltándose una segunda pausa con regularidad y PACE no ofrece adaptarla. El aprendizaje parece haberse detenido, aunque tiene información suficiente.
Arreglo recomendado: generar los grupos candidatos, excluir primero los ya adaptados o rechazados y elegir después el mejor entre los restantes. Si no hay ninguno elegible, entonces devolver `[]`.
Prueba que añadiría:
* Cinco días saltando las 10:35 y tres días saltando las 15:45.
* Variante A: adaptación vigente a las 10:35.
* Variante B: rechazo vigente a las 10:35.
* En ambas, esperar una propuesta para las 15:45.
* Control: si las dos horas están excluidas, no proponer nada.
La prueba existente comprueba que lo adaptado o rechazado no vuelve a proponerse, pero no combina esa exclusión con una segunda hora válida.

2. Si falla la creación del resumen, el día queda marcado como resumido igualmente
Prioridad: potencialmente grave para la conservación del aprendizaje; falta reproducir un desencadenante normal.
Dónde: `app/state-ritmo.resumen.jsx`, función `ritmoResumenAntesDePisar`.
Aquí hay una diferencia importante entre el comportamiento pretendido y el real:
* Se intenta construir el resumen.
* Si ocurre una excepción, se convierte en `resumen = null`.
* Solo se añade a la cola si existe ese resumen.
* Pero se guarda `resumido: dia.fecha` en ambos casos.
La siguiente llamada descarta ese día porque ya figura como resumido. También sucede si `ritmoResumenDe` devuelve `null` sin lanzar una excepción.
Recorrido concreto
1. El martes usas «A tu ritmo»: haces pausas, saltas otras y pulsas «Otra».
2. El miércoles se intenta resumir el martes.
3. La reconstrucción devuelve `null` o lanza una excepción.
4. El martes no entra en la cola, pero queda marcado como resumido.
5. Aunque desaparezca la causa del fallo, los siguientes intentos ya no lo reconstruyen. Este encadenamiento está determinado por las condiciones de la función.
Qué ve y qué pierde la persona: no hay un aviso específico en esta ruta. La carta podría perder las pausas y decisiones de ese día; si era el tercero de la semana, podría quedarse sin alcanzar el mínimo de tres días necesario para generar carta. No implica que desaparezcan también las sesiones de Estadísticas: son registros distintos.
Arreglo recomendado:
* No actualizar `resumido` cuando la construcción falla.
* Conservar el día pendiente para reintentarlo.
* Si una escritura va a sustituir ese día, conservar antes los datos necesarios para reconstruirlo; dejar simplemente la marca sin actualizar no basta si después se pierde `r.dia`.
Prueba que añadiría:
1. Sembrar un martes con pausas y descartes.
2. Forzar un fallo único de `ritmoResumenDe`.
3. Comprobar que el martes no queda marcado como resumido.
4. Restablecer la función y reintentar.
5. Verificar que acaba guardándose un solo resumen, con los descartes originales.
Grado de certeza: el tratamiento incorrecto del fallo está comprobado en el código. No he demostrado todavía qué acción habitual de una persona provoca ese fallo; por eso no lo presentaría como una pérdida frecuente.

Qué corregiría primero
Primero el segundo, porque un fallo recuperable no debería convertirse en una pérdida definitiva del resumen. Después el primero, porque afecta directamente a la promesa de que PACE sigue ajustándose semana a semana.
No son motivos para rehacer el motor: son dos correcciones acotadas, con pruebas muy concretas para evitar regresiones.
