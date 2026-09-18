# HANDOFF s194 → s195 · El origen ya se registra; ahora recolocar el día y la lectura A del norte

> **v0.124.0** publica la pieza 1 de las tres que el usuario pidió («1 · el origen de cada sesión,
> 2 · recolocar a mitad de día, 3 · el norte»). Recomendación dada y aceptada como orden de
> trabajo: **origen → recolocar → A**; para el norte, **A ya, C después, B aparcada**.

---

## 0 · Estado exacto

| | |
|---|---|
| Última versión | **v0.124.0** — feat(eventos): el origen de cada sesión |
| Anteriores | `0399518` v0.123.0 (la línea sigue al aro) · `2a93077` troceo de `main.jsx` y `FocusTimer.jsx` |
| Suite | **257/257** (eran 253) · `npm run verify` verde |
| Mutantes | `scripts/audit/banco-origen-s194.js` (ver `STATE.md`) · los bancos de s192 y s193 siguen vigentes |
| Límite §1 | `app/move/MoveSessionV1.jsx` en **500** (no se tocó) |
| Explicación al usuario | `docs/proposals/por-donde-seguir-s194.html` (fluida; el mapa de dependencias, las tres lecturas del norte, la lista de decisiones) |

Diario: [session-194](./sessions/session-194-el-origen-de-cada-sesion.md) · Decisión técnica: fila s194 de
[`DECISIONES_TECNICAS_VIGENTES.md`](./product/DECISIONES_TECNICAS_VIGENTES.md) · Esquema: rev. 7 de
[`EVENTOS_SCHEMA.md`](./product/EVENTOS_SCHEMA.md) §8.

---

## 1 · Lo que s194 deja DECIDIDO

- **`origin` + `fromMenu`** en `session.completed`, dos campos, anulables, no consolidados en el
  baseline. La puerta se anota en el gesto y la consume la primera sesión que termina; en un
  Camino manda `camino`.
- **El norte**: lectura **A** primero (el menú varía con el día de la semana), **C** cuando el
  origen tenga semanas de datos, **B** aparcada hasta el calendario.

---

## 2 · Por dónde seguir, en orden

1. **Recolocar a mitad de día** (pieza 2). Al cerrar la pausa («Empezar bloque N»), si vas por
   detrás, recomponer desde ahora con «salgo a mi hora»: `ritmoComponer` ya sabe llegar tarde
   (recolocar es llegar tarde al bloque N); el estado necesita `dia.desde` por recomposición y
   conservar `cicloBase`/`pausa`. **Pintar antes**: la línea con retraso, hoy y propuesta, sobre la
   app real (patrón `scripts/audit/pausa-s193.js`). **Decisión pendiente del usuario**: si el día
   ya no cabe, ¿un bloque menos (propuesto) o bloques más cortos? De paso caen «llegar antes» y el
   cierre como «Ahora».
2. **El norte, lectura A** (pieza 3): el menú varía con el día de la semana, con **motivo visible**
   en el panel (si no, parece arbitrario). Pintar antes: cinco días, qué cambia, dónde se dice el
   porqué. Cuidado con `ritmoPozos` (rota por día) y con el veto de s189.
3. **Que el usuario lo use un día entero** y cuente qué chirría: sigue pendiente desde s192.
4. `MoveSessionV1.jsx` en 500 · la pausa larga propone un plato de dos · el cierre nunca es «Ahora»
   · el modo oscuro del panel · un consumidor de `origin` (Stats «Semana») cuando haya datos.

---

## 3 · Lo que s194 declara SIN cubrir

- Ningún consumidor lee `origin` todavía; el dato se acumula en los 120 días de retención.
- Una sesión que sobrevive a una recarga (Foco persistido, Respira reanudada) sale con `origin: null`.
- La biblioteca abierta desde una tarjeta de módulo de la pausa sale como `pausa` + `fromMenu: false`
  (intención; no asertado).

---

## 4 · Trampas de esta sesión

- **«Volver al inicio»** es hermano de `[data-pace-session-done]`, no hijo: buscarlo en
  `[data-pace-session-root]`.
- **`pathRunId` es opcional** en `session.completed` (§7.1): un emisor con `inPath` y sin
  `paths.current` emite igual, con `context: 'path'`.
- Las de s193 siguen: `String.replace` con `$&`/`$'`, CRLF en la copia de trabajo, heredocs largos
  con backticks, `lastActiveDay` en formato `toDateString` para sembrar un bloque hecho.

---

## 5 · Para arrancar

```
node .claude/static-server.js            # o el preview «pace-preview»
npm run verify
npx playwright test tests/eventos-origen.spec.js tests/ritmo.spec.js
node scripts/audit/banco-origen-s194.js   # 12 mutantes, recompila, restaura por bytes (~8 min)
```
