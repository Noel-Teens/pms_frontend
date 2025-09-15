import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paperworksAPI } from '../../services/api';
import { toast } from 'sonner';

const PapersList = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        
        const response = await paperworksAPI.getAllPaperworks();
        // Handle both array response and response with items property
        const papersList = Array.isArray(response.data) ? response.data : 
                          (response.data.items ? response.data.items : []);
        setPapers(papersList);
        console.log('Fetched papers:', papersList);
      } catch (error) {
        console.error('Error fetching papers:', error);
        toast.error('Failed to load papers');
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  // Function to get status badge with appropriate color
  const getStatusBadge = (status) => {
    const statusMap = {
      'ASSIGNED': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Assigned' },
      'SUBMITTED': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Submitted' },
      'APPROVED': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Approved' },
      'CHANGES_REQUESTED': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Changes Requested' },
      'REJECTED': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Rejected' },
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', label: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Heading */}
    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
      My Paper List
    </h1>
      {/* <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Papers</h1>
        <Link 
          to="/papers/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Submit New Paper
        </Link>
      </div> */}

      {papers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No Papers Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You don't have any papers assigned to you yet.</p>
          <Link 
            to="/dashboard" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-md"
          >
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {papers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm font-medium text-gray-900 dark:text-white">
    {paper.title}
  </div>
</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(paper.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">{formatDate(paper.assigned_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">{formatDate(paper.deadline)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <Link 
                          to={`/papers/${paper.id}`} 
                          className="text-blue-600 hover:text-blue-900 px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-md transition-colors"
                        >
                          View
                        </Link>
                        {(paper.status === 'ASSIGNED' || paper.status === 'CHANGES_REQUESTED') && (
                          <Link 
                            to={`/papers/${paper.id}/submit`} 
                            className="text-green-600 hover:text-green-900 px-3 py-1 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                          >
                            Submit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PapersList;