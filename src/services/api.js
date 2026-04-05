const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('ats_token');
}

function getHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('ats_token', data.token);
  localStorage.setItem('ats_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('ats_token');
  localStorage.removeItem('ats_user');
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('ats_user');
  if (!userStr) return null;
  try { return JSON.parse(userStr); } 
  catch { return null; }
}

export function isAuthenticated() {
  return !!getToken();
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  if (res.status === 401) {
    logout();
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  return res;
}
