PACE · Auditoría y diseño del sistema de producto
Estado: GOBIERNA — nivel 1 (dirección integral de producto).
Índice de autoridad documental: docs/product/AUDITORIA_DOCUMENTAL.md.
Fecha de creación: 2026-07-27.
AVISO (s130): existe una copia anterior de este documento fuera del repositorio
(«AUDITORIA_SISTEMA_PACE_PRE_REPO_2026-07-27.md»). Es un snapshot PREVIO: le faltan el §37,
el §32.6 y todas las anotaciones de sesión. Este archivo es su superconjunto y el único que
gobierna. No hay ninguna decisión que exista solo en esa copia (verificado por diff en s130).
Referencia técnica inicial: v0.66.0 · main · commit 9a126257d69e5d50d0ac71f3400e81743a6f2a05.
Estado técnico revisado: v0.67.0 · main · commit 43417f34727f1ff306cca20a5aa77cebb48cdbcb.
Última actualización de decisiones: ronda M1–M4 (métricas, check-in, ritmo y arquitectura de Stats) — ver §37.
§37 RE-DECIDIDO Y CERRADO en s133 (ver §37 bis). Estuvo marcado PROVISIONAL entre s130 y s133
porque se había añadido sin repensarse; el usuario lo cerró decisión a decisión.
Propósito: reunir las decisiones de producto, UX, gamificación, Caminos, Travesías, Respira, premium, logros y dirección visual para que no dependan del contexto de una conversación.
Importante: este documento describe decisiones y propuestas. No implica que todas estén implementadas.

Jerarquía de documentos (de la dirección a la ejecución):
1. AUDITORIA_SISTEMA_PACE.md (este archivo): dirección integral y decisiones de producto.
2. docs/product/DECISIONES_PRODUCTO.md: decisiones técnicas/productivas ya destiladas para ejecución.
3. STATE.md: presente, siguiente sesión y backlog inmediato.
En caso de conflicto entre niveles, gobierna el documento más específico para su ámbito
(este audit fija el "qué/por qué" de producto; DECISIONES_PRODUCTO y STATE fijan el "cómo/cuándo").

1. Visión de PACE
PACE no debe entenderse únicamente como una aplicación Pomodoro con módulos adicionales.

Debe ser una aplicación equilibrada que conecte:

Foco.
Respiración.
Movimiento.
Estiramiento y movilidad.
Hidratación.
Pausas activas.
Progreso personal.
Rituales y recorridos guiados.
Propuesta esencial
PACE transforma el trabajo sedentario en un ritmo equilibrado de atención, respiración y cuerpo.

La aplicación debe permitir dos formas de uso:

Uso libre: la persona sabe lo que quiere y entra directamente en Foco, Respira, Mueve, Estira o Hidrátate.
Uso guiado: PACE ayuda a decidir mediante Caminos, Travesías y la opción “Déjate guiar”.
La guía nunca debe ser obligatoria, invasiva ni bloquear la exploración libre.

2. Principios de producto
2.1. Equilibrio
Foco, Respira y Cuerpo pueden protagonizar experiencias por igual.

PACE no debe tratar Respira, Mueve o Estira como accesorios secundarios del Pomodoro.

2.2. Calma
La aplicación no debe emplear:

rachas rojas;
pérdida punitiva de progreso;
monedas;
rankings;
presión social;
notificaciones culpabilizadoras;
urgencia comercial;
celebraciones excesivas;
dark patterns.
2.3. Utilidad
El tono poético no debe dificultar entender:

qué va a ocurrir;
cuánto durará;
qué espacio hace falta;
qué beneficio busca;
si hay que levantarse;
si se necesita material;
qué intensidad tiene.
2.4. Privacidad y propiedad
PACE debe conservar sus pilares:

funcionamiento local-first;
sin cuenta obligatoria;
sin backend propio para el núcleo;
sin tracking comercial;
datos exportables y borrables;
compra comprensible;
sin suscripción autorrenovable engañosa.
2.5. Progreso sin culpa
Una sesión abandonada, un día sin usar PACE o una Travesía interrumpida no deben destruir el progreso anterior.

PACE puede proponer ritmo, pero no castigar.

3. Estado técnico relevante
3.1. Base actual
Versión analizada: v0.66.0. (Actualizado: el repositorio va por **v0.70.0**; el resto de
este apartado sigue siendo válido salvo donde se indique.)
Rama: main.
Home “atardecer” responsive implementada. (En Desktop la sustituye desde s126/v0.69.0 la
composición proporcional con horizonte — §32.6; el modelo «atardecer» sigue vigente en
móvil/tablet.)
Aplicación React 18 con Babel standalone.
Web, PWA, extensión y futuro empaquetado móvil.
Estado local persistente.
Sin backend ni cuentas.
ES/EN.
7 Caminos existentes.
20 técnicas de Respira.
14 rutinas de Mueve.
14 rutinas de Estira.
106 logros en catálogo.
69 IDs marcados actualmente como implementados.
Constructor premium de rutinas construido, pero poco visible.
Entitlement central implementado, licencia real todavía no implementada.
Arquitectura pace.events.v1 diseñada, pero todavía sin conectar.
3.2. Asset de loto
La imagen existe en:

Copyapp/breathe/Loto_png.png
Fue añadida en el commit:

Copy6acd1e2ed9b76fd223cde56184c8c6abdde5d144
Está pendiente:

optimización;
posible conversión a WebP;
integración en Respira;
animación;
comprobación de contraste;
comprobación de standalone;
reduced motion;
modo noche.
3.3. Premium
Actualmente:

existe state-entitlement.jsx;
las rutinas pueden declarar access: 'premium';
existe degustación explícita en contenido concreto;
el constructor de rutinas está protegido;
PremiumSection.jsx es display-only;
el input de licencia está deshabilitado;
no existe validación criptográfica;
el acceso continúa dependiendo de premiumUnlocked.
3.4. Logros
Problemas identificados:

desbloqueos iniciales demasiado juntos;
denominadores distintos entre sidebar y modal;
secretos y logros disponibles se contabilizan de forma diferente;
logros potencialmente inalcanzables presentados como implementados;
textos heredados o poco coherentes;
cobertura desigual entre contenido antiguo y nuevo;
algunos logros utilizan SVG y otros caracteres Unicode;
las bolas del sendero de la sidebar no muestran correctamente el glifo del logro desbloqueado.
3.5. Glifos de ejercicio
Existe un sistema line-art propio en:

Copyapp/glyphs/exercise-glyphs.jsx
Pendiente:

inventariar todos los step.name;
cruzarlos con los glifos existentes;
detectar placeholders;
revisar glifos antiguos;
portar diseños aprobados por el usuario;
diseñar glifos de Mueve y Estira todavía ausentes;
distinguir entre glifo identificativo y diagrama técnico de ejecución.
4. Arquitectura general de la experiencia
PACE ofrecerá cuatro niveles de profundidad:

Nivel 1 · Acción directa
La persona entra directamente en:

Foco.
Respira.
Mueve.
Estira.
Hidrátate.
Nivel 2 · Déjate guiar
Una ayuda voluntaria y breve para escoger qué hacer ahora.

Nivel 3 · Caminos
Experiencias completas para una única sesión.

Nivel 4 · Travesías
Recorridos de varios días o capítulos, con progresión y contenido propio.

5. Home y “Déjate guiar”
5.1. Restricción principal
“Déjate guiar” no debe modificar en exceso el diseño actual de la home.

No se añadirá una gran sección nueva que compita con:

el timer;
el Camino sugerido;
las actividades.
5.2. Integración recomendada
La superficie actual del Camino sugerido puede evolucionar para contener una acción discreta:

CopyCamino sugerido
“Claro entre las ramas”
Recupera la concentración · 15 min

[Comenzar]    [Déjate guiar]
También puede utilizarse un chip o enlace secundario:

Copy¿No sabes qué hacer? Déjate guiar
No debe convertirse en un asistente protagonista permanente.

5.3. Flujo recomendado
Al pulsar “Déjate guiar”:

PACE pregunta qué necesita la persona.
Opcionalmente pregunta cuánto tiempo tiene.
Aplica el contexto habitual guardado.
Muestra:
una recomendación principal;
una alternativa más corta;
una alternativa de carácter diferente.
5.4. Necesidades iniciales
Concentrarme.
Calmarme.
Activarme.
Soltar el cuerpo.
Descansar.
Cerrar.
Déjate guiar.
“Déjate guiar” puede actuar como una decisión automática cuando la persona no quiere escoger una necesidad concreta.

5.5. Contexto habitual
Durante el onboarding, de forma opcional y sencilla, PACE puede preguntar:

si normalmente trabaja sentado;
si puede levantarse;
si puede usar el suelo;
si tiene poco espacio;
si comparte el espacio;
si necesita silencio;
si dispone de material.
Después se representa mediante chips editables:

CopySentado · 10 min · Sin material · Silencioso
Nunca debe ser obligatorio rellenar todos los datos.

5.6. Jerarquía adaptable
En una superficie amplia:

Claro entre las ramas
Recupera la concentración sin levantarte.
15 min · sentado · respiración + foco

En una superficie pequeña:

Recupera el foco · 15 min
Claro entre las ramas

Por tanto:

nombre poético protagonista cuando existe espacio;
beneficio práctico protagonista cuando el espacio es reducido;
duración y requisitos siempre visibles cuando sean relevantes.
6. Caminos
6.1. Problema actual
Los Caminos actuales resultan débiles porque:

reutilizan demasiado contenido;
la mayoría tiene tres pasos;
se sienten como playlists de rutinas completas;
tienen poca narrativa propia;
la progresión es limitada;
las ilustraciones están preparadas para pocos hitos;
no existe una diferencia suficiente entre hacer un Camino y abrir manualmente tres módulos.
6.2. Nueva definición
Un Camino será:

