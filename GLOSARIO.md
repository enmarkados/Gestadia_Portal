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

### Gestadia APP Android
- **Tipo:** decisión naming.
- **Definición:** alias de la aplicación Firebase Android con paquete `com.gestadia.app` en `gestadia-vozia`, destinada al registro de dispositivos FCM.
- **Alcance:** Firebase Console y archivo privado `google-services.json` de preparación Android.
- **Notas:** es la aplicación Firebase, distinta del cliente OAuth Android Upload; no se añade Firebase iOS porque sus notificaciones usan APNs directamente.

### Configuración privada APNs por entorno
- **Tipo:** decisión naming / configuración runtime.
- **Definición:** `backend-mobile.env` prepara notificaciones APNs de producción; `backend-mobile-sandbox.env` prepara APNs de desarrollo con su clave específica. Ambos mantienen la misma configuración de identidad y cifrado del backend.
- **Alcance:** archivos privados fuera de Git en `mobile-credentials`; consumo `backend/src/mobile-config.js` y `docs/app/MARKETPLACES-CONFIGURACION.md`.
- **Notas:** se descarta usar una clave de entorno incorrecto o empaquetar secretos en la app; preparación local no activa el servidor.

### Actualización de recursos móviles 09/10/2026
- **Tipo:** estado de decisiones naming anteriores.
- **Definición:** los recursos Gestadia descritos como previstos ya están creados: tres OAuth, tres claves Apple, Services ID/dominio/retorno, cuenta FCM limitada, Firebase Android y perfil App Store. La configuración continúa pendiente de backend conectado y distribución.
- **Alcance:** consolas Google/Apple e inventario `docs/app/MARKETPLACES-CONFIGURACION.md`.
- **Notas:** reemplaza las notas históricas de registro/dominio pendientes; no acredita login, recepción push ni publicación.

### Stack Docker móvil Gestadia
- **Tipo:** decisión naming / despliegue.
- **Definición:** `portainer-mobile-stack.yml` agrupa la web `gestadia-app` y la API `gestadia-mobile-api` del subdominio existente `app.gestadia.com`. La API conserva las cuentas y base de datos del Portal; Plesk termina HTTPS.
- **Alcance:** `deploy/app/portainer-mobile-stack.yml`, `deploy/app/Dockerfile.backend`, configuración privada de servidor fuera de Git.
- **Notas:** se descarta una nueva base de usuarios aislada y empaquetar secretos en la imagen. Migraciones requieren backup y ejecución explícita antes de activar móvil.

### APP_PUBLIC_CONFIG_FILE
- **Tipo:** variable de despliegue.
- **Definición:** ruta de la configuración pública completa que el contenedor web publica al arrancar, incluyendo los clientes sociales y flags de notificaciones.
- **Alcance:** `deploy/app/40-app-config.sh`; montaje de sólo lectura en `/run/gestadia-public-config.json`.
- **Notas:** no contiene claves privadas. Si no se configura, conserva la preparación demo existente.

### APP_PROXY_TEMPLATE y gestadia_client_chain
- **Tipo**: decisión naming de despliegue / concepto runtime.
- **Definición**: `APP_PROXY_TEMPLATE` elige la plantilla Nginx al construir la imagen; `gestadia_client_chain` conserva la cadena de IP que proporciona Plesk para la API móvil interna.
- **Alcance**: `deploy/app/Dockerfile`, `deploy/app/mobile.conf.template`, stack móvil.
- **Notas**: Desde el 11/10/2026, `common.conf.template` es la predeterminada e incluye las rutas exactas de contacto; la plantilla antigua queda disponible mediante selección explícita. La entrada del stack solo admite el proxy local de Plesk; no se agrega otro salto al proxy de confianza de Express.

### Backend común Gestadia
- **Tipo:** concepto runtime / decisión de despliegue propuesta.
- **Definición:** un único backend en Docker atiende las cuentas, expedientes, documentos, avisos y contratos APP del Portal y de la aplicación móvil. Los dos frontends acceden mediante sus respectivos proxies HTTPS.
- **Alcance:** plan `docs/superpowers/plans/2026-10-10-app-portal-docker-tiendas.md`; servicio previsto `gestadia-backend` en `deploy/gestadia/portainer-stack.yml`.
- **Notas:** evita dos implementaciones activas de identidad y reglas comerciales sobre la misma base. La API móvil aislada preparada anteriormente conserva valor como prueba, pero no será la imagen definitiva del conjunto integrado.

### gestadia-portal-web y gestadia-backend
- **Tipo:** decisión naming de servicios Docker propuesta.
- **Definición:** `gestadia-portal-web` sirve el frontend de la web y Portal; `gestadia-backend` ejecuta la API común y sus procesos durables. `gestadia-app` conserva el nombre del frontend APP separado.
- **Alcance:** futuro `deploy/gestadia/portainer-stack.yml`, `deploy/portal/Dockerfile`, `deploy/portal/default.conf.template`; Plesk publica los dominios.
- **Notas:** MariaDB y los archivos vigentes se conservan inicialmente en su ubicación; no se propone trasladar datos de producción a un volumen vacío. La extensión de la web completa depende de la respuesta del usuario.
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

### Sesión móvil compartida con conversaciones APP
- **Tipo:** concepto runtime / adaptación de identidad.
- **Definición:** una AuthSession revocable emitida tras login móvil autentica también el contrato conversacional APP, conservando su prueba de cuenta y autorización server-side. Las sesiones AppDeviceSession anteriores siguen siendo compatibles.
- **Alcance:** backend/src/app/identity.js; frontend/app/src/AppContext.jsx; backend/src/services/auth-sessions.js.
- **Notas:** un JWT del Portal sin sesión móvil no habilita conversaciones. El alta social registra prueba fechada del correo que validó el proveedor; no transforma una coincidencia de correo de otra cuenta en autorización. La retirada de acceso bloquea ambas familias de sesiones.

### revokeAccountAccess
- **Tipo:** concepto runtime / función de ciclo de vida.
- **Definición:** retirada transaccional del acceso de una cuenta que invalida sesiones móviles y conversacionales, desactiva dispositivos push y conserva una revocación durable del canal APP.
- **Alcance:** backend/src/app/lifecycle.js y backend/src/services/account-deletion.js.
- **Notas:** se comparte la operación dentro de la transacción existente; se evita que cada superficie invalide solo su propia familia de sesiones. No purga expedientes ni modifica el canal WhatsApp.

### Stack común Gestadia
- **Tipo:** decisión de despliegue.
- **Definición:** conjunto Docker que sirve APP y web/Portal mediante frontends separados y una única API con sus procesos durables.
- **Alcance:** deploy/gestadia/portainer-stack.yml, deploy/portal, deploy/app.
- **Notas:** sustituye la propuesta de API móvil paralela; conserva MariaDB y el almacén documental vigente mediante bind, con ingreso TLS en Plesk.

