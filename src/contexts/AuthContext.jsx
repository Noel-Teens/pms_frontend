import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);

      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);

      redirectByRole(userData.role);
      toast.success('Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const googleLoginSuccess = async () => {
    try {
      const userData = await fetchUserData(); // fetch user from backend
      if (userData) {
      redirectByRole(userData.role);
      }
    } catch (error) {
      console.error('Google login fetch error:', error);
      toast.error('Failed to load user profile');
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
      setLoading(false);

      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      toast.success('Registration successful. Please login.');
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);

      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          Object.keys(errorData).forEach((field) => {
            const messages = errorData[field];
            if (Array.isArray(messages)) {
              messages.forEach((msg) => toast.error(`${field}: ${msg}`));
            } else {
              toast.error(`${field}: ${messages}`);
            }
          });
        } else {
          toast.error(error.response.data.message || 'Registration failed');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUserData,
    googleLoginSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
