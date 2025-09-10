import { useState } from 'react';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentViewer } from './components/DocumentViewer';
import { ChangesSummary } from './components/ChangesSummary';
import { DocumentComparison, UploadedFile } from './types';
import { compareDocuments, checkServerHealth } from './utils/documentApi';
import { AlertCircle, FileText, Download } from 'lucide-react';

function App() {
  const [comparison, setComparison] = useState<DocumentComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);

  const handleFilesUploaded = async (oldFile: UploadedFile, newFile: UploadedFile) => {
    setIsLoading(true);
    setError('');
    setComparison(null);

    // Check server health first
    const isServerHealthy = await checkServerHealth();
    setServerStatus(isServerHealthy);
    
    if (!isServerHealthy) {
      setError('Backend server is not responding. Please ensure the server is running on port 3001.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await compareDocuments(oldFile, newFile);
      setComparison(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while comparing documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setComparison(null);
    setError('');
    setServerStatus(null);
  };

  const exportResults = () => {
    if (!comparison) return;
    
    const exportData = {
      summary: comparison.summary,
      changes: comparison.changes.map(change => ({
        type: change.type,
        summary: change.explanation.summary,
        detail: change.explanation.detail,
        impact: change.impact,
        category: change.explanation.category
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document-comparison-results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Server status indicator */}
        {serverStatus === false && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center max-w-4xl mx-auto">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
            <div>
              <span className="text-yellow-700 font-medium">Backend Server Not Running</span>
              <p className="text-yellow-600 text-sm mt-1">
                Please start the backend server by running <code className="bg-yellow-100 px-1 rounded">npm run server</code> in a separate terminal.
              </p>
            </div>
          </div>
        )}

        {!comparison ? (
          <div className="max-w-4xl mx-auto">
            <DocumentUpload 
              onFilesUploaded={handleFilesUploaded}
              isLoading={isLoading}
            />
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center max-w-4xl mx-auto">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-red-700 font-medium">Error</span>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Document Comparison Results
                  </h1>
                  <p className="text-sm text-gray-600">
                    {comparison.oldDocument.name} vs {comparison.newDocument.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportResults}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  New Comparison
                </button>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <DocumentViewer
                  oldDocumentName={comparison.oldDocument.name}
                  newDocumentName={comparison.newDocument.name}
                  differences={comparison.differences}
                  changes={comparison.changes}
                />
              </div>
              <div>
                <ChangesSummary
                  changes={comparison.changes}
                  summary={comparison.summary}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;