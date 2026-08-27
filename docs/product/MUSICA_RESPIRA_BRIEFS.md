# Música de fondo para Respira · briefs por familia

> **Estado:** encargo, no implementación. Escrito en s176 a petición del usuario
> («me das descripciones de músicas de fondo… así las genero en genspark»).
> El control ya existe en Ajustes: *Qué suena detrás* → `Nada · Ambiente`, y la
> **tercera opción «Música» se pinta el día que haya archivos** — un control que
> no hace nada es peor que un hueco.
>
> Gobierna la **FASE 5** del `ROADMAP.md`: pista de fondo **como archivo**, en
> web y Capacitor; el standalone conserva el motor sintetizado. **Se cachea al
> usarla, no en el precache.** Y si el material se genera con IA, hay que
> **verificar y guardar constancia de los términos de uso comercial** — eso lo
> pide la fase por escrito y no es opcional.

---

## Lo que manda sobre todo lo demás: no puede tapar la señal

La música es **fondo**, y en Respira compite con dos cosas que sí llevan
información: la señal de fase (un tono sintetizado o una locución, según lo que
elijas en Ajustes) y, en las rutinas con `drone`, el zumbido de ambiente.

De ahí salen cuatro restricciones que valen para las cinco piezas:

| | por qué |
|---|---|
| **Sin percusión con ataque** | un golpe seco se confunde con la señal de cambio de fase. Nada de kick, claps, rimshots ni pizzicatos marcados |
| **Rango medio despejado** (≈ 200 Hz – 3 kHz sin nada denso) | ahí viven las locuciones: `sulafat` ~193 Hz de fundamental y `bradford` ~121, con sus armónicos hasta bien arriba. Medido abriendo los archivos |
| **Dinámica plana** | sin crescendos ni caídas. Un swell hace que la persona levante la cabeza justo cuando debería estar contando su exhalación |
| **Bucle sin costura** | la duración la pone la rutina, no la pieza: entre 2 y 20 minutos según cuál. El corte tiene que ser inaudible |

**Afinación: A = 432 Hz, tónica en SOL.** No es esoterismo, es coherencia con lo
que la app ya suena: el drone de ambiente está en **G2 ≈ 96,7 Hz** (`Sound.jsx`)
y una de las rutinas se llama literalmente **`Coherente 432`**. Si las piezas
salen en otra tonalidad, chocarán con el drone en las rutinas que lo llevan.

**Formato:** mono, MP3 ~96 kbps (el estéreo no aporta a un fondo y dobla el
peso). Objetivo **≤ 2 MB por pieza**; se descarga al usarla.

---

## Las cinco familias, con sus números

Las cadencias salen del catálogo real cruzado con `getSequence()`, no de
memoria. `node scripts/audit/censo-respira-fases.js` las reproduce.

| familia | rutinas | duración | ciclo respiratorio | respiraciones/min |
|---|---|---|---|---|
| **Energía** | 3 | 4–20 min | 4 s | 15 |
| **Equilibrio** | 4 | 5–7 min | 8–24 s | 2,5–7,5 |
| **Balance** | 3 | 5–10 min | 10–12 s | 5–6 |
| **Relajación** | 4 | 2–8 min | 8–19 s | 3,2–7,5 |
| **Pranayama** | 6 | 3–8 min | **2–28 s** | **2,1–30** |

### Dos cosas que estos números deciden por ti

**1 · Equilibrio y Balance pueden compartir pieza.** Sus cadencias se solapan
(5–6 rpm cae dentro de 2,5–7,5) y sus asides dicen casi lo mismo — «Regula el
sistema nervioso» y «Ritmo suave y constante». Con una sola pieza serían
**cuatro** en vez de cinco, que es como lo escribiste tú. La contra: Box 6·6·6·6
respira a 2,5 rpm y Coherente 5·5 a 6, así que la pieza no puede tener un pulso
que acompañe a ninguna de las dos — tiene que ser **sin pulso**.

**2 · Pranayama no cabe en una sola pieza.** Va de `Bhastrika` (ciclo de 2 s, 30
respiraciones por minuto) a `Kumbhaka 1:4:2` (28 s, 2,1 por minuto): un factor
**14**. Cualquier pulso que acompañe a una desmiente a la otra. O son **dos
piezas** —una para las de bombeo y otra para las lentas— o es **una sin pulso
ninguno**, que es lo que recomiendo: en pranayama el pulso lo pone la
respiración y la música solo tiene que sostener.

---

## Los briefs

Cada bloque está escrito para pegarlo tal cual. Ajusta la duración si tu
generador tiene tope: lo importante es que **el final empalme con el principio**.

### 1 · Energía — «Despierta el sistema»

