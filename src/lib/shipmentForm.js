import { validateShipmentForm as validateBySchema } from './schema';

export const emptyPackageRow = () => ({
  id: Date.now() + Math.random(),
  quantity: 1,
  pieceType: '',
  description: '',
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
  weightKg: 1,
});

export const initialShipper = { name: '', phone: '', address: '', email: '' };
export const initialReceiver = { name: '', phone: '', address: '', email: '' };
export const initialDetails = {
  typeOfShipment: '',
  numberOfPackages: 1,
  shipmentWeightKg: 0,
  courier: '',
  mode: '',
  product: '',
  quantity: 1,
  paymentMethod: '',
  totalFreightAmount: 0,
  totalFreightCurrency: 'PKR',
  carrier: '',
  carrierReferenceNo: '',
  departureTime: '',
  origin: '',
  destination: '',
  pickupDate: '',
  pickupTime: '',
  expectedDeliveryDate: '',
  comments: '',
};

function toDateInput(value) {
  if (!value) return '';
  const s = String(value);
  // supports ISO strings like "2026-04-14T21:12:04.731Z"
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/**
 * Supports both backend shapes:
 * - nested: { shipper: {name...}, receiver: {...}, details: {...}, packages: [...] }
 * - flat: { shipperName, shipperPhone, ..., receiverName, ..., typeOfShipment, ... }
 */
export function mapShipmentToFormState(shipment) {
  const s = shipment ?? {};

  const shipper = s.shipper
    ? {
        name: s.shipper.name ?? '',
        phone: s.shipper.phone ?? '',
        address: s.shipper.address ?? '',
        email: s.shipper.email ?? '',
      }
    : {
        name: s.shipperName ?? '',
        phone: s.shipperPhone ?? '',
        address: s.shipperAddress ?? '',
        email: s.shipperEmail ?? '',
      };

  const receiver = s.receiver
    ? {
        name: s.receiver.name ?? '',
        phone: s.receiver.phone ?? '',
        address: s.receiver.address ?? '',
        email: s.receiver.email ?? '',
      }
    : {
        name: s.receiverName ?? '',
        phone: s.receiverPhone ?? '',
        address: s.receiverAddress ?? '',
        email: s.receiverEmail ?? '',
      };

  const d = s.details ?? s;
  const details = {
    ...initialDetails,
    typeOfShipment: d.typeOfShipment ?? '',
    shipmentWeightKg: Number(d.shipmentWeightKg ?? 0),
    courier: d.courier ?? '',
    mode: d.mode ?? '',
    product: d.product ?? '',
    quantity: Number(d.quantity ?? 1),
    paymentMethod: d.paymentMethod ?? '',
    totalFreightAmount: Number(d.totalFreightAmount ?? 0),
    totalFreightCurrency: d.totalFreightCurrency ?? 'PKR',
    carrier: d.carrier ?? '',
    carrierReferenceNo: d.carrierReferenceNo ?? '',
    departureTime: d.departureTime ?? '',
    origin: d.origin ?? '',
    destination:
      d.destination ??
      s.destination ??
      (s.receiver?.address ?? '') ??
      '',
    pickupDate: toDateInput(d.pickupDate ?? s.pickupDate),
    pickupTime: d.pickupTime ?? s.pickupTime ?? '',
    expectedDeliveryDate: toDateInput(
      d.expectedDeliveryDate ?? s.expectedDeliveryDate
    ),
    comments: d.comments ?? '',
  };

  const packagesRaw = Array.isArray(s.packages) ? s.packages : [];
  const packages =
    packagesRaw.length > 0
      ? packagesRaw.map((p) => ({
          id: Date.now() + Math.random(),
          quantity: Number(p.quantity ?? 1),
          pieceType: p.pieceType ?? '',
          description: p.description ?? '',
          lengthCm: Number(p.lengthCm ?? 0),
          widthCm: Number(p.widthCm ?? 0),
          heightCm: Number(p.heightCm ?? 0),
          weightKg: Number(p.weightKg ?? 0),
        }))
      : [emptyPackageRow()];

  return { shipper, receiver, details, packages };
}

/**
 * @param {{ shipper: typeof initialShipper, receiver: typeof initialReceiver, details: typeof initialDetails, packages: ReturnType<typeof emptyPackageRow>[] }} state
 * @returns {Record<string, string>}
 */
export function validateShipmentForm(state) {
  return validateBySchema(state);
}

export function formStateToCreatePayload({ shipper, receiver, details, packages }) {
  return {
    shipper: {
      name: shipper.name.trim(),
      phone: shipper.phone.trim(),
      address: shipper.address.trim(),
      email: shipper.email.trim(),
    },
    receiver: {
      name: receiver.name.trim(),
      phone: receiver.phone.trim(),
      address: receiver.address.trim(),
      email: receiver.email.trim(),
    },
    details: {
      ...details,
      typeOfShipment: String(details.typeOfShipment).trim(),
      courier: String(details.courier).trim(),
      mode: String(details.mode).trim(),
      product: String(details.product).trim(),
      paymentMethod: String(details.paymentMethod).trim(),
      totalFreightCurrency: String(details.totalFreightCurrency).trim(),
      carrier: String(details.carrier).trim(),
      carrierReferenceNo: String(details.carrierReferenceNo).trim(),
      departureTime: String(details.departureTime).trim(),
      origin: String(details.origin).trim(),
      destination: String(details.destination).trim(),
      pickupDate: String(details.pickupDate).trim(),
      pickupTime: String(details.pickupTime).trim(),
      expectedDeliveryDate: String(details.expectedDeliveryDate).trim(),
      comments: String(details.comments).trim(),
      numberOfPackages: packages.length,
      shipmentWeightKg: Number(details.shipmentWeightKg),
      quantity: Number(details.quantity),
      totalFreightAmount: Number(details.totalFreightAmount),
    },
    packages: packages.map(({ id, ...rest }) => ({
      quantity: Number(rest.quantity),
      pieceType: String(rest.pieceType).trim(),
      description: String(rest.description).trim(),
      lengthCm: Number(rest.lengthCm),
      widthCm: Number(rest.widthCm),
      heightCm: Number(rest.heightCm),
      weightKg: Number(rest.weightKg),
    })),
  };
}

