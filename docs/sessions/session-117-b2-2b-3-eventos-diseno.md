# Sesión 117 — B2.2b-3 · esquema de eventos (SOLO DISEÑO)

**Fecha:** 2026-07-21
**Tipo:** solo-documental (patrón s109) — **sin bump, sin código, sin build**
**Versión:** se mantiene **v0.60.0** (entregada en s116)
**Base git al arrancar:** `main`, HEAD `90f0c93` (v0.60.0 · s116), árbol limpio

---

## 1. Objetivo y alcance

Corte **B2.2b-3**: producir el **documento de diseño canónico** de la capa de
eventos local `pace.events.v1`. El principio rector fue **DISEÑAR, NO
IMPLEMENTAR**: el entregable es un documento; **cero código de app** (nada de
`state-events.jsx`, EventStore, emisores, adaptadores, Capacitor ni SQLite), cero
bump de versión, cero regeneración de `PACE_standalone.html`.

PACE es **local-first estricto**: los eventos viven en el dispositivo, sin
backend, sin red, sin telemetría, sin PII. No se reabrieron el GIRO del runner
(s113/s114), el contrato B2.2b-1 (s115) ni el feedback B2.2b-2 (s116).

**Decisiones de arranque** (AskUserQuestion, todas la recomendación):
alcance = D1–D5 completo · almacenamiento = clave/backend propios fuera de
`pace.state.v2` · puente = conservar y puentear (sin backfill ficticio) ·
retención = 120 días + agregados permanentes · cierre = solo-docs sin bump.

---

## 2. Evolución de `EVENTOS_SCHEMA.md` (rev. 1 → 5)

El documento se refinó en cinco revisiones, cada una tras una auditoría del
usuario:

- **rev. 1 — blueprint D1–D5.** Taxonomía, envelope + `schemaVersion`, retención +
  agregados, almacenamiento/presupuesto/privacidad, consumidores futuros.
- **rev. 2 — 14 correcciones de arquitectura.** `runId`/`pathRunId` (correlación de
  ejecución), perímetros de duración por módulo, no-atomicidad entre claves,
  `activatedAt` + baseline de captura única, **UUIDv4** canónico, reorden de fases,
  candidatos aplazados (`achievement.unlocked`/`hydrate.glass`), privacidad honesta.
- **rev. 3 — 10 decisiones.** Importación = **reemplazo total** (fuera merge/dedup
  en import), **correlación tipada** (no `runId` universal), UUIDv4 con fijado de
  bits de versión/variante, política de duraciones **sin «según el runner»** +
  Caminos, orden de activación/baseline, **modelo single-writer**, comparador de
  poda `{occurredAt, id}`, medición de presupuesto por `TextEncoder`, zona horaria
  con estacionalidad. Dejó **1 P0 abierto** (mecanismo de propiedad single-writer)
  → **NO APTO PARA CIERRE**.
- **rev. 4 — arquitectura por adaptadores.** Resuelve el P0 (ver §3).
- **rev. 5 — iOS.** Añade iOS/Capacitor como runtime previsto, espejo de Android
  (mismo contrato y garantías); sin reabrir el modelo canónico ni el P0.

---

## 3. Problema P0 (single-writer) y su resolución por adaptadores

**El problema.** Dos operaciones read-modify-write simultáneas (p.ej. dos
pestañas) sobre un mismo contenedor de `localStorage` pueden **perder un evento
crudo de forma irrecuperable** (la reconciliación de agregados no lo recupera). El
diseño exige por tanto **un solo escritor** (single-writer).

En **rev. 3** se intentó fijar el mecanismo de propiedad, pero no existe uno
demostrablemente viable en **todos** los runtimes soportados —en particular
`file://` (el standalone), donde `navigator.locks` no está garantizado—. Siguiendo
la instrucción de **no inventar una garantía**, quedó marcado como **DECISIÓN P0
PENDIENTE** y el documento **NO APTO PARA CIERRE**.

**La resolución (rev. 4).** Se separó el diseño en dos capas:
- **A · Modelo canónico** (backend-independiente): envelope, tipos, payloads,
  `runId`/`pathRunId`, orden canónico, baseline, retención, export/import, versión.
- **B · Backend de persistencia**: un **adaptador por runtime** que cumple el
  contrato conceptual **EventStore** (`getCapabilities`/`initialize`/`readSnapshot`/
  `appendEvent`/`runExclusiveMutation`/`consolidate`/`prune`/`exportSnapshot`/
  `validateImport`/`replaceFromImport`/`reset`/`recover`/`getDiagnostics`), con
  resultados **`committed` / `rejected` / `interrupted` / `unavailable`** (nunca
  «probablemente escrito»).

Así, `setItem`/`storage`/`navigator.locks`/SQLite dejan de ser invariantes
universales: el mecanismo de exclusión es un **detalle del adaptador**. El P0 se
resuelve porque cada runtime tiene un mecanismo real (o no emite).

---

## 4. Decisiones por runtime

