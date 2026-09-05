/* REVISION A TAMAÑO REAL DEL ARO EN ESCRITORIO (s185).
   =====================================================
   La leccion de s147: la revision al tamaño real ES el detector. En s184-s185
   lo confirmo tres veces seguidas -- la bola pegada a la tarjeta, el halo
   «recortado de forma rara» y el numero «un poco alto» los vio el usuario, no
   la suite, y los tres eran ciertos y medibles DESPUES de verlos.

   QUE HACE: fotografia la home con una sesion viva en los nueve viewports de
   escritorio que este proyecto ha usado, y escribe UNA pagina HTML
   autocontenida con las capturas a su tamaño y, debajo de cada una, los numeros
   que gobiernan lo que se ve. La pagina no interpreta: solo pone la imagen y su
   medida al lado, para que si algo canta se pueda decir cual es el numero.

   POR QUE CON SESION VIVA: sin ella `--pace-on` vale 0 y no hay ni halo ni
   arco, o sea que la mitad de lo que hay que revisar no existe. Se avanza a la
   mitad del bloque, que es donde s159 puso el maximo de luz.

   POR QUE LAS CAPTURAS SE ESCALAN PARA CABER: en s182 el usuario reporto un
   corte a 375 px que resulto ser del CARRUSEL de la pagina de revision, no del
   producto. Una maqueta que recorta miente sobre lo que enseña. **La primera
   version de esta pagina volvio a caer en lo mismo** por creer que dar scroll a
   cada figura bastaba: una barra de scroll NO es enseñar la captura entera, y de
   1536 px para arriba se veian cortadas. Ahora cada una se ajusta al ancho
   disponible -- sin ampliar nunca por encima de 1:1, que seria mentir en la otra
   direccion-- y hay un interruptor para verlas a tamaño real.

   Uso:  node scripts/audit/revision-aro-s185.js <salida.html>
   Necesita el preview en localhost:8765. Solo lee. */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');
const sharp = require('sharp');
/* La semilla y la clave se CONSUMEN de la suite, no se copian: `firstSeen` es
   lo unico que separa la home del onboarding (helpers.js:16) y copiarlo a mano
   ya mando una revision entera al onboarding en s167. */
const { CLAVE_ESTADO, SEMILLA } = require('../../tests/helpers.js');

const SALIDA = process.argv[2];
if (!SALIDA) { console.error('uso: node scripts/audit/revision-aro-s185.js <salida.html>'); process.exit(2); }

/* Los nueve de escritorio que este proyecto ha ido usando en sus bancos. Los
   dos ultimos NO son decorativos: 1366x610 es donde el aro esta limitado por
   ALTURA (y por tanto donde el margen del halo se lo come el propio aro), y
   2560x1440 es donde el aro topa con D_MAX y sobra sitio por todas partes. */
const VISTAS = [
  { w: 1280, h: 720 }, { w: 1280, h: 800 }, { w: 1366, h: 768 },
  { w: 1440, h: 900 }, { w: 1536, h: 864 }, { w: 1600, h: 900 },
  { w: 1920, h: 1080 }, { w: 1366, h: 610 }, { w: 2560, h: 1440 },
];

const SIN_LUZ = '[data-pace-sun]::before,[data-pace-sun]::after{opacity:0 !important}'
  + '[data-pace-home-body] [data-pace-activitybar-chip]{filter:none !important}'
  + '[data-pace-home-body] [data-pace-activitybar-chip]::after,'
  + '[data-pace-home-body] [data-pace-spc-card]::after{opacity:0 !important}';

/* Bandas de tinta CONTIGUAS en la columna del aro. Se hace asi y no por caja
   por dos razones medidas: el `lineHeight: 0.9` del numero deja ~42 px de aire
   muerto sobre los glifos (la caja decia 10,9 px de separacion donde la tinta
   media 53), y una ventana por elemento se contamina con el vecino en cuanto
   dos cosas se acercan -- paso, y dio una distancia NEGATIVA. */
