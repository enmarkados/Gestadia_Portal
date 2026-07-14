import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CanjeCarnet from './CanjeCarnet.jsx';

describe('CanjeCarnet', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, id: 'lead1' }) }));
  });

  it('submits the form to /api/leads with the Canje de Carnet Extranjero tramite', async () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana Ruiz' } });
    fireEvent.change(screen.getByLabelText(/tel[ée]fono/i), { target: { value: '600111222' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /solicitar información/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/leads',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ nombre: 'Ana Ruiz', telefono: '600111222', email: 'ana@example.com', tramite: 'Canje de Carnet Extranjero' }),
        })
      )
    );
  });

  it('shows the eligibility result when the verificador is completed', async () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /comprobar requisitos/i }));
    // q1 residencia legal, q3 permiso en vigor, q4 obtenido antes de residencia — all "Sí"
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0]);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ok' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[2]);

    fireEvent.click(screen.getByRole('button', { name: /verificar →/i }));

    expect(await screen.findByText(/puedes solicitar información abajo/i)).toBeInTheDocument();
  });
});
