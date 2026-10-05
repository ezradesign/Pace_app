# HANDOFF s193 → s194 · La línea sigue al aro; el norte es la semana

> **v0.123.0 está lista para commitear** (el mensaje va al final de la sesión). Antes, el troceo de
> `main.jsx` y `FocusTimer.jsx` quedó en su propio commit (`2a93077`). `npm run verify` en verde,
> **253/253** en local sobre el `index.html` regenerado, **12 de 12 mutantes muerden** con control.
> El usuario dijo: «sigamos mejorando el sistema, vamos bien».

---

## 0 · Estado exacto

| | |
|---|---|
| Última versión | **v0.123.0** — feat(ritmo): la línea sigue al aro |
| Commit previo | `2a93077` — refactor(estructura): `main.jsx` 500 → 417 · `FocusTimer.jsx` 499 → 326 |
| Suite | **253/253** (eran 250) · `npm run verify` verde · censo i18n 646 |
| `index.html` | al día con las fuentes |
| `PACE_standalone.html` | intacto (congelado desde s134; el build y el banco lo reescriben y se restaura) |
| Mutantes | `scripts/audit/banco-pausa-s193.js`: **12 de 12 muerden**; `banco-ritmo-s192.js` sigue vigente |
| Límite §1 | **`app/move/MoveSessionV1.jsx` está en 500 líneas** (lo señaló el `verify`; no se tocó) |

Diario: [session-193](./sessions/session-193-la-linea-sigue-al-aro.md) · Decisión técnica: la fila s193 de
[`DECISIONES_TECNICAS_VIGENTES.md`](./product/DECISIONES_TECNICAS_VIGENTES.md) · Plan: **FASE 3.6** del
[`ROADMAP`](../ROADMAP.md) · Maqueta: `docs/proposals/la-linea-sigue-al-aro-r1.html` (`node scripts/audit/pausa-s193.js`).

---

## 1 · Lo que s193 deja DECIDIDO (no reabrir sin el usuario)

- **El tramo de ahora se rellena con el pomodoro** (`--pace-bloque`), y antes de empezar está
  **encendido al 35 % y vacío** (1A).
- **Al acabar el bloque, «Ahora» es la pausa** hasta que **empieza el bloque siguiente** (2A):
  hagas la rutina o la saltes. Tocar la parada abierta la empieza. En móvil «Ahora» es la parada y
  «Luego» el bloque. La barra lateral dice **«Tu pausa · 9:45»** mientras está abierta.
- **Lo hecho no se atenúa**: el bloque hecho queda en verde entero y la parada pasada conserva su
  fuerza (solo deja de poder tocarse). «Atenuado parece como si no se hubiera realizado.»
- **La frase de la primera vez se queda** («Cada bloque es un pomodoro en el aro; al acabar, te sirvo
  la pausa que toca.»), hasta el primer bloque hecho del día.
- **El norte**: «acompañar el día pero ir ofreciendo propuestas para cada día de la semana/mes».

---

## 2 · Por dónde seguir, en orden

1. **Que el usuario lo use un día entero** (sigue sin pasar: las fotos son de Playwright) y cuente
   qué chirría ahora que la línea se mueve. Y los detalles de las entrevistas de s192, que siguen
   sin anotarse.
2. **Propuestas para cada día de la semana/mes** — el norte nuevo. Antes de diseñar: qué significa
   «proponer por día» (¿varía el menú por día de la semana? ¿se planifica la semana? ¿se enseña qué
   cambió?). **Pintar antes**, sobre la app real, como en s192/s193. Depende de (3) para saber qué
   funciona.
3. **El origen de cada sesión en `pace.events.v1`** (menú · propuesta · biblioteca · Camino · la
   parada tocada). Toca el esquema y la lista permitida de `events-payloads.js`; leer su fila de
   decisiones antes, y ojo a `module: 'extra'`, que no valida (s190).
4. **Recolocar a mitad de día**: si empiezas el bloque 2 tarde, la línea sigue con las horas del
   plan. Ahora que la pausa existe como estado, recomponer «desde ahora» al cerrarla es el sitio
   natural. Pintar la línea antes y después de un retraso.
5. **`MoveSessionV1.jsx`** en 500: trocear antes de tocarlo.
6. **Los huecos declarados de s193**: el cierre nunca es «Ahora» (`RitmoHecho` manda); la pausa
   larga propone un plato de dos; la comida como parada abierta no se fotografió; el modo oscuro del
   panel sigue sin mirarse.
7. **Llegar antes de tu hora** · Stats «Hoy» con el menú · contexto real (Fase 8) · calendario ·
   datos anónimos con permiso.

---

## 3 · Lo que s193 declara SIN cubrir

- **Ni un píxel comparado**: los colores de la línea se miraron en fotos a tamaño real, no se asertan.
  El banco lo declara: no muta colores ni la guarda `pausa === hechos`.
- **El relleno se comprueba en escritorio** (`::after` del tramo); en móvil solo la clase.
- **Un pomodoro hecho tras volver de «por libre»** cuenta como bloque del plan (era así en s192).

---

## 4 · Trampas de esta sesión

- **`String.replace(viejo, nuevo)` con `$&` o `$'` en `nuevo`**: escribe la coincidencia o lo que va
  detrás, no el texto. Duplicó medio script. Siempre `replace(v, () => n)`.
- **La copia de trabajo va con CRLF** (`autocrlf=true`; el repo guarda LF): un insert con LF deja el
  archivo mixto y los reemplazos exactos dejan de casar. Normalizar a LF para buscar, escribir CRLF.
- **Un heredoc largo con backticks en Git Bash** no se ejecuta (`unexpected EOF`): script a archivo
  con Write y `node archivo.js`.
- **Sembrar un bloque hecho** en un test exige `cycle: 1` + `lastActiveDay: 'Thu Sep 17 2026'`
  (formato `toDateString`) + `_historyMigrated: true`; si no, el relevo de día pone `cycle` a 0.
- **La maqueta a ancho fijo se vio cortada** en el panel del usuario: página fluida, recortes con
  `sharp`, las enteras bajo `<details>` con scroll, y las decisiones dentro de la página.
- **El panel del navegador no dibujó una captura**: Playwright.
- **El banco y el build reescriben `PACE_standalone.html`**: `git checkout --` de ESE archivo.

---

## 5 · Para arrancar

```
node .claude/static-server.js            # o el preview «pace-preview» (autoPort si el 8765 está ocupado)
npm run verify
npx playwright test tests/ritmo.spec.js
TZ=UTC npx playwright test tests/ritmo.spec.js   # lo que ve el CI
node scripts/audit/banco-pausa-s193.js    # 12 mutantes, recompila, restaura por bytes (~10 min)
node scripts/audit/pausa-s193.js          # la maqueta de la ronda 1, sobre la app real (servidor en 8765)
```
