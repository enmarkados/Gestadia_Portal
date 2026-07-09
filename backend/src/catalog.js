// ============================================================
// CATÁLOGO DE SERVICIOS — la única fuente de verdad del cableado
// - Precios (editar aquí)
// - Checklist de documentos que el cliente sube en el portal
// - Mapeo con Zoho CRM: valor del picklist `Servicio`, campo de
//   fase del Trato, y traducción fase Zoho -> estado del portal
// ============================================================

// Estados visibles para el cliente (orden = línea de tiempo)
export const ESTADOS = [
  { id: 'pago_pendiente',          label: 'Pago pendiente' },
  { id: 'pagado',                  label: 'Pago recibido' },
  { id: 'documentacion_pendiente', label: 'Falta documentación' },
  { id: 'en_gestion',              label: 'En gestión' },
  { id: 'presentado',              label: 'Presentado en la administración' },
  { id: 'completado',              label: 'Completado' },
];
export const ESTADO_INCIDENCIA = { id: 'incidencia', label: 'Incidencia — te contactamos' };

export const SERVICIOS = {
  canje: {
    slug: 'canje',
    nombre: 'Canje de permiso de conducir',
    descripcion: 'Canjea tu permiso extranjero por el español sin volver a examinarte.',
    precio: 149.0,
    zoho: {
      servicio: 'Canje',                    // picklist Deals.Servicio
      faseField: 'Fase_del_psicot_cnico',   // "Fase del canje"
      fases: {
        'Pte. documentación':                'documentacion_pendiente',
        'Gestión de cita':                   'en_gestion',
        'Gestión de psicotécnico':           'en_gestion',
        'Mensajería':                        'en_gestion',
        'Entrega de documentación al gestor':'en_gestion',
        'Tramitación cita':                  'en_gestion',
        'Pdte contestación DGT':             'presentado',
        'Completado':                        'completado',
      },
    },
    checklist: [
      { clave: 'dni_anverso',   label: 'DNI / NIE (anverso)' },
      { clave: 'dni_reverso',   label: 'DNI / NIE (reverso)' },
      { clave: 'permiso',       label: 'Permiso de conducir extranjero (ambas caras)' },
      { clave: 'padron',        label: 'Certificado de empadronamiento' },
      { clave: 'foto_carnet',   label: 'Fotografía tamaño carné' },
    ],
  },

  certificados: {
    slug: 'certificados',
    nombre: 'Certificados civiles',
    descripcion: 'Nacimiento, matrimonio, defunción, divorcio o antecedentes.',
    precio: 39.0,
    zoho: {
      servicio: 'Certificados',
      faseField: 'Fase_certificados',
      fases: {
        'Pdte documentación':   'documentacion_pendiente',
        'Gestión certificado':  'en_gestion',
        'Completado':           'completado',
      },
    },
    checklist: [
      { clave: 'dni_anverso', label: 'DNI / NIE (anverso)' },
      { clave: 'dni_reverso', label: 'DNI / NIE (reverso)' },
    ],
  },

  jubilacion: {
    slug: 'jubilacion',
    nombre: 'Tramitación de jubilación',
    descripcion: 'Gestionamos tu solicitud de jubilación ante la Seguridad Social.',
    precio: 99.0,
    zoho: {
      servicio: 'Jubilación', // añadir este valor al picklist Servicio si no existe
      faseField: 'Fase_jubilaci_n',
      fases: {
        'Pdte de documentación':  'documentacion_pendiente',
        'Pdte de clave':          'documentacion_pendiente',
        'Gestión de informe':     'en_gestion',
        'Solicitud de jubilación':'presentado',
        'Completado':             'completado',
      },
    },
    checklist: [
      { clave: 'dni_anverso',    label: 'DNI / NIE (anverso)' },
      { clave: 'dni_reverso',    label: 'DNI / NIE (reverso)' },
      { clave: 'vida_laboral',   label: 'Informe de vida laboral' },
    ],
  },

  otros: {
    slug: 'otros',
    nombre: 'Otras gestiones',
    descripcion: 'Otras gestiones administrativas: cuéntanos tu caso.',
    precio: 59.0,
    zoho: {
      servicio: 'Casos independientes',
      faseField: 'Fase_ayudas',
      fases: {
        'Pdte documentación':    'documentacion_pendiente',
        'Pdte Jorge':            'en_gestion',
        'Pdte contestación DGT': 'presentado',
        'Completado':            'completado',
      },
    },
    checklist: [
      { clave: 'dni_anverso', label: 'DNI / NIE (anverso)' },
      { clave: 'dni_reverso', label: 'DNI / NIE (reverso)' },
    ],
  },
};

export function getServicio(slug) {
  return SERVICIOS[slug] || null;
}

// Traduce una fase de Zoho al estado del portal (para el webhook de Zoho)
export function faseToEstado(servicioSlug, fase) {
  const s = SERVICIOS[servicioSlug];
  if (!s || !fase) return null;
  return s.zoho.fases[fase] ?? null;
}