> Ambient meditativo con energía contenida, en Sol (afinación A = 432 Hz).
> Bucle sin costura de 4 minutos, mono. Sin percusión de ningún tipo.
> Capa base: drone de sintetizador cálido en Sol, estable, sin vibrato.
> Encima: hang drum o handpan con notas sueltas y espaciadas —una cada 6 u 8
> segundos—, dejando que cada golpe se apague del todo antes del siguiente.
> Ligero brillo en los armónicos altos, nunca estridente. Sin melodía
> reconocible, sin progresión de acordes, sin crescendos. Rango medio
> despejado. Sensación: amanecer, algo que empieza, no algo que empuja.

*Por qué así: las tres rutinas de esta familia son de rondas —respiración
intensa de 4 s por ciclo, hasta 20 minutos— y llevan retención en vacío. La
música tiene que sostener sin acelerar: el ritmo ya lo pone el cuerpo, y de
sobra.*

### 2 · Equilibrio — «Regula el sistema nervioso»

> Ambient de cuerdas suaves y drone, en Sol (A = 432 Hz). Bucle sin costura de
> 4 minutos, mono. Sin pulso, sin percusión, sin tempo perceptible.
> Cuerdas frotadas muy sostenidas —cello y viola con arco lento— sobre un drone
> grave en Sol. Movimiento armónico mínimo: como mucho un balanceo entre la
> tónica y la quinta, sin resolver nunca. Dinámica plana, sin swells.
> Rango medio despejado para dejar sitio a una voz hablada. Sensación:
> respiración larga y regular, algo que no se impacienta.

### 3 · Balance — «Ritmo suave y constante»

> Ambient con oleaje lento, en Sol (A = 432 Hz). Bucle sin costura de 4
> minutos, mono. Sin percusión.
> Un drone en Sol con un movimiento cíclico muy suave —filtro o volumen que
> abre y cierra cada **10 segundos exactos**— para acompañar la coherencia
> cardíaca a 6 respiraciones por minuto. El ciclo tiene que ser regular como un
> metrónomo, pero inaudible como pulso: se siente, no se oye. Pads cálidos,
> nada de arpegios. Rango medio despejado.

*Por qué 10 segundos: las tres rutinas de Balance respiran a 5·5 y 6·6, o sea
ciclos de 10 y 12 s. Un ciclo de 10 acompaña a la primera y no contradice a la
segunda; uno de 12 haría lo contrario. Si tu generador puede dar los dos,
mejor: sería la única pieza que gana teniendo dos versiones.*

### 4 · Relajación — «Baja el ruido mental»

> Ambient oscuro y cálido para antes de dormir, en Sol (A = 432 Hz). Bucle sin
> costura de 4 minutos, mono. Sin percusión, sin pulso.
> Pad grave y grueso con mucho aire, tipo cuerdas procesadas o coro sin
> palabras muy lejano. Reverberación larga. Todo en el registro bajo y medio-
> bajo; el agudo, apenas presente. Ningún evento que llame la atención: nada
> de campanas, notas sueltas ni cambios de textura. Dinámica completamente
> plana. Sensación: la habitación al apagar la luz.

*Por qué tan quieta: aquí viven `4·7·8` y `Exhalación 4·6`, que alargan la
exhalación a propósito. Cualquier evento sonoro en mitad de una exhalación de
8 segundos la corta.*

### 5 · Pranayama — «Raíces yóguicas»

> Drone tanpura meditativo, en Sol (A = 432 Hz). Bucle sin costura de 4
> minutos, mono. **Sin pulso, sin ritmo, sin eventos.**
> Tanpura o instrumento de cuerda pulsada india, con sus armónicos naturales, y
> un shruti box de fondo en la misma tónica. Sin tabla ni percusión. Sin
> melodía: solo la tónica y su quinta, con el batido natural de las cuerdas.
> Textura constante de principio a fin. Rango medio despejado.

*Por qué sin pulso: esta familia va de Bhastrika (30 respiraciones por minuto)
a Kumbhaka (2,1). No hay un tempo que sirva a las dos. El tanpura es
precisamente el instrumento que resuelve esto en la tradición de la que salen
estas técnicas: sostiene sin marcar.*

---

## Cuando estén los archivos

1. Van a `app/breathe/musica/`, **no** bajo la carpeta de arte de Respira: el
   build inlinea `.webp` de ahí y **aborta** si queda cualquier otra cosa. Es la
   misma razón por la que las locuciones viven en `app/breathe/voz/`.
2. **No entran en el precache** (`sw.js`) — lo dice la FASE 5: se cachean al
   usarlas. Son megas, no kilobytes.
3. La tercera pill de *Qué suena detrás* se enciende en `TweaksAudio.jsx`.
4. **Los términos de uso comercial, verificados y guardados** antes de publicar.
