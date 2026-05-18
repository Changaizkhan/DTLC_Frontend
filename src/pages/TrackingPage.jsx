import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTrackingDetail } from '../hooks/api';
import './tracking.css';

function stClass(s) {
  const l = s.toLowerCase();
  if (l.includes('deliver')) return 'status-delivered';
  if (l.includes('transit')) return 'status-transit';
  if (l.includes('pick')) return 'status-pickup';
  if (l.includes('out')) return 'status-out';
  return 'status-transit';
}

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
 * GET /shipments/:shipmentNumber returns flat fields (shipperName, …) and/or nested shipper/receiver/details.
 */
function normalizeTrackingData(raw) {
  const r = unwrapShipmentPayload(raw);
  if (!r) return null;

  const d = r.details ?? r;

  const shipperName = r.shipper?.name ?? r.shipperName ?? '';
  const shipperPhone = r.shipper?.phone ?? r.shipperPhone ?? '';
  const shipperEmail = r.shipper?.email ?? r.shipperEmail ?? '';
  const receiverName = r.receiver?.name ?? r.receiverName ?? '';
  const receiverAddr = r.receiver?.address ?? r.receiverAddress ?? '';
  const receiverPhone = r.receiver?.phone ?? r.receiverPhone ?? '';
  const receiverEmail = r.receiver?.email ?? r.receiverEmail ?? '';

  const freightAmt = d.totalFreightAmount ?? r.totalFreightAmount;
  const freightCur = d.totalFreightCurrency ?? r.totalFreightCurrency ?? '';
  const freightStr =
    freightAmt != null && freightAmt !== ''
      ? `${freightAmt} ${freightCur}`.trim()
      : (r.info?.freight ?? '');

  return {
    status: String(r.status ?? 'UNKNOWN').toUpperCase(),
    shipper: {
      name: shipperName,
      company: r.shipper?.company ?? '',
      phone: shipperPhone,
      email: shipperEmail,
    },
    receiver: {
      name: receiverName,
      address: receiverAddr,
      phone: receiverPhone,
      email: receiverEmail,
    },
    info: {
      origin: d.origin ?? r.origin ?? r.info?.origin ?? '',
      package: String(d.numberOfPackages ?? r.numberOfPackages ?? r.info?.package ?? ''),
      status: r.status ?? r.info?.status ?? '',
      destination: d.destination ?? r.destination ?? r.info?.destination ?? '',
      carrier: d.carrier ?? r.carrier ?? r.info?.carrier ?? '',
      type: d.typeOfShipment ?? r.typeOfShipment ?? r.info?.type ?? '',
      weight: String(d.shipmentWeightKg ?? r.shipmentWeightKg ?? r.info?.weight ?? ''),
      mode: d.mode ?? r.mode ?? r.info?.mode ?? '',
      carrierRef: d.carrierReferenceNo ?? r.carrierReferenceNo ?? r.info?.carrierRef ?? '\u2014',
      product: d.product ?? r.product ?? r.info?.product ?? '',
      qty: String(d.quantity ?? r.quantity ?? r.info?.qty ?? ''),
      payment: d.paymentMethod ?? r.paymentMethod ?? r.info?.payment ?? '',
      freight: freightStr,
      deliveryDate: fmtDate(d.expectedDeliveryDate ?? r.expectedDeliveryDate ?? r.info?.deliveryDate),
      departure: d.departureTime ?? r.departureTime ?? r.info?.departure ?? '',
      pickupDate: fmtDate(d.pickupDate ?? r.pickupDate ?? r.info?.pickupDate),
      pickupTime: d.pickupTime ?? r.pickupTime ?? r.info?.pickupTime ?? '',
      comments: d.comments ?? r.comments ?? r.info?.comments ?? '',
    },
    packages: (r.packages ?? []).map((p) => ({
      qty: p.quantity ?? p.qty ?? 0,
      type: p.pieceType ?? p.type ?? '',
      desc: p.description ?? p.desc ?? '',
      l: p.lengthCm ?? p.l ?? 0,
      w: p.widthCm ?? p.w ?? 0,
      h: p.heightCm ?? p.h ?? 0,
      wt: p.weightKg ?? p.wt ?? 0,
    })),
    weights: r.weights ?? {
      vol:
        r.totalVolumetricWeightKg != null
          ? `${r.totalVolumetricWeightKg} kg`
          : '0.00kg',
      volume:
        r.totalVolumeCubicM != null
          ? `${r.totalVolumeCubicM} cu. m.`
          : '0.00cu. m.',
      actual:
        r.totalActualWeightKg != null
          ? `${r.totalActualWeightKg} kg`
          : '0.00kg',
    },
    history: (r.history ?? []).map((h) => ({
      date: h.date ?? '',
      time: h.time ?? '',
      location: h.location ?? '',
      status: h.status ?? '',
      by: h.by ?? h.updatedBy ?? '',
      remarks: h.remarks ?? '',
    })),
  };
}

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const [inputVal, setInputVal] = useState('');
  const [trackingRef, setTrackingRef] = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showSlipStage, setShowSlipStage] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const { data: trackingData, isFetching, isError } = useTrackingDetail(trackingRef || undefined);

  const envelopeWrapRef = useRef(null);
  const envFlapRef = useRef(null);
  const slip3dRef = useRef(null);
  const slipFaceRef = useRef(null);
  const scanLineRef = useRef(null);
  const ptclWrapRef = useRef(null);
  const resultCardRef = useRef(null);
  const slipRowsRef = useRef([]);
  const inputRef = useRef(null);

  const spawnParticles = useCallback(() => {
    const c = ptclWrapRef.current;
    if (!c) return;
    c.innerHTML = '';
    const cols = ['#e53500', 'rgba(229,53,0,0.60)', '#ffe000', 'rgba(255,210,0,0.55)', 'rgba(255,255,255,0.22)'];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'ptcl';
      const ang = (Math.PI * 2 * i / 20) + (Math.random() - 0.5) * 0.5;
      const dist = 55 + Math.random() * 80;
      p.style.cssText = `left:${38 + Math.random() * 24}%;top:28%;width:${3 + Math.random() * 5}px;height:${3 + Math.random() * 9}px;background:${cols[Math.floor(Math.random() * cols.length)]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};--dx:${Math.cos(ang) * dist}px;--dy:${(Math.sin(ang) * dist - 35)}px;--r:${-180 + Math.random() * 360}deg;--d:${0.65 + Math.random() * 0.55}s;--dl:${Math.random() * 0.15}s;`;
      c.appendChild(p);
    }
    setTimeout(() => { if (c) c.innerHTML = ''; }, 2000);
  }, []);

  const resetAnim = useCallback(() => {
    const ew = envelopeWrapRef.current;
    const flap = envFlapRef.current;
    const slip = slip3dRef.current;
    const face = slipFaceRef.current;
    const scan = scanLineRef.current;

    if (ew) { ew.style.opacity = '0'; ew.className = ''; ew.style.animation = ''; }
    if (flap) flap.classList.remove('open');
    if (slip) { slip.className = ''; slip.style.cssText = 'position:absolute;left:4%;width:92%;border-radius:8px;transform-style:preserve-3d;z-index:10;top:65%;opacity:0;transform:translateY(0) rotateX(10deg) scale(0.9);'; }
    if (face) { face.className = ''; face.id = 'slip-face'; }
    if (scan) scan.classList.remove('on');
    slipRowsRef.current.forEach((r) => { if (r) r.classList.remove('in'); });
    setShowResult(false);
    setShowSlipStage(false);
  }, []);

  const runAnim = useCallback((onDone) => {
    setShowSlipStage(true);

    setTimeout(() => {
      const ew = envelopeWrapRef.current;
      const flap = envFlapRef.current;
      const slip = slip3dRef.current;
      const face = slipFaceRef.current;
      const scan = scanLineRef.current;

      const stageEl = document.getElementById('slip-stage');
      if (stageEl) setTimeout(() => stageEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);

      if (ew) requestAnimationFrame(() => ew.classList.add('env-in'));
      setTimeout(() => { if (flap) flap.classList.add('open'); }, 580);
      setTimeout(() => { if (slip) slip.classList.add('slip-rise'); }, 1050);
      setTimeout(() => { if (scan) scan.classList.add('on'); }, 1700);
      setTimeout(() => {
        if (slip) {
          slip.classList.remove('slip-rise');
          slip.style.top = '-8%';
          slip.style.opacity = '1';
          void slip.offsetWidth;
          slip.classList.add('slip-flip');
        }
      }, 1950);
      setTimeout(() => {
        if (slip) {
          slip.classList.remove('slip-flip');
          void slip.offsetWidth;
          slip.classList.add('slip-settle');
        }
        if (face) face.classList.add('face-glow');
        spawnParticles();
        slipRowsRef.current.forEach((r, idx) => {
          setTimeout(() => { if (r) r.classList.add('in'); }, idx * 75);
        });
      }, 2630);
      setTimeout(() => { if (ew) ew.classList.add('env-shrink'); }, 3500);
      setTimeout(() => { if (onDone) onDone(); }, 4000);
    }, 50);
  }, [spawnParticles]);

  const trackShipment = useCallback(() => {
    const val = inputVal.trim().toUpperCase();
    resetAnim();
    setNotFound(false);
    setShowPrint(false);
    setResult(null);

    if (!val) {
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    setTrackingRef(val);
  }, [inputVal, resetAnim]);

  useEffect(() => {
    if (!trackingRef || isFetching) return;

    if (isError || !trackingData) {
      setNotFound(true);
      return;
    }

    const normalized = normalizeTrackingData(trackingData);
    if (!normalized) {
      setNotFound(true);
      return;
    }

    setResult({ ref: trackingRef, data: normalized });

    runAnim(() => {
      setShowResult(true);
      setShowPrint(true);
      setTimeout(() => {
        if (resultCardRef.current) {
          resultCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });
  }, [trackingData, trackingRef, isFetching, isError, runAnim]);

  useEffect(() => {
    const t = searchParams.get('track');
    if (t) {
      setInputVal(t);
      setTrackingRef(t.trim().toUpperCase());
    }
  }, [searchParams]);

  const d = result?.data;
  const infoFields = d ? [
    { label: 'Origin', val: d.info.origin },
    { label: 'Package', val: d.info.package },
    { label: 'Status', val: d.info.status },
    { label: 'Destination', val: d.info.destination },
    { label: 'Carrier', val: d.info.carrier },
    { label: 'Type of Shipment', val: d.info.type },
    { label: 'Weight', val: d.info.weight },
    { label: 'Shipment Mode', val: d.info.mode },
    { label: 'Carrier Reference No.', val: d.info.carrierRef },
    { label: 'Product', val: d.info.product },
    { label: 'Qty.', val: d.info.qty },
    { label: 'Payment Mode', val: d.info.payment },
    { label: 'Total Freight', val: d.info.freight },
    { label: 'Expected Delivery Date', val: d.info.deliveryDate },
    { label: 'Departure Time', val: d.info.departure },
    { label: 'Pick-up Date', val: d.info.pickupDate },
    { label: 'Pick-up Time', val: d.info.pickupTime },
    { label: '', val: '' },
  ] : [];

  return (
    <div className="tracking-body rounded-xl overflow-hidden">
      {/* HERO */}
      <section className="track-hero" style={{ padding: '40px 0 40px' }}>
        <div className="max-w-[1360px] mx-auto px-6 lg:px-10 relative z-10">
          <div className="inline-flex items-center gap-2 mb-5">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(229,53,0,0.22)', background: 'rgba(229,53,0,0.08)', fontSize: '11.5px', color: 'rgba(255,210,0,0.82)', fontWeight: 500, letterSpacing: '0.01em' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.85 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
              Online Shipment Tracking
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 14 }}>Track Your DTLC Shipment.</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 480, marginBottom: 22, fontWeight: 390 }}>Enter your tracking reference below to view the latest status of your air, sea, road or courier shipment handled by DTLC Logistics.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(229,53,0,0.65)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
              Live status updates where available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,210,0,0.55)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Secure tracking link
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section style={{ padding: '32px 0 48px' }}>
        <div className="max-w-[1360px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* LEFT */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Form card */}
              <div className="track-card" style={{ padding: '28px 30px' }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', marginBottom: 6, letterSpacing: '-0.01em' }}>Shipment Tracking</h2>
                <p style={{ fontSize: '12.5px', color: '#9ca3af', lineHeight: 1.6, marginBottom: 22 }}>Please enter your tracking number or reference code. If you have multiple shipments, track them one at a time for the most accurate results.</p>
                <hr className="section-divider" style={{ marginTop: 0 }} />
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#dc2626', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Enter the Consignment No.</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="e.g. DTLC0474826"
                    className="form-input"
                    style={{ flex: 1, minWidth: 200 }}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') trackShipment(); }}
                  />
                  <button className="btn-primary" onClick={trackShipment} disabled={isFetching} style={{ padding: '11px 22px', fontSize: 13, whiteSpace: 'nowrap', opacity: isFetching ? 0.6 : 1 }}>
                    {isFetching ? 'Tracking...' : 'Track Result'}
                  </button>
                </div>
                {showPrint && (
                  <div style={{ marginTop: 14 }}>
                    <button className="btn-print" onClick={() => window.print()}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                      Print Track Result
                    </button>
                  </div>
                )}
              </div>

              {/* ══ 3D SLIP STAGE ══ */}
              {showSlipStage && d && (
                <div id="slip-stage">
                  <div id="envelope-wrap" ref={envelopeWrapRef}>
                    <div id="envelope">
                      <div id="env-flap" ref={envFlapRef}>
                        <div id="env-flap-front"></div>
                        <div id="env-flap-back"></div>
                      </div>
                      <div id="env-logo">DTLC LOGISTICS</div>
                    </div>

                    <div id="slip-3d" ref={slip3dRef}>
                      <div id="slip-face" ref={slipFaceRef}>
                        <div id="scan-line" ref={scanLineRef}></div>
                        <div id="slip-top-bar"></div>
                        <div id="slip-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(229,53,0,0.10)', border: '1px solid rgba(229,53,0,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(229,53,0,0.85)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{result?.ref}</div>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', marginTop: 1 }}>Consignment Reference</div>
                            </div>
                          </div>
                          <div className="slip-status-chip">
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e53500', display: 'inline-block', boxShadow: '0 0 6px rgba(229,53,0,0.8)' }}></span>
                            {d.status}
                          </div>
                        </div>

                        {[
                          { lbl: 'Origin', val: d.info.origin },
                          { lbl: 'Destination', val: d.info.destination },
                          { lbl: 'Mode', val: d.info.mode },
                          { lbl: 'Carrier', val: d.info.carrier },
                          { lbl: 'Weight', val: d.info.weight + ' kg' },
                          { lbl: 'Pickup', val: d.info.pickupDate },
                          { lbl: 'Delivery', val: d.info.deliveryDate },
                        ].map((row, idx) => (
                          <div key={row.lbl} className="slip-row" ref={(el) => (slipRowsRef.current[idx] = el)}>
                            <div className="slip-dot-sm"></div>
                            <span className="slip-lbl">{row.lbl}</span>
                            <span className="slip-val">{row.val}</span>
                          </div>
                        ))}

                      </div>
                    </div>

                    <div ref={ptclWrapRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 30 }}></div>
                  </div>
                </div>
              )}

              {/* Full result */}
              {showResult && d && (
                <div
                  ref={resultCardRef}
                  className="flex flex-col gap-5"
                  style={{ opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
                >
                  <div className="track-card" style={{ overflow: 'hidden' }}>
                    {/* Shipper / Receiver */}
                    <div className="grid grid-cols-1 sm:grid-cols-2" style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ padding: '20px 24px', borderRight: '1px solid #f3f4f6' }}>
                        <p className="section-label" style={{ marginBottom: 12 }}>Shipper Information</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{d.shipper.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{d.shipper.company}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{d.shipper.phone}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{d.shipper.email}</div>
                        </div>
                      </div>
                      <div style={{ padding: '20px 24px' }}>
                        <p className="section-label" style={{ marginBottom: 12 }}>Receiver Information</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{d.receiver.name}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{d.receiver.address}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{d.receiver.phone}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{d.receiver.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status bar */}
                    <div style={{ padding: '14px 24px', background: '#fef2f2', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', display: 'inline-block', boxShadow: '0 0 8px rgba(220,38,38,0.4)', flexShrink: 0 }}></span>
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#dc2626' }}>SHIPMENT STATUS: {d.status}</span>
                    </div>

                    {/* Shipment Information */}
                    <div style={{ padding: '22px 24px' }}>
                      <p className="section-label" style={{ marginBottom: 16 }}>Shipment Information</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-14">
                        {infoFields.map((f, i) => (
                          <div key={i}>
                            {f.label && <div className="info-label">{f.label}</div>}
                            {f.val && <div className="info-value">{f.val}</div>}
                          </div>
                        ))}
                        <div className="col-span-2 sm:col-span-3">
                          <div className="info-label">Comments</div>
                          <div className="info-value">{d.info.comments}</div>
                        </div>
                      </div>
                    </div>

                    {/* Packages */}
                    <div style={{ padding: '0 24px 24px' }}>
                      <p className="section-label" style={{ marginBottom: 14 }}>Packages</p>
                      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <table className="dtlc-table">
                          <thead>
                            <tr>
                              <th>Qty.</th><th>Piece Type</th><th>Description</th><th>Length (cm)</th><th>Width (cm)</th><th>Height (cm)</th><th>Weight (kg)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {d.packages.map((p, i) => (
                              <tr key={i}>
                                <td>{p.qty}</td><td>{p.type}</td><td>{p.desc}</td><td>{p.l}</td><td>{p.w}</td><td>{p.h}</td><td>{p.wt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginTop: 16, padding: '14px 0', borderTop: '1px solid #f3f4f6' }}>
                        <div><div className="info-label" style={{ marginBottom: 3 }}>Total Volumetric Weight</div><div className="info-value">{d.weights.vol}</div></div>
                        <div><div className="info-label" style={{ marginBottom: 3 }}>Total Volume</div><div className="info-value">{d.weights.volume}</div></div>
                        <div><div className="info-label" style={{ marginBottom: 3 }}>Total Actual Weight</div><div className="info-value">{d.weights.actual}</div></div>
                      </div>
                    </div>

                    {/* Shipment History */}
                    {/* <div style={{ padding: '0 24px 28px', borderTop: '1px solid rgba(229,53,0,0.09)' }}>
                      <p className="section-label" style={{ margin: '20px 0 14px' }}>Shipment History</p>
                      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                        <table className="dtlc-table">
                          <thead>
                            <tr><th>Date</th><th>Time</th><th>Location</th><th>Status</th><th>Updated By</th><th>Remarks</th></tr>
                          </thead>
                          <tbody>
                            {d.history.map((h, i) => (
                              <tr key={i}>
                                <td style={{ whiteSpace: 'nowrap' }}>{h.date}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>{h.time}</td>
                                <td>{h.location}</td>
                                <td><span className={`status-pill ${stClass(h.status)}`}>{h.status}</span></td>
                                <td>{h.by}</td>
                                <td>{h.remarks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(229,53,0,0.45)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>If you receive an error or the results don&apos;t appear, double-check your reference or contact our team with your shipment details.</p>
                      </div>
                    </div> */}
                  </div>
                </div>
              )}

              {/* Not found */}
              {notFound && (
                <div className="track-card">
                  <div style={{ padding: '32px 28px', textAlign: 'center' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto 14px' }}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><line x1="11" y1="8" x2="11" y2="12" /><line x1="11" y1="16" x2="11.01" y2="16" /></svg>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>No results found</div>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>We couldn&apos;t find a shipment matching that reference. Please verify the consignment number or contact <span style={{ color: '#dc2626' }}>info@dtlclogistics.com</span>.</p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="flex flex-col gap-5">
              <div className="track-card" style={{ padding: '24px 26px' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Need help with your tracking?</h3>
                <p style={{ fontSize: '12.5px', color: '#9ca3af', lineHeight: 1.6, marginBottom: 20 }}>Our operations team can assist if your tracking reference is not recognised or if you need clarification on a specific shipment status.</p>
                <hr className="section-divider" style={{ margin: '0 0 18px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="help-tip"><div className="help-dot" style={{ background: '#dc2626' }}></div><span>Use the reference shared on your booking confirmation or courier label.</span></div>
                  <div className="help-tip"><div className="help-dot" style={{ background: '#f59e0b' }}></div><span>Tracking updates may take some time to appear after pickup, depending on carrier and service level.</span></div>
                  <div className="help-tip"><div className="help-dot" style={{ background: '#10b981' }}></div><span>If you can&apos;t find your reference, email <a href="mailto:info@dtlclogistics.com" style={{ color: '#dc2626', textDecoration: 'none', borderBottom: '1px solid #fecaca' }}>info@dtlclogistics.com</a> with your shipper, consignee and date.</span></div>
                </div>
                <hr className="section-divider" style={{ margin: '18px 0' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12.5px', color: '#6b7280', textDecoration: 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>Back to home
                  </Link>
                  <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12.5px', color: '#6b7280', textDecoration: 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>Privacy policy
                  </a>
                </div>
              </div>

              {/* Direct support card */}
              <div className="track-card" style={{ padding: '22px 26px' }}>
                <p className="section-label" style={{ marginBottom: 12 }}>Direct Support</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#6b7280' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" style={{ flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.35h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.77-1.77a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    +1 612-888-0679
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#6b7280' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" style={{ flexShrink: 0 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    info@dtlclogistics.com
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#6b7280' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    24/7 shipment support
                  </div>
                </div>
              </div>

              {/* Track another card */}
              <div className="track-card" style={{ padding: '20px 26px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.9"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 2 }}>Track another shipment</div>
                  <div style={{ fontSize: '11.5px', color: '#9ca3af' }}>Enter a new consignment number above</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
