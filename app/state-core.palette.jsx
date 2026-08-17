/* PACE - Foco - Cuerpo
   Copyright (c) 2026 ezradesign
   Licensed under the Elastic License 2.0 - see LICENSE

   state-core.palette.jsx - COMO LA PALETA LLEGA AL DOM, y como se funde.
   Extraido de state-core.jsx en s163 al rebasar este las 500 lineas de la regla
   nº 1 de CLAUDE.md: lo que salio no es el store, es el mecanismo del cruce de
   paleta que nacio en s161 y que se explica solo.

   QUE VIVE AQUI: los tres pasos de aplicar un tema -- poner `data-palette` y
   `data-font` en <html>, armar el guard del primer arranque
   (`data-pace-palette-ready`) y marcar la ventana del cruce
   (`data-pace-palette-crossing`) --. Las REGLAS que consumen esos tres atributos
   viven en `app/tokens.css`; aqui solo se ponen y se quitan.

   EL ESTADO ENTRA POR PARAMETRO, y no es cosmetico. Este archivo carga ANTES de
   `state-core.jsx` porque `applyTheme()` se llama en el CUERPO de aquel (no al
   montar), asi que cuando esto se evalua todavia no existe ni `_state` ni
   `getState`: leerlos aqui seria el crash de s144 por la puerta de al lado -- un
   nombre que en dev resuelve por el ambito global de Babel y que dentro de la
   IIFE del build queda sin ligar. Con el estado como argumento, este modulo no
   sabe que exista un store.

   ORDEN DE CARGA, no negociable: `state-core.palette.jsx` -> `state-core.jsx`.
   Al reves, la llamada del cuerpo de state-core no encontraria `applyTheme`. */

/* s161 · el primer papel entra SECO. `tokens.css` declara el fundido de 640 ms
   entre paletas sobre `:root[data-pace-palette-ready]`, y este es quien pone
   ese atributo: despues de la PRIMERA aplicacion, nunca antes. Sin el, quien
   tenga el sistema en oscuro veria en cada carga un fundido desde la paleta
   clara — `:root` pinta crema, este modulo evalua y pone data-palette="oscuro",
   y con la transicion ya viva eso es un cruce de 640 ms en cada arranque.
   Se marca en el frame SIGUIENTE (no en el mismo) para que el estilo inicial
   llegue a computarse: puesto en la misma tarea, el navegador puede resolver
   las dos cosas juntas y el guard no guardaria nada. */
let _paletteReady = false;
function _marcarPaletaLista() {
  if (_paletteReady) return;
  _paletteReady = true;
  const root = document.documentElement;
  /* FORZAR EL RECALCULO ANTES DE ARMAR LA TRANSICION. Esta linea parece inutil y
     es justo la que hace el guard fiable: sin ella, el guard dependia de que el
     navegador hubiera recalculado el estilo por su cuenta entre el
     `setAttribute('data-palette')` de arriba y el frame siguiente. Cuando no lo
     hacia —y bajo carga NO lo hace—, el «estilo previo» que la transicion toma
     como origen seguia siendo el de la paleta CLARA, asi que armar la
     transicion y aterrizar el papel oscuro ocurrian en el mismo recalculo: un
     cruce de 640 ms en el arranque, con los TRECE tokens compartiendo
     `startTime`. Leer aqui vacia el trabajo pendiente, de modo que el origen ya
     es el papel definitivo y armar la transicion no mueve nada.
     COMO SE ENCONTRO: en local no reproducia y en la suite con ocho workers si.
     La sonda que lo buscaba leia estilo en cada tick — o sea que **forzaba el
     recalculo y tapaba el defecto que iba a medir**. */
  try { void getComputedStyle(root).getPropertyValue('--paper'); } catch (e) {}
  try {
    requestAnimationFrame(() => {
      root.setAttribute('data-pace-palette-ready', '');
    });
  } catch (e) {
    root.setAttribute('data-pace-palette-ready', '');
  }
}

/* s161 · MIENTRAS LA PALETA CRUZA, NADIE LA PERSIGUE.
   Pone `data-pace-palette-crossing` en <html> durante el fundido; la regla que
   lo consume vive en `tokens.css` y neutraliza la transicion propia de los
   nodos que tienen una sobre color. Sin esto, cada seguidor persigue a un valor
   que se mueve y se reinicia en cada frame: medido, 188 unidades RGB de
   separacion entre el papel del body y el token.

   La duracion se LEE de `--dur-palette`, que es donde vive: si alguien afina el
   fundido en `tokens.css` no hay un segundo numero aqui que se quede viejo. El
   margen extra cubre la cola de la interpolacion. */
let _finDelCruce = null;
function _marcarCruce() {
  const root = document.documentElement;
  let ms = 640;
  try {
    const leido = parseFloat(getComputedStyle(root).getPropertyValue('--dur-palette'));
    if (leido > 0) ms = leido;
  } catch (e) { /* con el valor por defecto basta */ }
  root.setAttribute('data-pace-palette-crossing', '');
  if (_finDelCruce) clearTimeout(_finDelCruce);
  _finDelCruce = setTimeout(() => {
    root.removeAttribute('data-pace-palette-crossing');
    _finDelCruce = null;
  }, ms + 80);
}

let _paletaAplicada = null;
function applyTheme(estado) {
  const root = document.documentElement;
  /* Solo hay CRUCE si la paleta cambia de verdad y el arranque ya paso: el
     primer papel entra seco (ver `_marcarPaletaLista`) y un cambio de
     tipografia no mueve un solo color. */
  if (_paletteReady && _paletaAplicada !== null && _paletaAplicada !== estado.palette) {
    _marcarCruce();
  }
  _paletaAplicada = estado.palette;
  root.setAttribute('data-palette', estado.palette);
  root.setAttribute('data-font', estado.font);
  _marcarPaletaLista();
}

/* Solo `applyTheme` cruza: los dos marcadores son su mecanica interna y nadie
   de fuera tiene por que poder armar un cruce sin aplicar un tema. */
Object.assign(window, { applyTheme });
