/* PACE · scripts/audit/banco-pill-movil.js (sesion 168)
   ¿A partir de que altura de movil cabe la pill de Foco/Pausa/Larga SIN MOVER
   NADA? El umbral se MIDE, no se elige a ojo: en s167 el aire de las tarjetas
   parecia cosmetico a 1280 y era el 55 % de la tarjeta a 320.

   Uso:  node .claude/static-server.js   (en otra consola)
         node scripts/audit/banco-pill-movil.js

   QUE SE MIDE, y por que no solo el alto
   --------------------------------------
   La pill esta DENTRO de [data-pace-topbar], que es una fila flex con el logo
   y los iconos. Asi que la restriccion puede ser HORIZONTAL y no vertical, y
   el encargo hablaba solo de alturas. Se mide en las cinco alturas reales de
   movil y en tres anchos, dos veces por combinacion: con la pill oculta (como
   esta hoy, regla de s46 en _responsive.pieles.js) y forzada visible.

   «SIN MOVER NADA» = ninguna de estas cambia al mostrarla:
     · el diametro del aro (--pace-timer-d)
     · el desbordamiento vertical del cuerpo
     · el alto de la topbar
     · la posicion del primer bloque bajo el aro
   Y ademas la pill tiene que caber ENTERA en su fila, sin comprimirse y sin
   que la fila desborde a lo ancho.

   La sonda y la espera se CONSUMEN de tests/home.helpers.js: el motor de
   geometria publica MAS DE UNA VEZ y esperar milisegundos fijos mide a media
   convergencia (s160: el aro leido a destiempo daba su valor de partida). */
'use strict';

const { chromium } = require('playwright');
const { CLAVE_ESTADO, SEMILLA } = require('../../tests/helpers.js');
const { sonda, px, asentarGeometria } = require('../../tests/home.helpers.js');

/* Por defecto, las cinco alturas reales de movil del encargo y tres anchos.
   Se pueden pasar otros para barrer: `--anchos 320,480,600 --alturas 844`. */
const arg = (nombre, porDefecto) => {
  const i = process.argv.indexOf(nombre);
  return (i > -1 && process.argv[i + 1])
    ? process.argv[i + 1].split(',').map(n => parseInt(n, 10)) : porDefecto;
};
const ALTURAS = arg('--alturas', [568, 667, 736, 844, 932]);
const ANCHOS = arg('--anchos', [320, 375, 414]);
const BASE = 'http://localhost:8765/index.html';

/* Se muestra por CSS inyectado al final, que gana al !important de la piel por
   orden de cascada. No se toca el archivo: el banco mide, no decide. */
const MOSTRAR = '[data-pace-topbar] [data-pace-tabs] { display: flex !important; }';

/* `css` es la HOJA a inyectar, o null para medir la app tal cual. La primera
   version recibia un booleano y hacia `mostrar ? MOSTRAR : null`, asi que al
   pasarle una hoja distinta la tiraba y medía otra vez lo mismo: la tabla de la
   fila propia salio identica a la de arriba y parecia decir «no encoge nada». */