function bandasDeTinta(data, width, channels, e, desde, hasta, izq, der) {
  const filas = [];
  for (let y = Math.round(desde * e); y <= Math.round(hasta * e); y++) {
    let hay = false;
    for (let x = Math.round(izq * e); x < Math.round(der * e); x++) {
      const o = (y * width + x) * channels;
      if (data[o] < 150 && data[o + 1] < 150) { hay = true; break; }
    }
    filas.push(hay);
  }
  const bandas = [];
  let ini = null;
  filas.forEach((h, i) => {
    if (h && ini === null) ini = i;
    if (!h && ini !== null) { bandas.push([ini, i - 1]); ini = null; }
  });
  if (ini !== null) bandas.push([ini, filas.length - 1]);
  return bandas.map(([a, z]) => [desde + a / e, desde + z / e]);
}

/* Desviacion maxima sobre 255 en una banda de filas, entre dos capturas.
   LAS DOS CAPTURAS SON DEL MISMO FOTOGRAMA, con el reloj congelado y apagando
   solo las capas de luz: restar «sesion apagada» contra «sesion viva» mide
   tambien los digitos y el CTA, y da picos de 211 en la banda del numero. */
function desviacion(A, B, width, channels, e, y0, y1) {
  let mx = 0;
  for (let y = Math.max(0, Math.round(y0 * e)); y <= Math.round(y1 * e); y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * channels;
      const d = Math.max(Math.abs(A[o] - B[o]), Math.abs(A[o + 1] - B[o + 1]), Math.abs(A[o + 2] - B[o + 2]));
      if (d > mx) mx = d;
    }
  }
  return mx;
}

