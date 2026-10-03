import { SERVICIOS } from "../../../shared/servicios.js";
export const DEMO_KEY = "gestadia_app_demo_v1";
export function createManagerDemoConversation(profile, expediente) {
  const country = expediente.paisCanje || "Perú";
  const service = `Canje de Carnet (${country})`;
  return [
    {
      id: "demo-gestor-bienvenida",
      role: "manager",
      time: "10:15",
      content: `¡Hola ${profile.nombre || "Alex"}! Soy Juan Carlos, tu gestor asignado en Gestadia. Ya he recibido el abono de tu trámite de ${service} y estamos preparando la solicitud telemática para la DGT.`,
      emphasis: service,
    },
    {
      id: "demo-cliente-documentacion",
      role: "user",
      time: "10:16",
      content:
        "¡Hola Juan Carlos! Perfecto, ¿qué documentación necesitas que te aporte para tramitarlo?",
    },
    {
      id: "demo-gestor-documentacion",
      role: "manager",
      time: "10:17",
      content: `Necesito que subas estos 3 documentos obligatorios para validar el convenio con las autoridades de ${country}:`,
      emphasis: "3 documentos obligatorios",
      documents: [
        { clave: "residencia", label: "1. Residencia legal (DNI/TIE)" },
        {
          clave: "permiso_extranjero",
          label: `2. Permiso original ${country}`,
        },
        { clave: "psicotecnico", label: "3. Psicotécnico oficial" },
      ],
    },
    {
      id: "demo-cliente-preparacion",
      role: "user",
      time: "10:19",
      content: "Perfecto, voy a preparar los tres documentos y subirlos aquí.",
    },
  ];
}
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
  const profile = {
    nombre: client ? "Alex" : "",
    apellidos: client ? "Ejemplo" : "",
    email: client ? "alex@example.com" : "",
    telefono: "",
    tipoDocumento: "DNI",
    numDocumento: "",
    paisCanje: "",
  };
  return {
    profile,
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
    managerDemoVersion: 2,
    managerMessages: client
      ? createManagerDemoConversation(profile, expediente)
      : [],
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
    const valid =
      value?.profile &&
      Array.isArray(value.expedientes) &&
      Array.isArray(value.notifications) &&
      Array.isArray(value.consultations) &&
      Array.isArray(value.managerMessages);
    if (!valid) return null;
    if (value.managerDemoVersion !== 2) {
      const oldIntro =
        "Hola, soy Juan Carlos. En este ejemplo puedes revisar tu documentación y probar cómo sería nuestra conversación.";
      const retained = value.managerMessages.filter(
        (msg) => !(msg.role === "manager" && msg.content === oldIntro),
      );
      return {
        ...value,
        managerDemoVersion: 2,
        managerMessages: [
          ...(value.expedientes[0]
            ? createManagerDemoConversation(value.profile, value.expedientes[0])
            : []),
          ...retained,
        ],
      };
    }
    return value;
  } catch {
    return null;
  }
}
