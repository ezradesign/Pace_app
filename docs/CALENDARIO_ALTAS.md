# Dar de alta PACE en Google y en Microsoft

Para que la web de PACE pueda escribir en Google Calendar y en Outlook, cada uno tiene que conocer a PACE. Son dos altas, y de cada una sale un **identificador** (una cadena larga de letras y números) que hay que pegar en `CALENDARIO_IDS`, en `app/ritmo/ritmo.calendario.web.js`. No es secreto: va dentro de cualquier app de navegador. Mientras falte, ese botón no sale en la hoja.

La app de Android no necesita nada de esto: usa el calendario del móvil.

PACE vive en `pacegrass.app` y sigue abierta en `paceweb.pages.dev`, donde la tienen guardada los beta testers. Cada dirección guarda sus propios datos, así que se dan de alta las dos:

- Orígenes: `https://pacegrass.app` y `https://paceweb.pages.dev`
- Direcciones de vuelta: `https://pacegrass.app/calendario.html` y `https://paceweb.pages.dev/calendario.html`

Si un formulario no acepta la de `pages.dev`, pon solo la de `pacegrass.app` y díselo a Claude: en la dirección vieja habría que esconder ese botón.

## Google (unos 15 minutos)

1. Entra en <https://console.cloud.google.com/> con tu cuenta de Google y acepta las condiciones si te las pide.
2. Arriba, en el selector de proyectos, pulsa **Proyecto nuevo**. Nombre: `PACE`. Pulsa **Crear** y espera a que quede seleccionado.
3. En el buscador de arriba escribe **Google Calendar API**, ábrela y pulsa **Habilitar**.
4. En el menú, ve a **Google Auth Platform** (o **APIs y servicios → Pantalla de consentimiento de OAuth**) y pulsa **Comenzar**:
   - Nombre de la app: `PACE`. Correo de asistencia: el tuyo.
   - Público: **Externo**.
   - Información de contacto: tu correo.
   - Acepta y pulsa **Crear**.
5. En **Marca** (o **Branding**), rellena: página principal `https://pacegrass.app`, política de privacidad `https://pacegrass.app/privacy`, y en dominios autorizados `pacegrass.app` y `paceweb.pages.dev`. Guarda.
6. En **Acceso a datos** (o **Data access**), pulsa **Añadir o quitar permisos**, busca `calendar.events.owned`, márcalo y guarda.
7. En **Público** (o **Audience**), en **Usuarios de prueba**, añade tu correo y el de los beta testers (hasta 100). Mientras la app esté «en pruebas», solo ellos pueden conectar su Google Calendar.
8. En **Clientes** (o **Credenciales → Crear credenciales → ID de cliente de OAuth**):
   - Tipo: **Aplicación web**. Nombre: `PACE web`.
   - Orígenes de JavaScript autorizados: `https://pacegrass.app` y, con **Añadir URI**, `https://paceweb.pages.dev`
   - URI de redireccionamiento autorizados: `https://pacegrass.app/calendario.html` y, con **Añadir URI**, `https://paceweb.pages.dev/calendario.html`
   - Pulsa **Crear**.
9. Copia el **ID de cliente** (acaba en `.apps.googleusercontent.com`) y pásaselo a Claude.

Para abrirlo a todo el mundo, Google tiene que **verificar** la app, porque el permiso de calendario es de los que revisa. Se pide desde **Público → Publicar app**, y Google suele contestar en unas semanas. Puede pedir demostrar que el dominio es tuyo en Search Console: Claude prepara lo que haga falta cuando llegue ese paso.

## Microsoft (unos 15 minutos)

Microsoft ya no deja registrar apps con una cuenta personal suelta: hace falta un «directorio», que se crea gratis al darse de alta en Azure.

1. Entra en <https://azure.microsoft.com/es-es/free/> y pulsa **Empezar gratis** con tu cuenta de Microsoft (la de Outlook o Hotmail sirve). Te pedirá un teléfono y una tarjeta para comprobar que eres tú; registrar una app no cuesta nada. Si ya tienes Azure, salta este paso.
2. Entra en <https://entra.microsoft.com/>. En el menú, ve a **Aplicaciones → Registros de aplicaciones** y pulsa **Nuevo registro**:
   - Nombre: `PACE`.
   - Tipos de cuenta: **Cuentas en cualquier directorio organizativo y cuentas personales de Microsoft**.
   - URI de redirección: elige la plataforma **Aplicación de página única (SPA)** y escribe `https://pacegrass.app/calendario.html`.
   - Pulsa **Registrar**.
3. En la página que se abre, copia el **Id. de aplicación (cliente)**.
4. Ve a **Autenticación**; en la plataforma de página única pulsa **Agregar URI**, escribe `https://paceweb.pages.dev/calendario.html` y guarda.
5. Ve a **Permisos de API → Agregar un permiso → Microsoft Graph → Permisos delegados**, busca `Calendars.ReadWrite`, márcalo y pulsa **Agregar permisos**.
6. Pásale a Claude el identificador del paso 3.

Con una cuenta personal (Outlook.com, Hotmail) funciona en cuanto está dado de alta. En una cuenta de trabajo, la empresa puede exigir que su administrador apruebe apps nuevas: entonces la persona verá un aviso y tendrá que usar «Otro calendario».
