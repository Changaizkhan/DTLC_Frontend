import { useMemo, useState, useEffect } from 'react';
import { useShipment } from '../hooks/api';
import { getApiErrorMessage } from '../api/errors';
import { normalizeInvoiceData } from '../lib/invoice';

function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <svg className="w-6 h-6 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="ml-3 text-sm text-gray-500">{label}</span>
    </div>
  );
}

/**
 * @param {{ shipmentId: string }} props
 */
export default function InvoiceModal({ shipmentId }) {
  const { data, isLoading, isFetching, isError, error } = useShipment(shipmentId || undefined);

  const [mapping, setMapping] = useState(true);
  const invoice = useMemo(() => normalizeInvoiceData(data), [data]);

  useEffect(() => {
    if (isLoading || isFetching) {
      setMapping(true);
      return;
    }
    const t = window.setTimeout(() => setMapping(false), 150);
    return () => window.clearTimeout(t);
  }, [isLoading, isFetching, data]);

  if (isLoading || isFetching) return <Spinner label="Fetching shipment..." />;
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
        {getApiErrorMessage(error)}
      </div>
    );
  }
  if (mapping || !invoice) return <Spinner label="Preparing invoice..." />;

  return (
    <div className="bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 mb-5">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Invoice</div>
          <div className="text-lg font-bold text-gray-800 truncate">
            {invoice.shipmentNumber || shipmentId}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Date: {invoice.createdAt || '—'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-3">Shipper Details</div>
          <div className="text-sm font-semibold text-gray-800">{invoice.shipper.name || '—'}</div>
          {invoice.shipper.company ? <div className="text-xs text-gray-500">{invoice.shipper.company}</div> : null}
          {invoice.shipper.phone ? <div className="text-xs text-gray-500">{invoice.shipper.phone}</div> : null}
          {invoice.shipper.address ? <div className="text-xs text-gray-500">{invoice.shipper.address}</div> : null}
          {invoice.shipper.email ? <div className="text-xs text-gray-500">{invoice.shipper.email}</div> : null}
        </div>

        <div className="border border-gray-200 rounded-xl p-4">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-3">Receiver Details</div>
          <div className="text-sm font-semibold text-gray-800">{invoice.receiver.name || '—'}</div>
          {invoice.receiver.phone ? <div className="text-xs text-gray-500">{invoice.receiver.phone}</div> : null}
          {invoice.receiver.address ? <div className="text-xs text-gray-500">{invoice.receiver.address}</div> : null}
          {invoice.receiver.email ? <div className="text-xs text-gray-500">{invoice.receiver.email}</div> : null}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl mt-4 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Package Details</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white text-gray-600">
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Qty.</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Piece Type</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Description</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Length (cm)</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Width (cm)</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Height (cm)</th>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.packages?.length ? invoice.packages : [{ qty: 0, type: '', desc: '', l: 0, w: 0, h: 0, wt: 0 }]).map((p, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-2">{p.qty}</td>
                  <td className="px-3 py-2">{p.type}</td>
                  <td className="px-3 py-2">{p.desc}</td>
                  <td className="px-3 py-2">{p.l}</td>
                  <td className="px-3 py-2">{p.w}</td>
                  <td className="px-3 py-2">{p.h}</td>
                  <td className="px-3 py-2">{p.wt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 py-3 border-t border-gray-100 bg-white">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Total Volumetric Weight</div>
            <div className="text-sm font-semibold text-gray-800">{invoice.weights?.vol || '—'}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Total Volume</div>
            <div className="text-sm font-semibold text-gray-800">{invoice.weights?.volume || '—'}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Total Actual Weight</div>
            <div className="text-sm font-semibold text-gray-800">{invoice.weights?.actual || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

