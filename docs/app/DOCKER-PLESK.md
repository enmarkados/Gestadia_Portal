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

## Stack móvil conectado — 10 de octubre de 2026

La APP en `app.gestadia.com` requiere web Nginx y API Express. La configuración
se encuentra en `deploy/app/portainer-mobile-stack.yml`; el stack demo anterior
conserva su funcionamiento. Consulte [el glosario](../../GLOSARIO.md).

Construir desde la raíz del checkout aprobado, para el servidor x86_64:

```sh
docker build --platform linux/amd64 -f deploy/app/Dockerfile --build-arg APP_PROXY_TEMPLATE=mobile.conf.template --build-arg VCS_REF=<sha> -t gestadia-app:<sha> .
docker build --platform linux/amd64 -f deploy/app/Dockerfile.backend -t gestadia-mobile-api:<sha> .
docker save gestadia-app:<sha> gestadia-mobile-api:<sha> | gzip > gestadia-mobile-images.tar.gz
```

Importar imágenes en el entorno `local` de Portainer. Establecer las variables
`GESTADIA_APP_IMAGE` y `GESTADIA_API_IMAGE` con esas etiquetas, y comprobar que
8091 está libre antes de crear el stack. Solo Nginx publica
`127.0.0.1:8091`; la API permanece dentro de la red Docker.

Preparar en el host, fuera de cualquier document root:

- `/opt/gestadia/mobile/mobile-release.json`: solo configuración pública.
- `/opt/gestadia/mobile/backend.env`: configuración vigente del Portal
  (DATABASE_URL, JWT_SECRET e integraciones necesarias) más configuración móvil.
  Preservar la clave JWT existente; no crear otra base de usuarios.
- `/opt/gestadia/mobile/secrets/`: únicamente claves Apple de login, APNs del
  entorno elegido y credencial Firebase FCM. Ajustar las rutas en backend.env a
  `/run/gestadia-secrets/<archivo>`. No incluir claves de firma de tiendas.

Asignar propietario UID 1000 al archivo privado y los secretos, permiso 0400
a archivos y 0700 al directorio privado. Todos se montan en solo lectura.
La imagen API inicia con `node --import dotenv/config src/server.js` para cargar
el archivo antes de evaluar la configuración ESM. Los uploads tienen volumen
persistente. Plesk proporciona TLS y el proxy hacia 127.0.0.1:8091. La plantilla
`mobile.conf.template` conserva la IP de cliente de Plesk para Express, cuyo
proxy de confianza tiene un salto. No publicar directamente el puerto Nginx.

Antes de conectar la API: verificar acceso de Docker a la base compartida,
obtener una copia consistente de la base y comprobar las migraciones existentes.
Aplicar las pendientes explícitamente con `npm run migrate:deploy` en la imagen
API; el arranque no modifica el esquema. Los healthchecks comprueban procesos,
no prueban acceso a base ni login/push real.

Validación local realizada con base MariaDB 11.4.12 de prueba: seis migraciones
aplicadas, cinco comprobaciones Docker aprobadas (configuración pública, rechazo
de secretos/configuración incompleta, demo heredada y paso Nginx → API con
capacidades móviles reales, 401 sin sesión y navegación SPA). Se usaron
credenciales de proveedor ficticias; no se envió push ni se inició sesión Apple
/Google en dispositivo. Ejecutar la prueba de integración contra el stack local:

```sh
GESTADIA_STACK_TEST_URL=http://127.0.0.1:18091 GESTADIA_STACK_TEST_CONFIG=/ruta/publica/mobile-release.json node --test deploy/app/40-app-config.test.mjs deploy/app/mobile-stack.test.mjs
```

Inspección del servidor: Plesk contiene el subdominio (dominio 252, suscripción
74), certificado Lets Encrypt válido hasta 2027-01-08, redirección HTTPS activa
y ninguna regla Docker para la APP. HTTPS responde con 404 en
`/api/mobile/capabilities`: la API móvil todavía no está desplegada. Portainer
está accesible en el navegador Codex, entorno local Docker 29.9.0, Debian 12
x86_64; no se observó stack/contenedor Gestadia APP en los filtros.

Base compartida real accesible desde Docker local: `gestadia_portal_db` en
`gestadia.com:3306`. `prisma migrate status` confirmó las cuatro primeras
migraciones aplicadas y las dos móviles pendientes; no se modificó el esquema.
Si se transfieren los archivos con Plesk, usar un directorio privado fuera de
httpdocs/app.gestadia.com y establecer `GESTADIA_MOBILE_CONFIG_DIR` con su ruta
absoluta; conservar los permisos privados y propietario del proceso Node.
