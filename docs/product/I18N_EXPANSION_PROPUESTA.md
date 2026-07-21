# PACE · Estrategia de idiomas y expansión comercial

> **Estado: PENDIENTE DE VALORAR E IMPLEMENTAR. No forma parte del alcance funcional
> de s117.** Documento de referencia para implementar la detección automática de
> idioma y decidir futuras traducciones sin reconstruir esta conversación.
> Capturado en s117 (solo-docs).

**Principio de arquitectura:** la resolución de idioma es **una función canónica
única** compartida por todos los runtimes (web/PWA, Android, iOS). La **fuente** del
idioma del dispositivo cambia por plataforma (adaptador), pero las **reglas de
resolución no se duplican** — mismo patrón que el EventStore de
[`EVENTOS_SCHEMA.md`](./EVENTOS_SCHEMA.md).

---

## B1. Estado actual

- Idiomas actuales: **español** e **inglés**. Paridad estricta de claves obligatoria.
- ES + EN son **suficientes para v1**.
- **No** añadir un tercer idioma antes de estabilizar producto, onboarding, paywall,
  seguridad y contenido.
- La **arquitectura** debe quedar preparada desde ahora (esta propuesta).

## B2. Detección automática

Prioridad de resolución (de mayor a menor):
1. **Selección manual persistente.**
2. Preferencias de idioma del dispositivo.
3. Coincidencia **exacta** BCP 47.
4. Coincidencia por **idioma base** o mapa explícito de compatibilidad (§B6).
5. **Fallback a inglés.**

Fuentes por runtime (adaptador; las reglas de resolución son las mismas):
- **Web/PWA:** `navigator.languages` → fallback `navigator.language`; escuchar
  `languagechange` cuando `languageMode === 'auto'`.
- **Android/iOS (Capacitor):** `Device.getLanguageTag()` → fallback
  `Device.getLanguageCode()`; resolver con la **misma función canónica** que web.

No duplicar reglas de resolución entre plataformas.

## B3. Modelo de preferencias

Conceptual (no nombres definitivos):
- `languageMode`: `'auto' | 'manual'`.
- `selectedLanguage`: idioma manual o `null`.
- `detectedLanguageTag`: BCP 47 detectado.
- `resolvedLanguage`: traducción realmente cargada.
- `formatLocale`: locale usado para números y fechas.

Reglas:
- Primera ejecución: `languageMode = 'auto'`.
- Una selección **manual siempre gana**; cambiar el idioma del teléfono **no** la
  sobrescribe.
- En modo `auto`, el idioma se reevalúa al abrir o volver a foreground.
- **No cambiar el idioma a mitad de una sesión guiada**: aplicar el cambio al volver a
  una frontera segura de UI.
- Guardar la preferencia mediante el **adaptador correspondiente**: web storage en
  web, Preferences/UserDefaults en Capacitor.

## B4. Selector

Ofrece: **Automático — {idioma resuelto}** · Español · English · (futuros disponibles).
Cada idioma **en su propio idioma**: Español · English · Deutsch · Português (Brasil)
· Français · 日本語. **No mostrar idiomas no implementados** como si estuvieran
disponibles.

## B5. Idioma ≠ locale ≠ zona horaria

Separar: **idioma de UI · locale de formatos · zona horaria · formato 12/24 h ·
sistema de unidades.** No derivar todas de `selectedLanguage`. Usar **`Intl`** para
números, fechas y duraciones. **No** concatenar manualmente fragmentos traducidos para
formar frases.

## B6. Fallbacks

Resolver canónico basado en **BCP 47**. Ejemplos iniciales:
- `es-ES`, `es-MX`, `es-AR` → `es`.
- `en-US`, `en-GB`, `en-CA` → `en`.
- `de-DE`, `de-AT`, `de-CH` → `de` (cuando exista).
- `pt-BR` → `pt-BR` (cuando exista).
- `fr-FR`, `fr-BE`, `fr-CH` → `fr` (cuando exista).

**No** decidir silenciosamente que `pt-PT` use `pt-BR`: dejar un **mapa explícito de
compatibilidad** como decisión previa a publicar portugués.

Clave ausente en un idioma: (1) aviso en desarrollo; (2) fallback inglés para esa
clave; (3) **nunca** mostrar el identificador crudo; (4) **auditoría automática de
paridad**.

## B7. Estrategia de expansión

Distinguir **alcance** de **monetización**. (Hipótesis comerciales, no decisiones
irrevocables.)

**v1:** Español · Inglés · detección automática · opción Automático · override manual
persistente.

**Candidato 1 — Alemán (`de`):** mejor candidato de monetización por usuario
(DACH: Alemania/Austria/parte de Suiza; alto poder adquisitivo; encaje con privacidad,
offline, bienestar laboral y compra Lifetime; buen ajuste con el posicionamiento
sobrio sin tracking).

