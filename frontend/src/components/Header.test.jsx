import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Header from './Header.jsx';

describe('Header', () => {
  it('renders the Contacto nav link pointing to /contacto', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /contacto/i })).toHaveAttribute('href', '/contacto');
  });
});
