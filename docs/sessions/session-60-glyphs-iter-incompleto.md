# Sesion 60 -- 2026-05-11 -- refactor(glyphs): iteracion parcial 13/46

**Version:** v0.28.0 -> v0.28.1
**Estado:** **INCOMPLETA** -- pausada por el usuario tras 3 tandas de
iteracion sin convergencia plena. Pendiente reanudar.

---

## Punto de partida

Cierre de s59 entrego 46 glifos abstractos line-art (viewBox 44, stroke 1.8,
currentColor) en `app/glyphs/exercise-glyphs.jsx`. Granularidad por paso
individual, no por rutina. Build limpio, todos los keys intactos.

Feedback del usuario al abrir s60: "los glifos no comunican el ejercicio
a alguien sin contexto previo, son demasiado abstractos. Quiero que se
parezcan al estilo de los iconos de la home (Respira/Estira/Mueve/Hidratate)
y sean orgánicos, bonitos, ilustrativos y minimalistas".

Captura de referencia adjuntada por el usuario: los 4 botones de actividad
de la home con sus iconos (pulmones, arco corporal, mancuerna, gota).

---

## Tres tandas de iteracion

### Tanda 1 -- abstraccion organica (8 glifos)

Hipotesis inicial: subir curvas Bezier, cerrar siluetas, usar metaforas
concretas (luna, enso, diafragma) en vez de geometria rigida.

Glifos rediseñados:
- `Descanso` -> luna creciente + chispa
- `Squeeze fist` -> silueta puño + nudillos + pulgar
- `Deep breaths` -> diafragma boveda + aliento ascendente
- `Wall sit` -> silueta cuerpo deslizando por pared
- `Calf raises` -> pie de perfil con dedos detalle
- `Apertura de pecho` -> dos petalos abriendose
- `Rotacion toracica` -> espiral nautilo con flecha
- `Reset respiracion` -> circulo enso zen

Build: 557 -> 555 KB, OK.

**Feedback del usuario:** "no es el estilo que esperaba, siguen sin ser
ilustrativos al ejercicio en una visual". Los iconos del home son mucho
mas claros. Imagina alguien que no sabe como va el modulo o ejercicio.

### Tanda 2 -- estrategia E (hibrida por tipo) (5 glifos)

Hipotesis: asignar a cada glifo una de 3 estrategias segun tipo:
- A: silueta del cuerpo en la postura (estilo Apple Fitness)
- B: parte del cuerpo + flecha movimiento (estilo fisio)
- C: objeto reconocible + cuerpo (estilo Strong/Caliber)

Estrategia hibrida E elegida por el usuario. Prototipos:
- `Squat profundo` (A) -> stick figure cuerpo cuclillas frontal
- `Fondos en silla` (C) -> silla + persona bajando
- `Wrist circles` (B) -> antebrazo + circulo + flecha
- `Chin tucks` (B) -> cabeza perfil + flecha retraccion
- `Chest opener` (A) -> silueta brazos extendidos

Build: 555 -> 556 KB, OK.

**Feedback del usuario:** "no funciona, revisa bien de que va cada
ejercicio para que el glifo pueda ser ilustrativo y claro manteniendo el
estilo de los iconos que te muestro". Sigue sin lograrlo.

### Tanda 3 -- minimalismo radical, 4 patrones canonicos (5 glifos)

Realizacion clave: los iconos del home NO son stick figures con cabeza+
torso+brazos+piernas. Reducen el cuerpo a UNA forma (Estira = arco) o
muestran el objeto solo (Mueve = mancuerna) o la parte aislada (Respira =
pulmones) o la sustancia (Hidratate = gota). **Max 5 elementos**.

Cuatro patrones definidos:
1. **Cuerpo como forma** (compuesto: 1 curva + cabeza puntito + suelo opt)
2. **Objeto solo** (sin cuerpo)
3. **Parte del cuerpo aislada** (zoom anatomico)
4. **Metafora pura** (solo descanso/respiracion)

Cada glifo entra en UNO de los 4. Sin mezclar.

Prototipos minimalistas:
- `Squat profundo` (1) -> arco M sobre suelo + cabeza punto -- **3 elementos**
- `Fondos en silla` (2) -> silla en perfil sin persona -- **4 elementos**
- `Wrist circles` (3) -> brazo + mano + circulo -- **3 elementos**
- `Chin tucks` (3) -> cabeza perfil + nariz + columna + chin -- **4 elementos**
- `Chest opener` (1) -> T-pose: cabeza + torso + 2 arcos brazo -- **4 elementos**

Build: 556 KB, OK.

**Feedback del usuario:** "dejemos esta sesion por el momento, vamos a otra
cosa, cierra para hacer commit y una pausa". Sesion pausada antes de cerrar
el ciclo de iteracion.

