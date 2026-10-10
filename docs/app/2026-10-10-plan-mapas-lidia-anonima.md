# Plan de revisión visual: LidIA sin cuenta

**Estado:** preparación para decisión humana. No autoriza implementación ni activación. [Glosario](../../GLOSARIO.md).

1. Mantener tres referencias actuales de app/main, capturadas sin conexiones de producción a 390 × 844.
2. Corregir el flujo: entrada sin cuenta → requisitos completos → voluntad de gestor → datos para contacto → solicitud como visitante → cuenta opcional → mismo chat.
3. Retirar captura inicial de nombre/contacto, interpretación del texto libre como nombre y barra Nueva conversación bajo el chat. Mostrar explícitamente que la maqueta no conecta con LidIA.
4. Actualizar NAVEGACION, Mermaid, SVG, tablero de imágenes y propuesta/contraste con LidIA. Copiar íntegra la nueva revisión de la fuente.
5. Recapturar veintitrés estados (doce principales y once alternativas), comprobar controles/retornos del prototipo, comparar estilos con las referencias y revisar tablero móvil/tablet.
6. Incorporar las precisiones del contraste LidIA 539a6ccc2: cuenta Y instalación original, sujeto por conversación, Atrás al origen, envío/ACK incierto y negativo separado de revisión incompleta.
7. Entregar los dos diagramas y mantener PR11 en borrador para revisión humana. Después se cerrarán los esquemas y el plan de implementación.

Dirección visual: cabecera #181818; cliente LidIA #383838; acción #c0392b; fondo #f7f7f7 y texto #2c2c2c. Estilos y componentes actuales, sin elementos nativos dibujados.

## Verificación

- [x] Tres referencias actuales aisladas.
- [x] Requisito humano incorporado a propuesta, fuente recibida y mapas.
- [x] Maqueta separada del producto: no importa API ni autenticación.
- [x] Nuevas capturas, recorridos y revisión comparada registrados en design-qa.md.
- [x] Exportaciones verificadas; revisión corregida preparada para PR11 en borrador.
- [ ] Aprobación humana del recorrido y cierre del contrato técnico.
