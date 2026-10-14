# Prompts de audio: las voces que faltan en Respira

14 de octubre de 2026, v0.163.0. Lo único de audio que queda por hacer. Las imágenes van aparte, en
`PROMPTS_IMAGENES.md`.

## Lo que hay y lo que falta

- **En castellano no falta ninguna voz.** Las dos, «sulafat» y «bradford», dicen las tres palabras
  de Respira: «inhala», «mantén» y «exhala» (`app/breathe/voz/`). Suspiro fisiológico, Bhastrika y
  Kapalabhati van sin voz a propósito: sus fases duran 1 s y una palabra no tiene sitio.
- **Falta el inglés:** las mismas tres palabras con las dos voces. Son seis archivos. Hasta que
  lleguen, en inglés suena el tono, y Ajustes lo dice.
- Las palabras son las que enseña la pantalla en inglés: **Inhale**, **Hold** y **Exhale**.
- La música de Respira y los cuencos de Mueve y Estira ya están hechos. De ellos solo queda que oigas
  los cuencos en el portátil y en el móvil y digas si el volumen va bien.

## Los seis archivos

| Archivo | Voz | Palabra |
|---|---|---|
| `sulafat-inhale.mp3` | sulafat | Inhale |
| `sulafat-hold.mp3` | sulafat | Hold |
| `sulafat-exhale.mp3` | sulafat | Exhale |
| `bradford-inhale.mp3` | bradford | Inhale |
| `bradford-hold.mp3` | bradford | Hold |
| `bradford-exhale.mp3` | bradford | Exhale |

## Lo que tiene que cumplir cada uno (medido en la app)

- **La palabra dura como mucho 1,5 s**, sin contar los silencios del archivo. La fase más corta con
  voz dura 2 s (Rondas, Rítmica yin, Nadi Shodhana) y la app deja 0,15 s de margen. Con 1,5 s cabe
  en las 17 técnicas que llevan voz. El «exhala» de bradford en castellano dura 3,6 s, y por eso no
  suena en las tres de rondas. En inglés conviene que no pase.
- **Poco silencio delante**, menos de una décima: el silencio de delante retrasa la señal. El de
  detrás no molesta.
- **El mismo volumen que las castellanas**, a oído. Al entrar se miden y se ajustan.
- MP3 o WAV, mono, 44,1 o 48 kHz. Una palabra por archivo, sin respiración audible antes ni después.
- Mejor dos o tres tomas de cada una: se elige la que suene más tranquila y quepa.

## Con qué hacerlas

Con la misma herramienta y la misma voz con las que hiciste las castellanas, para que en inglés suene
la misma persona.
- **sulafat:** es una de las voces de Gemini (Google AI Studio, «Generate speech»), que también habla
  inglés.
- **bradford:** en la herramienta donde la hiciste.

## Los prompts

En Gemini, la manera de decirlo va escrita delante de la palabra, como en estos prompts. En una
herramienta sin instrucciones de estilo, pega solo la palabra con su punto («Inhale.») y baja un poco
la velocidad (0,9).

### Inhale

```
Say it in English, in a calm, warm and unhurried voice, like a breathing teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung. One single word, no breath before it, no pause before it, and let it end gently: Inhale.
```

### Hold

```
Say it in English, in a calm, warm and unhurried voice, like a breathing teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung. One single short word, no breath before it, no pause before it, steady and still: Hold.
```

### Exhale

```
Say it in English, in a calm, warm and unhurried voice, like a breathing teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung. One single word, no breath before it, no pause before it, slightly longer and softer at the end, like letting go, but still under one and a half seconds: Exhale.
```

## Cuando los tengas

Guárdalos con esos nombres en `Audio - Respira\voces-en\`, la carpeta junto a `Pace_app` donde están
los originales de las voces castellanas. No van dentro del repo. Luego avisa a Claude. Para ponerlos
en la app:
- se mide dónde empieza y dónde acaba cada palabra (a −50 dBFS, como las castellanas) y se cuenta en
  cuántas técnicas cabe;
- se iguala el volumen;
- Ajustes deja de decir que en inglés suena el tono.

Te los pone a sonar en la app antes de publicar nada.
