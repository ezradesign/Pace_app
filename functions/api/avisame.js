/* PACE · /api/avisame — LA LISTA «AVÍSAME» (Ez, 16 oct. 2026)
   ============================================================
   Una función de Cloudflare Pages junto a la web: guarda cada correo de la página de
   PACE completo (/premium) en un almacén KV de la cuenta de Cloudflare de Ez, el mismo
   sitio que ya sirve pacegrass.app. Sin servicio de listas en medio (opción elegida por
   Ez sobre https://claude.ai/artifact/AvME9EqcMHXhywx43vEdKG).

   LA APP NO LA USA: es solo de /premium. La app sigue sin hablar con ningún servidor.

   GET  -> 200 {abierta: true} si el almacén está conectado; si no, 503. La página
           enseña el campo solo con el 200: así la lista se enciende sola cuando Ez
           conecta el KV (binding `AVISAME`), y no antes.
   POST {correo, idioma, web} -> guarda `correo` (en minúsculas, como clave) con la
           fecha y el idioma. `web` es un campo oculto: si viene relleno es un robot, y se
           le contesta que sí sin guardar nada.

   Lo que se guarda y para qué lo cuenta `privacy.html` (#avisame). Cloudflare la sirve
   como módulo: el `export` es su formato, no el de la app. */

const CORREO = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

function respuesta(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function onRequestGet({ env }) {
  return env.AVISAME ? respuesta({ abierta: true }) : respuesta({ abierta: false }, 503);
}

export async function onRequestPost({ request, env }) {
  if (!env.AVISAME) return respuesta({ ok: false, motivo: 'cerrada' }, 503);
  /* Solo desde la propia web: otra página no puede apuntar a nadie. */
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) return respuesta({ ok: false, motivo: 'origen' }, 403);
  let datos;
  try { datos = await request.json(); } catch (e) { return respuesta({ ok: false, motivo: 'formato' }, 400); }
  if (!datos || typeof datos !== 'object') return respuesta({ ok: false, motivo: 'formato' }, 400);
  if (datos.web) return respuesta({ ok: true });
  const correo = String(datos.correo || '').trim().toLowerCase();
  if (correo.length > 254 || !CORREO.test(correo)) return respuesta({ ok: false, motivo: 'correo' }, 400);
  const idioma = datos.idioma === 'en' ? 'en' : 'es';
  await env.AVISAME.put(correo, JSON.stringify({ fecha: new Date().toISOString().slice(0, 10), idioma }));
  return respuesta({ ok: true });
}
