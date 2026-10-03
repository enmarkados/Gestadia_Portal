# Handoff Técnico · Gestadia Portal
**Fecha de corte:** 3 de octubre de 2026, 12:55 CEST  
**Rama activa:** `main` (sincronizada en `origin/main`)  
**Último commit:** `0af9d2e` · `feat(ui): handoff de diseno Gestadia, mejoras en checkout y portal, y sondeo en LidIA`  
**Estado del árbol de trabajo:** 100% limpio (`working tree clean`)

---

## 1. ¿Qué es este proyecto y estado actual?

**Gestadia** es una plataforma integral de tramitación telemática ante la DGT (transferencias de vehículos, canje de carnet extranjero, duplicados, bajas, etc.) atendida por gestores colegiados y asistida por la IA **LidIA**.

La plataforma cuenta con:
- **Frontend React 18 + Vite**: Catálogo de trámites, flujo de checkout con Stripe, y Portal del Cliente (`/portal`) con visualización de expedientes, estados de tramitación, subida de documentación, verificación de datos y centro de notificaciones.
- **Backend Node.js + Express**: Gestión de trámites, sesiones de pago de Stripe, expedientes y notificaciones.
- **Handoff de Diseño Móvil**: Especificación completa, interactiva y empaquetada en `RECURSOS/DISEÑO/GESTADIA-handoff-diseno/` con 8 pantallas, capturas multi-dispositivo y tokens.
- **Suite de Pruebas**: 21 archivos y 40/40 tests pasando en verde (`npm test --prefix frontend`).

---

## 2. Mapa de Directorios Clave

```
Gestadia_Portal/
├── assets/
│   └── brand/                      # Kit oficial de marca Gestadia (logos, iconos, favicons, OG social)
├── backend/
│   ├── src/                        # API Express, controladores de expedientes y webhooks Stripe
│   └── scripts/                    # Utilidades de backend
├── frontend/
│   ├── src/
│   │   ├── components/             # Header, Footer, CheckoutCard, ServiceLayout
│   │   │   └── portal/             # PortalLayout (navegación y estructura del área privada)
│   │   ├── pages/
│   │   │   ├── Checkout.jsx        # Pantalla de pago con soporte de query params prefill
│   │   │   ├── CheckoutIntent.jsx  # Gestión de intents de Stripe
│   │   │   ├── Tramites.jsx        # Catálogo de trámites
│   │   │   ├── portal/
│   │   │   │   ├── MisServicios.jsx# Listado de expedientes (cards ancho completo, estado inferior)
│   │   │   │   ├── ExpedienteDetalle.jsx # Vista detallada y subida documental
│   │   │   │   ├── MisDatos.jsx    # Verificación de datos del cliente
│   │   │   │   └── Notificaciones.jsx   # Avisos ("Estás al día" en modo Lead)
│   │   │   └── servicios/          # Formularios específicos por trámite (Canje, Transferencia, etc.)
├── RECURSOS/
│   └── DISEÑO/
│       ├── GESTADIA-handoff-diseno/ # Handoff móvil interactivo oficial
│       │   ├── index.html           # Showcase interactivo con selector de 8 pantallas y dispositivos
│       │   ├── design.md            # Especificación completa de diseño y UX
│       │   ├── tokens.json          # Tokens de diseño oficiales
│       │   ├── GLOSARIO.md          # Terminología oficial DGT / Gestoría
│       │   ├── INSTRUCCIONES-PARA-REPLICAR.md # Guía para implementar en producción
│       │   ├── capturas/            # Capturas reales Playwright (iphone, android, ipad, tablet-7, tablet-10)
│       │   ├── correo/              # Plantillas HTML/TXT de email transaccional y capturas
│       │   ├── referencia-codigo/   # Componentes JSX desacoplados de referencia
│       │   └── SHA256SUMS.txt       # Integridad criptográfica de 81 ficheros
│       └── GESTADIA-handoff-diseno-2026-10-03.zip # Archivo ZIP comprimido del handoff
└── scripts/
    ├── generate-gestadia-handoff-capturas.cjs # Generador automatizado de capturas con Playwright
    └── fix-gestadia-brand-assets.cjs          # Generador de assets vectoriales y rasterizados de marca
```

---

## 3. Decisiones de Diseño y Requisitos Clave

### A. Paleta de Color y Tipografía Oficial
- **Grafito Principal**: `#2C2C2C` (textos, cabeceras en contrastes, botones de acción secundaria/gestor).
- **Rojo Gestadia**: `#C0392B` (acento principal, estado de error/alerta, llamada a la acción primaria, mensajes del usuario en chats).
- **Fondo General**: `#F7F7F7` (superficie neutral de aplicación).
- **Superficies**: `#FFFFFF` (tarjetas, inputs, burbujas del asistente).
- **Verde Éxito**: `#16A34A` (estados favorables, badges verificados, justificantes).
- **Tipografía Cabeceras**: `'Playfair Display', Georgia, serif` (800 / 900 bold).
- **Tipografía UI**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

