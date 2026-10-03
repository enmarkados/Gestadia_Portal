# Validación de Gestadia App — 3 de octubre de 2026

[Alcance](PRIMERA-VERSION.md) · [Docker y Plesk](DOCKER-PLESK.md) · [Móvil](MOBILE.md) · [Glosario](../../GLOSARIO.md)

Rama `app/main` creada desde `main`, revisión de partida `af5b515`. La entrega es una **demostración sin conexiones externas**, por la última instrucción del usuario. No requiere cuentas reales, Firebase, base de datos o key de LidIA.

## Pruebas y builds

- `npm test --prefix frontend`: **71/71 pruebas**, 26 archivos. Incluye las 40 pruebas existentes del portal y 31 de la app.
- `npm run app:build` y `npm run mobile:sync`: build y sincronización de los proyectos correctos. El portal conserva su build independiente y también se construyó correctamente con `npm run build`.
- Los tests comprueban acceso y registro locales sin persistir contraseñas, bloqueo de peticiones/navegación externa y reconocimiento de voz en demo, descarte de sesiones reales antiguas y cierre interno del servicio de ejemplo. El micrófono de la app no inicia un servicio de dictado en esta entrega.
- La lógica futura de conexión tiene pruebas controladas de aislamiento de credenciales, rechazo de respuestas de sesiones antiguas, recuperación de mensajes tras errores sin reenvío automático, campos opcionales y normalización de países. No acredita una conversación real ni permite habilitarla sin las comprobaciones de la siguiente fase.

## Docker y navegador

- Ajustes posteriores al handoff: Mensajes conserva un único CTA rojo, tarjetas de nueva consulta e hilos, y el panel de gestor entra desde abajo con indicador, chat negro, separador y sólo nombre/teléfono. Se quitaron la franja global de demo y los bloques añadidos de Inicio, conservando el selector de perfil arriba en Mi cuenta. El compositor de LidIA se sitúa bajo el CTA, con medidas y flecha diagonal del handoff; se omiten «de guardia», el CTA en Servicios y el rótulo «Sondeo guiado». La llamada permanece local y su conexión futura está pendiente.
- Inicio conserva el titular, párrafo y las tres opciones del diseño. Notificaciones usa el panel inferior con campana, contador de prioridad, aviso rojo suave, tarjeta de asignación y cierre negro; el enlace documental abre el expediente local y cierra el panel, verificado sin peticiones. Los identificadores siguen siendo ficticios y se omiten horas que no existen en los datos.
- El menú inferior conserva su fondo blanco, borde superior y sombra suave, separado de la zona gris claro del CTA y el compositor.
- El chat de Juan Carlos usa la cabecera negra de conversación, vuelta a Mensajes, llamada y etiqueta del expediente. Comparte el componente de entrada con LidIA, con micrófono y envío diagonal; se retiró el bloque naranja de demostración. El envío queda guardado únicamente en el ejemplo local, y el dictado permanece desactivado, verificado por tests.
- La conversación de muestra incluye burbujas negras/rojas, autor, horas ficticias y tarjeta con tres botones «Subir». Cada botón abre y enfoca el documento correspondiente del expediente local. Al entrar se muestra el inicio; al enviar un mensaje nuevo se desplaza al final. Las demos antiguas actualizan el guion conservando perfil, archivos seleccionados y mensajes escritos, sin duplicar el historial en la siguiente carga.
- Verificación usa cabecera negra con número de expediente y título, campos personales compactos, tarjetas documentales discontinuas con botones negros y «Validar y Enviar» rojo. Comprueba los documentos seleccionados, conserva los datos revisados y regresa al chat con confirmación local, sin transmisión. No muestra los antiguos accesos a Mi cuenta y contacto al final de esta pantalla.
- Acceso muestra «¿Has olvidado tu contraseña?» centrado en negro; acceso y registro permiten alternar la visibilidad de contraseña mediante ojo/ojo tachado. Los campos y compositores enfocados destacan en negro. Se verificaron colores y comportamiento en navegador.

