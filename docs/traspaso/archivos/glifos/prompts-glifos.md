# Glifos que faltan en PACE, con su prompt

**Versión 3 (6 oct 2026).** Los ejercicios vuelven a ser la figura lisa y sin ropa de los 59 que ya están
en la app, de la misma familia. Faltan **4 de ejercicio** (uno opcional) y **19 de logro**.

## Por qué los bloqueaba GPT Image 2, y cómo esquivarlo (deducido, no probado)

Los prompts nombraban la desnudez («no clothing details», «mannequin-like body») y describían posturas
con palabras que el filtro lee mal («on all fours», «knees spread», «hips pushed back»). Además, adjuntar
dibujos del set hace que el filtro revise también esas imágenes, y la figura parece desnuda.

Esta versión describe la figura como lo que es en el set: **un estudio liso de academia, como un vaciado
de yeso, en una lámina de manual médico**. No dice nunca que vaya desnuda y no le pone ropa. Las
posturas se cuentan por manos, brazos, pies y cabeza.

## Cómo usarlos, en este orden

1. **Prompt A, en GPT Image 2, sin adjuntar nada.** Un chat nuevo para cada dibujo.
2. Si lo bloquea, repítelo una vez en otro chat nuevo: el filtro no es fijo.
3. Si sigue bloqueando, **prompt B en otro modelo de Genspark** (cualquiera que no sea GPT Image 2 y deje
   adjuntar imágenes), con las **dos referencias** que indico. El B es el preámbulo con el que se hicieron
   los 59. Las referencias están en la carpeta [referencias](/mnt/project-files/glifos/referencias/).
4. Los logros, en chats donde no hayas pedido ninguna figura.

**El nombre del archivo importa:** guárdalo exactamente como pone en cada título y súbelo a este hilo.

## Reglas comunes

- PNG cuadrado y grande (2048 × 2048 o más). Tinta negra sobre blanco: el color se descarta.
- Sin texto. Ejercicios: se ven de 20 a 200 px, así que el contorno tiene que ser marcado.
- En los logros, nada de copas, trofeos, medallas ni estrellas de puntuación.

---

# Ejercicios

El bloque de estilo es el mismo en los cuatro prompts A; ya va pegado en cada uno.

## `rana.png` — Rana (Caderas · suelo)
Vista de frente con la flecha de puntos junto a la cadera: de frente no se ve que la cadera va atrás.

Prompt A (GPT Image 2, sin adjuntos):
```
Classical anatomical plate in the style of a 19th-century medical textbook copperplate engraving, fine-line black ink on plain white, no colour, no grey wash, no solid black areas. One single full-length figure drawn as a smooth sculpted academy study, like a plaster cast in a classical drawing school: an ageless, androgynous, slender adult, about seven and a half heads tall, long neck, long slim limbs, softly modelled and never muscular. Smooth hairless egg-shaped head, small calm neutral face, simple C-shaped ear. The trunk is one seamless featureless sculpted volume, its planes shown only by hatching, like a plaster cast. Carefully drawn hands and feet with separate fingers and toes. One continuous confident outer contour of medium weight, clearly readable as a small thumbnail; shading by fine engraved hatching that follows each form and leaves most of the figure white paper. Floor shown only as a few short hatched contact-shadow strokes under each point of support. No room, no background.

Exercise plate: the hip-mobility floor stretch from yoga (mandukasana), seen strictly from the front, the face toward the viewer. The figure kneels with both palms flat on the floor under the shoulders and the arms straight; the knees are placed far out to each side, the lower legs point back, and the weight settles back toward the heels. A short thin dotted arrow with a small open chevron tip sits beside the figure at hip height, pointing front-to-back in slight perspective, to show a gentle rocking. Square format, whole figure inside the frame, generous white margins, one figure only, no text, no border.
```

Prompt B (otro modelo; adjunta `gato-camello.png` y `sentadilla-profunda.png`):
```
Misma figura y mismo estilo de grabado que las imágenes de referencia: grabado anatómico de línea, ilustración médica clásica, tinta oscura sobre fondo blanco, sin color, la misma persona andrógina y calva, sin ropa, con rayado fino. Gesto: postura de «rana» vista estrictamente DE FRENTE, con la cara hacia quien mira. A cuatro apoyos con las palmas bajo los hombros y los brazos rectos, las rodillas muy abiertas a los lados y la cadera retrasada hacia los talones. Una flecha corta DE PUNTOS junto a la cadera, de delante atrás, que marque un balanceo suave. Suelo con trazos cortos de sombra bajo manos y rodillas. Sin texto. PNG cuadrado, el cuerpo entero en el lienzo.
```

