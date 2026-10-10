# Teléfono de Servicios APP en el checkout web

10/10/2026. Corrección independiente de la propuesta APP anónima. [Glosario](../../GLOSARIO.md).

## Causa y cambio

Servicios APP incluye `telefono` en la URL mediante `checkoutUrl`. `extractPrefill` lo recoge. `CheckoutForm.aplicarPrefill` sólo copiaba teléfonos que coincidieran con un prefijo internacional de su selector; un número nacional como `600 111 222` quedaba vacío.

La corrección conserva un número sin signo `+` en el campo y mantiene el prefijo por defecto del formulario, +34. Los números con prefijos internacionales reconocidos continúan separándose por el prefijo más largo, sin duplicarlo. No cambia la generación de enlaces, el catálogo, los campos ni el tratamiento de un prefijo internacional desconocido.

## Pruebas

- Regresión real `checkoutUrl` APP → ruta Checkout → formulario: teléfono nacional con espacios, +34 y prefijo largo +1809. Comprueba también nombre, apellidos, email, tipo/número de documento y país normalizado.
- Antes del cambio: la regresión nacional falló porque el teléfono estaba vacío; los otros ocho casos pasaban.
- `NODE_OPTIONS=--no-experimental-webstorage npm test --prefix frontend`: **152/152**, 33 archivos, exit 0. La ejecución inicial sin ese ajuste falló por `localStorage.clear is not a function` en el entorno Node, antes de las pruebas APP. Persisten avisos existentes de React Router y navegación no implementada en jsdom; no son fallos de la suite.
- `npm run build --prefix frontend`: compilación web correcta.
- Navegador: Servicios APP local 5193 → Continuar en la web → pestaña Checkout local 5192, utilizando datos ficticios. El catálogo GET local usa `shared/servicios.js`; no se efectuó pago, alta ni petición POST. Captura visible confirma teléfono `600 111 222` con +34 y resto de valores. Los controles email/teléfono aparecen censurados en lecturas DOM del navegador; la comprobación de sus valores se basa en las pruebas y en la captura visible.

[Teléfono y datos recibidos](evidencias/2026-10-10-checkout-telefono/web-telefono-visible.jpg) · [Contexto completo del checkout](evidencias/2026-10-10-checkout-telefono/web-datos-recibidos.jpg).

La evidencia es local y automatizada. El despliegue web y una versión nativa instalada son cierres separados; no se declaran realizados por estas pruebas.
