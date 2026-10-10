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

## Implementación conversacional Portal (05/10/2026)

### `AppDeviceSession`
- **Tipo:** entidad Prisma.
- **Definición:** Sesión revocable de un dispositivo de la APP ligada a la cuenta compartida; conserva la huella del token, nunca su valor.
- **Alcance:** backend/prisma/schema.prisma; backend/src/app/identity.js.
- **Notas:** Se mantiene la autenticación JWT del Portal existente; la sesión APP tiene su propio ciclo de vida.

### `AppConversation`
- **Tipo:** entidad Prisma.
- **Definición:** Asociación durable entre cuenta, integración, propósito y ámbito de expediente y la conversación pública LidIA.
- **Alcance:** backend/prisma/schema.prisma; backend/src/app/conversations.js.
- **Notas:** No depende de cookies, no se reasigna entre cuentas/casos, no guarda ids internos de agente.

### `AppOperation`
- **Tipo:** entidad Prisma / outbox.
- **Definición:** Claim durable de una petición APP con su identidad, huella y resultado pendiente o conocido.
- **Alcance:** backend/prisma/schema.prisma; backend/src/app/store.js.
- **Notas:** Se persiste antes de HTTP; la pérdida de respuesta conserva la misma operación/key. También transporta contexto y revocación.

### `AppConversationAccess`
- **Tipo:** entidad Prisma.
- **Definición:** Evidencia vigente de permisos y asignaciones acreditadas por la autoridad Portal para un ámbito de conversación.
- **Alcance:** backend/prisma/schema.prisma; backend/src/app/lifecycle.js.
- **Notas:** Sólo escritores internos; no se deduce gestor desde Owner ni desde ids enviados por móvil.

### `accountStatus, accountVerifiedAt, accountVerificationMethod`
- **Tipo:** propiedades User.
- **Definición:** Estado de cuenta y evidencia fechada del consumo de un mecanismo de verificación de cuenta.
- **Alcance:** backend/prisma/schema.prisma; backend/src/routes/auth.js.
- **Notas:** No se rellena desde emailVerified histórico, createdAt ni desde un login.

### `conversationsEnabled`
- **Tipo:** configuración pública.
- **Definición:** Selector del consumidor APP que utiliza la API conversacional autenticada de Portal.
- **Alcance:** frontend/app/public/app-config.js; frontend/app/src/conversationApi.js.
- **Notas:** False por defecto; no contiene agentes, destinos LidIA o secretos.

### `AppConversationService / AppS2SClient`
- **Tipo:** conceptos runtime / decisión naming.
- **Definición:** Servicio Portal de autoridad y recuperación; cliente servidor a servidor firmado que ejecuta sólo las rutas del contrato APP.
- **Alcance:** backend/src/app/conversations.js; backend/src/app/s2s.js.
- **Notas:** La UI no firma ni elige proyectos/agentes. La integración queda deshabilitada por defecto.


### `scopeKey`, `scopeId`, `remoteId`, `syncedRevision`
- **Tipo:** propiedades de persistencia APP.
- **Definición:** Ámbito estable de propósito/caso, ámbito local de idempotencia, identificador público remoto LidIA y última revisión de contexto confirmada por LidIA.
- **Alcance:** modelos AppConversation/AppOperation; backend/src/app/store.js.
- **Notas:** El ámbito no cambia por dispositivo ni rotación de credencial; remoteId no es el id interno de ChatSession. syncedRevision no prueba propagación universal.

### `gestadia_app_conversation_v1`
- **Tipo:** decisión naming de almacenamiento móvil.
- **Definición:** Prefijo de envíos pendientes locales separados por cuenta y conversación.
- **Alcance:** frontend/app/src/conversationApi.js.
- **Notas:** Conserva el mismo turn_id/key para recuperación explícita, se limpia al salir/cambiar de cuenta; no guarda credenciales S2S ni resultados privados de herramientas.

