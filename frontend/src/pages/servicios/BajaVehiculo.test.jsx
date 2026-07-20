import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import BajaVehiculo from './BajaVehiculo.jsx';

describe('BajaVehiculo', () => {
  it('el CTA "Contratar ahora" enlaza al checkout del servicio', () => {
    render(<MemoryRouter><BajaVehiculo /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /contratar ahora/i }))
      .toHaveAttribute('href', '/checkout?servicio=baja-vehiculo');
  });
});
