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
/* sessionAtmosphere - fondo de "atmosfera" por paso (s99; suavizado s100).
   Un wash radial muy tenue del acento del modulo (Respira terracota, Foco
   verde, Cuerpo tan, Agua azul) concentrado arriba y desvanecido hacia paper.
   Doble capa del token *-soft para que el tinte se note sin gritar.
   s100 (banding): la rampa lineal de 2 stops con alphas ~0.10 producia
   anillos visibles en buffers de 8 bits (peor en oscuro). Dos remedios:
   (1) hint de interpolacion al 22% -> caida tipo ease-out, la zona externa
   queda mas plana; (2) capa de grano SVG casi invisible (feTurbulence
   desaturado, opacity 0.04, tile 160px) como dither que rompe la
   cuantizacion. El grano lee como fibra de papel: coherente con el tono.
   Solo se usa dentro de Caminos (los steps pasan el token; el home no). */
/* s138 — SEGUNDA pasada de banding. El remedio de s100 bastaba en el tamaño en
   que se veía entonces (dentro de Caminos), pero al llevar la atmósfera a las
   sesiones sueltas se ve en pantallas grandes, donde la MISMA rampa se reparte
   entre muchos más píxeles: cada peldaño de 8 bits ocupa más ancho y los
   anillos se hacen visibles (reportado en PC, no en móvil — coherente con la
   causa). Se respeta la regla de s100 de NO subir alphas; se actúa sobre el
   dither y sobre la forma de la rampa:
     - grano más FINO (baseFrequency 0.9 -> 1.4) y algo más presente
       (0.04 -> 0.055): es ruido desaturado, sigue leyéndose como fibra de papel;
     - la rampa deja de ser dos paradas + hint y pasa a CINCO paradas explícitas
       siguiendo una caída tipo ease-out. Con más puntos de control el
       compositor interpola tramos cortos y no hay ningún tramo largo donde el
       redondeo a 8 bits produzca un salto visible. */
/* ============================================================
   s139 · DITHER COMPARTIDO — una sola receta de grano para toda la app
   ------------------------------------------------------------
   El grano vivía como constante privada de este archivo mientras dos radiales
   más (el halo del loto y el círculo de retención de Respira) bandeaban SIN
   tratar. Duplicar la cadena del SVG en cada sitio garantizaba que divergieran,
   así que la receta se extrae aquí y se expone a `window`.

   POR QUÉ EL GRANO Y NO MÁS PARADAS. El banding tiene una causa aritmética
   medida: el número de escalones lo fija el color, no la forma de la rampa.
   `--breathe-soft` (rgba(201,122,93,0.12)) sobre `--paper` (#F2EDE0) recorre
   `(224−93)×0,12 = 15,72` niveles de 8 bits en el canal azul (verificado contra
   el DOM). Repartidos sobre el radio de la rampa dan **3,5 px por banda** en el
   círculo de retención (140 px) y **6,8 px** en el halo (288 px): visibles los
   dos. Añadir paradas NO cambia esos 15,72 niveles —solo mueve dónde caen los
   saltos—; lo que rompe el contorno es ruido de amplitud comparable a un
   escalón. De ahí que el remedio principal sea el dither y las paradas el
   acompañamiento. Y explica lo ya observado en s138 y confirmado por el usuario
   en su móvil: a más píxeles por banda, más visible ⇒ se ve en PC y no en el
   teléfono.

   POR QUÉ LA RECETA DE s100/s138 NO BASTABA (medido en s139, tras un reporte del
   usuario de que en PC se seguían viendo las bandas). Se instrumentó el tile real
   rasterizándolo en un canvas y midiendo su desviación típica en niveles de
   8 bits, y se midió el banding con una métrica directa: la longitud de las
   MESETAS (píxeles consecutivos con el mismo valor de 8 bits) a lo largo de la
   rampa. Tres hallazgos:

     1. La atmósfera es el peor caso, no el halo: apila el MISMO degradado DOS
        veces, así que su alpha efectivo es 1−(1−0,12)² = 0,2256 y recorre 29,6
        niveles sobre una rampa de ~353 px ⇒ **11,9 px por banda**, casi el doble
        que el halo (6,8) y 3,4× el círculo de retención (3,5).
     2. El grano tenía σ = 0,639 niveles: POR DEBAJO del escalón de 1 nivel que
        debía enmascarar. Era más un velo oscuro (bajaba la media 1,18 niveles)
        que un dither.
     3. La causa de fondo: los filtros SVG operan por defecto en **linearRGB**.
        Forzar `color-interpolation-filters='sRGB'` sube σ de 0,639 a 1,004 con
        la MISMA opacidad — la mitad del dither se perdía en la conversión. Y el
        `baseFrequency` no influye en la amplitud (σ 0,639 a 1,4 contra 0,636 a
        0,9), así que el ajuste de frecuencia de s138 no movió la aguja.

   LO QUE SE INTENTÓ Y SE REVIRTIÓ (s139): un tile OPACO de ruido centrado en
   gris medio en sRGB, compuesto en `overlay`. Medía mucho mejor —σ 1,641 contra
   0,639 y sin teñir el papel (desvío −0,47), verificado en ambas paletas— pero
   **rompía el loto** y se deshizo. Motivo, para no repetirlo: el contenedor del
   halo lleva `opacity` variable ⇒ stacking context AISLADO ⇒ un
   `mix-blend-mode` sin backdrop pinta el gris opaco tal cual, y aparecía un
   disco gris sobre el mandala. Además el `background-blend-mode` de la atmósfera
   sí se aplicó y NO resolvió el banding que se ve en pantalla, así que la
   hipótesis tampoco estaba cerrada.

   ESTADO REAL: **el banding de la atmósfera sigue SIN resolver** y es el peor de
   los tres (11,9 px por banda). Lo que sí quedó de s139 es la rampa de cinco
   paradas compartida y el dither aplicado a los dos radiales que no lo tenían.
   Las mediciones de arriba son el punto de partida para quien lo retome; la vía
   del tile opaco solo es viable donde haya backdrop garantizado (entre capas de
   `background` del MISMO elemento), nunca dentro de subárboles con opacidad.
   ============================================================ */
