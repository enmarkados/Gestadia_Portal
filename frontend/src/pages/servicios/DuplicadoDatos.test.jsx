import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DuplicadoDatos from './DuplicadoDatos.jsx';

describe('DuplicadoDatos', () => {
  it('la ficha muestra el formulario de pago embebido', () => {
    render(<MemoryRouter><DuplicadoDatos /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /pagar con tarjeta o bizum/i })).toBeInTheDocument();
  });
});
