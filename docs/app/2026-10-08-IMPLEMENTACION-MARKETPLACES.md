# Plan de implementación: marketplaces Gestadia

> Ejecución: `superpowers:executing-plans`, en este chat, con TDD y revisión independiente final. El usuario aprobó ambos diseños y pidió llevarlos a cabo el 08/10/2026; esa autorización incluye ejecutar este plan y configurar los servicios descritos. No se vuelve a pedir permiso para cambios locales reversibles.

**Objetivo:** preparar firma y capacidades nativas, notificaciones remotas y acceso Apple/Google en ambas plataformas con identidad Gestadia compartida.
**Arquitectura:** Capacitor empaqueta React; Express/Prisma conserva la cuenta. APNs entrega en iOS, FCM en Android; los proveedores sociales se verifican en servidor. Las sesiones y dispositivos son revocables.
**Stack:** Capacitor 8, React 18, Express 4, Prisma 6/MySQL, JWT/JWKS, APNs HTTP/2 y Firebase Admin.
**Diseños vinculantes:** [MARKETPLACES.md](MARKETPLACES.md), [ACCESO-SOCIAL.md](ACCESO-SOCIAL.md).

## Restricciones globales

- Conserva la identidad `User.id`, las cuentas Portal/APP y el contrato CRM/LidIA.
- Firma/APNs de desarrollo y distribución separadas; no aceptar entorno APNs libre del móvil.
- Push sólo para sesiones revocables; JWT Portal legacy compatible y sin permiso de registro push.
- Ninguna fusión por email; vinculación con acceso Gestadia probado y alta confirmada sin trámites.
- Apple/Google en iOS y Android; callback Android sólo con código opaco y prueba de canje.
- Demo conserva su bloqueo externo; la release conectada necesita configuración completa y origen HTTPS.
- Secretos fuera del repositorio; nada de JWT nativo en localStorage/sessionStorage persistente.
- No push con información privada; navegar al aviso autorizado después de login.
- Registro de nombres nuevos en el glosario al introducirlos.
- Distribución/push/merge/despliegue/público se acreditan por separado; no activar servicios productivos ni publicar por deducción.

## Foco de revisión

1. Resultado social o callback push que llega después de logout/cambio de identidad: debe descartarse y revocarse.
2. Alta/vinculación concurrentes y replay de callback: una única asociación/consumo atómico.
3. Puente Apple Android: código robado sin prueba no abre sesión; no tokens en URLs/logs.
4. Worker reiniciado/doble proceso y token rotado: sin envíos privados a otra cuenta, reintento limitado.
5. Binario firmado por Play/TestFlight con configuración incompleta: no confundir debug con distribución ni abrir demo como login real.

Estado local 08/10: implementación y revisión corregidas; backend86/86, frontend96/96, preflight8/8, builds debug Android/iOS correctos. Task6, recepción/login reales, firma de distribución y eliminación definitiva pendientes.

Estado operativo y configuración: [MARKETPLACES-CONFIGURACION.md](MARKETPLACES-CONFIGURACION.md).

## Task 1: Inventario, aislamiento y base nativa de release

**Archivos:** `.gitignore`, scripts de preflight y pruebas Node, `frontend/android/app/build.gradle`, manifiesto/recursos, entitlements y Xcode, configuración Capacitor, ejemplos de configuración.
**Consume:** diseños aprobados y `com.gestadia.app` actual.
**Produce:** compilación debug preservada; release requiere firma/configuración válida; plugins nativos sincronizados con versiones fijadas.

- [x] Revisar Chrome para equipo Apple, cuenta Play y proyecto propio Gestadia. Reutilizar sólo recursos cuya pertenencia esté comprobada.
- [x] Escribir prueba que ejecuta preflight con demo, HTTP, paquete incorrecto, secretos cliente o datos de firma ausentes y exige rechazo.
- [x] Ejecutar `node --test scripts/mobile-preflight.test.mjs`; observar rechazo por falta de implementación.
- [x] Implementar validación y preparación de release; añadir firma desde configuración privada y entitlements por configuración.
- [x] Instalar plugins fijados de push/login/almacenamiento seguro, ejecutar `cap sync` y compilar iOS/Android según herramientas disponibles.
- [x] Ejecutar preflight contra configuración controlada válida e inválida; guardar evidencia de binario/entitlements.
- [x] Commit local sólo del bloque.

## Task 2: Sesiones revocables y protección de configuración

