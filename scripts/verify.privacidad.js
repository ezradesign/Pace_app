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

function tandaPrivacidad(ctx) {
  console.log('\n[privacidad] Lo que privacy.html dice de /premium y de «Avísame» es lo que pasa');
  var leer = function (rel) { return fs.readFileSync(path.join(ctx.ROOT, rel), 'utf8'); };
  /* Las frases parten línea por cualquier sitio: se leen con los espacios juntados. */
  var privacy = leer('privacy.html').replace(/\s+/g, ' ');
  var conAnalitica = ANALITICA.test(leer(path.join('premium', 'index.html')));
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
}

var NO_CUBRE = [
  'privacidad: se cruza privacy.html con /premium (la analítica) y con «Avísame» (el año); lo del calendario y la compra lo prueba tests/privacidad-datos.spec.js, y si Cloudflare mete analítica desde su panel, eso no está en el repo',
];

module.exports = { tandaPrivacidad: tandaPrivacidad, NO_CUBRE: NO_CUBRE };
