# Auditoría completa · s178 (sobre v0.107.0)

> **Encargo del usuario, textual al cerrar s177**: «empezamos s178 haciendo una auditoría
> completa para saber qué hay que hacer, qué queda pendiente, qué decisiones están obsoletas,
> etc».
>
> Las cinco preguntas vienen de [`HANDOFF_s178.md`](../HANDOFF_s178.md). Cada hallazgo lleva
> evidencia `file:line`. **Lo que no se pudo comprobar se declara**, igual que hace el `verify`.

---

## 0 · Línea base, medida y no citada

| | |
|---|---|
| Versión | **v0.107.0**, árbol limpio, `main` en `14b0faf` |
| `npm run verify` | **PASA** — 0 problemas en 10,7 s, 1 aviso |
| `npm run test:e2e` | **150/150** |
| Artefactos | `PACE.html` 35 KB · `index.html` 1,7 MB · `PACE_standalone.html` 3,3 MB (congelado en v0.71.0, decisión s134) |

### Cómo se hizo

Dos checkers nuevos en `scripts/audit/`, **calibrados en rojo antes de creerles**:

- **`auditoria-s178.decisiones.js`** — cruza las 196 filas de
  `DECISIONES_TECNICAS_VIGENTES.md` contra el código: por cada `code span` comprueba que el
  referente exista todavía. Además cruza el **índice de `STATE.md`** contra el documento que
  gobierna. Acepta otro documento por `argv` para poder mutarlo y ver si muerde.
- **`auditoria-s178.huerfanos.js`** — por cada símbolo publicado a `window` (regla §2), cuenta
  consumidores **fuera de su propio archivo**.

### Las cuatro veces que el instrumento mintió

1. **El heredoc de bash se comió los 22 backslashes** al escribir el primer script: las
   expresiones regulares llegaron rotas al disco y el error salió como `SyntaxError` en una
   línea que yo no había escrito. **Los scripts con regex se escriben con la herramienta de
   escritura, no por shell.** El mismo mecanismo rompió después dos `sed` de una línea.
2. **Llamar `exports` a una variable rompe el parseo CommonJS**: Node reinterpreta el archivo
   como módulo ES y el fallo aparece en la línea del `require`, que está perfectamente bien.
3. **Excluir todo lo precedido por punto mata `window.X`**, que es como consume la mitad de la
   app. Con ese fallo, `achievement-glyphs.jsx` y `achievement-masks.js` salían **inertes**
   estando vivísimos (`app/achievements/catalog.js:19` lee `window.ACHIEVEMENT_GLYPHS`).
   Corregido, los archivos inertes pasan a ser **cero**.
4. **Quitar tildes no arregla una transliteración**: el documento escribe «pestanias» donde el
   índice escribe «pestañas», así que esa fila salió como deriva **siendo falsa**.

### Lo que esta auditoría NO cubre, y hay que saberlo

- **Una decisión cuyo símbolo sigue vivo pero que ya describe mal lo que ese código hace hoy.**
  Un grep no distingue «existe» de «hace lo que dice». Las tres anulaciones de s177 aparecieron
  **midiendo**, no leyendo, y esa clase sigue sin red.
- **La ausencia por diseño es indistinguible de la obsolescencia** para un checker: una fila que
  dice «NUNCA `x`» sale señalada exactamente igual que una que perdió su referente.
- **Ni un píxel.** Nada visual, ni móvil, ni inglés, ni premium.
- **El criterio de contenido**: si una dosis, un cue o un umbral son *buenos* no se mira.

---

## P1 · Qué decisiones están obsoletas o se contradicen

**Cifras**: 196 filas · 1.428 spans, de ellos **715 comprobables** · 20 sin referente vivo ·
15 filas señaladas · **2 hallazgos reales**. El resto son ausencias por diseño.

### 1.1 · `scan-hooks` no existe, y no ha existido nunca

`DECISIONES_TECNICAS_VIGENTES.md:52` (s146) cierra con: «Escáner de la clase entera:
`scan-hooks` (s146), ojo con contar la propiedad `useState:` del destructuring como
declaración». Se lee como una herramienta disponible.

