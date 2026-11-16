# Dónde me quedo · maquetas-4-16nov (16 nov. 2026)

Rama `claude/maquetas-4-16nov-90bbca` (worktree `maqueta-jornada-40d7ea`), con `main` 0.207.0 juntado.
Página: https://claude.ai/artifact/VaVZj6cpDbHPiC25ALZHqQ (fuente `docs/proposals/maquetas-4-16nov/`).

## Hecho
- Paso 1: la 4, otra vuelta (D «Por tu cuenta» en la fila «Ahora», recomendada; E en la línea de horas; F en la fila
  de minutos), página republicada con 1A, 2 A+B+C y 3B marcadas (b4106361).
- Paso 2 montado (523a797f): 1A (CustomBuilder, CSS `pace-cb-dedo-css`), 2 A+B+C (`pasoV1.finVisto`;
  `app/ui/PremiumFinPrueba.jsx`, `app/shell/Sobre.finPrueba.js`, PremiumInvitacion abre la hoja, LibraryShell pinta la
  línea) y 3B (PremiumSection `premiumPlanEnPrueba`, TweaksPanel +26). `verify` en verde; 16 pruebas nuevas
  (constructor-dedo, ajustes-prueba-comprar, fin-prueba), cinco mutantes cazados. Censo i18n 1229, MINIMO_PRUEBAS 1640.
- Tres filas nuevas arriba de `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

## Falta, por orden
1. Que acabe la suite ENTERA que corre en el 8865 con un worker (se lanzó por error con todas las pruebas, no solo las
   vecinas; a las 20:32 iba por la 540 de 1640 sin fallos). Log en el scratchpad (vecinas.log). Si se corta, relanzar solo
   las vecinas (ver la lista de abajo) o seguir desde la «e».
2. Poner la cifra en la sección «Montado» de la página (la frase «la cifra se pone aquí al acabar») y republicar.
3. Commit y push; informe corto con el enlace. No tocar main. Al juntar: chocan el censo i18n y MINIMO_PRUEBAS (se
   suman) y las filas de arriba de DECISIONES.

Hecho también: fotos de «Montado» (escena M de genera.js, puerto 8866) y página republicada (versión 3).
