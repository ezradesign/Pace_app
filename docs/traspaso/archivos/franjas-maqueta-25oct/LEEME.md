# N2 y N9 (sesión de las franjas, rama `claude/franjas-maqueta-n5-n8-7312c7`, 25 oct.)

## N2 · las franjas del móvil con la paleta que se ve

- Commit `7c7d357`. Sin versión (la pone la coordinadora). No toca STATE.md ni CHANGELOG.md.
- Android: complemento propio `PaceBarras` (android/app/src/main/java/com/ezradesign/pace/), registrado en
  `MainActivity`. `app/ui/android.js` le dice la paleta que se ve con `subscribe`. Repinta tras girar el móvil o
  cambiar su modo (SystemBars de Capacitor lo pisa). Guarda la paleta elegida a mano para el arranque siguiente.
- iPhone: `PaceViewController` observa `WKWebView.themeColor`; `PACE.html` lleva dos metas theme-color (la oscura
  con `media`, delante) y `applyTheme` las pone todas.
- Compilado en GitHub desde la rama: Android `apk` en verde (run 40179414958, por workflow_dispatch: dejó también un
  AAB firmado como artefacto de esa ejecución, NO en el borrador de release) e iOS `simulador` en verde (run
  40179414853, por una rama auxiliar `claude/ios-franjas-7312c7` ya borrada; TestFlight no corrió).
- Pruebas: `tests/barras-sistema.spec.js` (4) y `caza-oscuro` oscuro-3 adaptada a dos metas. verify con mutantes.
- El arranque (la vaca) sigue el modo del móvil: lo pinta el sistema antes de que la app lea su paleta.

### Cómo lo mira Ez en su Android (cuando la coordinadora lo junte y llegue el APK o Play)
1. Móvil en modo claro. En PACE, Ajustes → paleta «Oscuro». Las dos franjas (arriba la hora y la batería, abajo
   los botones o la rayita) tienen que verse oscuras, con los iconos claros.
2. Girar el móvil (o bajar la cortina y volver): siguen oscuras.
3. Paleta «Crema» con el móvil en modo oscuro: franjas crema con iconos oscuros.
4. «Auto»: cambiar el modo del móvil con PACE abierto y sin Foco en marcha → franjas y app cambian juntas. Con un
   Foco en marcha la app espera a que acabe el bloque, y las franjas esperan con ella.
5. Cerrar PACE del todo con «Oscuro» y el móvil en claro y volver a abrir: la vaca del arranque sale crema (es del
   sistema) y en cuanto sale la app, las franjas ya son oscuras.

## N9 · «la barra lateral cuesta acoplarla de nuevo mientras se hace un pomodoro»

No sale. Probado con un Foco en marcha a 1280×879, 1536×710 (la ventana de Ez), 412×915 y 360×730, en claro y
oscuro, con ratón y con toque: el asa (≡, arriba a la izquierda) está encima de todo, es el mismo nodo de un
segundo a otro (no se vuelve a montar con el reloj), un toque largo que cruza el cambio de segundo también abre, y
la barra no se cierra sola en 6 s.

Lo único distinto con el Foco en marcha es el rendimiento: con la CPU frenada ×6 (como un móvil medio), abrir la
barra tarda 638 ms en verse en el móvil frente a 287 ms sin Foco, con un fotograma de 717 ms (en escritorio, 350 frente
a 243 ms, con uno de 600 ms). Al abrirla, la home se recoloca y el sol del Foco es caro de repintar. Si Ez lo
notó en el móvil, «cuesta» puede ser ese tirón.

Qué pedirle a Ez: un vídeo corto de la pantalla (Android lo graba desde los ajustes rápidos) con un Foco en marcha,
tocando las tres rayas, y una frase: en qué aparato fue (el PC o el móvil) y qué pasa: no responde, tarda, se
cierra sola o no la encuentra.

## La maqueta N5-N8, publicada: https://claude.ai/artifact/MLCNMXzaDjwLiZ2K1Rmero

Espera la línea de Ez (recomendado 1A 2A 3A 4A). N7 medido: ninguna opción pide scroll a 360×640, 360×730 ni
1280×879, en es y en, también con la letra 0,3 px más ancha; la B (en la misma línea) se sale del aro a 360×640.
La página se rehace con pagina.js (lee las fotos de fm/, que deja maqueta.spec.js).

Guiones de fotos (Playwright): `maqueta.spec.js` con `probe.config.js` (rutas absolutas a la carpeta temporal de la
sesión: cámbialas). Correr con `PACE_E2E_PORT=8806 npx playwright test --config probe.config.js maqueta.spec`.
N5: el runner ya avanza solo (comprobado con el reloj acelerado: «Flexiones de escritorio» y «Caderas de pie» llegan
al final sin tocar nada); la propuesta es un interruptor «Auto» encendido de fábrica que lo hace visible, con un aro
en «›» que se llena hasta que pasa solo, y «A mano» para quien quiera su ritmo. N6: color del número por oklab de
--breathe a --focus. N7: «Hasta las» bajo «Bloque 1 de X». N8: las siete cápsulas de la semana con el degradado.
