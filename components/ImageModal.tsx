import React, { useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    const filename = alt.replace(/\s+/g, '-').toLowerCase() + '.png';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 relative max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-200 dark:border-slate-700">
            <h2 id="image-modal-title" className="text-lg font-semibold text-gray-800 dark:text-gray-100">{alt}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Close image view"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
        </div>
        
        <div className="flex-grow overflow-auto">
            <img src={src} alt={alt} className="w-auto h-auto max-w-full max-h-[70vh] object-contain mx-auto" />
        </div>

        <div className="mt-4 pt-2 border-t flex justify-end border-gray-200 dark:border-slate-700">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Download Image
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;