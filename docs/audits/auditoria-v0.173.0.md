# Auditoría completa de PACE en v0.173.0

Pedida por Ez el 18 oct. 2026: «qué dirección está tomando, qué queda por hacer, incoherencias y
contradicciones a corregir; que no falte nada por revisar». Parte de la auditoría del 16 oct.
(`auditoria-v0.171.0.md`, sin fallos graves y con todo lo que Ez decidió ya hecho) y mira lo que ha
cambiado desde entonces y lo que aquella no miró: la dirección, el plan frente a lo hecho, los
documentos entre sí, las ramas y las sesiones. Página para Ez con lo mismo y las decisiones: ver
`STATE.md`.

## Cómo se hizo

- `npm run verify` (pasa: 0 problemas, 1 aviso), las reglas de `CLAUDE.md` que `verify` no mira, a
  mano; el CI de `main` (las tres en verde en las 20 últimas); el catálogo contado evaluando los
  datos; `git` (ramas, worktrees, lo que falta en `main` por asunto y por árbol); las sesiones del
  escritorio; los documentos cruzados entre sí y con el código; la web publicada
  (pacegrass.app y /premium) a 360×740 y 1280×800 con un perfil nuevo.
- No se corrió la suite e2e en local: el CI la pasó entera sobre este mismo commit (933fa80).

## 1. Hacia dónde va

- Del 5 al 17 oct.: **60 versiones** (v0.134.0 → v0.173.0), 363 commits en `main` (47 `feat`, 52
  `fix`, 86 `docs`). Casi todo fue a «A tu ritmo» (series, motor de la semana, carta del lunes) y a
  preparar la venta (/premium, la tienda vacía, la revisión de las 53 rutinas). Cuadra con lo que Ez
  decidió el 16 oct. («Lo que hace bueno a PACE antes de cobrar»).
- El plan del 5 oct. (`ROADMAP.md`, «Camino a v1.0») va así en el código: Fase 1 hecha; Fase 2 hecha
  en código, sin probar en un móvil ni abrir Play; Fase 3 casi (el motor en v0.173.0; los días
  diseñados en curso); Fase 4 hecha (v0.160.0 y v0.170.0); Fase 5 cerrada; Fase 6 empezada
  (/premium, «Avísame» y el punto único de compra, v0.172.0).
- **Lo que fija la fecha de v1 no es código y no se ha movido**: la prueba cerrada de Play (12
  testers durante 14 días; el 5 oct. se dijo «cuanto antes» y la app aún no existe en Play Console),
  el APK sin probar en un móvil desde v0.137.0, el gestor y Stripe (sin ellos no hay venta en la
  web, que va primero), y el logo «FVFN» de la primera pantalla.
- **El alcance de v1 ha crecido sin sacar nada**, contra la regla del plan («ninguna fase entra sin
  sacar otra», `ROADMAP.md:213`): desde el 5 oct. entraron el calendario que se mantiene solo
  (v0.169.0), el calendario total en la web con una función de Cloudflare (por hacer), los días
  diseñados (en curso) y el proyecto de iOS (v0.164.0; iOS sigue «fuera de v1»). No salió nada.

## 2. Hallazgos que piden una decisión de Ez

1. **El calendario: la opción B que eligió Ez el 8 oct. no llegó a `main`.** La rama
   `calendario-reescrita` (= `origin/claude/calendario-sincronizacion`, commit 0f9aa53) llevaba los
   bloques a un calendario propio «PACE», con permisos pequeños en Google (`calendar.app.created` y
   `calendar.freebusy`), para que los compañeros no te vean ocupado de 9 a 17 y se pueda ocultar de
   un clic. `main` escribe en el calendario principal y marca todo como ocupado
   (`app/ritmo/ritmo.calendario.web.js:253` y `:337-342`) con `calendar.events.owned`, que según
   aquella página es el permiso sensible de la verificación larga con vídeo; y
   `docs/CALENDARIO_ALTAS.md:25` le pide a Ez ese permiso. El calendario que se mantiene solo
   (v0.169.0) se montó encima de lo de `main`. Hay que decidirlo antes de las altas de Google y antes
   del calendario total.
2. **El alcance de v1** (punto 1 de arriba): decir qué sale. La candidata es el calendario total en
   la web: pide un servidor con los permisos de la gente, la verificación de Google, las altas de Ez
   y cambiar «sin servidor» en la privacidad, la bienvenida, /premium y la ficha.
3. **La web publica el repositorio entero.** Cloudflare Pages sirve la raíz
   (`DECISIONES_TECNICAS_VIGENTES.md`, fila de `_headers`): pacegrass.app/STATE.md,
   /CLAUDE.md, /docs/traspaso/LEEME.md, /docs/product/DECISIONES_PRODUCTO.md, /tests/…,
   /.github/workflows/ci.yml responden 200. El repo ya es público en GitHub (Elastic 2.0, decidido
   en s26), así que no se filtra nada nuevo, pero el dominio del producto enseña notas internas,
   buscadores incluidos, y sube 103 MB de fotos de `docs/traspaso/archivos`. Lo limpio: publicar
   solo la app (`www/`, que ya existe para Capacitor) más `premium/` y `functions/`.
