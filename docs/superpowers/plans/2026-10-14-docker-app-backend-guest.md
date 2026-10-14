# Delta Docker APP/backend para guest — preparado, sin ejecutar

Fuente fijada: `965a12d9d65f78f614d4f1754d58e6c69e31585d`, que incorpora PR18/app/mainbb84c46 y versión1.0. Se reutilizan365backend/214frontend y la revisión existente. Esta propuesta no construye imágenes, despliega, crea claves o activa invitados.

| Servicio | Preimagen histórica comunicada por Ops | Etiqueta propuesta, aún no construida |
| --- | --- | --- |
| APP | `gestadia-app:c6530f6` | `gestadia-app:965a12d` |
| Backend común | `gestadia-backend:c6530f6` | `gestadia-backend:965a12d` |
| Web/Portal | `gestadia-portal-web:be6806d` | Conservar exactamente |

No se atribuyen digests de registro: no están acreditados. Ops comunicó IDs locales APP3bce972ed42c/backendef4f5f9b102d; debe cotejar imágenes y stack actuales justo antes del corte. El snapshot histórico SHA78cbf7efaad0955093b2d01be159e2adbfd482d0b1ed150ea34a5d584d636885 no sustituye esa comprobación.

## Paso1: preparar imágenes por el pipeline existente

Contexto privado de la fuente fijada, SHA `dd5325fc74c9a1771fae759077d06b598e0f5d2a835ee0068819324b9613d049`,1223056bytes. Incluye sólo entradas que consumen los dos Dockerfiles; no native/signing, secretos, node_modules o artefactos locales. Dockerfile.backend conserva los contratos JSON bajo backend/src; no requiere cambios de código ni schemas nuevos.

Al recibir GO de construcción, extraer en un directorio propio nuevo y ejecutar **una vez por imagen**, con linux/amd64:

```sh
docker build --platform linux/amd64 -f deploy/app/Dockerfile --build-arg APP_PROXY_TEMPLATE=common.conf.template --build-arg APP_VERSION=1.0 --build-arg VCS_REF=965a12d9d65f78f614d4f1754d58e6c69e31585d -t gestadia-app:965a12d .
docker build --platform linux/amd64 -f deploy/app/Dockerfile.backend --build-arg VCS_REF=965a12d9d65f78f614d4f1754d58e6c69e31585d -t gestadia-backend:965a12d .
```

Registrar IDs/hash de exportación reales; no anunciar imágenes importadas o servidas por el éxito de build. No construir Web/Portal. La plantilla common ya incluye las rutas exactas guest/bind y mantiene los bloqueos existentes.

## Paso2: delta de stack y configuración, inicialmente OFF

El patch privado cambia únicamente las dos líneas image del snapshot. Se comprobó reversión textual exacta: todos los demás bytes permanecen iguales. Preservar web/Portal, puertos, redes, UID/GID, secrets, backend.env, public mobile-release.json y el bind existente de uploads; no sustituirlo por volumen vacío ni usar create_host_path automático. La configuración móvil pública y social no recibe claves, IDs de agente ni selectores CRM.

Fragmento privado preparado con APP_V2_ENABLED=false y APP_V2_GUEST_ENABLED=false; integración/audience `gestadia-app-pro-guest`, base `https://lidia.gestadia.com` **sin prefijo de ruta**. El cliente exige origin raíz y añade su prefijo v2. Se propone modificar sólo estos campos en el backend.env real, preservando DB/JWT/Stripe/Zoho/SMTP/APPv1/push/social/worker. No reemplazar el archivo completo con un candidato recortado ni concatenar claves duplicadas.

| Capability propia | Par de variables existentes |
| --- | --- |
| app.sessions.write | APP_V2_LIDIA_SESSION_KEY_ID / SESSION_SECRET_BASE64 |
| app.timeline.read | APP_V2_LIDIA_READ_KEY_ID / READ_SECRET_BASE64 |
| app.turns.write | APP_V2_LIDIA_TURN_KEY_ID / TURN_SECRET_BASE64 |
| app.subjects.revoke | APP_V2_LIDIA_REVOCATION_KEY_ID / REVOCATION_SECRET_BASE64 |
| app.bindings.write | APP_V2_LIDIA_BINDING_WRITE_KEY_ID / BINDING_WRITE_SECRET_BASE64 |
| app.bindings.read | APP_V2_LIDIA_BINDING_READ_KEY_ID / BINDING_READ_SECRET_BASE64 |

En la columna derecha el prefijo APP_V2_LIDIA_ se aplica a ambos nombres. Los valores están vacíos: sólo Source/Ops suministran seis pares propios por canal privado después de aceptar el overlay. No crear claves por esta propuesta. HANDOFF/CONTEXT deben permanecer ausentes/vacíos; una deriva se concilia, no se borra por rutina. `can_bind` describe preparación local, no autorización efectiva o ACK remoto.

Ops comunica clon inactivo Project104/Agent123/Instruction10117/Country10372, readbackverifiedtrue/SHA7114b30d01462be25d3486f2b739739be76bf2a67a21a9f54eef7dfaedceede6. Son referencias de receptor resueltas en servidor; no se añaden al cliente. Activación de filas/flags/keys es otra fase; Crmnull/Routes[] excluyen agenda/atención.

## Paso3: corte y rollback, ambos pendientes de GO

Antes del corte: comparar preimagen actual; una copia fresca de la **base Portal del backend vigente** por el procedimiento existente, conservando su config y uploads. No reutilizar el dump LidIA198/260 como backup Portal ni repetir restauraciones/suites. No ejecutar migraciones nuevas: este delta no incorpora ninguna.

Después del GO específico: sustituir sólo APP/backend con flags guest OFF y verificar fuente servida/configuración/montajes. Las pruebas del recorrido guest+binding/otroactor y retirada se hacen después de aceptar la activación, en iOS/Android secuenciales; no repetir el ciclo autenticado ni suites ya acreditadas. Los binarios1.0(12)/(5) están firmados, sin subir/instalar.

Rollback de imágenes/configuración con preimagen privada cotejada, manteniendo web/Portal y datos. Si hubo sujetos guest reales, cerrar primero admisiones y retirar cada sujeto con ACK+readback primario; conservar transporte global, receptor y REVOCATION hasta terminar el control. Después restaurar sólo el delta propio mediante comparación. No apagar las claves antes del ACK, restaurar ABD/global ni borrar historiales/joins. Sin sujetos creados, revertir sólo las dos imágenes y campos v2 propios, no DB ni uploads.

Preparados privadamente: contexto, manifiesto, stack candidato, patch images-only y fragmento backend OFF. Bloqueos: build/import real, preimagen vigente, backup Portal y aceptación material de seis capabilities/retirada. Ninguno se declara realizado en este documento.
