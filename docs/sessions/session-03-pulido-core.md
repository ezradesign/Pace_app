# Sesión 3 (2026-04-22) — Pulido del core (Respira + Mueve)

**Versión entregada:** v0.10
**Duración / intensidad:** larga · pulido profundo

## ✅ Cambios aplicados

**Módulo Respira** (pulido profundo):
- **Fase de preparación** — cuenta atrás 3s con número gigante italic
  terracota + mensaje "Siéntate cómodo. Respira natural." + botón
  "Empezar ahora" para saltar
- **Fase de retención explícita** en técnicas con rondas — pantalla
  dedicada "Retén sin aire" con cronómetro gigante + botón "Respirar de
  nuevo"
- **Logros de apnea** se desbloquean en tiempo real (60s / 90s / 2min)
- **Countdown visible** dentro del círculo en fases ≥4s (número terracota
  bajo el label)
- **Pantalla de completado** con círculo de check, stats
  (tiempo/rondas/respiraciones) y mensaje "Observa cómo te sientes antes
  de volver"
- **Atajos de teclado**: Espacio (pausar), Esc (salir), Enter (avanzar en
  hold/done)
- **Leyenda de atajos** sutil en la parte inferior

**Módulo Mueve** (pulido profundo):
- **Fase de preparación** — misma estructura en ocre (`--move`)
- **Glifo placeholder por paso** — círculo dashed con símbolo italic
  rotativo (◯◬◇△▢⬡✦), mientras no hay ilustraciones reales
- **Preview del siguiente paso** bajo la regla de progreso ("Siguiente: …")
- **Pantalla de completado** con stats (tiempo/pasos) y mensaje "El cuerpo
  vuelve a sentirse tuyo"
- **Atajos de teclado**: ←/→ (navegar pasos), Espacio (pausar), Esc (salir),
  Enter (volver tras completar)

**Librerías (modales)**:
- Tarjetas de rutina **rediseñadas** — jerarquía más clara: tag arriba,
  título italic grande, descripción, línea divisoria dashed, código y
  duración destacados en color del módulo
- **Indicador ⚠️** en esquina superior derecha de rutinas con
  `safety: true`

**Componentes compartidos**:
- `SessionHeader` extraído y reutilizado entre módulos
- `Stat` / `MoveStat` helper para stats de pantalla "completado"
- `StepGlyph` para placeholder visual hasta tener ilustraciones

## 📁 Archivos modificados
- `app/breathe/BreatheModule.jsx` (session reescrita con stages + stats + keyboard shortcuts)
- `app/move/MoveModule.jsx` (session reescrita con mismas mejoras)

## 🔒 Red de seguridad actualizada
- `PACE_standalone.html` **v0.10** (152 KB)
- `backups/PACE_standalone_v0.9.2_20260422.html` (rotado)
- `backups/PACE_standalone_v0.10_20260422.html` (nuevo)
