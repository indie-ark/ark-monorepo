import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ImageUpload from './components/ImageUpload';
import ProcessingStatus from './components/ProcessingStatus';
import DownloadSection from './components/DownloadSection';
import { API_URL } from './config';
import './App.css';

interface AppState {
  uploadedImage: File | null;
  isProcessing: boolean;
  error: string | null;
  icsFileUrl: string | null;
  eventsFound: number;
  extractedText: string | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    uploadedImage: null,
    isProcessing: false,
    error: null,
    icsFileUrl: null,
    eventsFound: 0,
    extractedText: null,
  });

  const handleImageSelect = (file: File) => {
    setState(prev => ({
      ...prev,
      uploadedImage: file,
      error: null,
      icsFileUrl: null,
      eventsFound: 0,
      extractedText: null,
    }));
  };

  const handleProcessImage = async () => {
    if (!state.uploadedImage) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', state.uploadedImage);

      const response = await fetch(`${API_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process image');
      }

      const result = await response.json();

      setState(prev => ({
        ...prev,
        isProcessing: false,
        icsFileUrl: result.ics_file_path,
        eventsFound: result.events_found,
        extractedText: result.extracted_text,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  const handleReset = () => {
    setState({
      uploadedImage: null,
      isProcessing: false,
      error: null,
      icsFileUrl: null,
      eventsFound: 0,
      extractedText: null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Calendar Event Extractor
          </h1>
          <p className="text-lg text-gray-600">
            Upload an image with calendar events and get an ICS file you can import
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          {!state.uploadedImage && !state.icsFileUrl && (
            <ImageUpload onImageSelect={handleImageSelect} />
          )}

          {state.uploadedImage && !state.icsFileUrl && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Selected Image</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-gray-500">IMG</span>
                    </div>
                    <div>
                      <p className="font-medium">{state.uploadedImage.name}</p>
                      <p className="text-sm text-gray-500">
                        {(state.uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Choose Different
                    </button>
                    <button
                      onClick={handleProcessImage}
                      disabled={state.isProcessing}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Process Image
                    </button>
                  </div>
                </div>
              </div>

              {state.isProcessing && <ProcessingStatus />}
              {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{state.error}</p>
                </div>
              )}
            </div>
          )}

          {state.icsFileUrl && (
            <DownloadSection
              icsFileUrl={state.icsFileUrl}
              eventsFound={state.eventsFound}
              extractedText={state.extractedText}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;