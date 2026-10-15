# Preparación operativa de CRM invitado

Helper revisado, transferido y aplicado en producción; readback primaria correcto el15/10. Ver PUBLICACION-Y-PRUEBA-REAL.md para preimágenes, aborto previo sin efectos, clones y recibo. Compila para .NET8. Depende del MySqlConnector y DLL del runtime publicado de LidIA; la resolución mediante enlaces locales a /app/*.dll se probó con el lector de sólo lectura en /tmp/guest-crm-probe.

Orden obligatorio: obtener acceso Plesk y copia fresca Portal; sustituir sólo el backend del stack162 con gestadia-backend:4ff4c69 y habilitar APP_V2_GUEST_CRM_ENABLED en su configuración privada, preservando el resto. Comprobar salud/revisión. Sólo después aplicar esta preparación de Source y reiniciar exclusivamente su backend para recargar app-conversations.json. Activar Source primero haría que el backend Portal antiguo rechazase nuevos permisos guest.

Sin el argumento exacto apply-guest-123, el helper sólo valida configuración, conexión y metadatos únicos remotos. La aplicación exige preimagen SHA256 fija, fuente10357/10359/10360 con hash exacto y bloqueo de filas, agente123/proyecto104 y asignación previa única10372. Crea tres copias propias; mantiene intactas las definiciones originales y las copias inactivas de103. Guarda backup privado con directorio700 y archivos600. No imprime secretos.

Los journals de fase son archivos distintos e inmutables con flush. Si una fase incierta o un journal anterior existe: no repetir, no reiniciar ni restaurar configuración a ciegas. Leer desde una conexión primaria nueva los IDs de clones, asignaciones y agente, comparar hash actual de configuración con el journal y reconciliar. El caso confirmado conserva configuración; sólo ausencia acreditada de efectos SQL permite restaurar la copia privada exacta, tras comprobar que el hash actual sigue siendo el candidato propio. No borrar filas/historial, no restaurar base completa, no cambiar claves.

La revisión independiente señaló y se corrigieron: commit incierto/restauración ciega, preimagen incompleta de herramientas y truncado del journal. La dependencia debe resolverse explícitamente mediante el runtime publicado.

La conversación guest real con555555555 creó Lead y Call; la recuperación expresa verificó la misma Call sin nuevo intento. Después de la precisión humana se configuró Juan Carlos Acero y Servicio Canje, publicados con733. RepairGuestCrmTestRouting.py documenta exclusivamente la reparación acotada de los dos registros de prueba ya creados; no debe ejecutarse de nuevo ni usarse como creación conversacional. Sus precondiciones y backup exclusivo impiden repetirlo inadvertidamente.


Prueba definitiva bajo733 completada: Lead588164000147861411 y Call588164000147838446 se crearon automáticamente con JuanCarlosAcero/Canje/App; no se usó RepairGuestCrmTestRouting.py en ellos. IsolateGuestCrmTestPhone.py retiró sólo Mobile del primer Lead ficticio tras copia privada exclusiva para liberar el teléfono555555555. El valor original permanece en la preimagen; la primera Call y los demás campos se conservaron. No repetir scripts de aplicación: leer los recibos y las precondiciones antes de cualquier intervención.
