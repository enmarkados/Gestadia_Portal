# Canje: país del permiso, dirección y documentos por país — Design

**Fecha:** 2026-07-14
**Estado:** aprobado (pendiente revisión del spec)

## Problema

El trámite de **Canje de Carnet Extranjero** necesita datos que hoy no se piden y que condicionan la documentación:

1. **País del permiso**: determina si el canje es posible y qué documento(s) extra se exigen.
2. **Dirección** del titular (envío del permiso definitivo + "provincia de residencia" que pide la Sede DGT).
3. Según el país, la Sede pide **documentos adicionales** (5 países) y/o **datos manuales de texto** que no figuran en ningún documento (4 países, §5.4 de la guía interna DGT).

Hoy el checkout no captura nada de esto y la checklist del portal es fija para todos los canjes.

Fuente de negocio: guía interna *Extracción de campos — Canje (Sede DGT) v2.0* (documento confidencial de Gestadia; se usa solo como referencia, no se versiona en el repo).

## Objetivo

- Capturar en el **checkout** el país del permiso, una **dirección estructurada (formato DGT)** y los **campos manuales** que requiera el país.
- Guardar esos datos en el **expediente**.
- Que la **checklist del portal** sea **base + documentos extra del país**.
- Mostrar los datos capturados en una tarjeta **"Datos del trámite"** en el detalle del expediente.

### Alcance
- Solo afecta al servicio `canje-carnet` (activado por flags; extensible a otros servicios después).
- País restringido a **países con convenio (33, §4) + UE/EEE**.

### No-alcance (diferido)
- Documento condicional según **tenga DNI** y **fecha de obtención del permiso** (alta/baja consular o movimientos migratorios, §2.2.4). El modelo (`documentosExtra` + helper) deja hueco para añadirlo. El detalle lo aportará el usuario más adelante.
- El **Nº de Computación de Paraguay** (§5.4): lo obtiene la gestoría de OPACI, **no se pide al cliente**.
- Migrar el flujo de las fichas del front al pago (esa unión front↔checkout es un trabajo aparte, ya previsto).

## Modelo de datos

### `shared/paises-canje.js` (nuevo)

```
export const PAISES = {
  '<clave>': {
    nombre: '...',
    tipo: 'convenio' | 'ue',
    documentosExtra: [{ clave, label }],   // [] si no aplica
    camposExtra:     [{ clave, label }],   // [] si no aplica
  },
};
```

- **`clave`**: slug estable (p.ej. `argentina`, `reino-unido`, `corea-del-sur`).
- **Orden/agrupación**: el checkout agrupa por `tipo` (Con convenio / Unión Europea) y ordena alfabéticamente dentro de cada grupo.

**Países con convenio (33, §4):** Andorra, Argelia, Argentina, Bolivia, Brasil, Chile, Colombia, Corea del Sur, Costa Rica, Ecuador, El Salvador, Filipinas, Georgia, Guatemala, Honduras, Japón, Macedonia del Norte, Marruecos, Moldavia, Mónaco, Nicaragua, Nueva Zelanda, Panamá, Paraguay, Perú, Reino Unido e Irlanda del Norte, República Dominicana, Serbia, Suiza, Túnez, Turquía, Ucrania, Uruguay.

**UE/EEE (29; España excluida — no se canjea un permiso español; Andorra/Suiza/Mónaco ya van en convenio):** Alemania, Austria, Bélgica, Bulgaria, Chipre, Croacia, Dinamarca, Eslovaquia, Eslovenia, Estonia, Finlandia, Francia, Grecia, Hungría, Irlanda, Islandia, Italia, Letonia, Liechtenstein, Lituania, Luxemburgo, Malta, Noruega, Países Bajos, Polonia, Portugal, República Checa, Rumanía, Suecia.

**`documentosExtra` (5 países):**

| País | clave doc | label |
|---|---|---|
| Argentina | `historial_apostillado` | Historial de conducción apostillado (La Haya) |
| Reino Unido e Irlanda del Norte | `check_code` | Check Code actualizado (DVLA) |
| Corea del Sur | `traduccion_oficial` | Traducción oficial del permiso |
| Filipinas | `pasaporte` | Pasaporte |
| Japón | `traduccion_verificacion` | Traducción y verificación del permiso |

**`camposExtra` (4 países, §5.4):**

| País | campos (clave → label) |
|---|---|
| Argelia | `wilaya` → Wilaya de expedición · `daira` → Daira de expedición |
| Bolivia | `lugar_expedicion` → Lugar de expedición (departamento) |
| Nicaragua | `lugar_expedicion` → Lugar de expedición |
| República Dominicana | `lugar_expedicion` → Lugar de expedición (solo formato antiguo) |

Paraguay: sin `camposExtra` (el Nº de Computación es tarea interna de la gestoría; se documenta como comentario en el módulo).

### `shared/servicios.js` — flags

`canje-carnet` gana: `requierePais: true`, `requiereDireccion: true`. El resto de servicios no los definen (se leen como `undefined`/falsy).

### `shared/direccion.js` (nuevo)

Constantes reutilizables para el formulario de dirección:
- `TIPOS_VIA`: `['Calle', 'Avenida', 'Plaza', 'Paseo', 'Carretera', 'Camino', 'Travesía', 'Ronda', 'Vía', 'Otro']`.
- `PROVINCIAS`: las 52 provincias españolas.

### Helper de checklist — `shared/servicios.js`

