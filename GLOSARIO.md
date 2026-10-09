# Glosario de Gestadia Portal

## Canal APP
- **Tipo:** concepto runtime propuesto.
- **Definición:** Canal propio de LidIA para las conversaciones originadas en Gestadia App, con identidad y sesiones independientes de Web y WhatsApp.
- **Alcance:** preparación en `docs/integraciones/2026-10-03-app-lidia-backend-preparacion.md`; implementación futura coordinada con Gestadia_LidIA.
- **Notas:** Solicitado por el usuario el 03/10/2026. No está creado ni activado. Reutilizar el motor de conversación y soporte humano no implica reutilizar credenciales ni sesiones de otros canales.

## VinculoLidia
- **Tipo:** entidad propuesta.
- **Definición:** Asociación comprobada entre una cuenta del portal, su identidad en un proyecto de LidIA y, cuando exista, su ficha de CRM.
- **Alcance:** diseño en `docs/integraciones/2026-10-03-app-lidia-backend-preparacion.md`; candidata para `backend/prisma/schema.prisma` y el adaptador APP de LidIA.
- **Notas:** No implementada. Un teléfono introducido o coincidente no autoriza a vincular historias privadas. Reutiliza `ClientKey` de LidIA cuando esté resuelta y conserva la cuenta al convertir un Lead en Contact.

## ConversacionApp
- **Tipo:** entidad propuesta.
- **Definición:** Referencia del portal a una conversación de LidIA perteneciente a una cuenta y destinada a un sondeo o a atención humana, opcionalmente asociada a un expediente.
- **Alcance:** diseño en `docs/integraciones/2026-10-03-app-lidia-backend-preparacion.md`; candidata para `backend/prisma/schema.prisma` y la API de conversaciones.
- **Notas:** No implementada. Guarda pertenencia y correlación, no una copia del historial. Una transferencia a soporte mantiene la misma sesión; sondeo y atención son contextos de interfaz diferentes.

## EventoIntegracion
- **Tipo:** entidad propuesta.
- **Definición:** Registro durable de una notificación entrante y de su procesamiento para que la repetición o concurrencia no duplique altas ni efectos.
- **Alcance:** diseño en `docs/integraciones/2026-10-03-app-lidia-backend-preparacion.md`; candidata para `backend/prisma/schema.prisma` y recepción de eventos CRM/pago.
- **Notas:** No implementada. Es una bandeja de entrada; `LidiaEvento` sigue siendo la cola de salida del contrato de pagos 1.0.

## Habilitación de expediente
- **Tipo:** concepto de negocio propuesto.
- **Definición:** Evidencia que permite a un cliente gestionar un expediente, originada por pago confirmado o por un trato de Zoho comprobado como Cerrado ganado.
- **Alcance:** diseño en `docs/integraciones/2026-10-03-app-lidia-backend-preparacion.md`; futuras reglas de alta y lectura del perfil comercial.
- **Notas:** El usuario indicó ambos orígenes. Un trato ganado sin prueba de cobro no genera una fecha, referencia ni método de pago ficticios; iniciar un checkout o crear un expediente pendiente no convierte por sí solo al usuario en cliente.

## Capa API de la app
- **Tipo:** decisión de arquitectura propuesta.
- **Definición:** Interfaz del backend de Gestadia que autentica a la cuenta de la app, comprueba el acceso a sus expedientes y media su comunicación con LidIA.
- **Alcance:** preparación en `docs/integraciones/2026-10-03-app-lidia-backend-preparacion.md`; backend existente `backend/src/` y consumidor `frontend/app/src/api.js`.
- **Notas:** Se apoya en las tablas y servicios del portal. La app no recibe credenciales administrativas ni obtiene identidad verificada a partir de un teléfono o visitorId declarados.

## GestadiaApp
- **Tipo:** concepto runtime.
- **Definición:** Aplicación web móvil de Gestadia basada en el handoff aprobado, con navegación propia y acceso a los servicios del portal.
- **Alcance:** `frontend/app/`, `frontend/vite.app.config.js`, rama `app/main`.
- **Notas:** Se mantiene una entrada independiente para publicar en `app.gestadia.com` conservando el checkout comercial en `gestadia.com`.

## Modo demostración
- **Tipo:** concepto runtime.
- **Definición:** Sesión explícita con datos ficticios que permite recorrer los flujos de la aplicación sin enviar solicitudes al CRM ni guardar documentos en el servidor.
- **Alcance:** `frontend/app/src/demo.js`, `frontend/app/src/AppContext.jsx`.
- **Notas:** No acredita autenticación, conversación con gestor ni tramitación real.

## Panel de contacto con gestor
- **Tipo:** concepto de interfaz.
- **Definición:** Panel que entra desde el borde inferior para abrir el chat con el gestor asignado o solicitar una llamada mediante nombre y teléfono.
- **Alcance:** `frontend/app/src/Contact.jsx`, `Sheet.jsx` y estilos de la app.
- **Notas:** Replica el handoff; el perfil lead sólo ofrece la llamada. En esta entrega la solicitud es local y no se envía al CRM.

## Menú inferior
- **Tipo:** concepto de interfaz.
- **Definición:** Navegación persistente entre LidIA, Trámites, Mensajes y Servicios, presentada en una zona blanca separada del fondo de acciones por una línea divisoria.
- **Alcance:** `frontend/app/src/App.jsx` y `app.css`.
- **Notas:** Conserva las cuatro pestañas del diseño; el CTA y el compositor se sitúan sobre el fondo gris claro.

## ChatComposer
- **Tipo:** componente de interfaz.
- **Definición:** Entrada de texto compartida por la consulta con LidIA y la conversación con el gestor para conservar el mismo diseño y controles.
- **Alcance:** `frontend/app/src/ChatComposer.jsx`, `Assistant.jsx`, `Messages.jsx` y `app.css`.
- **Notas:** El envío y el dictado dependen de cada conversación; en esta demo los mensajes son locales y el micrófono no inicia conexiones.

## Historial de ejemplo del gestor
- **Tipo:** concepto runtime.
- **Definición:** Conversación ficticia que reproduce las burbujas, horas y petición de tres documentos del diseño para presentar el chat del gestor.
- **Alcance:** `createManagerDemoConversation` y `managerDemoVersion` en `frontend/app/src/demo.js`; representación en `Messages.jsx`.
- **Notas:** Las horas iniciales pertenecen al guion de demostración. Actualiza el antiguo mensaje inicial sin borrar los mensajes escritos ni los datos del perfil.

## documento
- **Tipo:** propiedad de navegación.
- **Definición:** Parámetro de URL que identifica el documento del expediente que debe mostrarse al pulsar «Subir» en el chat.
- **Alcance:** ruta `/tramites/:id?documento=...`, `Messages.jsx` y `Expedientes.jsx`.
- **Notas:** Reutiliza las claves del checklist; únicamente selecciona el campo, sin iniciar cargas ni conexiones.

