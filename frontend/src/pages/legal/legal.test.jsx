import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AvisoLegal from './AvisoLegal.jsx';
import Privacidad from './Privacidad.jsx';
import Cookies from './Cookies.jsx';
import PagosDevoluciones from './PagosDevoluciones.jsx';
import ProteccionDatos from './ProteccionDatos.jsx';

describe('legal pages render their heading', () => {
  it.each([
    [AvisoLegal, 'Aviso Legal'],
    [Privacidad, 'Política de Privacidad'],
    [Cookies, 'Política de Cookies'],
    [PagosDevoluciones, 'Pagos, Cancelaciones y Devoluciones'],
    [ProteccionDatos, 'Política de Protección de Datos'],
  ])('%s', (Component, heading) => {
    render(<MemoryRouter><Component /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });
});
