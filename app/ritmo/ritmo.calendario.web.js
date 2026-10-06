/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ritmo.calendario.web.js — GOOGLE CALENDAR Y OUTLOOK DESDE LA WEB
   ============================================================
   La web habla DIRECTAMENTE con Google y con Microsoft desde el navegador: no
   hay servidor de PACE en medio y nada del calendario pasa por otro sitio. El
   permiso dura una hora (el pase que dan), vive solo en esta pestaña
   (sessionStorage) y no se renueva solo: al caducar, el siguiente «Añadir»
   vuelve a preguntar.

   EL PERMISO SE PIDE EN UNA VENTANA APARTE que vuelve a /calendario.html.
   Esa página no le habla a la app por `window.opener`: la página de Google o de
   Microsoft puede romper ese hilo (Cross-Origin-Opener-Policy), y entonces la
   app esperaría para siempre. Deja la respuesta en localStorage, que es del
   mismo origen, y la app la recoge con el evento `storage`. La ventana se
   abre DENTRO del clic (un navegador bloquea las que se abren después de
   esperar a algo), así que pedir permiso es lo primero que hace un destino.

     · Google: el pase va directo en la vuelta (flujo para apps de navegador).
       Permiso `calendar.events.owned`: ver y cambiar eventos de TUS calendarios.
     · Microsoft: un código que se cambia por el pase con PKCE (la app de una
       página no lleva secreto). Permiso `Calendars.ReadWrite`.

   LOS IDS DE CLIENTE SON PÚBLICOS (van en cualquier app de navegador). Mientras
   estén vacíos, el destino no aparece: los da Ez al dar de alta PACE en Google
   Cloud y en Microsoft Entra (docs/CALENDARIO_ALTAS.md).

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

/* Un objeto y no dos `var`: el build copia cada nombre a window al final de su
   IIFE, y una cadena copiada ya no es la misma. El objeto sí lo es, así que la
   suite puede poner unos ids de prueba. */
var CALENDARIO_IDS = { google: '', microsoft: '' };
var CALENDARIO_VUELTA_CLAVE = 'pace.calendario.vuelta';
var CALENDARIO_PASE_CLAVE = 'pace.calendario.pase';
/* El id de la propiedad privada con la que Outlook reconoce los eventos de PACE:
   un GUID propio de PACE y un nombre. No cambiar: es como se encuentran los
   eventos de días anteriores. */
var CALENDARIO_MS_PROP = 'String {7b3f2c1e-8d4a-4e6b-9a5c-2f1e0d9c8b7a} Name paceRitmo';

var CALENDARIO_PROVEEDORES = {
  google: {
    id: function () { return CALENDARIO_IDS.google; },
    url: function (o) {
      return 'https://accounts.google.com/o/oauth2/v2/auth?' + calendarioQuery({
        client_id: CALENDARIO_IDS.google, redirect_uri: o.vuelta, response_type: 'token', state: o.estado,
        scope: 'https://www.googleapis.com/auth/calendar.events.owned', include_granted_scopes: 'true',
      });
    },
  },
  microsoft: {
    id: function () { return CALENDARIO_IDS.microsoft; },
    url: function (o) {
      return 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?' + calendarioQuery({
        client_id: CALENDARIO_IDS.microsoft, redirect_uri: o.vuelta, response_type: 'code', response_mode: 'fragment',
        state: o.estado, scope: 'https://graph.microsoft.com/Calendars.ReadWrite', code_challenge: o.reto,
        code_challenge_method: 'S256', prompt: 'select_account',
      });
    },
  },
};

function calendarioQuery(o) {
  return Object.keys(o).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(o[k]); }).join('&');
}

function calendarioVuelta() {
  return location.origin + '/calendario.html';
}

/* ¿Se puede ofrecer este proveedor aquí? En la app de Android no: allí está el
   calendario del móvil, y Google no deja pedir permiso dentro de un WebView. */
