# Sesión 131 — Limpieza estructural: STATE y CHANGELOG

**Fecha:** 2026-07-30
**Tipo:** sesión SOLO-DOCUMENTAL — sin versión nueva, cero código, cero build
**Versión de referencia:** v0.71.0
**Ejecuta:** §4 de [`AUDITORIA_DOCUMENTAL.md`](../product/AUDITORIA_DOCUMENTAL.md)

---

## Resultado

| Archivo | Antes | Después |
|---|---|---|
| `STATE.md` | 153 KB | **57 KB** |
| `CHANGELOG.md` | 95 KB | **41 KB** |

## Lo que la radiografía cambió del plan

Antes de tocar nada se midió sección por sección, y el diagnóstico previo era incompleto: los
dos pesos gordos de `STATE.md` eran **«Decisiones activas» (62 KB, 108 filas)** y **«Red de
seguridad» (53 KB, 105 filas)** — 115 de los 153 KB entre las dos.

Eso obligó a distinguir dos cosas que el §4 del audit trataba igual:

- El **historial por archivo** de la Red de seguridad **sí es historia** → se archivó en
  `docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`. La tabla viva conserva archivo · rol ·
  **versión actual**, que es lo que una sesión necesita saber al arrancar.
- Las **decisiones técnicas NO son historia**: son reglas en vigor que existen precisamente
  para no reintroducir regresiones ya resueltas (el confinamiento del scrollbar del runner, el
  patrón de relojes, las claves ISO locales, el contrato de pasos v1…). Archivarlas habría sido
  un error. Se mudaron a **`docs/product/DECISIONES_TECNICAS_VIGENTES.md`**, que **GOBIERNA**, y
  `STATE.md` conserva el índice de títulos con enlace. Mudarse de archivo no es archivarse.

En el `CHANGELOG.md`, las 106 filas de la tabla conservan su **titular** y el texto largo —había
celdas de más de 4.000 caracteres, duplicando lo que ya cuenta el diario de cada sesión— se fue
a `docs/archive/CHANGELOG_TABLA_HISTORICA.md`. **El detalle de las 2 últimas versiones queda
intacto**, como manda la convención del propio archivo.

## Verificación

- 105 filas de Red de seguridad y 108 de decisiones migradas **sin pérdida** (el conteo inicial
  de «135 filas» era erróneo: contaba líneas del rango, no filas de tabla).
- Las 2 secciones de detalle del CHANGELOG siguen presentes.
- El texto completo de una decisión concreta («PROHIBIDO globalizar» del scrollbar del runner)
  sigue localizable en su archivo nuevo, y su título en el índice de STATE.
- 3 filas quedaron con `**` sin cerrar al recortar el titular; se reequilibraron para no romper
  el markdown de la fila.

## La trampa del día

El script de transformación producía un CHANGELOG truncado (118 líneas en vez de 367). Causa:
**en PowerShell `$C` y `$c` son la misma variable** —no distingue mayúsculas— así que
`$C = Get-Content CHANGELOG.md` y `$c = $b -split ' | '` colisionaban: en la primera iteración
del bucle, el contenido del archivo se sustituía por las 5 celdas de esa fila.

Se detectó comparando el conteo de líneas **antes de instalar nada**, y se confirmó que el
fichero original nunca se dañó (`git status` limpio, 363 líneas, 97 KB). Es exactamente el tipo
de bug que la regla #8 de `CLAUDE.md` prohíbe en `.map()`, aplicado al shell.

## Qué queda

- Segunda pasada opcional sobre STATE: quedan ~21 KB en «Pendiente», «Próxima sesión» y
  backlogs, que conviene revisar uno por uno en vez de recortar a máquina.
- Cabecera de estado en los documentos que aún no la declaran: CONTENT, ROADMAP, MONETIZATION,
  DESIGN_SYSTEM, EVENTOS_SCHEMA, BASE_MUEVE_ESTIRA.
- Verificar el drift de `CONTENT.md` y `ROADMAP.md` contra el código.
- **La auditoría de DIRECCIÓN queda pendiente del feedback de los beta testers**, que el
  usuario tiene y no está en el repo.
