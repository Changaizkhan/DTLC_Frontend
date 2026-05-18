import { fetchShipmentById } from './shipmentService';

/**
 * Public tracking uses the same shipment detail API:
 * GET /api/shipments/:shipmentNumber (e.g. DTLC213180193)
 */
export async function fetchTrackingByNumber(trackingNumber) {
  return fetchShipmentById(trackingNumber);
}
