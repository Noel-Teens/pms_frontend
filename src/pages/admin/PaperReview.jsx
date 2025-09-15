import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, paperworksAPI } from '../../services/api';
import { toast } from 'sonner';

const PaperReview = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);

  // Review form state
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPaperDetails();
  }, [paperId]);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const [paperResponse, versionsResponse] = await Promise.all([
        paperworksAPI.getPaperworkById(paperId),
        paperworksAPI.getVersions(paperId)
      ]);

      setPaper(paperResponse.data);

      const versionsData = Array.isArray(versionsResponse.data)
        ? versionsResponse.data
        : versionsResponse.data.results || [];

      setVersions(versionsData);
    } catch (error) {
      console.error('Error fetching paper details:', error);
      toast.error('Failed to load paper details');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setSubmitting(true);
      await adminAPI.reviewPaperwork(paperId, {
        status: reviewStatus,
        comments: reviewComments
      });

      toast.success('Review submitted successfully');
      setShowAddModal(false);
      setReviewStatus('');
      setReviewComments('');
      fetchPaperDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-purple-100 text-purple-800',
      DRAFT: 'bg-gray-100 text-gray-800'
    };
    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusClasses[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
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
        <div
          className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-4"
          role="alert"
        >
          <p>Paper not found or you don't have permission to view this paper.</p>
        </div>
        <Link
          to="/admin/papers"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-md"
        >
          Back to Papers
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paper Review</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setReviewStatus('');
              setReviewComments('');
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Add Review
          </button>
          <Link
            to="/admin/papers"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-md"
          >
            Back to Papers
          </Link>
        </div>
      </div>

      {/* Paper Info + Versions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Paper Information</h2>
            <dl className="grid grid-cols-1 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{paper.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {paper.deadline ? formatDate(paper.deadline) : 'No deadline set'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Researcher</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {paper.researcher?.username} ({paper.researcher?.email})
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1">{getStatusBadge(paper.status)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned At</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(paper.assigned_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(paper.updated_at)}</dd>
              </div>
            </dl>
          </div>

          <div>
  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Version History</h2>
  {versions.length > 0 ? (
    <div className="space-y-4">
      {versions.map((version) => (
        <div
          key={version.id}
          className="p-4 border rounded-md border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          onClick={() =>
            navigate(`/admin/papers/${paperId}/versions/${version.version_no}`)
          }
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900 dark:text-white">
              Version {version.version_no}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(version.submitted_at)}
            </span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 dark:text-gray-400">No versions available</p>
  )}
</div>

        </div>
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Review</h3>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select status</option>
              <option value="APPROVED">Approved</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
            </select>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Comments</label>
            <textarea
              rows="4"
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperReview;
