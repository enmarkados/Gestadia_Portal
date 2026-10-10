# Integración APP en app/main — 08/10/2026

[Glosario](../../GLOSARIO.md) · [README APP](../../README-APP.md) · [Pruebas conectadas](2026-10-08-recibos-conectados.md) · [Instalación física](2026-10-08-iphone-gonzalo.md)

El usuario autoriza explícitamente commit, push, sincronización remota e integración en la rama APP. El destino es **app/main**; no implica despliegue ni activación de canales, permisos o agentes.

## Contenido integrado

- Base APP previa: `e10edba`, incluidos sus documentos y términos de marketplaces/acceso social.
- Conversaciones/diseño/navegación: `codex/app-conversaciones-backend`, `fbd9ae0`, [PR9](https://github.com/enmarkados/Gestadia_Portal/pull/9).
- Recibos y evidencias: `codex/app-recibos-mensajes`, `6fb058e`, [PR10](https://github.com/enmarkados/Gestadia_Portal/pull/10); código de recibos `356dc68`.
- Los conflictos de README y glosario conservan las aportaciones de ambas ramas. Se comprueba la presencia de los 44 términos de la base APP y los 67 de la rama de recibos; ningún término perdido.
- Únicamente se normalizan saltos de línea finales de los dos CSS del portal. La migración y los logs históricos se conservan, incluidas sus líneas finales, para no alterar checksums ni evidencias.

## Verificación del resultado integrado

Se ejecuta `node scripts/test-app-conversations.mjs` tanto en la rama de origen como en el árbol integrado de app/main: **backend167/167, APP149/149 y build web correcto** en ambas ejecuciones. El lanzador crea una BBDD MySQL8 propia en tmpfs, expuesta sólo en loopback, aplica migraciones y limpia únicamente el contenedor con su etiqueta de propietario.

El primer intento directo de `npm test` backend carecía de `DATABASE_URL`; el guard de las pruebas rechazó dos archivos antes de acceder a una BBDD. El lanzador aislado corrige la configuración de ejecución; no se modifican tests, permisos ni código productivo para hacerlos pasar.

[Resumen de la verificación integrada](evidencias/2026-10-08-integracion-app-main/verificacion.json).

La configuración versionada mantiene `demoOnly=true`, `conversationsEnabled=false` y el gate backend desactivado salvo configuración explícita. Integrar/push no cambia configuraciones efectivas de producción. El ciclo conectado documentado corresponde al entorno local aislado, con modelo y operador de prueba; el iPhone físico tiene build12 instalado y abierto, sin aceptación conectada física acreditada.

## Comprobación de sincronización

Tras el commit de merge y el push se verifica `HEAD == origin/app/main` y `git rev-list --left-right --count app/main...origin/app/main` igual a `0 0`. La integración debe contener tanto `e10edba` como `6fb058e` como ancestros. El árbol de trabajo queda limpio y las PR se cierran por integración en app/main.

Se conserva el worktree de pruebas con sus artefactos ignorados para las verificaciones posteriores; no se eliminan checkouts ni datos de otros agentes. El cierre del proveedor/DEV se registra a continuación; producción no se despliega en este bloque.

## Cierre correlacionado del proveedor

LidIA confirma y se verifica el merge de PR1619/PR1620 sólo a dev/IA/main, tip a4ab0c299d6afcddacf6ec5fcb9ce60c797c8e12. Código final a3fb92389, runtime local reconstruido con procedencia efectiva, BBDD conservada y HTTP de operador simulado monotónico. [Acta y copias públicas de las evidencias](2026-10-08-recibos-conectados.md#cierre-posterior-de-lidia).

El merge Portal24a30f0 permanece como referencia del código APP validado. Este cierre documental posterior conserva la distinción entre el binario del E2E web/iOS anterior y el proveedor final. Despliegue PRO, lectura humana en panel y E2E físico conectado no quedan acreditados por los merges.
