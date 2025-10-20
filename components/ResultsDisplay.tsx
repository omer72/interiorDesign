import React, { useState } from 'react';
import { PhotoIcon, ArrowPathIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/solid';
import ImageModal from './ImageModal';
import VideoGenerator from './VideoGenerator';

interface GeneratedImage {
  url: string;
  isSaved: boolean;
}

interface ResultsDisplayProps {
  isLoading: boolean;
  originalImages: { url: string }[];
  generatedImages: (GeneratedImage | null)[];
  selectedStyle: string;
  isGeneratingVideo: boolean;
  videoUrl: string | null;
  videoError: string | null;
  onGenerateVideo: () => void;
  onToggleSaveImage: (index: number) => void;
}

const ImageCard: React.FC<{ 
    src: string; 
    alt: string; 
    label: string; 
    onClick: () => void; 
    isSaved?: boolean;
    onSave?: () => void;
}> = ({ src, alt, label, onClick, isSaved, onSave }) => (
    <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer relative group"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
        <img src={src} alt={alt} className="w-full h-64 object-cover" />
        <div className="p-4 bg-gray-800 dark:bg-slate-700">
            <p className="text-white dark:text-slate-100 font-semibold text-center">{label}</p>
        </div>
        {onSave && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                }}
                className={`absolute top-3 right-3 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                    isSaved ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white bg-opacity-80 dark:bg-slate-600 dark:bg-opacity-80 text-gray-800 dark:text-gray-100 hover:bg-opacity-100 dark:hover:bg-opacity-100'
                }`}
                aria-label={isSaved ? 'Unsave image' : 'Save image'}
            >
                {isSaved ? <LockClosedIcon className="h-5 w-5" /> : <LockOpenIcon className="h-5 w-5" />}
            </button>
        )}
    </div>
);


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
    isLoading, 
    originalImages, 
    generatedImages, 
    selectedStyle,
    isGeneratingVideo,
    videoUrl,
    videoError,
    onGenerateVideo,
    onToggleSaveImage
}) => {
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string; } | null>(null);
  
  const hasResults = generatedImages.some(img => img !== null);
  const hasOriginals = originalImages.length > 0;

  const handleOpenModal = (src: string, alt: string) => {
    setZoomedImage({ src, alt });
  };
  
  const handleCloseModal = () => {
    setZoomedImage(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800/60 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 h-96">
        <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Generating Your Redesign...</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The AI is working its magic. This might take a moment.</p>
      </div>
    );
  }

  if (!hasResults && !hasOriginals) {
    return (
       <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800/60 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 h-96 text-center">
        <PhotoIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Your design will appear here</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">Upload an image of your room, select a style, and click 'Redesign' to see your new interior.</p>
      </div>
    );
  }

  return (
    <>
      <VideoGenerator
        isGeneratingVideo={isGeneratingVideo}
        videoUrl={videoUrl}
        videoError={videoError}
        onGenerateVideo={onGenerateVideo}
        canGenerate={generatedImages.filter(img => img !== null).length > 1}
      />
      <div className="space-y-8">
        {hasOriginals && !hasResults && (
           <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Original Image(s)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {originalImages.map((img, index) => {
                    const alt = `Original room ${index + 1}`;
                    return (
                      <ImageCard key={`orig-${index}`} src={img.url} alt={alt} label={`Original ${index + 1}`} onClick={() => handleOpenModal(img.url, alt)} />
                    );
                  })}
              </div>
           </div>
        )}
        
        {hasResults && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Redesigned Room(s)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {originalImages.map((img, index) => {
                const originalAlt = `Original room ${index + 1}`;
                const generatedAlt = `Redesigned room in ${selectedStyle} style`;
                const generatedImage = generatedImages[index];

                return (
                  <React.Fragment key={`result-pair-${index}`}>
                    <ImageCard src={img.url} alt={originalAlt} label={`Original ${index + 1}`} onClick={() => handleOpenModal(img.url, originalAlt)} />
                    {generatedImage && (
                        <ImageCard 
                            src={generatedImage.url} 
                            alt={generatedAlt} 
                            label={`${selectedStyle} Style`} 
                            onClick={() => handleOpenModal(generatedImage.url, generatedAlt)}
                            isSaved={generatedImage.isSaved}
                            onSave={() => onToggleSaveImage(index)}
                        />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {zoomedImage && (
        <ImageModal src={zoomedImage.src} alt={zoomedImage.alt} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default ResultsDisplay;