---

## Estado final

### En disco (v0.28.1)

- **13 glifos rediseñados:**
  - **Estilo final aprobable (patron 4 metafora):** Descanso, Reset respiracion, Deep breaths
  - **Estilo final minimalista radical (patrones 1/2/3):** Squat profundo, Fondos en silla, Wrist circles, Chin tucks, Chest opener
  - **Estilo intermedio (tanda 1, pendiente refinar al patron correcto):** Squeeze fist, Wall sit, Calf raises, Apertura de pecho, Rotacion toracica
- **33 glifos sin tocar:** mismo estilo abstracto de s59.

### En backups

- `backups/PACE_standalone_v0.28.0_20260511.html` -- rotacion automatica.

### Versionado

- `app/state-core.jsx`: PACE_VERSION = 'v0.28.1'
- `PACE.html`: titulo v0.28.1
- Comentario header `app/glyphs/exercise-glyphs.jsx`: sesion 60 / v0.28.1

---

## Cuando se retome

### Prioridad ALTA -- cerrar el ciclo de validacion

1. Mostrar los 5 glifos minimalistas (Squat profundo, Fondos en silla,
   Wrist circles, Chin tucks, Chest opener) al usuario en navegador real
   y validar si el lenguaje funciona.
2. Si funciona: propagar los 4 patrones a los **33 glifos sin tocar** + 5
   intermedios pendientes de refinar = **38 glifos restantes**.
3. Si no funciona: nueva direccion (esta tercera tanda fue minimalismo
   maximo, queda poco margen para mas reduccion).

### Asignacion tentativa de los 38 restantes a los 4 patrones

**Patron 1 -- cuerpo como forma:**
Flexiones inclinadas, Wall sit (refinar), Seated hollow, Thoracic extension,
Flexor de cadera, World's greatest stretch, Cossack squat, 90/90, Pigeon,
Puente con marcha, ATG split squat, Nordics, Sissy squat, Elephant walk,
Deep squat hold, Crawling, Ground sitting transitions, Inclinacion lateral.

**Patron 2 -- objeto solo:**
Dead hang, Hang pasivo, Band pull-apart, Scapular wall slides.

**Patron 3 -- parte aislada:**
Squeeze fist (refinar -> patron 3 mano sola), Finger extension, Wrist
stretch, Cuello y trapecios, Rotacion lenta, Escalenos, Shrug + round,
Ankle circles, Tibialis raise, Calf raises (refinar), Scapular squeeze,
Chest opener (ya hecho), External rotation.

**Patron 4 -- metafora:**
Apertura de pecho (refinar -> patron 4?), Rotacion toracica (refinar),
Rib pull + respiracion, Seated twist.

### Reglas de oro destiladas

- Maximo 5 elementos visuales por glifo (referencia: home icons 2-5).
- Cabeza siempre como circulo puntito pequeño, NUNCA grande con cara.
- Cuerpo como UNA curva continua, no concatenacion de segmentos cabeza/
  torso/extremidades.
- Suelo dashed (`strokeDasharray="1.5 2.5"` opacity 0.35) **solo** cuando
  ancla algo (cuerpo en piso, postura grounded). Quitar de objetos y
  partes aisladas.
- NO añadir flechas explicativas salvo en muy pocos casos (Wrist circles
  considero quitarla, Chin tucks ahora no tiene).
- NO añadir detalle interior si no aporta (knuckle bumps, finger detail,
  feet bumps -- casi siempre saturan).

---

## Decisiones que persisten

- **Granularidad por paso (`step.name`):** mantener. La key sigue siendo
  el nombre canonico en español.
- **viewBox 44 / stroke 1.8 / currentColor:** mantener. Proporcionalmente
  equivalente al stroke 1.2 sobre viewBox 28 de los iconos home.
- **`<G>` helper:** mantener tal cual.
- **4 patrones canonicos:** NUEVO -- decision de esta sesion. Documentar
  en `exercise-glyphs.jsx` cuando se cierre el ciclo.

---

## Lecciones

- **Cuando se itera estilo visual, prototipar 5-6 en multiples direcciones
  ANTES de redibujar masivamente.** Esta sesion redibujo 13 glifos en 3
  estilos distintos sin convergir -- ineficiente.
- **El usuario referenciaba los iconos del home desde el principio.**
  Tarde demasiadas iteraciones en entender que el patron real era "cuerpo
  reducido a UNA forma" (como Estira = arco), no "cuerpo dibujado con
  detalle". Lectura mas atenta de la referencia inicial habria ahorrado
  tiempo.
- **Pausa solicitada por el usuario es legitima.** No forzar cierre cuando
  el ciclo no convirgio -- documentar bien y reanudar fresh.
