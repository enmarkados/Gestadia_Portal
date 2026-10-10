# Plan de acción Gestadia APP Portal Docker y tiendas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Ejecución continua en este chat solicitada expresamente por Gonzalo; las preguntas pendientes solo detienen sus pasos dependientes.

**Goal:** Llevar APP y Portal compatibles a Docker, completar identidad/push/privacidad y publicar builds verificadas en Apple y Google.

**Architecture:** Dos frontends con dominios y builds separados consumen un backend común en Docker. Plesk publica HTTPS; DB y documentos existentes se conservan inicialmente. El corte sustituye el runtime actual del Portal solo tras validación y backup.

**Tech Stack:** React/Vite, Capacitor 8, Node 22, Express, Prisma/MySQL, Nginx, Docker Compose/Portainer, Plesk, APNs, Firebase FCM, Apple/Google OAuth.

**Spec:** `docs/app/00-MAESTRO-APP-PORTAL-DOCKER.md`. Contratos conversacionales de app/main y diseños MARKETPLACES.md/ACCESO-SOCIAL.md se conservan al reconciliar.

## Global Constraints

- app.gestadia.com se sirve desde Docker en Portainer; el Portal actualizado se despliega también en Docker.
- IDs públicos de Gestadia ya registrados se conservan; no reutilizar proyectos ni credenciales de LIA.
- El dispositivo nunca elige agente, entorno, operador, departamento ni CRM ID; se resuelven en servidor.
- Conservar clientes, expedientes, archivos, Stripe/Zoho/SMTP, contratos APP y aislamiento de WhatsApp.
- Cuentas sociales requieren vinculación validada; el correo coincidente no habilita trámites por sí solo.
- Ningún secreto en Git, imágenes, configuración pública, artifact, logs o chats; mounts privados con permisos mínimos.
- Toda nomenclatura nueva entra en GLOSARIO.md en el momento de introducirla.
- TDD para cambios de comportamiento; checks de configuración y pruebas de runtime para despliegue.
- No atribuir distribución, login real, entrega push ni publicación a un fixture/build/healthcheck.
- MariaDB no se traslada ni se reemplaza por una DB vacía en esta fase.
- Alcance elegido: web completa gestadia.com y /portal en Docker. Cuenta de prueba sistemas@enmarkados.com autorizada.
- Emuladores iOS/Android siempre secuenciales; iPhone físico del usuario autorizado. Android se verifica en emulador con servicios Google, sin afirmar aceptación física.

## Review Focus

1. Clientes de ambas superficies con tokens antiguos tras logout/baja: Task 3 prueba revocación coherente y evita reactivar acceso.
2. Aviso creado por Portal mientras el consumidor reinicia: Task 3 prueba creación transaccional, lease y reintento, sin perder bandeja/email.
3. Documentos previos y recién subidos: Task 4/7 prueban lectura cruzada sin 410, acceso de otro usuario 403/404 y mount persistente.
4. Checkout y callbacks repetidos durante corte: Task 7 prueba cobro real e idempotencia; Stripe ausente no autoriza fulfillment en producción.
5. Builds anteriores, permiso rechazado y cambio de cuenta: Task 8/9 comprueban compatibilidad, limpieza de dispositivo y payload privado genérico.

---

### Task 1: Inventario y baseline de producción

**Files:** crear `docs/app/ESTADO-APP-PORTAL-DOCKER.md`; evidencia pública sin datos personales en `artifacts/inventario-docker-20261010/`; documentos privados de DB/archivos/config fuera de Git.
**Interfaces:** produce baseline de rutas, assets/hash, runtime, migraciones, montajes, callbacks y rollback para Tasks 4/7. Consume acceso de paneles ya facilitado.

- [x] Consultar `/`, `/portal/acceso`, `/api/health` y capacidades móviles por HTTPS y registrar status/assets/hash. Resultado: 200/200/200/404.
- [x] Comparar app/main con marketplaces: a6d6e14; 33 commits pendientes en marketplaces. Registrar que las imágenes previas no son release integrada.
- [ ] Identificar runtime y SHA servido mediante Plesk y archivos/versiones; no inferirlos del checkout local.
- [ ] Inventariar rutas `/api`, `/webhooks`, APP/S2S, documentos, correo, CRM, tareas y proxies sin imprimir credenciales.
- [ ] Documentar backup/restauración vigentes y rollback del servicio/proxy. Crear backup fresco inmediatamente antes del corte.
- [ ] Verificar baseline y commit de acta/docs; no modificar producción en este bloque.

