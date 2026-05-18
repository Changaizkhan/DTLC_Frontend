import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useDeleteShipment,
  useShipment,
  useShipmentsList,
  useUpdateShipment,
  useUpdateShipmentCurrentLocation,
  useUpdateShipmentStatus,
} from '../hooks/api';
import { getApiErrorMessage, getApiFieldErrors } from '../api/errors';
import Modal from '../Components/Modal';
import ShipmentForm from '../Components/ShipmentForm';
import InvoiceModal from '../Components/InvoiceModal';

const PAGE_SIZE = 20;
const sortKeys = ['id', 'receiver', 'dest', 'date', 'status'];
const ALL_STATUSES = [
  'Pending', 'Picked up', 'On Hold', 'Out for delivery',
  'In Transit', 'Enroute', 'Custom Cleared', 'Processing in facility',
  'In transit to export hub', 'In Hub', 'Cancelled', 'Delivered', 'Returned',
];

function badgeClass(status) {
  const map = {
    'Pending':          'bg-yellow-100 text-yellow-700',
    'Picked up':        'bg-blue-100 text-blue-700',
    'On Hold':          'bg-purple-100 text-purple-700',
    'Out for delivery': 'bg-indigo-100 text-indigo-700',
    'In Transit':       'bg-orange-100 text-orange-700',
    'Enroute':          'bg-cyan-100 text-cyan-700',
    'Cancelled':        'bg-gray-200 text-gray-600',
    'Delivered':        'bg-green-100 text-green-700',
    'Returned':         'bg-red-100 text-red-600',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

const statCards = [
  {
    label: 'All Shipments',
    tagLabel: 'Total',
    subLabel: 'Shipments',
    statusText: 'Active',
    statusColor: 'green',
    countKey: 'all',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M9 14h.01M9 18h.01M15 14h2m-2 4h2" />
      </svg>
    ),
  },
  {
    label: 'Add New Shipment',
    tagLabel: 'New',
    subLabel: 'Create',
    statusText: 'Available',
    statusColor: 'green',
    to: '/add-shipment',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: 'Delivered',
    tagLabel: 'Done',
    subLabel: 'Status',
    statusText: 'Completed',
    statusColor: 'green',
    countKey: 'delivered',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Picked Up',
    tagLabel: 'In Transit',
    subLabel: 'Status',
    statusText: '72h average',
    statusColor: 'orange',
    countKey: 'pickedUp',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const statusMutation = useUpdateShipmentStatus();
  const locationMutation = useUpdateShipmentCurrentLocation();
  const updateShipmentMutation = useUpdateShipment();
  const deleteShipmentMutation = useDeleteShipment();
  const [locationDrafts, setLocationDrafts] = useState({});
  const [locationNotice, setLocationNotice] = useState(
    /** @type {{ type: 'success' | 'error', text: string } | null} */ (null)
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortCol, setSortCol] = useState(3);
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState(/** @type {'view'|'edit'} */ ('view'));
  const [activeShipmentId, setActiveShipmentId] = useState('');
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [modalFieldErrors, setModalFieldErrors] = useState({});

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceShipmentId, setInvoiceShipmentId] = useState('');

  const {
    data: activeShipment,
    isLoading: isActiveLoading,
    isError: isActiveError,
    error: activeError,
  } = useShipment(activeShipmentId || undefined);

  const { data: shipmentsData, isLoading, isError, error: fetchError } = useShipmentsList();
  const allShipments = useMemo(() => {
    if (!shipmentsData) return [];
    const list = Array.isArray(shipmentsData) ? shipmentsData : shipmentsData.shipments ?? shipmentsData.data ?? [];
    return list.map((s) => ({
      apiId: s._id ?? s.id ?? s.trackingNumber ?? '',
      displayId: s.shipmentNumber ?? s.trackingNumber ?? s.id ?? s._id ?? '',
      receiver: s.receiver?.name ?? s.receiverName ?? '',
      dest: s.receiver?.address ?? s.destination ?? '',
      date: (s.createdAt ?? s.pickupDate ?? s.date ?? '').slice(0, 10),
      status: s.status ?? 'Pending',
      currentLocation: s.currentLocation ?? '',
    }));
  }, [shipmentsData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = allShipments.filter((s) => {
      const matchQ =
        !q ||
        String(s.displayId).toLowerCase().includes(q) ||
        String(s.apiId).toLowerCase().includes(q) ||
        s.receiver.toLowerCase().includes(q) ||
        s.dest.toLowerCase().includes(q);
      const matchS = !statusFilter || s.status === statusFilter;
      const matchD = !dateFilter || s.date === dateFilter;
      return matchQ && matchS && matchD;
    });

    const key = sortKeys[sortCol];
    result.sort((a, b) => {
      const av = String(a[key] ?? '').toLowerCase();
      const bv = String(b[key] ?? '').toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return result;
  }, [allShipments, search, statusFilter, dateFilter, sortCol, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageData = filtered.slice(start, start + PAGE_SIZE);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = ['Shipment ID', 'Receiver Name', 'Destination', 'Date', 'Status'];
    const rows = filtered.map((s) =>
      [s.id, s.receiver, s.dest, s.date, s.status].map((v) => `"${v}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'shipments.csv';
    a.click();
  };

  const printInvoice = (displayId) => {
    setInvoiceShipmentId(displayId);
    setInvoiceOpen(true);
  };
  const closeModal = useCallback(() => {
    setOpenModal(false);
    setActiveShipmentId('');
    setModalSuccessMsg('');
    setModalFieldErrors({});
  }, []);

  const closeInvoice = useCallback(() => {
    setInvoiceOpen(false);
    setInvoiceShipmentId('');
  }, []);

  const handleView = (shipmentNumber) => {
    setModalMode('view');
    setActiveShipmentId(shipmentNumber);
    setModalSuccessMsg('');
    setModalFieldErrors({});
    setOpenModal(true);
  };

  const handleUpdate = (shipmentNumber) => {
    setModalMode('edit');
    setActiveShipmentId(shipmentNumber);
    setModalSuccessMsg('');
    setModalFieldErrors({});
    setOpenModal(true);
  };

  const handleEditSubmit = (payload) => {
    setModalSuccessMsg('');
    setModalFieldErrors({});
    updateShipmentMutation.mutate(
      { id: activeShipmentId, payload },
      {
        onSuccess: () => {
          setModalSuccessMsg('Shipment updated successfully!');
          window.setTimeout(() => closeModal(), 900);
        },
        onError: (err) => setModalFieldErrors(getApiFieldErrors(err)),
      }
    );
  };

  const getLocationDraft = (id, fallback = '') =>
    locationDrafts[id] ?? fallback;

  const setLocationDraft = (id, value) => {
    setLocationDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (id, newStatus) => {
    const currentLocation = getLocationDraft(id).trim();
    setLocationNotice(null);
    statusMutation.mutate(
      { id, status: newStatus, ...(currentLocation ? { currentLocation } : {}) },
      {
        onSuccess: () => {
          if (currentLocation) {
            setLocationDrafts((prev) => ({ ...prev, [id]: '' }));
            setLocationNotice({
              type: 'success',
              text: `Status and location updated for ${id}.`,
            });
          }
        },
        onError: (err) =>
          setLocationNotice({ type: 'error', text: getApiErrorMessage(err) }),
      }
    );
  };

  const handleLocationEnter = (id) => {
    const currentLocation = getLocationDraft(id).trim();
    if (!currentLocation) return;

    setLocationNotice(null);
    locationMutation.mutate(
      { id, currentLocation },
      {
        onSuccess: () => {
          setLocationDrafts((prev) => ({ ...prev, [id]: '' }));
          setLocationNotice({
            type: 'success',
            text: `Current location saved for ${id}.`,
          });
        },
        onError: (err) =>
          setLocationNotice({ type: 'error', text: getApiErrorMessage(err) }),
      }
    );
  };
  const handleDelete = (id) => {
    if (confirm(`Are you sure you want to delete ${id}?`)) {
      deleteShipmentMutation.mutate(id);
    }
  };

  const deliveredCount = allShipments.filter((s) => s.status === 'Delivered').length;
  const pickedUpCount = allShipments.filter((s) => s.status === 'Picked up' || s.status === 'In Transit').length;

  return (
    <div>
      <Modal open={invoiceOpen} title="Invoice" onClose={closeInvoice}>
        {invoiceShipmentId ? (
          <InvoiceModal shipmentId={invoiceShipmentId} />
        ) : null}
      </Modal>

      <Modal
        open={openModal}
        title={modalMode === 'view' ? 'View Shipment' : 'Edit Shipment'}
        onClose={closeModal}
      >
        {isActiveLoading && (
          <div className="flex items-center justify-center py-20">
            <svg className="w-6 h-6 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-sm text-gray-500">Loading shipment...</span>
          </div>
        )}

        {isActiveError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {getApiErrorMessage(activeError)}
          </div>
        )}

        {!isActiveLoading && !isActiveError && activeShipment && (
          <ShipmentForm
            mode={modalMode}
            shipment={activeShipment}
            onSubmit={modalMode === 'edit' ? handleEditSubmit : () => {}}
            isSubmitting={updateShipmentMutation.isPending}
            serverFieldErrors={modalFieldErrors}
            submitSuccess={modalSuccessMsg || undefined}
          />
        )}
      </Modal>

      {locationNotice ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium ${
            locationNotice.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          {locationNotice.text}
        </div>
      ) : null}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in-2">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={() => card.to && navigate(card.to)}
            className={`bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 card-hover ${card.to ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                {card.icon}
              </div>
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                {card.tagLabel}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{card.subLabel}</p>
              <p className="text-lg font-bold text-gray-800">
                {card.countKey === 'all' ? allShipments.length
                  : card.countKey === 'delivered' ? deliveredCount
                  : card.countKey === 'pickedUp' ? pickedUpCount
                  : card.label}
              </p>
              <p className="text-[11px] text-gray-400">{card.label}</p>
            </div>
            <p
              className={`text-xs flex items-center gap-1.5 ${
                card.statusColor === 'orange' ? 'text-orange-400' : 'text-green-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  card.statusColor === 'orange' ? 'bg-orange-400' : 'bg-green-500'
                }`}
              ></span>
              {card.statusText}
            </p>
          </div>
        ))}
      </div>

      {/* LOADING / ERROR */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <svg className="w-6 h-6 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-sm text-gray-500">Loading shipments...</span>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6 text-sm text-red-600">
          {getApiErrorMessage(fetchError)}
        </div>
      )}

      {/* SHIPMENTS TABLE SECTION */}
      {!isLoading && !isError && (
      <div className="fade-in space-y-4 mt-10">       {/* Toolbar: filter + count */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 cursor-pointer"
              style={{
                backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%239ca3af%27 stroke-width=%272%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E')",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '0.9rem',
                appearance: 'none',
                paddingRight: '1.8rem',
              }}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Picked up">Picked up</option>
              <option value="On Hold">On Hold</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="In Transit">In Transit</option>
              <option value="Enroute">Enroute</option>
              <option value="Custom Cleared">Custom Cleared</option>
              <option value="Processing in facility">Processing in facility</option>
              <option value="In transit to export hub">In transit to export hub</option>
              <option value="In Hub">In Hub</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />

            <button
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-3 py-2 transition-colors duration-150"
            >
              Clear Filters
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">
              {filtered.length} shipment{filtered.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f1923] text-white text-xs uppercase tracking-wider">
                  {['Shipment ID', 'Receiver Name', 'Destination', 'Date', 'Status', 'Current Location'].map((header, idx) => (
                    <th
                      key={header}
                      onClick={() => handleSort(idx)}
                      className="px-4 py-3 text-left font-semibold cursor-pointer select-none whitespace-nowrap"
                    >
                      {header} <span className="text-gray-400 ml-1">{'\u2195'}</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Actions</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Print</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((s, i) => (
                  <tr
                    key={`${s.displayId}-${s.apiId || 'na'}-${i}`}
                    className={`shipment-row border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-red-600 font-semibold text-xs hover:underline cursor-pointer">{s.displayId}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-700">{s.receiver}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{s.dest}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px]">
                      <span className="line-clamp-2" title={s.currentLocation || 'Not set'}>
                        {s.currentLocation || <span className="text-gray-400 italic">Not set</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2 min-w-[220px]">
                      <div className="flex items-center gap-1.5 flex-nowrap">
                        {/* View */}
                        <button
                          onClick={() => handleView(s.displayId)}
                          title="View"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-150"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {/* Update */}
                        <button
                          onClick={() => handleUpdate(s.displayId)}
                          title="Update"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all duration-150"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Status Change */}
                        <select
                          title="Change Status"
                          value={s.status}
                          onChange={(e) => handleStatusChange(s.displayId, e.target.value)}
                          className="h-7 text-[11px] font-semibold rounded-lg border border-gray-200 text-green-700 bg-green-50 hover:border-green-300 focus:border-green-400 focus:ring-1 focus:ring-green-200 outline-none cursor-pointer transition-all duration-150 px-1.5 pr-5"
                          style={{
                            backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%2316a34a%27 stroke-width=%272.5%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E')",
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.25rem center',
                            backgroundSize: '0.7rem',
                            appearance: 'none',
                          }}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDelete(s.displayId)}
                          title="Delete"
                          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-150"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                        <input
                          type="text"
                          placeholder="Current location — press Enter"
                          title="Press Enter to save current location"
                          value={getLocationDraft(s.displayId, s.currentLocation)}
                          onChange={(e) => setLocationDraft(s.displayId, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleLocationEnter(s.displayId);
                            }
                          }}
                          disabled={locationMutation.isPending}
                          className="h-7 w-full text-[11px] rounded-lg border border-gray-200 px-2 text-gray-700 placeholder:text-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => printInvoice(s.displayId)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold bg-white border border-gray-200 hover:border-red-400 hover:text-red-600 text-gray-600 px-2.5 py-1 rounded-lg transition-all duration-150 whitespace-nowrap"
                        >
                          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
              <p className="text-sm font-medium">No shipments found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {filtered.length
                ? `Showing ${start + 1}\u2013${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length}`
                : 'No results'}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                    p === currentPage
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
