# Relevo · venta-sin-stripe (16 oct. 2026, parada al 89 % del límite de 5 h)

Rama `claude/interesting-meninsky-062638`, último commit `wip(venta)` (empujado).
Página de opciones de Ez: https://claude.ai/artifact/AvME9EqcMHXhywx43vEdKG

## Lo que eligió Ez (AskUserQuestion, 16 oct.) — no se vuelve a preguntar
1. «Avísame»: **en su Cloudflare** (función de Pages + KV). Sin correo de confirmación; el aviso lo manda
   Ez desde Gmail o sube la lista a Brevo ese día.
2. /premium: **B · Escaparate** (foto al lado del título y bandas en escritorio; en el móvil igual que A).
3. Bienvenida: **A · lista y dos botones** (precios en una frase, «Probar 7 días gratis» y «Ahora no»
   iguales, «Prefiero pagarlo una vez» debajo).
4. Publicar: **la página ya; la lista después**. El campo dice «La lista abre muy pronto» hasta que Ez
   conecte el KV y diga con qué nombre firma la privacidad (responsable de los datos).

## Hecho en el wip (sin pruebas todavía)
- `app/state-compra.js`: tiendas por canal (web = Stripe con `PACE_TIENDA_WEB.enlaces` a null; play y
  ninguna vacías). `state-entitlement.jsx`: `paceTiendaAbierta`, `paceTiendaPlanes`, `paceComprar`,
  `paceGestionarCompra`, `tieneCompraVigente` (tercera fuente en las tres funciones del guard).
- `app/onboarding/OnboardingCompleto.jsx` (paso 'completo' tras la semana, solo con la tienda abierta),
  textos `premium.onb.*` y `premium.plan.*` en `strings/premium.js`. Exporta `onboardingStyles` y
  `PREMIUM_INCLUYE` a window.
- `premium/index.html` + fotos webp; `.claude/static-server.js` sirve /premium/.

## Falta
1. Quitar la variante B de la bienvenida (`PACE_MAQUETA_COMPLETO`, estilos plato*, claves
   `premium.onb.lede.largo`, `.probar.corto`, `.comprar`, `premium.plan.*` si nadie las usa) y en
   /premium dejar B fija (quitar `.v-b`/`?v=b`, que sean las reglas normales).
2. /premium en inglés (data-en o bloque EN) y el botón ES·EN; el campo «Avísame» oculto con «La lista
   abre muy pronto» si `GET /api/avisame` no dice `{abierta:true}`.
3. `functions/api/avisame.js`: POST {correo, idioma, trampa} → KV `AVISAME` (clave = correo en
   minúsculas, valor {fecha, idioma}); GET → {abierta: !!env.AVISAME}; sin KV, 503. Guía para Ez
   (crear KV «pace-avisame», binding `AVISAME` en el proyecto de Pages).
4. `privacy.html` (ES y EN): «Si te apuntas a Avísame», responsable (nombre pendiente de Ez),
   /premium cuenta visitas sin cookies (Web Analytics a mano solo en /premium: token de Ez); avisar de
   NO encender la analítica del proyecto de Pages (la mete en la app).
5. Bienvenida: «Núcleo gratuito · disponible» → «Gratis · lo esencial, siempre» (ES) / «Free · the
   essentials, always»; medir a 360 px. Choca con la regla s151 (sin absolutos): la decisión de Ez la
   amplía; anotarlo en DECISIONES.
6. Contador de claves i18n en `scripts/verify.integridad.js` (`i18nClaves`).
7. Pruebas: `tests/compra-tienda.spec.js` (tienda cerrada: la bienvenida acaba en la semana y no hay
   botón; con `PACE_TIENDA_WEB.enlaces` puestos sale el paso, «Ahora no» cierra y no vuelve, precios
   de la tienda), `tests/premium-landing.spec.js` (sin peticiones a otros dominios, sin scroll
   horizontal a 360, el campo oculto sin función). Rojas contra main, verdes en la rama.
8. Cierre de siempre (verify, build + checkout del standalone, suite con PACE_E2E_PORT=8796
   --workers=2) y «LISTO PARA MAIN» con CHANGELOG/STATE/DECISIONES en el commit.
