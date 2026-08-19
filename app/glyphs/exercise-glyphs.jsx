/* PACE · Glifos canónicos de ejercicio · sesión 84 / v0.34.0
   (iter cerrado: 31/46 aprobados portados desde exploración HTML del usuario
   + 15 mantenidos del s60 canónico hasta nueva aprobación)

   31 glifos con versión bloqueada por el usuario:
     - new (v3): 15  · alt (v4): 5  · v5: 2  · v6: 1  · v7: 1
     - v8: 4         · v9: 2        · v12: 1
   15 glifos siguen en estado canónico s60 (sin aprobar todavía).

   GRANULARIDAD: por paso individual, NO por rutina.
   KEY: step.name en español canónico.

   Reglas de dibujo (heredadas de s59, preservadas):
     - viewBox 0 0 44 44
     - fill="none" stroke="currentColor"
     - strokeWidth 1.8 (wrapper G unifica el lenguaje a nivel repo,
       aunque varias versiones aprobadas usen 1.5 o 2.0 — divergencia
       documentada en docs/sessions/session-84-audit.md sección 1.4)
     - strokeLinecap "round", strokeLinejoin "round"
     - Opacidades preservadas tal cual del HTML del usuario
     - BreatheSession queda fuera (usa BreatheVisual animado)
*/

function G({ size = 88, className = '', children }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

const EXERCISE_GLYPHS = {

  /* ============================================================
     MUEVE — calistenia / fuerza (var(--move))
     ============================================================ */

  /* 1. Mesa de oficina (objeto puro, una sola pieza) (NEW). */
  'Flexiones inclinadas': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 16 H36" />
      <path d="M11 16 V28" />
      <path d="M33 16 V28" />
      <path d="M14 20 H30" opacity="0.6" />
    </G>
  ),

  /* 2. Símbolo universal de pausa (NEW). */
  'Descanso': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M16 12 V32" />
      <path d="M28 12 V32" />
    </G>
  ),

  /* 3. Silla en perfil — patrón 2 (objeto solo, como mancuerna home). */
  'Fondos en silla': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M12 10 V22" />
      <path d="M12 22 H30" />
      <path d="M30 22 V32" />
      <path d="M12 22 V32" opacity="0.5" />
    </G>
  ),

  /* 4. Pared + cabeza apoyada + asiento horizontal + tibia vertical (NEW). */
  'Silla en la pared': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 6 V36" />
      <circle cx="13" cy="11" r="2.2" />
      <path d="M13 13 V24 H28 V36" />
    </G>
  ),

  /* 5. Vista frontal: 2 pies en puntillas + flecha arriba (ALT). */
  'Elevación de talones': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M14 30 V36" />
      <path d="M18 30 V36" />
      <path d="M26 30 V36" />
      <path d="M30 30 V36" />
      <path d="M11 28 H21" />
      <path d="M23 28 H33" />
      <path d="M22 22 V12" opacity="0.6" strokeDasharray="1.5 2" />
      <path d="M19 15 L22 12 L25 15" opacity="0.6" />
    </G>
  ),

  /* 6. Crescent / boat pose puro (línea única) (V5). */
  'Hueco en silla': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 18 Q22 34 38 18" />
      <path d="M6 18 Q22 24 38 18" opacity="0.5" />
    </G>
  ),

  /* 7. Núcleo + dos arcos abrazando hacia él (V9). */
  'Abrir y cerrar el puño': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="22" r="5" />
      <path d="M10 14 Q6 22 10 30" />
      <path d="M34 14 Q38 22 34 30" />
    </G>
  ),

  /* 8. 5 líneas radiando desde un punto pivote (V9). */
  'Extensión de dedos': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="32" r="1.5" />
      <path d="M22 30 L14 8" />
      <path d="M22 30 L18 6" />
      <path d="M22 30 V4" />
      <path d="M22 30 L26 6" />
      <path d="M22 30 L30 8" />
    </G>
  ),

  /* 9. Antebrazo + abanico de 5 trazos de movimiento (V5). */
  'Estiramiento de muñeca': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 22 H22" />
      <path d="M22 22 L30 12" opacity="0.4" />
      <path d="M22 22 L32 16" opacity="0.55" />
      <path d="M22 22 L34 22" />
      <path d="M22 22 L32 28" opacity="0.55" />
      <path d="M22 22 L30 32" opacity="0.4" />
    </G>
  ),

  /* 10. 3 líneas horizontales decrecientes (retracción progresiva) (V8). */
  'Barbilla atrás': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M16 14 H32" opacity="0.35" strokeDasharray="1.5 2" />
      <path d="M12 22 H28" />
      <path d="M22 30 H38" opacity="0.55" />
    </G>
  ),

  /* 11. Dos omóplatos curvos + eje espinal punteado + línea de convergencia (NEW). */
  'Juntar omóplatos': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M10 10 Q16 18 18 30" />
      <path d="M34 10 Q28 18 26 30" />
      <path d="M22 8 V34" opacity="0.35" strokeDasharray="1.5 2" />
      <path d="M19 22 H25" opacity="0.55" />
    </G>
  ),

  /* 12. Arco torácico amplio sobre soporte (puente) (NEW). */
  'Extensión torácica': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 28 Q22 6 38 28" />
      <path d="M14 28 H30" opacity="0.55" />
    </G>
  ),

  /* 13. Caja torácica expandiéndose: 3 costillas + flechas laterales (NEW). */
  'Apertura de pecho sentado': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M14 12 Q22 14 30 12" />
      <path d="M12 20 Q22 24 32 20" />
      <path d="M14 28 Q22 30 30 28" />
      <path d="M6 20 L3 18" opacity="0.55" />
      <path d="M6 20 L3 22" opacity="0.55" />
      <path d="M38 20 L41 18" opacity="0.55" />
      <path d="M38 20 L41 22" opacity="0.55" />
    </G>
  ),

  /* ============================================================
     ESTIRA — movilidad / estiramientos  ->  exercise-glyphs.extra.jsx
     ============================================================
     Los ~25 glifos de Estira salieron de aquí en s148: el archivo iba por 571
     líneas, 71 por encima del límite de CLAUDE.md (y la tabla de deuda lo daba
     por sano desde s84). El corte respeta la frontera que ya marcaba este
     separador — Mueve arriba, Estira en el hermano.

     Ese archivo AÑADE sus entradas a ESTE MISMO objeto (`Object.assign` sobre
     `window.EXERCISE_GLYPHS`) y carga DESPUÉS. No las mete en un mapa aparte a
     propósito: `ExerciseGlyph`, aquí abajo, cierra sobre la referencia local de
     `EXERCISE_GLYPHS`, así que un segundo mapa exigiría cambiar su resolución.
     ============================================================ */
};

