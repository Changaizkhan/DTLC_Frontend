import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/add-shipment': 'Add New Shipment',
  '/tracking': 'Track Shipment',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Dashboard';
  const hideSearch = location.pathname === '/add-shipment' || location.pathname === '/tracking';

  return (
    <div className="bg-gray-50 h-screen flex overflow-hidden text-gray-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} hideSearch={hideSearch} />
        <main className="flex-1 overflow-y-auto px-5 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
