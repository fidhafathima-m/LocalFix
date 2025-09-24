import React, { useCallback } from "react";
import { FileUpload } from "./FileUpload";

interface Props {
  label: string;
  field: string;
  file: File | null;
  required?: boolean;
  onFileChange: (field: string) => (file: File | null) => void;
}

export const ImageUploadWithPreview: React.FC<Props> = ({
  label,
  field,
  file,
  required = false,
  onFileChange,
}) => {
  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      onFileChange(field)(selectedFile);
    },
    [onFileChange, field]
  );

  return (
    <div className="md:col-span-2">
      <label className="block mb-1 font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {file instanceof File ? (
        <div className="flex flex-col items-start gap-2">
          {file.type === "application/pdf" ? (
            <embed
              src={URL.createObjectURL(file)}
              type="application/pdf"
              width="200"
              height="250"
              className="border rounded"
            />
          ) : (
            <img
              src={URL.createObjectURL(file)}
              alt={`${label} Preview`}
              className="w-32 h-32 object-cover rounded-md border"
            />
          )}
          <button
            type="button"
            onClick={() => handleFileChange(null)}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Choose Again
          </button>
        </div>
      ) : (
        <FileUpload
          onFileChange={handleFileChange}
          required={required}
        />
      )}
    </div>
  );
};