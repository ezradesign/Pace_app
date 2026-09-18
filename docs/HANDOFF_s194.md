# HANDOFF s194 → s195 · Origen y recolocar publicados; la maqueta del norte (A) está ENVIADA y sin decidir

> **La conversación se migró por falta de contexto** con la pieza 3 a mitad: la maqueta «el hilo
> de la semana» (`docs/proposals/semana-r1.html`) está enviada al usuario y **falta su respuesta**
> a la lista de decisiones del final. **Nada de la pieza 3 está implementado en la app**: el
> prototipo de la regla vive como TEXTO dentro de `scripts/audit/semana-s194.js` (`REGLA`) y se
> inyecta en la página para calcular las semanas con el catálogo real.
>
> s194 publicó **dos versiones**: **v0.124.0** (pieza 1 · el origen de cada sesión) y **v0.125.0**
> (pieza 2 · recolocar a mitad de día, el bug del selector de inicio y «Hoy voy por libre» en E).
> Orden acordado: **origen → recolocar → A**; para el norte, **A ya, C después, B aparcada**. El
> usuario, sobre recolocar: «me parecen bien las propuestas por el momento»; sobre la semana:
> «cada semana del año tiene que ser diferente o al menos coherente».

---

## 0 · Estado exacto

| | |
|---|---|
| Última versión | **v0.125.0** — feat(ritmo): recolocar a mitad de día |
| Anteriores | `83213d1` v0.124.0 (el origen de cada sesión) · `0399518` v0.123.0 · `2a93077` troceo |
| Suite | **260/260** (eran 253 al empezar la sesión) · `npm run verify` verde |
| Mutantes | `banco-origen-s194.js` **12/12** · `banco-recolocar-s194.js` **13 de 13** · los de s192/s193 vigentes |
| Límite §1 | `app/move/MoveSessionV1.jsx` en **500** (no se tocó) · `tests/ritmo.spec.js` en **465**: lo siguiente a un spec hermano |
| Páginas | `por-donde-seguir-s194.html` (el mapa y las decisiones) · `recolocar-r1.html` (hoy / propuesta) · `por-libre-r1.html` (cinco variantes; el usuario eligió **E**) · **`semana-r1.html` (el norte, lectura A: ENVIADA, SIN DECIDIR)** |
| CI | verde en `8ee4919` (v0.125.0): `verify` ✓ · `e2e` ✓ |

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

1. **Recoger la respuesta del usuario a `semana-r1.html`** y, con ella, implementar la pieza 3
   (v0.126.0). La lista que tiene que contestar (basta una línea, p. ej. «A · sí · B · A · A · A ·
   nombres bien»):
   - **El tema por semana**: A · seis temas en ciclo (Cuello y hombros · Caderas y piernas · Manos y
     muñecas · Espalda y postura · El aire · Ligera) · B · cuatro, más marcados · C · ninguno, solo acentos.
   - **Los acentos del día**: sí · no · cuáles quitar (arrancar · la mitad · aire · cerrar suave).
   - **El miércoles («la mitad»)**: A · dos largas antes de comer, como sale · B · solo se adelanta la
     primera · C · quitar el acento.
   - **El viernes («cerrar suave»)**: A · el cierre se alarga a 10 min · B · sigue de 5 y cambia el plato.
   - **Dónde se dice**: A · la línea bajo la cabecera (fotos) · B · también bajo «A TU RITMO» en el aro ·
     C · también en la barra lateral.
   - **El fin de semana**: A · por libre · B · un menú corto si lo pides.
   - **Los nombres** de los temas.

   **Lo que hay que saber para implementarla** (todo medido en s194):
   - Pozos junto a la mesa y gratis: **Estira 6 · Mueve 4 · Respira 5 · cierre 1** (catálogo entero
     17 · 14 · 20). Una jornada sirve ~4 platos de Estira: la repetición semanal es inevitable; lo que
     varía es la región líder, el orden y la forma del día. Dos semanas seguidas dan 13 platos
     distintos cada una y 11 en común.
   - El prototipo (`REGLA` en `scripts/audit/semana-s194.js`): `semanaISO(iso)` (sin
     `new Date("YYYY-MM-DD")`), `SEMANA_TEMAS` (tags del catálogo: SIT · SHLD · SPN · HIP · LEG · WRST ·
     POST · STEALTH · GRIP · BACK · REL · BAL · EQU), `SEMANA_ACENTOS` (1..7), `semanaPozos` (reordena
     los pozos por afinidad al tema; `corta` pone los de ≤3 min delante; `respiraLarga` los largos),
     `semanaComponer` (la regla del día de siempre + retoques por acento). **Los pozos se piden POR
     DÍA** (`ritmoPozos(s, fecha)`): calcularlos una vez para la semana deja los cinco días iguales
     (pasó en la primera tirada). «La mitad» entra por `previos = { pausas: 1 }`.
   - Si se implementa: `ritmoPozos` (state-ritmo) o `ritmoMenu` aplican `semanaPozos`; el motivo va
     en `RitmoComo` o en una línea hermana; `ritmo.spec.js` está en 465 líneas → **spec nuevo**
     (`tests/semana.spec.js`); banco de mutantes propio; DECISIONES_TECNICAS + DESIGN_SYSTEM.
   - Lo declarado en la página: el cierre del viernes sirve un plato de 10 min en un hueco de 5; el
     miércoles cae una segunda larga a las 13:15 por la cadencia.
2. **Que el usuario lo use un día entero** y cuente qué chirría (ya encontró dos cosas en diez
   minutos: el selector y «por libre», las dos resueltas en v0.125.0).
3. **C, cuando el origen tenga semanas de datos**: el sistema enseña qué cambió y propone ajustes;
   saca Stats «Semana» del aparcamiento. B (planificar la semana) aparcada hasta el calendario.
4. `MoveSessionV1.jsx` en 500 · `ritmo.spec.js` en 465 · la pausa larga propone un plato de dos · el
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
node scripts/audit/semana-s194.js         # la maqueta del norte (A): regenera docs/proposals/semana-r1.html
```

## 6 · Al arrancar la siguiente

1. Leer `CLAUDE.md` → `STATE.md` → este handoff → `docs/proposals/semana-r1.html` (abrirla o
   leerla: es lo que el usuario tiene delante).
2. Preguntar al usuario por su respuesta a la lista de §2.1 **sin volver a pintar**: la maqueta ya
   está enviada. Si pide cambios, se regenera con `semana-s194.js` (patrón de rondas de s192).
3. Implementar con su letra, como v0.126.0, con las redes de siempre.