### expedienteAutorizado (subida documental)
- **Tipo:** propiedad interna de petición.
- **Definición:** expediente cuya pertenencia a la cuenta autenticada se ha comprobado antes de aceptar el archivo de una subida.
- **Alcance:** backend/src/routes/portal.js.
- **Notas:** impide escribir archivos de solicitudes de usuarios ajenos; la validación se realiza antes de Multer y no depende de IDs de propietario enviados por el cliente.

### connectedLegalDocuments
- **Tipo:** contenido compartido / concepto de interfaz.
- **Definición:** textos públicos que explican privacidad, uso, soporte y solicitud de baja del servicio conectado de Gestadia.
- **Alcance:** shared/legal-content.js, frontend/app/src/LegalPage.jsx y frontend/src/pages/legal/Privacidad.jsx.
- **Notas:** se comparte la política entre web, Portal y APP; el contenido local de demostración permanece separado y no anuncia una eliminación remota ejecutada.

### Recursos APP desde la raíz
- **Tipo:** decisión de rutas de despliegue.
- **Definición:** los recursos de arranque de la APP se resuelven desde la raíz de su origen, con independencia de la ruta interna abierta o recargada.
- **Alcance:** frontend/vite.app.config.js y frontend/app/index.html.
- **Notas:** evita que /legal y otras entradas directas soliciten sus scripts desde carpetas inexistentes; Capacitor sirve el paquete desde la raíz de su origen local.

### GestadiaRouter
- **Tipo:** decisión de navegación / componente.
- **Definición:** el enrutador de la APP utiliza rutas web directas en navegador y rutas hash dentro del paquete nativo.
- **Alcance:** frontend/app/src/main.jsx.
- **Notas:** preserva el enrutamiento nativo de Capacitor y permite abrir las URLs públicas /legal desde las tiendas; el fallback Nginx sirve el documento raíz y los recursos usan rutas desde la raíz.

### Resultado y comunicación de AccountDeletionRequest
- **Tipo:** propiedades de entidad / concepto operativo.
- **Definición:** resultado trazable de la solicitud de baja, con categorías eliminadas o motivos pendientes, y destino temporal cifrado para comunicar su resolución.
- **Alcance:** backend/prisma/schema.prisma, backend/src/services/account-deletion.js y docs/legal/OPERACION-BAJA.md.
- **Notas:** completed y completedAt acreditan ejecución; no sustituyen la revisión de conservación ni recibos de terceros. El destino de respuesta se retira tras aceptación del envío; no se considera prueba de recepción en buzón.

### pendingActions de baja / comunicación con lease
- **Tipo:** propiedades de resultado / concepto runtime.
- **Definición:** motivos que impiden completar una baja y reserva temporal del envío de su resolución. service_retention_review identifica expedientes por revisar; remote_data_review identifica correlaciones externas por resolver; apple_revocation y app_access_revocation requieren sus actuaciones confirmadas.
- **Alcance:** backend/src/services/account-deletion.js y AccountDeletionRequest.notificationStatus, notificationClaimId, notificationLockedUntil, notificationAttempts, notificationNextAttempt.
- **Notas:** pending_review permanece mientras exista un motivo; accepted describe aceptación SMTP, no recepción en buzón. Un fallo de comunicación no rehabilita una cuenta eliminada ni anuncia un envío inexistente.

### AccountDeletionReview / revisión de baja
- **Tipo:** entidad / concepto operativo.
- **Definición:** decisión operativa registrada con responsable y referencia de autorización sobre categorías concretas de datos a conservar y actuaciones remotas acreditadas. Su huella liga la revisión al inventario examinado.
- **Alcance:** backend/prisma/schema.prisma, backend/src/services/account-deletion-review.js y backend/scripts/account-deletion.mjs.
- **Notas:** no procede del dispositivo ni de un endpoint público; una nueva dependencia deja la decisión anterior sin cobertura. No se infiere una obligación legal para todos los expedientes.

### Archivo restringido de baja
- **Tipo:** propiedad de entidad / concepto de conservación.
- **Definición:** campos de servicio expresamente seleccionados en una revisión de baja, cifrados y separados del perfil de cuenta eliminado, con categoría, fundamento y plazo o criterio registrados.
- **Alcance:** AccountDeletionRequest.retainedDataEncrypted y herramienta privada de operación de baja.
- **Notas:** las credenciales y asociaciones sociales nunca se incluyen; los documentos conservados permanecen en los expedientes. La lectura operativa queda registrada y no se expone a la APP ni al Portal.

### verified_intake de baja externa
- **Tipo:** acción operativa registrada.
- **Definición:** alta privada de una solicitud recibida por soporte, tras comprobar titularidad y registrar la referencia de esa comprobación y su responsable.
- **Alcance:** account-deletion.js, AccountDeletionReview.action y backend/scripts/account-deletion.mjs.
- **Notas:** un correo o un identificador enviados anónimamente no autorizan la ejecución; no existe endpoint público que acepte esta declaración.

### Ensayo de migración Portal
- **Tipo:** concepto operativo / decisión de validación.
- **Definición:** restauración de una copia privada en MariaDB efímera local y aplicación de todas las migraciones integradas, comprobando que cada valor original de las tablas de negocio permanece igual.
- **Alcance:** scripts/verify-portal-migration.mjs.
- **Notas:** no arranca el backend ni proveedores externos, no modifica producción y no considera una copia antigua como backup suficiente para el corte.

### gestadia-host-metadata
- **Tipo:** servicio temporal de operación.
- **Definición:** contenedor sin privilegios ni red que identifica los UID/GID del propietario de Gestadia a partir de los metadatos públicos de usuarios y grupos del host.
- **Alcance:** deploy/gestadia/host-metadata.yml.
- **Notas:** solo monta passwd y group como lectura; no monta documentos, claves, configuración, socket Docker ni almacenamiento de escritura. Se retira tras verificar los identificadores.

### gestadia-mobile-private
- **Tipo:** decisión naming / directorio de despliegue.
- **Definición:** Directorio del servidor reservado a configuración privada, claves de proveedores y copias previas al cambio de Gestadia APP y Portal.
- **Alcance:** `/var/www/vhosts/gestadia.com/gestadia-mobile-private`; `deploy/gestadia/portainer-stack.yml` mediante `GESTADIA_CONFIG_DIR`; guía `docs/app/DOCKER-PLESK.md`.
- **Notas:** se sitúa fuera de los document roots y se limita al propietario del Portal. Se descarta almacenar claves en imágenes, código o carpetas públicas.

### gestadia-common
- **Tipo:** decisión naming / stack de despliegue.
- **Definición:** Conjunto de Portainer que agrupa los servicios de Gestadia APP, web/Portal y backend común.
- **Alcance:** nombre del stack de producción previsto para `deploy/gestadia/portainer-stack.yml`.
- **Notas:** mantiene la configuración y los documentos existentes mediante montajes explícitos; se descarta el backend móvil paralelo como despliegue vigente.
# gestadia-deploy-check

- **Tipo:** concepto operativo.
- **Definición:** comprobación temporal del montaje privado, permisos, conexión de base y almacenamiento persistente antes del arranque del backend común.
- **Alcance:** preparación de Docker en Portainer; `artifacts/portainer-common-b42ce6a/deploy-check.yml` (evidencia local ignorada).
- **Notas:** ejecuta únicamente validación y un archivo ficticio propio; no inicia servidores, workers ni proveedores, ni aplica migraciones.


