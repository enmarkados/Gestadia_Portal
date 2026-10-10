# Propuesta: LidIA sin cuenta, exclusivamente APP

**Fecha:** 10/10/2026. **Estado:** propuesta Portal para revisión conjunta; no implementada ni desplegada. [Glosario](../../GLOSARIO.md).

## Requisito recibido y resultado esperado

El usuario pide hablar con LidIA desde deeplink o tras descargar la APP sin registro previo. **Corrección humana del 10/10:** primero se comprueban los requisitos, sin pedir nombre/contacto. Sólo después de un resultado completo suficiente y voluntad expresa de gestor se solicitan nombre y teléfono **o** email para que le contacte.

**Decisión humana confirmada:** enviar la solicitud como visitante; ofrecer la cuenta después, opcionalmente, para guardar y recuperar el mismo chat. Cancelar o fallar el registro no cancela ni reenvía una solicitud ya recibida. Solicitud de contacto, conversión CRM y cita confirmada son hechos separados.

La sesión mantiene el recorrido y su pertenencia. No es prueba de cuenta ni permite reclamar cuentas/chats por el teléfono/email escrito. Alta gratuita no convierte al usuario en cliente con expedientes.

Alcance exclusivamente APP. No habilita Web/WhatsApp ni atención de expediente/gestor directo a visitantes. Los flujos Zoho convierten lead a contacto/trato y notifican Cerrado ganado directamente al backend Gestadia.

## Comprobación del código actual

Base revisada: `app/main` en `a6d6e1497e32efa3c6a45fff3d6c67017a86bc05`.

| Punto | Evidencia | Consecuencia |
|---|---|---|
| Autenticación APP | `backend/src/app/identity.js`: login y authenticate exigen `accountProof(user)` | El modo conectado actual requiere una cuenta verificada. |
| Propiedad y operaciones | `backend/prisma/schema.prisma`: AppConversation y AppOperation están ligadas a User; `store.js`: ownedConversation comprueba userId | No basta omitir login en React ni hacer userId opcional sin revisar autorización e idempotencia. |
| Inicio S2S | `backend/src/app/conversations.js`: start envía portal_user_id e identity de cuenta | Hace falta una adenda explícita para la identidad previa al registro. |
| Registro conectado | `frontend/app/src/Register.jsx` remite a invitación/acceso; `backend/src/routes/auth.js` sólo login, set-password y recuperación | Hay que añadir alta gratuita y prueba de control de cuenta. El formulario demo no es un registro real. |
| Entrada nativa | `frontend/app/src/native.js`: navegación Atrás/enlaces externos, sin appUrlOpen/getLaunchUrl | Hay que implementar tanto el arranque desde enlace como la apertura con la APP ya activa. |

La viabilidad en Portal requiere esas ampliaciones. La equivalencia del recorrido del agente, la agenda y la transición remota requieren revisión de LidIA; no se infieren de las pruebas conectadas anteriores.

## Alternativas

| Alternativa | Coste y efecto | Valoración |
|---|---|---|
| Sujeto previo al registro APP separado de User, vinculado después | Amplía identidad y contrato S2S; mantiene el sondeo anterior al alta y acota permisos | **Recomendada.** Cumple el requisito y permite conservar la misma sesión. |
| Crear un User provisional por cada visitante | Contamina cuentas e invitaciones y obliga a distinguir muchas cuentas no verificadas; no debe simular prueba de cuenta | Descartada como atajo. |
| Exigir registro para iniciar conversación | Reutiliza el contrato actual | No cumple el requisito de hablar sin cuenta. |

## Recorrido propuesto

