# LIA · Especificación de diseño para réplica

Handoff del **3 de octubre de 2026**. Fuente: rama `app/release-2.0.2-seguimiento`, commit `796df0864f7c82fb81cc034dff6f6a411a310318`. Capturas: exports del 2 de octubre de 2026. Todo el material necesario para la referencia visual está dentro de este paquete.

## Orden de autoridad

1. Esta especificación y las aclaraciones vigentes de la guía de LIA.
2. Componentes y estilos actuales de `referencia-codigo/`.
3. Capturas del lote del 2 de octubre: composición, proporción, iconos y distribución.

**Corrección que debe aplicar el proyecto receptor:** el texto de LIA se representa como Markdown semántico. La captura de conversación del lote muestra el estado anterior con asteriscos visibles; no reproducir ese defecto. Las opciones actuales de respuesta aparecen bajo el último mensaje de LIA y mantienen libre el campo de escritura.

## Mapa de pantallas

Los enlaces siguientes abren las imágenes iPhone; en `capturas/android/`, `capturas/ipad/`, `capturas/tablet-7/` y `capturas/tablet-10/` están los mismos estados en otros tamaños.

| Captura | Estructura que hay que reproducir | Fuente actual |
| --- | --- | --- |
| [01 · Inicio](capturas/iphone/01-lia-inicio.jpg) | Cabecera, saludo, título, explicación, tres ejemplos; compositor, abogado y tres pestañas al pie. | `referencia-codigo/src/pages/UserHome.tsx` |
| [02 · Nueva consulta](capturas/iphone/02-nueva-consulta.jpg) | Una sola burbuja de saludo con avatar LIA; conserva compositor y pie. | `UserHome.tsx` |
| [03 · Mis consultas](capturas/iphone/03-mis-consultas.jpg) | Título, explicación, buscador interno y lista blanca con separadores, fechas y chevrons. | `UserQueries.tsx` |
| [04 · Conversación](capturas/iphone/04-conversacion-lia.jpg) | Cabecera fija, mensajes en área desplazable y compositor al pie. Aplicar formato Markdown corregido. | `UserHome.tsx` + `LiaResponseContent.tsx` |
| [05 · Utilidades](capturas/iphone/05-utilidades.jpg) | Dos tarjetas verticales con icono dorado suave, título, descripción y chevron. | `UserUtilities.tsx` |
| [06 · Contacto](capturas/iphone/06-contacto-abogado.jpg) | Hoja blanca desde abajo sobre fondo oscurecido, título, cierre, tres campos y acción. | `LawyerContactForm.tsx` + `BottomSheet.tsx` |
| [07 · Analizador](capturas/iphone/07-analizador.jpg) | Shell común con volver; tarjeta introductoria y tarjeta de formulario/documento. | `ClientContractAnalyzer.tsx` |

## Medidas reproducibles del shell

- Pantalla fija a todo el viewport, `display:flex; flex-direction:column; overflow:hidden`. Contenido central flexible con `min-height:0` y scroll vertical propio.
- Cabecera: fondo blanco, borde inferior `1px #E6EAF0`; padding superior `12px + safe-area-top`, laterales 20 px y fondo 12 px. No fijar su alto: el subtítulo puede partirse en dos líneas.
- Marca: 20 px / 24 px, peso 700; subtítulo 12 px / 15 px, margen superior 2 px. Contenedor izquierdo flexible y `min-width:0`.
- Grupo derecho: gap 3 px; nueva consulta, campana y cuenta. Controles de cabecera actuales 36 × 36 px; nueva consulta usa icono de 21 px. Usuario no muestra lupa global.
- Contenido de inicio, historial y utilidades: padding lateral 20 px y vertical 24 px; máximo 850 px, centrado.
- Compositor: wrapper centrado de máximo 850 px, laterales 16 px, padding superior 8 px e inferior 12 px; el campo tiene padding 6 px y gap 4 px.
- Textarea: padding 9 × 10 px, 16 px, inicialmente una línea; crece hasta 120 px. Micrófono y envío 40 × 40 px, icono de envío 22 px. El dorado de envío usa texto/icono marino.
- Acción de abogado: wrapper de máximo 850 px con laterales 16 px y margen inferior 12 px; botón a todo el ancho, mínimo 52 px y radio 14 px.
- Dock: borde superior 1 px, padding `8px 12px max(12px, safe-area-bottom)`; pestañas al 33,33%, iconos 22 px, gap 4 px, etiqueta 13 px/peso 700. Cada enlace añade 10 px arriba para el indicador activo 24 × 3 px.
- Desde 768 px: cabecera alineada con el contenido mediante `max(24px, (100vw - 850px)/2)`; dock centrado, gap 24 px y cada pestaña 200 px. Título de bienvenida 38 px.

