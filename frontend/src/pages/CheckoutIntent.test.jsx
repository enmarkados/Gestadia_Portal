import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CheckoutIntent from './CheckoutIntent.jsx';

vi.mock('../lib/api.js', () => ({
  getCheckoutIntent: vi.fn(),
  getServicios: vi.fn(),
}));
import { getCheckoutIntent, getServicios } from '../lib/api.js';

const servicios = [{ slug: 'canje-carnet', nombre: 'Canje de Carnet Extranjero', descripcion: 'x', precio: 210, requierePais: true, requiereDireccion: true }];

function renderRuta(token = 'tok1') {
  return render(
    <MemoryRouter initialEntries={[`/c/${token}`]}>
      <Routes>
        <Route path="/c/:token" element={<CheckoutIntent />} />
        <Route path="/checkout" element={<div>PAGINA CHECKOUT NORMAL</div>} />
        <Route path="/gracias" element={<div>PAGINA GRACIAS</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => vi.resetAllMocks());

describe('CheckoutIntent (/c/:token)', () => {
  it('monta el checkout prellenado cuando el intent es válido', async () => {
    getServicios.mockResolvedValue(servicios);
    getCheckoutIntent.mockResolvedValue({ servicio: 'canje-carnet', procedencia: 'lidia', prefill: { nombre: 'Ana', apellidos: 'García López' } });
    renderRuta();
    await waitFor(() => expect(screen.getByDisplayValue('Ana')).toBeInTheDocument());
    expect(screen.getByDisplayValue('García López')).toBeInTheDocument();
    expect(getCheckoutIntent).toHaveBeenCalledWith('tok1');
  });

  it('redirige al checkout normal solo si el enlace caducó de verdad (404)', async () => {
    getServicios.mockResolvedValue(servicios);
    getCheckoutIntent.mockRejectedValue(Object.assign(new Error('Enlace no válido o caducado'), { caducado: true }));
    renderRuta();
    await waitFor(() => expect(screen.getByText('PAGINA CHECKOUT NORMAL')).toBeInTheDocument());
  });

  it('ante un error transitorio reintenta y NO dice que el enlace caducó', async () => {
    getServicios.mockResolvedValue(servicios);
    getCheckoutIntent
      .mockRejectedValueOnce(Object.assign(new Error('servidor reiniciando'), { caducado: false }))
      .mockResolvedValueOnce({ servicio: 'canje-carnet', procedencia: 'lidia', prefill: { nombre: 'Ana' } });
    renderRuta();
    await waitFor(() => expect(screen.getByDisplayValue('Ana')).toBeInTheDocument(), { timeout: 5000 });
    expect(screen.queryByText('PAGINA CHECKOUT NORMAL')).not.toBeInTheDocument();
    expect(getCheckoutIntent).toHaveBeenCalledTimes(2);
  });

  it('si el error transitorio persiste muestra aviso de reintento, sin perder el enlace', async () => {
    getServicios.mockResolvedValue(servicios);
    getCheckoutIntent.mockRejectedValue(Object.assign(new Error('sin conexión'), { caducado: false }));
    renderRuta();
    await waitFor(() => expect(screen.getByText(/el enlace sigue siendo válido/i)).toBeInTheDocument(), { timeout: 5000 });
    expect(screen.queryByText('PAGINA CHECKOUT NORMAL')).not.toBeInTheDocument();
  });

  it('redirige a gracias si el intent ya está pagado', async () => {
    getServicios.mockResolvedValue(servicios);
    getCheckoutIntent.mockResolvedValue({ pagado: true, nPedido: 'GST-1' });
    renderRuta();
    await waitFor(() => expect(screen.getByText('PAGINA GRACIAS')).toBeInTheDocument());
  });
});
