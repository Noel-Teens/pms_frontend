import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paperworksAPI, researcherStatsAPI } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const UserDashboard = () => {
  const { user } = useAuth();
  const [paperworks, setPaperworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersRes, statsRes] = await Promise.all([
          paperworksAPI.getAllPaperworks(),
          researcherStatsAPI.getSummary()
        ]);

        const papersList = Array.isArray(papersRes.data)
          ? papersRes.data
          : (papersRes.data.items ? papersRes.data.items : []);

        const lastFive = [...papersList]
          .sort((a, b) => new Date(b.updated_at || b.assigned_at) - new Date(a.updated_at || a.assigned_at))
          .slice(0, 5);

        setPaperworks(lastFive);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load your dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="bg-grey text-[#0A2647] rounded-xl p-6 mb-8 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl dark:text-white font-bold">Researcher Dashboard</h1>
            <p className="mt-2 flex items-center text-black dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#FF6B00]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Welcome, <span className="font-medium ml-1 text-black dark:text-white">{user?.username}</span>
            </p>
          </div>
          <Link
            to="/papers"
            className="bg-[#FF6B00] hover:bg-[#e65f00] text-white px-4 py-2 rounded-md flex items-center transition-colors shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Submit New Paper
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Papers', value: stats?.total_paperwork ?? ((stats?.submitted || 0) + (stats?.approved || 0) + (stats?.changes_requested || 0)) },
          { title: 'Pending Review', value: stats?.submitted || 0 },
          { title: 'Approved', value: stats?.approved || 0 },
          { title: 'Changes Requested', value: stats?.changes_requested || 0 },
        ].map((card, idx) => (
          <Card key={idx} className="border border-[#0A2647] shadow-sm hover:shadow-lg transition-transform hover:scale-105 bg-white dark:bg-transparent">
            <CardHeader className="pb-2 text-[#0A2647] dark:text-white">
              <CardTitle className="text-lg">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-extrabold text-[#FF6B00]">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last 5 Papers */}
      <Card className="mb-8 border border-[#0A2647] shadow-md bg-white dark:bg-transparent">
        <CardHeader className="bg-[#0A2647] text-white rounded-t-lg px-6 py-4 flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">My Research Papers (Last 5)</CardTitle>
            <CardDescription className="text-gray-200">Recently assigned papers</CardDescription>
          </div>
          <Link to="/papers" className="text-sm text-[#FF6B00] hover:underline">
            View All
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {paperworks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-[#0A2647]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-200 uppercase">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-200 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-200 uppercase">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paperworks.map((paper) => (
                    <tr
                      key={paper.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#102d57] transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-800 dark:text-white">{paper.title}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                          {paper.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(paper.updated_at || paper.assigned_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600 dark:text-gray-300">You don't have any papers yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Status color helper
const getStatusColor = (status) => {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-[#FF6B00]/20 text-[#FF6B00] dark:bg-[#FF6B00]/30 dark:text-[#FF6B00]';
    case 'APPROVED':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    case 'CHANGES_REQUESTED':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    case 'ASSIGNED':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  }
};

// Date formatter
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default UserDashboard;
