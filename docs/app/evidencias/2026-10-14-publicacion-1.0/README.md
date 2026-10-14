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
