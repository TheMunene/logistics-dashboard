import React from 'react';
import { Search, Bell, Menu, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  const notifications = [
    { id: 1, message: 'Order #ORD-1236 has an exception', time: '10 minutes ago', read: false },
    { id: 2, message: 'New order assigned to rider Alex', time: '25 minutes ago', read: false },
    { id: 3, message: 'Rider Maria is on break', time: '1 hour ago', read: true },
  ];

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileMenu) setShowProfileMenu(false);
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center">
        <button 
          className="mr-4 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <div className="text-xl font-bold text-gray-800">{title}</div>
      </div>
      
      <div className="flex items-center">
        <div className="relative mr-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-64 rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500"
            placeholder="Search orders, riders..."
          />
        </div>
        
        <div className="relative mr-4">
          <button 
            className="relative"
            onClick={toggleNotifications}
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-800">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="text-sm text-gray-800">{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-100">
                <button className="text-sm text-blue-600 hover:text-blue-800 w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            className="flex items-center"
            onClick={toggleProfileMenu}
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {user?.name || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-600 ml-1" />
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </a>
                <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </a>
                <button 
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;