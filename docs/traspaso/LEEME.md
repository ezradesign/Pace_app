# Traspaso de PACE: léelo primero

Este archivo es para un Claude que empieza de cero, en esta cuenta o en otra, y tiene que retomar PACE sin preguntarle a Ez lo
que ya se decidió. Junto con `CLAUDE.md` y `STATE.md`, basta para seguir. Se actualiza en cada hito (regla en `CLAUDE.md`).
Última actualización: 25 nov. 2026, con la 0.220.0 en `main` y el proyecto limpio de ramas. Los relevos de
antes del 20 nov., en `docs/archive/LEEME_TRASPASO_HASTA_19NOV.md` (D4 A de Ez, 23 nov.).

## Relevo más reciente · Desktop (28 nov. 2026)

En `feat/desktop`, leer primero [desktop-28nov.md](desktop-28nov.md): mandato de Ez, prototipos, límites, decisiones, arquitectura y pasos pendientes para Windows/macOS. Solo documentación autorizada; no tocar `main` ni implementar sin aprobación. El relevo histórico de abajo se conserva.

## El arranque, en una pantalla

- **Qué es PACE.** App de pausas activas para quien trabaja sentado: Foco (Pomodoro), Respira, Mueve, Estira, Hidrátate, logros
  y «A tu ritmo», que reparte foco y pausas por la jornada. Web en https://pacegrass.app, Android con Capacitor e iPhone por
  TestFlight. **v1.0 es la primera versión de pago, en las tres a la vez** (Ez, 22 oct.).
- **Qué leer.** `CLAUDE.md`, `STATE.md` (el presente y lo que espera a Ez), el primer bloque de abajo, `ROADMAP.md` («Lo que queda
  hasta v1.0») y, antes de tocar un subsistema, su fila en `docs/product/DECISIONES_TECNICAS_VIGENTES.md` (con grep). Las
  decisiones de producto, en `docs/product/DECISIONES_PRODUCTO.md`.
- **Cómo trabaja Ez.** En español, frases completas y sin jerga; si tiene que configurar algo, pasos numerados. **Cualquier
  cambio se le pregunta antes** (23 nov.): auditar y medir sí, tocar no. Decide mirando una página con fotos, opciones con letra
  y una recomendación, y contesta con letras («1A + 2B»). Lo montado va en una rama y no se junta en `main` sin su «júntalo».
  Commits sin línea `Co-Authored-By`. Cada cambio que se note lleva su novedad en el sobre (`app/shell/novedades.data.js`).
- **Dos cuentas de Claude.** Al 85 % de uso, «wip» y push de cada rama; al 90 %, relevo a la otra cuenta (`docs/WORKFLOW.md`
  §10). El «al 100 %» del 21-23 nov. fue solo para esos días (D3 B de Ez). El repo es la única memoria compartida.
- **Lo que no está en el repo, a propósito.** Claves, contraseñas y tokens. Las llaves privadas (Play, códigos de PACE completo,
  Apple) viven fuera; dónde, lo sabe Ez. El correo de contacto de PACE, `hola.ezradesign@gmail.com`, sí está: es público
  (privacidad y ficha de Play).
- **Frase de arranque para la otra cuenta:** «Eres la coordinadora de PACE. Lee CLAUDE.md, STATE.md y el arranque de
  docs/traspaso/LEEME.md, y sigue desde el primer bloque de relevo. Nunca juntes nada en main sin mi sí.»

## AL RELEVO (25 nov.): el proyecto, limpio; se retoma desde `main`. Manda sobre todo lo de abajo

- Ez, 25 nov.: «Deja todo el proyecto limpio de ramas y cosas pendientes, que vamos a retomar desde donde estaba publicado».
- **Punto de partida: `main` = 0.220.0** más el arreglo de `ritmo.spec` (ef0e2be), lo publicado en https://pacegrass.app,
  con la CI en verde. No queda ninguna rama más que `main` ni PRs abiertos: se cerraron sin juntar el 7 (las V), el 10
  (M5A y M12A) y el 12 (tiendas, 0.221.0). Los bloques de relevo de abajo son historia: lo que dicen «sin juntar» o «espera
  a Ez» sobre esas ramas ya no está pendiente.
