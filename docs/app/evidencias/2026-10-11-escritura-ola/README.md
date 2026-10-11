# Indicador de escritura con ola · 11/10/2026

Petición expresa: «LidIA está escribiendo» en negrita, entrada/salida suave y puntos finales en ola secuencial. Sustituye la presentación en cursiva de la revisión anterior. No modifica pantalla, origen, permisos, destino de Atrás ni acción final; no modifica llamadas, reservas ni el contrato del agente.

La aparición anterior montaba directamente el párrafo y no definía una transición de entrada/salida. LidiaTypingIndicator mantiene la salida durante 280 ms; deja de anunciar escritura al responder y se retira al terminar. Entrada y salida usan opacidad/desplazamiento corto. Texto en peso700, pulso suave1800ms; tres puntos de20px, subida5px, ciclo1400ms y desfases0/200/400ms. Preferencia de movimiento reducido: sin animación y retirada inmediata.

## Evidencia local

- Dos regresiones primero RED y después GREEN: negrita semántica y permanencia/retirada durante la salida.
- Suite frontend: 192 pruebas en47 archivos, todas correctas. Tres avisos históricos JSDOM de navegación externa en CheckoutForm no son fallos.
- Navegador real: componente y CSS del producto mediante una presentación temporal local sin API ni mensajes enviados. [Captura](indicador-local.png) y [estilos/18 muestras de movimiento](browser-motion.json). Peso700, entrada0,28s y elevaciones diferentes observadas de cada punto en secuencia. Salida lidia-typing-exit0,28s, aria-hidden y retirada final comprobadas.
- Emulación prefers-reduced-motion: reduce comprobada: raíz y tres puntos animation:none, transform:none; retirada inmediata. Emulación restaurada tras comprobarla.
- La presentación temporal se conserva exclusivamente en artifacts ignorados; no se incluye en el paquete distribuido.

## Distribución

Build iOS0.1.0(5) en preparación. Esta evidencia local no acredita despliegue web, subida/activación TestFlight ni aceptación física del iPhone. Se registrarán por separado al verificarlos.
