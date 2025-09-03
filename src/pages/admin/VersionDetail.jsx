import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminAPI, paperworksAPI } from '../../services/api';
import { toast } from 'sonner';
import FileViewer from '../../components/FileViewer';

const VersionDetail = () => {
  const { paperId, versionNo } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    const fetchVersionDetails = async () => {
      try {
        setLoading(true);
        // Fetch paper details
        const paperResponse = await adminAPI.getPaperworkById(paperId);
        setPaper(paperResponse.data);

        // Fetch versions
        const versionsResponse = await adminAPI.getPaperworkVersions(paperId);
        const versions = versionsResponse?.data?.results || versionsResponse?.data || [];
        
        // Find the specific version
        const selectedVersion = versions.find(v => v.version_no.toString() === versionNo);
        if (selectedVersion) {
          setVersion(selectedVersion);
        } else {
          toast.error('Version not found');
        }
      } catch (error) {
        console.error('Error fetching version details:', error);
        toast.error('Failed to load version details');
      } finally {
        setLoading(false);
      }
    };

    if (paperId && versionNo) {
      fetchVersionDetails();
    }
  }, [paperId, versionNo]);

  const handleDownload = async (filePath, filename) => {
    try {
      const response = await paperworksAPI.downloadFile(filePath);
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Downloading ${filename}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  };

  // File viewing
  const handleViewFile = (fileType) => setActiveFile({ type: fileType, version: versionNo });
  const closeFileViewer = () => setActiveFile(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!paper || !version) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-4" role="alert">
          <p>Version not found or you don't have permission to view this version.</p>
        </div>
        <Link
          to={`/admin/papers/${paperId}`}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-md"
        >
          Back to Paper Review
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Version {versionNo} Details</h1>
        <div className="flex space-x-4">
          <Link
            to={`/admin/papers/${paperId}`}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-md"
          >
            Back to Paper Review
          </Link>
        </div>
      </div>

      {/* Paper info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{paper.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Researcher: {paper.researcher?.username || 'Unknown'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Submitted on: {formatDate(version.submitted_at)}</p>
          </div>
        </div>
      </div>

      {/* Version files */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {version.pdf_path && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewFile('pdf')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-l-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                View PDF
              </button>
              <button
                onClick={() => handleDownload(version.pdf_path, `${paper.title}_v${version.version_no}.pdf`)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-l-0 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          )}

          {version.latex_path && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewFile('tex')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-l-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                View LaTeX
              </button>
              <button
                onClick={() => handleDownload(version.latex_path, `${paper.title}_v${version.version_no}.tex`)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-l-0 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          )}

          {version.python_path && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewFile('zip')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-l-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                View Code
              </button>
              <button
                onClick={() => handleDownload(version.python_path, `${paper.title}_v${version.version_no}.zip`)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-l-0 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          )}

          {version.docx_path && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewFile('docx')}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-l-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                View DOCX
              </button>
              <button
                onClick={() => handleDownload(version.docx_path, `${paper.title}_v${version.version_no}.docx`)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-r-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border-l-0 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Viewer */}
      {activeFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Viewing {activeFile.type.toUpperCase()} - Version {activeFile.version}
              </h3>
              <button
                onClick={closeFileViewer}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <FileViewer
                paperworkId={paperId}
                versionNo={activeFile.version}
                fileType={activeFile.type}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionDetail;