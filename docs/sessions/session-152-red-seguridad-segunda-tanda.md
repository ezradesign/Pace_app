# Sesión 152 — CINCO SELLOS NO SE PINTAN NUNCA, Y ESO NO ERA UN BUG

**Fecha:** 2026-08-03
**Versión:** v0.84.0 → **v0.85.0**
**Frente:** segunda tanda de la red de seguridad — lo que **D5 de s149** aparcó del `verify` v1
**Artefacto verificado:** `index.html` v0.85.0 (`91875C7A543DCC15`) · `PACE_standalone.html` intacto (`998E3E358D689036`)

---

## 0. Qué entraba y qué no

Con los frentes **A** (s150, `npm run verify`) y **B** (s151, copy y presencia) cerrados,
entra lo único que quedaba del alcance de D5: **integridad de catálogos, i18n, precache
y glifos**, dentro de `npm run verify` y con **asertos**, no impresiones.

Fuera, por decisión previa: CI (Actions/YAML/Wrangler/Playwright/proteger `main`, que
va **detrás** porque el YAML tiene que invocar algo que ya funcione en local), **D3**,
**D6**, **D7**, `first.return`, el ayudante de geometría de la home, los 8 glifos flojos,
el pincel de `stats.month.first`, las 28 descripciones y los 4 commits con coautoría.

**No había que inventar un solo umbral**: todo el material estaba medido. Lo que sí hubo
que hacer es **medirlo otra vez del árbol**, porque uno de los números del encargo no
cuadraba con la pantalla.

---

## 1. El número que no cuadraba: 58 máscaras, 54 sellos, 53 en s150

El mapa `achievement-masks.js` tiene **58** entradas. s150 contó **53** sellos pintando
máscara y s151 contó **54**. Nadie lo había perseguido, y escribir el aserto sin
entenderlo daba dos malos finales: un rojo permanente, o un número redondeado que tapa
algo real.

**No es un bug de nadie, y las tres cifras son correctas a la vez.** La causa está en
`Achievements.jsx:126,192`:

```js
const isSecret = a.secret && !unlocked;
…
{isSecret ? <span style={{ fontStyle: 'italic' }}>?</span> : renderGlyph(a)}
```

Un logro **secreto y todavía bloqueado no pinta su glifo**: pinta una `?`. Y **5 de las
58 máscaras son de logros secretos** — `secret.backup`, `secret.bilingual`,
`secret.night.owl`, `secret.safety.read`, `secret.supporter`. Por tanto:

> **máscaras pintadas = 58 − (secretos con máscara aún bloqueados)**
> ⇒ **53 de salida**, y sube de una en una hasta 58 según se desbloquean.

s151 vio 54 porque **midió el onboarding en inglés**, y cambiar de idioma desbloquea
`secret.bilingual` (`TweakSecretsWatcher.jsx:56`). No hubo regresión entre una sesión y
otra: hubo un secreto desbloqueado.

**Comprobado por DOM sobre el artefacto**, no deducido: con estado limpio, **53** sellos
con `mask-image` y **ninguno** de ellos un `secret.*`, más **12** tarjetas con `?????`.
Tras `unlockAchievement('secret.bilingual')`, **54** dentro del modal, con
`secret.bilingual.webp` entre ellos y 11 tarjetas secretas.

Se asertan **las dos mitades** (53 visibles + 5 tras secreto), no solo el 58, para que el
número de la pantalla deje de sorprender a la siguiente sesión.

### Trampa del instrumento, otra vez

La primera medición del segundo caso dio **55**, no 54. La causa no era el código: mi
selector barría **toda la página** y `secret.bilingual.webp` aparecía **dos veces** —
una en el sello del modal y otra en el **toast** del logro recién desbloqueado, que
también pinta por `renderGlyph` (s147). Acotando a `[data-pace-modal-backdrop]`: **54 en
el modal, 1 fuera**. Es la lección de s151 en la misma semana: si el número no es el
esperado, sospechar del instrumento antes que del código.

