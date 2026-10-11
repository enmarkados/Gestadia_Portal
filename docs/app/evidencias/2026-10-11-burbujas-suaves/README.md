# Entrada suave de burbujas · 11/10/2026

Petición humana: respuestas de LidIA con burbujas animadas y suaves. Se conserva el diseño aprobado280ms/8px. La regresión RED reproduce la pérdida de animación al llegar una página nueva después de establecer el historial; GREEN conserva las respuestas nuevas y excluye páginas anteriores. Se añaden compatibilidad visual de `[SPLIT]` e identidad/presentación única, sin cambiar datos persistidos o autoridad de herramientas.

195 pruebas frontend/47 archivos pasan. La medición local usa AppConversation real con fetch controlado, sin llamadas al agente ni agenda:67 muestras, opacidad inicial0 y desplazamiento8px, tres segmentos con desfases0/80/160ms; al final opacidad1 y desplazamiento0. Histórico sin animation ni marca de entrada. [Mediciones](browser-motion.json) · [Captura local](burbujas-local.png). Una imagen estática no acredita los tiempos.

Build iOS0.1.0(6), Docker y distribución se encuentran en preparación; se registrará evidencia independiente al completarlos. No se acredita instalación física de(6) con esta prueba local.
