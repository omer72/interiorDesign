import React, { useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import { redesignRoom, generateVideoTour, ApiKeyError } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { DESIGN_STYLES } from './constants';
import { DesignStyle, User } from './types';
import Header from './components/Header';
import StyleSelector from './components/StyleSelector';
import ImageUploader from './components/ImageUploader';
import ResultsDisplay from './components/ResultsDisplay';
import LoginPage from './components/LoginPage';
import { ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface OriginalImage {
  file: File;
  url: string;
}

interface GeneratedImage {
  url: string;
  isSaved: boolean;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [originalImages, setOriginalImages] = useState<OriginalImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<(GeneratedImage | null)[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>(DESIGN_STYLES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for video generation
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isApiKeySelectedForVideo, setIsApiKeySelectedForVideo] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing login on initial load
    const token = localStorage.getItem('google-auth-token');
    if (token) {
      try {
        const decodedUser: any = jwtDecode(token);
        setUser({
          name: decodedUser.name,
          email: decodedUser.email,
          picture: decodedUser.picture,
        });
      } catch (e) {
        console.error("Invalid token:", e);
        localStorage.removeItem('google-auth-token');
      }
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setIsApiKeySelectedForVideo(true);
      }
    };
    if (user) {
      checkApiKey();
    }
  }, [user]);
  
  const handleLoginSuccess = useCallback((loggedInUser: User, token: string) => {
    localStorage.setItem('google-auth-token', token);
    setUser(loggedInUser);
  }, []);
  
  const handleSignOut = useCallback(() => {
    if (window.google) {
        window.google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('google-auth-token');
    setUser(null);
  }, []);


  const handleFilesChange = (files: FileList | null) => {
    if (files) {
      setGeneratedImages(new Array(files.length).fill(null));
      setError(null);
      setVideoUrl(null);
      setVideoError(null);
      const newImages = Array.from(files).map(file => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setOriginalImages(newImages);
    }
  };
  
  const handleRedesign = useCallback(async () => {
    if (originalImages.length === 0) {
      setError('Please upload at least one image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setVideoError(null);

    try {
      const redesignPromises = originalImages.map(async (img, index) => {
        const existingGenerated = generatedImages[index];
        if (existingGenerated?.isSaved) {
            return existingGenerated;
        }

        const base64Image = await fileToBase64(img.file);
        const mimeType = img.file.type;
        const redesignedUrl = await redesignRoom(base64Image, mimeType, selectedStyle);
        return { url: redesignedUrl, isSaved: false };
      });

      const results = await Promise.all(redesignPromises);
      setGeneratedImages(results);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(`An error occurred: ${err.message}`);
      } else {
        setError('An unexpected error occurred while redesigning the images.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, selectedStyle, generatedImages]);

  const handleToggleSaveImage = (index: number) => {
    setGeneratedImages(prev => {
        const newImages = [...prev];
        const image = newImages[index];
        if (image) {
            newImages[index] = { ...image, isSaved: !image.isSaved };
        }
        return newImages;
    });
  };

  const handleGenerateVideo = useCallback(async () => {
    const imagesForVideo = generatedImages.filter((img): img is GeneratedImage => img !== null).map(img => img.url);

    if (imagesForVideo.length < 2) {
        setVideoError("At least two redesigned images are needed to create a tour.");
        return;
    }

    let keySelected = isApiKeySelectedForVideo;
    if (!keySelected) {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            keySelected = true; 
            setIsApiKeySelectedForVideo(true);
        } else {
            setVideoError("API Key selection is not available in this environment.");
            return;
        }
    }

    setIsGeneratingVideo(true);
    setVideoUrl(null);
    setVideoError(null);

    try {
        const url = await generateVideoTour(imagesForVideo);
        setVideoUrl(url);
    } catch (err) {
        console.error(err);
        if (err instanceof ApiKeyError) {
            setVideoError(err.message);
            setIsApiKeySelectedForVideo(false); 
        } else if (err instanceof Error) {
            setVideoError(`An error occurred: ${err.message}`);
        } else {
            setVideoError('An unexpected error occurred while generating the video.');
        }
    } finally {
        setIsGeneratingVideo(false);
    }
  }, [generatedImages, isApiKeySelectedForVideo]);

  if (!isAuthReady) {
    // Render a simple loading spinner or null while checking auth status
    return <div className="min-h-screen bg-gray-50 dark:bg-slate-900" />;
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 font-sans">
      <Header user={user} onSignOut={handleSignOut} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800/60 dark:border dark:border-slate-700 p-6 rounded-2xl shadow-lg h-fit">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Design Controls</h2>
            <div className="space-y-6">
              <ImageUploader onFilesChange={handleFilesChange} />
              <StyleSelector
                selectedStyle={selectedStyle}
                onStyleChange={(e) => setSelectedStyle(e.target.value as DesignStyle)}
              />
              <button
                onClick={handleRedesign}
                disabled={isLoading || originalImages.length === 0}
                className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    Redesigning...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-6 w-6" />
                    Redesign My Room
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Results */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            <ResultsDisplay
              isLoading={isLoading}
              originalImages={originalImages}
              generatedImages={generatedImages}
              selectedStyle={selectedStyle}
              isGeneratingVideo={isGeneratingVideo}
              videoUrl={videoUrl}
              videoError={videoError}
              onGenerateVideo={handleGenerateVideo}
              onToggleSaveImage={handleToggleSaveImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;