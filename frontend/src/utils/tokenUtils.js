import { jwtDecode } from 'jwt-decode';

export function getToken() {
  return localStorage.getItem('token');
}

export function decodeToken(token) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function getRoleFromToken(token) {
  const decoded = decodeToken(token);
  const rawRole = decoded?.role || decoded?.user?.role || decoded?.userRole;
  return typeof rawRole === 'string' ? rawRole.toLowerCase() : '';
}

export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  const nowInSeconds = Date.now() / 1000;
  return decoded.exp <= nowInSeconds;
}

export function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
}

