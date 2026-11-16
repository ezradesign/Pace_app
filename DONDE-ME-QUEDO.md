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
1. Las vecinas con `--workers=1` en el 8865: la lista está en el scratchpad (`vecinas.txt`); son los archivos de
   tests/ que empiezan por tus-rutinas, premium-, ajustes, caza-v1, paso-v1, dia-v1, sobre-, lunes, carta-luego,
   copia-recordada, biblioteca, transicion-biblioteca, respira-biblioteca, toques-movil, caza-ingles, plurales,
   accesibilidad, botones-nombre, compra-, cobro-venta, valoracion, bienvenida-ajustes, importar-licencia y
   viajes-estante, más las tres nuevas.
2. Fotos de «Montado»: `node build-standalone.js` y `PACE_FOTOS_PORT=8866 node docs/proposals/maquetas-4-16nov/genera.js M`
   (escena `escenaMontado`). Rellenar `__PRUEBAS__` en la sección «Montado» de `index.html` con lo de las vecinas,
   poner en el lead que ya están montadas, borrar las fotos sin usar y republicar con las `m-*.jpg` en `files`.
3. Commit y push; informe corto. No tocar `main`. Al juntar: chocan el censo i18n y MINIMO_PRUEBAS (se suman) y
   las filas de arriba de DECISIONES.
