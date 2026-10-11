# Aceptación nativa y distribución — 11/10/2026

Capturas nuevas independientes de las actas anteriores. Android: botón Apple obtenido de su CDN oficial y símbolo/font oficiales Google, 48 px CSS. La imagen de botones corresponde al candidato 0bbda4e; 82d011a conserva esos recursos y añade la creación previa del canal gestadia_updates.

- [Botones Android](android-buttons.png).
- [Permiso y activación FCM](android-buttons-push-active.png).
- [Aviso real del canal Gestadia, 82d011a](android-channel-delivered.png).
- [Subida Apple completada, 82d011a](apple-upload-complete.png).

Dos avisos técnicos exclusivamente a sistemas@enmarkados.com, sin email ni trámite. El segundo usa canal gestadia_updates, importancia 3 y notificación PRIVATE. Aceptación FCM en un intento, 00:17:03.760Z; recepción Android observada. La primera prueba acredita pulsación y vuelta a Mi Perfil con la sesión propietaria e inclusión en bandeja. No se atribuye esa pulsación a la segunda prueba.

Xcode confirma App 0.1.0 (1) uploaded. App Store Connect muestra Gestadia, Apple ID 6821484915, compilación 1 procesada y «Lista para enviar» tras guardar información de exportación. No está instalada mediante TestFlight ni publicada; aún no hay invitación. Recursos/guías: [Apple](https://developer.apple.com/documentation/signinwithapple/incorporating-sign-in-with-apple-into-other-platforms), [Google](https://developers.google.com/identity/branding-guidelines). El uso de cifrado del sistema se revisa conforme a [documentación Apple](https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations).

Pendientes: revisión visual iOS, OAuth Apple/Google en cada plataforma y push APNs en iPhone. No se alteró la app LIA. Correos Thunderbird claro/oscuro aceptados por el destinatario.


## Distribución interna posterior

- [Play: versión 0.1.0 (1) disponible para testers internos](play-internal-release.jpg). La ficha Gestadia 4974812323816991329 ya está creada y el AAB 82d011a publicado en pruebas internas. Canal inactivo por ausencia de testers; no acredita instalación ni publicación pública.
- [TestFlight: build 0.1.0 (1) en pruebas](apple-testflight-testing.jpg). Grupo Gestadia QA, manual, un tester; invitación al destinatario indicado comprobada «Invitado». La captura personal de invitación permanece en artifacts/social-branding-20261011/apple-testflight-invited.png fuera de Git.
- [Metadatos públicos de la comprobación](distribution-proof.json).

La firma Play es diferente de la Upload; cliente Google Android Play preparado y confirmación de creación pendiente. Se conserva el cliente local Upload. El usuario pide mantener el emulador LIA de otro chat y posponer iOS; no se inicia otro. Las actas anteriores describen estados históricos; esta continuación actualiza distribución sin convertirlos en aceptación nativa.
