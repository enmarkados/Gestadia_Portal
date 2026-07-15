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
    fireEvent.change(screen.getByLabelText(/^teléfono/i), { target: { value: '600111222' } });
    fireEvent.click(screen.getByLabelText(/acepto las condiciones/i));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/checkout', expect.objectContaining({ method: 'POST' })));
  });

  it('el teléfono es obligatorio y se envía con prefijo', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'duplicado-carnet', nombre: 'Duplicado de Carnet de Conducir', descripcion: 'x', precio: 70, checklist: [], requierePais: false, requiereDireccion: false }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/gracias?pedido=X' }) };
    });
    render(<MemoryRouter initialEntries={['/checkout?servicio=duplicado-carnet']}><Checkout /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Tus datos/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: 'Ruiz' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText(/^teléfono/i), { target: { value: '600111222' } });
    fireEvent.click(screen.getByLabelText(/acepto las condiciones/i));
    fireEvent.click(screen.getByRole('button', { name: /pagar/i }));
    await waitFor(() => {
      const call = global.fetch.mock.calls.find((c) => c[0] === '/api/checkout');
      const body = JSON.parse(call[1].body);
      expect(body.telefono).toBe('+34600111222');
    });
  });

  it('muestra país y dirección para un servicio con flags (canje)', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'canje-carnet', nombre: 'Canje de Carnet Extranjero', descripcion: 'x', precio: 210, checklist: [], requierePais: true, requiereDireccion: true }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/gracias?pedido=X' }) };
    });
    render(<MemoryRouter initialEntries={['/checkout?servicio=canje-carnet']}><Checkout /></MemoryRouter>);
    await waitFor(() => expect(screen.getByLabelText(/país del permiso/i)).toBeInTheDocument());
    expect(screen.getByText(/Dirección de envío del permiso/i)).toBeInTheDocument();
  });

  it('no muestra país/dirección para un servicio sin flags', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'duplicado-carnet', nombre: 'Duplicado de Carnet de Conducir', descripcion: 'x', precio: 70, checklist: [], requierePais: false, requiereDireccion: false }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/x' }) };
    });
    render(<MemoryRouter initialEntries={['/checkout?servicio=duplicado-carnet']}><Checkout /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/Tus datos/i)).toBeInTheDocument());
    expect(screen.queryByLabelText(/país del permiso/i)).not.toBeInTheDocument();
  });
});
