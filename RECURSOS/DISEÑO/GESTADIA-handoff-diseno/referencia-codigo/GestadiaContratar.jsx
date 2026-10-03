import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ChevronRight, Lock, ArrowRight, FileText, CreditCard } from 'lucide-react';

const SERVICIOS_GESTADIA = [
  {
    id: 'canje-carnet',
    nombre: 'Canje de Carnet Extranjero',
    precio: '210 €',
    descripcion: 'Homologación de tu permiso de conducir en España bajo convenio bilateral. Gestión 100% telemática sin cita previa.',
    plazo: 'Gestión urgente',
    incluye: ['Validación previa de convenio', 'Presentación oficial telemática', 'Seguimiento por tu gestor asignado']
  },
  {
    id: 'transferencia',
    nombre: 'Transferencia de Vehículo',
    precio: '135 €',
    descripcion: 'Cambio de titularidad de automóvil o moto. Liquidación telemática y permiso provisional oficial inmediato.',
    plazo: 'Provisional en 24h',
    incluye: ['Contrato compraventa verificado', 'Liquidación ITP telemática', 'Permiso provisional con CSV DGT']
  },
  {
    id: 'duplicado-carnet',
    nombre: 'Duplicado de Carnet de Conducir',
    precio: '59 €',
    descripcion: 'Reexpedición urgente de tu carnet de conducir por pérdida, robo o deterioro físico con envío a tu domicilio.',
    plazo: 'Autorización inmediata',
    incluye: ['Gestión telemática ante DGT', 'Autorización provisional para conducir', 'Envío a domicilio incluido']
  },
  {
    id: 'duplicado-circulacion',
    nombre: 'Duplicado Permiso de Circulación',
    precio: '59 €',
    descripcion: 'Nuevo permiso de circulación original para tu vehículo ante extravío, sustracción o deterioro.',
    plazo: '24/48 horas',
    incluye: ['Trámite telemático oficial', 'Justificante profesional DGT', 'Envío del documento a tu domicilio']
  },
  {
    id: 'permiso-internacional',
    nombre: 'Permiso Internacional de Conducir',
    precio: '69 €',
    descripcion: 'Permiso oficial para conducir legalmente en más de 150 países fuera de la Unión Europea.',
    plazo: 'Expedición 48h',
    incluye: ['Vigencia oficial internacional', 'Gestión sin cita previa', 'Envío urgente']
  },
  {
    id: 'baja-vehiculo',
    nombre: 'Baja de Vehículo (Temporal / Definitiva)',
    precio: '65 €',
    descripcion: 'Trámite telemático de retirada temporal o definitiva de circulación con certificado oficial de Tráfico.',
    plazo: 'En el día',
    incluye: ['Certificado oficial de baja DGT', 'Exención del impuesto municipal (IVTM)', 'Sin acudir a Jefatura']
  },
  {
    id: 'cancelacion-dominio',
    nombre: 'Cancelación de Reserva de Dominio',
    precio: '110 €',
    descripcion: 'Alzamiento registral de carga financiera en el Registro de Bienes Muebles para poder vender o transferir.',
    plazo: 'Gestión completa',
    incluye: ['Tramitación ante Registro RBM', 'Levantamiento telemático de carga', 'Verificación final ante la DGT']
  }
];

