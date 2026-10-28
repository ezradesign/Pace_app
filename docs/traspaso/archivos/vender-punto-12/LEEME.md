# Lo que falta para vender (punto 12 del ROADMAP), 28 oct.

Rama `claude/clever-gagarin-6701aa`, sobre `main` en 4e78f62 (v0.184.0). Las cuatro piezas que Ez decidió el 15 oct.
(`DECISIONES_PRODUCTO.md`, «Cómo se vende PACE completo» y «Cómo se cobra PACE completo») y que la auditoría del 28 oct.
encontró sin montar. Sin versión nueva: la pone la coordinadora al juntar.

Maqueta para Ez: https://claude.ai/artifact/9MnNL8b5BYWcX9Fsa7vnAa (`docs/proposals/vender-punto-12-28oct.html`; en la otra
cuenta, https://claude.ai/artifact/VDdAWeb8msGvckeGXxFjWV). **Ez eligió 1A 2A 3A 4A** y está todo montado.
**Fotos del resultado montado, para el «júntalo»**: https://claude.ai/artifact/Mk11GDb9JBDGXyTrynbaYY
(`docs/proposals/vender-punto-12-montado-28oct.html`, hecha con `fotos-montado.js` y `pagina-montado.js` de esta carpeta:
el `index.html` de la rama tal cual, fingiendo solo el día de v1 o los enlaces de pago). Los guiones de la maqueta
(`propuesta.js`, `fotos.js`, `pagina.js`) se quedan como estaban; el borrador `recuperar.html` ya es `recuperar/index.html`.

## Hecho (no se ve)

1. **La valoración de Google Play** (reseñas, punto 6). `android/.../PaceValoracion.java` abre la ventana de Google
   (In-App Review, `com.google.android.play:review:2.0.2`, que no pide permisos) y está registrado en `MainActivity`.
   `app/ui/valoracion.js` cuenta las pausas enteras (las mismas que dan logros: las tres `complete*Session` llaman a
   `paceValoracionPausa(entera)`), solo donde hay ventana (`PACE_VALORACION_PLATAFORMAS`, `['android', 'ios']`); con la
   quinta espera a que no haya nada delante (la pantalla final, otro diálogo, un sello, PACE en el fondo) y apunta
   `valoracion.pedida` ANTES de llamar, porque Google no dice si salió. Cuenta desde esta versión: quien ya hizo
   cincuenta pausas la verá tras la quinta de ahora. `verify` (verify.android.js) vigila la pieza, la librería, el
   orden de `pedida` y que cada complemento propio de la carpeta esté registrado en `MainActivity`.
   Prueba: `tests/valoracion-play.spec.js` (cae contra v0.184.0).
   **El Java no lo ha compilado nadie**: aquí no hay JDK ni SDK de Android, y lanzar el workflow Android en esta rama
   dejaría un AAB firmado llamado `PACE-0.184.0.aab`, igual que el que Ez va a subir a Play. Lo compila el workflow
   Android al juntar en `main`; si cae, es esta pieza.
2. **El paso a v1 sin quitar nada** (reseñas, punto 1), por dentro. `app/state-paso-v1.js`: el primer arranque con
   `PREMIUM_ABIERTO_HASTA_V1` en false apunta `pasoV1` una sola vez. Quien ya usaba PACE (la bienvenida acabada o algo
   hecho) recibe siete días con todo abierto y conserva las de pago que hizo: las del registro de eventos (terminadas
   o no), las de `routineCounts` (`rutina.<id>`) y las que contestó en «¿Te ayudó?». Las propias del constructor no
   entran (quedan guardadas y cerradas, como se decidió). La lista espera a los catálogos, que cargan después: sin
   ellos se fijaría vacía. Quien instala ya en v1 recibe `{ previo: false }`. En el guard, `paceAbiertoAhora()` es lo
   que abría el interruptor (hasta v1 para todos; desde v1, la semana) y `canAccessRoutine` abre además las
   conservadas (`pacePasoV1Conserva`); Estadísticas pregunta a `paceAbiertoAhora` en vez de al interruptor.
   El interruptor sigue en true. Prueba: `tests/paso-v1.spec.js`, que lo fuerza a false antes de que cargue la app.
