# Bancos de medición · `scripts/audit/`

> **Índice de herramientas, no de decisiones.** Nace en s178 porque la auditoría encontró
> **17 bancos que no aparecían en ningún documento**: costaron una sesión cada uno y nadie
> podía encontrarlos sin abrir su código.
>
> **Qué son**: scripts que sólo LEEN o generan HTML. Su salida lleva prefijo `_` y está
> gitignoreada — lo que se versiona es el GENERADOR, nunca su salida.
>
> **Qué NO son**: red de seguridad. Eso es `npm run verify` y `npm run test:e2e`. Un banco
> contesta **una pregunta de una sesión**; si su respuesta debe vigilarse para siempre, se
> convierte en checker del `verify` o en spec de la suite, no se deja aquí.
>
> Los que ya estaban citados en otros documentos (los de s170-s177, el censo de glifos, la
> matriz) no se repiten aquí: se citan donde se usan.

---

## Los que la auditoría de s178 destapó

### Layout y composición

| Banco | Qué pregunta contesta |
|---|---|
| `banco-runner-bajo-s179.js` | **A que altura EXACTA empieza a solapar el runner** (s179), barriendo escritorio y movil de arriba abajo. Nace porque el censo tarda ~3 min POR VIEWPORT y la pregunta era el UMBRAL, no el censo. **Mide UNA rutina y lo declara**: en s179 dio «cero» donde el censo encontro 5 de 19 rutinas rotas, asi que da el borde y no el cierre |
| `banco-aire-tarjetas-logro.js` | **Cuánto aire sobra debajo de cada tarjeta de logro** (s167). Nace de que el usuario reportó demasiado hueco abajo |
| `banco-home-orden.js` | **La home, antes y después del orden único** (s166): el mismo orden —aro, Actividades, Camino— en las dos pieles |
| `banco-respira-movil.js` | **¿Cabe en móvil la barra de progreso de Respira?** (s166). s165 lo había dejado declarado como NO CUBIERTO, con la sospecha escrita |
| `banco-respira-capturas.js` | **El antes y el después del progreso de Respira** (s165), fotografiando las tres pantallas con el `index.html` de HEAD **servido en paralelo** |

### Arte de logro: la cadena que decidió el formato

Se leen **en este orden**, porque cada uno sale de mirar la salida del anterior:

| Banco | Qué pregunta contesta |
|---|---|
| `glifos-logros.js` | **Auditoría de la tanda de arte ANTES de tocar nada** (s146b): cuántos dibujos distintos hay, con cifras y no a ojo |
| `glifos-hoja50.js` | **Hoja de contactos de los 50 dibujos distintos**, numerados, para poder decir «el 12 es `first.sip`» sin abrir 50 archivos |
| `glifos-recorte.js` | La hipótesis que sale de mirar esa hoja: **el motivo central ocupa menos de la mitad del lienzo** porque el arte trae su propio margen |
| `glifos-aro.js` | **Detectar la circunferencia del arte de forma fiable.** Los dos intentos anteriores fallaron por lo mismo: buscaban el radio del máximo |
| `glifos-mascara.js` | **La prueba que decidió el formato.** El arte es lápiz pálido: medido, el píxel más oscuro se queda en L 171-187 |
| `glifos-definicion.js` | Dos quejas del usuario resueltas juntas: «el círculo central les sobra» y «pueden tener mejor definición» |
| `glifos-56px.js` | **La pregunta que decide todo: qué queda del dibujo al tamaño real del sello (56 px CSS)** |
| `hoja-sellos-nuevos-en-app.js` | Los 19 sellos nuevos **tal y como los pinta la app** (s167) — sale del `index.html` construido, no de los PNG |

### Maquetas de s175 y s176

Las maquetas se trocearon por la regla §1, así que **el motor, la composición y las piezas
viven en archivos distintos**. Se lanzan por el archivo principal (`maqueta-s175.js`,
`maqueta-s176.js`), no por estos:

| Banco | Qué pregunta contesta |
|---|---|
| `maqueta-s175.pagina.js` | La **composición** de `_maqueta-s175.html` |
| `maqueta-s175.piezas.js` | **Las piezas**: el CSS de cada variante y los dos bocetos de vista de `Rana` |
| `maqueta-s176.pagina.js` | La **composición** de `_maqueta-s176.html`: junta los marcos de Respira con los demás |
| `maqueta-s176.audio.js` | **El bloque de sonido de Ajustes, en variantes.** Escribe en `_maqueta-s176/` |
| `maqueta-s176.medir.js` | **Abre cada marco de la maqueta a viewport real y lee su etiqueta** — la lección de s174: la maqueta se dibuja sobre un marco a pelo y la superficie real tiene chrome |

---

## Cómo mantener esta tabla honesta

**No se mantiene a mano.** El cruce lo hace `scripts/audit/auditoria-s178.huerfanos.js`, que
lista los bancos sin una sola mención en la documentación. Si aparece uno nuevo en esa lista,
o entra aquí o se borra — **un banco que nadie puede encontrar es un banco que no existe**.