## Verificación de Datos y Carnet
- **Tipo:** concepto de interfaz.
- **Definición:** Pantalla para revisar los datos personales y seleccionar los documentos obligatorios del expediente antes de su presentación.
- **Alcance:** `/tramites/:id`, `App.jsx`, `Expedientes.jsx` y `app.css`.
- **Notas:** «Validar y Enviar» comprueba el ejemplo local y vuelve al chat; en demo no transmite datos, archivos ni solicitudes.

## Visibilidad de contraseña
- **Tipo:** concepto de interfaz.
- **Definición:** Control con icono de ojo u ojo tachado que permite mostrar u ocultar una contraseña mientras se escribe.
- **Alcance:** `Login.jsx`, `Register.jsx`, iconos `eye`/`eyeOff` de `Icon.jsx` y `app.css`.
- **Notas:** Conserva la contraseña solo en el estado temporal del formulario; no altera el envío ni su almacenamiento.

## Habla con LidIA
- **Tipo:** concepto de interfaz.
- **Definición:** Estado de conversación con LidIA, con cabecera propia, mensajes identificados y burbujas del cliente en negro suave con su hora.
- **Alcance:** `App.jsx`, `Assistant.jsx`, mensajes locales `assistantState.messages` con `time`/`greeting` y `app.css`.
- **Notas:** Volver o pulsar la pestaña LidIA regresa a la selección inicial; las consultas completadas siguen conservadas. El teléfono abre el contacto con un gestor.

## Compositor de LidIA
- **Tipo:** concepto de interfaz.
- **Definición:** Control de texto, micrófono y envío de la consulta, situado debajo del botón de contacto y encima de la navegación en LidIA.
- **Alcance:** `frontend/app/src/Assistant.jsx`, destino `lidia-composer` de `App.jsx`, estilos de la app.
- **Notas:** Mantiene el estado del sondeo en Assistant mediante un portal de React; replica las medidas y la flecha diagonal del handoff. El dictado sigue desactivado en demo.

## Notificaciones y Avisos
- **Tipo:** concepto de interfaz.
- **Definición:** Panel inferior que resume los avisos del expediente y destaca la documentación pendiente frente a la asignación del gestor.
- **Alcance:** `frontend/app/src/Notifications.jsx`, `Sheet.jsx`, notificaciones del perfil demo.
- **Notas:** Se replica el formato del handoff sin inventar horas para avisos que carecen de fecha. El lead muestra «Estás al día».

## GESTADIA_APP_CONFIG
- **Tipo:** decisión naming.
- **Definición:** Configuración pública de despliegue de la app, con la URL de la API, del checkout y disponibilidad del modo demostración.
- **Alcance:** `frontend/app/public/app-config.js`, `frontend/app/src/api.js`.
- **Notas:** Sigue el patrón de configuración pública de LIA; admite la key publicable de PluginWeb, nunca claves privadas ni contraseñas.

## Sondeo LidIA
- **Tipo:** concepto runtime.
- **Definición:** Conversación guiada que recoge respuestas de cualificación de un trámite para su revisión por un gestor.
- **Alcance:** `frontend/app/src/Assistant.jsx`, `frontend/app/src/qualification.js`.
- **Notas:** En demo usa preguntas deterministas y no garantiza viabilidad del trámite. La conversación real se ejecuta en la plataforma LidIA a través de PluginWeb.

## PluginWeb
- **Tipo:** concepto runtime.
- **Definición:** Canal web de la plataforma LidIA que atiende al visitante con IA y soporte humano en una sesión común.
- **Alcance:** `frontend/app/src/PluginWebContext.jsx`, `frontend/app/src/PlatformChat.jsx`; API externa `/api/pluginweb` de Gestadia_LidIA.
- **Notas:** Una key pública no identifica a un cliente autenticado; no se usa el secreto administrativo ni los tokens del portal como tokens de LidIA.

## APP_PLUGIN_KEY
- **Tipo:** propiedad de configuración.
- **Definición:** Clave publicable de PluginWeb que selecciona el agente y sus restricciones de origen para esta app.
- **Alcance:** `compose.app.yml`, `deploy/app/40-app-config.sh`, `GESTADIA_APP_CONFIG.pluginWeb.key`.
- **Notas:** Debe corresponder al agente Gestadia y permitir `https://app.gestadia.com`; se obtiene de la administración de PluginWeb o del enlace público existente del agente.

## Sesión PluginWeb de la app
- **Tipo:** concepto runtime.
- **Definición:** Credencial temporal de la conversación IA/gestor del visitante en esta pestaña, independiente del acceso al portal.
- **Alcance:** `frontend/app/src/pluginStorage.js`, `frontend/app/src/PluginWebContext.jsx`.
- **Notas:** Se conserva en `sessionStorage` para recargas; cambiar de cuenta o salir elimina las credenciales almacenadas. No se persiste el historial real en almacenamiento local.

## Build de la app
- **Tipo:** concepto runtime.
- **Definición:** Versión y revisión Git que identifican el código incluido en una imagen Docker de Gestadia App.
- **Alcance:** argumentos `APP_VERSION` y `VCS_REF` de `deploy/app/Dockerfile`; recurso público `/build-info.json`.
- **Notas:** Permite distinguir el build servido de una mera respuesta de salud del contenedor.

## Gestadia nativa (Capacitor)
- **Tipo:** concepto runtime.
- **Definición:** Versiones iOS y Android que empaquetan el frontend de Gestadia en un contenedor nativo, con acceso a la misma plataforma publicada.
- **Alcance:** `frontend/capacitor.config.json`, `frontend/ios/`, `frontend/android/`, `frontend/app/src/native.js`.
- **Notas:** Se comparte interfaz y lógica con la web; cada plataforma se compila y valida por separado.

## com.gestadia.app
- **Tipo:** decisión naming.
- **Definición:** Identificador propuesto para los proyectos nativos locales de Gestadia.
- **Alcance:** `frontend/capacitor.config.json` y proyectos iOS/Android generados.
- **Notas:** Pendiente de confirmar disponibilidad y titularidad antes de registro o publicación en tiendas.

## VITE_GESTADIA_SERVER_URL
- **Tipo:** propiedad de configuración.
- **Definición:** Base HTTPS publicada que usan los builds nativos para cargar configuración pública y acceder al portal y al proxy de LidIA.
- **Alcance:** `frontend/app/src/native.js`, build de `frontend/dist-app/`.
- **Notas:** Por defecto `https://app.gestadia.com`; admite loopback solo para comprobaciones locales. No contiene credenciales.

## demoOnly
- **Tipo:** propiedad de configuración.
- **Definición:** Modo de la primera entrega para presentar Gestadia sin conexiones externas ni cuentas reales.
- **Alcance:** `GESTADIA_APP_CONFIG.demoOnly`, variable Docker `APP_DEMO_ONLY`, `api.js`, `native.js` y proveedores de sesión.
- **Notas:** Activado por defecto por instrucción del usuario; bloquea API, PluginWeb y navegación externa, incluido checkout. Desactiva el reconocimiento de voz del navegador, que podría requerir un servicio externo.

