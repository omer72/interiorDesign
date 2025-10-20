
import React, { useState } from 'react';
import { PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';

interface ImageUploaderProps {
  onFilesChange: (files: FileList | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFilesChange(files);
      // FIX: Explicitly type the mapped item as File to access the 'name' property.
      setFileNames(Array.from(files).map((f: File) => f.name));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesChange(files);
      // FIX: Explicitly type the mapped item as File to access the 'name' property.
      setFileNames(Array.from(files).map((f: File) => f.name));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Upload Room Image(s)</label>
      <label
        htmlFor="file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragOver ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEnter} // Re-use enter logic
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <ArrowUpTrayIcon className={`w-10 h-10 mb-3 ${isDragOver ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}`} />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, or WEBP</p>
        </div>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/png, image/jpeg, image/webp" onChange={handleFileSelect} />
      </label>
      {fileNames.length > 0 && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <p className="font-medium">Selected files:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            {fileNames.map((name, index) => <li key={index} className="truncate">{name}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;