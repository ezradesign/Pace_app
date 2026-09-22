/* PACE · A tu ritmo · la hoja (s192)
   ==================================
   Inyectada una sola vez, patrón de `library.css.jsx`: IIFE idempotente con su
   guard de id. En CSS y no en línea porque el panel existe DOS VECES —escritorio
   y móvil— y es una media query la que elige (768/769, el mismo corte que
   `_responsive.pieles.js`).

   Calcado de la maqueta de la ronda 4 (docs/proposals/a-tu-ritmo-r4.html), que el
   usuario aprobó mirándola. Solo tokens de la app, y el lenguaje de lo que ya
   existe: la tarjeta del Camino (papel, línea, radio md, sombra suave), los
   nombres en cursiva display y la versalita para lo que es sistema. Colores por
   módulo como en Actividades; la comida, en tinta (no es un plato del menú).

   NI UN BACKTICK DENTRO DEL TEMPLATE LITERAL (trampa de s172b). */
(function () {
  if (document.getElementById('pace-ritmo-css')) return;
  const s = document.createElement('style');
  s.id = 'pace-ritmo-css';
  s.textContent = `
.pace-rt-esc { display: block; }
.pace-rt-mov { display: none; }
@media ${PACE_CORTE_MOVIL} {
  .pace-rt-esc { display: none; }
  .pace-rt-mov { display: block; }
}
/* s195: LA COPIA COMPACTA TAMBIEN CUANDO EL PANEL ES ESTRECHO, no solo cuando el
   viewport es de movil. Una tableta en vertical (820 px) lleva la piel de
   escritorio con su barra lateral de 280, y al panel le quedan ~460: la linea con
   nueve paradas no cabe ni en tres niveles (etiquetas pisadas, medido en la
   auditoria de s195) y el titulo se parte palabra a palabra. El envoltorio
   [data-pace-ritmo-panel] es el contenedor; por debajo de 620 px manda la copia
   de movil, que esta hecha para 360-430 y cabe de sobra. */
[data-pace-ritmo-panel] { container-type: inline-size; }
@container (max-width: 620px) {
  .pace-rt-esc { display: none; }
  .pace-rt-mov { display: block; }
}
[data-pace-ritmo] :where(button) { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }

/* EL RÓTULO del corte del aro. Con menú lleva debajo «Hasta las …» y sube lo que
   mide esa línea (12 + 3 px): así el panel no se mueve y el nombre ocupa el hueco
   de la fila de ciclo, que el aro oculta sin soltar su sitio (ronda 4). */
.pace-rt-rotulo { text-align: center; margin-bottom: 10px; }
.pace-rt-rotulo.pace-rt-con-hasta { margin-top: -15px; }
.pace-rt-hasta { font-size: 10px; line-height: 12px; margin-top: 3px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-3); }

.pace-rt-panel { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-md);
  box-shadow: var(--sh-soft); padding: 16px 22px 14px; text-align: left; }
.pace-rt-titulo { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 19px; line-height: 1.15; color: var(--ink); }
.pace-rt-sub { font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink-3); line-height: 1.3; margin-top: 2px; }
.pace-rt-meta { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.pace-rt-enlace { font-family: var(--font-display); font-style: italic; font-size: 12px; letter-spacing: 0.04em; color: var(--ink-3);
  text-decoration: underline; text-underline-offset: 3px; white-space: nowrap; }
.pace-rt-enlace:hover { color: var(--ink); }
.pace-rt-enlace.pace-rt-fuerte { color: var(--focus-cta); }
.pace-rt-cab { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
/* «HOY VOY POR LIBRE» (s194, variante E): la única salida del menú, como píldora en verde —el
   lenguaje de los chips de contexto, con el color de la acción secundaria— en la cabecera
   (escritorio) o en el pie (móvil). No usa .pace-rt-enlace: no es un enlace más.
   s195: se llama .pace-rt-porlibre y NO .pace-rt-libre, porque ese nombre ya era el del
   tramo del retraso (.pace-rt-seg.pace-rt-libre, por su tipo): con el mismo nombre, el
   hueco heredaba el borde verde y el padding de la píldora y salía como una barra rayada
   de 10 px (el usuario la vio en su captura; 260 tests verdes no miraban su caja). */
.pace-rt-porlibre { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--focus-cta);
  border: 1px solid var(--focus-cta); border-radius: var(--r-pill); padding: 4px 10px; white-space: nowrap;
  transition: background var(--dur-quick) var(--ease); }
.pace-rt-porlibre:hover { background: var(--focus-soft); }
.pace-rt-porlibre:focus-visible { outline: 2px solid var(--focus-cta); outline-offset: 2px; }
.pace-rt-pie { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
.pace-rt-der { display: flex; gap: 14px; align-items: center; }
/* La parte derecha de la cabecera del menú (escritorio, s195): el RESUMEN del día con
   «Cambiar» y los chips con la píldora. Antes el resumen era un absoluto a 21 px sobre la
   línea —la misma banda donde la etiqueta «AHORA» se ancla al bloque de ahora— y se
   pisaban en cuanto el bloque actual caía en el último cuarto del día, en los nueve
   viewports de escritorio medidos. En la cabecera no comparte banda con nada.
   Dos formas según lo ancho que sea el PANEL (container query, porque el panel cambia de
   ancho también al plegar la barra lateral): con sitio, todo en la fila del título
   (resumen · chips · píldora) y el panel no crece ni un píxel; sin sitio, dos filas a la
   derecha, chips arriba y resumen debajo (+19 px). Medido en es: resumen 246 + 14 + chips
   327 = 587 a la derecha; el título de «Una hora» llegando tarde mide 451 y el de la
   jornada entera unos 400. El corte va en 1000 px de contenido: por encima, al título le
   quedan al menos 397 y como mucho se parte en dos líneas (lo que cuesta lo mismo que la
   columna); por debajo (1366 → 962, 1280 → 876, 1024 → 620) la fila del título ya no da
   para las dos cosas. 1536×704 (1132) y 1440×789 (1036) van en fila. */
.pace-rt-panel { container-type: inline-size; }
.pace-rt-der-col { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.pace-rt-der-col .pace-rt-sobre { order: 2; }
.pace-rt-sobre { display: flex; align-items: center; justify-content: flex-end; gap: 14px; }
.pace-rt-sobre .pace-rt-meta { font-size: 9px; letter-spacing: 0.14em; }
@container (min-width: 1000px) {
  .pace-rt-der-col { flex-direction: row; align-items: center; gap: 14px; }
  .pace-rt-der-col .pace-rt-sobre { order: 0; }
}

/* LAS OPCIONES */
.pace-rt-chips { display: flex; gap: 10px; margin-top: 14px; }
.pace-rt-chip { flex: 1 1 0; min-width: 0; border: 1px solid var(--line) !important; border-radius: var(--r-md);
  padding: 10px 14px !important; text-align: left; background: var(--paper) !important;
  transition: background var(--dur-quick) var(--ease), border-color var(--dur-quick) var(--ease); }
.pace-rt-chip:hover:not(:disabled) { background: var(--focus-soft) !important; border-color: var(--focus-cta) !important; }
.pace-rt-chip:disabled { opacity: 0.5; cursor: default; }
.pace-rt-chip b { display: block; font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 16px; color: var(--ink); line-height: 1.1; }
.pace-rt-chip > span { display: block; font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink-2); margin-top: 4px; }   /* s195c: la hora en itálica, como en la tarjeta por libre */

/* EL CONTEXTO (fijo por ahora: el onboarding contextual es la Fase 8) */
.pace-rt-ctx { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.pace-rt-ctx span { font-size: 10px; letter-spacing: 0.08em; color: var(--ink-2); border: 1px solid var(--line);
  border-radius: var(--r-pill); padding: 3px 9px; white-space: nowrap; }

/* EL HORARIO se edita dentro de la frase: <select> nativo con aspecto de texto
   subrayado. El padding vertical agranda la zona de toque sin mover la línea. */
.pace-rt-sel { appearance: none; -webkit-appearance: none; font: inherit; color: var(--ink); cursor: pointer;
  background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7 5'%3E%3Cpath d='M.5.8 3.5 4 6.5.8' fill='none' stroke='%238A8372' stroke-width='1.1'/%3E%3C/svg%3E") no-repeat right 1px center / 7px 5px;
  border: 0; border-bottom: 1px dotted var(--line-2); border-radius: 0; padding: 6px 11px 1px 1px; margin: -6px 1px 0;
  field-sizing: content; }
.pace-rt-sel:hover { border-bottom-color: var(--ink-3); }
.pace-rt-sel:focus-visible { outline: 2px solid var(--focus-cta); outline-offset: 2px; }
.pace-rt-frase { margin-top: 3px; }

/* GLIFOS: los de Actividades, en el color de su módulo. SUSTITUYEN al punto. */
.pace-rt-g { display: inline-grid; place-items: center; color: var(--c); line-height: 0; flex-shrink: 0; }
.pace-rt-g svg { width: 100%; height: 100%; display: block; }
.pace-rt-gota { width: 11px; height: 11px; margin-left: 4px; vertical-align: -2px; }

/* LA LÍNEA DEL DÍA (escritorio), proporcional al tiempo.
   LA LÍNEA SIGUE AL ARO (s193, ronda 1 aprobada mirándola): el tramo de AHORA está
   encendido al 35 % y se RELLENA con el bloque —el ::after mide --pace-bloque, que
   publica useLuzHome en [data-pace-home-body], cuantizado a 96 pasos—; lo hecho
   queda en verde entero, porque atenuado leía como «no hecho» (el usuario). Así el
   35 % solo significa «a punto de correr». La parada ABIERTA lleva el borde entero
   de su módulo, su lavado y la etiqueta encima; la pasada conserva su fuerza y
   solo deja de poder tocarse. */
.pace-rt-linea { position: relative; display: flex; align-items: center; margin: 18px 4px 0; height: 24px; }
.pace-rt-seg { height: 4px; border-radius: 2px; background: var(--paper-3); position: relative; }
.pace-rt-seg.pace-rt-ahora { background: color-mix(in srgb, var(--focus) 35%, var(--paper-3)); }
.pace-rt-seg.pace-rt-ahora::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px;
  width: calc(var(--pace-bloque, 0) * 100%); background: var(--focus); transition: width 900ms linear; }
.pace-rt-seg.pace-rt-hecho { background: var(--focus); }
.pace-rt-seg.pace-rt-comida { background: repeating-linear-gradient(90deg, var(--line) 0 4px, transparent 4px 8px); height: 2px; }
.pace-rt-seg.pace-rt-libre { background: repeating-linear-gradient(90deg, var(--line) 0 2px, transparent 2px 5px); height: 2px; }
.pace-rt-ahora-tag { position: absolute; left: 0; bottom: 16px; font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--focus); white-space: nowrap; }
.pace-rt-nodo { flex: 0 0 auto; width: 24px; height: 24px; border-radius: 50%; margin: 0 2px; position: relative;
  border: 1px solid color-mix(in srgb, var(--c) 50%, transparent); background: var(--paper);
  display: flex; align-items: center; justify-content: center; gap: 1px;
  transition: transform var(--dur-quick) var(--ease), background var(--dur-quick) var(--ease); }
.pace-rt-nodo .pace-rt-g { width: 16px; height: 16px; }
.pace-rt-nodo.pace-rt-larga { width: 40px; border-radius: 12px; }
.pace-rt-nodo.pace-rt-toca { cursor: pointer; }
.pace-rt-nodo.pace-rt-toca:hover { transform: scale(1.12); background: color-mix(in srgb, var(--c) 12%, var(--paper)); }
.pace-rt-nodo.pace-rt-ahora { border: 1.5px solid var(--c); background: color-mix(in srgb, var(--c) 14%, var(--paper)); }
.pace-rt-nodo .pace-rt-ahora-tag { left: 50%; transform: translateX(-50%); bottom: 27px; color: var(--c); }
.pace-rt-nodo.pace-rt-pasado { cursor: default; }
/* s195: LA LÍNEA TIENE MEMORIA. La parada hecha se rellena con su color (22 %) y su
   borde entero; la saltada queda al 40 % y a trazos, y arrastra su etiqueta (vive
   dentro). Lo pasado sin marca (antes de s195, o sin sesión) sigue como estaba. */
.pace-rt-nodo.pace-rt-hecha { border: 1.5px solid var(--c); background: color-mix(in srgb, var(--c) 22%, var(--paper)); }
.pace-rt-nodo.pace-rt-saltada { opacity: 0.4; border-style: dashed; }
.pace-rt-mini .pace-rt-punto.pace-rt-hecha { background: var(--c); }
.pace-rt-mini .pace-rt-punto.pace-rt-saltada { opacity: 0.4; border-style: dashed; }
.pace-rt-comida-nodo { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 24px; height: 24px;
  border-radius: 50%; border: 1px solid color-mix(in srgb, var(--ink-2) 35%, transparent); background: var(--paper);
  display: grid; place-items: center; }
.pace-rt-comida-nodo .pace-rt-g { width: 17px; height: 17px; }
/* La frase de la primera vez, bajo la cabecera (RitmoComo) */
.pace-rt-como { margin-top: 5px; }
/* Las etiquetas las coloca el JS (hasta tres niveles, de forma voraz) */
.pace-rt-etiq { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); width: max-content; max-width: 132px;
  text-align: center; line-height: 1.22; pointer-events: none; }
.pace-rt-seg .pace-rt-etiq { top: 18px; }
.pace-rt-etiq.pace-rt-alta::before { content: ''; position: absolute; left: calc(50% + var(--rt-hilo, 0px)); bottom: 100%; height: var(--rt-sube, 40px); border-left: 1px solid var(--line); }
.pace-rt-etiq.pace-rt-alta.pace-rt-final::before { left: auto; right: calc(6px - var(--rt-hilo, 0px)); }
.pace-rt-etiq.pace-rt-final { left: auto; right: -6px; transform: none; text-align: right; }
.pace-rt-etiq > span { display: block; }
.pace-rt-etiq .pace-rt-h { font-size: 10px; letter-spacing: 0.06em; color: var(--ink-3); font-variant-numeric: tabular-nums; }
.pace-rt-etiq .pace-rt-n { font-family: var(--font-display); font-style: italic; font-size: 13px; line-height: 1.12; color: var(--ink); }
.pace-rt-etiq .pace-rt-m { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-top: 1px; white-space: nowrap; }
.pace-rt-etiq .pace-rt-gota { width: 10px; height: 10px; margin-left: 3px; }
.pace-rt-zona { height: 52px; }

/* COMPACTO (móvil) */
.pace-rt-mini { display: flex; align-items: center; height: 12px; margin: 14px 0 10px; }
.pace-rt-mini .pace-rt-punto { flex: 0 0 auto; width: 8px; height: 8px; border-radius: 50%; border: 2px solid var(--c); background: var(--paper); margin: 0 2px; }
.pace-rt-mini .pace-rt-punto.pace-rt-larga { width: 14px; border-radius: 4px; }
.pace-rt-mini .pace-rt-punto.pace-rt-ahora { background: var(--c); }
.pace-rt-fila { display: grid; grid-template-columns: 52px 1fr auto; align-items: center; gap: 8px; padding: 7px 0; border-top: 1px solid var(--paper-3); }
.pace-rt-fila .pace-rt-meta { font-size: 9px; }
.pace-rt-que { min-width: 0; }
.pace-rt-que .pace-rt-n { font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.15; color: var(--ink); }
.pace-rt-que .pace-rt-m { font-size: 11px; color: var(--ink-3); margin-top: 1px; }
.pace-rt-fila .pace-rt-g { width: 18px; height: 18px; margin-right: 6px; vertical-align: -3px; }
.pace-rt-otra { font-size: 10px !important; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3) !important;
  border: 1px solid var(--line) !important; border-radius: var(--r-pill); padding: 5px 10px !important; min-height: 28px; }
.pace-rt-otra:hover { color: var(--ink) !important; border-color: var(--line-2) !important; }

/* LA JORNADA ENTERA (dentro del Modal de la app) */
.pace-rt-lista { margin-top: 14px; text-align: left; }
.pace-rt-li { display: grid; grid-template-columns: 44px 18px 1fr auto; gap: 0 10px; align-items: start; }
.pace-rt-li .pace-rt-h { font-size: 11px; color: var(--ink-3); font-variant-numeric: tabular-nums; padding-top: 3px; text-align: right; }
.pace-rt-eje { position: relative; align-self: stretch; }
.pace-rt-eje::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; border-left: 1px solid var(--line); }
.pace-rt-eje i { position: absolute; left: -3px; top: 0; width: 24px; height: 24px; border-radius: 50%; background: var(--paper);
  border: 1px solid color-mix(in srgb, var(--c) 50%, transparent); display: grid; place-items: center; }
.pace-rt-eje i.pace-rt-larga { height: 42px; border-radius: 12px; grid-auto-flow: row; align-content: center; gap: 1px; }
.pace-rt-eje i .pace-rt-g { width: 15px; height: 15px; }
.pace-rt-li.pace-rt-tramo { min-height: 26px; }
.pace-rt-li.pace-rt-tramo .pace-rt-txt { font-size: 11px; color: var(--ink-3); padding-top: 3px; }
.pace-rt-li.pace-rt-tramo .pace-rt-eje::before { border-left: 3px solid var(--paper-3); left: 7px; }
.pace-rt-li.pace-rt-hueco .pace-rt-eje::before { border-left: 1px dotted var(--line-2); left: 8px; }
.pace-rt-li.pace-rt-plato { padding-bottom: 10px; }
.pace-rt-li.pace-rt-pasado { opacity: 0.5; }
/* s197 · LA HOJA RECUERDA, con la misma regla que la línea (s195): la parada hecha
   conserva la tinta y su glifo se rellena al 22 % con borde de 1,5; la saltada baja
   al 40 % y puntea. Antes lo pasado se atenuaba entero y no distinguía una de otra. */
.pace-rt-li.pace-rt-hecha .pace-rt-eje i { border: 1.5px solid var(--c); background: color-mix(in srgb, var(--c) 22%, var(--paper)); }
.pace-rt-li.pace-rt-saltada { opacity: 0.4; }
.pace-rt-li.pace-rt-saltada .pace-rt-eje i { border-style: dashed; }
.pace-rt-plato-n { font-family: var(--font-display); font-style: italic; font-size: 17px; line-height: 1.15; color: var(--ink); }
.pace-rt-plato-m { font-size: 11px; color: var(--ink-3); margin-top: 2px; }

/* El enlace de vuelta desde «por libre», junto a «Ver caminos». En móvil pierde
   la pregunta y se queda en «Ponle ritmo al día»: entera no cabe junto al otro.
   (s195b: ya no se pinta en la home —la tarjeta por libre lo sustituye—; queda por
   si vuelve a hacer falta un enlace de vuelta.) */
.pace-rt-solo-esc { display: inline; }
@media ${PACE_CORTE_MOVIL} { .pace-rt-solo-esc { display: none; } }

/* LA TARJETA POR LIBRE (s195b, 5A «pero más bonita»): la pregunta en display
   itálica, la frase de siempre debajo, cuatro losetas con la hora de fin en
   itálica (no en versalita: es una hora, no un rótulo) y una regla fina que
   las separa del pie. La loseta se enciende al pasar con el lavado del foco y
   el borde de la acción; el pie lleva «Ajustar el horario» y «Ver caminos». */
.pace-rt-tarjeta { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-md);
  box-shadow: var(--sh-soft); padding: 16px 22px 16px; text-align: left; }
.pace-rt-tarjeta-cab { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
.pace-rt-tarjeta-enlaces { display: flex; gap: 16px; align-items: center; flex-shrink: 0; padding-bottom: 2px; }
.pace-rt-tarjeta-t { font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 24px; line-height: 1.1; color: var(--ink); }
.pace-rt-tarjeta-s { font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink-3); margin-top: 4px; }
.pace-rt-losetas { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.pace-rt-loseta { flex: 1 1 0; min-width: 0; border: 1px solid var(--line) !important; border-radius: var(--r-md);
  padding: 12px 14px 11px !important; text-align: left; background: var(--paper) !important;
  transition: background var(--dur-quick) var(--ease), border-color var(--dur-quick) var(--ease), transform var(--dur-quick) var(--ease); }
.pace-rt-loseta:hover:not(:disabled) { background: var(--focus-soft) !important; border-color: var(--focus-cta) !important; transform: translateY(-1px); }
.pace-rt-loseta:focus-visible { outline: 2px solid var(--focus-cta); outline-offset: 2px; }
.pace-rt-loseta:disabled { opacity: 0.5; cursor: default; }
.pace-rt-loseta b { display: block; font-family: var(--font-display); font-style: italic; font-weight: 500; font-size: 19px; color: var(--ink); line-height: 1.1; }
.pace-rt-loseta > span { display: block; font-family: var(--font-display); font-style: italic; font-size: 13px; color: var(--ink-2); margin-top: 5px; }
@media ${PACE_CORTE_MOVIL} {
  .pace-rt-tarjeta { padding: 14px 14px 12px; }
  .pace-rt-tarjeta-cab { flex-wrap: wrap; align-items: flex-start; }
  .pace-rt-tarjeta-enlaces { width: 100%; justify-content: space-between; padding-bottom: 0; margin-top: 6px; }
  .pace-rt-tarjeta-t { font-size: 20px; }
  .pace-rt-losetas { grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
  .pace-rt-loseta { padding: 10px 12px 9px !important; }
  .pace-rt-loseta b { font-size: 16px; }
}
@container (max-width: 620px) { .pace-rt-losetas { grid-template-columns: 1fr 1fr; } }

/* EL MINI INTERRUPTOR DE LA COMIDA (s195b, 6C): 22×12 en tinta, pegado a la palabra. */
.pace-rt-comes { white-space: nowrap; }
.pace-rt-mini-int { display: inline-block; width: 22px; height: 12px; border-radius: 6px; border: 1px solid var(--ink-3) !important; vertical-align: -1px; margin: 0 2px 0 6px; position: relative; background: var(--paper) !important; padding: 0 !important; cursor: pointer; transition: background var(--dur-quick) var(--ease), border-color var(--dur-quick) var(--ease); }
.pace-rt-mini-int::after { content: ''; position: absolute; top: 1px; left: 1px; width: 8px; height: 8px; border-radius: 50%; background: var(--ink-3); transition: left var(--dur-quick) var(--ease), background var(--dur-quick) var(--ease); }
.pace-rt-mini-int.pace-rt-on { background: var(--ink) !important; border-color: var(--ink) !important; }
.pace-rt-mini-int.pace-rt-on::after { left: 11px; background: var(--paper); }
.pace-rt-mini-int:focus-visible { outline: 2px solid var(--focus-cta); outline-offset: 2px; }

@media ${PACE_CORTE_MOVIL} {
  .pace-rt-panel { padding: 12px 14px 10px; }
  .pace-rt-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
  .pace-rt-chip { padding: 9px 12px !important; }
  .pace-rt-chip b { font-size: 15px; }
  .pace-rt-pie { margin-top: 8px; }
  .pace-rt-titulo { font-size: 17px; }
}
`;
  document.head.appendChild(s);
})();