```
export function checklistExpediente(servicioSlug, paisCanje) {
  const base  = SERVICIOS[servicioSlug]?.documentos ?? [];
  const extra = paisCanje ? (PAISES[paisCanje]?.documentosExtra ?? []) : [];
  return [...base, ...extra];
}
```
Import unidireccional: `servicios.js` importa `PAISES` de `paises-canje.js` (que no importa a `servicios.js`, sin ciclos).

### Prisma `Expediente` (migración additiva)

```
paisCanje  String?          // clave de PAISES, p.ej. 'argentina'
direccion  Json?            // { tipoVia, nombreVia, numero, bloque, portal, escalera, planta, puerta, km, codigoPostal, municipio, localidad, provincia }
datosPais  Json?            // { wilaya, daira, lugar_expedicion, ... } (claves de camposExtra)
```

## Checkout

`GET /api/servicios` añade `requierePais` y `requiereDireccion` a cada servicio para que el front sepa qué bloques mostrar. La lista de países y sus `camposExtra` las importa el front de `@shared/paises-canje.js` (build-time).

El formulario, cuando el servicio tiene los flags, muestra dos bloques nuevos:

**Bloque "País del permiso"** (si `requierePais`):
- Desplegable de país (agrupado convenio/UE). **Obligatorio.**
- Al elegir un país con `camposExtra`, se renderizan sus campos de texto debajo, **obligatorios** (Argelia: wilaya+daira; Bolivia/Nicaragua/R.D.: lugar_expedicion). Cambian dinámicamente al cambiar de país.

**Bloque "Dirección de envío"** (si `requiereDireccion`) — campos DGT:
- Tipo de vía (select `TIPOS_VIA`), Nombre de vía, Número, Bloque, Portal, Escalera, Planta, Puerta, KM, Código postal, Municipio, Localidad, Provincia (select `PROVINCIAS`).
- **Obligatorios:** nombreVia, numero, codigoPostal, municipio, provincia. Resto opcionales.

`POST /api/checkout`:
- Acepta `paisCanje`, `direccion` (objeto), `datosPais` (objeto).
- **Validación** (solo si el servicio tiene los flags): `paisCanje` presente y ∈ `PAISES`; todos los `camposExtra` del país presentes; campos de dirección obligatorios presentes. Si falla → `400`.
- Guarda los tres en el `Expediente` al crearlo.

## Portal

- `GET /api/expedientes/:id`: la `checklist` se calcula con `checklistExpediente(e.servicioSlug, e.paisCanje)` (base + extra del país); además la respuesta incluye `paisCanje`, `direccion` y `datosPais`.
- `POST /api/expedientes/:id/documentos`: la comprobación de "checklist completa" usa **la misma** lista calculada (no se marca completo hasta subir también los documentos de país).
- **Página `ExpedienteDetalle`**: sin cambios en la sección Documentación (ya pinta `checklist` con botón "Subir" por ítem). **Se añade** una tarjeta **"Datos del trámite"** que muestra, si existen: país (nombre legible), dirección de envío compuesta, y los campos manuales (`datosPais`) con sus labels.

## Tests

- **`shared/paises-canje.test.js`**: `PAISES` contiene los 33 de convenio + los 29 UE/EEE; los 5 `documentosExtra` correctos; los `camposExtra` correctos (Argelia 2, Bolivia/Nicaragua/R.D. 1); España no está.
- **`shared/servicios.test.js`** (ampliar): `checklistExpediente('canje-carnet','argentina')` → 4 docs (3 base + historial); `checklistExpediente('canje-carnet','alemania')` → 3; `checklistExpediente('canje-carnet', null)` → 3; `canje-carnet` tiene `requierePais` y `requiereDireccion`.
- **backend**: `POST /api/checkout` de canje guarda `paisCanje`/`direccion`/`datosPais` (y rechaza con 400 si falta país o un `camposExtra` obligatorio); `GET /api/expedientes/:id` devuelve la checklist con el extra del país y los datos guardados. `/api/servicios` incluye los flags.
- **frontend**: el checkout muestra los bloques país+dirección **solo** para canje; cambia los `camposExtra` según el país; envía `paisCanje`/`direccion`/`datosPais`. `ExpedienteDetalle` pinta la tarjeta "Datos del trámite" cuando hay datos.

## Definition of Done

- [ ] `shared/paises-canje.js` con los países (convenio + UE), `documentosExtra` (5) y `camposExtra` (4); test en verde.
- [ ] `shared/direccion.js` con `TIPOS_VIA` y `PROVINCIAS`.
- [ ] `checklistExpediente` en `shared/servicios.js` + flags en `canje-carnet`; tests en verde.
- [ ] Migración Prisma additiva (`paisCanje`, `direccion`, `datosPais`) aplicada.
- [ ] `/api/servicios` expone `requierePais`/`requiereDireccion`; `/api/checkout` valida y guarda; `/api/expedientes/:id` usa el helper y devuelve los datos.
- [ ] Checkout muestra país + campos manuales + dirección estructurada solo en canje y los envía; validación de obligatorios.
- [ ] `ExpedienteDetalle` muestra la tarjeta "Datos del trámite".
- [ ] Checkout demo de canje (p.ej. Argentina) → expediente con país/dirección guardados y checklist de 4 documentos en el portal.
- [ ] Tests backend (`node --test`) y front (`vitest`) en verde.

## Relacionado
- Fuente única de servicios: [`2026-07-14-fuente-unica-servicios-design.md`](2026-07-14-fuente-unica-servicios-design.md)
- Guía interna DGT (confidencial, fuera del repo): §2.2.4 (documentos por país), §4 (países con convenio), §5.4 (datos manuales), §6.2 (dirección estructurada).
