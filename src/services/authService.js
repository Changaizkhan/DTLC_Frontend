import { http } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * @param {{ email: string; password: string }} credentials
 */
export async function loginRequest(credentials) {
  const email = String(credentials.email ?? '').trim();
  const password = String(credentials.password ?? '').trim();
  const { data } = await http.post(endpoints.auth.login, { email, password });
  return data;
}
