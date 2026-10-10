import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Checkout from './Checkout.jsx';
import { checkoutUrl } from '../../app/src/api.js';

describe('Checkout', () => {
  it.each([
    ['600 111 222', '+34', '600 111 222'],
    ['+34600111222', '+34', '600111222'],
    ['+18095551234', '+1809', '5551234'],
  ])('conserva el teléfono %s al pasar de Servicios APP al checkout web', async (telefono, prefijo, numero) => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => [{
      slug: 'canje-carnet', nombre: 'Canje de Carnet Extranjero', descripcion: 'x',
      precio: 210, checklist: [], requierePais: true, requiereDireccion: true,
    }] }));
    const url = new URL(checkoutUrl('canje-carnet', {
      nombre: 'Ana', apellidos: 'Ruiz', email: 'ana@example.com', telefono,
      tipoDocumento: 'NIE', numDocumento: 'X1234567L', paisCanje: 'Perú',
    }));
    render(<MemoryRouter initialEntries={[url.pathname + url.search]}><Checkout /></MemoryRouter>);

    await waitFor(() => expect(screen.getByLabelText('Nombre')).toHaveValue('Ana'));
    expect(screen.getByLabelText('Apellidos')).toHaveValue('Ruiz');
    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com');
    expect(screen.getByLabelText('Prefijo')).toHaveValue(prefijo);
    expect(screen.getByLabelText('Teléfono móvil')).toHaveValue(numero);
    expect(screen.getByLabelText('Tipo de documento')).toHaveValue('NIE');
    expect(screen.getByLabelText('Nº de documento')).toHaveValue('X1234567L');
    expect(screen.getByLabelText('País del permiso')).toHaveValue('peru');
  });

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

  it('prellena los campos del formulario a partir de los query params en la URL', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'canje-carnet', nombre: 'Canje de Carnet Extranjero', descripcion: 'x', precio: 210, checklist: [], requierePais: true, requiereDireccion: true }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/x' }) };
    });
    render(
      <MemoryRouter initialEntries={['/checkout?servicio=canje-carnet&nombre=Gonzalo&apellidos=Villanova+Alvarez&email=gonzalovial20%40gmail.com&telefono=%2B34684460971&numDocumento=47307603F&tipoDocumento=DNI&paisCanje=peru&procedencia=lidia']}>
        <Checkout />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByLabelText('Nombre')).toHaveValue('Gonzalo'));
    expect(screen.getByLabelText('Apellidos')).toHaveValue('Villanova Alvarez');
    expect(screen.getByLabelText('Email')).toHaveValue('gonzalovial20@gmail.com');
    expect(screen.getByLabelText('Teléfono móvil')).toHaveValue('684460971');
    expect(screen.getByLabelText('Nº de documento')).toHaveValue('47307603F');
    expect(screen.getByLabelText('País del permiso')).toHaveValue('peru');
    expect(screen.getByText(/revísalos con calma/i)).toBeInTheDocument();
  });

  it('separa nombre y apellidos si solo se proporciona un nombre completo', async () => {
    global.fetch = vi.fn(async (url) => {
      if (String(url).includes('/api/servicios')) {
        return { ok: true, json: async () => [{ slug: 'canje-carnet', nombre: 'Canje de Carnet Extranjero', descripcion: 'x', precio: 210, checklist: [], requierePais: true, requiereDireccion: true }] };
      }
      return { ok: true, json: async () => ({ demo: true, url: '/x' }) };
    });
    render(
      <MemoryRouter initialEntries={['/checkout?servicio=canje-carnet&nombre=Gonzalo+Villanova+Alvarez&dni=47307603F']}>
        <Checkout />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByLabelText('Nombre')).toHaveValue('Gonzalo'));
    expect(screen.getByLabelText('Apellidos')).toHaveValue('Villanova Alvarez');
    expect(screen.getByLabelText('Nº de documento')).toHaveValue('47307603F');
  });
});

