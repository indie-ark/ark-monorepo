interface Config {
  apiUrl: string;
}

let config: Config | null = null;

export async function loadConfig(): Promise<void> {
  try {
    const response = await fetch('/config.json');
    config = await response.json();
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