## Gestadia APP — identidad del producto

- **Tipo:** decisión de nomenclatura.
- **Definición:** aplicación móvil y frontend app.gestadia.com de Gestadia, con identidad, expedientes, notificaciones y conversación integrada.
- **Alcance:** aplicación del presente repositorio; documento maestro, despliegue y fichas Apple/Google.
- **Notas:** LidIA designa el servicio de chat integrado; no denominar el producto «app de LidIA». LIA es otro producto del usuario y sus stacks solo se consultan como referencia.

## gestadia-migration

- **Tipo:** concepto operativo.
- **Definición:** proceso temporal que aplica explícitamente las migraciones Prisma del backend común, tras detener el servicio anterior y verificar la copia final de base.
- **Alcance:** Portainer; `artifacts/portainer-common-b42ce6a/migration.yml` (preparación local ignorada).
- **Notas:** usa la misma imagen identificada y configuración de DB, sin iniciar servidores ni workers; se conserva el SQL anterior y no se restaura automáticamente tras nuevas escrituras.

## Retirada del modo demostración de Gestadia APP
- **Tipo:** decisión de producto y obsolescencia.
- **Definición:** Gestadia APP sólo mantiene sesiones reales o visitantes; se retiran cuentas, conversaciones, documentos y avisos ficticios.
- **Alcance:** `frontend/app/` y configuración Docker APP. Las entradas anteriores de demostración quedan obsoletas desde el 10/10/2026.
- **Notas:** No se borran cuentas, expedientes ni documentos del servidor; se conserva la copia de la fuente anterior.

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

## payload_json / payload_sha256 (contacto APP v2 r1)

- **Tipo:** propiedades del contrato de transporte propuesto por LidIA.
- **Definición:** payload_json conserva los bytes representados por una cadena JSON UTF-8 del evento de contacto; payload_sha256 identifica ese contenido exacto. Permiten reconocer el mismo evento durante persistencia y ACK sin reconstruirlo desde un objeto con otro orden o escape.
- **Alcance:** copia recibida `docs/integraciones/2026-10-10-app-v2-wire-lidia-r1.md`, revisión Portal y futuro consumidor v2.
- **Notas:** No son tokens ni autenticación. El esquema y los vectores de serialización siguen pendientes; no interpretar el hash de otra revisión como el resultado del envío original.

## portal_request_ref / persisted_at (ACK APP v2 r1)

- **Tipo:** propiedades de ACK propuestas por LidIA.
- **Definición:** portal_request_ref correlaciona opacamente la solicitud durable de Portal; persisted_at indica cuándo se conservó localmente. No acreditan por sí mismas conversión CRM, contacto efectuado o reserva de agenda.
- **Alcance:** copia wire v2 r1, revisión Portal y futura entidad AppContactRequest/consumidor S2S.
- **Notas:** El contrato cerrado debe definir recuperabilidad y unicidad antes de usar estos campos. No se reutiliza un ID de trato/cliente como autenticación.

## Pasarela APP–Portal–LidIA al agente 119

- **Tipo:** decisión de arquitectura y alcance de la integración.
- **Definición:** La APP envía los mensajes del usuario a Portal, que los transmite a la plataforma LidIA para recibir y mostrar las respuestas del agente 119. Las preguntas y decisiones de canje pertenecen al agente; la pasarela gestiona transporte, identidad y continuidad.
- **Alcance:** README, `docs/app/MANUAL-DESARROLLO.md`, `docs/app/NAVEGACION.md`, coordinación y plan Portal v2; consumidor conversacional y configuración servidor.
- **Notas:** Precisión humana del 10/10/2026, mensaje `01a127a2-2b60-7d30-a407-11f47d3af53a` en el chat LidIA. Se descarta crear un cuestionario/calificador/catálogo paralelo en Portal. Texto como base, HTML/dinámicos opcionales si no complican. No cambia por sí sola el agente efectivo, no acredita una ejecución real ni activa el flujo anónimo; las decisiones históricas sobre clones conservan su procedencia.

## Esquemas de respuesta APP v2 — propuesta Portal

- **Tipo:** artefactos de contrato para revisión conjunta.
- **Definición:** Describen las formas JSON cerradas de las respuestas de sesión, historial, operación, vínculo, contexto, revocación y recibos, contrastadas con las salidas actuales de LidIA. Los ejemplos son fixtures sintéticos y no respuestas de una conversación conectada.
- **Alcance:** `docs/integraciones/fixtures/app-v2-responses-proposal-r1.json`, `app-v2-response-fixtures-proposal-r1.json`, manifiesto de procedencia y contraste Portal r3.
- **Notas:** No son un contrato aprobado ni se montan en una API por generarlos. `sondeo` estructurado es null en la pasarela inicial; un recibo conserva su resultado histórico y no prueba autoridad actual. Se descarta un objeto de respuesta abierto o derivar elegibilidad del texto.

## signRequestV2 / canonicalQueryV2 / validateContractV2

- **Tipo:** funciones del consumidor S2S v2 en preparación.
- **Definición:** signRequestV2 firma el transporte de trece líneas con autoridad actual; canonicalQueryV2 produce y limita la query de cada lectura permitida. validateContractV2 comprueba una petición contra el esquema recibido y las invariantes expresas del contrato de transporte.
- **Alcance:** `backend/src/app/v2/s2s.js`, `contracts.js` y sus tests; copias exactas wire/schema/vectores r2 en docs/integraciones.
- **Notas:** No realizan autorización remota ni pruebas de pertenencia por sí solas; no alteran funciones v1. La respuesta exige validador específico, todavía no aportado en el esquema de requests r2.

## appV2ConversationConfig / APP_V2_ENABLED / APP_V2_GUEST_ENABLED

- **Tipo:** configuración backend propuesta para el consumidor v2.
- **Definición:** appV2ConversationConfig resuelve destino, audiencia y claves por capacidad del nuevo protocolo desde configuración privada. APP_V2_ENABLED habilita ese transporte y APP_V2_GUEST_ENABLED permite sus operaciones de datos visitante; ambas son falsas por defecto.
- **Alcance:** `backend/src/config.js` y consumidor/test S2S v2.
- **Notas:** Ninguna bandera pública móvil concede autoridad. Las claves usan el prefijo APP_V2_LIDIA y no caen a las claves v1. Revocación de control se valida aparte para permitir retirar acceso; las banderas no activan rutas por esta entrega.

### Estado posterior del consumidor v2 (10/10/2026)

`AppS2SClientV2`, `signRequestV2`, `canonicalQueryV2`, `validateContractV2` y `appV2ConversationConfig` ya tienen implementación aislada en los archivos indicados; las menciones anteriores a futuro/propuesta documentan su preparación inicial. No están montados en una API. Wire r3 sustituye el alcance r2: contacto reservado, respuestas pendientes de aceptación y flags off. [Contraste vigente](docs/integraciones/2026-10-10-contraste-portal-wire-v2-r3.md).

