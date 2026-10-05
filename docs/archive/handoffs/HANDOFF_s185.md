# HANDOFF s185 → s186 · Lo que quedó mirado y lo que quedó sin mirar

> **v0.115.1 está PUBLICADA, el árbol queda LIMPIO y el CI en verde.**
> `npm run verify` sin problemas, **195/195** en local y **195** también en el CI,
> `index.html` al día con las fuentes. Esto es una cola de trabajo, no un rescate.

---

## 0 · Estado exacto

| | |
|---|---|
| Última versión | **v0.115.1** (commit `a23d311`) |
| Suite | **195/195** (eran 191) · `npm run verify` verde en 11,2 s |
| CI | **verde** — `verify` + `e2e` (195 passed, 4,0 min) |
| `index.html` | al día con las fuentes |
| `PACE_standalone.html` | intacto (congelado desde s134) |
| Mutantes calibrados | 3, todos muerden |

---

## 1 · Lo que s185 cierra, para que nadie lo vuelva a abrir

- **La música YA SE PUEDE GENERAR.** La contradicción de banda que la auditoría de
  s183 marcó como su hallazgo más peligroso está resuelta en
  `MUSICA_RESPIRA_BRIEFS.md`: el grueso de la energía va en **200 Hz – 2 kHz** y lo
  que se deja libre es **por encima de 2 kHz** (las consonantes). Los cinco prompts
  están reescritos, y de paso se corrigió un **segundo conflicto que la auditoría no
  vio**: pedían «a sustained low G» y un registro grave-medio, o sea la pieza que
  s177 midió inaudible. **No hay nada más que decidir antes de generar.**
- **La home de escritorio no hace scroll vertical**, y ahora lo vigilan 4 tests en
  los dos estados y en los cuatro viewports críticos. Lo publicado hacía 29 px a
  1536×864: era la caja del bloom, no el contenido.
- **El halo de arriba, el número y el aire del cabo** quedaron donde el usuario los
  aprobó mirándolos: hueco aro↔fila de minutos **47,6 px**, distancias de tinta del
  número **43/36**, aire del cabo **0,030 D** (el halo de la bola mide 0,017).
- **La premisa de los «~59 px» y la de «0,96 D en el peor breakpoint» están
  corregidas EN SU SITIO**, al lado del código que gobiernan. No hace falta
  volver a medirlas.

---

## 2 · Lo que s185 declara SIN cubrir (y no es deuda oculta: está dicho)

1. **NADIE HA MIRADO ESTO EN UN MÓVIL.** Es lo primero de la lista. Los cambios de
   la sesión son proporcionales a D, así que **también aterrizaron en el móvil**: el
   margen del `timerWrap` (0,055 D), la subida del número (−0,024 D) y del bloque
   (−0,030 D), la caja del bloom y la curva del techo. La suite pasa y el banco da
   sus números, **pero la última captura de móvil de la sesión es ANTERIOR a los
   tres últimos ajustes**. En este proyecto lo que decide es la revisión a tamaño
   real (s147), y aquí no se ha hecho.
2. **1366×610**: ahí el aro está limitado por ALTURA, se come el margen del halo y
   quedan **5,3 px** sobre ACTIVIDADES. Reservarle holgura al motor sería meterlo en
   el bucle de «encoger hasta caber», y se decidió no hacerlo.
3. **Que un degradado tenga un CODO o un canto plano no lo caza ningún aserto.** Se
   intentó y sale verde. Los tres intentos del halo los distinguió el usuario
   mirando; eso es criterio, no dato.
4. **La regla de no-scroll solo se vigila en escritorio**, que es donde se pidió. En
   móvil el scroll es legítimo.
5. Las acciones del workflow (`actions/checkout@v4`, `setup-node@v4`, `cache@v4`)
   apuntan a Node 20, que GitHub ya deprecó y fuerza a Node 24. **Funciona**, sale
   como anotación en cada run. Subirlas es trabajo de cinco minutos, no urgente.

---

## 3 · Tres trampas de esta sesión, que valen más que los arreglos

