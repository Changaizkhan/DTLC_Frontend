import { useEffect, useMemo, useState } from 'react';
import {
  emptyPackageRow,
  formStateToCreatePayload,
  initialDetails,
  initialReceiver,
  initialShipper,
  mapShipmentToFormState,
} from '../lib/shipmentForm';

/**
 * @param {{
 *  mode: 'create' | 'view' | 'edit',
 *  shipment?: any,
 *  onSubmit: (payload: any) => void,
 *  isSubmitting?: boolean,
 *  submitError?: string,
 *  submitSuccess?: string,
 * }} props
 */
export default function ShipmentForm({
  mode,
  shipment,
  onSubmit,
  isSubmitting = false,
  submitError,
  submitSuccess,
}) {
  const isReadOnly = mode === 'view';
  const submitLabel = mode === 'edit' ? 'Update Shipment' : 'Save Shipment';

  const initial = useMemo(() => {
    const normalized =
      shipment?.shipment ?? shipment?.data ?? shipment?.result ?? shipment;
    if (normalized) return mapShipmentToFormState(normalized);
    return {
      shipper: { ...initialShipper },
      receiver: { ...initialReceiver },
      details: { ...initialDetails },
      packages: [emptyPackageRow()],
    };
  }, [shipment]);

  const [shipper, setShipper] = useState(initial.shipper);
  const [receiver, setReceiver] = useState(initial.receiver);
  const [details, setDetails] = useState(initial.details);
  const [packages, setPackages] = useState(initial.packages);

  useEffect(() => {
    setShipper(initial.shipper);
    setReceiver(initial.receiver);
    setDetails(initial.details);
    setPackages(initial.packages);
  }, [initial]);

  const updateShipper = (field, value) =>
    setShipper((p) => ({ ...p, [field]: value }));
  const updateReceiver = (field, value) =>
    setReceiver((p) => ({ ...p, [field]: value }));
  const updateDetails = (field, value) =>
    setDetails((p) => ({ ...p, [field]: value }));

  const addPackageRow = () =>
    setPackages((prev) => [...prev, emptyPackageRow()]);

  const deletePackageRow = (id) => {
    if (packages.length <= 1) {
      alert('At least one package row is required.');
      return;
    }
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePackage = (id, field, value) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    onSubmit(formStateToCreatePayload({ shipper, receiver, details, packages }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-5">
      <div className="flex-1 min-w-0 space-y-4">
        <div className="section-card">
          <div className="section-header">
            <span className="text-sm font-semibold text-gray-700">
              Shipment Details
            </span>
          </div>
          <div className="p-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest pb-1 border-b border-red-100">
                  Shipper Details
                </h3>
                <div>
                  <label className="label">Shipper Name</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter shipper name"
                    value={shipper.name}
                    onChange={(e) => updateShipper('name', e.target.value)}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="field"
                    placeholder="Enter phone number"
                    value={shipper.phone}
                    onChange={(e) => updateShipper('phone', e.target.value)}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter address"
                    value={shipper.address}
                    onChange={(e) => updateShipper('address', e.target.value)}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="field"
                    placeholder="Enter email address"
                    value={shipper.email}
                    onChange={(e) => updateShipper('email', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest pb-1 border-b border-red-100">
                  Receiver Details
                </h3>
                <div>
                  <label className="label">Receiver Name</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter receiver name"
                    value={receiver.name}
                    onChange={(e) => updateReceiver('name', e.target.value)}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="field"
                    placeholder="Enter phone number"
                    value={receiver.phone}
                    onChange={(e) => updateReceiver('phone', e.target.value)}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter address"
                    value={receiver.address}
                    onChange={(e) => updateReceiver('address', e.target.value)}
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="field"
                    placeholder="Enter email address"
                    value={receiver.email}
                    onChange={(e) => updateReceiver('email', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest pb-1 border-b border-red-100 mb-3">
                Shipment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div className="sm:col-span-2">
                  <label className="label">Type of Shipment</label>
                  <select
                    className="field"
                    value={details.typeOfShipment}
                    onChange={(e) => updateDetails('typeOfShipment', e.target.value)}
                    required
                    disabled={isReadOnly}
                  >
                    <option value="">-- Select One --</option>
                    <option value="Express">Express</option>
                    <option value="Air Freight">Air Freight</option>
                    <option value="International Shipping">International Shipping</option>
                    <option value="Truck Load">Truck Load</option>
                    <option value="Van Move">Van Move</option>
                  </select>
                </div>

                <div>
                  <label className="label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="field"
                    placeholder="e.g. 5.50"
                    value={details.shipmentWeightKg || ''}
                    onChange={(e) => updateDetails('shipmentWeightKg', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Courier</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter courier name"
                    value={details.courier}
                    onChange={(e) => updateDetails('courier', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="label">Packages</label>
                  <input
                    type="number"
                    className="field bg-gray-50 cursor-not-allowed"
                    readOnly
                    title="Auto: same as the number of package rows in the table below"
                    min={1}
                    value={packages.length}
                  />
                </div>
                <div>
                  <label className="label">Mode</label>
                  <select
                    className="field"
                    value={details.mode}
                    onChange={(e) => updateDetails('mode', e.target.value)}
                    disabled={isReadOnly}
                  >
                    <option value="">-- Select One --</option>
                    <option value="Air">Air</option>
                    <option value="Sea Transport">Sea Transport</option>
                    <option value="Land Shipping">Land Shipping</option>
                    <option value="Air Freight">Air Freight</option>
                  </select>
                </div>

                <div>
                  <label className="label">Product</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter product name"
                    value={details.product}
                    onChange={(e) => updateDetails('product', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    className="field"
                    placeholder="Enter quantity"
                    min="1"
                    value={details.quantity || ''}
                    onChange={(e) => updateDetails('quantity', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="label">Payment Method</label>
                  <select
                    className="field"
                    value={details.paymentMethod}
                    onChange={(e) =>
                      updateDetails('paymentMethod', e.target.value)
                    }
                    disabled={isReadOnly}
                  >
                    <option value="">-- Select One --</option>
                    <option value="COD">COD</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="label">Total Freight</label>
                  <div className="flex gap-2 min-w-0">
                    <select
                      className="field w-24 shrink-0 !w-24"
                      value={details.totalFreightCurrency}
                      onChange={(e) =>
                        updateDetails('totalFreightCurrency', e.target.value)
                      }
                      disabled={isReadOnly}
                    >
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="field field-flex-1"
                      placeholder="Amount"
                      value={details.totalFreightAmount || ''}
                      onChange={(e) =>
                        updateDetails('totalFreightAmount', e.target.value)
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Carrier</label>
                  <select
                    className="field"
                    value={details.carrier}
                    onChange={(e) => updateDetails('carrier', e.target.value)}
                    disabled={isReadOnly}
                  >
                    <option value="">-- Select One --</option>
                    <option value="DTLC">DTLC</option>
                    <option value="FedEx">FedEx</option>
                    <option value="DHL">DHL</option>
                  </select>
                </div>
                <div>
                  <label className="label">Carrier Reference No.</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter reference number"
                    value={details.carrierReferenceNo}
                    onChange={(e) =>
                      updateDetails('carrierReferenceNo', e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="label">Departure Time</label>
                  <input
                    type="time"
                    className="field"
                    value={details.departureTime}
                    onChange={(e) =>
                      updateDetails('departureTime', e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Origin</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter origin"
                    value={details.origin}
                    onChange={(e) => updateDetails('origin', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="label">Destination</label>
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter destination"
                    value={details.destination}
                    onChange={(e) =>
                      updateDetails('destination', e.target.value)
                    }
                    required
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Pickup Date</label>
                  <input
                    type="date"
                    className="field"
                    value={details.pickupDate}
                    onChange={(e) => updateDetails('pickupDate', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="label">Pickup Time</label>
                  <input
                    type="time"
                    className="field"
                    value={details.pickupTime}
                    onChange={(e) => updateDetails('pickupTime', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="label">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="field"
                    value={details.expectedDeliveryDate}
                    onChange={(e) =>
                      updateDetails('expectedDeliveryDate', e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Comments</label>
                  <textarea
                    rows="3"
                    className="field resize-none"
                    placeholder="Enter any additional comments..."
                    value={details.comments}
                    onChange={(e) => updateDetails('comments', e.target.value)}
                    disabled={isReadOnly}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <span className="text-sm font-semibold text-gray-700">Packages</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                    Qty.
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                    Piece Type
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                    Description
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                    Length (cm)
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                    Width (cm)
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                    Height (cm)
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                    Weight (kg)
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-gray-100">
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={pkg.quantity}
                        min="1"
                        onChange={(e) =>
                          updatePackage(pkg.id, 'quantity', e.target.value)
                        }
                        className="field w-16 text-center"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={pkg.pieceType}
                        onChange={(e) =>
                          updatePackage(pkg.id, 'pieceType', e.target.value)
                        }
                        className="field w-28"
                        disabled={isReadOnly}
                      >
                        <option value="">-- Select Type --</option>
                        <option value="Box">Box</option>
                        <option value="Envelope">Envelope</option>
                        <option value="Pallet">Pallet</option>
                        <option value="Roll">Roll</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <textarea
                        rows="1"
                        value={pkg.description}
                        onChange={(e) =>
                          updatePackage(pkg.id, 'description', e.target.value)
                        }
                        className="field w-32 resize-none"
                        disabled={isReadOnly}
                      ></textarea>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={pkg.lengthCm}
                        min="0"
                        onChange={(e) =>
                          updatePackage(pkg.id, 'lengthCm', e.target.value)
                        }
                        className="field w-20 text-center"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={pkg.widthCm}
                        min="0"
                        onChange={(e) =>
                          updatePackage(pkg.id, 'widthCm', e.target.value)
                        }
                        className="field w-20 text-center"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={pkg.heightCm}
                        min="0"
                        onChange={(e) =>
                          updatePackage(pkg.id, 'heightCm', e.target.value)
                        }
                        className="field w-20 text-center"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={pkg.weightKg}
                        min="0"
                        step="0.01"
                        onChange={(e) =>
                          updatePackage(pkg.id, 'weightKg', e.target.value)
                        }
                        className="field w-20 text-center"
                        disabled={isReadOnly}
                      />
                    </td>
                    <td className="px-2 py-2">
                      {isReadOnly ? (
                        <span className="text-[11px] text-gray-400">
                          Read only
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => deletePackageRow(pkg.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-150 whitespace-nowrap"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 space-y-3">
            {!isReadOnly && (
              <button
                type="button"
                onClick={addPackageRow}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
              >
                + Add Package
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Total Volumetric Weight:</span>{' '}
                0.0 kg.
              </p>
              <p className="text-xs text-gray-600 text-center">
                <span className="font-semibold">Total Volume:</span> 0.0 cu. m.
              </p>
              <p className="text-xs text-gray-600 text-right">
                <span className="font-semibold">Total Actual Weight:</span> 0.0
                kg.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 pb-6">
          {mode !== 'view' && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-8 py-3 rounded-xl shadow-lg shadow-red-600/20 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {submitLabel}
                </>
              )}
            </button>
          )}

          {submitError ? (
            <p className="text-xs text-red-500 font-medium">{submitError}</p>
          ) : null}
          {submitSuccess ? (
            <p className="text-xs text-green-600 font-medium">{submitSuccess}</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

