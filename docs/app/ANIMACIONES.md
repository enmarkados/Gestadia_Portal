# Movimiento de Gestadia APP

11/10/2026. Implementación solicitada por el usuario a partir de la propuesta LIA. [Manual](MANUAL-DESARROLLO.md) · [Mapa](NAVEGACION.md) · [Glosario](../../GLOSARIO.md).

## Plan y criterio

1. Mantener paleta, tipografía, rutas, permisos y cabecera Gestadia existentes. Sólo el contenido se desplaza: 12 px horizontal en avance/regreso, 8 px en mensajes y 24 px desde abajo en paneles.
2. Usar 280 ms y desaceleración suave para entradas/salidas. Pulsación breve de 120 ms, sin rebote ni animaciones continuas.
3. Acceso→registro avanza; registro→acceso, Atrás contextual e historial del navegador expresan el regreso. La capa de movimiento no vuelve a animar ni remonta la pantalla al cambiar parámetros de una misma ruta.
4. Cuenta aparece junto al botón que la abre, con desplazamiento de 6 px y origen anclado. Contacto/Notificaciones continúan como paneles inferiores. Al cerrar se conserva el diálogo hasta terminar la salida y se devuelve el foco; navegar desde Cuenta espera ese cierre.
5. Mensajes nuevos entran una vez. La carga inicial, recuperación y páginas anteriores se muestran directamente; cambios de recibos/presentación no repiten la entrada.
6. Con `prefers-reduced-motion: reduce`, entrada, salida y pulsación se muestran directamente; no esperar 280 ms para navegar/cerrar. Cambiar esa preferencia durante una transición cancela el movimiento.
7. Verificar regresiones APP/build y navegador móvil/escritorio: direcciones, anchura, geometría de cabecera, menú anclado, Escape/foco, cierre, mensajes nuevos/historial y movimiento reducido. Guardar capturas nuevas y evidencia de tiempos; una captura estática no acredita duración.

## Resultado de esta revisión

Implementado y comprobado en la rama `codex/app-motion-280`, partiendo de `app/main` 2ff1d45. No cambia rutas, permisos, backend/API o el comportamiento del agente. La prueba conectada 119 anterior mantiene su SHA y evidencia propia.

- **160 pruebas frontend en 34 archivos aprobadas**; incluye 8 regresiones de movimiento: avance/POP, conservar DOM y borrador, cambio de preferencia en curso, cierre/foco, cancelar continuaciones al cambiar de ruta, mensajes nuevos, historial y páginas anteriores. [Resumen de la suite](evidencias/2026-10-11-movimiento/tests-summary.log).
- **Build APP correcto y sincronización Capacitor iOS/Android correcta**. Los hashes de los assets copiados coinciden con el build. [Build](evidencias/2026-10-11-movimiento/build-app.log) · [sync](evidencias/2026-10-11-movimiento/capacitor-sync.log) · [manifest con versión base y hashes del código](evidencias/2026-10-11-movimiento/manifest.json). Los recursos nativos son generados/ignorados por Git y se regeneran antes de compilar.
- **Navegador servido en modo demo:** 15 rutas × 320/390/1280 px, 45 inspecciones sin desbordamiento horizontal del documento, main ni contenido. Sin errores de consola; dos avisos de React Router sobre sus futuras opciones. [Mediciones completas](evidencias/2026-10-11-movimiento/motion-audit.json).
- Avance y regreso observados con **280 ms y ±12 px**; geometría de cabecera idéntica en acceso/registro (390 × 69 px, y=0). Paneles: 280 ms/24 px; menú junto al icono (posición final y=64, 8 px por debajo del control). Escape conserva el diálogo durante la salida y devuelve foco a Mi cuenta; cierre normal medido 295 ms incluida coordinación del navegador.
- Dos mensajes nuevos de la demo: animaciones activas de 280 ms/8 px. Tras recargar, el historial conservado se muestra sin marcas de entrada. Los cambios de recibos y las páginas anteriores también están cubiertos por regresión. Pulsación: 120 ms/escala 0.98.
- Con movimiento reducido: menú/fondo/mensajes sin animaciones, navegación sin llamada a animate y cierre inmediato (5 ms medidos); pulsación sin transición ni escala. También se prueba activar la preferencia durante una transición/cierre y volver a desactivarla sin reproducir mensajes ya vistos ni recibidos mientras estaba activa.

