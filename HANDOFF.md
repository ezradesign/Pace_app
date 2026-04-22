# PACE · Handoff Package (snapshot histórico v0.9)

> ⚠️ **Este archivo es un snapshot congelado** del estado del proyecto en
> **v0.9** (sesión 1, 2026-04-22). No se actualiza.
>
> **Para retomar el proyecto hoy, empieza por:**
> - [`STATE.md`](./STATE.md) — estado actual y próximos pasos
> - [`CLAUDE.md`](./CLAUDE.md) — protocolo de trabajo y arquitectura
> - [`CHANGELOG.md`](./CHANGELOG.md) — historial por versión
> - [`docs/sessions/`](./docs/sessions/) — diario detallado de sesiones
> - [`docs/porting.md`](./docs/porting.md) — cómo portar a Next.js /
>   extensión Chrome / Android
>
> Este archivo se conserva porque describe **filosofía y decisiones de
> base** del proyecto que siguen vigentes aunque la versión haya avanzado.
> Todo lo que era "instrucciones vivas" se ha movido a los archivos de
> arriba. Si alguna descripción contradice `STATE.md` o `CLAUDE.md`,
> **éstos ganan**.

---

**Versión del snapshot:** v0.9
**Fecha del snapshot:** 2026-04-22
**Autor de diseño:** @acuradesign
**Stack:** HTML + React 18 + Babel standalone (sin build step)

---

## 🎯 1. Qué es PACE

PACE es una **web app de productividad y salud** diseñada para quien pasa
muchas horas sentado (oficina o remoto). Su filosofía:
**micro-intervenciones cuidadas a lo largo del día**, no entrenamientos
largos.

**Logo:** una vaca paciendo. Juego de palabras con "pace"
(ritmo / pacer).

**Plataformas planeadas:**
- ✅ Web app (implementada)
- 🚧 Extensión Chrome (popup + nueva pestaña) — pendiente
- 🚧 App Android — fase 2

**Módulos:**

| Módulo | Qué hace | Inspiración |
|---|---|---|
| **Foco** | Pomodoro con 15/25/35/45 min | Técnica Pomodoro |
| **Respira** | 12 técnicas de breathwork (coherencia, box, 4-7-8, Wim Hof, pranayama…) | Breathe With Sandy |
| **Mueve** | 7 rutinas de movilidad (caderas, hombros, ATG, ancestral…) | Strengthside |
| **Extra** | 7 ejercicios de calistenia discreta de oficina | Strengthside + Jess Martin |
| **Hidrátate** | Tracker de vasos de agua | — |
| **Logros** | 100 sellos coleccionables estilo "libreta de campo" | — |

**Tono:**
- Mezcla **ritual + antídoto + compañero silencioso**.
- Copy en español, literario pero funcional.
- Paleta crema + verde oliva + terracota.
- Tipografía display: EB Garamond italic.
- **Sin emojis, sin gamificación agresiva.**

---

## 💾 2. Estado y persistencia (filosofía vigente)

### Store global (`app/state.jsx`)

Patrón simple con `useSyncExternalStore`:

```js
const [state, set] = usePace();
```

**Clave raíz de localStorage:** `pace.state.v1`

**Estructura del estado** (descripción general, puede haber campos nuevos
añadidos en sesiones posteriores — ver `app/state.jsx` para la verdad
actual):
```js
{
  // Tweaks (6 ejes)
  palette, font, layout, timerStyle, breathStyle, logoVariant, soundOn,

  // Foco
  focusMode, focusMinutes, cycle, totalFocusMin,

  // Plan del día (checkboxes)
  plan: { muevete, respira, extra, hidratate },

  // Hidratación
  water: { goal, today, lastReset },

  // Logros
  achievements: { [id]: { unlockedAt, note? } },

  // Stats semanales (array de 7 días, 0=Dom)
  weeklyStats: { focusMinutes, breathMinutes, moveMinutes, waterGlasses },

  // Streak
  streak: { current, longest, lastActiveDate },

  // Intención del día (texto libre)
  intention,

  // Recordatorios (actualmente sin UI — ver CLAUDE.md)
  reminders: []
}
```

### Acciones expuestas globalmente
- `usePace()` → `[state, setState]`
- `unlockAchievement(id, note?)` → desbloquea + toast
- `completePomodoro()` → +1 ciclo, +minutos, streak, logros
- `completeBreathSession(routineId, min)`
- `completeMoveSession(routineId, min)`
- `completeExtraSession(routineId, min)`
- `addWaterGlass(delta)`
- `updateStreak()`

