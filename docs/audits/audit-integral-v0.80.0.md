# PACE — Auditoría integral de producto, UX, infraestructura y camino a v1

> **Documento APORTADO por el usuario** al cerrar s148, escrito contra **v0.80.0 / HEAD `5a258762`**.
> Es una **entrada**, no un documento gobernante: lo que manda sigue siendo `ROADMAP.md`,
> `docs/product/DECISIONES_PRODUCTO.md` y `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.
>
> **El triaje punto por punto vive en
> [`triaje-audit-integral-s149.md`](./triaje-audit-integral-s149.md)** (s149). Este archivo se
> conserva como el original recibido.
>
> **Reparación de formato (s149, sin tocar una sola palabra).** La copia pegada perdió **todos**
> los marcadores markdown a partir de la línea 233 —no solo la valla de código sin cerrar de §4.6:
> también los `#` de los títulos de §4.7 en adelante, las viñetas y las dos tablas—, y arrastraba
> el texto del botón «Copy» de la interfaz de origen pegado al primer token de cada bloque de
> código. Se restituyeron títulos, viñetas, vallas y tablas, y se retiraron los dos «Copy» sueltos.
> **Verificado**: el flujo de palabras es idéntico al de HEAD (4533 tokens, cero divergencias,
> normalizando los artefactos «Copy» y los numerales de lista).

## Instrucción inicial para Claude Code

Este documento migra el contexto completo de una auditoría externa de PACE.

NO debes implementar todo automáticamente ni convertir cada propuesta en una decisión cerrada.

Antes de modificar código:

1. Lee la documentación canónica del repositorio:
   - `STATE.md`
   - `ROADMAP.md`
   - `MONETIZATION.md`
   - `CONTENT.md`
   - `docs/product/AUDITORIA_DOCUMENTAL.md`
   - `docs/product/AUDITORIA_SISTEMA_PACE.md`
   - `docs/product/DECISIONES_PRODUCTO.md`
   - `docs/product/DECISIONES_TECNICAS_VIGENTES.md`
   - `docs/product/STATS_DESTINO_PROPUESTA.md`
   - `docs/WORKFLOW.md`

2. Contrasta cada afirmación con el código real y el HEAD actual.

3. Clasifica cada punto de este documento como:
   - HECHO;
   - PARCIAL;
   - PENDIENTE;
   - PROPUESTA;
   - CONTRADICCIÓN DOCUMENTAL;
   - BLOQUEADO POR ARTE;
   - BLOQUEADO POR DECISIÓN DEL USUARIO.

4. No reabras decisiones expresamente cerradas sin evidencia nueva.

5. No ejecutes varios frentes de producto en una sola sesión. Se mantiene la regla:
   - un frente;
   - implementación acotada;
   - verificación real;
   - documentación;
   - cierre.

6. Antes de tocar un subsistema, lee sus decisiones técnicas vigentes.

7. `index.html` es el artefacto web que debe verificarse en runtime. No basta con probar `PACE.html`.

8. No regeneres o alteres `PACE_standalone.html` salvo que la sesión lo exija expresamente. Actualmente es un export bajo demanda y no el artefacto canónico.

9. No inventes arte, glifos o adaptaciones de dibujos aprobados por el usuario. El arte aportado debe portarse literalmente siguiendo las reglas de ingesta vigentes.

10. Este documento amplía la auditoría actual. Antes de escribirlo en los documentos canónicos, presenta:
    - contradicciones detectadas;
    - decisiones nuevas propuestas;
    - cambios de roadmap sugeridos;
    - archivos que habría que actualizar.

---

# 1. Estado del repositorio comprobado al redactar esta auditoría

- Rama: `main`.
- Versión: `v0.80.0`.
- HEAD comprobado:
  `5a258762535a434a0dc730587f3bc31861897414`
- Última sesión documentada: s147.
- `main` no está protegida.
- No existe una red CI completa.
- `package.json` solo expone actualmente el script `build`.
- El build genera el artefacto web compilado y el standalone.
- `index.html` es el artefacto web/PWA canónico.
- `PACE_standalone.html` permanece deliberadamente en una versión anterior como export bajo demanda.
- El service worker todavía incluye `PACE_standalone.html` en el precache, lo que debe auditarse porque mezcla el runtime canónico con un export deliberadamente desactualizado.
- La aplicación es React 18 con una arquitectura modular propia, Babel/build personalizado, estado local, PWA y despliegue en Cloudflare Pages.
- Web y futuro Capacitor Android son los objetivos canónicos.
- La app tiene una visión de producto avanzada, pero todavía no está lista para cobrar de forma segura.

---

# 2. Visión actual de PACE

PACE no debe entenderse como un Pomodoro con funciones accesorias.

Debe ser:

> Un sistema local de foco, respiración y cuerpo que transforma el trabajo sedentario en un ritmo más equilibrado mediante acciones directas, pausas útiles, Caminos y Travesías.

La aplicación tiene cuatro niveles:

1. Acción directa:
   - Foco;
   - Respira;
   - Mueve;
   - Estira;
   - Hidrátate.

2. Recomendación:
   - Pausa PACE;
   - Déjate guiar;
   - acción contextual.

3. Caminos:
   - experiencias guiadas para una sola sesión.

4. Travesías:
   - recorridos coherentes de varios capítulos;
   - principal argumento Premium.

PACE debe ganar por:

