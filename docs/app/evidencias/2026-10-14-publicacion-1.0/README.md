# Candidato de publicación1.0

Base de producto: app/main `bb84c46`, con PR18 integrada. Rama aislada `codex/app-release-1.0-candidate-20261014`. Preparación autorizada; subir, instalar y activar invitados conservan su aceptación separada.

| Plataforma | Versión | Número reservado | Antecedente comprobado |
| --- | --- | --- | --- |
| iOS | 1.0 | 12 | Archivos Gestadia conocidos hasta11 |
| Android | 1.0 | 5 | Código primario4; Play interno3 según Ops |

Se creó un registro privado nuevo antes de compilar; no se atribuye existencia a un registro anterior. Firma y configuración mediante el pipeline existente, fuera de Git. Origen de API esperado: `https://app.gestadia.com`. No arrancar emuladores, subir paquetes ni instalar durante esta preparación.

Plan acotado: reservar números sin colisión; cambiar sólo versión en el checkout aislado; generar una vez cada candidato firmado y registrar su fuente, versión, configuración y hash. Se reutilizan365 pruebas backend/214 frontend y la revisión de PR18; no se repiten suites por el cambio de versión.

Candidatos compilados y firma/metadatos comprobados: [recibo](candidate-review.json). iOS archive/export0; Android bundleRelease0. Fuente de los paquetes965a12d9d65f78f614d4f1754d58e6c69e31585d. Un único build Android, un único archive y export iOS; sin nuevas suites, subida o instalación. El runtime guest todavía no está aceptado para publicación; una compilación firmada no acredita ese flujo ni disponibilidad en Apple/Play.

La comprobación previa corrigió una ruta de SDK asumida antes de compilar. Los dos pasos cap sync reordenaron dependencias; diferencias privadas conservadas y archivos versionados restaurados, sin nueva compilación. La lectura del manifiesto AAB requirió corregir el classpath del verificador por una Guava antigua de caché; el paquete no se modificó. Diagnósticos Gradle conservados.

Copia previa al apply inactivo del receptor: completada14/10 a08:23:53UTC, exit0,198tablas InnoDB y260migraciones distintas; TLS/transacciónRO/singleTransaction confirmados. SQL privado1311621533bytes/SHA76d5bae7c02be1dc4c8882ec7df63052f2486c1d6fd74151851937ce123e2516; review literal15 SHAd7a074667edf9e7ab9a323a6c73be2dc7839fb6e10000035d3344b756d65fd33. Certificado por identidad y restauración canónica no acreditados. No se restauró ni se ejecutaron escrituras. Originales y credenciales fuera de Git; Source/Ops recibieron sólo el recibo saneado.

Preparación de [subida pendiente](SUBIDA-PENDIENTE.md) y [capturas reales Android](capturas-play/manifest.json): tres pantallas públicas de1.0(5),1080x1920, sin datos de cliente ni crear sesión/turnos. PNG original conservado y JPEG RGB para Play, sin recorte/resize/contenido generado. APK compañero derivado del mismo AAB, sin recompilar; Android propio apagado confirmado. Navegación provisional abrió Trámites/login sin enviar credenciales; sólo las tres capturas finales revisadas visualmente se publican. No acredita flujo invitado ni pista Play.


Actualización14/10: Operaciones comunica una única subida de iOS1.0(12) desde el archivo existente, xcodebuild0/UploadSucceeded. [Recibo con procedencia y límites](ios-upload-12-ops-reported.json). Procesado en App Store Connect y publicación todavía pendientes; no se repite la subida ni se genera otro paquete. La evidencia original del candidato conserva su estado previo a esta subida.


Actualización posterior14/10: Operaciones confirma iOS1.0(12) procesado «Lista para enviar», con asignación QA pendiente de autenticación. Cuenta review guardada en Apple/Play. [Recibo y límites](../2026-10-14-store-review/store-access-and-former-guest-ops-reported.json). No acredita publicación, prueba guest nativa ni subida Android5.


Android1.0(5): Operaciones comunica subida única del AAB existente y distribución interna completada; Play muestra «Activo / Disponible para testers internos»,14oct18:10. [Recibo con procedencia](android-internal-5-ops-reported.json). Dos avisos no bloqueantes de mapping/símbolos. Esto acredita disponibilidad interna comunicada, sin inferir publicación pública o ciclo guest nativo. No hubo nueva compilación ni emulador en este cierre.