**Archivos:** `backend/prisma/schema.prisma`, migración, `backend/src/services/auth-sessions.js`, middleware/rutas auth, configuración móvil backend, pruebas Node.
**Interfaces:** `issueMobileSession(user, platform)` → `{token}`; `revokeSession(sessionId, userId)` → revocación y dispositivos; `requireAuth` añade `req.authSession` sólo para sesión vigente. JWT legacy mantiene su comportamiento.

- [x] Añadir pruebas de login nativo, token revocado/expirado/usuario retirado y logout idempotente; confirmar que legacy no registra push.
- [x] Ejecutar los tests dirigidos y observar fallos por el comportamiento ausente.
- [x] Implementar `AuthSession`, JWT con `jti`, validación durable y logout autenticado; mantener login Portal compatible.
- [x] Crear migración aditiva y verificar schema con `prisma validate`.
- [x] Ejecutar tests dirigidos y suite backend; commit local y actualizar evidencia.

## Task 3: Identidad social y callback Apple Android

**Archivos:** `backend/src/services/social-auth.js`, `social-tokens.js`, `backend/src/routes/social-auth.js`, schema/migración, configuración y tests.
**Interfaces:** `POST /api/auth/social/attempts` inicia proveedor/plataforma/propósito; `POST /api/auth/social/complete` valida respuesta nativa o canje Android; `POST /api/auth/social/account` confirma alta/vinculación; `POST /api/auth/social/apple/callback` recibe `form_post`. Desafíos 5 minutos y códigos de retorno 60 segundos, con consumo atómico.

- [x] Escribir fixtures JWT con claves de prueba y casos de firma, emisor, audiencia, nonce y vencimiento incorrectos.
- [x] Escribir casos de replay, vinculación a otro usuario, colisión email, consentimiento de alta y desafío ajeno.
- [x] Ejecutar pruebas rojas antes de implementar cada comportamiento.
- [x] Implementar verificación con JWKS oficiales, intercambio Apple y cifrado de credencial de revocación; datos ausentes no inventan identidad.
- [x] Implementar transacción de vinculación/alta confirmada y sesiones de Task 2.
- [x] Implementar retorno Apple Android con state/nonce, código opaco y prueba; limitar y limpiar intentos expirados.
- [x] Ejecutar suite backend y fixture de servicios/JWT real; commit local y documentar audiencias/callback esperado.
- [ ] Configurar callback real y validar recorrido HTTP con credenciales del proveedor.

## Task 4: Push durable, remitentes y autorización de dispositivos

**Archivos:** `backend/src/routes/push.js`, `backend/src/services/push/`, `notify.js`, schema/migración y tests.
**Interfaces:** `POST /api/push/devices` registra instalación/transporte/token en sesión revocable; `DELETE /api/push/devices/:installationId` revoca sólo registro propio; `GET /api/notificaciones/:id` obtiene sólo aviso propio. Worker consume `PushDelivery` de forma durable.

- [x] Casos rojos: legacy, propietario en body, entorno libre, cambio de cuenta, rotación, fallo de proveedor, logout y worker concurrente.
- [x] Implementar registro y entrega idempotente, token protegido y outbox transaccional con aviso interno.
- [x] Implementar APNs HTTP/2 y FCM, clasificación de fallos y reintento limitado, comprobando sesión/dispositivo antes de envío.
- [x] El worker no bloquea cambios de expediente y no duplica aviso interno; aceptación del proveedor no se llama recepción.
- [x] Ejecutar suite backend y prueba contra BD aislada cuando esté disponible; commit y registrar evidencia.

## Task 5: Adaptadores y UX nativa de login, sesión y avisos

**Archivos:** `frontend/app/src/social-auth.js`, `push.js`, almacenamiento seguro, `AppContext.jsx`, `Login.jsx`, `Notifications.jsx`, `main.jsx`, configuración y tests Vitest.
**Interfaces:** token en memoria durante ejecución, persistencia Keychain/Keystore en nativo; API existente conserva `getToken`, `setToken` y `request`. Adaptadores reciben sesión vigente y generación para descartar resultados tardíos.