## Acceso de demostración
- **Tipo:** concepto runtime.
- **Definición:** Pantallas de acceso y registro que permiten recorrer la app con un perfil de ejemplo sin crear usuarios en un servidor.
- **Alcance:** `frontend/app/src/Login.jsx`, `Register.jsx`, rutas `/acceso` y `/registro`.
- **Notas:** Nunca guarda contraseñas. Autenticación real y aprovisionamiento se aplazan a una fase posterior.

## Splash de Gestadia
- **Tipo:** concepto runtime.
- **Definición:** Pantalla de marca que acompaña el arranque y se retira cuando la interfaz está preparada.
- **Alcance:** `frontend/app/index.html`, `native.js`, configuración SplashScreen y recursos nativos iOS/Android.
- **Notas:** Fondo negro oficial `#181818` y logotipo completo blanco/rojo centrado, sin «Trámites DGT Online», por indicación del usuario. Imagen local `brand/gestadia-logo-completo.png` en web; `assets/splash{,-dark}.png` para iOS/Android; `gestadia_splash_logo` es el recurso del arranque de Android 12 y posteriores, adaptado a su área central. No descarga fuentes ni imágenes externas.

## Aviso de dictado
- **Tipo:** concepto de interfaz.
- **Definición:** Advertencia amarilla emergente que explica la indisponibilidad del micrófono y se oculta automáticamente a los cuatro segundos.
- **Alcance:** `ChatComposer.jsx`, estado `status`/`onStatusChange`, clase `warning-toast` y pictograma `warning` de `Icon.jsx`; compartido por LidIA y el chat de gestor.
- **Notas:** Permite cerrar manualmente y volver a mostrar el aviso con otra pulsación. Reemplaza el texto bajo el input sin activar conexiones externas.

## Revisión de servicio en demo
- **Tipo:** concepto runtime.
- **Definición:** Cierre local del recorrido comercial que muestra el servicio elegido sin contratar ni realizar un pago.
- **Alcance:** `frontend/app/src/DemoCheckout.jsx`, ruta `/checkout-demo`.
- **Notas:** Sustituye la salida al checkout real exclusivamente en la primera versión de demostración.

## Menú de cuenta
- **Tipo:** concepto de interfaz.
- **Definición:** Panel inferior que resume la identidad del usuario y permite abrir Mi Perfil o cerrar sesión.
- **Alcance:** `frontend/app/src/AccountMenu.jsx`, `App.jsx`; destino `/cuenta`.
- **Notas:** Replica la jerarquía de LIA APP sin importar su selector de roles ni DevTools. Conserva los controles propios de Gestadia.

## Preferencias de cuenta de demostración
- **Tipo:** concepto runtime.
- **Definición:** Preferencias locales de avisos push, analítica, campañas y diagnóstico del perfil ficticio.
- **Alcance:** `Account.jsx`, `AppContext.jsx`; objeto `data.preferences` dentro de `gestadia_app_demo_v1`.
- **Notas:** No activan permisos del sistema ni SDK de seguimiento. Se reinician con el perfil de demostración.

## Borrado de cuenta de demostración
- **Tipo:** concepto runtime.
- **Definición:** Eliminación del perfil, consultas, mensajes, preferencias y referencias documentales del ejemplo guardado en el dispositivo.
- **Alcance:** `AccountDeletion.jsx`, `AppContext.jsx` (`deleteDemoAccount`), `/cuenta` y `/legal/delete-account`.
- **Notas:** Cierra la sesión local y elimina sólo el almacenamiento de Gestadia. No sustituye el borrado de una cuenta de servidor ni acredita publicación en tiendas.

## Documentos legales de la app
- **Tipo:** concepto de interfaz.
- **Definición:** Páginas públicas de privacidad, términos, soporte y eliminación de cuenta accesibles sin iniciar sesión.
- **Alcance:** `legalContent.js`, `LegalPage.jsx`, `LegalLinks.jsx`; rutas `/legal/privacy`, `/legal/terms`, `/legal/support`, `/legal/delete-account`.
- **Notas:** Estructura adaptada de LIA APP con contenido específico de Gestadia y del alcance desconectado. No importa términos o proveedores de LIA.

## Selección de servicio
- **Tipo:** concepto de interfaz.
- **Definición:** Elección de una tarjeta del catálogo que desplaza la vista al nombre del servicio elegido y al formulario de tramitación.
- **Alcance:** `Services.jsx` (`selectedTitle`, `scrollRequest`), clases `services-page` y `services-form`; `ProfileFields` admite presentación `compact`.
- **Notas:** Conserva los campos y precios del catálogo compartido; el formato compacto oculta visualmente las etiquetas pero mantiene sus nombres accesibles. Respeta la preferencia del sistema de reducir movimiento.

## Revisión del contrato APP (04/10/2026)

Las entradas siguientes describen propuestas importadas de LidIA y observaciones
del Portal. No acreditan implementación ni aprobación del contrato. Fuentes:
[respuesta original](docs/integraciones/2026-10-04-respuesta-contrato-app-lidia.md)
y [revisión Portal](docs/integraciones/2026-10-04-observaciones-portal-contrato-app-lidia.md).

### Agente operativo APP dedicado
- **Tipo:** decisión de arquitectura propuesta.
- **Definición:** Agente configurado para el canal APP que comparte las reglas de canje con el agente existente y tiene capacidades y destinos propios.
- **Alcance:** respuesta LidIA, §2; revisión Portal, §2. Implementación futura en Gestadia_LidIA, sin id asignado.
- **Notas:** Recomendación técnica pendiente de acuerdo. Se descarta como primera opción heredar todas las conexiones del 119 o duplicar íntegramente el motor de canje.

### Firma APP S2S (`gestadia-app-s2s-v1`, `app-v1`)
- **Tipo:** concepto de protocolo propuesto.
- **Definición:** Autenticación servidor a servidor de una petición APP mediante HMAC-SHA256 que vincula integración, sujeto, operación y cuerpo. Los dos literales identifican respectivamente la representación firmada y la cabecera de firma.
- **Alcance:** respuesta LidIA, §3; revisión Portal, O1. Futuro adaptador APP en ambos servidores; no existe actualmente.
- **Notas:** Las cabeceras propuestas son `X-Gestadia-Key-Id`, `X-Gestadia-Timestamp`, `X-Gestadia-Nonce`, `X-Gestadia-Subject` y `X-Gestadia-Signature`. Sustituye en esta propuesta el bearer de conversación opcional del borrador del 03/10; no cambia la firma del checkout 1.0.

### `portal_user_id`
- **Tipo:** propiedad contractual propuesta.
- **Definición:** Identificador estable de la cuenta Portal autenticada que es sujeto de una conversación APP. No acredita por sí mismo identidad civil ni pertenencia a una ficha CRM.
- **Alcance:** `User.id` en `backend/prisma/schema.prisma`; DTO APP propuestos en respuesta LidIA, §3, y revisión Portal, O4.
- **Notas:** Lo obtiene el servidor de la sesión validada; no se identifica al usuario por un teléfono, email o `visitorId` declarado por el móvil.

