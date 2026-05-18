const API_FIELD_ALIASES = {
  shipperName: 'shipper.name',
  shipperPhone: 'shipper.phone',
  shipperAddress: 'shipper.address',
  shipperEmail: 'shipper.email',
  receiverName: 'receiver.name',
  receiverPhone: 'receiver.phone',
  receiverAddress: 'receiver.address',
  receiverEmail: 'receiver.email',
  typeOfShipment: 'details.typeOfShipment',
  shipmentWeightKg: 'details.shipmentWeightKg',
  destination: 'details.destination',
  origin: 'details.origin',
  pickupDate: 'details.pickupDate',
  expectedDeliveryDate: 'details.expectedDeliveryDate',
};

function messageFromValue(value) {
  if (Array.isArray(value)) {
    return value.map((x) => String(x)).filter(Boolean).join(' ');
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const nested = flattenFieldErrors(value);
    return Object.values(nested)[0] ?? '';
  }
  if (typeof value === 'string') return value.trim();
  return '';
}

/**
 * @param {Record<string, unknown>} obj
 * @param {string} [prefix]
 * @returns {Record<string, string>}
 */
function flattenFieldErrors(obj, prefix = '') {
  /** @type {Record<string, string>} */
  const out = {};
  if (!obj || typeof obj !== 'object') return out;

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value) || typeof value === 'string') {
      const msg = messageFromValue(value);
      if (msg) out[path] = msg;
    } else if (value && typeof value === 'object') {
      Object.assign(out, flattenFieldErrors(/** @type {Record<string, unknown>} */ (value), path));
    }
  }
  return out;
}

function mapApiFieldKeys(errors) {
  /** @type {Record<string, string>} */
  const mapped = {};
  for (const [key, message] of Object.entries(errors)) {
    const normalized = API_FIELD_ALIASES[key] ?? key;
    if (!mapped[normalized]) mapped[normalized] = message;
  }
  return mapped;
}

/**
 * @param {unknown} error
 * @returns {Record<string, string>}
 */
export function getApiFieldErrors(error) {
  const data = error?.response?.data;
  if (data && typeof data === 'object') {
    const errors = /** @type {Record<string, unknown>} */ (data).errors;
    if (errors && typeof errors === 'object') {
      const flat = mapApiFieldKeys(flattenFieldErrors(/** @type {Record<string, unknown>} */ (errors)));
      if (Object.keys(flat).length) return flat;
    }
  }

  const message = getApiErrorMessage(error);
  return message ? { _form: message } : {};
}

/**
 * @param {unknown} error
 * @returns {string}
 */
export function getApiErrorMessage(error) {
  const data = error?.response?.data;
  if (data && typeof data === 'object') {
    const msg = /** @type {Record<string, unknown>} */ (data).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
    if (Array.isArray(msg) && msg.length) {
      return msg.map((x) => String(x)).filter(Boolean).join('. ');
    }
    const err = /** @type {Record<string, unknown>} */ (data).error;
    if (typeof err === 'string' && err.trim()) return err;
    const m2 = /** @type {Record<string, unknown>} */ (data).msg;
    if (typeof m2 === 'string' && m2.trim()) return m2;
    const errors = /** @type {Record<string, unknown>} */ (data).errors;
    if (errors && typeof errors === 'object') {
      const first = Object.values(errors)[0];
      if (Array.isArray(first) && first[0] != null) return String(first[0]);
      if (typeof first === 'string' && first.trim()) return first;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}
