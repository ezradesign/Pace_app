PACE · Auditoría documental — qué gobierna, qué es historia, qué se archiva

Estado: GOBIERNA (índice de autoridad documental).
Fecha: 2026-07-30 · sesión 130. Docs-only, sin bump.
Motivo: los documentos vivos no declaraban si mandan o son historia, así que se discutía
cuál manda. Esta auditoría lo resuelve con evidencia y deja una única cadena de autoridad.

--------------------------------------------------------------------------------
0. El hallazgo que originó esta auditoría

El usuario aportó `AUDITORIA_SISTEMA_PACE_PRE_REPO_2026-07-27.md` como «las decisiones
finales más actualizadas». Comparados línea a línea, **el adjunto es ANTERIOR**, no
posterior:

- adjunto 2.200 líneas · repo 2.309;
- las **12 líneas exclusivas del adjunto** son la versión SIN anotar de líneas que el repo
  ya tiene actualizadas (`Referencia técnica analizada: v0.66.0` → `Referencia técnica
  inicial` + `Estado técnico revisado: v0.67.0`; `Corregir scrollbar del runner.` → `(HECHO
  s125 · v0.68.0 …)`; `Pendiente de confirmación explícita` → `RESUELTO en s126 / v0.69.0`);
- el repo añade lo que el adjunto no tiene: **§37 entero**, **§32.6** y el bloque de
  jerarquía de documentos;
- **ninguna decisión existe solo en el adjunto**;
- no hay en el repositorio ningún archivo con el nombre `PRE_REPO`: la copia viva es
  `docs/product/AUDITORIA_SISTEMA_PACE.md`, su superconjunto.

Conclusión: no era un conflicto de canon, era el mismo documento en dos momentos. Que la
duda pudiera existir es el síntoma que esta auditoría corrige.

--------------------------------------------------------------------------------
1. Cadena de autoridad (única)

  Nivel 1 · DIRECCIÓN DE PRODUCTO   docs/product/AUDITORIA_SISTEMA_PACE.md
  Nivel 2 · EJECUCIÓN DESTILADA     docs/product/DECISIONES_PRODUCTO.md
  Nivel 3 · PRESENTE Y SIGUIENTE    STATE.md
  Nivel 4 · HISTORIA                CHANGELOG.md + docs/sessions/

Reglas:
- En conflicto de producto («qué/por qué») gobierna el nivel 1; en detalle de ejecución
  («cómo/cuándo») gobierna el más específico.
- Un documento que no declare su estado en la cabecera **no gobierna**. Todo documento vivo
  lleva una de estas etiquetas en su primera línea de cita:
  `GOBIERNA` · `VIGENTE PARCIAL` · `PENDIENTE DE VALORAR` · `HISTORIA` · `ARCHIVADO`.
- Los diarios de `docs/sessions/` son historia por definición: no se etiquetan y no se
  archivan nunca.

--------------------------------------------------------------------------------
2. Inventario etiquetado (20 documentos vivos + 7 auditorías)

GOBIERNAN — canon vigente

| Documento | KB | Ámbito |
|---|---|---|
| `CLAUDE.md` | 7 | Protocolo de sesión y reglas de código |
| `docs/product/AUDITORIA_SISTEMA_PACE.md` | 67 | Dirección integral de producto (nivel 1) |
| `docs/product/DECISIONES_PRODUCTO.md` | 39 | Ejecución destilada (nivel 2) |
| `STATE.md` | **150** | Presente + siguiente (nivel 3) — **sobredimensionado, ver §4** |
| `DESIGN_SYSTEM.md` | 29 | Tokens, paleta, tipografía, geometría responsive |
| `CONTENT.md` | 18 | Catálogo de rutinas y gating — **verificar drift, ver §3** |
| `docs/product/EVENTOS_SCHEMA.md` | 46 | Diseño aprobado de `pace.events.v1`, sin implementar |
| `docs/product/STATS_DESTINO_PROPUESTA.md` | 14 | Destino del panel de Stats (s129) |
| `docs/product/BASE_MUEVE_ESTIRA.md` | 14 | Manual fisiológico que gobierna Mueve/Estira |
| `MONETIZATION.md` | 9 | Modelo comercial — **subordinado a §20 del audit** |
| `ROADMAP.md` | 38 | Visión a largo plazo — **secciones caducadas, ver §3** |
| `README.md` / `README_EN.md` | 13 | Presentación pública |
| `docs/WORKFLOW.md` · `docs/BUILD.md` | 10 | Operativos de cierre y build |
| `design-system/README.md` | 4 | Bundle de previews para `/design-sync` |

