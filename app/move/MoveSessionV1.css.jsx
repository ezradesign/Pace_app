/* PACE · Runner de Mueve y Estira — LA HOJA DE ESTILO (opción A del runner guiado)
   ================================================================================
   La maqueta la hacen dos cosas, y esta hoja solo pone medidas y aire:
     · las PILAS de MoveSessionV1.cuerpo.jsx, que dan a cada texto su sitio fijo en toda la
       rutina (nada se mueve entre colocarse, trabajar, cambiar de lado y descansar);
     · `useV1Glifo`, que da al círculo del dibujo el alto que sobra.
   Por eso aquí no hay tramos por altura: el aire va en vh con suelo y techo, y la tipografía por
   piel (móvil hasta 640 px de ancho). Cuando ni con el círculo en su suelo cabe todo, el cuerpo
   (su raíz) lleva [data-pace-v1-justo]: menos aire y número más pequeño. Las instrucciones no se recortan
   nunca (jerarquía de s119).

   Los !important de la columna no son pereza: SessionShell pone en línea `margin: auto` al
   cuerpo central, y ninguna hoja gana a un estilo en línea sin él.

   OJO AL EDITARLO: ni un solo backtick dentro del template literal; el build aborta. */

const _paceMoveV1Css = document.getElementById('pace-move-v1-css');
if (!_paceMoveV1Css) {
  const s = document.createElement('style');
  s.id = 'pace-move-v1-css';
  s.textContent = `
    @keyframes pace-rep-pulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(0.86); }
      100% { transform: scale(1); }
    }

    /* El centro de la sesión es una columna que ocupa todo el alto: arriba el cuerpo, que se
       estira, y debajo la barra de pasos, siempre a la misma distancia del mando. Las medidas
       van en la raíz, que es madre de los dos. */
    [data-pace-session-center-body]:has(> .pace-v1-raiz) {
      margin: 0 !important; height: 100% !important;
      display: flex !important; flex-direction: column !important;
    }
    /* En escritorio el dibujo manda (es mayor que en el móvil a igual altura, la regla de la
       piel): con el nombre a 5vh y el número a 9,5vh, a 1530x702 el texto se comía el hueco y
       el círculo quedaba por debajo del del móvil. */
    .pace-v1-raiz {
      --v1-u: clamp(8px, calc(1.3 * var(--pace-vh, 1vh)), 18px);
      --v1-nombre: clamp(28px, calc(4.2 * var(--pace-vh, 1vh)), 44px);
      --v1-cue: 18px;
      --v1-num: clamp(52px, calc(8.2 * var(--pace-vh, 1vh)), 84px);
      --v1-fuerte: 20px;
      flex: 1 1 auto; min-height: 0; width: 100%;
      display: flex; flex-direction: column; align-items: center;
    }

    .pace-v1 {
      flex: 1 1 auto; min-height: 0; width: 100%; max-width: 620px; margin: 0 auto;
      padding-top: var(--v1-u);
      display: flex; flex-direction: column; align-items: center; row-gap: var(--v1-u);
      text-align: center;
    }
    .pace-v1-aire { flex: 1 1 0; min-height: 0; }

    /* El dibujo y su aro. StepGlyph trae su margen en línea; aquí manda la columna. */
    .pace-v1-glifo { position: relative; flex: none; display: grid; place-items: center; }
    .pace-v1-glifo > div:first-child { margin: 0 !important; }
    .pace-v1-aro { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); overflow: visible; pointer-events: none; }
    .pace-v1-aro circle { fill: none; }
    .pace-v1-aro-pista { stroke: var(--line); opacity: 0.55; }
    .pace-v1-aro-arco { stroke-linecap: round; transition: stroke-dasharray 1s linear; }

    [data-pace-v1-kicker] {
      flex: none; min-height: 1.2em; line-height: 1.2;
      font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; font-weight: 500;
    }

    /* Las pilas: todos los textos posibles en la misma celda, el vivo encima. */
    .pace-v1-pila { flex: none; width: 100%; display: grid; }
    .pace-v1-pila > * { grid-area: 1 / 1; margin: 0; min-width: 0; }
    .pace-v1-pila > .pace-v1-reserva { visibility: hidden; }

    .pace-v1-nombres > * {
      align-self: center; font-family: var(--font-display); font-style: italic; font-weight: 500;
      font-size: var(--v1-nombre); line-height: 1.12; text-wrap: balance;
    }
    /* La instrucción empieza siempre a la misma altura: si es más corta que su hueco, el aire
       queda debajo y la primera línea no baja media línea al pasar de colocarse a trabajar.
       Va en la serif itálica de la app, como el nombre (opción A elegida por Ez el 8 oct. 2026):
       en letra de interfaz desentonaba. Con el tope de 95 letras por frase cabe en dos líneas y
       el dibujo de Mueve no encoge más que el de Estira (tests/runner-letra.spec.js). */
    .pace-v1-cues > * {
      align-self: start; justify-self: center; max-width: 460px;
      font-family: var(--font-display); font-style: italic;
      font-size: var(--v1-cue); line-height: 1.32; color: var(--ink-2); text-wrap: pretty;
    }
    .pace-v1-colas > * { align-self: start; justify-self: center; max-width: 440px; }
    .pace-v1-colas > * > div, [data-pace-v1-cola] > div { display: grid; row-gap: 3px; }
    .pace-v1-fuerte {
      font-family: var(--font-display); font-style: italic; font-size: var(--v1-fuerte);
      line-height: 1.3; color: inherit;
    }
    [data-pace-v1-cola] .pace-v1-fuerte { color: var(--v1-acento, var(--ink-2)); }
    .pace-v1-apoyo { font-size: 13px; line-height: 1.45; color: var(--ink-3); }
    .pace-v1-cuidate { font-size: 13.5px; line-height: 1.5; color: var(--ink-3); }
    [data-pace-v1-care-label] {
      font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600;
      color: var(--v1-acento, var(--ink-3));
    }

    /* El número mide lo mismo en todas las fases (lo eligió el usuario en s177); solo cambia
       el color: la cuenta de colocarse va en tinta secundaria. */
    .pace-v1-numgrupo { flex: none; display: grid; justify-items: center; row-gap: 6px; }
    .pace-v1 [data-pace-v1-num] {
      font-family: var(--font-display); font-style: italic; font-weight: 400;
      font-size: var(--v1-num) !important; line-height: 0.95 !important;
      font-variant-numeric: tabular-nums;
    }
    .pace-v1-numfila { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 24px; }
    [data-pace-v1-numlabel] { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-3); }
    .pace-v1-mas {
      font-size: 12px; font-weight: 500; letter-spacing: 0.02em; color: var(--ink-2);
      background: var(--paper); border: 1px solid var(--line-2); border-radius: 999px;
      padding: 2px 10px; min-height: 24px; cursor: pointer;
    }
    .pace-v1-mas:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }

    /* La barra de pasos queda a la misma distancia del mando que el dibujo de la cabecera. */
    .pace-v1-pasos { flex: none; width: 100%; max-width: 640px; margin: var(--v1-u) auto calc(var(--v1-u) * 1.6); }
    .pace-v1-siguiente {
      text-align: center; margin-top: 8px; font-size: 10px; line-height: 1.45;
      letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-3);
    }

    /* El mando de tres. */
    .pace-v1-mando { display: flex; justify-content: center; align-items: center; gap: 28px; }
    .pace-v1-redondo {
      width: 48px; height: 48px; border-radius: 50%; padding: 0;
      border: 1px solid var(--line-2); background: var(--paper-2); color: var(--ink-2);
      display: grid; place-items: center; cursor: pointer; position: relative;
      transition: transform 160ms var(--ease), opacity 160ms;
    }
    .pace-v1-redondo:active { transform: scale(0.96); }
    .pace-v1-redondo:disabled { opacity: 0.35; cursor: default; transform: none; }
    .pace-v1-redondo:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
    .pace-v1-redondo svg {
      width: 22px; height: 22px; fill: none; stroke: currentColor;
      stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round;
    }
    .pace-v1-redondo .pace-v1-relleno { fill: currentColor; stroke: none; }
    .pace-v1-redondo-centro { width: 60px; height: 60px; color: var(--paper); }
    .pace-v1-oculto {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
    }

    @media (max-width: 640px) {
      .pace-v1-raiz {
        --v1-u: clamp(6px, 1.2vh, 12px);
        --v1-nombre: 28px;
        --v1-cue: 17px;
        --v1-num: clamp(48px, 8vh, 64px);
        --v1-fuerte: 18px;
      }
      .pace-v1-cuidate { font-size: 13px; }
      .pace-v1-mando { gap: 32px; }
    }

    /* Cuando no cabe ni con el círculo en su suelo. */
    .pace-v1-raiz[data-pace-v1-justo] { --v1-u: 5px; --v1-num: 46px; }

    @media (prefers-reduced-motion: reduce) {
      .pace-v1-aro-arco { transition: none; }
      .pace-v1-redondo { transition: none; }
    }
  `;
  document.head.appendChild(s);
}
