import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { toast } from "sonner";
import { renderAsync } from "docx-preview";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const FileViewer = ({ paperworkId, versionNo, fileType }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [zipContents, setZipContents] = useState([]);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [zipFileContent, setZipFileContent] = useState(null);
  const [docxContent, setDocxContent] = useState(null);
  const [texContent, setTexContent] = useState(null);
  const docxContainerRef = useRef(null);
  const { user } = useAuth();

  const getAccessToken = () => localStorage.getItem("access");

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        setFileUrl(null);
        setZipContents([]);
        setSelectedZipFile(null);
        setZipFileContent(null);
        setDocxContent(null);
        setTexContent(null);

        const baseUrl = api.defaults.baseURL;
        const token = getAccessToken();

        if (fileType === "zip") {
          const zipContentsUrl = `${baseUrl}/admin_app/paperworks/${paperworkId}/versions/${versionNo}/zip-contents/`;
          const urlWithToken = token
            ? `${zipContentsUrl}?token=${encodeURIComponent(token)}`
            : zipContentsUrl;

          const response = await api.get(urlWithToken);
          setZipContents(response.data.files || []);
        } else if (fileType === "docx") {
          const fileUrl = `${baseUrl}/admin_app/paperworks/${paperworkId}/versions/${versionNo}/docx/view/`;
          const urlWithToken = token
            ? `${fileUrl}?token=${encodeURIComponent(token)}`
            : fileUrl;

          const response = await api.get(urlWithToken, {
            responseType: "arraybuffer",
          });
          setDocxContent(response.data);
        } else if (fileType === "tex") {
          const fileUrl = `${baseUrl}/admin_app/paperworks/${paperworkId}/versions/${versionNo}/tex/view/`;
          const urlWithToken = token
            ? `${fileUrl}?token=${encodeURIComponent(token)}`
            : fileUrl;

          const response = await api.get(urlWithToken, {
            responseType: "text",
          });
          setTexContent(response.data);
        } else {
          const fileUrl = `${baseUrl}/admin_app/paperworks/${paperworkId}/versions/${versionNo}/${fileType}/view/`;
          const urlWithToken = token
            ? `${fileUrl}?token=${encodeURIComponent(token)}`
            : fileUrl;
          setFileUrl(urlWithToken);
        }
      } catch (error) {
        console.error(`Error fetching ${fileType} file:`, error);
        setError(
          `Failed to load ${fileType} file. ${
            error.response?.data?.error || error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    if (paperworkId && versionNo && fileType) {
      fetchFile();
    }
  }, [paperworkId, versionNo, fileType]);

  useEffect(() => {
    if (docxContent && docxContainerRef.current) {
      renderAsync(docxContent, docxContainerRef.current);
    }
  }, [docxContent]);

  const viewZipFile = async (filePath) => {
    try {
      setSelectedZipFile(filePath);
      setZipFileContent(null);

      const token = getAccessToken();
      const baseUrl = api.defaults.baseURL;
      const zipFileContentUrl = `${baseUrl}/admin_app/paperworks/${paperworkId}/versions/${versionNo}/zip-file/${encodeURIComponent(
        filePath
      )}/`;
      const urlWithToken = token
        ? `${zipFileContentUrl}?token=${encodeURIComponent(token)}`
        : zipFileContentUrl;

      const response = await api.get(urlWithToken);

      if (response.data && response.data.content) {
        setZipFileContent({
          content: response.data.content,
          contentType: response.data.content_type,
          isBinary: response.data.is_binary || false,
        });
      } else {
        setZipFileContent({
          content: "No content available",
          contentType: "text/plain",
          isBinary: false,
        });
      }
    } catch (error) {
      console.error("Error viewing zip file:", error);
      toast.error("Failed to view file from zip");
      setZipFileContent({
        content: "Error loading file content",
        contentType: "text/plain",
        isBinary: false,
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

  // PDF
  if (fileType === "pdf" && fileUrl) {
    return (
      <div className="w-full h-[80vh] border border-gray-200 rounded-lg overflow-hidden">
        <iframe src={fileUrl} className="w-full h-full" title="PDF Viewer"></iframe>
      </div>
    );
  }

  // DOCX
  if (fileType === "docx" && docxContent) {
    return (
      <div
        ref={docxContainerRef}
        className="w-full h-[80vh] overflow-auto border border-gray-200 rounded-lg p-4 bg-white"
      />
    );
  }

  // LaTeX
  if (fileType === "tex" && texContent) {
    const mathRegex = /\$(.*?)\$|\\\[(.*?)\\\]/gs;
    const equations = [];
    let match;
    while ((match = mathRegex.exec(texContent)) !== null) {
      const eq = match[1] || match[2];
      if (eq) equations.push(eq.trim());
    }

    return (
      <div className="w-full h-[80vh] overflow-auto border border-gray-200 rounded-lg p-4 bg-white space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">LaTeX Source</h3>
          <SyntaxHighlighter
            language="latex"
            style={oneDark}
            wrapLongLines={true}
            customStyle={{ maxHeight: "40vh", borderRadius: "0.5rem" }}
          >
            {texContent}
          </SyntaxHighlighter>
        </div>

        {equations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Rendered Equations</h3>
            <div className="space-y-4">
              {equations.map((eq, idx) => (
                <BlockMath key={idx} math={eq} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ZIP
  if (fileType === "zip" && zipContents.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-[80vh]">
          <h3 className="text-lg font-semibold mb-4">ZIP Contents</h3>
          <ul className="space-y-1">
            {zipContents.map((file, index) => (
              <li key={index}>
                <button
                  onClick={() => viewZipFile(file)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedZipFile === file
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
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
                    <div className="flex justify-center">
                      {zipFileContent.contentType.startsWith("image/") ? (
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
                    <SyntaxHighlighter
                      language="text"
                      style={oneDark}
                      wrapLongLines={true}
                      customStyle={{ borderRadius: "0.5rem" }}
                    >
                      {zipFileContent.content}
                    </SyntaxHighlighter>
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