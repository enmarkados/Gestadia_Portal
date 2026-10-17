# Corrección del idioma nativo — 17/10/2026

## Alcance y plan

1. Reproducir el idioma erróneo en el paquete publicado 1.0 (12).
2. Declarar español y añadir recursos nativos españoles; generar 1.0.1 (13).
3. Verificar el idioma resuelto por Foundation, la firma y el paquete exportado.
4. Enviar a Apple, comprobar la ficha de Google y continuar el seguimiento hasta la publicación corregida.

## Diagnóstico

El paquete original contiene `Base.lproj`, `CFBundleDevelopmentRegion=en`, sin `CFBundleLocalizations`. Foundation devuelve `[Base, en]` y selecciona `en` al solicitar `es-ES` (prueba terminada con código 1). La ficha de Apple y la ficha predeterminada de Google están en español de España; Google muestra `es-ES` en el envío de producción 1.0 (5).

## Corrección en preparación

`CFBundleDevelopmentRegion=es`, `CFBundleLocalizations=[es]`, región de desarrollo Xcode `es` y `es.lproj/InfoPlist.strings` incluido en Resources. Versión iOS 1.0.1, build 13. La base `de95f1f` no cambia código funcional de frontend respecto a `965a12d`, origen de la build 12. Se reutilizan los recursos web exactos del archivo firmado original; no se modifica Android, el backend ni Docker.

Pendiente: finalizar compilación, verificar paquete final, subir y acreditar el envío/publicación. Una corrección local o una subida no acreditan el idioma público de App Store.

## Verificación del paquete firmado

Compilación y exportación Release terminadas con código 0. Verificación profunda de firma correcta; versión 1.0.1, build 13, región `es`, localizaciones `[es]`, `es.lproj/InfoPlist.strings` presente y sin `en.lproj`. Los hashes de todos los recursos web coinciden con la build 12. Las revisiones SwiftPM son las del paquete anterior; se descartó un primer archivo local en el que Xcode había actualizado automáticamente GoogleUtilities. No se subió ese archivo. `Package.resolved` conserva los bytes originales.

Apple confirma «Idioma principal: Español (España)». El borrador 1.0.1 y sus notas están guardados, con publicación automática. Google confirma ficha predeterminada «Español (España) — es-ES» y el AAB 1.0 (5) contiene `base/assets/public/index.html` con `lang="es"`. No se sustituye ni reenvía la release Android.

Verificación de sintaxis: `plutil -lint` correcto para Info.plist, InfoPlist.strings y project.pbxproj; `git diff --check` sin errores. Queda pendiente acreditar recepción, envío a revisión y publicación de 1.0.1 (13). El seguimiento horario ya espera la versión correctiva y el idioma público español.

## Subida

Xcode confirma subida de 1.0.1 (13) con código 0 el 17/10/2026 a las 21:58 de Madrid. Recibo `recibo-subida.json`. Pendiente de procesamiento y envío a revisión; no acredita publicación corregida.
