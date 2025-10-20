
import React, { useState, useEffect } from 'react';
import { FilmIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface VideoGeneratorProps {
    isGeneratingVideo: boolean;
    videoUrl: string | null;
    videoError: string | null;
    onGenerateVideo: () => void;
    canGenerate: boolean;
}

const loadingMessages = [
    "Creating your video tour...",
    "This can take a few minutes, we're stitching your designs together.",
    "Almost there, adding the final touches to your apartment tour.",
];

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ isGeneratingVideo, videoUrl, videoError, onGenerateVideo, canGenerate }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        let interval: number;
        if (isGeneratingVideo) {
            interval = window.setInterval(() => {
                setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isGeneratingVideo]);

    if (!canGenerate && !videoUrl && !isGeneratingVideo && !videoError) {
        return null; 
    }

    return (
        <div className="bg-white dark:bg-slate-800/60 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Apartment Video Tour</h2>
            
            {isGeneratingVideo && (
                <div className="flex flex-col items-center justify-center text-center h-48">
                    <ArrowPathIcon className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{loadingMessages[currentMessageIndex]}</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Please keep this page open.</p>
                </div>
            )}

            {videoError && !isGeneratingVideo && (
                <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg" role="alert">
                    <p className="font-bold">Video Generation Failed</p>
                    <p>{videoError}</p>
                    {videoError.includes("API Key") && (
                        <p className="mt-2 text-sm">Please try generating the video again to select a new key.</p>
                    )}
                </div>
            )}
            
            {videoUrl && !isGeneratingVideo && (
                <div className="aspect-video w-full bg-black rounded-lg">
                    <video src={videoUrl} controls className="w-full h-full rounded-lg" playsInline>
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            {!isGeneratingVideo && !videoUrl && canGenerate && (
                 <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Bring your new designs to life with a cinematic video tour.</p>
                    <button
                        onClick={onGenerateVideo}
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                    >
                        <FilmIcon className="h-6 w-6" />
                        Generate Video Tour
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Video generation uses the Veo model and may take several minutes.
                        <br />
                        An API key with Veo access is required. A selection dialog will appear if needed.
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">Learn about billing.</a>
                    </p>
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;