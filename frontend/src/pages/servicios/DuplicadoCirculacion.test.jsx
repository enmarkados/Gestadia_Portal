import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DuplicadoCirculacion from './DuplicadoCirculacion.jsx';

describe('DuplicadoCirculacion', () => {
  it('la ficha muestra el formulario de pago embebido', () => {
    render(<MemoryRouter><DuplicadoCirculacion /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /pagar con tarjeta o bizum/i })).toBeInTheDocument();
  });
});
