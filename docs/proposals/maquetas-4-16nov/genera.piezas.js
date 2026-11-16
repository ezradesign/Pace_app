/* PACE · «Cuatro maquetas hasta v1»: lo que pinta y lo que mide cada escena (lo usa genera.js).
   Todo se hace dentro de la página, sobre los elementos que la app ya pintó; lo añadido lleva
   `data-maqueta`, para que se vea qué es de mentira. */
'use strict';

/* ---------- medidas comunes ---------- */

/* Lo que no se ve de una caja: su scroll, el de cualquier hijo con scroll, y lo que asoma fuera de
   la pantalla (una hoja que crece hasta salirse también esconde algo). */
async function ocultoDe(page, selector) {
  return page.evaluate((sel) => {
    const caja = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().height > 0);
    if (!caja) return null;
    const r = caja.getBoundingClientRect();
    const fuera = Math.round(Math.max(0, -r.top) + Math.max(0, r.bottom - innerHeight));
    const scroll = [caja, ...caja.querySelectorAll('*')]
      .filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY))
      .reduce((m, e) => Math.max(m, Math.round(e.scrollHeight - e.clientHeight)), 0);
    /* Y hacia arriba: el contenedor con scroll que la envuelve (la hoja de un Modal). */
    let p = caja.parentElement, deFuera = 0;
    while (p && p !== document.body) {
      if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) deFuera = Math.max(deFuera, Math.round(p.scrollHeight - p.clientHeight));
      p = p.parentElement;
    }
    return { oculto: Math.max(scroll, deFuera) + fuera, alto: Math.round(r.height), arriba: Math.round(r.top) };
  }, selector);
}

/* La letra al 115 % de verdad, para fotografiarla (cada tamaño calculado × 1,15). */
async function letraGrande(page, selector, poner) {
  await page.evaluate(([sel, poner]) => {
    const caja = [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().height > 0);
    if (!caja) return;
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
async function pisados(page, selector, soloCon) {
  return page.evaluate(([sel, soloCon]) => {
    const botones = [...document.querySelectorAll(sel)].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.height > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(e).visibility !== 'hidden';
    });
    const datos = botones.map((el) => {
      const r = el.getBoundingClientRect();
      let dentro = 0;
      for (let i = 1; i <= 9; i++) for (let j = 1; j <= 3; j++) {
        const e = document.elementFromPoint(r.left + r.width * i / 10, r.top + r.height * j / 4);
        if (e && (e === el || el.contains(e))) dentro++;
      }
      const cuenta = !soloCon || !!el.closest(soloCon);
      return { n: (el.getAttribute('aria-label') || el.textContent).trim().slice(0, 30), x0: r.left, x1: r.right, y0: r.top, y1: r.bottom, visto: Math.round(100 * dentro / 27), cuenta };
    });
    const mal = datos.filter((d) => d.cuenta && d.visto < 100).map((d) => d.n + ' al ' + d.visto + ' %');
    for (let a = 0; a < datos.length; a++) for (let b = a + 1; b < datos.length; b++) {
      const A = datos[a], B = datos[b];
      if (!A.cuenta && !B.cuenta) continue;
      if (A.n === B.n && Math.abs(A.x0 - B.x0) < 1) continue;
      if (Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0) > 0.5 && Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0) > 0.5) mal.push(A.n + ' pisa ' + B.n);
    }
    return { botones: datos.length, mal };
  }, [selector, soloCon || null]);
}

/* ---------- 1 · el constructor ---------- */

async function marcarConstructor(page) {
  await page.evaluate(() => {
    const menos = [...document.querySelectorAll('button[aria-label="−5 s"]')];
    menos.forEach((b) => {
      const dur = b.parentElement, ctrl = dur.parentElement, fila = ctrl.parentElement, flechas = ctrl.children[1];
      fila.setAttribute('data-mq-fila', '');
      ctrl.setAttribute('data-mq-ctrl', '');
      dur.setAttribute('data-mq-dur', '');
      flechas.setAttribute('data-mq-flechas', '');
      dur.children[1].setAttribute('data-mq-valor', '');
      [...dur.querySelectorAll('button'), ...flechas.querySelectorAll('button')].forEach((x) => x.setAttribute('data-mq-btn', ''));
      flechas.lastElementChild.setAttribute('data-mq-quitar', '');
    });
  });
}

