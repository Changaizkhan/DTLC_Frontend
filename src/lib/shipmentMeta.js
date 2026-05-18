export function unwrapShipment(raw) {
  if (!raw) return {};
  return raw.shipment ?? raw.data ?? raw.result ?? raw;
}

/**
 * @param {unknown} raw
 */
export function getShipmentMeta(raw) {
  const s = unwrapShipment(raw);
  return {
    status: s.status ?? '',
    currentLocation: s.currentLocation ?? '',
    shipmentNumber:
      s.shipmentNumber ?? s.trackingNumber ?? s.id ?? s._id ?? '',
  };
}

/** @param {string} status */
export function statusBadgeClass(status) {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-700',
    'Picked up': 'bg-blue-100 text-blue-700',
    'On Hold': 'bg-purple-100 text-purple-700',
    'Out for delivery': 'bg-indigo-100 text-indigo-700',
    'In Transit': 'bg-orange-100 text-orange-700',
    Enroute: 'bg-cyan-100 text-cyan-700',
    'Custom Cleared': 'bg-teal-100 text-teal-700',
    'Processing in facility': 'bg-slate-100 text-slate-700',
    'In transit to export hub': 'bg-amber-100 text-amber-800',
    'In Hub': 'bg-violet-100 text-violet-700',
    Cancelled: 'bg-gray-200 text-gray-600',
    Delivered: 'bg-green-100 text-green-700',
    Returned: 'bg-red-100 text-red-600',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}