VIGENTE PARCIAL — aplicado a medias, con su propia tabla de etapas

| Documento | Estado real |
|---|---|
| `docs/product/HOME_REDISENO_PROPUESTA.md` | Ya declara etapas s117→s126 con vigencia por viewport. **Le falta s128** (home móvil universal). §0 completo sigue pendiente. **Es el modelo de cabecera a imitar por el resto.** |

PENDIENTE DE VALORAR — capturado, nadie lo ha decidido

| Documento | Desde |
|---|---|
| `docs/product/I18N_EXPANSION_PROPUESTA.md` | s117 (2026-07-21). Se autodeclara «PENDIENTE DE VALORAR E IMPLEMENTAR». |
| `docs/launch/reddit-drafts.md` | 2026-05-06. Borradores de lanzamiento; la pre-venta no ha empezado y está condicionada a revisar Starter Story antes de fijar pricing. |

ARCHIVAR — su propósito está cumplido o su contenido ya está destilado

| Documento | KB | Evidencia de que ya no gobierna |
|---|---|---|
| `docs/product/PACE_EVOLUTION_CONTEXT.md` | 41 | Es un **volcado de conversación** (empieza «Entendido. Lo que necesitas no es otra auditoría…» e incluye instrucciones de dónde guardarlo). `DECISIONES_PRODUCTO.md:3-9` declara que lo destila y que **las sesiones leen el destilado, no este original**. |
| `docs/product/CONTEXTO_UX_RUNNER_WELCOME.md` | 19 | Se autodeclara «Gobierna la sesión **B2.2a.5**» — sesión **s112, cerrada** (v0.56.0). Su encargo está cumplido. |
| `docs/proposals/license-analysis.md` | 11 | Dice «Ningún archivo de licencia se ha añadido aún al repo». **Falso desde v0.12.9**: `LICENSE` (Elastic 2.0) existe en la raíz. La decisión ya se tomó. |
| `docs/qa/smoke-tests.md` | 7 | «Versión de referencia: v0.27.2+» — **más de 40 versiones atrás**. El checklist de cierre de `CLAUDE.md` lo sustituyó en la práctica. |
| `docs/audits/` (7 archivos, ~167 KB) | 167 | Auditorías de v0.28–v0.53, todas con su trabajo ejecutado. **Excepción:** `audit-evolucion-v0.51.0.md` se cita en `CLAUDE.md` como «no re-verificar» ⇒ se archiva pero se conserva la cita. |

Total a archivar: **~245 KB** de documentación que hoy compite por autoridad sin tenerla.

--------------------------------------------------------------------------------
3. Drift detectado (a verificar contra código, NO corregido aquí)

- **`CONTENT.md`** declara reflejar el catálogo «a fecha de v0.37.0». Después hubo cambios
  reales de contenido: B2.3 olas 1–4 (migración al contrato v1) y `couch.stretch.min` 5→6
  en s118. Hay que verificar si el catálogo documentado sigue coincidiendo.
- ~~**`ROADMAP.md`** declaraba como «plan vigente» un bloque cerrado en s99~~ **RESUELTO s132**:
  su sección «Camino a v1.0» se reescribió como **PLAN OPERATIVO ÚNICO** (7 fases, con el
  feedback beta al frente) y la secuencia anterior se archivó en
  `docs/archive/ROADMAP_CAMINO_V1_HISTORICO.md`. 38 → 15 KB. Ahora declara `GOBIERNA el ORDEN`
  en su cabecera, y el audit conserva el qué/por qué. **Deja de haber dos órdenes de trabajo.**
- **`MONETIZATION.md`** (s21/s26) no contradice al audit §20 —las cuatro vías coinciden—
  pero su autoridad se solapa. Queda subordinado: el audit §20 fija dirección, MONETIZATION
  aporta el detalle técnico de licencia (`expiresAt`, validación offline).

--------------------------------------------------------------------------------
4. Los dos documentos que incumplían su propio contrato — **RESUELTO en s131**

RESULTADO MEDIDO:

| Archivo | Antes | Después | Qué se hizo |
|---|---|---|---|
| `STATE.md` | 153 KB | **57 KB** | La Red de seguridad conserva archivo · rol · **versión actual** (105 filas); su historial por archivo → `docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`. «Decisiones activas» (62 KB, 108 filas) → **`docs/product/DECISIONES_TECNICAS_VIGENTES.md`**, que GOBIERNA; STATE conserva el índice de títulos. El informe operativo de la sesión anterior → puntero a su diario. |
| `CHANGELOG.md` | 95 KB | **41 KB** | Las 106 filas de la tabla conservan su **titular**; el texto largo → `docs/archive/CHANGELOG_TABLA_HISTORICA.md`. El detalle de las 2 últimas versiones queda intacto, como manda la convención. |