---

## 2. Qué se aserta, y las dos clases que conviene no mezclar

La tanda vive en **`scripts/verify.integridad.js`** (448 ln) y la invoca `verify.js`
como su tanda **[4/4]**. **No es un script suelto**: corre en cada `npm run verify`.
Vive aparte solo por tamaño — `verify.js` estaba en 411 líneas y meter esto dentro lo
dejaba en ~630, por encima del límite de 500 de `CLAUDE.md`.

**RELACIONALES — no llevan número y no caducan nunca.** Si una falla, hay algo roto
siempre: toda máscara tiene su `.webp`, todo id de detector existe en el catálogo, ES y
EN declaran las mismas claves, toda fila del precache resuelve a un archivo real.

**CENSO — los números esperados, todos juntos en una constante.** Cazan la desaparición
silenciosa (una rutina que se cae de un grupo, un glifo que se pierde en un troceo). Al
añadir contenido **a propósito** hay que subir el número ahí, y el mensaje de fallo lo
dice con todas las letras: *«o se ha perdido algo por el camino, o el contenido creció a
propósito y toca subir el número en CENSO»*.

Mezclarlas habría sido el error caro: asertar 509 claves de i18n como si fuera un
invariante da un rojo cada vez que alguien escribe copy; asertar solo la biyección deja
pasar que se caiga un archivo entero de strings.

### Las 23 comprobaciones

| Familia | Relacional | Censo |
|---|---|---|
| **i18n** | biyección ES↔EN (las dos direcciones, con las claves nombradas) · `content/*` **no toca ES** · `content/*` carga **después** de `strings/*` (override D-1) · el desequilibrio global lo explican los patches | **509** claves por idioma |
| **precache** | cada fila con archivo **en disco** · sin duplicados · **cero rutas entrecomilladas en los comentarios** (trampa s146) · mapa de máscaras ↔ precache, en las dos direcciones | **86** filas |
| **glifos** | `.extra.jsx` carga **después** del mapa que muta | **47** de ejercicio · **58** máscaras · **53** visibles · **5** tras secreto |
| **logros** | sin ids duplicados · detectores ⊆ catálogo · máscaras ⊆ catálogo · `.webp` sin huérfanos · categorías ⊆ `CAT_META` · **todo secreto tiene detector** | **96** logros · **88** detectores · **88** disponibles (§15.4) · **12** secretos · **7** categorías |
| **contenido** | — | Respira **20** · Mueve **14** · Estira **14** · Caminos **7** |

**El dato se saca del árbol, nunca leyendo a ojo**: cada archivo se compila con el Babel
del build y se evalúa **dentro de su propia IIFE**, que es como viaja en el artefacto.
Eso no es un detalle de estilo — `GLYPH_SVG` está declarado como `const` en **dos**
archivos (`achievement-glyphs.jsx` y `catalog.js`) y cargarlos en un ámbito compartido
revienta con «has already been declared». La primera versión del banco de medición cayó
exactamente ahí y devolvió **el catálogo vacío** sin quejarse.

---

## 3. Un hueco que salió de una prueba negativa fallida

De las 26 pruebas en rojo, **una expectativa mía no se cumplió**, y el checker tenía
razón. Al quitarle el detector a `secret.dark.mode`, esperaba ver moverse el denominador
de §15.4. No se movió: `achievementIsAvailable` cuenta un secreto como disponible
**tenga detector o no** («su mecánica es intriga, no pronto»).

O sea: **un secreto sin detector entra en el denominador de la UI sin que nadie pueda
ganarlo** — que es exactamente el bug que s146b arregló, entrando por la puerta de atrás.
Hoy los 12 secretos tienen detector, así que se aserta:

> `logros: N secreto(s) SIN detector — un secreto cuenta como disponible en el denominador
> de §15.4 aunque nadie pueda ganarlo`

