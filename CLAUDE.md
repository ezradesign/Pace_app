# PACE · Foco · Cuerpo

> Web app + extensión Chrome + app Android de productividad y salud para trabajo de oficina/remoto.
> Logo: una vaca paciendo ("pace" = ir a tu ritmo). Stack: React 18.3.1 + Babel standalone 7.29.0.

---

## ⚡ Arranque de sesión (obligatorio)

Antes de tocar **nada**:

1. Lee `CLAUDE.md` (este archivo)
2. Lee `STATE.md` — versión, última sesión, backlog, decisiones activas
3. Lee `DESIGN_SYSTEM.md` — tokens, paletas, tipografía
4. Lista `app/` para ver la estructura real
5. Verifica que `index.html` (artefacto web/PWA) y `PACE_standalone.html` existen
6. **Confirma al usuario el estado antes de tocar nada**

**Nunca reinventes componentes existentes.** Lee primero, edita después.

### Lectura optimizada (ahorro de tokens sin perder contexto)

- Si la sesión toca contenido, actividades, Caminos, stats o el plan de
  evolución: lee también `docs/product/DECISIONES_PRODUCTO.md` (canónico
  destilado; sustituye a re-leer los documentos largos de producto).
- Lecturas dirigidas: en archivos >300 líneas usa Grep/offset-limit, no
  lectura completa; no re-leas módulos que no vas a editar (la tabla "Red
  de seguridad" de STATE.md ya dice qué hay en cada archivo).
- No re-verifiques hallazgos ya marcados como verificados en
  `docs/audits/audit-evolucion-v0.51.0.md` (tienen evidencia file:line);
  no pidas ni pegues de nuevo los documentos de evolución originales.

---

## 🔒 Cierre de sesión (obligatorio tras cambios significativos)

Cuando el usuario diga "cierra sesión" o al terminar un cambio significativo:

1. Verificar que la app carga limpia en consola (sin errores)
2. **`npm run verify`** — red de seguridad local (s150). Corre `node --check` sobre todos los
   `.js` (también los que el build no mira: `sw.js`, `scripts/`), ejecuta el build entero y
   analiza el **ámbito del artefacto compilado**: un identificador que en `PACE.html` resolvía
   por el ámbito global de Babel standalone y dentro de la IIFE del build queda sin ligar
   **es el crash de s144**, que estuvo dos versiones publicado. Devuelve **código de salida**:
   si falla, no se sigue. Va ANTES de regenerar porque su aviso «index.html difiere de las
   fuentes» es justo la señal de que toca el paso 3. **No cubre** comportamiento, catálogos,
   i18n, precache, glifos ni CSS — los declara en cada pasada (segunda tanda, D5 de s149)
3. **Regenerar `index.html`** (el artefacto de web/PWA) con `node build-standalone.js` y verificarlo
4. **`npm run test:e2e`** — comportamiento (s154). Abre un navegador de verdad sobre el
   `index.html` **recién regenerado** y ejecuta el «Checklist de cierre» de más abajo. Va DESPUÉS
   del paso 3 a propósito: así prueba el artefacto que se va a commitear, no el anterior. Es
   **otra red** y se corre aparte del `verify`, que debe seguir costando ~5 s y no depender de
   que haya navegadores instalados. **No cubre**: móvil, inglés, Caminos, premium ni un solo píxel
5. **El standalone ya NO se regenera en cada cierre** — decisión s134: web y Capacitor son los
   objetivos canónicos y `PACE_standalone.html` pasa a **export bajo demanda**. Se regenera (y se
   rota a `backups/`, máx 20) **solo si el usuario lo pide** o antes de publicar una release.
   Motivos: no comparte `localStorage` con la web (otro origen), `file://` no emite eventos por
   diseño, instalar desde él causó el bug de icono y pantalla completa de s128 (no lleva
   `manifest`), y el catálogo de audio largo es ininlineable
6. Escribir diario en `docs/sessions/session-NN-titulo-corto.md`
7. Actualizar `CHANGELOG.md`: fila en tabla + detalle de las 2 ultimas versiones
8. **Reescribir** (no anadir) seccion "Ultima sesion" de `STATE.md`
9. Actualizar el backlog de `STATE.md` si aplica; una **decision tecnica nueva** va a `docs/product/DECISIONES_TECNICAS_VIGENTES.md` + su titulo al indice de `STATE.md`
10. Actualizar `DESIGN_SYSTEM.md` / `CONTENT.md` / `ROADMAP.md` si hubo cambios
11. Dar el mensaje exacto de commit sugerido para GitHub

> **Tras el push, el CI repite los pasos 2, 3 y 4 en GitHub** (`.github/workflows/ci.yml`):
> el job **`verify`** corre `npm run verify` **tal cual** y comprueba lo único que el verify no
> puede —que el `index.html` **committeado** sea el build de las fuentes; su aviso de deriva es
> `[INFO]` a propósito, porque el paso 2 vive justo antes del 3—, y el job **`e2e`** (s154) corre
> `npm run test:e2e` con `needs: verify`, de modo que el comportamiento se prueba sobre un
> artefacto ya demostrado al día. **El CI no comprueba nada que no corra en local**: si hace
> falta vigilar algo nuevo, se añade al `verify` o a la suite, **no al YAML**.

**Cambio significativo:** cualquier cambio funcional, de diseño notable o estructural.
Tweaks visuales menores no regeneran artefactos pero si se anotan en `STATE.md`.

---

## 📒 Un único sitio por tipo de información

| Tipo | Dónde vive |
|---|---|
| **Qué documento gobierna y qué es historia** | **`docs/product/AUDITORIA_DOCUMENTAL.md`** (índice de autoridad — consúltalo si dudas de si un documento manda) |
| Estado actual del proyecto | `STATE.md` (se reescribe cada sesión) |
| **Decisiones técnicas vigentes** (reglas que evitan regresiones) | **`docs/product/DECISIONES_TECNICAS_VIGENTES.md`** — leer la fila del subsistema ANTES de tocarlo; `STATE.md` solo lleva el índice |
| Backlog | `STATE.md` |
| Historial por versión | `CHANGELOG.md` (tabla + 2 últimas) |
| Diario de sesiones | `docs/sessions/session-NN-xxx.md` |
| Tokens / paleta / tipografía | `DESIGN_SYSTEM.md` |
| Catálogo de rutinas y logros | `CONTENT.md` |
| Visión a largo plazo | `ROADMAP.md` |
| Presentación pública | `README.md` |

**No duplicar.** Lo que está en `docs/sessions/` se enlaza, no se copia.

---

## 🏗️ Arquitectura

```
/
├── CLAUDE.md / STATE.md / CHANGELOG.md / DESIGN_SYSTEM.md
├── CONTENT.md / ROADMAP.md / README.md
├── PACE.html                    ← entry point desarrollo
├── index.html                   ← artefacto WEB/PWA (canonico, con manifest)
├── PACE_standalone.html         ← export offline BAJO DEMANDA (s134, ya no cada sesion)
├── build-standalone.js          ← genera ambos artefactos
├── playwright.config.js         ← suite E2E (s154): sirve index.html y lo conduce
├── tests/                       ← helpers.js + specs del checklist de cierre
├── manifest.json / sw.js        ← PWA
├── app/
│   ├── tokens.css / state.jsx / main.jsx
│   ├── ui/        Primitives.jsx · SessionShell.jsx · CowLogo.jsx · Sound.jsx · Toast.jsx
│   ├── shell/     Sidebar.jsx
│   ├── focus/     FocusTimer.jsx
│   ├── breathe/   BreatheVisual.jsx · BreatheLibrary.jsx · BreatheSession.jsx
│   ├── move/      MoveModule.jsx
│   ├── extra/     ExtraModule.jsx
│   ├── hydrate/   HydrateModule.jsx
│   ├── breakmenu/ BreakMenu.jsx
│   ├── achievements/ Achievements.jsx
│   ├── stats/     WeeklyStats.jsx
│   ├── tweaks/    TweaksPanel.jsx
│   ├── onboarding/ Onboarding.jsx · OnboardingScreens.jsx · pickFirstPath.js
│   ├── support/   SupportModule.jsx
│   └── i18n/      strings.js · strings-content.js · useT.jsx
└── backups/       PACE_standalone_vX.Y_YYYYMMDD.html (máx 20)
```

---

## 🧑‍💻 Reglas de código

1. **Archivos < 500 líneas.** Si crecen, trocear.
2. **Cada JSX exporta a `window`** al final: `Object.assign(window, { ComponentName });`
3. **Estilos con nombre único**: `const focusTimerStyles = {}` ✅ · `const styles = {}` ❌
4. **Orden de carga en `PACE.html`:** `i18n/*` → `state.jsx` → `ui/*` → `shell/*` → módulos → `main.jsx`
5. **No usar `type="module"`** — rompe Babel standalone
6. **Hooks de React** del global: `const { useState } = React;`
7. **Estado persistente** en `localStorage` bajo `pace.state.v2`
8. **Variables en `.map()`** nunca deben coincidir con variables del scope externo (shadowing)
9. **`playSound()` siempre en `try/catch`** — el sonido nunca debe romper la app
10. **Prohibido `new Date("YYYY-MM-DD")`** — parsea medianoche UTC y rompe rachas en husos negativos. Claves ISO siempre con `parseLocalDateKey()` (state-history.jsx)

---

## 🎯 Producto · Tono · Visual

**Módulos:** Foco (Pomodoro 15/25/35/45 min) · Respira (breathwork guiado) · Mueve (movilidad silla) · Estira (calistenia oficina) · Hidrátate (tracking vasos)

**Tono:** calmado, artesanal, cuidado. Sin gamificación agresiva. Sin métricas abrumadoras. Copy corto en español ("¿Qué quieres cultivar hoy?").

**Visual:** paleta tierra (oliva, crema, terracota, negro tinta). Serif italic para títulos. Ver `DESIGN_SYSTEM.md` para tokens completos.

---

## 🧪 Checklist de cierre

> **Desde s154 esto lo ejecuta `npm run test:e2e`** (paso 4 del cierre): 13 tests de Playwright
> sobre `index.html` en un navegador real, ~25 s. Los siete puntos de abajo son lo que aserta,
> uno a uno. **Sigue mereciendo una mirada humana** lo que la suite no cubre y declara: móvil,
> inglés, Caminos, premium y cualquier cosa visual — no compara ni un píxel.

- [ ] Pomodoro cuenta y termina → abre BreakMenu
- [ ] Respira: librería · modal seguridad (Rondas) · sesión animada
- [ ] Mueve: librería · sesión con pasos y countdown
- [ ] Hidrátate: +/− funciona · persiste al recargar
- [ ] **Logros: primer logro desbloquea y muestra toast** ← crash conocido si falla Toast.jsx
- [ ] Tweaks: cambiar paleta cambia colores
- [ ] Recargar → estado persiste (localStorage)

---

## 🚫 Qué NO hacer

- ❌ Emojis en la UI (rompe el tono artesanal)
- ❌ Gradientes llamativos, sombras exageradas, tipografías trilladas (Inter, Roboto)
- ❌ Gamificación agresiva (streaks rojos, notificaciones abrumadoras)
- ❌ Consejos médicos sin disclaimer (apnea SIEMPRE lleva modal de seguridad)
- ❌ Archivos > 500 líneas
- ❌ Acumular historia en `STATE.md` — va al diario de sesiones
- ❌ Duplicar entre STATE + CHANGELOG + diario

---

## 📐 Versionado

`v0.X` pre-lanzamiento · **`v1.0` = primera version PAGADA** (web/PWA con licencia offline **+ Android via Capacitor con Play Billing**; decisiones s132/s137) · **iOS despues de v1**.
Orden de trabajo vigente: seccion «Camino a v1.0» de `ROADMAP.md` (15 fases: 1 a 10 con intermedias 1.5, 1.6, 2.5, 3.5 y 8.5).
