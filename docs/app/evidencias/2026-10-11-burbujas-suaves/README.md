# Entrada suave de burbujas · 11/10/2026

Petición humana: respuestas de LidIA con burbujas animadas y suaves. Se conserva el diseño aprobado280ms/8px. La regresión RED reproduce la pérdida de animación al llegar una página nueva después de establecer el historial; GREEN conserva las respuestas nuevas y excluye páginas anteriores. Se añaden compatibilidad visual de `[SPLIT]` e identidad/presentación única, sin cambiar datos persistidos o autoridad de herramientas.

195 pruebas frontend/47 archivos pasan. La medición local usa AppConversation real con fetch controlado, sin llamadas al agente ni agenda:67 muestras, opacidad inicial0 y desplazamiento8px, tres segmentos con desfases0/80/160ms; al final opacidad1 y desplazamiento0. Histórico sin animation ni marca de entrada. [Mediciones](browser-motion.json) · [Captura local](burbujas-local.png). Una imagen estática no acredita los tiempos.

Build iOS0.1.0(6), Docker y distribución se encuentran en preparación; se registrará evidencia independiente al completarlos. No se acredita instalación física de(6) con esta prueba local.

## Ampliación: burbujas del cliente

El usuario confirma en iPhone(5) el indicador correcto y precisa que sus burbujas siguen apareciendo de golpe. Prueba local ampliada del componente real:68 muestras de burbuja user y tres segmentos assistant, todos con opacidad0/translateY8px al primer fotograma y opacidad1/translateY0 al final; sólo assistant segmentado lleva desfases0/80/160ms. [Mediciones cliente y LidIA](browser-own-and-assistant.json). La regresión de AppConversation exige también data-motion-new en la burbuja del cliente.

[Movimiento reducido comprobado en navegador](reduced-motion.json): las tres burbujas aparecen con opacidad1, sin transform ni animación/marca nueva. Emulación retirada al terminar. Las herramientas auxiliares se mantienen fuera del paquete; el archivo iOS no incluye fixtures.

## Recarga directa de la conversación web

Durante la verificación conectada se reprodujo503 en `/lidia/conversacion` y `/lidia/conversacion/`: el bloqueo del proxy antiguo `/lidia/` interceptaba una ruta de pantalla. Las tres plantillas Docker sirven el índice APP sólo para esa ruta exacta. `/lidia/api/health` sigue bloqueado503. No se amplía acceso al agente ni al backend. Regresión HTTP RED observada en el servidor antes de corregir la imagen. El contenido nativo de(6) conserva d2f7e00; el nuevo commit de infraestructura identifica la imagen Docker corregida.
