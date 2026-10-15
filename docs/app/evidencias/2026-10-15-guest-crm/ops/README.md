# Preparación operativa de CRM invitado

Helper preparado y revisado, todavía sin transferir ni ejecutar. Compila para .NET8. Depende del MySqlConnector y DLL del runtime publicado de LidIA; la resolución mediante enlaces locales a /app/*.dll ya se probó con el lector de sólo lectura en /tmp/guest-crm-probe. El helper de aplicación no se ha probado en producción.

Orden obligatorio: obtener acceso Plesk y copia fresca Portal; sustituir sólo el backend del stack162 con gestadia-backend:4ff4c69 y habilitar APP_V2_GUEST_CRM_ENABLED en su configuración privada, preservando el resto. Comprobar salud/revisión. Sólo después aplicar esta preparación de Source y reiniciar exclusivamente su backend para recargar app-conversations.json. Activar Source primero haría que el backend Portal antiguo rechazase nuevos permisos guest.

Sin el argumento exacto apply-guest-123, el helper sólo valida configuración, conexión y metadatos únicos remotos. La aplicación exige preimagen SHA256 fija, fuente10357/10359/10360 con hash exacto y bloqueo de filas, agente123/proyecto104 y asignación previa única10372. Crea tres copias propias; mantiene intactas las definiciones originales y las copias inactivas de103. Guarda backup privado con directorio700 y archivos600. No imprime secretos.

Los journals de fase son archivos distintos e inmutables con flush. Si una fase incierta o un journal anterior existe: no repetir, no reiniciar ni restaurar configuración a ciegas. Leer desde una conexión primaria nueva los IDs de clones, asignaciones y agente, comparar hash actual de configuración con el journal y reconciliar. El caso confirmado conserva configuración; sólo ausencia acreditada de efectos SQL permite restaurar la copia privada exacta, tras comprobar que el hash actual sigue siendo el candidato propio. No borrar filas/historial, no restaurar base completa, no cambiar claves.

La revisión independiente señaló y se corrigieron: commit incierto/restauración ciega, preimagen incompleta de herramientas y truncado del journal. La dependencia debe resolverse explícitamente mediante el runtime publicado.

La aceptación real sigue pendiente: conversación guest normal, teléfono555555555, Lead_Source App, Call del mismoLead y Owner heredado de su responsable; leer resultados y comprobar ausencia de duplicados.