- **Web / PWA:** `localStorage` (clave propia `pace.events.v1`) + **Web Locks**
  (`navigator.locks`, exclusión de toda RMW). **Prohibido** cualquier fallback de
  lock con `localStorage`/`storage`/heartbeat/`BroadcastChannel`. Si no hay Web
  Locks → `READ_ONLY`/`UNAVAILABLE`.
- **`file://` (standalone):** **NO emite** eventos en v1 (`READ_ONLY`/
  `UNAVAILABLE`); no se usa Web Locks aunque el navegador lo exponga. **La app
  legacy sigue intacta** (Foco/Respira/Mueve/Estira/Hidrátate/Caminos/logros/
  ajustes/persistencia actual): deshabilitar la emisión de eventos **NO** convierte
  la app en solo-lectura.
- **Android e iOS (Capacitor):** runtimes previstos con **backend transaccional
  nativo** — **SQLite** para el log `pace.events.v1` + **Preferences/UserDefaults**
  para configuración y flags. `localStorage` del WebView **no** es fuente de verdad
  (puede purgarse). Garantías: append/consolidación/poda transaccionales, import por
  transacción o staging+swap, recuperación tras cierre forzado, migración legacy
  idempotente, **una única fuente de verdad por dominio**, serialización de
  escritores en la capa nativa. Detección por la **API de Capacitor** (no caer al
  adaptador web por parecer `https://localhost`). El plugin SQLite concreto queda
  aplazado, con sus garantías mínimas cerradas.

Matriz de **capacidades**: `EVENTS_READ_WRITE` / `EVENTS_READ_ONLY` /
`EVENTS_UNAVAILABLE` (+ estados diagnósticos, sin PII). `READ_ONLY` no emite, no
importa, no resetea.

**Veredicto final: APTO PARA CIERRE** (P0 resuelto por adaptadores). No se cerró la
sesión hasta la autorización explícita del usuario.

---

## 5. Documentos creados

- **`docs/product/EVENTOS_SCHEMA.md`** (NUEVO) — diseño canónico de la capa de
  eventos, rev. 5, ~850 líneas, APTO PARA CIERRE.
- **`docs/product/HOME_REDISENO_PROPUESTA.md`** (NUEVO) — propuesta PENDIENTE:
  solapamiento editorial de la tarjeta de Camino sobre el aro del timer (margen
  negativo responsive con `clamp()`, círculo `aspect-ratio:1`, nunca tapar
  timer/controles/ciclo) + jerarquía del home (Caminos por encima de los accesos
  manuales). No implementar como ajuste rápido de CSS: es una fase de responsive.
- **`docs/product/I18N_EXPANSION_PROPUESTA.md`** (NUEVO) — propuesta PENDIENTE:
  detección automática BCP 47 (web + Capacitor, función de resolución única),
  override manual persistente, fallback inglés, separación idioma/locale/zona
  horaria, y estrategia de expansión comercial (v1 ES+EN; candidatos alemán →
  pt-BR → francés; japonés premium con localización completa).

---

## 6. Propuestas pendientes (Home e i18n)

Ambas quedan **marcadas «pendiente de valorar e implementar»** en su cabecera y
**enlazadas** desde el backlog de `STATE.md` (sin copiar su contenido). No forman
parte del alcance funcional de s117 ni se han empezado.

---

## 7. Propagación documental del cierre

- **`STATE.md`**: «Última sesión» reescrita a #117 · versión sigue v0.60.0 (nota
  solo-docs) · «Próxima sesión» → **B2.3** · **corregidas las dos filas obsoletas**
  `PACE_standalone.html` e `index.html` (v0.59.0 → v0.60.0, sin nuevo bump) · nueva
  decisión activa «arquitectura de eventos aprobada, NO implementada» · nuevo
  **backlog s117** (visual/UX, multiplataforma, i18n).
- **`DECISIONES_PRODUCTO.md` §B2**: B2.2b-3 marcada **HECHA (solo diseño)** +
  enlace a `EVENTOS_SCHEMA.md`; «Pospuesto · Eventos» → diseño cerrado,
  implementación pendiente.
- **`ROADMAP.md`**: hito B2.2b-3 tachado (diseño aprobado, no implementado) +
  próxima = B2.3; anotación de la arquitectura de eventos por adaptadores en la
  línea Capacitor (implementación pendiente).
- **`CHANGELOG.md`**: **nota documental sin fila de versión** (patrón s109).
- **Memoria**: `plan-maestro-v1` actualizada (B2.2b-3 cerrado, próxima B2.3) +
  nueva memoria `eventos-schema-diseno` (arquitectura aprobada, no implementada).

---

## 8. Confirmación: sin cambios de código

**Cero cambios bajo `app/`** y cero cambios en `PACE.html`, `index.html`,
`PACE_standalone.html`, `build-standalone.js`, `package*.json`, `sw.js`,
`manifest.webmanifest`, `.claude/settings*`. **Sin bump, sin build, sin commit.**
Los únicos archivos tocados son documentación (`docs/product/*` nuevos + los docs
de estado/roadmap/changelog/decisiones + este diario + memoria). La arquitectura
de eventos queda **aprobada en diseño, pendiente de implementación**.
