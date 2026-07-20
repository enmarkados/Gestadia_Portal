import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DuplicadoCarnet from './DuplicadoCarnet.jsx';

describe('DuplicadoCarnet', () => {
  it('el CTA "Contratar ahora" enlaza al checkout del servicio', () => {
    render(<MemoryRouter><DuplicadoCarnet /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /contratar ahora/i }))
      .toHaveAttribute('href', '/checkout?servicio=duplicado-carnet');
  });
});
