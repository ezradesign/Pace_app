# Dar de alta PACE en Google y en Microsoft

Para que la web de PACE pueda escribir en Google Calendar y en Outlook, cada uno tiene que conocer a PACE. Son dos altas, y de cada una sale un **identificador** (una cadena larga de letras y números) que hay que pegar en `CALENDARIO_IDS`, en `app/ritmo/ritmo.calendario.web.js`. No es secreto: va dentro de cualquier app de navegador. Mientras falte, ese botón no sale en la hoja. Si un formulario da un «secreto de cliente», no hace falta y no se pasa a nadie.

PACE escribe en un calendario suyo, «PACE», que crea en la cuenta de cada persona, y lo mantiene al día solo mientras la app está abierta (opción B de `docs/proposals/calendario-sincronizacion.html`, elegida por Ez el 8 de octubre de 2026).

La app de Android no necesita nada de esto: usa el calendario del móvil.

Solo se da de alta `pacegrass.app` (decisión de Ez): Google verifica los dominios de la app y `paceweb.pages.dev` es de Cloudflare. En la dirección vieja, la hoja solo ofrece el archivo.

- Origen: `https://pacegrass.app`
- Dirección de vuelta: `https://pacegrass.app/calendario.html`
- Página principal: `https://pacegrass.app/acerca` (qué es PACE, con el enlace a la privacidad)
- Privacidad: `https://pacegrass.app/privacy`
- Logo: `docs/marca/pace-logo-120.png` (120 × 120)

## Google (unos 15 minutos)

1. Entra en <https://console.cloud.google.com/> con tu cuenta de Google y acepta las condiciones si te las pide.
2. Arriba, en el selector de proyectos, pulsa **Proyecto nuevo**. Nombre: `PACE`. Pulsa **Crear** y espera a que quede seleccionado.
3. En el buscador de arriba escribe **Google Calendar API**, ábrela y pulsa **Habilitar**.
4. En el menú, ve a **Google Auth Platform** (o **APIs y servicios → Pantalla de consentimiento de OAuth**) y pulsa **Comenzar**:
   - Nombre de la app: `PACE`. Correo de asistencia: el tuyo.
   - Público: **Externo**.
   - Información de contacto: tu correo.
   - Acepta y pulsa **Crear**.
5. En **Marca** (o **Branding**), rellena: página principal `https://pacegrass.app/acerca`, política de privacidad `https://pacegrass.app/privacy`, sube el logo `docs/marca/pace-logo-120.png` y en dominios autorizados pon `pacegrass.app`. Guarda.
6. En **Acceso a datos** (o **Data access**), pulsa **Añadir o quitar permisos**, busca y marca `calendar.app.created` y `calendar.freebusy`, y guarda. **Fíjate en qué tabla los pone la consola** («no sensibles» o «sensibles») y díselo a Claude: de eso depende la verificación.
7. En **Público** (o **Audience**), en **Usuarios de prueba**, añade tu correo y el de los beta testers (hasta 100). Mientras la app esté «en pruebas», solo ellos pueden conectar su Google Calendar.
8. En **Clientes** (o **Credenciales → Crear credenciales → ID de cliente de OAuth**):
   - Tipo: **Aplicación web**. Nombre: `PACE web`.
   - Orígenes de JavaScript autorizados: `https://pacegrass.app`
   - URI de redireccionamiento autorizados: `https://pacegrass.app/calendario.html`
   - Pulsa **Crear**.
9. Copia el **ID de cliente** (acaba en `.apps.googleusercontent.com`) y pásaselo a Claude.

### La verificación de Google

Sin verificar, PACE funciona para los usuarios de prueba y, publicada, para 100 personas como mucho, que ven el aviso «Google no ha verificado esta app». Para v1 hay que verificarla, y conviene empezar pronto:

1. **El dominio es tuyo:** en <https://search.google.com/search-console>, añade una propiedad de **dominio** `pacegrass.app`. Te da un registro TXT: en Cloudflare, en el DNS de `pacegrass.app`, añade ese registro TXT y vuelve a Search Console a pulsar **Verificar**. Usa la misma cuenta de Google que en Google Cloud.
2. **Público → Publicar app**, y en el **Centro de verificación**, envía.
   - Si los dos permisos salieron como **no sensibles**: solo se verifica la marca (nombre, logo, dominio). Google da de 2 a 3 días hábiles.
   - Si alguno salió como **sensible**: además pide, por cada permiso, una justificación escrita y un vídeo en YouTube (oculto) que enseñe la ventana del permiso y para qué se usa. Claude escribe los textos y el guion; tú lo grabas. Google da 10 días hábiles, aunque hay gente que espera de 2 a 3 meses.

## Microsoft (unos 15 minutos)

Microsoft ya no deja registrar apps con una cuenta personal suelta: hace falta un «directorio», que se crea gratis al darse de alta en Azure.

1. Entra en <https://azure.microsoft.com/es-es/free/> y pulsa **Empezar gratis** con tu cuenta de Microsoft (la de Outlook o Hotmail sirve). Te pedirá un teléfono y una tarjeta para comprobar que eres tú; registrar una app no cuesta nada. Si ya tienes Azure, salta este paso.
2. Entra en <https://entra.microsoft.com/>. En el menú, ve a **Aplicaciones → Registros de aplicaciones** y pulsa **Nuevo registro**:
   - Nombre: `PACE`.
   - Tipos de cuenta: **Cuentas en cualquier directorio organizativo y cuentas personales de Microsoft**.
   - URI de redirección: elige la plataforma **Aplicación de página única (SPA)** y escribe `https://pacegrass.app/calendario.html`.
   - Pulsa **Registrar**.
3. En la página que se abre, copia el **Id. de aplicación (cliente)**.
4. Ve a **Permisos de API → Agregar un permiso → Microsoft Graph → Permisos delegados**, busca y marca `Calendars.ReadWrite` y `offline_access`, y pulsa **Agregar permisos**. El segundo deja que PACE siga conectada 24 horas sin preguntar.
5. En **Personalización de marca y propiedades**, sube el logo `docs/marca/pace-logo-120.png`, y pon la página principal `https://pacegrass.app/acerca` y la de privacidad `https://pacegrass.app/privacy`. Guarda.
6. Pásale a Claude el identificador del paso 3.

Con una cuenta personal (Outlook.com, Hotmail) funciona en cuanto está dado de alta, sin revisión. En una cuenta de trabajo, muchas empresas solo dejan conectar apps de un «editor verificado», y eso exige una cuenta de socio de Microsoft (Cloud Partner Program) a nombre de una empresa. No hace falta para empezar: mientras tanto, esa persona verá un aviso y podrá usar «Otro calendario».
