# Contraste LidIA de mapas y propuesta Portal APP sin cuenta

10/10/2026. **Revisión documental inicial de Portal d082e00; tres precisiones resueltas en eb1ce3c5, comprobadas por LidIA según el cierre inferior. Conforme al recorrido para presentarlo a revisión humana. No es aprobación humana, contrato ejecutable, implementación ni activación.** [Revisión técnica LidIA](2026-10-10-revision-lidia-app-anonima.md) · [Glosario](../../GLOSARIO.md).

## Fuente y comprobaciones

Portal entrega PR11 en borrador y rama `codex/app-anonimo-lidia`, commit d082e00, en el worktree `app-anonimo-lidia/Gestadia_Portal`. Se revisaron propuesta/contraste de integración, mapas de pantallas, NAVEGACION.md, design-qa.md y cuatro capturas: resultado, datos de contacto, solicitud recibida y vinculación. Su informe visual es evidencia del equipo Portal; esta revisión no vuelve a ejecutar la maqueta ni acredita todos sus recorridos.

La respuesta LidIA copiada en Portal coincide en bytes con e3b663b59: SHA256 `c127dfe73602bfc51e2e33f767fb8670de5fb7f527189bd5e8c3f2e178574c04`. El árbol Portal estaba limpio al revisar. La procedencia demo y la separación de capturas actuales/propuestas están declaradas; no se presentan como conversación con el modelo ni como registro real.

## Conforme al recorrido y al reparto en principio

- Inicio y sondeo sin preguntar nombre, teléfono o email para identificar al visitante.
- Resultado completo que permite continuar y voluntad expresa antes de pedir nombre y teléfono **o** email para contacto de gestor. País y human_review no abren el gate.
- Solicitud confirmada como visitante; «recibida» sólo tras ACK durable de Portal. Conversión CRM y cita quedan separadas.
- Cuenta opcional después, mismo chat e historial; cancelar alta no cancela ni reenvía la solicitud recibida. Actor original e identidad de operación se conservan al vincular.
- Portal conserva SOLICITUD y coordina receptor; flujos Zoho convierten lead/contacto/trato y notifican hechos al backend Gestadia. LidIA no ejecuta esa conversión ni expone atención de expediente al visitante.

Las cuatro capturas revisadas representan ese orden. El formulario pide un canal elegido y explica propósito. La solicitud recibida precede a la oferta de cuenta y el estado de vinculación afirma conservación del chat y ausencia de reenvío. El resultado favorable sigue siendo ilustrativo: sólo dos respuestas visibles en una captura no acreditan una revisión completa real.

## Precisiones solicitadas a Portal

| Punto | Localización en Portal d082e00 | Ajuste solicitado |
|---|---|---|
| Control original para vincular | `docs/integraciones/2026-10-10-propuesta-app-anonima-lidia.md:104` | La alternativa «confirmación desde la instalación original **o** verificación del contacto previamente asociado» deja indeterminado si el contacto sustituye el control original. Primera entrega: cuenta verificada **y** control de instalación original. Con instalación perdida, bloquear vínculo hasta acordar otro procedimiento; no presentar verificación de contacto como alternativa ya admitida. El enlace, coincidencia o control de un teléfono/email autodeclarado no bastan para reclamar el chat. |
| Sujeto por sondeo | Mismo documento, línea114 | Sustituir la elección aún pendiente entre sujetos independientes/vínculo compartido por la arquitectura ya aceptada en principio: sujeto conversacional inmutable por sondeo + actor/propietario separados. DTO y modelo EF siguen pendientes; vincular A no retira acceso a B. |
| Retorno de acceso protegido | Flecha `ACCESS --> HOME` en propuesta, mapas, NAVEGACION y fuente Mermaid exportada | Representar Atrás al origen guardado, con Inicio sólo como reserva para entrada directa sin origen. La tabla y design-qa ya describen ese comportamiento; la flecha siempre a Inicio los contradice. Regenerar exportaciones a partir del mismo flujo corregido. |

Estos ajustes no cambian el orden humano decidido ni requieren modificar producto. Portal mantiene la autoría de sus documentos y diagramas; esta revisión no los edita directamente.

## Cierres del contrato todavía pendientes

1. **Resultado completo:** catálogo/requisitos/reglas versionados, evidencia y revisiones necesarias para can_continue. APP actual sólo proyecta país/estados parciales; human_review no equivale a favorable.
2. **Solicitud y ACK incierto:** representar o anotar el estado de envío/recuperación entre confirmar y «recibida». Sin ACK no afirmar recepción ni crear otra solicitud. Recuperar el mismo event_id/intención/revisión y preservar su resultado durante registro/vínculo; cerrar cancelación o modificación de una solicitud ya entregada como operación separada.
3. **Resultado negativo:** distinguir explicación del resultado de preguntas incompletas o revisión pendiente. La flecha común de retorno al cuestionario no debe obligar a repetirlo indefinidamente ni permitir contacto comercial por reintento sin nueva evidencia. No se abre un gate de ayuda alternativo implícito.
4. **Permiso visitante y señal:** schema/DTO, capacidad específica, transporte, firma, ACK, reintentos, deduplicación, revocación y reconciliación de app.contact_request.ready. Compartir propósito/consentimiento y datos mínimos, no todo el historial. Registrar no altera hashes ni resucita acceso guest.
5. **Vínculo y agenda:** esquemas/vectores2.0, fases/CAS/cola, prueba de origen, caducidad/retención y futura agenda con evidencia propia. Aprobar pantallas no cierra estos contratos ni autoriza canales.

Esta revisión no lanza tests de conversación, no consulta producción y no realiza despliegue. Tras las precisiones documentales puede presentarse el recorrido a Gonzalo para su decisión; implementación requiere además el cierre técnico y su plan.

## Cierre documental de las precisiones — Portal eb1ce3c5

LidIA comprueba el commit Portal `eb1ce3c5aa69d1fd1d6bb71aa8d21ed9a6fbf018` con árbol limpio. Las tres precisiones anteriores quedan **resueltas documentalmente**: propuesta líneas120/130 exige cuenta verificada y control original, bloquea la instalación perdida y fija sujeto inmutable por sondeo con actor/propietario separados. La flecha de acceso protegido recupera el origen completo, con Inicio sólo como reserva. El flujo coincide en los tres documentos y fuente Mermaid exportada.

Se revisan también las nuevas capturas A9/A10/A11: envío/ACK incierto sin afirmar recepción ni pedir reemisión; resultado negativo sin repetición obligada ni contacto comercial; vínculo bloqueado sin conceder historial por cuenta/enlace. Son estados de maqueta, no evidencia API ni de dispositivo. La revisión inicial copiada en Portal conserva bytes y SHA256 `702496881b6020c3851275d98250510ce0743d41a9a1d9901bb8cf777dc95419`, correspondiente a539a6ccc2, antes de este cierre.

**Conformidad documental para presentar el recorrido a Gonzalo.** No quedan abiertas las tres precisiones de mapas de esta revisión. Continúan los cierres técnicos enumerados arriba: reglas/evidencia completas, capacidad/señal visitante, DTO/firma/transporte/ACK/reconciliación, protocolo v2 y agenda. La decisión humana y el plan de implementación siguen pendientes; no se fusiona, implementa, despliega ni activa el recorrido por esta conformidad.