async function medir(page, css) {
  await page.evaluate((hoja) => {
    const previo = document.getElementById('banco-pill');
    if (previo) previo.remove();
    if (hoja) {
      const s = document.createElement('style');
      s.id = 'banco-pill';
      s.textContent = hoja;
      document.head.appendChild(s);
    }
  }, css || null);
  await asentarGeometria(page);
  const s = await sonda(page);
  const extra = await page.evaluate(() => {
    const q = sel => document.querySelector(sel);
    const top = q('[data-pace-topbar]');
    const tabs = q('[data-pace-topbar] [data-pace-tabs]');
    const rt = top ? top.getBoundingClientRect() : null;
    const rp = tabs ? tabs.getBoundingClientRect() : null;
    const vis = tabs ? getComputedStyle(tabs).display !== 'none' : false;
    /* Lo que la pill ocupa de verdad, no lo que su caja dice: si la fila la
       comprime, scrollWidth es mayor que el ancho pintado. */
    return {
      topbarAlto: rt ? +rt.height.toFixed(1) : null,
      topbarDesbordeH: top ? top.scrollWidth - top.clientWidth : null,
      pillVisible: vis,
      pillAncho: (rp && vis) ? +rp.width.toFixed(1) : null,
      pillAlto: (rp && vis) ? +rp.height.toFixed(1) : null,
      pillPideAncho: (tabs && vis) ? tabs.scrollWidth : null,
      pillComprimida: (tabs && vis) ? tabs.scrollWidth > Math.ceil(rp.width) + 1 : null,
      squeeze: getComputedStyle(document.documentElement).getPropertyValue('--pace-home-squeeze').trim(),
      /* LO QUE DE VERDAD PUEDE FALLAR. La pill es `position:absolute` centrada
         con translate(-50%,-50%) (TopBar.jsx:46-48), o sea que esta FUERA DE
         FLUJO: no puede empujar, no puede encoger a nadie y no puede cambiar el
         alto de la fila. Por eso «no se mueve nada» sale limpio hasta a 320 px
         y no significa que quepa: significa que la pregunta era otra. Lo que si
         puede pasar es que SE SOLAPE con el logo o con los iconos, y eso no es
         reflujo, asi que hay que medirlo cruzando rectangulos. */
      solapes: (rp && vis) ? [...document.querySelectorAll('[data-pace-topbar] > *')]
        .filter(el => el !== tabs)
        .map(el => {
          const r = el.getBoundingClientRect();
          const cruceX = Math.min(r.right, rp.right) - Math.max(r.left, rp.left);
          const cruceY = Math.min(r.bottom, rp.bottom) - Math.max(r.top, rp.top);
          const nombre = el.getAttribute('data-pace-topbar-icon') != null ? 'icono'
            : (el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '' : ''));
          return (cruceX > 0.5 && cruceY > 0.5) ? (nombre + ' ' + Math.round(cruceX) + 'px') : null;
        }).filter(Boolean) : [],
      /* Hueco libre a cada lado de la pill dentro de la fila. */
      huecoIzq: rp ? +(rp.left - rt.left).toFixed(1) : null,
      huecoDer: rp ? +(rt.right - rp.right).toFixed(1) : null,
    };
  });
  return Object.assign({}, s, extra);
}

function primerBloque(m) {
  if (m.spc) return m.spc.top;
  if (m.act) return m.act.top;
  return null;
}

function loQueSeMueve(f) {
  const mueve = [];
  const aroSin = px(f.sin.D), aroCon = px(f.con.D);
  if (aroSin !== aroCon) mueve.push('aro ' + aroSin + '->' + aroCon);
  if (f.sin.desbordeV !== f.con.desbordeV) mueve.push('desbordeV ' + f.sin.desbordeV + '->' + f.con.desbordeV);
  if (Math.abs(f.sin.topbarAlto - f.con.topbarAlto) > 0.5) mueve.push('topbar ' + f.sin.topbarAlto + '->' + f.con.topbarAlto);
  const t1 = primerBloque(f.sin), t2 = primerBloque(f.con);
  if (t1 != null && t2 != null && Math.abs(t1 - t2) > 0.5) mueve.push('bloque ' + t1 + '->' + t2);
  return mueve;
}

