# Editor del nombre visible con teclado — 11/10/2026

Solicitud y origen: foto del iPhone del usuario, recibida sin modificar. En LidIA → Historial → editar nombre, el teclado oculta el formulario situado bajo la conversación. La APP conserva desactivado el scroll automático nativo para coordinar la animación del teclado; faltaba desplazar este formulario dentro de `.app-main`.

La corrección desplaza sólo el contenedor del editor al enfocarlo o tocarlo. Observa su altura y la del formulario mientras conserva el foco; adapta el destino durante la transición de 280 ms y mantiene visibles campo, Guardar y Cancelar cuando caben. Con espacio extraordinariamente pequeño prioriza el campo; con movimiento reducido desplaza directamente. Cancela observación/animación al perder foco, cerrar o cambiar de editor. La limpieza usa layout effect para no cancelar el autofocus del formulario nuevo.

No cambia permisos, API de renombrado, título persistido ni asignación. Origen: listado de conversaciones de LidIA o Mensajes, componente común. Cancelar conserva el título y devuelve el foco al botón de editar; Guardar mantiene la acción existente de renombrado de la conversación autorizada. Atrás y navegación conservan sus destinos.

## Pruebas observadas

- Regresión inicial RED: scroll 0 cuando debía ser 552; GREEN mantiene formulario visible, incluido al reducir otra vez la altura.
- Regresión adicional RED de autofocus: el cambio de altura dejaba scroll 552 en vez de 652. GREEN con limpieza previa al nuevo foco y descarte de callbacks antiguos.
- Diez pruebas del componente PASS, incluidos movimiento suave, movimiento reducido, cancelación y autofocus sin segundo toque.
- Suite frontend: 49 archivos, 207 pruebas PASS (`NODE_OPTIONS=--no-experimental-webstorage npm test --prefix frontend`). Build APP PASS.
- Revisión independiente del diff respecto a `53cf052`: sin hallazgos P1/P2; solicita esta documentación y conserva pendiente la aceptación física.

[Captura local](local-altura-reducida.png): componente real en fixture aislada, sin acceso a producción, marco de 390 px y altura reducida a 460 px. Contenedor y69–408; campo y257.38–303.38; acciones y340.18–396.18; scroll339.5. Acredita geometría y foco en navegador, no teclado físico de iPhone. Fotografía original: `/tmp/codex-remote-attachments/01a11b48-bcb4-7611-a73d-2583fc47ddfe/DB0840BB-D5CB-44E9-A0B7-C05C96B74BE7/1-Foto-1.jpg`.

## Distribución

iOS 0.1.0 (11) en preparación; firma, subida, procesamiento, activación TestFlight y aceptación física pendientes hasta observarlos. No se cambia producción ni la base de datos con esta revisión. Play conserva su distribución anterior. Agenda real sigue abierta y su aceptación es independiente de esta corrección visual.


## Distribución observada

Fuente nativa `344b033`, archivada/exportada 0.1.0 (11); codesign --deep --strict PASS, APNs production, perfil Gestadia App Store. Configuración pública y assets idénticos al build preparado. IPA3314271bytes, SHA2565ca9ba1c73704938c6d2fc96f74e009416630bfa6640ecbb0280a2db9ae3e8c3. Xcode confirma [subida completa](xcode-upload11.png); Apple finaliza el procesamiento y Gestadia QA muestra **0.1.0 (11), En pruebas**, con un tester existente. [Estado TestFlight](testflight11.png), [registro de firma](ios-proof.json). El frontend respecto a la (10) sólo incorpora el editor y sus pruebas. Sin cambios de producción o DB. Actualizar desde TestFlight para comprobar el teclado físico; esa aceptación permanece pendiente. Plan Page actualizado y releído, secuencia42.
