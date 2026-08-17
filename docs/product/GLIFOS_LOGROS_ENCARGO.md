# Encargo de arte · los 38 glifos de LOGRO que faltan

**Calculado del árbol en s164 (v0.94.0).** Catálogo: **96 logros** · con arte:
**58** · **sin arte: 38**.

> Cómo se sacó: cargando `catalog.js` y `achievement-masks.js` —cada uno en su
> propia IIFE, como en el artefacto— y cruzando catálogo contra arte existente.
> Los 38 coinciden con lo que decía `STATE.md`.

---

## 1 · Especificación para el generador

El arte de logro **no entra como imagen: entra como MÁSCARA CSS**. La forma la
pone el dibujo y **el color lo pone la app** (el token de su categoría si está
conseguido, gris si está bloqueado). Eso fija lo que hay que pedir:

| Qué | Cómo |
|---|---|
| **Formato** | PNG cuadrado, cuanto más grande mejor (el arte actual es 2880×2880). La transparencia no hace falta. |
| **Tinta** | **Negra o muy oscura sobre papel blanco o casi blanco.** Sin color: se descarta. La ingesta normaliza por el píxel más oscuro de cada pieza, así que una tinta pálida se levanta sola — pero el contraste ayuda. |
| **Motivo** | **Uno solo, centrado, con margen generoso.** Nada de escenas ni de composiciones con varios elementos sueltos. |
| **Estilo** | Line art / grabado, trazo de peso constante, aire de *ex-libris* o sello artesanal. Sin degradados, sombras, 3D ni brillos. |
| **Texto** | **Ninguno.** Ni letras, ni números, ni firmas. |
| **Marco** | No hace falta. Si viene enmarcado, el script lo detecta y lo quita — pero es más simple sin él. |
| **EL LÍMITE QUE MANDA** | **Se ve a 56 px.** El sello final mide 56 px CSS (la máscara son 224). Un tramado fino, una línea de 1 px del original o un detalle pequeño **desaparecen**. Pocos trazos, gruesos y separados. |
| **Nombre del archivo** | El **id** del logro: `hydrate.week.perfect.png`, `streak.7.png`… Así la fila del mapeo es mecánica. |

**Tono, del propio `CLAUDE.md`:** calmado, artesanal, cuidado. Nada de
gamificación agresiva — así que **ni copas, ni trofeos, ni medallas, ni estrellas
de puntuación, ni pulgares**. Imaginería natural y de oficio, que es la que ya
tiene el set de 58.

**Cuando lleguen los PNG**: los meto yo. Se re-corre
`node scripts/ingest-glifos-logro.js` (regla D-4: el arte se mide una vez, nunca
se retoca un `.webp` a mano) y se revisa con `node scripts/audit/revision-glifos.js`,
que pinta cada sello **con el mecanismo real** —máscara sobre el token, con su
borde y su anillo de categoría— a tamaño y a 3×.

---

## 2 · Prioridad 1 · el que perdió su dibujo a propósito

| id | Título | Qué premia | Hoy | Sugerencia |
|---|---|---|---|---|
| `hydrate.week.perfect` | Semana hidratada | 8 vasos, 7 días | carácter `◌` | **Una jarra o cántaro de barro con siete marcas de nivel** en el costado. Se le quitó su dibujo en s147 porque llevaba un pincel de caligrafía, que no dice nada de agua. Alternativa: una gota grande con seis gotas menores en arco. |

---

## 3 · Constancia (3)

| id | Título | Qué premia | Hoy | Sugerencia |
|---|---|---|---|---|
| `streak.7` | *(ver nota de nombre abajo)* | 7 días seguidos | SVG heráldico | **Siete espigas de trigo atadas en un haz.** Encaja con la vaca y el pacer; siete tallos contables de un vistazo. |
| `streak.14` | Quince días | 14 días seguidos | carácter `XIV` | **Dos haces de siete cruzados**, o una luna en cuarto creciente con catorce muescas en el borde. Debe leerse como «el doble del anterior». |
| `breathe.sessions.50` | 50 respiraciones | sesiones acumuladas | SVG heráldico | **Un fuelle de herrero**, o un abanico de cinco pliegues abierto. Aire acumulado, no aire soplando. |

---

## 4 · Exploración (10) · «tres sesiones de…»