- coherencia;
- belleza;
- claridad;
- integración;
- utilidad diaria;
- privacidad;
- cuidado editorial;
- progreso sin culpa.

No debe ganar por cantidad de contenido ni por gamificación agresiva.

---

# 3. Principios que no deben romperse

- Local-first.
- Sin cuenta obligatoria.
- Sin tracking comercial invasivo.
- Datos exportables y borrables.
- Núcleo gratuito realmente útil.
- Compra comprensible.
- Sin suscripción autorrenovable en el lanzamiento.
- Sin publicidad.
- Sin urgencia comercial.
- Sin pérdida punitiva de progreso.
- Sin monedas, vidas, energía o rankings.
- Sin rachas culpabilizadoras.
- Sin muro de pago a mitad de una sesión.
- Sin CTA comercial durante una experiencia física o emocional intensa.
- Sin consejos médicos presentados como tratamiento.
- Sin IA generativa como feature visible.
- Uso libre y uso guiado deben convivir.
- La guía ayuda, pero nunca obliga.
- Saltarse un día no destruye nada.
- “Premium” debe significar profundidad y cuidado, no inutilizar el producto gratuito.

---

# 4. Prioridad inmediata: red de seguridad

## 4.1 Problema

PACE está acumulando producto, arte, catálogos, estado, PWA, Premium y preparación Android sin una red automática suficiente.

Ya existió una regresión real que rompió `index.html` durante varias versiones aunque el entorno modular pareciera funcionar.

Antes de Travesías, compra real o integración completa con Capacitor debe existir una red mínima.

## 4.2 Cuándo implementarla

Debe ser el siguiente frente técnico o uno de los dos siguientes como máximo.

Puede hacerse por capas y no necesita detener todo el desarrollo durante muchas sesiones.

## 4.3 Capa 1 — CI mínimo

Añadir GitHub Actions para ejecutar en cada push y pull request:

- instalación limpia de dependencias;
- build;
- comprobación de salida;
- validación de versiones;
- auditorías existentes;
- validación de catálogos;
- validación del service worker;
- fallo explícito si el build no produce el artefacto esperado.

Scripts recomendados:

- `npm run build`
- `npm run test`
- `npm run test:smoke`
- `npm run lint` o validación sintáctica equivalente;
- `npm run audit:catalogs`
- `npm run audit:i18n`
- `npm run audit:assets`
- `npm run audit:achievements`
- `npm run verify`

No hay que introducir herramientas innecesarias solo para tener nombres modernos. La validación debe adaptarse a la arquitectura real.

## 4.4 Capa 2 — smoke test real

Añadir Playwright o equivalente para:

1. servir `index.html`;
2. abrirlo en un navegador real;
3. comprobar que la home monta;
4. fallar ante errores de consola;
5. abrir Respira;
6. abrir Mueve;
7. abrir Estira;
8. abrir Stats;
9. abrir ajustes;
10. iniciar y cancelar una sesión;
11. probar onboarding con state limpio;
12. probar viewport móvil;
13. verificar que no hay rutas de assets rotas.

## 4.5 Capa 3 — integridad de producto

Validar automáticamente:

- IDs duplicados;
- rutinas desconocidas;
- Caminos que apunten a rutinas inexistentes;
- futuras Travesías que apunten a capítulos inexistentes;
- claves i18n ES/EN;
- glifos y aliases;
- máscaras y logros;
- detectores de logros;
- assets del precache;
- versiones;
- migraciones;
- import/export;
- contenido Premium accesible por error;
- referencias huérfanas;
- denominadores compartidos.

## 4.6 Despliegue

Objetivo:

```text
commit
→ GitHub Actions
→ build
→ tests
→ auditorías
→ despliegue Cloudflare solo si todo pasa
```

Auditar si la integración actual de Cloudflare despliega commits aunque fallen comprobaciones externas.

Opciones:

- proteger `main` y trabajar mediante pull requests;
- o desplegar Cloudflare desde GitHub Actions con Wrangler después de superar CI.

## 4.7 Service worker

Auditar y probablemente retirar:

```text
/PACE_standalone.html
```

del precache de la aplicación web.

El standalone es un export bajo demanda, no parte del runtime canónico. Precachear una versión antigua puede conservar un artefacto que deliberadamente no está sincronizado.

---

# 5. Infraestructura: qué cubre Cloudflare

## 5.1 Cloudflare sí puede cubrir

- alojamiento de la web;
- HTTPS;
- CDN;
- dominio;
- PWA;
- assets;
- despliegues;
- Pages Functions;
- Workers;
- recepción de webhooks;
- endpoint de licencia;
- validación o emisión de entitlements;
- almacenamiento pequeño en KV/D1 si fuera necesario;
- Turnstile para formularios.

Para el tráfico inicial, Cloudflare Free debería ser suficiente.

## 5.2 Cloudflare no sustituye

- Merchant of Record;
- checkout;
- facturación;
- gestión fiscal internacional;
- IVA;
- reembolsos;
- contracargos;
- Google Play Billing;
- Google Play Console;
- Android Studio;
- revisión legal.

## 5.3 Arquitectura web recomendada

```text
GitHub
   ↓
GitHub Actions
   ↓
Cloudflare Pages
   ├── PACE web/PWA
   ├── landing
   └── Pages Functions / Worker de licencia

Merchant of Record
   ├── checkout
   ├── impuestos
   ├── facturas
   ├── reembolsos
   └── compra/licencia

Cloudflare Worker
   ├── recibe webhooks
   ├── verifica compra
   └── emite o valida entitlement
```

