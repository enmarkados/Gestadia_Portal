# Desplazamiento al tocar el compositor · 11/10/2026

Petición humana: tocar el input debe llevar abajo la conversación. La causa era la ausencia de manejadores de foco/click; el efecto existente sólo respondía al historial y mensajes nuevos.

`useComposerAutoScroll` anima durante 280 ms con desaceleración y recalcula el fondo real en cada fotograma. Observa cambios de altura mientras el campo tiene foco para acompañar la apertura del teclado. Otro click en el campo enfocado vuelve al fondo. Al desenfocar, cambiar de conversación o desmontar, cancela la animación y el observador. Reducir movimiento desplaza inmediatamente; el usuario puede recorrer el historial después sin fijarlo permanentemente al fondo.

Pantalla `/lidia/conversacion` (cuenta o visitante habilitado) y conversaciones de gestor. Origen: LidIA, historial o expedientes, según recorrido existente. Atrás conserva el origen; permisos y envío siguen resueltos por el servidor. La acción final de este cambio sólo desplaza la vista, sin enviar un mensaje ni ejecutar reservas. Los pies con hora/ticks y las entradas suaves previas se conservan.

Verificación: 200 pruebas frontend en 48 archivos, incluyendo foco/click con compositor en portal externo, resize, movimiento reducido y cancelación. Prueba de navegador local con componentes reales y respuestas de prueba aisladas: scroll 0→2682; reducción animada de altura 718→394 px acaba en fondo 3006. Los samples acreditan fotogramas intermedios, no sólo el estado final. Esta prueba no reproduce un teclado nativo físico.

Fuente b7f1951. Docker APP desplegado con esa imagen; stack exacto conservado y los tres servicios saludables. El JS público index-BmDsgbYH.js coincide byte a byte con el build y los recursos empaquetados en iOS. Navegador autenticado: historial top 0 → pulsar «Tu consulta» → top 5267.5 / max 5268 (redondeo subpíxel), sin enviar un turno. [Prueba pública](public-proof.json) · [scroll real](live-scroll.json) · [stack](portainer-healthy.png).

Copia previa composer-scroll-build8-20261011: SQL 269743 bytes, SHA256 b1fb6924b35a19c17ece158638bc68c3e5bf86c24eecf303cd8c8b23d66ce40a;45 usuarios / 94 expedientes / 14 documentos / 13 migraciones. Restauración SQL sin red y archivos byte a byte PASS, jobs exit 0. Producción no borrada ni migrada. [Resumen](backup-proof.json).

iOS 0.1.0 (8) archivada y exportada correctamente, codesign estricto verificado, recursos coincidentes y subida completa en Xcode 16:32. Apple ha procesado la build y está «En pruebas» en Gestadia QA, con notas guardadas. La aceptación del teclado y scroll en el iPhone continúa pendiente. [Disponibilidad](testflight8.png) · [estado de grupo](testflight-state.txt). [Firma y recursos](ios-proof.json). Play conserva build3. OAuth/APNs y agenda/CRM siguen sus comprobaciones independientes.


Artifact del plan actualizado y releído: secuencia40, fases4/8/9 y revisión de scroll. Código fuente b7f1951; el commit documental de cierre no cambia recursos.
