# Prompts de audio: la voz de Mueve y Estira

15 de noviembre de 2026, sobre la 0.205.0. **Elegido por Ez (15 nov.): 1A 2A 3A 4A 5A 6A 7A, «y sí, todos los números seguidos»**: se graba por tomas, no un audio por palabra. Lo pidió Ez el 15 nov.: «Voz en Mueve y Estira, y vibración al
ritmo de las repeticiones. Me encargo yo de las voces con los prompts que me des para genspark». Es el
diseño: las preguntas y las fotos están en `index.html`, en esta misma carpeta. Este archivo
vale para lo elegido.

Los encargos de voz anteriores, con el mismo formato: `docs/traspaso/archivos/encargos-14oct/PROMPTS_AUDIO.md`
y `encargos-16oct/PROMPTS_AUDIO_SUSPIRO.md`.

## Lo que dice la voz

Dice lo que ya dice la pantalla, en el momento en que hoy suena un cuenco o una madera. Nada más.

| Momento | Hoy suena | La voz dice |
|---|---|---|
| Un ejercicio nuevo que pide colocarse | un cuenco | «Colócate» |
| Un ejercicio nuevo que empieza sin colocarse | un cuenco | «Siguiente» |
| Al acabar la cuenta de colocarse, y en la otra serie del mismo ejercicio tras un descanso | el cuenco agudo «¡ya!» o un cuenco | «Ya» |
| El último paso de la rutina | un cuenco | «Último paso» |
| Empieza un lado | el cuenco agudo | «Izquierda» o «Derecha» |
| Cambia de lado | dos cuencos | «Cambia de lado» |
| Descanso | un cuenco grave | «Descansa» |
| Cada repetición guiada, al acabarla | una madera suave | «Uno», «Dos»… hasta «Veinticinco» |
| Los tres últimos segundos de cualquier cuenta | una madera por segundo | «Tres», «Dos», «Uno» (su propia toma) |
| Fin de la rutina | tres cuencos | (los tres cuencos de siempre) |

No dice las colocaciones, las acciones ni los «Cuídate», que siguen escritos; ni «baja» o «sube», porque
el dato no dice en qué orden va cada movimiento; ni ánimos, ni consejos de salud nuevos. Sin «Auto» no
cuenta las repeticiones, porque no hay ritmo que contar.

Si a una voz le falta un archivo, en ese momento suena el cuenco o la madera de hoy. Por eso se puede
grabar por tandas y montar cada tanda en cuanto llega.


## Cuatro tomas por voz y por idioma, 16 en total

Las mismas dos voces que Respira, para que suene a PACE: **sulafat** (la «Voz clara») y **bradford** (la
«Voz grave»). Cada voz graba cuatro tomas en castellano y cuatro en inglés. Cada toma es un solo audio con
varias frases, una por línea y con un silencio entre ellas. El guion `scripts/voz-cuerpo-tomas.js` las
corta por los silencios, recorta los bordes, iguala el volumen con el de Respira y escribe cada palabra
con su nombre: 36 archivos por voz e idioma, 144 en total.

| Toma | Archivo que entregas | Lo que dice | Palabras |
|---|---|---|---|
| Números | `VOZ-IDIOMA-numeros.mp3` | del uno al veinticinco | 25 |
| Cuenta atrás | `VOZ-IDIOMA-cuenta.mp3` | tres, dos, uno | 3 |
| Avisos | `VOZ-IDIOMA-avisos.mp3` | Colócate, Siguiente, Ya, Último paso | 4 |
| Lados y descanso | `VOZ-IDIOMA-lados.mp3` | Izquierda, Derecha, Cambia de lado, Descansa | 4 |

`VOZ` es `sulafat` o `bradford`, e `IDIOMA` es `es` o `en`: `sulafat-es-numeros.mp3`,
`bradford-en-lados.mp3`, y así. MP3 o WAV, como salga de Genspark.

La cuenta atrás va aparte de los números porque suena distinto: van un segundo detrás de otro y cada
palabra tiene que durar menos de 0,85 s. Los números de las repeticiones salen de la toma de números.

### Si una palabra sale rara

Se repite solo esa, en un audio suelto: `VOZ-IDIOMA-repite-NOMBRE.mp3`, con el nombre de su archivo final
(la tabla de abajo). Por ejemplo, `sulafat-es-repite-diecisiete.mp3` o `bradford-en-repite-switch-sides.mp3`.
El guion usa la repetida en lugar de la que cortó de la toma, y con `--solo diecisiete` rehace solo esa.

