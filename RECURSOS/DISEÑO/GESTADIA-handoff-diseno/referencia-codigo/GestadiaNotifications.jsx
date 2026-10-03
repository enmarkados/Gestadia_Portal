import React, { useState } from 'react';
import {
  Bell,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  FileText,
  Download,
  Filter
} from 'lucide-react';

/**
 * GestadiaNotifications
 * Centro de Notificaciones y Avisos de Trámites DGT.
 *
 * Sustituye a la antigua sección de utilidades para concentrar el valor en:
 * 1. Peticiones de datos y documentos emitidas por tu gestor.
 * 2. Estado de emisión de autorizaciones provisionales y carnet físico.
 * 3. Avisos preventivos sobre vencimiento del plazo de 6 meses para conducir legalmente.
 */
export function GestadiaNotifications({ onSelectNotification, userProfileType = 'cliente' }) {
  const isLead = userProfileType === 'lead';
  const [filter, setFilter] = useState('todas');

  const NOTIFICACIONES_MOCK = [
    {
      id: 'NOTIF-01',
      tipo: 'accion',
      icono: AlertCircle,
      iconoColor: '#C0392B',
      iconoBg: '#FDEDEC',
      badge: 'Requerimiento activo',
      badgeClass: 'badge-pendiente',
      titulo: 'Actualización de tu expediente GST-202607-97389',
      mensaje: 'Sube la documentación necesaria desde tu área de cliente para que podamos empezar (DNI/TIE, carnet Perú y psicotécnico).',
      expediente: 'GST-202607-97389 · Canje Perú',
      fecha: '30 jul, 08:21',
      accionLabel: 'Subir documentos ahora',
      targetScreen: '04-chat-gestor'
    },
    {
      id: 'NOTIF-02',
      tipo: 'documento',
      icono: FileText,
      iconoColor: '#1F1F1F',
      iconoBg: '#F3F4F6',
      badge: 'Cotejo documental',
      badgeClass: 'badge-tramite',
      titulo: 'Fotos de carnet recibidas correctamente',
      mensaje: 'Hemos recibido la copia de tu carnet original por ambas caras. El gestor ha verificado la legibilidad.',
      expediente: 'EXP-2026-8941 · Canje Colombia',
      fecha: 'Hoy, 10:24',
      accionLabel: 'Ver expediente',
      targetScreen: '03-mis-tramites'
    },
    {
      id: 'NOTIF-03',
      tipo: 'exito',
      icono: CheckCircle2,
      iconoColor: '#16A34A',
      iconoBg: '#DCFCE7',
      badge: 'Listo para circular',
      badgeClass: 'badge-completado',
      titulo: 'Permiso Provisional Oficial con CSV emitido',
      mensaje: 'Tu autorización temporal de conducción ya está firmada y cotejada con la DGT. Puedes conducir legalmente desde hoy.',
      expediente: 'EXP-2026-8812 · Transferencia Seat León',
      fecha: 'Ayer, 18:30',
      accionLabel: 'Descargar justificante',
      targetScreen: '04-chat-gestor'
    },
    {
      id: 'NOTIF-04',
      tipo: 'aviso',
      icono: Clock,
      iconoColor: '#D97706',
      iconoBg: '#FEF3C7',
      badge: 'Aviso preventivo',
      badgeClass: 'badge-tramite',
      titulo: 'Cuenta atrás: 32 días de plazo de conducción legal',
      mensaje: 'Recuerda que la ley permite circular con carnet extracomunitario un máximo de 6 meses desde la obtención del NIE/TIE.',
      expediente: 'Aviso Legal DGT',
      fecha: '28 Sep',
      accionLabel: 'Consultar normativa',
      targetScreen: '01-inicio'
    }
  ];

  const filtered = NOTIFICACIONES_MOCK.filter((n) => {
    if (filter === 'accion') return n.tipo === 'accion';
    if (filter === 'expediente') return n.tipo === 'documento' || n.tipo === 'exito';
    if (filter === 'avisos') return n.tipo === 'aviso';
    return true;
  });

  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#2C2C2C', margin: 0 }}>
          Notificaciones y Avisos
        </h1>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            backgroundColor: isLead ? '#DCFCE7' : '#FDEDEC',
            color: isLead ? '#16A34A' : '#C0392B',
            padding: '3px 8px',
            borderRadius: 12
          }}
        >
          {isLead ? 'Estás al día' : '1 nueva'}
        </span>
      </div>
      <p style={{ fontSize: 14.5, color: '#6B7280', marginBottom: 18 }}>
        {isLead ? 'Avisos y novedades sobre tus expedientes y trámites DGT.' : 'Requerimientos de tu gestor, estado de tus documentos y alertas de Tráfico.'}
      </p>

      {isLead ? (
        <div className="gestadia-card" style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <CheckCircle2 size={28} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#2C2C2C', marginBottom: 6 }}>Estás al día</h2>
          <p style={{ fontSize: 13.5, color: '#6B7280', maxWidth: 360, margin: '0 auto 16px', lineHeight: 1.5 }}>
            No tienes notificaciones pendientes. Cuando inicies un trámite con nosotros, aquí verás las actualizaciones y requerimientos de tu expediente.
          </p>
        </div>
      ) : (
        <>
          {/* Píldoras de Filtro */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => setFilter('todas')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                border: filter === 'todas' ? '1.5px solid #2C2C2C' : '1px solid #D1D5DB',
                backgroundColor: filter === 'todas' ? '#2C2C2C' : '#FFFFFF',
                color: filter === 'todas' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilter('accion')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                border: filter === 'accion' ? '1.5px solid #C0392B' : '1px solid #D1D5DB',
                backgroundColor: filter === 'accion' ? '#FDEDEC' : '#FFFFFF',
                color: filter === 'accion' ? '#C0392B' : '#374151',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Acción requerida (1)
            </button>
            <button
              type="button"
              onClick={() => setFilter('expediente')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                border: filter === 'expediente' ? '1.5px solid #2C2C2C' : '1px solid #D1D5DB',
                backgroundColor: filter === 'expediente' ? '#2C2C2C' : '#FFFFFF',
                color: filter === 'expediente' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Expedientes
            </button>
            <button
              type="button"
              onClick={() => setFilter('avisos')}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                border: filter === 'avisos' ? '1.5px solid #2C2C2C' : '1px solid #D1D5DB',
                backgroundColor: filter === 'avisos' ? '#2C2C2C' : '#FFFFFF',
                color: filter === 'avisos' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Avisos DGT
            </button>
          </div>

          {/* Listado de Notificaciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((item) => {
              const IconComponent = item.icono;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectNotification && onSelectNotification(item)}
                  className="gestadia-card"
                  style={{
                    cursor: 'pointer',
                    borderLeft: item.tipo === 'accion' ? '4px solid #C0392B' : '1px solid #E5E7EB',
                    display: 'flex',
                    gap: 14,
                    padding: '16px'
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: item.iconoBg,
                      color: item.iconoColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <IconComponent size={22} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className={`gestadia-badge ${item.badgeClass}`}>{item.badge}</span>
                      <span style={{ fontSize: 12, color: '#9CA3AF' }}>{item.fecha}</span>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2C2C2C', margin: '0 0 4px', lineHeight: 1.3 }}>
                      {item.titulo}
                    </h3>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 8px', lineHeight: 1.45 }}>
                      {item.mensaje}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#9CA3AF' }}>
                        {item.expediente}
                      </span>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: item.tipo === 'accion' ? '#C0392B' : '#2C2C2C',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {item.accionLabel}
                        <ChevronRight size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default GestadiaNotifications;