```mermaid
flowchart TD
  EXT[Enlace externo] --> INST{¿APP instalada?}
  INST -->|Sí: abierta o cerrada| N[02 Habla con LidIA sin cuenta]
  INST -->|No| TIENDA[A5 Instalar y reabrir el mismo enlace]
  TIENDA --> N
  HOME[01 Inicio LidIA] -->|Elegir canje| N
  N --> Q[03 Preguntas sobre los requisitos del canje]
  Q --> E{Resultado completo suficiente}
  E -->|No, parcial o revisión humana| REV[A4 Seguir revisando sin pedir contacto]
  REV --> Q
  E -->|Sí| RES[04 Resultado y oferta de contacto]
  RES -->|Seguir consultando| Q
  RES -->|Quiero un gestor| C[05 Explicar la finalidad del contacto]
  C --> D[06 Nombre y teléfono O email]
  D -->|Confirmar como visitante| REC[07 Solicitud recibida por Portal]
  D -->|Cancelar antes de enviar| Q
  REC -->|Seguir sin cuenta| GM[A8 Mensajes de esta instalación]
  Q -->|Pestaña Mensajes| GM
  GM -->|Revisión en curso| Q
  GM -->|Solicitud ya recibida| REC
  GM -->|Nueva conversación| N
  REC -->|Guardar chat: opcional| R[08 Crear cuenta]
  REC -->|Ya tengo cuenta| LOGIN[A1 Acceso a cuenta existente]
  R --> V[09 Verificar email y control de cuenta]
  LOGIN -->|Cuenta verificada| LINK
  V --> LINK[10 Vincular el mismo chat]
  LINK -->|Confirmado| CHAT[11 Historial guardado en cuenta]
  LINK -->|Respuesta incierta| LINK
  CHAT --> M[12 Mensajes con cuenta]
  M -->|Abrir chat| CHAT
  M -->|Nueva conversación| N
  R -->|Atrás o cancelar| CANCEL[A2 Seguir sin cuenta]
  LOGIN -->|Cancelar| CANCEL
  CANCEL -->|Solicitud intacta| REC
  R -->|Enlace caducado| EXP[A3 Pedir otro enlace desde el mismo chat]
  EXP --> REC
  LOGIN --> FORGOT[A7 Recuperar contraseña en el portal]
  FORGOT --> LOGIN
  T[Trámites o chat directo de gestor sin cuenta] --> ACCESS[A6 Acceso protegido con Atrás al origen]
  ACCESS --> HOME
  REC -.-> CRM[Flujos Zoho: lead a contacto y trato]
  Z[Zoho: Cerrado ganado] --> CLIENT[Correlacionar cuenta y habilitar trámites]
```

La identidad previa permite consultar sin cuenta. El gate propuesto es `contact_request_allowed = can_continue && contact_requested`, validado por servidor con resultado completo/versionado, evidencia y voluntad expresa. La confirmación de contacto genera una única solicitud durable recuperable; Portal emite «recibida» sólo tras su ACK durable. No depende de registro, no convierte un lead ni reserva una cita por sí sola.

LidIA debe conservar requisitos, resultado, datos declarados e intención como estado estructurado, no inferirlos leyendo texto generado. El runner actual sólo proyecta país y estados parciales; `human_review` no acredita «cumple». La señal propuesta `app.contact_request.ready` requiere esquema/transport/firma/ACK/reconciliación compartidos. No está implementada.

Registrar después vincula el mismo chat, conserva actor histórico, event_id/intención/revisión y recibo, y no vuelve a entregar la solicitud. El contrato de agenda queda separado. [Mapas corregidos y capturas](../app/2026-10-10-mapas-pantallas-app-anonima.md).

## Identidad, permisos y continuidad

1. Portal crea una identidad aleatoria previa a cuenta y una credencial revocable de instalación/sesión; conserva únicamente la huella del secreto. Tiene acceso a sus propios sondeos APP, envío, historial propio y recibos, según la adenda; solicitud visitante de contacto sólo después del gate y confirmación, con permiso/DTO pendientes. No admite case_ref, permisos de expediente, atención humana ni selección de agente/proyecto/entorno/CRM desde el móvil. No se exige nombre/contacto para empezar. Al solicitar gestor se valida nombre y un canal con propósito y confirmación, sin convertirlos en identidad autenticada. Privacidad y soporte permanecen accesibles.
2. La referencia de identidad conversacional debe permanecer estable durante el registro. Se añade la cuenta verificada a su asociación; no se copian mensajes ni se inicia otra ChatSession. Permanecen id público, ids de mensajes, revisiones, títulos, recibos y claves/resultados históricos de operación.
3. Las operaciones posteriores a la vinculación se autentican con la sesión APP de cuenta. Las antiguas mantienen su huella y sujeto original: una misma petición reintentada no adquiere otra identidad ni ejecuta dos efectos por cambiar de principal.
4. La lista de Mensajes muestra los chats accesibles al visitante de esa instalación, sin exponer historiales de otros visitantes. Después del registro, la cuenta recupera el chat vinculado también en otros dispositivos autenticados.
5. Se documentarán duración de credencial temporal, retención de datos/contactos y borrado. Propuesta inicial para revisión: credencial de visitante de hasta 7 días sin renovación ilimitada; enlace de continuación de 30 minutos; caducidad calculada y aplicada por servidor. Una credencial de corta duración no decide por sí sola la retención del historial. El backend debe limitar creación de identidades/chats, envíos y coste por sujeto e integración; no se permite sortear el límite obteniendo identidades sin control. Los secretos no aparecen en logs ni analítica; la página de continuación evita referer a terceros y elimina el token visible al resolverlo.