Una experiencia editorial completa para una única sesión, creada para una necesidad y un contexto, con una atmósfera poética y una progresión propia.

6.3. Tres formatos
Semilla
Aproximadamente 3–7 minutos.
3–4 hitos.
Acción inmediata.
Compatible con pausas muy breves.
Puede estar formada por microintervenciones.
Pausa
Aproximadamente 8–20 minutos.
4–6 hitos.
Recuperación física o mental.
Puede incluir respiración, movilidad, hidratación o descanso visual.
Ritual
Aproximadamente 25–60 minutos.
6–9 hitos.
Experiencia profunda.
Puede incluir varios bloques.
Puede contener sesiones largas de respiración.
Puede protagonizarlo Foco, Respira o Cuerpo.
Las duraciones exactas deben validarse durante el diseño del catálogo.

6.4. Contenido híbrido
Los Caminos reutilizarán parte del contenido existente, pero no se limitarán a encadenar rutinas completas.

Podrán incluir:

aperturas propias;
versiones adaptadas de técnicas;
ejercicios sueltos;
transiciones;
cambios de postura;
pausas visuales;
hidratación;
intención;
fragmentos de Foco;
reflexión;
integración;
cierre exclusivo.
Como orientación, aproximadamente un tercio de la experiencia puede ser dirección o contenido exclusivo.

No es una cuota técnica obligatoria; es una referencia para impedir que vuelvan a sentirse como recopilaciones.

6.5. Necesidad, contexto y poesía
La necesidad principal decide qué debe hacer el Camino.

El contexto elimina opciones inadecuadas.

La hora influye en la recomendación y la atmósfera.

El nombre poético da identidad.

Ejemplo:

CopyNecesidad: recuperar la concentración
Contexto: sentado · 15 min · sin ruido
Hora: tarde

Resultado:
“Segunda luz”
Recupera la atención sin levantarte de la silla.
6.6. Familias funcionales
Los Caminos pueden responder a:

preparar el Foco;
recuperar el Foco;
activarse;
calmarse;
soltar tensión;
descansar la vista;
hacer una pausa completa;
cerrar una sesión;
cerrar la jornada;
empezar la mañana;
recuperarse después de comer;
volver después de una interrupción.
6.7. Foco no obligatorio
Existirán, al menos, dos familias:

Caminos de Foco
Preparan, incluyen o recuperan un tramo de trabajo.

Caminos de Pausa
Recuperan cuerpo y mente sin obligar a trabajar después.

También pueden existir Caminos protagonizados por Respira o Cuerpo.

7. Láminas e hitos de los Caminos
7.1. Decisión visual
Cada Camino tendrá su propia lámina.

No se utilizará una única ilustración genérica para todos los Caminos.

7.2. Hitos dinámicos
Las bolas no deben estar necesariamente impresas dentro del bitmap final.

La dirección recomendada es:

CopyLámina propia del Camino
        +
Capa dinámica de hitos
La lámina conserva:

paisaje;
sendero;
identidad;
color;
atmósfera.
La capa dinámica representa:

cantidad de hitos;
hito actual;
completado;
opcional;
bloqueado;
tipo de actividad;
logro o recompensa.
7.3. Ventajas
permite Caminos de distinta longitud;
evita redibujar la lámina si cambia un paso;
facilita accesibilidad;
permite mostrar glifos;
hace posibles animaciones;
permite reutilizar el motor para Travesías.
7.4. Requisito estético
Los hitos dinámicos deben parecer parte de la ilustración, no botones genéricos colocados encima.

Necesitan:

textura o tratamiento artesanal;
color heredado de la lámina;
escala ajustada;
contornos coherentes;
animación calmada;
glifos legibles;
contraste suficiente.
7.5. Nuevas láminas
Será necesario revisar o regenerar las ilustraciones actuales para:

dejar senderos limpios;
admitir cantidades variables de hitos;
disponer de espacio para etiquetas;
funcionar en móvil y escritorio;
evitar solapamientos;
preparar distintos estados de progreso.
8. Travesías
8.1. Definición
Una Travesía será:

Un recorrido guiado de varios capítulos que desarrolla una capacidad, hábito o experiencia a lo largo del tiempo.

Las Travesías serán uno de los principales diferenciales de PACE.

8.2. Duraciones iniciales
Se adoptan tres formatos:

Travesía de 3 capítulos
introducción;
prueba;
objetivo limitado;
baja barrera de entrada.
Travesía de 7 capítulos
formato principal;
suficiente para crear narrativa;
permite progresión real;
compatible con una semana sin obligar a realizarla en días consecutivos.
Travesía de 14 capítulos
experiencia profunda;
contenido más amplio;
puede incorporar sesiones largas;
requiere mayor compromiso.
8.3. Ritmo flexible
PACE propone un capítulo al día, pero no obliga.

Copy orientativo:

Te proponemos avanzar un capítulo cada día. Continúa cuando estés preparado.

Si una persona se salta un día:

no pierde progreso;
no rompe la Travesía;
no recibe mensajes culpabilizadores;
puede retomarla donde estaba.
8.4. Contenido posible
Una Travesía puede combinar:

Caminos;
técnicas de Respira;
Viajes de respiración;
Foco;
Mueve;
Estira;
hidratación;
descanso visual;
reflexión;
pequeños aprendizajes;
adaptación del contexto;
revisión del progreso.
8.5. Ejemplos iniciales
Siete días para recuperar el Foco.
Una semana de cuello y hombros.
Volver al cuerpo.
Respirar con calma.
Rituales para cerrar la jornada.
Primer Viaje de respiración.
Energía sin prisa.
Catorce días contra la silla.
Los nombres definitivos deberán trabajarse editorialmente.

9. Respira
9.1. Nueva taxonomía
Se evita separar “Técnicas” y “Sesiones guiadas”, porque una técnica también puede estar guiada.

Respira tendrá dos familias principales:

CopyRESPIRA
├── Técnicas
└── Viajes de respiración
9.2. Técnicas
Una Técnica será:

Un patrón concreto de respiración que puede repetirse de manera independiente.

Características:

normalmente breve;
objetivo claro;
patrón reconocible;
duración seleccionable cuando proceda;
guía visual;
guía sonora opcional;
hápticos opcionales;
información de seguridad;
puede aparecer dentro de un Camino o Viaje.
Ejemplos actuales:

coherente;
caja;
4-7-8;
suspiro fisiológico;
respiración alterna;
pranayamas concretos.
9.3. Viajes de respiración
Un Viaje será:

Una experiencia compuesta por fases, con progresión, dirección, música y combinación de técnicas.

Duraciones posibles:

15–20 minutos;
30–40 minutos;
45–60 minutos.
Puede contener:

Llegada.
Preparación.
Primera técnica.
Intensificación.
Pausa o retención segura.
Segunda fase.
Descenso.
Integración.
Cierre.
No todos los Viajes deben usar respiración intensa.

Podrán existir:

Viajes calmados;
Viajes energizantes;
Viajes de concentración;
Viajes de liberación;
Viajes nocturnos;
Viajes con movimiento;
Viajes CTB.
9.4. Modalidades de guía
Cada Técnica o Viaje puede ofrecer, cuando tenga sentido:

Voz completa: explicación y acompañamiento.
Señales mínimas: palabras, campanas o cambios sonoros.
Solo música/sonido: para personas familiarizadas con la práctica.
9.5. Facilitadores
PACE podrá trabajar con facilitadores invitados.

Posibilidades:

colaboración puntual;
colección de autor;
Viaje estacional;
Travesía guiada;
voz invitada;
música original;
coautoría de contenido.
Debe resolverse:

contrato;
licencia;
derecho de uso;
duración;
territorios;
compensación;
atribución;
mantenimiento del contenido;
revisión de seguridad.
10. CTB · Conscious TransBreathing
10.1. Referencias iniciales
Material aportado:

Entrevista a Tom Woodfin:
https://www.youtube.com/watch?v=Zsu99YW1qys&t=44s
Canal de Tom Woodfin:
https://www.youtube.com/@TomWoodfin
Mixcloud:
https://www.mixcloud.com/woodfin18/
10.2. Dirección para PACE
CTB no se integrará como una técnica breve más.

Se estudiará como una familia de Viajes que puede combinar:

respiración conectada;
respiración coherente;
rondas intensas;
retenciones;
visualización;
movimiento;
música progresiva;
liberación;
integración.
10.3. Contenido propio
PACE podrá crear sus propios Viajes, pero no copiará literalmente:

audios;
mezclas;
guiones;
nombres protegidos;
grabaciones;
estructuras autorales específicas.
Las sesiones deberán ser:

originales;
licenciadas;
colaborativas;
o creadas con material que permita explotación comercial.
10.4. Seguridad
Los Viajes intensos requerirán:

práctica sentado o tumbado;
prohibición de realizarse conduciendo;
prohibición de realizarse en agua;
prohibición de realizarse de pie;
salida siempre visible;
selector de intensidad;
instrucciones previas;
contraindicaciones;
cierre e integración;
nada de récords;
nada de presión para terminar;
revisión profesional antes de publicación;
copy legal adecuado;
diferenciación clara entre bienestar y tratamiento médico.
11. Modelo gratuito y premium para Viajes
11.1. Dirección aprobada
Se ofrecerá:

al menos un Viaje completo gratuito;
uno o dos Viajes premium con una degustación inicial;
catálogo premium completo para usuarios con acceso.
11.2. Degustación ética
No se cortará un Viaje intenso en mitad de una fase de activación.

