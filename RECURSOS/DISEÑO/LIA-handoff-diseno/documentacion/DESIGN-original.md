# Guía de diseño de LIA

Referencia viva de la estética incorporada en octubre de 2026. Aplicar esta
guía al crear o ajustar componentes, pantallas y correos de LIA. Su propósito
es mantener una identidad reconocible y una interfaz clara, cercana y sobria.

## Fuentes y alcance

- [Handoff original y sus capturas](docs/marketing/variaciones-diseno/app-usuario/2026-10-01-handoff/README.md).
- [Estilos actuales de Usuario](src/styles/lia-tokens.css) y
  [colores compartidos](src/index.css).
- [Cabecera y navegación](src/components/user/UserAppShell.tsx),
  [chat](src/pages/UserHome.tsx), [historial](src/pages/UserQueries.tsx),
  [utilidades](src/pages/UserUtilities.tsx) y
  [formulario de contacto](src/components/user/LawyerContactForm.tsx).
- [Plantilla de correo](server/emailConfigService.ts):
  `buildLiaTransactionalEmail` y `sendEmailVerificationEmail`.
- [Glosario](GLOSARIO.md) para nombres y conceptos del proyecto.

La nueva estética corresponde a **Usuario**, antes de convertirse en cliente.
La experiencia **Cliente** conserva su organización y componentes actuales.
Compartir marca y colores no implica sustituir la interfaz de Cliente ni
aplicar nuevos radios globalmente a `AppButton`, `AppCard` o el shell anterior.
Las aclaraciones posteriores del usuario prevalecen sobre el handoff.

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
[capturas de tiendas](docs/release/screenshots/README.md) y
[backlog maestro](docs/TODO_LIA_APP.md). No confundir recursos de diseño,
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
