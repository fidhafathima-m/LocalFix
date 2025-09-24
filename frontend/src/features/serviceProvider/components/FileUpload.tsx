import React, { useState } from 'react'
interface FileUploadProps {
  label?: string
  maxSize?: string
  required?: boolean
  accept?: string
  onFileChange?: (file: File | null) => void
}
export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload a file',
  maxSize = '10MB',
  required = false,
  accept = 'image/png,image/jpeg,image/gif,application/pdf',
  onFileChange,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [ , setFile] = useState<File | null>(null)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFile = e.dataTransfer.files[0]
      setFile(newFile)
      if (onFileChange) onFileChange(newFile)
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0]
      setFile(newFile)
      if (onFileChange) onFileChange(newFile)
    }
  }
  return (
    <div
      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="text-gray-400 mb-2">
        <svg
          className="w-10 h-10 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
      </div>
      <div className="text-center">
        <label
          htmlFor="file-upload"
          className="text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          {label}
        </label>
        <span className="text-gray-500"> or drag and drop</span>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, GIF up to {maxSize}
        </p>
      </div>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={accept}
        required={required}
      />
    </div>
  )
}
