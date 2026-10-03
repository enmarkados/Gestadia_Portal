# Gestadia · Especificación de Diseño y Handoff

Handoff del **3 de octubre de 2026** (Revisión Integral de Arquitectura, Comunicaciones y Experiencia).
Documentación oficial para la réplica y evolución del diseño de interfaz de la aplicación y portal móvil de **Gestadia (Trámites DGT Online)**.

---

## 1. Orden de Autoridad y Principios de Diseño

1. **Esta especificación (`design.md`):** Reglas de jerarquía, interacción, flujos de preventa/postventa y dimensiones.
2. **Tokens del sistema (`tokens.json` y `estilos/gestadia-tokens.css`):** Colores oficiales, radios, fuentes y espaciados.
3. **Componentes de referencia (`referencia-codigo/`):** Estructura modular de pantallas en React/JSX.
4. **Capturas y previsualizaciones (`index.html` y `capturas/`):** Referencia visual interactiva de composición en viewports reales.

### Principios Fundamentales y Modelo Operativo

- **Modelo en Dos Fases (IA Preventa vs. Gestor Humano Postventa):**
  1. **Fase 1: Preventa y Sondeo Lead con LidIA (Agente IA):** Asistente digital automatizado, rápido y resolutivo. Diagnostica y cualifica la consulta del usuario, verifica requisitos iniciales y deriva directamente al catálogo de servicios o al contacto con un gestor.
  2. **Fase 2: Tramitación Postventa con Gestor Humano Asignado:** Una vez formalizada la contratación del trámite, se activa la atención individualizada con un gestor asignado (ej. *Juan Carlos Acero*). El gestor solicita la documentación obligatoria por el chat, envía la ficha de verificación de datos del conductor previa al registro en Tráfico y expide la autorización provisional oficial con Código Seguro de Verificación (CSV de la DGT).
- **Centro de Comunicaciones («Mensajes»):** Área dedicada en el dock para gestionar todas las conversaciones activas (con el gestor asignado y con LidIA), permitiendo iniciar nuevas consultas o contactar con el gestor en cualquier momento.
- **Cabecera Oscura de Alto Contraste (`#181818`):** Fondo negro/grafito oscuro (`#181818`), logotipo `gestadia.` en blanco con punto terminal rojo (`#C0392B`), campana de notificaciones con aviso de requerimiento pendiente y acceso a Mi Cuenta. El icono de lápiz/edición queda completamente eliminado por ser redundante.
- **Precios Cerrados «Llave en Mano» en «Servicios»:** Denominación ergonómica y no agresiva (**«Servicios»** en vez de «Contratar»). El usuario revisa paquetes completos con precio cerrado todo incluido (Canje 210 €, Transferencia 135 €, Duplicado 59 €). Por estricta política comercial, **no se divulgan las tasas base públicas de Tráfico** ni se instruye a realizar el trámite por libre ante la DGT.
- **Contratación con Redirección a la Web Oficial:** La pantalla de servicios recopila el trámite y los datos del titular y redirige a la pasarela oficial mediante el botón **«Continuar en la web»**, transmitiendo los parámetros en query string (`https://gestadia.com/checkout?...`).
- **Seguimiento Simplificado en «Mis Trámites»:** La tarjeta de cada expediente muestra el título del trámite a ancho completo (sin badges superiores que lo constriñan) y, en la parte inferior, la indicación **«Estado: [estado]»** (con fallback a `En trámite`) junto al acceso directo a «Hablar con un gestor».
- **Chat Directo con Gestor por Burbujas Diferenciadas:** 
  - Cabecera minimalista: Botón de volver + Título «Habla con tu gestor» + Icono de llamada telefónica.
  - Burbujas de conversación: Gestor en **Negro Grafito (`#2C2C2C`)** y Usuario en **Rojo DGT (`#C0392B`)**.
- **Lógica de Integración con Zoho CRM (Contacto con Trato vs. Lead):**
  - **Contacto con Trato:** Usuario con expediente en curso y gestor asignado. El modal «Hablar con un gestor» muestra el botón negro **«Abrir Chat en la App con Juan Carlos»** + opción de solicitar llamada telefónica.
  - **Lead:** Prospecto en fase de captación sin gestor asignado aún. El modal muestra exclusivamente la opción de **solicitar llamada telefónica**, sin botón de chat en la app.
- **Sin Dependencias de Canales Externos (Cero WhatsApp):** Todo el flujo de mensajería, consultas y envío de documentación ocurre dentro de la app propia de Gestadia.

