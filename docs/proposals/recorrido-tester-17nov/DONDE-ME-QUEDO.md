# Dónde me quedo · recorrido de tester nuevo

- Rama `claude/recorrido-tester-17nov-ad87f9`, sobre `main` 0.210.0. Solo `docs/proposals/recorrido-tester-17nov/`.
- Hecho: días 1 y 2 (fotos `d1-*`, `d2-*`) y notas en `notas.md`.
- Falta: días 2 y 3 (lo de ayer, la carta, «A tu ritmo» que aprende, la de antes, un día sin nada), los
  momentos clave en inglés, 360 × 640 donde apriete, la página `index.html` y publicarla.

## Cómo seguir
1. `node build-standalone.js` y `git checkout -- PACE_standalone.html`.
2. `PERFILES=<carpeta> node docs/proposals/recorrido-tester-17nov/conduce.js 8915` (en segundo plano). El perfil
   del tester vive en `PERFILES/es`: si se perdió, hay que repetir el día 1 (las órdenes, en `pasos.jsonl`).
3. Órdenes por POST a `http://localhost:8915/__c` con JSON en UTF-8 (por archivo: en Windows, por argumento se
   rompen los acentos): `abrir {t, lang, perfil, limpio}`, `toca {nombre|texto|sel, exacto, n}`, `espera {ms}`,
   `salta {ms}`, `foto {n}`, `texto`, `botones`, `oido`, `cerrar`, `tamano {w,h}`, `js {code}`.
   El reloj está parado: solo avanza con `toca`, `espera` y `salta`.
