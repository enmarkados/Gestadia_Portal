import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import CanjeCarnet from './CanjeCarnet.jsx';
import { SERVICIOS } from '@shared/servicios.js';

describe('CanjeCarnet', () => {
  it('muestra el precio desde shared', () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);
    expect(screen.getByText(`${SERVICIOS['canje-carnet'].precio} €`)).toBeInTheDocument();
  });
});
