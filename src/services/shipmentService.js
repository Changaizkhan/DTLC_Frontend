import { http } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * @param {Record<string, unknown>} [params] query string e.g. page, status, search
 */
export async function fetchShipments(params) {
  const { data } = await http.get(endpoints.shipments.list, { params });
  return data;
}

/**
 * @param {string} id
 */
export async function fetchShipmentById(id) {
  const { data } = await http.get(endpoints.shipments.detail(id));
  return data;
}

/**
 * @param {unknown} payload form body aligned with backend DTO
 */
export async function createShipment(payload) {
  const { data } = await http.post(endpoints.shipments.create, payload);
  return data;
}

/**
 * @param {{ id: string, status: string }} payload
 */
export async function updateShipmentStatus({ id, status }) {
  const { data } = await http.patch(endpoints.shipments.updateStatus(id), { status });
  return data;
}

/**
 * @param {{ id: string, payload: unknown }} params
 */
export async function updateShipment({ id, payload }) {
  const { data } = await http.put(endpoints.shipments.update(id), payload);
  return data;
}

/**
 * @param {string} id
 */
export async function deleteShipment(id) {
  const { data } = await http.delete(endpoints.shipments.delete(id));
  return data;
}
