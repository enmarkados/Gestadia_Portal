# Perfil firmado Portal preparado — 11/10/2026

[Plan](../../../superpowers/plans/2026-10-11-portal-perfil-firmado.md) · [Contrato y precisión compartida](../../../integraciones/2026-10-11-contraste-portal-perfil-agenda.md) · [Prueba resumida](proof.json).

Backend v1 prepara perfil de cuenta opcional y apagado por integración. Los contratos cerrados v1/v2 y ACK son copias exactas de los artefactos recibidos; firmas y semántica de los cinco vectores nuevos comprobadas. v2 valida ahora email con ajv-formats. El consumidor account de contexto v2 todavía no se incorpora; invitado mantiene su sondeo limitado.

AppConversation conserva baseline Portal, parche y revisión; queueContext compara sólo datos Portal y persiste DTO/ledger en la transacción existente. No supone +34 para número nacional ni zona/consentimiento. No se admite un parche distinto antes de acreditar el anterior; retirar permisos puede adelantar el mismo parche para no depender de una respuesta perdida. Así no se pierden revisiones aceptadas ni se reimponen campos sin modificar. Las operaciones mantienen petición y clave originales, incluso al girar credenciales. El proceso de baja existente elimina las filas AppConversation/AppOperation cuando procede, incluidos los nuevos datos privados.

RED observado: los esquemas antiguos rechazan profile, falta diff durable, entrega de segunda revisión antes de primera, email inválido v2 y retirada bloqueada. GREEN final: 302 pruebas backend y204 frontend (49archivos), compilación APP correcta, 14migraciones sobre MySQL tmpfs efímero. Pruebas de teléfono retirado, email sin reponer teléfono, flag off, grants CRM rechazados, dos dispositivos, rollback y retirada con ACK perdido. No se envían llamadas, correos ni mensajes reales.

La suite emite avisos del mocking experimental de Node y jsdom «navigation not implemented» de las pruebas existentes de checkout; son avisos de entorno, sin tests fallidos. Los logs íntegros permanecen en /tmp/gestadia-profile-green-final.log en la máquina de trabajo; esta evidencia resume conteos y huellas sin datos de producción.

La revisión independiente detectó bloqueo de retirada por perfil incierto. Se añadió regresión RED→GREEN, se mantuvo prioridad de revocación y se volvió a revisar sin hallazgos concretos pendientes.

No hay redeploy, migración productiva, nueva build TestFlight, permisos CRM/agenda o prueba de cita conectada. Antes de desplegar: copia/restauración nueva, versión LidIA compatible efectiva y mapping Zoho acreditado. APP Docker5febdf2 yTestFlight(10) se conservan.
