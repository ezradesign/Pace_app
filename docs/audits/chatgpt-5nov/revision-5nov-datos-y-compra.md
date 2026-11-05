# Revisión de ChatGPT del 5 nov. 2026: datos, compra y cambiar de dispositivo (9fe51aee)

Ez la trajo como «algo que he encontrado con ChatGPT». **No trae la parte legal** que se le pidió en la petición de la hoja.

## Lo comprobado por la coordinadora, leyendo el código (sin reproducirlo)

| # | Punto | Veredicto |
|---|---|---|
| 1 | Exportar desde Ajustes lee el disco y no la memoria | **Cierto.** `TweaksData.jsx:141` pasa `null` y `:68` lee `localStorage`; `UpdatePrompt.jsx:138` pasa `getState()`. Solo se nota si el guardado está fallando |
| 2 | Importar una copia anterior a la compra quita la licencia | **Cierto.** `importarDeVerdad` escribe la copia entera y `licencia` va dentro del estado; nada la conserva. **Va antes de encender la venta** |
| 3 | /recuperar culpa al comprador cuando falla Stripe | **Cierto.** `recuperar/index.html:226` convierte todo 503 en `cerrada`, y `TX` no tiene `stripe` ni `pendiente`: el 502 cae en «no». **Va antes de encender la venta** |
| 4 | La copia de rescate no dice cómo le fue | **Cierto.** `paceDescargarRescate` no espera a `paceBajarJSON` y devuelve `true` |
| 5 | Dónde funciona la compra | **Cierto**, y pesa más tras la decisión del 5 nov.: `state-licencia.js` no acepta códigos en las apps, así que quien compre en la web no lo tiene en Android ni iPhone. /premium tiene que decirlo: pasado a `premium-solo-vida` |

## La revisión, entera

Sí. He revisado un recorrido menos vistoso, pero **muy importante para que alguien confíe en PACE después de varias semanas: conservar sus datos, recuperar su compra y cambiar de dispositivo**.

**Base:** `main`, commit `9fe51ae`, versión 0.189.1. Solo lectura del código; no he ejecutado estas pruebas. No repito aquí los problemas de Stripe concurrente, tiendas pendientes o calendario de la ronda anterior. [Fuente](https://api.github.com/repos/ezradesign/Pace_app/commits/main)

He encontrado **cuatro problemas concretos y una decisión de producto que conviene aclarar antes de vender**.

# 1. Una copia exportada desde Ajustes puede dejar fuera lo último que has hecho

**Prioridad: alta cuando falla el almacenamiento.**  
**Deducido del código; pendiente de reproducción.**

### Caso concreto

1. Tengo una copia de mi estado guardada correctamente.
2. El almacenamiento empieza a rechazar escrituras.
3. Registro más actividad: PACE la conserva en memoria y muestra el aviso de que no puede guardar.
4. Entro en Ajustes y pulso **«Exportar una copia»**.
5. Me llevo esa copia pensando que he salvado lo que estoy viendo.

### Qué ocurre en el código

`exportJSON()` llama a `paceDescargarCopia(null, alAbrir)`. Al recibir `null`, la función lee el estado de `localStorage`, **no el estado actual en memoria**.

Sin embargo, el botón de exportación del aviso «No se puede guardar» sí utiliza `getState()`. Por tanto, **dos botones que parecen ofrecer la misma copia pueden exportar estados distintos**. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/tweaks/TweaksData.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/ui/UpdatePrompt.jsx)

`persistState()` mantiene el estado nuevo en memoria aunque falle la escritura, lo que permite ese desfase. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/state-core.jsx)

### Qué ve la persona

> «La copia se ha descargado. Entonces ya he salvado mis datos».

Pero puede faltar su actividad más reciente.

### Arreglo

- Desde la app funcionando, exportar el estado actual en memoria.
- Mantener una vía explícita de exportación desde disco para rescates y errores de arranque.
- No cambiar indiscriminadamente todos los usos: la pantalla global de error necesita poder trabajar aunque la interfaz haya fallado.

