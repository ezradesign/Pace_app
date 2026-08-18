# s167 · Los 19 dibujos, los 96 logros en inglés, y una recomendación que tuve que retirar

**v0.97.0** · 2026-08-18 · desde v0.96.0 (`81d460c`)

---

## 1 · Lo entregado

| Frente | Qué |
|---|---|
| **Glifos de logro** | Los **19 dibujos nuevos** ingestados. **77 de 96** logros con máscara; quedan 19 |
| **Inglés** | Los **96 logros** (título + descripción) traducidos. Cierra el hallazgo abierto de **s146** |
| **Copy** | `streak.7` deja de llamarse «Semana vaca» y pasa a **«Cuarto creciente»** |
| **Layout** | Las tarjetas de logro dejan de tener el alto atado al ancho |
| **Catálogo** | «Curiosidad» pasa a secretos · «Treinta amaneceres» deja de duplicar a «Luna llena» |
| **Instrumento** | Los tests de Respira, más baratos; `workers` fijado a 2 |
| **Asertos** | **78 → 81** (los tres primeros de la suite sobre el IDIOMA) |

---

## 2 · Las dos trampas del handoff, y cómo quedaron

El handoff avisaba de que `ingest-glifos-logro.js` **borra todas las máscaras
antes de regenerarlas** y de que su ruta por defecto no existe. Las dos eran
ciertas, pero medirlas afinó el diagnóstico en dos direcciones:

- **Más pequeña de lo que decía**: lo que la app consume son las `.webp` de
  `app/glyphs/assets/logros/`, que están **committeadas**. Los PNG de `.old` son
  el archivo de diseños del usuario y la app no los abre nunca. Un borrado
  accidental se deshace con `git checkout`.
- **Más grande de lo que decía**: el `ABORTADO — no existe el dibujo` vivía
  **después** del borrado (línea 305 contra 296). Ese sí era el camino
  destructivo. Ahora hay un **prevuelo** que resuelve las 77 claves antes de
  tocar nada, probado en rojo: 58 filas huérfanas → aborta con exit 1 y las 58
  máscaras intactas.

**Decisión del usuario**: el arte fuente se consolida en **una sola carpeta**
(`..\.old\Glifos_logros`), fuera del repo. Los 19 se movieron ahí con su md5
comprobado antes y después, y se reconocen por el prefijo `exlibris_handcraft`.

**Documentación corregida** (gana el código): la ruta por defecto apuntaba a una
carpeta inexistente, y la cabecera anunciaba un flag `--todos` **que no existe**
— no hay un solo `argv` en el script.

---

## 3 · La biyección que valida el censo

El aviso del usuario («la unidad de un censo de arte es el DIBUJO, no el
fichero») se comprobó en vez de asumirse:

```
.old\Glifos_logros = 91 PNG = 83 `asset_*` (→ 50 ids distintos)
                            +  8 `Premium_*` (→ 8 slugs)
                            = 58 dibujos = las 58 filas del MAPEO
```

Y el lote nuevo **no tiene esa señal**: los 19 comparten slug y solo cambian en
el timestamp, así que el nombre no distingue re-exportaciones. Se comprobó por
otro camino — **19 md5 distintos** y 19 dibujos distintos en la hoja de
contactos.

---

## 4 · El efecto secundario que hay que saber

La ingesta **modificó 17 máscaras que ya existían**. Es por diseño: el igualado
de peso de tinta se calcula contra la **mediana del conjunto entero**, y 19
dibujos nuevos la mueven. Las otras 41 quedaron idénticas byte a byte.

Y una sospecha mía que la medida **desmintió**: creí que algunos dibujos nuevos
iban apretados o pequeños respecto al conjunto. Los 19 ocupan del **58,5 % al
86,2 %** del lienzo; los 58 viejos, del **54,5 % al 85,3 %**. Mismo rango.

---

## 5 · El aire de las tarjetas: el defecto no era el que parecía

El usuario reportó «mucho aire por debajo» y propuso centrar o encoger. Medido a
1280×900 parecía cosmético: 24,3 px de mediana. **Medirlo en siete anchos cambió
el diagnóstico:**

