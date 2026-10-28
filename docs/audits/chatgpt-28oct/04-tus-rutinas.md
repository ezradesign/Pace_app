# Revisión 4 de ChatGPT (28 oct. 2026): «Tus rutinas»: el constructor, la vista previa y la sesión

> Texto tal cual lo pegó Ez. ChatGPT leyó `main` en `c702a11`, sin ejecutar la app. Lo que comprobó la
> coordinadora contra el código de la 0.185.0, con sus códigos (C1-C6), está en `LEEME.md` de esta
> carpeta y en el relevo (`docs/traspaso/relevo-coordinadora-22oct.md`, bloque «28 oct., ~20:10»).

---

He seguido por **«Tus rutinas» y sus conexiones con las bibliotecas, la vista previa y la sesión**. Es una parte especialmente importante: si la personalización es uno de los motivos para pagar, tiene que resultar más fiable y comprensible que el recorrido básico.

**Base revisada:** `main` continúa en `c702a11`. Solo he leído código; no he ejecutado la app ni las pruebas. Distingo lo deducible del código de lo que necesita reproducción visual. No entro en Caminos ni repito la pérdida de borradores o las tarjetas sin acceso por teclado. [Source](https://api.github.com/repos/ezradesign/Pace_app/commits/main)

## Resumen

| Hallazgo | Prioridad | Certeza |
|---|---|---|
| 1. Desde Estira, el constructor queda detrás de la biblioteca | Alta | Deducido; comprobar aspecto e interacción |
| 2. La duración cambia entre el constructor, la tarjeta y la vista previa | Media | Deducido con un caso calculable |
| 3. Algunas rutinas propias ocultan material necesario | Alta cuando afecta al apoyo; media en el resto | Datos incorrectos confirmados |
| 4. Personalizar un ejercicio hace perder sus instrucciones completas | Alta en ejercicios que necesitan preparación | Deducido |
| 5. «Zancada con apertura» pierde la traducción en inglés | Media | Claves ausentes y ruta de respaldo identificadas |
| 6. Guardar puede fallar sin dar ninguna explicación | Media | Deducido; reproducir con dos pestañas |

---

## 1. Desde Estira, el constructor queda detrás de la biblioteca

**Ubicación:**  
`app/main.jsx` → montaje de `MoveLibrary`, `CustomBuilder` y `ExtraLibrary`.  
`app/extra/ExtraModule.jsx` → `ExtraLibrary`.

Mueve recibe `enPausa={!!customBuilder}`, pero Estira no. Además, `ExtraLibrary` se monta **después** de `CustomBuilder`. Por tanto, abrir el constructor desde Estira deja su biblioteca visible, mientras que hacerlo desde Mueve la oculta correctamente. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/main.jsx)

### Secuencia concreta
1. Abres **Estira**.
2. Entras en **Tus rutinas**.
3. Pulsas crear o editar una rutina.
4. El constructor se abre, pero Estira no se esconde.

Los dos usan el mismo `Modal`, con `zIndex: 100`. Al estar Estira después en el árbol, su capa puede tapar el constructor. El sistema de diálogos mueve el foco y administra Escape, pero **no modifica el orden visual de las capas**. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ui/Primitives.jsx) [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ui/Dialogo.jsx)

**Qué puede ver la persona:** parece que Crear no funciona, o ve la biblioteca mientras el teclado está actuando sobre el constructor que hay detrás.

**Arreglo:** pasar `enPausa` también a `ExtraLibrary` y reenviarlo a `LibraryShell`, igual que hace Mueve. No basta con añadirlo únicamente en `main.jsx`: Estira actualmente no lo recoge. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/extra/ExtraModule.jsx)

**Prueba de aceptación:** desde ambas bibliotecas, crear y editar deben mostrar únicamente el constructor; al cancelar o guardar, debe volver la misma biblioteca y conservarse la vista «Tus rutinas».

---

## 2. La duración prometida cambia durante el recorrido

**Ubicación:**  
`app/state-custom.jsx` → `customSegundos`.  
`app/custom/CustomRoutines.jsx` → `CustomRoutineCard`.  
`app/ui/RoutinePreview.jsx` → cálculo de `durLabel`.

El constructor y la tarjeta calculan los minutos con `customSegundos`: suma trabajo y cambios de lado, pero no la preparación ni las colocaciones entre pasos. La tarjeta utiliza explícitamente ese cálculo. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/custom/CustomRoutines.jsx)