const CSS_CONSTRUCTOR = {
  hoy: '',
  /* A · 40 px. A 360 px no caben seis botones de 40 en una línea (la fila deja 264 px), así que
     «×» sube a la línea del nombre, lejos de las flechas (ordenar ya no roza borrar), y abajo van
     la duración a la izquierda y el orden a la derecha. `display: contents` deja que los botones
     cambien de línea sin tocar el JSX de la maqueta. */
  A: `[data-mq-ctrl],[data-mq-flechas]{display:contents !important}
      [data-mq-fila]{column-gap:10px !important;row-gap:8px !important}
      [data-mq-fila] > span:nth-child(2){flex:0 0 calc(100% - 96px) !important}
      [data-mq-quitar]{order:2}[data-mq-dur]{order:3;margin-right:auto;gap:4px !important}
      [data-mq-flechas] > button:not([data-mq-quitar]){order:4}
      [data-mq-btn]{width:40px !important;height:40px !important;font-size:17px !important;border-radius:10px !important}
      [data-mq-valor]{font-size:13px !important;min-width:40px !important}`,
  /* B · 44 px, la medida que piden Apple y Google, con el mismo reparto que A. */
  B: `[data-mq-ctrl],[data-mq-flechas]{display:contents !important}
      [data-mq-fila]{column-gap:10px !important;row-gap:8px !important}
      [data-mq-fila] > span:nth-child(2){flex:0 0 calc(100% - 100px) !important}
      [data-mq-quitar]{order:2}[data-mq-dur]{order:3;margin-right:auto;gap:4px !important}
      [data-mq-flechas] > button:not([data-mq-quitar]){order:4}
      [data-mq-btn]{width:44px !important;height:44px !important;font-size:19px !important;border-radius:11px !important}
      [data-mq-valor]{font-size:13px !important;min-width:40px !important}`,
  /* C · donde están hoy, de 24 a 32 px, con la zona de toque invisible que crece hasta 44 de alto
     (la regla de app/ui/toques.css.jsx: solo hasta el hueco con el vecino). */
  C: `[data-mq-btn]{width:32px !important;height:32px !important;font-size:15px !important;position:relative}
      [data-mq-flechas]{gap:6px !important}[data-mq-dur]{gap:6px !important}
      [data-mq-btn]::before{content:'';position:absolute;left:-3px;right:-3px;top:-6px;bottom:-6px}`,
};

async function pintarConstructor(page, op) {
  await page.evaluate((css) => {
    let s = document.getElementById('mq-1');
    if (!s) { s = document.createElement('style'); s.id = 'mq-1'; document.head.appendChild(s); }
    s.textContent = css;
  }, CSS_CONSTRUCTOR[op]);
}

async function medirConstructor(page) {
  return page.evaluate(() => {
    const btns = [...document.querySelectorAll('[data-mq-btn]')];
    const cajas = btns.map((b) => b.getBoundingClientRect());
    let hueco = Infinity;
    cajas.forEach((a, i) => cajas.forEach((b, j) => {
      if (i === j || Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) < 4 || b.left < a.right - 0.5) return;
      hueco = Math.min(hueco, b.left - a.right);
    }));
    /* La zona de toque: la caja más su ::before, si lo hay. */
    const b0 = btns[0], c0 = cajas[0], pre = getComputedStyle(b0, '::before');
    const zona = pre.content && pre.content !== 'none'
      ? { w: Math.round(c0.width - parseFloat(pre.left) - parseFloat(pre.right)), h: Math.round(c0.height - parseFloat(pre.top) - parseFloat(pre.bottom)) }
      : { w: Math.round(c0.width), h: Math.round(c0.height) };
    const filas = [...document.querySelectorAll('[data-mq-fila]')];
    const modal = [...document.querySelectorAll('[data-pace-modal-backdrop]')].pop();
    const scroller = [modal, ...modal.querySelectorAll('*')].filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1);
    const guardar = [...modal.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Guardar');
    return {
      boton: Math.round(c0.width) + ' × ' + Math.round(c0.height), zona: zona.w + ' × ' + zona.h,
      hueco: Math.round(hueco), fila: Math.round(filas[0].getBoundingClientRect().height),
      pasos: Math.round(filas[filas.length - 1].getBoundingClientRect().bottom - filas[0].getBoundingClientRect().top),
      scroll: scroller.reduce((m, e) => Math.max(m, Math.round(e.scrollHeight - e.clientHeight)), 0),
      guardarSinBajar: guardar ? guardar.getBoundingClientRect().bottom <= innerHeight : null,
    };
  });
}

