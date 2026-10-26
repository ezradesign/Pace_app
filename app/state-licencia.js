/* PACE · state-licencia.js — EL CÓDIGO DE PACE COMPLETO, SIN SERVIDOR
   ============================================================
   Un código es una licencia firmada (ECDSA P-256 con SHA-256) que la app
   comprueba sola con la llave pública de `app/licencia.llaves.js`:

     PACE1.<datos en base64url>.<firma en base64url>

   Los datos son un JSON: `type` («lifetime» o «monthly»), `keyId`, `issuedAt` y, si
   es de un tester, su número (`tester`); si es de una venta (firmada con k2 por la
   función de la web), su número de pedido o de suscripción (`order`). `expiresAt` es OPCIONAL desde el primer día
   (MONETIZATION.md): sin él, el código vale para siempre; con él, un pase
   temporal sería un cambio de datos y no de arquitectura. La firma cubre
   «PACE1.<datos>», así que la versión del formato también va firmada.

   CÓMO LLEGA: un enlace `…/#codigo=PACE1…` o el campo «Tengo un código» de la
   invitación. El código se guarda en el estado (`licencia`), así que viaja con
   la copia de «Tus datos» y se recupera al importarla.

   EN LAS APPS (ANDROID Y IPHONE) NO: ni Google Play ni la App Store dejan
   desbloquear contenido digital con códigos propios, ni con licencias compradas
   fuera, sin pasar por su sistema de pagos. Allí ni se canjea ni se lee el que
   trajera una copia de la web; los testers reciben un código promocional de la
   tienda cuando la app lleve su compra integrada.

   UN CÓDIGO NO CUENTA HASTA QUE SU FIRMA SE COMPRUEBA en esta página. Llegue
   como llegue al estado (canjeado, guardado de otra vez, en una copia de «Tus
   datos» o escrito a mano), el guard lo ignora mientras WebCrypto lo comprueba
   (es asíncrono: unos milisegundos al abrir) y para siempre si no puede
   comprobarse. La firma impide FABRICAR códigos; esto impide que uno fabricado
   cuente mientras nadie mira. Y nunca borra un código guardado: si la firma no
   vale, se ignora en memoria y lo guardado se queda como estaba.

   `var`/`function` a propósito, como `library-rules.js`: un `const` no cruza la
   IIFE del artefacto. Carga después de state-core (usa getState, setState y
   showToast al llamarse, no al evaluarse) y antes de state-entitlement. */

var PACE_LICENCIA_PREFIJO = 'PACE1';
/* Lo que se sabe de la firma del código guardado, solo en memoria: `estado` es
   «comprobando», «buena», «mala» o «sin comprobar» (sin WebCrypto). Si el código
   del estado cambia, se vuelve a empezar. */
var _paceLicenciaFirma = { codigo: null, estado: null };

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

/* Se anula uno solo: `keyId:tester` (k1) o `keyId:order` (una venta). */
function paceLicenciaAnulada(datos) {
  var lista = window.PACE_LICENCIAS_ANULADAS || [];
  return [datos.tester, datos.order].some(function (n) {
    return n != null && lista.indexOf(datos.keyId + ':' + n) !== -1;
  });
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
  return !(typeof paceEsNativo === 'function' && paceEsNativo());
}

/* -> Promise<{ ok: true, codigo, datos } | { ok: false, motivo }>
   motivo: formato · firma · anulada · caducada · navegador (sin WebCrypto) · tienda (en las apps) */
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
  if (!paceLicenciaPermitida()) return Promise.resolve({ ok: false, motivo: 'tienda' });
  return paceLicenciaComprobar(texto).then(function (r) {
    if (r.ok) {
      _paceLicenciaFirma = { codigo: r.codigo, estado: 'buena' };
      setState({ licencia: r.codigo });
    }
    return r;
  });
}

/* Empieza a comprobar la firma del código guardado, una vez por código. Cuando
   vale, la app se vuelve a pintar con PACE completo; lo demás no cambia nada que
   se vea, porque mientras tanto ya contaba como cerrado. */