### `case_ref`
- **Tipo:** propiedad contractual propuesta.
- **Definición:** Referencia de un expediente Portal cuya pertenencia a la cuenta se ha comprobado antes de asociarlo a una conversación.
- **Alcance:** respuesta LidIA, §3; revisión Portal, O4. Se propone usar `Expediente.id` en el futuro contrato APP.
- **Notas:** No es una credencial ni un id de Zoho suministrado por el cliente. Su ausencia permite sondeo gratuito; atención de gestor exige el contexto autorizado que se acuerde.

### `client_key` APP / `ClientKey` interno
- **Tipo:** propiedad propuesta / concepto runtime existente en LidIA.
- **Definición:** `client_key` sería un alias aleatorio de una asociación CRM comprobada y revocable para una cuenta y un ámbito APP. `ClientKey` interno conserva la agrupación actual de fichas de LidIA.
- **Alcance:** respuesta LidIA, §4; revisión Portal, O4. El alias aún no existe; el interno se describe en `ClientKeyLinker` de Gestadia_LidIA.
- **Notas:** Según la respuesta, el interno tiene formato `{module}:{recordId}` y carece hoy del scope/revocación necesarios. Esta distinción precisa la intención histórica de `VinculoLidia`: no exportar ese valor como alias opaco ni tratarlo como permiso.

### `revocation_version`
- **Tipo:** propiedad contractual propuesta.
- **Definición:** Versión durable de una revocación aplicada a la cuenta APP o a su vínculo CRM. Permite acreditar el resultado sin reactivar permisos al reintentar.
- **Alcance:** respuesta LidIA, §3, ruta propuesta `/subjects/{portalUserId}/revocations`; revisión Portal, O2. No existe actualmente.
- **Notas:** Los scopes `account` y `crm_link` separan bloqueo APP y retirada del vínculo privado. Logout de un dispositivo no es revocación global; borrado físico y reactivación quedan fuera de esta operación.

### `turn_id`, `presentation_id`, `action_id`
- **Tipo:** propiedades contractuales propuestas.
- **Definición:** Identifican respectivamente un turno estable, una presentación de opciones y una opción permitida dentro de ella. Vinculan la recepción y ejecución a una conversación autorizada.
- **Alcance:** respuesta LidIA, §3; revisión Portal, O3. Futuros DTO de turnos y timeline.
- **Notas:** No permiten elegir tools ni instrucciones. Cambiar la clave idempotente no repite un turno ni una acción ya consumida.

### `state_revision` y `turn_statuses`
- **Tipo:** propiedades contractuales propuestas.
- **Definición:** La revisión identifica cambios observables del estado de conversación; los recibos de turnos permiten conocer su procesamiento sin deducirlo del texto de respuesta.
- **Alcance:** respuesta LidIA, §3; revisión Portal, O3. Futuro timeline APP.
- **Notas:** Deben observarse cambios de soporte sin mensajes nuevos; queda pendiente concretar filtrado, paginación y retención de recibos.

### `outcome_unknown`
- **Tipo:** estado contractual propuesto.
- **Definición:** Resultado de una operación externa cuya ejecución no puede confirmarse tras un fallo o timeout.
- **Alcance:** respuesta LidIA, §3; revisión Portal, O3 y O5. Futuros recibos y reconciliación.
- **Notas:** Exige comprobar el efecto antes de reintentarlo; no es una autorización para repetir una mutación ni una afirmación de que falló.

### `crm.deal.stage_changed.v1` y `source_revision`
- **Tipo:** nombre de evento / propiedad contractual propuestos.
- **Definición:** Evento que comunica una etapa comprobada de un trato Zoho; su revisión identifica el orden de los cambios en el origen.
- **Alcance:** respuesta LidIA, §7; revisión Portal, O5 y O6. Futuro adaptador CRM e inbox Portal.
- **Notas:** No es `payment.succeeded` ni una fase documental. El productor y el mecanismo de revisión están pendientes; `Modified_Time` y un hash de snapshot no acreditan por sí solos ese orden.

### Adenda checkout APP (`origin_channel: APP`)
- **Tipo:** decisión contractual / propiedad propuestas.
- **Definición:** Ampliación separada del contrato de cobro que liga una operación iniciada desde APP a cuenta, conversación, oferta y correlación verificadas.
- **Alcance:** respuesta LidIA, §6; revisión Portal, O7. Futuros adaptadores de checkout y callback.
- **Notas:** No abre el guard WhatsApp del contrato 1.0. Consentimiento, esquema de callbacks y requisitos CRM deben acordarse antes de implementar.

## Precisión contractual recibida el 05/10/2026

Propuestas aún pendientes de acuerdo. Fuentes: [respuesta LidIA O1–O8](docs/integraciones/2026-10-05-respuesta-lidia-observaciones-o1-o8.md),
[anexo de firma](docs/integraciones/2026-10-05-app-s2s-anexo-firma.md),
[anexo DTO](docs/integraciones/2026-10-05-app-anexo-dtos.md) y
[revisión Portal](docs/integraciones/2026-10-05-revision-portal-respuesta-lidia-o1-o8.md).

### `integration_id`
- **Tipo:** propiedad de identidad técnica propuesta.
- **Definición:** Identidad durable de la integración S2S, independiente de la clave que firma una petición.
- **Alcance:** anexo de firma del 05/10, §4; futuros adaptadores Portal/LidIA.
- **Notas:** La rotación cambia `key_id`, no el ámbito de idempotencia. No equivale a una cuenta APP ni permite seleccionar otro entorno.

### JCS
- **Tipo:** concepto de protocolo.
- **Definición:** JSON Canonicalization Scheme, representación determinista de JSON descrita en RFC 8785 para obtener una huella semántica reproducible.
- **Alcance:** anexo de firma del 05/10, §4; fixtures `docs/integraciones/fixtures/app-s2s-v1-vectors.json`.
- **Notas:** Se propone para el DTO validado, con las normalizaciones previas acordadas; la firma HTTP sigue usando el cuerpo crudo. Los vectores no acreditan por sí solos un canonicalizador general.

### Atestación de vínculo CRM / `crm-links`
- **Tipo:** concepto contractual / ruta propuestas.
- **Definición:** Asociación acreditada y versionada que Portal comunica a LidIA entre cuenta, expediente, contacto y trato dentro de una organización y ámbito autorizados.
- **Alcance:** respuesta O4 del 05/10; ruta propuesta `/api/integrations/lidia/app/v1/subjects/{portalUserId}/crm-links`, aún sin DTO consolidado.
- **Notas:** No se crea por enviar `client_key` en `/sessions`. El contrato debe fijar permisos, revisión, conflictos y asignación del alias; no hay endpoint implementado.

### `crm.deal.snapshot_observed.v1`
- **Tipo:** nombre de evento propuesto.
- **Definición:** Observación autenticada de una instantánea de trato Zoho, sin afirmar que contiene todas sus transiciones históricas.
- **Alcance:** respuesta O6 del 05/10; DTO `CrmSnapshotEvent` en `docs/integraciones/fixtures/app-v1-dtos.schema.json`.
- **Notas:** Alternativa pendiente de aprobación al evento `crm.deal.stage_changed.v1`. En esta variante `source_revision` es una huella identificadora, no un ordinal; precisa la definición histórica del glosario para este nuevo evento.

