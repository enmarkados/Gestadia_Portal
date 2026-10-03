import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';

/**
 * GestadiaDataVerification
 * Pantalla de Verificación de Datos y Envío Documental Postventa.
 *
 * Flujo legal postventa requerido por tu gestor:
 * 1. El cliente revisa y confirma sus datos personales y de permiso antes de la remisión a Tráfico.
 * 2. El cliente adjunta fotografías nítidas del permiso de origen y NIE/TIE.
 * 3. Se genera la autorización telemática para actuar ante la DGT en su nombre.
 */
export function GestadiaDataVerification({ onBack, onComplete }) {
  const [formData, setFormData] = useState({
    nombre: 'Gonzalo Villanova Alvarez',
    nie: '47307603F',
    telefono: '+34 684 46 09 71',
    email: 'gonzalovial20@gmail.com',
    pais: 'Perú',
    licencia: 'Q-74829104',
    categoria: 'B (Turismos hasta 3.500 kg)',
    fechaResidencia: '30/07/2026',
    direccion: 'Calle Paseo de la castellana 143, 2A, 28046 Madrid'
  });

  const [residenciaUploaded, setResidenciaUploaded] = useState(false);
  const [carnetUploaded, setCarnetUploaded] = useState(false);
  const [psicoUploaded, setPsicoUploaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '20px 16px', backgroundColor: '#FFFFFF', minHeight: '100%' }}>
      {/* Cabecera Interna */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {onBack && (
          <button
            type="button"
            className="gestadia-icon-btn"
            onClick={onBack}
            aria-label="Volver al chat del gestor"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#C0392B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Postventa DGT · GST-202607-97389
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2C2C2C', margin: '2px 0 0' }}>
            Verificación de Datos y Documentos
          </h1>
        </div>
      </div>

      {/* Tarjeta Informativa del Gestor */}
      <div
        style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: 14,
          padding: 14,
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start'
        }}
      >
        <ShieldCheck size={24} style={{ color: '#16A34A', flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ fontSize: 13.5, color: '#2C2C2C', display: 'block', marginBottom: 2 }}>
            Validación antes de la presentación del trámite.
          </strong>
          <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0, lineHeight: 1.45 }}>
            Para tramitar con éxito tu convalidación en Tráfico sin incidencias, comprueba que los datos coinciden milimétricamente con tus documentos oficiales.
          </p>
        </div>
      </div>

      {/* Paso 1: Ficha de Datos Personales */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2C2C2C', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#2C2C2C', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>1</span>
          Revisión de datos del conductor
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>Nombre y Apellidos</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 15, color: '#2C2C2C' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>DNI / NIE / TIE</label>
              <input
                type="text"
                value={formData.nie}
                onChange={(e) => setFormData({ ...formData, nie: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 15, color: '#2C2C2C' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>País del Permiso</label>
              <input
                type="text"
                value={formData.pais}
                disabled
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F3F4F6', fontSize: 15, color: '#6B7280' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>Teléfono de contacto</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 15, color: '#2C2C2C' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>Correo Electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 15, color: '#2C2C2C' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>Nº Licencia Origen</label>
              <input
                type="text"
                value={formData.licencia}
                onChange={(e) => setFormData({ ...formData, licencia: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 15, color: '#2C2C2C' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>Categoría a Canjear</label>
              <input
                type="text"
                value={formData.categoria}
                disabled
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#F3F4F6', fontSize: 15, color: '#6B7280' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>Dirección de entrega carnet definitivo (FNMT)</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 15, color: '#2C2C2C' }}
            />
          </div>
        </div>
      </div>

      {/* Paso 2: Subida Documental */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2C2C2C', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#2C2C2C', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>2</span>
          Adjuntar documentación requerida por DGT
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Doc 1: Residencia legal */}
          <div
            style={{
              border: `1.5px dashed ${residenciaUploaded ? '#16A34A' : '#D1D5DB'}`,
              backgroundColor: residenciaUploaded ? '#F0FDF4' : '#FAFAFA',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: residenciaUploaded ? '#DCFCE7' : '#FDEDEC',
                  color: residenciaUploaded ? '#16A34A' : '#C0392B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Upload size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#2C2C2C', margin: 0 }}>
                  Documento de residencia legal en España
                </h3>
                <span style={{ fontSize: 11.5, color: residenciaUploaded ? '#16A34A' : '#6B7280', display: 'block', marginTop: 2 }}>
                  {residenciaUploaded ? '✓ Residencia adjuntada (PDF o JPG, max 10MB)' : 'DNI español, tarjeta de residencia, tarjeta roja o resguardo'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setResidenciaUploaded(!residenciaUploaded)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                backgroundColor: residenciaUploaded ? '#E5E7EB' : '#2C2C2C',
                color: residenciaUploaded ? '#374151' : '#FFFFFF',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {residenciaUploaded ? 'Cambiar' : 'Subir archivo'}
            </button>
          </div>

          {/* Doc 2: Permiso extranjero */}
          <div
            style={{
              border: `1.5px dashed ${carnetUploaded ? '#16A34A' : '#D1D5DB'}`,
              backgroundColor: carnetUploaded ? '#F0FDF4' : '#FAFAFA',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: carnetUploaded ? '#DCFCE7' : '#FDEDEC',
                  color: carnetUploaded ? '#16A34A' : '#C0392B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Camera size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#2C2C2C', margin: 0 }}>
                  Permiso de conducir extranjero original en vigor
                </h3>
                <span style={{ fontSize: 11.5, color: carnetUploaded ? '#16A34A' : '#6B7280', display: 'block', marginTop: 2 }}>
                  {carnetUploaded ? '✓ Ambas caras adjuntadas correctamente' : 'Fotografía nítida de ambas caras (sin reflejos)'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCarnetUploaded(!carnetUploaded)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                backgroundColor: carnetUploaded ? '#E5E7EB' : '#2C2C2C',
                color: carnetUploaded ? '#374151' : '#FFFFFF',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {carnetUploaded ? 'Cambiar' : 'Hacer foto'}
            </button>
          </div>

          {/* Doc 3: Examen psicotécnico */}
          <div
            style={{
              border: `1.5px dashed ${psicoUploaded ? '#16A34A' : '#D1D5DB'}`,
              backgroundColor: psicoUploaded ? '#F0FDF4' : '#FAFAFA',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: psicoUploaded ? '#DCFCE7' : '#FDEDEC',
                  color: psicoUploaded ? '#16A34A' : '#C0392B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#2C2C2C', margin: 0 }}>
                  Examen psicotécnico
                </h3>
                <span style={{ fontSize: 11.5, color: psicoUploaded ? '#16A34A' : '#6B7280', display: 'block', marginTop: 2 }}>
                  {psicoUploaded ? '✓ Informe psicotécnico validado' : 'Emitido por un centro de reconocimiento de conductores'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPsicoUploaded(!psicoUploaded)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                backgroundColor: psicoUploaded ? '#E5E7EB' : '#2C2C2C',
                color: psicoUploaded ? '#374151' : '#FFFFFF',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {psicoUploaded ? 'Cambiar' : 'Subir archivo'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmación Final */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151', lineHeight: 1.45 }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: '#C0392B', marginTop: 2 }}
          />
          <span>
            Declaro bajo mi responsabilidad que los datos proporcionados son verídicos y autorizo a Gestadia a tramitar telemáticamente el canje ante la DGT.
          </span>
        </label>
      </div>

      {/* Botón de Envío */}
      <button
        type="button"
        disabled={!confirmed}
        onClick={() => {
          if (onComplete) onComplete();
          else alert('¡Datos y documentos enviados con éxito a tu gestor!');
        }}
        className="gestadia-user-primary red-variant"
        style={{ width: '100%', opacity: confirmed ? 1 : 0.5, cursor: confirmed ? 'pointer' : 'not-allowed' }}
      >
        Validar y Enviar
      </button>
    </div>
  );
}

export default GestadiaDataVerification;
