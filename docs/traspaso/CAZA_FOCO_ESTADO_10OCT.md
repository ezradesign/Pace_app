# Caza del 10 de octubre: el Foco y lo guardado

La caza del 7 de octubre (`CAZA_BUGS_7OCT.md`) no llegó a mirar el Foco ni el estado guardado. Esta
los recorre con el `index.html` de `main` en v0.154.0. **Solo está lo que se ha reproducido**: cada
hallazgo lleva sus pasos o la prueba de Playwright que lo enseña. Las sondas con las que se buscó
viven fuera del repo; cada arreglo deja su prueba en `tests/`.

Gravedad: **pierde datos** (algo que hiciste desaparece), **descuadra** (el temporizador o las
cuentas dicen algo que no pasó) y **molesta** (no se pierde nada, pero confunde).

«Cambia lo que se ve» quiere decir que el arreglo pone en pantalla algo distinto de lo que hay hoy;
esos esperan el sí de Ez con fotos de antes y después. Los demás se arreglan sin preguntar, con una
prueba que falla en `main` y pasa en la rama.

**Estado el 13 de octubre: los once arreglados** en `claude/caza-foco-estado-d6bd17`, cada uno con su
prueba (roja contra `main`, verde en la rama). Los cuatro que cambian lo que se ve, con la opción A
que eligió Ez mirando `archivos/caza-foco-10oct/fotos-para-ez.html`; el 13 de octubre dio el sí a
subirlos mirando la app de hoy (`archivos/caza-foco-10oct/fotos-app-13oct.html`). Al arreglar estado-1 apareció que
foco-6 empeoraba (con el estado compartido, el bloque contaba dos veces también en «Hoy»), así que
van juntos. Con dos pestañas, la pausa sale en la que miras (Ez, 13 oct., ver foco-6).

## Lo guardado

### ~~estado-1 · Con dos pestañas abiertas, la que lleva más rato abierta borra lo que hiciste en la otra~~
- **Arreglado:** cada pestaña adopta lo que guarda la otra (`app/state-core.pestanas.js`), leído con el saneado del arranque y sin volver a escribirlo (`tests/pestanas-estado.spec.js`).
- **Gravedad:** pierde datos. **Cambia lo que se ve:** no.
- **Qué pasa:** cada pestaña (o la app instalada y una pestaña del navegador) guarda su propia copia
  del estado y, al tocar cualquier cosa, escribe esa copia entera encima. La que se abrió antes no
  sabe nada de lo que hiciste en la otra, así que lo borra.
- **Pasos:** abre PACE en dos pestañas. En la segunda, suma tres vasos de agua (o termina un bloque
  de Foco). Vuelve a la primera y suma un vaso. Recarga: hay un vaso, no cuatro, y el bloque de Foco
  ha desaparecido de «Hoy» y de las estadísticas.
- **Medido:** tres vasos en B y uno en A dejan `water.today = 1`; un bloque en B (`cycle 1`,
  `25 min`) y un vaso en A dejan `cycle 0`, `0 min`.

### ~~estado-2 · «Borrar todos mis datos» con otra pestaña abierta: la otra los resucita~~
- **Arreglado** con estado-1 (`tests/pestanas-estado.spec.js`).
- **Gravedad:** pierde datos al revés: lo que pediste borrar vuelve, y la privacidad promete que
  desaparece de tu dispositivo. **Cambia lo que se ve:** no.
- **Pasos:** dos pestañas con datos (500 min de foco, 4 vasos). En una, Ajustes › Tus datos ›
  Borrar todo. En la otra, suma un vaso: vuelven los 500 min y los vasos (5).

### ~~estado-3 · Importar una copia con otra pestaña abierta: la otra la pisa~~
- **Arreglado** con estado-1 (`tests/pestanas-estado.spec.js`).
- **Gravedad:** pierde datos. **Cambia lo que se ve:** no.
- **Pasos:** dos pestañas. En una, importa una copia con 4321 min de foco; la página se recarga con
  ellos. En la otra, suma un vaso: el estado vuelve a 0 min.
- Los tres primeros tienen la misma causa y un solo arreglo.

