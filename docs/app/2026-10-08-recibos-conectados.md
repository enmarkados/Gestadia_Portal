# Recibos APP: validación conectada local — 08/10/2026

[Glosario](../../GLOSARIO.md) · [Contrato](../integraciones/2026-10-08-app-recibos-mensajes.md) · [Plan](2026-10-08-plan-recibos-mensajes.md) · [Instalación física](2026-10-08-iphone-gonzalo.md)

**PASS del ciclo conectado local en web y simulador iOS:** enviado → recibido → leído aparece en el chat y en Mensajes con datos durables de LidIA. La APP utiliza su API real, Portal revalida cuenta/contexto y llama al proveedor S2S; los acuses de operador se ejercitan con un control local que invoca el servicio real de autoridad. No es una prueba del panel humano del gestor.

## Procedencia

- Código APP `356dc68`, documentación Portal `948d706`; suites backend **167/167** y APP **149/149**, con 14 regresiones de recibos y revisión independiente cerrada.
- Portal `http://127.0.0.1:3006`, APP web `http://127.0.0.1:5181`, LidIA `https://127.0.0.1:7443`. Certificado local validado con su CA, sin desactivar TLS.
- BBDD local independiente `gestadia_app_receipts_20261008`, cuenta/expediente ficticios. Modelo determinista, operadores de prueba. Sin llamadas Stripe, Zoho, SMTP ni concesiones de producción.
- Simulador iPhone17/iOS26.5, **build13**, con API explícita `http://127.0.0.1:3006`. Capture Keyboard activo: texto escrito, login, envío y persistencia del mensaje comprobados.
- Proveedor probado: DLL SHA256 `a738a38243db42c4df92a8b28eb699401537e711d7fb5eac1bf53cf938bb8645`, compilada sobre `516a31c6decce0a116459d977fc98ae3707710df` con cambios locales. No atribuir esa DLL a un commit final inmutable posterior.

[Manifiesto de procedencia](evidencias/2026-10-08-recibos-conectados/manifest.json) · [Suite APP](evidencias/2026-10-08-recibos-conectados/frontend-tests.log)

## Resultados observados

| Caso | Resultado y evidencia |
| --- | --- |
| LidIA procesa el turno | Mensaje del cliente recibido por agente; `read_at` sigue null. [API](evidencias/2026-10-08-recibos-conectados/joint-api-audit.json) |
| Asignación al gestor y acuses del cliente | Handoff admitido, toma por operador y secuencia sent/received/read con `read_by=operator`; acuse del propio mensaje rechazado 403. [API](evidencias/2026-10-08-recibos-conectados/joint-api-audit.json) |
| Reintento del ACK | Misma clave/cuerpo conserva primera fecha y devuelve snapshot actual; cambio semántico 409. [API](evidencias/2026-10-08-recibos-conectados/joint-api-audit.json) |
| Mensajes e ingreso al chat | Listado no acusa lectura; abrir burbuja entrante visible desde iOS produce `read_by=account`. [iOS](evidencias/2026-10-08-recibos-conectados/native-incoming-proof.json) |
| Ventana superpuesta | Nuevo mensaje permanece recibido/sin leído mientras la hoja está abierta; cerrar exige nueva visibilidad y pasa a leído. [Antes](evidencias/2026-10-08-recibos-conectados/modal-before-read.json) · [Después](evidencias/2026-10-08-recibos-conectados/modal-after-read.json) |
| Envío desde iOS | Texto escrito en Device Hub, recibido en timeline y ticks enviado/recibido/leído visibles en chat y resumen. [Registro](evidencias/2026-10-08-recibos-conectados/native-outgoing-proof.json) |
| Historial cerrado | Lectura de respuesta final por cuenta, conversación continúa closed y `reopened=false`; UI sin composer y con estado Cerrada. [Registro](evidencias/2026-10-08-recibos-conectados/closed-history-proof.json) |

[Chat enviado](evidencias/2026-10-08-recibos-conectados/ios-chat-enviado.jpg) · [Recibido](evidencias/2026-10-08-recibos-conectados/ios-chat-recibido.jpg) · [Leído](evidencias/2026-10-08-recibos-conectados/ios-chat-leido.jpg) · [Mensajes leído](evidencias/2026-10-08-recibos-conectados/ios-mensajes-leido.jpg) · [Historial iOS cerrado](evidencias/2026-10-08-recibos-conectados/ios-historial-cerrado.jpg) · [Historial web cerrado](evidencias/2026-10-08-recibos-conectados/web-historial-cerrado.png)

## Límites y coordinación

El iPhone físico tiene **0.1.0/build12**, firmado e instalado con código356dc68 y origen HTTPS app.gestadia.com. Apertura final confirmada con devicectl después del primer intento bloqueado. El build13 es exclusivo del simulador/entorno local: no acredita E2E físico, TestFlight, App Store ni producción.

Los agentes119/122 y los grants/canales de producción no se modifican. Portal ha fusionado PR9/PR10 en app/main24a30f0. LidIA ha fusionado PR1619/PR1620 en dev/IA/maina4ab0c299, con código final a3fb92389 y cierre de revisión automatizada. La validación de lectura humana en el panel de producción y la aceptación física conectada permanecen pendientes; los controles locales no sustituyen esa evidencia. Estos merges no acreditan despliegue.

La revisión automática rechazó el proxy HTTP temporal en LAN por exponer endpoints autenticados y posibles credenciales/datos en texto claro. La petición de autorización sigue pendiente; no se ha abierto el puerto. Las pruebas iOS anteriores emplean exclusivamente loopback del simulador.

## Cierre posterior de LidIA

Verificados en GitHub: [PR1619](https://github.com/enmarkados/Gestadia_LidIA/pull/1619) y [PR1620](https://github.com/enmarkados/Gestadia_LidIA/pull/1620) MERGED a dev/IA/main, tip a4ab0c299d6afcddacf6ec5fcb9ce60c797c8e12. La rama local de LidIA y su remoto coinciden, sin cambios pendientes.

La contraparte registra APP120/120, JS9/9 y helper19/19; suite completa en tres procesos disjuntos:16061PASS/283SKIP/0FAIL, manteniendo todos los métodos y el detalle de los intentos fallidos previos. La carrera de recargas de operador queda reproducida y corregida mediante TDD con servicio/persistencia reales.

El host local reconstruido acredita código a3fb92389141ab49d058699cec99cd0426176db9, runtime/autoridad listos y DLL SHA256 ccda6bff218dfd8a729280ee8a7dcf464f0a197484edfe1f5731b63553dcbc1d. El hash de estado antes/después del reinicio es idéntico, sin reset. El HTTP final de operador confirma read, received posterior monotónico y rechazo401 sin token, sin turnos de modelo. [Runtime](evidencias/2026-10-08-recibos-conectados/lidia-cierre/runtime-final-summary.json) · [Reinicio](evidencias/2026-10-08-recibos-conectados/lidia-cierre/restart-proof.json) · [Operador](evidencias/2026-10-08-recibos-conectados/lidia-cierre/operator-receipts-proof.json).

Estas tres evidencias públicas se conservan tal cual fueron entregadas por LidIA. El HTTP utiliza un operador simulado y no demuestra lectura humana. Las capturas y el E2E nativo anteriores conservan su DLL a738 y su procedencia original; no se atribuyen al proveedor final a3fb92389. Producción y la prueba física conectada siguen fuera de este cierre.
