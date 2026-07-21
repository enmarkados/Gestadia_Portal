import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DuplicadoCarnet from './DuplicadoCarnet.jsx';

describe('DuplicadoCarnet', () => {
  it('la ficha muestra el botón "Contratar ahora"', () => {
    render(<MemoryRouter><DuplicadoCarnet /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /contratar ahora/i })).toBeInTheDocument();
  });
});
