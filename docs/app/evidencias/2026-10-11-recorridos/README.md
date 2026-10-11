# Evidencia de recorridos · 11/10/2026

[Mapa vigente](../../2026-10-11-recorridos-gestores.md) · [Navegación](../../NAVEGACION.md) · [Manual](../../MANUAL-DESARROLLO.md).

## Abrir y seguir

Desde la raíz del repositorio:

```sh
python3 -m http.server 5196 --bind 127.0.0.1 --directory docs/app/evidencias/2026-10-11-recorridos
```

Abrir `http://127.0.0.1:5196/`. Los filtros separan cada recorrido; pulsar una imagen abre la captura original. Las flechas indican el orden comprobado, no una conexión externa. El tablero no autentica ni crea chats, leads, tareas o notificaciones.

Para revisar la APP con el servidor ficticio de interfaz:

```sh
npm ci --prefix frontend
npm run build:app --prefix frontend
node scripts/app-recorridos-preview.mjs
```

Abrir `http://127.0.0.1:5182/`. Cuenta **exclusivamente ficticia**: `fixture@example.test`, contraseña `Prueba-local-only`. No introducir credenciales o datos reales. Este servidor usa memoria, pierde estado al reiniciar y no llama a LidIA, Zoho ni proveedores OAuth/push. Es una ayuda visual del desarrollo, no un backend de integración ni una demo incluida en el producto.

## Procedencia

Assets APP generados desde `codex/app-recorridos-gestores`, base `app/main` 6820e7e e integración marketplace d9d75ed, con las correcciones incluidas en el commit que entrega esta carpeta. Las capturas se conservan tal como se observaron, sin recomposición ni sustitución de texto. No contienen claves privadas, principal real, DNI o datos CRM reales.

| Captura | Entorno y observación |
|---|---|
| 01-entrada-visitante | Web 390×844: inicio de nueva consulta, Login o Continue; no campos de contacto |
| 02-chat-visitante | Web: chat propio de instalación; respuesta literal ficticia, negro suave, cabecera/dock |
| 03-lidia-continuar | Web: regreso, acción visible Continuar, nueva consulta e historial IA |
| 04-llamada-visitante | Web: hoja de llamada voluntaria, nombre/teléfono, propósito y privacidad |
| 05-mensajes-gestores | Web: sólo chat humano, listado compacto |
| 06-renombrar-cancelar | Web: controles de guardar y Cancelar; se verificó cancelar sin cambio |
| 07-gestor-asignado | Web: nombre completo ficticio y botón de abrir chat |
| 08-chat-gestor | Web: conversación humana correcta, cliente rojo, sin nuevo sondeo |
| 09-notificaciones-no-leidas | Web: filtro No leídas; pulsación marcó lectura y abrió esa conversación |
| 10-perfil-seguridad | Web: explicación de restablecimiento de contraseña de Portal y APP |
| 11-ios-arranque | iPhone 17 / iOS 26.5: build Debug instalado, mismo contenido APP, base privada de prueba 5182 |

La copia nativa de QA se configura fuera del repositorio, después de compilar; no sustituye `app-config.js` público ni acredita disponibilidad PRO. El arranque iOS se observó; la pulsación automatizada de Device Hub falló con `noWindowsAvailable`. La captura de accesibilidad posterior confirmó **Capture Keyboard activado**. Escritura, ciclo completo nativo, dispositivo físico y Android permanecen sin validar.

## Pruebas reproducibles

`node scripts/test-app-conversations.mjs`: **285 backend / 191 frontend / build APP** pasan. El harness crea MySQL aislado y limpia sus recursos; no usa la base PRO. `mobile:sync` y `xcodebuild` Debug para simulador pasaron. Los logs locales de esta ejecución están en `/tmp/gestadia-recorridos-acceptance.log`, `/tmp/gestadia-recorridos-sync-final.log` y `/tmp/gestadia-recorridos-ios-signed.log`; pueden desaparecer al reiniciar. Estos resultados y sus límites quedan documentados aquí de forma durable.

No confundir esta carpeta con las pruebas v1 conectadas de 5177: aquéllas conservan otro principal, permisos, sesión, versión y evidencia. El guest v2 y la atención conectada necesitan configuración/acuerdo de DEV; no se han activado en PRO.