function paceLicenciaComprobarGuardado(c) {
  if (_paceLicenciaFirma.codigo === c) return;
  _paceLicenciaFirma = { codigo: c, estado: 'comprobando' };
  paceLicenciaComprobar(c).then(function (r) {
    if (_paceLicenciaFirma.codigo !== c) return; // llegó otro código mientras tanto
    _paceLicenciaFirma = { codigo: c, estado: r.ok ? 'buena' : r.motivo === 'navegador' ? 'sin comprobar' : 'mala' };
    if (r.ok) setState(function (x) { return Object.assign({}, x); });
  });
}

/* LA QUE LEE EL GUARD, síncrona: los datos del código guardado si su firma ya se
   comprobó en esta página y nada lo impide (anulado, caducado), o null. Si es un
   código que aún no se ha comprobado, empieza a comprobarlo y, mientras, null. */
function paceLicenciaVigente() {
  if (!paceLicenciaPermitida()) return null;
  var s = typeof getState === 'function' ? getState() : null;
  var c = s && typeof s.licencia === 'string' ? s.licencia : null;
  if (!c) return null;
  var leida = paceLicenciaLeer(c);
  if (paceLicenciaMotivo(leida)) return null;
  if (_paceLicenciaFirma.codigo !== c) paceLicenciaComprobarGuardado(c);
  return _paceLicenciaFirma.estado === 'buena' ? leida.datos : null;
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
    try {
      showToast({ type: 'licencia', ok: r.ok, motivo: r.motivo, tester: !!(r.ok && r.datos.tester != null),
        mensual: !!(r.ok && paceLicenciaEsMensual(r.datos)) });
    } catch (e) {}
  });
}

/* Al abrir, la firma del código guardado se comprueba cuanto antes, sin esperar a
   que algo pregunte por PACE completo. */
function paceLicenciaArranque() {
  paceLicenciaVigente();
  paceLicenciaDelEnlace();
  paceLicenciaRenovar(true);
}

/* No arranca hasta que esté ui/nativo.js, que carga después: la app es una lista
   de scripts y el navegador puede correr un temporizador entre dos de ellos
   (Chromium lo hace). Sin esa capa, `paceLicenciaPermitida()` no sabe que está en
   la app de una tienda y el enlace se leería también allí. El tope (unos diez
   segundos) es para un artefacto sin esa capa, que entonces es la web. */
var _paceLicenciaEsperas = 0;
function paceLicenciaCuandoSepa() {
  if (typeof paceEsNativo !== 'function' && _paceLicenciaEsperas++ < 500) {
    setTimeout(paceLicenciaCuandoSepa, 20);
    return;
  }
  paceLicenciaArranque();
}

/* LA MENSUAL SE RENUEVA SOLA, Y SIN RED SIGUE (Fase 6). El código de la mensual
   (`type: 'monthly'`, con su `order` y su `expiresAt` en milisegundos) vale el
   periodo pagado y tres días más. Desde tres días y medio antes de que caduque, la
   web pide el nuevo a /api/renovar (functions/api/renovar.js) al abrir, al volver
   la conexión y cada hora, como mucho cada seis horas: es la única conexión de la
   app, solo para quien paga al mes. Sin red, lo ya comprobado sigue valiendo hasta
   su fecha: la firma se comprueba sin servidor. Lo que se aprende de cada intento
   (`_paceRenovar.motivo`) es lo que separa «sin red» de «terminada» cuando caduca:
     sin-red    no se pudo preguntar (sin conexión, o la web no contestó);
     terminada  la web dice que esa suscripción ya no sigue (410). */
var PACE_RENOVAR_ANTES = 3.5 * 24 * 3600 * 1000;
var PACE_RENOVAR_CADA = 6 * 3600 * 1000;
var _paceRenovar = { ultimo: 0, motivo: null, enCurso: null };

