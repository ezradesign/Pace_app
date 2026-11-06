/* PACE · cobro/mensual.js — LOS CÓDIGOS DE CADA MENSUAL EN `VENTAS`, QUE SOLO SE AÑADEN
   ============================================================
   /api/stripe guarda el código de cada periodo pagado de una mensual; /api/renovar y
   /api/recuperar dan el que más dura. KV no tiene transacciones: dos peticiones a la vez leen
   lo mismo, y en una misma llave gana la que escribe la última. Con una sola llave por mensual,
   dos renovaciones distintas que llegan solapadas (la de un mes que Stripe reintenta tarde y la
   del mes siguiente) dejaban la más corta si escribía la última (revisión de ChatGPT del 5 nov.,
   tests/cobro-a-la-vez.spec.js). Por eso cada periodo pagado va en su propia llave:

     periodo:<id de la mensual>:<expiresAt>  el código de ese periodo; dos periodos distintos
                                             nunca escriben en la misma, y repetido escribe lo mismo
     suscripcion:<id de la mensual>          el último que se escribió, como antes del 6 nov. de 2026

   y la lectura se queda con el que más dura de todos, sin importar quién escribió el último.
   `suscripcion:` se sigue leyendo, porque es lo único que hay de las mensuales de antes (no se
   puede migrar), y escribiendo, para que una versión anterior de estas funciones, si se vuelve
   a ella, encuentre un código. Puede quedarse con el más corto de dos solapados: nadie se fía
   solo de ella.

   La lista de llaves de KV tarda hasta un minuto en enseñar una nueva fuera del centro de datos
   que la escribió: mientras, se lee el código de antes, que es lo mismo que si la renovación aún
   no hubiera llegado (la app vuelve a preguntar, y el código lleva tres días de margen). Nunca va
   hacia atrás. */

import { ventaDatos } from './venta.js';

const prefijo = (sub) => 'periodo:' + sub + ':';

/* Las llaves de los periodos de una mensual, con su fin (ms), en todas las páginas de la lista. */
async function periodos(kv, sub) {
  const fines = [];
  let cursor = null;
  do {
    const pagina = await kv.list({ prefix: prefijo(sub), cursor: cursor || undefined });
    for (const k of pagina.keys) {
      const fin = Number(k.name.slice(prefijo(sub).length));
      if (fin > 0) fines.push({ nombre: k.name, fin });
    }
    cursor = pagina.list_complete ? null : pagina.cursor;
  } while (cursor);
  return fines;
}

/* El código de la mensual que más dura, o null si no hay ninguno. El de `suscripcion:` vale aunque
   no se pueda leer su fecha, si no hay un periodo con una. */
export async function mensualUltimo(kv, sub) {
  const viejo = await kv.get('suscripcion:' + sub);
  const finViejo = viejo ? Number((ventaDatos(viejo) || {}).expiresAt) || 0 : -1;
  const mayores = (await periodos(kv, sub)).filter((p) => p.fin > finViejo).sort((a, b) => b.fin - a.fin);
  /* Uno que la lista enseña y ya no está (una baja a la vez) no cuenta: el siguiente. */
  for (const p of mayores) {
    const codigo = await kv.get(p.nombre);
    if (codigo) return codigo;
  }
  return viejo || null;
}

/* Guarda el código de un periodo pagado: su llave, que no pisa la de ningún otro, y `suscripcion:`. */
export async function mensualGuardar(kv, sub, codigo) {
  await kv.put(prefijo(sub) + ventaDatos(codigo).expiresAt, codigo);
  await kv.put('suscripcion:' + sub, codigo);
}

/* Al terminar la mensual: fuera todos sus códigos. */
export async function mensualBorrar(kv, sub) {
  await kv.delete('suscripcion:' + sub);
  for (const p of await periodos(kv, sub)) await kv.delete(p.nombre);
}