### `observed_at` y `source_modified_at`
- **Tipo:** propiedades contractuales propuestas.
- **Definición:** Fechas de observación del adaptador y de modificación informada por el origen CRM, respectivamente.
- **Alcance:** respuesta O6 del 05/10 y DTO `CrmSnapshotEvent`.
- **Notas:** `source_modified_at` puede ser null; ninguna de las dos fechas demuestra por sí sola una secuencia exhaustiva de cambios de etapa.

### `processing_revision`
- **Tipo:** propiedad contractual propuesta.
- **Definición:** Contador local del procesamiento de observaciones CRM y de las decisiones de reconciliación.
- **Alcance:** respuesta O6 del 05/10; futuro reconciliador Portal.
- **Notas:** No es `source_revision` ni prueba el orden de transiciones en Zoho.

### `receipt_revision`, `result_revision` y `presentation_revision`
- **Tipo:** propiedades contractuales propuestas.
- **Definición:** Revisiones durables del recibo de operación, evaluación del sondeo y presentación de acciones, respectivamente.
- **Alcance:** respuesta O3 del 05/10 y anexo DTO; futuros recibos y timeline APP.
- **Notas:** Strings decimales. Sus cambios aumentan la revisión pública pertinente; no sustituyen la revisión global de conversación `state_revision`.

### `enforcement_deadline`, `enforcement_status` y t0
- **Tipo:** propiedades contractuales / referencia temporal propuestas.
- **Definición:** Plazo y estado comunicado de propagación de una revocación; t0 es su commit en la base autoritativa LidIA.
- **Alcance:** respuesta O2 del 05/10 y DTO `RevocationResponse`.
- **Notas:** El objetivo de 60 segundos cuenta desde t0, no desde el clic Portal. `propagating` y ACK 200 acreditan persistencia; no efectividad universal. Portal tiene su propio bloqueo inmediato y salida durable.

### Identidad económica del pago
- **Tipo:** concepto contractual propuesto.
- **Definición:** Identidad que distingue un cobro por proveedor, cuenta del proveedor, entorno e identificador de pago (`provider_payment_id`).
- **Alcance:** respuesta O5 del 05/10; `CheckoutCallback` y revisión Portal R4.
- **Notas:** `event_id` identifica el transporte y no reemplaza esta identidad. Debe fijarse cómo conoce el receptor la cuenta del proveedor antes de dar por cerrado el callback.

### `origin=app`
- **Tipo:** propiedad contractual propuesta.
- **Definición:** Identificador de origen que LidIA propone para la futura solicitud de checkout APP.
- **Alcance:** respuesta O7 del 05/10; DTO de solicitud pendiente de consolidación.
- **Notas:** Es una variante de naming frente a `origin_channel: APP` del borrador previo. Acordar un único nombre y valor en el contrato final; no asumir equivalencia automática en implementaciones.

## Precisión de negocio: ganado y acceso (05/10/2026)

Fuente: [decisión de negocio Zoho y acceso](docs/integraciones/2026-10-05-decision-negocio-zoho-ganado-y-acceso.md).

### Entrada a Cerrado ganado
- **Tipo:** concepto de negocio / evento runtime requerido.
- **Definición:** Ocurrencia del cambio de un trato Zoho a Cerrado ganado que el CRM debe comunicar al Portal mediante POST. Dispara el alta comercial o la vinculación con una cuenta existente.
- **Alcance:** decisión de negocio del 05/10, §§1–3; futuro productor CRM y receptor Portal. `crm.deal.stage_changed.v1` sigue como nombre contractual propuesto.
- **Notas:** Descarta `crm.deal.snapshot_observed.v1` como sustituto del disparador de alta; una instantánea puede ayudar a reconciliar. Exige conservar la ocurrencia y su identidad en los reintentos, sin exigir una secuencia completa y ordenada de todas las etapas como requisito del alta.

### Acceso conversacional previo
- **Tipo:** concepto de negocio.
- **Definición:** Uso de la app para hablar con LidIA o con atención humana antes de que el trato sea ganado. La cuenta y las conversaciones pueden existir sin expediente habilitado.
- **Alcance:** decisión de negocio del 05/10, §§1–2; futuras API de cuenta y conversaciones APP.
- **Notas:** Hablar no otorga permisos de cliente sobre trámites; al recibir ganado se correlaciona la misma identidad sin perder historial.

### Alta comercial de cuenta
- **Tipo:** concepto de negocio / decisión de identidad.
- **Definición:** Creación o habilitación del acceso de cliente compartido por Gestadia Portal y la app al recibir evidencia comercial válida. Si ya existe una cuenta, se vincula el trámite a esa cuenta conservando sus credenciales.
- **Alcance:** decisión de negocio del 05/10, §§1–4; futuro reconciliador Portal sobre `User` y `Expediente`.
- **Notas:** No crea credenciales separadas para APP ni reinicia la contraseña de una cuenta previa. El evento ganado y el pago se correlacionan para evitar altas y bienvenidas duplicadas.

### Acceso anticipado por conversión CRM
- **Tipo:** concepto de negocio propuesto / decisión de identidad pendiente.
- **Definición:** Creación o vinculación del acceso compartido Portal/APP cuando un lead se convierte en contacto y trato, solicitando el correo y avisando al usuario. Permite conversar antes del alta comercial del trámite.
- **Alcance:** [propuesta APP del 05/10](docs/app/2026-10-05-propuesta-acceso-conversion-crm.md); futuros flujos CRM, cuenta Portal y conversaciones APP, sin código implementado.
- **Notas:** Alternativa adicional para revisión; no sustituye el POST de Cerrado ganado ni habilita permisos de cliente sobre un trámite por la mera conversión. Reutiliza la cuenta y las credenciales existentes.

### Flujos Zoho de la integración APP
- **Tipo:** concepto de integración / responsabilidad runtime.
- **Definición:** Automatizaciones de Zoho que comunican mediante POST al backend Portal los datos de los hechos CRM relevantes para el acceso y los trámites. Su configuración corresponde al responsable de Zoho; LidIA interviene en las conversaciones.
- **Alcance:** [responsabilidades vigentes](docs/app/RESPONSABILIDADES-INTEGRACION.md); futuros flujos Zoho y receptor API Portal.
- **Notas:** El contrato de estos POST se acuerda entre Portal y el responsable de los flujos Zoho. La coordinación con LidIA se limita a la integración conversacional y al contexto de cuenta validado que ésta necesite.

## Contexto conversacional propuesto por LidIA (05/10/2026)

Fuente: [ajuste de alcance recibido](docs/integraciones/2026-10-05-ajuste-alcance-conversacional-app.md).
Es una propuesta contractual; no representa campos ni rutas ya implementados.