### ~~estado-4 · La copia de rescate que descarga PACE no se puede importar~~
- **Arreglado:** si la cadena se lee, entra como una copia normal (`tests/estado-saneado.spec.js`).
- **Gravedad:** molesta (la copia existe, pero no hay forma de devolverla a la app). **Cambia lo que
  se ve:** no; usa la pregunta de «¿Sobreescribir tus datos…?» que ya tiene importar.
- **Qué pasa:** cuando un arranque no puede leer el estado, PACE guarda la cadena tal cual y ofrece
  «Descargar la copia de rescate» en Tus datos. Ese archivo, al importarlo, da «Archivo no
  reconocido.», porque importar solo entiende la copia normal.

### ~~estado-5 · Si el navegador no deja guardar (almacenamiento lleno o bloqueado), nadie lo dice~~
- **Arreglado con la opción A de Ez:** la primera vez sale abajo una barra con «Exportar una copia» de lo que hay en memoria y «Entendido» (`AvisoNoGuarda`, `tests/estado-no-guarda.spec.js`).
- **Gravedad:** pierde datos. **Cambia lo que se ve:** sí (haría falta un aviso).
- **Pasos:** con el almacenamiento lleno, cada escritura falla en silencio: sumas dos vasos, los ves,
  recargas y hay cero. Con el almacenamiento bloqueado (algunos modos privados, cookies bloqueadas
  para el sitio) la app arranca bien y no guarda nada, sin decirlo.
- **Probabilidad:** baja. El estado ocupa pocos KB y el límite es de 5 MB; lo bloqueado depende de
  la configuración del navegador de cada persona.

## El Foco

### ~~foco-1 · Tocar otros minutos con el bloque en marcha lo tira sin preguntar~~
- **Arreglado con la opción A de Ez:** pregunta antes, como la barra de arriba (`tests/caza-foco.spec.js`). La ventana tapa toda la pantalla: en la maqueta se pintaba dentro del aro y su fondo dejaba las actividades por encima.
- **Gravedad:** descuadra (se pierde el bloque a medias). **Cambia lo que se ve:** sí.
- **Pasos:** Empezar foco (25). A los 20 minutos toca «35» arriba del aro, por ejemplo para alargar:
  el aro vuelve a 35:00 parado con «Empezar foco» y los 20 minutos no cuentan. Lo mismo con el
  bloque en pausa. Cambiar de modo en la barra de arriba sí pregunta antes desde el 8 de octubre.

### ~~foco-2 · Recargar con el bloque en pausa lo pierde~~
- **Arreglado con la opción A de Ez:** el bloque en pausa vuelve en pausa el mismo día (`tests/caza-foco.spec.js`). «A tu ritmo» tampoco cambia los minutos bajo un bloque en pausa.
- **Gravedad:** descuadra. **Cambia lo que se ve:** sí.
- **Pasos:** Empezar foco, a los 12 minutos Pausar (el aro dice 13:00) y recarga: vuelve a 25:00
  con «Empezar foco». Pasa igual al pulsar «Hay una versión nueva», y en Android si el sistema cierra
  PACE mientras estás en otra app. Un bloque en marcha sí sobrevive a la recarga.
- **Ojo:** es una decisión de s102 («pausa, reset y fin limpian»), anterior a Android.

### ~~foco-3 · Un bloque que termina con PACE cerrado no cuenta, y con la pestaña abierta sí~~
- **Arreglado con la opción A de Ez:** si terminó hoy, cuenta al volver y abre la pausa (`tests/caza-foco.spec.js`).
- **Gravedad:** descuadra. **Cambia lo que se ve:** sí.
- **Pasos:** Empezar foco y, a los 5 minutos, cierra la pestaña (o deja que Android cierre la app).
  Vuelve a los 30 minutos: el aro está a 25:00 y el bloque no cuenta, aunque en Android el aviso del
  sistema dijo «Foco completado». Si la pestaña sigue abierta de fondo esos 30 minutos, el bloque sí
  cuenta al volver (control medido: `cycle 1`, `25 min`).
- **Ojo:** también es de s102 («no se abonan minutos no presenciados»), pero hoy la misma ausencia
  cuenta o no según si el navegador mantuvo viva la pestaña.

