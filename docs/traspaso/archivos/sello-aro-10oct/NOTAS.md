# El sello del aro (10 oct. 2026)

Ez vio en su móvil (360×718, v0.152.0) el aviso de un sello nuevo dentro del aro con tres
fallos: el texto cortado («Nuevo sello · Prim…»), el dibujo como un «}» o un «?» diminuto y, con
varios sellos a la vez, unos encima de otros y del contador. Reproducido en la app de v0.154.0 y
arreglado en `app/ui/Toast.jsx`. Página para elegir: `sello-aro.html`, publicada en
https://claude.ai/artifact/PLTT54EW54yjQfaKMiP9aQ (fotos con `fotos.js antes|despues|sin-dibujo`).

## Lo que decidió Ez

- **Opción B, solo el texto**: el sello del aro va sin dibujo, «Nuevo sello · Primer paso» en
  dorado. La A lo ponía en un círculo dorado, como en la colección. El dibujo sigue en la colección
  y en la caja de siempre (cuando no hay aro a la vista).

## Las causas

- El ancho era el de la caja interior del aro, estrecha. Ahora es la cuerda del círculo a esa
  altura, con margen; si aun así no cabe, la letra encoge hasta un 82 % y luego «Nuevo sello ·»
  pasa al lector de pantalla. El título se lee siempre entero.
- El dibujo iba a 22 px: el brote de «Primer paso» parecía un «}» y los secretos sin dibujo
  (`secret.zen` y otros cuatro) se pintan con su carácter, un «?».
- Los avisos que llegaban juntos se apilaban hacia arriba. Ahora esperan en fila en ToastHost y
  sale uno cuando se va el anterior (fila de s145), con su sonido.

Lo vigila `tests/sello-aro.spec.js` (360×640 y 360×718, castellano e inglés, el título más largo
y tres sellos a la vez), rojo contra origin/main en los cinco casos. En el APK no se ha probado:
la home es la misma página, sin service worker.
