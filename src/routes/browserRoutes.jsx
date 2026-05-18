import { Navigate } from 'react-router-dom';
import DashboardLayout from '../Components/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import AddShipmentPage from '../pages/AddShipmentPage';
import TrackingPage from '../pages/TrackingPage';

/**
 * Browser (client-side) routes — everything the user navigates to in the browser.
 * These are React Router page routes, NOT API endpoints.
 */

export const BROWSER_PATHS = {
  login: '/login',
  dashboard: '/dashboard',
  addShipment: '/add-shipment',
  tracking: '/tracking',
};

export const browserRoutes = [
  { path: BROWSER_PATHS.login, element: <LoginPage /> },
  {
    element: <DashboardLayout />,
    children: [
      { path: BROWSER_PATHS.dashboard, element: <DashboardPage /> },
      { path: BROWSER_PATHS.addShipment, element: <AddShipmentPage /> },
      { path: BROWSER_PATHS.tracking, element: <TrackingPage /> },
    ],
  },
  { path: '*', element: <Navigate to={BROWSER_PATHS.login} replace /> },
];
