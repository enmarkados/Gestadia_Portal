# Revisión visual — APP sin cuenta

Fecha: 10/10/2026. **Resultado: `passed` para la documentación visual y la maqueta local corregidas.** No implica aprobación del recorrido, implementación del acceso anónimo, activación de canales ni aceptación de una versión nativa.

[Plan](docs/app/2026-10-10-plan-mapas-lidia-anonima.md) · [Mapa y decisiones](docs/app/2026-10-10-mapas-pantallas-app-anonima.md) · [Glosario](GLOSARIO.md).

## Fuente visual y comparación

- Fuente: tres capturas reales de la demo aislada de app/main `a6d6e1497e32efa3c6a45fff3d6c67017a86bc05`: Inicio, chat LidIA y Acceso. Son referencias del estilo existente; no pruebas de canales remotos.
- Implementación de revisión: veintitrés capturas de la maqueta local 5190; doce estados principales y once alternativas. Reutiliza app.css, Icon.jsx y los iconos Lucide existentes, sin proveedores/API/autenticación del producto.
- Viewport común: **390 × 844 CSS px**, capturas de 390 × 844 píxeles, sin marco/notch/barra nativa dibujados. Tablero comprobado además a 1280, 768 y 390 px.
- Se inspeccionaron los pares completos en una misma imagen, luego cabecera/compositor/dock y la secuencia resultado → datos → solicitud visitante → cuenta opcional a tamaño legible.

[Comparación completa](docs/app/prototipos/lidia-anonima/exportaciones/comparacion-referencias.jpg) · [Detalles comparados](docs/app/prototipos/lidia-anonima/exportaciones/comparacion-detalles.jpg) · [Secuencia ampliada](docs/app/prototipos/lidia-anonima/exportaciones/revision-ampliada.jpg).

## Cinco superficies revisadas

| Superficie | Comprobación y resultado |
|---|---|
| Tipografía | Marca serif y título de Inicio conservados; chat, formularios y Mensajes usan la tipografía del producto. Mensajes mantiene título sans y jerarquía compacta. Acceso/registro muestran el nuevo contexto de guardar chat, sin fingir que son copias de la portada actual. |
| Espaciado y distribución | Cabecera de conversación con Atrás, título y teléfono; compositor y dock separados del contenido. Filas compactas en Mensajes. Formularios y campos a ancho completo. Veintitrés vistas sin desbordamiento horizontal; la conversación larga desplaza su contenido y mantiene cabecera/dock. |
| Colores y tokens | Cabecera #181818, cliente LidIA #383838, acción roja del producto, superficies blancas y fondo #f7f7f7. Avisos e indicadores reutilizan clases existentes. No cambia el rojo de los mensajes del gestor en el producto. |
| Imágenes e iconos | Marca textual e iconos actuales; no fotos, capturas sintéticas de dispositivos o sustitutos del logotipo. Capturas con dimensiones reales verificadas. SVG usado sólo para el diagrama documental. |
| Texto y recorrido | Sin pregunta inicial de nombre/contacto; texto libre no se interpreta como nombre ni recibe una respuesta IA inventada. País no concede viabilidad. Contacto sólo tras resultado suficiente y voluntad; solicitud como visitante y cuenta después, opcional. Solicitud recibida no equivale a cita/conversión CRM. |

## Hallazgos e iteraciones

| Hallazgo | Severidad | Corrección verificada |
|---|---|---|
| Contacto al inicio y registro antes de la solicitud contradecían la decisión humana | Bloqueante para revisar el flujo | Mapas, propuesta, contraste y veintitrés capturas corregidos. La solicitud visitante precede al alta opcional. |
| Texto libre tratado como nombre y respuesta «Encantado» inventada | Alta | Eliminados. Enviar «¿Qué documentos necesito?» muestra exactamente ese mensaje; no inventa una respuesta del agente. |
| Un país enviaba directamente a un resultado favorable | Alta | Elegir Colombia deja la revisión abierta. Sólo un control externo de la maqueta permite ver un ejemplo de resultado completo. Ese control no aparece en las capturas de la APP. |
| Nueva conversación flotaba bajo el chat | Media | Retirada de esa zona. Se inicia desde la acción compacta de Mensajes; Atrás vuelve a Mensajes. |
| Un email persistido aparecía bajo la etiqueta Teléfono al recapturar | Alta | Canal coherente con el valor en interacción; capturas deterministas sin reutilizar datos de otro estado. El formulario capturado muestra +34 600 000 000. |
| Acceso protegido atribuía una solicitud ya recibida sin haberla realizado | Alta | Texto y retorno según origen; Servicios → Trámites protegido → acceso → dos Atrás vuelve a Servicios. |
| Etiqueta de cuenta opcional se superponía a una flecha del SVG | Media | Etiqueta desplazada fuera del conector; exportación regenerada. |
| Buscador en columna y título serif en Mensajes | Media | Buscador horizontal y título sans; comparación y captura final revisadas. |

