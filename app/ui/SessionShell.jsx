/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   SessionShell — cáscara compartida de sesiones activas
   =====================================================
   Extraído en sesión 26 (v0.12.8) desde la duplicación detectada entre
   Breathe y Move en el informe `docs/audits/audit-v0.12.7.md`:
     - sessionStyles / moveSessionStyles (idénticos salvo gap)
     - SessionHeader / MoveHeader (idéntico JSX)
     - Stat / MoveStat (byte-por-byte iguales)
     - Pantalla 'prep' (countdown 3-2-1, 200px italic)
     - Pantalla 'done' (círculo check 120px + stats + copy italic)

   Regla no negociable: ningún cambio de comportamiento observable.
   Los módulos pasan `accent` (color CSS var), copy específico y
   el subconjunto de stats que quieran mostrar.

   API expuesta a `window`:
     - SessionShell   → root + header con salida
     - SessionPrep    → cuenta atrás de preparación
     - SessionDone    → pantalla de completado
     - SessionStat    → cifra grande + label pequeño
     - sessionShellStyles → objeto de estilos por si un módulo necesita
                            componer layouts custom (ej: dots / ruler)

   Los colores se pasan como strings de var CSS:
     accent:      'var(--breathe)' | 'var(--move)' | 'var(--extra)'
     accentSoft:  'var(--breathe-soft)' | 'var(--move-soft)' | ...
   ============================================================ */

/* Estilos base — fusión de sessionStyles + moveSessionStyles.
   Los dos originales eran idénticos salvo `center.gap` (32 en breathe,
   ausente en move). Lo absorbemos aceptando `gap` como prop opcional
   en SessionShell — por defecto sin gap (ningún módulo necesitaba
   exactamente 32; Breathe usaba ese gap entre visual+texto pero
   dentro de `center` ya hay flexbox column ahí que lo controla). */
const sessionShellStyles = {
  root: {
    position: 'fixed', inset: 0,
    background: 'var(--paper)',
    zIndex: 90,
    display: 'flex',
    flexDirection: 'column',
    padding: '28px 48px 40px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  exitBtn: {
    fontSize: 13, color: 'var(--ink-2)',
    padding: '6px 10px',
  },
  center: {
    /* s112: minHeight 0 + overflowY auto — en pantallas de poca altura el
       contenido central hace scroll y el footer (acción primaria) queda
       SIEMPRE accesible. El centrado vive en centerBody (margin auto: centra
       cuando cabe, alinea arriba cuando desborda — el justify-center clásico
       recorta el inicio del contenido al desbordar). */
    flex: '1 1 0%', minHeight: 0, overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
  },
  centerBody: {
    margin: 'auto', width: '100%',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  centerGap: {
    gap: 32,
  },
  footer: {
    /* s113: wrap — en anchos estrechos los controles opcionales del runner
       guiado (Más tiempo · Pausar · primaria) pasan a 2 filas en vez de
       desbordar; el footer sigue siempre accesible (s112). */
    display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
  },
  ctrlBtn: {
    padding: '10px 22px',
    fontSize: 13,
    border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-md)',
    background: 'var(--paper-2)',
    color: 'var(--ink)',
  },
};

/* ============================================================
   SessionShell — root + header + slot de children + footer
   Props:
     - routine        → { code, name } para el header
     - onExit(reason) → cerrar sesión ('exit' | 'done')
     - headerExtra    → nodo entre el título y el botón "× Salir"
     - footerGap      → gap entre botones del footer (default 12)
     - centerGap      → true para añadir gap:32 al contenedor central
                        (el patrón de Breathe con visual+texto)
     - children       → contenido del área central (lo que va dentro de .center)
     - footer         → nodo del footer (botones de control)
     - hint           → texto de ayuda en la base ("Espacio pausar · …")
   ============================================================ */