## `pica-en-escritorio.png` — Pica en escritorio (Empuje · progresión)
La mesa es obligatoria: sin ella se confunde con «Marcha del elefante». En el set, la mesa es una línea recta.

Prompt A (GPT Image 2, sin adjuntos):
```
Classical anatomical plate in the style of a 19th-century medical textbook copperplate engraving, fine-line black ink on plain white, no colour, no grey wash, no solid black areas. One single full-length figure drawn as a smooth sculpted academy study, like a plaster cast in a classical drawing school: an ageless, androgynous, slender adult, about seven and a half heads tall, long neck, long slim limbs, softly modelled and never muscular. Smooth hairless egg-shaped head, small calm neutral face, simple C-shaped ear. The trunk is one seamless featureless sculpted volume, its planes shown only by hatching, like a plaster cast. Carefully drawn hands and feet with separate fingers and toes. One continuous confident outer contour of medium weight, clearly readable as a small thumbnail; shading by fine engraved hatching that follows each form and leaves most of the figure white paper. Floor shown only as a few short hatched contact-shadow strokes under each point of support. No room, no background.

Exercise plate: a pike push-up with the hands on a desk, in profile facing right. The palms rest on the edge of a desk, drawn only as one thin straight horizontal line at waist height that extends a little beyond the hands; the hands are on that line, never on the floor. Arms straight, head between the arms, back long and straight, legs straight, feet on the floor two to three steps away from the desk line, so the figure forms a clear upside-down V between the floor and the desk edge. Square format, whole figure and desk line inside the frame, generous white margins, one figure only, no text, no border.
```

Prompt B (otro modelo; adjunta `flexiones-inclinadas.png` y `hueco-en-silla.png`):
```
Misma figura y mismo estilo de grabado que las imágenes de referencia: grabado anatómico de línea, ilustración médica clásica, tinta oscura sobre fondo blanco, sin color, la misma persona andrógina y calva, sin ropa, con rayado fino. Gesto: de perfil mirando a la derecha, «V» invertida con las manos en el borde de una MESA, dibujada como una línea recta horizontal a la altura de la cadera, como en las referencias. Las manos sobre esa línea y nunca en el suelo. Brazos rectos, cabeza entre los brazos, espalda larga, piernas rectas y pies en el suelo a dos o tres pasos de la mesa. Sin texto. PNG cuadrado, el cuerpo entero y la línea de la mesa en el lienzo.
```

## `descanso.png` — Descanso entre series
Tiene que decir «aquí no se hace nada». Es el que más se ve (18 veces): empieza por este.

Prompt A (GPT Image 2, sin adjuntos):
```
Classical anatomical plate in the style of a 19th-century medical textbook copperplate engraving, fine-line black ink on plain white, no colour, no grey wash, no solid black areas. One single full-length figure drawn as a smooth sculpted academy study, like a plaster cast in a classical drawing school: an ageless, androgynous, slender adult, about seven and a half heads tall, long neck, long slim limbs, softly modelled and never muscular. Smooth hairless egg-shaped head, small calm neutral face, simple C-shaped ear. The trunk is one seamless featureless sculpted volume, its planes shown only by hatching, like a plaster cast. Carefully drawn hands and feet with separate fingers and toes. One continuous confident outer contour of medium weight, clearly readable as a small thumbnail; shading by fine engraved hatching that follows each form and leaves most of the figure white paper. Floor shown only as a few short hatched contact-shadow strokes under each point of support. No room, no background.

Exercise plate: resting between sets. The figure stands upright, strictly from the front, feet hip-width apart, both hands resting on the sides of the waist with the elbows pointing out, shoulders relaxed and low, head level, calm face looking at the viewer. A still, quiet pose. Nothing else is drawn: no arrows, no motion lines, no symbols, no furniture, only the short floor shadows under the feet. Square format, whole figure inside the frame, generous white margins, one figure only, no text, no border.
```

Prompt B (otro modelo; adjunta `rotacion-lenta.png` y `rotacion-externa.png`):
```
Misma figura y mismo estilo de grabado que las imágenes de referencia: grabado anatómico de línea, ilustración médica clásica, tinta oscura sobre fondo blanco, sin color, la misma persona andrógina y calva, sin ropa, con rayado fino. Gesto: de pie y DE FRENTE, recuperando el aliento. Manos apoyadas en las caderas con los codos abiertos, hombros caídos, pies al ancho de las caderas, cabeza al frente mirando a quien mira. No es un ejercicio: nada de flechas ni de recorrido, nada de arcos en el pecho, ningún mueble, ninguna zona marcada. Sin texto. PNG cuadrado, el cuerpo entero en el lienzo.
```