function calendarioWebDisponible(prov) {
  try {
    var p = CALENDARIO_PROVEEDORES[prov];
    if (!p || !p.id()) return false;
    if (typeof paceEsAndroid === 'function' && paceEsAndroid()) return false;
    return location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  } catch (e) { return false; }
}

/* --- El pase --------------------------------------------------------------- */

function calendarioPaseGuardado(prov) {
  try {
    var todos = JSON.parse(sessionStorage.getItem(CALENDARIO_PASE_CLAVE) || '{}');
    var p = todos[prov];
    return p && p.token && p.caduca > Date.now() + 60000 ? p.token : null;
  } catch (e) { return null; }
}

function calendarioPaseGuardar(prov, token, segundos) {
  try {
    var todos = JSON.parse(sessionStorage.getItem(CALENDARIO_PASE_CLAVE) || '{}');
    if (token) todos[prov] = { token: token, caduca: Date.now() + (Number(segundos) || 3600) * 1000 };
    else delete todos[prov];
    sessionStorage.setItem(CALENDARIO_PASE_CLAVE, JSON.stringify(todos));
  } catch (e) {}
}

function calendarioAleatorio(n) {
  var a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
}

function calendarioBase64Url(buf) {
  var s = String.fromCharCode.apply(null, new Uint8Array(buf));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* Abre la ventana del permiso. SINCRONO hasta window.open (ver arriba). Devuelve
   una promesa con el pase. Errores: 'bloqueada' (el navegador no abrió la
   ventana), 'cerrada' (la persona la cerró), 'denegado'. */
function calendarioPedirPase(prov) {
  var p = CALENDARIO_PROVEEDORES[prov];
  var estado = calendarioAleatorio(16);
  var verificador = prov === 'microsoft' ? calendarioAleatorio(32) : null;
  var vuelta = calendarioVuelta();
  try { localStorage.removeItem(CALENDARIO_VUELTA_CLAVE); } catch (e) {}
  /* El reto de PKCE es asíncrono (SHA-256), y la ventana tiene que abrirse ya:
     se abre en blanco y se le pone la dirección en cuanto está. */
  var ventana = window.open(prov === 'google' ? p.url({ vuelta: vuelta, estado: estado }) : 'about:blank', 'pace-calendario', 'width=520,height=680');
  if (!ventana) return Promise.reject(new Error('bloqueada'));
  var lista = prov === 'microsoft'
    ? crypto.subtle.digest('SHA-256', new TextEncoder().encode(verificador)).then(function (h) {
        ventana.location.href = p.url({ vuelta: vuelta, estado: estado, reto: calendarioBase64Url(h) });
      })
    : Promise.resolve();
  return lista.then(function () { return calendarioEsperarVuelta(ventana, estado); }).then(function (params) {
    if (params.error) throw new Error('denegado');
    if (prov === 'google') {
      calendarioPaseGuardar(prov, params.access_token, params.expires_in);
      return params.access_token;
    }
    return fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: calendarioQuery({ client_id: CALENDARIO_IDS.microsoft, grant_type: 'authorization_code', code: params.code,
        redirect_uri: vuelta, code_verifier: verificador, scope: 'https://graph.microsoft.com/Calendars.ReadWrite' }),
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.access_token) throw new Error('denegado');
      calendarioPaseGuardar(prov, j.access_token, j.expires_in);
      return j.access_token;
    });
  });
}

