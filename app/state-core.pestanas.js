/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-core.pestanas.js — varias pestañas, un solo estado.

   Cada pestaña (o la app instalada junto a una pestaña del navegador) lleva su copia de
   `pace.state.v2` en memoria y, en cada gesto, la escribe ENTERA. Sin esto, la pestaña que se abrió
   antes no sabía nada de lo que hiciste en la otra y lo borraba al tocar cualquier cosa: tres vasos
   en una y uno en la otra dejaban un vaso; un bloque de Foco desaparecía; «Borrar todo» en una y un
   vaso en la otra devolvían todo lo borrado; una copia importada se perdía igual.

   El navegador avisa a las DEMÁS pestañas con `storage` cada vez que una guarda, así que aquí se
   adopta lo guardado (`paceAdoptarEstado`) sin volver a escribirlo. Se lee con `loadState(true)`:
   el mismo saneado y las mismas migraciones que al arrancar, pero si lo guardado no se puede leer
   lanza y esta pestaña se queda con su copia, nunca con el estado de fábrica (un estado de fábrica
   en memoria es un borrado diferido: la siguiente escritura lo guardaría encima). Si la clave
   desaparece (Borrar todo), `loadState` da el de una instalación nueva, que es lo que hay en disco.

   La pestaña oculta también adopta: adoptar no escribe, así que no pisa a nadie, y cuando vuelva al
   frente ya tendrá lo último. Carga después de state-core.jsx, que define las dos funciones. */

function paceOtraPestanaGuardo(e) {
  try {
    if (e.storageArea && e.storageArea !== localStorage) return;
    if (e.key !== LS_KEY && e.key !== null) return;   // null: alguien vació el almacén entero
  } catch (err) { return; }
  var nuevo;
  try { nuevo = loadState(true); } catch (err) { return; }
  paceAdoptarEstado(nuevo);
}

window.addEventListener('storage', paceOtraPestanaGuardo);

Object.assign(window, { paceOtraPestanaGuardo });