/* ============================================================
   ATMÓSFERA DE SESIÓN — wash radial del acento del módulo
   ------------------------------------------------------------
   s99 la introdujo (solo en Caminos) y s138 la llevó a TODA sesión, que es
   cuando su banding se hizo visible en pantallas grandes. s100, s138 y s139
   lo persiguieron sobre el tile de ruido rasterizado en un canvas; s140 lo
   midió donde ocurre —los PÍXELES REALES de la página, capturados por CDP en
   PNG sin pérdida y promediados a lo largo del contorno ELÍPTICO del propio
   degradado, que es lo que integra el ojo— y aparecieron dos cosas que
   cambian el remedio entero:

     1. EL GRANO NO DITHERA, SOLO TAPA. La escalera mide lo mismo con grano
        (0,314) que sin él (0,318): cuando el grano se compone encima, el
        degradado YA está redondeado a 8 bits. Un dither tiene que entrar
        ANTES de la cuantización; este entra después, así que como mucho
        enmascara. Todo lo que s100 y s138 ajustaron ahí —paradas, frecuencia—
        actuaba sobre una variable que no gobierna el fenómeno.
     2. APILAR EL MISMO DEGRADADO DOS VECES DUPLICA EL ESCALÓN. Los dos
        redondeos caen en los MISMOS radios y se suman. Medido sin depender de
        la geometría, contando qué niveles enteros existen de verdad: el
        recorrido usaba 17 de sus 24 niveles (escalón 1,41 — la mitad no
        llegaba a existir). Con UNA capa del color ya compuesto: 22 de 23
        (escalón 1,05). Por eso la atmósfera era la peor de las tres
        superficies: no por repartir la rampa entre más píxeles, sino porque
        su escalón valía el doble.

   De ahí las dos mitades del arreglo, y el orden importa: primero se parte el
   escalón por la mitad (estructural), y solo después se enmascara lo que queda
   (perceptual). Enmascarar sin lo primero era pelear contra un escalón doble.

   ALPHA COMPUESTO. Componer un color consigo mismo dos veces con alpha a da
   exactamente 1−(1−a)² = a·(2−a). Se pide con SINTAXIS DE COLOR RELATIVO sobre
   el propio token, así que cada módulo y cada paleta conservan el suyo (Foco
   0,10 · Respira 0,12 · oscuro 0,14): no se sube ningún alpha de tinte —regla
   s100 intacta—, se deja de redondear dos veces. De propina: el doble redondeo
   sesgaba el wash hasta 1 nivel MÁS oscuro que el color pedido; ahora pinta el
   que es. Si el motor no soporta color relativo se cae a las dos capas de
   siempre (mismo aspecto, escalón de antes).

   GRANO. Medido en pantalla y no en canvas: σ 0,678 con la receta de s138,
   por debajo del escalón que debe tapar. Tres cambios lo suben a 1,23
   ENSUCIANDO MENOS el papel:
     - `color-interpolation-filters='sRGB'` — los filtros SVG van en linearRGB
       por defecto y se comían la mitad de la amplitud (hallazgo de s139);
     - alpha CONSTANTE en vez de ruidosa: la de s138 gastaba media (oscurecía)
       sin aportar σ;
     - curva estirada alrededor del MISMO centro: más contraste da más σ por
       cada décima de media desplazada.
   Papel medido lejos del wash: con la receta de s138 (240,21 · 235,52 ·
   223,07) contra el token (242 · 237 · 224) — desvío DESIGUAL, que además lo
   desatura; con la nueva (240,50 · 235,50 · 222,50), desvío parejo: oscurece
   un pelo sin virar el color.

   LO QUE NO FUNCIONA, para no reintentarlo: añadir paradas (el número de
   escalones lo fija el color, no la forma de la rampa); tocar `baseFrequency`
   (no cambia la amplitud, medido en s139); y un tile OPACO con `mix-blend-mode`
   dentro de un subárbol con `opacity` (rompió el loto en s139; la regla sigue
   viva). Banco de medida y método: docs/sessions/session-140.
   ============================================================ */

/* Opacidad del grano. Va con la receta de abajo: con alpha constante y curva
   estirada, 0,011 rinde más σ que el 0,055 de s138 y desplaza menos la media.
   Si se toca la receta hay que RE-MEDIR las dos cosas, no solo mirar. */
const PACE_GRAIN_OPACITY = 0.011;

function paceGrainUrl(opacity = PACE_GRAIN_OPACITY, baseFrequency = 1.4, tile = 160) {
  const k = 8;                              /* pendiente de la curva de contraste */
  const b = (0.5 - 0.5 * k).toFixed(3);     /* la deja centrada en el gris medio */
  const fn = c => '%3CfeFunc' + c + " type='linear' slope='" + k + "' intercept='" + b + "'/%3E";
  return 'url("data:image/svg+xml,'
    + "%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + tile + "' height='" + tile + "'%3E"
    + "%3Cfilter id='n' color-interpolation-filters='sRGB'%3E"
    + "%3CfeTurbulence type='fractalNoise' baseFrequency='" + baseFrequency + "' numOctaves='3' stitchTiles='stitch'/%3E"
    + "%3CfeColorMatrix type='saturate' values='0'/%3E"
    + '%3CfeComponentTransfer%3E' + fn('R') + fn('G') + fn('B')
    + "%3CfeFuncA type='linear' slope='0' intercept='1'/%3E"
    + '%3C/feComponentTransfer%3E%3C/filter%3E'
    + "%3Crect width='" + tile + "' height='" + tile + "' filter='url(%23n)' opacity='" + opacity + "'/%3E%3C/svg%3E\")";
}

