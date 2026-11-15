/* PACE · las fotos de «Tres mejoras de uso diario» (15 nov. 2026)
   ================================================================
   Abre el `index.html` compilado con Playwright, a 360 × 640 y 360 × 740 y en español, llega a
   cada pantalla como lo haría una persona (Ajustes, «Tu semana», el cierre de una rutina, la
   ventana de la pausa) y pinta cada opción SOBRE EL DOM DE VERDAD: clona las filas, píldoras y
   enlaces que ya existen, así que heredan su letra, su color y su sitio. Nada de esto toca
   `app/`: es solo maqueta. Lo único dibujado a mano es el aviso del sistema (Android no deja
   fotografiarlo desde la web), sobre una pantalla de bloqueo de mentira.

   De paso mide lo que Ez pide que se cumpla: si la pantalla pide scroll, si algún botón pisa a
   otro, y lo mismo con la letra al 115 % (cada tamaño de letra calculado × 1,15, como hace
   tests/home-sin-scroll.spec.js). Lo medido va a `medidas.json`, que la página cita.

   Uso, desde la raíz del repo y con `index.html` recién compilado (node build-standalone.js):
     node docs/proposals/maquetas-uso-15nov/genera.js
   Sirve en el puerto 8825 (nunca el 8765 de la suite). */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '..', '..', '..');
const { chromium } = require(path.join(RAIZ, 'node_modules', 'playwright'));

const AQUI = __dirname;
const FOTOS = path.join(AQUI, 'fotos');
const PUERTO = 8825;
const BASE = 'http://localhost:' + PUERTO;
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', novedadesVistas: '*', soundOn: false, sidebarCollapsed: true };
const SEMANA = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const CON_SEMANA = { ritmo: { semanaTipo: SEMANA, horario: HORARIO } };
const LIBRE = { ritmo: { libre: true } };
const JUEVES = (hhmm) => new Date('2026-11-19T' + hhmm + ':00+01:00');
const medidas = {};

/* Android de mentira, como tests/android-avisos.spec.js: lo justo para que Ajustes pinte las filas
   del móvil. `exacta: 'denied'` añade «Que el aviso llegue a su hora», el caso más alto. */
function comoAndroid(exacta) {
  const LocalNotifications = {
    checkPermissions: () => Promise.resolve({ display: 'granted' }),
    requestPermissions: () => Promise.resolve({ display: 'granted' }),
    checkExactNotificationSetting: () => Promise.resolve({ exact_alarm: exacta }),
    changeExactNotificationSetting: () => Promise.resolve({ exact_alarm: exacta }),
    schedule: (op) => Promise.resolve({ notifications: op.notifications.map((n) => ({ id: n.id })) }),
    cancel: () => Promise.resolve(),
  };
  window.Capacitor = {
    getPlatform: () => 'android', isNativePlatform: () => true,
    Plugins: {
      App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
      LocalNotifications,
      PaceAvisoFijo: { poner: () => Promise.resolve(), quitar: () => Promise.resolve() },
    },
  };
}

async function abrir(browser, { estado, hora, alto, android }) {
  const context = await browser.newContext({
    viewport: { width: 360, height: alto || 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] },
  });
  await context.addInitScript(([e]) => {
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, [Object.assign({}, SEMILLA, estado || {})]);
  if (android) await context.addInitScript(comoAndroid, android);
  await context.clock.install({ time: hora || JUEVES('10:00') });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  return { context, page };
}

async function foto(page, nombre) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(FOTOS, nombre + '.jpg'), type: 'jpeg', quality: 84 });
  console.log('  foto', nombre);
}

async function alto(page, h) {
  await page.setViewportSize({ width: 360, height: h });
  await page.waitForTimeout(500);
}