### Prueba

Bloquear las escrituras, registrar dos vasos adicionales y exportar desde:

1. El aviso de almacenamiento.
2. Ajustes.

**Ambas copias deben contener el mismo estado actual**, salvo metadatos como la hora de exportación.

---

# 2. Importar una copia anterior a la compra puede quitarte el acceso Premium del navegador

**Prioridad: alta antes de cobrar.**  
**Deducido del código; pendiente de reproducción con una licencia válida.**

### Caso concreto

1. Exporto mis datos el lunes, cuando todavía no he comprado.
2. El martes compro PACE de por vida y activo el código.
3. El miércoles importo la copia del lunes para recuperar una rutina o un historial.
4. Tras recargar, PACE deja de reconocer mi compra en ese navegador.

### Por qué sucede

La importación sustituye el estado completo por el de la copia. La licencia está dentro de ese mismo estado, en `licencia`.

No he encontrado en este recorrido una separación que conserve la licencia actual al importar los datos de actividad. Si la copia trae `licencia: null`, sustituye el código actual; si no trae el campo, la carga aplica el valor predeterminado `null`. El acceso web consulta precisamente ese campo. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/tweaks/TweaksData.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/state-core.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/state-licencia.js)

**No se pierde la compra en Stripe. Se pierde su activación local**, pero para la persona puede parecer lo mismo.

### Qué ve la persona

> «He restaurado mis datos y ahora me pide pagar otra vez».

### Arreglo

Separar conceptualmente:

- **Datos personales:** historial, ajustes, rutinas.
- **Derechos de compra:** licencia o compra de tienda.

Como mínimo:

- No sustituir una licencia vigente por una copia sin licencia.
- Si ambas contienen licencias diferentes, comprobarlas y aplicar una regla explícita.
- No elegir simplemente «la del archivo» ni «la que caduca más tarde» sin verificarla.

### Prueba

Importar una copia previa a la compra sobre una instalación con licencia de por vida.

**Resultado esperado:** se recuperan los datos elegidos y la compra continúa activa.

---

# 3. Recuperar una compra puede decir «no la encontramos» cuando en realidad falla Stripe

**Prioridad: alta para soporte y confianza.**  
**Deducido directamente del tratamiento de errores.**

### Caso concreto

1. He cambiado de ordenador.
2. Introduzco correctamente correo y recibo.
3. La consulta a Stripe falla.
4. PACE me indica que no encuentra mi compra y que revise los datos.

### Dónde está

La API diferencia el fallo de Stripe: devuelve **502 con `motivo: 'stripe'`**.

Pero la página de recuperación no tiene un mensaje para ese motivo. `decirFallo()` recurre al texto genérico de compra no encontrada. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/functions/api/recuperar.js) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/recuperar/index.html)

### Qué provoca

El usuario vuelve a escribir los mismos datos, prueba otros recibos o piensa que su compra no existe.

Además, esos intentos consumen el límite disponible, aunque el problema no sea suyo.

### Arreglo

Distinguir claramente:

| Situación | Mensaje recomendado |
|---|---|
| No existe coincidencia | «No encontramos una compra con esos datos». |
| Stripe no responde | «Ahora no podemos consultar tu compra. Inténtalo más tarde». |
| El código mensual todavía está pendiente | «Tu código todavía no está disponible. Vuelve a intentarlo o escríbenos». |
| Servicio sin configurar | «La recuperación automática aún no está disponible». |

Actualmente, los 503 también se presentan de forma genérica, aunque la API distingue una mensual pendiente de un servicio cerrado. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/functions/api/recuperar.js)

### Prueba

Simular 404, 502, 503 pendiente y 503 cerrado. **Cada uno debe explicar el problema correcto, sin culpar al comprador por un fallo del servicio.**

---

# 4. La copia de rescate no informa de si ha podido salir del móvil

**Prioridad: media; importante cuando ya ha ocurrido un fallo.**  
**Deducido del código; comprobar en Android e iOS.**

