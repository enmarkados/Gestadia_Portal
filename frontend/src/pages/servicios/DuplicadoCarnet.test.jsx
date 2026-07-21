import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DuplicadoCarnet from './DuplicadoCarnet.jsx';

describe('DuplicadoCarnet', () => {
  it('la ficha muestra el formulario de pago embebido', () => {
    render(<MemoryRouter><DuplicadoCarnet /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /pagar con tarjeta o bizum/i })).toBeInTheDocument();
  });
});
