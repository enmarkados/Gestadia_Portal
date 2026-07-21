import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PermisoInternacional from './PermisoInternacional.jsx';

describe('PermisoInternacional', () => {
  it('la ficha muestra el formulario de pago embebido', () => {
    render(<MemoryRouter><PermisoInternacional /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /pagar con tarjeta o bizum/i })).toBeInTheDocument();
  });
});
