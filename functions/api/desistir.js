/* PACE · /api/desistir — LA FUNCIÓN DE DESISTIMIENTO EN LÍNEA
   ===========================================================
   Ez, 1A del 30 oct. 2026 (https://claude.ai/artifact/GT6ZwHQHY6bKk7vBuYrUw2): quien compró PACE
   completo en la web desiste aquí, como pide el art. 11 bis de la Directiva 2011/83 (lo añadió la
   2023/2673; se aplica desde el 19 jun. 2026): un formulario corto, «Confirmar desistimiento» y un
   acuse en soporte duradero con lo que dijo, la fecha y la hora. La página (pacegrass.app/desistir)
   manda el nombre, el correo de la compra, el número del recibo si lo tiene y el plan, y la función
   manda dos correos con Resend:

     · a Ez, con todo, para que devuelva el pago en Stripe. Va PRIMERO: si no sale, el desistimiento
       no ha llegado a nadie, y la página lo dice y manda escribir;
     · al comprador, el acuse. Si este falla, el desistimiento ya está en el buzón de Ez: la página
       enseña el acuse para guardarlo y dice que el correo no salió.

   GET  -> 200 { abierta: true } con la llave de Resend; si no, 503 y la página manda escribir a Ez.
   POST { nombre, correo, recibo, plan, idioma, web } -> 200 { ok, referencia, fecha, acuse } · 400
     sin nombre o sin correo · 403 desde otra web · 413 · 429 · 502 si el correo a Ez no sale · 503
     sin la llave. `web` es la trampa para robots de «Avísame»: relleno, se contesta que sí y no se
     manda nada.

   NO SE GUARDA NADA EN PACE: los datos van a Resend, que manda los dos correos, y se quedan en el
   buzón de Ez, que los necesita para devolver. No se busca la compra en Stripe: un número mal
   copiado no puede dejar a nadie sin desistir; Ez la busca al devolver. Cinco intentos por hora desde
   una misma conexión, con una huella de la IP en la caché del centro de datos, como «Avísame».

   APAGADA hasta que Ez verifique pacegrass.app en Resend y ponga su llave en Cloudflare como el
   secreto `RESEND_CLAVE` (docs/launch/desistir.md). La app no la usa. Cloudflare la sirve como
   módulo. */

/* El de privacy.html y /recuperar: el acuse se contesta a él, y a él le llega cada desistimiento. */
const CORREO_DE_EZ = 'hola.ezradesign@gmail.com';
const REMITENTE = 'PACE <desistir@pacegrass.app>';
const RESEND = 'https://api.resend.com/emails';

const CORREO = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const RECIBO = /^[#\sA-Za-z0-9-]{0,40}$/;
const CUERPO_MAX = 2048;
const INTENTOS_POR_HORA = 5;

const PLAN = {
  es: { vida: 'De por vida', mes: 'Al mes', '': 'No lo sabe' },
  en: { vida: 'Lifetime', mes: 'Monthly', '': 'Not sure' },
};

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
    const huella = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hora + '|desistir|' + ip));
    const hex = Array.from(new Uint8Array(huella), (b) => b.toString(16).padStart(2, '0')).join('');
    const clave = new Request(new URL('/api/desistir/intentos/' + hex, request.url).href);
    const previa = await cache.match(clave);
    const n = previa ? Number(await previa.text()) || 0 : 0;
    if (n >= INTENTOS_POR_HORA) return true;
    await cache.put(clave, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
    return false;
  } catch (e) { return false; }
}

/* La fecha y la hora del acuse, en la de España: es la que cuenta para el plazo de quien vende. */
function fechaTexto(fecha, idioma) {
  const texto = new Intl.DateTimeFormat(idioma === 'en' ? 'en-GB' : 'es-ES',
    { timeZone: 'Europe/Madrid', dateStyle: 'long', timeStyle: 'short' }).format(fecha);
  return texto + (idioma === 'en' ? ' (Madrid time)' : ' (hora de Madrid)');
}

function acuse(d) {
  if (d.idioma === 'en') {
    return { asunto: 'We have received your withdrawal · PACE', texto: [
      'Hello, ' + d.nombre + ',', '',
      'We have received your withdrawal from PACE Complete on the web. This email is the acknowledgement of receipt.', '',
      'What you sent us:',
      '· Name: ' + d.nombre,
      '· Purchase email: ' + d.correo,
      '· Receipt number: ' + (d.recibo || 'not given'),
      '· Plan: ' + PLAN.en[d.plan],
      '· Date and time: ' + d.fechaTexto,
      '· Reference: ' + d.referencia, '',
      'What happens now: we refund everything you paid, using the same payment method, within 14 days at the latest. If you had the monthly plan, it is cancelled and you will not be charged again. Free PACE and your practice, stored on your device, stay as they were.', '',
      'If something does not add up, reply to this email.', '',
      'PACE · pacegrass.app'].join('\n') };
  }
  return { asunto: 'Hemos recibido tu desistimiento · PACE', texto: [
    'Hola, ' + d.nombre + ':', '',
    'Hemos recibido tu desistimiento de PACE completo en la web. Este correo es el acuse de recibo.', '',
    'Lo que nos has mandado:',
    '· Nombre: ' + d.nombre,
    '· Correo de la compra: ' + d.correo,
    '· Número del recibo: ' + (d.recibo || 'no lo has puesto'),
    '· Plan: ' + PLAN.es[d.plan],
    '· Fecha y hora: ' + d.fechaTexto,
    '· Referencia: ' + d.referencia, '',
    'Qué pasa ahora: te devolvemos todo lo que hayas pagado, por la misma forma de pago, como mucho en 14 días. Si tenías la mensualidad, se cancela y no se te vuelve a cobrar. Lo gratis de PACE y tu práctica, guardada en tu dispositivo, siguen como estaban.', '',
    'Si algo no cuadra, contesta a este correo.', '',
    'PACE · pacegrass.app'].join('\n') };
}

