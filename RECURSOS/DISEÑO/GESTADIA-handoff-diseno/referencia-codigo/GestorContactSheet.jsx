import React, { useState } from 'react';
import { MessageSquare, PhoneCall, CheckCircle2 } from 'lucide-react';
import { BottomSheet } from './BottomSheet';

/**
 * GestorContactSheet
 * Formulario de contacto con un gestor:
 * - Si es Contacto con Trato en Zoho (cliente activo): Muestra botón negro "Abrir Chat en la App con Juan Carlos" (gestor asignado) + opción de llamada.
 * - Si es Lead en Zoho: Solo muestra la opción de solicitar llamada telefónica directa (no tiene gestor asignado aún).
 * - Confirmación inmediata sin recarga de página ni derivación a canales externos.
 */
export function GestorContactSheet({ onClose, onOpenChat, hasAssignedGestor = true }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tramite, setTramite] = useState('canje-carnet');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) return;
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      setEnviado(true);
    }, 700);
  }

  return (
    <BottomSheet onClose={onClose}>
      {enviado ? (
        <div style={{ textAlign: 'center', padding: '24px 8px 16px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#2C2C2C', marginBottom: 8 }}>
            Solicitud Recibida
          </h2>
          <p style={{ fontSize: 14.5, color: '#6B7280', lineHeight: 1.5, marginBottom: 20 }}>
            Un gestor de Gestadia se pondrá en contacto contigo en el teléfono{' '}
            <strong>{telefono}</strong> en un plazo inferior a 15 minutos en horario laboral.
          </p>
          <button
            type="button"
            className="gestadia-user-primary"
            style={{ width: '100%' }}
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: '#2C2C2C', marginBottom: 4 }}>
              Hablar con un gestor
            </h2>
            <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.4 }}>
              {hasAssignedGestor
                ? 'Atención directa en la app con tu gestor asignado sin esperas ni desplazamientos.'
                : 'Solicita llamada de asesoramiento con un gestor sin compromiso.'}
            </p>
          </div>

          {/* Botón Chatear en la App (Exclusivo si ya tiene gestor asignado en Zoho) */}
          {hasAssignedGestor && onOpenChat && (
            <>
              <button
                type="button"
                className="gestadia-user-primary"
                style={{ width: '100%', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => {
                  onClose();
                  onOpenChat();
                }}
              >
                <MessageSquare size={18} />
                <span>Abrir Chat en la App con Juan Carlos</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                <span style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  o solicita que te llamemos
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Nombre y apellidos *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Carmen Ortiz"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 12,
                border: '1px solid #D1D5DB',
                fontSize: 16,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Teléfono de contacto *
            </label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+34 600 000 000"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 12,
                border: '1px solid #D1D5DB',
                fontSize: 16,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Trámite sobre el que necesitas ayuda
            </label>
            <select
              value={tramite}
              onChange={(e) => setTramite(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 12,
                border: '1px solid #D1D5DB',
                fontSize: 16,
                backgroundColor: 'white',
                outline: 'none'
              }}
            >
              <option value="canje-carnet">Canje de carnet extranjero</option>
              <option value="transferencia">Transferencia de vehículo</option>
              <option value="duplicado-carnet">Duplicado de carnet de conducir</option>
              <option value="duplicado-circulacion">Duplicado de permiso de circulación</option>
              <option value="baja-vehiculo">Baja de vehículo</option>
              <option value="cancelacion-dominio">Cancelación de reserva de dominio</option>
              <option value="otro">Otro trámite o consulta DGT</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              ¿Qué ocurre? (opcional)
            </label>
            <textarea
              rows={3}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Explica brevemente tu caso o duda particular..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #D1D5DB',
                fontSize: 16,
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={cargando || !nombre.trim() || !telefono.trim()}
            className="gestadia-user-primary red-variant"
            style={{ width: '100%', marginTop: 4 }}
          >
            <PhoneCall size={18} />
            <span>{cargando ? 'Enviando solicitud...' : 'Solicitar llamada de un gestor'}</span>
          </button>
        </form>
      )}
    </BottomSheet>
  );
}
export default GestorContactSheet;
