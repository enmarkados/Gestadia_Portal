# Manual de desarrollo: flujos y pantallas de Gestadia APP

**Referencia viva del proyecto · 11/10/2026.** Petición del usuario: conservar lo trabajado en el proyecto y usarlo para guiar el desarrollo. [README del repositorio](../../README.md) · [README APP](../../README-APP.md) · [Glosario](../../GLOSARIO.md).

## Cómo empezar

1. Lee [NAVEGACION.md](NAVEGACION.md): rutas implementadas, orígenes, Atrás, menú inferior, permisos, hojas y retornos externos. Su sección «LidIA sin cuenta» está marcada como propuesta.
2. Abre los [mapas con capturas](2026-10-10-mapas-pantallas-app-anonima.md) y el tablero siguiendo los comandos de abajo. Compara lo que ve el usuario con el flujo, no sólo el nombre de una ruta.
3. Consulta la [propuesta técnica](../integraciones/2026-10-10-propuesta-app-anonima-lidia.md), el [contraste Portal](../integraciones/2026-10-10-contraste-portal-app-anonima.md) y el [cierre documental LidIA](../integraciones/2026-10-10-cierre-lidia-mapas-portal.md) antes de tocar identidad, contacto o continuidad.
4. Identifica el estado que cambia y sigue el procedimiento de mantenimiento. No implementar una decisión pendiente como si ya estuviera aprobada.

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
| APP en `frontend/app/`, API conversacional y navegación actual | Código existente; el modo efectivo depende de la configuración. [Integración Git](2026-10-08-integracion-app-main.md) y [README APP](../../README-APP.md). Un build no acredita conexión o despliegue. |
| Movimiento de la APP | [Reglas, implementación y comprobación](ANIMACIONES.md): 280 ms, desplazamientos cortos, cabecera estable y movimiento reducido. |
| Diseño común y recorridos actuales | [Plan de diseño y cobertura](PLAN-DISENO-APP.md), [Mensajes](MENSAJES-DISENO.md), [Perfil](PERFIL-LIA.md), [antecedente de nueva conversación](2026-10-08-nueva-conversacion-lidia.md) y [corrección de accesos LidIA del 11/10](2026-10-11-lidia-accesos.md). Cada evidencia mantiene fecha/entorno. |
| LidIA anónima APP | Mapas con conformidad documental; nuevas pantallas son maquetas sin API. Desarrollo técnico autorizado el 10/10; transporte Portal preparado en rama aislada, respuestas/API/autoridad durables y aceptación visual/nativa pendientes. Contacto reservado por wire r3; sus pantallas se conservan como propuesta futura. |
| Tres imágenes «Actual» del tablero | Referencias de la demo aislada de app/main a6d6e14. No acreditan una conversación remota ni la versión desplegada. |
| Veintitrés vistas «Propuesta» | Doce estados principales y once alternativas, capturados a 390 × 844. No son rutas ni permisos nuevos del producto. |
| Handoff y actas anteriores | Antecedentes con fecha. Las decisiones vigentes posteriores prevalecen; no aplicar las burbujas rojas antiguas a LidIA ni interpretar el cuestionario demo como evaluación real. |

La documentación y los prototipos se incorporan a `app/main` como referencia de desarrollo por esta petición. Eso no aprueba ni activa el flujo anónimo. Las menciones de rama/PR en documentos fechados describen su entrega histórica; para el estado vigente, consulta este manual, el código y la configuración efectiva.

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
6. Consultar la coordinación LidIA para versión desplegada y configuración verificadas. La configuración pública versionada vuelve a servir la demo; las conexiones requieren su configuración privada y su comprobación separada.

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
- Nueva conversación con LidIA se ofrece en Inicio y Mensajes; no dentro del chat, ni sobre su compositor. Atrás conserva el origen para volver a esos accesos. [Decisión y comprobación vigente](2026-10-11-lidia-accesos.md).
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

**El recorrido anónimo aún no está implementado.** Ambos equipos aceptan documentalmente los mapas sobre eb1ce3c5; la conformidad LidIA está copiada desde 0243b2379, con su procedencia en el contraste Portal.

El desarrollo del contrato técnico está autorizado en el chat LidIA, según la [coordinación posterior](../integraciones/2026-10-10-coordinacion-portal-contrato-v2.md). Ya existe el [plan Portal por bloques](../superpowers/plans/2026-10-10-app-v2-portal.md); no se confunde con una API integrada. Requests, firma, query y matriz S2S ya se contrastaron en la preparación aislada, con [evidencia del wire r3](../integraciones/2026-10-10-contraste-portal-wire-v2-r3.md). Falta aceptar las respuestas, implementar autoridad/instalación y vínculo durables y montar su API. Contacto/ACK está reservado y aplazado; no aparece en la allowlist ni en las capacidades de configuración. La ejecución real del agente 119 debe comprobarse; su evaluación no se reemplaza por reglas nuevas en Portal ni queda condicionada a elaborar un catálogo paralelo. Las operaciones de contacto usarán resultados/acciones emitidos por el agente, sin inferir un favorable de país o `human_review`. Agenda conserva contrato propio. La aceptación de las pantallas implementadas y las pruebas conectadas/nativas se registrarán aparte.

La publicación, despliegue y activación mantienen su alcance y autorización propios. [Despliegue APP](DOCKER-PLESK.md) · [Tiendas](MARKETPLACES.md). Esta guía guarda la referencia de desarrollo; no da por realizados esos trabajos.

Comprobación documental del 10/10/2026: 212 enlaces locales válidos entre las entradas, mapas, plan y coordinación revisados; inventario de 12 estados principales, 11 alternativas y 3 referencias, con sus 26 capturas JPEG a 390 × 844; Mermaid idéntico en navegación, mapas y propuesta técnica. El tablero arrancó desde este checkout en 5190 y su compilación aislada terminó correctamente. Esta comprobación acredita que la referencia se puede consultar; no valida el flujo anónimo conectado ni la APP nativa.