/* paceGlowRamp — resplandor circular con la MISMA forma de caída que la
   atmósfera de s138, reescalada a cualquier borde. Las cinco paradas de la
   atmósfera, normalizadas sobre su propio borde (56%), caen en 0 · 0,214 ·
   0,464 · 0,679 · 0,839 · 1: se reutilizan tal cual para no inventar una curva
   nueva por superficie. Sustituye a los radiales de DOS paradas. */
function paceGlowRamp(soft, edge) {
  const at = f => `${(edge * f).toFixed(1)}%`;
  return `radial-gradient(circle, ${soft} 0%, ${soft} ${at(0.214)}, `
       + `color-mix(in srgb, ${soft} 62%, transparent) ${at(0.464)}, `
       + `color-mix(in srgb, ${soft} 28%, transparent) ${at(0.679)}, `
       + `color-mix(in srgb, ${soft} 9%, transparent) ${at(0.839)}, transparent ${edge}%)`;
}

/* PaceDither — capa de grano para una superficie CIRCULAR.
   El grano se enmascara con la misma caída que el resplandor: sin la máscara
   el ruido cubriría el cuadrado entero del elemento y, como el degradado ya es
   transparente pasado `edge`, se vería un disco de ruido con borde duro contra
   el papel. La máscara es un degradado más, pero un degradado que modula RUIDO
   no bandea: no hay estructura suave que contornear. Misma técnica de máscara
   que ya gobierna el loto (decisión s138). */
function PaceDither({ edge = 74, opacity = PACE_GRAIN_OPACITY }) {
  const fade = `radial-gradient(#000 0%, #000 ${(edge * 0.5).toFixed(1)}%, transparent ${edge}%)`;
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
      backgroundImage: paceGrainUrl(opacity),
      WebkitMaskImage: fade, maskImage: fade,
    }} />
  );
}

/* ¿Sabe el motor pedir el alpha compuesto? (color relativo: Chromium 119,
   Safari 16.4, Firefox 128). Se comprueba UNA vez: si no, se cae a las dos
   capas de siempre — mismo aspecto, con el escalón doble de antes. */
const PACE_CAN_RELATIVE = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
  && CSS.supports('background-color', 'rgb(from red r g b / calc(alpha * 1.5))');

const SESSION_ATMOS_GRAIN = paceGrainUrl();
function sessionAtmosphere(soft) {
  const mix = p => 'color-mix(in srgb, ' + soft + ' ' + p + '%, transparent)';
  const ramp = f => 'radial-gradient(130% 70% at 50% -8%, ' + f(soft) + ' 0%, ' + f(soft) + ' 12%, '
    + f(mix(62)) + ' 26%, ' + f(mix(28)) + ' 38%, ' + f(mix(9)) + ' 47%, transparent 56%)';
  if (!PACE_CAN_RELATIVE) {
    const g = ramp(c => c);
    return SESSION_ATMOS_GRAIN + ', ' + g + ', ' + g + ', var(--paper)';
  }
  const comp = c => 'rgb(from ' + c + ' r g b / calc(alpha * (2 - alpha)))';
  return SESSION_ATMOS_GRAIN + ', ' + ramp(comp) + ', var(--paper)';
}

function SessionShell({ routine, onExit, headerExtra, children, footer, hint, footerGap = 12, centerGap = false, atmosphere }) {
  const rootStyle = atmosphere
    ? { ...sessionShellStyles.root, background: sessionAtmosphere(atmosphere) }
    : sessionShellStyles.root;
  return (
    <div data-pace-session-root style={rootStyle}>
      <SessionHeader routine={routine} onExit={onExit} extra={headerExtra} />
      <div data-pace-session-center style={sessionShellStyles.center}>
        <div data-pace-session-center-body style={centerGap
          ? { ...sessionShellStyles.centerBody, ...sessionShellStyles.centerGap }
          : sessionShellStyles.centerBody
        }>
          {children}
        </div>
      </div>
      {footer && (
        <div data-pace-session-footer style={{ ...sessionShellStyles.footer, gap: footerGap }}>
          {footer}
        </div>
      )}
      {hint && (
        <div data-pace-session-hint style={{
          position: 'absolute', bottom: 14, left: 0, right: 0,
          textAlign: 'center', fontSize: 10,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--ink-3)', opacity: 0.6,
        }}>{hint}</div>
      )}
    </div>
  );
}

