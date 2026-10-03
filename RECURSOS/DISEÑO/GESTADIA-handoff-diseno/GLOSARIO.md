# Glosario Técnico y de Negocio — Gestadia

Este glosario define la terminología oficial utilizada en el diseño, arquitectura y operativa de **Gestadia**.

---

## 1. Conceptos de Trámites y Negocio DGT

- **Gestadia:** Plataforma digital de tramitación de la Dirección General de Tráfico (DGT) y gestión vehicular 100% online y sin cita previa.
- **Gestor DGT / Gestor Asignado:** Profesional especializado facultado para presentar telemáticamente expedientes ante la Jefatura Provincial de Tráfico con plenos efectos jurídicos.
- **Paquete Cerrado «Llave en Mano»:** Modelo comercial de tarifa fija todo incluido (honorarios de gestión, tasas de Tráfico, tramitación telemática, justificante provisional oficial y entrega a domicilio). Por estricta directriz de negocio, no se desglosan ni publicitan las tasas base públicas para evitar la autotramitación y reforzar el valor del servicio integral.
- **Expediente DGT (`EXP-YYYY-XXXX` o `GST-YYYYMM-XXXXX`):** Código de seguimiento único e intransferible generado al iniciar o contratar cualquier trámite. Permite la trazabilidad documental y cronológica en tiempo real.
- **Canje de Carnet Extranjero:** Procedimiento administrativo mediante el cual un conductor titular de un permiso de conducir expedido en un país con convenio bilateral con España lo homologa por el permiso español equivalente sin realizar exámenes en las categorías autorizadas (ej. B). Gestadia lo ofrece como servicio llave en mano por 210 €.
- **Transferencia de Vehículo:** Cambio de titularidad de un automóvil o motocicleta entre particulares o empresas, que incluye el contrato de compraventa, la liquidación del Impuesto de Transmisiones Patrimoniales (ITP) en la Comunidad Autónoma correspondiente y la gestión completa ante Tráfico con permiso provisional en 24h (135 € todo incluido).
- **Duplicado de Carnet / Permiso de Circulación:** Emisión de un nuevo documento original idéntico por sustracción, pérdida o deterioro, manteniendo la vigencia original y puntos acumulados (59 € con envío a domicilio).
- **Reserva de Dominio:** Cláusula financiera inscrita en el Registro de Bienes Muebles (RBM) por la entidad prestamista que impide transferir el vehículo hasta la expedición de la carta de pago y el alzamiento oficial de la carga.
- **Permiso Provisional de Conducir / Circulación:** Documento oficial con código seguro de verificación (CSV) emitido por Gestadia que autoriza a circular legalmente por territorio nacional durante el periodo de expedición del documento definitivo por la Fábrica Nacional de Moneda y Timbre.
- **Plazo de Conducción Legal (6 Meses):** Periodo máximo legal estipulado por el Reglamento General de Conductores durante el cual un residente extranjero puede conducir en España con su carnet de origen antes de estar obligado a canjearlo so pena de sanción administrativa.

---

## 2. Modelo Operativo de Dos Fases (IA vs. Gestor)

