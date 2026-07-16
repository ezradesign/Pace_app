# Auditoría · Documentos de evolución vs código real (v0.51.0)

> 2026-07-16 · sesión de auditoría (solo lectura, sin cambios de código).
> Contrasta `docs/product/PACE_EVOLUTION_CONTEXT.md` + 2 bloques de ideas
> adicionales (pegados en conversación, destilados aquí) contra `main`
> v0.51.0. El plan vivo resultante es
> [`docs/product/DECISIONES_PRODUCTO.md`](../product/DECISIONES_PRODUCTO.md);
> este archivo es el registro con evidencia.

---

## A. Hallazgos CONFIRMADOS (con evidencia)

| # | Hallazgo | Evidencia |
|---|---|---|
| 1 | **Bug fechas ISO/UTC en rachas de Caminos.** `new Date("YYYY-MM-DD")` parsea medianoche UTC; el round-trip con `toISODate` (local) retrocede un día en husos negativos → el bucle de racha salta días para usuarios al oeste de UTC. En España no se manifiesta | `state-paths.jsx:204-212` (`computePathStreaks`). Resto de fechas sano: heatmaps construyen `new Date(y,m,d)` numérico local; `toISODate`/`getMondayOf` reciben formato `toDateString()` (parse local) |
| 2 | Lenguaje de riesgo: «Al fallo», «Al límite», «Más bajo si puedes» | `MoveModule.jsx:38,86,106` + EN «To failure.» `i18n/content/move.js:47` |
| 3 | «El hombro nace para colgar» + «barra o un marco» | `MoveModule.jsx:48` |
| 4 | Claims médicos en Respira: «Baja ansiedad» (4·7·8), «Equilibra hemisferios» (Nadi), «Armoniza HRV» (Balance), «Sincroniza corazón y mente» (Coherente), «Antesala del trance consciente» (Rondas 5×35) | `BreatheLibrary.jsx:14-57` |
| 5 | Logros de apnea 60/90/120 s implementados y activos + contador-récord de retención a 160 px | `BreatheSession.jsx:129-131`, `catalog.js:118-120` |
| 6 | Tag `PULL` en Fondos en silla (es empuje de tríceps) | `MoveModule.jsx:32` |
| 7 | Superman (suelo) sin anunciar en «Espalda de oficina»; Dead hang dentro de «Hombros · 5 pasos»; chin tuck «como doble papada»; «Rodillas indestructibles» | `MoveModule.jsx:134`, `ExtraModule.jsx:71,35,126` |
| 8 | Todo paso es temporizador: «12 reps» en 30 s (2,5 s/rep), lados dentro de un único `dur`, sin modos manual/reps/transición | ticker único `MoveModule.jsx:222-239` |
| 9 | Caminos = playlists de 2-3 pasos `{kind, routineId}` sin promesa/arco/ritual; los 7 `access:'free'` | `paths/registry.js` |
| 10 | Sin log de eventos: solo agregados diarios + `routineCounts` (4 tipos) + fechas de Caminos | `state-core.jsx:70-119` |
| 11 | Keys EN posicionales (`<id>.sN.name`): reordenar/insertar un paso rompe la traducción en silencio | `i18n/content/move.js:24-33` |
| 12 | «Acciones» del año = score sintético (bloques de 25 min cap 3 + presencias + fracción de agua) redondeado y presentado como acciones | `YearView.jsx:11-14,80` |
| 13 | Heatmap mensual: color del módulo dominante único + `waterEq = vasos×5` (equivalencia arbitraria) — un día mixto se pinta de un solo color | `StatsPanel.jsx:155-157,327` |
| 14 | Sendero del día con horas ficticias (el comentario lo admite: «repartimos sus horas ficticiamente»); respira/cuerpo/agua a `hNow − 0.3/0.55/0.15` | `Sidebar.jsx:233-245` |
| 15 | Contador de logros `/100` y «descubre `100−n`» hardcodeados; el catálogo tiene 106 entradas | `Sidebar.jsx:194,201` |
| 16 | Estira sin sesión propia: reutiliza `MoveSession` con `kind='extra'` y TODO el acento es `var(--move)` (prep, glifo, contador, barra, done); solo la atmósfera de Camino distingue `kind` | `main.jsx:132-136,285` + `MoveModule.jsx` |
| 17 | BreatheVisual: transición CSS fija 1800 ms — una exhalación de 8 s anima 1,8 s y queda estática; en fases de 1 s (Bhastrika) nunca completa | `BreatheVisual.jsx:113` |
| 18 | Duraciones declaradas infladas (ver §C): 7/28 rutinas con desvío ≥20 % | script sobre `MOVE_ROUTINES`/`EXTRA_ROUTINES` |
| 19 | 20/66 pasos sin glifo → `DefaultGlyph` (cola D-4, ya bloqueante de pre-venta en ROADMAP) | script de cobertura |
| 20 | Migraciones ad-hoc (guards booleanos idempotentes) sin `schemaVersion` formal, sin backup previo, sin fixtures | `state-core.jsx:130-137,159-186` |
| 21 | Sin `env(safe-area-inset-*)` en todo `app/` (deuda pre-Capacitor); timers Focus/Breathe ya timestamp-based (s96/s98), Move aún setInterval (bajo) | grep global |

