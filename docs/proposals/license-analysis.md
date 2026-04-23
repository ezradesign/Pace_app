# PACE · Análisis de opciones de licencia

> **Estado:** propuesta para decisión del usuario. Ningún archivo de
> licencia se ha añadido aún al repo. Este documento es solo lectura.
>
> **Qué se decide aquí:** bajo qué términos legales se publica el
> código fuente del repositorio `ezradesign/Pace_app` en GitHub.
>
> **Qué NO se decide aquí:** los términos comerciales del Lifetime
> (esos van en `MONETIZATION.md` y en la UI de compra). La licencia
> del código y la licencia comercial son capas distintas que pueden
> coexistir — ver sección "Dual licensing" al final.

---

## 1 · Punto de partida

### Lo que ya está decidido (del repo actual)

De `MONETIZATION.md` y `STATE.md / Decisiones activas`:

- **Modelo = Lifetime híbrido.** ~20 € pago único + temporadas ~5 € +
  donaciones BMC. Sin suscripción, sin backend, sin cuentas.
- **Validación offline con clave firmada.** El Lifetime se demuestra
  con una clave pública embebida en la app.
- **El core gratuito debe ser útil por sí solo.** Pomodoro, Hidrátate,
  2 iniciales de cada módulo y la mayoría de logros son gratis.
- **Privacidad total: todo local.** Sin tracking, sin analytics, sin
  cookies. Este es un pilar de marca tanto como el Pomodoro.
- **El Lifetime añade valor, no lo extrae.**

### Lo que eso implica para la licencia

- El código fuente **va a estar publicado en GitHub de todas formas**
  (ya lo está). Una licencia no "esconde" nada; decide qué puede hacer
  un tercero con lo que vea.
- No hay servidor que validar licencias contra, así que **cualquiera
  puede clonar, quitar la validación Lifetime y redistribuir una
  versión "Pro" gratis**. Esto es inevitable con un modelo offline y
  sin obfuscación.
- La licencia no es un candado técnico; es un marco legal que define
  **qué forks son legítimos** y **qué usos comerciales requieren tu
  permiso**.

---

## 2 · Criterios para elegir

Ordenados por importancia para PACE:

1. **Coherencia con la marca "abierto, local, sin trampas".** Una
   licencia restrictiva agresiva contradice el tono.
2. **Protección del Lifetime.** La licencia debe dejar claro que
   "compilar una versión sin la validación y venderla" es un abuso
   legalmente perseguible, aunque técnicamente sea trivial.
3. **Permitir contribuciones externas** sin fricción (pull requests,
   forks legítimos, estudios académicos).
4. **Compatible con redistribución personal** (el usuario puede
   descargar el `PACE_standalone.html` y usarlo donde quiera).
5. **Compatible con el frente Chrome extension / Android** del
   roadmap: la licencia no debe impedir publicar el mismo código en
   tiendas de apps.

---

## 3 · Opciones evaluadas

### 3.1 · MIT

**Qué dice:** "Puedes hacer lo que quieras con este código, incluido
venderlo, mientras incluyas el aviso de copyright."

**A favor:**
- Máxima compatibilidad con todo el ecosistema.
- Atrae contribuciones externas sin dudas.
- Encaja con "código abierto y sin trampas".

**En contra:**
- No protege nada contra un fork que quite la validación Lifetime y
  lo venda como "PACE Pro" en otra tienda. Legalmente es correcto
  mientras mantenga el aviso de copyright.
- No hay obligación de republicar mejoras.

**Encaje con Lifetime:** bajo. MIT deja la puerta abierta a que un
tercero lance una versión competidora con tu propio código.

**Veredicto:** bueno para un proyecto de hobby o librería técnica;
débil para un producto con modelo de monetización.

---

### 3.2 · Apache 2.0

**Qué dice:** lo mismo que MIT, añadiendo:
- Cláusula de patentes (si usas Apache, no puedes demandar al autor
  por patentes relacionadas con el software).
- Requisito de documentar cambios relevantes en forks.
- Atribución más formal.

**A favor:**
- Misma permisividad que MIT con un poco más de formalidad.
- Estándar en la industria (Android, Kotlin, muchos proyectos
  Google/Apache usan esta).

