# Prompts de audio: la voz del segundo tramo del suspiro fisiológico

16 de octubre de 2026, v0.170.1. Lo pidió Ez el 15 oct. Los encargos anteriores están en
`../encargos-14oct/`.

## Lo que pasa hoy

El Suspiro fisiológico tiene tres fases: «Inhala» (2 s), «Inhala más» (1 s) y «Exhala» (5 s). La voz
dice «inhala» y «exhala», pero en el segundo tramo suena el tono. Ninguna voz suena en una fase de
1 s (Ez, 14 oct.): así Bhastrika y Kapalabhati no dicen «Inhale» noventa veces. Falta una palabra
propia para ese segundo, que solo sonará en el suspiro.

## La palabra: «Más» y «More»

- La fase dura 1 s y la app deja 0,15 s de margen, así que **la palabra dura como mucho 0,85 s**.
- **«Un poco más» no cabe.** Al ritmo de las voces que ya hay, serían unos 1,2 s con bradford y casi
  2 s con sulafat. «Más» sí cabe: es una sílaba, como «Hold».
- La pantalla sigue diciendo «Inhala más» («Inhale more»). La voz dice solo lo que cambia.

## Los cuatro archivos

| Archivo | Voz | Palabra |
|---|---|---|
| `sulafat-mas.mp3` | sulafat | Más |
| `bradford-mas.mp3` | bradford | Más |
| `sulafat-more.mp3` | sulafat | More |
| `bradford-more.mp3` | bradford | More |

Opcional, un quinto: `sulafat-inhale.mp3` más corto. El «Inhale» de sulafat dura 1,97 s y no cabe en
la primera inhalación del suspiro, que es de 2 s, así que en inglés con sulafat suena el tono, luego
«More» y luego «Exhale». Con una toma de 1,85 s o menos, diría las tres.

## Lo que tiene que cumplir cada uno (medido en la app)

- **La palabra dura como mucho 0,85 s**, sin contar los silencios del archivo.
- **Poco silencio delante**, menos de una décima. El de detrás no molesta.
- **El mismo volumen que las otras voces**, a oído. Al entrar se miden y se ajustan.
- MP3 o WAV, mono, 44,1 o 48 kHz. Una palabra por archivo, sin respiración audible antes ni después.
- Mejor dos o tres tomas de cada una: se elige la que suene más tranquila y quepa.

## Con qué hacerlas

Con la misma herramienta y la misma voz que las otras, para que suene la misma persona:
- **sulafat:** voz de Gemini (Google AI Studio, «Generate speech»).
- **bradford:** en la herramienta donde la hiciste.

## Los prompts

En Gemini, la manera de decirlo va escrita delante de la palabra. En una herramienta sin
instrucciones de estilo, pega solo la palabra con su punto («Más.») y deja la velocidad normal: aquí
lo que importa es que sea corta.

### Más

```
Say it in Spanish from Spain, in a calm, warm and unhurried voice, like a breathing teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung. One single very short word, no breath before it, no pause before it, light and slightly rising, like taking one small extra sip of air, well under one second: Más.
```

### More

```
Say it in English, in a calm, warm and unhurried voice, like a breathing teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung. One single very short word, no breath before it, no pause before it, light and slightly rising, like taking one small extra sip of air, well under one second: More.
```

### Inhale, más corto (opcional, solo sulafat)

```
Say it in English, in a calm, warm and unhurried voice, like a breathing teacher guiding a quiet session in a small room. Soft but clear, never whispered, never sung. One single word, no breath before it, no pause before it, and let it end gently, but finish it in under one and a half seconds: Inhale.
```

## Cuando los tengas

Guárdalos con esos nombres en `Audio - Respira\suspiro\`, una carpeta nueva junto a las otras voces,
fuera del repo. Luego avisa a Claude. Para ponerlos en la app:
- se mide dónde empieza y dónde acaba cada palabra (a −50 dBFS, como las otras) y se iguala el
  volumen;
- «Inhala más» pasa a tener su propia señal, que sí suena en su fase de 1 s. Las otras fases de 1 s
  (Bhastrika y Kapalabhati) siguen con el tono, como eligió Ez el 14 oct.;
- una prueba comprueba que el suspiro dice las tres palabras y que Bhastrika sigue con el tono.

Te lo pone a sonar en la app antes de publicar nada.
