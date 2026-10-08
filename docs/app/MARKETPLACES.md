# Preparación de Gestadia para App Store y Google Play

**Fecha:** 08/10/2026. **Estado:** diseño para revisión; capacidades y servicios todavía no implementados.

[Glosario](../../GLOSARIO.md) · [Proyectos nativos](MOBILE.md) · [Diseño de acceso Apple/Google](ACCESO-SOCIAL.md) · [Responsabilidades](RESPONSABILIDADES-INTEGRACION.md)

## Objetivo y alcance solicitado

Preparar la app para publicar en Apple y Google: notificaciones remotas, permisos necesarios, firma de distribución y posibilidad de usar Apple y Google para acceder en **ambas plataformas**. La publicación pública y la activación de servicios reales son hitos posteriores con evidencia propia.

Se divide en dos bloques revisables: base nativa/firma/push (este documento) y autenticación social (documento enlazado). La cuenta compartida Portal/APP y los permisos de expediente siguen siendo responsabilidad del backend Gestadia. LidIA no administra las identidades sociales ni los dispositivos.

## Auditoría del checkout

Revisión sobre `app/main`, commit `a9cd579`, inicialmente sin cambios locales.

| Área | Evidencia actual | Trabajo necesario |
|---|---|---|
| Frontend | React/Vite, `frontend/app/`, Capacitor 8.5.2 | Incorporar adaptadores nativos y configuración validada |
| Identificador | `com.gestadia.app` en Capacitor, Gradle y Xcode | Confirmar titularidad y registro antes de provisionar |
| Versión | 0.1.0, build 1 | Fijar versión publicable y builds crecientes por tienda |
| iOS | Swift Package Manager; firma automática, sin `DEVELOPMENT_TEAM` configurado en el proyecto | Equipo, capacidades, perfiles y archivo de distribución |
| Android | SDK mínimo 24; compile/target 36; sin `signingConfig` release | Clave de subida y Play App Signing |
| Push | No consta dependencia ni código de registro push | Plugin, permisos, registro autenticado y remitentes |
| Avisos actuales | `Notificacion` y `notifyUser` guardan en Portal y pueden enviar email | Entrega push adicional y durable |
| Identidad | Login email/contraseña y JWT de 30 días | Identidades sociales y sesiones revocables |
| Demo | `frontend/app/public/app-config.js` tiene `demoOnly: true` | Conservar la demo de desarrollo y crear configuración de release conectada validada |
| Cuenta | `deleteDemoAccount` elimina estado local de ejemplo | Borrado real antes de publicar creación de cuentas |

No constan en los archivos versionados entitlements, configuración Firebase, clientes OAuth o credenciales de distribución. Esto no prueba que no existan en las cuentas externas: se ha solicitado confirmar su inventario. No se han consultado dichas consolas.

Herramientas verificadas: Node 24 y Xcode 27.0 disponibles. Java no aparece registrado por `java_home`; tampoco se encontró SDK Android en su ubicación habitual. Antes de compilar Android se localizarán sus rutas reales o se preparará Java 21/SDK 36. Esta comprobación no es una prueba de compilación.

## Arquitectura recomendada y alternativas

**Recomendación:** conservar Capacitor, el backend Express/Prisma y su cuenta compartida. Usar el plugin oficial `@capacitor/push-notifications`, APNs directo en iOS y FCM en Android. Apple/Google validan la identidad; Gestadia emite y autoriza su sesión.

Alternativas consideradas:

- FCM para ambos sistemas: unifica el remitente, pero requiere integrar Firebase Messaging también en iOS y registrar su token FCM. El plugin oficial devuelve un token APNs en iOS; no se pueden mezclar los dos tipos.
- Firebase Authentication para la identidad: ofrece un servicio gestionado, pero añade otra identidad central y una migración/puente con las cuentas Portal/Zoho. Se propone mantener la autoridad actual de Gestadia.

La compatibilidad declarada consultada en npm el 08/10/2026 permite proponer `@capacitor/push-notifications@8.1.3` y `@capgo/capacitor-social-login@8.5.13` para Capacitor 8. No se han instalado ni se acredita todavía compatibilidad de compilación, Swift Package Manager o funcionamiento conjunto. El plan de implementación fijará versiones tras esa prueba.

## Firma y configuración por plataforma

### Apple

1. Confirmar organización, Apple Developer Team y acceso a App Store Connect.
2. Registrar o comprobar el App ID explícito `com.gestadia.app`; habilitar Push Notifications y Sign in with Apple.
3. Configurar el equipo de firma. Añadir entitlements de push y Apple al target, con perfiles compatibles; comprobarlos en el archivo firmado.
4. Separar desarrollo APNs de producción APNs. TestFlight y App Store usan producción. El destino lo fija el backend por el build/registro admitido, nunca una selección libre del cliente.
5. Preparar clave de proveedor APNs con Team ID y Key ID, conservando la clave privada en el servidor/gestor de secretos.
6. Crear archivo de distribución, exportar para App Store Connect y distribuir primero por TestFlight.

Una capacidad en Xcode no demuestra que el perfil ni el binario firmado la contengan. No se crea una clave Apple, se registra un identificador ni se modifica una cuenta externa en esta revisión.

