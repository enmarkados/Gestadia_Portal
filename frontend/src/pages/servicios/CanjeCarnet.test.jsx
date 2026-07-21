import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import CanjeCarnet from './CanjeCarnet.jsx';

describe('CanjeCarnet', () => {
  it('la ficha muestra el botón "Contratar ahora"', () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /contratar ahora/i })).toBeInTheDocument();
  });

  it('muestra el resultado de elegibilidad al completar el verificador', async () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /comprobar requisitos/i }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0]);
    fireEvent.change(screen.getByLabelText(/país para verificar el canje/i), { target: { value: 'Alemania' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[2]);
    fireEvent.click(screen.getByRole('button', { name: /verificar →/i }));
    expect(await screen.findByText(/puedes contratar el trámite abajo/i)).toBeInTheDocument();
  });
});
