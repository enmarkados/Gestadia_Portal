# PNT — Subida de documentación por el cliente y uso del backend

| | |
|---|---|
| **Código** | PNT-PORTAL-01 |
| **Versión** | 1.0 |
| **Fecha** | 2026-07-24 |
| **Sistema** | Portal de cliente Gestadia (gestadia.com) |
| **Componentes** | Frontend React + Backend Node/Express + BD MySQL + integraciones (Zoho, Stripe, SMTP) |

---

## 1. Objeto

Describir, paso a paso, **cómo el cliente sube su documentación** al portal y **qué hace el backend** con ella (almacenamiento, seguridad, avisos al gestor y registro), así como el uso general del backend.

## 2. Alcance

Aplica a la documentación que el cliente aporta a través del **área de cliente** de `gestadia.com`. No cubre la documentación recibida por otros canales (p. ej. WhatsApp), que se gestiona manualmente.

## 3. Responsables

- **Cliente:** sube su documentación desde el área de cliente.
- **Gestor:** recibe el aviso, revisa la documentación y hace avanzar el trámite.
- **Sistemas / soporte técnico:** mantenimiento del backend, del servidor y de las copias de seguridad.

## 4. Definiciones

- **Expediente:** cada servicio contratado por un cliente (p. ej. "Duplicado de Carnet", nº de pedido `GST-…`). Tiene un **estado** que refleja su progreso.
- **Checklist:** lista de documentos requeridos para ese servicio (definida en el catálogo del sistema; en el Canje se amplía según el país).
- **Estado / Fase:** el estado del expediente en el portal (Pago pendiente → Pago recibido → Falta documentación → En gestión → Presentado → Completado). El gestor lo hace avanzar desde **Zoho** (campo "fase"), que se sincroniza al portal.
- **Backend:** aplicación Node/Express desplegada en el servidor (Plesk/Passenger) que sirve la web, la API del portal y las integraciones.

---

## 5. Procedimiento A — El cliente sube la documentación

1. **Acceso.** Tras el pago, el cliente recibe un email para **crear su contraseña**. Con ella entra en el área de cliente (`gestadia.com`, apartado "Acceder"). La sesión se mantiene con un token seguro.
2. **Selección del expediente.** En "Mis servicios" ve sus expedientes; abre el que corresponda.
3. **Revisión del checklist.** El expediente muestra la **lista de documentos requeridos**; cada uno indica si ya está **subido** o **pendiente**.
4. **Subida.** Por cada documento pendiente, el cliente selecciona el fichero desde su dispositivo y lo sube. Requisitos que el sistema **valida automáticamente**:
   - **Formatos admitidos:** JPG, PNG, WEBP o PDF.
   - **Tamaño máximo:** 10 MB por fichero.
   - Se sube **un fichero por documento del checklist**.
5. **Confirmación.** Al subir correctamente, el documento pasa a "subido" en el checklist. El cliente repite hasta completar todos los documentos.
6. **Documentación completa.** Cuando el checklist queda completo, el sistema registra un hito y el expediente queda **"pendiente de revisión por el gestor"**.

> *Canal alternativo:* el cliente también puede enviar la documentación por **WhatsApp**; en ese caso no pasa por este procedimiento y la gestiona el gestor manualmente.

---

## 6. Procedimiento B — Qué hace el backend con cada documento

Al recibir una subida (endpoint autenticado `POST /api/expedientes/:id/documentos`), el backend:

1. **Verifica identidad y propiedad.** Solo el cliente autenticado y **dueño de ese expediente** puede subir. Se comprueba el token y que el expediente sea suyo.
2. **Valida el fichero** (formato y tamaño; ver §5.4). Si no cumple, lo rechaza con un mensaje.
3. **Almacena el fichero en el servidor**, en la carpeta `backend/uploads/` (fuera de la zona pública del sitio), con un **nombre aleatorio** (UUID + extensión) para que no sea adivinable ni accesible por URL directa.
4. **Registra el documento en la base de datos** (tabla `Documento`): a qué expediente pertenece, a qué documento del checklist (`clave`), el **nombre original**, el tipo (`mime`), el tamaño y el **nombre de fichero en disco** (`path`).
5. **Avisa al gestor en Zoho:** añade una nota al trato del cliente indicando qué documento ha subido y a qué expediente.
6. **Comprueba si el checklist está completo.** Si lo está y el expediente estaba en "Falta documentación", registra el evento *"Documentación completa: pendiente de revisión"* y añade una nota a Zoho *"Revisar y avanzar fase"*.