### Google

1. Confirmar Google Play Console, organización y nombre de paquete.
2. Crear o reutilizar proyecto Firebase/Google Cloud propiedad de Gestadia y registrar la app Android.
3. Incorporar el `google-services.json` de ese proyecto al módulo Android; verificar concordancia con el paquete. No contiene una credencial administrativa, pero se controla por entorno.
4. Preparar una clave de subida con copia recuperable y contraseñas fuera del repositorio. Configurar el build release para requerir firma y fallar si faltan sus datos.
5. Activar Play App Signing y registrar las huellas de los certificados usados por debug, distribución local y Google Play en los clientes OAuth correspondientes.
6. Generar AAB firmado, distribuir por prueba interna y validar el build descargado desde Play.

La clave de subida y el certificado con el que Google distribuye la app pueden diferir. El login Google debe probarse con el certificado del paquete realmente instalado. [Firma Android](https://developer.android.com/studio/publish/app-signing).

### Separación de secretos

Versionar plantillas vacías e instrucciones reproducibles. Mantener fuera de Git claves privadas `.p8`, keystores, contraseñas, perfiles, credenciales administrativas Firebase y secretos OAuth. Ampliar las exclusiones actuales, que ya cubren `.jks`, `.keystore`, `.p12` y `.mobileprovision`.

Los client IDs OAuth y el identificador de app son configuración pública. La app nunca contendrá el secreto Apple, credenciales administrativas Firebase o las claves del backend. Separar las claves APNs de las de Sign in with Apple, aunque ambas se descarguen como `.p8`.

## Permisos y experiencia

| Capacidad | iOS | Android | Momento de solicitud |
|---|---|---|---|
| Notificaciones | Autorización del sistema y capacidad push | `POST_NOTIFICATIONS` en Android 13+; canal de avisos | Tras entrar, al pulsar «Activar notificaciones» |
| Cámara | Ya hay texto de finalidad; comprobar implementación real | Solicitud sólo si la captura nativa elegida la requiere | Al fotografiar un documento |
| Fotos/archivos | Preferir selector del sistema | Selector del sistema, sin acceso general al almacenamiento | Al elegir el documento |
| Apple/Google | Consentimiento del proveedor | Consentimiento del proveedor | Al pulsar su botón de acceso |

No solicitar micrófono, contactos, ubicación ni seguimiento publicitario para este bloque. La voz, si se habilita posteriormente, tendrá su solicitud contextual y pruebas propias. No añadir excepciones HTTP globales a iOS o Android para resolver configuración del backend.

El rechazo de notificaciones conserva el acceso, los expedientes y la bandeja interna. Mostrar estado desactivado y acceso a ajustes cuando corresponda, sin repetir automáticamente el diálogo. Volver de ajustes obliga a consultar el permiso vigente. El plugin oficial requiere capacidad y callbacks iOS; Android usa FCM y requiere permiso en Android 13+. [Capacitor Push](https://capacitorjs.com/docs/apis/push-notifications), [permiso Android](https://developer.android.com/develop/ui/compose/notifications/notification-permission).

## Flujo push y persistencia propuesta

1. La app abre una sesión Gestadia revocable y muestra el control de avisos.
2. Si el usuario autoriza, se instalan listeners antes de registrar; se crea el canal Android y se obtiene el identificador del transporte.
3. El registro se envía al backend autenticado; el servidor obtiene el usuario de la sesión. Se rechazan propietarios enviados en el cuerpo.
4. El backend guarda `PushDevice`: instalación aleatoria, usuario, sesión, transporte, entorno, registro protegido, fecha de actualización y estado activo/revocado. La instalación no es una credencial.
5. `notifyUser` mantiene el aviso interno y crea las entregas `PushDelivery` en la misma transacción. El envío remoto lo realiza un worker; sus fallos no revierten el expediente ni impiden consultar el aviso.
6. Cada entrega tiene unicidad por notificación/dispositivo, número de intentos, próximo intento y resultado. Aplicar reintentos limitados con backoff a fallos transitorios y desactivar registros invalidados por el proveedor.
7. Antes de enviar, comprobar usuario, dispositivo y `AuthSession` vigentes. La rotación sustituye registros; salir, cambiar de cuenta o borrar cuenta revoca sus asociaciones. Un fallo offline de cierre se informa y se reintenta; nunca se promete revocación remota sin confirmación del servidor.

La transición desde el JWT actual a `AuthSession` se define en el diseño de acceso. Push requiere una sesión revocable incluso si se entra con contraseña. No basta con borrar el token del almacenamiento local.

El aviso visible será genérico: «Gestadia» / «Tienes una nueva actualización. Abre la app para consultarla». El payload lleva el identificador opaco del aviso; no lleva DNI, documentos, texto de conversación, nombres ni enlaces arbitrarios. Pulsarlo abre una ruta interna permitida, recupera el aviso autenticado y verifica su pertenencia antes de mostrar su expediente. Si falta sesión, espera al login; no reproduce una selección privada entre cuentas.

En primer plano, actualizar la bandeja sin duplicar eventos. En segundo plano/app cerrada, usar avisos visibles del sistema. No se promete procesamiento silencioso: el plugin oficial no soporta silent push iOS. La primera integración se limita a avisos que ya produce `notifyUser`; los avisos por mensajes LidIA requieren después su evento conversacional contratado y una prueba independiente.

## Archivos previstos para implementar

- `frontend/package.json` y lockfile: plugins fijados y comandos de preparación/verificación.
- `frontend/app/src/push.js`: permisos, listeners, registro, navegación y limpieza.
- `frontend/app/src/Notifications.jsx` y `AppContext.jsx`: control de avisos y ciclo de sesión.
- `frontend/capacitor.config.json`, `frontend/ios/App/App/AppDelegate.swift`, entitlements y proyecto Xcode: capacidades/callbacks.
- `frontend/android/app/build.gradle`, manifiesto y recursos: firma, icono monocromo y canal. Comprobar manifiesto fusionado para evitar permisos redundantes.
- `backend/prisma/schema.prisma` y migración nueva: `PushDevice`, `PushDelivery`, dependencia `AuthSession`.
- `backend/src/routes/push.js`, `backend/src/services/push/`, `notify.js` y configuración: registro autorizado y remitentes separados.
- `.gitignore`, ejemplos de configuración y documentación de release: secretos fuera del repo y preflight de publicación.

No editar a mano los archivos nativos generados por `cap sync`. La configuración de release debe empaquetar origen HTTPS aprobado y modo conectado; su preflight rechazará `demoOnly: true`, configuración incompleta, firma debug o credenciales de otro entorno. Las flags de interfaz no autorizan operaciones del backend.

## Inventario que debe proporcionar la organización

| Plataforma | Datos/configuración necesarios | Custodia |
|---|---|---|
| Apple | Organización, Team ID, App ID, capacidad push/Apple, ficha App Store Connect y perfiles | Cuenta de organización; identificadores públicos documentables |
| APNs | Key ID y clave privada de proveedor | Secretos del backend |
| Android | Cuenta Play, paquete, alias y ubicación segura del keystore, certificados públicos | Gestor de secretos y copia recuperable |
| FCM | Proyecto, configuración Android y credencial server-side de envío | Configuración cliente separada de credencial administrativa |
| Google OAuth | Cliente web, cliente iOS y clientes Android por huella | IDs públicos; secretos sólo cuando el flujo de servidor los requiera |
| Apple OAuth | Services ID, dominio/callback HTTPS, Key ID y clave privada | Registro Apple y secretos del backend |
| Entorno | URL HTTPS de API y base de datos de prueba aislada | Configuración operativa |

Se ha preguntado cuáles de estas cuentas/proyectos existen. No se solicitan claves ni contraseñas en el chat. No se ha elegido el Services ID ni el callback externo sin comprobar dominio y cuenta.

## Orden de trabajo y aceptación

1. Revisar este diseño y el de identidad; confirmar inventario de cuentas. Preparar el plan de implementación por bloque.
2. Incorporar configuración de firma/entitlements y preflight reproducible; comprobar compilaciones sin afirmar todavía distribución.
3. Implementar sesiones revocables y adaptadores push con pruebas aisladas; después migración y provisión de secretos en entorno de prueba.
4. Implementar Apple/Google y vinculación según el diseño de acceso.
5. Distribuir builds por TestFlight y prueba interna Play con autorización de esa distribución; ejecutar matriz en dispositivos.
6. Completar borrado real, privacidad, metadatos y acceso para revisión; solicitar publicación cuando el resultado esté acreditado.

| Prueba | Resultado exigido |
|---|---|
| Permiso concedido/rechazado y retorno de ajustes | Registro sólo autorizado; rechazo no bloquea la app |
| Registro repetido/rotado y dos dispositivos | Sin duplicados ni pérdida del otro dispositivo |
| Logout/cambio de cuenta/borrado | Dispositivo revocado; sin rutas ni datos del usuario anterior |
| Callback de registro retrasado tras logout | No asocia el token a una sesión o usuario nuevo |
| Proveedor temporalmente caído/token inválido | Reintento controlado o revocación; aviso interno conservado |
| Push en primer plano, fondo y cerrada | Aviso visible y navegación autenticada correcta |
| Tap sin sesión o con sesión de otra cuenta | Login requerido o rechazo; sin consulta privada ajena |
| Release mal configurada | El preflight detiene el empaquetado/archivo publicable |
| TestFlight / Play interno | Push probado en iPhone y Android con los builds distribuidos |

La publicación exige además borrado de cuenta, privacidad y declaraciones de datos/SDK coherentes, fichas/capturas y comprobación de requisitos vigentes de SDK y cuenta. Este bloque no certifica por sí solo toda la revisión comercial de la app.

## Estado de esta entrega

Completado: auditoría documental/código, propuesta técnica, inventario de dependencias y glosario. Pendiente: revisión de diseño, plan, código, migraciones, cuentas, firma real, distribución y pruebas nativas. No se ha modificado el comportamiento de la demo, instalado plugins, generado claves, desplegado ni publicado nada.
