# Sesión 162 — El test intermitente tenía razón

**Fecha:** 2026-08-17 · **Versión:** v0.92.0 → **v0.93.0**

> Sesión que empieza como AUDITORÍA («audita todo el proyecto para saber dónde lo
> retomamos») y acaba como saneamiento, porque la auditoría encontró la suite en
> rojo intermitente y dos hechos falsos en la documentación.

---

## 0 · La auditoría, y lo que midió

No se leyó la documentación para creerla: se midió.

| Comprobación | Resultado |
|---|---|
| Versión | v0.92.0 coherente en los 3 sitios |
| Árbol | limpio |
| `npm run verify` | PASA, 0 problemas, 6,5–13,4 s, 1 aviso benigno |
| `index.html` committeado | = build de las fuentes, byte a byte |
| CI | los **dos últimos runs en SUCCESS** (#9 y el de v0.92.0) |
| `npm run test:e2e` | **NO estable**: pasada 1 → 64/1 · pasada 2 → 65/65 |

**Y una mentira de mi propio instrumento, la primera de la sesión**: la primera
pasada la lancé como `npm run test:e2e | tail -25`, y el `0` que devolvió era el
de `tail`, no el de Playwright. Estuve a un paso de dar por verde una pasada con
un rojo dentro. En bash el código de salida de una tubería es el del ÚLTIMO
comando; para leerlo hay que usar `${PIPESTATUS[0]}` o redirigir a un archivo.

### Los siete hallazgos de la auditoría

1. **La suite es intermitente** — `home-geometria.spec.js:293` (reduced-motion),
   «el aro mide distinto (420 vs 406)». Con `retries: 0` por decisión, esto es un
   CI rojo por tercera vez en cinco versiones. **Resuelto en esta sesión.**
2. **La regla §1 (<500 ln) violada por 5 archivos**, y la tabla «Deuda técnica
   activa» de STATE.md **mentía en los cinco**. Reconstruido con `git show`: los
   tres primeros cruzaron el límite **en s159**, `_responsive.js` de 465 a 1039
   en un solo commit. **Vigilado desde ahora por el `verify`.**
3. **`first.return` se pierde** (hallazgo s148) — cierto en lo esencial, pero **no
   es «nunca»: es una CARRERA** que se decide por la carga de la maquina. **Arreglado.**
4. **STATE.md se contradice en su cabecera**: «Próxima sesión: EL CI SIGUE ROJO
   (espera `gh auth login`)» con el CI verde, «`gh` sigue sin instalar» con `gh`
   2.97.0 autenticado, «Build entregado v0.91.0» con la app en v0.92.0, y
   «Última actualización: sesión 160» con la 161 cerrada. **Corregido.**
5. **README.md y README_EN.md decían v0.84.0** — ocho versiones de deriva.
   **Corregido, y metido en el `verify` para que no vuelva.**
6. **CHANGELOG: 25 enlaces a diarios que no existen** (sesiones 1-26).
   **Corregido: 26 filas.**
7. **STATE.md pesa 124 KB y crece cada sesión** contra su propia regla (111 → 124
   KB en cinco sesiones; s131 lo dejó en 57 KB). **No tocado** — es una decisión
   de formato, no un defecto.

Reglas que **sí** se cumplen, comprobadas: §10 (cero `new Date("YYYY-MM-DD")`),
§3 (ningún `const styles` de hoja de estilos), `playSound` protegido.

---

## 1 · El test intermitente tenía razón: era el PRODUCTO

`playwright.config.js` dice, desde s154, «`retries: 0` A PROPÓSITO: un test que
solo pasa al segundo intento está diciendo algo». Decía algo.

### Lo que NO era

- **No es contención sintética.** El test solo, `--repeat-each=12 --workers=8`:
  **12/12 en 7,1 s**.
- **No es hambre de frames en el helper.** Primer banco: freno de CPU por CDP
  (1x, 4x, 10x, 20x) sobre `asentarGeometria()`. Las cuatro tasas dieron **406 en
  3 frames**, y la verdad de campo también 406. Mi hipótesis —que «3 frames con
  el mismo valor» se cumpliera ENTRE dos pasadas del motor— quedó **desmentida**.

**Y ese primer banco medía otra cosa**, que es la segunda mentira del
instrumento: ponía `reducedMotion` en el CONTEXTO, así que la primera carga ya
era reducida. El test real carga **normal**, mide, y solo entonces hace
`emulateMedia({reducedMotion})` + `reload()`. Espejado eso, el banco reprodujo a
la primera.

### Lo que era, con su medida

| freno | aro normal | helper ve | verdad tras 2 s | veredicto |
|---|---|---|---|---|
| **1x** | 406 | **420** | **420** | **TEST ROJO** |
| 4x | 406 | 406 | 406 | ok |
| 10x | 406 | 406 | 406 | ok |
| 20x | 406 | 406 | 406 | ok |

Dos cosas de golpe: **el rojo sale en la máquina RÁPIDA** y desaparece con la CPU
frenada; y **la verdad de campo dos segundos después también es 420**, o sea que
el helper no miente — el motor converge a 420 y **se queda ahí**.

La radiografía lo cerró:

| campo | normal | reduce | reduce + resize a mano |
|---|---|---|---|
| `--pace-timer-d` | 406px | **420px** | 406px |
| stack / body | 655 / 656 | **667 / 656** | 655 / 656 |
| `over` (lo que decide el bucle) | −1 | **11** | −1 |

**Un `resize` a mano lo baja a 406**, que es la prueba de que el motor PODÍA
medirlo y no lo volvió a medir: carrera en el producto, no en el test. Y son los
**11 px de s156**, que s160 dio por cerrados.

### La causa: s160 un nodo más abajo

`applyD()` publica `--pace-activities-overlap`, y el bloque que hace de horizonte
lo consume como `margin-top` NEGATIVO — Actividades en escritorio, Actividades
también en móvil sin tarjeta, y `SuggestedPathCard` cuando existe. **Ninguno de
los tres estaba en la exención de s160**, que cubre el aro y sus cuatro nodos
interiores.

Medido, con control:

```
── SIN reduced-motion (control)
   margen antes -65px  stack 655 → MISMA TAREA -51px  stack 669   transiciones vivas: (ninguna)
── CON reduced-motion
   margen antes -65px  stack 655 → MISMA TAREA -65px  stack 655   transiciones vivas: margin-top:running
                                   dos frames después -51px  stack 669
```

El kill de `tokens.css` pone `transition-duration: 0,01 ms` sobre todo, y como el
valor inicial de `transition-property` es **`all`**, el cambio de margen es una
**transición**: su valor aterriza en otro frame mientras el motor mide en la MISMA
tarea. El desbordamiento se queda clavado en 11, el guard «nunca encoger a
ciegas» revierte D a 420 **y gasta su único reintento**; cuando el reintento
corre la misma carrera, el motor **se rinde en 420**. Para quien pide menos
movimiento, eso son 11 px de desbordamiento permanentes.

### El arreglo, y por qué va acotado

`transition-property: none !important` sobre `[data-pace-activitybar]` y
`[data-pace-spc]`, **dentro de `@media (prefers-reduced-motion: reduce)`** — al
contrario que la exención del aro, que es incondicional. Fuera de reduce la
medida ya responde en la misma tarea (control arriba) y esos dos nodos sí tienen
transiciones legítimas; dentro, ninguna lo es: el kill las deja en 0,01 ms
precisamente para matarlas, y lo único que les sobrevive es aterrizar tarde.

**Verificación**: el banco pasa a `ok` en las cuatro tasas de freno; la
radiografía da 406/−1 en normal, reduce y reduce+resize; y la suite completa
**65/65 en tres pasadas seguidas** con el código de salida leído de verdad (67/67
al cerrar la sesión, con los dos asertos nuevos de la sección 2).

**Tercera mentira del instrumento, y es la de este archivo**: escribí `` `over` ``
en un comentario **dentro del template literal** de `_responsive.js` y **aborté el
build**. Es la quinta vez que muerde ahí (s139, s156, s157, s158) — y el propio
archivo lo advierte tres líneas más arriba. El banco, que seguía midiendo el
artefacto anterior, dio los mismos números que antes: honesto, y por eso se vio.

---

## 2 · «Regresas»: no era «nunca», era una CARRERA — y la suite tenia razon

El backlog decia desde s148, y STATE lo repitio catorce sesiones, que
`first.return` **no se desbloquea nunca**: el rollover lo concede con
`setTimeout(unlockAchievement, 0)` y un `try/catch` vacio.

**Primera conclusion, y era equivocada.** Medido en un navegador real con un
estado de ayer sembrado y **el codigo tal cual**, el logro salia CONCEDIDO y
encolado en `index.html` **y** en `PACE.html`. Escribi el arreglo (concederlo en
el objeto que devuelve el rollover), monte el control —artefacto SIN mi cambio,
comprobando en el compilado que no estaba— y **los dos asertos nuevos pasaban
igual**. Conclusion: hallazgo falso, arreglo innecesario, revertido.

**La suite completa lo desmintio dos veces.** El aserto de «Regresas» se puso
rojo en la pasada de cierre —y antes en otra— con el mensaje que traia puesto:
«el rollover no ha concedido Regresas al volver un dia despues», el sello en
`false` tras diez segundos de poll. Aislado pasaba; con `--repeat-each=6
--workers=6` pasaba; **conviviendo con los otros specs, no**.

**El mecanismo, medido en el artefacto**: `index.html` tiene **109 etiquetas
`<script>`**, una por modulo, asi que los modulos corren en **tareas separadas**.
`unlockAchievement` vive en `state-achievements.jsx`, que se evalua DESPUES, y
aqui se referencia **pelada**: en el artefacto cada modulo viaja en su IIFE, asi
que el nombre se resuelve contra `window` **en el momento de la llamada**. Un
`setTimeout(0)` armado mientras corre `state-core.support.jsx` puede dispararse
**antes** de que el navegador evalue el de logros — y ahi el nombre no existe,
salta un `ReferenceError` y **el `catch` vacio lo entierra sin dejar rastro**.

Quien gana la carrera **depende de la carga**. Pagina quieta: el parser llega a
los 109 scripts antes que el timer y el logro se concede. Maquina ocupada: el
timer gana y el sello no aparece. O sea que s148 tenia razon en lo esencial —el
logro se pierde— y se equivocaba solo en el «nunca».

**Y la leccion del instrumento, que es la mas caduca de esta sesion**: mi control
corria en una condicion **mas tranquila** que el fallo. Un control que no
reproduce las condiciones del rojo no es un control; es una segunda opinion del
mismo error. Dos sondas quietas y un artefacto de control me hicieron **revertir
un arreglo correcto**.

**Arreglo definitivo**: la concesion va dentro del estado que devuelve el
rollover — el unico sitio donde se sabe que el dia ha cambiado, sin timer, sin
orden de carga y sin `try/catch` que trague la prueba. Es retroactivo por
construccion (quien vuelve tras un dia de uso lo gana en ese regreso) e
idempotente. Lo unico que se pierde es `checkCollectorAchievements()` en esa
concesion concreta: si fuera el logro nº 50 o nº 100, el hito de coleccion
entraria con el desbloqueo siguiente, que lo recalcula igual. **Verificado:
67/67 en tres pasadas completas seguidas**, contra el rojo intermitente de antes.

### Dos asertos nuevos, y sus dos mutaciones

- «volver un dia despues concede Regresas» → rojo borrando el trigger
  (`if (false && …)`): **1/88 → 0/88**. Y ademas es el aserto que **cazo la
  carrera**, que es mas de lo que se le pedia.
- «quien ya lo tiene no lo vuelve a ganar» → **no** muerde con esa mutacion, y es
  justo: la suya es quitar el guard de idempotencia de `unlockAchievement`, y ahi
  da **cola de 3 en vez de vacia**.

**Otra mentira del instrumento**: el primer aserto salio rojo con el producto
correcto. `checklist-estado.spec.js` tiene `beforeEach(sembrar)`, y `sembrar`
escribe **solo si falta** (trampa de s154, correcta), asi que mi segunda siembra
con `lastActiveDay` **no entraba nunca**. Nace `sembrarPisando()` en
`tests/helpers.js`, documentada con este efecto de segundo orden.

**Y un hecho nuevo, medido de paso**: `loadState()` **no persiste** su resultado.
El rollover corre al construir el estado y lo que devuelve vive en MEMORIA hasta
el primer `setState`, asi que justo despues de cargar `localStorage` sigue
teniendo el estado de ayer. Es **preexistente y benigno** (el rollover es
idempotente y se recalcula igual en el arranque siguiente), pero un aserto contra
`localStorage` ahi sale rojo con el producto correcto. Los asertos miran el
contador del sidebar y `getState()`.

**Y una ultima**: el primer aserto poleaba `leerLogros` a secas, que mezcla «el
sello existe» con «el render ya lo refleja» y al fallar no dice cual. Ahora la
sonda arrastra su diagnostico y las dos cosas se polean por separado — por eso la
pasada de cierre pudo señalar el sello en una linea.

---

## 3 · La regla §1 pasa a estar vigilada (y el checker se cazó a sí mismo)

Nace **`scripts/verify.tamano.js`**, invocado por `verify.js` como una tanda más.
Es **RELACIONAL**: el único número es el límite de CLAUDE.md §1.

**Se cazó a sí mismo en su primera pasada**: escrita dentro de `verify.js`, la
comprobación dejó ese archivo en **544 líneas** y salió roja sobre su propio
autor. Se arregló **el diseño, no el checker** — exactamente la lección de s155.
`verify.js` queda en 434 y el módulo nuevo en 141.

**DEUDA_500 es un TRINQUETE, no una lista de perdón**, con tres dientes y su
guard de cero, **los cuatro verificados en rojo**:

| Diente | Mutación | Mordió |
|---|---|---|
| archivo nuevo >500 | quitar `tokens.css` de la deuda | «1 archivo NUEVO pasa de 500» |
| la deuda no crece | bajar su tope a 600 | «tokens.css CRECIÓ: 600 → 676» |
| la lista no sobrevive a la deuda | registrar `flags.js` (48 ln) | «ya cumple §1: borrar su fila» |
| guard de cero | `TAMANO_DIRS = ['no-existe']` | «no encontró un solo archivo que medir» |

Y un defecto propio, cazado al verificar: los dientes 2 y 3 imprimían el `[OK]`
(«ninguna ha crecido») **justo detrás del `[FALLA]`**. Un checker que se
contradice en dos líneas no se cree; ahora el OK cuelga de que no haya problemas.

**Lo que este trinquete NO hace, y se declara en `NO_CUBRE`**: impide que la
deuda crezca, no que exista. Los cinco archivos siguen por encima del límite.

---

## 4 · Lo que se corrigió en la documentación

- **CHANGELOG**: **26 filas** enlazaban a diarios de las sesiones 1-26 que nunca
  se escribieron. Sustituido por `(sin diario)`; **cero enlaces rotos**.
- **README.md y README_EN.md**: v0.84.0 → v0.93.0 **y entran en la comprobación
  de versión del `verify`** (7 sitios en vez de 3, dos por README porque bumpear
  uno y no el otro es el modo de fallo natural). Verificado en rojo: el mensaje
  nombra el sitio exacto que derivó. s151 ya los había reescrito por estar
  desactualizados, así que el arreglo a mano estaba demostrado insuficiente.
- **STATE.md**: cabecera, «Próxima sesión», los dos hallazgos falsos u obsoletos
  y la tabla de deuda técnica (que ahora apunta al trinquete).

---

## 6 · El push, el CI rojo y los tres commits

**El primer push (`ca9f3c1`) puso el CI rojo**, y esta vez se observo en vez de
suponerlo. Un solo test: `home-luz-curva.spec.js:140`, con «GUARD: la luz se
apago a mitad del recorrido». El job `verify` en verde.

**Lo primero fue descartar que fuera mio**, y se pudo hacer sin medir nada: ese
archivo **no siembra `lastActiveDay`** (mi cambio del rollover esta gateado en el)
y **no usa reduced-motion** —los dos matches de «reduce» eran `Array.reduce`—, asi
que ninguna de mis dos ediciones de producto puede alcanzarlo.

**Es el defecto de s161 en el archivo que quedo pendiente.** s159 partio la suite
de la luz en dos archivos y s161 reparo los dos asertos de `home-luz.spec.js` que
entonces fallaban; este, en `home-luz-curva.spec.js`, tiene la misma debilidad.
`--pace-on` no es un booleano: es el interruptor de la luz y se funde en 1,6 s,
asi que en el instante en que aparece `data-pace-dial-running` vale **cero
exacto**, y el guard de estas pruebas exige `on > 0` en las 21 paradas.

**No reproducia en local** (8 workers, `--repeat-each=8`: 12/12; con `CI=true`:
4/4), asi que se midio el valor directamente en el instante de la lectura, 10
arranques:

```
0.0000  0.0000  0.0002  0.0002  0.0000  0.0002  0.0002  0.0002  0.0002  0.0002
minimo 0.0000 · maximo 0.0002 · lecturas que NO son > 0: 3 de 10
```

La prueba vivia sobre el filo —margen de dos diezmilesimas— y en el runner cayo
del lado malo. `abrirBloque` **espera ahora a que la luz encienda**, con
`expect.poll`: se espera, no se baja el liston, y las 21 paradas siguen exigiendo
luz viva. Comprobado que muerde saboteando `publicarLuz` para que `--pace-on`
valga siempre 0 (los cuatro tests del archivo caen con el mensaje nuevo).

**Y una torpeza propia, tercer commit.** El commit del arreglo se llevo
`PACE_standalone.html` **regenerado a v0.93.0**, violando la decision s134. Lo
regeneraron mis propias pasadas de `node build-standalone.js` al verificar la
mutacion, y la trampa es esta: **el build reescribe los DOS artefactos, y
`npm run verify` solo restaura el standalone alrededor de SU propia pasada**, no
alrededor de las mias. Al commitear, en el arbol estaba el mio. Devuelto a
v0.71.0 y comprobado **byte a byte** contra el arbol de antes de la sesion.

**El CI, verde y OBSERVADO** en `513aa67`: los dos jobs en `success`, con el
conteo leido del log —**`67 passed (57.6s)`**— y el paso propio del `verify`
diciendo «index.html coincide byte a byte con el build de las fuentes». El run
intermedio quedo `cancelled` porque el tercer push lo relevo.

Los tres commits de la sesion:

| Commit | Que |
|---|---|
| `ca9f3c1` | v0.93.0 — la carrera de reduced-motion, «Regresas», el trinquete y los documentos |
| `79c06cc` | la espera de la luz en `home-luz-curva` (sin cambio de version: no toca `app/`) |
| `513aa67` | `PACE_standalone.html` de vuelta a v0.71.0 |

---

## 5 · Lo que NO se cubre

- **Los cinco archivos siguen pasando de 500 líneas.** El trinquete los congela;
  trocearlos es su propia sesión. Tres de los cinco (`_responsive.js`,
  `tokens.css`, `FocusTimer.jsx`) son el sistema visual de la home y **la suite no
  compara ni un píxel**: ese troceo quiere una pasada visual del usuario, que es
  el detector que s147 declaró para lo visual.
- **Ni un píxel comparado**, y móvil sin medir, como en las cinco sesiones
  anteriores.
- **El tirón del arco** sigue esperando el banco de cuatro aros en el teléfono
  del usuario.
- **El diagnóstico de Respira** sigue sin abrirse: cuarta sesión.
- **STATE.md sigue creciendo** (124 KB).
- **D3** (sidebar racha Y récord) queda pendiente de decisión: el usuario eligió
  «decidirlo mirándolo», con las dos versiones a tamaño real.
- **`checkCollectorAchievements()` no corre** en la concesión de «Regresas»: si fuera
  el logro nº 50 o nº 100, el hito de colección entra con el desbloqueo siguiente.
