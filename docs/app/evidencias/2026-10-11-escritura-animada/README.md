# Indicador de escritura completo animado

11/10/2026. El usuario confirma que usa TestFlight (2) y pide animar texto y puntos como una app de mensajería. Pulso del texto 1600 ms, opacidad 0.68–1; puntos 1200 ms, desfases 0/160/320 ms y subida máxima 3 px. Misma cursiva, estado, rol accesible, retirada y permisos que el indicador aprobado.

Prueba visual aislada en navegador local, sin conexión al agente ni envío de mensajes. JSON registra estilos efectivos. Movimiento reducido verificado con animación none, opacidad 1 y transform none en los cuatro elementos. Suite frontend 178/178; los avisos históricos de navegación JSDOM no son fallos. Preparación de build (3); firma, subida, distribución e instalación se acreditan por separado.

La build (3) parte de la misma base funcional de (2) y añade esta presentación. Los recorridos PR16/9c2e62c y follow-up documental siguen como referencia de otro candidato; no se atribuyen a esta corrección. Guest permanece sin activar. Las builds anteriores se conservan en directorios privados de release separados.