### Separación de integraciones APP 119/122 (propuesta)

- **Tipo:** decisión de asociación servidor propuesta.
- **Definición:** Conservación de la integración y los chats existentes del agente 122, junto a una integración adicional para las nuevas consultas al 119 original. Ambas pertenecen a la misma cuenta Portal; la APP no selecciona agentes o integraciones.
- **Alcance:** `docs/integraciones/2026-10-10-coordinacion-portal-contrato-v2.md`; futura resolución en `backend/src/app/conversations.js`, configuración y operaciones/lifecycle; `AppIntegration` administrado por LidIA. No está implementada ni activada.
- **Notas:** Pendiente de conformidad conjunta y configuración efectiva. Se descarta cambiar proyecto/agente en la integración histórica porque su huella y sus sesiones los validan; se conservan claves, permisos, reintentos e historial existentes.

### `AppConversationRegistry` / `appConversationIntegrations`

- **Tipo:** servicio de asociación backend y resolución de configuración.
- **Definición:** AppConversationRegistry conserva la integración guardada de cada chat/operación y elige la ruta de nuevas consultas desde configuración servidor. appConversationIntegrations obtiene los ámbitos configurados para el servicio y el worker.
- **Alcance:** `backend/src/app/registry.js`, `backend/src/config.js`, `backend/src/app/routes.js`, `backend/src/server.js` y pruebas conversacionales.
- **Notas:** Mantiene AppConversationService como consumidor de un solo ámbito. No acepta un selector de agente/integración móvil ni reasocia historial; atención conserva el ámbito previo.

### `nativeSondeo` / `APP_LIDIA_SONDEO_*`

- **Tipo:** configuración privada de asociación servidor.
- **Definición:** nativeSondeo describe la integración adicional del sondeo nativo. APP_LIDIA_SONDEO_ENABLED habilita su elección para consultas nuevas; INTEGRATION_ID y AUDIENCE del mismo prefijo identifican el ámbito, y las capacidades firmadas usan IDs propios de clave; el secreto puede conservarse por la misma capacidad del consumidor existente.
- **Alcance:** `backend/src/config.js` y `backend/src/app/registry.js`; configuración privada backend. Valores públicos/por defecto apagados; no existen selectores nuevos en el dispositivo.
- **Notas:** La integración configurada conserva lectura/retirada aunque se apague la selección para nuevos chats. Su autoridad de producto queda limitada a sondeo/history; no hereda soporte, comercial ni expediente. Una selección activada e incompleta falla sin derivar al122.

### `gestadia-app-pro-agent119-validation`

- **Tipo:** identificador de integración y audiencia S2S acordado.
- **Definición:** Ámbito adicional de la misma cuenta Portal para consultas nuevas dirigidas al119/Project102 en LidIA PRO. Se mantiene distinto de gestadia-app-pro-local-validation y su historial122.
- **Alcance:** configuración privada APP v1 y registro de coordinación del 11/10/2026; administrado en LidIA, seleccionado únicamente por backend.
- **Notas:** Conformidad recibida del equipo LidIA; no acredita provisionado, despliegue ni prueba conectada. GuestV2Enabled=false y permisos sondeo/history; claves e identidad existente se conservan sin aumentar autoridad.

### Revisión de asociación y autoridad por integración (11/10/2026)

`AppConversationRegistry.start` fija el candidato implícito antes de refrescarlo y vuelve a resolver la integración para una consulta nueva si el servidor remoto confirmó su cierre. Replays y aperturas explícitas conservan su asociación. `currentAccess` deriva conjuntamente permisos y referencias tras aplicar el límite; `setConversationAccess` recibe la configuración servidor completa (por defecto, la del proceso) y prepara contextos con la del ámbito correspondiente. Si un ámbito no está configurado, conserva el grant durable y su worker preparará el contexto al recuperar esa configuración; no se prepara con una configuración vacía. Alcance: `backend/src/app/registry.js`, `store.js`, `lifecycle.js` y pruebas. No introduce permisos ni modifica los grants existentes por el recorte.

### `gestadia_app_local119` / fixture local119 durable

- **Tipo:** base de prueba local y decisión de persistencia.
- **Definición:** Base MySQL propia con una cuenta ficticia nueva y autorización sondeo/history de24h para comprobar el recorrido APP hacia119. Su volumen durable y manifest privado permiten identificarla y conservarla tras reiniciar el Mac.
- **Alcance:** preparación privada en `/Users/gonchumon/.codex/private/gestadia-app/fixture-local119/`; procedimiento en `docs/app/2026-10-11-reanudacion-app-119.md`. No es una base de producción ni la base de la suite canónica.
- **Notas:** Autorización humana verificada en el turno LidIA `01a12843-53c2-79b3-a1eb-96602b78e26f`. Otro principal, sin historia heredada, expediente ni asignaciones; CRM/pagos/SMTP/WhatsApp/v2 apagados. Se descarta tmpfs para el circuito conectado que debe sobrevivir al reinicio.

### `MOTION_MS` / `MOTION_EASING` / `useReducedMotion` / `PageMotion` / `useSheetMotion` / `useMessageMotion`

- **Tipo:** tokens y componentes/hooks de presentación APP.
- **Definición:** MOTION_MS fija 280 ms y MOTION_EASING la desaceleración para transiciones; useReducedMotion observa la preferencia de accesibilidad del sistema. PageMotion anima sólo el contenido de una ruta y expresa avance/regreso. useSheetMotion conserva la superficie durante su salida; useMessageMotion distingue mensajes nuevos del historial inicial o recuperado.
- **Alcance:** `frontend/app/src/motion.jsx`, `app.css`, marco `App.jsx`, hojas y conversaciones; guía `docs/app/ANIMACIONES.md`.
- **Notas:** Movimiento solicitado por el usuario, con desplazamientos cortos/opacidad, cabecera estable y movimiento reducido. No se conserva una segunda pantalla interactiva, no se anima el historial ni se crean efectos de negocio o llamadas externas.

- **Ampliación de alcance del 11/10/2026:** la maqueta `docs/app/prototipos/lidia-anonima/pantallas.jsx` reutiliza la envoltura CSS `.page-motion` como contenedor estático. No consume hooks de movimiento ni modifica su carácter de propuesta aislada.

### GESTADIA_IOS_PROFILE_SPECIFIER

- **Tipo:** decisión naming / configuración de compilación.
- **Definición:** nombre o UUID del perfil de distribución iOS autorizado para Gestadia APP. Se aplica únicamente al target App en Release.
- **Alcance:** frontend/ios/App/App.xcodeproj/project.pbxproj; compilación iOS de publicación.
- **Notas:** no se fija el perfil mediante PROVISIONING_PROFILE_SPECIFIER global, porque las dependencias Swift Package no admiten perfiles de la app. El valor se aporta desde la custodia privada.

### Correo transaccional Gestadia

