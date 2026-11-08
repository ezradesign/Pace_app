# Caza de lo nuevo · 8 nov. 2026

Rama `claude/caza-nuevo-8nov-0c7d9b`, cortada de `main` local en la 0.194.0 (9ed68749), probando el `index.html`
compilado. Alguien llega a PACE de cero el lunes 9 de noviembre y lo usa su primera semana, con clics de verdad y
el reloj de la página (`page.clock`). El centro es lo que no es «A tu ritmo» ni la jornada: la bienvenida y los
Ajustes, Respira (con la apnea y su aviso), Mueve, Estira, Hidrátate, «Tus rutinas» y el runner, logros,
Estadísticas y «Qué te ayuda», copiar e importar, el sonido y la voz, el oscuro y el idioma.

El banco, en `docs/traspaso/archivos/caza-nuevo-8nov/`: `semana.js` (los días, uno a uno o todos) y `pagina-ez.js`
con su plantilla. Se corre desde la raíz con el servidor ya arrancado:
`PORT=8891 node .claude/static-server.js` y
`PACE_E2E_PORT=8891 RECORRIDO_FOTOS=<carpeta> node docs/traspaso/archivos/caza-nuevo-8nov/semana.js movil es [1,2,3]`.
Usa `../recorrido-6nov/lib.js` para medir (scroll, cortes, solapes, lo que queda en español).

## Las dos personas

- **movil es** (360×800): lunes, la bienvenida entera y la visita; Ajustes y el oscuro; Respira: «Rondas express»
  (la apnea) con su aviso, soltando cada retención a los 30 s, y 4·7·8 entera; tres vasos. Martes: «Levántate y
  sube» (Mueve) y «Cuello suave» (Estira) enteras, y las cinco pestañas de Estadísticas. Miércoles: «Tus
  rutinas», una rutina de tres ejercicios, guardarla, encontrarla y hacerla entera. Jueves: Ajustes a inglés y
  vuelta. Viernes: exportar la copia, «Borrar todos mis datos», la bienvenida otra vez e importar la copia.
  Domingo: logros y Estadísticas.
- **escritorio en** (1280×800): lo mismo en inglés, y el jueves a castellano y vuelta.

## Dónde me quedo (8 nov.)

Las dos personas, enteras; un fallo de código arreglado con su prueba; dos casos de producto en la página de Ez:
https://claude.ai/artifact/6qpSUbY5Kfoa1cmsrdyffo (`docs/audits/caza-nuevo-8nov/pagina-ez.html`, 89 KB, con las
fotos dentro). Paré aquí por el uso de la semana (83 %, con el corte en el 88 %). **No llegué a mirar:** el sonido y
la voz oyéndolos (en el banco solo se ve que no hay errores con el sonido encendido, que es lo de fábrica), la
música de fondo, ni las cinco pestañas a 1280 en oscuro una a una (las medidas no dieron nada). `verify` y la zona
(`copia-con-logro`, `eventos-backup`, `importar-borrar`, `privacidad-datos`, `tus-rutinas*`, `logros-*`) con un
worker en el 8891: ver el commit.

## Arreglado

### N1 · La copia de tus datos sale sin «Cuaderno a salvo», y al traerla se pierde · molesta (código) · ARREGLADO

- **Pasos** (`semana.js`, viernes): Ajustes › Tus datos › «Exportar una copia» (gana «Cuaderno a salvo»),
  «Borrar todos mis datos», la bienvenida otra vez, e importar esa copia.
- **Qué pasaba:** la copia traía 9 logros y PACE tenía 10. Al traerla, «Cuaderno a salvo» desaparece. Lo mismo a
  quien estrena móvil con su copia.
- **Por qué:** `exportJSON` (`app/tweaks/TweaksData.jsx`) arma la copia con el estado de ese momento y da el logro
  cuando la copia ya salió (para no darlo si se cancela el menú de compartir en las apps).
