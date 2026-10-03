# Glosario del handoff LIA

Los nombres de componentes y colores se conservan del proyecto fuente. Este archivo define el alcance de la referencia entregada.

| Término | Tipo | Definición | Alcance | Notas |
| --- | --- | --- | --- | --- |
| Usuario | Concepto de producto | Experiencia previa a la conversión y asignación de abogado. Es el ámbito del rediseño incluido. | design.md; UserHome, UserQueries, UserUtilities. | Se conserva el nombre de LIA; no se equipara a Cliente. |
| Cliente | Concepto de producto | Experiencia posterior a la conversión, con su organización existente de asuntos. | design.md; ClientContractAnalyzer y ClientCompensationCalculator. | No se extiende automáticamente el rediseño de Usuario. |
| Consulta / Asunto | Concepto de producto | Consulta jurídica con conversación y seguimiento, objeto central de LIA. | UserHome.tsx; UserQueries.tsx. | Denominación existente; evitar centrar navegación en roles. |
| UserAppShell | Componente runtime | Estructura común de cabecera, contenido desplazable, acción de abogado y navegación de Usuario. | referencia-codigo/src/components/user/UserAppShell.tsx. | Reutilizado; no se propone otro nombre. |
| Compositor | Concepto de interfaz | Campo de escritura y controles de grabación y envío del chat. | UserHome.tsx; estilos/lia-tokens.css. | Denominación descriptiva existente, sin nuevo componente impuesto. |
| LiaResponseContent | Componente runtime | Presentación semántica del Markdown de una respuesta LIA. | referencia-codigo/src/components/lia/LiaResponseContent.tsx. | Sustituye la presentación literal del Markdown. |
| LawyerContactForm | Componente runtime | Solicitud de contacto de abogado desde la experiencia Usuario. | referencia-codigo/src/components/user/LawyerContactForm.tsx. | Se conserva el nombre de código. |
| BottomSheet | Componente runtime | Panel modal presentado desde el borde inferior. | referencia-codigo/src/components/ui/BottomSheet.tsx. | Variante existente; no implica que el contacto permita arrastrar. |
| brand-navy / brand-gold | Propiedades de estilo | Colores compartidos de marca, marino y dorado. | estilos/index.css; tokens.json. | Mantener valores y nombres existentes. |
| Export de captura | Concepto de documentación | Imagen del lote preparada a una resolución de entrega. | capturas/; manifest.json. | Resolución exportada no demuestra viewport CSS o ejecución nativa. |
