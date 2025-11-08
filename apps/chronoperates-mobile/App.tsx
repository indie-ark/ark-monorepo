import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, useColorScheme, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import Toast from 'react-native-toast-message';
import { loadConfig, getApiUrl } from './src/config';
import { ImageInputOptions } from './src/components/ImageInputOptions';
import { ImagePreview } from './src/components/ImagePreview';
import { ProcessingStatus } from './src/components/ProcessingStatus';
import { ResultsView } from './src/components/ResultsView';
import { AppState, ApiResponse, ApiError } from './src/types';
import './global.css';

export default function App() {
  const colorScheme = useColorScheme();

  const [state, setState] = useState<AppState>({
    uploadedImage: null,
    isProcessing: false,
    error: null,
    icsFileUrl: null,
    eventsFound: 0,
    extractedText: null,
  });

  useEffect(() => {
    // Load configuration
    loadConfig();

    // Handle incoming share intents
    const handleUrl = (event: { url: string }) => {
      const { url } = event;
      if (url) {
        console.log('Received shared URL:', url);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // If we're on the results screen or image preview, go back to start
      if (state.icsFileUrl || state.uploadedImage) {
        handleReset();
        return true; // Prevent default behavior (exit app)
      }
      return false; // Allow default behavior (exit app) on first screen
    });

    return () => backHandler.remove();
  }, [state.icsFileUrl, state.uploadedImage]);

  const handleImageSelect = (imageUri: string) => {
    setState({
      uploadedImage: imageUri,
      isProcessing: false,
      error: null,
      icsFileUrl: null,
      eventsFound: 0,
      extractedText: null,
    });
  };

  const handleProcess = async () => {
    if (!state.uploadedImage) return;

    setState((prev) => ({ ...prev, isProcessing: true, error: null }));

    try {
      const apiUrl = getApiUrl();
      const formData = new FormData();

      const uriParts = state.uploadedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('file', {
        uri: state.uploadedImage,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      const response = await fetch(`${apiUrl}/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to process image';
        try {
          const errorData: ApiError = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        icsFileUrl: data.ics_file_path,
        eventsFound: data.events_found,
        extractedText: data.extracted_text,
      }));
    } catch (error) {
      console.error('Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));

      Toast.show({
        type: 'error',
        text1: 'Processing failed',
        text2: errorMessage,
      });
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
    <SafeAreaProvider>
      <SafeAreaView className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

        {state.error && !state.isProcessing && (
          <View className="bg-destructive px-6 py-4 border-b border-destructive">
            <Text className="text-destructive-foreground text-sm text-center">
              {state.error}
            </Text>
          </View>
        )}

        {!state.uploadedImage && !state.icsFileUrl && (
          <ImageInputOptions onImageSelect={handleImageSelect} />
        )}

        {state.uploadedImage && !state.icsFileUrl && !state.isProcessing && (
          <ImagePreview
            imageUri={state.uploadedImage}
            onProcess={handleProcess}
            onChangeImage={handleReset}
            isProcessing={state.isProcessing}
          />
        )}

        {state.isProcessing && <ProcessingStatus />}

        {state.icsFileUrl && (
          <ResultsView
            icsFileUrl={state.icsFileUrl}
            eventsFound={state.eventsFound}
            extractedText={state.extractedText}
            onReset={handleReset}
          />
        )}

        <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