### ~~foco-4 · Android: si el sistema cierra PACE con un Foco en marcha, el aviso se queda programado~~
- **Arreglado:** al arrancar se da el aviso por programado y lo primero que se recoloca con la app delante lo cancela (`tests/android-nativo.spec.js`).
- **Gravedad:** molesta. **Cambia lo que se ve:** no.
- **Qué pasa:** al irte a otra app, Android programa «Foco completado» para el final del bloque. Si
  Android cierra PACE y vuelves antes de que acabe, el bloque sigue en marcha (bien), pero la app
  nueva no sabe que había un aviso pendiente: si pausas o reinicias, el aviso llega igual a la hora
  vieja, y si lo dejas correr con la app delante suena dos veces.
- **Prueba:** con el Android simulado de `tests/android-nativo.spec.js`, empezar, irse al fondo,
  recargar y pausar: el aviso sigue programado y no se llama a `cancel`.

### ~~foco-5 · Dos pestañas: pausar en una no pausa la otra, y el bloque cuenta dos veces~~
- **Arreglado:** empezar, seguir, pausar y reiniciar viajan entre pestañas (`app/focus/FocusTimer.pestanas.jsx`, `tests/pestanas-foco.spec.js`).
- **Gravedad:** descuadra. **Cambia lo que se ve:** no (cada pestaña pasa a enseñar lo mismo).
- **Pasos:** empieza un bloque en una pestaña y abre otra: la segunda lo enseña en marcha (bien).
  Pausa en la primera: la segunda sigue, termina el bloque y lo cuenta mientras la primera dice
  «Continuar». Si luego continúas en la primera, al terminar cuenta otra vez.

### ~~foco-6 · Dos pestañas con el mismo bloque: el registro apunta dos sesiones de Foco~~
- **Arreglado:** la pestaña que llega primera coge el candado del bloque (Web Locks) y es la única que cuenta y suena (`tests/pestanas-foco.spec.js`). La pausa la abre la pestaña que miras, o la primera que vuelva al frente si no miras ninguna (Ez, 13 oct.: «En la que estás mirando»; `tests/pestanas-pausa.spec.js`).
- **Gravedad:** descuadra (los eventos de `pace.events.v1`, que leerá el motor de la semana).
  **Cambia lo que se ve:** no.
- **Pasos:** un bloque en marcha con dos pestañas abiertas y se deja terminar: `cycle` queda en 1,
  pero el registro guarda dos `session.completed` de Foco, y suenan dos campanas.

## Lo que se probó y no falla

- La medianoche con un bloque en marcha (`tests/cambio-de-dia.spec.js` ya lo vigila).
- El cambio de hora del 25 de octubre con un bloque en marcha: de 02:50 a 02:15 de la hora nueva, el
  aro marca bien y el bloque cuenta 25 minutos.
- La pestaña de fondo: el aro no se retrasa y al volver termina y cuenta.
- Recargar con un bloque en marcha, y recargar en el segundo en que termina: el bloque y su evento
  quedan guardados.
- El Foco personalizado de menos de 5 minutos sube a 5 (`tests/foco-minimo.spec.js`).
- Un estado de una versión vieja (la semana indexada desde el domingo, sin las marcas de migración):
  se reordena y no se pierde nada.
- Importar un JSON roto («JSON inválido.»), un archivo que no es de PACE («Archivo no reconocido.») y
  una copia de una versión anterior con una clave de una versión futura: entra entera y la clave
  desconocida se conserva.
- Con el almacenamiento bloqueado la app arranca sin errores (pero ver estado-5).
- En Android el origen (`https://localhost`) y la firma del APK de prueba no cambian entre versiones,
  así que un APK encima del anterior conserva los datos. Esto se ha leído en la configuración, no se
  ha probado en un móvil.

## Lo que queda para un móvil de verdad

Las pruebas simulan Android; esto solo se ve en un teléfono, y conviene mirarlo en la prueba interna:

- Empezar un Foco, irse a otra app hasta que Android cierre PACE y volver: si el bloque seguía en
  marcha, sigue; si estaba en pausa, vuelve en pausa (foco-2); si ya terminó, cuenta y abre la
  pausa (foco-3); y si se pausa al volver, no llega el aviso de «Foco completado» (foco-4).
- Instalar un APK encima del anterior y comprobar que los datos siguen ahí.

Se dejó a propósito: en Safari anterior a 15.4, que no tiene Web Locks, un bloque abierto en dos
pestañas puede contar dos veces, como antes de este arreglo.
