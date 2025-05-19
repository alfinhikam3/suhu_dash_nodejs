import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationSound from './NotificationSound';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [playCriticalAlert, setPlayCriticalAlert] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Auto-hide sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Example of critical alert trigger
  useEffect(() => {
    const checkCriticalStatus = () => {
      // Add your critical condition checks here
      const hasCriticalStatus = true; // Replace with actual logic
      if (hasCriticalStatus) {
        setPlayCriticalAlert(true);
        setTimeout(() => setPlayCriticalAlert(false), 1000);
      }
    };

    const interval = setInterval(checkCriticalStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <NotificationSound play={playCriticalAlert} />
    </div>
  );
};

export default Layout;