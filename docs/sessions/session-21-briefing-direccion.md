# Sesión 21 · Briefing de dirección · v0.12.3 → documentación

**Fecha:** 2026-04-23
**Tipo:** Sesión de alineación estratégica (no se toca código)
**Resultado:** Memoria del proyecto actualizada con la nueva
dirección del producto: gating de contenido, modelo de monetización
Lifetime, nuevas secciones premium (CTB, personalización), Ritmos
expandido, loop post-Pomodoro y responsive móvil.

---

## 📋 Contexto

El usuario solicita un briefing sobre el estado del proyecto antes
de seguir. La lectura del repo confirma que el diseño general está
pulido (v0.12.3, 20 sesiones, 4 tweaks consolidados, identidad
tipográfica decidida). A partir de ahí se discute por voz la
dirección de las próximas fases — no se escribe código, solo se
consolida la memoria.

---

## 🧭 Decisiones tomadas

### 1. Progresión de desbloqueo (2+2+2)

La app arranca con **2 ejercicios desbloqueados** en cada módulo
(Respira, Mueve, Estira). Al completarlos, el resto del catálogo
se desbloquea progresivamente vía logros. Algunos ejercicios son
**premium exclusivo** (sin ruta por logro), otros son `locked.both`
(desbloqueables por logro o por Lifetime).

Iniciales elegidos (`access: free`):
- **Respira:** `breathe.coherent.55`, `breathe.box.4`
- **Mueve:** `move.chair.antidote`, `move.neck.3`
- **Estira:** `extra.desk.pushups`, `extra.posture.set`

Criterio: baja barrera de entrada + diversidad calma/activa.

Documentado en [`CONTENT.md`](../../CONTENT.md) (sección
"Progresión de desbloqueo").

### 2. Modelo de monetización · Lifetime híbrido

Tras discutir los tres modelos (suscripción mensual, pago único,
híbrido), se elige **Modelo C**:

- **Lifetime único ~20 €** — desbloquea todo el contenido premium
  actual de por vida.
- **Temporadas ~5 €** puntuales — packs estacionales opt-in.
- **Donaciones BMC** siguen activas.

Razón: la suscripción mensual choca con la filosofía "antídoto a
la silla". El usuario compra un objeto cuidado, no un servicio.

**Todo sigue local.** Validación de licencia offline con clave
firmada (tipo Gumroad / Lemon Squeezy — proveedor aún por
decidir). Sin backend, sin cuentas, sin tracking post-compra.

Documento nuevo: [`MONETIZATION.md`](../../MONETIZATION.md).

### 3. Contenido premium

**Respira · CTB (Respiración en Trance Consciente).** Sesiones
largas guiadas (20-45 min) combinando música ambiental,
respiración rítmica prolongada, retenciones y visualización. 4-6
sesiones tentativas con nombres propios ("Manantial", "Noche
larga", "Campo abierto", "Ritual breve").

**Estira/Mueve · Sesiones personalizadas.** Constructor de rutinas
a medida — el usuario selecciona ejercicios y duración, guarda
hasta 3 rutinas con nombre. Disponible solo para Lifetime.

**Ejercicios exclusivos.** ~5-8 ejercicios adicionales por módulo
(Mueve, Estira) como contenido Lifetime.

### 4. Loop post-Pomodoro

Al terminar un Pomodoro, el `BreakMenu` existente se reestructura
para sugerir explícitamente una acción de pausa activa:
**estirar**, **moverse** o **hidratarse**. Rotación inteligente
(no repetir la misma sugerencia dos veces seguidas).

Objetivo: crear un loop natural *foco → pausa activa → foco* sin
añadir popups invasivos. Se aprovecha el BreakMenu que ya existe.

### 5. Ritmos · vista semanal/mensual/anual

Evolución de `WeeklyStats` a un módulo **Ritmos** con tres vistas
conmutables:

- **Semanal** — barras diarias por módulo (refinamiento del actual).
- **Mensual** — heatmap mes completo.
- **Anual** — "año en pace", calendario anual tipo GitHub
  contributions pero con tierra/oliva, no verde neón.

Feedback narrativo breve al final de semana/mes: texto literario,
sin números abrumadores, sin metas impuestas.

### 6. Responsive móvil (bloqueante)

Dos requisitos concretos:
- **Sidebar desacoplada en móvil → fullscreen** (100% viewport).
- **Home acoplada cabe en viewport de móvil** (~375×812): el
  Pomodoro central + los 4 accesos rápidos sin scroll.

Breakpoint tentativo: `max-width: 768px`.

### 7. Retos semanales + notificaciones + feedback

Añadidos al roadmap medio plazo. Siempre opt-in, sin penalización
por no completar, sin espam.

---

## 🚫 Explícitamente descartado

- **Biometría / wearables.** El usuario descarta integración con
  Apple Health, Google Fit, smartwatches. No encaja con el tono
  artesanal ni con la filosofía local-first.
- **Suscripción mensual.** Choca con "antídoto a la silla".
- **Backend propio para licencias.** Rompe "todo local". Se opta
  por validación offline de clave firmada.
- **OAuth con Google Calendar.** Se mantiene como idea solo si se
  implementa vía exportación `.ics` local, sin servidor.

---

## 📂 Archivos actualizados

- [`MONETIZATION.md`](../../MONETIZATION.md) — **NUEVO**. Modelo
  Lifetime híbrido + gating de contenido + validación offline.
- [`CONTENT.md`](../../CONTENT.md) — nueva sección "Progresión de
  desbloqueo" al inicio + sección "Contenido premium" al final.
- [`ROADMAP.md`](../../ROADMAP.md) — reescrito completo con las
  nuevas prioridades (responsive, loop Pomodoro, Ritmos, CTB,
  personalización, retos, notificaciones).
- [`STATE.md`](../../STATE.md) — última sesión + backlog
  reordenado + decisiones activas nuevas.
- [`CHANGELOG.md`](../../CHANGELOG.md) — entrada v0.12.4 (solo
  documentación, sin cambios funcionales).

No se toca código. `PACE_standalone.html` sigue en v0.12.3.

---

## ⚠️ Decisiones activas nuevas (para STATE.md)

- **Modelo de monetización = Lifetime + temporadas + donaciones.**
  No se implementa aún; solo se documenta. Cualquier nueva idea de
  monetización debe defenderse contra este modelo antes de
  considerarse.
- **Los 2 ejercicios iniciales por módulo son la puerta de
  entrada.** No cambiar sin migración explícita de localStorage.
- **Ejercicios tienen campo `access`** con 5 valores posibles
  (`free`, `locked.initial`, `locked.achievement`, `locked.both`,
  `premium`). Al añadir contenido nuevo, asignar `access` desde el
  primer momento.
- **Biometría y wearables fuera de alcance.** Decisión explícita
  del usuario — no reintroducir.

---

## 🚀 Próximos pasos

El backlog de [`STATE.md`](../../STATE.md) queda reordenado. La
próxima sesión probablemente arranca con **responsive móvil** (el
usuario lo reporta como problema actual al usar la app desde el
teléfono) o **loop post-Pomodoro** (implementación rápida con alto
impacto en la experiencia del usuario).

Antes de tocar CTB o el sistema Lifetime, hay que consolidar el
core gratuito móvil. Siguiendo la filosofía "el core gratuito debe
funcionar y ser útil por sí solo" de
[`MONETIZATION.md`](../../MONETIZATION.md).
