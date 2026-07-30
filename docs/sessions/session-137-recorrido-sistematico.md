# Sesión 137 — Recorrido sistemático: 10 bloques del audit × 16 fases

**Fecha:** 2026-07-30
**Tipo:** SOLO-DOCUMENTAL — sin versión nueva, cero código, cero build
**Versión de referencia:** v0.71.0

---

## Por qué esta sesión

Dos huecos seguidos —Respira en s134, logros en s136— los destapó la lista del usuario, no mi
auditoría. La causa era de método: construí las fases desde el feedback beta y los bloqueantes de
venta, **sin recorrer uno por uno los Bloques 0–9 del audit**. El usuario pidió el recorrido en
profundidad. Esto es ese recorrido.

Material cruzado: los **10 bloques de §23**, los **4 backlogs vivos de `STATE.md`** (Diferido,
Pendiente, Backlog s117, Backlog de pulido s96), la **tabla de deuda técnica** y las **8 deudas
semánticas**.

## Resultado: 8 de 10 bloques ya estaban cubiertos

Bloques 1 (Respira/Loto), 3 (Caminos), 4 (Travesías), 5 (Viajes → fuera de v1 explícito),
6 (logros), 7 (Mueve/Estira), 8 (premium) y la parte de eventos del 9.

**Convergencia encontrada:** las pills «Breve / Tranquilo / Amplio» que el backlog de s117 pedía
revisar visualmente **son los botones del descanso entre series** — el mismo bug del botón
fantasma que el usuario reportó. Mismo ítem con dos nombres, ya cubierto en la Fase 1.6.

## Once huecos, colocados

**§17 «Pausa PACE» — el más importante.** El BreakMenu solo **ordena** módulos; debe
**recomendar una acción concreta** («llevas 50 minutos sentado, te propongo Hombros ligeros, 4
minutos y sin material»). Es además el **consumidor del feedback ligero** que se captura desde
s116 **sin que nadie lo use**, y responde al problema D del posicionamiento (§27.3): «sé que
debería parar, pero no sé qué me conviene». No estaba en ninguna fase → **FASE 3.5**, detrás de
eventos porque necesita historial real.

**A la FASE 8.5 (saneamiento, nueva):** trocear lo que pasa de 500 líneas —**`tokens.css` con
613**, el peor y el que nadie miraba, más `exercise-glyphs.jsx` ~513 y `Sidebar.jsx` ~510— ·
**accesibilidad** (tarjetas sin teclado, onboarding sin focus trap) · **tests del state (A-6)** e
**import sanitizado (A-7)** · **i18n robustez (I18N-2)** más las deudas semánticas **D-1**
(override silencioso en `content/breathe.js`), **D-2** («Hecho hoy» duplicado) y **D-3**
(namespaces `path.*`/`paths.*` mezclados) · **bump automático de versión** · **timer de Mueve por
timestamps**.

**A fases existentes:** el **onboarding contextual** (Bloque 2) a la Fase 8 — sin capturar si
trabajas sentado, si puedes levantarte, si hay suelo, espacio, ruido o material, los filtros no
tienen con qué filtrar —, y los **logros de Caminos y de Travesías** a las Fases 6 y 7, para que
nazcan con ellas.

## La decisión grande: Android entra en v1

El usuario preguntó qué recomendaba. Le di el coste medido: el **envoltorio de Capacitor es
barato** porque la app ya es estática y sin servidor, pero **Google Play obliga a usar Play
Billing**, y eso choca de frente con una licencia offline sin cuentas ni backend. Implica
construir un **segundo camino de entitlement** y reconciliarlo, justo cuando aún no hay ningún
comprador que valide el precio. Estimación: **4–6 sesiones más** y dependencia de los ciclos de
revisión de Google.

También señalé que «los usuarios importantes serán móviles» es hoy una **hipótesis**, y que el
propio posicionamiento —«para quienes trabajan sentados», acompañante durante la jornada— apunta
a que el bucle central ocurre delante del ordenador.

**Recomendé web primero. El usuario eligió Android en v1 igualmente, con el coste asumido.** Se
ejecuta así. **iOS queda fuera de v1.**

Consecuencia que hay que respetar desde ya: la **Fase 3 (eventos) debe implementar la arquitectura
por adaptadores** tal como se diseñó en s117, y el entitlement debe seguir pasando por
`app/state-entitlement.jsx` como **punto único**. Si eso se incumple, Android obliga a reescribir
en vez de añadir.

## Limpieza: dos entradas obsoletas

`STATE.md` afirmaba cosas falsas: el scrollbar del runner figuraba como «sigue sin tocar» cuando
**s125 lo resolvió**, y el §0 de alturas menores de 720px seguía como pendiente cuando **s126 y
s128 lo cerraron**. Ambas quedan marcadas, conservando el texto por su diagnóstico medido.

Es una muestra de los ~21 KB de backlog de `STATE.md` que siguen sin revisar uno por uno.

## El plan completo

1 Dirección ✅ · **1.5 Pulido visible ⏭** · 1.6 Ajustes · 2 Mueve y Estira · 2.5 Logros ·
3 Eventos · **3.5 Pausa PACE** · 4 Stats · 5 Respira · 6 Caminos · 7 Travesías · 8 Descubrimiento ·
**8.5 Saneamiento** · **9 Capacitor Android** · 10 Venta.

**Fuera de v1:** Viajes de respiración con voz, música y facilitadores · CTB · **iOS** · extensión
Chrome · Vite/ESM · Path Builder público · Modo Retiro · temporadas · empresas · Wrapped.