y se probó en rojo con su propio caso (R26). **Salió de medir, no del plan** — igual que
la biyección 97 = 97 de s150.

---

## 4. Las pruebas negativas: 26 rojos, EXIT=1, restaurados byte a byte

El listón de s150 era ese y no se rebajó: **cada comprobación nueva se puso roja a
propósito** con un driver que guarda los bytes originales, rompe, corre el verify entero,
restaura en un `finally` y **comprueba el hash** en vez de suponerlo.

| | Rojo provocado | Lo que probó |
|---|---|---|
| R1 | una clave EN cambia de nombre | biyección en las **dos** direcciones |
| R2 | se borra una clave ES | censo 508/509 + huérfana en EN |
| R3 | `content/breathe.js` se adelanta a `onboarding.js` | override **D-1** |
| R4 | `content/*` escribe en `PACE_STRINGS.es` | deja de ser un patch EN |
| R5 | fila inventada en `PRECACHE` | **archivo inexistente** (`addAll` es atómico) |
| R6 | `/index.html` duplicado | duplicados |
| R7 | una ruta entrecomillada en un comentario | **trampa s146** (scripts que leen por líneas) |
| R8 | se borra la fila de `first.sip.webp` | máscara del mapa **sin precachear** |
| R9 | `const PRECACHE` deja de reconocerse | **«el análisis no ha mirado nada»** |
| R10 | `.extra.jsx` antes que `exercise-glyphs.jsx` | orden del mapa que muta |
| R11 | dos claves de glifo colapsan | censo 46/47 |
| R12 | desaparece `first.sip` del catálogo | censo + detector y máscara **huérfanos** |
| R13 | id duplicado | duplicados |
| R14 | `cat: 'inventada'` | categoría fuera de `CAT_META` |
| R15 | máscara nueva sin `.webp` ni logro | 4 fallos a la vez **+ el build también abortó** |
| R16 | se cae una fila del mapa | `.webp` huérfano + precache descuadrado + **53 → 52** |
| R17 | `secret.backup` deja de ser secreto | la descomposición **53 + 5** |
| R18 | un grupo de más en los 4 catálogos | Respira 21 · Mueve 15 · Estira 15 · Caminos 8 |
| R19 | `ACHIEVEMENTS_AVAILABLE` = catálogo entero | **§15.4**, el denominador de la UI |
| R20 | `PACE.html` deja de declarar `strings/*` | «no ha mirado nada» |
| R21 | el catálogo sale vacío | «no ha mirado nada» |
| R22 | se cae un id de `IMPLEMENTED` | censo de detectores |
| R23 | se cae una categoría de `CAT_META` | censo + categoría huérfana |
| R24 | un archivo revienta al evaluarse | **«no se pudo evaluar»**, no un cero silencioso |
| R25 | `PACE.html` deja de declarar `.extra.jsx` | declaración de glifos |
| R26 | un **secreto** pierde su detector | el hueco del §3 |

**Los 26 devolvieron EXIT=1** y los **15 archivos tocados volvieron byte a byte**
(comprobado con SHA-256 contra los hashes congelados antes de empezar, y confirmado con
`git status`: solo `verify.js` modificado y `verify.integridad.js` nuevo).

**Dos hallazgos de las propias pruebas**: en R15 el **build ya abortaba solo** por el
asset inexistente (guardarrail de s146, sigue vivo), y en R24 el análisis de ámbito de
s150 cazó el símbolo inventado **antes** que la tanda nueva — las dos redes se solapan
donde deben.

---

## 5. El verify sigue declarando sus huecos, y ahora declara los nuevos

La propiedad de s150 no se toca: **lo que se añade, se declara**. Sale del bloque
`NO_CUBRE` la línea *«integridad de catálogos, i18n, precache y glifos (D5: segunda
tanda)»* — ya está hecha — y entran cinco huecos nuevos, que se imprimen también en verde:

