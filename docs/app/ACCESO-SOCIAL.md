# Acceso Apple y Google en Gestadia

**Fecha:** 08/10/2026. **Estado:** diseño para revisión; sin endpoints o capacidades sociales implementados.

[Preparación marketplaces](MARKETPLACES.md) · [Glosario](../../GLOSARIO.md) · [Responsabilidades Portal/APP](RESPONSABILIDADES-INTEGRACION.md)

## Resultado solicitado

Ofrecer «Continuar con Apple» y «Continuar con Google» en iOS y Android. Mantener la cuenta Gestadia compartida con el Portal y el acceso por email/contraseña. Autenticarse con un proveedor no acredita un contacto CRM, una contratación ni autorización de expediente.

Se propone `@capgo/capacitor-social-login@8.5.13`, cuya compatibilidad declarada con Capacitor 8 se comprobó en npm; falta verificar compilación y comportamiento con Swift Package Manager, callbacks y nonces antes de fijarlo en el lockfile.

| Plataforma | Apple | Google |
|---|---|---|
| iOS | API nativa y entitlement Sign in with Apple | SDK nativo, cliente iOS y retorno URL del proveedor |
| Android | OAuth en navegador del sistema, callback HTTPS al backend y retorno a la app | Credential Manager, cliente web como audiencia y cliente Android por paquete/certificado |

