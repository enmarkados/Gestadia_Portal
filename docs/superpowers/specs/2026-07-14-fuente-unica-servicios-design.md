# Fuente única de servicios (precios + documentos) — Design

**Fecha:** 2026-07-14
**Estado:** aprobado (pendiente revisión del spec)

## Problema

Hoy existen **dos catálogos de servicios desincronizados**:

- **Front** (fuente real del negocio): 8 servicios DGT, cada uno con su precio y sus documentos, hardcodeados en [`frontend/src/pages/Tramites.jsx`](../../../frontend/src/pages/Tramites.jsx) (lista + precios) y en cada ficha `frontend/src/pages/servicios/*.jsx` (precio del panel + sección "Documentos necesarios"). Las fichas solo captan lead (`LeadForm` → `/api/leads`), no llevan al pago.
- **Backend** ([`backend/src/catalog.js`](../../../backend/src/catalog.js)): 4 servicios de relleno distintos (canje 149 €, certificados, jubilación, otras gestiones) con precios y checklists que **no coinciden** con el front. El checkout (`/api/checkout`, `/api/servicios`) y el portal (checklist de subida de documentos) leen de aquí.

Resultado: el checkout muestra 149 € para el canje (real: 210 €) y el portal pide documentos incorrectos.

## Objetivo

Crear **una única fuente de verdad** de los servicios (precio + documentos + metadatos) que consuman tanto el front como el backend, para que no se vuelvan a desincronizar. Es el paso previo a, más adelante (al publicar), **conectar las fichas del front al checkout de pago** (fuera de alcance aquí).

### Alcance (ahora)
- Fuente única compartida en la raíz, consumida en build (front) y runtime (backend).
- El catálogo canónico son **exactamente los 8 servicios del front** (se eliminan certificados/jubilación/otras gestiones del backend).
- El front **mantiene su presentación rica** de documentos (grupos, alternativas, verificador de Canje). La fuente única define además una **checklist concreta de subida** por servicio que usa el portal, redactada para reflejar fielmente cada ficha.

### No-alcance (ahora)
- Conectar las fichas del front al pago (opción 3, al publicar).
- Rediseñar la UI de las fichas o del portal.
- Crear/validar campos nuevos en Zoho (solo se deja el mapeo *best-effort*, ver §Zoho).

## Arquitectura

```
shared/servicios.js  (módulo de datos puro, sin dependencias)
        │
        ├── (runtime) backend/src/catalog.js ──► /api/checkout, /api/servicios, checklist portal
        │
        └── (build, vía Vite) frontend: Tramites.jsx + fichas servicios/*.jsx (precio, includes)
```

- **`shared/servicios.js`** exporta `SERVICIOS` (objeto indexado por `slug`) y helpers puros si hacen falta. Sin imports de Node ni de React.
- **Backend**: `catalog.js` importa `SERVICIOS` de `../../shared/servicios.js`, y construye su forma interna mapeando `documentos`→`checklist` (así **no se tocan** `portal.js` ni `checkout.js`, que siguen leyendo `servicio.checklist`). Mantiene `ESTADOS`, `ESTADO_INCIDENCIA`, `getServicio`, `faseToEstado`. `/api/servicios` sigue devolviendo `{ slug, nombre, descripcion, precio, checklist }`.
- **Frontend**: `vite.config.js` añade alias `@shared` → `../shared` y `server.fs.allow: ['..']` (para que el dev server pueda leer fuera de `frontend/`). `Tramites.jsx` deriva su catálogo (precio, href, categoría) de `SERVICIOS`; cada ficha importa su servicio por slug y pasa `precio`/`includes` a `LeadForm`. El `Checkout.jsx` ya lee `/api/servicios` en runtime → recibe los datos correctos sin cambios.

## Flujo de datos

1. **Checkout**: `Checkout.jsx` → `GET /api/servicios` (backend, desde `SERVICIOS` compartido) → precio correcto.
2. **Pago demo**: `POST /api/checkout` → `getServicio(slug)` (compartido) → expediente con precio correcto.
3. **Portal**: `GET /api/portal/expedientes/:id` → `servicio.checklist` (= `documentos` compartidos) → pide los documentos correctos.
4. **Fichas front**: en build, cada `servicios/*.jsx` y `Tramites.jsx` leen `SERVICIOS` → mismo precio/includes que el backend.

## Esquema del módulo

