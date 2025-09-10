import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { UploadedFile } from '../types';

interface DocumentUploadProps {
  onFilesUploaded: (oldFile: UploadedFile, newFile: UploadedFile) => void;
  isLoading: boolean;
}

export function DocumentUpload({ onFilesUploaded, isLoading }: DocumentUploadProps) {
  const [oldFile, setOldFile] = useState<UploadedFile | null>(null);
  const [newFile, setNewFile] = useState<UploadedFile | null>(null);
  const [dragActive, setDragActive] = useState<'old' | 'new' | null>(null);
  const [error, setError] = useState<string>('');

  const handleDrag = useCallback((e: React.DragEvent, type: 'old' | 'new') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(type);
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'old' | 'new') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0], type);
    }
  }, []);

  const handleFileSelect = (file: File, type: 'old' | 'new') => {
    setError('');
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload PDF, DOCX, or TXT files only.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    const uploadedFile: UploadedFile = {
      file,
      name: file.name,
      type: file.type
    };

    if (type === 'old') {
      setOldFile(uploadedFile);
    } else {
      setNewFile(uploadedFile);
    }
  };

  const removeFile = (type: 'old' | 'new') => {
    if (type === 'old') {
      setOldFile(null);
    } else {
      setNewFile(null);
    }
  };

  const handleCompare = () => {
    if (oldFile && newFile) {
      onFilesUploaded(oldFile, newFile);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Legal Document Comparison Tool
        </h1>
        <p className="text-gray-600">
          Upload two versions of your document to see changes with AI-powered explanations
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Old Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Original Document
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive === 'old'
                ? 'border-blue-400 bg-blue-50'
                : oldFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={(e) => handleDrag(e, 'old')}
            onDragLeave={(e) => handleDrag(e, 'old')}
            onDragOver={(e) => handleDrag(e, 'old')}
            onDrop={(e) => handleDrop(e, 'old')}
          >
            {oldFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{oldFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(oldFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile('old')}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drop your original document here, or
                </p>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'old')}
                  className="hidden"
                  id="old-file-input"
                />
                <label
                  htmlFor="old-file-input"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 cursor-pointer transition-colors"
                >
                  Browse files
                </label>
              </div>
            )}
          </div>
        </div>

        {/* New Document Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Updated Document
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive === 'new'
                ? 'border-blue-400 bg-blue-50'
                : newFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={(e) => handleDrag(e, 'new')}
            onDragLeave={(e) => handleDrag(e, 'new')}
            onDragOver={(e) => handleDrag(e, 'new')}
            onDrop={(e) => handleDrop(e, 'new')}
          >
            {newFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{newFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(newFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile('new')}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drop your updated document here, or
                </p>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'new')}
                  className="hidden"
                  id="new-file-input"
                />
                <label
                  htmlFor="new-file-input"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 cursor-pointer transition-colors"
                >
                  Browse files
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleCompare}
          disabled={!oldFile || !newFile || isLoading}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors ${
            oldFile && newFile && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing Documents...
            </>
          ) : (
            'Compare Documents'
          )}
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center">
        Supported formats: PDF, DOCX, TXT • Maximum file size: 10MB
      </div>
    </div>
  );
}