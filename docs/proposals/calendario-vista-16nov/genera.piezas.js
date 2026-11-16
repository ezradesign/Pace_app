/* PACE · las piezas de «El calendario a la vista» (16 nov. 2026)
   ============================================================
   Lo que genera.js pinta y mide DENTRO de la página. Todo se hace sobre el DOM de verdad de la
   tarjeta «¿Cuánto trabajas hoy?» (RitmoTarjeta) y de la hoja «Tu día en el calendario»
   (RitmoCalendarioHoja): las piezas nuevas llevan las clases que ya existen (`.pace-rt-enlace`,
   `.pace-rt-mini-int`, `.pace-rt-cal-*`), así que heredan su letra, su color y su sitio. Nada de
   esto toca `app/`: es solo maqueta. Lo nuevo lleva `data-maqueta` para medirlo. */
'use strict';

const TEXTOS = {
  es: {
    enlace: 'Al calendario', conectado: 'Calendario conectado', conectadoMovil: 'Conectado',
    filaC: 'Tu día, en tu calendario: cada bloque con su pausa.', filaCmov: 'Tu día, en tu calendario',
    filaCbtn: 'Conectar', filaCbtnWeb: 'Al calendario',
    resumen: 'Cuando elijas cuánto trabajas, tu día irá a tu calendario: cada bloque con su pausa.',
    webNota: 'En la web, PACE te da un archivo y tu calendario lo añade. Si cambias el día, descárgalo otra vez.',
    iosNota: 'En el iPhone, PACE te da un archivo y Calendario lo añade. Si cambias el día, compártelo otra vez.',
    alElegir: 'Al elegir', archivoSub: 'Un archivo para tu calendario. Se descarga en cuanto eliges tu día.',
    archivoSubApp: 'Un archivo para tu calendario. Se comparte en cuanto eliges tu día.',
    conectar: 'Conectar', iphone: 'Calendario del iPhone', iphoneSub: 'El de Calendario, con tus cuentas de iCloud, Google u Outlook',
    hecho: 'Conectado: hoy tienes 2 reuniones y las opciones ya las rodean.',
  },
  en: {
    enlace: 'Add to calendar', conectado: 'Calendar connected', conectadoMovil: 'Connected',
    filaC: 'Your day in your calendar, every block with its break.', filaCmov: 'Your day in your calendar',
    filaCbtn: 'Connect', filaCbtnWeb: 'Add to calendar',
    resumen: 'When you choose how long you’re working, your day goes to your calendar, every block with its break.',
    webNota: 'On the web, PACE gives you a file and your calendar adds it. If your day changes, download it again.',
    iosNota: 'On iPhone, PACE gives you a file and Calendar adds it. If your day changes, share it again.',
    alElegir: 'When I choose', archivoSub: 'A file for your calendar. It downloads as soon as you choose your day.',
    archivoSubApp: 'A file for your calendar. It’s shared as soon as you choose your day.',
    conectar: 'Connect', iphone: 'iPhone calendar', iphoneSub: 'The one in Calendar, with your iCloud, Google or Outlook accounts',
    hecho: 'Connected: you have 2 meetings today and your options already work around them.',
  },
};

/* El calendario en línea, de la familia de los iconos de PACE: 12 px, trazo 1,2, currentColor. */
const ICONO = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 auto"><rect x="1.2" y="2.2" width="9.6" height="8.6" rx="1.6"/><path d="M1.2 4.9h9.6"/><path d="M3.9 1v2.3M8.1 1v2.3"/></svg>';

/* ---------- La tarjeta ---------- */

