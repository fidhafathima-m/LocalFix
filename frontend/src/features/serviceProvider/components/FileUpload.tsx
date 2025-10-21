import React, { useRef } from "react";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  required?: boolean;
  accept?: string;
  fieldName?: string;
  error?: string;
  maxSize?: number;
  compact?: boolean; // Add compact prop
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  required = false,
  fieldName,
  accept = "image/*",
  error,
  maxSize = 5 * 1024 * 1024,
  compact = false, // Default to false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "File must be JPG, PNG, or PDF";
    }

    if (file.size > maxSize) {
      const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
      return `File size must be less than ${sizeInMB}MB`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        alert(validationError);
        event.target.value = ""; 
        onFileChange(null);
        return;
      }
    }
    onFileChange(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] || null;
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }
    }
    onFileChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Compact version for when files are already uploaded
  if (compact) {
    return (
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          required={required}
          className="hidden"
          id={`file-upload-${fieldName || 'compact'}`}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 border border-blue-200 transition-colors font-medium"
        >
          Choose New File
        </button>
        {error && (
          <p className="text-red-500 text-sm mt-1 font-medium">{error}</p>
        )}
      </div>
    );
  }

  // Regular full version
  return (
    <div>
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors ${
          error
          ? "border-red-300 bg-red-50" 
          : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          required={required}
          className="hidden"
        />
        <div className="text-gray-600">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-1">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500 mt-1">
            {accept.includes("pdf") ? "PDF, JPG, JPEG, PNG" : "Images"} up to 5MB
          </p>
          {error && (
              <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>
            )}
        </div>
      </div>
    </div>
  );
};