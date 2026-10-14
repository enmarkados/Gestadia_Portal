# Hora al pie de las burbujas · 11/10/2026

Petición humana: hora inferior derecha; en mensajes propios a la izquierda de los ticks. Ruta real `/lidia/conversacion`, entrada por LidIA/historial, Atrás al origen completo, permisos y acción de envío conservados. También se aplica al gestor por usar ConversationBody.

Se reutilizan bubble-time y bubble-delivery; time conserva occurred_at en datetime y muestra la hora local del dispositivo. No se introduce nomenclatura técnica nueva. Las presentaciones quedan antes del pie; los segmentos SPLIT conservan la fecha original. El timestamp claro usa contraste legible, el de mensajes propios/gestor conserva contraste sobre fondo oscuro.

Regresión RED reproduce la ausencia del pie; verificación GREEN incluye fecha original, pie posterior a acciones, ausencia de hora en cabecera y hora anterior al tick real de lectura del fixture. [Medición en navegador](browser-layout.json) y [captura local](burbujas.png) usan AppConversation real con datos controlados, sin enviar mensajes a LidIA. Distribución y despliegue pendientes en este punto; se añadirá evidencia final sin atribuir instalación física a la preparación.


## Despliegue web verificado

Fuente 599c6e9, 196/196 pruebas frontend en 47 archivos. APP Docker importada con Config SHA256 97db47e54981198743ce1016af8938a0894134e0bac0e70be94ea1e031924acb. Stack 73 saludable y YAML guardado idéntico al previsto; backend cf68661 y Portal be6806d permanecen. Build-info público y CSS SHA256 2acdcea08664a998cb56db91e19cae9925c5fe16a5be7d6d7c5ae78e5d7e3024 coinciden con el archivo nativo. Recarga directa del chat 200. La conversación real cargó 36 burbujas: una hora al pie de cada una, ninguna en cabecera; ticks propios recibidos por LidIA proceden del servidor. [Lectura real](live-layout.json) · [Servidor saludable](portainer-healthy.png) · [Assets](public-proof.json).

Copia nueva message-footer-build7-20261011: SQL 269743 bytes, SHA256 e705d9750e9ac55f9edb422272a26f79aabc1fc4dd3616051990370d5789728b; 45 usuarios, 94 expedientes, 14 documentos y 13 migraciones. RESTORE PASS sin red y archivos byte a byte antes del despliegue. Sin migraciones ni borrados. [Resumen](backup-proof.json).

El usuario confirma físicamente en (6): «ahora si entran los mensajes suaves». Esta aceptación corresponde al movimiento previo; la hora nueva exige actualizar a (7). Archivo/export iOS (7) correctos y firma estricta verificada; Xcode confirma subida completa. Activación TestFlight y aceptación física aún pendientes en este punto. Play interno permanece en (3).


## TestFlight (7) disponible

Apple ha procesado la build 2ecf0891-ddc7-4b30-8456-01fae9f31128. Gestadia QA (un tester) muestra 0.1.0 (7) «En pruebas» y notas guardadas. [Captura de distribución](testflight-7-en-pruebas.png). Apple muestra (6) instalada, coincidiendo con la aceptación humana de burbujas suaves. Hora en iPhone (7) pendiente de actualizar y aceptar. No hay cambios de agenda, CRM, OAuth ni APNs en este bloque.