/* Los pasos a la vista, con el nombre de la rutina encima si cabe. */
async function verPasos(page) {
  await page.evaluate(() => {
    const filas = [...document.querySelectorAll('[data-mq-fila]')];
    filas[0].scrollIntoView({ block: 'start' });
    let p = filas[0].parentElement;
    while (p && !(p.scrollHeight > p.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
    if (p) p.scrollTop = Math.max(0, p.scrollTop - 96);
  });
  await page.waitForTimeout(250);
}

/* ---------- 2 · la nota al acabar la semana ---------- */

async function bajarHastaCandado(page) {
  await page.evaluate(() => {
    const em = [...document.querySelectorAll('.pace-lib em')].find((e) => e.querySelector('svg') && e.getBoundingClientRect().height > 0);
    if (em) (em.closest('button, article, li, div') || em).scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(400);
}

/* A · una fuente más del sobre de arriba (app/shell/Sobre.jsx), como la línea de los lunes. */
async function apuntarEnElSobre(page) {
  await page.evaluate(() => {
    paceSobreApuntar({ clave: 'finPrueba', de: () => ({
      sinLeer: true, titulo: 'Acabó tu semana de prueba', fecha: '2026-11-25', tipo: 'PACE completo', cuando: 'miércoles, 25 nov.',
      tituloHoja: 'Acabó tu semana de prueba',
      lineas: ['Desde hoy, lo que lleva candado es de PACE completo. Lo gratis sigue gratis.',
        'Se quedan tuyas para siempre «Respiración en rondas» y «Colgarse», porque ya las hiciste.'],
      leer: () => {}, abrir: () => paceAbrirPremium({}), enlace: 'Ver PACE completo',
    }) });
    setState({ soundOn: false });
  });
  await page.waitForTimeout(600);
}

/* B · la hoja del día de v1 (PremiumPasoV1) con lo que diría al acabar. */
async function hojaDelFinal(page) {
  await page.evaluate(() => {
    const h = document.querySelector('[data-pace-premium-hoja="pasov1"]');
    h.querySelector('h2').textContent = 'Acabó tu semana de prueba';
    const ps = [...h.querySelectorAll('p')];
    ps[0].textContent = 'Desde hoy, lo que lleva candado es de PACE completo.';
    const tuyas = ps.find((p) => /quedan tuyas/.test(p.textContent));
    if (tuyas) tuyas.textContent = 'Estas siguen siendo tuyas para siempre, porque ya las hiciste:';
    const boton = [...h.querySelectorAll('button')].pop();
    boton.textContent = 'Entendido';
    /* Debajo del botón, un enlace callado a la invitación, sin precio en grande. */
    const enlace = document.createElement('button');
    enlace.type = 'button'; enlace.className = 'pace-rt-enlace'; enlace.setAttribute('data-maqueta', '');
    enlace.textContent = 'Tenerlo para siempre · 19,99 € ›';
    enlace.style.cssText = 'display:block;margin:12px auto 0;font-size:14px;padding:6px 4px;';
    boton.after(enlace);
  });
  await page.waitForTimeout(300);
}

async function alturaCabeceraLib(page) {
  return page.evaluate(() => {
    const hd = [...document.querySelectorAll('.pace-lib-hd')].find((e) => e.getBoundingClientRect().height > 0);
    const primera = [...document.querySelectorAll('.pace-lib-now, .pace-lib-grp')].find((e) => e.getBoundingClientRect().height > 0);
    return { cabecera: hd ? Math.round(hd.getBoundingClientRect().height) : null, primeraTarjetaA: primera ? Math.round(primera.getBoundingClientRect().top) : null };
  });
}

/* C · una línea bajo el subtítulo de la biblioteca, la primera vez que abres una con candados. */
async function lineaEnLaBiblioteca(page) {
  await page.evaluate(() => {
    const sub = [...document.querySelectorAll('.pace-lib-sub')].find((e) => e.getBoundingClientRect().height > 0);
    const p = document.createElement('p');
    p.setAttribute('data-maqueta', '');
    p.style.cssText = 'margin:10px 0 0;font-family:var(--font-ui);font-style:normal;font-size:13px;line-height:1.45;color:var(--ink-2);';
    p.innerHTML = 'Tu semana de prueba acabó ayer: lo que lleva candado ya es de PACE completo. '
      + '<button type="button" style="font:inherit;color:var(--ink);background:none;border:0;padding:0;text-decoration:underline;text-underline-offset:3px;cursor:pointer">Ver PACE completo ›</button>';
    sub.after(p);
  });
  await page.waitForTimeout(300);
}

/* ---------- 3 · «Tus datos» en la semana ---------- */

async function pintarDatos(page, op) {
  if (op === 'hoy') return;
  await page.evaluate((op) => {
    const panel = document.querySelector('[data-pace-tweaks-panel]');
    const prueba = panel.querySelector('[data-pace-licencia-prueba]').closest('.pace-aj-accion');
    if (op === 'A') {
      /* La fila de compra de siempre (suave, como «Borrar todos mis datos»), justo debajo. */
      const borrar = [...panel.querySelectorAll('.pace-aj-accion')].find((e) => /Borrar todos/.test(e.textContent));
      const fila = borrar.cloneNode(true);
      fila.setAttribute('data-maqueta', '');
      fila.firstElementChild.textContent = 'Tenerlo para siempre';
      fila.lastElementChild.textContent = '19,99 €';
      prueba.after(fila);
    } else if (op === 'B') {
      /* La línea pequeña de la fila (`sub` de AjustesAccion), bajo «PACE completo». */
      const izq = prueba.firstElementChild;
      const sub = document.createElement('span');
      sub.className = 'pace-aj-sub pace-aj-sub-accion';
      sub.setAttribute('data-maqueta', '');
      sub.textContent = 'Tenerlo para siempre · 19,99 € ›';
      izq.appendChild(sub);
    } else if (op === 'C') {
      /* La compra manda en la fila y la fecha baja a la línea pequeña. */
      const izq = prueba.firstElementChild;
      izq.textContent = 'Tenerlo para siempre';
      const sub = document.createElement('span');
      sub.className = 'pace-aj-sub pace-aj-sub-accion';
      sub.textContent = 'Prueba de PACE completo hasta el 24 de noviembre';
      izq.appendChild(sub);
      const der = prueba.querySelector('[data-pace-licencia-prueba]');
      der.textContent = '19,99 €';
      der.style.color = '';
      prueba.setAttribute('data-maqueta', '');
    }
  }, op);
}

async function filasDatos(page) {
  return page.evaluate(() => [...document.querySelectorAll('[data-pace-tweaks-panel] .pace-aj-accion')]
    .map((e) => e.innerText.split('\n').join(' | ') + ' (' + Math.round(e.getBoundingClientRect().height) + ' px)'));
}

/* ---------- 4 · las bibliotecas con la jornada elegida ---------- */

/* La fila «Bibliotecas» del cajón (Respira · Estira · Mueve), copiada tal cual. En el móvil el
   cajón solo existe abierto: se abre, se copia la fila y se cierra. */
async function filaDelCajon(page) {
  await page.getByRole('button', { name: /Abrir panel/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const aside = document.querySelector('aside[data-pace-sidebar]');
    const b = [...aside.querySelectorAll('button')].filter((x) => ['Respira', 'Estira', 'Mueve'].indexOf(x.textContent.trim()) !== -1);
    window.__mqFila = b[0].parentElement.outerHTML;
  });
  const cerrar = page.locator('aside[data-pace-sidebar] button[aria-label*="errar"]').filter({ visible: true });
  if (await cerrar.count()) await cerrar.first().click();
  else await page.locator('aside[data-pace-sidebar] button').filter({ visible: true }).first().click();
  /* El ratón se queda donde estaba la flecha de cerrar, encima de Ajustes: se aparta. */
  await page.mouse.move(200, 230);
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await page.waitForTimeout(900);
}

async function pintarBibliotecas(page, op) {
  if (op === 'hoy') return;
  await page.evaluate((op) => {
    const molde = document.createElement('div');
    molde.innerHTML = window.__mqFila;
    const filaCajon = molde.firstElementChild;
    const libs = [...filaCajon.querySelectorAll('button')];
    if (op === 'A') {
      /* Los tres glifos en la barra de arriba, con la forma de los iconos de al lado. */
      const bar = [...document.querySelectorAll('[data-pace-topbar]')].find((e) => e.getBoundingClientRect().height > 0);
      const icono = bar.querySelector('[data-pace-topbar-icon]');
      const grupo = document.createElement('div');
      grupo.setAttribute('data-maqueta', '');
      grupo.style.cssText = 'display:flex;gap:4px;margin-right:auto;margin-left:52px;align-items:center;';
      libs.forEach((l) => {
        const b = icono.cloneNode(false);
        b.removeAttribute('data-pace-topbar-ajustes');
        b.setAttribute('aria-label', 'Biblioteca de ' + l.textContent.trim());
        b.removeAttribute('title');
        const svg = l.querySelector('svg').cloneNode(true);
        svg.setAttribute('width', '20'); svg.setAttribute('height', '20');
        b.appendChild(svg);
        grupo.appendChild(b);
      });
      icono.before(grupo);
    } else {
      const fila = filaCajon;
      fila.setAttribute('data-maqueta', '');
      fila.querySelectorAll('button').forEach((b) => { b.style.alignItems = 'center'; });
      const caja = document.createElement('div');
      caja.setAttribute('data-maqueta', '');
      if (op === 'B') {
        /* Una fila más en el panel de la jornada, debajo de «Luego». */
        const panel = [...document.querySelectorAll('[data-pace-ritmo-panel]')].find((e) => e.getBoundingClientRect().height > 0);
        caja.style.cssText = 'border-top:1px solid var(--line);margin-top:6px;padding-top:2px;';
        fila.style.paddingTop = '0px'; fila.style.paddingBottom = '0px';
        caja.appendChild(fila);
        const movil = [...panel.children].filter((e) => e.getBoundingClientRect().height > 0).pop() || panel;
        movil.appendChild(caja);
      } else {
        /* C · arriba de «Ver todo», la hoja del día, bajo la línea de lo que llevas (al pie
           quedaba fuera de la vista: la hoja es el día entero). */
        const dlg = [...document.querySelectorAll('[role="dialog"]')].filter((e) => e.getBoundingClientRect().height > 0).pop();
        const resumen = [...dlg.querySelectorAll('*')].filter((e) => /de foco · .*pausas/.test(e.textContent) && e.getBoundingClientRect().height > 0)
          .sort((a, b) => a.textContent.length - b.textContent.length)[0];
        caja.style.cssText = 'border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:12px 0 4px;';
        fila.style.paddingTop = '2px'; fila.style.paddingBottom = '2px';
        caja.appendChild(fila);
        resumen.after(caja);
      }
    }
  }, op);
}

async function medirHome(page) {
  return page.evaluate(() => {
    const vis = (sel) => [...document.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0);
    const body = vis('[data-pace-home-body]');
    const dial = vis('[data-pace-dial-fit]');
    const panel = vis('[data-pace-activitybar]');
    const doc = document.scrollingElement;
    const fuera = [...document.querySelectorAll('#root button')].filter((b) => {
      if (b.closest('aside, [data-pace-modal-backdrop]')) return false;
      const r = b.getBoundingClientRect();
      return r.height > 0 && r.bottom > innerHeight + 0.5;
    }).map((b) => (b.getAttribute('aria-label') || b.innerText).trim().slice(0, 24));
    return {
      scroll: Math.max(body ? Math.round(body.scrollHeight - body.clientHeight) : 0, Math.round(doc.scrollHeight - innerHeight)),
      aro: dial ? Math.round(dial.getBoundingClientRect().width) : null,
      panel: panel ? Math.round(panel.getBoundingClientRect().top) + '–' + Math.round(panel.getBoundingClientRect().bottom) : null,
      fuera,
    };
  });
}

module.exports = {
  ocultoDe, letraGrande, pisados, marcarConstructor, pintarConstructor, medirConstructor, verPasos,
  bajarHastaCandado, apuntarEnElSobre, hojaDelFinal, alturaCabeceraLib, lineaEnLaBiblioteca,
  pintarDatos, filasDatos, pintarBibliotecas, medirHome, filaDelCajon,
};
