# Entrada suave de burbujas · 11/10/2026

Petición humana: respuestas de LidIA con burbujas animadas y suaves. Se conserva el diseño aprobado280ms/8px. La regresión RED reproduce la pérdida de animación al llegar una página nueva después de establecer el historial; GREEN conserva las respuestas nuevas y excluye páginas anteriores. Se añaden compatibilidad visual de `[SPLIT]` e identidad/presentación única, sin cambiar datos persistidos o autoridad de herramientas.

195 pruebas frontend/47 archivos pasan. La medición local usa AppConversation real con fetch controlado, sin llamadas al agente ni agenda:67 muestras, opacidad inicial0 y desplazamiento8px, tres segmentos con desfases0/80/160ms; al final opacidad1 y desplazamiento0. Histórico sin animation ni marca de entrada. [Mediciones](browser-motion.json) · [Captura local](burbujas-local.png). Una imagen estática no acredita los tiempos.

La evidencia de distribución y despliegue de esta revisión figura a continuación; las mediciones locales no acreditan instalación física de(6).

## Ampliación: burbujas del cliente

El usuario confirma en iPhone(5) el indicador correcto y precisa que sus burbujas siguen apareciendo de golpe. Prueba local ampliada del componente real:68 muestras de burbuja user y tres segmentos assistant, todos con opacidad0/translateY8px al primer fotograma y opacidad1/translateY0 al final; sólo assistant segmentado lleva desfases0/80/160ms. [Mediciones cliente y LidIA](browser-own-and-assistant.json). La regresión de AppConversation exige también data-motion-new en la burbuja del cliente.

[Movimiento reducido comprobado en navegador](reduced-motion.json): las tres burbujas aparecen con opacidad1, sin transform ni animación/marca nueva. Emulación retirada al terminar. Las herramientas auxiliares se mantienen fuera del paquete; el archivo iOS no incluye fixtures.

## Recarga directa de la conversación web

Durante la verificación conectada se reprodujo503 en `/lidia/conversacion` y `/lidia/conversacion/`: el bloqueo del proxy antiguo `/lidia/` interceptaba una ruta de pantalla. Las tres plantillas Docker sirven el índice APP sólo para esa ruta exacta. `/lidia/api/health` sigue bloqueado503. No se amplía acceso al agente ni al backend. Regresión HTTP RED observada en el servidor antes de corregir la imagen. El contenido nativo de(6) conserva d2f7e00; el nuevo commit de infraestructura identifica la imagen Docker corregida.

## Despliegue y distribución verificados

- Fuente de la APP nativa: d2f7e00. Archivo0.1.0(6), bundle com.gestadia.app, firma codesign estricta correcta, cifrado no exentofalse; archivo y export correctos. Apple confirma Uploaded y Gestadia QA «En pruebas» con un tester, y notas guardadas. [Firma/paquete](ios-proof.json) · [TestFlight](testflight-6-en-pruebas.png). El usuario confirma el indicador correcto en(5); Apple acredita(5) instalada. Instalación/fluidez física de(6) pendientes. Play interno conserva(3).
- Imagen Docker final gestadia-app:6bd220c, Config SHA25659db48ad03b48f87436e182256e472394d375e1c404971afbc5cdc1568621575. Backendcf68661 y Portalbe6806d conservados; tres contenedores saludables, stack73. YAML final coincide exactamente con el preparado. [Captura final](portainer-final-healthy.png) · [Versión/asset servido](public-final-proof.json). El CSS de la conversación web coincide por SHA256 con el archivo nativo(6).
- Regresión HTTP pasa en Docker local y servidor: conversación directa200 y cache no-cache, antiguo endpoint `/lidia/api/health` bloqueado503. Sesión autenticada real:36 burbujas, `[SPLIT]` ausente, historial sin marcas de entrada. No se envía ningún turno ni se solicita agenda en esa validación.
- Copia nueva en servidor: message-bubbles-build6-20261011, completada13:45:47UTC, SQL260342bytes SHA256d040507d99f9d9b07c2b991308de88bae49654338398be0158565aafedbcff76. Restauración SQL sin red correcta:45usuarios,94expedientes,14documentos,13migraciones;24tablasOK. Configuración, claves y documentos restaurados y comparados byte a byte; ambos trabajosexit0. No se borra ni modifica la BD.

La corrección del productor remoto SPLIT, permisos Admin y contexto APP pertenece al chat Gestadia_LidIA y se valida por separado; esta revisión no acredita agenda/CRM ni una reserva.