/* Cuánto pide de scroll una caja (selector), con la letra normal y al 115 %. */
async function scrollDe(page, selector) {
  return page.evaluate((sel) => {
    const caja = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().height > 0);
    if (!caja) return null;
    /* Lo que no se ve: el scroll de la caja más lo que asoma fuera de la pantalla (una ventana
       que crece hasta salirse también esconde algo). */
    const oculto = () => {
      const r = caja.getBoundingClientRect();
      const fuera = Math.max(0, -r.top) + Math.max(0, r.bottom - innerHeight);
      return Math.max(0, Math.round(caja.scrollHeight - caja.clientHeight)) + Math.round(fuera);
    };
    const normal = oculto();
    const arriba = Math.round(caja.getBoundingClientRect().top);
    const todos = [caja, ...caja.querySelectorAll('*')];
    const tam = todos.map((e) => parseFloat(getComputedStyle(e).fontSize));
    const antes = todos.map((e) => e.style.fontSize);
    todos.forEach((e, i) => { e.style.fontSize = (tam[i] * 1.15) + 'px'; });
    const grande = oculto();
    todos.forEach((e, i) => { e.style.fontSize = antes[i]; });
    return { normal, grande, arriba };
  }, selector);
}

/* La letra al 115 % de verdad sobre la pantalla, para fotografiarla; `false` la devuelve. */
async function letraGrande(page, selector, poner) {
  await page.evaluate(([sel, poner]) => {
    const caja = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().height > 0);
    const todos = [caja, ...caja.querySelectorAll('*')];
    if (poner) {
      const tam = todos.map((e) => parseFloat(getComputedStyle(e).fontSize));
      todos.forEach((e, i) => { e.setAttribute('data-letra-antes', e.style.fontSize || ''); e.style.fontSize = (tam[i] * 1.15) + 'px'; });
    } else {
      todos.forEach((e) => { if (e.hasAttribute('data-letra-antes')) { e.style.fontSize = e.getAttribute('data-letra-antes'); e.removeAttribute('data-letra-antes'); } });
    }
  }, [selector, poner]);
  await page.waitForTimeout(200);
}

/* Los botones de una zona: que ninguno pise a otro y que cada uno se vea entero (una rejilla de
   puntos sobre su caja, como tests/cierre-sin-pisar.spec.js). */
async function pisados(page, selector) {
  return page.evaluate((sel) => {
    const botones = [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().height > 0 && getComputedStyle(e).display !== 'none');
    const datos = botones.map((el) => {
      const r = el.getBoundingClientRect();
      let dentro = 0;
      for (let i = 1; i <= 9; i++) for (let j = 1; j <= 3; j++) {
        const e = document.elementFromPoint(r.left + r.width * i / 10, r.top + r.height * j / 4);
        if (e && (e === el || el.contains(e))) dentro++;
      }
      return { n: el.textContent.trim().slice(0, 30), x0: r.left, x1: r.right, y0: r.top, y1: r.bottom, visto: Math.round(100 * dentro / 27) };
    });
    const mal = datos.filter((d) => d.visto < 100).map((d) => d.n + ' al ' + d.visto + ' %');
    for (let a = 0; a < datos.length; a++) for (let b = a + 1; b < datos.length; b++) {
      const A = datos[a], B = datos[b];
      if (Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0) > 0.5 && Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0) > 0.5) mal.push(A.n + ' pisa ' + B.n);
    }
    return { botones: datos.length, mal };
  }, selector);
}

/* ============================================================
   1 · EL AVISO A LA HORA DE ENTRADA: DÓNDE SE ENCIENDE
   ============================================================ */
async function pintarFilaAjustes(page) {
  await page.evaluate(() => {
    const notify = document.querySelector('[data-pace-tweaks-panel] [data-pace-aj-fila="notify"]');
    const fila = notify.cloneNode(true);
    fila.setAttribute('data-pace-aj-fila', 'entrada');
    fila.setAttribute('data-maqueta', '');
    const nombre = fila.querySelector('.pace-aj-nombre');
    nombre.firstChild.textContent = 'Aviso al empezar';
    const sub = fila.querySelector('.pace-aj-sub');
    sub.lastChild.textContent = 'A tu hora de entrada · nunca en días libres';
    const sw = fila.querySelector('[role=switch]');
    sw.setAttribute('aria-checked', 'false');
    sw.setAttribute('aria-label', 'Aviso al empezar');
    notify.after(fila);
  });
}

