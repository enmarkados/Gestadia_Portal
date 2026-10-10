# Configuración y evidencia de implementación

Relacionado: [diseño marketplaces](MARKETPLACES.md), [acceso social](ACCESO-SOCIAL.md), [plan](2026-10-08-IMPLEMENTACION-MARKETPLACES.md), [glosario](../../GLOSARIO.md).

## Estado 09/10/2026

Implementación local aislada en `codex/gestadia-marketplaces`; no desplegada ni enviada a tiendas. El frontend por defecto conserva `demoOnly:true`. Apple/Google nativos, sesiones revocables y push sólo funcionan con configuración conectada completa y backend habilitado.

- Titular y proyecto confirmados expresamente por el usuario el 09/10/2026: DEFENSA LEGAL CONSUMIDORES SL, equipo Apple `X27NG7M487`, y Google/Firebase `gestadia-vozia` (GESTADIA-VOZIA).
- App ID `com.gestadia.app` registrado y verificado en Chrome; identificador interno Apple `ZDTB2N99V6`. Push Notifications y Sign in with Apple guardados, como App ID principal.
- Perfil `Gestadia App Store` generado (`U9L76545R3`), descargado y verificado con `security cms`: UUID `eff405f5-ac9f-4bda-8c39-2107a7970e8f`, equipo `X27NG7M487`, paquete `com.gestadia.app`, APNs `production`, Apple Login `Default`, `get-task-allow:false` y certificado SHA-1 `7CC4100FD19E8CF17119128BC3A00F52AB878E4B` disponible en Keychain. Caduca el 05/07/2027. Copia privada y perfil instalado en `~/Library/Developer/Xcode/UserData/Provisioning Profiles/`; aceptación en archive/IPA efectiva aún pendiente.
- Autorización específica recibida «sí a las tres» el 09/10/2026: crear clientes/claves/IAM limitados, aceptar Firebase y Blaze heredado, y usar `https://app.gestadia.com` como API/callback. Recursos creados y verificados en Chrome.
- Clientes OAuth `Gestadia APP Web`, `Gestadia APP iOS` y `Gestadia APP Android Upload` creados en `gestadia-vozia`, sin tocar LIA. iOS usa equipo `X27NG7M487` y bundle `com.gestadia.app`; Android Upload usa la huella SHA-1 publicada abajo. Consentimiento mínimo guardado: sólo OpenID, correo y perfil, sin permisos sensibles/restringidos. Google permanece en **Prueba**, sin usuarios de prueba; marca existente `Gestadia - VozIA`, correo de asistencia existente y URLs de privacidad/condiciones pendientes. No hay consentimiento público activado.
- Firebase añadido al proyecto Cloud existente `gestadia-vozia` (número `25349048999`), con Blaze heredado y Analytics desactivado. Android registrado como `Gestadia APP Android`, app ID `1:25349048999:android:27ba9e21a46d574a38a982`; `google-services.json` descargado y comprobado contra proyecto/paquete. FCM HTTP V1 habilitado; legacy desactivado. Ningún producto adicional de pago habilitado.
- Claves Apple creadas y descargadas: `Gestadia APNs` (`738C6BG3UK`, Production), `Gestadia APNs Sandbox` (`85PQ93C8CX`, Sandbox), ambas Topic Specific sólo para `com.gestadia.app`; `Gestadia Apple Login` (`K8X6WTA694`) vinculada al App ID principal Gestadia. Claves privadas verificadas con OpenSSL y guardadas con copia local adicional.
- Services ID `com.gestadia.app.login` registrado (`K6ZVH5DQ4V`), Sign In with Apple habilitado, primary App ID `X27NG7M487.com.gestadia.app`, dominio `app.gestadia.com` y retorno `https://app.gestadia.com/api/auth/social/apple/callback` guardados y observados al reabrir Configure.
- Cuenta `gestadia-mobile-push@gestadia-vozia.iam.gserviceaccount.com` creada, ID `103690619828462233804`, con único rol `roles/firebasecloudmessaging.admin` observado al reabrir permisos. Clave JSON creada y descargada, identificador público `33e512bac6e654c4f1708a6a39535592c61d2995`. Google aceptó su autenticación mediante Firebase Admin y emitió un token temporal; no se expuso el token ni se enviaron notificaciones. No se añadieron principales con acceso ni roles Owner/Editor/Firebase Admin general.
- Custodia de secretos en `/Users/gonchumon/.config/gestadia/mobile-credentials/` (0700, archivos privados 0600): JSON Web OAuth, cuenta FCM y copia, tres claves Apple y copias, clave de cifrado estable, `backend-mobile.env`, variante `backend-mobile-sandbox.env` y `mobile-release.json`. Firma Android en `mobile-signing/android-signing.json`. Configuraciones preparadas y no aplicadas a producción; conservar el JWT_SECRET fuerte del backend existente. PluginWeb sigue con clave vacía y pendiente de contrato conectado.
- Preflight privado Android e iOS pasa con los clientes reales y el certificado upload. No acredita un binario de distribución ni backend conectado. `app.gestadia.com` no resuelve en DNS desde el equipo; `gestadia.com` y `oauth2.googleapis.com` sí. La consulta de `/api/mobile/capabilities` no pudo ejecutarse por esa resolución. Servidor/panel DNS y cuenta Google de prueba solicitados al usuario; archive/AAB conectados quedan bloqueados por el backend.
- Clave upload Android local generada, privada y recuperable, fuera de Git en `/Users/gonchumon/.config/gestadia/mobile-signing/`. Alias `gestadia-upload`; certificado público `android-upload-cert.der`. Las contraseñas sólo están en el directorio privado (0700/0600). La copia local adicional no sustituye una custodia recuperable fuera del equipo.