### Task 2: Integrar marketplaces sobre app/main vigente

**Files:** modificaciones compartidas de `backend/prisma/schema.prisma`, `backend/src/app.js`, `config.js`, `middleware/auth.js`, `frontend/app/src/AppContext.jsx`, `App.jsx`, `api.js`, `native.js`, package/locks; conservar `backend/src/app/`, `frontend/app/src/AppConversation.jsx`, navegación/recibos y scripts integrados.
**Interfaces:** produce una única revisión integrada que consumen Tasks 3/4/8. Las APIs APP existentes conservan contratos; AuthSession móvil no sustituye sin adaptación AppSession conversacional.

- [x] Guardar documentación actual; actualizar referencias remotas por fetch y comparar hashes.
- [x] Integrar app/main en la rama aislada sin reescribir historia compartida. Resolver conflictos conservando contratos, columnas/migraciones y funciones de ambas líneas.
- [x] Ejecutar `node scripts/test-app-conversations.mjs`, pruebas marketplace backend con DB explícita y frontend. Resultado exigido: suites sin fallos ni omisiones inesperadas.
- [x] Añadir primero regresiones de sesión móvil conversacional, rechazo del JWT Portal, logout/baja y prueba fechada del alta social; observar RED (3 fallos).
- [x] Implementar adaptación a la identidad vigente sin permitir selección de agente/CRM; GREEN 201 backend/165 frontend, build APP y Portal.
- [x] Commit de integración 08d2bbc; base app/main a6d6e14 y suites/builds registrados. Las imágenes finales deben construirse desde esta línea, no desde la preparación antigua.

### Task 3: Identidad compartida revocación y productor push

**Files:** `backend/src/middleware/auth.js`, `backend/src/routes/auth.js`, `backend/src/services/auth-sessions.js`, `notify.js`, `push.js`, `account-deletion.js`; contratos `backend/src/app/identity.js`/lifecycle; pruebas de esos componentes.
**Interfaces:** `notifyUser(user,{titulo,cuerpo,expedienteId,email})` conserva bandeja/email y genera entregas durables; `pushService.notify(data)` permanece transaccional; `requireAuth(req,res,next)` rechaza accessRevokedAt y sesiones revocadas en las superficies correspondientes.

- [x] RED: aviso real del productor genera una Notificacion y una PushDelivery por dispositivo válido; rollback de la transacción no deja entrega huérfana; preservar email.
- [x] RED: token antiguo de APP/Portal no vuelve a acceder después de revocación/baja; sesión conversacional pierde acceso sin tocar WhatsApp.
- [x] Implementar integración de productor/consumidor y reglas coherentes de revocación; ninguna cuenta social otorga permisos CRM automáticamente.
- [x] GREEN: pruebas DB de revocación y productor real; suites completas 204 backend/165 frontend. Reinicio/lease y revocación Apple tienen pruebas aisladas; aceptación con proveedor real permanece en Task 9.
- [x] Commit y registrar exactamente qué procesos producen avisos y cuál envía a proveedores.

### Task 4: Contenedores Portal APP y backend común

**Files:** crear `deploy/portal/Dockerfile`, `deploy/portal/default.conf.template`, `deploy/gestadia/portainer-stack.yml`, `deploy/gestadia/stack.test.mjs`; modificar `deploy/app/Dockerfile.backend`, plantillas APP, GLOSARIO/DOCKER-PLESK. No copiar frontend dist ni secrets indiscriminadamente al contexto.
**Interfaces:** servicios `gestadia-app`, `gestadia-portal-web`, `gestadia-backend`; ambos proxies usan el backend privado; mount de documentos existente y backend.env privado. Rutas comerciales solo por superficie Portal con configuración real.