(async () => {
  const b = await chromium.launch();
  const filas = [];
  for (const ancho of ANCHOS) {
    for (const alto of ALTURAS) {
      const ctx = await b.newContext({ viewport: { width: ancho, height: alto },
        deviceScaleFactor: 2, locale: 'es-ES' });
      await ctx.addInitScript(([k, s]) => localStorage.setItem(k, JSON.stringify(s)),
        [CLAVE_ESTADO, Object.assign({}, SEMILLA, {
          _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
          _historyMigrated: true, lastActiveDay: new Date().toDateString(),
        })]);
      const page = await ctx.newPage();
      await page.goto(BASE);
      await page.waitForSelector('[data-pace-home-body]', { timeout: 15000 });
      const sin = await medir(page, null);
      const con = await medir(page, MOSTRAR);
      /* TERCERA MEDIDA · LO QUE COSTARIA LA ALTERNATIVA. Como la pill esta fuera
         de flujo, sacarla del solape pasa por darle su propia linea, y eso SI
         gasta alto. No se maqueta aqui —eso es una decision, no una medida—: se
         simula creciendo la fila lo que mide la pill y se mira que hace el aro. */
      const fila = con.pillAlto
        ? await medir(page, MOSTRAR + ' [data-pace-topbar] { min-height: calc(' +
            con.topbarAlto + 'px + ' + (con.pillAlto + 8) + 'px) !important; }')
        : null;
      /* GUARDS DE CERO Y DE SENTIDO: sin aro no se ha medido nada, y si la pill
         ya se viera sola el banco estaria comparando dos veces lo mismo. */
      if (!sin.hayDial || !con.hayDial) {
        console.error('BANCO ROTO: no hay aro a ' + ancho + 'x' + alto); process.exit(1);
      }
      if (sin.pillVisible) {
        console.error('BANCO ROTO: la pill ya se ve sin forzarla a ' + ancho + 'x' + alto); process.exit(1);
      }
      if (!con.pillVisible) {
        console.error('BANCO ROTO: no he conseguido mostrarla a ' + ancho + 'x' + alto); process.exit(1);
      }
      filas.push({ ancho, alto, sin, con, fila });
      await ctx.close();
    }
  }
  if (!filas.length) { console.error('BANCO ROTO: cero medidas'); process.exit(1); }

  console.log('');
  console.log('  ancho x alto | aro sin->con | topbar sin->con | desbV | pill | hueco izq/der | SOLAPA CON | mueve');
  console.log('  -------------+--------------+-----------------+-------+------+---------------+------------+------');
  for (const f of filas) {
    const mueve = loQueSeMueve(f);
    console.log(
      '  ' + String(f.ancho).padStart(5) + ' x' + String(f.alto).padStart(5) + ' |' +
      String(px(f.sin.D)).padStart(6) + '->' + String(px(f.con.D)).padEnd(6) + '|' +
      String(f.sin.topbarAlto).padStart(8) + '->' + String(f.con.topbarAlto).padEnd(7) + '|' +
      String(f.sin.desbordeV).padStart(4) + '/' + String(f.con.desbordeV).padEnd(2) + '|' +
      String(f.con.pillPideAncho).padStart(5) + ' |' +
      String(f.con.huecoIzq).padStart(7) + ' /' + String(f.con.huecoDer).padStart(6) + ' | ' +
      (f.con.solapes.length ? f.con.solapes.join(', ').padEnd(10) : '-- nada --') + ' | ' +
      (mueve.length ? mueve.join(' · ') : '--'));
  }
  console.log('');
  /* El criterio COMPLETO: ni mueve, ni se comprime, ni desborda la fila, ni se
     solapa con nadie. Sin la ultima condicion el veredicto sale limpio siempre,
     porque una caja fuera de flujo nunca mueve nada. */
  const limpia = f => !loQueSeMueve(f).length && f.con.pillComprimida === false &&
                      f.con.topbarDesbordeH <= 0 && f.con.solapes.length === 0;
  for (const ancho of ANCHOS) {
    const suyas = filas.filter(f => f.ancho === ancho && limpia(f)).map(f => f.alto).sort((a, b) => a - b);
    console.log('  ancho ' + ancho + ': entra limpia ' +
      (suyas.length ? 'desde ' + suyas[0] + ' px  (' + suyas.join(', ') + ')' : 'en NINGUNA de las alturas probadas'));
  }
  console.log('');
  console.log('  SI LA PILL TUVIERA SU PROPIA LINEA (fila +' + (filas[0].con.pillAlto + 8) + ' px)');
  console.log('  ancho x alto | aro con->fila propia | desbordeV | encoge el aro');
  console.log('  -------------+----------------------+-----------+---------------');
  for (const f of filas) {
    if (!f.fila) continue;
    const a1 = px(f.con.D), a2v = px(f.fila.D);
    console.log('  ' + String(f.ancho).padStart(5) + ' x' + String(f.alto).padStart(5) + ' |' +
      String(a1).padStart(11) + ' ->' + String(a2v).padStart(8) + ' |' +
      String(f.fila.desbordeV).padStart(10) + ' | ' +
      (a1 === a2v ? 'no' : 'SI, ' + (a1 - a2v) + ' px menos'));
  }
  console.log('');
  const todas = filas.filter(limpia).length;
  console.log('');
  console.log('  limpias ' + todas + ' de ' + filas.length + ' combinaciones.');
  await b.close();
})();
