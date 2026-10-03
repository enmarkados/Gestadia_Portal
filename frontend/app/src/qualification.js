export const TOPICS = {
  "canje-carnet": {
    label: "Canje de carnet extranjero",
    questions: [
      {
        key: "paisCanje",
        text: "¿En qué país se expidió tu permiso de conducir?",
        options: ["Perú", "Colombia", "Venezuela", "Argentina"],
      },
      {
        key: "residencia",
        text: "¿Tienes residencia legal en España?",
        options: ["Sí", "En trámite", "No"],
      },
      {
        key: "permiso",
        text: "¿Tu permiso está en vigor y lo obtuviste antes de residir en España?",
        options: [
          "Sí, ambas condiciones",
          "Está caducado",
          "Necesito revisarlo",
        ],
      },
    ],
  },
  transferencia: {
    label: "Transferencia de vehículo",
    questions: [
      {
        key: "vehiculo",
        text: "¿Qué vehículo quieres transferir?",
        options: ["Coche", "Moto", "Otro vehículo"],
      },
      {
        key: "rol",
        text: "¿Eres la persona que compra o la que vende?",
        options: ["Comprador", "Vendedor"],
      },
      {
        key: "estado",
        text: "¿Dispones del contrato firmado y conoces si tiene cargas pendientes?",
        options: [
          "Contrato firmado, sin cargas conocidas",
          "No tengo contrato todavía",
          "Necesito revisar las cargas",
        ],
      },
    ],
  },
  "duplicado-carnet": {
    label: "Duplicado de carnet",
    questions: [
      {
        key: "causa",
        text: "¿Por qué necesitas un duplicado?",
        options: ["Pérdida", "Robo", "Deterioro"],
      },
      {
        key: "vigencia",
        text: "¿Tu permiso está en vigor?",
        options: ["Sí", "No", "No lo sé"],
      },
      {
        key: "emisor",
        text: "¿Se trata de un permiso español?",
        options: ["Sí, español", "No, extranjero"],
      },
    ],
  },
};
export function detectTopic(text) {
  const value = text.toLowerCase();
  if (/canj|extranj|colombia|perú|venezuela/.test(value)) return "canje-carnet";
  if (/transfer|coche|moto|vehículo|compraventa/.test(value))
    return "transferencia";
  if (/duplic|perdid|pérdida|robo|deterior/.test(value))
    return "duplicado-carnet";
  return null;
}
