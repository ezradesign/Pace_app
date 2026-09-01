# s179 · El runner en móvil corto, y un umbral elegido mirando un solo lado

> **v0.110.0** · Cierra el bloque que `STATE.md` dejó abierto al final de s178:
> «por debajo de 641 px de alto el runner no está congelado, y móvil tampoco.
> El usuario pidió abrirlo como bloque propio».

---

## De dónde se partía

El árbol no estaba limpio al empezar: había un banco nuevo
(`scripts/audit/banco-runner-bajo-s179.js`), un arreglo en
`MoveSessionV1.css.jsx` y un `index.html` ya regenerado. Lo que **no** había era
la medida de la cura: sólo la del defecto.

`verify` pasaba y el `index.html` no tenía deriva, así que el punto de partida
era bueno — pero «el arreglo está escrito» y «el arreglo funciona» son dos
cosas, y la diferencia entre ellas es justo lo que la auditoría de s178 tuvo que
desenterrar tres veces.

---

## 1 · El guard de cero hizo su trabajo antes de que nadie se confiara

Corrido el banco sobre el artefacto arreglado: **0 solapes de 14 viewports**. Y
acto seguido su propio guard:

> «GUARD: ni uno solapa. O está arreglado, o la sonda no está llegando al paso
> que reproduce — y "cero" y "no he medido" se parecen demasiado.»

Así que se montó el **control positivo**: `git show HEAD:index.html` servido en
un puerto aparte (8766) con sus `fonts/` y sus máscaras, porque **sin las
fuentes las métricas de texto son otras y la comparación no vale**. Mismo banco,
mismos clics, artefacto de HEAD:

| viewport | HEAD | árbol |
|---|---|---|
| 1280×575 | **4,7 px** | 0 |
| 360×640 | **26,3 px** | 0 |

Los 26,3 px son **exactamente** el número que el comentario del CSS había
anotado como diagnóstico. La sonda muerde, y el arreglo cura.

---

## 2 · EL HALLAZGO: un umbral elegido mirando UN SOLO LADO

El tramo nuevo se había escrito con `max-height: 660`, y 660 salió del viewport
que se estaba mirando (360×640) — no de medir por los dos lados. Ampliado el
barrido móvil, HEAD solapaba a:

- **375×667 — el iPhone SE/8 — con 7,2 px**
- **360×661 con 10,8 px**
- 360×680 sobrevivía por **1,9 px**, que no es holgura sino suerte

Los dos primeros están **justo por encima de 660**, así que el arreglo no los
tocaba: seguían rotos exactamente igual que antes.

**Es el mismo error que s177**, que declaró el suelo en 641 cuando el borde real
estaba en 575. Un umbral no se declara: se mide por los dos lados.

El umbral sube a **700**, y no es un número nuevo — es el breakpoint que esta
misma hoja ya usa más arriba para «retrato estrecho con poca altura» (s27,
apretado por s171b).

---

## 3 · EL BANCO DIJO QUE ESTABA ARREGLADO Y EL CENSO LO DESMINTIÓ

Con el umbral a 700 y un tramo profundo a 620, el banco daba **0 de 19**. Pero
el banco declara en su cabecera que **mide UNA rutina**, así que se pasó el
censo de s177, que recorre las 28 paso a paso. A 360×640:

| | HEAD | tras el primer arreglo |
|---|---|---|
| rutinas con solape | 16 de 19 | **5 de 19** |
| pasos con solape | 60 de 79 | **7 de 79** |
| el peor | 70,0 px | **34,0 px** |

El 88 % del defecto, pero **no el defecto**. Y el instrumento que decía «cero»
era el mismo que había dado el umbral: una rutina no basta para cerrar, sólo
para encontrar el borde.

---

## 4 · LA CAUSA REAL: la compresión apuntaba a un elemento que en esa pantalla NO EXISTE

Medidas las piezas de la pantalla que solapaba (`Muñecas y manos`, colocación,
360×640) salió lo que ningún tramo había visto en cinco sesiones de apretar:

> La pantalla de **colocación** pinta `[data-pace-v1-num]` — el número pequeño
> de la puerta, s112 — y **no** `[data-pace-v1-timer]`. Todos los tramos cortos,
> **incluidos los de s119 en escritorio**, comprimen `-timer`. En la pantalla de
> trabajo el mismo elemento lleva los dos atributos y por eso allí funcionaba;
> en la de colocación el número se quedaba a 56 px sin que nadie lo tocara.

Por eso el texto que se metía era el de colocarse en **4 de los 5 casos** que
quedaban. Se arregla apuntando a la pieza correcta, no apretando más lo de al
lado.

La segunda pieza era el **nombre**: `clamp(30px, 6.5vh, 52px)` da 41,6 px a 640
de alto, y a 360 de ancho eso **envuelve a dos líneas** — 87,3 px de una pieza.
Fijado a **30 px**, que es el **suelo que su propio clamp ya declara
aceptable**, cabe en una y devuelve 53,7 px.

Resultado: **ninguna rutina solapa** a 360×640, 375×667 ni 360×600.

---

## 5 · Lo que NO se hizo, y por qué

A **360×560** siguen solapando ~18,6 px. Lo único que queda por encoger ahí es
el **glifo** (123 px a esa altura), y probado por CSS funcionaba: 123 → 96
dejaba +8,4 px. **No se hizo, porque está prohibido por escrito** en la fuente
única de s177:

> «SE CAMBIA AQUÍ, EN LA FUENTE ÚNICA, NO CON CSS EN EL RUNNER. […] Encogerlo
> por CSS sólo en el runner habría arreglado un salto creando otro, justo el
> que el usuario está pidiendo que desaparezca.»

Sin el glifo, apurando márgenes y número, 360×560 se quedaba en **−1,1 px**. Y
apurar hasta +4,9 sería quedarse sin red donde s176 midió que el CI se desvía
hasta **9,4 px** del local. **Queda declarado, no falsificado.**

---

## 6 · La red que impide que vuelva

Tres tests nuevos en `runner-congelado.spec.js` (360×640, 375×667, 360×600),
**calibrados en rojo contra el `index.html` de HEAD**: los tres fallaron con el
defecto vivo y los tres pasan con el arreglo. Con su guard de cero, que aquí
importa más que en escritorio: si la rutina no arranca en un viewport corto, el
bucle mide una pantalla y sale verde.

Y se corrigió **la cabecera del propio spec**, que declaraba «NO CUBRE: alturas
por debajo de 641 px. Ni móvil» — cierto hasta hoy.

**153/153** (eran 150) y `verify` en verde.

---

## Trampas del instrumento

1. **`/tmp` no es el mismo `/tmp`.** En Git Bash es
   `C:/Users/ezrav/AppData/Local/Temp`, pero MSYS traduce el **argumento** al
   invocar un binario nativo, no las cadenas de dentro: `node /tmp/x.js` iba
   bien y `fs.readFileSync('/tmp/x.js')` buscaba en `C:\tmp`.
2. **Backticks dentro de un template literal**, otra vez (s139): la hoja entera
   vive en uno, así que citar `clamp(...)` con backticks en un comentario cerró
   el literal y tumbó el build.
3. **`node -e '...'` con comillas simples dentro** — el bloque de test las lleva
   por todas partes. Heredoc **entrecomillado** (`<<'EOF'`), que es literal.
4. **Acentos al anclar un `replace`**: anclar por prefijo de línea, no por el
   párrafo entero.
5. **Servir HEAD sin `fonts/`** habría dado una comparación inválida: otras
   métricas de texto, otras alturas de bloque.
