# Plan de diseño y comprobación de Gestadia APP

07/10/2026. Trabajo en `codex/app-conversaciones-backend`, PR #9. [Glosario](../../GLOSARIO.md) · [Mapa Mermaid y retornos](NAVEGACION.md).

## Objetivo y criterio

Extender a toda la APP el diseño compacto aprobado en Mensajes. Las decisiones del usuario y las capturas del handoff son la referencia; frontend-design, Product Design y ui-ux-engineering aportan jerarquía, accesibilidad y comprobación. Se trabaja sobre React/Capacitor existente.

Paleta: marca `#181818`, texto `#2c2c2c`, rojo `#c0392b`, fondo `#f7f7f7`, superficie `#ffffff`, secundario `#636b78`. Los estados conservan colores semánticos con contraste comprobado. Georgia se reserva para logo y bienvenida/LidIA; pantallas operativas usan tipografía del sistema. Títulos operativos 25 px, secciones 17–19 px, cuerpo 14–16 px, campos 16 px. Espacio base 8 px, márgenes móviles 16 px, superficies 14 px de radio, controles de al menos 44 px.

Diseño de pantalla: cabecera segura → título y una explicación útil → contenido alineado a la izquierda → acción correspondiente → cuatro pestañas en destinos principales. Chats conservan cabecera propia y compositor. Perfil muestra identidad compacta antes de los datos. Hojas usan un cierre superior y devuelven el foco. No se añaden tarjetas decorativas, estadísticas ni acciones duplicadas.

Revisión contra el encargo: se mantiene negro/rojo Gestadia, las tarjetas de selección de Servicios y sus campos/precios actuales; cliente LidIA negro suave y cliente gestor rojo; subida negra y Validar y Enviar rojo. El listado compacto sirve de referencia de densidad, sin imponer el mismo formato a un formulario, un texto legal o una conversación.

## Trabajo

1. **Hecho.** Inventariar y capturar estado inicial; contrastar rutas y estados con NAVEGACION.md.
2. **Hecho.** Unificar tokens, tipografía, formularios, estados, iconos y objetivos táctiles en la hoja existente.
3. **Hecho.** Revisar LidIA, Mensajes demo/conectado, ambos chats, Trámites y validación.
4. **Hecho.** Revisar Servicios/selección/autoscroll/formulario/checkout; Perfil/acceso/registro/legales; Cuenta, Contacto, Notificaciones y borrado.
5. **Hecho en web e iOS; Android UI pendiente.** Ejecutar regresiones APP y build; recorrer navegador a 320/390/768/1280 px y zonas seguras/teclado en iOS. Compilar/sincronizar Android y comprobar interfaz si el control disponible permite hacerlo.
6. **Hecho.** Guardar capturas y matriz de cobertura, publicar sólo la rama/PR de desarrollo y dejar preview local.

## Inventario de cobertura

| Grupo | Pantallas y estados que deben revisarse |
|---|---|
| Marco | Splash, cabecera normal/secundaria/chat/validación/legal, dock, teclado, foco, movimiento reducido |
| LidIA | Inicio visitante/conectado/demo, conversación, opciones/texto de respuesta, envío/pendiente/error/cerrada |
| Mensajes | Lista demo/conectada, vacía/cargando/error, búsqueda/sin resultado, renombrar/guardar/cancelar |
| Gestor | Selección, conversación abierta/cerrada, historial, compositor, atención sin expediente |
| Trámites | Visitante, vacío, listado, detalle válido/inexistente/carga/error, subida y validación demo |
| Servicios | Tres servicios, selección y foco/autoscroll, formulario móvil/escritorio, error externo, checkout demo/retorno |
| Cuenta | Hoja visitante/demo/real, identidad, campos, guardado/error, seguridad demo/real, preferencias disponibles/deshabilitadas, motivo de borrado y confirmación/cancelación |
| Acceso | Login/registro demo y conectado, contraseña visible/oculta, validación/error, recuperación, cancelación/continuación |
| Legales | Privacidad, términos, soporte, eliminar cuenta, navegación contextual, texto largo |
| Hojas | Notificaciones pendientes/vacías, Contacto demo/conectado, llamada de ejemplo, Escape/cierre/foco |
| Secundarias | Información demo, checkout demo y ruta inexistente |

