# Glosario de Gestadia Portal

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
- **Notas:** Usa los recursos de Gestadia del handoff y respeta movimiento reducido en la web.

## Revisión de servicio en demo
- **Tipo:** concepto runtime.
- **Definición:** Cierre local del recorrido comercial que muestra el servicio elegido sin contratar ni realizar un pago.
- **Alcance:** `frontend/app/src/DemoCheckout.jsx`, ruta `/checkout-demo`.
- **Notas:** Sustituye la salida al checkout real exclusivamente en la primera versión de demostración.