### B. Gestor Colegiado y Terminología
- **Gestor Asignado**: Juan Carlos Acero (iniciales de avatar: `JA`).
- **No usar**: Carlos M. Valero.
- **Títulos y textos**:
  - En el menú/dock inferior, la sección de catálogo es **"Servicios"** (nunca "Contratar" en tamaño grande o agresivo).
  - En los correos y mensajes, el botón de acceso directo es **"Entrar al portal"**.
  - En la validación de datos: *"Validación antes de la presentación del trámite"*, con botón rojo *"Validar y Enviar"*.
  - En el chat de mensajes se suprimió el badge duplicado de Gestor DGT y el label "210 PAGADO".

### C. Comportamiento de LidIA (`02 · Consulta LidIA`)
- Al tocar un trámite desde el inicio o en la propia pantalla de consulta, **NO se redirige a Servicios**.
- En su lugar, el sistema lanza un diálogo de **sondeo conversacional**:
  1. Muestra la consulta del usuario en una burbuja roja.
  2. LidIA responde con 3 preguntas de cualificación previa específicas del trámite (país emisor/residencia previa para Canje, cargas/ITV para Transferencia, causa/vigencia para Duplicado).
  3. Muestra chips interactivos para que el usuario responda con un clic o escriba en el compositor (placeholder: `¿Qué necesitas?`).
  4. Al responder, LidIA genera un diagnóstico preliminar favorable y ofrece botones de acción (*"Hablar con Juan Carlos"* o *"Ver Servicios DGT"*).

### D. Perfiles de Usuario (Cliente vs. Lead)
- **Perfil Cliente (`cliente`)**: Tiene expediente contratado. Muestra badge de notificación pendiente en la campana, acceso directo a chat de expediente con Juan Carlos Acero y estado de avance.
- **Perfil Lead (`lead`)**: Sin trámites activos aún. La campana no muestra punto rojo; al abrirla muestra el estado vacío: *"Estás al día. No tienes notificaciones pendientes"*. El botón de contacto ofrece solicitud de llamada telefónica.

---

## 4. Comandos de Verificación y Testing

### Tests Unitarios del Frontend
```bash
npm test --prefix frontend
```
*Debe reportar 21 archivos de test y 40 tests pasados.*

### Regenerar Capturas de Pantalla con Playwright
Si se realizan cambios en el handoff de diseño (`RECURSOS/DISEÑO/GESTADIA-handoff-diseno/index.html`):
```bash
node scripts/generate-gestadia-handoff-capturas.cjs
```
*Levanta un servidor HTTP local en el puerto 4571 y captura todas las pantallas en 5 resoluciones (`iphone`, `android`, `ipad`, `tablet-7`, `tablet-10`) y las 2 plantillas de correo.*

### Recalcular Checksums y Actualizar ZIP del Handoff
```bash
# 1. Recalcular SHA256SUMS.txt
python3 -c "import os, hashlib, glob
handoff_dir = os.path.abspath(glob.glob('RECURSOS/*/GESTADIA-handoff-diseno')[0])
files = sorted([os.path.relpath(os.path.join(r, f), handoff_dir) for r, d, fns in os.walk(handoff_dir) for f in fns if f not in ('SHA256SUMS.txt', '.DS_Store') and not f.endswith('.zip')])
lines = [f'{hashlib.sha256(open(os.path.join(handoff_dir, f), \"rb\").read()).hexdigest()}  ./{f}\n' for f in files]
open(os.path.join(handoff_dir, 'SHA256SUMS.txt'), 'w', encoding='utf-8').writelines(lines)
print('Wrote', len(lines), 'checksums.')"

# 2. Empaquetar ZIP
zip -r -q RECURSOS/DISEÑO/GESTADIA-handoff-diseno-2026-10-03.zip RECURSOS/DISEÑO/GESTADIA-handoff-diseno -x "*.DS_Store"
```

### Ejecutar Entorno de Desarrollo Local
```bash
# Frontend (Vite)
npm run dev --prefix frontend

# Backend (Express)
npm run dev --prefix backend
```

---

## 5. Parámetros de Prellenado en Checkout (Referencia para Integración)

Cuando LidIA o una automatización externa redirige al usuario a la web para pagar o formalizar un trámite, debe utilizar la URL de checkout con los siguientes query params:

```
https://gestadia.com/checkout?servicio={slug}&nombre={nombre}&apellidos={apellidos}&email={email}&telefono={telefono}&numDocumento={dni_nie}&tipoDocumento={DNI|NIE|Pasaporte}&paisCanje={pais}&procedencia=lidia
```

- Si el nombre viene unificado (ej. `nombre=Gonzalo+Villanova+Alvarez`), `Checkout.jsx` automáticamente separa el primer término como nombre y el resto como apellidos.
- Si el teléfono incluye prefijo internacional (ej. `+34684460971`), el formulario normaliza los 9 dígitos nacionales y conserva el prefijo.
- El aviso superior informa: *"Revisa tus datos antes de pagar. Los hemos recogido en tu conversación con LidIA y pueden contener errores..."*.
