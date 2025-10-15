import React, { useCallback, useState, useEffect } from "react";
import { FileUpload } from "./FileUpload";
import toast from "react-hot-toast";

interface Props {
  label: string;
  field: string;
  file: File | null;
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
  const [currentFile, setCurrentFile] = useState<File | null>(file);

  useEffect(() => {
    setCurrentFile(file);
  }, [file]);

  // Generate preview URL when file changes
  useEffect(() => {
    if (currentFile instanceof File) {
      const url = URL.createObjectURL(currentFile);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [currentFile]);

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

  return (
    <div className="w-full">
      <label className="block mb-1 font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {currentFile instanceof File && previewUrl ? (
        <div className="flex flex-col items-start gap-2">
          {currentFile.type === "application/pdf" ? (
            <div className="border rounded p-2 bg-gray-50">
              <embed
                src={previewUrl}
                type="application/pdf"
                width="200"
                height="250"
                className="border rounded"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                {currentFile.name}
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
                {currentFile.name}
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
      ) : (
        <FileUpload
          onFileChange={handleFileChange}
          required={required}
          accept={accept}
          fieldName={field}
          error={error} // ✅ Pass error prop
          maxSize={maxSize} // ✅ Pass maxSize prop
        />
      )}
      
      {/* Show error message if exists */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};