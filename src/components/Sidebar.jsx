import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';
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
  ];

  const researcherNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/papers', label: 'My Papers', icon: <FileText size={20} /> },
  ];

  const navItems = isAdmin ? adminNavItems : researcherNavItems;

  return (
    <div
      className={`fixed left-0 top-0 h-full w-64 shadow-md z-10 border-r`}
      style={{ backgroundColor: '#0A2647', borderColor: '#0A2647' }}
    >
      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: '#133B73' }}>
        <Link
          to={isAdmin ? '/admin' : '/dashboard'}
          className="text-xl font-bold"
          style={{ color: '#FF6B00' }}
        >
          PMS
        </Link>
        <ThemeToggle />
      </div>

      {/* User Info */}
      <div className="px-4 py-6">
        <div
          className="rounded-lg p-4 mb-6 border"
          style={{ backgroundColor: '#133B73', borderColor: '#1E447A' }}
        >
          <p className="text-sm font-medium text-white">{user?.username}</p>
          <p className="text-xs text-gray-300">{user?.email}</p>
          <p
            className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded"
            style={{ backgroundColor: '#FF6B00', color: '#fff' }}
          >
            {user?.role}
          </p>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/admin' &&
                item.path !== '/dashboard' &&
                location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors`}
                style={{
                  backgroundColor: isActive ? '#133B73' : 'transparent',
                  color: isActive ? '#FF6B00' : '#FFFFFF',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                <span
                  className="mr-3"
                  style={{ color: isActive ? '#FF6B00' : '#B0C4DE' }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: '#133B73' }}>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 rounded-md transition-colors"
          style={{ color: '#FFFFFF' }}
        >
          <LogOut size={20} className="mr-3" style={{ color: '#B0C4DE' }} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
