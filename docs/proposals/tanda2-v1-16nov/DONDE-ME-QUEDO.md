# Tanda 2 antes de v1 · dónde me quedo (16 nov. 2026)

Rama `claude/tanda2-v1-16nov-ea1aa2`, worktree `version-de-prueba-7b9668`. Corté al 75-85 % del uso de 5 h.

## Hecho

1. **Plurales** · commit a7519a67, subido. `scripts/verify.plurales.js` barre las claves con
   «{hueco} palabra-en-s» y exige el singular elegido en el código o su motivo en `SIN_SINGULAR`.
   Destapó y arregla «La copia trae 1 logros» (importar) y «1 de 1 pausas hechas» (carta del lunes).
   `tests/plurales.spec.js` (3, caen con el mutante). Censo i18n 1210, MINIMO_PRUEBAS 1592.
2. **Salir de una pausa empezada** · YA ESTABA en `main` desde la usabilidad del 8 nov. (2A de Ez,
   commit 37f4603d): `TopBar.jsx` pregunta «¿Dejar la pausa?» / «¿Pasar a la pausa larga?» con
   Pausa o Larga en marcha o parada (`pacePausaLleva`). `tests/aro-modo-identidad.spec.js`: 10 en
   verde; quitando la pregunta caen 7. No hay código que cambiar: la línea de STATE («pero no una
   pausa») está vieja. Lo único que cambia de modo sin preguntar es el atajo de la PWA `?go=focus`
   al arrancar (`main.jsx:96`), fuera de la barra: queda como posible seguimiento.

## Falta

3. **Pruebas del estado guardado (0.191.1 = be9fd861, 0.174.0 = 570ab80a; no hay etiquetas locales).**
   Plan pensado:
   - Capturar un estado REAL de cada versión: una spec de usar y tirar que sirve
     `git show <commit>:index.html` en una ruta falsa del mismo origen (`page.route('**/viejo.html')`),
     hace un Foco de verdad con `page.clock`, añade un vaso, pone la semana con `setState` de esa
     versión y vuelca `pace.*` de localStorage y el IndexedDB `pace.events.v1`. Guardar en
     `tests/fixtures/estado-v0.191.1.json` y `estado-v0.174.0.json`.
   - La prueba: escribir localStorage e IndexedDB en una página vacía del mismo origen (ruta falsa),
     y luego abrir `/index.html`. El código: `firmar({ tester: 3 })` con `conLlaveDePrueba`
     (tests/licencia.helpers.js) metido en `licencia` antes de sembrar (la firma real no se puede).
   - Mirar: sin bienvenida, `totalFocusMin`, `history.days`, los logros, `ritmo` (semana/horario),
     `licencia` y `hasPremiumEntitlement()` con `PREMIUM_ABIERTO_HASTA_V1 = false`;
     `paceReparadosAlCargar` vacío; los eventos de antes siguen y uno nuevo se escribe
     (`paceEventsCanWrite`, `paceEventsAppend`); recargar tras una escritura y volver a mirar
     (un catch de fábrica falla en la PRIMERA escritura).
4. **D-1 y D-2, HECHOS** en el commit siguiente al wip (`scripts/verify.claves.js`, visto caer con dos
   mutantes; `verify` en verde; censo 1208: salen `path.card.done` y `path.hydrate.skip`, que repetía
   «Saltar»/«Skip»). SIN PASAR todavía las vecinas e2e: caza-ingles, caza-respira, respira-cierre,
   logros-i18n y alguna de los Caminos (con `--workers=1` en el 8855). **Falta D-3.** Lo de antes:
   **D-1, D-2, D-3** (`docs/audits/audit-completa-s178.md` §5.2), sin cambiar texto visible:
   - D-1: `content/breathe.js` redefine 11 claves de `strings/sessions.js`; 9 iguales y 2 distintas
     (las oceánicas: lo que se ve es «Oceanic inhale/exhale»). Poner esos dos valores en
     sessions.js (EN) y quitar el bloque de content/breathe.js; una comprobación en verify de que
     content/* no redefine ninguna clave de strings/*. El censo de claves no cambia.
   - D-2: `path.card.done` = `paths.library.doneToday` («Hecho hoy» / «Done today»): usar la de
     paths y quitar la otra (censo −1).
   - D-3: 17 `path.*` y 27 `paths.*`. OJO: `path.dawn`, `path.midday`, `path.tea`… son IDS de
     Caminos (datos, logros, progreso guardado), no claves de i18n: no se renombran. Renombrar solo
     las claves de i18n `path.*` a `paths.*` y sus usos en `app/paths/`.
5. Página «Montado» en esta carpeta (estilo `docs/proposals/arreglos-s3-s4-13nov/index.html`),
   publicada como Artifact, y STATE: quitar «pero no una pausa» y «i18n con plurales».

Pruebas: `PACE_E2E_PORT=8855 npx playwright test <spec> --workers=1`.
