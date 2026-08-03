# Sesión 150 — `npm run verify`: la red de seguridad local

**Fecha:** 2026-08-03 · **Versión:** v0.82.0 → **v0.83.0** · **Frente:** único (fase A de
la auditoría integral, adoptada por **D1** de s149) · **Alcance fijado por D5**: build +
artefacto + `node --check`. Nada de catálogos, i18n, precache ni glifos.

---

## 0. El resultado en una línea

`npm run verify` existe, tarda **4,5 s**, devuelve **código de salida**, y **falla con el
crash de s144** señalando `app/main.jsx:23` — el archivo y la línea exactos.

---

## 1. El punto de partida no era el que decía el enunciado

`scripts/audit/` tiene trece piezas. La instrucción decía que **ninguna devuelve código de
salida**. Medido: **diez de las trece terminan en `main().catch(e => process.exit(1))`**.

La diferencia importa, porque cambia lo que hay que construir:

- Salen con 1 **si el script revienta**.
- **Ninguna sale con 1 si lo que miden está MAL.** Son bancos de medición: imprimen un
  JSON o una tabla y terminan en 0 tanto si el número es bueno como si es desastroso.

Es decir: la carencia no es el `process.exit`, es que **no hay ningún aserto**. Un checker
no es un medidor con `exit(1)` pegado al final; es un medidor que sabe qué valor es
inaceptable. Por eso no se reaprovecha ninguna tal cual.

**Lo que sí se reaprovecha, y es lo que hizo la sesión viable:** el patrón de
`inventario.js` — cargar los archivos del proyecto **compilados con el Babel del build**
en vez de leerlos a ojo. `verify.js` no copia su código, pero hereda su tesis: si el dato
está en el árbol, se saca del árbol.

Lo que **no** se toca: `glifos-v2.js` y `revision-glifos.js` no son auditoría, son
**dependencias vivas de la ingesta de arte** (`ingest-glifos-logro.js` requiere el
primero). Ni se mueven ni se tocan.

---

## 2. Por qué el listón es el crash de s144, y por qué `node --check` no lo caza

El bug: `const [view, setView] = useState(...)` en `main.jsx`, **sin declarar `useState`**
en ese archivo.

- En `PACE.html`, Babel standalone evalúa cada `<script text/babel>` por eval indirecto:
  el `const { useState } = React` de **otro** archivo vive en el mismo entorno léxico
  global y el `useState` pelado resuelve. **La app funciona.**
- El build envuelve **cada módulo en su IIFE** (a propósito, s103: es lo que evita el
  «Identifier already declared» entre archivos). Dentro de la IIFE ese `const` ajeno ya no
  alcanza ⇒ `useState is not defined` **al renderizar**.

De ahí las dos propiedades que lo hicieron tan caro: la sintaxis es **impecable** (así que
`node --check`, el parser de TypeScript del build y Babel lo dan por bueno) y el fallo es
**de ejecución, no de carga** (así que tampoco basta con evaluar el artefacto: hay que
renderizar). Estuvo **dos versiones publicado**.

**La herramienta que sí lo caza es el análisis de ÁMBITO del compilado.** Se parsea cada
bloque IIFE del artefacto y se piden los identificadores **referenciados y no ligados en
ningún ámbito** (`scope.globals` del `Program`, vía el propio `@babel/core` del build).
Todo lo que quede ahí y no sea plataforma ni esté publicado en `window` es un `undefined`
esperando su turno.

### La calibración, que es lo que decide si la idea sirve

Medido sobre el artefacto **sano** de v0.82.0:

| Medición | Valor |
|---|---:|
| Bloques IIFE en `index.html` | **98** |
| Módulos que declara `PACE.html` | **98** |
| Nombres publicados en `window` por el artefacto | **336** |
| Identificadores sin ligar, distintos | **225** |
| …de ellos, **no** publicados en `window` | **38** |

Y los 38 son, **uno por uno**, globales de plataforma: `window`, `Object`, `React`,
`Math`, `document`, `Date`, `localStorage`, `CustomEvent`, `ResizeObserver`… **Cero ruido
de la app.** Ese es el dato que hace viable el checker: la lista de permitidos no es una
concesión, es la frontera real, y un `useState` pelado aparece como el nombre 39.

