/* PACE · state-licencia.js — EL CÓDIGO DE PACE COMPLETO, SIN SERVIDOR
   ============================================================
   Un código es una licencia firmada (ECDSA P-256 con SHA-256) que la app
   comprueba sola con la llave pública de `app/licencia.llaves.js`:

     PACE1.<datos en base64url>.<firma en base64url>

   Los datos son un JSON: `type` («lifetime»), `keyId`, `issuedAt` y, si es de un
   tester, su número (`tester`). `expiresAt` es OPCIONAL desde el primer día
   (MONETIZATION.md): sin él, el código vale para siempre; con él, un pase
   temporal sería un cambio de datos y no de arquitectura. La firma cubre
   «PACE1.<datos>», así que la versión del formato también va firmada.

   CÓMO LLEGA: un enlace `…/#codigo=PACE1…` o el campo «Tengo un código» de la
   invitación. El código se guarda en el estado (`licencia`), así que viaja con
   la copia de «Tus datos» y se recupera al importarla.

   EN ANDROID NO: Google Play no deja desbloquear contenido digital con códigos
   propios, ni con licencias compradas fuera, sin pasar por su sistema de pagos.
   Allí ni se canjea ni se lee el que trajera una copia de la web; los testers de
   Android reciben un código promocional de Play cuando la app lleve Play Billing.

   LO QUE NO HACE: no protege de quien edite el almacenamiento del navegador (eso
   abre cualquier web). La firma impide FABRICAR códigos, que es lo que importa.
   Y nunca borra un código guardado: si la comprobación de arranque dice que la
   firma no vale, se ignora en memoria y lo guardado se queda como estaba.

   `var`/`function` a propósito, como `library-rules.js`: un `const` no cruza la
   IIFE del artefacto. Carga después de state-core (usa getState, setState y
   showToast al llamarse, no al evaluarse) y antes de state-entitlement. */

var PACE_LICENCIA_PREFIJO = 'PACE1';
var _paceLicenciaRechazada = null; // el código cuya firma rechazó la comprobación de arranque

