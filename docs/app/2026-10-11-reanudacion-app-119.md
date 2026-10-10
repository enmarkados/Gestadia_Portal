# Reanudar la prueba APP → Portal → LidIA119

[Manual de desarrollo](MANUAL-DESARROLLO.md) · [Navegación](NAVEGACION.md) · [Plan](../superpowers/plans/2026-10-11-app-integraciones-119-122.md) · [Coordinación](../integraciones/2026-10-10-coordinacion-portal-contrato-v2.md).

## Código y revisión

Rama aislada `codex/app-integraciones-119-122`, worktree `app-integraciones-119-122`, base `app/main`7eed2d6; correcciones guardadas y publicadas en0f30eca. PR12 contra app/main, adjunta al chat. La revisión independiente de7eed2d6..3af8ec2 encontró tres Important y ningún Critical/Minor. Se corrigieron en una pasada con pruebas que reprodujeron el fallo antes de cambiar producción:

| Hallazgo | Comprobación final |
|---|---|
| Candidato122 local activo, cerrado remotamente: se abría otra122 | Reevalúa destino119; caso inverso con creación nativa apagada abre122. La apertura explícita cerrada no crea otra. |
| Recorte de permisos dejaba referencias comercial/gestor | Referencias nulas al retirar su permiso; un recorte vacío produce retirada válida sin bloquear el worker. El grant guardado conserva sus datos originales. |
| Grant entre barrido y entrega preparaba contexto119 ampliado | La actualización usa configuración por integración, antes de guardar la operación. Carrera reproducida contra Prisma/servicios reales;119 queda sondeo/history y122 conserva el grant permitido. |

RED:5 fallos esperados y13 correctos; GREEN:18/18 pruebas de registro. Harness completo final: **201/201 backend,152/152 frontend, build APP correcto, exit0**, limpieza de base temporal ejecutada. Pruebas externas con fixture; no acreditan el proveedor119 ni el móvil. Evidencia local de ejecución: `/tmp/gestadia-119-122-review-red.log`, `-green.log` y `-final-suite.log`; estos logs pueden perderse al reiniciar, por eso el resultado y los casos se conservan aquí y los tests en Git.

No se han modificado pantallas, Atrás, campos o colores; las capturas anteriores mantienen su fecha/procedencia. El mapa recoge la resolución backend y su límite de aceptación.

## Entorno recuperado

- APP demo5174 y tablero5190 arrancados y HTTP200; preview8099 existente conservado. Configuración pública del repositorio: demo, conversaciones desactivadas.
- Claves S2S recuperadas mediante cápsula RSA-OAEP-SHA256/AES-GCM, sin rotación ni exposición en chat/log. Configuración privada en `/Users/gonchumon/.codex/private/gestadia-app/consumer-lidia.env`, modo0600, directorio0700, fuera de Git. Contiene únicamente los dos perfiles y once claves por capacidad;119 no tiene handoff.
- El payload recuperado coincide con119/102/PRO (`gestadia-app-pro-agent119-validation`) y122/103/PRO (`gestadia-app-pro-local-validation`), con audiencias distintas y key IDs globalmente únicos. Las claves no conceden por sí solas autoridad de cuenta.
- El equipo LidIA comunica PRO718, SHA84ef05902b87439dd92008ef73a8deaa2a5d7b99, backups previos, migración de recibos y configuración119 adicional/122 conservada. Portal localizó ese commit y observó HTTP200 en `/health` y `/`; esa observación pública no acredita SHA/configuración efectivos. Playground119 comunicado por LidIA es una prueba distinta del recorrido APP.

## Cuenta y base: puerta pendiente

La base Portal anterior era MySQL temporal/tmpfs y ya no existe. El SQL y tar de recuperación indicados por el acta del07/10 estaban en `/private/tmp`; no se localizaron tras reiniciar ni en worktrees, directorio privado, Descargas, Escritorio o Documentos. Los contenedores MariaDB/tmpfs detenidos pertenecen a LidIA; no se reinterpretan como la base Portal. No se ha arrancado ni sobrescrito una base ajena.