La revisión visual no equivale a activar push, borrado real, cambio de contraseña, llamada ni contratación. Se conservan las restricciones actuales y se muestran antes de pedir datos. Las pruebas remotas de conversaciones ya realizadas se enlazan en la entrega; para este bloque visual no se envían mensajes adicionales salvo que una comprobación funcional concreta los requiera.

## Evidencia final

La implementación visual está terminada en todas las familias del inventario. Se aplican tokens comunes, títulos operativos, superficies compactas, iconos oficiales Lucide, entradas de 16 px con peso normal y controles táctiles de al menos 44 px. Verificación conserva etiquetas visibles. Mi Perfil utiliza identidad compacta; la cuenta conectada explica las funciones todavía no disponibles antes de pedir datos. El acceso conectado no ofrece explorar demo cuando su configuración la deshabilita. Información y checkout demo evitan el CTA de contacto duplicado.

### Resultados

- **88 pruebas APP aprobadas en 11 archivos**, incluido el perfil conectado sin solicitud de contraseñas para operaciones pendientes y el acceso sin demo deshabilitada. [Log](evidencias/2026-10-07-diseno/vitest-app.log).
- **64 inspecciones DOM: 16 rutas × 320, 390, 768 y 1280 px**, sin desbordamiento detectado ni controles visibles inspeccionados inferiores a 44 px. [Matriz JSON](evidencias/2026-10-07-diseno/geometria-64-inspecciones.json). Este barrido mide cabecera, cuerpo, dock y controles visibles; no es una certificación exhaustiva WCAG ni cubre todos los estados remotos.
- Contraste sobre blanco: texto secundario **5,38:1**, rojo **5,44:1**, verde semántico **7,30:1**.
- Build APP y sincronización Capacitor correctos. Assets nativos `index-B76JrCzA.js` y `index-BBAuBe3R.css`; hashes y resultados en [resultados.json](evidencias/2026-10-07-diseno/resultados.json).
- **iOS compilado, instalado y arrancado en iPhone 17 / iOS 26.5 Simulator**. En esta revisión se recorren acceso/cancelación/continuación desde Trámites, Servicios y selección/autoscroll, escritura con teclado, hoja Cuenta y Mi Perfil. Los controles respetan la barra de estado y el dock; la captura de teclado del Device Hub está activada y la escritura aparece en el campo.
- **Android assembleDebug aprobado e instalación actualizada con datos conservados** en `LIA_Codex_Pixel_8_API_36`. [Log](evidencias/2026-10-07-diseno/android-assembleDebug.log). El control disponible no reconoce su ventana; el recorrido visual de este APK sigue pendiente de la autorización específica para interacción ADB. Compilar e instalar no cierra la aceptación Android.

### Recorridos y límites