- `package.json:5-9` declara **tres** scripts: `build`, `verify`, `test:e2e`.
- `find` sobre todo el repo: **cero** archivos que casen con `*scan*hook*`.
- Lo que sí existe es el **análisis de ámbito** de `scripts/verify.js:295-362`, que caza
  exactamente esa clase de fallo — su mensaje termina en «Es el crash de s144».
- Y la fila de s150 (`:41`) ya dice que ese análisis **«automatiza la regla de s146»**.

**Qué hacer**: la fila de s146 debe apuntar a `npm run verify`. Tal como está manda a buscar un
comando que no arranca.

### 1.2 · Las dos decisiones de s166 nunca llegaron al índice de `STATE.md`

El cierre de sesión obliga a añadir la fila al documento **y su título al índice de `STATE.md`**.
En s166 se hizo lo primero y no lo segundo:

- `DECISIONES_TECNICAS_VIGENTES.md:93` — «Tiempo de retención: DATO SÍ, RECORD NO»
- `DECISIONES_TECNICAS_VIGENTES.md:94` — «El arte de ejercicio entra por PRECEDENCIA, no por
  sustitución»
- **`s166` aparece 2 veces en todo `STATE.md`**, las dos en la tabla «Red de seguridad»
  (`:132` y `:133`). Ninguna en el índice de decisiones.

Es el fallo por omisión de s169 otra vez: entregado y sin marcar. Quien lea solo el índice
—que es lo que el arranque de sesión pide— **no sabe que estas dos reglas existen**.

### 1.3 · Los negativos honestos (no tocar)

Cinco filas salieron señaladas y **las cinco están bien**. Se dejan escritas para que la
próxima auditoría no las vuelva a levantar:

| Span sin referente | Fila | Por qué es correcto que no exista |
|---|---|---|
| `discrete` | `:80` (s118), `:83` (s115) | Las filas dicen «**sin** `discrete`» y «**prohibido** `discrete`». Cero apariciones = la decisión **se cumple** |
| `extraMinutes` | `:115` (s101) | «La serie propia `extraMinutes` se **DESCARTÓ** por ahora» |
| `onAbort` | `:172` (s80) | «**Si en el futuro** un Step necesita disparar `abandonPath`, añadir `onAbort`» |
| `background-blend-mode` | `:63`, `:71` (s139/s140) | Las dos dicen que **«no resolvió nada»**. Se probó y se quitó |
| `useOverlayManager`, `useGlobalKeyboard` | `:178` (s82) | «**Hasta entonces es premature abstraction**» |

---

## P2 · Qué queda realmente pendiente de las 15 fases

**Tres marcadores del ROADMAP están desactualizados, y los tres hacia el mismo lado: pintan
más trabajo pendiente del que hay.**

### 2.1 · La FASE 3 está cerrada y el ROADMAP la da por en curso

`ROADMAP.md:288` — «FASE 3 · Eventos, fase 1 web (`pace.events.v1`) — **🔄 EN CURSO (s155,
v0.88.0)**», y su cuerpo dice «**Queda la Fase 2 del esquema**: los cuatro emisores».

Los emisores existen:

- `app/state-events.jsx:69` — `function paceEmitirEvento(evento, alRechazar)`
- `app/state-events.jsx:156` y `:173` — sus llamadas
- `tests/eventos-emisor.spec.js`, más `eventos-backup`, `eventos-barrera`, `eventos-retencion`
- `STATE.md` lo da por **«CERRADA en s172»**

Entre lo que el plan dice y lo que hay van **de v0.88.0 a v0.107.0**.

### 2.2 · «Ola B, los 20 dibujos» son 3

`ROADMAP.md:203` — «**Sigue pendiente: ola B**, los 20 dibujos — EN PAUSA hasta que llegue el
arte». La verdad la dice el documento **generado**:

- `docs/product/GLIFOS_EJERCICIOS_PENDIENTES.md` — identidades **62** · con arte **59** ·
  **pendientes 3**
