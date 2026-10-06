# Prueba local integrada APP / Portal / LidIA — 06/10/2026

Autorización del usuario: probar lo implementado y arrancar las aplicaciones en local. Resultado: **61 comprobaciones HTTP/API aprobadas**, flujo probado desde la APP y Portal en navegador, **115 pruebas backend / 98 frontend y build APP correctos**. [Resultados sanitizados](fixtures/app-local-e2e-2026-10-06-results.json) · [Glosario](../../GLOSARIO.md).

## Entorno que se ha probado

| Componente | Ejecución |
|---|---|
| APP | http://127.0.0.1:5174/ — frontend real del worktree Portal, configuración pública efímera conectada |
| Web Portal | http://127.0.0.1:5173/portal/login — frontend real y la misma cuenta/base |
| API Portal | http://127.0.0.1:3001 — createApp/API/worker APP reales, MySQL 8 tmpfs propia |
| LidIA | https://127.0.0.1:7443 — Kestrel con controladores, servicios y AppTurnBackgroundService/runner reales del PR 1600; MariaDB 11.4.12 temporal |

Portal partió de `dbc2522fc4ba5242b62b800c35f29b4a65c11631` e incluye la corrección de recarga indicada abajo. LidIA corre el assembly de `6531d3299f358cf3355618d75cf9f9f40f095a9a`. SHA256 del binario cargado, comprobado contra el archivo local: `6dcff31c86111907600a5c08c5e644303119b8aac9e15d62e9ab5c5610928e0e`, con archivos de procedencia en `/tmp/gestadia-app-local-20261006/binary-provenance.json`.

Se usa TLS con CA local y validación de certificado; seis claves por facultad exclusivas de esta prueba. No se ha desactivado la validación TLS ni se ha instalado una CA global. Las claves y tokens viven únicamente en carpetas temporales privadas; no se copian a este documento ni al repositorio.

Las interfaces y transportes HTTP, firma HMAC, contexto, persistencia, recibos y atención son reales. **El límite de modelo es determinista** y se identifica en los mensajes como `[Modelo local de prueba]`. Los operadores son ficticios y se invocan mediante auxiliares locales autenticados que delegan en AppSupportService; no se ha probado el panel completo ni el proveedor de identidad de operadores real. El proyecto/agente/instrucción de prueba son 901/902/903, sin conexiones externas.

LidIA informa de 258 migraciones completas en MariaDB. La cadena histórica utiliza dialecto MariaDB (`ADD COLUMN IF NOT EXISTS`), que MySQL 8 no admite: se cambió exclusivamente su contenedor temporal al motor compatible. Portal aplicó sus seis migraciones en otra base MySQL 8 nueva. No se migró ninguna base existente.

## Comprobaciones realizadas

| Grupo | Aserciones | Resultado |
|---|---:|---|
| Sesiones e identidad | 6 | Login APP 201, dos dispositivos propios, perfil con token opaco, cuenta sin prueba rechazada |
| Invitación real | 6 | Login previo 403; consumo HTTP registra fecha/método; enlace de un solo uso; login habilitado; JWT legacy rechazado por APP |
| Entrada y aislamiento API | 8 | Sin token 401; campos de agente/permisos 400; JSON/UTF8 inválidos 400; body mayor de 32 KiB: 413; sesión ajena permanece activa |
| Transporte y turnos | 12 | Sesión/contexto S2S, asociación compartida entre dispositivos, cuenta ajena 404, worker completed, replay sin duplicado, conflicto 409, recibo exacto y checkpoint |
| Expediente privado | 4 | Asociación/contexto autorizados y creación/lectura denegadas a otra cuenta |
| Atención gestor | 7 | Solicitud pendiente no acredita operador; comercial no puede tomar el caso 403; gestor toma/responde; replay de respuesta no duplica |
| Envío desde navegador | 2 | Mensaje UI visible desde otro dispositivo; atención humana no emite respuesta IA |
| Retirada de permisos | 3 | Operador tenía lectura 200; Portal bloquea inmediatamente 403; outbox bloquea lectura operador en LidIA 403 en 16,29 s |
| Cierre | 8 | Operador correcto cierra; lectura autorizada conserva closed; turnos/handoffs nuevos 409 no reabren |
| Revocación de cuenta | 5 | Lectura S2S 200 antes; sesiones locales 401 y login 403 después; LidIA deniega S2S 403 en 6,96 s; otra cuenta sigue activa |

