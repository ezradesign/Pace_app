# Revisión 2 de ChatGPT (28 oct. 2026): Las rutinas de Mueve y Estira sin «Auto»

> Texto tal cual lo pegó Ez. ChatGPT leyó `main` en `c702a11`, sin ejecutar la app. Lo que comprobó la
> coordinadora contra el código de la 0.185.0, con sus códigos (B1-B4), está en `LEEME.md` de esta
> carpeta y en el relevo (`docs/traspaso/relevo-coordinadora-22oct.md`, bloque «28 oct., ~20:10»).

---

Sí. Esta pasada la he centrado en hacer una rutina como usuario: colocarte, seguirla sin «Auto», pausar y terminar, no en los pagos.
He comprobado que `main` sigue en `c702a11`. Es una revisión de código y de las pruebas existentes: no he ejecutado estos recorridos en un Android ni interactuado con la web, así que no los presento como reproducciones en dispositivo. [Source](https://api.github.com/repos/ezradesign/Pace_app/commits/main)
1. La pantalla espera a que pulses «›», pero sigue sumando tiempo
Prioridad: alta · Deducido del código.
Dónde: `app/move/MoveSessionV1.jsx`, efecto de los umbrales de trabajo y `dispatchComplete`; `app/move/MoveSessionV1.support.jsx`, `v1TrabajoActivo` y `useV1SessionClock`.
Secuencia concreta

1. Abres Core silencioso y apagas «Auto».
2. Haces el último aguante de 30 segundos.
3. La cuenta llega a `00`. Terminas el ejercicio y vuelves al trabajo, dejando PACE visible.
4. Cinco minutos después pulsas «›» para cerrar.

Qué ve la persona: el contador estaba terminado, pero el tiempo del cierre incluye esos cinco minutos adicionales. No es necesario ocultar la pestaña ni dormir el ordenador.
Por qué ocurre: al alcanzar cero sin Auto, el efecto evita avanzar, pero mantiene la fase en `work` y continúa aumentando `elapsed`. La condición del reloj activo tampoco distingue entre hacer el ejercicio y estar esperando a «›». El reloj que acredita minutos a la semana sigue abierto igualmente. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/MoveSessionV1.jsx)
Arreglo recomendado: para los ejercicios cronometrados, introducir un estado explícito de «terminado, esperando confirmación». Parar ahí el tiempo de ejercicio y excluir la espera de los minutos acreditados. No aplicarlo indiscriminadamente a las repeticiones manuales: esas sí pueden seguir realizándose a tu ritmo.
Prueba: repetir la misma rutina dos veces, esperando 0 y 300 segundos después del último `00`. Los minutos acreditados y el tiempo activo deben ser iguales. Las políticas actuales de ambos relojes no contemplan esta espera. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/MoveSessionV1.support.jsx)
2. Cambiar «Auto» puede avanzar o terminar una sesión que está pausada
Prioridad: alta · Deducido del código; pendiente de reproducción visual.
Dónde: `app/move/MoveSessionV1.jsx`, efectos dependientes de `[elapsed, auto]`, `[placeLeft, auto]` y `[changeLeft, auto]`.
Secuencia concreta

1. Con Auto apagado, dejas que un ejercicio cronometrado llegue a `00`.
2. Pulsas Pausar.
3. Enciendes Auto, sin pulsar Reanudar.

Qué puede ver la persona:

* Si era el último ejercicio, aparece el cierre de sesión.
* Si quedaban pasos, cambia de paso aunque seguía pausada.
* En una colocación agotada, pasa de «colócate» a la fase de ejercicio.

Por qué ocurre: cambiar Auto vuelve a ejecutar los efectos que comprueban el final de la cuenta. Comprueban fase, tiempo y Auto, pero no `paused`. El interruptor sigue siendo accionable durante la pausa. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/MoveSessionV1.jsx)
Arreglo recomendado: cambiar Auto durante la pausa debe cambiar únicamente la preferencia. Ninguna transición automática debería ejecutarse hasta reanudar. Al introducir esa condición, también hay que revisar las dependencias de los efectos para que reaccionen correctamente al reanudar.
Prueba: cubrir tres situaciones: colocación en cero, ejercicio en cero y cambio de lado en cero. Pausar, activar Auto y esperar: deben conservarse fase, paso y estado de pausa.
3. Sin Auto, puedes hacer los ejercicios con banda y el cierre no cuenta sus repeticiones
Prioridad: media · Deducido del código.
Dónde: `app/move/MoveSessionV1.jsx`, rama `step.opcional`, `terminarReps` y `advanceStep`.
Secuencia concreta

