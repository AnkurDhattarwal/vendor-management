// frontend/src/utils/auth.js
import {jwtDecode} from 'jwt-decode';

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export function getUser() {
  const t = getToken();
  if (!t) return null;
  try {
    return jwtDecode(t);
  } catch {
    return null;
  }
}