No quedan hallazgos visuales bloqueantes para entregar esta propuesta a revisión. Las decisiones funcionales pendientes se mantienen explícitas.

## Recorridos locales comprobados

- Texto libre exacto y elección de país; no pregunta de identidad/contacto ni interpretación del texto como nombre.
- Ejemplo de resultado → voluntad de gestor → datos; teléfono O email → solicitud como visitante **antes** del registro.
- Solicitud → registro → Atrás: solicitud visible e intacta en la simulación. Privacidad → Atrás devuelve al mismo registro.
- Registro simulado → verificación simulada → vinculación simulada → chat → Mensajes. No se envía correo, crea cuenta o entrega solicitud real.
- Mensajes: búsqueda sin coincidencia y renombrado local; Nueva conversación → Atrás vuelve al listado.
- Acceso protegido con retorno al origen, sin atribuir una solicitud previa.
- Consola HTML del tablero y de la maqueta tras recarga y recorridos finales: sin errores nuevos. Compilación Vite del tablero y maqueta: exit 0.
- Inventario: 26 capturas únicas válidas (3 referencias + 23 propuestas); flujo Mermaid común en navegación, propuesta y mapas; SVG XML válido; revisión LidIA copiada idéntica, SHA256 c127dfe73602bfc51e2e33f767fb8670de5fb7f527189bd5e8c3f2e178574c04.
- Exportaciones del tablero: 12/12 y 11/11 imágenes visibles cargadas. A 390 px, una columna de 346 px y body 390; a 768 px, dos columnas de 349 px y body 768. Sin desbordamiento horizontal.

## Precisiones LidIA y nueva comprobación local

Contraste recibido en 539a6ccc2: copia en bytes con SHA256 702496881b6020c3851275d98250510ce0743d41a9a1d9901bb8cf777dc95419. La fuente e3b663b59 sigue intacta. No se acepta su revisión como aprobación humana ni activación.

- Confirmar contacto abre A9, sin ofrecer cuenta ni afirmar recepción. Comprobar estado permanece pendiente; Mensajes reabre ese mismo estado. Sólo la franja externa «Ver confirmación de ejemplo» simula el ACK hacia 07.
- A10 muestra resultado negativo sin formulario/contacto. El teléfono de cabecera permanece en ese estado; no abre un gate alternativo ni obliga a repetir preguntas. Salida voluntaria a Servicios o nueva información.
- A11 bloquea vínculo e historial sin instalación original. Se puede volver a Inicio; cuenta/contacto/enlace no sustituyen el control. La vinculación normal muestra que cuenta y origen fueron comprobados.
- Servicios → acceso protegido → login → Atrás → acceso protegido → Atrás regresa a Servicios. Entrada directa usa Inicio como reserva. El Mermaid ya representa el origen guardado; preservar toda ruta/contexto deberá probarse en producto nativo cuando se implemente.
- El visor SVG del navegador registró dos errores `animation` durante la inspección; el XML y el render completo se comprobaron. No se declara limpia la consola de ese visor. Las páginas HTML del tablero/maqueta no registraron errores nuevos tras recarga; el diálogo de ampliación abrió y cerró correctamente.
- Recapturadas las 23 vistas a 390 × 844; anchura del documento y viewport coinciden en todas. Inventario y mapas usan 12 principales y 11 alternativas.

## Límites y decisiones pendientes

La maqueta representa estados y textos de revisión. No ejecuta el cuestionario completo ni evalúa viabilidad; el resultado favorable es ilustrativo. Historial, tics, envío, correo, vínculo y recibos no constituyen evidencia de funcionamiento S2S. No se declara una aceptación completa de todas las pantallas reales de la APP por este informe.

Faltan aprobación humana, reglas/resultados completos del agente, permiso visitante y DTO/firma/transporte/ACK/reconciliación de contacto. El runner actual sólo dispone de estados parciales; human_review no abre el gate comercial. Flujos Zoho mantienen conversión y Cerrado ganado. Agenda y emuladores iOS/Android requieren cierres propios después de implementar.

La corrección del teléfono de Servicios es independiente y está documentada en la rama app/main: [pruebas del checkout en app/main](https://github.com/enmarkados/Gestadia_Portal/blob/app/main/docs/app/2026-10-10-telefono-servicios-checkout.md). Este enlace existe en app/main; no forma parte de la implementación de la propuesta anónima.