## Identificadores públicos creados

| Recurso | Identificador |
| --- | --- |
| Google Web | `25349048999-kbnmabllathll194qlp2098c8gl0v9u2.apps.googleusercontent.com` |
| Google iOS | `25349048999-j9enu8v0nm4767m46tcv5vrvcatrbnk0.apps.googleusercontent.com` |
| Google Android Upload | `25349048999-h49euph3ij9402ocvjqvgbgbi855c9bl.apps.googleusercontent.com` |
| Google iOS URL scheme | `com.googleusercontent.apps.25349048999-j9enu8v0nm4767m46tcv5vrvcatrbnk0` |
| Firebase Android | `1:25349048999:android:27ba9e21a46d574a38a982` |
| Apple Services ID | `com.gestadia.app.login` |

Capturas operativas guardadas fuera de Git en `marketplaces-evidencia`: `google-clientes-creados.jpg`, `firebase-fcm-habilitado.jpg`, `apple-claves-creadas.jpg`, `google-rol-fcm-guardado.jpg`, `google-consentimiento-minimo.jpg` y `apple-retorno-guardado.jpg`. Son evidencia de configuración de consola; no de login ni recepción push.

## Backend

Variables privadas fuera de Git, por entorno:

```dotenv
MOBILE_FEATURES_ENABLED=true
MOBILE_PUSH_ENABLED=true
JWT_SECRET=<secreto aleatorio fuerte, al menos 32 caracteres>
MOBILE_ENCRYPTION_KEY=<32 bytes aleatorios en base64>
GOOGLE_WEB_CLIENT_ID=<cliente web .apps.googleusercontent.com>
GOOGLE_IOS_CLIENT_ID=<cliente iOS del bundle com.gestadia.app>
APPLE_SERVICE_ID=<Services ID aprobado para Android>
APPLE_TEAM_ID=<equipo Apple confirmado>
APPLE_AUTH_KEY_ID=<clave dedicada Sign in with Apple>
APPLE_AUTH_KEY_FILE=<ruta absoluta privada .p8>
APPLE_CALLBACK_URL=https://<api-aprobada>/api/auth/social/apple/callback
APNS_ENVIRONMENT=production
APNS_KEY_ID=<clave APNs>
APNS_KEY_FILE=<ruta absoluta privada .p8>
FIREBASE_CREDENTIAL_FILE=<ruta absoluta privada cuenta servicio Firebase Admin>
```