export function GestadiaContratar({ onCompleteCheckout }) {
  const [selectedService, setSelectedService] = useState(SERVICIOS_GESTADIA[0]);
  const [step, setStep] = useState(1); // 1: Selección, 2: Datos
  const [nombre, setNombre] = useState('Gonzalo Villanova Alvarez');
  const [identificacion, setIdentificacion] = useState('47307603F');
  const [telefono, setTelefono] = useState('+34 684 46 09 71');
  const [email, setEmail] = useState('gonzalovial20@gmail.com');

  function handleProceedToWeb(e) {
    if (e && e.preventDefault) e.preventDefault();
    let nombrePropio = nombre.trim();
    let apellidos = '';
    if (nombrePropio.includes(' ')) {
      const parts = nombrePropio.split(/\s+/);
      nombrePropio = parts[0];
      apellidos = parts.slice(1).join(' ');
    }
    const cleanDoc = identificacion.trim().toUpperCase();
    const tipoDoc = /^[XYZ]/i.test(cleanDoc) ? 'NIE' : 'DNI';
    const cleanTel = telefono.replace(/\s+/g, '');

    const params = new URLSearchParams({
      servicio: selectedService.id,
      nombre: nombrePropio,
      apellidos: apellidos,
      email: email.trim(),
      telefono: cleanTel,
      numDocumento: cleanDoc,
      dni: cleanDoc,
      tipoDocumento: tipoDoc,
      procedencia: 'lidia'
    });
    if (selectedService.id === 'canje-carnet') {
      params.set('paisCanje', 'peru');
    }
    const checkoutUrl = `https://gestadia.com/checkout?${params.toString()}`;
    if (typeof window !== 'undefined') {
      window.open(checkoutUrl, '_blank');
    }
    if (onCompleteCheckout) onCompleteCheckout(selectedService, checkoutUrl);
  }

  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '20px 16px' }}>
      {/* Cabecera del Catálogo de Trámites y Gestiones */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#C0392B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Gestión 100% Online
        </span>
        <h1 style={{ fontSize: 25, fontWeight: 800, color: '#2C2C2C', margin: '4px 0 6px' }}>
          Trámites y Gestiones DGT
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.45 }}>
          Servicio integral llave en mano gestionado por tu gestor asignado sin desplazamientos ni citas previas.
        </p>
      </div>

      {/* Barra de Garantías */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 14,
          padding: '12px 14px',
          marginBottom: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#2C2C2C' }}>
          <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
          <span>Sin cita previa DGT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#2C2C2C' }}>
          <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
          <span>Gestor DGT asignado</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: '#2C2C2C' }}>
          <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
          <span>Justificante Provisional DGT</span>
        </div>
      </div>

      {contratado ? (
        /* Pantalla de Éxito de Contratación */
        <div className="gestadia-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#2C2C2C', marginBottom: 8 }}>
            ¡Trámite Contratado con Éxito!
          </h2>
          <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.5, marginBottom: 16 }}>
            Hemos abierto tu expediente para <strong>{selectedService.nombre}</strong>. Tu gestor asignado revisará la documentación de inmediato.
          </p>
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px', marginBottom: 24 }}>
            <span style={{ fontSize: 12, color: '#6B7280', display: 'block' }}>Número de Expediente Asignado</span>
            <strong style={{ fontSize: 18, color: '#C0392B', letterSpacing: 0.5 }}>EXP-2026-9214</strong>
          </div>
          <button
            type="button"
            className="gestadia-user-primary"
            style={{ width: '100%' }}
            onClick={() => {
              setContratado(false);
              setStep(1);
            }}
          >
            Ver mis trámites en curso
          </button>
        </div>
      ) : step === 1 ? (
        /* Paso 1: Catálogo de Servicios */
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {SERVICIOS_GESTADIA.map((serv) => {
              const isSelected = selectedService.id === serv.id;
              return (
                <div
                  key={serv.id}
                  onClick={() => setSelectedService(serv)}
                  style={{
                    backgroundColor: 'white',
                    border: isSelected ? '2px solid #C0392B' : '1px solid #E5E7EB',
                    borderRadius: 16,
                    padding: '16px 18px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 12px rgba(192, 57, 43, 0.08)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <h3 style={{ fontSize: 16.5, fontWeight: 700, color: '#2C2C2C', marginBottom: 2 }}>
                        {serv.nombre}
                      </h3>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>
                        {serv.plazo}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#C0392B' }}>
                        {serv.precio}
                      </span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', display: 'block' }}>todo incluido</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.45, marginBottom: 12 }}>
                    {serv.descripcion}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {serv.incluye.map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          fontSize: 11.5,
                          fontWeight: 500,
                          padding: '3px 8px',
                          borderRadius: 6
                        }}
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón Siguiente Paso */}
          <div style={{ position: 'sticky', bottom: 74, zIndex: 10, background: '#F7F7F7', paddingTop: 8 }}>
            <button
              type="button"
              className="gestadia-user-primary red-variant"
              style={{ width: '100%' }}
              onClick={() => setStep(2)}
            >
              <span>Contratar {selectedService.nombre} · {selectedService.precio}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* Paso 2: Datos del Titular y Pasarela Web */
        <form onSubmit={handleProceedToWeb} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="gestadia-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Servicio seleccionado</span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#2C2C2C' }}>{selectedService.nombre}</h3>
              </div>
              <strong style={{ fontSize: 22, color: '#C0392B', fontWeight: 800 }}>{selectedService.precio}</strong>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}
            >
              Cambiar servicio
            </button>
          </div>

          <div className="gestadia-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#2C2C2C' }}>Datos del Solicitante</h3>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre y dos apellidos"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: 16 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                DNI / NIE o Pasaporte *
              </label>
              <input
                type="text"
                required
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                placeholder="Ej. Y1234567X o 12345678Z"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: 16 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                Teléfono móvil (para avisos SMS y llamadas de tu gestor) *
              </label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+34 600 000 000"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: 16 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                Correo electrónico (para envío de justificante provisional) *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: 16 }}
              />
            </div>
          </div>

          {/* Bloque de Redirección Web Oficial */}
          <div className="gestadia-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Lock size={18} style={{ color: '#16A34A' }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#2C2C2C' }}>Pasarela Oficial en Gestadia.com</h3>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.45, marginBottom: 14 }}>
              Al continuar se abrirá la pasarela oficial de Gestadia con tus datos precompletados para formalizar el trámite de forma segura.
            </p>
            <button
              type="submit"
              disabled={procesando || !nombre.trim() || !telefono.trim() || !email.trim()}
              className="gestadia-user-primary red-variant"
              style={{ width: '100%' }}
            >
              <span>{procesando ? 'Redirigiendo a Gestadia.com...' : 'Continuar en la web'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
export default GestadiaContratar;