### Caso concreto

PACE ofrece una copia de rescate porque antes no pudo leer ciertos datos.

Pulso **«Descargar la copia de rescate»** y:

- El móvil no puede crear el archivo.
- Falla el menú de compartir.
- O cierro el menú sin elegir destino.

No recibo un resultado claro en esa fila.

### Dónde está

`paceDescargarRescate()` llama a `paceBajarJSON()`, pero no espera ni devuelve su resultado real: devuelve `true` inmediatamente si no hubo una excepción síncrona. Su botón tampoco muestra confirmación o error.

La exportación normal, en cambio, sí espera el resultado y distingue `compartida`, `cancelada` y `fallo`. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/tweaks/TweaksData.jsx)

La capa Android ya proporciona esos resultados; el problema está en que este recorrido no los utiliza. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/ui/android.js)

### Arreglo

Reutilizar el tratamiento de resultados de la copia normal:

- «Elige dónde guardarla».
- «Copia cancelada».
- «No se pudo exportar».

No afirmar «guardada» cuando solo se ha entregado a otra aplicación.

### Prueba

Repetir con:

1. Escritura fallida.
2. Compartición cancelada.
3. Compartición completada.

**La copia de rescate necesita como mínimo la misma claridad que una copia normal.**

---

# 5. Falta hacer inequívoca la diferencia entre recuperar datos, recuperar compra y sincronizar

**Tipo: decisión de producto y comunicación, no un bug por sí mismo.**  
**Prioridad: alta antes de vender en varios canales.**

El código permite tres cosas distintas:

- Importar una copia sustituye los datos locales.
- Recuperar el código web vuelve a activar el acceso en otro navegador.
- Las apps nativas no aceptan ese código web en la implementación actual. [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/tweaks/TweaksData.jsx) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/recuperar/index.html) [Fuente](https://raw.githubusercontent.com/ezradesign/Pace_app/9fe51aeebac79509102cdab4623c169f94a89452/app/state-licencia.js)

No estoy afirmando aquí qué exigen las tiendas: **describo lo que hace vuestra implementación**.

### Las preguntas que tendrá una persona real

> «Si compro en el ordenador, ¿lo tengo también en el móvil?».

> «Si recupero el código, ¿vuelven mis estadísticas?».

> «Si importo la copia del móvil, ¿se juntan sus datos con los del ordenador?».

Las respuestas actuales no son equivalentes:

| Acción | Qué consigue |
|---|---|
| Recuperar código web | Recuperar acceso web; no el historial perdido. |
| Importar copia | Sustituir los datos por los del archivo; no fusionarlos. |
| Usar dos dispositivos | No implica sincronización de actividad. |
| Pasar un código web a una app nativa | No activa Premium con el código actual. |

### Qué pondría antes de comprar

Una explicación corta, ajustada a la política comercial que decidáis:

> **Dónde funciona tu compra**  
> Esta compra activa PACE completo en […].  
> Tus datos se guardan en cada dispositivo. Puedes trasladarlos con una copia; no se sincronizan automáticamente.

Y en recuperación:

> **«Recuperas tu acceso. Para recuperar tu historial necesitas una copia de tus datos».**

**Una compra puede ser técnicamente correcta y aun así decepcionar si la persona esperaba otra cosa.**

---

# Qué haría primero con estos hallazgos

| Orden | Trabajo |
|---|---|
| **1** | Proteger la licencia vigente al importar datos. |
| **2** | Garantizar que la copia desde Ajustes exporta el estado actual. |
| **3** | Corregir los mensajes de recuperación de compra. |
| **4** | Dar resultado visible a la exportación de rescate. |
| **5** | Publicar una explicación única de compra, datos y dispositivos. |

**La idea de fondo es importante:** cuanto más útil se vuelva PACE, más importante será no perder lo que la persona ha construido dentro.

Estas mejoras no sirven para que la ficha de la tienda tenga más funciones. **Sirven para que, cuando algo vaya mal, el usuario siga confiando en PACE.**
