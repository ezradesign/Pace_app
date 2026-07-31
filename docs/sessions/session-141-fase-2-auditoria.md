# Sesión 141 — Fase 2: auditoría de Mueve y Estira + ola A de nombres

**Fecha:** 2026-07-31 · **Versión:** v0.73.1 → **v0.74.0** · Auditoría **+ código**.

Arranca la **FASE 2**, el frente que el feedback beta puso por delante. Entregable
principal: la **matriz §19.2** completa
([`audit-mueve-estira-v0.73.1.md`](../audits/audit-mueve-estira-v0.73.1.md)). Y como la
auditoría dejó una ola sin riesgo a tiro, se ejecutó en la misma sesión.

---

## 1 · Tres de las cuatro premisas del plan no reproducen

El orden de fases se fijó en s132 sobre cuatro mediciones. Contrastadas contra el árbol:

| Premisa (s132) | Medido | Veredicto |
|---|---|---|
| «92 nombres de paso distintos» | **65** únicos (117 pasos con nombre) | no reproduce |
| «37 % con término inglés» | **36 de 65 = 55 %** | **peor** |
| «46 glifos / 92 nombres ⇒ la mitad en `DefaultGlyph`» | 47 glifos, **20 sin cubrir = 31 %** | mejor |
| «`level`/`intensity` 44 veces sin consumidor» | en la **rutina**, no en el paso: 22 de 28; sin consumidor **confirmado** | matiz |

**El orden de la Fase 2 no cambia** —sigue siendo el frente correcto— pero el reparto sí:
el bloque de dibujo es un tercio más pequeño de lo previsto y el de nombres, mayor.

## 2 · Lo que la auditoría separó

- **Los glifos son DOS problemas**: **20 no existen** (hay que dibujarlos) y **15 existen sin
  aprobar** (los «flojos»). Suman los 35 de la deuda D-4 y encajan con su desglose exacto.
- **41 de 47 glifos dibujan una sola postura estática**, sin dirección: solo 6 tienen dos poses,
  5 flecha y 9 apoyo. Es la evidencia dura de la §19.3 — el «no sé cómo hacerlo» no se arregla
  redibujando el glifo de 44×44, sino añadiendo el segundo nivel visual.
- **`window.APPROVED` no existe en el código**: era un concepto de s84 que nunca se materializó,
  así que las columnas «Aprobado / Revisar / Placeholder» de la §19.2 no se pueden derivar del
  árbol. La matriz usa la versión anotada en el comentario de cada glifo.
- **Un glifo huérfano de verdad** (`Nordics`). `Reset respiración` lo parecía, pero es el destino
  del alias `Deep breaths`: hay que resolver alias antes de declarar nada huérfano.
- Sueltos: `Descanso` es un **nombre de ejercicio con glifo** en vez de un paso `rest`; `90/90` no
  dice nada a quien no conoce la postura; 9 ejercicios viven en los dos módulos (por eso contar
  «por módulo» daba 74 y no 65).

## 3 · Ola A ejecutada — 5 renombrados

`Hang pasivo` → **Suspensión pasiva** · `Hang activo` → **Suspensión activa** · `Hollow hold` →
**Hueco abdominal** · `Seated hollow` → **Hueco en silla** · `Couch stretch` → **Cuádriceps en
pared** (paso) y **Estiramiento del sofá** (rutina).

**`Superman` se queda**, y es decisión, no olvido: es nombre propio que se entiende igual en
español, y el problema reportado eran términos **ilegibles** (`Chin tucks`, `Dead hang`). Además
«Extensión boca abajo» chocaría con `Apertura de pecho`, de la misma rutina.

**Las parejas se renombran juntas.** Dos de los cuatro candidatos tenían pareja **con glifo**
(`Hang activo`↔`Hang pasivo`, `Hollow hold`↔`Seated hollow`): renombrar solo la mitad dejaría
«Suspensión activa» junto a «Hang pasivo» en la misma biblioteca, peor que no tocarlo.

### El hallazgo que la §19.2 no preveía: `localStorage` es la tercera pata