```js
// shared/servicios.js
export const SERVICIOS = {
  '<slug>': {
    slug: '<slug>',
    nombre: '...',
    descripcion: '...',        // corto, para checkout card y /api/servicios
    categoria: 'permiso' | 'vehiculo',
    precio: 210,               // número EUR; el front deriva "210 €"
    href: '/tramites/...',     // ruta de la ficha en el front
    includes: ['...'],         // bullets del panel de precio
    documentos: [              // checklist concreta de subida (portal)
      { clave: '...', label: '...' },
    ],
    zoho: { servicio: '...', faseField: '...' | null, fases: { '<faseZoho>': '<estadoPortal>' } },
  },
};
```

## Datos canónicos (los 8 servicios)

Precios e "includes" son literales de las fichas actuales del front. `documentos` deriva de cada sección "Documentos necesarios" (las alternativas se agrupan en un único slot de subida; los datos que no son archivo —matrícula, dirección de envío— se omiten de la checklist).

### 1. `canje-carnet` — Canje de Carnet Extranjero — 210 € — permiso
- includes: `Tasas DGT incluidas`, `Gestión completa`, `Especialista personal asignado`, `Garantía de éxito del trámite`
- documentos:
  - `residencia` — Documento de residencia legal en España (DNI español, tarjeta de residencia, tarjeta roja, intracomunitaria, resguardo de concesión…)
  - `permiso_extranjero` — Permiso de conducir extranjero original en vigor (ambas caras)
  - `psicotecnico` — Examen psicotécnico (centro autorizado)
- zoho: `{ servicio:'Canje', faseField:'Fase_del_psicot_cnico', fases: { 'Pte. documentación':'documentacion_pendiente', 'Gestión de cita':'en_gestion', 'Gestión de psicotécnico':'en_gestion', 'Mensajería':'en_gestion', 'Entrega de documentación al gestor':'en_gestion', 'Tramitación cita':'en_gestion', 'Pdte contestación DGT':'presentado', 'Completado':'completado' } }` *(mapeo real, heredado del catálogo actual)*

### 2. `duplicado-carnet` — Duplicado de Carnet de Conducir — 70 € — permiso
- includes: `Tasas DGT incluidas`, `Permiso provisional en 24 h`, `Gestión completa`, `Especialista personal asignado`
- documentos:
  - `dni` — DNI en vigor (anverso y reverso)
- zoho *(best-effort, verificar)*: `{ servicio:'Duplicado Carnet De Conducir', faseField:null, fases: FASES_GENERICAS }`

### 3. `duplicado-datos` — Duplicado por Cambio de Datos — 70 € — permiso
- includes: `Tasas DGT incluidas`, `Gestión completa`, `Especialista personal asignado`
- documentos:
  - `dni` — DNI en vigor con los datos actualizados
  - `nie_anterior` — NIE anterior (si el cambio es de NIE a DNI)
  - `carnet_actual` — Carnet de conducir actual
  - `resolucion_registral` — Resolución registral de cambio de nombre o sexo (si aplica)
- zoho *(best-effort, verificar)*: `{ servicio:'Duplicado Carnet De Conducir', faseField:null, fases: FASES_GENERICAS }`

### 4. `permiso-internacional` — Permiso Internacional de Conducir — 100 € — permiso
- includes: `Tasas DGT incluidas`, `Válido en más de 150 países`, `Gestión completa`, `Especialista personal asignado`
- documentos:
  - `dni` — DNI o NIE en vigor
  - `carnet_conducir` — Carnet de conducir español en vigor
  - `foto_carnet` — Foto carnet reciente (fondo blanco)
- zoho *(best-effort, verificar)*: `{ servicio:'Otras gestiones', faseField:null, fases: FASES_GENERICAS }`

### 5. `transferencia` — Transferencia de Vehículo — 190 € — vehiculo
- includes: `Tasas DGT incluidas`, `Coches y motos`, `Gestión completa`, `Especialista personal asignado`
- documentos:
  - `dni_comprador` — DNI o NIE del comprador
  - `dni_vendedor` — DNI o NIE del vendedor
  - `contrato_compraventa` — Contrato de compraventa firmado por ambas partes
  - `permiso_circulacion` — Permiso de circulación original
  - `itv` — Tarjeta ITV en vigor
- zoho *(best-effort, verificar)*: `{ servicio:'Transferencia de VEhículos', faseField:null, fases: FASES_GENERICAS }`

### 6. `baja-vehiculo` — Baja de Vehículo — 190 € — vehiculo
- includes: `Tasas DGT incluidas`, `Baja definitiva o temporal`, `Gestión completa`, `Especialista personal asignado`
- documentos:
  - `dni` — DNI, pasaporte o NIE en vigor
  - `permiso_circulacion` — Permiso de circulación original
  - `ficha_tecnica` — Ficha técnica o tarjeta ITV
- zoho *(best-effort, verificar)*: `{ servicio:'Transferencia de VEhículos', faseField:null, fases: FASES_GENERICAS }`

