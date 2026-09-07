# s187 · La pausa que propone

**Fecha:** 2026-09-07 · **Versión publicada:** v0.118.0 · **Suite:** 209 → **215**

> Sesión de una sola idea, sacada de la revisión de referencias de s186: al
> terminar un Pomodoro la app **sabe** cuánto llevabas sentado y no lo usaba.
> Antes de tocarla, dos medidas: una dijo que el onboarding no es el problema, y
> la otra decidió el diseño entero del menú.

---

## 0 · El banco del primer minuto: ahí no estaba el problema

Las guías de onboarding de 2026 repiten lo mismo —valor en el primer minuto, dos
o tres preguntas como mucho—, así que antes de tocar el flujo había que saber si
aquí hay algo que arreglar. `scripts/audit/banco-primer-minuto-s187.js` recorre
una instalación **nueva de verdad** (sin sembrar estado: `firstSeen == null` es
lo que dispara el flujo) y cuenta lo que es del producto:

| | Pantallas | Pulsaciones | ¿Acaba con sesión corriendo? |
|---|---|---|---|
| Atajo | 2 | **2** | sí |
| Completo | 6 | 9 | sí |

Idéntico en móvil y en escritorio. **El suelo son dos toques.** Y las dos rutas
terminan con una sesión corriendo, no en una pantalla de bienvenida.

**No mide segundos a propósito**: un bot recorre el flujo a velocidad de máquina
y un «tardas 4,2 s» sería un número falso sobre una persona. La primera versión
de su cabecera prometía medir la *espera impuesta* por la app; no la mide, y
ahora lo dice en vez de prometerlo.

Lo único con grasa: cada pregunta cuesta **dos** toques (elegir y «Continuar»),
o sea tres pulsaciones que solo confirman lo que acabas de decir. Auto-avanzar
lo dejaría en 6, pero quita la posibilidad de cambiar de idea y en un flujo con
este tono puede leerse como prisa. **Se deja escrito sin tocarlo**: es decisión
de producto, no una obviedad.

Dos cosas que el banco enseñó a su costa, y que están dentro: el flujo se busca
**por su diálogo** (la home vive detrás con su propio «Empezar foco» tapado — 30
segundos intentando pulsar un botón invisible) y en las preguntas **el primer
botón del DOM es «Atrás»**, que devolvía a la bienvenida y hacía dar vueltas al
bucle.

---

## 1 · La medida que mandó el diseño

La propuesta se pintó primero —tres variantes a tamaño real— y el usuario eligió
la B: una propuesta arriba con nombre y las cuatro puertas intactas debajo. Su
único coste declarado era «el modal crece ~110 px, habrá que ver si cabe».

**Se midió antes de implementar, y la medida cambió la variante:**

| | Alto del modal | Hueco libre |
|---|---|---|
| 390×844 | 616 px | 12 + 12 |
| 390×736 | 616 px | 12 + 12 |
| 390×667 | 616 px | 12 + 12 |
| **360×640** | **616 px** | **24 en total** |

El modal ocupa **616 px fijos** en los cuatro teléfonos y el contenedor **no
scrollea** (0 px), así que crecer no habría degradado suavemente: habría roto la
regla de que una pausa no enseña barra de scroll.

Por eso la propuesta **entra en el sitio que ya había**: el hueco reservado del
sello «Para ti» (que existe desde s139 para que la tarjeta recomendada no
descuadre la fila) y las descripciones de las cuatro tarjetas, **que sobran en
cuanto arriba hay una rutina con nombre y duración**. Medido después: **601 px**,
quince menos que antes.

**Los glifos se quedan** —petición del usuario— y con razón: son los mismos de la
ActivityBar y son lo que hace cada tarjeta reconocible de un vistazo.

---

## 2 · La regla, escrita antes de codificarla

Una sola propuesta, y la primera condición que se cumple gana. El orden va de lo
que **acaba de pasar** a lo que es cierto en general:

1. **Bloque de 35 min o más** → Estira · «Llevas 45 minutos sentado»
2. **Cero vasos y pasado el mediodía** → agua · «Aún no has bebido hoy»
3. **Tercer bloque de hoy** → Respira · «Tercer bloque de hoy»
4. **Algo pendiente del plan** → ese módulo
5. **Nada** → no se propone nada

La quinta es la que evita que esto sea publicidad. Y el copy de la tercera dice
**«de hoy» y no «seguido»**: `state.cycle` se pone a cero en el relevo de día,
así que cuenta los bloques de hoy pero no sabe si fueron seguidos o con tres
horas en medio.

**Lo que no entra, decidido y escrito**: lo que hiciste ayer (está en
`pace.events.v1`, pero un menú que se abre dos segundos no es sitio para comparar
días), el perfil del onboarding (mezcla una intención de hace semanas con lo que
pasa ahora) y **cualquier racha o total** — presión disfrazada de dato.

La rutina concreta la elige `libraryParaAhora`, que ya rota por día, ordena por
duración y respeta el acceso premium. Y **«Empezar» entra en esa rutina por las
mismas puertas que la biblioteca** —el modal de apnea y el preview de §18.3—, no
por un camino paralelo que se olvide de un guard.

---

## 3 · Dos mutantes que obligaron a arreglar el código

De los seis calibrados, dos no mordían **y tenían razón**:

- **El filtro de seguridad estaba en DOS sitios**, el pozo y el predicado, así
  que quitarlo de uno no ponía rojo nada: no había forma de saber si alguno
  funcionaba. Es exactamente el defecto que s166 destapó con el reloj de
  retención. Ahora vive en uno solo.
- **El aserto de la apnea miraba un solo día** y el recomendador **rota por
  día**: pasaba por casualidad. Ahora recorre 30 fechas y exige que ninguna
  proponga una rutina con aviso.

## 4 · Y tres trampas del banco de pruebas

- El menú **no** es `[role="dialog"]`: se localiza por su pie.
- Un `fastForward` grande **no lo abre** — el tick que cruza el cero no llega a
  dispararse. De minuto en minuto.
- El estado sembrado necesita `lastActiveDay` **en formato `toDateString()`**
  («Mon Sep 07 2026»), no ISO: la comparación del relevo de día es una igualdad
  de cadenas, así que un ISO no coincide nunca y el estado se resetea igual. Se
  descubrió leyendo el estado ya cargado, no el que se sembró.

---

## La red

| Añadido | Qué defiende |
|---|---|
| **6 tests** en `tests/pausa-propone.spec.js` | La propuesta, su orden, que entra en la rutina y no en la biblioteca, y que sin motivo no hay nada |
| El aserto de la **altura** | Que la propuesta no haga crecer el modal. Si alguien devuelve las descripciones, rojo |
| El aserto de la **apnea, en 30 días** | Que el recomendador nunca saque una rutina con aviso, y no por suerte |
| `scripts/audit/banco-primer-minuto-s187.js` | Que el primer minuto siga siendo de dos toques |

**Mutantes: 6, y los 6 muerden.** Sin compactar · propone sin motivo · orden roto
· vuelve a abrir la biblioteca · dos recomendaciones a la vez · sin filtro de
seguridad.

## Lo que NO cubre

- **La propuesta no se prueba en inglés**, solo el camino en español.
- **No hay aserto de que el copy sea cierto**: que «llevas 45 minutos sentado»
  corresponda al bloque real se comprueba leyendo, no midiendo.
- `main.jsx` **queda en 500 líneas exactas**. Lo siguiente que entre ahí obliga a
  trocear.
