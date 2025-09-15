import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { toast } from 'sonner';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Log the request data for debugging
      console.log('Sending invitation request:', {
        email: formData.email,
        role: formData.role
      });

      // Check if user is authenticated and has token
      const token = localStorage.getItem('access');
      console.log('Auth token present:', !!token);
      
      // Send invitation instead of creating user directly
      const response = await adminAPI.inviteUser({
        email: formData.email.trim(),
        role: formData.role
      });
      
      console.log('Invitation response:', response);
      toast.success('Invitation sent successfully! The user will receive an email to complete their registration.');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error sending invitation:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          // Bad Request - could be validation error or auth issue
          if (data.error) {
            toast.error(data.error);
          } else if (data.detail) {
            toast.error(data.detail);
          } else if (data.email) {
            toast.error(`Email error: ${data.email[0]}`);
          } else if (data.role) {
            toast.error(`Role error: ${data.role[0]}`);
          } else {
            toast.error('Bad request - please check your input and try again');
          }
        } else if (status === 401) {
          toast.error('Authentication failed - please log in again');
          // Optionally redirect to login
          // navigate('/login');
        } else if (status === 403) {
          toast.error('Permission denied - you need admin privileges');
        } else {
          const errorMessage = data.error || data.message || data.detail || 'Failed to send invitation';
          toast.error(errorMessage);
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error - please check your connection');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Invite New User</h1>
        <Link to="/admin/users" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
          Back to User Management
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
                required
              />
              <p className="mt-1 text-xs text-gray-500">The user will receive an invitation email at this address</p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900"
                required
              >
                <option value="">Select Role</option>
                <option value="ADMIN">Admin</option>
                <option value="RESEARCHER">Researcher</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md flex items-center"
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a1 1 0 001.42 0L21 7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;