### `ConversationContextRequest`
- **Tipo:** DTO / ruta contractual propuestos.
- **Definición:** Atestación del backend sobre permisos y asignaciones válidos para una conversación de una cuenta. Se comunica a LidIA para actualizar el contexto sin crear otra sesión ni solicitar atención automáticamente.
- **Alcance:** ajuste LidIA del 05/10, §2; ruta propuesta `/api/integrations/lidia/app/v1/sessions/{conversationId}/context`.
- **Notas:** Separa el contexto conversacional del contrato Zoho→Portal y del checkout. Requiere adenda de esquema, respuesta y autorización, conservando los anexos anteriores como histórico.

### `context_revision` y `validated_at`
- **Tipo:** propiedades contractuales propuestas.
- **Definición:** Revisión monotónica del contexto emitida por Portal para una conversación y fecha en la que el backend acreditó ese contexto, respectivamente.
- **Alcance:** `ConversationContextRequest` en el ajuste LidIA del 05/10; futuros adaptadores Portal/LidIA.
- **Notas:** La revisión ordena contextos; la fecha es informativa. Ninguna acredita una secuencia de etapas Zoho ni la fecha de verificación del correo.

### `commercial_assignment_ref` y `manager_assignment_ref`
- **Tipo:** referencias contractuales propuestas.
- **Definición:** Identidades estables de asignaciones comercial y gestor acreditadas por el backend para un contexto conversacional. LidIA las resuelve mediante un mapping autorizado de su integración.
- **Alcance:** `ConversationContextRequest`; futuro registro de asignaciones Portal y mapping de operadores LidIA.
- **Notas:** Admiten null. No son un email, un nombre visible, el operador elegido por el móvil ni una afirmación de que Zoho Owner sea el gestor. Los ejemplos recibidos son ficticios.

### `permissions` del contexto conversacional
- **Tipo:** propiedad contractual propuesta.
- **Definición:** Conjunto de capacidades que Portal acredita para una conversación: `sondeo`, `history`, `case_context`, `commercial_handoff`, `manager_handoff` y `support_handoff`.
- **Alcance:** `ConversationContextRequest`; futura autorización Portal y aplicación de permisos LidIA.
- **Notas:** Se intersecta con el ámbito permitido por la integración y con el ciclo de revocación. El cuerpo móvil no lo amplía; no representa acceso a todos los expedientes de la cuenta.

### `context_conflict` y `stale_context`
- **Tipo:** códigos de error contractuales propuestos.
- **Definición:** Rechazos de una actualización por contenido incompatible con la misma revisión y por revisión inferior a la confirmada, respectivamente.
- **Alcance:** respuesta de la futura operación `context` en el ajuste LidIA del 05/10; HTTP 409.
- **Notas:** No reejecutan ni restauran un contexto antiguo. Su catálogo y esquema se consolidarán en la adenda conversacional.

## Precisiones de la adenda conversacional 1.1 (05/10/2026)

Fuente: [adenda recibida](docs/integraciones/2026-10-05-adenda-contexto-conversacional-v1-1.md).
La revisión documental 1.1 mantiene rutas `/app/v1` y DTO `schema_version=1.0`.

### Capacidades de credencial APP
- **Tipo:** conceptos de autorización / capacidades server-side propuestas.
- **Definición:** Facultades de una credencial de integración: `app.sessions.write` inicia y atestigua identidad; `app.timeline.read` lee; `app.turns.write` admite turnos; `app.handoff.request` solicita atención; `app.context.attest` atestigua contexto; `app.subjects.revoke` aplica revocaciones.
- **Alcance:** adenda 1.1, §2; futura configuración de claves y autorización LidIA.
- **Notas:** Distintas de `permissions` de la conversación. Firma válida o clave de turnos no conceden facultad para ampliar contexto. Son propuestas, no claves aprovisionadas.

### `current_context_revision`, `replayed` y `applied_at`
- **Tipo:** propiedades de respuesta propuestas.
- **Definición:** Revisión actualmente confirmada del contexto, indicador de recuperación sin nueva mutación y fecha del commit original de la operación recuperada, respectivamente.
- **Alcance:** `ConversationContextResponse` en `docs/integraciones/fixtures/app-context-v1-1.schema.json`.
- **Notas:** En replay, `context_revision` identifica la operación original; permisos, estado y deadline se reconstruyen con el contexto vigente. No se devuelve un ACK cacheado que restituya permisos antiguos.

### `bound_case_ref`
- **Tipo:** concepto runtime / propiedad interna propuestos.
- **Definición:** Primer caso privado ligado de forma durable a una conversación; conserva ese ámbito incluso cuando el contexto visible retire `case_ref` a null.
- **Alcance:** adenda 1.1, §5; futura persistencia LidIA de contexto conversacional.
- **Notas:** Impide reutilizar el historial del caso A para B. No es una propiedad del request ni una relación hoy implementada en Portal.

### `case_context_conflict` y `operation_retired`
- **Tipo:** códigos de error contractuales propuestos.
- **Definición:** Conflicto al intentar ligar a otro caso una conversación ya vinculada y reconocimiento de una operación cuyo detalle fue retirado, respectivamente.
- **Alcance:** adenda 1.1, §§3 y 6; `ContextError`. HTTP 409 y 410 respectivamente.
- **Notas:** No habilitan otro caso ni repiten efectos. Las marcas de operación mantienen identidad/huella aun sin el detalle; la política de purga sigue pendiente.

## Preparación de marketplaces (08/10/2026, diseño pendiente de revisión)

### APNs y FCM
- **Tipo:** conceptos de transporte de notificaciones.
- **Definición:** Apple Push Notification service (APNs) entrega avisos a iOS; Firebase Cloud Messaging (FCM) entrega los avisos Android de esta propuesta. Sus identificadores de registro pertenecen a transportes distintos.
- **Alcance:** `docs/app/MARKETPLACES.md`; futuras integraciones en `frontend/app/src/push.js` y `backend/src/services/push/`.
- **Notas:** Se propone APNs directo en iOS y FCM en Android usando el plugin oficial de Capacitor. Se descarta enviar el token APNs a FCM como si fuera un token FCM.

### `PushDevice`
- **Tipo:** entidad Prisma propuesta.
- **Definición:** Registro de una instalación autorizada para recibir avisos de una cuenta, con transporte, entorno y sesión asociados. No identifica a una persona ni concede acceso a expedientes.
- **Alcance:** diseño `docs/app/MARKETPLACES.md`; futura entidad en `backend/prisma/schema.prisma` y rutas en `backend/src/routes/push.js`.
- **Notas:** Se descarta guardar un único token en `User`: una cuenta puede tener varios dispositivos, rotaciones y cierres de sesión independientes.

### `PushDelivery`
- **Tipo:** entidad Prisma propuesta / concepto de entrega.
- **Definición:** Intento durable de enviar una notificación ya creada a un dispositivo, con estado y reintento. Permite distinguir aviso almacenado, aceptado por el proveedor y visto por el usuario.
- **Alcance:** diseño `docs/app/MARKETPLACES.md`; futura persistencia en `backend/prisma/schema.prisma` y worker en `backend/src/services/push/`.
- **Notas:** Se descarta bloquear cambios de expediente mientras responde el proveedor. Aceptación APNs/FCM no acredita recepción ni lectura.