La degustación debe ser una mini experiencia segura y cerrada:

llegada;
explicación;
primera fase suave;
integración breve;
presentación del Viaje completo.
Duración orientativa:

aproximadamente 5–8 minutos;
dependerá del contenido.
11.3. Evitar manipulación
No usar:

cuenta atrás de oferta;
urgencia;
bloqueo sorpresa;
CTA durante el pico emocional;
copy que prometa transformación si paga;
retención de datos o progreso;
frustración intencional.
La degustación debe servir para que la persona entienda:

la calidad;
el estilo;
la voz;
la música;
la estructura;
si quiere profundizar.
11.4. Propuesta inicial
CopyViaje 1 · Completo y gratuito
Viaje 2 · Degustación gratuita + completo premium
Viaje 3 · Degustación gratuita + completo premium
Resto · Premium, con ficha y preview claros
Esta estructura deberá validarse con el catálogo real y el coste de producción.

12. Modo noche
12.1. Decisión
El modo noche automático se implementará como configuración opcional.

Apariencia:

Copy● Automática
○ Día
○ Noche
○ Seguir dispositivo
12.2. Horario
En modo Automático:

horario inicial recomendado: 21:00–07:00;
horario editable por el usuario;
se utiliza la hora local;
no se solicita ubicación;
no depende del amanecer astronómico real.
12.3. Cambio durante sesiones
Si llega la hora de transición durante una sesión:

no cambiar bruscamente;
esperar a que termine;
aplicar el nuevo tema al volver a la home.
12.4. Influencia sobre el producto
El modo noche puede modificar:

paleta;
contraste;
brillo;
ilustración;
recomendación de Caminos;
tono del copy;
sonidos;
intensidad de animación;
prioridad de prácticas calmadas.
No debe ocultar contenido energizante, pero sí evitar recomendarlo automáticamente a última hora.

13. Timer visual
13.1. Referencia conceptual
El timer se percibe como un sol amaneciendo.

Esta metáfora debe aprovecharse.

13.2. Dirección visual aprobada
Combinación de:

arco funcional de progreso;
transformación ambiental;
luz o color suave;
sensación de amanecer.
13.3. Comportamiento propuesto
Durante una sesión:

un arco avanza alrededor del círculo;
la luz interior gana presencia lentamente;
puede cambiar el tono del sol;
el paisaje puede reaccionar de forma muy sutil;
los últimos minutos pueden sentirse más completos, no más urgentes.
13.4. Restricciones
Evitar:

gradientes llamativos;
destellos;
pulsos rápidos;
color rojo;
anillos de fitness agresivos;
animaciones que dificulten concentrarse;
cambios continuos de alto contraste.
13.5. Estados
El timer debe contemplar:

preparado;
activo;
pausado;
casi terminado;
terminado;
interrupción;
reduced motion;
día;
noche.
13.6. Reduced motion
Con movimiento reducido:

arco estático actualizado por segmentos;
cambio de color o luminosidad;
sin desplazamientos continuos;
sin parallax;
sin pulsación.
14. Sidebar
14.1. Problema
La sidebar debe ser más útil y funcional.

Actualmente contiene información valiosa, pero no ofrece suficiente capacidad de acción o comprensión.

14.2. Objetivos
La sidebar debería ayudar a responder:

¿cómo va mi día?
¿qué he hecho?
¿qué me falta si quiero equilibrarme?
¿cuál es mi Camino o Travesía actual?
¿qué logro he conseguido?
¿qué puedo hacer ahora?
14.3. Elementos candidatos
estado del día;
progreso de Camino;
progreso de Travesía;
último logro;
siguiente hito cercano;
resumen de Foco/Respira/Cuerpo;
hidratación;
acceso rápido a continuar;
racha compasiva;
historial breve;
sugerencia discreta.
14.4. Restricción
No debe convertirse en un panel de métricas saturado.

Debe priorizar:

continuar;
comprender;
explorar.
14.5. Móvil
En móvil, al ser drawer, debe tener:

una acción principal clara;
cierre evidente;
scroll controlado;
targets accesibles;
jerarquía equivalente a escritorio;
ninguna función exclusiva difícil de descubrir.
15. Logros y sendero
15.1. Problema visual inmediato
Las bolas de logros del sendero no muestran el icono del logro desbloqueado.

Debe corregirse para que:

un logro desbloqueado muestre su glifo;
el glifo herede el color adecuado;
el estado bloqueado no revele secretos;
el estado actual sea claro;
el tamaño funcione en sidebar y móvil.
15.2. Auditoría necesaria
Antes de integrar nuevos glifos debe crearse una matriz:

CopyID
Categoría
Nombre
Promesa
Condición
Dificultad
Momento de desbloqueo
Free/Premium
Visible/Secreto
Detector real
Estado
Glifo
15.3. Curva de progresión
Los primeros logros deben:

enseñar el sistema;
reconocer acciones distintas;
no desbloquearse todos juntos;
conducir a la siguiente acción;
crear curiosidad.
Los logros avanzados deben:

requerir repetición significativa;
reconocer equilibrio;
reconocer exploración;
reconocer Travesías;
reconocer constancia sin castigar interrupciones.
15.4. Denominadores
Debe existir una única definición clara de:

logros disponibles;
logros desbloqueados;
secretos descubiertos;
logros futuros.
Sidebar, modal, stats y toasts deben utilizar la misma lógica.

16. Gamificación PACE
16.1. Principio
PACE no necesita puntos ni monedas.

Ya tiene una base propia:

senderos;
Caminos;
Travesías;
paisajes;
logros;
rachas;
estaciones;
progreso diario;
progreso semanal;
secretos;
cambios de luz;
colección visual.
16.2. Escala inmediata
Después de una sesión:

cierre breve;
reconocimiento;
progreso visible;
siguiente acción opcional;
máximo una celebración principal.
16.3. Escala diaria
Camino sugerido;
progreso del día;
equilibrio entre módulos;
posibilidad de cerrar el día sin completar todo;
regreso amable.
16.4. Escala larga
Travesías;
colección de glifos;
hitos;
paisaje acumulativo;
temporadas;
estadísticas personales;
contenido premium profundo.
16.5. Inspiración de Forest
Forest demuestra que el tiempo acumulado funciona mejor cuando deja una huella visible.

PACE puede transformar el tiempo en:

sendero;
amanecer;
paisaje;
luz;
estaciones;
marcas en una libreta de campo.
No debe copiar:

muerte del árbol;
monedas;
tienda;
competición;
culpa por abandonar.
17. Pausa PACE
17.1. Evolución del BreakMenu
El menú post-Pomodoro actual ordena módulos según lo realizado durante el día.

Debe evolucionar para recomendar una acción concreta:

Has estado 50 minutos sentado. Te propongo “Hombros ligeros”, 4 minutos y sin material.

17.2. Información utilizada
duración del Foco;
actividades realizadas;
hora;
contexto habitual;
última pausa;
zona corporal indicada;
tiempo disponible;
feedback anterior.
17.3. Feedback
Después de una pausa puede preguntarse de forma discreta:

Me ayudó.
No era para mí.
Demasiado suave.
Demasiado intensa.
No debe preguntarse siempre.

Este feedback podrá alimentar recomendaciones futuras cuando exista la capa de eventos.

18. Mueve y Estira
18.1. Problema de descubrimiento
Las bibliotecas contienen mucho contenido, pero faltan:

filtros;
previews;
organización por necesidad;
contexto;
explicación técnica;
mejor navegación móvil.
18.2. Taxonomía propuesta
Cada rutina o ejercicio puede declarar:

objetivo;
zona corporal;
posición;
equipo;
uso del suelo;
intensidad;
duración;
espacio;
ruido;
nivel;
simetría;
contraindicaciones;
adaptación sencilla.
18.3. Preview
Antes de comenzar:

qué necesitarás;
posición;
duración;
objetivo;
pasos;
adaptación;
intensidad;
información técnica;
glifos.
18.4. Tus rutinas
El constructor debe ser visible en:

Mueve;
Estira;
posible acceso compacto común.
No debe parecer exclusivo de Mueve si admite contenido de ambos módulos.

19. Glifos
19.1. Logros
Los glifos diseñados por el usuario deberán portarse literalmente tras cerrar la coherencia del catálogo.

No improvisar versiones nuevas sin aprobación.

19.2. Mueve y Estira
Crear una matriz:

CopyEjercicio
Existe
Aprobado
Revisar
Placeholder
Alias
Una pose
Dos poses
Flecha
Apoyo
Zona corporal
Revisión técnica
19.3. Dos niveles visuales
Glifo identificativo
44×44;
tarjetas;
listas;
logros;
previews pequeñas.
Diagrama de ejecución
mayor tamaño;
runner;
una o dos poses;
flechas;
apoyo;
lado;
dirección;
zona corporal.
No exigir que el glifo pequeño explique toda la técnica.

20. Premium
20.1. Filosofía
gratuito útil;
pago comprensible;
sin urgencia;
sin cuenta obligatoria;
sin renovación automática engañosa;
propiedad local;
premium como profundidad, no como eliminación del núcleo.
20.2. Vías contempladas
Lifetime.
Pase temporal sin renovación automática.
Temporadas opcionales.
Donación separada.
Trial explícito.
20.3. Implementación necesaria
Elegir proveedor/Merchant of Record.
Definir formato de licencia.
Crear almacenamiento separado:
Copypace.license.v1
Validación offline.
Derivar entitlement.
Activación.
Caducidad.
Error y recuperación.
Import/export.
UI operativa en Tweaks.
Pruebas de reinstalación y cambio de fecha.
Términos y privacidad.
20.4. Contenido premium candidato
Viajes de respiración.
Travesías profundas.
Constructor de rutinas.
Parte del catálogo Respira/Mueve/Estira.
Stats interpretativos.
Temporadas.
Contenido de facilitadores.
20.5. Siempre gratuito
timer;
núcleo de cada módulo;
al menos un Viaje completo;
al menos una experiencia guiada útil;
propiedad de datos;
export;
borrado;
seguridad;
acceso al historial básico.
21. Benchmark externo inicial
Forest
Funciona:

