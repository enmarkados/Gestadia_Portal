# Primera versión de Gestadia App

[Glosario](../../GLOSARIO.md) · [Validación](VALIDACION.md) · [Móvil](MOBILE.md)

Rama `app/main` creada desde `main` (`af5b515`). Referencia visual: `RECURSOS/DISEÑO/GESTADIA-handoff-diseno/index.html`. Referencia de arquitectura nativa: LIA APP.

El alcance vigente, confirmado por el usuario el 3 de octubre de 2026, es una **demo para enseñar el sistema actual sin ninguna conexión externa**, disponible para web, iOS y Android. Incluye splash al arrancar, inicio de sesión y registro de ejemplo. La infraestructura completa solicitada (certificados, Firebase, base de datos y cuentas reales) se reserva a una fase posterior.

## Recorridos disponibles

- Shell grafito, marca Gestadia y pestañas LidIA, Trámites, Mensajes y Servicios.
- Sondeo guiado de canje, transferencia y duplicado, con opciones y texto libre. No consulta a una IA externa ni afirma viabilidad del trámite.
- Cliente/lead de ejemplo, Juan Carlos Acero como gestor de referencia y mensajes locales explícitos.
- Servicios con precios del catálogo compartido del portal y revisión local del servicio elegido; no abre el checkout real ni realiza pagos.
- Expediente de ejemplo, checklist y selección de documentos sin guardar o enviar su contenido.
- Notificaciones, perfil, acceso y registro. Las contraseñas son transitorias y nunca se guardan.
- Panel Cuenta y Mi Perfil con la estructura de LIA APP, conservando el selector propio de Gestadia; seguridad, preferencias locales, borrado del ejemplo y páginas públicas de privacidad, términos y soporte. [Detalle y alcance para tiendas](PERFIL-LIA.md).
- Splash de marca para web y arranque nativo iOS/Android.

## Aislamiento

`GESTADIA_APP_CONFIG.demoOnly=true` y `APP_DEMO_ONLY=true` se activan por defecto. La app arranca con datos ficticios y elimina una credencial real anterior. El cliente API y PluginWeb rechazan llamadas, y Docker bloquea `/api/` y `/lidia/` sin consultar sus upstreams. Los recorridos de recuperación, privacidad y contratación permanecen dentro de la presentación.

La demo conserva únicamente los datos de ejemplo del recorrido en el dispositivo; cambiar de perfil en Mi cuenta los reinicia. No reproduce recibos, CSV ni documentos oficiales ficticios.

## Entrega

Entrada React/Vite independiente en `frontend/app/`, build `frontend/dist-app/`, Docker Nginx importable en Portainer y proyectos nativos en `frontend/ios/` y `frontend/android/`. El portal mantiene su entrada y su build actuales.

La publicación web prevista es `app.gestadia.com` en un espacio propio del mismo servidor Plesk, con Portainer. Ver [despliegue](DOCKER-PLESK.md). La preparación de la imagen y los builds locales no acreditan publicación, firma de distribución ni presencia en tiendas.
