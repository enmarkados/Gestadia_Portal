# Subida preparada, aún no ejecutada

Fuente de ambos candidatos965a12d, versión1.0. Mantener paquetes y números reservados; no recompilar por completar formularios de tienda. Requisitos previos: runtime invitado aceptado, recorrido nuevo validado y declaración legal Apple confirmada por el usuario.

## Apple: método existente

Archivo privado `publication-1.0-ios12-android5-20261014/Gestadia-1.0-12.xcarchive`, IPA `ios-export/App.ipa`, SHA345af3a99933302cc7592ec5326703c50daaf76ac3ac4d792d0e0718a96b4515. Distribución App Store, equipoX27NG7M487, build12/APNsproduction/debugfalse verificados.

Con el GO de distribución, usar Xcode Organizer y la cuenta de distribución ya autorizada: abrir ese archive, confirmar com.gestadia.app/1.0(12), Distribute App → App Store Connect → Upload. No ejecutar otra archive ni cambiar automáticamente el número. Conservar recibo de subida; comprobar después procesamiento y seleccionar la build12 en la versión1.0. Reautenticación/MFA y declaración legal quedan a cargo del usuario cuando proceda; no se sustituyen por la firma local ni por un login anterior. Esta preparación no ha abierto Organizer ni subido nada.

## Android: AAB y APK compañero

AAB firmado `Gestadia-1.0-5.aab`, SHA38d7027b923e43d11067772e680c3353e308f3eba6ddfa78acf763bd64ca698d. Para el emulador se deriva universal.apk del mismo AAB con bundletool y firma existente; no otra compilación Gradle. Companion privado `android-companion/Gestadia-1.0-5-universal.apk`, SHAc7a3f457e46502653c980a7b1326318545db3cac684fd1aacab679e5e7d537c3, firma cotejada. La subida Play usa el AAB, no el APK compañero. El certificado que distribuye Play puede diferir del upload: su aceptación se comprueba en la pista correspondiente.

Capturas: sólo UI nativa actual del candidato, sin datos de cliente, historial privado, conversación creada o respuesta de modelo simulada. Android propio4096MB/4cores; pantalla1080x1920 y PNG directo. Entrada sin registro/servicios/home, sin pulsar Continuar sin registro ni enviar turnos. Apagar Android antes de otro simulador. Las capturas de estas pantallas públicas no acreditan el ciclo guest ni disponibilidad en tiendas.
