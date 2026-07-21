import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CheckoutForm from './CheckoutForm.jsx';

const base = { slug: 'duplicado-carnet', requierePais: false, requiereDireccion: false };

describe('CheckoutForm', () => {
  it('envía a /api/checkout con el teléfono con prefijo', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ demo: true, url: '/gracias?pedido=X' }) }));
    render(<MemoryRouter><CheckoutForm servicio={base} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: 'Ruiz' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText(/^teléfono/i), { target: { value: '600111222' } });
    fireEvent.click(screen.getByLabelText(/acepto las condiciones/i));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    await waitFor(() => {
      const call = global.fetch.mock.calls.find((c) => c[0] === '/api/checkout');
      const body = JSON.parse(call[1].body);
      expect(body.servicio).toBe('duplicado-carnet');
      expect(body.telefono).toBe('+34600111222');
    });
  });

  it('muestra país y dirección cuando el servicio lo requiere', () => {
    render(<MemoryRouter><CheckoutForm servicio={{ slug: 'canje-carnet', requierePais: true, requiereDireccion: true }} /></MemoryRouter>);
    expect(screen.getByLabelText(/país del permiso/i)).toBeInTheDocument();
    expect(screen.getByText(/Dirección de envío del permiso/i)).toBeInTheDocument();
  });

  it('no muestra país/dirección cuando no se requiere', () => {
    render(<MemoryRouter><CheckoutForm servicio={base} /></MemoryRouter>);
    expect(screen.queryByLabelText(/país del permiso/i)).not.toBeInTheDocument();
  });
});