## Enlace de registro y vinculación comprobada

- Portal genera un token opaco aleatorio de al menos 256 bits, ligado a una conversación, integración, finalidad y vencimiento; guarda su hash. La respuesta sólo da una URL bajo el dominio HTTPS de Gestadia permitido por configuración del servidor.
- El deeplink público de entrada lleva únicamente contexto de recorrido permitido. No contiene nombre, teléfono, email, credenciales, ids CRM ni una referencia que permita abrir el chat de otra persona.
- Abrir una URL mediante GET no consume el token ni vincula nada: evita efectos de previsualizadores y escáneres de correo. El consumo exige acción autenticada después de verificar la cuenta.
- La continuación queda además vinculada al control de la instalación original. En el recorrido principal, registro web/nativo completa la prueba de cuenta y la APP original confirma la vinculación con su credencial previa. La credencial de cuenta no viaja en la URL de retorno. Una copia del enlace por sí sola no permite apropiarse del historial.
- Si se quiere completar desde otro dispositivo, hará falta una prueba adicional acordada: confirmación desde la instalación original o verificación del contacto previamente asociado. No se admite vincular sólo por coincidir el teléfono/email escrito en el chat. La recuperación con teléfono solamente requiere una solución de verificación de teléfono que hoy no existe en este contrato.
- Para esta primera ampliación se propone conservar el mecanismo de cuenta Portal por email. Quien haya conversado dando sólo teléfono puede seguir el sondeo y aportar un email al registrarse. Esto no impone email al comenzar el chat ni presupone una implementación SMS.
- Cuenta existente: acceso normal o recuperación, sin sobrescribir contraseña, crear duplicados ni mostrar si un email ya tiene cuenta en respuestas públicas. Verificar email del formulario no equivale a unificar historiales de personas por coincidencia.

## Consistencia Portal–LidIA

La vinculación será una operación durable e idempotente con transición explícita: preparada → confirmada por LidIA → acceso de cuenta confirmado. Portal persiste antes del envío S2S y recupera respuesta perdida consultando/reintentando la **misma operación**. El orden transaccional concreto y los DTO se cerrarán con LidIA antes de implementar.

Durante la transición se congela el envío temporal de la conversación afectada para evitar carreras; el historial se conserva y la UI muestra «Estamos vinculando tu conversación». Si falla el transporte, se mantiene recuperable y no se permite conceder ambos accesos ni crear una segunda sesión. Una solicitud de contacto ya recibida conserva su resultado durante la transición; no se vuelve a enviar. Al confirmar, se consume el enlace y se retira todo acceso temporal a esa conversación. El reintento idéntico devuelve el mismo resultado; otro destino o una cuenta diferente se rechaza. Desactivar una cuenta no permite recuperar su chat reactivando el antiguo acceso anónimo.

Si el usuario mantiene varios sondeos previos, la operación cubre inicialmente sólo la conversación indicada en el enlace. Cualquier ampliación para agruparlos debe tener un ámbito explícito; el token no reclama todos los chats automáticamente. La autorización temporal debe retirarse por conversación sin dejar accesible la vinculada ni inutilizar silenciosamente las restantes; se cerrará con LidIA si esto requiere sujetos independientes por sondeo o un vínculo de identidad con permisos por conversación. Hasta resolver ese alcance no se implementará una revocación global del visitante. El cambio de cuenta en una instalación tampoco comparte sus credenciales temporales con el siguiente usuario.

## Reparto y cuestiones para LidIA

| Responsable | Entrega propuesta |
|---|---|
| Portal | Identidad previa a cuenta, API acotada, limitación de abuso/coste, alta gratuita y verificación, tokens de continuación, pertenencia, operación durable de vinculación y revocación. Conserva cuenta/credenciales compartidas APP–Portal. |
| APP | Entrar sin login a LidIA, deeplinks verificados y retorno, Mensajes limitado al visitante, registro/acceso con continuación, aviso de transición/caducidad y misma conversación al terminar. |
| LidIA | Aceptar identidad previa al registro sólo en APP, permisos/correlación diferenciados, captura estructurada, gate de contacto diferido y señal hacia Portal, contrato de vinculación idempotente y conservación del estado/historial/recibos. |
| Zoho | Sus propios POST de hechos CRM hacia Portal; no cambia el productor ni concede acceso por los datos autodeclarados del chat. |