Son diez hermanas y **se ven juntas en la rejilla**, así que conviene que
compartan familia visual: mismo peso de trazo y motivos del mismo tamaño óptico.

| id | Título | Qué premia | Hoy | Sugerencia |
|---|---|---|---|---|
| `explore.box` | Box asentada | 3 × Box 4·4·4·4 | SVG | **Un cuadrado de esquinas redondeadas con un punto en cada lado**: los cuatro tiempos iguales. |
| `explore.rounds` | Rondas | 3 sesiones en rondas | SVG | **Tres anillos concéntricos con un corte** en el más externo: rondas que se cierran. |
| `explore.kapalabhati` | Kapalabhati | 3 × el kriya | carácter `✦` | **Una llama corta con tres chispas ascendentes** (limpieza, calor, exhalación rápida). |
| `explore.shoulders` | Hombros resetados | 3 sesiones de hombros | carácter `⌢` | **Un yugo de madera** —la pieza que descansa sobre los hombros— visto de frente. |
| `explore.atg` | ATG asentado | 3 sesiones en rango profundo | SVG | **Una rodilla flexionada de perfil, geometrizada**: dos segmentos y un arco cerrado. |
| `explore.ancestral` | Ancestral | 3 sesiones ancestrales | SVG | **Una huella de pie descalzo.** |
| `explore.neck` | Cuello atendido | 3 sesiones de cuello | carácter `~` | **Tres vértebras cervicales apiladas**, muy simplificadas, con una curva suave. |
| `explore.desk` | Escritorio express | 3 sesiones sin levantarse | carácter `⊡` | **Una mesa de escritorio de perfil con su silla**: dos trazos y un plano. |
| `explore.all.move` | Cuerpo de campo | todas las movilidades | carácter `✤` | **Una brújula de cuatro puntas con hojas** en lugar de flechas: moverse en todas las direcciones. |
| `explore.all.extra` | Fuerte en la oficina | todos los Estira | carácter `⚔` | **Una piedra de amolar con mango**, o un yunque pequeño. **Nada de espadas** — hoy es `⚔`, que choca de frente con el tono. |

---

## 5 · Maestría (12) · el escalón alto de cada familia

Deben leerse como «la versión mayor» de su exploración: **el mismo motivo con un
elemento más**, no un dibujo distinto.

| id | Título | Qué premia | Hoy | Sugerencia |
|---|---|---|---|---|
| `master.pomodoro.8` | Jornada de ocho | 8 Pomodoros en un día | SVG | **Un reloj de sol** con ocho marcas en el arco. |
| `master.long.focus` | Larga sesión | 5 bloques de 45 min | SVG | **Una vela consumida a la mitad** con la llama alta y quieta. |
| `master.box.15` | Caja maestra | 15 sesiones Box | carácter `▣` | El cuadrado de `explore.box` **con un segundo cuadrado inscrito**. |
| `master.rounds.15` | Rondas maestra | 15 sesiones | carácter `◶` | Los anillos de `explore.rounds` **cerrados y con un punto central**. |
| `master.atg.20` | Rodillas de acero | 20 sesiones ATG | carácter `△` | La rodilla de `explore.atg` **con un remache o refuerzo** en el vértice. |
| `master.hips.20` | Caderas libres | 20 sesiones de caderas | carácter `◇` | **Una bisagra abierta de par en par**: dos placas y su eje. |
| `master.shoulders.20` | Hombros libres | 20 sesiones de hombros | carácter `⌢` | El yugo de `explore.shoulders` **partido o desatado**: se ha quitado el peso. |
| `master.ancestral.10` | Primitiva | 10 sesiones ancestrales | carácter `☖` | **Una lasca de sílex** o una punta de piedra tallada. |
| `master.hydrate.30` | Río constante | 30 días de 8 vasos | carácter `≈` | **Un río de tres ondas paralelas entre dos orillas.** |
| `master.hydrate.90` | Manantial | 90 días de 8 vasos | carácter `∿` | **Una fuente brotando de una roca**, con la lámina de agua cayendo. Es el escalón por encima del río. |
| `master.extra.all.week` | Semana fuerte | todos los Estira en 1 semana | carácter `✧` | **Una gavilla atada con siete tallos** y la cuerda cruzada. |
| `master.midnight.never` | Nunca a medianoche | 30 días sin uso tras las 23 h | carácter `○` | **Una luna llena con una persiana o visillo bajado** por delante: la noche cerrada a propósito. |

