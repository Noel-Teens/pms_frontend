import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, paperworksAPI } from '../../services/api';
import { toast } from 'sonner';

const PaperAssignment = () => {
  const [papers, setPapers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewPaperModal, setShowNewPaperModal] = useState(false);
  const [newPaperTitle, setNewPaperTitle] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [papersResponse, usersResponse] = await Promise.all([
        paperworksAPI.getAllPaperworks(),
        adminAPI.getUsers()
      ]);

      let papersData = papersResponse.data;
      if (Array.isArray(papersData)) {
        papersData = papersData;
      } else if (papersData && papersData.results) {
        papersData = papersData.results;
      } else {
        papersData = [];
        console.error('Unexpected papers data structure:', papersResponse.data);
      }

      const normalizedPapers = papersData.map(paper => ({
        ...paper,
        assigned_to: paper.researcher ? paper.researcher.id : null,
        assigned_to_name: paper.researcher ? paper.researcher.username : null
      }));

      setPapers(normalizedPapers);

      let usersData = usersResponse.data;
      if (Array.isArray(usersData)) {
        usersData = usersData;
      } else if (usersData && usersData.results) {
        usersData = usersData.results;
      } else {
        usersData = [];
        console.error('Unexpected users data structure:', usersResponse.data);
      }

      const researchers = usersData.filter(user => {
        const userRole = user.role || user.Role || '';
        const userStatus = user.status || user.Status || '';
        const isResearcher = userRole.toUpperCase() === 'RESEARCHER';
        const isActive = userStatus.toUpperCase() === 'ACTIVE';
        return isResearcher && isActive;
      });

      setUsers(researchers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPaper || !selectedUser) {
      toast.error('Please select both a paper and a researcher');
      return;
    }

    try {
      setAssigning(true);
      const response = await adminAPI.assignPaperwork({
        title: selectedPaper.title,
        researcher_id: selectedUser,
        deadline: deadline || null
      });

      const updatedPaper = response.data;
      setPapers(papers.map(paper =>
        paper.id === selectedPaper.id
          ? {
              ...paper,
              assigned_to: updatedPaper.researcher ? updatedPaper.researcher.id : updatedPaper.researcher_id,
              assigned_to_name: updatedPaper.researcher ? updatedPaper.researcher.username : updatedPaper.researcher_name,
              status: updatedPaper.status,
              deadline: updatedPaper.deadline
            }
          : paper
      ));

      setSelectedPaper(null);
      setSelectedUser('');
      setDeadline('');
      toast.success('Paper assigned successfully');
    } catch (error) {
      console.error('Error assigning paper:', error);
      toast.error('Failed to assign paper');
    } finally {
      setAssigning(false);
    }
  };

  const closeModal = () => {
    setSelectedPaper(null);
    setSelectedUser('');
    setDeadline('');
  };

  const openNewPaperModal = () => {
    setShowNewPaperModal(true);
    setNewPaperTitle('');
    setSelectedUser('');
    setDeadline('');
  };

  const closeNewPaperModal = () => {
    setShowNewPaperModal(false);
    setNewPaperTitle('');
    setSelectedUser('');
    setDeadline('');
  };

  const handleCreateNewPaper = async () => {
    if (!newPaperTitle || !selectedUser) {
      toast.error('Please enter a paper title and select a researcher');
      return;
    }

    try {
      setAssigning(true);
      const response = await adminAPI.assignPaperwork({
        title: newPaperTitle,
        researcher_id: selectedUser,
        deadline: deadline || null
      });

      const newPaper = response.data;
      setPapers([...papers, {
        id: newPaper.id,
        title: newPaper.title,
        author_name: 'Admin Created',
        status: newPaper.status,
        assigned_to: newPaper.researcher ? newPaper.researcher.id : newPaper.researcher_id,
        assigned_to_name: newPaper.researcher ? newPaper.researcher.username : newPaper.researcher_name,
        deadline: newPaper.deadline
      }]);

      toast.success('New paper created and assigned successfully');
      closeNewPaperModal();
    } catch (error) {
      console.error('Error creating new paper:', error);
      toast.error('Failed to create new paper');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'DRAFT': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const filteredPapers = papers.filter(paper => {
    if (statusFilter !== 'all' && paper.status !== statusFilter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        paper.title.toLowerCase().includes(searchLower) ||
        (paper.author_name && paper.author_name.toLowerCase().includes(searchLower)) ||
        (paper.assigned_to_name && paper.assigned_to_name.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Paper Assignment</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Assign research papers to researchers</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/admin" className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-md">
            Back to Dashboard
          </Link>
          <button onClick={openNewPaperModal} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mr-2">
            Assign New Paper
          </button>
          <button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Papers
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by title, author, or assignee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="w-full md:w-1/4">
  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Filter by Status
  </label>
  <select
    id="statusFilter"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
  >
    <option value="all">All Statuses</option>
    <option value="ASSIGNED">Assigned</option>
    <option value="SUBMITTED">Submitted</option>
    <option value="APPROVED">Approved</option>
    <option value="CHANGES_REQUESTED">Changes Requested</option>
  </select>
</div>

        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPapers.length > 0 ? (
                filteredPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{paper.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {paper.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(paper.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {paper.assigned_to_name ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {paper.assigned_to_name}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/papers/${paper.id}`} className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No papers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Paper Assignment Modal */}
      {showNewPaperModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assign New Paper</h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={closeNewPaperModal}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Paper Title
                </label>
                <input
                  type="text"
                  value={newPaperTitle}
                  onChange={(e) => setNewPaperTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter paper title"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assign to Researcher
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a researcher</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Set Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2"
                  onClick={closeNewPaperModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  onClick={handleCreateNewPaper}
                  disabled={assigning}
                >
                  {assigning ? 'Creating...' : 'Create and Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperAssignment;
