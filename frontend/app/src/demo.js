import { SERVICIOS } from "../../../shared/servicios.js";
export const DEMO_KEY = "gestadia_app_demo_v1";
export function createDemo(profileType = "cliente") {
  const client = profileType === "cliente";
  const expediente = {
    id: "demo-canje",
    nPedido: "DEMO-001",
    titulo: SERVICIOS["canje-carnet"].nombre,
    servicioSlug: "canje-carnet",
    estado: "documentacion_pendiente",
    estadoLabel: "Falta documentación",
    progreso: 40,
    paisCanje: "Perú",
    documentos: [],
    checklist: SERVICIOS["canje-carnet"].documentos.map((doc) => ({
      ...doc,
      subido: false,
    })),
    eventos: [],
  };
  return {
    profile: {
      nombre: client ? "Alex" : "",
      apellidos: client ? "Ejemplo" : "",
      email: client ? "alex@example.com" : "",
      telefono: "",
      tipoDocumento: "DNI",
      numDocumento: "",
      paisCanje: "",
    },
    expedientes: client ? [expediente] : [],
    notifications: client
      ? [
          {
            id: "demo-aviso",
            titulo: "Completa tu documentación",
            mensaje: "Revisa los documentos pendientes de tu canje.",
            leida: false,
            expedienteId: expediente.id,
          },
        ]
      : [],
    managerMessages: [
      {
        role: "manager",
        content:
          "Hola, soy Juan Carlos. En este ejemplo puedes revisar tu documentación y probar cómo sería nuestra conversación.",
      },
    ],
    consultations: [],
    assistantState: {
      topic: null,
      answers: {},
      messages: [],
    },
    profileType,
  };
}
export function readDemo() {
  try {
    const value = JSON.parse(localStorage.getItem(DEMO_KEY));
    return value?.profile &&
      Array.isArray(value.expedientes) &&
      Array.isArray(value.notifications) &&
      Array.isArray(value.consultations) &&
      Array.isArray(value.managerMessages)
      ? value
      : null;
  } catch {
    return null;
  }
}