| Familia | Comprobación de este bloque | Evidencia |
|---|---|---|
| LidIA | Inicio, opciones, texto visible «Colombia», cliente negro suave, cabecera propia, vuelta, aviso amarillo que se oculta | [Inicio](evidencias/2026-10-07-diseno/web-demo-inicio.jpg), [aviso y conversación](evidencias/2026-10-07-diseno/web-lidia-aviso.jpg) |
| Mensajes / gestor | Tres filas conectadas, búsqueda sin coincidencias y restauración, renombrar/cancelar y devolución del foco, apertura del historial humano cerrado sin compositor | [Lista conectada](evidencias/2026-10-07-diseno/web-mensajes-conectado.jpg), [escritorio](evidencias/2026-10-07-diseno/web-escritorio.jpg), [chat demo](evidencias/2026-10-07-diseno/web-demo-mensajes-gestor.jpg) |
| Trámites / documentos | Lista demo, visitante y vacío conectado; validación con etiquetas, subida negra, foco rojo discontinuo y envío rojo | [Validación](evidencias/2026-10-07-diseno/web-demo-tramites-demo-canje.jpg), [visitante iOS tras cancelar acceso](evidencias/2026-10-07-diseno/ios-tramites-visitante.jpg), [continuación iOS tras login](evidencias/2026-10-07-diseno/ios-tramites-conectado.jpg) |
| Servicios / checkout | Seleccionar Transferencia desplaza al título/formulario; checkout demo y vuelta conservan selección; campos y precios actuales permanecen | [Catálogo iOS](evidencias/2026-10-07-diseno/ios-servicios.jpg), [selección iOS](evidencias/2026-10-07-diseno/ios-servicio-seleccionado.jpg), [checkout demo](evidencias/2026-10-07-diseno/web-demo-checkout-demo.jpg) |
| Cuenta / perfil | Hoja y Mi Perfil real/demo, identidad compacta, campos, motivo de borrado de 128 px y cancelación conservando perfil | [Cuenta iOS](evidencias/2026-10-07-diseno/ios-cuenta.jpg), [Perfil iOS](evidencias/2026-10-07-diseno/ios-perfil.jpg), [motivo](evidencias/2026-10-07-diseno/web-borrado-textarea.jpg) |
| Acceso / registro | Formatos y campos con ojo, recuperación centrada; en iOS cancelar devuelve menú y login retoma Trámites | [Acceso](evidencias/2026-10-07-diseno/web-demo-acceso.jpg), [registro](evidencias/2026-10-07-diseno/web-demo-registro.jpg) |
| Legales | Privacidad, términos, soporte y borrado con cabecera contextual y texto legible | [Privacidad](evidencias/2026-10-07-diseno/web-demo-legal-privacy.jpg), [términos](evidencias/2026-10-07-diseno/web-demo-legal-terms.jpg), [soporte](evidencias/2026-10-07-diseno/web-demo-legal-support.jpg), [borrado](evidencias/2026-10-07-diseno/web-demo-legal-delete-account.jpg) |
| Hojas / secundarias | Contacto de ejemplo y confirmación local; Notificaciones con Escape y retorno de foco, X sin borde; información y ruta inexistente | [Información](evidencias/2026-10-07-diseno/web-demo-informacion.jpg), [ruta inexistente](evidencias/2026-10-07-diseno/web-demo-pantalla-inexistente.jpg) |

Los estados de carga, error, permisos, caducidad y metadatos no disponibles están cubiertos por pruebas controladas. No se afirma ejecución manual remota de cada estado. El envío y cierre humano reales y los nombres/fechas se acreditan en el [ciclo de gestor](../integraciones/2026-10-07-mensajes-y-ciclo-gestor.md) y la [validación nativa de conversaciones](../integraciones/2026-10-07-validacion-nativa-mensajes.md), anteriores a este bloque visual. Las capturas demo no acreditan resultados remotos; la lista y perfil conectados proceden del entorno local autorizado con cuenta ficticia.

Los campos nativos editados para la comprobación de teclado no se enviaron ni guardaron en el perfil. No se realizó un borrado irreversible, pago, solicitud telefónica real ni nuevo mensaje remoto por esta revisión. Push, preferencias conectadas, cambio de contraseña y borrado real continúan pendientes de backend. El splash conserva negro Gestadia y logo sin subtítulo, sin cambios en sus recursos nativos. No se actualizó el iPhone físico ni se publicó en tiendas.

### Reproducción

Desde `frontend`: `NODE_OPTIONS=--no-experimental-webstorage npx vitest run app/src --reporter=dot`. Build local: `VITE_GESTADIA_SERVER_URL=http://localhost:5176 npm run build:app -- --mode native-local`, configuración pública local ya aprobada y `npx cap sync`. iOS usa el proyecto `ios/App/App.xcodeproj`, esquema App, Debug y el simulador indicado; Android usa `./gradlew assembleDebug` con JDK 21. La configuración versionada por defecto permanece en demo.

Preview conectado: `http://127.0.0.1:5176/#/mensajes`. Requiere que permanezcan levantados los servicios efímeros locales y que su autorización siga vigente. La rama publicada es `codex/app-conversaciones-backend`, [PR #9 en borrador](https://github.com/enmarkados/Gestadia_Portal/pull/9); no se modifica app/main ni se despliega en producción.

## Corrección funcional del 08/10/2026

Detectado por el usuario el acceso ausente a otro chat de LidIA. [Plan, conformidad del equipo LidIA, regresiones y evidencia web/iOS](2026-10-08-nueva-conversacion-lidia.md). Inicio distingue Nueva/Continuar, Mensajes ofrece Nueva y el chat mantiene una acción compacta sobre el compositor. Backend crea sólo con intención explícita y conserva historial/idempotencia. La carga no ofrece abrir otra sesión mientras recupera la seleccionada. Verificación actual: 135 frontend (95 APP), 132 backend, build y sync, creación y respuesta reales en web e iOS. Android compila; su recorrido de interfaz sigue pendiente.