Las decisiones técnicas **NO se archivaron**: son reglas vigentes que evitan reintroducir
regresiones ya resueltas. Solo cambiaron de casa, porque vivían en el archivo que se lee en
cada arranque y debe ser ligero.

Queda margen para una segunda pasada (STATE sigue con ~21 KB de secciones «Pendiente»,
«Próxima sesión» y backlogs que conviene revisar una por una), pero ya no incumple su
contrato de forma estructural.

Texto original del diagnóstico, conservado:

4bis. Los dos documentos que incumplen su propio contrato

**`STATE.md` — 150 KB.** Su cabecera dice literalmente «Este archivo no debe crecer» y
`CLAUDE.md` prohíbe «acumular historia en STATE.md». Causa medida: la tabla «Red de
seguridad» acumula el historial completo de cada archivo sesión a sesión (una fila de
`move.data.js` narra s115→s121), y cada «Última sesión» es un párrafo de miles de
caracteres.

Método propuesto (NO ejecutado en esta sesión):
- La columna «Estado» de la Red de seguridad conserva **solo la versión actual y una línea
  de qué hace**; el historial por archivo se va a `docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`.
- «Última sesión» pasa a un párrafo corto con enlace al diario, que ya lleva el detalle.
- Objetivo: **STATE.md por debajo de 25 KB**, que es lo que permite leerlo cada arranque
  sin gastar la mitad del contexto.

**`CHANGELOG.md` — 94 KB.** Su convención dice «solo detalla las 2 últimas versiones», y se
cumple para el DETALLE, pero la tabla de historial lleva párrafos de 4.000+ caracteres por
fila (v0.71.0 y v0.69.0 son los ejemplos extremos). El detalle largo pertenece al diario.

Método propuesto (NO ejecutado): la celda «Título» de la tabla se recorta a **una o dos
líneas** por versión y el cuerpo se queda en el diario, que ya existe para las 104 filas.

--------------------------------------------------------------------------------
5. §37 marcado PROVISIONAL (decisión del usuario, s130)

La ronda M1–M4 se añadió al audit sin repensarse del todo, así que **deja de contar como
cerrada**. Se conserva como propuesta de partida y **estas preguntas vuelven a estar
abiertas en §36**:

- ¿tipos de jornada? (¿cómo se clasifica un día sin puntuarlo?)
- ¿la racha se conserva, se transforma en ritmo o se elimina?
- ¿equilibrio diario o evitar convertir el bienestar en puntuación?
- ¿debe PACE preguntar «¿cómo terminas hoy?» y con qué respuestas?
- ¿comparación retrospectiva y con qué copy?

**Lo que NO se toca:** §31.4 (estructura Hoy · Semana · Mes · «Qué te ayuda») y §31.6 (Free
= Hoy + tira de 7 días; Premium = mes, año, patrones, «qué te ayuda») son **anteriores** a
esa ronda —están en el documento original del 27-07— y siguen vigentes. `STATS_DESTINO_PROPUESTA.md`
se apoya en ellos, así que su columna vertebral aguanta; lo que queda condicionado son sus
§4.4 (ritmo semanal) y §4.5 (tipos de jornada).

--------------------------------------------------------------------------------
6. Qué queda por hacer

1. ~~**Archivar** los documentos de la tabla ARCHIVAR~~ **HECHO s130** (4 documentos + READMEs
   en `docs/archive/` y `docs/audits/`).
2. **Cabecera de estado** en los documentos que gobiernan, con el formato de
   `HOME_REDISENO_PROPUESTA.md` (tabla de etapas con vigencia), empezando por añadirle s128.
   Hecho en el audit y en DECISIONES_PRODUCTO; **falta** en CONTENT, ROADMAP, MONETIZATION,
   DESIGN_SYSTEM, EVENTOS_SCHEMA y BASE_MUEVE_ESTIRA.
3. ~~**Adelgazar** `STATE.md` y `CHANGELOG.md`~~ **HECHO s131**: 153→57 KB y 95→41 KB (ver §4).
   Segunda pasada opcional sobre las secciones de backlog de STATE.
4. **Re-decidir el §37** en una ronda propia, con las cinco preguntas de §5 sobre la mesa.
5. **Verificar el drift** de `CONTENT.md` y `ROADMAP.md` contra el código.
