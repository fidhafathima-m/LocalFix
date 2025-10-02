// components/FileUpload.tsx
import React, { useRef } from 'react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  required?: boolean;
  accept?: string;
  fieldName?: string; // Add this prop
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileChange, 
  required = false, 
  accept = 'image/*',
  fieldName = 'file' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    console.log(`FileUpload: Selected file for ${fieldName}:`, file?.name);
    onFileChange(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] || null;
    console.log(`FileUpload: Dropped file for ${fieldName}:`, file?.name);
    onFileChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
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
          {accept.includes('pdf') ? 'PDF, JPG, JPEG, PNG' : 'Images'} up to 10MB
        </p>
      </div>
    </div>
  );
};