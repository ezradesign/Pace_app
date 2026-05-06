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
5. Verifica que `PACE_standalone.html` existe
6. **Confirma al usuario el estado antes de tocar nada**

**Nunca reinventes componentes existentes.** Lee primero, edita después.

---

## 🔒 Cierre de sesión (obligatorio tras cambios significativos)

Cuando el usuario diga "cierra sesión" o al terminar un cambio significativo:

1. Verificar que la app carga limpia en consola (sin errores)
2. Rotar standalone anterior → `backups/PACE_standalone_vX.Y_YYYYMMDD.html` (máx **20 backups**)
3. Regenerar `PACE_standalone.html` con `node build-standalone.js`
4. Verificar el nuevo standalone
5. Escribir diario en `docs/sessions/session-NN-titulo-corto.md`
6. Actualizar `CHANGELOG.md`: fila en tabla + detalle de las 2 últimas versiones
7. **Reescribir** (no añadir) sección "Última sesión" de `STATE.md`
8. Actualizar backlog/decisiones activas de `STATE.md` si aplica
9. Actualizar `DESIGN_SYSTEM.md` / `CONTENT.md` / `ROADMAP.md` si hubo cambios
10. Dar el mensaje exacto de commit sugerido para GitHub

**Cambio significativo:** cualquier cambio funcional, de diseño notable o estructural.
Tweaks visuales menores no regeneran standalone pero sí se anotan en `STATE.md`.

---

## 📒 Un único sitio por tipo de información

| Tipo | Dónde vive |
|---|---|
| Estado actual del proyecto | `STATE.md` (se reescribe cada sesión) |
| Backlog + decisiones vigentes | `STATE.md` |
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
├── PACE_standalone.html         ← bundle offline (regenerado cada sesión)
├── build-standalone.js          ← genera el standalone
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
│   ├── welcome/   WelcomeModule.jsx
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

---

## 🎯 Producto · Tono · Visual

**Módulos:** Foco (Pomodoro 15/25/35/45 min) · Respira (breathwork guiado) · Mueve (movilidad silla) · Estira (calistenia oficina) · Hidrátate (tracking vasos)

**Tono:** calmado, artesanal, cuidado. Sin gamificación agresiva. Sin métricas abrumadoras. Copy corto en español ("¿Qué quieres cultivar hoy?").

**Visual:** paleta tierra (oliva, crema, terracota, negro tinta). Serif italic para títulos. Ver `DESIGN_SYSTEM.md` para tokens completos.

---

## 🧪 Checklist de cierre

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

## 📐 Versionado: `v0.X` pre-lanzamiento · `v1.0` web+Chrome · `v2.0` Android
