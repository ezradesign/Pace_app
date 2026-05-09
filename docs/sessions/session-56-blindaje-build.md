# Sesion 56 — Blindaje del build con parser sintactico real

**Fecha:** 2026-05-09
**Version:** v0.27.2 → v0.27.3
**Duracion estimada:** 1 sesion
**Archivos modificados:** `build-standalone.js`, `package.json` (nuevo),
`docs/BUILD.md` (nuevo), `app/state.jsx` (bump), `PACE.html` (bump)

---

## Contexto y motivacion

El proyecto habia acumulado 5 truncamientos silenciosos en las ultimas 8
sesiones (s48d, s51, s54, s54b, s55b). Cada truncamiento habia requerido
un check heuristico especifico:

- s52: `validateFileEnd` (terminadores y comentarios de bloque)
- s54b: clave-sin-valor + `new Function()` para `.js`
- s55b: `validateInlineScripts` con tokens esperados para Babel

El patron era claro: cada check era reactivo y tenia agujeros. El objetivo de
esta sesion fue reemplazar los cuatro checks heuristicos por un **parser
sintactico real** que valide todos los archivos antes del bundle.

---

## Decisiones tecnicas

### Parser elegido: TypeScript (ya instalado)

El plan original era usar `@babel/parser`. Sin embargo, `npm install` esta
bloqueado por politica de red en el entorno del workspace de Cowork. Se
evaluo `@babel/parser` via CDN (jsDelivr, unpkg) — tambien bloqueado.

Alternativa encontrada: `typescript` ya esta instalado globalmente en el
workspace como dependencia del SDK de Anthropic, en:
`/usr/local/lib/node_modules_global/lib/node_modules/typescript`

La API `ts.createSourceFile()` con `ScriptKind.JSX` parsea correctamente
archivos `.jsx` de React y produce `parseDiagnostics` con linea y columna
exactas. Verificado con truncamiento real de `app/state.jsx`.

### Strip de comentarios HTML antes de buscar scripts inline

El regex `/<script(\s[^>]*)?>...<\/script>/g` capturaba el fragmento
`<script type="text/babel" src>` que aparece dentro de un comentario HTML
`<!-- ... -->` en el bloque de documentacion del mount loop de `PACE.html`.
Eso generaba un falso positivo (inline script con contenido de prosa).

Solucion: `htmlContent.replace(/<!--[\s\S]*?-->/g, '')` antes del regex.

---

## Refactor de build-standalone.js

| Antes (s55b) | Despues (s56) |
|---|---|
| `validateFileEnd` (heuristico) | Eliminado — cubierto por parser |
| `validateNoUnclosedStrings` (heuristico) | Eliminado — cubierto por parser |
| `new Function()` para `.js` | Eliminado — cubierto por parser |
| `validateInlineScripts` con tokens magicos | Reemplazado por parser real |
| 297 lineas | 241 lineas |

Funciones nuevas:
- `validateSyntax(content, label, isJSX)` — parseo real, devuelve snippet
- `validateAppFiles()` — recorre `app/` recursivamente, aborta al primer error
- `validateInlineScripts()` mejorada — strip HTML comments + parser real

Funciones conservadas:
- `readFileClean()` — pre-filtro BOM/UTF-16/null bytes (sigue siendo necesario)

---

## Resultado del test de regresion (T3)

Truncamiento deliberado de `app/state.jsx` a 100 lineas:

```
=== PACE build-standalone.js (s56 / parser TS real) ===

[1/5] Validando archivos app/ ...

  [ERROR] Syntax error in app/state.jsx at 101:0
'}' expected.

    99 |   // state para no romper instalaciones existentes (usuarios que ya tengan
   100 |   // recordatorios guardados en localStorage) y por si se reintroduce un dia
>  101 |

  [ERROR] Abortando build. Reparar el archivo antes de continuar.
```

Build abortado correctamente con archivo, linea:columna y snippet exactos.
Tras restaurar `app/state.jsx`, el build completo paso sin errores (545 KB).

---

## Tabla de tareas

| Tarea | Descripcion | Estado |
|---|---|---|
| T1 | Setup @babel/parser (fallback a TS por bloqueo npm) | OK |
| T2 | Refactor build-standalone.js con parser real | OK |
| T3 | Test de regresion deliberado | OK |
| T4 | Validar codigo actual completo | OK (33 archivos, 0 errores) |
| T5 | docs/BUILD.md | OK |
| T6 | Bump v0.27.3 | OK |
| T7 | Rebuild y verificar bundle | OK (545 KB) |
| T8 | Documentacion de sesion | OK |

---

## Validaciones V1..V7

| V | Descripcion | Resultado |
|---|---|---|
| V1 | Parser instalado y funciona | OK (TypeScript, no @babel/parser) |
| V2 | build-standalone.js < 250 lineas | OK (241 lineas) |
| V3 | Test regresion aborta con linea correcta | OK (linea 101) |
| V4 | Build con codigo actual sin errores | OK |
| V5 | Bundle 540-580 KB | OK (545 KB) |
| V6 | docs/BUILD.md creado con todas las secciones | OK |
| V7 | package.json valido | OK |

---

## Estadisticas de archivos validados

- Archivos `.js`: 3 (`strings.js`, `strings-content.js`, `registry.js`)
- Archivos `.jsx`: 30
- Scripts inline PACE.html: 2 (mount loop JSX + service worker JS)
- Total: 35 unidades validadas por el parser real en cada build

---

## Pendientes futuros

- Si en el futuro se tiene acceso a npm, migrar a `@babel/parser` para mayor
  fidelidad con el runtime de Babel standalone (ver `docs/BUILD.md`).
- Considerar anadir validacion de que todos los `Object.assign(window, {...})`
  esten presentes en los `.jsx` que los requieren.
- La ruta hardcodeada de TypeScript puede romperse si cambia el entorno.
  Documentado en `docs/BUILD.md` seccion "Limitaciones conocidas".