- [x] Pruebas rojas de botones sociales, cancelación, datos incompletos, alta/vinculación confirmadas y respuesta tardía.
- [x] Implementar proveedores sólo con configuración disponible; no convertir fallos sociales en acceso demo.
- [x] Incorporar almacenamiento nativo seguro y cierre remoto pendiente si offline.
- [x] Pruebas rojas de rechazo de permiso, rotación, listener tardío y tap de aviso ajeno.
- [x] Implementar activar avisos, consultar permiso al volver de ajustes, registro autenticado y rutas internas admitidas.
- [x] Ejecutar Vitest y build app; arranque de demo en simulador iOS verificado; commit local.
- [ ] Validar login y push reales en ambos sistemas con los builds conectados exactos.

## Task 6: Configuración de cuentas y aceptación de distribución

**Estado externo 09/10/2026:** titularidad y acciones específicas confirmadas. App ID/perfil/Services ID/retorno y tres claves Apple, tres clientes Google, Firebase Android y cuenta FCM limitada creados. Custodia privada y preflight verificados. Backend pendiente: app.gestadia.com no resuelve en DNS. Consentimiento Google en Prueba, sin usuarios; builds de distribución y aceptación física pendientes.

**Archivos:** inventario operativo sin secretos, configuración pública generada y recursos privados fuera de Git.
**Consume:** App ID/paquete, certificados públicos, audiencias y callbacks de los bloques anteriores.

- [x] Confirmar titularidad del equipo/proyecto antes de registrar nuevos recursos.
- [x] Apple: comprobar/registrar App ID, push y Apple; Services ID/callback; claves APNs y Apple separadas.
- [x] Google: Firebase Android, clientes web/iOS/Android por huella, pantalla consentimiento mínima.
- [ ] Google: cuenta de prueba y URLs legales verificadas antes de consentimiento público.
- [ ] Firma: clave upload recuperable, perfiles Apple y certificados reales; artefactos de prueba firmados.
- [x] Al crear credenciales/IAM o aceptar términos en la UI, pedir la confirmación específica que exige la política del navegador; continuar trabajo local independiente mientras llega.
- [ ] No enviar a tiendas una demo declarada como conectada. Configuración sin backend desplegado permanece pendiente de distribución conectada.
- [ ] Probar builds TestFlight/Play interno sólo tras habilitar su entorno y distribución; registrar build exacto y observación de push/login.

## Task 7: Borrado de cuenta, revisión y cierre con evidencia

**Límite concreto:** retirada de acceso y petición de borrado implementadas; eliminación/retención/LidIA y URL pública Play pendientes.

**Archivos:** rutas/servicios de retirada, pantalla Cuenta, tests y documentación de validación.

- [x] Implementar petición autenticada/reautenticada de borrado, revocación de sesión/push/Apple y estado durable; no borrar expedientes con retención sin política acordada.
- [ ] Informar al usuario del estado real; coordinar retirada conversacional según contrato vigente.
- [x] Suite backend/frontend, `prisma validate`, build app y compilaciones nativas; registrar límites concretos.
- [x] Revisión independiente de toda la rama usando los diseños y foco anterior; corregir problemas relevantes con TDD.
- [x] Actualizar validación y estado de los diseños, commit local y handoff de cuentas/configuración.
- [x] Reportar por separado código, firma, cuentas, distribución, recepción push y autenticación real. Publicación pública sigue pendiente hasta su autorización y aceptación.

## Continuación Docker/Portainer — 10/10/2026

El usuario ha confirmado que `app.gestadia.com` ya existe y que la web y los
servicios necesarios deben alojarse en Docker dentro de Portainer. Acceso a
Plesk confirmado en Chrome y Portainer confirmado en el navegador de Codex.
HTTPS del subdominio verificado sin omitir validación TLS; la API móvil devuelve
404. Stack nuevo de web/API, configuración pública completa y montaje privado
preparados. Cinco pruebas Docker pasan y las seis migraciones se aplicaron en
MariaDB de prueba. La API precarga dotenv antes de módulos ESM.

Inspección de la base real mediante `prisma migrate status` (solo lectura): las
cuatro primeras migraciones están aplicadas; faltan `20261008120000_mobile_identity_push`
y `20261008130000_apple_revocation`. Las credenciales vigentes del Portal se
copiaron a custodia privada fuera del repositorio, sin exponer sus valores.
La conexión a esa base es accesible desde Docker local. Pendientes: backup
consistente, importación de imágenes x86_64 en Portainer, montaje de claves
y entorno privado en el servidor, migraciones explícitas y proxy Plesk,
validación externa de capacidades y aceptación de login/push en dispositivo.
No hay despliegue ni publicación acreditados por las pruebas locales.
