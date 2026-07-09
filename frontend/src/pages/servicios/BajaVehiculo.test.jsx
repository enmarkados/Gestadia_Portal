import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BajaVehiculo from './BajaVehiculo.jsx';

describe('BajaVehiculo', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, id: 'lead1' }) }));
  });

  it('submits the form to /api/leads with the Baja de Vehículo tramite', async () => {
    render(<MemoryRouter><BajaVehiculo /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana Ruiz' } });
    fireEvent.change(screen.getByLabelText(/tel[ée]fono/i), { target: { value: '600111222' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /solicitar información/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/leads',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ nombre: 'Ana Ruiz', telefono: '600111222', email: 'ana@example.com', tramite: 'Baja de Vehículo' }),
        })
      )
    );
  });
});