---

## 🔁 3. Flujos de usuario principales

### Flujo Foco (core)
1. Usuario abre app → ve timer.
2. Ajusta minutos (15/25/35/45) y modo (foco/pausa/larga) si quiere.
3. Click "Comenzar" → cuenta regresiva real.
4. Al llegar a 00:00 → `completePomodoro()` → desbloquea logros, suma stats.
5. **Aparece BreakMenu** con 3 opciones: Respira / Muévete / Hidrátate + "Saltar".
6. Si elige alguna → abre librería/tracker correspondiente.
7. Al volver, timer reseteado.

### Flujo Respira (con seguridad)
1. Usuario abre librería Respira.
2. Ve 5 categorías con 12 técnicas.
3. Selecciona una → si tiene `safety: true` (rondas, kapalabhati) →
   **modal de seguridad con checkbox obligatorio**.
4. Acepta → sesión fullscreen con círculo animado.
5. Cada fase (Inhala/Sostén/Exhala) tiene duración y escala del círculo.
6. Al completar → `completeBreathSession()` → vuelve al home.

### Flujo Mueve
1. Librería con rutinas tageadas (SIT/HIP/SHLD/ATG/ANC).
2. Selección → sesión fullscreen con pasos.
3. Cada paso: nombre grande, cue, countdown.
4. Regla inferior marca progreso total.
5. Anterior/Siguiente/Pausar.

### Easter eggs
- Click 10 veces en el logo → logro "Vaca feliz" (`secret.cow.click`).

---

## 🏆 4. Sistema de logros (filosofía)

**Total:** 100 logros en 6 categorías (lista completa en `CONTENT.md`):

1. **Primeros pasos** (1-10) — gris
2. **Constancia** (11-25) — verde oliva
3. **Exploración** (26-45) — terracota
4. **Maestría** (46-70) — dorado apagado
5. **Secretos** (71-90) — tinta oscura (se muestran como "?")
6. **Estacionales** (91-100) — multicolor

**Estética:** sello circular con border dashed + glifo italic central +
anillo exterior sutil. Al desbloquear → toast animado bottom-center.

**Implementación actual** (en el momento del snapshot): ~30 con trigger
automático. El resto están en la UI pero necesitan trigger específico.
Ver `STATE.md` sección "Backlog priorizado" para el estado actual.

---

## ⚠️ 5. Avisos importantes (vigentes)

### Seguridad médica
- Las técnicas de respiración con hiperventilación (Rondas, Kapalabhati)
  **SIEMPRE** llevan modal de seguridad con checkbox.
- Los disclaimers son **no negociables** — son técnicas reales con riesgos
  reales (apnea, desmayo).
- Si añades nuevas técnicas, evalúa si necesitan flag `safety: true`.

### Privacidad
- **Zero tracking.** Todo en localStorage. Si se añade sync, debe ser
  opt-in.
- **No copiar listas reales de usuarios / datos de terceros.**

### Copyright / Inspiración
- Las rutinas están **inspiradas** en los canales citados, no son copia
  literal.
- Los nombres de técnicas (Box, 4-7-8, Coherente, ATG) son términos
  genéricos del dominio.
- El logo "vaca paciendo" es propio del proyecto.

---

## 📞 6. Preguntas frecuentes (snapshot v0.9)

**¿Por qué sin build step?**
Para que cualquiera pueda abrir un archivo HTML y que funcione.
Portabilidad máxima.

**¿Por qué no TypeScript?**
Prioridad de velocidad de iteración en fase de diseño. Fácilmente
convertible cuando se estabilice.

**¿Por qué React y no Vue/Svelte?**
Ecosistema para portar a RN (Android) y consistencia con el dev esperado.

**¿Por qué localStorage y no IndexedDB?**
Datos muy pequeños (<50 KB por usuario). LS es más simple. IDB sería
overkill.

**¿Qué pasa si el usuario borra localStorage?**
Reinicia la app a valores default. No se pierde nada crítico (no hay
sincronización aún).

**¿Cómo pruebo cambios localmente?**
Abrir `PACE.html` en navegador. Recargar tras cada cambio.

**¿Cómo porto a Next.js / Chrome / Android?**
Ver [`docs/porting.md`](./docs/porting.md).

---

**Fin del snapshot.** Para continuar con el proyecto, empieza leyendo
[`STATE.md`](./STATE.md).