La guía del plugin documenta el flujo Apple Android y la configuración Google por plataforma. El callback Apple no debe copiar tokens a una URL de retorno. [Apple Android](https://capgo.app/docs/plugins/social-login/apple/android/), [Google Android](https://capgo.app/docs/plugins/social-login/google/android/), [Google iOS](https://capgo.app/docs/plugins/social-login/google/ios/).

## Datos y autoridad

`SocialIdentity` vincula un emisor y sujeto estables del proveedor a `User.id`; admite varias identidades por usuario y garantiza unicidad del emisor/sujeto. Guardar audiencia/origen validados y sólo los datos necesarios. El email es un atributo de contacto, no la clave de esa relación.

`SocialAuthAttempt` conserva propósito (acceso o vinculación), desafío aleatorio, plataforma/audiencia fijadas por servidor, vencimiento de cinco minutos y consumo atómico. En vinculación está ligado a una sesión Gestadia autenticada. `state`, nonce y un código de retorno de un solo uso deben corresponder al mismo intento.

`AuthSession` identifica la sesión Gestadia con un `jti` aleatorio, usuario, creación, vencimiento y revocación. Los nuevos accesos móviles, también con contraseña, generan estas sesiones; la autorización y el envío push comprueban que sigan vigentes. Los JWT Portal existentes mantienen compatibilidad hasta su vencimiento, pero no sirven para registrar push: se requiere reautenticación y emisión de una sesión revocable. El plan detallará esta transición y sus pruebas sin invalidar accidentalmente accesos activos del Portal.

No guardar el JWT Gestadia ni credenciales del proveedor en `localStorage` en los builds nativos de release; usar almacenamiento respaldado por Keychain/Keystore. La elección del adaptador se fijará y probará en el plan. El almacenamiento web existente conserva su comportamiento en esta fase.

## Acceso y vinculación

1. El backend crea un intento; la app inicia el proveedor con el desafío correspondiente. Sólo pedir nombre/email, sin permisos de contactos, Drive u otras APIs.
2. El backend valida firma y algoritmo permitido, emisor, audiencia exacta del canal, vencimiento y nonce; el cliente no puede ampliar la lista de audiencias. Validar el código de autorización Apple cuando corresponda. Usar las claves oficiales del proveedor y tratar errores de red como fallo recuperable, sin crear sesión.
3. Si existe `SocialIdentity`, recuperar su usuario activo y emitir una sesión Gestadia. Rechazar identidad vinculada a una cuenta retirada.
4. Si no existe, ofrecer vincular una cuenta Gestadia existente o confirmar la creación de una nueva cuenta personal sin trámites. No abrir una cuenta automáticamente al pulsar el botón ni buscar/fusionar por email.
5. Vincular exige prueba de control de la cuenta Gestadia mediante acceso existente o recuperación verificada; la operación consume el intento en transacción y falla si la identidad ya pertenece a otro usuario. No revelar en respuestas públicas si un email tiene expediente.
6. Crear cuenta exige confirmación y un email validado por el proveedor; si falta, solicitar y verificar un correo antes del alta. El relay Apple puede ser el contacto, pero no se atribuye al email real del CRM. El nombre puede faltar; no bloquear acceso por nombre/apellidos ausentes.
7. Asociar después un acceso o trámite CRM sigue el contrato Zoho/Portal y exige las pruebas de identidad previstas allí. La app no puede enviar un `zohoContactId` o `userId` para adquirir esa relación.

El modelo actual obliga `User.email`, `nombre` y `apellidos`; el plan debe resolver el alta social sin inventar correos ni datos personales. Se propone aceptar nombre/apellidos vacíos hasta completar el perfil y mantener email obligatorio/verificado para nuevas cuentas sociales. La unicidad de email se conserva; una colisión ofrece vinculación sin crear un duplicado. Dos altas concurrentes se resuelven por las restricciones y transacciones, sin reintentar asignando otra identidad.

Apple permite ocultar el email y puede entregar el nombre sólo en la primera autorización. Persistir lo obtenido de forma validada y no borrar datos por respuestas posteriores incompletas. [Autenticación Apple](https://developer.apple.com/documentation/signinwithapple/authenticating-users-with-sign-in-with-apple), [verificación Apple](https://developer.apple.com/documentation/signinwithapple/verifying-a-user). Google también debe verificarse en el servidor. [Validación Google](https://developers.google.com/identity/sign-in/android/backend-auth).

## Retorno Apple en Android

Registrar un Services ID ligado al App ID principal y un callback HTTPS controlado por Gestadia. El backend recibe el POST Apple, comprueba/consume `state`, intercambia el código y valida la identidad. El destino de retorno es fijo y admitido por la app.

Devolver a Android exclusivamente un código opaco, de vida máxima de sesenta segundos, vinculado al intento y a una prueba conservada por la app. Su canje es de un solo uso y exige esa prueba; un enlace interceptado no basta para abrir la sesión. Rechazar callbacks expirados, repetidos o de otra app, redirect libre y log de tokens. Verificar con el plugin si permite conservar esta correlación; si su API exige incluir tokens en el retorno, sustituir ese transporte por un adaptador seguro antes de habilitarlo.

El esquema/host exacto de retorno y el dominio del callback se fijan después de confirmar titularidad y hosting; no se registra aquí un dominio o Services ID nuevo. Preferir un enlace verificado cuando el adaptador lo soporte; si usa esquema personalizado, mantener obligatoria la prueba de canje y el destino fijo. [Configuración web Apple](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/).

## Cancelación, salida y revocación

Cancelar el diálogo conserva la pantalla sin error alarmista y sin cuenta/sesión nuevas. Impedir accesos simultáneos desde los botones; si cambia la sesión mientras responde el proveedor, descartar el resultado tardío. La falta de configuración oculta el proveedor o muestra su indisponibilidad antes de abrirlo; nunca inicia una demo como si fuera una autenticación social real.

Salir revoca `AuthSession` y sus dispositivos push en backend antes de confirmar el cierre remoto. Limpiar almacenamiento nativo, estado de cuenta e información del proveedor. Si falta conectividad, cerrar el acceso local, registrar el cierre remoto pendiente e informar de su estado; los avisos visibles permanecen genéricos.

Desvincular un proveedor exige reautenticación y conservar al menos otra forma de acceso válida. La revocación de Apple se aplica server-side; la credencial necesaria se almacena cifrada sólo para esa finalidad y renovación/revocación autorizadas. No conservar access/refresh tokens Google si el acceso necesita únicamente su ID token.

La eliminación de cuenta tendrá un endpoint real con reautenticación y confirmación, revocación de sesiones, dispositivos e identidades, y revocación Apple. La política de retención de expedientes debe concretarse con el responsable antes de activar borrado de datos reales; el botón debe explicar qué se elimina y qué se conserva. También requiere coordinar la retirada del acceso conversacional con el contrato LidIA vigente. No confundir este proceso con `deleteDemoAccount`.

Apple documenta la oferta de borrado y revocación de sus tokens. Sus reglas de login exigen una opción equivalente con características de privacidad cuando se usa login social; ofrecer Apple junto a Google satisface la dirección propuesta, sujeto a la revisión de la app. [Borrado Apple](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion), [regla 4.8](https://developer.apple.com/app-store/review/guidelines/#login-services).

## Archivos previstos

- `frontend/app/src/social-auth.js`: adaptador por plataforma; `Login.jsx` y registro: botones y decisiones de vinculación/alta.
- `frontend/app/src/AppContext.jsx`: adopción de sesión, cancelación, salida y almacenamiento nativo.
- `frontend/ios/App/App/Info.plist`, entitlements, callbacks de AppDelegate/SceneDelegate y proyecto Xcode: retorno Google y Apple nativo; verificar el flujo con escenas activas.
- `frontend/android/app/src/main/AndroidManifest.xml` y `MainActivity.java`: retorno Apple admitido y bridge necesario.
- `backend/src/routes/social-auth.js` y `backend/src/services/social-auth.js`: intentos, verificación, canje y vinculación.
- `backend/src/middleware/auth.js`, rutas de acceso y `backend/prisma/schema.prisma`: sesiones revocables, identidades y migraciones.
- Ejemplos de configuración cliente/servidor: audiencias públicas separadas de secretos.

Las rutas y DTO exactos se escribirán en el plan tras revisar el diseño. Ninguna ruta social existe por el hecho de aparecer en este documento. No modificar el contrato conversacional APP/LidIA para hacer depender la identidad de un token Apple/Google.

## Pruebas exigidas antes de habilitar

| Caso | Resultado |
|---|---|
| Apple y Google en cada plataforma | Sesión Gestadia real; mismo usuario vinculado que en Portal |
| Apple con email oculto, nombre ausente y autorizaciones sucesivas | Login válido sin inventar correo ni perder perfil |
| Email igual a una cuenta previa | Prueba de control para vincular; sin apropiación o duplicado |
| Nueva identidad sin contratación | Cuenta personal confirmada, cero acceso a expedientes privados |
| Firma/emisor/audiencia/nonce incorrectos o token vencido | Sin sesión ni vinculación |
| Callback repetido, código canjeado o prueba ajena | Rechazo y sin segundo efecto |
| Cancelación/cambio de cuenta/respuesta tardía | Sin sesión inesperada ni datos previos |
| Doble vinculación/alta concurrente | Una asociación válida, conflicto controlado |
| Logout/borrado/revocación Apple | Sesión y dispositivos retirados; token previo no autoriza |
| Google en Play interno y Apple en TestFlight | Acceso con las firmas y configuración de distribución |

Las pruebas unitarias usarán tokens firmados por claves de fixture y respuestas controladas del proveedor; no harán login real ni enviarán avisos. Las pruebas finales requieren cuentas de prueba, backend conectado y dispositivos con los builds distribuidos. Un build de simulador o un botón que abre el proveedor no cierra la aceptación.

## Decisiones que se presentan a revisión

Conservar identidad Gestadia; añadir ambos proveedores en ambos sistemas; vincular con prueba de control; alta social sólo tras confirmación y sin habilitar trámites; sesiones revocables; APNs directo en iOS y FCM Android. Tras esa revisión se redactará el plan de implementación por bloque y se completará el inventario externo. No se ha activado autenticación, migrado usuarios ni generado secretos.
