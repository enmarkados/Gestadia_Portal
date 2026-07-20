import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import CancelacionDominio from './CancelacionDominio.jsx';

describe('CancelacionDominio', () => {
  it('el CTA "Contratar ahora" enlaza al checkout del servicio', () => {
    render(<MemoryRouter><CancelacionDominio /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /contratar ahora/i }))
      .toHaveAttribute('href', '/checkout?servicio=cancelacion-dominio');
  });
});