## Detalles de pantalla y estados que no cubren todas las capturas

### Inicio y nueva consulta

Inicio muestra saludo personalizado, «¿En qué te puedo ayudar hoy?», explicación y los tres ejemplos visibles en 01. Los ejemplos tienen radio 14 px, borde `#D9E0EA`, padding 14 × 12 px y texto 15 px / 1,2; separación vertical 10 px. Pulsarlos rellena el borrador editable y enfoca el campo.

Nueva consulta muestra únicamente «¿En qué te puedo ayudar?» con avatar de 28 px y gap de 8 px. Abrirla no crea datos hasta enviar. No mezclar este estado con la bienvenida completa de inicio.

### Conversación y respuestas pulsables

Separación de mensajes 16 px. Avatar LIA 28 px, icono Sparkles de 15 px, borde suave y fondo blanco; margen superior 4 px. Mensaje LIA blanco con borde, texto marino; mensaje de la persona marino con texto blanco y alineado a la derecha.

Aplicar `LiaResponseContent.tsx` y `.lia-response-content` de `estilos/index.css`: párrafos con margen vertical 0,7 em, listas con sangría 1,5 em y separación 0,4 em, negrita 700. El texto persistido mantiene su valor original. Evitar imprimir `**`, guiones de lista o numeración como texto sin estructura. No interpretar HTML arbitrario.

Opciones debajo de la última respuesta: wrapper con margen superior 8 px, `flex-wrap` y gap 8 px. Cada botón usa mínimo 40 px, radio 20 px, borde `#D9E0EA`, padding 14 × 8 px y texto 15 px marino; hover de borde dorado y disabled al 50%. Permitir varias líneas. Las alternativas deben ser comprensibles y completas, conservar la entrada libre y enviar una sola vez en la misma conversación.

### Mis consultas

El buscador ocupa todo el ancho y pertenece a esta pantalla. Contenedor blanco con radio 14 px, padding 16 × 12 px, icono Search de 18 px y gap 8 px; separación inferior 20 px. Lista radio 16 px, borde `#E6EAF0`; cada fila padding 16 px, gap 12 px, título 15 px/600, preview 13 px secundario y fecha 12 px. Solo título y preview se truncan.

Estados de texto: «Cargando consultas…», error con Reintentar, «Tu primera conversación aparecerá aquí.» y «No encontramos consultas con esa búsqueda.». Mantener el mismo shell.

### Utilidades y herramientas

Tarjetas blancas con radio 16 px, borde `#E6EAF0`, padding 20 px y separación 16 px. Icono en caja 44 × 44 px, radio 12 px, fondo `#F3EAD3`, trazo de icono 23 px. Título 18 px/700, descripción 14 px / 20 px y chevron de 20 px. Toda la tarjeta es pulsable.

Analizador y calculadora reutilizan primitivas existentes: no imponer radios del chat a todos sus elementos. Se incluye código de ambas herramientas; no hay una captura nueva de la calculadora o de sus resultados en este lote.

### Contacto con abogado

Puede abrirse desde cualquiera de las tres pestañas, sin consulta previa. Campos: Nombre obligatorio, Teléfono de contacto obligatorio y «¿Qué ocurre?» opcional. Prefill desde perfil si existe. Inputs con padding 12 px y radio 12 px; separación de bloques 16 px. Textarea de cuatro líneas. El botón dice «Solicitar contacto» y durante envío «Enviando…».