function calendarioEsperarVuelta(ventana, estado) {
  return new Promise(function (resolver, rechazar) {
    var hecho = false;
    function leer() {
      var crudo = null;
      try { crudo = localStorage.getItem(CALENDARIO_VUELTA_CLAVE); } catch (e) {}
      if (!crudo) return false;
      var v = null;
      try { v = JSON.parse(crudo); } catch (e) {}
      var params = {};
      String((v && v.datos) || '').split('&').forEach(function (par) {
        var i = par.indexOf('=');
        if (i > 0) params[decodeURIComponent(par.slice(0, i))] = decodeURIComponent(par.slice(i + 1).replace(/\+/g, ' '));
      });
      if (params.state !== estado) return false;
      try { localStorage.removeItem(CALENDARIO_VUELTA_CLAVE); } catch (e) {}
      fin();
      resolver(params);
      return true;
    }
    function alCambiar(ev) { if (ev.key === CALENDARIO_VUELTA_CLAVE) leer(); }
    /* Una ventana cerrada sin respuesta: se mira un rato más por si la respuesta
       llegó justo al cerrarse. */
    var cerrada = 0;
    var reloj = setInterval(function () {
      if (leer()) return;
      var cerro = false;
      try { cerro = ventana.closed; } catch (e) {}
      if (cerro && ++cerrada > 3) { fin(); rechazar(new Error('cerrada')); }
    }, 500);
    function fin() {
      if (hecho) return;
      hecho = true;
      clearInterval(reloj);
      window.removeEventListener('storage', alCambiar);
    }
    window.addEventListener('storage', alCambiar);
  });
}

/* --- Las llamadas ----------------------------------------------------------- */

/* fetch con el pase. Un 401 borra el pase (caducó o se retiró) y falla con
   'pase': el siguiente «Añadir» pedirá permiso otra vez. */
function calendarioFetch(prov, token, url, opciones) {
  var o = Object.assign({ method: 'GET' }, opciones || {});
  o.headers = Object.assign({ Authorization: 'Bearer ' + token }, o.body ? { 'Content-Type': 'application/json' } : {},
    prov === 'microsoft' ? { Prefer: 'outlook.timezone="UTC"' } : {}, o.headers || {});
  return fetch(url, o).then(function (r) {
    if (r.status === 401) { calendarioPaseGuardar(prov, null); throw new Error('pase'); }
    if (!r.ok) throw new Error('red');
    return r.status === 204 ? null : r.json().catch(function () { return null; });
  });
}

var CALENDARIO_GOOGLE_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
var CALENDARIO_GRAPH = 'https://graph.microsoft.com/v1.0/me/';

/* Microsoft devuelve la hora en UTC sin zona ('2026-10-06T07:00:00.0000000'). */
function calendarioMsInstante(x) {
  var s = x && x.dateTime ? String(x.dateTime) : '';
  if (!s) return NaN;
  return Date.parse(/Z$|[+-]\d\d:\d\d$/.test(s) ? s : s.replace(/(\.\d{3})\d*$/, '$1') + 'Z');
}

/* Las reuniones entre dos instantes, sin los eventos de PACE, sin los de todo el
   día, sin los que marcas como libres y sin los que rechazaste: [{ inicio, fin }]. */
function calendarioWebReuniones(prov, token, desde, hasta) {
  var a = new Date(desde).toISOString(), b = new Date(hasta).toISOString();
  if (prov === 'google') {
    return calendarioFetch(prov, token, CALENDARIO_GOOGLE_API + '?' + calendarioQuery({ timeMin: a, timeMax: b, singleEvents: 'true', maxResults: '250' }))
      .then(function (j) {
        return ((j && j.items) || []).filter(function (e) {
          if (!e.start || !e.start.dateTime || e.status === 'cancelled' || e.transparency === 'transparent') return false;
          if (e.extendedProperties && e.extendedProperties.private && e.extendedProperties.private.pace) return false;
          var yo = (e.attendees || []).filter(function (x) { return x.self; })[0];
          return !(yo && yo.responseStatus === 'declined');
        }).map(function (e) { return { inicio: Date.parse(e.start.dateTime), fin: Date.parse(e.end.dateTime) }; });
      });
  }
  return calendarioFetch(prov, token, CALENDARIO_GRAPH + 'calendarView?' + calendarioQuery({
    startDateTime: a, endDateTime: b, $top: '250', $select: 'start,end,showAs,isAllDay,isCancelled,responseStatus',
    $expand: "singleValueExtendedProperties($filter=id eq '" + CALENDARIO_MS_PROP + "')",
  })).then(function (j) {
    return ((j && j.value) || []).filter(function (e) {
      if (e.isAllDay || e.isCancelled || e.showAs === 'free' || e.showAs === 'workingElsewhere') return false;
      if ((e.singleValueExtendedProperties || []).length) return false;
      return !(e.responseStatus && e.responseStatus.response === 'declined');
    }).map(function (e) { return { inicio: calendarioMsInstante(e.start), fin: calendarioMsInstante(e.end) }; });
  });
}