- **Tipo:** concepto de presentación y comunicación.
- **Definición:** Mensaje de recuperación, acceso tras contratación o aviso de expediente con identidad visual común, alternativa de texto y pie de privacidad.
- **Alcance:** backend, `src/services/email-templates.js`, `src/services/notify.js`, rutas auth/checkout y logo incrustado en `src/assets/`.
- **Notas:** Contacto y Reply-To `info@gestadia.com`; se conserva el remitente SMTP autenticado. Logo CID para evitar depender de imágenes externas; no introduce comunicaciones comerciales.


### Emulador Gestadia QA

- **Tipo:** concepto runtime.
- **Definición:** dispositivo virtual Android dedicado a comprobar la APP Gestadia sin modificar los dispositivos virtuales de LIA.
- **Alcance:** QA móvil; AVD local `Gestadia_QA_API_36`, evidencias en `artifacts/android-qa-20261011/`.
- **Notas:** Android API 36, Pixel 8; se ejecuta solo un emulador a la vez. Se descarta reutilizar el almacenamiento de LIA para mantener sus pruebas intactas.

Actualización del Emulador Gestadia QA: el usuario fija un mínimo de **4096 MB de RAM y cuatro núcleos** el 11/10/2026. Se conserva el AVD y la instalación; iOS permanece apagado durante esta prueba.

<!-- Arranque nativo revisado el 11/10/2026. -->

## Arranque APP (`startApp`)

- **Tipo:** concepto runtime y función de inicialización.
- **Definición:** secuencia que prepara configuración, sesión segura, teclado y retornos sociales antes de mostrar Gestadia. La evaluación del módulo de entrada termina antes de esperar plugins que pueden volver a importarlo.
- **Alcance:** APP web y nativa; `frontend/app/src/main.jsx` y `main.boot.test.jsx`.
- **Notas:** se retira la espera de nivel superior porque crea un ciclo con el chunk nativo de SecureStorage; un fallo de preparación presenta la recuperación existente y retira el splash.

### provider-button
- **Tipo:** concepto de presentación.
- **Definición:** botón de acceso Apple o Google que conserva la identidad visual oficial del proveedor y un área táctil de 48 píxeles CSS. La misma presentación sirve al acceso y a la vinculación; el propósito de la acción se explica fuera del botón.
- **Alcance:** APP iOS/Android; `frontend/app/src/SocialAccess.jsx`, `frontend/app/src/App.css` y `frontend/app/public/brand/social/`.
- **Notas:** reemplaza los botones secundarios genéricos. Apple usa la imagen española generada por su CDN; Google conserva el símbolo degradado del paquete oficial y Google Sans Medium, con márgenes propios de iOS y Android. No cambia el protocolo OAuth.


**Actualización de gestadia_updates (11/10/2026):** la APP crea este canal Android, visible como «Actualizaciones de Gestadia», antes del registro FCM inicial y de su reanudación. Importancia predeterminada 3 y visibilidad privada 0; iOS no llama a la API de canales Android. Alcance adicional: `frontend/app/src/push.test.js`.

### SKU de Gestadia en App Store Connect
- **Tipo:** decisión de naming / identificador de distribución.
- **Definición:** referencia interna de la ficha Apple de Gestadia; se fija como `com.gestadia.app`, igual que el identificador del paquete, para evitar confundirla con otras apps del equipo.
- **Alcance:** App Store Connect, registro Apple ID `6821484915`; documentación `docs/app/MARKETPLACES-CONFIGURACION.md`.
- **Notas:** ficha iOS creada en español (España), nombre Gestadia y acceso limitado; no representa una publicación ni una build procesada en TestFlight.


### Ficha Gestadia en Google Play
- **Tipo:** identificador de distribución.
- **Definición:** ficha Android de Gestadia con paquete `com.gestadia.app`, idioma inicial es-ES y descarga gratuita. Su referencia interna Play es `4974812323816991329`.
- **Alcance:** Google Play Console, cuenta de Defensa Legal Consumidores; `docs/app/MARKETPLACES-CONFIGURACION.md`.
- **Notas:** creación autorizada por el usuario tras confirmar las declaraciones de políticas y exportación; separada de LIA. Canal de prueba interna `4699474819749065461`. Crear una ficha no acredita publicación.


### Gestadia QA (grupo TestFlight)
- **Tipo:** concepto de distribución de pruebas.
- **Definición:** grupo interno de TestFlight exclusivo para comprobar candidatos de Gestadia con las personas indicadas por el usuario.
- **Alcance:** App Store Connect, Gestadia `6821484915`; `docs/app/MARKETPLACES-CONFIGURACION.md`.
- **Notas:** distribución manual para asignar candidatos comprobados; no se incluyen testers de otras apps por defecto. El destinatario solicitado puede requerir pruebas externas si no es usuario interno de App Store Connect.

### Gestadia APP Android Play
- **Tipo:** decisión de naming / cliente OAuth de distribución.
- **Definición:** cliente Android de Google restringido al paquete `com.gestadia.app` y al certificado con el que Google Play firma las descargas de Gestadia.
- **Alcance:** Google Auth Platform, proyecto `gestadia-vozia`; `docs/app/MARKETPLACES-CONFIGURACION.md`.
- **Notas:** complementa al cliente Android Upload para conservar las pruebas APK locales. La firma Play difiere de la de subida; el formulario preparado no acredita creación ni login.

**Actualización de Gestadia QA (11/10/2026):** Google Play utiliza una lista exclusiva con ese mismo nombre y el destinatario indicado por el usuario, sin reutilizar TESTERS.

### Movimiento APP de 280 ms
- **Tipo:** concepto de presentación.
- **Definición:** entradas y salidas breves de pantallas, menús, paneles y mensajes nuevos, con cabecera estable.
- **Alcance:** frontend/app/src/motion.jsx, app.css y docs/app/ANIMACIONES.md; integración del commit d3ca03c conservando la retirada de demos.
- **Notas:** 280 ms; pulsación 120 ms. Historial no se reproduce; movimiento reducido evita transiciones.

### Indicador de escritura LidIA
- **Tipo:** concepto de interfaz aprobado.
- **Definición:** aviso transitorio «LidIA está escribiendo…», en cursiva y con puntos animados, durante un envío o turno confirmado en curso.
- **Alcance:** frontend/app/src/AppConversation.jsx y app.css.
- **Notas:** desaparece al responder, fallar o perder confirmación; no se muestra para atención humana y respeta reducción de movimiento.

### GestadiaKeyboardFrame / GestadiaViewController
- **Tipo:** evento nativo y controlador iOS.
- **Definición:** comunican a la interfaz el espacio disponible y la duración/curva de la transición del teclado de iOS antes del movimiento.
- **Alcance:** frontend/ios/App/App/SceneDelegate.swift, frontend/app/src/native.js y app.css.
- **Notas:** evitan el segundo ajuste tardío del plugin Keyboard en modo native; en iOS se usa resize none y una única transición del contenedor. Android conserva su ajuste nativo.

**Actualización de Gestadia APP Android Play (11/10/2026):** cliente creado con la huella Play confirmada; el ID público se registra en MARKETPLACES-CONFIGURACION.md. El consentimiento visible usa Gestadia; el slug técnico del proyecto permanece gestadia-vozia. Creación no acredita login real.