| Viewport | Tarjeta | Aire mínimo | Mediana |
|---|---|---|---|
| 1440 | 127 × 146 | 0,6 px | 24,3 |
| 768 | 154 × 178 | 39 px | 51,4 |
| **320** | **246 × 283** | **156,6 px** | **156,6** |

A 320 px la tarjeta medía 283 px y **157 eran aire: el 55 % vacía**. La causa era
`aspectRatio: '1/1.15'`, que ataba el **alto al ancho**: con
`minmax(128px, 1fr)`, al estrechar el viewport caben menos columnas, cada tarjeta
se ensancha y la proporción la estira, mientras el texto sigue midiendo lo mismo.

**Las dos ideas del usuario no lo arreglaban:**

- *Encoger el cuadrado* rompía `master.path.all7` («Cartógrafa»), que consumía la
  reserva entera y le sobraban **0,6 px**.
- *Centrar* es exactamente lo que **s147 quitó, y a petición del propio usuario**:
  con el ancla al centro el sello derivaba 11 px con el largo de la descripción.
  Se le notificó como restricción previa suya.

**Arreglo**: quitar el alto proporcional y dejar que la rejilla iguale **por
fila**. La regla de s147 sigue en pie porque su defecto era la deriva *dentro* de
una fila, y el estirado del grid la impide igual.

| Viewport | Alto antes | Alto ahora | Aire mediano |
|---|---|---|---|
| 1440 | 146 | **134** | 24,3 → **0,4** |
| 768 | 178 | **140** | 51,4 → **1** |
| 375 | 166 | **140** | 39,9 → **1** |
| 320 | **283** | **127** | 156,6 → **1** |

**Yo recomendé primero la opción equivocada** (acortar el copy y encoger el alto
fijo), y la medida por anchos me hizo retirarla antes de tocar nada.

---

## 6 · El duplicado que apareció buscando otra cosa

Revisando las familias del catálogo salió esto, que no es cuestión de gusto:

```js
state-achievements.jsx:278
if (current >= 30) { unlockAchievement('streak.30'); unlockAchievement('stats.streak.30'); }
```

**La misma condición desbloqueaba dos logros en dos categorías**: «Luna llena»
(constancia, «30 días seguidos») y «Treinta amaneceres» (estadísticas, «un mes
seguido sin perder el ritmo»). El mismo hito contado dos veces.

**Arreglo**: `stats.streak.30` pasa a medir **treinta amaneceres de verdad** —
30 días distintos con sesión antes de las 9:00. No hizo falta estado nuevo: la
lista `morningDates` ya guardaba exactamente eso, capada a 30 (`.slice(-30)`),
justo al lado de `morning.5`. El título pasa de ser un sinónimo de racha a ser
**literal**. El `id` no se toca — renombrarlo borraría el logro a quien lo tenga.

Y **«Curiosidad»** (`explore.tweaks`) pasa a **secretos** con `secret: true`: los
otros 18 de exploración son «Tres sesiones de X» y este es «Abre los Tweaks»,
una acción de app. Sus hermanos reales son `secret.backup` y
`secret.safety.read`.

---

## 7 · El inglés, y por qué va en `content/` y no en `strings/`

Los 96 logros mostraban título y descripción en castellano **también en inglés**,
porque `Achievements.jsx` y `Toast.jsx` leían `a.title`/`a.desc` crudos del
catálogo. Abierto desde **s146**.

El patrón del repo ya resolvía esto para Respira/Mueve/Extra y **el propio verify
lo defiende**: `strings/*` es biyectivo ES/EN, y `content/*` es un patch de
**solo inglés** — añadir una clave española desde ahí es un FALLO explícito. Por
eso el castellano sigue viviendo **solo** en `catalog.js` y los componentes caen
a él con `tR(clave, fallback)`.

Consecuencia que corrige una estimación mía: el **CENSO de i18n se queda en 515**,
no sube a ~707 como dije al medir de memoria. Las claves de `content/*` no se
cuentan ahí.

**192 claves nuevas, biyección 96 = 96 comprobada antes de generar el archivo.**