- `npm run verify` lo confirma vivo: «59 máscaras de ejercicio: toda fila del mapa tiene su
  archivo»

### 2.3 · «58 de 96 con arte / 38 sin dibujo» son 77 y 19

La nota de cierre de la FASE 2.5 (`ROADMAP.md:277-279`) lleva las cifras de s147:

| | ROADMAP | Real (medido) |
|---|---|---|
| Logros con arte propio | 58 de 96 | **77 de 96** |
| Sin dibujo | 38 | **19** |

Medido cruzando `app/glyphs/achievement-masks.js` con `app/achievements/catalog.js`, y
confirmado por el `verify` («máscaras de logro en el mapa: 77»). **Los 19 son exactamente los
que el handoff ya nombra**, así que aquí el handoff está al día y el ROADMAP no.

Los 19 sin dibujo: `streak.7` `streak.14` `breathe.sessions.50` `stats.month.focus`
`explore.box` `explore.rounds` `explore.kapalabhati` `explore.shoulders` `explore.all.extra`
`master.box.15` `master.shoulders.20` `master.pomodoro.8` `secret.cow.click` `secret.rain`
`secret.first.monday` `secret.new.year` `secret.zen` `season.summer` `season.equinox.autumn`.

### 2.4 · La FASE 5 va por la mitad y no tiene marcador

`ROADMAP.md:326` no lleva ni `HECHA` ni `EN CURSO`, y sin embargo **la voz entró en s175** y la
**música en s177**. Es la única fase con trabajo publicado y sin estado. Con las 2.1-2.3 arriba,
el patrón es claro: **el ROADMAP se lee al planificar y no se actualiza al entregar.**

### 2.6 · `STATE.md` daba por no programada una retención que corre desde s174

Apareció al ir a corregir el marcador de la Fase 3, no buscándola. La sección «Diferido» de
`STATE.md` decía que la **retención por calendario** «sigue sin programar». Está programada:

- `app/events/events-store.js:370` — `listo.then(function () { return paceEventsPrune(); })`,
  una vez por arranque, después de que la inicialización confirme.
- `tests/eventos-retencion.spec.js` — su spec, con los 4 asertos calibrados en rojo.
- Y el propio `verify` lo declara en voz alta entre lo que NO cubre: «la retencion por
  CALENDARIO (120 d, §12) **YA ESTA PROGRAMADA** (s174)».

Tres fuentes decían que sí y el documento de estado decía que no. **Es el mismo patrón que
2.1-2.4**: lo entregado no vuelve al papel.

### 2.5 · Negativo honesto: la anulación de la voz sí se propagó

La regla «voz/TTS: NUNCA» estaba escrita **dos veces en `ROADMAP.md`** y era candidata obvia a
contradicción. **Está corregida** en `:76`, `:331-333` y `:430`. Aquí no hay deriva.

---

## P3 · Qué hay implementado que nadie sabe que existe

### 3.1 · `library-transition.js` NO está inerte: se ejecuta en cada sesión

El handoff lo describe como «inerte desde s174 (130 líneas)» y sugiere que borrarlo es decisión
del usuario. **La palabra «inerte» esconde que hay una llamada viva**:

- `app/main.jsx:153-154` — `const vuelo = (typeof paceVueloCapitular === 'function') ?
  paceVueloCapitular(p.routine && p.routine.id) : null;`
- `app/main.jsx:157` — `if (vuelo) vuelo.aterrizar();`
- `app/ui/library-transition.js:77` — se **clona el nodo** del arte (`arte.cloneNode(true)`)
- `app/ui/library-transition.js:103-107` — `aterrizar()` busca destino y **reintenta por
  `requestAnimationFrame` hasta `PACE_VUELO_FRAMES`**, que vale **24** (`:33`, «~400 ms
  buscando el destino, y se rinde»)

Y el destino ya no lo emite nadie. `[data-pace-session-prep-art]` aparece **tres veces** en el
árbol y ninguna es un nodo:

