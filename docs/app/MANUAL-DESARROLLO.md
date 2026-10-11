# Manual de desarrollo: flujos y pantallas de Gestadia APP

**Referencia viva del proyecto · 10/10/2026.** Petición del usuario: conservar lo trabajado en el proyecto y usarlo para guiar el desarrollo. [README del repositorio](../../README.md) · [README APP](../../README-APP.md) · [Glosario](../../GLOSARIO.md).

## Cómo empezar

1. Lee [NAVEGACION.md](NAVEGACION.md): rutas implementadas, orígenes, Atrás, menú inferior, permisos, hojas y retornos externos. Su sección «LidIA sin cuenta» está marcada como propuesta.
2. Abre los [mapas con capturas](2026-10-10-mapas-pantallas-app-anonima.md) y el tablero siguiendo los comandos de abajo. Compara lo que ve el usuario con el flujo, no sólo el nombre de una ruta.
3. Consulta la [propuesta técnica](../integraciones/2026-10-10-propuesta-app-anonima-lidia.md), el [contraste Portal](../integraciones/2026-10-10-contraste-portal-app-anonima.md) y el [cierre documental LidIA](../integraciones/2026-10-10-cierre-lidia-mapas-portal.md) antes de tocar identidad, contacto o continuidad.
4. Identifica el estado que cambia y sigue el procedimiento de mantenimiento. No implementar una decisión pendiente como si ya estuviera aprobada.

## Qué está implementado y qué está en revisión

| Material | Estado y uso |
|---|---|
| APP en `frontend/app/`, API conversacional y navegación actual | Código existente sin demostración desde `be6806d`; visitante o sesión real. El chat requiere habilitación y aceptación remota. [Integración Git](2026-10-08-integracion-app-main.md) y [README APP](../../README-APP.md). Un build no acredita conexión o despliegue. |
| Movimiento de la APP | [Reglas, implementación y comprobación](ANIMACIONES.md): 280 ms, desplazamientos cortos, cabecera estable y movimiento reducido. |
| Diseño común y recorridos actuales | [Plan de diseño y cobertura](PLAN-DISENO-APP.md), [Mensajes](MENSAJES-DISENO.md), [Perfil](PERFIL-LIA.md) y [nueva conversación](2026-10-08-nueva-conversacion-lidia.md). Cada evidencia mantiene fecha/entorno. |
| LidIA anónima APP | Propuesta con conformidad documental de ambos equipos; aprobación humana, contratos e implementación pendientes. Las pantallas nuevas son maquetas sin API. |
| Tres imágenes «Actual» del tablero | Referencias de la demo aislada de app/main a6d6e14. No acreditan una conversación remota ni la versión desplegada. |
| Veintitrés vistas «Propuesta» | Doce estados principales y once alternativas, capturados a 390 × 844. No son rutas ni permisos nuevos del producto. |
| Handoff y actas anteriores | Antecedentes con fecha. Las decisiones vigentes posteriores prevalecen; no aplicar las burbujas rojas antiguas a LidIA ni interpretar el cuestionario demo como evaluación real. |

La evidencia de retirada de demostración se conserva en [NAVEGACION.md](NAVEGACION.md) y [estado Docker](ESTADO-APP-PORTAL-DOCKER.md). Las referencias «Actual» del tablero mantienen sus bytes y la procedencia antigua.

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

## Cómo recorrer la propuesta anónima

| Tramo | Pantallas | Qué revisar |
|---|---|---|
| Entrada y requisitos | 01 → 02 → 03; deeplink entra en 02 | Consulta sin cuenta, nombre, teléfono o email al inicio. Texto libre como mensaje literal, sin saludo que lo interprete como nombre. |
| Resultado | 04, A4 o A10 | Favorable completo, incompleto/revisión humana y negativo son estados diferentes. Elegir país no cualifica; negativo no obliga a repetir ni abre contacto comercial. |
| Contacto visitante | 05 → 06 → A9 → 07 | Sólo tras resultado suficiente y voluntad expresa: explicar propósito, nombre y teléfono O email. Sin ACK durable, comprobar la misma solicitud sin afirmar recepción ni reenviar. |
| Cuenta opcional | 07 → 08/A1 → 09 → 10 → 11 | Cuenta verificada Y control de instalación original. Mismo historial, actor original y solicitud. Cancelar alta no cancela ni reenvía lo recibido. |
| Continuidad | A8 / 12 | Mensajes recupera el estado del chat, ofrece Nueva conversación, búsqueda, renombrado, fechas y estado. Visitante ve sólo lo propio de esa instalación. |
| Excepciones | A2, A3, A5, A6, A7, A11 | Cancelación, caducidad, instalación, acceso protegido, recuperación y vínculo bloqueado. Atrás conserva el origen completo; Inicio sólo de reserva. |

El cuestionario es ilustrativo. Para saltar a un resultado usa **«Ver ejemplo de resultado»** o **«Ver ejemplo negativo»** en la franja externa; no es una evaluación del agente. Confirmar contacto llega a A9; **«Ver confirmación de ejemplo»**, fuera de la APP, simula el ACK. **«Ver pérdida de instalación»** muestra A11. Correo, vínculo y tics de otros estados son ejemplos de diseño, no efectos reales.

Si se pierde la instalación original, el vínculo queda bloqueado aunque la cuenta esté verificada. Enlazar el chat A no revoca B: sujeto inmutable por conversación, actor y propietario separados. No recuperar historiales por coincidencia de contacto o por poseer un enlace.

## Criterios que debe conservar el desarrollo

- Cabecera de chat con Atrás al origen; principales con cuatro pestañas. Las hojas cierran sobre quien las abrió; acceso y legales permiten volver aunque oculten el menú.
- Cliente con LidIA: negro suave. Cliente con gestor: rojo. Cabecera negra Gestadia; listado de Mensajes compacto; etiquetas, campos completos y objetivos táctiles adecuados. [Criterios y evidencia](PLAN-DISENO-APP.md).
- Movimiento: avance/regreso de contenido en 280 ms, Cuenta junto a su origen, paneles inferiores, pulsación de 120 ms y mensajes nuevos suaves. Cabecera/dock permanecen estables; el historial recuperado no se anima. Respetar y reaccionar a `prefers-reduced-motion`. [Guía y evidencia](ANIMACIONES.md).
- Las respuestas elegidas muestran su texto legible, no el id del botón. Al recuperar un chat no crear otro, perder su contexto ni ofrecer un inicio durante carga incierta.
- Servicios conserva selección/borrador al volver y precarga los datos del checkout, incluido teléfono. [Corrección comprobada](2026-10-10-telefono-servicios-checkout.md).
- APP no selecciona agente, proyecto, entorno, operador ni CRM. El backend resuelve identidad, pertenencia y permisos. [Responsabilidades](RESPONSABILIDADES-INTEGRACION.md).
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

Antes de implementarlo: decisión humana del recorrido; reglas/catálogo versionados y evidencia de cualificación completa; capacidad/señal visitante y DTO/firma/transporte/ACK/reconciliación; cierre del protocolo v2 de vínculo/revocación; responsabilidad y contrato de agenda. Después se preparará el plan de ejecución por bloques y sus pruebas conectadas/nativas. `human_review` no demuestra «cumple».

La publicación, despliegue y activación mantienen su alcance y autorización propios. [Despliegue APP](DOCKER-PLESK.md) · [Tiendas](MARKETPLACES.md). Esta guía guarda la referencia de desarrollo; no da por realizados esos trabajos.


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
