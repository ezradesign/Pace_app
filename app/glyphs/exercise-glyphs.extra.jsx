/* PACE · Glifos de ESTIRA — extraídos de `exercise-glyphs.jsx` en s148
   ============================================================
   Segunda mitad del sistema 1 (line-art de ejercicio). El archivo original
   llegó a 571 líneas —71 por encima del límite de CLAUDE.md— y venía marcado
   en la tabla de deuda como «dentro de límite» desde s84, cuando ya no lo
   estaba. El corte es por MÓDULO, que es la frontera que el propio archivo ya
   dibujaba con un separador: Mueve se queda allí, Estira viene aquí.

   Mismas reglas de dibujo, sin tocar una ruta: viewBox 0 0 44 44, `fill=none`,
   `stroke=currentColor`, strokeWidth 1.8 vía el wrapper `G`, linecap/linejoin
   redondos y las opacidades tal cual las dejó el usuario.

   ESTE ARCHIVO **MUTA** EL MAPA, NO CREA UNO NUEVO
   ------------------------------------------------
   `EXERCISE_GLYPHS` se declara en `exercise-glyphs.jsx` y allí se publica a
   window; aquí se le AÑADEN las entradas de Estira sobre ese mismo objeto. Es
   deliberado: `ExerciseGlyph` cierra sobre la referencia local del otro
   archivo, así que un objeto aparte no lo vería y habría que cambiar su
   resolución — justo el comportamiento que este troceo no debe tocar. Como el
   componente solo lee el mapa al RENDERIZAR, para entonces los dos archivos
   llevan mucho evaluados.

   ORDEN DE CARGA: DESPUÉS de `exercise-glyphs.jsx` (que declara el mapa y el
   wrapper `G`) y antes de sus consumidores (MoveModule, ExtraModule,
   PathRunner, RoutinePreview). El guard de abajo aborta con un mensaje claro
   en vez de dejar 25 ejercicios de Estira cayendo al glifo por defecto sin que
   nadie se entere.
   ============================================================ */

if (!window.EXERCISE_GLYPHS) {
  throw new Error('exercise-glyphs.extra.jsx cargó ANTES que exercise-glyphs.jsx: revisa el orden en PACE.html');
}

Object.assign(window.EXERCISE_GLYPHS, {
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
  'Zancada con apertura': ({ size, className }) => (
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
  'Sentadilla lateral': ({ size, className }) => (
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
  'Paloma': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="18" cy="16" r="2" />
      <path d="M18 18 L32 22 L34 30" />
      <path d="M18 18 L6 32" />
      <path d="M4 36 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 23. Squat M-pure: piernas dibujando M perfecta (ALT). */
  'Sentadilla profunda': ({ size, className }) => (
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
  'Deslizamientos en pared': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M8 6 V38" />
      <path d="M14 28 Q22 22 30 28" opacity="0.5" strokeDasharray="1.5 2" />
      <path d="M14 18 Q22 12 30 18" />
      <path d="M22 12 V22" />
    </G>
  ),

  /* 26. Banda + 2 manos + líneas sutiles de tensión lateral (NEW). */
  'Apertura con banda': ({ size, className }) => (
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
  'Rotación externa': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="14" cy="14" r="3" />
      <path d="M14 17 L20 22" />
      <path d="M20 22 L32 16" />
      <path d="M20 22 Q26 32 18 36" opacity="0.55" strokeDasharray="1.5 2" />
      <path d="M20 36 L18 36 L18 34" opacity="0.55" />
    </G>
  ),

  /* 28. Barra + 2 manos huecas + brazos rectos colgados (NEW). */
  'Suspensión pasiva · opcional': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 8 H38" />
      <circle cx="14" cy="10" r="2.4" />
      <circle cx="30" cy="10" r="2.4" />
      <path d="M14 12.5 V38" />
      <path d="M30 12.5 V38" />
    </G>
  ),

  /* 29. Zancada ATG: rodilla muy por delante del pie. */
  'Zancada profunda': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="18" cy="20" r="2" />
      <path d="M18 22 L34 18 L36 32" />
      <path d="M18 22 L6 36" />
      <path d="M4 38 H40" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 30. Pared + pierna + pie en flexión dorsal. */
  'Elevación de puntas': ({ size, className }) => (
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
  'Sentadilla de cuádriceps': ({ size, className }) => (
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
  'Marcha del elefante': ({ size, className }) => (
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
  'Sentadilla profunda sostenida': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M10 34 V20 L22 32 L34 20 V34" />
      <circle cx="38" cy="20" r="1" opacity="0.65" />
      <circle cx="38" cy="24" r="1" opacity="0.65" />
      <circle cx="38" cy="28" r="1" opacity="0.65" />
      <path d="M4 38 H34" strokeDasharray="2 3" opacity="0.4" />
    </G>
  ),

  /* 35. Cuadrupedia: espalda arqueada + cuatro patas dinámicas. */
  'Gateo': ({ size, className }) => (
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
  'Suspensión pasiva': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M6 8 H38" />
      <circle cx="16" cy="10" r="2" />
      <circle cx="28" cy="10" r="2" />
      <path d="M16 12 Q12 22 22 28 Q32 22 28 12" />
      <path d="M22 28 V36" />
    </G>
  ),

  /* 37. Sentado arriba + curva descendente + sentado abajo. */
  'Sentarse y levantarse del suelo': ({ size, className }) => (
    <G size={size} className={className}>
      <circle cx="10" cy="10" r="2" />
      <path d="M10 12 V18" opacity="0.55" />
      <path d="M12 20 Q22 22 26 32 Q28 36 32 36" />
      <circle cx="32" cy="36" r="2" />
      <path d="M22 38 H40" opacity="0.55" />
    </G>
  ),

  /* 38. Gato/vaca: dos arcos opuestos + puntos de aire. */
  'Apertura de costillas + respiración': ({ size, className }) => (
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
  'Encogimiento de hombros': ({ size, className }) => (
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
  'Círculos de muñeca': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M4 22 H20" />
      <path d="M20 22 Q24 22 22 18" />
      <circle cx="28" cy="22" r="10" />
    </G>
  ),

  /* 44. Silla + torso + arco amplio de rotación hacia el respaldo. */
  'Giro sentado': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M10 10 V30" />
      <path d="M10 24 H24 V34" />
      <circle cx="14" cy="18" r="2.6" />
      <path d="M14 14 Q30 14 32 26" />
    </G>
  ),

  /* 45. Pierna vertical + círculo en el tobillo (rotación). */
  'Círculos de tobillo': ({ size, className }) => (
    <G size={size} className={className}>
      <path d="M22 4 V26" />
      <circle cx="22" cy="32" r="6" />
      <path d="M4 38 H40" opacity="0.4" />
    </G>
  ),

  /* 46. Pulmones + flecha de aire entrando + expansión lateral (NEW). */
  'Respiraciones profundas': ({ size, className }) => (
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
});

