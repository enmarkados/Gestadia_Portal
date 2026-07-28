// Integración LidIA (contrato 1.0: docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md)
import { getServicio } from '../catalog.js';
import { claveDesdeISO } from '../../../shared/paises-canje.js';

// Fase 1: solo una categoría. canje_2_categorias se activará añadiendo la
// entrada cuando negocio publique el precio (cambio compatible 1.x).
const CATALOGO_LIDIA = {
  canje_1_categoria: { servicioSlug: 'canje-carnet' },
};

export function catalogoLidia(code) {
  const c = CATALOGO_LIDIA[code];
  if (!c) return null;
  const servicio = getServicio(c.servicioSlug);
  return { ...c, amountMinor: Math.round(servicio.precio * 100), currency: 'EUR' };
}

const TIPO_DOC_ENTRADA = { DNI: 'DNI', NIE: 'NIE', PASAPORTE: 'Pasaporte' };

// Prefill del contrato (§6.2) → campos del CheckoutForm. Todo lo no mapeable
// se omite: el cliente lo completa a mano. `direccion` llega como texto libre
// y es solo informativa (confirmación 1.0): no prellena el formulario.
export function mapearPrefill(prefill) {
  const p = prefill || {};
  const out = {};
  if (p.nombre) out.nombre = String(p.nombre);
  if (p.apellidos) out.apellidos = String(p.apellidos);
  if (p.email) out.email = String(p.email);
  const tipo = TIPO_DOC_ENTRADA[String(p.tipo_documento || '').toUpperCase()];
  if (tipo) out.tipoDocumento = tipo;
  if (p.num_documento) out.numDocumento = String(p.num_documento);
  const clave = claveDesdeISO(p.pais_canje);
  if (clave) out.paisCanje = clave;
  if (p.telefono) out.telefono = String(p.telefono);
  return out;
}
