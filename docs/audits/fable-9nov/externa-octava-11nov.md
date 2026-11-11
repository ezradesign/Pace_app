> Octava pasada externa (Fable, en la app de fuera), traída por Ez el 11 nov. 2026 a las 12:30. Texto tal cual, sin comprobar.
> Mira las pruebas, `verify` y el CI: la red de seguridad. La fecha del título (12 nov.) es la que puso ella.

# Auditoría de la red de seguridad de PACE (12 nov. 2026)
Alcance real. El lector de archivos falló a menudo, así que leí enteros unos 20 de los ~110 archivos de `tests/`, seis módulos de verify (`pruebas`, `web`, `licencia`, `privacidad`, `autoria` y la cabecera de `verify.js`), `playwright.config.js` y `ci.yml`. `android.yml` e `ios.yml` los conozco solo por una lectura anterior. No vi la definición de `MEDIODIA` en `helpers.js` ni unos 70 specs, así que en © «nadie lo defiende» significa «no lo vi en lo leído».
No tengo números de línea fiables (el crudo llega sin numerar): doy el nombre de la prueba y la cita exacta para buscarla.
(a) Hora, día, idioma, huso
1 · Grave · `scripts/verify.pruebas.js`, `tandaPruebas`. Comprobado. La regla solo salta si el archivo tiene a la vez `clock.install()` vacío y `new Date().getDay|getDate|toDateString()`. La prueba de la landing que cayó ayer instalaba el reloj a la hora real y adelantaba dos horas, sin leer «hoy» en Node, así que esta regla no la habría cazado. Tampoco ve `Date.now()`, `getMonth()` ni `toISOString()`.
   * Cierre: fallar ante cualquier `clock.install(` sin `time:`, con una lista de excepciones que solo pueda encoger. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/scripts/verify.pruebas.js)
2 · Medio · `tests/caza-respira.spec.js`, respira-5, respira-6 y respira-12. Comprobado: las tres llevan `await page.clock.install();` a la hora real, y respira-5 adelanta hasta 200 s. Entre las 23:56 y las 24:00 cruza el relevo de día a mitad de sesión. Supongo que eso cambia qué logros y avisos salen (`toHaveCount(1)`).
   * Cierre: `install({ time: MEDIODIA })`. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/tests/caza-respira.spec.js)
3 · Grave · `.github/workflows/ci.yml`, bloque `on:`. Comprobado: solo `push`, `pull_request` y `workflow_dispatch`. La suite corre a la hora a la que Ez sube código, y por eso el fallo de las 22:00 tardó semanas en verse.
   * Cierre: un `schedule` con cuatro horas (23:30, 00:30, lunes 08:00, día 1 a las 00:30, hora de Madrid). [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/.github/workflows/ci.yml)
4 · Medio · pruebas de v1 sin reloj y la línea de los lunes. Comprobado: `tests/caza-v1-compra.spec.js` apaga `PREMIUM_ABIERTO_HASTA_V1`, no instala reloj y usa `Date.now()`. La línea de los lunes entró el 11 de noviembre (miércoles) y `tests/lunes.spec.js` la prueba con fecha fija. El lunes 16 será la primera vez que el resto de pruebas «en v1» corran con ella encendida. Supongo que alguna cambia de resultado solo ese día.
   * Cierre: reloj fijo en todas las que apagan la bandera, y una pasada con el reloj en lunes. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/tests/caza-v1-compra.spec.js)
5 · Medio · `playwright.config.js`, `HUSO` y `locale`. Comprobado: todo va en `Europe/Madrid` y `es-ES`, y casi todo a mediodía. Un día calculado en UTC en vez de local solo se nota en Madrid entre las 00:00 y las 02:00. En América se notaría toda la tarde, y nadie lo prueba (existe `fecha-corta-huso.spec.js`, de 1 KB, que no leí).
   * Cierre: un spec con `America/Los_Angeles` y `Asia/Kolkata` a las 21:00 locales (un vaso, un Foco, una sesión) que compruebe que todo cae en el día local. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/playwright.config.js)