- Imagen `gestadia-app:2026-10-03` construida para **linux/amd64**. Contenedor local en `http://127.0.0.1:8099/`; `nginx -t` correcto y `/healthz` identifica la app.
- Configuración servida: `demoEnabled: true`, `demoOnly: true`, key vacía. `/api/health` y `/lidia/api/pluginweb/config` devuelven **503**, sin consultar upstreams.
- La app entra directamente en la demo. Acceso con datos de ejemplo regresa a Inicio; registro genera un perfil ficticio lead y muestra «Estás al día», sin indicador rojo en la campana.
- Servicios termina en «Revisa tu servicio» dentro de la app. No abre el checkout real ni realiza pagos.
- Sondeo de canje, checklist, selección de documento y mensajes con gestor funcionan como ejemplos locales. La selección documental conserva únicamente el nombre, sin almacenar ni subir el contenido.
- Sin desbordamiento horizontal en 390×844, 768×1024 y 1440×900. Capturas en `output/playwright/gestadia-app-{movil,tablet,escritorio}.jpg`; acceso y registro en `gestadia-app-{acceso,registro}.jpg`.

El aviso de Vite sobre `app-config.js` es esperado: la configuración pública se carga antes del módulo React y Docker la genera al arrancar, fuera del bundle.

## iOS

Build **0.1.0 (1)**, `com.gestadia.app`, compilado, instalado y arrancado mediante XcodeBuildMCP en **iPhone 17 / iOS 26.5**, simulador `96BE5D86-6CD4-4AF4-96B2-1B402FF181D3`. Frontend empaquetado; no descarga configuración al iniciar la demo.

Capturas de splash e Inicio: `output/playwright/gestadia-ios-splash.png` y `gestadia-ios-inicio.jpg`. El splash nativo se oculta al preparar la interfaz. Se corrigieron el desplazamiento inicial y el color heredado de los botones en iOS.

Esta evidencia corresponde al **simulador**. No se ha generado una IPA para dispositivos físicos, firmado para distribución ni publicado en TestFlight/App Store.

## Android

Build **0.1.0 (1)**, `com.gestadia.app`, `./gradlew assembleDebug` correcto. APK instalado y arrancado en **Pixel 8 / API 36**, emulador temporal con `-read-only -no-snapshot-load -no-snapshot-save`.

Verificados splash, Inicio, navegación interna a Mi cuenta, apertura de contacto y botón Atrás que cierra el diálogo manteniendo la app abierta. Capturas `output/playwright/gestadia-android-{arranque,inicio,cuenta,contacto,atras}.png`.

El renderizador de software del emulador produjo una cabecera incompleta y restos de pintura. Al ejecutar el mismo APK con `-gpu host`, las pantallas se muestran correctamente. No se alteró el código de la app para compensar ese fallo del emulador.

El APK entregable `artifacts/gestadia-app-0.1.0-android-demo.apk` es de **desarrollo**, firmado para pruebas. No se ha publicado en Google Play ni probado en un Android físico.

## Entregables y siguientes fases

- Código en `app/main`; proyectos web, iOS y Android y guía de reconstrucción.
- Imagen importable en Portainer: `artifacts/gestadia-app-2026-10-03-linux-amd64.tar.gz`, con suma SHA-256. Stack en `deploy/app/portainer-stack.yml`.
- Publicación en `app.gestadia.com`: **pendiente** de importar y desplegar el stack en el servidor y configurar el subdominio HTTPS de Plesk. La ejecución local no acredita publicación.
- Certificados, registros de Apple/Google, Firebase, base de datos, cuentas y conexiones IA/gestor corresponden a la fase posterior solicitada. No se han creado ni conectado en esta demo.

No se han efectuado pagos, envíos al CRM, cargas documentales reales ni conversaciones con el agente o el gestor de la plataforma.