---

## 3. La prueba de aceptación: tiene que ponerse ROJO

Reproducido a propósito en `app/main.jsx:23` (`useStateMain` → `useState`), que es
literalmente el bug de s144:

```
[FALLA] identificador SIN LIGAR en el artefacto: `useState` en app/main.jsx:23
        En PACE.html resuelve por el ambito global de Babel standalone; dentro de
        la IIFE del build, NO. Es el crash de s144.
=== VERIFY: FALLA — 1 problema(s) en 5.2s ===   EXIT=1
```

Deshecho después, y comprobado byte a byte: `main.jsx` `05B81CEA…` antes y después,
`index.html` y `PACE_standalone.html` intactos.

**Trampa propia, cazada por esa misma prueba.** La primera versión dijo `main.jsx:24`. El
patrón capturaba el salto de línea que va detrás de `;(function () {`, así que el
compilado empezaba en la línea 2 del grupo y **todas** las líneas salían corridas en +1.
Con `retainLines` activo en el build, la línea del compilado **es** la del fuente: el +1
era mío. Si la prueba negativa hubiera sido «falla, bien» sin mirar el número, el error se
queda dentro.

**La atribución se comprueba a sí misma.** El bloque *i* corresponde a la fuente *i*
porque el build emite en un solo barrido en orden de documento, pero eso es un contrato,
no una demostración. Así que antes de nombrar un archivo, `verify.js` busca el
identificador **en ese archivo**; si no aparece, lo dice («la atribución por orden puede
estar corrida») en vez de afirmar algo falso con aplomo.

---

## 4. Los otros tres rojos, y uno que salió de medir

Un checker que solo se ha visto fallar una vez no está probado. Cada uno se rompió a
propósito y se restauró byte a byte:

| Prueba | Resultado | Por qué importa |
|---|---|---|
| **A** · `PACE.html` declara `app/no-existe.jsx` | `[FALLA]` · EXIT=1 | El build solo emite un **`[WARN]`** y sigue: el módulo **desaparece del artefacto en silencio** |
| **B** · `sw.js` en `v0.83.0` y el resto en `v0.82.0` | `[FALLA]` · EXIT=1 | Tres sitios a mano cada sesión (`state-core.jsx`, `sw.js`, `<title>`) |
| **C** · error de sintaxis en `sw.js` | `[FALLA]` · EXIT=1 | **El build no mira `sw.js` jamás** — ni `scripts/`, ni él mismo |
| **D** · archivo nuevo en `app/` sin declarar | `[FALLA]` · EXIT=1 | Ver abajo |

**La D salió de medir, no del plan.** Al comprobar si merecía la pena, resultó que
`app/` tiene **97** `.js`/`.jsx` y `PACE.html` declara **97**, con **biyección exacta y
cero excepciones**. Con un invariante así de limpio, asertarlo es gratis — y es
justamente la trampa de s148: troceas un archivo, el módulo nuevo existe en disco y
**nadie lo carga**. El análisis de ámbito lo pilla solo si alguien usa lo que ese archivo
publicaba; esto lo pilla siempre.

---

## 5. Los falsos verdes: lo que este verify NO cubre

Se cuidaron tanto como los rojos, y por eso **el propio script imprime sus huecos en cada
pasada**, también cuando pasa. Un checker que no declara sus límites invita a confiar de
más:

- **Comportamiento**: no abre navegador, no monta la app, no pulsa nada.
- **Integridad de catálogos, i18n, precache y glifos** — D5 lo deja para la segunda tanda.
- **Orden de carga**: si un módulo usa algo que se publica **después**, pasa. El análisis
  es estático; sabe si el nombre existe en algún sitio, no *cuándo*.
- **CSS, tokens y layout**: no se mira una sola regla.
- **Contenido**: copy, traducciones y datos de rutinas.
- **El standalone**: se restaura, no se analiza. `index.html` es el canónico (s134).

