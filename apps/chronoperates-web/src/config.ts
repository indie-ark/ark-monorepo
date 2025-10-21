interface Config {
  apiUrl: string;
}

let config: Config | null = null;

export async function loadConfig(): Promise<void> {
  try {
    const response = await fetch('/config.json');
    const loadedConfig = await response.json();

    // Check if apiUrl is a placeholder (not replaced by entrypoint.sh)
    if (loadedConfig.apiUrl && loadedConfig.apiUrl.includes('${')) {
      console.warn('Config contains placeholder, using environment variable');
      config = {
        apiUrl: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`
      };
    } else {
      config = loadedConfig;
    }
  } catch (error) {
    console.warn('Failed to load config.json, using default values', error);
    config = {
      apiUrl: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`
    };
  }
}

export function getApiUrl(): string {
  if (!config) {
    throw new Error('Config not loaded. Call loadConfig() before accessing config values.');
  }
  console.log('[getApiUrl] Returning:', config.apiUrl);
  return config.apiUrl;
}

// For testing purposes only
export function resetConfig(): void {
  config = null;
}
