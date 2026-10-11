// Destinos internos. Nunca abrimos una URL incluida por el emisor del aviso.
export function notificationDestination(item) {
  if (item.conversationId) return `${item.conversationPurpose === "sondeo" ? "/lidia/conversacion" : "/mensajes/gestor"}?conversacion=${encodeURIComponent(item.conversationId)}${item.conversationProtocol === "v2" ? "&invitado=1" : ""}`;
  if (item.expedienteId) return `/tramites/${encodeURIComponent(item.expedienteId)}`;
  return "/cuenta";
}