Solicitado a LidIA el 10/10/2026 en el chat «Gestadia_LidIA - Actualizar rama dev/IA/main»: viabilidad real, punto de agenda, contrato de identidad/vinculación, revocación, límites APP y reparto. Respuesta escrita actualizada recibida en e3b663b59: [contraste](2026-10-10-contraste-portal-app-anonima.md). Conformidad de principios; DTO/firma/estados y aprobación humana pendientes.

## Deeplinks y navegación nativa

Usar enlaces HTTPS verificados: Universal Links de iOS y App Links de Android, con dominios y rutas permitidos por servidor. La APP resuelve la entrada una sola vez tanto en arranque frío como cuando recibe el enlace estando abierta; no ejecuta un turno o crea chats por duplicarse ambos eventos.

Sin aplicación instalada, la página de entrada ofrece instalar y volver a abrir el enlace. No se promete que el paso por la tienda conserve automáticamente el contexto: la primera entrega propone una continuación explícita tras la instalación. La página de entrada no habilita una conversación anónima en el canal Web.

El registro abre su formulario con Atrás al chat original; cancelar conserva el sondeo. Los enlaces directos tienen reserva de retorno a LidIA. Agenda, permisos de Trámites y conversación de gestor conservan sus propias comprobaciones. [Mapa actual](../app/NAVEGACION.md); este recorrido se añadirá como propuesta separada hasta validarlo en dispositivos.

Fuentes técnicas primarias consultadas: [Capacitor App: appUrlOpen/getLaunchUrl](https://capacitorjs.com/docs/apis/app), [Universal Links de Apple](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content), [dominios asociados iOS](https://developer.apple.com/documentation/xcode/supporting-associated-domains) y [Android App Links](https://developer.android.com/training/app-links/about). Sustentan los mecanismos de apertura; la política de continuación tras instalar es una decisión de esta propuesta.

## Criterios de aceptación antes de activar

1. APP recién instalada/sin cuenta: conversación real sin pedir datos personales al inicio. Sólo resultado completo suficiente + voluntad de gestor abre captura de nombre y teléfono **o** email. Confirmación visitante y ACK durable antes de ofrecer cuenta opcional.
2. Deeplink con APP cerrada/abierta y sin instalar: recorrido correcto, un solo inicio, retorno seguro y contexto permitido; enlace manipulado no selecciona otro sujeto/agente.
3. Registro nuevo y acceso existente: misma conversación, estado del sondeo y mensajes; visible después en otro dispositivo de la misma cuenta. Cuenta/contacto ajenos no pueden reclamarla.
4. Cancelar/caducar el alta conserva la solicitud recibida sin reenviarla. Enlace caducado, doble consumo, dos cuentas concurrentes y respuesta S2S perdida: sin doble vinculación, duplicado de chat ni reserva. Previsualización GET sin efectos.
5. Credencial temporal anterior rechazada después de vincular; cuenta revocada no permite reentrada anónima al chat vinculado. Recibos no retroceden.
6. Solicitud de contacto visitante permitida sólo tras gate/confirmación; no otorga chat directo de gestor. Acceso anónimo a gestor protegido, expedientes o Web/WhatsApp rechazado; registro no habilita trámites sin la autoridad comercial correspondiente.
7. Pruebas unitarias/API con base temporal, contrato compartido, ciclo conectado Portal–LidIA y recorridos reales en emuladores iOS/Android. Build o mocks por sí solos no cierran la aceptación.

## Estado de trabajo y despliegue

Preparación aislada en `codex/app-anonimo-lidia`, desde el app/main indicado. Sólo documentación y maquetas locales de revisión: no migraciones, cambio de permisos, registro real ni canales activados. El despliegue Portainer/Plesk ya solicitado sigue pendiente; esta propuesta debe reflejarse en su alcance y compatibilidad, sin presentar la versión actual como compatible con conversaciones anónimas.

Antes de escribir código se cerrarán con LidIA el contrato y las responsabilidades y se presentará el diseño escrito para revisión, seguido del plan de implementación. Esta propuesta no sustituye la conformidad técnica de la fuente ni el resultado de una prueba real.
