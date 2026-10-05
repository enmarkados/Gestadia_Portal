# Gestadia App

Primera demo de Gestadia para **web, iOS y Android**, rama `app/main`, basada en el diseño de `RECURSOS/DISEÑO/GESTADIA-handoff-diseno/index.html`.

Por instrucción del usuario, esta entrega funciona **sin conexiones externas**: splash, acceso/registro de ejemplo, LidIA guiada, gestor, servicios, expedientes y documentos. No crea cuentas reales, no envía mensajes ni solicita pagos. `demoOnly: true` bloquea las conexiones y descarta sesiones reales antiguas.

```sh
npm run app:dev
npm run app:build
npm run app:preview
npm test --prefix frontend
```

Entrada: `frontend/app/`. Build: `frontend/dist-app/`. El portal conserva su build propio en `frontend/dist/`.

- [Alcance](docs/app/PRIMERA-VERSION.md)
- [Conexión con la plataforma LidIA y gestor](docs/app/INTEGRACION-LIDIA.md)
- [Preparación del backend APP, identidad y alta por pago/Zoho](docs/integraciones/2026-10-03-app-lidia-backend-preparacion.md)
- [Respuesta técnica de LidIA y revisión Portal del contrato APP](docs/integraciones/2026-10-04-observaciones-portal-contrato-app-lidia.md)
- [Respuesta O1–O8 y contraste Portal de firma/DTO (05/10)](docs/integraciones/2026-10-05-revision-portal-respuesta-lidia-o1-o8.md)
- [Decisión vigente: POST Zoho al ganar el trato y acceso compartido Portal/APP](docs/integraciones/2026-10-05-decision-negocio-zoho-ganado-y-acceso.md)
- [Publicación Docker, Portainer y Plesk](docs/app/DOCKER-PLESK.md)
- [Validación y pendientes](docs/app/VALIDACION.md)
- [Proyectos iOS y Android](docs/app/MOBILE.md)
- [Glosario](GLOSARIO.md)

Para probar Docker localmente: `docker compose -f compose.app.yml up --build -d`. El contenedor expone la app en `127.0.0.1:8091`. El stack para Portainer está en `deploy/app/portainer-stack.yml`.

Los proyectos nativos empaquetan el mismo frontend con Capacitor. Ejecutar `npm run mobile:sync` antes de compilar. No necesitan Firebase, una base de datos o cuentas de plataforma para presentar la demo. Firma para dispositivos iOS, App Store y Google Play, cuentas reales y conexión con LidIA quedan para una fase posterior.
