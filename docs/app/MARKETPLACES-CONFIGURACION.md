# Configuración y evidencia de implementación

Relacionado: [diseño marketplaces](MARKETPLACES.md), [acceso social](ACCESO-SOCIAL.md), [plan](2026-10-08-IMPLEMENTACION-MARKETPLACES.md), [glosario](../../GLOSARIO.md).

## Estado 08/10/2026

Implementación local aislada en `codex/gestadia-marketplaces`; no desplegada ni enviada a tiendas. El frontend por defecto conserva `demoOnly:true`. Apple/Google nativos, sesiones revocables y push sólo funcionan con configuración conectada completa y backend habilitado.

- Apple Developer verificado en Chrome: DEFENSA LEGAL CONSUMIDORES SL, equipo `X27NG7M487`; la lista App IDs aún no contiene `com.gestadia.app`. Certificado de distribución de ese equipo disponible en Keychain; no prueba de perfil Gestadia.
- Google Cloud: proyecto `gestadia-vozia` (GESTADIA-VOZIA), sin clientes OAuth. La cuenta abierta también administra `dlc-lia-prod`; no se reutilizan recursos LIA.
- Pendiente decisión de titular/equipo y proyecto propios Gestadia. No se han registrado App ID, Services ID ni credenciales externas por deducción.
- Clave upload Android local generada, privada y recuperable, fuera de Git en `/Users/gonchumon/.config/gestadia/mobile-signing/`. Alias `gestadia-upload`; certificado público `android-upload-cert.der`. Las contraseñas sólo están en el directorio privado (0700/0600). La copia local adicional no sustituye una custodia recuperable fuera del equipo.

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

iOS: `{"teamId":"<10 caracteres>"}`. No se fija el equipo hasta resolver titularidad. Xcode Debug usa APNs development; Release production. Google URL scheme se pasa como `GOOGLE_IOS_REVERSED_CLIENT_ID` derivado del cliente iOS.

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

Antes de publicar: cuentas/credenciales definitivas, backend conectado, perfiles Apple, Play App Signing, política de privacidad/declaraciones de datos, borrado operativo, pruebas reales en iOS/Android, builds exactos TestFlight/Play interno y aceptación de login/push. La aceptación del proveedor push no acredita recepción en dispositivo ni lectura.

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
6. No registrar recursos bajo Defensa Legal ni reutilizar LIA sin resolver titularidad; coste: altas pendientes hasta respuesta, evitando registrar la app a nombre de otra compañía.
7. Mantener pendiente login real Apple/Google; un fixture JWT acredita contrato, no compatibilidad final con proveedor.
8. Mantener pendiente firma de distribución; debug/ad hoc no acreditan perfiles Gestadia ni instalación TestFlight/Play.
9. Mantener pendiente recepción push en dispositivos físicos en primer plano, fondo y cerrada; aceptación del proveedor no prueba entrega.
10. Mantener eliminación en pending_review; purga, retención, retirada LidIA y URL pública faltantes bloquean aceptación de publicación.

No se ha hecho push, merge, despliegue ni publicación. El trabajo local y la revisión no cierran esas etapas.