progreso visual;
recompensa acumulativa;
acción sencilla;
colección.
Aplicar:

huella visible del tiempo.
Evitar:

castigo;
monedas;
competición.
Referencia: https://forestapp.cc/

Focus To-Do y Session
Funciona:

timer inmediato;
presets;
etiquetas;
estadísticas;
claridad.
Aplicar:

intención o etiqueta ligera.
Evitar:

convertir PACE en gestor completo de tareas.
Othership
Funciona:

experiencias por estado;
música;
viajes;
sesiones largas;
producción cuidada;
facilitadores.
Aplicar:

Viajes de respiración;
fases;
música estructural;
estados y objetivos.
Evitar:

promesas grandilocuentes;
catálogo repetitivo;
precio o suscripción agresiva.
Referencia: https://www.othership.us/app

Breathwrk
Funciona:

visual;
audio;
voz;
hápticos;
objetivos;
sesiones breves.
Aplicar:

guía multisensorial;
uso con ojos cerrados;
hápticos opcionales;
loto funcional.
Referencia:
https://play.google.com/store/apps/details?id=com.breathwrk.android

StretchMinder y Wakeout
Funciona:

ejercicios de oficina;
poco espacio;
sesiones breves;
contexto;
recordatorios;
técnica narrada.
Aplicar:

sentado/de pie;
suelo;
espacio;
material;
duración.
Referencias:

https://apps.apple.com/us/story/id1615455982
https://wakeout.app/
Calm, Headspace y Balance
Funciona:

programas;
personalización;
emergencias breves;
progresión;
sesiones cortas y largas.
Aplicar:

Travesías;
recomendación ligera;
introducciones progresivas.
Evitar:

home infinita;
catálogo saturado;
recomendación opaca;
bloqueo casi total.
Referencias:

https://www.calm.com/
https://www.headspace.com/app
https://themindcompany.com/apps/balance
Fabulous
Funciona:

narrativa;
capítulos;
rituales;
ilustración;
retorno diario.
Evitar:

trials confusos;
cobros poco claros;
múltiples suscripciones;
cancelación difícil;
presión comercial.
Referencia:
https://www.trustpilot.com/review/thefabulous.co

22. Diferenciación de PACE
La combinación diferencial será:

Foco.
Respiración.
Movimiento.
Estiramiento.
Hidratación.
Caminos.
Travesías.
Viajes de respiración.
Contexto laboral.
Progreso visual artesanal.
Local-first.
Sin cuenta.
Sin tracking.
Pago único.
Identidad gráfica propia.
Recomendación voluntaria.
Gamificación calmada.
PACE no debe intentar ganar por cantidad de contenido.

Debe ganar por:

coherencia;
integración;
belleza;
claridad;
utilidad diaria;
privacidad;
cuidado editorial.
23. Orden de trabajo recomendado
Bloque 0 · Consolidación actual
Cerrar pendientes visuales del timer. (HECHO s124 · v0.67.0)
Corregir scrollbar del runner. (HECHO s125 · v0.68.0 — diagnóstico medido: en ancho ≥641px NO desborda; en móvil ≤640px desborde mínimo de 3px a ≤~624px por el NOMBRE del ejercicio a 2 líneas; fix = ocultar la barra conservando el scroll, CONFINADO al runner v1 vía `:has([data-pace-v1-progress])`, sin compactar copy/glifos/tipografía)
Salida táctil de Caminos. (HECHO s127 · v0.70.0 — definido por el usuario: «cuando pulsas salir no sale al home, simplemente va a la siguiente actividad». Causa: el botón «Salir» de SessionShell emite `onExit('exit')`, los runners lo pasan tal cual a `PathRunner.handleStepExit` y ese motivo NO estaba contemplado → caía en `advancePathStep` = siguiente paso. Fix: `handleStepExit` intercepta `'exit'` y delega en el `handleRequestExit` ya existente —una sola política de salida: paso opcional sale directo, el resto confirma—. Escape emitía el mismo motivo, así que también queda arreglado. Contabilidad intacta: salir no acredita)
Estabilidad de Stats. (REENCUADRADO en s129 — ver `docs/product/STATS_DESTINO_PROPUESTA.md`. Definición original del usuario: las pestañas **semana / mes / año / caminos tienen alturas distintas** y al cambiar de pestaña el salto visual queda muy raro; trabajo = igualar la altura, no rehacer las stats. Al auditar el sistema completo ANTES de implementar se vio que el ítem no es sostenible tal cual: §37.4 manda que Stats sea **Hoy y Semana**, §31.6 manda Mes y Año a **premium**, la pestaña Hoy **no existe**, y §37.3 sustituye dos mecanismos vivos —el color por volumen de `computeDayScore` y las **rachas** de PathStats—. Estabilizar las 4 pestañas de hoy sería trabajo sobre vistas condenadas. Medición de s129 (v0.71.0, peor caso): chrome 221px · contenido Semana 397 / Mes 368 / Año 226 / **Caminos 529** ⇒ la card salta de 448 a 751px de alto y su techo 152px; en 1366×610 (viewport real de una pantalla 1366×768) el hueco útil es 298px, así que el exceso es de VOLUMEN, no de CSS. Queda dividido en fases: **Fase 0 = marco de altura estable** (lo único agnóstico al contenido, ejecutable ya) y **Fase 1 = Hoy + Semana**, que resuelve el exceso por diseño)
~~Revisar pills.~~ **CERRADO** (eran las del timer, ya implementadas). **Sustituido por: bibliotecas de Respira/Mueve/Estira** (DEFINIDO por el usuario, PENDIENTE): reorganizarlas para **reducir el scroll hacia abajo, sobre todo en móvil**, y **sacar el selector de rutinas premium a Mueve Y Estira a la vez** en lugar de hundido al final de la lista — es una función premium e interesante y ahora no se ve.
Trocear archivos que superan límites. (PENDIENTE — inventario real a v0.70.0: solo DOS archivos pasan de 500 líneas, `app/glyphs/exercise-glyphs.jsx` (571) y `app/shell/Sidebar.jsx` (543). Troceo mecánico, delta cero)
Reparar glifos en las bolas de logros. (PENDIENTE — §15.1. La maquinaria ya existe: `AchGlyph` en `app/achievements/Achievements.jsx` con `glyphSvg` y fallback unicode; el sendero y la vista previa de logros viven en `app/shell/Sidebar.jsx`, que es además uno de los dos archivos a trocear → conviene hacer ambos en la misma sesión)
Bloque 1 · Respira y Loto
Optimizar asset.
Integrar Loto.
Definir comportamiento animado.
Día/noche.
Reduced motion.
Revisar catálogo.
Separar Técnicas y Viajes.
Bloque 2 · Descubrimiento
Taxonomía de necesidades.
Taxonomía de contexto.
Filtros.
Previews.
Onboarding contextual.
“Déjate guiar” discreto.
Recomendación principal y alternativas.
Bloque 3 · Caminos
Auditar los 7 actuales.
Decidir cuáles conservar.
Reescribir como experiencias.
Definir Semilla/Pausa/Ritual.
Crear pasos editoriales.
Motor de hitos variables.
Nuevas láminas.
Transiciones y cierres.
Revisión de duración.
Bloque 4 · Travesías
Contrato de datos.
Capítulos flexibles.
Progreso.
Reanudación.
Primera Travesía de 3 capítulos.
Primera Travesía de 7 capítulos.
Integración de premium.
Mapa visual.
Bloque 5 · Viajes de respiración
Definir formato.
Seguridad.
Guion.
Música.
Voz.
Facilitadores.
Viaje gratuito.
Dos degustaciones premium.
Viajes completos premium.
Revisión profesional.
Bloque 6 · Gamificación y logros
Matriz de 106 logros.
Curva de progresión.
Denominadores.
Detectores.
Toasts.
Sendero.
Integración de glifos.
Logros de Caminos.
Logros de Travesías.
Bloque 7 · Mueve y Estira
Taxonomía.
Filtros.
Previews.
Tus rutinas.
Inventario de glifos.
Diseños.
Diagramas.
Revisión técnica.
Bloque 8 · Premium real
Proveedor.
Licencia.
Entitlement.
Trial.
UI.
Stats premium.
Contenido.
Legal.
QA.
Bloque 9 · Eventos y lanzamiento
Implementar pace.events.v1.
Recomendación.
“Qué te ayuda”.
Tests.
Accesibilidad.
Web/PWA/standalone.
Preparación Capacitor.
Landing.
Preventa/lanzamiento.
24. Decisiones cerradas
PACE será una aplicación equilibrada.
Habrá uso libre y guía voluntaria.
“Déjate guiar” será discreto y no alterará demasiado la home.
Existirán Caminos y Travesías.
Las Travesías serán un diferencial principal.
Habrá Travesías de 3, 7 y 14 capítulos.
El ritmo será recomendado, no obligatorio.
Habrá Caminos Semilla, Pausa y Ritual.
Los Rituales podrán llegar hasta 60 minutos.
Los Caminos tendrán longitud variable.
Los Caminos serán híbridos y especiales.
Cada Camino tendrá su propia lámina.
Los hitos serán dinámicos.
Los nombres serán poéticos con explicación práctica.
La necesidad será principal.
El contexto influirá.
La hora influirá sin bloquear.
Foco no será obligatorio en todos los Caminos.
Respira tendrá Técnicas y Viajes.
CTB se estudiará como Viaje, no como técnica breve.
Los Viajes podrán vivir en Respira y en Travesías.
Habrá voz, señales mínimas y solo música.
Se contemplan facilitadores.
Habrá al menos un Viaje gratuito completo.
Uno o dos Viajes premium podrán tener degustación.
La degustación será segura, cerrada y no manipulativa.
El modo noche automático será configurable.
Horario inicial recomendado: 21:00–07:00.
No cambiará de tema durante una sesión.
El timer evolucionará como un amanecer.
Tendrá arco funcional y transformación ambiental.
La sidebar se hará más útil.
Las bolas de logros deben mostrar los glifos desbloqueados.
La auditoría se conservará en un documento canónico.
25. Preguntas abiertas para próximas rondas
Home
¿Dónde se coloca exactamente “Déjate guiar”?
¿La recomendación sustituye o amplía la tarjeta de Camino actual?
¿Cuánta información cabe sin recargar?
¿Qué ocurre si la persona ignora siempre la recomendación?
Timer
¿Qué colores tendrá el amanecer?
¿El sol cambia de tamaño, luz o posición?
¿Qué transformación queda al completar?
¿Cómo se muestra una sesión pausada?
Sidebar
¿Cuál es su acción principal?
¿Mostrar el Camino actual o el día completo?
¿Qué se elimina para evitar saturación?
¿Cómo conviven racha, Travesía, logros y actividad diaria?
Caminos
Catálogo inicial.
Número exacto de Caminos.
Cuáles son gratuitos.
Cuáles son premium.
Qué Caminos actuales se conservan.
Qué necesidades necesitan más de un Camino.
Cuántas láminas nuevas producir.
Travesías
Primera Travesía que se diseñará.
Progreso visual.
Recompensa final.
Si pueden coexistir varias activas.
Si un capítulo puede saltarse.
Si una Travesía puede repetirse.
Cómo se muestran en home y sidebar.
Respira
Primer Viaje gratuito.
Primer Viaje CTB.
Voces.
Música.
Facilitadores.
Idiomas.
Seguridad.
Descarga y peso del standalone.
Premium
Precio.
Proveedor.
Duración del Pase.
Trial.
Temporadas.
Licencias de contenido.
Reparto con facilitadores.
Viajes incluidos.
Gamificación
Metáfora acumulativa principal.
Cómo crece el paisaje.
Cómo se celebra una Travesía.
Qué ocurre con la racha.
Cuándo aparece un logro.
Cómo se evita saturar.
26. Fuentes principales del repositorio
Rama actual:
https://github.com/ezradesign/Pace_app/tree/main
Estado:
https://github.com/ezradesign/Pace_app/blob/main/STATE.md
Roadmap:
https://github.com/ezradesign/Pace_app/blob/main/ROADMAP.md
Contenido:
https://github.com/ezradesign/Pace_app/blob/main/CONTENT.md
Monetización:
https://github.com/ezradesign/Pace_app/blob/main/MONETIZATION.md
Sistema de diseño:
https://github.com/ezradesign/Pace_app/blob/main/DESIGN_SYSTEM.md
Decisiones de producto:
https://github.com/ezradesign/Pace_app/blob/main/docs/product/DECISIONES_PRODUCTO.md
Caminos:
https://github.com/ezradesign/Pace_app/blob/main/app/paths/registry.js
Logros:
https://github.com/ezradesign/Pace_app/blob/main/app/achievements/catalog.js
Detectores de logros:
https://github.com/ezradesign/Pace_app/blob/main/app/state-achievements.jsx
Glifos de logro:
https://github.com/ezradesign/Pace_app/blob/main/app/glyphs/achievement-glyphs.jsx
Glifos de ejercicio:
https://github.com/ezradesign/Pace_app/blob/main/app/glyphs/exercise-glyphs.jsx
Entitlement:
https://github.com/ezradesign/Pace_app/blob/main/app/state-entitlement.jsx
Premium:
https://github.com/ezradesign/Pace_app/blob/main/app/tweaks/PremiumSection.jsx
Respira:
https://github.com/ezradesign/Pace_app/blob/main/app/breathe/BreatheLibrary.jsx
Visual de Respira:
https://github.com/ezradesign/Pace_app/blob/main/app/breathe/BreatheVisual.jsx
Eventos diseñados:
https://github.com/ezradesign/Pace_app/blob/main/docs/product/EVENTOS_SCHEMA.md

