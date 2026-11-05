/* Fotos de la página del sobre (5 nov. 2026): la app real (PACE.html de la 0.190.0) con la hoja de cada opción
   pintada con el propio Modal y los estilos de la carta. Nada de la app se toca: la hoja se monta por fuera.
   Uso: PACE_RAIZ=<repo> PACE_FOTOS=<carpeta> MAQ_PORT=8864 node fotos.js */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('../grupo2-30oct/comun');
const SALIDA = path.join(C.FOTOS, 'sobre');

/* Lo que lleva el sobre en el ejemplo: lo más nuevo arriba. Los textos de «novedades» salen de los títulos de los commits
   de la 0.190.0; el aviso, de lo que ya dice ui/android.avisos.js. */
const COSAS = [
  { id: 'aviso', tipo: 'Aviso', cuando: 'hoy', titulo: 'El aviso puede llegar tarde',
    resumen: 'Android lo retrasa unos minutos.',
    cuerpo: ['Android deja el aviso de fin de bloque unos minutos tarde si PACE no tiene el permiso «Alarmas y recordatorios». Es solo el aviso: PACE sigue contando bien.'],
    enlace: 'Ver el permiso' },
  { id: 'novedades', tipo: 'Novedades', cuando: 'v0.190.0 · 5 nov.', titulo: 'Qué hay de nuevo',
    resumen: 'Rana y Palmas, los logros y las horas.',
    cuerpo: ['Rana y Palmas se suman a lo que haces en la mesa.', 'Los logros ya no dicen «Próximamente».', 'Todas las horas de tu jornada se cambian con «− 9:00 +».'] },
  { id: 'carta', tipo: 'Carta', cuando: 'lunes 2 nov.', titulo: 'La carta de tu semana',
    resumen: '26 de 35 pausas hechas.',
    cuerpo: ['26 de 35 pausas hechas y dos cambios por si quieres. Puedes dejarla como está.'], enlace: 'Abrir la carta' },
];

