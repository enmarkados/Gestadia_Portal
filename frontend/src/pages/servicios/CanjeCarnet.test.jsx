import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import CanjeCarnet from './CanjeCarnet.jsx';

describe('CanjeCarnet', () => {
  it('el CTA "Contratar ahora" enlaza al checkout del canje', () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /contratar ahora/i }))
      .toHaveAttribute('href', '/checkout?servicio=canje-carnet');
  });

  it('muestra el resultado de elegibilidad al completar el verificador', async () => {
    render(<MemoryRouter><CanjeCarnet /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /comprobar requisitos/i }));
    // q1 residencia legal, q3 permiso en vigor, q4 obtenido antes de residencia — todo "Sí"
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[0]);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ok' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Sí' })[2]);

    fireEvent.click(screen.getByRole('button', { name: /verificar →/i }));

    expect(await screen.findByText(/puedes contratar el trámite abajo/i)).toBeInTheDocument();
  });
});