## 5.4 Servicios recomendados

Evaluar:

- Lemon Squeezy;
- Paddle;
- otra alternativa que actúe como Merchant of Record en la UE.

No montar Stripe directo en la primera versión salvo que se quiera asumir explícitamente la gestión fiscal y de facturación.

## 5.5 Qué permanece local

No se necesita backend de producto para:

- historial;
- foco;
- agua;
- logros;
- feedback;
- rutinas;
- Caminos;
- Travesías;
- ajustes;
- perfil contextual.

Local-first no significa “cero servicios”. Significa:

> El núcleo y los datos personales funcionan localmente; la infraestructura remota se limita a distribución, compra, licencia y restauración.

---

# 6. Monetización

## 6.1 Decisión de lanzamiento

Un único plan:

> PACE Premium Lifetime — 19,99 €

## 6.2 No lanzar mensual

El mensual queda descartado porque:

- no encaja con la filosofía;
- sin cuentas es incómodo;
- sin renovación automática obliga a recomprar;
- con renovación automática introduce complejidad y dependencia;
- complica licencias, soporte y mensajes;
- debilita el posicionamiento de “objeto cuidado”.

## 6.3 Anual futuro

La arquitectura puede admitir `expiresAt` opcional desde el principio.

Si más adelante aparece evidencia de que 19,99 € supone demasiada fricción, se puede evaluar:

- anual: 9,99 €;
- lifetime: 19,99 €.

No debe aparecer una comparativa de planes en el lanzamiento.

## 6.4 Entitlement

No usar un simple booleano como contrato final.

Separar:

```text
PurchaseAdapter
├── WebPurchaseAdapter
└── PlayPurchaseAdapter

LicenseStore
├── licencia web
└── compra Play

EntitlementResolver
└── free | premium | tasting
```

Datos conceptuales:

```text
source
productId
issuedAt
expiresAt
verifiedAt
status
```

Todos los consumidores deben consultar una API central. No leer `premiumUnlocked` directamente.

Auditar excepciones actuales, por ejemplo superficies del constructor que leen el booleano directamente.

## 6.5 Compra web y Android

Web:

- Merchant of Record;
- licencia o entitlement restaurable.

Android distribuido en Google Play:

- producto único no consumible;
- Google Play Billing;
- backend/Worker para verificación segura cuando corresponda.

Sin cuentas:

- compra web se restaura mediante clave o archivo;
- compra Play se restaura mediante Google Play;
- no prometer sincronización automática entre plataformas en v1.

## 6.6 Premium no debe cortar experiencias

- Nunca bloquear en mitad de una sesión.
- Nunca cortar una Travesía ya presentada como gratuita.
- El acceso se decide en la puerta.
- El preview debe mostrar claramente qué incluye Premium.
- Una degustación debe ser una experiencia completa y segura.

---

# 7. Contradicciones documentales y de copy

## 7.1 Onboarding

El onboarding reutiliza actualmente estas afirmaciones:

```text
Siempre gratis
sin paywall
```

Y en inglés:

```text
Always free
no paywall
```

Esto contradice el lanzamiento Premium.

Sustituir conceptualmente por algo como:

```text
Tus datos
en tu dispositivo

Sin cuenta obligatoria
entra sin registrarte

Núcleo gratuito
siempre disponible
```

Lede sugerido:

> Micro-pausas de foco, respiración y cuerpo para acompañar tu día. Sin presión, sin publicidad y con tus datos en tu dispositivo.

Premium se puede explicar después:

> El núcleo de PACE es gratuito. Premium amplía Caminos, Travesías, rutinas y herramientas mediante una compra única.

## 7.2 “Standalone”

No usar “standalone” como propuesta principal de bienvenida.

Una persona entiende mejor:

- funciona sin conexión;
- puedes instalarlo;
- tus datos permanecen en tu dispositivo.

## 7.3 Claims que deben auditarse

Buscar y corregir:

- “siempre gratis”;
- “sin paywall”;
- “no hay servidor”;
- “localStorage únicamente”;
- “no desbloquea nada”;
- “post-v1” aplicado a la licencia;
- referencias a mensual, temporadas o cuatro vías de monetización;
- Android como v2 cuando ahora entra en v1;
- v1 definida como web pulida en lugar de primera versión pagada.

## 7.4 Documentos históricos

`MONETIZATION.md` abre con la decisión correcta de Lifetime 19,99 €, pero conserva un modelo histórico extenso de cuatro vías.

`ROADMAP.md` también conserva secciones antiguas que mencionan:

- mensual;
- temporadas;
- Android v2;
- otros requisitos ya sustituidos.

No borrar historia sin criterio, pero marcarla de manera inequívoca como:

- histórica;
- archivada;
- no gobernante.

---

# 8. Home y tarjeta de continuidad

## 8.1 Estado actual

El componente actual es `SuggestedPathCard`.

Orden visual actual:

Escritorio

```text
Pomodoro
Actividades
Tarjeta de Camino
```

Móvil

```text
Pomodoro
Tarjeta de Camino
Actividades
```

El DOM y el orden visual no coinciden porque el CSS reordena elementos en escritorio.

Esta composición se considera acertada.

## 8.2 Decisión