function paceB64urlBytes(s) {
  var b = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  var bin = atob(b);
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* Lo que se pega puede ser el enlace entero o solo el código, con espacios o
   saltos de línea del correo en medio. */
function paceLicenciaLimpiar(texto) {
  /* Los espacios fuera PRIMERO: un enlace largo partido por el correo llega con un
     salto de línea en medio, y el campo lo convierte en espacio. */
  var s = String(texto || '').replace(/\s+/g, '');
  var m = s.match(/[#?&]codigo=([^&#]+)/);
  if (m) s = m[1];
  try { s = decodeURIComponent(s); } catch (e) {}
  return s;
}

/* Lectura SIN comprobar la firma: el formato y los datos. null si no es un código. */
function paceLicenciaLeer(texto) {
  var s = paceLicenciaLimpiar(texto);
  var partes = s.split('.');
  if (partes.length !== 3 || partes[0] !== PACE_LICENCIA_PREFIJO) return null;
  try {
    var datos = JSON.parse(new TextDecoder().decode(paceB64urlBytes(partes[1])));
    var firma = paceB64urlBytes(partes[2]);
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return null;
    if (typeof datos.keyId !== 'string' || typeof datos.type !== 'string') return null;
    if (firma.length !== 64) return null;
    return { codigo: s, firmado: partes[0] + '.' + partes[1], firma: firma, datos: datos };
  } catch (e) { return null; }
}

function paceLicenciaLlave(keyId) {
  var llaves = window.PACE_LLAVES_LICENCIA || {};
  return Object.prototype.hasOwnProperty.call(llaves, keyId) ? llaves[keyId] : null;
}

function paceLicenciaAnulada(datos) {
  var lista = window.PACE_LICENCIAS_ANULADAS || [];
  return datos.tester != null && lista.indexOf(datos.keyId + ':' + datos.tester) !== -1;
}

/* `expiresAt`: una fecha «YYYY-MM-DD» (vale hasta el final de ese día, en la hora
   de quien lo usa) o milisegundos. Sin él, para siempre. */
function paceLicenciaCaducada(datos, ahora) {
  var e = datos.expiresAt;
  if (e == null) return false;
  var fin = typeof e === 'number' ? e
    : (typeof e === 'string' && typeof parseLocalDateKey === 'function')
      ? parseLocalDateKey(e).getTime() + 24 * 3600 * 1000 : NaN;
  return !(fin > ahora);
}

/* Lo que se puede decir sin criptografía. null si nada lo impide. */
function paceLicenciaMotivo(leida) {
  if (!leida) return 'formato';
  if (!paceLicenciaLlave(leida.datos.keyId)) return 'firma';
  if (paceLicenciaAnulada(leida.datos)) return 'anulada';
  if (paceLicenciaCaducada(leida.datos, Date.now())) return 'caducada';
  return null;
}

function paceLicenciaPermitida() {
  return !(typeof paceEsAndroid === 'function' && paceEsAndroid());
}

/* -> Promise<{ ok: true, codigo, datos } | { ok: false, motivo }>
   motivo: formato · firma · anulada · caducada · navegador (sin WebCrypto) */
function paceLicenciaComprobar(texto) {
  var leida = paceLicenciaLeer(texto);
  var motivo = paceLicenciaMotivo(leida);
  if (motivo) return Promise.resolve({ ok: false, motivo: motivo });
  var sutil = window.crypto && window.crypto.subtle;
  if (!sutil) return Promise.resolve({ ok: false, motivo: 'navegador' });
  var llave = paceLicenciaLlave(leida.datos.keyId);
  return Promise.resolve()
    .then(function () {
      return sutil.importKey('jwk', { kty: 'EC', crv: 'P-256', x: llave.x, y: llave.y },
        { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    })
    .then(function (k) {
      return sutil.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, leida.firma, new TextEncoder().encode(leida.firmado));
    })
    .then(function (bueno) {
      return bueno ? { ok: true, codigo: leida.codigo, datos: leida.datos } : { ok: false, motivo: 'firma' };
    }, function () { return { ok: false, motivo: 'navegador' }; });
}

/* Comprueba y, si vale, lo guarda. */
function paceLicenciaCanjear(texto) {
  if (!paceLicenciaPermitida()) return Promise.resolve({ ok: false, motivo: 'android' });
  return paceLicenciaComprobar(texto).then(function (r) {
    if (r.ok) {
      _paceLicenciaRechazada = null;
      setState({ licencia: r.codigo });
    }
    return r;
  });
}

/* LA QUE LEE EL GUARD, síncrona: los datos del código guardado si vale, o null.
   La firma se comprobó al canjearlo y se vuelve a comprobar al arrancar. */
function paceLicenciaVigente() {
  if (!paceLicenciaPermitida()) return null;
  var s = typeof getState === 'function' ? getState() : null;
  var c = s && typeof s.licencia === 'string' ? s.licencia : null;
  if (!c || c === _paceLicenciaRechazada) return null;
  var leida = paceLicenciaLeer(c);
  return paceLicenciaMotivo(leida) ? null : leida.datos;
}

/* El enlace del tester. Se quita de la barra en cuanto se lee: así recargar no lo
   vuelve a canjear y el código no se queda a la vista. */
function paceLicenciaDelEnlace() {
  var h = '';
  try { h = window.location.hash || ''; } catch (e) {}
  if (h.indexOf('codigo=') === -1) return;
  try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
  if (!paceLicenciaPermitida()) return;
  paceLicenciaCanjear(h).then(function (r) {
    try { showToast({ type: 'licencia', ok: r.ok, motivo: r.motivo, tester: !!(r.ok && r.datos.tester != null) }); } catch (e) {}
  });
}

function paceLicenciaArranque() {
  var s = typeof getState === 'function' ? getState() : null;
  var guardado = s && typeof s.licencia === 'string' ? s.licencia : null;
  if (guardado && paceLicenciaPermitida()) {
    paceLicenciaComprobar(guardado).then(function (r) {
      /* Solo una firma que NO vale lo aparta. «navegador» (sin WebCrypto) no dice
         nada del código y no puede cerrar lo que la persona ya tenía. */
      if (!r.ok && r.motivo === 'firma') {
        _paceLicenciaRechazada = guardado;
        setState(function (x) { return Object.assign({}, x); });
      }
    });
  }
  paceLicenciaDelEnlace();
}

setTimeout(paceLicenciaArranque, 0);
try { window.addEventListener('hashchange', paceLicenciaDelEnlace); } catch (e) {}

Object.assign(window, {
  paceLicenciaLeer: paceLicenciaLeer,
  paceLicenciaLimpiar: paceLicenciaLimpiar,
  paceLicenciaComprobar: paceLicenciaComprobar,
  paceLicenciaCanjear: paceLicenciaCanjear,
  paceLicenciaVigente: paceLicenciaVigente,
  paceLicenciaPermitida: paceLicenciaPermitida,
});