- **Lo archivado**, por si Ez quiere recuperar algo (`git checkout -b <rama> <etiqueta>`):

  | Etiqueta | Commit | Qué era |
  |---|---|---|
  | `archive/v-24nov-25nov` | 26bf657 | Las V (PR 7), sin juntar |
  | `archive/project-thread-37sjmk-25nov` | 8cb949f | M5A y M12A de la revisión visual (PR 10), sin juntar |
  | `archive/project-thread-a856we-25nov` | 1f193da | 0.221.0, lo que piden las tiendas (PR 12), sin juntar |
  | `archive/diag-ahora-no-24nov-25nov` | 0ba68bd | Diagnóstico de «Ahora no» a 360 px (no se juntaba) |
  | `archive/diag-f4-24nov-25nov` | 6b6eca9 | Diagnóstico de la F4 en Linux (no se juntaba) |
  | `archive/diag-fondo-24nov-25nov` | 2bf535a | Diagnóstico de la auditoría a fondo (no se juntaba) |
  | `archive/dependabot-multi-7f73b8225b-25nov` | 9a7a088 | Dependabot: minimatch y rimraf |
  | `archive/experiencia-24nov-25nov` | 4c6df4e | Ya en `main` |
  | `archive/fondo-24nov-25nov` | 9010b20 | Ya en `main` |
  | `archive/project-thread-6ate4b-25nov` | 3d0b43d | Ya en `main` |
  | `archive/state-hoja-24nov-25nov` | 8800e30 | Ya en `main` |

  La vista previa de las E (E1A, E5A, E7A) nunca se subió como rama: su diff está en la carpeta del proyecto,
  `revision-visual-24nov/vista-previa-e/e-prueba-sobre-ccdf3db.diff`.
- **Lo siguiente: la «A»**, avisos durante la jornada sin pulsar nada (Ez, 25 nov.: «La A puede estar bien si la
  implementamos con lógica»). Está en diseño: reglas en https://claude.ai/artifact/3wtczSdUizJZQuj8pbHkbN, con R1-R6 por
  elegir. No se monta nada antes de sus letras.
- **Espera a Ez, además:** subir la 0.220.0 a Play y a TestFlight, y lo de `STATE.md` («Espera a Ez»).

## AL RELEVO (24 nov., 23:00, la cuenta del proyecto «Pace App»): empieza aquí; manda sobre lo de abajo

- **`main` = 0.220.0**: la experiencia (U1A U2A U4A U6A; U3B y U5B como están). Ez, 24 nov., 22:59: «Si, haz todo lo que tengas
  que hacer, deja todo limpio y ordenado» a «¿Junto la experiencia?». La CI de la rama, en verde con 4c6df4e.
- **Las V, montadas todas en `claude/v-24nov` (PR 7) y sin juntar**: V1, V2A, V3A, V5A, V6A, V7B, V8A, V9A, V10A y V11A (V4C como
  estaba). Qué es cada una, con fotos, en el PR y en `docs/audits/v-24nov/` de la rama. Antes de su «júntalo», Ez mira «Hoy,
  jueves» en el móvil (V8A) y oye «Colócate», que la primera vez puede llegar hasta medio segundo tarde (V3A).
- **La prueba que tiraba su CI, `voz-cuerpo-fila` fila-4**, no era de las V: esperaba solo a la toma de la cuenta atrás y pedía
  los números, que van en otra. Arreglada en `main` por el hilo de la auditoría (5a5d7dde, PR 8); la rama de las V la recibe al
  juntar `main` en ella.
- **Espera a Ez:** qué versión sube a Play y a TestFlight (la 0.220.0 ya, o la que lleve las V), y las dos cosas de las V.
- **Regla de Ez (24 nov.):** al 85 % de uso, todo registrado y subido, y un prompt listo para pegar en la otra cuenta.