La vista previa utiliza `estimateDuration`, que sí añade esos tiempos. Es decir: **hay dos respuestas distintas a «cuánto dura mi rutina»**. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/ui/RoutinePreview.jsx)

### Caso concreto
Una rutina propia con **12 pasos de 40 segundos**, ninguno por lados:

- Constructor y tarjeta: `12 × 40 = 480 s` → **8 min**.
- Vista previa: añade 5 s iniciales y 5 s de colocación para cada paso posterior al primero.
- Total previsto: `480 + 5 + 11 × 5 = 540 s` → **9 min**.

Esto sale directamente de las reglas de `estimateDuration` y `v1StepSetup`. No incluye esperas voluntarias ni pausas de la persona. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/MoveSessionV1.support.jsx)

**Qué ve la persona:** prepara una rutina de ocho minutos y, justo antes de empezar, PACE dice nueve. No es grave por el minuto: es una pequeña pérdida de confianza.

**Arreglo:** una sola estimación sobre la rutina ya preparada para el motor. Si quieres enseñar ambos conceptos, nombrarlos: **«8 min de ejercicios · 9 min con cambios»**.

**Prueba:** comparar constructor, tarjeta y vista previa con uno y doce pasos, ejercicios por lados y descansos. Deben compartir la misma promesa o explicar claramente la diferencia.

---

## 3. Algunos ejercicios ocultan material necesario

**Ubicación:**  
`app/custom/exercise-registry.js` → `EXERCISE_PIDE`.

He encontrado estos casos concretos:

| Ejercicio | Lo que pide el movimiento o su texto | Lo que declara el registro |
|---|---|---|
| Apertura con banda | Una banda | Solo «de pie»; no declara banda |
| Piernas elevadas sentado | Un asiento; la versión del catálogo especifica silla sin ruedas | Solo «sentado»; no declara silla |
| Extensión torácica | Un respaldo sobre el que apoyarse | Solo «sentado»; no declara silla |
| Elevación de puntas | El propio texto indica «contra pared» | Declara mesa opcional, no pared |

Estas filas existen, por lo que **no se activa el aviso de requisitos desconocidos**: el sistema las interpreta como información completa. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/custom/exercise-registry.js)

### Secuencia concreta
Creas una rutina que contiene únicamente **Apertura con banda**, la guardas y abres la vista previa.

**Qué ve la persona:** el apartado de necesidades puede decir que no necesita material, aunque el primer ejercicio exige una banda.

**Arreglo:**
- Corregir los requisitos.
- Distinguir un asiento genérico de una **silla estable sin ruedas** cuando el movimiento lo exige.
- Añadir una comprobación que no se limite a «todos tienen fila»: también debe contrastar los requisitos de ejercicios conocidos.

**Prueba:** crear una rutina individual para cada caso y comprobar el material visible antes de empezar. Para «Piernas elevadas sentado», verificar además que la condición del apoyo no desaparece.

---

## 4. Al personalizar, se pierden las instrucciones completas del ejercicio

**Ubicación:**  
`app/custom/CustomBuilder.jsx` → `addStep`.  
`app/move/MoveModule.jsx` → `moveRutinaGuiada`.

El constructor copia únicamente `{ name, dur, cue }`. Después, `moveRutinaGuiada` añade modo, nombre actualizado y requisitos, pero **no incorpora la colocación, la ejecución y el cuidado que sí existen en las rutinas del catálogo**. [Source](https://cdn.jsdelivr.net/gh/ezradesign/Pace_app@c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/MoveModule.jsx)

### Caso concreto: Fondos en silla

En el catálogo:
- Se especifica silla sin ruedas y contra la pared.
- Se explica cómo sacar la cadera del asiento.
- Se da una referencia para limitar la bajada y facilitar el ejercicio.

En el constructor, el ejercicio queda reducido a:

> «Baja con control, codos atrás».

La diferencia está en los datos, no es una suposición sobre cómo se mostrará. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/move/move.data.js)

**Qué ve la persona:** el mismo ejercicio resulta mejor explicado dentro de una rutina preparada que dentro de la rutina por la que está pagando para personalizar.

**Arreglo recomendado:** una ficha canónica por ejercicio con:
- colocación;
- acción;
- cuidado;
- requisitos;
- versión más sencilla.