s108 exige renombrar `name` + glifo + i18n en el mismo cambio. Falta una: **el constructor COPIA
el nombre del ejercicio dentro de la rutina propia guardada** (`state-custom.jsx`:
`steps: [{ name, dur, cue }]`). Una rutina creada antes del cambio sigue pidiendo el nombre viejo
y se quedaría sin glifo **en silencio**.

Se resuelve con la pieza que ya existía: **`VISUAL_ALIAS`**, cuyo contrato es «el nombre viejo se
absorbe en la identidad nueva» (s110). Cinco entradas nuevas, y cuando la ola B dibuje los glifos
que faltan **las rutinas antiguas los heredan solas**. En `content/custom.js` se conservan además
las claves viejas: la clave ES el nombre español, y sin ellas esas rutinas verían texto español
estando en inglés.

## 4 · Verificación

Con SW y cachés purgados, en la app real:

- los 5 nombres nuevos resuelven; los 2 que tenían glifo **lo conservan**;
- los 5 nombres viejos llegan a la identidad nueva por alias (y al glifo donde existe);
- el inglés sigue diciendo `Hollow hold` / `Passive hang` / `Couch stretch` — correcto: lo que se
  retira es el inglés **del español**, no la traducción;
- recuento total **sin moverse: 65 nombres y 20 sin glifo antes y después** ⇒ ninguna clave caída;
- consola sin errores nuevos.

Efecto en la cifra que abrió la Fase 2: **36 → 31** nombres con inglés (55 % → 48 %).

## 5 · Método, y dos errores propios corregidos

Los datos salen de cargar los archivos del árbol con el **mismo Babel del build** sobre un
`window` falso (`EXTRA_ROUTINES` es `const`: hay que pedirlo por expresión, no por propiedad) y de
parsear los glifos como texto. Los tres scripts quedan en **`scripts/audit/`** porque las olas B y
C van a re-medir.

Dos fallos míos, anotados porque los dos cambiaron cifras:

1. **`"World's greatest stretch"` usa comillas dobles** por el apóstrofo, y mi regex de
   solo-simples lo daba por inexistente. Se detectó al cruzar dos recuentos (47 claves reales
   contra 46 parseadas) — la contradicción entre dos medidas es lo que lo destapó.
2. **Dije «7 nombres sin glifo con inglés» contándolos a ojo**; eran **4**. Corregido en la
   auditoría antes de ejecutar nada.

El renombrado se hizo con un script de reemplazos **con contexto** (`name: '…'`, clave de glifo,
entrada de registro) y un guardarraíl de conteo esperado: falló a la primera —`Hang pasivo`
aparecía 2 veces en `move.data.js`, no 3— y **no escribió nada** hasta cuadrar.

---

## 6 · Cambios en el árbol

| Archivo | Cambio |
|---|---|
| `app/move/move.data.js` · `app/extra/ExtraModule.jsx` | 5 nombres de paso + 1 de rutina + copy que los citaba |
| `app/glyphs/exercise-glyphs.jsx` | 2 claves de glifo renombradas |
| `app/custom/exercise-registry.js` | 5 entradas del registro |
| `app/custom/exercise-aliases.js` | 5 alias nuevos (migración de datos guardados) + 1 valor actualizado |
| `app/i18n/content/custom.js` | 5 claves nuevas, **las viejas conservadas** |
| `scripts/audit/*.js` | NUEVO — inventario · glifos · matriz |
| `docs/audits/audit-mueve-estira-v0.73.1.md` | NUEVO — la matriz §19.2 y su diagnóstico |

`PACE_standalone.html` **no se regenera** (s134): restaurado byte-idéntico, hash
`998e3e358d689036`.

---

## 7 · Lo siguiente

**Ola B — los 20 dibujos que faltan.** Es la que quita el `DefaultGlyph` de la vista y la que el
usuario itera (se portan literales, regla s84). La ola C (renombrar los ~30 restantes con inglés)
exige el cambio coordinado completo **más** su entrada en `VISUAL_ALIAS`, que a partir de ahora es
parte del contrato de renombrado.
