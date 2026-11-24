# Dónde me quedo · recorrido de tester nuevo

- Rama `claude/recorrido-tester-17nov-ad87f9`, sobre `main` 0.210.0. Solo `docs/proposals/recorrido-tester-17nov/`.
- **Hecho y publicado** (18 nov.): https://claude.ai/artifact/T8J9vT4s5aodPFLd1k3iYM (fuente: `index.html` y `fotos/`).
  Días 1 a 3, el lunes siguiente (la carta), los momentos clave en inglés y 360 × 640. Notas de cada foto en `notas.md`.
- No se ha tocado `app/`. Lo que pide la letra de Ez está en la tabla de la página (columna «Tipo»: opinión).

## Cómo repetirlo
1. `node build-standalone.js` y `git checkout -- PACE_standalone.html`.
2. `PERFILES=<carpeta> node docs/proposals/recorrido-tester-17nov/conduce.js 8915` (en segundo plano). El perfil
   del tester vive en `PERFILES/es`; las órdenes de este recorrido, en `pasos.jsonl`.
3. Órdenes por POST a `http://localhost:8915/__c` con JSON en UTF-8 (por archivo: en Windows, por argumento se
   rompen los acentos): `abrir {t, lang, perfil, limpio, h}`, `toca {nombre|texto|sel, exacto, n}`, `espera {ms}`,
   `salta {ms}`, `foto {n}`, `texto`, `botones`, `oido`, `cerrar`, `tamano {w,h}`, `js {code}`.
   El reloj está parado: solo avanza con `toca`, `espera` y `salta`. `foto` espera 1,2 s de verdad a los fundidos.
4. El worktree tiene `node_modules` como enlace: `rmdir` sin `/s` antes de quitarlo.
