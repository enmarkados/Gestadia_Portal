# Gestadia · Paquete Oficial de Handoff y Rediseño

Paquete preparado el **3 de octubre de 2026** para reproducir y escalar el diseño de **Gestadia (Trámites DGT Online)**.

---

## 🚀 Contenido del Paquete

1. **[`design.md`](design.md):** Especificación completa de diseño, cabecera oscura `#181818` con logotipo blanco (sin icono de lápiz superfluo, con campana de avisos y mi cuenta), dock de 4 pestañas (**LidIA**, **Trámites**, **Mensajes**, **Servicios**), orden de autoridad, medidas del shell móvil, jerarquía tipográfica, chat con burbujas diferenciadas (Gestor en Negro, Usuario en Rojo), lógica Zoho CRM (cliente vs. lead) y pasarela web oficial.
2. **[`index.html`](index.html):** Galería interactiva y simulador móvil en vivo. Permite probar las 8 pantallas del sistema, interactuar con nuestro asistente LidIA, revisar el centro de comunicaciones (**Mensajes**), el chat con gestor por burbujas negro/rojo, consultar el catálogo de **Servicios** con redirección web precompletada, alternar el perfil Zoho CRM (Contacto con Trato vs. Lead) y visualizar las adaptaciones a iPhone, Android, iPad y Tablets sin dependencias ni instalación.
3. **[`tokens.json`](tokens.json):** Variables de diseño estructuradas en JSON (paleta grafito/rojo DGT, cabecera oscura `#181818`, tipografía, espaciados, radios de 12 a 26 px, objetivos táctiles y dock ergonómico de 4 pestañas: LidIA, Trámites, Mensajes, Servicios).
4. **`estilos/`:** Hojas de estilo CSS listas para usar:
   - `gestadia-tokens.css`: Definición de Custom Properties, cabecera oscura `.gestadia-user-header`, clases de utilidad, compositor con micro a la derecha, burbujas de chat rojo/negro, dock de 4 pestañas (con padding lateral de 24px para agrupar iconos y `white-space: nowrap`) y modales.
   - `index.css`: Resets y configuraciones globales para viewport móvil.
5. **`referencia-codigo/`:** Componentes funcionales en React/JSX adaptados al ecosistema de Gestadia:
   - `GestadiaAppShell.jsx`: Shell móvil con cabecera oscura `#181818`, logotipo blanco, acciones limpias (Notificaciones con aviso y Mi Cuenta), CTA inferior a gestor y dock ergonómico de 4 pestañas (**LidIA**, **Trámites**, **Mensajes**, **Servicios**).
   - `GestadiaHome.jsx`: Pantalla de inicio con nuestro asistente LidIA (diagnóstico DGT, bienvenida limpia sin sobrecargas), 3 consultas lead, compositor expansible con micro a la derecha y placeholder «¿Qué necesitas?».
   - `GestadiaMessages.jsx`: Centro de Comunicaciones unificado donde se visualizan los hilos activos con el gestor asignado (sin etiquetas superfluas) y con LidIA, con acceso rápido a nueva consulta y botón para hablar con un gestor.
   - `GestadiaContratar.jsx`: Catálogo de **Servicios DGT** (Gestión 100% Online) con paquetes cerrados (Canje 210 €, Transferencia 135 €, Duplicado 59 €), garantías sin cita previa y botón de acción directa **«Continuar en la web»** con parámetros de cliente y servicio precargados.
   - `GestadiaQueries.jsx`: Listado simplificado de expedientes con el trámite y el **Estado de la gestión** (con fallback automático a `En trámite`) y botón directo «Hablar con un gestor».
   - `GestadiaGestorChat.jsx`: Chat con el gestor asignado con cabecera minimalista (Volver, Habla con tu gestor, Llamada) y burbujas de mensaje por color: Gestor en **Negro Grafito (`#2C2C2C`)** y Usuario en **Rojo DGT (`#C0392B`)**.
   - `GestadiaDataVerification.jsx`: Pantalla formal postventa para validación antes de la presentación del trámite con botón rojo **«Validar y Enviar»**.
   - `GestadiaAssistantContent.jsx`: Parser y renderizador de Markdown semántico con opciones rápidas.
   - `GestorContactSheet.jsx` & `BottomSheet.jsx`: Hoja inferior táctil adaptada a Zoho CRM: si el usuario es un **Contacto con Trato**, muestra el botón negro «Abrir Chat en la App con Juan Carlos» (gestor asignado) + solicitud de llamada; si es **Lead**, muestra exclusivamente la solicitud de llamada.