- **`git checkout` restaura al último COMMIT, no al estado de hace un minuto.** Mi
  guion de mutantes restauraba así y **borró el trabajo sin commitear de tres
  archivos** a mitad de sesión. Se recuperó entero desde el transcript
  (`~/.claude/projects/<proyecto>/<id>.jsonl`) y se verificó contra las cuentas de
  líneas y el `diff --stat` previos. **La restauración de un mutante es `cp`.** Ya
  estaba escrito desde s169 y volvió a pasar.
- **Un mutante de TEMPORIZACIÓN se calibra con el spec entero, no con `-g`.** El de
  la exención de transición pasaba **6 de 6** corriendo su test solo y mordía **a la
  primera** con el archivo completo en paralelo: sin contención, el frame que llega
  tarde llega a tiempo. Es el «rojo intermitente» que s162 describió sin causa.
- **Las cajas mienten; se mide la TINTA.** `line-height: 0.9` en un serif de display
  deja ~42 px de aire muerto sobre los glifos, y por caja el número parecía pegado
  arriba cuando la tinta decía lo contrario. Y **un margen negativo arrastra todo lo
  que va debajo**: hay que restar arriba y sumar lo mismo abajo.

---

## 4 · La cola, en el orden que propongo

### PRIMERO · Revisión a tamaño real en MÓVIL de lo que s185 cambió
Barato y cierra el único hueco que dejamos abierto sobre algo **ya publicado**. Tres
capturas a 390×844 (reposo · 8 s · mitad de bloque) y una a 360×640, comparadas con
las de las 18:03 del scratchpad de s185 (`fin-5-movil.png`), mirando: que el halo no
pinte la fila de minutos, que el número siga centrado entre sus dos rótulos, y que
el aro no se coma el aire de ACTIVIDADES en las pantallas cortas. Si algo se movió,
el arreglo es del mismo tipo que los de s185 y ya está el instrumento escrito
(`perfilDeLuz` en `tests/home-luz-bordes.spec.js`, y el banco de móvil).

### SEGUNDO · FASE 2, ítem 3: los dos niveles visuales (§19.3)
Es **el bloque más importante que queda** según el propio ROADMAP, y el que responde
al «no sé cómo hacerlo» del feedback beta: el glifo de 44×44 **identifica**, y hace
falta un **diagrama de ejecución** en el runner que **enseñe**. Hoy se le pide al
pequeño que explique la técnica. Requiere dirección del usuario sobre el formato del
diagrama antes de dibujar nada — y en este proyecto eso se decide **viendo una
maqueta**, no leyendo una propuesta.

### TERCERO · FASE 5, la música, en cuanto haya archivos
El bloqueo de decisión ya no existe; lo que falta es material. Cuando el usuario
genere las piezas: verificar y **guardar constancia de los términos de uso
comercial** (regla del ROADMAP), y montar la ingesta con la misma disciplina que la
voz de s175 — ganancia **por RMS y no por pico** (s177), y la pista de fondo **se
cachea al usarla, no en el precache**.

### DE PASO, si sobra sesión
Subir las acciones del CI a la versión que no arrastra Node 20.

---

## 5 · Lo que NO hay que perseguir

- **El scroll de escritorio ya no existe.** Está medido moviendo `scrollTop` en los
  cuatro viewports y en los dos estados. Si alguien vuelve a ver «la home se
  arrastra», que compruebe primero que no es la barra de su propia página de
  revisión — ese error ya costó una sesión entera (s182) y volvió a asomar en s185.
- **El arco, la niebla y los cabos son de s184 y están cerrados.** Barrido medido
  295,8° a 1280×800, dos capas con dos nieblas, cabos simétricos. No se toca sin
  releer su fila en `DECISIONES_TECNICAS_VIGENTES.md`.
- **`--pace-horizon` y `--pace-corte` son dos preguntas distintas.** El primero
  mueve layout (margin-top negativo de Actividades y de la tarjeta de Camino); el
  segundo corta el aro. Bajar uno creyendo que es el otro mueve las tarjetas.