async function pintar(page, op, o) {
  await page.evaluate(([op, o, T, ICONO]) => {
    const t = T[o.lang || 'es'];
    const vis = (e) => e && e.getBoundingClientRect().width > 0;
    document.querySelectorAll('[data-maqueta]').forEach((e) => e.remove());
    const nota = document.querySelector('.pace-rt-tm-nota');
    if (nota && nota.dataset.antes) { nota.textContent = nota.dataset.antes; delete nota.dataset.antes; nota.removeAttribute('data-maqueta-nota'); }
    const esc = Array.from(document.querySelectorAll('.pace-rt-tj-esc')).find(vis);
    const mov = Array.from(document.querySelectorAll('.pace-rt-tj-mov')).find(vis);
    /* En el móvil, al final del esquema, «Calendario conectado» se salía de la tarjeta con la letra
       al 115 %: allí dice «Conectado», y el dibujo del calendario dice de qué. */
    const texto = o.conectado ? (esc ? t.conectado : t.conectadoMovil) : t.enlace;
    if (op === 'A') {
      /* El enlace con su estado: en la cabecera del ordenador, delante de «Ajustar el horario»;
         en el móvil, al final del esquema, como «Ver todo» al final de la línea del día. */
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pace-rt-enlace pace-rt-fuerte'; b.setAttribute('data-maqueta', 'A');
      b.innerHTML = ICONO + '<span>' + texto + '</span>';
      b.style.cssText = 'display:inline-flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;';
      if (esc) {
        b.style.padding = '6px 0'; b.style.margin = '-6px 0';
        esc.querySelector('.pace-rt-tarjeta-enlaces').prepend(b);
      } else if (mov) {
        b.style.cssText += 'flex:0 0 auto;margin:-15px 0 -15px 12px;padding:15px 0;font-size:13px;line-height:14px;white-space:nowrap;';
        mov.querySelector('[data-pace-ritmo-esquema]').appendChild(b);
      }
    } else if (op === 'B') {
      /* El interruptor: la palabra y el mini interruptor de la comida, un solo botón. */
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', o.conectado ? 'true' : 'false');
      b.setAttribute('data-maqueta', 'B');
      b.innerHTML = '<span>' + t.enlace + '</span><i class="pace-rt-mini-int' + (o.conectado ? ' pace-rt-on' : '') + '" aria-hidden="true"></i>';
      if (esc) {
        b.className = 'pace-rt-enlace';
        b.style.cssText = 'display:inline-flex;align-items:center;background:none;border:none;cursor:pointer;padding:6px 0;margin:-6px 0;color:var(--ink-2);';
        esc.querySelector('.pace-rt-tarjeta-enlaces').prepend(b);
      } else if (mov) {
        b.className = 'pace-rt-tm-nota';
        b.style.cssText = 'display:inline-flex;align-items:center;background:none;border:none;cursor:pointer;padding:0;height:44px;';
        nota.dataset.antes = nota.textContent;
        nota.textContent = '';
        nota.appendChild(b);
        b.removeAttribute('data-maqueta');
        nota.setAttribute('data-maqueta-nota', 'B');
      }
    } else if (op === 'C') {
      /* Una fila propia, bajo las losetas o bajo el esquema, con su regla fina. */
      const fila = document.createElement('div');
      fila.setAttribute('data-maqueta', 'C');
      fila.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid var(--line);';
      const izq = '<span style="display:inline-flex;align-items:center;gap:8px;min-width:0;font-family:var(--font-display);font-style:italic;color:var(--ink-2);">' +
        '<span style="color:var(--focus-cta);display:inline-flex">' + ICONO + '</span><span>' + (esc ? t.filaC : t.filaCmov) + '</span></span>';
      const btn = '<button type="button" class="pace-rt-enlace pace-rt-fuerte" style="background:none;border:none;cursor:pointer;flex:0 0 auto;white-space:nowrap;padding:8px 0;margin:-8px 0;">' +
        (o.web ? t.filaCbtnWeb : t.filaCbtn) + ' ›</button>';
      fila.innerHTML = izq + btn;
      if (esc) {
        fila.style.marginTop = '10px'; fila.style.paddingTop = '8px'; fila.style.fontSize = '13px';
        esc.appendChild(fila);
      } else if (mov) {
        fila.style.marginTop = '10px'; fila.style.paddingTop = '8px'; fila.style.fontSize = '14px';
        mov.querySelector('[data-pace-ritmo-esquema]').after(fila);
      }
    }
    window.dispatchEvent(new Event('pace:home-relayout'));
    window.dispatchEvent(new Event('resize'));
  }, [op, o || {}, TEXTOS, ICONO]);
}

/* Lo que Ez pide mirar: scroll de la home, el aro, y si lo nuevo pisa algo o se sale de la tarjeta. */
async function medir(page) {
  return page.evaluate(() => {
    const vis = (e) => e && e.getBoundingClientRect().width > 0;
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find(vis);
    const aro = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pace-timer-d')) || null;
    const card = document.querySelector('[data-pace-ritmo-tarjeta]');
    const rc = card.getBoundingClientRect();
    const nuevo = document.querySelector('[data-maqueta]') || document.querySelector('[data-maqueta-nota] button');
    const r = { scroll: body ? Math.round(body.scrollHeight - body.clientHeight) : null, aro: aro && Math.round(aro), tarjeta: Math.round(rc.height) };
    if (!nuevo) return r;
    const rn = nuevo.getBoundingClientRect();
    /* Lo visible que no es lo nuevo ni lo contiene: textos, botones, losetas, puntos del esquema. */
    const otros = Array.from(card.querySelectorAll('button, [data-pace-ritmo-tarjeta-titulo], .pace-rt-esq-punto, .pace-rt-tm-nota, .pace-rt-tm-pildora'))
      .filter((e) => vis(e) && !nuevo.contains(e) && !e.contains(nuevo));
    const cortan = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
    /* El texto que se ve (sin el relleno que agranda el toque) es el que no puede pisar. */
    const visible = Array.from(nuevo.querySelectorAll('span, svg, i')).map((e) => e.getBoundingClientRect())
      .reduce((a, b) => ({ left: Math.min(a.left, b.left), right: Math.max(a.right, b.right), top: Math.min(a.top, b.top), bottom: Math.max(a.bottom, b.bottom) }));
    r.pisa = otros.filter((e) => cortan(visible, e.getBoundingClientRect())).map((e) => (e.textContent || e.className).trim().slice(0, 30));
    r.dentro = rn.left >= rc.left && rn.right <= rc.right && visible.top >= rc.top && visible.bottom <= rc.bottom;
    r.alto = Math.round(visible.bottom - visible.top);
    r.toque = [Math.round(rn.width), Math.round(rn.height)];
    r.lineas = Array.from(nuevo.querySelectorAll('span')).map((s) => Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight || 16) || 1));
    return r;
  });
}

