# Diseño: Reemplazar CTAs de pago por formulario de captación de leads

**Fecha:** 2026-06-24  
**Estado:** Aprobado

## Contexto

El portal Gestadia actualmente presenta botones de "Solicitar" y paneles de checkout con pago mediante Stripe. Se ha decidido eliminar temporalmente la opción de pago online y sustituir todos los CTAs por un formulario de captación de leads que vuelca en Zoho CRM. Los precios se mantienen visibles.

## Alcance

### Archivos afectados

| Archivo | Cambios |
|---|---|
| `preview-home.html` | Botones, trust badges, copy del "¿Cómo funciona?" |
| `preview-tramites.html` | Botones de servicio |
| `preview-canje.html` | Panel checkout → panel de captación |
| `preview-baja-vehiculo.html` | Panel checkout → panel de captación |
| `preview-transferencia.html` | Panel checkout → panel de captación |
| `preview-duplicado-carnet.html` | Panel checkout → panel de captación |
| `preview-duplicado-datos.html` | Panel checkout → panel de captación |
| `preview-duplicado-circulacion.html` | Panel checkout → panel de captación |
| `preview-cancelacion-dominio.html` | Panel checkout → panel de captación |
| `preview-permiso-internacional.html` | Panel checkout → panel de captación |

### Archivos que NO cambian

- `preview-contacto.html` — ya es correcto
- `preview-aviso-legal.html`, `preview-cookies.html`, `preview-privacidad.html`, `preview-proteccion-datos.html`, `preview-pagos-devoluciones.html` — contenido legal, sin CTAs de compra

## Cambios detallados

### Home (`preview-home.html`)

1. Botones `.service-card-btn` con texto `Solicitar →` → `Solicitar información →` (los `href` a páginas de servicio se mantienen)
2. Eliminar elemento trust "Pago 100% seguro con Stripe" del bloque hero (`.hero-trust-item`)
3. En la sección "¿Cómo funciona?", el paso que menciona "pago seguro con tarjeta a través de Stripe" → reescribir como "Formulario rápido. Te contactamos en menos de 24h."
4. Bloque de confianza `.trust-title` "Pago 100% seguro" + `.trust-desc` sobre Stripe → eliminar bloque completo

### Trámites (`preview-tramites.html`)

1. Todos los botones `.service-card-btn` con texto `Solicitar →` → `Solicitar información →`
2. Los precios (`.service-card-price`) se mantienen sin cambios
3. Los `href` a páginas de servicio se mantienen

### 8 páginas de servicio

El panel `.checkout-card` se transforma en un panel de captación:

**Estructura del nuevo panel:**

```
┌─────────────────────────────┐
│  NOMBRE DEL SERVICIO        │  ← .checkout-service (sin cambios)
│  190 € IVA incluido         │  ← .checkout-price (sin cambios)
│  ✓ Incluye X                │  ← .checkout-includes (sin cambios)
│  ✓ Incluye Y                │
├─────────────────────────────┤
│  Solicita información       │  ← nuevo título
│  Te llamamos en 24h         │  ← nuevo subtítulo
│                             │
│  [Nombre         ]          │  ← input text, required
│  [Teléfono       ]          │  ← input tel, required
│  [Email          ]          │  ← input email, required
│                             │
│  [Solicitar información →]  │  ← button.checkout-btn (mismo estilo)
│                             │
│  💬 ¿Prefieres escribir?    │  ← .checkout-whatsapp (enlace WA)
│     Escríbenos por WhatsApp │
└─────────────────────────────┘
```

**Estado de éxito** (reemplaza el formulario dentro del panel al enviar):

```
┌─────────────────────────────┐
│  ✓ ¡Solicitud recibida!     │
│  Te llamamos en menos de    │
│  24 horas hábiles.          │
│                             │
│  Mientras tanto puedes      │
│  escribirnos por WhatsApp.  │
│  [Ir a WhatsApp →]          │
└─────────────────────────────┘
```

**Se elimina:**
- Botón `Pagar con tarjeta →`
- Texto `🔒 Pago seguro · Powered by Stripe`
- `.checkout-divider`

## Arquitectura técnica

### Formulario por página (JS inline)

Cada página de servicio incluye un `<script>` inline al final del `<body>`. No hay fichero JS compartido — son HTML estáticos independientes.

```js
// Estructura del handler (igual en todas las páginas, solo varía tramite)
document.getElementById('lead-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const data = {
    nombre: /* valor campo */,
    telefono: /* valor campo */,
    email: /* valor campo */,
    tramite: '/* nombre del trámite */'
  };
  submitLead(data);
});

function submitLead(data) {
  // TODO: conectar Zoho CRM
  // fetch('https://www.zohoapis.eu/crm/v2/Leads', { ... })
  showSuccess();
}

function showSuccess() {
  // Reemplaza el contenido del .checkout-body con el estado de éxito
}
```

### Integración Zoho CRM (pendiente)

El módulo de envío (`submitLead`) está preparado como placeholder comentado. Cuando se dispongan de las credenciales OAuth de Zoho, se sustituirá el `// TODO` por el fetch real a la API de Zoho Leads, con los campos mapeados:

| Campo formulario | Campo Zoho Lead |
|---|---|
| nombre | `Last_Name` |
| teléfono | `Phone` |
| email | `Email` |
| tramite | `Lead_Source` o campo custom |

## Lo que NO cambia

- Precios visibles en todos los paneles y tarjetas
- Diseño visual: colores, tipografías, layout de dos columnas
- Página de contacto (`preview-contacto.html`)
- Enlace "Pagos y devoluciones" en el footer (contenido legal)
- Estructura de navegación
