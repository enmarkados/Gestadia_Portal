# LIA · Handoff del rediseño actual

Paquete preparado el **3 de octubre de 2026** para reproducir el diseño en otro proyecto.

1. Lee [design.md](design.md): es la especificación principal y explica la precedencia de los ajustes recientes.
2. Abre [index.html](index.html) en un navegador: galería sin instalación ni conexión.
3. Consulta `capturas/`: siete pantallas por tamaño, 35 JPEG originales del lote del **2 de octubre de 2026**.
4. Usa `assets/` para la fuente Figtree, su licencia, logos y animación de arranque.
5. Usa `estilos/` y `tokens.json` para las medidas y colores; `referencia-codigo/` conserva componentes reales.
6. Entrega también [INSTRUCCIONES-PARA-REPLICAR.md](INSTRUCCIONES-PARA-REPLICAR.md) al otro proyecto.

## Contenido y alcance

- Experiencia **Usuario**: inicio, nueva consulta, conversación, Mis consultas, Utilidades, solicitud de abogado y analizador.
- Adaptaciones de tamaños: iPhone, Android teléfono, iPad y tablets de 7 y 10 pulgadas.
- Correo de verificación con cabecera azul y logo DLC: HTML, texto plano y dos capturas.
- Referencias de implementación: shell, chat, Markdown, grabador, formulario y herramientas.
- [GLOSARIO.md](GLOSARIO.md), [manifest.json](manifest.json) y [SHA256SUMS.txt](SHA256SUMS.txt).

## Cómo leer las capturas

Son exports reutilizados del repositorio, revisados al preparar este paquete; **no son nuevas capturas de producción ni pruebas de los binarios de tienda**. Se han comprobado las dimensiones reales de cada archivo. Los originales llevaban extensión .png pero contienen JPEG; aquí se renombran a .jpg sin recomprimirlos. Las medidas de index.html y manifest.json son las reales. No debe inferirse el viewport CSS o un dispositivo físico únicamente de su resolución.

La captura `04-conversacion-lia.jpg` precede la corrección de Markdown y muestra asteriscos literales. Conserva el aspecto de la conversación, pero para el formato del texto prevalecen `design.md` y `LiaResponseContent.tsx`: negritas, párrafos y listas semánticas. Tampoco hay opciones de respuesta en esa conversación concreta; su aspecto se especifica en la guía y en `UserHome.tsx`.

El paquete no incluye credenciales, sesiones, datos de cuentas reales ni código de backend. El código de referencia es una selección de la app, **no un proyecto autónomo listo para ejecutar**: el proyecto receptor debe adaptar sus imports, datos y acciones.

Las pantallas internas de Cliente, Abogado y Administrador, login, perfil, notificaciones y resultados de herramientas no tienen un lote completo actualizado en este paquete. Se entregan la nueva experiencia Usuario y sus referencias compartidas; no se atribuye el nuevo diseño a todas las áreas de LIA.
