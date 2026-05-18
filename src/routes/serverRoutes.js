/**
 * Server (API) routes — every endpoint the frontend calls on the backend.
 * These map to the backend REST API at VITE_API_BASE_URL.
 *
 * In development, Vite proxies /api/* → http://223.123.14.232:5000/api/*
 * In production, VITE_API_BASE_URL points directly to the backend.
 */

export const serverRoutes = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },
  shipments: {
    list: '/shipments',
    // Backend expects shipmentNumber format e.g. DTLC123...
    detail: (shipmentNumber) => `/shipments/${encodeURIComponent(shipmentNumber)}`,
    create: '/shipments',
    update: (shipmentNumber) => `/shipments/${encodeURIComponent(shipmentNumber)}`,
    delete: (shipmentNumber) => `/shipments/${encodeURIComponent(shipmentNumber)}`,
    updateStatus: (shipmentNumber) => `/shipments/${encodeURIComponent(shipmentNumber)}/status`,
  },
};