function SessionHeader({ routine, onExit, extra }) {
  const { t } = useT();
  return (
    <div data-pace-session-header style={sessionShellStyles.header}>
      <div>
        <Meta style={{ fontSize: 10 }}>{routine.code}</Meta>
        <h2 data-pace-session-title style={{
          ...displayItalic,
          fontSize: 22, margin: '2px 0 0', fontWeight: 500,
        }}>{routine.name}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {extra}
        <button onClick={() => onExit('exit')} style={sessionShellStyles.exitBtn}>{t('session.exit')}</button>
      </div>
    </div>
  );
}

/* ============================================================
   SessionPrep — pantalla de cuenta atrás 3-2-1
   Props:
     - routine        → header passthrough
     - onExit         → header passthrough
     - accent         → color del número gigante (var CSS)
     - prepCount      → número a mostrar (3..0)
     - copy           → línea italic bajo el número
                        ("Siéntate cómodo. Respira natural." / "De pie. Sin prisa. 6 pasos.")
     - onSkip         → callback del botón "Empezar ahora"
   ============================================================ */
function SessionPrep({ routine, onExit, accent, prepCount, copy, onSkip, atmosphere }) {
  const { t } = useT();
  return (
    <SessionShell
      routine={routine}
      onExit={onExit}
      atmosphere={atmosphere}
      footer={<button onClick={onSkip} style={sessionShellStyles.ctrlBtn}>{t('session.startNow')}</button>}
    >
      <div data-pace-session-prep style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{
          fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 18,
        }}>{t('session.prep')}</div>
        <div data-pace-session-prep-num style={{
          ...displayItalic,
          fontSize: 200, fontWeight: 400, lineHeight: 0.9,
          color: accent,
          fontVariantNumeric: 'tabular-nums',
        }}>{prepCount > 0 ? prepCount : '·'}</div>
        <div data-pace-session-prep-copy style={{
          ...displayItalic,
          /* marginTop 20 -> 40: el numeral (200px, lineHeight 0.9) baja su
             tinta sobre el caption con solo 20px de aire -> solapamiento
             (bug s96). Empujar el caption ~20px lo separa limpio. En movil
             el override reduce el numeral a 128px, alli 20px basta. (s97) */
          fontSize: 20, color: 'var(--ink-2)', marginTop: 40,
        }}>{copy}</div>
      </div>
    </SessionShell>
  );
}

/* ============================================================
   SessionDone — pantalla de completado
   Props:
     - routine        → header passthrough
     - onExit         → header passthrough
     - accent         → color del círculo check + botón
     - accentSoft     → fondo soft del círculo
     - doneMeta       → "Sesión completada" / "Antídoto completado"
     - doneCopy       → párrafo italic bajo las stats
     - stats          → [{ label, value }] — se renderizan con <SessionStat>
     - buttonVariant  → 'terracota' (Breathe) o null (Move usa estilo custom)
     - buttonStyle    → override del style del botón "Volver al inicio"
   ============================================================ */