- [x] Usar alcance web completa: rutas y build web conservados; assets APP separados.
- [x] RED: stack prueba `/portal/acceso`, APP, APIs autorizadas y documentos de fixture; checkout APP fuera de contrato devuelve rechazo; usuario ajeno no lee documento.
- [x] Construir web Portal y backend común reproducibles, usuario no root, API sin puerto host, loopback web, TLS externo, rotación logs y health/readiness comprobables.
- [ ] Vincular el almacén vigente de documentos; no reemplazarlo por el volumen vacío de la preparación móvil.
- [x] GREEN: arranque AMD64, proxy/CORS/IP y sesiones, relectura después de reinicio, builds/versiones coincidentes. `docker compose config --quiet` y tests runtime.
- [x] Commit de preparación del conjunto con runtime local: 6/6 configuración y 7/7 stack + reinicio, AMD64 y suites 204/165.
- [ ] Importar imágenes finales por commit/config digest y preparar Portainer sin cortar el servicio vigente. Se difiere la importación hasta incorporar textos/baja y dependencias de release para evitar desplegar una candidata incompleta.

### Task 5: Contenido conectado documentos y contrato LidIA

**Files:** `frontend/app/src/legal-content.js`, `LegalPage.jsx`, `AccountDeletion.jsx`, `Expedientes.jsx`, `AppConversation.jsx`, navegación/recibos y configuración pública; documentación de integración.
**Interfaces:** la interfaz presenta solo funciones activas; conversación usa el contrato APP servidor de Task 2; documentos usan Task 4; enlaces legales permanecen públicos.

- [x] Revisar pantallas vigentes en NAVEGACION.md recuperado de app/main; conservar diseño/menús.
- [x] RED: contenido conectado sin demo y baja externa accesible; fallo real de entrada directa reproducido en navegador y prueba de recursos. Permisos se conservan en sus pruebas anteriores.
- [ ] Integrar documentos compartidos, mensajes/recibos y servidor LidIA del contrato vigente; validar selección de identidad únicamente servidor.
- [x] Preparar privacidad/condiciones/soporte/eliminación acordes con datos efectivos. Criterio confirmado y redacción autorizada a Codex; usar la política publicada y no inventar plazos.
- [x] GREEN local: 168 frontend, builds APP/web, entrada directa 1/1 y UI pública observada; documentos compartidos probados en Task 4.
- [ ] Interacción autorizada real de conversación/documentos/recibos y credenciales APP server-side en LidIA.
- [x] Commit de contenido; evidencia local separada de validación externa.

### Task 6: Borrado operativo y preparación de tiendas

**Files:** `backend/src/services/account-deletion.js`, proceso de baja correspondiente, schema/migración si necesaria; página `/legal/delete-account`, actas de privacidad/datos.
**Interfaces:** solicitud autorizada pasa de pending_review a un resultado verificable de eliminación/conservación; revoca Apple y accesos APP/Portal/LidIA, informa al usuario. La URL pública permite pedir baja sin reinstalar la app.

- [x] Leer política publicada, recibir criterio confirmado y autorización de textos a Codex.
- [x] Elaborar inventario de datos/terceros y conservación por categoría; operación privada documentada en docs/legal/OPERACION-BAJA.md.
- [x] RED: solicitud autenticada reciente, prueba de titularidad web, reintentos, confirmación y retirada de acceso; expediente sin revisión no se elimina; productor tardío no debe recrear avisos.
- [x] Implementar procesador con estados/resultado trazables y coordinación de proveedores; revisión operativa, huella viva, archivo restringido y naming inmediato en GLOSARIO.
- [x] GREEN en cuentas/DB de prueba: 208 backend/168 frontend, baja ejecutada, conservación documentada, Apple/reintentos y URL pública funcional. No se purgan usuarios de producción como prueba.
- [ ] Commit y completar declaraciones Apple/Google con los datos realmente tratados.

### Task 7: Migración validada y corte Docker

**Files:** acta Task 1, compose definitivo, instrucciones Plesk/proxy, verificación de versión y rollback.
**Interfaces:** consume Tasks 2–6 e imágenes finales; produce Portal/APP/API servidos desde Docker con versiones observadas.

