# Publicar Gestadia App en Docker, Portainer y Plesk

[Glosario](../../GLOSARIO.md) · [Alcance y validación](PRIMERA-VERSION.md)

La primera versión tiene su propia imagen Nginx y funciona **exclusivamente en demo**, por instrucción del usuario. No necesita base de datos, Firebase, key de LidIA ni backend. `APP_DEMO_ONLY=true` bloquea `/api/` y `/lidia/` sin consultar upstreams. El recorrido de Servicios finaliza dentro de la app, sin abrir el checkout real.

## Ejecutar en desarrollo

```sh
npm run app:dev
```

App: `http://127.0.0.1:5174`. La configuración pública en `frontend/app/public/app-config.js` activa `demoOnly`. Los proxies preparados para portal/LidIA permanecen inactivos en los recorridos de esta entrega.

## Construir en el servidor

Desde este repositorio, rama `app/main`:

```sh
docker build --build-arg VCS_REF="$(git rev-parse HEAD)" -f deploy/app/Dockerfile -t gestadia-app:2026-10-03 .
```

Para construir una imagen importable en un servidor Intel/AMD desde este Mac:

```sh
docker buildx build --platform linux/amd64 --build-arg VCS_REF="$(git rev-parse HEAD)" -f deploy/app/Dockerfile -t gestadia-app:2026-10-03 --load .
mkdir -p artifacts
docker save gestadia-app:2026-10-03 | gzip > artifacts/gestadia-app-2026-10-03-linux-amd64.tar.gz
shasum -a 256 artifacts/gestadia-app-2026-10-03-linux-amd64.tar.gz
```

El archivo puede importarse en **Portainer → Images → Import**. Portainer admite `.tar.gz`; importar en el nodo que ejecutará el stack. [Referencia oficial](https://docs.portainer.io/user/docker/images/import).

## Crear el stack en Portainer

Usar el archivo `deploy/app/portainer-stack.yml` en **Stacks → Add stack → Upload** o pegarlo en el editor. La imagen debe existir previamente en el servidor o en un registro accesible; el stack de Portainer no depende de construirla. [Referencia oficial](https://docs.portainer.io/user/docker/stacks/add).

Valores del stack:

| Variable | Valor previsto |
|---|---|
| `GESTADIA_APP_IMAGE` | `gestadia-app:2026-10-03` |
| `GESTADIA_APP_PORT` | `8091` (libre en el servidor) |
| `APP_DEMO_ONLY` | **`true`**, primera versión sin conexiones |
| `APP_DEMO_ENABLED` | `true` |
| `APP_PLUGIN_KEY` | Dejar vacía; no se necesita para presentar la app |

Las variables de upstream del stack están reservadas a una fase conectada y no se consultan en la demo. No desactivar `APP_DEMO_ONLY` para esta entrega. El contrato futuro y los requisitos de identidad están en [integración LidIA](INTEGRACION-LIDIA.md).

## Plesk y subdominio

Crear `app.gestadia.com` en su espacio del mismo servidor y emitir su certificado HTTPS. Configurar Plesk como reverse proxy a `http://127.0.0.1:8091`, conservando el host original, `X-Forwarded-Proto: https`, la IP original y un timeout de lectura de 180 segundos. Si está disponible la extensión Docker de Plesk, usar su regla de proxy para el puerto del contenedor. Si se usa una plantilla Nginx, comprobar la configuración generada del vhost antes de introducir `location /`, para evitar duplicar una ubicación que Plesk ya genera.

El puerto del contenedor solo se publica en loopback. Plesk es la entrada HTTPS pública. No asociar este subdominio al documento raíz de `gestadia.com` ni reemplazar el stack del portal.

## Comprobar publicación y vuelta atrás

1. `https://app.gestadia.com/healthz` identifica el contenedor de la app (no la API).
   `/build-info.json` muestra la versión y el commit de origen incorporado con `VCS_REF`; comparar con la revisión que se ha construido.
2. `/app-config.js` y `/app-config.json` contienen `demoOnly: true` y key vacía.
3. `/api/health` y `/lidia/api/pluginweb/config` devuelven 503 de demo; no se consulta una plataforma externa.
4. El splash desaparece al cargar la interfaz y se muestran los datos ficticios.
5. Recorrer acceso/registro con datos de ejemplo, sondeo, documentación, mensajes, cliente/lead y notificaciones.
6. Servicios finaliza en «Revisa tu servicio» dentro de la app; no navega a un pago real.

Para volver atrás, desplegar la imagen anterior en el stack de la app y reiniciarlo. El contenedor no realiza migraciones ni altera la base del portal.

Nginx usa timeouts explícitos, mantiene cuerpos/cabeceras y no reintenta automáticamente POST de chat. [Módulo proxy de Nginx](https://nginx.org/en/docs/http/ngx_http_proxy_module.html). Los puertos y variables siguen la [especificación Compose](https://docs.docker.com/reference/compose-file/services/).
