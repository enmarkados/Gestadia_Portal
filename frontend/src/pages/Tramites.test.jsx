import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Tramites from './Tramites.jsx';
import { SERVICIOS } from '@shared/servicios.js';

describe('Tramites', () => {
  it('muestra el nombre y el precio de cada servicio desde shared', () => {
    render(<MemoryRouter><Tramites /></MemoryRouter>);
    for (const slug of Object.keys(SERVICIOS)) {
      const s = SERVICIOS[slug];
      expect(screen.getByText(s.nombre)).toBeInTheDocument();
      expect(screen.getAllByText(`${s.precio} €`).length).toBeGreaterThan(0);
    }
  });
});
