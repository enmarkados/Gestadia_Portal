# Ciclo nativo conectado del 12/10/2026

Petición humana: comprobar LidIA y el gestor `integraciones@vozenter.com` en iOS y Android; **después** instalar la última versión en iGonchu. No se acredita un ciclo conectado con fixtures ni con la prueba de otra cuenta.

## Fuente y entorno

- Fuente vigente para ambos paquetes (iOS0.1.0/build11; Android0.1.0/versionCode4): `344b0335ffb1e4a48677983fcba60b58e0b0c216`, Gestadia 0.1.0 (11), con el editor de nombre aceptado. La APP web servida `5febdf2` y el backend `0af593f` son referencias distintas.
- Rama propia de QA: `codex/app-prueba-real-ios-android-20261012`, worktree `app-motion-280`. Reutiliza la fuente del build 11 y conserva los documentos posteriores de app/main. Esta preparación local no publica ni activa canales.
- Backend Portal real en loopback3005 y MySQL durable exclusivo de QA. Copia previa y configuración privada bajo `~/.codex/private/gestadia-app/qa-native-20261012/`; no contiene un proveedor conversacional simulado.
- La autoridad antigua de sondeo/history caducó el12/10 a00:06UTC. V1/v2 se mantienen apagados hasta recibir configuración y autoridad verificables para nuestra prueba.
- DEV LidIA stack24 continúa en V1.705 al auditarlo el12/10; el equipo fuente debe acreditar runtime726, aislamiento, namespace y operador propios. No reutilizar la ventana de agenda PRO de otro chat.

## Matriz de ejecución

| Comprobación | iOS | Android |
|---|---|---|
| Compilación de fuente build11 | PASS, Debug Simulator | PASS, assembleDebug |
| Arranque y pantalla | APP y entrada Login/Continuar sin registro observadas | APP y acceso observados en primer arranque |
| Login desde controles nativos | Pendiente: pulsaciones/AX no fiables en Xcode27 | PASS: email y contraseña en controles, retorno solicitado |
| Conservar sesión al reiniciar y revocar al cerrar | Pendiente | PASS: force-stop/reinicio conserva cuenta; logout pasa de1 a0 sesiones activas |
| Nueva sesión real119 + respuesta del modelo | Pendiente de autoridad/namespace propios | Pendiente de autoridad/namespace propios |
| Recuperación, respuesta legible, historial y permisos | Pendiente | Pendiente |
| Chat con gestor Integraciones, envío en ambos sentidos | Pendiente de Contact–Deal–Owner QA verificables | Pendiente de Contact–Deal–Owner QA verificables |
| Recibos enviado/recibido/leído, cierre y reapertura permitida | Pendiente | Pendiente |
| Búsqueda, renombrado, fechas y navegación/Atrás | Pendiente de sesión conectada | Pendiente de sesión conectada |
| Login Apple/Google y push | No acreditados por build ni perfil | No acreditados por build |

El backend local sí pasó login nativo por API, perfil, expedientes, notificaciones y revocación de la sesión de preflight. Eso no acredita login mediante el teclado del emulador.

## Comprobación Android observada

El APK Android es0.1.0/versionCode4 compilado desde la fuente344b033 del build iOS11; ambos números de distribución son independientes. Los nombres de captura `android-build11-*` identifican esa fuente iOS, no un versionCodeAndroid11.

Con4096MB/cuatro núcleos, GPUhost y sin ventana, el AVD arrancó en21,5s. El diálogo de informes del fallo anterior impedía boot: `-crash-report-mode never -no-metrics` evita enviar informes a Google y desbloquea el arranque. Captura y diagnóstico locales permanecen disponibles.

Email QA comprobado contra el fixture y contraseña enmascarada de32caracteres; acceso por controles, retorno a nueva consulta y persistencia tras `am force-stop`/reinicio. El menú muestra la cuenta recuperada. Logout devuelve a visitante y revoca la única sesión Android en BD:1→0. [Resultado](android-sesion.json), [sesión recuperada](android-build11-sesion-recuperada.png).

La consulta nueva muestra un error recuperable porque el backend no tiene autoridad remota vigente: [captura](android-build11-consulta-pendiente.png). La [hoja del gestor](android-build11-gestor-llamada.png) pide nombre/teléfono para llamada, como corresponde a esta cuenta sin Contact–Deal–Owner; no se ha enviado solicitud ni inventado asignación. Mensajes mantiene su texto de gestores y muestra que el historial remoto no está disponible.

El primer intento de login falló al reiniciar el wrapper local sin cargar DATABASE_URL. Se corrigió el comando privado de arranque (`node --env-file=…`), sin modificar autenticación del producto ni permisos.

## Secuencia que debe ejecutarse

