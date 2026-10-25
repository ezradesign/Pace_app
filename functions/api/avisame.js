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

   LÍMITES, SIN GUARDAR NADA MÁS (auditoría del 22 oct., S4). Sin ellos, un robot podía
   llenar la lista y gastar las escrituras del almacén:
   · un cuerpo de más de 2 KB no se lee (413);
   · un correo que ya está no se vuelve a escribir: se contesta que sí y se queda la
     fecha y el idioma de la primera vez;
   · desde una misma conexión, cinco intentos por hora; el sexto recibe un 429. La
     cuenta vive en la caché del centro de datos de Cloudflare (`caches.default`), no
     en el almacén, y caduca a la hora. Su clave es una huella (SHA-256) de la IP con
     la hora, así que la IP no se guarda en ningún sitio. Si la caché falla, la lista
     sigue abierta: el límite es para robots, no puede cerrar la puerta a nadie.

   Lo que se guarda y para qué lo cuenta `privacy.html` (#avisame). Cloudflare la sirve
   como módulo: el `export` es su formato, no el de la app. */

const CORREO = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

const CUERPO_MAX = 2048;
const INTENTOS_POR_HORA = 5;

function respuesta(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/* ¿Ha pasado esta conexión de los intentos de esta hora? Cuenta el intento si no. */
async function demasiados(request) {
  const ip = request.headers.get('CF-Connecting-IP');
  const cache = typeof caches !== 'undefined' && caches && caches.default;
  if (!ip || !cache) return false;
  try {
    const hora = new Date().toISOString().slice(0, 13);
    const huella = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hora + '|' + ip));
    const hex = Array.from(new Uint8Array(huella), (b) => b.toString(16).padStart(2, '0')).join('');
    const clave = new Request(new URL('/api/avisame/intentos/' + hex, request.url).href);
    const previa = await cache.match(clave);
    const n = previa ? Number(await previa.text()) || 0 : 0;
    if (n >= INTENTOS_POR_HORA) return true;
    await cache.put(clave, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
    return false;
  } catch (e) { return false; }
}

export async function onRequestGet({ env }) {
  return env.AVISAME ? respuesta({ abierta: true }) : respuesta({ abierta: false }, 503);
}

export async function onRequestPost({ request, env }) {
  if (!env.AVISAME) return respuesta({ ok: false, motivo: 'cerrada' }, 503);
  /* Solo desde la propia web: otra página no puede apuntar a nadie. */
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) return respuesta({ ok: false, motivo: 'origen' }, 403);
  if (Number(request.headers.get('Content-Length')) > CUERPO_MAX) return respuesta({ ok: false, motivo: 'formato' }, 413);
  const texto = await request.text();
  if (texto.length > CUERPO_MAX) return respuesta({ ok: false, motivo: 'formato' }, 413);
  if (await demasiados(request)) {
    const r = respuesta({ ok: false, motivo: 'limite' }, 429);
    r.headers.set('Retry-After', '3600');
    return r;
  }
  let datos;
  try { datos = JSON.parse(texto); } catch (e) { return respuesta({ ok: false, motivo: 'formato' }, 400); }
  if (!datos || typeof datos !== 'object') return respuesta({ ok: false, motivo: 'formato' }, 400);
  if (datos.web) return respuesta({ ok: true });
  const correo = String(datos.correo || '').trim().toLowerCase();
  if (correo.length > 254 || !CORREO.test(correo)) return respuesta({ ok: false, motivo: 'correo' }, 400);
  if (await env.AVISAME.get(correo)) return respuesta({ ok: true });
  const idioma = datos.idioma === 'en' ? 'en' : 'es';
  await env.AVISAME.put(correo, JSON.stringify({ fecha: new Date().toISOString().slice(0, 10), idioma }));
  return respuesta({ ok: true });
}