- `app/ui/library-transition.js:44` — la consulta
- `app/ui/SessionPrep.jsx:37` — un comentario que lo avisa: «era el **ÚNICO** destino del vuelo
  de la capitular, que a partir de aquí no encuentra dónde aterrizar y se retira solo»

**Consecuencia real**: en cada entrada a sesión sin `reduced-motion` se clona un nodo y se
gastan ~400 ms de `requestAnimationFrame` para nada. No hay fuga de DOM —el `appendChild` de
`:110` sólo corre **después** de encontrar destino— pero tampoco es código muerto que se pueda
borrar sin tocar `main.jsx`. **Borrarlo son dos sitios, no uno.**

> Esto es también un aviso sobre el propio método: el primer cruce que hice
> —`<script>` de `PACE.html` contra archivos de `app/`— dio **122 = 122, cero huérfanos**, y no
> vio nada. Un censo de carga no puede ver un módulo que se carga, se llama y no hace nada.

### 3.2 · Ningún archivo de `app/` está sin cargar, y ninguno es totalmente huérfano

428 símbolos publicados a `window`. Tras corregir el fallo de `window.X`: **0 archivos
inertes**. Quedan 80 símbolos sin consumidor externo, pero **son convención de la regla §2**
(el subsistema de eventos publica piezas que usa dentro de su propio archivo), no código
muerto. **19 símbolos los tocan sólo los tests** — vivos para la suite, invisibles para la app;
lo esperable en `app/events/` y `app/ui/Sound.voz.jsx`.

### 3.3 · 17 bancos de `scripts/audit/` sin una sola mención en la documentación

De **55** scripts en `scripts/audit/`, **19 no aparecen en ningún `.md`** (dos son los de esta
auditoría, así que **17 son previos):

```
banco-aire-tarjetas-logro.js   banco-home-orden.js        banco-respira-capturas.js
banco-respira-movil.js         glifos-56px.js             glifos-aro.js
glifos-definicion.js           glifos-hoja50.js           glifos-logros.js
glifos-mascara.js              glifos-recorte.js          hoja-sellos-nuevos-en-app.js
maqueta-s175.pagina.js         maqueta-s175.piezas.js     maqueta-s176.audio.js
maqueta-s176.medir.js          maqueta-s176.pagina.js
```

### 3.4 · Negativo honesto: los `_*.html` de la raíz no son un hallazgo

Hay **13 archivos generados** en la raíz (≈14,8 MB, el mayor `_revision-librerias-v14.html` con
5,1 MB). **Están en `.gitignore:16` y `:19-20` y ninguno está trackeado** — salida de los bancos, por
diseño. Es limpieza de disco local, no deuda del repo.

---

## P4 · Qué promesas públicas siguen siendo ciertas

### 4.1 · `privacy.html` se ha tocado UNA vez en toda la vida del proyecto

```
git log -- privacy.html
5317563  feat(stats): live stats + safety/privacy pages (v0.46.0)
```

No pasó por **s151** (cuando se prohibieron los absolutos), ni por **s155** (cuando nació la
segunda clave de almacenamiento), ni por **s175/s177** (voz y música). Y lleva dentro
exactamente el claim que s151 declaró prohibido:

- **`privacy.html:75`** — «**Sin servidores propios.** No existe una base de datos de PACE donde
  consultar nada tuyo: no podríamos ver tus datos aunque quisiéramos.»
- **`privacy.html:88`** — «El borrado es inmediato y definitivo: **no existe copia en ningún
  servidor**.»

La regla de s151 (`DECISIONES_TECNICAS_VIGENTES.md:40`) dice: no usar absolutos —«siempre»,
«sin paywall», «**no hay servidor**», «únicamente»— y da el criterio para distinguir:
**«un claim acotado a una función concreta sobrevive; un claim sobre el producto entero, no»**.
Los dos de arriba son sobre el producto entero, y s151 nombró el detonante: **«dejan de ser
ciertos en cuanto exista el Worker de licencia»**, que es la Fase 10.