27. Posicionamiento definitivo y público inicial
27.1. Lema oficial
Se confirma como lema de PACE:

Touch grass, even from your desk.

Esta es la formulación oficial. No sustituir por “at your desk”.

El lema expresa que PACE ayuda a recuperar una relación más natural con el tiempo, el cuerpo y la atención sin necesidad de abandonar el entorno de trabajo.

Debe convivir con una explicación más funcional, porque por sí solo es memorable pero no describe todo el producto.

Posible combinación comercial
Touch grass, even from your desk.
Focus and wellbeing for people who work sitting down.

En español:

Foco y bienestar para quienes trabajan sentados.

El lema aporta personalidad. La segunda frase explica la categoría.

27.2. Público principal
PACE se dirigirá inicialmente a:

Personas que teletrabajan.
Profesionales creativos y digitales.
Personas que pasan muchas horas trabajando sentadas.
Estos grupos comparten:

trabajo prolongado ante una pantalla;
dificultad para hacer pausas de calidad;
fatiga física y mental;
alternancia entre concentración y distracción;
uso fragmentado de varias aplicaciones;
poco espacio o tiempo para moverse;
necesidad de cuidar el cuerpo sin abandonar completamente la jornada.
Los estudiantes pueden beneficiarse de PACE, pero no serán necesariamente el público principal de la primera comunicación.

PACE tampoco se posicionará médicamente alrededor del TDAH. Puede resultar útil para personas con dificultades de atención, pero no realizará promesas clínicas ni utilizará una condición como argumento comercial principal.

27.3. Problemas principales
PACE deberá comunicar que responde a cuatro problemas conectados:

A. Trabajo sedentario
Paso demasiadas horas sentado y no sé cómo introducir movimiento durante el día.

B. Agotamiento físico y mental
Termino la jornada cansado, cargado y con la sensación de haber estado demasiado tiempo delante de la pantalla.

C. Fragmentación
Necesito varias aplicaciones para concentrarme, respirar, moverme, estirar e hidratarme.

D. Pausas poco útiles
Sé que debería parar, pero no sé cuándo hacerlo ni qué actividad me conviene en cada pausa.

La distracción sigue siendo relevante, pero no será el único problema ni necesariamente el principal.

La promesa debe evitar reducir PACE a “una app para hacer más Pomodoros”.

27.4. Momento central de uso
PACE se concibe como:

Un acompañante discreto durante toda la jornada.

No requerirá atención continua.

Podrá permanecer disponible mientras la persona trabaja y aparecer solamente cuando sea útil:

al empezar un bloque de Foco;
al terminarlo;
cuando toca una pausa;
al continuar un Camino;
al completar un capítulo de una Travesía;
cuando la persona desea moverse, respirar o beber agua;
al cerrar la jornada.
PACE no debe vigilar ni interrumpir constantemente.

27.5. Propuesta central
Propuesta funcional recomendada:

La herramienta para trabajar concentrado sin abandonar el cuerpo.

Propuesta de categoría:

Desk wellbeing + mindful focus.

Formulación alternativa en español:

Foco y bienestar para quienes trabajan sentados.

Narrativa completa:

PACE transforma el trabajo sedentario en un ritmo equilibrado de atención, respiración y cuerpo.

28. Viabilidad comercial
28.1. Valoración general
PACE tiene salida comercial como producto independiente de nicho si se completa con profundidad y evita convertirse en una colección dispersa de funciones.

El potencial no procede únicamente de tener muchas herramientas, sino de conectar de forma coherente:

Foco.
Respiración.
Movimiento.
Estiramiento.
Hidratación.
Pausas activas.
Caminos.
Travesías.
Viajes de respiración.
Progreso visual.
Privacidad local-first.
Valoración orientativa
Potencial de producto: alto.
Potencial comercial inicial: moderado y realista como producto indie premium.
Potencial diferencial: alto.
Riesgo principal: comunicar demasiadas herramientas sin una promesa unificadora.
Oportunidad principal: crear una categoría reconocible alrededor del bienestar durante el trabajo de escritorio.
No se debe asumir todavía un mercado masivo comparable al de Forest, Calm o Headspace. La distribución, el contenido, el audio, la confianza profesional y la presencia multiplataforma determinarán el alcance real.

28.2. Diferenciales comerciales
Integración
La mayoría de las personas necesita aplicaciones separadas para:

Pomodoro;
respiración;
estiramientos;
ejercicio;
hidratación;
hábitos.
PACE puede integrarlas dentro de un único ritmo.

Identidad visual
PACE no se presenta como una plantilla genérica de productividad.

Tiene:

papel;
tinta;
tipografía editorial;
glifos propios;
paisajes;
Caminos;
la vaca;
el timer-sol;
tono calmado;
identidad artesanal.
Contexto de escritorio
PACE está diseñada específicamente para personas que trabajan sentadas.

No obliga a abandonar el espacio de trabajo para cuidar el cuerpo.

Privacidad
Sin cuenta obligatoria.
Sin tracking comercial.
Sin backend para el núcleo.
Datos locales.
Exportación.
Borrado.
Propiedad de los datos.
Pago comprensible
El pago único puede diferenciar a PACE de aplicaciones de bienestar basadas en suscripciones anuales elevadas.