## lidia-typing-label

- **Tipo:** concepto de presentación CSS.
- **Definición:** texto en cursiva del indicador de espera de LidIA, con pulso suave de opacidad mientras la respuesta está pendiente.
- **Alcance:** Gestadia APP; AppConversation.jsx y app.css.
- **Notas:** completa la secuencia de tres puntos; movimiento reducido mantiene texto y puntos estáticos y legibles. No expresa envío confirmado ni sustituye un recibo remoto.

### LidiaTypingIndicator
- **Tipo:** componente de presentación APP.
- **Definición:** indicador de espera de LidIA en negrita, con entrada y salida suaves y tres puntos que suben de forma secuencial en una ola.
- **Alcance:** frontend/app/src/LidiaTypingIndicator.jsx, AppConversation.jsx y app.css.
- **Notas:** revisión solicitada el 11/10/2026, sustituye la cursiva del indicador anterior. Conserva el elemento durante la salida de 280 ms; sin movimiento reducido no se elimina de golpe. No cambia recibos, permisos ni atención humana.
## ConversationList / PushSettings promptOnly / notificationDestination

- **Tipo:** componentes y función de presentación APP.
- **Definición:** ConversationList presenta el historial del propósito correspondiente a su pestaña. PushSettings promptOnly ofrece una única activación inicial; notificationDestination obtiene un destino interno de un aviso autorizado por el servidor.
- **Alcance:** `frontend/app/src/ConnectedMessages.jsx`, `PushSettings.jsx`, `notificationDestination.js`, notificaciones del portal.
- **Notas:** Se descarta mezclar chats IA y humanos o interpretar una URL externa de un aviso como navegación confiable. No conceden permisos ni identidad.

## Notificacion.conversationId / notificationView / acceso social por correo verificado

- **Tipo:** propiedad de aviso y decisiones de identidad/presentación.
- **Definición:** conversationId asocia un aviso a un chat Portal; notificationView sólo entrega su destino y propósito cuando la cuenta destinataria posee ese chat. El acceso social identifica una cuenta Gestadia existente con el email verificado de Apple/Google, conserva su autoridad y vincula el sujeto del proveedor.
- **Alcance:** `backend/prisma/schema.prisma`, migración `20261011100000_notification_conversations`, `backend/src/routes/portal.js`, `backend/src/services/social-auth.js` y APP.
- **Notas:** No se crea una cuenta por OAuth, no se modifica asignación CRM ni se aceptan IDs de otro usuario. Se conserva la vinculación explícita autenticada desde Perfil.

## AppCallbackRequest / createAppContactService / createZohoCallbackAdapter / APP_MANAGER_ROUTES_JSON

- **Tipo:** entidad durable, servicios y configuración privada del servidor.
- **Definición:** AppCallbackRequest conserva una solicitud de llamada y sus confirmaciones CRM; createAppContactService distingue llamada y chat a partir del contexto autorizado. createZohoCallbackAdapter localiza un lead por teléfono y crea su tarea; APP_MANAGER_ROUTES_JSON vincula referencias opacas autorizadas con propietarios CRM comprobados.
- **Alcance:** `backend/prisma/schema.prisma`, migración `20261011103000_app_callbacks`, `backend/src/app/contact.js`, `backend/src/routes/app-contact.js`, `backend/src/services/zoho-callbacks.js`, configuración backend.
- **Notas:** El dispositivo sólo envía nombre/teléfono y una intención idempotente. No escoge gestor, proyecto, CRM ni permisos; una respuesta remota perdida se conserva para revisión, sin repetir una creación a ciegas. No se usan conversaciones sondeo como atención.

- **AppCallbackRequest.contactId** — propiedad. Referencia CRM de un contacto existente verificado por el servidor para asociar su tarea de llamada. Alcance: backend/prisma/schema.prisma, backend/src/app/contact.js y services/zoho-callbacks.js. No se acepta desde la APP ni crea un lead adicional para una cuenta ya vinculada.
- **gestadia.push-revoke-pending** — concepto runtime. Preferencia segura que conserva una retirada del dispositivo pendiente de confirmación remota. Alcance: frontend/app/src/push.js. Se reintenta al recuperar conexión, sin anunciar que el servidor ha retirado el dispositivo antes de confirmarlo.

- **AppGuestInstallation** — entidad Prisma. Instalación anónima comprobada con una credencial aleatoria conservada por el dispositivo y sólo su hash en servidor. Alcance: backend/src/app/v2/guest.js y prisma/schema.prisma. El ID de instalación no es autenticación ni selector de agente.
- **AppGuestConversation** — entidad Prisma. Sondeo v2 ligado a instalación, sujeto estable y, después de vínculo confirmado, cuenta verificada; preserva el ID de la sesión LidIA. Alcance: backend/src/app/v2/guest.js y prisma/schema.prisma. Caducidad original de invitado de 24 horas, sin renovarla al recuperar una sesión.
- **AppGuestOperation** — entidad Prisma. Registro de petición y respuesta de una operación v2 que conserva cuerpo y clave para recuperar resultados inciertos. Alcance: backend/src/app/v2/guest.js y prisma/schema.prisma. No se reconstruyen atestaciones o turnos al reintentar.
- **AppGuestBinding** — entidad Prisma. Preparación y confirmación durable del vínculo de un sondeo invitado a una cuenta verificada bajo control de ambos participantes. Alcance: backend/src/app/v2/guest.js y prisma/schema.prisma. No concede acceso por email, nombre o teléfono declarados.
- **guestConversationApi** — concepto runtime. Adaptador APP de sondeo v2 y almacenamiento seguro de instalación, separado del transporte autenticado v1. Alcance: frontend/app/src/guestConversations.js. No permite seleccionar agente, entorno, gestor o CRM desde el dispositivo.

- **conversationProtocol** — propiedad derivada de aviso. Identifica la versión de un chat cuyo propietario fue comprobado por el servidor para abrirlo con su adaptador. Alcance: backend/src/routes/portal.js y frontend/app/src/notificationDestination.js. El usuario no selecciona integración ni agente mediante esta propiedad.

- **AppGuestOperation.claimId / leaseUntil** — propiedades. Marca de exclusión y vencimiento de una entrega que permiten recuperar el mismo envío tras detenerse un proceso sin degradar una confirmación concurrente. Alcance: backend/src/app/v2/guest.js y prisma/schema.prisma. Reintentar siempre conserva DTO y clave remota.
- **app-recorridos-preview** — herramienta de desarrollo. Servidor local con datos ficticios para revisar las pantallas construidas de la APP sin conexiones a LidIA o Zoho. Alcance: scripts/app-recorridos-preview.mjs. No es un backend desplegable ni evidencia de aceptación conectada.

### validateMessageSnapshotSemantics
- **Tipo:** concepto runtime / función de validación.
- **Definición:** Comprueba pertenencia, cobertura exacta de mensajes, roles y revisiones de recibos después de validar su esquema de transporte. Conserva el actor histórico guest o account.
- **Alcance:** backend/src/app/messageReceipts.js y backend/src/app/v2/guest.js.
- **Notas:** Compartida entre v1 y v2; cada protocolo conserva su propio esquema, sin convertir recibos guest en account.
### `assistantMessageParts`

