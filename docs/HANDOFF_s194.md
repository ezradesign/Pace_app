# HANDOFF s194 → s195 · Origen y recolocar publicados; queda «por libre» y la lectura A del norte

> s194 publica **dos versiones**: **v0.124.0** (pieza 1 · el origen de cada sesión) y **v0.125.0**
> (pieza 2 · recolocar a mitad de día, más el bug del selector de inicio). Recomendación dada y
> aceptada como orden de trabajo: **origen → recolocar → A**; para el norte, **A ya, C después, B
> aparcada**. El usuario, sobre recolocar: «me parecen bien las propuestas por el momento».

---

## 0 · Estado exacto

| | |
|---|---|
| Última versión | **v0.125.0** — feat(ritmo): recolocar a mitad de día |
| Anteriores | `83213d1` v0.124.0 (el origen de cada sesión) · `0399518` v0.123.0 · `2a93077` troceo |
| Suite | **260/260** (eran 253 al empezar la sesión) · `npm run verify` verde |
| Mutantes | `banco-origen-s194.js` **12/12** · `banco-recolocar-s194.js` **13 de 13** · los de s192/s193 vigentes |
| Límite §1 | `app/move/MoveSessionV1.jsx` en **500** (no se tocó) · `tests/ritmo.spec.js` en **465**: lo siguiente a un spec hermano |
| Páginas | `por-donde-seguir-s194.html` (el mapa y las decisiones) · `recolocar-r1.html` (hoy / propuesta) · `por-libre-r1.html` (cinco variantes; el usuario eligió **E**) |

Diario: [session-194](./sessions/session-194-el-origen-de-cada-sesion.md) · Decisión técnica: fila s194 de
[`DECISIONES_TECNICAS_VIGENTES.md`](./product/DECISIONES_TECNICAS_VIGENTES.md) · Esquema: rev. 7 de
[`EVENTOS_SCHEMA.md`](./product/EVENTOS_SCHEMA.md) §8.

---

## 1 · Lo que s194 deja DECIDIDO

- **`origin` + `fromMenu`** en `session.completed`, dos campos, anulables, no consolidados en el
  baseline. La puerta se anota en el gesto y la consume la primera sesión que termina; en un
  Camino manda `camino`.
- **Recolocar**: al empezar cada bloque, **siempre** que la hora no sea la del plan; lo hecho se
  congela (`dia.pasado`); **el bloque que empiezas dura lo que marca el aro**; si el día no cabe, la
  cola se funde (la regla de siempre); el retraso se pinta punteado; **llegar antes es empezar**.
- **El norte**: lectura **A** primero (el menú varía con el día de la semana), **C** cuando el
  origen tenga semanas de datos, **B** aparcada hasta el calendario.

---

## 2 · Por dónde seguir, en orden

1. **El norte, lectura A** (pieza 3): el menú varía con el día de la semana, con **motivo visible**
   en el panel (si no, parece arbitrario). Pintar antes: cinco días, qué cambia, dónde se dice el
   porqué. Cuidado con `ritmoPozos` (rota por día) y con el veto de s189.
2. **Que el usuario lo use un día entero** y cuente qué chirría (ya encontró dos cosas en diez
   minutos: el selector y «por libre», las dos resueltas en v0.125.0).
3. `MoveSessionV1.jsx` en 500 · `ritmo.spec.js` en 465 · la pausa larga propone un plato de dos · el
   cierre nunca es «Ahora» · el modo oscuro del panel y del hueco punteado · un consumidor de
   `origin` (Stats «Semana») cuando haya datos.

---

## 3 · Lo que s194 declara SIN cubrir

- **Recolocar**: `primerBloque` cuando el aro y el plan no coinciden (en la suite coinciden, 45 y
  45); la rehidratación de un plato congelado solo se prueba por su nombre; el modo oscuro.
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
- **Un mutante que no se distingue del plan no muerde**: el bloque forzado de 45 con bloques de 45
  se hizo distinguible (35) ANTES de correr el banco; la comida hecha, con la hora de comer por
  delante (13:00). Diseñar la prueba pensando en el mutante, no al revés.
- **El servidor del 8765 de otra sesión puede desaparecer a mitad**: `preview_start` lo relanza.
- **NADA que compile mientras corre un banco de mutantes**: un `verify` concurrente rehace
  `index.html` —lo que sirve el 8765— y un mutante que muerde sale «vivo». Pasó en la segunda pasada
  de recolocar (12 de 13); la tercera, en limpio, dio 13 de 13.
- Las tandas de fotos intermedias (`hoy.json` / `propuesta.json`) van al temp del sistema, nunca a
  `docs/`: solo se commitea la página.
- Las de s193 siguen: `String.replace` con `$&`/`$'`, CRLF en la copia de trabajo, heredocs largos
  con backticks, `lastActiveDay` en formato `toDateString` para sembrar un bloque hecho.

---

## 5 · Para arrancar

```
node .claude/static-server.js            # o el preview «pace-preview»
npm run verify
npx playwright test tests/eventos-origen.spec.js tests/ritmo.spec.js
node scripts/audit/banco-origen-s194.js   # 12 mutantes, recompila, restaura por bytes (~8 min)
node scripts/audit/banco-recolocar-s194.js   # 13 mutantes (~9 min)
node scripts/audit/recolocar-s194.js --hoy   # sobre el artefacto ANTERIOR a la regla (git stash o checkout de index.html)
node scripts/audit/recolocar-s194.js && node scripts/audit/recolocar-s194.js --pagina
```