Hoja inferior blanca con esquinas superiores redondeadas, overlay y cierre accesible; conservar su adaptación a safe area y desplazamiento. En éxito: icono, «Solicitud enviada», «Nos pondremos en contacto contigo en el teléfono indicado.» y «Entendido». En error conservar campos y mostrar recuperación. Ver código de BottomSheet para el comportamiento exacto de la variante actual.

### Grabación, validación y carga

Durante grabación ocultar textarea y envío para centrar el widget en todo el ancho del compositor. Cancelar restaura borrador. No añadir marco circular al micrófono o un segundo anillo al avatar de cuenta.

Mensaje inicial de menos de diez caracteres: aviso ámbar bajo el campo, icono de alerta y título «Necesito un poco más de información». Conservar el borrador. Las respuestas breves dentro de una consulta abierta siguen permitidas.

Carga de conversación: «Cargando conversación…». Envío/IA: «LIA está preparando tu respuesta…». Si el mensaje se guardó pero falta la respuesta, mostrar ese hecho y «Reintentar respuesta»; no duplicar el mensaje al recuperar. Mientras envía, bloquear doble pulsación.

El splash ocupa toda la pantalla en marino, logo DLC original blanco, loader de 48 px, separación 28 px y etiqueta 14 px. Logo `min(65vw, 280px)`. La fuente de comportamiento es StartupSplash. Mantener carga real y mínimo de cinco segundos; con movimiento reducido usar la alternativa estática. Se incluyen GIF y PNG originales, no una nueva captura del splash.

## Recursos, dependencias y límites de adaptación

Fuente `assets/fonts/Figtree.ttf` con licencia `OFL-Figtree.txt`. Iconos de la app: **lucide-react**; reutilizar Sparkles, SquarePen, MessagesSquare, BriefcaseBusiness, Mic, ArrowRight, Search, ChevronRight, FileSearch, Calculator, X y CheckCircle2 con sus tamaños, sin mezclar estilos.

Los archivos de `referencia-codigo/` conservan imports de React, router, autenticación y APIs del proyecto fuente. Se entregan como evidencia y guía de integración, no como librería compilable independiente. Implementar servicios y persistencia en el proyecto receptor, o usar fixtures sintéticas para comprobar el diseño.

No se incluye un set actualizado completo de login/alta, perfil, notificaciones, Cliente, Abogado y Administrador. El rediseño aplica a Usuario; no deducir la renovación visual de esos módulos desde las capturas del dock de Usuario.

## Comprobación de fidelidad en el proyecto receptor

1. Cargar Figtree local y comparar primero shell, tipografía, márgenes, radios y acciones con 01, 03 y 05.
2. Comparar a igual **viewport CSS y escala**; la resolución de un PNG exportado no es por sí sola un viewport CSS.
3. Comprobar alturas pequeñas y grandes, ancho móvil estrecho y breakpoint de 768 px sin scroll horizontal.
4. Probar conversación larga, Markdown, opciones multilínea, borrador, error, carga y teclado. Cabecera fija y área central desplazable.
5. Comprobar nueva consulta sin ejemplos, búsqueda vacía, contacto antes de enviar/éxito/error y grabación/cancelación.
6. Revisar safe areas, foco, etiquetas y movimiento reducido. Las capturas actuales tienen controles compactos; el objetivo táctil nuevo de 44 px no debe confundirse con una medida ya aplicada a todos.

La galería y las capturas acreditan referencia visual; no acreditan implementación funcional en el proyecto receptor.

---

## Guía de identidad y estilo vigente

Se reproduce a continuación la guía vigente del proyecto, con rutas adaptadas al ZIP. El original íntegro está en `documentacion/DESIGN-original.md`.

## Identidad y composición