No mover las piezas sin una razón probada.

Mantener:

Escritorio

```text
Pomodoro
Actividades
Continuidad
```

Móvil

```text
Pomodoro
Continuidad
Actividades
```

## 8.3 Evolución

`SuggestedPathCard` debe evolucionar conceptualmente a:

```text
ContinuityCard
```

El nombre visible cambia según el contenido.

Prioridad:

1. Travesía activa.
2. Camino en curso.
3. Próximo capítulo pendiente.
4. Camino sugerido.
5. Camino favorito.
6. Acción contextual.

Debe mostrar una sola acción principal, no favorito y sugerencia con el mismo peso.

## 8.4 Ejemplos

Travesía:

```text
CONTINÚA TU TRAVESÍA · CAPÍTULO 3 DE 7

Hombros que respiran
8 min · de pie · sin material

[Continuar]
```

Camino:

```text
CAMINO EN CURSO · PASO 2 DE 4

La pausa del mediodía
Quedan unos 6 minutos

[Retomar]
```

Recomendación:

```text
PARA ESTE MOMENTO · ~12 MIN

Vuelve al cuerpo
Respiración · movimiento · agua

[Iniciar]
```

## 8.5 Resolver común

Crear en el futuro un resolver:

```text
getHomeContinuation(state, context)
```

Resultado conceptual:

```text
type
priority
eyebrow
title
detail
duration
progress
action
accent
art
```

Este resolver puede alimentar:

- home;
- sidebar;
- notificación;
- widget Android;
- Pausa PACE.

No implementar todavía sin diseñar contratos y estados.

---

# 9. Pomodoro como amanecer

## 9.1 Dirección

El timer debe sentirse como un sol naciente, manteniendo la identidad de papel e ilustración de PACE.

No debe ser un gradiente llamativo ni un aro de fitness.

## 9.2 Capas

```text
papel
+ halo radial abierto
+ luz ambiental
+ arco funcional
+ sol/timer
+ horizonte
+ tarjeta de continuidad
```

## 9.3 Estados

- preparado;
- activo;
- pausado;
- últimos minutos;
- completado;
- reduced motion;
- día;
- noche.

## 9.4 Evolución

- Inicio: papel casi neutro.
- Primer tercio: crema cálida suave.
- Mitad: halo más amplio.
- Último tercio: más luminosidad, no más saturación.
- Final: luz asentada, sin destello.
- Pausa: atmósfera congelada.

El arco sigue siendo la representación funcional del tiempo.

## 9.5 Horizonte

En móvil, la tarjeta de continuidad puede seguir actuando como línea del horizonte.

No debe ser la única capa que cree el amanecer. La luz debe existir también detrás y alrededor del Pomodoro.

## 9.6 Evitar

- rojo;
- destellos;
- pulsos;
- parallax continuo;
- saturación intensa;
- movimiento que distraiga;
- depender del color para entender el progreso.

---

# 10. Geometría móvil de la home

## 10.1 Problema

El orden móvil es bueno, pero las proporciones pueden mejorar.

La home móvil no debe convertirse en una versión distinta de escritorio, pero tampoco debe intentar comprimir literalmente el mismo lienzo.

## 10.2 Estado técnico

`home-geometry.js` y `_responsive.js` contienen una lógica avanzada:

- medición de viewport;
- diámetro del timer;
- solapamiento;
- compactación;
- varias pasadas de ajuste;
- comportamiento distinto por anchura y altura.

Hay comentarios históricos que ya no reflejan del todo el comportamiento real:

- el helper se describe como desktop;
- posteriormente también se usa en móvil;
- algunas explicaciones de variables están desactualizadas.

Antes de añadir una atmósfera más compleja:

- auditar el contrato geométrico;
- actualizar comentarios;
- reducir reglas duplicadas;
- conservar el resultado visual acertado.

## 10.3 Tres bandas visuales

Móvil:

Cielo:

- topbar;
- selector;
- halo superior.

Sol y horizonte:

- Pomodoro;
- ambiente;
- tarjeta de continuidad.

Tierra:

- actividades;
- accesos secundarios.

## 10.4 No forzar cero scroll siempre

En teléfonos bajos o con texto ampliado es preferible un scroll vertical natural que comprimir:

- tipografía;
- targets;
- glifos;
- copy;
- controles.

## 10.5 Matriz de prueba

Probar al menos:

- 320 × 568;
- 360 × 640;
- 375 × 667;
- 390 × 844;
- 412 × 915;
- texto ampliado;
- reduced motion;
- 1366 × 768;
- 1536 × 700;
- 1920 × 1080.

---

# 11. Sidebar como continuidad

## 11.1 Problema

La sidebar actual sigue estando orientada a:

- racha actual;
- mejor racha;
- sendero abstracto;
- últimos logros;
- apoyo.

Esto entra en conflicto con la dirección de producto que sustituye rachas y récords por ritmo semanal sin culpa.

## 11.2 Nueva función

La sidebar debe ser un panel de continuidad, no un panel de recuentos.

Jerarquía propuesta:

Continuar:

- Travesía;
- Camino;
- recomendación.

Hoy:

- Foco;
- Respiración;
- Cuerpo;
- hidratación como acompañamiento.

Ritmo semanal:

- siete días;
- “días con ritmo”;
- sin récord.

Último logro:

- un sello protagonista;
- acceso a colección.

Acciones secundarias:

