# Gestadia para iOS y Android

[Alcance](PRIMERA-VERSION.md) · [Validación](VALIDACION.md) · [Glosario](../../GLOSARIO.md)

Proyectos nuevos generados con Capacitor 8.5.2, siguiendo el patrón de LIA APP. Comparten `frontend/dist-app/` con la web; la interfaz se empaqueta en la app. No se carga una web remota durante el arranque de la demo.

Identificador local propuesto: **com.gestadia.app**. Nombre: Gestadia. Versión: 0.1.0, build 1. No se ha registrado este identificador en cuentas de Apple/Google ni comprobado su disponibilidad.

## Preparar los proyectos

```sh
npm ci --prefix frontend
npm run mobile:sync
npm run mobile:ios
npm run mobile:android
```

`mobile:ios` y `mobile:android` sincronizan el frontend y abren Xcode/Android Studio. Android requiere Java 21 y SDK 36. El proyecto iOS usa Swift Package Manager y el proyecto Xcode está en `frontend/ios/App/App.xcodeproj`, scheme `App`.

Para compilar Android de prueba:

```sh
cd frontend/android
./gradlew assembleDebug
```

APK: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`. Es un APK de desarrollo firmado para pruebas, no un paquete de publicación de Play. El build iOS comprobado es para **simulador**, no una IPA instalable en un iPhone físico.

## Splash y comportamiento nativo

Iconos y splash parten de los recursos del handoff, preparados en `frontend/assets/`. Regenerar con `npm run mobile:assets`. iOS muestra el LaunchScreen de Gestadia; Android usa su splash nativo. `SplashScreen.launchAutoHide=false` mantiene el splash hasta que React ha preparado la interfaz. El splash HTML sirve también a la web y se retira al finalizar el arranque.

El splash tiene fondo `#181818` y el logotipo blanco/rojo centrado, sin «Trámites DGT Online». Los PNG `splash.png` y `splash-dark.png` contienen la composición para los recursos nativos; el arranque de Android 12 y posteriores usa además `drawable/gestadia_splash_logo.png`, adaptado al área central del sistema. La web usa `app/public/brand/gestadia-logo-completo.png`, recortado a los límites visibles del logo oficial `assets/brand/logo-dark.png`.

Atrás en Android cierra primero un diálogo abierto, vuelve por el historial o retorna a Inicio; sólo sale de la app desde Inicio. Los enlaces internos permanecen en el frontend. La demo bloquea navegación y llamadas externas, y el inicio no descarga configuración remota.

## Siguiente fase solicitada

El usuario confirmó que la app se crea desde cero y necesitará toda su infraestructura, pero pidió explícitamente que la **primera versión no conecte nada**. Por tanto, quedan pendientes:

- Identificador registrado, equipo/certificado/perfil de Apple y distribución de prueba a dispositivos físicos.
- Registro y clave de firma de Android, ficha de Google Play y verificación de la cuenta de desarrollador.
- Proyecto Firebase y servicios que se acuerden para la app.
- Base de datos, cuentas reales, recuperación/verificación de acceso y reglas de identidad.
- Conexión IA/gestor con la plataforma LidIA, intervención humana y pruebas separadas por plataforma.

La lógica de conexión preparada en el código permanece desactivada. Antes de habilitarla hay que validar los contratos reales, los timeouts nativos y la identidad del cliente. `AbortSignal` de un fetch web no acredita cancelación del transporte HTTP nativo. [CapacitorHttp](https://capacitorjs.com/docs/apis/http) documenta el transporte nativo y sus timeouts explícitos.
