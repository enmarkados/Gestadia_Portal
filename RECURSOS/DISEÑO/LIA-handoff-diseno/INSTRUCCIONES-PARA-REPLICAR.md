# Instrucción para el proyecto receptor

Reproduce fielmente el rediseño de la experiencia Usuario de LIA utilizando este paquete como referencia. Lee primero design.md y consulta index.html y las capturas a resolución original. Usa Figtree local, la paleta marino/dorado y las medidas de los estilos incluidos. Conserva la distribución del shell, el compositor, el botón de abogado y las tres pestañas; no añadas estilos ajenos a la referencia.

Implementa Inicio, Nueva consulta, Mis consultas, Conversación, Utilidades, Contacto y Analizador. El código de referencia conserva componentes reales, pero requiere adaptar los imports y servicios a tu arquitectura. Puedes usar datos ficticios para validar la parte visual antes de integrar APIs.

Aplica las correcciones descritas en design.md: Markdown semántico en vez de asteriscos literales; opciones de respuesta comprensibles con escritura libre; micrófono y avatar sin doble marco; widget de grabación centrado. Si una captura anterior contradice esos ajustes, prevalecen la guía y el código actual.

Comprueba móvil y escritorio, safe areas, teclado, scroll, estados vacíos, carga y error. Compara a igual viewport CSS. Documenta las diferencias inevitables. El rediseño de Usuario no implica rediseñar automáticamente Cliente, Abogado o Administrador.