### Los archivos que escribe el guion

| Castellano | Archivo | Inglés | Archivo |
|---|---|---|---|
| Uno … Veinticinco | `VOZ-uno.mp3` … `VOZ-veinticinco.mp3` | One … Twenty-five | `VOZ-one.mp3` … `VOZ-twenty-five.mp3` |
| Tres, dos, uno (cuenta) | `VOZ-cuenta-tres.mp3`, `-dos`, `-uno` | Three, two, one (count) | `VOZ-count-three.mp3`, `-two`, `-one` |
| Colócate | `VOZ-colocate.mp3` | Get set | `VOZ-get-set.mp3` |
| Siguiente | `VOZ-siguiente.mp3` | Next | `VOZ-next.mp3` |
| Ya | `VOZ-ya.mp3` | Go | `VOZ-go.mp3` |
| Último paso | `VOZ-ultimo-paso.mp3` | Last step | `VOZ-last-step.mp3` |
| Izquierda | `VOZ-izquierda.mp3` | Left | `VOZ-left.mp3` |
| Derecha | `VOZ-derecha.mp3` | Right | `VOZ-right.mp3` |
| Cambia de lado | `VOZ-cambia-de-lado.mp3` | Switch sides | `VOZ-switch-sides.mp3` |
| Descansa | `VOZ-descansa.mp3` | Rest | `VOZ-rest.mp3` |

Los números sin tildes en el nombre: `dieciseis`, `veintidos`, `veintitres`. Veinticinco porque es la serie
más larga del catálogo (Elevación de talones, en Mueve); desde la 26 sonaría la madera.

## Lo que tiene que cumplir cada toma

- **Un silencio de un segundo entre línea y línea**, más o menos. Es por donde corta el guion: si dos
  palabras salen pegadas, no las puede separar y lo dice.
- **Todos los números en el mismo tono**, sin subir en cada uno ni caer en el último: se oyen sueltos y en
  cualquier orden, y un «veinticinco» que suena a final no puede ir antes de nada.
- **La cuenta atrás, corta:** cada palabra, menos de 0,85 s.
- **Los demás números, mejor por debajo de un segundo**, y nunca más de 1,5 s: la repetición más rápida
  del catálogo dura 2 s (Apretar glúteos y Círculos de tobillo).
- **Las frases, como mucho 1,5 s** («Cambia de lado», 2 s; «Ya», menos de 0,85 s).
- Sin respiraciones audibles entre línea y línea. El volumen da igual: el guion lo iguala.
- Si una toma sale mal entera, se repite entera; si falla una palabra, solo esa (arriba).

## Por tandas

Cada tanda son cuatro tomas y funciona sola: si a una voz le falta un archivo, en ese momento suena el
cuenco o la madera de hoy.

1. **sulafat en castellano**: la voz y el idioma de fábrica, lo que oye casi todo el mundo. Hecha (15 nov.).
2. **bradford en castellano**. Hecha (15 nov.; de las dos tomas que dio Genspark, la 2).
3. **sulafat en inglés**.
4. **bradford en inglés**.

## Con qué hacerlas

En Genspark, con las mismas voces que Respira: **sulafat** y **bradford**. Pega el prompt entero, con las
líneas tal cual. Si la herramienta no admite instrucciones de estilo, pega solo las líneas.

## Los prompts en castellano

### Números · `VOZ-es-numeros.mp3`

```
Say it in Spanish from Spain, in a calm, warm and steady voice, like a movement teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung, never cheerful or energetic. Read each line as its own separate short sentence, with about one second of silence after each one and no breath in between. Say every number in exactly the same neutral, even tone, as if it were the only word you say: do not read them as a list, do not rise along the way and do not drop on the last one.
Uno.
Dos.
Tres.
Cuatro.
Cinco.
Seis.
Siete.
Ocho.
Nueve.
Diez.
Once.
Doce.
Trece.
Catorce.
Quince.
Dieciséis.
Diecisiete.
Dieciocho.
Diecinueve.
Veinte.
Veintiuno.
Veintidós.
Veintitrés.
Veinticuatro.
Veinticinco.
```

### Cuenta atrás · `VOZ-es-cuenta.mp3`

```
Say it in Spanish from Spain, in a calm, warm and steady voice, like a movement teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung, never cheerful or energetic. A slow countdown: read each line as its own separate word, with about one second of silence after each one and no breath in between. Each number very short, well under one second, all three in the same calm tone, the last one not louder and not falling.
Tres.
Dos.
Uno.
```

