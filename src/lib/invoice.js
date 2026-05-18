function unwrapShipmentPayload(raw) {
  if (!raw) return null;
  return raw.shipment ?? raw.data ?? raw.result ?? raw;
}

function fmtDate(v) {
  if (!v) return '';
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/**
 * @param {any} raw shipment API response
 */
export function normalizeInvoiceData(raw) {
  const r = unwrapShipmentPayload(raw);
  if (!r) return null;

  const d = r.details ?? r;
  const shipper = r.shipper ?? {
    name: r.shipperName,
    phone: r.shipperPhone,
    email: r.shipperEmail,
    address: r.shipperAddress,
    company: r.shipperCompany,
  };
  const receiver = r.receiver ?? {
    name: r.receiverName,
    phone: r.receiverPhone,
    email: r.receiverEmail,
    address: r.receiverAddress,
  };

  const packages = Array.isArray(r.packages) ? r.packages : Array.isArray(d.packages) ? d.packages : [];
  const normalizedPackages = packages.map((p) => ({
    qty: p.quantity ?? p.qty ?? 0,
    type: p.pieceType ?? p.type ?? '',
    desc: p.description ?? p.desc ?? '',
    l: p.lengthCm ?? p.length ?? p.l ?? 0,
    w: p.widthCm ?? p.width ?? p.w ?? 0,
    h: p.heightCm ?? p.height ?? p.h ?? 0,
    wt: p.weightKg ?? p.weight ?? p.wt ?? 0,
  }));

  const weights = r.weights ?? {
    vol:
      r.totalVolumetricWeightKg != null
        ? `${r.totalVolumetricWeightKg} kg`
        : (d.totalVolumetricWeightKg != null ? `${d.totalVolumetricWeightKg} kg` : ''),
    volume:
      r.totalVolumeCubicM != null
        ? `${r.totalVolumeCubicM} cu. m.`
        : (d.totalVolumeCubicM != null ? `${d.totalVolumeCubicM} cu. m.` : ''),
    actual:
      r.totalActualWeightKg != null
        ? `${r.totalActualWeightKg} kg`
        : (d.totalActualWeightKg != null ? `${d.totalActualWeightKg} kg` : ''),
  };

  return {
    shipmentNumber: r.shipmentNumber ?? r.trackingNumber ?? r.id ?? r._id ?? '',
    status: r.status ?? '',
    currentLocation: r.currentLocation ?? '',
    createdAt: fmtDate(r.createdAt ?? r.date ?? d.pickupDate),
    shipper: {
      name: shipper?.name ?? '',
      phone: shipper?.phone ?? '',
      email: shipper?.email ?? '',
      address: shipper?.address ?? '',
      company: shipper?.company ?? '',
    },
    receiver: {
      name: receiver?.name ?? '',
      phone: receiver?.phone ?? '',
      email: receiver?.email ?? '',
      address: receiver?.address ?? '',
    },
    details: {
      origin: d.origin ?? r.origin ?? '',
      destination: d.destination ?? r.destination ?? '',
      carrier: d.carrier ?? r.carrier ?? '',
      mode: d.mode ?? r.mode ?? '',
      typeOfShipment: d.typeOfShipment ?? r.typeOfShipment ?? '',
      weightKg: d.shipmentWeightKg ?? r.shipmentWeightKg ?? '',
      product: d.product ?? r.product ?? '',
      qty: d.quantity ?? r.quantity ?? '',
      paymentMethod: d.paymentMethod ?? r.paymentMethod ?? '',
      pickupDate: fmtDate(d.pickupDate ?? r.pickupDate),
      expectedDeliveryDate: fmtDate(d.expectedDeliveryDate ?? r.expectedDeliveryDate),
      comments: d.comments ?? r.comments ?? '',
    },
    packages: normalizedPackages,
    weights,
  };
}

