import React from 'react';

const ProcessingStatus: React.FC = () => {
  return (
    <div className="border border-border rounded-lg p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-muted-foreground"></div>
        <div>
          <p className="text-sm text-muted-foreground">Processing image...</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
