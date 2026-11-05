# Revisión de ChatGPT del 5 nov. 2026: cambiar de idea a mitad de una sesión (7903bbb8)

Ez: «para guardar y revisar en la siguiente sesión». Comprobado leyendo el código, sin reproducirlo. Se monta solo con el sí de Ez.

| # | Punto | Veredicto |
|---|---|---|
| 1 | Encender «Auto» da la serie por hecha | **Cierto.** Sin «Auto» el reloj sigue (`MoveSessionV1.jsx:232`) y al encenderlo `:252` compara ese tiempo con el objetivo. Da por hechas repeticiones que nadie confirmó |
| 2 | «Tus rutinas» vacía el catálogo al ensanchar | **Cierto.** `LibraryShell.jsx:249` cambia el catálogo por un bloque que `library.css.jsx:326` oculta en escritorio. Solo pasa al cambiar el tamaño de la ventana |
| 3 | Repetir una serie descuadra el cierre | **Cierto.** Las repeticiones suman (`:180`) y las series cuentan pasos únicos (`v1DoneStats`). Hay que decidir qué se cuenta |
| 4 | Lo que explica «Auto» | Es de producto, con una página para Ez |

Sí. He seguido por las sesiones de Mueve y Estira y la navegación por sus bibliotecas, centrándome en lo que pasa cuando la persona cambia de idea: desactiva «Auto», vuelve atrás o cambia el tamaño de la pantalla.
Esta tanda contiene dos fallos concretos, una incoherencia de recuento y una mejora de comprensión. Es revisión de código, no una prueba ejecutada en Android. El último commit consultado de `main` es `7903bbb8`, del 5 de noviembre. [Fuente](https://api.github.com/repos/ezradesign/Pace_app/commits/main)
1. Activar «Auto» puede terminar una serie inmediatamente
Prioridad: alta · Se deduce del código; falta reproducirlo en pantalla.
Dónde: `app/move/MoveSessionV1.jsx`, temporizador de trabajo, efecto de avance y botón `AutoV1`.
Secuencia concreta:

1. Empiezo un paso de ocho repeticiones, con cuatro segundos por repetición.
2. Desactivo «Auto» para hacerlo a mi ritmo.
3. Paso 40 segundos en ese ejercicio.
4. Activo «Auto» para que PACE vuelva a guiarme.

Qué sucede: sin «Auto», `elapsed` sigue aumentando, aunque la pantalla enseña el objetivo de repeticiones. Al encenderlo, el efecto compara esos 40 segundos con los 32 segundos del objetivo y da la serie por terminada inmediatamente, sumando las ocho repeticiones. No distingue el tiempo libre del tiempo guiado. [Fuente](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/app/move/MoveSessionV1.jsx)
Qué siente la persona: «Solo quería volver a activar la guía; no decir que ya había acabado».
Arreglo recomendado: separar el tiempo de práctica del contador de cadencia. Al activar «Auto» dentro de una serie manual, empezar la guía desde un punto definido, sin convertir retroactivamente el tiempo transcurrido en repeticiones.
Prueba: ocho repeticiones × cuatro segundos; permanecer 40 segundos sin «Auto» y activarlo. No debe cambiar de paso ni acreditar automáticamente ocho repeticiones.
2. «Tus rutinas» puede dejar vacío el catálogo al pasar a pantalla ancha
Prioridad: media · Se deduce del JSX y del CSS.
Dónde: `app/ui/LibraryShell.jsx`, estado `vista` y rama `vista === 'tuyas'`; `app/ui/library.css.jsx`, reglas de escritorio.
Secuencia concreta:

1. Abro Mueve en una ventana estrecha.
2. Entro en «Tus rutinas».
3. Ensancho la ventana hasta que aparece la disposición de escritorio, sin cerrar la biblioteca.

Qué sucede: `vista` continúa siendo `'tuyas'`. Esa rama sustituye el catálogo por un bloque con clase `.pace-lib-solo-movil`; al llegar a escritorio, ese bloque se oculta. Además, el enlace de cabecera para volver también se oculta. La columna principal queda sin catálogo, aunque las rutinas propias sigan disponibles en el lateral. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/LibraryShell.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/ui/library.css.jsx)
Qué siente la persona: «Han desaparecido las rutinas y no encuentro cómo volver».
Arreglo recomendado: que en escritorio el catálogo se pinte siempre, independientemente de la subvista móvil. No hace falta reiniciar toda la biblioteca ni borrar sus filtros.
Prueba: abrir «Tus rutinas» a 600 px, ampliar a 1.000 px y volver a estrechar. En cada tamaño debe quedar contenido visible y una navegación comprensible.
3. Repetir una serie con «Anterior» descoordina las cifras del cierre
Prioridad: media · Incoherencia deducida del código; conviene fijar primero qué queremos contar.
Dónde: `MoveSessionV1.jsx`, `startStep`, botón anterior y `repsGuidedRef`; `MoveSessionV1.support.jsx`, `v1DoneStats`.
Secuencia concreta:

1. Completo una serie de ocho repeticiones.
2. Llego al descanso y pulso «Anterior».
3. Repito esa serie entera.
4. Termino el resto de la rutina.

Qué sucede: las repeticiones se acumulan cada vez que completo la serie, pero las series del cierre se calculan contando índices únicos en `hechosRef`. Por tanto, repetir un mismo paso añade otras ocho repeticiones sin añadir otra serie al recuento. El cierre mezcla ejecuciones reales con pasos únicos del plan. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/main/app/move/MoveSessionV1.support.jsx)
Qué siente la persona: «He hecho una serie más, pero la app solo parece reconocer sus repeticiones».
Arreglo recomendado: separar:

* Pasos del plan completados, para decidir si terminé la rutina.
* Series realizadas, para describir lo que hice, incluidas las repeticiones voluntarias.

Prueba: comparar una ejecución normal con otra que repite una serie. La segunda debe reflejar una serie adicional y sus repeticiones, sin duplicar la sesión.
4. «Auto» cambia más cosas de las que explica su nombre
Prioridad: media · Mejora de producto, no fallo técnico.
Ahora mismo el interruptor cambia dos comportamientos distintos: si las fases avanzan solas y si las repeticiones tienen cadencia guiada. Además, la elección se guarda en `cuerpoAuto`, por lo que afecta a las sesiones posteriores.
Mi lectura como usuario: puedo apagarlo pensando «quiero decidir cuándo pasar al siguiente ejercicio» y encontrarme también sin guía de repeticiones. En la siguiente rutina puedo no recordar que lo dejé así.
No añadiría otro ajuste todavía. Primero haría explícita la consecuencia junto al control:

* Auto activado: «PACE marca el ritmo y pasa al siguiente paso».
* Auto desactivado: «Hazlo a tu ritmo y pulsa › para continuar».

Y, al empezar otra sesión con «Auto» desactivado, mostraría una indicación breve: «A tu ritmo · tú decides cuándo seguir». Sin modal ni confirmación obligatoria.
Qué corregiría primero

1. La transición de manual a Auto: un ajuste no debería dar por hecho ejercicio que la persona no ha confirmado.
2. El catálogo vacío al ensanchar la ventana: es un callejón sin salida visible.
3. El significado de las cifras al repetir series.
4. La explicación de Auto.

La conclusión de esta tanda: merece la pena probar PACE no solo siguiendo la rutina correctamente, sino cambiando decisiones a mitad. Es ahí donde aparecen diferencias entre lo que la persona cree haber pedido y lo que la app interpreta.
