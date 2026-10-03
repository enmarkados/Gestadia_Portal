import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Phone,
  FileCheck,
  Download,
  Send,
  Mic,
  UserCheck,
  ChevronLeft
} from 'lucide-react';

/**
 * GestadiaGestorChat
 * Conversación directa con el Gestor Asignado.
 *
 * Requisitos de diseño estrictos:
 * 1. Cabecera limpia y minimalista:
 *    - Botón de volver (ChevronLeft)
 *    - Título centrado: "Habla con tu gestor"
 *    - Icono de llamada telefónica (Phone)
 * 2. Conversación mediante burbujas de chat diferenciadas por color:
 *    - Mensajes del Gestor: Negro / Grafito (#2C2C2C) con tipografía blanca.
 *    - Mensajes del Usuario: Rojo (#C0392B) con tipografía blanca.
 * 3. Hitos del trámite integrados en el hilo:
 *    - Subida de documentación obligatoria.
 *    - Ficha de verificación de datos del conductor.
 *    - Entrega del Justificante Provisional oficial con CSV de la DGT.
 */
export function GestadiaGestorChat({
  expedienteId = 'GST-202607-97389',
  onBack,
  onCallClick,
  onVerifyDataClick
}) {
  const [dataConfirmed, setDataConfirmed] = useState(false);
  const [doc1Uploaded, setDoc1Uploaded] = useState(false);
  const [doc2Uploaded, setDoc2Uploaded] = useState(false);
  const [doc3Uploaded, setDoc3Uploaded] = useState(false);
  const [inputText, setInputText] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F7F7F7' }}>
      {/* Cabecera Exclusiva: Volver · Habla con tu gestor · Llamada */}
      <header
        style={{
          backgroundColor: '#181818',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}
      >
        <button
          type="button"
          className="gestadia-icon-btn"
          onClick={onBack || (() => window.history.back())}
          aria-label="Volver atrás"
          style={{
            width: 36,
            height: 36,
            color: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <h1
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
            textAlign: 'center',
            flex: 1
          }}
        >
          Habla con tu gestor
        </h1>

        <button
          type="button"
          className="gestadia-icon-btn"
          onClick={
            onCallClick ||
            (() =>
              alert(
                'Solicitando llamada telefónica con tu gestor a tu móvil (+34 684 46 09 71)...'
              ))
          }
          aria-label="Llamar al gestor"
          title="Solicitar llamada"
          style={{
            width: 36,
            height: 36,
            color: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Phone size={18} />
        </button>
      </header>

      {/* Flujo de Conversación por Burbujas (Gestor: Negro · Usuario: Rojo) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        {/* Distintivo de estado del trámite */}
        <div style={{ textAlign: 'center', margin: '2px 0 6px' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#4B5563',
              backgroundColor: '#E5E7EB',
              padding: '3px 10px',
              borderRadius: 12,
              display: 'inline-block'
            }}
          >
            ✓ Expediente {expedienteId} · Juan Carlos Acero asignado
          </span>
        </div>

        {/* Burbuja 1: Gestor (Negro #2C2C2C) */}
        <div
          style={{
            maxWidth: '85%',
            backgroundColor: '#2C2C2C',
            color: '#FFFFFF',
            borderRadius: '16px 16px 16px 4px',
            padding: '12px 14px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
            alignSelf: 'flex-start'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
              fontSize: 11,
              color: '#D1D5DB'
            }}
          >
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Juan Carlos Acero</span>
            <span>10:15</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.45, margin: 0, color: '#F3F4F6' }}>
            ¡Hola Gonzalo! Soy Juan Carlos, tu gestor asignado en Gestadia. Ya he recibido el abono de tu
            trámite de <strong>Canje de Carnet (Perú)</strong> y estamos preparando la solicitud telemática
            para la DGT.
          </p>
        </div>

        {/* Burbuja 2: Usuario (Rojo #C0392B) */}
        <div
          style={{
            maxWidth: '82%',
            backgroundColor: '#C0392B',
            color: '#FFFFFF',
            borderRadius: '16px 16px 4px 16px',
            padding: '12px 14px',
            boxShadow: '0 2px 6px rgba(192, 57, 43, 0.15)',
            alignSelf: 'flex-end'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.85)'
            }}
          >
            <span style={{ fontWeight: 700 }}>Tú</span>
            <span>10:16</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.45, margin: 0 }}>
            ¡Hola Juan Carlos! Perfecto, ¿qué documentación necesitas que te aporte para tramitarlo?
          </p>
        </div>

        {/* Burbuja 3: Gestor (Negro #2C2C2C) con tarjeta de subida de documentación */}
        <div
          style={{
            maxWidth: '88%',
            backgroundColor: '#2C2C2C',
            color: '#FFFFFF',
            borderRadius: '16px 16px 16px 4px',
            padding: '12px 14px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
            alignSelf: 'flex-start'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              fontSize: 11,
              color: '#D1D5DB'
            }}
          >
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Juan Carlos Acero</span>
            <span>10:17</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.45, margin: '0 0 10px', color: '#F3F4F6' }}>
            Necesito que subas estos <strong>3 documentos obligatorios</strong> para validar el convenio
            con las autoridades de Perú:
          </p>

          <div
            style={{
              backgroundColor: '#1E1E1E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 10,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            {/* Documento 1 */}
            <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} style={{ color: doc1Uploaded ? '#16A34A' : '#C0392B' }} />
                <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600 }}>1. Residencia legal (DNI/TIE)</span>
              </div>
              <button
                type="button"
                onClick={() => setDoc1Uploaded(!doc1Uploaded)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  backgroundColor: doc1Uploaded ? '#374151' : '#C0392B',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {doc1Uploaded ? 'Subido ✓' : 'Subir'}
              </button>
            </div>

            {/* Documento 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCheck size={16} style={{ color: doc2Uploaded ? '#16A34A' : '#C0392B' }} />
                <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600 }}>2. Permiso original Perú</span>
              </div>
              <button
                type="button"
                onClick={() => setDoc2Uploaded(!doc2Uploaded)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  backgroundColor: doc2Uploaded ? '#374151' : '#C0392B',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {doc2Uploaded ? 'Subido ✓' : 'Subir'}
              </button>
            </div>

            {/* Documento 3 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} style={{ color: doc3Uploaded ? '#16A34A' : '#C0392B' }} />
                <span style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600 }}>3. Psicotécnico oficial</span>
              </div>
              <button
                type="button"
                onClick={() => setDoc3Uploaded(!doc3Uploaded)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  backgroundColor: doc3Uploaded ? '#374151' : '#C0392B',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {doc3Uploaded ? 'Subido ✓' : 'Subir'}
              </button>
            </div>
          </div>
        </div>

        {/* Burbuja 4: Usuario (Rojo #C0392B) */}
        <div
          style={{
            maxWidth: '82%',
            backgroundColor: '#C0392B',
            color: '#FFFFFF',
            borderRadius: '16px 16px 4px 16px',
            padding: '12px 14px',
            boxShadow: '0 2px 6px rgba(192, 57, 43, 0.15)',
            alignSelf: 'flex-end'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.85)'
            }}
          >
            <span style={{ fontWeight: 700 }}>Tú</span>
            <span>10:19</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.45, margin: 0 }}>
            Ya he subido los 3 documentos requeridos y verificado la dirección en Paseo de la Castellana.
          </p>
        </div>

        {/* Burbuja 5: Gestor (Negro #2C2C2C) con Validación y Permiso Provisional */}
        <div
          style={{
            maxWidth: '88%',
            backgroundColor: '#2C2C2C',
            color: '#FFFFFF',
            borderRadius: '16px 16px 16px 4px',
            padding: '12px 14px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
            alignSelf: 'flex-start'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              fontSize: 11,
              color: '#D1D5DB'
            }}
          >
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Juan Carlos Acero</span>
            <span>10:21</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.45, margin: '0 0 10px', color: '#F3F4F6' }}>
            ¡Excelente Gonzalo! Todo verificado y firmado digitalmente. Aquí tienes tu{' '}
            <strong>Autorización Provisional para Conducir oficial con CSV</strong> de la DGT para
            conducir legalmente desde hoy mismo:
          </p>

          <button
            type="button"
            onClick={() =>
              alert('Descargando Permiso Provisional Oficial DGT (PDF con CSV de la DGT)...')
            }
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              backgroundColor: '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>Descargar Justificante Provisional (PDF)</span>
          </button>
        </div>
      </div>

      {/* Barra de Entrada / Compositor para escribir al Gestor */}
      <div style={{ padding: '0 16px 12px', backgroundColor: '#F7F7F7', borderTop: '1px solid #E5E7EB' }}>
        <div className="gestadia-user-chat-input" style={{ marginTop: 8 }}>
          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="¿Qué necesitas?"
            style={{ fontSize: 16 }}
          />
          <button
            type="button"
            className="gestadia-mic-btn"
            title="Enviar nota de voz a tu gestor"
            onClick={() => alert('Grabando nota de voz para tu Gestor...')}
          >
            <Mic size={20} />
          </button>
          <button
            type="button"
            className="gestadia-send-btn"
            title="Enviar mensaje"
            onClick={() => {
              if (inputText.trim()) {
                setInputText('');
                alert('Mensaje enviado a tu gestor.');
              }
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GestadiaGestorChat;
