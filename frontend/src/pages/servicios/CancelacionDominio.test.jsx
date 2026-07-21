import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import CancelacionDominio from './CancelacionDominio.jsx';

describe('CancelacionDominio', () => {
  it('la ficha muestra el botón "Contratar ahora"', () => {
    render(<MemoryRouter><CancelacionDominio /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /contratar ahora/i })).toBeInTheDocument();
  });
});