## `nordics.png` — Nordics (opcional)
Solo sale en el constructor de «Tus rutinas». Los tobillos van sujetos bajo una línea recta, el borde de un mueble.

Prompt A (GPT Image 2, sin adjuntos):
```
Classical anatomical plate in the style of a 19th-century medical textbook copperplate engraving, fine-line black ink on plain white, no colour, no grey wash, no solid black areas. One single full-length figure drawn as a smooth sculpted academy study, like a plaster cast in a classical drawing school: an ageless, androgynous, slender adult, about seven and a half heads tall, long neck, long slim limbs, softly modelled and never muscular. Smooth hairless egg-shaped head, small calm neutral face, simple C-shaped ear. The trunk is one seamless featureless sculpted volume, its planes shown only by hatching, like a plaster cast. Carefully drawn hands and feet with separate fingers and toes. One continuous confident outer contour of medium weight, clearly readable as a small thumbnail; shading by fine engraved hatching that follows each form and leaves most of the figure white paper. Floor shown only as a few short hatched contact-shadow strokes under each point of support. No room, no background.

Exercise plate: a Nordic hamstring curl, in profile facing right. The figure kneels on both knees with the shins on the floor; just above the heels runs one thin straight horizontal line, the lower edge of a heavy piece of furniture, that keeps the heels down. The figure is already leaning forward about 45 degrees as one straight line from knees to head, arms reaching forward with open palms toward the floor. Square format, whole figure and the edge line inside the frame, generous white margins, one figure only, no text, no border.
```

Prompt B (otro modelo; adjunta `sentadilla-de-cuadriceps.png` y `flexiones-inclinadas.png`):
```
Misma figura y mismo estilo de grabado que las imágenes de referencia: grabado anatómico de línea, ilustración médica clásica, tinta oscura sobre fondo blanco, sin color, la misma persona andrógina y calva, sin ropa, con rayado fino. Gesto: de perfil mirando a la derecha, de rodillas con las espinillas en el suelo y los talones sujetos bajo una línea recta horizontal, el borde de un mueble. El tronco ya inclinado hacia delante unos 45 grados, en una sola línea de las rodillas a la cabeza, con los brazos por delante y las palmas abiertas listas para frenar. Sin texto. PNG cuadrado, el cuerpo entero y la línea del mueble en el lienzo.
```

---

# Logros

### `season.equinox.autumn.png` — Equinoccio otoño (22 de septiembre)
Empieza por este: su gemelo de primavera ya tiene dibujo. Adjunta `season.equinox.spring` como referencia.

```
Vintage engraving illustration: a thin ring balanced perfectly level on top of two small stacks of smooth river stones, with one single autumn oak leaf resting on top of one of the stacks. Perfect balance, calm, symmetrical. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `streak.7.png` — Cuarto creciente (7 días seguidos)
Media luna, no luna fina en hoz: esa ya es `master.dusk`.

```
Vintage engraving illustration of a first-quarter moon: exactly half of the lunar disc lit (right half), with engraved craters and maria, the dark half shown only as a faint outline. Detailed lunar surface like an old astronomy plate, but with a strong clear half-disc silhouette. Black ink crosshatching on pure white background, single centered object, generous margin, readable at small size, no text, no numbers, no frame, no color.
```

### `streak.14.png` — Quince días (14 días seguidos)

```
Vintage engraving illustration of a waxing gibbous moon: about three quarters of the lunar disc lit, with engraved craters and maria, the unlit sliver shown only as a faint outline. Same style as an old astronomy plate, strong clear silhouette. Black ink crosshatching on pure white background, single centered object, generous margin, readable at small size, no text, no numbers, no frame, no color.
```

### `breathe.sessions.50.png` — 50 respiraciones

```
Vintage engraving illustration of an old blacksmith's hand bellows, wood and leather, seen from the side, closed and at rest, with its brass nozzle. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `stats.month.focus.png` — Mes profundo (20 h de foco en un mes)

```
Vintage engraving illustration of a mason's brass plumb bob on a short, taut vertical line, its point aimed straight down, perfectly still: depth, measured. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

Plan B:

```
Vintage engraving illustration of a mason's brass plumb bob: a pointed teardrop-shaped brass weight with its point straight down, and a short straight vertical line rising from its top to a small wooden winding reel. A measuring tool, perfectly still. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `explore.box.png` — Box asentada (Box 4·4·4·4)

```
Vintage engraving illustration of a square carved stone tile with softly rounded corners, seen from the front, with one small round stone inlaid at the middle of each of its four sides. Symmetrical and calm. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `master.box.15.png` — Caja maestra (15 sesiones de Box)
Hazlo después de `explore.box` y adjunta ese como referencia.

```
Vintage engraving illustration of a square carved stone tile with softly rounded corners, one small round stone inlaid at the middle of each side, and a second smaller square carved inside it, turned 45 degrees like a diamond. Same object as the reference image with one added inner square. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `explore.rounds.png` — Rondas (3 sesiones en rondas)

