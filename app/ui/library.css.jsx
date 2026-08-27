/* PACE · app/ui/library.css.jsx (sesión 174)
   ===========================================
   LA HOJA DE LAS TRES BIBLIOTECAS, inyectada una sola vez. Patrón de
   `MoveSessionV1.css.jsx` (s172b): IIFE idempotente con su guard de id, sin
   exports, y basta con cargarla antes de los componentes que la usan.

   POR QUÉ EN CSS Y NO EN ESTILOS EN LÍNEA, que es lo que hace el resto de la
   app: la decisión de s173 es que el color de módulo se comporte DISTINTO en
   las dos pieles —filo en reposo en móvil, sólo en el hover en escritorio— y
   eso es una media query. Con estilos en línea haría falta un listener de
   resize y un re-render por cada cambio de ancho para pintar catorce tarjetas.

   NI UN BACKTICK DENTRO DEL TEMPLATE LITERAL: el build aborta y las medidas
   siguientes corren contra el artefacto viejo (trampa de s172b).

   El breakpoint es 768/769, el MISMO que `_responsive.pieles.js` usa para
   `--pace-skin`. Si algún día se mueve, se mueve en los dos sitios o la
   biblioteca se creerá de escritorio dentro de una home móvil. */
(function () {
  if (document.getElementById('pace-library-css')) return;
  /* EL GRANO SALE DEL SISTEMA, no de un valor nuevo: `paceGrainUrl()` vive en
     SessionShell.jsx con sus 0,011 de opacidad, baseFrequency 1.4 y tile 160.
     Se interpola aquí al inyectar, así que si aquel cambia, esto cambia con él.
     Por eso esta hoja CARGA DESPUÉS de SessionShell.jsx y no antes.

     Y LA OPACIDAD NO SE VUELVE A APLICAR EN CSS: va DENTRO del SVG (el `rect`
     lleva su propio `opacity`), como en `PaceDither`. La primera versión de
     esta hoja la ponía además como propiedad CSS, que es 0,011 x 0,011 -- un
     grano invisible. Lo destapó el verify al quejarse de que
     `PACE_GRAIN_OPACITY` es un `const` y no cruza la IIFE del artefacto: el
     aviso era de ámbito y el defecto, de composición. */
  const grano = (typeof paceGrainUrl === 'function') ? paceGrainUrl() : 'none';
  const s = document.createElement('style');
  s.id = 'pace-library-css';
  s.textContent = `
/* ── cabecera ─────────────────────────────────────────────────────────── */
.pace-lib-hd { margin-bottom: 2px; }
.pace-lib-k {
  font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
  color: var(--ink-3);
}
.pace-lib-hd-fila {
  display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
}
.pace-lib-hd h2 {
  font-family: var(--font-display); font-style: italic; font-weight: 500;
  font-size: 26px; margin: 2px 0; line-height: 1.15; color: var(--ink);
}
/* EL SUBTÍTULO EN CURSIVA DISPLAY, como el nombre. La única versalita que
   queda arriba es BIBLIOTECA, que es sistema y no contenido. */
.pace-lib-sub {
  margin: 2px 0 0; font-family: var(--font-display); font-style: italic;
  font-size: 15px; color: var(--ink-2); line-height: 1.3;
}
/* «Tus rutinas» en MÓVIL es un enlace en la cabecera; en escritorio es un
   bloque del lateral. No es incoherencia: el enlace resuelve la falta de ALTO,
   y en 1280 px esa falta no existe -- ahí el enlace cae en el punto más
   ignorable de la pantalla (medido en s173: x=1194 de 1280, 68 px de ancho, y
   el propio autor de la app no lo encontró). */
.pace-lib-link {
  background: none; border: 0; padding: 0; cursor: pointer;
  font-family: var(--font-display); font-style: italic; font-size: 15px;
  color: var(--premium); white-space: nowrap;
}
.pace-lib-link::after { content: ' \\203A'; }

/* ── filtros ──────────────────────────────────────────────────────────── */
.pace-lib-chips {
  display: flex; gap: 7px; padding: 12px 0 4px;
  overflow-x: auto; scrollbar-width: none;
}
.pace-lib-chips::-webkit-scrollbar { display: none; }
.pace-lib-chip {
  flex: 0 0 auto; font-family: inherit; font-size: 12px; padding: 7px 13px;
  border-radius: var(--r-pill); border: 1px solid var(--line-2);
  color: var(--ink-2); background: transparent; white-space: nowrap;
  cursor: pointer; text-align: left;
  transition: background 160ms var(--ease), color 160ms var(--ease), border-color 160ms var(--ease);
}
.pace-lib-chip[aria-pressed="true"] {
  background: var(--ink); color: var(--paper); border-color: var(--ink);
}
/* EL CONTADOR VIVE EN EL CHIP Y NO EN EL TÍTULO DE GRUPO. La regla: el número
   sirve donde NO se ve la respuesta. En un chip todavía no ves el resultado, y
   ahí evita el peor momento de un filtro -- tocarlo y encontrarte con nada.
   Bajo un título de grupo las tarjetas están ahí debajo: contar es repetir. */
.pace-lib-chip b {
  font-weight: 500; margin-left: 7px; color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}
.pace-lib-chip[aria-pressed="true"] b { color: rgba(242, 237, 224, .7); }

/* ── grupos y estado vacío ────────────────────────────────────────────── */
.pace-lib-grp {
  font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
  color: var(--ink-3); font-weight: 500; margin: 18px 0 8px;
}
.pace-lib-now {
  font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
  color: var(--tone); font-weight: 500; margin: 14px 0 9px;
}
.pace-lib-vacio {
  margin: 0 0 14px; font-family: var(--font-display); font-style: italic;
  font-size: 14.5px; color: var(--ink-3); line-height: 1.45;
}
.pace-lib-vacio b {
  font-family: 'EB Garamond', Georgia, serif; font-style: normal;
  font-weight: 400; color: var(--ink-2);
}
.pace-lib-quitar {
  background: none; border: 0; padding: 0; font: inherit; cursor: pointer;
  color: var(--tone); border-bottom: 1px solid currentColor;
}
.pace-lib-quitar::after { content: ' \\203A'; }

/* ── la tarjeta ───────────────────────────────────────────────────────── */
.pace-lib-card {
  background: var(--paper-2); border-radius: var(--r-md);
  border-left: 3px solid var(--tone);
  padding: 11px 13px 11px 14px; margin-bottom: 9px;
  position: relative; display: flex; gap: 12px; align-items: flex-start;
  width: 100%; text-align: left; font-family: inherit; color: inherit;
}

.pace-lib-card > .pace-lib-txt { flex: 1; min-width: 0; }
.pace-lib-titulo {
  display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
}
.pace-lib-card h4 {
  font-family: var(--font-display); font-style: italic; font-weight: 500;
  font-size: 20px; margin: 0; line-height: 1.2; color: var(--ink);
}
/* El boton que cubre la tarjeta entera. Es texto plano hasta que se enfoca:
   asi el encabezado sigue siendo un encabezado y la tarjeta sigue siendo
   clicable de punta a punta. El ::after se dimensiona contra la TARJETA, que
   es quien lleva position:relative. */
.pace-lib-hit {
  background: none; border: 0; padding: 0; margin: 0; cursor: pointer;
  font: inherit; color: inherit; text-align: left;
}
.pace-lib-hit::after { content: ''; position: absolute; inset: 0; }
.pace-lib-hit:focus-visible::after {
  outline: 2px solid var(--tone); outline-offset: 2px; border-radius: var(--r-md);
}
.pace-lib-hit:focus:not(:focus-visible) { outline: none; }
.pace-lib-card p {
  margin: 4px 0 6px; font-size: 12.5px; color: var(--ink-2); line-height: 1.4;
}
/* EL NIVEL EN PILL, junto al nombre. Se probaron pill sin borde y cursiva;
   ganó la pill mirándola. Coste medido en s173: las 14 pills pintan 56 bordes,
   más que todo lo demás junto. Decisión consciente. */
.pace-lib-pill {
  font-style: normal; font-family: var(--font-ui); font-size: 9px;
  letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3);
  border: 1px solid var(--line-2); border-radius: var(--r-pill);
  padding: 2px 8px; position: relative; top: -2px;
}
/* LA LÍNEA DE CONTEXTO se lleva TODO lo que es cómo-se-hace: dónde, con qué,
   «por lado» y Premium. Va en cursiva display, redactada como se diría en voz
   alta. La CIFRA de minutos en EB Garamond porque DESIGN_SYSTEM.md fija esa
   familia como las cifras de identidad (racha del sidebar, MM:SS del timer):
   la duración es de esa familia y conecta la biblioteca con el timer. Sólo la
   cifra -- «min» sigue en sans. */
.pace-lib-ctx {
  font-family: var(--font-display); font-style: italic; font-size: 15px;
  color: var(--ink-2); display: flex; flex-wrap: wrap; gap: 0 4px;
  align-items: baseline; line-height: 1.35;
}
.pace-lib-ctx b {
  font-family: 'EB Garamond', Georgia, serif; font-style: normal;
  font-size: 19px; font-weight: 400; color: var(--ink-2); line-height: 1;
}
.pace-lib-ctx u {
  font-family: var(--font-ui); font-style: normal; text-decoration: none;
  font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
  color: var(--ink-3); margin-left: 1px;
}
/* EL SEPARADOR CUELGA DEL TROZO ANTERIOR, y no del siguiente. Dos defectos de
   un golpe, los dos vistos en la maqueta y ninguno leyendo: (1) los trozos son
   flex items y el navegador COLAPSA el espacio al principio de uno, así que
   «MIN · sentado» se leía «MIN ·sentado»; (2) al partirse la línea en dos, el
   punto abría el renglón siguiente («·por lado»). Colgando del anterior no
   puede hacer ninguna de las dos. */
.pace-lib-ctx u::after,
.pace-lib-ctx em:not(:last-child)::after {
  content: '\\B7'; color: var(--line-2); font-style: normal; margin-left: .34em;
}
.pace-lib-ctx .pace-lib-pre { color: var(--premium); }
.pace-lib-ctx .pace-lib-soon { color: var(--premium); font-weight: 500; }
/* La tira: la capitular a 62 px y el resto a 20. El 55 % de opacidad NO valía
   -- el usuario no los registraba y reportó «sólo muestra un glifo». Si no se
   leen, no están. */
.pace-lib-tira { display: flex; gap: 5px; align-items: center; margin: 7px 0 0; opacity: .75; }
.pace-lib-cap { flex-shrink: 0; margin-top: 2px; color: var(--tone); }
.pace-lib-tira, .pace-lib-tira * { color: var(--tone); }
.pace-lib-pie {
  margin-top: 7px; font-size: 10.5px; letter-spacing: .1em;
  text-transform: uppercase; color: var(--ink-3);
}
/* El sello de seguridad de Respira: 6 rutinas con guía de apnea o de
   respiración rápida (medido en s174 -- son SEIS, no cinco). */
.pace-lib-safety {
  position: absolute; top: 11px; right: 11px; width: 18px; height: 18px;
  border-radius: 50%; background: var(--breathe-soft); color: var(--breathe);
  display: grid; place-items: center; font-size: 11px; font-weight: 600;
}
.pace-lib-card-resp { padding-right: 34px; }
/* GRANO DE PAPEL con los valores del sistema, no unos nuevos:
   PACE_GRAIN_OPACITY y paceGrainUrl() (SessionShell.jsx). La maqueta probó
   0,055 -- cinco veces más-- y eso habría sido una decisión nueva. */
.pace-lib-card::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  border-radius: inherit; background-size: 160px 160px;
  background-image: ${grano};
}

/* ── lo que cambia entre las dos pieles ───────────────────────────────── */
/* ESCRITORIO. El catálogo NO lleva color en reposo: aquí se ven catorce
   tarjetas a la vez y el filo que en móvil orienta, aquí satura. El color de
   módulo entra en el HOVER, que es lo que hace Card (Primitives.jsx:115) y lo
   que la fila de s173 declara vigente: en PACE el color de módulo no dice lo
   que hay, dice lo que estás tocando. */
@media (min-width: 769px) {
  .pace-lib-card {
    border-left-color: transparent;
    transition: transform 220ms var(--ease), box-shadow 220ms var(--ease),
                border-left-color 220ms var(--ease);
  }
  .pace-lib-card:not([data-locked="1"]):hover {
    border-left-color: var(--tone);
    transform: translateY(-1px);
    box-shadow: var(--sh-soft);
  }
  .pace-lib-cuerpo { display: flex; align-items: flex-start; gap: 0; }
  .pace-lib-lateral {
    width: 262px; flex: 0 0 262px; padding: 4px 20px 20px 0;
    align-self: stretch;
  }
  .pace-lib-lateral .pace-lib-chips { flex-direction: column; padding-top: 0; overflow: visible; }
  .pace-lib-main { flex: 1; min-width: 0; padding-left: 22px; border-left: 1px solid var(--line); }
  /* minmax(0,1fr) y no 1fr: «repeat(3,1fr)» NO deja encoger las columnas y la
     rejilla desbordaba 35 px (medido en s173). La cabecera de grupo va a todo
     el ancho para que ningún grupo se parta entre columnas. */
  .pace-lib-rejilla {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 20px; align-content: start;
  }
  .pace-lib-rejilla > .pace-lib-grp,
  .pace-lib-rejilla > .pace-lib-vacio { grid-column: 1 / -1; }
  .pace-lib-lateral-tit {
    font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
    color: var(--ink-3); margin: 0 0 11px;
  }
  .pace-lib-lateral-tit + * { margin-bottom: 26px; }
  /* en el lateral la tarjeta se compacta: sin descripción, sin series y sin
     tira -- el lateral orienta, no es catálogo */
  .pace-lib-lateral .pace-lib-card p,
  .pace-lib-lateral .pace-lib-card .pace-lib-pie,
  .pace-lib-lateral .pace-lib-tira { display: none; }
  .pace-lib-lateral .pace-lib-card h4 { font-size: 17px; }
}
/* Las piezas que existen en las DOS pieles pero sólo se pintan en una. Se
   montan las dos veces y la hoja apaga la que sobra: «--pace-skin» es un token
   CSS, y decidir esto en JS pediría un listener de resize y un re-render por
   cada cambio de ancho para catorce tarjetas. Lo apagado por «display:none»
   sale del árbol de accesibilidad y no recibe clics, así que en cada momento
   hay exactamente UNA viva. */
@media (min-width: 769px) {
  .pace-lib-solo-movil { display: none; }
  /* en escritorio «Tus rutinas» es el bloque del lateral, no un enlace: ahí
     caería en x=1194 de 1280, el punto más ignorable de la pantalla */
  .pace-lib-hd .pace-lib-link { display: none; }
}
/* MÓVIL. Aquí el filo TRABAJA: ves 3 o 4 tarjetas a la vez y es lo único que
   dice de un vistazo si estás en Mueve (ocre) o en Estira (azul) sin leer la
   cabecera. No es una excepción a la regla de arriba: es otra función. */
@media (max-width: 768px) {
  .pace-lib-hd h2 { font-size: 24px; }
  .pace-lib-lateral { display: none; }
}

/* EL CHROME DEL MODAL SE RECORTA PARA LA BIBLIOTECA, y esto salió de MEDIR la
   app y no la maqueta -- que se dibujó sobre un marco de teléfono a pelo y por
   eso nunca enseñó este coste. Medido en s174, antes de tocarlo:
     a 360 px el ancho útil era 286 y no los 328 sobre los que se aprobó (42 px
       menos, un 13 %), y eso subía el scroll de las 3,50 pantallas prometidas
       a 4,33 -- casi lo mismo que la app de HOY (4,50), o sea que el rediseño
       no habría cobrado su promesa
     en escritorio la columna salía de 242 px y no de 310 (68 px menos)
   La causa es la suma de dos paddings que el diseño no vio: el del fondo y el
   de la tarjeta del modal. «:has()» acota el recorte a ESTE modal y no toca los
   otros nueve (el mismo recurso que s125 usó para la barra de scroll).

   Y EL «!important» NO ES PEREZA: el padding del modal es un ESTILO EN LÍNEA
   —Primitives.jsx lo escribe en el objeto style—, así que una regla de hoja sin
   él no lo toca. La primera versión de este bloque no movió ni un píxel y la
   medida salió idéntica byte a byte. Es además lo que ya hace la hoja
   responsive de aquel archivo, cuyo corte está en 640 px y no en 768. */
@media (min-width: 769px) {
  [data-pace-modal-backdrop]:has(.pace-lib) { padding: 20px !important; }
  [data-pace-modal-card]:has(.pace-lib) { padding: 22px 24px 18px !important; }
}
@media (max-width: 768px) {
  /* En un teléfono la biblioteca ES la pantalla: el margen del modal deja de
     ser un marco y pasa a ser una mordida de 42 px al contenido. */
  [data-pace-modal-backdrop]:has(.pace-lib) { padding: 8px !important; }
  [data-pace-modal-card]:has(.pace-lib) { padding: 16px 16px 20px !important; }
}
`;
  document.head.appendChild(s);
})();
