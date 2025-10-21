/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState, useEffect } from "react";
import { FileUpload } from "./FileUpload";
import toast from "react-hot-toast";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

// Add FileMetadata interface
interface FileMetadata {
  _isFile: true;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  uploadedAt?: string;
}

interface Props {
  label: string;
  field: string;
  file: File | FileMetadata | null; // Update to accept FileMetadata
  required?: boolean;
  onFileChange: (field: string) => (file: File | null) => void;
  accept?: string;
  error?: string;
  maxSize?: number;
}

export const ImageUploadWithPreview: React.FC<Props> = ({
  label,
  field,
  file,
  required = false,
  onFileChange,
  accept = "image/*",
  error,
  maxSize = 5 * 1024 * 1024,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [, setCurrentFile] = useState<File | FileMetadata | null>(file);

  useEffect(() => {
    setCurrentFile(file);
  }, [file]);

  // Check if file is a File object or metadata
  const isFileObject = file instanceof File;
  const isFileMetadata = file && typeof file === 'object' && (file as any)._isFile;

  // Generate preview URL when file changes
  useEffect(() => {
    if (isFileObject && file) {
      const url = URL.createObjectURL(file as File);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file, isFileObject]);

  // Add file validation function
  const validateFile = useCallback((selectedFile: File | null): string | null => {
    if (!selectedFile) return null;
    
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      return "File must be JPG, PNG, or PDF";
    }

    if (selectedFile.size > maxSize) {
      const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
      return `File size must be less than ${sizeInMB}MB`;
    }

    return null;
  }, [maxSize]);

  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      // Validate file before setting it
      if (selectedFile) {
        const validationError = validateFile(selectedFile);
        if (validationError) {
          toast.error(validationError);
          return; // Don't update if validation fails
        }
      }
      
      setCurrentFile(selectedFile);
      onFileChange(field)(selectedFile);
    },
    [onFileChange, field, validateFile]
  );

  const handleRemoveFile = () => {
    handleFileChange(null);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      <label className="block mb-1 font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Show different UI based on file type */}
      {isFileObject && previewUrl ? (
        // Actual File object with preview
        <div className="flex flex-col items-start gap-2">
          {(file as File).type === "application/pdf" ? (
            <div className="border rounded p-2 bg-gray-50">
              <embed
                src={previewUrl}
                type="application/pdf"
                width="200"
                height="250"
                className="border rounded"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                {(file as File).name}
              </p>
            </div>
          ) : (
            <div className="border rounded p-2 bg-gray-50">
              <img
                src={previewUrl}
                alt={`${label} Preview`}
                className="w-32 h-32 object-cover rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                {(file as File).name}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemoveFile}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Choose Again
          </button>
        </div>
      ) : isFileMetadata ? (
        // File metadata (restored from localStorage)
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">
                  {(file as FileMetadata).name}
                </p>
                <p className="text-sm text-green-600">
                  {formatFileSize((file as FileMetadata).size)} • {((file as FileMetadata).uploadedAt ? 'Uploaded' : 'Previously uploaded')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove file"
            >
              <DeleteIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Note:</span> This file was uploaded in your previous session. 
              It's safely stored on our servers. You only need to re-upload if you want to change the file.
            </p>
          </div>
          
<div className="flex items-center space-x-2 text-sm text-gray-600">
  <span>Want to change the file?</span>
  <FileUpload
    onFileChange={handleFileChange}
    required={false}
    accept={accept}
    fieldName={field}
    error={error}
    maxSize={maxSize}
    compact={true} // This will now work
  />
</div>
        </div>
      ) : (
        // No file - show regular upload
        <FileUpload
          onFileChange={handleFileChange}
          required={required}
          accept={accept}
          fieldName={field}
          error={error}
          maxSize={maxSize}
        />
      )}
      
      {/* Show error message if exists */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};