**Candidato 2 — Portugués de Brasil (`pt-BR`):** gran alcance; fuerte Android; buen
crecimiento orgánico; menor coste de localización; **requiere precio regional**;
probablemente menor ingreso medio por usuario que DACH → **mejor para volumen que para
monetización**.

**Candidato 3 — Francés (`fr`):** Francia/Bélgica/parte de Suiza/Canadá; buen
equilibrio alcance / capacidad de pago / coste.

**Futuro premium — Japonés (`ja`):** **solo con localización completa** (revisión
nativa, tipografía, metadata, paywall, nombres editoriales, instrucciones, seguridad,
soporte). **No** publicar traducción japonesa literal o parcialmente automática.

**No prioritario aún:** árabe/RTL · coreano · italiano · portugués de Portugal ·
locales regionales adicionales.

## B8. Validación antes de traducir

No traducir todo el catálogo por hipótesis. **Validar demanda**: landing localizada ·
campaña/tráfico controlado · lista de espera · investigación de palabras clave ·
interés por precio · país de instalaciones · solicitudes de usuarios.

**Métricas posteriores:** impresión→instalación · instalación→onboarding completo ·
onboarding→primera sesión · usuario activo→paywall · paywall→compra · renovación ·
reembolso · LTV por país · ingresos por instalación · coste de adquisición. La
decisión final (alemán/portugués/francés) se basa en **datos**.

## B9. Precio regional

Localizar ≠ solo traducir. Coordinar: idioma · moneda · precio regional ·
mensual/anual/Lifetime · paywall · capturas · ficha de tienda · onboarding · propuesta
de valor. **No** convertir precios nominalmente sin valorar poder adquisitivo. **Las
tiendas son fuente de verdad** para precio y moneda en Android/iOS: **no hardcodear**
textos como «9,99 €» dentro de las traducciones.

## B10. Calidad editorial y seguridad

La IA puede preparar borradores, pero requieren **revisión humana competente**,
especialmente: instrucciones físicas · respiraciones · apnea y retenciones ·
contraindicaciones · avisos médicos · onboarding · paywall · privacidad · export/import
· nombres de Caminos · logros · accesibilidad. Mantener el tono **calmado, artesanal y
literario**. Los **nombres editoriales** pueden requerir **adaptación, no traducción
literal**.

## B11. Diseño preparado para localización

Criterios: no fijar anchos según español · botones compatibles con textos más largos ·
cards que crezcan verticalmente · no truncar información esencial · **probar alemán**
(suele expandir) · probar títulos largos · ES/EN en todos los viewports ·
pseudolocalización de **expansión** y con **acentos** · zoom hasta 200 % · lector de
pantalla · **RTL fuera de alcance inicial, pero sin bloquearse con decisiones
estructurales**.

La pseudolocalización debe delatar: botones demasiado estrechos · pills rotas · títulos
truncados · overlays con altura fija · carcasa de Estadísticas inestable · Camino y
timer solapados por texto largo (ver [`HOME_REDISENO_PROPUESTA.md`](./HOME_REDISENO_PROPUESTA.md)).

## B12. Recursos nativos

Traducir strings web **no** localiza automáticamente: nombre nativo de la app ·
permisos · notificaciones · widgets · shortcuts · textos de privacidad · productos de
compra · fichas de App Store / Google Play · capturas de tienda. Android e iOS
necesitarán **recursos nativos por idioma**.

## B13. Criterios de aceptación futuros

- [ ] Auto detecta español e inglés.
- [ ] Coincidencia exacta y por idioma base.
- [ ] Fallback inglés.
- [ ] Override manual persistente.
- [ ] El cambio del sistema no pisa la selección manual.
- [ ] Auto se reevalúa al volver a foreground.
- [ ] No cambia idioma a mitad de una sesión.
- [ ] Paridad automática de claves.
- [ ] No aparecen claves crudas.
- [ ] `Intl` para formatos.
- [ ] ES/EN pasan todos los viewports.
- [ ] Pseudolocalización no rompe el layout.
- [ ] Recursos nativos localizados.
- [ ] Store metadata localizada.
- [ ] Precio obtenido de la tienda.
- [ ] Contenido de salud revisado humanamente.

---

## Backlog i18n (para registrar en STATE.md al cierre, sin implementar)

- **I18N-1 — modo Automático:** detección BCP 47 (web + Capacitor), override manual
  persistente, fallback inglés.
- **I18N-2 — robustez:** paridad de claves, pseudolocalización, pluralización, pruebas
  de expansión.
- **I18N-3 — expansión comercial:** validar alemán (3er idioma), `pt-BR` (volumen),
  francés (posterior).
- **I18N-4 — localización nativa:** permisos, notificaciones, compras, fichas y
  capturas de tiendas.

*(Enlazar este documento desde el backlog de STATE.md; no copiarlo entero.)*