(async () => {
  const navegador = await chromium.launch();
  const fichas = [];
  for (const v of VISTAS) {
    const ctx = await navegador.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: 2, locale: 'es-ES' });
    await ctx.addInitScript(([clave, estado]) => {
      if (!localStorage.getItem(clave)) localStorage.setItem(clave, JSON.stringify(estado));
    }, [CLAVE_ESTADO, Object.assign({}, SEMILLA, { focusMinutes: 15 })]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:8765/index.html');
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await page.waitForTimeout(1900);

    await page.clock.install();
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await page.clock.fastForward(7 * 60 * 1000);   /* mitad del bloque: maximo de luz */
    await page.waitForTimeout(2400);

    const g = await page.evaluate(() => {
      const q = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
      const d = q('[data-pace-dial-fit]'); const D = d.height;
      const cs = getComputedStyle(document.querySelector('[data-pace-dial-fit]'));
      const corte = parseFloat(cs.getPropertyValue('--pace-corte'));
      const p45 = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '45').getBoundingClientRect();
      const chip = q('[data-pace-activitybar-chip]'); const act = q('[data-pace-activitybar]');
      const ciclo = [...document.querySelectorAll('[data-pace-dial-fit] *')]
        .filter(e => /^CICLO/i.test((e.textContent || '').trim()) && e.children.length === 0).pop().getBoundingClientRect();
      const lab = q('[data-pace-dial-label]'); const sub = q('[data-pace-dial-subtitle]');
      const body = document.querySelector('[data-pace-home-body]');
      const R = 0.475 * D; const ang = Math.asin((D / 2 - corte) / R);
      const pista = document.querySelector('[data-pace-dial-pista] circle');
      return {
        D: +D.toFixed(0), corte,
        barrido: +parseFloat((pista.getAttribute('stroke-dasharray') || '').split(' ')[0]).toFixed(1),
        aroArriba: d.top + 0.025 * D, filaBottom: p45.bottom, filaTop: p45.top,
        caboY: d.top + D / 2 + R * Math.sin(ang), chipTop: chip.top, halo: 0.017 * D,
        huecoCiclo: +(act.top - ciclo.bottom).toFixed(1),
        desde: lab.top - 6, hasta: sub.bottom + 6,
        izq: Math.max(lab.left, d.left + D * 0.2), der: Math.min(lab.right, d.right - D * 0.2),
        desborde: body.scrollHeight - body.clientHeight,
        desbordeH: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    const conLuz = await page.screenshot();
    await page.evaluate((css) => {
      const s = document.createElement('style'); s.id = 'pace-sin-luz'; s.textContent = css; document.head.appendChild(s);
    }, SIN_LUZ);
    await page.waitForTimeout(250);
    const sinLuz = await page.screenshot();
    await page.evaluate(() => { const s = document.getElementById('pace-sin-luz'); if (s) s.remove(); });

    const A = await sharp(conLuz).raw().toBuffer({ resolveWithObject: true });
    const B = await sharp(sinLuz).raw().toBuffer();
    const { width, channels } = A.info; const e = 2;

    const bandas = bandasDeTinta(A.data, width, channels, e, g.desde, g.hasta, g.izq, g.der);
    let tintaArriba = null, tintaAbajo = null;
    if (bandas.length >= 3) {
      const L = bandas[0], N = bandas[1], S = bandas[bandas.length - 1];
      tintaArriba = +(N[0] - L[1]).toFixed(1);
      tintaAbajo = +(S[0] - N[1]).toFixed(1);
    }

    fichas.push({
      vp: v.w + '×' + v.h, w: v.w,
      D: g.D, corte: g.corte, barrido: g.barrido,
      aroFila: +(g.aroArriba - g.filaBottom).toFixed(1),
      haloArriba: desviacion(A.data, B, width, channels, e, g.aroArriba - 12, g.aroArriba),
      fila: desviacion(A.data, B, width, channels, e, g.filaTop - 6, g.filaBottom + 6),
      aireCabo: +(g.chipTop - g.caboY).toFixed(1), haloBola: +g.halo.toFixed(1),
      tintaArriba, tintaAbajo, huecoCiclo: g.huecoCiclo,
      desborde: g.desborde, desbordeH: g.desbordeH,
      jpg: (await sharp(conLuz).jpeg({ quality: 78 }).toBuffer()).toString('base64'),
    });
    console.log(('  ' + v.w + '×' + v.h).padEnd(14) + 'D=' + g.D + ' capturado');
    await ctx.close();
  }
  await navegador.close();

  const fila = (f) => {
    const mal = (c) => c ? ' style="color:#b4553f;font-weight:600"' : '';
    return `<figure>
  <figcaption><b>${f.vp}</b> · D=${f.D} · corte=${f.corte}px · barrido=${f.barrido}°</figcaption>
  <div class="lienzo"><img data-w="${f.w}" src="data:image/jpeg;base64,${f.jpg}" alt="home a ${f.vp}"><span class="escala"></span></div>
  <table>
    <tr><td>aro ← fila de minutos</td><td>${f.aroFila} px</td>
        <td>halo sobre el aro</td><td>${f.haloArriba}/255</td>
        <td>luz en la fila de minutos</td><td${mal(f.fila > 7)}>${f.fila}/255</td></tr>
    <tr><td>aire del cabo</td><td${mal(f.aireCabo <= f.haloBola)}>${f.aireCabo} px <span>(halo de la bola ${f.haloBola})</span></td>
        <td>tinta sobre el número</td><td>${f.tintaArriba} px</td>
        <td>tinta bajo el número</td><td>${f.tintaAbajo} px</td></tr>
    <tr><td>CICLO → ACTIVIDADES</td><td${mal(f.huecoCiclo < 6)}>${f.huecoCiclo} px</td>
        <td>desborde vertical</td><td${mal(f.desborde > 0)}>${f.desborde}</td>
        <td>desborde horizontal</td><td${mal(f.desbordeH > 0)}>${f.desbordeH}</td></tr>
  </table>
</figure>`;
  };

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>PACE · revisión del aro · escritorio (s185)</title>
<style>
  :root { color-scheme: light; }
  body { margin:0; background:#3a3733; color:#e8e2d8; font:14px/1.5 ui-sans-serif,system-ui,sans-serif; padding:28px 20px 60px; }
  h1 { font:600 20px/1.3 ui-sans-serif,system-ui,sans-serif; margin:0 0 6px; }
  .sub { opacity:.72; max-width:76ch; margin:0 0 26px; }
  .sub code { background:#00000030; padding:1px 5px; border-radius:4px; }
  figure { margin:0 0 34px; }
  figcaption { font:600 13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; margin:0 0 8px; letter-spacing:.02em; }
  /* SE AJUSTAN AL ANCHO, NUNCA SE RECORTAN. Una maqueta que recorta miente sobre
     lo que enseña (s182), y dar scroll a la figura NO lo arregla: una barra no es
     enseñar la captura. El max-width en px impide AMPLIAR por encima de 1:1. */
  .lienzo { position:relative; background:#00000025; border-radius:6px; }
  .lienzo img { display:block; width:100%; height:auto; }
  .escala { position:absolute; right:8px; bottom:6px; font:11px/1 ui-monospace,monospace;
            background:#000a; padding:3px 6px; border-radius:4px; }
  body.real .lienzo { overflow-x:auto; }
  body.real .lienzo img { width:auto; max-width:none; }
  .mando { position:sticky; top:0; z-index:5; background:#3a3733; padding:10px 0 16px; }
  .mando label { cursor:pointer; user-select:none; }
  table { border-collapse:collapse; margin-top:8px; font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; }
  td { padding:3px 14px 3px 0; white-space:nowrap; }
  td:nth-child(odd) { opacity:.6; }
  td span { opacity:.6; }
</style></head><body>
<h1>Revisión del aro · escritorio · s185</h1>
<p class="sub">Nueve viewports, sesión viva a la mitad de un bloque de 15 min (máximo de luz).
Las cifras salen de la misma captura: la luz se aísla fotografiando <b>el mismo fotograma</b> con el
sol encendido y apagado, y las distancias del número se miden en <b>tinta</b>, no por caja —
el <code>line-height: 0.9</code> deja ~42 px de aire muerto sobre los glifos.
En rojo lo que se sale de su criterio: luz en la fila de minutos por encima de 7/255 (el umbral de
invisibilidad medido en <code>tokens.css</code>), el cabo del aro sin despejar el halo de la bola,
menos de 6 px sobre ACTIVIDADES, o cualquier desborde.
Las capturas se ajustan al ancho de la ventana —nunca se amplían por encima de 1:1— y cada una dice
a qué escala se está viendo. Con el interruptor pasan a tamaño real, y entonces sí hacen scroll.</p>
<div class="mando"><label><input type="checkbox" id="real"> ver a <b>1:1</b> (tamaño real; las anchas harán scroll)</label></div>
${fichas.map(fila).join('\n')}
<script>
  var chk = document.getElementById('real');
  function pinta() {
    document.querySelectorAll('.lienzo').forEach(function (l) {
      var img = l.querySelector('img'), sp = l.querySelector('.escala');
      var nat = +img.dataset.w;
      img.style.maxWidth = nat + 'px';
      var pct = Math.round(img.getBoundingClientRect().width / nat * 100);
      sp.textContent = nat + ' px · ' + (pct >= 100 ? '1:1' : pct + ' %');
    });
  }
  chk.addEventListener('change', function () { document.body.classList.toggle('real', chk.checked); pinta(); });
  addEventListener('resize', pinta);
  pinta();
</script>
</body></html>`;

  fs.writeFileSync(SALIDA, html);
  console.log('\nescrito: ' + SALIDA + '  (' + (html.length / 1048576).toFixed(1) + ' MB)');
})();