6. **`assets/brand/`:** Logotipos oficiales en alta resolución (SVG con fuentes Playfair Display incrustadas y PNG Retina) en versiones clara, oscura, con subtítulo, iconos de app Retina (192 y 512 px) y tarjeta social OpenGraph.
7. **`capturas/`:** Capturas en alta fidelidad (Retina 2x) generadas con Google Chrome en 5 viewports:
   - `iphone/` (430 × 932 px)
   - `android/` (432 × 768 px)
   - `ipad/` (1024 × 1366 px)
   - `tablet-7/` (720 × 1280 px)
   - `tablet-10/` (900 × 1600 px)
8. **`correo/`:** Plantilla de correo transaccional responsive con cabecera grafito Gestadia, logotipo y acento rojo DGT (`verificacion.html` y `verificacion.txt`), con capturas mobile y desktop.
9. **Alineación con Portal Real:** 100% alineado con la operativa real del portal (`https://gestadia.com/portal/`):
   - Expediente real: `GST-202607-97389` (Canje de Carnet Extranjero - Perú, 210,00 €).
   - Datos del cliente: Gonzalo Villanova Alvarez (`47307603F`, Tel: `+34 684 46 09 71`, `gonzalovial20@gmail.com`, Castellana 143, Madrid).
   - Checklist de los 3 documentos oficiales exigidos:
     1. Documento de residencia legal en España (DNI español, tarjeta de residencia, tarjeta roja, intracomunitaria o resguardo).
     2. Permiso de conducir extranjero original en vigor (ambas caras).
     3. Examen psicotécnico (centro médico autorizado).
10. **[`GLOSARIO.md`](GLOSARIO.md):** Definiciones de trámites DGT, modelo operativo en dos fases (IA vs. Gestor), expedientes, política de precios cerrados y componentes visuales.
11. **[`INSTRUCCIONES-PARA-REPLICAR.md`](INSTRUCCIONES-PARA-REPLICAR.md):** Manual técnico de réplica paso a paso.

---

## 📱 Mapa de Pantallas Gestadia

| Nº | Pantalla | Descripción |
|---|---|---|
| **01** | **Inicio / LidIA** | Bienvenida personalizada con LidIA, 3 consultas habituales de lead, compositor por voz/texto y CTA para «Hablar con un gestor». |
| **02** | **Nueva Consulta LidIA** | Conversación limpia de sondeo lead con LidIA para cualificar requisitos antes de contratar. |
| **05** | **Mensajes (Comunicaciones)** | Centro de comunicaciones que agrupa los hilos activos con el gestor asignado y con LidIA, acceso a nueva consulta y botón para contactar gestor. |
| **04** | **Habla con tu gestor** | Conversación directa con el gestor asignado: cabecera exclusiva (Volver, Habla con tu gestor, Llamada) y burbujas negro (#2C2C2C para gestor) y rojo (#C0392B para usuario) con hitos documentales y entrega de justificante provisional DGT con CSV. |
| **08** | **Servicios DGT** | Catálogo directo de servicios y trámites (Gestión 100% Online) con paquetes cerrados «llave en mano» (Canje 210 €, Transferencia 135 €, Duplicado 59 €), formulario de datos de cliente y botón **«Continuar en la web»** para finalizar en la pasarela oficial con parámetros cargados. |
| **03** | **Mis Trámites** | Vista simplificada con el título del trámite a ancho completo y en la parte inferior **«Estado: [estado]»** (con fallback a `En trámite`) y botón directo «Hablar con un gestor». |
| **07** | **Verificación de Datos y Carnet** | Pantalla formal postventa para revisar datos de filiación DGT, adjuntar fotos de carnet original / NIE y autorizar la representación telemática. |
| **06** | **Hablar con un Gestor** | Bottom Sheet modal interactivo con adaptación según perfil Zoho CRM: botón negro de chat en app + llamada para clientes con trato, o solo solicitud de llamada para leads. |