## AL RELEVO (24 nov., noche): la auditoría profunda, montada con el «Sí a todo» de Ez

- Página: https://claude.ai/artifact/XPWzwT2rUrPFbKtBsrKAGs (13 hallazgos, H1-H13). Ez: «Sí a todo» = H1A H2A H3A H6A H7A
  H8A H10A H11A H12A. Juntado el PR #8 (la prueba `fila-4`, que solo esperaba la toma de la cuenta, y las trazas del CI).
  En el PR siguiente, desde `claude/project-thread-6ate4b`: TestFlight espera al CI en verde, acciones de GitHub en Node 24,
  `npm audit fix`, `engines` (Node 24), seis archivos troceados sin cambiar nada (comprobado al píxel) y las reglas nuevas
  de CLAUDE.md (juntar solo por PR con el CI en verde; lo pesado, a Releases). Cerrado el #5 de Dependabot.
- **Espera a Ez:** activar la regla de la rama `main` en GitHub (los clics, en el hilo de la auditoría) y borrar las cinco
  ramas que sobran (`fondo-24nov`, `state-hoja-24nov`, `diag-ahora-no-24nov`, `diag-f4-24nov`, `diag-fondo-24nov`): desde
  la nube no se pueden borrar. Sus commits están en `/mnt/project-files/auditorias/ramas-borradas-24nov.txt`.

## AL RELEVO (24 nov., cuenta EcLj6; 5 h y semana al ~10 %)

- **`main` = 0.218.0** (Ez, 24 nov.: «Júntalo»; suite entera sobre la rama, 2033 en verde): el pulido de antes de publicar con las letras
  de Ez del 23 nov. («1A + 2A + … + 10A + D1A + D2A + D3B + D4A + D5A + D6B + D7A + LA + TA»; página «Pulido antes de
  publicar», https://claude.ai/artifact/Y8ndbMvWmgGQ5S85y8N1CP). Montadas las diez de la app (`tests/pulido-23nov.spec.js`,
  calibrada en rojo contra la 0.217.0), juntada `claude/guardar-atomico-166e3f` (D7) y puestos al día STATE, ROADMAP, este
  archivo y las reglas sustituidas (D1, D2, D4, D5). D3 B: el relevo al 90 % sigue. D6 B: borrar el reloj de barra, el
  analógico y el «orgánico» después de v1.
- «Escríbenos» escribe a `hola.ezradesign@gmail.com` (Ez, 24 nov.), compuesto al ejecutarse para que Cloudflare no lo
  reescriba (fila nueva arriba de las reglas técnicas). Las 37 copias de trabajo y las ramas viejas, autorizadas por Ez para
  quitarlas (copia de todas en `backups/ramas-24nov-2026.bundle`).
- El primer CI de la 0.218.0 salió rojo: a 360 px, en Linux (= Android), «Ahora no» y «Hoy voy por libre» no cabían con el
  título por 0,01 px (en Windows sobraban 2,8). Medido en `claude/diag-ahora-no-24nov` (no se junta) y arreglado en `main`
  (huecos y letra un pelo más juntos por debajo de 370 px; sobran ~10 px en Linux): CI 45379289073 en verde entero.
- **Auditoría a fondo (24 nov.)**, página https://claude.ai/artifact/1agCtKgFivrUXaHgdRLajp (solo se abre desde la cuenta
  que la hizo; desde la de la semana que se repone el martes a las 14:00, no): 268 pantallas sin errores ni desbordes; ocho hallazgos (F1-F8) y G1. **`main` = 0.219.0** con F1A F2A
  F3A F5A F6A F7A (Ez: «F7A F4A y júntalo»; suite entera sobre la rama, 2040 en verde). La F7A es `og-pace.jpg` tal cual.
  **La F4, en la 0.219.1**: «{zona}: yet to move» (Ez, 24 nov.); ayer sigue «idle yesterday». La recomendada, «not moved
  yet», cabía en la ventana de la pausa pero en la fila de la home, con la letra al 115 %, se salía 3 px en Linux
  (`claude/diag-f4-24nov`, no se junta); la prueba de `fondo-24nov` mide ahora las seis zonas, no solo la del día.