/* Borra los eventos de PACE del día `iso` que aún no han acabado a `ahoraMs`.
   Devuelve cuántos. Los ya pasados se quedan: son lo que hiciste. */
function calendarioWebBorrar(prov, token, iso, ahoraMs) {
  if (prov === 'google') {
    return calendarioFetch(prov, token, CALENDARIO_GOOGLE_API + '?' + calendarioQuery({
      privateExtendedProperty: 'paceDia=' + iso, singleEvents: 'true', maxResults: '100',
    })).then(function (j) {
      var ids = ((j && j.items) || []).filter(function (e) { return e.end && Date.parse(e.end.dateTime) > ahoraMs; }).map(function (e) { return e.id; });
      return Promise.all(ids.map(function (id) {
        return calendarioFetch(prov, token, CALENDARIO_GOOGLE_API + '/' + encodeURIComponent(id), { method: 'DELETE' });
      })).then(function () { return ids.length; });
    });
  }
  return calendarioFetch(prov, token, CALENDARIO_GRAPH + 'events?' + calendarioQuery({
    $filter: "singleValueExtendedProperties/Any(ep: ep/id eq '" + CALENDARIO_MS_PROP + "' and ep/value eq '" + iso + "')",
    $select: 'id,end', $top: '100',
  })).then(function (j) {
    var ids = ((j && j.value) || []).filter(function (e) { return calendarioMsInstante(e.end) > ahoraMs; }).map(function (e) { return e.id; });
    return Promise.all(ids.map(function (id) {
      return calendarioFetch(prov, token, CALENDARIO_GRAPH + 'events/' + encodeURIComponent(id), { method: 'DELETE' });
    })).then(function () { return ids.length; });
  });
}

/* Crea un evento de PACE: ocupado, sin recordatorios y marcado con su día. */
function calendarioWebCrear(prov, token, iso, ev) {
  var a = new Date(ev.inicio).toISOString(), b = new Date(ev.fin).toISOString();
  if (prov === 'google') {
    return calendarioFetch(prov, token, CALENDARIO_GOOGLE_API, { method: 'POST', body: JSON.stringify({
      summary: ev.titulo, description: ev.texto, start: { dateTime: a }, end: { dateTime: b },
      transparency: 'opaque', reminders: { useDefault: false, overrides: [] },
      extendedProperties: { private: { pace: 'ritmo', paceDia: iso } },
    }) });
  }
  return calendarioFetch(prov, token, CALENDARIO_GRAPH + 'events', { method: 'POST', body: JSON.stringify({
    subject: ev.titulo, body: { contentType: 'text', content: ev.texto },
    start: { dateTime: a.replace(/Z$/, ''), timeZone: 'UTC' }, end: { dateTime: b.replace(/Z$/, ''), timeZone: 'UTC' },
    showAs: 'busy', isReminderOn: false,
    singleValueExtendedProperties: [{ id: CALENDARIO_MS_PROP, value: iso }],
  }) });
}

Object.assign(window, {
  CALENDARIO_IDS, CALENDARIO_PROVEEDORES, calendarioWebDisponible, calendarioPaseGuardado, calendarioPaseGuardar, calendarioPedirPase,
  calendarioWebReuniones, calendarioWebBorrar, calendarioWebCrear, calendarioMsInstante,
});
