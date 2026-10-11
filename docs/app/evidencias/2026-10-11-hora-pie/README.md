# Hora al pie de las burbujas · 11/10/2026

Petición humana: hora inferior derecha; en mensajes propios a la izquierda de los ticks. Ruta real `/lidia/conversacion`, entrada por LidIA/historial, Atrás al origen completo, permisos y acción de envío conservados. También se aplica al gestor por usar ConversationBody.

Se reutilizan bubble-time y bubble-delivery; time conserva ocurrido_at en datetime y muestra la hora local del dispositivo. No se introduce nomenclatura técnica nueva. Las presentaciones quedan antes del pie; los segmentos SPLIT conservan la fecha original. El timestamp claro usa contraste legible, el de mensajes propios/gestor conserva contraste sobre fondo oscuro.

Regresión RED reproduce la ausencia del pie; verificación GREEN incluye fecha original, pie posterior a acciones, ausencia de hora en cabecera y hora anterior al tick real de lectura del fixture. [Medición en navegador](browser-layout.json) y [captura local](burbujas.png) usan AppConversation real con datos controlados, sin enviar mensajes a LidIA. Distribución y despliegue pendientes en este punto; se añadirá evidencia final sin atribuir instalación física a la preparación.
