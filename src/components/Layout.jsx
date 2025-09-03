import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Sidebar from './Sidebar';
import Navigation from './Navigation';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {isAuthenticated ? (
        <div className="flex">
          <Sidebar />
          <div className="flex-1 ml-64">
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      ) : (
        <>
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;