- **i18n**: se comprueba que la clave **exista** en los dos idiomas, no que el texto esté
  traducido, sea correcto ni **quepa** (s151: 85 px por columna en la placa del onboarding).
- **catálogos**: se cuentan entradas, no se valida su contenido (dosis, cues, pasos, acceso).
- **precache**: que el archivo exista **en disco**, no que el servidor lo sirva ni que la
  caché real del navegador cuadre.
- **glifos**: se cuentan mapa y ficheros — **ni un píxel** del dibujo se mira.
- **el CENSO es un censo**: si el contenido crece a propósito, hay que subirlo a mano.

---

## 6. Verificación

**`npm run verify` PASA — 0 problemas en 4,8 s**, ahora en cuatro tandas y con **23
comprobaciones nuevas**. 46 `.js` + 72 `.jsx` · build en 0 · 98 módulos = 98 bloques · 97
archivos de `app/` declarados · ningún identificador sin ligar · versión **v0.85.0**
coherente en los tres sitios · `PACE_standalone.html` restaurado (`998E3E358D689036`).

`index.html` regenerado a mano y **difiere de HEAD en exactamente 2 líneas** — `<title>` y
`PACE_VERSION`. Ningún archivo de `app/` cambió esta sesión.

**Sobre `index.html`, con SW y cachés purgados y estado limpiado desde la página viva:**

- `typeof Babel === 'undefined'`, **0** scripts `text/babel`, `<link rel="manifest">`
  presente, `PACE_VERSION` v0.85.0.
- **Onboarding de primera vez aparece** con el estado limpio (ver la trampa de abajo).
- **Logros**: **53** sellos con máscara y **ninguno** secreto · tras desbloquear
  `secret.bilingual`, **54 en el modal** y 1 fuera (el toast) · **12 → 11** tarjetas `?????`.
- **Pomodoro** 25:00 → **24:58**, CTA «Empezar foco» → «Pausar» → «Continuar».
- **Hidrátate** 0 → **2**, y **persiste tras recargar**.
- **`first.sip` se desbloquea** y sobrevive a la recarga: sidebar **LOGROS 1/88** — el
  denominador **88** de §15.4, el mismo que aserta el verify.
- **Paleta** crema → oscuro: `rgb(29,26,20)` y `rgb(237,229,211)`, los valores de
  `DESIGN_SYSTEM.md`.
- **Consola sin errores** (los dos avisos de Babel son el buffer stale conocido: en el
  documento vivo Babel no existe).

**Y la medición que el checker estático NO puede hacer, hecha a mano para contrastarlo:**
la caché real del service worker es `pace-v0.85.0` con **86 entradas** —las mismas 86
filas que aserta el verify, o sea que `addAll` no falló ni una ruta— de las cuales **58**
cuelgan de `/logros/`, y `manifest.webmanifest` responde desde caché. **El número
estático y el del navegador coinciden.**

### Trampa propia, anotada

Reporté «el onboarding no aparece al limpiar el estado» y **no era cierto**: mi primer
`location.reload()` no había completado cuando medí, así que estaba leyendo el documento
**anterior**, montado cuando el estado todavía tenía `firstSeen`. Repetido midiendo
`performance.now()` para confirmar que el documento era nuevo, el onboarding **sí
aparece**. Mismo patrón que el 55 vs 54 del §1 y que el `.click()` de s151: **el
instrumento miente antes que el código**.

---

## 7. Estado al cerrar

Segunda tanda **cerrada**. El `verify` pasa de 3 tandas a 4 y de ~9 comprobaciones a 32.

**El siguiente paso natural es el CI**, que es lo que estaba esperando a esto: GitHub
Actions/YAML, Wrangler, Playwright y proteger `main` — no existe `.github/` (verificado
en s149) y ahora **ya hay algo local que el YAML puede invocar**.

De la lista de s149 siguen abiertas **D3** (sidebar racha+récord contra §37-bis), **D6**
(Travesías con mapa) y **D7** (spike de Capacitor).