No se instala ni acredita el movimiento de esta revisión en un iPhone físico o emulador. Las comprobaciones nativas anteriores corresponden a otras versiones; tampoco se atribuye este barrido demo al ciclo remoto del 119.

## Capturas de la APP servida

390 × 844: [acceso](evidencias/2026-10-11-movimiento/auth-mobile.png), [Cuenta junto al origen](evidencias/2026-10-11-movimiento/menu-mobile.png), [panel inferior](evidencias/2026-10-11-movimiento/panel-mobile.png), [mensajes nuevos](evidencias/2026-10-11-movimiento/chat-mobile.png). Escritorio 1280 × 900: [Cuenta](evidencias/2026-10-11-movimiento/menu-desktop.png). Las imágenes se toman tras terminar la entrada; los tiempos se acreditan con mediciones de animaciones, no con capturas estáticas.

## Cómo mantenerlo y comprobarlo

- `motion.jsx` concentra duración, dirección de navegación, preferencia, cierre y mensajes nuevos. `app.css` contiene keyframes/tokens y exclusión de movimiento reducido, incluyendo pseudoelementos/backdrop. Evitar duplicar rutas interactivas para simular una salida.
- Mantener `PageMotion` dentro de main y cabecera/dock fuera. Los selectores de pantalla parten de `.app-main > .page-motion > ...`; al añadir una pantalla, conservar anchuras/padding y comprobar que la animación no introduce scroll lateral.
- Cuenta usa presentación menu y su referencia de icono; Contacto/Notificaciones usan panel. Escape, X y fondo llaman al mismo cierre. Las acciones de Cuenta/Contacto navegan tras salir; los enlaces de Notificaciones conservan su navegación normal y cancelan la superficie al cambiar de ruta.
- Pasar a `useMessageMotion` el historial ordenado y una señal de recuperación completa. No animar por cambios de recibo, polling, páginas anteriores o cambios de query; el cuerpo nunca se remonta para reproducir una entrada.

Desde la raíz:

```sh
NODE_OPTIONS=--no-experimental-webstorage npm test --prefix frontend
npm run app:build
npm run mobile:sync
```

Arrancar con `npm run app:dev` y recorrer acceso→registro→regreso, Cuenta→X/Escape→Perfil, Notificaciones/Contacto, mensaje nuevo y recarga. En el navegador activar también la emulación `prefers-reduced-motion: reduce`; en iOS/Android revisar la preferencia de accesibilidad del sistema con un nuevo build. Registrar su evidencia por separado y actualizar [mapa](NAVEGACION.md), [manual](MANUAL-DESARROLLO.md) y esta guía junto al cambio.

## Candidato nativo con escritura y teclado · 11/10/2026

El usuario confirma el diseño «LidIA está escribiendo…» y solicita que la versión instalada incluya las animaciones del otro chat. La integración marketplace incorpora d3ca03c conservando el acceso real, botones oficiales y retirada de demostraciones. La build TestFlight 0.1.0 (1), fuente 82d011a, es anterior al movimiento; sincronizar Capacitor no actualiza un binario instalado.

El indicador aparece bajo los mensajes durante el envío o un recibo remoto accepted/processing. Desaparece con respuesta/recibo terminal o error; una operación incierta mantiene su recuperación, sin afirmar escritura. Atención humana no muestra este indicador. Tres puntos animados en cursiva; movimiento reducido deja los puntos estáticos.

La investigación del teclado iOS identifica en Keyboard 8.0.6 un resize native diferido por la duración del teclado + 0,2 s. GestadiaViewController comunica geometría y duración desde keyboardWillChangeFrame; resize none evita el segundo ajuste. El contenedor común mueve campo y menú en una única transición de altura. Se traducen las curvas UIKit estándar; para curvas especiales se usa ease-in-out. No se afirma igualdad de curvas spring ni aceptación física antes de la prueba del iPhone. Android conserva el ajuste del sistema.

Verificación local: seis regresiones nuevas de escritura/teclado, primero RED y después GREEN; suite frontend 178/178 en 43 archivos. La suite también imprime tres avisos históricos de JSDOM sobre navegación externa en CheckoutForm; no son pruebas fallidas. Se preparará build iOS 0.1.0 (2) para actualizar TestFlight. La recepción APNs y fluidez física continúan pendientes; el emulador LIA ajeno se conserva y no se arranca otro.
