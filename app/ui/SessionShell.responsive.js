/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   SessionShell.responsive — CSS responsive inyectado de las pantallas de sesión
   ============================================================================
   Extraído de SessionShell.jsx en la sesión 116 (v0.60.0): el shell rozaba las
   500 líneas (regla CLAUDE.md «archivos < 500 líneas») y añadir el slot de
   feedback lo habría empujado por encima. El bloque es autocontenido —solo
   referencia `document`— y su inyección es idempotente (comprueba el id antes
   de insertar), así que basta con cargarlo tras SessionShell.jsx.

   El responsive específico del bloque de feedback vive en SessionFeedback.jsx
   (no aquí): cada superficie gobierna su propia compactación.

   ============================================================
   CSS responsive de SessionShell (sesión 27 · v0.12.10).

   Patrón coherente con Primitives.Modal: selectores [data-*]
   con !important inyectados en <head>.

   Las pantallas de sesión son fullscreen (`inset: 0`), no cards
   centradas — su problema en móvil no es "el modal no cabe"
   sino "las tipografías monumentales rompen el layout":
     - prep muestra 3-2-1 a 200px (demasiado en 375px de ancho)
     - done muestra `routine.name` a 56px italic
     - stats en fila con gap 40 desbordan con 2 o 3 stats
     - padding root 28/48/40 se come 96px útiles de 375

   En móvil se ajusta:
   - Padding root: 28/48/40 → 16/20/24
   - Header título: 22 → 18
   - Prep núm 200 → 128, copy 20 → 15
   - Done círculo 120 → 80, h1 56 → 34, copy 18 → 14
   - Stats row: gap 40 → 20, padding lateral para que no rocen
     los bordes cuando son 3
   - Hint: bottom 14 → 6

   No se mueve la estructura; las tipografías sólo reescalan.
   ============================================================ */
(function () {
  const _paceSessionResponsive = document.getElementById('pace-session-responsive-css');
  if (_paceSessionResponsive) return;
  const s = document.createElement('style');
  s.id = 'pace-session-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-session-root] {
        padding: 16px 20px 24px !important;
      }
      [data-pace-session-title] {
        font-size: 18px !important;
      }
      [data-pace-session-prep-num] {
        font-size: 128px !important;
      }
      [data-pace-session-prep-copy] {
        font-size: 15px !important;
        margin-top: 20px !important;
      }
      [data-pace-session-done-hero] {
        width: 80px !important;
        height: 80px !important;
        margin-bottom: 18px !important;
      }
      [data-pace-session-done-hero] svg {
        width: 34px !important;
        height: 34px !important;
      }
      [data-pace-session-done-title] {
        font-size: 34px !important;
        margin-bottom: 18px !important;
      }
      [data-pace-session-stats] {
        gap: 20px !important;
        margin-bottom: 24px !important;
        flex-wrap: wrap !important;
      }
      [data-pace-session-stat-num] {
        font-size: 28px !important;
      }
      [data-pace-session-done-copy] {
        font-size: 14px !important;
        margin-bottom: 24px !important;
      }
      [data-pace-session-hint] {
        display: none !important;
      }
    }

    /* s113 — compactación por ALTURA (runner guiado, P1 del giro): el centro
       scrollable de s112 queda como red de seguridad; en los viewports
       objetivo (1280×600 · 1024×512 · 844×390 landscape) el contenido debe
       CABER. Solo ≥641px de ancho: el bloque móvil de arriba sigue
       gobernando el retrato estrecho (360×640 ya verificado en s112).
       Orden de reducción: espacios → tipografía monumental (prep/done/timer,
       decorativo-escalable) — NUNCA instrucciones ni controles. Los ajustes
       específicos del runner v1 ([data-pace-v1-*]) viven en
       MoveSessionV1.support.jsx. Tier 700 (no 720): a ≥701 px todo cabía ya
       en s112 — las alturas estándar quedan idénticas. */
    @media (min-width: 641px) and (max-height: 700px) {
      [data-pace-session-root] {
        padding: 18px 32px 20px !important;
      }
      [data-pace-session-prep-num] {
        font-size: 140px !important;
      }
      [data-pace-session-prep-copy] {
        margin-top: 24px !important;
      }
      [data-pace-session-done-hero] {
        width: 88px !important;
        height: 88px !important;
        margin-bottom: 16px !important;
      }
      [data-pace-session-done-hero] svg {
        width: 36px !important;
        height: 36px !important;
      }
      [data-pace-session-done-title] {
        font-size: 40px !important;
        margin-bottom: 16px !important;
      }
      [data-pace-session-stats] {
        margin-bottom: 20px !important;
      }
      [data-pace-session-done-copy] {
        margin-bottom: 20px !important;
      }
      [data-pace-move-timer] {
        font-size: 96px !important;
      }
    }
    @media (min-width: 641px) and (max-height: 560px) {
      [data-pace-session-root] {
        padding: 12px 24px 14px !important;
      }
      [data-pace-session-title] {
        font-size: 18px !important;
      }
      [data-pace-session-prep-num] {
        font-size: 110px !important;
      }
      [data-pace-session-prep-copy] {
        font-size: 16px !important;
        margin-top: 16px !important;
      }
      [data-pace-session-done-hero] {
        width: 68px !important;
        height: 68px !important;
        margin-bottom: 12px !important;
      }
      [data-pace-session-done-hero] svg {
        width: 28px !important;
        height: 28px !important;
      }
      [data-pace-session-done-title] {
        font-size: 32px !important;
        margin-bottom: 14px !important;
      }
      [data-pace-session-stat-num] {
        font-size: 28px !important;
      }
      [data-pace-move-timer] {
        font-size: 72px !important;
      }
      [data-pace-session-hint] {
        display: none !important;
      }
    }
    @media (min-width: 641px) and (max-height: 430px) {
      [data-pace-session-root] {
        padding: 10px 20px 12px !important;
      }
      [data-pace-session-prep-num] {
        font-size: 84px !important;
      }
      [data-pace-session-prep-copy] {
        font-size: 14px !important;
        margin-top: 12px !important;
      }
      /* s116: en el DONE, ocultar el HERO decorativo (el check de ceremonia)
         al llegar a este tier — reclama ~62px para que la fila de feedback
         (pregunta + respuestas + «Ahora no») y el CTA final quepan sin que el
         footer tape «Ahora no». Paso 2 del orden de compactación del corte
         (tras reducir espacios). El prep conserva su hero (no lo tiene). */
      [data-pace-session-done-hero] {
        display: none !important;
      }
      [data-pace-session-done-hero] svg {
        width: 22px !important;
        height: 22px !important;
      }
      [data-pace-session-done-title] {
        font-size: 24px !important;
        margin-bottom: 12px !important;
      }
      [data-pace-session-done-copy] {
        font-size: 13px !important;
        margin-bottom: 14px !important;
      }
      [data-pace-session-stats] {
        margin-bottom: 14px !important;
      }
      [data-pace-move-timer] {
        font-size: 60px !important;
      }
    }
  `;
  document.head.appendChild(s);
})();