(b) Asertos que no pueden fallar
6 · Medio · `tests/estado-saneado.spec.js`, «un weeklyStats roto se repara SOLO». Comprobado: tras pulsar «15 minutos» espera 200 ms y exige `g.totalFocusMin` = 4321, que es el valor de la semilla. Si el gesto deja de escribir o escribe más tarde, pasa igual.
   * Cierre: asertar además algo que solo exista si hubo escritura, por ejemplo los minutos elegidos. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/tests/estado-saneado.spec.js)
7 · Medio · `tests/eventos-backup.spec.js`, «una seccion CORRUPTA aborta el import ENTERO». Comprobado: la copia lleva dos rarezas, `version: 'v9.99.0'` y `schemaVersion: 99`. Si la app rechaza copias de una versión futura (no lo sé), la prueba pasa aunque la sección corrupta ya no aborte. Además mira el estado en cuanto sale un texto con `/Error|error/` y no vuelve a mirar: una escritura posterior se escapa.
   * Cierre: `version: 'v0.99.0'` y releer pasado el plazo de recarga. [Source](https://cdn.jsdelivr.net/gh/ezradesign/Pace_app@main/tests/eventos-backup.spec.js)
8 · Medio · `tests/importar-borrar.spec.js`, «3 · si el navegador no deja borrar». Comprobado: `waitForTimeout(800)` y luego `recargas.n` = 0. La recarga de importar espera 900 ms (lo dice `estado-saneado`). Si borrar usa el mismo plazo (supuesto), una recarga indebida llega después del aserto.
   * Cierre: esperar 1500 ms o exigir que `waitForEvent('load')` venza. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/tests/importar-borrar.spec.js)
9 · Leve · `tests/caza-v1-compra.spec.js`, «el mensual no se vende sin dónde cancelarlo». Comprobado: `if (t.mes) expect(...)`. Hoy no ejecuta ningún aserto, y cuando lo haga le vale cualquier `https://`.
   * Cierre: inyectar un enlace mensual sin portal y exigir que `paceTiendaPlanes` no ofrezca el mensual.
10 · Leve · `tests/lunes.spec.js`, «un martes no sale». Comprobado: abre el cajón y aserta `toHaveCount(0)` al instante. La prueba del lunes necesita `clock.runFor(600)` antes de ver la fila. Supongo que una fila pintada tarde pasaría.
   * Cierre: `runFor(600)` y asertar antes algo que sí esté («Tus rutinas»). [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/tests/lunes.spec.js)
11 · Leve · `tests/compra-tienda.spec.js`, «quien ya tiene PACE completo no ve la tienda». Comprobado: solo compara lo que devuelven `hasPremiumEntitlement()` y `paceTiendaAbierta()`; no abre ninguna pantalla. Un botón de compra que no consulte esa función seguiría saliendo a quien ya pagó.
   * Cierre: abrir Ajustes y la invitación y contar cero botones de compra. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/tests/compra-tienda.spec.js)
12 · Leve · saltos en silencio. No encontré `test.skip` ni `fixme` en lo leído, pero nada los prohíbe ni vigila que el número de pruebas no baje.
   * Cierre: verify falla ante `.skip(`/`.fixme(` y compara `playwright test --list` con un mínimo que solo sube.
© Promesas sin defensa
13 · Grave si se confirma · modal de seguridad de la apnea. Comprobado: respira-14 mira el texto del aviso en tres rutinas con nombre fijo. En `tests/caza-sesiones.spec.js`, `abrirRespira` lo acepta solo si aparece (`if (await modal...count())`), así que no falla si deja de salir. No vi ninguna prueba de estos cuatro puntos:
   * que «Empezar sesión» esté apagado sin marcar la casilla;
   * que Escape o Intro no arranquen la sesión;
   * que todas las rutinas con retención lleven aviso;
   * que las otras entradas (un Camino, la pausa de «A tu ritmo», «Continúa», Tus rutinas) pasen por él.
