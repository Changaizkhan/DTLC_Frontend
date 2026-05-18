/**
 * Shipment create/update form schema — aligned with API payload:
 * { shipper, receiver, details, packages[] }
 */

/** @typedef {'text' | 'textLoose' | 'phone' | 'email' | 'number' | 'integer' | 'select' | 'date' | 'time' | 'alphanumeric'} FieldType */

/**
 * @typedef {{
 *   label: string,
 *   type: FieldType,
 *   required?: boolean,
 *   min?: number,
 *   max?: number,
 *   maxLength?: number,
 *   options?: { value: string, label: string }[],
 *   multiline?: boolean,
 * }} FieldDef
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const SELECT = {
  typeOfShipment: [
    'Express',
    'Air Freight',
    'International Shipping',
    'Truck Load',
    'Van Move',
  ],
  mode: ['Air', 'Sea Transport', 'Land Shipping', 'Air Freight'],
  paymentMethod: ['COD', 'Cash', 'Cheque', 'Bank Transfer'],
  totalFreightCurrency: ['PKR', 'USD', 'EUR'],
  carrier: ['DTLC', 'FedEx', 'DHL'],
  pieceType: ['Box', 'Envelope', 'Pallet', 'Roll'],
};

/** @param {string[]} values */
function selectOptions(values) {
  return values.map((v) => ({ value: v, label: v }));
}

/** @type {Record<string, FieldDef>} */
export const FIELDS = {
  'shipper.name': { label: 'Shipper Name', type: 'text', required: true, maxLength: 120 },
  'shipper.phone': { label: 'Phone Number', type: 'phone', required: true, maxLength: 20 },
  'shipper.address': { label: 'Address', type: 'textLoose', required: true, maxLength: 250 },
  'shipper.email': { label: 'Email', type: 'email', required: false, maxLength: 254 },

  'receiver.name': { label: 'Receiver Name', type: 'text', required: true, maxLength: 120 },
  'receiver.phone': { label: 'Phone Number', type: 'phone', required: true, maxLength: 20 },
  'receiver.address': { label: 'Address', type: 'textLoose', required: true, maxLength: 250 },
  'receiver.email': { label: 'Email', type: 'email', required: false, maxLength: 254 },

  'details.typeOfShipment': {
    label: 'Type of Shipment',
    type: 'select',
    required: true,
    options: selectOptions(SELECT.typeOfShipment),
  },
  'details.shipmentWeightKg': {
    label: 'Weight (kg)',
    type: 'number',
    required: false,
    min: 0,
  },
  'details.courier': { label: 'Courier', type: 'textLoose', required: false, maxLength: 100 },
  'details.mode': {
    label: 'Mode',
    type: 'select',
    required: false,
    options: selectOptions(SELECT.mode),
  },
  'details.product': { label: 'Product', type: 'textLoose', required: false, maxLength: 120 },
  'details.quantity': { label: 'Quantity', type: 'integer', required: false, min: 1 },
  'details.paymentMethod': {
    label: 'Payment Method',
    type: 'select',
    required: false,
    options: selectOptions(SELECT.paymentMethod),
  },
  'details.totalFreightCurrency': {
    label: 'Currency',
    type: 'select',
    required: false,
    options: selectOptions(SELECT.totalFreightCurrency),
  },
  'details.totalFreightAmount': {
    label: 'Amount',
    type: 'number',
    required: false,
    min: 0,
  },
  'details.carrier': {
    label: 'Carrier',
    type: 'select',
    required: false,
    options: selectOptions(SELECT.carrier),
  },
  'details.carrierReferenceNo': {
    label: 'Carrier Reference No.',
    type: 'alphanumeric',
    required: false,
    maxLength: 64,
  },
  'details.departureTime': { label: 'Departure Time', type: 'time', required: false },
  'details.origin': { label: 'Origin', type: 'textLoose', required: false, maxLength: 120 },
  'details.destination': {
    label: 'Destination',
    type: 'textLoose',
    required: true,
    maxLength: 120,
  },
  'details.pickupDate': { label: 'Pickup Date', type: 'date', required: false },
  'details.pickupTime': { label: 'Pickup Time', type: 'time', required: false },
  'details.expectedDeliveryDate': {
    label: 'Expected Delivery Date',
    type: 'date',
    required: false,
  },
  'details.comments': {
    label: 'Comments',
    type: 'textLoose',
    required: false,
    maxLength: 500,
    multiline: true,
  },

  'packages.quantity': { label: 'Qty.', type: 'integer', required: true, min: 1 },
  'packages.pieceType': {
    label: 'Piece Type',
    type: 'select',
    required: true,
    options: selectOptions(SELECT.pieceType),
  },
  'packages.description': {
    label: 'Description',
    type: 'textLoose',
    required: false,
    maxLength: 200,
    multiline: true,
  },
  'packages.lengthCm': { label: 'Length (cm)', type: 'number', required: false, min: 0 },
  'packages.widthCm': { label: 'Width (cm)', type: 'number', required: false, min: 0 },
  'packages.heightCm': { label: 'Height (cm)', type: 'number', required: false, min: 0 },
  'packages.weightKg': { label: 'Weight (kg)', type: 'number', required: true, min: 0.01 },
};

/** Party columns (shipper / receiver) */
export const PARTY_SECTIONS = [
  { title: 'Shipper Details', prefix: 'shipper', fields: ['name', 'phone', 'address', 'email'] },
  { title: 'Receiver Details', prefix: 'receiver', fields: ['name', 'phone', 'address', 'email'] },
];

/**
 * Details grid layout — `key` = field path, or special rows
 * @type {Array<
 *   | { key: string, colSpan?: number, placeholder?: string }
 *   | { type: 'packagesCount' }
 *   | { type: 'freightRow' }
 * >}
 */
