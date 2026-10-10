# Evaluación de app.gestadia.com

Fecha: 10/10/2026. Alcance: evaluación del stack preparado y sus dependencias;
no activa servicios, credenciales, migraciones ni publicación.

[Despliegue Docker/Plesk](DOCKER-PLESK.md) · [Configuración móvil](MARKETPLACES-CONFIGURACION.md) · [Glosario](../../GLOSARIO.md)

## Dictamen

El subdominio es adecuado como origen HTTPS estable para la APP, su API,
callback Apple y páginas públicas. Dos contenedores gestionados en un stack de
Portainer son suficientes para la fase actual: Nginx web y API móvil. Plesk
termina HTTPS y reenvía a un puerto loopback; la API no publica puerto host.
La interfaz iOS/Android se empaqueta en la aplicación, según capacitor.config.json;
no necesita descargar el frontend remoto para arrancar. Desplegar la web no
actualiza las builds nativas ni su configuración de release empaquetada.

El stack preparado no constituye una APP completa operativa ni una entrega
lista para tiendas. Las pruebas aisladas acreditan componentes, no integración
con el Portal servido ni entrega de push en dispositivos.

## Contenido y servicios previstos

| Elemento | Función | Evaluación actual |
|---|---|---|
| Web compartida y recursos de marca | Versión de navegador de la interfaz APP | Puede servirse, pero debe reflejar funciones disponibles y corregir textos de demo. |
| API de identidad, cuenta y sesiones | Contraseña, Apple/Google nativos, perfil y revocación | Implementada y probada aisladamente; requiere migraciones, configuración privada y validación real. |
| Callback Apple HTTPS | Retorno del acceso Apple Android y canje de credenciales en servidor | Preparado y registrado; pendiente recorrido real en build firmada. |
| Registro de dispositivos y servicio push | APNs iOS y FCM Android; despachar PushDelivery | Preparado; la conexión con los productores de avisos del Portal requiere integración adicional. |
| Configuración pública y versión | Clientes OAuth públicos y capacidades/versiones comprobables | Nunca debe contener claves privadas; la release nativa conserva configuración revisada al firmar. |
| Privacidad, condiciones y soporte | Páginas públicas de la app conectada | Las páginas actuales describen una demo; no son adecuadas para cuentas reales. |
| Solicitud de eliminación fuera de la app | Recurso web utilizable tras desinstalar | La página actual y el proceso pendiente no cierran este recorrido. |

## Dependencias que impiden considerar el conjunto terminado

### Productor de notificaciones del Portal

En la rama marketplaces, notifyUser llama a pushService.notify, que crea el
aviso y PushDelivery en una transacción si push está habilitado. El worker solo
consume esas entregas; no convierte por sí mismo cualquier fila de Notificacion
en push. En app/main, notifyUser todavía escribe directamente Notificacion.
Por tanto, compartir base de datos y desplegar el consumidor no basta.

Antes de activar avisos reales hay que comprobar el SHA/código servido del
Portal e integrar su productor de notificaciones con la cola durable. Debe
preservar aviso/email y evitar duplicación; separar creación de entregas y
credenciales de envío permite que solo el servicio móvil custodie claves APNs/FCM.
Los avisos de conversaciones LidIA siguen requiriendo su contrato propio.

### Revocación coherente entre APP y Portal

El nuevo proceso de eliminación fija User.accessRevokedAt y revoca AuthSession
 y PushDevice. El middleware de app/main comprueba accountStatus, pero no
accessRevokedAt, y su camino JWT no consulta la nueva AuthSession. Se debe
comprobar y armonizar el backend servido antes de prometer retirada de acceso
sobre ambas superficies. Compartir JWT_SECRET no resuelve por sí solo esta
compatibilidad. La purga/conservación sigue pendiente: registrar una solicitud
no equivale a eliminar los datos.

### Funciones visibles frente a rutas disponibles

El proxy preparado admite identidad, cuenta, push, notificaciones y lectura de
expedientes. Bloquea documentos, checkout, leads e integraciones; /lidia/ devuelve
503. La APP incluye recorridos de documentos y chat que no deben presentarse
como operativos en esta fase. Documentos requiere almacenamiento coherente con
el Portal; checkout permanece en gestadia.com. Esta restricción evita además
que el backend móvil, sin Stripe, exponga el checkout simulado sobre la DB real.

SocialAccess y createSocialClient solo permiten ios/android. Apple/Google en
ambos sistemas móviles es el alcance implementado; un acceso social desde la
web exige un flujo propio si se decide ofrecerlo.

### Páginas públicas y publicación

legal-content.js afirma que no hay cuentas remotas ni envío de datos. Hay que
sustituir esas afirmaciones por el funcionamiento real antes de activar usuarios.
La ruta web de eliminación debe permitir solicitarla sin reinstalar la app;
Google permite varios mecanismos, incluido soporte, pero exige que sean
funcionales, identificables y pertinentes. No basta con una vista de demo.

Referencias oficiales:
- [Recurso web y eliminación Google Play](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).
- [Eliminación de cuenta Apple](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion).

## Operación y aceptación

Mantener secretos en directorio privado fuera de webroot y montados de solo
lectura; respaldar DB, clave de cifrado y credenciales de forma recuperable.
El healthcheck actual prueba que responde el proceso, no la DB ni la cola.
La aceptación debe observar también conexión a DB, edad/estado de entregas,
fallos de proveedores y versión/configuración efectivamente servida.

La auditoría registrada mantiene cuatro alertas altas en dependencias. El SMTP
no está configurado en la API móvil, pero estas alertas requieren seguimiento;
no se considera el conjunto libre de vulnerabilidades por pasar las pruebas.
La API reutiliza el código del Portal: conviene limitar también su montaje de
rutas comerciales en el propio proceso, además del bloqueo de Nginx.

Orden propuesto: armonizar productor push y revocación del Portal; completar
páginas públicas y eliminación; hacer coherente la interfaz con el alcance;
activar el stack y comprobar versión/API; distribuir builds de prueba y validar
login, revocación y recepción push en iOS/Android. Documentos y LidIA pueden
activarse después únicamente si no se presentan como disponibles antes.

Verificación de esta evaluación: código de rama marketplaces y app/main,
configuración Docker/Capacitor, documentación oficial de tiendas y consulta
HTTPS pública a /api/mobile/capabilities: 404. No se ha verificado en este bloque
el SHA servido del backend del Portal ni se ha cambiado producción.
