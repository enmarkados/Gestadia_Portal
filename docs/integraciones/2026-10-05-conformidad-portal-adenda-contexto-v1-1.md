# Portal: conformidad técnica con la adenda conversacional 1.1

**05/10/2026. Conformidad de diseño, con precisión editorial y política de
retención/purga pendientes.** No autoriza implementación, migraciones,
activación, despliegue ni pruebas conectadas.

[Adenda recibida](2026-10-05-adenda-contexto-conversacional-v1-1.md) ·
[Esquema](fixtures/app-context-v1-1.schema.json) ·
[Vectores](fixtures/app-context-v1-1-vectors.json) ·
[Revisión Portal anterior](2026-10-05-revision-portal-alcance-conversacional-app.md) ·
[Glosario](../../GLOSARIO.md).

## 1. Resultado

Conformes con las precisiones de la adenda 1.1: capacidades server-side de
credencial, autorización actual antes de replays/efectos, revisión numérica
exacta y commit atómico, retiro sin defaults, contexto actual en la respuesta
de un retry antiguo, aislamiento durable de casos y actualización de contexto
en cerradas sin reapertura.

Los eventos Zoho, el alta comercial, pago, cardinalidad trato–expediente y
checkout siguen fuera del cierre conversacional. 1.1 es revisión documental:
se conservan `/app/v1` y `schema_version=1.0`, sin cambio de un runtime publicado.

La identidad sigue siendo `User.id`. Portal preparará evidencia comprobable
de cuenta, su gate activo/revocado, asociaciones y contexto; esos mecanismos
no se acreditan como implementados. LidIA mantiene comprobación de agente APP,
mapping/cola y aislamiento DEV antes de conexiones.

## 2. Procedencia y contraste independiente

Origen de los tres archivos: directorio
`/Users/gonchumon/.codex/worktrees/1e4f/Gestadia_LidIA/docs/integraciones/`.
Estaban sin seguimiento Git al leerlos. Se incorporan como copias byte a byte:

| Archivo | Bytes | SHA-256 |
|---|---:|---|
| `2026-10-05-adenda-contexto-conversacional-v1-1.md` | 17.147 | `6f61157ec6dd2a0ebcd7f52be8bb6e0a903278a616c67a6bfc61c017839544a4` |
| `fixtures/app-context-v1-1.schema.json` | 8.031 | `baa938f4fcfe95d29a82f07e4e8f4d596875d812992d697fcbeb6e066c10c442` |
| `fixtures/app-context-v1-1-vectors.json` | 29.133 | `ee9630d9c59e881356e7263669c737f69e68e1a68d1dc2c432a813bd5f23ad7b` |

Comprobación ejecutada por Portal sobre esos bytes:

- Node **24.14.1** y Python **3.14.3** recalculan los seis cuerpos, digest,
  representación de once líneas, HMAC y huella semántica del perfil de fixtures.
  Coinciden con los valores publicados.
- Permisos reordenados: misma huella semántica, body/firma diferentes. Rotación:
  misma integración/key idempotente/huella, firma diferente. Las dos aserciones
  publicadas coinciden.
- Comparaciones con BigInt/int exactos: `9 < 10` y
  `9007199254740992 < 9007199254740993`, sin float.
- Un intérprete temporal limitado a las reglas presentes en estos esquemas
  admite los seis requests y un response y rechaza los cuatro negativos de
  esquema. Incluye requeridos, propiedades desconocidas, null, tipos, patrones,
  fechas, conjunto único y condiciones `allOf/if/then/contains`.

No se ha usado un validador JSON Schema general ni se acredita un JCS general.
No se ejecutaron contra producto las otras once especificaciones de
autorización, ledger, aislamiento de casos, concurrencia y ciclo de vida.
Las expectativas de estado/mutación del vector de retry también siguen como
especificación; comprobar sus bytes no ejecuta ese replay.
Node/Python no constituyen una verificación .NET propia de Portal ni de proxy,
revocación distribuida, persistencia o API desplegada.

## 3. Una precisión editorial de idempotencia

El algoritmo de §4 permite que una **nueva key** recupere una revisión/huella
ya acreditada y se asocie a su operación original, sin reaplicar contexto.
La tabla de §3 describe `stale_context` como revisión inferior sin operación
recuperable «con esa key». Esa frase puede interpretarse como rechazo de toda
key nueva, aunque la revisión/huella se conozcan.

Proponemos precisar la tabla conforme al algoritmo: inferior sin operación
recuperable por key **o por revisión/huella acreditada**. Debe conservarse la
autorización actual y la respuesta reconstruida con permisos actuales; jamás
reaplicar el snapshot antiguo ni liberar una identidad retirada.

El negativo `stale-unclaimed-key` es coherente porque declara que nunca se
admitió revisión 9 y la primera fue 10. No pide cambiar ese fixture. Para la
aceptación futura, añadir el caso conocido 9, actual 10, key nueva, misma
huella: recuperar sin mutación, o 410 si el detalle está retirado. Es una
especificación de ledger, no una prueba ejecutada hoy.

Esta precisión no reabre el alcance ni el formato del DTO: elimina ambigüedad
entre una tabla y el orden de decisión ya propuesto.

## 4. Conservación de marcas y política pendiente

**Conformes con el principio antirrepetición:** retirar el detalle no libera
key, revisión, caso ligado o identidad de efecto. Inicio, contexto, handoff,
turnos y acciones deben reconocer retries antiguos. Rotar claves conserva
namespace, por tanto no permite purgar sus marcas y volver a admitir efectos.

Aceptar esa invariante no fija un periodo general de conservación ni aprueba
una purga ya implementada. El diseño de política debe concretar:

- Plazos de historial/mensajes/cursor y del detalle/ledger según su estado.
- Datos mínimos de cada marca y tratamiento de trabajos no resueltos.
- Qué scope o identidad operativa se retira definitivamente para permitir
  purga sin que otra credencial reinterprete operaciones antiguas como nuevas.
- Efecto de esa retirada sobre inicios de sesión, conversaciones retenidas y
  una cuenta que continúe activa; no asumir que retire toda la integración.

Las marcas se mantienen mientras el mismo namespace pueda volver a admitir
esas operaciones; una eliminación requiere cerrar antes esa posibilidad de
replay. La propuesta de detalle de recibos a 30 días se mantiene, sin asignar
ese plazo a todo el historial ni inventar otro plazo de purga.

## 5. Siguiente coordinación

LidIA puede consolidar la precisión editorial y su especificación adicional de
ledger. El diseño técnico de contexto queda favorable con los artefactos
contrastados; la política de historial/purga y las comprobaciones de identidad,
agente APP, mapping y DEV permanecen identificadas para su fase correspondiente.

El usuario no necesita trasladar mensajes entre equipos: la respuesta se
comunica directamente al chat LidIA autorizado, con este fichero disponible
en el mismo host. La coordinación no autoriza ejecutar código de integración,
activar canales ni realizar pruebas conectadas.