4. **Donaciones en la web cuando se venda PACE completo**: «Da de pastar a la vaca» sigue en la web
   (`MONETIZATION.md`, vía 4 viva). Pedir donación y vender a la vez puede confundir. Decidir si se
   quita el día de v1.

## 3. Documentos que se contradicen (arreglo de texto, sin decisión)

| Dónde | Qué dice | Qué es verdad hoy |
|---|---|---|
| `ROADMAP.md:313` | «Fuera de alcance (nunca): suscripción mensual con renovación automática» | Ez eligió 2,99 €/mes con 7 días (15 oct.) |
| `ROADMAP.md:144-209` | Fases 3, 4 y 6 sin su estado | Fase 4 hecha; motor hecho; /premium hecho |
| `ROADMAP.md:79-80, 232` | Los Caminos «se quedan como están»; «quitar los Caminos de la home» pendiente | Ocultos hasta después de v1 (v0.139.0) |
| `ROADMAP.md:149, 302` | El `.ics` aparcado / idea suelta | Hecho («Al calendario», v0.140.0) |
| `ROADMAP.md:222` | local-first: «backend de producto no» | El calendario total en la web es un servidor de producto (16 oct.) |
| `ROADMAP.md:236-242, 273` | CTB «en el lanzamiento Lifetime»; «UN SOLO PLAN» | CTB fuera de v1; dos planes |
| `MONETIZATION.md:59-60, 88-93, 106` | «Un solo plan, Lifetime»; «PACE no se alquila»; «solo la vía 1» | Dos planes (el bloque de arriba del mismo archivo) |
| `AUDITORIA_SISTEMA_PACE.md:2` y las cabeceras de `ROADMAP.md`, `DECISIONES_PRODUCTO.md:16-20`, `MONETIZATION.md:3-5` | Este documento «gobierna, nivel 1» y gana en conflicto | Sin tocar desde el 30 jul.; `AUDITORIA_DOCUMENTAL.md` ya es historia y manda la tabla de `CLAUDE.md`, que no lo nombra |
| `README.md` y `README_EN.md` (públicos) | Mueve «14 de movilidad» y Estira «14 de calistenia»; Caminos como módulo; «propone tu primer Camino»; «la licencia real aún no existe»; «compra única, sin suscripción»; 154 archivos; 323 pruebas | Mueve es fuerza (15) y Estira movilidad (18); Caminos ocultos; licencia desde v0.157.0; dos planes; 196 archivos; unas 730 pruebas |
| `premium/index.html:139` (pública) | «32 rutinas» gratis | 34 (13 de Respira, 9 de Mueve, 12 de Estira) |
| `DESIGN_SYSTEM.md:39` | `--ink-3` #8A8372 | #77705F desde v0.171.2 (`app/tokens.css:39`) |
| `STATE.md:181-182` | «el motor y la carta llegan cuando haya semanas de datos» | Hechos en v0.173.0 |
| `STATE.md:199-203` | «Siguen en su sesión: la Fase 6 sin Stripe…» | Hecha en v0.172.0 |
| `STATE.md:142-143` | «Qué te ayuda» espera al motor | Ya puede leer `ritmo.aprendido` (`STATE.md:126`) |
| `STATE.md` entero | 259 líneas, 20 KB | `CLAUDE.md`: «que siga cabiendo en una pantalla» |
| `CLAUDE.md:24-25` | La suite «no mira el móvil, los Caminos, el premium ni los píxeles» | 24 specs a 360 px, 24 de premium y 28 de Caminos; solo los píxeles quedan fuera |
| `CONTENT.md:13-31, 388` | Aviso de deriva de s183 (Estira 17) y Respira con 8 premium | Estira 18, Mueve 15, Respira 7 premium |
| `DECISIONES_TECNICAS_VIGENTES.md:237-238` | Eventos «solo diseño, no implementados»; feedback «sin consumidor» | Eventos desde v0.88.0; el motor lo lee desde v0.173.0 |
| `docs/launch/google-play/ficha.md:70` | «no hay servidores de PACE» | La regla de s151 (`DECISIONES_TECNICAS_VIGENTES.md:196`) prohíbe prometerlo |
| `LEEME.md:400` frente a `STATE.md:225` | «Ez tiene ya los ids del calendario» (12 oct.) / «dar de alta y pasar los ids» | En el código siguen vacíos: preguntar a Ez |
| Dibujos: `STATE.md:232-239, 253`, `ROADMAP.md:175`, `GLIFOS_A_DIBUJAR.md:8`, `README.md` | 21, 22, «3 + 18», «8 + 7 equivocados», «59 de 63», «77 con arte» | Cuatro cuentas distintas; los días diseñados añadirán dos |
| `docs/traspaso/LEEME.md` | 717 líneas de relevos acumulados | `CLAUDE.md`: ya no se escriben diarios ni handoffs |

## 4. Código y calidad