Usar «LIA» y la descripción **«La IA de Defensa Legal Consumidores»**.
Dar prioridad al contenido: un título, una explicación breve y una acción
principal comprensible. Alinear el texto a la izquierda; reservar el centrado
para confirmaciones breves, estados de carga y acciones que lo necesiten.

Las superficies son blancas sobre gris muy claro. Los bordes separan contenido
sin sombras intensas; los radios suavizan los controles sin convertir todas
las acciones en círculos. El dorado señala acciones o detalles, con moderación.
No añadir degradados, efectos de cristal ni decoraciones ajenas a la referencia.

## Paleta

Los valores siguientes se encuentran en los estilos actuales o en el handoff.
Los nombres compartidos `brand-*` pertenecen a `src/index.css`; los demás
valores también aparecen como literales en los componentes nuevos.

| Color | Valor | Uso |
| --- | --- | --- |
| Azul marino | `#1C2E4A` / `brand-navy` | Texto principal, acción principal, mensaje del usuario, iconos activos. |
| Azul de hover | `#0F1B2E` | Hover del botón principal de Usuario. |
| Dorado | `#C49B36` / `brand-gold` | Botón de envío e indicador activo de navegación. |
| Dorado suave | `#F3EAD3` | Fondo del icono de herramientas. |
| Dorado de detalle | `#9A7A24` | Chevrons y anillo de foco de Usuario; no texto pequeño sobre blanco. |
| Dorado de texto | `#85600D` / `brand-gold-ink` | Texto dorado cuando sea necesario sobre blanco. |
| Fondo | `#F5F5F5` / `brand-light` | Pantalla y exterior del correo. |
| Superficie | `#FFFFFF` | Cabecera, tarjetas, burbujas LIA y navegación. |
| Texto secundario | `#5B6B82` | Explicaciones, fechas y ayudas. |
| Borde de control | `#D9E0EA` / `brand-blue-light` | Inputs, ejemplos y respuestas pulsables. |
| Separador | `#E6EAF0` | Cabecera, tarjetas y navegación. |
| Separador suave | `#EEF1F5` | Filas del historial. |

Sobre blanco: azul marino 13,64:1, texto secundario 5,43:1 y dorado de texto
5,71:1. Azul marino sobre dorado: 5,26:1. Valores comprobados con el cálculo de
contraste de la skill UI/UX. **No usar texto blanco sobre dorado ni dorado de
marca como texto pequeño sobre blanco.** Los bordes suaves son decorativos;
no sustituyen las etiquetas ni el foco visible de un control.

## Tipografía

La experiencia Usuario usa **Figtree**, alojada localmente en
`src/assets/fonts/Figtree.ttf` y declarada en `src/styles/lia-tokens.css`.
Fallback de la app: `system-ui, sans-serif`. No añadir otra familia para un
componente nuevo. Pesos habituales: 400, 500, 600 y 700.

| Elemento | Medida actual / criterio |
| --- | --- |
| Marca en cabecera | 20 px, peso 700, línea de 24 px. |
| Descripción de marca | 12 px, línea de 15 px; permitir salto de línea. |
| Título de inicio | 28 px en móvil; 38 px desde `md`; línea 1,15. |
| Título de pantalla | 26 px, peso 700. |
| Mensaje y texto principal | 15 px, línea 1,5 aproximadamente. |
| Campo de chat | 16 px; evita texto demasiado pequeño al escribir en móvil. |
| Texto de tarjeta | 14 px, línea de 20 px. |
| Fecha y texto auxiliar | 12–13 px; mantener contraste y legibilidad. |

Mantener la jerarquía mediante tamaño, peso y espacio; no depender solo del color.
No truncar instrucciones, errores ni respuestas de LIA. El historial puede
mostrar título y última línea abreviados, porque abre la conversación completa.

## Espaciado, radios y layout

Usar separaciones de 4, 8, 12, 16, 20, 24 y 28 px. La pantalla móvil usa
16–20 px de margen lateral; el contenido central de Usuario tiene un máximo
de 850 px en escritorio. Las cabeceras y los pies siguen siendo superficies
independientes del contenido desplazable.

