/**
 * verify.privacidad.js - PACE · red de seguridad LOCAL · LO QUE PRIVACY.HTML DICE DE LA WEB
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como una tanda más.
 *
 * QUÉ VIGILA. `privacy.html` es pública (la cita Play) y prometía que /premium contaba sus
 * visitas cuando aún no llevaba la analítica (P4, 22 oct.). Una frase así no la defiende una
 * nota: la defiende que el verify mire las dos cosas a la vez (s155).
 *   · /premium y la analítica: si `premium/index.html` lleva el fragmento de Cloudflare Web
 *     Analytics, privacy.html tiene que decirlo en los dos idiomas y no decir que no la hay;
 *     sin el fragmento, privacy.html no puede decir que la página cuenta visitas.
 *   · «Avísame»: privacy.html promete que cada correo se borra al año, y la función tiene que
 *     guardarlo con esa caducidad (`AVISAME_CADUCA_S`, 365 días).
 *   · El calendario del móvil: privacy.html promete que lo que PACE escribe ahí va privado, y
 *     para eso PaceCalendario tiene que poner `ACCESS_PRIVATE`, MainActivity registrarlo y
 *     PACE llamarlo al crear y al cambiar. Si falta una pieza, privacy.html tiene que decir que
 *     ahí cada pausa va con su nombre; y si están todas, no puede decirlo.
 *
 *   · Lo que cargan las páginas publicadas (todo HTML de dist/, scripts/web-dist.js): ninguna trae
 *     nada de otro sitio (un script, una hoja de estilo, una fuente, una imagen) fuera de
 *     ORIGENES_PERMITIDOS, y la analítica solo puede ir en /premium, que es la que privacy.html
 *     nombra (la octava, nº 26: antes solo se miraba /premium, y la landing, /beta o /gracias
 *     podían contar visitas con privacy.html diciendo que ninguna página lo hace).
 *   Las piezas del calendario se buscan sin comentarios: una línea comentada no cuenta.
 *
 * NO CUBRE: lo demás que dice privacy.html (el calendario, la compra) lo defienden las
 * pruebas del navegador (tests/privacidad-datos.spec.js); y si Cloudflare mete su analítica
 * por su cuenta en el proyecto de Pages, eso no está en el repo.
 */

'use strict';

var fs = require('fs');
var path = require('path');

