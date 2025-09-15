import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, paperworksAPI } from '../../services/api';
import { toast } from 'sonner';

const DeadlineManagement = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchPaperDetails();
  }, [paperId]);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const paperResponse = await paperworksAPI.getPaperworkById(paperId);
      setPaper(paperResponse.data);
      
      // Set the current deadline in the form
      if (paperResponse.data.deadline) {
        // Format the date to YYYY-MM-DD for the input field
        const deadlineDate = new Date(paperResponse.data.deadline);
        const formattedDate = deadlineDate.toISOString().split('T')[0];
        setDeadline(formattedDate);
      }
    } catch (error) {
      console.error('Error fetching paper details:', error);
      toast.error('Failed to load paper details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeadlineSubmit = async (e) => {
    e.preventDefault();
    
    if (!deadline) {
      toast.error('Please select a deadline date');
      return;
    }
    
    try {
      setSubmitting(true);
      await adminAPI.updatePaperworkDeadline(paperId, deadline);
      
      toast.success('Deadline updated successfully');
      
      // Update local state
      setPaper({
        ...paper,
        deadline: deadline
      });
      
      // Navigate back to the paper details
      navigate(`/admin/papers/${paperId}`);
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast.error('Failed to update deadline');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>Paper not found or you don't have permission to view this paper.</p>
        </div>
        <Link to="/admin/papers" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
          Back to Papers
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Update Paper Deadline</h1>
        <div className="flex space-x-4">
          <Link to={`/papers/${paperId}`} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
            Back to Paper Details
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Paper Information</h2>
            <dl className="grid grid-cols-1 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{paper.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Deadline</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {paper.deadline ? formatDate(paper.deadline) : 'No deadline set'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Researcher</dt>
                <dd className="mt-1 text-sm text-gray-900">{paper.researcher_name}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Update Deadline</h2>
            <form onSubmit={handleDeadlineSubmit}>
              <div className="mb-4">
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  New Deadline Date
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Updating...' : 'Update Deadline'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlineManagement;