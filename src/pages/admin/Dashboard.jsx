import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paperworksAPI, reportsAPI, clearCachePattern } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [paperworks, setPaperworks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized data processing
  const processedPaperworks = useMemo(() => {
    if (!Array.isArray(paperworks)) return [];
    
    return paperworks.map(paper => ({
      ...paper,
      assigned_to: paper.researcher?.username || 'Unknown',
      assigned_to_name: `${paper.researcher?.first_name || ''} ${paper.researcher?.last_name || ''}`.trim() || paper.researcher?.username || 'Unknown User'
    }));
  }, [paperworks]);

  // Optimized data fetching with error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use Promise.allSettled to handle partial failures gracefully
      const [papersResult, statsResult] = await Promise.allSettled([
        paperworksAPI.getAllPaperworks(),
        reportsAPI.getSummary()
      ]);

      // Handle papers data
      if (papersResult.status === 'fulfilled') {
        let papersData = papersResult.value.data;
        if (Array.isArray(papersData)) {
          papersData = papersData;
        } else if (papersData?.results) {
          papersData = papersData.results;
        } else if (papersData?.items) {
          papersData = papersData.items;
        } else {
          papersData = [];
        }
        setPaperworks(papersData);
      } else {
        console.error('Failed to fetch papers:', papersResult.reason);
        setPaperworks([]);
      }

      // Handle stats data
      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data);
      } else {
        console.error('Failed to fetch stats:', statsResult.reason);
        setStats(null);
      }

      // Show error if both requests failed
      if (papersResult.status === 'rejected' && statsResult.status === 'rejected') {
        setError('Failed to load dashboard data. Please try again.');
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('An unexpected error occurred');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data handler
  const handleRefresh = useCallback(() => {
    clearCachePattern('/api/paperworks');
    clearCachePattern('/api/stats');
    fetchData();
  }, [fetchData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error && !stats && paperworks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl text-[#FF6B00] font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-300 mt-1">Overview of research paper management system</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700 dark:text-white">Total Papers</CardTitle>
            <CardDescription className="dark:text-gray-300">All papers in system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{stats?.total_paperwork || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700 dark:text-white">Submitted</CardTitle>
            <CardDescription className="dark:text-gray-300">Papers awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-500">{stats?.submitted || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700 dark:text-white">Approved</CardTitle>
            <CardDescription className="dark:text-gray-300">Papers approved</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{stats?.approved || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700 dark:text-white">Changes Requested</CardTitle>
            <CardDescription className="dark:text-gray-300">Papers needing revision</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-500">{stats?.changes_requested || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-white">Quick Actions</h2>
        <div className="flex gap-4">
          <Button
            onClick={() => (window.location.href = '/admin/papers')}
            className="bg-[#0A2647] text-white hover:bg-[#FF6B00] hover:text-white"
          >
            Assign New Paper
          </Button>
          <Button
            onClick={() => (window.location.href = '/admin/users')}
            variant="outline"
            className="border-[#0A2647] text-[#0A2647] dark:border-[#FF6B00] dark:text-[#FF6B00]"
          >
            Manage Users
          </Button>
        </div>
      </div>

      {/* Recent Papers */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Papers</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          {processedPaperworks.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Researcher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {processedPaperworks
                  .sort((a, b) => new Date(b.updated_at || b.assigned_at) - new Date(a.updated_at || a.assigned_at))
                  .slice(0, 5)
                  .map((paper) => (
                    <tr key={paper.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{paper.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {paper.assigned_to_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            paper.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : paper.status === 'CHANGES_REQUESTED'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : paper.status === 'SUBMITTED'
                              ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                              : paper.status === 'ASSIGNED'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {paper.status?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(paper.updated_at || paper.assigned_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <Link
                          to={`/admin/papers/${paper.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-primary text-primary dark:text-primary dark:border-primary rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No papers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
