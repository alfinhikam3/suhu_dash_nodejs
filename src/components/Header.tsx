import React, { useState } from 'react';
import { Menu, Bell, User, Download, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as XLSX from 'xlsx';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Temperature Sensor 1 is critical', time: '2 min ago' },
    { id: 2, message: 'Smoke level is high', time: '5 min ago' },
    { id: 3, message: 'Power consumption peaked', time: '10 min ago' },
  ]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const exportData = async (type: 'sensor' | 'fire-smoke' | 'electricity') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, `${type}-data.xlsx`);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <header className="bg-gray-800 dark:bg-gray-900 shadow-md flex items-center justify-between px-4 py-3">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-white">UMM-BSID Monitoring System</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Export Button */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(prev => !prev)}
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
          >
            <Download size={20} />
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
              <button
                onClick={() => exportData('sensor')}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 w-full text-left"
              >
                Export Sensor Data
              </button>
              <button
                onClick={() => exportData('fire-smoke')}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 w-full text-left"
              >
                Export Fire & Smoke Data
              </button>
              <button
                onClick={() => exportData('electricity')}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 w-full text-left"
              >
                Export Electricity Data
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="text-gray-400 hover:text-white relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-700 rounded-md shadow-lg py-1 z-50">
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-600">
                <h3 className="text-white font-medium">Notifications</h3>
                <button
                  onClick={clearNotifications}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Clear all
                </button>
              </div>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                >
                  <p className="text-sm text-gray-300">{notification.message}</p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="px-4 py-2 text-gray-400 text-sm">
                  No notifications
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(prev => !prev)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User size={18} />
            </div>
            <span className="hidden md:inline text-sm">{user?.username}</span>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50">
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 w-full"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;