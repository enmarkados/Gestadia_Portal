// ============================================================
// FUENTE ÚNICA DE SERVICIOS — consumida por backend (runtime)
// y frontend (build). Módulo de datos puro: sin imports de Node
// ni de React. Precios y documentos se editan AQUÍ.
//
// `documentos` es la checklist concreta de subida del portal
// (el backend la expone como `servicio.checklist`). La presentación
// rica de documentos vive en cada ficha del front.
//
// AVISO Zoho: solo el mapeo de `canje-carnet` está verificado. El
// resto usa valores best-effort de SERVICIO_MAP (services/zoho.js)
// y faseField:null. Verificar contra el CRM (ZohoCRM_getFields en
// Deals) antes de activar Zoho o de conectar las fichas al pago.
// ============================================================
import { PAISES } from './paises-canje.js';

const FASES_GENERICAS = {
  'Pdte documentación': 'documentacion_pendiente',
  'En gestión': 'en_gestion',
  'Presentado': 'presentado',
  'Completado': 'completado',
};

export const SERVICIOS = {
  'canje-carnet': {
    slug: 'canje-carnet',
    nombre: 'Canje de Carnet Extranjero',
    descripcion: 'Homologa tu permiso de conducir extranjero por el carnet español ante la DGT.',
    categoria: 'permiso',
    precio: 210,
    href: '/tramites/canje-carnet',
    stripeLookupKey: 'gestadia_canje_1_categoria_2026',
    requierePais: true,
    requiereDireccion: true,
    includes: ['Tasas DGT incluidas', 'Gestión completa', 'Especialista personal asignado', 'Garantía de éxito del trámite'],
    documentos: [
      { clave: 'residencia', label: 'Documento de residencia legal en España (DNI español, tarjeta de residencia, tarjeta roja, intracomunitaria o resguardo de concesión)' },
      { clave: 'permiso_extranjero', label: 'Permiso de conducir extranjero original en vigor (ambas caras)' },
      { clave: 'psicotecnico', label: 'Examen psicotécnico (centro autorizado)' },
    ],
    zoho: {
      servicio: 'Canje',
      faseField: 'Fase_del_psicot_cnico',
      fases: {
        'Pte. documentación': 'documentacion_pendiente',
        'Gestión de cita': 'en_gestion',
        'Gestión de psicotécnico': 'en_gestion',
        'Mensajería': 'en_gestion',
        'Entrega de documentación al gestor': 'en_gestion',
        'Tramitación cita': 'en_gestion',
        'Pdte contestación DGT': 'presentado',
        'Completado': 'completado',
      },
    },
  },

  'duplicado-carnet': {
    slug: 'duplicado-carnet',
    nombre: 'Duplicado de Carnet de Conducir',
    descripcion: 'Duplicado de tu carnet de conducir por pérdida, robo o deterioro.',
    categoria: 'permiso',
    precio: 70,
    href: '/tramites/duplicado-carnet',
    stripeLookupKey: 'gestadia_portal_duplicado_carnet',
    includes: ['Tasas DGT incluidas', 'Permiso provisional en 24 h', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI en vigor (anverso y reverso)' },
    ],
    zoho: { servicio: 'Duplicado Carnet De Conducir', faseField: null, fases: FASES_GENERICAS },
  },

  'duplicado-datos': {
    slug: 'duplicado-datos',
    nombre: 'Duplicado por Cambio de Datos',
    descripcion: 'Actualiza los datos de tu carnet: de NIE a DNI, cambio de nombre o de sexo.',
    categoria: 'permiso',
    precio: 70,
    href: '/tramites/duplicado-datos',
    stripeLookupKey: 'gestadia_portal_duplicado_datos',
    includes: ['Tasas DGT incluidas', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI en vigor con los datos actualizados' },
      { clave: 'nie_anterior', label: 'NIE anterior (si el cambio es de NIE a DNI)' },
      { clave: 'carnet_actual', label: 'Carnet de conducir actual' },
      { clave: 'resolucion_registral', label: 'Resolución registral de cambio de nombre o sexo (si aplica)' },
    ],
    zoho: { servicio: 'Duplicado Carnet De Conducir', faseField: null, fases: FASES_GENERICAS },
  },

  'permiso-internacional': {
    slug: 'permiso-internacional',
    nombre: 'Permiso Internacional de Conducir',
    descripcion: 'Permiso internacional para conducir fuera de la UE, válido un año.',
    categoria: 'permiso',
    precio: 100,
    href: '/tramites/permiso-internacional',
    stripeLookupKey: 'gestadia_portal_permiso_internacional',
    includes: ['Tasas DGT incluidas', 'Válido en más de 150 países', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI o NIE en vigor' },
      { clave: 'carnet_conducir', label: 'Carnet de conducir español en vigor' },
      { clave: 'foto_carnet', label: 'Foto carnet reciente (fondo blanco)' },
    ],
    zoho: { servicio: 'Otras gestiones', faseField: null, fases: FASES_GENERICAS },
  },

  'transferencia': {
    slug: 'transferencia',
    nombre: 'Transferencia de Vehículo',
    descripcion: 'Cambio de titularidad del vehículo ante la DGT (coches y motos).',
    categoria: 'vehiculo',
    precio: 190,
    href: '/tramites/transferencia',
    stripeLookupKey: 'gestadia_portal_transferencia',
    includes: ['Tasas DGT incluidas', 'Coches y motos', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni_comprador', label: 'DNI o NIE del comprador' },
      { clave: 'dni_vendedor', label: 'DNI o NIE del vendedor' },
      { clave: 'contrato_compraventa', label: 'Contrato de compraventa firmado por ambas partes' },
      { clave: 'permiso_circulacion', label: 'Permiso de circulación original' },
      { clave: 'itv', label: 'Tarjeta ITV en vigor' },
    ],
    zoho: { servicio: 'Transferencia de VEhículos', faseField: null, fases: FASES_GENERICAS },
  },

  'baja-vehiculo': {
    slug: 'baja-vehiculo',
    nombre: 'Baja de Vehículo',
    descripcion: 'Baja definitiva o temporal de tu vehículo ante la DGT.',
    categoria: 'vehiculo',
    precio: 190,
    href: '/tramites/baja-vehiculo',
    stripeLookupKey: 'gestadia_portal_baja_vehiculo',
    includes: ['Tasas DGT incluidas', 'Baja definitiva o temporal', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI, pasaporte o NIE en vigor' },
      { clave: 'permiso_circulacion', label: 'Permiso de circulación original' },
      { clave: 'ficha_tecnica', label: 'Ficha técnica o tarjeta ITV' },
    ],
    zoho: { servicio: 'Transferencia de VEhículos', faseField: null, fases: FASES_GENERICAS },
  },

  'cancelacion-dominio': {
    slug: 'cancelacion-dominio',
    nombre: 'Cancelación de Reserva de Dominio',
    descripcion: 'Cancela la reserva de dominio de tu vehículo tras liquidar la financiación.',
    categoria: 'vehiculo',
    precio: 120,
    href: '/tramites/cancelacion-dominio',
    stripeLookupKey: 'gestadia_portal_cancelacion_dominio',
    includes: ['Gestión ante Registro Bienes Muebles', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI o NIE en vigor' },
      { clave: 'carta_cancelacion', label: 'Carta de cancelación o certificado de pago de la entidad financiera' },
      { clave: 'permiso_circulacion', label: 'Permiso de circulación del vehículo' },
      { clave: 'itv', label: 'Tarjeta ITV' },
    ],
    zoho: { servicio: 'Otras gestiones', faseField: null, fases: FASES_GENERICAS },
  },

  'duplicado-circulacion': {
    slug: 'duplicado-circulacion',
    nombre: 'Duplicado Permiso de Circulación',
    descripcion: 'Duplicado del permiso de circulación por pérdida o deterioro.',
    categoria: 'vehiculo',
    precio: 70,
    href: '/tramites/duplicado-circulacion',
    stripeLookupKey: 'gestadia_portal_duplicado_circulacion',
    includes: ['Tasas DGT incluidas', 'Autorización provisional inmediata', 'Gestión completa', 'Especialista personal asignado'],
    documentos: [
      { clave: 'dni', label: 'DNI o NIE en vigor' },
      { clave: 'denuncia', label: 'Denuncia por pérdida o robo (si aplica)' },
      { clave: 'permiso_deteriorado', label: 'Permiso de circulación deteriorado (si aplica)' },
    ],
    zoho: { servicio: 'Otras gestiones', faseField: null, fases: FASES_GENERICAS },
  },
};

// Checklist de documentos de un expediente: base del servicio + extra del país.
export function checklistExpediente(servicioSlug, paisCanje) {
  const base = SERVICIOS[servicioSlug]?.documentos ?? [];
  const extra = paisCanje ? (PAISES[paisCanje]?.documentosExtra ?? []) : [];
  return [...base, ...extra];
}

const DIRECCION_OBLIGATORIOS = ['nombreVia', 'numero', 'codigoPostal', 'municipio', 'provincia'];

// Devuelve un mensaje de error (string) o null si es válido.
export function validarDatosCanje(servicio, { paisCanje, direccion, datosPais } = {}) {
  if (servicio?.requierePais) {
    const pais = PAISES[paisCanje];
    if (!pais) return 'Selecciona el país del permiso.';
    for (const campo of pais.camposExtra) {
      if (!String(datosPais?.[campo.clave] || '').trim()) return `Falta el campo "${campo.label}".`;
    }
  }
  if (servicio?.requiereDireccion) {
    for (const k of DIRECCION_OBLIGATORIOS) {
      if (!String(direccion?.[k] || '').trim()) return 'Completa la dirección de envío del permiso.';
    }
  }
  return null;
}