- Stats;
- ajustes;
- soporte;
- versión.

## 11.3 Móvil

No trasladar literalmente toda la sidebar de escritorio al drawer.

La continuidad principal debe estar en la home.

El drawer móvil puede contener:

- ritmo;
- Stats;
- colección;
- ajustes;
- soporte.

La paridad debe ser funcional, no compositiva.

---

# 12. Mueve y Estira

## 12.1 Diagnóstico

El motor y los datos han avanzado, pero la experiencia sigue sintiéndose:

- sosa;
- plana;
- poco estimulante;
- insuficientemente explicativa.

No se resolverá solo cambiando nombres o glifos.

## 12.2 Estado

Existe:

- intensidad;
- nivel;
- requisitos;
- preview;
- runner v1;
- instrucciones;
- cambios de lado;
- feedback;
- constructor;
- catálogo amplio.

Sigue pendiente:

- 20 ejercicios sin glifo propio;
- 15 glifos existentes sin aprobación;
- mayoría de dibujos con una pose estática;
- diagramas grandes de ejecución;
- revisión editorial completa;
- adaptaciones claras;
- experiencia corporal con mejor ritmo;
- validación profesional.

## 12.3 Cuatro sistemas visuales distintos

No mezclar:

1. Marca PACE.
2. Logos de módulos.
3. Glifos pequeños de ejercicios.
4. Diagramas de ejecución.

El logo de Mueve no debe intentar enseñar un ejercicio.

El glifo de 44 px identifica.

El diagrama grande enseña:

- pose inicial;
- pose final;
- dirección;
- apoyo;
- lado;
- zona corporal;
- adaptación.

## 12.4 Nueva experiencia de rutina

### Tarjeta

Debe prometer un resultado concreto.

No:

> Movilidad de hombros.

Sí:

> Recupera espacio en hombros y espalda alta después de trabajar sentado.

### Preview

Debe mostrar:

- objetivo;
- recorrido;
- duración;
- postura;
- material;
- suelo;
- intensidad;
- nivel;
- sensación esperada;
- cuidado;
- adaptación sencilla.

### Ejercicio

Cuatro capas:

```text
Colócate
Muévete
Fíjate
Más sencillo
```

### Ritmo de sesión

```text
llegada
→ preparación
→ movimiento
→ transición
→ movimiento
→ pausa
→ integración
→ cierre
```

### Cierre perceptivo

Ejemplo:

> Comprueba si puedes mover los hombros con menos esfuerzo.

Feedback opcional:

- más sueltos;
- igual;
- demasiado intenso.

## 12.5 Qué significa “estimulante”

No convertir Mueve y Estira en un juego.

Debe resultar estimulante porque:

- se entiende;
- se ve el movimiento;
- tiene ritmo;
- se percibe una diferencia;
- el arte acompaña;
- el usuario sabe por qué lo hace;
- la sesión tiene principio y final.

## 12.6 Orden del rediseño

1. Cerrar taxonomía.
2. Terminar glifos ausentes.
3. Revisar glifos dudosos.
4. Diseñar diagramas grandes prioritarios.
5. Reescribir experiencias piloto.
6. Validar técnicamente.
7. Aplicar patrón al catálogo.
8. Rediseñar logos definitivos de módulos.

---

# 13. Bibliotecas de Respira, Mueve y Estira

## 13.1 Problema

En móvil se presentan demasiados grupos y tarjetas expandidas, generando scroll excesivo.

## 13.2 Propuesta

Cabecera:

```text
MUEVE

[Déjate guiar] [Tus rutinas]
```

Categorías sticky:

```text
Todo · Oficina · Tren superior · Piernas · Core
```

Filtros en sheet:

- duración;
- postura;
- suelo;
- material;
- intensidad;
- nivel;
- zona corporal;
- espacio.

## 13.3 Tarjetas móviles

Compactas:

```text
[glifo] Cuello · 3 min
        Suave · sentado
        Libera cervicales tensas
```

Al tocar:

- abre preview;
- requisitos y pasos viven allí;
- la lista no necesita contener toda la explicación.

## 13.4 Evitar

- mostrar todas las categorías completamente expandidas;
- demasiados chips permanentes;
- carruseles horizontales como navegación principal;
- duplicar una sección grande de “Tus rutinas” en dos bibliotecas.

Puede existir un acceso compacto común a las mismas rutinas propias.

---

# 14. Caminos

## 14.1 Problema

Los Caminos actuales funcionan técnicamente, pero se parecen demasiado a playlists:

```text
Respira
→ Foco
→ Cuerpo
```

La diferenciación no puede depender solo del nombre, hora y lámina.

## 14.2 Definición

Un Camino es una experiencia editorial para una sola sesión.

Formatos:

- Semilla: 3–7 minutos.
- Pausa: 8–20 minutos.
- Ritual: 25–60 minutos.

## 14.3 Contrato conceptual

```text
id
format
need
context
estimatedDuration
intensity
editorialBeats
steps
completion
access
```

## 14.4 Nuevos tipos de paso

Además de rutinas:

- `editorialStep`;
- `sensoryStep`;
- `transitionStep`;
- `environmentStep`;
- `reflectionStep`.

Ejemplos:

- mirar a lo lejos;
- cambiar de postura;
- caminar;
- abrir una ventana;
- soltar las manos;
- beber agua lentamente;
- notar el apoyo de los pies;
- preparar el siguiente bloque;
- recoger el espacio;
- elegir una intención.