- **Auditoría de la experiencia (24 nov.)**, página https://claude.ai/artifact/A5uYmcbADK4kmKnboHC1E8: seis puntos, U1-U6
  («ciclo» y «bloque», «micro-pausas de foco», el móvil de `og-pace.jpg`, «vez.» sola, el lema del logo y 38 textos sin
  pantalla). Nada tocado; espera sus letras.
- **Siguiente (Ez, 24 nov.: «sigamos haciendo repaso, auditoría, mejoras en profundidad»):** una auditoría a fondo (móvil,
  tableta y ordenador; es y en; claro y oscuro; flujos largos y accesibilidad), con página de letras antes de tocar nada.

## AL RELEVO (23 nov., cuenta EcLj6; semana al 98-100 %, se repone el martes 24 a las 14:00): empieza aquí

- **`main` = 0.216.0**: la caza de los huecos (Ez «2A + 4A») y la página de la caza de las apps (Ez: tabletas de Android 16, «A, dejarlo así»). Al mandar v1 a la App Store, en las notas para el revisor: avisos del Foco y de la pausa, calendario del iPhone, vibración en Mueve y Estira y la compra con Apple (la norma 4.2, «una web dentro de una app»).
- **Hecho: la 0.217.0** con la barra lateral (antes, sin juntar: `claude/sidebar-mejoras-23nov-bceb9a`). Ez (23 nov., literal): «1C + 2A + 3B + 4B + 5A». 1C = como está; 2A «Un vaso más. Deshacer»; 3B el último logro en una línea; 4B «2 días seguidos · tu mejor, 9» (ya montada); 5A Ctrl + \ pliega la barra. Su sesión las monta y sube tras cada letra; al acabar, fotos en `docs/proposals/sidebar-23nov/montado/`, enseñárselas a Ez y juntarlas como 0.217.0 con su novedad.
- **Espera a Ez:** la 4 del móvil (el aviso en la web del móvil con la pantalla bloqueada), la miniventana en su Chrome y los pasos de cinco minutos de la página de las apps.

## AL RELEVO (22 nov., cuenta EcLj6; semana al 80 %, se repone el martes 24 a las 14:00): empieza aquí

- **`main` = 0.214.0** (la home con el navegador ampliado, A de Ez), GitHub en verde. Nada sin subir.
- **La caza completa del 22 nov.** (tres sesiones en Opus 5.5, esfuerzo alto), cada una en su rama y sin juntar. Páginas: ordenador GKPDhv3qS2AWdkM5WMf4HN, móvil MsoqxhnRYchgMqLTyT89Zo, datos TuDuWPWYAd9N1Vuh8mgwwR; las preguntas juntas, 8FWH7kpL1kDdRY3tsDjX3y.
  - `claude/caza-datos-22nov-0e230b`: la racha con el reloj hacia atrás y la voz sin conexión tras actualizar, arreglados. Lista para juntar.
  - `claude/caza-web-22nov-829743`: el encabezado para el lector de pantalla, arreglado. Ez (22 nov., literal): «La 1 no la entiendo no veo bien el cambio en capturas de toda la ventana + 2A + 3A + 4A + 5A pero solo Sin rachas que castigan». Se montan 2A (minutos de la rutina en Estadísticas), 3A («Pausa terminada · Volver» en la miniventana), 4A («Cuatro gestos») y la 5A corta («Sin rachas que castigan» / «No streaks that punish you»). La 1 (la comida a las 14:20) se vuelve a maquetar con recortes del aro y la línea, en `docs/audits/caza-completa-22nov/web/comida/`.
  - `claude/caza-movil-22nov-a63749`: el zoom al tocar un campo en el iPhone, Atrás en «Tus datos» y dos toques pequeños, arreglados. Ez: «Movil: 1A + 2A +3A + LA 4 LA POSTPONEMOS + 6A». Se montan 1A (apps solo en vertical), 3A («Bloque terminado») y 6A (sin la línea repetida en «PACE completo»). La 4 (el texto del aviso en la web del móvil) espera a que Ez pruebe en su Android si llega con la pantalla bloqueada.