/* RECETA DE s138, CONSERVADA. En s139 se intentó sustituirla por un tile OPACO
   de ruido centrado en gris medio compuesto en `overlay` (que medía σ 1,641 en
   vez de 0,639 y sin teñir) y **se revirtió: rompía el loto**. Motivo, para que
   nadie lo reintente a ciegas: el contenedor del halo lleva `opacity` variable,
   y eso crea un stacking context AISLADO; dentro de un grupo aislado un
   `mix-blend-mode` no tiene backdrop contra el que fusionarse, así que el gris
   opaco se pinta tal cual y aparece un disco gris sobre el mandala. Un tile
   opaco solo es viable donde haya backdrop garantizado (p. ej. entre capas de
   `background` del MISMO elemento), no dentro de subárboles con opacidad.
   Ver la nota de banding pendiente en STATE.md antes de volver a intentarlo. */
function paceGrainUrl(opacity = 0.055, baseFrequency = 1.4, tile = 160) {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${baseFrequency}' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='${tile}' height='${tile}' filter='url(%23n)' opacity='${opacity}'/%3E%3C/svg%3E")`;
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
function PaceDither({ edge = 74, opacity = 0.055 }) {
  const fade = `radial-gradient(#000 0%, #000 ${(edge * 0.5).toFixed(1)}%, transparent ${edge}%)`;
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
      backgroundImage: paceGrainUrl(opacity),
      WebkitMaskImage: fade, maskImage: fade,
    }} />
  );
}

const SESSION_ATMOS_GRAIN = paceGrainUrl();
function sessionAtmosphere(soft) {
  const g = `radial-gradient(130% 70% at 50% -8%, ${soft} 0%, ${soft} 12%, `
          + `color-mix(in srgb, ${soft} 62%, transparent) 26%, `
          + `color-mix(in srgb, ${soft} 28%, transparent) 38%, `
          + `color-mix(in srgb, ${soft} 9%, transparent) 47%, transparent 56%)`;
  return `${SESSION_ATMOS_GRAIN}, ${g}, ${g}, var(--paper)`;
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
  buttonVariant, buttonStyle, doneButtonLabel, atmosphere, feedback,
}) {
  const { t } = useT();
  /* doneButtonLabel: override del label del CTA. Dentro de un Camino la
     sesion pasa t('session.next') ("Siguiente") -- onExit('done') ya avanza
     el Camino; sin el override el label por defecto es "Volver al inicio"
     (home). Bug de coherencia reportado por el usuario.
     feedback (s116 · B2.2b-2): slot OPCIONAL bajo el copy de cierre — los
     runners de cuerpo/respiración pasan <SessionFeedback/> (fuera de Caminos);
     undefined = sin bloque (Foco de Camino, PathFocusStep). El bloque decide
     por sí mismo si mostrarse (gate por-día) y no altera el CTA de regreso. */
  const label = doneButtonLabel || t('session.backToHome');
  const btn = buttonVariant
    ? <Button variant={buttonVariant} onClick={() => onExit('done')}>{label}</Button>
    : <Button onClick={() => onExit('done')} style={buttonStyle}>{label}</Button>;

  return (
    <SessionShell routine={routine} onExit={onExit} atmosphere={atmosphere} footer={btn}>
      <div data-pace-session-done style={{ textAlign: 'center', maxWidth: 520 }}>
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