Dos huecos más, dichos aquí porque no caben en una línea de consola:

- La lista de plataforma tiene **99 nombres** (los 38 medidos + estándar aún sin usar).
  Ninguno puede colisionar con un identificador de PACE, pero es una lista y las listas
  envejecen: si algún día se declara ahí un nombre de la app, ese nombre deja de vigilarse.
- El recuento «98 = 98» compara declaraciones con bloques. Si el build cambiara la forma
  de su IIFE, el patrón dejaría de reconocer bloques — por eso **cero bloques es un FALLO
  explícito** («el análisis no ha mirado NADA»), no un verde silencioso.

---

## 6. Dos decisiones de comportamiento del script

**No deja rastro.** El verify corre el build de verdad, y el build reescribe los dos
artefactos. `verify.js` guarda los bytes de ambos antes de arrancar y los restaura en un
`finally` (y también con `SIGINT`, por si se corta a mano). Comprobado en cada pasada:
`PACE_standalone.html` vuelve a `998E3E358D689036`, que es el hash congelado de s134.

**La deriva de `index.html` es un aviso, no un fallo.** El paso queda en el checklist
**justo antes** de regenerar el artefacto — o sea, en el momento en que `index.html`
*tiene* que estar desactualizado. Convertirlo en rojo haría que el verify fallara siempre
en el único punto donde se le llama. Como `[INFO]`, dice exactamente lo que hace falta
oír: «falta regenerarlo (paso 3 del cierre)».

---

## 7. El checklist, al final y no al principio

Un protocolo que llama a un script inexistente es peor que ninguno, así que el paso se
añadió **después** de que el verify existiera y se hubiera puesto rojo cuatro veces. Entra
como **paso 2** del cierre de `CLAUDE.md`, entre «la app carga limpia» y «regenerar
`index.html`»; los pasos 2–9 anteriores pasan a 3–10.

---

## 8. Verificación del cierre

`npm run verify` en verde sobre el árbol real, y después el artefacto cargado en el
navegador (SW y cachés purgados, estado limpiado desde la página viva):

| Comprobación | Resultado |
|---|---|
| `npm run verify` | **PASA**, 0 problemas, 4,4 s |
| `index.html` vs HEAD | **4 líneas distintas**: `<title>` y `PACE_VERSION`, v0.82.0 → v0.83.0. Nada más |
| `PACE_standalone.html` | `998E3E358D689036` — sin tocar (s134) |
| Artefacto en el navegador | monta; `typeof Babel === 'undefined'`, **0** scripts `text/babel` |
| Home | `[data-pace-home-body]`, `[data-pace-dial-fit]`, `[data-pace-activitybar]`, CTA «Empezar foco» |
| Onboarding de primera vez | aparece al limpiar el estado (es lo esperado), y no vuelve con `firstSeen` |
| Logros | modal abre con **53 sellos pintando su máscara** + 8 glifos SVG |
| Hidrátate | registra el vaso; `water.today` **persiste tras recargar** |
| Logro | **`first.sip` se desbloquea** y queda en `achievements` |
| Consola | **cero errores** |

---

## 9. Lo que NO se hizo (y sigue siendo de quien era)

- **GitHub Actions, YAML, Wrangler, Playwright y proteger `main`**: segunda tanda.
- **Integridad de catálogos / i18n / precache / glifos**: D5.
- **D2** (copy del onboarding) y el README entero: frente B.
- **`first.return`**, el logro que no se desbloquea nunca: sigue siendo del usuario.
- **El ayudante de geometría de la home** (s149): preexistente, anotado, y antes de
  perseguirlo hay que reproducirlo en un navegador REAL.
- **Los 8 glifos flojos**, el pincel de `stats.month.first` y las 28 descripciones.

**Observación menor, sin acción:** el modal de Logros pinta **53** máscaras y el mapa tiene
**58** entradas. No es de esta sesión —el artefacto es idéntico al de HEAD salvo dos líneas
de versión— y no se persiguió; queda anotado por si algún día se cruza con el recuento de
54 que midió s149 en condiciones distintas (offline, desde caché, con otro estado).
