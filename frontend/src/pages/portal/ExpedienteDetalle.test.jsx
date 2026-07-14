import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/api.js', () => ({
  getExpediente: vi.fn(async () => ({
    id: 'e1', nPedido: 'GST-1', titulo: 'Canje de Carnet Extranjero', estado: 'documentacion_pendiente',
    estadoLabel: 'Falta documentación', progreso: 40, importe: 210, fechaPago: null, finDesistimiento: null,
    eventos: [], documentos: [], checklist: [],
    paisCanje: 'argelia', direccion: { nombreVia: 'Gran Vía', numero: '1', codigoPostal: '28013', municipio: 'Madrid', provincia: 'Madrid' },
    datosPais: { wilaya: 'Argel', daira: 'Bab El Oued' },
  })),
  uploadDocumento: vi.fn(),
}));

import ExpedienteDetalle from './ExpedienteDetalle.jsx';

describe('ExpedienteDetalle — Datos del trámite', () => {
  it('muestra país, dirección y campos manuales', async () => {
    render(
      <MemoryRouter initialEntries={['/portal/mis-servicios/e1']}>
        <Routes><Route path="/portal/mis-servicios/:id" element={<ExpedienteDetalle />} /></Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/Datos del trámite/i)).toBeInTheDocument());
    expect(screen.getByText(/Argelia/)).toBeInTheDocument();
    expect(screen.getByText(/Gran Vía 1/)).toBeInTheDocument();
    expect(screen.getByText('Argel')).toBeInTheDocument();
  });
});