La rutina personal debería guardar principalmente **qué ejercicio eliges y qué dosis quieres**, no una copia incompleta de sus instrucciones.

**Prueba:** abrir Fondos en silla y Remo con banda desde el catálogo y desde una rutina propia. La preparación esencial y los cuidados deben mantenerse, aunque cambien los tiempos o las series.

**Importante:** no propongo quitar ejercicios avanzados. Propongo que el catálogo libre conserve el mismo nivel de explicación que el recorrido recomendado.

---

## 5. «Zancada con apertura» aparece sin traducir en inglés

**Ubicación:**  
`app/i18n/content/custom.js`.

El registro actual utiliza `Zancada con apertura`. Sin embargo, las traducciones de ese ejercicio siguen bajo las claves antiguas:

- `custom.ex.World's greatest stretch.name`
- `custom.ex.World's greatest stretch.cue`

Faltan las equivalentes con el nombre canónico actual. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/i18n/content/custom.js)

### Secuencia concreta
1. Cambias PACE a inglés.
2. Abres el selector de ejercicios.
3. Añades **Zancada con apertura**.
4. Inicias la rutina.

El selector busca la traducción por el nombre actual y, si no la encuentra, conserva el español. La sesión sigue el mismo criterio para las rutinas propias.

**Qué ve la persona:** nombre e indicación en castellano dentro de una experiencia en inglés.

**Arreglo:** añadir las claves actuales, conservando las antiguas para compatibilidad.

**Prueba:** recorrer todos los ejercicios de `EXERCISE_REGISTRY` y exigir traducción de nombre e indicación con su nombre vigente. Después, probar también rutinas antiguas con alias. Una comprobación automática aquí evitaría futuras regresiones por renombrados.

---

## 6. «Guardar» puede fallar sin explicar por qué

**Ubicación:**  
`app/custom/CustomBuilder.jsx` → `save`.  
`app/state-custom.jsx` → `addCustomRoutine` y `updateCustomRoutine`.

Las funciones de guardado devuelven `null` cuando se alcanza el límite de rutinas o cuando ya no existe la rutina que se estaba editando. El constructor únicamente hace:

> Si se guarda correctamente, cerrar.

No hay una respuesta visible para el caso contrario. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/state-custom.jsx)

### Secuencia concreta
1. Tienes nueve rutinas.
2. En la pestaña A abres el constructor para crear otra.
3. En la pestaña B creas la décima.
4. La pestaña A recibe el estado actualizado.
5. Pulsas Guardar en A.

PACE ya sincroniza el estado entre pestañas, por lo que este cambio puede llegar mientras el editor permanece abierto. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/state-core.pestanas.js)

**Qué ve la persona:** Guardar parece no hacer nada. Lo mismo puede ocurrir si otra pestaña elimina la rutina que está editando.

El borrador no desaparece inmediatamente, pero la persona no sabe qué ha ocurrido ni cómo salir sin perderlo. El botón sigue habilitado porque `canSave` comprueba nombre y pasos, no esos conflictos. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/c702a11b5773dd8a6a9e96e0fd2dddd1478c9899/app/custom/CustomBuilder.jsx)

**Arreglo:** devolver un resultado con motivo y ofrecer una salida:
- «Ya tienes diez rutinas. Tu borrador sigue aquí».
- «Esta rutina se ha eliminado en otra pestaña. Puedes guardarla como nueva».

**Prueba:** dos pestañas, tanto al alcanzar el límite como al eliminar una rutina que está en edición. Ningún intento de guardar debe quedar sin respuesta.

---

## Qué priorizaría

**Antes de añadir más contenido Premium:**

1. Arreglar la entrada al constructor desde Estira.
2. Corregir requisitos y conservar instrucciones completas.
3. Unificar la duración en todo el recorrido.
4. Añadir respuestas claras cuando guardar falla.
5. Automatizar la cobertura de traducciones del registro.

**Mi conclusión de producto:** no veo aquí una necesidad inmediata de inventar más funciones de pago. Veo una función valiosa —crear tus propias pausas— cuya ejecución todavía no mantiene toda la calidad del catálogo preparado.

La promesa debería ser: **«Elige tus ejercicios y PACE se encarga de explicarlos y guiarte bien»**. Ahora eliges los ejercicios, pero parte de esa guía se pierde por el camino. Pulir eso aporta más valor real que sumar otras diez rutinas.
