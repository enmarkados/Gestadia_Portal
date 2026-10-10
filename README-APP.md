# Gestadia App

**Referencia para desarrollar:** [Manual de flujos y pantallas](docs/app/MANUAL-DESARROLLO.md). Explica cómo abrir los mapas y las capturas, seguir la navegación y mantenerlos junto al código. [README general](README.md).

Primera demo de Gestadia para **web, iOS y Android**, rama `app/main`, basada en el diseño de `RECURSOS/DISEÑO/GESTADIA-handoff-diseno/index.html`.

Por instrucción del usuario, esta entrega funciona **sin conexiones externas**: splash, acceso/registro de ejemplo, LidIA guiada, gestor, servicios, expedientes y documentos. No crea cuentas reales, no envía mensajes ni solicita pagos. `demoOnly: true` bloquea las conexiones y descarta sesiones reales antiguas.

```sh
npm run app:dev
npm run app:build
npm run app:preview
npm test --prefix frontend
```

La nueva [API conversacional APP](docs/integraciones/2026-10-05-entrega-portal-conversaciones-app.md) está incorporada en `app/main`, con cuenta validada, sesiones de dispositivo, S2S, recuperación y recibos de mensajes. La configuración versionada mantiene las conexiones desactivadas y la demo aislada; la integración Git no cambia la configuración ni despliega producción. Pruebas aisladas: `node scripts/test-app-conversations.mjs`. [Acta y reparto aceptado](docs/integraciones/2026-10-05-acta-inicio-conversacional.md).

Entrada: `frontend/app/`. Build: `frontend/dist-app/`. El portal conserva su build propio en `frontend/dist/`.

- [Alcance](docs/app/PRIMERA-VERSION.md)
- [Responsabilidades vigentes: flujos Zoho, backend Gestadia y conversaciones LidIA](docs/app/RESPONSABILIDADES-INTEGRACION.md)
- [Propuesta en revisión: LidIA sin cuenta, deeplink y vinculación al registrarse, sólo APP](docs/integraciones/2026-10-10-propuesta-app-anonima-lidia.md)
- [Contraste con LidIA: identidad, captura y solicitud de llamada pendientes](docs/integraciones/2026-10-10-contraste-portal-app-anonima.md)
- [Ajuste conversacional LidIA y contraste Portal, separado del contrato Zoho](docs/integraciones/2026-10-05-revision-portal-alcance-conversacional-app.md)
- [Conformidad técnica Portal con adenda conversacional 1.1 y anexos](docs/integraciones/2026-10-05-conformidad-portal-adenda-contexto-v1-1.md)
- [Conexión con la plataforma LidIA y gestor](docs/app/INTEGRACION-LIDIA.md)
- [Preparación del backend APP, identidad y alta por pago/Zoho](docs/integraciones/2026-10-03-app-lidia-backend-preparacion.md)
- [Respuesta técnica de LidIA y revisión Portal del contrato APP](docs/integraciones/2026-10-04-observaciones-portal-contrato-app-lidia.md)
- [Respuesta O1–O8 y contraste Portal de firma/DTO (05/10)](docs/integraciones/2026-10-05-revision-portal-respuesta-lidia-o1-o8.md)
- [Decisión vigente: POST Zoho al ganar el trato y acceso compartido Portal/APP](docs/integraciones/2026-10-05-decision-negocio-zoho-ganado-y-acceso.md)
- [Propuesta: acceso anticipado al convertir el lead en contacto y trato](docs/app/2026-10-05-propuesta-acceso-conversion-crm.md)
- [Publicación Docker, Portainer y Plesk](docs/app/DOCKER-PLESK.md)
- [Validación y pendientes](docs/app/VALIDACION.md)
- [Proyectos iOS y Android](docs/app/MOBILE.md)
- [Preparación App Store/Google Play: push, permisos y firma](docs/app/MARKETPLACES.md)
- [Diseño de acceso Apple y Google en ambas plataformas](docs/app/ACCESO-SOCIAL.md)
- [Mapa de pantallas y navegación contextual](docs/app/NAVEGACION.md)
- [Integración y sincronización en app/main](docs/app/2026-10-08-integracion-app-main.md)
- [Recibos de mensajes: pruebas conectadas web e iOS](docs/app/2026-10-08-recibos-conectados.md)
- [Glosario](GLOSARIO.md)

Para probar Docker localmente: `docker compose -f compose.app.yml up --build -d`. El contenedor expone la app en `127.0.0.1:8091`. El stack para Portainer está en `deploy/app/portainer-stack.yml`.

Los proyectos nativos empaquetan el mismo frontend con Capacitor. Ejecutar `npm run mobile:sync` antes de compilar. No necesitan Firebase, una base de datos o cuentas de plataforma para presentar la demo. La [instalación física en el iPhone de Gonzalo](docs/app/2026-10-08-iphone-gonzalo.md) y el ciclo conectado local web/simulador están comprobados; publicación en tiendas, despliegue del backend y aceptación física conectada se verifican por separado.

La preparación para tiendas solicitada el 08/10/2026 tiene una auditoría y propuesta escrita en los documentos anteriores. Está pendiente de revisión e implementación; el comportamiento actual continúa siendo el de la demo.

Preparación de tiendas y evidencia: [MARKETPLACES-CONFIGURACION](docs/app/MARKETPLACES-CONFIGURACION.md).

[Documento maestro APP Portal Docker y tiendas](docs/app/00-MAESTRO-APP-PORTAL-DOCKER.md) · [Plan de acción](docs/superpowers/plans/2026-10-10-app-portal-docker-tiendas.md)
Diseño de Mensajes y comprobaciones de la lista compacta: [Mensajes](docs/app/MENSAJES-DISENO.md).

[Plan de diseño de todas las pantallas y cobertura](docs/app/PLAN-DISENO-APP.md).

[Crear una nueva conversación con LidIA: contrato, recorrido y verificación](docs/app/2026-10-08-nueva-conversacion-lidia.md).

- [Mapas de pantallas y flujo APP sin cuenta, con capturas para aprobación](docs/app/2026-10-10-mapas-pantallas-app-anonima.md). Propuesta visual del 10/10/2026; no implementada.