`biblioteca.spec.js` puede cubrir parte; no lo leí. [Source](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/tests/caza-sesiones.spec.js)
14 · Medio · «no se pierde ningún dato» con el almacenamiento lleno. Comprobado: `tests/estado-no-guarda.spec.js` solo hace fallar `setItem` para `pace.state.v2`. Un navegador lleno falla para todas las claves, incluida la nueva `pace.aro.carta.v1` que escribe el motor del aro. Supongo que alguna de esas escrituras no va protegida.
   * Cierre: la misma prueba fallando para todas las claves: la home monta, no hay errores, sale la barra y un Foco empieza y acaba. [Source](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/tests/estado-no-guarda.spec.js)
15 · Medio · copias antiguas sin marcas de migración. Comprobado: `caza-sesiones` dice que sin `_weeklyStatsReindexed_v0_28_8` «la siguiente lectura corre la semana un día (lo que nunca pasa en una instalación real)». Sí puede pasar al importar una copia vieja. Las pruebas de importación que leí llevan las marcas o solo miran `totalFocusMin`.
   * Cierre: importar una copia sin marcas y exigir la semana y el histórico iguales.
16 · Medio · «la home no hace scroll». Comprobado en `tests/home-sin-scroll.spec.js`:
   * mide solo `scrollHeight - clientHeight` de `[data-pace-home-body]`, no el documento, ni lo horizontal, ni un hijo con scroll propio;
   * los siete momentos son de antes de v1, en jueves y sin barras («versión nueva», «no deja guardar»);
   * el contexto inglés lleva `locale: 'es-ES'`.
Tampoco se prueba la letra grande del sistema en Android. [Source](https://github.com/ezradesign/Pace_app/raw/refs/heads/main/tests/home-sin-scroll.spec.js)
17 · Medio · «nada se guarda con la landing delante». Comprobado en `tests/landing-cara.spec.js`: dispara `pagehide`, `blur` y `visibilitychange`, pero no cambia el tamaño de la ventana ni pulsa el botón de idioma. Ese botón se pulsa en otra prueba, que no mira después `localStorage` ni la cara tras recargar. La regla general («toda escritura sin gesto mira la cara») vive solo en el documento de decisiones.
   * Cierre: añadir esos dos gestos, y un censo en verify de los `localStorage.setItem(` de `app/`. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/tests/landing-cara.spec.js)
18 · Medio · la semana de prueba vive en un campo editable. Comprobado: el CONTROL de `caza-v1-compra` da por bueno que una copia con `pasoV1.hasta` en el futuro abra PACE completo (`paceAbiertoAhora()` = true). `verify.licencia` prohíbe `premiumUnlocked` por ese mismo motivo y no mira esto. Va a las preguntas.
19 · Leve · «nada tapa nada». Lo que leí son casos sueltos (avisos de logro, aro contra palabra, Escape). No vi un barrido general.
(d) Frágil con la máquina cargada
20 · Leve · `tests/home.helpers.js`, `asentarGeometria`. Comprobado: el bucle sale a los 90 fotogramas sin decir si convergió, y la prueba mide igual. Su comentario dice que no se use con reloj virtual, y `home-sin-scroll` instala uno.
   * Cierre: devolver si convergió y asertarlo. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/tests/home.helpers.js)
21 · Leve · esperas fijas antes de asertar ausencia. Comprobado: `waitForTimeout(2500)` en `caza-v1-compra` (la hoja «se mira al segundo y medio») y `waitForTimeout(700)` en `compra-tienda`. Con carga, lo que no debía salir sale después del aserto.
   * Cierre: reloj virtual y `runFor`.
(e) CI frente a local
22 · Grave si sigue así · `android.yml`. De la lectura anterior, sin releer hoy: salta con cada push a `main` y deja un AAB firmado como borrador de versión, sin esperar al CI. Puede salir un paquete para Play de un commit en rojo.
   * Cierre: lanzarlo con `workflow_run` tras un CI verde.
