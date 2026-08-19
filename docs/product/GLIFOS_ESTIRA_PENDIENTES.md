# Estira · glifos que faltan

> **Generado** en s170 cruzando las rutinas de Estira (`app/extra/ExtraModule.jsx`)
> con el mapa de máscaras real. De las **14 identidades sin arte** del catálogo
> completo, **11 aparecen en rutinas de Estira**; las otras 3 son sólo de Mueve.

| Ejercicio | Archivo que espera la ingesta | Hoy | Qué debe mostrar |
|---|---|---|---|
| **Barbilla atrás** | `barbilla-atras.png` | dibujado | **Cabeza y cuello de perfil**, con una flecha corta horizontal: la barbilla se desliza atrás y la nuca se alarga. **No es bajar la cabeza.** |
| **Inclinación lateral** | `inclinacion-lateral.png` | dibujado | Igual que el anterior pero **sin mano** y con el arco de recorrido a los dos lados. |
| **Rotación lenta** | `rotacion-lenta.png` | dibujado | Cabeza girada **mirando sobre el hombro**, hombros de frente. |
| **Onda espinal** | `onda-espinal.png` | falta | De pie con una **línea ondulada** recorriendo la columna de la pelvis a la cabeza. |
| **Cuádriceps en pared** | `cuadriceps-en-pared.png` | falta | De rodillas con el **empeine contra la pared** (o la silla) y la rodilla al fondo. |
| **Rana** | `rana.png` | falta | Vista desde atrás/arriba: **rodillas muy abiertas** y cadera retrasada, mecido suave. |
| **Sentadilla lateral** | `sentadilla-lateral.png` | dibujado | **Peso a un lado** con esa rodilla flexionada y **la otra pierna estirada**. |
| **Zancada con apertura** | `zancada-con-apertura.png` | dibujado | Zancada con **una mano en el suelo** y el otro brazo abriéndose al techo (rotación). |
| **Isquio a una pierna** | `isquio-a-una-pierna.png` | falta | **Talón apoyado en algo bajo** delante, pierna extendida, cadera echada atrás. |
| **Sentadilla profunda** | `sentadilla-profunda.png` | dibujado | Sentadilla completa con **talones en el suelo** y **codos por dentro de las rodillas**. |
| **Sentarse y levantarse del suelo** | `sentarse-y-levantarse-del-suelo.png` | dibujado | Dos siluetas no: **una figura a medio camino entre el suelo y de pie, sin manos apoyadas**. |

---

## Cómo entran

Nombra cada PNG con el archivo de la tabla y:

```bash
node scripts/ingest-glifos-ejercicio.js --origen "<carpeta>"
```

**La ingesta reescribe el mapa ENTERO**, así que la carpeta de origen tiene que
llevar TODOS los dibujos, no sólo los nuevos: si sólo pasas los nuevos, los 47 que
ya están se borran del mapa. La carpeta de trabajo con los 47 ya nombrados vive en
el scratchpad de la sesión; si se pierde, se reconstruye con
`scripts/glifos/aplicar-mapa.js` a partir de `scripts/glifos/mapa-estira.txt`.

Después: `node build-standalone.js` · `npm run verify` · `npm run test:e2e`, y
**subir a mano** el censo `precache` de `scripts/verify.integridad.js`
(**dos filas por pieza** desde s170: la máscara y su miniatura).
