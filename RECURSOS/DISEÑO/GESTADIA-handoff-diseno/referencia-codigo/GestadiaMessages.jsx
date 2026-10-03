import React, { useState } from 'react';
import { Sparkles, Plus, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { GestorContactSheet } from './GestorContactSheet';

/**
 * GestadiaMessages
 * Centro de Comunicaciones unificado de Gestadia:
 * - Visibilidad clara de los hilos de mensajes activos.
 * - Hilo con Juan Carlos Acero (Gestor asignado DGT · Postventa).
 * - Hilo con LidIA (Asistente IA de Sondeo y Diagnóstico · Preventa).
 * - Botón para iniciar nueva consulta con LidIA.
 * - Botón inferior ergonómico "Hablar con un gestor" integrado con Zoho CRM.
 */
export function GestadiaMessages({
  onSelectThread,
  onNewChat,
  hasAssignedGestor = true,
  expedienteId = 'GST-202607-97389'
}) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '20px 16px' }}>
      {/* Cabecera del Centro de Comunicaciones */}
      <div style={{ marginBottom: 18 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#C0392B',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          Centro de Comunicaciones
        </span>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#2C2C2C',
            margin: '4px 0 6px'
          }}
        >
          Mensajes
        </h1>
        <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.45 }}>
          Tus conversaciones en curso con tu gestor asignado y el asistente inteligente LidIA.
        </p>
      </div>

      {/* Tarjeta de Acción Rápida: Nueva consulta con LidIA */}
      <div
        role="button"
        tabIndex={0}
        onClick={onNewChat}
        onKeyDown={(e) => e.key === 'Enter' && onNewChat && onNewChat()}
        className="gestadia-card"
        style={{
          padding: '14px 16px',
          marginBottom: 18,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: '4px solid #C0392B',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#FDEDEC',
              color: '#C0392B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <strong style={{ fontSize: 14.5, color: '#2C2C2C', display: 'block' }}>
              Nueva consulta con LidIA
            </strong>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              Diagnóstico de requisitos y presupuesto DGT en 1 minuto
            </span>
          </div>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            color: '#C0392B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800
          }}
        >
          <Plus size={16} />
        </div>
      </div>

      {/* Lista de Conversaciones Activas */}
      <h2
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#374151',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}
      >
        Conversaciones activas
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {/* Hilo 1: Juan Carlos Acero (Gestor Asignado) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectThread && onSelectThread('gestor')}
          onKeyDown={(e) => e.key === 'Enter' && onSelectThread && onSelectThread('gestor')}
          className="gestadia-card"
          style={{
            padding: '16px',
            cursor: 'pointer',
            borderLeft: '4px solid #2C2C2C',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'transform 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: '#2C2C2C',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 15
                  }}
                >
                  JA
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 11,
                    height: 11,
                    backgroundColor: '#16A34A',
                    border: '2px solid #FFFFFF',
                    borderRadius: '50%'
                  }}
                  title="Gestor conectado"
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ fontSize: 15, color: '#2C2C2C' }}>Juan Carlos Acero</strong>
                </div>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  Exp. {expedienteId} · Canje Perú
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11.5, color: '#9CA3AF', display: 'block' }}>10:21</span>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  backgroundColor: '#C0392B',
                  borderRadius: '50%',
                  marginTop: 6
                }}
              />
            </div>
          </div>

          <p
            style={{
              fontSize: 13.5,
              color: '#4B5563',
              margin: '6px 0 0',
              lineHeight: 1.45,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            <strong>Juan Carlos:</strong> ¡Excelente Gonzalo! Todo verificado. Te adjunto tu Autorización Provisional con CSV...
          </p>
        </div>

        {/* Hilo 2: LidIA (Asistente Inteligente Gestadia) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectThread && onSelectThread('asistente')}
          onKeyDown={(e) => e.key === 'Enter' && onSelectThread && onSelectThread('asistente')}
          className="gestadia-card"
          style={{
            padding: '16px',
            cursor: 'pointer',
            borderLeft: '4px solid #C0392B',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#FDEDEC',
                  color: '#C0392B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16
                }}
              >
                <Sparkles size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ fontSize: 15, color: '#2C2C2C' }}>LidIA</strong>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      backgroundColor: '#FDEDEC',
                      color: '#C0392B',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}
                  >
                    IA Gestadia
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  Sondeo y Diagnóstico Previo DGT
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>09:45</span>
            </div>
          </div>

          <p
            style={{
              fontSize: 13.5,
              color: '#4B5563',
              margin: '6px 0 0',
              lineHeight: 1.45,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            <strong>LidIA:</strong> ¿Qué trámite de Tráfico necesitas gestionar hoy?
          </p>
        </div>
      </div>

      {/* Botón Flotante / Acceso para Hablar con un Gestor */}
      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="gestadia-user-primary red-variant"
          style={{ width: '100%' }}
          onClick={() => setIsContactOpen(true)}
        >
          Hablar con un gestor
        </button>
      </div>

      {/* Hoja Inferior de Contacto (Zoho CRM Lead vs Cliente) */}
      {isContactOpen && (
        <GestorContactSheet
          hasAssignedGestor={hasAssignedGestor}
          onClose={() => setIsContactOpen(false)}
          onOpenChat={() => onSelectThread && onSelectThread('gestor')}
        />
      )}
    </div>
  );
}

export default GestadiaMessages;
