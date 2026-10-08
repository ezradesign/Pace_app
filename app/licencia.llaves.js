/* PACE · licencia.llaves.js — LAS LLAVES PÚBLICAS DE LOS CÓDIGOS
   ============================================================
   Con estas llaves la app comprueba, sin conexión y sin servidor, que un código
   de PACE completo lo firmó Ez (lo comprueba `app/state-licencia.js`). Son
   PÚBLICAS: solo sirven para comprobar, no para firmar. La llave privada, la que
   firma, no entra nunca en el repositorio: vive en la carpeta
   `PACE-llave-licencias` del PC de Ez, al lado de la de Play, y `verify` falla si
   aparece una en el árbol.

   Este archivo lo escribe `npm run licencia:llaves` (scripts/licencias/). Cada
   llave lleva su id, el mismo que va dentro de cada código (`keyId`), así que
   una llave nueva convive con la anterior y los códigos ya dados siguen valiendo.
   Mientras esté vacío, ningún código abre nada.

   ANULADOS: si un código se comparte donde no debe, su `keyId:tester` va aquí y
   deja de abrir PACE completo en la versión siguiente, sin tocar a nadie más.

   `var` a propósito, como `library-rules.js`: un `const` no cruza la IIFE del
   artefacto. */

var PACE_LLAVES_LICENCIA = {
};

var PACE_LICENCIAS_ANULADAS = [
];

Object.assign(window, { PACE_LLAVES_LICENCIA: PACE_LLAVES_LICENCIA, PACE_LICENCIAS_ANULADAS: PACE_LICENCIAS_ANULADAS });
