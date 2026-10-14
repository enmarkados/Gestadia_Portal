# Historial invitado: operaciones pendientes · 14/10/2026

Objetivo: que Continuar sin registro abra la conversación existente y conserve sus operaciones inciertas. El piloto real creó una sesión en LidIA y obtuvo HTTP200 al leer el historial; la APP rechazó el resultado porque faltaba `pending_operations`.

Pantalla: `/lidia/conversacion?invitado=1&conversacion=UUID`. Origen: LidIA → Nueva conversación → Continuar sin registro. Actor: instalación invitada propia. Atrás: LidIA. Acción final: consulta al agente y continuidad posterior con cuenta. Se conservan rutas, permisos, compositor y navegación.

Plan acotado:

- [x] Reproducir con la misma conversación y leer una vez su ledger: sesión admitida y lectura HTTP200; campo ausente.
- [x] Regresión RED sobre `AppGuestService.timeline` y Prisma real en base efímera sin red pública: `undefined !== []`.
- [x] Proyectar operaciones locales `session`/`turn` de la conversación ya autorizada, estados `prepared`/`outcome_unknown`, orden de creación; no alterar el schema cerrado de LidIA.
- [x] Verificar regresión y backend.
- [ ] Integrar por PR en `app/main`.
- [ ] Desplegar sólo backend desde el stack Git y recuperar la misma conversación, sin otra creación ni build nativa.
- [ ] Observar respuesta real, login autorizado, vínculo confirmado y mismo historial; aislamiento y retirada individual según runbook vigente.

La regresión exige array vacío sin operaciones y proyección de pendientes propios, excluyendo admitidos, fallidos y otra conversación. El entorno usa una base `gestadia_app_test` sintética y la imagen backend ya existente; no monta ENV, documentos ni claves de producción. Docker local no respondió; se utilizó el procedimiento privado Plesk/Docker del servidor. Primer arranque de prueba se detuvo antes de ejecutar el test por permisos de carpetas temporales; se corrigieron esos permisos conservando la misma base y logs.

No hay cambios de identidad, claves, CRM, receptor, modelo o interfaz. La consulta conectada, los tests y el despliegue se acreditan por separado.

## Verificación de la corrección local

Regresión focal GREEN: 1/1, sin omisiones. Suite backend de esta revisión: 354 aprobadas, cero fallos y 12 omisiones opt-in conservadas (366 contabilizadas). Las omisiones incluyen solicitud durable de contacto, comprobaciones ORM y borrado de cuenta; no se presentan como pruebas aprobadas. No se repitieron suites frontend, builds nativas, checks del receptor ni backups ya cerrados. La base efímera se detuvo al terminar.

Recibos privados en el servidor: `guest-timeline-red.private.log`, `guest-timeline-green.private.log` y `guest-timeline-backend-suite.private.log`, dentro de la custodia operativa privada existente. Fuente RED SHA3cd2b7ea516fd63fb32290fe2f0dd2f94db76128cb054686eb0b8748b512f923; fuente GREEN SHAeb3e992657a6e680d753ec4c7862e994c09b6aaace86cfb6437feb10a51214c7. Los hashes identifican las fuentes probadas, no un despliegue.