23 · Medio · las pruebas sirven la raíz del repo, no `dist/`. Comprobado: el servidor es `.claude/static-server.js` sobre la carpeta de trabajo. Lo que falte en las listas de `web-dist.js` funciona en las pruebas y da 404 en pacegrass.app.
   * Cierre: cinco pruebas de humo contra `dist/` (landing sin peticiones fallidas, imágenes con `naturalWidth > 0`, abrir la app, recargar sin red).
24 · Medio · frescura de `index.html`, solo en el YAML. Comprobado: en local `npm run test:e2e` prueba el `index.html` que haya, aunque esté viejo.
   * Cierre: un paso previo que construya en una carpeta temporal y falle si difiere.
(f) Verify por un solo lado
25 · Medio · `scripts/verify.web.js`. Comprobado: el repaso de rutas excluye `index.html` (`r !== 'index.html'`), y la landing vive ahí desde el 9 de noviembre. Sus capturas y enlaces no se comprueban contra `dist/`.
   * Cierre: incluir el bloque entre las marcas `pace-landing`. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/scripts/verify.web.js)
26 · Medio · `scripts/verify.privacidad.js`. Comprobado: la analítica solo se busca en `premium/index.html`, mientras una de las frases vigiladas es «ninguna página de PACE cuenta sus visitas». La landing, `/beta` y `/gracias` no se miran. Las cuatro piezas del calendario se buscan en texto sin quitar comentarios: una línea comentada cuenta.
   * Cierre: recorrer todo HTML publicado, fallar ante orígenes externos fuera de una lista, y quitar comentarios antes de buscar. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/scripts/verify.privacidad.js)
27 · Medio · `scripts/verify.licencia.js`. Comprobado: detecta `.pem` y la marca PEM solo en las extensiones de `TEXTO`. Un `.p8` de Apple, un `.p12` o un `.jks` pasan, justo cuando entra la firma del iPhone. Su mensaje aún dice que la llave vive en `scripts/licencias/` (comentario viejo).
   * Cierre: fallar por extensión (`p8|p12|pfx|jks|keystore|mobileprovision`) salvo `pace-debug.keystore`. [Source](https://raw.githubusercontent.com/ezradesign/Pace_app/main/scripts/verify.licencia.js)
28 · Medio, supuesto · sintaxis moderna. `node --check` con Node 24 acepta sintaxis que un WebView antiguo no entiende. No sé si el build la rebaja.
   * Cierre: analizar el artefacto con un tope de versión de JavaScript.
Las diez pruebas que añadiría primero
   1. Apnea: tabla de rutinas con retención por cada entrada; la sesión no existe hasta marcar la casilla y pulsar.
   2. Almacenamiento lleno para todas las claves.
   3. Importar una copia antigua sin marcas: semana e histórico intactos.
   4. Exportar, borrar e importar una cuenta rica: estado y registro idénticos.
   5. Regla de reloj en verify (hallazgo 1) más las corridas programadas (hallazgo 3).
   6. Humo contra `dist/`.
   7. Landing: cambiar tamaño e idioma, recargar, sigue la landing y `localStorage` vacío.
   8. Home sin scroll en v1, en lunes, con cada barra, midiendo también el documento y los hijos.
   9. Husos de América y Asia de noche.
   10. Con compra vigente, ningún botón de compra en ninguna pantalla; con mensual sin portal, no se ofrece.
Preguntas para el dueño
   1. ¿Vale que `pasoV1.hasta` se pueda alargar editando una copia? Recomiendo que el saneador lo tope a siete días desde `at`, con su prueba.
   2. ¿«Sin scroll» incluye la letra grande del sistema en Android? Recomiendo fijar un tope (por ejemplo 115 %) y probarlo, o declararlo fuera.
   3. ¿Qué versión mínima de WebView y de Safari se soporta? Recomiendo escribirla y que verify la haga cumplir.
   4. ¿El AAB firmado debe esperar al CI verde? Recomiendo que sí.
   5. ¿El aviso de apnea se acepta cada vez o una sola vez por rutina? Recomiendo cada vez; la prueba 1 depende de esta respuesta.
