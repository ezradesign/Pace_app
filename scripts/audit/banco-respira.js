/* BANCO s164 · DIAGNOSTICO DE RESPIRA — que dice cada indicador, segundo a segundo
 * ==============================================================================
 * El encargo es identificar QUE REPRESENTA cada cosa del progreso de una sesion de
 * Respira y documentar las redundancias. Esto lo mide en vez de deducirlo del
 * codigo: conduce una sesion real con reloj virtual y, en cada segundo, lee todos
 * los indicadores a la vez.
 *
 * DOS CUIDADOS MEDIDOS:
 *  · La barra tiene `transition: width 1s linear`, asi que se lee el ancho INLINE
 *    (el valor que pone React) y no el computado, que aterriza un frame tarde --
 *    la trampa de s160/s162 aplicada aqui.
 *  · El ticker es un setInterval de 1000 ms, asi que `page.clock.fastForward`
 *    avanza la sesion de verdad. Lo que NO avanza son las transiciones CSS, y por
 *    eso no se mide ni un pixel en esta pasada.
 *
 * Uso:  node banco-respira.js <repo> [rutina] [segundos]
 */
'use strict';

const { spawn } = require('child_process');
const REPO = process.argv[2] || process.cwd();
const RUTINA = process.argv[3] || 'Rondas express';
const SEGUNDOS = parseInt(process.argv[4] || '110', 10);
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));

const PORT = 8799;
const BASE = 'http://localhost:' + PORT;

const SONDA = () => {
  const body = document.querySelector('[data-pace-session-center-body]');
  const header = document.querySelector('[data-pace-session-header]');
  if (!body) return { fuera: true, texto: (document.body.innerText || '').slice(0, 120) };
  /* La barra es el ultimo hijo del centro: un flex de segmentos de 5 px de alto.
     No hay `data-pace-*` en toda la sesion de Respira, asi que se identifica por
     forma -- y eso es parte del diagnostico. */
  const hijos = [...body.children];
  const barra = hijos[hijos.length - 1];
  const segs = barra ? [...barra.children] : [];
  const rellenos = segs.map(s => {
    const dentro = s.firstElementChild;
    /* INLINE, no computado: el computado viene con 1 s de transicion detras. */
    const w = dentro ? (dentro.style.width || '') : '';
    return w.endsWith('%') ? Math.round(parseFloat(w) * 10) / 10 : null;
  });
  const textos = [...body.querySelectorAll('div')]
    .map(d => (d.children.length === 0 ? (d.textContent || '').trim() : ''))
    .filter(Boolean);
  return {
    cabecera: header ? (header.innerText || '').replace(/\n+/g, ' | ').trim() : null,
    textos,
    segTotal: segs.length,
    rellenos,
    sumaRelleno: rellenos.reduce((a, b) => a + (b || 0), 0) / 100,
  };
};

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) break; }
      catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }, locale: 'es-ES', colorScheme: 'light',
    });
    await context.addInitScript(([c, e]) => {
      localStorage.setItem(c, JSON.stringify(e));
    }, ['pace.state.v2', { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema' }]);
    const page = await context.newPage();
    await page.clock.install();
    await page.goto(BASE + '/index.html');
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

    await page.getByRole('button', { name: /^Respira/ }).click();
    /* Los selectores son los de tests/checklist-cuerpo.spec.js, no inventados: la
       tecnica se abre por su HEADING. La primera version de este banco buscaba un
       boton por /Entiendo|Empezar|Continuar/ y cazó el «Empezar foco» de la HOME,
       detrás del modal -- la trampa del match por subcadena, documentada en s154. */
    await page.getByRole('heading', { name: RUTINA }).click();
    /* Modal de seguridad de apnea: solo lo traen las rutinas con `safety`. */
    const modal = page.locator('[data-pace-modal-backdrop]');
    if (await modal.count()) {
      /* El boton nace DISABLED: hay que marcar «Lo he leido y asumo mi
         responsabilidad» (BreatheLibrary.jsx:219,224). La suite nunca cruza este
         modal -- solo comprueba que exista y pulsa Cancelar --, asi que este es el
         primer sitio del proyecto que lo atraviesa. */
      await modal.locator('input[type=checkbox]').check();
      await modal.getByRole('button', { name: 'Empezar sesión' }).click();
    }
    /* Preparacion: 3 s de cuenta atras, o el atajo. */
    const ahora = page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' });
    if (await ahora.count()) await ahora.click();
    else await page.clock.fastForward(3500);
    await page.waitForTimeout(200);

    console.log('RUTINA: ' + RUTINA + '   (reloj virtual, 1 muestra por segundo)\n');
    console.log(' s   cabecera (sin el tag)              texto del centro                    segs  progreso  segmentos');
    console.log('---  ----------------------------------  ----------------------------------  ----  --------  ---------');
    let previo = '';
    for (let s = 0; s <= SEGUNDOS; s++) {
      const m = await page.evaluate(SONDA);
      if (m.fuera) {
        console.log(String(s).padStart(3) + '  (fuera de la sesion) ' + m.texto.replace(/\n+/g, ' | ').slice(0, 90));
      } else {
        const linea = String(s).padStart(3) + '  '
          + String(m.cabecera || '').replace('ENERGÍA | ', '').replace('EQUILIBRIO | ', '').padEnd(34).slice(0, 34) + '  '
          + m.textos.join(' · ').padEnd(34).slice(0, 34) + '  '
          + String(m.segTotal).padStart(4) + '  '
          + m.sumaRelleno.toFixed(3) + '  [' + m.rellenos.map(r => String(r === null ? '?' : r)).join(' ') + ']';
        /* Solo se imprime cuando algo cambia: 110 lineas identicas no informan. */
        const firma = String(m.cabecera) + '|' + m.textos.join('·') + '|' + m.rellenos.join(',');
        if (firma !== previo) console.log(linea);
        previo = firma;
      }
      await page.clock.fastForward(1000);
      await page.waitForTimeout(30);
    }
    await browser.close();
  } finally { srv.kill(); }
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