### `SocialIdentity`
- **Tipo:** entidad Prisma propuesta.
- **Definición:** Vínculo entre la identidad estable de Apple o Google y una cuenta existente de Gestadia. Se identifica por emisor y sujeto del proveedor, no por el correo que declare el cliente móvil.
- **Alcance:** diseño `docs/app/ACCESO-SOCIAL.md`; futura entidad en `backend/prisma/schema.prisma` y servicio en `backend/src/services/social-auth.js`.
- **Notas:** Se descarta el alta o la fusión automática por coincidencia de email. Apple permite ocultarlo y las cuentas deben vincularse con prueba de control del acceso Gestadia.

### `SocialAuthAttempt`
- **Tipo:** entidad Prisma propuesta / concepto de autenticación.
- **Definición:** Intento de acceso o vinculación con plazo limitado y desafío de un solo uso. Conserva la correlación necesaria para rechazar callbacks ajenos o repetidos.
- **Alcance:** diseño `docs/app/ACCESO-SOCIAL.md`; futura entidad en `backend/prisma/schema.prisma` y rutas en `backend/src/routes/social-auth.js`.
- **Notas:** Se descarta aceptar tokens sin correlación con un intento iniciado por el servidor. La representación de nonce y retorno se comprobará con el plugin seleccionado.

### `AuthSession`
- **Tipo:** entidad Prisma propuesta.
- **Definición:** Sesión Gestadia revocable por el backend, separada de la identidad Apple/Google y del registro push. Vincula los avisos de una instalación al acceso que sigue vigente.
- **Alcance:** diseños `docs/app/MARKETPLACES.md` y `docs/app/ACCESO-SOCIAL.md`; futura persistencia y ampliación de `backend/src/middleware/auth.js`.
- **Notas:** Se descarta considerar la eliminación local de un JWT como revocación server-side. La transición de los JWT actuales requiere compatibilidad y pruebas.

### Firma de distribución y clave de subida
- **Tipo:** conceptos de publicación.
- **Definición:** La firma de distribución identifica el binario entregado al usuario. En Play App Signing, la clave de subida autentica el AAB que se entrega a Google y puede diferir de la firma final de la aplicación.
- **Alcance:** `docs/app/MARKETPLACES.md`; configuración futura de `frontend/android/app/build.gradle` y del proyecto Xcode.
- **Notas:** Se descarta reutilizar la firma debug para publicar o asumir que su huella autoriza el login Google de un build instalado desde Play.

### OAuth/OIDC, `state`, `nonce` y `jti`
- **Tipo:** conceptos de autenticación / propiedades de protocolo.
- **Definición:** OAuth y OpenID Connect organizan autorización e identificación mediante un proveedor. `state` correlaciona el retorno con el intento, `nonce` liga la prueba de identidad a un desafío y `jti` identifica un JWT individual.
- **Alcance:** `docs/app/ACCESO-SOCIAL.md`; futuras implementaciones en `backend/src/services/social-auth.js` y `backend/src/middleware/auth.js`.
- **Notas:** Se descarta tratar cualquiera de estos identificadores como permiso de expediente. Su validación debe incluir propósito, plazo y sesión, no sólo coincidencia de texto.

### Apple Services ID
- **Tipo:** concepto de configuración de proveedor.
- **Definición:** Identificador del servicio web que usa Sign in with Apple fuera de la autenticación nativa iOS. Se asocia al App ID principal y a dominios y retornos registrados.
- **Alcance:** `docs/app/ACCESO-SOCIAL.md`; futura configuración Apple y del backend para Android.
- **Notas:** Distinto del bundle ID iOS. El valor concreto no se ha elegido ni registrado.

## Interfaces de implementación marketplaces (08/10/2026)

### API de acceso social y dispositivos
- **Tipo:** contrato de rutas backend.
- **Definición:** `/api/auth/social/attempts`, `/complete`, `/account` y `/apple/callback` organizan intento, verificación, decisión de cuenta y retorno Apple. `/api/push/devices` registra/revoca instalaciones y `/api/auth/logout` revoca la sesión móvil.
- **Alcance:** `backend/src/routes/social-auth.js`, `push.js` y `auth.js`; `docs/app/2026-10-08-IMPLEMENTACION-MARKETPLACES.md`.
- **Notas:** Rutas Gestadia autenticadas donde procede; no rutas LidIA ni permiso implícito para expedientes.

### `MobileConfig`, `gestadia_updates` y preflight móvil
- **Tipo:** configuración / decisión de naming / concepto de build.
- **Definición:** Configuración pública y privada separadas de las capacidades móviles; `gestadia_updates` es el canal Android de avisos del servicio. El preflight comprueba la configuración antes de preparar una release.
- **Alcance:** `backend/src/mobile-config.js`, `scripts/mobile-preflight.mjs`, `frontend/app/src/push.js` y manifiesto Android.
- **Notas:** La activación del servidor se controla con `MOBILE_FEATURES_ENABLED`; flags del frontend no otorgan autorización ni sustituyen firma.

### Almacenamiento seguro de sesión
- **Tipo:** concepto runtime / selección de dependencia.
- **Definición:** Persistencia nativa de tokens y cierres pendientes mediante Keychain iOS/Keystore Android, con copia sólo en memoria durante la ejecución. Se usa `@aparajita/capacitor-secure-storage` y sin sincronización iCloud.
- **Alcance:** `frontend/app/src/session-storage.js`; consumo desde API/arranque.
- **Notas:** Se descarta usar el fallback web del plugin, que escribe localStorage sin cifrar; la web conserva sessionStorage.

### `AccountDeletionRequest` y `accessRevokedAt`
- **Tipo:** entidad Prisma / propiedad de usuario.
- **Definición:** Petición durable de retirada de una cuenta, con estado observable y revisión de los datos sujetos a retención. `accessRevokedAt` marca que esa cuenta ya no puede abrir ni mantener sesiones.
- **Alcance:** schema Prisma, servicio de retirada y middleware de autenticación; pantalla Cuenta.
- **Notas:** Petición aceptada no equivale a borrado completado; no se destruyen expedientes sin política de retención acordada.

### Prueba de canje y cifrado de credenciales móviles
- **Tipo:** conceptos runtime.
- **Definición:** Un secreto efímero retenido por el cliente cuyo hash liga el canje de un retorno social a su iniciador. El cifrado AES-GCM protege registros push y credenciales Apple almacenados server-side con una clave privada del entorno.
- **Alcance:** `backend/src/services/mobile-crypto.js`, social-auth y push; `frontend/app/src/social-auth.js`.
- **Notas:** El código de retorno o el ID de instalación solos no autentican. No versionar la clave de cifrado ni usar JWT_SECRET como clave alternativa.

