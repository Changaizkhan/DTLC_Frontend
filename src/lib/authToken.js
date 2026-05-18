const STORAGE_KEY = 'musa_admin_access_token';

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setAccessToken(token) {
  if (!token) {
    clearAccessToken();
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, token);
}

export function clearAccessToken() {
  window.localStorage.removeItem(STORAGE_KEY);
}