- **Tipo:** función de presentación.
- **Definición:** segmentos visibles de un mensaje de LidIA cuyo texto histórico contiene el separador `[SPLIT]`. Conservan la identidad del mensaje original.
- **Alcance:** `frontend/app/src/AppConversation.jsx` y sus pruebas; burbujas de conversaciones APP.
- **Notas:** no modifica el histórico ni interpreta acciones o reservas. Los mensajes de cliente y operador conservan su texto literal.

### `useComposerAutoScroll`

- **Tipo:** hook de presentación.
- **Definición:** desplazamiento al último mensaje al enfocar o tocar el campo de conversación, manteniendo el final visible durante los cambios de altura del teclado.
- **Alcance:** `frontend/app/src/useComposerAutoScroll.js`, `AppConversation.jsx` y eventos de textarea en `ChatComposer.jsx`; chats LidIA y gestor, cuenta o visitante habilitado.
- **Notas:** usa el contenedor real aunque el compositor esté en un portal; respeta movimiento reducido y cancela al desenfocar/salir. Se descarta un retraso fijo tras abrir el teclado para evitar saltos tardíos. No envía mensajes ni modifica permisos.

### `--app-visible-height`, `--app-keyboard-duration`, `--app-keyboard-easing`
- **Tipo:** propiedades CSS de runtime.
- **Definición:** espacio visible y tiempo de adaptación que iOS comunica antes de animar el teclado. Pantalla y diálogos comparten estos valores para mantener visibles los formularios.
- **Alcance:** `frontend/app/src/native.js`, `Sheet.jsx`, `app.css`.
- **Notas:** se descarta un segundo ajuste al finalizar la apertura, que provocaba saltos; Android mantiene su redimensionado nativo.

### `ChatLoading`
- **Tipo:** componente de presentación.
- **Definición:** estado de espera centrado con animación GIF propia y texto contextual para historial y conversación. Mantiene el historial visible al actualizar y usa imagen fija con movimiento reducido.
- **Alcance:** `frontend/app/src/ChatLoading.jsx`, `ConnectedMessages.jsx`, `AppConversation.jsx`, `Contact.jsx`, `frontend/app/public/loading/`.
- **Notas:** no representa escritura de LidIA ni oculta errores o concede permisos. Diseño aprobado por el usuario el 11/10/2026.

### `permissions`: historial sin envío

- **Tipo:** concepto runtime existente.
- **Definición:** Un timeline que sólo concede `history` permite consultar la conversación; no acredita envío, gestor asignado ni transferencia.
- **Alcance:** `frontend/app/src/AppConversation.jsx`; compositor y acciones desactivados si no hay capacidad de sondeo o handoff.
- **Notas:** No ampliar grants para resolver una denegación de una conversación antigua; conservar historial y contacto por llamada.

## Perfil y agenda APP — extensión en revisión (11/10/2026)

### profile / display_name / callback_phone
- **Tipo:** concepto de contrato firmado propuesto y propiedades.
- **Definición:** Perfil opcional procedente de una cuenta Portal comprobada; aporta nombre de presentación y teléfono de devolución de llamada declarado. No acredita identidad civil, control del teléfono ni propiedad CRM.
- **Alcance:** `docs/integraciones/2026-10-11-contraste-portal-perfil-agenda.md` y adenda recibida; futura extensión de context v1/v2. Todavía no hay propiedades de estos nombres en el DTO ejecutable Portal.
- **Notas:** No aceptar perfil operativo de guest ni reconstruirlo desde campos libres del móvil.

### time_zone / time_zone_confirmed / callback_consent
- **Tipo:** propiedades de contrato propuestas.
- **Definición:** Zona cliente IANA y confirmaciones específicas de zona y propósito de llamada para los datos operativos vigentes. La zona del dispositivo y la aceptación de privacidad no equivalen a estas confirmaciones.
- **Alcance:** contraste Portal y adenda de perfil/agenda del 11/10; sin persistencia en User ni transmisión Portal actuales.
- **Notas:** Datos ausentes se recogen en el agente; precedencia, retirada y JSON null pendientes de precisión compartida.

### crm_prepare / callback_schedule
- **Tipo:** permisos de contrato propuestos.
- **Definición:** Capacidades optativas para preparar vínculo CRM y solicitar una llamada bajo identidad, propiedad y configuración de integración acreditadas. No se conceden por propósito de conversación o perfil declarado.
- **Alcance:** contraste Portal y adenda recibida; futuros enums v1/v2 y configuración servidor de ambas partes.
- **Notas:** No integrados ni activados en Portal. El match actual por teléfono de findOrCreateLead no satisface la propiedad exigida por esta extensión.

### profile_revision
- **Tipo:** propiedad de contrato acordada documentalmente, pendiente de esquema ejecutable.
- **Definición:** Revisión decimal monotónica del perfil de una cuenta dentro del contexto de una conversación, independiente de context_revision. Permite actualizar permisos sin volver a imponer un perfil ya aplicado sobre datos confirmados por el agente.
- **Alcance:** `docs/integraciones/2026-10-11-contraste-portal-perfil-agenda.md`; futura persistencia/builder y contratos v1/v2 Portal y LidIA.
- **Notas:** Requerida cuando se incluye profile; misma revisión exige mismo perfil canónico y no reaplica. La revisión se conserva en servidor y no procede del móvil; todavía no está implementada en Portal.

- **profile_revision — precisión de parche:** cada revisión nueva transporta sólo cambios acreditados, no un snapshot completo; igualdad se compara con el parche canónico persistido, no con el perfil acumulado. Alcance: contraste perfil/agenda, futura persistencia Portal/LidIA. Permite conservar cambios obtenidos por el agente al actualizar otro campo.
- **stale_profile / profile_conflict** — códigos de contrato propuestos. Rechazos HTTP409 para revisión de perfil inferior y revisión igual con parche distinto, respectivamente. Alcance: adenda perfil/agenda v1/v2, pendiente de esquema ejecutable Portal; no se usan aún en runtime Portal.
- **current_profile_revision** — propiedad de ACK propuesta. Revisión vigente del perfil al responder o recuperar una operación, independiente de la revisión original de esa petición. Alcance: futura extensión de ACK v1/v2; se omite si no hay perfil, sin reponer datos históricos en replay.

### profileBaseline / profilePatch / profileRevision
- **Tipo:** propiedades Prisma propuestas para AppConversation.
- **Definición:** Base del perfil atestado por Portal y último parche/revisión durables de esa conversación. La base permite emitir sólo cambios del perfil Portal sin reimponer datos obtenidos por el agente; no almacena el estado efectivo del agente.
- **Alcance:** backend/prisma/schema.prisma, futura migración aditiva y backend/src/app/profile.js/store.js.
- **Notas:** Propiedades privadas de servidor, no campos elegidos por el móvil; preservan operaciones previas en AppOperation.

