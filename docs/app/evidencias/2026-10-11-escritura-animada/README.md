# Indicador de escritura completo animado

11/10/2026. El usuario confirma que usa TestFlight (2) y pide animar texto y puntos como una app de mensajería. Pulso del texto 1600 ms, opacidad 0.68–1; puntos 1200 ms, desfases 0/160/320 ms y subida máxima 3 px. Misma cursiva, estado, rol accesible, retirada y permisos que el indicador aprobado.

Prueba visual aislada en navegador local, sin conexión al agente ni envío de mensajes. JSON registra estilos efectivos. Movimiento reducido verificado con animación none, opacidad 1 y transform none en los cuatro elementos. Suite frontend 178/178; los avisos históricos de navegación JSDOM no son fallos. Preparación de build (3); firma, subida, distribución e instalación se acreditan por separado.

La build (3) parte de la misma base funcional de (2) y añade esta presentación. Los recorridos PR16/9c2e62c y follow-up documental siguen como referencia de otro candidato; no se atribuyen a esta corrección. Guest permanece sin activar. Las builds anteriores se conservan en directorios privados de release separados.

## Compilación y firma de (3)

Fuente funcional `dcbc47c`, subida a `origin/codex/gestadia-marketplaces`. iOS archive/export completados, `codesign --verify --deep --strict` correcto, `com.gestadia.app`, build 3, APNs production, Apple Sign In Default y `get-task-allow=false`. Metadato `ITSAppUsesNonExemptEncryption=false`, coherente con el cifrado del sistema ya aprobado. Android assemble/bundle Release completados, versionCode 3 y certificado upload SHA-256 `10b1e61fc2c711a3527cb5db75ddb6e9249d8107a26536cacc8d8bc40c09aa6b` verificado.

Configuración pública de iOS/Android idéntica, conversaciones activas y CSS `lidia-typing-label` incluido en ambos binarios; [firmas y hashes](native-release-proof.json). No cambia la lógica de conversación. Play (3) «Activo» y «Disponible para testers internos» a las 08:55 hora local; [captura](play-3-activa.png). Apple confirma subida a las 08:56 hora local y procesamiento terminado. TestFlight (3) asignada al grupo Gestadia QA, «En pruebas», con notas guardadas; [captura](testflight-3-en-pruebas.png). Instalación física de (3) todavía pendiente.