---

## 2. Identidad Visual y Paleta Oficial

| Token | Hex / Valor | Uso y Jerarquía |
|---|---|---|
| **`brand-header-bg`** | `#181818` | Fondo de la cabecera superior y barra de estado del dispositivo |
| **`brand-header-text`** | `#FFFFFF` | Color del logotipo `gestadia.` en cabecera |
| **`brand-header-icon`** | `rgba(255,255,255,0.08)` | Fondo de botones de acción en cabecera invertida con icono blanco |
| **`brand-graphite`** | `#2C2C2C` | Mensajes del gestor en el chat, botones oscuros y títulos de sección |
| **`brand-graphite-dark`**| `#1F1F1F` | Hover y estado presionado de botones grafito |
| **`brand-red`** | `#C0392B` | **Rojo DGT Gestadia:** Mensajes del usuario en el chat, punto de `gestadia.`, botón de envío, indicador activo de navegación y precios |
| **`brand-red-hover`** | `#A93226` | Hover del botón de acción rojo |
| **`brand-red-soft`** | `#FDEDEC` | Fondo de badges pendientes, píldoras activas y contenedores de aviso |
| **`brand-red-border`** | `#F5C6CB` | Borde sutil en estados de alerta o selección |
| **`brand-success`** | `#16A34A` | Trámites completados, datos validados y badges de «Listo para circular» |
| **`brand-warning`** | `#D97706` | Avisos de plazos legales (cuenta atrás de 6 meses) |
| **`brand-bg`** | `#F7F7F7` | Fondo general de la aplicación |
| **`brand-surface`** | `#FFFFFF` | Superficie de tarjetas, inputs y contenedores modales |
| **`brand-border`** | `#E8E8E8` | Separadores y contornos neutros |
| **`brand-border-control`**| `#D1D5DB`| Borde de inputs, buscador y compositor |

### Tipografía
- **Logotipo y Titulares de Marca:** `Playfair Display`, `Georgia`, `serif` (800 Bold). 
  - La marca se escribe en minúsculas con punto rojo: **`gestadia.`**
- **Interfaz, Textos y Controles:** `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `Roboto`, `sans-serif` (pesos 400, 500, 600 y 700).

---

## 3. Mapa de Pantallas del Ecosistema Gestadia

| Nº | Pantalla | Función y Flujo de Usuario | Componente Fuente |
|---|---|---|---|
| **01** | **Inicio / LidIA** | Bienvenida con LidIA, 3 consultas habituales de lead, compositor por voz/texto y CTA a «Hablar con un gestor». | `GestadiaHome.jsx` + `GestadiaAppShell.jsx` |
| **02** | **Nueva Consulta LidIA** | Conversación limpia de sondeo lead con LidIA para cualificar requisitos antes de contratar. | `GestadiaHome.jsx` (`isNewChat: true`) |
| **05** | **Mensajes (Comunicaciones)** | **Centro de Comunicaciones:** Vista centralizada con los hilos activos (gestor asignado y LidIA), botón de nueva consulta y acceso inferior a hablar con un gestor. | `GestadiaMessages.jsx` |
| **04** | **Habla con tu gestor** | **Chat Directo Postventa:** Cabecera con 3 elementos exclusivos (Volver, Título, Llamada) y burbujas de mensaje en negro (gestor) y rojo (usuario) con hitos documentales y emisión de justificante CSV. | `GestadiaGestorChat.jsx` |
| **08** | **Servicios DGT** | Catálogo de trámites (Gestión 100% Online) con precios cerrados (Canje 210 €, Transferencia 135 €, Duplicado 59 €), formulario y botón **«Continuar en la web»** para completar en pasarela oficial. | `GestadiaContratar.jsx` |
| **03** | **Mis Trámites** | Vista simplificada: nombre del trámite a ancho completo y en la parte inferior **«Estado: [estado]»** (con fallback a `En trámite`) y botón directo «Hablar con un gestor». | `GestadiaQueries.jsx` |
| **07** | **Verificación de Datos y Carnet** | Pantalla formal postventa para revisar datos de filiación DGT, adjuntar fotos de carnet original / NIE y autorizar la representación telemática. | `GestadiaDataVerification.jsx` |
| **06** | **Hablar con un Gestor** | Bottom Sheet modal con bifurcación Zoho CRM: chat en app + llamada para clientes con trato, o solicitud de llamada exclusiva para leads. | `GestorContactSheet.jsx` + `BottomSheet.jsx` |
| **09** | **Correo Transaccional** | Email responsive informando de la asignación del gestor con botón directo de verificación de datos. | `correo/verificacion.html` |

---

## 4. Medidas y Ergonomía del Shell Móvil

- **Cabecera Superior Oscura (`.gestadia-user-header`):**
  - Fondo `#181818`, borde inferior `rgba(255, 255, 255, 0.08)`.
  - Logotipo `gestadia.` en blanco con punto `#C0392B`.
  - Botones de acción invertidos (`#FFFFFF` sobre `rgba(255, 255, 255, 0.08)`):
    1. **Campana de Notificaciones:** con indicador rojo de aviso no leído para clientes con expediente activo; limpia y sin punto rojo en modo Lead. Al pulsar, abre el cajón mostrando los requerimientos activos (Cliente) o el estado «Estás al día / Sin notificaciones pendientes» (Lead).
    2. **Mi Cuenta** (perfil de usuario y datos de contacto).
  - *Icono de lápiz (SquarePen) suprimido para garantizar máxima limpieza visual.*