s151 corrigió el onboarding y la superficie de apoyo. **La página legal, que es la que un
usuario citaría, se quedó fuera del barrido.**

### 4.2 · Negativos honestos

- **Cero peticiones externas.** En el `index.html` publicado, las únicas URLs son espacios de
  nombres XML/SVG, el enlace a `buymeacoffee.com` (saliente, lo pulsa el usuario) y una cadena
  interna de React. **Ni un `fetch` a terceros.** La decisión s101 se cumple.
- **El texto de almacenamiento aguanta las tres claves.** `privacy.html:67-68` habla del
  «almacenamiento local de tu navegador» sin enumerar claves, así que `pace.events.v1`,
  `pace.events.writer.v1` y `pace.state.v2` caben sin contradicción.
- **Los dos README los vigila el `verify`** (`scripts/verify.js:382-385`), y las dos promesas de
  `privacy.html` sobre exportar y borrar **tienen gate** en `scripts/verify.eventos.js:105-159`.
  Lo que falla es lo que **no** tiene checker: el copy de la propia página.

---

## P5 · Qué deuda de la tabla sigue viva

### 5.1 · La tabla de `Deuda tecnica activa` miente ahora en 10 de 14 filas

s162 la cazó mintiendo en cinco. **Ha empeorado.** Medido con `wc -l`:

| Archivo | Dice la tabla | Real |
|---|---|---|
| `app/tweaks/TweaksPanel.jsx` | 493 | **410** |
| `app/extra/ExtraModule.jsx` | 462 | **448** |
| `app/breathe/BreatheSession.jsx` | 493 | **495** |
| `app/ui/SessionShell.jsx` | 451 | **417** |
| `app/focus/FocusTimer.jsx` | 450 | **499** |
| `app/state-core.jsx` | 402 | **477** |
| `app/tokens.css` | 386 | **322** |
| `app/i18n/strings/sessions.js` | 353 | **367** |
| `app/i18n/strings/ui.js` | 395 | **429** |
| `app/main.jsx` | 380 | **412** |
| `app/state-achievements.jsx` | 397 | **448** |

Cuadran tres: `MoveSessionV1.jsx` (500), `exercise-glyphs.extra.jsx` (406) y `BreatheVisual.jsx`
(421).

**Pero la deuda de tamaño en sí NO está viva**: el trinquete funciona. El `verify` mide 227
archivos, **ninguno pasa de 500**, `DEUDA_500` está vacía, y el mayor es `FocusTimer.jsx`, que
el propio verify reporta **en el tope exacto de 500**. Lo que está podrido es **la tabla**, no
el código — y su cabecera ya avisa de que no es la fuente de verdad. **La propuesta es
borrar sus números, no actualizarlos**: mantener a mano una copia de lo que el `verify` mide en
cada pasada es justo el mecanismo que ha fallado tres veces (s148, s162, hoy).

### 5.2 · Las deudas semánticas D-1, D-2 y D-3 siguen vivas

- **D-1** · `app/i18n/content/breathe.js:6` lo dice en su propio comentario: «preserva el
  override silencioso de 3 keys `breathe.phase.*` (D-1)».
- **D-2** · duplicidad literal, cuatro líneas en un mismo archivo:
  `app/i18n/strings/paths.js:64` y `:73` («Hecho hoy»), `:125` y `:134` («Done today»).
- **D-3** · namespaces mezclados: **17** claves `path.*` y **27** claves `paths.*` conviviendo.

### 5.3 · `sw.js` cachea sin mirar el método, en DOS sitios y no en uno

El handoff nombra `sw.js:338`. Son dos:

- `sw.js:320` y `sw.js:338` — `caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));`
- En todo `sw.js` no hay **ni una** aparición de `method`, `'GET'` ni `HEAD`.
- Y ninguna de las dos cadenas lleva `.catch()`, así que la Cache API rechazando un `HEAD`
  produce una **rejection no capturada**, no un fallo silencioso.

---

## Lo que propongo hacer, y en qué orden

