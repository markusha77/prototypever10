import React, { useRef, useState } from 'react';
import { Upload, X, Check } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File, isMain?: boolean) => void;
  onMultipleFilesSelect?: (files: File[]) => void;
  currentImageUrl?: string;
  additionalImages?: string[];
  onClearImage?: (imageUrl?: string) => void;
  onSetMainImage?: (imageUrl: string) => void;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onMultipleFilesSelect,
  currentImageUrl,
  additionalImages = [],
  onClearImage,
  onSetMainImage,
  multiple = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (multiple && files.length > 1 && onMultipleFilesSelect) {
      // Convert FileList to array
      const fileArray = Array.from(files);
      onMultipleFilesSelect(fileArray);
    } else {
      // Handle single file
      onFileSelect(files[0], true);
    }

    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (multiple && files.length > 1 && onMultipleFilesSelect) {
      // Convert FileList to array
      const fileArray = Array.from(files);
      onMultipleFilesSelect(fileArray);
    } else {
      // Handle single file
      onFileSelect(files[0], true);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Project Images
      </label>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
        } transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          multiple={multiple}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-indigo-100 rounded-full">
            <Upload size={24} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {multiple ? 'Drag and drop images or' : 'Drag and drop an image or'}
            </p>
            <button
              type="button"
              onClick={handleButtonClick}
              className="text-indigo-600 font-medium hover:text-indigo-700 focus:outline-none"
            >
              browse
            </button>
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>

      {/* Display current images */}
      {(currentImageUrl || additionalImages.length > 0) && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Project Images
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Main image */}
            {currentImageUrl && (
              <div className="relative group">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border-2 border-indigo-500">
                  <img
                    src={currentImageUrl}
                    alt="Main project"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-md">
                    Main
                  </div>
                </div>
                {onClearImage && (
                  <button
                    type="button"
                    onClick={() => onClearImage()}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Remove image"
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                )}
              </div>
            )}

            {/* Additional images */}
            {additionalImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imageUrl}
                    alt={`Project ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {onSetMainImage && (
                    <button
                      type="button"
                      onClick={() => onSetMainImage(imageUrl)}
                      className="p-1 bg-white rounded-full shadow-md"
                      aria-label="Set as main image"
                    >
                      <Check size={14} className="text-green-500" />
                    </button>
                  )}
                  {onClearImage && (
                    <button
                      type="button"
                      onClick={() => onClearImage(imageUrl)}
                      className="p-1 bg-white rounded-full shadow-md"
                      aria-label="Remove image"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
