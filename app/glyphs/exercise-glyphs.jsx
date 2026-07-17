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
  'Wall sit': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 6 V36" />
      <circle cx="13" cy="11" r="2.2" />
      <path d="M13 13 V24 H28 V36" />
    </G>
  ),

  /* 5. Vista frontal: 2 pies en puntillas + flecha arriba (ALT). */
  'Calf raises': ({ size, className }) => (
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
  'Seated hollow': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 18 Q22 34 38 18" />
      <path d="M6 18 Q22 24 38 18" opacity="0.5" />
    </G>
  ),

  /* 7. Núcleo + dos arcos abrazando hacia él (V9). */
  'Squeeze fist': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="22" r="5" />
      <path d="M10 14 Q6 22 10 30" />
      <path d="M34 14 Q38 22 34 30" />
    </G>
  ),

  /* 8. 5 líneas radiando desde un punto pivote (V9). */
  'Finger extension': ({ size, className }) => (
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
  'Wrist stretch': ({ size, className }) => (
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
  'Chin tucks': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M16 14 H32" opacity="0.35" strokeDasharray="1.5 2" />
      <path d="M12 22 H28" />
      <path d="M22 30 H38" opacity="0.55" />
    </G>
  ),

  /* 11. Dos omóplatos curvos + eje espinal punteado + línea de convergencia (NEW). */
  'Scapular squeeze': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M10 10 Q16 18 18 30" />
      <path d="M34 10 Q28 18 26 30" />
      <path d="M22 8 V34" opacity="0.35" strokeDasharray="1.5 2" />
      <path d="M19 22 H25" opacity="0.55" />
    </G>
  ),

  /* 12. Arco torácico amplio sobre soporte (puente) (NEW). */
  'Thoracic extension': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 28 Q22 6 38 28" />
      <path d="M14 28 H30" opacity="0.55" />
    </G>
  ),

  /* 13. Caja torácica expandiéndose: 3 costillas + flechas laterales (NEW). */
  'Chest opener': ({ size, className }) => (
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
     ESTIRA — movilidad / estiramientos (var(--extra))
     ============================================================ */

  /* 14. Arco abriéndose: curva esternón + 2 extensiones + arco inferior (V8). */
  'Apertura de pecho': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 22 Q22 14 38 22" />
      <path d="M6 22 L2 20" opacity="0.6" />
      <path d="M38 22 L42 20" opacity="0.6" />
      <path d="M14 28 Q22 24 30 28" opacity="0.45" />
    </G>
  ),

  /* 15. Hombros rotados + esternón + caderas estables + arco rotación (NEW). */
  'Rotación torácica': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 16 L34 12" />
      <circle cx="22" cy="20" r="1.4" />
      <path d="M22 14 V30" opacity="0.4" />
      <path d="M12 30 H32" />
      <path d="M30 4 Q40 10 34 18" opacity="0.6" strokeDasharray="1.5 2" />
      <path d="M32 16 L34 18 L36 16" opacity="0.6" />
    </G>
  ),

  /* 16. Dos líneas formando ángulo agudo (zancada abstracta) (V8). */
  'Flexor de cadera': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 36 L22 14" />
      <path d="M22 14 L36 36" opacity="0.55" />
      <path d="M14 26 L30 26" opacity="0.4" />
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

  /* 18. Cabeza + trapecio triangular + mano contraria anclando (V6). */
  'Cuello y trapecios': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="12" r="3.5" />
      <path d="M22 16 L14 28" />
      <path d="M22 16 L30 28" opacity="0.55" />
      <path d="M14 28 H30" />
      <circle cx="14" cy="8" r="1.4" opacity="0.7" />
      <path d="M14 10 L18 14" opacity="0.6" />
    </G>
  ),

  /* 19. 3 ondas horizontales decrecientes + flecha (corriente de aire) (NEW). */
  'Reset respiración': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 16 Q22 12 36 16" />
      <path d="M8 22 Q22 18 36 22" opacity="0.7" />
      <path d="M8 28 Q22 24 36 28" opacity="0.45" />
      <path d="M34 14 L36 16 L34 18" />
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

  /* 21. 2 L con pies marcados + eje vertical sutil (ALT). */
  '90/90': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="22" r="2" />
      <path d="M22 22 H32 V32" />
      <path d="M30 32 H34" opacity="0.55" />
      <path d="M22 22 H12 V12" />
      <path d="M10 12 H14" opacity="0.55" />
      <path d="M22 22 V14" opacity="0.5" />
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

  /* 23. Squat M-pure: piernas dibujando M perfecta (ALT). */
  'Squat profundo': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="8" r="2" />
      <path d="M22 10 V14" />
      <path d="M10 34 L22 14 L34 34" />
      <path d="M14 30 L18 22" opacity="0.5" />
      <path d="M30 30 L26 22" opacity="0.5" />
    </G>
  ),

  /* 24. Arco puente + pierna elevada en curva + pies (NEW). */
  'Puente con marcha': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 30 Q22 10 38 30" />
      <path d="M22 14 Q28 8 32 4" />
      <circle cx="32" cy="4" r="1.6" />
      <path d="M4 32 H10" opacity="0.55" />
      <path d="M34 32 H40" opacity="0.55" />
    </G>
  ),

  /* 24b. Puente a una pierna: arco + pie apoyado + pierna elevada (s110,
     sustituto de Nordics en move.atg.knees; canónico s60, sin aprobar). */
  'Puente isquio a una pierna': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 30 Q22 12 38 30" />
      <path d="M14 27 V34" />
      <path d="M30 22 L36 14" opacity="0.6" />
      <circle cx="36" cy="14" r="1.4" opacity="0.7" />
      <path d="M4 34 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 25. Pared + 2 arcos ascendentes abstractos + eje (V8). */
  'Scapular wall slides': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 6 V38" />
      <path d="M14 28 Q22 22 30 28" opacity="0.5" strokeDasharray="1.5 2" />
      <path d="M14 18 Q22 12 30 18" />
      <path d="M22 12 V22" />
    </G>
  ),

  /* 26. Banda + 2 manos + líneas sutiles de tensión lateral (NEW). */
  'Band pull-apart': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="12" cy="22" r="2.4" />
      <circle cx="32" cy="22" r="2.4" />
      <path d="M14 22 Q22 18 30 22" />
      <path d="M7 19 L4 17" opacity="0.5" />
      <path d="M6 22 L3 22" opacity="0.5" />
      <path d="M7 25 L4 27" opacity="0.5" />
      <path d="M37 19 L40 17" opacity="0.5" />
      <path d="M38 22 L41 22" opacity="0.5" />
      <path d="M37 25 L40 27" opacity="0.5" />
    </G>
  ),

  /* 27. Hombro (cabeza humeral) + antebrazo + arco de rotación (ALT). */
  'External rotation': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="14" cy="14" r="3" />
      <path d="M14 17 L20 22" />
      <path d="M20 22 L32 16" />
      <path d="M20 22 Q26 32 18 36" opacity="0.55" strokeDasharray="1.5 2" />
      <path d="M20 36 L18 36 L18 34" opacity="0.55" />
    </G>
  ),

  /* 28. Barra + 2 manos huecas + brazos rectos colgados (NEW). */
  'Dead hang · opcional': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 8 H38" />
      <circle cx="14" cy="10" r="2.4" />
      <circle cx="30" cy="10" r="2.4" />
      <path d="M14 12.5 V38" />
      <path d="M30 12.5 V38" />
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

  /* 33. Pike claro + 2 brazos cayendo + 2 manos en suelo (V7). */
  'Elephant walk': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M22 8 L8 32" />
      <path d="M22 8 L36 32" />
      <path d="M22 10 L18 22 L14 32" opacity="0.6" />
      <path d="M22 10 L26 22 L30 32" opacity="0.6" />
      <circle cx="14" cy="32" r="0.9" opacity="0.7" />
      <circle cx="30" cy="32" r="0.9" opacity="0.7" />
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

  /* 36. Barra + 2 manos + cuerpo relajado en curva completa (ALT). */
  'Hang pasivo': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 8 H38" />
      <circle cx="16" cy="10" r="2" />
      <circle cx="28" cy="10" r="2" />
      <path d="M16 12 Q12 22 22 28 Q32 22 28 12" />
      <path d="M22 28 V36" />
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

  /* 42. Cabeza + hombros como 2 arcos + torso + 2 flechas verticales (V12). */
  'Shrug + round': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="22" cy="20" r="2" />
      <path d="M8 26 Q14 12 22 16" />
      <path d="M36 26 Q30 12 22 16" />
      <path d="M22 22 V32" opacity="0.4" />
      <path d="M12 8 V14" opacity="0.55" />
      <path d="M10 10 L12 8 L14 10" opacity="0.55" />
      <path d="M32 8 V14" opacity="0.55" />
      <path d="M30 10 L32 8 L34 10" opacity="0.55" />
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

  /* 46. Pulmones + flecha de aire entrando + expansión lateral (NEW). */
  'Deep breaths': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M22 14 V32" />
      <path d="M22 18 Q12 18 12 26 Q12 32 18 32" />
      <path d="M22 18 Q32 18 32 26 Q32 32 26 32" />
      <path d="M22 4 V12" opacity="0.7" strokeDasharray="1.5 2" />
      <path d="M19 10 L22 13 L25 10" opacity="0.7" />
      <path d="M6 24 L9 24" opacity="0.5" />
      <path d="M7 22 L9 24 L7 26" opacity="0.5" />
      <path d="M38 24 L35 24" opacity="0.5" />
      <path d="M37 22 L35 24 L37 26" opacity="0.5" />
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