### Prueba APP aislada
- **Tipo:** concepto de verificación.
- **Definición:** Suite reproducible con MySQL efímero local, autoridad/API reales y límite LidIA sustituido por fixtures controlados.
- **Alcance:** scripts/test-app-conversations.mjs; backend/src/app/*.test.js y frontend/app/src/*Conversation*.test.*.
- **Notas:** No lee .env ni usa conexiones/credenciales reales, no acredita E2E con agente o despliegue publicado.

### `AppConversation.stateRevision`

- **Tipo:** propiedad Prisma / concepto runtime.
- **Definición:** mayor revisión pública LidIA observada de una conversación; impide que respuestas de estado anteriores sustituyan el estado confirmado.
- **Alcance:** backend/prisma/schema.prisma y backend/src/app/conversations.js.
- **Notas:** String decimal comparado con BigInt; distinto de contextRevision/syncedRevision y receipt_revision. No convertir a Number.

### `identity_link_required`

- **Tipo:** código de problema / concepto runtime.
- **Definición:** rechazo conversacional definitivo por falta de un vínculo de identidad necesario para el destino solicitado; no concede asignación ni activa un destino alternativo.
- **Alcance:** contrato APP LidIA, backend/src/app/s2s.js y frontend/app/src/AppConversation.jsx.
- **Notas:** Se conserva el código409 y se libera el envío pendiente. La APP informa de la vinculación pendiente; no crea un vínculo CRM mediante datos declarados.

### `Receipt.result.handoff_status`

- **Tipo:** propiedad DTO / concepto runtime.
- **Definición:** estado de atención humana acreditado por LidIA, separado del estado de procesamiento del recibo. Un recibo completed con requested confirma que la solicitud quedó registrada y sigue pendiente de asignación.
- **Alcance:** contrato DTO APP y backend/src/app/contracts/app-v1-dtos.schema.json; proyección/UI AppConversation.
- **Notas:** completed no significa operador atendiendo. Nombre de operador únicamente con estado assigned/in_support confirmado por timeline.

### `Support.operator_display_name`

- **Tipo:** propiedad DTO / concepto runtime.
- **Definición:** nombre público del operador actualmente asignado a la conversación, acreditado por el estado de soporte de LidIA. No identifica al autor de cada mensaje histórico.
- **Alcance:** contrato APP Support/Timeline, backend/src/app/contracts/app-v1-dtos.schema.json y frontend/app/src/AppConversation.jsx.
- **Notas:** Mostrar aparte solo assigned/in_support; mensajes operator se presentan como Equipo Gestadia mientras Message no tenga atribución por elemento acordada.

### `routing_unavailable`

- **Tipo:** código de problema / concepto runtime.
- **Definición:** rechazo por ausencia de un destino de atención configurado y elegible para la solicitud vigente. No asigna operador ni confirma una transferencia.
- **Alcance:** contrato APP LidIA, backend/src/app/s2s.js y frontend/app/src/AppConversation.jsx.
- **Notas:** Preservar el rechazo409 y liberar pendiente; nunca elegir otra cola o persona como fallback.

### Prueba local integrada APP / Portal / LidIA

- **Tipo:** concepto de verificación.
- **Definición:** Prueba con las interfaces y las API reales conectadas por HTTP/HTTPS en loopback, bases temporales propias y cuentas ficticias. El límite de modelo de LidIA se sustituye por uno determinista identificado.
- **Alcance:** docs/integraciones/2026-10-06-prueba-local-app-portal-lidia.md y su evidencia; procesos/configuración efímera fuera del código de producción.
- **Notas:** Diferente de la suite con respuestas LidIA simuladas; no acredita agente 119, producción, Zoho, modelo real ni instalación física.

### Comprobación previa local APP / Portal (`app-local-preflight`)

- **Tipo:** concepto operativo de verificación.
- **Definición:** Lectura de la autoridad, sesiones, sincronización y operaciones pendientes de una cuenta de prueba, junto al diagnóstico local de LidIA. Su resultado indica la vigencia más corta observada; no crea ni renueva acceso.
- **Alcance:** scripts/app-local-preflight.mjs, scripts/app-local-preflight.test.mjs y docs/integraciones/2026-10-07-perfil-y-comprobacion-local.md.
- **Notas:** Se rechaza dar el entorno por listo sólo porque responda HTTP o porque un fichero declare una fecha futura; se exige el diagnóstico efectivo de la fuente.

### `ready_until` / `observed_horizon_until` (diagnóstico local)

- **Tipo:** propiedades de diagnóstico operativo.
- **Definición:** `observed_horizon_until` es el menor vencimiento observado entre autoridad Portal y validez LidIA efectivamente comprobada. `ready_until` sólo lo expone como vigencia utilizable si pasan todas las comprobaciones, incluida la cola de contexto/revocación.
- **Alcance:** scripts/app-local-preflight.mjs y su salida JSON; no son propiedades de las API de producto.
- **Notas:** El plazo de Portal por sí solo se muestra aparte y nunca acredita vigencia de todo el circuito.

### Contexto incierto superado por una revisión confirmada

- **Tipo:** decisión de estado runtime.
- **Definición:** Una operación de contexto con respuesta explícita HTTP409 `stale_context` puede quedar `superseded` si la misma conversación tiene una revisión superior ya sincronizada. Se conserva el rechazo; no se afirma que la operación antigua se admitiese.
- **Alcance:** backend/src/app/lifecycle.js, `deliverLifecycle`; regresiones en backend/src/app/conversations.test.js.
- **Notas:** La prueba se relee dentro de la transacción de cuenta. No se aplica a fallos de red, otras respuestas HTTP, revocaciones, conversaciones sustituidas ni revisiones superiores sin confirmar; no introduce un estado nuevo.

### Relectura autoritativa de presentaciones en APP

- **Tipo:** decisión de proyección UI.
- **Definición:** El historial incremental no vuelve a entregar los mensajes anteriores cuando sus opciones se invalidan. La APP relee el snapshot paginado al avanzar la revisión de estado o aparecer un recibo terminal nuevo, para actualizar esas opciones y el historial con el DTO autorizado vigente.
- **Alcance:** frontend/app/src/AppConversation.jsx y sus regresiones; contrato Timeline de LidIA sin modificar.
- **Notas:** Se descarta reactivar acciones antiguas desde caché o inferir éxito de un envío. El snapshot completo reemplaza la caché, incluida la retirada de mensajes omitidos; se acumulan recibos de todas las páginas por turno/estado. No se acepta una revisión distinta entre páginas ni un cursor repetido como lectura completa; un fallo de historial no convierte un envío admitido en incierto.

### Prueba APP con el agente 119 real

- **Tipo:** concepto de verificación.
- **Definición:** Conversación iniciada desde la APP cuyo agente119, instrucción y modelo efectivo están acreditados por el runtime fuente, con respuesta del proveedor real. Se registra aparte de la prueba con agente902 y modelo determinista.
- **Alcance:** docs/integraciones/2026-10-07-preparacion-agente-119-real.md; consumidor existente backend/src/config.js y backend/src/app/s2s.js mediante su configuración APP.
- **Notas:** El móvil no selecciona agente/proyecto/modelo. Un cambio de destino exige separar las asociaciones remotas anteriores y documentar el entorno efectivo; cambiar una etiqueta o copiar un identificador no acredita la ejecución real.

### Agente APP dedicado basado en 119

- **Tipo:** concepto de integración y decisión de aislamiento.
- **Definición:** Agente con identidad propia derivado de la configuración de LidIA Canje v4, cuyo proyecto, instrucción y modelo efectivo se acreditan para el canal APP. Su ejecución y autoridad permanecen separadas de las conversaciones del 119 original y del fixture local.
- **Alcance:** docs/integraciones/2026-10-07-adenda-agente-app-y-transicion.md; configuración Portal `appConversationConfig` y `AppS2SClient`; agente/proyecto/instrucción e integración administrados en LidIA.
- **Notas:** Clon autorizado por el usuario después de la preparación literal 119. No significa reutilizar WhatsApp, Zoho, herramientas globales ni asociaciones antiguas; ID definitivo y nombre de proyecto los confirma LidIA.

### `gestadia-app-pro-local-validation`

- **Tipo:** identificador de integración y audiencia S2S de prueba.
- **Definición:** Ámbito acordado para conectar un consumidor Portal/APP local separado con el agente APP dedicado de LidIA en PRO. No identifica el fixture determinista ni una cuenta de cliente real.
- **Alcance:** documentación de preparación PRO del 07/10/2026, configuración privada `APP_LIDIA_INTEGRATION_ID`/`APP_LIDIA_AUDIENCE` y `AppIntegration` administrado por LidIA; no va en el móvil como selector.
- **Notas:** Origen acordado `https://lidia.gestadia.com`, permisos iniciales sondeo/history y base/cuenta/asociaciones nuevas. La validez, claves e IDs de agente/proyecto siguen sujetos a configuración efectiva de la fuente.

### `LidIA Canje APP` / `Gestadia APP` (`gestadia-app`)

- **Tipo:** identidad de agente/proyecto runtime en LidIA.
- **Definición:** Instancias dedicadas del agente122 y proyecto103 provisionadas por LidIA para separar las conversaciones APP de las del119 original. La instrucción10116 propia y el modelo explícito pertenecen a ese destino; crear las instancias no acredita el despliegue del canal ni una respuesta real.
- **Alcance:** administración/BBDD LidIA; docs/app/INTEGRACION-LIDIA.md y configuración privada de la prueba `gestadia-app-pro-local-validation`. No son selectores elegibles desde el móvil.
- **Notas:** Procedencia, versión/hash de instrucción y restricciones se registran en el documento vigente. El usuario autorizó el clon y Playground; se conservan originales y fixture como ámbitos distintos.

### `validUntil` (preparación privada de prueba APP)

- **Tipo:** propiedad de configuración operativa de prueba.
- **Definición:** Horizonte acordado para la autoridad de la cuenta ficticia que permite probar el circuito APP contra LidIA PRO. No describe la caducidad de claves HMAC ni prueba que el servicio esté desplegado o aislado.
- **Alcance:** entrega privada `s2s-portal-private.json`, lanzadores efímeros fuera del repositorio y docs/app/INTEGRACION-LIDIA.md; el permiso efectivo se registra en Portal y se entrega mediante el contrato de contexto.
- **Notas:** Se comprueba antes de arrancar y crear el grant; no añade una propiedad pública al contrato APP. Las claves v1 requieren retirada o desactivación explícita por la fuente.

### Sujeto desechable de revocación APP

- **Tipo:** concepto operativo de validación.
- **Definición:** Segunda cuenta ficticia independiente usada exclusivamente para comprobar la retirada de acceso APP sin deshabilitar la cuenta principal de la demostración. Comparte el techo sondeo/historial y el vencimiento autorizado, sin datos reales ni permisos CRM.
- **Alcance:** prueba local Portal contra la integración `gestadia-app-pro-local-validation`; lanzadores privados y docs/app/INTEGRACION-LIDIA.md. Reutiliza las entidades de cuenta y autoridad existentes, sin introducir una entidad de producto.
- **Notas:** Se descarta revocar irreversiblemente el sujeto principal al cerrar la comprobación: permanece disponible dentro del plazo autorizado. Las credenciales auxiliares se guardan fuera de Git. Estado final de esta fase: propuesta no ejecutada. La revisión automática rechazó crear un segundo sujeto; no existe cuenta, grant ni conversación remota auxiliar. La prueba solicitada se limitó después a un turno del sujeto principal con instrucciones originales.

### Consumidor local de prueba de canal con copia literal

- **Tipo:** concepto operativo de validación.
- **Definición:** Backend/frontend locales temporales con base vacía que reproducen la identidad y permiso del sujeto principal ya autorizado para iniciar una nueva conversación sin reutilizar el historial anterior. Prueba una petición textual con instrucción y modelo copiados del 119, conservando la política de transporte APP.
- **Alcance:** configuración privada en `/private/tmp/gestadia-portal-literal-channel-20261007`, base local `gestadia_app_literal_test`, puertos 3003/5176 y docs/app/INTEGRACION-LIDIA.md. No cambia el producto ni crea otra identidad en LidIA.
- **Notas:** Misma integración, capacidades, claves y vencimiento de la cuenta principal; se conservan 5175 y su historial. La prueba no acredita equivalencia de herramientas, automatizaciones ni runtime WhatsApp.

### Nombre personalizado de conversación

- **Tipo:** concepto de presentación y propiedad de cuenta propuesta.
- **Definición:** Nombre elegido por el propietario para identificar una conversación en Mensajes, independiente de los mensajes y de la identidad del agente u operador.
- **Alcance:** ampliación prevista de AppConversation en Portal, su API `/api/app/v1` y frontend/app/src/ConnectedMessages.jsx; diseño docs/integraciones/2026-10-07-mensajes-y-ciclo-gestor.md.
- **Notas:** Se conserva entre dispositivos y no se guarda únicamente en caché móvil. Diseño pendiente de revisión conjunta antes de implementar campos/endpoints nuevos.

### Metadatos autoritativos de conversación

- **Tipo:** concepto de contrato conversacional propuesto.
- **Definición:** Estado vigente y fecha del último mensaje acreditados por LidIA para presentar la conversación en el listado, sin descargar ni indexar todo su contenido. Una actualización técnica no constituye un mensaje.
- **Alcance:** contrato APP Portal↔LidIA y listado de Mensajes; diseño docs/integraciones/2026-10-07-mensajes-y-ciclo-gestor.md.
- **Notas:** La creación local del chat procede de AppConversation.createdAt. La ausencia confirmada de mensajes y un fallo de lectura se presentan de forma distinta; fechas/estado nuevos requieren acuerdo del contrato.


### `title` de AppConversation
- **Tipo:** propiedad / decisión de naming.
- **Definición:** nombre personalizado opcional de un chat, propiedad de su cuenta Portal. No altera el interlocutor ni el contenido.
- **Alcance:** backend Prisma `AppConversation`, servicio/ruta APP y listado `ConnectedMessages`.
- **Notas:** se descarta persistencia sólo en el dispositivo para conservarlo entre sesiones y dispositivos.

### `remoteCreatedAt` / `lastMessageAt`
- **Tipo:** propiedades de persistencia / concepto runtime.
- **Definición:** creación de sesión y último mensaje visible confirmados por LidIA. La última actividad no se sustituye por una actualización de contexto o título.
- **Alcance:** Prisma `AppConversation`; servicio APP y campos S2S `created_at` / `last_message_at`.
- **Notas:** nullable durante compatibilidad o sesión pendiente; se conserva el valor confirmado ante fallos.

### `metadata_ready`
- **Tipo:** propiedad de proyección APP.
- **Definición:** indica que fechas y estado de una conversación se confirmaron con la fuente en la consulta actual del listado. Permite distinguir ausencia de mensajes de metadatos no actualizados.
- **Alcance:** backend `conversationView` / `AppConversationService.list`, frontend `ConnectedMessages`.
- **Notas:** no se infiere del `updatedAt` local ni de una respuesta antigua en caché.

## setupNativeKeyboard

- **Tipo:** concepto runtime / función de arranque nativo.
- **Definición:** prepara el redimensionamiento nativo del WebView de iOS al mostrar el teclado para conservar la cabecera y el compositor dentro de la superficie visible.
- **Alcance:** APP, `frontend/app/src/native.js`, `main.jsx`; plugin oficial `@capacitor/keyboard` y configuración Capacitor.
- **Notas:** se usa `KeyboardResize.Native` sólo en iOS; Android conserva su ajuste nativo. Se descartó desactivar `WebView.scrollView`, porque la prueba en simulador bloqueó también los gestos de desplazamiento del perfil.

## Contexto de navegación APP (`from`, `fromState`)

- **Tipo:** concepto runtime / propiedades del estado del router.
- **Definición:** origen interno completo de una pantalla secundaria y contexto necesario para restituir su recorrido al volver. Incluye los parámetros que identifican conversación, documento o servicio.
- **Alcance:** APP, `frontend/app/src/navigation.js` y enlaces/cabeceras; [mapa de pantallas](docs/app/NAVEGACION.md).
- **Notas:** no se sustituye por un `history.back()` ciego: una entrada directa o un enlace externo puede carecer de historial interno. Las pestañas principales no construyen una pila de orígenes.

## Continuación de acceso APP (`returnTo`, `returnState`)

- **Tipo:** concepto runtime / propiedades del estado del router.
- **Definición:** pantalla interna solicitada antes del acceso y su contexto de retorno. Se conserva al alternar acceso/registro y consultar información legal.
- **Alcance:** APP, `navigation.js`, `Login.jsx`, `Register.jsx`, accesos desde Trámites y conversación.
- **Notas:** se descarta el envío incondicional al inicio tras iniciar sesión; una entrada directa al acceso sí continúa al inicio. No contiene credenciales.

## Borrador de Servicios (`serviceDraft`)

- **Tipo:** propiedad de presentación del estado del router.
- **Definición:** datos de tramitación introducidos en Servicios que se restablecen al volver de la revisión del checkout de demostración.
- **Alcance:** APP, `Services.jsx`, `DemoCheckout.jsx`; memoria de navegación de la pestaña.
- **Notas:** no se persiste en almacenamiento ni cambia el checkout real; evita perder campos al remontar el formulario.

## Acción visible de retorno (`data-app-back`)

- **Tipo:** atributo de interfaz / decisión de navegación nativa.
- **Definición:** control de cabecera que expresa el retorno contextual de la pantalla actual. El botón Atrás de Android utiliza esta misma acción después de cerrar cualquier diálogo abierto.
- **Alcance:** APP, `App.jsx`, `native.js`.
- **Notas:** se conserva el cierre de diálogos como primera acción; sólo en el inicio sin diálogo ni retorno se permite salir de la app.

## Listado compacto de Mensajes

- **Tipo:** concepto de interfaz / decisión de presentación.
- **Definición:** lista de conversaciones con nombre, interlocutor, estado y fechas de creación y último mensaje en una fila pequeña. La edición del nombre se despliega sólo en la fila seleccionada.
- **Alcance:** APP, `frontend/app/src/ConnectedMessages.jsx`, `app.css` y navegación de `App.jsx`.
- **Notas:** sustituye las tarjetas extensas y los accesos duplicados; conserva el contrato de conversaciones, los estados confirmados y el retorno contextual.

## Lucide React en Mensajes

- **Tipo:** dependencia de presentación / biblioteca de iconos.
- **Definición:** iconos vectoriales de la biblioteca oficial Lucide para búsqueda, actualización, edición y acceso a conversaciones.
- **Alcance:** `frontend/package.json`, `frontend/app/src/ConnectedMessages.jsx`.
- **Notas:** trazo coherente con el sistema visual existente; se evita dibujar iconos propios o añadir imágenes decorativas.

## Sistema visual APP

- **Tipo:** concepto de interfaz / tokens de presentación.
- **Definición:** escala común de colores, tipografía, espacios, superficies y controles para las pantallas de Gestadia APP. Distingue bienvenida, operación y conversación manteniendo la misma identidad.
- **Alcance:** `frontend/app/src/app.css`, pantallas y hojas APP; `docs/app/PLAN-DISENO-APP.md`.
- **Notas:** conserva las referencias aprobadas; no sustituye el marco Capacitor ni introduce otro tema.

## Lucide React en APP

- **Tipo:** dependencia de presentación / decisión de nomenclatura.
- **Definición:** biblioteca oficial de iconos utilizada tanto en Mensajes como en el adaptador compartido Icon de la APP.
- **Alcance:** `frontend/app/src/Icon.jsx`, `ConnectedMessages.jsx`, `frontend/package.json`.
- **Notas:** amplía el alcance de «Lucide React en Mensajes»; conserva los nombres del adaptador existente para evitar cambios en sus consumidores.

## create_new
- **Tipo:** propiedad de la API APP → Portal.
- **Definición:** Intención explícita de crear una conversación independiente con LidIA, conservando el historial y el estado de las existentes. Ausente o false mantiene la reanudación actual.
- **Alcance:** `backend/src/app/conversations.js`, `frontend/app/src/conversationApi.js`; contrato local de creación de conversaciones.
- **Notas:** Sólo se admite para sondeo; no se incorpora al DTO S2S SessionRequest ni modifica permisos o el agente efectivo.

## nueva
- **Tipo:** propiedad de navegación.
- **Definición:** Identificador UUID de un intento explícito de iniciar un chat con LidIA; permite distinguirlo de recuperar una conversación por su id.
- **Alcance:** `/lidia/conversacion?nueva=UUID`, `ConnectedMessages.jsx`, `AppConversation.jsx`.
- **Notas:** Es la clave de idempotencia del inicio, no una credencial; el acceso depende siempre de la cuenta autenticada. Abrir la ruta no crea una sesión. Tras crearla se sustituye por conversacion=id.

## semanticRequest
- **Tipo:** propiedad interna de persistencia.
- **Definición:** Representación usada únicamente para vincular la intención local de una operación a su hash de idempotencia.
- **Alcance:** `backend/src/app/store.js` y `conversations.js`.
- **Notas:** Por defecto coincide con request. Para create_new incluye esa intención en el hash sin almacenarla ni enviarla en el contrato S2S; false/ausente conserva los hashes anteriores.

## conversation_id (inicio local APP)
- **Tipo:** propiedad de la API APP → Portal.
- **Definición:** Referencia local de la conversación concreta que debe recuperarse, especialmente mientras su sesión remota está pendiente.
- **Alcance:** `backend/src/app/conversations.js`, `frontend/app/src/conversationApi.js`, `AppConversation.jsx`.
- **Notas:** Se valida pertenencia, propósito, expediente y permisos; no combina con create_new:true. No se envía al DTO S2S ni permite escoger sesiones de otra cuenta.

## AppMessageReceipt

- **Tipo:** concepto runtime compartido.
- **Definición:** acuse durable de un mensaje concreto que distingue enviado, recibido y leído; es independiente del recibo de procesamiento del turno. LidIA es su autoridad y Portal lo proyecta a la APP.
- **Alcance:** backend/src/app, frontend/app/src; contrato docs/integraciones/2026-10-08-app-recibos-mensajes.md.
- **Notas:** se descarta usar completed o la apertura del listado como lectura, porque no acreditan visibilidad humana.

## message_receipts_revision / receipt_revision

- **Tipo:** propiedad de contrato.
- **Definición:** revisión decimal del conjunto de acuses y de cada mensaje, respectivamente. La mezcla de datos de un mensaje usa su receipt_revision para no retroceder ante respuestas antiguas.
- **Alcance:** adenda de recibos y consumidor APP; independientes de state_revision del sondeo.
- **Notas:** no son cursores de lectura ni números JS; se comparan como BigInt.

## ack_id / message_receipt_ack

- **Tipo:** propiedad de contrato / concepto runtime.
- **Definición:** identificador estable y operación de confirmación de recepción o lectura de IDs concretos. Conserva el mismo cuerpo y la misma clave al recuperar una respuesta perdida.
- **Alcance:** backend/src/app y frontend/app/src; POST message-receipts.
- **Notas:** no admite actor ni fecha elegidos por el dispositivo; la identidad procede de la sesión y la fecha de LidIA.

## DeliveryTicks / useMessageReceipts / useReceiptSummaries

- **Tipo:** componente / hooks de interfaz.
- **Definición:** representación accesible de los acuses confirmados, seguimiento de mensajes aceptados/visibles en el chat y consulta de resúmenes en Mensajes.
- **Alcance:** frontend/app/src/DeliveryTicks.jsx y useMessageReceipts.js.
- **Notas:** Mensajes consulta sin ACK; las colas se acotan por cuenta y conversación y se eliminan con el cierre de sesión. No confunden el recibo de turno con la lectura.

## readActive

- **Tipo:** predicado interno de interfaz.
- **Definición:** condición que exige APP visible/en primer plano y ausencia de modal sobre el chat para admitir lectura de mensajes.
- **Alcance:** frontend/app/src/useMessageReceipts.js.
- **Notas:** se descarta usar sólo intersección geométrica, porque una hoja modal puede tapar el historial. Cerrar la hoja exige observación nueva.

## Sujeto previo al registro APP
- **Tipo:** concepto runtime propuesto (10/10/2026).
- **Definición:** Identidad opaca de un visitante sin cuenta que permite conversar con LidIA exclusivamente por APP. El nombre y los datos de contacto declarados no constituyen prueba de identidad de una cuenta.
- **Alcance:** propuesta `docs/integraciones/2026-10-10-propuesta-app-anonima-lidia.md`; futuros adaptadores APP de Portal y LidIA. Sin implementación actual.
- **Notas:** Se propone una identidad estable separada de `User`, con permisos acotados; se descarta crear usuarios ficticios verificados o reutilizar credenciales de Web/WhatsApp.

## Enlace de continuación APP
- **Tipo:** concepto de navegación y autorización propuesto (10/10/2026).
- **Definición:** Enlace de alcance limitado que conserva el recorrido pendiente de una conversación APP al abrir el registro o acceso. Su token no autentica una cuenta ni habilita expedientes.
- **Alcance:** propuesta `docs/integraciones/2026-10-10-propuesta-app-anonima-lidia.md`; futura API Portal y navegación nativa. Sin ruta desplegada.
- **Notas:** Token aleatorio, de un uso y con caducidad; guardar sólo su huella. El deeplink público de entrada no contiene esta credencial ni datos personales.

## Vinculación de conversación APP al registrarse
- **Tipo:** transición de identidad propuesta (10/10/2026).
- **Definición:** Asociación comprobada de la conversación del visitante a una cuenta verificada, conservando la sesión LidIA, sus mensajes y el estado del sondeo. La revocación del acceso previo forma parte del cierre de la transición.
- **Alcance:** propuesta `docs/integraciones/2026-10-10-propuesta-app-anonima-lidia.md`; futuros servicios de identidad/conversaciones Portal y contrato S2S LidIA.
- **Notas:** No es una reasignación entre dos cuentas existentes ni una fusión por email/teléfono; requiere prueba de control del recorrido original y del acceso de cuenta. Resultado idempotente en ambos sistemas.

## Sujeto inmutable por conversación APP
- **Tipo:** decisión de identidad propuesta para una ampliación opt-in (10/10/2026).
- **Definición:** Referencia estable de una conversación y de sus operaciones antes y después del registro, independiente de la cuenta que termine autorizada a acceder. Vincular el acceso no modifica la identidad histórica del ledger.
- **Alcance:** contraste Portal/LidIA en `docs/integraciones/2026-10-10-contraste-portal-app-anonima.md`; futuros servicios APP de ambos proyectos. No implementado.
- **Notas:** Se propone un sujeto por conversación para poder retirar el acceso visitante sin revocar otros sondeos. El contrato v1 de cuenta continúa vigente sin convertir sus sujetos ni sus huellas.

## Actor de acceso APP
- **Tipo:** concepto de autorización propuesto (10/10/2026).
- **Definición:** Visitante o cuenta autenticada que puede actuar sobre una conversación bajo una revisión de acceso confirmada. Es distinto del sujeto inmutable que conserva el historial de operaciones.
- **Alcance:** contraste Portal/LidIA en `docs/integraciones/2026-10-10-contraste-portal-app-anonima.md`; futura adenda S2S APP.
- **Notas:** El backend atestigua el actor; el móvil no puede elegirlo. La forma exacta del DTO y de su firma permanece pendiente de revisión conjunta.

## Revisión de acceso APP
- **Tipo:** propiedad de autorización propuesta (10/10/2026).
- **Definición:** Versión monotónica de quién puede acceder a una conversación, necesaria para rechazar peticiones realizadas con la autoridad anterior tras una vinculación. Es independiente de las revisiones de contexto, estado y recibos.
- **Alcance:** contraste Portal/LidIA en `docs/integraciones/2026-10-10-contraste-portal-app-anonima.md`; futura adenda S2S APP.
- **Notas:** Se propone atestiguación firmada y comparación sin pérdida de precisión. El nombre de campo y los DTO se cerrarán con la respuesta técnica; no está presente en el runtime actual.

## conversation_subject_id / access_revision (adenda APP v2 propuesta)
- **Tipo:** propiedades S2S propuestas (10/10/2026).
- **Definición:** `conversation_subject_id` identifica el sujeto inmutable de un chat; `access_revision` identifica la revisión monotónica de su autoridad vigente. La primera conserva las operaciones y la segunda controla el cambio de actor al registrarse.
- **Alcance:** revisión LidIA y contraste `docs/integraciones/2026-10-10-contraste-portal-app-anonima.md`; futuros DTO y firma del adaptador APP en ambos proyectos.
- **Notas:** No reemplazan silenciosamente `portal_user_id` o `SubjectId` de v1. Propuestas sin esquema/vectores ejecutables acordados; sondeo, contexto y recibos conservan sus propias revisiones.

## binding_id / prepare / commit / abort (vinculación APP propuesta)
- **Tipo:** referencia de operación y fases de transición propuestas (10/10/2026).
- **Definición:** `binding_id` correlaciona una vinculación durable de conversación a cuenta. `prepare` inmoviliza origen/destino, `commit` confirma la nueva autoridad y `abort` cancela una preparación que aún puede revertirse de forma comprobada.
- **Alcance:** revisión LidIA y contraste `docs/integraciones/2026-10-10-contraste-portal-app-anonima.md`; futura API S2S APP.
- **Notas:** No son herramientas del modelo ni tokens del móvil. Un timeout HTTP no implica abort; cada fase necesita su propia idempotencia, autorización y recuperación.

## AppDeclaredContact
- **Tipo:** concepto de estado tipado propuesto por LidIA (10/10/2026).
- **Definición:** Nombre y teléfono y/o email declarados en una conversación, con evidencia del mensaje, fecha y revisión. No representa identidad verificada ni propiedad de una cuenta.
- **Alcance:** revisión LidIA y contraste `docs/integraciones/2026-10-10-contraste-portal-app-anonima.md`; futura proyección del sondeo en LidIA.
- **Notas:** El runner APP actual no lo emite ni persiste como tal. No se extrae autoridad de cuenta leyendo la prosa del asistente.

## AppCallIntent / registration_required
- **Tipo:** estado tipado y señal de continuación propuestos por LidIA (10/10/2026).
- **Definición:** `AppCallIntent` conserva una intención comprobada de solicitar llamada; `registration_required` indica que hace falta completar el acceso de cuenta para continuarla. Ninguno representa una cita reservada.
- **Alcance:** revisión LidIA y contraste `docs/integraciones/2026-10-10-contraste-portal-app-anonima.md`; futura proyección LidIA y consumo Portal/APP.
- **Notas:** El backend Portal genera el enlace de continuación; el modelo no recibe ni inventa tokens. Registrar no ejecuta llamada ni convierte al usuario en cliente pagado.

## app.bindings.write / app.bindings.read
- **Tipo:** capacidades S2S propuestas (10/10/2026).
- **Definición:** Facultades de una integración para solicitar una vinculación y recuperar su resultado durable. No conceden por sí solas acceso al historial de una conversación.
- **Alcance:** revisión LidIA y contraste `docs/integraciones/2026-10-10-contraste-portal-app-anonima.md`; futura adenda APP v2.
- **Notas:** No emitidas ni activadas. Cada petición debe validar también actor, conversación, destino y revisión vigente; nunca se entregan al cliente móvil.

## Tablero visual de revisión APP

- **Tipo:** concepto de documentación de producto.
- **Definición:** conjunto de mapas y capturas navegables que muestra el recorrido visible antes de aprobar un cambio de producto; distingue pantallas actuales de propuestas.
- **Alcance:** `docs/app/prototipos/lidia-anonima/` y documentación de revisión del recorrido APP sin cuenta.
- **Notas:** las maquetas no representan disponibilidad del backend, registro real, reserva de agenda ni aceptación nativa.

## Contacto para gestor tras cualificación APP

- **Tipo:** decisión de recorrido propuesta, corregida por el usuario el 10/10/2026.
- **Definición:** Recogida de nombre y teléfono o email sólo después del resultado suficiente del canje y de que el visitante solicite contacto de un gestor. La sesión permite continuar la consulta antes de disponer de esos datos, sin autenticar una cuenta.
- **Alcance:** propuesta APP anónima, mapas de `docs/app/NAVEGACION.md` y maquetas de `docs/app/prototipos/lidia-anonima/`; contrato Portal/LidIA/Zoho pendiente.
- **Notas:** Sustituye la recogida al inicio del chat. La conversión lead a contacto/trato corresponde a los flujos Zoho; una solicitud de contacto no equivale a una cita confirmada ni a permisos de cliente.

## contact_request_allowed / app.contact_request.ready

- **Tipo:** gate y señal de integración propuestos para APP v2.
- **Definición:** `contact_request_allowed` exige resultado completo suficiente (`can_continue`) y voluntad expresa (`contact_requested`). `app.contact_request.ready` representa la solicitud confirmada para entregar a Portal, con evidencia, intención y revisión identificables.
- **Alcance:** propuesta y contraste en `docs/integraciones/2026-10-10-*.md`; futura proyección LidIA y receptor Portal. No implementados.
- **Notas:** No se habilitan por país, human_review o registro. La solicitud se envía como visitante; la cuenta se ofrece después para guardar el mismo chat. `registration_required` queda limitado a otras operaciones que realmente exijan cuenta; no bloquea esta solicitud. Registro/cancelación del alta no reenvían ni cancelan una solicitud recibida.

## Solicitud APP con recepción incierta

- **Tipo:** concepto de estado de integración propuesto.
- **Definición:** Solicitud confirmada cuyo resultado durable todavía no ha sido recuperado. Permanece pendiente de comprobación; el cliente no puede darla por recibida ni generar otra operación para resolver la incertidumbre.
- **Alcance:** propuesta/contraste de integración y mapas APP; maqueta `docs/app/prototipos/lidia-anonima/pantallas.jsx`. No existe un DTO nuevo acordado.
- **Notas:** Se reconcilia el mismo event_id, intención y revisión. Registro, vínculo y pérdida de una respuesta no cambian su identidad ni reenvían sus efectos.

## Control de instalación original para vínculo APP

- **Tipo:** condición de autorización propuesta, precisada con LidIA el 10/10/2026.
- **Definición:** Prueba vigente de acceso al recorrido original exigida junto con una cuenta verificada para guardar ese chat en ella. La posesión de un enlace o un contacto autodeclarado no sustituye esta condición.
- **Alcance:** propuesta/contraste APP, NAVEGACION y maqueta de vínculo bloqueado; futuros servicios de identidad y protocolo v2.
- **Notas:** Primera entrega: cuenta verificada Y control de instalación original. Instalación perdida bloquea el vínculo hasta aprobar un procedimiento de recuperación separado. Sujeto inmutable por conversación y actor/propietario separados son la arquitectura aceptada en principio; vincular A no revoca B.

## Manual de desarrollo de flujos y pantallas APP

- **Tipo:** referencia documental de desarrollo.
- **Definición:** Guía de entrada que relaciona navegación, pantallas, maquetas, contratos y evidencias, y explica cómo consultarlos y mantenerlos durante el desarrollo. Distingue comportamiento implementado, propuesta y pruebas observadas.
- **Alcance:** `docs/app/MANUAL-DESARROLLO.md`, README raíz/APP, AGENTS.md y README del prototipo.
- **Notas:** No sustituye contratos ni actas recibidas; los enlaza. Incorporar esta documentación a app/main no equivale a implementar o activar el recorrido anónimo.

## AppGuestSession (Portal v2, preparación)

- **Tipo:** entidad Prisma propuesta.
- **Definición:** Credencial temporal de instalación emitida por Portal para acceder a conversaciones propias sin una cuenta. No representa un usuario verificado ni un contacto CRM.
- **Alcance:** plan `docs/superpowers/plans/2026-10-10-app-v2-portal.md`; futuros `backend/src/app/v2/installation.js` y `backend/prisma/schema.prisma`.
- **Notas:** Se almacenará el hash del secreto, con vencimiento y revocación. Se descarta reutilizar AppDeviceSession con un User ficticio o convertir un login fallido en acceso visitante. No implementada.

## AppV2Conversation / AppV2Binding (Portal v2, preparación)

- **Tipo:** entidades Prisma propuestas.
- **Definición:** AppV2Conversation conserva sujeto inmutable, actor autorizado y revisión de acceso de cada chat v2. AppV2Binding registra la transferencia recuperable de un chat desde su instalación original hacia una cuenta verificada.
- **Alcance:** plan Portal v2; futuros `backend/src/app/v2/store.js`, `bindings.js` y `backend/prisma/schema.prisma`.
- **Notas:** La asociación v1 exige User y se conserva intacta. Se descarta vincular globalmente todos los chats de la instalación, cambiar autores históricos o rehabilitar al visitante después de un commit. No implementadas.

## AppS2SClientV2 (Portal, preparación)

- **Tipo:** cliente de integración propuesto.
- **Definición:** Consumidor servidor-servidor del contrato APP v2 de LidIA, con sujeto, actor y revisión de acceso firmados. Su ámbito es independiente del cliente v1 de cuenta.
- **Alcance:** plan Portal v2; futuro `backend/src/app/v2/s2s.js` y contratos compartidos recibidos de LidIA.
- **Notas:** Esquemas, vectores y allowlist de rutas deben aceptarse antes de implementarlo. Se descarta el fallback a v1, PluginWeb o una URL indicada por el móvil. No implementado.

## AppContactRequest / ACK de contacto APP v2

- **Tipo:** entidad durable y concepto de entrega propuestos.
- **Definición:** AppContactRequest conserva en Portal la solicitud confirmada de contacto por intención/revisión y evento original. El ACK acredita su persistencia y permite reconciliar la entrega de esa misma solicitud con LidIA.
- **Alcance:** `docs/integraciones/2026-10-10-coordinacion-portal-contrato-v2.md`, plan Portal v2; futuros `backend/src/app/v2/contactRequests.js` y `backend/prisma/schema.prisma`.
- **Notas:** El nombre y los campos exactos del DTO remoto pertenecen al contrato LidIA pendiente. Persistir un estado pendiente no equivale a confirmar el ACK, entregar a Zoho ni agendar una cita. No implementados.