Los tiempos son mediciones de esta ejecución local; no garantizan latencia distribuida de producción. La cuenta usada para cierre/bloqueo es distinta de la que se deja abierta para el usuario.

Desde navegador se verificaron login en APP y Portal, expediente propio, guardado de perfil y persistencia entre ambas interfaces, selección de acción Argentina con identificadores/revisión del servidor, sondeo collecting, respuesta de gestor, envío del cliente y recarga de historia. La APP oculta ambos mensajes privados al perder permisos. El sondeo no declara elegibilidad real.

La vista móvil efectiva se comprobó con 390×844 CSS px mediante emulación del navegador, y el botón superior Volver a LidIA se pudo pulsar en x16/y10. Los mensajes del cliente usan rgb(192,57,43) con gestor y rgb(56,56,56) con LidIA. [Captura móvil](evidencia/2026-10-06/manager-mobile.png) · [Captura escritorio](evidencia/2026-10-06/manager-desktop.png). Esto no acredita una instalación o prueba en iPhone físico.

## Fallo encontrado y corregido

Al recuperar permisos y pulsar **Volver a cargar**, la historia volvía pero el aviso de acceso denegado permanecía. Se reprodujo en navegador y en un test que fallaba por conservar el alert. El botón ahora limpia el aviso anterior al iniciar la recarga; si la petición falla, el manejador de errores vuelve a mostrar el rechazo. No cambia permisos, recuperación de operaciones ni reenvía turnos/handoffs.

Evidencia RED: `/tmp/gestadia-app-local-e2e-20261006/refresh-red.log`. Suite completa posterior: 98/98 frontend en `/tmp/gestadia-app-local-e2e-20261006/refresh-green-suite.log`, build en `final-build.log`. El escenario se repitió desde el navegador tras la corrección: mensajes ocultos al retirar, restauración explícita y cero alerts después de recargar. Backend 115/115 se ejecutó fresco antes de la modificación, que afecta únicamente al botón y su regresión.

## Aplicaciones disponibles y parada

Las páginas están abiertas y la cuenta `cliente.local@example.test` conserva conversaciones de sondeo y gestor en atención, con permisos restaurados. Contraseña ficticia y exclusiva de esta base local: `GestadiaLocal2026!`. Una cuenta separada `otro.local@example.test` queda bloqueada deliberadamente por la prueba. No usar estos accesos fuera del entorno local.

Los procesos/configuración de esta ejecución viven en `/tmp/gestadia-app-local-e2e-20261006` (Portal) y `/tmp/gestadia-app-local-20261006` (LidIA). No se ha modificado el app-config.js público versionado ni sus flags por defecto. Los servicios se dejan corriendo porque el usuario pidió probarlos; la base es temporal y se pierde al parar su contenedor.

Parada explícita, con comprobación de PID/ruta/etiqueta de contenedor propio:

```sh
python3 /tmp/gestadia-app-local-e2e-20261006/stop.py
python3 /tmp/gestadia-app-local-20261006/stop.py
```

La suite con respuestas LidIA simuladas sigue siendo reproducible desde el repositorio con `node scripts/test-app-conversations.mjs`. Esta ejecución conectada depende además del host de prueba LidIA y de los lanzadores temporales anteriores; todavía no constituye un lanzador completo versionado para aprovisionar DEV desde cero.

## Alcance pendiente

No acredita agente 119/configuración efectiva de producción, modelo externo, cumplimiento real para canje, Zoho/Cerrado ganado/pagos/onboarding de nuevas cuentas, correo real, notificaciones push, cambio/borrado real de cuenta, instalación física ni despliegue remoto. El perfil conectado todavía contiene textos heredados de demo en funciones no conectadas; esta prueba no las da por terminadas.

Los PR 9 y 1600 siguen abiertos como borradores; no se ha hecho merge ni despliegue ni activación remota. Stripe, Zoho, SMTP y la integración LidIA legacy están desactivados en el proceso Portal. El host reducido LidIA registra sólo el worker APP y no registra transportes externos. Sus jobs heredados, backups, notificaciones y automatizaciones no se han arrancado.
