# Operación de baja y conservación

10/10/2026. Criterio del usuario confirmado; [textos](PRIVACIDAD-Y-BAJA-APP-PORTAL.md), [maestro](../app/00-MAESTRO-APP-PORTAL-DOCKER.md) y [glosario](../../GLOSARIO.md).

La solicitud autenticada retira el acceso inmediatamente. El proceso de eliminación debe borrar datos de cuenta y registrar un resultado; no completar la solicitud al desactivar sesiones.

| Datos | Actuación | Condición de cierre |
|---|---|---|
| Contraseña, invitación y recuperación | Eliminar credenciales de Gestadia al aceptar la solicitud | No pueden rehabilitar acceso |
| Sesiones, registros y entregas push, bandeja | Eliminar al ejecutar la baja | Sin asociación ni nuevos avisos para la cuenta retirada |
| Identidades sociales y tentativas correlacionadas | Retirar asociaciones; Apple exige revocación previa de su token | No eliminar la prueba necesaria para un reintento de proveedor |
| Perfil y contacto de cuenta | Eliminar o separar la información estrictamente retenida | Sin perfil operativo; resultado comunicado |
| Expedientes, documentos y justificantes | No aplicar una purga automática por mera solicitud de cuenta | Decisión documentada por categoría, fundamento y plazo o criterio; acceso restringido |
| Conversaciones/correlaciones LidIA | Retirar acceso y coordinar eliminación o conservación concreta | Recibo de actuación remota; revocación de acceso sola no prueba supresión |
| Identificadores CRM/pagos | Coordinar la operación y verificar la conservación que corresponda | No afirmar borrado externo sin prueba del proveedor |
| Comunicación de resultado | Conservar destino cifrado solo para responder la solicitud | Aceptación SMTP registrada; retirar destino cuando se envíe, sin afirmar recepción de buzón |

Las cuentas sin expedientes ni dependencias externas pueden eliminarse automáticamente. Las que tengan documentación de servicio o datos remotos entran en una cola operativa de revisión, con motivos explícitos. No se inventa que todos los documentos requieren conservarse ni se destruyen por defecto.

Una decisión de conservación debe identificar categorías concretas, finalidad, razón, plazo o criterio, referencia de autorización y comprobación de actuaciones de terceros. No la decide el dispositivo ni se acepta como una declaración libre del cliente en la solicitud móvil. Se ejecuta por herramienta operativa con acceso privado al backend, mediante entrada revisable y con resultado trazable.

Mientras una actuación permanezca pendiente se mantiene ese estado y el acceso sigue retirado. Solo se registra eliminación completada cuando el borrado local y las actuaciones necesarias estén comprobados. Los expedientes conservados deben seguir accesibles para su gestión autorizada, separados del perfil de cuenta eliminado.

Las pruebas usan únicamente cuentas, documentos y DB efímera. La vía externa por correo requiere comprobar titularidad; un correo sin verificar no autoriza una baja. No se purgará un cliente de producción para probar el proceso.

## Proceso y herramienta privada

El worker del backend móvil ejecuta cada minuto, sin solaparse consigo mismo, la revocación Apple, hasta 25 solicitudes de baja y hasta 20 comunicaciones. Los lotes recorren la cola; una revisión pendiente no bloquea indefinidamente las posteriores. Cada cuenta se bloquea transaccionalmente junto con los productores y registros de notificaciones. La eliminación no permite que un productor con un objeto de usuario antiguo vuelva a crear bandeja o correo para esa cuenta.

`backend/scripts/account-deletion.mjs` solo se ejecuta desde un entorno administrativo privado con configuración del backend. No se publica una ruta HTTP de revisión. Cada operación exige un archivo de salida nuevo, creado con permisos 0600; no imprime perfiles, credenciales ni errores Prisma con registros privados.

| Comando | Entrada / actuación |
|---|---|
| `inventory USER_ID --out archivo.json` | Referencias de expedientes y dependencias remotas, número de documentos y huella del inventario; sin perfil de cuenta |
| `intake USER_ID --verified yes --execute yes --actor REF --authority REF --out archivo.json` | Registrar solicitud externa tras titularidad comprobada por soporte; deja prueba del responsable y expediente de comprobación; retira acceso |
| `review USER_ID --decision decision.json --out preview.json` | Validar y preparar decisión; no registra ni elimina nada |
| `review USER_ID --decision decision.json --execute yes --out resultado.json` | Registrar decisión revisada y permitir que el worker ejecute la baja cuando también estén confirmadas las revocaciones |
| `retained USER_ID --actor REF --authority REF --out archivo.json` | Lectura autorizada del archivo restringido; registra motivo/responsable antes de devolver campos cifrados |
| `queue administrative --out archivo.json` | Lista operativa limitada de solicitudes y comunicaciones, sin destinos de contacto |
| `retry-mail USER_ID --execute yes --actor REF --authority REF --out archivo.json` | Reabrir comunicación agotada; no reabre acceso ni repite eliminación; registra motivo |

La decisión JSON contiene `actorRef`, `authorityRef`, `inventoryHash`, `cases`, `remotes` y, solo si procede, `profile`. Cada expediente conservado requiere su ID y `category`, `basis`, `criterion`. Cada dependencia remota requiere su `key`, `outcome` (`erased` o `retained`) y `evidenceRef` del resultado comprobado; si se conserva, también categoría, fundamento y criterio. `profile.fields` solo acepta los campos de servicio permitidos; nunca contraseñas, sesiones ni tokens. No se adjuntan documentos personales a las decisiones.

La huella debe coincidir con el inventario vivo al registrar y al ejecutar. Cambios en expedientes, documentos, perfil o correlaciones remotas dejan una revisión anterior sin cobertura. No se admite omitir una dependencia ni cerrar una baja solo con la revocación de acceso LidIA. Los datos que aún correspondan al servicio quedan cifrados fuera del perfil operativo; los expedientes mantienen sus documentos y su gestión interna.

Tras completar, el usuario conserva solo una referencia interna mínima, estado eliminado y evidencia de la solicitud; no cuenta utilizable, correo real, perfil, contraseña ni asociaciones. La comunicación explica las categorías retenidas y sus motivos/criterios. Los archivos de prueba y sus motivos son ficticios; no equivalen a una decisión legal sobre un cliente real.

El envío tiene un máximo de cinco intentos y reserva temporal. Tras aceptación SMTP se elimina su destino cifrado; si falla, queda visible en la cola para soporte. Usa identificador de mensaje estable. Un reinicio entre aceptación SMTP y registro de resultado puede causar reenvío; no se promete entrega exactamente una vez ni recepción en el buzón. La copia privada de configuración debe conservar la clave de cifrado necesaria para leer los archivos restringidos; no se cambia sin migrar previamente los datos cifrados.

Soporte revisará periódicamente los criterios/plazos de los expedientes conservados y la cola de solicitudes o comunicaciones fallidas. La herramienta no destruye automáticamente documentos ni decide cuándo ha vencido una obligación. Antes de operar sobre producción deben comprobarse la titularidad, la autorización concreta de la decisión y las copias/recuperación que correspondan.

Las suites que comparten una DB efímera se ejecutan por archivo de forma secuencial: sus workers son globales y, en paralelo, podían consumir notificaciones de otro fixture. Las pruebas de doble worker, vínculo concurrente y bloqueo por cuenta siguen usando concurrencia explícita dentro de cada caso.