export const DETAILS_LAYOUT = [
  { key: 'details.typeOfShipment', colSpan: 2 },
  { key: 'details.shipmentWeightKg', placeholder: 'e.g. 5.50' },
  { key: 'details.courier' },
  { type: 'packagesCount' },
  { key: 'details.mode' },
  { key: 'details.product' },
  { key: 'details.quantity' },
  { key: 'details.paymentMethod' },
  { type: 'freightRow' },
  { key: 'details.carrier' },
  { key: 'details.carrierReferenceNo' },
  { key: 'details.departureTime' },
  { key: 'details.origin' },
  { key: 'details.destination' },
  { key: 'details.pickupDate' },
  { key: 'details.pickupTime' },
  { key: 'details.expectedDeliveryDate' },
  { key: 'details.comments', colSpan: 2 },
];

/** Package table column order */
export const PACKAGE_COLUMNS = [
  'quantity',
  'pieceType',
  'description',
  'lengthCm',
  'widthCm',
  'heightCm',
  'weightKg',
];

/**
 * @param {string} fieldKey
 * @returns {FieldDef | undefined}
 */
export function getFieldDef(fieldKey) {
  if (fieldKey in FIELDS) return FIELDS[fieldKey];

  const m = fieldKey.match(/^packages\.\d+\.(\w+)$/);
  if (m) return FIELDS[`packages.${m[1]}`];

  return undefined;
}

/**
 * @param {FieldType} type
 * @param {unknown} raw
 * @param {FieldDef} [def]
 */
export function sanitizeValue(type, raw, def) {
  let v = String(raw ?? '');

  switch (type) {
    case 'text':
      v = v.replace(/[^a-zA-Z\s.'-]/g, '');
      break;
    case 'textLoose':
      v = v.replace(/[^a-zA-Z0-9\s.,#'/-]/g, '');
      break;
    case 'phone':
      v = v.replace(/[^\d+\s()-]/g, '');
      break;
    case 'email':
      v = v.replace(/[^\w.@+-]/g, '');
      break;
    case 'number': {
      v = v.replace(/[^\d.]/g, '');
      const dot = v.indexOf('.');
      if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
      break;
    }
    case 'integer':
      v = v.replace(/\D/g, '');
      break;
    case 'alphanumeric':
      v = v.replace(/[^a-zA-Z0-9-]/g, '');
      break;
    default:
      break;
  }

  if (def?.maxLength && v.length > def.maxLength) v = v.slice(0, def.maxLength);
  return v;
}

/**
 * @param {string} fieldKey
 * @param {unknown} value
 * @returns {string | null}
 */
export function validateField(fieldKey, value) {
  const def = getFieldDef(fieldKey);
  if (!def) return null;

  const str = String(value ?? '').trim();
  if (def.required && !str) return `${def.label} is required.`;
  if (!str) return null;

  switch (def.type) {
    case 'email':
      if (!EMAIL_REGEX.test(str)) return 'Enter a valid email address.';
      break;
    case 'phone': {
      const digits = str.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        return 'Enter a valid phone number (7–15 digits).';
      }
      break;
    }
    case 'number': {
      const n = Number(str);
      if (!Number.isFinite(n)) return `${def.label} must be a number.`;
      if (def.min != null && n < def.min) return `${def.label} must be at least ${def.min}.`;
      if (def.max != null && n > def.max) return `${def.label} must be at most ${def.max}.`;
      break;
    }
    case 'integer': {
      if (!/^\d+$/.test(str)) return `${def.label} must be a whole number.`;
      const n = Number(str);
      if (def.min != null && n < def.min) return `${def.label} must be at least ${def.min}.`;
      if (def.max != null && n > def.max) return `${def.label} must be at most ${def.max}.`;
      break;
    }
    case 'select':
      if (def.options?.length && !def.options.some((o) => o.value === str)) {
        return `Select a valid ${def.label.toLowerCase()}.`;
      }
      break;
    default:
      break;
  }

  return null;
}

/**
 * @param {{ shipper: object, receiver: object, details: object, packages: object[] }} state
 * @returns {Record<string, string>}
 */
export function validateShipmentForm(state) {
  /** @type {Record<string, string>} */
  const errors = {};

  for (const section of PARTY_SECTIONS) {
    for (const field of section.fields) {
      const key = `${section.prefix}.${field}`;
      const msg = validateField(key, state[section.prefix][field]);
      if (msg) errors[key] = msg;
    }
  }

  for (const item of DETAILS_LAYOUT) {
    if ('key' in item) {
      const field = item.key.replace('details.', '');
      const msg = validateField(item.key, state.details[field]);
      if (msg) errors[item.key] = msg;
    }
  }

  if (!state.packages?.length) {
    errors.packages = 'At least one package row is required.';
  } else {
    state.packages.forEach((pkg, i) => {
      for (const col of PACKAGE_COLUMNS) {
        const key = `packages.${i}.${col}`;
        const msg = validateField(key, pkg[col]);
        if (msg) errors[key] = msg;
      }
    });
  }

  return errors;
}

/**
 * @param {{ shipper: object, receiver: object, details: object }} groups
 * @param {string} fieldKey e.g. shipper.name
 */
export function readFieldValue(groups, fieldKey) {
  const [group, field] = fieldKey.split('.');
  return groups[group]?.[field];
}

/**
 * @param {string} fieldKey
 * @param {unknown} raw
 */
export function sanitizeByKey(fieldKey, raw) {
  const def = getFieldDef(fieldKey);
  if (!def) return raw;
  return sanitizeValue(def.type, raw, def);
}
