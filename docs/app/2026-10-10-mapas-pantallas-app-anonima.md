# Revisión visual: pantallas y flujo APP sin cuenta

**10/10/2026 · Propuesta pendiente de aprobación humana.** Sólo APP. Sin implementación, activación ni despliegue. [Glosario](../../GLOSARIO.md) · [Propuesta técnica](../integraciones/2026-10-10-propuesta-app-anonima-lidia.md) · [Contraste con LidIA](../integraciones/2026-10-10-contraste-portal-app-anonima.md).

## Diagramas para decidir

- [Diagrama 1: pantallas y flujo](prototipos/lidia-anonima/exportaciones/01-flujo-pantallas.svg) · [Fuente Mermaid](prototipos/lidia-anonima/exportaciones/01-flujo-pantallas.mmd).
- [Diagrama 2: recorrido con imágenes de pantalla](prototipos/lidia-anonima/exportaciones/02-pantallas-recorrido.jpg) · [Alternativas con imágenes](prototipos/lidia-anonima/exportaciones/03-alternativas.jpg).
- [Tablero navegable](prototipos/lidia-anonima/index.html), local `http://127.0.0.1:5190/`: amplía capturas y abre cada maqueta.
- [Mapa de navegación](NAVEGACION.md), [plan](2026-10-10-plan-mapas-lidia-anonima.md) y [revisión visual](../../design-qa.md).

Las tres referencias «Actual» proceden de la demo aislada de `app/main` en `a6d6e1497e32efa3c6a45fff3d6c67017a86bc05`. Las **veinte vistas «Propuesta»** reutilizan `frontend/app/src/app.css` e `Icon.jsx`; son doce estados principales y ocho alternativas. Capturas a **390 × 844 CSS px**, sin marco, notch o barra de estado nativa inventados.

## Decisiones visibles corregidas

1. Hablar con LidIA desde deeplink o Inicio sin cuenta y **sin pedir nombre, teléfono ni email al comenzar**. El texto libre se muestra como mensaje, nunca se interpreta automáticamente como nombre.
2. Completar los requisitos del canje. Un resultado parcial, negativo o human_review no permite solicitar contacto comercial. Elegir un país tampoco acredita viabilidad.
3. Sólo con resultado completo suficiente y voluntad expresa, explicar la finalidad y pedir **nombre y teléfono O email** para que contacte el gestor.
4. Confirmar y **enviar la solicitud como visitante**, conforme a la decisión humana del 10/10. «Solicitud recibida» exige un ACK durable de Portal; no equivale a conversión CRM ni cita confirmada.
5. Ofrecer después una cuenta opcional para guardar/recuperar el mismo chat. Registro, login y verificación no envían una nueva solicitud. Cancelar/caducar el alta deja intacta la solicitud recibida.
6. Nueva conversación está en Mensajes, en una acción compacta; no aparece como barra flotante debajo del chat. Visitante ve sólo sus chats de instalación; la cuenta recupera los vinculados desde otros dispositivos.

La maqueta anuncia «Sin conexión a LidIA». No genera respuestas IA al texto libre. El cuestionario es un fragmento ilustrativo: el enlace de revisión **«Ver ejemplo de resultado» está fuera de la APP**, en la franja de la maqueta. No calcula viabilidad ni sustituye el guion real del agente. Verificación, vinculación y recibos son simulaciones de diseño.

## Flujo de pantallas

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

## Excepciones y responsabilidades

| Estado | Resultado |
|---|---|
| Requisitos incompletos / revisión humana | Continúa el chat sin datos comerciales ni solicitud |
| Ya tiene cuenta | Acceso opcional conserva chat y solicitud, sin duplicar alta |
| Cancela el registro | Continúa como visitante; el gestor puede contactar igualmente |
| Enlace de registro caducado | Puede pedir otro desde el chat original; solicitud intacta |
| Vinculación incierta | Recupera la misma operación; no duplica chat/entrega |
| APP no instalada | Instalar y reabrir explícitamente el mismo enlace |
| Trámite/chat directo de gestor | Acceso protegido y Atrás al origen |
| Mensajes visitante | Sólo chats propios de instalación; Nueva conversación visible aquí |

LidIA mantiene conversación y resultado/intención estructurados. Portal conserva la solicitud durable y correlación; **los flujos Zoho** convierten lead a contacto/trato y envían Cerrado ganado. La cuenta gratuita no habilita trámites por sí sola.

El runner APP actual sólo proyecta país y estados parciales. Siguen pendientes reglas de cualificación completa, permiso de solicitud visitante, DTO/firma/ACK/reconciliación y contrato de agenda. No hay acceso anónimo de producto activado por este tablero.

## Reproducir la revisión

```sh
node frontend/node_modules/vite/bin/vite.js --config docs/app/prototipos/lidia-anonima/vite.config.mjs
```

Sin backend. Si faltan dependencias, enlazar `docs/app/prototipos/lidia-anonima/node_modules` a `../../../../frontend/node_modules` (ignorado). `generar-tablero.py` actualiza inventario/SVG; las capturas se versionan. `?captura=1` oculta únicamente la franja externa de revisión al capturar; la maqueta interactiva siempre declara su condición.

La aprobación corresponde al recorrido visible. No cierra el contrato S2S, reglas, agenda, pruebas nativas ni activación.