### Estados del acceso social
- **Tipo:** concepto runtime.
- **Definición:** `account_required` pide confirmar un alta; `existing_account_required` exige acceder a la cuenta Gestadia existente; `link_required` pide confirmar una vinculación autenticada. Un intento transita de `pending` a `verified` y termina `consumed` una sola vez.
- **Alcance:** backend `services/social-auth.js`, rutas sociales y adaptador APP.
- **Notas:** No se convierte una coincidencia de email en vinculación automática.

### Reserva de entrega push
- **Tipo:** concepto runtime (`claimId`, `lockedUntil`).
- **Definición:** Reserva temporal de un intento de entrega para que sólo un worker procese una fila a la vez. Los estados son `pending`, `sending`, `accepted`, `cancelled` y `failed`; `accepted` acredita únicamente aceptación del proveedor.
- **Alcance:** `PushDelivery`, backend `services/push.js`.
- **Notas:** Entrega al menos una vez ante caída tras enviar; el identificador del aviso permite deduplicar. No equivale a lectura.

### Cola local de revocaciones
- **Tipo:** concepto runtime (`gestadia.pending-revocations`).
- **Definición:** Sesiones cerradas localmente cuya revocación de servidor sigue pendiente por falta de conexión; nunca vuelven a restaurarse como sesión activa.
- **Alcance:** APP `sessionStorage.js`, Keychain/Keystore sin sincronización ni migración entre dispositivos.
- **Notas:** Conservar cifrada la credencial hasta revocar permite completar logout offline al reconectar.

### Preferencia push del dispositivo
- **Tipo:** concepto runtime (`gestadia.push-enabled`, `gestadia.installation`).
- **Definición:** Preferencia explícita de recibir avisos e identificador aleatorio de esta instalación; no identifican ni autentican al usuario.
- **Alcance:** APP `push.js`, almacenamiento seguro local y `PushDevice.installationId` en servidor.
- **Notas:** El permiso del sistema y la inscripción autenticada se comprueban por separado.

### Revocación de identidad Apple
- **Tipo:** propiedad (`appleAudience`, `appleRevokedAt`).
- **Definición:** Cliente Apple que emitió la credencial de revocación y fecha de confirmación de su retirada por Apple.
- **Alcance:** `SocialIdentity`, `apple-auth.js`, `account-deletion.js`.
- **Notas:** Audiencia retenida junto al refresh token cifrado para distinguir App ID iOS y Services ID Android.

### Capacidades públicas del backend móvil
- **Tipo:** ruta API (`GET /api/mobile/capabilities`).
- **Definición:** Declara habilitación móvil y clientes públicos efectivos para comprobar coherencia con la configuración empaquetada.
- **Alcance:** backend `app.js`, script `mobile-release.mjs`.
- **Notas:** No sustituye pruebas de login/push ni acredita firma o recepción. Sólo contiene identificadores públicos.

### Clave de subida Android Gestadia
- **Tipo:** decisión naming (`gestadia-upload`).
- **Definición:** Alias de la clave privada local que firma los paquetes enviados a Play; es distinta de la clave de firma que Play aplica a la app distribuida.
- **Alcance:** almacén privado fuera de Git, configuración de firma Android e inventario de certificados.
- **Notas:** OAuth Android necesita registrar las huellas de cada firma efectiva, incluida Play App Signing; el certificado de subida no acredita publicación.

### Retirada local de sesión y revocación pendiente
- **Tipo:** concepto runtime.
- **Definición:** cierre inmediato del acceso en el dispositivo conservando de forma segura la obligación de invalidar la sesión en el servidor cuando vuelva la conexión. La demostración conserva esa obligación sin realizar llamadas externas.
- **Alcance:** APP; `frontend/app/src/sessionStorage.js`, `AppContext.jsx`, `Login.jsx`.
- **Notas:** se descarta borrar el token sin conservar la revocación, porque dejaría una sesión activa en el servidor.

### Renovación del lease push
- **Tipo:** concepto runtime.
- **Definición:** mantenimiento temporal de la propiedad exclusiva de un envío pendiente mientras el proveedor procesa la petición. Su caducidad permite recuperar trabajo tras la caída de un worker.
- **Alcance:** backend; `backend/src/services/push.js`.
- **Notas:** un temporizador fijo sin renovación permite reclamar el mismo envío durante reintentos internos lentos de FCM; la entrega sigue siendo al menos una vez tras caídas.

### certificateSha256
- **Tipo:** propiedad.
- **Definición:** huella SHA-256 aprobada del certificado de la clave de subida Android usada para preparar una release. Identifica material público de firma, no la contraseña ni la clave privada.
- **Alcance:** scripts de distribución; `scripts/mobile-preflight.mjs`, configuración privada de firma fuera de Git.
- **Notas:** se descarta comprobar sólo que existe el keystore: también podría ser una clave de depuración o una clave distinta.

### Nombres de recursos móviles Gestadia
- **Tipo:** decisión naming.
- **Definición:** `Gestadia APP Web`, `Gestadia APP iOS` y `Gestadia APP Android Upload` identifican los clientes OAuth del backend y de cada plataforma en `gestadia-vozia`. `Gestadia APNs` (producción), `Gestadia APNs Sandbox` (pruebas) y `Gestadia Apple Login` identifican claves separadas de notificaciones y autenticación del equipo Apple confirmado.
- **Alcance:** Google Cloud/Apple Developer; `docs/app/MARKETPLACES-CONFIGURACION.md`, configuración privada de distribución fuera de Git y clientes públicos de APP/backend.
- **Notas:** se descarta reutilizar nombres o credenciales LIA; una etiqueta nueva no acredita que el recurso ya esté creado.

### com.gestadia.app.login
- **Tipo:** decisión naming.
- **Definición:** Services ID previsto para el acceso Apple desde Android mediante callback HTTPS del backend. Está vinculado al App ID principal `com.gestadia.app`.
- **Alcance:** Apple Developer, configuración pública móvil y backend; `docs/app/MARKETPLACES-CONFIGURACION.md`.
- **Notas:** registro y dominio pendientes; no usar el bundle nativo como cliente del flujo web Android.

### gestadia-mobile-push
- **Tipo:** decisión naming.
- **Definición:** cuenta de servicio prevista exclusivamente para enviar notificaciones FCM en `gestadia-vozia`. Su identidad completa es `gestadia-mobile-push@gestadia-vozia.iam.gserviceaccount.com`.
- **Alcance:** IAM Google Cloud y credencial privada del backend fuera de Git.
- **Notas:** se descarta reutilizar Firebase Admin general o roles Owner/Editor; solicitar únicamente `roles/firebasecloudmessaging.admin` para envío.

### Gestadia App Store
- **Tipo:** decisión naming.
- **Definición:** perfil de aprovisionamiento previsto para distribuir `com.gestadia.app` con el certificado Apple Distribution del equipo `X27NG7M487`.
- **Alcance:** Apple Developer y firma Xcode de distribución; `docs/app/MARKETPLACES-CONFIGURACION.md`.
- **Notas:** se descarta usar un perfil LIA; un perfil no acredita que una build haya sido publicada.
