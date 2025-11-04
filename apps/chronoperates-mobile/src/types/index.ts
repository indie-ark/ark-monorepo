export interface AppState {
  uploadedImage: string | null; // URI for mobile (not File object)
  isProcessing: boolean;
  error: string | null;
  icsFileUrl: string | null;
  eventsFound: number;
  extractedText: string | null;
}

export interface ApiResponse {
  ics_file_path: string;
  events_found: number;
  extracted_text: string;
}

export interface ApiError {
  detail: string;
}