Caminos y Travesías
Si se ejecutan bien, serán la capa que convierta herramientas separadas en un sistema de producto con identidad, narrativa y retorno.

Viajes de respiración
Pueden aportar profundidad, contenido premium y colaboraciones con facilitadores.

Gamificación calmada
PACE puede hacer visible el progreso mediante:

paisaje;
luz;
senderos;
hitos;
logros;
Travesías;
estaciones;
sin utilizar monedas, rankings o castigos.

28.3. Aspectos donde PACE todavía no destaca
Caminos actuales
Todavía reutilizan demasiado contenido y tienen poca identidad propia.

Bibliotecas
Tienen amplitud, pero aún necesitan:

filtros;
previews;
contexto;
necesidades;
navegación móvil;
explicación técnica.
Progreso acumulativo
Todavía no existe una metáfora tan inmediatamente comprensible como el bosque de Forest.

Producción de Respira
Faltan:

voz;
audio premium;
música;
Viajes;
facilitadores;
guía multisensorial completa.
Confianza profesional
Para publicar contenido corporal y respiración intensa se necesita:

revisión profesional;
contraindicaciones;
fuentes;
transparencia;
créditos;
copy de seguridad;
límites claros.
Distribución
La web por sí sola puede resultar difícil de descubrir.

A medio plazo serán importantes:

extensión de navegador;
PWA;
Android;
iOS;
landing comercial;
contenido demostrativo;
comunidad;
colaboraciones;
recomendaciones orgánicas.
28.4. Cliente de pago inicial
Los primeros clientes de pago previstos son:

Personas individuales que compren Lifetime.
Usuarios que ya utilizan el timer gratuito y desean profundizar.
El recorrido comercial ideal es:

CopyTimer gratuito útil
→ Pausas y actividades
→ Caminos
→ Primer Viaje gratuito
→ Travesía o constructor
→ Lifetime
PACE debe demostrar valor antes de presentar premium.

28.5. Empresas como fase futura
Una versión para empresas puede ser una oportunidad importante a medio o largo plazo.

Posibles funciones:

licencias por equipo;
instalación sencilla;
Caminos para oficina;
pausas colectivas opcionales;
contenido ergonómico;
privacidad;
configuración organizativa;
estadísticas agregadas y anónimas solo si se diseñan éticamente;
ausencia de vigilancia individual.
Riesgos a evitar:

seguimiento de productividad;
supervisión del trabajador;
compartir hábitos individuales con la empresa;
rankings entre empleados;
presión para realizar pausas;
tratar datos de bienestar como métricas laborales.
La versión empresarial no debe condicionar la arquitectura inicial ni retrasar el producto individual.

29. Dificultad de Mueve y Estira
29.1. Nivel general
El catálogo principal se orientará a:

principiante;
principiante–medio;
medio accesible.
PACE no busca demostrar cuánto ejercicio puede soportar una persona.

Busca:

Contrarrestar los efectos físicos y mentales del trabajo sedentario.

29.2. Intensidad
No se obligará a la persona a declarar un nivel general durante el onboarding.

La dirección elegida es:

PACE será suave–medio por defecto.
La intensidad se podrá filtrar dentro de las bibliotecas.
Cada rutina informará claramente de su intensidad.
Las recomendaciones automáticas evitarán contenido avanzado salvo elección explícita.
Posibles etiquetas:

Suave.
Medio.
Intenso.
La intensidad no debe confundirse con dificultad técnica.

Un ejercicio puede ser:

técnicamente sencillo pero intenso;
técnicamente complejo pero físicamente suave.
Cuando sea necesario, se distinguirán:

CopyIntensidad: suave / media / intensa
Nivel técnico: básico / intermedio / avanzado
29.3. Núcleo sin material
El núcleo gratuito debe poder utilizarse:

sin material;
sin suelo;
en poco espacio;
desde un escritorio;
en un entorno compartido;
con poco ruido.
Esto no impide ofrecer rutinas con:

suelo;
pared;
barra;
silla;
banda elástica;
material adicional.
Pero esos requisitos deben indicarse antes de comenzar.

29.4. Contenido avanzado
Ejercicios avanzados:

no se recomendarán por defecto;
llevarán requisitos visibles;
tendrán regresión;
necesitarán instrucciones claras;
deberán revisarse técnicamente;
podrán formar parte de contenido premium o Travesías específicas.
Ejemplos que requieren tratamiento especial:

Sissy squat.
Nordics.
Progresiones profundas de rodilla.
Ejercicios exigentes de barra.
Movimientos con alto componente técnico.
Ejercicios con equilibrio avanzado.
No deben representar el tono principal de PACE.

29.5. Zonas prioritarias
El catálogo debe priorizar necesidades frecuentes del trabajo de escritorio:

cuello;
hombros;
espalda;
muñecas;
manos;
caderas;
piernas;
circulación;
postura;
descanso visual;
respiración;
activación general.
30. Acompañamiento discreto
PACE acompañará la jornada sin vigilancia.

A medio plazo puede existir como:

extensión;
icono en bandeja;
widget;
ventana compacta;
timer flotante;
notificación discreta;
indicador de pausa.
Principios:

ninguna interrupción constante;
nada de alertas culpabilizadoras;
frecuencia configurable;
opción de silenciar;
respeto al modo Foco;
respeto al modo noche;
ninguna monitorización oculta;
ninguna inferencia opaca;
ninguna obligación de mantener la app visible.
La persona abre PACE conscientemente, pero PACE puede recordarle de manera calmada que lleva tiempo sin parar.

31. Métricas de éxito del producto
31.1. Métricas principales elegidas
PACE funcionará si ayuda a que la persona:

Termine el día sintiéndose mejor.
Quiera volver varias veces por semana.
Estas son las dos métricas principales.

Métricas de apoyo:

moverse más durante el trabajo;
completar Caminos;
avanzar en Travesías;
realizar pausas útiles;
encontrar prácticas que realmente ayudan.
El número de Pomodoros completados no será la métrica principal.

31.2. Implicaciones para Stats
El panel de estadísticas no debe reducir el éxito a:

minutos trabajados;
Pomodoros;
días consecutivos;
volumen de actividad.
Debe distinguir entre:

Actividad
Qué hizo la persona:

minutos de Foco;
pausas;
Respira;
Mueve;
Estira;
hidratación;
Caminos;
capítulos de Travesías.
Resultado percibido
Cómo le sentó:

me ayudó;
un poco;
no me ayudó;
cómo terminó el día;
qué prácticas suele valorar mejor.
Retorno
días de uso;
semanas activas;
regularidad;
reanudación de Travesías;
retorno después de una pausa prolongada.
Equilibrio
Foco acompañado de pausas;
tiempo sedentario interrumpido;
variedad de módulos;
equilibrio semanal.
31.3. Dirección del panel de Stats
El panel debe responder preguntas humanas:

¿He cuidado mejor mi jornada?
¿Estoy haciendo pausas?
¿Qué me ayuda?
¿Qué suelo ignorar?
¿Estoy terminando el día mejor?
¿Qué Caminos repito?
¿Cómo avanza mi Travesía?
¿Estoy trabajando demasiado tiempo sin moverme?
No debe parecer un panel empresarial de productividad.

31.4. Posible estructura
Hoy
tiempo de Foco;
pausas realizadas;
movimiento;
respiración;
agua;
Camino o Travesía;
cierre opcional del día.
Semana
días en que se utilizó PACE;
pausas activas;
equilibrio entre módulos;
prácticas valoradas positivamente;
ritmo, no racha punitiva.
Mes
patrones;
Caminos más repetidos;
evolución del equilibrio;
días con y sin pausas;
consistencia flexible.
“Qué te ayuda”
Disponible cuando exista suficiente información:

prácticas mejor valoradas;
duración que suele funcionar;
momento del día;
tipo de pausa;
contexto.
Esta función requerirá pace.events.v1.

No se mostrarán conclusiones con muestras insuficientes.

31.5. Check-in de cierre
Se puede valorar un check-in opcional y poco frecuente:

¿Cómo terminas hoy?

Posibles respuestas:

Mejor.
Igual.
Más cansado.
O una formulación más editorial:

Con más aire.
Más o menos igual.
Hoy ha pesado.
Debe cumplir:

una vez al día como máximo;
siempre opcional;
nunca bloquear;
no aparecer después de cada sesión;
no interpretar estados emocionales como diagnóstico;
no utilizarse para vender premium en ese momento.
Esta decisión queda pendiente de diseño y validación con beta testers.

31.6. Free y premium
Se mantiene la dirección previamente acordada:

Free
resumen de Hoy;
tira de siete días;
datos básicos;
exportación;
borrado;
propiedad de los datos.
Premium
mes;
año;
patrones;
“qué te ayuda”;
comparaciones contigo mismo;
interpretación de tendencias;
progreso profundo de Caminos y Travesías.
Principio:

Premium puede interpretar los datos, pero nunca apropiarse de ellos.

32. Hallazgo responsive de la home
32.1. Evidencia visual
En un escritorio ancho con poca altura útil:

la primera carga muestra parcialmente las Actividades;
se necesita un pequeño desplazamiento;
después del desplazamiento la composición queda correctamente enmarcada;
aparece aire debajo de las Actividades;
Timer, Camino y Actividades se perciben como una composición completa.
La poca altura útil está condicionada por:

pestañas;
barra de navegación;
favoritos;
interfaz del navegador;
escalado del sistema.
32.2. Causa
La implementación v0.66.0 mantiene un aro mínimo generoso:

Copymin(86vw, 520px, max(300px, 58dvh))
La decisión actual prefiere un pequeño scroll antes que reducir demasiado el timer.