- **Hecho (23 nov.): la 0.215.0** con las tres ramas y la 1A de Ez («A, comida en el aro»). Suite entera sobre la unión: 2030 en verde; las dos rojas, `ritmo-pausa` (carga) y `sw-voz-actualiza` (la prueba servía mal la versión nueva; arreglada por su sesión). Queda la 4 del móvil (el texto del aviso en la web del móvil), pendiente de la prueba de Ez en su Android.

## AL RELEVO (21 nov., cuenta EcLj6; Ez: «puedes llevar el uso al 100 %, seguimos aquí cuando se restablezca»): empieza aquí

- **`main` = 0.213.0** con el «Sí, júntalo» de Ez: las cuatro ramas de sus letras del 20 nov. (miniventana sola + 2A, caza + 1C, auditoría + Haptics + 3A 4A 5A 6A, barrido + 7A). Página de lo montado: ShopHkxE7Yoh1GhANwr95R. La novedad del sobre, «miniventana-sola». Suite entera sobre la unión: 1994 en verde; la única roja era `aro-jornada.spec.js:206` (buscaba «Bloque» a secas y la 7A dejó «Bloque cerrado»), puesta al día.
- **Espera a Ez:** probar la miniventana en su Chrome (se abre sola, se cierra y no vuelve; en la jornada, «Bloque N de M» y terracota al acabar), y la 3A no se sabrá del todo sin una licencia de prueba de Play.

## AL RELEVO (20 nov., 22:25, manda lo de arriba; cuenta EcLj6 con las 5 h al ~92 %; se reponen a la 1:50): empieza aquí; manda sobre todo lo de abajo

- **`main` = 0.212.0 + Ocaso tras «Seguir por libre» + la novedad del sobre, GitHub en verde entero** (CI 44814473490 sobre 2219f993). Nada sin subir.
- **Ez eligió (20 nov., literal): «1C 2A 3A 4A 5A 6A 7A»** en la página de las elecciones (EcLj6 `YZXqYBR987pVabe63345wp`; copia en `docs/proposals/elecciones-20nov/index.html`, a publicar en la otra cuenta y apuntar su par). Y «guarda estas elecciones y prepara todo».
- **Qué es cada letra y en qué rama se monta** (cada rama con su worktree en `.claude/worktrees/`; cada una con su prueba que cae en `main`; nada se junta sin enseñárselo a Ez):
  - **`claude/mini-sola-20nov`** (6beec752, worktree `aviso-foco-pc-19nov-60ef7c`): la miniventana se abre sola al pulsar «Empezar» y deja de hacerlo si la cierras tú (A de Ez), hecha. Aquí también la **2A**: con «A tu ritmo», la miniventana habla como el aro («Foco · Bloque 1 de 8»), al acabar el bloque «Foco terminado» en terracota con «Volver» hasta que vuelves, y en la pausa del día la cuenta sin botón (su «Pausar» no pausaba). Fotos en `docs/proposals/caza-0212-20nov/` de la rama de la caza. Falta que Ez la pruebe en un Chrome de verdad.
  - **`claude/nifty-goldstine-5e67f9`** (caza de la 0.212.0, 56b01450): la campanita del sello ya espera a las tres campanadas (hecho). Aquí la **1C**: en el móvil (la web) con los avisos bloqueados, el cómo va en la línea pequeña de la fila («Bloqueados · permisos del sitio › Notificaciones» / «Blocked · site settings › Notifications») y la nota larga solo en el ordenador; Ajustes a 360×640 sin scroll en los dos idiomas.
  - **`claude/infallible-elbakyan-c498b0`** (auditoría, 5f7bbf00, página en `docs/audits/auditoria-0212-20nov/`): Haptics en la lista del iPhone y su `verify` (hecho, grave). Aquí la **3A** (Android: lo comprado y los precios, uno detrás de otro, y la pieza espera a la conexión en marcha), la **4A** (tienda apagada = lo guardado no abre nada), la **5A** («¿Te ayudó?»: tres veces, contestes o no, y luego una por semana) y la **6A** (la web guarda solo la voz y el idioma que usas la primera vez que abres Mueve o Estira). Las pruebas que caen, en `caen-en-main.spec.js` de esa carpeta.
  - **`claude/kind-mendeleev-1657b4`** (barrido, 72230895, página en `docs/proposals/textos-al-limite-20nov/`): la **7A**, los textos más cortos de la página (15 «Cuídate», 7 instrucciones, 3 títulos, «Siguiente» con Auto, 3 filas de Ajustes, home y pausa al 115 %), sin tocar los avisos de seguridad; volver a medir en Linux con la rama `claude/diag-linux-20nov` (no se junta) o la sonda de la rama. Los textos de Mueve y Estira: ids cruzados (CLAUDE.md).
