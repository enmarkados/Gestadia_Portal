# Gestadia DEV25: preparación de QA APP nativa

Estado: preparación revisable, sin despliegue ni activación. [Glosario](../../GLOSARIO.md).

La QA autorizada por el usuario probará sondeo, historial y conversación con el gestor desde iOS/Android. Su respuesta «Contra produccion» establece el destino CRM para la fase de atención; no obliga a usar CRM en el sondeo ni permite reutilizar la identidad de la reserva humana PRO.

## Hechos comprobados

Los informes originales de inventario de stacks 24/25 se recuperaron completos y se contrastaron por SHA256, sin repetir sus SELECT. Stack 25 `lidia-gestadia-dev` sirve V1.705; Portainer muestra referencia `refs/heads/desarrollo/gestadia`, commit `64ced36a9a7d98edf1936cb27814d6d822814279`, compose.yaml e imagen lidia-app:gestadia-dev. GitOps está activo. App_Data y Logs son binds de `/var/lib/lidia-stacks/gestadia-dev`; el puerto publicado es 8084 y APP_UID 1654. No se infiere GID ni URL pública del puerto.

La BD 25 es `lidia_gestadia_dev_db`; conexión4 es Zoho CRM Production activa con dominio www.zohoapis.eu. Proyecto 102 tiene WhatsApp y otros canales. Agentes 119 y 122 existen en 102: el 122 de DEV no es la copia 122 de PRO. No hay archivo APP ni overrides APP observados; esto no acredita por sí solo toda la configuración efectiva o el aislamiento. Los recuentos Outbox/Evaluation/WhatsApp de 25 están vacíos. La cuenta Integraciones existe con rolIdentity Admin; falta comprobar usuario de soporte, departamento y ruta operativa.

Stack 24 es Vozenter, BD `lidia_v360_dev`, con otras conexiones y automatizaciones activas; no se selecciona para esta QA. Sus estados Outbox 1/Evaluation 2 corresponden a Sent/Completed, no a trabajos pendientes. Los fingerprints de destinos 24/25 difieren; no se midió en este inventario el de PRO.

## Paquete y orden de ejecución

1. Capturar de 25 fuente, referencia y compose, configuración efectiva, entorno/comando y runtime; hacer copia SQL propia y comprobar recuentos/manifiesto. Restaurarla en un MariaDB aislado sin red, puertos, eventos ni aplicación. Registrar resultado y hashes originales en texto, sin transcribir capturas.
2. Comparar __EFMigrationsHistory con las migraciones de la fuente aprobada `30be1692e5ba2c7bbb41a9603fcd07adab55bbe0` (dev/IA/main). El diff introduce AddAppConversations, AddAppMessageReceipts y AddAppGuestContinuity; el inventario aún no acredita cuáles faltan en BD 25. Aplicar solamente migraciones EF, sin ALTER ni historial manual.
3. Preparar referencia nueva `codex/app-dev25-qa-20261012`, archivo de código y etiqueta rollback al 64ced36a actual. No publicar sobre desarrollo/gestadia con GitOps activo. Revisar paquete completo antes de cambiar la referencia de stack25; la autorización de despliegue existe, pero las copias requeridas deben estar acreditadas primero.
4. Actualizar25 con APP global apagada. Comprobar health, marcadorV1.728, migraciones y origen servido. No deducir aceptación funcional de health ni de Git.
5. Leer configuración efectiva e instrucción del119 de DEV y comparar su hash/modelo/guards con el119 real de Gestadia solicitado. No se da por idéntico por compartir ID. Crear proyecto APP y agente nuevos con IDs generados porBD: misma instrucción y comportamiento conversacional, sin canales WhatsApp/correo/pago, conexiónCRM, timeout, automatizaciones ni handoffs heredados. Mantener original 119 y 122 de DEV intactos. Herramientas de lectura necesarias para el sondeo y guards APP conservados; ninguna asignación de agenda/CRM por esta fase.
6. Completar configuración privada propuesta con los IDs realmente creados, URL comprobada y aislamiento acreditado. Habilitar sólo integración de sondeo y claves necesarias tras revisión concreta. Atención y GuestV2 permanecen cerrados hasta sus comprobaciones propias.

La regresión del producto728 ya pasó 199/199 y Release con SDK 8, cero errores. Esta evidencia no sustituye la restauración/migración25, comparación del119 ni QA nativa conectada.

## Configuración y reparto

Se prepararon localmente dos integraciones independientes: `gestadia-app-qa-native-20261012-sondeo` y `gestadia-app-qa-native-20261012-atencion`, con audiencias distintas y11 claves únicas de 32 bytes. Archivos privados 600/directorio 700, fuera deGit. Todas las claves y flags están inactivos, IDs de proyecto/agente 0 pendientes, Crm null y rutas vacías. No se entregan secretos en documentación o mensajes.

| Ámbito | Permisos propuestos | Claves por operación |
|---|---|---|
| Sondeo | sondeo, history | SESSION: app.sessions.write; READ: app.timeline.read; TURN: app.turns.write; CONTEXT: app.context.attest; REVOCATION: app.subjects.revoke |
| Atención, pendiente | history, case_context, manager_handoff | las anteriores más HANDOFF: app.handoff.request; sólo tras relación/ruta verificadas |

El backendPortal ya admite claves diferentes por operación y exige IDs de claves sondeo distintos entre sí y de atención. En receptor v1, GET message-receipts exige timeline.read; POST ACK exige turns.write. «read» procede del ACK del dispositivo, no de recibir una respuesta IA. La retirada tiene su clave propia; TURN no concede revocación.

LidIA prepara actualización, copia del119, canalAPP común, timeline, recibos y soporte. PortalQA configura su cuenta local verificada, firma/renovación/grants/revocación y prueba secuencial en los dos dispositivos. La atención de gestor requiere Contact–Deal–Owner reales de esa identidad QA, verificación del contacto del trato, ruta opaca al operador Integraciones y autorización propia de acceso a esos registros. No se fabrica expediente ni se crea llamada/pago para demostrar chat.

## Aceptación y rollback

Una conversación APP debe ser una ChatSession normal con Channel.App; desde Sesiones se abre su propio historial, con icono móvil y estilos/menús existentes. AtenciónAPP es una agrupación operativa. La QA deberá acreditar turno IA real, continuidad, aislamiento entre cuentas/sesiones, ACK recibido/leído del dispositivo y respuesta del operador en la misma sesión; luego ciclos iOS/Android y entrega al iPhone del usuario por el equipoPortal.

Si falla una comprobación, retirar grant/autoridad QA, apagar integración y conservar historial/evidencia. Restaurar configuración y referencia previas por comparación exacta; cualquier restauración de BD se limita a 25 y requiere detener escrituras durante su aplicación. No se toca26 PRO ni se atribuyen a esta QA los permisos, contacto ambiguo o reserva fallida de otra conversación.
