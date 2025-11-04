import Constants from 'expo-constants';

interface Config {
  apiUrl: string;
}

let config: Config | null = null;

export function loadConfig(): void {
  // For Expo, we use environment variables from app.json extra field or process.env
  // EXPO_PUBLIC_ prefix makes env vars accessible at runtime
  const envApiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

  if (envApiUrl) {
    config = { apiUrl: envApiUrl };
  } else {
    // Fallback to localhost - developer needs to update this with their machine's IP
    // For Android emulator: 10.0.2.2
    // For real device: Use your computer's IP address on the local network
    console.warn('API_URL not configured. Using default localhost. Update with your machine IP for testing.');
    config = { apiUrl: 'http://10.0.2.2:8000' };
  }

  console.log('[loadConfig] API URL:', config.apiUrl);
}

export function getApiUrl(): string {
  if (!config) {
    throw new Error('Config not loaded. Call loadConfig() before accessing config values.');
  }
  return config.apiUrl;
}

// For testing purposes only
export function resetConfig(): void {
  config = null;
}