Aplicar ambas migraciones móviles después del backup normal del entorno; en este trabajo se aplicaron exclusivamente a MariaDB de prueba `gestadia_mobile_test`. Node mínimo compatible con Firebase Admin: 22. Las claves de cifrado necesitan custodia estable para poder descifrar/revocar credenciales.

`GET /api/mobile/capabilities` sólo expone clientes públicos; el preparador de release los compara con la app. El arranque móvil rechaza JWT débil o configuración incompleta. CORS nativo exacto: `capacitor://localhost`, `https://localhost`; ningún permiso adicional para ubicación, contactos, cámara o tracking.

## Configuración pública de distribución

Crear un JSON privado de preparación con identificadores públicos definitivos. No incluir claves privadas ni refresh tokens:

```json
{
  "appId": "com.gestadia.app",
  "demoOnly": false,
  "demoEnabled": false,
  "apiBaseUrl": "https://<api-aprobada>",
  "checkoutBaseUrl": "https://gestadia.com",
  "push": {"enabled": true},
  "social": {
    "google": {"webClientId": "<web>", "iosClientId": "<iOS>"},
    "apple": {"clientId": "com.gestadia.app", "androidServiceId": "<Services ID>", "redirectUrl": "https://<api-aprobada>/api/auth/social/apple/callback"}
  },
  "pluginWeb": {"baseUrl": "https://<origen-aprobado>/lidia", "key": "<clave pública PluginWeb>"}
}
```

Google ID token se valida contra cliente web en ambas plataformas (`iOSServerClientId`); el cliente iOS sólo configura Google Sign-In nativo. El plugin solicita nonce nuevo y `forcePrompt` para no aceptar restauraciones de un intento anterior. Apple Android usa `form_post` y devuelve únicamente código opaco de 60 segundos; la prueba de canje queda en Keychain/Keystore.

## Firma y compilación

JSON privado de firma Android:

```json
{"keystore":"/ruta/android-upload.p12","alias":"gestadia-upload","storePasswordEnv":"ANDROID_STORE_PASSWORD","keyPasswordEnv":"ANDROID_KEY_PASSWORD","firebaseFile":"/ruta/google-services.json","certificateSha256":"<huella SHA-256 aprobada del certificado upload>"}
```

iOS: `{"teamId":"X27NG7M487"}`; equipo confirmado y guardado en `/Users/gonchumon/.config/gestadia/mobile-signing/ios-signing.json` (0600). Xcode Debug usa APNs development; Release production. Google URL scheme se pasa como `GOOGLE_IOS_REVERSED_CLIENT_ID` derivado del cliente iOS.

```sh
export MOBILE_PUBLIC_CONFIG_FILE=/ruta/privada/mobile-release.json
export MOBILE_SIGNING_CONFIG_FILE=/ruta/privada/mobile-signing.json
# Android: aportar passwords al entorno desde custodia privada y JAVA_HOME/ANDROID_HOME.
node scripts/mobile-release.mjs android --build
node scripts/mobile-release.mjs ios --build
```

El preflight exporta el certificado real con `keytool`, compara `certificateSha256`, su vigencia y rechaza firma debug aunque cambie el alias. Nunca incluye contraseñas en argv ni imprime stderr privado.

El script verifica backend, compila frontend, sustituye configuración sólo en `dist-app` ignorado, sincroniza y prepara firma. Gradle Release y fase Xcode Release rechazan demo/configuración empaquetada distinta. Los comandos Debug y `mobile:sync` restauran la demo por defecto: hay que preparar de nuevo antes de distribución.

Después verificar AAB/IPA/xcarchive y perfiles efectivos: paquete, equipo, `aps-environment`, Sign in with Apple, certificado firmante y configuración embebida. Registrar las huellas debug/upload/Play App Signing en los clientes Android correspondientes. Un debug APK firmado automáticamente no acredita la firma de publicación.

## Borrado y límites de publicación