async function escena1A(browser) {
  console.log('1A · Ajustes');
  medidas['1A'] = {};
  for (const exacta of ['granted', 'denied']) {
    for (const h of [640, 740]) {
      const { context, page } = await abrir(browser, { estado: CON_SEMANA, hora: JUEVES('08:30'), alto: h, android: exacta });
      await page.getByRole('button', { name: 'Abrir ajustes' }).click();
      await page.locator('[data-pace-tweaks-panel]').waitFor();
      await page.waitForTimeout(600);
      const antes = await scrollDe(page, '[data-pace-tweaks-panel]');
      await pintarFilaAjustes(page);
      await page.waitForTimeout(200);
      const despues = await scrollDe(page, '[data-pace-tweaks-panel]');
      medidas['1A'][exacta + '-' + h] = { hoy: antes, conLaFila: despues };
      if (exacta === 'granted') await foto(page, '1a-ajustes-' + h);
      else if (h === 640) await foto(page, '1a-ajustes-640-alarmas');
      await context.close();
    }
  }
}

async function pintarFilaSemana(page) {
  await page.evaluate(() => {
    const editor = document.querySelector('[data-pace-semana-hoja] [data-pace-semana-editor]');
    const fila = document.createElement('div');
    fila.setAttribute('data-maqueta', '');
    fila.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:2px;padding-top:12px;border-top:1px solid var(--paper-3);';
    const frase = document.createElement('span');
    frase.style.cssText = 'font-family:var(--font-display);font-style:italic;font-size:16px;line-height:1.35;color:var(--ink-2);text-align:left;';
    frase.innerHTML = '<b style="font-weight:500;color:var(--ink)">Avísame</b> a mi hora de entrada';
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'pace-aj-sw';
    sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-checked', 'false');
    fila.append(frase, sw);
    editor.append(fila);
  });
}

async function escena1B(browser) {
  console.log('1B · Tu semana');
  medidas['1B'] = {};
  for (const h of [640, 740]) {
    const { context, page } = await abrir(browser, { estado: CON_SEMANA, hora: JUEVES('08:30'), alto: h, android: 'granted' });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:ritmo-semana')));
    await page.locator('[data-pace-semana-hoja]').waitFor();
    await page.waitForTimeout(700);
    const sel = '[role=dialog]';
    const antes = await scrollDe(page, sel);
    await pintarFilaSemana(page);
    await page.waitForTimeout(200);
    const despues = await scrollDe(page, sel);
    medidas['1B'][h] = { hoy: antes, conLaFila: despues };
    await foto(page, '1b-semana-' + h);
    if (h === 640) { await letraGrande(page, sel, true); await foto(page, '1b-semana-640-115'); await letraGrande(page, sel, false); }
    await context.close();
  }
}

/* ============================================================
   2 · QUÉ DICE EL AVISO Y A QUÉ HORA
   El aviso es del sistema y no se puede fotografiar desde la web: se dibuja con la forma de
   Android 14 sobre una pantalla de bloqueo de mentira. Al tocarlo se abre la home de verdad.
   ============================================================ */