| Elemento | Radio |
| --- | --- |
| Ejemplos, búsqueda y acción principal de Usuario | 14 px |
| Tarjetas y contenedor del historial | 16 px |
| Burbujas de conversación | 18 px |
| Respuestas pulsables actuales | 20 px |
| Compositor de chat | 26 px |

Los formularios de contacto existentes usan `rounded-xl` (12 px) y los
primitives de Cliente pueden tener radios distintos. Son variantes reales;
no unificar todos los controles sin revisar la pantalla que los usa.

## Componentes de la nueva experiencia

| Componente | Regla visual y funcional |
| --- | --- |
| Cabecera | Blanca, separador inferior, marca y descripción a la izquierda. Volver y nueva consulta pertenecen a la navegación superior. La lupa global se conserva en Cliente; Usuario mantiene búsqueda dentro de Mis consultas. |
| Cuenta y micrófono | Un solo tratamiento visual. Las iniciales no llevan un segundo marco circular; el micrófono no añade otro borde o sombra dentro del compositor. Mantener etiqueta accesible y foco. |
| Acción principal | Azul marino, texto blanco de 16 px y peso 700, radio 14 px, alto mínimo de 52 px. «Hablar con un abogado» abre la solicitud de contacto. |
| Ejemplo de consulta | Superficie blanca, borde suave, texto a la izquierda y chevron. Pulsarlo prepara el texto editable. |
| Compositor | Superficie blanca, borde suave y radio 26 px. Texto flexible, micrófono y envío sin desplazar ni comprimir el texto. Durante la grabación, el widget ocupa el ancho del compositor y queda centrado; cancelar conserva el borrador. |
| Mensaje del usuario | Marino con texto blanco, alineado a la derecha. |
| Mensaje LIA | Blanco con borde suave, avatar a la izquierda, texto marino. Ancho máximo `min(85%, 600px)`, radio 18 px y padding 12 × 14 px. Representar Markdown con negritas, párrafos y listas semánticas; las viñetas/números mantienen sangría y separación entre elementos. |
| Opciones de respuesta | Debajo de la última respuesta de LIA, blancas con borde suave y texto marino; permiten varias líneas. Solo ofrecer alternativas comprensibles y completas. Conservar respuesta escrita y el mensaje original. |
| Tarjeta de utilidad | Blanca, radio 16 px, padding 20 px, icono sobre dorado suave, título, explicación y chevron. Toda la tarjeta abre la herramienta. |
| Historial | Lista limpia: título, última línea y fecha. Separadores discretos; sin añadir estados internos de operación. |
| Navegación inferior | Tres pestañas: LIA, Mis consultas, Utilidades. Activa con rayita dorada de 24 × 3 px y texto marino; las demás usan el color secundario. |

## Estados e interacción

- **Nueva consulta:** la acción superior abre una conversación vacía con una
  única burbuja «¿En qué te puedo ayudar?». Entrar al inicio por la navegación
  conserva su bienvenida y ejemplos.
- **Validación:** un primer mensaje demasiado breve usa aviso ámbar, icono de
  advertencia y petición de más explicación. Conservar el borrador. No aplicar
  ese mínimo a respuestas breves en una conversación existente.
- **Error:** decir qué no pudo completarse y dar una acción de recuperación;
  distinguir un mensaje guardado de una respuesta de LIA que todavía falta.
- **Carga:** indicar el estado sin mover los controles. El splash usa marino,
  logo DLC y carga real; mínimo de cinco segundos. Respetar movimiento reducido.
- **Envío:** impedir doble pulsación mientras está en curso y conservar el texto
  cuando falle. Una respuesta pulsable envía una sola vez a la misma consulta.

## Mobile y accesibilidad

Mantener `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`. Al abrir el
teclado, ajustar el viewport y ocultar los elementos de pie que compiten con la
escritura; no perder el historial ni el borrador. Las conversaciones largas
deben desplazarse dentro del área de contenido, sin mover la cabecera.