1. Abres Espalda con banda, con Auto apagado.
2. Haces las ocho aperturas con banda.
3. Pulsas «›» al terminar.
4. Haces también las ocho repeticiones del remo con banda y continúas.
5. Terminas la rutina.

Qué ve la persona: el resumen no incluye esas 16 repeticiones, aunque las haya hecho. Además, la acción accesible del botón es «Saltar» el paso opcional: no hay una forma diferenciada de decir «lo he hecho».
Por qué ocurre: la rama de pasos opcionales se resuelve antes que la de repeticiones manuales. Su botón llama directamente a `advanceStep`, sin pasar por `terminarReps`, que es lo que suma las repeticiones y marca el paso como realizado. No estoy diciendo que desaparezca toda la sesión: el fallo es la contabilidad de esos pasos. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/MoveSessionV1.jsx)
Arreglo recomendado: separar claramente:

* Hecho / siguiente: confirma las repeticiones manuales.
* Saltar este ejercicio: avanza sin acreditarlas.

Que un ejercicio sea opcional debe permitir omitirlo, no impedir registrar que lo has realizado.
Prueba: con Auto apagado, completar ambos ejercicios debe sumar 16 repeticiones; saltarlos debe sumar cero. El catálogo define precisamente esos dos pasos como opcionales y de ocho repeticiones cada uno. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/move.data.js)
4. Hay instrucciones de colocación escritas que el recorrido nunca enseña
Prioridad: alta cuando oculta requisitos del apoyo · Deducido del código.
Dónde: `app/move/MoveSessionV1.support.jsx`, `v1StepSetup`; `app/move/MoveSessionV1.jsx`, selección de `cueText`.
No falta redactar estos textos: existen, pero determinadas reglas impiden mostrarlos.
Caso A: Core silencioso
La colocación del primer ejercicio dice:
«Silla sin ruedas. Atrás del todo, espalda apoyada, manos en el asiento».
Sin embargo, el primer paso es `timed`, no declara una colocación explícita y tiene índice cero. `v1StepSetup` devuelve `none`: entra directamente en trabajo. Como la instrucción `setup` solo se muestra durante `place`, esa frase no llega a enseñarse en el recorrido normal. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/MoveSessionV1.support.jsx)
Caso B: Empuje · progresión
Después del descanso llega Pica en escritorio, un ejercicio distinto de las flexiones anteriores.
Su colocación explica acercar los pies y subir la cadera para formar una V invertida. Pero la regla excluye la colocación automática de los pasos de repeticiones que vienen después de un descanso. Por eso puede empezar la cuenta mostrando directamente la acción, sin haber mostrado esa preparación. Ambos casos están presentes en los datos actuales. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/move.data.js)
Qué ve la persona: comienza un ejercicio sin recibir toda la información que habéis preparado para hacerlo. La preparación general tampoco lo compensa: su texto se calcula a partir de la postura y del número de pasos, no de la colocación específica. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ui/SessionPrep.jsx)
Arreglo recomendado: no usar «viene después de un descanso» como sinónimo de «ya sabe colocarse». Distinguir entre:

* Otra serie del mismo ejercicio, manteniendo la colocación.
* Un ejercicio nuevo o un cambio de apoyo, que debe enseñar su preparación.

Prueba: comprobar el texto visible, no solo que exista en los datos o en elementos ocultos de reserva. Debe verse «Silla sin ruedas…» antes de iniciar Core silencioso y la colocación de la pica antes de su primera repetición.
Qué dicen las pruebas existentes
He leído `runner-auto.spec.js`: comprueba que las cuentas esperen y que encender Auto permita continuar, pero no comprueba cuánto se acredita durante la espera, el cambio de Auto estando pausado ni las repeticiones opcionales manuales. Son combinaciones que conviene añadir, no una razón para descartar las pruebas actuales. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/tests/runner-auto.spec.js)
Yo corregiría primero las colocaciones que no se enseñan y el avance estando pausado; después, la espera que infla minutos y las repeticiones opcionales. Son cuatro problemas concretos del uso cotidiano, sin volver a los fallos de pagos ni al aro a trompicones.