**En contra:**
- Mismo problema que MIT: no impide la competencia directa con tu
  propio código.

**Encaje con Lifetime:** bajo, igual que MIT.

**Veredicto:** mejor redactada que MIT para proyectos de largo
recorrido, misma debilidad comercial.

---

### 3.3 · GPL v3 (copyleft fuerte)

**Qué dice:** "Puedes usar, modificar y redistribuir este código,
pero cualquier obra derivada que redistribuyas debe estar bajo GPL
v3 también." (Incluye cláusula anti-tivoización.)

**A favor:**
- Obliga a cualquier fork público a publicar su código fuente.
- Protege contra la copia corporativa silenciosa.
- Sigue siendo "código abierto" a los ojos de todos.

**En contra:**
- Incompatible con tiendas de apps tradicionalmente hostiles
  (Apple App Store ha rechazado apps GPL históricamente — relevante
  si el roadmap Android va a iOS algún día).
- No impide que alguien haga un fork público sin la validación
  Lifetime; solo le obliga a publicarlo también bajo GPL.
- Imagen "más hostil" que MIT/Apache para contribuidores casuales.

**Encaje con Lifetime:** medio. Desincentiva la copia corporativa
pero no resuelve el problema del "fork sin validación" si el
atacante está dispuesto a publicar su fork.

**Veredicto:** buena protección contra uso corporativo sin retorno;
innecesariamente fricativa para un producto de nicho.

---

### 3.4 · AGPL v3 (copyleft de red)

**Qué dice:** como GPL v3, pero **extiende la obligación a apps que
se sirven por red**. Si alguien monta "PACE Cloud" como SaaS a partir
de tu código, tiene que publicar el suyo también.

**A favor:**
- Máxima protección del modelo "solo local".
- Una empresa que quiera hacer la versión cloud tendría que publicar
  su implementación o licenciarte el código bajo otros términos
  (dual licensing — ver §4).

**En contra:**
- Muchas empresas rechazan AGPL en política interna (Google, por
  ejemplo). Reduce el pool de posibles contribuidores corporativos.
- Mismo problema con App Store que GPL.

**Encaje con Lifetime:** alto. Hace difícil competir con una versión
SaaS gratuita de tu app.

**Veredicto:** protección fuerte pero con coste de comunidad.
Interesante solo si se prevé que alguien monte PACE en la nube.

---

### 3.5 · Sustainable Use License (estilo Sentry/PolyForm)

**Qué dice:** "Fuente abierta visible, pero prohibido uso comercial
sin permiso. Uso personal, educativo y contribuciones permitidos."

**A favor:**
- Protege directamente contra la competencia comercial con tu código.
- Permite ver y contribuir — mantiene el espíritu abierto.
- Es la licencia que usan productos con modelo similar al tuyo
  (Sentry, Cal.com, Plausible en su primera etapa).

**En contra:**
- **Técnicamente no es "open source"** según la OSI (Open Source
  Initiative) porque restringe uso comercial. Puedes llamarla
  "source-available" o "fair-code".
- Puede echar atrás a contribuidores puristas del open source.
- Requiere más pedagogía en el README para explicar qué se puede y
  qué no.

**Encaje con Lifetime:** muy alto. Directamente alineada con el
modelo.

**Veredicto:** la opción más pragmática si el objetivo real es
proteger el Lifetime. Trade-off: pierdes el etiquetado "open source"
pero ganas claridad legal.

---

### 3.6 · Elastic License 2.0

**Qué dica:** variante más simple del anterior. Prohíbe:
- Revender el software o ofrecerlo como servicio administrado.
- Eludir sistemas de licencia/protección.
- Retirar avisos de licencia, copyright o marca.

Todo lo demás (uso personal, modificaciones, distribución con
atribución) está permitido.

**A favor:**
- **Las dos cláusulas clave encajan perfectamente con PACE:**
  "no eludir la validación Lifetime" + "no revender como servicio".
- Más corta y legible que PolyForm.
- Usada por Elastic, MongoDB, Redis (desde 2024) — precedente fuerte.

