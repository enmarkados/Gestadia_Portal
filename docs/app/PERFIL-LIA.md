# Perfil, privacidad y soporte de Gestadia

[Alcance de la demo](PRIMERA-VERSION.md) · [Validación](VALIDACION.md) · [Glosario](../../GLOSARIO.md)

La estructura se replica de LIA APP (`src/components/UserMenu.tsx`, `src/pages/Profile.tsx`, `src/pages/LegalPage.tsx` y `shared/legalContent.ts`). El repositorio de LIA se utiliza como referencia de lectura y no se modifica. Colores, datos y contenido se adaptan a Gestadia.

| Vista de LIA | Gestadia | Comportamiento actual |
| --- | --- | --- |
| UserMenu / Cuenta | `AccountMenu.jsx` | Panel inferior con avatar, identidad, Mi Perfil y Cerrar Sesión. |
| Profile | `/cuenta`, `Account.jsx` | Información personal, contraseña, avisos push, preferencias, borrado y enlaces legales. |
| LegalPage: privacy | `/legal/privacy` | Política específica de la demo, accesible sin sesión. |
| LegalPage: terms | `/legal/terms` | Condiciones del recorrido de ejemplo, accesibles sin sesión. |
| LegalPage: support | `/legal/support` | Contacto y ayuda sobre acceso, documentos, avisos y privacidad. |
| Account deletion | `AccountDeletion.jsx`, `/legal/delete-account` | Confirmación y eliminación del almacenamiento local del ejemplo. |

No se importa ActiveRoleSwitcher, DevTools ni impersonación. El selector Cliente/Lead de Gestadia permanece en la parte superior del perfil. El perfil no muestra el CTA Hablar con un gestor. Acceso y registro tampoco lo muestran, incluso si el acceso se renderiza en Inicio tras cerrar sesión.

## Datos y acciones

- Los datos personales siguen utilizando el modelo de Gestadia y precargan el recorrido de servicio. El correo se muestra sólo para lectura.
- El cambio de contraseña valida la confirmación y limpia todos sus campos. No verifica una contraseña remota ni guarda ninguna contraseña en la demo.
- Avisos push, analítica, campañas y diagnóstico son preferencias locales; no solicitan permisos ni conectan SDK externos.
- Cerrar sesión conserva los datos del ejemplo. Cerrar y borrar cuenta elimina `gestadia_app_demo_v1`, limpia la sesión de Gestadia y vuelve al acceso. No utiliza `localStorage.clear()` ni borra datos de otras apps. Si el almacenamiento rechaza la eliminación, el diálogo muestra el fallo y conserva la sesión.
- El motivo del borrado es opcional, transitorio y no se envía ni conserva. Un ejemplo posterior no recupera los datos borrados.
- Las páginas legales conservan el destino de regreso al cambiar entre Privacidad, Términos, Soporte y Eliminación. También se enlazan desde acceso y registro.

## Apple y Google Play

Apple exige que las apps con creación de cuenta permitan iniciar su eliminación dentro de la app, con un recorrido fácil de encontrar y eliminación de los datos asociados, salvo conservación legal necesaria. [Guía oficial de Apple](https://developer.apple.com/support/offering-account-deletion-in-your-app/).

Google Play exige un recorrido dentro de la app y un recurso web para solicitar la eliminación de la cuenta y sus datos cuando hay creación de cuentas; también requiere declarar el tratamiento en Data safety. [Guía oficial de Google Play](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).

Esta entrega prepara las vistas compartidas por web/iOS/Android y realiza el borrado del ejemplo local. **No acredita el cumplimiento de una app con cuentas reales ni publicación en las tiendas.** Antes de esa publicación quedan pendientes conectar el borrado del servidor y de sus proveedores, definir la conservación real, publicar las URLs HTTPS de privacidad/soporte/eliminación y completar las declaraciones de privacidad de Apple y Google con las funciones efectivamente conectadas.
