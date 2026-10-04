# s198 · Saneamiento: que no se pierda nada y que el teclado no mienta (v0.131.0 y v0.132.0)

**Fecha:** 2026-10-04 · **Versiones publicadas:** v0.131.0 y v0.132.0 · **Suite:** 300 → **316**

> Encargo del usuario: «revisa la repo, audita, revisa el código, plantea novedades e implementaciones,
> mejoremos y sigamos desarrollando la app, tómate tu tiempo». Sigue a
> [session-197b](./session-197b-la-tableta-vertical.md). Nada decidido estaba pendiente; el único frente abierto
> en el ROADMAP sin material del usuario era la **Fase 8.5 (saneamiento)**, y la auditoría lo confirmó con
> defectos medidos.

---

## 1 · Cómo se auditó

Arranque según `CLAUDE.md`: v0.130.0 coherente en los 7 sitios, árbol limpio, `verify` en verde (0 problemas,
`index.html` = build de las fuentes) y E2E **300/300 en 6,8 min** como línea base.

Después, **una sonda con Playwright sobre el artefacto publicado** (servidor propio en otro puerto, para no
pisar la suite) que reprodujo cada sospecha antes de tocar nada. Lo que salió de leer el código y lo que
confirmó la sonda:

| # | Defecto | Medido en v0.130.0 |
|---|---|---|
| 1 | Un campo con otra forma en `pace.state.v2` (`weeklyStats: null`) hace que `loadState` caiga al estado de fábrica, y **la primera escritura pisa la historia** | 4321 min → 0, logros → 0, días → 0; vuelve el onboarding; ninguna copia |
| 2 | El import escribe el backup sin mirarlo (A-7) | un backup con `weeklyStats: null` → la app de fábrica al recargar |
| 3 | «Borrar todos mis datos» deja `pace.timer.v1`, `pace.breathe.v1` y `pace.darkDays.v1` | `privacy.html`: «lo que borras desaparece de tu dispositivo» |
| 4 | Tras «Continúa» en la barra lateral, **Espacio no pausa**: pulsa el botón escondido detrás | el contador sigue, con «ESPACIO PAUSAR» en pantalla |
| 5 | Con «Antes de empezar» encima de la biblioteca, **Escape cierra la de DETRÁS** | queda la vista previa sola |
| 6 | Los modales no son diálogos | sin rol, foco en `<body>`, **25 de 30 Tab** salen al fondo |
| 7 | Atajos fuera de sitio | **Ctrl+S** abre Estadísticas; una «s» en mitad de una respiración, también |
| 8 | La pantalla se apaga a mitad de una sesión en el móvil | ninguna sesión pedía Screen Wake Lock |

Y uno que no se arregla hoy porque **es diseño**: **no hay ningún límite de error de React**. Provocado de
verdad (logros a `null` en caliente y abrir Logros): la app entera se desmonta y queda el papel en blanco.
Va a la página de decisiones.

## 2 · Lo que se hizo

- **`app/state-core.sanea.js`** (nuevo, puro): `paceSanearEstado` repara la FORMA campo a campo contra
  `defaultState` antes de migrar; `paceGuardarRescate` copia la cadena cruda a `pace.state.v2.rescate` si aun
  así revienta; el export la lleva. El import usa el mismo saneador.
- **`wipeLocalState`** barre toda clave `pace.*` que no sea de eventos.
- **`app/ui/Dialogo.jsx`** (nuevo): `usePaceDialogo` — pila para Escape y Tab, foco al contenedor, trampa de
  Tab, foco devuelto si nadie lo ha cogido. Lo usan `Modal`, el onboarding y `SessionShell`.
- **`SessionShell`**: es `role=dialog` con el nombre de la rutina, toma el foco y lo atrapa (su Escape sigue
  siendo suyo); `sessionKeyOnControl` solo cuenta controles que se ven.
- **`app/ui/pantalla.js`** (nuevo): Screen Wake Lock con contador mientras haya un `SessionShell`; el Foco no.
- **`main.jsx`**: los atajos T·S·L sin modificadores, sin campos editables y nunca con una sesión o pantalla
  completa delante. **Ajustes** se cierra con Escape (panel flotante, no modal: sin trampa).
- **`state-core.jsx` pasó de 500** al añadir el saneado y el trinquete de §1 lo paró: se cortó **por un punto**
  el buzón de avisos a `state-core.toast.jsx` (465 + 57). No se recortaron comentarios.

**Ni un píxel cambia.** El contenedor de un diálogo lleva `outline: none` porque el foco programático no es
una selección del usuario.

## 3 · La red

- `tests/estado-saneado.spec.js` (5): el campo roto, el saneador en puro (series, agua, racha, Caminos,
  historia, números, claves ajenas, estado sano intacto), el rescate y su viaje en el backup, el import
  saneado, el borrado total.
- `tests/teclado-foco.spec.js` (7): Escape del de arriba, el diálogo con nombre/foco/Tab/foco devuelto,
  Ctrl+S y la S en sesión (con control positivo: la S a secas sigue abriendo), «Continúa» + Tab + Espacio,
  Escape en Ajustes, la pantalla encendida (con la API sustituida por una falsa que cuenta), el onboarding.
- **Pasada de control contra el `index.html` de HEAD: los 11 primeros, en rojo**, cada uno por la razón que
  dice su mensaje (se comprobó línea a línea, no solo el recuento). El duodécimo (el saneador en puro) llamaría
  a una función que en HEAD no existe.
