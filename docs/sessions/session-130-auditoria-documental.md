# Sesión 130 — Auditoría documental: qué gobierna y qué es historia

**Fecha:** 2026-07-30
**Tipo:** sesión SOLO-DOCUMENTAL — **sin versión nueva, cero código, cero build**
**Versión de referencia:** v0.71.0 (`main`)
**Entregable:** [`docs/product/AUDITORIA_DOCUMENTAL.md`](../product/AUDITORIA_DOCUMENTAL.md)

---

## El disparador

El usuario aportó `AUDITORIA_SISTEMA_PACE_PRE_REPO_2026-07-27.md` desde su escritorio
diciendo que era «las decisiones finales más actualizadas» y que muchas de las antiguas
estaban obsoletas, pidiendo una auditoría para archivar lo viejo y esclarecer el rumbo.

## Lo primero: la premisa era del revés

Comparados línea a línea, **el adjunto es ANTERIOR al del repo**:

- 2.200 líneas frente a 2.309;
- sus **12 líneas exclusivas** son la versión **sin anotar** de líneas que el repo ya tiene
  actualizadas — `Referencia técnica analizada: v0.66.0` → `Referencia técnica inicial` +
  `Estado técnico revisado: v0.67.0`; `Corregir scrollbar del runner.` → `(HECHO s125 ·
  v0.68.0 …)`; `Pendiente de confirmación explícita` → `RESUELTO en s126 / v0.69.0`;
- el repo añade lo que el adjunto **no tiene en absoluto**: el **§37 entero**, el **§32.6**
  con las invariantes de la home y el bloque de jerarquía de documentos;
- **ninguna decisión existe solo en el adjunto**;
- no hay en el repositorio ningún archivo con ese nombre: la copia viva es
  `docs/product/AUDITORIA_SISTEMA_PACE.md`, su superconjunto.

No era un conflicto de canon: era el mismo documento en dos momentos. Pero **que la duda
pudiera existir es exactamente el problema** que el usuario intuía, y de ahí salió el trabajo
real de la sesión.

Se dejó constancia en la cabecera del audit para que no vuelva a pasar.

## Efecto sobre el spec de Stats de s129

Buena noticia, y conviene tenerla escrita: **la columna vertebral del spec no depende del
§37**. En el propio adjunto del usuario, §31.4 ya lista `Hoy · Semana · Mes · «Qué te ayuda»`
(líneas 1900-1931) y §31.6 ya reparte `Free = resumen de Hoy + tira de siete días` /
`Premium = mes, año, patrones` (1958-1978). Así que «Stats abre por Hoy», «Hoy no existe en el
código» y «mes y año son premium» son anteriores a la ronda M1–M4.

## Decisión del usuario: el §37 pasa a PROVISIONAL

La ronda M1–M4 se añadió al audit sin repensarse del todo, así que **deja de contar como
cerrada** y sus preguntas **vuelven a §36**: tipos de jornada · racha → ritmo semanal ·
puntuación de equilibrio · check-in de cierre · comparación retrospectiva. El texto se
conserva como propuesta de partida, no como canon.

Consecuencia acotada en `STATS_DESTINO_PROPUESTA.md`: quedan condicionados **§4.4** (ritmo
semanal), **§4.5** (tipos de jornada) y parte de **§4.6**; aguantan el gap de datos, las
fases y la medición. **La Fase 0 no está afectada** por ser agnóstica al contenido.

## Lo entregado

**Cadena de autoridad única**: 1 audit · 2 DECISIONES_PRODUCTO · 3 STATE · 4 CHANGELOG y
diarios. Con una regla nueva y simple: **un documento que no declare su estado en la cabecera
no gobierna**.

**Inventario etiquetado** de 20 documentos vivos + 7 auditorías, con evidencia de por qué
cada uno gobierna, es historia o se archiva.

**Archivado ejecutado** — 4 documentos a `docs/archive/`, cada uno con un banner que explica
por qué se archivó y qué lo sustituye:

| Archivo | Evidencia |
|---|---|
| `PACE_EVOLUTION_CONTEXT.md` (41 KB) | Volcado de conversación (empieza «Entendido. Lo que necesitas no es otra auditoría…» e incluye instrucciones de dónde guardarlo); `DECISIONES_PRODUCTO.md:3-9` ya declara que las sesiones leen el destilado |
| `CONTEXTO_UX_RUNNER_WELCOME.md` (19 KB) | Se autodeclara «Gobierna la sesión B2.2a.5» — cerrada en s112/v0.56.0 |
| `license-analysis.md` (11 KB) | Dice «Ningún archivo de licencia se ha añadido aún al repo»: falso desde v0.12.9 |
| `smoke-tests.md` (7 KB) | «Versión de referencia: v0.27.2+», más de 40 versiones atrás |

Más `README.md` en `docs/archive/` y en `docs/audits/`. Las auditorías **no** se movieron: la
carpeta ya declara su naturaleza y `CLAUDE.md` cita `audit-evolucion-v0.51.0.md` por ruta como
«no re-verificar» — moverla habría roto una cita que sigue siendo válida.

**Cabeceras de autoridad** en el audit (`GOBIERNA — nivel 1`) y en `DECISIONES_PRODUCTO.md`
(`GOBIERNA — nivel 2`), y **fila nueva en la tabla de `CLAUDE.md`** para que cualquier sesión
futura sepa dónde mirar cuando dude de si un documento manda.

## Drift detectado (no corregido)

- **`CONTENT.md`** declara reflejar el catálogo «a fecha de v0.37.0»; después hubo B2.3 olas
  1–4 y `couch.stretch.min` 5→6 (s118).
- **`ROADMAP.md`** llama «plan vigente» al bloque Contenido+Premium, **cerrado en s99/v0.39.0**.
- **`MONETIZATION.md`** no contradice al audit §20 (las cuatro vías coinciden) pero solapa
  autoridad: queda subordinado, aportando el detalle de licencia (`expiresAt`, validación
  offline).

## Lo que NO se hizo, del alcance «completa» que se aprobó

**Adelgazar `STATE.md` (150 KB) y `CHANGELOG.md` (94 KB).** Ambos incumplen su propio
contrato —STATE dice «este archivo no debe crecer» y `CLAUDE.md` prohíbe acumular historia
allí— y la causa está medida: la Red de seguridad guarda el historial completo de cada archivo
sesión a sesión, y las celdas de la tabla del CHANGELOG llegan a 4.000+ caracteres. El método
queda escrito en §4 del entregable, pero es un trabajo grande y con riesgo de perder
información, así que no se improvisó al final de la sesión.