## 14.5 Contenido exclusivo

Los Caminos deben incluir:

- llegada;
- preparación;
- transiciones;
- microacciones;
- cambios de postura;
- integración;
- cierre.

No hace falta una cuota matemática, pero sí una experiencia imposible de replicar simplemente abriendo tres rutinas.

## 14.6 Implementación

No rehacer los siete a la vez.

Primero:

- definir contrato;
- crear un Camino Semilla;
- crear un Camino Pausa;
- crear un Ritual;
- validar;
- adaptar el motor;
- decidir qué Caminos actuales conservar.

---

# 15. Travesías Premium

## 15.1 Definición

Una Travesía es:

> Un recorrido coherente de varios capítulos que desarrolla una capacidad o acompaña una transformación, a ritmo del usuario.

No es un Camino largo ni una lista de Caminos.

## 15.2 Formatos

- 3 capítulos: entrada breve o experiencia gratuita.
- 7 capítulos: formato Premium principal.
- 14 capítulos: recorrido profundo.

Los capítulos no equivalen obligatoriamente a días.

## 15.3 Diferencia con Caminos

| Camino | Travesía |
|---|---|
| Una sesión | Varios capítulos |
| Lámina pequeña | Mapa grande |
| Progreso temporal | Progreso persistente |
| Ayuda ahora | Acompaña un cambio |
| Puede repetirse | Se continúa |
| Experiencia | Arco editorial |

## 15.4 Mapa visual

Las Travesías tendrán una superficie propia de mapa ilustrado:

- más grande que las láminas de Caminos;
- papel y tinta de PACE;
- sendero;
- paisaje;
- capítulos;
- hitos;
- luz;
- transformación visual;
- mapa completado como recuerdo.

No usar estética de videojuego:

- monedas;
- cofres;
- vidas;
- energía;
- cadenas agresivas;
- niveles infinitos;
- confeti.

## 15.5 Móvil

Mapa principalmente vertical:

```text
portada
↓
ruta serpenteante
↓
capítulos
↓
destino
```

Evitar un lienzo bidimensional que obligue constantemente a pellizcar y arrastrar.

## 15.6 Escritorio

Mapa amplio con ficha lateral o integrada del capítulo:

```text
mapa
+ capítulo seleccionado
+ progreso
+ continuar
```

## 15.7 Estados del mapa

### Sin empezar

- ruta visible;
- primer capítulo destacado;
- futuros reconocibles;
- sin bloqueos agresivos.

### En curso

- camino recorrido;
- capítulo actual;
- cambios en el paisaje;
- destino visible.

### Completado

- mapa final;
- luz asentada;
- sello;
- lámina;
- texto de cierre;
- práctica conservable.

## 15.8 Evolución del paisaje

Completar capítulos puede:

- revelar vegetación;
- abrir un claro;
- completar un puente;
- añadir agua;
- cambiar la luz;
- descubrir una anotación;
- completar el sendero.

La transformación puede apreciarse al volver al mapa. No necesita animación constante.

## 15.9 Arco narrativo

### Acto 1 — Llegar

- reconocer;
- observar;
- primera acción fácil;
- primera sensación útil.

### Acto 2 — Profundizar

- nuevas prácticas;
- variaciones;
- más autonomía;
- combinaciones.

### Acto 3 — Integrar

- reunir;
- elegir;
- crear una respuesta propia;
- cerrar;
- continuar sin dependencia.

## 15.10 Premium de verdad

Una Travesía Premium debe ofrecer:

- mapa exclusivo;
- portada;
- paleta propia;
- arte;
- contenido exclusivo;
- progresión;
- coherencia;
- capítulos con intención;
- cierre;
- recuerdo final;
- reanudación;
- adaptación local.

Premium no puede ser solo “más ejercicios”.

## 15.11 Primera Travesía recomendada

Título de trabajo:

> Volver al cuerpo

Siete capítulos posibles:

1. Notar la silla.
2. Crear espacio.
3. Recuperar las caderas.
4. Hombros que respiran.
5. Cambiar de ritmo.
6. Elegir una respuesta.
7. Tu ritual de regreso.

Debe integrar:

- Mueve;
- Estira;
- Respira;
- acciones editoriales;
- pausas;
- percepción;
- ritual final.

## 15.12 Gratuidad y Premium

Opciones preferidas:

- una Travesía independiente de 3 capítulos gratuita;
- una Travesía completa de 7 Premium.

Evitar presentar una Travesía de siete capítulos y cortar inesperadamente después del segundo.

## 15.13 Progreso

Guardar mediante IDs estables:

```text
journeyId
journeyVersion
currentChapterId
completedChapterIds
startedAt
lastOpenedAt
completedAt
chapterResponses
```

No depender de índices.

## 15.14 Accesibilidad

El mapa debe tener:

- alternativa en lista;
- navegación de teclado;
- etiquetas textuales;
- progreso textual;
- estado de capítulo;
- reduced motion;
- contraste;
- foco visible.

El mapa no puede ser la única forma de comprender el progreso.

## 15.15 Atlas

Idea futura:

> Atlas

Una colección visual de:

- mapas completados;
- láminas;
- sellos;
- fechas;
- frases finales.

Aporta permanencia sin puntos o monedas.

---

# 16. Retención y continuidad

