# Sesión 142 — Fase 2, ola C: el inglés fuera del español

**Fecha:** 2026-07-31 · **Versión:** v0.74.0 → **v0.75.0** · Sesión de **CÓDIGO**.

La ola B (dibujar los 20 glifos que faltan) queda **en pausa**: depende del arte del
usuario y la regla D-4 dice que lo aporta él. Se ejecuta la **ola C**, que es la que
más mueve la aguja de la queja beta y no depende de nadie.

**Resultado en una línea: de 31 nombres con término inglés a 1.**

---

## 1 · Los 30 renombrados

Propuestos con la técnica real de cada ejercicio delante (no por traducción
automática) y aprobados por el usuario, que cambió dos: `Cossack squat` →
**Sentadilla lateral** (en vez de «cosaca») y `Sissy squat` → **Sentadilla de
cuádriceps** (en vez de «sissy»).

| Antes | Ahora | | Antes | Ahora |
|---|---|---|---|---|
| Ankle circles | Círculos de tobillo | | Chin tucks | Barbilla atrás |
| Wrist circles | Círculos de muñeca | | Cossack squat | **Sentadilla lateral** |
| Wrist stretch | Estiramiento de muñeca | | ATG split squat | Zancada profunda |
| Finger extension | Extensión de dedos | | Scapular wall slides | Deslizamientos en pared |
| Squeeze fist | Abrir y cerrar el puño | | Ground sitting transitions | Sentarse y levantarse del suelo |
| Calf raises | Elevación de talones | | Elephant walk | Marcha del elefante |
| Tibialis raise | Elevación de puntas | | World's greatest stretch | Zancada con apertura |
| Scapular squeeze | Juntar omóplatos | | Sissy squat | **Sentadilla de cuádriceps** |
| External rotation | Rotación externa | | Chest opener | Apertura de pecho sentado |
| Thoracic extension | Extensión torácica | | Deep squat hold | Sentadilla profunda sostenida |
| Band pull-apart | Apertura con banda | | Squat profundo | Sentadilla profunda |
| Seated twist | Giro sentado | | Dead hang · opcional | Suspensión pasiva · opcional |
| Shrug + round | Encogimiento de hombros | | Rib pull + respiración | Apertura de costillas + respiración |
| Wall sit | Silla en la pared | | Crawling | Gateo |
| Pigeon | Paloma | | Deep breaths | Respiraciones profundas |

`Elevación de talones` y `Elevación de puntas` quedan como pareja simétrica —gemelo y
tibial—, que es lo que son.

**`Superman` se queda**, decisión de s141: es nombre propio legible en español y lo que
reportaron los beta testers eran términos **ilegibles**.

---

## 2 · Hallazgo: cuatro glifos con dibujo propio que no se pinta nunca

`ExerciseGlyph` resuelve **el alias primero**:

```js
const vid = resolveVisualId(id);
const Glyph = EXERCISE_GLYPHS[vid] || EXERCISE_GLYPHS[id];
```

El `|| EXERCISE_GLYPHS[id]` solo entra si el destino del alias **no** tiene dibujo. Como
`Chest opener`, `Deep squat hold`, `Deep breaths` y `Dead hang · opcional` tienen alias
**y** entrada propia en `EXERCISE_GLYPHS`, sus cuatro dibujos están **tapados**: no se
pintan nunca. Con `Nordics` (sin uso), son **5 de 47 dibujos muertos**.

**Por qué importaba justo ahora:** al renombrarlos, el nombre nuevo no tendría alias ⇒
resolvería a sí mismo ⇒ **su dibujo tapado se habría activado solo**, cambiando lo que se
ve sin que nadie lo pidiera. Se evita dando al nombre nuevo el **mismo destino** que tenía
el viejo. Verificado en runtime: los cuatro resuelven al mismo sitio que antes.

Queda como decisión de catálogo: o se borran esos 5 dibujos, o se quita su alias para que
cada ejercicio use el suyo. **No se decide aquí** — es criterio visual del usuario.

---

## 3 · Método: tres intentos hasta que el script fue de fiar

El renombrado se hizo con un script de reemplazos **con contexto** (`name: '…'`, clave de
glifo, entrada de registro) y guardarraíl de conteo. Falló dos veces y las dos veces el
guardarraíl evitó escribir a medias:

1. **`World's greatest stretch` no aparecía.** El mismo nombre se escribe con **comilla
   simple escapada** en `ExtraModule.jsx` y con **dobles** en el registro. Hay que probar
   las dos formas o el renombrado se deja una a medias. (Es la tercera vez que ese
   apóstrofo muerde: ya rompió el parser de la matriz en s141.)
2. **`VISUAL_ALIAS` con claves duplicadas.** Añadir líneas al final creaba una segunda
   entrada para los cuatro nombres que ya tenían alias, y **en JS gana la última** ⇒ el
   destino cambiaba justo en los cuatro casos delicados del punto 2. Se corrigió
   **regenerando el objeto entero** desde un mapa calculado, no añadiendo líneas.
3. **Emitir literales JS sin escapar el apóstrofo** rompía el archivo
   (`'World's greatest stretch'`). Ahora hay un helper `lit()` que escapa.

Un cuarto detalle: el script de realineado del i18n escribió **CRLF** en un archivo que
era LF. Se revirtió; el archivo queda en LF y con los valores alineados en la columna 52
(191 de 193 líneas; las 2 restantes tienen la clave más larga que la columna).

---

## 4 · Verificación

Con SW y cachés purgados, en la app real:

| | Antes | Después |
|---|---|---|
| Nombres únicos | 65 | **65** |
| Sin glifo | 20 | **20** |
| Con término inglés | 31 | **1** (`Superman`) |
| Alias | 34 | 39 |

Ninguna clave caída. Además: los 30 nombres viejos resuelven por alias a la identidad
nueva y llegan a su glifo; los 4 tapados resuelven **al mismo destino que antes**; los
`.js` tocados pasan `node --check`; y el runner pinta «Encogimiento de hombros» con su
glifo y anuncia «SIGUIENTE: CÍRCULOS DE MUÑECA». Consola sin errores.

---

## 5 · Cambios en el árbol

| Archivo | Cambio |
|---|---|
| `app/move/move.data.js` · `app/extra/ExtraModule.jsx` | 30 nombres de paso |
| `app/glyphs/exercise-glyphs.jsx` | 30 claves de glifo |
| `app/custom/exercise-registry.js` | 29 entradas (`Dead hang · opcional` no está en el registro) |
| `app/custom/exercise-aliases.js` | `VISUAL_ALIAS` regenerado: 39 entradas, sin duplicados |
| `app/i18n/content/custom.js` | 56 claves nuevas, **las viejas conservadas** |

`PACE_standalone.html` **no se regenera** (s134): restaurado byte-idéntico,
`998e3e358d689036`.

---

## 6 · Lo siguiente

**La ola B sigue esperando tu arte** (los 20 de la matriz). Mientras tanto, sin
dependencias: **ola E** (consumir `level`/`intensity`, que están en 22 de 28 rutinas sin
que nadie los use) o la **ola editorial** de descripciones, que responde a las quejas 1 y
3 del feedback beta pero es la más dependiente de tu criterio en cada frase.