/* Se ejecuta DENTRO de la página: monta la hoja con el Modal real. */
function montar(a) {
  const h = React.createElement;
  const S = ritmoCartaStyles;
  const lacre = (on) => h('i', { 'aria-hidden': true, style: { width: 8, height: 8, borderRadius: '50%', flex: 'none', background: on ? 'var(--breathe)' : 'transparent', border: on ? '0' : '1.5px solid var(--line-2)', display: 'block' } });
  const meta = (c, sin) => h('div', { style: Object.assign({}, S.meta, { display: 'flex', alignItems: 'center', gap: 8 }) }, lacre(sin), c.tipo + ' · ' + c.cuando);
  const titulo = (c, tam) => h('div', { style: Object.assign({}, S.ayudo, { fontSize: tam || 19 }) }, c.titulo);
  const cuerpo = (c) => c.cuerpo.length > 1
    ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } }, c.cuerpo.map((x, i) => h('div', { key: i, style: S.cambio }, h('i', { style: Object.assign({}, S.punto, { borderColor: 'var(--ink-3)' }) }), h('span', null, x))))
    : h('div', { style: S.pregunta }, c.cuerpo[0]);
  const enlace = (x) => h('button', { type: 'button', className: 'pace-rt-enlace', style: { alignSelf: 'flex-start' } }, x + ' ›');
  const COS = a.cosas; const leidas = a.leidas || [];
  const sin = (c) => leidas.indexOf(c.id) < 0;
  const cab = (txt, der) => h('div', { style: S.cab }, h('span', { style: S.meta }, txt), der ? h('span', { style: S.fechas }, der) : null);
  const col = (...xs) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, ...xs);
  const parte = (c) => h('div', { key: c.id, style: S.parte, 'data-maq-parte': c.id }, meta(c, sin(c)), titulo(c, 17), cuerpo(c), c.enlace ? enlace(c.enlace) : null);
  const pie = (izq, der) => h('div', { className: 'pace-rt-tm-pie' }, izq ? h('button', { type: 'button', className: 'pace-rt-enlace' }, izq) : h('span'),
    der ? h('button', { type: 'button', className: 'pace-rt-tm-comienza' }, h('span', { className: 'pace-rt-tm-pildora' }, der + ' ', ritmoCartaFlecha)) : null);
  let cont;
  if (a.op === 'A' && !a.detalle) {
    cont = col(cab('El sobre', COS.length + ' cosas'), h('div', { style: { display: 'flex', flexDirection: 'column' } }, COS.map((c) =>
      h('button', { key: c.id, type: 'button', 'data-maq-fila': c.id, style: { display: 'grid', gridTemplateColumns: '10px minmax(0,1fr) auto', gap: 12, alignItems: 'center', textAlign: 'left', padding: '12px 0', borderTop: '1px solid var(--line)', width: '100%' } },
        lacre(sin(c)),
        h('span', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
          h('span', { style: S.meta }, c.tipo + ' · ' + c.cuando),
          h('span', { style: Object.assign({}, S.ayudo, { fontSize: 17 }) }, c.titulo),
          h('span', { style: { fontSize: 12, color: 'var(--ink-3)' } }, c.resumen)),
        h('span', { 'aria-hidden': true, style: { color: 'var(--ink-3)', fontSize: 15 } }, '›')))));
  } else if (a.op === 'A') {
    const c = COS.find((x) => x.id === a.detalle);
    cont = col(h('button', { type: 'button', className: 'pace-rt-enlace', style: { alignSelf: 'flex-start' } }, '‹ El sobre'), meta(c, false), titulo(c), cuerpo(c), c.enlace ? enlace(c.enlace) : null);
  } else if (a.op === 'B') {
    const n = a.paso; const c = COS[n];
    cont = col(cab(c.tipo + ' · ' + c.cuando, (n + 1) + ' de ' + COS.length), titulo(c, 21), cuerpo(c), c.enlace ? enlace(c.enlace) : null,
      pie(n > 0 ? '‹ Antes' : 'Dejar el resto', n < COS.length - 1 ? 'Siguiente' : 'Listo'));
  } else {
    cont = col.apply(null, [cab('El sobre', COS.length + ' cosas')].concat(COS.map(parte)));
  }
  const root = document.createElement('div'); root.id = 'maq-root'; document.body.appendChild(root);
  ReactDOM.createRoot(root).render(h(Modal, { open: true, onClose() {}, maxWidth: 420, relleno: '20px 18px 16px', ariaLabel: 'El sobre' }, h('div', { 'data-maq-hoja': a.op, style: { display: 'flex', flexDirection: 'column', gap: 10 } }, cont)));
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await C.servidor();
  const browser = await C.chromium.launch();
  const medidas = {};
  const jpg = (page, n, o) => page.screenshot(Object.assign({ path: path.join(SALIDA, n + '.jpg'), type: 'jpeg', quality: 82 }, o || {}));
  const casos = [
    ['A', { op: 'A' }], ['A-detalle', { op: 'A', detalle: 'novedades' }], ['B', { op: 'B', paso: 0 }], ['B-2', { op: 'B', paso: 1 }], ['C', { op: 'C' }],
  ];
  try {
    for (const [ancho, alto, s] of [[360, 730, 'm'], [1280, 879, 'e']]) {
      for (const oscuro of [false, true]) {
        const t = s + (oscuro ? '-osc' : '');
        for (const [nombre, extra] of casos) {
          if ((nombre === 'A-detalle' || nombre === 'B-2') && (s !== 'm' || oscuro)) continue;
          const { context, page } = await C.abrir(browser, { ancho, alto, oscuro, pagina: 'PACE.html', dsf: s === 'm' ? 2 : 1, hora: new Date('2026-11-05T11:00:00+01:00') });
          await page.evaluate(() => ritmoElegir('jornada'));
          await C.ponerCarta(page, '2026-11-02', '2026-10-26', '2026-11-01', { luego: true });
          await page.waitForSelector('[data-pace-sobre]', { timeout: 15000 });
          await page.waitForTimeout(400);
          if (nombre === 'A') await jpg(page, 'barra-' + t, { clip: { x: 0, y: 0, width: ancho, height: s === 'm' ? 70 : 64 } });
          const antes = await C.scrollHome(page);
          await page.evaluate(montar, Object.assign({ cosas: COSAS, leidas: [] }, extra));
          await page.waitForSelector('[data-maq-hoja]', { timeout: 10000 });
          await page.waitForTimeout(500);
          const m = await page.evaluate(() => { const d = document.querySelector('#maq-root [data-pace-modal-card]'); const r = d.getBoundingClientRect(); return { alto: Math.round(r.height), top: Math.round(r.top), vh: innerHeight, scrollHoja: d.scrollHeight - d.clientHeight }; });
          const despues = await C.scrollHome(page);
          medidas[nombre + '-' + t] = Object.assign({ homeAntes: antes.scroll, homeDespues: despues.scroll }, m);
          await jpg(page, nombre + '-' + t);
          if (nombre === 'A' && s === 'm' && !oscuro) {
            await page.evaluate(() => { document.getElementById('maq-root').remove(); setState((p) => Object.assign({}, p, { ritmo: Object.assign({}, p.ritmo, { carta: Object.assign({}, p.ritmo.carta, { vista: Date.now() }) }) })); });
            await page.waitForTimeout(500);
            await jpg(page, 'barra-abierto-m', { clip: { x: 0, y: 0, width: ancho, height: 70 } });
          }
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
    if (srv) srv.kill();
    fs.writeFileSync(path.join(SALIDA, 'medidas.json'), JSON.stringify(medidas, null, 1));
    console.log(JSON.stringify(medidas));
  }
})().catch((e) => { console.error(e); process.exit(1); });
