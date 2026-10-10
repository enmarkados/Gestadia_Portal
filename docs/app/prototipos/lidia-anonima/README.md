# Tablero y maquetas de LidIA sin cuenta

Parte de la documentación de desarrollo de Gestadia APP. [Manual principal](../../MANUAL-DESARROLLO.md) · [Mapas y decisiones](../../2026-10-10-mapas-pantallas-app-anonima.md) · [Glosario](../../../../GLOSARIO.md).

## Arrancar desde cualquier checkout

Los comandos se ejecutan desde la **raíz del repositorio**:

```sh
npm ci --prefix frontend
test -e docs/app/prototipos/lidia-anonima/node_modules || ln -s ../../../../frontend/node_modules docs/app/prototipos/lidia-anonima/node_modules
node frontend/node_modules/vite/bin/vite.js --config docs/app/prototipos/lidia-anonima/vite.config.mjs
```

Abrir http://127.0.0.1:5190/. Si ya está ocupado, usar `--port 5194` y esa URL. Las dependencias están en frontend; el enlace local es ignorado por Git. No hace falta backend, cuenta o clave de proveedor.

El tablero amplía capturas y abre las vistas mediante `pantalla.html?s=ID`. Hay 12 estados principales, 11 alternativas y 3 referencias de la demo actual; la lista vive en [pantallas.json](pantallas.json). Los IDs del prototipo no son rutas del producto.

## Archivos

- [Fuente Mermaid](exportaciones/01-flujo-pantallas.mmd): decisiones/retornos, sincronizada en los documentos del manual.
- [SVG](exportaciones/01-flujo-pantallas.svg): flujo visual; [recorrido](exportaciones/02-pantallas-recorrido.jpg) y [alternativas](exportaciones/03-alternativas.jpg) con imágenes.
- [generar-tablero.py](generar-tablero.py): genera pantallas.json y SVG; no toma capturas ni actualiza Mermaid.
- [pantallas.jsx](pantallas.jsx) y [CSS](pantallas.css): maquetas aisladas con estilos/iconos existentes; no importan API ni autenticación.
- [capturas](capturas/): vistas versionadas a 390 × 844; separar Actual/Propuesta.

## Usarlo para revisar

En preguntas, las acciones externas «Ver ejemplo de resultado»/«Ver ejemplo negativo» muestran estados ilustrativos; elegir país no determina viabilidad. Tras confirmar contacto, A9 sigue pendiente. La franja «Ver confirmación de ejemplo» simula el recibo; verificar/bind y correo tampoco son reales. «Ver pérdida de instalación» muestra el bloqueo del vínculo.

El texto escrito sólo se muestra como mensaje local; no genera respuestas de un modelo. El estado ilustrativo se conserva en sessionStorage de esa pestaña. `?captura=1` oculta la franja externa y usa ejemplos deterministas para capturar, sin convertirlos en producto.

Para mantenerlo y validar un cambio, seguir el [procedimiento del manual](../../MANUAL-DESARROLLO.md#procedimiento-de-mantenimiento). Incorporar el tablero al proyecto no implementa ni activa conversaciones anónimas.
