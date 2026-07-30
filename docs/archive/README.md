# docs/archive — documentación retirada

> **Nada de esta carpeta gobierna.** Se conserva como historia, no como fuente de
> decisiones. El índice de autoridad vigente está en
> [`docs/product/AUDITORIA_DOCUMENTAL.md`](../product/AUDITORIA_DOCUMENTAL.md).

Si abres uno de estos archivos sin contexto —o lo pegas en una conversación nueva—, lee
primero su banner: dice por qué se archivó y qué lo sustituye.

| Archivo | Archivado en | Por qué | Qué gobierna en su lugar |
|---|---|---|---|
| `PACE_EVOLUTION_CONTEXT.md` | s130 | Volcado de conversación de 2026-07, ya destilado | `docs/product/DECISIONES_PRODUCTO.md` |
| `CONTEXTO_UX_RUNNER_WELCOME.md` | s130 | Gobernaba la sesión B2.2a.5, cerrada en s112/v0.56.0 | `STATE.md` (Red de seguridad) + `docs/sessions/session-119` |
| `license-analysis.md` | s130 | Afirmaba que no había licencia en el repo; `LICENSE` existe desde v0.12.9 | `LICENSE` (Elastic 2.0) |
| `smoke-tests.md` | s130 | Referencia v0.27.2, más de 40 versiones atrás | Checklist de cierre de `CLAUDE.md` |
| `RED_DE_SEGURIDAD_HISTORICO.md` | s131 | Historial por archivo que engordaba `STATE.md` (53 KB) | Tabla compacta de `STATE.md` + `CHANGELOG.md` + diarios |
| `CHANGELOG_TABLA_HISTORICA.md` | s131 | Celdas de la tabla de hasta 4.000+ caracteres (78 KB) | `CHANGELOG.md` con titulares + diarios de sesión |
| `ROADMAP_CAMINO_V1_HISTORICO.md` | s132 | Secuencia de s93 que llevaba 23 sesiones mostrando como «siguiente» algo que nunca se hizo | Sección «Camino a v1.0» de `ROADMAP.md` (plan operativo único) |

**Nota:** las **decisiones técnicas vigentes** que salieron de `STATE.md` en s131 **NO están
aquí**: son reglas en vigor y viven en
[`docs/product/DECISIONES_TECNICAS_VIGENTES.md`](../product/DECISIONES_TECNICAS_VIGENTES.md),
que GOBIERNA. Mudarse de archivo no es archivarse.

Las auditorías históricas siguen en [`docs/audits/`](../audits/) con su propio aviso; no se
movieron para no romper la cita de `CLAUDE.md` a `audit-evolucion-v0.51.0.md`, que sigue
siendo válida como «no re-verificar».

Los diarios de `docs/sessions/` **nunca** se archivan: son el registro histórico y se
conservan tal como se escribieron, incluso si algún enlace suyo apunta a un archivo que
después se movió aquí.