**Descarga segura:** un documento solo se puede descargar a través del endpoint autenticado `GET /api/expedientes/:id/documentos/:docId`, y **únicamente por el cliente dueño** del expediente. Los ficheros **nunca** son accesibles por URL pública.

---

## 7. Procedimiento C — Uso del backend por el gestor

El gestor **no trabaja dentro del portal**, sino en **Zoho CRM** (el "trato"/deal del cliente). El backend y Zoho están conectados:

1. **Aviso.** Cuando el cliente sube documentación (o completa el checklist), al **trato de Zoho** le llega una **nota** automática del backend.
2. **Acceso al fichero.** El fichero subido queda en el servidor (`backend/uploads/`) y su nombre real consta en la tabla `Documento` (campo `path`). *(Ver §11 — Limitaciones: hoy no hay una vista de descarga para el gestor dentro del portal.)*
3. **Avance del trámite.** El gestor actualiza la **fase** del trato en Zoho. Un webhook de Zoho notifica al backend, que **traduce esa fase al estado** del expediente en el portal → el cliente ve el progreso actualizado (En gestión, Presentado, Completado…).

### Uso general del backend

El mismo backend cubre:
- **Web pública + checkout:** catálogo de servicios y pago con **Stripe** (tarjeta/Bizum). Tras el pago (webhook de Stripe) se crea el expediente y se envía el email de acceso.
- **Área de cliente (portal):** login, expedientes, subida/descarga de documentos, notificaciones.
- **Integraciones:** **Zoho** (contactos, tratos y notas), **email** (SMTP transaccional), **Stripe** (pagos y confirmación).

---

## 8. Registros

Cada subida deja traza en:
- **Tabla `Documento`** (BD): metadatos del fichero (expediente, documento del checklist, nombre, tipo, tamaño, fichero en disco, fecha).
- **Tabla `EventoExpediente`** (BD): hitos del expediente (p. ej. "documentación completa").
- **Nota en el trato de Zoho:** aviso al gestor.
- **Fichero físico** en `backend/uploads/` del servidor.

## 9. Seguridad y conservación

- **Autenticación** obligatoria para subir y descargar; cada cliente solo accede a **sus** expedientes y documentos.
- Ficheros guardados **fuera de la carpeta pública** del sitio y con **nombre aleatorio** → no accesibles por URL.
- La carpeta `uploads/` **se excluye del despliegue** (el `deploy` no la sobrescribe), por lo que los documentos **persisten** entre actualizaciones del sistema.
- Conservación de los ficheros: según la política de protección de datos de Gestadia (ver aviso legal / política de privacidad del sitio).

## 10. Datos técnicos de referencia (para soporte)

- Subida: `POST /api/expedientes/:id/documentos` (campo de formulario `fichero`) — `backend/src/routes/portal.js`.
- Descarga: `GET /api/expedientes/:id/documentos/:docId` — `backend/src/routes/portal.js`.
- Modelo de datos: `backend/prisma/schema.prisma` (modelos `Expediente`, `Documento`, `EventoExpediente`).
- Almacenamiento: `backend/uploads/` en el servidor (Application Root de la app Node en Plesk).
- Límites: formatos JPG/PNG/WEBP/PDF; 10 MB por fichero.

## 11. Limitaciones y mejoras propuestas

- **Descarga por el gestor:** actualmente el gestor recibe el aviso en Zoho, pero **no dispone de una vista dentro del portal** para descargar los documentos del cliente; el fichero reside en el servidor (`uploads/`). **Mejora propuesta:** añadir un acceso de gestor (o adjuntar el fichero al trato de Zoho) para descargar sin entrar al servidor.
- **Un fichero por documento:** si un documento requiere varias páginas/imágenes, el cliente debe combinarlas (p. ej. en un PDF) o subirlas como documentos separados.
