// Integración LidIA (contrato 1.0: docs/integraciones/2026-07-28-contrato-lidia-portal-v1-0.md)
import { getServicio } from '../catalog.js';

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