1. Acreditar DEV, claves S2S, namespace APP, principal QA, vigencias y operador Integraciones. Guardar referencias de sesión/operación propias, nunca claves.
2. Ejecutar iOS y Android por separado; AVD propio con4096MB/cuatro núcleos. No modificar AVDs de LIA ni apagar simuladores ajenos.
3. LidIA: acceso → nueva consulta → mensaje/elección de botón con texto visible → respuesta del119 → abandonar/recuperar mismo chat → renombrar/buscar → permisos/cierre según contrato.
4. Gestor: relación QA Contact–Deal–Owner confirmada por servidor → abrir chat nombrado → entrada del operador Integraciones → mensajes en ambos sentidos → recibido/leído verificados en los dos extremos → historial tras cierre.
5. Verificar navegación, teclado, permisos y estados de error. La cita CRM real, OAuth y APNs se registran como pruebas diferentes.
6. Sólo tras superar ambos ciclos, instalar y abrir el paquete Release firmado en el iPhone, comprobar versión y endpointHTTPS. Confirmación de instalación y lanzamiento no sustituye los ciclos anteriores.

## Paquete físico preparado, todavía no instalado

Reexportación del archivo build11 como `release-testing`, TeamX27NG7M487: **EXPORT SUCCEEDED**. Perfil `iOS Team Ad Hoc Provisioning Profile: com.gestadia.app`, un dispositivo, incluye iGonchu; `get-task-allow=false`, APNsproduction. `codesign --verify --deep --strict` PASS. Configuración ReleaseHTTPS se conserva; no hereda loopback.

IPA SHA256: `7cab357b01d6e882d4ac30c8de76bc563bc5e134854387683870e51db2d3205f`.

La autorización humana de firma/registro/instalación ya existe; el pendiente es técnico y el orden solicitado, no otra aprobación de firma.

## Hallazgos de herramientas

- Xcode27/iOS26.5: el espejo serve-sim confirma taps en su log, pero la pantalla no cambia. XcodeBuildMCP2.7 reconoce Gestadia y su scroll; los botones WebView no aparecen como targets. No considerar un ACK de herramienta como pulsación recibida por la APP.
- Android API36/Playstore: primer arranque mostró bloqueo del sistema; SwiftShader informó QEMU2CPU0 sin respuesta. Se reintenta con renderizadorauto y recursos acordados, iOSQA apagado. No atribuir todavía el bloqueo a la APP.
- Android Debug permite HTTP sólo a127.0.0.1 mediante `gestadia_qa_network_security`; Release no incluye esa excepción. Reestablecer `adb reverse tcp:3005 tcp:3005` al reiniciar el AVD.

## Evidencia y recuperación

Los registros completos, manifiesto, binarios, perfil y credenciales quedan privados. Versionar sólo capturas y resultados saneados. Al retomar: comprobar procesos/puertos, manifiesto, vigencias, rama y fuente efectiva; no reconstruir permisos desde PIDs o claves antiguas. Revocar únicamente las sesiones/autoridades creadas por esta prueba y detener sólo sus helpers/dispositivos.

## Verificación de código del snapshot

`node scripts/test-app-conversations.mjs`: **313backend /207frontend /build APP PASS**, base efímera aislada. Repetición de frontend con la opción ya documentada `NODE_OPTIONS=--no-experimental-webstorage`:49archivos/207pruebas PASS. El primer npm test bajo Node25 falló por su global localStorage sin API de getItem/setItem; la comparación mínima con Node24 y el registro original del editor identifican la incompatibilidad del entorno. No se modifica el producto para ocultarla. [Resultado saneado](tests.json).

El segundo boot iOS se quedó en Waiting on System App y no permitió recuperar la interacción; se apagó sólo el simulador propio y se retiró su espejo. El simulador ajeno se conserva. La inspección WebKit experimental sólo se habilitó en la copia privada del simulador, nunca en el IPA físico.

## Preflight físico por cable

`devicectl device info apps --bundle-id com.gestadia.app`, con destino exclusivo a iGonchu, confirma **Gestadia0.1.0/bundleVersion11 ya instalada**. No se reinstaló ni lanzó la APP en esta prueba; la reexportación Ad Hoc preparada permanece sin instalar. La versión instalada no acredita el ciclo conectado ni el origen exacto del paquete. [Resultado saneado](iphone-version.json).

## Reanudación tras el cierre de la ventana PRO ajena

Se incorpora a la rama QA el backend `0af593f` ya entregado por el otro equipo, mediante `b2250c3`; igualdad exacta de `backend/` comprobada contra fuente. `frontend/app/` conserva igualdad con344b033 y los binarios móviles no cambian. Los conflictos documentales conservan las entradas anteriores y las fuentes recibidas.

Verificación nueva del conjunto: **351backend /207frontend /build APP PASS**, harness aislado. [Resultado](tests-backend0af.json). Se reinicia sólo el backend privado3005 con la configuración existente, S2S desactivado; sin migración nueva, despliegue o grants.

LidIA confirma que su ventana PRO quedó cerrada/restaurada, sin Call acreditada. Esto permite retomar la auditoría DEV, pero no entrega aún recursos nativos: stack24 continúaV1.705/30a5365. Se solicitan namespace/autoridad propios y Contact–Deal–Owner/routing de Integraciones verificables. El operador, la matriz de conexiones y el aislamiento deben acreditarse; no se construye un caso CRM ficticio para saltar el guard.

La ejecución iOS espera también resolver la convivencia con el simulador iPhone17 de la tarea LIA: se solicita permiso al usuario para cerrarlo temporalmente, conservando su dispositivo y datos. No se toca mientras la respuesta esté pendiente.