- **Arreglo:** la copia se arma con `paceConLogroDeLaCopia(getState())`, que le pone el logro dentro. Si la copia no
  sale, no hay archivo que lo lleve. Fila arriba del todo en `DECISIONES_TECNICAS_VIGENTES.md`.
  `tests/copia-con-logro.spec.js`: lee el archivo descargado y lo trae a un PACE sin el logro. Con el arreglo
  quitado del `index.html` cae en «la copia sale sin el logro que gana».

## Para Ez (en la página)

### N2 · En el móvil, la rutina recién creada no se ve donde la buscas · molesta (producto)

- **Pasos:** PACE vacío, panel › «Tus rutinas» (abre el constructor), tres ejercicios, «Guardar».
- **Qué pasa:** al guardar vuelves al inicio. Otra vez panel › «Tus rutinas»: con una rutina ya abre la
  biblioteca de Mueve (`main.eventos.jsx`, `kind === 'custom'`), y a 360 las rutinas propias no están en esa vista:
  hace falta un segundo toque en «Tus rutinas ›». A 1280 se ven en la columna de la izquierda.
- **Letras:** A «Tus rutinas» abre tus rutinas (en el móvil, la vista del segundo toque) y al guardar se abre esa
  lista con la nueva dentro (recomendada); B un aviso corto al guardar; C como ahora.

### N3 · Traer una copia pide pasar antes la bienvenida entera · pulido (producto)

- Quien estrena móvil (o borró sus datos) pasa la bienvenida, «¿Cómo es tu semana?», PACE completo y la visita, y
  luego Ajustes › Tus datos › Importar; lo traído sustituye lo contestado.
- **Letras:** A un enlace «¿Tienes una copia? Tráela» bajo «Comenzar» que abre el aviso de importar de siempre
  (recomendada, no urgente); B como ahora.

## Visto y apuntado, sin arreglar

- **Ruido de consola en inglés, solo en `localhost`:** al hacer «Levántate y sube» en inglés salen 153 avisos
  `[i18n] missing key: extra.chair.squats.sN.instruction.setup`, y con una rutina propia 592 de
  `custom.<id>.sN.instruction.*`. En la app no se ve nada (el texto sale bien, por el respaldo), y `_i18nIsDev`
  los calla fuera de `localhost`. Pero tapan los errores de verdad en cualquier banco o prueba en inglés. Viene de
  `v1Instr` (`app/move/MoveSessionV1.support.jsx`), que pide la clave por posición también para los pasos sin ese
  campo y para las rutinas propias, cuyo texto ya va en el idioma de la app (`_moveFichaPaso`). Arreglo propuesto:
  en una rutina `custom.`, devolver `st.instruction[key]` sin buscar clave. Sin hacer por el uso.
- La retención de la apnea no tiene tope y espera a que pulses «Respirar de nuevo»: es la decisión B1 (sin
  cronómetro ni récord), no un fallo.

## No son fallos

- El solape «Foco manual» / «25:00» que mide el banco en la home es la caja de línea del número grande, no la tinta.
- «Tu» (martes) en la barra de la semana en inglés y «Español» en la lista de idiomas: no son textos sin traducir.
- Los recortes de «CO₂ Tolerance» y del selector de ejercicios son tarjetas más abajo, dentro de su scroll.
- «Tus rutinas» vacía abre el constructor: es a propósito («llevar a una lista vacía sería peor»).

## Lo que salió bien

- La bienvenida, la visita y la home, sin scroll ni cortes, en los dos tamaños y los dos idiomas.
- El aviso de la apnea no deja empezar sin marcar «Lo he leído» (el botón está apagado) y da «secret.safety.read».
- Respira (apnea y 4·7·8), Mueve, Estira y una rutina propia llegan a su cierre, cuentan sus minutos y dan su
  primer logro; la racha va 1, 2 y vuelve a 0 tras dos días sin nada.
- El oscuro se guarda y vuelve tras la copia; el idioma cambia `lang` del documento y el título, y vuelve igual.
- Copiar, borrar todo e importar deja el estado igual al de antes (salvo N1, arreglado).
- «Qué te ayuda» dice «Todavía es pronto» la primera semana; Hoy, Semana, Mes y Año se pintan sin cortes.
- Ningún error de la app en la consola (solo el aviso del service worker que bloquea Playwright y el ruido de
  arriba).
