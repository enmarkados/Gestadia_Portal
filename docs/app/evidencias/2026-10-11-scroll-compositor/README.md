# Desplazamiento al tocar el compositor · 11/10/2026

Petición humana: tocar el input debe llevar abajo la conversación. La causa era la ausencia de manejadores de foco/click; el efecto existente sólo respondía al historial y mensajes nuevos.

`useComposerAutoScroll` anima durante 280 ms con desaceleración y recalcula el fondo real en cada fotograma. Observa cambios de altura mientras el campo tiene foco para acompañar la apertura del teclado. Otro click en el campo enfocado vuelve al fondo. Al desenfocar, cambiar de conversación o desmontar, cancela la animación y el observador. Reducir movimiento desplaza inmediatamente; el usuario puede recorrer el historial después sin fijarlo permanentemente al fondo.

Pantalla `/lidia/conversacion` (cuenta o visitante habilitado) y conversaciones de gestor. Origen: LidIA, historial o expedientes, según recorrido existente. Atrás conserva el origen; permisos y envío siguen resueltos por el servidor. La acción final de este cambio sólo desplaza la vista, sin enviar un mensaje ni ejecutar reservas. Los pies con hora/ticks y las entradas suaves previas se conservan.

Verificación: 200 pruebas frontend en 48 archivos, incluyendo foco/click con compositor en portal externo, resize, movimiento reducido y cancelación. Prueba de navegador local con componentes reales y respuestas de prueba aisladas: scroll 0→2682; reducción animada de altura 718→394 px acaba en fondo3006. Los samples acreditan fotogramas intermedios, no sólo el estado final. Esta prueba no reproduce un teclado nativo físico.

Estado de distribución: preparación de iOS0.1.0(8) y actualización Docker; no afirmar disponibilidad hasta comprobar ambas. La aceptación física de la versión8 continúa pendiente.
