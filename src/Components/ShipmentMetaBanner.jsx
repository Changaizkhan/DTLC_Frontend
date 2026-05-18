import { statusBadgeClass } from '../lib/shipmentMeta';

/**
 * @param {{
 *   status?: string,
 *   currentLocation?: string,
 *   shipmentNumber?: string,
 *   className?: string,
 *   compact?: boolean,
 * }} props
 */
export default function ShipmentMetaBanner({
  status,
  currentLocation,
  shipmentNumber,
  className = '',
  compact = false,
}) {
  const hasStatus = Boolean(String(status ?? '').trim());
  const hasLocation = Boolean(String(currentLocation ?? '').trim());
  const hasId = Boolean(String(shipmentNumber ?? '').trim());

  if (!hasStatus && !hasLocation && !hasId) return null;

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white ${
        compact ? 'p-3' : 'p-4'
      } ${className}`}
    >
      <div className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {hasId ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Shipment ID
            </p>
            <p className="text-sm font-bold text-red-600 truncate">{shipmentNumber}</p>
          </div>
        ) : null}
        {hasStatus ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Status
            </p>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(status)}`}
            >
              {status}
            </span>
          </div>
        ) : null}
        <div className={hasId && hasStatus ? '' : 'sm:col-span-2'}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Current Location
          </p>
          <p className={`text-sm font-medium ${hasLocation ? 'text-gray-800' : 'text-gray-400 italic'}`}>
            {hasLocation ? currentLocation : 'Not set'}
          </p>
        </div>
      </div>
    </div>
  );
}
