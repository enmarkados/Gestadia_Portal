# Manual de desarrollo: flujos y pantallas de Gestadia APP

**Referencia viva del proyecto · 11/10/2026.** Petición del usuario: conservar lo trabajado en el proyecto y usarlo para guiar el desarrollo. [README del repositorio](../../README.md) · [README APP](../../README-APP.md) · [Glosario](../../GLOSARIO.md).

## Cómo empezar

1. Lee [NAVEGACION.md](NAVEGACION.md): rutas implementadas, orígenes, Atrás, menú inferior, permisos, hojas y retornos externos. Distingue el recorrido implementado del alcance futuro de contacto cualificado.
2. Abre el [mapa vigente con capturas](2026-10-11-recorridos-gestores.md) y, para antecedentes de diseño, los [mapas de propuesta](2026-10-10-mapas-pantallas-app-anonima.md) y su tablero con los comandos de abajo. Compara lo que ve el usuario con el flujo, no sólo el nombre de una ruta.
3. Consulta la [propuesta técnica](../integraciones/2026-10-10-propuesta-app-anonima-lidia.md), el [contraste Portal](../integraciones/2026-10-10-contraste-portal-app-anonima.md) y el [cierre documental LidIA](../integraciones/2026-10-10-cierre-lidia-mapas-portal.md) antes de tocar identidad, contacto o continuidad.
4. Identifica el estado que cambia y sigue el procedimiento de mantenimiento. No implementar una decisión pendiente como si ya estuviera aprobada.

**Revisión vigente del 11/10:** [recorridos, plan, capturas y límites](2026-10-11-recorridos-gestores.md). La respuesta humana autoriza implementar entrada anónima por instalación, separación de LidIA/Mensajes, continuidad, gestores, acceso social y notificaciones. El consumidor v2 usa el [wire r4 recibido](../integraciones/2026-10-11-app-v2-wire-lidia-r4.md), instalación/autoridad/vínculo durables y API propia. Se valida en base aislada y revisión visual local; guest sigue apagado por defecto y no está activado en PRO. El agente conserva las preguntas y decisiones. La solicitud automática tras resultado suficiente sigue pendiente de una señal estructurada del agente; el botón explícito de llamada ya tiene su recorrido y adaptador CRM.

**Avance técnico del 10/10:** [coordinación Portal v2](../integraciones/2026-10-10-coordinacion-portal-contrato-v2.md) y [plan por bloques](../superpowers/plans/2026-10-10-app-v2-portal.md). Se ha comprobado una nueva instrucción humana de implementación del contrato en LidIA. Portal ha preparado el transporte/requests aislados del [wire r3](../integraciones/2026-10-10-contraste-portal-wire-v2-r3.md), con schemas/vectores exactos y pruebas; las respuestas siguen en revisión y no hay API v2 integrada ni activada en la APP. La precisión humana posterior fija que la integración transmite mensajes al agente 119 y muestra sus respuestas; no crea un cuestionario o calificador paralelo.

**Prioridad inmediata de integración:** comprobar APP → Portal → LidIA → agente 119 real → respuesta literal en APP, sobre v1 y por separado del v2 pendiente. La pasarela de cuenta está revisada e integrada; la cuenta ficticia nueva fue autorizada y la instancia conectada5177 está preparada con sondeo/history durante24h. LidIA ejecutó login, nueva consulta, un turno y recuperación desde UI; Portal conserva sus capturas y verificó la asociación/operación local. La evidencia SQL fuente atribuye la misma sesión a119/102 y una llamada real al modelo correcta. Este ciclo web no acredita sondeo completo, CRM, gestor, anónimo ni aceptación nativa. [Registro de coordinación](../integraciones/2026-10-10-coordinacion-portal-contrato-v2.md).

**Estado fuente del11/10:** LidIA comunica PRO `84ef05902b87439dd92008ef73a8deaa2a5d7b99`, marcador `V1.718-app-agente-contexto`, configuración119 adicional y122 conservada. Portal localizó el commit y observó health200; SHA/configuración efectivos y Playground se atribuyen al equipo fuente, no a una prueba APP ejecutada por Portal. La evolución histórica del motor está en el registro de coordinación.

