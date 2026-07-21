import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Transferencia from './Transferencia.jsx';

describe('Transferencia', () => {
  it('muestra "Contratar ahora" y despliega el formulario al pulsarlo', () => {
    render(<MemoryRouter><Transferencia /></MemoryRouter>);
    const btn = screen.getByRole('button', { name: /contratar ahora/i });
    expect(screen.queryByRole('button', { name: /pagar con tarjeta o bizum/i })).not.toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: /pagar con tarjeta o bizum/i })).toBeInTheDocument();
  });
});