- **LidIA (Agente de IA · Sondeo / Preventa / Diagnóstico DGT):** Agente virtual automatizado, ágil y pedagógico que atiende al usuario en la primera fase de contacto. Cualifica la viabilidad legal del trámite, analiza país de procedencia o vehículo, resuelve dudas iniciales y orienta al catálogo de servicios o a la solicitud de llamada.
- **Gestor Humano Asignado (Postventa y Tramitación Oficial):** Profesional asignado individualmente tras la contratación (con nombre propio visible, ej. *Juan Carlos Acero*). Asume la tramitación, solicita los documentos preceptivos vía chat interactivo, remite la ficha de verificación de datos para validación del cliente y expide la autorización provisional oficial con CSV de la DGT.
- **Centro de Comunicaciones («Mensajes»):** Área centralizada donde se visualizan todos los hilos de conversación activos (gestor asignado y LidIA), se inician nuevas consultas con IA y se accede al contacto con el gestor.
- **Verificación de Datos y Carnet (`07-verificacion-datos`):** Módulo formal donde el usuario realiza la «Validación antes de la presentación del trámite» de sus datos de filiación, NIE, domicilio y permiso original antes de su elevación a la DGT, adjuntando fotografías legibles o archivos PDF y remitiendo al gestor con el botón «Validar y Enviar».
- **Trámites Simplificado (`03-mis-tramites`):** Pestaña del dock persistente que muestra el trámite con nombre a ancho completo y en la parte inferior el **Estado: [estado]** (con fallback a `En trámite` si no hay dato registrado) garantizado en una sola línea sin saltos y botón directo a «Hablar con un gestor».
- **Integración con Zoho CRM:** Lógica de negocio para diferenciar usuarios según su estado en el CRM:
  - *Contacto con Trato (Cliente):* Dispone de gestor asignado y ve el botón negro «Abrir Chat en la App con Juan Carlos» además de solicitar llamada.
  - *Lead (Prospecto):* Aún no dispone de gestor y ve exclusivamente la opción de solicitar llamada telefónica de asesoramiento.

---

## 3. Componentes de Interfaz y Tokens

- **Cabecera Oscura (`#181818`):** Fondo negro/grafito profundo en la cabecera superior y barra de estado, con logotipo `gestadia.` en blanco, campana de notificaciones con punto de aviso no leído y botón de Mi Cuenta. El icono de lápiz/edición queda completamente excluido.
- **Grafito Gestadia (`#2C2C2C`):** Color primario que transmite solidez y elegancia institucional. Utilizado para los mensajes del gestor en el chat, botones de confirmación y títulos.
- **Rojo DGT (`#C0392B`):** Color de acento oficial de Tráfico que destaca los mensajes del usuario en el chat, el punto de la marca (`gestadia.`), botones de acción clave, indicador activo del dock y precios.
- **Chat por Burbujas de Color Diferenciadas:** Conversación postventa con cabecera de 3 elementos (Volver, Habla con tu gestor, Llamada) y burbujas: Gestor en **Negro Grafito (`#2C2C2C`)** y Usuario en **Rojo DGT (`#C0392B`)**.
- **Canal de Chat Nativo (Cero WhatsApp):** Toda la experiencia de mensajería, consultas y envío de documentación ocurre dentro de la app propia de Gestadia, protegiendo la privacidad y la trazabilidad del expediente.
- **Compositor:** Módulo inferior con campo de texto expansible (placeholder «¿Qué necesitas?», mínimo 16 px de fuente para prevenir zoom en iOS), micrófono situado en el lado derecho a la izquierda del botón de envío, y botón de envío circular rojo.
- **Bottom Sheet (Hoja Inferior):** Ventana modal que emerge desde la base de la pantalla, adaptando sus opciones según el perfil Zoho CRM (cliente con trato vs. lead).
- **Dock Inferior (4 Pestañas al 25% con `white-space: nowrap`):** Barra de navegación persistente con 4 pestañas:
  1. ✨ **LidIA** (nuestro asistente IA)
  2. 📋 **Trámites** (en la misma línea sin saltos)
  3. 💬 **Mensajes** (centro de comunicaciones)
  4. 🛍️ **Servicios** (catálogo con opción de continuar en la web)
- **Módulo de Servicios con Redirección Web:** Pantalla dedicada en el dock para seleccionar trámites y continuar en la web oficial mediante el botón **«Continuar en la web»** pasando los datos precargados en query string.
- **Safe Area Inset y Status Bar:** Contenedor de barra de estado física (44 px) y variables CSS (`env(safe-area-inset-*)`) que garantizan perfecta legibilidad sin costuras con el fondo `#181818`.
