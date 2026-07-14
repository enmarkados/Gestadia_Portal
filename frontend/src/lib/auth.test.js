import { describe, it, expect, beforeEach } from 'vitest';
import { saveToken, getToken, clearToken, isAuthenticated } from './auth.js';

describe('auth token storage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a token through localStorage', () => {
    expect(isAuthenticated()).toBe(false);
    saveToken('abc.def.ghi');
    expect(getToken()).toBe('abc.def.ghi');
    expect(isAuthenticated()).toBe(true);
    clearToken();
    expect(isAuthenticated()).toBe(false);
  });
});