async function escena2(browser) {
  console.log('2 · el aviso');
  const icono = fs.readFileSync(path.join(RAIZ, 'android', 'app', 'src', 'main', 'res', 'drawable-nodpi', 'pace_icono_android7.png')).toString('base64');
  const variantes = [
    { nombre: '2a-aviso', reloj: '9:00', titulo: 'Hoy, como cada jueves', texto: 'Jornada de 9:00 a 17:00. Tu día ya está preparado.' },
    { nombre: '2b-aviso', reloj: '8:55', titulo: 'Empiezas a las 9:00', texto: 'Primer bloque de 45 min; después, Empuje sencillo.' },
  ];
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, locale: 'es-ES' });
  const page = await context.newPage();
  for (const v of variantes) {
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;height:100%}
      body{font-family:Roboto,'Segoe UI',system-ui,sans-serif;color:#fff;
        background:radial-gradient(120% 80% at 30% 20%,#55664c 0%,#2f3a2b 45%,#1c211a 100%);}
      .barra{display:flex;justify-content:space-between;padding:10px 18px 0;font-size:13px;opacity:.9}
      .reloj{text-align:center;font-size:84px;font-weight:300;letter-spacing:-2px;margin-top:46px;line-height:1}
      .fecha{text-align:center;font-size:15px;opacity:.85;margin-top:8px}
      .aviso{margin:40px 12px 0;background:rgba(246,243,236,.96);color:#1f1c17;border-radius:24px;padding:14px 16px 16px}
      .cab{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#4a453c}
      .cab img{width:22px;height:22px;border-radius:50%}
      .cab b{font-weight:500;color:#1f1c17}
      .t{font-size:15.5px;font-weight:600;margin-top:8px;line-height:1.3}
      .x{font-size:14.5px;margin-top:3px;line-height:1.4;color:#33302a}
      .pie{position:absolute;left:0;right:0;bottom:22px;text-align:center;font-size:12.5px;opacity:.7}
    </style></head><body>
      <div class="barra"><span>${v.reloj}</span><span>87 %</span></div>
      <div class="reloj">${v.reloj}</div>
      <div class="fecha">jueves, 19 de noviembre</div>
      <div class="aviso">
        <div class="cab"><img src="data:image/png;base64,${icono}" alt=""><b>PACE</b><span>· ahora</span></div>
        <div class="t">${v.titulo}</div>
        <div class="x">${v.texto}</div>
      </div>
      <div class="pie">Desliza hacia arriba para desbloquear</div>
    </body></html>`);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(FOTOS, v.nombre + '.jpg'), type: 'jpeg', quality: 86 });
    console.log('  foto', v.nombre);
  }
  await context.close();
  /* Al tocarlo: la home de verdad a las 9:00 de un jueves con la semana guardada. */
  for (const h of [640, 740]) {
    const r = await abrir(browser, { estado: CON_SEMANA, hora: JUEVES('09:00'), alto: h, android: 'granted' });
    medidas['2-home-' + h] = await scrollDe(r.page, '[data-pace-home-body]');
    await foto(r.page, '2-al-tocar-' + h);
    await r.context.close();
  }
}

/* ============================================================
   3 Y 4 · «¿TE AYUDÓ?» Y EL PORQUÉ DEL «NO»
   Se pinta sobre el cierre de verdad de «Escritorio express» (Estira). Lo de React no se quita:
   se esconde y se pone al lado lo de la maqueta, y luego se devuelve como estaba.
   ============================================================ */
async function hastaElCierre(page) {
  await page.getByRole('button', { name: /^Estira/ }).first().click();
  await page.getByRole('heading', { name: 'Escritorio express', exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(300);
  const empezar = page.getByRole('button', { name: /^Empezar$/ });
  if (await empezar.count()) await empezar.first().click();
  const done = page.locator('[data-pace-session-done]');
  for (let s = 0; s < 500 && !(await done.count()); s++) { await page.clock.fastForward(1000); await page.waitForTimeout(8); }
  if (!(await done.count())) throw new Error('la sesión no llegó al cierre');
  await page.waitForTimeout(900);
}

/* Guarda copias de las piezas del cierre (con sus estilos en línea) para pintar con ellas. */
async function guardarPiezasCierre(page) {
  await page.evaluate(() => {
    const fb = document.querySelector('[data-pace-session-feedback]');
    window.__pz = {
      q: fb.querySelector('[data-pace-fb-question]').cloneNode(true),
      fila: fb.querySelector('[data-pace-fb-chips]').cloneNode(false),
      chip: fb.querySelector('[data-pace-fb-chip]').cloneNode(true),
      ghost: fb.querySelector('[data-pace-fb-ghost]').cloneNode(true),
    };
  });
}

/* Esconde lo de React del bloque y pone lo de la maqueta (`partes`: lista de descriptores). */
async function pintarCierre(page, partes) {
  await page.evaluate((partes) => {
    const fb = document.querySelector('[data-pace-session-feedback]');
    [...fb.children].forEach((c) => { if (!c.hasAttribute('data-pace-fb-rule') && !c.hasAttribute('data-maqueta')) { c.setAttribute('data-escondido', ''); c.style.display = 'none'; } });
    const pz = window.__pz;
    const thanksBase = () => {
      const d = document.createElement('div');
      d.style.cssText = "font-family:var(--font-display);font-style:italic;font-size:16px;color:var(--ink-3);padding-top:2px;text-align:center;max-width:300px;line-height:1.45";
      return d;
    };
    const enlace = (texto, color) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = texto;
      b.style.cssText = "font-family:var(--font-display);font-style:italic;font-size:inherit;color:" + (color || 'var(--ink-2)') + ";background:none;border:none;padding:0 2px;text-decoration:underline;text-underline-offset:3px";
      return b;
    };
    partes.forEach((p) => {
      let el;
      if (p.tipo === 'pregunta') { el = pz.q.cloneNode(true); el.textContent = p.texto; }
      if (p.tipo === 'chips') {
        el = pz.fila.cloneNode(false);
        p.textos.forEach((t) => { const c = pz.chip.cloneNode(true); c.textContent = t; c.setAttribute('data-maqueta-boton', ''); el.append(c); });
      }
      if (p.tipo === 'ghost') { el = pz.ghost.cloneNode(true); el.textContent = p.texto; el.setAttribute('data-maqueta-boton', ''); }
      if (p.tipo === 'ghosts') {
        el = document.createElement('div');
        el.style.cssText = 'display:flex;justify-content:center;gap:14px;flex-wrap:wrap';
        p.textos.forEach((t) => { const g = pz.ghost.cloneNode(true); g.textContent = t; g.setAttribute('data-maqueta-boton', ''); el.append(g); });
      }
      if (p.tipo === 'acuse') {
        el = thanksBase();
        p.trozos.forEach((t) => {
          if (typeof t === 'string') el.append(document.createTextNode(t));
          else { const b = enlace(t.enlace, t.color); b.setAttribute('data-maqueta-boton', ''); el.append(b); }
        });
      }
      if (p.tipo === 'porque') {
        el = document.createElement('div');
        el.style.cssText = "font-family:var(--font-display);font-style:italic;font-size:15px;color:var(--ink-3);margin-top:10px;text-align:center;line-height:1.5";
        el.append(document.createTextNode('¿Por qué? '));
        p.textos.forEach((t, i) => {
          if (i) el.append(document.createTextNode(' · '));
          const b = enlace(t, 'var(--ink-3)'); b.style.fontSize = '15px'; b.setAttribute('data-maqueta-boton', ''); el.append(b);
        });
      }
      el.setAttribute('data-maqueta', '');
      fb.append(el);
    });
  }, partes);
  await page.waitForTimeout(250);
}

async function quitarPintado(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-maqueta]').forEach((e) => e.remove());
    document.querySelectorAll('[data-escondido]').forEach((e) => { e.style.display = ''; e.removeAttribute('data-escondido'); });
  });
}

const BOTONES_CIERRE = '[data-pace-session-root] [data-pace-fb-chip], [data-pace-session-root] [data-pace-fb-ghost], [data-pace-session-root] [data-pace-fb-deshacer], [data-pace-session-root] [data-maqueta-boton], [data-pace-session-footer] button, [data-pace-session-header] button';

async function medirCierre(page, clave, h) {
  const s = await scrollDe(page, '[data-pace-session-center]') || await scrollDe(page, '[data-pace-session-done]');
  const p = await pisados(page, BOTONES_CIERRE);
  medidas[clave] = medidas[clave] || {};
  medidas[clave][h] = { scroll: s, pisados: p };
}

async function escena4(browser) {
  console.log('3 y 4 · el cierre');
  const { context, page } = await abrir(browser, { estado: LIBRE, hora: JUEVES('10:00'), alto: 640 });
  await hastaElCierre(page);
  await guardarPiezasCierre(page);
  for (const h of [640, 740]) {
    await alto(page, h);
    await medirCierre(page, '4-hoy', h);
    await foto(page, '4-hoy-' + h);
  }
  /* 3 · el cierre cuando no toca preguntar: como sale hoy la segunda vez que acabas la misma
     rutina en un día (SessionFeedback no pinta nada). */
  await alto(page, 640);
  await page.evaluate(() => { document.querySelector('[data-pace-session-feedback]').style.display = 'none'; });
  await page.waitForTimeout(300);
  await foto(page, '3-sin-pregunta-640');
  await page.evaluate(() => { document.querySelector('[data-pace-session-feedback]').style.display = ''; });
  await page.waitForTimeout(300);
  /* 4 C · «Aquí no podía» junto a «Ahora no», desde el principio. */
  await alto(page, 640);
  await pintarCierre(page, [
    { tipo: 'pregunta', texto: '¿Te ayudó esta pausa?' },
    { tipo: 'chips', textos: ['Sí', 'Un poco', 'No'] },
    { tipo: 'ghosts', textos: ['Aquí no podía', 'Ahora no'] },
  ]);
  for (const h of [640, 740]) { await alto(page, h); await medirCierre(page, '4c', h); if (h === 640) await foto(page, '4c-640'); }
  await quitarPintado(page);
  /* 4 A · tras el «No», sus tres porqués en el mismo sitio. */
  await alto(page, 640);
  await pintarCierre(page, [
    { tipo: 'pregunta', texto: '¿Qué pasó?' },
    { tipo: 'chips', textos: ['Aquí no podía', 'Difícil', 'Me molestó'] },
    { tipo: 'ghost', texto: 'Deshacer' },
  ]);
  for (const h of [640, 740]) { await alto(page, h); await medirCierre(page, '4a-porque', h); await foto(page, '4a-porque-' + h); }
  await quitarPintado(page);
  await alto(page, 640);
  await pintarCierre(page, [
    { tipo: 'acuse', trozos: ['Gracias. Durante una semana no te la propondré. Si notas dolor, para y lee ', { enlace: 'Seguridad' }, '. ', { enlace: 'Deshacer' }] },
  ]);
  await medirCierre(page, '4a-molesto', 640);
  await foto(page, '4a-molesto-640');
  await quitarPintado(page);
  await pintarCierre(page, [
    { tipo: 'acuse', trozos: ['Gracias. No la aparto: otro día puede encajar. ', { enlace: 'Deshacer' }] },
  ]);
  await medirCierre(page, '4a-aqui', 640);
  await foto(page, '4a-aqui-640');
  await quitarPintado(page);
  /* El «No» de verdad: el acuse de hoy, y sobre él la B. */
  await page.locator('[data-pace-fb-chip]').nth(2).click();
  await page.waitForTimeout(400);
  await foto(page, '4-hoy-no-640');
  await page.evaluate(() => {
    const fb = document.querySelector('[data-pace-session-feedback]');
    const g = window.__pz.ghost.cloneNode(true);
    const linea = document.createElement('div');
    linea.setAttribute('data-maqueta', '');
    linea.style.cssText = "font-family:var(--font-display);font-style:italic;font-size:15px;color:var(--ink-3);margin-top:10px;text-align:center;line-height:1.5";
    linea.append(document.createTextNode('¿Por qué? '));
    ['Aquí no podía', 'Difícil', 'Me molestó'].forEach((t, i) => {
      if (i) linea.append(document.createTextNode(' · '));
      const b = g.cloneNode(true); b.textContent = t; b.style.margin = '0'; b.style.padding = '2px 2px'; b.setAttribute('data-maqueta-boton', '');
      linea.append(b);
    });
    fb.append(linea);
  });
  await page.waitForTimeout(250);
  for (const h of [640, 740]) { await alto(page, h); await medirCierre(page, '4b', h); await foto(page, '4b-' + h); }
  await context.close();
}

/* ============================================================
   5 · «REPETIR LA ÚLTIMA PAUSA»
   La de antes es «Escritorio express» (Estira), hecha y contestada con «Sí»: con un «No» de esta
   semana estaría apartada y no se ofrecería. Luego un bloque de Foco, y la ventana de la pausa.
   ============================================================ */
async function hastaLaPausa(page) {
  await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
  await page.waitForTimeout(400);
  const fin = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) throw new Error('no hay bloque en marcha');
  await page.clock.fastForward(Math.max(0, fin - await page.evaluate(() => Date.now())) + 1000);
  await page.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 });
  await page.waitForTimeout(900);
}

const MODAL = '[role=dialog]';

/* La fila de la A: la misma que «Hidrátate» en la pausa de «A tu ritmo» (`.pace-break-agua`). */
async function pintarFilaOtraVez(page, despuesDe) {
  await page.evaluate((despuesDe) => {
    const estira = [...document.querySelectorAll('.pace-break-otra')].find((b) => /Estira/.test(b.textContent));
    const agua = document.querySelector('[data-pace-break-agua]');
    const svg = (estira ? estira.querySelector('svg') : window.__estiraSvg).cloneNode(true);
    const fila = document.createElement('button');
    fila.type = 'button';
    fila.className = 'pace-break-agua';
    fila.setAttribute('data-maqueta', '');
    fila.style.marginTop = agua ? '0' : '14px';
    const g = document.createElement('span');
    g.className = 'pace-break-glifo';
    g.style.setProperty('--c', 'var(--extra)');
    g.append(svg);
    const b = document.createElement('b'); b.textContent = 'Escritorio express';
    const mas = document.createElement('span'); mas.className = 'pace-break-mas'; mas.textContent = '· la de antes, 2 min';
    const i = document.createElement('i'); i.setAttribute('aria-hidden', 'true'); i.textContent = '›';
    fila.append(g, b, mas, i);
    const ancla = document.querySelector(despuesDe);
    ancla.after(fila);
  }, despuesDe);
  await page.waitForTimeout(250);
}

async function medirPausa(page, clave, h) {
  medidas[clave] = medidas[clave] || {};
  medidas[clave][h] = { scroll: await scrollDe(page, MODAL), pisados: await pisados(page, MODAL + ' button') };
}

async function escena5(browser) {
  console.log('5 · por libre');
  const { context, page } = await abrir(browser, { estado: LIBRE, hora: JUEVES('10:00'), alto: 640 });
  await hastaElCierre(page);
  await page.locator('[data-pace-fb-chip]').first().click();   // «Sí»
  await page.waitForTimeout(300);
  await page.locator('[data-pace-session-footer] button').first().click();
  await page.waitForTimeout(800);
  await hastaLaPausa(page);
  for (const h of [640, 740]) { await alto(page, h); await medirPausa(page, '5-hoy', h); await foto(page, '5-hoy-' + h); }
  /* A · una fila «Otra vez», bajo las otras puertas. */
  await alto(page, 640);
  await pintarFilaOtraVez(page, '[data-pace-break-otras]');
  for (const h of [640, 740]) { await alto(page, h); await medirPausa(page, '5a', h); await foto(page, '5a-' + h); }
  await page.evaluate(() => document.querySelectorAll('[data-maqueta]').forEach((e) => e.remove()));
  /* B · un enlace en el pie, a la izquierda de «Ahora no». */
  await alto(page, 640);
  await page.evaluate(() => {
    const pie = document.querySelector('[data-pace-break-shortcut]');
    const saltar = pie.querySelector('.pace-break-saltar');
    const b = saltar.cloneNode(true);
    b.textContent = 'Otra vez: Escritorio express';
    b.setAttribute('data-maqueta', '');
    b.style.color = 'var(--ink-2)';
    pie.prepend(b);
    pie.setAttribute('data-justo', pie.style.justifyContent || '');
    pie.style.justifyContent = 'space-between';
  });
  await page.waitForTimeout(250);
  for (const h of [640, 740]) { await alto(page, h); await medirPausa(page, '5b', h); if (h === 640) await foto(page, '5b-640'); }
  await page.evaluate(() => {
    document.querySelectorAll('[data-maqueta]').forEach((e) => e.remove());
    const pie = document.querySelector('[data-pace-break-shortcut]');
    pie.style.justifyContent = pie.getAttribute('data-justo');
  });
  /* C · una segunda píldora dentro del plato, bajo «Empezar». */
  await alto(page, 640);
  await page.evaluate(() => {
    const acc = document.querySelector('[data-pace-break-prop] .pace-break-acciones');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pace-break-pildora pace-break-tonal';
    b.textContent = 'La de antes: Escritorio express';
    b.setAttribute('data-maqueta', '');
    acc.append(b);
  });
  await page.waitForTimeout(250);
  for (const h of [640, 740]) { await alto(page, h); await medirPausa(page, '5c', h); if (h === 640) await foto(page, '5c-640'); }
  await context.close();
}

/* La A también en la pausa de «A tu ritmo»: el día preparado, «Escritorio express» hecha por libre
   antes del primer bloque, y la ventana al acabarlo. */
async function escena5Ritmo(browser) {
  console.log('5 · con A tu ritmo');
  const { context, page } = await abrir(browser, { estado: CON_SEMANA, hora: JUEVES('08:50'), alto: 640 });
  /* Primero la rutina por libre (con el día preparado, las Actividades dejan su sitio al día). */
  await hastaElCierre(page);
  await page.locator('[data-pace-fb-chip]').first().click();
  await page.waitForTimeout(300);
  await page.locator('[data-pace-session-footer] button').first().click();
  await page.waitForTimeout(900);
  /* El dibujo de Estira, guardado ahora: con el día preparado ya no está en la home. */
  await page.evaluate(() => {
    const chip = [...document.querySelectorAll('[data-pace-activitybar-chip]')].find((b) => /Estira/.test(b.textContent));
    window.__estiraSvg = chip.querySelector('svg').cloneNode(true);
  });
  /* La tarjeta corta abre el día contestado, y su «Preparar jornada» lo elige. */
  await page.getByRole('button', { name: /Preparar jornada/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: /Preparar jornada/ }).filter({ visible: true }).last().click();
  await page.waitForTimeout(900);
  console.log('  tras preparar:', (await page.locator('[data-pace-home-body] button').filter({ visible: true }).allTextContents()).join(' | '));
  await hastaLaPausa(page);
  const ritmo = await page.locator('[data-pace-break-ritmo]').count();
  console.log('  ventana de A tu ritmo:', ritmo ? 'sí' : 'no');
  for (const h of [640, 740]) { await alto(page, h); await medirPausa(page, '5-ritmo-hoy', h); await foto(page, '5-ritmo-hoy-' + h); }
  await alto(page, 640);
  await pintarFilaOtraVez(page, ritmo ? '[data-pace-break-agua]' : '[data-pace-break-otras]');
  for (const h of [640, 740]) { await alto(page, h); await medirPausa(page, '5a-ritmo', h); await foto(page, '5a-ritmo-' + h); }
  await context.close();
}

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  const srv = spawn(process.execPath, [path.join(RAIZ, '.claude', 'static-server.js')], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const solo = process.argv[2];
  try {
    const escenas = { '1A': escena1A, '1B': escena1B, '2': escena2, '4': escena4, '5': escena5, '5R': escena5Ritmo };
    for (const [k, f] of Object.entries(escenas)) {
      if (solo && solo.split(',').indexOf(k) === -1) continue;
      await f(browser);
    }
  } finally {
    await browser.close();
    srv.kill();
    const previo = fs.existsSync(path.join(AQUI, 'medidas.json')) ? JSON.parse(fs.readFileSync(path.join(AQUI, 'medidas.json'), 'utf8')) : {};
    fs.writeFileSync(path.join(AQUI, 'medidas.json'), JSON.stringify(Object.assign(previo, medidas), null, 1));
  }
})().catch((e) => { console.error(e); process.exit(1); });
