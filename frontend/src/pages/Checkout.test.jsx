import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Checkout from './Checkout.jsx';

describe('Checkout', () => {
  it('loads the service from ?servicio= and submits to /api/checkout', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'canje', nombre: 'Canje de permiso de conducir', descripcion: 'x', precio: 149, checklist: [] }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/gracias?pedido=GST-1' }) };
    });

    render(
      <MemoryRouter initialEntries={['/checkout?servicio=canje']}>
        <Checkout />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/canje de permiso de conducir/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: 'Ruiz' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByLabelText(/acepto las condiciones/i));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/checkout', expect.objectContaining({ method: 'POST' })));
  });
});