### Avisos · `VOZ-es-avisos.mp3`

```
Say it in Spanish from Spain, in a calm, warm and steady voice, like a movement teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung, never cheerful or energetic. Read each line as its own separate short instruction, with about one second of silence after each one and no breath in between, all in the same calm, neutral tone, not as a list. Keep each line short: "Ya" well under one second, the others under one and a half seconds.
Colócate.
Siguiente.
Ya.
Último paso.
```

### Lados y descanso · `VOZ-es-lados.mp3`

```
Say it in Spanish from Spain, in a calm, warm and steady voice, like a movement teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung, never cheerful or energetic. Read each line as its own separate short instruction, with about one second of silence after each one and no breath in between, all in the same calm, neutral tone, not as a list. Keep each line under one and a half seconds, and "Cambia de lado" under two seconds, its three words together without pauses. "Descansa" a little softer, like letting the body settle.
Izquierda.
Derecha.
Cambia de lado.
Descansa.
```

### Una palabra repetida · `VOZ-es-repite-NOMBRE.mp3`

```
Say it in Spanish from Spain, in a calm, warm and steady voice, like a movement teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung, never cheerful or energetic. One single word, no breath before it, no pause before it, in a neutral, even tone, well under one second: Diecisiete.
```

## Los prompts en inglés

### Numbers · `VOZ-en-numeros.mp3`

```
Say it in English, in a calm, warm and steady voice, like a movement teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung, never cheerful or energetic. Read each line as its own separate short sentence, with about one second of silence after each one and no breath in between. Say every number in exactly the same neutral, even tone, as if it were the only word you say: do not read them as a list, do not rise along the way and do not drop on the last one.
One.
Two.
Three.
Four.
Five.
Six.
Seven.
Eight.
Nine.
Ten.
Eleven.
Twelve.
Thirteen.
Fourteen.
Fifteen.
Sixteen.
Seventeen.
Eighteen.
Nineteen.
Twenty.
Twenty-one.
Twenty-two.
Twenty-three.
Twenty-four.
Twenty-five.
```

### Countdown · `VOZ-en-cuenta.mp3`

```
Say it in English, in a calm, warm and steady voice, like a movement teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung, never cheerful or energetic. A slow countdown: read each line as its own separate word, with about one second of silence after each one and no breath in between. Each number very short, well under one second, all three in the same calm tone, the last one not louder and not falling.
Three.
Two.
One.
```

### Cues · `VOZ-en-avisos.mp3`

```
Say it in English, in a calm, warm and steady voice, like a movement teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung, never cheerful or energetic. Read each line as its own separate short instruction, with about one second of silence after each one and no breath in between, all in the same calm, neutral tone, not as a list. Keep each line short: "Go" well under one second, the others under one and a half seconds.
Get set.
Next.
Go.
Last step.
```

### Sides and rest · `VOZ-en-lados.mp3`

```
Say it in English, in a calm, warm and steady voice, like a movement teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung, never cheerful or energetic. Read each line as its own separate short instruction, with about one second of silence after each one and no breath in between, all in the same calm, neutral tone, not as a list. Keep each line under one and a half seconds, each pair of words together without pauses. "Rest" a little softer, like letting the body settle.
Left.
Right.
Switch sides.
Rest.
```

## Cuando los tengas

Guarda las tomas con esos nombres en `Audio - Cuerpo\`, una carpeta nueva junto a `Pace_app` y a
`Audio - Respira`, fuera del repo, y avisa a Claude. Lo que hace el guion:

```
node scripts/voz-cuerpo-tomas.js "..\Audio - Cuerpo"
```

- corta cada toma por sus silencios (ventanas de 10 ms por debajo de −50 dBFS, como el «Más») y comprueba
  que salen tantas palabras como líneas tiene; si no, lo dice y no escribe nada de esa toma;
- deja 30 ms delante y 120 ms detrás de cada palabra, con un fundido de 5 ms en los bordes;
- iguala el volumen de cada palabra con el de la misma voz en Respira;
- escribe cada palabra en `app/move/voz/` con su nombre, y sus medidas en `app/ui/Sound.voz.cuerpo.datos.js`;
- avisa de la cuenta atrás que pase de 0,85 s y de los números que pasen de 1,5 s.

Te lo pone a sonar en la app antes de publicar nada.