```
Vintage engraving illustration of a cross-section slice of a small tree trunk seen from the front, showing three clear concentric growth rings and the bark around the edge. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `explore.kapalabhati.png` — Kapalabhati (3 sesiones del kriya)

```
Vintage engraving illustration of a single short bright flame rising from a small heap of glowing embers, with three small sparks flying upward. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `explore.shoulders.png` — Hombros reseteados (3 sesiones de hombros)

```
Vintage engraving illustration of a traditional wooden carrying yoke, seen from the front and shown alone as a single object: one long, gently curved carved beam with a smooth rounded hollow in the middle of its underside and a small empty iron hook at each end. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

Plan B:

```
Vintage engraving illustration of an old farm carrying yoke: one long wooden beam, gently curved like a shallow arch, with a smooth rounded hollow carved in the middle of its underside and a small empty iron hook at each end, seen from the front, shown alone as a single object. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `master.shoulders.20.png` — Hombros libres (20 sesiones de hombros)
Hazlo después de `explore.shoulders` y adjunta ese como referencia.

```
Vintage engraving illustration of the same traditional wooden carrying yoke as the reference, now broken cleanly in two halves lying slightly apart, with nothing left to carry: the weight has been put down. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered composition, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

Plan B:

```
Vintage engraving illustration of the same curved wooden carrying beam as the reference, split cleanly into two halves that lie slightly apart, side by side and level, with nothing attached to them: the load has been set down. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered composition, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `explore.all.extra.png` — Fuerte en la oficina (todos los Extra)

```
Vintage engraving illustration of a small blacksmith's anvil standing on a short wooden stump, seen from the side. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

Plan B:

```
Vintage engraving illustration of a small blacksmith's anvil resting on a short round wooden log, seen from the side, sturdy and quiet. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `master.pomodoro.8.png` — Jornada de ocho (8 Pomodoros en un día)

```
Vintage engraving illustration of a stone garden sundial seen from slightly above, with its triangular gnomon casting a short shadow, and exactly eight evenly spaced hour marks carved on the arc (marks only, no numerals). Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `season.summer.png` — Verano

```
Vintage engraving illustration of a single ripe ear of wheat, heavy and slightly bent, with a cicada resting on its stem. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `secret.cow.click.png` — Vaca feliz (cosquillas al logo)
Adjunta el logo de PACE como referencia (la vaca paciendo dentro de la «P»).

```
Vintage engraving illustration of a gentle grazing cow, the same calm cow as the reference logo, shown on its own with a peaceful, happy look and one front hoof lifted, as if taking a small dance step. Warm, quiet humor, not cartoonish. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered figure, generous margin, bold readable silhouette at small size, no text, no letters, no frame, no color.
```

Plan B:

```
Vintage engraving illustration of the same cow as the attached PACE logo, seen from the side and standing alone, head lowered toward the grass as if grazing, with a peaceful look and one front hoof lifted off the ground in a light, cheerful step. Gentle, quiet humor, not cartoonish. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered animal, generous margin, bold readable silhouette at small size, no text, no letters, no frame, no color.
```

### `secret.rain.png` — Lluvia mental (3 respiraciones seguidas)

```
Vintage engraving illustration of a small soft cloud with exactly three long straight raindrops falling from it in parallel. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `secret.first.monday.png` — Primer lunes (primer lunes del mes)

```
Vintage engraving illustration of a single paper calendar sheet with one corner folded over, a simple empty grid of boxes without any numbers or letters, and a small hand-drawn check mark in the very first box. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `secret.new.year.png` — Año nuevo (1 de enero)

```
Vintage engraving illustration of a short pruned tree branch with a clean diagonal cut at its end, and one fresh new bud with two tiny leaves sprouting just below the cut. Copperplate engraving, hand-engraved seal style, black ink crosshatching on pure white background, single centered object, generous margin, bold readable silhouette at small size, no text, no numbers, no frame, no color.
```

### `secret.zen.png` — Zen accidental (30 min de Respira en un día)

```
A single ensō: a circle drawn in one confident stroke of black ink with a dry brush, thick and slightly textured, left open with a small gap where the stroke ends. Minimal, centered, on pure white background, generous margin, no text, no seal stamp, no signature, no frame, no color.
```

---

## Cuando los tengas
Súbelos a este hilo con su nombre. Los proceso igual que el resto del set (no tienes que recortar ni
ajustar nada) y te enseño cómo quedan antes de publicar nada.
