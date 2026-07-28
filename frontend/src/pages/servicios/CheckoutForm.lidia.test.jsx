import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckoutForm from './CheckoutForm.jsx';

vi.mock('../../lib/api.js', () => ({ postCheckout: vi.fn() }));

const servicio = { slug: 'canje-carnet', nombre: 'Canje', requierePais: true, requiereDireccion: true };

function renderForm(props = {}) {
  return render(
    <MemoryRouter>
      <CheckoutForm servicio={servicio} {...props} />
    </MemoryRouter>
  );
}

describe('CheckoutForm con prellenado LidIA', () => {
  it('prellena los campos y separa el prefijo del teléfono E.164', () => {
    renderForm({
      prefill: { nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com', tipoDocumento: 'NIE', numDocumento: 'X1234567L', paisCanje: 'colombia', telefono: '+34600111222' },
      procedencia: 'lidia',
    });
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana');
    expect(screen.getByLabelText('Apellidos')).toHaveValue('García López');
    expect(screen.getByLabelText('Email')).toHaveValue('ana@example.com');
    expect(screen.getByLabelText('Nº de documento')).toHaveValue('X1234567L');
    expect(screen.getByLabelText('Teléfono móvil')).toHaveValue('600111222');
    expect(screen.getByLabelText('País del permiso')).toHaveValue('colombia');
  });

  it('muestra el banner de verificación solo con procedencia lidia', () => {
    renderForm({ prefill: { nombre: 'Ana' }, procedencia: 'lidia' });
    expect(screen.getByText(/revísalos con calma/i)).toBeInTheDocument();
  });

  it('sin procedencia lidia no hay banner', () => {
    renderForm();
    expect(screen.queryByText(/revísalos con calma/i)).not.toBeInTheDocument();
  });
});
