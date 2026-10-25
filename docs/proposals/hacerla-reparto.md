# «Hacerla»: qué ejercicios entran en el reparto

22 oct. 2026, rama `claude/maqueta-inicio-3a2a59`, sobre v0.174.6. Solo lectura: no cambia nada de la app.

> **Desde v0.176.0** (Ez, 23 oct.: 2A) el reparto son **27**, rehechos con las capas en
> `app/state-ritmo.hacerla.jsx`, con el mismo filtro y además sin pared ni silla. Salen cuatro: la
> elevación de puntas (su texto pide pared), el isquio (pide silla), la sentadilla de cuádriceps y los
> escalenos (ya no están en una rutina junto a la mesa). Lo que era estirar pasó a Estira, así que
> Mueve deja tres (talones, flexiones y glúteos), espaciados.
>
> **Desde v0.175.2** (Ez, 23 oct.: 1A) tres de los 31 se llaman de otra forma y los puestos no cambian:
> «Palmas al suelo» es «Palmas en la mesa», «Círculos de hombro» es «Círculos de brazos» (8 veces, 4 y 4)
> e «Inclinación lateral» es «Inclinación de cuello». También van por veces «Rotación lenta» (3 por lado) y
> «Círculos de muñeca» (4 por sentido). Las tablas de abajo son las del 22 oct.

**De dónde sale.** El mismo filtro «junto a la mesa» que ya usa A tu ritmo para sus pausas (`cabe` en
`ritmoPozos`, `app/state-ritmo.jsx`): fuera la rutina que pide suelo (`requiresFloor`), la que lleva aviso
de seguridad y la que pide material que no sea opcional; la mesa sí cuenta (Ez, 15 oct.), y la pared
también pasa ese filtro, por eso aquí se marca aparte. Un ejercicio es un paso de esas rutinas, sin los
descansos, y las series repetidas cuentan una vez. Cada uno se ha leído entero (colocación, acción y
cuidado) y se ha mirado su dibujo. Los ids van cruzados: Mueve son los `extra.*` y Estira los `move.*`.

## En corto

- Pasan el filtro **17 rutinas** (9 de Mueve y 8 de Estira) con **36 ejercicios distintos**. Nueve salen
  en los dos módulos.
- Marco **17**: **5 fuera**, porque piden pared, barra, banda o una silla sin ruedas, y **12 que entran con
  una nota** (casi siempre, un dibujo que no casa con el texto).
- Quedan **31** ejercicios para el reparto. Todos son de rutinas gratuitas: los dos de pago que pasaban el
  filtro («Hueco en silla» y «Silla en la pared») están entre los que salen.

## Fuera (recomendado)

| Ejercicio | Dónde sale | Por qué |
|---|---|---|
| Silla en la pared | Mueve · Sentadilla en pared (de pago) | Pide pared: texto, dibujo y «Estoy listo». |
| Deslizamientos en pared | Mueve · Espalda de oficina; Estira · Hombros | El título y el dibujo son la pared. En Mueve dice «sin pared, hazlo en el aire», pero en Estira no. |
| Suspensión pasiva · opcional | Estira · Hombros | Pide una barra, y la alternativa («repite las wall slides») depende del paso anterior. |
| Apertura con banda | Mueve · Espalda de oficina; Estira · Hombros y Hombros · círculos | El título y el dibujo llevan banda. El texto ofrece hacerlo sin ella, pero la invitación diría «con banda». |
| Hueco en silla | Mueve · Core silencioso (de pago) | Pide «silla sin ruedas o frenada», y la de trabajo suele tener ruedas. |

## Entran, con una nota

En «Hacerla» se ve el dibujo del módulo y no el del ejercicio, así que un dibujo que no casa no llega a
quien la hace. Pero sí se ve dentro de su rutina.

| Ejercicio | Qué no casa | ¿Se nota en «Hacerla»? |
|---|---|---|
| Palmas al suelo | El nombre dice «suelo», pero las palmas van en la mesa. | Sí: es el título. |
| Sentadilla de cuádriceps | Dibujo de rodillas en el suelo; el texto es de pie, agarrado a la mesa con las dos manos. Necesita una mesa firme. | Solo lo de la mesa. |
| Flexiones inclinadas | Necesita una mesa firme (la mesa cuenta, pero no una con ruedas o ligera). | Sí, si la mesa no aguanta. |
| Apertura de pecho | Dibujo sentado en el suelo con las piernas cruzadas; el texto vale en la silla o de pie. | No. |
| Inclinación lateral | Dibujo sentado en el suelo con las piernas cruzadas; el texto dice «siéntate erguido». | No. |
| Escalenos | Dibujo sentado en el suelo con las piernas cruzadas; el texto dice «siéntate sobre una mano». | No. |
| Elevación de puntas | Dibujo de espaldas a la pared; el texto deja elegir «pared o manos en la mesa». | No. |
| Zancada profunda | En el dibujo, la rodilla de atrás casi toca el suelo; el texto dice «sin apoyar la rodilla». | No. |
| Rodar hacia abajo | En el dibujo, una mano llega al suelo (de pie, sin tumbarse). | No. |
| Sentadilla profunda | En el dibujo, las manos tocan el suelo (en cuclillas, sin tumbarse). | No. |
| Apretar glúteos | Dibujo de pie; el texto dice «sentado». | No. |
| Rotación torácica de pie | No tiene dibujo propio ni su fila en el registro de ejercicios. El texto está bien. | No. |

