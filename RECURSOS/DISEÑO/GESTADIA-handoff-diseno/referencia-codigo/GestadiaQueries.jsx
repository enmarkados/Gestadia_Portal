import React, { useState } from 'react';
import { ChevronRight, Clock, AlertCircle } from 'lucide-react';

const EXPEDIENTES_MOCK = [
  {
    id: 'GST-202607-97389',
    titulo: 'Canje de Carnet Extranjero',
    subtitulo: 'Perú 🇵🇪',
    gestor: 'Juan Carlos Acero',
    estado: 'Falta documentación'
  },
  {
    id: 'GST-202610-88124',
    titulo: 'Duplicado de Permiso de Conducir',
    subtitulo: 'Trámite DGT',
    gestor: 'Gestor asignado',
    estado: null // Si no tiene el dato, pondrá "En trámite"
  }
];

export function GestadiaQueries({ onSelectQuery }) {
  return (
    <div style={{ maxWidth: 850, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2C2C2C', margin: 0 }}>
          Mis Trámites
        </h1>
        <span style={{ fontSize: 11.5, fontWeight: 700, background: '#FDEDEC', color: '#C0392B', padding: '3px 8px', borderRadius: 8 }}>
          {EXPEDIENTES_MOCK.length} activos
        </span>
      </div>
      <p style={{ fontSize: 13.5, color: '#6B7280', marginBottom: 18 }}>
        Estado actualizado de tus gestiones ante la DGT.
      </p>

      {/* Listado de Trámites con Estado de la Gestión */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {EXPEDIENTES_MOCK.map((item) => {
          const estadoText = item.estado || 'En trámite';
          const isPending = estadoText.toLowerCase().includes('falta') || estadoText.toLowerCase().includes('documentación');

          return (
            <div
              key={item.id}
              onClick={() => onSelectQuery && onSelectQuery(item)}
              className="gestadia-card"
              style={{
                border: isPending ? '1.5px solid #C0392B' : '1px solid #E5E7EB',
                padding: '16px',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s'
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 16.5, fontWeight: 800, color: '#2C2C2C', margin: '0 0 3px', width: '100%' }}>
                  {item.titulo}
                </h2>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {item.id} · {item.subtitulo}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  Estado: <strong style={{ color: isPending ? '#C0392B' : '#4B5563' }}>{estadoText}</strong>
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: isPending ? '#C0392B' : '#4B5563', display: 'flex', alignItems: 'center', gap: 2 }}>
                  Hablar con un gestor ›
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GestadiaQueries;