function DefaultGlyph({ size = 44, className = '' }) {
  return (
    <G size={size} className={className}>
      {/* Fallback: tres arcos concéntricos suaves */}
      <path d="M14 22 Q22 14 30 22" />
      <path d="M12 26 Q22 16 32 26" />
      <path d="M16 18 Q22 14 28 18" />
    </G>
  );
}

function ExerciseGlyph({ id, size = 88, className = '', maskScale = 1 }) {
  /* s166 · EL ARTE DEL USUARIO ENTRA COMO MASCARA Y GANA AL SVG, igual que
     s146 hizo con los sellos de logro y por la misma razon: asi los 62
     dibujos del rediseno pueden llegar POR PARTES sin dejar huecos -- lo que
     todavia no tiene mascara sigue con su SVG. Hoy, con el mapa vacio, esta
     rama no se toma ni una vez y la app pinta exactamente lo de ayer.
     `currentColor` de fondo es lo que conserva el tintado por token del
     modulo, que es justo lo que se perderia pintando el PNG como imagen. */
  /* s171 · `maskScale` es EXPLICITO y su defecto es 1: la caja que se pinta es
     la que el llamante reserva. Hasta s170 la mascara se pintaba SIEMPRE a 1.5x
     por dentro, y eso no es un tamaño: es un desbordamiento que el llamante no
     puede prever. La lista de pasos del preview reservaba 30 px, recibia 45 y
     las miniaturas anatomicas se PISABAN 5 px entre filas (medido) mientras las
     41 SVG, que si respetan la caja, quedaban limpias. Quien quiera el +50 % de
     presencia lo pide (`StepGlyph`, el circulo del runner); los demas no lo
     heredan por accidente. La decision A/B —dar ese mismo +50 % a los 41 SVG—
     sigue abierta y este parametro no la prejuzga. */
  const px = Math.round(size * maskScale);
  /* La variante se elige por los PIXELES QUE SE PINTAN, no por los que se
     piden: con el 1.5 implicito el preview pedia 30 (y recibia la variante de
     trazo engordado, `<= MASK_MIN_HASTA`) para luego dibujarla a 45, que es
     justo el tramo donde NO corresponde. */
  const mask = window.exerciseMaskUrl && window.exerciseMaskUrl(id, px);
  if (mask) {
    const url = 'url("' + mask + '")'; size = px;
    return (
      <span className={className} style={{
        display: 'block', width: size, height: size,
        backgroundColor: 'currentColor',
        WebkitMaskImage: url, maskImage: url,
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskSize: 'contain', maskSize: 'contain',
      }} />
    );
  }
  /* visualId (B2.2): los duplicados de nombre (Chest opener, Deep squat hold,
     Deep breaths, Dead hang · opcional) resuelven al glifo canónico que
     absorbe. resolveVisualId es identidad para nombres no aliasados; se lee
     de window por si el orden de carga fallara (patrón defensivo del repo). */
  const vid = (window.resolveVisualId ? window.resolveVisualId(id) : id);
  const Glyph = EXERCISE_GLYPHS[vid] || EXERCISE_GLYPHS[id];
  if (!Glyph) return <DefaultGlyph size={size} className={className} />;
  return <Glyph size={size} className={className} />;
}

Object.assign(window, { ExerciseGlyph, EXERCISE_GLYPHS, DefaultGlyph });