> **Estos dos van al final de la cola**: `master.extra.all.week` y
> `master.midnight.never` **no tienen detector**, así que su sello se pinta
> «Pronto» aunque llegue el arte. No es motivo para no dibujarlos; sí para no
> ponerlos primeros.

---

## 6 · Secretos (7) · el dibujo solo se ve al desbloquear

Mientras están bloqueados pintan `?`, así que aquí **el arte es recompensa pura**.
Margen para que sean los más juguetones del conjunto.

| id | Título | Qué premia | Sugerencia |
|---|---|---|---|
| `secret.cow.click` | Vaca feliz | hacerle cosquillas al logo | **La vaca de PACE con los ojos cerrados y una pata levantada.** Hoy tiene SVG heráldico; es el que más gana con arte propio. |
| `secret.lunch` | Pausa de mediodía | sesión a las 14:00 | **Un plato y un tenedor cruzados con una ramita**, muy simple. |
| `secret.rain` | Lluvia mental | 3 respiraciones seguidas | **Una nube con tres gotas largas** cayendo en paralelo. |
| `secret.first.monday` | Primer lunes | el primer lunes del mes | **Una hoja de calendario con la esquina doblada** y una marca en la primera casilla. |
| `secret.new.year` | Año nuevo | 1 de enero | **Una rama con un brote nuevo saliendo de un corte de poda.** Nada de cohetes ni de copas. |
| `secret.dark.mode` | Modo oscuro | 7 días en oscuro **elegido** | **Una lámpara de aceite apagada con el humo subiendo**, o una luna con siete estrellas mínimas. |
| `secret.zen` | Zen accidental | 30 min de Respira en un día | **Un círculo trazado a mano alzada que no cierra del todo** (ensō). El más obvio y el más bonito de los siete. |

---

## 7 · Estadísticas (2) y estacionales (3)

| id | Título | Qué premia | Hoy | Sugerencia |
|---|---|---|---|---|
| `stats.month.focus` | Mes profundo | 20 h de foco en un mes | carácter `✦` | **Una plomada colgando de su cuerda**: profundidad medida. |
| `stats.streak.30` | Treinta amaneceres | un mes sin perder el ritmo | carácter `✦` | **Un sol saliendo tras una línea de horizonte, con treinta muescas** en la línea. Rima con el amanecer de la home. |
| `season.summer` | Verano | 1 sesión/día en verano | carácter `☀` | **Una espiga madura y una cigarra**, o un sol alto con la sombra corta de un árbol. |
| `season.autumn` | Otoño | 1 sesión/día en otoño | carácter `❦` | **Dos hojas cayendo en diagonal**, una de ellas curvada. |
| `season.equinox.autumn` | Equinoccio otoño | 22 de septiembre | carácter `⚖` | **Una balanza de dos platos a la misma altura**, con una hoja en un plato y una espiga en el otro. |

---

## 8 · Nota de nombre · «Semana vaca» (`streak.7`)

Lo dijiste y tienes razón: el nombre no está a la altura del resto. Es un juego
con «vaca» (el logo) y «vacaciones», y **al leerlo suena a semana vacía**, que es
justo lo contrario de lo que premia: siete días seguidos de práctica.

Alternativas, por si alguna te encaja — el resto del catálogo usa nombres cortos y
concretos («Primer sorbo», «Tres como una», «Río constante»):

| Nombre | Por qué |
|---|---|
| **Siete de siete** | Dice exactamente lo que premia, con el ritmo de «Tres como una». |
| **La semana entera** | Sencillo y sin doble lectura. |
| **Semana cerrada** | «Cerrar» encaja con el lenguaje de bloques que ya usa la app. |
| **Siete amaneceres** | Rima con `stats.streak.30` («Treinta amaneceres») y crea familia entre los dos hitos de racha. **Mi favorita.** |
| **Siete espigas** | Si el dibujo son las espigas del haz, nombre y sello se explican mutuamente. |

**Recomiendo «Siete amaneceres»** por la familia que forma con «Treinta
amaneceres», y **«Siete espigas»** si prefieres que el nombre nombre el dibujo.
El cambio es de una línea en `catalog.js` — pero ojo: el título viaja al i18n
inglés, que hoy **no traduce títulos de logro** (hallazgo de s146, sigue abierto).