Usar botones y enlaces semánticos, labels de formulario y `aria-label` en
acciones de solo icono. Foco visible con contorno y separación del control.
Los avisos necesitan texto además de color y `role="alert"`; la carga usa
`role="status"` cuando corresponde. Respetar `prefers-reduced-motion`.

Objetivo para controles nuevos: superficie táctil de al menos 44 × 44 px.
La cabecera actual tiene controles compactos de 36 px y el compositor/opciones
de 40 px: registrar esa diferencia al ampliar estas superficies, sin añadir
marcos visibles ni alterar el centrado. Esta guía no acredita que toda la app
cumpla ya ese objetivo.

## Correos transaccionales

Los correos comparten identidad con la app, con una adaptación al medio:

1. Fondo `#F5F5F5`, tarjeta blanca de máximo 560 px y radio 16 px.
2. Cabecera azul marino con el logo original de Defensa Legal Consumidores en
   blanco, la identificación de LIA y una franja dorada fina. El usuario elige
   esta variante el 2026-10-02; sustituye la primera propuesta de cabecera blanca.
3. Un título claro, explicación breve y una acción principal azul marino con
   texto blanco, ancho disponible, radio 14 px y altura de 52 px.
4. Bloque auxiliar neutro con el enlace completo como alternativa al botón.
5. Aviso de seguridad y pie «LIA · Defensa Legal Consumidores».

Usar HTML con idioma español, tablas de presentación y estilos inline. Figtree
es preferente si está disponible; **Arial, Helvetica y sans-serif** son el
fallback del correo. No depender de Google Fonts, JavaScript, Tailwind, CSS
externo ni SVG. El logo PNG se incluye en el propio mensaje mediante un adjunto
inline y una referencia `cid:`; no usar URLs de assets con hash del build.
Su copia backend en `server/assets/dlc-logo-inverted.png` conserva los bytes
del original de la app y queda incluida en la imagen Docker. Mantener el `alt`
«Defensa Legal Consumidores», la identificación textual y la versión de texto
plano para lectores que oculten imágenes. La acción no depende del logo.
Si el lector no muestra esquinas redondeadas, el correo debe seguir siendo
legible y accionable. El renderizado local no acredita compatibilidad en todos
los clientes de correo.

Conservar siempre la versión de texto plano, el enlace real generado por
autenticación y el escape de los datos dinámicos. Permitir que enlaces largos
se partan para evitar scroll horizontal. No guardar tokens reales en capturas
o ejemplos de documentación.

En el alta, usar **«Verifica tu correo»**, **«Verificar mi correo»** y explicar
que la cuenta está creada, pero que el correo debe verificarse. No prometer
conversión a Cliente, abogado asignado ni que este sea el único requisito de
acceso: la política de SMS sigue siendo independiente. No enviar un segundo
correo de bienvenida aparte del de verificación.

## Mantenimiento y revisión

Para la próxima publicación Android/iOS, actualizar también las imágenes de
las fichas de Google Play y App Store. Usar capturas nuevas o recursos que
representen fielmente la versión final; priorizar la experiencia Usuario y
mantener coherencia con Cliente. Preparación y seguimiento en
[capturas de tiendas](documentacion/DESIGN-original.md) y
[backlog maestro](documentacion/DESIGN-original.md). No confundir recursos de diseño,
exports preparados y archivos realmente subidos a cada tienda.

Al añadir un componente, reutilizar primero el shell, las clases y los
primitives existentes en su experiencia. Si aparece una variante justificada,
documentar su uso aquí y cualquier nomenclatura nueva en `GLOSARIO.md`.
Los cambios de tokens deben actualizar sus consumidores y esta guía juntos.

Para cambios de UI, comprobar web móvil y escritorio, iOS y Android por
separado, con sesión real cuando intervengan datos. Para correos, generar
ejemplos sin tokens reales, revisar móvil/escritorio, los enlaces y el texto
plano; la entrega SMTP y la visualización en un buzón son comprobaciones
distintas. Registrar los límites de la validación.