### 7. `cancelacion-dominio` — Cancelación de Reserva de Dominio — 120 € — vehiculo
- includes: `Gestión ante Registro Bienes Muebles`, `Gestión completa`, `Especialista personal asignado`
- documentos:
  - `dni` — DNI o NIE en vigor
  - `carta_cancelacion` — Carta de cancelación o certificado de pago de la entidad financiera
  - `permiso_circulacion` — Permiso de circulación del vehículo
  - `itv` — Tarjeta ITV
- zoho *(best-effort, verificar)*: `{ servicio:'Otras gestiones', faseField:null, fases: FASES_GENERICAS }`

### 8. `duplicado-circulacion` — Duplicado Permiso de Circulación — 70 € — vehiculo
- includes: `Tasas DGT incluidas`, `Autorización provisional inmediata`, `Gestión completa`, `Especialista personal asignado`
- documentos:
  - `dni` — DNI o NIE en vigor
  - `denuncia` — Denuncia por pérdida o robo (si aplica)
  - `permiso_deteriorado` — Permiso de circulación deteriorado (si aplica)
- zoho *(best-effort, verificar)*: `{ servicio:'Otras gestiones', faseField:null, fases: FASES_GENERICAS }`

Donde `FASES_GENERICAS = { 'Pdte documentación':'documentacion_pendiente', 'En gestión':'en_gestion', 'Presentado':'presentado', 'Completado':'completado' }`.

## Zoho (aviso importante)

Solo el mapeo de **Canje** es fiable (heredado del catálogo actual). Los otros 7 llevan valores *best-effort* tomados del `SERVICIO_MAP` de leads en [`zoho.js`](../../../backend/src/services/zoho.js) y `faseField:null`. Esto **no molesta ahora** porque Zoho está en modo demo: `createDealForExpediente` solo lee `servicio.zoho.servicio` (para el log) y retorna antes de usar `faseField`/`fases`.

**Antes de activar Zoho o de abordar la opción 3**, hay que verificar contra el CRM real (`ZohoCRM_getFields` en el módulo `Deals`) el valor exacto del picklist `Servicio` y el campo de fase de cada uno de los 7 servicios, igual que el aviso previo sobre los campos `IP`/`Zoho_Campaign` inexistentes.

## Datos de prueba existentes

Los slugs cambian (`canje` → `canje-carnet`, etc.) y desaparecen `certificados`/`jubilacion`/`otros`. Los expedientes de prueba creados hasta ahora en `gestadia_portal_db` (usuario `demo@gestadia.local` y los `sim-test@…`) quedarán con un `servicioSlug` que ya no existe en el catálogo → `getServicio` devolverá `null` en el portal. **Se limpian esos registros de prueba** y se recrea el usuario demo con un slug nuevo (p. ej. `canje-carnet`).

## Tests

- **Anti-desincronización** (`shared/servicios.test.js` o en backend): para cada servicio, `precio` es un número > 0 y existe `documentos` no vacío; y un test que compruebe que el precio que renderiza una ficha del front coincide con `SERVICIOS[slug].precio` (garantía de fuente única).
- **Backend** `catalog`: `/api/servicios` devuelve los 8 slugs esperados con sus precios; `getServicio('canje-carnet').precio === 210`; `faseToEstado` sigue funcionando para Canje.
- **Frontend**: actualizar los tests de las fichas que hoy no comprueban precio (no rompen); añadir en al menos una ficha una aserción de que el precio proviene de `SERVICIOS`.
- Los tests existentes de `Checkout`/portal deben seguir en verde.

## Definition of Done

- [ ] `shared/servicios.js` con los 8 servicios; sin dependencias de Node/React.
- [ ] `backend/src/catalog.js` consume `shared`, expone `checklist` (= `documentos`), elimina los 4 servicios viejos; `portal.js`/`checkout.js` intactos.
- [ ] `GET /api/servicios` devuelve los 8 con precios correctos (canje = 210).
- [ ] `vite.config.js` con alias `@shared` + `fs.allow`; `Tramites.jsx` y las 8 fichas derivan precio/includes de `shared`; el front compila y las 8 fichas muestran el precio correcto.
- [ ] Checkout demo de `canje-carnet` crea expediente por 210 € y el portal pide los documentos de Canje.
- [ ] Registros de prueba con slugs viejos limpiados; usuario demo recreado.
- [ ] Todos los tests (backend `node --test`, front `vitest`) en verde.
- [ ] Aviso Zoho documentado (arriba) para la fase de publicación.

## Relacionado
- Plan de fusión backend: [`2026-07-09-fusion-backend-unir.md`](../plans/2026-07-09-fusion-backend-unir.md)