Esto evita que el aro pierda presencia, pero provoca que Actividades aparezca cortado en determinados portátiles o ventanas con poca altura.

32.3. Nueva invariante propuesta
En escritorio ancho y bajo, la home debe mostrar Timer → Camino → Actividades con al menos 16–20 px de aire inferior sin scroll inicial.

En móvil o alturas extremas, el scroll puede mantenerse como red de seguridad.

32.4. Solución recomendada
Crear un tratamiento específico para:

Copyancho ≥ 769 px
altura útil ≤ 650 px
En este rango:

permitir que el aro baje aproximadamente a 270–280 px;
reducir ligeramente espacios secundarios;
mantener la jerarquía;
conservar la metáfora del sol;
mantener el solapamiento con Camino;
no ocultar controles;
no cambiar el orden;
no comprimir en exceso las Actividades.
El aro debe ser el elemento flexible principal.

32.5. Estado de decisión
RESUELTO en s126 / v0.69.0 (2026-07-29). Lo anterior queda como HISTORIA del hallazgo; la
decisión ejecutable vigente es 32.6.

32.6. Decisión aprobada (s126 / v0.69.0)

Home Desktop sin scroll, timer proporcional y metáfora del sol amaneciendo, con estas
invariantes:

- **Home completa sin scroll** en Desktop (≥769px) con altura útil ≳672px:
  `overflowV ≤ 2px` y `overflowH ≤ 2px`, a zoom 100 % y tamaño de fuente normal.
- **Timer proporcional**: el diámetro D es la unidad base y el interior del aro escala con
  él. D lo manda la ALTURA disponible (arranca en `min(0.42·W, 520)` y encoge hasta caber),
  no el ancho — como en la referencia v0.64, donde salía de `flex:1 + 56vh`.
- **Sol amaneciendo**: las Actividades solapan el arco inferior del círculo y el aro se
  RECORTA en esa línea (`clip-path` sobre el marco). No es un accidente de `overflow:hidden`
  como en v0.64: es la composición buscada. El horizonte nunca sube por encima de los
  puntos de CICLO.
- **Solapamiento nominal 16 % de D**, tolerancia 0.14–0.17, medido como
  `(circleRect.bottom − activitiesRect.top) / circleRect.height`.
- **Excepción de zoom de accesibilidad**: a 150–200 % puede aparecer scroll vertical. En
  ese caso nada puede cortarse, no puede aparecer scroll horizontal, el orden se mantiene y
  el contenido sigue operable. No se deforma el diseño para evitarlo.
- **Suelo de accesibilidad**: el CTA conserva 44×44 CSS px. No se sacrifica para ganar
  altura.

- **Compactación en alturas cortas**: por debajo de 700px de alto el presupuesto vertical
  EXTERIOR (TopBar, huecos del selector de minutos, paddings de Actividades y de la tarjeta
  de Camino) se compacta de forma **progresiva** —no por breakpoint— y lo liberado va
  íntegro al diámetro del aro. Solo se toca AIRE: ningún texto, tamaño de fuente ni glifo
  cambia, y el CTA conserva sus 44px. Por encima de 700px la compactación es CERO.

**Límite conocido y aceptado (medido, tras la compactación).** El interior del aro tiene
~72px fijos (CTA 44px + fila de CICLO); el hueco bajo el CICLO vale `(D − H)/2 − 4` con
`H ≈ 0.485·D + 72`, así que `0.16·D` exige D ≥ 413 y `0.14·D` exige D ≥ 342. Con la
compactación, el contrato se cumple hasta **~610px de altura de viewport** (1366×610 —el
caso real de una pantalla 1366×768 con el chrome del navegador— da ratio 0.1433 sin scroll).

Queda fuera:

- **1280×600 y 1024×600: 0.1373**, tres milésimas bajo el suelo. Cerrarlo exigiría tocar
  densidad de chips o contenido de la tarjeta, fuera del paquete aprobado por el usuario.
- **1024×512 (0.0429) y 844×390 (0.0341, con 119px de scroll)**: alturas extremas donde la
  aritmética no da.

En ese régimen la degradación es gradual y segura: el aro encoge, el solapamiento se reduce
y **nunca tapa el CICLO**. Subir el solapamiento lo taparía (§5 lo prohíbe) y encoger el CTA
rompería accesibilidad (§7).

**Ámbito.** Todo lo anterior es Desktop (≥769px). En móvil/tablet sigue vigente el modelo
«atardecer» de s123: la tarjeta de Camino, opaca y casi de ancho completo, ya corta el aro
por su borde superior.

33. Comunicación para beta testers
33.1. Mensaje de WhatsApp
🐄🌱 ¡Hola, beta testers de PACE!

Durante los últimos días hemos seguido trabajando mucho en la app y ya está disponible una nueva versión para probar:

👉 https://paceweb.pages.dev/

¿Qué ha cambiado?

🧘‍♀️ Mueve y Estira ahora guían mucho mejor las sesiones

• Las repeticiones avanzan con un ritmo guiado.
• PACE te avisa cuando toca cambiar de lado.
• Hay tiempo para colocarte antes de empezar.
• Las instrucciones separan mejor qué hacer y cómo cuidarte.
• Las pausas entre series se sienten más naturales.
• Muchas rutinas antiguas ya utilizan el nuevo sistema.

🌅 La home es más clara y visual

• El timer se distingue ahora como Foco manual.
• Los Caminos muestran mejor su duración y número de pasos.
• Los botones explican claramente si vas a empezar Foco o iniciar un Camino.
• El Camino cruza ligeramente el círculo del timer, como un sol en el horizonte.
• Se ha mejorado el comportamiento en pantallas de distintos tamaños.

💬 Nuevo feedback al terminar

Después de algunas sesiones de Respira, Mueve o Estira podéis indicar si la pausa os ayudó:

Sí · Un poco · No

Es completamente opcional y nos ayudará a mejorar las recomendaciones.

🛠️ También hemos corregido y afinado

• estabilidad de las pantallas de ejercicios;
• transiciones entre ejercicios y lados;
• tiempos reales de las rutinas;
• textos de seguridad;
• comportamiento del timer al recargar;
• diseño en portátiles y pantallas pequeñas.

🐄 Nos vendría genial que la probéis esta semana.

Sobre todo queremos saber:

1️⃣ ¿Entendéis la diferencia entre Foco manual, Camino y Actividades nada más entrar?
2️⃣ ¿Tenéis que hacer scroll para ver completas las actividades de abajo?
3️⃣ Probad una rutina de Mueve o Estira: ¿hay algún ejercicio cuya explicación no entendáis?
4️⃣ ¿La sesión avanza sola de una forma cómoda o hay algún momento demasiado rápido o lento?
5️⃣ ¿Hay alguna rutina o Camino que repetirías mañana?

Si encontráis algo raro, enviad una captura y decidnos:

• móvil u ordenador;
• navegador;
• qué estabais haciendo;
• qué esperabais que ocurriera.

¡Gracias por ayudarnos a construirla! 🐄🌱
Touch grass, even from your desk.

33.2. Captura recomendada
Utilizar la segunda captura compartida porque:

muestra la jerarquía completa;
el aro queda bien encuadrado;
el Camino se entiende;
aparecen las cuatro Actividades;
existe aire inferior;
comunica mejor la composición deseada.
La primera captura debe conservarse como evidencia interna del problema responsive.

Para crear una captura limpia:

Abrir https://paceweb.pages.dev/.
Utilizar zoom del navegador al 100 %.
Realizar el pequeño desplazamiento necesario.
Usar Win + Shift + S.
Capturar el área de la aplicación.
Decidir si se conserva o elimina la interfaz del navegador.
Para un grupo beta puede ser útil mostrar el navegador, porque demuestra que la app se prueba sin instalar nada.

34. Avances recientes utilizados en la comunicación
Resumen de las versiones recientes:

v0.56.0: auditoría UX del runner, colocación y mejoras responsive.
v0.57.0: repeticiones guiadas y cambio automático de lado.
v0.58.0: instrucciones por capas, adaptación y descansos configurables.
v0.59.0: contrato formal de ejercicios y duración derivada.
v0.60.0: feedback ligero al terminar sesiones.
v0.61.0–v0.64.0: migración progresiva de Mueve y Estira al runner nuevo.
v0.65.0: claridad de la home.
v0.66.0: modelo responsive “atardecer”.
Referencia:

Copymain
9a126257d69e5d50d0ac71f3400e81743a6f2a05
v0.66.0
Antes de trabajar desde una conversación nueva se debe consultar main, porque esta referencia puede haber cambiado.

35. Decisiones cerradas en esta ronda
Lema oficial:
Touch grass, even from your desk.