---

## 8 · Las mentiras del instrumento (cinco)

| Mentira | Causa | Cómo se cazó |
|---|---|---|
| «el censo dedupe mal, no hay ficheros `asset_*`» | leí un `ls \| head -8` y `Premium_*` ordena **antes** que `asset_*` | contar por prefijo |
| la captura de revisión «del panel» era del **onboarding** | inventé `onboarded: true`; la clave real es `firstSeen`, y el helper lo avisa por escrito | **mirar la imagen** — el guard de cero no lo vio: los 77 sellos sí estaban pintados detrás |
| «19 de 19 tarjetas localizadas» cuando eran **20** | la sidebar pinta su propia previsualización | el guard solo miraba «no falta ninguna»; **un censo que no sabe decir «sobra» no mide** |
| el test de inglés acusaba a la app de colar inglés en español | `includes` casa por **SUBCADENA**: «Coherent» ⊂ «Coherente» | comparar sello a sello con `data-pace-ach` |
| «`EXIT=0`, el guard no aborta» | era el código de `head`, no del script | repetir sin pipe |

La segunda es la que más enseña: **el guard de cero decía la verdad y aun así la
captura no revisaba nada**. Un detector puede estar midiendo *algo* y no lo que
crees.

---

## 9 · El instrumento E2E: lo que se hizo y lo que no

El usuario eligió **abaratar los tests** (opción iii), no calibrar workers.

Se retiró el `waitForTimeout(12)` por segundo simulado — **1 de cada 2 viajes al
navegador**. Verificado con control rojo (defecto D1 reintroducido: el test sigue
mordiendo). La spec sola pasa de **20,9 s a 15,8 s** a 1 worker.

**Pero no bastó.** A 8 workers seguía rojo 2 de 3, y caían tests *distintos* a los
del diagnóstico heredado — no eran «los cuatro del bucle», era contención
general. A 4 workers medí **3 de 3 en verde** y lo di por bueno.

**Era una ventana afortunada.** Repetido más tarde: **rojo 3 de 3**. La pista
estaba en el reloj — el mismo trabajo pasaba de **49 s a 3,1 min**. Medida de la
máquina: **CPU al 6 %** y **5,8 GB libres de 15,7**. El cuello **no es CPU, es
memoria**, y depende de cuánta tenga cogida el navegador del usuario en ese
momento.

**A 2 workers: 81/81 dos veces, 1,2 y 1,5 min.** Se fija **2 en los dos lados**.
Una red de seguridad que falla según lo que tengas abierto no es una red.

---

## 10 · Verificación de cierre

- `npm run verify` **PASA**, 0 problemas. CENSO actualizado a mano: máscaras
  **58 → 77**, de secreto **5 → 8**, visibles **53 → 69**, precache **86 → 105**,
  logros secretos **12 → 13**. i18n **sigue en 515** (correcto).
- `npm run test:e2e` **81/81** con la config committeada.
- `index.html` regenerado desde las fuentes.
- **`PACE_standalone.html` intacto en v0.71.0**, restaurado tras cada build.
- Revisión **a tamaño real** de los 19 sellos sobre la app de verdad, con guard
  de completitud exacto (19 = 19) y cero errores de consola.

---

## 11 · Lo que queda abierto

- **19 logros siguen sin arte** (de 38 al empezar).
- **`season.equinox.autumn`**: el farol se lee bien, pero **el sol y la luna que
  justifican el equinoccio son ilegibles a 56 px**. Decisión de arte del usuario.
- **Las familias del catálogo**. El reparto es 10 · 15 · 19 · 26 · 12 · 10 · 4 y
  quedaron dos costuras sin tocar: **maestría (26) mezcla** profundidad en una
  práctica con hábitos de hora del día, y **estadísticas se solapa con
  constancia** (el duplicado del §6 era su síntoma). Además la clave dice
  `exploracion` y la etiqueta dice **«Repertorio»**.
- **La pill de Foco/Pausa/Larga en móvil** (punto D), con sus dos preguntas sin
  responder.
- **Los glifos de ejercicio**: mecanismo montado desde s166, esperando arte.