function paceLicenciaGuardada() {
  var s = typeof getState === 'function' ? getState() : null;
  var c = s && typeof s.licencia === 'string' ? s.licencia : null;
  var leida = c ? paceLicenciaLeer(c) : null;
  return leida ? { codigo: c, datos: leida.datos } : null;
}

function paceLicenciaEsMensual(datos) {
  return !!datos && datos.type === 'monthly' && typeof datos.order === 'string' && typeof datos.expiresAt === 'number';
}

/* -> Promise<'renovada' | 'igual' | 'terminada' | 'sin-red' | null> (null: no tocaba). */
function paceLicenciaRenovar(forzar) {
  if (!paceLicenciaPermitida() || typeof fetch !== 'function') return Promise.resolve(null);
  var g = paceLicenciaGuardada();
  if (!g || !paceLicenciaEsMensual(g.datos) || g.datos.expiresAt - Date.now() > PACE_RENOVAR_ANTES) return Promise.resolve(null);
  if (_paceRenovar.enCurso) return _paceRenovar.enCurso;
  if (!forzar && Date.now() - _paceRenovar.ultimo < PACE_RENOVAR_CADA) return Promise.resolve(null);
  _paceRenovar.ultimo = Date.now();
  var fin = function (motivo) {
    _paceRenovar.motivo = motivo === 'terminada' || motivo === 'sin-red' ? motivo : null;
    _paceRenovar.enCurso = null;
    try { setState(function (x) { return Object.assign({}, x); }); } catch (e) {}
    return motivo;
  };
  _paceRenovar.enCurso = fetch('/api/renovar', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ codigo: g.codigo }),
  }).then(function (r) {
    if (r.status === 410) return fin('terminada');
    if (!r.ok) return fin('sin-red');
    return r.json().then(function (d) {
      var nuevo = d && d.codigo ? paceLicenciaLeer(d.codigo) : null;
      if (!nuevo || !paceLicenciaEsMensual(nuevo.datos) || nuevo.datos.order !== g.datos.order) return fin('sin-red');
      if (!(nuevo.datos.expiresAt > g.datos.expiresAt)) return fin('igual');
      return paceLicenciaCanjear(d.codigo).then(function (x) { return fin(x && x.ok ? 'renovada' : 'sin-red'); });
    });
  }).catch(function () { return fin('sin-red'); });
  return _paceRenovar.enCurso;
}

/* Cómo está PACE completo por el código, para decirlo (Ajustes):
   { estado: 'ninguno' | 'vigente' | 'caducado', motivo: null | 'sin-red' | 'terminada', datos } */
function paceLicenciaEstado() {
  var datos = paceLicenciaVigente();
  if (datos) return { estado: 'vigente', motivo: null, datos: datos };
  var g = paceLicenciaPermitida() ? paceLicenciaGuardada() : null;
  if (g && paceLicenciaCaducada(g.datos, Date.now())) {
    return { estado: 'caducado', motivo: paceLicenciaEsMensual(g.datos) ? (_paceRenovar.motivo || 'sin-red') : null, datos: g.datos };
  }
  return { estado: 'ninguno', motivo: null, datos: null };
}

setTimeout(paceLicenciaCuandoSepa, 0);
try { window.addEventListener('hashchange', paceLicenciaDelEnlace); } catch (e) {}
try { window.addEventListener('online', function () { paceLicenciaRenovar(true); }); } catch (e) {}
try { setInterval(function () { paceLicenciaRenovar(false); }, 3600 * 1000); } catch (e) {}

Object.assign(window, {
  paceLicenciaLeer: paceLicenciaLeer,
  paceLicenciaLimpiar: paceLicenciaLimpiar,
  paceLicenciaComprobar: paceLicenciaComprobar,
  paceLicenciaCanjear: paceLicenciaCanjear,
  paceLicenciaVigente: paceLicenciaVigente,
  paceLicenciaPermitida: paceLicenciaPermitida,
  paceLicenciaRenovar: paceLicenciaRenovar,
  paceLicenciaEstado: paceLicenciaEstado,
  paceLicenciaEsMensual: paceLicenciaEsMensual,
});