La petición `POST /api/me/deletion-request` exige sesión móvil de los últimos 10 minutos y confirmación. Registra estado `pending_review`, retira acceso, invalida sesiones/dispositivos y programa revocación Apple. No se anuncia como eliminación completada. Falta acordar conservación de expedientes/documentos, procesador de eliminación, retirada de sesiones LidIA y página pública de solicitud para Google Play.

Antes de publicar: credenciales definitivas, backend conectado, firma Apple comprobada en archive/IPA con el perfil generado, Play App Signing, política de privacidad/declaraciones de datos, borrado operativo, pruebas reales en iOS/Android, builds exactos TestFlight/Play interno y aceptación de login/push. La aceptación del proveedor push no acredita recepción en dispositivo ni lectura.

## Pruebas reproducibles

```sh
node --test scripts/mobile-preflight.test.mjs
GESTADIA_MOBILE_TEST_DATABASE_URL=mysql://fixture:fixture@127.0.0.1:33481/gestadia_mobile_test npm test --prefix backend
NODE_OPTIONS=--no-experimental-webstorage npm test --prefix frontend
npm run mobile:sync --prefix frontend
```

La BD fixture es exclusiva; los tests de escritura exigen explícitamente origen loopback y nombre de base `gestadia_mobile_test`. `NODE_OPTIONS` evita incompatibilidad del WebStorage experimental de Node25 con jsdom, sin cambiar comportamiento de la app.

## Evidencia local de cierre y revisión

Revisión independiente única de la rama; ocho problemas relevantes corregidos con regresiones observadas RED→GREEN. Sin hallazgos menores diferidos.

| Comprobación | Resultado observado |
| --- | --- |
| Backend, incluida MariaDB aislada | 86/86 sin skips |
| Frontend Portal + APP | 96/96, 32 archivos |
| Preflight release | 8/8; clave debug y huella distinta rechazadas |
| Prisma schema | Válido; migraciones aplicadas sólo a fixture |
| Build APP + Capacitor sync | Correctos, seis plugins nativos |
| Android assembleDebug | Correcto, 24 segundos; no AAB de distribución |
| iOS iPhone 17 / iOS 26.5 | Build, instalación y lanzamiento correctos; 82,5 segundos con firma ad hoc de simulador |
| Arranque iOS | Keychain consulta sin error de entitlement, splash oculto y home visible |
| Certificado upload Android local | Huella real verificada; no prueba de registro Play App Signing |

Huellas públicas upload:
- SHA-1: `0B:5E:E3:18:B3:74:40:23:6A:51:19:A7:6B:14:9B:13:42:F4:94:B7`.
- SHA-256: `10:B1:E6:1F:C2:C7:11:A3:52:7C:B5:DB:75:DD:B6:E9:24:9D:81:07:A2:65:36:CA:CC:8D:8B:C4:0C:09:AA:6B`.

El primer build iOS sin firma compiló pero falló al consultar Keychain (OSStatus -34018). La ejecución con firma ad hoc del simulador eliminó ese fallo; no atribuir ese resultado al certificado de distribución de Defensa Legal. Las capturas prueban apertura de la demo, sin acreditar login/push conectado.

Correcciones verificadas: contrato del verificador OIDC real, generaciones de cancelación social, login durante persistencia/logout, conservación de revocación al entrar en demo, estado offline visible y recuperación en online/foreground, máximo cinco intentos push, renovación del lease ante proveedor lento y comprobación del certificado Android real. El payload mantiene información genérica; los envíos externos son al menos una vez tras caídas y FCM usa tag por aviso para colapsar duplicados visibles.

## Decisiones de ejecución y límites

