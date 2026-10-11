# Contrato actual para integrar recorridos

11/10/2026. Inspección de la rama `codex/gestadia-marketplaces`, HEAD `f7cf8ac`. Documento informativo para integrar sobre APIs reales; no modifica contratos ni autoriza despliegues adicionales.

## Diferencias funcionales que debe resolver Portal

- **Acceso social existente:** `backend/src/services/social-auth.js`, `decision`, emite sesión cuando existe `SocialIdentity` por emisor/sujeto. Sin identidad vinculada devuelve `existing_account_required` si coincide email, o `account_required` si no coincide. No inicia sesión directamente por coincidencia de email. `account(action=link)` exige intento de vinculación ligado a una sesión Gestadia vigente. Cambiar a identificación por email verificado sin login previo requiere modificar el backend y pruebas; no basta cambiar Login.jsx. Conservar firma, audiencia, emisor, nonce, consumo atómico, usuario activo y prohibición de recibir userId/zohoContactId del dispositivo. Apple relay no equivale al correo real de CRM.
- **Alta social:** `account(action=create, confirm=true)` actualmente crea User con email validado, consume el intento, vincula SocialIdentity y emite sesión. La nueva petición de no autorregistro social requiere retirar esa vía y llevar al recorrido ordinario de crear cuenta/contratar servicio, incluyendo su decisión de identidad y contratación. No resolver solo ocultando el botón; revisar endpoint y pruebas.
- **UI push:** `PushSettings.jsx` muestra Activar y Desactivar; no existe aún el toggle ni toast verde/rojo descrito en el aviso del otro chat. `push.js` solicita permiso solo con enable(), registra transporte APNs/FCM, persiste preferencia en almacenamiento seguro y revoca este dispositivo al desactivar. No confundir permiso concedido con inscripción confirmada: Activadas se comunica después del POST de registro exitoso. Desactivar no retira el permiso del sistema. Preservar cancelación/cambio de sesión y reintento de inscripción.
- **Destino de un push:** el cliente recibe notificationId, consulta `/api/notificaciones/:id` con sesión y resuelve expediente a `/tramites/:id` o, sin expediente, `/cuenta`. Cualquier cambio de destinos y lectura requiere revisar autorización y datos del aviso; no usar un destino libre recibido por push. Filtros, gestos y prompt de la campana necesitan su revisión UI y API.

## Contratos y archivos a conservar

`social-auth.js` cliente usa attempts/complete/account, propósito login/link, prueba del intento y generación de cancelación. Apple Android retorna únicamente código opaco a gestadia://auth/apple; canje con prueba en almacenamiento seguro. `AuthSession` y revocación mantienen push y logout ligados a sesión real.

`ACCESO-SOCIAL.md` es diseño histórico del 08/10, con estados iniciales; no atribuir sus encabezados de no implementación al runtime actual ni reescribir actas históricas. Actualizar una revisión viva con las decisiones humanas nuevas.

La integración de movimiento conserva PageMotion/useSheetMotion/useMessageMotion, estado de escritura en AppConversation, y ajuste iOS de teclado: SceneDelegate.swift, GestadiaViewController, storyboard, native.js y Keyboard.resize none. Si se modifica Swift o configuración, recompilar; un build web no actualiza una app nativa instalada.

## Distribución observada

TestFlight Gestadia 0.1.0 (2), código ee64f8d, asignada a Gestadia QA y En pruebas. Play interno 0.1.0 (2), Activo y disponible para testers internos. Apple todavía muestra build (1) instalada en el iPhone; aceptación física de (2) pendiente. Build (2) no contiene los cambios futuros de recorridos del otro chat. OAuth nativo y APNs reales siguen pendientes.

Conservar equipo Apple X27NG7M487, bundle com.gestadia.app, firma Android Upload/Play, clientes OAuth públicos y configuración privada fuera de Git. No copiar claves al documento ni regenerar credenciales al hacer merge. Se mantiene el emulador LIA del otro chat y no se abre un segundo emulador.

Producción Docker mantiene versiones anteriores: APP/Portal be6806d y backend e8f1a86. Integrar la rama, compilar o publicar el build (2) no acredita redespliegue de esos servicios. Cualquier nuevo candidato deberá identificar SHA, build number siguiente y pruebas de recorridos antes de nueva distribución.