**Asociación v1 integrada:** [PR12](https://github.com/enmarkados/Gestadia_Portal/pull/12) fusionada en `app/main` mediante `be6bed66327e9efe521ecd380d549fcb07a307c2`; checkout local limpio y sincronizado0/0. El código backend/frontend coincide con el snapshot que pasó **201 backend /152 frontend /build APP**. Conserva122 y resuelve119 para nuevas consultas por configuración privada; el modo público sigue demo y no cambia pantallas/rutas. [Plan](../superpowers/plans/2026-10-11-app-integraciones-119-122.md).

**Revisión y recuperación:** tres hallazgos importantes corregidos con RED→GREEN. La configuración S2S119/122 se recuperó cifrada en almacenamiento privado persistente, pero la base temporal Portal y su cuenta no sobrevivieron al reinicio. La respuesta humana posterior autoriza un principal ficticio nuevo con sondeo/history24h; no se hereda identidad/historial122 por disponer de claves. [Procedimiento y estado para continuar](2026-10-11-reanudacion-app-119.md); la consulta real de cuenta en navegador local y recuperación quedó comprobada con capturas nuevas. No hay cambios visuales de código por esta corrección backend; la evidencia mantiene sus propios SHA/entorno y no acredita aceptación nativa.

### Usar esta referencia al empezar una tarea

Antes de editar una pantalla, anota su ruta o ID de maqueta, estado, origen, destino de Atrás, permisos y acción final. Busca ese recorrido en NAVEGACION y compara sus capturas. Si la decisión sólo aparece en una propuesta, conserva esa distinción en la tarea. Al terminar, actualiza los archivos afectados de la tabla de mantenimiento y registra versión, entorno y resultado de las comprobaciones. [AGENTS.md](../../AGENTS.md) exige este procedimiento a quienes trabajan en el repositorio.

## Qué está implementado y qué está en revisión

| Material | Estado y uso |
|---|---|
| APP y API conversacional | Visitante o cuenta real; sin demostración. v1 de cuenta y consumidor guest v2 requieren su configuración privada vigente. Build y Git no prueban despliegue. |
| Movimiento | [ANIMACIONES.md](ANIMACIONES.md): 280 ms, cabecera/dock estables y movimiento reducido. |
| Recorridos vigentes | [Revisión 11/10 con plan y capturas](2026-10-11-recorridos-gestores.md): IA en LidIA; gestores en Mensajes; Login o Continue sin registro; campana y perfil. |
| Guest APP v2 | Implementado en la revisión 11/10 con token de instalación, sujeto por chat, retries durables y vínculo de cuenta. Configuración apagada por defecto; aceptación conjunta conectada y activación pendientes. |
| Gestor y llamada | Contexto en servidor, permisos de expediente y asignación; callback durable Lead/Contact/Task. Pruebas locales y de interfaz; entrega real CRM y handoff conectado pendientes. |
| Propuesta del 10/10 | [Mapas originales](2026-10-10-mapas-pantallas-app-anonima.md), 23 estados propuestos y tres referencias antiguas. Son antecedentes de diseño; sus capturas conservan fecha/bytes, no prueba de la revisión actual. |
| Contacto cualificado / alta opcional | Propuesta futura: señal oficial del agente, operaciones contact-request y alta opcional todavía no disponibles en r4. No inferir elegibilidad del texto. |
| Handoffs, tiendas y actas anteriores | Evidencias fechadas de su versión y entorno, independientes de esta revisión. |

La evidencia de retirada de demostración se conserva en [NAVEGACION.md](NAVEGACION.md) y [estado Docker](ESTADO-APP-PORTAL-DOCKER.md). Las referencias «Actual» del tablero mantienen sus bytes y la procedencia antigua.

La documentación y los prototipos son referencias de desarrollo. La autorización humana del 11/10 permite el consumidor y las pantallas descritos en la revisión vigente; no acredita activación del canal ni E2E remoto. Las menciones de rama/PR en documentos fechados describen su entrega histórica; para el estado vigente, consulta este manual, el código y la configuración efectiva.

## Abrir el tablero y las pantallas

Desde la raíz del repositorio, con Node/npm y Python 3 disponibles:

```sh
npm ci --prefix frontend
test -e docs/app/prototipos/lidia-anonima/node_modules || ln -s ../../../../frontend/node_modules docs/app/prototipos/lidia-anonima/node_modules
node frontend/node_modules/vite/bin/vite.js --config docs/app/prototipos/lidia-anonima/vite.config.mjs
```

El enlace de dependencias es local e ignorado por Git. Si `frontend/node_modules` ya está instalado y actualizado, no hace falta repetir `npm ci`.

Abre **http://127.0.0.1:5190/**:

- **1. Pantallas y flujo:** diagrama general y alternativas.
- **2. Pantallas reales y propuestas:** capturas ampliables y acceso a cada pantalla navegable.
- **Mapa de navegación y Atrás:** entradas, salidas y menú.

Si 5190 ya sirve este tablero, úsalo. Para una segunda revisión, añade `--port 5194` al comando y abre ese puerto; no detengas otros servicios para liberar uno.

Pantalla directa de ejemplo: `http://127.0.0.1:5190/pantalla.html?s=consulta`. Los identificadores de la maqueta viven en [pantallas.json](prototipos/lidia-anonima/pantallas.json) y no son las rutas de React del producto. `?captura=1` sólo oculta la franja externa para capturar; la revisión interactiva declara «Maqueta · Sin conexión a LidIA».

Para leer los diagramas sin servidor:

- [Flujo SVG](prototipos/lidia-anonima/exportaciones/01-flujo-pantallas.svg) y [fuente Mermaid](prototipos/lidia-anonima/exportaciones/01-flujo-pantallas.mmd).
- [Recorrido con pantallas](prototipos/lidia-anonima/exportaciones/02-pantallas-recorrido.jpg).
- [Alternativas con pantallas](prototipos/lidia-anonima/exportaciones/03-alternativas.jpg).

Las capturas y exportaciones están versionadas. No depende de la URL temporal: cualquier checkout con sus dependencias puede arrancar el tablero. [README del prototipo](prototipos/lidia-anonima/README.md).

## Retomar tras cerrar o reiniciar el Mac

1. Revisar `git status --short --branch` en el checkout y en el worktree del plan; leer el ledger del bloque antes de volver a ejecutarlo. Commits y documentación sobreviven al cierre; procesos y fixtures temporales pueden desaparecer.
2. Arrancar la APP con `npm run app:dev` (5174) y el tablero con el comando anterior (5190). Usar los puertos ya ocupados por esos servicios; no detener procesos ajenos.
3. Recargar la pestaña existente si quedó en «Preparando Gestadia» o con una carga interrumpida. En la reanudación del 11/10 se recuperó así la pantalla de acceso; no hizo falta cambiar código ni introducir datos.
4. Para el harness aislado, abrir Docker Desktop y comprobar que el daemon está disponible. `node scripts/test-app-conversations.mjs` crea y limpia su base temporal; no equivale a arrancar un backend conectado ni acredita llamadas al 119.
5. La prueba conectada del11/10 usa APP5177/backend3004 y base durable propia; consultar manifest, vigencia y procedimiento en [reanudación119](2026-10-11-reanudacion-app-119.md). No reconstruir un fixture conectado desde un PID antiguo, archivos ausentes de `/tmp` o permisos históricos. Comprobar cuenta, vigencias, configuración efectiva e identidad del servicio antes de una prueba conectada; no renovar autoridad ni habilitar v2 para resolver un fallo de arranque.
6. Consultar la coordinación LidIA para versión y configuración efectivas. La configuración pública versionada no sirve una demo ni activa conexiones guest; cada circuito requiere configuración privada y comprobación separada.

## Cómo recorrer la propuesta anónima

| Tramo | Pantallas | Qué revisar |
|---|---|---|
| Entrada y requisitos | 01 → 02 → 03; deeplink entra en 02 | Consulta sin cuenta, nombre, teléfono o email al inicio. Texto libre como mensaje literal, sin saludo que lo interprete como nombre. |
| Resultado | 04, A4 o A10 | Favorable completo, incompleto/revisión humana y negativo son estados diferentes. Elegir país no cualifica; negativo no obliga a repetir ni abre contacto comercial. |
| Contacto visitante | 05 → 06 → A9 → 07 | Sólo tras resultado suficiente y voluntad expresa: explicar propósito, nombre y teléfono O email. Sin ACK durable, comprobar la misma solicitud sin afirmar recepción ni reenviar. |
| Cuenta opcional | 07 → 08/A1 → 09 → 10 → 11 | Cuenta verificada Y control de instalación original. Mismo historial, actor original y solicitud. Cancelar alta no cancela ni reenvía lo recibido. |
| Continuidad | A8 / 12 | Mensajes recupera el estado del chat, ofrece Nueva conversación, búsqueda, renombrado, fechas y estado. Visitante ve sólo lo propio de esa instalación. |
| Excepciones | A2, A3, A5, A6, A7, A11 | Cancelación, caducidad, instalación, acceso protegido, recuperación y vínculo bloqueado. Atrás conserva el origen completo; Inicio sólo de reserva. |

**Alcance técnico posterior:** wire r3 reserva las operaciones de contacto. Los tramos contacto/cuenta y sus alternativas siguen visibles para revisión, pero no son capacidades disponibles ni el alcance activado del transporte preparado. La consulta real debe consumir el agente 119; los estados ilustrativos del tablero no lo sustituyen.

El cuestionario es ilustrativo. Para saltar a un resultado usa **«Ver ejemplo de resultado»** o **«Ver ejemplo negativo»** en la franja externa; no es una evaluación del agente. Confirmar contacto llega a A9; **«Ver confirmación de ejemplo»**, fuera de la APP, simula el ACK. **«Ver pérdida de instalación»** muestra A11. Correo, vínculo y tics de otros estados son ejemplos de diseño, no efectos reales.

Si se pierde la instalación original, el vínculo queda bloqueado aunque la cuenta esté verificada. Enlazar el chat A no revoca B: sujeto inmutable por conversación, actor y propietario separados. No recuperar historiales por coincidencia de contacto o por poseer un enlace.

## Criterios que debe conservar el desarrollo

- Cabecera de chat con Atrás al origen; principales con cuatro pestañas. Las hojas cierran sobre quien las abrió; acceso y legales permiten volver aunque oculten el menú.
- Cliente con LidIA: negro suave. Cliente con gestor: rojo. Cabecera negra Gestadia; listado de Mensajes compacto; etiquetas, campos completos y objetivos táctiles adecuados. [Criterios y evidencia](PLAN-DISENO-APP.md).
- Movimiento: avance/regreso de contenido en 280 ms, Cuenta junto a su origen, paneles inferiores, pulsación de 120 ms y mensajes nuevos suaves. Cabecera/dock permanecen estables; el historial recuperado no se anima. Respetar y reaccionar a `prefers-reduced-motion`. [Guía y evidencia](ANIMACIONES.md).
- Las respuestas elegidas muestran su texto legible, no el id del botón. Al recuperar un chat no crear otro, perder su contexto ni ofrecer un inicio durante carga incierta.
- Nueva conversación con LidIA se ofrece en la pestaña LidIA; no dentro del chat, ni sobre su compositor. Atrás conserva el origen para volver a esos accesos. [Decisión y comprobación vigente](2026-10-11-lidia-accesos.md).
- Servicios conserva selección/borrador al volver y precarga los datos del checkout, incluido teléfono. [Corrección comprobada](2026-10-10-telefono-servicios-checkout.md).
- APP no selecciona agente, proyecto, entorno, operador ni CRM. El backend resuelve identidad, pertenencia y permisos. [Responsabilidades](RESPONSABILIDADES-INTEGRACION.md).
- La integración es una pasarela **APP → Portal → LidIA → agente 119 → respuesta a la APP**. Las preguntas, respuestas y decisiones de canje proceden del agente; no se implementan reglas de elegibilidad ni un catálogo nuevo en Portal. Mostrar texto es la base; HTML o respuestas dinámicas son opcionales si no complican el recorrido. No basta una maqueta o fixture para acreditar ejecución del 119.
- LidIA gestiona conversaciones y resultado/intención; Portal conserva cuenta y solicitud durable; **flujos Zoho** convierten lead/contacto/trato y postean Cerrado ganado a Gestadia. Solicitud, conversión y cita son hechos distintos.

## Qué archivo mantener cuando algo cambia

| Archivo o carpeta | Responsabilidad |
|---|---|
| Este manual, README raíz/APP y AGENTS.md | Entrada de desarrollo y reglas para usar la documentación |
| [ANIMACIONES.md](ANIMACIONES.md) | Duraciones, direcciones, foco, movimiento reducido, plan y evidencia de navegador |
| [NAVEGACION.md](NAVEGACION.md) | Rutas/estados, origen completo, Atrás, menú, permisos y salida |
| [Mapas de la propuesta](2026-10-10-mapas-pantallas-app-anonima.md) | Decisiones visibles, diagrama y excepciones de revisión |
| [Fuente Mermaid](prototipos/lidia-anonima/exportaciones/01-flujo-pantallas.mmd) | Flujo compartido; mismo contenido en propuesta técnica, mapas y sección correspondiente de NAVEGACION |
| [generar-tablero.py](prototipos/lidia-anonima/generar-tablero.py) | IDs, orden y textos del inventario; genera pantallas.json y SVG |
| [pantallas.jsx](prototipos/lidia-anonima/pantallas.jsx) y CSS | Maqueta aislada, reutiliza estilos/iconos de la APP; sin importar API/autenticación del producto |
| `capturas/` y `exportaciones/` | Evidencia visual versionada; recapturar vistas modificadas y exportaciones afectadas |
| [design-qa.md](../../design-qa.md) | Hallazgos, comprobaciones visuales y límites de la maqueta; no aceptación global de la APP |
| [Índice de integraciones](../integraciones/README.md) | Contratos vigentes, responsables, dependencias y copias históricas |
| [GLOSARIO.md](../../GLOSARIO.md) | Nombres técnicos, definición, alcance y notas |

### Procedimiento de mantenimiento

1. Identificar cambio y autorización. Especificar origen, estado y salida; contrastar contrato si modifica permisos o efectos externos.
2. Actualizar mapa/rutas y fuente Mermaid. Sincronizar su bloque en los tres documentos indicados; no dejar flechas que contradigan las tablas de Atrás.
3. Si cambia una propuesta, actualizar inventario y maqueta. Ejecutar:

```sh
python3 docs/app/prototipos/lidia-anonima/generar-tablero.py
```

Este generador actualiza **JSON y SVG**; no regenera las imágenes ni sincroniza los bloques Mermaid por sí solo.

4. Recapturar las vistas afectadas a 390 × 844, actualizar exportaciones y comprobar la secuencia junto con alternativas. Conservar referencias «Actual» y nuevas «Propuesta» diferenciadas. Verificar cabecera, contenido, compositor, dock, teclado y Atrás.
5. Para un cambio funcional, probar entradas desde Inicio/Mensajes/enlace directo, retorno protegido, error/pendiente, cancelación y recuperación. Registros, conversaciones reales, emuladores, dispositivo físico, build y despliegue son comprobaciones independientes.
6. Registrar en QA/acta qué se ejecutó, versión, entorno y limitaciones. No convertir maquetas ni pruebas históricas en evidencia de funcionamiento remoto.
7. Actualizar glosario y enlaces, revisar diff y entregar el cambio con sus mapas/evidencia. Las copias recibidas conservan bytes y procedencia; usar otra revisión para registrar cierres nuevos.

### Comprobaciones según el cambio

```sh
# Siempre: higiene del diff
git diff --check

# Sólo maqueta/tablero: compilación aislada
node frontend/node_modules/vite/bin/vite.js build --config docs/app/prototipos/lidia-anonima/vite.config.mjs --outDir /tmp/gestadia-tablero-build --emptyOutDir

# Código de la APP/Portal: regresiones frontend y build APP
NODE_OPTIONS=--no-experimental-webstorage npm test --prefix frontend
npm run app:build

# Contrato/consumidor conversacional: harness con base temporal
node scripts/test-app-conversations.mjs
```

El directorio de salida temporal de la maqueta debe dedicarse a esa compilación. Los checks se eligen por el cambio; no ejecutar pagos, borrados o flujos de producción para verificar documentación. La aceptación nativa se sigue en [MOBILE.md](MOBILE.md) y [VALIDACION.md](VALIDACION.md).

## Pendientes y orden para continuar

**Pendientes de la revisión vigente:** ciclo conectado guest APP → Portal → LidIA →119 con aislamiento DEV, caducidad, recuperación y vínculo; gestor real con expediente/asignación y permisos verificados; callback CRM con campos/propietario/workflows del tenant; Google/Apple con cuentas existentes, desconocidas y revocadas; push y navegación desde aviso real; Android y dispositivo físico con esta versión. La revisión visual usa un fixture HTTP explícito sin servicios externos. No renovar el grant119 ni activar guest para sustituir esas pruebas.

El contacto automático después de cualificar, alta opcional y agenda conservan sus contratos pendientes. r4 mantiene contact-request reservado y `sondeo:null` en muestras locales. Usar exclusivamente resultados/acciones oficiales del agente; no detectar un favorable mediante palabras o país. Una solicitud pendiente de Zoho requiere reconciliación manual por su id durable, no otro POST con nueva key. Cuenta creada por contratación/eventos Zoho y chat guest vinculado son decisiones distintas.

La publicación, despliegue y activación mantienen su alcance y autorización propios. [Despliegue APP](DOCKER-PLESK.md) · [Tiendas](MARKETPLACES.md). Esta guía guarda la referencia de desarrollo; no da por realizados esos trabajos.

Comprobación documental del 10/10/2026: 212 enlaces locales válidos entre las entradas, mapas, plan y coordinación revisados; inventario de 12 estados principales, 11 alternativas y 3 referencias, con sus 26 capturas JPEG a 390 × 844; Mermaid idéntico en navegación, mapas y propuesta técnica. El tablero arrancó desde este checkout en 5190 y su compilación aislada terminó correctamente. Esta comprobación acredita que la referencia se puede consultar; no valida el flujo anónimo conectado ni la APP nativa.

### Comprobación autenticada en APP — 11/10/2026

Sesión real de la cuenta de pruebas: Inicio → Nueva conversación → Iniciar → consulta → respuesta de LidIA → opción No → segunda respuesta → Mensajes → mismo historial recuperado. Dos turnos y dos respuestas observadas; opciones consumidas y retorno Volver a Mensajes. No se solicita atención, contratación ni expediente. [Captura nueva del historial](evidencias/2026-10-11-chat-real/chat-recuperado.png). Esta prueba acredita el recorrido web autenticado; OAuth y entrega push nativos conservan su aceptación independiente. Las maquetas anónimas no se activan.


### Arranque nativo comprobado — 11/10/2026

La entrada esperada por SecureStorageNative contenía una espera de nivel superior que bloqueaba su importación circular. El arranque se ejecuta ahora desde startApp después de terminar la evaluación del módulo; mantiene el orden configuración, sesión segura, teclado y retorno social. Si la preparación falla se muestra la recuperación existente (Recargar) y se retira el splash. Dos regresiones reproducen primero el bloqueo y el rechazo sin recuperación, y pasan tras el cambio. Suite frontend 162/162. Android debug abre Home real con 4 GB/cuatro núcleos; captura [home-debug.png](evidencias/2026-10-11-arranque-android/home-debug.png). Aún sin atribuir firma de distribución, login o push a esa captura.


La misma corrección de arranque supera también la instalación y apertura del APK Release firmado, con hash instalado idéntico. [Home Release Android](evidencias/2026-10-11-arranque-android/home-release.png). Acceso preparado para el usuario; OAuth y push todavía pendientes.

### Acceso social con marca oficial — 11/10/2026

Por petición del usuario, conservar el diseño oficial de Apple/Google en acceso y vinculación. Recursos locales en `frontend/app/public/brand/social/`; fuente Google Sans con licencia incluida. La documentación oficial permite la imagen Apple generada por su CDN y el botón Google personalizado conforme a sus reglas. No sustituir el símbolo Google por un icono monocromo ni por un dibujo anterior. [Apple](https://developer.apple.com/documentation/signinwithapple/incorporating-sign-in-with-apple-into-other-platforms) · [Google](https://developers.google.com/identity/branding-guidelines). La validación visual no acredita completar OAuth.

Android Release actualizado conserva sesión y recibe avisos reales mediante FCM. Canal gestadia_updates creado antes de registro/reanudación; suite frontend 164/164. La recepción SMTP y el diseño del correo en Thunderbird claro/oscuro quedan confirmados por el destinatario. La ficha Apple Gestadia se crea con Apple ID 6821484915; subir un archivo no equivale a publicación o aceptación nativa iOS.


Segunda recepción real Android 82d011a en canal propio gestadia_updates comprobada; mantiene marca oficial y sesión real. [Capturas nuevas y límites de aceptación](evidencias/2026-10-11-marketplaces/README.md). iOS 0.1.0 (1) subido y procesado en TestFlight; no acredita OAuth, APNs ni instalación.


### Distribución interna — 11/10/2026

Gestadia 82d011a distribuida: TestFlight 0.1.0 (1) «En pruebas», un tester invitado; Play 0.1.0 (1) «Disponible para testers internos», sin testers configurados. La firma Play requiere un cliente OAuth Android adicional preparado, creación pendiente. Instalaciones desde tiendas, OAuth y APNs no comprobados. Por indicación humana mantener LIA abierto y revisar iOS después, sin iniciar otro emulador. [Evidencia y límites](evidencias/2026-10-11-marketplaces/README.md).

### Actualización nativa solicitada · 11/10/2026

Integración de movimiento d3ca03c en la rama marketplace conservando el flujo real sin demos. El usuario aprueba escritura LidIA y pide sincronizar compositor/menú con el teclado iOS. No cambia pantalla, origen, permisos, destino de Atrás ni acción final. [Detalle de implementación y límites](ANIMACIONES.md#candidato-nativo-con-escritura-y-teclado--11102026). Nueva build TestFlight (2) en preparación; no atribuir estas mejoras a la build instalada (1).

### Escritura de LidIA animada · 11/10/2026

El usuario usa build (2) y solicita animar también el texto. El indicador conserva cursiva, ubicación, permisos y retirada al responder/fallar; texto con pulso suave 1600 ms y puntos secuenciales 1200 ms (0/160/320 ms, 3 px). No cambia origen, navegación, Atrás ni acción final. Movimiento reducido mantiene los cuatro elementos estáticos y legibles. [Verificación del indicador y límites de build (3)](evidencias/2026-10-11-escritura-animada/README.md).

- [Integración app/main y entrega TestFlight (4)](2026-10-11-testflight-appmain-build4.md): revisión, comprobaciones y límites de activación.

### Escritura en negrita y puntos en ola · revisión del 11/10/2026

La petición humana sustituye la cursiva por negrita y añade entrada/salida suaves 280 ms, pulso de texto 1800 ms y ola visible de tres puntos 1400 ms con desfases0/200/400ms y subida 5 px. LidiaTypingIndicator conserva el DOM durante la salida y retira el anuncio accesible al responder; movimiento reducido permanece estático con retirada inmediata. Pantalla, origen, permisos, destino de Atrás y acción final se conservan. [Evidencia local y estado de distribución build (5)](evidencias/2026-10-11-escritura-ola/README.md).

### Burbujas nuevas de LidIA · revisión del 11/10/2026

Corrección solicitada para `/lidia/conversacion`: entrada suave 280 ms/8 px desde el primer fotograma, conservación de la referencia del historial al recibir páginas nuevas y desplazamiento suave al llegar respuestas. Los segmentos históricos `[SPLIT]` de LidIA se presentan como burbujas separadas; los segmentos nuevos de un mismo mensaje entran con desfases de 80 ms (máximo320ms). Identidad, recibos y acciones se conservan; la presentación interactiva aparece una sola vez, en el último segmento. No cambia origen, permisos, destino de Atrás ni acción final; no confirma ni crea reservas. Carga inicial/páginas antiguas y movimiento reducido permanecen directos. [Evidencia de esta revisión y estado build (6)](evidencias/2026-10-11-burbujas-suaves/README.md).

La recarga directa de `/lidia/conversacion` y `/lidia/conversacion/` se sirve también mediante el índice APP de Docker; el bloqueo del proxy antiguo bajo `/lidia/` se mantiene para sus endpoints. No se cambia la navegación ni la autorización de la pantalla. [Regresión HTTP y evidencia](evidencias/2026-10-11-burbujas-suaves/README.md).


### Hora al pie de las burbujas · 11/10/2026

Corrección solicitada para `/lidia/conversacion` (cuenta o visitante habilitado) y las conversaciones de gestor: la hora procedente de `occurred_at` se muestra al final, alineada a la derecha. En mensajes propios queda inmediatamente a la izquierda de los ticks de entrega confirmados por el servidor; en LidIA y gestor se muestra sin ticks. Si existe una presentación con botones, el pie queda después de ella. Conserva origen, Atrás, permisos, envío y entrada animada; no modifica mensajes persistidos. [Evidencia de esta revisión](evidencias/2026-10-11-hora-pie/README.md).


### Desplazamiento al tocar el compositor — 11/10/2026

Tocar o enfocar el campo de las conversaciones lleva suavemente al último mensaje en 280 ms; otro toque también funciona si el campo ya está enfocado. Mientras tiene foco, adapta el destino al cambio de altura del teclado. Al salir del campo se puede leer el historial libremente. Reducir movimiento lleva directamente al fondo. Pantalla, origen, permisos, destino de Atrás y envío se conservan; no envía mensajes ni ejecuta reservas. [Evidencia y distribución de esta revisión](evidencias/2026-10-11-scroll-compositor/README.md).


### Contacto visible y carga de chats — 11/10/2026

La hoja «Hablar con un gestor» acompaña el teclado y permite desplazar su formulario para mantener visible el teléfono. La carga de conversaciones/mensajes y comprobación del gestor incorpora GIF propio centrado y texto contextual; movimiento reducido usa imagen fija. Actualizar conserva el historial y los errores retiran el indicador. No cambia origen, Atrás, permisos, asignación ni envío. El proxy Docker común admite las tres rutas exactas de contacto que faltaban en la plantilla seleccionada. [Verificación y límites](evidencias/2026-10-11-gestor-carga/README.md).

### Conversación antigua de atención — revisión 11/10/2026

La cuenta de prueba conserva un chat de atención sin gestor ni caso, con permiso exclusivo `history`. El servicio rechaza un turno técnico con `capability_denied`. La pantalla mantiene el historial, desactiva acciones y compositor, explica la restricción y remite a «Solicitar llamada». Origen Mensajes; Atrás devuelve a Mensajes. No se crea una conversación alternativa ni se modifica la asignación. [Evidencia y límites](evidencias/2026-10-11-gestor-carga/README.md).

### Contraste de perfil y agenda APP — 11/10/2026

[Revisión Portal de la adenda LidIA](../integraciones/2026-10-11-contraste-portal-perfil-agenda.md): conformidad de arquitectura y reparto, wire y mapping CRM pendientes. Perfil opcional autenticado sin zona/consentimiento inventados; el agente conserva preguntas y confirma datos operativos. Ningún cambio de pantallas, permisos, asignación, despliegue o build móvil por esta revisión documental.

### Backend de perfil opcional preparado — 11/10/2026

[Preparación y pruebas](evidencias/2026-10-11-perfil-contexto/README.md): contexto v1 opcional desde cuenta comprobada, parches/revisión durables y retirada prioritaria con el mismo parche. Esquemas v1/v2 contrastados; consumidor account v2 pendiente. Flags privados apagados, sin nuevos grants CRM, migración productiva ni build/distribución adicional. Pantalla, origen, permisos, Atrás y acción final de la APP no cambian.

### Responsabilidad CRM precisada por el usuario

La plataforma LidIA con su agente gestiona Zoho y las operaciones de agenda de las conversaciones APP. Portal autentica y aporta perfil/contexto, transmite la intención y muestra resultados. La llamada directa del adaptador Portal actual queda pendiente de delegación al receptor LidIA acordado, sin cuestionario o agenda paralelos. [Reparto y desvío identificado](../integraciones/2026-10-11-contraste-portal-perfil-agenda.md).
