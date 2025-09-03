import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paperworksAPI } from '../../services/api';
import { toast } from 'sonner';

const PaperworkSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paperwork, setPaperwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    version_no: '01',
    paper_pdf: null,
    latex_tex: null,
    python_zip: null,
    docx_file: null,
  });

  useEffect(() => {
    const fetchPaperwork = async () => {
      try {
        setLoading(true);
        const response = await paperworksAPI.getPaperworkById(id);
        setPaperwork(response.data);

        const versionsRes = await paperworksAPI.getVersions(id);
        if (versionsRes.data && versionsRes.data.length > 0) {
          const maxVersion = Math.max(
            ...versionsRes.data.map(v => parseInt(v.version_no, 10) || 0)
          );
          const nextVersion = String(maxVersion + 1).padStart(2, '0');
          setFormData(prev => ({ ...prev, version_no: nextVersion }));
        } else {
          setFormData(prev => ({ ...prev, version_no: '01' }));
        }
      } catch (error) {
        console.error('Error fetching paperwork:', error);
        toast.error('Failed to load paperwork details');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchPaperwork();
  }, [id, user, navigate]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paper_pdf) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    try {
      setSubmitting(true);

      const submitFormData = new FormData();
      if (formData.paper_pdf) submitFormData.append('paper_pdf', formData.paper_pdf);
      if (formData.latex_tex) submitFormData.append('latex_tex', formData.latex_tex);
      if (formData.python_zip) submitFormData.append('python_zip', formData.python_zip);
      if (formData.docx_file) submitFormData.append('docx_file', formData.docx_file);
      submitFormData.append('version_no', formData.version_no);

      await paperworksAPI.submitVersion(id, submitFormData);

      toast.success('Version submitted successfully');
      navigate(`/papers/${id}`);
    } catch (error) {
      console.error('Error submitting version:', error);
      toast.error(error.response?.data?.message || 'Failed to submit version');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit New Version</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Paper Details</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-medium">Title:</span> {paperwork.title}
              </p>
              <p className="mt-2 text-gray-800 dark:text-gray-200">
                <span className="font-medium">Current Status:</span> {paperwork.status}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Version No (auto) */}
            <div className="mb-6">
              <label htmlFor="version_no" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Version Number
              </label>
              <input
                type="text"
                id="version_no"
                name="version_no"
                value={formData.version_no}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>

            {/* PDF Upload */}
            <div className="mb-6">
              <label htmlFor="paper_pdf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Paper (PDF only) *
              </label>
              <input
                type="file"
                id="paper_pdf"
                name="paper_pdf"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 dark:file:bg-gray-700 
                  file:text-blue-700 dark:file:text-gray-200
                  hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
                required
              />
              {formData.paper_pdf && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Selected file: {formData.paper_pdf.name} ({Math.round(formData.paper_pdf.size / 1024)} KB)
                </p>
              )}
            </div>

            {/* LaTeX Upload */}
            <div className="mb-6">
              <label htmlFor="latex_tex" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload LaTeX Files (TEX)
              </label>
              <input
                type="file"
                id="latex_tex"
                name="latex_tex"
                accept=".tex"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 dark:file:bg-gray-700 
                  file:text-blue-700 dark:file:text-gray-200
                  hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
              />
              {formData.latex_tex && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Selected file: {formData.latex_tex.name} ({Math.round(formData.latex_tex.size / 1024)} KB)
                </p>
              )}
            </div>

            {/* Python ZIP Upload */}
            <div className="mb-6">
              <label htmlFor="python_zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Python Code (ZIP)
              </label>
              <input
                type="file"
                id="python_zip"
                name="python_zip"
                accept=".zip"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 dark:file:bg-gray-700 
                  file:text-blue-700 dark:file:text-gray-200
                  hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
              />
              {formData.python_zip && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Selected file: {formData.python_zip.name} ({Math.round(formData.python_zip.size / 1024)} KB)
                </p>
              )}
            </div>

            {/* DOCX Upload */}
            <div className="mb-6">
              <label htmlFor="docx_file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload DOCX File (Optional)
              </label>
              <input
                type="file"
                id="docx_file"
                name="docx_file"
                accept=".docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 dark:file:bg-gray-700 
                  file:text-blue-700 dark:file:text-gray-200
                  hover:file:bg-blue-100 dark:hover:file:bg-gray-600"
              />
              {formData.docx_file && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Selected file: {formData.docx_file.name} ({Math.round(formData.docx_file.size / 1024)} KB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Version'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaperworkSubmit;