## B. Hipótesis REFUTADAS o matizadas (no re-auditar)

| Hipótesis (llegó en los documentos) | Realidad verificada |
|---|---|
| «Los glifos se rompen con la traducción EN» (llegó 2 veces) | **Falso.** Los 3 consumidores de `ExerciseGlyph` pasan siempre el nombre canónico ES sin traducir: `MoveModule.jsx:414`, `CustomBuilder.jsx:93,139`. `visualId` sigue siendo deseable, pero por renombrado/aliases/variantes — no por bug actual |
| «Varias fuentes de verdad divergentes» | Consistencia real hoy: 0 glifos huérfanos, registro alineado con rutinas (única exclusión documentada: «Dead hang (si puedes)»). El riesgo es estructural (nada lo valida automáticamente), no divergencia actual |
| «IDs derivados de nombres traducidos» | Los IDs de rutina son estables y semánticos. El punto débil real: `step.name` ES como identidad (glifo+registro+i18n custom, decisión s93) y keys EN posicionales. Además los IDs están CRUZADOS módulo↔prefijo (swap s14: Mueve=`extra.*`, Estira=`move.*`) — deliberado y blindado en CONTENT.md, **no tocar** |
| «BreatheVisual con varias fuentes temporales» | Hay UNA fuente (ticker de BreatheSession); el defecto es la transición fija 1800 ms (hallazgo 17) |
| «getSuggestedPath no es inteligente» | Cierto pero deliberado (jerarquía s78; el onboarding s106 depende de `lastViewed`). Scoring v2 ya planificado s107. Dato útil: `paths.favorite` existe (`state-paths.jsx:232`) y NO se consulta |
| «El onboarding debe ejecutar una experiencia en <60 s» | Contradice la decisión s106 registrada (sugerir en home, NO auto-arrancar). Punto de encuentro: mini-Caminos 2-3 min de s107 |
| «BreakMenu = 4 opciones equivalentes» | Ya reordena con scoring y marca «Para ti» (`BreakMenu.jsx:11-22`); lo que falta es recomendar rutina concreta (→ After Pomodoro s107) |
| «Duración editorial poco fiable» | Cierto, pero al revés de lo insinuado: las duraciones están INFLADAS, no cortas |

## C. Duraciones declaradas vs suma de pasos (calculado)

Desvíos ≥20 % (todas prometen más de lo que contienen):

| Rutina | Declarado | Pasos | Desvío |
|---|---|---|---|
| Colgarse (`extra.hang.bar`) | 4 min | 2,17 min | −46 % |
| ATG · Rodillas (`move.atg.knees`) | 6 min | 4,0 min | −33 % |
| Empuje · progresión (`extra.push.ladder`) | 4 min | 2,75 min | −31 % |
| Piernas · a una (`extra.legs.single`) | 5 min | 3,75 min | −25 % |
| Ancestral (`move.ancestral`) | 6 min | 4,5 min | −25 % |
| Hombros · 5 pasos (`move.shoulders.5`) | 5 min | 3,92 min | −22 % |
| Sentadilla en pared (`extra.wall.sit`) | 3 min | 2,5 min | −17 % |

Resto a ±15 % (9 exactas). Ninguna incluye cambios de lado ni transiciones
(no existen como concepto). Pasos sin glifo: 20/66 (Apretar glúteos, Couch
stretch, Círculos de hombro, Gato-camello, Hang activo, Hollow hold, Isquio
a una pierna, Onda espinal, Palmas al suelo, Pica en escritorio, Plancha,
Plancha lateral, Pliegue adelante, Puente torácico, Rana, Rezo invertido,
Rodar hacia abajo, Sentadilla a silla, Sentadilla búlgara, Superman).

## D. Decisiones tomadas en esta sesión (usuario, 2026-07-16)

1. **Apnea**: retirar los 3 logros y la cifra-récord del hold; sustituir por
   secretos de exploración sin marca temporal.
2. **Calendario**: bloques B1 (saneamiento) + B2 (fundamentos) se insertan
   ANTES de s107; la pre-venta se retrasa ~3-4 sesiones.
3. **Stats Free/Premium** (dirección; implementación en sesión de licencia):
   Hoy free + tira de 7 días; mes/año/patrones premium; export/borrado
   siempre gratis.
4. **Escritura**: digest `docs/product/DECISIONES_PRODUCTO.md` + reubicar
   `PACE_EVOLUTION_CONTEXT.md` a `docs/product/` + este registro + protocolo
   de lectura optimizada en CLAUDE.md.

Clasificación completa (implementar/pilotar/debatir/posponer/descartar),
opciones consideradas (conservadora/equilibrada/ambiciosa) y plan de
bloques B1-B4: ver el digest, que es el documento vivo.