Se leyó la respuesta humana original del chat LidIA, turno `01a11574-f232-73a0-80b4-a293ca2ce538`: autoriza renovar24h **las autorizaciones existentes** de `cliente.local@example.test`, sólo en la base local, conservando permisos/asignaciones/historial. Esa instrucción no autoriza reconstruir una cuenta/grant desde metadatos históricos. No se ha renovado ni creado autoridad.

LidIA ha pedido al usuario decidir entre facilitar un respaldo para restaurar o autorizar una cuenta ficticia local nueva con sondeo/history durante24h, sinCRM/pagos/WhatsApp. Esperar la respuesta humana directa; las mutaciones dependientes quedan pendientes. La cuenta nueva, si se autoriza, tendrá otro principal y no heredará chats ni probará la recuperación del historial perdido122.

## Procedimiento de recuperación y prueba

1. Revisar esta rama/ledger y la respuesta humana vigente. Conservar5174/5190/8099; asignar puertos separados a la prueba conectada.
2. Si aparece un backup: verificar procedencia/hash, restaurar sólo en una base local propia nueva y comprobar principal, grants, expedientes y asociaciones antes de renovar únicamente su vigencia autorizada. No apuntar las pruebas unitarias a esa base.
3. Si se autoriza una cuenta nueva: crear base local propia con almacenamiento durable y etiquetas de propietario, enlazada sólo a127.0.0.1. Aplicar migraciones Portal allí; crear sólo el principal y grant sondeo/history aprobados, sin expediente ni asignación. Mantener original122 intacto en LidIA.
4. Guardar manifest, configuración, credencial local y backup en directorio privado persistente0700/0600. Documentar rutas/comprobaciones; nunca sus secretos. Confirmar Stripe/Zoho/SMTP/LidIA legacy desactivados en el proceso de prueba, APP v1 habilitada y v2 apagado.
5. Arrancar backend desde el commit revisado; publicar sólo la configuración pública conectada de esa instancia local, sin cambiar el archivo demo versionado ni incluir claves S2S en el navegador.
6. Observar login → nueva consulta → apertura literal del119 → respuesta del usuario → respuesta literal en APP; correlacionar con timeline/agente119 en LidIA. Un200/recibo pendiente no confirma una respuesta del proveedor.
7. Con backup de la cuenta original, reabrir122 y comprobar que conservó su historial/reintentos. Con cuenta nueva, comprobar ambos ámbitos con chats nuevos autorizados, dejando expresamente pendiente recuperación histórica122; no presentar ese escenario como equivalente.
8. Registrar versión, flags, permisos/vigencia, conversación/operación, captura y resultado; actualizar manual/mapa si aparece un cambio visible. Native/emuladores/iPhone, CRM, agenda, correo y v2 se aceptan por separado.

## Parada y siguientes reinicios

Detener sólo PID/contenedor verificados del fixture propio, guardar dump y manifest privados y conservar el volumen durable. No usar `--rm`/tmpfs para el circuito que debe sobrevivir a reinicios. La suite canónica sí conserva su base descartable, guard y limpieza: `node scripts/test-app-conversations.mjs`. El preflight existente diagnostica el antiguo fixture reducido; no se considera listo para119/PRO por pasar sus trece tests unitarios.

La integración Git del código revisado en `app/main` cuenta con la autorización humana previa de commit/push/sync y la conformidad posterior LidIA. Se mantiene independiente de la puerta de cuenta y de la prueba conectada. El merge conserva configuración pública apagada y no crea/renueva autoridad.

## Cierre Git comprobado

PR12 fusionada en app/main mediante `be6bed66327e9efe521ecd380d549fcb07a307c2`; checkout principal actualizado ff-only, limpio y0/0 frente a origin. Backend/frontend/scripts son idénticos al snapshot0f30eca probado (201backend/152frontend/build); los cambios posteriores fueron documentales. Worktree conservado para la prueba conectada; v2 sigue separado. No se han creado ni renovado permisos ni cambiado la configuración pública por esta integración.
