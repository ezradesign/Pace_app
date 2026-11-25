# PACE · el día de v1, en una hoja

Ez, L9A del 25 nov. 2026 («PACE, listo para las tiendas»). El orden del día en que PACE sale a la venta, con
lo ya decidido enlazado. Lo que manda sobre el orden de trabajo hasta llegar aquí sigue siendo `ROADMAP.md`;
esto empieza cuando Play da el acceso a producción y Apple aprueba la versión.

## Antes (la semana anterior)

- [ ] Las altas hechas: perfil de pagos de Play, acuerdo de apps de pago de Apple, Stripe, Resend y los datos
      del aviso legal (`STATE.md`, «Espera a Ez»).
- [ ] La versión de v1 en la prueba interna de Play y en TestFlight, probada por Ez: comprar, restaurar y
      cancelar en las tres tiendas (`ROADMAP.md`, tramo 4).
- [ ] La ficha de Apple pegada (`docs/launch/app-store/ficha.md`) y el párrafo de PACE completo en la de Play
      (`docs/launch/google-play/ficha.md`, «Para v1»), con las capturas nuevas.
- [ ] «Contenido de la app» de Play rehecho para v1: acceso a la app («Sí», con un código promocional para
      Google) y compras digitales en la clasificación (`contenido-de-la-app.md`).
- [ ] Las etiquetas de accesibilidad y de privacidad de Apple rellenas (`docs/launch/accesibilidad.md`).
- [ ] Registro previo en Play: mirar si Play Console lo ofrece a la cuenta antes de producción
      (`DECISIONES_PRODUCTO.md`, «Avísame»). Si lo ofrece, se abre en cuanto haya acceso a producción.

## El día

El orden decidido es **primero la web y luego Android** (`DECISIONES_PRODUCTO.md`); el iPhone, cuando Apple
apruebe. Si las tres están listas a la vez, salen el mismo día y el aviso es uno.

1. **Código**: apagar `PREMIUM_ABIERTO_HASTA_V1` y quitar «Da de pastar a la vaca» de la web, en una versión
   1.0.0 (`npm run bump -- 1.0.0`) con el CI en verde y el «júntalo» de Ez.
2. **Web**: comprobar en pacegrass.app que /premium vende y que una compra de prueba llega a /gracias.
3. **Play**: promocionar la versión de la prueba cerrada a **Producción**, con todos los países
   (`ficha.md`, «Países»), y las notas de la versión en es y en (`SUBIDAS.md`).
4. **App Store**: «Publicar esta versión» (o dejarla en publicación manual y pulsarla ese día).
5. **Los testers**: un mensaje para darles las gracias, recordarles su PACE completo de por vida y pedirles
   que, si les gusta, dejen su reseña en Play (en la prueba cerrada no podían).
6. **«Avísame»**: el correo a la lista, con los enlaces a la web, a Play y a la App Store.
7. **Foros**, en inglés y con algo útil dentro: Product Hunt, Hacker News y Reddit, leyendo antes las normas
   de cada uno. `docs/launch/reddit-drafts.md` está caducado y se rehace antes.

## Las dos semanas siguientes

- Contestar todas las reseñas, en las dos tiendas (Ez, 15 oct. 2026).
- Cada lunes, las tres cifras (`docs/launch/cifras.md`).
- Los correos de «Cuéntanoslo» y de «Escríbenos»: un fallo que se repite, versión de arreglo (`X.Y.Z+1`) sin
  esperar.
- Si una cifra sale baja, lo que dice `cifras.md` antes de tocar nada más.

## Lo que queda para después de v1 (Ez, L10A, L11A y L12A)

- **El widget** de la pantalla de inicio («próxima pausa a las 11:30 · 3 vasos de 8»), primero en Android, con
  maqueta antes.
- **El Foco en la pantalla de bloqueo del iPhone** (Live Activity, con la isla). Antes, solo si Apple rechaza
  PACE por la regla 4.2 (`docs/launch/app-store/guia.html`, punto 9).
- **Más idiomas**, en la app y en la ficha a la vez, empezando por el país que más instale según `cifras.md`.
