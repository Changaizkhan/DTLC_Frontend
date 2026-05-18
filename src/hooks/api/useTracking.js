import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../api/queryKeys';
import { fetchTrackingByNumber } from '../../services/trackingService';

/**
 * Same data as dashboard shipment detail — GET /shipments/:shipmentNumber
 * @param {string | undefined} trackingNumber
 */
export function useTrackingDetail(trackingNumber) {
  return useQuery({
    queryKey: queryKeys.shipments.detail(trackingNumber),
    queryFn: () =>
      fetchTrackingByNumber(/** @type {string} */ (trackingNumber)),
    enabled: Boolean(trackingNumber && trackingNumber.trim()),
  });
}