PACE no debe intentar que la persona pase más tiempo dentro de la app.

Debe conseguir que vuelva porque le ayuda.

## 16.1 Bucle principal

```text
Foco
→ pausa natural
→ recomendación concreta
→ actividad
→ feedback opcional
→ recomendación futura mejor
```

## 16.2 Diario

- continuar Travesía;
- retomar Camino;
- recomendación;
- acción directa;
- cierre opcional.

## 16.3 Semanal

- ritmo semanal;
- equilibrio Foco/Respira/Cuerpo;
- observación neutral;
- recomendación.

## 16.4 Largo plazo

- Travesías;
- Atlas;
- Caminos;
- sellos;
- personalización;
- aprendizaje de qué ayuda.

## 16.5 Evitar

- “te echamos de menos”;
- rachas perdidas;
- push por defecto;
- urgencia;
- progreso destruido;
- objetivos obligatorios;
- premios en ráfaga.

---

# 17. Pausa PACE y eventos

## 17.1 Pausa PACE

El BreakMenu debe evolucionar de ordenar módulos a recomendar una acción concreta.

Ejemplo:

> Llevas 50 minutos sentado. Te propongo Hombros ligeros: 4 minutos, de pie y sin material.

Debe usar:

- duración de Foco;
- actividades;
- hora;
- contexto;
- última pausa;
- feedback;
- intensidad;
- posición;
- material;
- zona corporal.

## 17.2 `pace.events.v1`

Debe implementarse antes de que pase demasiado tiempo, porque el histórico que no se emite no puede reconstruirse.

Necesario para:

- “Qué te ayuda”;
- comparaciones;
- check-in;
- recomendaciones;
- Stats;
- continuidad.

La arquitectura debe permitir:

- adaptador web/PWA;
- futuro adaptador Android;
- single writer;
- export/import;
- cero tracking remoto obligatorio.

---

# 18. Capacitor Android

## 18.1 Cuándo

No esperar hasta terminar todo el producto para abrir Android por primera vez.

Hacer pronto un spike técnico pequeño y mantener un build Android mínimo.

No completar todavía:

- Play Billing;
- migración total a SQLite;
- publicación;
- plugins innecesarios.

## 18.2 Problema de build actual

Capacitor exige:

- `package.json`;
- directorio de build independiente;
- `index.html` dentro.

No usar:

```text
webDir: "."
```

porque empaquetaría código fuente, documentación y archivos innecesarios.

Crear:

```text
dist/
├── index.html
├── app/
├── fonts/
├── icons/
└── assets necesarios
```

## 18.3 Instalación futura

```bash
npm install @capacitor/core @capacitor/android
npm install --save-dev @capacitor/cli
npx cap init
npx cap add android
```

Configuración conceptual:

```text
App name: PACE
App ID: com.ezradesign.pace
Web directory: dist
```

El App ID debe decidirse antes de publicar.

## 18.4 Flujo

```bash
npm run build:web
npx cap sync android
npx cap open android
```

Claude Code puede modificar el repositorio.

Android Studio es necesario para:

- compilar;
- ejecutar;
- depurar;
- configurar SDK;
- emulador;
- dispositivo;
- firma;
- AAB;
- publicación.

## 18.5 Primera prueba

Comprobar:

- home;
- onboarding;
- modales;
- bibliotecas;
- safe areas;
- teclado;
- botón Atrás;
- audio;
- temporizador en background;
- pantalla apagada;
- persistencia;
- export/import;
- offline;
- orientación;
- ciclo de vida;
- tamaño;
- actualización;
- accesibilidad;
- dispositivo real.

## 18.6 Runtime

Distinguir:

```text
web
pwa
standalone
capacitor-android
```

Adaptadores:

| Función | Web/PWA | Android |
|---|---|---|
| Persistencia | localStorage/IndexedDB | Preferences/SQLite |
| Eventos | adaptador web | SQLite |
| Compra | Merchant of Record | Play Billing |
| Actualización | service worker | Google Play |
| Exportación | descarga | Filesystem/Share |
| Notificaciones | web | Local Notifications |
| Offline | cache | bundle local |
| Back | navegador | Android back |

## 18.7 Service worker en Android

Auditar para que el runtime Capacitor no dependa del service worker web ni intente aplicar el mismo mecanismo de actualización.

---

# 19. Logos y arte

Distinguir:

- logo PACE;
- vaca/mascota;
- logos de módulos;
- glifos de ejercicios;
- diagramas técnicos;
- glifos de logros;
- mapas;
- láminas de Caminos.

No rediseñar todo simultáneamente.

Orden:

- taxonomía;
- lenguaje de módulos;
- glifos;
- diagramas;
- mapas;
- logos definitivos.

Mantener coherencia:

- papel;
- tinta;
- colores cálidos;
- trazo artesanal;
- sin estética genérica de wellness;
- sin emojis;
- sin iconografía de fitness agresiva.

---

# 20. Preparación para venta

Antes del primer cobro:

- CI;
- smoke tests;
- tests del state;
- migraciones;
- import/export;
- accesibilidad;
- focus traps;
- i18n;
- pseudolocalización;
- paridad ES/EN;
- revisión de privacidad;
- Términos;
- revisión legal;
- revisión profesional del contenido corporal;
- QA de licencia;
- QA de compra;
- reinstalación;
- cambio de fecha;
- restauración;
- Play Billing;
- landing;
- ficha Play;
- ASO;
- beta cerrada;
- soporte.

