import React from 'react';

const ProcessingStatus: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Processing Image...</h3>
          <p className="text-gray-500">Analyzing image with Claude and generating calendar events</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Extracting text from image
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
          Identifying calendar events
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
          Generating ICS file
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