- **Dock de Navegación Inferior (`.gestadia-user-nav`):**
  - Borde superior `1px solid #E8E8E8`, padding `6px 24px max(10px, env(safe-area-inset-bottom))` (con 24 px de padding lateral para agrupar los iconos armoniosamente hacia el centro del viewport móvil).
  - Exactamente **4 pestañas** distribuidas equitativamente al 25% del ancho de pantalla con `white-space: nowrap;` para garantizar una sola línea:
    1. ✨ **LidIA** (`Sparkles` de 20 px)
    2. 📋 **Trámites** (`ClipboardList` de 20 px)
    3. 💬 **Mensajes** (`MessageSquare` de 20 px)
    4. 🛍️ **Servicios** (`ShoppingBag` de 20 px)
  - Pestaña activa: texto grafito `#2C2C2C` e indicador superior rojo DGT de `24 × 3 px`.

---

## 5. Especificaciones Detalladas de Interacción

### 5.1 Chat con el Gestor Asignado («Habla con tu gestor»)
- **Cabecera Estricta (3 Elementos):**
  1. Botón de volver atrás (flecha ChevronLeft).
  2. Título central: **«Habla con tu gestor»**.
  3. Icono de llamada telefónica directa (Phone).
- **Código Cromático de Burbujas:**
  - **Gestor Juan Carlos:** Fondo **Negro / Grafito (`#2C2C2C`)**, texto blanco `#FFFFFF`, esquinas redondeadas con remate inferior izquierdo, alineado a la izquierda.
  - **Usuario:** Fondo **Rojo DGT (`#C0392B`)**, texto blanco `#FFFFFF`, esquinas redondeadas con remate inferior derecho, alineado a la derecha.
- **Petición de Documentación Obligatoria:**
  - Incluye tarjeta interactiva dentro del chat con botones de subida para DNI/TIE, carnet extranjero y psicotécnico.
- **Ficha de Verificación de Datos del Conductor:**
  - Encabezado: **«Validación antes de la presentación del trámite.»**
  - Permite verificar datos filiatorios, subir documentación y remitir al gestor mediante el botón rojo **«Validar y Enviar»**.
- **Emisión del Permiso Provisional con CSV:**
  - Tras verificar datos y documentos, el gestor emite la Autorización Provisional oficial con Código Seguro de Verificación (CSV de la DGT), permitiendo circular legalmente de inmediato.

### 5.2 Centro de Comunicaciones («Mensajes»)
- Agrupa todas las conversaciones activas del usuario:
  - Hilo con el Gestor Asignado DGT (postventa, con badge de estado y último mensaje).
  - Hilo con LidIA (asistente IA preventa para sondeos y diagnósticos).
- Incluye acceso directo a «Nueva consulta con LidIA» e integración inferior con el modal «Hablar con un gestor».

### 5.3 Lógica de Contacto Zoho CRM (BottomSheet)
- **Caso A: Contacto con Trato (Cliente con expediente activo):**
  - Muestra el botón negro destacado: **«Abrir Chat en la App con Juan Carlos»**.
  - Muestra el separador «o solicita que te llamemos» con formulario de llamada.
- **Caso B: Lead (Prospecto en fase de sondeo):**
  - Oculta el botón de chat en la app (no hay gestor asignado aún).
  - Muestra exclusivamente el formulario para solicitar llamada telefónica con un gestor.