/* La letra al 115 %, como tests/home-sin-scroll.spec.js: cada tamaño calculado × 1,15. */
async function letraGrande(page) {
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[data-pace-home-body], [data-pace-home-body] *'));
    const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
    els.forEach((e, i) => e.style.setProperty('font-size', (tam[i] * 1.15) + 'px', 'important'));
    window.dispatchEvent(new Event('pace:home-relayout'));
  });
}

/* ---------- La hoja «Tu día en el calendario», sin día todavía ---------- */

/* `v`: 'web' (sin las altas), 'altas' (Google y Outlook dados de alta), 'android', 'iphoneHoy'
   (solo el archivo, como hoy) o 'iphone' (con el plan de EventKit). Se monta la hoja de verdad con
   el día de «Una hora» y se le cambia lo que diría sin día. */
async function hoja(page, v, o) {
  await page.evaluate(([v, o, T]) => {
    const t = T[o.lang || 'es'];
    if (v === 'altas') { CALENDARIO_IDS.google = 'maqueta'; CALENDARIO_IDS.microsoft = 'maqueta'; }
    const caja = document.createElement('div');
    caja.setAttribute('data-maqueta-hoja', v);
    document.body.appendChild(caja);
    const plan = { m: ritmoMenu(getState(), '1h', null, null) };
    ReactDOM.createRoot(caja).render(React.createElement(RitmoCalendarioHoja, { plan, onClose() {} }));
  }, [v, o || {}, TEXTOS]);
  await page.locator('[data-pace-cal-resumen]').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  await page.evaluate(([v, o, T]) => {
    const t = T[o.lang || 'es'];
    const $ = (s) => document.querySelector(s);
    $('[data-pace-cal-resumen]').textContent = t.resumen;
    const archivo = $('[data-pace-cal-destino="archivo"]');
    const app = v === 'android' || v === 'iphone' || v === 'iphoneHoy';
    archivo.querySelector('.pace-rt-cal-s').textContent = app ? t.archivoSubApp : t.archivoSub;
    const ba = archivo.querySelector('button');
    ba.textContent = t.alElegir;
    if (v === 'web' || v === 'iphoneHoy') {
      /* Solo el archivo: se dice, sin prometer nada más. */
      ba.classList.add('pace-rt-lleno');
      const nota = document.createElement('div');
      nota.className = 'pace-rt-cal-cambiar';
      nota.textContent = v === 'web' ? t.webNota : t.iosNota;
      $('[data-pace-cal-resumen]').after(nota);
    }
    const movil = $('[data-pace-cal-destino="android"]');
    if (movil) {
      movil.querySelector('button').textContent = t.conectar;
      if (v === 'iphone') {
        movil.querySelector('.pace-rt-cal-n').textContent = t.iphone;
        movil.querySelector('.pace-rt-cal-s').textContent = t.iphoneSub;
      }
    }
    document.querySelectorAll('[data-pace-cal-destino="google"] button, [data-pace-cal-destino="microsoft"] button').forEach((b) => { b.textContent = t.conectar; });
    if (o.hecho) {
      const aviso = document.createElement('div');
      aviso.className = 'pace-rt-cal-aviso'; aviso.setAttribute('role', 'status');
      aviso.textContent = t.hecho;
      archivo.after(aviso);
      if (movil) { const b = movil.querySelector('button'); b.textContent = T[o.lang || 'es'] === T.en ? 'Disconnect' : 'Desconectar'; b.classList.remove('pace-rt-lleno'); }
      if (movil) movil.querySelector('.pace-rt-cal-s').textContent = (o.lang === 'en' ? 'Connected · your day goes here when you choose it' : 'Conectado · tu día irá aquí al elegirlo');
    }
  }, [v, o || {}, TEXTOS]);
}

module.exports = { TEXTOS, pintar, medir, letraGrande, hoja };
