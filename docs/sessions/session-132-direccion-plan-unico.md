# Sesión 132 — Dirección: un solo plan operativo, con el feedback beta al frente

**Fecha:** 2026-07-30
**Tipo:** SOLO-DOCUMENTAL — sin versión nueva, cero código, cero build
**Versión de referencia:** v0.71.0
**Entregable:** sección «Camino a v1.0» de [`ROADMAP.md`](../../ROADMAP.md), reescrita

---

## El problema que resuelve

Había **dos órdenes de trabajo compitiendo**: la secuencia de `ROADMAP.md` (adoptada en s93) y
los Bloques 0–9 del audit. Y las sesiones s107→s131 no siguieron ninguno de los dos: ejecutaron
B1, B2 y el Bloque 0. La fila `s107 · Caminos al centro` llevaba **23 sesiones** presentándose
como «lo siguiente» sin ejecutarse nunca.

Mientras existan dos planes, cada sesión improvisa el suyo. Ahora el reparto es explícito:
**audit = qué y por qué · ROADMAP = orden · STATE = presente**. Si discrepan en el orden, gana
el ROADMAP; en decisión de producto, gana el audit.

## Marco fijado por el usuario

- **v1.0 = la primera versión PAGADA**, no «la web pulida».
- **Travesías SÍ** en v1, y son el **argumento principal de compra**.
- **Viajes de respiración NO** (audio, voz, música, facilitadores → post-v1).
- Sin fecha; prioridad a la coherencia del producto.

## El feedback beta, que reordenó el plan

Hasta ahora en el repo solo estaba el mensaje de WhatsApp del audit §33, **sin respuestas**. El
usuario las aportó en esta sesión, y los cinco puntos caen en el mismo sitio: **Mueve y Estira
no se entienden.**

1. No está claro cómo hacer exactamente el ejercicio.
2. Los glifos son flojos.
3. Las descripciones son vagas.
4. En español se mezclan nombres en inglés.
5. Hay ejercicios muy complejos mezclados con muy sencillos.

**Verificado contra el código** — los tres puntos comprobables son ciertos, y peores de lo que
sugería la queja:

| Queja | Medición |
|---|---|
| Nombres en inglés | **34 de 93** nombres (37 %): `Dead hang`, `Chin tucks`, `Hollow hold`, `Scapular squeeze`, `Wall sit`, `Cossack squat`, `Superman`, `Pigeon`, `Band pull-apart`… |
| Glifos flojos | **46 glifos definidos para 92 nombres de paso distintos** ⇒ del orden de la mitad de los pasos cae en `DefaultGlyph` |
| Complejo mezclado con sencillo | `level` e `intensity`: **44 declaraciones en los datos, CERO consumidores en la UI** |

Lo llamativo del punto 4: `name` en español es la **clave del glifo** y de la i18n del
constructor (decisión s93), así que el 37 % de nombres en inglés no es solo un problema de idioma
— es que renombrarlos obliga a tocar `exercise-glyphs.jsx` y `content/*.js` **en el mismo
cambio**, o el glifo cae en silencio a `DefaultGlyph` (decisión s108).

Y el punto 5 tiene la solución medio hecha: los metadatos de nivel e intensidad **ya se
escribieron** en las cuatro olas de migración de B2.3; simplemente **nadie los lee**.

## Consecuencia de orden

La comprensibilidad de Mueve y Estira pasa a **FASE 2**, por delante de eventos, Stats y
Travesías. Tres razones que apuntan al mismo sitio:

- es el **núcleo diferencial** frente a un Pomodoro cualquiera;
- las **Travesías se construyen encima** de estos ejercicios — una de 7 capítulos sobre
  ejercicios que no se entienden multiplica el problema por siete;
- los **glifos placeholder ya eran un bloqueante de venta declarado** («no se puede vender packs
  cuyos pasos rendericen `DefaultGlyph`»).

## Las 7 fases

1. **Dirección cerrada** (docs) — este plan + re-decisión del §37 + respuestas comerciales de §36.
2. **Que Mueve y Estira se entiendan** — nombres en español · inventario y set de glifos · dos
   niveles visuales (identificar ≠ enseñar) · descripciones que enseñan · nivel e intensidad
   visibles · preview antes de empezar.
3. **Eventos, fase 1 web** — lo único cuyo valor depende de haberlo hecho pronto.
4. **Stats** — Fase 0 (marco) y Fase 1 (Hoy + Semana).
5. **Travesías** — el argumento de compra.
6. **Descubrimiento** — taxonomía, filtros, previews, bibliotecas, Caminos al centro.
7. **Venta** — licencia offline + trial, legal, Starter Story antes del pricing, landing, ASO.

Con reglas explícitas (un frente por sesión, auditoría antes de código, el standalone sigue
vivo) y una lista de lo que queda **fuera de v1**.

## Lo que NO quedó cerrado

**La FASE 1 sigue abierta.** Faltan:

- la **re-decisión del §37** (tipos de jornada · racha→ritmo · puntuación de equilibrio ·
  check-in de cierre · comparación retrospectiva), que el usuario decidió cerrar en la sesión de
  dirección;
- las **preguntas comerciales de §36**: precio objetivo de Lifetime, precio fundador, prueba
  empresarial, y si la primera versión móvil es Android, iOS o ambas.

Hasta que se cierren, la Fase 4 (Stats) tiene dos secciones condicionadas y la Fase 7 mantiene el
precio del ROADMAP marcado como **provisional**.
