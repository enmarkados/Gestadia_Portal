import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login.jsx';

describe('Login', () => {
  it('logs in and stores the token', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ token: 'abc.def.ghi', nombre: 'Ana' }) }));
    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText(/contrase.a/i), { target: { value: 'supersecreta1' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(localStorage.getItem('gestadia_token')).toBe('abc.def.ghi'));
  });
});
