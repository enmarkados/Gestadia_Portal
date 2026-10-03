# Instrucciones para Replicar el Diseño de Gestadia

Guía paso a paso para desarrolladores, diseñadores o equipos de producto que vayan a implementar este diseño en aplicaciones web, móviles o nativas.

---

## 1. Importación de Estilos y Tokens

1. **Variables CSS:** Incluye `estilos/gestadia-tokens.css` en la raíz de tu proyecto o transfiere los valores de `tokens.json` a tu sistema de diseño (Tailwind, Styled Components, etc.).
2. **Fuentes:**
   - Para titulares de marca y logotipo: importa `Playfair Display` (peso 800 bold).
   - Para la interfaz y textos de lectura: usa fuentes del sistema (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
3. **Logotipos y Assets:** Los archivos SVG y PNG listados en `assets/brand/` contienen los logotipos oficiales en versión clara, oscura, con tagline e iconos de app Retina. Los SVGs incluyen `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&display=swap')` para renderizado fiel independiente del sistema operativo.

---

## 2. Implementación del Shell Móvil y Cabecera Oscura

Reutiliza la estructura provista en `referencia-codigo/GestadiaAppShell.jsx`:
- Mantén el contenedor raíz con `position: fixed; inset: 0; display: flex; flex-direction: column; overflow: hidden;`.
- En dispositivos móviles o simuladores, sitúa la cabecera directamente bajo la barra de estado física (`--sat: 44px` o `env(safe-area-inset-top)`).
- La cabecera tiene fondo negro/grafito oscuro `#181818`, borde sutil `rgba(255, 255, 255, 0.08)`, el logotipo tipográfico serif `gestadia.` en blanco con punto rojo `#C0392B`, campana de notificaciones con aviso de requerimiento pendiente y acceso a Mi Cuenta. El icono de lápiz/edición queda completamente excluido.
- Añade `padding-bottom: max(12px, env(safe-area-inset-bottom))` al dock de navegación inferior.
- El dock debe contener exactamente **4 pestañas** distribuidas al 25% de ancho con `white-space: nowrap`:
  1. **LidIA** (`Sparkles` de 20 px)
  2. **Trámites** (`ClipboardList` de 20 px, garantizado en una sola línea)
  3. **Mensajes** (`MessageSquare` de 20 px)
  4. **Servicios** (`ShoppingBag` de 20 px)
- El indicador activo es una barra roja (`#C0392B`) de 24 × 3 px en la parte superior del icono seleccionado.

---

## 3. Modelo Operativo de Dos Fases: IA Preventa (LidIA) vs. Gestor Humano Postventa

### 3.1 Fase 1: Agente IA LidIA de Sondeo y Preventa (`GestadiaHome.jsx` / `GestadiaAssistantContent.jsx`)
1. El agente virtual «nuestro asistente LidIA» atiende al usuario en la primera fase de contacto para cualificar requisitos (ej. país del permiso, tipo de vehículo o titularidad).
2. Las respuestas deben formatearse en Markdown estructurado, sin divulgar tasas base oficiales.
3. Al final de la respuesta, incluye opciones rápidas (`quickReplies`) que dirijan directamente a contratar el paquete en Servicios (`08-contratar`) o a solicitar contacto con un gestor.

### 3.2 Centro de Comunicaciones (`GestadiaMessages.jsx`)
1. Agrupa las conversaciones activas del usuario: el hilo con el gestor asignado y el hilo con LidIA.
2. Proporciona acceso rápido a «Nueva consulta con LidIA» y botón inferior para «Hablar con un gestor». En las tarjetas se omiten etiquetas redundantes como «Tu Gestor» o precios.

### 3.3 Fase 2: Gestor Humano en Postventa (`GestadiaGestorChat.jsx`)
1. **Cabecera Minimalista:** Exclusivamente 3 elementos: Botón de volver (ChevronLeft), Título «Habla con tu gestor», e Icono de llamada (Phone).
2. **Código Cromático de Burbujas:**
   - Mensajes del Gestor: Fondo **Negro Grafito (`#2C2C2C`)**, texto blanco.
   - Mensajes del Usuario: Fondo **Rojo DGT (`#C0392B`)**, texto blanco.
3. **Petición de documentación:** El gestor solicita los documentos preceptivos mediante tarjetas interactivas incrustadas en el chat con opciones para subir fotografías o adjuntar PDFs.
4. **Verificación de datos de filiación:** El usuario accede a la «Validación antes de la presentación del trámite» para confirmar nombre, NIE, domicilio y carnet antes de elevar el expediente a Tráfico con el botón rojo **«Validar y Enviar»** (`referencia-codigo/GestadiaDataVerification.jsx`).
5. **Emisión de Justificante Provisional con CSV:** Tras la validación, el gestor entrega directamente en el chat la Autorización Provisional oficial con Código Seguro de Verificación (CSV de la DGT), permitiendo conducir legalmente de inmediato.

---

## 4. Compositor y Teclado Virtual en Dispositivos Móviles

1. Todo campo `textarea` o `input` en móvil debe tener un tamaño de fuente de al menos `16px` para impedir que Safari en iOS aplique zoom automático sobre la pantalla.
2. El compositor ubica el botón de micrófono en el lado derecho, a la izquierda inmediata del botón de envío circular rojo (`[Textarea] [Micrófono] [Enviar]`).
3. El texto del placeholder por defecto es **«¿Qué necesitas?»**.
4. Al desplegarse el teclado virtual, mantén la cabecera fija y haz scroll automático al final del diálogo.
5. El botón de envío rojo Gestadia (`#C0392B`) permanece deshabilitado hasta que el usuario introduce al menos 2 caracteres en el campo de texto.

---

## 5. Contacto Directo con el Gestor y Lógica Zoho CRM (`GestorContactSheet.jsx`)

- El botón inferior «Hablar con un gestor» está presente en el Shell móvil.
- Al pulsarlo, despliega el `BottomSheet` nativo con lógica condicionada al perfil Zoho CRM del usuario:
  - **Contacto con Trato (Cliente activo):** Muestra el botón negro **«Abrir Chat en la App con Juan Carlos»** (gestor asignado) y el formulario para solicitar llamada telefónica.
  - **Lead (Prospecto en sondeo):** Oculta el botón de chat en la app y muestra exclusivamente el formulario para solicitar llamada de asesoramiento con un gestor.
- **Campana de Notificaciones:** En modo Lead la campana no muestra punto rojo y al abrirla indica «Estás al día / Sin notificaciones pendientes». Para clientes con trámite en curso muestra el indicador rojo y los requerimientos del expediente.
- Toda la comunicación y tramitación se realiza 100% de forma nativa e integrada en la app/portal de Gestadia, sin recurrir a canales externos ni WhatsApp.

---

## 6. Módulo de Servicios y Política de Precios Cerrados

1. **Catálogo con Precio Llave en Mano y Redirección Web:** Implementa la pantalla `referencia-codigo/GestadiaContratar.jsx` bajo el título **«Trámites y Gestiones DGT»** y badge **«Gestión 100% Online»** (evitando títulos agresivos como «Contratar» en negro grande):
   - Canje de Carnet Extranjero (210 € todo incluido).
   - Transferencia de Vehículo (135 € todo incluido con justificante en 24h).
   - Duplicado de Carnet (59 € con envío a domicilio).
2. **Continuar en la Web:** Al pulsar el botón **«Continuar en la web»**, se redirige a `https://gestadia.com/checkout?...` enviando los parámetros precargados (`servicio`, `nombre`, `apellidos`, `numDocumento`, `dni`, `tipoDocumento`, `telefono`, `email`, `paisCanje`, `procedencia: 'lidia'`).
3. **Confidencialidad de Tasas Base:** No muestres nunca los importes individuales de las tasas públicas de la DGT (ej. 28,87 € o 99,77 €) ni enseñes al usuario a realizar el trámite por libre en la sede electrónica de Tráfico.
4. **Mis Trámites Simplificado:** Implementa `referencia-codigo/GestadiaQueries.jsx` mostrando el nombre del trámite a ancho completo y en la parte inferior **«Estado: [estado]»** (con fallback a `En trámite` si no hay dato) y el botón directo para hablar con un gestor.

---

## 7. Verificación de Fidelidad

Abre `index.html` en cualquier navegador moderno para inspeccionar interactivamente las pantallas, alternar entre dispositivos (iPhone, Android, iPad, Tablet 7", Tablet 10"), probar la alternancia de perfiles Zoho CRM (Contacto con Trato vs. Lead) y comprobar la concordancia de colores, radios y tipografías.