3. **`/recuperar`, la función** (cobro, punto 2). `functions/api/recuperar.js` y `stripeBuscarCompra` en
   `cobro/stripe.js`: con el correo y el número del recibo busca la compra en Stripe en ese momento, con una llave
   restringida de solo lectura (`STRIPE_LECTURA`, paso 5 nuevo de `docs/launch/cobro-web.md`); la de por vida se
   vuelve a firmar con k2 y su pedido, y la mensual da el último código de su suscripción (410 si terminó). No guarda
   nada; diez intentos por hora por conexión, con la huella de la IP en la caché, como «Avísame». Apagada sin las tres
   piezas. Prueba: `tests/cobro-recuperar.spec.js` (en Node, con un Stripe falso).
   **Sin probar contra Stripe**: no se sabe qué número trae el recibo de Stripe en su modo «vende por ti». La función
   acepta el del recibo del cobro y el de la factura (la primera de la mensual o una renovación); se mira con el modo
   de pruebas de Stripe, como dice la guía.

## Hecho (lo que se ve, 1A 2A 3A 4A de Ez)

- **1A · la hoja del día de v1** (`PremiumPasoV1`, en `app/ui/PremiumInvitacion.jsx`). La abre la propia invitación,
  como el aviso del fin de la prueba: al abrir PACE, cada minuto y en cuanto acaba el cálculo del paso a v1 (que ahora
  guarda su promesa en `_pacePasoV1.promesa` para quien llega mientras se hace). Sale si `pacePasoV1PorAvisar()` y no
  hay otro diálogo delante; apunta `pacePasoV1Avisado()` al abrirse. Los siete días con la fecha, las que se quedan con
  su nombre y su módulo (por el catálogo, no por el id: los de Mueve son `extra.*`), «Lo gratis sigue gratis» y solo
  «Entendido». **Detalle que no salía en la maqueta**: con más de seis, cinco y «Y n más, también tuyas», para que
  quepa a 360 px sin scroll. La fila de Ajustes (`PremiumSection.jsx`) dice «Prueba hasta el …» con
  `pacePruebaV1Hasta()` (nueva en `state-paso-v1.js`); en la web, tocarla abre el campo del código.
- **2A · `/recuperar`**: `recuperar/index.html` (el borrador, con un enlace a `/privacy#recuperar`), en `WEB_CARPETAS`
  y en los `NECESARIOS` de `verify.web.js` (que ahora también pide `/gracias`). Enlazan a `/recuperar/`: gracias («Si lo
  pierdes», con el correo para escribir si no sale), la pregunta de /premium «¿Y si cambio de ordenador…?» y PACE
  («¿Lo has perdido? Recupéralo con tu correo» debajo del campo del código, en otra pestaña; en el archivo suelto va a
  pacegrass.app). En Android y en el iPhone no sale porque allí no hay código. `privacy.html` dice, en los dos idiomas
  (`#recuperar` y `#recuperar-en`), que el correo y el recibo solo van a Stripe y no se guardan, y el límite de diez
  intentos por hora con un código hecho con la IP.
- **3A · la invitación con los botones de compra**: con `paceTiendaAbierta()`, la hoja acaba como la bienvenida, con los
  mismos textos (`premium.onb.precios`, `.probar`, `.aviso` y `.vida`) y `paceTiendaPlanes`/`paceComprar`. La compra de
  la web sigue en Stripe y la hoja se cierra; la que da un código aquí mismo acaba como un canje; si no se puede abrir,
  lo dice (`premium.compra.error`) y la hoja sigue. Sin tienda, como hoy («Llega con la versión 1»).