**Nada de esto es urgente ni cambia comportamiento visible.** Van de más barato y más peligroso
a menos:

1. **Los tres marcadores del ROADMAP** (2.1-2.4). Es el hallazgo que más caro sale si nadie lo
   toca: cualquiera que planifique la próxima fase leyendo el ROADMAP cree que quedan 20 dibujos
   y 38 logros sin arte, y que los emisores de eventos están sin escribir.
2. **Las dos filas de s166 al índice de `STATE.md`** (1.2) y **la fila de `scan-hooks`** (1.1).
3. **`privacy.html`** (4.1) — es la única con superficie pública. Redactar como s151:
   sin absolutos, de forma que siga siendo verdad con la licencia puesta.
4. **Vaciar los números de la tabla de deuda** (5.1) y dejar que hable el `verify`.
5. **El guard de método en `sw.js`** (5.3) — una línea, dos sitios.
6. **Decidir sobre `library-transition.js`** (3.1) con el dato correcto delante: son dos sitios,
   no un archivo suelto.

**Lo que NO propongo tocar**: D-1, D-2 y D-3 siguen siendo lo que eran —semánticas, no
urgentes—, y renombrar claves i18n tiene el precedente de s108/s141 (una clave es la key del
glifo). Y los 17 bancos sin indexar (3.3) sólo merecen una tabla si se van a volver a usar.

---

## Qué se arregló en la misma sesión

Decisiones del usuario, tomadas con las opciones delante. **`npm run verify` PASA** y
**`npm run test:e2e` da 150/150** sobre el `index.html` regenerado.

| Hallazgo | Qué se hizo |
|---|---|
| 2.1 · Fase 3 | Marcador corregido y bloque puesto al día: emisores en v0.102.0, retención en s174, y lo que queda de verdad es la Fase 3 del esquema |
| 2.2 · ola B | «20 dibujos» → **3**, remitiendo al documento generado |
| 2.3 · arte de logros | «58 de 96 / 38 sin dibujo» → **77 de 96 / 19**, remitiendo al `verify` |
| 2.4 · Fase 5 | Marcador nuevo: «🔄 EN CURSO (voz s175 · música s177)» |
| 2.6 · retención | Corregida la línea de `STATE.md` que la daba por no programada |
| 1.1 · `scan-hooks` | La fila apunta ya a `npm run verify` y dice que el escáner citado nunca existió |
| 1.2 · s166 | Sus dos decisiones entran en el índice de `STATE.md` |
| 4.1 · privacidad | Los dos absolutos reescritos en ES y EN con el criterio de s151, **y la fecha actualizada** — la página promete que cambia con ella |
| 5.1 · tabla de deuda | Retirada la columna de líneas; queda la historia y se remite al trinquete del `verify` |
| 5.3 · `sw.js` | Guard de método al entrar al `fetch`, que cubre los dos `cache.put`. **Sin `.catch()` mudo a propósito**: enterrar el error deja el fallo indistinguible de que no lo haya |
| 3.1 · el vuelo | `library-transition.js` borrado, y con él su `<script>` y la llamada de `main.jsx`. Los tests se quedan: vigilan el resultado, no la implementación |

**No se tocó**, por decisión del usuario: el `CHANGELOG` con sus seis bloques de detalle; y las
deudas semánticas D-1, D-2 y D-3, que siguen siendo semánticas y no urgentes.

### Dos trampas más, cobradas al arreglar

- **`node build-standalone.js` a mano reescribe el standalone**, que por s134 vive congelado en
  v0.71.0. El `verify` lo restaura cuando el build lo lanza **él**; lanzándolo a mano, no —
  hubo que devolverlo con `git checkout`. El paso 3 del cierre invita justo a ese error.
- **Un checker de una sola dirección no prueba el índice.** El cruce documento → índice dio 3
  huecos; el cruce inverso índice → documento hacía falta para saber que no faltaba nada al
  otro lado, y salió limpio. Lo que sí destapó: **los dos archivos redactan los títulos
  distinto**, así que cualquier comparación automática entre ellos tendrá ruido permanente.
