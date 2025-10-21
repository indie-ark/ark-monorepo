import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ImageUpload from './components/ImageUpload';
import ProcessingStatus from './components/ProcessingStatus';
import DownloadSection from './components/DownloadSection';
import { getApiUrl } from './config';
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

      const apiUrl = getApiUrl();
      const fullUrl = `${apiUrl}/upload-image`;
      console.log('[App] API URL:', apiUrl);
      console.log('[App] Full URL:', fullUrl);

      const response = await fetch(fullUrl, {
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
    <div className="dark min-h-screen flex items-center justify-center p-4 bg-[#09090b] text-zinc-50">
      <Toaster position="top-right" />

      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-[#09090b] border border-zinc-800 rounded-lg p-8 space-y-6">
          <header className="text-center space-y-2">
            <h1 className="text-zinc-50">Calendar Event Extractor</h1>
            <p className="text-zinc-400">
              Upload an image to extract calendar events
            </p>
          </header>

          <div className="space-y-6">
            {!state.uploadedImage && !state.icsFileUrl && (
              <ImageUpload onImageSelect={handleImageSelect} />
            )}

            {state.uploadedImage && !state.icsFileUrl && (
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-6 text-center">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {state.uploadedImage.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {(state.uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    >
                      Change
                    </button>
                    <button
                      onClick={handleProcessImage}
                      disabled={state.isProcessing}
                      className="px-6 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Process
                    </button>
                  </div>
                </div>

                {state.isProcessing && <ProcessingStatus />}
                {state.error && (
                  <div className="border border-destructive rounded-lg p-4 text-center bg-destructive/10">
                    <p className="text-sm text-destructive-foreground">{state.error}</p>
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
    </div>
  );
}

export default App;