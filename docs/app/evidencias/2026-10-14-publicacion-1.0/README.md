# Candidato de publicación1.0

Base de producto: app/main `bb84c46`, con PR18 integrada. Rama aislada `codex/app-release-1.0-candidate-20261014`. Preparación autorizada; subir, instalar y activar invitados conservan su aceptación separada.

| Plataforma | Versión | Número reservado | Antecedente comprobado |
| --- | --- | --- | --- |
| iOS | 1.0 | 12 | Archivos Gestadia conocidos hasta11 |
| Android | 1.0 | 5 | Código primario4; Play interno3 según Ops |

Se creó un registro privado nuevo antes de compilar; no se atribuye existencia a un registro anterior. Firma y configuración mediante el pipeline existente, fuera de Git. Origen de API esperado: `https://app.gestadia.com`. No arrancar emuladores, subir paquetes ni instalar durante esta preparación.

Plan acotado: reservar números sin colisión; cambiar sólo versión en el checkout aislado; generar una vez cada candidato firmado y registrar su fuente, versión, configuración y hash. Se reutilizan365 pruebas backend/214 frontend y la revisión de PR18; no se repiten suites por el cambio de versión.

Estado inicial: números reservados y versión preparada. Resultado de compilación pendiente. El runtime guest todavía no está aceptado para publicación; una compilación firmada no acredita ese flujo ni disponibilidad en Apple/Play.
