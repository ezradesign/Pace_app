# La lista «Avísame» y las visitas de /premium

Lo que tiene que hacer Ez en Cloudflare para encender lo que ya está montado. Decidido el 16 oct. 2026
sobre https://claude.ai/artifact/AvME9EqcMHXhywx43vEdKG: los correos se guardan en su Cloudflare, la
página `/premium` sale ya y la lista se enciende cuando Ez la conecte.

## Antes de encender la lista

En `privacy.html`, en «La página de PACE completo y la lista «Avísame»», tiene que constar quién guarda
los correos (el responsable, con su nombre y un contacto). Ez dice con qué nombre, una sesión lo pone
(hay un comentario `RESPONSABLE` en el sitio) y sale con una versión. Hasta entonces, no se conecta el
almacén.

## Encender la lista (unos 5 minutos)

1. Cloudflare → **Storage & databases → KV → Create**. Nombre: `pace-avisame`.
2. **Workers & Pages →** el proyecto de la web **→ Settings → Bindings → Add → KV namespace**.
   Nombre de la variable: `AVISAME` (en mayúsculas, así). Namespace: `pace-avisame`. Guardar.
3. Volver a desplegar la última versión (Deployments → la última → Retry deployment), para que la
   función vea el almacén.
4. Abrir https://pacegrass.app/premium: donde decía «La lista abre muy pronto» sale el campo.

La función es `functions/api/avisame.js`. Sin el almacén contesta 503 y la página no enseña el campo.

## Ver la lista

**KV → `pace-avisame` → KV Pairs**: cada clave es un correo y su valor, el día y el idioma (`es` o `en`).
Quien pida salir: se borra su clave desde ahí.

## El día de cada aviso

- El de la web, cuando se pueda comprar; el de Android, cuando PACE esté en Google Play. Cada uno en
  el idioma que guardó cada persona.
- Desde Gmail, en copia oculta (Gmail deja hasta 500 al día), o subiendo la lista a Brevo ese día.
- **Después del aviso de Android se borra el almacén entero** (`pace-avisame` → Delete): es lo que
  promete la privacidad.

## Las visitas de /premium, sin cookies

1. Cloudflare → **Analytics & Logs → Web Analytics → Add a site**, con `pacegrass.app`, eligiendo
   el fragmento para pegarlo a mano (no la opción automática).
2. Pasar a una sesión el `token` del fragmento: lo pone en `premium/index.html`, en la línea marcada
   `WEB ANALYTICS`, y en ningún otro sitio.

**No encender «Web Analytics» en los ajustes del proyecto de Pages.** Esa opción mete el script en
todas las páginas, también en la app, y rompe la promesa de «nunca dentro de la app»
(`DECISIONES_PRODUCTO.md`, «Cómo se lanza», punto 5).

## El registro previo de Google Play

Play Console → la app → **Pruebas → Registro previo**. A una cuenta personal nueva suele pedirle antes
terminar la prueba cerrada. Si lo ofrece, se apunta en `docs/launch/google-play/guia.html`.
