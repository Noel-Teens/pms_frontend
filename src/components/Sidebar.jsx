import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { LayoutDashboard, Users, FileText, LogOut, Clock, Bell } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();
  const isAdmin = user?.role === 'ADMIN';

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
    { path: '/admin/papers', label: 'Paper Assignment', icon: <FileText size={20} /> },
    // { path: '/admin/deadlines', label: 'Deadlines', icon: <Clock size={20} /> },
  ];

  const researcherNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/papers', label: 'My Papers', icon: <FileText size={20} /> },
  ];

  const navItems = isAdmin ? adminNavItems : researcherNavItems;

  return (
    <div className={`fixed left-0 top-0 h-full w-64 shadow-md z-10 border-r ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b flex justify-between items-center ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <Link to={isAdmin ? '/admin' : '/dashboard'} className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>PMS</Link>
        <ThemeToggle />
      </div>
      
      <div className="px-4 py-6">
        <div className={`rounded-lg p-4 mb-6 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{user?.username}</p>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{user?.email}</p>
          <p className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>{user?.role}</p>
        </div>

        {/* <div className="mb-4">
          <NotificationCenter />
        </div> */}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                          (item.path !== '/admin' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${isActive 
                  ? theme === 'dark' 
                    ? 'bg-blue-900 text-blue-100 font-medium' 
                    : 'bg-blue-50 text-blue-600 font-medium'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`mr-3 ${isActive 
                  ? theme === 'dark' ? 'text-blue-300' : 'text-blue-600' 
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={logout}
          className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          <LogOut size={20} className={`mr-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;