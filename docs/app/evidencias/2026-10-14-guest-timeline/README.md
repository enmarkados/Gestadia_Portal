# Historial invitado: operaciones pendientes · 14/10/2026

Objetivo: que Continuar sin registro abra la conversación existente y conserve sus operaciones inciertas. El piloto real creó una sesión en LidIA y obtuvo HTTP200 al leer el historial; la APP rechazó el resultado porque faltaba `pending_operations`.

Pantalla: `/lidia/conversacion?invitado=1&conversacion=UUID`. Origen: LidIA → Nueva conversación → Continuar sin registro. Actor: instalación invitada propia. Atrás: LidIA. Acción final: consulta al agente y continuidad posterior con cuenta. Se conservan rutas, permisos, compositor y navegación.

Plan acotado:

- [x] Reproducir con la misma conversación y leer una vez su ledger: sesión admitida y lectura HTTP200; campo ausente.
- [x] Regresión RED sobre `AppGuestService.timeline` y Prisma real en base efímera sin red pública: `undefined !== []`.
- [x] Proyectar operaciones locales `session`/`turn` de la conversación ya autorizada, estados `prepared`/`outcome_unknown`, orden de creación; no alterar el schema cerrado de LidIA.
- [x] Verificar regresión y backend.
- [x] Integrar historial por PR21 en `app/main` (merge5d1601b7).
- [x] Desplegar historial en backendbefbfcd, stack Git162/app/main; recuperar bienvenida en la misma conversación, sin nueva creación ni build nativa.
- [ ] Observar respuesta real, login autorizado, vínculo confirmado y mismo historial; aislamiento y retirada individual según runbook vigente.

La regresión exige array vacío sin operaciones y proyección de pendientes propios, excluyendo admitidos, fallidos y otra conversación. El entorno usa una base `gestadia_app_test` sintética y la imagen backend ya existente; no monta ENV, documentos ni claves de producción. Docker local no respondió; se utilizó el procedimiento privado Plesk/Docker del servidor. Primer arranque de prueba se detuvo antes de ejecutar el test por permisos de carpetas temporales; se corrigieron esos permisos conservando la misma base y logs.

No hay cambios de identidad, claves, CRM, receptor, modelo o interfaz. La consulta conectada, los tests y el despliegue se acreditan por separado.

## Verificación de la corrección local

Regresión focal GREEN: 1/1, sin omisiones. Suite backend de esta revisión: 354 aprobadas, cero fallos y 12 omisiones opt-in conservadas (366 contabilizadas). Las omisiones incluyen solicitud durable de contacto, comprobaciones ORM y borrado de cuenta; no se presentan como pruebas aprobadas. No se repitieron suites frontend, builds nativas, checks del receptor ni backups ya cerrados. La base efímera se detuvo al terminar.

Recibos privados en el servidor: `guest-timeline-red.private.log`, `guest-timeline-green.private.log` y `guest-timeline-backend-suite.private.log`, dentro de la custodia operativa privada existente. Fuente RED SHA3cd2b7ea516fd63fb32290fe2f0dd2f94db76128cb054686eb0b8748b512f923; fuente GREEN SHAeb3e992657a6e680d753ec4c7862e994c09b6aaace86cfb6437feb10a51214c7. Los hashes identifican las fuentes probadas, no un despliegue.

## Envío invitado: correlation_id

El primer POST informativo de la conversación existente fue rechazado con HTTP400 `invalid_payload` antes de admisión: el DTO de la APP omite `correlation_id`, obligatorio en S2S. No hay respuesta del modelo acreditada. El Portal completa sólo el campo ausente con `turn_id`; conserva valores explícitos y valida el mismo schema. Plan: regresión mínima → corrección → PR/app/main → un despliegue backend → reenvío normal desde la misma instalación y conversación. El intento rechazado no se reutiliza mediante inyección de almacenamiento: la UI generará un turno nuevo, documentado, sin operación previa admitida.

Regresión focal local RED: una prueba falla por `invalid_payload` y la validación explícita pasa. GREEN después de la corrección: 2/2, sin omisiones; comprueba replay estable, conflicto por texto diferente, preservación explícita y rechazo de null/vacío/longitud excesiva. Usa límites de persistencia y transporte sintéticos, sin red ni BD; no acredita entrega S2S. No se repite la suite general ya cerrada. Despliegue y E2E de este ajuste pendientes.