- **Después:** suites de una en una, enseñar a Ez, su «júntalo», y la **0.213.0** con su novedad en el sobre (regla de Ez del 20 nov.: cada cambio que se note lleva la suya en `app/shell/novedades.data.js`).
- **Ojo, del 20 nov.:** un texto que «cabe» se mide también en Linux (fila nueva arriba de `DECISIONES_TECNICAS_VIGENTES.md`); y un texto con comillas invertidas dentro de un `node -e "…"` en Bash ejecuta trozos sueltos: los scripts de edición, a un archivo.

## AL RELEVO (20 nov., 12:30, cuenta EcLj6): manda lo de arriba

- **`main` = 0.212.0 con el «Júntalo todo» de Ez:** las siete ramas del 19 nov. (menores, recorrido con la 11 y la tarjeta limpia, voz 1A, visita A, caza, aviso del Foco en el PC y comida con «Seguir por libre» A). El CI pasa a seis trozos y el censo de claves, a 1325.
- Al juntar chocaron cinco pruebas (no la app) y una letra con otra: con los avisos bloqueados, la caza 4A (la línea de la fila) y el aviso 1.2A (la nota de cómo desbloquear) no cabían juntas en inglés a 1280 × 720 (22 px). Ez eligió la **C** (página NeBtettfymr4RwBjBgHTdj): en inglés, «Background», «While you breathe» y «Copies, deletion and PACE Complete»; la nota se queda entera.
- **El CI de GitHub (Linux, que pinta la letra como Android) sacó tres textos más al límite;** medidos en Linux con la rama de diagnóstico `claude/diag-linux-20nov` (no se junta), Ez eligió 1A 2A 3A (página 57qUVTJTpogW8Ddcz9nBmj). Regla nueva arriba de `DECISIONES_TECNICAS_VIGENTES.md`. GitHub en verde entero con 1435bc51 (CI 44811782413): **la 0.212.0, cerrada.** Después, en `main`: la novedad del sobre (regla de Ez: cada cambio que se note lleva la suya) y el arreglo de Ocaso tras «Seguir por libre» (sí de Ez).
- **Sesiones en marcha, cada una en su rama y sin juntar:** caza de la 0.212.0 (cruces entre las siete ramas), barrido de textos al límite en Linux/Android y auditoría de la 0.205.0 a la 0.212.0 (Ez la quiso aquí y no en Fable).
- **Ez piensa en la miniventana:** que se abra sola al pulsar «Empezar» en el PC y que la cierre quien no la quiera, en vez de abrirla con el texto. El navegador solo deja abrirla dentro de un toque.
- **Sin probar:** el aviso y la miniventana en un Chrome de verdad, y un hueco de la comida: tras «Seguir por libre», un Foco después de la salida podría seguir contando para Ocaso.


Lo anterior al 20 nov. (relevos del 8 oct. al 19 nov., las líneas abiertas y las decisiones de entonces), en
`docs/archive/LEEME_TRASPASO_HASTA_19NOV.md`.
