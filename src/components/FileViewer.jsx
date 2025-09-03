import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { toast } from 'sonner';

const FileViewer = ({ paperworkId, versionNo, fileType }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [zipContents, setZipContents] = useState([]);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [zipFileContent, setZipFileContent] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        setFileUrl(null);
        setZipContents([]);
        setSelectedZipFile(null);
        setZipFileContent(null);

        if (fileType === 'zip') {
          // For ZIP files, first fetch the contents listing
          const token = localStorage.getItem('token');
          const zipContentsUrl = `/admin_app/paperworks/${paperworkId}/versions/${versionNo}/zip-contents/`;
          
          // Add token to URL if available
          const urlWithToken = token ? `${zipContentsUrl}?token=${token}` : zipContentsUrl;
          
          try {
            const response = await api.get(urlWithToken);
            setZipContents(response.data.files || []);
          } catch (error) {
            console.error('Error fetching ZIP contents:', error);
            if (error.response?.status === 403) {
              setError('Authentication error. Please make sure you are logged in.');
            } else {
              setError(`Failed to load ZIP contents: ${error.message}`);
            }
          }
        } else {
          // For PDF, DOCX, and TEX files, get the direct file URL
          // Use the full URL with the baseURL from the api instance
          const baseUrl = api.defaults.baseURL;
          const fileUrl = `${baseUrl}/admin_app/paperworks/${paperworkId}/versions/${versionNo}/${fileType}/view/`;
          setFileUrl(fileUrl);
        }
      } catch (error) {
        console.error(`Error fetching ${fileType} file:`, error);
        setError(`Failed to load ${fileType} file. ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (paperworkId && versionNo && fileType) {
      fetchFile();
    }
  }, [paperworkId, versionNo, fileType]);

  const viewZipFile = async (filePath) => {
    try {
      setSelectedZipFile(filePath);
      setZipFileContent(null);
      
      // Get the token for authentication
      const token = localStorage.getItem('token');
      const baseUrl = api.defaults.baseURL;
      const zipFileContentUrl = `${baseUrl}/admin_app/paperworks/${paperworkId}/versions/${versionNo}/zip-file/${encodeURIComponent(filePath)}/`;
      
      // Add token to URL if available
      const urlWithToken = token ? `${zipFileContentUrl}?token=${token}` : zipFileContentUrl;
      
      // Fetch the file content
      const response = await api.get(urlWithToken);
      
      if (response.data && response.data.content) {
        // Store the full response data including content_type and is_binary flags
        setZipFileContent({
          content: response.data.content,
          contentType: response.data.content_type,
          isBinary: response.data.is_binary || false
        });
      } else {
        setZipFileContent({
          content: 'No content available',
          contentType: 'text/plain',
          isBinary: false
        });
      }
    } catch (error) {
      console.error('Error viewing zip file:', error);
      toast.error('Failed to view file from zip');
      setZipFileContent({
        content: 'Error loading file content',
        contentType: 'text/plain',
        isBinary: false
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
        <p>{error}</p>
      </div>
    );
  }

  // Render PDF viewer
  if (fileType === 'pdf' && fileUrl) {
    // Get the token for authentication
    const token = localStorage.getItem('token');
    const authenticatedUrl = token ? `${fileUrl}?token=${token}` : fileUrl;
    
    return (
      <div className="w-full h-[80vh] border border-gray-200 rounded-lg overflow-hidden">
        <iframe 
          src={authenticatedUrl} 
          className="w-full h-full" 
          title="PDF Viewer"
        ></iframe>
      </div>
    );
  }

  // Render DOCX viewer
  if (fileType === 'docx' && fileUrl) {
    // Get the token for authentication
    const token = localStorage.getItem('token');
    const authenticatedUrl = token ? `${fileUrl}?token=${token}` : fileUrl;
    
    return (
      <div className="w-full h-[80vh] border border-gray-200 rounded-lg overflow-hidden">
        <iframe 
          src={authenticatedUrl} 
          className="w-full h-full" 
          title="DOCX Viewer"
        ></iframe>
      </div>
    );
  }

  // Render TEX viewer
  if (fileType === 'tex' && fileUrl) {
    // Get the token for authentication
    const token = localStorage.getItem('token');
    const authenticatedUrl = token ? `${fileUrl}?token=${token}` : fileUrl;
    
    return (
      <div className="w-full h-[80vh] border border-gray-200 rounded-lg overflow-hidden bg-white p-4">
        <iframe 
          src={authenticatedUrl} 
          className="w-full h-full" 
          title="LaTeX Viewer"
        ></iframe>
      </div>
    );
  }

  // Render ZIP contents
  if (fileType === 'zip' && zipContents.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-[80vh]">
          <h3 className="text-lg font-semibold mb-4">ZIP Contents</h3>
          <ul className="space-y-1">
            {zipContents.map((file, index) => (
              <li key={index}>
                <button
                  onClick={() => viewZipFile(file)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${selectedZipFile === file ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {file}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-[80vh]">
          {selectedZipFile ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">{selectedZipFile}</h3>
              {zipFileContent ? (
                <>
                  {zipFileContent.isBinary ? (
                    // Render binary content (images)
                    <div className="flex justify-center">
                      {zipFileContent.contentType.startsWith('image/') ? (
                        <img 
                          src={`data:${zipFileContent.contentType};base64,${zipFileContent.content}`} 
                          alt={selectedZipFile} 
                          className="max-w-full max-h-[70vh] object-contain"
                        />
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
                          <p>Binary file type not supported for preview.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Render text content
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-auto">
                      {zipFileContent.content}
                    </pre>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a file from the list to view its contents</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
      <p>No file available or unsupported file type.</p>
    </div>
  );
};

export default FileViewer;