# Sesión 178 · La auditoría completa

> **v0.107.0 → v0.108.0** · `npm run verify` PASA · `npm run test:e2e` **150/150** ·
> `PACE_standalone.html` intacto en v0.71.0 · consola limpia sobre el artefacto regenerado.
>
> El informe con la evidencia `file:line` vive aparte y **gobierna sobre este diario**:
> [`docs/audits/audit-completa-s178.md`](../audits/audit-completa-s178.md).

---

## 0 · El encargo

Textual del usuario al cerrar s177: *«empezamos s178 haciendo una auditoría completa para saber
qué hay que hacer, qué queda pendiente, qué decisiones están obsoletas, etc»*. Cinco preguntas,
con evidencia `file:line`, sobre 196 filas de decisiones, 15 fases de ROADMAP y un backlog que
nadie había cruzado consigo mismo desde s137.

La sesión hizo la auditoría **y cerró once de los trece hallazgos**, con las decisiones tomadas
por el usuario sobre opciones pintadas.

---

## 1 · La línea base se midió, no se citó

El handoff afirmaba `verify` en verde y 150/150. Se corrieron los dos antes de tocar nada. Es
barato y es la única forma de que un hallazgo posterior sea atribuible.

---

## 2 · Lo que contestó la auditoría

**El titular no es ninguno de los trece hallazgos por separado, sino su dirección**: los cuatro
marcadores desfasados del ROADMAP pintaban **más** trabajo del que hay, nunca menos. El plan se
lee al planificar y no se actualiza al entregar.

- **La Fase 3** seguía «🔄 EN CURSO (s155, v0.88.0)» con los emisores entregados en **v0.102.0**
  y la retención por calendario corriendo sola desde **s174** (`app/events/events-store.js:370`).
- **La ola B** decía «los 20 dibujos»; son **3** (`GLIFOS_EJERCICIOS_PENDIENTES.md`, generado).
- **El arte de logros** decía «58 de 96 / 38 sin dibujo»; es **77 de 96 / 19**.
- **La Fase 5** no tenía marcador pese a llevar la voz de s175 y la música de s177 dentro.

Y `STATE.md` participaba: su sección «Diferido» daba la retención por no programada mientras
tres fuentes —el código, su spec y el propio `verify`— decían lo contrario. **Ese hallazgo
(2.6) apareció al ir a corregir el marcador, no buscándolo.**

### Lo que no salió, y también es resultado

Cinco filas señaladas por el checker estaban **bien**: dicen «NUNCA `discrete`», «se DESCARTÓ»,
«si en el futuro». **Cero apariciones significaba que la decisión se cumple.** Un grep no
distingue «desapareció» de «tiene prohibido existir», y esa distinción sólo la da leer la fila.

También aguantaron: cero peticiones externas en el artefacto publicado, el texto de
almacenamiento de `privacy.html` frente a las tres claves reales, y los `_*.html` de la raíz,
que están gitignoreados y no son deuda.

---

## 3 · El hallazgo que corrigió al handoff

El handoff daba `library-transition.js` por «inerte desde s174, 130 líneas», con el borrado como
decisión del usuario.

**El primer cruce que probé no vio nada**: los `<script>` de `PACE.html` contra los archivos de
`app/` dieron **122 = 122, cero huérfanos**. Un censo de carga no puede ver un módulo que se
carga, se llama y no hace nada.

Con la comprobación relacional —quién consume cada símbolo publicado a `window`— salió la
verdad: `app/main.jsx:153` lo llamaba **en cada entrada a sesión**, clonaba un nodo
(`library-transition.js:77`) y gastaba **24 frames, ~400 ms** buscando un destino que s175 se
había llevado. Borrarlo eran **dos sitios**, no un archivo suelto.

---

## 4 · Las seis veces que el instrumento mintió

1. **El heredoc de bash se comió los 22 backslashes** al escribir el primer checker: las regex
   llegaron rotas al disco y el error salió como `SyntaxError` en una línea que yo no había
   escrito. Se comprobó: **cero backslashes** sobrevivieron.