- `scripts/audit/banco-saneamiento-s198.js` (con `PACE_BANCO_SOLO=<regex>` para repetir uno): **26 de 26
  muerden** en la pasada final, más uno DECLARADO que vive con razón (`sessionKeyOnControl` es defensa en
  profundidad: con la trampa de Tab no hay forma de dejar el foco detrás). La primera pasada dio **24 de 26**:
  - **El import sin sanear vivía** porque el arranque también sanea, y el test solo miraba el resultado tras
    recargar. Se mata leyendo lo GUARDADO en los 900 ms entre «Importado — recargando…» y la recarga. No
    sobraba código: sobraba confianza en el final.
  - **«La sesión no toma el foco» salió vivo UNA vez** y no lo reproduzco: aislado muerde 4 de 4 y en la pasada
    final también. Queda anotado como observación, no como explicación.

## 4 · Lo que aprendí

- **Un `catch` que devuelve «de fábrica» es un borrado diferido.** No falla nada al arrancar: falla en la
  primera escritura, que ya no es culpa de nadie. La defensa no es un `catch` más fino sino **reparar por
  campos antes** y **guardar lo crudo** en el único momento en que todavía existe.
- **Una sesión a pantalla completa no es un diálogo hasta que se le dice.** Se veía encima de todo, pero el foco
  y el teclado seguían en la home: dos verdades distintas para el ojo y para la tecla. «ESPACIO PAUSAR»
  escrito en pantalla era mentira para quien empezaba desde la barra lateral.
- **El orden de los listeners no es una política.** Doce `Modal` escuchando Escape cada uno «funcionaba» con
  uno abierto; con dos, cerraba el que se registró primero. La regla «el de arriba» tiene que existir como
  dato (una pila), no como orden de llegada.
- **Una red que nace en la misma sesión que su arreglo se calibra contra el artefacto anterior**, y no basta
  con que caiga: hay que leer POR QUÉ cae. Un test de foco que cae por un selector que no existe en HEAD no
  vigila el foco.

## 5 · Lo que quedó para decidir mirando (contestado en la parte 6: A2 · B2 · C1 · D1)

[`docs/proposals/saneamiento-s198.html`](../proposals/saneamiento-s198.html) (generada por
`scripts/audit/saneamiento-s198.js`, fotos de la app real con el DOM retocado):

- **A** · qué se ve si una parte falla: A1 una pantalla para todo · A2 se cierra solo esa parte (recomendada).
- **B** · si el arranque repara o rescata: B1 silencio · B2 una fila en «Tus datos» (recomendada) · B3 un aviso.
- **C** · la pantalla encendida: C1 sin interruptor (recomendada, como queda) · C2 con interruptor.
- **D** · el frente siguiente: D1 la red de A y B (recomendada) · D2 la pausa te llama por su nombre + `.ics` ·
  D3 Estadísticas «Hoy» · D4 Android.

---

## 6 · Segunda parte: las letras, y v0.132.0 el mismo día

Al enseñar la página, el usuario pidió «hazme preguntas». Se le hicieron las cuatro con las opciones de la
página y una vista previa de cada forma, y contestó lo recomendado en las cuatro: **A2 · B2 · C1 · D1**. D1 era
«implementar A y B», así que se siguió sin cambiar de sesión.

- **`app/ui/RedDeError.jsx`** (`PaceRed`, una clase: React solo da límites de error con
  `getDerivedStateFromError`): cada diálogo y cada sesión lleva su red (`red()` en `main.jsx`), que pinta su
  propio aviso de 560 px; la app entera lleva la global (en el montaje de `PACE.html` y en el arranque directo de
  `main.jsx`); lo invisible cae en silencio.
- **Lo que la maqueta no sabía.** Para la prueba de la pantalla global usé `water: null`, que en v0.131.0
  tumbaba la home… y en v0.132.0 salió **un aviso de Hidrátate que nadie había abierto**: `HydrateTracker` lee
  `state.water` ANTES de mirar si está abierto, y su red lo atrapaba. Regla nueva: una superficie **cerrada**
  que falla calla, y al abrirla `abierto` cambia, la red se reinicia y se vuelve a intentar. La pantalla global se
  prueba con `plan: null`, que sí lee la propia home.
- **La foto antes que el aserto**: la primera captura de lo implementado tenía 55 px de más entre el rótulo y el
  título (el margen de la cabecera del `Modal` más el padding del aviso). Se quitó comparando con la maqueta.
- **B2**: la fila «Descargar la copia de rescate · 4 oct.» en «Tus datos». La exportación sale a
  `paceDescargarCopia()`, porque la pantalla global la necesita justo cuando el árbol de React se ha caído.
- **C1** queda escrita en `DECISIONES_TECNICAS_VIGENTES.md`. De paso, la tabla de capas (z-index) de
  `DESIGN_SYSTEM.md`, que era un TODO, se midió y se escribió.

**Red**: `tests/red-de-error.spec.js` (4), **los 4 en rojo contra v0.131.0**; el banco suma 7 mutantes (los 7
muerden) y destapó que uno de los de la primera parte **había dejado de aplicar** porque la extracción de la
exportación cambió la sangría de su línea: un banco que dice «NO APLICA» también es una medida. Corregido,
la pasada final del banco entero da **33 de 33** (más el declarado).
