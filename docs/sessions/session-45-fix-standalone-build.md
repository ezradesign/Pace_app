# Sesión 45 — fix(standalone): reparar build post-s44

**Fecha:** 2026-05-06  
**Versión:** v0.24.0 (sin bump — fix solo de build)  
**Duración estimada:** corta

---

## Objetivo

El `PACE_standalone.html` entregado en sesión 44 estaba roto. `PACE.html`
funcionaba correctamente. La tarea era diagnosticar y corregir solo el
standalone, sin tocar comportamiento ni diseño.

---

## Diagnóstico

### Síntoma
El standalone terminaba abruptamente en medio del bloque del Service Worker:

```
  <!-- PWA · Service Worker (sesión 37 · v0.19.0) -->
  <script>
    if ('serviceWorker' in navigator) {
      window   ← FIN DEL ARCHIVO (truncado)
```

Faltaban: `window.addEventListener(...)`, el cierre del bloque `</script>`,
`</body>` y `</html>`.

### Verificaciones realizadas
1. `PACE.html` funciona correctamente — el problema era solo el standalone.
2. El standalone roto **sí contenía** YearView (computeDayScore×2, YearView×5) — no era un fallo de inlining del nuevo código.
3. `YearView.jsx`, `StatsPanel.jsx` y `main.jsx` no contienen ninguna cadena `</script>` que pudiera romper el parsing HTML.
4. El build script (`build-standalone.js`) usa callback function en `String.replace()`, lo que hace seguro cualquier `$` en el contenido.

### Causa raíz
Error transitorio de escritura durante s44. No reproducible. El build script
es correcto y genera el standalone completo al volver a ejecutarlo.

| Métrica | Archivo roto (s44) | Archivo correcto (s45) |
|---|---|---|
| Tamaño | 461 549 bytes (451 KB) | 479 104 bytes (468 KB) |
| Líneas | 8 496 | 9 031 |
| Cierra `</html>` | No | Sí |
| `serviceWorker.register` | No | Sí |
| `computeDayScore` | 2 | 2 |
| `YearView` refs | 5 | 5 |

---

## Fix

```
node build-standalone.js
```

Output: `PACE_standalone.html generado — 468 KB`

Verificaciones post-build:
- `Ends with </html>`: true
- `Contains </body>`: true
- `Contains serviceWorker.register`: true
- YearView presente y completo

---

## Nota sobre el backup

El standalone roto fue sobreescrito antes de guardarlo como
`backups/PACE_standalone_v0.24.0_broken_20260506.html`. El archivo
diagnóstico se perdió. Para referencia futura: el truncamiento estaba
a ~17 KB del final (línea 8496 de 9031).

El backup v0.23.0 (sesión 43) sigue intacto.

---

## Archivos modificados

- `PACE_standalone.html` — regenerado limpio (468 KB)
- `STATE.md` — sección "Última sesión" reescrita, build entregado actualizado
- `docs/sessions/session-45-fix-standalone-build.md` — este diario

Sin cambios en código fuente → **versión permanece v0.24.0**.

---

## Commit sugerido

```
fix(standalone): regenerar build roto de s44 (truncamiento transitorio)

PACE_standalone.html v0.24.0 corregido: 468 KB, cierra correctamente
con bloque ServiceWorker + </body></html>. Sin cambios en código fuente.
```