- **4A · la valoración en el iPhone**: `ios/App/App/PaceValoracion.swift` (`AppStore.requestReview(in:)`, el sucesor de
  SKStoreReviewController desde iOS 16; la app pide 16.4), en el proyecto de Xcode y registrado por `PacePuente`, el
  `CAPBridgeViewController` propio que ahora lleva `PaceViewController`. `verify.ios.js` vigila la pieza, el registro,
  `'ios'` en la lista y que cada `.swift` de la carpeta esté en el proyecto. **No lo ha compilado nadie**: el workflow
  iOS corre en `main` y en `claude/ios-*`, no en esta rama, y no se ha lanzado a mano (eso subiría a TestFlight).
  Compila al juntar; si cae el trabajo `simulador`, es esta pieza.
- Textos nuevos: doce por idioma (`premium.pasov1.*` x9, `premium.settings.prueba`, `premium.code.lost`,
  `premium.compra.error`); el censo de `verify.integridad.js` pasa de 1051 a 1063.

**Pruebas** (en el 8805): nuevas `tests/premium-compra.spec.js` (3A y «¿Lo has perdido?») y
`tests/recuperar-pagina.spec.js` (la página en sus estados, el inglés y los enlaces); ampliadas `paso-v1.spec.js` (la
hoja, su fila de Ajustes, con sesión delante, en inglés con «And n more», a 360 px) y `valoracion-play.spec.js` (el
iPhone). Las de la invitación, la bienvenida, /premium, /gracias, Ajustes y Estadísticas: 137 en verde. `npm run verify`
en verde. La suite entera con `--workers=1`: ver el commit de cierre.

## Para la coordinadora, al juntar

- **Choques posibles**: `index.html` (se regenera), el censo de `scripts/verify.integridad.js` (si la otra rama también
  añade textos, se suman los dos), `app/main.jsx` no se ha tocado y `app/ui/ios.js` tampoco (la sesión «Los avisos del
  iPhone» sí lo toca: aquí la pieza va solo en Swift y en `valoracion.js`).
- **CHANGELOG** (propuesta): «Lo que faltaba para vender (Ez, 1A 2A 3A 4A del 28 oct.): el día de v1, quien ya usaba
  PACE recibe una hoja con su semana de prueba y las rutinas de pago que se le quedan, y Ajustes dice hasta cuándo dura
  (todo listo detrás de `PREMIUM_ABIERTO_HASTA_V1`); pacegrass.app/recuperar devuelve el código de una compra con el
  correo y el número del recibo, enlazada desde gracias, /premium y PACE; la invitación lleva los botones de compra en
  cuanto la tienda esté lista; y la ventana para valorar PACE sale una vez tras la quinta pausa entera, en Google Play y
  en la App Store.»
- **STATE**, en «Lo siguiente»: el punto 3 (el código que falta para vender) pasa a hecho; queda Play Billing y la
  compra de Apple. En «Espera a Ez»: la llave restringida `STRIPE_LECTURA` al crear la cuenta de Stripe (paso 5 de
  `docs/launch/cobro-web.md`) y mirar en el modo de pruebas qué número trae el recibo.
- **ROADMAP**, punto 12: hecho; el punto 17 (v1) ya solo apaga el interruptor y quita «Da de pastar a la vaca».
- **DECISIONES_PRODUCTO**, en «Cómo se vende PACE completo»: Ez, 28 oct.: 1A (la hoja del día de v1, una vez, sin vender
  nada), 2A (la página y «¿Lo has perdido?» en PACE), 3A (la invitación como la bienvenida) y 4A (la valoración también
  en el iPhone, que cambia la decisión del 15 oct. de «solo Android»).
- **DECISIONES_TECNICAS_VIGENTES**, filas propuestas: (1) en el iPhone, un complemento propio se registra en
  `PacePuente.capacitorDidLoad` y su `.swift` va en el proyecto de Xcode, o la web recibe null sin que nada falle
  (lo vigila `verify.ios.js`); (2) la hoja del día de v1 la abre `PremiumInvitacion`, no un componente aparte: dos
  hojas que se abren solas en el mismo sitio no se pisan.
- Los workflows Android e iOS compilan `PaceValoracion.java` y `PaceValoracion.swift` por primera vez en `main`.

**Antes de archivar la sesión**: `node_modules` de este worktree es un enlace (junction) al del repo principal. Se
quita con `cmd /c rmdir node_modules` desde la raíz del worktree, nunca con un borrado recursivo.
