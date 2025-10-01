import React from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

interface DownloadSectionProps {
  icsFileUrl: string;
  eventsFound: number;
  extractedText: string | null;
  onReset: () => void;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({
  icsFileUrl,
  eventsFound,
  extractedText,
  onReset,
}) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}/download-ics?file_path=${encodeURIComponent(icsFileUrl)}`);

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calendar_events.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Calendar file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download calendar file');
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Processing Complete!</h3>
            <p className="text-green-600">
              Found {eventsFound} calendar event{eventsFound !== 1 ? 's' : ''} in your image
            </p>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Download Your Calendar</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">calendar_events.ics</p>
              <p className="text-sm text-gray-500">
                {eventsFound} event{eventsFound !== 1 ? 's' : ''} • Ready to import
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Download ICS File
          </button>
        </div>
      </div>

      {/* Extracted Text Preview */}
      {extractedText && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Extracted Event Details</h3>
          <div className="bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{extractedText}</pre>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Process Another Image
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">How to use your calendar file:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Google Calendar:</strong> Go to Settings → Import & Export → Import</li>
          <li>• <strong>Apple Calendar:</strong> Double-click the .ics file or drag it into Calendar</li>
          <li>• <strong>Outlook:</strong> File → Open & Export → Import/Export → Import .ics file</li>
        </ul>
      </div>
    </div>
  );
};

export default DownloadSection;