## Los 31 que entran

«Dura» es lo que tarda en la app: las repeticiones al ritmo de la rutina y, si es por lados, los dos lados
más el cambio. Se toma siempre la **primera serie** de la rutina indicada.

**Mueve (11)**

| Ejercicio | Rutina | Cuánto | Dura | Nota |
|---|---|---|---|---|
| Flexiones inclinadas | Flexiones de escritorio | 12 veces | 48 s | mesa firme |
| Elevación de talones | Gemelos subrepticios | 25 veces | 50 s | |
| Abrir y cerrar el puño | Grip + antebrazos | 20 veces | 40 s | |
| Extensión de dedos | Grip + antebrazos | 10 veces | 20 s | |
| Estiramiento de muñeca | Grip + antebrazos | 20 s por lado | 45 s | |
| Apretar glúteos | Glúteos invisibles | 20 veces | 40 s | dibujo de pie |
| Elevación de puntas | Piernas de pie | 12 veces | 48 s | dibujo con pared |
| Sentadilla de cuádriceps | Piernas de pie | 8 veces | 32 s | mesa firme; dibujo en el suelo |
| Juntar omóplatos | Espalda de oficina | 12 veces | 48 s | |
| Extensión torácica | Postura reset | 30 s | 30 s | |
| Apertura de pecho sentado | Postura reset | 30 s | 30 s | |

**Estira (20)**

| Ejercicio | Rutina | Cuánto | Dura | Nota |
|---|---|---|---|---|
| Barbilla atrás | Cuello | 5 veces | 40 s | |
| Inclinación lateral | Cuello | 25 s por lado | 60 s | dibujo en el suelo |
| Rotación lenta | Cuello | 25 s por lado | 60 s | |
| Escalenos | Cuello | 20 s por lado | 50 s | dibujo en el suelo |
| Encogimiento de hombros | Escritorio express | 20 s | 20 s | |
| Círculos de muñeca | Escritorio express | 20 s | 20 s | |
| Giro sentado | Escritorio express | 20 s | 20 s | |
| Círculos de tobillo | Escritorio express | 20 s | 20 s | |
| Palmas al suelo | Muñecas y manos | 40 s | 40 s | el nombre dice suelo |
| Rezo invertido | Muñecas y manos | 40 s | 40 s | |
| Rotación externa | Hombros | 50 s | 50 s | |
| Círculos de hombro | Hombros · círculos | 60 s | 60 s | |
| Apertura de pecho | Hombros · círculos | 50 s | 50 s | dibujo en el suelo |
| Rodar hacia abajo | Espalda de pie | 40 s | 40 s | mano al suelo en el dibujo |
| Rotación torácica de pie | Espalda de pie | 20 s por lado | 48 s | sin dibujo ni registro |
| Sentadilla profunda | Caderas de pie | 50 s | 50 s | manos al suelo en el dibujo |
| Sentadilla lateral | Caderas de pie | 30 s por lado | 68 s | |
| Zancada profunda | Caderas de pie | 30 s por lado | 68 s | rodilla casi al suelo en el dibujo |
| Pliegue adelante | Caderas de pie | 35 s | 35 s | |
| Isquio a una pierna | Cadena posterior de pie | 35 s por lado | 78 s | |

Van de 20 s a 78 s; la mitad, entre 40 y 50 s.

## Para montarlo

1. **Siempre la primera serie.** Las siguientes hablan de lo anterior y fuera de la rutina no se entienden:
   «Últimas», «Más lentas ahora», «Segunda tanda», «Si la primera serie costó», «Ahora aguanta», «Cierra
   subiendo los talones».
2. **Catorce no tienen colocación**, solo acción y cuidado (por ejemplo, «Círculos de muñeca» o «Pliegue
   adelante»). Se entienden igual, y la vista de «Hacerla» no puede dar por hecho que hay colocación.
3. **Nueve ejercicios salen en los dos módulos**, y el dibujo del módulo tiene que ser siempre el mismo
   para cada uno. Propuesta: va al módulo donde sale en más rutinas y, si empata, a Mueve, que tiene menos.
   Con esa regla quedan 11 y 20, que es la lista de arriba.
4. **Corrección a la maqueta de la pregunta 5:** «Elevación de talones» dura 50 s (25 veces a 2 s) y no
   30 s; los 30 s eran la cifra de reserva del dato. Solo afecta a la opción C de 5a, que no es la recomendada.
5. El filtro de A tu ritmo deja pasar la pared (`wall`) con nivel accesible. Para «Hacerla» hace falta un
   filtro propio, o quitar a mano los cinco de arriba.

## Fuera de esto (para otra vez)

Cuatro dibujos no casan con su texto **dentro de sus propias rutinas**. «Apertura de pecho», «Inclinación
lateral» y «Escalenos» salen sentados en el suelo con las piernas cruzadas en rutinas de silla, y
«Sentadilla de cuádriceps» sale de rodillas en una rutina de pie. Además, «Rotación torácica de pie» no
tiene dibujo propio. Esto no afecta a «Hacerla», y no lo he tocado.