- [ ] Backup fresco de DB/documentos/config/proxy y prueba de restauración; inventariar TODAS las migraciones integradas, no solo las dos móviles antiguas.
- [ ] Probar migración y compatibilidad de retorno en copia aislada; comprobar checkout real/webhooks idempotentes y avisos completos.
- [ ] Preparar mounts privados, propietarios/permisos, proxy y worker único. Presentar confirmación concreta cuando la nueva API recibe datos/credenciales/acceso público, según política del navegador.
- [ ] Después de confirmación requerida, aplicar migraciones explícitas, arrancar conjunto Docker y cambiar proxy en ventana acordada; desactivar workers anteriores de forma controlada.
- [ ] Verificar externamente HTTPS, SHA/assets, capacidades, login/cierre, expediente/documento antiguo/nuevo, checkout/webhooks, avisos y conversación autorizada.
- [ ] Registrar resultado y dejar instrucciones de vuelta atrás; mantener parada la versión anterior durante aceptación, sin despachar dos veces.

### Task 8: Release iOS Android y firma

**Files:** `scripts/mobile-release.mjs`, `mobile-preflight.mjs` y tests; Capacitor/Android/iOS configuración/entitlements; configuración privada de release fuera de Git.
**Interfaces:** capabilities reales Task 7 coinciden con clientes públicos empaquetados; Android upload/Play signing e iOS distribución corresponden a com.gestadia.app y equipo vigente.

- [ ] RED cuando falte backend, demoOnly true, configuración incompleta, firma debug o audiencia/proyecto distinto.
- [ ] Preparar release con `node scripts/mobile-release.mjs android --build` y equivalente `ios --build` usando rutas privadas de inputs, sin imprimir secretos.
- [ ] Verificar AAB/archivo iOS: firma, versión/build, bundle ID, APNs production y Apple/Google; exportar IPA con perfil correcto.
- [ ] Registrar checksums y upload; gestionar Play App Signing, cuentas de prueba y consentimiento Google para release. Las aceptaciones contractuales requieren titular/confirmación específica.
- [ ] Publicar TestFlight y pista interna Play; verificar disponibilidad real del build exacto, no solo upload.

### Task 9: Aceptación móvil real

**Files:** matriz `docs/app/ACEPTACION-TIENDAS.md`, evidencias sin datos personales, correcciones con TDD y nuevos builds cuando proceda.
**Interfaces:** consume builds Task 8 y cuenta/dispositivos de prueba autorizados; produce aceptación por plataforma y build.

- [ ] Confirmar iPhone y Android disponibles; usar cuenta de prueba, nunca documentos de un cliente real.
- [ ] Google y Apple en cada plataforma: login, alta/vínculo, cancelación, correo oculto Apple, logout, reentrada y baja.
- [ ] Push: permitir/rechazar/revocar, foreground/fondo/cerrada, abrir aviso propio, logout/cambio de cuenta y offline; observar aviso generado por el Portal real.
- [ ] Documentos, expediente, conversación/gestor/recibos y retorno de checkout; correlación servidor, sin IDs elegidos por dispositivo.
- [ ] Corregir fallos, distribuir build nueva y repetir solo los recorridos afectados; cerrar matriz con resultado real y versión.

### Task 10: Revisión final y publicación

**Files:** ficha/actas App Store/Play, matriz, estado y artifact; descripción final de revisión código.
**Interfaces:** consume gates Tasks 1–9; produce app disponible en cada marketplace y URL/versión observadas.

- [ ] Revisión técnica final con contexto independiente del conjunto integrado; resolver fallos importantes con RED/GREEN y suites.
- [ ] Completar screenshots, descripción, categorías, privacidad/datos, permisos, soporte, URL baja y acceso de revisión. No anunciar funciones que no estén activas.
- [ ] Resolver requerimientos de titularidad/contratos del titular sin aceptar acuerdos por inferencia.
- [ ] Enviar a revisión; comprobar resultado por tienda y atender rechazos. Aprobación de tienda y publicación son estados separados.
- [ ] Publicar según canal autorizado y verificar disponibilidad/versión; registrar URL de tienda y estado servido.
- [ ] Actualizar documento maestro y artifact, dejando pendientes explícitos y seguimiento operativo tras release.

## Registro de ejecución

10/10: Task 1 iniciado. Consultas públicas y comparación Git completas; inventario panel/SHA pendiente. Alcance web completa confirmado; cuenta y dispositivos de prueba autorizados; política de conservación necesita propuesta comprensible. No se ha cambiado producción ni se ha solicitado una nueva aprobación general.

10/10: merge 08d2bbc y revocación/productor común verificados localmente; 204 backend/165 frontend. Criterio de baja confirmado, textos autorizados a Codex. Stack integrado y borrado efectivo siguen pendientes.
