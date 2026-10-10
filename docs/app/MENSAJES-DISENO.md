# Mensajes: lista compacta

Fecha: 7 de octubre de 2026. Alcance: listado conectado de la APP.

## Problema observado

La captura del usuario y la pantalla servida muestran accesos nuevos sobredimensionados, un bloque descriptivo que retrasa el listado y tarjetas con fechas y una acción de renombrado que consumen casi toda la pantalla. El botón fijo de contacto duplica el acceso del propio listado.

## Dirección y criterios

Se conserva el sistema de Gestadia: negro de cabecera `#181818`, texto `#2c2c2c`, acento `#c0392b`, blanco `#ffffff`, fondo `#f7f7f7`, texto secundario `#636b78` y borde `#e5e7eb`. Tipografía de sistema en controles y contenido; marca existente. Alineación izquierda, filas pequeñas, separación de 8 px, bordes suaves y sin sombras decorativas. Los accesos nuevos comparten una sola línea y el buscador queda inmediatamente bajo el título. Se descarta un panel grande por conversación porque la tarea es recorrer y abrir chats.

Cada fila contiene el nombre, identidad del interlocutor, estado explícito y las dos fechas. El nombre largo se limita visualmente a una línea y conserva el texto completo en el enlace accesible y su título. El lápiz despliega sólo la edición seleccionada, sin ocupar otra línea en todos los chats. El contacto mantiene su ruta y origen; el dock inferior queda visible, sin el CTA fijo redundante.

Los estados abiertos, cerrados y sin actualizar mantienen su semántica del contrato. No se deduce actividad a partir de un cambio de nombre ni se presenta un fallo de metadatos como un chat abierto.

## Comprobación de diseño e interacción

1. Listado web a 1280×720 y 368×800: tres chats visibles, sin desbordamiento horizontal; nombre, estado y fechas en filas compactas.
2. Buscar «Atencion», limpiar y regresar al listado: funciona; el foco vuelve al buscador. La búsqueda sin coincidencias muestra una respuesta explícita.
3. Abrir edición y cancelar: sólo se despliega la fila elegida; el nombre se mantiene y el foco vuelve al lápiz. Guardado y error conservando el borrador cubiertos por pruebas de componente.
4. Simulador iPhone 17 / iOS 26.5: versión reconstruida e instalada; tres chats completos visibles. Búsqueda con teclado físico y teclado nativo abiertos, limpieza y ocultación del teclado verificadas.
5. Apertura del historial humano «Atencion iOS» y Atrás: conserva el chat cerrado y devuelve al listado de Mensajes. No se envían nuevos mensajes durante esta revisión visual.

Suite APP: 87 pruebas aprobadas en 11 archivos. Build web/nativo aprobado; sincronización Capacitor y `build_run_sim` aprobados, proceso 67099. Contraste calculado: texto secundario sobre blanco 5,38:1; estado abierto 6,52:1; estado pendiente 6,06:1 (AA). Los controles individuales tienen al menos 44 px de superficie pulsable.

No se afirma auditoría completa de VoiceOver ni validación visual Android en este bloque; Android conserva los mismos assets sincronizados y su comprobación de interfaz permanece pendiente.

## Capturas

- [Antes, escritorio](evidencias/2026-10-07-mensajes/antes-escritorio.jpg).
- [Después, escritorio](evidencias/2026-10-07-mensajes/despues-escritorio.jpg).
- [Después, móvil](evidencias/2026-10-07-mensajes/despues-movil.jpg).
- [Simulador iOS](evidencias/2026-10-07-mensajes/ios-listado-compacto.jpg).

## Resultado

Aprobado para este rediseño local: densidad, estado, fechas, búsqueda, edición y retorno conservados. Ver [GLOSARIO](../../GLOSARIO.md) y [mapa de navegación](NAVEGACION.md).
