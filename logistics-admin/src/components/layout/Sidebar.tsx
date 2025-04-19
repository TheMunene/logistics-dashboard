import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Grid, 
  Truck, 
  Users, 
  Calendar, 
  BarChart2, 
  FileText, 
  Map, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, toggleCollapse }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  // Define navigation items based on user role
  const getNavItems = () => {
    const allItems = [
      { path: '/dashboard', icon: <Grid />, label: 'Dashboard', roles: ['admin', 'logistics_manager', 'operations_manager', 'rider'] },
      { path: '/orders', icon: <Truck />, label: 'Orders', roles: ['admin', 'logistics_manager', 'operations_manager', 'rider'] },
      { path: '/riders', icon: <Users />, label: 'Riders', roles: ['admin', 'logistics_manager', 'operations_manager'] },
      { path: '/schedule', icon: <Calendar />, label: 'Schedule', roles: ['admin', 'logistics_manager', 'operations_manager', 'rider'] },
      { path: '/analytics', icon: <BarChart2 />, label: 'Analytics', roles: ['admin', 'logistics_manager', 'operations_manager'] },
      { path: '/reports', icon: <FileText />, label: 'Reports', roles: ['admin', 'logistics_manager', 'operations_manager'] },
      { path: '/tracking', icon: <Map />, label: 'Tracking', roles: ['admin', 'logistics_manager', 'operations_manager', 'rider'] },
      { path: '/settings', icon: <Settings />, label: 'Settings', roles: ['admin', 'logistics_manager', 'operations_manager', 'rider'] },
    ];

    // Filter based on user role
    return allItems.filter(item => user && item.roles.includes(user.role));
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`bg-blue-800 h-full flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Logo */}
      <div className="flex justify-center items-center py-6">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <Truck className="w-6 h-6 text-blue-800" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-xl ml-2">LogistiX</span>
        )}
      </div>
      
      {/* Navigation Links */}
      <div className="flex flex-col flex-grow mt-6 px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center py-3 px-2 rounded-lg mb-2 ${
              isActive(item.path)
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            } transition-colors duration-200`}
          >
            <div className="w-6 h-6">{item.icon}</div>
            {!collapsed && <span className="ml-4">{item.label}</span>}
          </Link>
        ))}
      </div>
      
      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={logout}
          className="flex items-center py-3 px-2 rounded-lg w-full text-blue-100 hover:bg-blue-700 hover:text-white transition-colors duration-200"
        >
          <LogOut className="w-6 h-6" />
          {!collapsed && <span className="ml-4">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;