### APP_LIDIA_PROFILE_CONTEXT_ENABLED
- **Tipo:** configuración privada propuesta.
- **Definición:** Habilitación explícita de la proyección del perfil de cuenta en contexto firmado. Apagada por defecto, no concede capacidades CRM/agenda.
- **Alcance:** backend/src/config.js y builder de contexto v1 Portal.
- **Notas:** No se activa en producción con esta implementación. El protocolo v2 se contrasta en esquema; su consumidor de contexto account requiere trabajo separado.

- **APP_LIDIA_SONDEO_PROFILE_CONTEXT_ENABLED** — configuración privada. Habilitación optativa del perfil para la integración de sondeo, independiente del flag de la integración general. Alcance: backend/src/config.js; apagada por defecto y sin nuevos permisos.
- **profileContext** — función de backend. Calcula un parche acreditado de perfil Portal frente a la base durable de una conversación y conserva la revisión/último parche para cambios sólo de permisos. Alcance: backend/src/app/profile.js y store.js; no infiere país ni confirma teléfono, zona o consentimiento.

- **sameProfilePatch** — función de backend. Comprueba igualdad de revisión y parche canónico para acreditar entrega sin reimponer campos del perfil. Alcance: backend/src/app/profile.js, store.js y lifecycle.js. Un ACK admitido o una retirada que transporta exactamente ese parche conserva su efecto sin perder la prioridad de autoridad.
- **Precisión de implementación de perfil:** profileBaseline/profilePatch/profileRevision y los dos flags privados están implementados en esta rama; profile_revision/stale_profile/profile_conflict/current_profile_revision constan en esquemas v1/v2 recibidos. Contexto v1 Portal preparado y apagado; consumidor account v2 y agenda operativa siguen pendientes.

- **Precisión de alcance de createZohoCallbackAdapter / AppCallbackRequest:** por instrucción del usuario, las operaciones CRM/agenda conversacionales APP corresponden a la plataforma LidIA y su agente. El adaptador directo existente en Portal no es el reparto objetivo y queda pendiente de delegación S2S idempotente; AppCallbackRequest puede conservar recepción/recibo sin ejecutar un CRM paralelo. Alcance: backend/src/app/contact.js, services/zoho-callbacks.js y contrato de integración.

### callbackAccess / callbackConversationId
- **Tipo:** concepto de autorización runtime y propiedad Prisma propuesta.
- **Definición:** Opt-in privado que limita los permisos CRM/agenda de una cuenta a una conversación v1, integración y caducidad exactas; el grant conserva también el ID de conversación autorizado. Configurar el opt-in no concede por sí mismo los permisos.
- **Alcance:** backend/src/app/callback-access.js, config.js, store.js, lifecycle.js y prisma/schema.prisma.
- **Notas:** Se descarta un grant exclusivo por userId/scopeKey porque afectaría a todos los sondeos de la cuenta. El binding persistido evita que cambiar la configuración transfiera un grant a otro chat. Guest y contexto account v2 quedan fuera.

### APP_LIDIA_CALLBACK_ENABLED / APP_LIDIA_CALLBACK_SCOPE_JSON
- **Tipo:** configuración privada propuesta.
- **Definición:** Interruptor apagado por defecto y objeto cerrado con portal_user_id, conversation_id local Portal, integration_id y expires_at UTC. Seleccionan un único ámbito elegible para recibir un grant explícito, sin incluir referencias Zoho o datos de contacto.
- **Alcance:** backend/src/config.js, backend/.env.example y documentación de agenda real.
- **Notas:** Cuenta/chat pertenecen al servidor. No son parámetros del móvil ni permisos generales; la caducidad permite retirar autoridad sin borrar registros.

### callbackScopeAllows
- **Tipo:** función de backend propuesta.
- **Definición:** Comprueba que la cuenta y la conversación activa coinciden con el opt-in de la integración vigente y que aún no ha caducado. No resuelve CRM ni acredita consentimiento de llamada.
- **Alcance:** backend/src/app/callback-access.js, store.js y lifecycle.js.
- **Notas:** Zoho, propiedad y agenda se comprueban en LidIA; Portal valida exclusivamente su ámbito de autoridad.

- **callbackAccessConfig** — función de backend. Valida el objeto cerrado de configuración de agenda y conserva el interruptor explícito; una configuración incompleta activa no es elegible. Alcance: backend/src/app/callback-access.js y config.js. No crea grants ni efectos CRM.

### callbackGrant
- **Tipo:** propiedad Prisma propuesta de AppConversation.
- **Definición:** Autorización privada de permisos CRM/agenda conservada en el chat concreto con fuente, validación y caducidad. Complementa los permisos básicos vigentes y no modifica el grant compartido de sondeo de la cuenta.
- **Alcance:** backend/prisma/schema.prisma, store.js y lifecycle.js.
- **Notas:** Sustituye la propuesta callbackConversationId en AppConversationAccess: aquella impediría transferir un grant pero su caducidad afectaría también a las demás conversaciones del mismo scope. La fila del chat conserva por sí misma el binding y permite retirarlo sin alterar autoridad ajena.

- **Precisión de preparación de agenda:** callbackAccess/callbackAccessConfig/callbackScopeAllows, ambos flags y AppConversation.callbackGrant implementados y comprobados en fixture aislada; callbackConversationId descartado antes de despliegue. Sin activación ni reserva productiva. Alcance: evidencia 2026-10-11-agenda-opt-in; consumidor v1 únicamente.

### useFocusedFormScroll
- **Tipo:** hook de interfaz.
- **Definición:** Mantiene el formulario del campo enfocado dentro del área visible de su contenedor cuando el teclado modifica su altura. Deja de seguirlo al perder foco o cerrar la edición.
- **Alcance:** frontend/app/src/useFocusedFormScroll.js y ConnectedMessages.jsx; editor del nombre de conversaciones.
- **Notas:** Desplaza sólo lo necesario para ver campo y acciones, con movimiento reducido inmediato. Se descarta activar el desplazamiento nativo global porque alteraría la sincronización del teclado en los chats; tampoco fuerza el final de la lista, que puede pertenecer a otro chat.

### gestadia_qa_network_security
- **Tipo:** configuración Android Debug.
- **Definición:** Permite acceder al backend de prueba por HTTP exclusivamente en loopback, manteniendo HTTPS obligatorio para los demás destinos.
- **Alcance:** frontend/android/app/src/debug/AndroidManifest.xml y res/xml/gestadia_qa_network_security.xml.
- **Notas:** Se usa con adb reverse y API privada local; no se incluye en Release ni habilita tráfico HTTP general, certificados no confiables o exposición del backend a la red.

### validAppointmentReceipts
- **Tipo:** concepto runtime / función de validación.
- **Definición:** Comprobación semántica del recibo histórico de reserva emitido por LidIA; requiere un turno completado sin error, hora UTC verificada coincidente y zona IANA válida. No acredita disponibilidad ni estado actual de una cita.
- **Alcance:** backend/src/app/appointment-receipts.js; validadores de respuestas v1/v2.
- **Notas:** No deducir una llamada del texto del modelo ni del estado completed sin el recibo cerrado. Los IDs CRM permanecen en LidIA.
