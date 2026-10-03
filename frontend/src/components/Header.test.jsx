import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Header from './Header.jsx';

describe('Header', () => {
  it('renders the Contacto nav link pointing to /contacto', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /contacto/i })).toHaveAttribute('href', '/contacto');
  });

  it('toggles mobile menu on button click and closes when clicking a link', async () => {
    const { fireEvent } = await import('@testing-library/react');
    render(<MemoryRouter><Header /></MemoryRouter>);
    const menuBtn = screen.getByRole('button', { name: /abrir menú/i });
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');

    const contactoLink = screen.getByRole('link', { name: /contacto/i });
    fireEvent.click(contactoLink);
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
  });
});

