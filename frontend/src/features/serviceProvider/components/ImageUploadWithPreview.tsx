// components/ImageUploadWithPreview.tsx
import React, { useCallback, useState, useEffect } from "react";
import { FileUpload } from "./FileUpload";

interface Props {
  label: string;
  field: string;
  file: File | null;
  required?: boolean;
  onFileChange: (field: string) => (file: File | null) => void;
  accept?: string;
}

export const ImageUploadWithPreview: React.FC<Props> = ({
  label,
  field,
  file,
  required = false,
  onFileChange,
  accept = 'image/*'
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(file);

  // Update local state when prop changes
  useEffect(() => {
    setCurrentFile(file);
  }, [file]);

  // Generate preview URL when file changes
  useEffect(() => {
    if (currentFile instanceof File) {
      const url = URL.createObjectURL(currentFile);
      setPreviewUrl(url);
      
      // Clean up the URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [currentFile]);

  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      console.log(`File selected for ${field}:`, selectedFile?.name);
      setCurrentFile(selectedFile);
      onFileChange(field)(selectedFile);
    },
    [onFileChange, field]
  );

  const handleRemoveFile = () => {
    console.log(`Removing file for ${field}`);
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
          fieldName={field} // Pass field name to FileUpload
        />
      )}
    </div>
  );
};