2. **Un string entre comillas dobles ejecuta los backticks.** Pasó al escribir la cabecera de
   versión de `STATE.md`: bash resolvió `` `privacy.html` `` como comando y **borró las palabras**.
   La solución que sí funciona es pasar el texto por **stdin de node** con heredoc citado.
3. **Llamar `exports` a una variable rompe el parseo CommonJS**: Node reinterpreta el archivo
   como módulo ES y el error señala la línea del `require`, que está perfectamente bien.
4. **Excluir todo lo precedido por punto mata `window.X`.** Con ese fallo,
   `achievement-glyphs.jsx` y `achievement-masks.js` salían **inertes** estando vivísimos
   (`app/achievements/catalog.js:19` lee `window.ACHIEVEMENT_GLYPHS`). Corregido, los archivos
   inertes pasan a **cero**. Es la mentira cara: iba a reportar dos archivos vivos como muertos.
5. **Quitar tildes no arregla una transliteración**: «pestanias» contra «pestañas» dio una
   deriva falsa.
6. **`node build-standalone.js` a mano reescribe el standalone**, congelado en v0.71.0 por s134.
   El `verify` lo restaura cuando el build lo lanza **él**; lanzándolo a mano, no. Se devolvió
   con `git checkout`. **El paso 3 del cierre invita justo a ese error.**

---

## 5 · Las decisiones del usuario

Las seis se tomaron con **las opciones delante**, y el copy con el texto exacto pintado —el de
hoy contra el propuesto— antes de preguntar.

| Decisión | Qué eligió |
|---|---|
| `privacy.html` | Reescribir ya, sin absolutos |
| La fecha de la política | **Actualizarla** — la propia página promete que cambia con ella |
| `library-transition.js` | Borrar los dos sitios |
| La tabla de deuda | Borrar los números, dejar la historia |
| El `CHANGELOG` | Dejarlo como está: no se descarta texto |
| Los 17 bancos sin indexar | Una tabla en `docs/` con qué mide cada uno |
| Lo siguiente | Las dos preguntas de s176 |

**La pregunta que no estaba prevista** salió al ir a implementar: la página promete «Si esta
política cambia, la fecha de arriba cambiará con ella», así que reescribir su texto sin fechar
incumplía una promesa escrita en la misma página. Se le devolvió en vez de decidirlo yo.

---

## 6 · Qué se entregó

Once hallazgos cerrados, listados en la tabla final del informe. Además:

- **`docs/BANCOS.md`** — los 17 bancos que nadie podía encontrar, con qué pregunta contesta cada
  uno, sacado de sus propias cabeceras. Con una nota de cómo mantenerse honesto: el cruce lo
  hace `auditoria-s178.huerfanos.js`, no una revisión a mano.
- **Dos checkers nuevos**, calibrados en rojo **y en verde** antes de creerles:
  `auditoria-s178.decisiones.js` (acepta otro documento por `argv` para poder mutarlo) y
  `auditoria-s178.huerfanos.js`.

---

## 7 · Lo que esta sesión NO cubre

- **Una decisión cuyo símbolo sigue vivo pero que ya describe mal lo que ese código hace hoy.**
  Un grep no distingue «existe» de «hace lo que dice». Las tres anulaciones de s177 aparecieron
  **midiendo**, y esa clase sigue sin red.
- **Ni un píxel.** Nada visual, ni móvil, ni inglés, ni premium.
- **El criterio de contenido**: si una dosis, un cue o un umbral son *buenos* no se mira.
- **D-1, D-2 y D-3** siguen vivas por decisión del usuario.
- **Un checker de una sola dirección no prueba un índice.** Se corrió el cruce inverso y salió
  limpio, pero destapó que los dos archivos **redactan los títulos distinto**: cualquier
  comparación automática entre ellos tendrá ruido permanente.
