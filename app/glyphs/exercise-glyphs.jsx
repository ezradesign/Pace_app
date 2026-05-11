/* PACE · Glifos canónicos de ejercicio · sesión 60 / v0.28.1 (iter parcial 13/46)
   Registro de SVGs line-art para la pantalla activa de sesión.

   GRANULARIDAD: por paso individual, NO por rutina. Cada paso de cada
   rutina (p. ej. "Apertura de pecho", "Rotación torácica", "Flexor de
   cadera") tiene su propio glifo.

   KEY: step.name en español canónico.

   Reglas de dibujo:
     - viewBox 0 0 44 44
     - fill="none" stroke="currentColor"
     - strokeWidth 1.8 (proporción equivalente a 1.2 sobre viewBox 28
       de los 4 glifos de menú en main.jsx)
     - strokeLinecap "round", strokeLinejoin "round"
     - Símbolo iconico: una metáfora visual clara por glifo. Objetos
       reconocibles, posturas simplificadas a 2-5 trazos, curvas orgánicas
     - Sin flechas explicativas (la forma indica el movimiento)
     - Sin marcas 90° ni anotaciones de diagrama
     - Opacidades: 1.0 elementos principales, 0.5-0.6 secundarios,
       0.35 referencia de suelo (dashed)
     - BreatheSession queda fuera (usa BreathVisual animado)
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

  /* 1. Escritorio limpio + cuerpo en diagonal apoyado. */
  'Flexiones inclinadas': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 16 H24" />
      <path d="M9 16 V22" />
      <path d="M21 16 V22" />
      <path d="M15 16 L34 34" />
      <path d="M30 34 H36" opacity="0.55" />
    </G>
  ),

  /* 2. Luna creciente + chispa: descanso entre series. */
  'Descanso': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M30 12 A12 12 0 1 0 30 32" />
      <path d="M30 12 Q22 22 30 32" opacity="0.55" />
      <circle cx="11" cy="14" r="1" opacity="0.55" />
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

  /* 4. Cuerpo deslizando por la pared — silueta orgánica + cadera y rodilla flexionadas. */
  'Wall sit': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 6 V36" />
      <circle cx="13" cy="11" r="2.4" />
      <path d="M11 13 Q10 20 12 24 Q22 24 26 24 Q26 30 26 36" />
      <path d="M4 38 H40" opacity="0.35" strokeDasharray="1.5 2.5" />
    </G>
  ),

  /* 5. Pie de perfil con talón elevado, dedos apoyados en suelo. */
  'Calf raises': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M14 8 V20" />
      <path d="M14 20 Q12 24 16 25" />
      <path d="M16 25 Q24 26 32 28" />
      <path d="M14 20 Q22 22 32 28" opacity="0.55" />
      <path d="M30 28 Q31 26 32 28" opacity="0.55" />
      <path d="M28 28 Q29 26.5 30 28" opacity="0.45" />
      <path d="M26 28 Q27 26.5 28 28" opacity="0.35" />
      <path d="M4 30 H40" opacity="0.35" strokeDasharray="1.5 2.5" />
    </G>
  ),

  /* 6. Silla + cuerpo en hollow flotando del asiento. */
  'Seated hollow': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M10 12 V30" />
      <path d="M10 22 H22 V34" />
      <path d="M14 20 Q22 8 32 16" />
      <circle cx="32" cy="16" r="2" />
    </G>
  ),

  /* 7. Puño cerrado con nudillos y pulgar cruzando. */
  'Squeeze fist': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M10 26 Q8 18 14 14 Q22 10 30 14 Q36 18 34 26 Q32 34 22 34 Q12 34 10 26 Z" />
      <path d="M14 16 Q16 13 18 16" opacity="0.6" />
      <path d="M20 14.5 Q22 11.5 24 14.5" opacity="0.6" />
      <path d="M26 14.5 Q28 11.5 30 14.5" opacity="0.6" />
      <path d="M10 24 Q18 28 24 24" opacity="0.55" />
    </G>
  ),

  /* 8. Mano en abanico — cinco dedos divergentes. */
  'Finger extension': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M14 30 Q22 34 30 30" />
      <path d="M14 30 L8 10" />
      <path d="M18 28 L16 8" />
      <path d="M22 27 V8" />
      <path d="M26 28 L28 8" />
      <path d="M30 30 L36 10" />
    </G>
  ),

  /* 9. Antebrazo + mano doblada + arco suave de flex/ext. */
  'Wrist stretch': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 26 H24" />
      <path d="M24 26 Q30 24 34 18" />
      <path d="M26 30 Q34 28 38 20" opacity="0.5" />
    </G>
  ),

  /* 10. Cabeza perfil + columna alineada + chin mark — patrón 3 (parte aislada). */
  'Chin tucks': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="24" cy="13" r="5" />
      <path d="M29 13 H31" opacity="0.6" />
      <path d="M24 18 V34" />
      <path d="M19 22 Q24 24 29 22" opacity="0.55" />
    </G>
  ),

  /* 11. Dos omóplatos abrazando el eje espinal. */
  'Scapular squeeze': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 12 Q14 18 16 28" />
      <path d="M36 12 Q30 18 28 28" />
      <path d="M22 8 V36" opacity="0.4" />
    </G>
  ),

  /* 12. Arco torácico extendido sobre soporte. */
  'Thoracic extension': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 24 Q22 4 38 24" />
      <path d="M10 28 H34" opacity="0.6" />
    </G>
  ),

  /* 13. Cuerpo en T-pose con brazos abriéndose — patrón 1 (forma única). */
  'Chest opener': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="9" r="2.5" />
      <path d="M22 12 V28" />
      <path d="M22 16 Q14 14 6 20" />
      <path d="M22 16 Q30 14 38 20" />
    </G>
  ),

  /* ============================================================
     ESTIRA — movilidad / estiramientos (var(--extra))
     ============================================================ */

  /* 14. Dos pétalos abriéndose desde un eje central — el pecho que se expande. */
  'Apertura de pecho': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M22 22 Q14 12 8 22 Q12 28 22 22" />
      <path d="M22 22 Q30 12 36 22 Q32 28 22 22" />
      <path d="M22 22 V36" opacity="0.4" />
      <circle cx="22" cy="22" r="2" opacity="0.7" />
    </G>
  ),

  /* 15. Espiral nautilo hacia afuera con flecha — rotación del tronco. */
  'Rotación torácica': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M22 22 Q22 16 28 16 Q34 16 34 22 Q34 30 26 32 Q14 32 12 22 Q12 10 22 10 Q34 10 36 22" />
      <path d="M36 22 L33 20" />
      <path d="M36 22 L33 24" />
    </G>
  ),

  /* 16. Cadera + pierna delantera flexionada + trasera apoyada en suelo. */
  'Flexor de cadera': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="20" cy="12" r="2" />
      <path d="M20 14 V26 L14 36" />
      <path d="M20 14 L32 32 H38" />
      <path d="M4 38 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 17. Zancada profunda + arco amplio de rotación superior. */
  "World's greatest stretch": ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="20" r="1.8" />
      <path d="M22 22 V30 L16 38" />
      <path d="M22 22 L34 36" />
      <path d="M10 14 Q22 4 34 14" />
      <path d="M4 40 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 18. Cabeza inclinada + curva trapecio + línea de hombros. */
  'Cuello y trapecios': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="14" cy="12" r="4" />
      <path d="M16 15 Q22 22 30 26" />
      <path d="M12 30 H34" opacity="0.55" />
    </G>
  ),

  /* 19. Círculo enso (zen brush) casi cerrado + centro — vuelta a la respiración. */
  'Reset respiración': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M28 9 Q40 14 38 24 Q34 36 22 36 Q8 36 8 22 Q8 10 22 8" />
      <circle cx="22" cy="22" r="2" opacity="0.5" />
      <circle cx="28" cy="9" r="0.8" opacity="0.7" />
    </G>
  ),

  /* 20. Una pierna doblada lateral + otra extendida al lado opuesto. */
  'Cossack squat': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="14" r="2" />
      <path d="M22 16 L34 26 L30 36" />
      <path d="M22 16 L8 34" />
      <path d="M4 38 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 21. Dos L espejadas — caderas y rodillas a 90°. */
  '90/90': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="22" r="2" />
      <path d="M22 22 H34 V32" />
      <path d="M22 22 H10 V12" />
    </G>
  ),

  /* 22. Cadera + tibia cruzada + pierna trasera extendida. */
  'Pigeon': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="18" cy="16" r="2" />
      <path d="M18 18 L32 22 L34 30" />
      <path d="M18 18 L6 32" />
      <path d="M4 36 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 23. Cuerpo como arco M sobre suelo — patrón 1 (forma única). */
  'Squat profundo': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 30 Q12 16 22 12 Q32 16 36 30" />
      <circle cx="22" cy="10" r="2" opacity="0.7" />
      <path d="M4 32 H40" opacity="0.35" strokeDasharray="1.5 2.5" />
    </G>
  ),

  /* 24. Arco de puente + pierna elevada en curva. */
  'Puente con marcha': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 32 Q22 10 38 32" />
      <path d="M4 34 H10" opacity="0.55" />
      <path d="M34 34 H40" opacity="0.55" />
      <path d="M22 14 Q26 10 30 4" />
      <circle cx="30" cy="4" r="1.6" />
    </G>
  ),

  /* 25. Pared + brazos en Y elevada con eco de la W anterior. */
  'Scapular wall slides': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 6 V38" />
      <path d="M28 14 L36 6" />
      <path d="M28 14 V24" />
      <path d="M28 14 L36 22" opacity="0.5" />
      <path d="M14 26 L20 20 L24 26" opacity="0.4" />
    </G>
  ),

  /* 26. Banda elástica curva + dos manos sujetando. */
  'Band pull-apart': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M10 22 Q22 18 34 22" />
      <circle cx="10" cy="22" r="2.4" />
      <circle cx="34" cy="22" r="2.4" />
    </G>
  ),

  /* 27. Codo a 90° + arco de rotación externa del hombro. */
  'External rotation': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="26" r="2" />
      <path d="M10 26 H22 V12" />
      <path d="M22 8 Q34 12 30 24" />
    </G>
  ),

  /* 28. Barra + dos brazos rectos colgados (tensión activa). */
  'Dead hang (si puedes)': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 8 H38" />
      <circle cx="14" cy="8" r="1.8" />
      <circle cx="30" cy="8" r="1.8" />
      <path d="M14 10 V38" />
      <path d="M30 10 V38" />
    </G>
  ),

  /* 29. Zancada ATG: rodilla muy por delante del pie. */
  'ATG split squat': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="18" cy="20" r="2" />
      <path d="M18 22 L34 18 L36 32" />
      <path d="M18 22 L6 36" />
      <path d="M4 38 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 30. Pared + pierna + pie en flexión dorsal. */
  'Tibialis raise': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 6 V38" />
      <path d="M8 38 H38" />
      <path d="M22 14 V32" />
      <path d="M22 32 L34 24" />
    </G>
  ),

  /* 31. Cuerpo cayendo recto con pivote en las rodillas. */
  'Nordics': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="36" cy="14" r="2" />
      <path d="M36 14 L14 30" />
      <circle cx="14" cy="30" r="2.4" />
      <path d="M4 36 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 32. Cuerpo inclinado atrás + rodillas adelante + talones arriba. */
  'Sissy squat': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="14" cy="8" r="2" />
      <path d="M14 10 L28 30" />
      <circle cx="28" cy="30" r="1.8" />
      <path d="M28 30 L36 34" />
      <path d="M32 30 V26" opacity="0.6" />
      <path d="M4 38 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 33. Dos arcos consecutivos avanzando — caminar como elefante. */
  'Elephant walk': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 30 Q10 14 20 30" />
      <path d="M22 30 Q26 14 36 30" opacity="0.6" />
      <path d="M4 32 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 34. M profunda + tres puntos verticales (mantener el tiempo). */
  'Deep squat hold': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M10 34 V20 L22 32 L34 20 V34" />
      <circle cx="38" cy="20" r="1" opacity="0.65" />
      <circle cx="38" cy="24" r="1" opacity="0.65" />
      <circle cx="38" cy="28" r="1" opacity="0.65" />
      <path d="M4 38 H34" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 35. Cuadrupedia: espalda arqueada + cuatro patas dinámicas. */
  'Crawling': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 18 Q22 6 36 18" />
      <path d="M10 18 Q8 24 10 32" />
      <path d="M18 17 V32" />
      <path d="M26 17 V32" />
      <path d="M34 18 Q36 24 34 32" />
      <path d="M4 34 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 36. Barra + dos brazos colgando con curva relajada. */
  'Hang pasivo': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 8 H38" />
      <circle cx="14" cy="8" r="1.8" />
      <circle cx="30" cy="8" r="1.8" />
      <path d="M14 10 Q10 22 18 38" />
      <path d="M30 10 Q34 22 26 38" />
    </G>
  ),

  /* 37. Sentado arriba + curva descendente + sentado abajo. */
  'Ground sitting transitions': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="10" cy="10" r="2" />
      <path d="M10 12 V18" opacity="0.55" />
      <path d="M12 20 Q22 22 26 32 Q28 36 32 36" />
      <circle cx="32" cy="36" r="2" />
      <path d="M22 38 H40" opacity="0.55" />
    </G>
  ),

  /* 38. Gato/vaca: dos arcos opuestos + puntos de aire. */
  'Rib pull + respiración': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 16 Q22 6 36 16" />
      <path d="M8 28 Q22 38 36 28" />
      <circle cx="36" cy="22" r="1" opacity="0.55" />
      <circle cx="40" cy="22" r="1" opacity="0.55" />
    </G>
  ),

  /* 39. Cabeza inclinada lateral + cuerpo curvado en arco. */
  'Inclinación lateral': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="28" cy="10" r="3" />
      <path d="M22 36 Q30 22 28 13" />
      <path d="M8 36 H22" opacity="0.5" />
    </G>
  ),

  /* 40. Cabeza + elipse horizontal alrededor (rotación cervical). */
  'Rotación lenta': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="14" r="4" />
      <ellipse cx="22" cy="14" rx="14" ry="5" opacity="0.5" />
      <path d="M22 18 V32" opacity="0.4" />
    </G>
  ),

  /* 41. Cabeza inclinada + brazo bajando + mano anclada. */
  'Escalenos': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="14" cy="12" r="4" />
      <path d="M16 15 L26 22 H30" />
      <path d="M30 22 V36" />
      <circle cx="30" cy="36" r="1.8" />
    </G>
  ),

  /* 42. Dos hombros elevados como dos arcos espejados. */
  'Shrug + round': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="18" r="2.2" />
      <path d="M8 26 Q14 14 22 18" />
      <path d="M36 26 Q30 14 22 18" />
      <path d="M22 22 V34" opacity="0.45" />
    </G>
  ),

  /* 43. Antebrazo + mano + círculo rotación — patrón 3 (parte aislada). */
  'Wrist circles': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M4 22 H20" />
      <path d="M20 22 Q24 22 22 18" />
      <circle cx="28" cy="22" r="10" />
    </G>
  ),

  /* 44. Silla + torso + arco amplio de rotación hacia el respaldo. */
  'Seated twist': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M10 10 V30" />
      <path d="M10 24 H24 V34" />
      <circle cx="14" cy="18" r="2.6" />
      <path d="M14 14 Q30 14 32 26" />
    </G>
  ),

  /* 45. Pierna vertical + círculo en el tobillo (rotación). */
  'Ankle circles': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M22 4 V26" />
      <circle cx="22" cy="32" r="6" />
      <path d="M4 38 H40" opacity="0.4" />
    </G>
  ),

  /* 46. Diafragma como bóveda + aliento ascendente con susurros laterales. */
  'Deep breaths': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 28 Q22 14 36 28" />
      <path d="M22 28 Q20 22 22 16 Q24 12 22 8" />
      <path d="M19 9 Q21 7 23 9" opacity="0.6" />
      <path d="M14 24 Q13 21 13 18" opacity="0.4" />
      <path d="M30 24 Q31 21 31 18" opacity="0.4" />
    </G>
  ),

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

function ExerciseGlyph({ id, size = 88, className = '' }) {
  const Glyph = EXERCISE_GLYPHS[id];
  if (!Glyph) return <DefaultGlyph size={size} className={className} />;
  return <Glyph size={size} className={className} />;
}

Object.assign(window, { ExerciseGlyph, EXERCISE_GLYPHS, DefaultGlyph });
