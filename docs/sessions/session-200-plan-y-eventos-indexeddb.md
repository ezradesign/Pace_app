# Sesión 200 — El plan de seis fases y los eventos en IndexedDB (v0.134.0)

**Fecha:** 5 de octubre de 2026 · **Versión:** v0.133.2 → v0.134.0 · Cierre corto, por encargo.

## Encargo

Dos tareas tras la auditoría externa de s199 y las decisiones de Ez del mismo día:

1. Reescribir «Camino a v1.0» del `ROADMAP.md` con el orden nuevo y archivar el anterior.
2. Arreglar la pérdida de eventos con dos pestañas (`tests/eventos-barrera.spec.js:23`, intermitente:
   7–12 fallos de 20 con `--repeat-each=20 --workers=2`).

## Tarea 1 · el plan

- «Camino a v1.0» pasa de 15 fases a **seis**: saneamiento corto · Capacitor Android y prueba cerrada
  cuanto antes · «A tu ritmo» semanal (lo que se paga) · Stats «Hoy» y «Semana» (se desaparca la
  Fase 4) · cerrar con lo que hay las Fases 2, 2.5, 3.5, 3.6 y 5 · venta.
- El reparto gratis / pago, en una tabla. Los ~12 testers durante 14 días de Play Console quedan
  **a confirmar en Play Console**.
- **Fuera de v1**: Travesías, reescritura de Caminos, Fase 8, Viajes y CTB, iOS, extensión de
  Chrome, Vite/ESM. **Regla nueva: ninguna fase entra en v1 sin sacar otra.**
- Quitar los Caminos de la home NO se ha hecho: anotado como pendiente de maqueta.
- El texto anterior, entero, en `docs/archive/ROADMAP_CAMINO_V1_S132_HISTORICO.md` (enlazado desde
  `docs/archive/README.md` y `AUDITORIA_DOCUMENTAL.md`). `ROADMAP.md`: 682 → 272 líneas.
  La línea de Versionado de `CLAUDE.md` ya no habla de «15 fases».

## Tarea 2 · eventos en IndexedDB

- **Nuevo `app/events/events-adapter-web.idb.js`**: abre la base `pace.events`, guarda **la misma
  cadena JSON** en un registro (`pace.events.v1`), mantiene un **espejo** síncrono para las lecturas
  que la UI hace al pintar, y migra **una vez** el contenedor de `localStorage`.
- **`events-adapter-web.js`**: misma interfaz `eventsWeb*` y mismo contrato de capacidad. La RMW
  completa —releer, escribir, releer para verificar— va dentro de `navigator.locks.request` como
  promesa. Un almacén que no se puede **leer** rechaza en vez de reiniciar (no es lo mismo que un
  contenedor corrupto).
- **`Sidebar.jsx`** se repinta con el evento `pace:eventos`: el espejo se carga después del primer
  render.
- **Tests**: los helpers y las ocho specs que leían `localStorage` leen ahora `eventsWebReadRaw()`;
  los dos espías de escritura de la retención espían `IDBObjectStore.prototype.put` (mutante «escribe
  sin podar»: muerde). **Nuevo `tests/eventos-idb.spec.js`** (2 tests): la migración copia entera y
  borra la clave vieja; si IndexedDB ya tiene otro contenedor, la clave vieja no se toca. Los dos
  mutantes (no migrar · borrar siempre) muerden.
- **Resultado**: `eventos-barrera.spec.js:23` **20 de 20** con `--repeat-each=20 --workers=2`.

## Lo que queda abierto

- Una pestaña con una versión **anterior** de PACE todavía abierta (SW sin actualizar) seguiría
  escribiendo en `localStorage` después de migrar; esos eventos no se pasan (la migración solo copia
  si IndexedDB está vacío y nunca borra una copia distinta). Ventana corta, sin arreglar.
- El espejo de una pestaña no ve lo que escribe otra hasta que vuelve a ella (`visibilitychange`).