function avisoAEz(d) {
  return { asunto: 'Desistimiento ' + d.referencia + ': ' + d.nombre, texto: [
    'Alguien ha desistido de PACE completo desde pacegrass.app/desistir.', '',
    '· Nombre: ' + d.nombre,
    '· Correo de la compra: ' + d.correo,
    '· Número del recibo: ' + (d.recibo || 'no lo ha puesto'),
    '· Plan: ' + PLAN.es[d.plan],
    '· Idioma: ' + (d.idioma === 'en' ? 'inglés' : 'castellano'),
    '· Fecha y hora: ' + fechaTexto(d.fecha, 'es'),
    '· Referencia: ' + d.referencia, '',
    'Justo después le mandamos el acuse. Si no le llegara, la página se lo enseña para guardarlo.', '',
    'Qué hacer, como mucho en 14 días:',
    '1. En Stripe, busca la compra por su correo.',
    '2. Devuelve el pago entero. Si es la mensualidad, cancela la suscripción ya.',
    '3. Si hace falta, contesta a este correo: va a su dirección.'].join('\n') };
}

/* Un correo de texto con Resend. Envuelto: un `fetch` suelto, sin su `this`, puede fallar con
   «Illegal invocation». Devuelve si salió. */
async function mandar(clave, para, responderA, correo) {
  try {
    const r = await fetch(RESEND, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + clave, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: REMITENTE, to: [para], reply_to: responderA, subject: correo.asunto, text: correo.texto }),
    });
    return r.ok;
  } catch (e) { return false; }
}

export async function onRequestGet({ env }) {
  return env.RESEND_CLAVE ? respuesta({ abierta: true }) : respuesta({ abierta: false }, 503);
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_CLAVE) return respuesta({ ok: false, motivo: 'cerrada' }, 503);
  const origen = request.headers.get('Origin');
  if (origen && origen !== new URL(request.url).origin) return respuesta({ ok: false, motivo: 'origen' }, 403);
  if (Number(request.headers.get('Content-Length')) > CUERPO_MAX) return respuesta({ ok: false, motivo: 'formato' }, 413);
  const texto = await request.text();
  if (texto.length > CUERPO_MAX) return respuesta({ ok: false, motivo: 'formato' }, 413);
  if (await demasiados(request)) {
    const r = respuesta({ ok: false, motivo: 'espera' }, 429);
    r.headers.set('Retry-After', '3600');
    return r;
  }
  let datos;
  try { datos = JSON.parse(texto); } catch (e) { return respuesta({ ok: false, motivo: 'formato' }, 400); }
  if (!datos || typeof datos !== 'object') return respuesta({ ok: false, motivo: 'formato' }, 400);
  if (datos.web) return respuesta({ ok: true, referencia: '', fecha: '', acuse: false });
  /* Sin saltos de línea ni caracteres de control: el nombre va en el asunto de un correo. */
  const nombre = String(datos.nombre || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
  const correo = String(datos.correo || '').trim();
  const recibo = String(datos.recibo || '').trim();
  if (!nombre || nombre.length > 120 || correo.length > 254 || !CORREO.test(correo) || !RECIBO.test(recibo)) {
    return respuesta({ ok: false, motivo: 'formato' }, 400);
  }
  const fecha = new Date();
  const d = {
    nombre, correo, recibo, fecha,
    plan: datos.plan === 'vida' || datos.plan === 'mes' ? datos.plan : '',
    idioma: datos.idioma === 'en' ? 'en' : 'es',
    referencia: 'D-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
  };
  d.fechaTexto = fechaTexto(fecha, d.idioma);

  if (!(await mandar(env.RESEND_CLAVE, CORREO_DE_EZ, correo, avisoAEz(d)))) return respuesta({ ok: false, motivo: 'envio' }, 502);
  const salio = await mandar(env.RESEND_CLAVE, correo, CORREO_DE_EZ, acuse(d));
  return respuesta({ ok: true, referencia: d.referencia, fecha: fecha.toISOString(), fechaTexto: d.fechaTexto, acuse: salio });
}