1. Ejecutar el diseño ya aprobado, sin repetir aprobación local; ajustar alcance si difiere la intención, sin activar producción.
2. Aislar desde e10edba y conservar app/main; coste si la base cambia: reconciliar la rama antes de integrarla.
3. Usar SecureStorage 8.0.1 por compatibilidad Capacitor8/SPM; si falla Keychain/Keystore, el acceso falla y requiere recuperar esa configuración.
4. Usar fixture MariaDB con bridge adicional y puerto loopback porque internal no exponía el puerto; coste: recursos locales exclusivos a eliminar tras recoger evidencia.
5. Validar Google contra audiencia web en ambos sistemas, cliente iOS para GID y nonce con forcePrompt; coste si difiere el proveedor: corregir configuración antes de distribuir.
6. Titularidad resuelta por confirmación expresa del 09/10/2026: Defensa Legal y `gestadia-vozia`; App ID registrado. Autorización específica recibida y ejecutada: claves, clientes, IAM limitado, Firebase y callback creados. Activación del backend y aceptación en dispositivo pendientes.
7. Mantener pendiente login real Apple/Google; un fixture JWT acredita contrato, no compatibilidad final con proveedor.
8. Perfil App Store Gestadia generado y entitlements/certificado verificados el 09/10/2026; archive/IPA firmado e instalación TestFlight/Play pendientes. El perfil por sí solo no acredita esas builds.
9. Mantener pendiente recepción push en dispositivos físicos en primer plano, fondo y cerrada; aceptación del proveedor no prueba entrega.
10. Mantener eliminación en pending_review; purga, retención, retirada LidIA y URL pública faltantes bloquean aceptación de publicación.

No se ha hecho push, merge, despliegue ni publicación. El trabajo local y la revisión no cierran esas etapas.

## Continuación Docker/Portainer — 10/10/2026

El usuario ha confirmado que `app.gestadia.com` ya existe y que la web y los
servicios necesarios deben alojarse en Docker dentro de Portainer. Acceso a
Plesk confirmado en Chrome y Portainer confirmado en el navegador de Codex.
HTTPS del subdominio verificado sin omitir validación TLS; la API móvil devuelve
404. Stack nuevo de web/API, configuración pública completa y montaje privado
preparados. Cinco pruebas Docker pasan y las seis migraciones se aplicaron en
MariaDB de prueba. La API precarga dotenv antes de módulos ESM.

Inspección de la base real mediante `prisma migrate status` (solo lectura): las
cuatro primeras migraciones están aplicadas; faltan `20261008120000_mobile_identity_push`
y `20261008130000_apple_revocation`. Las credenciales vigentes del Portal se
copiaron a custodia privada fuera del repositorio, sin exponer sus valores.
La conexión a esa base es accesible desde Docker local. Pendientes: backup
consistente, importación de imágenes x86_64 en Portainer, montaje de claves
y entorno privado en el servidor, migraciones explícitas y proxy Plesk,
validación externa de capacidades y aceptación de login/push en dispositivo.
No hay despliegue ni publicación acreditados por las pruebas locales.

### Preparación del host y copia de seguridad — 10/10/2026

Imagen web `gestadia-app:50f8385` importada en Portainer local; ID
`sha256:084c83edec7951bb8f4e7a1994b78fca86d1a579ab44da09a6185584ac1d99b1`,
linux/amd64, 63.6 MB. Importación no equivale a arranque ni proxy publicado.
Copia consistente de la base real completada (170019 bytes, ocho tablas),
SHA-256 `b90586ba6ab036cf8981497083f558c46be9852a66ba3f6b2ce06c58a3ba87f2`.
Se restauró en MariaDB aislada y se aplicaron allí las dos migraciones móviles
pendientes correctamente. El esquema de producción permanece intacto.

La configuración privada candidata conserva DATABASE_URL y JWT_SECRET y
ajusta las tres rutas Apple/FCM al montaje `/run/gestadia-secrets`. No incluye
LIDIA_API_KEY: no activa un segundo worker de pagos LidIA durante este despliegue.

Revisión de dependencias del backend: se aplicaron actualizaciones dentro de
los rangos existentes de Express, body-parser, qs, proxy-addr y Nodemailer.
La corrección de proxy-addr 2.0.8 elimina la alerta crítica
[GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h).
La auditoría aún informa cuatro alertas altas: Nodemailer y deepmerge-ts con
sus padres Prisma/config. No se atribuye seguridad total a esta actualización
ni se fuerza una migración mayor de Prisma. Se requiere seguimiento de esas
alertas antes de aceptación pública final de tiendas.
