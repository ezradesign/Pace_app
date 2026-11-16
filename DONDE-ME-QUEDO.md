# Dónde me quedo · maquetas-4-16nov (16 nov. 2026)

Rama `claude/maquetas-4-16nov-90bbca` (worktree `maqueta-jornada-40d7ea`), con `main` 0.207.0 juntado (origin/main ya
va por 0.208.0: falta juntarlo, lo hace la coordinadora).
Página: https://claude.ai/artifact/VaVZj6cpDbHPiC25ALZHqQ (versión 4; fuente `docs/proposals/maquetas-4-16nov/`).

## Hecho
- Paso 1: la 4, otra vuelta (D «Por tu cuenta» en la fila «Ahora», recomendada; E en la línea de horas; F en la fila
  de minutos), página con 1A, 2 A+B+C y 3B marcadas (b4106361).
- Paso 2 montado (523a797f): 1A (CustomBuilder, CSS `pace-cb-dedo-css`), 2 A+B+C (`pasoV1.finVisto`;
  `app/ui/PremiumFinPrueba.jsx`, `app/shell/Sobre.finPrueba.js`, PremiumInvitacion abre la hoja, LibraryShell pinta la
  línea) y 3B (PremiumSection `premiumPlanEnPrueba`, TweaksPanel +26). 16 pruebas nuevas (constructor-dedo,
  ajustes-prueba-comprar, fin-prueba), cinco mutantes cazados. Censo i18n 1229, MINIMO_PRUEBAS 1640.
- Tres filas nuevas arriba de `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.
- Fotos de «Montado» (escena M de genera.js, puerto 8866) en la página.
- Suite entera en el 8865 con un worker: 1637 de 1640. `lienzo` y `ritmo-reloj` pasan solas (carga). `paso-v1` era de
  verdad: adelanta una semana y le salía la hoja nueva del fin de la prueba; ahora la cierra. `verify` en verde.

## Falta
- La letra de Ez para la 4 (D, E o F; recomendada D).
- Al juntar con main: chocan el censo i18n y MINIMO_PRUEBAS (se suman) y las filas de arriba de DECISIONES.
- No tocar main.