- `verify` en verde (36 s). Las reglas que no mira, a mano: ningún `type="module"`; el único
  `const styles` es una variable local (`TimerDial.jsx:37`); todo `playSound()` va en `try`; las
  fechas de la racha se guardan con `toDateString()` (se leen en hora local: bien); el único
  `console.log` solo corre en desarrollo (`MoveSessionV1.support.jsx:231`). Los JSX sin
  `Object.assign(window)` al final solo inyectan CSS o amplían un objeto: bien.
- **Archivos en el tope de 500 líneas**: `state-core.jsx`, `main/_responsive.js` y
  `main/_responsive.atmosfera.js` (500), `home-geometry.js` (499), `TimerDial.jsx` (498),
  `state-ritmo.jsx` (492, y los días diseñados lo tocan), `main.jsx` (488). El próximo cambio en
  cualquiera obliga a trocear. `build-standalone.js` tiene 570 y queda fuera de la regla.
- **CI**: las tres (CI, Android, iOS) en verde en las 20 últimas. El job `e2e` tardó 20 min 38 s
  con un tope de 25 (`.github/workflows/ci.yml:149`); la suite crece unas 20 pruebas por versión.
  Cuando pase del tope GitHub lo da por cancelado (ya pasó en v0.151.0). Partirlo en dos
  (`--shard`) antes de que caiga.
- Peso: `index.html` 1,85 MB (533 KB comprimido; 1,79 MB en v0.171.0). La primera visita precarga
  235 archivos, 7,2 MB. Sigue abierta la idea de bajar los dibujos de logros y las voces del otro
  idioma cuando hagan falta.
- Seguridad: cabeceras en su sitio (comprobadas en pacegrass.app), 0 alertas de Dependabot, 0 PR
  abiertas, ninguna llave privada en el repo, los 654 commits firmados por Ez.

## 5. La app publicada (18 oct., perfil nuevo)

- Bienvenida en dos pasos, home sin scroll a 360×740 y a 1280×800, sin errores en la consola,
  /premium bien a 360 px y sin scroll de lado.
- La primera pantalla de la bienvenida enseña el logo con «FVFN» (espera a Ez desde el 12 oct.).
- A las 12:40 la home ofrece «Media jornada · de 12:40 a 13:00» (20 min). Es lo decidido (la media
  jornada es un horario propio, s197), pero ofrecer una opción de 20 min se lee raro: a mirar
  cuando se toque la pregunta del día.
- «Dos horas» a las 12:45 pone foco a las 14:05, encima de la comida: también decidido (la comida
  es solo de la jornada entera, s197).

## 6. Orden y limpieza (con el sí de Ez)

- **Ramas locales**: 22 que no están juntadas por número pero cuyo contenido ya está en `main`
  (copias de antes de reescribir la historia el 13 oct.) más `claude/series-aprende-f0af86` (sus
  archivos son iguales en `main`). Se pueden borrar. `calendario-reescrita` se guarda hasta decidir
  el punto 1. Activa: `claude/sad-ishizaka-293093` (los días diseñados).
- **Ramas remotas**: 21; además de las juntadas, `origin/claude/play-rutina-subidas` (un commit de
  permisos de `.claude`) y `origin/claude/series-aprende-f0af86`.
- **Sesiones del escritorio**: unas 25 de PACE terminadas siguen sin archivar (coordinadoras viejas,
  calendario-solo, ritmo-deudas, home-corrida, series-aprende, iOS, caza del Foco…). La única
  abierta con trabajo es «Los días diseñados», que espera las cuatro respuestas de Ez
  (https://claude.ai/artifact/QDPnikTet4DfaMFjQFHazg).
- **Borradores de release**: 35, cada uno con su AAB firmado; 179 artefactos y 1,3 GB de caché del
  CI. Basta con guardar los últimos.
- **Repo**: 137 MB empaquetado; `docs/traspaso/archivos` ocupa 103 MB (fotos de las páginas para
  Ez). Las páginas ya viven como artefactos: las fotos nuevas pueden quedarse fuera de git.
- La coordinadora anterior contestó en inglés su último mensaje (`CLAUDE.md`: con Ez, en español).

## 7. Lo que espera a Ez, por lo que desbloquea

Lo que marca la fecha de v1:
1. Crear la app en Play Console y subir el AAB a la prueba interna; abrir la prueba cerrada con 12
   testers (empieza el reloj de 14 días). A la vez, probar el APK en su móvil.
2. El gestor y la cuenta de Stripe con Managed Payments (la web vende primero).
3. Volver a exportar el logo («FVFN» sale en la primera pantalla y en /premium).

Lo demás (`STATE.md`, «Espera a Ez»): contestar los días diseñados; las altas de Google y Microsoft
(después de decidir el punto 1); el KV de «Avísame» y el nombre de la privacidad; los códigos a los
testers; las voces del suspiro; los dibujos; oír la voz grave y los cuencos; Apple Developer; la
copia de las llaves al disco duro.

## 8. Uso de la cuenta

El 18 oct. la semanal iba por el 86 % (se repone el lunes 20 a las 15:00) y la de 5 horas por el 10 %.
`docs/WORKFLOW.md` §10: con la semanal por encima del 85 %, el resto de la semana se prefiere la
otra cuenta.