function SessionDone({
  routine, onExit, accent, accentSoft,
  doneMeta, doneCopy, stats = [],
  buttonVariant, buttonStyle, doneButtonLabel, atmosphere, feedback, rootData,
}) {
  const { t } = useT();
  /* doneButtonLabel: override del label del CTA. Dentro de un Camino la
     sesion pasa t('session.next') ("Siguiente") -- onExit('done') ya avanza
     el Camino; sin el override el label por defecto es "Volver al inicio"
     (home). Bug de coherencia reportado por el usuario.
     feedback (s116 · B2.2b-2): slot OPCIONAL bajo el copy de cierre — los
     runners de cuerpo/respiración pasan <SessionFeedback/> (fuera de Caminos);
     undefined = sin bloque (Foco de Camino, PathFocusStep). El bloque decide
     por sí mismo si mostrarse (gate por-día) y no altera el CTA de regreso.
     rootData (s170): atributos `data-*` sueltos sobre el nodo del cierre, para
     que un runner pueda publicar un número que la pantalla NO enseña. Nace con
     el tiempo activo de Mueve/Estira, cuyo consumidor de verdad es el emisor
     de `session.completed` (Fase 3) — hasta que exista, el dato no tendría
     dónde comprobarse. Mismo recurso que `data-pace-week-hold` (s166): el
     número viaja en el atributo y la vista sigue diciendo lo que decía. */
  const label = doneButtonLabel || t('session.backToHome');
  const btn = buttonVariant
    ? <Button variant={buttonVariant} onClick={() => onExit('done')}>{label}</Button>
    : <Button onClick={() => onExit('done')} style={buttonStyle}>{label}</Button>;

  return (
    <SessionShell routine={routine} onExit={onExit} atmosphere={atmosphere} footer={btn}>
      <div data-pace-session-done {...(rootData || {})} style={{ textAlign: 'center', maxWidth: 520 }}>
        <div data-pace-session-done-hero style={{
          width: 120, height: 120, margin: '0 auto 24px',
          borderRadius: '50%',
          background: accentSoft,
          border: `1.5px solid ${accent}`,
          display: 'grid', placeItems: 'center',
          animation: 'pace-fade-in 600ms ease',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
               stroke={accent} strokeWidth="1.5"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div style={{
          fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--ink-3)', marginBottom: 12,
        }}>{doneMeta}</div>
        <h1 data-pace-session-done-title style={{
          ...displayItalic,
          fontSize: 56, fontWeight: 500, margin: '0 0 24px', lineHeight: 1.05,
        }}>{routine.name}</h1>
        {stats.length > 0 && (
          <div data-pace-session-stats style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 36 }}>
            {stats.map((s, i) => <SessionStat key={i} label={s.label} value={s.value} />)}
          </div>
        )}
        <p data-pace-session-done-copy style={{
          ...displayItalic,
          fontSize: 18, color: 'var(--ink-2)',
          maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.5,
        }}>{doneCopy}</p>
        {feedback}
      </div>
    </SessionShell>
  );
}

/* ============================================================
   SessionStat — cifra grande italic + label pequeño
   Fusión de `Stat` (Breathe) y `MoveStat` (Move) — byte-por-byte iguales.
   ============================================================ */
function SessionStat({ label, value }) {
  return (
    <div data-pace-session-stat style={{ textAlign: 'center' }}>
      <div data-pace-session-stat-num style={{
        ...displayItalic,
        fontSize: 40, fontWeight: 500, lineHeight: 1,
        color: 'var(--ink)',
      }}>{value}</div>
      <div style={{
        fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--ink-3)', marginTop: 8,
      }}>{label}</div>
    </div>
  );
}

/* ============================================================
   Guards de teclado de las sesiones (s116 · B2.2b-2)
   ------------------------------------------------------------
   Los runners (MoveSessionV1 / MoveSessionLegacy / BreatheSession) escuchan
   `keydown` a nivel de window. Al añadir el bloque de feedback en el DONE con
   botones interactivos, esos atajos globales NO deben interferir con los
   controles enfocados:

   - sessionKeyOnControl(e): el foco está en un control interactivo (botón,
     enlace, campo, contenteditable). Se usa `closest` —no `matches`— porque el
     target puede ser un <span> hijo del botón. Sirve para dejar que Espacio
     active nativamente el chip/CTA en vez de robarlo con preventDefault.
   - sessionDoneKeyBlocked(e): el atajo global de DONE (Enter → onExit('done'))
     debe ignorarse si hay foco en un control (evita una SEGUNDA salida cuando
     el botón ya se activa por su onClick), si el evento fue preventDefault,
     durante composición IME, o con modificadores Ctrl/Meta/Alt.

   El CSS responsive de las pantallas de sesión vive ahora en
   SessionShell.responsive.js (extraído en s116 para no rebasar 500 líneas).
   ============================================================ */
function sessionKeyOnControl(e) {
  const t = e && e.target;
  return !!(t && t.closest && t.closest('button,a,input,select,textarea,[contenteditable="true"]'));
}
function sessionDoneKeyBlocked(e) {
  if (!e) return false;
  return !!(e.isComposing || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || sessionKeyOnControl(e));
}

Object.assign(window, {
  SessionShell, SessionHeader, SessionPrep, SessionDone, SessionStat,
  sessionShellStyles, sessionAtmosphere,
  paceGrainUrl, paceGlowRamp, PaceDither,
  sessionKeyOnControl, sessionDoneKeyBlocked,
});