---

# 21. Orden recomendado revisado

Este orden es una PROPUESTA y debe reconciliarse con el roadmap gobernante antes de editarlo.

## Fase A — Red de seguridad

1. CI.
2. Build limpio.
3. Smoke test de `index.html`.
4. Consola sin errores.
5. Auditorías de catálogos/assets/i18n.
6. Service worker.
7. Protección de `main` o despliegue condicionado.

## Fase B — Copy y coherencia documental

1. Onboarding.
2. “Siempre gratis”.
3. “Sin paywall”.
4. “Sin servidor”.
5. Copy de soporte.
6. Contradicciones de Premium.
7. Android v1/v2.
8. README.
9. Versiones.
10. Histórico claramente marcado.

## Fase C — Spike Capacitor

1. Crear `dist`.
2. Añadir Capacitor en rama.
3. Abrir Android.
4. Probar dispositivo/emulador.
5. Documentar bloqueantes.
6. Mantener build mínimo.

## Fase D — Cerrar Mueve y Estira

1. Arte pendiente.
2. Glifos ausentes.
3. Glifos dudosos.
4. Diagramas.
5. Rutina piloto rediseñada.
6. Descripciones.

- adaptaciones;
- cierre perceptivo;
- revisión profesional.

## Fase E — Bibliotecas móviles

1. Estira como piloto.
2. Mueve.
3. Respira.

- categorías sticky;
- filtros;
- tarjetas compactas;
- Tus rutinas;
- scroll y accesibilidad.

## Fase F — Eventos y Pausa PACE

1. `pace.events.v1`.

- adaptador web;
- export/import;
- feedback;
- recomendador;
- Stats.

## Fase G — Home y sidebar

1. Resolver de continuidad.
2. `ContinuityCard`.

- conservar orden desktop/móvil;
- amanecer;
- geometría móvil;
- sidebar orientada a continuar;
- eliminar rachas y récords donde corresponda.

## Fase H — Caminos

- contrato;
- Semilla;
- Pausa;
- Ritual;
- pasos editoriales;
- hitos;
- láminas;
- cierres;
- validación;
- resto del catálogo.

## Fase I — Travesías

- contrato de datos;
- progreso;
- versionado;
- reanudación;
- mapa móvil;
- mapa escritorio;
- Travesía gratuita de 3;
- Travesía Premium de 7;
- integración home/sidebar;
- logros;
- Atlas futuro.

## Fase J — Premium real

1. `PurchaseAdapter`.
2. Merchant of Record.
3. Worker.
4. licencia web.
5. entitlement.
6. UI.
7. restauración.
8. Play Billing.
9. QA.
10. legal.

## Fase K — Android y lanzamiento

- adaptadores nativos;
- persistencia;
- notificaciones;
- lifecycle;
- export/import;
- AAB;
- beta;
- Play Console;
- landing;
- lanzamiento.

---

# 22. Próxima acción solicitada a Claude Code

No implementar todavía toda la auditoría.

Realiza primero una sesión de auditoría documental y técnica de solo lectura:

1. Confirma HEAD, versión y árbol relevante.
2. Cruza este documento con la documentación canónica.
3. Produce una tabla:
   - punto;
   - estado;
   - archivo;
   - contradicción;
   - propuesta;
   - prioridad;
   - dependencia.
4. Identifica qué partes ya están documentadas.
5. Identifica qué decisiones son realmente nuevas:
   - ContinuityCard;
   - mapa grande de Travesías;
   - Travesías como cartografía transformable;
   - Atlas;
   - geometría móvil por bandas;
   - red de seguridad antes de más producto;
   - spike Capacitor temprano;
   - corrección de claims del onboarding;
   - infraestructura Cloudflare + Merchant of Record + Play Billing.
6. Propón cambios concretos para:
   - `AUDITORIA_SISTEMA_PACE.md`;
   - `DECISIONES_PRODUCTO.md`;
   - `ROADMAP.md`;
   - `MONETIZATION.md`;
   - `STATE.md`;
   - README;
   - copy i18n.
7. No escribas código hasta recibir aprobación.
8. No alteres el orden gobernante del roadmap silenciosamente.
9. Señala expresamente cualquier propuesta que contradiga una decisión cerrada.
10. Recomienda cuál debe ser la siguiente sesión única.

La primera sesión de implementación sugerida, salvo contradicción documental grave, es:

> Red de seguridad mínima: GitHub Actions + build + smoke test de `index.html` + fallo ante errores de consola.

Criterio de cierre:

- el artefacto publicado se construye;
- se abre en un navegador automatizado;
- la home monta;
- no existen errores de consola;
- las rutas críticas funcionan;
- un fallo bloquea CI;
- la sesión queda documentada.

---

## Nota final para ti

El repositorio sigue en **v0.80.0 / HEAD `5a258762`**, así que este bloque corresponde al estado actual comprobado. Te recomiendo pegarlo en una sesión nueva de Claude Code y pedirle primero:

> “Lee este documento, contrástalo con la repo y haz únicamente la auditoría de integración documental. No escribas código todavía.”

Así evitarás que intente implementar de una vez Travesías, CI, Capacitor, Premium y la nueva home. La primera entrega útil debería ser una **matriz de integración y contradicciones**, y después abrir una sesión separada exclusivamente para la red de seguridad.
