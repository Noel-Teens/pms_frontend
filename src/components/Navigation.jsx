import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <nav className={`shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className={`text-xl font-bold ${theme === 'dark' ? 'text-primary/80' : 'text-primary'}`}>PMS</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <>
            <Link to="/login" className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>Login</Link>
            <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">Register</Link>
          </>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;