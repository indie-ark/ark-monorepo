import React from 'react';
import toast from 'react-hot-toast';
import { getApiUrl } from '../config';

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
      const response = await fetch(`${getApiUrl()}/download-ics?file_path=${encodeURIComponent(icsFileUrl)}`);

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
      {/* Success Message */}
      <div className="text-center py-2">
        <p className="text-muted-foreground">
          Found {eventsFound} event{eventsFound !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Download Section */}
      <div className="border border-border rounded-lg p-6 text-center">
        <p className="text-sm font-medium text-card-foreground">calendar_events.ics</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {eventsFound} event{eventsFound !== 1 ? 's' : ''}
        </p>
        <button
          onClick={handleDownload}
          className="px-6 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
        >
          Download
        </button>
      </div>

      {/* Extracted Text Preview */}
      {extractedText && (
        <div className="border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-card-foreground mb-3 text-center">Extracted Details</p>
          <div className="bg-muted rounded p-4 max-h-64 overflow-y-auto">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono text-left">{extractedText}</pre>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Process another image
        </button>
      </div>

      {/* Instructions */}
      <div className="border-t border-border pt-6 text-center">
        <p className="text-sm text-muted-foreground mb-4">Import to your calendar:</p>
        <div className="text-sm text-muted-foreground space-y-2">
          <p><span className="text-foreground">Google Calendar:</span> Settings → Import & Export → Import</p>
          <p><span className="text-foreground">Apple Calendar:</span> Double-click the .ics file</p>
          <p><span className="text-foreground">Outlook:</span> File → Open & Export → Import</p>
        </div>
      </div>
    </div>
  );
};

export default DownloadSection;
