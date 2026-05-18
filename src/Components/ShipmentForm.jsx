import { useEffect, useMemo, useState } from 'react';
import {
  emptyPackageRow,
  formStateToCreatePayload,
  initialDetails,
  initialReceiver,
  initialShipper,
  mapShipmentToFormState,
  validateShipmentForm,
} from '../lib/shipmentForm';
import {
  DETAILS_LAYOUT,
  PACKAGE_COLUMNS,
  PARTY_SECTIONS,
  sanitizeByKey,
} from '../lib/schema';
import { SchemaFormField, ErrorText } from './SchemaFormField';
import ShipmentMetaBanner from './ShipmentMetaBanner';
import { getShipmentMeta } from '../lib/shipmentMeta';

/**
 * @param {{
 *  mode: 'create' | 'view' | 'edit',
 *  shipment?: any,
 *  onSubmit: (payload: any) => void,
 *  isSubmitting?: boolean,
 *  serverFieldErrors?: Record<string, string>,
 *  submitSuccess?: string,
 * }} props
 */
export default function ShipmentForm({
  mode,
  shipment,
  onSubmit,
  isSubmitting = false,
  serverFieldErrors = {},
  submitSuccess,
}) {
  const isReadOnly = mode === 'view';
  const submitLabel = mode === 'edit' ? 'Update Shipment' : 'Save Shipment';

  const shipmentMeta = useMemo(
    () => (shipment ? getShipmentMeta(shipment) : null),
    [shipment]
  );

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
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setShipper(initial.shipper);
    setReceiver(initial.receiver);
    setDetails(initial.details);
    setPackages(initial.packages);
    setFieldErrors({});
  }, [initial]);

  useEffect(() => {
    if (Object.keys(serverFieldErrors).length) {
      setFieldErrors((prev) => ({ ...prev, ...serverFieldErrors }));
    }
  }, [serverFieldErrors]);

  const err = (key) => fieldErrors[key];

  const clearError = (key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const setPartyField = (party, field, raw) => {
    const key = `${party}.${field}`;
    clearError(key);
    const value = sanitizeByKey(key, raw);
    if (party === 'shipper') setShipper((p) => ({ ...p, [field]: value }));
    else setReceiver((p) => ({ ...p, [field]: value }));
  };

  const setDetailField = (field, raw) => {
    const key = `details.${field}`;
    clearError(key);
    setDetails((p) => ({ ...p, [field]: sanitizeByKey(key, raw) }));
  };

  const addPackageRow = () => setPackages((prev) => [...prev, emptyPackageRow()]);

  const deletePackageRow = (id) => {
    if (packages.length <= 1) {
      setFieldErrors((prev) => ({
        ...prev,
        packages: 'At least one package row is required.',
      }));
      return;
    }
    clearError('packages');
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const setPackageField = (id, field, raw, index) => {
    clearError(`packages.${index}.${field}`);
    const key = `packages.${field}`;
    const value = sanitizeByKey(key, raw);
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    const validation = validateShipmentForm({
      shipper,
      receiver,
      details,
      packages,
    });
    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      return;
    }

    setFieldErrors({});
    onSubmit(formStateToCreatePayload({ shipper, receiver, details, packages }));
  };

  const packageInputClass = {
    quantity: 'w-16 text-center',
    pieceType: 'w-28',
    description: 'w-32',
    lengthCm: 'w-20 text-center',
    widthCm: 'w-20 text-center',
    heightCm: 'w-20 text-center',
    weightKg: 'w-20 text-center',
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-5">
      {err('_form') ? (
        <div className="xl:col-span-full w-full bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-medium">
          {err('_form')}
        </div>
      ) : null}

      <div className="flex-1 min-w-0 space-y-4">
        {(mode === 'view' || mode === 'edit') && shipmentMeta ? (
          <ShipmentMetaBanner
            status={shipmentMeta.status}
            currentLocation={shipmentMeta.currentLocation}
            shipmentNumber={shipmentMeta.shipmentNumber}
          />
        ) : null}
        <div className="section-card">
          <div className="section-header">
            <span className="text-sm font-semibold text-gray-700">Shipment Details</span>
          </div>
          <div className="p-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PARTY_SECTIONS.map((section) => (
                <div key={section.prefix} className="space-y-3">
                  <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest pb-1 border-b border-red-100">
                    {section.title}
                  </h3>
                  {section.fields.map((field) => {
                    const key = `${section.prefix}.${field}`;
                    return (
                      <SchemaFormField
                        key={key}
                        fieldKey={key}
                        value={section.prefix === 'shipper' ? shipper[field] : receiver[field]}
                        onChange={(v) => setPartyField(section.prefix, field, v)}
                        error={err(key)}
                        disabled={isReadOnly}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest pb-1 border-b border-red-100 mb-3">
                Shipment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {DETAILS_LAYOUT.map((item) => {
                  if (item.type === 'packagesCount') {
                    return (
                      <div key="packages-count">
                        <label className="label">Packages</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="field bg-gray-50 cursor-not-allowed"
                          readOnly
                          title="Auto: same as the number of package rows in the table below"
                          value={packages.length}
                        />
                      </div>
                    );
                  }

                  if (item.type === 'freightRow') {
                    return (
                      <div key="freight-row">
                        <label className="label">Total Freight</label>
                        <div className="flex gap-2 min-w-0">
                          <SchemaFormField
                            fieldKey="details.totalFreightCurrency"
                            value={details.totalFreightCurrency}
                            onChange={(v) => setDetailField('totalFreightCurrency', v)}
                            error={err('details.totalFreightCurrency')}
                            disabled={isReadOnly}
                            hideLabel
                            inputClassName="w-24 shrink-0 !w-24"
                            className="shrink-0"
                          />
                          <SchemaFormField
                            fieldKey="details.totalFreightAmount"
                            value={details.totalFreightAmount}
                            onChange={(v) => setDetailField('totalFreightAmount', v)}
                            error={err('details.totalFreightAmount')}
                            disabled={isReadOnly}
                            hideLabel
                            inputClassName="field-flex-1"
                            className="flex-1 min-w-0"
                            placeholder="Amount"
                          />
                        </div>
                      </div>
                    );
                  }

                  const field = item.key.replace('details.', '');
                  const col =
                    item.colSpan === 2 ? 'sm:col-span-2' : undefined;

                  return (
                    <SchemaFormField
                      key={item.key}
                      fieldKey={item.key}
                      value={details[field]}
                      onChange={(v) => setDetailField(field, v)}
                      error={err(item.key)}
                      disabled={isReadOnly}
                      className={col}
                      placeholder={item.placeholder}
                    />
                  );
                })}
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
                  {PACKAGE_COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2.5 text-left font-semibold whitespace-nowrap"
                    >
                      {col === 'quantity'
                        ? 'Qty.'
                        : col === 'pieceType'
                          ? 'Piece Type'
                          : col === 'lengthCm'
                            ? 'Length (cm)'
                            : col === 'widthCm'
                              ? 'Width (cm)'
                              : col === 'heightCm'
                                ? 'Height (cm)'
                                : col === 'weightKg'
                                  ? 'Weight (kg)'
                                  : 'Description'}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg, pkgIndex) => (
                  <tr key={pkg.id} className="border-b border-gray-100">
                    {PACKAGE_COLUMNS.map((col) => (
                      <td key={col} className="px-2 py-2 align-top">
                        <SchemaFormField
                          fieldKey={`packages.${col}`}
                          value={pkg[col]}
                          onChange={(v) => setPackageField(pkg.id, col, v, pkgIndex)}
                          error={err(`packages.${pkgIndex}.${col}`)}
                          disabled={isReadOnly}
                          hideLabel
                          inputClassName={packageInputClass[col]}
                          emptyOptionLabel="-- Select Type --"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      {isReadOnly ? (
                        <span className="text-[11px] text-gray-400">Read only</span>
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
            <ErrorText message={err('packages')} />
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => {
                  clearError('packages');
                  addPackageRow();
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
              >
                + Add Package
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Total Volumetric Weight:</span> 0.0 kg.
              </p>
              <p className="text-xs text-gray-600 text-center">
                <span className="font-semibold">Total Volume:</span> 0.0 cu. m.
              </p>
              <p className="text-xs text-gray-600 text-right">
                <span className="font-semibold">Total Actual Weight:</span> 0.0 kg.
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
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          )}
          {submitSuccess ? (
            <p className="text-xs text-green-600 font-medium">{submitSuccess}</p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