Público inicial:
personas que teletrabajan;
profesionales creativos y digitales;
personas que trabajan muchas horas sentadas.
Problemas principales:
sedentarismo;
agotamiento físico y mental;
fragmentación entre aplicaciones;
no saber cuándo parar ni qué hacer.
PACE será un acompañante discreto durante toda la jornada.
El catálogo físico será suave–medio por defecto.
La intensidad se filtrará dentro de las bibliotecas.
El núcleo gratuito podrá utilizarse:
sin material;
sin suelo;
en poco espacio.
Cliente de pago inicial:
comprador individual de Lifetime;
usuario del timer gratuito que desea profundizar.
La versión para empresas se contempla como oportunidad futura.
El acompañamiento será discreto, configurable y sin vigilancia.
Métricas principales:
terminar el día sintiéndose mejor;
volver varias veces por semana.
Métricas de apoyo:
moverse más;
completar Caminos;
avanzar en Travesías.
El panel de Stats debe reconsiderarse desde estas métricas.
Stats debe medir actividad, resultado percibido, retorno y equilibrio.
El número de Pomodoros no será la medida principal del éxito.
El WhatsApp para beta testers utilizará el lema oficial confirmado.
36. Preguntas abiertas para la próxima conversación
Métricas y Stats — TODAS RESUELTAS en s133 (§37 bis), salvo la última
[RESUELTA] ¿PACE debe preguntar “¿Cómo terminas hoy?”? → SÍ, ocasional y en cierres naturales (§37bis.4)
[PENDIENTE, editorial] ¿Qué respuestas debería ofrecer? → formulación exacta en la sesión que lo implemente (Fase 3); las candidatas están en §31.5
[RESUELTA] ¿Equilibrio diario o evitar la puntuación? → tres marcas foco·cuerpo·respiración, SIN nota (§37bis.2)
[RESUELTA] ¿Cómo representar días imperfectos sin transmitir fracaso? → tipos de jornada descriptivos + hueco neutro (§37bis.3)
[RESUELTA] ¿Qué debe verse primero al abrir Stats? → Hoy (§31.4 + STATS_DESTINO_PROPUESTA.md)
[RESUELTA] ¿La racha se conserva, se transforma o se elimina? → transformada en RITMO SEMANAL (§37bis.1)
[ABIERTA A PROPÓSITO] ¿Qué información debe pasar de Stats a la sidebar? → se decide al repensar la sidebar (§14); Stats es la fuente única
Home
¿Se confirma la invariante de no-scroll en escritorio ancho y bajo?
¿Dónde se integra exactamente “Déjate guiar”?
¿Debe modificar la tarjeta de Camino sugerido o aparecer como acción secundaria?
Sidebar
¿Cuál es su función principal?
¿Debe mostrar el día, la Travesía o la siguiente acción?
¿Qué elementos actuales sobran?
¿Cómo deben representarse los logros desbloqueados?
¿Qué acción debe poder realizarse sin abrir un modal?
Comercial
¿Cuál será el precio objetivo de Lifetime?
¿Habrá precio fundador?
¿Qué contenido justificará la compra inicialmente?
¿La primera versión móvil será Android, iOS o ambas?
¿Cuándo debe comenzar una prueba empresarial?
Catálogo corporal
¿Qué ejercicios actuales son demasiado difíciles?
¿Qué rutinas deben ser completamente realizables sentado?
¿Qué material opcional tendrá sentido?
¿Cómo se explicarán las regresiones?
¿Quién revisará el contenido corporal antes del lanzamiento?

37 bis. RONDA M1–M4 RE-DECIDIDA · CERRADA (s133)

Estuvo PROVISIONAL entre s130 y s133 por decisión del usuario (se había añadido sin
repensarse). Cerrada ahora decisión a decisión, con las alternativas y sus costes sobre la
mesa. **Esto es canon.** Cada punto sustituye a lo que decía la ronda original, que se
conserva debajo como historia.

37bis.1 · CONSTANCIA = RITMO SEMANAL. Se retiran la racha de días consecutivos y el récord
de mejor racha (hoy en `PathStats.jsx:74-84`, vía `computePathStreaks`). Se sustituyen por
«días con ritmo» sobre la tira de 7 días: sin récord, sin racha perdida, sin rojo; un día sin
registro es un hueco neutro. Reutiliza el criterio de día activo ya vigente (s69: foco,
respiración o cuerpo > 0; el agua sola NO cuenta), que ya usan `YearView` y las WeekDots de
la sidebar. Motivo: la racha choca con §2.2 (nada de rachas punitivas) y con §2.5 (progreso
sin culpa).

37bis.2 · EQUILIBRIO = TRES MARCAS, SIN NOTA. El equilibrio del día se representa con un
indicador visual de qué ámbitos se tocaron —**foco · cuerpo · respiración**— sin número, sin
nivel y sin orden de mérito. La hidratación acompaña pero no es un ámbito (coherente con s69:
el agua sola no hace día activo). Se descarta explícitamente cualquier nota agregada de
equilibrio. Motivo: cualitativo como exige el principio, pero legible de un vistazo — la
alternativa de solo texto se ignora en la práctica.

37bis.3 · CALENDARIO POR TIPOS DE JORNADA, NO POR VOLUMEN. Mes y Año dejan de colorear por
intensidad: `computeDayScore` (`YearView.jsx:11-24`), que agrega foco + respiración + cuerpo
+ agua en un número, deja de ser el criterio de color. Cada día se colorea por el TIPO de
jornada que fue —**con pausas · de foco sin pausas · de cuerpo · sin registro**— con **«con
Camino» como MARCA superpuesta**, no como tipo (puede coexistir con cualquiera). Los tipos se
DEDUCEN de lo que hubo (decisión del usuario en s129), así que aplican a todo el histórico ya
guardado y no necesitan eventos. Motivo: el heatmap por volumen premia visualmente el día de
más cantidad, que es lo que §31.2 prohíbe.

37bis.4 · CHECK-IN DE CIERRE: SÍ, OCASIONAL. Máximo una vez al día, siempre opcional, nunca
bloquea, ligado a cierres naturales (fin de jornada o cierre de una experiencia); nunca tras
cada sesión y nunca para vender premium. Es la única vía para saber si alguien «termina el día
mejor», que es una de las dos métricas principales de §31.1. Requiere eventos ⇒ llega en la
Fase 3 del plan, no antes.

37bis.5 · COMPARACIÓN RETROSPECTIVA (sin cambios). Contigo mismo, mirando atrás; nunca
competitiva ni social; copy editorial y neutral. Se mantiene sin re-preguntar porque no añade
nada a lo que ya prohíbe §2.2 (sin rankings, sin presión social).

NO afectado por nada de esto: §31.4 (estructura Hoy · Semana · Mes · «Qué te ayuda») y §31.6
(Free = Hoy + tira de 7 días; Premium = mes, año, patrones, «qué te ayuda») son ANTERIORES a
la ronda M1–M4 —están ya en el documento original del 2026-07-27— y siguen vigentes. Es sobre
ellos, y no sobre el §37, donde se apoya `STATS_DESTINO_PROPUESTA.md`.

--------------------------------------------------------------------------------
Texto original de la ronda M1–M4, conservado como HISTORIA (superado por §37 bis):

Esta ronda consolida y RESUELVE varias preguntas abiertas de §31.5 (check-in de cierre) y
§36 (métricas, Stats, racha, días imperfectos). Es dirección de producto; no implica código
todavía. Donde se marca "provisional", la estructura podrá ajustarse al implementar Stats y
la capa de eventos (pace.events.v1).

37.1. Check-in de cierre (M1)
El check-in es OCASIONAL y va VINCULADO a cierres naturales (fin de jornada / cierre de una
experiencia), no a cada sesión.
No habrá check-in INICIAL (PACE no pregunta el estado al abrir).
No habrá un panel de estado de ánimo (no se modela el ánimo como pantalla ni como métrica).
Sigue siendo: máximo una vez al día, siempre opcional, nunca bloquea, no vende premium en ese
momento, no interpreta estados emocionales como diagnóstico.
(Resuelve la parte de §31.5 y la pregunta de §36 "¿PACE debe preguntar «¿Cómo terminas hoy?»?").

37.2. Comparación y copy (M2)
La comparación es RETROSPECTIVA (contigo mismo, mirando atrás), nunca competitiva ni social.
El copy de la comparación es EDITORIAL (tono calmado, no cifras frías presentadas como nota).
Las comparaciones son NEUTRALES: un día imperfecto no se comunica como fracaso ni un día
completo como logro que presione. Sin puntuaciones que ordenen "mejor/peor".
(Resuelve §36 "¿Cómo representar días imperfectos sin transmitir fracaso?").

37.3. Jornada y ritmo (M3)
Se adopta el concepto de JORNADA ABIERTA / CERRADA (la persona puede abrir y cerrar su
jornada; cerrar es un acto opcional, no una obligación diaria).
El calendario se organiza por TIPOS de jornada (no por volumen ni por "días perfectos").
La RACHA se transforma en RITMO SEMANAL: se conserva la idea de constancia como ritmo, no como
contador punitivo que se rompe (nada de rachas rojas ni pérdida de progreso por saltarse un día).
Sin PUNTUACIÓN DE EQUILIBRIO: el equilibrio se representa cualitativamente (variedad, pausas,
tiempo sedentario interrumpido), nunca como una nota agregada.
(Resuelve §36 "¿La racha actual se conserva, se transforma en ritmo o se elimina?" → transformada
en ritmo; alinea con §31.2 "ritmo, no racha punitiva").

37.4. Arquitectura de Stats (M4, provisional)
Arquitectura de Stats PROVISIONAL (se cerrará al implementar Stats + eventos).
Contenido inicial: HOY y SEMANA (Mes/Año e interpretación profunda quedan para premium y
fases posteriores, §31.6).
"Qué te ayuda" usa UMBRALES VARIABLES: no muestra conclusiones con muestras insuficientes, y el
umbral mínimo de datos se adapta al tipo de práctica/pregunta (no un número fijo). Requiere
pace.events.v1.
(Alinea con §31.3/§31.4 y §31.6; resuelve la dirección de §36 "¿Qué debe verse primero al abrir
Stats?" → Hoy y Semana).

37.5. Qué NO cambia
Se mantienen los principios de §2 (calma, sin dark patterns, progreso sin culpa) y la dirección
Free/Premium de §31.6 (Premium interpreta, nunca se apropia de los datos). Estas decisiones NO
tocan la contabilidad actual ni el modelo de datos implementado; son dirección para las sesiones
de Stats, sidebar (§14) y eventos (§Bloque 9).
