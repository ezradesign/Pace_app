# Auditoría externa del 16 nov. 2026 (sobre la 0.206.0), comprobada punto a punto

Ez la trajo «por si aporta algo». El texto entero, tal cual, está en la conversación de la coordinadora; aquí va lo
comprobado por la coordinadora el 16 nov. en el código de `main` y en pacegrass.app, y qué se hace con cada punto.

| Punto | Comprobado | Qué se hace |
|---|---|---|
| Tiendas vacías, sin complemento de compra, todo abierto hasta v1 | Cierto y a propósito: esperan las altas de Ez (paso «Cobrar» de la lista corta) | Nada nuevo |
| Lo legal sin publicar y `/desistir` cerrado | Cierto: borradores sin publicar hasta los datos de Ez y la revisión profesional; `/desistir`, hasta Resend | Nada nuevo. `/legal/condiciones/` devuelve la app por el punto de las rutas, abajo |
| Los 14 días no han empezado | Cierto: la cerrada, en revisión; 5 o 6 testers de 12 | De Ez |
| Cuatro versiones sin probar en un móvil (0.203.0-0.206.0) | Cierto | Ez prueba la 0.205.0 en su Android y su iPhone antes del mensaje de WhatsApp (ya lo decía la lista) |
| «Avísame» apagado en /premium | Cierto | De Ez: conectar el KV `AVISAME` y el nombre que firma su privacidad (`docs/launch/avisame.md`) |
| `/beta` no deja apuntarse | **Falso para quien abre la página**: el grupo y la prueba de Play están encendidos en `data-enlaces`. Lo que lee un lector sin JavaScript es el HTML de partida, que dice «El grupo abre muy pronto» hasta que el script lo cambia. El del iPhone sí está pendiente | Que el HTML que se publica salga ya con los enlaces encendidos (rama de lo pequeño). El de TestFlight, cuando Ez active el enlace público |
| Las rutas que no existen devuelven la portada | **Cierto**: `/esta-ruta-no-existe-xyz`, `/legal/condiciones/` y `/robots.txt` devuelven la app entera (2,2 MB) con un 200 | Una página «no encontrada» de verdad con su 404 (rama de lo pequeño, que ya trae `robots.txt` y `sitemap.xml`) |
| `STATE.md` se contradice con la lista | Cierto: seguía diciendo que la 0.191.1 no se sube | Arreglado el 16 nov. |
| Comentario viejo en `state-compra.js` | Cierto: «EN EL IPHONE NO HAY TIENDA hasta después de v1» | Arreglado el 16 nov. |
| Los códigos de regalo de Apple | **Cierto**: Apple retiró los códigos promocionales de compras dentro de la app el 26 mar. 2026; los sustituyen los códigos de oferta, que ya valen para compras únicas como el de por vida | La promesa de `/beta` («un código de regalo de Google Play o de Apple») sigue valiendo con un código de oferta; `testers.md` lo dice |