var ANALITICA = /cloudflareinsights\.com|data-cf-beacon/;
var DICE_SI = [/con la analítica de Cloudflare/, /with Cloudflare's analytics/];
var DICE_NO = [/ninguna página de PACE cuenta sus visitas/, /no PACE page counts its visits/];
var DICE_ANO = [/se borra solo al año de apuntarte/, /a year after you sign up/];
var DICE_CON_NOMBRE = [/En el calendario del móvil, por ahora, cada pausa va con su nombre/, /In your phone's calendar, for now, each break keeps its name/];
var DICE_PRIVADO_MOVIL = [/no lee qué pausa es\. También en el calendario del móvil\./, /cannot read which break it is\. Also in your phone's calendar\./];
var JAVA = path.join('android', 'app', 'src', 'main', 'java', 'com', 'ezradesign', 'pace');
/* Lo único de fuera que una página publicada puede cargar, y dónde: hoy, nada. La analítica de
   Cloudflare, si vuelve, solo en /premium (y privacy.html tiene que decirlo, arriba). */
var ORIGENES_PERMITIDOS = { 'static.cloudflareinsights.com': ['premium/index.html'] };

/* Sin comentarios de bloque ni de línea (sin tocar `https://` dentro de una cadena). */
function sinComentarios(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"])\/\/.*$/gm, '$1');
}

/* Los orígenes de fuera que carga una página: lo que piden script, link, img, iframe, source, video y
   audio, y los url() de su CSS. Un enlace (<a href>) no carga nada: no cuenta. */
function origenesDeFuera(html) {
  var src = html.replace(/<!--[\s\S]*?-->/g, '');
  var out = [], x;
  var re = /<(script|link|img|iframe|source|video|audio)\b[^>]*?\b(?:src|href|srcset)\s*=\s*["'](?:https?:)?\/\/([^\/"'\s]+)/gi;
  while ((x = re.exec(src))) out.push(x[2].toLowerCase());
  var reCss = /url\(\s*['"]?(?:https?:)?\/\/([^\/'")\s]+)/gi;
  while ((x = reCss.exec(src))) out.push(x[1].toLowerCase());
  return out;
}

function tandaPrivacidad(ctx) {
  console.log('\n[privacidad] Lo que privacy.html dice de /premium y de «Avísame» es lo que pasa');
  var leer = function (rel) { return fs.readFileSync(path.join(ctx.ROOT, rel), 'utf8'); };
  /* Las frases parten línea por cualquier sitio: se leen con los espacios juntados. */
  var privacy = leer('privacy.html').replace(/\s+/g, ' ');
  var conAnalitica = ANALITICA.test(leer(path.join('premium', 'index.html')));

  var publicadas = require('./web-dist.js').listaWeb().filter(function (r) { return /\.html$/.test(r); });
  var ajenos = [], conVisitas = [];
  publicadas.forEach(function (pag) {
    var html = leer(pag);
    if (pag !== 'premium/index.html' && ANALITICA.test(html.replace(/<!--[\s\S]*?-->/g, ''))) conVisitas.push(pag);
    origenesDeFuera(html).forEach(function (o) {
      if ((ORIGENES_PERMITIDOS[o] || []).indexOf(pag) < 0) ajenos.push(pag + ' → ' + o);
    });
  });
  if (conVisitas.length) ctx.falla('lleva(n) la analítica de Cloudflare y privacy.html solo habla de /premium: ' + conVisitas.join(', '));
  else if (ajenos.length) ctx.falla('página(s) publicada(s) que cargan algo de otro sitio (fuera de ORIGENES_PERMITIDOS, scripts/verify.privacidad.js): ' + ajenos.slice(0, 5).join(', '));
  else ctx.ok(publicadas.length + ' páginas publicadas: ninguna carga nada de otro sitio ni cuenta visitas fuera de /premium');
  var diceSi = DICE_SI.every(function (re) { return re.test(privacy); });
  var diceNo = DICE_NO.some(function (re) { return re.test(privacy); });
  var algunSi = DICE_SI.some(function (re) { return re.test(privacy); });
  if (conAnalitica && (!diceSi || diceNo)) {
    ctx.falla('premium/index.html lleva la analítica de Cloudflare y privacy.html no lo dice en los dos idiomas (o dice que no la hay): cambia la frase de #avisame y #avisame-en.');
  } else if (!conAnalitica && algunSi) {
    ctx.falla('privacy.html dice que /premium cuenta visitas con la analítica de Cloudflare, y premium/index.html no la lleva.');
  } else {
    ctx.ok(conAnalitica ? '/premium cuenta visitas y privacy.html lo dice' : '/premium no cuenta visitas y privacy.html no dice que las cuente');
  }

  var funcion = leer(path.join('functions', 'api', 'avisame.js'));
  var conAno = /AVISAME_CADUCA_S = 365 \* 24 \* 60 \* 60;/.test(funcion) && /expirationTtl: AVISAME_CADUCA_S/.test(funcion);
  var diceAno = DICE_ANO.every(function (re) { return re.test(privacy); });
  if (diceAno !== conAno) {
    ctx.falla(diceAno
      ? 'privacy.html promete que cada correo de «Avísame» se borra al año, y functions/api/avisame.js no lo guarda con esa caducidad.'
      : 'functions/api/avisame.js borra cada correo al año, y privacy.html no lo dice en los dos idiomas.');
  } else if (conAno) {
    ctx.ok('«Avísame» guarda cada correo un año, como dice privacy.html');
  } else {
    ctx.info('«Avísame» sin caducidad, y privacy.html no promete ninguna');
  }

  /* Las cuatro piezas de lo privado en el calendario del móvil. */
  var pieza = sinComentarios(leer(path.join(JAVA, 'PaceCalendario.java')));
  var actividad = sinComentarios(leer(path.join(JAVA, 'MainActivity.java')));
  var puente = sinComentarios(leer(path.join('app', 'ui', 'android.calendario.js')));
  var destinos = sinComentarios(leer(path.join('app', 'ritmo', 'ritmo.calendario.destinos.js')));
  var piezas = [
    ['PaceCalendario.java pone ACCESS_PRIVATE', /@CapacitorPlugin\(name = "PaceCalendario"\)/.test(pieza) &&
      /put\(CalendarContract\.Events\.ACCESS_LEVEL, CalendarContract\.Events\.ACCESS_PRIVATE\)/.test(pieza)],
    ['MainActivity registra PaceCalendario', /registerPlugin\(PaceCalendario\.class\)/.test(actividad)],
    ['android.calendario.js le pide «privado»', /paceAndroidPedir\('PaceCalendario', 'privado'/.test(puente)],
    ['PACE lo llama al crear y al cambiar', (destinos.match(/return paceAndroidCalendarioPrivado\(id\)/g) || []).length === 2],
  ];
  var faltan = piezas.filter(function (p) { return !p[1]; }).map(function (p) { return p[0]; });
  var conNombre = DICE_CON_NOMBRE.some(function (re) { return re.test(privacy); });
  var privadoDicho = DICE_PRIVADO_MOVIL.every(function (re) { return re.test(privacy); });
  if (!faltan.length && conNombre) {
    ctx.falla('PACE ya marca privado lo que escribe en el calendario del móvil, y privacy.html sigue diciendo que ahí cada pausa va con su nombre.');
  } else if (!faltan.length && !privadoDicho) {
    ctx.falla('PACE marca privado lo que escribe en el calendario del móvil y privacy.html no lo dice en los dos idiomas.');
  } else if (faltan.length && !conNombre) {
    ctx.falla('privacy.html no avisa de que en el calendario del móvil cada pausa va con su nombre, y falta: ' + faltan.join('; ') + '.');
  } else {
    ctx.ok(faltan.length ? 'en el calendario del móvil cada pausa va con su nombre, y privacy.html lo dice'
      : 'lo que PACE escribe en el calendario del móvil va privado, y privacy.html lo dice');
  }
}

var NO_CUBRE = [
  'privacidad: se cruza privacy.html con /premium (la analítica) y con lo que cargan todas las páginas publicadas (los orígenes de fuera, en el HTML: un fetch() a otro sitio desde un script no se ve), con «Avísame» (el año) y con lo privado del calendario del móvil (sus cuatro piezas, leídas, no ejecutadas: que Google lo suba privado se mira en un móvil); lo demás del calendario y la compra lo prueba tests/privacidad-datos.spec.js, y si Cloudflare mete analítica desde su panel, eso no está en el repo',
];

module.exports = { tandaPrivacidad: tandaPrivacidad, NO_CUBRE: NO_CUBRE };
