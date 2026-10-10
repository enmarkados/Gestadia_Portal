# Correos transaccionales de Gestadia

Diseño solicitado y aprobado por el usuario el 11/10/2026. [Glosario](../../GLOSARIO.md) · [Plan Docker y tiendas](../app/00-MAESTRO-APP-PORTAL-DOCKER.md).

Recuperación, bienvenida tras contratación y avisos de expediente utilizan la misma plantilla: logo oficial blanco con punto rojo incrustado mediante CID; cabecera grafito, botón rojo, cuerpo adaptable con estilos inline y tablas de presentación; enlace alternativo visible y versión de texto completo. No depende de recursos externos para mostrar el logo. Contacto y Reply-To: info@gestadia.com. El remitente SMTP vigente se conserva para respetar su autenticación.

Los datos dinámicos se escapan antes de entrar en HTML; los tokens sólo aparecen en el enlace operativo del destinatario y no se registran en consola. Recuperación mantiene la caducidad de dos horas e instrucciones si no se solicitó. Bienvenida conserva importe/pedido y enlace de invitación. Avisos conservan el destino del área de cliente y el comportamiento de bandeja/push. Un fallo SMTP continúa siendo visible al llamante; no simula envío correcto si falta SMTP.

Pie: responsable Defensa Legal Consumidores, S.L., CIF B01813336, finalidad de cuenta y servicios, RGPD/LOPDGDD, derechos, contacto, política de privacidad y aviso legal. Texto coherente con [política vigente](https://gestadia.com/privacidad), shared/legal-content.js y [AEPD: derecho de información](https://www.aepd.es/derechos-y-deberes/conoce-tus-derechos/derecho-de-informacion). Información resumida con enlace a la política completa; sin inventar plazos de conservación ni garantías legales.

Antes de modificar se guardó copia privada de notify.js, auth.js, checkout.js y Dockerfile.backend. Pruebas específicas 7/7: enlace exacto, logo real, versión texto, responsable/derechos, escape de datos, rechazo de origen inseguro, remitente/Reply-To y propagación de error SMTP. Suite backend real con MySQL efímero: 215/215. La ejecución inicial de frontend en paralelo agotó tiempos por carga; repetición con un worker y margen de 15 s: 160/160 en 40 archivos, sin cambiar aserciones.

Artefactos locales en artifacts/emails-20261011: recuperacion/bienvenida/expediente en HTML y EML (MIME real con imagen incrustada), datos de vista previa sin validez. Se generaron con transporte de memoria, sin conexión SMTP ni correo a clientes. Revisión visual real de recuperación en navegador: logo, acción, enlaces y pie completos comprobados; captura gestadia-email-recuperacion-20261011.png. Pendientes: imagen Docker, despliegue y comprobación de recepción autorizada. No se acredita producción por una vista previa local.


### Recepción y ajuste de visualización — 11/10/2026

El usuario confirma la recepción del único correo de prueba en Thunderbird. El botón era visible en claro y desaparecía en oscuro; el logo tenía margen interno en ambos. Se utiliza, sin modificar sus píxeles, el PNG oficial ya existente y ajustado `frontend/app/public/brand/gestadia-logo-completo.png`, conservando el tamaño visible anterior. Cabecera con fondo y texto explícitos y esquema oscuro local; botón centrado mediante tablas, fondo/color también en el enlace y borde visible; estilos propios para lectores que admiten `prefers-color-scheme`. Las vistas claras/oscuras y EML se generan sin SMTP. Pruebas de plantilla y transporte 7/7; contraste blanco sobre rojo y centro del botón comprobados en navegador. La adaptación de mensajes en oscuro depende del lector ([Thunderbird 140](https://blog.thunderbird.net/files/2025/07/Community-Office-Hours-140-ESR.pdf)); la nueva versión aún requiere comprobarse en Thunderbird. No se repite el correo autorizado anterior. Copia local previa de plantilla, pruebas y PNG conservada. Despliegue tras nueva copia de producción en curso.


Despliegue 11/10: backend e8f1a86 saludable en stack 73, logo y plantilla iguales a la fuente según hashes del contenedor. Copia fresca restaurada antes del cambio. EML finales regenerados localmente; no se envía otro correo. La visualización final en Thunderbird permanece pendiente de confirmación.
