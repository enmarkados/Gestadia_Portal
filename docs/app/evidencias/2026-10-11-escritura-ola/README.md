# Indicador de escritura con ola · 11/10/2026

Petición expresa: «LidIA está escribiendo» en negrita, entrada/salida suave y puntos finales en ola secuencial. Sustituye la presentación en cursiva de la revisión anterior. No modifica pantalla, origen, permisos, destino de Atrás ni acción final; no modifica llamadas, reservas ni el contrato del agente.

La aparición anterior montaba directamente el párrafo y no definía una transición de entrada/salida. LidiaTypingIndicator mantiene la salida durante 280 ms; deja de anunciar escritura al responder y se retira al terminar. Entrada y salida usan opacidad/desplazamiento corto. Texto en peso 700, pulso suave 1800 ms; tres puntos de 20 px, subida 5 px, ciclo 1400 ms y desfases 0/200/400 ms. Preferencia de movimiento reducido: sin animación y retirada inmediata.

## Evidencia local

- Dos regresiones primero RED y después GREEN: negrita semántica y permanencia/retirada durante la salida.
- Suite frontend: 192 pruebas en 47 archivos, todas correctas. Tres avisos históricos JSDOM de navegación externa en CheckoutForm no son fallos.
- Navegador real: componente y CSS del producto mediante una presentación temporal local sin API ni mensajes enviados. [Captura](indicador-local.png) y [estilos/18 muestras de movimiento](browser-motion.json). Peso 700, entrada 0,28 s y elevaciones diferentes observadas de cada punto en secuencia. Salida lidia-typing-exit 0,28 s, aria-hidden y retirada final comprobadas.
- Emulación prefers-reduced-motion: reduce comprobada: raíz y tres puntos animation:none, transform:none; retirada inmediata. Emulación restaurada tras comprobarla.
- La presentación temporal se conserva exclusivamente en artifacts ignorados; no se incluye en el paquete distribuido.

## Distribución

Fuente e73665f subida a codex/gestadia-marketplaces. Archivo y exportación iOS correctos; IPA com.gestadia.app 0.1.0 (5), equipo X27NG7M487, APNs production, Apple Default, get-task-allow false. codesign estricto válido; CSS nuevo incluido y presentación temporal excluida. IPA 3309743 bytes, SHA-256 dcde374772bf08c1aa0d05cbb15754eb6e20be80c547249864702517c9748f52. Xcode confirma Uploaded; Apple procesó la build d74b12a2-3c1c-436c-adaa-ba50b1419846. Gestadia QA la muestra [En pruebas](testflight-5-en-pruebas.png), un tester existente y notas guardadas. Apple acredita (4) instalada en iPhone 13 Pro Max; instalación y aceptación física de (5) pendientes. Play conserva (3), no se ha distribuido un Android nuevo con este cambio.

Antes del despliegue se ejecutó copia typing-wave-build5-20261011 en la custodia privada del servidor: SQL 251233 bytes, SHA-256 eba347436ee2db2f700a1af9f88ddc99c71f0dd93658e7fcea881eb10af1caee; 45 usuarios, 94 expedientes, 14 documentos, 13 migraciones. Restauración real sin red con 24 tablas OK; configuración, claves y documentos comparados byte a byte, ambos servicios terminaron 0. No se modificó la BD con esta actualización.

Imagen APP e73665f AMD64 importada, config digest c9b4a378733c74fc5bbb1847e02cb869581cb1e7862da1bdc99742fc1639d37b coincide con el tar local. Stack 73 conserva backend cf68661 y Portal be6806d; [tres servicios saludables](portainer-desplegado.png). APP pública sirve build-info e73665f y /assets/index-yf3HPsv7.css con el indicador nuevo; SHA-256 CSS 6f2b22427bce46cf482bd118b9dcf921ec75d320b1027a21cfe652582c4cdc23.

## Incidencias trasladadas a LidIA

Por autorización humana se enviaron al chat Gestadia_LidIA - Actualizar rama dev/IA/main los reportes de [SPLIT] visible, disponibilidad bloqueada y acceso denegado para usuario de integraciones. La conversación real abierta en APP reproduce visualmente los separadores y las respuestas que prometen llamada y citan WhatsApp. Correlación obtenida con consultas SELECT, sin reenviar turnos ni ejecutar agenda; conserva logs en artifacts privados ignorados. Diagnóstico/corrección de runtime LidIA siguen en ese chat: no se atribuyen como resueltos a build (5).
