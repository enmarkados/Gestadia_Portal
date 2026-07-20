import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Transferencia from './Transferencia.jsx';

describe('Transferencia', () => {
  it('el CTA "Contratar ahora" enlaza al checkout del servicio', () => {
    render(<MemoryRouter><Transferencia /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /contratar ahora/i }))
      .toHaveAttribute('href', '/checkout?servicio=transferencia');
  });
});
