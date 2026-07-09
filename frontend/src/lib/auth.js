const KEY = 'gestadia_token';

export function saveToken(token) {
  localStorage.setItem(KEY, token);
}

export function getToken() {
  return localStorage.getItem(KEY);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}

export function isAuthenticated() {
  return !!getToken();
}