**En contra:**
- Mismo estigma que PolyForm: no es OSI-approved.
- Si algún día quieres vender la empresa, algunos compradores
  prefieren licencias estándar.

**Encaje con Lifetime:** muy alto.

**Veredicto:** la candidata más fuerte para PACE. Protege lo que
importa con la menor fricción legal.

---

## 4 · Dual licensing (patrón recomendado)

Independientemente de cuál elijas como primaria, el patrón estándar
para proyectos con monetización es:

1. **Código en GitHub bajo licencia source-available o copyleft
   fuerte** (Elastic 2.0, AGPL, o Sustainable Use).
2. **Licencia comercial separada** disponible por contacto directo
   para casos que la primaria no permita (ej: una empresa que quiere
   hacer un fork privado sin la obligación de publicar).
3. **El Lifetime** es un tercer nivel: no es una licencia del código,
   es una licencia de uso del producto compilado con ciertas features
   activadas.

Este triple esquema es el que usan Sentry, PlanetScale, Cal.com, etc.

---

## 5 · Recomendación

Para PACE, **Elastic License 2.0** es la candidata más encajada:

- ✅ Alineada con "código abierto y local" (cualquiera puede leer,
  forkear, aprender).
- ✅ Protege explícitamente contra "quitar la validación Lifetime"
  (la cláusula anti-circumvention es exactamente eso).
- ✅ Protege contra reventa comercial directa ("PACE Pro" en otra
  tienda).
- ✅ Compatible con Chrome extension y publicación en tiendas de apps.
- ✅ Precedente fuerte (empresas grandes la usan).
- ⚠️ No es OSI-approved. Si te importa el etiquetado "Open Source"
  para efectos de marketing, descartada a favor de GPL v3 o
  Apache 2.0.

**Alternativa si priorizas OSI-approved:** Apache 2.0 con una nota
explícita en el README de que el uso comercial del código para
competir con el producto oficial es éticamente cuestionable pero no
legalmente prohibido — y confiar en la marca como protección.

**Alternativa si quieres máxima protección:** AGPL v3 + oferta de
licencia comercial por contacto. Más fricativa pero blinda mejor.

---

## 6 · Checklist de la sesión que implemente esto

Cuando decidas:

1. Añadir `LICENSE` en la raíz con el texto oficial de la licencia
   elegida.
2. Añadir `NOTICE` si la licencia lo requiere (Apache 2.0 sí).
3. Añadir sección "License" al `README.md` con:
   - Licencia del código (con enlace a `LICENSE`).
   - Nota sobre el Lifetime como licencia comercial separada.
   - Contacto para licencias comerciales alternativas si aplica.
4. Añadir cabecera de copyright a los archivos fuente principales
   (opcional pero recomendado). Patrón típico:
   ```
   /* PACE · Foco · Cuerpo
      Copyright © 2026 ezradesign
      Licensed under [licencia elegida] — see LICENSE
   */
   ```
5. Actualizar `STATE.md / Decisiones activas` con la decisión.
6. Bump de versión (patch si es solo añadir LICENSE; minor si cambia
   de ausencia a presencia efectiva — pre-v1.0 da flexibilidad).

---

## 7 · Preguntas para el usuario

Antes de elegir, responde a esto:

1. **¿Te importa el etiquetado "Open Source" certificado por OSI** o
   basta con que el código sea visible y forkeable?
2. **¿Crees que habrá contribuidores externos relevantes** antes de
   v1.0? (Si la respuesta es "probablemente no", los costes de
   licencias restrictivas bajan.)
3. **¿Planeas algún día vender la empresa o recibir inversión**? (Si
   sí, Apache 2.0 o dual-licensing son más atractivos para compradores.)
4. **¿Te ves algún día negociando licencias comerciales individuales**
   con empresas que quieran usar PACE internamente? (Si sí, Elastic
   2.0 o AGPL facilitan esa conversación.)
5. **¿Te importa que Apple App Store** acepte sin fricción un futuro
   port a iOS? (Si sí, evitar GPL/AGPL.)

Con esas respuestas se puede cerrar la decisión en 15 minutos en la
siguiente sesión.
