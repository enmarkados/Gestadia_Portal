import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contacto from './Contacto.jsx';

describe('Contacto', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, id: 'lead1' }) }));
  });

  it('submits the form to /api/leads', async () => {
    render(<MemoryRouter><Contacto /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana Ruiz' } });
    fireEvent.change(screen.getByLabelText(/tel[ée]fono/i), { target: { value: '600111222' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/leads', expect.objectContaining({ method: 'POST' })));
  });
});
